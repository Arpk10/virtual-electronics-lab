# Virtual Electronics Lab

A clean, minimal React app for simulating RC circuit behavior using natural language input.

## Features

- **Natural Language Input**: Describe circuits in plain English (e.g., "RC circuit with R=1000 ohms, C=10uF, step input")
- **Real-time Simulation**: Generates voltage vs time curves for RC charging and discharging
- **Interactive Graphs**: Uses Chart.js for responsive, interactive plots
- **Educational Explanations**: Provides physics-based explanations of circuit behavior
- **Preloaded Examples**: Quick-start buttons for common circuit configurations

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Input Panel**: Type a circuit description in the text area
   - Format: "RC circuit with R=[value] [unit], C=[value] [unit], [charging/discharging/step]"
   - Examples are provided as quick-start buttons

2. **Run Simulation**: Click "Run Simulation" to generate the voltage curve

3. **View Results**: 
   - Graph shows voltage vs time (0 to 5τ)
   - Explanation panel provides circuit analysis

## Supported Units

- **Resistance**: Ω (ohms), kΩ (kilohms)
- **Capacitance**: F (farads), μF (microfarads), nF (nanofarads)

## Circuit Types

- **Charging**: "step input" or "charging"
- **Discharging**: "discharging"

## Technical Details

- Uses exponential RC circuit equations:
  - Charging: V(t) = V₀ × (1 - e^(-t/RC))
  - Discharging: V(t) = V₀ × e^(-t/RC)
- Time constant τ = RC
- Simulation runs for 5 time constants to reach steady state

## Built With

- React 18
- Vite
- Chart.js
- CSS Grid/Flexbox for responsive layout
