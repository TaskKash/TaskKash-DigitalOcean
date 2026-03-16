import { query } from '../server/_core/mysql-db';

async function migrate() {
  // Make countryId nullable so advertiser registration doesn't require it
  await query('ALTER TABLE advertisers MODIFY COLUMN countryId INT NULL DEFAULT NULL');
  console.log('Migration complete: countryId is now nullable');
}

migrate().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
