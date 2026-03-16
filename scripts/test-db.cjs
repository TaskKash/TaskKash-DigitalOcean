const mysql = require('mysql2/promise');

async function test() {
  const conn = await mysql.createConnection('mysql://taskkash_user:taskkash_secure_2024@localhost:3306/taskkash');
  console.log("Connected!");
  const [countries] = await conn.query('SELECT id, code, nameEn FROM countries');
  console.log("Countries:", countries);
  
  const [users] = await conn.query('SELECT COUNT(*) as count FROM users');
  console.log("Total Users:", users[0].count);
  
  const [verifiedUsers] = await conn.query('SELECT COUNT(*) as count FROM users WHERE kycStatus = "verified"');
  console.log("Verified Users:", verifiedUsers[0].count);

  const [filtered] = await conn.query(`
    SELECT COUNT(DISTINCT u.id) as count
    FROM users u
    LEFT JOIN userProfiles up ON u.id = up.userId
    WHERE u.kycStatus = 'verified' AND u.profileStrength >= 60 AND u.age >= 18 AND u.age <= 65
    AND u.countryId IN (SELECT id FROM countries WHERE nameEn IN ('Egypt'))
    AND up.householdSize >= 1 AND up.householdSize <= 10 AND u.profileStrength >= 60
  `);
  console.log("Match default filters:", filtered[0].count);

  const [withoutCountry] = await conn.query(`
    SELECT COUNT(DISTINCT u.id) as count
    FROM users u
    LEFT JOIN userProfiles up ON u.id = up.userId
    WHERE u.kycStatus = 'verified' AND u.profileStrength >= 60 AND u.age >= 18 AND u.age <= 65
  `);
  console.log("Match WITHOUT country/household filters:", withoutCountry[0].count);

  conn.end();
}
test();
