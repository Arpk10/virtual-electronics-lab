import React, { useState, useEffect } from 'react';
import { simulateStructuredCircuit } from '../engine/index.js';
import DigitalCircuitBuilder from './DigitalCircuitBuilder.jsx';
import './InputPanel.css';
import './DigitalCircuitBuilder.css';
import { 
  simulateCircuit, 
  parseCircuitInput,
  CIRCUIT_TYPES,
  SIMULATION_MODES 
} from '../engine';

const InputPanel = ({ onSimulate, experimentType, isSimulating }) => {
  const [input, setInput] = useState('');
  const [showCircuitBuilder, setShowCircuitBuilder] = useState(false);
  const [circuitBuilderCircuit, setCircuitBuilderCircuit] = useState(null);

  // Parse circuit parameters based on experiment type
  const parseCircuitParameters = (text) => {
    // Map experiment type to circuit type
    const circuitTypeMap = {
      'rc': CIRCUIT_TYPES.RC,
      'rl': CIRCUIT_TYPES.RL,
      'rlc': CIRCUIT_TYPES.RLC,
      'ohms': CIRCUIT_TYPES.DIGITAL,
      'voltage-divider': CIRCUIT_TYPES.OPAMP,
      'opamp': CIRCUIT_TYPES.OPAMP,
      'bjt': CIRCUIT_TYPES.BJT
    };
    
    const circuitType = circuitTypeMap[experimentType] || CIRCUIT_TYPES.RC;
    const result = parseCircuitInput(text, circuitType);
    
    return result.circuit;
  };


  // Handle circuit builder changes
  const handleCircuitBuilderChange = (circuit) => {
    setCircuitBuilderCircuit(circuit);
  };

  // Generate simulation data using the new engine
  const generateSimulation = () => {
    if (!input.trim() && !circuitBuilderCircuit) return;

    try {
      let circuit;
      if (circuitBuilderCircuit && experimentType === 'digital') {
        circuit = circuitBuilderCircuit;
      } else {
        circuit = parseCircuitParameters(input);
      }
      const result = simulateStructuredCircuit(circuit);
      onSimulate(result);
    } catch (error) {
      console.error('Simulation error:', error);
      // Fallback to legacy simulation
      const result = simulateCircuit(input);
      onSimulate(result);
    }
  };

  const loadExample = (type) => {
    switch (experimentType) {
      case 'rc':
        if (type === 'charging') {
          setInput('RC circuit with R=1000 ohms, C=10uF, step input');
        } else {
          setInput('RC circuit with R=2.2k ohms, C=100uF, discharging');
        }
        break;
      case 'rl':
        if (type === 'charging') {
          setInput('RL circuit with R=100 ohms, L=10mH, step input');
        } else {
          setInput('RL circuit with R=220 ohms, L=50mH, discharging');
        }
        break;
      case 'rlc':
        if (type === 'underdamped') {
          setInput('RLC circuit with R=50 ohms, L=10mH, C=100uF, step input');
        } else if (type === 'critical') {
          setInput('RLC circuit with R=200 ohms, L=10mH, C=100uF, step input');
        } else if (type === 'overdamped') {
          setInput('RLC circuit with R=500 ohms, L=10mH, C=100uF, step input');
        }
        break;
      case 'opamp':
        if (type === 'inverting') {
          setInput('inverting op amp gain 10');
        } else if (type === 'non-inverting') {
          setInput('non-inverting op amp buffer gain 1');
        } else if (type === 'comparator') {
          setInput('op amp comparator with 5V reference');
        }
        break;
      case 'bjt':
        if (type === 'common-emitter') {
          setInput('BJT common emitter amplifier with beta=100');
        } else if (type === 'common-collector') {
          setInput('BJT common collector amplifier with beta=100');
        } else if (type === 'emitter-follower') {
          setInput('BJT emitter follower with beta=100');
        }
        break;
      case 'ohms':
        setInput('Ohms law with V=12V, R=1k ohms');
        break;
      case 'voltage-divider':
        setInput('Voltage divider with Vin=12V, R1=1k ohms, R2=2k ohms');
        break;
      case 'digital':
        if (type === 'and') {
          setInput('AND gate with inputs A=1, B=1');
        } else if (type === 'or') {
          setInput('OR gate with inputs A=1, B=0');
        } else if (type === 'not') {
          setInput('NOT gate with input A=1');
        } else if (type === 'nand') {
          setInput('NAND gate with inputs A=1, B=1');
        } else if (type === 'nor') {
          setInput('NOR gate with inputs A=0, B=0');
        } else if (type === 'xor') {
          setInput('XOR gate with inputs A=1, B=0');
        }
        break;
      default:
        setInput('RC circuit with R=1000 ohms, C=10uF, step input');
    }
  };

  const getPlaceholder = () => {
    switch (experimentType) {
      case 'rc':
        return "Describe your RC circuit...&#10;Example: 'RC circuit with R=1000 ohms, C=10uF, step input'";
      case 'rl':
        return "Describe your RL circuit...&#10;Example: 'RL circuit with R=100 ohms, L=10mH, step input'";
      case 'rlc':
        return "Describe your RLC circuit...&#10;Example: 'RLC circuit with R=100 ohms, L=10mH, C=10uF, step input'";
      case 'opamp':
        return "Describe your op-amp circuit...&#10;Example: 'inverting op amp gain 10' or 'non-inverting buffer'";
      case 'bjt':
        return "Describe your BJT circuit...&#10;Example: 'BJT common emitter amplifier with beta=100'";
      case 'ohms':
        return "Describe your Ohm's Law calculation...&#10;Example: 'Ohms law with V=12V, R=1k ohms'";
      case 'voltage-divider':
        return "Describe your voltage divider...&#10;Example: 'Voltage divider with Vin=12V, R1=1k ohms, R2=2k ohms'";
      case 'digital':
        return "Describe your digital circuit...&#10;Example: 'AND gate with inputs A=1, B=1' or use circuit builder below";
      default:
        return "Describe your circuit...";
    }
  };

  const getExampleButtons = () => {
    switch (experimentType) {
      case 'rc':
        return (
          <>
            <button onClick={() => loadExample('charging')} className="example-btn btn-secondary">
              RC Charging Example
            </button>
            <button onClick={() => loadExample('discharging')} className="example-btn btn-secondary">
              RC Discharging Example
            </button>
          </>
        );
      case 'rl':
        return (
          <>
            <button onClick={() => loadExample('charging')} className="example-btn btn-secondary">
              RL Charging Example
            </button>
            <button onClick={() => loadExample('discharging')} className="example-btn btn-secondary">
              RL Discharging Example
            </button>
          </>
        );
      case 'rlc':
        return (
          <>
            <button onClick={() => loadExample('underdamped')} className="example-btn btn-secondary">
              RLC Underdamped Example
            </button>
            <button onClick={() => loadExample('critical')} className="example-btn btn-secondary">
              RLC Critically Damped Example
            </button>
            <button onClick={() => loadExample('overdamped')} className="example-btn btn-secondary">
              RLC Overdamped Example
            </button>
          </>
        );
      case 'opamp':
        return (
          <>
            <button onClick={() => loadExample('inverting')} className="example-btn btn-secondary">
              Inverting Op-Amp Example
            </button>
            <button onClick={() => loadExample('non-inverting')} className="example-btn btn-secondary">
              Non-Inverting Op-Amp Example
            </button>
            <button onClick={() => loadExample('comparator')} className="example-btn btn-secondary">
              Comparator Example
            </button>
          </>
        );
      case 'bjt':
        return (
          <>
            <button onClick={() => loadExample('common-emitter')} className="example-btn btn-secondary">
              Common Emitter Example
            </button>
            <button onClick={() => loadExample('common-collector')} className="example-btn btn-secondary">
              Common Collector Example
            </button>
            <button onClick={() => loadExample('emitter-follower')} className="example-btn btn-secondary">
              Emitter Follower Example
            </button>
          </>
        );
      case 'ohms':
        return (
          <button onClick={() => loadExample('basic')} className="example-btn btn-secondary">
            Ohm's Law Example
          </button>
        );
      case 'voltage-divider':
        return (
          <button onClick={() => loadExample('basic')} className="example-btn btn-secondary">
            Voltage Divider Example
          </button>
        );
      case 'digital':
        return (
          <>
            <button onClick={() => loadExample('and')} className="example-btn btn-secondary">
              AND Gate Example
            </button>
            <button onClick={() => loadExample('or')} className="example-btn btn-secondary">
              OR Gate Example
            </button>
            <button onClick={() => loadExample('not')} className="example-btn btn-secondary">
              NOT Gate Example
            </button>
            <button onClick={() => loadExample('nand')} className="example-btn btn-secondary">
              NAND Gate Example
            </button>
            <button onClick={() => loadExample('nor')} className="example-btn btn-secondary">
              NOR Gate Example
            </button>
            <button onClick={() => loadExample('xor')} className="example-btn btn-secondary">
              XOR Gate Example
            </button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="input-panel premium-spacing">
      <div className="padding-sm-bottom">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={getPlaceholder()}
          className="circuit-input"
          rows={4}
        />
      </div>
      
      <div className="divider"></div>
      
      <div className="example-buttons spacing-md-bottom">
        {getExampleButtons()}
      </div>

      {experimentType === 'digital' && (
        <div className="circuit-builder-toggle spacing-md-bottom">
          <button 
            onClick={() => setShowCircuitBuilder(!showCircuitBuilder)}
            className="toggle-builder-btn btn-tertiary"
          >
            {showCircuitBuilder ? 'Hide Circuit Builder' : 'Show Circuit Builder'}
          </button>
        </div>
      )}

      {showCircuitBuilder && experimentType === 'digital' && (
        <div className="spacing-md-bottom">
          <DigitalCircuitBuilder onCircuitChange={handleCircuitBuilderChange} />
        </div>
      )}

      <button 
        onClick={generateSimulation}
        disabled={isSimulating}
        className="simulate-btn btn-dominant"
      >
        {isSimulating ? 'Simulating...' : 'Run Simulation'}
      </button>
    </div>
  );
};

export default InputPanel;
