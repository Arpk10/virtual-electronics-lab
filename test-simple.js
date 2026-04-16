/**
 * Simple test for modular system - using require instead of import
 */

const fs = require('fs');
const path = require('path');

// Read the engine files directly
console.log('🧪 Testing Modular Circuit Simulation System - Simple Test\n');

// Test 1: Check if files exist
const engineFiles = [
  'src/engine/CircuitSchema.js',
  'src/engine/CircuitParser.js', 
  'src/engine/SimulationEngine.js',
  'src/engine/index.js',
  'src/visualization/ChartDataAdapter.js',
  'src/visualization/index.js'
];

console.log('📁 Checking file structure...');
let allFilesExist = true;
engineFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

if (allFilesExist) {
  console.log('\n✅ All modular system files created successfully!');
} else {
  console.log('\n❌ Some files are missing!');
}

// Test 2: Check file content for key exports
console.log('\n📋 Checking module exports...');

try {
  const schemaContent = fs.readFileSync('src/engine/CircuitSchema.js', 'utf8');
  const hasCircuitTypes = schemaContent.includes('CIRCUIT_TYPES');
  const hasSimulationModes = schemaContent.includes('SIMULATION_MODES');
  const hasValidateCircuit = schemaContent.includes('validateCircuit');
  
  console.log(`${hasCircuitTypes ? '✅' : '❌'} CIRCUIT_TYPES exported`);
  console.log(`${hasSimulationModes ? '✅' : '❌'} SIMULATION_MODES exported`);
  console.log(`${hasValidateCircuit ? '✅' : '❌'} validateCircuit exported`);
  
  const parserContent = fs.readFileSync('src/engine/CircuitParser.js', 'utf8');
  const hasParseCircuitInput = parserContent.includes('parseCircuitInput');
  console.log(`${hasParseCircuitInput ? '✅' : '❌'} parseCircuitInput exported`);
  
  const engineContent = fs.readFileSync('src/engine/SimulationEngine.js', 'utf8');
  const hasSimulationEngine = engineContent.includes('SimulationEngine');
  const hasRCSimulator = engineContent.includes('RCSimulator');
  console.log(`${hasSimulationEngine ? '✅' : '❌'} SimulationEngine class defined`);
  console.log(`${hasRCSimulator ? '✅' : '❌'} RCSimulator class defined`);
  
  const vizContent = fs.readFileSync('src/visualization/ChartDataAdapter.js', 'utf8');
  const hasAdaptToChartData = vizContent.includes('adaptToChartData');
  const hasGetChartOptions = vizContent.includes('getChartOptions');
  console.log(`${hasAdaptToChartData ? '✅' : '❌'} adaptToChartData exported`);
  console.log(`${hasGetChartOptions ? '✅' : '❌'} getChartOptions exported`);
  
} catch (error) {
  console.log('❌ Error reading files:', error.message);
}

console.log('\n🎉 Simple modular system test complete!');
