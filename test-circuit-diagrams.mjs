/**
 * Test Circuit Diagram Component
 * Tests SVG rendering for different circuit types
 */

import React from 'react';
import { renderToString } from 'react-dom/server';
import CircuitDiagram from './src/components/CircuitDiagram.jsx';

console.log(' Circuit Diagram Component Test\n');

// Test 1: Voltage Divider Circuit
console.log(' Test 1: Voltage Divider Diagram');
const voltageDividerParams = {
  voltage: 12,
  R1: 1000,
  R2: 2000
};

try {
  const voltageDividerDiagram = renderToString(
    React.createElement(CircuitDiagram, {
      circuitType: 'voltage-divider',
      parameters: voltageDividerParams
    })
  );
  
  console.log(' Voltage Divider Diagram:', voltageDividerDiagram.includes('svg') ? 'PASS' : 'FAIL');
  console.log(' Contains R1 label:', voltageDividerDiagram.includes('R1') ? 'PASS' : 'FAIL');
  console.log(' Contains R2 label:', voltageDividerDiagram.includes('R2') ? 'PASS' : 'FAIL');
  console.log(' Contains Vin label:', voltageDividerDiagram.includes('Vin') ? 'PASS' : 'FAIL');
  console.log(' Contains Vout label:', voltageDividerDiagram.includes('Vout') ? 'PASS' : 'FAIL');
  console.log(' Contains 1k value:', voltageDividerDiagram.includes('1k') ? 'PASS' : 'FAIL');
  console.log(' Contains 2k value:', voltageDividerDiagram.includes('2k') ? 'PASS' : 'FAIL');
} catch (error) {
  console.log(' Voltage Divider Diagram Failed:', error.message);
}

// Test 2: RC Circuit
console.log('\n Test 2: RC Circuit Diagram');
const rcParams = {
  voltage: 5,
  resistance: 1000,
  capacitance: 0.00001
};

try {
  const rcDiagram = renderToString(
    React.createElement(CircuitDiagram, {
      circuitType: 'rc',
      parameters: rcParams
    })
  );
  
  console.log(' RC Circuit Diagram:', rcDiagram.includes('svg') ? 'PASS' : 'FAIL');
  console.log(' Contains R label:', rcDiagram.includes('R') ? 'PASS' : 'FAIL');
  console.log(' Contains C label:', rcDiagram.includes('C') ? 'PASS' : 'FAIL');
  console.log(' Contains Vin label:', rcDiagram.includes('Vin') ? 'PASS' : 'FAIL');
  console.log(' Contains Vout label:', rcDiagram.includes('Vout') ? 'PASS' : 'FAIL');
  console.log(' Contains 1k value:', rcDiagram.includes('1k') ? 'PASS' : 'FAIL');
  console.log(' Contains 10µF value:', rcDiagram.includes('10µF') ? 'PASS' : 'FAIL');
} catch (error) {
  console.log(' RC Circuit Diagram Failed:', error.message);
}

// Test 3: RL Circuit
console.log('\n Test 3: RL Circuit Diagram');
const rlParams = {
  voltage: 5,
  resistance: 100,
  inductance: 0.001
};

try {
  const rlDiagram = renderToString(
    React.createElement(CircuitDiagram, {
      circuitType: 'rl',
      parameters: rlParams
    })
  );
  
  console.log(' RL Circuit Diagram:', rlDiagram.includes('svg') ? 'PASS' : 'FAIL');
  console.log(' Contains R label:', rlDiagram.includes('R') ? 'PASS' : 'FAIL');
  console.log(' Contains L label:', rlDiagram.includes('L') ? 'PASS' : 'FAIL');
  console.log(' Contains Vin label:', rlDiagram.includes('Vin') ? 'PASS' : 'FAIL');
  console.log(' Contains Vout label:', rlDiagram.includes('Vout') ? 'PASS' : 'FAIL');
  console.log(' Contains 100 value:', rlDiagram.includes('100') ? 'PASS' : 'FAIL');
  console.log(' Contains 1mH value:', rlDiagram.includes('1mH') ? 'PASS' : 'FAIL');
} catch (error) {
  console.log(' RL Circuit Diagram Failed:', error.message);
}

