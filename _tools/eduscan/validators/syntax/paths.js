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
 *
 * Enhanced Features:
 * - Intelligent issue bucketing (WRONG_RELATIVE_DEPTH, CASE_MISMATCH, etc.)
 * - Nearest-match suggestions with confidence scoring
 * - Auto-fix candidacy assessment
 */

const fs = require('fs');
const path = require('path');

// Issue bucket types
const BUCKET_TYPES = {
    WRONG_RELATIVE_DEPTH: 'WRONG_RELATIVE_DEPTH',
    CASE_MISMATCH: 'CASE_MISMATCH',
    MOVED_RENAMED: 'MOVED_RENAMED',
    MISSING_LOCAL: 'MISSING_LOCAL',
    DYNAMIC_LOAD: 'DYNAMIC_LOAD',
    STRUCTURAL_DEPTH: 'STRUCTURAL_DEPTH',  // Proactive depth rule violation (undershoot)
    STRUCTURAL_OVERSHOOT: 'STRUCTURAL_OVERSHOOT',  // Too many ../ (overshoot past root)
    WRONG_ANCHOR: 'WRONG_ANCHOR',  // Path resolves to wrong anchor directory
    DOUBLED_SEGMENT: 'DOUBLED_SEGMENT'  // Repeated directory segment (e.g., houses/shield/houses/shield/)
};

// Known anchor directories - common target directories for relative paths
const ANCHOR_DIRECTORIES = ['components', 'assets', 'config', 'styles', 'utils', 'houses', 'digital-life'];

// Structural depth rules - proactive prevention based on file location
// Format: { pattern: RegExp for file path, target: RegExp for referenced path, minDepth: number, description: string }
// Rules can specify:
//   - minDepth: minimum required ../ count (triggers PATH-DEPTH-001 if below)
//   - maxDepth: maximum allowed ../ count (triggers PATH-DEPTH-002 if above)
//   - exactDepth: exact required ../ count (triggers both codes if wrong)
const STRUCTURAL_DEPTH_RULES = [
    {
        // Files at houses/*/index.html level - exactly 2 levels to reach components
        // houses(1)/cloud(2)/index.html → ../../components/
        filePattern: /^houses\/[^/]+\/index\.html$/,
        targetPattern: /components\//,
        exactDepth: 2,
        description: 'house index files'
    },
    {
        // Files at houses/*/applets/*/*.html level - exactly 4 levels
        // houses(1)/cloud(2)/applets(3)/aws(4)/file.html → ../../../../components/
        filePattern: /^houses\/[^/]+\/applets\/[^/]+\/[^/]+\.html$/,
        targetPattern: /components\//,
        exactDepth: 4,
        description: 'applet root files'
    },
    {
        // Files in houses/*/applets/*/week*/ need 5+ levels to reach components/
        filePattern: /houses\/[^/]+\/applets\/[^/]+\/week[^/]*\//,
        targetPattern: /components\//,
        minDepth: 5,
        description: 'week-level applet files'
    },
    {
        // Files in houses/*/applets/*/week*/labs/ need 6+ levels to reach components/
        filePattern: /houses\/[^/]+\/applets\/[^/]+\/week[^/]*\/labs\//,
        targetPattern: /components\//,
        minDepth: 6,
        description: 'week/labs-level applet files'
    },
    {
        // Files in houses/*/modules/*/m*/labs/ need 6+ levels to reach components/
        filePattern: /houses\/[^/]+\/modules\/[^/]+\/m\d+\/labs?\//,
        targetPattern: /components\//,
        minDepth: 6,
        description: 'module labs files'
    },
    {
        // Files in houses/*/applets/comptia-aplus/core-*/labs/ need 6+ levels
        filePattern: /houses\/[^/]+\/applets\/comptia-aplus\/core-[^/]+\/labs\//,
        targetPattern: /components\//,
        minDepth: 6,
        description: 'CompTIA labs files'
    },
    {
        // Files in houses/*/applets/comptia-aplus/core-*/presentations/ need 6 levels
        // houses(1)/forge(2)/applets(3)/comptia-aplus(4)/core-2(5)/presentations(6)/file.html
        filePattern: /houses\/[^/]+\/applets\/comptia-aplus\/core-[^/]+\/presentations\//,
        targetPattern: /components\//,
        minDepth: 6,
        description: 'CompTIA presentation files'
    },
    {
        // Files in houses/*/applets/comptia-aplus/core-*/quizzes/ need 6 levels
        // houses(1)/forge(2)/applets(3)/comptia-aplus(4)/core-2(5)/quizzes(6)/file.html
        filePattern: /houses\/[^/]+\/applets\/comptia-aplus\/core-[^/]+\/quizzes\//,
        targetPattern: /components\//,
        minDepth: 6,
        description: 'CompTIA quiz files'
    },
    {
        // Files in dark-arts/vault/*/ (dojo, labs, modules, etc.) - exactly 3 levels
        // dark-arts(1)/vault(2)/dojo(3)/index.html → ../../../components/
        filePattern: /^dark-arts\/vault\/[^/]+\/[^/]+\.html$/,
        targetPattern: /components\//,
        exactDepth: 3,
        description: 'Dark Arts vault subdirectory files'
    },
    {
        // Files in dark-arts/vault/gates/*/ - exactly 4 levels
        // dark-arts(1)/vault(2)/gates(3)/gate-8(4)/file.html → ../../../../components/
        filePattern: /^dark-arts\/vault\/gates\/[^/]+\/[^/]+\.html$/,
        targetPattern: /components\//,
        exactDepth: 4,
        description: 'Dark Arts gate files'
    },
    {
        // Arena box pages - exactly 3 levels
        // arena(1)/boxes(2)/a1-ancient-ledger(3)/index.html → ../../../components/
        filePattern: /^arena\/boxes\/[^/]+\/index\.html$/,
        targetPattern: /components\//,
        exactDepth: 3,
        description: 'arena box pages'
    },
    {
        // Dispatch box pages - exactly 3 levels
        // dispatch(1)/boxes(2)/os001-boot-failure(3)/index.html → ../../../components/
        filePattern: /^dispatch\/boxes\/[^/]+\/index\.html$/,
        targetPattern: /components\//,
        exactDepth: 3,
        description: 'dispatch box pages'
    },
    {
        // Forensics hub module pages - exactly 3 levels
        // houses(1)/eye(2)/forensics(3)/sections(4)/track(5)/file.html → ../../../../../components/
        filePattern: /^houses\/eye\/forensics\/sections\/[^/]+\/[^/]+\.html$/,
        targetPattern: /components\//,
        exactDepth: 5,
        description: 'forensics hub module files'
    },
    {
        // Wireshark hub module pages - exactly 3 levels
        // wireshark(1)/sections(2)/security-analysis(3)/file.html → ../../../components/
        filePattern: /^wireshark\/sections\/[^/]+\/[^/]+\.html$/,
        targetPattern: /components\//,
        exactDepth: 3,
        description: 'wireshark hub module files'
    },
    {
        // AI house certifications - exactly 4 levels
        // houses(1)/ai(2)/certifications(3)/ai-102(4)/file.html → ../../../../components/
        filePattern: /^houses\/ai\/certifications\/[^/]+\/[^/]+\.html$/,
        targetPattern: /components\//,
        exactDepth: 4,
        description: 'AI certification module files'
    },
    {
        // AI house advanced - exactly 3 levels
        // houses(1)/ai(2)/advanced(3)/file.html → ../../../components/
        filePattern: /^houses\/ai\/advanced\/[^/]+\.html$/,
        targetPattern: /components\//,
        exactDepth: 3,
        description: 'AI advanced module files'
    },
    {
        // AI house cortex subdirectories - exactly 4 levels
        // houses(1)/ai(2)/cortex(3)/math(4)/file.html → ../../../../components/
        filePattern: /^houses\/ai\/cortex\/[^/]+\/[^/]+\.html$/,
        targetPattern: /components\//,
        exactDepth: 4,
        description: 'AI cortex module files'
    },
    {
        // AI house azure-openai - exactly 3 levels
        // houses(1)/ai(2)/azure-openai(3)/file.html → ../../../components/
        filePattern: /^houses\/ai\/azure-openai\/[^/]+\.html$/,
        targetPattern: /components\//,
        exactDepth: 3,
        description: 'AI azure-openai module files'
    },
    {
        // Code house algorithm-chamber subdirectories - exactly 4 levels
        // houses(1)/code(2)/algorithm-chamber(3)/sorting(4)/file.html → ../../../../components/
        filePattern: /^houses\/code\/algorithm-chamber\/[^/]+\/[^/]+\.html$/,
        targetPattern: /components\//,
        exactDepth: 4,
        description: 'algorithm chamber module files'
    }
];

