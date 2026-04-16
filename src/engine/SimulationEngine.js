/**
 * Core Simulation Engine
 * Handles circuit simulation calculations and time-series data generation
 */

import { CIRCUIT_TYPES, SIMULATION_MODES, validateCircuit } from './CircuitSchema.js';

/**
 * Main simulation engine class
 */
export class SimulationEngine {
  constructor() {
    this.simulators = {
      [CIRCUIT_TYPES.RC]: new RCSimulator(),
      [CIRCUIT_TYPES.RL]: new RLSimulator(),
      [CIRCUIT_TYPES.RLC]: new RLCSimulator(),
      [CIRCUIT_TYPES.OPAMP]: new OpAmpSimulator(),
      [CIRCUIT_TYPES.BJT]: new BJTSimulator(),
      [CIRCUIT_TYPES.DIGITAL]: new DigitalSimulator()
    };
  }

  /**
   * Simulates a circuit and returns time-series data
   * @param {Object} circuit - Structured circuit object
   * @param {Object} options - Simulation options
   * @returns {Object} Simulation result with time-series data
   */
  simulate(circuit, options = {}) {
    const simulator = this.simulators[circuit.type];
    if (!simulator) {
      throw new Error(`No simulator available for circuit type: ${circuit.type}`);
    }

    return simulator.simulate(circuit, options);
  }

  /**
   * Registers a new simulator for a circuit type
   * @param {string} type - Circuit type
   * @param {Object} simulator - Simulator instance
   */
  registerSimulator(type, simulator) {
    this.simulators[type] = simulator;
  }

  /**
   * Gets available circuit types
   * @returns {string[]} Array of circuit types
   */
  getAvailableTypes() {
    return Object.keys(this.simulators);
  }
}

/**
 * Base simulator class
 */
class BaseSimulator {
  /**
   * Generates time points for simulation
   * @param {number} timeConstant - Circuit time constant
   * @param {number} duration - Simulation duration in time constants
   * @param {number} numPoints - Number of data points
   * @returns {number[]} Array of time points
   */
  generateTimePoints(timeConstant, duration = 5, numPoints = 100) {
    const maxTime = duration * timeConstant;
    const points = [];
    
    for (let i = 0; i <= numPoints; i++) {
      const t = (i / numPoints) * maxTime;
      points.push(t);
    }
    
    return points;
  }

  /**
   * Formats simulation result
   * @param {number[]} timePoints - Time points array
   * @param {number[]} values - Values array
   * @param {Object} circuit - Original circuit
   * @param {string} chartType - Type of chart data
   * @returns {Object} Formatted result
   */
  formatResult(timePoints, values, circuit, chartType = 'voltage') {
    return {
      labels: timePoints.map(t => (t * 1000).toFixed(1)), // Convert to ms
      data: values,
      chartType,
      circuitParams: {
        ...circuit,
        timeConstant: this.calculateTimeConstant(circuit),
        maxTime: Math.max(...timePoints) * 1000 // Convert to ms
      }
    };
  }
}

/**
 * RC Circuit Simulator
 */
class RCSimulator extends BaseSimulator {
  calculateTimeConstant(circuit) {
    return circuit.components.R * circuit.components.C;
  }

  simulate(circuit, options = {}) {
    const { R, C, Vin = 5 } = circuit.components;
    const { mode } = circuit;
    const timeConstant = R * C;
    
    const timePoints = this.generateTimePoints(timeConstant);
    const values = timePoints.map(t => {
      if (mode === SIMULATION_MODES.DISCHARGING) {
        return Vin * Math.exp(-t / timeConstant);
      } else {
        return Vin * (1 - Math.exp(-t / timeConstant));
      }
    });

    return this.formatResult(timePoints, values, circuit, 'voltage');
  }
}

/**
 * RL Circuit Simulator
 * Implements I(t) = (V/R) * (1 - exp(-Rt/L))
 */
class RLSimulator extends BaseSimulator {
  calculateTimeConstant(circuit) {
    return circuit.components.L / circuit.components.R;
  }

