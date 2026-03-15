import { Router } from 'express';
import { query } from './mysql-db.js';
import { sdk } from './sdk.js';

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
router.post('/segments', async (req, res) => {
  try {
    const authUser = await sdk.authenticateRequest(req);
    if (!authUser || !authUser.openId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const filters = req.body;
    
    // Strict baseline constraints (Silent Filters)
    const conditions: string[] = [
      'u.kycStatus = ?',
      'u.profileStrength >= ?'
    ];
    const params: any[] = ['verified', 60];

    // CATEGORY 1: Demographics
    if (filters.ageMin) { conditions.push('u.age >= ?'); params.push(filters.ageMin); }
    if (filters.ageMax) { conditions.push('u.age <= ?'); params.push(filters.ageMax); }
    if (filters.gender && filters.gender !== 'all') { conditions.push('u.gender = ?'); params.push(filters.gender); }
    if (filters.countries && filters.countries.length > 0) {
      const placeholders = filters.countries.map(() => '?').join(', ');
      conditions.push(`u.countryId IN (SELECT id FROM countries WHERE code IN (${placeholders}))`);
      params.push(...filters.countries);
    }
    if (filters.cities && filters.cities.length > 0) {
      const placeholders = filters.cities.map(() => '?').join(', ');
      conditions.push(`u.city IN (${placeholders})`);
      params.push(...filters.cities);
    }
    if (filters.districts && filters.districts.length > 0) {
      const placeholders = filters.districts.map(() => '?').join(', ');
      conditions.push(`u.district IN (${placeholders})`);
      params.push(...filters.districts);
    }

    // CATEGORY 2: Financial & Income
    if (filters.incomeLevels && filters.incomeLevels.length > 0) {
      const placeholders = filters.incomeLevels.map(() => '?').join(', ');
      conditions.push(`u.incomeLevel IN (${placeholders})`);
      params.push(...filters.incomeLevels);
    }
    if (filters.homeOwnership) {
      conditions.push('up.homeOwnership = ?');
      params.push(filters.homeOwnership);
    }

    // CATEGORY 3: Device & Connectivity
    if (filters.deviceTiers && filters.deviceTiers.length > 0) {
      const placeholders = filters.deviceTiers.map(() => '?').join(', ');
      conditions.push(`up.deviceTier IN (${placeholders})`);
      params.push(...filters.deviceTiers);
    }
    if (filters.deviceOs) {
      conditions.push('up.deviceOs = ?');
      params.push(filters.deviceOs);
    }
    if (filters.networkCarriers && filters.networkCarriers.length > 0) {
      const placeholders = filters.networkCarriers.map(() => '?').join(', ');
      conditions.push(`up.networkCarrier IN (${placeholders})`);
      params.push(...filters.networkCarriers);
    }
    if (filters.deviceModels && filters.deviceModels.length > 0) {
      const placeholders = filters.deviceModels.map(() => '?').join(', ');
      conditions.push(`up.deviceModel IN (${placeholders})`);
      params.push(...filters.deviceModels);
    }
    if (filters.connectionTypes && filters.connectionTypes.length > 0) {
      const placeholders = filters.connectionTypes.map(() => '?').join(', ');
      conditions.push(`up.connectionType IN (${placeholders})`);
      params.push(...filters.connectionTypes);
    }

    // CATEGORY 4: Psychographic
    buildJsonContains('up.interests', filters.interests, filters.interestsMatchAll, conditions, params);
    buildJsonContains('up.brandAffinity', filters.brandAffinity, filters.brandAffinityMatchAll, conditions, params);
    buildJsonContains('up.values', filters.values, filters.valuesMatchAll, conditions, params);
    if (filters.lifeStages && filters.lifeStages.length > 0) {
      const placeholders = filters.lifeStages.map(() => '?').join(', ');
      conditions.push(`up.lifeStage IN (${placeholders})`);
      params.push(...filters.lifeStages);
    }

    // CATEGORY 5: Behavioral
    if (filters.shoppingFrequencies && filters.shoppingFrequencies.length > 0) {
      const placeholders = filters.shoppingFrequencies.map(() => '?').join(', ');
      conditions.push(`up.shoppingFrequency IN (${placeholders})`);
      params.push(...filters.shoppingFrequencies);
    }
    buildJsonContains('up.preferredStores', filters.preferredStores, filters.preferredStoresMatchAll, conditions, params);
    buildJsonContains('up.nextPurchaseIntent', filters.nextPurchaseIntent, filters.nextPurchaseIntentMatchAll, conditions, params);
    if (filters.activityPatterns && filters.activityPatterns.length > 0) {
      const placeholders = filters.activityPatterns.map(() => '?').join(', ');
      conditions.push(`up.activityPattern IN (${placeholders})`);
      params.push(...filters.activityPatterns);
    }

    // CATEGORY 6: Mobility & Household
    if (filters.hasVehicle !== undefined) {
      conditions.push('up.hasVehicle = ?');
      params.push(filters.hasVehicle ? 1 : 0);
    }
    if (filters.vehicleBrands && filters.vehicleBrands.length > 0) {
      const placeholders = filters.vehicleBrands.map(() => '?').join(', ');
      conditions.push(`up.vehicleBrand IN (${placeholders})`);
      params.push(...filters.vehicleBrands);
    }
    if (filters.workTypes && filters.workTypes.length > 0) {
      const placeholders = filters.workTypes.map(() => '?').join(', ');
      conditions.push(`up.workType IN (${placeholders})`);
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
      conditions.push(`u.tier IN (${placeholders})`);
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
    
    const meetsMinimum = rawCount >= 500;
    const totalReach = roundReach(rawCount);

    if (rawCount === 0) {
      return res.json({
        totalReach: 0,
        rawCount,
        meetsMinimum: false,
        breakdown: {
          byTier: { bronze: 0, silver: 0, gold: 0, platinum: 0 },
          byCountry: {},
          byGender: { male: 0, female: 0 },
          byDeviceTier: { A: 0, B: 0, C: 0 }
        }
      });
    }

    // Breakdown queries using the same exact WHERE clause to guarantee matching datasets
    
    // Tier Breakdown
    const tiersSql = `SELECT u.tier, COUNT(DISTINCT u.id) as cnt FROM users u LEFT JOIN userProfiles up ON u.id = up.userId WHERE ${whereClause} GROUP BY u.tier`;
    const tiersResult = await query(tiersSql, params);
    const byTier: any = { bronze: 0, silver: 0, gold: 0, platinum: 0 };
    tiersResult.forEach((r: any) => { if (r.tier) byTier[r.tier] = r.cnt; });

    // Gender Breakdown
    const genderSql = `SELECT u.gender, COUNT(DISTINCT u.id) as cnt FROM users u LEFT JOIN userProfiles up ON u.id = up.userId WHERE ${whereClause} GROUP BY u.gender`;
    const genderResult = await query(genderSql, params);
    const byGender: any = { male: 0, female: 0 };
    genderResult.forEach((r: any) => { 
      if (r.gender && (r.gender.toLowerCase() === 'male' || r.gender.toLowerCase() === 'female')) {
        byGender[r.gender.toLowerCase()] = r.cnt; 
      }
    });

    // Device Tier Breakdown
    const deviceTierSql = `SELECT up.deviceTier, COUNT(DISTINCT u.id) as cnt FROM users u LEFT JOIN userProfiles up ON u.id = up.userId WHERE ${whereClause} AND up.deviceTier IS NOT NULL GROUP BY up.deviceTier`;
    const deviceTierResult = await query(deviceTierSql, params);
    const byDeviceTier: any = { A: 0, B: 0, C: 0 };
    deviceTierResult.forEach((r: any) => { if (r.deviceTier) byDeviceTier[r.deviceTier] = r.cnt; });

    // Country Breakdown
    const countrySql = `
      SELECT c.code, COUNT(DISTINCT u.id) as cnt 
      FROM users u 
      LEFT JOIN userProfiles up ON u.id = up.userId 
      LEFT JOIN countries c ON u.countryId = c.id
      WHERE ${whereClause} AND c.code IS NOT NULL
      GROUP BY c.code
    `;
    const countryResult = await query(countrySql, params);
    const byCountry: any = {};
    countryResult.forEach((r: any) => { byCountry[r.code] = r.cnt; });

    res.json({
      totalReach,
      rawCount, // Internal dev testing visibility
      meetsMinimum,
      breakdown: {
        byTier,
        byCountry,
        byGender,
        byDeviceTier
      }
    });

  } catch (error) {
    console.error('[Advertiser Segments] Error executing 7-category query:', error);
    res.status(500).json({ error: 'Failed to evaluate dynamic segments' });
  }
});

export default router;
