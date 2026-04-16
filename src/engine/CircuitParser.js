/**
 * Circuit Parser Module
 * Converts natural language input to structured circuit objects
 */

import { CIRCUIT_TYPES, SIMULATION_MODES, validateCircuit } from './CircuitSchema.js';

/**
 * Parses natural language input into a structured circuit object
 * @param {string} input - Natural language description of circuit
 * @param {string} defaultType - Default circuit type if not specified
 * @returns {Object} { circuit: Object, confidence: number, errors: string[] }
 */
export const parseCircuitInput = (input, defaultType = CIRCUIT_TYPES.RC) => {
  const text = input.toLowerCase().trim();
  const errors = [];
  let circuit = null;
  let confidence = 0;

  try {
    // Detect circuit type
    const detectedType = detectCircuitType(text) || defaultType;
    
    // Parse components based on detected type
    const components = parseComponents(text, detectedType);
    
    // Parse simulation mode
    const mode = parseSimulationMode(text, detectedType);
    
    // Create circuit object
    circuit = {
      type: detectedType,
      mode,
      components
    };

    // Validate the circuit
    const validation = validateCircuit(circuit);
    if (!validation.isValid) {
      errors.push(...validation.errors);
    }

    // Calculate confidence based on how well we could parse
    confidence = calculateConfidence(text, circuit, errors);

  } catch (error) {
    errors.push(`Parsing error: ${error.message}`);
    // Fallback to default circuit
    circuit = createFallbackCircuit(defaultType);
  }

  return {
    circuit,
    confidence,
    errors
  };
};

/**
 * Detects the circuit type from text with enhanced patterns
 */
const detectCircuitType = (text) => {
  const lowerText = text.toLowerCase();
  
  // Check for specific circuit types with more robust patterns
  if (/\brc\s+circuit\b/.test(lowerText) || 
      (/\brc\s*\b/.test(lowerText) && /\b(capacitor|cap)\b/.test(lowerText)) ||
      (/\b(resistor|res)\b/.test(lowerText) && /\b(capacitor|cap)\b/.test(lowerText))) {
    return CIRCUIT_TYPES.RC;
  }
  
  if (/\brl\s+circuit\b/.test(lowerText) || 
      (/\brl\s*\b/.test(lowerText) && /\b(inductor|ind)\b/.test(lowerText)) ||
      (/\b(resistor|res)\b/.test(lowerText) && /\b(inductor|ind)\b/.test(lowerText))) {
    return CIRCUIT_TYPES.RL;
  }
  
  if (/\brlc\s+circuit\b/.test(lowerText) || 
      (/\brlc\s*\b/.test(lowerText) && /\b(capacitor|cap)\b/.test(lowerText) && /\b(inductor|ind)\b/.test(lowerText))) {
    return CIRCUIT_TYPES.RLC;
  }
  
  // Enhanced operational amplifier detection
  if (/\b(op-?amp|operational\s+amplifier)\b/.test(lowerText) || 
      (/\binverting\s+amp\b/.test(lowerText)) ||
      (/\bnon-?inverting\s+amp\b/.test(lowerText)) ||
      (/\bgain\s+\d+\b/.test(lowerText))) {
    return CIRCUIT_TYPES.OPAMP;
  }
  
  // Enhanced BJT detection
  if (/\b(bjt|transistor)\b/.test(lowerText) && 
      (/\b(common\s+emitter|ce)\b/.test(lowerText) ||
       /\b(common\s+collector|cc)\b/.test(lowerText) ||
       /\b(common\s+base|cb)\b/.test(lowerText) ||
       /\b(emitter\s+follower|ef)\b/.test(lowerText) ||
       /\b(darlington\s+pair)\b/.test(lowerText))) {
    return CIRCUIT_TYPES.BJT;
  }
  
  // Enhanced digital logic detection
  if (/\b(and|nand|or|nor|xor|xnor)\b/.test(lowerText) || 
      (/\b(not\s+gate|nand|nor|xor|xnor)\b/.test(lowerText)) ||
      (/\b(flip-?flop|latch)\b/.test(lowerText)) ||
      (/\b(truth\s+table|logic)\b/.test(lowerText))) {
    return CIRCUIT_TYPES.DIGITAL;
  }
  
  return null;
};

