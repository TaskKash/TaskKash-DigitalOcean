-- Perfected Seed Data for TaskKash (MySQL compatible)
USE taskkash;

-- 1. Insert Countries
INSERT INTO countries (id, nameAr, nameEn, code, currency, currencySymbol, isActive, createdAt) VALUES
(1, 'مصر', 'Egypt', 'EG', 'EGP', 'ج.م', 1, NOW()),
(2, 'السعودية', 'Saudi Arabia', 'SA', 'SAR', 'ر.س', 1, NOW()),
(3, 'الإمارات', 'United Arab Emirates', 'AE', 'AED', 'د.إ', 1, NOW())
ON DUPLICATE KEY UPDATE 
  nameAr=VALUES(nameAr), nameEn=VALUES(nameEn), code=VALUES(code), 
  currency=VALUES(currency), currencySymbol=VALUES(currencySymbol);

-- 2. Insert Test Users
INSERT INTO users (
  openId, name, email, password, loginMethod, role, balance, completedTasks, 
  totalEarnings, tier, profileStrength, countryId, isVerified, createdAt
) VALUES 
('admin_001', 'Admin User', 'admin@taskkash.com', 
  '$2b$10$VQkWXQ1a3sI/IGDRj3fYu..vMsKrIyI5A4SAbqEC813IyW4OKs4KG',
  'email', 'admin', 0, 0, 0, 'bronze', 100, 1, 1, NOW()),
('user_001', 'Ahmed Mohamed', 'ahmed@example.com',
  '$2b$10$VQkWXQ1a3sI/IGDRj3fYu..vMsKrIyI5A4SAbqEC813IyW4OKs4KG',
  'email', 'user', 15000, 5, 20000, 'bronze', 80, 1, 1, NOW()),
('user_002', 'Fatima Ali', 'fatima@example.com',
  '$2b$10$VQkWXQ1a3sI/IGDRj3fYu..vMsKrIyI5A4SAbqEC813IyW4OKs4KG',
  'email', 'user', 50000, 25, 150000, 'silver', 90, 1, 1, NOW()),
('user_003', 'Omar Hassan', 'omar@example.com',
  '$2b$10$VQkWXQ1a3sI/IGDRj3fYu..vMsKrIyI5A4SAbqEC813IyW4OKs4KG',
  'email', 'user', 200000, 100, 500000, 'gold', 95, 1, 1, NOW())
ON DUPLICATE KEY UPDATE 
  name=VALUES(name), email=VALUES(email), password=VALUES(password), 
  tier=VALUES(tier), profileStrength=VALUES(profileStrength), balance=VALUES(balance);

-- 3. Insert Advertisers
INSERT INTO advertisers (
  id, slug, nameEn, nameAr, descriptionEn, descriptionAr,
  logoUrl, countryId, isActive, balance, totalSpent, createdAt
) VALUES
(1, 'samsung-egypt', 'Samsung Egypt', 'سامسونج مصر', 'Leading electronics manufacturer', 'الشركة الرائدة في تنصيع الإلكترونيات', '/logos/samsung.png', 1, 1, 50000.00, 0.00, NOW()),
(2, 'vodafone-egypt', 'Vodafone Egypt', 'فودافون مصر', 'Leading telecom provider', 'مزود الاتصالات الرائد', '/logos/vodafone.png', 1, 1, 40000.00, 0.00, NOW()),
(3, 'cocacola-egypt', 'Coca-Cola Egypt', 'كوكاكولا مصر', 'World-famous beverage company', 'شركة المشروبات العالمية الشهيرة', '/logos/cocacola.png', 1, 1, 30000.00, 0.00, NOW()),
(4, 'orange-egypt', 'Orange Egypt', 'أورانج مصر', 'Telecom and mobile services', 'خدمات الاتصالات والمحمول', '/logos/orange.png', 1, 1, 35000.00, 0.00, NOW()),
(5, 'etisalat-egypt', 'Etisalat Egypt', 'اتصالات مصر', 'Telecom and digital services', 'خدمات الاتصالات والرقمية', '/logos/etisalat.png', 1, 1, 32000.00, 0.00, NOW()),
(6, 'we-egypt', 'WE (Telecom Egypt)', 'وي (المصرية للاتصالات)', 'National telecom operator', 'مشغل الاتصالات الوطني', '/logos/we.png', 1, 1, 45000.00, 0.00, NOW()),
(7, 'pepsi-egypt', 'Pepsi Egypt', 'بيبسي مصر', 'Global beverage brand', 'علامة تجارية عالمية للمشروبات', '/logos/pepsi.png', 1, 1, 28000.00, 0.00, NOW()),
(8, 'juhayna-egypt', 'Juhayna', 'جهينة', 'Leading dairy and juice company', 'الشركة الرائدة في منتجات الألبان والعصائر', '/logos/juhayna.png', 1, 1, 25000.00, 0.00, NOW()),
(9, 'sprite-egypt', 'Sprite', 'سبرايت', 'Global lemon-lime soda brand', 'علامة تجارية عالمية لمشروب الليمون', '/logos/generic.png', 1, 1, 20000.00, 0.00, NOW())
ON DUPLICATE KEY UPDATE 
  slug=VALUES(slug), nameEn=VALUES(nameEn), nameAr=VALUES(nameAr), 
  descriptionEn=VALUES(descriptionEn), descriptionAr=VALUES(descriptionAr), 
  logoUrl=VALUES(logoUrl), balance=VALUES(balance);

