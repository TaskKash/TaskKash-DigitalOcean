import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function testConnection() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error('DATABASE_URL is not set in .env');
        process.exit(1);
    }

    console.log('Testing connection to:', url.replace(/:[^:@]+@/, ':***@'));

    try {
        const connection = await mysql.createConnection(url);
        console.log('Successfully connected to MySQL database!');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Failed to connect to MySQL database:');
        console.error(error.message);
        process.exit(1);
    }
}

testConnection();
