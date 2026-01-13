/**
 * TaskKash Commission Service
 * Handles all commission calculations for the platform
 * 
 * Commission Structure:
 * - Advertiser Commission: 10% (Enterprise), 15% (Premium), 20% (Standard), 25% (Basic)
 * - User Withdrawal Commission: 5% (Tier 3), 10% (Tier 2), 20% (Tier 1)
 */

// Advertiser commission rates by tier
const ADVERTISER_COMMISSION_RATES: { [key: string]: number } = {
  'enterprise': 0.10,  // 10% commission
  'premium': 0.15,     // 15% commission
  'standard': 0.20,    // 20% commission
  'basic': 0.25        // 25% commission
};

// User withdrawal commission rates by tier
const USER_WITHDRAWAL_COMMISSION_RATES: { [key: string]: number } = {
  'tier1': 0.20,  // 20% commission
  'tier2': 0.10,  // 10% commission
  'tier3': 0.05   // 5% commission
};

/**
 * Get advertiser commission rate based on tier
 */
export function getAdvertiserCommissionRate(tier: string): number {
  const normalizedTier = tier?.toLowerCase() || 'basic';
  return ADVERTISER_COMMISSION_RATES[normalizedTier] || ADVERTISER_COMMISSION_RATES['basic'];
}

/**
 * Get user withdrawal commission rate based on tier
 */
export function getUserWithdrawalCommissionRate(tier: string): number {
  const normalizedTier = tier?.toLowerCase() || 'tier1';
  return USER_WITHDRAWAL_COMMISSION_RATES[normalizedTier] || USER_WITHDRAWAL_COMMISSION_RATES['tier1'];
}

/**
 * Calculate advertiser commission for a task
 * @param reward - The reward amount for the task
 * @param advertiserTier - The advertiser's tier level
 * @returns Object with commission details
 */
export function calculateAdvertiserCommission(reward: number, advertiserTier: string): {
  reward: number;
  commissionRate: number;
  commissionAmount: number;
  totalCost: number;
} {
  const commissionRate = getAdvertiserCommissionRate(advertiserTier);
  const commissionAmount = reward * commissionRate;
  const totalCost = reward + commissionAmount;
  
  return {
    reward,
    commissionRate: commissionRate * 100, // Return as percentage
    commissionAmount: Math.round(commissionAmount * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100
  };
}

/**
 * Calculate user withdrawal commission
 * @param amount - The withdrawal amount
 * @param userTier - The user's tier level
 * @returns Object with commission details
 */
export function calculateUserWithdrawalCommission(amount: number, userTier: string): {
  requestedAmount: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
} {
  const commissionRate = getUserWithdrawalCommissionRate(userTier);
  const commissionAmount = amount * commissionRate;
  const netAmount = amount - commissionAmount;
  
  return {
    requestedAmount: amount,
    commissionRate: commissionRate * 100, // Return as percentage
    commissionAmount: Math.round(commissionAmount * 100) / 100,
    netAmount: Math.round(netAmount * 100) / 100
  };
}

/**
 * Calculate total campaign cost for advertiser including commission
 * @param reward - Reward per task completion
 * @param completionsNeeded - Number of completions needed
 * @param advertiserTier - The advertiser's tier level
 * @returns Object with campaign cost details
 */
export function calculateCampaignCost(
  reward: number, 
  completionsNeeded: number, 
  advertiserTier: string
): {
  rewardPerCompletion: number;
  totalRewards: number;
  commissionRate: number;
  totalCommission: number;
  totalCampaignCost: number;
  minimumBudget: number;
} {
  const commissionRate = getAdvertiserCommissionRate(advertiserTier);
  const totalRewards = reward * completionsNeeded;
  const totalCommission = totalRewards * commissionRate;
  const totalCampaignCost = totalRewards + totalCommission;
  const minimumBudget = totalCampaignCost * 0.2; // 20% minimum budget
  
  return {
    rewardPerCompletion: reward,
    totalRewards: Math.round(totalRewards * 100) / 100,
    commissionRate: commissionRate * 100, // Return as percentage
    totalCommission: Math.round(totalCommission * 100) / 100,
    totalCampaignCost: Math.round(totalCampaignCost * 100) / 100,
    minimumBudget: Math.round(minimumBudget * 100) / 100
  };
}

export default {
  getAdvertiserCommissionRate,
  getUserWithdrawalCommissionRate,
  calculateAdvertiserCommission,
  calculateUserWithdrawalCommission,
  calculateCampaignCost
};
