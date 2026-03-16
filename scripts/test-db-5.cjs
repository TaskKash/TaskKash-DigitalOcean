const mysql = require('mysql2/promise');

async function test() {
  const conn = await mysql.createConnection('mysql://taskkash_user:taskkash_secure_2024@localhost:3306/taskkash');

  const [cols] = await conn.query('SHOW COLUMNS FROM users');
  console.log("User Columns:");
  cols.forEach(c => console.log(c.Field, c.Type));

  const [sample] = await conn.query('SELECT * FROM users LIMIT 5');
  console.log("Sample Data:");
  console.log(sample);

  conn.end();
}
test();
