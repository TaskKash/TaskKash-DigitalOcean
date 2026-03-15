import { getDb, closeDatabasePool } from '../server/db';
import { sql } from 'drizzle-orm';
import { config } from 'dotenv';
config();

async function queryCounts() {
  try {
    const db = await getDb();
    if (!db) {
       console.error("DB connection null");
       process.exit(1);
    }
    const [tables] = await db.execute(sql`SHOW TABLES`);
    console.log("Tables available:", tables);
    
    // According to schema, the table names are users, userProfiles, userconsents, user_kyc_vault
    const res = await db.execute(sql`
      SELECT 'users' AS tbl, COUNT(*) AS cnt FROM users
      UNION ALL
      SELECT 'userProfiles', COUNT(*) FROM userProfiles
      UNION ALL
      SELECT 'userconsents', COUNT(*) FROM userconsents
      UNION ALL
      SELECT 'user_kyc_vault', COUNT(*) FROM user_kyc_vault
    `);
    console.log("--- DB COUNTS ---");
    console.log(JSON.stringify(res[0], null, 2));
    console.log("-----------------");
    await closeDatabasePool();
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

queryCounts();
