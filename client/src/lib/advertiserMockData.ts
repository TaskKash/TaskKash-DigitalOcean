// بيانات المعلنين الوهمية - كل معلن له بياناته الخاصة
// جميع الأسعار بالجنيه المصري (EGP)

export interface Advertiser {
  id: string;
  name: string;
  email: string;
  company: string;
  logo: string;
  industry: string;
  joinDate: string;
  totalBudget: number;
  spentBudget: number;
  activeCampaigns: number;
  totalTasks: number;
  completedTasks: number;
}

export interface AdvertiserCampaign {
  id: string;
  advertiserId: string; // ربط الحملة بالمعلن
  name: string;
  budget: number;
  spent: number;
  tasksCompleted: number;
  tasksTotal: number;
  status: 'active' | 'paused' | 'completed' | 'draft';
  startDate: string;
  endDate: string;
  targetAudience: {
    ageRange: string;
    gender: string;
    location: string;
    interests: string[];
  };
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    roi: number;
  };
}

export interface AdvertiserTask {
  id: string;
  advertiserId: string; // ربط المهمة بالمعلن
  campaignId: string;
  title: string;
  description: string;
  type: 'survey' | 'video' | 'app' | 'social' | 'quiz' | 'photo' | 'visit';
  reward: number;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'advanced';
  status: 'active' | 'paused' | 'completed' | 'draft';
  totalBudget: number;
  spentBudget: number;
  completedCount: number;
  targetCount: number;
  createdAt: string;
  expiresAt: string;
}

// المعلن 1: Jumia Egypt
export const advertiser1: Advertiser = {
  id: 'ADV001',
  name: 'محمد أحمد',
  email: 'mohamed@jumia.com.eg',
  company: 'Jumia Egypt',
  logo: '/logos/jumia.png',
  industry: 'E-commerce',
  joinDate: '2024-01-10',
  totalBudget: 500000,
  spentBudget: 125000,
  activeCampaigns: 3,
  totalTasks: 12,
  completedTasks: 8
};

// المعلن 2: Vodafone Egypt
export const advertiser2: Advertiser = {
  id: 'ADV002',
  name: 'سارة حسن',
  email: 'sara@vodafone.com.eg',
  company: 'Vodafone Egypt',
  logo: '/logos/vodafone.png',
  industry: 'Telecommunications',
  joinDate: '2024-02-15',
  totalBudget: 750000,
  spentBudget: 280000,
  activeCampaigns: 4,
  totalTasks: 15,
  completedTasks: 11
};

// المعلن 3: Noon Egypt
export const advertiser3: Advertiser = {
  id: 'ADV003',
  name: 'خالد عمر',
  email: 'khaled@noon.com',
  company: 'Noon Egypt',
  logo: '/logos/noon.png',
  industry: 'E-commerce',
  joinDate: '2024-03-20',
  totalBudget: 400000,
  spentBudget: 95000,
  activeCampaigns: 2,
  totalTasks: 8,
  completedTasks: 5
};

// حملات المعلن 1 (Jumia)
export const advertiser1Campaigns: AdvertiserCampaign[] = [
  {
    id: 'CAMP001',
    advertiserId: 'ADV001',
    name: 'حملة تثبيت التطبيق - نوفمبر',
    budget: 150000,
    spent: 45000,
    tasksCompleted: 900,
    tasksTotal: 3000,
    status: 'active',
    startDate: '2024-11-01',
    endDate: '2024-11-30',
    targetAudience: {
      ageRange: '18-45',
      gender: 'الكل',
      location: 'جميع المحافظات',
      interests: ['تسوق', 'تكنولوجيا', 'موضة']
    },
    performance: {
      impressions: 50000,
      clicks: 12500,
      conversions: 900,
      ctr: 25,
      roi: 180
    }
  },
  {
    id: 'CAMP002',
    advertiserId: 'ADV001',
    name: 'حملة العروض الأسبوعية',
    budget: 80000,
    spent: 32000,
    tasksCompleted: 640,
    tasksTotal: 1600,
    status: 'active',
    startDate: '2024-10-15',
    endDate: '2024-12-15',
    targetAudience: {
      ageRange: '25-55',
      gender: 'الكل',
      location: 'القاهرة، الإسكندرية، الجيزة',
      interests: ['تسوق', 'عروض']
    },
    performance: {
      impressions: 35000,
      clicks: 8750,
      conversions: 640,
      ctr: 25,
      roi: 160
    }
  },
  {
    id: 'CAMP003',
    advertiserId: 'ADV001',
    name: 'حملة Black Friday',
    budget: 200000,
    spent: 48000,
    tasksCompleted: 480,
    tasksTotal: 4000,
    status: 'active',
    startDate: '2024-11-15',
    endDate: '2024-11-30',
    targetAudience: {
      ageRange: '18-65',
      gender: 'الكل',
      location: 'جميع المحافظات',
      interests: ['تسوق', 'عروض', 'إلكترونيات']
    },
    performance: {
      impressions: 25000,
      clicks: 6250,
      conversions: 480,
      ctr: 25,
      roi: 200
    }
  }
];

