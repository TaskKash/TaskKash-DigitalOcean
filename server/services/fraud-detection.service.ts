import { query as mysqlQuery } from '../_core/mysql-db';

interface FraudCheckContext {
  userId: number;
  campaignId: number;
  taskCompletionId?: number;
  watchTime?: number;    // seconds user spent watching
  expectedDuration?: number; // expected minutes
  score?: number;
}

export const FraudDetectionService = {
  /**
   * Run all fraud detection rules for a task completion event
   * Creates records in fraud_flags if suspicious activity is found
   */
  async analyzeTaskCompletion(context: FraudCheckContext): Promise<boolean> {
    const { userId, campaignId, taskCompletionId, watchTime, expectedDuration = 0, score } = context;
    let isFraudulent = false;

    try {
      // 1. Check Rapid Completion (Video Tasks)
      // If watched for less than 10% of expected duration but somehow passed
      if (watchTime !== undefined && expectedDuration > 0) {
        const expectedSeconds = expectedDuration * 60;
        if (watchTime < expectedSeconds * 0.1 && (score === undefined || score >= 80)) {
          await this.flagFraud(userId, 'rapid_completion', 'high', {
            watchTime,
            expectedSeconds,
            score,
            campaignId,
            taskCompletionId
          });
          isFraudulent = true;
        }
      }

      // 2. Check Suspicious Activity Velocity (Too many tasks in short time)
      // Query recent completions
      const recentCompletions = await mysqlQuery(`
        SELECT COUNT(*) as count 
        FROM task_submissions 
        WHERE userId = ? AND createdAt > DATE_SUB(NOW(), INTERVAL 1 HOUR)
      `, [userId]) as any;

      if (recentCompletions && recentCompletions[0]?.count > 30) {
        await this.flagFraud(userId, 'suspicious_activity', 'critical', {
          reason: 'Excessive completion velocity',
          countPerHour: recentCompletions[0].count,
          campaignId,
          taskCompletionId
        });
        isFraudulent = true; // For high volume, we definitely want to flag
      }

      // 3. Check for multiple accounts (Velocity of completions from same user on SAME task if not allowed)
      const sameTaskCompletions = await mysqlQuery(`
        SELECT COUNT(*) as count 
        FROM task_submissions 
        WHERE userId = ? AND taskId = ?
      `, [userId, campaignId]) as any;

      if (sameTaskCompletions && sameTaskCompletions[0]?.count > 3) {
         // Even if multiple completions are allowed, > 3 is suspicious for most regular tasks
         await this.flagFraud(userId, 'multiple_accounts', 'medium', {
           reason: 'Repeated task completion',
           count: sameTaskCompletions[0].count,
           campaignId,
           taskCompletionId
         });
         // Don't auto-fail for this, let admin review
      }

      return isFraudulent;
    } catch (error) {
      console.error('[Fraud Detection Engine] Error analyzing completion:', error);
      return false; // Fail open to not block legitimate users if the engine crashes
    }
  },

  /**
   * Insert a fraud flag into the database
   */
  async flagFraud(userId: number, flagType: string, severity: string, details: any = {}) {
    try {
      await mysqlQuery(`
        INSERT INTO fraud_flags 
        (userId, taskCompletionId, campaignId, flagType, severity, details, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
      `, [
        userId, 
        details.taskCompletionId || null, 
        details.campaignId || null, 
        flagType, 
        severity, 
        JSON.stringify(details)
      ]);
      console.warn(`[Fraud Detection] Flagged user ${userId} for ${flagType} (${severity})`);
    } catch (error) {
      console.error('[Fraud Detection] Error saving fraud flag:', error);
    }
  }
};
