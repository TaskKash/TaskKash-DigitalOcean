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

  // Calculate commission
  const commission = calculateCommission(taskData.value, 'tier1', advertiser[0].tier);

  // Create task
  const result = await db.insert(tasks).values({
    advertiserId,
    title: taskData.title,
    description: taskData.description,
    type: taskData.type,
    value: taskData.value,
    advertiserCost: commission.advertiserCost,
    countryId: taskData.countryId,
    cityId: taskData.cityId,
    targetAudience: taskData.targetAudience,
    requirements: taskData.requirements,
    deadline: taskData.deadline,
    maxAssignments: taskData.maxAssignments,
    currentAssignments: 0,
    status: 'active',
    createdAt: new Date(),
  });

  return result.insertId;
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

  // Build query
  let conditions = [
    eq(tasks.status, 'active'),
    sql`${tasks.currentAssignments} < ${tasks.maxAssignments}`,
  ];

  // Add filters
  if (filters?.countryId) {
    conditions.push(eq(tasks.countryId, filters.countryId));
  }
  if (filters?.type) {
    conditions.push(eq(tasks.type, filters.type));
  }
  if (filters?.minValue) {
    conditions.push(gte(tasks.value, filters.minValue));
  }
  if (filters?.maxValue) {
    conditions.push(lte(tasks.value, filters.maxValue));
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

  // Calculate user earnings for each task
  return filteredTasks.map(task => {
    const commission = calculateCommission(task.value, user[0].tier);
    return {
      ...task,
      userEarnings: commission.userEarnings,
      userCommission: commission.userCommission,
    };
  });
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

  if (task[0].currentAssignments >= task[0].maxAssignments) {
    throw new Error('Task is fully assigned');
  }

  // Check if user already has this task
  const existing = await db
    .select()
    .from(userTasks)
    .where(
      and(
        eq(userTasks.taskId, taskId),
        eq(userTasks.userId, userId),
        or(
          eq(userTasks.status, 'assigned'),
          eq(userTasks.status, 'in_progress'),
          eq(userTasks.status, 'submitted')
        )
      )
    )
    .limit(1);

  if (existing && existing.length > 0) {
    throw new Error('User already has this task');
  }

  // Get user tier
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || user.length === 0) {
    throw new Error('User not found');
  }

  // Calculate commission
  const commission = calculateCommission(task[0].value, user[0].tier, task[0].advertiserId.toString());

  // Create user task
  const result = await db.insert(userTasks).values({
    taskId,
    userId,
    advertiserId: task[0].advertiserId,
    taskValue: task[0].value,
    userEarnings: commission.userEarnings,
    userCommission: commission.userCommission,
    status: 'assigned',
    assignedAt: new Date(),
    createdAt: new Date(),
  });

  // Update task current assignments
  await db
    .update(tasks)
    .set({
      currentAssignments: sql`${tasks.currentAssignments} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, taskId));

  return result.insertId;
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

  if (userTask[0].status !== 'assigned' && userTask[0].status !== 'in_progress') {
    throw new Error('Task cannot be submitted in current status');
  }

  // Update user task
  await db
    .update(userTasks)
    .set({
      status: 'submitted',
      submittedAt: new Date(),
      proof: submissionData.proof,
      notes: submissionData.notes,
      attachments: submissionData.attachments,
      updatedAt: new Date(),
    })
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

  if (userTask[0].status !== 'submitted') {
    throw new Error('Task is not in submitted status');
  }

  if (isApproved) {
    // Approve task
    await db
      .update(userTasks)
      .set({
        status: 'completed',
        verifiedAt: new Date(),
        rating,
        feedback,
        updatedAt: new Date(),
      })
      .where(eq(userTasks.id, userTaskId));

    // Get user tier to determine payment schedule
    const user = await db.select().from(users).where(eq(users.id, userTask[0].userId)).limit(1);
    if (user && user.length > 0) {
      const tierConfig = getUserTierConfig(user[0].tier);
      
      // Schedule payment based on tier
      const paymentDate = new Date();
      paymentDate.setHours(paymentDate.getHours() + tierConfig.paymentDelay);

      // For instant payment (tier3), add funds immediately
      if (tierConfig.paymentSchedule === 'instant') {
        await addFunds(
          userTask[0].userId,
          userTask[0].userEarnings,
          `Task completion: ${userTask[0].taskId}`,
          userTask[0].taskId
        );
      } else {
        // For other tiers, schedule payment
        await db
          .update(userTasks)
          .set({
            scheduledPaymentAt: paymentDate,
          })
          .where(eq(userTasks.id, userTaskId));
      }
    }
  } else {
    // Reject task
    await db
      .update(userTasks)
      .set({
        status: 'rejected',
        verifiedAt: new Date(),
        feedback,
        updatedAt: new Date(),
      })
      .where(eq(userTasks.id, userTaskId));
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

  let query = db.select().from(userTasks).where(eq(userTasks.userId, userId));

  if (status) {
    query = query.where(and(eq(userTasks.userId, userId), eq(userTasks.status, status))) as any;
  }

  return await query.orderBy(sql`${userTasks.createdAt} DESC`);
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

  let query = db.select().from(tasks).where(eq(tasks.advertiserId, advertiserId));

  if (status) {
    query = query.where(and(eq(tasks.advertiserId, advertiserId), eq(tasks.status, status))) as any;
  }

  return await query.orderBy(sql`${tasks.createdAt} DESC`);
}

/**
 * Process scheduled payments (run as cron job)
 */
export async function processScheduledPayments() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get all completed tasks with scheduled payment due
  const dueTasks = await db
    .select()
    .from(userTasks)
    .where(
      and(
        eq(userTasks.status, 'completed'),
        lte(userTasks.scheduledPaymentAt, new Date()),
        sql`${userTasks.paidAt} IS NULL`
      )
    );

  for (const task of dueTasks) {
    try {
      // Add funds to user wallet
      await addFunds(
        task.userId,
        task.userEarnings,
        `Task completion: ${task.taskId}`,
        task.taskId
      );

      // Update task as paid
      await db
        .update(userTasks)
        .set({
          paidAt: new Date(),
        })
        .where(eq(userTasks.id, task.id));

      console.log(`Paid ${task.userEarnings} to user ${task.userId} for task ${task.taskId}`);
    } catch (error) {
      console.error(`Error processing payment for task ${task.id}:`, error);
    }
  }
}
