import * as dotenv from 'dotenv';
import * as mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const connection = await mysql.createConnection(dbUrl);
  console.log('Connected to database');

  const sqlPath = path.join(__dirname, '..', 'migrations', '003_reputation_disputes.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const stmt of statements) {
    try {
      console.log('Executing:', stmt.substring(0, 80) + '...');
      await connection.execute(stmt);
      console.log('  ✓ Success');
    } catch (err: any) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('  ⚠ Table already exists, skipping');
      } else {
        console.error('  ✗ Error:', err.message);
      }
    }
  }

  await connection.end();
  console.log('Migration 003 complete');
}

runMigration().catch(console.error);
