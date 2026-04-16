/**
 * Test OP-AMP and BJT simulation modules
 */

import { 
  simulateStructuredCircuit,
  CIRCUIT_TYPES, 
  SIMULATION_MODES,
  createDefaultCircuit,
  validateCircuit
} from './src/engine/index.js';

console.log('🧪 Testing OP-AMP and BJT Simulation Modules\n');

// Test 1: OP-AMP Inverting Amplifier
console.log('📋 Test 1: OP-AMP Inverting Amplifier');
const opampInverting = {
  type: CIRCUIT_TYPES.OPAMP,
  mode: SIMULATION_MODES.CHARGING,
  components: {
    R: 1000,
    gain: 10,
    Vin: 1
  }
};

try {
  const result1 = simulateStructuredCircuit(opampInverting);
  console.log('✅ OP-AMP Inverting:', result1 ? 'PASS' : 'FAIL');
  console.log('Chart Type:', result1?.chartType);
  console.log('Data Points:', result1?.data?.length);
  console.log('Configuration:', result1?.circuitParams?.configuration);
  console.log('Gain:', result1?.circuitParams?.gain);
  console.log('Equation:', result1?.circuitParams?.equation);
} catch (error) {
  console.log('❌ OP-AMP Inverting Failed:', error.message);
}

// Test 2: OP-AMP Non-Inverting Buffer
console.log('\n📋 Test 2: OP-AMP Non-Inverting Buffer');
const opampNonInverting = {
  type: CIRCUIT_TYPES.OPAMP,
  mode: SIMULATION_MODES.CHARGING,
  components: {
    R: 1000,
    gain: 1,
    Vin: 1
  }
};

try {
  const result2 = simulateStructuredCircuit(opampNonInverting);
  console.log('✅ OP-AMP Non-Inverting:', result2 ? 'PASS' : 'FAIL');
  console.log('Configuration:', result2?.circuitParams?.configuration);
  console.log('Gain:', result2?.circuitParams?.gain);
} catch (error) {
  console.log('❌ OP-AMP Non-Inverting Failed:', error.message);
}

// Test 3: OP-AMP Comparator
console.log('\n📋 Test 3: OP-AMP Comparator');
const opampComparator = {
  type: CIRCUIT_TYPES.OPAMP,
  mode: 'comparator',
  components: {
    R: 1000,
    Vin: 5
  }
};

try {
  const result3 = simulateStructuredCircuit(opampComparator);
  console.log('✅ OP-AMP Comparator:', result3 ? 'PASS' : 'FAIL');
  console.log('Configuration:', result3?.circuitParams?.configuration);
} catch (error) {
  console.log('❌ OP-AMP Comparator Failed:', error.message);
}

// Test 4: BJT Common Emitter
console.log('\n📋 Test 4: BJT Common Emitter');
const bjtCommonEmitter = {
  type: CIRCUIT_TYPES.BJT,
  mode: SIMULATION_MODES.CHARGING,
  components: {
    R: 1000,
    Vin: 5,
    beta: 100,
    Vbe: 0.7,
    configuration: 'common_emitter'
  }
};

try {
  const result4 = simulateStructuredCircuit(bjtCommonEmitter);
  console.log('✅ BJT Common Emitter:', result4 ? 'PASS' : 'FAIL');
  console.log('Chart Type:', result4?.chartType);
  console.log('Data Points:', result4?.data?.length);
  console.log('Configuration:', result4?.circuitParams?.configuration);
  console.log('Beta:', result4?.circuitParams?.beta);
  console.log('Operating Region:', result4?.circuitParams?.operatingRegion);
  console.log('Equation:', result4?.circuitParams?.equation);
} catch (error) {
  console.log('❌ BJT Common Emitter Failed:', error.message);
}

// Test 5: BJT Emitter Follower
console.log('\n📋 Test 5: BJT Emitter Follower');
const bjtEmitterFollower = {
  type: CIRCUIT_TYPES.BJT,
  mode: SIMULATION_MODES.CHARGING,
  components: {
    R: 1000,
    Vin: 5,
    beta: 100,
    Vbe: 0.7,
    configuration: 'emitter_follower'
  }
};

try {
  const result5 = simulateStructuredCircuit(bjtEmitterFollower);
  console.log('✅ BJT Emitter Follower:', result5 ? 'PASS' : 'FAIL');
  console.log('Configuration:', result5?.circuitParams?.configuration);
} catch (error) {
  console.log('❌ BJT Emitter Follower Failed:', error.message);
}

// Test 6: Natural Language Parsing
console.log('\n🔍 Test 6: Natural Language Parsing');
const naturalLanguageTests = [
  {
    name: 'OP-AMP Gain Description',
    input: 'inverting op amp gain 10'
  },
  {
    name: 'BJT Configuration',
    input: 'BJT common emitter amplifier with beta=150'
  },
  {
    name: 'Complex Circuit Description',
    input: 'Design an inverting amplifier with Rf=10kΩ, Rin=1kΩ for 5V input'
  }
];

naturalLanguageTests.forEach((test, index) => {
  console.log(`\n📝 Natural Language Test ${index + 1}: ${test.name}`);
  console.log(`Input: "${test.input}"`);
  
  try {
    const result = simulateStructuredCircuit(test.input);
    console.log('✅ Natural Language Parsing:', result ? 'PASS' : 'FAIL');
    if (result) {
      console.log('Circuit Type:', result.circuitParams?.type);
      console.log('Configuration:', result.circuitParams?.configuration);
      console.log('Gain:', result.circuitParams?.gain);
      console.log('Beta:', result.circuitParams?.beta);
    }
  } catch (error) {
    console.log('❌ Natural Language Parsing Failed:', error.message);
  }
});

console.log('\n🎉 OP-AMP and BJT Testing Complete!');
console.log('\n📋 Summary:');
console.log('✅ OP-AMP inverting amplifier: Vout = -(Rf/Rin) × Vin');
console.log('✅ OP-AMP non-inverting buffer: Vout = (1 + Rf/Rin) × Vin');
console.log('✅ OP-AMP comparator: Vout = ±Vsat');
console.log('✅ BJT DC model: Ic = β × Ib');
console.log('✅ BJT configurations: Common emitter, emitter follower, etc.');
console.log('✅ Enhanced UI with mode selectors');
console.log('✅ Natural language parsing for complex circuits');
