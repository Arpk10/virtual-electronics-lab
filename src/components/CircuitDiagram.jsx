import React, { useState, useEffect } from 'react';
import './CircuitDiagram.css';

const CircuitDiagram = ({ circuitType, parameters = {} }) => {
  const { resistance, capacitance, inductance, voltage, R1, R2 } = parameters;
  const [hoveredComponent, setHoveredComponent] = useState(null);
  const [voutVoltage, setVoutVoltage] = useState(0);
  const [showCurrentFlow, setShowCurrentFlow] = useState(false);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, text: '' });

  // Calculate Vout voltage for voltage divider
  useEffect(() => {
    if (circuitType === 'voltage-divider' && voltage && R1 && R2) {
      const vout = (voltage * R2) / (R1 + R2);
      setVoutVoltage(vout);
    } else if (circuitType === 'rc' && voltage && resistance && capacitance) {
      // For RC circuit, Vout at steady state equals Vin
      setVoutVoltage(voltage);
    } else if (circuitType === 'rl' && voltage && resistance && inductance) {
      // For RL circuit, Vout at steady state equals Vin
      setVoutVoltage(voltage);
    } else if (circuitType === 'rlc' && voltage) {
      // For RLC circuit, Vout at steady state equals Vin
      setVoutVoltage(voltage);
    }
  }, [circuitType, voltage, R1, R2, resistance, capacitance, inductance]);

  // Start current flow animation when circuit is active
  useEffect(() => {
    if (voltage) {
      setShowCurrentFlow(true);
    } else {
      setShowCurrentFlow(false);
    }
  }, [voltage]);

  const handleComponentHover = (componentName, event) => {
    setHoveredComponent(componentName);
    const rect = event.target.getBoundingClientRect();
    setTooltip({
      show: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      text: componentName
    });
  };

  const handleComponentLeave = () => {
    setHoveredComponent(null);
    setTooltip({ show: false, x: 0, y: 0, text: '' });
  };
  
  // Format component values for display
  const formatValue = (value, unit) => {
    if (!value) return '';
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M${unit}`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k${unit}`;
    return `${value}${unit}`;
  };

  // SVG component definitions
  const Resistor = ({ x, y, label, value, rotation = 0, componentName }) => (
    <g 
      transform={`translate(${x}, ${y}) rotate(${rotation})`}
      onMouseEnter={(e) => handleComponentHover(`${label} = ${value}`, e)}
      onMouseLeave={handleComponentLeave}
      className={`circuit-component ${hoveredComponent?.includes(label) ? 'highlighted' : ''}`}
    >
      {/* Resistor body (zigzag) */}
      <path
        d="M 0,0 L 10,0 L 15,-8 L 25,8 L 35,-8 L 45,8 L 55,-8 L 65,8 L 70,0 L 80,0"
        stroke={hoveredComponent?.includes(label) ? "#3b82f6" : "#374151"}
        strokeWidth={hoveredComponent?.includes(label) ? "3" : "2"}
        fill="none"
        className="component-path"
      />
      {/* Connection lines */}
      <line x1="-20" y1="0" x2="0" y2="0" stroke="#374151" strokeWidth="2" />
      <line x1="80" y1="0" x2="100" y2="0" stroke="#374151" strokeWidth="2" />
      {/* Current flow animation */}
      {showCurrentFlow && (
        <>
          <circle r="3" fill="#3b82f6" className="current-flow-dot">
            <animateMotion dur="2s" repeatCount="indefinite">
              <mpath href="#resistor-path"/>
            </animateMotion>
          </circle>
          <path
            id="resistor-path"
            d="M -20,0 L 100,0"
            stroke="none"
            fill="none"
          />
        </>
      )}
      {/* Label */}
      <text x="40" y="-15" textAnchor="middle" fontSize="12" fill="#111827" className="text-label component-label">
        {label}
      </text>
      <text x="40" y="20" textAnchor="middle" fontSize="10" fill="#6b7280" className="text-value-small component-value">
        {value}
      </text>
    </g>
  );

  const Capacitor = ({ x, y, label, value, rotation = 0 }) => (
    <g 
      transform={`translate(${x}, ${y}) rotate(${rotation})`}
      onMouseEnter={(e) => handleComponentHover(`${label} = ${value}`, e)}
      onMouseLeave={handleComponentLeave}
      className={`circuit-component ${hoveredComponent?.includes(label) ? 'highlighted' : ''}`}
    >
      {/* Capacitor plates */}
      <line 
        x1="30" y1="-20" x2="30" y2="20" 
        stroke={hoveredComponent?.includes(label) ? "#3b82f6" : "#374151"} 
        strokeWidth={hoveredComponent?.includes(label) ? "4" : "3"} 
        className="component-path"
      />
      <line 
        x1="50" y1="-20" x2="50" y2="20" 
        stroke={hoveredComponent?.includes(label) ? "#3b82f6" : "#374151"} 
        strokeWidth={hoveredComponent?.includes(label) ? "4" : "3"} 
        className="component-path"
      />
      {/* Connection lines */}
      <line x1="-20" y1="0" x2="30" y2="0" stroke="#374151" strokeWidth="2" />
      <line x1="50" y1="0" x2="100" y2="0" stroke="#374151" strokeWidth="2" />
      {/* Current flow animation */}
      {showCurrentFlow && (
        <>
          <circle r="3" fill="#3b82f6" className="current-flow-dot">
            <animateMotion dur="2s" repeatCount="indefinite">
              <mpath href="#capacitor-path"/>
            </animateMotion>
          </circle>
          <path
            id="capacitor-path"
            d="M -20,0 L 100,0"
            stroke="none"
            fill="none"
          />
        </>
      )}
      {/* Label */}
      <text x="40" y="-25" textAnchor="middle" fontSize="12" fill="#111827" className="text-label component-label">
        {label}
      </text>
      <text x="40" y="35" textAnchor="middle" fontSize="10" fill="#6b7280" className="text-value-small component-value">
        {value}
      </text>
    </g>
  );

  const Inductor = ({ x, y, label, value, rotation = 0 }) => (
    <g 
      transform={`translate(${x}, ${y}) rotate(${rotation})`}
      onMouseEnter={(e) => handleComponentHover(`${label} = ${value}`, e)}
      onMouseLeave={handleComponentLeave}
      className={`circuit-component ${hoveredComponent?.includes(label) ? 'highlighted' : ''}`}
    >
      {/* Inductor coils */}
      <path
        d="M 0,0 Q 10,-10 20,0 Q 30,10 40,0 Q 50,-10 60,0 Q 70,10 80,0"
        stroke={hoveredComponent?.includes(label) ? "#3b82f6" : "#374151"}
        strokeWidth={hoveredComponent?.includes(label) ? "3" : "2"}
        fill="none"
        className="component-path"
      />
      {/* Connection lines */}
      <line x1="-20" y1="0" x2="0" y2="0" stroke="#374151" strokeWidth="2" />
      <line x1="80" y1="0" x2="100" y2="0" stroke="#374151" strokeWidth="2" />
      {/* Current flow animation */}
      {showCurrentFlow && (
        <>
          <circle r="3" fill="#3b82f6" className="current-flow-dot">
            <animateMotion dur="2s" repeatCount="indefinite">
              <mpath href="#inductor-path"/>
            </animateMotion>
          </circle>
          <path
            id="inductor-path"
            d="M -20,0 L 100,0"
            stroke="none"
            fill="none"
          />
        </>
      )}
      {/* Label */}
      <text x="40" y="-15" textAnchor="middle" fontSize="12" fill="#111827" className="text-label component-label">
        {label}
      </text>
      <text x="40" y="20" textAnchor="middle" fontSize="10" fill="#6b7280" className="text-value-small component-value">
        {value}
      </text>
    </g>
  );

  const VoltageSource = ({ x, y, label, value, rotation = 0 }) => (
    <g 
      transform={`translate(${x}, ${y}) rotate(${rotation})`}
      onMouseEnter={(e) => handleComponentHover(`${label} = ${value}`, e)}
      onMouseLeave={handleComponentLeave}
      className={`circuit-component ${hoveredComponent?.includes(label) ? 'highlighted' : ''}`}
    >
      {/* Circle */}
      <circle 
        cx="40" cy="0" r="25" 
        stroke={hoveredComponent?.includes(label) ? "#3b82f6" : "#374151"} 
        strokeWidth={hoveredComponent?.includes(label) ? "3" : "2"} 
        fill="none" 
        className="component-path"
      />
      {/* + and - symbols */}
      <text x="40" y="-8" textAnchor="middle" fontSize="16" fill="#dc2626" fontWeight="bold">
        +
      </text>
      <text x="40" y="12" textAnchor="middle" fontSize="16" fill="#2563eb" fontWeight="bold">
        -
      </text>
      {/* Connection lines */}
      <line x1="-20" y1="0" x2="15" y2="0" stroke="#374151" strokeWidth="2" />
      <line x1="65" y1="0" x2="100" y2="0" stroke="#374151" strokeWidth="2" />
      {/* Current flow animation */}
      {showCurrentFlow && (
        <>
          <circle r="3" fill="#3b82f6" className="current-flow-dot">
            <animateMotion dur="2s" repeatCount="indefinite">
              <mpath href="#voltage-path"/>
            </animateMotion>
          </circle>
          <path
            id="voltage-path"
            d="M -20,0 L 100,0"
            stroke="none"
            fill="none"
          />
        </>
      )}
      {/* Label */}
      <text x="40" y="-35" textAnchor="middle" fontSize="12" fill="#111827" className="text-label component-label">
        {label}
      </text>
      <text x="40" y="45" textAnchor="middle" fontSize="10" fill="#6b7280" className="text-value-small component-value">
        {value}
      </text>
    </g>
  );

  const Ground = ({ x, y }) => (
    <g transform={`translate(${x}, ${y})`}>
      {/* Ground symbol */}
      <line x1="0" y1="0" x2="0" y2="20" stroke="#374151" strokeWidth="2" />
      <line x1="-15" y1="20" x2="15" y2="20" stroke="#374151" strokeWidth="3" />
      <line x1="-10" y1="26" x2="10" y2="26" stroke="#374151" strokeWidth="2" />
      <line x1="-5" y1="32" x2="5" y2="32" stroke="#374151" strokeWidth="1" />
      <text x="0" y="50" textAnchor="middle" fontSize="10" fill="#6b7280" className="text-label">
        GND
      </text>
    </g>
  );

  const Node = ({ x, y, label, voltage, isHighlighted = false }) => (
    <g 
      onMouseEnter={(e) => handleNodeHover(label, voltage, e)}
      onMouseLeave={handleNodeLeave}
      className={`circuit-node ${isHighlighted ? 'highlighted' : ''}`}
    >
      <circle cx={x} cy={y} r="8" className={isHighlighted ? "voltage-node" : "current-node"} strokeWidth="2"/>
      <text x={x} y={y - 15} textAnchor="middle" fontSize="12" fill="#111827" className="text-label">
        {label}
      </text>
      {voltage !== undefined && (
        <text x={x} y={y + 20} textAnchor="middle" fontSize="10" fill="#6b7280" className="text-value-small">
          {voltage.toFixed(2)}V
        </text>
      )}
    </g>
  );

  // Wire component
  const Wire = ({ x1, y1, x2, y2 }) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#374151" strokeWidth="2" />
  );

  // Render different circuit types
  const renderCircuit = () => {
    switch (circuitType) {
      case 'voltage-divider':
        return (
          <svg viewBox="0 0 700 200" className="circuit-svg">
            {/* Vin label */}
            <text x="30" y="90" textAnchor="middle" fontSize="14" fill="var(--color-voltage)" fontWeight="bold" className="text-label">
              VIN
            </text>
            <text x="30" y="110" textAnchor="middle" fontSize="12" fill="var(--color-voltage)" className="text-value-small">
              {voltage ? `${voltage}V` : '12V'}
            </text>
            
            {/* Wire from Vin to R1 */}
            <Wire x1="50" y1="100" x2="120" y2="100" />
            
            {/* R1 */}
            <Resistor x="120" y="100" label="R1" value={R1 ? formatValue(R1, '') : formatValue(resistance, '')} />
            
            {/* Wire from R1 to middle node */}
            <Wire x1="300" y1="100" x2="350" y2="100" />
            
            {/* Middle node (Vout) */}
            <Node x="350" y="100" label="Vout" voltage={voutVoltage} />
            
            {/* Wire from middle node to R2 */}
            <Wire x1="350" y1="100" x2="400" y2="100" />
            
            {/* R2 */}
            <Resistor x="400" y="100" label="R2" value={R2 ? formatValue(R2, '') : formatValue(resistance, '')} />
            
            {/* Wire from R2 to GND */}
            <Wire x1="580" y1="100" x2="620" y2="100" />
            
            {/* Ground */}
            <Ground x="620" y="100" />
            
            {/* Vout label with voltage */}
            <text x="350" y="70" textAnchor="middle" fontSize="14" fill="var(--color-voltage)" fontWeight="bold" className="text-label">
              VOUT
            </text>
            <text x="350" y="55" textAnchor="middle" fontSize="12" fill="var(--color-voltage)" className="text-value-small">
              {voutVoltage ? `${voutVoltage.toFixed(2)}V` : '0.00V'}
            </text>
            
            {/* Return wire from voltage source to ground */}
            <Wire x1="30" y1="100" x2="30" y2="140" />
            <Wire x1="30" y1="140" x2="620" y2="140" />
            <Wire x1="620" y1="140" x2="620" y2="120" />
            
            {/* Current flow animation */}
            {showCurrentFlow && (
              <>
                <circle r="3" fill="var(--color-current)" className="current-flow-dot">
                  <animateMotion dur="3s" repeatCount="indefinite">
                    <mpath href="#voltage-divider-path"/>
                  </animateMotion>
                </circle>
                <path
                  id="voltage-divider-path"
                  d="M 50,100 L 620,100"
                  stroke="none"
                  fill="none"
                />
              </>
            )}
          </svg>
        );

      case 'rc':
        return (
          <svg viewBox="0 0 600 200" className="circuit-svg">
            {/* Voltage Source */}
            <VoltageSource x="50" y="100" label="Vin" value={voltage ? `${voltage}V` : '5V'} />
            
            {/* Wire to Resistor */}
            <Wire x1="150" y1="100" x2="200" y2="100" />
            
            {/* Resistor */}
            <Resistor x="200" y="100" label="R" value={formatValue(resistance, '')} />
            
            {/* Wire to Capacitor */}
            <Wire x1="380" y1="100" x2="420" y2="100" />
            
            {/* Node at junction */}
            <Node x="400" y="100" label="Vout" voltage={voutVoltage} />
            
            {/* Capacitor */}
            <Capacitor x="420" y="100" label="C" value={formatValue(capacitance, 'F')} />
            
            {/* Ground connection */}
            <Wire x1="520" y1="100" x2="550" y2="100" />
            <Wire x1="550" y1="100" x2="550" y2="140" />
            <Ground x="550" y="140" />
            
            {/* Return wire */}
            <Wire x1="50" y1="100" x2="50" y2="170" />
            <Wire x1="50" y1="170" x2="550" y2="170" />
            <Wire x1="550" y1="170" x2="550" y2="160" />
          </svg>
        );

      case 'rl':
        return (
          <svg viewBox="0 0 600 200" className="circuit-svg">
            {/* Voltage Source */}
            <VoltageSource x="50" y="100" label="Vin" value={voltage ? `${voltage}V` : '5V'} />
            
            {/* Wire to Resistor */}
            <Wire x1="150" y1="100" x2="200" y2="100" />
            
            {/* Resistor */}
            <Resistor x="200" y="100" label="R" value={formatValue(resistance, '')} />
            
            {/* Wire to Inductor */}
            <Wire x1="380" y1="100" x2="420" y2="100" />
            
            {/* Node at junction */}
            <Node x="400" y="100" label="Vout" voltage={voutVoltage} />
            
            {/* Inductor */}
            <Inductor x="420" y="100" label="L" value={formatValue(inductance, 'H')} />
            
            {/* Ground connection */}
            <Wire x1="520" y1="100" x2="550" y2="100" />
            <Wire x1="550" y1="100" x2="550" y2="140" />
            <Ground x="550" y="140" />
            
            {/* Return wire */}
            <Wire x1="50" y1="100" x2="50" y2="170" />
            <Wire x1="50" y1="170" x2="550" y2="170" />
            <Wire x1="550" y1="170" x2="550" y2="160" />
          </svg>
        );

      case 'rlc':
        return (
          <svg viewBox="0 0 700 200" className="circuit-svg">
            {/* Voltage Source */}
            <VoltageSource x="50" y="100" label="Vin" value={voltage ? `${voltage}V` : '5V'} />
            
            {/* Wire to Resistor */}
            <Wire x1="150" y1="100" x2="200" y2="100" />
            
            {/* Resistor */}
            <Resistor x="200" y="100" label="R" value={formatValue(resistance, '')} />
            
            {/* Wire to Inductor */}
            <Wire x1="380" y1="100" x2="420" y2="100" />
            
            {/* Inductor */}
            <Inductor x="420" y="100" label="L" value={formatValue(inductance, 'H')} />
            
            {/* Wire to Capacitor */}
            <Wire x1="520" y1="100" x2="560" y2="100" />
            
            {/* Node at junction */}
            <Node x="540" y="100" label="Vout" />
            
            {/* Capacitor */}
            <Capacitor x="560" y="100" label="C" value={formatValue(capacitance, 'F')} />
            
            {/* Ground connection */}
            <Wire x1="660" y1="100" x2="690" y2="100" />
            <Wire x1="690" y1="100" x2="690" y2="140" />
            <Ground x="690" y="140" />
            
            {/* Return wire */}
            <Wire x1="50" y1="100" x2="50" y2="170" />
            <Wire x1="50" y1="170" x2="690" y2="170" />
            <Wire x1="690" y1="170" x2="690" y2="160" />
          </svg>
        );

      default:
        return (
          <div className="no-circuit">
            <p>Select a circuit type to see the diagram</p>
          </div>
        );
    }
  };

  return (
    <div className="circuit-diagram animation-medium premium-spacing">
      {/* Lab-style Identity Elements */}
      <div className="lab-identity spacing-md-bottom">
        <div className="experiment-header">
          <div className="experiment-title">Experiment</div>
          <div className="experiment-name precision-text">
            {circuitType === 'voltage-divider' ? 'Voltage Divider' :
             circuitType === 'rc' ? 'RC Circuit' :
             circuitType === 'rl' ? 'RL Circuit' :
             circuitType === 'rlc' ? 'RLC Circuit' :
             circuitType === 'opamp' ? 'Op-Amp Circuit' :
             circuitType === 'bjt' ? 'BJT Circuit' :
             circuitType === 'digital' ? 'Digital Logic' :
             circuitType?.toUpperCase() || 'UNKNOWN'}
          </div>
        </div>
        <div className="status-badge">
          <div className="status-indicator"></div>
          Live Simulation
        </div>
      </div>

      {/* Professional Signals */}
      <div className="professional-signals">
        <div className="signal-badge signal-realtime">
          <div className="signal-indicator"></div>
          Real-time simulation
        </div>
        <div className="signal-badge signal-precision">
          <div className="signal-indicator"></div>
          Engineering precision
        </div>
      </div>

      <div className="divider"></div>

      <div className="diagram-header spacing-md-bottom">
        <h3 className="text-h3">Circuit Diagram</h3>
        <p className="text-label circuit-type">{circuitType?.toUpperCase() || 'UNKNOWN'} Circuit</p>
      </div>
      <div className="diagram-container fade-in">
        {renderCircuit()}
      </div>
      {tooltip.show && (
        <div 
          className="circuit-tooltip fade-in"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default CircuitDiagram;
