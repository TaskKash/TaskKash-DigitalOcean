import 'dotenv/config';
import mysql from 'mysql2/promise';

async function run() {
  const pool = await mysql.createPool(process.env.DATABASE_URL!);

  // Create table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS exchange_rates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      currencyCode VARCHAR(3) NOT NULL UNIQUE,
      currencyName VARCHAR(50) NOT NULL,
      currencyNameAr VARCHAR(50) NOT NULL DEFAULT '',
      currencySymbol VARCHAR(10) NOT NULL DEFAULT '',
      rateToUsd DECIMAL(12,6) NOT NULL,
      rateFromUsd DECIMAL(12,6) NOT NULL,
      isActive TINYINT DEFAULT 1,
      updatedBy INT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Table created');

  // Seed data
  const currencies = [
    ['USD', 'US Dollar', 'دولار أمريكي', '$', 1, 1],
    ['EGP', 'Egyptian Pound', 'جنيه مصري', 'ج.م', 0.032258, 31],
    ['SAR', 'Saudi Riyal', 'ريال سعودي', 'ر.س', 0.266667, 3.75],
    ['AED', 'UAE Dirham', 'درهم إماراتي', 'د.إ', 0.272294, 3.6725],
    ['KWD', 'Kuwaiti Dinar', 'دينار كويتي', 'د.ك', 3.25, 0.307692],
    ['QAR', 'Qatari Riyal', 'ريال قطري', 'ر.ق', 0.274725, 3.64],
  ];

  for (const [code, name, nameAr, symbol, toUsd, fromUsd] of currencies) {
    try {
      await pool.execute(
        `INSERT INTO exchange_rates (currencyCode, currencyName, currencyNameAr, currencySymbol, rateToUsd, rateFromUsd) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE currencyCode=currencyCode`,
        [code, name, nameAr, symbol, toUsd, fromUsd]
      );
      console.log(`Seeded: ${code}`);
    } catch (e: any) {
      console.log(`Skip ${code}:`, e.message);
    }
  }

  const [rows] = await pool.execute('SELECT currencyCode, currencySymbol, rateFromUsd FROM exchange_rates ORDER BY currencyCode');
  console.table(rows);

  await pool.end();
  console.log('Migration complete!');
}

run().catch(console.error);
