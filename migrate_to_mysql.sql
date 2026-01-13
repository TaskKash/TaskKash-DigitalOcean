-- =====================================================
-- TaskKash: SQLite to MySQL Migration Script
-- =====================================================
-- This script migrates all task-related data from SQLite to MySQL
-- Run this after the existing MySQL database is set up

USE taskkash;

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  advertiserId INT NOT NULL,
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  titleAr VARCHAR(255),
  description TEXT NOT NULL,
  descriptionAr TEXT,
  
  -- Task Type & Category
  type VARCHAR(50) NOT NULL,
  category VARCHAR(100),
  
  -- Completion & Rewards
  completionsNeeded INT NOT NULL DEFAULT 100,
  completionsCount INT DEFAULT 0,
  reward DECIMAL(10,2) NOT NULL,
  
  -- Task Properties
  difficulty VARCHAR(20) DEFAULT 'medium',
  duration INT NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft',
  
  -- Targeting (JSON strings)
  targetAgeMin INT,
  targetAgeMax INT,
  targetGender VARCHAR(10),
  targetLocations TEXT,
  targetTiers TEXT,
  
  -- Restrictions
  allowMultipleCompletions BOOLEAN DEFAULT 0,
  dailyLimitPerUser INT DEFAULT 0,
  requiresMinimumTier VARCHAR(10),
  
  -- Verification Settings
  verificationMethod VARCHAR(50) DEFAULT 'automatic',
  passingScore INT DEFAULT 80,
  minWatchPercentage INT DEFAULT 80,
  
  -- Task-Specific Data (JSON)
  taskData TEXT,
  
  -- Timestamps
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  publishedAt DATETIME,
  expiresAt DATETIME,
  
  FOREIGN KEY (advertiserId) REFERENCES advertisers(id) ON DELETE CASCADE,
  INDEX idx_tasks_advertiser (advertiserId),
  INDEX idx_tasks_type (type),
  INDEX idx_tasks_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Task Questions Table
