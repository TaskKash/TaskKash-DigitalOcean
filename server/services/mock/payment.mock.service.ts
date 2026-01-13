/**
 * Mock Payment Gateway Service
 * 
 * This is a mock implementation for testing purposes.
 * Replace with real payment gateway (Stripe, PayPal, Fawry, Paymob) in production.
 */

export interface PaymentOptions {
  amount: number;
  currency: string;
  customerId: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  timestamp: string;
  error?: string;
}

export class MockPaymentGatewayService {
  private static transactions: PaymentResult[] = [];

  /**
   * Process payment (mock implementation)
   */
  static async processPayment(options: PaymentOptions): Promise<PaymentResult> {
    console.log('💳 [MOCK PAYMENT] Processing payment:', {
      amount: options.amount,
      currency: options.currency,
      customerId: options.customerId,
      description: options.description
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Simulate 95% success rate
    const success = Math.random() > 0.05;

    const result: PaymentResult = {
      success,
      transactionId: `mock_txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: options.amount,
      currency: options.currency,
      timestamp: new Date().toISOString(),
      ...(success ? {} : { error: 'Payment declined by mock gateway' })
    };

    // Store transaction
    this.transactions.push(result);

    if (success) {
      console.log('✅ [MOCK PAYMENT] Payment processed successfully:', result.transactionId);
    } else {
      console.log('❌ [MOCK PAYMENT] Payment failed:', result.error);
    }

    return result;
  }

  /**
   * Refund payment (mock implementation)
   */
  static async refundPayment(
    transactionId: string,
    amount: number
  ): Promise<PaymentResult> {
    console.log('🔄 [MOCK PAYMENT] Processing refund:', {
      transactionId,
      amount
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Simulate 98% success rate
    const success = Math.random() > 0.02;

    const result: PaymentResult = {
      success,
      transactionId: `mock_refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency: 'USD',
      timestamp: new Date().toISOString(),
      ...(success ? {} : { error: 'Refund failed by mock gateway' })
    };

    if (success) {
      console.log('✅ [MOCK PAYMENT] Refund processed successfully:', result.transactionId);
    } else {
      console.log('❌ [MOCK PAYMENT] Refund failed:', result.error);
    }

    return result;
  }

  /**
   * Get transaction (mock implementation)
   */
  static async getTransaction(transactionId: string): Promise<PaymentResult | null> {
    return this.transactions.find(t => t.transactionId === transactionId) || null;
  }

  /**
   * Get all transactions (for testing)
   */
  static getTransactions(): PaymentResult[] {
    return this.transactions;
  }

  /**
   * Clear transactions (for testing)
   */
  static clearTransactions(): void {
    this.transactions = [];
  }
}

export default MockPaymentGatewayService;
