import 'dotenv/config';
import mysql from 'mysql2/promise';

async function run() {
  const pool = mysql.createPool(process.env.DATABASE_URL);
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE role = "advertiser" LIMIT 1');
    console.log("Advertiser user:", rows[0]);
  } catch (e) {
    console.error("SQL Error Caught:", e.message);
  }
  process.exit(0);
}
run();
