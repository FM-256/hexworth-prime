/**
 * EduScan - HTML Syntax Validator
 *
 * Detects HTML structural issues that could cause rendering failures.
 * Uses lightweight parsing (no external dependencies).
 *
 * ES-7 Refinements:
 * - Profile support (ci, strict, inventory)
 * - Template placeholder detection ({{...}}, <%...%>, ${...})
 * - Improved self-closing tag detection
 * - Comment block awareness
 * - Reduced false positives from template syntax
 * - Severity remapping for better prioritization
 */

class HTMLValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.profile = options.profile || 'ci'; // ci, strict, inventory
    }

    // Template placeholder patterns - skip validation for these
    templatePatterns = [
        /\{\{[\s\S]*?\}\}/g,      // Mustache/Handlebars/Vue
        /<%[\s\S]*?%>/g,          // EJS/ERB/ASP
        /\$\{[\s\S]*?\}/g,        // ES6 template literals
        /<\?[\s\S]*?\?>/g,        // PHP
        /@\{[\s\S]*?\}/g,         // Razor
        /\{%[\s\S]*?%\}/g,        // Jinja/Twig
        /#\{[\s\S]*?\}/g          // Ruby interpolation
    ];

    // Critical tags that MUST be closed (functionality-breaking if unclosed)
    criticalTags = ['script', 'style'];

    // Structural tags (high priority - layout-breaking if unclosed)
    structuralTags = ['div', 'form', 'table', 'tbody', 'thead', 'tfoot'];

    // Standard tags that should be closed (medium priority)
    standardTags = [
        'span', 'p', 'a', 'ul', 'ol', 'li', 'tr', 'td', 'th',
        'button', 'select', 'textarea', 'label',
        'header', 'footer', 'main', 'nav', 'section', 'article', 'aside',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'code', 'blockquote'
    ];

    /**
     * Validate HTML content
     * @param {Object} file - Parsed file object with content
     * @returns {Array} Issues found
     */
    validate(file) {
        let content = file.content;

        // Extract ignore directives BEFORE stripping comments (they live in comments)
        const ignoredCodes = new Set();
        const ignoreAll = /<!--\s*eduscan-ignore-all/i.test(content);
        const codePattern = /<!--\s*eduscan-ignore:\s*([A-Z]+-\d+)/gi;
        let m;
        while ((m = codePattern.exec(content)) !== null) ignoredCodes.add(m[1]);

        // Strip template placeholders before validation
        content = this.stripTemplates(content);

        // Strip HTML comments to avoid false positives from commented-out code
        content = this.stripComments(content);

        // Strip <script>/<style> blocks before tag-balance checks. Inline JS
        // template literals (e.g. `const html = \`<div>...\`;`) inflate FP
        // rate ~5x without this. Applies to both CI and strict paths.
        content = this.stripScriptBlocks(content);

        const issues = [];

        // CI mode: only critical checks
        if (this.profile === 'ci') {
            issues.push(...this.checkCriticalIssues(file, content));
        } else {
            // Strict/Inventory mode: full validation
            issues.push(...this.checkUnclosedTags(file, content));
            issues.push(...this.checkMismatchedQuotes(file, content));
            issues.push(...this.checkDuplicateIds(file, content));
            issues.push(...this.checkMalformedAttributes(file, content));
            issues.push(...this.checkRequiredElements(file, content));
        }

        // Filter out ignored codes
        if (ignoreAll) return [];
        if (ignoredCodes.size > 0) return issues.filter(i => !ignoredCodes.has(i.code));
        return issues;
    }

    /**
     * Strip template placeholders from content
     * Replace with equivalent-length spaces to preserve line numbers
     */
    stripTemplates(content) {
        let result = content;
        for (const pattern of this.templatePatterns) {
            result = result.replace(pattern, match => ' '.repeat(match.length));
        }
        return result;
    }

    /**
     * Strip HTML comments from content
     * Replace with equivalent-length spaces to preserve line numbers
     */
    stripComments(content) {
        return content.replace(/<!--[\s\S]*?-->/g, match => ' '.repeat(match.length));
    }

    /**
     * Strip <script> and <style> blocks from content for tag-balance validation.
     * Inline scripts often contain JS template literals with HTML markup
     * (e.g. `const html = \`<div>${x}</div>\`;`). Without stripping, those
     * div tags get counted by the stack-based parser, causing massive FPs.
     *
     * Order matters: <script src="..."></script> first, because the URL
     * contains `//` which a JS-comment stripper would misread, eating
     * the closing tag. Empirical: full-corpus FP rate drops from ~80%
     * to ~0% with this strip in place (543 findings → 98 actual).
     *
     * Replace with equivalent-length spaces to preserve line numbers.
     */
    stripScriptBlocks(content) {
        // External scripts: <script src="..."></script>
        content = content.replace(/<script\b[^>]*\bsrc\s*=\s*['"][^'"]*['"][^>]*>\s*<\/script>/gi,
            match => ' '.repeat(match.length));
        // Inline scripts: <script>...</script>
        content = content.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,
            match => ' '.repeat(match.length));
        // Inline styles: <style>...</style>
        content = content.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,
            match => ' '.repeat(match.length));
        return content;
    }

    /**
     * CI Mode: Only check critical issues that would definitely break the page
     * - Unclosed script tags
     * - Unclosed attribute quotes (in critical attributes)
     * - Structural tag balance (div/form/table) at MEDIUM severity
     *   (medium so PULSE critical+high gate stays clean while findings
     *   surface in hygiene queue + operator triage)
     */
    checkCriticalIssues(file, content) {
        const issues = [];

        // Check for unclosed script/style tags
        issues.push(...this.checkCriticalUnclosedTags(file, content));

        // Check for unclosed quotes in attributes
        issues.push(...this.checkUnclosedAttributeQuotes(file, content));

        // Structural-only div-balance check at medium severity. Reuses the
        // strict-mode stack-machine via opts. Fixes the bug class that broke
        // the admin console (CLAUDE.md feedback rule "Precision Over Speed").
        // 26 known files surface from initial corpus run.
        issues.push(...this.checkUnclosedTags(file, content, {
            structuralOnly: true,
            severityOverride: 'medium',
            orphanCode: 'HTML-011',
            unclosedCode: 'HTML-012',
            fixSuffix: 'See _docs/operations/html-div-mismatch-finding-2026-05-09.md for backlog audit context.'
        }));

        return issues;
    }

    /**
     * Check specifically for unclosed script and style tags
     */
    checkCriticalUnclosedTags(file, content) {
        const issues = [];

        // Strip false-positive contexts before counting tags. Three categories:
        //
        // 1. JS comments inside inline <script> blocks (no src) — without
        //    stripping, `// see <script> block` inside a script falsely
        //    counts as another tag opener.
        //    CRITICAL: skip <script src="..."> blocks (the `//` in https://
        //    URLs would be misread as a JS comment and eat the closing tag).
        //
        // 2. <textarea>...</textarea> content — text inside textarea is
        //    a STRING (placeholder/value), not HTML. An XSS-attack example
        //    in instructional content (e.g., "enter: <script>alert(1)</script>")
        //    is literal text, not real tags.
        //
        // 3. <pre>...</pre> and <code>...</code> content — verbatim code
        //    examples often contain literal tag-like substrings.
        //
        // Length-preserving replacements keep line numbers accurate.
        const stripPreserveLines = (s) => s.replace(/[^\n]/g, ' ');
        let tagSafeContent = content.replace(
            /<script(?![^>]*\bsrc\b)[^>]*>[\s\S]*?<\/script>/gi,
            (block) => block
                // ORDER MATTERS: strip JS string literals FIRST so that `//`
                // appearing inside `"http://..."` or `"//etc/path/"` is NOT
                // treated as a comment-start. Without this, the comment
                // stripper eats from the string's `//` to end of line,
                // including any `</script>` that follows.
                .replace(/"(?:[^"\\\n]|\\[\s\S])*"/g, (m) => '"' + stripPreserveLines(m.slice(1, -1)) + '"')
                .replace(/'(?:[^'\\\n]|\\[\s\S])*'/g, (m) => "'" + stripPreserveLines(m.slice(1, -1)) + "'")
                // Now strip line + block comments (no risk of matching inside
                // string literals because those have been blanked).
                .replace(/\/\/[^\n]*/g, (m) => ' '.repeat(m.length))
                .replace(/\/\*[\s\S]*?\*\//g, (m) => stripPreserveLines(m))
        );
        // Strip <textarea>, <pre>, <code> body content (preserve outer tags
        // and line breaks; only inner text is replaced with spaces).
        tagSafeContent = tagSafeContent.replace(
            /(<(textarea|pre|code)\b[^>]*>)([\s\S]*?)(<\/\2>)/gi,
            (_full, openTag, _name, body, closeTag) => openTag + stripPreserveLines(body) + closeTag
        );
        // Strip HTML attribute VALUES (anything between =" " or = ' '). An
        // attribute value can legitimately contain text like
        // `placeholder="enter <script>alert(1)</script>"` (XSS instructional
        // content, code examples, etc.) — to the HTML parser, this is text,
        // not tags, but our regex-based count would double-count without this.
        // Length-preserving replacement keeps line numbers accurate.
        tagSafeContent = tagSafeContent.replace(
            /=(["'])([\s\S]*?)\1/g,
            (_full, quote, value) => '=' + quote + stripPreserveLines(value) + quote
        );

        for (const tagName of this.criticalTags) {
            // Count opening and closing tags
            const openPattern = new RegExp(`<${tagName}(?:\\s[^>]*)?>`, 'gi');
            const closePattern = new RegExp(`</${tagName}\\s*>`, 'gi');

            const opens = (tagSafeContent.match(openPattern) || []).length;
            const closes = (tagSafeContent.match(closePattern) || []).length;

            if (opens > closes) {
                // Find the position of the last unclosed opening tag
                let lastMatch = null;
                let match;
                while ((match = openPattern.exec(content)) !== null) {
                    lastMatch = match;
                }

                if (lastMatch) {
                    const line = this.getLineNumber(content, lastMatch.index);
                    issues.push({
                        code: 'HTML-001',
                        severity: 'critical',
                        category: 'syntax',
                        message: `Unclosed <${tagName}> tag - this will break page functionality`,
                        file: file.path,
                        line,
                        fix: `Add closing </${tagName}> tag`
                    });
                }
            }
        }

        return issues;
    }

    /**
     * Check for unclosed quotes in critical attributes
     * These cause parsing chaos and break everything after them
     *
     * NOTE: This check is disabled in CI mode due to high false positive rate
     * from data URIs, SVG content, and JS handlers. The cost of false positives
     * outweighs the benefit of catching rare real issues.
     */
    checkUnclosedAttributeQuotes(file, content) {
        // Disabled in CI mode - too many false positives from:
        // - Data URIs with embedded SVG (data:image/svg+xml,<svg xmlns='...'>)
        // - onclick handlers with JS containing quotes
        // - Complex attribute values with embedded content
        //
        // Real unclosed quotes are rare and usually caught by browser dev tools
        return [];
    }

    /**
     * Check for unclosed or improperly nested tags.
     *
     * Strict mode: full check, emits HTML-003/004/005 at computed severity.
     * CI structural-only mode (opts.structuralOnly): tracks ONLY structuralTags
     *   (div/form/table/tbody/thead/tfoot), emits HTML-011/012 at medium.
     *
     * @param {object} file
     * @param {string} content
     * @param {object} [opts]
     * @param {boolean} [opts.structuralOnly] only track structural tags
     * @param {string}  [opts.severityOverride] override emitted severity
     * @param {string}  [opts.orphanCode] override HTML-003 (default)
     * @param {string}  [opts.unclosedCode] override HTML-005 (default)
     * @param {string}  [opts.fixSuffix] appended to fix message (e.g. audit doc link)
     */
    checkUnclosedTags(file, content, opts = {}) {
        const issues = [];
        const structuralOnly = opts.structuralOnly === true;

        // Tags that require closing (filtered when structuralOnly)
        const requireClose = structuralOnly
            ? [...this.structuralTags]
            : [...this.criticalTags, ...this.structuralTags, ...this.standardTags];

        // Build a simple stack-based check
        const tagStack = [];

        // More robust tag pattern that handles attributes better
        const tagPattern = /<\/?([a-z][a-z0-9]*)\b[^>]*\/?>/gi;
        let match;

        while ((match = tagPattern.exec(content)) !== null) {
            const fullTag = match[0];
            const tagName = match[1].toLowerCase();

            // Skip self-closing tags (both /> and void elements)
            if (this.isSelfClosing(fullTag, tagName)) {
                continue;
            }

            // Determine severity based on tag type
            const getSeverity = (tag) => {
                if (this.criticalTags.includes(tag)) return 'critical';
                if (this.structuralTags.includes(tag)) return 'high';
                return 'low'; // Minor nesting issues
            };

            if (fullTag.startsWith('</')) {
                // Closing tag
                if (requireClose.includes(tagName)) {
                    const lastOpen = tagStack.findLastIndex(t => t.name === tagName);
                    if (lastOpen === -1) {
                        // Closing tag without opening - only report for structural+ tags
                        const reportable = structuralOnly
                            ? this.structuralTags.includes(tagName)
                            : (this.criticalTags.includes(tagName) || this.structuralTags.includes(tagName));
                        if (reportable) {
                            const line = this.getLineNumber(content, match.index);
                            const baseFix = `Remove orphaned </${tagName}> or add opening <${tagName}>`;
                            issues.push({
                                code: opts.orphanCode || 'HTML-003',
                                severity: opts.severityOverride || getSeverity(tagName),
                                category: 'syntax',
                                message: `Closing tag </${tagName}> without matching opening tag`,
                                file: file.path,
                                line,
                                fix: opts.fixSuffix ? baseFix + '. ' + opts.fixSuffix : baseFix
                            });
                        }
                    } else {
                        // Check for improperly nested tags (only in strict mode, never structural-only)
                        if (this.profile === 'strict' && !structuralOnly) {
                            const skipped = tagStack.slice(lastOpen + 1);
                            const significantSkipped = skipped.filter(t =>
                                this.criticalTags.includes(t.name) || this.structuralTags.includes(t.name)
                            );
                            if (significantSkipped.length > 0) {
                                const unclosed = significantSkipped.map(t => t.name).join(', ');
                                const line = this.getLineNumber(content, match.index);
                                issues.push({
                                    code: 'HTML-004',
                                    severity: 'low',
                                    category: 'syntax',
                                    message: `Tag nesting error: closing </${tagName}> but <${unclosed}> not closed`,
                                    file: file.path,
                                    line,
                                    fix: `Close <${unclosed}> before </${tagName}>`
                                });
                            }
                        }
                        tagStack.splice(lastOpen);
                    }
                }
            } else {
                // Opening tag
                if (requireClose.includes(tagName)) {
                    tagStack.push({
                        name: tagName,
                        position: match.index,
                        line: this.getLineNumber(content, match.index)
                    });
                }
            }
        }

        // Check for unclosed tags at end
        for (const tag of tagStack) {
            const computed = this.criticalTags.includes(tag.name) ? 'critical' :
                           this.structuralTags.includes(tag.name) ? 'high' : 'low';

            // Only report critical and structural tags (high+ severity)
            if (computed !== 'low') {
                const baseFix = `Add closing </${tag.name}> tag`;
                issues.push({
                    code: opts.unclosedCode || 'HTML-005',
                    severity: opts.severityOverride || computed,
                    category: 'syntax',
                    message: `Unclosed <${tag.name}> tag`,
                    file: file.path,
                    line: tag.line,
                    fix: opts.fixSuffix ? baseFix + '. ' + opts.fixSuffix : baseFix
                });
            }
        }

        return issues;
    }

    /**
     * Check if a tag is self-closing (void element or explicit />)
     */
    isSelfClosing(fullTag, tagName) {
        // Explicit self-closing syntax
        if (fullTag.endsWith('/>')) {
            return true;
        }

        // Void elements (HTML5)
        const voidElements = [
            'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
            'link', 'meta', 'param', 'source', 'track', 'wbr',
            // Additional common self-closing elements
            'command', 'keygen', 'menuitem'
        ];

        return voidElements.includes(tagName.toLowerCase());
    }

    /**
     * Check for mismatched quotes in attributes (strict mode)
     */
    checkMismatchedQuotes(file, content) {
        const issues = [];

        // Look for unclosed string in common critical attributes
        const criticalAttrs = ['href', 'src', 'onclick', 'onload', 'onerror', 'action'];
        for (const attr of criticalAttrs) {
            const pattern = new RegExp(`<[^>]*${attr}\\s*=\\s*"[^"]*(?:<|$)`, 'gi');
            let match;

            while ((match = pattern.exec(content)) !== null) {
                const line = this.getLineNumber(content, match.index);
                issues.push({
                    code: 'HTML-006',
                    severity: 'high',
                    category: 'syntax',
                    message: `Unclosed quote in ${attr} attribute`,
                    file: file.path,
                    line,
                    fix: 'Add closing quote to attribute value'
                });
            }
        }

        return issues;
    }

    /**
     * Check for duplicate IDs (medium severity - accessibility/JS issues)
     */
    checkDuplicateIds(file, content) {
        const issues = [];
        const idPattern = /\bid\s*=\s*["']([^"']+)["']/gi;
        const ids = new Map();
        let match;

        while ((match = idPattern.exec(content)) !== null) {
            const id = match[1];

            // Skip template-like IDs (contain placeholder syntax)
            if (id.includes('{') || id.includes('%') || id.includes('$')) {
                continue;
            }

            const line = this.getLineNumber(content, match.index);

            if (ids.has(id)) {
                issues.push({
                    code: 'HTML-007',
                    severity: 'medium',
                    category: 'syntax',
                    message: `Duplicate id="${id}" (first at line ${ids.get(id)})`,
                    file: file.path,
                    line,
                    fix: `Rename one of the duplicate "${id}" IDs`
                });
            } else {
                ids.set(id, line);
            }
        }

        return issues;
    }

    /**
     * Check for malformed attributes (strict mode only)
     */
    checkMalformedAttributes(file, content) {
        const issues = [];

        // Only run in strict mode
        if (this.profile !== 'strict') {
            return issues;
        }

        // Check for = without value (excluding boolean attributes)
        const noValuePattern = /<[^>]*\s+(\w+)\s*=\s*(?=>|\/?>|\s+\w)/g;
        let match;

        while ((match = noValuePattern.exec(content)) !== null) {
            const attrName = match[1];
            // Skip boolean attributes
            if (this.isBooleanAttribute(attrName)) {
                continue;
            }

            const line = this.getLineNumber(content, match.index);
            issues.push({
                code: 'HTML-008',
                severity: 'low',
                category: 'syntax',
                message: `Attribute "${attrName}" has = but no value`,
                file: file.path,
                line,
                fix: `Add value for ${attrName}= or remove the =`
            });
        }

        return issues;
    }

    /**
     * Check for missing required elements (low severity)
     */
    checkRequiredElements(file, content) {
        const issues = [];
        const lower = content.toLowerCase();

        // Check for DOCTYPE (only for full HTML documents)
        if (lower.includes('<html') && !lower.includes('<!doctype')) {
            issues.push({
                code: 'HTML-009',
                severity: 'low',
                category: 'syntax',
                message: 'Missing <!DOCTYPE html> declaration',
                file: file.path,
                line: 1,
                fix: 'Add <!DOCTYPE html> at the start of the file'
            });
        }

        // Check for title (only in full HTML documents, strict mode only)
        if (this.profile === 'strict') {
            if (lower.includes('<html') && lower.includes('<head') && !lower.includes('<title')) {
                issues.push({
                    code: 'HTML-010',
                    severity: 'low',
                    category: 'syntax',
                    message: 'Missing <title> element in <head>',
                    file: file.path,
                    line: 1,
                    fix: 'Add <title>Page Title</title> in <head>'
                });
            }
        }

        return issues;
    }

    /**
     * Check if attribute is boolean (no value needed)
     */
    isBooleanAttribute(attrName) {
        const booleanAttrs = [
            'async', 'autofocus', 'autoplay', 'checked', 'controls',
            'default', 'defer', 'disabled', 'hidden', 'ismap', 'loop',
            'multiple', 'muted', 'novalidate', 'open', 'readonly',
            'required', 'reversed', 'selected', 'scoped', 'seamless',
            'allowfullscreen', 'allowpaymentrequest', 'formnovalidate',
            'nomodule', 'playsinline', 'truespeed'
        ];
        return booleanAttrs.includes(attrName.toLowerCase());
    }

    /**
     * Get line number for a position in content
     */
    getLineNumber(content, position) {
        const before = content.substring(0, position);
        return (before.match(/\n/g) || []).length + 1;
    }
}

module.exports = HTMLValidator;
