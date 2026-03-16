async function register() {
  try {
    const res = await fetch('http://localhost:3001/api/auth/advertiser/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: 'Nokia-EGY',
        contactPerson: 'Ahmed Mustafa',
        email: 'nokia@gmail.com',
        phone: '+201001581287',
        industry: 'Technology',
        companySize: '500+ employees',
        password: '1234123412341234',
        tier: 'basic'
      })
    });
    console.log(res.status);
    console.log(await res.text());
  } catch (err) {
    console.error(err);
  }
}
register();
