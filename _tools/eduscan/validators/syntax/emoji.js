/**
 * EduScan - Emoji Validator
 *
 * Detects "orphan emoji" in UI-visible positions — emoji that should have
 * been replaced with icon images but were missed. Covers JS property
 * definitions (icon:), HTML badge/icon elements, inline UI patterns,
 * and raw emoji in any JS/HTML file across the entire codebase.
 *
 * Rule codes:
 *   EMOJI-001  (low)     Emoji in icon: JS property
 *   EMOJI-002  (low)     Emoji in HTML badge/header icon elements
 *   EMOJI-003  (warning) Emoji in inline HTML near known UI patterns
 *   EMOJI-004  (medium)  Emoji in hero/emblem container (should be <img>)
 *   EMOJI-005  (low)     Raw emoji in JS string literal or HTML content
 *   EMOJI-006  (medium)  Escaped Unicode emoji in HTML <script> block icon: property
 */

const fs = require('fs');
const path = require('path');

// Emoji detection — covers common ranges (extended to catch more)
const EMOJI_CHAR_RE = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{2B50}\u{2692}-\u{2699}\u{FE00}-\u{FE0F}\u{200D}\u{2702}-\u{27B0}\u{1FA00}-\u{1FAFF}\u{231A}-\u{231B}\u{23E9}-\u{23FA}\u{2934}-\u{2935}]/u;
const EMOJI_CHAR_GLOBAL_RE = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{2B50}\u{2692}-\u{2699}\u{FE00}-\u{FE0F}\u{200D}\u{2702}-\u{27B0}\u{1FA00}-\u{1FAFF}\u{231A}-\u{231B}\u{23E9}-\u{23FA}\u{2934}-\u{2935}]/gu;

