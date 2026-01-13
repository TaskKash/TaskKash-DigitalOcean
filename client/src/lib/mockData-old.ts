// Mock Data for TASKKASH Demo App

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'survey' | 'video' | 'app' | 'social' | 'quiz';
  reward: number;
  duration: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'available' | 'in-progress' | 'completed' | 'expired';
  advertiser: string;
  advertiserLogo: string;
  expiresAt: string;
  requirements: string[];
  steps: string[];
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

// Mock User Data
export const mockUser: User = {
  id: '1',
  name: 'أحمد محمد',
  email: 'ahmed@example.com',
  phone: '+966501234567',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
  balance: 245.50,
  tier: 'silver',
  completedTasks: 127,
  totalEarnings: 3250.00,
  joinDate: '2024-01-15',
  verified: true
};

// Mock Tasks Data (Arabic)
export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'استبيان عن تطبيقات التوصيل',
    description: 'شارك رأيك في تطبيقات توصيل الطعام في السعودية',
    type: 'survey',
    reward: 15.00,
    duration: 5,
    difficulty: 'easy',
    status: 'available',
    advertiser: 'شركة أبحاث السوق',
    advertiserLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=MA',
    expiresAt: '2025-10-30',
    requirements: ['العمر 18+', 'مقيم في السعودية', 'استخدم تطبيق توصيل مرة واحدة على الأقل'],
    steps: ['الإجابة على 10 أسئلة', 'تقديم رأيك الصادق', 'إكمال الاستبيان']
  },
  {
    id: '2',
    title: 'مشاهدة إعلان تطبيق جديد',
    description: 'شاهد فيديو تعريفي لتطبيق التسوق الجديد',
    type: 'video',
    reward: 5.00,
    duration: 2,
    difficulty: 'easy',
    status: 'available',
    advertiser: 'متجر إلكتروني',
    advertiserLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=ES',
    expiresAt: '2025-10-28',
    requirements: ['مشاهدة الفيديو كاملاً'],
    steps: ['مشاهدة الفيديو', 'الإجابة على سؤال واحد']
  },
  {
    id: '3',
    title: 'تحميل وتجربة تطبيق اللياقة',
    description: 'حمّل تطبيق اللياقة البدنية وأكمل التسجيل',
    type: 'app',
    reward: 25.00,
    duration: 10,
    difficulty: 'medium',
    status: 'available',
    advertiser: 'FitLife App',
    advertiserLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=FL',
    expiresAt: '2025-11-05',
    requirements: ['جهاز Android أو iOS', 'مساحة 50 ميجا متاحة'],
    steps: ['تحميل التطبيق', 'إنشاء حساب', 'إكمال الملف الشخصي']
  },
  {
    id: '4',
    title: 'متابعة حساب على إنستغرام',
    description: 'تابع حساب العلامة التجارية على إنستغرام',
    type: 'social',
    reward: 3.00,
    duration: 1,
    difficulty: 'easy',
    status: 'available',
    advertiser: 'Fashion Brand',
    advertiserLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=FB',
    expiresAt: '2025-10-27',
    requirements: ['حساب إنستغرام نشط'],
    steps: ['زيارة الحساب', 'متابعة الحساب', 'إرسال لقطة شاشة']
  },
  {
    id: '5',
    title: 'اختبار معلومات عامة',
    description: 'أجب على 15 سؤال معلومات عامة',
    type: 'quiz',
    reward: 20.00,
    duration: 8,
    difficulty: 'medium',
    status: 'available',
    advertiser: 'منصة تعليمية',
    advertiserLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=EP',
    expiresAt: '2025-11-01',
    requirements: ['الحصول على 70% على الأقل للنجاح'],
    steps: ['بدء الاختبار', 'الإجابة على الأسئلة', 'إرسال النتيجة']
  },
  {
    id: '6',
    title: 'تقييم مطعم جديد',
    description: 'قم بزيارة المطعم وكتابة تقييم مفصل',
    type: 'survey',
    reward: 30.00,
    duration: 15,
    difficulty: 'medium',
    status: 'available',
    advertiser: 'سلسلة مطاعم',
    advertiserLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=RC',
    expiresAt: '2025-11-10',
    requirements: ['زيارة المطعم', 'تجربة وجبة واحدة على الأقل'],
    steps: ['حجز طاولة', 'تناول الطعام', 'كتابة التقييم', 'رفع صور']
  }
];

