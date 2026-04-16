/**
 * Test file for the modular circuit simulation system
 * This file tests the new modular architecture
 */

import { 
  simulateCircuit, 
  simulateStructuredCircuit,
  parseCircuitInput,
  validateCircuit,
  CIRCUIT_TYPES,
  SIMULATION_MODES,
  createDefaultCircuit
} from './src/engine/index.js';

import { 
  adaptToChartData,
  getChartOptions 
} from './src/visualization/index.js';

console.log('🧪 Testing Modular Circuit Simulation System\n');

// Test 1: Circuit Schema Validation
console.log('📋 Test 1: Circuit Schema Validation');
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

// Test 2: Circuit Parsing
console.log('\n🔍 Test 2: Circuit Parsing');
const parseResult = parseCircuitInput('RC circuit with R=1000 ohms, C=10uF, step input');
console.log('✅ Parsing Result:', parseResult.confidence > 0.5 ? 'PASS' : 'FAIL');
console.log('Confidence:', parseResult.confidence);
console.log('Circuit Type:', parseResult.circuit?.type);
console.log('Components:', parseResult.circuit?.components);

// Test 3: Structured Circuit Simulation
console.log('\n⚡ Test 3: Structured Circuit Simulation');
try {
  const simResult = simulateStructuredCircuit(testCircuit);
  console.log('✅ Simulation Result:', simResult ? 'PASS' : 'FAIL');
  console.log('Chart Type:', simResult?.chartType);
  console.log('Data Points:', simResult?.data?.length);
  console.log('Labels:', simResult?.labels?.length);
} catch (error) {
  console.log('❌ Simulation Failed:', error.message);
}

// Test 4: Natural Language Simulation
console.log('\n🗣️ Test 4: Natural Language Simulation');
try {
  const nlResult = simulateCircuit('RC circuit with R=2.2k ohms, C=100uF, discharging');
  console.log('✅ NL Simulation Result:', nlResult ? 'PASS' : 'FAIL');
  console.log('Chart Type:', nlResult?.chartType);
} catch (error) {
  console.log('❌ NL Simulation Failed:', error.message);
}

// Test 5: Visualization Layer
console.log('\n📊 Test 5: Visualization Layer');
try {
  const simData = simulateStructuredCircuit(testCircuit);
  const chartData = adaptToChartData(simData);
  const chartOptions = getChartOptions(simData.chartType, simData.circuitParams);
  
  console.log('✅ Chart Data Adaptation:', chartData ? 'PASS' : 'FAIL');
  console.log('✅ Chart Options Generation:', chartOptions ? 'PASS' : 'FAIL');
  console.log('Dataset Labels:', chartData?.datasets?.[0]?.label);
  console.log('Chart Title:', chartOptions?.plugins?.title?.text);
} catch (error) {
  console.log('❌ Visualization Failed:', error.message);
}

// Test 6: Extensibility - Different Circuit Types
console.log('\n🔧 Test 6: Extensibility - Different Circuit Types');
const circuitTypes = [
  { type: CIRCUIT_TYPES.RC, name: 'RC' },
  { type: CIRCUIT_TYPES.RL, name: 'RL' },
  { type: CIRCUIT_TYPES.RLC, name: 'RLC' }
];

circuitTypes.forEach(({ type, name }) => {
  try {
    const circuit = createDefaultCircuit(type);
    const result = simulateStructuredCircuit(circuit);
    console.log(`✅ ${name} Circuit:`, result ? 'PASS' : 'FAIL');
  } catch (error) {
    console.log(`❌ ${name} Circuit Failed:`, error.message);
  }
});

console.log('\n🎉 Modular System Testing Complete!');
