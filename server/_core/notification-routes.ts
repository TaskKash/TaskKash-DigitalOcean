/**
 * Notification Routes
 * API endpoints for user notifications
 */

import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { notifications } from '../../drizzle/schema';
import { eq, desc, and } from 'drizzle-orm';
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
    req.user = user;
    next();
  } catch (error) {
    console.error('[isUser] Authentication error:', error);
    return res.status(401).json({ error: 'User login required' });
  }
}

/**
 * Get all notifications for the current user
 * GET /api/notifications
 */
router.get('/', isUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }

    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));

    // Transform to match frontend interface
    const transformedNotifications = userNotifications.map(n => ({
      id: n.id.toString(),
      title: n.titleEn, // Will be replaced by frontend based on language
      titleAr: n.titleAr,
      titleEn: n.titleEn,
      message: n.messageEn, // Will be replaced by frontend based on language
      messageAr: n.messageAr,
      messageEn: n.messageEn,
      date: n.createdAt.toISOString(),
      read: n.isRead === 1,
      type: n.type,
      actionUrl: n.actionUrl || undefined,
    }));

    res.json({ notifications: transformedNotifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * Mark a notification as read
 * PUT /api/notifications/:id/read
 */
router.put('/:id/read', isUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const notificationId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (isNaN(notificationId)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }

    await db
      .update(notifications)
      .set({ isRead: 1 })
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ));

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 */
router.put('/read-all', isUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }

    await db
      .update(notifications)
      .set({ isRead: 1 })
      .where(eq(notifications.userId, userId));

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

/**
 * Get unread notification count
 * GET /api/notifications/unread-count
 */
router.get('/unread-count', isUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }

    const unreadNotifications = await db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, 0)
      ));

    res.json({ count: unreadNotifications.length });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

export default router;
