/**
 * Tier Management Service
 * Based on the TaskKash Constitution (Tiers_Vs_Commission.docx)
 * 
 * USER TIER PROGRESSION:
 * - vip → prestige: Complete 5 tasks (any difficulty)
 * - prestige → elite:  Complete 15 tasks with >90% approval rate
 * 
 * CONSTITUTION RULE: Payout commission is based on withdrawal SPEED, not user tier.
 */

import { USER_TIERS, ADVERTISER_TIERS, BUSINESS_CONSTANTS, isTaskRewardAllowed } from '../config/business.config';
import { getDb } from '../db';
import { users, advertisers, userTasks, transactions } from '../../drizzle/schema';
import { eq, and, gte, lte, sql, lt } from 'drizzle-orm';

// ─────────────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────────────
export type UserTier = 'vip' | 'prestige' | 'elite';
export type AdvertiserTier = 'starter' | 'growth' | 'precision' | 'enterprise';

// ─────────────────────────────────────────────
// USER TIER LOGIC
// ─────────────────────────────────────────────

/**
 * Check if a user is eligible for a tier upgrade.
 * Returns the next tier they qualify for, or null if no upgrade is available.
 */
export async function checkUserTierEligibility(userId: number): Promise<UserTier | null> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!userRows || userRows.length === 0) return null;

  const user = userRows[0];
  const currentTier = user.tier as UserTier;

  const stats = await getUserTaskStats(userId);

  // Check in order from highest to lowest tier to allow multi-level jumps
  if (currentTier !== 'elite') {
    const isEligibleElite = (
      stats.tasksCompletedAsContributor >= 15 &&
      stats.approvalRate >= BUSINESS_CONSTANTS.LEVEL3_MIN_APPROVAL_RATE &&
      (user as any).isPhoneVerified === 1 &&
      user.kycStatus === 'verified'  // Must have National ID / biometric verified
    );
    if (isEligibleElite) return 'elite';
  }

  if (currentTier === 'vip') {
    const isEligibleContributor = (
      stats.tasksCompletedAsNovice >= 5 &&
      (user as any).isPhoneVerified === 1  // Must have SMS verified phone
    );
    if (isEligibleContributor) return 'prestige';
  }

  return null; // No upgrade available
}

/**
 * Downgrade a user from elite → prestige due to inactivity.
 * Called by the daily cron job per Constitution Gap 8.
 */
export async function checkUserForInactivityDowngrade(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!userRows || userRows.length === 0) return false;

  const user = userRows[0];
  if ((user.tier as string) !== 'elite') return false; // Only check elite users

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - BUSINESS_CONSTANTS.ELITE_INACTIVITY_DOWNGRADE_DAYS);

  // Check if user has had ANY completed task after the cutoff date
  const recentTasks = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(userTasks)
    .where(
      and(
        eq(userTasks.userId, userId),
        eq(userTasks.status, 'completed'),
        gte(userTasks.completedAt, cutoffDate)
      )
    );

  const hasRecentActivity = (recentTasks[0]?.count || 0) > 0;
  if (!hasRecentActivity) {
    // Downgrade from elite → prestige
    await db.execute(sql`UPDATE users SET tier = 'prestige', updatedAt = NOW() WHERE id = ${userId}`);
    console.log(`⬇️ [TIER] User ${userId} downgraded elite → prestige due to ${BUSINESS_CONSTANTS.ELITE_INACTIVITY_DOWNGRADE_DAYS} days inactivity.`);
    return true;
  }

  return false;
}

/**
 * Get task statistics for a user, broken down by the tier they were in when they completed tasks.
 */
async function getUserTaskStats(userId: number): Promise<{
  tasksCompletedAsNovice: number;
  tasksCompletedAsContributor: number;
  totalCompleted: number;
  approvalRate: number;
}> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const allCompleted = await db
    .select({ id: userTasks.id, status: userTasks.status })
    .from(userTasks)
    .where(and(eq(userTasks.userId, userId), eq(userTasks.status, 'completed')));

  const allTasks = await db
    .select({ id: userTasks.id, status: userTasks.status })
    .from(userTasks)
    .where(eq(userTasks.userId, userId));

  const totalCompleted = allCompleted.length;
  const rejectedCount = allTasks.filter(t => t.status === 'rejected').length;
  const approvalRate = totalCompleted > 0
    ? totalCompleted / (totalCompleted + rejectedCount)
    : 0;

  // We use total completed for simplicity;
  // A more sophisticated system would track tier-at-time-of-completion
  const tasksCompletedAsNovice = Math.min(totalCompleted, 5);
  const tasksCompletedAsContributor = Math.max(0, totalCompleted - 5);

  return {
    tasksCompletedAsNovice,
    tasksCompletedAsContributor,
    totalCompleted,
    approvalRate,
  };
}

