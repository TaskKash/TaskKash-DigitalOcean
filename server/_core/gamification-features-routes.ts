/**
 * Gamification Features API Routes
 * Features: Profile Power-Up, Targeting Tiers, Data Bounties
 */

import { Router, Request, Response } from 'express';
import { getConnection } from './mysql-db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = Router();

// ============================================================================
// Feature 1: Profile Power-Up & Data Dividends
// ============================================================================

/**
 * GET /api/gamification/profile-sections
 * Get all available profile sections
 */
router.get('/profile-sections', async (req: Request, res: Response) => {
  try {
    const db = await getConnection();
    const [sections] = await db.query<RowDataPacket[]>(
      `SELECT * FROM profile_sections WHERE isActive = TRUE ORDER BY displayOrder ASC`
    );
    
    res.json({ success: true, sections });
  } catch (error) {
    console.error('[Profile Sections] Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile sections' });
  }
});

/**
 * GET /api/gamification/profile-sections/user/:userId
 * Get user's profile completion status
 */
router.get('/profile-sections/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const db = await getConnection();
    
    // Get all sections
    const [sections] = await db.query<RowDataPacket[]>(
      `SELECT * FROM profile_sections WHERE isActive = TRUE ORDER BY displayOrder ASC`
    );
    
    // Get user's completions
    const [completions] = await db.query<RowDataPacket[]>(
      `SELECT sectionKey, completedAt, bonusAwarded, multiplierAwarded 
       FROM user_profile_completions 
       WHERE userId = ?`,
      [userId]
    );
    
    // Get user's current multiplier
    const [users] = await db.query<RowDataPacket[]>(
      `SELECT earningsMultiplier, profileCompletionBonus FROM users WHERE id = ?`,
      [userId]
    );
    
    const completionMap = new Map(completions.map(c => [c.sectionKey, c]));
    
    const sectionsWithStatus = sections.map(section => ({
      ...section,
      isCompleted: completionMap.has(section.sectionKey),
      completedAt: completionMap.get(section.sectionKey)?.completedAt || null
    }));
    
    res.json({
      success: true,
      sections: sectionsWithStatus,
      currentMultiplier: users[0]?.earningsMultiplier || 1.00,
      totalBonus: users[0]?.profileCompletionBonus || 0.00,
      completedCount: completions.length,
      totalCount: sections.length
    });
  } catch (error) {
    console.error('[Profile Sections User] Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user profile status' });
  }
});

/**
 * POST /api/gamification/profile-sections/complete
 * Mark a profile section as complete and award bonus
 */
router.post('/profile-sections/complete', async (req: Request, res: Response) => {
  try {
    const { userId, sectionKey } = req.body;
    
    if (!userId || !sectionKey) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    const db = await getConnection();
    
    // Get section details
    const [sections] = await db.query<RowDataPacket[]>(
      `SELECT * FROM profile_sections WHERE sectionKey = ? AND isActive = TRUE`,
      [sectionKey]
    );
    
    if (sections.length === 0) {
      return res.status(404).json({ success: false, error: 'Section not found' });
    }
    
    const section = sections[0];
    
    // Check if already completed
    const [existing] = await db.query<RowDataPacket[]>(
      `SELECT id FROM user_profile_completions WHERE userId = ? AND sectionKey = ?`,
      [userId, sectionKey]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'Section already completed' });
    }
    
    // Start transaction
    await db.query('START TRANSACTION');
    
    try {
      // Record completion
      await db.query(
        `INSERT INTO user_profile_completions (userId, sectionKey, bonusAwarded, multiplierAwarded)
         VALUES (?, ?, ?, ?)`,
        [userId, sectionKey, section.bonusAmount, section.multiplierBonus]
      );
      
      // Update user balance and multiplier
      await db.query(
        `UPDATE users 
         SET balance = balance + ?,
             profileCompletionBonus = profileCompletionBonus + ?,
             earningsMultiplier = earningsMultiplier + ?
         WHERE id = ?`,
        [section.bonusAmount, section.bonusAmount, section.multiplierBonus, userId]
      );
      
      // Record transaction
      await db.query(
        `INSERT INTO transactions (userId, type, amount, description, status)
         VALUES (?, 'profile_bonus', ?, ?, 'completed')`,
        [userId, section.bonusAmount, `Profile completion bonus: ${section.nameEn}`]
      );
      
      await db.query('COMMIT');
      
      // Get updated user data
      const [users] = await db.query<RowDataPacket[]>(
        `SELECT balance, earningsMultiplier, profileCompletionBonus FROM users WHERE id = ?`,
        [userId]
      );
      
      res.json({
        success: true,
        message: 'Profile section completed successfully',
        bonusAwarded: section.bonusAmount,
        multiplierAwarded: section.multiplierBonus,
        newBalance: users[0].balance,
        newMultiplier: users[0].earningsMultiplier,
        totalBonus: users[0].profileCompletionBonus
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('[Profile Section Complete] Error:', error);
    res.status(500).json({ success: false, error: 'Failed to complete profile section' });
  }
});

// ============================================================================
// Feature 2: Targeting Tiers & Exclusive Tasks
// ============================================================================

/**
 * GET /api/gamification/targeting-tiers
 * Get all available targeting tiers
 */
router.get('/targeting-tiers', async (req: Request, res: Response) => {
  try {
    const db = await getConnection();
    const [tiers] = await db.query<RowDataPacket[]>(
      `SELECT * FROM targeting_tiers WHERE isActive = TRUE ORDER BY displayOrder ASC`
    );
    
    res.json({ success: true, tiers });
  } catch (error) {
    console.error('[Targeting Tiers] Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch targeting tiers' });
  }
});

