/**
 * Withdrawal Routes
 * 
 * Endpoints:
 * - POST /api/withdrawals/request - Request a withdrawal
 * - GET /api/withdrawals - Get user's withdrawal history
 * - GET /api/withdrawals/:id - Get withdrawal details
 * - POST /api/withdrawals/:id/cancel - Cancel pending withdrawal
 * - GET /api/withdrawals/methods - Get available withdrawal methods
 */

import { Router } from 'express';
import { query as mysqlQuery } from './mysql-db';
import { sdk } from './sdk';
import { getUserTierConfig, isLaunchPhaseActive, LAUNCH_PHASE } from '../config/business.config';

const router = Router();

// Middleware to check if user is logged in
async function isUser(req: any, res: any, next: any) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user || !user.id) {
      return res.status(401).json({ error: 'User login required' });
    }
    req.userId = user.id;
    req.user = user;
    next();
  } catch (error) {
    console.error('[isUser] Authentication error:', error);
    return res.status(401).json({ error: 'User login required' });
  }
}

// Available withdrawal methods in Egypt
const WITHDRAWAL_METHODS = [
  {
    id: 'vodafone_cash',
    nameEn: 'Vodafone Cash',
    nameAr: 'فودافون كاش',
    minAmount: 50,
    maxAmount: 5000,
    fee: 0,
    feePercentage: 0,
    processingTime: '24-48 hours',
    icon: '📱',
    fields: [
      { name: 'phoneNumber', label: 'Phone Number', labelAr: 'رقم الهاتف', type: 'tel', required: true, placeholder: '01XXXXXXXXX' }
    ]
  },
  {
    id: 'instapay',
    nameEn: 'InstaPay',
    nameAr: 'إنستاباي',
    minAmount: 50,
    maxAmount: 10000,
    fee: 0,
    feePercentage: 0,
    processingTime: '1-24 hours',
    icon: '⚡',
    fields: [
      { name: 'phoneNumber', label: 'Phone Number', labelAr: 'رقم الهاتف', type: 'tel', required: true, placeholder: '01XXXXXXXXX' },
      { name: 'bankName', label: 'Bank Name', labelAr: 'اسم البنك', type: 'text', required: true }
    ]
  },
  {
    id: 'bank_transfer',
    nameEn: 'Bank Transfer',
    nameAr: 'تحويل بنكي',
    minAmount: 100,
    maxAmount: 50000,
    fee: 0,
    feePercentage: 0,
    processingTime: '2-5 business days',
    icon: '🏦',
    fields: [
      { name: 'accountName', label: 'Account Name', labelAr: 'اسم الحساب', type: 'text', required: true },
      { name: 'accountNumber', label: 'Account Number', labelAr: 'رقم الحساب', type: 'text', required: true },
      { name: 'bankName', label: 'Bank Name', labelAr: 'اسم البنك', type: 'text', required: true },
      { name: 'branchCode', label: 'Branch Code', labelAr: 'كود الفرع', type: 'text', required: false }
    ]
  },
  {
    id: 'etisalat_cash',
    nameEn: 'Etisalat Cash',
    nameAr: 'اتصالات كاش',
    minAmount: 50,
    maxAmount: 5000,
    fee: 0,
    feePercentage: 0,
    processingTime: '24-48 hours',
    icon: '📱',
    fields: [
      { name: 'phoneNumber', label: 'Phone Number', labelAr: 'رقم الهاتف', type: 'tel', required: true, placeholder: '01XXXXXXXXX' }
    ]
  },
  {
    id: 'orange_cash',
    nameEn: 'Orange Cash',
    nameAr: 'أورنج كاش',
    minAmount: 50,
    maxAmount: 5000,
    fee: 0,
    feePercentage: 0,
    processingTime: '24-48 hours',
    icon: '📱',
    fields: [
      { name: 'phoneNumber', label: 'Phone Number', labelAr: 'رقم الهاتف', type: 'tel', required: true, placeholder: '01XXXXXXXXX' }
    ]
  }
];

/**
 * GET /api/withdrawals/methods
 * Get available withdrawal methods
 */
router.get('/methods', (req, res) => {
  res.json({ methods: WITHDRAWAL_METHODS });
});

