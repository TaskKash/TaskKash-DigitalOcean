import { eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

// Use connection pool instead of single connection for better reliability
let _pool: mysql.Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

// Initialize the connection pool
function getPool(): mysql.Pool | null {
  if (!_pool && process.env.DATABASE_URL) {
    try {
      _pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 10,
        idleTimeout: 60000,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
      });
      
      // Log pool events for debugging
      _pool.on('connection', () => {
        console.log('[Database] New connection established from pool');
      });
      
      _pool.on('release', () => {
        console.log('[Database] Connection released back to pool');
      });
      
      console.log('[Database] Connection pool initialized successfully');
    } catch (error) {
      console.error("[Database] Failed to create connection pool:", error);
      _pool = null;
    }
  }
  return _pool;
}

// Lazily create the drizzle instance with connection pool
export async function getDb() {
  const pool = getPool();
  
  if (!pool) {
    console.warn("[Database] Connection pool not available");
    return null;
  }
  
  // Always create a fresh drizzle instance with the pool
  // This ensures we use pooled connections that auto-reconnect
  if (!_db) {
    _db = (drizzle as any)(pool);
    console.log('[Database] Drizzle ORM initialized with connection pool');
  }
  
  return _db;
}

// Health check function to verify database connectivity
export async function checkDatabaseHealth(): Promise<boolean> {
  const pool = getPool();
  if (!pool) return false;
  
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error("[Database] Health check failed:", error);
    return false;
  }
}

// Graceful shutdown function
export async function closeDatabasePool(): Promise<void> {
  if (_pool) {
    try {
      await _pool.end();
      console.log('[Database] Connection pool closed gracefully');
    } catch (error) {
      console.error("[Database] Error closing pool:", error);
    }
    _pool = null;
    _db = null;
  }
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmailOrPhone(identifier: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }
  const result = await db.select().from(users).where(
    or(eq(users.email, identifier), eq(users.phone, identifier))
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.