/**
 * GET /api/gamification/targeting-tiers/user/:userId
 * Get user's unlocked tiers
 */
router.get('/targeting-tiers/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const db = await getConnection();
    
    // Get all tiers
    const [tiers] = await db.query<RowDataPacket[]>(
      `SELECT * FROM targeting_tiers WHERE isActive = TRUE ORDER BY displayOrder ASC`
    );
    
    // Get user's unlocks
    const [unlocks] = await db.query<RowDataPacket[]>(
      `SELECT tierKey, unlockedAt, verificationStatus, verifiedAt 
       FROM user_tier_unlocks 
       WHERE userId = ?`,
      [userId]
    );
    
    const unlockMap = new Map(unlocks.map(u => [u.tierKey, u]));
    
    const tiersWithStatus = tiers.map(tier => ({
      ...tier,
      isUnlocked: unlockMap.has(tier.tierKey),
      verificationStatus: unlockMap.get(tier.tierKey)?.verificationStatus || null,
      unlockedAt: unlockMap.get(tier.tierKey)?.unlockedAt || null
    }));
    
    res.json({
      success: true,
      tiers: tiersWithStatus,
      unlockedCount: unlocks.filter(u => u.verificationStatus === 'verified').length,
      totalCount: tiers.length
    });
  } catch (error) {
    console.error('[Targeting Tiers User] Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user tiers' });
  }
});

/**
 * POST /api/gamification/targeting-tiers/unlock
 * Request to unlock a targeting tier
 */
router.post('/targeting-tiers/unlock', async (req: Request, res: Response) => {
  try {
    const { userId, tierKey, verificationData } = req.body;
    
    if (!userId || !tierKey) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    const db = await getConnection();
    
    // Get tier details
    const [tiers] = await db.query<RowDataPacket[]>(
      `SELECT * FROM targeting_tiers WHERE tierKey = ? AND isActive = TRUE`,
      [tierKey]
    );
    
    if (tiers.length === 0) {
      return res.status(404).json({ success: false, error: 'Tier not found' });
    }
    
    const tier = tiers[0];
    
    // Check if already unlocked
    const [existing] = await db.query<RowDataPacket[]>(
      `SELECT id, verificationStatus FROM user_tier_unlocks WHERE userId = ? AND tierKey = ?`,
      [userId, tierKey]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tier already unlocked or pending verification',
        status: existing[0].verificationStatus
      });
    }
    
    // Determine initial status based on verification method
    const initialStatus = tier.verificationMethod === 'self_reported' ? 'verified' : 'pending';
    
    // Record unlock request
    await db.query(
      `INSERT INTO user_tier_unlocks (userId, tierKey, verificationStatus, verificationData, verifiedAt)
       VALUES (?, ?, ?, ?, ?)`,
      [
        userId, 
        tierKey, 
        initialStatus, 
        JSON.stringify(verificationData || {}),
        initialStatus === 'verified' ? new Date() : null
      ]
    );
    
    res.json({
      success: true,
      message: initialStatus === 'verified' 
        ? 'Tier unlocked successfully' 
        : 'Tier unlock request submitted for verification',
      verificationStatus: initialStatus,
      tier: tier
    });
  } catch (error) {
    console.error('[Targeting Tier Unlock] Error:', error);
    res.status(500).json({ success: false, error: 'Failed to unlock tier' });
  }
});

/**
 * GET /api/gamification/tasks/exclusive
 * Get exclusive tasks available to user based on their unlocked tiers
 */
