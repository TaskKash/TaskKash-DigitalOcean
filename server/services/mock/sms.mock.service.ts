/**
 * Mock SMS Service
 * 
 * This is a mock implementation for testing purposes.
 * Replace with real SMS service (Twilio, Nexmo, local provider) in production.
 */

export interface SMSOptions {
  to: string;
  message: string;
}

export class MockSMSService {
  private static sentSMS: SMSOptions[] = [];

  /**
   * Send SMS (mock implementation)
   */
  static async send(options: SMSOptions): Promise<boolean> {
    console.log('📱 [MOCK SMS] Sending SMS:', {
      to: options.to,
      message: options.message.substring(0, 50) + '...'
    });

    // Store sent SMS for testing
    this.sentSMS.push({
      ...options,
      timestamp: new Date().toISOString()
    } as any);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Simulate 98% success rate
    const success = Math.random() > 0.02;

    if (success) {
      console.log('✅ [MOCK SMS] SMS sent successfully');
    } else {
      console.log('❌ [MOCK SMS] SMS failed to send');
    }

    return success;
  }

  /**
   * Send verification code
   */
  static async sendVerificationCode(phone: string, code: string): Promise<boolean> {
    return this.send({
      to: phone,
      message: `رمز التحقق الخاص بك في TaskKash هو: ${code}. صالح لمدة 10 دقائق.`
    });
  }

  /**
   * Send task notification
   */
  static async sendTaskNotification(
    phone: string,
    taskTitle: string
  ): Promise<boolean> {
    return this.send({
      to: phone,
      message: `TaskKash: تم تعيين مهمة جديدة لك: ${taskTitle}`
    });
  }

  /**
   * Send payment notification
   */
  static async sendPaymentNotification(
    phone: string,
    amount: number
  ): Promise<boolean> {
    return this.send({
      to: phone,
      message: `TaskKash: تم إضافة $${amount} إلى محفظتك!`
    });
  }

  /**
   * Send withdrawal confirmation
   */
  static async sendWithdrawalConfirmation(
    phone: string,
    amount: number
  ): Promise<boolean> {
    return this.send({
      to: phone,
      message: `TaskKash: تم معالجة طلب السحب بقيمة $${amount} بنجاح.`
    });
  }

  /**
   * Get sent SMS (for testing)
   */
  static getSentSMS(): SMSOptions[] {
    return this.sentSMS;
  }

  /**
   * Clear sent SMS (for testing)
   */
  static clearSentSMS(): void {
    this.sentSMS = [];
  }
}

export default MockSMSService;
