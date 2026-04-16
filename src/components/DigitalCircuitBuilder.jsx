import React, { useState, useEffect } from 'react';
import { simulateStructuredCircuit, CIRCUIT_TYPES, SIMULATION_MODES } from '../engine/index.js';

const DigitalCircuitBuilder = ({ onCircuitChange }) => {
  const [gates, setGates] = useState([]);
  const [inputs, setInputs] = useState([false, false]);
  const [outputs, setOutputs] = useState([]);
  const [selectedGate, setSelectedGate] = useState('AND');
  const [truthTable, setTruthTable] = useState([]);

  const gateTypes = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'];

  // Add a gate to the circuit
  const addGate = () => {
    if (gates.length >= 3) {
      alert('Maximum 3 gates allowed in simple circuit builder');
      return;
    }

    const newGate = {
      id: Date.now(),
      type: selectedGate,
      inputs: [false, false],
      output: false,
      position: { x: gates.length * 150, y: 100 }
    };

    setGates([...gates, newGate]);
  };

  // Remove a gate from the circuit
  const removeGate = (gateId) => {
    setGates(gates.filter(gate => gate.id !== gateId));
  };

  // Update gate type
  const updateGateType = (gateId, newType) => {
    setGates(gates.map(gate => 
      gate.id === gateId ? { ...gate, type: newType } : gate
    ));
  };

  // Toggle input switch
  const toggleInput = (index) => {
    const newInputs = [...inputs];
    newInputs[index] = !newInputs[index];
    setInputs(newInputs);
  };

  // Evaluate logic gate
  const evaluateGate = (gateType, gateInputs) => {
    switch (gateType.toUpperCase()) {
      case 'AND':
        return gateInputs.every(input => input === true);
      case 'OR':
        return gateInputs.some(input => input === true);
      case 'NOT':
        return !gateInputs[0];
      case 'NAND':
        return !gateInputs.every(input => input === true);
      case 'NOR':
        return !gateInputs.some(input => input === true);
      case 'XOR':
        return gateInputs.reduce((sum, input) => sum + (input ? 1 : 0), 0) % 2 === 1;
      case 'XNOR':
        return gateInputs.reduce((sum, input) => sum + (input ? 1 : 0), 0) % 2 === 0;
      default:
        return false;
    }
  };

  // Update circuit outputs
  useEffect(() => {
    const newOutputs = [];
    let currentInputs = [...inputs];

    gates.forEach(gate => {
      const gateInputs = currentInputs.slice(0, gate.type === 'NOT' ? 1 : 2);
      const output = evaluateGate(gate.type, gateInputs);
      newOutputs.push(output);
      
      // For simple circuits, use gate output as input for next gate
      if (gates.length > 1) {
        currentInputs = [output, ...currentInputs.slice(1)];
      }
    });

    setOutputs(newOutputs);

    // Generate truth table for the last gate
    if (gates.length > 0) {
      const lastGate = gates[gates.length - 1];
      const table = generateTruthTable(lastGate.type);
      setTruthTable(table);
    }

    // Notify parent component of circuit change
    if (onCircuitChange && gates.length > 0) {
      const circuit = {
        type: CIRCUIT_TYPES.DIGITAL,
        mode: SIMULATION_MODES.CHARGING,
        components: {
          logicType: gates[gates.length - 1].type,
          inputs: inputs.map(i => i ? 1 : 0),
          Vin: 5
        }
      };
      onCircuitChange(circuit);
    }
  }, [gates, inputs, onCircuitChange]);

  // Generate truth table
  const generateTruthTable = (gateType) => {
    const table = [];
    const numInputs = gateType === 'NOT' ? 1 : 2;
    const numRows = Math.pow(2, numInputs);

    for (let i = 0; i < numRows; i++) {
      const inputs = [];
      for (let j = numInputs - 1; j >= 0; j--) {
        inputs.push((i >> j) & 1);
      }
      const output = evaluateGate(gateType, inputs.map(i => i === 1));
      table.push({ inputs, output });
    }

    return table;
  };

  // Render gate symbol
  const renderGate = (gate) => {
    const symbols = {
      'AND': '&',
      'OR': '>=1',
      'NOT': '1',
      'NAND': '&',
      'NOR': '>=1',
      'XOR': '=1',
      'XNOR': '=1'
    };

    return (
      <div className="logic-gate" style={{ left: `${gate.position.x}px`, top: `${gate.position.y}px` }}>
        <div className="gate-body">
          <div className="gate-symbol">{symbols[gate.type]}</div>
          <div className="gate-label">{gate.type}</div>
        </div>
        <div className="gate-inputs">
          {gate.type === 'NOT' ? (
            <div className="input-line"></div>
          ) : (
            <>
              <div className="input-line" style={{ top: '20%' }}></div>
              <div className="input-line" style={{ top: '80%' }}></div>
            </>
          )}
        </div>
        <div className="gate-output">
          <div className="output-line"></div>
        </div>
        <button 
          className="remove-gate-btn" 
          onClick={() => removeGate(gate.id)}
          title="Remove gate"
        >
          ×
        </button>
        <select 
          className="gate-type-select"
          value={gate.type}
          onChange={(e) => updateGateType(gate.id, e.target.value)}
        >
          {gateTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div className="digital-circuit-builder">
      <div className="circuit-controls">
        <h3>Digital Circuit Builder</h3>
        <div className="gate-selector">
          <select value={selectedGate} onChange={(e) => setSelectedGate(e.target.value)}>
            {gateTypes.map(type => (
              <option key={type} value={type}>{type} Gate</option>
            ))}
          </select>
          <button onClick={addGate} disabled={gates.length >= 3}>
            Add Gate ({gates.length}/3)
          </button>
        </div>
      </div>

      <div className="input-switches">
        <h4>Input Switches</h4>
        <div className="switches">
          {inputs.map((input, index) => (
            <div key={index} className="input-switch">
              <label>Input {index + 1}</label>
              <button 
                className={`toggle-switch ${input ? 'on' : 'off'}`}
                onClick={() => toggleInput(index)}
              >
                {input ? '1' : '0'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="circuit-workspace">
        <div className="workspace-canvas">
          {gates.map(gate => renderGate(gate))}
          {gates.length === 0 && (
            <div className="empty-state">
              <p>Add gates to build your digital circuit</p>
            </div>
          )}
        </div>
      </div>

      <div className="output-display">
        <h4>Output LEDs</h4>
        <div className="led-indicators">
          {outputs.map((output, index) => (
            <div key={index} className="led-container">
              <label>Gate {index + 1}</label>
              <div className={`led ${output ? 'on' : 'off'}`}></div>
            </div>
          ))}
          {outputs.length === 0 && (
            <div className="no-output">No outputs yet</div>
          )}
        </div>
      </div>

      {truthTable.length > 0 && (
        <div className="truth-table">
          <h4>Truth Table</h4>
          <table>
            <thead>
              <tr>
                <th>A</th>
                <th>B</th>
                <th>Output</th>
              </tr>
            </thead>
            <tbody>
              {truthTable.map((row, index) => (
                <tr key={index} className={row.output ? 'high' : 'low'}>
                  <td>{row.inputs[0] || row.inputs[0] === 0 ? row.inputs[0] : ''}</td>
                  <td>{row.inputs[1] || row.inputs[1] === 0 ? row.inputs[1] : ''}</td>
                  <td>{row.output ? '1' : '0'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DigitalCircuitBuilder;
