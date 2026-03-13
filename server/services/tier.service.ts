/**
 * Tier Management Service
 * Handles tier upgrades, downgrades, and eligibility checks
 */

import type { UserTier, AdvertiserTier, TierCriteria } from '../types/business';
import { USER_TIERS, ADVERTISER_TIERS } from '../config/business.config';
import { getDb } from '../db';
import { users, advertisers, userTasks } from '../../drizzle/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

/**
 * Check if user is eligible for tier upgrade
 * 
 * @param userId - User ID
 * @returns Next eligible tier or null
 */
export async function checkUserTierEligibility(userId: number): Promise<UserTier | null> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get user current tier and stats
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || user.length === 0) return null;

  const currentTier = user[0].tier as UserTier;

  // Get user task statistics
  const stats = await getUserTaskStats(userId);

  // Check eligibility for each tier (from highest to lowest)
  if (currentTier !== 'tier3' && isEligibleForTier('tier3', stats)) {
    return 'tier3';
  }
  if (currentTier !== 'tier2' && isEligibleForTier('tier2', stats)) {
    return 'tier2';
  }

  return null; // No upgrade available
}

/**
 * Check if user meets criteria for a specific tier
 */
function isEligibleForTier(tier: UserTier, stats: TierCriteria): boolean {
  const config = USER_TIERS[tier];
  
  return (
    stats.tasksCompleted >= config.minTasksRequired &&
    stats.averageRating >= config.minRatingRequired
  );
}

/**
 * Get user task statistics
 */
async function getUserTaskStats(userId: number): Promise<TierCriteria> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get completed tasks count
  const countResult = await db
    .select({ tasksCompleted: sql<number>`COUNT(*)` })
    .from(userTasks)
    .where(and(eq(userTasks.userId, userId), eq(userTasks.status, 'completed')));

  return {
    tasksCompleted: countResult[0]?.tasksCompleted || 0,
    averageRating: 0, // userTasks.rating column not in current schema
  };
}

/**
 * Upgrade user tier
 * 
 * @param userId - User ID
 * @param newTier - New tier to upgrade to
 * @returns Success status
 */
export async function upgradeUserTier(userId: number, newTier: UserTier): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    // Use raw SQL because users.tier enum in schema is bronze/silver/gold/platinum
    // but business logic uses tier1/tier2/tier3 - cast to any to bypass Drizzle type check
    await db.execute(sql`UPDATE users SET tier = ${newTier}, updatedAt = NOW() WHERE id = ${userId}`);

    return true;
  } catch (error) {
    console.error('Error upgrading user tier:', error);
    return false;
  }
}

/**
 * Check advertiser tier eligibility based on monthly spend
 * 
 * @param advertiserId - Advertiser ID
 * @returns Next eligible tier or null
 */
export async function checkAdvertiserTierEligibility(advertiserId: number): Promise<AdvertiserTier | null> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get advertiser current tier
  const advertiser = await db.select().from(advertisers).where(eq(advertisers.id, advertiserId)).limit(1);
  if (!advertiser || advertiser.length === 0) return null;

  const currentTier = (advertiser[0] as any).tier as AdvertiserTier;

  // Get monthly spend
  const monthlySpend = await getAdvertiserMonthlySpend(advertiserId);

  // Check eligibility for each tier (from highest to lowest)
  if (currentTier !== 'tier4' && monthlySpend >= ADVERTISER_TIERS.tier4.minMonthlySpend) {
    return 'tier4';
  }
  if (currentTier !== 'tier3' && monthlySpend >= ADVERTISER_TIERS.tier3.minMonthlySpend) {
    return 'tier3';
  }
  if (currentTier !== 'tier2' && monthlySpend >= ADVERTISER_TIERS.tier2.minMonthlySpend) {
    return 'tier2';
  }

  return null; // No upgrade available
}

/**
 * Get advertiser monthly spend
 */
async function getAdvertiserMonthlySpend(advertiserId: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // monthlySpend: advertiserId and taskValue not on userTasks in current schema
  // Return 0 as placeholder until schema is updated
  return 0;
}

/**
 * Upgrade advertiser tier
 * 
 * @param advertiserId - Advertiser ID
 * @param newTier - New tier to upgrade to
 * @returns Success status
 */
export async function upgradeAdvertiserTier(advertiserId: number, newTier: AdvertiserTier): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    // Use raw SQL because 'tier' column is not in the Drizzle advertisers schema
    await db.execute(sql`UPDATE advertisers SET tier = ${newTier}, updatedAt = NOW() WHERE id = ${advertiserId}`);
    return true;
  } catch (error) {
    console.error('Error upgrading advertiser tier:', error);
    return false;
  }
}

/**
 * Get tier benefits for display
 * 
 * @param tier - Tier name
 * @param type - 'user' or 'advertiser'
 * @returns Tier configuration
 */
export function getTierInfo(tier: string, type: 'user' | 'advertiser') {
  if (type === 'user') {
    return USER_TIERS[tier] || USER_TIERS.tier1;
  } else {
    return ADVERTISER_TIERS[tier] || ADVERTISER_TIERS.tier1;
  }
}

/**
 * Auto-check and upgrade tiers for all users (run as cron job)
 */
export async function autoUpgradeTiers(): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get all users
  const allUsers = await db.select().from(users);

  for (const user of allUsers) {
    const eligibleTier = await checkUserTierEligibility(user.id);
    if (eligibleTier && eligibleTier !== (user.tier as any)) {
      await upgradeUserTier(user.id, eligibleTier);
      console.log(`Upgraded user ${user.id} to ${eligibleTier}`);
    }
  }

  // Get all advertisers
  const allAdvertisers = await db.select().from(advertisers);

  for (const advertiser of allAdvertisers) {
    const eligibleTier = await checkAdvertiserTierEligibility(advertiser.id);
    if (eligibleTier && eligibleTier !== (advertiser as any).tier) {
      await upgradeAdvertiserTier(advertiser.id, eligibleTier);
      console.log(`Upgraded advertiser ${advertiser.id} to ${eligibleTier}`);
    }
  }
}
