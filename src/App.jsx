import ExportControls from "./components/ExportControls";
import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AIProvider } from './contexts/AIContext';
import { PricingProvider, usePricing } from './contexts/PricingContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import InputPanel from './components/InputPanel';
import GraphPanel from './components/GraphPanel';
import ExplanationPanel from './components/ExplanationPanel';
import ResultsSummary from './components/ResultsSummary';
import PricingModal from './components/PricingModal';
import CircuitDiagram from './components/CircuitDiagram.jsx';
import { simulateStructuredCircuit, CIRCUIT_TYPES, SIMULATION_MODES } from './engine';
import { combineSimulations } from './visualization';
import './App.css';

function AppContent() {
  const [simulationData, setSimulationData] = useState(null);
  const [circuitParams, setCircuitParams] = useState(null);
  const [activeExperiment, setActiveExperiment] = useState('rc');
  const [compareMode, setCompareMode] = useState(false);
  const [simulations, setSimulations] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { incrementSimulationCount, canRunSimulation, setShowPricingModal } = usePricing();

  // Auto-run demo on page load
  useEffect(() => {
    const runDemoSimulation = () => {
      // Create demo voltage divider circuit
      const demoCircuit = {
        type: CIRCUIT_TYPES.VOLTAGE_DIVIDER,
        mode: SIMULATION_MODES.CHARGING,
        components: {
          Vin: 12,     // 12V
          R1: 1000,    // 1k
          R2: 2000     // 2k
        }
      };

      try {
        const demoData = simulateStructuredCircuit(demoCircuit);
        // Mark as demo for pricing logic
        demoData.circuitParams.isDemo = true;
        demoData.circuitParams.experimentType = 'voltage-divider';
        
        setSimulationData(demoData);
        setCircuitParams(demoData.circuitParams);
        setActiveExperiment('voltage-divider');
      } catch (error) {
        console.error('Demo simulation error:', error);
      }
    };

    // Run demo after a short delay to ensure components are mounted
    const timer = setTimeout(runDemoSimulation, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSimulation = (data) => {
    // Don't count demo simulation towards daily limit
    const isDemoSimulation = data.circuitParams?.isDemo;
    
    if (!isDemoSimulation && !canRunSimulation()) {
      setShowPricingModal(true);
      return;
    }
    
    if (isDemoSimulation || incrementSimulationCount()) {
      setIsSimulating(true);
      setSuccessMessage('');
      
      setTimeout(() => {
        if (compareMode) {
          // Add to compare mode
          const newSimulation = {
            ...data,
            id: Date.now(),
            color: getNextColor()
          };
          setSimulations(prev => [...prev, newSimulation]);
          
          // Update chart data for comparison using new visualization layer
          const combinedData = combineSimulations([...simulations, newSimulation]);
          setSimulationData(combinedData);
          setCircuitParams(combinedData.circuitParams);
        } else {
          // Normal single simulation
          setSimulationData(data);
          setCircuitParams(data.circuitParams);
        }
        
        setIsSimulating(false);
        setSuccessMessage('✅ Simulation completed successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      }, 500);
    }
  };

  
  const getSimulationLabel = (simulation, index) => {
    const { circuitParams } = simulation;
    if (circuitParams.resistance && circuitParams.capacitance) {
      return `R=${formatValue(circuitParams.resistance, 'Ω')}, C=${formatValue(circuitParams.capacitance, 'F')}`;
    }
    return `Simulation ${index + 1}`;
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
    return `${value.toFixed(3)}${unit}`;
  };

  const getNextColor = () => {
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];
    const currentIndex = simulations.length % colors.length;
    return colors[currentIndex];
  };

  const clearGraph = () => {
    setSimulations([]);
    setSimulationData(null);
    setCircuitParams(null);
  };

  const toggleCompareMode = () => {
    if (compareMode) {
      // Exit compare mode
      setCompareMode(false);
      setSimulations([]);
      setSimulationData(null);
      setCircuitParams(null);
    } else {
      // Enter compare mode
      setCompareMode(true);
    }
  };

  const handleExperimentChange = (experimentType) => {
    setActiveExperiment(experimentType);
    // Reset simulation data when switching experiments
    setSimulationData(null);
    setCircuitParams(null);
    setSimulations([]);
    setCompareMode(false);
    setIsSimulating(false);
    setSuccessMessage('');
  };

  return (
    <div className="app">
      <Navbar />
      <Sidebar 
        activeExperiment={activeExperiment} 
        onExperimentChange={handleExperimentChange} 
      />
      <PricingModal />
      
      <main className="main-content">
        <div className="dashboard-header">
          <div className="dashboard-header-content">
            <div>
              <h1 className="text-h1 dashboard-title">
                {activeExperiment === 'rc' && 'RC Circuit Analysis'}
                {activeExperiment === 'rl' && 'RL Circuit Analysis'}
                {activeExperiment === 'rlc' && 'RLC Circuit Analysis'}
                {activeExperiment === 'ohms' && "Ohm's Law Calculator"}
                {activeExperiment === 'voltage-divider' && 'Voltage Divider Analysis'}
              </h1>
              <p className="text-label-secondary dashboard-subtitle">
                {activeExperiment === 'rc' && 'Analyze resistor-capacitor charging and discharging behavior'}
                {activeExperiment === 'rl' && 'Study resistor-inductor current buildup and decay'}
                {activeExperiment === 'rlc' && 'Analyze resistor-inductor-capacitor oscillatory behavior'}
                {activeExperiment === 'ohms' && 'Calculate current using Ohm\'s Law: I = V/R'}
                {activeExperiment === 'voltage-divider' && 'Voltage Divider - Live Simulation'}
              </p>
            </div>
            <div className="compare-controls">
              <button 
                onClick={toggleCompareMode}
                className={`compare-toggle ${compareMode ? 'active' : ''}`}
              >
                {compareMode ? 'Exit Compare' : 'Compare Mode'}
              </button>
              {simulations.length > 0 && (
                <button 
                  onClick={clearGraph}
                  className="clear-graph-btn"
                >
                  Clear Graph
                </button>
              )}
            </div>
        </div>
        
        <div className="visualization-section spacing-md-top">
          <div className="circuit-section breathable">
            <CircuitDiagram 
              circuitType={activeExperiment}
              parameters={circuitParams}
            />
          </div>
          
          <div className="graph-section spacing-md-top breathable">
            <GraphPanel data={simulationData} />
          </div>
            <ResultsSummary 
              simulationData={simulationData} 
              compareMode={compareMode}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AIProvider>
        <PricingProvider>
          <AppContent />
        </PricingProvider>
      </AIProvider>
    </ThemeProvider>
  );
}

export default App;
