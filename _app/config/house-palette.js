/**
 * House Palette — Official color definitions for all Hexworth houses.
 *
 * This is the SINGLE SOURCE OF TRUTH for house colors across the platform.
 * All house pages, components, and styles should reference these values.
 *
 * Each house has:
 *   primary   — Main brand color (text, borders, icons)
 *   secondary — Darker shade (gradients, active states, hover)
 *   glow      — Transparent primary for shadows and glows
 *   bg        — Very faint tint for backgrounds
 *   border    — Semi-transparent for borders and dividers
 *
 * Usage:
 *   const colors = HousePalette.get('shield');
 *   // → { primary: '#f87171', secondary: '#ef4444', ... }
 *
 *   HousePalette.toCSSVars('shield');
 *   // → '--house-primary: #f87171; --house-secondary: #ef4444; ...'
 */

const HousePalette = {
    web: {
        primary: '#60a5fa',
        secondary: '#3b82f6',
        glow: 'rgba(96, 165, 250, 0.3)',
        bg: 'rgba(96, 165, 250, 0.05)',
        border: 'rgba(96, 165, 250, 0.2)'
    },
    shield: {
        primary: '#f87171',
        secondary: '#ef4444',
        glow: 'rgba(248, 113, 113, 0.3)',
        bg: 'rgba(248, 113, 113, 0.05)',
        border: 'rgba(248, 113, 113, 0.2)'
    },
    forge: {
        primary: '#fbbf24',
        secondary: '#f59e0b',
        glow: 'rgba(251, 191, 36, 0.3)',
        bg: 'rgba(251, 191, 36, 0.05)',
        border: 'rgba(251, 191, 36, 0.2)'
    },
    script: {
        primary: '#a78bfa',
        secondary: '#8b5cf6',
        glow: 'rgba(167, 139, 250, 0.3)',
        bg: 'rgba(167, 139, 250, 0.05)',
        border: 'rgba(167, 139, 250, 0.2)'
    },
    cloud: {
        primary: '#38bdf8',
        secondary: '#0ea5e9',
        glow: 'rgba(56, 189, 248, 0.3)',
        bg: 'rgba(56, 189, 248, 0.05)',
        border: 'rgba(56, 189, 248, 0.2)'
    },
    code: {
        primary: '#4ade80',
        secondary: '#22c55e',
        glow: 'rgba(74, 222, 128, 0.3)',
        bg: 'rgba(74, 222, 128, 0.05)',
        border: 'rgba(74, 222, 128, 0.2)'
    },
    key: {
        primary: '#f472b6',
        secondary: '#ec4899',
        glow: 'rgba(244, 114, 182, 0.3)',
        bg: 'rgba(244, 114, 182, 0.05)',
        border: 'rgba(244, 114, 182, 0.2)'
    },
    eye: {
        primary: '#c084fc',
        secondary: '#a855f7',
        glow: 'rgba(192, 132, 252, 0.3)',
        bg: 'rgba(192, 132, 252, 0.05)',
        border: 'rgba(192, 132, 252, 0.2)'
    },
    'dark-arts': {
        primary: '#6b21a8',
        secondary: '#581c87',
        accent: '#9333ea',
        glow: 'rgba(107, 33, 168, 0.3)',
        bg: 'rgba(107, 33, 168, 0.05)',
        border: 'rgba(107, 33, 168, 0.25)',
        terminal: '#00ff41'
    },
    divergent: {
        primary: '#ff00ff',
        secondary: '#00ffff',
        glow: 'rgba(255, 0, 255, 0.4)',
        bg: 'rgba(255, 0, 255, 0.05)',
        border: 'rgba(255, 0, 255, 0.2)'
    },
    matrix: {
        primary: '#00ff41',
        secondary: '#00cc33',
        glow: 'rgba(0, 255, 65, 0.3)',
        bg: 'rgba(0, 255, 65, 0.05)',
        border: 'rgba(0, 255, 65, 0.2)'
    },
    ai: {
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        glow: 'rgba(139, 92, 246, 0.3)',
        bg: 'rgba(139, 92, 246, 0.05)',
        border: 'rgba(139, 92, 246, 0.2)'
    },

    /**
     * Get palette for a house.
     * @param {string} houseId
     * @returns {object|null}
     */
    get(houseId) {
        return this[houseId] || null;
    },

    /**
     * Generate CSS custom property string for a house.
     * @param {string} houseId
     * @returns {string} CSS variable declarations
     */
    toCSSVars(houseId) {
        const p = this[houseId];
        if (!p) return '';
        return [
            `--house-primary: ${p.primary}`,
            `--house-secondary: ${p.secondary}`,
            `--house-glow: ${p.glow}`,
            `--house-bg: ${p.bg}`,
            `--house-border: ${p.border}`
        ].join('; ');
    },

    /**
     * List all house IDs (excludes utility methods).
     * @returns {string[]}
     */
    ids() {
        return Object.keys(this).filter(k => typeof this[k] === 'object');
    }
};
