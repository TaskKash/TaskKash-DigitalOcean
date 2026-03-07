
import "dotenv/config";

async function verifyTasks() {
    try {
        const port = process.env.PORT || 3000;
        const url = `http://localhost:${port}/api/tasks`;
        console.log(`--- Fetching from ${url} ---`);

        const response = await fetch(url);
        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Raw Result:', text);

        if (response.ok) {
            const data = JSON.parse(text);
            console.log('Task Count:', data.tasks?.length);
        }

        process.exit(0);
    } catch (err) {
        console.error('Task Verification failed:', err);
        process.exit(1);
    }
}

verifyTasks();
