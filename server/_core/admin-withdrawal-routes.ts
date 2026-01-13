import { Router, Request, Response } from 'express';
import { query as mysqlQuery } from './mysql-db';
import { sdk } from './sdk';

const router = Router();

// Middleware to check if user is admin
const isAdmin = async (req: any, res: Response, next: any) => {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is admin
    const [dbUser] = await mysqlQuery(
      'SELECT role FROM users WHERE id = ?',
      [user.openId.replace('user_', '')]
    );

    if (!dbUser || dbUser.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    req.userId = user.openId.replace('user_', '');
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// GET /api/admin/withdrawals - Get all withdrawal requests
router.get('/withdrawals', isAdmin, async (req: Request, res: Response) => {
  try {
    const withdrawals = await mysqlQuery(`
      SELECT 
        wr.*,
        u.nameEn as userName,
        u.email as userEmail
      FROM withdrawal_requests wr
      JOIN users u ON wr.userId = u.id
      ORDER BY 
        CASE wr.status
          WHEN 'pending' THEN 1
          WHEN 'approved' THEN 2
          WHEN 'completed' THEN 3
          WHEN 'rejected' THEN 4
          ELSE 5
        END,
        wr.createdAt DESC
    `);

    // Format the response
    const formattedWithdrawals = withdrawals.map((w: any) => ({
      id: w.id,
      userId: w.userId,
      amount: parseFloat(w.amount),
      paymentMethod: w.paymentMethod,
      accountDetails: typeof w.accountDetails === 'string' 
        ? JSON.parse(w.accountDetails) 
        : w.accountDetails,
      status: w.status,
      createdAt: w.createdAt,
      processedAt: w.processedAt,
      adminNotes: w.adminNotes,
      user: {
        nameEn: w.userName,
        email: w.userEmail,
      },
    }));

    res.json({ withdrawals: formattedWithdrawals });
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    res.status(500).json({ error: 'Failed to fetch withdrawals' });
  }
});

// POST /api/admin/withdrawals/:id/approve - Approve a withdrawal request
router.post('/withdrawals/:id/approve', isAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { adminNotes } = req.body;

  try {
    // Get withdrawal details
    const [withdrawal] = await mysqlQuery(
      'SELECT * FROM withdrawal_requests WHERE id = ?',
      [id]
    );

    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal request not found' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending withdrawals can be approved' });
    }

    // Update withdrawal status
    await mysqlQuery(
      `UPDATE withdrawal_requests 
       SET status = 'approved', 
           processedAt = NOW(), 
           processedBy = ?,
           adminNotes = ?
       WHERE id = ?`,
      [req.userId, adminNotes || null, id]
    );

    // Create transaction record for approval
    await mysqlQuery(
      `INSERT INTO transactions 
       (userId, type, amount, description, status, createdAt)
       VALUES (?, 'withdrawal_approved', ?, ?, 'completed', NOW())`,
      [
        withdrawal.userId,
        withdrawal.amount,
        `Withdrawal approved - ${withdrawal.paymentMethod}`
      ]
    );

    res.json({ 
      success: true, 
      message: 'Withdrawal approved successfully' 
    });
  } catch (error) {
    console.error('Error approving withdrawal:', error);
    res.status(500).json({ error: 'Failed to approve withdrawal' });
  }
});

// POST /api/admin/withdrawals/:id/reject - Reject a withdrawal request
router.post('/withdrawals/:id/reject', isAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { adminNotes } = req.body;

  if (!adminNotes || !adminNotes.trim()) {
    return res.status(400).json({ error: 'Admin notes are required for rejection' });
  }

  try {
    // Get withdrawal details
    const [withdrawal] = await mysqlQuery(
      'SELECT * FROM withdrawal_requests WHERE id = ?',
      [id]
    );

    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal request not found' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending withdrawals can be rejected' });
    }

    // Refund the amount to user's wallet
    await mysqlQuery(
      'UPDATE users SET balance = balance + ? WHERE id = ?',
      [withdrawal.amount, withdrawal.userId]
    );

    // Update withdrawal status
    await mysqlQuery(
      `UPDATE withdrawal_requests 
       SET status = 'rejected', 
           processedAt = NOW(), 
           processedBy = ?,
           adminNotes = ?
       WHERE id = ?`,
      [req.userId, adminNotes, id]
    );

    // Create transaction record for refund
    await mysqlQuery(
      `INSERT INTO transactions 
       (userId, type, amount, description, status, createdAt)
       VALUES (?, 'withdrawal_refund', ?, ?, 'completed', NOW())`,
      [
        withdrawal.userId,
        withdrawal.amount,
        `Withdrawal rejected and refunded - Reason: ${adminNotes}`
      ]
    );

    res.json({ 
      success: true, 
      message: 'Withdrawal rejected and amount refunded' 
    });
  } catch (error) {
    console.error('Error rejecting withdrawal:', error);
    res.status(500).json({ error: 'Failed to reject withdrawal' });
  }
});

// POST /api/admin/withdrawals/:id/complete - Mark withdrawal as completed
router.post('/withdrawals/:id/complete', isAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { adminNotes } = req.body;

  try {
    // Get withdrawal details
    const [withdrawal] = await mysqlQuery(
      'SELECT * FROM withdrawal_requests WHERE id = ?',
      [id]
    );

    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal request not found' });
    }

    if (withdrawal.status !== 'approved') {
      return res.status(400).json({ error: 'Only approved withdrawals can be marked as completed' });
    }

    // Update withdrawal status
    await mysqlQuery(
      `UPDATE withdrawal_requests 
       SET status = 'completed',
           adminNotes = CONCAT(COALESCE(adminNotes, ''), '\n', ?)
       WHERE id = ?`,
      [adminNotes || 'Payment completed', id]
    );

    res.json({ 
      success: true, 
      message: 'Withdrawal marked as completed' 
    });
  } catch (error) {
    console.error('Error completing withdrawal:', error);
    res.status(500).json({ error: 'Failed to complete withdrawal' });
  }
});

export default router;