// Mock Transactions Data
export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'earn',
    amount: 15.00,
    date: '2025-10-26',
    description: 'استبيان عن تطبيقات التوصيل',
    status: 'completed'
  },
  {
    id: '2',
    type: 'earn',
    amount: 5.00,
    date: '2025-10-25',
    description: 'مشاهدة إعلان',
    status: 'completed'
  },
  {
    id: '3',
    type: 'withdraw',
    amount: -50.00,
    date: '2025-10-24',
    description: 'سحب إلى حساب بنكي',
    status: 'completed'
  },
  {
    id: '4',
    type: 'bonus',
    amount: 10.00,
    date: '2025-10-23',
    description: 'مكافأة إحالة صديق',
    status: 'completed'
  },
  {
    id: '5',
    type: 'earn',
    amount: 25.00,
    date: '2025-10-22',
    description: 'تحميل تطبيق',
    status: 'completed'
  },
  {
    id: '6',
    type: 'earn',
    amount: 20.00,
    date: '2025-10-21',
    description: 'اختبار معلومات عامة',
    status: 'completed'
  },
  {
    id: '7',
    type: 'earn',
    amount: 3.00,
    date: '2025-10-20',
    description: 'متابعة حساب إنستغرام',
    status: 'completed'
  }
];

// Mock Campaigns Data (for Advertisers)
export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'حملة إطلاق المنتج',
    advertiser: 'شركة تقنية',
    budget: 50000,
    spent: 23500,
    tasksCompleted: 470,
    tasksTotal: 1000,
    status: 'active',
    startDate: '2024-10-01',
    endDate: '2024-11-30'
  },
  {
    id: '2',
    name: 'استبيان أبحاث السوق',
    advertiser: 'شركة أبحاث',
    budget: 30000,
    spent: 28000,
    tasksCompleted: 933,
    tasksTotal: 1000,
    status: 'active',
    startDate: '2024-09-15',
    endDate: '2024-10-31'
  },
  {
    id: '3',
    name: 'مراجعة المتاجر',
    advertiser: 'سلسلة تجزئة',
    budget: 100000,
    spent: 100000,
    tasksCompleted: 1000,
    tasksTotal: 1000,
    status: 'completed',
    startDate: '2024-08-01',
    endDate: '2024-09-30'
  }
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'مهمة جديدة متاحة!',
    message: 'استبيان جديد بمكافأة 15 ريال',
    type: 'task',
    date: '2025-10-26',
    read: false,
    actionUrl: '/tasks/1'
  },
  {
    id: '2',
    title: 'تم إضافة الأرباح',
    message: 'تم إضافة 15 ريال إلى محفظتك',
    type: 'payment',
    date: '2025-10-26',
    read: false
  },
  {
    id: '3',
    title: 'ترقية المستوى!',
    message: 'تهانينا! تمت ترقيتك إلى المستوى الفضي',
    type: 'system',
    date: '2025-10-25',
    read: true
  },
  {
    id: '4',
    title: 'عرض خاص',
    message: 'مكافآت مضاعفة لمدة 24 ساعة!',
    type: 'promotion',
    date: '2025-10-24',
    read: true
  },
  {
    id: '5',
    title: 'تذكير: مهمة قيد التنفيذ',
    message: 'لديك مهمة يجب إكمالها قبل انتهاء صلاحيتها',
    type: 'task',
    date: '2025-10-23',
    read: true,
    actionUrl: '/tasks/5'
  }
];

