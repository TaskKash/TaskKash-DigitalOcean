import { Router } from 'express';
import { query } from './mysql-db';
import { sdk } from './sdk';

const router = Router();

// Middleware to check if user is logged in
async function isUser(req: any, res: any, next: any) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user || !user.id) {
      return res.status(401).json({ error: 'User login required' });
    }
    req.userId = user.id;
    next();
  } catch (error) {
    console.error('[isUser] Authentication error:', error);
    return res.status(401).json({ error: 'User login required' });
  }
}

// GET /api/payment-methods
router.get('/', isUser, async (req: any, res) => {
  try {
    const methods = await query(`SELECT * FROM user_payment_methods WHERE userId = ? ORDER BY isDefault DESC, createdAt DESC`, [req.userId]);
    res.json({ methods });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/payment-methods
router.post('/', isUser, async (req: any, res) => {
  try {
    const { type, name, accountNumber, isDefault } = req.body;
    
    if (isDefault) {
       await query(`UPDATE user_payment_methods SET isDefault = FALSE WHERE userId = ?`, [req.userId]);
    }
    
    await query(`
      INSERT INTO user_payment_methods (userId, type, name, accountNumber, isDefault)
      VALUES (?, ?, ?, ?, ?)
    `, [req.userId, type, name, accountNumber, isDefault ? 1 : 0]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding payment method:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/payment-methods/:id/default
router.put('/:id/default', isUser, async (req: any, res) => {
  try {
    await query(`UPDATE user_payment_methods SET isDefault = FALSE WHERE userId = ?`, [req.userId]);
    await query(`UPDATE user_payment_methods SET isDefault = TRUE WHERE id = ? AND userId = ?`, [req.params.id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error setting default payment method:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/payment-methods/:id
router.delete('/:id', isUser, async (req: any, res) => {
  try {
    await query(`DELETE FROM user_payment_methods WHERE id = ? AND userId = ?`, [req.params.id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