CREATE TABLE IF NOT EXISTS task_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  taskId INT NOT NULL,
  
  -- Question Details
  questionText TEXT NOT NULL,
  questionTextAr TEXT,
  questionOrder INT NOT NULL,
  
  -- Question Type
  questionType VARCHAR(50) DEFAULT 'multiple_choice',
  
  -- Options (for multiple choice)
  optionA TEXT,
  optionAAr TEXT,
  optionB TEXT,
  optionBAr TEXT,
  optionC TEXT,
  optionCAr TEXT,
  optionD TEXT,
  optionDAr TEXT,
  
  -- Correct Answer
  correctAnswer VARCHAR(10),
  
  -- Optional
  explanation TEXT,
  explanationAr TEXT,
  imageUrl TEXT,
  
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
  INDEX idx_questions_task (taskId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Task Submissions Table
CREATE TABLE IF NOT EXISTS task_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  taskId INT NOT NULL,
  userId INT NOT NULL,
  
  -- Submission Status
  status VARCHAR(20) DEFAULT 'pending',
  
  -- Submission Data (JSON)
  submissionData TEXT,
  
  -- Verification Results
  score INT,
  watchTime INT,
  correctAnswers INT,
  totalQuestions INT,
  
  -- Files
  uploadedFiles TEXT,
  
  -- Location
  gpsLocation TEXT,
  
  -- Review
  reviewedBy INT,
  reviewedAt DATETIME,
  reviewNotes TEXT,
  rejectionReason TEXT,
  
  -- Reward
  rewardAmount DECIMAL(10,2),
  rewardCredited BOOLEAN DEFAULT 0,
  creditedAt DATETIME,
  
  -- Timestamps
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completedAt DATETIME,
  
  FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_submissions_task (taskId),
  INDEX idx_submissions_user (userId),
  INDEX idx_submissions_status (status),
  UNIQUE KEY unique_submission (taskId, userId, createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. MIGRATE DATA
-- =====================================================

-- Insert Samsung Galaxy Z Fold7 Task (ID=1)
INSERT INTO tasks (id, advertiserId, title, titleAr, description, descriptionAr, type, category, 
  completionsNeeded, completionsCount, reward, difficulty, duration, status, targetAgeMin, targetAgeMax,
  targetGender, targetLocations, targetTiers, allowMultipleCompletions, dailyLimitPerUser, 
  requiresMinimumTier, verificationMethod, passingScore, minWatchPercentage, taskData, 
  createdAt, updatedAt, publishedAt, expiresAt)
VALUES (
  1, 2, 
  'Watch Samsung Galaxy Z Fold7 Video & Answer Questions', 
  'شاهد فيديو Samsung Galaxy Z Fold7 وأجب عن الأسئلة',
  'Watch the complete Samsung Galaxy Z Fold7 promotional video and answer 5 questions about its features.',
  'شاهد فيديو Samsung Galaxy Z Fold7 الترويجي الكامل وأجب عن 5 أسئلة حول ميزاته.',
  'video', 'Electronics',
  100, 8, 50.00, 'easy', 5, 'active',
  18, 65, 'all',
  '["Cairo","Alexandria","Giza","Mansoura","Tanta","Assiut","Ismailia","Faiyum","Zagazig","Aswan","Damietta","Minya","Port Said","Suez","Luxor","Qena","Sohag","Beni Suef","Kafr El Sheikh","Arish","Mallawi","Bilbays","Marsa Matruh","Idfu","Mit Ghamr","Al-Hamidiyya","Deir Mawas","Qalyub","Abu Kabir","Kafr El Dawwar","Girga","Akhmim","Matareya"]',
  '["Bronze","Silver","Gold"]',
  1, 0, NULL, 'automatic', 80, 80,
  '{"videoUrl":"https://www.youtube.com/embed/dQw4w9WgXcQ","minWatchTime":40,"questions":[1,2,3,4,5]}',
  '2025-11-05 16:49:19', '2025-11-05 16:49:19', '2025-11-05 16:49:19', NULL
);

-- Insert Task Questions for Samsung Task
INSERT INTO task_questions (id, taskId, questionText, questionTextAr, questionOrder, questionType,
  optionA, optionAAr, optionB, optionBAr, optionC, optionCAr, optionD, optionDAr,
  correctAnswer, explanation, explanationAr, imageUrl, createdAt)
VALUES
(1, 1, 'What is the main feature highlighted about the Galaxy Z Fold7?', 'ما هي الميزة الرئيسية المميزة لـ Galaxy Z Fold7؟', 1, 'multiple_choice',
  'Water resistance', 'مقاومة الماء',
  'Foldable screen technology', 'تقنية الشاشة القابلة للطي',
  'Wireless charging', 'الشحن اللاسلكي',
  '5G connectivity', 'اتصال 5G',
  'B', 'The Galaxy Z Fold7 is primarily known for its innovative foldable screen technology.', 'يشتهر Galaxy Z Fold7 بشكل أساسي بتقنية الشاشة القابلة للطي المبتكرة.', NULL, '2025-11-05 16:49:19'),

(2, 1, 'What type of screen does the Galaxy Z Fold7 feature?', 'ما نوع الشاشة التي يتميز بها Galaxy Z Fold7؟', 2, 'multiple_choice',
  'LCD', 'LCD',
  'OLED', 'OLED',
  'Dynamic AMOLED', 'Dynamic AMOLED',
  'IPS', 'IPS',
  'C', 'Samsung uses Dynamic AMOLED technology for vibrant colors and deep blacks.', 'تستخدم Samsung تقنية Dynamic AMOLED للحصول على ألوان نابضة بالحياة وسوداء عميقة.', NULL, '2025-11-05 16:49:19'),

(3, 1, 'What capability does the Galaxy Z Fold7 offer according to the video?', 'ما هي الإمكانية التي يوفرها Galaxy Z Fold7 وفقًا للفيديو؟', 3, 'multiple_choice',
  'Holographic display', 'عرض ثلاثي الأبعاد',
  'Multi-window multitasking', 'تعدد المهام متعدد النوافذ',
  'Solar charging', 'الشحن بالطاقة الشمسية',
  'Mind control', 'التحكم بالعقل',
  'B', 'The large foldable screen enables powerful multi-window multitasking capabilities.', 'تتيح الشاشة القابلة للطي الكبيرة إمكانيات قوية لتعدد المهام متعدد النوافذ.', NULL, '2025-11-05 16:49:19'),

(4, 1, 'What is the main benefit of the foldable design?', 'ما هي الفائدة الرئيسية للتصميم القابل للطي؟', 4, 'multiple_choice',
  'Cheaper price', 'سعر أرخص',
  'Portability with large screen', 'قابلية النقل مع شاشة كبيرة',
  'Better battery life', 'عمر بطارية أفضل',
  'Faster processor', 'معالج أسرع',
  'B', 'The foldable design allows for a large screen that can be folded for easy portability.', 'يتيح التصميم القابل للطي شاشة كبيرة يمكن طيها لسهولة النقل.', NULL, '2025-11-05 16:49:19'),

(5, 1, 'How does the Z Fold7 compare to previous Fold models?', 'كيف يقارن Z Fold7 بموديلات Fold السابقة؟', 5, 'multiple_choice',
  'Same features', 'نفس الميزات',
  'Worse performance', 'أداء أسوأ',
  'More advanced and refined', 'أكثر تقدمًا وتطورًا',
  'Cheaper but lower quality', 'أرخص ولكن جودة أقل',
  'C', 'Each generation of the Fold series brings improvements and refinements over the previous model.', 'يجلب كل جيل من سلسلة Fold تحسينات وتطورات على الطراز السابق.', NULL, '2025-11-05 16:49:19');

-- Insert Task Submissions (8 completed submissions)
INSERT INTO task_submissions (id, taskId, userId, status, submissionData, score, watchTime, 
  correctAnswers, totalQuestions, uploadedFiles, gpsLocation, reviewedBy, reviewedAt, reviewNotes,
  rejectionReason, rewardAmount, rewardCredited, creditedAt, createdAt, updatedAt, completedAt)
VALUES
(1, 1, 2, 'approved', '{"answers":[{"questionId":1,"questionText":"What is the main feature highlighted about the Galaxy Z Fold7?","userAnswer":"B","correctAnswer":"B","isCorrect":true},{"questionId":2,"questionText":"What type of screen does the Galaxy Z Fold7 feature?","userAnswer":"C","correctAnswer":"C","isCorrect":true},{"questionId":3,"questionText":"What capability does the Galaxy Z Fold7 offer according to the video?","userAnswer":"B","correctAnswer":"B","isCorrect":true},{"questionId":4,"questionText":"What is the main benefit of the foldable design?","userAnswer":"B","correctAnswer":"B","isCorrect":true},{"questionId":5,"questionText":"How does the Z Fold7 compare to previous Fold models?","userAnswer":"C","correctAnswer":"C","isCorrect":true}],"passed":true,"watchTimePassed":true}', 100, 54, 5, 5, NULL, NULL, NULL, NULL, NULL, NULL, 50, 1, NULL, '2025-11-05 16:52:23', '2025-11-05 16:52:23', '2025-11-05T16:52:23.334Z'),

(2, 1, 2, 'approved', '{"answers":[{"questionId":1,"questionText":"What is the main feature highlighted about the Galaxy Z Fold7?","userAnswer":"B","correctAnswer":"B","isCorrect":true},{"questionId":2,"questionText":"What type of screen does the Galaxy Z Fold7 feature?","userAnswer":"C","correctAnswer":"C","isCorrect":true},{"questionId":3,"questionText":"What capability does the Galaxy Z Fold7 offer according to the video?","userAnswer":"B","correctAnswer":"B","isCorrect":true},{"questionId":4,"questionText":"What is the main benefit of the foldable design?","userAnswer":"B","correctAnswer":"B","isCorrect":true},{"questionId":5,"questionText":"How does the Z Fold7 compare to previous Fold models?","userAnswer":"C","correctAnswer":"C","isCorrect":true}],"passed":true,"watchTimePassed":true}', 100, 45, 5, 5, NULL, NULL, NULL, NULL, NULL, NULL, 50, 1, NULL, '2025-11-05 16:56:45', '2025-11-05 16:56:45', '2025-11-05T16:56:45.950Z'),

(3, 1, 2, 'approved', '{"answers":[{"questionId":1,"questionText":"What is the main feature highlighted about the Galaxy Z Fold7?","userAnswer":"B","correctAnswer":"B","isCorrect":true},{"questionId":2,"questionText":"What type of screen does the Galaxy Z Fold7 feature?","userAnswer":"C","correctAnswer":"C","isCorrect":true},{"questionId":3,"questionText":"What capability does the Galaxy Z Fold7 offer according to the video?","userAnswer":"B","correctAnswer":"B","isCorrect":true},{"questionId":4,"questionText":"What is the main benefit of the foldable design?","userAnswer":"B","correctAnswer":"B","isCorrect":true},{"questionId":5,"questionText":"How does the Z Fold7 compare to previous Fold models?","userAnswer":"C","correctAnswer":"C","isCorrect":true}],"passed":true,"watchTimePassed":true}', 100, 49, 5, 5, NULL, NULL, NULL, NULL, NULL, NULL, 50, 1, NULL, '2025-11-05 16:59:11', '2025-11-05 16:59:11', '2025-11-05T16:59:11.701Z'),

(4, 1, 2, 'approved', '{"answers":[{"questionId":1,"questionText":"What is the main feature highlighted about the Galaxy Z Fold7?","userAnswer":"B","correctAnswer":"B","isCorrect":true},{"questionId":2,"questionText":"What type of screen does the Galaxy Z Fold7 feature?","userAnswer":"C","correctAnswer":"C","isCorrect":true},{"questionId":3,"questionText":"What capability does the Galaxy Z Fold7 offer according to the video?","userAnswer":"B","correctAnswer":"B","isCorrect":true},{"questionId":4,"questionText":"What is the main benefit of the foldable design?","userAnswer":"B","correctAnswer":"B","isCorrect":true},{"questionId":5,"questionText":"How does the Z Fold7 compare to previous Fold models?","userAnswer":"C","correctAnswer":"C","isCorrect":true}],"passed":true,"watchTimePassed":true}', 100, 54, 5, 5, NULL, NULL, NULL, NULL, NULL, NULL, 50, 1, NULL, '2025-11-05 17:02:45', '2025-11-05 17:02:45', '2025-11-05T17:02:45.089Z'),

(5, 1, 2, 'approved', '{"answers":[{"questionId":1,"questionText":"What is the main feature highlighted about the Galaxy Z Fold7?","userAnswer":"B","correctAnswer":"B","isCorrect":true},{"questionId":2,"questionText":"What type of screen does the Galaxy Z Fold7 feature?","userAnswer":"C","correctAnswer":"C","isCorrect":true},{"questionId":3,"questionText":"What capability does the Galaxy Z Fold7 offer according to the video?","userAnswer":"B","correctAnswer":"B","isCorrect":true},{"questionId":4,"questionText":"What is the main benefit of the foldable design?","userAnswer":"B","correctAnswer":"B","isCorrect":true},{"questionId":5,"questionText":"How does the Z Fold7 compare to previous Fold models?","userAnswer":"C","correctAnswer":"C","isCorrect":true}],"passed":true,"watchTimePassed":true}', 100, 48, 5, 5, NULL, NULL, NULL, NULL, NULL, NULL, 50, 1, NULL, '2025-11-05 17:19:44', '2025-11-05 17:19:44', '2025-11-05T17:19:44.661Z'),

(6, 1, 2, 'approved', '{"answers":[{"questionId":1,"questionText":"What is the main feature highlighted about the Galaxy Z Fold7?","userAnswer":"B","correctAnswer":"B","isCorrect":true},{"questionId":2,"questionText":"What type of screen does the Galaxy Z Fold7 feature?","userAnswer":"C","correctAnswer":"C","isCorrect":true},{"questionId":3,"questionText":"What capability does the Galaxy Z Fold7 offer according to the video?","userAnswer":"B","correctAnswer":"B","isCorrect":true},{"questionId":4,"questionText":"What is the main benefit of the foldable design?","userAnswer":"B","correctAnswer":"B","isCorrect":true},{"questionId":5,"questionText":"How does the Z Fold7 compare to previous Fold models?","userAnswer":"C","correctAnswer":"C","isCorrect":true}],"passed":true,"watchTimePassed":true}', 100, 72, 5, 5, NULL, NULL, NULL, NULL, NULL, NULL, 50, 1, NULL, '2025-11-05 17:25:47', '2025-11-05 17:25:47', '2025-11-05T17:25:47.688Z'),

(7, 1, 2, 'approved', '{"answers":[{"questionId":1,"questionText":"What is the main feature highlighted about the Galaxy Z Fold7?","userAnswer":"B","correctAnswer":"B","isCorrect":true},{"questionId":2,"questionText":"What type of screen does the Galaxy Z Fold7 feature?","userAnswer":"C","correctAnswer":"C","isCorrect":true},{"questionId":3,"questionText":"What capability does the Galaxy Z Fold7 offer according to the video?","userAnswer":"B","correctAnswer":"B","isCorrect":true},{"questionId":4,"questionText":"What is the main benefit of the foldable design?","userAnswer":"B","correctAnswer":"B","isCorrect":true},{"questionId":5,"questionText":"How does the Z Fold7 compare to previous Fold models?","userAnswer":"C","correctAnswer":"C","isCorrect":true}],"passed":true,"watchTimePassed":true}', 100, 163, 5, 5, NULL, NULL, NULL, NULL, NULL, NULL, 50, 1, NULL, '2025-11-05 18:26:17', '2025-11-05 18:26:17', '2025-11-05T18:26:17.358Z'),

(8, 1, 2, 'approved', '{"answers":[{"questionId":1,"questionText":"What is the main feature highlighted about the Galaxy Z Fold7?","userAnswer":"B","correctAnswer":"B","isCorrect":true},{"questionId":2,"questionText":"What type of screen does the Galaxy Z Fold7 feature?","userAnswer":"C","correctAnswer":"C","isCorrect":true},{"questionId":3,"questionText":"What capability does the Galaxy Z Fold7 offer according to the video?","userAnswer":"B","correctAnswer":"B","isCorrect":true},{"questionId":4,"questionText":"What is the main benefit of the foldable design?","userAnswer":"B","correctAnswer":"B","isCorrect":true},{"questionId":5,"questionText":"How does the Z Fold7 compare to previous Fold models?","userAnswer":"C","correctAnswer":"C","isCorrect":true}],"passed":true,"watchTimePassed":true}', 100, 122, 5, 5, NULL, NULL, NULL, NULL, NULL, NULL, 50, 1, NULL, '2025-11-05 18:27:30', '2025-11-05 18:27:30', '2025-11-05T18:27:30.235Z');

-- =====================================================
-- 3. VERIFICATION
-- =====================================================
SELECT 'Migration Complete!' as Status;
SELECT COUNT(*) as TaskCount FROM tasks;
SELECT COUNT(*) as QuestionCount FROM task_questions;
SELECT COUNT(*) as SubmissionCount FROM task_submissions;
