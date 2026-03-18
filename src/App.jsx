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
      const demoData = {
        labels: Array.from({length: 100}, (_, i) => (i * 0.1).toFixed(1)),
        datasets: [{
          label: 'Voltage (V)',
          data: Array.from({length: 100}, (_, i) => {
            const t = i * 0.001; // 0 to 0.1 seconds
            const V0 = 5; // 5V step input
            const tau = 1000 * 10e-6; // R=1000, C=10uF
            return V0 * (1 - Math.exp(-t / tau));
          }),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderWidth: 4,
          pointRadius: 3,
          pointHoverRadius: 8,
          tension: 0.4,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 3,
          fill: true,
        }],
        chartType: 'voltage',
        circuitParams: {
          experimentType: 'rc',
          resistance: 1000,
          capacitance: 10e-6,
          simulationType: 'charging',
          timeConstant: 1000 * 10e-6,
          V0: 5,
          maxTime: 0.1,
          isDemo: true
        }
      };
      
      setSimulationData(demoData);
      setCircuitParams(demoData.circuitParams);
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
          
          // Update chart data for comparison
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

  const combineSimulations = (simList) => {
    if (simList.length === 0) return null;
    
    // Use the first simulation's labels as base
    const baseLabels = simList[0].labels;
    const datasets = simList.map((sim, index) => ({
      label: getSimulationLabel(sim, index),
      data: sim.data,
      borderColor: sim.color || getNextColor(),
      backgroundColor: sim.color ? `${sim.color}20` : `${getNextColor()}20`,
      borderWidth: 3,
      pointRadius: 2,
      pointHoverRadius: 6,
      tension: 0.4,
      pointBackgroundColor: sim.color || getNextColor(),
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    }));

    return {
      labels: baseLabels,
      datasets,
      chartType: 'comparison',
      circuitParams: {
        experimentType: 'comparison',
        simulations: simList.map(s => s.circuitParams)
      }
    };
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
              <h1 className="dashboard-title">
                {activeExperiment === 'rc' && 'RC Circuit Analysis'}
                {activeExperiment === 'rl' && 'RL Circuit Analysis'}
                {activeExperiment === 'ohms' && "Ohm's Law Calculator"}
                {activeExperiment === 'voltage-divider' && 'Voltage Divider Analysis'}
              </h1>
              <p className="dashboard-subtitle">
                {activeExperiment === 'rc' && 'Analyze resistor-capacitor charging and discharging behavior'}
                {activeExperiment === 'rl' && 'Study resistor-inductor current buildup and decay'}
                {activeExperiment === 'ohms' && 'Calculate current using Ohm\'s Law: I = V/R'}
                {activeExperiment === 'voltage-divider' && 'Design and analyze voltage division circuits'}
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
        </div>
        
        <div className="dashboard-grid">
          <div className="dashboard-card input-card">
            <InputPanel 
              onSimulate={handleSimulation} 
              experimentType={activeExperiment}
              isSimulating={isSimulating}
            />
            {successMessage && (
              <div className="success-message">
                {successMessage}
              </div>
            )}
          </div>
          
          <div className="dashboard-card results-card">
            <div className="results-grid">
              <div className="result-item">
                <GraphPanel data={simulationData} />
              </div>
              <div className="result-item">
                <ExplanationPanel params={circuitParams} />
              </div>
              <div className="result-item">
                {/* <ExportControls 
                  simulationData={simulationData} 
                  explanationText={circuitParams}
                /> */}
              </div>
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
