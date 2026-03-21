import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  console.log("Connecting to:", process.env.DATABASE_URL);
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_payment_methods (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        name VARCHAR(100) NOT NULL,
        accountNumber VARCHAR(255) NOT NULL,
        isDefault BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("Created user_payment_methods table");
  } catch(e: any) { console.log(e.message); }

  await connection.end();
}

run();
