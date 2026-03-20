/**
 * Business Model Configuration for TaskKash
 * Based on the TaskKash Constitution (Tiers_Vs_Commission.docx)
 * 
 * Currency: Egyptian Pounds (EGP)
 * Exchange Rate Basis: 1 USD = 52 EGP
 * 
 * KEY ARCHITECTURAL RULE:
 * - User TIERS control which tasks they can ACCESS (by reward ceiling & task type).
 * - PAYOUT SPEED is a completely separate, decoupled service chosen per-withdrawal.
 * - Payout commission is NOT tied to the user's tier.
 */

import type { UserTierConfig, AdvertiserTierConfig, LaunchPhaseConfig } from '../types/business';

// ─────────────────────────────────────────────
// USER TIER CONFIGURATIONS (3-Tier Model)
// ─────────────────────────────────────────────
export const USER_TIERS: Record<string, UserTierConfig> = {
  /**
   * Level 1: Novice / Basic Player
   * Onboarding tier. Limited to simple digital tasks.
   * Must complete 5 tasks to unlock Level 2.
   */
  vip: {
    tier: 'vip',
    commissionRate: 5, // Placeholder — commission is now per payout speed, NOT tier
    paymentSchedule: 'monthly',
    paymentDelay: 720, // 30 days in hours (default if they choose Standard payout)
    minTasksRequired: 0,
    minRatingRequired: 0,
    maxTaskRewardEGP: 50, // CONSTITUTION GAP 4: Reward ceiling for Level 1 users (50 EGP ~ $1)
  },

  /**
   * Level 2: Verified Contributor
   * Requires phone SMS verification + 5 completed Novice tasks.
   * Must complete 15 tasks with >90% approval to unlock Level 3.
   */
  prestige: {
    tier: 'prestige',
    commissionRate: 10, // Placeholder — commission is now per payout speed, NOT tier
    paymentSchedule: 'weekly',
    paymentDelay: 168, // 7 days in hours
    minTasksRequired: 5, // CONSTITUTION GAP 2: Exactly 5 tasks from Level 1 to reach Level 2
    minRatingRequired: 0,
    maxTaskRewardEGP: 260, // Unlocks medium tasks (~$5 max reward)
  },

  /**
   * Level 3: Elite Field Agent
   * Requires National ID + Biometric verification + 15 tasks at >90% approval from Level 2.
   * Unlimited access to all physical and enterprise tasks.
   */
  elite: {
    tier: 'elite',
    commissionRate: 20, // Placeholder — commission is now per payout speed, NOT tier
    paymentSchedule: 'instant',
    paymentDelay: 3, // 3 hours (for Flash payouts)
    minTasksRequired: 15, // CONSTITUTION GAP 2: Exactly 15 tasks from Level 2 to reach Level 3
    minRatingRequired: 0.9, // CONSTITUTION RULE: >90% approval rate required
    maxTaskRewardEGP: null, // No ceiling — unlimited earning potential
  },
};

// ─────────────────────────────────────────────
// DECOUPLED PAYOUT SPEED SERVICE
// Constitution Gap 6: Commission is based on SPEED CHOSEN, not user tier.
// Any user (even Novice) can withdraw at any speed.
// ─────────────────────────────────────────────
export const PAYOUT_SPEEDS = {
  /** Standard (Monthly): 5% fee. Processed on the 21st of every month. */
  standard: {
    key: 'standard',
    feePercent: 5,
    processingDays: 'monthly', // Processed on 21st of the month
    labelEn: 'Standard (Monthly)',
    labelAr: 'قياسي (شهري)',
  },
  /** Express (Weekly): 10% fee. Processed every Monday. */
  express: {
    key: 'express',
    feePercent: 10,
    processingDays: 'weekly', // Every Monday
    labelEn: 'Express (Weekly)',
    labelAr: 'سريع (أسبوعي)',
  },
  /** Flash (Instant): 20% fee. Disbursed within 3 hours. */
  flash: {
    key: 'flash',
    feePercent: 20,
    processingDays: 'instant', // Within 3 hours
    labelEn: 'Flash (Instant)',
    labelAr: 'فوري',
  },
};

