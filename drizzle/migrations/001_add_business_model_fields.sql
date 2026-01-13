-- Migration: Add Business Model Fields
-- Date: November 2025
-- Description: Add tier, balance, and other business model fields to existing tables

-- ============================================
-- 1. Update users table
-- ============================================

-- Add tier column
ALTER TABLE users ADD COLUMN tier VARCHAR(20) DEFAULT 'tier1';

-- Add balance column
ALTER TABLE users ADD COLUMN balance DECIMAL(10,2) DEFAULT 0.00;

-- Add completedTasks column for tier calculation
ALTER TABLE users ADD COLUMN completedTasks INT DEFAULT 0;

-- Add averageRating column for tier calculation
ALTER TABLE users ADD COLUMN averageRating DECIMAL(3,2) DEFAULT 0.00;

-- Add index for tier
CREATE INDEX idx_users_tier ON users(tier);

-- ============================================
-- 2. Update advertisers table
-- ============================================

-- Add tier column
ALTER TABLE advertisers ADD COLUMN tier VARCHAR(20) DEFAULT 'tier1';

-- Add monthlySpend column for tier calculation
ALTER TABLE advertisers ADD COLUMN monthlySpend DECIMAL(10,2) DEFAULT 0.00;

-- Add index for tier
CREATE INDEX idx_advertisers_tier ON advertisers(tier);

-- ============================================
-- 3. Update userTasks table
-- ============================================

-- Add userEarnings column
ALTER TABLE userTasks ADD COLUMN userEarnings DECIMAL(10,2);

-- Add userCommission column
ALTER TABLE userTasks ADD COLUMN userCommission DECIMAL(10,2);

-- Add advertiserCost column
ALTER TABLE userTasks ADD COLUMN advertiserCost DECIMAL(10,2);

-- Add advertiserCommission column
ALTER TABLE userTasks ADD COLUMN advertiserCommission DECIMAL(10,2);

-- Add scheduledPaymentAt column
ALTER TABLE userTasks ADD COLUMN scheduledPaymentAt DATETIME;

-- Add paidAt column
ALTER TABLE userTasks ADD COLUMN paidAt DATETIME;

-- Add rating column
ALTER TABLE userTasks ADD COLUMN rating INT;

-- Add feedback column
ALTER TABLE userTasks ADD COLUMN feedback TEXT;

-- Add indexes for performance
CREATE INDEX idx_userTasks_userId ON userTasks(userId);
CREATE INDEX idx_userTasks_taskId ON userTasks(taskId);
CREATE INDEX idx_userTasks_status ON userTasks(status);
CREATE INDEX idx_userTasks_scheduledPaymentAt ON userTasks(scheduledPaymentAt);

-- ============================================
-- 4. Update transactions table
-- ============================================

-- Add balanceBefore column
ALTER TABLE transactions ADD COLUMN balanceBefore DECIMAL(10,2);

-- Add balanceAfter column
ALTER TABLE transactions ADD COLUMN balanceAfter DECIMAL(10,2);

-- Add taskId column
ALTER TABLE transactions ADD COLUMN taskId INT;

-- Add processedAt column
ALTER TABLE transactions ADD COLUMN processedAt DATETIME;

-- Add note column
ALTER TABLE transactions ADD COLUMN note TEXT;

-- Add metadata column (JSON)
ALTER TABLE transactions ADD COLUMN metadata JSON;

-- Add indexes for performance
CREATE INDEX idx_transactions_userId ON transactions(userId);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_taskId ON transactions(taskId);

-- ============================================
-- 5. Update tasks table
-- ============================================

-- Add advertiserCost column (total cost including commission)
ALTER TABLE tasks ADD COLUMN advertiserCost DECIMAL(10,2);

-- Add platformRevenue column
ALTER TABLE tasks ADD COLUMN platformRevenue DECIMAL(10,2);

-- Add index for performance
CREATE INDEX idx_tasks_advertiserId ON tasks(advertiserId);
CREATE INDEX idx_tasks_status ON tasks(status);

-- ============================================
-- Migration Complete
-- ============================================
