-- TaskKash User Data & Compliance Framework
-- Migration 001: Database Schema Modifications
-- Date: January 9, 2026
-- Purpose: Implement 6-layer data collection model with GDPR/PDPL/CCPA compliance

-- ============================================
-- PART 1: Modify existing users table for consent tracking
-- ============================================

-- Add consent columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS behavioralConsent TINYINT(1) DEFAULT 0 COMMENT 'Layer 2 consent - behavioral profiling (default OFF)',
ADD COLUMN IF NOT EXISTS marketingConsent TINYINT(1) DEFAULT 0 COMMENT 'Layer 3 consent - marketing notifications (default OFF)',
ADD COLUMN IF NOT EXISTS marketingFrequency ENUM('off', 'low', 'medium', 'high') DEFAULT 'off' COMMENT 'Marketing notification frequency preference',
ADD COLUMN IF NOT EXISTS consentUpdatedAt TIMESTAMP NULL COMMENT 'Last consent preferences update',
ADD COLUMN IF NOT EXISTS profileTier ENUM('bronze', 'silver', 'gold', 'platinum', 'elite') DEFAULT 'bronze' COMMENT 'User profile tier based on data completion',
ADD COLUMN IF NOT EXISTS governorate VARCHAR(100) NULL COMMENT 'Egyptian governorate (optional)',
ADD COLUMN IF NOT EXISTS signupSource VARCHAR(100) NULL COMMENT 'How user found TaskKash (optional)',
ADD COLUMN IF NOT EXISTS dataRetentionSchedule DATE NULL COMMENT 'Scheduled data deletion date';

-- ============================================
-- PART 2: Create user_consent_audit table for compliance audit trail
-- ============================================

CREATE TABLE IF NOT EXISTS user_consent_audit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    consentType ENUM('layer1_security', 'layer2_behavioral', 'layer3_marketing', 'income_spi', 'kyc_biometric') NOT NULL,
    previousValue TINYINT(1) NULL,
    newValue TINYINT(1) NOT NULL,
    ipAddress VARCHAR(45) NULL,
    userAgent TEXT NULL,
    consentVersion VARCHAR(20) DEFAULT '1.0',
    legalBasis VARCHAR(100) NULL COMMENT 'GDPR legal basis for processing',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_consent (userId),
    INDEX idx_consent_type (consentType),
    INDEX idx_created_at (createdAt),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='7-year retention for legal defense - GDPR Article 7';

-- ============================================
-- PART 3: Create user_income_spi table (Sensitive Personal Information)
-- ============================================

CREATE TABLE IF NOT EXISTS user_income_spi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL UNIQUE,
    incomeRange ENUM(
        'under_3000',
        '3000_5000',
        '5000_10000',
        '10000_20000',
        '20000_50000',
        'over_50000',
        'prefer_not_to_say'
    ) NULL COMMENT 'Monthly income in EGP brackets',
    spiConsentGiven TINYINT(1) DEFAULT 0 COMMENT 'Explicit SPI consent checkbox',
    spiConsentTimestamp TIMESTAMP NULL,
    spiConsentIp VARCHAR(45) NULL,
    dataUsageAcknowledged TINYINT(1) DEFAULT 0 COMMENT 'User acknowledged how data will be used',
    thirdPartyShareConsent TINYINT(1) DEFAULT 0 COMMENT 'Consent to share with advertisers',
    retentionAcknowledged TINYINT(1) DEFAULT 0 COMMENT 'User acknowledged 3-year retention',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expiresAt DATE NULL COMMENT '3-year maximum retention',
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Separate table for income SPI data - 3 year max retention';

-- ============================================
-- PART 4: Create profile_tier_questions table
-- ============================================

