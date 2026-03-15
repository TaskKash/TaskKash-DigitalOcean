import 'dotenv/config';
import { db } from './server/db.js';
import { advertisers, tasks, users, userTasks } from './server/schema.js';
import { eq, ne } from 'drizzle-orm';

async function cleanup() {
  console.log('--- Starting Database Cleanup ---');

  try {
    // 1. Find the exact Samsung Egypt Advertiser Profile the user mentioned
    const targetSlug = 'samsung-egypt';
    const samsungProfile = await db.query.advertisers.findFirst({
      where: eq(advertisers.slug, targetSlug)
    });

    if (!samsungProfile) {
      console.error(`FATAL: Could not find advertiser with slug '${targetSlug}'.`);
      console.error('Please ensure the slug is exactly correct.');
      process.exit(1);
    }

    const samsungId = samsungProfile.id;
    console.log(`Found Samsung Advertiser Profile! ID: ${samsungId}`);

    // 2. Delete all tasks that DO NOT belong to Samsung Egypt
    console.log('Deleting all mock tasks belonging to other advertisers...');
    const deletedTasks = await db.delete(tasks).where(ne(tasks.advertiserId, samsungId));
    console.log(`- Deleted mock tasks successfully.`);

    // 3. Delete all advertisers that ARE NOT Samsung Egypt
    console.log('Deleting all mock advertisers...');
    const deletedAdvertisers = await db.delete(advertisers).where(ne(advertisers.id, samsungId));
    console.log(`- Deleted mock advertisers successfully.`);

    console.log('\n--- Database Cleanup Complete! ---');
    console.log('✅ Retained: Samsung Egypt (and its tasks)');
    console.log('🗑️  Deleted: All other advertisers and their tasks');
    process.exit(0);

  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

cleanup();
