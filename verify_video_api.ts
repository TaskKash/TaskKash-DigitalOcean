import { query } from './server/_core/mysql-db';

async function verify() {
    console.log('--- Verifying Task API Data ---');

    // 1. Check a video task directly in DB
    const [task] = await query('SELECT * FROM tasks WHERE id = 1') as any[];
    console.log('Database Task 1 config:', task.config);

    // 2. Simulate API response logic
    const parsed = task.config ? (typeof task.config === 'string' ? JSON.parse(task.config) : task.config) : null;
    console.log('Parsed taskData for frontend:', parsed);

    if (parsed && parsed.videoUrl) {
        console.log('✅ SUCCESS: videoUrl found:', parsed.videoUrl);
    } else {
        console.log('❌ FAILURE: videoUrl missing from parsed data');
    }

    process.exit(0);
}

verify().catch(err => {
    console.error(err);
    process.exit(1);
});
