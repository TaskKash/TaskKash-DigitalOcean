const bcrypt = require('bcrypt');

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

async function main() {
  // Hash passwords for testing
  const passwords = {
    'advertiser123': await hashPassword('advertiser123'),
    'admin123': await hashPassword('admin123'),
  };
  
  console.log('Hashed Passwords:');
  console.log('advertiser123:', passwords['advertiser123']);
  console.log('admin123:', passwords['admin123']);
}

main();