// ─────────────────────────────────────────────
// ADVERTISER TIER CONFIGURATIONS
// Constitution Gap 9: All values re-stated in EGP (1 USD = 52 EGP)
// ─────────────────────────────────────────────
export const ADVERTISER_TIERS: Record<string, AdvertiserTierConfig> = {
  /**
   * Tier 1: Starter / Self-Serve
   * Commission: 10%
   * Minimum Campaign Spend: 50,000 EGP (~$1,000)
   * Constitution Part 1, Tier 1
   */
  starter: {
    tier: 'starter',
    commissionRate: 10,
    minMonthlySpend: 50000, // 50,000 EGP
    benefits: [
      'Basic Email Support (24-48h SLA)',
      'Standard aggregated metrics',
      'Basic demographic targeting',
      'Access to Tier 1 task types (Video, Quiz, Social Media)',
    ],
  },
  /**
   * Tier 2: Growth / Advanced
   * Commission: 15%
   * Minimum Campaign Spend: 130,000 EGP
   * Constitution Part 1, Tier 2
   */
  growth: {
    tier: 'growth',
    commissionRate: 15,
    minMonthlySpend: 250000, // 250,000 EGP
    benefits: [
      'Priority Email & Live Chat Support',
      'Graphical dashboard with demographic segmentation',
      'Advanced behavioral targeting (OS, Income, Education)',
      'Access to Tier 2 task types (Surveys, App Installs, Extended Videos)',
    ],
  },
  /**
   * Tier 3: Precision / Pro
   * Commission: 20%
   * Minimum Campaign Spend: 260,000 EGP
   * Constitution Part 1, Tier 3
   */
  precision: {
    tier: 'precision',
    commissionRate: 20,
    minMonthlySpend: 500000, // 500,000 EGP
    benefits: [
      'Dedicated Account Manager (Business Hours)',
      'Real-time telemetry, Heatmaps & AI insights',
      'Hyper-local targeting (Neighborhood, Device Model)',
      'Access to Tier 3 task types (GPS Visits, Photo Tasks, Product Reviews)',
    ],
  },
  /**
   * Tier 4: Enterprise / Managed
   * Commission: 25%+
   * Minimum Campaign Spend: 520,000 EGP
   * Constitution Part 1, Tier 4
   */
  enterprise: {
    tier: 'enterprise',
    commissionRate: 25,
    minMonthlySpend: 1000000, // 1,000,000 EGP
    benefits: [
      '24/7 Priority Support + Custom Integration Engineering',
      'Raw Data API stream to advertiser BI tool',
      'Zero-Fraud Financial SLA Guarantee',
      'Access to ALL task types (Mystery Shopping, UGC, Lead Gen)',
    ],
  },
};

// ─────────────────────────────────────────────
// LAUNCH PHASE CONFIGURATION
// ─────────────────────────────────────────────
export const LAUNCH_PHASE: LaunchPhaseConfig = {
  isActive: false, // Platform has passed initial launch phase
  userCommissionRate: 5,
  advertiserCommissionRate: 10,
  endDate: new Date('2026-06-01'),
};

// ─────────────────────────────────────────────
// GENERAL BUSINESS CONSTANTS (EGP-based)
// ─────────────────────────────────────────────
export const BUSINESS_CONSTANTS = {
  // Minimum withdrawal amount in EGP — strictly 500 EGP
  MIN_WITHDRAWAL_AMOUNT_EGP: 500,

  // EGP Exchange Rate reference (for UI display / future re-indexing)
  EGP_TO_USD_RATE: 52,

  // Task Reward Ceilings per User Tier (EGP) — Constitution Gap 4
  TASK_REWARD_CEILINGS_EGP: {
    vip: 50,       // ~$1 max per task for Level 1 users
    prestige: 260, // ~$5 max per task for Level 2 users
    elite: null,      // No ceiling for Level 3 users
  },

  // Minimum approval rating to advance from Level 2 → Level 3
  LEVEL3_MIN_APPROVAL_RATE: 0.90, // 90%

  // Inactivity downgrade threshold (Constitution Gap 8)
  ELITE_INACTIVITY_DOWNGRADE_DAYS: 180, // 6 months

  // Task completion time limits (hours)
  TASK_COMPLETION_LIMITS: {
    quick: 24,
    standard: 72,
    extended: 168,
  },

  // Verification time limits (hours)
  VERIFICATION_TIME_LIMIT: 48,
  AUTO_APPROVE_AFTER_HOURS: 72,
};

// ─────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────

/** Check if launch phase is still active */
export function isLaunchPhaseActive(): boolean {
  if (!LAUNCH_PHASE.isActive) return false;
  return new Date() < LAUNCH_PHASE.endDate;
}

/** Get the full user tier configuration */
export function getUserTierConfig(tier: string): UserTierConfig {
  return USER_TIERS[tier] || USER_TIERS.vip;
}

/** Get the full advertiser tier configuration */
export function getAdvertiserTierConfig(tier: string): AdvertiserTierConfig {
  return ADVERTISER_TIERS[tier] || ADVERTISER_TIERS.starter;
}

/** Get payout speed configuration */
export function getPayoutSpeedConfig(speed: 'standard' | 'express' | 'flash') {
  return PAYOUT_SPEEDS[speed] || PAYOUT_SPEEDS.standard;
}

/** Check if a user's reward ceiling allows a given task reward */
export function isTaskRewardAllowed(userTier: string, taskRewardEGP: number): boolean {
  const config = getUserTierConfig(userTier);
  if ((config as any).maxTaskRewardEGP === null) return true; // Elite: no ceiling
  return taskRewardEGP <= ((config as any).maxTaskRewardEGP || 50);
}
