import 'dotenv/config';
import { getDb } from './server/db';
import { sql } from 'drizzle-orm';

async function migrate() {
  const db = await getDb();
  if (!db) throw new Error('DB not connected');

  try {
    console.log('Adding isPhoneVerified column...');
    await db.execute(sql`ALTER TABLE users ADD COLUMN isPhoneVerified INT DEFAULT 0;`);
    console.log('Column added.');
  } catch (err: any) {
    if (err.message.includes('Duplicate column name')) {
      console.log('Column isPhoneVerified already exists.');
    } else {
      console.error('Error adding column:', err);
    }
  }

  try {
    console.log('Updating tier ENUM values...');
    // Setting default to 'vip' and extending enum values
    await db.execute(sql`ALTER TABLE users MODIFY COLUMN tier ENUM('vip', 'prestige', 'elite', 'novice', 'contributor', 'bronze', 'silver', 'gold', 'platinum') NOT NULL DEFAULT 'vip';`);
    
    console.log('Updating existing users to vip...');
    await db.execute(sql`UPDATE users SET tier = 'vip' WHERE tier IN ('novice', 'bronze');`);
    
    console.log('Updating existing users to prestige...');
    await db.execute(sql`UPDATE users SET tier = 'prestige' WHERE tier IN ('contributor', 'silver');`);
    
    console.log('Updating existing users to elite...');
    await db.execute(sql`UPDATE users SET tier = 'elite' WHERE tier IN ('gold', 'platinum');`);

    console.log('Restricting ENUM to final values...');
    await db.execute(sql`ALTER TABLE users MODIFY COLUMN tier ENUM('vip', 'prestige', 'elite') NOT NULL DEFAULT 'vip';`);
    
    console.log('Tier migration complete!');
  } catch (err) {
    console.error('Error migrating tiers:', err);
  }
  process.exit(0);
}

migrate();
