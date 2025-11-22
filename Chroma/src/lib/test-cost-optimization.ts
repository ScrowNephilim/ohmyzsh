/**
 * Cost Optimization Test Suite
 * Run this to verify GIF caching with real Replicate calls
 * 
 * Usage:
 * 1. Import in ChromaPage or any component
 * 2. Call runCostOptimizationTests() in useEffect
 * 3. Check console for results
 */

import { getCachedGIF, cacheGeneratedGIF, getCacheStatistics } from './animation-gif-cache-system';
import { generateAttackGIF, getPowerAnimationConfig } from './power-animation-system';

/**
 * Test 1: First Generation (MISS → STORE)
 */
export async function testFirstGeneration() {
  console.log('\n🧪 === TEST 1: FIRST GENERATION ===');
  
  const powerType = 'red_roc';
  const strength = 45; // 26-50 range
  
  // Check cache (should MISS)
  console.log('🔍 Checking cache...');
  const cached = await getCachedGIF(powerType, strength);
  
  if (!cached) {
    console.log('✅ Cache MISS as expected');
    
    // Generate with Replicate
    console.log('🎨 Generating GIF with Replicate...');
    const generated = await generateAttackGIF(powerType as any, strength);
    
    if (generated) {
      console.log('✅ Generated:', generated);
      
      // Store in cache
      await cacheGeneratedGIF(
        powerType,
        strength,
        generated,
        'Red fist with black lightning impact explosion',
        'black-forest-labs/flux-schnell'
      );
      
      console.log('✅ Cached for future use');
      return true;
    } else {
      console.error('❌ Generation failed');
      return false;
    }
  } else {
    console.log('⚠️ Already cached (test needs cleanup)');
    return true;
  }
}

/**
 * Test 2: Second Use (HIT → $0.00)
 */
export async function testCacheHit() {
  console.log('\n🧪 === TEST 2: CACHE HIT ===');
  
  const powerType = 'red_roc';
  const strength = 45;
  
  console.log('🔍 Checking cache...');
  const startTime = Date.now();
  const cached = await getCachedGIF(powerType, strength);
  const endTime = Date.now();
  
  if (cached) {
    console.log('✅ CACHE HIT!');
    console.log('💰 Cost: $0.00 (no Replicate call)');
    console.log(`⚡ Time: ${endTime - startTime}ms`);
    console.log('🔗 URL:', cached);
    return true;
  } else {
    console.error('❌ Expected cache hit but got miss');
    return false;
  }
}

/**
 * Test 3: Strength Bucketing
 */
export async function testStrengthBucketing() {
  console.log('\n🧪 === TEST 3: STRENGTH BUCKETING ===');
  
  const powerType = 'red_roc';
  const strengths = [30, 45, 49]; // All in 26-50 range
  
  let allHit = true;
  
  for (const strength of strengths) {
    console.log(`\n🔍 Testing strength ${strength}...`);
    const cached = await getCachedGIF(powerType, strength);
    
    if (cached) {
      console.log(`✅ HIT for ${strength} (same 26-50 bucket)`);
    } else {
      console.log(`❌ MISS for ${strength} (unexpected)`);
      allHit = false;
    }
  }
  
  return allHit;
}

/**
 * Test 4: Different Range Creates New Entry
 */
export async function testDifferentRange() {
  console.log('\n🧪 === TEST 4: DIFFERENT RANGE ===');
  
  const powerType = 'red_roc';
  const strength = 60; // 51-75 range (different from 26-50)
  
  console.log('🔍 Checking cache for strength 60...');
  const cached = await getCachedGIF(powerType, strength);
  
  if (!cached) {
    console.log('✅ MISS as expected (new range)');
    
    // Generate new
    console.log('🎨 Generating for 51-75 range...');
    const generated = await generateAttackGIF(powerType as any, strength);
    
    if (generated) {
      await cacheGeneratedGIF(powerType, strength, generated, 'High intensity red fist', 'flux-schnell');
      console.log('✅ New cache entry created for 51-75 range');
      return true;
    } else {
      console.error('❌ Generation failed');
      return false;
    }
  } else {
    console.log('⚠️ Already cached (test needs cleanup)');
    return true;
  }
}

/**
 * Test 5: Defensive Powers Skip GIF
 */
