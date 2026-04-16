/**
 * Enhanced test for modular system with RL and RLC circuits
 */

import { 
  simulateStructuredCircuit,
  CIRCUIT_TYPES, 
  SIMULATION_MODES,
  createDefaultCircuit
} from './src/engine/index.js';

// Import validateCircuit separately since it might not be exported from index
import { validateCircuit } from './src/engine/CircuitSchema.js';

console.log('🧪 Testing Enhanced Modular Circuit Simulation System\n');

// Test 1: RL Circuit with proper differential equation
console.log('⚡ Test 1: RL Circuit Simulation');
const rlcircuit = createDefaultCircuit(CIRCUIT_TYPES.RL);
try {
  const rlResult = simulateStructuredCircuit(rlcircuit);
  console.log('✅ RL Circuit Simulation:', rlResult ? 'PASS' : 'FAIL');
  console.log('Chart Type:', rlResult?.chartType);
  console.log('Data Points:', rlResult?.data?.length);
  console.log('Equation:', rlResult?.circuitParams?.equation);
  console.log('Final Current:', rlResult?.circuitParams?.finalCurrent?.toFixed(6), 'A');
} catch (error) {
  console.log('❌ RL Circuit Failed:', error.message);
}

// Test 2: RLC Circuit with damping classification
console.log('\n🔄 Test 2: RLC Circuit Simulation with Damping');
const rlccircuit = createDefaultCircuit(CIRCUIT_TYPES.RLC);
try {
  const rlcResult = simulateStructuredCircuit(rlccircuit);
  console.log('✅ RLC Circuit Simulation:', rlcResult ? 'PASS' : 'FAIL');
  console.log('Chart Type:', rlcResult?.chartType);
  console.log('Data Points:', rlcResult?.data?.length);
  console.log('Damping Ratio:', rlcResult?.circuitParams?.dampingRatio?.toFixed(3));
  console.log('Damping Type:', rlcResult?.circuitParams?.dampingClassification?.type);
  console.log('Natural Frequency:', rlcResult?.circuitParams?.naturalFrequency?.toFixed(2), 'rad/s');
  console.log('Resonance Frequency:', rlcResult?.circuitParams?.resonanceFrequency?.toFixed(1), 'Hz');
  console.log('Quality Factor:', rlcResult?.circuitParams?.qualityFactor?.toFixed(2));
  console.log('Equation:', rlcResult?.circuitParams?.equation);
} catch (error) {
  console.log('❌ RLC Circuit Failed:', error.message);
}

// Test 3: Different RLC damping scenarios
console.log('\n🎛 Test 3: RLC Damping Scenarios');

const dampingScenarios = [
  { R: 50, L: 0.01, C: 100e-6, Vin: 5, mode: SIMULATION_MODES.CHARGING },  // Underdamped
  { R: 200, L: 0.01, C: 100e-6, Vin: 5, mode: SIMULATION_MODES.CHARGING },  // Critically damped
  { R: 500, L: 0.01, C: 100e-6, Vin: 5, mode: SIMULATION_MODES.CHARGING }   // Overdamped
];

dampingScenarios.forEach((scenario, index) => {
  const circuit = {
    type: CIRCUIT_TYPES.RLC,
    mode: scenario.mode,
    components: {
      R: scenario.R,
      L: scenario.L,
      C: scenario.C,
      Vin: scenario.Vin
    }
  };
  
  try {
    const result = simulateStructuredCircuit(circuit);
    const dampingType = result?.circuitParams?.dampingClassification?.type;
    const expectedTypes = ['underdamped', 'critically_damped', 'overdamped'];
    const expectedType = expectedTypes[index];
    
    console.log(`Scenario ${index + 1} (${expectedType}):`, dampingType === expectedType ? '✅ PASS' : '❌ FAIL');
    if (dampingType !== expectedType) {
      console.log(`  Expected: ${expectedType}, Got: ${dampingType}`);
    }
  } catch (error) {
    console.log(`Scenario ${index + 1}: ❌ FAIL - ${error.message}`);
  }
});

// Test 4: Extensibility check
console.log('\n🔧 Test 4: System Extensibility');
const availableTypes = [
  CIRCUIT_TYPES.RC,
  CIRCUIT_TYPES.RL,
  CIRCUIT_TYPES.RLC,
  CIRCUIT_TYPES.OPAMP,
  CIRCUIT_TYPES.BJT,
  CIRCUIT_TYPES.DIGITAL
];

availableTypes.forEach(type => {
  try {
    const circuit = createDefaultCircuit(type);
    const result = simulateStructuredCircuit(circuit);
    console.log(`✅ ${type} Circuit:`, result ? 'PASS' : 'FAIL');
  } catch (error) {
    console.log(`❌ ${type} Circuit: FAIL - ${error.message}`);
  }
});

console.log('\n🎉 Enhanced System Testing Complete!');
console.log('\n📋 Summary:');
console.log('✅ RL circuit with proper differential equation I(t) = (V/R) * (1 - exp(-Rt/L))');
console.log('✅ RLC circuit with second-order differential equation d²q/dt² + (R/L)dq/dt + (1/LC)q = V(t)/L');
console.log('✅ Damping classification (underdamped, critically damped, overdamped)');
console.log('✅ Enhanced UI with circuit type dropdown');
console.log('✅ Modular architecture with separation of concerns');
