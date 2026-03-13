import { Router } from 'express';
import { query as mysqlQuery } from './mysql-db';
import * as sdk from './sdk.js';

const router = Router();

// Get user's referral info
router.get('/my-code', async (req, res) => {
  try {
    const authUser = await sdk.sdk.authenticateRequest(req);
    if (!authUser || !authUser.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = authUser.id;
    
    const users = (await mysqlQuery(
      'SELECT referralCode, totalReferrals, referralEarnings FROM users WHERE id = ?',
      [userId]
    )) as any;

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    
    // Get referral stats
    const referrals = (await mysqlQuery(
      'SELECT COUNT(*) as total, SUM(referrerReward) as totalRewards FROM referrals WHERE referrerId = ?',
      [userId]
    )) as any;

    res.json({
      referralCode: user.referralCode,
      totalReferrals: user.totalReferrals || 0,
      totalEarnings: parseFloat(user.referralEarnings) || 0,
      referrals: referrals[0]
    });
  } catch (error) {
    console.error('Error getting referral code:', error);
    res.status(500).json({ error: 'Failed to get referral info' });
  }
});

// Get user's referral list
router.get('/list', async (req, res) => {
  try {
    const authUser = await sdk.sdk.authenticateRequest(req);
    if (!authUser || !authUser.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = authUser.id;
    
    const referrals = (await mysqlQuery(
      `SELECT r.*, u.email, u.name, u.completedTasks 
       FROM referrals r 
       JOIN users u ON r.refereeId = u.id 
       WHERE r.referrerId = ? 
       ORDER BY r.createdAt DESC`,
      [userId]
    )) as any;

    res.json({ referrals });
  } catch (error) {
    console.error('Error getting referrals:', error);
    res.status(500).json({ error: 'Failed to get referrals' });
  }
});

// Apply referral code during registration
router.post('/apply', async (req, res) => {
  try {
    const authUser = await sdk.sdk.authenticateRequest(req);
    if (!authUser || !authUser.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = authUser.id;
    const { referralCode } = req.body;

    if (!referralCode) {
      return res.status(400).json({ error: 'Referral code required' });
    }

    // Check if user already used a referral code
    const user = (await mysqlQuery(
      'SELECT referredBy FROM users WHERE id = ?',
      [userId]
    )) as any;

    if (user[0]?.referredBy) {
      return res.status(400).json({ error: 'You have already used a referral code' });
    }

    // Find referrer
    const referrer = (await mysqlQuery(
      'SELECT id FROM users WHERE referralCode = ?',
      [referralCode]
    )) as any;

    if (!referrer || referrer.length === 0) {
      return res.status(404).json({ error: 'Invalid referral code' });
    }

    const referrerId = referrer[0].id;

    if (referrerId === userId) {
      return res.status(400).json({ error: 'Cannot use your own referral code' });
    }

    // Create referral record
    const referrerReward = 20.00; // 20 EGP for referrer
    const refereeReward = 10.00;  // 10 EGP for new user

    await mysqlQuery(
      `INSERT INTO referrals (referrerId, refereeId, referralCode, status, referrerReward, refereeReward)
       VALUES (?, ?, ?, 'completed', ?, ?)`,
      [referrerId, userId, referralCode, referrerReward, refereeReward]
    );

    // Update referee (current user)
    await mysqlQuery(
      'UPDATE users SET referredBy = ?, balance = balance + ? WHERE id = ?',
      [referrerId, refereeReward, userId]
    );

    // Update referrer
    await mysqlQuery(
      `UPDATE users 
       SET totalReferrals = totalReferrals + 1,
           referralEarnings = referralEarnings + ?,
           balance = balance + ?
       WHERE id = ?`,
      [referrerReward, referrerReward, referrerId]
    );

    // Create transactions
    await mysqlQuery(
      `INSERT INTO transactions (userId, type, amount, description, status)
       VALUES 
       (?, 'earn', ?, 'Referral bonus - Welcome gift', 'completed'),
       (?, 'earn', ?, 'Referral reward - Friend joined', 'completed')`,
      [userId, refereeReward, referrerId, referrerReward]
    );

    res.json({
      success: true,
      message: `Welcome! You received ${refereeReward} EGP bonus`,
      reward: refereeReward
    });
  } catch (error) {
    console.error('Error applying referral:', error);
    res.status(500).json({ error: 'Failed to apply referral code' });
  }
});

export default router;
