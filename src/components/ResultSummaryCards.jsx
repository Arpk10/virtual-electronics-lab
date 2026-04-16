import React from 'react';
import './ResultSummaryCards.css';

const ResultSummaryCards = ({ circuitType, parameters = {} }) => {
  const { voltage, resistance, capacitance, inductance, R1, R2 } = parameters;
  
  // Calculate values based on circuit type
  const calculateValues = () => {
    let vin = 0;
    let vout = 0;
    let gain = 0;
    let ratio = 0;
    
    switch (circuitType) {
      case 'voltage-divider':
        vin = voltage || 12;
        vout = R1 && R2 ? (vin * R2) / (R1 + R2) : vin / 2;
        gain = vin > 0 ? vout / vin : 0;
        ratio = R1 && R2 ? R2 / R1 : 1;
        break;
        
      case 'rc':
        vin = voltage || 5;
        vout = vin; // At steady state
        gain = 1;
        ratio = 1;
        break;
        
      case 'rl':
        vin = voltage || 5;
        vout = vin; // At steady state
        gain = 1;
        ratio = 1;
        break;
        
      case 'rlc':
        vin = voltage || 10;
        vout = vin; // At steady state
        gain = 1;
        ratio = 1;
        break;
        
      default:
        vin = 12;
        vout = 6;
        gain = 0.5;
        ratio = 1;
    }
    
    return { vin, vout, gain, ratio };
  };
  
  const { vin, vout, gain, ratio } = calculateValues();
  
  const formatValue = (value, decimals = 2) => {
    return typeof value === 'number' ? value.toFixed(decimals) : '0.00';
  };
  
  const getGainLabel = () => {
    switch (circuitType) {
      case 'voltage-divider':
        return 'Ratio';
      case 'rc':
      case 'rl':
      case 'rlc':
        return 'Gain';
      default:
        return 'Gain';
    }
  };
  
  const getGainValue = () => {
    switch (circuitType) {
      case 'voltage-divider':
        return `1:${formatValue(ratio, 2)}`;
      default:
        return formatValue(gain, 3);
    }
  };
  
  return (
    <div className="result-summary-cards">
      <div className="summary-card voltage-card">
        <div className="card-label">VIN</div>
        <div className="card-value text-value-large">{formatValue(vin)}V</div>
      </div>
      
      <div className="summary-card voltage-card">
        <div className="card-label">VOUT</div>
        <div className="card-value text-value-large">{formatValue(vout)}V</div>
      </div>
      
      <div className="summary-card warning-card">
        <div className="card-label">{getGainLabel()}</div>
        <div className="card-value text-value-large">{getGainValue()}</div>
      </div>
    </div>
  );
};

export default ResultSummaryCards;
