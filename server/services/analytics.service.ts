/**
 * Analytics and Reporting Service
 * Provides statistics and reports for users, advertisers, and admins
 * NOTE: Many columns (taskValue, userCommission, advertiserId, rating, isActive, etc.) are not
 * in the Drizzle schema.ts but ARE in the actual MySQL database. Raw SQL is used for these.
 */

import { getDb } from '../db';
import { users, advertisers, tasks, userTasks, transactions } from '../../drizzle/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

/**
 * Get user dashboard statistics
 */
export async function getUserDashboardStats(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get user info
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || user.length === 0) {
    throw new Error('User not found');
  }

  // Get task statistics using raw SQL for missing columns
  const taskStatsRows = await db.execute(sql`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status IN ('in_progress', 'pending') THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
    FROM userTasks WHERE userId = ${userId}
  `) as any;
  const taskStats = taskStatsRows[0]?.[0] ?? {};

  // Get earnings statistics
  const earningsRows = await db.execute(sql`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'earning' AND status = 'completed' THEN amount ELSE 0 END), 0) as totalEarnings,
      COALESCE(SUM(CASE WHEN type = 'withdrawal' AND status = 'completed' THEN amount ELSE 0 END), 0) as totalWithdrawals
    FROM transactions WHERE userId = ${userId}
  `) as any;
  const earningsStats = earningsRows[0]?.[0] ?? {};

  return {
    user: {
      id: user[0].id,
      name: user[0].name,
      tier: (user[0] as any).tier,
      balance: user[0].balance,
      isVerified: user[0].isVerified,
    },
    tasks: {
      total: taskStats.total || 0,
      completed: taskStats.completed || 0,
      pending: taskStats.pending || 0,
      rejected: taskStats.rejected || 0,
      averageRating: 0,
    },
    earnings: {
      totalEarnings: earningsStats.totalEarnings || 0,
      totalWithdrawals: earningsStats.totalWithdrawals || 0,
      pendingEarnings: 0,
      currentBalance: user[0].balance || 0,
    },
  };
}

/**
 * Get advertiser dashboard statistics
 */
export async function getAdvertiserDashboardStats(advertiserId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get advertiser info
  const advertiser = await db.select().from(advertisers).where(eq(advertisers.id, advertiserId)).limit(1);
  if (!advertiser || advertiser.length === 0) {
    throw new Error('Advertiser not found');
  }

  // Get task statistics
  const taskStatsRows = await db.execute(sql`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'paused' THEN 1 ELSE 0 END) as paused
    FROM tasks WHERE advertiserId = ${advertiserId}
  `) as any;
  const taskStats = taskStatsRows[0]?.[0] ?? {};

  // Get user task statistics
  const userTaskStatsRows = await db.execute(sql`
    SELECT
      COUNT(*) as totalAssignments,
      SUM(CASE WHEN ut.status = 'completed' THEN 1 ELSE 0 END) as completedAssignments,
      SUM(CASE WHEN ut.status = 'in_progress' THEN 1 ELSE 0 END) as pendingReview
    FROM userTasks ut
    INNER JOIN tasks t ON ut.taskId = t.id
    WHERE t.advertiserId = ${advertiserId}
  `) as any;
  const userTaskStats = userTaskStatsRows[0]?.[0] ?? {};

  return {
    advertiser: {
      id: advertiser[0].id,
      name: advertiser[0].nameEn,
      tier: (advertiser[0] as any).tier,
      isVerified: advertiser[0].verified,
    },
    tasks: {
      total: taskStats.total || 0,
      active: taskStats.active || 0,
      completed: taskStats.completed || 0,
      paused: taskStats.paused || 0,
    },
    assignments: {
      total: userTaskStats.totalAssignments || 0,
      completed: userTaskStats.completedAssignments || 0,
      pendingReview: userTaskStats.pendingReview || 0,
      averageRating: 0,
    },
    spending: {
      totalSpent: 0,
      thisMonth: 0,
    },
  };
}

/**
 * Get admin dashboard statistics
 */
