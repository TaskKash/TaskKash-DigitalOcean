import 'dotenv/config';
import db from '../server/_core/mysql-db.js';
async function run() {
  const maxDbQuery = await db.query('SELECT COUNT(DISTINCT id) as cnt FROM users');
  const DB_USER_COUNT = maxDbQuery[0]?.cnt || 1;
  const TARGET_DB_COUNT = 100000;
  const scaleFactor = TARGET_DB_COUNT / DB_USER_COUNT;
  console.log({DB_USER_COUNT, scaleFactor});
  
  const r = await db.query("SELECT COUNT(DISTINCT id) as rawCount FROM users WHERE tier = 'gold'");
  const rawCount = r[0].rawCount;
  const scaledRawCount = Math.floor(rawCount * scaleFactor);
  console.log({rawCount, scaledRawCount});
  process.exit(0);
}
run();
