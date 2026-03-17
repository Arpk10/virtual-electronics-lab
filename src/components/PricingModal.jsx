import React from 'react';
import { usePricing } from '../contexts/PricingContext';
import './PricingModal.css';

const PricingModal = () => {
  const { showPricingModal, setShowPricingModal, pricingTiers, userPlan, upgradePlan } = usePricing();

  if (!showPricingModal) return null;

  const handleUpgrade = (plan) => {
    // In a real app, this would integrate with a payment processor
    if (plan === 'free') {
      setShowPricingModal(false);
      return;
    }
    
    // Simulate upgrade process
    alert(`Upgrading to ${pricingTiers[plan].name}...\n\nIn a real application, this would connect to a payment processor like Stripe.`);
    upgradePlan(plan);
  };

  return (
    <div className="pricing-modal-overlay" onClick={() => setShowPricingModal(false)}>
      <div className="pricing-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pricing-modal-header">
          <h2>Choose Your Plan</h2>
          <button 
            className="close-button"
            onClick={() => setShowPricingModal(false)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="pricing-grid">
          {Object.entries(pricingTiers).map(([key, tier]) => (
            <div 
              key={key}
              className={`pricing-card ${userPlan === key ? 'current' : ''}`}
            >
              {tier.badge && <div className="pricing-badge">{tier.badge}</div>}
              
              <div className="pricing-header">
                <h3>{tier.name}</h3>
                <div className="pricing-price">
                  <span className="price-amount">{tier.price}</span>
                  <span className="price-period">{tier.period}</span>
                </div>
              </div>

              <div className="pricing-features">
                <ul>
                  {tier.features.map((feature, index) => (
                    <li key={index}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                className={`pricing-button ${userPlan === key ? 'current' : ''}`}
                onClick={() => handleUpgrade(key)}
                disabled={userPlan === key}
              >
                {userPlan === key ? 'Current Plan' : tier.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="pricing-footer">
          <p>All plans include core simulation features. Upgrade anytime, no commitment.</p>
          <div className="pricing-guarantee">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>30-day money-back guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
