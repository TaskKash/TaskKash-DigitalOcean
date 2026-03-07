
import "dotenv/config";
import { query } from './server/_core/mysql-db';

async function describeQ() {
    try {
        const columns = await query('SHOW COLUMNS FROM task_questions');
        console.log('--- Task Questions Columns ---');
        console.log(columns.map((c: any) => c.Field).join(', '));
        process.exit(0);
    } catch (err) {
        console.error('Describe failed:', err);
        process.exit(1);
    }
}

describeQ();
