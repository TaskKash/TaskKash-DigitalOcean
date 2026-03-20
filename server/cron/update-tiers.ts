/**
 * Cron Job: Update Tiers
 * 
 * Runs daily to:
 * 1. Upgrade eligible users to their next tier (Novice→Contributor→Elite)
 * 2. Downgrade inactive Elite users → Contributor (Constitution Gap 8: 6-month inactivity rule)
 * 3. Upgrade advertiser tiers based on monthly EGP spend
 */

import { query as mysqlQuery } from '../_core/mysql-db';
import {
  checkUserTierEligibility,
  upgradeUserTier,
  checkUserForInactivityDowngrade,
  checkAdvertiserTierEligibility,
  upgradeAdvertiserTier,
} from '../services/tier.service';

export async function updateTiers() {
  console.log('⏰ [CRON] Starting Constitution-based tier updates...');

  try {
    await updateUserTiers();
    await updateAdvertiserTiers();
    console.log('✅ [CRON] All tier updates complete');
  } catch (error) {
    console.error('❌ [CRON] Error in tier updates:', error);
  }
}

async function updateUserTiers() {
  console.log('👤 [CRON] Checking user tiers...');

  try {
    const users = await mysqlQuery(`
      SELECT id, email, name, tier
      FROM users
      WHERE role = 'user'
      AND pendingDeletion = 0
    `) as any[];

    let upgradedCount = 0;
    let downgradedCount = 0;

    for (const user of users) {
      // 1. Check for UPGRADES (vip → prestige → elite)
      const eligibleTier = await checkUserTierEligibility(user.id);
      if (eligibleTier && eligibleTier !== user.tier) {
        await upgradeUserTier(user.id, eligibleTier);
        upgradedCount++;
        console.log(`⬆️ [CRON] User ${user.id} (${user.email}): ${user.tier} → ${eligibleTier}`);
      }

      // 2. Check for INACTIVITY DOWNGRADES (Constitution Gap 8)
      // Only check elite users — if they haven't completed a task in 6 months, downgrade to prestige
      if (user.tier === 'elite') {
        const wasDowngraded = await checkUserForInactivityDowngrade(user.id);
        if (wasDowngraded) {
          downgradedCount++;
          console.log(`⬇️ [CRON] User ${user.id} (${user.email}): elite → prestige (6-month inactivity)`);
        }
      }
    }

    console.log(`✅ [CRON] Users: ${upgradedCount} upgraded, ${downgradedCount} downgraded`);
  } catch (error) {
    console.error('❌ [CRON] Error updating user tiers:', error);
  }
}

async function updateAdvertiserTiers() {
  console.log('🏢 [CRON] Checking advertiser tiers...');

  try {
    const advertiserList = await mysqlQuery(`
      SELECT id, nameEn, tier
      FROM advertisers
      WHERE isActive = 1
    `) as any[];

    let upgradedCount = 0;

    for (const advertiser of advertiserList) {
      // Check advertiser EGP monthly spend vs Constitution thresholds
      const eligibleTier = await checkAdvertiserTierEligibility(advertiser.id);
      if (eligibleTier && eligibleTier !== advertiser.tier) {
        await upgradeAdvertiserTier(advertiser.id, eligibleTier);
        upgradedCount++;
        console.log(`⬆️ [CRON] Advertiser ${advertiser.id} (${advertiser.nameEn}): ${advertiser.tier} → ${eligibleTier}`);
      }
    }

    console.log(`✅ [CRON] Advertisers: ${upgradedCount} upgraded`);
  } catch (error) {
    console.error('❌ [CRON] Error updating advertiser tiers:', error);
  }
}
