-- Migration 003: Reputation & Disputes
-- Task Ratings + Dispute Resolution tables

-- Task Ratings: users rate tasks after completion, advertisers rate completions
CREATE TABLE IF NOT EXISTS task_ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  taskCompletionId INT NOT NULL,
  campaignId INT NOT NULL,
  raterId INT NOT NULL,
  raterType ENUM('user', 'advertiser') NOT NULL DEFAULT 'user',
  targetId INT NOT NULL,
  targetType ENUM('task', 'completion') NOT NULL DEFAULT 'task',
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_campaign (campaignId),
  INDEX idx_rater (raterId, raterType),
  INDEX idx_target (targetId, targetType)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Disputes: users can dispute rejected tasks, admin arbitrates
CREATE TABLE IF NOT EXISTS disputes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  taskCompletionId INT NOT NULL,
  campaignId INT NOT NULL,
  userId INT NOT NULL,
  advertiserId INT NOT NULL,
  reason TEXT NOT NULL,
  evidence TEXT DEFAULT NULL,
  status ENUM('open', 'under_review', 'resolved_user', 'resolved_advertiser', 'dismissed') NOT NULL DEFAULT 'open',
  adminNotes TEXT DEFAULT NULL,
  resolvedBy INT DEFAULT NULL,
  resolvedAt TIMESTAMP NULL DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (userId),
  INDEX idx_advertiser (advertiserId),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