// Excluded functional symbols: checkmarks, arrows, variation selectors, geometric shapes
const EXCLUDED_CHARS = new Set([
    '\u2713', '\u2714', '\u2717', '\u2718', // ✓ ✔ ✗ ✘
    '\u2705', '\u274C', '\u274E',           // ✅ ❌ ❎
    '\u2192', '\u2190', '\u2191', '\u2193', // → ← ↑ ↓
    '\uFE0E', '\uFE0F',                     // variation selectors (text/emoji)
    '\u200D',                                // zero-width joiner
    // Geometric shapes used as UI elements (dropdown arrows, bullets, etc.)
    '\u25BC', '\u25B8', '\u25CB', '\u25CF', // ▼ ▸ ○ ●
    '\u25BA', '\u25B2', '\u25AA', '\u25BE', // ► ▲ ▪ ▾
    '\u25B9', '\u25C0', '\u25C4', '\u25B3', // ▹ ◀ ◄ △
    '\u25C6', '\u25C7', '\u25C8', '\u25C9', // ◆ ◇ ◈ ◉
    '\u25CE', '\u25EF', '\u25D0', '\u25C1', // ◎ ◯ ◐ ◁
    '\u25EB', '\u25E2', '\u25FB', '\u25B6', // ◫ ◢ ◻ ▶
    '\u25B7', '\u25BD', '\u25BF',           // ▷ ▽ ▿
    // Stars/decorative shapes used as text
    '\u2605', '\u2606', '\u2726', '\u2727',  // ★ ☆ ✦ ✧
    '\u2756', '\u2734',                       // ❖ ✴
    // Hearts used as text
    '\u2665', '\u2661',                       // ♥ ♡
    // Ballot/checkbox
    '\u2610', '\u2611', '\u2612',             // ☐ ☑ ☒
    '\u2715',                                 // ✕ (multiplication/close)
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

// JS directories to scan in the global pass (all .js files found recursively)
const GLOBAL_JS_DIRS = [
    'components',
    'config',
    'utils',
    'digital-life',
    'workshop'
];

// Additional specific files (non-JS)
const GLOBAL_EXTRA_FILES = [
    'dashboard.html',
    'games.html',
    'terminal.html',
    'career-quiz.html'
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
        this.iconImages = this.loadImageNames('assets/images/icons');

        // Discover all JS files to scan globally
        this.globalJSFiles = this.discoverGlobalFiles();
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

    /**
     * Discover all JS files to scan globally from configured directories
     */
    discoverGlobalFiles() {
        const files = [];
        for (const dir of GLOBAL_JS_DIRS) {
            const absDir = path.resolve(this.rootPath, dir);
            try {
                this.walkDir(absDir, (filePath) => {
                    if (filePath.endsWith('.js')) {
                        files.push(path.relative(this.rootPath, filePath));
                    }
                });
            } catch {
                // Directory may not exist
            }
        }
        for (const f of GLOBAL_EXTRA_FILES) {
            const abs = path.resolve(this.rootPath, f);
            if (fs.existsSync(abs)) files.push(f);
        }
        return files;
    }

    /**
     * Recursively walk a directory tree
     */
    walkDir(dir, callback) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (entry.name === 'node_modules' || entry.name === '.git') continue;
                this.walkDir(fullPath, callback);
            } else {
                callback(fullPath);
            }
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
     * EMOJI-001: Raw emoji in icon: JS property inside <script> blocks
     * EMOJI-006: Escaped Unicode emoji (\uXXXX or \u{XXXXX}) in icon: property
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
                const hasRawEmoji = EMOJI_RE.test(value);
                const hasEscapedEmoji = UNICODE_ESCAPE_RE.test(value);

                if (!hasRawEmoji && !hasEscapedEmoji) continue;
                if (this.isInsideOnerror(content, scriptStart + iconMatch.index)) continue;

                const line = this.getLineNumber(content, scriptStart + iconMatch.index);

                if (hasEscapedEmoji) {
                    // EMOJI-006: escaped Unicode — higher severity, harder to spot
                    issues.push({
                        code: 'EMOJI-006',
                        severity: 'medium',
                        category: 'emoji',
                        message: `Escaped Unicode emoji in icon: property — replace with icon image path`,
                        file: filePath,
                        line,
                        fix: this.suggestIconFix(value)
                    });
                } else {
                    // EMOJI-001: raw emoji character
                    const emoji = this.extractEmoji(value);
                    issues.push({
                        code: 'EMOJI-001',
                        severity: 'low',
                        category: 'emoji',
                        message: `Emoji icon "${emoji}" in JS property — replace with icon image path`,
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
     * Scan all JS/HTML config files for emoji in icon properties and raw strings.
     * Called once by the orchestrator (not per-file).
     * Dynamically discovers files from components/, config/, utils/, etc.
     * @returns {Array} Issues found
     */
    validateGlobal() {
        const issues = [];
        const filesScanned = this.globalJSFiles;

        for (const relPath of filesScanned) {
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

            // EMOJI-001: Scan for icon: 'emoji' patterns
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
                        message: `Emoji icon "${emoji}" in JS property — replace with icon image path`,
                        file: relPath,
                        line,
                        fix: this.suggestIconFix(value)
                    });
                }
            }

            // EMOJI-002: Check template literals for emoji in badge/icon elements
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
                        fix: this.suggestIconFix(innerText)
                    });
                }
            }

            // EMOJI-005: Raw emoji anywhere in JS string literals or HTML content
            // Scan for any remaining emoji characters in the file
            if (relPath.endsWith('.js')) {
                issues.push(...this.checkRawEmoji(content, relPath));
            }
        }

        if (this.verbose && issues.length > 0) {
            console.log(`[EMOJI] Global scan: ${issues.length} issues across ${filesScanned.length} files`);
        }

        return issues;
    }

    /**
     * EMOJI-005: Detect raw emoji anywhere in a file (broad catch-all).
     * Scans line by line, reports first occurrence per line to avoid noise.
     */
    checkRawEmoji(content, filePath) {
        const issues = [];
        const seenLines = new Set(); // deduplicate by line number
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (hasEmoji(line)) {
                const lineNum = i + 1;
                if (seenLines.has(lineNum)) continue;
                seenLines.add(lineNum);

                // Skip comment-only lines
                const trimmed = line.trim();
                if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;

                const emoji = this.extractEmoji(line);
                issues.push({
                    code: 'EMOJI-005',
                    severity: 'low',
                    category: 'emoji',
                    message: `Raw emoji "${emoji}" in JS source — replace with icon image`,
                    file: filePath,
                    line: lineNum,
                    fix: this.suggestIconFix(line)
                });
            }
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

        return 'Replace with <img src="/assets/images/icons/icon-*.webp"> from icon library';
    }

    /**
     * Suggest icon library replacement
     */
    suggestIconFix(emojiContext) {
        if (this.iconImages.length > 0) {
            return `Replace with path from /assets/images/icons/ (${this.iconImages.length} icons available)`;
        }
        return 'Replace with <img src="/assets/images/icons/icon-*.webp"> from icon library';
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
