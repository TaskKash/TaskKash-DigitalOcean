import 'dotenv/config';
import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Helper: add column only if it doesn't exist
async function addColumnIfMissing(table, column, definition) {
  const [rows] = await conn.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  if (rows.length > 0) {
    console.log(`⚠️  Column '${column}' already exists on '${table}' — skipped.`);
    return;
  }
  await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
  console.log(`✅ Added column '${column}' to '${table}'.`);
}

console.log('Adding KYC and device columns to users table...\n');

await addColumnIfMissing('users', 'kycStatus',            "enum('pending','submitted','verified','rejected') NOT NULL DEFAULT 'pending'");
await addColumnIfMissing('users', 'kycVerifiedAt',        "timestamp NULL");
await addColumnIfMissing('users', 'kycProvider',          "varchar(50) NULL");
await addColumnIfMissing('users', 'kycRejectionReason',   "varchar(255) NULL");
await addColumnIfMissing('users', 'deviceTierLastUpdated',"timestamp NULL");

console.log('\nVerification:');
const [cols] = await conn.query(
  `SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' 
   AND COLUMN_NAME IN ('kycStatus','kycVerifiedAt','kycProvider','kycRejectionReason','deviceTierLastUpdated')`
);
cols.forEach(c => console.log(`  ✅ users.${c.COLUMN_NAME} [${c.COLUMN_TYPE}]`));

await conn.end();
console.log('\nDone!');