-- 4. Insert Sample Tasks
INSERT INTO tasks (
  id, advertiserId, type, titleEn, titleAr, descriptionEn, descriptionAr,
  reward, duration, difficulty, maxCompletions, status, targetTiers,
  countryId, createdAt, config
) VALUES
(1, 1, 'video', 'Galaxy S25 Unboxing & First Look', 'معاينة وفتح صندوق Galaxy S25', 'Watch the unboxing of the newest Samsung flagship', 'شاهد فتح صندوق أحدث هواتف سامسونج الرائدة', 2500, 5, 'easy', 400, 'active', '["bronze","silver","gold"]', 1, NOW(), '{"videoUrl":"/videos/samsung_s25_unboxing.mp4","coverImage":"/logos/samsung.png","passingScore":80,"minWatchPercentage":80}'),
(2, 2, 'video', 'Vodafone AFCON Celebration', 'احتفال فودافون بكأس الأمم الأفريقية', 'Watch Vodafone celebration of African football', 'شاهد احتفال فودافون بكرة القدم الأفريقية', 2000, 4, 'easy', 400, 'active', '["bronze","silver","gold"]', 1, NOW(), '{"videoUrl":"/videos/vodafone_afcon.mp4.mp4","coverImage":"/logos/vodafone.png","passingScore":80,"minWatchPercentage":80}'),
(3, 3, 'video', 'Coca-Cola Ramadan Spirit', 'روح الصداقة من كوكاكولا', 'Experience the Ramadan magic with Coca-Cola', 'عش سحر رمضان مع كوكاكولا', 1500, 3, 'easy', 400, 'active', '["bronze","silver","gold"]', 1, NOW(), '{"videoUrl":"/videos/cocacola_ramadan.mp4","coverImage":"/logos/cocacola.png","passingScore":80,"minWatchPercentage":80}'),
(4, 1, 'video', 'Samsung Neo QLED 8K Review', 'مراجعة Samsung Neo QLED 8K', 'Discover the next generation of TV technology', 'اكتشف الجيل القادم من تكنولوجيا التلفزيون', 3000, 6, 'medium', 500, 'active', '["silver","gold"]', 1, NOW(), '{"videoUrl":"/videos/samsung_neo_qled.mp4","coverImage":"/logos/samsung.png","passingScore":80,"minWatchPercentage":80}'),
(5, 4, 'video', 'Orange 5G Network Launch', 'إطلاق شبكة أورانج 5G', 'Experience the speed of Orange 5G in Egypt', 'اختبر سرعة أورانج 5G في مصر', 2200, 4, 'easy', 300, 'active', '["bronze","silver","gold"]', 1, NOW(), '{"videoUrl":"/videos/orange_5g.mp4","coverImage":"/logos/orange.png","passingScore":80,"minWatchPercentage":80}'),
(6, 5, 'video', 'Etisalat 5G Future', 'مستقبل اتصالات 5G', 'Step into the future with Etisalat 5G services', 'خطوة نحو المستقبل مع خدمات اتصالات 5G', 2100, 4, 'easy', 300, 'active', '["bronze","silver","gold"]', 1, NOW(), '{"videoUrl":"/videos/etisalat_5g.mp4.mp4","coverImage":"/logos/etisalat.png","passingScore":80,"minWatchPercentage":80}'),
(7, 6, 'video', 'WE Fiber Internet Revolution', 'ثورة WE في إنترنت الفايبر', 'How WE is changing internet speeds in Egypt', 'كيف تغير WE سرعات الإنترنت في مصر', 1800, 3, 'easy', 600, 'active', '["bronze","silver","gold"]', 1, NOW(), '{"videoUrl":"/videos/we_fiber.mp4","coverImage":"/logos/we.png","passingScore":80,"minWatchPercentage":80}'),
(8, 7, 'video', 'Pepsi Egypt Summer Vibe', 'أجواء الصيف مع بيبسي مصر', 'Enjoy the refreshing taste of Pepsi this summer', 'استمتع بمذاق بيبسي المنعش هذا الصيف', 1400, 2, 'easy', 800, 'active', '["bronze","silver","gold"]', 1, NOW(), '{"videoUrl":"/videos/pepsi_egypt.mp4","coverImage":"/logos/pepsi.png","passingScore":80,"minWatchPercentage":80}'),
(9, 8, 'video', 'Juhayna Pure Juice Story', 'قصة جهينة بيور', 'The journey of Juhayna Pure from farm to you', 'رحلة جهينة بيور من المزرعة إليك', 1600, 3, 'easy', 450, 'active', '["bronze","silver","gold"]', 1, NOW(), '{"videoUrl":"/videos/juhayna_pure.mp4","coverImage":"/logos/juhayna.png","passingScore":80,"minWatchPercentage":80}'),
(10, 1, 'video', 'Galaxy Buds 3 Pro Features', 'مميزات Galaxy Buds 3 Pro', 'Learn about the premium features of Buds 3 Pro', 'تعرف على المميزات الممتازة لـ Buds 3 Pro', 1200, 2, 'easy', 500, 'active', '["bronze","silver","gold"]', 1, NOW(), '{"videoUrl":"/videos/galaxy_buds_3_pro.mp4","coverImage":"/logos/samsung.png","passingScore":80,"minWatchPercentage":80}'),
(11, 4, 'video', 'Orange Mal3ab Sports', 'أورانج ملعب', 'Stay updated with Orange sports platform', 'ابق على اطلاع دائم بمنصة أورانج الرياضية', 1100, 2, 'easy', 700, 'active', '["bronze","silver","gold"]', 1, NOW(), '{"videoUrl":"/videos/orange_mal3ab.mp4","coverImage":"/logos/orange.png","passingScore":80,"minWatchPercentage":80}'),
(12, 9, 'video', 'Sprite Summer Refreshment', 'انتعاش الصيف مع سبرايت', 'Cool down with Sprite new summer ad', 'برد صيفك مع إعلان سبرايت الجديد', 1300, 2, 'easy', 600, 'active', '["bronze","silver","gold"]', 1, NOW(), '{"videoUrl":"/videos/sprite_summer.mp4","coverImage":"/logos/generic.png","passingScore":80,"minWatchPercentage":80}'),
(13, 2, 'video', 'Vodafone Cash Services', 'خدمات فودافون كاش', 'Manage your money easily with Vodafone Cash', 'أدر أموالك بسهولة مع فودافون كاش', 1500, 3, 'easy', 1000, 'active', '["bronze","silver","gold"]', 1, NOW(), '{"videoUrl":"/videos/vodafone_cash.mp4","coverImage":"/logos/vodafone.png","passingScore":80,"minWatchPercentage":80}')
ON DUPLICATE KEY UPDATE 
  titleEn=VALUES(titleEn), titleAr=VALUES(titleAr), 
  descriptionEn=VALUES(descriptionEn), descriptionAr=VALUES(descriptionAr),
  status=VALUES(status), config=VALUES(config), advertiserId=VALUES(advertiserId);

