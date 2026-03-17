-- Migration: 001_advertiser_tiers_escrow
-- Description: Adds tier and totalSpend to advertisers. Creates escrow_ledger table.

-- 1. Add columns to advertisers if they don't exist
SET @dbname = DATABASE();

-- Add 'tier' column
SET @tablename = 'advertisers';
SET @columnname = 'tier';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' ENUM(''basic'', ''pro'', ''premium'', ''enterprise'') DEFAULT ''basic'' NOT NULL;')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add 'totalSpend' column
SET @columnname = 'totalSpend';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT UNSIGNED DEFAULT 0 NOT NULL;')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 2. Create escrow_ledger table
CREATE TABLE IF NOT EXISTS escrow_ledger (
  id INT AUTO_INCREMENT PRIMARY KEY,
  advertiserId INT NOT NULL,
  campaignId INT,
  taskId INT,
  amount INT NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status ENUM('held', 'released', 'refunded') DEFAULT 'held' NOT NULL,
  reason VARCHAR(255),
  releaseDate DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (advertiserId) REFERENCES advertisers(id) ON DELETE CASCADE
);
