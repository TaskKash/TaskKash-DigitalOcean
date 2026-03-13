import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const connectionUrl = process.env.DATABASE_URL;
  if (!connectionUrl) {
    console.error('No DATABASE_URL found.');
    process.exit(1);
  }
  
  try {
    const conn = await mysql.createConnection(connectionUrl);
    const [rows] = await conn.execute('SELECT id, email, password FROM users LIMIT 10');
    console.log('--- USERS IN DB ---');
    console.log(rows);
    await conn.end();
  } catch (err) {
    console.error('DB Error:', err);
  }
  process.exit(0);
}
run();
