/**
 * EduScan - CSP Policy Validator
 *
 * Cross-references external domains used in code against the Content-Security-Policy
 * defined in firebase.json. Catches policy drift where new features introduce
 * external API calls that aren't covered by the CSP whitelist.
 *
 * Rules:
 * - CSP-001: External domain in code not covered by CSP policy
 */

const fs = require('fs');
const path = require('path');

class CSPValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.rootPath = options.rootPath || './_app';
        this.firebaseJsonPath = options.firebaseJsonPath || null;
        this.cspDirectives = null;
    }

    /**
     * Load and parse CSP from firebase.json
     * @returns {Object|null} Parsed CSP directives keyed by directive name
     */
    loadCSP() {
        // Find firebase.json (one level above _app typically)
        const searchPaths = [
            this.firebaseJsonPath,
            path.resolve(this.rootPath, '../firebase.json'),
            path.resolve(this.rootPath, 'firebase.json'),
            path.resolve(process.cwd(), 'firebase.json')
        ].filter(Boolean);

        let firebaseConfig = null;
        for (const searchPath of searchPaths) {
            try {
                const raw = fs.readFileSync(searchPath, 'utf8');
                firebaseConfig = JSON.parse(raw);
                break;
            } catch (e) {
                continue;
            }
        }

        if (!firebaseConfig) {
            if (this.verbose) {
                console.log('[CSP] firebase.json not found, skipping CSP validation');
            }
            return null;
        }

        // Extract CSP header from hosting config
        const headers = firebaseConfig.hosting?.headers || [];
        let cspValue = null;

        for (const headerBlock of headers) {
            const cspHeader = (headerBlock.headers || []).find(
                h => h.key.toLowerCase() === 'content-security-policy'
            );
            if (cspHeader) {
                cspValue = cspHeader.value;
                break;
            }
        }

        if (!cspValue) {
            if (this.verbose) {
                console.log('[CSP] No Content-Security-Policy header found in firebase.json');
            }
            return null;
        }

        // Parse CSP into directives
        this.cspDirectives = {};
        const parts = cspValue.split(';').map(s => s.trim()).filter(Boolean);
        for (const part of parts) {
            const tokens = part.split(/\s+/);
            const directive = tokens[0];
            const values = tokens.slice(1);
            this.cspDirectives[directive] = values;
        }

        return this.cspDirectives;
    }

    /**
     * Check if a domain is covered by a CSP directive.
     *
     * Browser behavior (per CSP Level 3): fallback to `default-src` happens
     * ONLY when the specific directive is COMPLETELY ABSENT from the policy.
     * If the directive is present (even with restrictive values, even empty),
     * the browser uses ONLY that directive — no fallback.
     *
     * Empirically caught 2026-05-04: prior version always fell back to
     * default-src, masking real bugs. Live hexworth.com has
     * `style-src 'self' 'unsafe-inline'` (no https:) and `default-src 'self' https:`
     * (with https:) — old logic said Google Fonts CSS was covered (false),
     * browser blocked it (true). Runtime monitor surfaced the discrepancy.
     *
     * The empty-array case (e.g., `style-src;` with no values) is correctly
     * handled by the natural fall-through: includes() returns false, no exact
     * match, returns false. Browsers treat empty directives as deny-all,
     * matching this behavior.
     *
     * @param {string} domain - e.g., "api.github.com" or "https://api.github.com"
     * @param {string} directive - e.g., "connect-src"
     * @returns {boolean}
     */
    isDomainCovered(domain, directive) {
        // Directive absent? Fall back to default-src per CSP spec.
        // (Guard against infinite recursion via the directive !== 'default-src' check.)
        if (this.cspDirectives[directive] === undefined) {
            if (directive !== 'default-src') {
                return this.isDomainCovered(domain, 'default-src');
            }
            return false;
        }

        const values = this.cspDirectives[directive];

        // Check for broad wildcards
        if (values.includes('*')) return true;
        if (values.includes('https:') && domain.startsWith('https://')) return true;
        if (values.includes('https:') && !domain.includes('://')) return true; // bare domain
        if (values.includes('wss:') && domain.startsWith('wss://')) return true;

        // Check for exact domain match
        const bareDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        for (const val of values) {
            const bareVal = val.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
            if (bareVal === bareDomain) return true;
            // Wildcard subdomain: *.example.com covers sub.example.com
            if (bareVal.startsWith('*.')) {
                const base = bareVal.substring(2);
                if (bareDomain === base || bareDomain.endsWith('.' + base)) return true;
            }
        }

        // Directive present but no match — do NOT fall back to default-src.
        // (Browser uses only the present directive.)
        return false;
    }

    /**
     * Determine which CSP directive governs a given usage context.
     *
     * @param {string} context - one of: 'fetch', 'xhr', 'connect', 'websocket',
     *   'eventsource', 'script', 'style', 'img', 'frame', 'font', 'manifest', 'object'
     * @returns {string} CSP directive name
     */
    getDirectiveForContext(context) {
        const map = {
            'fetch':       'connect-src',
            'xhr':         'connect-src',
            'connect':     'connect-src',  // <link rel="preconnect"|"dns-prefetch">
            'websocket':   'connect-src',
            'eventsource': 'connect-src',
            'script':      'script-src',
            'style':       'style-src',
            'img':         'img-src',
            'frame':       'frame-src',
            'font':        'font-src',
            'manifest':    'manifest-src',  // <link rel="manifest">
            'object':      'object-src'
        };
        return map[context] || 'default-src';
    }

    /**
     * Map a <link> tag's rel + as attributes to the CSP context that the
     * browser actually enforces. Returns null for unrecognized rel values
     * so the validator does NOT emit false positives.
     *
     * Per CSP Level 3 / browser behavior:
     *   stylesheet                 → style-src (loads the CSS file)
     *   preconnect, dns-prefetch   → connect-src (TCP/TLS connection hint)
     *   preload as=font            → font-src
     *   preload as=script          → script-src
     *   preload as=image           → img-src
     *   preload as=style           → style-src
     *   preload (other/missing as) → connect-src (generic fetch)
     *   modulepreload              → script-src
     *   icon, apple-touch-icon     → img-src
     *   manifest                   → manifest-src
     *   prefetch                   → connect-src (no specific directive — connect-src is closest)
     *   <unknown>                  → null (skip emission to avoid false positive)
     *
     * Multi-value rel (e.g., rel="stylesheet preload") is handled by token
     * presence-check in priority order.
     */
    relToContext(rel, as) {
        const tokens = (rel || '').toLowerCase().split(/\s+/).filter(Boolean);
        const asNorm = (as || '').toLowerCase().trim();
        if (tokens.includes('stylesheet')) return 'style';
        if (tokens.includes('preconnect') || tokens.includes('dns-prefetch')) return 'connect';
        if (tokens.includes('preload')) {
            if (asNorm === 'font') return 'font';
            if (asNorm === 'script') return 'script';
            if (asNorm === 'image') return 'img';
            if (asNorm === 'style') return 'style';
            return 'fetch';
        }
        if (tokens.includes('modulepreload')) return 'script';
        if (tokens.includes('icon') || tokens.includes('apple-touch-icon')) return 'img';
        if (tokens.includes('manifest')) return 'manifest';
        if (tokens.includes('prefetch')) return 'fetch';
        return null;  // unknown rel — skip rather than guess (avoids false positive)
    }

    /**
     * Scan all HTML files for external domain usage and cross-reference CSP
     * @returns {Object} { issues: [], summary: {} }
     */
    validate() {
        const issues = [];

        // Load CSP
        if (!this.cspDirectives) {
            this.loadCSP();
        }

        if (!this.cspDirectives) {
            return { issues: [], summary: { skipped: true, reason: 'No CSP found' } };
        }

        // Scan all HTML files for external domain references
        const externalDomains = this.scanForExternalDomains();

        // Check each domain against CSP
        const uncovered = [];
        const covered = [];

        for (const entry of externalDomains) {
            const directive = this.getDirectiveForContext(entry.context);
            if (this.isDomainCovered(entry.domain, directive)) {
                covered.push(entry);
            } else {
                uncovered.push({ ...entry, directive });
            }
        }

        // Report uncovered domains
        for (const entry of uncovered) {
            issues.push({
                code: 'CSP-001',
                severity: 'medium',
                category: 'csp',
                message: `External domain "${entry.domain}" used in ${entry.context} context but not covered by ${entry.directive} in CSP`,
                file: entry.file,
                line: entry.line,
                fix: `Add ${entry.domain} to ${entry.directive} in firebase.json CSP header`
            });
        }

        return {
            issues,
            summary: {
                totalExternalDomains: externalDomains.length,
                coveredDomains: covered.length,
                uncoveredDomains: uncovered.length,
                directives: Object.keys(this.cspDirectives)
            }
        };
    }

    /**
     * Scan HTML files for external domain references
     * @returns {Array} Array of { domain, context, file, line }
     */
    scanForExternalDomains() {
        const results = [];
        const seenPerFile = new Map(); // file -> Set of "domain:context" to dedup

        const htmlFiles = this.findHTMLFiles(this.rootPath);

        for (const filePath of htmlFiles) {
            let content;
            try {
                content = fs.readFileSync(filePath, 'utf8');
            } catch (e) {
                continue;
            }

            const relPath = path.relative(this.rootPath, filePath);
            const fileKey = relPath;
            if (!seenPerFile.has(fileKey)) seenPerFile.set(fileKey, new Set());

            // ── <link> tags handled file-wide (supports multi-line tags) ──
            // Done before per-line loop because rel-aware context needs all
            // attributes from a single tag, and tags can span multiple lines
            // in prettified HTML.
            const linkTagRe = /<link\b([^>]*?)>/gi;
            let lm;
            while ((lm = linkTagRe.exec(content)) !== null) {
                const attrs = lm[1];
                const hrefMatch = attrs.match(/\bhref\s*=\s*["'](https?:\/\/[^"']+)/i);
                if (!hrefMatch) continue;
                const url = hrefMatch[1];
                const relMatch = attrs.match(/\brel\s*=\s*["']([^"']+)["']/i);
                const asMatch  = attrs.match(/\bas\s*=\s*["']([^"']+)["']/i);
                const context = this.relToContext(
                    relMatch ? relMatch[1] : '',
                    asMatch  ? asMatch[1]  : ''
                );
                if (context === null) continue;  // unknown rel — skip
                try {
                    const domain = new URL(url).hostname;
                    if (domain === 'localhost' || domain === '127.0.0.1') continue;
                    const dedupKey = `${domain}:${context}`;
                    if (!seenPerFile.get(fileKey).has(dedupKey)) {
                        seenPerFile.get(fileKey).add(dedupKey);
                        const before = content.substring(0, lm.index);
                        const lineNum = (before.match(/\n/g) || []).length + 1;
                        results.push({ domain, context, file: relPath, line: lineNum });
                    }
                } catch (_) { /* invalid URL */ }
            }

            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const lineNum = i + 1;

                // Skip HTML comments
                if (line.trim().startsWith('<!--')) continue;

                // Extract URLs from various patterns. <link> is handled file-wide above.
                const urlPatterns = [
                    // fetch('https://...') or fetch("https://...")
                    { pattern: /fetch\s*\(\s*['"`](https?:\/\/[^'"`\s]+)/g, context: 'fetch' },
                    // new XMLHttpRequest + .open('...', 'https://...')
                    { pattern: /\.open\s*\(\s*['"][^'"]+['"]\s*,\s*['"`](https?:\/\/[^'"`\s]+)/g, context: 'xhr' },
                    // <script src="https://...">
                    { pattern: /<script[^>]+src\s*=\s*["'](https?:\/\/[^"']+)/gi, context: 'script' },
                    // <img src="https://...">
                    { pattern: /<img[^>]+src\s*=\s*["'](https?:\/\/[^"']+)/gi, context: 'img' },
                    // <iframe src="https://...">
                    { pattern: /<iframe[^>]+src\s*=\s*["'](https?:\/\/[^"']+)/gi, context: 'frame' },
                    // new WebSocket('wss://...')
                    { pattern: /new\s+WebSocket\s*\(\s*['"`](wss?:\/\/[^'"`\s]+)/g, context: 'websocket' },
                    // Template literal fetch: `https://...`
                    { pattern: /fetch\s*\(\s*`(https?:\/\/[^`\s{]+)/g, context: 'fetch' },
                    // String concatenation: 'https://api.github.com' + ...
                    { pattern: /['"`](https?:\/\/[a-zA-Z][a-zA-Z0-9.-]+\.[a-z]{2,})[/'"`]/g, context: 'fetch' }
                ];

                for (const { pattern, context } of urlPatterns) {
                    let match;
                    // Reset regex lastIndex
                    pattern.lastIndex = 0;
                    while ((match = pattern.exec(line)) !== null) {
                        const url = match[1];
                        try {
                            const domain = new URL(url).hostname;
                            const dedupKey = `${domain}:${context}`;

                            // Skip self-referential domains
                            if (domain === 'localhost' || domain === '127.0.0.1') continue;

                            if (!seenPerFile.get(fileKey).has(dedupKey)) {
                                seenPerFile.get(fileKey).add(dedupKey);
                                results.push({ domain, context, file: relPath, line: lineNum });
                            }
                        } catch (e) {
                            // Invalid URL, skip
                        }
                    }
                }
            }
        }

        return results;
    }

    /**
     * Recursively find all HTML files under a directory
     * @param {string} dir - Directory to search
     * @returns {Array} File paths
     */
    findHTMLFiles(dir) {
        const results = [];
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    // Skip node_modules, .git, etc.
                    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
                    results.push(...this.findHTMLFiles(fullPath));
                } else if (entry.name.endsWith('.html')) {
                    results.push(fullPath);
                }
            }
        } catch (e) {
            // Skip unreadable directories
        }
        return results;
    }
}

module.exports = CSPValidator;
