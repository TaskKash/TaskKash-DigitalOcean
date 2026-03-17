import 'dotenv/config';
import db from '../server/_core/mysql-db.js';
async function run() {
  const q1 = await db.query("SELECT COUNT(*) as count FROM users WHERE kycStatus = 'verified'");
  console.log("Verified users:", q1[0].count);
  const q2 = await db.query("SELECT COUNT(*) as count FROM users WHERE kycStatus = 'verified' AND tier = 'gold'");
  console.log("Verified GOLD users:", q2[0].count);
  await db.closePool();
  process.exit(0);
}
run();