  simulate(circuit, options = {}) {
    const { R, L, Vin = 5 } = circuit.components;
    const { mode } = circuit;
    const timeConstant = L / R;
    const finalCurrent = Vin / R;
    
    const timePoints = this.generateTimePoints(timeConstant);
    const values = timePoints.map(t => {
      // RL differential equation: I(t) = (V/R) * (1 - exp(-Rt/L))
      if (mode === SIMULATION_MODES.DISCHARGING) {
        // Discharging: I(t) = I0 * exp(-Rt/L)
        return finalCurrent * Math.exp(-R * t / L);
      } else {
        // Charging: I(t) = (V/R) * (1 - exp(-Rt/L))
        return (Vin / R) * (1 - Math.exp(-R * t / L));
      }
    });

    // Add additional parameters for enhanced analysis
    const enhancedCircuit = {
      ...circuit,
      timeConstant,
      finalCurrent,
      inductance: L,
      resistance: R,
      equation: 'I(t) = (V/R) * (1 - exp(-Rt/L))',
      circuitType: 'RL'
    };

    return this.formatResult(timePoints, values, enhancedCircuit, 'current');
  }
}

/**
 * RLC Circuit Simulator
 * Solves second-order differential equation: d²q/dt² + (R/L)dq/dt + (1/LC)q = V(t)/L
 */
class RLCSimulator extends BaseSimulator {
  calculateTimeConstant(circuit) {
    const { R, L, C } = circuit.components;
    return 2 * L / R; // Damping factor
  }

  getDampingClassification(zeta) {
    if (zeta < 1) {
      return {
        type: 'underdamped',
        description: 'Oscillatory response with exponential decay',
        formula: 'ζ < 1: Underdamped'
      };
    } else if (zeta === 1) {
      return {
        type: 'critically_damped',
        description: 'Fastest response without oscillation',
        formula: 'ζ = 1: Critically damped'
      };
    } else {
      return {
        type: 'overdamped',
        description: 'Slow response without oscillation',
        formula: 'ζ > 1: Overdamped'
      };
    }
  }

  simulate(circuit, options = {}) {
    const { R, L, C, Vin = 5 } = circuit.components;
    const { mode } = circuit;
    
    // Calculate RLC parameters
    const omega0 = 1 / Math.sqrt(L * C); // Natural frequency (rad/s)
    const zeta = R / (2 * Math.sqrt(L / C)); // Damping ratio
    const timeConstant = 2 * L / R;
    const dampingInfo = this.getDampingClassification(zeta);
    
    const timePoints = this.generateTimePoints(timeConstant, 10); // Longer for oscillations
    const values = timePoints.map(t => {
      if (zeta < 1) {
        // Underdamped - oscillatory response
        const omegaD = omega0 * Math.sqrt(1 - zeta * zeta); // Damped frequency
        if (mode === SIMULATION_MODES.DISCHARGING) {
          // Discharging: V(t) = V0 * exp(-ζω₀t) * cos(ωd*t)
          return Vin * Math.exp(-zeta * omega0 * t) * Math.cos(omegaD * t);
        } else {
          // Charging: V(t) = Vin(1 - exp(-ζω₀t)[cos(ωd*t) + (ζω₀/ωd)sin(ωd*t)])
          return Vin * (1 - Math.exp(-zeta * omega0 * t) * 
                 (Math.cos(omegaD * t) + (zeta * omega0 / omegaD) * Math.sin(omegaD * t)));
        }
      } else if (Math.abs(zeta - 1) < 0.001) {
        // Critically damped (within numerical precision)
        if (mode === SIMULATION_MODES.DISCHARGING) {
          // Discharging: V(t) = V0 * exp(-ω₀t)(1 + ω₀t)
          return Vin * Math.exp(-omega0 * t) * (1 + omega0 * t);
        } else {
          // Charging: V(t) = Vin[1 - exp(-ω₀t)(1 + ω₀t)]
          return Vin * (1 - Math.exp(-omega0 * t) * (1 + omega0 * t));
        }
      } else {
        // Overdamped
        const r1 = -omega0 * (zeta - Math.sqrt(zeta * zeta - 1));
        const r2 = -omega0 * (zeta + Math.sqrt(zeta * zeta - 1));
        if (mode === SIMULATION_MODES.DISCHARGING) {
          // Discharging: V(t) = V0[(r₂eʳ¹ᵗ - r₁eʳ²ᵗ)/(r₂ - r₁)]
          return Vin * ((r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1));
        } else {
          // Charging: V(t) = Vin[1 - (r₂eʳ¹ᵗ - r₁eʳ²ᵗ)/(r₂ - r₁)]
          return Vin * (1 - ((r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1)));
        }
      }
    });

    // Add additional parameters for enhanced analysis
    const enhancedCircuit = {
      ...circuit,
      timeConstant,
      naturalFrequency: omega0,
      dampingRatio: zeta,
      dampingClassification: dampingInfo,
      inductance: L,
      capacitance: C,
      resistance: R,
      equation: 'd²q/dt² + (R/L)dq/dt + (1/LC)q = V(t)/L',
      circuitType: 'RLC',
      resonanceFrequency: omega0 / (2 * Math.PI), // Hz
      qualityFactor: omega0 * L / R // Q factor
    };

    return this.formatResult(timePoints, values, enhancedCircuit, 'voltage');
  }
}