/**
 * Upgrade a user to a new tier in the database.
 */
export async function upgradeUserTier(userId: number, newTier: UserTier): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    await db.execute(sql`UPDATE users SET tier = ${newTier}, updatedAt = NOW() WHERE id = ${userId}`);
    console.log(`⬆️ [TIER] User ${userId} upgraded to ${newTier}`);
    return true;
  } catch (error) {
    console.error('Error upgrading user tier:', error);
    return false;
  }
}

/**
 * Check if a task reward is allowed for a given user tier.
 * Constitution Gap 4: Level 1 Novice capped at 50 EGP per task.
 */
export function canUserAccessTask(userTier: string, taskRewardEGP: number): boolean {
  return isTaskRewardAllowed(userTier, taskRewardEGP);
}

/**
 * Get tier display info (for frontend UI)
 */
export function getTierInfo(tier: string) {
  const userTier = USER_TIERS[tier];
  if (!userTier) return USER_TIERS.vip;

  const labels: Record<string, { nameEn: string; nameAr: string; icon: string }> = {
    vip: { nameEn: 'VIP', nameAr: 'في آي بي', icon: '🥉' },
    prestige: { nameEn: 'Prestige', nameAr: 'برستيج', icon: '🥈' },
    elite: { nameEn: 'Elite Field Agent', nameAr: 'عميل نخبة', icon: '🥇' },
  };

  return { ...userTier, ...labels[tier] };
}

// ─────────────────────────────────────────────
// ADVERTISER TIER LOGIC
// ─────────────────────────────────────────────

/**
 * Check advertiser tier eligibility based on total monthly spend (EGP).
 */
export async function checkAdvertiserTierEligibility(advertiserId: number): Promise<AdvertiserTier | null> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const advertiserRows = await db.select().from(advertisers).where(eq(advertisers.id, advertiserId)).limit(1);
  if (!advertiserRows || advertiserRows.length === 0) return null;

  const currentTier = (advertiserRows[0] as any).tier as string;
  const monthlySpend = await getAdvertiserMonthlySpend(advertiserId);

  if (currentTier !== 'enterprise' && monthlySpend >= ADVERTISER_TIERS.enterprise.minMonthlySpend) return 'enterprise';
  if (currentTier !== 'precision' && monthlySpend >= ADVERTISER_TIERS.precision.minMonthlySpend) return 'precision';
  if (currentTier !== 'growth' && monthlySpend >= ADVERTISER_TIERS.growth.minMonthlySpend) return 'growth';

  return null;
}

/**
 * Get total spend for an advertiser in the current calendar month (EGP).
 */
async function getAdvertiserMonthlySpend(advertiserId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await db
      .select({ total: sql<number>`COALESCE(SUM(ABS(amount)), 0)` })
      .from(transactions)
      .where(
        and(
          gte(transactions.createdAt, startOfMonth),
          eq(transactions.type, 'earning')
        )
      );

    return result[0]?.total || 0;
  } catch {
    return 0;
  }
}

/**
 * Upgrade advertiser tier in the database.
 */
export async function upgradeAdvertiserTier(advertiserId: number, newTier: AdvertiserTier): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    await db.execute(sql`UPDATE advertisers SET tier = ${newTier}, updatedAt = NOW() WHERE id = ${advertiserId}`);
    console.log(`⬆️ [TIER] Advertiser ${advertiserId} upgraded to ${newTier}`);
    return true;
  } catch (error) {
    console.error('Error upgrading advertiser tier:', error);
    return false;
  }
}

/**
 * Auto-check and upgrade tiers for all users (called by cron job).
 */
export async function autoUpgradeTiers(): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const allUsers = await db.select({ id: users.id }).from(users);

  for (const user of allUsers) {
    const eligibleTier = await checkUserTierEligibility(user.id);
    if (eligibleTier) {
      await upgradeUserTier(user.id, eligibleTier);
    }
    await checkUserForInactivityDowngrade(user.id);
  }

  const allAdvertisers = await db.select({ id: advertisers.id }).from(advertisers);
  for (const advertiser of allAdvertisers) {
    const eligibleTier = await checkAdvertiserTierEligibility(advertiser.id);
    if (eligibleTier) {
      await upgradeAdvertiserTier(advertiser.id, eligibleTier);
    }
  }
}
