import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { Router } from 'express';
import { query } from '../_core/mysql-db';
import { sdk } from './sdk';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for avatar upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = '/var/www/taskkash/dist/public/uploads/avatars';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const router = Router();

// POST /api/profile/complete - Complete profile and credit reward
router.post('/complete', async (req, res) => {
  try {
    // Authenticate user using SDK
    const authUser = await sdk.authenticateRequest(req);
    if (!authUser || !authUser.openId) {
      console.log('[Profile] Authentication failed');
      return res.status(401).json({
        error: 'Unauthorized',
        details: 'Please login again.'
      });
    }

    const openId = authUser.openId;

    const { maritalStatus, carType, housingType } = req.body;

    console.log('[Profile] Completing profile for user:', openId);
    console.log('[Profile] Lifestyle data:', { maritalStatus, carType, housingType });

    // Get current user
    const users = await query(
      'SELECT id, balance, profileStrength FROM users WHERE openId = ?',
      [openId]
    ) as any[];

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Check if profile already completed
    if (user.profileStrength >= 100) {
      return res.status(409).json({ error: 'Profile already completed' });
    }

    // Profile completion reward
    const PROFILE_REWARD = 8.00;
    const newBalance = parseFloat(user.balance) + PROFILE_REWARD;

    // Update user profile strength and balance
    await query(
      'UPDATE users SET profileStrength = 100, balance = ? WHERE id = ?',
      [newBalance, user.id]
    );

    // Create transaction record using correct schema columns
    await query(
      `INSERT INTO transactions (userId, type, currency, amount, description, status, createdAt) 
       VALUES (?, 'earning', 'EGP', ?, 'Profile completion reward', 'completed', NOW())`,
      [user.id, PROFILE_REWARD]
    );

    console.log('[Profile] Profile completed successfully');
    console.log('[Profile] Credited:', PROFILE_REWARD, 'EGP');
    console.log('[Profile] New balance:', newBalance, 'EGP');

    res.json({
      success: true,
      reward: PROFILE_REWARD,
      newBalance: newBalance,
      profileStrength: 100
    });
  } catch (error) {
    console.error('[Profile] Error completing profile:', error);
    res.status(500).json({ error: 'Failed to complete profile' });
  }
});

