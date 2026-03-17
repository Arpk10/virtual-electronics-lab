import React, { useState } from 'react';
import './InputPanel.css';

const InputPanel = ({ onSimulate, experimentType, isSimulating }) => {
  const [input, setInput] = useState('');

  // Parse circuit parameters based on experiment type
  const parseCircuitInput = (text) => {
    const lowerText = text.toLowerCase();
    
    switch (experimentType) {
      case 'rc':
        return parseRCCircuit(lowerText);
      case 'rl':
        return parseRLCircuit(lowerText);
      case 'ohms':
        return parseOhmsLaw(lowerText);
      case 'voltage-divider':
        return parseVoltageDivider(lowerText);
      default:
        return parseRCCircuit(lowerText);
    }
  };

  // Parse RC circuit parameters
  const parseRCCircuit = (lowerText) => {
    // Extract resistance value
    const rMatch = lowerText.match(/r\s*=\s*([\d.]+)\s*(k?ohms?|ω)/i);
    const resistance = rMatch ? parseFloat(rMatch[1]) * (rMatch[2].startsWith('k') ? 1000 : 1) : 1000;
    
    // Extract capacitance value
    const cMatch = lowerText.match(/c\s*=\s*([\d.]+)\s*(μ?uf?|f)/i);
    let capacitance = cMatch ? parseFloat(cMatch[1]) : 10e-6;
    if (cMatch[2].startsWith('μ')) capacitance *= 1e-6;
    
    // Determine simulation type
    const isCharging = lowerText.includes('charging') || lowerText.includes('step');
    const isDischarging = lowerText.includes('discharging');
    
    // Default to charging if not specified
    const simulationType = isDischarging ? 'discharging' : 'charging';
    
    return {
      resistance,
      capacitance,
      simulationType,
      timeConstant: resistance * capacitance
    };
  };

  // Parse RL circuit parameters
  const parseRLCircuit = (lowerText) => {
    // Extract resistance value
    const rMatch = lowerText.match(/r\s*=\s*([\d.]+)\s*(k?ohms?|ω)/i);
    const resistance = rMatch ? parseFloat(rMatch[1]) * (rMatch[2].startsWith('k') ? 1000 : 1) : 100;
    
    // Extract inductance value
    const lMatch = lowerText.match(/l\s*=\s*([\d.]+)\s*(m?h|h)/i);
    let inductance = lMatch ? parseFloat(lMatch[1]) : 0.01;
    if (lMatch[2].startsWith('m')) inductance *= 0.001;
    
    // Determine simulation type
    const isCharging = lowerText.includes('charging') || lowerText.includes('step');
    const isDischarging = lowerText.includes('discharging');
    
    // Default to charging if not specified
    const simulationType = isDischarging ? 'discharging' : 'charging';
    
    return {
      resistance,
      inductance,
      simulationType,
      timeConstant: inductance / resistance
    };
  };

  // Parse Ohm's Law parameters
  const parseOhmsLaw = (lowerText) => {
    // Extract voltage
    const vMatch = lowerText.match(/v\s*=\s*([\d.]+)\s*(v|volt)/i);
    const voltage = vMatch ? parseFloat(vMatch[1]) : 5;
    
    // Extract resistance
    const rMatch = lowerText.match(/r\s*=\s*([\d.]+)\s*(k?ohms?|ω)/i);
    const resistance = rMatch ? parseFloat(rMatch[1]) * (rMatch[2].startsWith('k') ? 1000 : 1) : 1000;
    
    // Calculate current using Ohm's Law
    const current = voltage / resistance;
    
    return {
      voltage,
      resistance,
      current
    };
  };

  // Parse Voltage Divider parameters
  const parseVoltageDivider = (lowerText) => {
    // Extract input voltage
    const vinMatch = lowerText.match(/vin\s*=\s*([\d.]+)\s*(v|volt)/i);
    const vin = vinMatch ? parseFloat(vinMatch[1]) : 12;
    
    // Extract R1
    const r1Match = lowerText.match(/r1\s*=\s*([\d.]+)\s*(k?ohms?|ω)/i);
    const r1 = r1Match ? parseFloat(r1Match[1]) * (r1Match[2].startsWith('k') ? 1000 : 1) : 1000;
    
    // Extract R2
    const r2Match = lowerText.match(/r2\s*=\s*([\d.]+)\s*(k?ohms?|ω)/i);
    const r2 = r2Match ? parseFloat(r2Match[1]) * (r2Match[2].startsWith('k') ? 1000 : 1) : 1000;
    
    // Calculate output voltage
    const vout = vin * (r2 / (r1 + r2));
    
    return {
      vin,
      r1,
      r2,
      vout
    };
  };

  // Generate simulation data based on experiment type
  const generateSimulationData = (params) => {
    switch (experimentType) {
      case 'rc':
        return generateRCSimulation(params);
      case 'rl':
        return generateRLSimulation(params);
      case 'ohms':
        return generateOhmsSimulation(params);
      case 'voltage-divider':
        return generateVoltageDividerSimulation(params);
      default:
        return generateRCSimulation(params);
    }
  };

  // Generate RC circuit simulation data
  const generateRCSimulation = (params) => {
    const { resistance, capacitance, simulationType, timeConstant } = params;
    const V0 = 5; // Initial voltage (5V)
    const points = [];
    const maxTime = 5 * timeConstant; // Simulate for 5 time constants
    const numPoints = 100;
    
    for (let i = 0; i <= numPoints; i++) {
      const t = (i / numPoints) * maxTime;
      let voltage;
      
      if (simulationType === 'charging') {
        voltage = V0 * (1 - Math.exp(-t / timeConstant));
      } else {
        voltage = V0 * Math.exp(-t / timeConstant);
      }
      
      points.push({
        time: t * 1000, // Convert to milliseconds
        voltage: voltage
      });
    }
    
    return {
      labels: points.map(p => p.time.toFixed(1)),
      data: points.map(p => p.voltage),
      chartType: 'voltage',
      circuitParams: {
        ...params,
        V0,
        maxTime: maxTime * 1000,
        experimentType: 'rc'
      }
    };
  };

  // Generate RL circuit simulation data
  const generateRLSimulation = (params) => {
    const { resistance, inductance, simulationType, timeConstant } = params;
    const V0 = 5; // Initial voltage (5V)
    const I0 = V0 / resistance; // Final current
    const points = [];
    const maxTime = 5 * timeConstant; // Simulate for 5 time constants
    const numPoints = 100;
    
    for (let i = 0; i <= numPoints; i++) {
      const t = (i / numPoints) * maxTime;
      let current;
      
      if (simulationType === 'charging') {
        current = I0 * (1 - Math.exp(-t / timeConstant));
      } else {
        current = I0 * Math.exp(-t / timeConstant);
      }
      
      points.push({
        time: t * 1000, // Convert to milliseconds
        current: current
      });
    }
    
    return {
      labels: points.map(p => p.time.toFixed(1)),
      data: points.map(p => p.current),
      chartType: 'current',
      circuitParams: {
        ...params,
        V0,
        I0,
        maxTime: maxTime * 1000,
        experimentType: 'rl'
      }
    };
  };

  // Generate Ohm's Law simulation data (static calculation)
  const generateOhmsSimulation = (params) => {
    const { voltage, resistance, current } = params;
    
    return {
      labels: ['Result'],
      data: [current],
      chartType: 'static',
      circuitParams: {
        ...params,
        experimentType: 'ohms'
      }
    };
  };

  // Generate Voltage Divider simulation data (static calculation)
  const generateVoltageDividerSimulation = (params) => {
    const { vin, r1, r2, vout } = params;
    
    return {
      labels: ['Vin', 'Vout'],
      data: [vin, vout],
      chartType: 'comparison',
      circuitParams: {
        ...params,
        experimentType: 'voltage-divider'
      }
    };
  };

  const handleRunSimulation = () => {
    if (!input.trim()) return;
    
    try {
      const params = parseCircuitInput(input);
      const simulationData = generateSimulationData(params);
      onSimulate(simulationData);
    } catch (error) {
      console.error('Error parsing input:', error);
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
      case 'ohms':
        setInput('Ohms law with V=12V, R=1k ohms');
        break;
      case 'voltage-divider':
        setInput('Voltage divider with Vin=12V, R1=1k ohms, R2=2k ohms');
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
      case 'ohms':
        return "Describe your Ohm's Law calculation...&#10;Example: 'Ohms law with V=12V, R=1k ohms'";
      case 'voltage-divider':
        return "Describe your voltage divider...&#10;Example: 'Voltage divider with Vin=12V, R1=1k ohms, R2=2k ohms'";
      default:
        return "Describe your circuit...";
    }
  };

  const getExampleButtons = () => {
    switch (experimentType) {
      case 'rc':
        return (
          <>
            <button onClick={() => loadExample('charging')} className="example-btn">
              RC Charging Example
            </button>
            <button onClick={() => loadExample('discharging')} className="example-btn">
              RC Discharging Example
            </button>
          </>
        );
      case 'rl':
        return (
          <>
            <button onClick={() => loadExample('charging')} className="example-btn">
              RL Charging Example
            </button>
            <button onClick={() => loadExample('discharging')} className="example-btn">
              RL Discharging Example
            </button>
          </>
        );
      case 'ohms':
        return (
          <button onClick={() => loadExample('basic')} className="example-btn">
            Ohm's Law Example
          </button>
        );
      case 'voltage-divider':
        return (
          <button onClick={() => loadExample('basic')} className="example-btn">
            Voltage Divider Example
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="input-panel">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={getPlaceholder()}
        className="input-textarea"
        rows={4}
        disabled={isSimulating}
      />
      
      <div className="example-buttons">
        {getExampleButtons()}
      </div>
      
      <button 
        onClick={handleRunSimulation}
        className={`simulate-btn ${isSimulating ? 'simulating' : ''}`}
        disabled={isSimulating}
      >
        {isSimulating ? (
          <>
            <div className="spinner"></div>
            Simulating...
          </>
        ) : 'Run Simulation'}
      </button>
    </div>
  );
};

export default InputPanel;