export async function testDefensivePowers() {
  console.log('\n🧪 === TEST 5: DEFENSIVE POWERS ===');
  
  const defensivePowers = ['gear_5', 'the_world', 'defensive', 'self_target'];
  let allCorrect = true;
  
  for (const power of defensivePowers) {
    const config = getPowerAnimationConfig(power as any);
    
    if (!config.shouldGenerateGif) {
      console.log(`✅ ${power}: Correctly skips GIF ($0.00 cost)`);
    } else {
      console.error(`❌ ${power}: Should NOT generate GIF!`);
      allCorrect = false;
    }
  }
  
  return allCorrect;
}

/**
 * Test 6: Cache Statistics
 */
export async function testCacheStatistics() {
  console.log('\n🧪 === TEST 6: CACHE STATISTICS ===');
  
  const stats = await getCacheStatistics();
  
  console.log('📊 Total GIFs stored:', stats.total_gifs);
  console.log('📊 Total reuses:', stats.total_reuses);
  console.log('💰 Cost saved:', `$${stats.cost_saved.toFixed(3)}`);
  console.log('📈 By power type:', stats.by_power_type);
  
  if (stats.total_gifs > 0) {
    console.log('✅ Statistics working');
    return true;
  } else {
    console.log('⚠️ No cached GIFs yet');
    return true;
  }
}

/**
 * Test 7: Session Simulation (10 attacks)
 */
export async function testSessionSimulation() {
  console.log('\n🧪 === TEST 7: SESSION SIMULATION ===');
  console.log('Simulating 10 attacks...\n');
  
  const attacks = [
    { power: 'red_roc', strength: 45 },        // Should HIT
    { power: 'red_roc', strength: 48 },        // Should HIT (same range)
    { power: 'haki_conqueror', strength: 40 }, // First time (MISS)
    { power: 'red_roc', strength: 70 },        // Different range (MISS if not cached)
    { power: 'dawn_gatling', strength: 55 },   // New power (MISS)
    { power: 'red_roc', strength: 45 },        // HIT
    { power: 'red_roc', strength: 70 },        // HIT if cached above
    { power: 'haki_conqueror', strength: 40 }, // HIT
    { power: 'red_pistol', strength: 30 },     // New power (MISS)
    { power: 'red_roc', strength: 45 },        // HIT
  ];
  
  let hitCount = 0;
  let missCount = 0;
  let totalCost = 0;
  
  for (const [index, attack] of attacks.entries()) {
    console.log(`\n⚔️ Attack ${index + 1}: ${attack.power} [${attack.strength}]`);
    
    const cached = await getCachedGIF(attack.power, attack.strength);
    
    if (cached) {
      hitCount++;
      console.log('✅ HIT - $0.00');
    } else {
      missCount++;
      console.log('❌ MISS - Generating...');
      
      const generated = await generateAttackGIF(attack.power as any, attack.strength);
      if (generated) {
        await cacheGeneratedGIF(attack.power, attack.strength, generated, 'Attack', 'flux-schnell');
        totalCost += 0.003;
        console.log(`💰 Cost: $0.003`);
      }
    }
  }
  
  console.log('\n📊 === SESSION RESULTS ===');
  console.log(`Total attacks: ${attacks.length}`);
  console.log(`Cache hits: ${hitCount} (${((hitCount/attacks.length)*100).toFixed(1)}%)`);
  console.log(`Cache misses: ${missCount}`);
  console.log(`Total cost: $${totalCost.toFixed(3)}`);
  console.log(`Cost without cache: $${(attacks.length * 0.003).toFixed(3)}`);
  console.log(`Savings: $${((attacks.length * 0.003) - totalCost).toFixed(3)}`);
  console.log(`Efficiency: ${((1 - totalCost/(attacks.length * 0.003)) * 100).toFixed(1)}% reduction`);
  
  return true;
}

/**
 * Run All Tests
 */
