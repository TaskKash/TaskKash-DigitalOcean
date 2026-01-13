// Mock Data for TASKKASH Egypt Demo App
// جميع الأسعار بالجنيه المصري (EGP)

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'survey' | 'video' | 'app' | 'social' | 'quiz' | 'photo' | 'visit';
  reward: number;
  duration: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard' | 'advanced';
  status: 'available' | 'in-progress' | 'completed' | 'expired';
  advertiser: string;
  advertiserLogo: string;
  expiresAt: string;
  requirements: string[];
  steps: string[];
  location?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  balance: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  completedTasks: number;
  totalEarnings: number;
  joinDate: string;
  verified: boolean;
}

export interface Transaction {
  id: string;
  type: 'earn' | 'withdraw' | 'bonus' | 'refund';
  amount: number;
  date: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface Campaign {
  id: string;
  name: string;
  advertiser: string;
  budget: number;
  spent: number;
  tasksCompleted: number;
  tasksTotal: number;
  status: 'active' | 'paused' | 'completed';
  startDate: string;
  endDate: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'task' | 'payment' | 'system' | 'promotion';
  actionUrl?: string;
}

// Mock User Data (Egyptian)
export const mockUser: User = {
  id: '1',
  name: 'أحمد محمد',
  email: 'ahmed@example.com',
  phone: '+20 100 158 1287',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
  balance: 1845.50,
  tier: 'gold',
  completedTasks: 87,
  totalEarnings: 12750.00,
  joinDate: '2024-01-15',
  verified: true
};

// Mock Tasks Data (Egyptian - 35 Tasks)
export const mockTasks: Task[] = [
  // مهام التطبيقات (8 مهام)
  {
    id: 'EG001',
    title: 'تثبيت تطبيق Jumia واستخدامه',
    description: 'حمّل تطبيق Jumia، أنشئ حساب جديد، وتصفح قسم العروض اليومية',
    type: 'app',
    reward: 50,
    duration: 10,
    difficulty: 'medium',
    status: 'available',
    advertiser: 'Jumia Egypt',
    advertiserLogo: '/logos/jumia.png',
    expiresAt: '2025-11-15',
    requirements: ['هاتف Android أو iOS', 'مقيم في مصر', 'حساب جديد'],
    steps: [
      'حمّل تطبيق Jumia من المتجر',
      'أنشئ حساباً جديداً برقم هاتفك',
      'تصفح قسم العروض اليومية',
      'التقط لقطة شاشة',
      'ارفع لقطة الشاشة',
    ],
  },
  {
    id: 'EG002',
    title: 'تثبيت تطبيق Vodafone Cash',
    description: 'حمّل تطبيق Vodafone Cash وأنشئ حساباً جديداً',
    type: 'app',
    reward: 60,
    duration: 15,
    difficulty: 'medium',
    status: 'available',
    advertiser: 'Vodafone Egypt',
    advertiserLogo: '/logos/vodafone.png',
    expiresAt: '2025-11-20',
    requirements: ['هاتف ذكي', 'رقم فودافون مصري'],
    steps: [
      'حمّل التطبيق',
      'أنشئ حساباً جديداً',
      'أكمل التسجيل',
      'التقط لقطة شاشة',
      'ارفع الإثبات',
    ],
  },
  {
    id: 'EG003',
    title: 'تثبيت تطبيق Noon وإضافة منتج للسلة',
    description: 'حمّل تطبيق Noon، تصفح المنتجات، وأضف منتجاً للسلة',
    type: 'app',
    reward: 45,
    duration: 8,
    difficulty: 'easy',
    status: 'available',
    advertiser: 'Noon Egypt',
    advertiserLogo: '/logos/noon.png',
    expiresAt: '2025-11-18',
    requirements: ['هاتف ذكي', 'مقيم في مصر'],
    steps: [
      'حمّل تطبيق Noon',
      'تصفح المنتجات',
      'أضف منتجاً للسلة',
      'التقط لقطة شاشة',
      'ارفع الإثبات',
    ],
  },
  {
    id: 'EG004',
    title: 'تثبيت تطبيق بنك مصر',
    description: 'حمّل تطبيق بنك مصر وأنشئ حساباً رقمياً',
    type: 'app',
    reward: 80,
    duration: 15,
    difficulty: 'medium',
    status: 'available',
    advertiser: 'بنك مصر',
    advertiserLogo: '/logos/banquemisr.png',
    expiresAt: '2025-11-25',
    requirements: ['مواطن مصري', 'بطاقة رقم قومي'],
    steps: [
      'حمّل التطبيق',
      'أنشئ حساباً رقمياً',
      'أكمل التسجيل',
      'التقط لقطة شاشة',
      'ارفع الإثبات',
    ],
  },
  {
    id: 'EG005',
    title: 'تثبيت تطبيق Classera',
    description: 'حمّل تطبيق Classera وأنشئ حساباً كطالب',
    type: 'app',
    reward: 50,
    duration: 10,
    difficulty: 'easy',
    status: 'available',
    advertiser: 'Classera Egypt',
    advertiserLogo: '/logos/classera.png',
    expiresAt: '2025-11-22',
    requirements: ['طالب أو مهتم بالتعليم'],
    steps: [
      'حمّل التطبيق',
      'أنشئ حساباً',
      'تصفح الدورات',
      'التقط لقطة شاشة',
      'ارفع الإثبات',
    ],
  },
  {
    id: 'EG006',
    title: 'تثبيت لعبة جديدة',
    description: 'حمّل لعبة جديدة والعب لمدة 10 دقائق',
    type: 'app',
    reward: 40,
    duration: 15,
    difficulty: 'easy',
    status: 'available',
    advertiser: 'مطور ألعاب',
    advertiserLogo: '/logos/generic.png',
    expiresAt: '2025-11-30',
    requirements: ['هاتف ذكي'],
    steps: [
      'حمّل اللعبة',
      'العب 10 دقائق',
      'التقط لقطة شاشة',
      'ارفع الإثبات',
    ],
  },
  {
    id: 'EG007',
    title: 'تطبيق صحي - 3 أيام',
    description: 'حمّل تطبيق صحي وسجّل نشاطك لمدة 3 أيام',
    type: 'app',
    reward: 120,
    duration: 30,
    difficulty: 'advanced',
    status: 'available',
    advertiser: 'تطبيق صحي',
    advertiserLogo: '/logos/generic.png',
    expiresAt: '2025-12-05',
    requirements: ['مهتم بالصحة'],
    steps: [
      'حمّل التطبيق',
      'سجّل نشاطك يومياً',
      'استمر 3 أيام',
      'التقط لقطة شاشة',
      'ارفع التقرير',
    ],
  },
  {
    id: 'EG008',
    title: 'استخدام Careem وتقييم',
    description: 'اطلب رحلة عبر Careem واكتب تقييماً (+ خصم 10%)',
    type: 'app',
    reward: 70,
    duration: 20,
    difficulty: 'medium',
    status: 'available',
    advertiser: 'Careem Egypt',
    advertiserLogo: '/logos/careem.png',
    expiresAt: '2025-11-28',
    requirements: ['حساب Careem'],
    steps: [
      'اطلب رحلة',
      'أكمل الرحلة',
      'اكتب تقييماً',
      'التقط لقطة شاشة',
      'ارفع الإثبات',
    ],
  },

  // مهام الاستبيانات (6 مهام)
  {
    id: 'EG009',
    title: 'استبيان التسوق الإلكتروني',
    description: 'أجب على 8 أسئلة حول عادات التسوق الإلكتروني',
    type: 'survey',
    reward: 35,
    duration: 5,
    difficulty: 'easy',
    status: 'available',
    advertiser: 'Jumia Egypt',
    advertiserLogo: '/logos/jumia.png',
    expiresAt: '2025-11-20',
    requirements: ['العمر 18-45', 'مقيم في مصر'],
    steps: [
      'اقرأ الأسئلة',
      'أجب بصدق',
      'أرسل الاستبيان',
    ],
  },
  {
    id: 'EG010',
    title: 'استبيان خدمات الاتصالات',
    description: 'أجب على 10 أسئلة حول خدمات الاتصالات',
    type: 'survey',
    reward: 40,
    duration: 6,
    difficulty: 'easy',
    status: 'available',
    advertiser: 'Orange Egypt',
    advertiserLogo: '/logos/orange.png',
    expiresAt: '2025-11-22',
    requirements: ['مستخدم خدمات اتصالات'],
    steps: [
      'اقرأ الأسئلة',
      'أجب على الأسئلة',
      'أرسل الاستبيان',
    ],
  },
  {
    id: 'EG011',
    title: 'استبيان المنتجات الصحية',
    description: 'أجب على 7 أسئلة حول المنتجات الصحية',
    type: 'survey',
    reward: 35,
    duration: 5,
    difficulty: 'easy',
    status: 'available',
    advertiser: 'Nestlé Egypt',
    advertiserLogo: '/logos/nestle.png',
    expiresAt: '2025-11-25',
    requirements: ['العمر 25-40', 'مهتم بالصحة'],
    steps: [
      'اقرأ الأسئلة',
      'أجب بصدق',
      'أرسل الاستبيان',
    ],
  },
  {
    id: 'EG012',
    title: 'استبيان الخدمات المصرفية',
    description: 'أجب على 10 أسئلة حول الخدمات المصرفية الرقمية',
    type: 'survey',
    reward: 45,
    duration: 7,
    difficulty: 'easy',
    status: 'available',
    advertiser: 'البنك الأهلي',
    advertiserLogo: '/logos/nbe.png',
    expiresAt: '2025-11-27',
    requirements: ['مستخدم خدمات مصرفية'],
    steps: [
      'اقرأ الأسئلة',
      'أجب على الأسئلة',
      'أرسل الاستبيان',
    ],
  },
  {
    id: 'EG013',
    title: 'استبيان التعليم الإلكتروني',
    description: 'أجب على 8 أسئلة حول التعليم الإلكتروني',
    type: 'survey',
    reward: 40,
    duration: 6,
    difficulty: 'easy',
    status: 'available',
    advertiser: 'Edraak',
    advertiserLogo: '/logos/edraak.png',
    expiresAt: '2025-11-30',
    requirements: ['طالب أو مهتم بالتعليم'],
    steps: [
      'اقرأ الأسئلة',
      'أجب على الأسئلة',
      'أرسل الاستبيان',
    ],
  },
  {
    id: 'EG014',
    title: 'استبيان TASKKASH',
    description: 'أجب على 10 أسئلة حول تجربتك مع TASKKASH',
    type: 'survey',
    reward: 60,
    duration: 8,
    difficulty: 'easy',
    status: 'available',
    advertiser: 'TASKKASH',
    advertiserLogo: '/logos/taskkash.png',
    expiresAt: '2025-12-10',
    requirements: ['مستخدم TASKKASH'],
    steps: [
      'اقرأ الأسئلة',
      'أجب بصدق',
      'أرسل الاستبيان',
    ],
  },

  // مهام الفيديو (3 مهام)
  {
    id: 'EG015',
    title: 'فيديو إعلاني تويوتا',
    description: 'شاهد فيديو تويوتا (30 ثانية) وأجب على 3 أسئلة',
    type: 'video',
    reward: 25,
    duration: 3,
    difficulty: 'easy',
    status: 'available',
    advertiser: 'Toyota Egypt',
    advertiserLogo: '/logos/toyota.png',
    expiresAt: '2025-11-18',
    requirements: ['اتصال إنترنت جيد'],
    steps: [
      'شاهد الفيديو',
      'أجب على 3 أسئلة',
      'أرسل الإجابات',
    ],
  },
  {
    id: 'EG016',
    title: 'فيديو Vodafone + تعليق',
    description: 'شاهد فيديو Vodafone على YouTube واكتب تعليقاً',
    type: 'video',
    reward: 50,
    duration: 8,
    difficulty: 'medium',
    status: 'available',
    advertiser: 'Vodafone Egypt',
    advertiserLogo: '/logos/vodafone.png',
    expiresAt: '2025-11-22',
    requirements: ['حساب YouTube'],
    steps: [
      'شاهد الفيديو',
      'اكتب تعليقاً (20 كلمة+)',
      'التقط لقطة شاشة',
      'ارفع الإثبات',
    ],
  },
  {
    id: 'EG017',
    title: 'تقييم حملة إعلانية',
    description: 'شاهد حملة إعلانية وقيّمها',
    type: 'video',
    reward: 55,
    duration: 10,
    difficulty: 'medium',
    status: 'available',
    advertiser: 'Purple Digital',
    advertiserLogo: '/logos/generic.png',
    expiresAt: '2025-11-25',
    requirements: ['مهتم بالتسويق'],
    steps: [
      'شاهد الحملة',
      'أجب على 5 أسئلة',
      'اكتب ملاحظات (50 كلمة)',
      'ارفع التقييم',
    ],
  },

  // مهام وسائل التواصل (3 مهام)
  {
    id: 'EG018',
    title: 'متابعة Jumia على Instagram',
    description: 'تابع صفحة Jumia Egypt على Instagram',
    type: 'social',
    reward: 20,
    duration: 2,
    difficulty: 'easy',
    status: 'available',
    advertiser: 'Jumia Egypt',
    advertiserLogo: '/logos/jumia.png',
    expiresAt: '2025-11-30',
    requirements: ['حساب Instagram'],
    steps: [
      'افتح Instagram',
      'ابحث عن @JumiaEgypt',
      'اضغط متابعة',
      'التقط لقطة شاشة',
      'ارفع الإثبات',
    ],
  },
  {
    id: 'EG019',
    title: 'مشاركة منشور Orange',
    description: 'شارك آخر منشور لـ Orange Egypt على Facebook',
    type: 'social',
    reward: 25,
    duration: 3,
    difficulty: 'easy',
    status: 'available',
    advertiser: 'Orange Egypt',
    advertiserLogo: '/logos/orange.png',
    expiresAt: '2025-11-28',
    requirements: ['حساب Facebook'],
    steps: [
      'افتح صفحة Orange',
      'شارك آخر منشور',
      'التقط لقطة شاشة',
      'ارفع الإثبات',
    ],
  },
  {
    id: 'EG020',
    title: 'تغريدة عن Uber',
    description: 'اكتب تغريدة عن تجربتك مع Uber في مصر',
    type: 'social',
    reward: 40,
    duration: 5,
    difficulty: 'easy',
    status: 'available',
    advertiser: 'Uber Egypt',
    advertiserLogo: '/logos/uber.png',
    expiresAt: '2025-12-01',
    requirements: ['حساب X (Twitter)', 'هاشتاج #UberEgypt'],
    steps: [
      'اكتب تغريدة (50 كلمة+)',
      'أضف #UberEgypt',
      'انشر التغريدة',
      'التقط لقطة شاشة',
      'ارفع الإثبات',
    ],
  },

  // مهام التصوير (2 مهمتان)
  {
    id: 'EG021',
    title: 'تصوير إعلان بيبسي',
    description: 'ابحث عن إعلان بيبسي في الشارع والتقط صورة',
    type: 'photo',
    reward: 50,
    duration: 10,
    difficulty: 'easy',
    status: 'available',
    advertiser: 'PepsiCo Egypt',
    advertiserLogo: '/logos/pepsi.png',
    expiresAt: '2025-11-30',
    requirements: ['كاميرا جيدة', 'تفعيل GPS'],
    steps: [
      'ابحث عن لوحة إعلانية لبيبسي',
      'التقط صورة واضحة',
      'تأكد من ظهور الموقع',
      'ارفع الصورة مع GPS',
    ],
  },
  {
    id: 'EG022',
    title: 'تصوير إعلان Coca-Cola',
    description: 'التقط صورة لإعلان Coca-Cola في محطة مترو',
    type: 'photo',
    reward: 50,
    duration: 10,
    difficulty: 'easy',
    status: 'available',
    advertiser: 'Coca-Cola Egypt',
    advertiserLogo: '/logos/cocacola.png',
    expiresAt: '2025-11-28',
    location: 'محطة مترو',
    requirements: ['موقعك قريب من مترو'],
    steps: [
      'اذهب لمحطة مترو',
      'ابحث عن إعلان Coca-Cola',
      'التقط صورة واضحة',
      'ارفع الصورة مع GPS',
    ],
  },

  // مهام ميدانية (13 مهمة)
  {
    id: 'EG023',
    title: 'زيارة ماكدونالدز',
    description: 'زر فرع ماكدونالدز، التقط صورة، واحصل على خصم 15%',
    type: 'visit',
    reward: 600,
    duration: 20,
    difficulty: 'medium',
    status: 'available',
    advertiser: "McDonald's Egypt",
    advertiserLogo: '/logos/mcdonalds.png',
    expiresAt: '2025-11-30',
    location: 'القاهرة، الجيزة',
    requirements: ['موقعك في نطاق 5 كم', 'تفعيل GPS'],
    steps: [
      'اذهب لأقرب فرع',
      'سجل دخولك',
      'التقط صورة',
      'احصل على خصم 15%',
      'ارفع الإثبات',
    ],
  },
  {
    id: 'EG024',
    title: 'زيارة كارفور',
    description: 'زر كارفور والتقط صورة لقسم الأغذية العضوية',
    type: 'visit',
    reward: 550,
    duration: 15,
    difficulty: 'easy',
    status: 'available',
    advertiser: 'Carrefour Egypt',
    advertiserLogo: '/logos/carrefour.png',
    expiresAt: '2025-11-28',
    location: 'القاهرة، الإسكندرية',
    requirements: ['موقعك في نطاق 10 كم', 'كاميرا جيدة'],
    steps: [
      'اذهب لكارفور',
      'ابحث عن قسم الأغذية العضوية',
      'التقط صورة واضحة',
      'ارفع الصورة',
    ],
  },
  {
    id: 'EG025',
    title: 'زيارة معرض Hyundai',
    description: 'زر معرض Hyundai والتقط صور للسيارات',
    type: 'visit',
    reward: 800,
    duration: 25,
    difficulty: 'medium',
    status: 'available',
    advertiser: 'Hyundai Egypt',
    advertiserLogo: '/logos/hyundai.png',
    expiresAt: '2025-12-05',
    location: 'القاهرة، الجيزة',
    requirements: ['موقعك قريب من معرض', 'كاميرا جيدة'],
    steps: [
      'اذهب للمعرض',
      'التقط 3 صور لسيارات',
      'تأكد من ظهور الأسعار',
      'ارفع الصور',
    ],
  },
  {
    id: 'EG026',
    title: 'تجربة قيادة Nissan',
    description: 'احجز تجربة قيادة Nissan وشاركنا تجربتك',
    type: 'visit',
    reward: 1500,
    duration: 45,
    difficulty: 'hard',
    status: 'available',
    advertiser: 'Nissan Egypt',
    advertiserLogo: '/logos/nissan.png',
    expiresAt: '2025-12-10',
    location: 'القاهرة، الإسكندرية',
    requirements: ['رخصة قيادة سارية', 'العمر 21+'],
    steps: [
      'احجز موعد',
      'جرّب السيارة',
      'التقط صورة',
      'اكتب تقييم (50 كلمة)',
      'ارفع الإثبات',
    ],
  },
  {
    id: 'EG027',
    title: 'زيارة KFC',
    description: 'زر KFC والتقط صورة للقائمة الجديدة',
    type: 'visit',
    reward: 550,
    duration: 15,
    difficulty: 'easy',
    status: 'available',
    advertiser: 'KFC Egypt',
    advertiserLogo: '/logos/kfc.png',
    expiresAt: '2025-11-25',
    location: 'جميع المحافظات',
    requirements: ['موقعك قريب من KFC'],
    steps: [
      'اذهب لأقرب فرع',
      'التقط صورة للقائمة',
      'تأكد من ظهور الأسعار',
      'ارفع الصورة',
    ],
  },
  {
    id: 'EG028',
    title: 'طلب من Talabat',
    description: 'اطلب وجبة من Talabat واكتب تقييماً (+ خصم 15%)',
    type: 'visit',
    reward: 650,
    duration: 30,
    difficulty: 'medium',
    status: 'available',
    advertiser: 'Talabat Egypt',
    advertiserLogo: '/logos/talabat.png',
    expiresAt: '2025-12-01',
    location: 'جميع المحافظات',
    requirements: ['حساب Talabat', 'في منطقة التوصيل'],
    steps: [
      'اطلب وجبة',
      'استلم الطلب',
      'اكتب تقييماً (50 كلمة)',
      'التقط صورة',
      'ارفع الإثبات',
    ],
  },
  {
    id: 'EG029',
    title: 'تصوير Samsung في متجر',
    description: 'زر متجر إلكترونيات والتقط صورة لمنتجات Samsung',
    type: 'visit',
    reward: 700,
    duration: 15,
    difficulty: 'easy',
    status: 'available',
    advertiser: 'Samsung Egypt',
    advertiserLogo: '/logos/samsung.png',
    expiresAt: '2025-11-30',
    location: 'القاهرة، الإسكندرية',
    requirements: ['موقعك قريب من متجر', 'كاميرا جيدة'],
    steps: [
      'اذهب لمتجر إلكترونيات',
      'ابحث عن قسم Samsung',
      'التقط صورة واضحة',
      'ارفع الصورة',
    ],
  },
  {
    id: 'EG030',
    title: 'تصوير Henkel في سوبرماركت',
    description: 'زر سوبرماركت والتقط صور لمنتجات Henkel',
    type: 'visit',
    reward: 600,
    duration: 15,
    difficulty: 'easy',
    status: 'available',
    advertiser: 'Henkel Egypt',
    advertiserLogo: '/logos/henkel.png',
    expiresAt: '2025-11-28',
    location: 'جميع المحافظات',
    requirements: ['موقعك قريب من سوبرماركت'],
    steps: [
      'اذهب لسوبرماركت',
      'ابحث عن منتجات Henkel',
      'التقط صورة واضحة',
      'ارفع الصورة',
    ],
  },
  {
    id: 'EG031',
    title: 'زيارة Spinneys',
    description: 'زر Spinneys واكتب تقييماً للتجربة',
    type: 'visit',
    reward: 750,
    duration: 20,
    difficulty: 'medium',
    status: 'available',
    advertiser: 'Spinneys Egypt',
    advertiserLogo: '/logos/spinneys.png',
    expiresAt: '2025-12-03',
    location: 'القاهرة، الإسكندرية',
    requirements: ['موقعك في القاهرة أو الإسكندرية'],
    steps: [
      'اذهب لأقرب فرع',
      'تسوق 10 دقائق',
      'اكتب تقييماً (100 كلمة)',
      'التقط صورة',
      'ارفع الإثبات',
    ],
  },
  {
    id: 'EG032',
    title: 'زيارة معرض عقاري',
    description: 'زر معرض عقاري والتقط صور للمشاريع',
    type: 'visit',
    reward: 1000,
    duration: 30,
    difficulty: 'medium',
    status: 'available',
    advertiser: 'شركة عقارات',
    advertiserLogo: '/logos/generic.png',
    expiresAt: '2025-12-08',
    location: 'القاهرة، الإسكندرية',
    requirements: ['موقعك في القاهرة أو الإسكندرية'],
    steps: [
      'اذهب لمعرض عقاري',
      'التقط صور للمشاريع',
      'اجمع كتيبات',
      'ارفع الصور',
    ],
  },
  {
    id: 'EG033',
    title: 'تصوير قائمة Pizza Hut',
    description: 'زر Pizza Hut والتقط صورة لقائمة الطعام',
    type: 'visit',
    reward: 550,
    duration: 10,
    difficulty: 'easy',
    status: 'available',
    advertiser: 'Pizza Hut Egypt',
    advertiserLogo: '/logos/pizzahut.png',
    expiresAt: '2025-11-25',
    location: 'جميع المحافظات',
    requirements: ['موقعك قريب من Pizza Hut'],
    steps: [
      'اذهب لأقرب فرع',
      'التقط صورة للقائمة',
      'تأكد من ظهور الأسعار',
      'ارفع الصورة',
    ],
  },
  {
    id: 'EG034',
    title: "زيارة Beano's Café",
    description: "زر Beano's، التقط صورة، واحصل على خصم 10%",
    type: 'visit',
    reward: 600,
    duration: 20,
    difficulty: 'easy',
    status: 'available',
    advertiser: "Beano's Café",
    advertiserLogo: '/logos/generic.png',
    expiresAt: '2025-12-01',
    location: 'القاهرة، الجيزة',
    requirements: ['موقعك في القاهرة أو الجيزة', 'تفعيل GPS'],
    steps: [
      'اذهب لأقرب فرع',
      'سجل دخولك',
      'التقط صورة',
      'احصل على خصم',
      'ارفع الصورة',
    ],
  },
  {
    id: 'EG035',
    title: 'زيارة Cairo Zoo Store',
    description: 'زر Cairo Zoo Store والتقط صور للمنتجات',
    type: 'visit',
    reward: 700,
    duration: 20,
    difficulty: 'easy',
    status: 'available',
    advertiser: 'Cairo Zoo Store',
    advertiserLogo: '/logos/generic.png',
    expiresAt: '2025-12-05',
    location: 'القاهرة',
    requirements: ['موقعك في القاهرة'],
    steps: [
      'اذهب للمتجر',
      'التقط صور للمنتجات',
      'ارفع الصور',
    ],
  },
];

// Mock Transactions (Egyptian)
export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'earn',
    amount: 600,
    date: '2025-10-26',
    description: 'إكمال مهمة: زيارة ماكدونالدز',
    status: 'completed'
  },
  {
    id: '2',
    type: 'earn',
    amount: 50,
    date: '2025-10-25',
    description: 'إكمال مهمة: تثبيت تطبيق Jumia',
    status: 'completed'
  },
  {
    id: '3',
    type: 'withdraw',
    amount: -500,
    date: '2025-10-24',
    description: 'سحب إلى Vodafone Cash',
    status: 'completed'
  },
  {
    id: '4',
    type: 'bonus',
    amount: 100,
    date: '2025-10-23',
    description: 'مكافأة الإحالة',
    status: 'completed'
  },
  {
    id: '5',
    type: 'earn',
    amount: 35,
    date: '2025-10-22',
    description: 'إكمال استبيان التسوق',
    status: 'completed'
  },
];

