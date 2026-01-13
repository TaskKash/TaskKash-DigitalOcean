-- Seed Data for TaskKash
-- Date: November 2025
-- Description: Initial data for testing and beta launch

-- ============================================
-- 1. Countries
-- ============================================

INSERT INTO countries (id, nameAr, nameEn, code, currency, currencySymbol, isActive, createdAt) VALUES
(1, 'مصر', 'Egypt', 'EG', 'EGP', 'ج.م', 1, NOW()),
(2, 'السعودية', 'Saudi Arabia', 'SA', 'SAR', 'ر.س', 1, NOW()),
(3, 'الإمارات', 'United Arab Emirates', 'AE', 'AED', 'د.إ', 1, NOW()),
(4, 'الكويت', 'Kuwait', 'KW', 'KWD', 'د.ك', 1, NOW()),
(5, 'قطر', 'Qatar', 'QA', 'QAR', 'ر.ق', 1, NOW()),
(6, 'البحرين', 'Bahrain', 'BH', 'BHD', 'د.ب', 1, NOW()),
(7, 'عمان', 'Oman', 'OM', 'OMR', 'ر.ع', 1, NOW()),
(8, 'الأردن', 'Jordan', 'JO', 'JOD', 'د.أ', 1, NOW()),
(9, 'لبنان', 'Lebanon', 'LB', 'LBP', 'ل.ل', 1, NOW()),
(10, 'المغرب', 'Morocco', 'MA', 'MAD', 'د.م', 1, NOW())
ON DUPLICATE KEY UPDATE nameAr=VALUES(nameAr);

-- ============================================
-- 2. Test Admin User
-- ============================================

INSERT INTO users (
  openId, name, email, password, loginMethod, role, phone, balance, completedTasks, 
  totalEarnings, tier, profileStrength, countryId, isVerified, averageRating, createdAt
) VALUES (
  'admin_test_001',
  'Admin User',
  'admin@taskkash.com',
  '$2b$10$VQkWXQ1a3sI/IGDRj3fYu..vMsKrIyI5A4SAbqEC813IyW4OKs4KG',
  'email',
  'admin',
  '+201234567890',
  0.00,
  0,
  0,
  'tier1',
  100,
  1,
  1,
  0.00,
  NOW()
) ON DUPLICATE KEY UPDATE email=VALUES(email);

-- ============================================
-- 3. Test Regular Users
-- ============================================

INSERT INTO users (
  openId, name, email, password, loginMethod, role, phone, balance, completedTasks, 
  totalEarnings, tier, profileStrength, countryId, averageRating, isVerified, createdAt
) VALUES 
-- Tier 1 User (Bronze)
(
  'user_test_001',
  'Ahmed Mohamed',
  'ahmed@example.com',
  '$2b$10$VQkWXQ1a3sI/IGDRj3fYu..vMsKrIyI5A4SAbqEC813IyW4OKs4KG',
  'email',
  'user',
  '+201111111111',
  150.00,
  5,
  200,
  'tier1',
  80,
  1,
  4.2,
  1,
  NOW()
),
-- Tier 2 User (Silver)
(
  'user_test_002',
  'Fatima Ali',
  'fatima@example.com',
  '$2b$10$VQkWXQ1a3sI/IGDRj3fYu..vMsKrIyI5A4SAbqEC813IyW4OKs4KG',
  'email',
  'user',
  '+201222222222',
  500.00,
  25,
  1500,
  'tier2',
  90,
  1,
  4.5,
  1,
  NOW()
),
-- Tier 3 User (Gold)
(
  'user_test_003',
  'Omar Hassan',
  'omar@example.com',
  '$2b$10$VQkWXQ1a3sI/IGDRj3fYu..vMsKrIyI5A4SAbqEC813IyW4OKs4KG',
  'email',
  'user',
  '+201333333333',
  2000.00,
  100,
  8000,
  'tier3',
  100,
  1,
  4.8,
  1,
  NOW()
)
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- ============================================
-- 4. Test Advertisers
-- ============================================

INSERT INTO advertisers (
  slug, nameAr, nameEn, descriptionAr, descriptionEn, category, verified, 
  totalCampaigns, paymentRate, rating, reviewCount, countryId, tier, 
  monthlySpend, isActive, createdAt
) VALUES 
-- Tier 1 Advertiser
(
  'test-company-1',
  'شركة الاختبار الأولى',
  'Test Company 1',
  'شركة تجريبية للاختبار',
  'Test company for testing purposes',
  'Technology',
  1,
  5,
  100,
  45,
  10,
  1,
  'tier1',
  500.00,
  1,
  NOW()
),
-- Tier 2 Advertiser
(
  'test-company-2',
  'شركة الاختبار الثانية',
  'Test Company 2',
  'شركة تجريبية كبيرة',
  'Large test company',
  'E-commerce',
  1,
  15,
  100,
  48,
  25,
  1,
  'tier2',
  2500.00,
  1,
  NOW()
),
-- Tier 3 Advertiser
(
  'test-company-3',
  'شركة الاختبار الثالثة',
  'Test Company 3',
  'شركة تجريبية متميزة',
  'Premium test company',
  'Finance',
  1,
  30,
  100,
  49,
  50,
  1,
  'tier3',
  7500.00,
  1,
  NOW()
)
ON DUPLICATE KEY UPDATE slug=VALUES(slug);

-- ============================================
-- 5. Test Tasks
-- ============================================

INSERT INTO tasks (
  advertiserId, titleAr, titleEn, descriptionAr, descriptionEn, type, reward, 
  duration, difficulty, requiredProfileStrength, maxCompletions, currentCompletions, 
  rating, status, countryId, advertiserCost, platformRevenue, createdAt
) VALUES 
-- Easy Survey Task
(
  1,
  'استبيان عن المنتجات التقنية',
  'Tech Products Survey',
  'استبيان بسيط عن استخدام المنتجات التقنية',
  'Simple survey about tech product usage',
  'survey',
  25,
  10,
  'easy',
  30,
  100,
  15,
  45,
  'available',
  1,
  27.50,
  3.75,
  NOW()
),
-- Medium App Review Task
(
  2,
  'تقييم تطبيق التسوق الإلكتروني',
  'E-commerce App Review',
  'تحميل وتقييم تطبيق التسوق الإلكتروني الجديد',
  'Download and review new e-commerce app',
  'app',
  50,
  20,
  'medium',
  50,
  50,
  8,
  48,
  'available',
  1,
  57.50,
  12.50,
  NOW()
),
-- Hard Social Media Task
(
  3,
  'حملة تسويقية على وسائل التواصل',
  'Social Media Marketing Campaign',
  'نشر محتوى تسويقي على وسائل التواصل الاجتماعي',
  'Post marketing content on social media',
  'social',
  100,
  30,
  'hard',
  70,
  30,
  3,
  49,
  'available',
  1,
  120.00,
  30.00,
  NOW()
)
ON DUPLICATE KEY UPDATE titleEn=VALUES(titleEn);

-- ============================================
-- Seed Data Complete
-- ============================================
