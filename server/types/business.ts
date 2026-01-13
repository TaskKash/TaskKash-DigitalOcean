/**
 * Business Model Types for TaskKash
 * Defines the commission structure and tier system
 */

// User Tiers
export type UserTier = 'tier1' | 'tier2' | 'tier3';

// Advertiser Tiers
export type AdvertiserTier = 'tier1' | 'tier2' | 'tier3' | 'tier4';

// Payment Schedule based on User Tier
export type PaymentSchedule = 'monthly' | 'weekly' | 'instant';

/**
 * User Tier Configuration
 * - Tier 1: 5% commission, monthly payment
 * - Tier 2: 10% commission, weekly payment
 * - Tier 3: 20% commission, instant payment (3 hours)
 */
export interface UserTierConfig {
  tier: UserTier;
  commissionRate: number; // Percentage (5, 10, 20)
  paymentSchedule: PaymentSchedule;
  paymentDelay: number; // Hours (720 for monthly, 168 for weekly, 3 for instant)
  minTasksRequired: number; // Minimum tasks to maintain tier
  minRatingRequired: number; // Minimum rating to maintain tier
}

/**
 * Advertiser Tier Configuration
 * - Tier 1: 10% commission
 * - Tier 2: 15% commission
 * - Tier 3: 20% commission
 * - Tier 4: 25% commission
 */
export interface AdvertiserTierConfig {
  tier: AdvertiserTier;
  commissionRate: number; // Percentage (10, 15, 20, 25)
  minMonthlySpend: number; // Minimum monthly spend to qualify for tier (USD)
  benefits: string[]; // Additional benefits for this tier
}

/**
 * Commission Calculation Result
 */
export interface CommissionCalculation {
  taskValue: number; // Original task value
  userCommission: number; // Commission taken from user
  advertiserCommission: number; // Commission taken from advertiser
  userEarnings: number; // What user receives
  advertiserCost: number; // What advertiser pays
  platformRevenue: number; // Total platform revenue (user + advertiser commission)
  platformMargin: number; // Platform margin percentage
}

/**
 * Launch Phase Configuration
 * First 3 months: Fixed rates for all users and advertisers
 */
export interface LaunchPhaseConfig {
  isActive: boolean;
  userCommissionRate: number; // 5% fixed
  advertiserCommissionRate: number; // 10% fixed
  endDate: Date;
}

/**
 * Tier Upgrade/Downgrade Criteria
 */
export interface TierCriteria {
  tasksCompleted: number;
  averageRating: number;
  monthlySpend?: number; // For advertisers only
}
