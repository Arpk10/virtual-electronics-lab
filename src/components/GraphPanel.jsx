import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import './GraphPanel.css';
import { 
  adaptToChartData, 
  getChartOptions 
} from '../visualization';
import ResultSummaryCards from './ResultSummaryCards.jsx';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const GraphPanel = ({ data }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  // ✅ Safe fallback data structure for null/undefined data
  const safeData = data || {
    chartType: 'voltage',
    circuitParams: {},
    labels: ['0s', '0.5s', '1s', '1.5s', '2s', '2.5s', '3s'],
    datasets: [{
      label: 'Voltage (V)',
      data: [0, 4, 6.4, 7.8, 8.6, 9.1, 9.4],
      borderColor: 'var(--color-voltage)',
      backgroundColor: 'var(--color-voltage-bg)',
      borderWidth: 2,
      tension: 0.4,
      fill: true
    }]
  };

  const getChartConfig = () => {
    try {
      // Use the new visualization layer to adapt data
      const adaptedChartData = adaptToChartData(safeData) || { labels: [], datasets: [] };
      
      // Ensure safe defaults for chart parameters
      const chartType = safeData?.chartType || 'voltage';
      const circuitParams = safeData?.circuitParams || {};
      
      let options = getChartOptions(chartType, circuitParams) || {};
    
    // Ensure base object safety before mutation
    options = options || {};
    options.plugins = options.plugins || {};
    options.plugins.legend = options.plugins.legend || {};
    options.plugins.tooltip = options.plugins.tooltip || {};
    options.plugins.title = options.plugins.title || {};
    
    // Add animation settings
    options.animation = {
      duration: 2500,
      easing: 'easeInOutQuart',
      delay: (context) => {
        let delay = 0;
        if (context.type === 'data' && context.mode === 'default') {
          delay = context.dataIndex * 15;
        }
        return delay;
      },
    };
    
    // Enhance legend styling with safe spread
    options.plugins.legend = {
      ...(options.plugins?.legend || {}),
      labels: {
        font: { size: 16, weight: '600' },
        color: '#374151',
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle',
        pointRadius: 6,
      }
    };
    
    // Add title
    options.plugins.title = {
      display: true,
      text: getChartTitle(chartType),
      font: { size: 20, weight: '700' },
      color: '#111827',
      padding: { top: 10, bottom: 20 }
    };
    
    // Enhance tooltip styling with safe spread
    options.plugins.tooltip = {
      ...(options.plugins?.tooltip || {}),
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#3b82f6',
      borderWidth: 2,
      cornerRadius: 12,
      padding: 16,
      displayColors: true,
      titleFont: { size: 14, weight: '600' },
      bodyFont: { size: 13 },
    };

    // config layer
    const config = {
      responsive: true,
      maintainAspectRatio: false,
    };

    const mergedOptions = {
      ...(options || {}),
      ...(config || {})
    };

      return {
        chartData: adaptedChartData,
        options: mergedOptions
      };
    } catch (error) {
      // Fallback configuration if visualization calls fail
      console.warn('GraphPanel: Error in getChartConfig, using fallback', error);
      return {
        chartData: { labels: [], datasets: [] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true, position: 'top' },
            tooltip: { enabled: true }
          }
        }
      };
    }
  };

  const getChartTitle = (chartType) => {
    switch (chartType) {
      case 'voltage': return 'Voltage vs Time';
      case 'current': return 'Current vs Time';
      case 'static': return 'Calculation Results';
      case 'comparison': return 'Comparison Results';
      default: return 'Simulation Results';
    }
  };

  const { chartData: configData, options } = getChartConfig();

  // Determine chart component using safeData
  const ChartComponent =
    safeData?.chartType === 'static' ||
    safeData?.chartType === 'comparison'
      ? Bar
      : Line;

  return (
    <div className={`graph-panel ${isUpdating ? 'updating' : ''}`}>
      <h2>Experiment Results</h2>

      <ResultSummaryCards
        circuitType={safeData?.circuitParams?.experimentType || safeData?.chartType || 'voltage-divider'}
        parameters={safeData?.circuitParams || {}}
      />

      <div style={{ height: '400px' }}>
        <ChartComponent data={configData} options={options} />
      </div>
    </div>
  );
};

export default GraphPanel;