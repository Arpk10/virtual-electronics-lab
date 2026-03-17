import React, { createContext, useContext, useState, useEffect } from 'react';

const AIContext = createContext();

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export const AIProvider = ({ children }) => {
  const [isAIMode, setIsAIMode] = useState(() => {
    const saved = localStorage.getItem('aiMode');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('aiMode', isAIMode);
  }, [isAIMode]);

  const toggleAIMode = () => {
    setIsAIMode(!isAIMode);
  };

  return (
    <AIContext.Provider value={{ isAIMode, toggleAIMode }}>
      {children}
    </AIContext.Provider>
  );
};
