import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activeExperiment, onExperimentChange }) => {
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

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Experiments</h2>
      </div>
      
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
          <p className="version">v1.0.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
