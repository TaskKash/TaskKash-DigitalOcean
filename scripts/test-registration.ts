import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

dotenv.config();

async function testRegistration() {
  const dbUrl = process.env.DATABASE_URL;
  const connection = await mysql.createConnection(dbUrl!);
  
  try {
    const email = "test_script_registration@taskkash.com";
    const password = "password123";
    const name = "Test Script User";
    const hashedPassword = await bcrypt.hash(password, 10);
    const openId = `user_${nanoid()}`;
    const phone = "01001234599";
    const countryId = 1;

    console.log("Attempting to insert user...");
    const [result] = await connection.execute(
      `INSERT INTO users (openId, name, email, password, phone, countryId, role, balance, tier, isVerified, profileStrength, completedTasks, totalEarnings, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [openId, name, email, hashedPassword, phone, countryId, 'user', 0, 'bronze', 0, 0, 0, 0]
    );

    console.log("Success!", result);
  } catch (err: any) {
    console.error("❌ SQL ERROR:");
    console.error(err.message);
    if (err.sql) console.error("SQL:", err.sql);
  } finally {
    await connection.end();
  }
}

testRegistration().catch(console.error);
