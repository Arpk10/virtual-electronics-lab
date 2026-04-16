/**
 * AI-Powered Explanation Service
 * Provides multi-level circuit explanations using OpenAI API
 */

class AIExplanationService {
  constructor() {
    this.apiKey = null;
    this.baseURL = 'https://api.openai.com/v1/chat/completions';
    this.cache = new Map();
    this.isConfigured = false;
  }

  /**
   * Configure the AI service with API key
   */
  configure(apiKey) {
    this.apiKey = apiKey;
    this.isConfigured = !!apiKey;
  }

  /**
   * Generate explanation for circuit behavior at specified level
   */
  async generateExplanation(circuitType, simulationResults, level = 'beginner') {
    if (!this.isConfigured) {
      return this.getFallbackExplanation(circuitType, simulationResults, level);
    }

    const cacheKey = `${circuitType}-${level}-${JSON.stringify(simulationResults)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const explanation = await this.callOpenAI(circuitType, simulationResults, level);
      this.cache.set(cacheKey, explanation);
      return explanation;
    } catch (error) {
      console.error('AI Explanation Error:', error);
      return this.getFallbackExplanation(circuitType, simulationResults, level);
    }
  }

  /**
   * Call OpenAI API for explanation generation
   */
  async callOpenAI(circuitType, simulationResults, level) {
    const prompt = this.buildPrompt(circuitType, simulationResults, level);
    
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(level)
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Build prompt for OpenAI based on circuit type and level
   */
  buildPrompt(circuitType, simulationResults, level) {
    const circuitInfo = this.getCircuitInfo(circuitType, simulationResults);
    
    return `
Circuit Type: ${circuitType}
Circuit Parameters: ${JSON.stringify(circuitInfo.parameters, null, 2)}
Simulation Results: ${JSON.stringify(circuitInfo.results, null, 2)}
Graph Data: ${circuitInfo.graphDescription}

Please explain this circuit behavior at the ${level} level. Include:
1. Physical intuition - what's actually happening
2. Key equations and their meaning
3. What the graph means and how to interpret it
4. Practical insights and real-world applications

Format the explanation with clear headings and be concise but comprehensive.
    `;
  }

  /**
   * Get system prompt based on explanation level
   */
  getSystemPrompt(level) {
    const prompts = {
      beginner: `
You are an expert electronics educator explaining circuits to beginners. 
Use simple analogies, avoid complex mathematics, and focus on intuitive understanding.
Explain concepts like you're teaching a high school student who is curious about electronics.
Keep explanations under 300 words and use everyday examples.
      `,
      jee: `
You are an expert electronics educator preparing students for JEE (Joint Entrance Examination).
Focus on exam-relevant concepts, key formulas, and problem-solving approaches.
Include mathematical derivations where appropriate and emphasize concepts that frequently appear in JEE.
Keep explanations under 400 words and maintain academic rigor.
      `,
      engineering: `
You are an expert electronics engineer explaining circuits to engineering students.
Include technical details, practical considerations, and real-world applications.
Discuss limitations, approximations, and advanced concepts where relevant.
Use proper engineering terminology and include design insights.
Keep explanations under 500 words and maintain technical accuracy.
      `
    };
    
    return prompts[level] || prompts.beginner;
  }

  /**
   * Extract circuit information for AI prompt
   */
  getCircuitInfo(circuitType, simulationResults) {
    const params = simulationResults?.circuitParams || {};
    const data = simulationResults?.data || [];
    
    return {
      parameters: {
        type: circuitType,
        resistance: params.resistance,
        capacitance: params.capacitance,
        inductance: params.inductance,
        voltage: params.V0 || params.Vin,
        frequency: params.frequency,
        gain: params.gain,
        beta: params.beta,
        logicType: params.logicType,
        configuration: params.configuration,
        equation: params.equation
      },
      results: {
        timeConstant: params.timeConstant,
        dampingRatio: params.dampingRatio,
        naturalFrequency: params.naturalFrequency,
        currentOutput: params.currentOutput,
        operatingRegion: params.operatingRegion
      },
      graphDescription: this.describeGraph(data, circuitType)
    };
  }

  /**
   * Describe graph data for AI context
   */
  describeGraph(data, circuitType) {
    if (!data || data.length === 0) return 'No graph data available';
    
    const firstPoint = data[0];
    const lastPoint = data[data.length - 1];
    const trend = lastPoint > firstPoint ? 'increasing' : lastPoint < firstPoint ? 'decreasing' : 'stable';
    
    return `Graph shows ${trend} behavior over time with ${data.length} data points. 
    Initial value: ${firstPoint?.toFixed(2)}, Final value: ${lastPoint?.toFixed(2)}`;
  }

  /**
   * Fallback explanation when AI service is unavailable
   */
  getFallbackExplanation(circuitType, simulationResults, level) {
    const explanations = {
      beginner: {
        rc: "This RC circuit is like a small water tank filling up. The resistor controls how fast the capacitor charges, just like a narrow pipe controls water flow. The graph shows the capacitor gradually filling up to the input voltage level.",
        rl: "This RL circuit is like a heavy flywheel that takes time to spin up. The inductor resists changes in current, just like a heavy object resists changes in motion. The graph shows the current gradually building up to its maximum value.",
        rlc: "This RLC circuit is like a spring-mass-damper system. Energy oscillates between the inductor (like kinetic energy) and capacitor (like potential energy), while the resistor dissipates energy like friction. The graph shows these oscillations dying down over time.",
        opamp: "This operational amplifier is like a super-strong helper that can amplify tiny signals. It takes a small input voltage and makes it much larger, following precise mathematical rules. The graph shows how the output voltage relates to the input.",
        bjt: "This transistor is like a smart valve that controls a large current with a small one. A tiny base current can control a much larger collector current, making it useful for amplification and switching. The graph shows this current amplification effect.",
        digital: "This digital logic gate is like a smart switch that follows strict rules. It takes binary inputs (0 or 1) and produces a binary output based on logical operations. The graph shows the gate instantly responding to input changes."
      },
      jee: {
        rc: "RC circuit exhibits exponential charging: V(t) = V0(1 - e^(-t/RC)). Time constant RC determines charging rate. The graph shows voltage across capacitor approaching steady-state value asymptotically. Key for JEE: 63.2% charge in one time constant.",
        rl: "RL circuit follows I(t) = (V/R)(1 - e^(-Rt/L)). Time constant L/R affects current buildup. Inductor opposes current change per Faraday's law. Graph shows exponential current rise to V/R steady state.",
        rlc: "RLC circuit governed by d²q/dt² + (R/L)dq/dt + (1/LC)q = V/L. Damping ratio determines response type. Graph shows oscillatory behavior with exponential decay envelope. Critical for understanding resonance and filters.",
        opamp: "Op-amp with negative feedback: Vout = -Rf/Rin × Vin (inverting) or Vout = (1 + Rf/Rin) × Vin (non-inverting). Virtual short concept crucial. Graph shows linear amplification region and saturation limits.",
        bjt: "BJT operation: Ic = × Ib, Ie = (× + 1)Ib. Operating regions: cutoff, active, saturation. Graph shows current amplification and switching characteristics. Essential for understanding transistor circuits.",
        digital: "Logic gates implement Boolean algebra. Truth tables define input-output relationships. Propagation delay affects timing. Graph shows instantaneous switching with real-world delay considerations."
      },
      engineering: {
        rc: "RC circuit with time constant RC. Transfer function H(s) = 1/(1 + sRC). Applications: filters, timing circuits, coupling. Graph shows frequency-dependent behavior and transient response. Design considerations: tolerance, temperature effects.",
        rl: "RL circuit with time constant L/R. Transfer function H(s) = R/(R + sL). Used in switching regulators, filters. Graph shows inductive kickback and current continuity. Design considerations: core saturation, copper losses.",
        rlc: "RLC circuit with Q-factor and bandwidth. Resonance at f0 = 1/(2). Applications: oscillators, filters, impedance matching. Graph shows frequency response and transient analysis. Design considerations: component tolerances, stability.",
        opamp: "Op-amp with open-loop gain Aol, bandwidth GBW. Feedback network determines closed-loop response. Slew rate and offset voltage critical. Graph shows frequency response and transient behavior. Design considerations: stability, noise, power supply rejection.",
        bjt: "BJT with hybrid-pi model. Small-signal parameters: gm, r, Cox. Early effect and temperature dependence. Graph shows large and small-signal characteristics. Design considerations: biasing, thermal stability, high-frequency effects.",
        digital: "Logic gates with propagation delay, fanout, noise margin. CMOS implementation with P/N transistors. Power dissipation P = CV²f. Graph shows switching characteristics and timing diagrams. Design considerations: static vs dynamic power, signal integrity."
      }
    };

    return explanations[level]?.[circuitType] || explanations.beginner[circuitType] || "Circuit behavior explanation not available.";
  }

  /**
   * Clear the explanation cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Check if AI service is configured
   */
  isAIConfigured() {
    return this.isConfigured;
  }
}

// Create singleton instance
const aiExplanationService = new AIExplanationService();

export default aiExplanationService;
