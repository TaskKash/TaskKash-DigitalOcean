import { Router, Request, Response } from 'express';
import { getDb } from './db';
import { eq, and, desc, sql, gte, lte, inArray } from 'drizzle-orm';

const router = Router();

// ============================================
// CAMPAIGN MANAGEMENT ENDPOINTS
// ============================================

/**
 * GET /api/campaigns - Get all active campaigns
 */
router.get('/campaigns', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }

    const userId = (req as any).user?.id;
    const countryId = req.query.countryId ? parseInt(req.query.countryId as string) : 1;

    // Get all active campaigns
    const campaigns = await db.execute(sql`
      SELECT 
        c.*,
        a.nameEn as advertiserName,
        a.nameAr as advertiserNameAr,
        a.logo as advertiserLogo,
        (SELECT COUNT(*) FROM campaignTasks WHERE campaignId = c.id) as totalTasks,
        (SELECT COUNT(*) FROM userCampaignProgress WHERE campaignId = c.id AND status = 'completed') as completions
      FROM campaigns c
      LEFT JOIN advertisers a ON c.advertiserId = a.id
      WHERE c.status = 'active' 
        AND c.countryId = ${countryId}
        AND (c.launchDate IS NULL OR c.launchDate <= NOW())
        AND (c.expiryDate IS NULL OR c.expiryDate >= NOW())
      ORDER BY c.createdAt DESC
    `);

    // If user is logged in, get their progress for each campaign
    let userProgress: any[] = [];
    if (userId) {
      const progressResult = await db.execute(sql`
        SELECT campaignId, status, tasksCompleted, totalTasks, currentSequence
        FROM userCampaignProgress
        WHERE userId = ${userId}
      `);
      userProgress = progressResult[0] as any;
    }

    // Merge user progress with campaigns
    const campaignsWithProgress = (campaigns[0] as any).map((campaign: any) => {
      const progress = userProgress.find((p: any) => p.campaignId === campaign.id);
      return {
        ...campaign,
        userProgress: progress || null
      };
    });

    res.json(campaignsWithProgress);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

/**
 * GET /api/campaigns/:id - Get a single campaign with full details
 */
