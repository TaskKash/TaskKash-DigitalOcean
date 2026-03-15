import db from './server/_core/mysql-db.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  console.log("Environment Port Configuration:", process.env.PORT || "Not Specified (Defaulting typically to 3000 or 5000)");
  
  const sql = `
    SELECT 'users' AS tbl, COUNT(*) AS cnt FROM users
    UNION ALL
    SELECT 'user_profile', COUNT(*) FROM userProfiles
    UNION ALL
    SELECT 'user_consents', COUNT(*) FROM userConsents
    UNION ALL
    SELECT 'user_kyc_vault', COUNT(*) FROM userKycVault;
  `;
  try {
    const res = await db.query(sql);
    console.table(res);
  } catch (e) {
    console.error('Final SQL Error:', e.message);
  }
  process.exit(0);
}
run();
