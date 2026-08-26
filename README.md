# Cellular Automata Column-Wise Rule Mixing & Spacetime Pattern Explorer (v1.1.4)

This repository provides a mathematical framework, Python toolkit, and an interactive **WebGL2 Discrete GPU-Accelerated Web Application** for studying the effects of **column-wise rule mixing** among **Wolfram's 88 Fundamental Elementary Cellular Automata (ECA)** rules up to thermodynamic limits ($10,000 \times 10,000$).

---

## 🌟 Key Features

### 1. Direct Focus on Wolfram's 88 Fundamental Rules
- Operates directly on the canonical 88 equivalence class representatives (`0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 18, 19, 22, 23, 24, 25, 26, 27, 28, 29, 30, 32, 33, 34, 35, 36, 37, 38, 40, 41, 42, 43, 44, 45, 46, 50, 51, 54, 56, 57, 58, 60, 62, 72, 73, 74, 76, 77, 78, 90, 94, 104, 105, 106, 108, 110, 122, 126, 128, 130, 132, 134, 136, 138, 140, 142, 146, 150, 152, 154, 156, 160, 162, 164, 168, 170, 172, 178, 184, 200, 204, 232`).

### 2. Flexible Column-Wise Rule Mixing
- In the spacetime matrix ($t \times x$), each row represents a new generation ($t=0, 1, 2, \dots$).
- Spatial columns $x$ follow a spatial column mask $M_c[x]$:
  - Columns assigned `0` obey **Base Rule $R_A$**.
  - Columns assigned `1` obey **Differing Target Rule $R_B$**.
- Supports column allocation modes:
  - **Specific Chosen Columns (e.g. `30, 60, 90` or `10-20, 80`)**: Explicitly designate column indices that execute Rule $R_B$ while all other columns execute Base Rule $R_A$.
  - **Random Columns ($p$)**: Random column allocation with mixing probability ratio $p$.
  - **Block Split**: Left half uses Rule A, right half uses Rule B.
  - **Single Center Column**: A single column uses Rule B.
  - **Striped Columns**: Periodic interleaved columns ($1:k$).

### 3. WebGL2 Discrete GPU Hardware Acceleration (`js/gl_engine.js`)
- **Direct GPU Processing**: Context initialized with `{ powerPreference: 'high-performance' }` to utilize your **Discrete GPU** (NVIDIA GeForce / AMD Radeon).
- **Custom GLSL Shaders (`#version 300 es`)**: Fast hardware texture sampling for rendering spacetime matrices.
- **CPU Fallback**: Automatic, graceful fallback to CPU 2D Canvas if WebGL2 is disabled or unsupported.

### 4. Thermodynamic Limits ($10,000 \times 10,000$) & 0.1ms Viewport Panning
- Supports grid scales from **`240 × 180` (Fast Preview)** to **`10,000 × 10,000` (Infinite Approximation)**.
- **Decoupled Viewport Shader Panning**: Spacetime matrix is simulated and cached once; moving Viewport $X$ or $Y$ sliders updates GPU texture UV offsets in **0.1ms** without CPU re-computation.

### 5. Global Spacetime Minimap & Interactive Viewport Locator
- **Full-Grid Miniature Map**: Renders a downsampled overview of the full $10,000 \times 10,000$ automaton matrix.
- **Glowing Viewport Locator Box**: Draws a bright cyan bounding box (`#38bdf8`) highlighting the exact viewport location `(x=viewX..viewX+200, t=viewY..viewY+200)` relative to the full grid.
- **Interactive Mouse Navigation**: Click or drag anywhere on the minimap to instantly jump your viewport sample location.

### 6. Quantitative Analysis & Automated Dominance Classification
- **Shannon Block Entropy ($H$)**: Measures structural chaos and information density.
- **Periodicity Detection ($\tau$)**: Identifies exact cycle lengths for repeating cellular states.
- **Rule Dominance Evaluator**: Automatically determines whether Rule A dominates ($R_A \succ R_B$), Rule B dominates ($R_B \succ R_A$), or a Co-dominant Hybrid emerges.

---

## 🚀 Getting Started

### 1. Interactive Web Application (`sim/index.html`)
Simply open [`index.html`](file:///d:/Projects/Cellalar_Automata/sim/index.html) in Chrome, Edge, or Firefox!
- Select **Base Rule A** (e.g. Rule 108 [Class II]) and **Affected Rule B** (e.g. Rule 30 [Class III]).
- Choose Column Mode (e.g. **Specific Chosen Columns**: `30, 60, 90, 120`).
- Select Scale (**`10,000 × 10,000`**), use the **Viewport Sliders** or **Minimap Locator** to pan across the grid.
- Click **Export Canvas PNG** to save high-resolution comparison figures.

### 2. Python Tool (`sim/ca_column_mixer.py`)
Run with Python (requires NumPy & Matplotlib):
```bash
python ca_column_mixer.py
```
Or import in Python scripts / Jupyter Notebooks:
```python
from ca_column_mixer import compare_patterns

# Experiment: 10,000 x 10,000 simulation sampling a 200 x 200 viewport window at t=5000, x=4900
compare_patterns(
    rule_a=108, 
    rule_b=30, 
    width=10000, 
    steps=10000, 
    column_mode='specific', 
    specific_cols="30, 60, 90, 120", 
    view_x=4900, 
    view_y=5000, 
    view_w=200, 
    view_h=200, 
    seed=42, 
    save_fig="viewport_sample.png"
)
```

---

## 📁 Repository Structure

```
sim/
├── index.html            # Web Dashboard layout with Minimap & GPU Badge
├── style.css             # Dark mode glassmorphism styles & 3-column grid
├── js/
│   ├── wolfram88.js      # Array of 88 fundamental rules & class definitions
│   ├── gl_engine.js      # WebGL2 Discrete GPU Hardware Acceleration Engine
│   └── app.js            # Master application, viewport caching & UI event handlers
├── ca_column_mixer.py    # Python standalone matrix simulation & viewport plotter
└── README.md             # Project documentation (v1.1.4)
```
