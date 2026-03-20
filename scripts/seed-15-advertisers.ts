import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

dotenv.config();

function generateOpenId() {
  return 'adv_' + crypto.randomBytes(16).toString('hex');
}

async function seedAdvertisers() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const connection = await mysql.createConnection(dbUrl);
  console.log('✅ Connected to database');

  try {
    const defaultPassword = 'TaskKash2026';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const countryId = 1; // Egypt

    const mappedData = [
      // T1 (Starter) -> 4 Advertisers
      { brandName: 'Fresh', tier: 'starter', email: 'marketing@fresh.com.eg', taskNameSearch: 'Watch Brand Video' },
      { brandName: 'Edita', tier: 'starter', email: 'social@edita.com.eg', taskNameSearch: 'Product Knowledge Quiz' },
      { brandName: 'Juhayna', tier: 'starter', email: 'digital@juhayna.com', taskNameSearch: 'Social Media Engagement' },
      { brandName: '57357', tier: 'starter', email: 'ads@57357.org', taskNameSearch: 'Extended Ad Video Watch' },

      // T2 (Growth) -> 4 Advertisers
      { brandName: 'WE', tier: 'growth', email: 'growth@te.eg', taskNameSearch: 'Customer Satisfaction Survey' },
      { brandName: 'NBE', tier: 'growth', email: 'marketing@nbe.com.eg', taskNameSearch: 'App Install & Review' },
      { brandName: 'Etisalat', tier: 'growth', email: 'digital@etisalat.eg', taskNameSearch: 'Market Research Survey' },
      { brandName: 'Remas Land', tier: 'growth', email: 'info@remasland.com', taskNameSearch: 'Advanced App Engagement' },

      // T3 (Precision) -> 3 Advertisers
      { brandName: 'B-Laban', tier: 'precision', email: 'quality@b-laban.com', taskNameSearch: 'In-Store Photo Audit' },
      { brandName: 'Pepsi', tier: 'precision', email: 'mena.marketing@pepsico.com', taskNameSearch: 'Retail Visit & Review' },
      { brandName: 'Orange', tier: 'precision', email: 'campaigns@orange.eg', taskNameSearch: 'Detailed Product Review' },

      // T4 (Enterprise) -> 4 Advertisers
      { brandName: 'TMG', tier: 'enterprise', email: 'sales@tmg.com.eg', taskNameSearch: 'Mystery Shopping Mission' },
      { brandName: 'Palm Hills', tier: 'enterprise', email: 'marketing@palmhills.com', taskNameSearch: 'UGC Video Creation' },
      { brandName: 'Vodafone', tier: 'enterprise', email: 'enterprise@vodafone.com.eg', taskNameSearch: 'Verified Lead Generation' },
      { brandName: 'Banque Misr', tier: 'enterprise', email: 'cards@banquemisr.com', taskNameSearch: 'Full Mystery Shopping Campaign' },
    ];

    console.log('\n🔄 Creating 15 Constitution Advertisers and mapping tasks...');
    
    let credentialsList = [];

    for (const data of mappedData) {
      // 1. Check if advertiser already exists
      const [existing]: any = await connection.execute('SELECT id FROM advertisers WHERE email = ? LIMIT 1', [data.email]);
      let advertiserId;
      
      if (existing.length > 0) {
        advertiserId = existing[0].id;
        console.log(`  [SKIP] Advertiser ${data.brandName} already fully exists (ID: ${advertiserId})`);
      } else {
        // Create new advertiser
        const [insertResult]: any = await connection.execute(
          `INSERT INTO advertisers (openId, email, password, nameEn, nameAr, slug, tier, isActive, balance, totalSpent, countryId, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0, 0, ?, NOW(), NOW())`,
          [generateOpenId(), data.email, hashedPassword, data.brandName, data.brandName, data.brandName.toLowerCase().replace(/[' ]/g, '-'), data.tier, countryId]
        );
        advertiserId = insertResult.insertId;
        console.log(`  [OK] Created Advertiser: ${data.brandName} (ID: ${advertiserId})`);
      }

      // 2. Map the corresponding task to this specific advertiser
      const [updateTask]: any = await connection.execute(
        `UPDATE tasks SET advertiserId = ? WHERE titleEn = ? LIMIT 1`,
        [advertiserId, data.taskNameSearch]
      );

      credentialsList.push({
        Brand: data.brandName,
        Tier: data.tier,
        Email: data.email,
        Password: defaultPassword
      });
    }

    console.log('\n✅ Successfully mapped all 15 tasks to their specific Constitution advertisers.');
    console.log('\n--- CREDENTIALS LIST ---');
    console.table(credentialsList);

  } catch (err: any) {
    console.error('❌ Migration error:', err.message);
    throw err;
  } finally {
    await connection.end();
  }
}

seedAdvertisers().catch(e => {
  console.error(e);
  process.exit(1);
});
