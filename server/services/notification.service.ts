/**
 * Notification Service
 * Handles all notification operations (email, SMS, push notifications)
 */

import { getDb } from '../db';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Notification types
 */
export type NotificationType = 
  | 'task_assigned'
  | 'task_completed'
  | 'task_verified'
  | 'task_rejected'
  | 'payment_received'
  | 'withdrawal_processed'
  | 'tier_upgraded'
  | 'new_task_available';

/**
 * Notification channels
 */
export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';

/**
 * Send notification to user
 * 
 * @param userId - User ID
 * @param type - Notification type
 * @param data - Notification data
 * @param channels - Channels to send notification through
 */
export async function sendNotification(
  userId: number,
  type: NotificationType,
  data: Record<string, any>,
  channels: NotificationChannel[] = ['in_app']
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get user info
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || user.length === 0) {
    throw new Error('User not found');
  }

  // Generate notification message
  const message = generateNotificationMessage(type, data);

  // Send through each channel
  for (const channel of channels) {
    try {
      switch (channel) {
        case 'email':
          await sendEmailNotification(user[0].email, message.subject, message.body);
          break;
        case 'sms':
          if (user[0].phone) {
            await sendSMSNotification(user[0].phone, message.sms);
          }
          break;
        case 'push':
          await sendPushNotification(userId, message.title, message.body);
          break;
        case 'in_app':
          await createInAppNotification(userId, type, message.title, message.body, data);
          break;
      }
    } catch (error) {
      console.error(`Error sending ${channel} notification:`, error);
    }
  }
}

/**
 * Generate notification message based on type
 */
function generateNotificationMessage(type: NotificationType, data: Record<string, any>) {
  const messages: Record<NotificationType, any> = {
    task_assigned: {
      title: 'مهمة جديدة',
      subject: 'تم تعيين مهمة جديدة لك',
      body: `تم تعيين مهمة "${data.taskTitle}" لك. قيمة المهمة: $${data.taskValue}`,
      sms: `مهمة جديدة: ${data.taskTitle} - $${data.taskValue}`,
    },
    task_completed: {
      title: 'مهمة مكتملة',
      subject: 'تم إكمال مهمة',
      body: `تم إكمال المهمة "${data.taskTitle}" بنجاح. في انتظار المراجعة.`,
      sms: `تم إكمال المهمة: ${data.taskTitle}`,
    },
    task_verified: {
      title: 'تم قبول المهمة',
      subject: 'تم قبول مهمتك',
      body: `تم قبول المهمة "${data.taskTitle}". سيتم إضافة $${data.earnings} إلى محفظتك.`,
      sms: `تم قبول المهمة: ${data.taskTitle} - $${data.earnings}`,
    },
    task_rejected: {
      title: 'تم رفض المهمة',
      subject: 'تم رفض مهمتك',
      body: `تم رفض المهمة "${data.taskTitle}". السبب: ${data.reason || 'غير محدد'}`,
      sms: `تم رفض المهمة: ${data.taskTitle}`,
    },
    payment_received: {
      title: 'تم استلام الدفعة',
      subject: 'تم إضافة أموال إلى محفظتك',
      body: `تم إضافة $${data.amount} إلى محفظتك. الرصيد الحالي: $${data.newBalance}`,
      sms: `تم إضافة $${data.amount} إلى محفظتك`,
    },
    withdrawal_processed: {
      title: 'تم معالجة طلب السحب',
      subject: 'تم معالجة طلب السحب الخاص بك',
      body: `تم ${data.status === 'completed' ? 'قبول' : 'رفض'} طلب سحب بقيمة $${data.amount}.`,
      sms: `طلب السحب: ${data.status === 'completed' ? 'مقبول' : 'مرفوض'} - $${data.amount}`,
    },
    tier_upgraded: {
      title: 'ترقية المستوى',
      subject: 'تمت ترقية مستواك',
      body: `تهانينا! تمت ترقيتك إلى ${data.newTier}. استمتع بالمزايا الجديدة!`,
      sms: `تمت ترقيتك إلى ${data.newTier}`,
    },
    new_task_available: {
      title: 'مهام جديدة متاحة',
      subject: 'مهام جديدة متاحة في منطقتك',
      body: `هناك ${data.count} مهام جديدة متاحة في منطقتك. تحقق منها الآن!`,
      sms: `${data.count} مهام جديدة متاحة`,
    },
  };

  return messages[type] || {
    title: 'إشعار',
    subject: 'إشعار جديد',
    body: 'لديك إشعار جديد',
    sms: 'إشعار جديد',
  };
}

