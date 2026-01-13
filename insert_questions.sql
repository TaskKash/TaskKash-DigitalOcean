USE taskkash;

-- Insert Task Questions for Samsung Galaxy Z Fold7 Task
INSERT INTO task_questions (taskId, questionText, questionTextAr, questionOrder, questionType,
  optionA, optionAAr, optionB, optionBAr, optionC, optionCAr, optionD, optionDAr,
  correctAnswer, explanation, explanationAr, imageUrl)
VALUES
(1, 'What is the main feature highlighted about the Galaxy Z Fold7?', 'ما هي الميزة الرئيسية المميزة لـ Galaxy Z Fold7؟', 1, 'multiple_choice',
  'Water resistance', 'مقاومة الماء',
  'Foldable screen technology', 'تقنية الشاشة القابلة للطي',
  'Wireless charging', 'الشحن اللاسلكي',
  '5G connectivity', 'اتصال 5G',
  'B', 'The Galaxy Z Fold7 is primarily known for its innovative foldable screen technology.', 'يشتهر Galaxy Z Fold7 بشكل أساسي بتقنية الشاشة القابلة للطي المبتكرة.', NULL),

(1, 'What type of screen does the Galaxy Z Fold7 feature?', 'ما نوع الشاشة التي يتميز بها Galaxy Z Fold7؟', 2, 'multiple_choice',
  'LCD', 'LCD',
  'OLED', 'OLED',
  'Dynamic AMOLED', 'Dynamic AMOLED',
  'IPS', 'IPS',
  'C', 'Samsung uses Dynamic AMOLED technology for vibrant colors and deep blacks.', 'تستخدم Samsung تقنية Dynamic AMOLED للحصول على ألوان نابضة بالحياة وسوداء عميقة.', NULL),

(1, 'What capability does the Galaxy Z Fold7 offer according to the video?', 'ما هي الإمكانية التي يوفرها Galaxy Z Fold7 وفقًا للفيديو؟', 3, 'multiple_choice',
  'Holographic display', 'عرض ثلاثي الأبعاد',
  'Multi-window multitasking', 'تعدد المهام متعدد النوافذ',
  'Solar charging', 'الشحن بالطاقة الشمسية',
  'Mind control', 'التحكم بالعقل',
  'B', 'The large foldable screen enables powerful multi-window multitasking capabilities.', 'تتيح الشاشة القابلة للطي الكبيرة إمكانيات قوية لتعدد المهام متعدد النوافذ.', NULL),

(1, 'What is the main benefit of the foldable design?', 'ما هي الفائدة الرئيسية للتصميم القابل للطي؟', 4, 'multiple_choice',
  'Cheaper price', 'سعر أرخص',
  'Portability with large screen', 'قابلية النقل مع شاشة كبيرة',
  'Better battery life', 'عمر بطارية أفضل',
  'Faster processor', 'معالج أسرع',
  'B', 'The foldable design allows for a large screen that can be folded for easy portability.', 'يتيح التصميم القابل للطي شاشة كبيرة يمكن طيها لسهولة النقل.', NULL),

(1, 'How does the Z Fold7 compare to previous Fold models?', 'كيف يقارن Z Fold7 بموديلات Fold السابقة؟', 5, 'multiple_choice',
  'Same features', 'نفس الميزات',
  'Worse performance', 'أداء أسوأ',
  'More advanced and refined', 'أكثر تقدمًا وتطورًا',
  'Cheaper but lower quality', 'أرخص ولكن جودة أقل',
  'C', 'Each generation of the Fold series brings improvements and refinements over the previous model.', 'يجلب كل جيل من سلسلة Fold تحسينات وتطورات على الطراز السابق.', NULL);

SELECT 'Questions inserted successfully!' as Status;
SELECT COUNT(*) as QuestionCount FROM task_questions WHERE taskId=1;
