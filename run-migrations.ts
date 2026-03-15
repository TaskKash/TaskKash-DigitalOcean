import db from './server/_core/mysql-db.js';

async function run() {
  // Migration 2: add pendingDeletion + deletionRequestedAt to users (without IF NOT EXISTS for MySQL 5.7 compat)
  let m2a = false, m2b = false;
  try {
    await db.query('ALTER TABLE users ADD COLUMN pendingDeletion TINYINT(1) NOT NULL DEFAULT 0');
    m2a = true;
  } catch (e: any) {
    if (e.code === 'ER_DUP_FIELDNAME') { m2a = true; console.log('pendingDeletion already exists, skipping.'); }
    else throw e;
  }
  try {
    await db.query('ALTER TABLE users ADD COLUMN deletionRequestedAt TIMESTAMP NULL DEFAULT NULL');
    m2b = true;
  } catch (e: any) {
    if (e.code === 'ER_DUP_FIELDNAME') { m2b = true; console.log('deletionRequestedAt already exists, skipping.'); }
    else throw e;
  }
  if (m2a && m2b) console.log('Migration 2 OK: users.pendingDeletion and users.deletionRequestedAt are in place');
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
