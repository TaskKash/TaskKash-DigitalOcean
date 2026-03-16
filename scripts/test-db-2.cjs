const mysql = require('mysql2/promise');

async function test() {
  const conn = await mysql.createConnection('mysql://taskkash_user:taskkash_secure_2024@localhost:3306/taskkash');
  
  const [profileStats] = await conn.query('SELECT COUNT(*) as count FROM userProfiles');
  console.log("Total User Profiles:", profileStats[0].count);

  const [householdStats] = await conn.query('SELECT householdSize, COUNT(*) as count FROM userProfiles GROUP BY householdSize');
  console.log("Household Size Distribution:", householdStats);

  const [testEgyptOnly] = await conn.query(`
    SELECT COUNT(DISTINCT u.id) as count
    FROM users u
    WHERE u.kycStatus = 'verified' AND u.profileStrength >= 60 AND u.age >= 18 AND u.age <= 65
    AND u.countryId IN (SELECT id FROM countries WHERE nameEn IN ('Egypt'))
  `);
  console.log("Match strictly Egypt (No profiles join):", testEgyptOnly[0].count);

  conn.end();
}
test();
