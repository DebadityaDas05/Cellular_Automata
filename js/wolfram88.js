/**
 * wolfram88.js
 * Definitions and metadata for Wolfram's 88 Fundamental Elementary Cellular Automata Rules.
 */

(function (window) {
    'use strict';

    // Canonical array of Wolfram's 88 Fundamental Equivalence Class Representatives
    const WOLFRAM_88_RULES = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
        18, 19, 22, 23, 24, 25, 26, 27, 28, 29, 30, 32, 33, 34,
        35, 36, 37, 38, 40, 41, 42, 43, 44, 45, 46, 50, 51, 54,
        56, 57, 58, 60, 62, 72, 73, 74, 76, 77, 78, 90, 94, 104,
        105, 106, 108, 110, 122, 126, 128, 130, 132, 134, 136, 138, 140,
        142, 146, 150, 152, 154, 156, 160, 162, 164, 168, 170, 172, 178,
        184, 200, 204, 232
    ];

    // Standard Wolfram Class assignments
    const DEFAULT_CLASSES = {
        0: 'I', 8: 'I', 32: 'I', 40: 'I', 128: 'I', 136: 'I', 160: 'I', 168: 'I',
        1: 'II', 2: 'II', 3: 'II', 4: 'II', 5: 'II', 6: 'II', 7: 'II', 9: 'II', 10: 'II',
        11: 'II', 12: 'II', 13: 'II', 14: 'II', 15: 'II', 19: 'II', 23: 'II', 24: 'II',
        25: 'II', 26: 'II', 27: 'II', 28: 'II', 29: 'II', 33: 'II', 34: 'II', 35: 'II',
        36: 'II', 37: 'II', 38: 'II', 42: 'II', 43: 'II', 44: 'II', 46: 'II', 50: 'II',
        51: 'II', 56: 'II', 57: 'II', 58: 'II', 62: 'II', 72: 'II', 73: 'II', 74: 'II',
        76: 'II', 77: 'II', 78: 'II', 94: 'II', 104: 'II', 108: 'II', 130: 'II', 132: 'II',
        134: 'II', 138: 'II', 140: 'II', 142: 'II', 152: 'II', 154: 'II', 156: 'II',
        162: 'II', 164: 'II', 170: 'II', 172: 'II', 178: 'II', 184: 'II', 200: 'II',
        204: 'II', 232: 'II',
        18: 'III', 22: 'III', 30: 'III', 45: 'III', 60: 'III', 90: 'III', 105: 'III',
        106: 'III', 122: 'III', 126: 'III', 146: 'III', 150: 'III',
        54: 'IV', 110: 'IV'
    };

    /**
     * Get 8-bit lookup table for given rule integer (0-255).
     */
    function getRuleLookupTable(ruleNum) {
        let table = new Uint8Array(8);
        for (let i = 0; i < 8; i++) {
            table[i] = (ruleNum >> i) & 1;
        }
        return table;
    }

    window.Wolfram88 = {
        RULES: WOLFRAM_88_RULES,
        CLASSES: DEFAULT_CLASSES,
        getRuleLookupTable: getRuleLookupTable
    };

})(typeof window !== 'undefined' ? window : this);
