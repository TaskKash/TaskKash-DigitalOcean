require('dotenv').config();
const { db } = require('../dist/db.js');
const { advertisers, tasks } = require('../dist/schema.js');
const { eq, ne } = require('drizzle-orm');

async function cleanup() {
  console.log('--- Starting Database Cleanup ---');
  try {
    const targetSlug = 'samsung-egypt';
    const samsungProfile = await db.query.advertisers.findFirst({
      where: eq(advertisers.slug, targetSlug)
    });
    
    if (!samsungProfile) {
      console.error('FATAL: Could not find advertiser samsung-egypt');
      process.exit(1);
    }
    
    const samsungId = samsungProfile.id;
    console.log('Found Samsung Advertiser Profile! ID: ' + samsungId);
    
    console.log('Deleting all mock tasks belonging to other advertisers...');
    await db.delete(tasks).where(ne(tasks.advertiserId, samsungId));
    console.log('- Deleted mock tasks successfully.');
    
    console.log('Deleting all mock advertisers...');
    await db.delete(advertisers).where(ne(advertisers.id, samsungId));
    console.log('- Deleted mock advertisers successfully.');
    
    console.log('\n--- Database Cleanup Complete! ---');
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}
cleanup();
