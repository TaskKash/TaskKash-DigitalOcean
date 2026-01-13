/**
 * MySQL Database Connection Module
 * Provides connection pooling and query helpers for MySQL database
 */

import mysql from 'mysql2/promise';

// Create connection pool
// Parse DATABASE_URL or use individual env vars
const getDatabaseConfig = () => {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    // Parse mysql://user:pass@host:port/database
    const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (match) {
      return {
        host: match[3],
        user: match[1],
        password: match[2],
        database: match[5],
        port: parseInt(match[4])
      };
    }
  }
  // Fallback to individual env vars
  return {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'taskkash_user',
    password: process.env.DB_PASSWORD || 'TaskKash2025Secure',
    database: process.env.DB_NAME || 'taskkash',
    port: parseInt(process.env.DB_PORT || '3306')
  };
};

const pool = mysql.createPool({
  ...getDatabaseConfig(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Execute a query and return results
 */
export async function query(sql: string, params?: any[]) {
  const [results] = await pool.execute(sql, params);
  return results;
}

/**
 * Get a connection from the pool
 */
export async function getConnection() {
  return await pool.getConnection();
}

/**
 * Close the pool (for graceful shutdown)
 */
export async function closePool() {
  await pool.end();
}

export default { query, getConnection, closePool };
