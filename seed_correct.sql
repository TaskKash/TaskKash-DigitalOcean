-- Corrected Seed Data for TaskKash
USE taskkash;

-- 1. Insert Countries
INSERT INTO countries (id, nameAr, nameEn, code, currency, currencySymbol, isActive, createdAt) VALUES
(1, 'مصر', 'Egypt', 'EG', 'EGP', 'ج.م', 1, NOW()),
(2, 'السعودية', 'Saudi Arabia', 'SA', 'SAR', 'ر.س', 1, NOW()),
(3, 'الإمارات', 'United Arab Emirates', 'AE', 'AED', 'د.إ', 1, NOW())
ON DUPLICATE KEY UPDATE nameAr=VALUES(nameAr);

-- 2. Insert Test Users (password: password123 for all)
INSERT INTO users (
  openId, name, email, password, loginMethod, role, balance, completedTasks, 
  totalEarnings, tier, profileStrength, countryId, isVerified, averageRating, createdAt
) VALUES 
('admin_001', 'Admin User', 'admin@taskkash.com', 
  '$2b$10$VQkWXQ1a3sI/IGDRj3fYu..vMsKrIyI5A4SAbqEC813IyW4OKs4KG',
  'email', 'admin', 0.00, 0, 0, 'tier1', 100, 1, 1, 0.00, NOW()),
('user_001', 'Ahmed Mohamed', 'ahmed@example.com',
  '$2b$10$VQkWXQ1a3sI/IGDRj3fYu..vMsKrIyI5A4SAbqEC813IyW4OKs4KG',
  'email', 'user', 150.00, 5, 200, 'tier1', 80, 1, 1, 4.2, NOW()),
('user_002', 'Fatima Ali', 'fatima@example.com',
  '$2b$10$VQkWXQ1a3sI/IGDRj3fYu..vMsKrIyI5A4SAbqEC813IyW4OKs4KG',
  'email', 'user', 500.00, 25, 1500, 'tier2', 90, 1, 1, 4.5, NOW()),
('user_003', 'Omar Hassan', 'omar@example.com',
  '$2b$10$VQkWXQ1a3sI/IGDRj3fYu..vMsKrIyI5A4SAbqEC813IyW4OKs4KG',
  'email', 'user', 2000.00, 100, 5000, 'tier3', 95, 1, 1, 4.8, NOW())
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- 3. Insert Advertisers
INSERT INTO advertisers (
  id, openId, nameEn, nameAr, email, password, slug, logoUrl, websiteUrl,
  descriptionEn, descriptionAr, isActive, balance, totalSpent, createdAt
) VALUES
(1, 'adv_samsung_001', 'Samsung Egypt', 'سامسونج مصر', 'contact@samsung-egypt.com',
  '$2b$10$VQkWXQ1a3sI/IGDRj3fYu..vMsKrIyI5A4SAbqEC813IyW4OKs4KG',
  'samsung-egypt', '/covers/samsung.jpg', 'https://www.samsung.com/eg/',
  'Leading electronics manufacturer', 'الشركة الرائدة في تصنيع الإلكترونيات',
  1, 50000.00, 0.00, NOW()),
(2, 'adv_vodafone_001', 'Vodafone Egypt', 'فودافون مصر', 'info@vodafone.com.eg',
  '$2b$10$VQkWXQ1a3sI/IGDRj3fYu..vMsKrIyI5A4SAbqEC813IyW4OKs4KG',
  'vodafone-egypt', '/covers/vodafone.jpg', 'https://www.vodafone.com.eg/',
  'Leading telecom provider', 'مزود الاتصالات الرائد',
  1, 40000.00, 0.00, NOW()),
(3, 'adv_cocacola_001', 'Coca-Cola Egypt', 'كوكاكولا مصر', 'contact@coca-cola-egypt.com',
  '$2b$10$VQkWXQ1a3sI/IGDRj3fYu..vMsKrIyI5A4SAbqEC813IyW4OKs4KG',
  'cocacola-egypt', '/covers/cocacola.jpg', 'https://www.coca-cola.com/',
  'World-famous beverage company', 'شركة المشروبات العالمية الشهيرة',
  1, 30000.00, 0.00, NOW())
ON DUPLICATE KEY UPDATE nameEn=VALUES(nameEn);