/**
 * Operational Amplifier Simulator
 */
class OpAmpSimulator extends BaseSimulator {
  calculateTimeConstant(circuit) {
    return 1e-6; // Very fast response
  }

  simulate(circuit, options = {}) {
    const { R = 1000, Vin = 1, gain } = circuit.components;
    const { mode } = circuit;
    
    // Determine op-amp configuration
    const isComparator = mode === SIMULATION_MODES.AC || mode === 'comparator';
    const isInverting = mode === SIMULATION_MODES.CHARGING || mode === 'inverting';
    
    const timePoints = this.generateTimePoints(1e-6, 1, 10);
    const values = timePoints.map(t => {
      if (isComparator) {
        // Comparator mode: output saturates at ±Vsat
        return Math.sign(Vin) * Math.min(Math.abs(Vin), 10); // ±10V saturation
      } else if (isInverting) {
        // Inverting amplifier: Vout = -Rf/Rin * Vin
        const Rf = gain || R; // Use gain as feedback resistor if specified
        return -(Rf / R) * Vin;
      } else {
        // Non-inverting buffer: Vout = Vin
        return Vin;
      }
    });

    // Enhanced circuit parameters
    const enhancedCircuit = {
      ...circuit,
      timeConstant: 1e-6,
      gain: gain || 1,
      configuration: isComparator ? 'comparator' : (isInverting ? 'inverting' : 'non_inverting'),
      equation: isComparator ? 'Vout = ±Vsat' : 
                 isInverting ? 'Vout = -(Rf/Rin) × Vin' : 'Vout = Vin',
      circuitType: 'OPAMP',
      slewRate: 1e6 // V/μs typical slew rate
    };

    return this.formatResult(timePoints, values, enhancedCircuit, 'voltage');
  }
}

/**
 * BJT Transistor Simulator
 */
class BJTSimulator extends BaseSimulator {
  calculateTimeConstant(circuit) {
    return 1e-9; // Very fast switching
  }

  simulate(circuit, options = {}) {
    const { R = 1000, Vin = 5, beta = 100, Vbe = 0.7, configuration } = circuit.components;
    const { mode } = circuit;
    
    const timePoints = this.generateTimePoints(1e-9);
    const values = timePoints.map(t => {
      // BJT DC model based on configuration
      if (mode === SIMULATION_MODES.CHARGING) {
        return this.calculateChargingBehavior(t, circuit, beta, Vbe);
      } else if (mode === SIMULATION_MODES.DISCHARGING) {
        return this.calculateDischargingBehavior(t, circuit, beta, Vbe);
      } else {
        return this.calculateSteadyState(circuit, beta, Vbe);
      }
    });

    return this.formatResult(timePoints, values, circuit, 'current');
  }
}

/**
 * Digital Logic Simulator
 */
class DigitalSimulator extends BaseSimulator {
  calculateTimeConstant(circuit) {
    return 1e-9; // Very fast digital response
  }

