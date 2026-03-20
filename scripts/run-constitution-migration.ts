import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

async function runMigration() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const connection = await mysql.createConnection(dbUrl);
  console.log('✅ Connected to database');

  try {
    // 1. Alter advertiser tier ENUM (add new values first)
    console.log('\n🔄 Step 1: Expanding advertiser tier ENUM...');
    await connection.execute(`
      ALTER TABLE advertisers
      MODIFY COLUMN tier ENUM('basic','pro','premium','enterprise','starter','growth','precision') NOT NULL DEFAULT 'starter'
    `);
    console.log('   ✅ ENUM expanded');

    // 2. Migrate existing data
    console.log('\n🔄 Step 2: Migrating existing advertiser tiers...');
    const [r1] = await connection.execute(`UPDATE advertisers SET tier = 'starter'   WHERE tier = 'basic'`);
    const [r2] = await connection.execute(`UPDATE advertisers SET tier = 'growth'    WHERE tier = 'pro'`);
    const [r3] = await connection.execute(`UPDATE advertisers SET tier = 'precision' WHERE tier = 'premium'`);
    console.log(`   ✅ Migrated: basic→starter(${(r1 as any).affectedRows}), pro→growth(${(r2 as any).affectedRows}), premium→precision(${(r3 as any).affectedRows})`);

    // 3. Remove old ENUM values
    console.log('\n🔄 Step 3: Removing old tier ENUM values...');
    await connection.execute(`
      ALTER TABLE advertisers
      MODIFY COLUMN tier ENUM('starter','growth','precision','enterprise') NOT NULL DEFAULT 'starter'
    `);
    console.log('   ✅ Old values removed');

    // 4. Expand task type ENUM
    console.log('\n🔄 Step 4: Expanding task type ENUM...');
    await connection.execute(`
      ALTER TABLE tasks
      MODIFY COLUMN type ENUM('survey','app','visit','review','social','video','quiz','photo','mystery_shopping','ugc_video','lead_gen','other') NOT NULL
    `);
    console.log('   ✅ Task types expanded');

    // 5. Seed 15 Constitution tasks
    console.log('\n🔄 Step 5: Seeding 15 Constitution task templates...');
    
    // Check if we have advertiserId=1
    const [advRows]: any = await connection.execute(`SELECT id FROM advertisers ORDER BY id LIMIT 1`);
    const advertiserId = advRows.length > 0 ? advRows[0].id : 1;
    console.log(`   Using advertiserId: ${advertiserId}`);
    
    // Check countryId for Egypt
    const [countryRows]: any = await connection.execute(`SELECT id FROM countries WHERE code = 'EG' LIMIT 1`);
    const countryId = countryRows.length > 0 ? countryRows[0].id : 1;
    console.log(`   Using countryId: ${countryId}`);

    const tasks = [
      // T1: Starter Tasks
      { titleAr: 'شاهد فيديو العلامة التجارية', titleEn: 'Watch Brand Video', descAr: 'شاهد الفيديو القصير وأجب على سؤال سريع', descEn: 'Watch a short brand video and answer a quick question', type: 'video', reward: 10, duration: 1, difficulty: 'easy' },
      { titleAr: 'اختبار معرفة المنتج', titleEn: 'Product Knowledge Quiz', descAr: 'أجب على 3 أسئلة سريعة عن المنتج', descEn: 'Answer 3 quick questions about the product', type: 'quiz', reward: 15, duration: 1, difficulty: 'easy' },
      { titleAr: 'تفاعل مع منشور سوشيال ميديا', titleEn: 'Social Media Engagement', descAr: 'تابع الصفحة وتفاعل مع المنشور المحدد', descEn: 'Follow the page and engage with the specified post', type: 'social', reward: 8, duration: 1, difficulty: 'easy' },
      { titleAr: 'شاهد فيديو إعلاني طويل', titleEn: 'Extended Ad Video Watch', descAr: 'شاهد الفيديو الإعلاني كاملاً وأكمل الاستبيان', descEn: 'Watch the full ad video and complete the survey', type: 'video', reward: 26, duration: 2, difficulty: 'easy' },
      // T2: Growth Tasks
      { titleAr: 'استبيان رضا العملاء', titleEn: 'Customer Satisfaction Survey', descAr: 'أكمل استبيان مفصل عن تجربتك مع المنتج', descEn: 'Complete a detailed survey about your product experience', type: 'survey', reward: 50, duration: 5, difficulty: 'medium' },
      { titleAr: 'تحميل وتقييم تطبيق', titleEn: 'App Install & Review', descAr: 'حمّل التطبيق وقيّم تجربتك', descEn: 'Download the app and review your experience', type: 'app', reward: 75, duration: 5, difficulty: 'medium' },
      { titleAr: 'استبيان أبحاث السوق', titleEn: 'Market Research Survey', descAr: 'شارك في استبيان أبحاث السوق المتقدم', descEn: 'Participate in an advanced market research survey', type: 'survey', reward: 104, duration: 5, difficulty: 'medium' },
      { titleAr: 'تفاعل متقدم مع التطبيق', titleEn: 'Advanced App Engagement', descAr: 'حمّل التطبيق وأكمل 3 مهام داخلية', descEn: 'Download the app and complete 3 in-app tasks', type: 'app', reward: 65, duration: 5, difficulty: 'medium' },
      // T3: Precision Tasks
      { titleAr: 'تصوير منتج في المتجر', titleEn: 'In-Store Photo Audit', descAr: 'التقط صور للمنتجات على الرفوف في المتجر المحدد', descEn: 'Take photos of products on shelves at the specified store', type: 'photo', reward: 200, duration: 30, difficulty: 'hard' },
      { titleAr: 'زيارة فرع والتقييم', titleEn: 'Retail Visit & Review', descAr: 'قم بزيارة الفرع المحدد وقيّم الخدمة والنظافة', descEn: 'Visit the specified branch and review service and cleanliness', type: 'visit', reward: 250, duration: 45, difficulty: 'hard' },
      { titleAr: 'مراجعة منتج تفصيلية', titleEn: 'Detailed Product Review', descAr: 'اشترِ المنتج واكتب مراجعة شاملة مع صور', descEn: 'Purchase the product and write a comprehensive review with photos', type: 'review', reward: 520, duration: 60, difficulty: 'hard' },
      // T4: Enterprise Tasks
      { titleAr: 'التسوق الخفي', titleEn: 'Mystery Shopping Mission', descAr: 'قم بزيارة الفرع كعميل خفي وقدم تقريراً مفصلاً', descEn: 'Visit the branch as a mystery shopper and submit a detailed report', type: 'mystery_shopping', reward: 750, duration: 90, difficulty: 'hard' },
      { titleAr: 'إنشاء فيديو UGC', titleEn: 'UGC Video Creation', descAr: 'أنشئ فيديو إبداعي عن المنتج بأسلوبك الخاص', descEn: 'Create a creative video about the product in your own style', type: 'ugc_video', reward: 1500, duration: 120, difficulty: 'hard' },
      { titleAr: 'توليد عميل محتمل موثق', titleEn: 'Verified Lead Generation', descAr: 'سجّل حساب جديد في الخدمة وأكمل التحقق', descEn: 'Register a new account on the service and complete verification', type: 'lead_gen', reward: 2000, duration: 60, difficulty: 'hard' },
      { titleAr: 'حملة تسوق خفي شاملة', titleEn: 'Full Mystery Shopping Campaign', descAr: 'قم بزيارة 3 فروع وقارن الأسعار والخدمة وقدم تقريراً', descEn: 'Visit 3 branches, compare prices and service, submit a report', type: 'mystery_shopping', reward: 2600, duration: 180, difficulty: 'hard' },
    ];

    let seeded = 0;
    for (const t of tasks) {
      await connection.execute(
        `INSERT INTO tasks (advertiserId, titleAr, titleEn, descriptionAr, descriptionEn, type, reward, duration, difficulty, status, countryId)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', ?)`,
        [advertiserId, t.titleAr, t.titleEn, t.descAr, t.descEn, t.type, t.reward, t.duration, t.difficulty, countryId]
      );
      seeded++;
    }
    console.log(`   ✅ Seeded ${seeded} Constitution task templates`);

    // 6. Print summary of all tasks
    console.log('\n📋 TASK REGISTRY:');
    console.log('─'.repeat(100));
    const [allTasks]: any = await connection.execute(
      `SELECT id, titleEn, type, reward, duration, difficulty FROM tasks WHERE advertiserId = ? ORDER BY id`,
      [advertiserId]
    );
    console.log(`${'ID'.padEnd(6)} | ${'Title'.padEnd(35)} | ${'Type'.padEnd(18)} | ${'Reward'.padEnd(10)} | ${'Duration'.padEnd(10)} | ${'Difficulty'}`);
    console.log('─'.repeat(100));
    for (const row of allTasks) {
      console.log(`${String(row.id).padEnd(6)} | ${row.titleEn.padEnd(35)} | ${row.type.padEnd(18)} | ${String(row.reward + ' EGP').padEnd(10)} | ${String(row.duration + ' min').padEnd(10)} | ${row.difficulty}`);
    }

    // 7. Print advertiser tiers
    console.log('\n📊 ADVERTISER TIERS:');
    console.log('─'.repeat(60));
    const [advs]: any = await connection.execute(`SELECT id, nameEn, tier, totalSpend FROM advertisers ORDER BY id`);
    for (const a of advs) {
      console.log(`  ID:${a.id} | ${a.nameEn || 'N/A'} | Tier: ${a.tier} | Spend: ${a.totalSpend} EGP`);
    }

    console.log('\n✅ Constitution migration complete!');
  } catch (err: any) {
    console.error('❌ Migration error:', err.message);
    throw err;
  } finally {
    await connection.end();
  }
}

runMigration().catch(e => {
  console.error(e);
  process.exit(1);
});
