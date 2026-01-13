/**
 * Task Template System - Database Migration
 * 
 * This migration:
 * 1. Updates tasks table with template support
 * 2. Creates task_submissions table
 * 3. Creates task_questions table
 * 4. Removes old mock tasks
 */

import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'server', 'db.sqlite');
const db = new Database(dbPath);

console.log('🚀 Starting Task Template System Migration...\n');

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON');

try {
  db.exec('BEGIN TRANSACTION');

  // Step 1: Check if tasks table exists and backup if it does
  const tablesResult = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='tasks'").all();
  
  if (tablesResult.length > 0) {
    console.log('📦 Backing up existing tasks...');
    db.exec(`CREATE TABLE tasks_backup AS SELECT * FROM tasks`);
    console.log('🗑️  Removing old task structure...');
    db.exec('DROP TABLE IF EXISTS tasks');
  } else {
    console.log('ℹ️  No existing tasks table found, creating from scratch...');
  }

  // Step 3: Create new tasks table with template support
  console.log('📋 Creating new tasks table...');
  db.exec(`
    CREATE TABLE tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      advertiserId INTEGER NOT NULL,
      
      -- Task Type
      type VARCHAR(50) NOT NULL, -- 'video', 'quiz', 'survey', 'app', 'photo', 'visit', 'social'
      
      -- Basic Info
      titleEn TEXT NOT NULL,
      titleAr TEXT,
      descriptionEn TEXT NOT NULL,
      descriptionAr TEXT,
      
      -- Reward & Budget
      reward DECIMAL(10,2) NOT NULL,
      totalBudget DECIMAL(10,2) NOT NULL,
      completionsNeeded INTEGER NOT NULL,
      completionsCount INTEGER DEFAULT 0,
      minimumBudget DECIMAL(10,2) NOT NULL, -- 20% of (completionsNeeded * reward)
      
      -- Task Properties
      difficulty VARCHAR(20) DEFAULT 'medium', -- 'easy', 'medium', 'hard'
      duration INTEGER NOT NULL, -- estimated minutes
      
      -- Status
      status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed', 'expired'
      
      -- Targeting (JSON strings)
      targetAgeMin INTEGER,
      targetAgeMax INTEGER,
      targetGender VARCHAR(10), -- 'all', 'male', 'female'
      targetLocations TEXT, -- JSON array: ["Cairo", "Alexandria"]
      targetTiers TEXT, -- JSON array: ["tier1", "tier2", "tier3", "tier4"]
      
      -- Restrictions (Advertiser Options)
      allowMultipleCompletions BOOLEAN DEFAULT 0, -- Can user do task multiple times?
      dailyLimitPerUser INTEGER DEFAULT 0, -- 0 = no limit
      requiresMinimumTier VARCHAR(10), -- 'tier1', 'tier2', 'tier3', 'tier4', NULL = no restriction
      
      -- Verification Settings
      verificationMethod VARCHAR(50) DEFAULT 'automatic', -- 'automatic', 'manual', 'hybrid'
      passingScore INTEGER DEFAULT 80, -- For quizzes (percentage)
      minWatchPercentage INTEGER DEFAULT 80, -- For videos (percentage)
      
      -- Task-Specific Data (JSON)
      taskData TEXT, -- JSON with type-specific fields
      
      -- Timestamps
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      publishedAt DATETIME,
      expiresAt DATETIME,
      
      FOREIGN KEY (advertiserId) REFERENCES advertisers(id) ON DELETE CASCADE
    )
  `);

  // Step 4: Create task_questions table
  console.log('❓ Creating task_questions table...');
  db.exec(`
    CREATE TABLE task_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      taskId INTEGER NOT NULL,
      
      -- Question Details
      questionText TEXT NOT NULL,
      questionOrder INTEGER NOT NULL, -- For ordering questions
      
      -- Question Type
      questionType VARCHAR(50) DEFAULT 'multiple_choice', -- 'multiple_choice', 'true_false', 'text'
      
      -- Options (for multiple choice)
      optionA TEXT,
      optionB TEXT,
      optionC TEXT,
      optionD TEXT,
      
      -- Correct Answer
      correctAnswer VARCHAR(10), -- 'A', 'B', 'C', 'D', 'true', 'false', or text
      
      -- Optional
      explanation TEXT, -- Shown after answering
      imageUrl TEXT, -- Optional question image
      
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
    )
  `);

  // Step 5: Create task_submissions table
  console.log('📝 Creating task_submissions table...');
  db.exec(`
    CREATE TABLE task_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      taskId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      
      -- Submission Status
      status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'completed'
      
      -- Submission Data (JSON)
      submissionData TEXT, -- JSON with answers, watch time, etc.
      
      -- Verification Results
      score INTEGER, -- Percentage score (0-100)
      watchTime INTEGER, -- Seconds watched (for videos)
      correctAnswers INTEGER, -- Number of correct answers
      totalQuestions INTEGER, -- Total number of questions
      
      -- Files (for photo/screenshot tasks - future)
      uploadedFiles TEXT, -- JSON array of file paths
      
      -- Location (for visit tasks - future)
      gpsLocation TEXT, -- JSON: {"lat": 30.0444, "lng": 31.2357}
      
      -- Review (for manual review)
      reviewedBy INTEGER, -- Admin or Advertiser ID
      reviewedAt DATETIME,
      reviewNotes TEXT,
      rejectionReason TEXT,
      
      -- Reward
      rewardAmount DECIMAL(10,2),
      rewardCredited BOOLEAN DEFAULT 0,
      creditedAt DATETIME,
      
      -- Timestamps
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      completedAt DATETIME,
      
      FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      
      -- Prevent duplicate submissions (unless task allows multiple completions)
      UNIQUE(taskId, userId, createdAt)
    )
  `);

  // Step 6: Create indexes for performance
  console.log('⚡ Creating indexes...');
  db.exec(`
    CREATE INDEX idx_tasks_advertiser ON tasks(advertiserId);
    CREATE INDEX idx_tasks_type ON tasks(type);
    CREATE INDEX idx_tasks_status ON tasks(status);
    CREATE INDEX idx_questions_task ON task_questions(taskId);
    CREATE INDEX idx_submissions_task ON task_submissions(taskId);
    CREATE INDEX idx_submissions_user ON task_submissions(userId);
    CREATE INDEX idx_submissions_status ON task_submissions(status);
  `);

  // Step 7: Create triggers for automatic timestamp updates
  console.log('🔄 Creating triggers...');
  db.exec(`
    CREATE TRIGGER update_task_timestamp 
    AFTER UPDATE ON tasks
    BEGIN
      UPDATE tasks SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `);

  db.exec(`
    CREATE TRIGGER update_submission_timestamp 
    AFTER UPDATE ON task_submissions
    BEGIN
      UPDATE task_submissions SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `);

  db.exec('COMMIT');

  console.log('\n✅ Migration completed successfully!');
  console.log('\n📊 New Tables Created:');
  console.log('   - tasks (with template support)');
  console.log('   - task_questions');
  console.log('   - task_submissions');
  console.log('\n🎉 Task Template System is ready!');

} catch (error) {
  db.exec('ROLLBACK');
  console.error('\n❌ Migration failed:', error);
  process.exit(1);
} finally {
  db.close();
}
