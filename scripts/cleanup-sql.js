import mysql from 'mysql2/promise';
import 'dotenv/config';

async function cleanup() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    const [rows] = await connection.execute('SELECT id FROM advertisers WHERE slug = ?', ['samsung-egypt']);
    if (rows.length === 0) {
      console.error('FATAL: Could not find advertiser samsung-egypt');
      process.exit(1);
    }
    const samsungId = rows[0].id;
    console.log('Found Samsung Advertiser Profile! ID: ' + samsungId);
    
    console.log('Deleting all mock tasks belonging to other advertisers...');
    const [taskResult] = await connection.execute('DELETE FROM tasks WHERE advertiserId != ?', [samsungId]);
    console.log(`- Deleted ${taskResult.affectedRows} mock tasks successfully.`);
    
    console.log('Deleting all mock advertisers...');
    const [advResult] = await connection.execute('DELETE FROM advertisers WHERE id != ?', [samsungId]);
    console.log(`- Deleted ${advResult.affectedRows} mock advertisers successfully.`);
    
    console.log('\n--- Database Cleanup Complete! ---');
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

cleanup();
