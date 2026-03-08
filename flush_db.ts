import { getDb } from './server/db.ts';
import { sql } from 'drizzle-orm';
import mysql from 'mysql2/promise';
import 'dotenv/config';

async function flushDb() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL!);
        console.log("Connected to database...");

        // Flush tables to clear table cache
        await connection.query('FLUSH TABLES;');
        console.log("✅ MySQL tables flushed.");

        // Flush query cache if supported (will silently fail if not supported in MySQL 8+)
        try {
            await connection.query('FLUSH QUERY CACHE;');
            console.log("✅ MySQL query cache flushed.");
        } catch (e) {
            console.log("Query cache flush skipped (likely unsupported in this MySQL version).");
        }

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error("Failed to flush tables:", error);
        process.exit(1);
    }
}

flushDb();
