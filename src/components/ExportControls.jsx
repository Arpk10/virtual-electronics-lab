import React, { useState } from 'react';
import './ExportControls.css';

const ExportControls = ({ simulationData, explanationText }) => {
  const [saveStatus, setSaveStatus] = useState('');
  const [copyStatus, setCopyStatus] = useState('');

  // Download graph as PNG
  const downloadGraph = () => {
    if (!simulationData) {
      setSaveStatus('No graph data available');
      setTimeout(() => setSaveStatus(''), 3000);
      return;
    }

    const canvas = document.querySelector('canvas');
    if (!canvas) {
      setSaveStatus('No graph found');
      setTimeout(() => setSaveStatus(''), 3000);
      return;
    }

    try {
      const link = document.createElement('a');
      link.download = `electrolab-${simulationData.circuitParams.experimentType}-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      setSaveStatus('Graph downloaded successfully');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('Failed to download graph');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // Copy explanation text
  const copyExplanation = () => {
    if (!explanationText) {
      setCopyStatus('No explanation available');
      setTimeout(() => setCopyStatus(''), 3000);
      return;
    }

    try {
      // Get explanation text from the DOM
      const explanationElement = document.querySelector('.explanation-panel');
      if (!explanationElement) {
        setCopyStatus('No explanation found');
        setTimeout(() => setCopyStatus(''), 3000);
        return;
      }

      // Extract text content
      const textContent = explanationElement.innerText || explanationElement.textContent;
      
      navigator.clipboard.writeText(textContent).then(() => {
        setCopyStatus('Explanation copied to clipboard');
        setTimeout(() => setCopyStatus(''), 3000);
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = textContent;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopyStatus('Explanation copied to clipboard');
        setTimeout(() => setCopyStatus(''), 3000);
      });
    } catch (error) {
      setCopyStatus('Failed to copy explanation');
      setTimeout(() => setCopyStatus(''), 3000);
    }
  };

  // Save simulation to localStorage
  const saveSimulation = () => {
    if (!simulationData) {
      setSaveStatus('No simulation data to save');
      setTimeout(() => setSaveStatus(''), 3000);
      return;
    }

    try {
      const savedSimulations = JSON.parse(localStorage.getItem('electrolab-simulations') || '[]');
      const newSimulation = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        experimentType: simulationData.circuitParams.experimentType,
        data: simulationData,
        explanation: explanationText
      };
      
      savedSimulations.push(newSimulation);
      
      // Keep only last 10 simulations
      if (savedSimulations.length > 10) {
        savedSimulations.shift();
      }
      
      localStorage.setItem('electrolab-simulations', JSON.stringify(savedSimulations));
      setSaveStatus('Simulation saved locally');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('Failed to save simulation');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // Load saved simulations
  const loadSavedSimulations = () => {
    try {
      const savedSimulations = JSON.parse(localStorage.getItem('electrolab-simulations') || '[]');
      console.log('Saved simulations:', savedSimulations);
      setSaveStatus(`Found ${savedSimulations.length} saved simulations`);
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('No saved simulations found');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  return (
    <div className="export-controls">
      <h3>Export Options</h3>
      
      <div className="export-buttons">
        <button 
          onClick={downloadGraph}
          className="export-btn"
          disabled={!simulationData}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download Graph
        </button>
        
        <button 
          onClick={copyExplanation}
          className="export-btn"
          disabled={!explanationText}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copy Explanation
        </button>
        
        <button 
          onClick={saveSimulation}
          className="export-btn"
          disabled={!simulationData}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          Save Simulation
        </button>
        
        <button 
          onClick={loadSavedSimulations}
          className="export-btn secondary"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          View Saved
        </button>
      </div>
      
      {(saveStatus || copyStatus) && (
        <div className="status-message">
          {saveStatus || copyStatus}
        </div>
      )}
    </div>
  );
};

export default ExportControls;
