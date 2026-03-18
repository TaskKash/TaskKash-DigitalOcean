import 'dotenv/config';
import mysql from 'mysql2/promise';

async function run() {
  const pool = mysql.createPool(process.env.DATABASE_URL);
  try {
    const whereClause = "1=1";
    const scaleFactor = 1;
    let params: any[] = [];
    
    // Test Country Breakdown
    const countrySql = `
      SELECT c.code, COUNT(DISTINCT u.id) as cnt 
      FROM users u 
      LEFT JOIN userProfiles up ON u.id = up.userId 
      LEFT JOIN countries c ON u.countryId = c.id
      WHERE ${whereClause} AND c.code IS NOT NULL
      GROUP BY c.code
    `;
    await pool.query(countrySql, params);
    console.log("Country OK");

    // Test Industry query logic
    const indSql = `SELECT COUNT(DISTINCT u.id) as rawCount FROM users u LEFT JOIN userProfiles up ON u.id = up.userId WHERE up.industry IN ('Tech')`;
    await pool.query(indSql, params);
    console.log("Industry column OK");

    const jobSql = `SELECT COUNT(DISTINCT u.id) as rawCount FROM users u LEFT JOIN userProfiles up ON u.id = up.userId WHERE up.jobTitle IN ('Manager')`;
    await pool.query(jobSql, params);
    console.log("JobTitle column OK");

  } catch (e) {
    console.error("SQL Error Caught:", e.message);
  }
  process.exit(0);
}
run();
