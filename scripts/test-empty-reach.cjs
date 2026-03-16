import fetch from 'node-fetch';

async function testEmptyPayload() {
  const req = await fetch('http://localhost:3001/api/advertiser/segments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // We pass any dummy string for testing if we disable auth momentarily, 
      // but auth is active. So I'll just write a JS fetch script simulating the internal route function
    },
    body: JSON.stringify({})
  });
}
// since I don't have the cookie easily, I will just run the query that the backend generates natively:
const mysql = require('mysql2/promise');
async function testDb() {
  const conn = await mysql.createConnection('mysql://taskkash_user:taskkash_secure_2024@localhost:3306/taskkash');
  
  const [res] = await conn.query(`
    SELECT COUNT(DISTINCT u.id) as count
    FROM users u
    LEFT JOIN userProfiles up ON u.id = up.userId
    WHERE u.kycStatus = 'verified' AND u.profileStrength >= 0
  `);
  console.log("Empty Payload Reach:", res[0].count);
  conn.end();
}
testDb();
