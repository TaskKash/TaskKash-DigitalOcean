-- Migration 004: Fraud Detection
-- Stores flagged instances of potential fraud for admin review

CREATE TABLE IF NOT EXISTS fraud_flags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  taskCompletionId INT DEFAULT NULL,
  campaignId INT DEFAULT NULL,
  flagType ENUM('multiple_accounts', 'vpn_proxy', 'rapid_completion', 'suspicious_activity') NOT NULL,
  severity ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'low',
  details JSON DEFAULT NULL,
  status ENUM('pending', 'investigating', 'resolved_innocent', 'resolved_guilty') NOT NULL DEFAULT 'pending',
  adminNotes TEXT DEFAULT NULL,
  resolvedBy INT DEFAULT NULL,
  resolvedAt TIMESTAMP NULL DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (userId),
  INDEX idx_status (status),
  INDEX idx_type (flagType)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
