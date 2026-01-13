-- Multi-Task Campaign Feature Migration
-- TaskKash Database Schema Update

-- Add new columns to users table for campaign targeting
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS age INT NULL,
ADD COLUMN IF NOT EXISTS gender VARCHAR(10) NULL,
ADD COLUMN IF NOT EXISTS city VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS incomeLevel VARCHAR(50) NULL;

-- Add 'video' and 'quiz' to tasks type enum
ALTER TABLE tasks MODIFY COLUMN type ENUM('survey', 'app', 'visit', 'review', 'social', 'video', 'quiz', 'other') NOT NULL;

-- Add config column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS config JSON NULL;

-- Add campaignId to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS campaignId INT NULL;

-- Add 'campaign' to notifications type enum
ALTER TABLE notifications MODIFY COLUMN type ENUM('task', 'payment', 'system', 'promotion', 'campaign') NOT NULL;

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  advertiserId INT NOT NULL,
  nameAr VARCHAR(300) NOT NULL,
  nameEn VARCHAR(300) NOT NULL,
  descriptionAr TEXT,
  descriptionEn TEXT,
  image VARCHAR(500),
  budget INT UNSIGNED NOT NULL,
  reward INT UNSIGNED NOT NULL,
  status ENUM('draft', 'active', 'paused', 'completed') DEFAULT 'draft' NOT NULL,
  videoCompletionThreshold INT UNSIGNED DEFAULT 70 NOT NULL,
  visitDurationThreshold INT UNSIGNED DEFAULT 30 NOT NULL,
  countryId INT NOT NULL,
  targetAgeMin INT,
  targetAgeMax INT,
  targetGender VARCHAR(10),
  targetLocations TEXT,
  targetIncomeLevel VARCHAR(50),
  targetVideoCompletionRate INT UNSIGNED,
  targetFilterPassRate INT UNSIGNED,
  targetSurveyCompletionRate INT UNSIGNED,
  targetVisitAttendanceRate INT UNSIGNED,
  targetCostPerVisit INT UNSIGNED,
  totalParticipants INT UNSIGNED DEFAULT 0 NOT NULL,
  completedParticipants INT UNSIGNED DEFAULT 0 NOT NULL,
  disqualifiedParticipants INT UNSIGNED DEFAULT 0 NOT NULL,
  launchDate TIMESTAMP NULL,
  expiryDate TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX idx_campaigns_advertiser (advertiserId),
  INDEX idx_campaigns_status (status),
  INDEX idx_campaigns_country (countryId)
);

-- Create campaignPersonas table
CREATE TABLE IF NOT EXISTS campaignPersonas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campaignId INT NOT NULL,
  nameAr VARCHAR(100) NOT NULL,
  nameEn VARCHAR(100) NOT NULL,
  descriptionAr TEXT,
  descriptionEn TEXT,
  videoUrl VARCHAR(500),
  adHeadlineAr VARCHAR(255),
  adHeadlineEn VARCHAR(255),
  adBodyAr TEXT,
  adBodyEn TEXT,
  targetCriteria JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX idx_personas_campaign (campaignId),
  FOREIGN KEY (campaignId) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Create campaignTasks table
CREATE TABLE IF NOT EXISTS campaignTasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campaignId INT NOT NULL,
  taskId INT NOT NULL,
  sequence INT UNSIGNED NOT NULL,
  gatingRules JSON,
  isRequired INT UNSIGNED DEFAULT 1 NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX idx_campaign_tasks_campaign (campaignId),
  INDEX idx_campaign_tasks_task (taskId),
  UNIQUE KEY unique_campaign_task_sequence (campaignId, sequence),
  FOREIGN KEY (campaignId) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Create campaignQualifications table
CREATE TABLE IF NOT EXISTS campaignQualifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campaignId INT NOT NULL,
  criteriaType ENUM('demographic', 'behavioral', 'interest', 'exclusion') NOT NULL,
  criteriaKey VARCHAR(100) NOT NULL,
  operator ENUM('=', '!=', '>', '<', '>=', '<=', 'in', 'not_in') NOT NULL,
  value VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX idx_qualifications_campaign (campaignId),
  FOREIGN KEY (campaignId) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Create userCampaignProgress table
CREATE TABLE IF NOT EXISTS userCampaignProgress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  campaignId INT NOT NULL,
  personaId INT,
  currentTaskId INT,
  currentSequence INT UNSIGNED DEFAULT 1 NOT NULL,
  status ENUM('in_progress', 'completed', 'disqualified', 'abandoned') DEFAULT 'in_progress' NOT NULL,
  disqualificationReason TEXT,
  tasksCompleted INT UNSIGNED DEFAULT 0 NOT NULL,
  totalTasks INT UNSIGNED NOT NULL,
  startedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  completedAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX idx_progress_user (userId),
  INDEX idx_progress_campaign (campaignId),
  INDEX idx_progress_status (status),
  UNIQUE KEY unique_user_campaign (userId, campaignId),
  FOREIGN KEY (campaignId) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Create userJourneyLogs table
CREATE TABLE IF NOT EXISTS userJourneyLogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  campaignId INT NOT NULL,
  taskId INT,
  eventType VARCHAR(100) NOT NULL,
  eventData JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX idx_logs_user (userId),
  INDEX idx_logs_campaign (campaignId),
  INDEX idx_logs_event_type (eventType),
  INDEX idx_logs_created (createdAt),
  FOREIGN KEY (campaignId) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Create campaignKpis table
CREATE TABLE IF NOT EXISTS campaignKpis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campaignId INT NOT NULL,
  kpiName VARCHAR(100) NOT NULL,
  targetValue INT UNSIGNED,
  actualValue INT UNSIGNED DEFAULT 0 NOT NULL,
  lastCalculatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX idx_kpis_campaign (campaignId),
  UNIQUE KEY unique_campaign_kpi (campaignId, kpiName),
  FOREIGN KEY (campaignId) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Create visitVerifications table
CREATE TABLE IF NOT EXISTS visitVerifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  campaignId INT NOT NULL,
  taskId INT NOT NULL,
  bookingDate TIMESTAMP NULL,
  bookingTimeSlot VARCHAR(50),
  checkInTime TIMESTAMP NULL,
  checkOutTime TIMESTAMP NULL,
  visitDuration INT UNSIGNED,
  verificationMethod ENUM('gps', 'qr_code', 'manual'),
  gpsLatitude VARCHAR(20),
  gpsLongitude VARCHAR(20),
  qrCodeScanned VARCHAR(100),
  status ENUM('booked', 'checked_in', 'verified', 'cancelled', 'no_show') DEFAULT 'booked' NOT NULL,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX idx_visits_user (userId),
  INDEX idx_visits_campaign (campaignId),
  INDEX idx_visits_status (status),
  FOREIGN KEY (campaignId) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Success message
SELECT 'Multi-Task Campaign tables created successfully!' AS message;
