/**
 * EduScan - UX Validator
 *
 * Detects potential user-experience issues in interactive modules.
 * UX issues are heuristic — they flag patterns that MIGHT cause problems
 * and require human review to confirm. Severity is always 'suspect'.
 *
 * Rule codes:
 *   UX-001  (suspect)  Dynamic visual element insertion without viewport scroll
 *
 * Background:
 *   When a large visual element (canvas, video, iframe) is dynamically created
 *   and inserted into the DOM, it can push existing content below the fold.
 *   If the code doesn't scroll the new element into view, the user misses
 *   the content they triggered (e.g., a turtle animation appearing off-screen).
 *
 *   Detection scope: each <script> block is analyzed independently.
 *   A script block that creates a visual element AND inserts it into the DOM
 *   WITHOUT a scrollIntoView call in the same block gets flagged.
 */

'use strict';

// ── Detection patterns ──────────────────────────────────────────────

/**
 * Visual element creation via createElement().
 * Catches: createElement('canvas'), createElement("video"), etc.
 */
const VISUAL_CREATE_RE = /createElement\s*\(\s*['"](?:canvas|video|iframe)['"]\s*\)/;

/**
 * Visual element injected via innerHTML or template literal.
 * Catches: innerHTML = '<canvas ...', innerHTML = `<video ...`, etc.
 * The ['"`] covers single quotes, double quotes, and backticks.
 */
const VISUAL_HTML_RE = /\.innerHTML\s*=\s*['"`][^;]*<(?:canvas|video|iframe)\b/;

/**
 * DOM insertion methods that add an element to the live document.
 * Catches: .insertBefore(), .appendChild(), .append(), .prepend()
 * The word-boundary-style check prevents matching unrelated methods
 * like .appendData() while still catching both .appendChild() and .append().
 */
const DOM_INSERT_RE = /\.(?:insertBefore|appendChild|append|prepend)\s*\(/;

/**
 * The fix we're looking for — scrollIntoView anywhere in the same block
 * indicates the developer handled viewport positioning.
 */
const SCROLL_FIX_RE = /scrollIntoView/;

// ── Validator class ─────────────────────────────────────────────────

class UXValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.rootPath = options.rootPath || './_app';
        this.profile = options.profile || 'ci';
    }

    /**
     * Validate a single file for UX issues.
     * @param {Object} file - { path, content }
     * @returns {Array} Array of issue objects (may be empty)
     */
    validate(file) {
        const issues = [];
        if (!file.content) return issues;

        issues.push(...this._checkDynamicInsertWithoutScroll(file));

        return issues;
    }

    /**
     * UX-001: Dynamic visual element insertion without viewport scroll.
     *
     * Scans each <script> block for a three-part pattern:
     *   1. Visual element creation  (createElement('canvas') or innerHTML with <canvas>)
     *   2. DOM insertion             (insertBefore, appendChild, append, prepend)
     *   3. Missing scrollIntoView    (no scroll call in the same script block)
     *
     * If all three conditions are met, the element likely appears off-screen
     * when triggered by a user action (e.g., clicking "Run").
     *
     * @param {Object} file - { path, content }
     * @returns {Array} Issues found
     */
    _checkDynamicInsertWithoutScroll(file) {
        const issues = [];
        const content = file.content;

        // Extract <script> blocks from HTML content
        const scriptBlockRE = /<script[^>]*>([\s\S]*?)<\/script>/gi;
        let blockMatch;

        while ((blockMatch = scriptBlockRE.exec(content)) !== null) {
            const scriptBody = blockMatch[1];
            if (!scriptBody.trim()) continue;

            // ── Step 1: Does this block create a visual element? ─────
            const hasVisualCreate = VISUAL_CREATE_RE.test(scriptBody)
                                 || VISUAL_HTML_RE.test(scriptBody);
            if (!hasVisualCreate) continue;

            // ── Step 2: Does this block insert into the DOM? ─────────
            const insertMatch = scriptBody.match(DOM_INSERT_RE);
            if (!insertMatch) continue;

            // ── Step 3: Does this block scroll the element into view? ─
            if (SCROLL_FIX_RE.test(scriptBody)) continue;

            // ── All three conditions met — flag for human review ─────
            // Calculate the line number of the insertion call within
            // the full file (not just the script block).
            const openTagEnd = blockMatch[0].indexOf('>') + 1;
            const scriptBodyStart = blockMatch.index + openTagEnd;
            const insertLine = this._getLineNumber(content, scriptBodyStart + insertMatch.index);

            issues.push({
                code: 'UX-001',
                severity: 'suspect',
                category: 'ux',
                message: 'Dynamic visual element inserted into DOM without scrollIntoView — '
                       + 'content may appear off-screen after user action',
                file: file.path,
                line: insertLine,
                fix: 'Add element.scrollIntoView({ behavior: "smooth", block: "center" }) after insertion'
            });
        }

        return issues;
    }

    /**
     * Convert a character offset to a 1-based line number.
     * @param {string} content - Full file content
     * @param {number} offset  - Character position (0-based)
     * @returns {number} 1-based line number
     */
    _getLineNumber(content, offset) {
        return content.substring(0, offset).split('\n').length;
    }
}

module.exports = UXValidator;
