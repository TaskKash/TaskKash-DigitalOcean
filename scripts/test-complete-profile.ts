async function testCompleteProfile() {
  try {
    // 1. Login
    console.log('Logging in...');
    const loginRes = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'omarmakram007x@gmail.com', password: '12341234' })
    });
    
    if (!loginRes.ok) {
        console.error('Login failed:', await loginRes.text());
        return;
    }
    
    const rawCookies = loginRes.headers.raw ? loginRes.headers.raw()['set-cookie'] : [loginRes.headers.get('set-cookie')];
    let sessionCookie = '';
    // Quick hack for native fetch get('set-cookie') which comma-separates:
    const cookieStr = loginRes.headers.get('set-cookie') || '';
    console.log('Raw cookies:', cookieStr);
    const match = cookieStr.match(/tk_session=([^;,\s]+)/);
    if (match) sessionCookie = `tk_session=${match[1]}`;
    
    let cookieHeader = sessionCookie;

    console.log('Login successful. Cookies:', cookieHeader);
    
    // 2. Complete Profile
    console.log('Completing profile...');
    const profileRes = await fetch('http://localhost:3001/api/profile/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader
      },
      body: JSON.stringify({
        gender: 'male',
        ageRange: '18-24',
        education: 'bachelor',
        employment: 'employed',
        income: '3000-6000',
        industry: 'tech',
        shopping: 'online',
        tech: 'early',
        interests: ['tech'],
        maritalStatus: 'single',
        carType: 'none',
        housingType: 'owned'
      })
    });
    
    if (!profileRes.ok) {
      console.error('Complete Profile failed with status', profileRes.status);
      console.error(await profileRes.text());
      return;
    }
    
    console.log('Complete Profile Success:', await profileRes.json());
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testCompleteProfile();
