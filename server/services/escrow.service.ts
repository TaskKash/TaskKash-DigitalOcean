import { getDb } from '../db';
import { sql } from 'drizzle-orm';
import { calculateCommission } from './commission.service';

/**
 * Escrow Service
 * Manages holding funds when campaigns/tasks are launched and releasing them upon completion.
 */

export interface EscrowHoldParams {
  advertiserId: number;
  amount: number; // in smallest currency unit
  currency: string;
  campaignId?: number;
  taskId?: number;
}

export interface EscrowReleaseParams {
  amountToRelease: number; // The task reward amount
  userId: number;
  advertiserTier?: string;
  userTier?: string;
  taskId?: number;
  campaignId?: number;
}

/**
 * Hold funds in escrow
 * Called when an advertiser launches a campaign or a standalone task.
 */
export async function holdFunds(params: EscrowHoldParams): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const { advertiserId, amount, currency, campaignId, taskId } = params;

  if (!campaignId && !taskId) {
    throw new Error('Must specify either campaignId or taskId to hold funds');
  }

  // Insert into escrow_ledger
  const result = await db.execute(sql`
    INSERT INTO escrow_ledger (advertiserId, campaignId, taskId, amount, currency, status)
    VALUES (${advertiserId}, ${campaignId || null}, ${taskId || null}, ${amount}, ${currency}, 'held')
  `);

  return (result[0] as any).insertId;
}

/**
 * Release funds from escrow to a user
 * Called when a user successfully completes a task.
 * Automatically handles tier-based commission deductions.
 */
export async function releaseFunds(params: EscrowReleaseParams): Promise<{
  payoutAmount: number;
  commissionCalculated: any;
}> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const { amountToRelease, userId, advertiserTier = 'basic', userTier = 'bronze', taskId, campaignId } = params;

  if (!campaignId && !taskId) {
    throw new Error('Must provide either campaignId or taskId to release funds');
  }

  // 1. Get the escrow record
  let condition = campaignId ? sql`campaignId = ${campaignId}` : sql`taskId = ${taskId}`;
  const escrowResult = await db.execute(sql`
    SELECT * FROM escrow_ledger 
    WHERE ${condition} AND status = 'held'
    LIMIT 1
  `);
  
  if ((escrowResult[0] as any).length === 0) {
    throw new Error('Active escrow pool not found for this campaign/task');
  }

  const escrow = (escrowResult[0] as any)[0];
  const { id: escrowId, currency, advertiserId } = escrow;

  // 2. Calculate tier-based commissions on the specific release amount
  const commission = calculateCommission(amountToRelease, userTier, advertiserTier);
  const payoutAmount = Math.round(commission.userEarnings);
  const totalCost = Math.round(commission.advertiserCost);

  // 3. Deduct from escrow pool
  await db.execute(sql`
    UPDATE escrow_ledger 
    SET amount = amount - ${totalCost}
    WHERE id = ${escrowId}
  `);

  // (Optional) Mark as released if amount drops to <= 0 
  await db.execute(sql`
    UPDATE escrow_ledger 
    SET status = 'released', releaseDate = NOW()
    WHERE id = ${escrowId} AND amount <= 0
  `);

  // 4. Update Advertiser's totalSpend
  await db.execute(sql`
    UPDATE advertisers
    SET totalSpend = totalSpend + ${totalCost}
    WHERE id = ${advertiserId}
  `);

  // 5. Update User's balance & totalEarnings
  await db.execute(sql`
    UPDATE users 
    SET balance = balance + ${payoutAmount}, 
        totalEarnings = totalEarnings + ${payoutAmount}
    WHERE id = ${userId}
  `);

  // 6. Record the transaction for the user
  await db.execute(sql`
    INSERT INTO transactions (userId, type, amount, currency, status, taskId, campaignId, description)
    VALUES (${userId}, 'earning', ${payoutAmount}, ${currency}, 'completed', ${taskId || escrow.taskId || null}, ${campaignId || escrow.campaignId || null}, 'Task completion reward (after commission)')
  `);

  return { payoutAmount, commissionCalculated: commission };
}

/**
 * Refund escrowed funds back to the advertiser
 * Called if a campaign is cancelled or expires without being fully completed.
 */
export async function refundFunds(escrowId: number, reason: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const escrowResult = await db.execute(sql`
    SELECT * FROM escrow_ledger WHERE id = ${escrowId} AND status = 'held'
  `);
  
  if ((escrowResult[0] as any).length === 0) {
    throw new Error('Active escrow record not found');
  }

  // Mark as refunded
  await db.execute(sql`
    UPDATE escrow_ledger 
    SET status = 'refunded', reason = ${reason}, releaseDate = NOW()
    WHERE id = ${escrowId}
  `);

  // Note: If you implement a real advertiser wallet balance later,
  // you would add the funds back to their wallet here.
}

/**
 * Get active held balance for an advertiser
 */
export async function getAdvertiserEscrowBalance(advertiserId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.execute(sql`
    SELECT SUM(amount) as totalHeld 
    FROM escrow_ledger 
    WHERE advertiserId = ${advertiserId} AND status = 'held'
  `);

  return (result[0] as any)[0]?.totalHeld || 0;
}
