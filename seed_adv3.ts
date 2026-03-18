import 'dotenv/config';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function run() {
  const pool = mysql.createPool(process.env.DATABASE_URL);
  try {
    const email = 'ahmed.job@gmail.com';
    const pwd = '12341234';
    const company = 'Nokia-EG';
    const hash = await bcrypt.hash(pwd, 10);
    
    // Check if advertiser exists
    const [existing] = await pool.query('SELECT id FROM advertisers WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.log('Advertiser already exists. Updating password...');
      await pool.query('UPDATE advertisers SET password = ? WHERE email = ?', [hash, email]);
      console.log('Advertiser updated.');
    } else {
      console.log('Inserting new Nokia advertiser...');
      const openId = `adv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const slug = `nokia-eg-${Math.random().toString(36).substr(2, 6)}`;
      await pool.query(
        'INSERT INTO advertisers (openId, email, password, nameEn, nameAr, slug, tier, isActive, balance, totalSpent, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, "basic", 1, 0, 0, NOW(), NOW())',
        [openId, email, hash, company, company, slug]
      );
      
      const [adv] = await pool.query('SELECT id FROM advertisers WHERE email = ?', [email]);
      console.log('Advertiser inserted successfully. ID:', adv[0].id);
    }
  } catch (e) {
    console.error('SQL Error Caught:', e.message);
  }
  process.exit(0);
}
run();