/**
 * POST /api/withdrawals/request
 * Request a new withdrawal
 */
router.post('/request', isUser, async (req, res) => {
  const { amount, method, accountDetails } = req.body;
  const userId = req.userId;

  try {
    // Validate input
    if (!amount || !method || !accountDetails) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Amount, method, and account details are required'
      });
    }

    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Get withdrawal method details
    const methodConfig = WITHDRAWAL_METHODS.find(m => m.id === method);
    if (!methodConfig) {
      return res.status(400).json({ error: 'Invalid withdrawal method' });
    }

    // Check minimum and maximum amounts
    if (withdrawalAmount < methodConfig.minAmount) {
      return res.status(400).json({ 
        error: `Minimum withdrawal amount for ${methodConfig.nameEn} is ${methodConfig.minAmount} EGP` 
      });
    }

    if (withdrawalAmount > methodConfig.maxAmount) {
      return res.status(400).json({ 
        error: `Maximum withdrawal amount for ${methodConfig.nameEn} is ${methodConfig.maxAmount} EGP` 
      });
    }

    // Get user's current balance
    const users = await mysqlQuery('SELECT balance FROM users WHERE id = ?', [userId]) as any;
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userBalance = parseFloat(users[0].balance);

    // Check if user has sufficient balance
    if (userBalance < withdrawalAmount) {
      return res.status(400).json({ 
        error: 'Insufficient balance',
        currentBalance: userBalance,
        requestedAmount: withdrawalAmount
      });
    }

    // Check for pending withdrawals
    const pendingWithdrawals = await mysqlQuery(
      'SELECT COUNT(*) as count FROM withdrawal_requests WHERE userId = ? AND status = ?',
      [userId, 'pending']
    ) as any;

    if (pendingWithdrawals[0].count > 0) {
      return res.status(400).json({ 
        error: 'You already have a pending withdrawal request. Please wait for it to be processed or cancel it first.'
      });
    }

    // Get user tier for commission calculation
    const userData = await mysqlQuery('SELECT tier FROM users WHERE id = ?', [userId]) as any;
    const userTier = userData[0]?.tier || 'bronze';
    
    // Calculate withdrawal commission using centralized business config
    let commissionRateValue = 0;
    if (isLaunchPhaseActive()) {
      commissionRateValue = LAUNCH_PHASE.userCommissionRate; // e.g. 5
    } else {
      const config = getUserTierConfig(userTier);
      commissionRateValue = config.commissionRate;
    }
    
    const commissionRate = commissionRateValue / 100;
    const commissionAmount = withdrawalAmount * commissionRate;
    const netAmount = withdrawalAmount - commissionAmount;
    
    // Create withdrawal request with commission details
    const result = await mysqlQuery(`
      INSERT INTO withdrawal_requests (userId, amount, method, accountDetails, status, commissionRate, commissionAmount, netAmount)
      VALUES (?, ?, ?, ?, 'pending', ?, ?, ?)
    `, [userId, withdrawalAmount, method, JSON.stringify(accountDetails), commissionRateValue, commissionAmount, netAmount]) as any;

    const withdrawalId = result.insertId;

    // Deduct amount from user balance immediately (hold it)
    await mysqlQuery(
      'UPDATE users SET balance = balance - ? WHERE id = ?',
      [withdrawalAmount, userId]
    );

    // Create a transaction record
    const transactionResult = await mysqlQuery(`
      INSERT INTO transactions (
        userId, type, amount, balanceBefore, balanceAfter, 
        description, status, createdAt
      )
      SELECT ?, 'withdraw', ?, balance + ?, balance, ?, 'pending', NOW()
      FROM users WHERE id = ?
    `, [
      userId,
      -withdrawalAmount,
      withdrawalAmount,
      `Withdrawal request #${withdrawalId} via ${methodConfig.nameEn}`,
      userId
    ]) as any;

    const transactionId = transactionResult.insertId;

    // Link transaction to withdrawal request
    await mysqlQuery(
      'UPDATE withdrawal_requests SET transactionId = ? WHERE id = ?',
      [transactionId, withdrawalId]
    );

    let actualProcessingTime = methodConfig.processingTime;
    
    // Enforce tier-based payout timing
    if (userTier === 'bronze') {
      actualProcessingTime = 'Will be processed on the 21st of the month (Bronze Tier)';
    } else if (userTier === 'silver') {
      actualProcessingTime = 'Will be processed next Monday (Silver Tier)';
    } else if (userTier === 'gold' || userTier === 'platinum') {
      actualProcessingTime = 'Within 3 hours (Gold/Platinum Tier)';
    }

    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      withdrawal: {
        id: withdrawalId,
        amount: withdrawalAmount,
        method: methodConfig.nameEn,
        status: 'pending',
        processingTime: actualProcessingTime
      }
    });

  } catch (error: any) {
    console.error('Error creating withdrawal request:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/withdrawals
 * Get user's withdrawal history
 */
router.get('/', isUser, async (req, res) => {
  try {
    const withdrawals = await mysqlQuery(`
      SELECT 
        wr.id,
        wr.amount,
        wr.method,
        wr.accountDetails,
        wr.status,
        wr.requestedAt,
        wr.processedAt,
        wr.rejectionReason,
        t.id as transactionId
      FROM withdrawal_requests wr
      LEFT JOIN transactions t ON wr.transactionId = t.id
      WHERE wr.userId = ?
      ORDER BY wr.requestedAt DESC
    `, [req.userId]) as any;

    // Parse accountDetails JSON
    const formattedWithdrawals = withdrawals.map((w: any) => ({
      ...w,
      accountDetails: typeof w.accountDetails === 'string' 
        ? JSON.parse(w.accountDetails) 
        : w.accountDetails
    }));

    res.json({ withdrawals: formattedWithdrawals });

  } catch (error: any) {
    console.error('Error fetching withdrawals:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/withdrawals/:id
 * Get withdrawal details
 */
router.get('/:id', isUser, async (req, res) => {
  const withdrawalId = parseInt(req.params.id);

  try {
    const withdrawals = await mysqlQuery(`
      SELECT 
        wr.*,
        t.id as transactionId,
        t.status as transactionStatus
      FROM withdrawal_requests wr
      LEFT JOIN transactions t ON wr.transactionId = t.id
      WHERE wr.id = ? AND wr.userId = ?
    `, [withdrawalId, req.userId]) as any;

    if (!withdrawals || withdrawals.length === 0) {
      return res.status(404).json({ error: 'Withdrawal request not found' });
    }

    const withdrawal = withdrawals[0];
    withdrawal.accountDetails = typeof withdrawal.accountDetails === 'string'
      ? JSON.parse(withdrawal.accountDetails)
      : withdrawal.accountDetails;

    res.json({ withdrawal });

  } catch (error: any) {
    console.error('Error fetching withdrawal:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/withdrawals/:id/cancel
 * Cancel a pending withdrawal
 */
router.post('/:id/cancel', isUser, async (req, res) => {
  const withdrawalId = parseInt(req.params.id);

  try {
    // Get withdrawal details
    const withdrawals = await mysqlQuery(
      'SELECT * FROM withdrawal_requests WHERE id = ? AND userId = ?',
      [withdrawalId, req.userId]
    ) as any;

    if (!withdrawals || withdrawals.length === 0) {
      return res.status(404).json({ error: 'Withdrawal request not found' });
    }

    const withdrawal = withdrawals[0];

    // Check if withdrawal can be cancelled
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ 
        error: `Cannot cancel withdrawal with status: ${withdrawal.status}` 
      });
    }

    // Update withdrawal status
    await mysqlQuery(
      'UPDATE withdrawal_requests SET status = ?, processedAt = NOW() WHERE id = ?',
      ['cancelled', withdrawalId]
    );

    // Refund the amount back to user's balance
    await mysqlQuery(
      'UPDATE users SET balance = balance + ? WHERE id = ?',
      [withdrawal.amount, req.userId]
    );

    // Update transaction status
    if (withdrawal.transactionId) {
      await mysqlQuery(
        'UPDATE transactions SET status = ? WHERE id = ?',
        ['cancelled', withdrawal.transactionId]
      );
    }

    res.json({
      success: true,
      message: 'Withdrawal request cancelled successfully',
      refundedAmount: withdrawal.amount
    });

  } catch (error: any) {
    console.error('Error cancelling withdrawal:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
