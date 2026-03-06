import http from 'http';

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data || '{}') || data });
        } catch(e) {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function run() {
  console.log('Testing GET /api/csrf-token');
  const csrfRes = await request({ method: 'GET', host: 'localhost', port: 3000, path: '/api/csrf-token' });
  console.log('CSRF Status:', csrfRes.status);
  const cookie = csrfRes.headers['set-cookie'] ? csrfRes.headers['set-cookie'][0].split(';')[0] : '';
  const csrfToken = csrfRes.data.csrfToken || csrfRes.headers['x-csrf-token'];
  console.log('Got cookie:', cookie, 'token:', csrfToken);

  console.log('\nTesting GET /api/advertisers');
  const advRes = await request({ method: 'GET', host: 'localhost', port: 3000, path: '/api/advertisers' });
  console.log('Advertisers Status:', advRes.status);
  console.log('Data sample:', Array.isArray(advRes.data) ? advRes.data.slice(0, 1) : advRes.data);

  const testEmail = `test${Date.now()}@taskkash.com`;
  console.log(`\nTesting POST /api/auth/register with ${testEmail}`);
  const regData = JSON.stringify({ email: testEmail, password: 'Test1234!', name: 'Test User' });
  const regHeaders = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(regData),
    'Cookie': cookie,
    'x-csrf-token': csrfToken
  };
  const regRes = await request({ method: 'POST', host: 'localhost', port: 3000, path: '/api/auth/register', headers: regHeaders }, regData);
  console.log('Register Status:', regRes.status);
  console.log('Register Data:', regRes.data);

  console.log('\nTesting POST /api/auth/login');
  const loginData = JSON.stringify({ email: testEmail, password: 'Test1234!' });
  const loginHeaders = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData),
    'Cookie': cookie,
    'x-csrf-token': csrfToken
  };
  const loginRes = await request({ method: 'POST', host: 'localhost', port: 3000, path: '/api/auth/login', headers: loginHeaders }, loginData);
  console.log('Login Status:', loginRes.status);
  console.log('Login Data:', loginRes.data);
}

run().catch(console.error);
