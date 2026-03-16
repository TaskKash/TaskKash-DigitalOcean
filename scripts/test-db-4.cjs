const mysql = require('mysql2/promise');

async function test() {
  const conn = await mysql.createConnection('mysql://taskkash_user:taskkash_secure_2024@localhost:3306/taskkash');

  const [stats] = await conn.query(`
    SELECT 
      SUM(CASE WHEN countryId IS NULL THEN 1 ELSE 0 END) as null_countryId,
      SUM(CASE WHEN countryId = 1 THEN 1 ELSE 0 END) as egypt_countryId,
      SUM(CASE WHEN countryId > 1 THEN 1 ELSE 0 END) as other_countryId,
      SUM(CASE WHEN kycStatus = 'verified' THEN 1 ELSE 0 END) as verified_count,
      SUM(CASE WHEN profileStrength >= 60 THEN 1 ELSE 0 END) as high_strength
    FROM users
  `);
  console.log("User Stats:", stats[0]);

  conn.end();
}
test();