-- 5. Insert Sample Questions for Tasks
INSERT INTO task_questions (
  taskId, questionText, questionTextAr, questionOrder, questionType,
  optionA, optionAAr, optionB, optionBAr, optionC, optionCAr, optionD, optionDAr,
  correctAnswer, explanation, explanationAr
) VALUES
(1, 'Which phone is being unboxed?', 'أي هاتف يتم فتح صندوقه؟', 1, 'multiple_choice', 'Galaxy S23', 'Galaxy S23', 'Galaxy S24', 'Galaxy S24', 'Galaxy S25', 'Galaxy S25', 'Galaxy S26', 'Galaxy S26', 'C', 'The video features the S25', 'الفيديو يعرض S25'),
(2, 'What event is being celebrated?', 'ما هي المناسبة التي يتم الاحتفال بها؟', 1, 'multiple_choice', 'World Cup', 'كأس العالم', 'AFCON', 'كأس الأمم الأفريقية', 'Olympics', 'الأولمبياد', 'Tennis Open', 'بطولة التنس', 'B', 'Vodafone is celebrating African football', 'فودافون تحتفل بكرة القدم الأفريقية'),
(3, 'Which season is the video for?', 'لأي موسم هذا الفيديو؟', 1, 'multiple_choice', 'Winter', 'الشتاء', 'Spring', 'الربيع', 'Ramadan', 'رمضان', 'Summer', 'الصيف', 'C', 'The video is for Ramadan season', 'الفيديو لموسم رمضان'),
(4, 'What is the resolution of the TV?', 'ما هي دقة التلفزيون؟', 1, 'multiple_choice', '4K', '4K', '8K', '8K', 'HD', 'HD', 'Full HD', 'Full HD', 'B', 'It is an 8K Neo QLED TV', 'إنه تلفزيون 8K Neo QLED'),
(5, 'Which network technology is mentioned?', 'ما هي تكنولوجيا الشبكة المذكورة؟', 1, 'multiple_choice', '3G', '3G', '4G', '4G', '5G', '5G', '6G', '6G', 'C', 'Orange launched 5G network', 'أطلقت أورانج شبكة 5G'),
(6, 'What technology is being promoted?', 'ما هي التكنولوجيا التي يتم الترويج لها؟', 1, 'multiple_choice', '3G', '3G', '4G', '4G', '5G', '5G', '6G', '6G', 'C', 'Etisalat is launching 5G', 'اتصالات تطلق شبكة 5G'),
(7, 'Which service is WE promoting?', 'ما هي الخدمة التي تروج لها WE؟', 1, 'multiple_choice', 'ADSL', 'ADSL', 'Fiber Internet', 'إنترنت الفايبر', 'Dial-up', 'دايل أب', 'Mobile Data', 'بيانات الهاتف', 'B', 'WE is promoting Fiber speeds', 'WE تروج لسرعات الفايبر'),
(8, 'What is the main brand in the video?', 'ما هي العلامة التجارية الرئيسية في الفيديو؟', 1, 'multiple_choice', 'Coca-Cola', 'كوكاكولا', 'Pepsi', 'بيبسي', '7Up', 'سفن أب', 'Mirinda', 'ميرندا', 'B', 'The video is for Pepsi Egypt', 'الفيديو لبيبسي مصر'),
(9, 'What is the Juhayna product brand?', 'ما هي علامة منتج جهينة؟', 1, 'multiple_choice', 'Mix', 'ميكس', 'Rayeb', 'رايب', 'Pure', 'بيور', 'Zabadi', 'زبادي', 'C', 'The video is for Juhayna Pure', 'الفيديو لجهينة بيور'),
(10, 'Which product is being introduced?', 'أي منتج يتم تقديمه؟', 1, 'multiple_choice', 'Galaxy Watch', 'ساعة جالاكسي', 'Galaxy Buds 3 Pro', 'Galaxy Buds 3 Pro', 'Galaxy Tab', 'جالاكسي تاب', 'Galaxy S25', 'Galaxy S25', 'B', 'The video is about Buds 3 Pro', 'الفيديو عن Buds 3 Pro'),
(11, 'What is Mal3ab?', 'ما هو "ملعب"؟', 1, 'multiple_choice', 'Music app', 'تطبيق موسيقى', 'Sports platform', 'منصة رياضية', 'Shopping app', 'تطبيق تسوق', 'Game console', 'جهاز ألعاب', 'B', 'Orange Mal3ab is for sports', 'أورانج ملعب للرياضة'),
(12, 'What feeling does Sprite provide?', 'ما الشعور الذي يمنحه سبرايت؟', 1, 'multiple_choice', 'Warmth', 'الدفء', 'Refreshment', 'الانتعاش', 'Hunger', 'الجوع', 'Sleepiness', 'النعاس', 'B', 'Sprite provides refreshment', 'سبرايت يمنح الانتعاش'),
(13, 'What is the main benefit of Vodafone Cash?', 'ما هي الميزة الرئيسية لـ "فودافون كاش"؟', 1, 'multiple_choice', 'Free calls', 'مكالمات مجانية', 'Easy money management', 'سهولة إدارة الأموال', 'High speed internet', 'إنترنت سريع', 'Gaming points', 'نقاط ألعاب', 'B', 'Vodafone Cash is for money management', 'فودافون كاش لإدارة الأموال')
ON DUPLICATE KEY UPDATE questionText=VALUES(questionText);

SELECT '✅ Seed data imported successfully with ALL 13 video files!' as Status;
