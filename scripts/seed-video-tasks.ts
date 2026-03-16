import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import db from '../server/_core/mysql-db.js';

const TOTAL_TASKS = 50;

const videoUrls = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
  'https://www.youtube.com/watch?v=jNQXAC9IVRw',
  'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
  'https://www.youtube.com/watch?v=2Vv-BfVoq4g'
];

const brands = ['Samsung', 'Vodafone', 'Orange', 'Nestle', 'Pepsi', 'Coca Cola', 'Juhayna', 'Talabat', 'Noon', 'Jumia', 'Amazon Egypt', 'Etisalat', 'WE'];

function getRandomItem(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a random set of questions for a video task
function generateQuestions(count: number) {
  const questions = [];
  for (let i = 0; i < count; i++) {
    questions.push({
      id: i + 1,
      questionText: `What was mentioned in part ${i + 1} of the video?`,
      questionTextAr: `ما الذي تم ذكره في الجزء ${i + 1} من الفيديو؟`,
      questionOrder: i + 1,
      questionType: 'multiple_choice',
      optionA: 'Option A (Correct)',
      optionAAr: 'الخيار أ (صحيح)',
      optionB: 'Option B',
      optionBAr: 'الخيار ب',
      optionC: 'Option C',
      optionCAr: 'الخيار ج',
      optionD: 'Option D',
      optionDAr: 'الخيار د'
    });
  }
  return questions;
}

async function getAdvertisers() {
  const res = await db.query('SELECT id, nameEn FROM advertisers WHERE isActive = 1 LIMIT 20');
  return res.length > 0 ? res : [{ id: 1, nameEn: 'Mock Advertiser' }];
}

async function main() {
  console.log(`Starting to seed ${TOTAL_TASKS} video tasks...`);
  
  try {
    const startTime = Date.now();
    const advertisers = await getAdvertisers();
    
    // We will insert one by one formatted properly since we also need to test it thoroughly.
    let count = 0;
    
    for (let i = 0; i < TOTAL_TASKS; i++) {
        const advertiser = getRandomItem(advertisers);
        const reward = getRandomInt(5, 50);
        const duration = getRandomInt(1, 5); // 1 to 5 minutes
        const maxCompletions = getRandomInt(1000, 10000);
        const difficulty = getRandomItem(['easy', 'medium', 'hard']);
        const requiredProfileStrength = getRandomItem([0, 30, 50]);
        const numQuestions = getRandomInt(3, 5);
        
        const config = {
            videoUrl: getRandomItem(videoUrls),
            questions: generateQuestions(numQuestions),
            minWatchPercentage: 80, // User should watch 80% to continue
            passingScore: 100 // all questions must be correct
        };
        
        // Let's insert the task
        await db.query(`
            INSERT INTO tasks (
                advertiserId, titleAr, titleEn, descriptionAr, descriptionEn,
                type, reward, duration, difficulty, requiredProfileStrength,
                maxCompletions, currentCompletions, status, countryId, config,
                createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
            advertiser.id,
            `شاهد فيديو إعلاني - ${advertiser.nameEn || 'عرض'} ${i+1}`,
            `Watch Promo Video - ${advertiser.nameEn || 'Offer'} ${i+1}`,
            `شاهد الفيديو الترويجي وأجب عن الأسئلة لربح ${reward} ج.م`,
            `Watch the promotional video and answer the questions to earn ${reward} EGP`,
            'video',
            reward,
            duration,
            difficulty,
            requiredProfileStrength,
            maxCompletions,
            0,
            'active',
            1, // Egypt
            JSON.stringify(config) // Stringified JSON configuration
        ]);
        
        count++;
    }
    
    const minutes = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
    console.log(`\n>>> Successfully seeded ${count} video tasks in ${minutes} minutes <<<`);
    
  } catch (err) {
    console.error("Fatal error during seeding tasks:", err);
  } finally {
    await db.closePool();
    process.exit(0);
  }
}

main();
