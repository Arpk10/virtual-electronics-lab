/**
 * Chart Data Adapter
 * Converts simulation engine output to chart-compatible format
 * Separates visualization logic from simulation logic
 */

/**
 * Converts simulation result to Chart.js data format
 * @param {Object} simulationResult - Result from simulation engine
 * @param {Object} options - Chart formatting options
 * @returns {Object} Chart.js compatible data object
 */
export const adaptToChartData = (simulationResult, options = {}) => {
  if (!simulationResult) {
    return null;
  }

  const { labels, data, chartType, circuitParams } = simulationResult;
  
  // Base dataset configuration
  const baseDataset = {
    label: getDatasetLabel(chartType, circuitParams),
    data: data,
    borderColor: options.color || '#3b82f6',
    backgroundColor: options.backgroundColor || 'rgba(59, 130, 246, 0.2)',
    borderWidth: options.borderWidth || 4,
    pointRadius: options.pointRadius || 3,
    pointHoverRadius: options.pointHoverRadius || 8,
    tension: options.tension || 0.4,
    pointBackgroundColor: options.pointBackgroundColor || '#3b82f6',
    pointBorderColor: options.pointBorderColor || '#ffffff',
    pointBorderWidth: options.pointBorderWidth || 3,
    fill: options.fill !== undefined ? options.fill : true,
  };

  // Special handling for different chart types
  switch (chartType) {
    case 'current':
      return {
        labels,
        datasets: [{
          ...baseDataset,
          label: 'Current (A)',
          borderColor: options.color || '#10b981',
          backgroundColor: options.backgroundColor || 'rgba(16, 185, 129, 0.2)',
        }]
      };
      
    case 'static':
      return {
        labels,
        datasets: [{
          ...baseDataset,
          type: 'bar',
          label: 'Calculated Value',
          backgroundColor: options.color || '#8b5cf6',
          borderColor: options.borderColor || '#8b5cf6',
        }]
      };
      
    case 'comparison':
      return {
        labels,
        datasets: [
          {
            ...baseDataset,
            label: 'Input Voltage (V)',
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
          },
          {
            ...baseDataset,
            label: 'Output Voltage (V)',
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            data: data.length > 1 ? [data[1]] : data
          }
        ]
      };
      
    case 'voltage':
    default:
      return {
        labels,
        datasets: [{
          ...baseDataset,
          label: 'Voltage (V)',
        }]
      };
  }
};

/**
 * Combines multiple simulation results for comparison
 * @param {Array} simulations - Array of simulation results
 * @param {Object} options - Comparison options
 * @returns {Object} Combined chart data
 */
export const combineSimulations = (simulations, options = {}) => {
  if (!simulations || simulations.length === 0) {
    return null;
  }

  // Use the first simulation's labels as base
  const baseLabels = simulations[0].labels;
  const colors = options.colors || ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];
  
  const datasets = simulations.map((sim, index) => {
    const color = colors[index % colors.length];
    return {
      label: getSimulationLabel(sim, index),
      data: sim.data,
      borderColor: color,
      backgroundColor: `${color}20`,
      borderWidth: 3,
      pointRadius: 2,
      pointHoverRadius: 6,
      tension: 0.4,
      pointBackgroundColor: color,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    };
  });

  return {
    labels: baseLabels,
    datasets,
    chartType: 'comparison',
    circuitParams: {
      experimentType: 'comparison',
      simulations: simulations.map(s => s.circuitParams)
    }
  };
};

/**
 * Gets dataset label based on chart type and circuit parameters
 */
const getDatasetLabel = (chartType, circuitParams) => {
  switch (chartType) {
    case 'current':
      return 'Current (A)';
    case 'voltage':
      return 'Voltage (V)';
    case 'static':
      return 'Calculated Value';
    case 'comparison':
      return 'Comparison';
    default:
      return 'Signal';
  }
};

/**
 * Gets a descriptive label for a simulation
 */
const getSimulationLabel = (simulation, index) => {
  const { circuitParams } = simulation;
  if (!circuitParams) {
    return `Simulation ${index + 1}`;
  }

  // Try to create a descriptive label based on circuit parameters
  if (circuitParams.resistance && circuitParams.capacitance) {
    return `R=${formatValue(circuitParams.resistance, 'Ω')}, C=${formatValue(circuitParams.capacitance, 'F')}`;
  }
  
  if (circuitParams.resistance && circuitParams.inductance) {
    return `R=${formatValue(circuitParams.resistance, 'Ω')}, L=${formatValue(circuitParams.inductance, 'H')}`;
  }
  
  if (circuitParams.voltage && circuitParams.resistance) {
    return `V=${circuitParams.voltage}V, R=${formatValue(circuitParams.resistance, 'Ω')}`;
  }
  
  return `Simulation ${index + 1}`;
};

/**
 * Formats values with appropriate units
 */
const formatValue = (value, unit) => {
  if (unit === 'Ω' && value >= 1000) {
    return `${(value / 1000).toFixed(1)}kΩ`;
  }
  if (unit === 'F' && value < 1e-6) {
    return `${(value * 1e9).toFixed(1)}nF`;
  }
  if (unit === 'F' && value < 1e-3) {
    return `${(value * 1e6).toFixed(1)}μF`;
  }
  if (unit === 'H' && value < 1) {
    return `${(value * 1000).toFixed(1)}mH`;
  }
  return `${value.toFixed(3)}${unit}`;
};

/**
 * Gets chart options based on data type
 */
export const getChartOptions = (chartType, circuitParams = {}) => {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: function(context) {
            return `Time: ${context[0].label}ms`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time (ms)'
        }
      }
    }
  };

  // Customize based on chart type
  switch (chartType) {
    case 'current':
      return {
        ...baseOptions,
        scales: {
          ...baseOptions.scales,
          y: {
            display: true,
            title: {
              display: true,
              text: 'Current (A)'
            }
          }
        }
      };
      
    case 'voltage':
      return {
        ...baseOptions,
        scales: {
          ...baseOptions.scales,
          y: {
            display: true,
            title: {
              display: true,
              text: 'Voltage (V)'
            }
          }
        }
      };
      
    case 'static':
      return {
        ...baseOptions,
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Measurement'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Value'
            }
          }
        }
      };
      
    case 'comparison':
      return {
        ...baseOptions,
        scales: {
          ...baseOptions.scales,
          y: {
            display: true,
            title: {
              display: true,
              text: 'Voltage (V)'
            }
          }
        }
      };
      
    default:
      return baseOptions;
  }
};