/**
 * Parses component values from text with robust unit parsing
 */
const parseComponents = (text, circuitType) => {
  const components = {};

  // Enhanced resistance parsing with multiple unit support
  const resistancePatterns = [
    /r\s*=\s*([\d.]+)\s*(k?ohms?|kω|ω)/gi,
    /r\s*=\s*([\d.]+)\s*(m?ohms?|mω)/gi,
    /r\s*=\s*([\d.]+)\s*(g?ohms?|gω)/gi
  ];
  
  for (const pattern of resistancePatterns) {
    const match = text.match(pattern);
    if (match) {
      let value = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      if (unit.startsWith('k')) value *= 1000;
      else if (unit.startsWith('m')) value *= 1000000;
      else if (unit.startsWith('g')) value *= 1000000000;
      components.R = value;
      break;
    }
  }

  // Enhanced capacitance parsing with comprehensive unit support
  const capacitancePatterns = [
    /c\s*=\s*([\d.]+)\s*(p?f|pf)/gi,
    /c\s*=\s*([\d.]+)\s*(n?f|nf)/gi,
    /c\s*=\s*([\d.]+)\s*(μ?uf|μf)/gi,
    /c\s*=\s*([\d.]+)\s*(m?f|mf)/gi,
    /c\s*=\s*([\d.]+)\s*f/gi
  ];
  
  for (const pattern of capacitancePatterns) {
    const match = text.match(pattern);
    if (match) {
      let value = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      if (unit.startsWith('p')) value *= 1e-12;
      else if (unit.startsWith('n')) value *= 1e-9;
      else if (unit.startsWith('μ')) value *= 1e-6;
      else if (unit.startsWith('m')) value *= 1e-3;
      components.C = value;
      break;
    }
  }

  // Enhanced inductance parsing with comprehensive unit support
  const inductancePatterns = [
    /l\s*=\s*([\d.]+)\s*(μ?h|μh)/gi,
    /l\s*=\s*([\d.]+)\s*(m?h|mh)/gi,
    /l\s*=\s*([\d.]+)\s*(n?h|nh)/gi,
    /l\s*=\s*([\d.]+)\s*ph/gi
  ];
  
  for (const pattern of inductancePatterns) {
    const match = text.match(pattern);
    if (match) {
      let value = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      if (unit.startsWith('μ')) value *= 1e-6;
      else if (unit.startsWith('m')) value *= 1e-3;
      else if (unit.startsWith('n')) value *= 1e-9;
      else if (unit === 'h') value *= 1;
      components.L = value;
      break;
    }
  }

  // Enhanced voltage parsing with AC support
  const voltagePatterns = [
    /(?:vin|v)\s*=\s*([\d.]+(?:\.\d+)?)\s*v(?:ac)?/gi,
    /(?:vin|v)\s*=\s*([\d.]+)\s*(mv|v)/gi,
    /(?:vin|v)\s*=\s*([\d.]+)\s*(kv|v)/gi
  ];
  
  for (const pattern of voltagePatterns) {
    const match = text.match(pattern);
    if (match) {
      let value = parseFloat(match[1]);
      const unit = (match[3] || match[2]).toLowerCase();
      if (unit === 'mv') value /= 1000;
      else if (unit === 'kv') value *= 1000;
      components.Vin = value;
      break;
    }
  }

  // Enhanced frequency parsing
  const frequencyPatterns = [
    /(?:freq|frequency)\s*=\s*([\d.]+(?:\.\d+)?)\s*(hz|khz|mhz|ghz)/gi,
    /(?:freq|frequency)\s*=\s*([\d.]+)\s*(hz|khz|mhz|ghz)/gi
  ];
  
  for (const pattern of frequencyPatterns) {
    const match = text.match(pattern);
    if (match) {
      let value = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      if (unit.startsWith('k')) value *= 1000;
      else if (unit.startsWith('m')) value *= 1000000;
      else if (unit.startsWith('g')) value *= 1000000000;
      components.frequency = value;
      break;
    }
  }

  // Parse additional parameters for advanced circuits
  parseAdvancedParameters(text, components);

  // Set default values for required components
  setDefaultComponents(components, circuitType);

  return components;
};

