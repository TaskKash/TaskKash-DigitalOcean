-- Migration: Modify Existing Fields for Business Model
-- Date: November 2025
-- Description: Modify existing fields to match business model requirements

-- ============================================
-- 1. Update users table
-- ============================================

-- Modify tier column to use our tier system
ALTER TABLE users MODIFY COLUMN tier VARCHAR(20) DEFAULT 'tier1';

-- Modify balance to use DECIMAL for precision
ALTER TABLE users MODIFY COLUMN balance DECIMAL(10,2) DEFAULT 0.00;

-- Add averageRating column if not exists
ALTER TABLE users ADD COLUMN averageRating DECIMAL(3,2) DEFAULT 0.00;

-- ============================================
-- 2. Update advertisers table
-- ============================================

-- Add tier column if not exists
ALTER TABLE advertisers ADD COLUMN tier VARCHAR(20) DEFAULT 'tier1';

-- Add monthlySpend column
ALTER TABLE advertisers ADD COLUMN monthlySpend DECIMAL(10,2) DEFAULT 0.00;

-- ============================================
-- 3. Update userTasks table
-- ============================================

-- Add commission and earnings columns
ALTER TABLE userTasks ADD COLUMN userEarnings DECIMAL(10,2);
ALTER TABLE userTasks ADD COLUMN userCommission DECIMAL(10,2);
ALTER TABLE userTasks ADD COLUMN advertiserCost DECIMAL(10,2);
ALTER TABLE userTasks ADD COLUMN advertiserCommission DECIMAL(10,2);

-- Add payment scheduling columns
ALTER TABLE userTasks ADD COLUMN scheduledPaymentAt DATETIME;
ALTER TABLE userTasks ADD COLUMN paidAt DATETIME;

-- Add rating and feedback columns
ALTER TABLE userTasks ADD COLUMN rating INT;
ALTER TABLE userTasks ADD COLUMN feedback TEXT;

-- ============================================
-- 4. Update transactions table
-- ============================================

-- Add balance tracking columns
ALTER TABLE transactions ADD COLUMN balanceBefore DECIMAL(10,2);
ALTER TABLE transactions ADD COLUMN balanceAfter DECIMAL(10,2);

-- Add task reference
ALTER TABLE transactions ADD COLUMN taskId INT;

-- Add processing timestamp
ALTER TABLE transactions ADD COLUMN processedAt DATETIME;

-- Add note and metadata
ALTER TABLE transactions ADD COLUMN note TEXT;
ALTER TABLE transactions ADD COLUMN metadata JSON;

-- ============================================
-- 5. Update tasks table
-- ============================================

-- Add cost and revenue tracking
ALTER TABLE tasks ADD COLUMN advertiserCost DECIMAL(10,2);
ALTER TABLE tasks ADD COLUMN platformRevenue DECIMAL(10,2);

-- ============================================
-- 6. Create indexes for performance
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
