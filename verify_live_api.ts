async function verifyApi() {
    console.log('--- Verifying Live Task API ---');
    try {
        const response = await fetch('http://localhost:3000/api/tasks/1');
        const data = await response.json();
        const task = data.task;

        console.log('Task Title:', task.titleEn);
        console.log('Top-level passingScore:', task.passingScore);
        console.log('Top-level minWatchPercentage:', task.minWatchPercentage);

        if (task.passingScore === 80 && task.minWatchPercentage === 80) {
            console.log('✅ SUCCESS: API flattened config correctly!');
        } else {
            console.log('❌ FAILURE: API did not flatten config as expected');
        }
    } catch (err) {
        console.error('Fetch failed:', err.message);
    }
}

verifyApi();