export async function getAdminDashboardStats() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get user statistics — isActive not in Drizzle schema so use raw SQL
  const userStatsRows = await db.execute(sql`
    SELECT COUNT(*) as total,
      SUM(CASE WHEN isVerified = 1 THEN 1 ELSE 0 END) as verified
    FROM users
  `) as any;
  const userStats = userStatsRows[0]?.[0] ?? {};

  // Get advertiser statistics
  const advertiserStatsRows = await db.execute(sql`
    SELECT COUNT(*) as total,
      SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN verified = 1 THEN 1 ELSE 0 END) as verified
    FROM advertisers
  `) as any;
  const advertiserStats = advertiserStatsRows[0]?.[0] ?? {};

  // Get task statistics
  const taskStats = await db
    .select({
      total: sql<number>`COUNT(*)`,
      active: sql<number>`SUM(CASE WHEN ${tasks.status} = 'active' THEN 1 ELSE 0 END)`,
      completed: sql<number>`SUM(CASE WHEN ${tasks.status} = 'completed' THEN 1 ELSE 0 END)`,
    })
    .from(tasks);

  // Get user task statistics
  const userTaskStats = await db
    .select({
      total: sql<number>`COUNT(*)`,
      completed: sql<number>`SUM(CASE WHEN ${userTasks.status} = 'completed' THEN 1 ELSE 0 END)`,
      pending: sql<number>`SUM(CASE WHEN ${userTasks.status} IN ('in_progress', 'pending') THEN 1 ELSE 0 END)`,
    })
    .from(userTasks);

  // Get pending withdrawals
  const pendingWithdrawals = await db
    .select({
      count: sql<number>`COUNT(*)`,
      amount: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(and(eq(transactions.type, 'withdrawal'), eq(transactions.status, 'pending')));

  return {
    users: {
      total: userStats.total || 0,
      active: userStats.total || 0, // isActive not tracked in schema
      verified: userStats.verified || 0,
    },
    advertisers: {
      total: advertiserStats.total || 0,
      active: advertiserStats.active || 0,
      verified: advertiserStats.verified || 0,
    },
    tasks: {
      total: taskStats[0]?.total || 0,
      active: taskStats[0]?.active || 0,
      completed: taskStats[0]?.completed || 0,
    },
    userTasks: {
      total: userTaskStats[0]?.total || 0,
      completed: userTaskStats[0]?.completed || 0,
      pending: userTaskStats[0]?.pending || 0,
    },
    financial: {
      totalGMV: 0,
      totalRevenue: 0,
      thisMonthGMV: 0,
      thisMonthRevenue: 0,
    },
    withdrawals: {
      pendingCount: pendingWithdrawals[0]?.count || 0,
      pendingAmount: pendingWithdrawals[0]?.amount || 0,
    },
  };
}

/**
 * Get task performance report
 */
export async function getTaskPerformanceReport(taskId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get task info
  const task = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  if (!task || task.length === 0) {
    throw new Error('Task not found');
  }

  // Get assignment statistics using raw SQL for missing columns
  const statsRows = await db.execute(sql`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status IN ('in_progress', 'pending') THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
    FROM userTasks WHERE taskId = ${taskId}
  `) as any;
  const stats = statsRows[0]?.[0] ?? {};

  return {
    task: task[0],
    statistics: {
      totalAssignments: stats.total || 0,
      completed: stats.completed || 0,
      pending: stats.pending || 0,
      submitted: 0,
      rejected: stats.rejected || 0,
      averageRating: 0,
      averageCompletionTime: 0,
      completionRate: stats.total ? ((stats.completed || 0) / stats.total) * 100 : 0,
    },
  };
}

/**
 * Get revenue report for a date range
 */
export async function getRevenueReport(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Use transactions table since userTasks doesn't have financial columns in schema
  const revenueRows = await db.execute(sql`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'earning' AND status = 'completed' THEN amount ELSE 0 END), 0) as totalGMV,
      0 as totalUserCommission,
      0 as totalAdvertiserCommission,
      0 as totalRevenue,
      COUNT(*) as taskCount
    FROM transactions
    WHERE createdAt >= ${startDate} AND createdAt <= ${endDate}
  `) as any;
  const report = revenueRows[0]?.[0];

  return report || {
    totalGMV: 0,
    totalUserCommission: 0,
    totalAdvertiserCommission: 0,
    totalRevenue: 0,
    taskCount: 0,
  };
}
