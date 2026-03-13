/**
 * Cron Job: Process Scheduled Payments
 * 
 * Runs every hour to process scheduled payments for completed tasks
 * based on user tier (instant, weekly, monthly)
 */

import { getDb } from '../db';
import { addFunds } from '../services/wallet.service';
import { sql } from 'drizzle-orm';

export async function processScheduledPayments() {
  console.log('⏰ [CRON] Starting scheduled payments processing...');

  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const [tasksToProcess] = (await db.execute(sql`
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
    `)) as any;

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
        await addFunds(
          (task as any).userId,
          (task as any).userEarnings,
          `Payment for task: ${(task as any).titleEn}`,
          (task as any).taskId
        );

        if (true) {
          // Update task as paid
          await db.execute(sql`
            UPDATE userTasks
            SET paidAt = NOW()
            WHERE id = ${(task as any).id}
          `);

          // Send notification (placeholder)
          console.log(`[Notification] Payment of ${(task as any).userEarnings} sent to ${(task as any).email}`);

          successCount++;
          console.log(`✅ [CRON] Processed payment for task ${(task as any).id}: $${(task as any).userEarnings}`);
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