router.get('/campaigns/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }

    const campaignId = parseInt(req.params.id);
    const userId = (req as any).user?.id;

    // Get campaign details
    const campaignResult = await db.execute(sql`
      SELECT 
        c.*,
        a.nameEn as advertiserName,
        a.nameAr as advertiserNameAr,
        a.logo as advertiserLogo,
        a.descriptionEn as advertiserDescription,
        a.descriptionAr as advertiserDescriptionAr
      FROM campaigns c
      LEFT JOIN advertisers a ON c.advertiserId = a.id
      WHERE c.id = ${campaignId}
    `);

    if ((campaignResult[0] as any).length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaign = (campaignResult[0] as any)[0];

    // Get campaign tasks in sequence order
    const tasksResult = await db.execute(sql`
      SELECT 
        ct.id as campaignTaskId,
        ct.sequence,
        ct.gatingRules,
        ct.isRequired,
        t.*
      FROM campaignTasks ct
      JOIN tasks t ON ct.taskId = t.id
      WHERE ct.campaignId = ${campaignId}
      ORDER BY ct.sequence ASC
    `);

    // Get campaign personas
    const personasResult = await db.execute(sql`
      SELECT * FROM campaignPersonas
      WHERE campaignId = ${campaignId}
    `);

    // Get campaign qualifications
    const qualificationsResult = await db.execute(sql`
      SELECT * FROM campaignQualifications
      WHERE campaignId = ${campaignId}
    `);

    // Get user progress if logged in
    let userProgress = null;
    if (userId) {
      const progressResult = await db.execute(sql`
        SELECT * FROM userCampaignProgress
        WHERE userId = ${userId} AND campaignId = ${campaignId}
      `);
      if ((progressResult[0] as any).length > 0) {
        userProgress = (progressResult[0] as any)[0];
      }
    }

    res.json({
      ...campaign,
      tasks: tasksResult[0],
      personas: personasResult[0],
      qualifications: qualificationsResult[0],
      userProgress
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

/**
 * POST /api/campaigns/:id/start - Start a campaign for the current user
 */
router.post('/campaigns/:id/start', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }

    const campaignId = parseInt(req.params.id);
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user already started this campaign
    const existingProgress = await db.execute(sql`
      SELECT * FROM userCampaignProgress
      WHERE userId = ${userId} AND campaignId = ${campaignId}
    `);

    if ((existingProgress[0] as any).length > 0) {
      const progress = (existingProgress[0] as any)[0];
      if (progress.status === 'completed') {
        return res.status(400).json({ error: 'You have already completed this campaign' });
      }
      if (progress.status === 'disqualified') {
        return res.status(400).json({ error: 'You are not eligible for this campaign', reason: progress.disqualificationReason });
      }
      // Return existing progress
      return res.json({ message: 'Campaign already started', progress });
    }

    // Get campaign details
    const campaignResult = await db.execute(sql`
      SELECT * FROM campaigns WHERE id = ${campaignId} AND status = 'active'
    `);

    if ((campaignResult[0] as any).length === 0) {
      return res.status(404).json({ error: 'Campaign not found or not active' });
    }

    const campaign = (campaignResult[0] as any)[0];

    // Check user qualification
    const qualificationResult = await checkUserQualification(db, userId, campaignId);
    if (!qualificationResult.qualified) {
      // Log disqualification
      await db.execute(sql`
        INSERT INTO userJourneyLogs (userId, campaignId, eventType, eventData)
        VALUES (${userId}, ${campaignId}, 'disqualified', ${JSON.stringify({ reason: qualificationResult.reason })})
      `);

      return res.status(400).json({ 
        error: 'You are not eligible for this campaign', 
        reason: qualificationResult.reason 
      });
    }

    // Get total tasks count
    const tasksCountResult = await db.execute(sql`
      SELECT COUNT(*) as count FROM campaignTasks WHERE campaignId = ${campaignId}
    `);
    const totalTasks = (tasksCountResult[0] as any)[0].count;

    // Get first task
    const firstTaskResult = await db.execute(sql`
      SELECT ct.*, t.* FROM campaignTasks ct
      JOIN tasks t ON ct.taskId = t.id
      WHERE ct.campaignId = ${campaignId}
      ORDER BY ct.sequence ASC
      LIMIT 1
    `);

    if ((firstTaskResult[0] as any).length === 0) {
      return res.status(400).json({ error: 'Campaign has no tasks' });
    }

    const firstTask = (firstTaskResult[0] as any)[0];

    // Assign persona to user (if personas exist)
    let personaId = null;
    const personasResult = await db.execute(sql`
      SELECT * FROM campaignPersonas WHERE campaignId = ${campaignId}
    `);
    if ((personasResult[0] as any).length > 0) {
      // For now, assign the first persona. In production, this would use targeting criteria
      personaId = (personasResult[0] as any)[0].id;
    }

    // Create user campaign progress
    await db.execute(sql`
      INSERT INTO userCampaignProgress 
      (userId, campaignId, personaId, currentTaskId, currentSequence, status, tasksCompleted, totalTasks)
      VALUES (${userId}, ${campaignId}, ${personaId}, ${firstTask.taskId}, 1, 'in_progress', 0, ${totalTasks})
    `);

    // Log campaign start
    await db.execute(sql`
      INSERT INTO userJourneyLogs (userId, campaignId, eventType, eventData)
      VALUES (${userId}, ${campaignId}, 'campaign_started', ${JSON.stringify({ personaId })})
    `);

    // Update campaign statistics
    await db.execute(sql`
      UPDATE campaigns SET totalParticipants = totalParticipants + 1 WHERE id = ${campaignId}
    `);

    res.json({
      message: 'Campaign started successfully',
      currentTask: firstTask,
      totalTasks,
      personaId
    });
  } catch (error) {
    console.error('Error starting campaign:', error);
    res.status(500).json({ error: 'Failed to start campaign' });
  }
});

/**
 * POST /api/campaigns/:id/complete-task - Complete the current task and advance
 */
router.post('/campaigns/:id/complete-task', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }

    const campaignId = parseInt(req.params.id);
    const userId = (req as any).user?.id;
    const { taskData } = req.body; // Task-specific completion data

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user's current progress
    const progressResult = await db.execute(sql`
      SELECT * FROM userCampaignProgress
      WHERE userId = ${userId} AND campaignId = ${campaignId}
    `);

    if ((progressResult[0] as any).length === 0) {
      return res.status(400).json({ error: 'You have not started this campaign' });
    }

    const progress = (progressResult[0] as any)[0];

    if (progress.status !== 'in_progress') {
      return res.status(400).json({ error: 'Campaign is not in progress' });
    }

    // Get current task details
    const currentTaskResult = await db.execute(sql`
      SELECT ct.*, t.* FROM campaignTasks ct
      JOIN tasks t ON ct.taskId = t.id
      WHERE ct.campaignId = ${campaignId} AND ct.sequence = ${progress.currentSequence}
    `);

    if ((currentTaskResult[0] as any).length === 0) {
      return res.status(400).json({ error: 'Current task not found' });
    }

    const currentTask = (currentTaskResult[0] as any)[0];

    // Validate task completion based on gating rules
    const validationResult = validateTaskCompletion(currentTask, taskData);
    if (!validationResult.valid) {
      // Log failed attempt
      await db.execute(sql`
        INSERT INTO userJourneyLogs (userId, campaignId, taskId, eventType, eventData)
        VALUES (${userId}, ${campaignId}, ${currentTask.taskId}, 'task_failed', ${JSON.stringify({ reason: validationResult.reason, taskData })})
      `);

      // Check if this is a disqualifying failure (e.g., anti-incentive gate)
      if (validationResult.disqualify) {
        await db.execute(sql`
          UPDATE userCampaignProgress 
          SET status = 'disqualified', disqualificationReason = ${validationResult.reason}
          WHERE userId = ${userId} AND campaignId = ${campaignId}
        `);

        await db.execute(sql`
          UPDATE campaigns SET disqualifiedParticipants = disqualifiedParticipants + 1 WHERE id = ${campaignId}
        `);

        return res.status(400).json({ 
          error: 'You have been disqualified from this campaign', 
          reason: validationResult.reason 
        });
      }

      return res.status(400).json({ error: 'Task not completed correctly', reason: validationResult.reason });
    }

    // Log task completion
    await db.execute(sql`
      INSERT INTO userJourneyLogs (userId, campaignId, taskId, eventType, eventData)
      VALUES (${userId}, ${campaignId}, ${currentTask.taskId}, 'task_completed', ${JSON.stringify(taskData)})
    `);

    // Check if this is the last task
    const nextTaskResult = await db.execute(sql`
      SELECT ct.*, t.* FROM campaignTasks ct
      JOIN tasks t ON ct.taskId = t.id
      WHERE ct.campaignId = ${campaignId} AND ct.sequence = ${progress.currentSequence + 1}
    `);

    if ((nextTaskResult[0] as any).length === 0) {
      // Campaign completed!
      await db.execute(sql`
        UPDATE userCampaignProgress 
        SET status = 'completed', 
            tasksCompleted = tasksCompleted + 1,
            completedAt = NOW()
        WHERE userId = ${userId} AND campaignId = ${campaignId}
      `);

      // Get campaign reward
      const campaignResult = await db.execute(sql`
        SELECT reward FROM campaigns WHERE id = ${campaignId}
      `);
      const reward = (campaignResult[0] as any)[0].reward;

      // Add reward to user's balance
      await db.execute(sql`
        UPDATE users SET balance = balance + ${reward}, totalEarnings = totalEarnings + ${reward}
        WHERE id = ${userId}
      `);

      // Create transaction record
      await db.execute(sql`
        INSERT INTO transactions (userId, type, amount, currency, status, campaignId, description)
        VALUES (${userId}, 'earning', ${reward}, 'EGP', 'completed', ${campaignId}, 'Campaign completion reward')
      `);

      // Update campaign statistics
      await db.execute(sql`
        UPDATE campaigns SET completedParticipants = completedParticipants + 1 WHERE id = ${campaignId}
      `);

      // Log campaign completion
      await db.execute(sql`
        INSERT INTO userJourneyLogs (userId, campaignId, eventType, eventData)
        VALUES (${userId}, ${campaignId}, 'campaign_completed', ${JSON.stringify({ reward })})
      `);

      return res.json({
        message: 'Congratulations! Campaign completed!',
        completed: true,
        reward
      });
    }

    // Advance to next task
    const nextTask = (nextTaskResult[0] as any)[0];
    await db.execute(sql`
      UPDATE userCampaignProgress 
      SET currentTaskId = ${nextTask.taskId},
          currentSequence = ${progress.currentSequence + 1},
          tasksCompleted = tasksCompleted + 1
      WHERE userId = ${userId} AND campaignId = ${campaignId}
    `);

    res.json({
      message: 'Task completed! Proceeding to next task.',
      completed: false,
      nextTask,
      tasksCompleted: progress.tasksCompleted + 1,
      totalTasks: progress.totalTasks
    });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

/**
 * GET /api/campaigns/:id/progress - Get user's progress in a campaign
 */
router.get('/campaigns/:id/progress', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }

    const campaignId = parseInt(req.params.id);
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const progressResult = await db.execute(sql`
      SELECT 
        ucp.*,
        t.titleEn as currentTaskTitle,
        t.titleAr as currentTaskTitleAr,
        t.type as currentTaskType
      FROM userCampaignProgress ucp
      LEFT JOIN tasks t ON ucp.currentTaskId = t.id
      WHERE ucp.userId = ${userId} AND ucp.campaignId = ${campaignId}
    `);

    if ((progressResult[0] as any).length === 0) {
      return res.json({ started: false });
    }

    const progress = (progressResult[0] as any)[0];

    // Get journey logs
    const logsResult = await db.execute(sql`
      SELECT * FROM userJourneyLogs
      WHERE userId = ${userId} AND campaignId = ${campaignId}
      ORDER BY createdAt ASC
    `);

    res.json({
      started: true,
      ...progress,
      journeyLogs: logsResult[0]
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if a user is qualified for a campaign
 */
async function checkUserQualification(db: any, userId: number, campaignId: number): Promise<{ qualified: boolean; reason?: string }> {
  // Get user details
  const userResult = await db.execute(sql`
    SELECT * FROM users WHERE id = ${userId}
  `);

  if ((userResult[0] as any).length === 0) {
    return { qualified: false, reason: 'User not found' };
  }

  const user = (userResult[0] as any)[0];

  // Get campaign qualifications
  const qualificationsResult = await db.execute(sql`
    SELECT * FROM campaignQualifications WHERE campaignId = ${campaignId}
  `);

  const qualifications = qualificationsResult[0] as any;

  for (const qual of qualifications) {
    const userValue = user[qual.criteriaKey];
    const qualValue = qual.value;

    switch (qual.operator) {
      case '=':
        if (userValue != qualValue) {
          return { qualified: false, reason: `Does not meet ${qual.criteriaKey} requirement` };
        }
        break;
      case '!=':
        if (userValue == qualValue) {
          return { qualified: false, reason: `Does not meet ${qual.criteriaKey} requirement` };
        }
        break;
      case '>':
        if (!(userValue > parseFloat(qualValue))) {
          return { qualified: false, reason: `Does not meet ${qual.criteriaKey} requirement` };
        }
        break;
      case '<':
        if (!(userValue < parseFloat(qualValue))) {
          return { qualified: false, reason: `Does not meet ${qual.criteriaKey} requirement` };
        }
        break;
      case '>=':
        if (!(userValue >= parseFloat(qualValue))) {
          return { qualified: false, reason: `Does not meet ${qual.criteriaKey} requirement` };
        }
        break;
      case '<=':
        if (!(userValue <= parseFloat(qualValue))) {
          return { qualified: false, reason: `Does not meet ${qual.criteriaKey} requirement` };
        }
        break;
      case 'in':
        const inValues = JSON.parse(qualValue);
        if (!inValues.includes(userValue)) {
          return { qualified: false, reason: `Does not meet ${qual.criteriaKey} requirement` };
        }
        break;
      case 'not_in':
        const notInValues = JSON.parse(qualValue);
        if (notInValues.includes(userValue)) {
          return { qualified: false, reason: `Does not meet ${qual.criteriaKey} requirement` };
        }
        break;
    }
  }

  return { qualified: true };
}

/**
 * Validate task completion based on gating rules
 */
function validateTaskCompletion(task: any, taskData: any): { valid: boolean; reason?: string; disqualify?: boolean } {
  const gatingRules = task.gatingRules ? JSON.parse(task.gatingRules) : {};

  switch (task.type) {
    case 'video':
      // Check video completion percentage
      const minCompletion = gatingRules.minCompletion || 70;
      if (!taskData?.completionPercentage || taskData.completionPercentage < minCompletion) {
        return { valid: false, reason: `Video must be watched at least ${minCompletion}%` };
      }
      break;

    case 'survey':
      // Check all required questions are answered
      if (!taskData?.answers || Object.keys(taskData.answers).length === 0) {
        return { valid: false, reason: 'All survey questions must be answered' };
      }
      // Check for disqualifying answers (e.g., financial filter)
      if (gatingRules.disqualifyingAnswers) {
        for (const [questionId, disqualifyingValues] of Object.entries(gatingRules.disqualifyingAnswers)) {
          if ((disqualifyingValues as any).includes(taskData.answers[questionId])) {
            return { valid: false, reason: 'You do not meet the requirements for this campaign', disqualify: true };
          }
        }
      }
      break;

    case 'quiz':
      // Check minimum score
      const minScore = gatingRules.minScore || 70;
      if (!taskData?.score || taskData.score < minScore) {
        return { valid: false, reason: `Minimum score of ${minScore}% required` };
      }
      break;

    case 'visit':
      // Check visit duration
      const minDuration = gatingRules.minDuration || 30;
      if (!taskData?.duration || taskData.duration < minDuration) {
        return { valid: false, reason: `Visit must be at least ${minDuration} minutes` };
      }
      // Check GPS verification
      if (gatingRules.requireGps && !taskData?.gpsVerified) {
        return { valid: false, reason: 'GPS verification required' };
      }
      break;

    default:
      // For other task types, just check if taskData exists
      if (!taskData) {
        return { valid: false, reason: 'Task data required' };
      }
  }

  // Check anti-incentive gate
  if (gatingRules.antiIncentiveGate && taskData?.answer === 'no') {
    return { valid: false, reason: 'Thank you for your honesty. This campaign is for users genuinely interested in the product.', disqualify: true };
  }

  return { valid: true };
}

export default router;
