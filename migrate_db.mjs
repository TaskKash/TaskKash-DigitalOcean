import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL;
const match = dbUrl?.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

const pool = mysql.createPool({
    host: match?.[3] || 'localhost',
    user: match?.[1] || 'taskkash_user',
    password: match?.[2] || 'TaskKash2025Secure',
    database: match?.[5] || 'taskkash',
    port: parseInt(match?.[4] || '3306'),
    multipleStatements: true
});

async function run() {
    const conn = await pool.getConnection();

    try {
        console.log('🔧 Running database migrations...\n');

        // 1. Create task_submissions table if not exists
        console.log('1. Creating task_submissions table...');
        await conn.execute(`
      CREATE TABLE IF NOT EXISTS task_submissions (
        id INT NOT NULL AUTO_INCREMENT,
        taskId INT NOT NULL,
        userId INT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        submissionData TEXT,
        score INT DEFAULT NULL,
        watchTime INT DEFAULT NULL,
        correctAnswers INT DEFAULT NULL,
        totalQuestions INT DEFAULT NULL,
        uploadedFiles TEXT,
        gpsLocation TEXT,
        reviewedBy INT DEFAULT NULL,
        reviewedAt DATETIME DEFAULT NULL,
        reviewNotes TEXT,
        rejectionReason TEXT,
        rewardAmount DECIMAL(10,2) DEFAULT NULL,
        rewardCredited TINYINT(1) DEFAULT 0,
        creditedAt DATETIME DEFAULT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        completedAt DATETIME DEFAULT NULL,
        PRIMARY KEY (id),
        KEY idx_submissions_task (taskId),
        KEY idx_submissions_user (userId),
        KEY idx_submissions_status (status),
        CONSTRAINT task_submissions_ibfk_1 FOREIGN KEY (taskId) REFERENCES tasks (id) ON DELETE CASCADE,
        CONSTRAINT task_submissions_ibfk_2 FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
        console.log('   ✅ task_submissions table ready');

        // 2. Create survey_questions table if not exists
        console.log('2. Creating survey_questions table...');
        await conn.execute(`
      CREATE TABLE IF NOT EXISTS survey_questions (
        id INT NOT NULL AUTO_INCREMENT,
        taskId INT NOT NULL,
        questionText TEXT NOT NULL,
        questionTextAr TEXT,
        questionOrder INT NOT NULL DEFAULT 0,
        questionType VARCHAR(50) DEFAULT 'single_choice',
        options JSON DEFAULT NULL,
        optionsAr JSON DEFAULT NULL,
        isRequired TINYINT(1) DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_survey_task (taskId),
        CONSTRAINT survey_questions_ibfk_1 FOREIGN KEY (taskId) REFERENCES tasks (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
        console.log('   ✅ survey_questions table ready');

        // 3. Create survey_responses table if not exists
        console.log('3. Creating survey_responses table...');
        await conn.execute(`
      CREATE TABLE IF NOT EXISTS survey_responses (
        id INT NOT NULL AUTO_INCREMENT,
        submissionId INT NOT NULL,
        questionId INT NOT NULL,
        selectedOptions JSON DEFAULT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_responses_submission (submissionId),
        KEY idx_responses_question (questionId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
        console.log('   ✅ survey_responses table ready');

        // 4. Check and add missing columns to transactions table
        console.log('4. Checking transactions table columns...');

        const [cols] = await conn.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'transactions'
    `);
        const colNames = (cols as any[]).map(c => c.COLUMN_NAME);
        console.log('   Existing columns:', colNames.join(', '));

        // Add relatedTaskId if missing
        if (!colNames.includes('relatedTaskId')) {
            await conn.execute(`ALTER TABLE transactions ADD COLUMN relatedTaskId INT DEFAULT NULL`);
            console.log('   ✅ Added relatedTaskId column');
        } else {
            console.log('   ℹ️ relatedTaskId already exists');
        }

        // Add commissionAmount if missing (used in task submission)
        if (!colNames.includes('commissionAmount')) {
            await conn.execute(`ALTER TABLE transactions ADD COLUMN commissionAmount DECIMAL(10,2) DEFAULT 0`);
            console.log('   ✅ Added commissionAmount column');
        }

        // Add commissionRate if missing
        if (!colNames.includes('commissionRate')) {
            await conn.execute(`ALTER TABLE transactions ADD COLUMN commissionRate DECIMAL(5,4) DEFAULT 0`);
            console.log('   ✅ Added commissionRate column');
        }

        // Add netAmount if missing
        if (!colNames.includes('netAmount')) {
            await conn.execute(`ALTER TABLE transactions ADD COLUMN netAmount DECIMAL(10,2) DEFAULT 0`);
            console.log('   ✅ Added netAmount column');
        }

        // Add balanceBefore and balanceAfter if missing (they might be there already)
        if (!colNames.includes('balanceBefore')) {
            await conn.execute(`ALTER TABLE transactions ADD COLUMN balanceBefore DECIMAL(10,2) DEFAULT 0 NOT NULL`);
            console.log('   ✅ Added balanceBefore column');
        }
        if (!colNames.includes('balanceAfter')) {
            await conn.execute(`ALTER TABLE transactions ADD COLUMN balanceAfter DECIMAL(10,2) DEFAULT 0 NOT NULL`);
            console.log('   ✅ Added balanceAfter column');
        }

        // 5. Check and add missing columns to advertisers table
        console.log('5. Checking advertisers table columns...');
        const [advertiserCols] = await conn.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'advertisers'
    `);
        const advertiserColNames = (advertiserCols as any[]).map(c => c.COLUMN_NAME);

        if (!advertiserColNames.includes('tier')) {
            await conn.execute(`ALTER TABLE advertisers ADD COLUMN tier VARCHAR(20) DEFAULT 'basic'`);
            console.log('   ✅ Added tier column to advertisers');
        }
        if (!advertiserColNames.includes('totalSpent')) {
            await conn.execute(`ALTER TABLE advertisers ADD COLUMN totalSpent DECIMAL(10,2) DEFAULT 0`);
            console.log('   ✅ Added totalSpent column to advertisers');
        }
        if (!advertiserColNames.includes('balance')) {
            await conn.execute(`ALTER TABLE advertisers ADD COLUMN balance DECIMAL(10,2) DEFAULT 0`);
            console.log('   ✅ Added balance column to advertisers');
        }

        // 6. Add missing columns to tasks table (currentCompletions and maxCompletions)
        console.log('6. Checking tasks table columns...');
        const [taskCols] = await conn.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tasks'
    `);
        const taskColNames = (taskCols as any[]).map(c => c.COLUMN_NAME);

        if (!taskColNames.includes('currentCompletions')) {
            await conn.execute(`ALTER TABLE tasks ADD COLUMN currentCompletions INT DEFAULT 0`);
            console.log('   ✅ Added currentCompletions column to tasks');
        }
        if (!taskColNames.includes('maxCompletions')) {
            // Copy from completionsNeeded if it exists
            if (taskColNames.includes('completionsNeeded')) {
                await conn.execute(`ALTER TABLE tasks ADD COLUMN maxCompletions INT DEFAULT NULL`);
                await conn.execute(`UPDATE tasks SET maxCompletions = completionsNeeded`);
                console.log('   ✅ Added maxCompletions column (copied from completionsNeeded)');
            } else {
                await conn.execute(`ALTER TABLE tasks ADD COLUMN maxCompletions INT DEFAULT NULL`);
                console.log('   ✅ Added maxCompletions column to tasks');
            }
        }

        // 7. Add user_verifications table if missing (used by profile strength API)
        console.log('7. Creating user_verifications table...');
        await conn.execute(`
      CREATE TABLE IF NOT EXISTS user_verifications (
        id INT NOT NULL AUTO_INCREMENT,
        userId INT NOT NULL,
        verificationType VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        documentUrl TEXT,
        verifiedAt DATETIME DEFAULT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_user_verif (userId),
        CONSTRAINT user_verifications_ibfk_1 FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
        console.log('   ✅ user_verifications table ready');

        // 8. Add user_social_profiles table if missing
        console.log('8. Creating user_social_profiles table...');
        await conn.execute(`
      CREATE TABLE IF NOT EXISTS user_social_profiles (
        id INT NOT NULL AUTO_INCREMENT,
        userId INT NOT NULL,
        platform VARCHAR(50) NOT NULL,
        profileUrl TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_social_user (userId),
        CONSTRAINT user_social_profiles_ibfk_1 FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
        console.log('   ✅ user_social_profiles table ready');

        console.log('\n✅ All migrations complete!');
    } catch (err: any) {
        console.error('❌ Migration error:', err.message);
    } finally {
        conn.release();
        await pool.end();
    }
}

run();
