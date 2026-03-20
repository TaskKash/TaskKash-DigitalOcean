/**
 * Business Model Types for TaskKash
 * Defines the commission structure and tier system
 */

// User Tiers (3-tier Constitution model)
export type UserTier = 'vip' | 'prestige' | 'elite';

// Advertiser Tiers (Constitution: starter, growth, precision, enterprise)
export type AdvertiserTier = 'starter' | 'growth' | 'precision' | 'enterprise';

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
  commissionRate: number; // Placeholder — actual payout commission is per payout speed, not tier
  paymentSchedule: PaymentSchedule;
  paymentDelay: number; // Hours
  minTasksRequired: number; // Tasks required from previous tier to unlock this tier
  minRatingRequired: number; // Minimum approval rate (e.g. 0.9 = 90%)
  maxTaskRewardEGP?: number | null; // Constitution Gap 4: reward ceiling in EGP (null = unlimited)
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
  minMonthlySpend: number; // Minimum monthly spend to qualify for tier (EGP)
  benefits: string[];
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
