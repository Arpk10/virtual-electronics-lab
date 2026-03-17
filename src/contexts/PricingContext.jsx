import React, { createContext, useContext, useState, useEffect } from 'react';

const PricingContext = createContext();

export const usePricing = () => {
  const context = useContext(PricingContext);
  if (!context) {
    throw new Error('usePricing must be used within a PricingProvider');
  }
  return context;
};

export const PricingProvider = ({ children }) => {
  const [userPlan, setUserPlan] = useState(() => {
    const saved = localStorage.getItem('userPlan');
    return saved || 'free';
  });

  const [simulationCount, setSimulationCount] = useState(() => {
    const saved = localStorage.getItem('simulationCount');
    const count = parseInt(saved || '0');
    const lastReset = localStorage.getItem('lastSimulationReset');
    const today = new Date().toDateString();
    
    // Reset counter if it's a new day
    if (lastReset !== today) {
      localStorage.setItem('lastSimulationReset', today);
      localStorage.setItem('simulationCount', '0');
      return 0;
    }
    
    return count;
  });

  const [showPricingModal, setShowPricingModal] = useState(false);

  const pricingTiers = {
    free: {
      name: 'Free',
      price: '$0',
      period: 'forever',
      simulationsPerDay: 5,
      features: [
        '5 simulations per day',
        'Basic circuit analysis',
        'RC, RL, Ohm\'s Law, Voltage Divider',
        'Export graphs as PNG',
        'Copy explanations',
        'Dark mode support'
      ],
      cta: 'Current Plan',
      color: '#6b7280'
    },
    pro: {
      name: 'Pro',
      price: '$9',
      period: '/month',
      simulationsPerDay: Infinity,
      features: [
        'Unlimited simulations',
        'Everything in Free',
        'AI Mode with enhanced explanations',
        'Advanced circuit insights',
        'Real-world applications',
        'Common mistakes guidance',
        'Priority support',
        'Export all formats'
      ],
      cta: 'Upgrade to Pro',
      color: '#3b82f6'
    },
    student: {
      name: 'Student Pro',
      price: '$4',
      period: '/month',
      simulationsPerDay: Infinity,
      features: [
        'Unlimited simulations',
        'Everything in Free',
        'AI Mode with enhanced explanations',
        'Student-focused examples',
        'Academic applications',
        'Learning resources',
        'Email support',
        'Educational discounts'
      ],
      cta: 'Upgrade to Student',
      color: '#10b981',
      badge: 'Requires verification'
    }
  };

  useEffect(() => {
    localStorage.setItem('userPlan', userPlan);
  }, [userPlan]);

  useEffect(() => {
    localStorage.setItem('simulationCount', simulationCount.toString());
  }, [simulationCount]);

  const canRunSimulation = () => {
    const tier = pricingTiers[userPlan];
    return simulationCount < tier.simulationsPerDay;
  };

  const incrementSimulationCount = () => {
    if (canRunSimulation()) {
      setSimulationCount(prev => prev + 1);
      return true;
    }
    return false;
  };

  const upgradePlan = (plan) => {
    setUserPlan(plan);
    setShowPricingModal(false);
  };

  const getRemainingSimulations = () => {
    const tier = pricingTiers[userPlan];
    if (tier.simulationsPerDay === Infinity) return 'Unlimited';
    return Math.max(0, tier.simulationsPerDay - simulationCount);
  };

  return (
    <PricingContext.Provider value={{
      userPlan,
      simulationCount,
      showPricingModal,
      setShowPricingModal,
      pricingTiers,
      canRunSimulation,
      incrementSimulationCount,
      upgradePlan,
      getRemainingSimulations
    }}>
      {children}
    </PricingContext.Provider>
  );
};
