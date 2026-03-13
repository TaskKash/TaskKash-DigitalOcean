import { db } from './server/_core/db';
import { users } from './shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function checkUser() {
  const email = 'taskkash@gmail.com';
  console.log(`Checking user: ${email}...`);
  try {
    const userArray = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!userArray || userArray.length === 0) {
      console.log('User NOT FOUND in database.');
    } else {
      const user = userArray[0];
      console.log(`User found! ID: ${user.id}`);
      console.log(`Has password? ${!!user.password}`);
      
      const pwdToCheck = '123456';
      if (user.password) {
        const isMatch = await bcrypt.compare(pwdToCheck, user.password);
        console.log(`Does '${pwdToCheck}' match password hash? ${isMatch}`);
      }
    }
  } catch (err) {
    console.error('Database error:', err);
  }
  process.exit();
}

checkUser();
