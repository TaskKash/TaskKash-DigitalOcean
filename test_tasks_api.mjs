import fetch from 'node:fetch';

const BASE_URL = 'http://localhost:3000';

async function testTasks() {
    console.log('Testing GET /api/tasks');
    const r = await fetch(`${BASE_URL}/api/tasks`);
    console.log('Status:', r.status);
    const body = await r.text();
    console.log('Body:', body.substring(0, 2000));
}

testTasks().catch(console.error);
