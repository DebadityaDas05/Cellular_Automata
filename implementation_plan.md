# Implementation Plan - Cellular Automata Rule Mixing & Classification Suite

This project provides a comprehensive theoretical framework and interactive exploratory suite to investigate the effect of mixing any base rule from **Wolfram's 88 fundamental Elementary Cellular Automata (ECA) equivalence rules** with any of the remaining 87 rules.

## Objectives & Research Questions

1. **Rule Mixing Dynamics**: When a base rule $R_A$ is mixed with a target rule $R_B$ (via stochastic temporal/spatial switching, probabilistic lookup blending, or bitwise crossover), how do the spatio-temporal patterns evolve?
2. **Phase Transitions & Wolfram Class Shifts**:
   - Does a periodic rule (Class II, e.g. Rule 108 or 170) retain its periodicity when mixed with a chaotic rule (Class III, e.g. Rule 30 or 90)?
   - Can mixing two Class I or Class II rules give rise to chaos (Class III) or complex localized structures (Class IV like Rule 110)?
   - At what critical mixing threshold $p_c$ does an order-to-chaos phase transition occur?
3. **Automated Quantitative Classification**:
   - Measure **Shannon Entropy** $H$, **Active Cell Density** $\rho$, **Temporal Periodicity** $\tau$, and **Hamming Perturbation Divergence** (Lyapunov sensitivity).

---

## Technical Architecture & Components

```
Cellular_Automata/
├── index.html            # Main web application UI layout
├── style.css             # Modern dark-mode styling with glassmorphism & visual polish
├── js/
│   ├── wolfram88.js      # Equivalence class generator & metadata for 88 fundamental ECA rules
│   ├── ca_engine.js      # Core ECA simulation engine (supports 5 mixing modes, canvas rendering)
│   ├── metrics.js        # Quantitative classifiers (Entropy, Density, Periodicity, Sensitivity)
│   └── app.js            # UI controller, charts, sweep generator, canvas renderers
└── README.md             # Project documentation & usage guide
```

---

## User Review Required

> [!NOTE]
> The application will include 5 distinct mathematical rule-mixing algorithms:
> 1. **Stochastic Cell-level Mixing**: At position $i, t$, apply $R_B$ with probability $p$, else $R_A$.
> 2. **Temporal Step Switching**: At time step $t$, switch entire grid between $R_A$ and $R_B$ with probability $p$.
> 3. **Spatial Partitioning**: A fixed fraction $p$ of grid cells strictly obey $R_B$, rest obey $R_A$.
> 4. **Probabilistic Lookup Blending (Fuzzy ECA)**: Blend output probabilities $P(\text{next}=1) = (1-p) R_A(n) + p R_B(n)$.
> 5. **Bitwise Truth Table Crossover**: Flip truth table bits of $R_A$ towards $R_B$ in order of Hamming distance.

---

## Proposed Changes

### [NEW] [wolfram88.js](file:///d:/Projects/Cellalar_Automata/js/wolfram88.js)
- Contains exact binary representations and reduction logic for 88 equivalence classes out of 256 ECA rules.
- Pre-classifies rules into Wolfram Classes (Class I: Homogeneous, Class II: Periodic, Class III: Chaotic, Class IV: Complex).

### [NEW] [ca_engine.js](file:///d:/Projects/Cellalar_Automata/js/ca_engine.js)
- Implements 1D grid state propagation with periodic boundary conditions.
- Implements all 5 rule mixing modes.
- Supports dual/triple parallel configuration simulation for perturbation divergence testing.

### [NEW] [metrics.js](file:///d:/Projects/Cellalar_Automata/js/metrics.js)
- **Spatial Block Entropy** (up to 4-gram words).
- **Density History & Variance**.
- **State Hash Cycle Detection** (detects exact repeat period $\tau \le 200$).
- **Hamming Sensitivity** (divergence between 1-bit perturbed initial conditions).
- **Wolfram Class Evaluator** combining entropy, periodicity, and sensitivity.

### [NEW] [app.js](file:///d:/Projects/Cellalar_Automata/js/app.js)
- Manages high-performance canvas rendering.
- Real-time side-by-side comparison (Base Rule vs Mixed Rule vs Target Rule).
- 87-Rule Batch Sweep Matrix generator (evaluates Base Rule mixed against all 87 remaining rules across a grid of mixing ratios $p \in [0, 1]$).
- Interactive Chart rendering (Entropy over time, Density over time, Sweep heatmaps).

### [NEW] [index.html](file:///d:/Projects/Cellalar_Automata/index.html) & [style.css](file:///d:/Projects/Cellalar_Automata/style.css)
- Sleek modern design featuring dark glassmorphism, responsive grid layout, custom parameter sliders, rule quick-pickers, and canvas viewports.

---

## Verification Plan

### Manual Verification
1. Open `index.html` in browser.
2. Select a base rule (e.g. Rule 30, Class III) and mix with Rule 90 or Rule 110.
3. Verify all 5 mixing modes produce correct spacetime diagrams and expected dynamics.
4. Verify 87-rule batch sweep matrix accurately categorizes resulting states and phase transitions.
5. Export spacetime diagram images and verify responsive canvas rendering.
