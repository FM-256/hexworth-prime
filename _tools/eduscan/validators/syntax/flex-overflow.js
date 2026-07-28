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

        // Pass 1: collect every selector with a scrollable overflow declaration.
        // FLEX-001's premise is "children with overflow-y:auto will clip/expand" --
        // if NO scrollable descendant exists, the missing min-height:0 is inert and
        // flagging it is noise (marathon 2026-07-28 FP class: obs teaser text rows,
        // eth .image-placeholder with a deliberate min-height:120px; task #228 item 4).
        const scrollableSelectors = [];
        for (const block of cssBlocks) {
            const scanRE = /([^{}]+)\{([^}]*)\}/g;
            let m;
            while ((m = scanRE.exec(block.css)) !== null) {
                if (/overflow(?:-y)?\s*:\s*(?:auto|scroll)/.test(m[2])) {
                    scrollableSelectors.push(m[1].trim());
                }
            }
        }

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

                // Require an actual scrollable DESCENDANT, via either evidence path:
                //  (a) CSS ancestry -- a scrollable selector names this container's
                //      token as an ancestor ('.explorer-panel .list');
                //  (b) HTML nesting -- an element carrying a scroll-classed class sits
                //      INSIDE an element carrying this container's class in the markup
                //      (real CSS usually styles children by their own class, invisible
                //      to selector-ancestry analysis -- the fixture's .terminal-area/
                //      .terminal-output pair is exactly this shape).
                // Without either, the missing min-height:0 is inert and flagging it is
                // noise (task #228 item 4 FP class).
                const tokens = (selector.match(/[.#][A-Za-z0-9_-]+/g) || []);
                // EXACT selector-token matching, same discipline as _nestedInMarkup:
                // String.includes let '.card' "match" '.card-scroll-wrap' (Chris's
                // tranche-2b probes) -- the identical hyphen-collision class Nancy
                // fixed on the HTML-nesting path. Ancestry = the scrollable selector
                // contains the container's token as a WHOLE compound token AND has
                // more to it than that token alone (a descendant part).
                const cssAncestry = tokens.length > 0 && scrollableSelectors.some((ss) => {
                    if (ss === selector) return false;
                    const ssTokens = (ss.match(/[.#][A-Za-z0-9_-]+/g) || []);
                    return tokens.some((t) => ssTokens.indexOf(t) !== -1) && ss.trim() !== tokens.join('');
                });
                const scrollClasses = scrollableSelectors
                    .map((ss) => { const m2 = ss.match(/\.([A-Za-z0-9_-]+)\s*$/); return m2 ? m2[1] : null; })
                    .filter(Boolean);
                const containerClasses = tokens.filter((t) => t[0] === '.').map((t) => t.slice(1));
                const htmlNesting = containerClasses.some((cc) =>
                    scrollClasses.some((sc) => this._nestedInMarkup(content, cc, sc)));
                if (!cssAncestry && !htmlNesting) continue;

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
     * Whether any element with class `innerClass` appears INSIDE an element with
     * class `outerClass` in the static markup. Lightweight tag-depth walk (void
     * elements and malformed nesting degrade gracefully to depth drift, which at
     * worst widens the search window -- acceptable for an FP-suppression signal).
     */
    _nestedInMarkup(html, outerClass, innerClass) {
        // Exact class-LIST-token matching. NOT regex \b: '-' is a non-word char,
        // so \b-based matching let 'terminal-area' match inside
        // 'custom-terminal-area-box' -- a proven MASKING pathway (Nancy, tranche
        // 2b review) since hyphenated classes are the platform norm.
        const hasClassToken = (tag, cls) => {
            const m = tag.match(/class=["']([^"']*)["']/);
            return !!m && m[1].split(/\s+/).indexOf(cls) !== -1;
        };
        const openRE = /<([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
        let om;
        while ((om = openRE.exec(html)) !== null) {
            if (/^<\//.test(om[0]) || !hasClassToken(om[0], outerClass)) continue;
            let depth = 1;
            const tagRE = /<\/?[a-zA-Z][a-zA-Z0-9-]*(?:[^>"']|"[^"]*"|'[^']*')*>/g;
            tagRE.lastIndex = om.index + om[0].length;
            let tm;
            while (depth > 0 && (tm = tagRE.exec(html)) !== null) {
                const tag = tm[0];
                if (/^<\//.test(tag)) { depth--; continue; }
                if (/\/>$/.test(tag) || /^<(br|img|input|meta|link|hr|source|track|wbr|area|base|col|embed)\b/i.test(tag)) {
                    // void/self-closing: no depth change
                } else { depth++; }
                if (hasClassToken(tag, innerClass)) return true;
            }
        }
        return false;
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
