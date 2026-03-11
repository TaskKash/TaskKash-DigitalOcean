/**
 * Wallet Management Service
 * Handles user wallet operations, balance, and transactions
 */

import { getDb } from '../db';
import { users, transactions } from '../../drizzle/schema';
import { eq, and, sql } from 'drizzle-orm';
import { BUSINESS_CONSTANTS } from '../config/business.config';

/**
 * Get user wallet balance
 * 
 * @param userId - User ID
 * @returns Current balance
 */
export async function getUserBalance(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || user.length === 0) throw new Error('User not found');

  return user[0].balance || 0;
}

/**
 * Add funds to user wallet
 * 
 * @param userId - User ID
 * @param amount - Amount to add
 * @param description - Transaction description
 * @param relatedTaskId - Related task ID (optional)
 * @returns New balance
 */
export async function addFunds(
  userId: number,
  amount: number,
  description: string,
  relatedTaskId?: number
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Atomic increment — avoids read-compute-write race condition
  await db
    .update(users)
    .set({
      balance: sql`${users.balance} + ${amount}`,
      totalEarnings: sql`COALESCE(totalEarnings, 0) + ${amount}`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  // Read back the updated balance
  const updated = await db.select({ balance: users.balance }).from(users).where(eq(users.id, userId)).limit(1);
  if (!updated || updated.length === 0) throw new Error('User not found');
  const newBalance = updated[0].balance ?? 0;
  const currentBalance = newBalance - amount;

  // Create transaction record
  await db.insert(transactions).values({
    userId,
    type: 'credit',
    amount,
    balanceBefore: currentBalance,
    balanceAfter: newBalance,
    description,
    taskId: relatedTaskId,
    status: 'completed',
    createdAt: new Date(),
  });

  return newBalance;
}

/**
 * Deduct funds from user wallet
 * 
 * @param userId - User ID
 * @param amount - Amount to deduct
 * @param description - Transaction description
 * @param relatedTaskId - Related task ID (optional)
 * @returns New balance
 */
export async function deductFunds(
  userId: number,
  amount: number,
  description: string,
  relatedTaskId?: number
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Atomic decrement with guard — prevents balance going negative under concurrency
  const result = await db
    .update(users)
    .set({
      balance: sql`${users.balance} - ${amount}`,
      updatedAt: new Date(),
    })
    .where(and(eq(users.id, userId), sql`${users.balance} >= ${amount}`));

  if ((result as any).affectedRows === 0) {
    throw new Error('Insufficient balance');
  }

  // Read back updated balance
  const updated = await db.select({ balance: users.balance }).from(users).where(eq(users.id, userId)).limit(1);
  const newBalance = updated[0]?.balance ?? 0;
  const balanceBefore = newBalance + amount;

  await db.insert(transactions).values({
    userId,
    type: 'debit',
    amount,
    balanceBefore,
    balanceAfter: newBalance,
    description,
    taskId: relatedTaskId,
    status: 'completed',
    createdAt: new Date(),
  });

  return newBalance;
}

/**
 * Request withdrawal
 * 
 * @param userId - User ID
 * @param amount - Amount to withdraw
 * @param method - Withdrawal method (vodafone_cash, instapay, fawry, bank_transfer)
 * @param accountDetails - Account details for withdrawal
 * @returns Transaction ID
 */
export async function requestWithdrawal(
  userId: number,
  amount: number,
  method: string,
  accountDetails: string
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Check minimum withdrawal amount
  if (amount < BUSINESS_CONSTANTS.MIN_WITHDRAWAL_AMOUNT) {
    throw new Error(`Minimum withdrawal amount is $${BUSINESS_CONSTANTS.MIN_WITHDRAWAL_AMOUNT}`);
  }

  // Get current balance
  const currentBalance = await getUserBalance(userId);

  // Check if sufficient balance
  if (currentBalance < amount) {
    throw new Error('Insufficient balance');
  }

  // Create pending withdrawal transaction
  const result = await db.insert(transactions).values({
    userId,
    type: 'withdrawal',
    amount,
    balanceBefore: currentBalance,
    balanceAfter: currentBalance, // Balance not updated until withdrawal is processed
    description: `Withdrawal request via ${method}`,
    status: 'pending',
    metadata: JSON.stringify({ method, accountDetails }),
    createdAt: new Date(),
  });

  return result.insertId;
}

/**
 * Process withdrawal (Admin function)
 * 
 * @param transactionId - Transaction ID
 * @param status - 'completed' or 'rejected'
 * @param note - Processing note
 * @returns Success status
 */
export async function processWithdrawal(
  transactionId: number,
  status: 'completed' | 'rejected',
  note?: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get transaction
  const transaction = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, transactionId))
    .limit(1);

  if (!transaction || transaction.length === 0) {
    throw new Error('Transaction not found');
  }

  const txn = transaction[0];

  if (txn.type !== 'withdrawal' || txn.status !== 'pending') {
    throw new Error('Invalid transaction for processing');
  }

  if (status === 'completed') {
    // Atomic deduction with guard — ensures user still has the balance at approval time
    const deductResult = await db
      .update(users)
      .set({
        balance: sql`${users.balance} - ${txn.amount}`,
        updatedAt: new Date(),
      })
      .where(and(eq(users.id, txn.userId), sql`${users.balance} >= ${txn.amount}`));

    if ((deductResult as any).affectedRows === 0) {
      // User no longer has sufficient balance — auto-reject
      await db
        .update(transactions)
        .set({
          status: 'cancelled',
          processedAt: new Date(),
          note: 'Auto-cancelled: insufficient balance at approval time',
        })
        .where(eq(transactions.id, transactionId));
      throw new Error('Insufficient balance — withdrawal auto-rejected');
    }

    // Read back new balance
    const updated = await db.select({ balance: users.balance }).from(users).where(eq(users.id, txn.userId)).limit(1);
    const newBalance = updated[0]?.balance ?? 0;

    await db
      .update(transactions)
      .set({
        status: 'completed',
        processedAt: new Date(),
        note,
      })
      .where(eq(transactions.id, transactionId));
  } else {
    // Reject withdrawal
    await db
      .update(transactions)
      .set({
        status: 'cancelled',
        processedAt: new Date(),
        note,
      })
      .where(eq(transactions.id, transactionId));
  }

  return true;
}

/**
 * Get user transaction history
 * 
 * @param userId - User ID
 * @param limit - Number of transactions to return
 * @returns Array of transactions
 */
export async function getTransactionHistory(userId: number, limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(sql`${transactions.createdAt} DESC`)
    .limit(Math.min(limit, 200)) // cap at 200
    .offset(offset);
}

/**
 * Get pending withdrawals (Admin function)
 * 
 * @returns Array of pending withdrawal transactions
 */
export async function getPendingWithdrawals() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.type, 'withdrawal'),
        eq(transactions.status, 'pending')
      )
    )
    .orderBy(sql`${transactions.createdAt} ASC`);
}

/**
 * Calculate total earnings for a user
 * 
 * @param userId - User ID
 * @returns Total earnings
 */
export async function getTotalEarnings(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db
    .select({
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'earning'),
        eq(transactions.status, 'completed')
      )
    );

  return result[0]?.total || 0;
}

/**
 * Calculate total withdrawals for a user
 * 
 * @param userId - User ID
 * @returns Total withdrawals
 */
export async function getTotalWithdrawals(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db
    .select({
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'withdrawal'),
        eq(transactions.status, 'completed')
      )
    );

  return result[0]?.total || 0;
}
