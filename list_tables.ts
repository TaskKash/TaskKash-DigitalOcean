
import "dotenv/config";
import { query } from './server/_core/mysql-db';

async function listTables() {
    try {
        const tables = await query('SHOW TABLES');
        console.log(JSON.stringify(tables, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('List tables failed:', err);
        process.exit(1);
    }
}

listTables();
