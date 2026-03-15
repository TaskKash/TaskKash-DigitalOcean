import 'dotenv/config';
import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Verify the three Sprint additions
const checks = {
  'userConsents table': `SHOW TABLES LIKE 'userConsents'`,
  'userProfiles table': `SHOW TABLES LIKE 'userProfiles'`,
};

for (const [label, query] of Object.entries(checks)) {
  const [rows] = await conn.query(query);
  console.log(`${label}: ${rows.length > 0 ? '✅ EXISTS' : '❌ MISSING'}`);
}

// Check KYC columns on users table
const [cols] = await conn.query(`SHOW COLUMNS FROM \`users\` WHERE Field IN ('kycStatus', 'kycVerifiedAt', 'kycProvider', 'kycRejectionReason', 'deviceTierLastUpdated')`);
console.log(`\nKYC columns on users table (expecting 5):`);
for (const col of cols) {
  console.log(`  ✅ ${col.Field} [${col.Type}]`);
}
if (cols.length < 5) {
  const found = cols.map(c => c.Field);
  const expected = ['kycStatus', 'kycVerifiedAt', 'kycProvider', 'kycRejectionReason', 'deviceTierLastUpdated'];
  const missing = expected.filter(e => !found.includes(e));
  console.log(`  ❌ MISSING: ${missing.join(', ')}`);
}

await conn.end();
