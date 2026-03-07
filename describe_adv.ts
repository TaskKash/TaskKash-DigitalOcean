
import "dotenv/config";
import { query } from './server/_core/mysql-db';

async function describeAdv() {
    try {
        const columns = await query('SHOW COLUMNS FROM advertisers');
        console.log('--- Advertisers Columns ---');
        console.log(columns.map((c: any) => c.Field).join(', '));
        process.exit(0);
    } catch (err) {
        console.error('Describe failed:', err);
        process.exit(1);
    }
}

describeAdv();
