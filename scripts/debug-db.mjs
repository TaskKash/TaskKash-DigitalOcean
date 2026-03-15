import 'dotenv/config';
import mysql from 'mysql2/promise';

const url = process.env.DATABASE_URL;
console.log('DATABASE_URL (masked):', url ? url.replace(/:[^@]*@/, ':***@') : 'NOT SET');

const conn = await mysql.createConnection(url);

// Show current database
const [dbRows] = await conn.query('SELECT DATABASE() as db');
console.log('Connected to database:', dbRows[0].db);

// Show all tables
const [tables] = await conn.query('SHOW TABLES');
console.log('\nAll tables in DB:');
tables.forEach(t => console.log(' -', Object.values(t)[0]));

// Check migrations journal
const [migs] = await conn.query('SELECT hash, created_at FROM __drizzle_migrations ORDER BY created_at');
console.log('\nMigrations recorded in DB:', migs.length);
migs.forEach(m => console.log(' -', m.hash.substring(0, 12) + '...'));

await conn.end();
