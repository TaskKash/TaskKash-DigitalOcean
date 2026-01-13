/**
 * Mock Email Service
 * 
 * This is a mock implementation for testing purposes.
 * Replace with real email service (SendGrid, AWS SES, Mailgun) in production.
 */

export interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

export class MockEmailService {
  private static sentEmails: EmailOptions[] = [];

  /**
   * Send email (mock implementation)
   */
  static async send(options: EmailOptions): Promise<boolean> {
    console.log('📧 [MOCK EMAIL] Sending email:', {
      to: options.to,
      subject: options.subject,
      body: options.body.substring(0, 100) + '...'
    });

    // Store sent email for testing
    this.sentEmails.push({
      ...options,
      timestamp: new Date().toISOString()
    } as any);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Simulate 95% success rate
    const success = Math.random() > 0.05;

    if (success) {
      console.log('✅ [MOCK EMAIL] Email sent successfully');
    } else {
      console.log('❌ [MOCK EMAIL] Email failed to send');
    }

    return success;
  }

  /**
   * Send bulk emails (mock implementation)
   */
  static async sendBulk(emails: EmailOptions[]): Promise<{
    success: number;
    failed: number;
  }> {
    console.log(`📧 [MOCK EMAIL] Sending ${emails.length} bulk emails...`);

    let success = 0;
    let failed = 0;

    for (const email of emails) {
      const sent = await this.send(email);
      if (sent) success++;
      else failed++;
    }

    console.log(`✅ [MOCK EMAIL] Bulk send complete: ${success} success, ${failed} failed`);

    return { success, failed };
  }

  /**
   * Get sent emails (for testing)
   */
  static getSentEmails(): EmailOptions[] {
    return this.sentEmails;
  }

  /**
   * Clear sent emails (for testing)
   */
  static clearSentEmails(): void {
    this.sentEmails = [];
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    return this.send({
      to: email,
      subject: 'مرحباً بك في TaskKash! 🎉',
      body: `
مرحباً ${name}،

نحن سعداء بانضمامك إلى TaskKash! 

يمكنك الآن البدء في تصفح المهام المتاحة وكسب المال.

نصائح للبدء:
1. أكمل ملفك الشخصي لزيادة فرصك
2. ابدأ بالمهام السهلة لبناء سمعتك
3. قدم عملاً عالي الجودة للحصول على تقييمات جيدة

فريق TaskKash
      `.trim()
    });
  }

  /**
   * Send task assigned email
   */
  static async sendTaskAssignedEmail(
    email: string,
    name: string,
    taskTitle: string,
    reward: number
  ): Promise<boolean> {
    return this.send({
      to: email,
      subject: 'تم تعيين مهمة جديدة لك! 🎯',
      body: `
مرحباً ${name}،

تم تعيين مهمة جديدة لك:

المهمة: ${taskTitle}
المكافأة: $${reward}

يمكنك البدء في المهمة الآن من لوحة التحكم الخاصة بك.

حظاً موفقاً!
فريق TaskKash
      `.trim()
    });
  }

  /**
   * Send payment received email
   */
  static async sendPaymentReceivedEmail(
    email: string,
    name: string,
    amount: number
  ): Promise<boolean> {
    return this.send({
      to: email,
      subject: 'تم استلام دفعتك! 💰',
      body: `
مرحباً ${name}،

تم إضافة $${amount} إلى محفظتك بنجاح!

يمكنك الآن سحب أموالك أو استخدامها في المهام القادمة.

شكراً لاستخدامك TaskKash!
فريق TaskKash
      `.trim()
    });
  }

  /**
   * Send withdrawal request email
   */
  static async sendWithdrawalRequestEmail(
    email: string,
    name: string,
    amount: number,
    method: string
  ): Promise<boolean> {
    return this.send({
      to: email,
      subject: 'طلب سحب قيد المعالجة 🏦',
      body: `
مرحباً ${name}،

تم استلام طلب السحب الخاص بك:

المبلغ: $${amount}
الطريقة: ${method}

سيتم معالجة طلبك خلال 1-3 أيام عمل.

شكراً لصبرك!
فريق TaskKash
      `.trim()
    });
  }
}

export default MockEmailService;
