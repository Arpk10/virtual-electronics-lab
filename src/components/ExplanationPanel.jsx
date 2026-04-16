import React, { useState } from 'react';
import AIExplanationToggle from './AIExplanationToggle.jsx';
import './ExplanationPanel.css';

const ExplanationPanel = ({ params }) => {
  const [aiExplanation, setAiExplanation] = useState('');
  const [aiLevel, setAiLevel] = useState('beginner');
  
  // Always show content, use default params if none provided
  const defaultParams = params || {
    type: 'voltage-divider',
    experimentType: 'voltage-divider',
    resistance: 1000,
    R1: 1000,
    R2: 2000,
    voltage: 12,
    V0: 12,
    timeConstant: 0.002,
    currentOutput: 8
  };

  const { experimentType } = defaultParams;

  const getAIEnhancedContent = (baseContent, experimentType) => {
    if (!isAIMode) return baseContent;

    const aiSections = getAISections(experimentType);
    return (
      <>
        {baseContent}
        {aiSections}
      </>
    );
  };

  const getAISections = (type) => {
    switch (type) {
      case 'rc':
        return getRCAISections();
      case 'rl':
        return getRLAISections();
      case 'ohms':
        return getOhmsAISections();
      case 'voltage-divider':
        return getVoltageDividerAISections();
      default:
        return null;
    }
  };

  const formatValue = (value, unit) => {
    if (unit === 'Ω' && value >= 1000) {
      return `${(value / 1000).toFixed(1)}kΩ`;
    }
    if (unit === 'F' && value < 1e-6) {
      return `${(value * 1e9).toFixed(1)}nF`;
    }
    if (unit === 'F' && value < 1e-3) {
      return `${(value * 1e6).toFixed(1)}μF`;
    }
    if (unit === 'H' && value < 1) {
      return `${(value * 1000).toFixed(1)}mH`;
    }
    return `${value.toFixed(3)}${unit}`;
  };

  const formatTime = (ms) => {
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(2)}s`;
    }
    return `${ms.toFixed(1)}ms`;
  };

  const formatCurrent = (current) => {
    if (current < 0.001) {
      return `${(current * 1000000).toFixed(1)}μA`;
    }
    if (current < 1) {
      return `${(current * 1000).toFixed(1)}mA`;
    }
    return `${current.toFixed(3)}A`;
  };

  const getExplanationContent = () => {
    switch (experimentType) {
      case 'rc':
        return getAIEnhancedContent(getRCExplanation(), 'rc');
      case 'rl':
        return getAIEnhancedContent(getRLExplanation(), 'rl');
      case 'rlc':
        return getAIEnhancedContent(getRLCExplanation(), 'rlc');
      case 'opamp':
        return getAIEnhancedContent(getOpAmpExplanation(), 'opamp');
      case 'bjt':
        return getAIEnhancedContent(getBJTExplanation(), 'bjt');
      case 'ohms':
        return getAIEnhancedContent(getOhmsExplanation(), 'ohms');
      case 'voltage-divider':
        return getAIEnhancedContent(getVoltageDividerExplanation(), 'voltage-divider');
      case 'digital':
        return getAIEnhancedContent(getDigitalExplanation(), 'digital');
      default:
        return getAIEnhancedContent(getRCExplanation(), 'rc');
    }
  };

  const getRCExplanation = () => {
    const { resistance, capacitance, simulationType, timeConstant, V0, maxTime } = params;
    
    return (
      <>
        <div className="circuit-params">
          <h3>Circuit Parameters:</h3>
          <ul>
            <li><strong>Resistance (R):</strong> {formatValue(resistance, 'Ω')}</li>
            <li><strong>Capacitance (C):</strong> {formatValue(capacitance, 'F')}</li>
            <li><strong>Time Constant (τ):</strong> {formatTime(timeConstant * 1000)}</li>
            <li><strong>Initial Voltage:</strong> {V0}V</li>
            <li><strong>Simulation Type:</strong> {simulationType === 'charging' ? 'Charging' : 'Discharging'}</li>
          </ul>
        </div>

        <div className="physics-explanation">
          <h3>What's Happening Physically:</h3>
          <p>
            {simulationType === 'charging' 
              ? `When the step input is applied, the capacitor begins to charge through the resistor. 
                 Electrons flow from the source, accumulating on the capacitor plates and creating an electric field. 
                 As the capacitor voltage increases, it opposes the source voltage, reducing the current flow.`
              : `The charged capacitor releases its stored energy through the resistor. 
                 Electrons flow from the negatively charged plate to the positively charged plate, 
                 creating a current that decreases as the capacitor discharges.`
            }
          </p>
        </div>

        <div className="exponential-explanation">
          <h3>Why the Curve is Exponential:</h3>
          <p>
            The exponential shape arises because the current depends on the voltage difference between the source and capacitor.
            As the capacitor {simulationType === 'charging' ? 'charges' : 'discharges'}, this voltage difference decreases,
            causing the current to decrease proportionally. This creates the characteristic exponential curve.
          </p>
        </div>

        <div className="time-constant-explanation">
          <h3>Time Constant (τ = RC):</h3>
          <p>
            The time constant represents how quickly the circuit responds. After one time constant ({formatTime(timeConstant * 1000)}),
            the capacitor reaches {simulationType === 'charging' ? '63.2%' : '36.8%'} of its final voltage.
            After 5 time constants ({formatTime(maxTime)}), the circuit is essentially at steady state.
          </p>
        </div>
      </>
    );
  };

  const getRLExplanation = () => {
    const { resistance, inductance, simulationType, timeConstant, V0, I0, maxTime } = params;
    
    return (
      <>
        <div className="circuit-params">
          <h3>Circuit Parameters:</h3>
          <ul>
            <li><strong>Resistance (R):</strong> {formatValue(resistance, 'Ω')}</li>
            <li><strong>Inductance (L):</strong> {formatValue(inductance, 'H')}</li>
            <li><strong>Time Constant (τ):</strong> {formatTime(timeConstant * 1000)}</li>
            <li><strong>Applied Voltage:</strong> {V0}V</li>
            <li><strong>Final Current:</strong> {formatCurrent(I0)}</li>
            <li><strong>Simulation Type:</strong> {simulationType === 'charging' ? 'Current Buildup' : 'Current Decay'}</li>
          </ul>
        </div>

        <div className="physics-explanation">
          <h3>What's Happening Physically:</h3>
          <p>
            {simulationType === 'charging' 
              ? `When voltage is applied, the inductor initially opposes the change in current by generating a back-EMF. 
                 As time progresses, the magnetic field builds up and the back-EMF decreases, allowing current to flow more freely. 
                 The current gradually approaches its maximum value (V/R).`
              : `When the voltage source is removed, the collapsing magnetic field in the inductor generates a back-EMF 
                 that continues to drive current through the resistor. The magnetic field energy is dissipated as heat, 
                 and the current gradually decreases to zero.`
            }
          </p>
        </div>

        <div className="exponential-explanation">
          <h3>Why the Curve is Exponential:</h3>
          <p>
            The exponential behavior occurs because the inductor's back-EMF is proportional to the rate of change of current. 
            As the current {simulationType === 'charging' ? 'increases' : 'decreases'}, the back-EMF {simulationType === 'charging' ? 'decreases' : 'increases'}, 
            which affects the rate of current change. This self-regulating behavior creates the exponential curve.
          </p>
        </div>

        <div className="time-constant-explanation">
          <h3>Time Constant (τ = L/R):</h3>
          <p>
            The time constant determines how quickly the current reaches its {simulationType === 'charging' ? 'maximum' : 'minimum'} value. 
            After one time constant ({formatTime(timeConstant * 1000)}), the current reaches {simulationType === 'charging' ? '63.2%' : '36.8%'} of its final value. 
            After 5 time constants ({formatTime(maxTime)}), the circuit is essentially at steady state.
          </p>
        </div>
      </>
    );
  };

  const getOhmsExplanation = () => {
    const { voltage, resistance, current } = params;
    
    return (
      <>
        <div className="circuit-params">
          <h3>Circuit Parameters:</h3>
          <ul>
            <li><strong>Voltage (V):</strong> {voltage}V</li>
            <li><strong>Resistance (R):</strong> {formatValue(resistance, 'Ω')}</li>
            <li><strong>Current (I):</strong> {formatCurrent(current)}</li>
            <li><strong>Formula:</strong> I = V/R = {voltage}V / {formatValue(resistance, 'Ω')} = {formatCurrent(current)}</li>
          </ul>
        </div>

        <div className="physics-explanation">
          <h3>What's Happening Physically:</h3>
          <p>
            Ohm's Law describes the linear relationship between voltage, current, and resistance in a simple circuit. 
            The voltage source provides electrical pressure that pushes electrons through the resistive material. 
            The resistance opposes this electron flow, and the resulting current is directly proportional to the applied voltage.
          </p>
        </div>

        <div className="exponential-explanation">
          <h3>Why This Relationship is Linear:</h3>
          <p>
            Unlike RC and RL circuits, Ohm's Law describes a steady-state condition where energy storage elements 
            (capacitors and inductors) are not involved. The relationship is linear because the resistance remains 
            constant regardless of the applied voltage, resulting in a proportional current response.
          </p>
        </div>

        <div className="time-constant-explanation">
          <h3>Practical Applications:</h3>
          <p>
            This fundamental law is used for calculating current in simple circuits, determining appropriate resistor values, 
            and analyzing power consumption. It forms the basis for more complex circuit analysis and is essential 
            for understanding electrical safety and component selection.
          </p>
        </div>
      </>
    );
  };

  const getVoltageDividerExplanation = () => {
    const { vin, r1, r2, vout } = params;
    const ratio = (r2 / (r1 + r2)) * 100;
    
    return (
      <>
        <div className="circuit-params">
          <h3>Circuit Parameters:</h3>
          <ul>
            <li><strong>Input Voltage (Vin):</strong> {vin}V</li>
            <li><strong>Resistor R1:</strong> {formatValue(r1, 'Ω')}</li>
            <li><strong>Resistor R2:</strong> {formatValue(r2, 'Ω')}</li>
            <li><strong>Output Voltage (Vout):</strong> {vout.toFixed(3)}V</li>
            <li><strong>Voltage Ratio:</strong> {ratio.toFixed(1)}%</li>
            <li><strong>Formula:</strong> Vout = Vin × (R2 / (R1 + R2))</li>
          </ul>
        </div>

        <div className="physics-explanation">
          <h3>What's Happening Physically:</h3>
          <p>
            A voltage divider uses two resistors in series to split an input voltage into a smaller output voltage. 
            The input voltage is dropped across both resistors proportionally to their resistance values. 
            The output voltage is taken from across one of the resistors (typically R2), resulting in a reduced voltage.
          </p>
        </div>

        <div className="exponential-explanation">
          <h3>Why This Works:</h3>
          <p>
            In a series circuit, the same current flows through both resistors. According to Ohm's Law, the voltage drop 
            across each resistor is V = I×R. Since the current is the same, the voltage drops are proportional to the resistances. 
            The output voltage is simply the fraction of the total resistance that R2 represents.
          </p>
        </div>

        <div className="time-constant-explanation">
          <h3>Practical Applications:</h3>
          <p>
            Voltage dividers are commonly used for creating reference voltages, biasing transistors, scaling sensor outputs, 
            and adjusting signal levels. They're simple but essential circuits used in almost all electronic devices for 
            voltage regulation and signal conditioning.
          </p>
        </div>
      </>
    );
  };

  const getRLCExplanation = () => {
    const { 
      resistance, 
      inductance, 
      capacitance, 
      simulationType, 
      timeConstant, 
      naturalFrequency,
      dampingRatio,
      dampingClassification,
      resonanceFrequency,
      qualityFactor,
      V0, 
      maxTime 
    } = params;
    
    return (
      <>
        <div className="circuit-params">
          <h3>Circuit Parameters:</h3>
          <ul>
            <li><strong>Resistance (R):</strong> {formatValue(resistance, 'Ω')}</li>
            <li><strong>Inductance (L):</strong> {formatValue(inductance, 'H')}</li>
            <li><strong>Capacitance (C):</strong> {formatValue(capacitance, 'F')}</li>
            <li><strong>Natural Frequency (ω₀):</strong> {naturalFrequency?.toFixed(1)} rad/s</li>
            <li><strong>Resonance Frequency:</strong> {resonanceFrequency?.toFixed(1)} Hz</li>
            <li><strong>Damping Ratio (ζ):</strong> {dampingRatio?.toFixed(3)}</li>
            <li><strong>Quality Factor (Q):</strong> {qualityFactor?.toFixed(1)}</li>
            <li><strong>Time Constant (τ):</strong> {formatTime(timeConstant * 1000)}</li>
            <li><strong>Initial Voltage:</strong> {V0}V</li>
            <li><strong>Simulation Type:</strong> {simulationType === 'charging' ? 'Charging' : 'Discharging'}</li>
            <li><strong>Damping Classification:</strong> {dampingClassification?.type}</li>
          </ul>
        </div>

        <div className="physics-explanation">
          <h3>What's Happening Physically:</h3>
          <p>
            {simulationType === 'charging' 
              ? `The RLC circuit responds to a step input with complex oscillatory behavior. 
                 Energy is exchanged between the inductor's magnetic field and capacitor's electric field,
                 while the resistor dissipates energy as heat. The damping ratio determines how quickly
                 oscillations decay.`
              : `The charged RLC circuit releases its stored energy through oscillatory exchange
                 between the inductor and capacitor. The resistor gradually dissipates the energy,
                 causing the oscillations to decay exponentially.`
            }
          </p>
        </div>

        <div className="exponential-explanation">
          <h3>Damping Behavior:</h3>
          <p>
            <strong>{dampingClassification?.formula}</strong><br/>
            {dampingClassification?.description}
          </p>
          {dampingClassification?.type === 'underdamped' && (
            <p>
              The circuit exhibits oscillatory behavior with exponential decay envelope.
              The frequency of oscillation is lower than the natural frequency due to damping.
            </p>
          )}
          {dampingClassification?.type === 'critically_damped' && (
            <p>
              The circuit returns to equilibrium as quickly as possible without oscillating.
              This represents the boundary between oscillatory and non-oscillatory behavior.
            </p>
          )}
          {dampingClassification?.type === 'overdamped' && (
            <p>
              The circuit returns to equilibrium slowly without oscillating.
              Two different exponential decay rates determine the response.
            </p>
          )}
        </div>

        <div className="time-constant-explanation">
          <h3>Mathematical Model:</h3>
          <p>
            The circuit follows the second-order differential equation:<br/>
            <strong>d²q/dt² + (R/L)dq/dt + (1/LC)q = V(t)/L</strong><br/><br/>
            Where q is charge, L is inductance, C is capacitance, R is resistance, and V(t) is the applied voltage.
            The solution exhibits different behaviors based on the damping ratio ζ.
          </p>
        </div>

        <div className="time-constant-explanation">
          <h3>Practical Applications:</h3>
          <p>
            RLC circuits are fundamental in filters, oscillators, and tuning circuits.
            They're used in radio receivers, signal processing, and power supplies.
            The damping ratio affects bandwidth and selectivity in filter applications.
          </p>
        </div>
      </>
    );
  };

  return (
    <div className="explanation-panel">
      <h2>Experiment Explanation</h2>
      <AIExplanationToggle 
        circuitType={params.type || 'rc'}
        simulationResults={params}
        onExplanationGenerated={(explanation, level) => {
          setAiExplanation(explanation);
          setAiLevel(level);
        }}
      />
  const getOpAmpExplanation = () => {
    const { resistance, gain, configuration, simulationType, V0 } = params;
    
    return (
      <>
        <div className="circuit-params">
          <h3>Circuit Parameters:</h3>
          <ul>
            <li><strong>Input Voltage (Vin):</strong> {V0}V</li>
            <li><strong>Gain:</strong> {gain || 1}</li>
            <li><strong>Configuration:</strong> {configuration || 'inverting'}</li>
            <li><strong>Feedback Resistor (R):</strong> {formatValue(resistance, 'Ω')}</li>
            <li><strong>Simulation Type:</strong> {simulationType === 'charging' ? 'Amplifier' : 'Comparator'}</li>
          </ul>
        </div>

        <div className="physics-explanation">
          <h3>What's Happening Physically:</h3>
          <p>
            {configuration === 'comparator' 
              ? `The op-amp operates as a voltage comparator, comparing the input voltage against a reference.
                 When Vin exceeds the reference, the output saturates at positive supply voltage.
                 When Vin is below reference, output saturates at negative supply voltage.`
              : configuration === 'inverting'
              ? `The inverting amplifier multiplies the input voltage by the negative gain factor -Rf/Rin.
                 The negative sign means the output is 180° out of phase with the input.
                 The feedback network determines the gain and stability of the amplifier.`
              : `The non-inverting buffer maintains the same voltage level as the input but provides
                 current gain and low output impedance. The output follows the input voltage
                 with unity gain, making it ideal for impedance matching.`
            }
          </p>
        </div>

        <div className="exponential-explanation">
          <h3>Key Equations:</h3>
          <p>
            <strong>{configuration === 'inverting' ? 'Inverting: Vout = -(Rf/Rin) × Vin' : 
                  configuration === 'non-inverting' ? 'Non-inverting: Vout = (1 + Rf/Rin) × Vin' :
                  'Comparator: Vout = ±Vsat'}</strong><br/>
            {configuration === 'inverting' 
              ? `The gain is determined by the ratio of feedback resistor (Rf) to input resistor (Rin).
                 Higher gain requires precise resistor matching for stability.`
              : configuration === 'non-inverting'
              ? `Gain is set by 1 plus the ratio of feedback to input resistor.
                 Provides current amplification while maintaining voltage levels.`
              : `Output switches between positive and negative supply rails based on input comparison.`
            }
          </p>
        </div>

        <div className="time-constant-explanation">
          <h3>Practical Applications:</h3>
          <p>
            Op-amps are fundamental building blocks in analog electronics. They're used in:
            signal conditioning, active filters, instrumentation amplifiers, voltage regulators,
            and analog computing. The high input impedance and low output impedance make them
            ideal for interfacing with different circuit stages.
          </p>
        </div>
      </>
    );
  };

  const getBJTExplanation = () => {
    const { resistance, beta, Vbe, configuration, simulationType, V0 } = params;
    
    return (
      <>
        <div className="circuit-params">
          <h3>Circuit Parameters:</h3>
          <ul>
            <li><strong>Base Resistor (R):</strong> {formatValue(resistance, 'Ω')}</li>
            <li><strong>Input Voltage (V0):</strong> {V0}V</li>
            <li><strong>Current Gain (β):</strong> {beta || 100}</li>
            <li><strong>Base-Emitter Voltage (Vbe):</strong> {Vbe || 0.7}V</li>
            <li><strong>Configuration:</strong> {configuration || 'common_emitter'}</li>
            <li><strong>Operating Region:</strong> {params.operatingRegion || 'active'}</li>
          </ul>
        </div>

        <div className="physics-explanation">
          <h3>What's Happening Physically:</h3>
          <p>
            {configuration === 'common_emitter' 
              ? `The BJT operates as a current-controlled device in common emitter configuration.
                 A small base current controls a much larger collector current (Ic = β × Ib).
                 The transistor provides both current gain (β) and voltage gain, making it
                 suitable for amplification applications.`
              : configuration === 'emitter_follower'
              ? `The emitter follower provides unity voltage gain but high current gain.
                 The output voltage follows the input voltage, but with much lower output impedance.
                 Ideal for impedance buffering and driving low-impedance loads.`
              : `The BJT configuration provides specific characteristics for the application.
                 The current gain β determines the relationship between base and collector currents.`
            }
          </p>
        </div>

        <div className="exponential-explanation">
          <h3>Key Equations:</h3>
          <p>
            <strong>Collector Current: Ic = β × Ib</strong><br/>
            <strong>Emitter Current: Ie = (β + 1) × Ib</strong><br/>
            <strong>Base Current: Ib = (Vb - Vbe) / Rb</strong><br/>
            <strong>Current Gain: β = Ic / Ib</strong><br/>
            <br/>
            The transistor amplifies current by factor β, where typical values range from 50-300.
            Higher β provides more current gain but may affect stability and frequency response.
          </p>
        </div>

        <div className="time-constant-explanation">
          <h3>Operating Regions:</h3>
          <p>
            <strong>Cutoff:</strong> Both junctions reverse-biased, no significant current flow<br/>
            <strong>Active:</strong> Base-emitter forward-biased, collector-base reverse-biased, linear amplification<br/>
            <strong>Saturation:</strong> Both junctions forward-biased, collector current limited by external circuit<br/>
            The operating region determines whether the transistor acts as amplifier, switch, or in saturation.
          </p>
        </div>

        <div className="time-constant-explanation">
          <h3>Practical Applications:</h3>
          <p>
            BJTs are essential components in digital logic, switching circuits, and analog amplification.
            They're used in: logic gates, power amplifiers, switching regulators, and
            sensor interfaces. The choice of configuration depends on whether voltage gain,
            current gain, or impedance matching is more important for the application.
          </p>
        </div>
      </>
    );
  };

  const getDigitalExplanation = () => {
    const { logicType, inputs, outputs, truthTable, equation, currentOutput } = params;
    
    return (
      <>
        <div className="circuit-params">
          <h3>Circuit Parameters:</h3>
          <ul>
            <li><strong>Logic Gate Type:</strong> {logicType || 'AND'}</li>
            <li><strong>Current Inputs:</strong> {inputs ? inputs.join(', ') : '1, 1'}</li>
            <li><strong>Current Output:</strong> {currentOutput !== undefined ? (currentOutput ? '1' : '0') : '1'}</li>
            <li><strong>Logic Equation:</strong> {equation || 'Output = A · B'}</li>
          </ul>
        </div>

        <div className="physics-explanation">
          <h3>What's Happening Physically:</h3>
          <p>
            Digital logic gates are the fundamental building blocks of digital electronics.
            They perform Boolean operations on binary inputs (0 or 1) to produce binary outputs.
            The {logicType || 'AND'} gate implements the logical {logicType || 'AND'} operation,
            where the output depends on the specific truth table of the gate type.
          </p>
        </div>

        <div className="exponential-explanation">
          <h3>Logic Operation:</h3>
          <p>
            <strong>{equation || 'Output = A · B'}</strong><br/>
            {logicType === 'AND' && 'The AND gate outputs 1 only when all inputs are 1.'}
            {logicType === 'OR' && 'The OR gate outputs 1 when at least one input is 1.'}
            {logicType === 'NOT' && 'The NOT gate inverts the input (0 becomes 1, 1 becomes 0).'}
            {logicType === 'NAND' && 'The NAND gate outputs 0 only when all inputs are 1 (inverse of AND).'}
            {logicType === 'NOR' && 'The NOR gate outputs 1 only when all inputs are 0 (inverse of OR).'}
            {logicType === 'XOR' && 'The XOR gate outputs 1 when inputs are different (exclusive OR).'}
            {logicType === 'XNOR' && 'The XNOR gate outputs 1 when inputs are the same (inverse of XOR).'}
          </p>
        </div>

        {truthTable && truthTable.length > 0 && (
          <div className="truth-table-explanation">
            <h3>Truth Table:</h3>
            <table className="mini-truth-table">
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
                    <td>{row.inputs[0] !== undefined ? row.inputs[0] : ''}</td>
                    <td>{row.inputs[1] !== undefined ? row.inputs[1] : ''}</td>
                    <td>{row.output ? '1' : '0'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="time-constant-explanation">
          <h3>Practical Applications:</h3>
          <p>
            Digital logic gates are used in virtually all digital systems:
            computers, smartphones, microcontrollers, and digital signal processing.
            They form the basis for arithmetic circuits, memory units, control logic,
            and complex digital systems. Understanding logic gates is fundamental
            to digital electronics and computer engineering.
          </p>
        </div>
      </>
    );
  };

  const getExplanationContent = () => {
    switch (params.type) {
      case 'ohm':
        return getOhmExplanation();
      case 'voltage-divider':
        return getVoltageDividerExplanation();
      case 'rlc':
        return getRLCExplanation();
      case 'op-amp':
        return getOpAmpExplanation();
      case 'bjt':
        return getBJTExplanation();
      case 'digital':
        return getDigitalExplanation();
      default:
        return <></>;
    }
  };

  return (
    <div className="explanation-panel">
      <h2>Experiment Explanation</h2>
      <AIExplanationToggle 
        circuitType={params.type || 'rc'}
        simulationResults={params}
        onExplanationGenerated={(explanation, level) => {
          setAiExplanation(explanation);
          setAiLevel(level);
        }}
      />
      {getExplanationContent()}
    </div>
  );
};

export default ExplanationPanel;