// حملات المعلن 2 (Vodafone)
export const advertiser2Campaigns: AdvertiserCampaign[] = [
  {
    id: 'CAMP004',
    advertiserId: 'ADV002',
    name: 'حملة Vodafone Cash',
    budget: 200000,
    spent: 80000,
    tasksCompleted: 1333,
    tasksTotal: 3333,
    status: 'active',
    startDate: '2024-10-01',
    endDate: '2024-12-31',
    targetAudience: {
      ageRange: '18-55',
      gender: 'الكل',
      location: 'جميع المحافظات',
      interests: ['تكنولوجيا', 'مدفوعات رقمية']
    },
    performance: {
      impressions: 80000,
      clicks: 20000,
      conversions: 1333,
      ctr: 25,
      roi: 167
    }
  },
  {
    id: 'CAMP005',
    advertiserId: 'ADV002',
    name: 'حملة باقات الإنترنت',
    budget: 150000,
    spent: 60000,
    tasksCompleted: 1200,
    tasksTotal: 3000,
    status: 'active',
    startDate: '2024-10-15',
    endDate: '2024-12-15',
    targetAudience: {
      ageRange: '16-45',
      gender: 'الكل',
      location: 'جميع المحافظات',
      interests: ['إنترنت', 'تكنولوجيا']
    },
    performance: {
      impressions: 60000,
      clicks: 15000,
      conversions: 1200,
      ctr: 25,
      roi: 150
    }
  },
  {
    id: 'CAMP006',
    advertiserId: 'ADV002',
    name: 'حملة Red Plus',
    budget: 180000,
    spent: 72000,
    tasksCompleted: 900,
    tasksTotal: 2250,
    status: 'active',
    startDate: '2024-11-01',
    endDate: '2024-12-31',
    targetAudience: {
      ageRange: '25-55',
      gender: 'الكل',
      location: 'القاهرة، الإسكندرية، الجيزة، طنطا',
      interests: ['تكنولوجيا', 'ترفيه']
    },
    performance: {
      impressions: 45000,
      clicks: 11250,
      conversions: 900,
      ctr: 25,
      roi: 125
    }
  },
  {
    id: 'CAMP007',
    advertiserId: 'ADV002',
    name: 'حملة خدمة العملاء',
    budget: 100000,
    spent: 40000,
    tasksCompleted: 800,
    tasksTotal: 2000,
    status: 'paused',
    startDate: '2024-09-01',
    endDate: '2024-11-30',
    targetAudience: {
      ageRange: '18-65',
      gender: 'الكل',
      location: 'جميع المحافظات',
      interests: ['خدمات']
    },
    performance: {
      impressions: 40000,
      clicks: 10000,
      conversions: 800,
      ctr: 25,
      roi: 100
    }
  }
];

// حملات المعلن 3 (Noon)
export const advertiser3Campaigns: AdvertiserCampaign[] = [
  {
    id: 'CAMP008',
    advertiserId: 'ADV003',
    name: 'حملة تثبيت التطبيق',
    budget: 120000,
    spent: 36000,
    tasksCompleted: 800,
    tasksTotal: 2667,
    status: 'active',
    startDate: '2024-10-20',
    endDate: '2024-12-20',
    targetAudience: {
      ageRange: '20-50',
      gender: 'الكل',
      location: 'القاهرة، الإسكندرية، الجيزة',
      interests: ['تسوق', 'موضة', 'إلكترونيات']
    },
    performance: {
      impressions: 40000,
      clicks: 10000,
      conversions: 800,
      ctr: 25,
      roi: 178
    }
  },
  {
    id: 'CAMP009',
    advertiserId: 'ADV003',
    name: 'حملة الموضة والأزياء',
    budget: 90000,
    spent: 27000,
    tasksCompleted: 600,
    tasksTotal: 2000,
    status: 'active',
    startDate: '2024-11-01',
    endDate: '2024-12-31',
    targetAudience: {
      ageRange: '18-45',
      gender: 'إناث',
      location: 'جميع المحافظات',
      interests: ['موضة', 'تسوق', 'جمال']
    },
    performance: {
      impressions: 30000,
      clicks: 7500,
      conversions: 600,
      ctr: 25,
      roi: 167
    }
  }
];

