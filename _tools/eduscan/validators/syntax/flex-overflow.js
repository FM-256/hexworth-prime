/**
 * EduScan - Flex Overflow Validator
 *
 * Detects the classic flexbox overflow bug: a flex column container with
 * `flex: 1` that is missing `min-height: 0`. Without it, the container's
 * minimum size defaults to min-content, causing it to grow to fit all
 * child content instead of constraining and enabling scrolling.
 *
 * Rule codes:
 *   FLEX-001  (medium)  Flex column container with flex:1 missing min-height:0
 *
 * Background:
 *   In a CSS flexbox column layout, `flex: 1` makes an item fill available
 *   space. But the CSS spec says a flex item's minimum main size defaults
 *   to `min-content` — meaning it will grow to fit its content, defeating
 *   the purpose of `overflow-y: auto` on children.
 *
 *   Adding `min-height: 0` overrides this default and allows the flex item
 *   to shrink below its content height, enabling internal scroll.
 *
 *   This bug is especially common with terminal outputs, event logs, chat
 *   feeds, and other dynamic-content containers that grow over time.
 *
 *   Safe patterns that don't need min-height: 0:
 *   - `overflow: hidden` on the same rule (provides the constraint)
 *   - `max-height` on the same rule (explicit height cap)
 *   - `height: 100%` or explicit height (not relying on flex sizing)
 */

'use strict';

// ── Validator class ─────────────────────────────────────────────────

class FlexOverflowValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.rootPath = options.rootPath || './_app';
        this.profile = options.profile || 'ci';
    }

    /**
     * Validate a single file for flex overflow issues.
     * @param {Object} file - { path, content }
     * @returns {Array} Array of issue objects (may be empty)
     */
    validate(file) {
        const issues = [];
        if (!file.content) return issues;

        issues.push(...this._checkFlexColumnOverflow(file));

        return issues;
    }

    /**
     * FLEX-001: Flex column container with flex:1 missing min-height:0.
     *
     * Scans CSS rules in <style> blocks and JS template strings for
     * rules that combine:
     *   1. display: flex
     *   2. flex-direction: column
     *   3. flex: 1 (or flex-grow: 1)
     * Without any of these mitigations:
     *   - min-height: 0
     *   - overflow: hidden (or overflow-y: hidden)
     *   - max-height: <value>
     *   - height: <value> (explicit height, not min-height)
     *
     * @param {Object} file - { path, content }
     * @returns {Array} Issues found
     */
    _checkFlexColumnOverflow(file) {
        const issues = [];
        const content = file.content;

        // Extract CSS from <style> blocks and JS template strings
        const cssBlocks = this._extractCSSBlocks(content);

        for (const block of cssBlocks) {
            // Parse individual CSS rules from this block
            const ruleRE = /([^{}]+)\{([^}]*)\}/g;
            let ruleMatch;

            while ((ruleMatch = ruleRE.exec(block.css)) !== null) {
                const selector = ruleMatch[1].trim();
                const declarations = ruleMatch[2];

                // Skip if this looks like a media query or keyframe
                if (selector.startsWith('@')) continue;

                // Check: is this a flex column with flex: 1?
                const hasFlex = /\bflex\s*:\s*1\b/.test(declarations)
                             || /flex-grow\s*:\s*1/.test(declarations);
                const hasFlexDisplay = /display\s*:\s*flex/.test(declarations);
                const hasColumn = /flex-direction\s*:\s*column/.test(declarations);

                if (!hasFlex || !hasFlexDisplay || !hasColumn) continue;

                // Check for mitigations
                const hasMinHeight0 = /min-height\s*:\s*0/.test(declarations);
                const hasOverflowHidden = /overflow\s*:\s*hidden/.test(declarations)
                                       || /overflow-y\s*:\s*hidden/.test(declarations);
                const hasMaxHeight = /max-height\s*:/.test(declarations);
                const hasExplicitHeight = /(?:^|;|\s)height\s*:\s*(?!auto)/.test(declarations);

                if (hasMinHeight0 || hasOverflowHidden || hasMaxHeight || hasExplicitHeight) continue;

                // Calculate line number in the full file
                const ruleStart = block.offset + ruleMatch.index;
                const line = this._getLineNumber(content, ruleStart);

                issues.push({
                    code: 'FLEX-001',
                    severity: 'medium',
                    category: 'flex-overflow',
                    message: `Flex column container "${selector}" has flex:1 but missing min-height:0 — `
                           + 'children with overflow-y:auto will expand the page instead of scrolling',
                    file: file.path,
                    line: line,
                    fix: `Add min-height: 0 to ${selector} to allow flex children to scroll properly`
                });
            }
        }

        return issues;
    }

    /**
     * Extract CSS content from <style> blocks and JS template strings
     * containing CSS (identified by common CSS patterns).
     *
     * @param {string} content - Full file content
     * @returns {Array} Array of { css, offset } objects
     */
    _extractCSSBlocks(content) {
        const blocks = [];

        // <style> blocks in HTML
        const styleRE = /<style[^>]*>([\s\S]*?)<\/style>/gi;
        let styleMatch;
        while ((styleMatch = styleRE.exec(content)) !== null) {
            const openTagEnd = styleMatch[0].indexOf('>') + 1;
            blocks.push({
                css: styleMatch[1],
                offset: styleMatch.index + openTagEnd
            });
        }

        // JS template strings containing CSS (look for backtick strings with display: flex)
        // Match: `...display: flex...flex-direction: column...`
        const templateRE = /`([^`]*display\s*:\s*flex[^`]*)`/g;
        let tmplMatch;
        while ((tmplMatch = templateRE.exec(content)) !== null) {
            blocks.push({
                css: tmplMatch[1],
                offset: tmplMatch.index + 1
            });
        }

        return blocks;
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

module.exports = FlexOverflowValidator;