/**
 * Parses advanced parameters for operational amplifiers, BJT circuits, etc.
 */
const parseAdvancedParameters = (text, components) => {
  const lowerText = text.toLowerCase();
  
  // Parse operational amplifier gain
  const gainMatch = lowerText.match(/gain\s*=\s*([\d.]+)/i);
  if (gainMatch) {
    components.gain = parseFloat(gainMatch[1]);
  }
  
  // Parse BJT configuration
  if (/\b(common\s+emitter|ce)\b/.test(lowerText)) {
    components.configuration = 'common_emitter';
  } else if (/\b(common\s+collector|cc)\b/.test(lowerText)) {
    components.configuration = 'common_collector';
  } else if (/\b(common\s+base|cb)\b/.test(lowerText)) {
    components.configuration = 'common_base';
  } else if (/\b(emitter\s+follower|ef)\b/.test(lowerText)) {
    components.configuration = 'emitter_follower';
  } else if (/\b(darlington\s+pair)\b/.test(lowerText)) {
    components.configuration = 'darlington_pair';
  }
  
  // Parse digital logic type
  if (/\b(and\s+gate|nand)\b/.test(lowerText)) {
    components.logicType = 'AND';
  } else if (/\b(or\s+gate|nor)\b/.test(lowerText)) {
    components.logicType = 'OR';
  } else if (/\b(not\s+gate|nand)\b/.test(lowerText)) {
    components.logicType = 'NOT';
  } else if (/\b(xor\s+gate|xnor)\b/.test(lowerText)) {
    components.logicType = 'XOR';
  } else if (/\b(xnor\s+gate)\b/.test(lowerText)) {
    components.logicType = 'XNOR';
  } else if (/\b(truth\s+table)\b/.test(lowerText)) {
    components.logicType = 'TRUTH_TABLE';
  }
  
  // Parse AC input parameters
  if (lowerText.includes('ac input') || lowerText.includes('alternating')) {
    components.inputType = 'AC';
    const freqMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*hz/i);
    if (freqMatch) {
      const frequency = parseFloat(freqMatch[1]);
      if (freqMatch[1].includes('.')) {
        components.frequency = frequency;
      } else {
        // Handle kHz, MHz, GHz
        const freqUnitMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*(khz|mhz|ghz)/i);
        if (freqUnitMatch) {
          let freqValue = parseFloat(freqUnitMatch[1]);
          const unit = freqUnitMatch[2].toLowerCase();
          if (unit.startsWith('k')) freqValue *= 1000;
          else if (unit.startsWith('m')) freqValue *= 1000000;
          else if (unit.startsWith('g')) freqValue *= 1000000000;
          components.frequency = freqValue;
        }
      }
    }
  }
};

/**
 * Enhanced parser that returns structured JSON output
 */
export const parseCircuitToJSON = (input, options = {}) => {
  const { circuit, confidence, errors } = parseCircuitInput(input, options.defaultType);
  
  if (errors.length > 0 && !options.ignoreErrors) {
    return {
      success: false,
      error: `Circuit validation failed: ${errors.join(', ')}`,
      circuit: null
    };
  }
  
  const result = {
    success: true,
    circuit: {
      type: circuit.type,
      mode: circuit.mode,
      components: circuit.components,
      confidence: confidence,
      // Enhanced metadata
      metadata: {
        parsedAt: new Date().toISOString(),
        parserVersion: '2.0.0',
        inputLength: input.length,
        detectedFeatures: detectFeatures(input)
      }
    }
  };
  
  return result;
};

/**
 * Detects special features in the input text
 */
const detectFeatures = (text) => {
  const features = [];
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('ac input') || lowerText.includes('alternating')) {
    features.push('AC_INPUT');
  }
  
  if (lowerText.includes('gain')) {
    features.push('OPAMP_GAIN');
  }
  
  if (/\b(common\s+emitter|ce)\b/.test(lowerText)) {
    features.push('BJT_COMMON_EMITTER');
  }
  
  if (/\b(and\s+gate|nand)\b/.test(lowerText)) {
    features.push('DIGITAL_AND');
  }
  
  if (/\b(truth\s+table)\b/.test(lowerText)) {
    features.push('DIGITAL_TRUTH_TABLE');
  }
  
  return features;
};

