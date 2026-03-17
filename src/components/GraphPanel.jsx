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
  if (!data) {
    return (
      <div className={`graph-panel ${isUpdating ? 'updating' : ''}`}>
        <h2>Experiment Results</h2>
        {data ? (
          <div className="chart-container">
            <ChartComponent 
              data={chartData} 
              options={options} 
              updateMode="resize"
              onAnimationComplete={triggerUpdateAnimation}
            />
          </div>
        ) : (
          <div className="no-data">
            <p>Run a simulation to see the results</p>
          </div>
        )}
      </div>
    );
  }

  const getChartConfig = () => {
    const { chartType, circuitParams } = data;
    
    switch (chartType) {
      case 'voltage':
        return getVoltageChartConfig();
      case 'current':
        return getCurrentChartConfig();
      case 'static':
        return getStaticChartConfig();
      case 'comparison':
        return getComparisonChartConfig();
      default:
        return getVoltageChartConfig();
    }
  };

  const triggerUpdateAnimation = () => {
    setIsUpdating(true);
    setTimeout(() => setIsUpdating(false), 300);
  };

  const getVoltageChartConfig = () => {
    const chartData = {
      labels: data.labels,
      datasets: [
        {
          label: 'Voltage (V)',
          data: data.data,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          pointRadius: 2,
          pointHoverRadius: 6,
          tension: 0.4,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 2000,
        easing: 'easeInOutQuart',
        delay: (context) => {
          let delay = 0;
          if (context.type === 'data' && context.mode === 'default') {
            delay = context.dataIndex * 20;
          }
          return delay;
        },
      },
      plugins: {
        legend: { 
          display: true,
          position: 'top',
          labels: {
            font: { size: 14, weight: '500' },
            color: '#374151',
            padding: 20,
            usePointStyle: true,
          }
        },
        title: {
          display: true,
          text: 'Voltage vs Time',
          font: { size: 18, weight: '600' },
          color: '#111827',
          padding: { top: 10, bottom: 20 }
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#10b981',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          displayColors: false,
          callbacks: {
            title: function(context) {
              return `Time: ${context[0].label} ms`;
            },
            label: function(context) {
              return `Voltage: ${context.parsed.y.toFixed(3)} V`;
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: { display: true, text: 'Time (ms)', color: '#374151', font: { size: 14, weight: '500' } },
          grid: { 
            color: 'rgba(156, 163, 175, 0.2)',
            drawBorder: false,
            lineWidth: 1,
          },
          ticks: { 
            color: '#6b7280',
            font: { size: 12 },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 10
          },
        },
        y: {
          display: true,
          title: { display: true, text: 'Voltage (V)', color: '#374151', font: { size: 14, weight: '500' } },
          grid: { 
            color: 'rgba(156, 163, 175, 0.2)',
            drawBorder: false,
            lineWidth: 1,
          },
          ticks: { 
            color: '#6b7280',
            font: { size: 12 },
            min: 0,
            max: 6,
            padding: 8
          },
        },
      },
      interaction: { 
        mode: 'nearest', 
        axis: 'x', 
        intersect: false,
        hover: {
          mode: 'nearest',
          intersect: false,
          animationDuration: 200
        }
      },
    };

    return { chartData, options, ChartComponent: Line };
  };

  const getCurrentChartConfig = () => {
    const chartData = {
      labels: data.labels,
      datasets: [
        {
          label: 'Current (A)',
          data: data.data,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          pointRadius: 2,
          pointHoverRadius: 6,
          tension: 0.4,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 2000,
        easing: 'easeInOutQuart',
        delay: (context) => {
          let delay = 0;
          if (context.type === 'data' && context.mode === 'default') {
            delay = context.dataIndex * 20;
          }
          return delay;
        },
      },
      plugins: {
        legend: { 
          display: true,
          position: 'top',
          labels: {
            font: { size: 14, weight: '500' },
            color: '#374151',
            padding: 20,
            usePointStyle: true,
          }
        },
        title: {
          display: true,
          text: 'Current vs Time',
          font: { size: 18, weight: '600' },
          color: '#111827',
          padding: { top: 10, bottom: 20 }
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#3b82f6',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          displayColors: false,
          callbacks: {
            title: function(context) {
              return `Time: ${context[0].label} ms`;
            },
            label: function(context) {
              return `Current: ${context.parsed.y.toFixed(6)} A`;
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: { display: true, text: 'Time (ms)', color: '#374151', font: { size: 14, weight: '500' } },
          grid: { 
            color: 'rgba(156, 163, 175, 0.2)',
            drawBorder: false,
            lineWidth: 1,
          },
          ticks: { 
            color: '#6b7280',
            font: { size: 12 },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 10
          },
        },
        y: {
          display: true,
          title: { display: true, text: 'Current (A)', color: '#374151', font: { size: 14, weight: '500' } },
          grid: { 
            color: 'rgba(156, 163, 175, 0.2)',
            drawBorder: false,
            lineWidth: 1,
          },
          ticks: { 
            color: '#6b7280',
            font: { size: 12 },
            padding: 8
          },
        },
      },
      interaction: { 
        mode: 'nearest', 
        axis: 'x', 
        intersect: false,
        hover: {
          mode: 'nearest',
          intersect: false,
          animationDuration: 200
        }
      },
    };

    return { chartData, options, ChartComponent: Line };
  };

  const getStaticChartConfig = () => {
    const { current } = data.circuitParams;
    const chartData = {
      labels: ['Current'],
      datasets: [
        {
          label: 'Current (A)',
          data: [current],
          backgroundColor: '#10b981',
          borderColor: '#059669',
          borderWidth: 2,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1500,
        easing: 'easeInOutQuart',
      },
      plugins: {
        legend: { 
          display: true,
          position: 'top',
          labels: {
            font: { size: 14, weight: '500' },
            color: '#374151',
            padding: 20,
          }
        },
        title: {
          display: true,
          text: 'Ohm\'s Law Result',
          font: { size: 18, weight: '600' },
          color: '#111827',
          padding: { top: 10, bottom: 20 }
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#10b981',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return `Current: ${(context.parsed.y * 1000).toFixed(3)} mA`;
            },
          },
        },
      },
      scales: {
        y: {
          display: true,
          title: { display: true, text: 'Current (A)', color: '#374151', font: { size: 14, weight: '500' } },
          grid: { 
            color: 'rgba(156, 163, 175, 0.2)',
            drawBorder: false,
            lineWidth: 1,
          },
          ticks: { 
            color: '#6b7280',
            font: { size: 12 },
            callback: function(value) {
              return (value * 1000).toFixed(0) + ' mA';
            }
          },
          min: 0,
        },
      },
    };

    return { chartData, options, ChartComponent: Bar };
  };

  const getComparisonChartConfig = () => {
    const chartData = {
      labels: data.labels,
      datasets: data.datasets.map((dataset, index) => ({
        ...dataset,
        borderColor: dataset.borderColor,
        backgroundColor: dataset.backgroundColor,
        borderWidth: 3,
        pointRadius: 2,
        pointHoverRadius: 6,
        tension: 0.4,
        pointBackgroundColor: dataset.borderColor,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      })),
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1500,
        easing: 'easeInOutQuart',
      },
      plugins: {
        legend: { 
          display: true,
          position: 'top',
          labels: {
            font: { size: 14, weight: '500' },
            color: '#374151',
            padding: 20,
          }
        },
        title: {
          display: true,
          text: 'Voltage Divider Results',
          font: { size: 18, weight: '600' },
          color: '#111827',
          padding: { top: 10, bottom: 20 }
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#10b981',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return `Voltage: ${context.parsed.y.toFixed(3)} V`;
            },
          },
        },
      },
      scales: {
        y: {
          display: true,
          title: { display: true, text: 'Voltage (V)', color: '#374151', font: { size: 14, weight: '500' } },
          grid: { 
            color: 'rgba(156, 163, 175, 0.2)',
            drawBorder: false,
            lineWidth: 1,
          },
          ticks: { 
            color: '#6b7280',
            font: { size: 12 },
            min: 0,
            max: Math.max(...data.data) * 1.2,
            padding: 8
          },
        },
      },
    };

    return { chartData, options, ChartComponent: Bar };
  };

  const { chartData, options, ChartComponent } = getChartConfig();

  return (
    <div className="graph-panel">
      <div className="chart-container">
        <ChartComponent data={chartData} options={options} />
      </div>
    </div>
  );
};

export default GraphPanel;
