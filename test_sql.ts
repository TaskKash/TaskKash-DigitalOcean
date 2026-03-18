import 'dotenv/config';
import mysql from 'mysql2/promise';

async function run() {
  const pool = mysql.createPool(process.env.DATABASE_URL);
  try {
    const brandSql = \
      SELECT 
        CASE 
          WHEN up.deviceModel LIKE 'Galaxy%' OR up.deviceModel LIKE 'Samsung%' THEN 'Samsung'
          WHEN up.deviceModel LIKE 'iPhone%' OR up.deviceModel LIKE 'iPad%' THEN 'Apple'
          WHEN up.deviceModel LIKE 'Xiaomi%' OR up.deviceModel LIKE 'Redmi%' OR up.deviceModel LIKE 'POCO%' THEN 'Xiaomi'
          WHEN up.deviceModel LIKE 'Huawei%' OR up.deviceModel LIKE 'Nova%' OR up.deviceModel LIKE 'Mate%' OR up.deviceModel LIKE 'Honor%' THEN 'Huawei'
          WHEN up.deviceModel LIKE 'Pixel%' THEN 'Google'
          WHEN up.deviceModel LIKE 'Oppo%' THEN 'Oppo'
          WHEN up.deviceModel LIKE 'Vivo%' THEN 'Vivo'
          WHEN up.deviceModel LIKE 'Realme%' THEN 'Realme'
          WHEN up.deviceModel LIKE 'Nokia%' THEN 'Nokia'
          WHEN up.deviceModel LIKE 'OnePlus%' THEN 'OnePlus'
          ELSE 'Other'
        END as brand,
        COUNT(DISTINCT u.id) as cnt
      FROM users u 
      LEFT JOIN userProfiles up ON u.id = up.userId
      WHERE 1=1 AND up.deviceModel IS NOT NULL AND up.deviceModel != ''
      GROUP BY brand
      HAVING brand != 'Other'
    \;
    const [rows] = await pool.query(brandSql);
    console.log("Success:", rows);
  } catch (e) {
    console.error("SQL Error:", e.message);
  }
  process.exit(0);
}
run();
