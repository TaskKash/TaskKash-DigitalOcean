import { mysqlQuery } from './server/_core/db';

async function checkDb() {
  try {
    const adv = await mysqlQuery('DESCRIBE advertisers');
    console.log('advertisers columns:', adv.map((c: any) => c.Field));
    
    const ts = await mysqlQuery('DESCRIBE task_submissions');
    console.log('task_submissions columns:', ts.map((c: any) => c.Field));
  } catch(e) {
    console.error(e);
  }
  process.exit();
}
checkDb();