-- 4. Insert Sample Tasks
INSERT INTO tasks (
  advertiserId, type, titleEn, titleAr, descriptionEn, descriptionAr,
  reward, totalBudget, completionsNeeded, minimumBudget, difficulty, duration,
  status, targetTiers, verificationMethod, passingScore, minWatchPercentage,
  taskData, createdAt, publishedAt
) VALUES
(1, 'video_watch', 
  'Watch Samsung Galaxy Z Fold7 Launch Video', 
  'شاهد فيديو إطلاق Samsung Galaxy Z Fold7',
  'Watch the official launch video for the new Samsung Galaxy Z Fold7 and answer questions',
  'شاهد فيديو الإطلاق الرسمي لـ Samsung Galaxy Z Fold7 الجديد وأجب على الأسئلة',
  25.00, 10000.00, 400, 1000.00, 'easy', 5, 'active',
  '["tier1","tier2","tier3"]', 'quiz', 80, 80,
  '{"videoUrl":"https://www.youtube.com/watch?v=dQw4w9WgXcQ","coverImage":"/covers/samsung.jpg"}',
  NOW(), NOW()),
(2, 'video_watch',
  'Vodafone 5G Network Introduction',
  'مقدمة شبكة فودافون 5G',
  'Learn about Vodafone new 5G network coverage in Egypt',
  'تعرف على تغطية شبكة فودافون 5G الجديدة في مصر',
  20.00, 8000.00, 400, 800.00, 'easy', 4, 'active',
  '["tier1","tier2","tier3"]', 'quiz', 80, 80,
  '{"videoUrl":"https://www.youtube.com/watch?v=dQw4w9WgXcQ","coverImage":"/covers/vodafone.jpg"}',
  NOW(), NOW()),
(3, 'video_watch',
  'Coca-Cola Summer Campaign 2025',
  'حملة كوكاكولا الصيفية 2025',
  'Watch Coca-Cola exciting summer campaign video',
  'شاهد فيديو حملة كوكاكولا الصيفية المثيرة',
  15.00, 6000.00, 400, 600.00, 'easy', 3, 'active',
  '["tier1","tier2","tier3"]', 'quiz', 80, 80,
  '{"videoUrl":"https://www.youtube.com/watch?v=dQw4w9WgXcQ","coverImage":"/covers/cocacola.jpg"}',
  NOW(), NOW())
ON DUPLICATE KEY UPDATE titleEn=VALUES(titleEn);

-- 5. Insert Sample Questions for Tasks
INSERT INTO task_questions (
  taskId, questionText, questionTextAr, questionOrder, questionType,
  optionA, optionAAr, optionB, optionBAr, optionC, optionCAr, optionD, optionDAr,
  correctAnswer, explanation, explanationAr
) VALUES
(1, 'What is the main feature of Galaxy Z Fold7?', 'ما هي الميزة الرئيسية لـ Galaxy Z Fold7؟', 1, 'multiple_choice',
  'Water resistance', 'مقاومة الماء', 'Foldable screen', 'شاشة قابلة للطي',
  'Wireless charging', 'شحن لاسلكي', '5G connectivity', 'اتصال 5G',
  'B', 'The foldable screen is the signature feature', 'الشاشة القابلة للطي هي الميزة المميزة'),
(1, 'What type of screen does it have?', 'ما نوع الشاشة؟', 2, 'multiple_choice',
  'LCD', 'LCD', 'OLED', 'OLED', 'Dynamic AMOLED', 'Dynamic AMOLED', 'IPS', 'IPS',
  'C', 'Samsung uses Dynamic AMOLED technology', 'تستخدم سامسونج تقنية Dynamic AMOLED'),
(2, 'What is Vodafone 5G network speed?', 'ما هي سرعة شبكة فودافون 5G؟', 1, 'multiple_choice',
  'Up to 100 Mbps', 'حتى 100 ميجابت/ث', 'Up to 1 Gbps', 'حتى 1 جيجابت/ث',
  'Up to 10 Gbps', 'حتى 10 جيجابت/ث', 'Up to 100 Gbps', 'حتى 100 جيجابت/ث',
  'C', '5G can reach speeds up to 10 Gbps', 'يمكن أن تصل 5G إلى سرعات تصل إلى 10 جيجابت/ث'),
(3, 'What is Coca-Cola campaign theme?', 'ما هو موضوع حملة كوكاكولا؟', 1, 'multiple_choice',
  'Winter', 'الشتاء', 'Spring', 'الربيع', 'Summer', 'الصيف', 'Autumn', 'الخريف',
  'C', 'The campaign is for summer season', 'الحملة لموسم الصيف')
ON DUPLICATE KEY UPDATE questionText=VALUES(questionText);

SELECT '✅ Seed data imported successfully!' as Status;
