/**
 * TaskKash Biometric Auto-Deletion Cron Job
 * 
 * This script runs every hour to delete biometric data (selfie images)
 * that are older than 24 hours, as per GDPR compliance requirements.
 * 
 * Schedule: 0 * * * * (every hour)
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Ahmed_1581287@Ahzx',
  database: 'taskkash'
};

// Biometric data retention period (24 hours in milliseconds)
const BIOMETRIC_RETENTION_HOURS = 24;

async function deleteBiometricData() {
  let connection;
  
  try {
    console.log(`[${new Date().toISOString()}] Starting biometric auto-deletion job...`);
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    
    // Calculate cutoff time (24 hours ago)
    const cutoffTime = new Date(Date.now() - (BIOMETRIC_RETENTION_HOURS * 60 * 60 * 1000));
    
    // Find KYC records with biometric data older than 24 hours
    const [records] = await connection.execute(`
      SELECT id, userId, selfieImagePath, biometricHash
      FROM kyc_verifications
      WHERE method = 'biometric_fast'
        AND selfieImagePath IS NOT NULL
        AND biometricDeletedAt IS NULL
        AND createdAt < ?
    `, [cutoffTime]);
    
    console.log(`Found ${records.length} records with biometric data to delete`);
    
    let deletedCount = 0;
    let errorCount = 0;
    
    for (const record of records) {
      try {
        // Delete the selfie image file if it exists
        if (record.selfieImagePath) {
          const imagePath = path.join('/var/www/taskkash/uploads/kyc', record.selfieImagePath);
          try {
            await fs.unlink(imagePath);
            console.log(`Deleted file: ${imagePath}`);
          } catch (fileError) {
            if (fileError.code !== 'ENOENT') {
              console.error(`Error deleting file ${imagePath}:`, fileError.message);
            }
          }
        }
        
        // Update the database record
        await connection.execute(`
          UPDATE kyc_verifications
          SET 
            selfieImagePath = NULL,
            biometricHash = NULL,
            biometricDeletedAt = NOW(),
            updatedAt = NOW()
          WHERE id = ?
        `, [record.id]);
        
        // Log the deletion in audit trail
        await connection.execute(`
          INSERT INTO user_consent_audit 
            (userId, consentType, previousValue, newValue, changeReason, ipAddress, userAgent)
          VALUES 
            (?, 'biometric_auto_delete', 'selfie_stored', 'selfie_deleted', '24-hour auto-deletion per GDPR', 'system', 'cron_job')
        `, [record.userId]);
        
        deletedCount++;
        console.log(`Deleted biometric data for KYC ID: ${record.id}, User ID: ${record.userId}`);
        
      } catch (recordError) {
        errorCount++;
        console.error(`Error processing record ${record.id}:`, recordError.message);
      }
    }
    
    console.log(`[${new Date().toISOString()}] Biometric auto-deletion completed.`);
    console.log(`  - Records processed: ${records.length}`);
    console.log(`  - Successfully deleted: ${deletedCount}`);
    console.log(`  - Errors: ${errorCount}`);
    
    // Also clean up any orphaned files in the uploads directory
    await cleanupOrphanedFiles(connection);
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in biometric auto-deletion:`, error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function cleanupOrphanedFiles(connection) {
  try {
    const uploadsDir = '/var/www/taskkash/uploads/kyc/selfies';
    
    // Check if directory exists
    try {
      await fs.access(uploadsDir);
    } catch {
      console.log('Selfies directory does not exist, skipping orphan cleanup');
      return;
    }
    
    const files = await fs.readdir(uploadsDir);
    const cutoffTime = new Date(Date.now() - (BIOMETRIC_RETENTION_HOURS * 60 * 60 * 1000));
    
    let orphanedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stats = await fs.stat(filePath);
      
      // If file is older than 24 hours, check if it's still referenced
      if (stats.mtime < cutoffTime) {
        const [rows] = await connection.execute(`
          SELECT id FROM kyc_verifications 
          WHERE selfieImagePath LIKE ?
        `, [`%${file}%`]);
        
        if (rows.length === 0) {
          // Orphaned file, delete it
          await fs.unlink(filePath);
          orphanedCount++;
          console.log(`Deleted orphaned file: ${file}`);
        }
      }
    }
    
    if (orphanedCount > 0) {
      console.log(`Cleaned up ${orphanedCount} orphaned selfie files`);
    }
    
  } catch (error) {
    console.error('Error cleaning up orphaned files:', error.message);
  }
}

// Also implement data retention cleanup for other data types
async function runDataRetentionCleanup() {
  let connection;
  
  try {
    console.log(`[${new Date().toISOString()}] Starting data retention cleanup...`);
    
    connection = await mysql.createConnection(dbConfig);
    
    // 1. Delete income SPI data older than 3 years
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
    
    const [incomeResult] = await connection.execute(`
      DELETE FROM user_income_spi
      WHERE createdAt < ? AND retentionExpiresAt < NOW()
    `, [threeYearsAgo]);
    
    console.log(`Deleted ${incomeResult.affectedRows} expired income SPI records`);
    
    // 2. Process approved data deletion requests
    const [deletionRequests] = await connection.execute(`
      SELECT id, userId, dataType
      FROM data_deletion_requests
      WHERE status = 'approved'
        AND processedAt IS NULL
    `);
    
    for (const request of deletionRequests) {
      try {
        if (request.dataType === 'behavioral_only') {
          // Delete profile tier answers
          await connection.execute(`
            DELETE FROM user_profile_tier_answers WHERE userId = ?
          `, [request.userId]);
          
          // Delete income SPI
          await connection.execute(`
            DELETE FROM user_income_spi WHERE userId = ?
          `, [request.userId]);
          
          // Reset user tier
          await connection.execute(`
            UPDATE users SET profileTier = 'bronze' WHERE id = ?
          `, [request.userId]);
          
        } else if (request.dataType === 'income_only') {
          await connection.execute(`
            DELETE FROM user_income_spi WHERE userId = ?
          `, [request.userId]);
          
        } else if (request.dataType === 'full_account') {
          // Full account deletion - anonymize user data
          await connection.execute(`
            UPDATE users SET
              name = CONCAT('Deleted User ', id),
              email = CONCAT('deleted_', id, '@deleted.taskkash.com'),
              phone = NULL,
              avatar = NULL,
              address = NULL,
              fullName = NULL,
              dateOfBirth = NULL,
              nationality = NULL,
              nationalId = NULL
            WHERE id = ?
          `, [request.userId]);
          
          // Delete all profile data
          await connection.execute(`
            DELETE FROM user_profile_tier_answers WHERE userId = ?
          `, [request.userId]);
          
          await connection.execute(`
            DELETE FROM user_income_spi WHERE userId = ?
          `, [request.userId]);
        }
        
        // Mark request as processed
        await connection.execute(`
          UPDATE data_deletion_requests
          SET status = 'completed', processedAt = NOW()
          WHERE id = ?
        `, [request.id]);
        
        console.log(`Processed deletion request ${request.id} for user ${request.userId}`);
        
      } catch (reqError) {
        console.error(`Error processing deletion request ${request.id}:`, reqError.message);
        
        await connection.execute(`
          UPDATE data_deletion_requests
          SET status = 'failed', adminNotes = ?
          WHERE id = ?
        `, [reqError.message, request.id]);
      }
    }
    
    console.log(`[${new Date().toISOString()}] Data retention cleanup completed.`);
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in data retention cleanup:`, error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Main execution
async function main() {
  await deleteBiometricData();
  await runDataRetentionCleanup();
}

main().catch(console.error);
