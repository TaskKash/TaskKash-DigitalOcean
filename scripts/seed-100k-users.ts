import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import db from '../server/_core/mysql-db.js';

const TOTAL_USERS = 100000;
const BATCH_SIZE = 2000;

const firstNames = ['Mohamed', 'Ahmed', 'Fatima', 'Sara', 'Mahmoud', 'Mostafa', 'Nour', 'Aya', 'Omar', 'Ali', 'Khaled', 'Mona', 'Hassan', 'Youssef', 'Mariam', 'Salma', 'Kareem', 'Amira'];
const lastNames = ['Hassan', 'Ali', 'Ibrahim', 'Mahmoud', 'Said', 'Fawzy', 'Tarek', 'Adel', 'Samir', 'Fathy', 'Nasser', 'Kamal', 'Osama', 'Saad'];
const cities = ['Cairo', 'Giza', 'Alexandria', 'Dakahlia', 'Sharqia', 'Fayoum', 'Aswan', 'Luxor', 'Mansoura'];
const carriers = ['Vodafone', 'Orange', 'Etisalat', 'WE'];

function getRandomItem(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhone() {
  const prefixes = ['010', '011', '012', '015'];
  const p = getRandomItem(prefixes);
  return `+20${p.substring(1)}${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
}

async function insertBatch(tableName: string, rows: any[]) {
  if (!rows || rows.length === 0) return;
  const keys = Object.keys(rows[0]);
  const placeholders = keys.map(() => '?').join(', ');
  const rowPlaceholders = `(${placeholders})`;
  const allPlaceholders = rows.map(() => rowPlaceholders).join(', ');
  const flatValues = rows.flatMap(r => keys.map(k => r[k]));
  
  const bulkQuery = `INSERT INTO \`${tableName}\` (${keys.map(k => '\`'+k+'\`').join(', ')}) VALUES ${allPlaceholders}`;
  await db.query(bulkQuery, flatValues);
}

async function main() {
  console.log(`Starting to seed ${TOTAL_USERS} users...`);
  
  try {
    const startTime = Date.now();
    let currentBatchUsers: any[] = [];
    let currentBatchProfiles: any[] = [];
    
    // Instead of inserting and selecting to get IDs back for userProfiles,
    // we just use a prefix on openId and rely on the database inserting them in some order.
    // Actually, getting IDs safely requires selecting by openId.
    
    // Let's seed in chunks of BATCH_SIZE
    let openIdOffset = Date.now();
    let insertedUsers = 0;
    
    for (let i = 0; i < TOTAL_USERS; i++) {
        const tierRand = Math.random();
        let tier = 'bronze';
        let completedTasksMin = 0;
        let completedTasksMax = 20;
        
        if (tierRand > 0.9) {
            tier = 'platinum'; // 10%
            completedTasksMin = 100;
            completedTasksMax = 200;
        } else if (tierRand > 0.6) {
            tier = 'silver'; // 30%
            completedTasksMin = 21;
            completedTasksMax = 99;
        } // 60% bronze
        
        const completedTasks = getRandomInt(completedTasksMin, completedTasksMax);
        // Realistic wallet balance: assuming avg task reward is 10 EGP. Balance is mostly withdrawn, so keep it small
        const balance = getRandomInt(0, 5000); // 0 to 50 EGP (stored in piastres/cents if applicable - assuming smallest unit)
        // Actually, the app displays it directly if it's not divided by 100, wait. Reward is in smallest currency unit? Or whole numbers?
        // Reward is typically '5 EGP'. So balance is in whole numbers unless specified. In UI it says '10 ج.م'. So let's use whole numbers.
        
        const openId = `seed_egypt_${openIdOffset}_${i}`;
        const age = getRandomInt(18, 55);
        const gender = Math.random() > 0.5 ? 'male' : 'female';
        
        // Joined date in last 365 days
        const joinedDate = new Date(Date.now() - getRandomInt(0, 365) * 24 * 60 * 60 * 1000);
        
        currentBatchUsers.push({
            openId,
            name: `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`,
            email: `seed_user_${i}_${openIdOffset}@example.com`,
            phone: generatePhone(),
            role: 'user',
            balance: balance,
            completedTasks: completedTasks,
            totalEarnings: completedTasks * getRandomInt(5, 15),
            tier: tier,
            profileStrength: getRandomInt(40, 95),
            countryId: 1, // Egypt
            isVerified: 1,
            age: age,
            gender: gender,
            city: getRandomItem(cities),
            createdAt: joinedDate,
            updatedAt: joinedDate,
            lastSignedIn: new Date()
        });
        
        if (currentBatchUsers.length >= BATCH_SIZE || i === TOTAL_USERS - 1) {
            console.log(`Inserting batch... (${insertedUsers + currentBatchUsers.length}/${TOTAL_USERS})`);
            
            // Insert users
            await insertBatch('users', currentBatchUsers);
            
            // Fetch their IDs to insert profiles
            const openIds = currentBatchUsers.map(u => u.openId);
            const placeholders = openIds.map(() => '?').join(',');
            const insertedRows = await db.query(`SELECT id, openId FROM users WHERE openId IN (${placeholders})`, openIds);
            
            // Create profile rows mapping
            const profilesToInsert = insertedRows.map((row: any) => {
                const isMale = Math.random() > 0.5;
                const income = getRandomItem(['Low', 'Medium', 'High']);
                
                return {
                    userId: row.id,
                    deviceOs: getRandomItem(['Android', 'iOS']),
                    deviceTier: getRandomItem(['A', 'B', 'C']),
                    networkCarrier: getRandomItem(carriers),
                    connectionType: getRandomItem(['WiFi', '4G']),
                    hasVehicle: Math.random() > 0.8 ? 1 : 0,
                    vehicleBrand: Math.random() > 0.9 ? 'Nissan' : null,
                    workType: getRandomItem(['office', 'remote', 'hybrid']),
                    industry: getRandomItem(['Technology', 'Education', 'Healthcare', 'Retail', 'Construction']),
                    createdAt: new Date()
                };
            });
            
            if (profilesToInsert.length > 0) {
              await insertBatch('userProfiles', profilesToInsert);
            }
            
            insertedUsers += currentBatchUsers.length;
            currentBatchUsers = [];
        }
    }
    
    const minutes = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
    console.log(`\n>>> Successfully seeded 100k Egyptian users in ${minutes} minutes <<<`);
    
  } catch (err) {
    console.error("Fatal error during seeding:", err);
  } finally {
    await db.closePool();
    process.exit(0);
  }
}

main();
