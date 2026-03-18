import 'dotenv/config';
import { db } from './server/db/index.js';
import { users } from './drizzle/schema.js';
import { eq } from 'drizzle-orm';

async function run() {
  const user = await db.query.users.findFirst({
    where: eq(users.role, 'advertiser')
  });
  console.log('Advertiser Email:', user?.email);
  process.exit(0);
}
run();
