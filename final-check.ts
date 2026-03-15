import db from './server/_core/mysql-db.js';

async function run() {
  const sql = `
    SELECT 'users' AS tbl, COUNT(*) AS cnt FROM users
    UNION ALL
    SELECT 'user_profile', COUNT(*) FROM userprofiles
    UNION ALL
    SELECT 'user_consents', COUNT(*) FROM userconsents
    UNION ALL
    SELECT 'user_kyc_vault', COUNT(*) FROM user_kyc_vault;
  `;
  try {
    const res = await db.query(sql);
    console.table(res);
  } catch (e) {
    console.error(e.message);
  }
  process.exit(0);
}
run();
