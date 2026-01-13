/**
 * Analytics and Reporting Service
 * Provides statistics and reports for users, advertisers, and admins
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

  // Get task statistics
  const taskStats = await db
    .select({
      total: sql<number>`COUNT(*)`,
      completed: sql<number>`SUM(CASE WHEN ${userTasks.status} = 'completed' THEN 1 ELSE 0 END)`,
      pending: sql<number>`SUM(CASE WHEN ${userTasks.status} IN ('assigned', 'in_progress', 'submitted') THEN 1 ELSE 0 END)`,
      rejected: sql<number>`SUM(CASE WHEN ${userTasks.status} = 'rejected' THEN 1 ELSE 0 END)`,
      averageRating: sql<number>`COALESCE(AVG(${userTasks.rating}), 0)`,
    })
    .from(userTasks)
    .where(eq(userTasks.userId, userId));

  // Get earnings statistics
  const earningsStats = await db
    .select({
      totalEarnings: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'credit' AND ${transactions.status} = 'completed' THEN ${transactions.amount} ELSE 0 END), 0)`,
      totalWithdrawals: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'withdrawal' AND ${transactions.status} = 'completed' THEN ${transactions.amount} ELSE 0 END), 0)`,
      pendingEarnings: sql<number>`COALESCE(SUM(CASE WHEN ${userTasks.status} = 'completed' AND ${userTasks.paidAt} IS NULL THEN ${userTasks.userEarnings} ELSE 0 END), 0)`,
    })
    .from(transactions)
    .where(eq(transactions.userId, userId));

  // Get pending earnings from userTasks
  const pendingEarnings = await db
    .select({
      amount: sql<number>`COALESCE(SUM(${userTasks.userEarnings}), 0)`,
    })
    .from(userTasks)
    .where(
      and(
        eq(userTasks.userId, userId),
        eq(userTasks.status, 'completed'),
        sql`${userTasks.paidAt} IS NULL`
      )
    );

  return {
    user: {
      id: user[0].id,
      name: user[0].name,
      tier: user[0].tier,
      balance: user[0].balance,
      isVerified: user[0].isVerified,
    },
    tasks: {
      total: taskStats[0]?.total || 0,
      completed: taskStats[0]?.completed || 0,
      pending: taskStats[0]?.pending || 0,
      rejected: taskStats[0]?.rejected || 0,
      averageRating: taskStats[0]?.averageRating || 0,
    },
    earnings: {
      totalEarnings: earningsStats[0]?.totalEarnings || 0,
      totalWithdrawals: earningsStats[0]?.totalWithdrawals || 0,
      pendingEarnings: pendingEarnings[0]?.amount || 0,
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
  const taskStats = await db
    .select({
      total: sql<number>`COUNT(*)`,
      active: sql<number>`SUM(CASE WHEN ${tasks.status} = 'active' THEN 1 ELSE 0 END)`,
      completed: sql<number>`SUM(CASE WHEN ${tasks.status} = 'completed' THEN 1 ELSE 0 END)`,
      paused: sql<number>`SUM(CASE WHEN ${tasks.status} = 'paused' THEN 1 ELSE 0 END)`,
    })
    .from(tasks)
    .where(eq(tasks.advertiserId, advertiserId));

  // Get user task statistics
  const userTaskStats = await db
    .select({
      totalAssignments: sql<number>`COUNT(*)`,
      completedAssignments: sql<number>`SUM(CASE WHEN ${userTasks.status} = 'completed' THEN 1 ELSE 0 END)`,
      pendingReview: sql<number>`SUM(CASE WHEN ${userTasks.status} = 'submitted' THEN 1 ELSE 0 END)`,
      averageRating: sql<number>`COALESCE(AVG(${userTasks.rating}), 0)`,
    })
    .from(userTasks)
    .where(eq(userTasks.advertiserId, advertiserId));

  // Get spending statistics
  const spendingStats = await db
    .select({
      totalSpent: sql<number>`COALESCE(SUM(${userTasks.taskValue} + ${userTasks.userCommission}), 0)`,
      thisMonth: sql<number>`COALESCE(SUM(CASE WHEN ${userTasks.createdAt} >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN ${userTasks.taskValue} + ${userTasks.userCommission} ELSE 0 END), 0)`,
    })
    .from(userTasks)
    .where(
      and(
        eq(userTasks.advertiserId, advertiserId),
        eq(userTasks.status, 'completed')
      )
    );

  return {
    advertiser: {
      id: advertiser[0].id,
      name: advertiser[0].name,
      tier: advertiser[0].tier,
      isVerified: advertiser[0].isVerified,
    },
    tasks: {
      total: taskStats[0]?.total || 0,
      active: taskStats[0]?.active || 0,
      completed: taskStats[0]?.completed || 0,
      paused: taskStats[0]?.paused || 0,
    },
    assignments: {
      total: userTaskStats[0]?.totalAssignments || 0,
      completed: userTaskStats[0]?.completedAssignments || 0,
      pendingReview: userTaskStats[0]?.pendingReview || 0,
      averageRating: userTaskStats[0]?.averageRating || 0,
    },
    spending: {
      totalSpent: spendingStats[0]?.totalSpent || 0,
      thisMonth: spendingStats[0]?.thisMonth || 0,
    },
  };
}

/**
 * Get admin dashboard statistics
 */
