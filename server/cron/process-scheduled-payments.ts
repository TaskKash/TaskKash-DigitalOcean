/**
 * Cron Job: Process Scheduled Payments
 * 
 * Runs every hour to process scheduled payments for completed tasks
 * based on user tier (instant, weekly, monthly)
 */

import { db } from '../db';
import { WalletService } from '../services/wallet.service';
import MockEmailService from '../services/mock/email.mock.service';
import MockSMSService from '../services/mock/sms.mock.service';

export async function processScheduledPayments() {
  console.log('⏰ [CRON] Starting scheduled payments processing...');

  try {
    // Get all tasks that are scheduled for payment
    const tasksToProcess = await db.query(`
      SELECT 
        ut.*,
        u.email,
        u.phone,
        u.name,
        t.titleAr,
        t.titleEn
      FROM userTasks ut
      JOIN users u ON ut.userId = u.id
      JOIN tasks t ON ut.taskId = t.id
      WHERE ut.status = 'completed'
        AND ut.paidAt IS NULL
        AND ut.scheduledPaymentAt <= NOW()
      LIMIT 100
    `);

    if (tasksToProcess.length === 0) {
      console.log('✅ [CRON] No payments to process');
      return;
    }

    console.log(`📊 [CRON] Found ${tasksToProcess.length} payments to process`);

    let successCount = 0;
    let failedCount = 0;

    for (const task of tasksToProcess) {
      try {
        // Add earnings to user wallet
        const result = await WalletService.addBalance(
          task.userId,
          task.userEarnings,
          'earning',
          `Payment for task: ${task.titleEn}`,
          task.taskId
        );

        if (result.success) {
          // Update task as paid
          await db.query(`
            UPDATE userTasks
            SET paidAt = NOW()
            WHERE id = ?
          `, [task.id]);

          // Send notification
          await MockEmailService.sendPaymentReceivedEmail(
            task.email,
            task.name,
            task.userEarnings
          );

          if (task.phone) {
            await MockSMSService.sendPaymentNotification(
              task.phone,
              task.userEarnings
            );
          }

          successCount++;
          console.log(`✅ [CRON] Processed payment for task ${task.id}: $${task.userEarnings}`);
        } else {
          failedCount++;
          console.log(`❌ [CRON] Failed to process payment for task ${task.id}`);
        }
      } catch (error) {
        failedCount++;
        console.error(`❌ [CRON] Error processing payment for task ${task.id}:`, error);
      }

      // Add small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`✅ [CRON] Scheduled payments processing complete: ${successCount} success, ${failedCount} failed`);
  } catch (error) {
    console.error('❌ [CRON] Error in scheduled payments processing:', error);
  }
}

// Run immediately if executed directly
if (require.main === module) {
  processScheduledPayments()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
