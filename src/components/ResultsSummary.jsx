import React from 'react';
import './ResultsSummary.css';

const ResultsSummary = ({ simulationData, compareMode }) => {
  if (!simulationData || !simulationData.circuitParams) {
    return null;
  }

  const { circuitParams, chartType } = simulationData;
  
  const getTimeConstant = () => {
    if (circuitParams.resistance && circuitParams.capacitance) {
      const tau = circuitParams.resistance * circuitParams.capacitance;
      return tau < 0.001 
        ? `${(tau * 1000).toFixed(2)} ms`
        : tau < 1 
        ? `${tau.toFixed(3)} s`
        : `${tau.toFixed(1)} s`;
    }
    return 'N/A';
  };

  const getMaxVoltage = () => {
    if (circuitParams.V0) {
      return `${circuitParams.V0.toFixed(2)} V`;
    }
    if (circuitParams.vin) {
      return `${circuitParams.vin.toFixed(2)} V`;
    }
    return 'N/A';
  };

  const getInsights = () => {
    const insights = [];
    
    if (chartType === 'voltage' || chartType === 'current') {
      insights.push(
        `Time constant τ = ${getTimeConstant()} determines how quickly the circuit responds to changes.`
      );
      
      if (circuitParams.simulationType === 'charging') {
        insights.push(
          'After 5τ, the circuit reaches ~99.3% of its final value (practically fully charged).'
        );
      } else {
        insights.push(
          'After 5τ, the circuit has discharged to ~0.7% of its initial value (practically fully discharged).'
        );
      }
    }
    
    if (chartType === 'static' || chartType === 'comparison') {
      insights.push(
        'These results show the steady-state behavior of the circuit under constant conditions.'
      );
    }
    
    if (compareMode && simulationData.circuitParams.simulations) {
      insights.push(
        `Comparing ${simulationData.circuitParams.simulations.length} different circuit configurations to analyze their relative performance.`
      );
    }
    
    return insights;
  };

  const formatResistance = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)} kΩ`;
    }
    return `${value.toFixed(1)} Ω`;
  };

  const formatCapacitance = (value) => {
    if (value >= 1e-6) {
      return `${(value * 1e6).toFixed(1)} μF`;
    }
    if (value >= 1e-9) {
      return `${(value * 1e9).toFixed(1)} nF`;
    }
    return `${(value * 1e12).toFixed(1)} pF`;
  };

  return (
    <div className="results-summary">
      <h3>Results Summary</h3>
      
      <div className="summary-grid">
        <div className="summary-item">
          <div className="summary-label">Time Constant (τ)</div>
          <div className="summary-value">{getTimeConstant()}</div>
        </div>
        
        <div className="summary-item">
          <div className="summary-label">Max Voltage</div>
          <div className="summary-value">{getMaxVoltage()}</div>
        </div>
        
        {(circuitParams.resistance || circuitParams.capacitance) && (
          <div className="summary-item">
            <div className="summary-label">Circuit Parameters</div>
            <div className="summary-value">
              {circuitParams.resistance && (
                <span>R = {formatResistance(circuitParams.resistance)}</span>
              )}
              {circuitParams.resistance && circuitParams.capacitance && (
                <span>, </span>
              )}
              {circuitParams.capacitance && (
                <span>C = {formatCapacitance(circuitParams.capacitance)}</span>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="insights-section">
        <h4>Key Insights</h4>
        <ul>
          {getInsights().map((insight, index) => (
            <li key={index}>{insight}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ResultsSummary;
