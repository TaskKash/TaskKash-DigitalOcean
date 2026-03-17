import 'dotenv/config';
import db from '../server/_core/mysql-db.js';
async function run() {
  await db.query("DELETE FROM tasks WHERE type = 'video'");
  console.log('Deleted all video tasks');
  await db.closePool();
  process.exit(0);
}
run();
