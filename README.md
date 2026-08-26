# Cellular Automata Column-Wise Rule Mixing & Spacetime Pattern Explorer (v1.1.5)

This repository provides a mathematical framework, Python research toolkit, and an interactive **WebGL2 Discrete GPU-Accelerated Web Application** for studying the thermodynamic phenomena and pattern dynamics of **column-wise rule mixing** among **Wolfram's 88 Fundamental Elementary Cellular Automata (ECA)** rules up to $10,000 \times 10,000$ matrices.

---

## 🧮 Mathematical Formulation of Column-Wise Rule Mixing

In a 1D Elementary Cellular Automaton of width $N$, the spacetime matrix $S \in \{0, 1\}^{T \times N}$ evolves across discrete generation steps $t = 0, 1, 2, \dots, T-1$.

Under standard 1D ECA dynamics, a cell $s(t, x)$ updates based on its 3-cell spatial neighborhood $(s(t, x-1), s(t, x), s(t, x+1))$ via rule mapping function $\mathcal{R}$.

In **Column-Wise Rule Mixing**, a binary spatial mask $M_c \in \{0, 1\}^N$ defines which rule governs each column $x \in [0, N-1]$ across all time steps:

$$s(t+1, x) = M_c[x] \cdot \mathcal{R}_B\Big(s(t, x-1), s(t, x), s(t, x+1)\Big) \;+\; \big(1 - M_c[x]\big) \cdot \mathcal{R}_A\Big(s(t, x-1), s(t, x), s(t, x+1)\Big)$$

- **Base Rule $R_A$**: Applied at all spatial columns where $M_c[x] = 0$.
- **Target / Differing Rule $R_B$**: Applied at all spatial columns where $M_c[x] = 1$.

---

## 🌟 Comprehensive Column-Wise Allocation Modes

The explorer supports **6 distinct column-wise spatial allocation modes**:

| Mode Identifier | Mode Name | Description & Mathematical Mask $M_c[x]$ | Primary Research Use Case |
| :--- | :--- | :--- | :--- |
| **`specific`** | **Specific Chosen Columns** | `mask[x] = 1` ONLY for explicitly specified column numbers (e.g. `30, 60, 90` or ranges `10-20, 80`). | Localized point-source defect scattering, impurity pinning, and spatial domain wall studies. |
| **`random_count`** | **Exact Count Random ($k$ Columns)** | Chooses **exactly $k$ unique random columns** without replacement ($1 \le k \le N$) with **0 probability fluctuation**. | Precise density scaling experiments (e.g. testing exact impacts of 1, 5, or 50 altered columns). |
| **`random`** | **Random Bernoulli Distribution** | Each column $x$ is independently assigned $1$ with probability $p$ (`mix_ratio`), and $0$ with probability $1-p$. | Percolation threshold analysis, phase transitions, and disorder stability studies. |
| **`block_half`** | **Bipartite Half-and-Half Split** | Left half ($x < N/2$) runs Rule A; Right half ($x \ge N/2$) runs Rule B. | Interface collision kinetics and shockwave boundaries between competing rule domains. |
| **`single_col`** | **Single Center Column** | Exactly 1 column at center $x = \lfloor N/2 \rfloor$ runs Rule B; all other columns run Rule A. | Conical perturbation speed of sound (Lyapunov exponent) and glider scattering. |
| **`striped`** | **Striped Superlattice** | Columns alternate periodically with stride $k = \max(1, \lfloor 1/p \rfloor)$ such that $x \pmod k == 0$. | Superlattice spatial resonance, periodic lattice forcing, and standing wave dynamics. |

---

## 💻 WebGL2 Discrete GPU Architecture (`js/gl_engine.js`)

To enable lag-free rendering of **$10,000 \times 10,000$ matrices (100 Million Cells)**, the application uses a high-performance WebGL2 shader pipeline:

1. **Discrete GPU Acceleration**:
   WebGL2 context initialized with `{ powerPreference: 'high-performance' }` forcing Windows to assign your **High-Performance Discrete GPU** (NVIDIA GeForce / AMD Radeon).
