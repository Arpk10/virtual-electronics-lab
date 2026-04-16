/**
 * Circuit Simulation Engine Module
 * Main entry point for the modular simulation system
 */

export { 
  CIRCUIT_TYPES, 
  SIMULATION_MODES, 
  validateCircuit, 
  createDefaultCircuit 
} from './CircuitSchema.js';

export { 
  parseCircuitInput,
  parseCircuitToJSON,
  parseRCCircuit,
  parseRLCircuit,
  parseOhmsLaw,
  parseVoltageDivider
} from './CircuitParser.js';

export { 
  SimulationEngine,
  simulationEngine,
  generateRCSimulation,
  generateRLSimulation,
  generateOhmsSimulation,
  generateVoltageDividerSimulation,
  generateBJTSimulation
} from './SimulationEngine.js';

/**
 * High-level API for circuit simulation
 * Combines parsing and simulation in one call
 */
export const simulateCircuit = (input, options = {}) => {
  const { circuit, confidence, errors } = parseCircuitInput(input, options.defaultType);
  
  if (errors.length > 0 && !options.ignoreErrors) {
    throw new Error(`Circuit validation failed: ${errors.join(', ')}`);
  }
  
  return simulationEngine.simulate(circuit, options);
};

/**
 * Validates and simulates a structured circuit object
 */
export const simulateStructuredCircuit = (circuit, options = {}) => {
  const { isValid, errors } = validateCircuit(circuit);
  
  if (!isValid && !options.ignoreErrors) {
    throw new Error(`Circuit validation failed: ${errors.join(', ')}`);
  }
  
  return simulationEngine.simulate(circuit, options);
};
