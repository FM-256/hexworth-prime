/**
 * EduScan - House Palette Validator
 *
 * Validates that house index pages use the correct CSS custom property values
 * as defined in the official house-palette.js (single source of truth).
 *
 * Checks --house-primary, --house-secondary, --house-glow, --house-bg,
 * --house-border values in :root blocks against the canonical palette.
 *
 * Issue codes:
 * - PALETTE-001: CSS variable value doesn't match official palette (HIGH)
 * - PALETTE-002: Missing required CSS variable in house page (MEDIUM)
 * - PALETTE-003: House page missing :root color block entirely (HIGH)
 *
 * Created: 2026-02-27
 */

const fs = require('fs');
const path = require('path');

// Official palette — mirrors _app/config/house-palette.js
const OFFICIAL_PALETTE = {
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
        glow: 'rgba(107, 33, 168, 0.3)',
        bg: 'rgba(107, 33, 168, 0.05)',
        border: 'rgba(107, 33, 168, 0.25)'
    },
    ai: {
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        glow: 'rgba(139, 92, 246, 0.3)',
        bg: 'rgba(139, 92, 246, 0.05)',
        border: 'rgba(139, 92, 246, 0.2)'
    }
};

const REQUIRED_VARS = ['primary', 'secondary', 'glow', 'bg', 'border'];

class PaletteValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.rootPath = options.rootPath || './_app';
        // appRoot: the APP ROOT (holds components/, config/, houses/, arctic/). Fixed regardless
        // of which subtree a scan walks; defaults to rootPath so full scans are unchanged.
        // App-wide assets resolved against a scan subtree either vanish (silently disabling the
        // check) or fabricate findings. See _tools/eduscan/index.js for the 2026-08-04 incident.
        this.appRoot = options.appRoot || this.rootPath;
    }

    /**
     * Global validation — scans all house index pages.
     * @returns {{ issues: Array, summary: Object }}
     */
    validate() {
        const issues = [];
        const houseDirs = Object.keys(OFFICIAL_PALETTE);

        for (const houseId of houseDirs) {
            const indexPath = path.resolve(this.appRoot, 'houses', houseId, 'index.html');

            if (!fs.existsSync(indexPath)) {
                if (this.verbose) {
                    console.log(`[PALETTE] Skipping ${houseId}: no index.html`);
                }
                continue;
            }

            const content = fs.readFileSync(indexPath, 'utf8');
            const relPath = `houses/${houseId}/index.html`;
            const extracted = this.extractCSSVars(content);

            if (!extracted) {
                issues.push({
                    code: 'PALETTE-003',
                    severity: 'high',
                    category: 'palette',
                    message: `House page missing :root color block: ${relPath}`,
                    file: relPath,
                    fix: `Add :root { --house-primary: ${OFFICIAL_PALETTE[houseId].primary}; ... } to <style>`
                });
                continue;
            }

            const expected = OFFICIAL_PALETTE[houseId];

            for (const varName of REQUIRED_VARS) {
                const cssVar = `--house-${varName}`;
                const actual = extracted[cssVar];

                if (!actual) {
                    issues.push({
                        code: 'PALETTE-002',
                        severity: 'medium',
                        category: 'palette',
                        message: `Missing ${cssVar} in ${relPath}`,
                        file: relPath,
                        fix: `Add ${cssVar}: ${expected[varName]};`
                    });
                    continue;
                }

                // Normalize whitespace for comparison
                const normalizedActual = actual.replace(/\s+/g, ' ').trim();
                const normalizedExpected = expected[varName].replace(/\s+/g, ' ').trim();

                if (normalizedActual !== normalizedExpected) {
                    issues.push({
                        code: 'PALETTE-001',
                        severity: 'high',
                        category: 'palette',
                        message: `${cssVar} mismatch in ${relPath}: got "${normalizedActual}", expected "${normalizedExpected}"`,
                        file: relPath,
                        fix: `Change ${cssVar}: ${normalizedActual} → ${normalizedExpected}`
                    });
                }
            }
        }

        if (this.verbose) {
            console.log(`[PALETTE] Checked ${houseDirs.length} houses, found ${issues.length} issues`);
        }

        return {
            issues,
            summary: {
                housesChecked: houseDirs.length,
                issuesFound: issues.length
            }
        };
    }

    /**
     * Extract CSS custom properties from a :root block.
     * @param {string} content - HTML file content
     * @returns {Object|null} Map of CSS variable name → value, or null if no :root block
     */
    extractCSSVars(content) {
        // Match :root { ... } block (may be inside <style> tags)
        const rootMatch = content.match(/:root\s*\{([^}]+)\}/);
        if (!rootMatch) return null;

        const block = rootMatch[1];
        const vars = {};

        // Extract each --house-* declaration
        const regex = /(--house-\w+)\s*:\s*([^;]+);/g;
        let match;
        while ((match = regex.exec(block)) !== null) {
            vars[match[1]] = match[2].trim();
        }

        return Object.keys(vars).length > 0 ? vars : null;
    }
}

module.exports = PaletteValidator;
