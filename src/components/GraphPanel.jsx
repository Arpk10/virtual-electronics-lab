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
  
  // Always show content, use default data if none provided
  const chartData = data || {
    labels: ['0s', '0.5s', '1s', '1.5s', '2s', '2.5s', '3s'],
    datasets: [{
      label: 'Voltage (V)',
      data: [0, 4, 6.4, 7.8, 8.6, 9.1, 9.4],
      borderColor: 'var(--color-voltage)',
      backgroundColor: 'var(--color-voltage-bg)',
      pointBackgroundColor: 'var(--color-voltage)',
      pointBorderColor: 'var(--color-voltage-dark)',
      pointHoverBackgroundColor: 'var(--color-voltage-dark)',
      pointHoverBorderColor: 'var(--color-voltage)',
      borderWidth: 2,
      tension: 0.4,
      fill: true
    }]
  };

  const getChartConfig = () => {
    // Use the new visualization layer to adapt data
    const adaptedChartData = adaptToChartData(chartData);
    const options = getChartOptions(chartData.chartType, chartData.circuitParams);
    
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
    
    // Enhance legend styling
    options.plugins.legend = {
      ...options.plugins.legend,
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
      text: getChartTitle(data.chartType),
      font: { size: 20, weight: '700' },
      color: '#111827',
      padding: { top: 10, bottom: 20 }
    };
    
    // Enhance tooltip styling
    options.plugins.tooltip = {
      ...options.plugins.tooltip,
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
    
    // Apply semantic voltage colors
    const config = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#374151',
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#3b82f6',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          title: {
            display: true,
            text: 'Time (s)',
            color: '#374151'
          },
          grid: {
            color: '#e5e7eb'
          },
          ticks: {
            color: '#6b7280'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Voltage (V)',
            color: '#374151'
          },
          grid: {
            color: '#e5e7eb'
          },
          ticks: {
            color: '#6b7280'
          }
        }
      }
    };
    
    options = { ...options, ...config };
    
    return { chartData: adaptedChartData, options };
  };
  
  const getChartTitle = (chartType) => {
    switch (chartType) {
      case 'voltage':
        return 'Voltage vs Time';
      case 'current':
        return 'Current vs Time';
      case 'static':
        return 'Calculation Results';
      case 'comparison':
        return 'Comparison Results';
      default:
        return 'Simulation Results';
    }
  };

  const triggerUpdateAnimation = () => {
    setIsUpdating(true);
    setTimeout(() => setIsUpdating(false), 300);
  };

  const { chartData: configData, options } = getChartConfig();
  
  // Determine which chart component to use based on chart type
  const ChartComponent = (data?.chartType === 'static' || data?.chartType === 'comparison') ? Bar : Line;

  return (
    <div className={`graph-panel fade-in premium-spacing ${isUpdating ? 'updating' : ''}`}>
      <div className="spacing-md-bottom">
        <h2 className="text-h2">Experiment Results</h2>
        
        {/* Professional Signals */}
        <div className="professional-signals">
          <div className="signal-badge signal-realtime">
            <div className="signal-indicator"></div>
            Real-time simulation
          </div>
          <div className="signal-badge signal-precision">
            <div className="signal-indicator"></div>
            Engineering precision
          </div>
        </div>
      </div>
      
      <div className="divider"></div>
      
      {/* Result Summary Cards */}
      <div className="spacing-md-bottom">
        <ResultSummaryCards 
          circuitType={chartData?.circuitParams?.experimentType || 'voltage-divider'}
          parameters={chartData?.circuitParams || {}}
        />
      </div>
      
      <div className="divider-thick"></div>
      
      <div className="chart-container fade-in">
        <ChartComponent data={configData} options={options} />
      </div>
    </div>
  );
};

export default GraphPanel;
