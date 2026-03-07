
import "dotenv/config";
import { query } from './server/_core/mysql-db';

async function migrate() {
    try {
        console.log('--- Renaming logo to logoUrl (if not done) ---');
        try {
            await query("ALTER TABLE advertisers CHANGE COLUMN logo logoUrl varchar(500)");
        } catch (e) {
            console.log('logo already renamed or error:', (e as Error).message);
        }

        console.log('--- Updating tasks status enum ---');
        await query("ALTER TABLE tasks MODIFY COLUMN status enum('available','completed','upcoming','active','published') DEFAULT 'available'");

        console.log('--- Creating task_questions table ---');
        await query(`
      CREATE TABLE IF NOT EXISTS task_questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        taskId INT NOT NULL,
        questionText TEXT NOT NULL,
        questionTextAr TEXT,
        questionOrder INT NOT NULL,
        questionType VARCHAR(50) DEFAULT 'multiple_choice',
        optionA TEXT,
        optionAAr TEXT,
        optionB TEXT,
        optionBAr TEXT,
        optionC TEXT,
        optionCAr TEXT,
        optionD TEXT,
        optionDAr TEXT,
        correctAnswer VARCHAR(10),
        explanation TEXT,
        explanationAr TEXT,
        imageUrl TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_questions_task (taskId),
        CONSTRAINT fk_questions_task FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

        console.log('--- Schema Migration Complete ---');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
