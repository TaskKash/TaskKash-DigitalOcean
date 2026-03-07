/**
 * Task Template System - API Routes
 * 
 * Endpoints:
 * - POST /api/tasks - Create new task (advertiser)
 * - GET /api/tasks - List tasks (user/advertiser)
 * - GET /api/tasks/:id - Get task details
 * - POST /api/tasks/:id/start - Start task (user)
 * - POST /api/tasks/:id/submit - Submit task completion (user)
 * - GET /api/tasks/:id/submissions - Get task submissions (advertiser)
 * - POST /api/tasks/:id/submissions/:submissionId/review - Review submission (advertiser)
 * - GET /api/tasks/my-submissions - Get user's submissions
 */

import { Router } from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import { sdk } from './sdk';
import { query as mysqlQuery } from './mysql-db';
import { calculateAdvertiserCommission, calculateUserWithdrawalCommission } from './commission.service';

const router = Router();
const dbPath = path.join(process.cwd(), 'server', 'db.sqlite');

// Helper function to get database connection
function getDb() {
  const db = new Database(dbPath);
  db.exec('PRAGMA foreign_keys = ON');
  return db;
}

// Middleware to check if user is advertiser
async function isAdvertiser(req: any, res: any, next: any) {
  try {
    const { default: sdk } = await import('@manus/sdk');
    const session = await sdk.getSession(req);

    if (!session || !session.openId || !session.openId.startsWith('advertiser_')) {
      return res.status(403).json({ error: 'Advertiser access required' });
    }

    // Extract advertiser ID from openId (format: advertiser_26)
    const advertiserId = parseInt(session.openId.replace('advertiser_', ''));
    req.advertiserId = advertiserId;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Advertiser access required' });
  }
}

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

// ============================================================================
// ADVERTISER ENDPOINTS
// ============================================================================

/**
 * POST /api/tasks
 * Create a new task (advertiser only)
 */
