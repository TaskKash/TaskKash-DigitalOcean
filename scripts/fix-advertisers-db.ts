import { query } from '../server/_core/mysql-db';

async function fixAll() {
  // 1. Make countryId properly nullable
  await query('ALTER TABLE advertisers MODIFY COLUMN countryId INT NULL DEFAULT NULL');
  console.log('✓ countryId is now nullable');

  // 2. Delete the test Nokia-EGY entry created by the test script so the user can register
  const result = await query("DELETE FROM advertisers WHERE email = 'nokia@gmail.com'") as any;
  console.log('✓ Cleaned up test advertiser, rows deleted:', result.affectedRows);
}

fixAll().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
