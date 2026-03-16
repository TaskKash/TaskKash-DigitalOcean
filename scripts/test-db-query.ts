import { query } from '../server/_core/mysql-db';

async function checkUser() {
  const email = 'omarmakram007x@gmail.com';
  const users = await query('SELECT * FROM users WHERE email = ?', [email]) as any;
  console.log('User Record:', users);
  
  if (users.length > 0) {
    const profiles = await query('SELECT * FROM userProfiles WHERE userId = ?', [users[0].id]) as any;
    console.log('UserProfile Record:', profiles);
    
    const transactions = await query('SELECT * FROM transactions WHERE userId = ?', [users[0].id]) as any;
    console.log('Transactions Count:', transactions.length);
  }
}

checkUser().then(() => process.exit(0)).catch(console.error);
