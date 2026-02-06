/**
 * EduScan - HTML Syntax Validator
 *
 * Detects HTML structural issues that could cause rendering failures.
 * Uses lightweight parsing (no external dependencies).
 */

class HTMLValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
    }

    /**
     * Validate HTML content
     * @param {Object} file - Parsed file object with content
     * @returns {Array} Issues found
     */
    validate(file) {
        const issues = [];
        const content = file.content;

        // Check for unclosed tags
        issues.push(...this.checkUnclosedTags(file));

        // Check for mismatched quotes in attributes
        issues.push(...this.checkMismatchedQuotes(file));

        // Check for duplicate IDs
        issues.push(...this.checkDuplicateIds(file));

        // Check for malformed attributes
        issues.push(...this.checkMalformedAttributes(file));

        // Check for missing required elements
        issues.push(...this.checkRequiredElements(file));

        return issues;
    }

    /**
     * Check for unclosed or improperly nested tags
     */
    checkUnclosedTags(file) {
        const issues = [];
        const content = file.content;

        // Tags that must be closed
        const requireClose = [
            'div', 'span', 'p', 'a', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th',
            'form', 'button', 'select', 'textarea', 'label',
            'header', 'footer', 'main', 'nav', 'section', 'article', 'aside',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'script', 'style'
        ];

        // Build a simple stack-based check
        const tagStack = [];
        const tagPattern = /<\/?([a-z][a-z0-9]*)[^>]*>/gi;
        let match;

        while ((match = tagPattern.exec(content)) !== null) {
            const fullTag = match[0];
            const tagName = match[1].toLowerCase();

            // Skip self-closing and void elements
            if (fullTag.endsWith('/>') || this.isVoidElement(tagName)) {
                continue;
            }

            // Skip comments and doctype
            if (fullTag.startsWith('<!--') || fullTag.startsWith('<!')) {
                continue;
            }

            if (fullTag.startsWith('</')) {
                // Closing tag
                if (requireClose.includes(tagName)) {
                    const lastOpen = tagStack.findLastIndex(t => t.name === tagName);
                    if (lastOpen === -1) {
                        // Closing tag without opening
                        const line = this.getLineNumber(content, match.index);
                        issues.push({
                            code: 'HTML-001',
                            severity: 'high',
                            category: 'syntax',
                            message: `Closing tag </${tagName}> without matching opening tag`,
                            file: file.path,
                            line,
                            fix: `Remove orphaned </${tagName}> or add opening <${tagName}>`
                        });
                    } else {
                        // Check for improperly nested tags
                        const skipped = tagStack.slice(lastOpen + 1);
                        if (skipped.length > 0) {
                            const unclosed = skipped.map(t => t.name).join(', ');
                            const line = this.getLineNumber(content, match.index);
                            issues.push({
                                code: 'HTML-002',
                                severity: 'medium',
                                category: 'syntax',
                                message: `Tag nesting error: closing </${tagName}> but <${unclosed}> not closed`,
                                file: file.path,
                                line,
                                fix: `Close <${unclosed}> before </${tagName}>`
                            });
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
            // Only report if it seems significant (not deeply nested template stuff)
            if (['script', 'div', 'form', 'table'].includes(tag.name)) {
                issues.push({
                    code: 'HTML-003',
                    severity: 'high',
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
     * Check for mismatched quotes in attributes
     */
    checkMismatchedQuotes(file) {
        const issues = [];
        const content = file.content;

        // Look for common quote issues in attributes
        // Pattern: attribute="value' or attribute='value"
        const mismatchPattern = /(\w+)\s*=\s*"[^"]*'[^"]*"|(\w+)\s*=\s*'[^']*"[^']*'/g;
        let match;

        while ((match = mismatchPattern.exec(content)) !== null) {
            const attrName = match[1] || match[2];
            const line = this.getLineNumber(content, match.index);

            // Exclude common false positives (contractions in text, etc.)
            if (!this.looksLikeAttribute(content, match.index)) {
                continue;
            }

            issues.push({
                code: 'HTML-004',
                severity: 'medium',
                category: 'syntax',
                message: `Possible mismatched quotes in ${attrName} attribute`,
                file: file.path,
                line,
                fix: 'Use consistent quote marks (either all double or all single)'
            });
        }

        // Check for unclosed string in common attributes
        const unclosedPattern = /<[^>]*(?:href|src|onclick|class|id)\s*=\s*"[^"]*(?:<|$)/gi;
        while ((match = unclosedPattern.exec(content)) !== null) {
            const line = this.getLineNumber(content, match.index);
            issues.push({
                code: 'HTML-005',
                severity: 'high',
                category: 'syntax',
                message: 'Unclosed attribute value (missing closing quote)',
                file: file.path,
                line,
                fix: 'Add closing quote to attribute value'
            });
        }

        return issues;
    }

    /**
     * Check for duplicate IDs
     */
    checkDuplicateIds(file) {
        const issues = [];
        const content = file.content;
        const idPattern = /\bid\s*=\s*["']([^"']+)["']/gi;
        const ids = new Map();
        let match;

        while ((match = idPattern.exec(content)) !== null) {
            const id = match[1];
            const line = this.getLineNumber(content, match.index);

            if (ids.has(id)) {
                issues.push({
                    code: 'HTML-006',
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
     * Check for malformed attributes
     */
    checkMalformedAttributes(file) {
        const issues = [];
        const content = file.content;

        // Check for = without value
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
                code: 'HTML-007',
                severity: 'medium',
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
     * Check for missing required elements
     */
    checkRequiredElements(file) {
        const issues = [];
        const content = file.content;
        const lower = content.toLowerCase();

        // Check for DOCTYPE
        if (!lower.includes('<!doctype')) {
            issues.push({
                code: 'HTML-008',
                severity: 'low',
                category: 'syntax',
                message: 'Missing <!DOCTYPE html> declaration',
                file: file.path,
                fix: 'Add <!DOCTYPE html> at the start of the file'
            });
        }

        // Check for title (only in full HTML documents)
        if (lower.includes('<html') && lower.includes('<head') && !lower.includes('<title')) {
            issues.push({
                code: 'HTML-009',
                severity: 'low',
                category: 'syntax',
                message: 'Missing <title> element in <head>',
                file: file.path,
                fix: 'Add <title>Page Title</title> in <head>'
            });
        }

        return issues;
    }

    /**
     * Check if tag is a void element (self-closing)
     */
    isVoidElement(tagName) {
        const voidElements = [
            'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
            'link', 'meta', 'param', 'source', 'track', 'wbr'
        ];
        return voidElements.includes(tagName.toLowerCase());
    }

    /**
     * Check if attribute is boolean (no value needed)
     */
    isBooleanAttribute(attrName) {
        const booleanAttrs = [
            'async', 'autofocus', 'autoplay', 'checked', 'controls',
            'default', 'defer', 'disabled', 'hidden', 'ismap', 'loop',
            'multiple', 'muted', 'novalidate', 'open', 'readonly',
            'required', 'reversed', 'selected'
        ];
        return booleanAttrs.includes(attrName.toLowerCase());
    }

    /**
     * Check if position looks like it's in an attribute context
     */
    looksLikeAttribute(content, position) {
        // Look back for < to see if we're in a tag
        const before = content.substring(Math.max(0, position - 100), position);
        const lastOpen = before.lastIndexOf('<');
        const lastClose = before.lastIndexOf('>');
        return lastOpen > lastClose;
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