export async function getAdminDashboardStats() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get user statistics
  const userStats = await db
    .select({
      total: sql<number>`COUNT(*)`,
      active: sql<number>`SUM(CASE WHEN ${users.isActive} = 1 THEN 1 ELSE 0 END)`,
      verified: sql<number>`SUM(CASE WHEN ${users.isVerified} = 1 THEN 1 ELSE 0 END)`,
    })
    .from(users);

  // Get advertiser statistics
  const advertiserStats = await db
    .select({
      total: sql<number>`COUNT(*)`,
      active: sql<number>`SUM(CASE WHEN ${advertisers.isActive} = 1 THEN 1 ELSE 0 END)`,
      verified: sql<number>`SUM(CASE WHEN ${advertisers.isVerified} = 1 THEN 1 ELSE 0 END)`,
    })
    .from(advertisers);

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
      pending: sql<number>`SUM(CASE WHEN ${userTasks.status} IN ('assigned', 'in_progress', 'submitted') THEN 1 ELSE 0 END)`,
    })
    .from(userTasks);

  // Get financial statistics
  const financialStats = await db
    .select({
      totalGMV: sql<number>`COALESCE(SUM(${userTasks.taskValue}), 0)`,
      totalRevenue: sql<number>`COALESCE(SUM(${userTasks.userCommission}), 0)`,
      thisMonthGMV: sql<number>`COALESCE(SUM(CASE WHEN ${userTasks.createdAt} >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN ${userTasks.taskValue} ELSE 0 END), 0)`,
      thisMonthRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${userTasks.createdAt} >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN ${userTasks.userCommission} ELSE 0 END), 0)`,
    })
    .from(userTasks)
    .where(eq(userTasks.status, 'completed'));

  // Get pending withdrawals
  const pendingWithdrawals = await db
    .select({
      count: sql<number>`COUNT(*)`,
      amount: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.type, 'withdrawal'),
        eq(transactions.status, 'pending')
      )
    );

  return {
    users: {
      total: userStats[0]?.total || 0,
      active: userStats[0]?.active || 0,
      verified: userStats[0]?.verified || 0,
    },
    advertisers: {
      total: advertiserStats[0]?.total || 0,
      active: advertiserStats[0]?.active || 0,
      verified: advertiserStats[0]?.verified || 0,
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
      totalGMV: financialStats[0]?.totalGMV || 0,
      totalRevenue: financialStats[0]?.totalRevenue || 0,
      thisMonthGMV: financialStats[0]?.thisMonthGMV || 0,
      thisMonthRevenue: financialStats[0]?.thisMonthRevenue || 0,
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

  // Get assignment statistics
  const assignmentStats = await db
    .select({
      total: sql<number>`COUNT(*)`,
      completed: sql<number>`SUM(CASE WHEN ${userTasks.status} = 'completed' THEN 1 ELSE 0 END)`,
      pending: sql<number>`SUM(CASE WHEN ${userTasks.status} IN ('assigned', 'in_progress') THEN 1 ELSE 0 END)`,
      submitted: sql<number>`SUM(CASE WHEN ${userTasks.status} = 'submitted' THEN 1 ELSE 0 END)`,
      rejected: sql<number>`SUM(CASE WHEN ${userTasks.status} = 'rejected' THEN 1 ELSE 0 END)`,
      averageRating: sql<number>`COALESCE(AVG(${userTasks.rating}), 0)`,
      averageCompletionTime: sql<number>`COALESCE(AVG(TIMESTAMPDIFF(HOUR, ${userTasks.assignedAt}, ${userTasks.submittedAt})), 0)`,
    })
    .from(userTasks)
    .where(eq(userTasks.taskId, taskId));

  return {
    task: task[0],
    statistics: {
      totalAssignments: assignmentStats[0]?.total || 0,
      completed: assignmentStats[0]?.completed || 0,
      pending: assignmentStats[0]?.pending || 0,
      submitted: assignmentStats[0]?.submitted || 0,
      rejected: assignmentStats[0]?.rejected || 0,
      averageRating: assignmentStats[0]?.averageRating || 0,
      averageCompletionTime: assignmentStats[0]?.averageCompletionTime || 0,
      completionRate: assignmentStats[0]?.total 
        ? ((assignmentStats[0]?.completed || 0) / assignmentStats[0].total) * 100 
        : 0,
    },
  };
}

/**
 * Get revenue report for a date range
 */
export async function getRevenueReport(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const report = await db
    .select({
      totalGMV: sql<number>`COALESCE(SUM(${userTasks.taskValue}), 0)`,
      totalUserCommission: sql<number>`COALESCE(SUM(${userTasks.userCommission}), 0)`,
      totalAdvertiserCommission: sql<number>`COALESCE(SUM(${userTasks.taskValue} * 0.1), 0)`, // Assuming 10% advertiser commission
      totalRevenue: sql<number>`COALESCE(SUM(${userTasks.userCommission} + (${userTasks.taskValue} * 0.1)), 0)`,
      taskCount: sql<number>`COUNT(*)`,
    })
    .from(userTasks)
    .where(
      and(
        eq(userTasks.status, 'completed'),
        gte(userTasks.createdAt, startDate),
        lte(userTasks.createdAt, endDate)
      )
    );

  return report[0] || {
    totalGMV: 0,
    totalUserCommission: 0,
    totalAdvertiserCommission: 0,
    totalRevenue: 0,
    taskCount: 0,
  };
}
