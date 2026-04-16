import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ activeExperiment, onExperimentChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const experiments = [
    {
      id: 'rc',
      name: 'RC Circuit',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="2" rx="1"/>
          <line x1="7" y1="13" x2="7" y2="17"/>
          <line x1="17" y1="13" x2="17" y2="17"/>
          <path d="M7 17h10"/>
        </svg>
      ),
      description: 'Resistor-Capacitor circuits'
    },
    {
      id: 'rl',
      name: 'RL Circuit',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="2" rx="1"/>
          <path d="M7 13v4c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-4"/>
        </svg>
      ),
      description: 'Resistor-Inductor circuits'
    },
    {
      id: 'rlc',
      name: 'RLC Circuit',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="2" rx="1"/>
          <path d="M7 13v4c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-4"/>
          <circle cx="12" cy="17" r="2"/>
        </svg>
      ),
      description: 'Resistor-Inductor-Capacitor circuits'
    },
    {
      id: 'opamp',
      name: 'Op-Amp',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 12h10m-2 2v2h2v-2h10m2 2v2h-2v2h10m2 2v2h-2v2h10m2 2v2h-2v2h10m2 2v2"/>
          <circle cx="12" cy="12" r="1" fill="currentColor"/>
        </svg>
      ),
      description: 'Operational Amplifier circuits'
    },
    {
      id: 'bjt',
      name: 'BJT',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="8" fill="none"/>
          <line x1="8" y1="8" x2="16" y2="16" stroke="currentColor"/>
          <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor"/>
          <path d="M8 16h8v-8h8v8" fill="currentColor"/>
        </svg>
      ),
      description: 'BJT Transistor circuits'
    },
    {
      id: 'ohms',
      name: "Ohm's Law",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9"/>
          <path d="M9 12h6"/>
          <path d="M12 9v6"/>
        </svg>
      ),
      description: 'Voltage-Current-Resistance'
    },
    {
      id: 'voltage-divider',
      name: 'Voltage Divider',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="8" width="6" height="2" rx="1"/>
          <rect x="15" y="8" width="6" height="2" rx="1"/>
          <line x1="9" y1="9" x2="15" y2="9"/>
          <line x1="12" y1="9" x2="12" y2="15"/>
        </svg>
      ),
      description: 'Voltage division circuits'
    }
  ];

  const activeExperimentData = experiments.find(exp => exp.id === activeExperiment);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Circuit Types</h2>
      </div>
      
      {/* Dropdown selector for mobile/small screens */}
      <div className="sidebar-dropdown">
        <button 
          className="dropdown-toggle"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="dropdown-selected">
            {activeExperimentData && (
              <>
                <div className="dropdown-icon">{activeExperimentData.icon}</div>
                <div className="dropdown-text">
                  <div className="dropdown-name">{activeExperimentData.name}</div>
                  <div className="dropdown-description">{activeExperimentData.description}</div>
                </div>
              </>
            )}
          </div>
          <svg className="dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </button>
        
        {isDropdownOpen && (
          <div className="dropdown-menu">
            {experiments.map((experiment) => (
              <button
                key={experiment.id}
                onClick={() => {
                  onExperimentChange(experiment.id);
                  setIsDropdownOpen(false);
                }}
                className={`dropdown-item ${activeExperiment === experiment.id ? 'active' : ''}`}
              >
                <div className="dropdown-item-icon">{experiment.icon}</div>
                <div className="dropdown-item-content">
                  <div className="dropdown-item-name">{experiment.name}</div>
                  <div className="dropdown-item-description">{experiment.description}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Traditional sidebar for larger screens */}
      <nav className="sidebar-nav">
        {experiments.map((experiment) => (
          <button
            key={experiment.id}
            onClick={() => onExperimentChange(experiment.id)}
            className={`sidebar-item ${activeExperiment === experiment.id ? 'active' : ''}`}
          >
            <div className="sidebar-item-icon">
              {experiment.icon}
            </div>
            <div className="sidebar-item-content">
              <div className="sidebar-item-name">{experiment.name}</div>
              <div className="sidebar-item-description">{experiment.description}</div>
            </div>
          </button>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <div className="sidebar-info">
          <p>Professional Electronics Simulation</p>
          <p className="version">v2.0.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