CREATE TABLE IF NOT EXISTS profile_tier_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tier ENUM('tier1', 'tier2', 'tier3') NOT NULL,
    questionKey VARCHAR(100) NOT NULL UNIQUE,
    questionTextEn TEXT NOT NULL,
    questionTextAr TEXT NOT NULL,
    questionType ENUM('single_choice', 'multiple_choice', 'text', 'scale') DEFAULT 'single_choice',
    options JSON NULL COMMENT 'Array of options for choice questions',
    displayOrder INT DEFAULT 0,
    isRequired TINYINT(1) DEFAULT 1,
    isActive TINYINT(1) DEFAULT 1,
    dataCategory VARCHAR(50) NULL COMMENT 'Category for advertiser targeting',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tier (tier),
    INDEX idx_active (isActive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Profile questions for Tier 1-3 behavioral profiling';

-- ============================================
-- PART 5: Create user_profile_tier_answers table
-- ============================================

CREATE TABLE IF NOT EXISTS user_profile_tier_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    questionId INT NOT NULL,
    answerValue TEXT NOT NULL,
    answeredAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_question (userId, questionId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (questionId) REFERENCES profile_tier_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User answers to tier profile questions';

-- ============================================
-- PART 6: Create KYC Vault tables (logically separated)
-- ============================================

-- KYC verification requests
CREATE TABLE IF NOT EXISTS kyc_verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    verificationMethod ENUM('biometric_fast', 'id_only_standard') NOT NULL,
    status ENUM('pending', 'processing', 'approved', 'rejected', 'manual_review') DEFAULT 'pending',
    onfidoCheckId VARCHAR(255) NULL COMMENT 'External KYC provider reference',
    
    -- ID Document Data (permanent - 5-7 year retention)
    idType ENUM('national_id', 'passport', 'drivers_license') NULL,
    idNumber VARCHAR(100) NULL COMMENT 'Encrypted',
    idFrontImagePath VARCHAR(500) NULL,
    idBackImagePath VARCHAR(500) NULL,
    
    -- OCR Extracted Data
    extractedName VARCHAR(255) NULL,
    extractedDob DATE NULL,
    extractedGender ENUM('male', 'female') NULL,
    extractedAddress TEXT NULL,
    extractedNationality VARCHAR(100) NULL,
    
    -- Verification Results
    nameVerified TINYINT(1) DEFAULT 0,
    ageVerified TINYINT(1) DEFAULT 0,
    addressVerified TINYINT(1) DEFAULT 0,
    documentAuthentic TINYINT(1) DEFAULT 0,
    
    -- Biometric Data (TEMPORARY - 24 hour auto-delete)
    selfieImagePath VARCHAR(500) NULL COMMENT 'Auto-deleted within 24 hours',
    livenessCheckPassed TINYINT(1) NULL,
    livenessData JSON NULL COMMENT 'Blink/head turn verification data',
    biometricConsentGiven TINYINT(1) DEFAULT 0,
    biometricConsentTimestamp TIMESTAMP NULL,
    biometricScheduledDeletion TIMESTAMP NULL COMMENT 'Scheduled for 24h after upload',
    biometricDeleted TINYINT(1) DEFAULT 0,
    biometricDeletedAt TIMESTAMP NULL,
    
    -- Timestamps
    submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processedAt TIMESTAMP NULL,
    verifiedAt TIMESTAMP NULL,
    rejectionReason TEXT NULL,
    
    -- Retention
    retentionExpiresAt DATE NULL COMMENT '5-7 years from verification',
    
    INDEX idx_user_kyc (userId),
    INDEX idx_status (status),
    INDEX idx_biometric_deletion (biometricScheduledDeletion, biometricDeleted),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='KYC verification vault - physically separated from behavioral data';

-- ============================================
-- PART 7: Create data_deletion_requests table (GDPR Article 17)
-- ============================================

CREATE TABLE IF NOT EXISTS data_deletion_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    requestType ENUM('behavioral_only', 'income_only', 'full_account', 'specific_data') NOT NULL,
    specificDataTypes JSON NULL COMMENT 'Array of specific data types to delete',
    status ENUM('pending', 'processing', 'completed', 'rejected') DEFAULT 'pending',
    requestedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processedAt TIMESTAMP NULL,
    completedAt TIMESTAMP NULL,
    rejectionReason TEXT NULL COMMENT 'e.g., legal hold on KYC data',
    retentionNote TEXT NULL COMMENT 'Explanation of what data is retained and why',
    ticketId VARCHAR(50) NULL,
    dpoContact VARCHAR(255) DEFAULT 'dpo@taskkash.com',
    estimatedCompletion VARCHAR(50) DEFAULT '30 days',
    INDEX idx_user_deletion (userId),
    INDEX idx_status (status),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Track user data deletion requests - GDPR Article 17';

-- ============================================
-- PART 8: Create data_export_requests table (GDPR Article 20)
-- ============================================

CREATE TABLE IF NOT EXISTS data_export_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    exportFormat ENUM('json', 'csv') DEFAULT 'json',
    status ENUM('pending', 'processing', 'ready', 'downloaded', 'expired') DEFAULT 'pending',
    downloadUrl VARCHAR(500) NULL,
    downloadToken VARCHAR(255) NULL COMMENT 'Secure one-time download token',
    expiresAt TIMESTAMP NULL COMMENT 'Download link expiration (1 hour)',
    requestedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completedAt TIMESTAMP NULL,
    downloadedAt TIMESTAMP NULL,
    INDEX idx_user_export (userId),
    INDEX idx_token (downloadToken),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Track user data export requests - GDPR Article 20';

-- ============================================
-- PART 9: Insert Tier 1 Profile Questions (8 questions)
-- ============================================

INSERT INTO profile_tier_questions (tier, questionKey, questionTextEn, questionTextAr, questionType, options, displayOrder, dataCategory) VALUES
('tier1', 'occupation', 'What is your current occupation?', 'ما هي مهنتك الحالية؟', 'single_choice', 
 '["Student", "Employee (Private Sector)", "Employee (Government)", "Self-Employed", "Freelancer", "Unemployed", "Retired", "Homemaker"]', 1, 'demographics'),

('tier1', 'interests', 'What are your main interests? (Select up to 5)', 'ما هي اهتماماتك الرئيسية؟ (اختر حتى 5)', 'multiple_choice',
 '["Technology", "Sports", "Fashion", "Food & Cooking", "Travel", "Gaming", "Music", "Movies & TV", "Reading", "Fitness", "Art & Design", "Business", "Education", "Health & Wellness"]', 2, 'interests'),

('tier1', 'social_platforms', 'Which social media platforms do you use regularly?', 'ما هي منصات التواصل الاجتماعي التي تستخدمها بانتظام؟', 'multiple_choice',
 '["Facebook", "Instagram", "TikTok", "Twitter/X", "YouTube", "LinkedIn", "Snapchat", "WhatsApp", "Telegram", "None"]', 3, 'social'),

('tier1', 'social_frequency', 'How often do you use social media?', 'كم مرة تستخدم وسائل التواصل الاجتماعي؟', 'single_choice',
 '["Multiple times daily", "Once daily", "Few times a week", "Once a week", "Rarely", "Never"]', 4, 'social'),

('tier1', 'shopping_frequency', 'How often do you shop online?', 'كم مرة تتسوق عبر الإنترنت؟', 'single_choice',
 '["Weekly", "2-3 times a month", "Monthly", "Every few months", "Rarely", "Never"]', 5, 'shopping'),

('tier1', 'preferred_stores', 'Which online stores do you shop from? (Select all that apply)', 'من أي المتاجر الإلكترونية تتسوق؟', 'multiple_choice',
 '["Amazon", "Noon", "Jumia", "Souq", "Talabat", "Carrefour", "Local stores", "Social media shops", "Other"]', 6, 'shopping'),

('tier1', 'device_primary', 'What is your primary device for internet use?', 'ما هو جهازك الأساسي لاستخدام الإنترنت؟', 'single_choice',
 '["Smartphone", "Laptop", "Desktop Computer", "Tablet"]', 7, 'device'),

('tier1', 'review_habits', 'Do you read reviews before making purchases?', 'هل تقرأ المراجعات قبل الشراء؟', 'single_choice',
 '["Always", "Usually", "Sometimes", "Rarely", "Never"]', 8, 'shopping');

-- ============================================
-- PART 10: Insert Tier 2 Profile Questions (10 questions)
-- ============================================

INSERT INTO profile_tier_questions (tier, questionKey, questionTextEn, questionTextAr, questionType, options, displayOrder, dataCategory) VALUES
('tier2', 'purchase_categories', 'What categories do you spend the most on?', 'ما هي الفئات التي تنفق عليها أكثر؟', 'multiple_choice',
 '["Electronics", "Fashion & Clothing", "Food & Groceries", "Entertainment", "Health & Beauty", "Home & Garden", "Sports & Fitness", "Education", "Travel", "Automotive"]', 1, 'spending'),

('tier2', 'favorite_brands_tech', 'Which technology brands do you prefer?', 'ما هي ماركات التكنولوجيا المفضلة لديك؟', 'multiple_choice',
 '["Apple", "Samsung", "Huawei", "Xiaomi", "Oppo", "Vivo", "Google", "Sony", "LG", "Other", "No preference"]', 2, 'brands'),

('tier2', 'favorite_brands_fashion', 'Which fashion brands do you prefer?', 'ما هي ماركات الأزياء المفضلة لديك؟', 'multiple_choice',
 '["Zara", "H&M", "Nike", "Adidas", "LC Waikiki", "Max", "Defacto", "Local brands", "No preference"]', 3, 'brands'),

('tier2', 'purchase_decision', 'What most influences your purchase decisions?', 'ما الذي يؤثر على قرارات الشراء الخاصة بك؟', 'multiple_choice',
 '["Price", "Quality", "Brand reputation", "Reviews", "Recommendations from friends", "Social media influencers", "Advertisements", "Convenience"]', 4, 'behavior'),

('tier2', 'payment_preference', 'What is your preferred payment method?', 'ما هي طريقة الدفع المفضلة لديك؟', 'single_choice',
 '["Cash on delivery", "Credit/Debit card", "Mobile wallet (Vodafone Cash, etc.)", "Bank transfer", "Installments"]', 5, 'payment'),

('tier2', 'monthly_online_spend', 'How much do you typically spend online per month?', 'كم تنفق عادة عبر الإنترنت شهرياً؟', 'single_choice',
 '["Under 500 EGP", "500-1000 EGP", "1000-2000 EGP", "2000-5000 EGP", "Over 5000 EGP", "Prefer not to say"]', 6, 'spending'),

('tier2', 'subscription_services', 'Which subscription services do you use?', 'ما هي خدمات الاشتراك التي تستخدمها؟', 'multiple_choice',
 '["Netflix", "Shahid", "Spotify", "YouTube Premium", "Amazon Prime", "Gaming subscriptions", "News subscriptions", "None"]', 7, 'subscriptions'),

('tier2', 'ad_response', 'How do you typically respond to online ads?', 'كيف تتفاعل عادة مع الإعلانات عبر الإنترنت؟', 'single_choice',
 '["Often click and explore", "Sometimes click if interested", "Rarely click", "Use ad blockers", "Ignore completely"]', 8, 'advertising'),

('tier2', 'brand_loyalty', 'How loyal are you to your favorite brands?', 'ما مدى ولائك لعلاماتك التجارية المفضلة؟', 'single_choice',
 '["Very loyal - rarely switch", "Somewhat loyal - open to alternatives", "Not loyal - always look for best deals", "Depends on the product category"]', 9, 'behavior'),

('tier2', 'new_product_adoption', 'How quickly do you adopt new products/technologies?', 'ما مدى سرعة تبنيك للمنتجات/التقنيات الجديدة؟', 'single_choice',
 '["Early adopter - first to try", "Early majority - after some reviews", "Late majority - wait until proven", "Laggard - only when necessary"]', 10, 'behavior');

-- ============================================
-- PART 11: Insert Tier 3 Profile Questions (10 questions - NO financial distress)
-- ============================================

INSERT INTO profile_tier_questions (tier, questionKey, questionTextEn, questionTextAr, questionType, options, displayOrder, dataCategory) VALUES
('tier3', 'life_goals', 'What are your main life goals for the next 5 years?', 'ما هي أهدافك الرئيسية للسنوات الخمس القادمة؟', 'multiple_choice',
 '["Career advancement", "Starting a business", "Buying a home", "Getting married", "Having children", "Education/Learning", "Travel", "Financial security", "Health improvement", "Personal development"]', 1, 'lifestyle'),

('tier3', 'content_consumption', 'What type of content do you consume most?', 'ما نوع المحتوى الذي تستهلكه أكثر؟', 'multiple_choice',
 '["News", "Entertainment", "Educational", "Sports", "Lifestyle", "Technology", "Business", "Health", "Comedy", "Documentary"]', 2, 'content'),

('tier3', 'content_format', 'What format do you prefer for content?', 'ما هو التنسيق المفضل لديك للمحتوى؟', 'single_choice',
 '["Short videos (TikTok, Reels)", "Long videos (YouTube)", "Articles/Blogs", "Podcasts", "Social media posts", "Live streams"]', 3, 'content'),

('tier3', 'research_habits', 'How do you research before major purchases?', 'كيف تبحث قبل عمليات الشراء الكبيرة؟', 'multiple_choice',
 '["Google search", "YouTube reviews", "Ask friends/family", "Social media", "Visit stores", "Read expert reviews", "Compare prices online", "Check brand websites"]', 4, 'behavior'),

('tier3', 'weekend_activities', 'How do you typically spend your weekends?', 'كيف تقضي عادة عطلات نهاية الأسبوع؟', 'multiple_choice',
 '["Family time", "Going out with friends", "Shopping", "Sports/Exercise", "Entertainment (movies, etc.)", "Relaxing at home", "Working/Side projects", "Hobbies", "Religious activities"]', 5, 'lifestyle'),

('tier3', 'transportation', 'What is your primary mode of transportation?', 'ما هي وسيلة النقل الأساسية لديك؟', 'single_choice',
 '["Own car", "Ride-sharing (Uber, Careem)", "Public transportation", "Motorcycle/Scooter", "Walking", "Company transportation"]', 6, 'lifestyle'),

('tier3', 'dining_habits', 'How often do you eat out or order food delivery?', 'كم مرة تأكل في الخارج أو تطلب توصيل الطعام؟', 'single_choice',
 '["Daily", "Several times a week", "Once a week", "Few times a month", "Rarely", "Never"]', 7, 'food'),

('tier3', 'health_fitness', 'How would you describe your approach to health and fitness?', 'كيف تصف نهجك تجاه الصحة واللياقة؟', 'single_choice',
 '["Very active - exercise regularly", "Moderately active - occasional exercise", "Trying to be more active", "Not very active", "Health conditions limit activity"]', 8, 'health'),

('tier3', 'news_sources', 'Where do you get your news from?', 'من أين تحصل على أخبارك؟', 'multiple_choice',
 '["Social media", "News websites", "TV", "Radio", "Newspapers", "News apps", "Friends/Family", "I don''t follow news"]', 9, 'content'),

('tier3', 'future_purchases', 'What major purchases are you planning in the next year?', 'ما هي المشتريات الكبيرة التي تخطط لها في العام القادم؟', 'multiple_choice',
 '["Smartphone", "Laptop/Computer", "Home appliances", "Furniture", "Car", "Property", "Travel/Vacation", "Education courses", "Nothing major planned"]', 10, 'purchase_intent');

-- ============================================
-- PART 12: Create indexes for performance
-- ============================================

-- Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_tier_consent ON users(profileTier, behavioralConsent);
CREATE INDEX IF NOT EXISTS idx_users_governorate ON users(governorate);

-- ============================================
-- PART 13: Update existing user_consents table
-- ============================================

-- Add new consent types to existing table
ALTER TABLE user_consents 
MODIFY COLUMN consentType ENUM(
    'mandatory_kyc',
    'personalization',
    'analytics',
    'marketing',
    'data_sharing',
    'layer1_security',
    'layer2_behavioral',
    'layer3_marketing',
    'income_spi',
    'kyc_biometric'
) NOT NULL;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
