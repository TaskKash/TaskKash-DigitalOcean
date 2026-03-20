-- ==============================================================
-- TaskKash Constitution Alignment Migration
-- Aligns the database schema with Tiers_Vs_Commission.docx
-- ==============================================================

-- 1. Alter advertiser tier ENUM: basic/pro/premium → starter/growth/precision (enterprise stays)
ALTER TABLE advertisers
  MODIFY COLUMN tier ENUM('basic','pro','premium','enterprise','starter','growth','precision') NOT NULL DEFAULT 'starter';

-- Migrate existing data
UPDATE advertisers SET tier = 'starter'   WHERE tier = 'basic';
UPDATE advertisers SET tier = 'growth'    WHERE tier = 'pro';
UPDATE advertisers SET tier = 'precision' WHERE tier = 'premium';

-- Now remove old enum values (re-define with only new values)
ALTER TABLE advertisers
  MODIFY COLUMN tier ENUM('starter','growth','precision','enterprise') NOT NULL DEFAULT 'starter';


-- 2. Expand task type ENUM to include Constitution Part 5 types
ALTER TABLE tasks
  MODIFY COLUMN type ENUM('survey','app','visit','review','social','video','quiz','photo','mystery_shopping','ugc_video','lead_gen','other') NOT NULL;


-- 3. Seed 15 Constitution Task Templates
--    These are template tasks belonging to advertiser_id = 1 (default platform advertiser)
--    Grouped by Constitution Tier: T1 Starter, T2 Growth, T3 Precision, T4 Enterprise

-- ── T1: Starter Tasks (<30 seconds, Digital) ──────────────────
INSERT INTO tasks (advertiserId, titleAr, titleEn, descriptionAr, descriptionEn, type, reward, duration, difficulty, status, countryId)
VALUES
(1, 'شاهد فيديو العلامة التجارية', 'Watch Brand Video', 'شاهد الفيديو القصير وأجب على سؤال سريع', 'Watch a short brand video and answer a quick question', 'video', 10, 1, 'easy', 'available', 1),
(1, 'اختبار معرفة المنتج', 'Product Knowledge Quiz', 'أجب على 3 أسئلة سريعة عن المنتج', 'Answer 3 quick questions about the product', 'quiz', 15, 1, 'easy', 'available', 1),
(1, 'تفاعل مع منشور سوشيال ميديا', 'Social Media Engagement', 'تابع الصفحة وتفاعل مع المنشور المحدد', 'Follow the page and engage with the specified post', 'social', 8, 1, 'easy', 'available', 1),
(1, 'شاهد فيديو إعلاني طويل', 'Extended Ad Video Watch', 'شاهد الفيديو الإعلاني كاملاً وأكمل الاستبيان', 'Watch the full ad video and complete the survey', 'video', 26, 2, 'easy', 'available', 1),

-- ── T2: Growth Tasks (3-5 minutes) ────────────────────────────
(1, 'استبيان رضا العملاء', 'Customer Satisfaction Survey', 'أكمل استبيان مفصل عن تجربتك مع المنتج', 'Complete a detailed survey about your product experience', 'survey', 50, 5, 'medium', 'available', 1),
(1, 'تحميل وتقييم تطبيق', 'App Install & Review', 'حمّل التطبيق وقيّم تجربتك', 'Download the app and review your experience', 'app', 75, 5, 'medium', 'available', 1),
(1, 'استبيان أبحاث السوق', 'Market Research Survey', 'شارك في استبيان أبحاث السوق المتقدم', 'Participate in an advanced market research survey', 'survey', 104, 5, 'medium', 'available', 1),
(1, 'تفاعل متقدم مع التطبيق', 'Advanced App Engagement', 'حمّل التطبيق وأكمل 3 مهام داخلية', 'Download the app and complete 3 in-app tasks', 'app', 65, 5, 'medium', 'available', 1),

-- ── T3: Precision Tasks (Physical Effort / High Time) ─────────
(1, 'تصوير منتج في المتجر', 'In-Store Photo Audit', 'التقط صور للمنتجات على الرفوف في المتجر المحدد', 'Take photos of products on shelves at the specified store', 'photo', 200, 30, 'hard', 'available', 1),
(1, 'زيارة فرع والتقييم', 'Retail Visit & Review', 'قم بزيارة الفرع المحدد وقيّم الخدمة والنظافة', 'Visit the specified branch and review service and cleanliness', 'visit', 250, 45, 'hard', 'available', 1),
(1, 'مراجعة منتج تفصيلية', 'Detailed Product Review', 'اشترِ المنتج واكتب مراجعة شاملة مع صور', 'Purchase the product and write a comprehensive review with photos', 'review', 520, 60, 'hard', 'available', 1),

-- ── T4: Enterprise Tasks (B2B Asset Creation) ─────────────────
(1, 'التسوق الخفي', 'Mystery Shopping Mission', 'قم بزيارة الفرع كعميل خفي وقدم تقريراً مفصلاً', 'Visit the branch as a mystery shopper and submit a detailed report', 'mystery_shopping', 750, 90, 'hard', 'available', 1),
(1, 'إنشاء فيديو UGC', 'UGC Video Creation', 'أنشئ فيديو إبداعي عن المنتج بأسلوبك الخاص', 'Create a creative video about the product in your own style', 'ugc_video', 1500, 120, 'hard', 'available', 1),
(1, 'توليد عميل محتمل موثق', 'Verified Lead Generation', 'سجّل حساب جديد في الخدمة وأكمل التحقق', 'Register a new account on the service and complete verification', 'lead_gen', 2000, 60, 'hard', 'available', 1),
(1, 'حملة تسوق خفي شاملة', 'Full Mystery Shopping Campaign', 'قم بزيارة 3 فروع وقارن الأسعار والخدمة وقدم تقريراً', 'Visit 3 branches, compare prices and service, submit a report', 'mystery_shopping', 2600, 180, 'hard', 'available', 1);

SELECT 'Constitution migration complete. 15 template tasks seeded.' AS result;
