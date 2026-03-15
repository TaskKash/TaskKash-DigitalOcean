import db from './server/_core/mysql-db.js';

async function testQuery(name: string, body: any) {
  console.log(`\n--- Running Test: ${name} ---`);
  const { targetAgeMin, targetAgeMax, targetGender, targetLocations, requiresMinimumTier } = body;

  const conditions: string[] = ['u.kycStatus = ?'];
  const params: any[] = ['verified'];

  if (targetAgeMin) { conditions.push('u.age >= ?'); params.push(targetAgeMin); }
  if (targetAgeMax) { conditions.push('u.age <= ?'); params.push(targetAgeMax); }
  if (targetGender && targetGender !== 'all') { conditions.push('u.gender = ?'); params.push(targetGender); }
  
  if (targetLocations && Array.isArray(targetLocations) && targetLocations.length > 0) {
    const locationPlaceholders = targetLocations.map(() => '?').join(', ');
    conditions.push(`(u.city IN (${locationPlaceholders}) OR u.district IN (${locationPlaceholders}))`);
    params.push(...targetLocations, ...targetLocations);
  }

  if (requiresMinimumTier && requiresMinimumTier !== 'any') {
    let rank = 1;
    if (requiresMinimumTier === 'silver') rank = 2;
    if (requiresMinimumTier === 'gold') rank = 3;
    if (requiresMinimumTier === 'platinum') rank = 4;
    conditions.push('u.tierRank >= ?');
    params.push(rank);
  }

  const whereClause = conditions.join(' AND ');
  const countSql = `SELECT COUNT(DISTINCT u.id) as totalReach FROM users u LEFT JOIN userProfiles up ON u.id = up.userId WHERE ${whereClause}`;
  
  try {
    const result = await db.query(countSql, params);
    const count = result[0]?.totalReach || 0;
    
    if (count === 0) {
      console.log('Result:', { count: 0, tiers: {} });
      return;
    }
    
    const tiersSql = `SELECT u.tier, COUNT(DISTINCT u.id) as tierCount FROM users u LEFT JOIN userProfiles up ON u.id = up.userId WHERE ${whereClause} GROUP BY u.tier`;
    const tiersResult = await db.query(tiersSql, params);
    const tiersBreakdown: Record<string, number> = {};
    tiersResult.forEach((row: any) => { tiersBreakdown[row.tier] = row.tierCount; });
    
    console.log('Result:', { count, tiers: tiersBreakdown });
  } catch(e: any) {
    console.error("Test failed with error:", e.message);
  }
}

async function runTests() {
  await testQuery("Standard Test (25-34, Female)", {
    targetAgeMin: 25,
    targetAgeMax: 34,
    targetGender: 'female',
    requiresMinimumTier: 'any'
  });

  await testQuery("Zero-Result Edge Case (1-1, Unknown)", {
    targetAgeMin: 1,
    targetAgeMax: 1,
    targetGender: 'all',
    requiresMinimumTier: 'platinum'
  });

  await db.closePool();
}

runTests();
