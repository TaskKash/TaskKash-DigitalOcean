import { query } from './server/_core/mysql-db';

async function dump() {
    console.log('--- Dumping Task 1 Questions ---');
    const questions = await query('SELECT * FROM task_questions WHERE taskId = 1') as any[];
    console.log(JSON.stringify(questions, null, 2));

    console.log('\n--- Dumping Task 1 Config ---');
    const [task] = await query('SELECT * FROM tasks WHERE id = 1') as any[];
    console.log('Task Title:', task.titleEn);
    console.log('Passing Score:', task.passingScore);
    console.log('Reward:', task.reward);

    process.exit(0);
}

dump().catch(err => {
    console.error(err);
    process.exit(1);
});