// مهام المعلن 1 (Jumia)
export const advertiser1Tasks: AdvertiserTask[] = [
  {
    id: 'TASK001',
    advertiserId: 'ADV001',
    campaignId: 'CAMP001',
    title: 'تثبيت تطبيق Jumia واستخدامه',
    description: 'حمّل تطبيق Jumia، أنشئ حساب جديد، وتصفح قسم العروض اليومية',
    type: 'app',
    reward: 50,
    duration: 10,
    difficulty: 'medium',
    status: 'active',
    totalBudget: 150000,
    spentBudget: 45000,
    completedCount: 900,
    targetCount: 3000,
    createdAt: '2024-11-01',
    expiresAt: '2024-11-30'
  },
  {
    id: 'TASK002',
    advertiserId: 'ADV001',
    campaignId: 'CAMP002',
    title: 'تصفح عروض Jumia الأسبوعية',
    description: 'تصفح قسم العروض الأسبوعية والتقط لقطة شاشة',
    type: 'app',
    reward: 20,
    duration: 5,
    difficulty: 'easy',
    status: 'active',
    totalBudget: 32000,
    spentBudget: 12800,
    completedCount: 640,
    targetCount: 1600,
    createdAt: '2024-10-15',
    expiresAt: '2024-12-15'
  },
  {
    id: 'TASK003',
    advertiserId: 'ADV001',
    campaignId: 'CAMP003',
    title: 'مشاركة عروض Black Friday',
    description: 'شارك عروض Black Friday على فيسبوك أو تويتر',
    type: 'social',
    reward: 30,
    duration: 3,
    difficulty: 'easy',
    status: 'active',
    totalBudget: 14400,
    spentBudget: 3600,
    completedCount: 120,
    targetCount: 480,
    createdAt: '2024-11-15',
    expiresAt: '2024-11-30'
  },
  {
    id: 'TASK004',
    advertiserId: 'ADV001',
    campaignId: 'CAMP003',
    title: 'استبيان تجربة التسوق',
    description: 'أجب على استبيان قصير عن تجربتك في التسوق الإلكتروني',
    type: 'survey',
    reward: 40,
    duration: 8,
    difficulty: 'easy',
    status: 'active',
    totalBudget: 14400,
    spentBudget: 3600,
    completedCount: 90,
    targetCount: 360,
    createdAt: '2024-11-15',
    expiresAt: '2024-11-30'
  }
];

// مهام المعلن 2 (Vodafone)
export const advertiser2Tasks: AdvertiserTask[] = [
  {
    id: 'TASK005',
    advertiserId: 'ADV002',
    campaignId: 'CAMP004',
    title: 'تثبيت تطبيق Vodafone Cash',
    description: 'حمّل تطبيق Vodafone Cash وأنشئ حساباً جديداً',
    type: 'app',
    reward: 60,
    duration: 15,
    difficulty: 'medium',
    status: 'active',
    totalBudget: 200000,
    spentBudget: 80000,
    completedCount: 1333,
    targetCount: 3333,
    createdAt: '2024-10-01',
    expiresAt: '2024-12-31'
  },
  {
    id: 'TASK006',
    advertiserId: 'ADV002',
    campaignId: 'CAMP005',
    title: 'مشاهدة فيديو باقات الإنترنت',
    description: 'شاهد فيديو توضيحي عن باقات الإنترنت الجديدة',
    type: 'video',
    reward: 25,
    duration: 3,
    difficulty: 'easy',
    status: 'active',
    totalBudget: 30000,
    spentBudget: 12000,
    completedCount: 480,
    targetCount: 1200,
    createdAt: '2024-10-15',
    expiresAt: '2024-12-15'
  },
  {
    id: 'TASK007',
    advertiserId: 'ADV002',
    campaignId: 'CAMP005',
    title: 'استبيان استخدام الإنترنت',
    description: 'أجب على أسئلة عن استخدامك للإنترنت',
    type: 'survey',
    reward: 35,
    duration: 7,
    difficulty: 'easy',
    status: 'active',
    totalBudget: 25200,
    spentBudget: 10080,
    completedCount: 288,
    targetCount: 720,
    createdAt: '2024-10-15',
    expiresAt: '2024-12-15'
  },
  {
    id: 'TASK008',
    advertiserId: 'ADV002',
    campaignId: 'CAMP006',
    title: 'تجربة خدمة Red Plus',
    description: 'جرب خدمة Red Plus واكتب تقييماً',
    type: 'app',
    reward: 80,
    duration: 20,
    difficulty: 'medium',
    status: 'active',
    totalBudget: 72000,
    spentBudget: 28800,
    completedCount: 360,
    targetCount: 900,
    createdAt: '2024-11-01',
    expiresAt: '2024-12-31'
  },
  {
    id: 'TASK009',
    advertiserId: 'ADV002',
    campaignId: 'CAMP007',
    title: 'تقييم خدمة العملاء',
    description: 'قيّم تجربتك مع خدمة عملاء Vodafone',
    type: 'survey',
    reward: 50,
    duration: 10,
    difficulty: 'easy',
    status: 'paused',
    totalBudget: 40000,
    spentBudget: 16000,
    completedCount: 320,
    targetCount: 800,
    createdAt: '2024-09-01',
    expiresAt: '2024-11-30'
  }
];

