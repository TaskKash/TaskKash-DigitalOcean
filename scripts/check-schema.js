import mysql from 'mysql2/promise';
import 'dotenv/config';

async function checkSchema() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  try {
    const [columns] = await connection.query("SHOW COLUMNS FROM advertisers");
    console.log(JSON.stringify(columns.map(c => c.Field), null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}
checkSchema();
