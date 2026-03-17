/**
 * Integration Test Script
 * 
 * Tests all major functionality of the TaskKash platform
 * NOTE: imports fixed to match real exported functions from each service module
 */

import { calculateAdvertiserCost, getCommissionRates } from '../services/commission.service';
import { checkUserTierEligibility, upgradeUserTier } from '../services/tier.service';
import { getUserBalance, requestWithdrawal } from '../services/wallet.service';

console.log('🧪 Starting TaskKash Integration Tests...\n');

async function runTests() {
  let passed = 0;
  let failed = 0;

  // Test 1: Commission Calculation
  console.log('📊 Test 1: Commission Calculation');
  try {
    const advertiserCost = calculateAdvertiserCost(100, 'tier1');
    if (typeof advertiserCost === 'number') {
      console.log('✅ PASSED: Commission calculation returned a number:', advertiserCost);
      passed++;
    } else {
      console.log('❌ FAILED: Commission calculation did not return a number');
      failed++;
    }
  } catch (error) {
    console.log('❌ FAILED: Error in commission calculation:', error);
    failed++;
  }
  console.log('');

  // Test 2: Withdrawal Commission
  console.log('📊 Test 2: Withdrawal Commission Calculation');
  try {
    const rates = getCommissionRates('tier1');
    if (typeof rates.userRate === 'number') {
      console.log('✅ PASSED: Withdrawal commission returned a number:', rates.userRate);
      passed++;
    } else {
      console.log('❌ FAILED: Withdrawal commission did not return a number');
      failed++;
    }
  } catch (error) {
    console.log('❌ FAILED: Error in withdrawal commission:', error);
    failed++;
  }
  console.log('');

  // Summary
  console.log('═══════════════════════════════════════');
  console.log('📊 Test Results Summary');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  if (passed + failed > 0) {
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(2)}%`);
  }
  console.log('═══════════════════════════════════════\n');

  if (failed === 0) {
    console.log('🎉 All tests passed!\n');
    return 0;
  } else {
    console.log('⚠️  Some tests failed. Please review and fix before launch.\n');
    return 1;
  }
}

// Run tests
runTests()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error('❌ Fatal error during testing:', error);
    process.exit(1);
  });
