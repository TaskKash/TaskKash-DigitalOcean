import { Router } from 'express';
import { query } from './mysql-db.js';
import { sdk } from './sdk.js';
import { requireAdvertiser } from './advertiser-routes.js';

const router = Router();

// Privacy Engine Rounding Rules
function roundReach(raw: number): number {
  if (raw < 10000) return Math.floor(raw / 500) * 500;
  return Math.floor(raw / 1000) * 1000;
}

/**
 * Helper to build JSON_CONTAINS conditions dynamically
 */
function buildJsonContains(column: string, values: string[], matchAll: boolean, conditions: string[], params: any[]) {
  if (!values || values.length === 0) return;
  
  if (matchAll) {
    // AND logic
    const clauses: string[] = [];
    values.forEach(val => {
      clauses.push(`JSON_CONTAINS(${column}, ?)`);
      // JSON_CONTAINS expects a JSON string representation, so we wrap the string in double quotes
      params.push(`"${val}"`);
    });
    conditions.push(`(${clauses.join(' AND ')})`);
  } else {
    // OR logic
    const clauses: string[] = [];
    values.forEach(val => {
      clauses.push(`JSON_CONTAINS(${column}, ?)`);
      params.push(`"${val}"`);
    });
    conditions.push(`(${clauses.join(' OR ')})`);
  }
}

/**
 * POST /api/advertiser/segments
 * Advanced 7-Category Segment Builder
 */
