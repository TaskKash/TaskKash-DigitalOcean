import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const connectionUrl = process.env.DATABASE_URL;
  if (!connectionUrl) {
    console.error('No DATABASE_URL found.');
    process.exit(1);
  }
  
  try {
    const conn = await mysql.createConnection(connectionUrl);
    
    // Test the exact insert from auth-routes
    const query = `INSERT INTO users (openId, name, email, password, phone, role, balance, tier, isVerified, profileStrength, completedTasks, totalEarnings, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    
    console.log("Running query...");
    const [result] = await conn.execute(query, [
      'user_test123',
      'Test User',
      'test_registration_error@gmail.com',
      'hashed_password',
      '123456789',
      'user',
      0,
      'bronze',
      0,
      0,
      0,
      0
    ]);
    
    console.log('Result:', result);
    await conn.end();
  } catch (err) {
    console.error('DB Error:', err);
  }
  process.exit(0);
}
run();
