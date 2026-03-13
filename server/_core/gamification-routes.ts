import { Router } from 'express';
import { query as mysqlQuery } from './mysql-db';
import * as sdk from './sdk.js';

const router = Router();

// Get all levels
router.get('/api/levels', async (req, res) => {
  try {
    const levels = await mysqlQuery('SELECT * FROM user_levels ORDER BY minTasks ASC');
    res.json({ levels });
  } catch (error) {
    console.error('Error getting levels:', error);
    res.status(500).json({ error: 'Failed to get levels' });
  }
});

// Get user's current level and progress
router.get('/api/levels/my-progress', async (req, res) => {
  try {
    const authUser = await sdk.sdk.authenticateRequest(req);
    if (!authUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = authUser.openId;
    
    const users = await mysqlQuery(
      `SELECT u.*, l.name as levelName, l.badgeIcon, l.color, l.rewardMultiplier, l.minTasks, l.minEarnings
       FROM users u
       JOIN user_levels l ON u.levelId = l.id
       WHERE u.id = ?`,
      [userId]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    
    // Get next level
    const nextLevel = await mysqlQuery(
      'SELECT * FROM user_levels WHERE id > ? ORDER BY id ASC LIMIT 1',
      [user.levelId]
    );

    const progress = nextLevel.length > 0 ? {
      currentTasks: user.completedTasks || 0,
      requiredTasks: nextLevel[0].minTasks,
      currentEarnings: parseFloat(user.totalEarnings) || 0,
      requiredEarnings: parseFloat(nextLevel[0].minEarnings),
      percentage: Math.min(100, Math.max(
        (user.completedTasks / nextLevel[0].minTasks) * 100,
        (parseFloat(user.totalEarnings) / parseFloat(nextLevel[0].minEarnings)) * 100
      ))
    } : null;

    res.json({
      currentLevel: {
        id: user.levelId,
        name: user.levelName,
        icon: user.badgeIcon,
        color: user.color,
        multiplier: parseFloat(user.rewardMultiplier)
      },
      nextLevel: nextLevel.length > 0 ? nextLevel[0] : null,
      progress
    });
  } catch (error) {
    console.error('Error getting level progress:', error);
    res.status(500).json({ error: 'Failed to get level progress' });
  }
});

// Get all badges
router.get('/api/badges', async (req, res) => {
  try {
    const badges = await mysqlQuery('SELECT * FROM badges ORDER BY category, rarity');
    res.json({ badges });
  } catch (error) {
    console.error('Error getting badges:', error);
    res.status(500).json({ error: 'Failed to get badges' });
  }
});

// Get user's badges
router.get('/api/badges/my-badges', async (req, res) => {
  try {
    const authUser = await sdk.sdk.authenticateRequest(req);
    if (!authUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = authUser.openId;
    
    const userBadges = await mysqlQuery(
      `SELECT b.*, ub.earnedAt
       FROM user_badges ub
       JOIN badges b ON ub.badgeId = b.id
       WHERE ub.userId = ?
       ORDER BY ub.earnedAt DESC`,
      [userId]
    );

    res.json({ badges: userBadges });
  } catch (error) {
    console.error('Error getting user badges:', error);
    res.status(500).json({ error: 'Failed to get badges' });
  }
});

// Check and award daily login
router.post('/api/daily-login', async (req, res) => {
  try {
    const authUser = await sdk.sdk.authenticateRequest(req);
    if (!authUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = authUser.openId;
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already logged in today
    const existing = await mysqlQuery(
      'SELECT * FROM daily_logins WHERE userId = ? AND loginDate = ?',
      [userId, today]
    );

    if (existing.length > 0) {
      return res.json({
        alreadyClaimed: true,
        message: 'Daily reward already claimed today'
      });
    }

    // Get user's last login
    const user = await mysqlQuery(
      'SELECT lastLoginDate, currentStreak, longestStreak FROM users WHERE id = ?',
      [userId]
    );

    const userData = user[0];
    const lastLogin = userData.lastLoginDate;
    let currentStreak = userData.currentStreak || 0;
    let longestStreak = userData.longestStreak || 0;

    // Calculate streak
    if (lastLogin) {
      const lastDate = new Date(lastLogin);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        currentStreak += 1;
      } else if (diffDays > 1) {
        // Streak broken
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }

    longestStreak = Math.max(longestStreak, currentStreak);

    // Calculate reward (increases with streak)
    const baseReward = 2.00;
    const streakBonus = Math.min(currentStreak * 0.5, 10); // Max 10 EGP bonus
    const reward = baseReward + streakBonus;

    // Record daily login
    await mysqlQuery(
      'INSERT INTO daily_logins (userId, loginDate, reward, streakDay) VALUES (?, ?, ?, ?)',
      [userId, today, reward, currentStreak]
    );

    // Update user
    await mysqlQuery(
      `UPDATE users 
       SET lastLoginDate = ?,
           currentStreak = ?,
           longestStreak = ?,
           balance = balance + ?,
           totalDailyRewards = totalDailyRewards + ?
       WHERE id = ?`,
      [today, currentStreak, longestStreak, reward, reward, userId]
    );

    // Create transaction
    await mysqlQuery(
      `INSERT INTO transactions (userId, type, amount, description, status)
       VALUES (?, 'earn', ?, ?, 'completed')`,
      [userId, reward, `Daily login reward - Day ${currentStreak}`]
    );

    // Check for streak badges
    if (currentStreak === 7) {
      await awardBadge(userId, 9); // Week Warrior
    }

    res.json({
      success: true,
      reward,
      currentStreak,
      longestStreak,
      message: `Welcome back! Day ${currentStreak} streak - You earned ${reward} EGP`
    });
  } catch (error) {
    console.error('Error recording daily login:', error);
    res.status(500).json({ error: 'Failed to record daily login' });
  }
});

// Helper function to award badge
async function awardBadge(userId: number | string, badgeId: number) {
  try {
    // Check if user already has this badge
    const existing = await mysqlQuery(
      'SELECT * FROM user_badges WHERE userId = ? AND badgeId = ?',
      [userId, badgeId]
    );

    if (existing.length > 0) {
      return false;
    }

    // Award badge
    await mysqlQuery(
      'INSERT INTO user_badges (userId, badgeId) VALUES (?, ?)',
      [userId, badgeId]
    );

    // Get badge reward
    const badge = await mysqlQuery(
      'SELECT rewardAmount FROM badges WHERE id = ?',
      [badgeId]
    );

    if (badge.length > 0 && badge[0].rewardAmount > 0) {
      const reward = parseFloat(badge[0].rewardAmount);
      
      // Add reward to user balance
      await mysqlQuery(
        'UPDATE users SET balance = balance + ? WHERE id = ?',
        [reward, userId]
      );

      // Create transaction
      await mysqlQuery(
        `INSERT INTO transactions (userId, type, amount, description, status)
         VALUES (?, 'earn', ?, 'Badge reward', 'completed')`,
        [userId, reward]
      );
    }

    return true;
  } catch (error) {
    console.error('Error awarding badge:', error);
    return false;
  }
}

// Check and award badges based on user progress
router.post('/api/badges/check-progress', async (req, res) => {
  try {
    const authUser = await sdk.sdk.authenticateRequest(req);
    if (!authUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = authUser.openId;
    
    // Get user stats
    const user = await mysqlQuery(
      'SELECT completedTasks, totalEarnings, totalReferrals FROM users WHERE id = ?',
      [userId]
    );

    if (!user || user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = user[0];
    const newBadges = [];

    // Check task badges
    if (userData.completedTasks >= 1) {
      if (await awardBadge(userId, 1)) newBadges.push('First Steps');
    }
    if (userData.completedTasks >= 10) {
      if (await awardBadge(userId, 2)) newBadges.push('Task Master');
    }
    if (userData.completedTasks >= 100) {
      if (await awardBadge(userId, 3)) newBadges.push('Century Club');
    }

    // Check referral badges
    if (userData.totalReferrals >= 1) {
      if (await awardBadge(userId, 6)) newBadges.push('Referral Starter');
    }
    if (userData.totalReferrals >= 10) {
      if (await awardBadge(userId, 7)) newBadges.push('Influencer');
    }

    res.json({
      success: true,
      newBadges,
      message: newBadges.length > 0 ? `Congratulations! You earned ${newBadges.length} new badge(s)!` : 'No new badges yet'
    });
  } catch (error) {
    console.error('Error checking badge progress:', error);
    res.status(500).json({ error: 'Failed to check badge progress' });
  }
});

export default router;
