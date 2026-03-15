import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import db from '../server/_core/mysql-db.js';

const BATCH_SIZE = 500;

// Helper to convert CSV empty strings to null
function cleanRow(row: any) {
  const cleaned: any = {};
  for (const key of Object.keys(row)) {
    let val = row[key];
    if (val === '') {
      cleaned[key] = null;
    } else {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

// Custom map needed for specific tables to ensure correct type formatting
function mapRow(tableName: string, row: any) {
  const cleaned = cleanRow(row);
  
  // All tables match schema exactly, so we mostly just pass through.
  // The only special handling is ensuring JSON columns are valid JSON strings if they are parsed oddly,
  // but since they are stored as JSON strings in the CSV (e.g. '["a", "b"]'), they can be inserted directly.

  return cleaned;
}

async function insertBatch(tableName: string, rows: any[]) {
  if (!rows || rows.length === 0) return;
  const keys = Object.keys(rows[0]);
  
  const placeholders = keys.map(() => '?').join(', ');
  const rowPlaceholders = `(${placeholders})`;
  const allPlaceholders = rows.map(() => rowPlaceholders).join(', ');
  
  const flatValues = rows.flatMap(r => keys.map(k => r[k]));
  
  const bulkQuery = `INSERT IGNORE INTO \`${tableName}\` (${keys.map(k => '\`'+k+'\`').join(', ')}) VALUES ${allPlaceholders}`;
  await db.query(bulkQuery, flatValues);
}

async function processCsv(filePath: string, tableName: string) {
  console.log(`\n=== Starting Import: ${tableName} ===`);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  return new Promise((resolve, reject) => {
    let batch: any[] = [];
    let count = 0;
    let errors = 0;

    const stream = fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', async (row) => {
        const mapped = mapRow(tableName, row);
        if (mapped) {
          batch.push(mapped);
          if (batch.length >= BATCH_SIZE) {
            stream.pause();
            const currentBatch = [...batch];
            batch = [];
            
            insertBatch(tableName, currentBatch)
              .then(() => {
                count += currentBatch.length;
                if (count % 10000 === 0) console.log(`[...] Inserted ${count} rows into ${tableName}`);
                stream.resume();
              })
              .catch((err) => {
                errors++;
                console.error(`Error inserting batch into ${tableName}:`, err.message);
                stream.resume(); // Continue even if batch fails
              });
          }
        }
      })
      .on('end', async () => {
        if (batch.length > 0) {
          try {
            await insertBatch(tableName, batch);
            count += batch.length;
          } catch (err: any) {
            errors++;
            console.error(`Error inserting final batch into ${tableName}:`, err.message);
          }
        }
        console.log(`=== Finished ${tableName} ==-`);
        console.log(`Total inserted: ${count}`);
        console.log(`Batch errors: ${errors}\n`);
        resolve(true);
      })
      .on('error', reject);
  });
}

async function main() {
  const DATA_DIR = path.resolve(process.cwd(), 'MockData');
  
  // The load order is critical due to Foreign Key constraints:
  // users (root) -> user_kyc_vault (depends on users) -> userProfiles (depends on users) -> userConsents (depends on users)
  
  try {
    const startTime = Date.now();
    
    // await processCsv(path.join(DATA_DIR, 'taskkash_users.csv'), 'users');
    // await processCsv(path.join(DATA_DIR, 'taskkash_user_kyc_vault.csv'), 'user_kyc_vault');
    // await processCsv(path.join(DATA_DIR, 'taskkash_user_profile.csv'), 'userProfiles');
    await processCsv(path.join(DATA_DIR, 'taskkash_user_consents.csv'), 'userConsents');
    
    const minutes = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
    console.log(`\n>>> Full Mock Data Seeding Complete in ${minutes} minutes <<<`);
    
  } catch (err) {
    console.error("Fatal error during seeding:", err);
  } finally {
    // Graceful shutdown of MySQL pool
    await db.closePool();
    process.exit(0);
  }
}

main();
