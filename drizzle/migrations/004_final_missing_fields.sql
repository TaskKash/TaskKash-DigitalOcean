-- Migration: Add Final Missing Fields
-- Date: November 2025
-- Description: Add only the truly missing fields

-- ============================================
-- 1. Update transactions table
-- ============================================

-- Add processedAt column if not exists
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS processedAt DATETIME;

-- Add note column if not exists
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS note TEXT;

-- Add metadata column if not exists
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS metadata JSON;

-- ============================================
-- 2. Update tasks table
-- ============================================

-- Add advertiserCost column if not exists
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS advertiserCost DECIMAL(10,2);

-- Add platformRevenue column if not exists
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS platformRevenue DECIMAL(10,2);

-- ============================================
-- 3. Create indexes (ignore if exists)
-- ============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier);

-- Advertisers indexes  
CREATE INDEX IF NOT EXISTS idx_advertisers_tier ON advertisers(tier);

-- UserTasks indexes
CREATE INDEX IF NOT EXISTS idx_userTasks_userId ON userTasks(userId);
CREATE INDEX IF NOT EXISTS idx_userTasks_taskId ON userTasks(taskId);
CREATE INDEX IF NOT EXISTS idx_userTasks_status ON userTasks(status);
CREATE INDEX IF NOT EXISTS idx_userTasks_scheduledPaymentAt ON userTasks(scheduledPaymentAt);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_userId ON transactions(userId);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_taskId ON transactions(taskId);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_advertiserId ON tasks(advertiserId);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- ============================================
-- Migration Complete
-- ============================================
