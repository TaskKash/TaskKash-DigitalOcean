-- Migration: Add Missing Fields Only
-- Date: November 2025
-- Description: Add only the missing fields that don't exist yet

-- ============================================
-- 1. Update users table
-- ============================================

-- Modify tier column to VARCHAR to support our tier system
ALTER TABLE users MODIFY COLUMN tier VARCHAR(20) DEFAULT 'tier1';

-- Modify balance to DECIMAL for precision
ALTER TABLE users MODIFY COLUMN balance DECIMAL(10,2) DEFAULT 0.00;

-- Add averageRating column
ALTER TABLE users ADD COLUMN averageRating DECIMAL(3,2) DEFAULT 0.00;

-- ============================================
-- 2. Update transactions table
-- ============================================

-- Add processedAt column
ALTER TABLE transactions ADD COLUMN processedAt DATETIME;

-- Add note column
ALTER TABLE transactions ADD COLUMN note TEXT;

-- Add metadata column
ALTER TABLE transactions ADD COLUMN metadata JSON;

-- ============================================
-- 3. Update tasks table
-- ============================================

-- Add advertiserCost column
ALTER TABLE tasks ADD COLUMN advertiserCost DECIMAL(10,2);

-- Add platformRevenue column
ALTER TABLE tasks ADD COLUMN platformRevenue DECIMAL(10,2);

-- ============================================
-- 4. Create indexes for performance
-- ============================================

-- Users indexes
CREATE INDEX idx_users_tier ON users(tier);

-- Advertisers indexes  
CREATE INDEX idx_advertisers_tier ON advertisers(tier);

-- UserTasks indexes
CREATE INDEX idx_userTasks_userId ON userTasks(userId);
CREATE INDEX idx_userTasks_taskId ON userTasks(taskId);
CREATE INDEX idx_userTasks_status ON userTasks(status);
CREATE INDEX idx_userTasks_scheduledPaymentAt ON userTasks(scheduledPaymentAt);

-- Transactions indexes
CREATE INDEX idx_transactions_userId ON transactions(userId);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_taskId ON transactions(taskId);

-- Tasks indexes
CREATE INDEX idx_tasks_advertiserId ON tasks(advertiserId);
CREATE INDEX idx_tasks_status ON tasks(status);

-- ============================================
-- Migration Complete
-- ============================================
