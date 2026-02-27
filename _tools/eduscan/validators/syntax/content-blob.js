/**
 * EduScan - Content Blob Detection Validator
 *
 * Detects presentations and modules with oversized inline content that
 * should be externalized for maintainability:
 *   - Large inline <style> blocks
 *   - Long template literal HTML blobs
 *   - Base64 data URIs
 *   - Oversized inline <script> data objects
 *
 * Issue codes:
 * - BLOB-001: Inline <style> block exceeds threshold (MEDIUM)
 * - BLOB-002: Template literal HTML blob exceeds threshold (LOW)
 * - BLOB-003: Base64 data URI detected (LOW)
 * - BLOB-004: Oversized inline script block (LOW)
 *
 * Created: 2026-02-27
 */

class ContentBlobValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.profile = options.profile || 'ci';

        // Thresholds (adjustable)
        this.styleLineThreshold = 300;     // <style> blocks > 300 lines
        this.templateCharThreshold = 500;  // template literal HTML > 500 chars
        this.base64MinLength = 500;        // base64 strings > 500 chars
        this.scriptLineThreshold = 200;    // <script> blocks > 200 lines (non-component)
    }

    /**
     * Validate a single file for content blobs.
     * @param {Object} file - { path, content }
     * @returns {Array} Issues found
     */
    validate(file) {
        // Only check presentation and module HTML files
        if (!file.path.match(/\.(presentation|module|applet|lab)\.html$/)) {
            return [];
        }

        const content = file.content;
        if (!content) return [];

        const issues = [];

        // BLOB-001: Large inline <style> blocks
        issues.push(...this.checkStyleBlocks(file));

        // BLOB-002: Long template literal HTML
        issues.push(...this.checkTemplateLiterals(file));

        // BLOB-003: Base64 data URIs
        issues.push(...this.checkBase64(file));

        // BLOB-004: Oversized inline <script> blocks
        issues.push(...this.checkScriptBlocks(file));

        return issues;
    }

    /**
     * BLOB-001: Detect oversized inline <style> blocks.
     */
    checkStyleBlocks(file) {
        const issues = [];
        const content = file.content;
        const regex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
        let match;

        while ((match = regex.exec(content)) !== null) {
            const block = match[1];
            const lineCount = block.split('\n').length;

            if (lineCount > this.styleLineThreshold) {
                // Find line number of the <style> tag
                const before = content.substring(0, match.index);
                const line = before.split('\n').length;

                issues.push({
                    code: 'BLOB-001',
                    severity: 'medium',
                    category: 'blob',
                    message: `Inline <style> block is ${lineCount} lines (threshold: ${this.styleLineThreshold}) — consider externalizing to a CSS file`,
                    file: file.path,
                    line,
                    fix: `Extract <style> block to a shared CSS file`
                });
            }
        }

        return issues;
    }

    /**
     * BLOB-002: Detect long template literal HTML blobs in innerHTML assignments.
     */
    checkTemplateLiterals(file) {
        const issues = [];
        const content = file.content;

        // Match innerHTML/outerHTML assignments with template literals
        const regex = /\.innerHTML\s*=\s*`([^`]{500,})`/g;
        let match;

        while ((match = regex.exec(content)) !== null) {
            const blobLength = match[1].length;
            const before = content.substring(0, match.index);
            const line = before.split('\n').length;

            issues.push({
                code: 'BLOB-002',
                severity: 'low',
                category: 'blob',
                message: `innerHTML template literal is ${blobLength} chars — consider extracting to a template function`,
                file: file.path,
                line,
                fix: `Extract large innerHTML template to a named function`
            });
        }

        return issues;
    }

    /**
     * BLOB-003: Detect base64 data URIs.
     */
    checkBase64(file) {
        const issues = [];
        const content = file.content;

        // Match data URIs with base64 content
        const regex = /data:[^;]+;base64,([A-Za-z0-9+/=]{500,})/g;
        let match;

        while ((match = regex.exec(content)) !== null) {
            const b64Length = match[1].length;
            const before = content.substring(0, match.index);
            const line = before.split('\n').length;

            // Estimate actual file size (base64 is ~33% larger than binary)
            const estimatedKB = Math.round((b64Length * 3 / 4) / 1024);

            issues.push({
                code: 'BLOB-003',
                severity: 'low',
                category: 'blob',
                message: `Base64 data URI detected (~${estimatedKB}KB) — consider using an external file`,
                file: file.path,
                line,
                fix: `Extract base64 content to an external asset file`
            });
        }

        return issues;
    }

    /**
     * BLOB-004: Detect oversized inline <script> blocks (non-component scripts).
     */
    checkScriptBlocks(file) {
        const issues = [];
        const content = file.content;

        // Match inline script blocks (not src= external scripts)
        const regex = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
        let match;

        while ((match = regex.exec(content)) !== null) {
            const block = match[1].trim();
            if (!block) continue;

            const lineCount = block.split('\n').length;

            if (lineCount > this.scriptLineThreshold) {
                const before = content.substring(0, match.index);
                const line = before.split('\n').length;

                issues.push({
                    code: 'BLOB-004',
                    severity: 'low',
                    category: 'blob',
                    message: `Inline <script> block is ${lineCount} lines (threshold: ${this.scriptLineThreshold}) — consider externalizing`,
                    file: file.path,
                    line,
                    fix: `Extract inline script to an external JS file`
                });
            }
        }

        return issues;
    }
}

module.exports = ContentBlobValidator;
