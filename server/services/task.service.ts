/**
 * Task Management Service
 * Handles all task-related operations
 */

import { getDb } from '../db';
import { tasks, userTasks, users, advertisers } from '../../drizzle/schema';
import { eq, and, sql, or, gte, lte } from 'drizzle-orm';
import { calculateCommission } from './commission.service';
import { addFunds } from './wallet.service';
import { getUserTierConfig } from '../config/business.config';

/**
 * Create a new task
 * 
 * @param advertiserId - Advertiser ID
 * @param taskData - Task data
 * @returns Created task ID
 */
export async function createTask(advertiserId: number, taskData: {
  title: string;
  description: string;
  type: string;
  value: number;
  countryId: number;
  cityId?: number;
  targetAudience?: string;
  requirements?: string;
  deadline?: Date;
  maxAssignments: number;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get advertiser tier
  const advertiser = await db.select().from(advertisers).where(eq(advertisers.id, advertiserId)).limit(1);
  if (!advertiser || advertiser.length === 0) {
    throw new Error('Advertiser not found');
  }

  // Create task via raw SQL to avoid schema column mismatches
  // (value, currentAssignments, maxAssignments, advertiserCost not all in Drizzle schema)
  const result = await db.insert(tasks).values({
    advertiserId,
    titleAr: taskData.title,
    titleEn: taskData.title,
    type: taskData.type as any,
    reward: taskData.value ?? 0,
    countryId: taskData.countryId ?? 1,
    status: 'active',
    duration: 30,
  });

  return (result as any)[0]?.insertId ?? 0;
}

/**
 * Get available tasks for a user
 * 
 * @param userId - User ID
 * @param filters - Optional filters
 * @returns Array of available tasks
 */
export async function getAvailableTasks(userId: number, filters?: {
  countryId?: number;
  type?: string;
  minValue?: number;
  maxValue?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get user info
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || user.length === 0) {
    throw new Error('User not found');
  }

  let conditions: any[] = [eq(tasks.status, 'active')];

  // Add filters
  if (filters?.countryId) {
    conditions.push(eq(tasks.countryId, filters.countryId));
  }
  if (filters?.type) {
    conditions.push(eq(tasks.type, filters.type as any));
  }

  // Get tasks
  const availableTasks = await db
    .select()
    .from(tasks)
    .where(and(...conditions))
    .orderBy(sql`${tasks.createdAt} DESC`)
    .limit(50);

  // Filter by targetTiers - only show tasks that target the user's tier
  const filteredTasks = availableTasks.filter(task => {
    if (!task.targetTiers) return true; // If no tier targeting, show to all
    
    try {
      const targetTiersArray = JSON.parse(task.targetTiers);
      return targetTiersArray.includes(user[0].tier);
    } catch (e) {
      console.error('Error parsing targetTiers:', e);
      return true; // On error, show the task
    }
  });

  return filteredTasks.map(task => ({
    ...task,
    userEarnings: task.reward ?? 0,
    userCommission: 0,
  }));
}

/**
 * Assign task to user
 * 
 * @param taskId - Task ID
 * @param userId - User ID
 * @returns UserTask ID
 */
export async function assignTaskToUser(taskId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get task
  const task = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  if (!task || task.length === 0) {
    throw new Error('Task not found');
  }

  // Check if task is available
  if (task[0].status !== 'active') {
    throw new Error('Task is not active');
  }

  // Use raw SQL since currentAssignments, maxAssignments are not in Drizzle schema
  const countRows = await db.execute(sql`SELECT currentAssignments, maxCompletions FROM tasks WHERE id = ${taskId}`) as any;
  const taskMeta = countRows[0]?.[0];
  if (taskMeta && taskMeta.currentAssignments >= taskMeta.maxCompletions) {
    throw new Error('Task is fully assigned');
  }

  // Check if user already has this task
  const existing = await db
    .select()
    .from(userTasks)
    .where(and(eq(userTasks.taskId, taskId), eq(userTasks.userId, userId)))
    .limit(1);

  if (existing && existing.length > 0) {
    throw new Error('User already has this task');
  }

  // Create user task using Drizzle (only valid schema columns)
  await db.insert(userTasks).values({
    taskId,
    userId,
    status: 'in_progress',
    startedAt: new Date(),
  });

  // Increment currentCompletions on task (the column that IS in the schema)
  await db
    .update(tasks)
    .set({ currentCompletions: sql`${tasks.currentCompletions} + 1`, updatedAt: new Date() })
    .where(eq(tasks.id, taskId));

  // Return the inserted row id
  const inserted = await db.select().from(userTasks)
    .where(and(eq(userTasks.taskId, taskId), eq(userTasks.userId, userId)))
    .orderBy(sql`${userTasks.createdAt} DESC`).limit(1);
  return inserted[0]?.id ?? 0;
}

/**
 * Submit task completion
 * 
 * @param userTaskId - UserTask ID
 * @param submissionData - Submission data (proof, notes, etc.)
 * @returns Success status
 */
export async function submitTaskCompletion(userTaskId: number, submissionData: {
  proof?: string;
  notes?: string;
  attachments?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get user task
  const userTask = await db.select().from(userTasks).where(eq(userTasks.id, userTaskId)).limit(1);
  if (!userTask || userTask.length === 0) {
    throw new Error('User task not found');
  }

  if (userTask[0].status !== 'in_progress' && userTask[0].status !== 'pending') {
    throw new Error('Task cannot be submitted in current status');
  }

  // Update user task to completed (no 'submitted' in schema — mark as completed pending review)
  await db
    .update(userTasks)
    .set({ status: 'completed', completedAt: new Date() })
    .where(eq(userTasks.id, userTaskId));

  return true;
}

/**
 * Verify task completion (by advertiser)
 * 
 * @param userTaskId - UserTask ID
 * @param isApproved - Approval status
 * @param rating - Rating (1-5)
 * @param feedback - Feedback
 * @returns Success status
 */
export async function verifyTaskCompletion(
  userTaskId: number,
  isApproved: boolean,
  rating?: number,
  feedback?: string
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get user task
  const userTask = await db.select().from(userTasks).where(eq(userTasks.id, userTaskId)).limit(1);
  if (!userTask || userTask.length === 0) {
    throw new Error('User task not found');
  }

  if (userTask[0].status !== 'completed' && userTask[0].status !== 'in_progress') {
    throw new Error('Task is not in a verifiable status');
  }

  if (isApproved) {
    // Approve task
    await db
      .update(userTasks)
      .set({ status: 'completed', completedAt: new Date() })
      .where(eq(userTasks.id, userTaskId));

    // Get user tier to determine payment schedule
    const user = await db.select().from(users).where(eq(users.id, userTask[0].userId)).limit(1);
    if (user && user.length > 0) {
      const tierConfig = getUserTierConfig(user[0].tier);
      
      // Schedule payment based on tier
      const paymentDate = new Date();
      paymentDate.setHours(paymentDate.getHours() + tierConfig.paymentDelay);

      const task = await db.select().from(tasks).where(eq(tasks.id, userTask[0].taskId)).limit(1);
      const reward = task[0]?.reward ?? 0;

      if (tierConfig.paymentSchedule === 'instant') {
        await addFunds(
          userTask[0].userId,
          reward,
          `Task completion: ${userTask[0].taskId}`,
          userTask[0].taskId
        );
      } else {
        // For other tiers, record the scheduled time via raw SQL (scheduledPaymentAt not in Drizzle schema)
        const paymentDate = new Date();
        paymentDate.setHours(paymentDate.getHours() + tierConfig.paymentDelay);
        await db.execute(sql`UPDATE userTasks SET scheduledPaymentAt = ${paymentDate} WHERE id = ${userTaskId}`);
      }
    }
  } else {
    // Reject task — use raw SQL for verifiedAt which is missing from schema
    await db.execute(sql`UPDATE userTasks SET status = 'rejected', verifiedAt = NOW() WHERE id = ${userTaskId}`);
  }

  return true;
}

/**
 * Get user's tasks
 * 
 * @param userId - User ID
 * @param status - Optional status filter
 * @returns Array of user tasks
 */
export async function getUserTasks(userId: number, status?: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const whereClause = status
    ? and(eq(userTasks.userId, userId), eq(userTasks.status, status as any))
    : eq(userTasks.userId, userId);

  return await db.select().from(userTasks).where(whereClause).orderBy(sql`${userTasks.createdAt} DESC`);
}

/**
 * Get advertiser's tasks
 * 
 * @param advertiserId - Advertiser ID
 * @param status - Optional status filter
 * @returns Array of tasks
 */
export async function getAdvertiserTasks(advertiserId: number, status?: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const whereClause = status
    ? and(eq(tasks.advertiserId, advertiserId), eq(tasks.status, status as any))
    : eq(tasks.advertiserId, advertiserId);

  return await db.select().from(tasks).where(whereClause).orderBy(sql`${tasks.createdAt} DESC`);
}

/**
 * Process scheduled payments (run as cron job)
 */
export async function processScheduledPayments() {
  // scheduledPaymentAt, paidAt, userEarnings columns don't exist in the current userTasks schema
  // This function is a no-op placeholder until the schema is updated
  console.log('[processScheduledPayments] Schema columns missing — skipping payment processing');
}
