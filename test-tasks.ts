import { getDb } from './server/db';
import { tasks } from './drizzle/schema';
async function test() {
    try {
        const db = await getDb();
        const allTasks = await db.select().from(tasks);
        console.log('Tasks count:', allTasks.length);
        if (allTasks.length > 0) {
            console.log('Tasks found!');
        } else {
            console.log('No tasks found.');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
test();
