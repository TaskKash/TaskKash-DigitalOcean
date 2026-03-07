
import "dotenv/config";
import mysql from 'mysql2/promise';

// Direct connection for seeding to use query instead of execute
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error('DATABASE_URL is not defined in .env');
    process.exit(1);
}

const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
const config = match ? {
    host: match[3],
    user: match[1],
    password: match[2],
    database: match[5],
    port: parseInt(match[4]),
    multipleStatements: true // Essential for scripts
} : {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'taskkash_user',
    password: process.env.DB_PASSWORD || 'TaskKash2025Secure',
    database: process.env.DB_NAME || 'taskkash',
    port: parseInt(process.env.DB_PORT || '3306'),
    multipleStatements: true
};

import fs from 'fs';
import path from 'path';

async function seed() {
    const connection = await mysql.createConnection(config);
    try {
        console.log('--- Reading seed_correct.sql ---');
        const sqlFile = path.join(process.cwd(), 'seed_correct.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');

        // We can run the whole file at once if multipleStatements is true
        console.log('--- Executing full SQL script ---');
        const [results] = await connection.query(sql);
        console.log('Results:', JSON.stringify(results, null, 2));

        console.log('--- Seeding Complete ---');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

seed();
