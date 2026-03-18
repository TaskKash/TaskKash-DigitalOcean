import 'dotenv/config';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function run() {
  const pool = mysql.createPool(process.env.DATABASE_URL);
  try {
    const email = 'ahmed.job@gmail.com';
    const pwd = '12341234';
    const hash = await bcrypt.hash(pwd, 10);
    
    // Check if user exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.log('User already exists. Updating password and role...');
      await pool.query('UPDATE users SET password = ?, role = "advertiser", isVerified = 1 WHERE email = ?', [hash, email]);
      console.log('User updated.');
    } else {
      console.log('Inserting new advertiser user...');
      await pool.query(
        'INSERT INTO users (email, password, role, isVerified) VALUES (?, ?, "advertiser", 1)',
        [email, hash]
      );
      
      const [user] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      const userId = user[0].id;
      
      // Insert profile
      await pool.query('INSERT INTO userProfiles (userId) VALUES (?)', [userId]);
      console.log('Advertiser inserted successfully. ID:', userId);
    }
  } catch (e) {
    console.error('SQL Error Caught:', e.message);
  }
  process.exit(0);
}
run();
