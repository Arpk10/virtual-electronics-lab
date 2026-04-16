/**
 * ES Module test for modular system
 */

import { 
  CIRCUIT_TYPES, 
  SIMULATION_MODES, 
  validateCircuit 
} from './src/engine/CircuitSchema.js';

console.log('🧪 Testing Modular Circuit Simulation System - ESM Test\n');

// Test 1: Basic imports and constants
console.log('📋 Test 1: Basic imports and constants');
console.log('✅ CIRCUIT_TYPES:', Object.keys(CIRCUIT_TYPES).length, 'types available');
console.log('✅ SIMULATION_MODES:', Object.keys(SIMULATION_MODES).length, 'modes available');

// Test 2: Circuit validation
console.log('\n🔍 Test 2: Circuit validation');
const testCircuit = {
  type: CIRCUIT_TYPES.RC,
  mode: SIMULATION_MODES.CHARGING,
  components: {
    R: 1000,
    C: 10e-6,
    Vin: 5
  }
};

const validation = validateCircuit(testCircuit);
console.log('✅ RC Circuit Validation:', validation.isValid ? 'PASS' : 'FAIL');
if (!validation.isValid) {
  console.log('Errors:', validation.errors);
}

console.log('\n🎉 ESM Module test complete!');
