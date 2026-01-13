import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

// All advertisers from mock data
const advertisers = [
  {
    nameEn: 'Jumia Egypt',
    nameAr: 'جوميا مصر',
    email: 'mohamed@jumia.com.eg',
    slug: 'jumia-egypt',
    password: 'jumia123'
  },
  {
    nameEn: 'Vodafone Egypt',
    nameAr: 'فودافون مصر',
    email: 'sara@vodafone.com.eg',
    slug: 'vodafone-egypt',
    password: 'vodafone123'
  },
  {
    nameEn: 'Noon Egypt',
    nameAr: 'نون مصر',
    email: 'khaled@noon.com',
    slug: 'noon-egypt',
    password: 'noon123'
  },
  {
    nameEn: 'Uber Egypt',
    nameAr: 'أوبر مصر',
    email: 'contact@uber.com.eg',
    slug: 'uber-egypt',
    password: 'uber123'
  },
  {
    nameEn: 'Orange Egypt',
    nameAr: 'أورنج مصر',
    email: 'contact@orange.com.eg',
    slug: 'orange-egypt',
    password: 'orange123'
  },
  {
    nameEn: 'Etisalat Egypt',
    nameAr: 'اتصالات مصر',
    email: 'contact@etisalat.com.eg',
    slug: 'etisalat-egypt',
    password: 'etisalat123'
  },
  {
    nameEn: 'Careem Egypt',
    nameAr: 'كريم مصر',
    email: 'contact@careem.com',
    slug: 'careem-egypt',
    password: 'careem123'
  },
  {
    nameEn: 'Amazon Egypt',
    nameAr: 'أمازون مصر',
    email: 'contact@amazon.eg',
    slug: 'amazon-egypt',
    password: 'amazon123'
  },
  {
    nameEn: 'Souq Egypt',
    nameAr: 'سوق مصر',
    email: 'contact@souq.com',
    slug: 'souq-egypt',
    password: 'souq123'
  },
  {
    nameEn: 'Talabat Egypt',
    nameAr: 'طلبات مصر',
    email: 'contact@talabat.com',
    slug: 'talabat-egypt',
    password: 'talabat123'
  },
  {
    nameEn: 'Swvl Egypt',
    nameAr: 'سويفل مصر',
    email: 'contact@swvl.com',
    slug: 'swvl-egypt',
    password: 'swvl123'
  },
  {
    nameEn: 'Fawry Egypt',
    nameAr: 'فوري مصر',
    email: 'contact@fawry.com',
    slug: 'fawry-egypt',
    password: 'fawry123'
  },
  {
    nameEn: 'Instapay Egypt',
    nameAr: 'إنستاباي مصر',
    email: 'contact@instapay.com.eg',
    slug: 'instapay-egypt',
    password: 'instapay123'
  },
  {
    nameEn: 'Banque Misr',
    nameAr: 'بنك مصر',
    email: 'contact@banquemisr.com',
    slug: 'banque-misr',
    password: 'banquemisr123'
  },
  {
    nameEn: 'CIB Egypt',
    nameAr: 'البنك التجاري الدولي',
    email: 'contact@cibeg.com',
    slug: 'cib-egypt',
    password: 'cib123'
  }
];

async function migrateAdvertisers() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(process.env.DATABASE_URL);
    
    console.log('Starting migration...');
    let inserted = 0;
    let skipped = 0;
    
    for (const advertiser of advertisers) {
      try {
        // Check if advertiser already exists
        const [existing] = await connection.execute(
          'SELECT id FROM advertisers WHERE email = ? OR slug = ?',
          [advertiser.email, advertiser.slug]
        );
        
        if (existing.length > 0) {
          console.log(`⏭️  Skipped: ${advertiser.nameEn} (already exists)`);
          skipped++;
          continue;
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(advertiser.password, 10);
        
        // Insert advertiser
        await connection.execute(
          `INSERT INTO advertisers (email, password, nameEn, nameAr, slug, isActive, countryId, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            advertiser.email,
            hashedPassword,
            advertiser.nameEn,
            advertiser.nameAr,
            advertiser.slug,
            1, // isActive
            1  // countryId (Egypt)
          ]
        );
        
        console.log(`✅ Inserted: ${advertiser.nameEn}`);
        inserted++;
        
      } catch (error) {
        console.error(`❌ Error inserting ${advertiser.nameEn}:`, error.message);
      }
    }
    
    console.log('\n=== Migration Complete ===');
    console.log(`✅ Inserted: ${inserted}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`📊 Total: ${advertisers.length}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed.');
    }
  }
}

migrateAdvertisers();
