import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL;
const match = dbUrl?.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

const pool = mysql.createPool({
    host: match?.[3] || 'localhost',
    user: match?.[1] || 'taskkash_user',
    password: match?.[2] || 'TaskKash2025Secure',
    database: match?.[5] || 'taskkash',
    port: parseInt(match?.[4] || '3306')
});

async function run() {
    const [tasks] = await pool.execute('SELECT id, status, titleEn, currentCompletions, maxCompletions FROM tasks LIMIT 10');
    console.log('Tasks:', JSON.stringify(tasks, null, 2));

    const [countResult] = await pool.execute('SELECT COUNT(*) as total, status FROM tasks GROUP BY status');
    console.log('\nTask counts by status:', JSON.stringify(countResult, null, 2));

    await pool.end();
}

run().catch(console.error);
