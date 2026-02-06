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
        const issues = [];
        let content = file.content;

        // Strip template placeholders before validation
        content = this.stripTemplates(content);

        // Strip HTML comments to avoid false positives from commented-out code
        content = this.stripComments(content);

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
     * CI Mode: Only check critical issues that would definitely break the page
     * - Unclosed script tags
     * - Unclosed attribute quotes (in critical attributes)
     */
    checkCriticalIssues(file, content) {
        const issues = [];

        // Check for unclosed script/style tags
        issues.push(...this.checkCriticalUnclosedTags(file, content));

        // Check for unclosed quotes in attributes
        issues.push(...this.checkUnclosedAttributeQuotes(file, content));

        return issues;
    }

    /**
     * Check specifically for unclosed script and style tags
     */
    checkCriticalUnclosedTags(file, content) {
        const issues = [];

        for (const tagName of this.criticalTags) {
            // Count opening and closing tags
            const openPattern = new RegExp(`<${tagName}(?:\\s[^>]*)?>`, 'gi');
            const closePattern = new RegExp(`</${tagName}\\s*>`, 'gi');

            const opens = (content.match(openPattern) || []).length;
            const closes = (content.match(closePattern) || []).length;

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
     */
    checkUnclosedAttributeQuotes(file, content) {
        const issues = [];

        // Pattern to detect tags with potentially unclosed quotes
        // Look for attribute="... or attribute='... without proper closing
        const lines = content.split('\n');
        let inTag = false;
        let tagStart = 0;
        let quoteChar = null;
        let attrName = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            for (let j = 0; j < line.length; j++) {
                const char = line[j];

                if (!inTag && char === '<' && line[j + 1] !== '!' && line[j + 1] !== '/') {
                    inTag = true;
                    tagStart = i + 1;
                    quoteChar = null;
                } else if (inTag && !quoteChar && char === '>') {
                    inTag = false;
                } else if (inTag && !quoteChar && (char === '"' || char === "'")) {
                    // Capture attribute name before the quote
                    const before = line.substring(0, j);
                    const attrMatch = before.match(/(\w+)\s*=\s*$/);
                    if (attrMatch) {
                        attrName = attrMatch[1];
                        quoteChar = char;
                    }
                } else if (inTag && quoteChar && char === quoteChar) {
                    quoteChar = null;
                    attrName = '';
                } else if (inTag && quoteChar && char === '<') {
                    // Found a < while inside quotes - likely unclosed quote
                    issues.push({
                        code: 'HTML-002',
                        severity: 'critical',
                        category: 'syntax',
                        message: `Unclosed quote in attribute "${attrName}" - breaks HTML parsing`,
                        file: file.path,
                        line: tagStart,
                        fix: `Close the ${quoteChar} quote in the ${attrName} attribute`
                    });
                    // Reset state
                    quoteChar = null;
                    attrName = '';
                    inTag = true;
                    tagStart = i + 1;
                }
            }

            // Check if we're still in a quote at end of line (within a tag)
            // Only report if the next line doesn't continue the attribute reasonably
            if (inTag && quoteChar && i < lines.length - 1) {
                const nextLine = lines[i + 1].trim();
                // If next line starts with a tag or ends the current tag, quote is unclosed
                if (nextLine.startsWith('<') || /^[^"']*>/.test(nextLine)) {
                    issues.push({
                        code: 'HTML-002',
                        severity: 'critical',
                        category: 'syntax',
                        message: `Unclosed quote in attribute "${attrName}" - breaks HTML parsing`,
                        file: file.path,
                        line: i + 1,
                        fix: `Close the ${quoteChar} quote in the ${attrName} attribute`
                    });
                    quoteChar = null;
                    attrName = '';
                }
            }
        }

        return issues;
    }

    /**
     * Check for unclosed or improperly nested tags (strict mode)
     */
    checkUnclosedTags(file, content) {
        const issues = [];

        // All tags that require closing
        const requireClose = [...this.criticalTags, ...this.structuralTags, ...this.standardTags];

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
                        if (this.criticalTags.includes(tagName) || this.structuralTags.includes(tagName)) {
                            const line = this.getLineNumber(content, match.index);
                            issues.push({
                                code: 'HTML-003',
                                severity: getSeverity(tagName),
                                category: 'syntax',
                                message: `Closing tag </${tagName}> without matching opening tag`,
                                file: file.path,
                                line,
                                fix: `Remove orphaned </${tagName}> or add opening <${tagName}>`
                            });
                        }
                    } else {
                        // Check for improperly nested tags (only in strict mode)
                        if (this.profile === 'strict') {
                            const skipped = tagStack.slice(lastOpen + 1);
                            // Only report significant nesting errors
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
            const severity = this.criticalTags.includes(tag.name) ? 'critical' :
                           this.structuralTags.includes(tag.name) ? 'high' : 'low';

            // Only report critical and structural tags (high+ severity)
            if (severity !== 'low') {
                issues.push({
                    code: 'HTML-005',
                    severity,
                    category: 'syntax',
                    message: `Unclosed <${tag.name}> tag`,
                    file: file.path,
                    line: tag.line,
                    fix: `Add closing </${tag.name}> tag`
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
