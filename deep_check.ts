
import "dotenv/config";
import { query } from './server/_core/mysql-db';

async function deepCheck() {
    try {
        console.log('--- Database Info ---');
        const dbName = await query("SELECT DATABASE()");
        console.log('Current Database:', JSON.stringify(dbName, null, 2));

        console.log('\n--- All Advertisers ---');
        const allAdvertisers = await query("SELECT id, nameEn, slug, logoUrl, isActive FROM advertisers");
        console.log(JSON.stringify(allAdvertisers, null, 2));

        console.log('\n--- All Tasks ---');
        const allTasks = await query("SELECT id, advertiserId, titleEn, status FROM tasks");
        console.log(JSON.stringify(allTasks, null, 2));

        console.log('\n--- All Countries ---');
        const allCountries = await query("SELECT * FROM countries");
        console.log(JSON.stringify(allCountries, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('Deep check failed:', err);
        process.exit(1);
    }
}

deepCheck();