// Mock Campaigns (Egyptian Advertisers)
export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'حملة Jumia - عروض نوفمبر',
    advertiser: 'Jumia Egypt',
    budget: 50000,
    spent: 28500,
    tasksCompleted: 570,
    tasksTotal: 1000,
    status: 'active',
    startDate: '2025-11-01',
    endDate: '2025-11-30'
  },
  {
    id: '2',
    name: 'حملة Vodafone Cash',
    advertiser: 'Vodafone Egypt',
    budget: 75000,
    spent: 45000,
    tasksCompleted: 750,
    tasksTotal: 1250,
    status: 'active',
    startDate: '2025-10-15',
    endDate: '2025-12-15'
  },
  {
    id: '3',
    name: 'حملة McDonald\'s - خصومات الشتاء',
    advertiser: "McDonald's Egypt",
    budget: 40000,
    spent: 38000,
    tasksCompleted: 950,
    tasksTotal: 1000,
    status: 'active',
    startDate: '2025-10-01',
    endDate: '2025-11-30'
  },
];

// Mock Notifications (Egyptian)
export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'مهمة جديدة متاحة!',
    message: 'مهمة "زيارة ماكدونالدز" متاحة الآن - اربح 600 ج.م',
    date: '2025-10-27T10:30:00',
    read: false,
    type: 'task',
    actionUrl: '/tasks/EG023'
  },
  {
    id: '2',
    title: 'تم قبول طلب السحب',
    message: 'تم تحويل 500 ج.م إلى حسابك في Vodafone Cash',
    date: '2025-10-26T14:20:00',
    read: false,
    type: 'payment'
  },
  {
    id: '3',
    title: 'مكافأة الإحالة!',
    message: 'حصلت على 100 ج.م لإحالة صديق جديد',
    date: '2025-10-25T09:15:00',
    read: true,
    type: 'promotion'
  },
  {
    id: '4',
    title: 'مهمة مكتملة',
    message: 'تم قبول مهمة "تثبيت تطبيق Jumia" - 50 ج.م',
    date: '2025-10-24T16:45:00',
    read: true,
    type: 'task'
  },
];

