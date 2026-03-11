import mysql from "mysql2/promise";

// Singleton connection pool
let _pool: mysql.Pool | null = null;

/**
 * Get the MySQL connection pool (singleton pattern)
 * This ensures all database operations use the same pool with proper connection management
 */
export function getPool(): mysql.Pool {
  if (!_pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("[Database] DATABASE_URL environment variable is not set");
    }
    
    _pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 20,
      maxIdle: 10,
      idleTimeout: 60000,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
    
    console.log('[Database] MySQL connection pool initialized');
    
    // Log pool events for debugging (dev only)
    if (process.env.NODE_ENV === 'development') {
      _pool.on('connection', () => {
        console.log('[Database] New connection established from pool');
      });
      
      _pool.on('release', () => {
        console.log('[Database] Connection released back to pool');
      });
      
      _pool.on('enqueue', () => {
        console.log('[Database] Waiting for available connection slot');
      });
    }
  }
  
  return _pool;
}

/**
 * Execute a query using a pooled connection
 * Automatically handles connection acquisition and release
 */
export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const pool = getPool();
  const [results] = await pool.execute(sql, params);
  return results as T;
}

/**
 * Get a connection from the pool for transaction support
 * IMPORTANT: Always call connection.release() when done
 */
export async function getConnection(): Promise<mysql.PoolConnection> {
  const pool = getPool();
  return pool.getConnection();
}

/**
 * Health check - verify database connectivity
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const pool = getPool();
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error("[Database] Health check failed:", error);
    return false;
  }
}

/**
 * Gracefully close the pool (for shutdown)
 */
export async function closePool(): Promise<void> {
  if (_pool) {
    await _pool.end();
    _pool = null;
    console.log('[Database] Connection pool closed');
  }
}
