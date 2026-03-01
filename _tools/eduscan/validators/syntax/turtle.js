/**
 * EduScan - Turtle Validator
 *
 * Detects CSS and HTML patterns that break Skulpt turtle graphics rendering.
 *
 * Rule codes:
 *   TURTLE-001  (high)    Opaque background on Skulpt canvas children
 *   TURTLE-002  (medium)  Textarea default code with leading whitespace
 *
 * Background:
 *   Skulpt's turtle module creates a stack of internal canvases (bg z-1,
 *   drawing z-2, sprite z-3). If page CSS applies an opaque background to
 *   `.turtle-canvas-container canvas`, the sprite layer hides the drawing
 *   layer — the turtle cursor appears but no lines are visible.
 *
 *   Textarea content in HTML templates inherits the template's indentation.
 *   Python (and Skulpt) treats unexpected leading whitespace as a syntax
 *   error. TurtleCanvas._dedent() handles this at runtime, but the source
 *   should still be clean.
 */

'use strict';

// ── Detection patterns ──────────────────────────────────────────────

/**
 * Matches a CSS selector targeting canvas children of .turtle-canvas-container.
 * Captures the declaration block so we can inspect for background properties.
 */
const TURTLE_CANVAS_SELECTOR_RE = /\.turtle-canvas-container\s+canvas\s*\{([^}]*)\}/g;

/**
 * Matches a background property that is NOT transparent or none.
 * We look for `background:` or `background-color:` with a value that
 * isn't `transparent` or `none`.
 */
const OPAQUE_BG_RE = /background(?:-color)?\s*:\s*(?!transparent|none)([^;]+)/i;

/**
 * Turtle-related keywords that identify a textarea as containing turtle code.
 */
const TURTLE_KEYWORDS_RE = /(?:import\s+turtle|forward|backward|turtle\.forward|turtle\.backward|\.forward\(|\.backward\(|\.right\(|\.left\()/;

/**
 * Matches <textarea> tags and captures their content.
 * Non-greedy to handle multiple textareas.
 */
const TEXTAREA_RE = /<textarea[^>]*>([\s\S]*?)<\/textarea>/gi;

// ── Validator class ─────────────────────────────────────────────────

class TurtleValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.rootPath = options.rootPath || './_app';
        this.profile = options.profile || 'ci';
    }

    /**
     * Validate a single file for turtle-related issues.
     * @param {Object} file - { path, content }
     * @returns {Array} Array of issue objects (may be empty)
     */
    validate(file) {
        const issues = [];
        if (!file.content) return issues;

        issues.push(...this._checkOpaqueCanvasBackground(file));
        issues.push(...this._checkTextareaIndent(file));

        return issues;
    }

    /**
     * TURTLE-001: Opaque background on .turtle-canvas-container canvas.
     *
     * Scans <style> blocks for CSS rules that apply a non-transparent
     * background to `.turtle-canvas-container canvas`. This makes all
     * Skulpt internal canvases opaque, hiding the drawing layer (z-2)
     * behind the sprite layer (z-3).
     *
     * @param {Object} file - { path, content }
     * @returns {Array} Issues found
     */
    _checkOpaqueCanvasBackground(file) {
        const issues = [];
        const content = file.content;

        // Extract <style> blocks
        const styleBlockRE = /<style[^>]*>([\s\S]*?)<\/style>/gi;
        let styleMatch;

        while ((styleMatch = styleBlockRE.exec(content)) !== null) {
            const styleBody = styleMatch[1];
            if (!styleBody.trim()) continue;

            // Look for .turtle-canvas-container canvas { ... }
            let selectorMatch;
            TURTLE_CANVAS_SELECTOR_RE.lastIndex = 0;

            while ((selectorMatch = TURTLE_CANVAS_SELECTOR_RE.exec(styleBody)) !== null) {
                const declarations = selectorMatch[1];

                // Check if it has an opaque background
                if (OPAQUE_BG_RE.test(declarations)) {
                    // Calculate line number within the full file
                    const matchStart = styleMatch.index + styleMatch[0].indexOf(selectorMatch[0]);
                    const line = this._getLineNumber(content, matchStart);

                    issues.push({
                        code: 'TURTLE-001',
                        severity: 'high',
                        category: 'turtle',
                        message: 'Opaque background on .turtle-canvas-container canvas — '
                               + 'hides Skulpt drawing layer behind sprite layer',
                        file: file.path,
                        line: line,
                        fix: 'Remove background from .turtle-canvas-container canvas, '
                           + 'or use background: transparent. The container div provides the dark background.'
                    });
                }
            }
        }

        return issues;
    }

    /**
     * TURTLE-002: Textarea default code with leading whitespace.
     *
     * Scans <textarea> tags whose content contains turtle keywords and
     * checks if the non-empty lines have a common leading indent > 0.
     * This indicates HTML template indentation leaking into code content.
     *
     * @param {Object} file - { path, content }
     * @returns {Array} Issues found
     */
    _checkTextareaIndent(file) {
        const issues = [];
        const content = file.content;

        let textareaMatch;
        TEXTAREA_RE.lastIndex = 0;

        while ((textareaMatch = TEXTAREA_RE.exec(content)) !== null) {
            const body = textareaMatch[1];
            if (!body.trim()) continue;

            // Only check textareas that contain turtle code
            if (!TURTLE_KEYWORDS_RE.test(body)) continue;

            // Calculate common indent of non-empty lines
            const lines = body.split('\n');
            let minIndent = Infinity;

            for (const line of lines) {
                if (line.trim() === '') continue;
                const match = line.match(/^(\s*)/);
                if (match && match[1].length < minIndent) {
                    minIndent = match[1].length;
                }
            }

            if (minIndent > 0 && minIndent !== Infinity) {
                const line = this._getLineNumber(content, textareaMatch.index);

                issues.push({
                    code: 'TURTLE-002',
                    severity: 'medium',
                    category: 'turtle',
                    message: `Textarea turtle code has ${minIndent}-char common indent from HTML template — `
                           + 'may cause Python indentation errors',
                    file: file.path,
                    line: line,
                    fix: 'Dedent the textarea content so code starts at column 0, '
                       + 'or use white-space: pre with properly left-aligned code.'
                });
            }
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

module.exports = TurtleValidator;
