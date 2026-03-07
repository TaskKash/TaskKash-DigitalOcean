
import "dotenv/config";
import { query } from './server/_core/mysql-db';

async function check() {
    try {
        console.log('--- Samsung Advertiser Check ---');
        const samsung = await query("SELECT id, nameEn, slug, logoUrl, isActive FROM advertisers WHERE nameEn LIKE '%Samsung%'");
        console.log(JSON.stringify(samsung, null, 2));

        console.log('\n--- Tasks Check (Active) ---');
        const activeTasks = await query("SELECT id, advertiserId, titleEn, status FROM tasks WHERE status IN ('active', 'published')");
        console.log(JSON.stringify(activeTasks, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('Check failed:', err);
        process.exit(1);
    }
}

check();
