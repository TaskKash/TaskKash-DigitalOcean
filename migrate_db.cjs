const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbUrl = process.env.DATABASE_URL;
const match = dbUrl ? dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/) : null;

const pool = mysql.createPool({
    host: match ? match[3] : 'localhost',
    user: match ? match[1] : 'taskkash_user',
    password: match ? match[2] : 'TaskKash2025Secure',
    database: match ? match[5] : 'taskkash',
    port: parseInt(match ? match[4] : '3306')
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
        console.log('   task_submissions table ready');

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
        console.log('   survey_questions table ready');

        // 3. Create survey_responses table if not exists
        console.log('3. Creating survey_responses table...');
        await conn.execute(`
      CREATE TABLE IF NOT EXISTS survey_responses (
        id INT NOT NULL AUTO_INCREMENT,
        submissionId INT NOT NULL,
        questionId INT NOT NULL,
        selectedOptions JSON DEFAULT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
        console.log('   survey_responses table ready');

        // 4. Check and add missing columns to transactions table
        console.log('4. Checking transactions table columns...');
        const [cols] = await conn.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'transactions'
    `);
        const colNames = cols.map(c => c.COLUMN_NAME);
        console.log('   Existing columns:', colNames.join(', '));

        if (!colNames.includes('relatedTaskId')) {
            await conn.execute('ALTER TABLE transactions ADD COLUMN relatedTaskId INT DEFAULT NULL');
            console.log('   Added relatedTaskId');
        }
        if (!colNames.includes('commissionAmount')) {
            await conn.execute('ALTER TABLE transactions ADD COLUMN commissionAmount DECIMAL(10,2) DEFAULT 0');
            console.log('   Added commissionAmount');
        }
        if (!colNames.includes('commissionRate')) {
            await conn.execute('ALTER TABLE transactions ADD COLUMN commissionRate DECIMAL(10,6) DEFAULT 0');
            console.log('   Added commissionRate');
        }
        if (!colNames.includes('netAmount')) {
            await conn.execute('ALTER TABLE transactions ADD COLUMN netAmount DECIMAL(10,2) DEFAULT 0');
            console.log('   Added netAmount');
        }
        if (!colNames.includes('balanceBefore')) {
            await conn.execute('ALTER TABLE transactions ADD COLUMN balanceBefore DECIMAL(10,2) NOT NULL DEFAULT 0');
            console.log('   Added balanceBefore');
        }
        if (!colNames.includes('balanceAfter')) {
            await conn.execute('ALTER TABLE transactions ADD COLUMN balanceAfter DECIMAL(10,2) NOT NULL DEFAULT 0');
            console.log('   Added balanceAfter');
        }

        // 5. Check advertisers columns
        console.log('5. Checking advertisers table columns...');
        const [advertiserCols] = await conn.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'advertisers'
    `);
        const advertiserColNames = advertiserCols.map(c => c.COLUMN_NAME);

        if (!advertiserColNames.includes('tier')) {
            await conn.execute("ALTER TABLE advertisers ADD COLUMN tier VARCHAR(20) DEFAULT 'basic'");
            console.log('   Added tier to advertisers');
        }
        if (!advertiserColNames.includes('totalSpent')) {
            await conn.execute('ALTER TABLE advertisers ADD COLUMN totalSpent DECIMAL(10,2) DEFAULT 0');
            console.log('   Added totalSpent to advertisers');
        }
        if (!advertiserColNames.includes('balance')) {
            await conn.execute('ALTER TABLE advertisers ADD COLUMN balance DECIMAL(10,2) DEFAULT 0');
            console.log('   Added balance to advertisers');
        }

        // 6. Check tasks columns
        console.log('6. Checking tasks table columns...');
        const [taskCols] = await conn.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tasks'
    `);
        const taskColNames = taskCols.map(c => c.COLUMN_NAME);

        if (!taskColNames.includes('currentCompletions')) {
            await conn.execute('ALTER TABLE tasks ADD COLUMN currentCompletions INT DEFAULT 0');
            console.log('   Added currentCompletions to tasks');
        }
        if (!taskColNames.includes('maxCompletions')) {
            await conn.execute('ALTER TABLE tasks ADD COLUMN maxCompletions INT DEFAULT NULL');
            if (taskColNames.includes('completionsNeeded')) {
                await conn.execute('UPDATE tasks SET maxCompletions = completionsNeeded WHERE maxCompletions IS NULL');
                console.log('   Added maxCompletions (copied from completionsNeeded)');
            } else {
                console.log('   Added maxCompletions to tasks');
            }
        }

        // 7. user_verifications table
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
        console.log('   user_verifications table ready');

        // 8. user_social_profiles table
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
        console.log('   user_social_profiles table ready');

        console.log('\nAll migrations complete!');
    } catch (err) {
        console.error('Migration error:', err.message);
        process.exit(1);
    } finally {
        conn.release();
        await pool.end();
    }
}

run();