  simulate(circuit, options = {}) {
    const { Vin = 5, logicType = 'AND', inputs = [1, 1] } = circuit.components;
    const { mode } = circuit;
    
    // Generate truth table and logic gate simulation
    const truthTable = this.generateTruthTable(logicType, inputs.length);
    const currentOutput = this.evaluateLogicGate(logicType, inputs);
    
    // Create time series data for visualization
    const timePoints = this.generateTimePoints(this.calculateTimeConstant(circuit), 1, 10);
    const values = timePoints.map(t => {
      // Digital step response with current output value
      if (mode === SIMULATION_MODES.DISCHARGING) {
        return Vin * Math.exp(-t / 1e-9) * (1 - currentOutput);
      } else {
        return Vin * (1 - Math.exp(-t / 1e-9)) * currentOutput;
      }
    });

    const enhancedCircuit = {
      ...circuit,
      timeConstant: 1e-9,
      logicType: logicType,
      inputs: inputs,
      outputs: [currentOutput],
      truthTable: truthTable,
      equation: this.getLogicEquation(logicType),
      circuitType: 'DIGITAL',
      currentOutput: currentOutput
    };

    return this.formatResult(timePoints, values, enhancedCircuit, 'voltage');
  }

  generateTruthTable(logicType, numInputs) {
    const table = [];
    const numRows = Math.pow(2, numInputs);
    
    for (let i = 0; i < numRows; i++) {
      const inputs = [];
      for (let j = numInputs - 1; j >= 0; j--) {
        inputs.push((i >> j) & 1);
      }
      const output = this.evaluateLogicGate(logicType, inputs);
      table.push({ inputs, output });
    }
    
    return table;
  }

  evaluateLogicGate(logicType, inputs) {
    switch (logicType.toUpperCase()) {
      case 'AND':
        return inputs.every(input => input === 1) ? 1 : 0;
      case 'OR':
        return inputs.some(input => input === 1) ? 1 : 0;
      case 'NOT':
        return inputs[0] === 1 ? 0 : 1;
      case 'NAND':
        return inputs.every(input => input === 1) ? 0 : 1;
      case 'NOR':
        return inputs.some(input => input === 1) ? 0 : 1;
      case 'XOR':
        return inputs.reduce((sum, input) => sum + input, 0) % 2;
      case 'XNOR':
        return inputs.reduce((sum, input) => sum + input, 0) % 2 === 0 ? 1 : 0;
      default:
        return 0;
    }
  }

  getLogicEquation(logicType) {
    switch (logicType.toUpperCase()) {
      case 'AND':
        return 'Output = A · B';
      case 'OR':
        return 'Output = A + B';
      case 'NOT':
        return 'Output = ¬A';
      case 'NAND':
        return 'Output = ¬(A · B)';
      case 'NOR':
        return 'Output = ¬(A + B)';
      case 'XOR':
        return 'Output = A XOR B';
      case 'XNOR':
        return 'Output = ¬(A XOR B)';
      default:
        return 'Output = Logic Function';
    }
  }
}

// Create singleton instance
const simulationEngine = new SimulationEngine();

// Export singleton instance
export default SimulationEngine;
export { simulationEngine };

// Legacy functions for backward compatibility
export const generateRCSimulation = (params) => {
  const circuit = {
    type: CIRCUIT_TYPES.RC,
    mode: params.simulationType || SIMULATION_MODES.CHARGING,
    components: {
      R: params.resistance,
      C: params.capacitance,
      Vin: params.V0 || 5
    }
  };
  
  return simulationEngine.simulate(circuit);
};

export const generateRLSimulation = (params) => {
  const circuit = {
    type: CIRCUIT_TYPES.RL,
    mode: params.simulationType || SIMULATION_MODES.CHARGING,
    components: {
      R: params.resistance,
      L: params.inductance,
      Vin: params.V0 || 5
    }
  };
  
  return simulationEngine.simulate(circuit);
};

export const generateOhmsSimulation = (params) => {
  return {
    labels: ['Result'],
    data: [params.current],
    chartType: 'static',
    circuitParams: {
      ...params,
      experimentType: 'ohms'
    }
  };
};

export const generateVoltageDividerSimulation = (params) => {
  return {
    labels: ['Vin', 'Vout'],
    data: [params.vin, params.vout],
    chartType: 'comparison',
    circuitParams: {
      ...params,
      experimentType: 'voltage-divider'
    }
  };
};

export const generateBJTSimulation = (params) => {
  const circuit = {
    type: CIRCUIT_TYPES.BJT,
    mode: params.simulationType || SIMULATION_MODES.CHARGING,
    components: {
      R: params.resistance,
      Vin: params.V0 || 5,
      beta: params.beta || 100,
      Vbe: params.Vbe || 0.7,
      configuration: params.configuration || 'common_emitter'
    }
  };
  
  return simulationEngine.simulate(circuit);
};
