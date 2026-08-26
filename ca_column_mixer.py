"""
ca_column_mixer.py
Cellular Automata Column-Wise Rule Mixing & Pattern Comparison Tool
Starts directly from Wolfram's 88 fundamental rules.
"""

import numpy as np
import matplotlib.pyplot as plt
from typing import List, Tuple, Dict, Optional

# Exact array of Wolfram's 88 Fundamental Equivalence Rules
WOLFRAM_88_RULES = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    18, 19, 22, 23, 24, 25, 26, 27, 28, 29, 30, 32, 33, 34,
    35, 36, 37, 38, 40, 41, 42, 43, 44, 45, 46, 50, 51, 54,
    56, 57, 58, 60, 62, 72, 73, 74, 76, 77, 78, 90, 94, 104,
    105, 106, 108, 110, 122, 126, 128, 130, 132, 134, 136, 138, 140,
    142, 146, 150, 152, 154, 156, 160, 162, 164, 168, 170, 172, 178,
    184, 200, 204, 232
]

# Wolfram Class Heuristic Map for key fundamental rules
RULE_CLASSES = {
    0: 'Class I', 8: 'Class I', 32: 'Class I', 40: 'Class I', 128: 'Class I', 136: 'Class I', 160: 'Class I', 168: 'Class I',
    1: 'Class II', 2: 'Class II', 3: 'Class II', 4: 'Class II', 5: 'Class II', 6: 'Class II', 7: 'Class II',
    9: 'Class II', 10: 'Class II', 11: 'Class II', 12: 'Class II', 13: 'Class II', 14: 'Class II', 15: 'Class II',
    19: 'Class II', 23: 'Class II', 24: 'Class II', 25: 'Class II', 26: 'Class II', 27: 'Class II', 28: 'Class II',
    29: 'Class II', 33: 'Class II', 34: 'Class II', 35: 'Class II', 36: 'Class II', 37: 'Class II', 38: 'Class II',
    42: 'Class II', 43: 'Class II', 44: 'Class II', 46: 'Class II', 50: 'Class II', 51: 'Class II', 56: 'Class II',
    57: 'Class II', 58: 'Class II', 62: 'Class II', 72: 'Class II', 73: 'Class II', 74: 'Class II', 76: 'Class II',
    77: 'Class II', 78: 'Class II', 94: 'Class II', 104: 'Class II', 108: 'Class II', 130: 'Class II', 132: 'Class II',
    134: 'Class II', 138: 'Class II', 140: 'Class II', 142: 'Class II', 152: 'Class II', 154: 'Class II', 156: 'Class II',
    162: 'Class II', 164: 'Class II', 170: 'Class II', 172: 'Class II', 178: 'Class II', 184: 'Class II', 200: 'Class II',
    204: 'Class II', 232: 'Class II',
    18: 'Class III', 22: 'Class III', 30: 'Class III', 45: 'Class III', 60: 'Class III', 90: 'Class III',
    105: 'Class III', 106: 'Class III', 122: 'Class III', 126: 'Class III', 146: 'Class III', 150: 'Class III',
    54: 'Class IV', 110: 'Class IV'
}

def rule_to_table(rule_num: int) -> np.ndarray:
    """Convert an ECA rule integer (0-255) to 8-element binary lookup array."""
    return np.array([(rule_num >> i) & 1 for i in range(8)], dtype=np.uint8)

