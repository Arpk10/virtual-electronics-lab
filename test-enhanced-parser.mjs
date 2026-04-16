/**
 * Test enhanced natural language parser with provided examples
 */

import { parseCircuitToJSON } from './src/engine/index.js';

console.log('🧪 Testing Enhanced Natural Language Parser\n');

const testCases = [
  {
    name: 'RLC circuit with complex units',
    input: 'RLC circuit with R=100 ohm, L=1mH, C=10uF, AC input'
  },
  {
    name: 'Inverting op amp with gain',
    input: 'inverting op amp gain 10'
  },
  {
    name: 'BJT common emitter amplifier',
    input: 'BJT common emitter amplifier'
  },
  {
    name: 'AND gate truth table',
    input: 'AND gate truth table'
  },
  {
    name: 'Complex circuit description',
    input: 'Design a voltage divider with R1=2.2kΩ and R2=1kΩ for 5V input, calculate output voltage and power dissipation'
  }
];

testCases.forEach((testCase, index) => {
  console.log(`\n📋 Test ${index + 1}: ${testCase.name}`);
  console.log(`Input: "${testCase.input}"`);
  
  try {
    const result = parseCircuitToJSON(testCase.input);
    
    if (result.success) {
      console.log('✅ Parsing successful');
      console.log('Circuit Type:', result.circuit.type);
      console.log('Mode:', result.circuit.mode);
      console.log('Components:', JSON.stringify(result.circuit.components, null, 2));
      console.log('Confidence:', result.confidence);
      
      if (result.circuit.metadata) {
        console.log('Detected Features:', result.circuit.metadata.detectedFeatures);
        console.log('Parser Version:', result.circuit.metadata.parserVersion);
      }
    } else {
      console.log('❌ Parsing failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
});

console.log('\n🎉 Enhanced Parser Testing Complete!');
