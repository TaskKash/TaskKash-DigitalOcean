-- Migration 002: Campaign Approval Workflow
-- Adds approval status, admin notes, and review tracking to campaigns

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS approvalStatus ENUM('pending', 'approved', 'rejected', 'revision_requested') DEFAULT 'pending' AFTER status,
  ADD COLUMN IF NOT EXISTS adminReviewNotes TEXT DEFAULT NULL AFTER approvalStatus,
  ADD COLUMN IF NOT EXISTS reviewedBy INT DEFAULT NULL AFTER adminReviewNotes,
  ADD COLUMN IF NOT EXISTS reviewedAt TIMESTAMP NULL DEFAULT NULL AFTER reviewedBy;

-- For existing campaigns that are already active/completed, mark them as approved
UPDATE campaigns SET approvalStatus = 'approved' WHERE status IN ('active', 'completed');