/**
 * Send email notification (placeholder - integrate with email service)
 */
async function sendEmailNotification(email: string, subject: string, body: string) {
  // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
  console.log(`Email to ${email}: ${subject}`);
  console.log(body);
}

/**
 * Send SMS notification (placeholder - integrate with SMS service)
 */
async function sendSMSNotification(phone: string, message: string) {
  // TODO: Integrate with SMS service (Twilio, Nexmo, etc.)
  console.log(`SMS to ${phone}: ${message}`);
}

/**
 * Send push notification (placeholder - integrate with push service)
 */
async function sendPushNotification(userId: number, title: string, body: string) {
  // TODO: Integrate with push notification service (Firebase, OneSignal, etc.)
  console.log(`Push to user ${userId}: ${title} - ${body}`);
}

/**
 * Create in-app notification
 */
async function createInAppNotification(
  userId: number,
  type: NotificationType,
  title: string,
  body: string,
  data: Record<string, any>
) {
  // TODO: Store in database notifications table
  console.log(`In-app notification for user ${userId}: ${title}`);
  console.log(body);
  console.log('Data:', data);
}

/**
 * Notify user about task assignment
 */
export async function notifyTaskAssigned(userId: number, taskId: number, taskTitle: string, taskValue: number) {
  await sendNotification(userId, 'task_assigned', {
    taskId,
    taskTitle,
    taskValue,
  }, ['in_app', 'push']);
}

/**
 * Notify advertiser about task completion
 */
export async function notifyTaskCompleted(advertiserId: number, taskId: number, taskTitle: string) {
  await sendNotification(advertiserId, 'task_completed', {
    taskId,
    taskTitle,
  }, ['in_app', 'email']);
}

/**
 * Notify user about task verification
 */
export async function notifyTaskVerified(
  userId: number,
  taskId: number,
  taskTitle: string,
  earnings: number,
  isApproved: boolean,
  reason?: string
) {
  if (isApproved) {
    await sendNotification(userId, 'task_verified', {
      taskId,
      taskTitle,
      earnings,
    }, ['in_app', 'push', 'sms']);
  } else {
    await sendNotification(userId, 'task_rejected', {
      taskId,
      taskTitle,
      reason,
    }, ['in_app', 'push']);
  }
}

/**
 * Notify user about payment received
 */
export async function notifyPaymentReceived(userId: number, amount: number, newBalance: number) {
  await sendNotification(userId, 'payment_received', {
    amount,
    newBalance,
  }, ['in_app', 'push']);
}

/**
 * Notify user about withdrawal processing
 */
export async function notifyWithdrawalProcessed(
  userId: number,
  amount: number,
  status: 'completed' | 'rejected'
) {
  await sendNotification(userId, 'withdrawal_processed', {
    amount,
    status,
  }, ['in_app', 'email', 'sms']);
}

/**
 * Notify user about tier upgrade
 */
export async function notifyTierUpgraded(userId: number, newTier: string) {
  await sendNotification(userId, 'tier_upgraded', {
    newTier,
  }, ['in_app', 'push', 'email']);
}

/**
 * Notify users about new tasks available
 */
export async function notifyNewTasksAvailable(userIds: number[], count: number) {
  for (const userId of userIds) {
    await sendNotification(userId, 'new_task_available', {
      count,
    }, ['in_app', 'push']);
  }
}