router.post('/segments', requireAdvertiser, async (req, res) => {
  try {
    const filters = req.body;
    
    // Strict baseline constraints (Silent Filters)
    const conditions: string[] = [
      'u.kycStatus = ?',
      'u.profileStrength >= ?'
    ];
    const params: any[] = ['verified', filters.profileStrengthMin !== undefined ? filters.profileStrengthMin : 0];

    // Additional Custom Baseline metrics
    if (filters.completedTasksMin !== undefined && filters.completedTasksMin > 0) {
      conditions.push('u.completedTasks >= ?');
      params.push(filters.completedTasksMin);
    }

    // CATEGORY 1: Demographics
    if (filters.ageMin) { conditions.push('u.age >= ?'); params.push(filters.ageMin); }
    if (filters.ageMax) { conditions.push('u.age <= ?'); params.push(filters.ageMax); }
    if (filters.gender && filters.gender !== 'all') { conditions.push('u.gender = ?'); params.push(filters.gender); }
    if (filters.countries && filters.countries.length > 0) {
      const placeholders = filters.countries.map(() => '?').join(', ');
      conditions.push(`u.countryId IN (SELECT id FROM countries WHERE nameEn IN (${placeholders}))`);
      params.push(...filters.countries);
    }
    if (filters.cities && filters.cities.length > 0) {
      const placeholders = filters.cities.map(() => '?').join(', ');
      conditions.push(`(u.city IN (${placeholders}) OR u.city IS NULL OR u.city = '')`);
      params.push(...filters.cities);
    }
    if (filters.districts && filters.districts.length > 0) {
      const placeholders = filters.districts.map(() => '?').join(', ');
      conditions.push(`(u.district IN (${placeholders}) OR u.district IS NULL OR u.district = '')`);
      params.push(...filters.districts);
    }

    // CATEGORY 2: Financial & Income
    if (filters.incomeLevels && filters.incomeLevels.length > 0) {
      const placeholders = filters.incomeLevels.map(() => '?').join(', ');
      conditions.push(`(u.incomeLevel IN (${placeholders}) OR u.incomeLevel IS NULL OR u.incomeLevel = '')`);
      params.push(...filters.incomeLevels);
    }
    if (filters.homeOwnership) {
      conditions.push('up.homeOwnership = ?');
      params.push(filters.homeOwnership);
    }

    // CATEGORY 3: Device & Connectivity
    if (filters.deviceTiers && filters.deviceTiers.length > 0) {
      const placeholders = filters.deviceTiers.map(() => '?').join(', ');
      conditions.push(`(up.deviceTier IN (${placeholders}) OR up.deviceTier IS NULL OR up.deviceTier = '')`);
      params.push(...filters.deviceTiers);
    }
    if (filters.deviceOs) {
      conditions.push('(up.deviceOs = ? OR up.deviceOs IS NULL OR up.deviceOs = \'\')');
      params.push(filters.deviceOs);
    }
    if (filters.networkCarriers && filters.networkCarriers.length > 0) {
      const placeholders = filters.networkCarriers.map(() => '?').join(', ');
      conditions.push(`(up.networkCarrier IN (${placeholders}) OR up.networkCarrier IS NULL OR up.networkCarrier = '')`);
      params.push(...filters.networkCarriers);
    }
    if (filters.deviceModels && filters.deviceModels.length > 0) {
      const placeholders = filters.deviceModels.map(() => '?').join(', ');
      conditions.push(`(up.deviceModel IN (${placeholders}) OR up.deviceModel IS NULL OR up.deviceModel = '')`);
      params.push(...filters.deviceModels);
    }
    if (filters.connectionTypes && filters.connectionTypes.length > 0) {
      const placeholders = filters.connectionTypes.map(() => '?').join(', ');
      conditions.push(`(up.connectionType IN (${placeholders}) OR up.connectionType IS NULL OR up.connectionType = '')`);
      params.push(...filters.connectionTypes);
    }

    // CATEGORY 4: Psychographic
    buildJsonContains('up.interests', filters.interests, filters.interestsMatchAll, conditions, params);
    buildJsonContains('up.brandAffinity', filters.brandAffinity, filters.brandAffinityMatchAll, conditions, params);
    buildJsonContains('up.values', filters.values, filters.valuesMatchAll, conditions, params);
    if (filters.lifeStages && filters.lifeStages.length > 0) {
      const placeholders = filters.lifeStages.map(() => '?').join(', ');
      conditions.push(`(up.lifeStage IN (${placeholders}) OR up.lifeStage IS NULL OR up.lifeStage = '')`);
      params.push(...filters.lifeStages);
    }

    // CATEGORY 5: Behavioral
    if (filters.shoppingFrequencies && filters.shoppingFrequencies.length > 0) {
      const placeholders = filters.shoppingFrequencies.map(() => '?').join(', ');
      conditions.push(`(up.shoppingFrequency IN (${placeholders}) OR up.shoppingFrequency IS NULL OR up.shoppingFrequency = '')`);
      params.push(...filters.shoppingFrequencies);
    }
    buildJsonContains('up.preferredStores', filters.preferredStores, filters.preferredStoresMatchAll, conditions, params);
    buildJsonContains('up.nextPurchaseIntent', filters.nextPurchaseIntent, filters.nextPurchaseIntentMatchAll, conditions, params);
    if (filters.activityPatterns && filters.activityPatterns.length > 0) {
      const placeholders = filters.activityPatterns.map(() => '?').join(', ');
      conditions.push(`(up.activityPattern IN (${placeholders}) OR up.activityPattern IS NULL OR up.activityPattern = '')`);
      params.push(...filters.activityPatterns);
    }

    // CATEGORY 6: Mobility & Household
    if (filters.hasVehicle !== undefined) {
      conditions.push('up.hasVehicle = ?');
      params.push(filters.hasVehicle ? 1 : 0);
    }
    if (filters.vehicleBrands && filters.vehicleBrands.length > 0) {
      const placeholders = filters.vehicleBrands.map(() => '?').join(', ');
      conditions.push(`(up.vehicleBrand IN (${placeholders}) OR up.vehicleBrand IS NULL OR up.vehicleBrand = '')`);
      params.push(...filters.vehicleBrands);
    }
    if (filters.workTypes && filters.workTypes.length > 0) {
      const placeholders = filters.workTypes.map(() => '?').join(', ');
      conditions.push(`(up.workType IN (${placeholders}) OR up.workType IS NULL OR up.workType = '')`);
      params.push(...filters.workTypes);
    }
    if (filters.householdSizeMin) { conditions.push('up.householdSize >= ?'); params.push(filters.householdSizeMin); }
    if (filters.householdSizeMax) { conditions.push('up.householdSize <= ?'); params.push(filters.householdSizeMax); }

    // CATEGORY 7: Engagement Quality
    if (filters.tierMin) {
      let rank = 1;
      if (filters.tierMin === 'silver') rank = 2;
      if (filters.tierMin === 'gold') rank = 3;
      if (filters.tierMin === 'platinum') rank = 4;
      conditions.push('u.tierRank >= ?');
      params.push(rank);
    }
    // Specific exact tiers selected via array
    if (filters.tiers && filters.tiers.length > 0) {
      const placeholders = filters.tiers.map(() => '?').join(', ');
      conditions.push(`(u.tier IN (${placeholders}) OR u.tier IS NULL OR u.tier = '')`);
      params.push(...filters.tiers);
    }
    if (filters.profileStrengthMin) {
      // Must be greater than the baseline 60 and user provided value
      conditions.push('u.profileStrength >= ?');
      params.push(Math.max(60, filters.profileStrengthMin));
    }
    if (filters.completedTasksMin) { conditions.push('u.completedTasks >= ?'); params.push(filters.completedTasksMin); }


    const whereClause = conditions.join(' AND ');

    // Primary Count Query
    const countSql = `
      SELECT COUNT(DISTINCT u.id) as rawCount
      FROM users u
      LEFT JOIN userProfiles up ON u.id = up.userId
      WHERE ${whereClause}
    `;

    const countResult = await query(countSql, params);
    const rawCount = countResult[0]?.rawCount || 0;
    
    // Scale count to simulate the 100,000 user database requested
    const TARGET_DB_COUNT = 100000;
    
    // We treat the current actual eligible baseline (active verified users) as our benchmark for "100k".
    // This perfectly aligns the "no filters" reach with exactly 100,000.
    const maxDbQuery = await query("SELECT COUNT(DISTINCT id) as cnt FROM users WHERE kycStatus = 'verified'", []);
    const ACTIVE_USER_COUNT = maxDbQuery[0]?.cnt || 1;
    
    // Scale count to simulate 100,000 baseline
    const scaleFactor = TARGET_DB_COUNT / ACTIVE_USER_COUNT;
    const scaledRawCount = Math.floor(rawCount * scaleFactor);
    
    const meetsMinimum = scaledRawCount >= 500;
    // Cap at 100,000 to be perfectly accurate, even if there are slight decimal roundings
    const totalReach = roundReach(Math.min(TARGET_DB_COUNT, scaledRawCount));

    if (rawCount === 0) {
      return res.json({
        totalReach: 0,
        rawCount,
        meetsMinimum: false,
        breakdown: {
          byTier: { bronze: 0, silver: 0, gold: 0, platinum: 0 },
          byCountry: {},
          byGender: { male: 0, female: 0 },
          byDeviceTier: { A: 0, B: 0, C: 0 },
          byCarrier: {},
          byBrand: {},
          byIncomeLevel: {},
          byWorkType: {}
        }
      });
    }

    // Breakdown queries using the same exact WHERE clause to guarantee matching datasets
    
    // Tier Breakdown
    const tiersSql = `SELECT u.tier, COUNT(DISTINCT u.id) as cnt FROM users u LEFT JOIN userProfiles up ON u.id = up.userId WHERE ${whereClause} GROUP BY u.tier`;
    const tiersResult = await query(tiersSql, params);
    const byTier: any = { bronze: 0, silver: 0, gold: 0, platinum: 0 };
    tiersResult.forEach((r: any) => { if (r.tier) byTier[r.tier] = Math.floor(r.cnt * scaleFactor); });

    // Gender Breakdown
    const genderSql = `SELECT u.gender, COUNT(DISTINCT u.id) as cnt FROM users u LEFT JOIN userProfiles up ON u.id = up.userId WHERE ${whereClause} GROUP BY u.gender`;
    const genderResult = await query(genderSql, params);
    const byGender: any = { male: 0, female: 0 };
    genderResult.forEach((r: any) => { 
      if (r.gender && (r.gender.toLowerCase() === 'male' || r.gender.toLowerCase() === 'female')) {
        byGender[r.gender.toLowerCase()] = Math.floor(r.cnt * scaleFactor); 
      }
    });

    // Device Tier Breakdown
    const deviceTierSql = `SELECT up.deviceTier, COUNT(DISTINCT u.id) as cnt FROM users u LEFT JOIN userProfiles up ON u.id = up.userId WHERE ${whereClause} AND up.deviceTier IS NOT NULL GROUP BY up.deviceTier`;
    const deviceTierResult = await query(deviceTierSql, params);
    const byDeviceTier: any = { A: 0, B: 0, C: 0 };
    deviceTierResult.forEach((r: any) => { if (r.deviceTier) byDeviceTier[r.deviceTier] = Math.floor(r.cnt * scaleFactor); });

    // Carrier Breakdown
    const carrierSql = `SELECT up.networkCarrier, COUNT(DISTINCT u.id) as cnt FROM users u LEFT JOIN userProfiles up ON u.id = up.userId WHERE ${whereClause} AND up.networkCarrier IS NOT NULL GROUP BY up.networkCarrier`;
    const carrierResult = await query(carrierSql, params);
    const byCarrier: any = {};
    carrierResult.forEach((r: any) => { if (r.networkCarrier) byCarrier[r.networkCarrier] = Math.floor(r.cnt * scaleFactor); });

    // Device Brand Breakdown
    const brandSql = `SELECT up.deviceBrand, COUNT(DISTINCT u.id) as cnt FROM users u LEFT JOIN userProfiles up ON u.id = up.userId WHERE ${whereClause} AND up.deviceBrand IS NOT NULL GROUP BY up.deviceBrand`;
    const brandResult = await query(brandSql, params);
    const byBrand: any = {};
    brandResult.forEach((r: any) => { if (r.deviceBrand) byBrand[r.deviceBrand] = Math.floor(r.cnt * scaleFactor); });

    // Income Level Breakdown
    const incomeSql = `SELECT u.incomeLevel, COUNT(DISTINCT u.id) as cnt FROM users u LEFT JOIN userProfiles up ON u.id = up.userId WHERE ${whereClause} AND u.incomeLevel IS NOT NULL GROUP BY u.incomeLevel`;
    const incomeResult = await query(incomeSql, params);
    const byIncomeLevel: any = {};
    incomeResult.forEach((r: any) => { if (r.incomeLevel) byIncomeLevel[r.incomeLevel] = Math.floor(r.cnt * scaleFactor); });

    // Work Type Breakdown
    const workTypeSql = `SELECT up.workType, COUNT(DISTINCT u.id) as cnt FROM users u LEFT JOIN userProfiles up ON u.id = up.userId WHERE ${whereClause} AND up.workType IS NOT NULL GROUP BY up.workType`;
    const workTypeResult = await query(workTypeSql, params);
    const byWorkType: any = {};
    workTypeResult.forEach((r: any) => { if (r.workType) byWorkType[r.workType] = Math.floor(r.cnt * scaleFactor); });

    // Country Breakdown
    const countrySql = `
      SELECT c.code, COUNT(DISTINCT u.id) as cnt 
      FROM users u 
      LEFT JOIN userProfiles up ON u.id = up.userId 
      LEFT JOIN countries c ON u.countryId = c.id
      WHERE ${whereClause || '1=1'} AND c.code IS NOT NULL
      GROUP BY c.code
    `;
    const countryResult = await query(countrySql, params);
    const byCountry: any = {};
    countryResult.forEach((r: any) => { byCountry[r.code] = Math.floor(r.cnt * scaleFactor); });

    res.json({
      totalReach,
      rawCount, // Internal dev testing visibility
      meetsMinimum,
      breakdown: {
        byTier,
        byCountry,
        byGender,
        byDeviceTier,
        byCarrier,
        byBrand,
        byIncomeLevel,
        byWorkType
      }
    });

  } catch (error: any) {
    console.error('[Advertiser Segments] Error executing 7-category query:', error.stack || error);
    res.status(500).json({ error: 'Failed to evaluate dynamic segments', details: error.message });
  }
});

export default router;
