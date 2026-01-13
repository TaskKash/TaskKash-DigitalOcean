import { getDb } from './db';
import { advertisers, countries, tasks } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Starting database seeding...');

  const db = await getDb();
  if (!db) {
    throw new Error('Failed to connect to database');
  }

  try {
    // 1. Seed Countries
    console.log('📍 Seeding countries...');
    const countriesData = [
      {
        code: 'EG',
        nameAr: 'مصر',
        nameEn: 'Egypt',
        currency: 'EGP',
        currencySymbol: 'ج.م',
        isActive: 1,
      },
      {
        code: 'SA',
        nameAr: 'السعودية',
        nameEn: 'Saudi Arabia',
        currency: 'SAR',
        currencySymbol: 'ر.س',
        isActive: 1,
      },
      {
        code: 'AE',
        nameAr: 'الإمارات',
        nameEn: 'UAE',
        currency: 'AED',
        currencySymbol: 'د.إ',
        isActive: 1,
      },
      {
        code: 'KW',
        nameAr: 'الكويت',
        nameEn: 'Kuwait',
        currency: 'KWD',
        currencySymbol: 'د.ك',
        isActive: 1,
      },
      {
        code: 'QA',
        nameAr: 'قطر',
        nameEn: 'Qatar',
        currency: 'QAR',
        currencySymbol: 'ر.ق',
        isActive: 1,
      },
    ];

    for (const country of countriesData) {
      await db.insert(countries).values(country);
    }
    console.log(`✅ Seeded ${countriesData.length} countries`);

    // Get Egypt ID for advertisers
    const egyptResult = await db.select().from(countries).where(eq(countries.code, 'EG')).limit(1);
    const egyptId = egyptResult[0]?.id || 1;

    // 2. Seed Advertisers
    console.log('🏢 Seeding advertisers...');
    const advertisersData = [
      {
        slug: 'vodafone-egypt',
        nameAr: 'فودافون مصر',
        nameEn: 'Vodafone Egypt',
        descriptionAr: 'شركة اتصالات رائدة في مصر',
        descriptionEn: 'Leading telecommunications company in Egypt',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Vodafone_icon.svg/240px-Vodafone_icon.svg.png',
        coverImage: '/covers/vodafone-cover.jpg',
        category: 'telecommunications',
        verified: 1,
        followers: 125000,
        totalCampaigns: 45,
        activeUsers: 42000,
        paymentRate: 100,
        rating: 48,
        reviewCount: 8234,
        countryId: egyptId,
        isActive: 1,
      },
      {
        slug: 'jumia-egypt',
        nameAr: 'جوميا مصر',
        nameEn: 'Jumia Egypt',
        descriptionAr: 'منصة التسوق الإلكتروني الرائدة في مصر',
        descriptionEn: 'Leading e-commerce platform in Egypt',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Jumia_Logo.png/240px-Jumia_Logo.png',
        coverImage: '/covers/jumia-cover.jpg',
        category: 'ecommerce',
        verified: 1,
        followers: 98000,
        totalCampaigns: 32,
        activeUsers: 35000,
        paymentRate: 99,
        rating: 47,
        reviewCount: 5621,
        countryId: egyptId,
        isActive: 1,
      },
      {
        slug: 'uber-egypt',
        nameAr: 'أوبر مصر',
        nameEn: 'Uber Egypt',
        descriptionAr: 'خدمة نقل ومواصلات حديثة',
        descriptionEn: 'Modern transportation service',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Uber_logo_2018.png/240px-Uber_logo_2018.png',
        coverImage: '/covers/uber-cover.jpg',
        category: 'transport',
        verified: 1,
        followers: 87000,
        totalCampaigns: 28,
        activeUsers: 28000,
        paymentRate: 100,
        rating: 46,
        reviewCount: 4532,
        countryId: egyptId,
        isActive: 1,
      },
    ];

    for (const advertiser of advertisersData) {
      await db.insert(advertisers).values(advertiser);
    }
    console.log(`✅ Seeded ${advertisersData.length} advertisers`);

    // Get advertiser IDs
    const vodafoneResult = await db.select().from(advertisers).where(eq(advertisers.slug, 'vodafone-egypt')).limit(1);
    const jumiaResult = await db.select().from(advertisers).where(eq(advertisers.slug, 'jumia-egypt')).limit(1);
    const uberResult = await db.select().from(advertisers).where(eq(advertisers.slug, 'uber-egypt')).limit(1);

    const vodafoneId = vodafoneResult[0]?.id || 1;
    const jumiaId = jumiaResult[0]?.id || 2;
    const uberId = uberResult[0]?.id || 3;

    // 3. Seed Tasks
    console.log('📋 Seeding tasks...');
    const tasksData = [
      // Vodafone Tasks
      {
        advertiserId: vodafoneId,
        titleAr: 'تثبيت تطبيق Vodafone Cash',
        titleEn: 'Install Vodafone Cash App',
        descriptionAr: 'حمّل تطبيق Vodafone Cash وأنشئ حساباً جديداً',
        descriptionEn: 'Download Vodafone Cash app and create a new account',
        type: 'app',
        reward: 6000, // 60 EGP in piasters
        duration: 15,
        difficulty: 'medium',
        requiredProfileStrength: 30,
        image: 'https://play-lh.googleusercontent.com/placeholder.png',
        rating: 45,
        status: 'available',
        countryId: egyptId,
      },
      {
        advertiserId: vodafoneId,
        titleAr: 'تقييم خدمة عملاء فودافون',
        titleEn: 'Rate Vodafone Customer Service',
        descriptionAr: 'قيّم تجربتك مع خدمة عملاء فودافون',
        descriptionEn: 'Rate your experience with Vodafone customer service',
        type: 'review',
        reward: 3000, // 30 EGP
        duration: 5,
        difficulty: 'easy',
        requiredProfileStrength: 0,
        rating: 48,
        status: 'available',
        countryId: egyptId,
      },
      // Jumia Tasks
      {
        advertiserId: jumiaId,
        titleAr: 'تثبيت تطبيق Jumia واستخدامه',
        titleEn: 'Install and Use Jumia App',
        descriptionAr: 'حمّل تطبيق Jumia، أنشئ حساب جديد، وتصفح قسم العروض اليومية',
        descriptionEn: 'Download Jumia app, create a new account, and browse daily deals section',
        type: 'app',
        reward: 5000, // 50 EGP
        duration: 10,
        difficulty: 'medium',
        requiredProfileStrength: 0,
        rating: 47,
        status: 'available',
        countryId: egyptId,
      },
      {
        advertiserId: jumiaId,
        titleAr: 'إضافة منتج للسلة في Jumia',
        titleEn: 'Add Product to Cart in Jumia',
        descriptionAr: 'تصفح المنتجات في تطبيق Jumia وأضف منتجاً للسلة',
        descriptionEn: 'Browse products in Jumia app and add a product to cart',
        type: 'app',
        reward: 4500, // 45 EGP
        duration: 8,
        difficulty: 'easy',
        requiredProfileStrength: 0,
        rating: 46,
        status: 'available',
        countryId: egyptId,
      },
      // Uber Tasks
      {
        advertiserId: uberId,
        titleAr: 'تثبيت تطبيق Uber',
        titleEn: 'Install Uber App',
        descriptionAr: 'حمّل تطبيق Uber وأنشئ حساباً جديداً',
        descriptionEn: 'Download Uber app and create a new account',
        type: 'app',
        reward: 5500, // 55 EGP
        duration: 10,
        difficulty: 'easy',
        requiredProfileStrength: 30,
        rating: 48,
        status: 'available',
        countryId: egyptId,
      },
      {
        advertiserId: uberId,
        titleAr: 'تقييم رحلة Uber',
        titleEn: 'Rate Uber Trip',
        descriptionAr: 'قيّم آخر رحلة لك مع Uber',
        descriptionEn: 'Rate your last Uber trip',
        type: 'review',
        reward: 2500, // 25 EGP
        duration: 3,
        difficulty: 'easy',
        requiredProfileStrength: 0,
        rating: 49,
        status: 'available',
        countryId: egyptId,
      },
    ];

    for (const task of tasksData) {
      await db.insert(tasks).values(task);
    }
    console.log(`✅ Seeded ${tasksData.length} tasks`);

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log('✅ Seed script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  });
