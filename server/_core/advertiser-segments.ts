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
 * Includes a fallback for users with NULL/empty JSON fields so they aren't excluded
 * when advertisers select filters from those categories.
 * Special sentinel: if values includes '__others__', adds a clause for users whose
 * field is NULL, empty, or doesn't contain any of the known values.
 */
function buildJsonContains(
  column: string,
  values: string[],
  matchAll: boolean,
  conditions: string[],
  params: any[],
  knownValues?: string[]
) {
  if (!values || values.length === 0) return;

  // Separate the special __others__ sentinel from real values
  const includeOthers = values.includes('__others__');
  const realValues = values.filter(v => v !== '__others__');

  // BYPASS logic: If user selected "Others" AND selected all known options, do not apply any filter.
  // This ensures "Select All" + "Others" effectively targets 100% of the audience.
  if (includeOthers && knownValues && knownValues.length > 0 && realValues.length >= knownValues.length) {
    return;
  }

  const clauses: string[] = [];

  if (realValues.length > 0) {
    if (matchAll) {
      // AND logic — every value must be present
      const andClauses: string[] = [];
      realValues.forEach(val => {
        andClauses.push(`JSON_CONTAINS(${column}, ?)`);
        params.push(`"${val}"`);
      });
      clauses.push(`(${andClauses.join(' AND ')})`);
    } else {
      // OR logic — any one of the values must be present
      const orClauses: string[] = [];
      realValues.forEach(val => {
        orClauses.push(`JSON_CONTAINS(${column}, ?)`);
        params.push(`"${val}"`);
      });
      // Also include users with NULL/empty arrays — they have no data, not wrong data.
      // This prevents reach from dropping when selecting all options in a category.
      orClauses.push(`${column} IS NULL`);
      orClauses.push(`${column} = '[]'`);
      orClauses.push(`JSON_LENGTH(${column}) = 0`);
      clauses.push(`(${orClauses.join(' OR ')})`);
    }
  }

  // Others clause: users whose field is null/empty OR doesn't contain any known value
  if (includeOthers && knownValues && knownValues.length > 0) {
    const notContainsClauses = knownValues.map(v => {
      params.push(`"${v}"`);
      return `NOT JSON_CONTAINS(${column}, ?)`;
    });
    clauses.push(`(${column} IS NULL OR ${column} = '[]' OR JSON_LENGTH(${column}) = 0 OR (${notContainsClauses.join(' AND ')}))`);
  } else if (includeOthers) {
    clauses.push(`(${column} IS NULL OR ${column} = '[]' OR JSON_LENGTH(${column}) = 0)`);
  }

  if (clauses.length > 0) {
    conditions.push(clauses.length === 1 ? clauses[0] : `(${clauses.join(' OR ')})`);
  }
}

/**
 * Generalized helper for simple Set (IN) matching.
 * Handles the Select All + Others bypass logic for simple varchar and enum columns.
 */