// مهام المعلن 3 (Noon)
export const advertiser3Tasks: AdvertiserTask[] = [
  {
    id: 'TASK010',
    advertiserId: 'ADV003',
    campaignId: 'CAMP008',
    title: 'تثبيت تطبيق Noon وإضافة منتج للسلة',
    description: 'حمّل تطبيق Noon، تصفح المنتجات، وأضف منتجاً للسلة',
    type: 'app',
    reward: 45,
    duration: 8,
    difficulty: 'easy',
    status: 'active',
    totalBudget: 36000,
    spentBudget: 10800,
    completedCount: 240,
    targetCount: 800,
    createdAt: '2024-10-20',
    expiresAt: '2024-12-20'
  },
  {
    id: 'TASK011',
    advertiserId: 'ADV003',
    campaignId: 'CAMP008',
    title: 'مشاركة منتج من Noon',
    description: 'اختر منتجاً من Noon وشاركه على وسائل التواصل',
    type: 'social',
    reward: 25,
    duration: 5,
    difficulty: 'easy',
    status: 'active',
    totalBudget: 14000,
    spentBudget: 4200,
    completedCount: 168,
    targetCount: 560,
    createdAt: '2024-10-20',
    expiresAt: '2024-12-20'
  },
  {
    id: 'TASK012',
    advertiserId: 'ADV003',
    campaignId: 'CAMP009',
    title: 'استبيان الموضة والأزياء',
    description: 'أجب على أسئلة عن تفضيلاتك في الموضة',
    type: 'survey',
    reward: 30,
    duration: 6,
    difficulty: 'easy',
    status: 'active',
    totalBudget: 18000,
    spentBudget: 5400,
    completedCount: 180,
    targetCount: 600,
    createdAt: '2024-11-01',
    expiresAt: '2024-12-31'
  }
];

// دالة للحصول على بيانات معلن محدد
export function getAdvertiserById(advertiserId: string): Advertiser | null {
  switch (advertiserId) {
    case 'ADV001':
      return advertiser1;
    case 'ADV002':
      return advertiser2;
    case 'ADV003':
      return advertiser3;
    default:
      return null;
  }
}

// دالة للحصول على حملات معلن محدد
export function getAdvertiserCampaigns(advertiserId: string): AdvertiserCampaign[] {
  switch (advertiserId) {
    case 'ADV001':
      return advertiser1Campaigns;
    case 'ADV002':
      return advertiser2Campaigns;
    case 'ADV003':
      return advertiser3Campaigns;
    default:
      return [];
  }
}

// دالة للحصول على مهام معلن محدد
export function getAdvertiserTasks(advertiserId: string): AdvertiserTask[] {
  switch (advertiserId) {
    case 'ADV001':
      return advertiser1Tasks;
    case 'ADV002':
      return advertiser2Tasks;
    case 'ADV003':
      return advertiser3Tasks;
    default:
      return [];
  }
}

// جميع المعلنين (للاستخدام في صفحة تسجيل الدخول)
export const allAdvertisers = [advertiser1, advertiser2, advertiser3];
