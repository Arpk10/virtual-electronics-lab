/**
 * Circuit Schema Definition and Validation
 * Defines the structure for circuit objects and provides validation
 */

export const CIRCUIT_TYPES = {
  RC: 'RC',
  RL: 'RL', 
  RLC: 'RLC',
  OPAMP: 'OPAMP',
  BJT: 'BJT',
  DIGITAL: 'DIGITAL'
};

export const SIMULATION_MODES = {
  CHARGING: 'charging',
  DISCHARGING: 'discharging',
  AC: 'ac',
  TRANSIENT: 'transient'
};

/**
 * Base circuit schema structure
 */
export const CIRCUIT_SCHEMA = {
  type: {
    type: 'string',
    enum: Object.values(CIRCUIT_TYPES),
    required: true
  },
  components: {
    type: 'object',
    required: true,
    properties: {
      R: { type: 'number', minimum: 0 },
      C: { type: 'number', minimum: 0 },
      L: { type: 'number', minimum: 0 },
      Vin: { type: 'number' },
      frequency: { type: 'number', minimum: 0 }
    }
  },
  mode: {
    type: 'string',
    enum: Object.values(SIMULATION_MODES),
    required: true
  }
};

/**
 * Component requirements for each circuit type
 */
export const COMPONENT_REQUIREMENTS = {
  [CIRCUIT_TYPES.RC]: ['R', 'C'],
  [CIRCUIT_TYPES.RL]: ['R', 'L'],
  [CIRCUIT_TYPES.RLC]: ['R', 'L', 'C'],
  [CIRCUIT_TYPES.OPAMP]: ['R', 'Vin'],
  [CIRCUIT_TYPES.BJT]: ['R', 'Vin'],
  [CIRCUIT_TYPES.DIGITAL]: ['Vin']
};

/**
 * Validates a circuit object against the schema
 * @param {Object} circuit - Circuit object to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export const validateCircuit = (circuit) => {
  const errors = [];

  // Check if circuit is an object
  if (!circuit || typeof circuit !== 'object') {
    errors.push('Circuit must be an object');
    return { isValid: false, errors };
  }

  // Validate type
  if (!circuit.type || !Object.values(CIRCUIT_TYPES).includes(circuit.type)) {
    errors.push(`Invalid circuit type. Must be one of: ${Object.values(CIRCUIT_TYPES).join(', ')}`);
  }

  // Validate mode
  if (!circuit.mode || !Object.values(SIMULATION_MODES).includes(circuit.mode)) {
    errors.push(`Invalid simulation mode. Must be one of: ${Object.values(SIMULATION_MODES).join(', ')}`);
  }

  // Validate components
  if (!circuit.components || typeof circuit.components !== 'object') {
    errors.push('Components must be an object');
  } else {
    // Check required components for circuit type
    if (circuit.type && COMPONENT_REQUIREMENTS[circuit.type]) {
      const requiredComponents = COMPONENT_REQUIREMENTS[circuit.type];
      for (const component of requiredComponents) {
        if (!(component in circuit.components)) {
          errors.push(`Missing required component: ${component}`);
        } else if (typeof circuit.components[component] !== 'number') {
          errors.push(`Component ${component} must be a number`);
        } else if (circuit.components[component] < 0 && component !== 'Vin') {
          errors.push(`Component ${component} must be non-negative`);
        }
      }
    }

    // Validate component values
    for (const [key, value] of Object.entries(circuit.components)) {
      if (typeof value !== 'number') {
        errors.push(`Component ${key} must be a number`);
      } else if (key !== 'Vin' && value < 0) {
        errors.push(`Component ${key} must be non-negative`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Creates a default circuit object for a given type
 * @param {string} type - Circuit type
 * @param {string} mode - Simulation mode
 * @returns {Object} Default circuit object
 */
export const createDefaultCircuit = (type, mode = SIMULATION_MODES.CHARGING) => {
  const defaults = {
    [CIRCUIT_TYPES.RC]: {
      type,
      mode,
      components: {
        R: 1000,    // 1kΩ
        C: 10e-6,   // 10μF
        Vin: 5      // 5V
      }
    },
    [CIRCUIT_TYPES.RL]: {
      type,
      mode,
      components: {
        R: 100,     // 100Ω
        L: 0.01,    // 10mH
        Vin: 5      // 5V
      }
    },
    [CIRCUIT_TYPES.RLC]: {
      type,
      mode,
      components: {
        R: 100,     // 100Ω
        L: 0.01,    // 10mH
        C: 10e-6,   // 10μF
        Vin: 5      // 5V
      }
    },
    [CIRCUIT_TYPES.OPAMP]: {
      type,
      mode,
      components: {
        R: 1000,    // 1kΩ
        Vin: 1      // 1V
      }
    },
    [CIRCUIT_TYPES.BJT]: {
      type,
      mode,
      components: {
        R: 1000,    // 1kΩ
        Vin: 5      // 5V
      }
    },
    [CIRCUIT_TYPES.DIGITAL]: {
      type,
      mode,
      components: {
        Vin: 5      // 5V
      }
    }
  };

  return defaults[type] || defaults[CIRCUIT_TYPES.RC];
};
