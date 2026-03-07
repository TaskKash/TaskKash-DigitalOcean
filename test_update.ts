
import "dotenv/config";
import { query } from './server/_core/mysql-db';

async function testUpdate() {
    try {
        console.log('--- Attempting direct update ---');
        const res = await query("UPDATE advertisers SET nameEn = 'Samsung Egypt TEST' WHERE id = 1");
        console.log('Update result:', JSON.stringify(res, null, 2));

        const verify = await query("SELECT id, nameEn FROM advertisers WHERE id = 1");
        console.log('Verification:', JSON.stringify(verify, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('Update failed:', err);
        process.exit(1);
    }
}

testUpdate();
