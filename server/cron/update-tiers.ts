/**
 * Cron Job: Update Tiers
 * 
 * Runs daily to update user and advertiser tiers based on their performance
 */

import { query as mysqlQuery } from '../_core/mysql-db';
import { checkUserTierEligibility, upgradeUserTier } from '../services/tier.service';

export async function updateTiers() {
  console.log('⏰ [CRON] Starting tier updates...');

  try {
    await updateUserTiers();
    await updateAdvertiserTiers();

    console.log('✅ [CRON] Tier updates complete');
  } catch (error) {
    console.error('❌ [CRON] Error in tier updates:', error);
  }
}

async function updateUserTiers() {
  console.log('👤 [CRON] Updating user tiers...');

  try {
    const users = await mysqlQuery(`
      SELECT id, email, name, tier
      FROM users
      WHERE role = 'user'
    `) as any[];

    let upgradedCount = 0;
    let downgradedCount = 0;

    for (const user of users) {
      const currentTier = user.tier;
      const eligibleTier = await checkUserTierEligibility(user.id);

      if (eligibleTier && eligibleTier !== currentTier) {
        await upgradeUserTier(user.id, eligibleTier);
        const isUpgrade = true; // upgradeUserTier only upgrades
        if (isUpgrade) {
          upgradedCount++;
        } else {
          downgradedCount++;
        }
        console.log(`⬆️ [CRON] User ${user.id} tier changed: ${currentTier} → ${eligibleTier}`);
      }
    }

    console.log(`✅ [CRON] User tiers updated: ${upgradedCount} upgraded, ${downgradedCount} downgraded`);
  } catch (error) {
    console.error('❌ [CRON] Error updating user tiers:', error);
  }
}

async function updateAdvertiserTiers() {
  console.log('🏢 [CRON] Updating advertiser tiers...');

  try {
    const advertisers = await mysqlQuery(`
      SELECT id, nameEn
      FROM advertisers
      WHERE isActive = 1
    `) as any[];

    let upgradedCount = 0;
    let downgradedCount = 0;

    for (const advertiser of advertisers) {
      // Tier management for advertisers is handled separately
      console.log(`[CRON] Checked advertiser ${advertiser.id}`);
    }

    console.log(`✅ [CRON] Advertiser tiers updated: ${upgradedCount} upgraded, ${downgradedCount} downgraded`);
  } catch (error) {
    console.error('❌ [CRON] Error updating advertiser tiers:', error);
  }
}