2. **0.1ms Viewport Shader Panning**:
   Spacetime matrix simulations are calculated once and cached in GPU VRAM as **R8 textures**. Panning viewport sliders (`sliderViewX`, `sliderViewY`) passes texture UV offsets `(viewX, viewY)` directly to custom GLSL `#version 300 es` fragment shaders, achieving instant 60 FPS viewport updates without CPU array re-computation.
3. **Automatic 2D Canvas Fallback**:
   Seamlessly falls back to CPU 2D Canvas if WebGL2 is disabled or unsupported.

---

## 🗺️ Global Spacetime Minimap & Interactive Viewport Locator Box

- **Full Automaton Overview**: Renders a downsampled miniature overview of the full $10,000 \times 10,000$ spacetime matrix.
- **Glowing Viewport Bounding Box**: Highlights the exact $200 \times 200$ viewport sample window relative to the entire $10,000 \times 10,000$ matrix using a bright cyan bounding box (`#38bdf8`) with real-time coordinate readout `(x=viewX..viewX+200, t=viewY..viewY+200)`.
- **Interactive Mouse Navigation**: Click or drag anywhere on the minimap canvas to jump your 200×200 viewport live.

---

## 📊 Quantitative Analysis & Rule Dominance Criteria

1. **Spatial 3-Gram Shannon Block Entropy ($H$)**:
   Calculates structural information entropy over 3-cell spatial blocks $b = (s_{x-1}, s_x, s_{x+1}) \in \{0, 1\}^3$:
   $$H = -\sum_{i=1}^{8} p(b_i) \log_2 p(b_i) \quad \in [0.0, 3.0]$$
2. **State Periodicity Detection ($\tau$)**:
   Identifies exact state repeating cycle lengths $\tau \in [1, 256]$.
3. **Automated Rule Dominance Classification**:
   Compares entropy $H_{\text{Mix}}$ and periodicity $\tau_{\text{Mix}}$ against $H_A, H_B$ to classify rule hierarchy:
   - **$R_A \succ R_B$ (Rule A Dominant)**: Base Rule A suppresses Rule B perturbations.
   - **$R_B \succ R_A$ (Rule B Dominant)**: Differing Rule B spreads and dominates the space.
   - **Co-dominant Hybrid**: A novel hybrid pattern forms with unique entropy dynamics.

---

## 🚀 Getting Started & Usage

### 1. Interactive Web Application (`sim/index.html`)
Open [`sim/index.html`](file:///d:/Projects/Cellalar_Automata/sim/index.html) in Chrome, Edge, or Firefox:
- Select **Base Rule A** (e.g. Rule 108 [Class II]) and **Affected Rule B** (e.g. Rule 30 [Class III]).
- Select **Column Mixing Mode** (e.g. **`Exact Count Random (k Columns)`** or **`Specific Chosen Columns`**).
- Select Grid Scale (**`10,000 × 10,000`**), use the **Viewport Sliders** or click on the **Minimap Locator Box** to pan across the grid.
- Click **Export Canvas PNG** to save high-resolution figures.

### 2. Standalone Python Research Tool (`sim/ca_column_mixer.py`)
Run directly with Python (requires NumPy & Matplotlib):
```bash
python ca_column_mixer.py
```
Or import in Python scripts / Jupyter Notebooks:
```python
from ca_column_mixer import compare_patterns

# Run 10,000 x 10,000 experiment with exact count random columns
compare_patterns(
    rule_a=108, 
    rule_b=30, 
    width=10000, 
    steps=10000, 
    column_mode='random_count', 
    mix_ratio=0.30, 
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
│   ├── wolfram88.js      # Canonical array of 88 fundamental rules & class definitions
│   ├── gl_engine.js      # WebGL2 Discrete GPU Hardware Acceleration Engine
│   └── app.js            # Master application logic, viewport caching & UI handlers
├── ca_column_mixer.py    # Standalone Python simulation, entropy & plot generator
└── README.md             # Detailed project documentation (v1.1.5)
```
