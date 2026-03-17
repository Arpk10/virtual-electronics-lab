import React from 'react';
import { useAI } from '../contexts/AIContext';
import './ExplanationPanel.css';

const ExplanationPanel = ({ params }) => {
  const { isAIMode } = useAI();
  if (!params) {
    return (
      <div className="explanation-panel">
        <h2>Experiment Explanation</h2>
        <div className="no-data">
          <p>Run a simulation to see the experiment explanation</p>
        </div>
      </div>
    );
  }

  const { experimentType } = params;

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
      case 'ohms':
        return getAIEnhancedContent(getOhmsExplanation(), 'ohms');
      case 'voltage-divider':
        return getAIEnhancedContent(getVoltageDividerExplanation(), 'voltage-divider');
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

  return (
    <div className="explanation-panel">
      <h2>Experiment Explanation</h2>
      {getExplanationContent()}
    </div>
  );
};

export default ExplanationPanel;
