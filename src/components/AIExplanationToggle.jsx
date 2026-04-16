import React, { useState } from 'react';
import aiExplanationService from '../services/AIExplanationService.js';
import './AIExplanationToggle.css';

const AIExplanationToggle = ({ 
  circuitType, 
  simulationResults, 
  onExplanationGenerated 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('beginner');
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  const levels = [
    { value: 'beginner', label: 'Beginner', description: 'Simple, intuitive explanations' },
    { value: 'jee', label: 'JEE Level', description: 'Exam-focused, formula-based' },
    { value: 'engineering', label: 'Engineering', description: 'Technical, detailed analysis' }
  ];

  // Check if AI is configured on mount
  React.useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      aiExplanationService.configure(savedApiKey);
      setIsConfigured(true);
      setApiKey(savedApiKey);
    }
  }, []);

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      aiExplanationService.configure(apiKey.trim());
      localStorage.setItem('openai_api_key', apiKey.trim());
      setIsConfigured(true);
      setShowApiKeyInput(false);
    }
  };

  const generateExplanation = async () => {
    if (!isConfigured) {
      setShowApiKeyInput(true);
      return;
    }

    setIsLoading(true);
    try {
      const result = await aiExplanationService.generateExplanation(
        circuitType, 
        simulationResults, 
        selectedLevel
      );
      setExplanation(result);
      setIsExpanded(true);
      onExplanationGenerated?.(result, selectedLevel);
    } catch (error) {
      console.error('Failed to generate explanation:', error);
      setExplanation('Failed to generate explanation. Please check your API key and try again.');
      setIsExpanded(true);
    } finally {
      setIsLoading(false);
    }
  };

  const removeApiKey = () => {
    localStorage.removeItem('openai_api_key');
    aiExplanationService.configure(null);
    setIsConfigured(false);
    setApiKey('');
    setExplanation('');
    setIsExpanded(false);
  };

  return (
    <div className="ai-explanation-toggle">
      <div className="ai-toggle-header">
        <div className="ai-toggle-info">
          <h4>AI-Powered Explanation</h4>
          <p>Get intelligent explanations for circuit behavior</p>
        </div>
        <div className="ai-toggle-controls">
          <select 
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="level-selector"
            disabled={isLoading}
          >
            {levels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
          <button 
            onClick={generateExplanation}
            disabled={isLoading}
            className="explain-btn"
          >
            {isLoading ? 'Generating...' : 'Explain This Behavior'}
          </button>
        </div>
      </div>

      {showApiKeyInput && (
        <div className="api-key-input">
          <h5>Configure OpenAI API Key</h5>
          <p>Enter your OpenAI API key to enable AI explanations:</p>
          <div className="api-key-form">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="api-key-field"
            />
            <div className="api-key-actions">
              <button onClick={handleApiKeySubmit} className="save-key-btn">
                Save Key
              </button>
              <button onClick={() => setShowApiKeyInput(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
          <p className="api-key-note">
            Your API key is stored locally and never sent to our servers.
            Get your key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI</a>
          </p>
        </div>
      )}

      {isConfigured && !showApiKeyInput && (
        <div className="ai-status">
          <span className="status-indicator configured">AI Enabled</span>
          <button onClick={removeApiKey} className="remove-key-btn" title="Remove API key">
            Remove Key
          </button>
        </div>
      )}

      {isExpanded && explanation && (
        <div className="ai-explanation-content">
          <div className="explanation-header">
            <h5>{levels.find(l => l.value === selectedLevel)?.label} Level Explanation</h5>
            <button 
              onClick={() => setIsExpanded(false)}
              className="collapse-btn"
            >
              ×
            </button>
          </div>
          <div className="explanation-text">
            {explanation.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          <div className="explanation-footer">
            <small className="ai-disclaimer">
              Generated by AI. Verify important concepts with reliable sources.
            </small>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIExplanationToggle;
