const mysql = require('mysql2/promise');

async function test() {
  const conn = await mysql.createConnection('mysql://taskkash_user:taskkash_secure_2024@localhost:3306/taskkash');

  const [countryDist] = await conn.query(`
    SELECT c.nameEn as country, COUNT(*) as verified_count
    FROM users u
    JOIN countries c ON u.countryId = c.id
    WHERE u.kycStatus = 'verified' AND u.profileStrength >= 60
    GROUP BY c.nameEn
  `);
  console.log("Verified User Distribution By Country:", countryDist);

  conn.end();
}
test();
