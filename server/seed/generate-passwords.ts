import bcrypt from 'bcryptjs';

/**
 * Generate bcrypt hashed passwords for seed data
 * All test users will use password: "password123"
 */

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'password123';

async function generateHash(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
  console.log('Generating hashed passwords for seed data...\n');
  
  const hash = await generateHash(DEFAULT_PASSWORD);
  
  console.log('Default password:', DEFAULT_PASSWORD);
  console.log('Bcrypt hash:', hash);
  console.log('\nUse this hash in seed-data.sql for all test users.');
}

main().catch(console.error);
