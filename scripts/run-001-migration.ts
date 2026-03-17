import 'dotenv/config';
import mysql from 'mysql2/promise';

async function run() {
  const pool = await mysql.createPool(process.env.DATABASE_URL!);

  console.log('Running migration 001_advertiser_tiers_escrow...');

  // 1. Add 'tier' to advertisers
  try {
    await pool.execute(`
      ALTER TABLE advertisers 
      ADD COLUMN tier ENUM('basic', 'pro', 'premium', 'enterprise') DEFAULT 'basic' NOT NULL
    `);
    console.log('Added tier column to advertisers');
  } catch (error: any) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('tier column already exists');
    } else {
      console.error('Error adding tier column:', error.message);
    }
  }

  // 2. Add 'totalSpend' to advertisers
  try {
    await pool.execute(`
      ALTER TABLE advertisers 
      ADD COLUMN totalSpend INT UNSIGNED DEFAULT 0 NOT NULL
    `);
    console.log('Added totalSpend column to advertisers');
  } catch (error: any) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('totalSpend column already exists');
    } else {
      console.error('Error adding totalSpend column:', error.message);
    }
  }

  // 3. Create escrow_ledger table
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS escrow_ledger (
        id INT AUTO_INCREMENT PRIMARY KEY,
        advertiserId INT NOT NULL,
        campaignId INT,
        taskId INT,
        amount INT NOT NULL,
        currency VARCHAR(3) NOT NULL,
        status ENUM('held', 'released', 'refunded') DEFAULT 'held' NOT NULL,
        reason VARCHAR(255),
        releaseDate DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (advertiserId) REFERENCES advertisers(id) ON DELETE CASCADE
      )
    `);
    console.log('Created escrow_ledger table');
  } catch (error: any) {
    console.error('Error creating escrow_ledger table:', error.message);
  }

  await pool.end();
  console.log('Migration complete!');
}

run().catch(console.error);
