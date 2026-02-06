/**
 * EduScan - Path Validator
 *
 * Detects broken paths in script/link/img imports that would cause
 * 404 errors and missing resources.
 */

const fs = require('fs');
const path = require('path');

class PathValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.rootPath = options.rootPath || './_app';
        this.checkedPaths = new Map(); // Cache for file existence checks
    }

    /**
     * Validate paths in HTML file
     * @param {Object} file - Parsed file object with content
     * @returns {Array} Issues found
     */
    validate(file) {
        const issues = [];
        const content = file.content;
        const fileDir = path.dirname(file.path);

        // Check script src paths
        issues.push(...this.checkScriptPaths(file, fileDir));

        // Check link href paths (CSS)
        issues.push(...this.checkLinkPaths(file, fileDir));

        // Check img src paths
        issues.push(...this.checkImgPaths(file, fileDir));

        // Check anchor href paths (internal links)
        issues.push(...this.checkAnchorPaths(file, fileDir));

        // Check dynamic imports/requires
        issues.push(...this.checkDynamicImports(file, fileDir));

        return issues;
    }

    /**
     * Check script src paths
     */
    checkScriptPaths(file, fileDir) {
        const issues = [];
        const content = file.content;
        const scriptPattern = /<script[^>]*\ssrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
        let match;

        while ((match = scriptPattern.exec(content)) !== null) {
            const src = match[1];
            const line = this.getLineNumber(content, match.index);

            // Skip external URLs
            if (this.isExternalUrl(src)) {
                continue;
            }

            // Skip data: URLs
            if (src.startsWith('data:')) {
                continue;
            }

            const resolved = this.resolvePath(src, fileDir);
            const exists = this.checkExists(resolved);

            if (!exists) {
                issues.push({
                    code: 'PATH-001',
                    severity: 'critical',
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
     */
    checkLinkPaths(file, fileDir) {
        const issues = [];
        const content = file.content;
        const linkPattern = /<link[^>]*\shref\s*=\s*["']([^"']+)["'][^>]*>/gi;
        let match;

        while ((match = linkPattern.exec(content)) !== null) {
            const href = match[1];
            const line = this.getLineNumber(content, match.index);

            // Skip external URLs
            if (this.isExternalUrl(href)) {
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
                    severity: 'high',
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
     */
    checkImgPaths(file, fileDir) {
        const issues = [];
        const content = file.content;
        const imgPattern = /<img[^>]*\ssrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
        let match;

        while ((match = imgPattern.exec(content)) !== null) {
            const src = match[1];
            const line = this.getLineNumber(content, match.index);

            // Skip external URLs
            if (this.isExternalUrl(src)) {
                continue;
            }

            // Skip data: URLs
            if (src.startsWith('data:')) {
                continue;
            }

            // Skip placeholder/dynamic paths
            if (src.includes('{{') || src.includes('${')) {
                continue;
            }

            const resolved = this.resolvePath(src, fileDir);
            const exists = this.checkExists(resolved);

            if (!exists) {
                issues.push({
                    code: 'PATH-003',
                    severity: 'medium',
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
     */
    checkAnchorPaths(file, fileDir) {
        const issues = [];
        const content = file.content;

        // Only check anchors that look like internal navigation
        const anchorPattern = /<a[^>]*\shref\s*=\s*["']([^"'#]+\.html)["'][^>]*>/gi;
        let match;

        while ((match = anchorPattern.exec(content)) !== null) {
            const href = match[1];
            const line = this.getLineNumber(content, match.index);

            // Skip external URLs
            if (this.isExternalUrl(href)) {
                continue;
            }

            // Skip dynamic paths
            if (href.includes('{{') || href.includes('${')) {
                continue;
            }

            const resolved = this.resolvePath(href, fileDir);
            const exists = this.checkExists(resolved);

            if (!exists) {
                issues.push({
                    code: 'PATH-004',
                    severity: 'medium',
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
     */
    checkDynamicImports(file, fileDir) {
        const issues = [];
        const content = file.content;

        // Extract inline scripts
        const scriptPattern = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi;
        let match;

        while ((match = scriptPattern.exec(content)) !== null) {
            const scriptContent = match[1];
            const scriptStart = match.index;

            // Check for fetch/import of local resources
            const localFetchPattern = /(?:fetch|import)\s*\(\s*["'](?!https?:\/\/)([^"']+)["']\s*\)/g;
            let fetchMatch;

            while ((fetchMatch = localFetchPattern.exec(scriptContent)) !== null) {
                const importPath = fetchMatch[1];
                const line = this.getLineNumber(content, scriptStart + fetchMatch.index);

                // Skip obvious external/API calls
                if (importPath.startsWith('/api/') ||
                    importPath.includes('{{') ||
                    importPath.includes('${')) {
                    continue;
                }

                // Only check file-like paths
                if (!/\.\w+$/.test(importPath)) {
                    continue;
                }

                const resolved = this.resolvePath(importPath, fileDir);
                const exists = this.checkExists(resolved);

                if (!exists) {
                    issues.push({
                        code: 'PATH-005',
                        severity: 'high',
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
     * Check if URL is external
     */
    isExternalUrl(url) {
        return url.startsWith('http://') ||
               url.startsWith('https://') ||
               url.startsWith('//') ||
               url.startsWith('blob:') ||
               url.startsWith('javascript:');
    }

    /**
     * Resolve a relative path from file directory
     */
    resolvePath(targetPath, fileDir) {
        // Handle absolute paths (from root)
        if (targetPath.startsWith('/')) {
            return path.join(this.rootPath, targetPath);
        }

        // Handle relative paths
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
        const resolvedDir = this.resolvePath(dirname, fileDir);

        try {
            if (!fs.existsSync(resolvedDir)) {
                return suggestions;
            }

            const files = fs.readdirSync(resolvedDir);

            for (const file of files) {
                // Skip if wrong extension
                if (expectedExt && !file.endsWith(expectedExt)) {
                    continue;
                }

                // Calculate similarity
                const similarity = this.stringSimilarity(filename, file);

                if (similarity > 0.5) {
                    const suggestedPath = path.join(dirname, file).replace(/\\/g, '/');
                    suggestions.push({
                        path: suggestedPath,
                        similarity: Math.round(similarity * 100)
                    });
                }
            }

            // Sort by similarity
            suggestions.sort((a, b) => b.similarity - a.similarity);

        } catch (e) {
            // Directory read failed, no suggestions
        }

        return suggestions.slice(0, 3);
    }

    /**
     * Simple string similarity (Jaccard-like)
     */
    stringSimilarity(str1, str2) {
        const s1 = str1.toLowerCase();
        const s2 = str2.toLowerCase();

        if (s1 === s2) return 1;
        if (s1.length < 2 || s2.length < 2) return 0;

        // Get bigrams
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

    /**
     * Get line number for a position in content
     */
    getLineNumber(content, position) {
        const before = content.substring(0, position);
        return (before.match(/\n/g) || []).length + 1;
    }
}

module.exports = PathValidator;