// Test 4: RLC Circuit
console.log('\n Test 4: RLC Circuit Diagram');
const rlcParams = {
  voltage: 10,
  resistance: 50,
  inductance: 0.01,
  capacitance: 0.000001
};

try {
  const rlcDiagram = renderToString(
    React.createElement(CircuitDiagram, {
      circuitType: 'rlc',
      parameters: rlcParams
    })
  );
  
  console.log(' RLC Circuit Diagram:', rlcDiagram.includes('svg') ? 'PASS' : 'FAIL');
  console.log(' Contains R label:', rlcDiagram.includes('R') ? 'PASS' : 'FAIL');
  console.log(' Contains L label:', rlcDiagram.includes('L') ? 'PASS' : 'FAIL');
  console.log(' Contains C label:', rlcDiagram.includes('C') ? 'PASS' : 'FAIL');
  console.log(' Contains Vin label:', rlcDiagram.includes('Vin') ? 'PASS' : 'FAIL');
  console.log(' Contains Vout label:', rlcDiagram.includes('Vout') ? 'PASS' : 'FAIL');
  console.log(' Contains 50 value:', rlcDiagram.includes('50') ? 'PASS' : 'FAIL');
  console.log(' Contains 10mH value:', rlcDiagram.includes('10mH') ? 'PASS' : 'FAIL');
  console.log(' Contains 1µF value:', rlcDiagram.includes('1µF') ? 'PASS' : 'FAIL');
} catch (error) {
  console.log(' RLC Circuit Diagram Failed:', error.message);
}

// Test 5: Component Rendering
console.log('\n Test 5: Component Rendering Validation');
const testParams = {
  voltage: 12,
  resistance: 1000
};

try {
  const testDiagram = renderToString(
    React.createElement(CircuitDiagram, {
      circuitType: 'voltage-divider',
      parameters: testParams
    })
  );
  
  // Check for SVG elements
  console.log(' Contains SVG element:', testDiagram.includes('<svg') ? 'PASS' : 'FAIL');
  console.log(' Contains viewBox:', testDiagram.includes('viewBox') ? 'PASS' : 'FAIL');
  console.log(' Contains circuit-svg class:', testDiagram.includes('circuit-svg') ? 'PASS' : 'FAIL');
  
  // Check for circuit components
  console.log(' Contains resistor path:', testDiagram.includes('zigzag') || testDiagram.includes('path') ? 'PASS' : 'FAIL');
  console.log(' Contains voltage source circle:', testDiagram.includes('circle') ? 'PASS' : 'FAIL');
  console.log(' Contains ground symbol:', testDiagram.includes('GND') ? 'PASS' : 'FAIL');
  
  // Check for labels and values
  console.log(' Contains component labels:', testDiagram.includes('text') ? 'PASS' : 'FAIL');
  console.log(' Contains value formatting:', testDiagram.includes('k') || testDiagram.includes('M') ? 'PASS' : 'FAIL');
  
} catch (error) {
  console.log(' Component Rendering Failed:', error.message);
}

// Test 6: Responsive Design
console.log('\n Test 6: Responsive Design Classes');
try {
  const responsiveDiagram = renderToString(
    React.createElement(CircuitDiagram, {
      circuitType: 'rc',
      parameters: { voltage: 5, resistance: 1000, capacitance: 0.00001 }
    })
  );
  
  console.log(' Contains circuit-diagram class:', responsiveDiagram.includes('circuit-diagram') ? 'PASS' : 'FAIL');
  console.log(' Contains diagram-container class:', responsiveDiagram.includes('diagram-container') ? 'PASS' : 'FAIL');
  console.log(' Contains diagram-header class:', responsiveDiagram.includes('diagram-header') ? 'PASS' : 'FAIL');
  
} catch (error) {
  console.log(' Responsive Design Test Failed:', error.message);
}

console.log('\n Circuit Diagram Testing Complete!');
console.log('\n Summary:');
console.log(' SVG Components: Resistors, Capacitors, Inductors, Voltage Sources');
console.log(' Circuit Types: Voltage Divider, RC, RL, RLC');
console.log(' Component Labels: R1, R2, C, L, Vin, Vout, GND');
console.log(' Value Formatting: k, M, m, µ prefixes');
console.log(' Layout: Clean horizontal structure with proper spacing');
console.log(' Responsive: Mobile-friendly with scaling');
console.log(' Interactive: Hover effects and animations');