router.get('/tasks/exclusive/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const db = await getConnection();
    
    // Get user's verified tiers
    const [userTiers] = await db.query<RowDataPacket[]>(
      `SELECT tierKey FROM user_tier_unlocks 
       WHERE userId = ? AND verificationStatus = 'verified'`,
      [userId]
    );
    
    const unlockedTierKeys = userTiers.map(t => t.tierKey);
    
    // Get all exclusive tasks
    const [tasks] = await db.query<RowDataPacket[]>(
      `SELECT * FROM tasks WHERE isExclusive = TRUE AND status = 'active'`
    );
    
    // Filter tasks based on user's tiers
    const accessibleTasks = tasks.filter(task => {
      if (!task.requiredTiers) return true;
      const requiredTiers = JSON.parse(task.requiredTiers);
      return requiredTiers.some((tier: string) => unlockedTierKeys.includes(tier));
    });
    
    res.json({
      success: true,
      tasks: accessibleTasks,
      unlockedTiers: unlockedTierKeys
    });
  } catch (error) {
    console.error('[Exclusive Tasks] Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch exclusive tasks' });
  }
});

// ============================================================================
// Feature 3: Data Bounties
// ============================================================================

/**
 * GET /api/gamification/data-bounties/active
 * Get all active data bounties
 */
router.get('/data-bounties/active', async (req: Request, res: Response) => {
  try {
    const db = await getConnection();
    const [bounties] = await db.query<RowDataPacket[]>(
      `SELECT * FROM data_bounties 
       WHERE status = 'active' 
       AND startTime <= NOW() 
       AND endTime >= NOW()
       ORDER BY rewardAmount DESC`
    );
    
    res.json({ success: true, bounties });
  } catch (error) {
    console.error('[Data Bounties Active] Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch active bounties' });
  }
});

/**
 * GET /api/gamification/data-bounties/user/:userId
 * Get bounties available to user (not yet responded)
 */
router.get('/data-bounties/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const db = await getConnection();
    
    // Get active bounties
    const [bounties] = await db.query<RowDataPacket[]>(
      `SELECT db.* 
       FROM data_bounties db
       LEFT JOIN user_bounty_responses ubr ON db.id = ubr.bountyId AND ubr.userId = ?
       WHERE db.status = 'active' 
       AND db.startTime <= NOW() 
       AND db.endTime >= NOW()
       AND ubr.id IS NULL
       ORDER BY db.rewardAmount DESC`,
      [userId]
    );
    
    res.json({ success: true, bounties });
  } catch (error) {
    console.error('[Data Bounties User] Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user bounties' });
  }
});

/**
 * POST /api/gamification/data-bounties/respond
 * Submit response to a data bounty
 */
router.post('/data-bounties/respond', async (req: Request, res: Response) => {
  try {
    const { userId, bountyId, answer } = req.body;
    
    if (!userId || !bountyId || !answer) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    const db = await getConnection();
    
    // Get bounty details
    const [bounties] = await db.query<RowDataPacket[]>(
      `SELECT * FROM data_bounties WHERE id = ? AND status = 'active'`,
      [bountyId]
    );
    
    if (bounties.length === 0) {
      return res.status(404).json({ success: false, error: 'Bounty not found or inactive' });
    }
    
    const bounty = bounties[0];
    
    // Check if bounty is still active
    const now = new Date();
    if (new Date(bounty.endTime) < now) {
      return res.status(400).json({ success: false, error: 'Bounty has expired' });
    }
    
    // Check if user already responded
    const [existing] = await db.query<RowDataPacket[]>(
      `SELECT id FROM user_bounty_responses WHERE userId = ? AND bountyId = ?`,
      [userId, bountyId]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'You have already responded to this bounty' });
    }
    
    // Start transaction
    await db.query('START TRANSACTION');
    
    try {
      // Record response
      await db.query(
        `INSERT INTO user_bounty_responses (bountyId, userId, answer, rewardAwarded)
         VALUES (?, ?, ?, ?)`,
        [bountyId, userId, JSON.stringify(answer), bounty.rewardAmount]
      );
      
      // Update user balance
      await db.query(
        `UPDATE users SET balance = balance + ? WHERE id = ?`,
        [bounty.rewardAmount, userId]
      );
      
      // Update bounty response count
      await db.query(
        `UPDATE data_bounties 
         SET currentResponses = currentResponses + 1,
             status = CASE 
               WHEN currentResponses + 1 >= targetResponses THEN 'completed'
               ELSE status
             END
         WHERE id = ?`,
        [bountyId]
      );
      
      // Record transaction
      await db.query(
        `INSERT INTO transactions (userId, type, amount, description, status)
         VALUES (?, 'bounty_reward', ?, ?, 'completed')`,
        [userId, bounty.rewardAmount, `Data bounty reward: ${bounty.titleEn}`]
      );
      
      await db.query('COMMIT');
      
      // Get updated user balance
      const [users] = await db.query<RowDataPacket[]>(
        `SELECT balance FROM users WHERE id = ?`,
        [userId]
      );
      
      res.json({
        success: true,
        message: 'Bounty response submitted successfully',
        rewardAwarded: bounty.rewardAmount,
        newBalance: users[0].balance
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('[Data Bounty Respond] Error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit bounty response' });
  }
});

export default router;
