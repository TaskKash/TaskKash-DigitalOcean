/**
 * Advertiser data for brand pages
 */

export interface AdvertiserData {
  id: string;
  name: string;
  nameEn: string;
  logo: string;
  coverImage: string;
  description: string;
  verified: boolean;
  category: string;
  website: string;
  followers: number;
  stats: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalUsers: number;
    totalPaid: number;
    avgRating: number;
    reviewsCount: number;
    paymentRate: number;
  };
  recentTasks: Array<{
    id: number;
    title: string;
    type: string;
    reward: number;
    completedBy: number;
    targetUsers: number;
    completionRate: number;
    avgRating: number;
    status: string;
    image: string;
    achievement: string;
    impact: string;
  }>;
  upcomingTasks: Array<{
    id: number;
    title: string;
    type: string;
    reward: number;
    launchDate: string;
    teaser: string;
    estimatedUsers: number;
    requirements: string[];
  }>;
  successStories: Array<{
    id: number;
    userName: string;
    userAvatar: string;
    story: string;
    earnings: number;
    tasksCompleted: number;
    date: string;
    image: string;
  }>;
  reviews: Array<{
    id: number;
    userName: string;
    userAvatar: string;
    rating: number;
    comment: string;
    date: string;
    tasksCompleted: number;
  }>;
}