router.post('/tasks', isAdvertiser, (req, res) => {
  const db = getDb();

  try {
    const {
      type, // 'video' or 'quiz'
      titleEn,
      titleAr,
      descriptionEn,
      descriptionAr,
      reward,
      maxCompletions,
      difficulty,
      duration,
      targetAgeMin,
      targetAgeMax,
      targetGender,
      targetLocations,
      targetTiers,
      allowMultipleCompletions,
      dailyLimitPerUser,
      requiresMinimumTier,
      passingScore,
      minWatchPercentage,
      taskData, // For video URL, etc.
      questions, // Array of questions
      expiresAt
    } = req.body;

    // Validate required fields
    if (!type || !titleEn || !descriptionEn || !reward || !maxCompletions || !duration) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate minimum budget (20% of total cost)
    const totalBudget = reward * maxCompletions;
    const minimumBudget = totalBudget * 0.2;

    // Insert task
    const insertTask = db.prepare(`
      INSERT INTO tasks (
        advertiserId, type, titleEn, titleAr, descriptionEn, descriptionAr,
        reward, totalBudget, minimumBudget, maxCompletions,
        difficulty, duration, status,
        targetAgeMin, targetAgeMax, targetGender, targetLocations, targetTiers,
        allowMultipleCompletions, dailyLimitPerUser, requiresMinimumTier,
        verificationMethod, passingScore, minWatchPercentage,
        taskData, expiresAt
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, 'draft',
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        'automatic', ?, ?,
        ?, ?
      )
    `);

    const result = insertTask.run(
      req.advertiserId,
      type,
      titleEn,
      titleAr || null,
      descriptionEn,
      descriptionAr || null,
      reward,
      totalBudget,
      minimumBudget,
      maxCompletions,
      difficulty || 'medium',
      duration,
      targetAgeMin || null,
      targetAgeMax || null,
      targetGender || 'all',
      targetLocations ? JSON.stringify(targetLocations) : null,
      targetTiers ? JSON.stringify(targetTiers) : null,
      allowMultipleCompletions ? 1 : 0,
      dailyLimitPerUser || 0,
      requiresMinimumTier || null,
      passingScore || 80,
      minWatchPercentage || 80,
      taskData ? JSON.stringify(taskData) : null,
      expiresAt || null
    );

    const taskId = result.lastInsertRowid;

    // Insert questions if provided
    if (questions && questions.length > 0) {
      const insertQuestion = db.prepare(`
        INSERT INTO task_questions (
          taskId, questionText, questionOrder, questionType,
          optionA, optionB, optionC, optionD,
          correctAnswer, explanation, imageUrl
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      questions.forEach((q: any, index: number) => {
        insertQuestion.run(
          taskId,
          q.questionText,
          index + 1,
          q.questionType || 'multiple_choice',
          q.optionA || null,
          q.optionB || null,
          q.optionC || null,
          q.optionD || null,
          q.correctAnswer,
          q.explanation || null,
          q.imageUrl || null
        );
      });
    }

    res.json({
      success: true,
      taskId,
      message: 'Task created successfully',
      totalBudget,
      minimumBudget
    });

  } catch (error: any) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: error.message });
  } finally {
    db.close();
  }
});

/**
 * GET /api/tasks/my-tasks
 * Get advertiser's tasks
 */
router.get('/tasks/my-tasks', isAdvertiser, (req, res) => {
  const db = getDb();

  try {
    const tasks = db.prepare(`
      SELECT * FROM tasks 
      WHERE advertiserId = ?
      ORDER BY createdAt DESC
    `).all(req.advertiserId);

    // Parse JSON fields
    const tasksWithParsedData = tasks.map((task: any) => ({
      ...task,
      targetLocations: task.targetLocations ? JSON.parse(task.targetLocations) : null,
      targetTiers: task.targetTiers ? JSON.parse(task.targetTiers) : null,
      taskData: task.taskData ? JSON.parse(task.taskData) : null
    }));

    res.json({ tasks: tasksWithParsedData });

  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: error.message });
  } finally {
    db.close();
  }
});

/**
 * POST /api/tasks/:id/publish
 * Publish a draft task
 */
router.post('/tasks/:id/publish', isAdvertiser, (req, res) => {
  const db = getDb();
  const taskId = parseInt(req.params.id);

  try {
    // Verify task belongs to advertiser
    const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND advertiserId = ?')
      .get(taskId, req.advertiserId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Update status to active
    db.prepare(`
      UPDATE tasks 
      SET status = 'active', publishedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(taskId);

    res.json({ success: true, message: 'Task published successfully' });

  } catch (error: any) {
    console.error('Error publishing task:', error);
    res.status(500).json({ error: error.message });
  } finally {
    db.close();
  }
});

/**
 * GET /api/tasks/:id/submissions
 * Get submissions for a task (advertiser only)
 */
router.get('/tasks/:id/submissions', isAdvertiser, (req, res) => {
  const db = getDb();
  const taskId = parseInt(req.params.id);

  try {
    // Verify task belongs to advertiser
    const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND advertiserId = ?')
      .get(taskId, req.advertiserId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Get submissions with user details
    const submissions = db.prepare(`
      SELECT 
        s.*,
        u.name as userName,
        u.email as userEmail,
        u.tier as userTier
      FROM task_submissions s
      JOIN users u ON s.userId = u.id
      WHERE s.taskId = ?
      ORDER BY s.createdAt DESC
    `).all(taskId);

    // Parse JSON fields
    const submissionsWithParsedData = submissions.map((sub: any) => ({
      ...sub,
      submissionData: sub.submissionData ? JSON.parse(sub.submissionData) : null,
      uploadedFiles: sub.uploadedFiles ? JSON.parse(sub.uploadedFiles) : null,
      gpsLocation: sub.gpsLocation ? JSON.parse(sub.gpsLocation) : null
    }));

    res.json({ submissions: submissionsWithParsedData });

  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: error.message });
  } finally {
    db.close();
  }
});

/**
 * POST /api/tasks/:id/submissions/:submissionId/review
 * Review a submission (approve/reject) - advertiser only
 */
router.post('/tasks/:id/submissions/:submissionId/review', isAdvertiser, (req, res) => {
  const db = getDb();
  const taskId = parseInt(req.params.id);
  const submissionId = parseInt(req.params.submissionId);
  const { action, notes } = req.body; // action: 'approve' or 'reject'

  try {
    // Verify task belongs to advertiser
    const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND advertiserId = ?')
      .get(taskId, req.advertiserId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Get submission
    const submission = db.prepare('SELECT * FROM task_submissions WHERE id = ? AND taskId = ?')
      .get(submissionId, taskId);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    if (action === 'approve') {
      // Approve and credit reward
      db.prepare(`
        UPDATE task_submissions
        SET status = 'approved', 
            reviewedBy = ?,
            reviewedAt = CURRENT_TIMESTAMP,
            reviewNotes = ?,
            rewardCredited = 1,
            creditedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(req.advertiserId, notes || null, submissionId);

      // Note: User balance is managed in main database (Drizzle), not SQLite
      // The balance update should be handled by the main app's wallet service

      // Update task completions count
      db.prepare('UPDATE tasks SET currentCompletions = currentCompletions + 1 WHERE id = ?')
        .run(taskId);

      // Record transaction
      const task = db.prepare('SELECT titleEn FROM tasks WHERE id = ?').get(taskId) as any;
      db.prepare(`
        INSERT INTO transactions (userId, type, amount, description, status, relatedTaskId)
        VALUES (?, 'earning', ?, ?, 'completed', ?)
      `).run(
        submission.userId,
        submission.rewardAmount,
        `Task completed: ${task.titleEn}`,
        taskId
      );

      res.json({ success: true, message: 'Submission approved and reward credited' });

    } else if (action === 'reject') {
      // Reject submission
      db.prepare(`
        UPDATE task_submissions
        SET status = 'rejected',
            reviewedBy = ?,
            reviewedAt = CURRENT_TIMESTAMP,
            rejectionReason = ?
        WHERE id = ?
      `).run(req.advertiserId, notes || 'Did not meet requirements', submissionId);

      res.json({ success: true, message: 'Submission rejected' });

    } else {
      res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error: any) {
    console.error('Error reviewing submission:', error);
    res.status(500).json({ error: error.message });
  } finally {
    db.close();
  }
});

/**
 * GET /api/tasks/:id/export
 * Export submissions data as CSV (advertiser only)
 */
router.get('/tasks/:id/export', isAdvertiser, (req, res) => {
  const db = getDb();
  const taskId = parseInt(req.params.id);

  try {
    // Verify task belongs to advertiser
    const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND advertiserId = ?')
      .get(taskId, req.advertiserId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Get submissions
    const submissions = db.prepare(`
      SELECT 
        s.id, s.userId, u.name, u.email, u.tier,
        s.status, s.score, s.createdAt, s.completedAt,
        s.rewardAmount, s.rewardCredited
      FROM task_submissions s
      JOIN users u ON s.userId = u.id
      WHERE s.taskId = ?
      ORDER BY s.createdAt DESC
    `).all(taskId);

    // Convert to CSV
    const headers = ['ID', 'User ID', 'Name', 'Email', 'Tier', 'Status', 'Score', 'Submitted At', 'Completed At', 'Reward', 'Credited'];
    const rows = submissions.map((s: any) => [
      s.id,
      s.userId,
      s.name,
      s.email,
      s.tier,
      s.status,
      s.score || 'N/A',
      s.createdAt,
      s.completedAt || 'N/A',
      s.rewardAmount,
      s.rewardCredited ? 'Yes' : 'No'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="task-${taskId}-submissions.csv"`);
    res.send(csv);

  } catch (error: any) {
    console.error('Error exporting submissions:', error);
    res.status(500).json({ error: error.message });
  } finally {
    db.close();
  }
});

// ============================================================================
// USER ENDPOINTS
// ============================================================================

/**
 * GET /api/tasks
 * List available tasks for users
 */
router.get('/tasks', async (req, res) => {
  // Try to authenticate user (optional for this endpoint)
  let userId: number | null = null;
  try {
    const user = await sdk.authenticateRequest(req);
    if (user && user.id) {
      userId = user.id;
    }
  } catch (error) {
    // User not logged in, that's okay for browsing tasks
  }

  try {
    const { type, difficulty, minReward, maxReward, advertiserId } = req.query;

    let query = `
      SELECT t.*, a.nameEn as advertiserName, a.nameAr as advertiserNameAr, 
             a.logoUrl as advertiserLogo, a.id as advertiserDbId
      FROM tasks t
      LEFT JOIN advertisers a ON t.advertiserId = a.id
      WHERE t.status IN ('available', 'active', 'published')
    `;

    const params: any[] = [];

    if (type) {
      query += ' AND t.type = ?';
      params.push(type);
    }

    if (difficulty) {
      query += ' AND t.difficulty = ?';
      params.push(difficulty);
    }

    if (minReward) {
      query += ' AND t.reward >= ?';
      params.push(parseFloat(minReward as string));
    }

    if (maxReward) {
      query += ' AND t.reward <= ?';
      params.push(parseFloat(maxReward as string));
    }

    if (advertiserId) {
      query += ' AND t.advertiserId = ?';
      params.push(parseInt(advertiserId as string));
    }

    query += ' ORDER BY t.createdAt DESC';

    const tasks = await mysqlQuery(query, params) as any[];

    // If user is logged in, check which tasks they've already completed successfully
    let completedTaskIds: number[] = [];
    if (userId) {
      const completed = await mysqlQuery(`
        SELECT DISTINCT taskId FROM task_submissions 
        WHERE userId = ? AND status IN ('completed', 'approved')
      `, [userId]) as any[];
      completedTaskIds = completed.map((c: any) => c.taskId);
    }

    // Parse JSON and add completion status
    const tasksWithData = tasks.map((task: any) => {
      const parsedTaskData = task.config ? (typeof task.config === 'string' ? JSON.parse(task.config) : task.config) : null;

      // Helper function to extract string from requirements/steps
      // Handles both simple strings and objects with instructionEn/instructionAr
      const extractStrings = (items: any[]): string[] => {
        if (!items || !Array.isArray(items)) return [];
        return items.map((item: any) => {
          if (typeof item === 'string') return item;
          if (typeof item === 'object' && item !== null) {
            return item.descriptionEn || item.descriptionAr || item.instructionEn || item.instructionAr || item.text || item.title || JSON.stringify(item);
          }
          return String(item);
        });
      };

      // Extract config values to top level for frontend compatibility
      const config = parsedTaskData || {};

      return {
        ...task,
        targetLocations: task.targetLocations ? (typeof task.targetLocations === 'string' ? JSON.parse(task.targetLocations) : task.targetLocations) : null,
        targetTiers: task.targetTiers ? (typeof task.targetTiers === 'string' ? JSON.parse(task.targetTiers) : task.targetTiers) : null,
        taskData: parsedTaskData,
        passingScore: config.passingScore || 80,
        minWatchPercentage: config.minWatchPercentage || 80,
        requirements: extractStrings(parsedTaskData?.requirements),
        steps: extractStrings(parsedTaskData?.steps),
        isCompleted: completedTaskIds.includes(task.id),
        canComplete: !completedTaskIds.includes(task.id) || task.allowMultipleCompletions
      };
    });

    // Get user tier if logged in
    let userTier = null; if (userId) {
      const userResult = await mysqlQuery('SELECT tier FROM users WHERE id = ?', [userId]) as any[];
      if (userResult && userResult.length > 0) {
        userTier = userResult[0].tier;
      }
    }
    // Filter by targetTiers and completion status
    const availableTasks = tasksWithData.filter((task: any) => {
      // Filter out completed tasks (unless they allow multiple completions)
      if (task.isCompleted && !task.allowMultipleCompletions) {
        return false;
      }

      // Filter by targetTiers if user is logged in and task has tier targeting
      if (userTier && task.targetTiers && Array.isArray(task.targetTiers)) {
        const matches = task.targetTiers.includes(userTier);
        return matches;
      }

      return true;
    });
    res.json({ tasks: availableTasks });

  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tasks/my-submissions
 * Get user's completed task submissions (MySQL version)
 */
router.get('/tasks/my-submissions', isUser, async (req, res) => {
  try {
    const submissions = await mysqlQuery(`
      SELECT 
        s.id,
        s.taskId,
        s.status,
        s.score,
        s.rewardAmount,
        s.createdAt,
        s.completedAt,
        t.titleEn as taskTitle,
        t.type as taskType,
        a.nameEn as advertiserName
      FROM task_submissions s
      JOIN tasks t ON s.taskId = t.id
      JOIN advertisers a ON t.advertiserId = a.id
      WHERE s.userId = ? AND s.status IN ('approved', 'completed')
      ORDER BY s.createdAt DESC
    `, [req.userId]) as any[];

    res.json({ submissions });
  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tasks/:id
 * Get task details including questions
 */
router.get('/tasks/:id', async (req, res) => {
  const taskId = parseInt(req.params.id);

  try {
    // Get task
    const tasks = await mysqlQuery(`
      SELECT * FROM tasks WHERE id = ?
    `, [taskId]) as any[];

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = tasks[0];

    // Get questions (without correct answers for users)
    const questions = await mysqlQuery(`
      SELECT id, questionText, questionTextAr, questionOrder, questionType,
             optionA, optionAAr, optionB, optionBAr, 
             optionC, optionCAr, optionD, optionDAr, imageUrl
      FROM task_questions
      WHERE taskId = ?
      ORDER BY questionOrder
    `, [taskId]) as any[];

    // Get survey questions if this is a survey task
    let surveyQuestions: any[] = [];
    if (task.type === 'survey') {
      const rawSurveyQuestions = await mysqlQuery(`
        SELECT * FROM survey_questions WHERE taskId = ? ORDER BY questionOrder
      `, [taskId]) as any[];

      surveyQuestions = rawSurveyQuestions.map((q: any) => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
        optionsAr: typeof q.optionsAr === 'string' ? JSON.parse(q.optionsAr) : q.optionsAr
      }));
    }

    // Parse JSON fields
    const parsedConfig = task.config ? (typeof task.config === 'string' ? JSON.parse(task.config) : task.config) : {};

    const taskWithData = {
      ...task,
      targetLocations: task.targetLocations ? (typeof task.targetLocations === 'string' ? JSON.parse(task.targetLocations) : task.targetLocations) : null,
      targetTiers: task.targetTiers ? (typeof task.targetTiers === 'string' ? JSON.parse(task.targetTiers) : task.targetTiers) : null,
      taskData: parsedConfig,
      passingScore: parsedConfig.passingScore || 80,
      minWatchPercentage: parsedConfig.minWatchPercentage || 80,
      questions,
      surveyQuestions
    };

    res.json({ task: taskWithData });

  } catch (error: any) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/tasks/:id/start
 * Start a task (track that user has started)
 */
router.post('/tasks/:id/start', isUser, async (req, res) => {
  const taskId = parseInt(req.params.id);

  try {
    // Check if task exists and is active in MySQL
    const tasks = await mysqlQuery('SELECT * FROM tasks WHERE id = ? AND status = ?', [taskId, 'active']) as any[];

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found or not active' });
    }

    const task = tasks[0];

    // Check if user already completed this task in MySQL
    if (!task.allowMultipleCompletions) {
      const existing = await mysqlQuery(`
        SELECT * FROM task_submissions 
        WHERE taskId = ? AND userId = ? AND status IN ('approved', 'completed')
      `, [taskId, req.userId]) as any[];

      if (existing && existing.length > 0) {
        return res.status(400).json({ error: 'You have already completed this task' });
      }
    }

    res.json({
      success: true,
      message: 'Task started',
      startTime: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error starting task:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/tasks/:id/submit
 * Submit task completion with answers
 */
router.post('/tasks/:id/submit', isUser, async (req, res) => {
  const taskId = parseInt(req.params.id);
  const { answers, watchTime } = req.body;

  console.log('[Submit Task] User ID:', req.userId);
  console.log('[Submit Task] Task ID:', taskId);
  console.log('[Submit Task] Answers:', answers);
  console.log('[Submit Task] Watch Time:', watchTime);

  try {
    // Get task with questions from MySQL
    const tasks = await mysqlQuery('SELECT * FROM tasks WHERE id = ?', [taskId]) as any[];

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = tasks[0];

    // Get questions with correct answers from MySQL
    let questions: any[] = [];
    try {
      questions = await mysqlQuery(`
        SELECT * FROM task_questions WHERE taskId = ? ORDER BY questionOrder
      `, [taskId]) as any[];
    } catch (err: any) {
      if (err.code === 'ER_NO_SUCH_TABLE') {
        console.warn(`[Submit Task] task_questions table missing, proceeding with 0 questions.`);
      } else {
        throw err;
      }
    }

    // Verify answers
    let correctCount = 0;
    const answerResults = questions.map((q: any, index: number) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) correctCount++;

      return {
        questionId: q.id,
        questionText: q.questionText,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect
      };
    });

    const parsedConfig = task.config ? (typeof task.config === 'string' ? JSON.parse(task.config) : task.config) : {};
    const effectivePassingScore = parsedConfig.passingScore || 80;
    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= effectivePassingScore;

    console.log('[Submit Task] Correct Count:', correctCount);
    console.log('[Submit Task] Total Questions:', questions.length);
    console.log('[Submit Task] Score:', score);
    console.log('[Submit Task] Passing Score:', effectivePassingScore);
    console.log('[Submit Task] Passed:', passed);

    // For video tasks, also check watch time
    let watchTimePassed = true;
    if (task.type === 'video' && watchTime !== undefined) {
      // Parse config (taskData) to get actual video duration in seconds
      let videoDurationSeconds = task.duration * 60; // Default: convert minutes to seconds
      if (parsedConfig && parsedConfig.duration) {
        videoDurationSeconds = parsedConfig.duration; // Use actual duration from config
      }
      const effectiveMinWatch = parsedConfig.minWatchPercentage || 80;
      const requiredWatchTime = (videoDurationSeconds * effectiveMinWatch) / 100;
      watchTimePassed = parseFloat(watchTime) >= requiredWatchTime;
      console.log('[Submit Task] Video Duration:', videoDurationSeconds, 'seconds');
      console.log('[Submit Task] Required Watch Time:', requiredWatchTime, 'seconds');
      console.log('[Submit Task] User Watch Time:', watchTime, 'seconds');
      console.log('[Submit Task] Watch Time Passed:', watchTimePassed);
    }

    const finalPassed = passed && watchTimePassed;

    // Create submission in MySQL
    // Debug statement removed for production

    const submissionData = JSON.stringify({
      answers: answerResults,
      passed: finalPassed,
      watchTimePassed
    });

    // Format date for MySQL (YYYY-MM-DD HH:MM:SS)
    const mysqlDatetime = finalPassed ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null;

    const result = await mysqlQuery(`
      INSERT INTO task_submissions (
        taskId, userId, status, submissionData,
        score, watchTime, correctAnswers, totalQuestions,
        rewardAmount, rewardCredited, completedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      taskId,
      req.userId,
      finalPassed ? 'approved' : 'rejected',
      submissionData,
      score,
      watchTime || null,
      correctCount,
      questions.length,
      finalPassed ? task.reward : 0,
      finalPassed ? 1 : 0,
      mysqlDatetime
    ]) as any;

    // If passed and automatic verification, credit reward immediately
    if (finalPassed) {
      // Check if user has already completed this task
      const existingCompletion = await mysqlQuery(
        `SELECT id FROM task_submissions WHERE userId = ? AND taskId = ? AND status = 'approved'`,
        [req.userId, taskId]
      ) as any[];

      if (existingCompletion && existingCompletion.length > 1) { // 1 because we just inserted the current one
        console.log(`[DUPLICATE] User ${req.userId} already completed task ${taskId}`);
        return res.status(400).json({
          error: 'You have already completed this task',
          success: false
        });
      }

      // Update user balance in MySQL database
      try {
        // Update balance, completedTasks, and totalEarnings
        await mysqlQuery(
          `UPDATE users 
           SET balance = balance + ?,
               completedTasks = completedTasks + 1,
               totalEarnings = totalEarnings + ?,
               updatedAt = NOW()
           WHERE id = ?`,
          [task.reward, task.reward, req.userId]
        );

        // Insert userTasks record to track completion
        await mysqlQuery(
          `INSERT INTO userTasks 
           (userId, taskId, status, startedAt, completedAt, createdAt)
           VALUES (?, ?, 'completed', NOW(), NOW(), NOW())`,
          [req.userId, taskId]
        );

        // Get advertiser tier for commission calculation
        const advertiserData = await mysqlQuery(
          `SELECT tier FROM advertisers WHERE id = ?`,
          [task.advertiserId]
        ) as any[];
        const advertiserTier = advertiserData[0]?.tier || 'basic';

        // Calculate advertiser commission
        const commission = calculateAdvertiserCommission(parseFloat(task.reward), advertiserTier);

        // Get user balance for transaction record
        const userBalanceData = await mysqlQuery(
          `SELECT balance FROM users WHERE id = ?`,
          [req.userId]
        ) as any[];
        const balanceBefore = userBalanceData[0]?.balance || 0;
        const balanceAfter = parseFloat(balanceBefore) + parseFloat(task.reward);

        // Insert transaction record in MySQL
        await mysqlQuery(
          `INSERT INTO transactions 
           (userId, type, currency, amount, description, status, taskId, createdAt)
           VALUES (?, 'earning', 'EGP', ?, ?, 'completed', ?, NOW())`,
          [req.userId, task.reward, `Task completed: ${task.titleEn}`, taskId]
        );

        // Deduct from advertiser balance (reward + commission)
        await mysqlQuery(
          `UPDATE advertisers SET balance = balance - ?, totalSpent = totalSpent + ? WHERE id = ?`,
          [commission.totalCost, commission.totalCost, task.advertiserId]
        );

        // Update task completion count in MySQL
        await mysqlQuery('UPDATE tasks SET currentCompletions = currentCompletions + 1 WHERE id = ?', [taskId]);

        console.log(`[WALLET] Successfully credited ${task.reward} EGP to user ${req.userId}`);
      } catch (error) {
        console.error('[WALLET] Error updating user balance:', error);
      }
    }

    // Count previous attempts for this user and task
    const previousAttempts = await mysqlQuery(
      `SELECT COUNT(*) as count FROM task_submissions 
       WHERE taskId = ? AND userId = ? AND status = 'rejected'`,
      [taskId, req.userId]
    ) as any[];
    const attemptNumber = (previousAttempts[0]?.count || 0) + 1;
    const canRetry = attemptNumber < 3; // Allow up to 3 attempts

    res.json({
      success: true,
      passed: finalPassed,
      score,
      correctAnswers: correctCount,
      totalQuestions: questions.length,
      reward: finalPassed ? task.reward : 0,
      message: finalPassed ? 'Congratulations! Task completed successfully!' : 'Sorry, you did not pass. Please try again.',
      submissionId: (result as any).insertId,
      attemptNumber,
      canRetry,
      maxAttempts: 3,
      // Always return full answer results with correct answers for learning
      answerResults: answerResults.map(a => ({
        questionId: a.questionId,
        questionText: a.questionText,
        userAnswer: a.userAnswer,
        correctAnswer: a.correctAnswer,
        isCorrect: a.isCorrect
      }))
    });

  } catch (error: any) {
    console.error('Error submitting task:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/tasks/:id/submit-survey
 * Submit survey completion with answers
 */
router.post('/tasks/:id/submit-survey', isUser, async (req, res) => {
  const taskId = parseInt(req.params.id);
  const { answers } = req.body; // Array of { questionId, selectedOptions }

  console.log('[Submit Survey] User ID:', req.userId);
  console.log('[Submit Survey] Task ID:', taskId);
  console.log('[Submit Survey] Answers:', JSON.stringify(answers));

  try {
    // Get task from MySQL
    const tasks = await mysqlQuery('SELECT * FROM tasks WHERE id = ? AND type = ?', [taskId, 'survey']) as any[];
    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ error: 'Survey task not found' });
    }
    const task = tasks[0];

    // Get survey questions
    const questions = await mysqlQuery(`
      SELECT * FROM survey_questions WHERE taskId = ? ORDER BY questionOrder
    `, [taskId]) as any[];

    if (!questions || questions.length === 0) {
      return res.status(404).json({ error: 'Survey questions not found' });
    }

    // Validate all required questions are answered
    const answeredQuestionIds = new Set(answers.map((a: any) => a.questionId));
    const requiredQuestions = questions.filter((q: any) => q.isRequired);
    const missingQuestions = requiredQuestions.filter((q: any) => !answeredQuestionIds.has(q.id));

    if (missingQuestions.length > 0) {
      return res.status(400).json({
        error: 'Missing required answers',
        missingQuestions: missingQuestions.map((q: any) => q.id)
      });
    }

    // Check if user already completed this survey
    const existingSubmissions = await mysqlQuery(`
      SELECT * FROM task_submissions 
      WHERE taskId = ? AND userId = ? AND status = 'approved'
    `, [taskId, req.userId]) as any[];

    if (existingSubmissions && existingSubmissions.length > 0) {
      return res.status(400).json({ error: 'You have already completed this survey' });
    }

    // Create submission
    const submissionData = JSON.stringify({ answers });
    const mysqlDatetime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const result = await mysqlQuery(`
      INSERT INTO task_submissions (
        taskId, userId, status, submissionData,
        score, correctAnswers, totalQuestions,
        rewardAmount, rewardCredited, completedAt
      ) VALUES (?, ?, 'approved', ?, 100, ?, ?, ?, 1, ?)
    `, [
      taskId,
      req.userId,
      submissionData,
      questions.length,
      questions.length,
      task.reward,
      mysqlDatetime
    ]) as any;

    const submissionId = result.insertId;

    // Store individual responses
    for (const answer of answers) {
      await mysqlQuery(`
        INSERT INTO survey_responses (submissionId, questionId, selectedOptions)
        VALUES (?, ?, ?)
      `, [submissionId, answer.questionId, JSON.stringify(answer.selectedOptions)]);
    }
    // Get user balance before crediting
    const userBefore = await mysqlQuery("SELECT balance FROM users WHERE id = ?", [req.userId]) as any[];
    const balanceBefore = userBefore[0]?.balance || 0;
    const balanceAfter = parseFloat(balanceBefore) + parseFloat(task.reward);

    // Credit reward to user
    await mysqlQuery(`
      UPDATE users SET balance = balance + ?, completedTasks = completedTasks + 1, totalEarnings = totalEarnings + ? WHERE id = ?
    `, [task.reward, task.reward, req.userId]);

    // Get advertiser tier for commission calculation
    const advertiserData = await mysqlQuery(
      `SELECT tier FROM advertisers WHERE id = ?`,
      [task.advertiserId]
    ) as any[];
    const advertiserTier = advertiserData[0]?.tier || 'basic';

    // Calculate advertiser commission
    const commission = calculateAdvertiserCommission(parseFloat(task.reward), advertiserTier);

    // Create transaction record with commission tracking
    await mysqlQuery(`
      INSERT INTO transactions (userId, type, currency, amount, status, description, relatedTaskId, balanceBefore, balanceAfter, commissionAmount, commissionRate, netAmount, createdAt)
      VALUES (?, "earning", "EGP", ?, "completed", ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [req.userId, task.reward, `Survey completed: ${task.titleEn}`, taskId, balanceBefore, balanceAfter, commission.commissionAmount, commission.commissionRate, task.reward]);

    // Deduct from advertiser balance (reward + commission)
    await mysqlQuery(
      `UPDATE advertisers SET balance = balance - ?, totalSpent = totalSpent + ? WHERE id = ?`,
      [commission.totalCost, commission.totalCost, task.advertiserId]
    );

    // Update task completion count
    await mysqlQuery(`
      UPDATE tasks SET currentCompletions = currentCompletions + 1 WHERE id = ?
    `, [taskId]);

    console.log('[Submit Survey] Survey completed successfully');
    console.log('[Submit Survey] Reward credited:', task.reward);

    res.json({
      success: true,
      passed: true,
      rewardAmount: task.reward,
      message: 'Survey completed successfully'
    });

  } catch (error: any) {
    console.error('[Submit Survey] Error:', error);
    res.status(500).json({ error: error.message });
  }
});



/**
 * GET /api/transactions
 * Get user's transactions
 */
router.get('/transactions', isUser, async (req, res) => {
  try {
    const transactions = await mysqlQuery(`
      SELECT 
        id,
        type,
        amount,
        description,
        status,
        relatedTaskId,
        createdAt as date
      FROM transactions
      WHERE userId = ?
      ORDER BY createdAt DESC
    `, [req.userId]);

    res.json({ transactions });

  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: error.message });
  }
});


/**
 * GET /api/weekly-earnings
 * Get user's earnings for the last 7 days (including today)
 */
router.get('/weekly-earnings', isUser, async (req, res) => {
  console.log("[Weekly Earnings] User ID:", req.userId, "User:", req.user?.name);
  try {
    // Get earnings for the last 7 days from MySQL (including today)
    // Using DATE_SUB with INTERVAL 6 DAY to include today as the 7th day
    // Fixed: GROUP BY must include all non-aggregated columns in SELECT for ONLY_FULL_GROUP_BY mode
    const earnings = await mysqlQuery(`
	      SELECT 
	        DATE(createdAt) as dateValue,
	        SUM(amount) as totalAmount
	      FROM transactions 
	      WHERE userId = ? 
	        AND type IN ('earn', 'earning') 
	        AND status = 'completed'
	        AND DATE(createdAt) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
	      GROUP BY DATE(createdAt)
	      ORDER BY DATE(createdAt) ASC
	    `, [req.userId]) as any[];

    // Get previous week's total for comparison (7-13 days ago)
    const prevWeekEarnings = await mysqlQuery(`
	      SELECT SUM(amount) as total
	      FROM transactions 
	      WHERE userId = ? 
	        AND type IN ('earn', 'earning') 
	        AND status = 'completed'
	        AND DATE(createdAt) >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
	        AND DATE(createdAt) <= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
	    `, [req.userId]) as any[];

    // Create a map of all 7 days with 0 as default
    const today = new Date();
    const last7Days: any[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      // Format date as YYYY-MM-DD to match MySQL DATE_FORMAT output
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      // Find matching earning - compare as strings
      const earning = earnings.find((e: any) => {
        let val = e.dateValue || e.date;
        if (!val) return false;
        const eDateStr = (val instanceof Date) ? val.toISOString().split('T')[0] : new Date(val).toISOString().split('T')[0];
        return eDateStr === dateStr;
      });

      last7Days.push({
        day: dayName,
        date: dateStr,
        amount: earning ? parseFloat(earning.totalAmount) : 0
      });
    }

    const totalEarnings = last7Days.reduce((sum, d) => sum + d.amount, 0);
    const prevWeekTotal = prevWeekEarnings[0]?.total ? parseFloat(prevWeekEarnings[0].total) : 0;

    res.json({
      earnings: last7Days,
      totalEarnings,
      prevWeekTotal,
      change: prevWeekTotal > 0 ? ((totalEarnings - prevWeekTotal) / prevWeekTotal * 100).toFixed(1) : '0'
    });
  } catch (error: any) {
    console.error('[Weekly Earnings] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/profile/strength
 * Get user's profile strength calculated from verifications and profile data
 */
router.get('/profile/strength', isUser, async (req, res) => {
  console.log("[Profile Strength] User ID:", req.userId);
  try {
    let strength = 0;

    // Phone verified = 20%
    if (req.user?.phoneVerified) strength += 20;

    // Email verified = 10%
    if (req.user?.emailVerified) strength += 10;

    // Check KYC verification = 20%
    const kycResult = await mysqlQuery(`
      SELECT COUNT(*) as count FROM user_verifications 
      WHERE userId = ? AND verificationType = 'national_id' AND status = 'verified'
    `, [req.userId]) as any[];
    if (kycResult[0]?.count > 0) strength += 20;

    // Check social profiles = 10%
    const socialResult = await mysqlQuery(`
      SELECT COUNT(*) as count FROM user_social_profiles WHERE userId = ?
    `, [req.userId]) as any[];
    if (socialResult[0]?.count > 0) strength += 10;

    // Profile questions answered = up to 40%
    let questionCount = 0;
    try {
      const profileDataResult = await mysqlQuery(`
        SELECT COUNT(*) as count FROM user_profile_data WHERE userId = ?
      `, [req.userId]) as any[];
      questionCount = profileDataResult[0]?.count || 0;
    } catch (e: any) {
      if (e.code === 'ER_NO_SUCH_TABLE') {
        console.warn('user_profile_data table missing, treating profile questions as 0');
      } else {
        throw e;
      }
    }
    strength += Math.min(questionCount * 4, 40);

    // Cap at 100%
    strength = Math.min(strength, 100);

    res.json({
      strength,
      breakdown: {
        phoneVerified: req.user?.phoneVerified ? 20 : 0,
        emailVerified: req.user?.emailVerified ? 10 : 0,
        kycVerified: kycResult[0]?.count > 0 ? 20 : 0,
        socialConnected: socialResult[0]?.count > 0 ? 10 : 0,
        profileQuestions: Math.min(questionCount * 4, 40)
      }
    });
  } catch (error: any) {
    console.error('[Profile Strength] Error:', error);
    // Return user's stored profile strength as fallback
    res.json({ strength: req.user?.profileStrength || 30 });
  }
});

export default router;
