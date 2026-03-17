/**
 * Dispute & Rating Routes
 * - POST /api/disputes - Create a dispute
 * - GET  /api/disputes - Get user's disputes
 * - POST /api/ratings  - Rate a task/completion
 * Admin:
 * - GET  /api/admin/disputes - Get all disputes
 * - POST /api/admin/disputes/:id/resolve - Resolve a dispute
 */

import { Router, Request, Response } from 'express';
import { query as mysqlQuery } from './mysql-db';
import { sdk } from './sdk';

const router = Router();

// Auth middleware for users
async function isUser(req: any, res: any, next: any) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user || !user.id) return res.status(401).json({ error: 'Login required' });
    req.userId = user.id;
    req.user = user;
    next();
  } catch { return res.status(401).json({ error: 'Login required' }); }
}

// ==================== RATINGS ====================

/**
 * POST /api/ratings
 * Rate a completed task
 */
router.post('/ratings', isUser, async (req: Request, res: Response) => {
  try {
    const { taskCompletionId, campaignId, targetId, targetType, rating, comment } = req.body;
    const userId = (req as any).userId;

    if (!taskCompletionId || !campaignId || !rating) {
      return res.status(400).json({ error: 'taskCompletionId, campaignId, and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check for duplicate rating
    const existing = await mysqlQuery(
      'SELECT id FROM task_ratings WHERE taskCompletionId = ? AND raterId = ?',
      [taskCompletionId, userId]
    ) as any;

    if (existing.length > 0) {
      return res.status(400).json({ error: 'You have already rated this task' });
    }

    await mysqlQuery(`
      INSERT INTO task_ratings (taskCompletionId, campaignId, raterId, raterType, targetId, targetType, rating, comment)
      VALUES (?, ?, ?, 'user', ?, ?, ?, ?)
    `, [taskCompletionId, campaignId, userId, targetId || campaignId, targetType || 'task', rating, comment || null]);

    res.json({ success: true, message: 'Rating submitted' });
  } catch (error: any) {
    console.error('Error creating rating:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ratings/campaign/:id
 * Get average rating for a campaign
 */
router.get('/ratings/campaign/:id', async (req: Request, res: Response) => {
  try {
    const campaignId = parseInt(req.params.id);
    const result = await mysqlQuery(
      'SELECT AVG(rating) as avgRating, COUNT(*) as totalRatings FROM task_ratings WHERE campaignId = ?',
      [campaignId]
    ) as any;

    res.json({
      avgRating: result[0]?.avgRating ? parseFloat(result[0].avgRating).toFixed(1) : null,
      totalRatings: result[0]?.totalRatings || 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== DISPUTES ====================

/**
 * POST /api/disputes
 * Create a dispute for a rejected task
 */
router.post('/disputes', isUser, async (req: Request, res: Response) => {
  try {
    const { taskCompletionId, campaignId, advertiserId, reason, evidence } = req.body;
    const userId = (req as any).userId;

    if (!taskCompletionId || !campaignId || !reason) {
      return res.status(400).json({ error: 'taskCompletionId, campaignId, and reason are required' });
    }

    // Check for duplicate dispute
    const existing = await mysqlQuery(
      'SELECT id FROM disputes WHERE taskCompletionId = ? AND userId = ?',
      [taskCompletionId, userId]
    ) as any;

    if (existing.length > 0) {
      return res.status(400).json({ error: 'A dispute already exists for this task' });
    }

    const result = await mysqlQuery(`
      INSERT INTO disputes (taskCompletionId, campaignId, userId, advertiserId, reason, evidence, status)
      VALUES (?, ?, ?, ?, ?, ?, 'open')
    `, [taskCompletionId, campaignId, userId, advertiserId || 0, reason, evidence || null]) as any;

    res.json({ success: true, disputeId: result.insertId, message: 'Dispute submitted' });
  } catch (error: any) {
    console.error('Error creating dispute:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/disputes
 * Get user's disputes
 */
router.get('/disputes', isUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const disputes = await mysqlQuery(`
      SELECT d.*, c.nameEn as campaignName, c.nameAr as campaignNameAr
      FROM disputes d
      LEFT JOIN campaigns c ON d.campaignId = c.id
      WHERE d.userId = ?
      ORDER BY d.createdAt DESC
    `, [userId]) as any;

    res.json({ disputes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
