import { Router, Request, Response } from 'express';
import { query } from './mysql-db';

const router = Router();

/**
 * GET /api/advertisers - Get all advertisers
 */
router.get('/advertisers', async (req: Request, res: Response) => {
  try {
    const advertisers = await query(
      `SELECT id, nameEn, nameAr, slug, logoUrl, descriptionEn, descriptionAr, isActive
       FROM advertisers
       WHERE isActive = 1
       ORDER BY nameEn`
    );
    res.json(advertisers);
  } catch (error) {
    console.error('Error fetching advertisers:', error);
    res.status(500).json({ error: 'Failed to fetch advertisers' });
  }
});

/**
 * GET /api/advertisers/with-active-tasks - Get advertisers with active tasks
 */
router.get("/advertisers/with-active-tasks", async (req: Request, res: Response) => {
  try {
    const advertisers = await query(`
      SELECT DISTINCT 
        a.id, 
        a.nameEn, 
        a.nameAr,
        a.logoUrl,
        COUNT(t.id) as activeTaskCount
      FROM advertisers a
      INNER JOIN tasks t ON a.id = t.advertiserId
      WHERE t.status IN ('available', 'active', 'published')
      GROUP BY a.id, a.nameEn, a.nameAr, a.logoUrl
      ORDER BY activeTaskCount DESC
    `);

    res.json({ advertisers });
  } catch (error: any) {
    console.error("[Advertisers] Error fetching advertisers with active tasks:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/advertisers/:slug - Get advertiser by slug
 */
router.get('/advertisers/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const advertisers = await query(
      `SELECT * FROM advertisers WHERE slug = ? LIMIT 1`,
      [slug]
    );

    if (!advertisers || advertisers.length === 0) {
      return res.status(404).json({ error: 'Advertiser not found' });
    }

    const advertiser = advertisers[0];

    const tasks = await query(
      `SELECT id, titleEn, titleAr, descriptionEn, descriptionAr, type, reward, duration, 
              difficulty, status, currentCompletions as completionsCount, maxCompletions as completionsNeeded, config as taskData
       FROM tasks
       WHERE advertiserId = ?
       ORDER BY createdAt DESC`,
      [advertiser.id]
    );

    const totalTasks = tasks.length;
    const activeTasks = tasks.filter((t: any) => t.status === 'active').length;
    const totalCompletions = tasks.reduce((sum: number, t: any) => sum + (t.currentCompletions || 0), 0);
    const totalPaid = tasks.reduce((sum: number, t: any) => sum + (Number(t.reward) * (t.currentCompletions || 0)), 0);

    const uniqueUsersResult = await query(
      `SELECT COUNT(DISTINCT userId) as userCount
       FROM userTasks
       WHERE taskId IN (SELECT id FROM tasks WHERE advertiserId = ?)`,
      [advertiser.id]
    );
    const totalUsers = uniqueUsersResult[0]?.userCount || 0;

    const avgRating = 4.8;
    const reviewsCount = totalCompletions > 0 ? Math.floor(totalCompletions * 0.3) : 0;

    const totalNeeded = tasks.reduce((sum: number, t: any) => sum + t.maxCompletions, 0);
    const completionRate = totalNeeded > 0 ? (totalCompletions / totalNeeded) * 100 : 0;

    const response = {
      ...advertiser,
      stats: {
        activeCampaigns: activeTasks,
        totalTasks,
        totalUsers,
        totalCompletions,
        totalPaid: Number(totalPaid.toFixed(2)),
        avgRating,
        reviewsCount,
        completionRate: Number(completionRate.toFixed(1)),
        paymentRate: 99.9,
      },
      tasks: tasks.map((task: any) => ({
        ...task,
        reward: Number(task.reward),
        completionRate: task.maxCompletions > 0
          ? Number(((task.currentCompletions || 0) / task.maxCompletions * 100).toFixed(1))
          : 0,
      })),
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching advertiser:', error);
    res.status(500).json({ error: 'Failed to fetch advertiser details' });
  }
});

/**
 * GET /api/advertiser/dashboard - Get advertiser dashboard data
 */
router.get('/advertiser/dashboard', async (req: Request, res: Response) => {
  try {
    const advertiserId = (req as any).user?.advertiserId || 1;

    const advertiserResult = await query(
      `SELECT * FROM advertisers WHERE id = ?`,
      [advertiserId]
    );
    const advertiser = advertiserResult[0];

    const campaignStats = await query(`
      SELECT 
        COUNT(*) as totalCampaigns,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeCampaigns,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedCampaigns,
        SUM(totalParticipants) as totalParticipants,
        SUM(completedParticipants) as completedParticipants,
        SUM(budget) as totalBudget,
        SUM(reward * completedParticipants) as totalSpent
      FROM campaigns
      WHERE advertiserId = ?
    `, [advertiserId]);

    const taskStats = await query(`
      SELECT 
        COUNT(*) as totalTasks,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeTasks,
        SUM(currentCompletions) as totalCompletions,
        SUM(reward * currentCompletions) as totalPaid
      FROM tasks
      WHERE advertiserId = ?
    `, [advertiserId]);

    const recentActivity = await query(`
      SELECT 
        'task_completion' as type,
        t.titleEn as title,
        ut.completedAt as timestamp,
        t.reward as amount
      FROM userTasks ut
      JOIN tasks t ON ut.taskId = t.id
      WHERE t.advertiserId = ?
        AND ut.status = 'approved'
      ORDER BY ut.completedAt DESC
      LIMIT 10
    `, [advertiserId]);

    const weeklyData = await query(`
      SELECT 
        DATE(ut.completedAt) as date,
        COUNT(*) as completions,
        SUM(t.reward) as spent
      FROM userTasks ut
      JOIN tasks t ON ut.taskId = t.id
      WHERE t.advertiserId = ?
        AND ut.status = 'approved'
        AND ut.completedAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(ut.completedAt)
      ORDER BY date ASC
    `, [advertiserId]);

    res.json({
      advertiser,
      campaignStats: campaignStats[0],
      taskStats: taskStats[0],
      recentActivity,
      weeklyData
    });
  } catch (error) {
    console.error('Error fetching advertiser dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

/**
 * GET /api/advertiser/campaigns - Get all campaigns for the advertiser
 */
router.get('/advertiser/campaigns', async (req: Request, res: Response) => {
  try {
    const advertiserId = (req as any).user?.advertiserId || 1;

    const campaigns = await query(`
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM campaignTasks WHERE campaignId = c.id) as totalTasks,
        (SELECT COUNT(*) FROM userCampaignProgress WHERE campaignId = c.id AND status = 'completed') as completions,
        (SELECT COUNT(*) FROM userCampaignProgress WHERE campaignId = c.id AND status = 'in_progress') as inProgress
      FROM campaigns c
      WHERE c.advertiserId = ?
      ORDER BY c.createdAt DESC
    `, [advertiserId]);

    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching advertiser campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

/**
 * GET /api/advertiser/campaigns/:id/analytics - Get detailed campaign analytics
 */
router.get('/advertiser/campaigns/:id/analytics', async (req: Request, res: Response) => {
  try {
    const campaignId = parseInt(req.params.id);
    const advertiserId = (req as any).user?.advertiserId || 1;

    const campaignResult = await query(
      `SELECT * FROM campaigns WHERE id = ? AND advertiserId = ?`,
      [campaignId, advertiserId]
    );

    if (campaignResult.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaign = campaignResult[0];

    const funnelData = await query(`
      SELECT 
        ct.sequence,
        t.titleEn as taskTitle,
        t.type as taskType,
        COUNT(DISTINCT ucp.userId) as started,
        COUNT(DISTINCT CASE WHEN ucp.currentSequence > ct.sequence THEN ucp.userId END) as completed
      FROM campaignTasks ct
      JOIN tasks t ON ct.taskId = t.id
      LEFT JOIN userCampaignProgress ucp ON ucp.campaignId = ct.campaignId
      WHERE ct.campaignId = ?
      GROUP BY ct.sequence, t.titleEn, t.type
      ORDER BY ct.sequence ASC
    `, [campaignId]);

    const demographics = await query(`
      SELECT 
        CASE 
          WHEN TIMESTAMPDIFF(YEAR, u.dateOfBirth, CURDATE()) < 25 THEN '18-24'
          WHEN TIMESTAMPDIFF(YEAR, u.dateOfBirth, CURDATE()) < 35 THEN '25-34'
          WHEN TIMESTAMPDIFF(YEAR, u.dateOfBirth, CURDATE()) < 45 THEN '35-44'
          WHEN TIMESTAMPDIFF(YEAR, u.dateOfBirth, CURDATE()) < 55 THEN '45-54'
          ELSE '55+'
        END as ageGroup,
        u.gender,
        COUNT(*) as count
      FROM userCampaignProgress ucp
      JOIN users u ON ucp.userId = u.id
      WHERE ucp.campaignId = ?
      GROUP BY ageGroup, u.gender
    `, [campaignId]);

    const dailyPerformance = await query(`
      SELECT 
        DATE(ujl.timestamp) as date,
        COUNT(CASE WHEN ujl.eventType = 'campaign_started' THEN 1 END) as starts,
        COUNT(CASE WHEN ujl.eventType = 'campaign_completed' THEN 1 END) as completions,
        COUNT(CASE WHEN ujl.eventType = 'disqualified' THEN 1 END) as disqualifications
      FROM userJourneyLogs ujl
      WHERE ujl.campaignId = ?
        AND ujl.timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(ujl.timestamp)
      ORDER BY date ASC
    `, [campaignId]);

    const totalStarted = campaign.totalParticipants || 0;
    const totalCompleted = campaign.completedParticipants || 0;
    const totalDisqualified = campaign.disqualifiedParticipants || 0;
    const conversionRate = totalStarted > 0 ? (totalCompleted / totalStarted * 100).toFixed(2) : 0;
    const costPerCompletion = totalCompleted > 0 ? (campaign.reward * totalCompleted / totalCompleted).toFixed(2) : 0;
    const totalSpent = campaign.reward * totalCompleted;
    const budgetUtilization = campaign.budget > 0 ? (totalSpent / campaign.budget * 100).toFixed(2) : 0;

    res.json({
      campaign,
      kpis: {
        totalStarted,
        totalCompleted,
        totalDisqualified,
        conversionRate,
        costPerCompletion,
        totalSpent,
        budgetUtilization
      },
      funnelData,
      demographics,
      dailyPerformance
    });
  } catch (error) {
    console.error('Error fetching campaign analytics:', error);
    res.status(500).json({ error: 'Failed to fetch campaign analytics' });
  }
});

/**
 * POST /api/advertiser/campaigns - Create a new campaign
 */
router.post('/advertiser/campaigns', async (req: Request, res: Response) => {
  try {
    const advertiserId = (req as any).user?.advertiserId || 1;

    const {
      nameEn,
      nameAr,
      descriptionEn,
      descriptionAr,
      image,
      budget,
      reward,
      videoCompletionThreshold,
      visitDurationThreshold,
      countryId,
      targetAgeMin,
      targetAgeMax,
      targetGender,
      targetLocations,
      targetIncomeLevel,
      launchDate,
      expiryDate,
      tasks,
      personas,
      qualifications
    } = req.body;

    const campaignResult = await query(`
      INSERT INTO campaigns (
        advertiserId, nameEn, nameAr, descriptionEn, descriptionAr, image,
        budget, reward, videoCompletionThreshold, visitDurationThreshold,
        countryId, targetAgeMin, targetAgeMax, targetGender, targetLocations,
        targetIncomeLevel, launchDate, expiryDate, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
    `, [
      advertiserId, nameEn, nameAr, descriptionEn, descriptionAr, image,
      budget, reward, videoCompletionThreshold || 70, visitDurationThreshold || 30,
      countryId || 1, targetAgeMin, targetAgeMax, targetGender, JSON.stringify(targetLocations),
      targetIncomeLevel, launchDate, expiryDate
    ]);

    const campaignId = (campaignResult as any).insertId;

    if (tasks && tasks.length > 0) {
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];

        const taskResult = await query(`
          INSERT INTO tasks (
            advertiserId, type, titleEn, titleAr, descriptionEn, descriptionAr,
            reward, totalBudget, maxCompletions as completionsNeeded, difficulty, duration, status
          ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, 'active')
        `, [
          advertiserId, task.type, task.titleEn, task.titleAr,
          task.descriptionEn, task.descriptionAr, budget / tasks.length,
          task.maxCompletions || 1000, task.difficulty || 'medium',
          task.duration || 5
        ]);

        const taskId = (taskResult as any).insertId;

        await query(`
          INSERT INTO campaignTasks (campaignId, taskId, sequence, gatingRules, isRequired)
          VALUES (?, ?, ?, ?, 1)
        `, [campaignId, taskId, i + 1, JSON.stringify(task.gatingRules || {})]);
      }
    }

    if (personas && personas.length > 0) {
      for (const persona of personas) {
        await query(`
          INSERT INTO campaignPersonas (
            campaignId, nameEn, nameAr, descriptionEn, descriptionAr,
            videoUrl, adHeadlineEn, adHeadlineAr, adBodyEn, adBodyAr, targetCriteria
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          campaignId, persona.nameEn, persona.nameAr,
          persona.descriptionEn, persona.descriptionAr,
          persona.videoUrl, persona.adHeadlineEn, persona.adHeadlineAr,
          persona.adBodyEn, persona.adBodyAr, JSON.stringify(persona.targetCriteria || {})
        ]);
      }
    }

    if (qualifications && qualifications.length > 0) {
      for (const qual of qualifications) {
        await query(`
          INSERT INTO campaignQualifications (campaignId, criteriaType, criteriaKey, operator, value)
          VALUES (?, ?, ?, ?, ?)
        `, [campaignId, qual.criteriaType, qual.criteriaKey, qual.operator, qual.value]);
      }
    }

    res.json({
      message: 'Campaign created successfully',
      campaignId
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

/**
 * POST /api/advertiser/campaigns/:id/launch - Launch a campaign
 */
router.post('/advertiser/campaigns/:id/launch', async (req: Request, res: Response) => {
  try {
    const campaignId = parseInt(req.params.id);
    const advertiserId = (req as any).user?.advertiserId || 1;

    const campaignResult = await query(
      `SELECT * FROM campaigns WHERE id = ? AND advertiserId = ?`,
      [campaignId, advertiserId]
    );

    if (campaignResult.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaign = campaignResult[0];
    if (campaign.status !== 'draft') {
      return res.status(400).json({ error: 'Campaign is not in draft status' });
    }

    const tasksResult = await query(
      `SELECT COUNT(*) as count FROM campaignTasks WHERE campaignId = ?`,
      [campaignId]
    );

    if (tasksResult[0].count === 0) {
      return res.status(400).json({ error: 'Campaign must have at least one task' });
    }

    await query(`
      UPDATE campaigns SET
        status = 'active',
        launchDate = NOW(),
        updatedAt = NOW()
      WHERE id = ?
    `, [campaignId]);

    res.json({ message: 'Campaign launched successfully' });
  } catch (error) {
    console.error('Error launching campaign:', error);
    res.status(500).json({ error: 'Failed to launch campaign' });
  }
});

/**
 * POST /api/advertiser/targeting/audience-estimate - Get estimated audience size
 */
router.post('/advertiser/targeting/audience-estimate', async (req: Request, res: Response) => {
  try {
    const {
      countryId,
      ageMin,
      ageMax,
      gender,
      locations,
      incomeLevel
    } = req.body;

    let conditions = ['1=1'];

    if (countryId) {
      conditions.push(`countryId = ${countryId}`);
    }
    if (ageMin) {
      conditions.push(`TIMESTAMPDIFF(YEAR, dateOfBirth, CURDATE()) >= ${ageMin}`);
    }
    if (ageMax) {
      conditions.push(`TIMESTAMPDIFF(YEAR, dateOfBirth, CURDATE()) <= ${ageMax}`);
    }
    if (gender) {
      conditions.push(`gender = '${gender}'`);
    }

    const result = await query(`
      SELECT COUNT(*) as estimatedAudience
      FROM users
      WHERE ${conditions.join(' AND ')}
        AND isActive = 1
    `);

    const estimatedAudience = result[0].estimatedAudience;

    res.json({
      estimatedAudience,
      criteria: { countryId, ageMin, ageMax, gender, locations, incomeLevel }
    });
  } catch (error) {
    console.error('Error estimating audience:', error);
    res.status(500).json({ error: 'Failed to estimate audience' });
  }
});

/**
 * GET /api/advertiser/tasks - Get all tasks for the advertiser
 */
router.get('/advertiser/tasks', async (req: Request, res: Response) => {
  try {
    const advertiserId = (req as any).user?.advertiserId || 1;

    const tasks = await query(`
      SELECT 
        t.*,
        (SELECT COUNT(*) FROM userTasks WHERE taskId = t.id AND status = 'approved') as approvedCount,
        (SELECT COUNT(*) FROM userTasks WHERE taskId = t.id AND status = 'pending') as pendingCount,
        (SELECT COUNT(*) FROM userTasks WHERE taskId = t.id AND status = 'rejected') as rejectedCount
      FROM tasks t
      WHERE t.advertiserId = ?
      ORDER BY t.createdAt DESC
    `, [advertiserId]);

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching advertiser tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

/**
 * POST /api/advertiser/tasks - Create a standalone task
 */
router.post('/advertiser/tasks', async (req: Request, res: Response) => {
  try {
    const advertiserId = (req as any).user?.advertiserId || 1;

    const {
      type,
      titleEn,
      titleAr,
      descriptionEn,
      descriptionAr,
      reward,
      totalBudget,
      maxCompletions,
      difficulty,
      duration,
      targetAgeMin,
      targetAgeMax,
      targetGender,
      targetLocations,
      taskData
    } = req.body;

    const result = await query(`
      INSERT INTO tasks (
        advertiserId, type, titleEn, titleAr, descriptionEn, descriptionAr,
        reward, totalBudget, maxCompletions as completionsNeeded, difficulty, duration,
        targetAgeMin, targetAgeMax, targetGender, targetLocations,
        taskData, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [
      advertiserId, type, titleEn, titleAr, descriptionEn, descriptionAr,
      reward, totalBudget, maxCompletions, difficulty || 'medium', duration || 5,
      targetAgeMin, targetAgeMax, targetGender, JSON.stringify(targetLocations),
      JSON.stringify(taskData)
    ]);

    res.json({
      message: 'Task created successfully',
      taskId: (result as any).insertId
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

/**
 * GET /api/advertiser/templates - Get task templates
 */
router.get('/advertiser/templates', async (req: Request, res: Response) => {
  try {
    const templates = [
      {
        id: 'survey-basic',
        type: 'survey',
        nameEn: 'Basic Survey',
        nameAr: 'استبيان أساسي',
        descriptionEn: 'A simple survey with multiple choice questions',
        descriptionAr: 'استبيان بسيط مع أسئلة اختيار من متعدد',
        defaultConfig: {
          questions: [
            { type: 'multiple_choice', questionEn: 'Sample Question', options: ['Option 1', 'Option 2', 'Option 3'] }
          ],
          passingScore: 0
        }
      },
      {
        id: 'survey-nps',
        type: 'survey',
        nameEn: 'NPS Survey',
        nameAr: 'استبيان NPS',
        descriptionEn: 'Net Promoter Score survey template',
        descriptionAr: 'قالب استبيان صافي نقاط الترويج',
        defaultConfig: {
          questions: [
            { type: 'rating', questionEn: 'How likely are you to recommend us?', min: 0, max: 10 }
          ],
          passingScore: 0
        }
      },
      {
        id: 'video-watch',
        type: 'video',
        nameEn: 'Video Watch',
        nameAr: 'مشاهدة فيديو',
        descriptionEn: 'Watch a promotional video',
        descriptionAr: 'مشاهدة فيديو ترويجي',
        defaultConfig: {
          minWatchPercentage: 70,
          allowSkip: false
        }
      },
      {
        id: 'quiz-knowledge',
        type: 'quiz',
        nameEn: 'Knowledge Quiz',
        nameAr: 'اختبار معرفي',
        descriptionEn: 'Test user knowledge about your product',
        descriptionAr: 'اختبار معرفة المستخدم بمنتجك',
        defaultConfig: {
          questions: [],
          passingScore: 80,
          timeLimit: 300
        }
      },
      {
        id: 'visit-store',
        type: 'visit',
        nameEn: 'Store Visit',
        nameAr: 'زيارة متجر',
        descriptionEn: 'Visit a physical store location',
        descriptionAr: 'زيارة موقع متجر فعلي',
        defaultConfig: {
          requireGps: true,
          minDuration: 15,
          requirePhoto: true
        }
      },
      {
        id: 'campaign-real-estate',
        type: 'multi-task',
        nameEn: 'Real Estate Lead Generation',
        nameAr: 'توليد عملاء عقاريين',
        descriptionEn: 'Complete campaign for real estate lead qualification',
        descriptionAr: 'حملة كاملة لتأهيل العملاء المحتملين في العقارات',
        defaultConfig: {
          tasks: [
            { type: 'video', titleEn: 'Watch Property Video' },
            { type: 'survey', titleEn: 'Financial Qualification' },
            { type: 'survey', titleEn: 'Property Preferences' },
            { type: 'survey', titleEn: 'Confirm Interest' },
            { type: 'survey', titleEn: 'Book Visit' },
            { type: 'visit', titleEn: 'Complete Site Visit' }
          ]
        }
      }
    ];

    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

export default router;
