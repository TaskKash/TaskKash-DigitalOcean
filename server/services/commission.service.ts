/**
 * Commission Calculation Service
 * Handles all commission calculations based on the dual commission model
 */

import type { CommissionCalculation } from '../types/business';
import {
  isLaunchPhaseActive,
  LAUNCH_PHASE,
  getUserTierConfig,
  getAdvertiserTierConfig,
} from '../config/business.config';

/**
 * Calculate commission for a task
 * 
 * @param taskValue - Original task value in USD
 * @param userTier - User's tier (tier1, tier2, tier3)
 * @param advertiserTier - Advertiser's tier (tier1, tier2, tier3, tier4)
 * @returns CommissionCalculation object with all calculated values
 */
export function calculateCommission(
  taskValue: number,
  userTier: string = 'tier1',
  advertiserTier: string = 'tier1'
): CommissionCalculation {
  let userCommissionRate: number;
  let advertiserCommissionRate: number;

  // Check if we're in launch phase (first 3 months)
  if (isLaunchPhaseActive()) {
    // Fixed rates during launch phase
    userCommissionRate = LAUNCH_PHASE.userCommissionRate; // 5%
    advertiserCommissionRate = LAUNCH_PHASE.advertiserCommissionRate; // 10%
  } else {
    // Normal tier-based rates
    const userConfig = getUserTierConfig(userTier);
    const advertiserConfig = getAdvertiserTierConfig(advertiserTier);
    
    userCommissionRate = userConfig.commissionRate;
    advertiserCommissionRate = advertiserConfig.commissionRate;
  }

  // Calculate commissions
  const userCommission = (taskValue * userCommissionRate) / 100;
  const advertiserCommission = (taskValue * advertiserCommissionRate) / 100;

  // Calculate final amounts
  const userEarnings = taskValue - userCommission;
  const advertiserCost = taskValue + advertiserCommission;
  const platformRevenue = userCommission + advertiserCommission;
  const platformMargin = (platformRevenue / taskValue) * 100;

  return {
    taskValue,
    userCommission,
    advertiserCommission,
    userEarnings,
    advertiserCost,
    platformRevenue,
    platformMargin,
  };
}

/**
 * Calculate user earnings after commission
 * 
 * @param taskValue - Original task value
 * @param userTier - User's tier
 * @returns Amount user will receive
 */
export function calculateUserEarnings(taskValue: number, userTier: string = 'tier1'): number {
  const calculation = calculateCommission(taskValue, userTier);
  return calculation.userEarnings;
}

/**
 * Calculate advertiser cost including commission
 * 
 * @param taskValue - Original task value
 * @param advertiserTier - Advertiser's tier
 * @returns Total amount advertiser will pay
 */
export function calculateAdvertiserCost(taskValue: number, advertiserTier: string = 'tier1'): number {
  const calculation = calculateCommission(taskValue, 'tier1', advertiserTier);
  return calculation.advertiserCost;
}

/**
 * Calculate platform revenue from a task
 * 
 * @param taskValue - Original task value
 * @param userTier - User's tier
 * @param advertiserTier - Advertiser's tier
 * @returns Total platform revenue
 */
export function calculatePlatformRevenue(
  taskValue: number,
  userTier: string = 'tier1',
  advertiserTier: string = 'tier1'
): number {
  const calculation = calculateCommission(taskValue, userTier, advertiserTier);
  return calculation.platformRevenue;
}

/**
 * Get commission rates for display purposes
 * 
 * @param userTier - User's tier
 * @param advertiserTier - Advertiser's tier
 * @returns Object with commission rates
 */
export function getCommissionRates(userTier: string = 'tier1', advertiserTier: string = 'tier1') {
  if (isLaunchPhaseActive()) {
    return {
      userRate: LAUNCH_PHASE.userCommissionRate,
      advertiserRate: LAUNCH_PHASE.advertiserCommissionRate,
      isLaunchPhase: true,
    };
  }

  const userConfig = getUserTierConfig(userTier);
  const advertiserConfig = getAdvertiserTierConfig(advertiserTier);

  return {
    userRate: userConfig.commissionRate,
    advertiserRate: advertiserConfig.commissionRate,
    isLaunchPhase: false,
  };
}

/**
 * Calculate batch commission for multiple tasks
 * 
 * @param tasks - Array of task values
 * @param userTier - User's tier
 * @param advertiserTier - Advertiser's tier
 * @returns Total commission calculation
 */
export function calculateBatchCommission(
  tasks: number[],
  userTier: string = 'tier1',
  advertiserTier: string = 'tier1'
): CommissionCalculation {
  const totalTaskValue = tasks.reduce((sum, value) => sum + value, 0);
  return calculateCommission(totalTaskValue, userTier, advertiserTier);
}
