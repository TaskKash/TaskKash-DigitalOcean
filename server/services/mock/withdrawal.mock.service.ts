/**
 * Mock Withdrawal Service
 * 
 * This is a mock implementation for testing purposes.
 * Replace with real withdrawal services in production:
 * - Vodafone Cash API
 * - InstaPay API
 * - Fawry API
 * - Bank Transfer (manual)
 */

export type WithdrawalMethod = 'vodafone_cash' | 'instapay' | 'fawry' | 'bank_transfer';

export interface WithdrawalOptions {
  amount: number;
  currency: string;
  method: WithdrawalMethod;
  accountDetails: {
    accountNumber?: string;
    phoneNumber?: string;
    bankName?: string;
    accountName?: string;
  };
  userId: string;
}

export interface WithdrawalResult {
  success: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  method: WithdrawalMethod;
  timestamp: string;
  estimatedArrival?: string;
  error?: string;
}

export class MockWithdrawalService {
  private static withdrawals: WithdrawalResult[] = [];

  /**
   * Process withdrawal (mock implementation)
   */
  static async processWithdrawal(options: WithdrawalOptions): Promise<WithdrawalResult> {
    console.log('💸 [MOCK WITHDRAWAL] Processing withdrawal:', {
      amount: options.amount,
      currency: options.currency,
      method: options.method,
      userId: options.userId
    });

    // Simulate network delay (varies by method)
    const delays = {
      vodafone_cash: 500,
      instapay: 300,
      fawry: 400,
      bank_transfer: 1000
    };
    await new Promise(resolve => setTimeout(resolve, delays[options.method]));

    // Simulate success rates (varies by method)
    const successRates = {
      vodafone_cash: 0.95,
      instapay: 0.97,
      fawry: 0.93,
      bank_transfer: 0.99
    };
    const success = Math.random() < successRates[options.method];

    // Calculate estimated arrival time
    const arrivalHours = {
      vodafone_cash: 1,
      instapay: 0.5,
      fawry: 2,
      bank_transfer: 48
    };
    const estimatedArrival = new Date(
      Date.now() + arrivalHours[options.method] * 60 * 60 * 1000
    ).toISOString();

    const result: WithdrawalResult = {
      success,
      transactionId: `mock_wd_${options.method}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: options.amount,
      currency: options.currency,
      method: options.method,
      timestamp: new Date().toISOString(),
      ...(success ? { estimatedArrival } : { error: `Withdrawal failed via ${options.method}` })
    };

    // Store withdrawal
    this.withdrawals.push(result);

    if (success) {
      console.log('✅ [MOCK WITHDRAWAL] Withdrawal processed successfully:', {
        transactionId: result.transactionId,
        method: options.method,
        estimatedArrival
      });
    } else {
      console.log('❌ [MOCK WITHDRAWAL] Withdrawal failed:', result.error);
    }

    return result;
  }

  /**
   * Process Vodafone Cash withdrawal
   */
  static async processVodafoneCash(
    amount: number,
    phoneNumber: string,
    userId: string
  ): Promise<WithdrawalResult> {
    return this.processWithdrawal({
      amount,
      currency: 'EGP',
      method: 'vodafone_cash',
      accountDetails: { phoneNumber },
      userId
    });
  }

  /**
   * Process InstaPay withdrawal
   */
  static async processInstaPay(
    amount: number,
    phoneNumber: string,
    userId: string
  ): Promise<WithdrawalResult> {
    return this.processWithdrawal({
      amount,
      currency: 'EGP',
      method: 'instapay',
      accountDetails: { phoneNumber },
      userId
    });
  }

  /**
   * Process Fawry withdrawal
   */
  static async processFawry(
    amount: number,
    phoneNumber: string,
    userId: string
  ): Promise<WithdrawalResult> {
    return this.processWithdrawal({
      amount,
      currency: 'EGP',
      method: 'fawry',
      accountDetails: { phoneNumber },
      userId
    });
  }

  /**
   * Process Bank Transfer withdrawal
   */
  static async processBankTransfer(
    amount: number,
    accountNumber: string,
    bankName: string,
    accountName: string,
    userId: string
  ): Promise<WithdrawalResult> {
    return this.processWithdrawal({
      amount,
      currency: 'EGP',
      method: 'bank_transfer',
      accountDetails: { accountNumber, bankName, accountName },
      userId
    });
  }

  /**
   * Get withdrawal status (mock implementation)
   */
  static async getWithdrawalStatus(transactionId: string): Promise<WithdrawalResult | null> {
    return this.withdrawals.find(w => w.transactionId === transactionId) || null;
  }

  /**
   * Get all withdrawals (for testing)
   */
  static getWithdrawals(): WithdrawalResult[] {
    return this.withdrawals;
  }

  /**
   * Clear withdrawals (for testing)
   */
  static clearWithdrawals(): void {
    this.withdrawals = [];
  }

  /**
   * Get supported methods
   */
  static getSupportedMethods(): WithdrawalMethod[] {
    return ['vodafone_cash', 'instapay', 'fawry', 'bank_transfer'];
  }

  /**
   * Get method info
   */
  static getMethodInfo(method: WithdrawalMethod): {
    name: string;
    nameAr: string;
    minAmount: number;
    maxAmount: number;
    processingTime: string;
    processingTimeAr: string;
  } {
    const info = {
      vodafone_cash: {
        name: 'Vodafone Cash',
        nameAr: 'فودافون كاش',
        minAmount: 50,
        maxAmount: 10000,
        processingTime: '1 hour',
        processingTimeAr: 'ساعة واحدة'
      },
      instapay: {
        name: 'InstaPay',
        nameAr: 'إنستاباي',
        minAmount: 50,
        maxAmount: 50000,
        processingTime: '30 minutes',
        processingTimeAr: '30 دقيقة'
      },
      fawry: {
        name: 'Fawry',
        nameAr: 'فوري',
        minAmount: 100,
        maxAmount: 20000,
        processingTime: '2 hours',
        processingTimeAr: 'ساعتان'
      },
      bank_transfer: {
        name: 'Bank Transfer',
        nameAr: 'تحويل بنكي',
        minAmount: 500,
        maxAmount: 100000,
        processingTime: '1-3 business days',
        processingTimeAr: '1-3 أيام عمل'
      }
    };

    return info[method];
  }
}

export default MockWithdrawalService;
