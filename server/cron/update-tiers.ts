/**
 * Cron Job: Update Tiers
 * 
 * Runs daily to update user and advertiser tiers based on their performance
 */

import { db } from '../db';
import { TierService } from '../services/tier.service';
import MockEmailService from '../services/mock/email.mock.service';

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
    // Get all users
    const users = await db.query(`
      SELECT id, email, name, tier, completedTasks, averageRating
      FROM users
      WHERE role = 'user'
    `);

    let upgradedCount = 0;
    let downgraded Count = 0;

    for (const user of users) {
      const currentTier = user.tier;
      const newTier = TierService.calculateUserTier(
        user.completedTasks,
        user.averageRating
      );

      if (newTier !== currentTier) {
        // Update tier in database
        await db.query(`
          UPDATE users
          SET tier = ?
          WHERE id = ?
        `, [newTier, user.id]);

        // Send notification
        const isUpgrade = TierService.compareTiers(newTier, currentTier) > 0;
        
        if (isUpgrade) {
          upgradedCount++;
          await MockEmailService.send({
            to: user.email,
            subject: 'تهانينا! تمت ترقية طبقتك! 🎉',
            body: `
مرحباً ${user.name}،

تهانينا! تمت ترقية طبقتك من ${currentTier} إلى ${newTier}!

المزايا الجديدة:
${getTierBenefits(newTier)}

استمر في العمل الرائع!
فريق TaskKash
            `.trim()
          });
        } else {
          downgradedCount++;
          await MockEmailService.send({
            to: user.email,
            subject: 'تحديث طبقتك',
            body: `
مرحباً ${user.name}،

تم تحديث طبقتك من ${currentTier} إلى ${newTier}.

لاستعادة طبقتك السابقة:
- أكمل المزيد من المهام
- حافظ على تقييم عالٍ

نحن نؤمن بك!
فريق TaskKash
            `.trim()
          });
        }

        console.log(`${isUpgrade ? '⬆️' : '⬇️'} [CRON] User ${user.id} tier changed: ${currentTier} → ${newTier}`);
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
    // Get all advertisers
    const advertisers = await db.query(`
      SELECT id, slug, nameEn, tier, monthlySpend
      FROM advertisers
      WHERE isActive = 1
    `);

    let upgradedCount = 0;
    let downgradedCount = 0;

    for (const advertiser of advertisers) {
      const currentTier = advertiser.tier;
      const newTier = TierService.calculateAdvertiserTier(advertiser.monthlySpend);

      if (newTier !== currentTier) {
        // Update tier in database
        await db.query(`
          UPDATE advertisers
          SET tier = ?
          WHERE id = ?
        `, [newTier, advertiser.id]);

        const isUpgrade = TierService.compareTiers(newTier, currentTier) > 0;
        
        if (isUpgrade) {
          upgradedCount++;
        } else {
          downgradedCount++;
        }

        console.log(`${isUpgrade ? '⬆️' : '⬇️'} [CRON] Advertiser ${advertiser.id} tier changed: ${currentTier} → ${newTier}`);
      }
    }

    console.log(`✅ [CRON] Advertiser tiers updated: ${upgradedCount} upgraded, ${downgradedCount} downgraded`);
  } catch (error) {
    console.error('❌ [CRON] Error updating advertiser tiers:', error);
  }
}

function getTierBenefits(tier: string): string {
  const benefits = {
    tier1: '- عمولة 5%\n- دفع شهري',
    tier2: '- عمولة 10%\n- دفع أسبوعي\n- أولوية في المهام',
    tier3: '- عمولة 20%\n- دفع فوري (3 ساعات)\n- أولوية عالية\n- دعم مخصص'
  };

  return benefits[tier as keyof typeof benefits] || '';
}

// Run immediately if executed directly
if (require.main === module) {
  updateTiers()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