def generate_initial_config(width: int, mode: str = 'random', density: float = 0.5, seed: int = 42) -> np.ndarray:
    """Generate initial 1D binary state array of length width."""
    np.random.seed(seed)
    if mode == 'single':
        init = np.zeros(width, dtype=np.uint8)
        init[width // 2] = 1
        return init
    elif mode == 'random':
        return (np.random.rand(width) < density).astype(np.uint8)
    elif mode == 'periodic':
        return np.array([(i % 4 < 2) for i in range(width)], dtype=np.uint8)
    else:
        return (np.random.rand(width) < density).astype(np.uint8)

def parse_specific_cols(cols, width: int) -> List[int]:
    """Parse column indices from a list or comma-separated string."""
    indices = set()
    if isinstance(cols, str):
        parts = cols.replace(',', ' ').split()
        for p in parts:
            if '-' in p:
                try:
                    s, e = p.split('-')
                    min_idx, max_idx = max(0, min(int(s), int(e))), min(width - 1, max(int(s), int(e)))
                    for i in range(min_idx, max_idx + 1):
                        indices.add(i)
                except ValueError:
                    pass
            else:
                try:
                    idx = int(p)
                    if 0 <= idx < width:
                        indices.add(idx)
                except ValueError:
                    pass
    elif isinstance(cols, (list, tuple, set)):
        for idx in cols:
            if 0 <= idx < width:
                indices.add(int(idx))
    return list(indices)

def generate_column_mask(width: int, mode: str = 'random', ratio: float = 0.5, seed: int = 42, specific_cols = None) -> np.ndarray:
    """
    Generate column mixing mask (0 = Base Rule A, 1 = Target Rule B).
    """
    mask = np.zeros(width, dtype=np.uint8)
    if mode == 'specific' and specific_cols is not None:
        col_list = parse_specific_cols(specific_cols, width)
        for idx in col_list:
            mask[idx] = 1
        return mask

    np.random.seed(seed + 100)
    if mode == 'random':
        return (np.random.rand(width) < ratio).astype(np.uint8)
    elif mode == 'random_count' or mode == 'exact_count':
        count = int(round(ratio * width)) if ratio <= 1.0 else int(ratio)
        count = max(1, min(width, count))
        chosen = np.random.choice(width, size=count, replace=False)
        mask[chosen] = 1
        return mask
    elif mode == 'block_half':
        mask[width // 2:] = 1 # Right half Rule B
        return mask
    elif mode == 'single_col':
        mask[width // 2] = 1
        return mask
    elif mode == 'striped':
        k = max(1, int(1.0 / max(ratio, 0.01)))
        return np.array([(i % k == 0) for i in range(width)], dtype=np.uint8)
    else:
        return (np.random.rand(width) < ratio).astype(np.uint8)

def simulate_ca(initial_row: np.ndarray, steps: int, rule_num: int) -> np.ndarray:
    """Simulate single-rule 1D Cellular Automaton matrix."""
    width = len(initial_row)
    matrix = np.zeros((steps, width), dtype=np.uint8)
    matrix[0] = initial_row
    table = rule_to_table(rule_num)

    for t in range(steps - 1):
        row = matrix[t]
        left = np.roll(row, 1)
        center = row
        right = np.roll(row, -1)
        nb = (left << 2) | (center << 1) | right
        matrix[t + 1] = table[nb]

    return matrix

def simulate_column_mixed_ca(initial_row: np.ndarray, steps: int, rule_a: int, rule_b: int, column_mask: np.ndarray) -> np.ndarray:
    """
    Simulate Column-Wise Mixed Cellular Automaton matrix.
    Each column x obeys rule_a if column_mask[x] == 0, else rule_b if column_mask[x] == 1.
    """
    width = len(initial_row)
    matrix = np.zeros((steps, width), dtype=np.uint8)
    matrix[0] = initial_row

    table_a = rule_to_table(rule_a)
    table_b = rule_to_table(rule_b)

    for t in range(steps - 1):
        row = matrix[t]
        left = np.roll(row, 1)
        center = row
        right = np.roll(row, -1)
        nb = (left << 2) | (center << 1) | right

        next_a = table_a[nb]
        next_b = table_b[nb]

        # Column-wise selection: mask 0 -> next_a, mask 1 -> next_b
        matrix[t + 1] = np.where(column_mask == 1, next_b, next_a)

    return matrix

def compute_entropy(matrix: np.ndarray) -> float:
    """Compute spatial block Shannon entropy (3-gram) of matrix."""
    steps, width = matrix.shape
    # Flatten 3-cell spatial blocks
    blocks = []
    for t in range(steps // 2, steps):
        row = matrix[t]
        b = (np.roll(row, 1) << 2) | (row << 1) | np.roll(row, -1)
        blocks.extend(b)
    
    counts = np.bincount(blocks, minlength=8)
    probs = counts / np.sum(counts)
    probs = probs[probs > 0]
    return -np.sum(probs * np.log2(probs))

def detect_periodicity(matrix: np.ndarray, max_p: int = 100) -> Optional[int]:
    """Detect if matrix reaches a periodic cycle in time."""
    steps = matrix.shape[0]
    tail_start = max(0, steps - 150)
    for p in range(1, max_p + 1):
        is_periodic = True
        for t in range(tail_start, steps - p):
            if not np.array_equal(matrix[t], matrix[t + p]):
                is_periodic = False
                break
        if is_periodic:
            return p
    return None

def evaluate_dominance(rule_a: int, rule_b: int, ent_a: float, ent_b: float, ent_mix: float) -> str:
    """Evaluate rule dominance / recessiveness based on entropy shift."""
    diff_a = abs(ent_mix - ent_a)
    diff_b = abs(ent_mix - ent_b)
    if diff_a < 0.12 and diff_b > 0.3:
        return f"Rule A ({rule_a}) DOMINATES Rule B ({rule_b})"
    elif diff_b < 0.12 and diff_a > 0.3:
        return f"Rule B ({rule_b}) DOMINATES Rule A ({rule_a})"
    else:
        return "CO-DOMINANT / Emergent Hybrid Class"

def compare_patterns(rule_a: int, rule_b: int, width: int = 200, steps: int = 150, 
                     column_mode: str = 'specific', specific_cols = "30, 60, 90, 120", mix_ratio: float = 0.5, 
                     init_mode: str = 'random', init_density: float = 0.5, seed: int = 42,
                     view_x: int = 0, view_y: int = 0, view_w: int = 200, view_h: int = 200,
                     save_fig: str = "ca_mixing_comparison.png"):
    """
    Run simulation for Base Rule A, Target Rule B, and Column-Mixed Rule.
    Displays 200x200 viewport window from full spacetime matrix and prints classification & dominance metrics.
    """
    initial_config = generate_initial_config(width, mode=init_mode, density=init_density, seed=seed)
    col_mask = generate_column_mask(width, mode=column_mode, ratio=mix_ratio, seed=seed, specific_cols=specific_cols)

    mat_a = simulate_ca(initial_config, steps, rule_a)
    mat_b = simulate_ca(initial_config, steps, rule_b)
    mat_mix = simulate_column_mixed_ca(initial_config, steps, rule_a, rule_b, col_mask)

    ent_a = compute_entropy(mat_a)
    ent_b = compute_entropy(mat_b)
    ent_mix = compute_entropy(mat_mix)

    per_a = detect_periodicity(mat_a)
    per_b = detect_periodicity(mat_b)
    per_mix = detect_periodicity(mat_mix)

    class_a = RULE_CLASSES.get(rule_a, 'Unknown')
    class_b = RULE_CLASSES.get(rule_b, 'Unknown')
    dominance_str = evaluate_dominance(rule_a, rule_b, ent_a, ent_b, ent_mix)

    # Heuristic classification of mixed result
    if per_mix is not None:
        if per_mix == 1:
            mix_class = "Class I (Homogeneous)"
        else:
            mix_class = f"Class II (Periodic, P={per_mix})"
    else:
        if ent_mix > 2.2:
            mix_class = "Class III (Chaotic)"
        else:
            mix_class = "Class IV / Complex Transient"

    print("=" * 70)
    print(f"CELLULAR AUTOMATA COLUMN MIXING EXPERIMENT (Matrix: {width}x{steps})")
    print("=" * 70)
    print(f"Base Rule A       : Rule {rule_a} [{class_a}] | Entropy: {ent_a:.3f} | Period: {per_a}")
    print(f"Target Rule B     : Rule {rule_b} [{class_b}] | Entropy: {ent_b:.3f} | Period: {per_b}")
    print(f"Column Mixed Rule : Rule {rule_a} + Rule {rule_b} (mode: {column_mode})")
    print(f"Mixed Result      : Entropy: {ent_mix:.3f} | Period: {per_mix} | Inferred: {mix_class}")
    print(f"Dominance Status  : {dominance_str}")
    print("=" * 70)

    # Viewport sampling (slice view_h x view_w window from step view_y, col view_x)
    vh = min(view_h, steps)
    vw = min(view_w, width)
    vy = min(view_y, steps - vh)
    vx = min(view_x, width - vw)

    sub_a = mat_a[vy:vy+vh, vx:vx+vw]
    sub_mix = mat_mix[vy:vy+vh, vx:vx+vw]
    sub_b = mat_b[vy:vy+vh, vx:vx+vw]
    sub_mask = col_mask[vx:vx+vw]

    # Plot comparisons
    fig, axes = plt.subplots(1, 4, figsize=(18, 6), gridspec_kw={'width_ratios': [1, 1, 1, 0.15]})
    
    axes[0].imshow(sub_a, cmap='binary', interpolation='nearest')
    axes[0].set_title(f"Base Rule {rule_a}\n[{class_a}]", fontsize=12, fontweight='bold')
    axes[0].set_ylabel(f"Time Step t ({vy}..{vy+vh})")
    axes[0].set_xlabel(f"Cell Position x ({vx}..{vx+vw})")

    axes[1].imshow(sub_mix, cmap='binary', interpolation='nearest')
    axes[1].set_title(f"Column-Mixed Viewport ({vw}x{vh})\n[{mix_class}]\n{dominance_str}", fontsize=10, fontweight='bold', color='darkblue')
    axes[1].set_xlabel(f"Cell Position x ({vx}..{vx+vw})")

    axes[2].imshow(sub_b, cmap='binary', interpolation='nearest')
    axes[2].set_title(f"Target Rule {rule_b}\n[{class_b}]", fontsize=12, fontweight='bold')
    axes[2].set_xlabel(f"Cell Position x ({vx}..{vx+vw})")

    # Display column mask indicator
    col_img = np.tile(sub_mask, (vh, 1))
    axes[3].imshow(col_img, cmap='coolwarm', aspect='auto')
    axes[3].set_title("Column Mask\n(Blue=A, Red=B)", fontsize=9)
    axes[3].set_xticks([])
    axes[3].set_yticks([])

    plt.tight_layout()
    plt.savefig(save_fig, dpi=300)
    print(f"Viewport plot saved to: {save_fig}")
    return fig

if __name__ == "__main__":
    print(f"Loaded {len(WOLFRAM_88_RULES)} Wolfram Fundamental Rules.")
    # Example 10,000 x 10,000 experiment sampling 200 x 200 viewport window at t=5000, x=4900
    compare_patterns(
        rule_a=108, 
        rule_b=30, 
        width=1000, 
        steps=1000, 
        column_mode='specific', 
        specific_cols="200, 400, 600, 800", 
        view_x=400, 
        view_y=400, 
        view_w=200, 
        view_h=200, 
        seed=42
    )