// Confidence thresholds
const CONFIDENCE = {
    HIGH: 0.95,
    MEDIUM: 0.70
};

class PathValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.rootPath = options.rootPath || './_app';
        this.checkedPaths = new Map();
        this.profile = options.profile || 'ci'; // ci, strict, inventory

        // Cache for file index (populated lazily)
        this._fileIndex = null;
        this._fileIndexTime = null;
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

    // Dynamic path patterns - warn but don't error
    dynamicPathPatterns = [
        /\+\s*['"`]/,       // String concatenation
        /\$\{/,             // Template literal
        /\[.*?\]/,          // Bracket notation
        // JS object references (window.foo, document.querySelector, location.href).
        // The negative lookahead exempts known asset extensions to avoid FPs on
        // literal filenames where "document" or "window" is the stem and the
        // following "." is the extension separator (e.g., icon-document.webp,
        // icon-window.webp). Word boundary `\b` matches across hyphens, which
        // is why the bare patterns previously fired on those filenames.
        // Suffix `[a-zA-Z_$]` requires a JS identifier character (incl. $) so
        // jQuery/Vue-style refs like window.$store are still caught.
        /\bwindow\.(?!(?:webp|png|jpg|jpeg|gif|svg|ico|bmp|html|htm|css|js|json|md|txt|pdf|zip|mp4|mp3|wav)\b)[a-zA-Z_$]/,
        /\bdocument\.(?!(?:webp|png|jpg|jpeg|gif|svg|ico|bmp|html|htm|css|js|json|md|txt|pdf|zip|mp4|mp3|wav)\b)[a-zA-Z_$]/,
        /\blocation\.(?!(?:webp|png|jpg|jpeg|gif|svg|ico|bmp|html|htm|css|js|json|md|txt|pdf|zip|mp4|mp3|wav)\b)[a-zA-Z_$]/
    ];

    /**
     * Validate paths in HTML file
     */
    validate(file) {
        const issues = [];

        // Skip files in _source/ and _archive/ — these are pre-render sources or
        // archived content, not navigable; broken script paths there are not bugs.
        if (file.path.includes('/_source/') || file.path.includes('/_archive/')) {
            return issues;
        }

        const content = file.content;
        const fileDir = path.dirname(file.path);

        // Resolve fileDir relative to rootPath
        const absoluteFileDir = path.isAbsolute(fileDir)
            ? fileDir
            : path.resolve(this.rootPath, fileDir);

        // PROACTIVE: Check structural depth rules first (prevents bugs before they happen)
        issues.push(...this.checkStructuralDepthRules(file));

        // PROACTIVE: Check for doubled path segments (houses/X/houses/X/)
        issues.push(...this.checkDoubledPathSegments(file));

        issues.push(...this.checkScriptPaths(file, absoluteFileDir));
        issues.push(...this.checkLinkPaths(file, absoluteFileDir));
        issues.push(...this.checkImgPaths(file, absoluteFileDir));

        // Anchor paths promoted to CI — catches dead <a href> links in all scans
        issues.push(...this.checkAnchorPaths(file, absoluteFileDir));

        // Dynamic imports still strict-only (noisy, low signal)
        if (this.profile === 'strict') {
            issues.push(...this.checkDynamicImports(file, absoluteFileDir));
        }

        return issues;
    }

    /**
     * Check structural depth rules - PROACTIVE prevention
     * These rules fire based on file location + path pattern, regardless of whether
     * the target file exists. This catches depth bugs at the pattern level.
     *
     * Now includes anchor validation to catch paths with correct depth that resolve
     * to the wrong directory.
     *
     * Example: A file at houses/eye/applets/cyberops/week2/index.html
     * referencing ../../../../components/ is ALWAYS wrong (needs 5 levels, not 4)
     */
    checkStructuralDepthRules(file) {
        const issues = [];
        const content = file.content;
        const filePath = file.path;

        // Find all script/link src/href references that target known anchor directories
        // Expanded to catch any anchor directory, not just components/
        const anchorPattern = ANCHOR_DIRECTORIES.join('|');
        const patterns = [
            { regex: new RegExp(`<script[^>]*\\ssrc\\s*=\\s*["']([^"']*(?:${anchorPattern})\\/[^"']+)["'][^>]*>`, 'gi'), type: 'script' },
            { regex: new RegExp(`<link[^>]*\\shref\\s*=\\s*["']([^"']*(?:${anchorPattern})\\/[^"']+)["'][^>]*>`, 'gi'), type: 'stylesheet' }
        ];

        for (const rule of STRUCTURAL_DEPTH_RULES) {
            // Check if this file matches the rule's file pattern
            if (!rule.filePattern.test(filePath)) {
                continue;
            }

            // File matches - now check all anchor references
            for (const { regex, type } of patterns) {
                regex.lastIndex = 0; // Reset regex state
                let match;

                while ((match = regex.exec(content)) !== null) {
                    const refPath = match[1];

                    // Skip external URLs
                    if (this.shouldSkipUrl(refPath)) {
                        continue;
                    }

                    // Check if this reference targets what the rule cares about
                    if (!rule.targetPattern.test(refPath)) {
                        continue;
                    }

                    // Count the ../ depth in the reference
                    const depthMatch = refPath.match(/^((?:\.\.\/)+)/);
                    const actualDepth = depthMatch ? (depthMatch[1].match(/\.\.\//g) || []).length : 0;
                    const line = this.getLineNumber(content, match.index);

                    // Get required depth (exactDepth takes precedence over minDepth)
                    const requiredDepth = rule.exactDepth !== undefined ? rule.exactDepth : rule.minDepth;

                    // If depth is insufficient (undershoot), flag it
                    if (actualDepth < requiredDepth) {
                        const correctPrefix = '../'.repeat(requiredDepth);
                        const pathAfterDots = refPath.replace(/^(?:\.\.\/)+/, '');
                        const correctPath = correctPrefix + pathAfterDots;

                        issues.push({
                            code: 'PATH-DEPTH-001',
                            severity: 'high',
                            category: 'path',
                            bucket: BUCKET_TYPES.STRUCTURAL_DEPTH,
                            message: `Insufficient path depth for ${rule.description}: ${refPath} (needs ${requiredDepth} levels, has ${actualDepth})`,
                            file: filePath,
                            line,
                            missingPath: refPath,
                            actualDepth,
                            requiredDepth,
                            suggestion: {
                                path: correctPath,
                                confidence: 1.0,  // Structural rules are 100% confident
                                reason: `${rule.description} require ${requiredDepth}+ levels to reach ${this.getExpectedAnchor(refPath) || 'target'}/`
                            },
                            autoFixable: true,
                            fix: `Change path to: ${correctPath}`
                        });
                        continue; // Don't also report anchor issue for same path
                    }

                    // Check for overshoot (too many ../)
                    // For exactDepth rules: flag if actual > exact
                    // For maxDepth rules: flag if actual > max
                    const maxAllowed = rule.exactDepth !== undefined ? rule.exactDepth : rule.maxDepth;
                    if (maxAllowed !== undefined && actualDepth > maxAllowed) {
                        const correctPrefix = '../'.repeat(maxAllowed);
                        const pathAfterDots = refPath.replace(/^(?:\.\.\/)+/, '');
                        const correctPath = correctPrefix + pathAfterDots;

                        issues.push({
                            code: 'PATH-DEPTH-002',
                            severity: 'high',
                            category: 'path',
                            bucket: BUCKET_TYPES.STRUCTURAL_OVERSHOOT,
                            message: `Excessive path depth (overshoot): ${actualDepth} levels, expected ${maxAllowed} for ${rule.description}`,
                            file: filePath,
                            line,
                            missingPath: refPath,
                            actualDepth,
                            requiredDepth: maxAllowed,
                            suggestion: {
                                path: correctPath,
                                confidence: 1.0,  // Structural rules are 100% confident
                                reason: `${rule.description} require exactly ${maxAllowed} level(s) to reach ${this.getExpectedAnchor(refPath) || 'target'}/`
                            },
                            autoFixable: true,
                            fix: `Change path to: ${correctPath}`
                        });
                        continue; // Don't also report anchor issue for same path
                    }

                    // ANCHOR VALIDATION: Even if depth count is correct, verify resolution
                    // This catches bugs where depth matches numerically but resolves wrong
                    const expectedAnchor = this.getExpectedAnchor(refPath);
                    if (expectedAnchor) {
                        const resolution = this.getResolvedAnchor(filePath, refPath);

                        if (resolution.valid && resolution.anchor !== expectedAnchor) {
                            // Path resolves to wrong directory!
                            const correctPrefix = '../'.repeat(requiredDepth);
                            const pathAfterDots = refPath.replace(/^(?:\.\.\/)+/, '');
                            const correctPath = correctPrefix + pathAfterDots;

                            issues.push({
                                code: 'PATH-ANCHOR-001',
                                severity: 'high',
                                category: 'path',
                                bucket: BUCKET_TYPES.WRONG_ANCHOR,
                                message: `Path targets wrong directory: expected '${expectedAnchor}/', resolves to '${resolution.anchor}/${pathAfterDots.split('/').slice(1).join('/') || ''}'`,
                                file: filePath,
                                line,
                                missingPath: refPath,
                                expectedAnchor,
                                actualAnchor: resolution.anchor,
                                resolvedPath: resolution.resolvedPath,
                                actualDepth,
                                requiredDepth,
                                suggestion: {
                                    path: correctPath,
                                    confidence: 1.0,
                                    reason: `Path needs ${requiredDepth} levels up to reach ${expectedAnchor}/, currently resolves to ${resolution.anchor}/`
                                },
                                autoFixable: true,
                                fix: `Change path to: ${correctPath}`
                            });
                        }
                    }
                }
            }
        }

        return issues;
    }

    /**
     * Check for doubled path segments in href/src attributes.
     * Catches patterns like houses/shield/houses/shield/ which always produce 404s.
     * Also detects any repeated consecutive directory segment (e.g., components/foo/components/foo/).
     *
     * Code: PATH-DUP-001
     * Severity: HIGH (always causes 404)
     */
    checkDoubledPathSegments(file) {
        const issues = [];
        const content = file.content;

        // Extract all href/src values from HTML attributes
        const attrPattern = /(?:src|href)\s*=\s*["']([^"']+)["']/gi;
        let match;

        while ((match = attrPattern.exec(content)) !== null) {
            const refPath = match[1];

            // Skip external URLs and anchors
            if (/^(https?:|\/\/|data:|javascript:|mailto:|#)/.test(refPath)) continue;

            // Check for doubled directory segments: any segment pair that repeats
            // e.g., houses/shield/houses/shield/ or components/foo/components/foo/
            const segments = refPath.replace(/^(\.\.\/)+/, '').split('/');
            for (let i = 0; i < segments.length - 1; i++) {
                // Look for a sequence of 2+ segments that repeats starting at position i
                for (let len = 1; len <= Math.floor((segments.length - i) / 2); len++) {
                    const chunk = segments.slice(i, i + len).join('/');
                    const next = segments.slice(i + len, i + len * 2).join('/');
                    if (chunk === next && chunk.length > 0) {
                        const line = this.getLineNumber(content, match.index);
                        const repeated = chunk;
                        // Build the de-duped path
                        const prefix = refPath.match(/^((?:\.\.\/)+)/)?.[1] || '';
                        const deduped = prefix + segments.filter((_, idx) => idx < i || idx >= i + len).join('/');

                        issues.push({
                            code: 'PATH-DUP-001',
                            severity: 'high',
                            category: 'path',
                            bucket: BUCKET_TYPES.DOUBLED_SEGMENT,
                            message: `Doubled path segment '${repeated}' — resolves to wrong location (404)`,
                            file: file.path,
                            line,
                            missingPath: refPath,
                            suggestion: {
                                path: deduped,
                                confidence: 1.0,
                                reason: `Remove repeated '${repeated}' segment`
                            },
                            autoFixable: true,
                            fix: `Change path to: ${deduped}`
                        });
                        // Only report first doubled segment per path
                        break;
                    }
                }
                // Break outer loop too if we found one
                if (issues.length > 0 && issues[issues.length - 1].missingPath === refPath) break;
            }
        }

        // Also check JS string literals that look like navigation paths
        // Catches: window.location.href = `houses/${id}/${href}` where href already contains houses/
        const jsNavPattern = /window\.location\.href\s*=\s*[`'"](houses\/[^`'"]+)[`'"]/g;
        while ((match = jsNavPattern.exec(content)) !== null) {
            const navPath = match[1];
            const segments = navPath.split('/');
            for (let i = 0; i < segments.length - 1; i++) {
                for (let len = 1; len <= Math.floor((segments.length - i) / 2); len++) {
                    const chunk = segments.slice(i, i + len).join('/');
                    const next = segments.slice(i + len, i + len * 2).join('/');
                    if (chunk === next && chunk.length > 0) {
                        const line = this.getLineNumber(content, match.index);
                        issues.push({
                            code: 'PATH-DUP-001',
                            severity: 'high',
                            category: 'path',
                            bucket: BUCKET_TYPES.DOUBLED_SEGMENT,
                            message: `JS navigation produces doubled path segment '${chunk}'`,
                            file: file.path,
                            line,
                            missingPath: navPath,
                            fix: `Check navigation logic — href may already include 'houses/' prefix`
                        });
                        break;
                    }
                }
                if (issues.length > 0 && issues[issues.length - 1].missingPath === navPath) break;
            }
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

            // Check for dynamic path construction
            if (this.isDynamicPath(src)) {
                issues.push(this.createDynamicIssue(file, src, line, 'PATH-001', 'script'));
                continue;
            }

            const resolved = this.resolvePath(src, fileDir);
            const exists = this.checkExists(resolved);

            if (!exists) {
                const analysis = this.analyzePathIssue(src, resolved, fileDir, file.path, '.js');
                issues.push({
                    code: 'PATH-001',
                    severity: 'high',  // Scripts are critical
                    category: 'path',
                    bucket: analysis.bucket,
                    message: `Script not found: ${src}`,
                    file: file.path,
                    line,
                    missingPath: src,
                    resolvedPath: resolved,
                    suggestion: analysis.suggestion,
                    autoFixable: analysis.autoFixable,
                    fix: analysis.suggestion
                        ? `Change path to: ${analysis.suggestion.path}`
                        : `Create ${src} or fix the path`,
                    suggestions: analysis.allMatches || []
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

            // Check for dynamic path construction
            if (this.isDynamicPath(href)) {
                issues.push(this.createDynamicIssue(file, href, line, 'PATH-002', 'stylesheet'));
                continue;
            }

            const resolved = this.resolvePath(href, fileDir);
            const exists = this.checkExists(resolved);

            if (!exists) {
                const analysis = this.analyzePathIssue(href, resolved, fileDir, file.path, '.css');
                issues.push({
                    code: 'PATH-002',
                    severity: 'medium',  // CSS is important but not critical
                    category: 'path',
                    bucket: analysis.bucket,
                    message: `Stylesheet not found: ${href}`,
                    file: file.path,
                    line,
                    missingPath: href,
                    resolvedPath: resolved,
                    suggestion: analysis.suggestion,
                    autoFixable: analysis.autoFixable,
                    fix: analysis.suggestion
                        ? `Change path to: ${analysis.suggestion.path}`
                        : `Create ${href} or fix the path`,
                    suggestions: analysis.allMatches || []
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

            // Check for dynamic path construction
            if (this.isDynamicPath(src)) {
                issues.push(this.createDynamicIssue(file, src, line, 'PATH-003', 'image'));
                continue;
            }

            const resolved = this.resolvePath(src, fileDir);
            const exists = this.checkExists(resolved);

            if (!exists) {
                const ext = path.extname(src) || '.png';
                const analysis = this.analyzePathIssue(src, resolved, fileDir, file.path, ext);
                issues.push({
                    code: 'PATH-003',
                    severity: 'low',  // Images are cosmetic
                    category: 'path',
                    bucket: analysis.bucket,
                    message: `Image not found: ${src}`,
                    file: file.path,
                    line,
                    missingPath: src,
                    resolvedPath: resolved,
                    suggestion: analysis.suggestion,
                    autoFixable: analysis.autoFixable,
                    fix: analysis.suggestion
                        ? `Change path to: ${analysis.suggestion.path}`
                        : `Add image at ${src} or fix the path`,
                    suggestions: analysis.allMatches || []
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

        // Pattern 1: Standard <a href="..."> tags
        // Pattern 2: JS object href/gateHref properties (e.g., vault LEVELS config)
        const patterns = [
            /<a[^>]*\shref\s*=\s*["']([^"'#]+\.html)["'][^>]*>/gi,
            /(?:href|gateHref):\s*["']([^"'#]+\.html)["']/gi
        ];

        for (const anchorPattern of patterns) {
            let match;
            while ((match = anchorPattern.exec(content)) !== null) {
                const href = match[1];
                const line = this.getLineNumber(content, match.index);

                if (this.shouldSkipUrl(href)) {
                    continue;
                }

                // Check for dynamic path construction
                if (this.isDynamicPath(href)) {
                    issues.push(this.createDynamicIssue(file, href, line, 'PATH-004', 'link'));
                    continue;
                }

                const resolved = this.resolvePath(href, fileDir);
                const exists = this.checkExists(resolved);

                if (!exists) {
                    const analysis = this.analyzePathIssue(href, resolved, fileDir, file.path, '.html');
                    issues.push({
                        code: 'PATH-004',
                        severity: 'low',
                        category: 'path',
                        bucket: analysis.bucket,
                        message: `Linked page not found: ${href}`,
                        file: file.path,
                        line,
                        missingPath: href,
                        resolvedPath: resolved,
                        suggestion: analysis.suggestion,
                        autoFixable: analysis.autoFixable,
                        fix: analysis.suggestion
                            ? `Change path to: ${analysis.suggestion.path}`
                            : `Create ${href} or fix the link`,
                        suggestions: analysis.allMatches || []
                    });
                }
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

                // Check for dynamic path construction
                if (this.isDynamicPath(importPath)) {
                    issues.push(this.createDynamicIssue(file, importPath, line, 'PATH-005', 'dynamic import'));
                    continue;
                }

                const resolved = this.resolvePath(importPath, fileDir);
                const exists = this.checkExists(resolved);

                if (!exists) {
                    const ext = path.extname(importPath) || '.js';
                    const analysis = this.analyzePathIssue(importPath, resolved, fileDir, file.path, ext);
                    issues.push({
                        code: 'PATH-005',
                        severity: 'medium',
                        category: 'path',
                        bucket: analysis.bucket,
                        message: `Dynamic import target not found: ${importPath}`,
                        file: file.path,
                        line,
                        missingPath: importPath,
                        resolvedPath: resolved,
                        suggestion: analysis.suggestion,
                        autoFixable: analysis.autoFixable,
                        fix: analysis.suggestion
                            ? `Change path to: ${analysis.suggestion.path}`
                            : `Create ${importPath} or fix the path`,
                        suggestions: analysis.allMatches || []
                    });
                }
            }
        }

        return issues;
    }

    // =========================================================================
    // INTELLIGENT ISSUE BUCKETING
    // =========================================================================

    /**
     * Analyze a path issue and determine its bucket + suggestion
     * @param {string} missingPath - The original path from the source
     * @param {string} resolvedPath - The fully resolved path that was checked
     * @param {string} fileDir - Directory of the source file
     * @param {string} sourceFile - Path to the source file
     * @param {string} expectedExt - Expected file extension
     * @returns {Object} Analysis result with bucket, suggestion, autoFixable
     */
    analyzePathIssue(missingPath, resolvedPath, fileDir, sourceFile, expectedExt) {
        const filename = path.basename(missingPath);

        // 1. Check for case mismatch first (common on Linux)
        const caseMismatch = this.checkCaseMismatch(resolvedPath, filename);
        if (caseMismatch) {
            const correctedPath = this.buildCorrectedPath(missingPath, caseMismatch.correctName);
            return {
                bucket: BUCKET_TYPES.CASE_MISMATCH,
                suggestion: {
                    path: correctedPath,
                    confidence: 0.99,
                    reason: `File exists as "${caseMismatch.correctName}" (case difference)`
                },
                autoFixable: true,
                allMatches: [{
                    path: correctedPath,
                    confidence: 0.99,
                    location: caseMismatch.fullPath
                }]
            };
        }

        // 2. Search for file in codebase
        const matches = this.findFileInCodebase(filename, expectedExt);

        if (matches.length === 0) {
            // File truly doesn't exist anywhere
            return {
                bucket: BUCKET_TYPES.MISSING_LOCAL,
                suggestion: null,
                autoFixable: false,
                allMatches: []
            };
        }

        // 3. Analyze matches to determine bucket
        const sourceSubtree = this.getSubtree(sourceFile);
        const scoredMatches = matches.map(match => {
            const relativePath = this.calculateRelativePath(sourceFile, match.path);
            const confidence = this.assessConfidence(match, sourceFile, sourceSubtree, missingPath);
            return {
                path: relativePath,
                confidence,
                reason: this.buildReason(match, sourceSubtree, missingPath),
                location: match.path
            };
        }).sort((a, b) => b.confidence - a.confidence);

        const bestMatch = scoredMatches[0];

        // Determine bucket based on analysis
        let bucket;
        if (this.isDepthMismatch(missingPath, bestMatch.path, filename)) {
            bucket = BUCKET_TYPES.WRONG_RELATIVE_DEPTH;
        } else {
            bucket = BUCKET_TYPES.MOVED_RENAMED;
        }

        // Determine auto-fixability
        const autoFixable = (bucket === BUCKET_TYPES.WRONG_RELATIVE_DEPTH && bestMatch.confidence >= CONFIDENCE.HIGH) ||
                           (bucket === BUCKET_TYPES.CASE_MISMATCH);

        return {
            bucket,
            suggestion: bestMatch,
            autoFixable,
            allMatches: scoredMatches.slice(0, 5) // Top 5 matches
        };
    }

    /**
     * Check if file exists with different case
     */
    checkCaseMismatch(resolvedPath, filename) {
        const dir = path.dirname(resolvedPath);

        try {
            if (!fs.existsSync(dir)) {
                return null;
            }

            const files = fs.readdirSync(dir);
            const lowerFilename = filename.toLowerCase();

            for (const file of files) {
                if (file.toLowerCase() === lowerFilename && file !== filename) {
                    return {
                        correctName: file,
                        fullPath: path.join(dir, file)
                    };
                }
            }
        } catch (e) {
            // Directory read failed
        }

        return null;
    }

    /**
     * Build corrected path with correct filename case
     */
    buildCorrectedPath(originalPath, correctFilename) {
        const dir = path.dirname(originalPath);
        if (dir === '.') {
            return correctFilename;
        }
        return path.join(dir, correctFilename).replace(/\\/g, '/');
    }

    /**
     * Check if the issue is a relative depth mismatch
     */
    isDepthMismatch(originalPath, suggestedPath, filename) {
        // Count ../ segments
        const originalDepth = (originalPath.match(/\.\.\//g) || []).length;
        const suggestedDepth = (suggestedPath.match(/\.\.\//g) || []).length;

        // If only the depth differs, it's a depth mismatch
        const originalFilename = path.basename(originalPath);
        const suggestedFilename = path.basename(suggestedPath);

        return originalFilename === suggestedFilename && originalDepth !== suggestedDepth;
    }

    // =========================================================================
    // FILE SEARCH HELPERS
    // =========================================================================

    /**
     * Find all instances of a filename in the codebase
     * @param {string} filename - Filename to search for
     * @param {string} expectedExt - Expected extension
     * @returns {Array} Array of match objects {path, subtree}
     */
    findFileInCodebase(filename, expectedExt) {
        const matches = [];
        const index = this.getFileIndex();

        // Normalize filename for comparison
        const normalizedFilename = filename.toLowerCase();

        for (const [filePath, info] of index.entries()) {
            const fileBasename = path.basename(filePath).toLowerCase();

            // Exact match (case-insensitive)
            if (fileBasename === normalizedFilename) {
                matches.push({
                    path: filePath,
                    subtree: info.subtree,
                    exactMatch: true
                });
            }
            // Extension-corrected match (e.g., looking for .js but it's .mjs)
            else if (expectedExt &&
                     path.basename(filePath, path.extname(filePath)).toLowerCase() ===
                     path.basename(filename, expectedExt).toLowerCase()) {
                matches.push({
                    path: filePath,
                    subtree: info.subtree,
                    exactMatch: false
                });
            }
        }

        return matches;
    }

    /**
     * Build/retrieve file index for the codebase
     * Cached for performance
     */
    getFileIndex() {
        // Return cached index if still valid (5 minute TTL)
        const now = Date.now();
        if (this._fileIndex && this._fileIndexTime && (now - this._fileIndexTime < 300000)) {
            return this._fileIndex;
        }

        this._fileIndex = new Map();
        this._fileIndexTime = now;

        try {
            this.indexDirectory(this.rootPath, this._fileIndex);
        } catch (e) {
            if (this.verbose) {
                console.warn(`[PATH] Failed to build file index: ${e.message}`);
            }
        }

        return this._fileIndex;
    }

    /**
     * Recursively index directory
     */
    indexDirectory(dir, index, depth = 0) {
        // Limit recursion depth
        if (depth > 15) return;

        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                // Skip hidden and common non-content directories
                if (entry.name.startsWith('.') ||
                    entry.name === 'node_modules' ||
                    entry.name === '_archive' ||
                    entry.name === '_planning') {
                    continue;
                }

                if (entry.isDirectory()) {
                    this.indexDirectory(fullPath, index, depth + 1);
                } else if (entry.isFile()) {
                    const subtree = this.getSubtree(fullPath);
                    index.set(fullPath, { subtree });
                }
            }
        } catch (e) {
            // Directory read failed - skip
        }
    }

    /**
     * Get subtree identifier from path (e.g., "houses/web", "components")
     */
    getSubtree(filePath) {
        const relative = path.relative(this.rootPath, filePath);
        const parts = relative.split(path.sep);

        // For houses, return "houses/<houseName>"
        if (parts[0] === 'houses' && parts.length > 1) {
            return `houses/${parts[1]}`;
        }

        // For other top-level dirs, return just the dir name
        return parts[0] || '';
    }

    /**
     * Calculate relative path from source file to target file
     * @param {string} fromFile - Source file path
     * @param {string} toFile - Target file path
     * @returns {string} Relative path
     */
    calculateRelativePath(fromFile, toFile) {
        const fromDir = path.dirname(fromFile);

        // Handle both absolute and relative paths
        const fromAbsolute = path.isAbsolute(fromDir)
            ? fromDir
            : path.resolve(this.rootPath, fromDir);
        const toAbsolute = path.isAbsolute(toFile)
            ? toFile
            : path.resolve(this.rootPath, toFile);

        let relativePath = path.relative(fromAbsolute, toAbsolute);

        // Ensure path uses forward slashes and starts with ./ or ../
        relativePath = relativePath.replace(/\\/g, '/');
        if (!relativePath.startsWith('.') && !relativePath.startsWith('/')) {
            relativePath = './' + relativePath;
        }

        return relativePath;
    }

    /**
     * Assess confidence of a match
     * @param {Object} match - Match object from findFileInCodebase
     * @param {string} sourceFile - Source file path
     * @param {string} sourceSubtree - Subtree of source file
     * @param {string} originalPath - Original broken path
     * @returns {number} Confidence score 0-1
     */
    assessConfidence(match, sourceFile, sourceSubtree, originalPath) {
        let confidence = 0.5; // Base confidence

        // Exact filename match
        if (match.exactMatch) {
            confidence += 0.2;
        }

        // Same subtree (e.g., same house)
        if (match.subtree === sourceSubtree) {
            confidence += 0.25;
        }
        // Related subtree (e.g., components referenced from houses)
        else if (this.areSubtreesRelated(sourceSubtree, match.subtree)) {
            confidence += 0.15;
        }

        // Check if the directory structure hints match
        const originalDir = path.dirname(originalPath);
        const matchDir = path.dirname(match.path);
        if (matchDir.includes(path.basename(originalDir))) {
            confidence += 0.1;
        }

        // Unique match in subtree gets bonus
        // (This would require counting matches, simplified here)

        return Math.min(confidence, 1.0);
    }

    /**
     * Check if two subtrees are commonly related
     */
    areSubtreesRelated(subtree1, subtree2) {
        // Components and config are commonly referenced from houses
        const commonRoots = ['components', 'config', 'utils', 'styles', 'assets'];
        return commonRoots.includes(subtree1) || commonRoots.includes(subtree2);
    }

    /**
     * Build human-readable reason for suggestion
     */
    buildReason(match, sourceSubtree, originalPath) {
        if (match.subtree === sourceSubtree) {
            return 'File exists in same module/house';
        }
        if (this.areSubtreesRelated(sourceSubtree, match.subtree)) {
            return `File exists in related location (${match.subtree})`;
        }
        return `File exists elsewhere in codebase (${match.subtree})`;
    }

    // =========================================================================
    // ANCHOR RESOLUTION
    // =========================================================================

    /**
     * Resolve a relative path from a file location and return the first anchor directory
     *
     * An "anchor" is the first meaningful directory component after path resolution.
     * This helps detect when a path has correct depth numerically but resolves to
     * the wrong target directory.
     *
     * @param {string} filePath - Path to the source file (relative to rootPath)
     * @param {string} relativePath - The relative path being resolved (e.g., "../../components/Foo.js")
     * @returns {Object} Resolution info with anchor and full resolved path
     *
     * @example
     * // From houses/web/labs/x.html, resolving ../../components/Foo.js
     * getResolvedAnchor('houses/web/labs/x.html', '../../components/Foo.js')
     * // Returns: { anchor: 'components', resolvedPath: 'components/Foo.js', valid: true }
     *
     * @example
     * // Wrong depth: houses/web/labs/x.html with ../components/Foo.js (only 1 level up)
     * getResolvedAnchor('houses/web/labs/x.html', '../components/Foo.js')
     * // Returns: { anchor: 'web', resolvedPath: 'houses/web/components/Foo.js', valid: true }
     */
    getResolvedAnchor(filePath, relativePath) {
        // Get directory of the source file
        const fileDir = path.dirname(filePath);
        const dirParts = fileDir.split('/').filter(p => p && p !== '.');

        // Count ../ levels in the relative path
        const depthMatch = relativePath.match(/^((?:\.\.\/)+)/);
        const depth = depthMatch ? (depthMatch[1].match(/\.\.\//g) || []).length : 0;

        // Get the path portion after ../
        const pathAfterDots = relativePath.replace(/^(?:\.\.\/)+/, '');

        // Check if we're going past the root (too many ../)
        if (depth > dirParts.length) {
            return {
                anchor: null,
                resolvedPath: null,
                valid: false,
                error: 'PATH_ESCAPE',
                message: `Path escapes root directory (${depth} levels up from ${dirParts.length}-deep path)`
            };
        }

        // Calculate remaining directory parts after navigating up
        const remainingDirParts = dirParts.slice(0, dirParts.length - depth);

        // Build the resolved path
        const resolvedPath = [...remainingDirParts, pathAfterDots].join('/');

        // Extract the anchor (first directory component of resolved path)
        const resolvedParts = resolvedPath.split('/').filter(p => p && p !== '.');
        const anchor = resolvedParts[0] || null;

        return {
            anchor,
            resolvedPath,
            valid: true,
            depth,
            remainingDir: remainingDirParts.join('/')
        };
    }

    /**
     * Get expected anchor from a path reference
     * Extracts what the path is TRYING to reach based on its structure
     *
     * @param {string} relativePath - The relative path (e.g., "../../components/Foo.js")
     * @returns {string|null} Expected anchor directory or null if not determinable
     */
    getExpectedAnchor(relativePath) {
        // Remove leading ../ to find what comes after
        const pathAfterDots = relativePath.replace(/^(?:\.\.\/)+/, '');
        const firstPart = pathAfterDots.split('/')[0];

        // Only return if it's a known anchor
        if (ANCHOR_DIRECTORIES.includes(firstPart)) {
            return firstPart;
        }

        return null;
    }

    // =========================================================================
    // DYNAMIC PATH DETECTION
    // =========================================================================

    /**
     * Check if path contains dynamic/variable components
     */
    isDynamicPath(pathStr) {
        for (const pattern of this.dynamicPathPatterns) {
            if (pattern.test(pathStr)) {
                return true;
            }
        }
        // Trailing separator (-, _, =, ?) strongly indicates JS string
        // concatenation captured mid-construction by the regex extractor —
        // e.g., '/assets/images/icons/icon-' + cfg.actionIcon. The static
        // prefix is a real path stem; the runtime path is dynamic.
        // Resolves the PATH-003 FP class for inline JS innerHTML strings.
        if (/[-_=?]$/.test(pathStr)) {
            return true;
        }
        return false;
    }

    /**
     * Create issue for dynamic path (warn only)
     */
    createDynamicIssue(file, pathStr, line, code, resourceType) {
        return {
            code,
            severity: 'info',  // Info only - can't validate dynamic paths
            category: 'path',
            bucket: BUCKET_TYPES.DYNAMIC_LOAD,
            message: `Dynamic ${resourceType} path cannot be validated: ${pathStr}`,
            file: file.path,
            line,
            missingPath: pathStr,
            resolvedPath: null,
            suggestion: null,
            autoFixable: false,
            fix: 'Manual review required - path is constructed dynamically'
        };
    }

    // =========================================================================
    // URL HANDLING
    // =========================================================================

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

        // Firebase Hosting reserved URLs — injected at serve time, not on disk
        if (url.startsWith('/__/')) {
            return true;
        }

        return false;
    }

    /**
     * Resolve a relative path from file directory
     * Strips querystring and hash fragments before resolving (e.g., script.js?76720)
     */
    resolvePath(targetPath, fileDir) {
        const cleanPath = targetPath.split('?')[0].split('#')[0];
        if (cleanPath.startsWith('/')) {
            return path.join(this.rootPath, cleanPath);
        }
        return path.resolve(fileDir, cleanPath);
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
     * Suggest similar paths that do exist (legacy method for compatibility)
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

// Export bucket types, rules, and anchors for external use
PathValidator.BUCKET_TYPES = BUCKET_TYPES;
PathValidator.CONFIDENCE = CONFIDENCE;
PathValidator.STRUCTURAL_DEPTH_RULES = STRUCTURAL_DEPTH_RULES;
PathValidator.ANCHOR_DIRECTORIES = ANCHOR_DIRECTORIES;

module.exports = PathValidator;
