import 'dotenv/config';
import { getDb } from './server/db';
import { users } from './drizzle/schema';
import bcrypt from 'bcryptjs';

async function seed() {
  const db = await getDb();
  if (!db) throw new Error('No DB connection');

  const passwordHash = await bcrypt.hash('TaskKash123!', 10);

  const testUsers = [
    {
      openId: 'vip_test_123',
      name: 'VIP Test User',
      email: 'vip@taskkash.com',
      password: passwordHash,
      phone: '01000000001',
      isPhoneVerified: 0,
      role: 'user' as const,
      tier: 'vip' as const,
      completedTasks: 0,
      countryId: 1
    },
    {
      openId: 'prestige_test_123',
      name: 'Prestige Test User',
      email: 'prestige@taskkash.com',
      password: passwordHash,
      phone: '01000000002',
      isPhoneVerified: 1,
      role: 'user' as const,
      tier: 'prestige' as const,
      completedTasks: 5,
      countryId: 1
    },
    {
      openId: 'elite_test_123',
      name: 'Elite Test User',
      email: 'elite@taskkash.com',
      password: passwordHash,
      phone: '01000000003',
      isPhoneVerified: 1,
      role: 'user' as const,
      tier: 'elite' as const,
      completedTasks: 15,
      countryId: 1
    }
  ];

  console.log('Inserting test users...');
  for (const user of testUsers) {
    try {
      await db.insert(users).values(user);
      console.log(`✅ Created ${user.email} (${user.tier})`);
    } catch (e: any) {
      if (e.code === 'ER_DUP_ENTRY') {
        console.log(`⚠️ User ${user.email} already exists.`);
      } else {
        console.error(`❌ Error creating ${user.email}:`, e);
      }
    }
  }

  process.exit(0);
}

seed();
