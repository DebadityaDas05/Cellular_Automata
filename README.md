# Cellular Automata Column-Wise Rule Mixing & Pattern Explorer

This repository provides a mathematical framework, Python toolkit, and interactive Web Dashboard for studying the effects of **column-wise rule mixing** among **Wolfram's 88 Fundamental Elementary Cellular Automata (ECA)** rules.

---

## 🌟 Key Features

1. **Direct Focus on Wolfram's 88 Fundamental Rules**:
   - Rather than dealing with all 256 ECA rules, the tool operates directly on the canonical 88 equivalence class representatives (0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 18, 19, 22, 23, 24, 25, 26, 27, 28, 29, 30, 32, 33, 34, 35, 36, 37, 38, 40, 41, 42, 43, 44, 45, 46, 50, 51, 54, 56, 57, 58, 60, 62, 72, 73, 74, 76, 77, 78, 90, 94, 104, 105, 106, 108, 110, 122, 126, 128, 130, 132, 134, 136, 138, 140, 142, 146, 150, 152, 154, 156, 160, 162, 164, 168, 170, 172, 178, 184, 200, 204, 232).

2. **Column-Wise Rule Mixing**:
   - In the spacetime matrix ($t \times x$), each row represents a new generation ($t=0, 1, 2, \dots$).
   - Spatial columns $x$ are assigned rules via a spatial column mask $M_c[x]$.
   - Columns assigned `0` obey **Base Rule $R_A$**.
   - Columns assigned `1` obey **User-Specified Differing Rule $R_B$**.
   - Supports column allocation modes:
     - **Specific Chosen Columns (e.g. `25, 50, 75` or ranges `80-90`)**: Directly specify exact column numbers that execute Rule $R_B$ while all other columns execute Base Rule $R_A$.
     - **Random Columns ($p$)**: Random column allocation with mixing probability ratio $p$.
     - **Block Split**: Left half uses Rule A, right half uses Rule B.
     - **Single Center Column**: A single column uses Rule B.
     - **Striped Columns**: Periodic interleaved columns ($1:k$).

3. **Side-by-Side Spacetime Pattern Comparison**:
   - Compares the **Base Rule matrix**, **Column-Mixed matrix**, and **Affected Target Rule matrix** side-by-side starting from the **exact same initial configuration**.

4. **Automated Quantitative Classification**:
   - Measures 3-gram **Shannon Entropy** ($H$).
   - Detects exact repeat **Periodicity** ($\tau$).
   - Infer ultimate Wolfram Class (Class I: Fixed/Homogeneous, Class II: Periodic, Class III: Chaotic, Class IV: Complex).

---

## 🚀 Getting Started

### 1. Interactive Web Application (`index.html`)
Simply open `index.html` in any web browser!
- Select **Base Rule A** (e.g. Rule 108) and **Affected Rule B** (e.g. Rule 30).
- Select Initial Pattern Configuration (Random, Single Bit, Periodic, Custom Binary String).
- Adjust Column Mixing Ratio ($p$) and click **Update Simulation** or randomize seed.
- View side-by-side spacetime matrices and click **Export Canvas PNG** to save high-resolution figures.

### 2. Python Tool (`ca_column_mixer.py`)
Run with Python (using NumPy & Matplotlib):
```bash
python ca_column_mixer.py
```
Or import in Python / Jupyter Notebooks:
```python
from ca_column_mixer import compare_patterns

# Compare mixing periodic Rule 108 with chaotic Rule 30
compare_patterns(
    rule_a=108, 
    rule_b=30, 
    width=200, 
    steps=150, 
    column_mode='random', 
    mix_ratio=0.3, 
    seed=42, 
    save_fig="rule108_rule30_mix.png"
)
```

---

## 📁 Repository Structure

```
Cellular_Automata/
├── index.html            # Interactive Web UI layout
├── style.css             # Dark mode glassmorphism styles
├── js/
│   ├── wolfram88.js      # Array of 88 fundamental rules & class definitions
│   └── app.js            # Canvas rendering & column-wise matrix engine
├── ca_column_mixer.py    # Python standalone simulation & plot generator
└── README.md             # Project documentation
```
