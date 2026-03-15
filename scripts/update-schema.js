import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

async function updateSchema() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    console.log('Adding missing columns...');
    try { await connection.query("ALTER TABLE advertisers ADD COLUMN openId VARCHAR(100)"); } catch (e) {}
    try { await connection.query("ALTER TABLE advertisers ADD COLUMN email VARCHAR(255)"); } catch (e) {}
    try { await connection.query("ALTER TABLE advertisers ADD COLUMN password VARCHAR(255)"); } catch (e) {}
    
    console.log('Columns added successfully');
    
    // Update samsung-egypt with credentials
    const hashedPassword = await bcrypt.hash('Samsung@Egypt2026!', 10);
    const [result] = await connection.execute(
      "UPDATE advertisers SET email = ?, password = ?, openId = ? WHERE slug = ?",
      ['samsung.egypt@samsung.com', hashedPassword, 'adv_samsung_egypt', 'samsung-egypt']
    );
    
    console.log(`Samsung Egypt updated: ${result.affectedRows} row(s)`);
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

updateSchema();
