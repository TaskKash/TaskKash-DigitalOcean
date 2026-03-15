import db from './server/_core/mysql-db.js';

// Reusing same builder logic as backend for isolated test accuracy
function buildJsonContains(column: string, values: string[], matchAll: boolean, conditions: string[], params: any[]) {
  if (!values || values.length === 0) return;
  if (matchAll) {
    const clauses: string[] = [];
    values.forEach(val => { clauses.push(`JSON_CONTAINS(${column}, ?)`); params.push(`"${val}"`); });
    conditions.push(`(${clauses.join(' AND ')})`);
  } else {
    const clauses: string[] = [];
    values.forEach(val => { clauses.push(`JSON_CONTAINS(${column}, ?)`); params.push(`"${val}"`); });
    conditions.push(`(${clauses.join(' OR ')})`);
  }
}

async function testQuery(name: string, filters: any) {
  console.log(`\n--- Running Test: ${name} ---`);
  
  const conditions: string[] = ['u.kycStatus = ?', 'u.profileStrength >= ?'];
  const params: any[] = ['verified', 60];

  if (filters.ageMin) { conditions.push('u.age >= ?'); params.push(filters.ageMin); }
  if (filters.ageMax) { conditions.push('u.age <= ?'); params.push(filters.ageMax); }
  if (filters.gender && filters.gender !== 'all') { conditions.push('u.gender = ?'); params.push(filters.gender); }
  if (filters.deviceOs) { conditions.push('up.deviceOs = ?'); params.push(filters.deviceOs); }
  
  if (filters.tiers && filters.tiers.length > 0) {
    const placeholders = filters.tiers.map(() => '?').join(', ');
    conditions.push(`u.tier IN (${placeholders})`);
    params.push(...filters.tiers);
  }

  buildJsonContains('up.interests', filters.interests, filters.interestsMatchAll, conditions, params);

  const whereClause = conditions.join(' AND ');
  const countSql = `SELECT COUNT(DISTINCT u.id) as rawCount FROM users u LEFT JOIN userProfiles up ON u.id = up.userId WHERE ${whereClause}`;
  
  try {
    const result = await db.query(countSql, params);
    const rawCount = result[0]?.rawCount || 0;
    
    const meetsMinimum = rawCount >= 500;
    let totalReach = 0;
    if (rawCount > 0) {
      if (rawCount < 10000) totalReach = Math.floor(rawCount / 500) * 500;
      else totalReach = Math.floor(rawCount / 1000) * 1000;
    }
    
    console.log(`Status: ${meetsMinimum ? '✅ Meets Minimum' : '❌ Below Minimum'}`);
    console.log(`Raw Count: ${rawCount}`);
    console.log(`Rounded Reach: ${totalReach}`);
    return { rawCount, totalReach, meetsMinimum };
  } catch(e: any) {
    console.log(`🚨 SQL Error caught cleanly: ${e.message}`);
    return { error: e.message };
  }
}

async function runTests() {
  console.log("Starting Sprint 4+ Verification Tests\n");

  // TEST 1: Broad
  await testQuery("Broad query (Female, 25-34)", { gender: "female", ageMin: 25, ageMax: 34 });
  
  // TEST 2: Narrow
  await testQuery("Narrow query (iOS, Platinum, Gaming)", { deviceOs: "iOS", tiers: ["platinum"], interests: ["Gaming"] });
  
  // TEST 3: Zero-Result BOUNDARY
  await testQuery("Zero/below-minimum boundary (18-18, Female, Platinum)", { ageMin: 18, ageMax: 18, gender: "female", tiers: ["platinum"] });
  
  // TEST 4: AND vs OR JSON_CONTAINS logic check
  const orResult = await testQuery("OR logic (Gaming OR Beauty)", { interests: ["Gaming", "Beauty"], interestsMatchAll: false });
  const andResult = await testQuery("AND logic (Gaming AND Beauty)", { interests: ["Gaming", "Beauty"], interestsMatchAll: true });
  console.log(`\nLogic Check: AND result (${andResult.rawCount}) must be <= OR result (${orResult.rawCount}) -> ${andResult.rawCount <= orResult.rawCount ? '✅ PASS' : '❌ FAIL'}`);

  // TEST 5: SQL Injection Guard
  // The system uses strictly parameterized arrays. Even if a string like this is pushed, it literally searches for the string, it does NOT execute it.
  await testQuery("SQL Injection Guard Request", { gender: "male'; DROP TABLE users; --" });

  await db.closePool();
}

runTests();
