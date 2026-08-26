/**
 * app.js
 * Master Application for Column-Wise Rule Mixing & Spacetime Matrix Comparison.
 */

(function () {
    'use strict';

    // State variables
    let ruleA = 108; // Base Rule A
    let ruleB = 30;  // Target Rule B
    let width = 240;
    let steps = 180;
    let columnMode = 'random'; // 'random', 'block_half', 'single_col', 'striped'
    let mixRatio = 0.3;
    let initMode = 'random'; // 'random', 'single', 'periodic', 'custom'
    let initDensity = 0.5;
    let customPatternStr = '';
    let seed = 42;

    // DOM Elements
    let selRuleA, selRuleB, selColMode, sliderRatio, txtRatioVal;
    let selInitMode, sliderDensity, txtDensityVal, inputSeed, inputCustomPattern;
    let canvasBase, canvasMixed, canvasTarget, canvasMask;
    let badgeClassA, badgeClassB, badgeClassMix;
    let textEntA, textEntB, textEntMix;
    let textPerA, textPerB, textPerMix;
    let btnRandomizeSeed, btnRun, btnExportPng;

    // Pseudo-RNG for reproducible seeds
    function prng(s) {
        let x = Math.sin(s++) * 10000;
        return x - Math.floor(x);
    }

    function generateInitialRow(w, mode, density, s, customStr) {
        let row = new Uint8Array(w);
        if (mode === 'single') {
            row[Math.floor(w / 2)] = 1;
        } else if (mode === 'random' || mode === 'density') {
            let currSeed = s;
            for (let i = 0; i < w; i++) {
                let r = prng(currSeed++);
                row[i] = r < density ? 1 : 0;
            }
        } else if (mode === 'periodic') {
            for (let i = 0; i < w; i++) {
                row[i] = (i % 4 < 2) ? 1 : 0;
            }
        } else if (mode === 'custom' && customStr.length > 0) {
            for (let i = 0; i < w; i++) {
                let char = customStr[i % customStr.length];
                row[i] = (char === '1' || char === '#') ? 1 : 0;
            }
        } else {
            let currSeed = s;
            for (let i = 0; i < w; i++) {
                let r = prng(currSeed++);
                row[i] = r < 0.5 ? 1 : 0;
            }
        }
        return row;
    }

    let inputSpecificCols;

    function parseSpecificColumns(str, w) {
        let indices = new Set();
        let parts = str.split(/[,;\s]+/);
        for (let p of parts) {
            if (!p) continue;
            if (p.includes('-')) {
                let [startStr, endStr] = p.split('-');
                let start = parseInt(startStr, 10);
                let end = parseInt(endStr, 10);
                if (!isNaN(start) && !isNaN(end)) {
                    let minIdx = Math.max(0, Math.min(start, end));
                    let maxIdx = Math.min(w - 1, Math.max(start, end));
                    for (let i = minIdx; i <= maxIdx; i++) {
                        indices.add(i);
                    }
                }
            } else {
                let idx = parseInt(p, 10);
                if (!isNaN(idx) && idx >= 0 && idx < w) {
                    indices.add(idx);
                }
            }
        }
        return indices;
    }

    function generateColumnMask(w, mode, ratio, s, specificStr) {
        let mask = new Uint8Array(w);
        let currSeed = s + 1000;

        if (mode === 'specific') {
            let cols = parseSpecificColumns(specificStr || '', w);
            cols.forEach(idx => {
                mask[idx] = 1;
            });
        } else if (mode === 'random') {
            for (let i = 0; i < w; i++) {
                let r = prng(currSeed++);
                mask[i] = r < ratio ? 1 : 0; // 1 = Target Rule B
            }
        } else if (mode === 'block_half') {
            let half = Math.floor(w / 2);
            for (let i = half; i < w; i++) {
                mask[i] = 1;
            }
        } else if (mode === 'single_col') {
            mask[Math.floor(w / 2)] = 1;
        } else if (mode === 'striped') {
            let k = Math.max(1, Math.round(1 / Math.max(ratio, 0.05)));
            for (let i = 0; i < w; i++) {
                mask[i] = (i % k === 0) ? 1 : 0;
            }
        }
        return mask;
    }

    function simulateSingleRule(initRow, st, ruleNum) {
        let w = initRow.length;
        let mat = new Array(st);
        mat[0] = initRow;
        let table = window.Wolfram88.getRuleLookupTable(ruleNum);

        for (let t = 0; t < st - 1; t++) {
            let prev = mat[t];
            let next = new Uint8Array(w);
            for (let i = 0; i < w; i++) {
                let left = (i === 0) ? prev[w - 1] : prev[i - 1];
                let center = prev[i];
                let right = (i === w - 1) ? prev[0] : prev[i + 1];
                let nb = (left << 2) | (center << 1) | right;
                next[i] = table[nb];
            }
            mat[t + 1] = next;
        }
        return mat;
    }

    function simulateColumnMixedRule(initRow, st, rA, rB, mask) {
        let w = initRow.length;
        let mat = new Array(st);
        mat[0] = initRow;
        let tableA = window.Wolfram88.getRuleLookupTable(rA);
        let tableB = window.Wolfram88.getRuleLookupTable(rB);

        for (let t = 0; t < st - 1; t++) {
            let prev = mat[t];
            let next = new Uint8Array(w);
            for (let i = 0; i < w; i++) {
                let left = (i === 0) ? prev[w - 1] : prev[i - 1];
                let center = prev[i];
                let right = (i === w - 1) ? prev[0] : prev[i + 1];
                let nb = (left << 2) | (center << 1) | right;

                // Column-wise decision: mask 1 uses Rule B, 0 uses Rule A
                next[i] = (mask[i] === 1) ? tableB[nb] : tableA[nb];
            }
            mat[t + 1] = next;
        }
        return mat;
    }

    function renderMatrixToCanvas(canvas, matrix, color0 = '#0f172a', color1 = '#38bdf8') {
        let ctx = canvas.getContext('2d');
        let st = matrix.length;
        let w = matrix[0].length;

        canvas.width = w;
        canvas.height = st;

        let imgData = ctx.createImageData(w, st);
        let data = imgData.data;

        // Parse colors
        let c0 = parseColor(color0);
        let c1 = parseColor(color1);

        let ptr = 0;
        for (let t = 0; t < st; t++) {
            let row = matrix[t];
            for (let i = 0; i < w; i++) {
                let bit = row[i];
                let c = bit === 1 ? c1 : c0;
                data[ptr] = c[0];
                data[ptr + 1] = c[1];
                data[ptr + 2] = c[2];
                data[ptr + 3] = 255;
                ptr += 4;
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }

    function renderMaskToCanvas(canvas, mask, st) {
        let ctx = canvas.getContext('2d');
        let w = mask.length;
        canvas.width = w;
        canvas.height = st;

        let imgData = ctx.createImageData(w, st);
        let data = imgData.data;

        let cA = [56, 189, 248];  // Blue for Rule A
        let cB = [244, 63, 94];   // Rose/Red for Rule B

        for (let t = 0; t < st; t++) {
            for (let i = 0; i < w; i++) {
                let bit = mask[i];
                let c = bit === 1 ? cB : cA;
                let ptr = (t * w + i) * 4;
                data[ptr] = c[0];
                data[ptr + 1] = c[1];
                data[ptr + 2] = c[2];
                data[ptr + 3] = 255;
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }

    function parseColor(hex) {
        if (hex.startsWith('#')) {
            hex = hex.slice(1);
        }
        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('');
        }
        let num = parseInt(hex, 16);
        return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
    }

    function computeEntropy(matrix) {
        let st = matrix.length;
        let w = matrix[0].length;
        let counts = new Array(8).fill(0);
        let total = 0;

        let startT = Math.floor(st / 2);
        for (let t = startT; t < st; t++) {
            let row = matrix[t];
            for (let i = 0; i < w; i++) {
                let left = (i === 0) ? row[w - 1] : row[i - 1];
                let center = row[i];
                let right = (i === w - 1) ? row[0] : row[i + 1];
                let nb = (left << 2) | (center << 1) | right;
                counts[nb]++;
                total++;
            }
        }

        let ent = 0;
        for (let k = 0; k < 8; k++) {
            if (counts[k] > 0) {
                let p = counts[k] / total;
                ent -= p * Math.log2(p);
            }
        }
        return ent;
    }

    function detectPeriodicity(matrix) {
        let st = matrix.length;
        let w = matrix[0].length;
        let tailStart = Math.max(0, st - 120);

        for (let p = 1; p <= 80; p++) {
            let isPeriodic = true;
            for (let t = tailStart; t < st - p; t++) {
                let r1 = matrix[t];
                let r2 = matrix[t + p];
                for (let i = 0; i < w; i++) {
                    if (r1[i] !== r2[i]) {
                        isPeriodic = false;
                        break;
                    }
                }
                if (!isPeriodic) break;
            }
            if (isPeriodic) return p;
        }
        return null;
    }

    function classifyResult(matrix, entropy, period) {
        if (period !== null) {
            if (period === 1) return { class: 'Class I', text: 'Class I (Fixed/Homogeneous)' };
            return { class: 'Class II', text: `Class II (Periodic, P=${period})` };
        }
        if (entropy > 2.2) {
            return { class: 'Class III', text: 'Class III (Chaotic)' };
        }
        return { class: 'Class IV', text: 'Class IV (Complex/Localized)' };
    }

    function updateSimulation() {
        // Read UI inputs
        ruleA = parseInt(selRuleA.value, 10);
        ruleB = parseInt(selRuleB.value, 10);
        columnMode = selColMode.value;
        mixRatio = parseFloat(sliderRatio.value);
        initMode = selInitMode.value;
        initDensity = parseFloat(sliderDensity.value);
        seed = parseInt(inputSeed.value, 10) || 42;
        customPatternStr = inputCustomPattern.value.trim();
        let specificStr = inputSpecificCols ? inputSpecificCols.value.trim() : '';

        txtRatioVal.textContent = Math.round(mixRatio * 100) + '%';
        txtDensityVal.textContent = Math.round(initDensity * 100) + '%';

        // Toggle control visibility based on column mode
        let groupSpecific = document.getElementById('group-specific-cols');
        let groupSlider = document.getElementById('group-ratio-slider');
        if (groupSpecific) groupSpecific.style.display = (columnMode === 'specific') ? 'block' : 'none';
        if (groupSlider) groupSlider.style.display = (columnMode === 'random' || columnMode === 'striped') ? 'block' : 'none';

        // Show/hide custom input row
        document.getElementById('custom-input-group').style.display = (initMode === 'custom') ? 'block' : 'none';

        // Generate shared initial row & column mask
        let initRow = generateInitialRow(width, initMode, initDensity, seed, customPatternStr);
        let mask = generateColumnMask(width, columnMode, mixRatio, seed, specificStr);

        // Run simulations
        let matA = simulateSingleRule(initRow, steps, ruleA);
        let matB = simulateSingleRule(initRow, steps, ruleB);
        let matMix = simulateColumnMixedRule(initRow, steps, ruleA, ruleB, mask);

        // Render to canvases
        renderMatrixToCanvas(canvasBase, matA, '#0f172a', '#38bdf8');
        renderMatrixToCanvas(canvasTarget, matB, '#0f172a', '#f43f5e');
        renderMatrixToCanvas(canvasMixed, matMix, '#0f172a', '#a855f7');
        renderMaskToCanvas(canvasMask, mask, steps);

        // Compute metrics
        let entA = computeEntropy(matA);
        let entB = computeEntropy(matB);
        let entMix = computeEntropy(matMix);

        let perA = detectPeriodicity(matA);
        let perB = detectPeriodicity(matB);
        let perMix = detectPeriodicity(matMix);

        let classA = window.Wolfram88.CLASSES[ruleA] || 'Unknown';
        let classB = window.Wolfram88.CLASSES[ruleB] || 'Unknown';
        let mixClassInfo = classifyResult(matMix, entMix, perMix);

        // Update UI Badges & Text
        badgeClassA.textContent = `Base Rule ${ruleA} [Class ${classA}]`;
        badgeClassB.textContent = `Affected Rule ${ruleB} [Class ${classB}]`;
        badgeClassMix.textContent = `Mixed Rule [${mixClassInfo.text}]`;

        textEntA.textContent = entA.toFixed(3);
        textEntB.textContent = entB.toFixed(3);
        textEntMix.textContent = entMix.toFixed(3);

        textPerA.textContent = perA ? `P = ${perA}` : 'Aperiodic / High Period';
        textPerB.textContent = perB ? `P = ${perB}` : 'Aperiodic / High Period';
        textPerMix.textContent = perMix ? `P = ${perMix}` : 'Aperiodic / High Period';
    }

    function initUI() {
        selRuleA = document.getElementById('sel-rule-a');
        selRuleB = document.getElementById('sel-rule-b');
        selColMode = document.getElementById('sel-col-mode');
        inputSpecificCols = document.getElementById('input-specific-cols');
        sliderRatio = document.getElementById('slider-ratio');
        txtRatioVal = document.getElementById('txt-ratio-val');

        selInitMode = document.getElementById('sel-init-mode');
        sliderDensity = document.getElementById('slider-density');
        txtDensityVal = document.getElementById('txt-density-val');
        inputSeed = document.getElementById('input-seed');
        inputCustomPattern = document.getElementById('input-custom-pattern');

        canvasBase = document.getElementById('canvas-base');
        canvasMixed = document.getElementById('canvas-mixed');
        canvasTarget = document.getElementById('canvas-target');
        canvasMask = document.getElementById('canvas-mask');

        badgeClassA = document.getElementById('badge-class-a');
        badgeClassB = document.getElementById('badge-class-b');
        badgeClassMix = document.getElementById('badge-class-mix');

        textEntA = document.getElementById('text-ent-a');
        textEntB = document.getElementById('text-ent-b');
        textEntMix = document.getElementById('text-ent-mix');

        textPerA = document.getElementById('text-per-a');
        textPerB = document.getElementById('text-per-b');
        textPerMix = document.getElementById('text-per-mix');

        btnRandomizeSeed = document.getElementById('btn-randomize-seed');
        btnRun = document.getElementById('btn-run');
        btnExportPng = document.getElementById('btn-export-png');

        // Populate Rule Dropdowns from Wolfram 88 rules
        let rules = window.Wolfram88.RULES;
        rules.forEach(r => {
            let cls = window.Wolfram88.CLASSES[r] || 'Unknown';
            let optA = document.createElement('option');
            optA.value = r;
            optA.textContent = `Rule ${r} (Class ${cls})`;
            if (r === ruleA) optA.selected = true;
            selRuleA.appendChild(optA);

            let optB = document.createElement('option');
            optB.value = r;
            optB.textContent = `Rule ${r} (Class ${cls})`;
            if (r === ruleB) optB.selected = true;
            selRuleB.appendChild(optB);
        });

        // Event listeners
        selRuleA.addEventListener('change', updateSimulation);
        selRuleB.addEventListener('change', updateSimulation);
        selColMode.addEventListener('change', updateSimulation);
        if (inputSpecificCols) inputSpecificCols.addEventListener('input', updateSimulation);
        sliderRatio.addEventListener('input', updateSimulation);
        selInitMode.addEventListener('change', updateSimulation);
        sliderDensity.addEventListener('input', updateSimulation);
        inputSeed.addEventListener('input', updateSimulation);
        inputCustomPattern.addEventListener('input', updateSimulation);
        btnRun.addEventListener('click', updateSimulation);

        btnRandomizeSeed.addEventListener('click', () => {
            inputSeed.value = Math.floor(Math.random() * 900000) + 100000;
            updateSimulation();
        });

        btnExportPng.addEventListener('click', () => {
            let compCanvas = document.createElement('canvas');
            compCanvas.width = width * 3 + 40;
            compCanvas.height = steps + 50;
            let ctx = compCanvas.getContext('2d');
            ctx.fillStyle = '#090d16';
            ctx.fillRect(0, 0, compCanvas.width, compCanvas.height);

            ctx.fillStyle = '#ffffff';
            ctx.font = '14px sans-serif';
            ctx.fillText(`Base Rule ${ruleA}`, 10, 20);
            ctx.fillText(`Column-Mixed (${ruleA}+${ruleB})`, width + 20, 20);
            ctx.fillText(`Affected Rule ${ruleB}`, width * 2 + 30, 20);

            ctx.drawImage(canvasBase, 10, 30);
            ctx.drawImage(canvasMixed, width + 20, 30);
            ctx.drawImage(canvasTarget, width * 2 + 30, 30);

            let link = document.createElement('a');
            link.download = `ca_mixing_Rule${ruleA}_Rule${ruleB}.png`;
            link.href = compCanvas.toDataURL('image/png');
            link.click();
        });

        // Initial render
        updateSimulation();
    }

    document.addEventListener('DOMContentLoaded', initUI);
})();
