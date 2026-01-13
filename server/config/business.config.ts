/**
 * Business Model Configuration for TaskKash
 * Based on the project constitution and business model
 */

import type { UserTierConfig, AdvertiserTierConfig, LaunchPhaseConfig } from '../types/business';

/**
 * User Tier Configurations
 */
export const USER_TIERS: Record<string, UserTierConfig> = {
  tier1: {
    tier: 'tier1',
    commissionRate: 5,
    paymentSchedule: 'monthly',
    paymentDelay: 720, // 30 days in hours
    minTasksRequired: 0,
    minRatingRequired: 0,
  },
  tier2: {
    tier: 'tier2',
    commissionRate: 10,
    paymentSchedule: 'weekly',
    paymentDelay: 168, // 7 days in hours
    minTasksRequired: 20,
    minRatingRequired: 4.0,
  },
  tier3: {
    tier: 'tier3',
    commissionRate: 20,
    paymentSchedule: 'instant',
    paymentDelay: 3, // 3 hours
    minTasksRequired: 50,
    minRatingRequired: 4.5,
  },
};

/**
 * Advertiser Tier Configurations
 */
export const ADVERTISER_TIERS: Record<string, AdvertiserTierConfig> = {
  tier1: {
    tier: 'tier1',
    commissionRate: 10,
    minMonthlySpend: 0,
    benefits: ['Basic support', 'Standard reporting'],
  },
  tier2: {
    tier: 'tier2',
    commissionRate: 15,
    minMonthlySpend: 1000,
    benefits: ['Priority support', 'Advanced reporting', 'Custom targeting'],
  },
  tier3: {
    tier: 'tier3',
    commissionRate: 20,
    minMonthlySpend: 5000,
    benefits: ['Dedicated account manager', 'Real-time analytics', 'API access'],
  },
  tier4: {
    tier: 'tier4',
    commissionRate: 25,
    minMonthlySpend: 10000,
    benefits: ['Premium support', 'Custom integrations', 'White-label options'],
  },
};

/**
 * Launch Phase Configuration
 * First 3 months: Fixed rates for all users and advertisers
 */
export const LAUNCH_PHASE: LaunchPhaseConfig = {
  isActive: true, // Set to false after 3 months
  userCommissionRate: 5, // 5% fixed for all users
  advertiserCommissionRate: 10, // 10% fixed for all advertisers
  endDate: new Date('2025-05-03'), // 3 months from launch (adjust as needed)
};

/**
 * General Business Constants
 */
export const BUSINESS_CONSTANTS = {
  // Minimum withdrawal amount (USD)
  MIN_WITHDRAWAL_AMOUNT: 100,
  
  // Average task value by year (USD)
  AVERAGE_TASK_VALUE_BY_YEAR: {
    year1: 25,
    year2: 30,
    year3: 35,
    year4: 40,
    year5: 45,
  },
  
  // Platform target margin
  TARGET_PLATFORM_MARGIN: 30, // 30% total margin
  
  // Task completion time limits (hours)
  TASK_COMPLETION_LIMITS: {
    quick: 24, // Quick tasks must be completed within 24 hours
    standard: 72, // Standard tasks within 3 days
    extended: 168, // Extended tasks within 7 days
  },
  
  // Verification time limits (hours)
  VERIFICATION_TIME_LIMIT: 48, // Advertiser must verify within 48 hours
  
  // Auto-approval if advertiser doesn't verify
  AUTO_APPROVE_AFTER_HOURS: 72, // Auto-approve after 72 hours
};

/**
 * Helper function to check if launch phase is active
 */
export function isLaunchPhaseActive(): boolean {
  if (!LAUNCH_PHASE.isActive) return false;
  return new Date() < LAUNCH_PHASE.endDate;
}

/**
 * Helper function to get user tier config
 */
export function getUserTierConfig(tier: string): UserTierConfig {
  return USER_TIERS[tier] || USER_TIERS.tier1;
}

/**
 * Helper function to get advertiser tier config
 */
export function getAdvertiserTierConfig(tier: string): AdvertiserTierConfig {
  return ADVERTISER_TIERS[tier] || ADVERTISER_TIERS.tier1;
}
