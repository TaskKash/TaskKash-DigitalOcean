
import "dotenv/config";
import mysql from 'mysql2/promise';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    process.exit(1);
}

const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
const config = match ? {
    host: match[3],
    user: match[1],
    password: match[2],
    database: match[5],
    port: parseInt(match[4]),
    multipleStatements: true
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

async function resetAndSeed() {
    const connection = await mysql.createConnection(config);
    try {
        console.log('--- Cleaning Tables ---');
        // Disable foreign key checks for clean wipe
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        await connection.query('DELETE FROM task_questions');
        await connection.query('DELETE FROM tasks');
        await connection.query('DELETE FROM advertisers');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('--- Reading seed_correct.sql ---');
        const sqlFile = path.join(process.cwd(), 'seed_correct.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');

        console.log('--- Executing full SQL script ---');
        const [results] = await connection.query(sql);
        console.log('Seed Results:', JSON.stringify(results, null, 2));

        console.log('--- Final Check ---');
        const [advs] = await connection.query('SELECT id, nameEn FROM advertisers');
        console.log('Advertisers:', JSON.stringify(advs, null, 2));

        const [tasks] = await connection.query('SELECT id, titleEn, advertiserId FROM tasks');
        console.log('Tasks:', JSON.stringify(tasks, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('Reset and Seeding failed:', err);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

resetAndSeed();
