import db from './server/_core/mysql-db.js';

async function migrate() {
  try {
    console.log("Applying Profile Extensions Migration...");
    // We wrap in try block for idempotency
    try {
      await db.query("ALTER TABLE `users` ADD COLUMN `district` varchar(100);");
      console.log("Added district to users");
    } catch (e: any) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log("Column district already exists, skipping");
      } else {
        throw e;
      }
    }

    try {
      await db.query("ALTER TABLE `userProfiles` ADD COLUMN `vehicleModel` varchar(100);");
      console.log("Added vehicleModel to userProfiles");
    } catch (e: any) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log("Column vehicleModel already exists, skipping");
      } else {
        throw e;
      }
    }

    console.log("Applying KYC Vault Migration...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`user_kyc_vault\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`userId\` int NOT NULL,
        \`idNumber\` varchar(100) NOT NULL,
        \`dateOfBirth\` timestamp,
        \`fullAddress\` text,
        \`livenessToken\` varchar(255),
        \`createdAt\` timestamp NOT NULL DEFAULT (now()),
        CONSTRAINT \`user_kyc_vault_id\` PRIMARY KEY(\`id\`),
        CONSTRAINT \`user_kyc_vault_userId_unique\` UNIQUE(\`userId\`),
        CONSTRAINT \`user_kyc_vault_userId_users_id_fk\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`) ON DELETE restrict ON UPDATE no action
      );
    `);
    console.log("user_kyc_vault table created successfully with RESTRICT FK");

  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await db.closePool();
  }
}

migrate();