/**
 * Sets default values for required components based on circuit type
 */
const setDefaultComponents = (components, circuitType) => {
  const defaults = {
    [CIRCUIT_TYPES.RC]: { R: 1000, C: 10e-6, Vin: 5 },
    [CIRCUIT_TYPES.RL]: { R: 100, L: 0.01, Vin: 5 },
    [CIRCUIT_TYPES.RLC]: { R: 100, L: 0.01, C: 10e-6, Vin: 5 },
    [CIRCUIT_TYPES.OPAMP]: { R: 1000, Vin: 1 },
    [CIRCUIT_TYPES.BJT]: { R: 1000, Vin: 5 },
    [CIRCUIT_TYPES.DIGITAL]: { Vin: 5 }
  };

  const typeDefaults = defaults[circuitType] || defaults[CIRCUIT_TYPES.RC];
  
  for (const [key, value] of Object.entries(typeDefaults)) {
    if (!(key in components)) {
      components[key] = value;
    }
  }
};

/**
 * Parses simulation mode from text
 */
const parseSimulationMode = (text, circuitType) => {
  if (text.includes('discharging')) {
    return SIMULATION_MODES.DISCHARGING;
  }
  if (text.includes('ac') || text.includes('alternating')) {
    return SIMULATION_MODES.AC;
  }
  if (text.includes('transient')) {
    return SIMULATION_MODES.TRANSIENT;
  }
  if (text.includes('charging') || text.includes('step')) {
    return SIMULATION_MODES.CHARGING;
  }
  
  // Default mode based on circuit type
  return (circuitType === CIRCUIT_TYPES.DIGITAL) ? SIMULATION_MODES.TRANSIENT : SIMULATION_MODES.CHARGING;
};

/**
 * Calculates parsing confidence
 */
const calculateConfidence = (text, circuit, errors) => {
  let confidence = 0.5; // Base confidence

  // Increase confidence for explicit type mentions
  if (text.includes(circuit.type.toLowerCase())) confidence += 0.2;
  
  // Increase confidence for component specifications
  const componentCount = Object.keys(circuit.components).length;
  confidence += Math.min(componentCount * 0.1, 0.2);
  
  // Decrease confidence for errors
  confidence -= errors.length * 0.1;
  
  return Math.max(0, Math.min(1, confidence));
};

/**
 * Creates a fallback circuit for parsing failures
 */
const createFallbackCircuit = (type) => {
  return {
    type,
    mode: SIMULATION_MODES.CHARGING,
    components: {
      R: 1000,
      C: 10e-6,
      Vin: 5
    }
  };
};

/**
 * Legacy function to maintain compatibility with existing code
 * @deprecated Use parseCircuitInput instead
 */
export const parseRCCircuit = (text) => {
  const result = parseCircuitInput(text, CIRCUIT_TYPES.RC);
  return result.circuit.components;
};

export const parseRLCircuit = (text) => {
  const result = parseCircuitInput(text, CIRCUIT_TYPES.RL);
  return result.circuit.components;
};

export const parseOhmsLaw = (text) => {
  const result = parseCircuitInput(text, CIRCUIT_TYPES.DIGITAL);
  const { Vin, R } = result.circuit.components;
  return {
    voltage: Vin,
    resistance: R,
    current: Vin / R
  };
};

export const parseVoltageDivider = (text) => {
  const r1Match = text.match(/r1\s*=\s*([\d.]+)\s*(k?ohms?|ω)/i);
  const r2Match = text.match(/r2\s*=\s*([\d.]+)\s*(k?ohms?|ω)/i);
  const vinMatch = text.match(/(?:vin|v)\s*=\s*([\d.]+)\s*v/i);
  
  let r1 = 1000, r2 = 1000, vin = 12;
  if (r1Match) {
    r1 = parseFloat(r1Match[1]) * (r1Match[2].startsWith('k') ? 1000 : 1);
  }
  if (r2Match) {
    r2 = parseFloat(r2Match[1]) * (r2Match[2].startsWith('k') ? 1000 : 1);
  }
  if (vinMatch) {
    vin = parseFloat(vinMatch[1]);
  }
  
  const vout = vin * (r2 / (r1 + r2));
  
  return { vin, r1, r2, vout };
};
