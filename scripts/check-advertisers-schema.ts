import { query } from '../server/_core/mysql-db';

async function checkSchema() {
  const cols = await query('SHOW COLUMNS FROM advertisers') as any[];
  console.log(cols.map(c => `${c.Field} | TYPE: ${c.Type} | NULL: ${c.Null} | DEFAULT: ${c.Default}`).join('\n'));
}

checkSchema().then(() => process.exit(0)).catch(console.error);