// Advertiser database
export const advertisersData: Record<string, AdvertiserData> = {
  'vodafone-egypt': {
    id: 'vodafone-egypt',
    name: 'فودافون مصر',
    nameEn: 'Vodafone Egypt',
    logo: '/advertisers/vodafone.png',
    coverImage: '/covers/vodafone-cover.jpg',
    description: 'فودافون مصر هي إحدى أكبر شركات الاتصالات في مصر، نسعى دائماً لتحسين حياة المصريين من خلال تقديم أفضل الخدمات والعروض المبتكرة.',
    verified: true,
    category: 'اتصالات',
    website: 'vodafone.com.eg',
    followers: 125000,
    stats: {
      totalCampaigns: 1250,
      activeCampaigns: 45,
      totalUsers: 50000,
      totalPaid: 2500000,
      avgRating: 4.8,
      reviewsCount: 8934,
      paymentRate: 99.8
    },
    recentTasks: [
      {
        id: 1,
        title: 'اختبار تطبيق My Vodafone الجديد',
        type: 'تطبيق',
        reward: 50,
        completedBy: 2500,
        targetUsers: 3000,
        completionRate: 83,
        avgRating: 4.9,
        status: 'completed',
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
        achievement: 'ساعد في اكتشاف 47 مشكلة وتحسين تجربة 2 مليون مستخدم',
        impact: '🎯 تحسين تجربة المستخدم بنسبة 35%'
      },
      {
        id: 2,
        title: 'استبيان رضا العملاء عن خدمة 4G',
        type: 'استبيان',
        reward: 30,
        completedBy: 5000,
        targetUsers: 5000,
        completionRate: 100,
        avgRating: 4.7,
        status: 'completed',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
        achievement: 'جمع 5000 رأي حقيقي من مستخدمين في 12 محافظة',
        impact: '📊 بيانات ساعدت في تحسين تغطية الشبكة'
      },
      {
        id: 3,
        title: 'زيارة ميدانية لفروع فودافون',
        type: 'زيارة ميدانية',
        reward: 150,
        completedBy: 450,
        targetUsers: 500,
        completionRate: 90,
        avgRating: 4.8,
        status: 'completed',
        image: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=400&h=300&fit=crop',
        achievement: 'تقييم جودة الخدمة في 450 فرع على مستوى الجمهورية',
        impact: '⭐ تحسين مستوى الخدمة في 89% من الفروع'
      }
    ],
    upcomingTasks: [
      {
        id: 1,
        title: 'اختبار عرض رمضان الجديد',
        type: 'استبيان',
        reward: 40,
        launchDate: 'قريباً',
        teaser: '🎁 عرض رمضان الحصري! كن أول من يجربه واحصل على مكافأة مضاعفة',
        estimatedUsers: 10000,
        requirements: ['عميل فودافون', 'عمر 18+']
      }
    ],
    successStories: [
      {
        id: 1,
        userName: 'محمد أحمد',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mohamed',
        story: 'بفضل فودافون، استطعت كسب 2,500 ج.م في 3 أشهر! المهام سهلة والدفع سريع.',
        earnings: 2500,
        tasksCompleted: 45,
        date: '2024-10-15',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop'
      }
    ],
    reviews: [
      {
        id: 1,
        userName: 'سارة محمود',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara',
        rating: 5,
        comment: 'أفضل معلن على المنصة! المهام واضحة والدفع فوري.',
        date: '2024-10-20',
        tasksCompleted: 32
      }
    ]
  },
  
  'jumia-egypt': {
    id: 'jumia-egypt',
    name: 'جوميا مصر',
    nameEn: 'Jumia Egypt',
    logo: '/logos/jumia.png',
    coverImage: '/covers/jumia-cover.jpg',
    description: 'جوميا هي أكبر منصة تسوق إلكتروني في مصر وأفريقيا، نوفر ملايين المنتجات بأفضل الأسعار مع توصيل سريع وآمن.',
    verified: true,
    category: 'تجارة إلكترونية',
    website: 'jumia.com.eg',
    followers: 98000,
    stats: {
      totalCampaigns: 850,
      activeCampaigns: 32,
      totalUsers: 35000,
      totalPaid: 1750000,
      avgRating: 4.7,
      reviewsCount: 6542,
      paymentRate: 99.5
    },
    recentTasks: [
      {
        id: 1,
        title: 'تثبيت تطبيق Jumia واستخدامه',
        type: 'تطبيق',
        reward: 50,
        completedBy: 3200,
        targetUsers: 4000,
        completionRate: 80,
        avgRating: 4.8,
        status: 'completed',
        image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=300&fit=crop',
        achievement: 'ساعد في زيادة تحميلات التطبيق بنسبة 45%',
        impact: '📱 3,200 مستخدم جديد للتطبيق'
      },
      {
        id: 2,
        title: 'استبيان عن تجربة التسوق',
        type: 'استبيان',
        reward: 35,
        completedBy: 4500,
        targetUsers: 5000,
        completionRate: 90,
        avgRating: 4.6,
        status: 'completed',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
        achievement: 'جمع آراء 4,500 مستخدم حول تجربة التسوق',
        impact: '📊 تحسين خدمة العملاء بناءً على الملاحظات'
      }
    ],
    upcomingTasks: [
      {
        id: 1,
        title: 'تجربة خاصية الدفع عند الاستلام',
        type: 'تطبيق',
        reward: 60,
        launchDate: '15 نوفمبر',
        teaser: '🛍️ جرب خاصية الدفع عند الاستلام الجديدة واحصل على مكافأة!',
        estimatedUsers: 5000,
        requirements: ['مستخدم جديد', 'القاهرة أو الجيزة']
      }
    ],
    successStories: [
      {
        id: 1,
        userName: 'نورهان علي',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nourhan',
        story: 'مهام جوميا سهلة ومربحة! كسبت 1,800 ج.م في شهرين فقط.',
        earnings: 1800,
        tasksCompleted: 36,
        date: '2024-10-18',
        image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&h=400&fit=crop'
      }
    ],
    reviews: [
      {
        id: 1,
        userName: 'خالد حسن',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khaled',
        rating: 5,
        comment: 'معلن ممتاز! المهام واضحة والدفع سريع جداً.',
        date: '2024-10-22',
        tasksCompleted: 28
      }
    ]
  },

  'uber-egypt': {
    id: 'uber-egypt',
    name: 'أوبر مصر',
    nameEn: 'Uber Egypt',
    logo: '/logos/uber.png',
    coverImage: '/covers/uber-cover.jpg',
    description: 'أوبر هي منصة النقل الذكي الرائدة في مصر، نوفر رحلات آمنة ومريحة بأسعار تنافسية في جميع أنحاء البلاد.',
    verified: true,
    category: 'نقل ومواصلات',
    website: 'uber.com/eg',
    followers: 87000,
    stats: {
      totalCampaigns: 620,
      activeCampaigns: 28,
      totalUsers: 28000,
      totalPaid: 1400000,
      avgRating: 4.6,
      reviewsCount: 5234,
      paymentRate: 99.3
    },
    recentTasks: [
      {
        id: 1,
        title: 'تجربة خدمة Uber Comfort',
        type: 'زيارة ميدانية',
        reward: 120,
        completedBy: 850,
        targetUsers: 1000,
        completionRate: 85,
        avgRating: 4.7,
        status: 'completed',
        image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop',
        achievement: 'تقييم جودة خدمة Uber Comfort من 850 مستخدم',
        impact: '🚗 تحسين تجربة الركاب بنسبة 28%'
      },
      {
        id: 2,
        title: 'استبيان عن تطبيق Uber',
        type: 'استبيان',
        reward: 40,
        completedBy: 3500,
        targetUsers: 4000,
        completionRate: 87,
        avgRating: 4.5,
        status: 'completed',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
        achievement: 'جمع 3,500 رأي حول تجربة استخدام التطبيق',
        impact: '📊 تحديثات جديدة بناءً على ملاحظات المستخدمين'
      }
    ],
    upcomingTasks: [
      {
        id: 1,
        title: 'تجربة خدمة Uber Moto',
        type: 'زيارة ميدانية',
        reward: 80,
        launchDate: '20 نوفمبر',
        teaser: '🏍️ جرب خدمة Uber Moto الجديدة واحصل على رحلة مجانية!',
        estimatedUsers: 2000,
        requirements: ['القاهرة فقط', 'عمر 18+']
      }
    ],
    successStories: [
      {
        id: 1,
        userName: 'أحمد فتحي',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AhmedF',
        story: 'مهام أوبر ممتعة! كسبت 1,500 ج.م وحصلت على رحلات مجانية.',
        earnings: 1500,
        tasksCompleted: 25,
        date: '2024-10-19',
        image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&h=400&fit=crop'
      }
    ],
    reviews: [
      {
        id: 1,
        userName: 'مريم سعيد',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mariam',
        rating: 5,
        comment: 'مهام سهلة ومكافآت رائعة! أنصح الجميع بالمشاركة.',
        date: '2024-10-21',
        tasksCompleted: 18
      }
    ]
  },

  'samsung-egypt': {
    id: 'samsung-egypt',
    name: 'سامسونج مصر',
    nameEn: 'Samsung Egypt',
    logo: '/advertisers/samsung.png',
    coverImage: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1200&h=400&fit=crop',
    description: 'سامسونج هي الشركة الرائدة عالمياً في مجال التكنولوجيا والابتكار. نقدم أحدث الهواتف الذكية والأجهزة الإلكترونية التي تغير حياة الملايين حول العالم.',
    verified: true,
    category: 'تكنولوجيا وإلكترونيات',
    website: 'samsung.com/eg',
    followers: 250000,
    stats: {
      totalCampaigns: 2100,
      activeCampaigns: 65,
      totalUsers: 85000,
      totalPaid: 4250000,
      avgRating: 4.9,
      reviewsCount: 15420,
      paymentRate: 99.9
    },
    recentTasks: [
      {
        id: 1,
        title: 'Ultra Unfolds | Galaxy Z Fold7 | Samsung',
        type: 'فيديو',
        reward: 50,
        completedBy: 1850,
        targetUsers: 2000,
        completionRate: 92.5,
        avgRating: 4.9,
        status: 'active',
        image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=300&fit=crop',
        achievement: 'شاهد أكثر من 1,850 مستخدم فيديو Galaxy Z Fold7 الجديد',
        impact: '📱 زيادة الوعي بالمنتج بنسبة 78%'
      },
      {
        id: 2,
        title: 'اختبار تطبيق Samsung Members',
        type: 'تطبيق',
        reward: 60,
        completedBy: 4200,
        targetUsers: 5000,
        completionRate: 84,
        avgRating: 4.8,
        status: 'completed',
        image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=300&fit=crop',
        achievement: 'ساعد في اكتشاف 52 تحسين في تطبيق Samsung Members',
        impact: '⭐ تحسين تجربة المستخدم بنسبة 42%'
      },
      {
        id: 3,
        title: 'استبيان عن Galaxy Watch 7',
        type: 'استبيان',
        reward: 45,
        completedBy: 3800,
        targetUsers: 4000,
        completionRate: 95,
        avgRating: 4.7,
        status: 'completed',
        image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=300&fit=crop',
        achievement: 'جمع آراء 3,800 مستخدم حول Galaxy Watch 7',
        impact: '📊 بيانات ساعدت في تطوير الإصدار القادم'
      }
    ],
    upcomingTasks: [
      {
        id: 1,
        title: 'تجربة Galaxy S25 Ultra قبل الإطلاق',
        type: 'زيارة ميدانية',
        reward: 200,
        launchDate: '1 ديسمبر 2025',
        teaser: '🚀 كن أول من يجرب Galaxy S25 Ultra! مكافأة حصرية 200 ج.م',
        estimatedUsers: 500,
        requirements: ['مستخدم سامسونج', 'القاهرة أو الإسكندرية', 'عمر 18+']
      },
      {
        id: 2,
        title: 'استبيان عن Galaxy AI',
        type: 'استبيان',
        reward: 55,
        launchDate: 'قريباً',
        teaser: '🤖 شاركنا رأيك في تقنية Galaxy AI الذكية',
        estimatedUsers: 5000,
        requirements: ['مستخدم هاتف سامسونج']
      }
    ],
    successStories: [
      {
        id: 1,
        userName: 'أحمد محمد',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AhmedM',
        story: 'بفضل مهام سامسونج، كسبت 3,500 ج.م في 4 أشهر! المهام ممتعة والمكافآت رائعة. حتى حصلت على فرصة لتجربة Galaxy Z Fold6 قبل إطلاقه!',
        earnings: 3500,
        tasksCompleted: 58,
        date: '2024-10-25',
        image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=400&fit=crop'
      },
      {
        id: 2,
        userName: 'فاطمة علي',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima',
        story: 'سامسونج أفضل معلن على المنصة! المهام متنوعة والدفع فوري. كسبت 2,800 ج.م ووفرت لشراء Galaxy Watch.',
        earnings: 2800,
        tasksCompleted: 42,
        date: '2024-10-28',
        image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=400&fit=crop'
      }
    ],
    reviews: [
      {
        id: 1,
        userName: 'عمر حسن',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Omar',
        rating: 5,
        comment: 'أفضل معلن على الإطلاق! المهام واضحة، المكافآت ممتازة، والدفع فوري. أنصح الجميع بمهام سامسونج!',
        date: '2024-11-01',
        tasksCompleted: 45
      },
      {
        id: 2,
        userName: 'نورهان سعيد',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nourhan',
        rating: 5,
        comment: 'مهام سامسونج رائعة! استمتعت بمشاهدة فيديوهات المنتجات الجديدة وكسبت مكافآت ممتازة.',
        date: '2024-11-03',
        tasksCompleted: 38
      },
      {
        id: 3,
        userName: 'خالد محمود',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khaled',
        rating: 5,
        comment: 'معلن محترف جداً! الدفع سريع والمهام ممتعة. حصلت على فرصة لتجربة منتجات سامسونج الجديدة.',
        date: '2024-11-04',
        tasksCompleted: 52
      }
    ]
  }
};

/**
 * Get advertiser data by ID
 */
export function getAdvertiserData(advertiserId: string): AdvertiserData | null {
  return advertisersData[advertiserId] || null;
}

/**
 * Get all advertiser IDs
 */
export function getAllAdvertiserIds(): string[] {
  return Object.keys(advertisersData);
}
