
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/advertiser/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  const cookies = res.headers['set-cookie'] || [];
  
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Login Status:', res.statusCode);
    const setCookieHeader = cookies.join(';');
    console.log('Cookies:', setCookieHeader);
    
    // Now hit segments
    const segOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/advertiser/segments',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': setCookieHeader
      }
    };
    
    const req2 = http.request(segOptions, (res2) => {
      let data2 = '';
      res2.on('data', d => data2 += d);
      res2.on('end', () => {
        console.log('Segments Status:', res2.statusCode);
        console.log('Segments Response:', data2);
      });
    });
    
    req2.write(JSON.stringify({
      ageMin: 18, ageMax: 65, gender: 'all', countries: ['Egypt'],
      householdSizeMin: 1, householdSizeMax: 10, profileStrengthMin: 60, completedTasksMin: 0
    }));
    req2.end();
  });
});

req.write(JSON.stringify({
  identifier: 'samsung.egypt@samsung.com',
  password: 'testpassword123'
}));
req.end();
