
import "dotenv/config";
import { query } from './server/_core/mysql-db';

async function describe() {
    try {
        console.log('--- Advertisers Table ---');
        const advertisersCols = await query('SHOW COLUMNS FROM advertisers');
        console.log(JSON.stringify(advertisersCols, null, 2));

        console.log('\n--- Tasks Table ---');
        const tasksCols = await query('SHOW COLUMNS FROM tasks');
        console.log(JSON.stringify(tasksCols, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('Describe failed:', err);
        process.exit(1);
    }
}

describe();
