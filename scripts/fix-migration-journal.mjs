import 'dotenv/config';
import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Insert the hash for 0004_slow_old_lace so drizzle-kit won't try to run it again.
// This migration was manually applied to the DB but never recorded in __drizzle_migrations.
const HASH_0004 = 'ffda3a046495b1793e5d506d2b465378554077a4e10e85926069f63cc064b378';

const [current] = await conn.query('SELECT hash FROM __drizzle_migrations WHERE hash = ?', [HASH_0004]);
if (current.length > 0) {
  console.log('Migration 0004 already recorded — no action needed.');
} else {
  await conn.query(
    'INSERT INTO `__drizzle_migrations` (hash, created_at) VALUES (?, ?)',
    [HASH_0004, Date.now()]
  );
  console.log('Inserted 0004 hash into __drizzle_migrations successfully.');
}

const [rows] = await conn.query('SELECT hash FROM __drizzle_migrations ORDER BY created_at');
console.log('All recorded migrations:', rows.map(r => r.hash));

await conn.end();
