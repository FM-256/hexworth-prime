/**
 * EduScan - Emoji Validator
 *
 * Detects "orphan emoji" in UI-visible positions — emoji that should have
 * been replaced with category/emblem images but were missed. Covers JS
 * property definitions (icon:), HTML badge/icon elements, and inline UI
 * patterns like path-meta and module-duration.
 *
 * Rule codes:
 *   EMOJI-001  (low)     Emoji in icon: JS property
 *   EMOJI-002  (low)     Emoji in HTML badge/header icon elements
 *   EMOJI-003  (warning) Emoji in inline HTML near known UI patterns
 *   EMOJI-004  (medium)  Emoji in hero/emblem container (should be <img>)
 */

const fs = require('fs');
const path = require('path');

// Emoji detection — covers common ranges
const EMOJI_CHAR_RE = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{2B50}\u{2692}-\u{2699}\u{FE00}-\u{FE0F}\u{200D}\u{2702}-\u{27B0}]/u;
const EMOJI_CHAR_GLOBAL_RE = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{2B50}\u{2692}-\u{2699}\u{FE00}-\u{FE0F}\u{200D}\u{2702}-\u{27B0}]/gu;

// Excluded functional symbols: checkmarks (✓✗✅❌), arrows (→←↑↓), variation selectors
const EXCLUDED_CHARS = new Set([
    '\u2713', '\u2714', '\u2717', '\u2718', // ✓ ✔ ✗ ✘
    '\u2705', '\u274C', '\u274E',           // ✅ ❌ ❎
    '\u2192', '\u2190', '\u2191', '\u2193', // → ← ↑ ↓
    '\uFE0E', '\uFE0F',                     // variation selectors (text/emoji)
    '\u200D',                                // zero-width joiner (only meaningful with other emoji)
]);

/** Test if a string contains a real (non-excluded) emoji */
function hasEmoji(str) {
    const matches = str.match(EMOJI_CHAR_GLOBAL_RE);
    if (!matches) return false;
    return matches.some(ch => !EXCLUDED_CHARS.has(ch));
}

/** Alias for the old simple test, used in quick checks */
const EMOJI_RE = { test: (str) => hasEmoji(str) };
const EMOJI_GLOBAL_RE = EMOJI_CHAR_GLOBAL_RE;

// Unicode escape patterns used in JS source (surrogate pairs and \u{} syntax)
const UNICODE_ESCAPE_RE = /\\u[Dd][89AaBb][0-9A-Fa-f]{2}|\\u\{1[Ff][0-9A-Fa-f]{3}\}/;

// JS files to scan in the global pass
const GLOBAL_JS_FILES = [
    'config/content-registry.js',
    'components/LearningPaths.js',
    'dashboard.html',
    'components/AchievementSystem.js',
    'components/ContentDiscovery.js'
];

// UI container classes that indicate visible emoji (EMOJI-003)
const UI_CONTAINER_CLASSES = [
    'path-meta',
    'module-duration',
    'component-badge',
    'profile-stat-icon',
    'stat-icon'
];

// Hero/emblem container classes that should use <img> not emoji (EMOJI-004)
const HERO_ICON_CLASSES = [
    'course-icon',
    'hero-icon',
    'hero-logo',
    'welcome-icon',
    'module-icon',
    'review-icon',
    'district-hero-icon'
];

class EmojiValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.rootPath = options.rootPath || './_app';
        this.profile = options.profile || 'ci';

        // Load available replacement images at startup
        this.categoryImages = this.loadImageNames('assets/images/categories');
        this.emblemImages = this.loadImageNames('assets/images/emblems');
    }

    /**
     * Load image filenames (without extension) from a directory
     */
    loadImageNames(relDir) {
        const absDir = path.resolve(this.rootPath, relDir);
        try {
            return fs.readdirSync(absDir)
                .filter(f => /\.(webp|png|svg)$/i.test(f))
                .map(f => f.replace(/\.[^.]+$/, ''));
        } catch {
            return [];
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // PER-FILE VALIDATION (HTML files)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Validate a single HTML file for orphan emoji
     * @param {Object} file - { path, content }
     * @returns {Array} Issues found
     */
    validate(file) {
        const issues = [];
        const content = file.content;
        const filePath = file.path;

        issues.push(...this.checkScriptBlocks(content, filePath));
        issues.push(...this.checkBadgeIcons(content, filePath));
        issues.push(...this.checkUIContainers(content, filePath));
        issues.push(...this.checkHeroIcons(content, filePath));

        return issues;
    }

    /**
     * EMOJI-001: Emoji in icon: JS property inside <script> blocks
     */
    checkScriptBlocks(content, filePath) {
        const issues = [];
        const scriptRe = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
        let scriptMatch;

        while ((scriptMatch = scriptRe.exec(content)) !== null) {
            const scriptBody = scriptMatch[1];
            const scriptStart = scriptMatch.index;

            // Match icon: 'value' or icon: "value" patterns
            const iconPropRe = /icon\s*:\s*(['"])(.*?)\1/g;
            let iconMatch;

            while ((iconMatch = iconPropRe.exec(scriptBody)) !== null) {
                const value = iconMatch[2];
                if (EMOJI_RE.test(value) || UNICODE_ESCAPE_RE.test(value)) {
                    // Skip if inside an onerror attribute
                    if (this.isInsideOnerror(content, scriptStart + iconMatch.index)) continue;

                    const emoji = this.extractEmoji(value);
                    const line = this.getLineNumber(content, scriptStart + iconMatch.index);
                    issues.push({
                        code: 'EMOJI-001',
                        severity: 'low',
                        category: 'emoji',
                        message: `Emoji icon "${emoji}" in JS property — replace with category/emblem image`,
                        file: filePath,
                        line,
                        fix: this.suggestFix(filePath, value)
                    });
                }
            }
        }

        return issues;
    }

    /**
     * EMOJI-002: Emoji in HTML badge/icon elements
     * Matches badge-icon, tab-icon, house-badge-icon, path-icon class spans
     */
    checkBadgeIcons(content, filePath) {
        const issues = [];
        const badgeRe = /class="[^"]*(?:badge-icon|tab-icon|path-icon|house-badge-icon)[^"]*"[^>]*>([^<]*)/gi;
        let match;

        while ((match = badgeRe.exec(content)) !== null) {
            const innerText = match[1];
            if (EMOJI_RE.test(innerText)) {
                if (this.isInsideOnerror(content, match.index)) continue;

                const emoji = this.extractEmoji(innerText);
                const line = this.getLineNumber(content, match.index);
                issues.push({
                    code: 'EMOJI-002',
                    severity: 'low',
                    category: 'emoji',
                    message: `Emoji "${emoji}" in badge/icon element — replace with <img> tag`,
                    file: filePath,
                    line,
                    fix: this.suggestFix(filePath, innerText)
                });
            }
        }

        return issues;
    }

    /**
     * EMOJI-003: Emoji near known UI container patterns
     */
    checkUIContainers(content, filePath) {
        const issues = [];
        const classPattern = UI_CONTAINER_CLASSES.map(c => c.replace(/-/g, '\\-')).join('|');
        const containerRe = new RegExp(
            `class="[^"]*(?:${classPattern})[^"]*"[^>]*>([^<]{0,100})`,
            'gi'
        );
        let match;

        while ((match = containerRe.exec(content)) !== null) {
            const innerText = match[1];
            if (EMOJI_RE.test(innerText)) {
                if (this.isInsideOnerror(content, match.index)) continue;

                const emoji = this.extractEmoji(innerText);
                const line = this.getLineNumber(content, match.index);
                issues.push({
                    code: 'EMOJI-003',
                    severity: 'warning',
                    category: 'emoji',
                    message: `Emoji "${emoji}" in UI container — replace with image or CSS icon`,
                    file: filePath,
                    line,
                    fix: this.suggestFix(filePath, innerText)
                });
            }
        }

        return issues;
    }

    /**
     * EMOJI-004: Emoji in hero/emblem containers (should be <img>)
     * Matches course-icon, hero-icon, hero-logo, welcome-icon, module-icon, etc.
     * These containers should use emblem images, not raw emoji.
     */
    checkHeroIcons(content, filePath) {
        const issues = [];
        const classPattern = HERO_ICON_CLASSES.map(c => c.replace(/-/g, '\\-')).join('|');
        // Match both class="hero-icon">emoji and class="hero-icon">&#12345; (HTML entities)
        const heroRe = new RegExp(
            `class="[^"]*(?:${classPattern})[^"]*"[^>]*>([^<]{0,100})`,
            'gi'
        );
        let match;

        while ((match = heroRe.exec(content)) !== null) {
            const innerText = match[1];
            // Check for real emoji chars or HTML numeric entities (&#128246; etc)
            const hasEmojiChar = EMOJI_RE.test(innerText);
            const hasHtmlEntity = /&#\d{4,6};/.test(innerText);
            if (!hasEmojiChar && !hasHtmlEntity) continue;
            if (this.isInsideOnerror(content, match.index)) continue;

            const emoji = hasEmojiChar ? this.extractEmoji(innerText) : innerText.trim();
            const line = this.getLineNumber(content, match.index);
            issues.push({
                code: 'EMOJI-004',
                severity: 'medium',
                category: 'emoji',
                message: `Emoji "${emoji}" in hero/emblem container — replace with <img src="/assets/images/emblems/...">`,
                file: filePath,
                line,
                fix: this.suggestFix(filePath, innerText)
            });
        }

        return issues;
    }

    // ═══════════════════════════════════════════════════════════════
    // GLOBAL VALIDATION (JS/HTML config files)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Scan key JS/HTML config files for emoji in icon properties.
     * Called once by the orchestrator (not per-file).
     * @returns {Array} Issues found
     */
    validateGlobal() {
        const issues = [];

        for (const relPath of GLOBAL_JS_FILES) {
            const absPath = path.resolve(this.rootPath, relPath);
            let content;
            try {
                content = fs.readFileSync(absPath, 'utf8');
            } catch {
                if (this.verbose) {
                    console.log(`[EMOJI] Skipping missing file: ${relPath}`);
                }
                continue;
            }

            // Scan for icon: 'emoji' patterns throughout the file
            const iconPropRe = /icon\s*:\s*(['"])(.*?)\1/g;
            let match;

            while ((match = iconPropRe.exec(content)) !== null) {
                const value = match[2];
                if (EMOJI_RE.test(value) || UNICODE_ESCAPE_RE.test(value)) {
                    if (this.isInsideOnerror(content, match.index)) continue;

                    const emoji = this.extractEmoji(value);
                    const line = this.getLineNumber(content, match.index);
                    issues.push({
                        code: 'EMOJI-001',
                        severity: 'low',
                        category: 'emoji',
                        message: `Emoji icon "${emoji}" in JS property — replace with category/emblem image`,
                        file: relPath,
                        line,
                        fix: this.suggestFix(relPath, value)
                    });
                }
            }

            // Also check for emoji in template literals: `...emoji...`
            // Target patterns like: <span class="...-icon">emoji</span> in template strings
            const templateBadgeRe = /class=(?:\\?["'])[^"']*(?:badge-icon|tab-icon|path-icon|stat-icon)[^"']*(?:\\?["'])[^>]*>([^<]{0,100})/gi;
            let tmplMatch;

            while ((tmplMatch = templateBadgeRe.exec(content)) !== null) {
                const innerText = tmplMatch[1];
                if (EMOJI_RE.test(innerText)) {
                    if (this.isInsideOnerror(content, tmplMatch.index)) continue;

                    const emoji = this.extractEmoji(innerText);
                    const line = this.getLineNumber(content, tmplMatch.index);
                    issues.push({
                        code: 'EMOJI-002',
                        severity: 'low',
                        category: 'emoji',
                        message: `Emoji "${emoji}" in badge/icon element — replace with <img> tag`,
                        file: relPath,
                        line,
                        fix: this.suggestFix(relPath, innerText)
                    });
                }
            }
        }

        if (this.verbose && issues.length > 0) {
            console.log(`[EMOJI] Global scan: ${issues.length} issues across ${GLOBAL_JS_FILES.length} files`);
        }

        return issues;
    }

    // ═══════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Check if a position is inside an onerror="..." attribute (intentional fallback)
     */
    isInsideOnerror(content, position) {
        // Look backwards from position for the nearest onerror= or class=
        const preceding = content.substring(Math.max(0, position - 200), position);
        // If the most recent attribute opener is onerror, this is a fallback
        const onerrorIdx = preceding.lastIndexOf('onerror=');
        if (onerrorIdx === -1) return false;
        // Make sure we haven't closed the attribute since then
        const afterOnerror = preceding.substring(onerrorIdx);
        const quotes = (afterOnerror.match(/["']/g) || []).length;
        // Odd quote count means we're still inside the attribute value
        return quotes % 2 === 1;
    }

    /**
     * Extract the first real (non-excluded) emoji character from a string for display
     */
    extractEmoji(str) {
        const matches = str.match(EMOJI_GLOBAL_RE);
        if (!matches) return str.trim().substring(0, 2);
        const real = matches.find(ch => !EXCLUDED_CHARS.has(ch));
        return real || str.trim().substring(0, 2);
    }

    /**
     * Suggest a replacement image based on file context
     */
    suggestFix(filePath, emojiContext) {
        // If inside a house directory, suggest that house's emblem
        const houseMatch = filePath.match(/houses\/([^/]+)/);
        if (houseMatch) {
            const house = houseMatch[1];
            if (this.emblemImages.includes(house)) {
                return `Replace with <img src="/assets/images/emblems/${house}.webp">`;
            }
        }

        // Try to match a category from the file path or nearby context
        const pathParts = filePath.toLowerCase().replace(/[^a-z0-9/]/g, '-').split('/');
        for (const part of pathParts) {
            if (this.categoryImages.includes(part)) {
                return `Replace with <img src="/assets/images/categories/${part}.webp">`;
            }
        }

        return 'Replace with appropriate <img src="/assets/images/categories/..."> or emblem image';
    }

    /**
     * Convert character offset to line number
     */
    getLineNumber(content, offset) {
        const before = content.substring(0, offset);
        return (before.match(/\n/g) || []).length + 1;
    }
}

module.exports = EmojiValidator;
