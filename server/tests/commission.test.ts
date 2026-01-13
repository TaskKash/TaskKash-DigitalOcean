/**
 * Unit Tests for Commission Service
 */

import { calculateCommission } from "../services/commission.service";
import { LAUNCH_PHASE } from "../config/business.config";

// Mock the launch phase status
jest.mock("../config/business.config", () => ({
  ...jest.requireActual("../config/business.config"),
  isLaunchPhaseActive: jest.fn(),
}));

import { isLaunchPhaseActive } from "../config/business.config";

describe("Commission Service", () => {
  describe("Launch Phase", () => {
    beforeEach(() => {
      (isLaunchPhaseActive as jest.Mock).mockReturnValue(true);
    });

    it("should use fixed rates during launch phase", () => {
      const result = calculateCommission(100);
      expect(result.userCommission).toBe(5); // 5% fixed
      expect(result.advertiserCommission).toBe(10); // 10% fixed
      expect(result.userEarnings).toBe(95);
      expect(result.advertiserCost).toBe(110);
      expect(result.platformRevenue).toBe(15);
      expect(result.platformMargin).toBe(15);
    });
  });

  describe("Normal Phase", () => {
    beforeEach(() => {
      (isLaunchPhaseActive as jest.Mock).mockReturnValue(false);
    });

    it("should calculate commission for Tier 1 user and Tier 1 advertiser", () => {
      const result = calculateCommission(100, "tier1", "tier1");
      expect(result.userCommission).toBe(5);
      expect(result.advertiserCommission).toBe(10);
      expect(result.userEarnings).toBe(95);
      expect(result.advertiserCost).toBe(110);
      expect(result.platformRevenue).toBe(15);
      expect(result.platformMargin).toBe(15);
    });

    it("should calculate commission for Tier 3 user and Tier 4 advertiser", () => {
      const result = calculateCommission(100, "tier3", "tier4");
      expect(result.userCommission).toBe(20);
      expect(result.advertiserCommission).toBe(25);
      expect(result.userEarnings).toBe(80);
      expect(result.advertiserCost).toBe(125);
      expect(result.platformRevenue).toBe(45);
      expect(result.platformMargin).toBe(45);
    });

    it("should handle unknown tiers by defaulting to Tier 1", () => {
      const result = calculateCommission(100, "unknown", "unknown");
      expect(result.userCommission).toBe(5);
      expect(result.advertiserCommission).toBe(10);
    });
  });
});