function buildSetCondition(
  column: string,
  values: string | string[],
  conditions: string[],
  params: any[],
  knownValues?: string[]
) {
  if (!values || (Array.isArray(values) && values.length === 0) || values === '') return;
  
  const valArray = Array.isArray(values) ? values : [values];
  const includeOthers = valArray.includes('__others__');
  const realValues = valArray.filter(v => v !== '__others__');
  const knownAll = knownValues || [];

  if (includeOthers && knownAll.length > 0 && realValues.length >= knownAll.length) {
    return; // Bypass filter
  }

  const clauses: string[] = [];
  if (realValues.length > 0) {
    const placeholders = realValues.map(() => '?').join(', ');
    clauses.push(`(${column} IN (${placeholders}) OR ${column} IS NULL OR ${column} = '')`);
    params.push(...realValues);
  }
  
  if (includeOthers && knownAll.length > 0) {
    const phs = knownAll.map(() => '?').join(', ');
    clauses.push(`(${column} IS NULL OR ${column} = '' OR ${column} NOT IN (${phs}))`);
    params.push(...knownAll);
  } else if (includeOthers) {
    clauses.push(`(${column} IS NULL OR ${column} = '')`);
  }

  if (clauses.length > 0) {
    conditions.push(clauses.length === 1 ? clauses[0] : `(${clauses.join(' OR ')})`);
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
    buildSetCondition('u.city', filters.cities, conditions, params, filters._knownCities);
    buildSetCondition('u.district', filters.districts, conditions, params);

    // CATEGORY 2: Financial & Income
    buildSetCondition('u.incomeLevel', filters.incomeLevels, conditions, params);
    buildSetCondition('up.homeOwnership', filters.homeOwnership, conditions, params, filters._knownHomeOwnership);

    // CATEGORY 3: Device & Connectivity
    // Device Brands (virtual column derived from model matching)
    if (filters.deviceBrands && filters.deviceBrands.length > 0) {
      if (!filters.deviceBrands.includes('__others__') || filters.deviceBrands.length < 5) {
        // Only filter if they didn't Select All, otherwise bypass
        const brandClauses: string[] = [];
        filters.deviceBrands.forEach((b: string) => {
          if (b === 'Samsung') brandClauses.push(`up.deviceModel LIKE 'Samsung%' OR up.deviceModel LIKE 'Galaxy%'`);
          else if (b === 'Apple') brandClauses.push(`up.deviceModel LIKE 'iPhone%' OR up.deviceModel LIKE 'iPad%'`);
          else if (b === 'Xiaomi') brandClauses.push(`up.deviceModel LIKE 'Xiaomi%' OR up.deviceModel LIKE 'Redmi%' OR up.deviceModel LIKE 'POCO%'`);
          else if (b === 'Huawei') brandClauses.push(`up.deviceModel LIKE 'Huawei%' OR up.deviceModel LIKE 'Nova%' OR up.deviceModel LIKE 'Mate%' OR up.deviceModel LIKE 'Honor%'`);
          else if (b === 'Google') brandClauses.push(`up.deviceModel LIKE 'Pixel%'`);
          else if (b !== '__others__') brandClauses.push(`up.deviceModel LIKE '${b}%'`);
        });
        if (filters.deviceBrands.includes('__others__')) {
            brandClauses.push(`up.deviceModel IS NULL OR up.deviceModel = ''`);
        }
        if (brandClauses.length > 0) conditions.push(`(${brandClauses.join(' OR ')})`);
      }
    }

    buildSetCondition('up.deviceTier', filters.deviceTiers, conditions, params, filters._knownDeviceTiers);
    buildSetCondition('up.deviceOs', filters.deviceOs, conditions, params);
    buildSetCondition('up.networkCarrier', filters.networkCarriers, conditions, params);
    buildSetCondition('up.deviceModel', filters.deviceModels, conditions, params, filters._knownDeviceModels);
    buildSetCondition('up.connectionType', filters.connectionTypes, conditions, params, filters._knownConnectionTypes);

    // CATEGORY 4: Psychographic
    buildJsonContains('up.interests', filters.interests, filters.interestsMatchAll, conditions, params, filters._knownInterests);
    buildJsonContains('up.brandAffinity', filters.brandAffinity, filters.brandAffinityMatchAll, conditions, params, filters._knownBrandAffinity);
    buildJsonContains('up.values', filters.values, filters.valuesMatchAll, conditions, params, filters._knownValues);
    buildSetCondition('up.lifeStage', filters.lifeStages, conditions, params, filters._knownLifeStages);

    // CATEGORY 5: Behavioral
    buildSetCondition('up.shoppingFrequency', filters.shoppingFrequencies, conditions, params, filters._knownShoppingFrequencies);
    buildJsonContains('up.preferredStores', filters.preferredStores, filters.preferredStoresMatchAll, conditions, params, filters._knownPreferredStores);
    buildJsonContains('up.nextPurchaseIntent', filters.nextPurchaseIntent, filters.nextPurchaseIntentMatchAll, conditions, params, filters._knownPurchaseIntents);
    buildSetCondition('up.activityPattern', filters.activityPatterns, conditions, params, filters._knownActivityPatterns);

    // CATEGORY 6: Mobility & Household
    if (filters.hasVehicle !== undefined) {
      conditions.push('up.hasVehicle = ?');
      params.push(filters.hasVehicle ? 1 : 0);
    }
    buildSetCondition('up.vehicleBrand', filters.vehicleBrands, conditions, params);
    buildSetCondition('up.workType', filters.workTypes, conditions, params, filters._knownWorkTypes);
    
    if (filters.householdSizeMin) { conditions.push('up.householdSize >= ?'); params.push(filters.householdSizeMin); }
    if (filters.householdSizeMax) { conditions.push('up.householdSize <= ?'); params.push(filters.householdSizeMax); }
    
    // Professional
    buildSetCondition('up.industry', filters.industries, conditions, params, filters._knownIndustries);
    buildSetCondition('up.jobTitle', filters.jobTitles, conditions, params, filters._knownJobTitles);

    // CATEGORY 8: Engagement Quality
    if (filters.tierMin) {
      let rank = 1;
      if (filters.tierMin === 'silver') rank = 2;
      if (filters.tierMin === 'gold') rank = 3;
      if (filters.tierMin === 'platinum') rank = 4;
      conditions.push('u.tierRank >= ?');
      params.push(rank);
    }
    // Specific exact tiers selected via array
    buildSetCondition('u.tier', filters.tiers, conditions, params, ['bronze', 'silver', 'gold', 'platinum']);
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

    // Device Brand Breakdown — derived from deviceModel using CASE pattern matching
    // (userProfiles has deviceModel but not deviceBrand)
    const brandSql = `
      SELECT 
        CASE 
          WHEN up.deviceModel LIKE 'Galaxy%' OR up.deviceModel LIKE 'Samsung%' THEN 'Samsung'
          WHEN up.deviceModel LIKE 'iPhone%' OR up.deviceModel LIKE 'iPad%' THEN 'Apple'
          WHEN up.deviceModel LIKE 'Xiaomi%' OR up.deviceModel LIKE 'Redmi%' OR up.deviceModel LIKE 'POCO%' THEN 'Xiaomi'
          WHEN up.deviceModel LIKE 'Huawei%' OR up.deviceModel LIKE 'Nova%' OR up.deviceModel LIKE 'Mate%' OR up.deviceModel LIKE 'Honor%' THEN 'Huawei'
          WHEN up.deviceModel LIKE 'Pixel%' THEN 'Google'
          WHEN up.deviceModel LIKE 'Oppo%' THEN 'Oppo'
          WHEN up.deviceModel LIKE 'Vivo%' THEN 'Vivo'
          WHEN up.deviceModel LIKE 'Realme%' THEN 'Realme'
          WHEN up.deviceModel LIKE 'Nokia%' THEN 'Nokia'
          WHEN up.deviceModel LIKE 'OnePlus%' THEN 'OnePlus'
          ELSE 'Other'
        END as brand,
        COUNT(DISTINCT u.id) as cnt
      FROM users u 
      LEFT JOIN userProfiles up ON u.id = up.userId
      WHERE ${whereClause} AND up.deviceModel IS NOT NULL AND up.deviceModel != ''
      GROUP BY brand
      HAVING brand != 'Other'
    `;
    const brandResult = await query(brandSql, params);
    const byBrand: any = {};
    brandResult.forEach((r: any) => { if (r.brand) byBrand[r.brand] = Math.floor(r.cnt * scaleFactor); });

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
