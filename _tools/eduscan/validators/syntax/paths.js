/**
 * EduScan - Path Validator
 *
 * Detects broken paths in script/link/img imports that would cause
 * 404 errors and missing resources.
 *
 * ES-7 Refinements:
 * - CDN whitelist for external resources
 * - Severity remapping (scripts=high, images=low)
 * - Template placeholder detection
 */

const fs = require('fs');
const path = require('path');

class PathValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.rootPath = options.rootPath || './_app';
        this.checkedPaths = new Map();
        this.profile = options.profile || 'ci'; // ci, strict, inventory
    }

    // Known CDN patterns - never flag as missing
    knownCDNs = [
        /^https?:\/\/cdn\./i,
        /^https?:\/\/.*\.cloudfront\.net/i,
        /^https?:\/\/.*\.jsdelivr\.net/i,
        /^https?:\/\/unpkg\.com/i,
        /^https?:\/\/cdnjs\.cloudflare\.com/i,
        /^https?:\/\/fonts\.googleapis\.com/i,
        /^https?:\/\/fonts\.gstatic\.com/i,
        /^https?:\/\/ajax\.googleapis\.com/i,
        /^https?:\/\/code\.jquery\.com/i,
        /^https?:\/\/stackpath\.bootstrapcdn\.com/i,
        /^https?:\/\/maxcdn\.bootstrapcdn\.com/i,
        /^https?:\/\/.*\.firebaseapp\.com/i,
        /^https?:\/\/.*\.web\.app/i
    ];

    // Template placeholder patterns - skip validation
    templatePatterns = [
        /\{\{.*?\}\}/,      // Mustache/Handlebars
        /<%.*?%>/,          // EJS/ERB
        /%%\w+%%/,          // Custom tokens
        /__\w+__/,          // Dunder placeholders
        /\$\{.*?\}/         // Template literals in attributes
    ];

    /**
     * Validate paths in HTML file
     */
    validate(file) {
        const issues = [];
        const content = file.content;
        const fileDir = path.dirname(file.path);

        // Resolve fileDir relative to rootPath
        const absoluteFileDir = path.isAbsolute(fileDir)
            ? fileDir
            : path.resolve(this.rootPath, fileDir);

        issues.push(...this.checkScriptPaths(file, absoluteFileDir));
        issues.push(...this.checkLinkPaths(file, absoluteFileDir));
        issues.push(...this.checkImgPaths(file, absoluteFileDir));

        // Only check anchors and dynamic imports in strict mode
        if (this.profile === 'strict') {
            issues.push(...this.checkAnchorPaths(file, absoluteFileDir));
            issues.push(...this.checkDynamicImports(file, absoluteFileDir));
        }

        return issues;
    }

    /**
     * Check script src paths
     * Severity: HIGH (scripts are critical for functionality)
     */
    checkScriptPaths(file, fileDir) {
        const issues = [];
        const content = file.content;
        const scriptPattern = /<script[^>]*\ssrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
        let match;

        while ((match = scriptPattern.exec(content)) !== null) {
            const src = match[1];
            const line = this.getLineNumber(content, match.index);

            // Skip external/CDN/special URLs
            if (this.shouldSkipUrl(src)) {
                continue;
            }

            const resolved = this.resolvePath(src, fileDir);
            const exists = this.checkExists(resolved);

            if (!exists) {
                issues.push({
                    code: 'PATH-001',
                    severity: 'high',  // Scripts are critical
                    category: 'path',
                    message: `Script not found: ${src}`,
                    file: file.path,
                    line,
                    missingPath: src,
                    resolvedPath: resolved,
                    fix: `Create ${src} or fix the path`,
                    suggestions: this.suggestSimilar(src, fileDir, '.js'),
                    autoFixable: false
                });
            }
        }

        return issues;
    }

    /**
     * Check link href paths (CSS/stylesheets)
     * Severity: MEDIUM (styling issues, not functionality breaking)
     */
    checkLinkPaths(file, fileDir) {
        const issues = [];
        const content = file.content;
        const linkPattern = /<link[^>]*\shref\s*=\s*["']([^"']+)["'][^>]*>/gi;
        let match;

        while ((match = linkPattern.exec(content)) !== null) {
            const href = match[1];
            const line = this.getLineNumber(content, match.index);

            // Skip external/CDN/special URLs
            if (this.shouldSkipUrl(href)) {
                continue;
            }

            // Skip non-stylesheet links
            if (!match[0].toLowerCase().includes('stylesheet') &&
                !href.endsWith('.css')) {
                continue;
            }

            // Skip icon/manifest links
            if (href.includes('favicon') || href.includes('manifest')) {
                continue;
            }

            const resolved = this.resolvePath(href, fileDir);
            const exists = this.checkExists(resolved);

            if (!exists) {
                issues.push({
                    code: 'PATH-002',
                    severity: 'medium',  // CSS is important but not critical
                    category: 'path',
                    message: `Stylesheet not found: ${href}`,
                    file: file.path,
                    line,
                    missingPath: href,
                    resolvedPath: resolved,
                    fix: `Create ${href} or fix the path`,
                    suggestions: this.suggestSimilar(href, fileDir, '.css')
                });
            }
        }

        return issues;
    }

    /**
     * Check img src paths
     * Severity: LOW (missing images don't break functionality)
     */
    checkImgPaths(file, fileDir) {
        const issues = [];
        const content = file.content;
        const imgPattern = /<img[^>]*\ssrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
        let match;

        while ((match = imgPattern.exec(content)) !== null) {
            const src = match[1];
            const line = this.getLineNumber(content, match.index);

            // Skip external/CDN/special URLs
            if (this.shouldSkipUrl(src)) {
                continue;
            }

            const resolved = this.resolvePath(src, fileDir);
            const exists = this.checkExists(resolved);

            if (!exists) {
                issues.push({
                    code: 'PATH-003',
                    severity: 'low',  // Images are cosmetic
                    category: 'path',
                    message: `Image not found: ${src}`,
                    file: file.path,
                    line,
                    missingPath: src,
                    resolvedPath: resolved,
                    fix: `Add image at ${src} or fix the path`,
                    suggestions: this.suggestSimilar(src, fileDir, path.extname(src))
                });
            }
        }

        return issues;
    }

    /**
     * Check anchor href paths (internal navigation)
     * Severity: LOW (navigation issues, not critical)
     * Only in strict mode
     */
    checkAnchorPaths(file, fileDir) {
        const issues = [];
        const content = file.content;
        const anchorPattern = /<a[^>]*\shref\s*=\s*["']([^"'#]+\.html)["'][^>]*>/gi;
        let match;

        while ((match = anchorPattern.exec(content)) !== null) {
            const href = match[1];
            const line = this.getLineNumber(content, match.index);

            if (this.shouldSkipUrl(href)) {
                continue;
            }

            const resolved = this.resolvePath(href, fileDir);
            const exists = this.checkExists(resolved);

            if (!exists) {
                issues.push({
                    code: 'PATH-004',
                    severity: 'low',
                    category: 'path',
                    message: `Linked page not found: ${href}`,
                    file: file.path,
                    line,
                    missingPath: href,
                    resolvedPath: resolved,
                    fix: `Create ${href} or fix the link`,
                    suggestions: this.suggestSimilar(href, fileDir, '.html')
                });
            }
        }

        return issues;
    }

    /**
     * Check dynamic imports in JavaScript
     * Severity: MEDIUM
     * Only in strict mode
     */
    checkDynamicImports(file, fileDir) {
        const issues = [];
        const content = file.content;
        const scriptPattern = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi;
        let match;

        while ((match = scriptPattern.exec(content)) !== null) {
            const scriptContent = match[1];
            const scriptStart = match.index;

            const localFetchPattern = /(?:fetch|import)\s*\(\s*["'](?!https?:\/\/)([^"']+)["']\s*\)/g;
            let fetchMatch;

            while ((fetchMatch = localFetchPattern.exec(scriptContent)) !== null) {
                const importPath = fetchMatch[1];
                const line = this.getLineNumber(content, scriptStart + fetchMatch.index);

                if (this.shouldSkipUrl(importPath)) {
                    continue;
                }

                if (!/\.\w+$/.test(importPath)) {
                    continue;
                }

                const resolved = this.resolvePath(importPath, fileDir);
                const exists = this.checkExists(resolved);

                if (!exists) {
                    issues.push({
                        code: 'PATH-005',
                        severity: 'medium',
                        category: 'path',
                        message: `Dynamic import target not found: ${importPath}`,
                        file: file.path,
                        line,
                        missingPath: importPath,
                        resolvedPath: resolved,
                        fix: `Create ${importPath} or fix the path`
                    });
                }
            }
        }

        return issues;
    }

    /**
     * Check if URL should be skipped (external, CDN, template, special)
     */
    shouldSkipUrl(url) {
        if (!url) return true;

        // External protocols
        if (url.startsWith('http://') ||
            url.startsWith('https://') ||
            url.startsWith('//') ||
            url.startsWith('blob:') ||
            url.startsWith('data:') ||
            url.startsWith('javascript:') ||
            url.startsWith('mailto:') ||
            url.startsWith('tel:')) {
            return true;
        }

        // Known CDNs
        for (const pattern of this.knownCDNs) {
            if (pattern.test(url)) {
                return true;
            }
        }

        // Template placeholders
        for (const pattern of this.templatePatterns) {
            if (pattern.test(url)) {
                return true;
            }
        }

        // Dynamic path markers
        if (url.includes('{{') || url.includes('${') ||
            url.includes('<%') || url.includes('%>')) {
            return true;
        }

        return false;
    }

    /**
     * Resolve a relative path from file directory
     */
    resolvePath(targetPath, fileDir) {
        if (targetPath.startsWith('/')) {
            return path.join(this.rootPath, targetPath);
        }
        return path.resolve(fileDir, targetPath);
    }

    /**
     * Check if file exists (with caching)
     */
    checkExists(filePath) {
        if (this.checkedPaths.has(filePath)) {
            return this.checkedPaths.get(filePath);
        }

        let exists = false;
        try {
            exists = fs.existsSync(filePath);
        } catch (e) {
            exists = false;
        }

        this.checkedPaths.set(filePath, exists);
        return exists;
    }

    /**
     * Suggest similar paths that do exist
     */
    suggestSimilar(missingPath, fileDir, expectedExt) {
        const suggestions = [];
        const filename = path.basename(missingPath);
        const dirname = path.dirname(missingPath);
        const resolvedDir = path.resolve(fileDir, dirname);

        try {
            if (!fs.existsSync(resolvedDir)) {
                return suggestions;
            }

            const files = fs.readdirSync(resolvedDir);

            for (const file of files) {
                if (expectedExt && !file.endsWith(expectedExt)) {
                    continue;
                }

                const similarity = this.stringSimilarity(filename, file);

                if (similarity > 0.5) {
                    const suggestedPath = path.join(dirname, file).replace(/\\/g, '/');
                    suggestions.push({
                        path: suggestedPath,
                        similarity: Math.round(similarity * 100)
                    });
                }
            }

            suggestions.sort((a, b) => b.similarity - a.similarity);
        } catch (e) {
            // Directory read failed
        }

        return suggestions.slice(0, 3);
    }

    /**
     * Simple string similarity
     */
    stringSimilarity(str1, str2) {
        const s1 = str1.toLowerCase();
        const s2 = str2.toLowerCase();

        if (s1 === s2) return 1;
        if (s1.length < 2 || s2.length < 2) return 0;

        const getBigrams = s => {
            const bigrams = new Set();
            for (let i = 0; i < s.length - 1; i++) {
                bigrams.add(s.substring(i, i + 2));
            }
            return bigrams;
        };

        const b1 = getBigrams(s1);
        const b2 = getBigrams(s2);

        let intersection = 0;
        for (const bigram of b1) {
            if (b2.has(bigram)) intersection++;
        }

        return (2 * intersection) / (b1.size + b2.size);
    }

    getLineNumber(content, position) {
        const before = content.substring(0, position);
        return (before.match(/\n/g) || []).length + 1;
    }
}

module.exports = PathValidator;