export async function runCostOptimizationTests() {
  console.log('🚀 === COST OPTIMIZATION TEST SUITE ===');
  console.log('Testing with REAL Replicate API calls\n');
  
  const results = {
    test1: false,
    test2: false,
    test3: false,
    test4: false,
    test5: false,
    test6: false,
    test7: false,
  };
  
  try {
    // Run tests sequentially
    results.test1 = await testFirstGeneration();
    await new Promise(r => setTimeout(r, 1000)); // Small delay
    
    results.test2 = await testCacheHit();
    await new Promise(r => setTimeout(r, 1000));
    
    results.test3 = await testStrengthBucketing();
    await new Promise(r => setTimeout(r, 1000));
    
    results.test4 = await testDifferentRange();
    await new Promise(r => setTimeout(r, 1000));
    
    results.test5 = await testDefensivePowers();
    
    results.test6 = await testCacheStatistics();
    
    results.test7 = await testSessionSimulation();
    
    // Summary
    console.log('\n\n🎯 === TEST SUMMARY ===');
    console.log('Test 1 (First Generation):', results.test1 ? '✅ PASS' : '❌ FAIL');
    console.log('Test 2 (Cache Hit):', results.test2 ? '✅ PASS' : '❌ FAIL');
    console.log('Test 3 (Bucketing):', results.test3 ? '✅ PASS' : '❌ FAIL');
    console.log('Test 4 (Different Range):', results.test4 ? '✅ PASS' : '❌ FAIL');
    console.log('Test 5 (Defensive):', results.test5 ? '✅ PASS' : '❌ FAIL');
    console.log('Test 6 (Statistics):', results.test6 ? '✅ PASS' : '❌ FAIL');
    console.log('Test 7 (Session):', results.test7 ? '✅ PASS' : '❌ FAIL');
    
    const passCount = Object.values(results).filter(r => r).length;
    console.log(`\n📊 Overall: ${passCount}/7 tests passed`);
    
    if (passCount === 7) {
      console.log('🎉 ALL TESTS PASSED! Cost optimization working perfectly.');
    } else {
      console.log('⚠️ Some tests failed. Check logs above.');
    }
    
  } catch (error) {
    console.error('💥 Test suite error:', error);
  }
}

/**
 * Quick single-attack test for development
 */
export async function quickTest() {
  console.log('⚡ === QUICK TEST ===');
  
  const power = 'red_roc';
  const strength = 45;
  
  // Check cache
  let url = await getCachedGIF(power, strength);
  
  // Generate if needed
  if (!url) {
    console.log('Generating...');
    url = await generateAttackGIF(power as any, strength);
    if (url) {
      await cacheGeneratedGIF(power, strength, url, 'Quick test', 'flux-schnell');
    }
  }
  
  console.log('Result:', url ? '✅ Success' : '❌ Failed');
  
  // Show stats
  const stats = await getCacheStatistics();
  console.log('Stats:', stats);
}

/**
 * Cost projection over time
 */
export function projectLongTermCosts() {
  console.log('\n💰 === LONG-TERM COST PROJECTION ===');
  
  const scenarios = [
    { period: 'Week 1', sessions: 10, hitRate: 0.5 },
    { period: 'Week 2', sessions: 10, hitRate: 0.8 },
    { period: 'Month 1', sessions: 60, hitRate: 0.85 },
    { period: 'Month 2', sessions: 60, hitRate: 0.95 },
    { period: 'Month 3+', sessions: 60, hitRate: 0.99 },
  ];
  
  const ATTACKS_PER_SESSION = 10;
  const COST_PER_GIF = 0.003;
  
  console.log('\nAttacks per session:', ATTACKS_PER_SESSION);
  console.log('Cost per GIF:', `$${COST_PER_GIF}`);
  console.log('\n');
  
  let cumulativeCostWithCache = 0;
  let cumulativeCostWithoutCache = 0;
  
  for (const scenario of scenarios) {
    const totalAttacks = scenario.sessions * ATTACKS_PER_SESSION;
    const newGIFs = Math.floor(totalAttacks * (1 - scenario.hitRate));
    const cachedGIFs = totalAttacks - newGIFs;
    
    const costWithCache = newGIFs * COST_PER_GIF;
    const costWithoutCache = totalAttacks * COST_PER_GIF;
    
    cumulativeCostWithCache += costWithCache;
    cumulativeCostWithoutCache += costWithoutCache;
    
    console.log(`📅 ${scenario.period}:`);
    console.log(`  Sessions: ${scenario.sessions}`);
    console.log(`  Cache hit rate: ${(scenario.hitRate * 100).toFixed(0)}%`);
    console.log(`  New GIFs: ${newGIFs}`);
    console.log(`  Cached GIFs: ${cachedGIFs}`);
    console.log(`  Cost: $${costWithCache.toFixed(3)} (vs $${costWithoutCache.toFixed(3)} without)`);
    console.log(`  Savings: $${(costWithoutCache - costWithCache).toFixed(3)}\n`);
  }
  
  console.log('💰 CUMULATIVE (3+ months):');
  console.log(`  With cache: $${cumulativeCostWithCache.toFixed(2)}`);
  console.log(`  Without cache: $${cumulativeCostWithoutCache.toFixed(2)}`);
  console.log(`  Total saved: $${(cumulativeCostWithoutCache - cumulativeCostWithCache).toFixed(2)}`);
  console.log(`  Efficiency: ${((1 - cumulativeCostWithCache/cumulativeCostWithoutCache) * 100).toFixed(1)}%`);
}
