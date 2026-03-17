import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAI } from '../contexts/AIContext';
import { usePricing } from '../contexts/PricingContext';
import './Navbar.css';

const Navbar = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { isAIMode, toggleAIMode } = useAI();
  const { userPlan, getRemainingSimulations, setShowPricingModal } = usePricing();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 2L2 9V16C2 22.627 7.373 28 14 28H18C24.627 28 30 22.627 30 16V9L16 2Z" 
                  fill="currentColor" className="logo-icon"/>
            <path d="M10 12L14 16L22 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="brand-text">ElectroLab AI</span>
        </div>
      </div>
      
      <div className="navbar-actions">
        <div className="simulation-counter">
          <span className="counter-label">Simulations:</span>
          <span className="counter-value">{getRemainingSimulations()}</span>
        </div>
        
        {userPlan === 'free' && (
          <button 
            onClick={() => setShowPricingModal(true)}
            className="upgrade-button"
          >
            Upgrade
          </button>
        )}
        
        <button 
          onClick={toggleAIMode}
          className={`ai-mode-toggle ${isAIMode ? 'active' : ''}`}
          aria-label="Toggle AI mode"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            <path fill="white" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
          </svg>
          <span>AI Mode</span>
        </button>
        
        <button 
          onClick={toggleDarkMode}
          className="dark-mode-toggle"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