// PUT /api/profile/update - Update profile data
router.put('/update', async (req, res) => {
  try {
    // Authenticate user using SDK
    const authUser = await sdk.authenticateRequest(req);
    if (!authUser || !authUser.openId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const openId = authUser.openId;

    const { name, phone, email } = req.body;

    console.log('[Profile] Updating profile for user:', openId);

    // Get current user
    const users = await query(
      'SELECT id FROM users WHERE openId = ?',
      [openId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Update user profile
    await query(
      'UPDATE users SET name = ?, phone = ?, email = ?, updatedAt = NOW() WHERE id = ?',
      [name, phone, email, user.id]
    );

    console.log('[Profile] Profile updated successfully');

    res.json({
      success: true
    });
  } catch (error) {
    console.error('[Profile] Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * GET /api/profile/questions/:sectionKey
 * Get profile questions for a specific section
 */
router.get('/questions/:sectionKey', async (req, res) => {
  try {
    const { sectionKey } = req.params;

    // Get section info
    const sections = await query(
      'SELECT * FROM profile_sections WHERE sectionKey = ? AND isActive = 1',
      [sectionKey]
    );

    if (sections.length === 0) {
      return res.status(404).json({ error: 'Section not found' });
    }

    const section = sections[0];

    // Parse required fields (questions)
    const questions = JSON.parse(section.requiredFields);

    res.json({
      section: {
        key: section.sectionKey,
        nameEn: section.nameEn,
        nameAr: section.nameAr,
        descriptionEn: section.descriptionEn,
        descriptionAr: section.descriptionAr,
        bonusAmount: section.bonusAmount,
        multiplierBonus: section.multiplierBonus
      },
      questions
    });
  } catch (error) {
    console.error('[Profile Routes] Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

/**
 * GET /api/profile/sections
 * Get all profile sections with completion status for current user
 */
router.get('/sections', async (req, res) => {
  try {
    let userId = null;
    try {
      const authUser = await sdk.authenticateRequest(req);
      if (authUser?.openId) {
        const users = await query('SELECT id FROM users WHERE openId = ?', [authUser.openId]);
        userId = users[0]?.id || null;
      }
    } catch (authError) {
      // User not logged in, continue without userId
      console.log('[Profile Routes] User not authenticated, showing sections without completion status');
    }

    // Get all active sections
    const sections = await query(
      'SELECT * FROM profile_sections WHERE isActive = 1 ORDER BY displayOrder'
    );

    // If user is logged in, get their completion status
    let completedSections: any[] = [];
    if (userId) {
      completedSections = await query(
        'SELECT sectionKey, completedAt, bonusAwarded, multiplierAwarded FROM user_profile_completions WHERE userId = ?',
        [userId]
      );
    }

    const completedKeys = completedSections.map((c: any) => c.sectionKey);

    const sectionsWithStatus = sections.map((section: any) => {
      const isCompleted = completedKeys.includes(section.sectionKey);
      const completion = completedSections.find((c: any) => c.sectionKey === section.sectionKey);

      return {
        key: section.sectionKey,
        nameEn: section.nameEn,
        nameAr: section.nameAr,
        descriptionEn: section.descriptionEn,
        descriptionAr: section.descriptionAr,
        bonusAmount: section.bonusAmount,
        multiplierBonus: section.multiplierBonus,
        displayOrder: section.displayOrder,
        isCompleted,
        completedAt: completion?.completedAt || null,
        bonusAwarded: completion?.bonusAwarded || null
      };
    });

    res.json({ sections: sectionsWithStatus });
  } catch (error) {
    console.error('[Profile Routes] Error fetching sections:', error);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

/**
 * POST /api/profile/answers
 * Submit answers for a profile section
 */
router.post('/answers', async (req, res) => {
  try {
    const authUser = await sdk.authenticateRequest(req);
    if (!authUser || !authUser.openId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const users = await query('SELECT id, tier FROM users WHERE openId = ?', [authUser.openId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = users[0].id;
    const { sectionKey, answers } = req.body;

    if (!sectionKey || !answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // Get section info
    const sections = await query(
      'SELECT * FROM profile_sections WHERE sectionKey = ? AND isActive = 1',
      [sectionKey]
    );

    if (sections.length === 0) {
      return res.status(404).json({ error: 'Section not found' });
    }

    const section = sections[0];

    // Check if already completed
    const existingCompletion = await query(
      'SELECT * FROM user_profile_completions WHERE userId = ? AND sectionKey = ?',
      [userId, sectionKey]
    );

    if (existingCompletion.length > 0) {
      return res.status(400).json({ error: 'Section already completed' });
    }

    // Save answers
    for (const [questionKey, answerValue] of Object.entries(answers)) {
      await query(
        `INSERT INTO user_profile_data (userId, questionKey, answerValue)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE answerValue = VALUES(answerValue), updatedAt = CURRENT_TIMESTAMP`,
        [userId, questionKey, JSON.stringify(answerValue)]
      );
    }

    // Mark section as completed
    await query(
      'INSERT INTO user_profile_completions (userId, sectionKey, bonusAwarded, multiplierAwarded) VALUES (?, ?, ?, ?)',
      [userId, sectionKey, section.bonusAmount, section.multiplierBonus]
    );

    // Get user balance before crediting
    const userBefore = await query("SELECT balance FROM users WHERE id = ?", [userId]) as any[];
    const balanceBefore = userBefore[0]?.balance || 0;
    const balanceAfter = parseFloat(balanceBefore) + parseFloat(section.bonusAmount);

    // Award bonus to user wallet
    await query(
      "UPDATE users SET balance = balance + ? WHERE id = ?",
      [section.bonusAmount, userId]
    );
    // Record transaction using correct schema columns
    await query(
      `INSERT INTO transactions (userId, type, currency, amount, description, status, createdAt)
       VALUES (?, 'earning', 'EGP', ?, ?, 'completed', NOW())`,
      [userId, section.bonusAmount, `Profile completion bonus: ${section.nameEn}`]
    );
    // Calculate new tier
    const completedCount = await query(
      'SELECT COUNT(*) as count FROM user_profile_completions WHERE userId = ?',
      [userId]
    );

    const totalSections = await query(
      'SELECT COUNT(*) as count FROM profile_sections WHERE isActive = 1'
    );

    const completionPercentage = (completedCount[0].count / totalSections[0].count) * 100;

    // Update user tier based on completion
    let newTier = 'tier1';
    if (completionPercentage >= 80) {
      newTier = 'tier7';
    } else if (completionPercentage >= 70) {
      newTier = 'tier6';
    } else if (completionPercentage >= 60) {
      newTier = 'tier5';
    } else if (completionPercentage >= 45) {
      newTier = 'tier4';
    } else if (completionPercentage >= 30) {
      newTier = 'tier3';
    } else if (completionPercentage >= 15) {
      newTier = 'tier2';
    }

    const tierChanged = users[0].tier !== newTier;

    if (tierChanged) {
      await query('UPDATE users SET tier = ? WHERE id = ?', [newTier, userId]);
    }

    res.json({
      success: true,
      bonusAwarded: section.bonusAmount,
      multiplierAwarded: section.multiplierBonus,
      tierChanged,
      newTier: tierChanged ? newTier : undefined,
      completionPercentage: Math.round(completionPercentage)
    });
  } catch (error) {
    console.error('[Profile Routes] Error submitting answers:', error);
    res.status(500).json({ error: 'Failed to submit answers' });
  }
});

/**
 * GET /api/profile/progress
 * Get user's profile completion progress
 */
router.get('/progress', async (req, res) => {
  try {
    const authUser = await sdk.authenticateRequest(req);
    if (!authUser || !authUser.openId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const users = await query('SELECT id, tier FROM users WHERE openId = ?', [authUser.openId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = users[0].id;

    const completedCount = await query(
      'SELECT COUNT(*) as count FROM user_profile_completions WHERE userId = ?',
      [userId]
    );

    const totalSections = await query(
      'SELECT COUNT(*) as count FROM profile_sections WHERE isActive = 1'
    );

    const completionPercentage = (completedCount[0].count / totalSections[0].count) * 100;

    // Calculate total bonus earned
    const totalBonus = await query(
      'SELECT SUM(bonusAwarded) as total FROM user_profile_completions WHERE userId = ?',
      [userId]
    );

    res.json({
      currentTier: users[0].tier,
      completedSections: completedCount[0].count,
      totalSections: totalSections[0].count,
      completionPercentage: Math.round(completionPercentage),
      totalBonusEarned: totalBonus[0].total || 0
    });
  } catch (error) {
    console.error('[Profile Routes] Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

/**
 * POST /api/profile/avatar
 * Upload profile avatar
 */
router.post("/avatar", upload.single("avatar"), async (req, res) => {
  console.log("[Avatar Upload] Request received");
  console.log("[Avatar Upload] Cookies:", req.headers.cookie ? "present" : "missing");
  console.log("[Avatar Upload] File:", req.file ? req.file.filename : "no file");
  try {
    const authUser = await sdk.authenticateRequest(req);
    if (!authUser || !authUser.openId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const users = await query('SELECT id, avatar FROM users WHERE openId = ?', [authUser.openId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Delete old avatar if exists
    if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
      const oldAvatarPath = path.join('/var/www/taskkash/dist/public', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Update user avatar in database
    await query(
      'UPDATE users SET avatar = ?, updatedAt = NOW() WHERE id = ?',
      [avatarUrl, user.id]
    );

    console.log('[Profile] Avatar updated successfully for user:', authUser.openId);

    res.json({
      success: true,
      avatarUrl
    });
  } catch (error) {
    console.error('[Profile] Error uploading avatar:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

export default router;
