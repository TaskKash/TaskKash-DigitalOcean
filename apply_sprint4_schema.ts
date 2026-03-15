import db from './server/_core/mysql-db.js';

async function verifyAndMigrate() {
  try {
    console.log("Adding tierRank generated column...");
    try {
      await db.query(`
        ALTER TABLE \`users\` 
        ADD COLUMN \`tierRank\` INT GENERATED ALWAYS AS (
          CASE 
            WHEN tier = 'platinum' THEN 4 
            WHEN tier = 'gold' THEN 3 
            WHEN tier = 'silver' THEN 2 
            ELSE 1 
          END
        ) STORED;
      `);
      console.log("Successfully added tierRank column!");
    } catch(e: any) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log("Column tierRank already exists, skipping.");
      } else {
        throw e;
      }
    }
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await db.closePool();
  }
}

verifyAndMigrate();
