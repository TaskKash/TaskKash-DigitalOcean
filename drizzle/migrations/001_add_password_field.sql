-- Migration: Add password field to users table
-- Date: 2025-11-03
-- Description: Add password field for email/password authentication

ALTER TABLE users ADD COLUMN password VARCHAR(255) NULL COMMENT 'bcrypt hashed password for email/password auth';
