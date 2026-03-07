/**
 * EduScan — Sandbox Integration Validator
 *
 * Validates SandboxLauncher.js integration across the platform.
 * Detects misconfigurations, missing dependencies, wrong load order,
 * unknown lab IDs, and maps all sandbox integrations.
 *
 * Issue codes:
 *   SANDBOX-001  SandboxLauncher.js loaded but renderButton never called (dead script)
 *   SANDBOX-002  SandboxLauncher.renderButton called but SandboxLauncher.js not loaded
 *   SANDBOX-003  Unknown lab ID in renderButton call (not in LAB_INFO)
 *   SANDBOX-004  FirebaseAuth.js not loaded before SandboxLauncher.js (missing dependency)
 *   SANDBOX-005  SandboxLauncher.js loaded after page renderer (ArcticEngine, etc.) — may be wiped
 *   SANDBOX-006  sandbox-mount div exists but renderButton never targets it
 *   SANDBOX-007  renderButton called but no sandbox-mount container found in static HTML
 *   SANDBOX-008  iframe sandbox attribute missing permissions required for ttyd terminal interaction
 *   SANDBOX-009  ttyd entrypoint uses --max-clients (causes WebSocket rejection via reverse proxy)
 *   SANDBOX-010  ttyd entrypoint uses --title-fixed (invalid flag in ttyd 1.7.x, breaks command parsing)
 */

const fs = require('fs');
const path = require('path');

// Known valid lab IDs — keep in sync with SandboxLauncher.js LAB_INFO
const KNOWN_LAB_IDS = new Set([
    'do-100', 'do-101', 'do-102', 'do-16', 'arctic'
]);

// Page renderers that wipe document.body — SandboxLauncher must load before these
// OR the renderer must explicitly call SandboxLauncher (like ArcticEngine does)
const BODY_WIPING_RENDERERS = [
    'ArcticEngine.js'
];

class SandboxValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.profile = options.profile || 'ci';
        this.rootPath = options.rootPath || './_app';
    }

    /**
     * Per-file validation — check each HTML file for sandbox integration issues
     */
    validate(file) {
        const issues = [];
        const { content, path: filePath } = file;

        if (!content) return issues;

        const hasLauncherScript = /SandboxLauncher\.js/.test(content);
        const hasRenderButton = /SandboxLauncher\.renderButton/.test(content);
        const hasFirebaseAuth = /FirebaseAuth\.js/.test(content);
        const hasSandboxMount = /id\s*=\s*["']sandbox-mount["']/.test(content);

        // Check if a body-wiping renderer is loaded
        const hasBodyWipingRenderer = BODY_WIPING_RENDERERS.some(r => content.includes(r));

        // Extract lab IDs from renderButton calls
        const labIdMatches = content.matchAll(/SandboxLauncher\.renderButton\s*\([^,]+,\s*['"]([^'"]+)['"]/g);
        const referencedLabIds = [...labIdMatches].map(m => m[1]);

        // Also check ArcticEngine sandbox integration (renders sandbox programmatically)
        const hasArcticSandboxCall = /typeof\s+SandboxLauncher\s*!==\s*['"]undefined['"]/.test(content);

        // SANDBOX-001: Script loaded but never called
        if (hasLauncherScript && !hasRenderButton && !hasBodyWipingRenderer) {
            // If a body-wiping renderer is present, it may call SandboxLauncher internally
            issues.push({
                code: 'SANDBOX-001',
                severity: 'low',
                category: 'sandbox',
                message: 'SandboxLauncher.js loaded but renderButton never called in this file',
                file: filePath,
                fix: 'Either add SandboxLauncher.renderButton() call or remove the script tag'
            });
        }

        // SANDBOX-002: renderButton called but script not loaded
        if (hasRenderButton && !hasLauncherScript) {
            issues.push({
                code: 'SANDBOX-002',
                severity: 'critical',
                category: 'sandbox',
                message: 'SandboxLauncher.renderButton() called but SandboxLauncher.js is not loaded',
                file: filePath,
                fix: 'Add <script src="...SandboxLauncher.js"></script> before the renderButton call'
            });
        }

        // SANDBOX-003: Unknown lab ID
        for (const labId of referencedLabIds) {
            if (!KNOWN_LAB_IDS.has(labId)) {
                issues.push({
                    code: 'SANDBOX-003',
                    severity: 'high',
                    category: 'sandbox',
                    message: `Unknown lab ID "${labId}" in renderButton call (known: ${[...KNOWN_LAB_IDS].join(', ')})`,
                    file: filePath,
                    fix: `Add "${labId}" to LAB_INFO in SandboxLauncher.js and LABS in lab-manager/server.js`
                });
            }
        }

        // SANDBOX-004: Missing FirebaseAuth dependency
        if (hasLauncherScript && !hasFirebaseAuth) {
            issues.push({
                code: 'SANDBOX-004',
                severity: 'high',
                category: 'sandbox',
                message: 'SandboxLauncher.js loaded but FirebaseAuth.js is not loaded (required dependency)',
                file: filePath,
                fix: 'Add <script src="...FirebaseAuth.js"></script> before SandboxLauncher.js'
            });
        }

        // SANDBOX-005: Script load order — SandboxLauncher after body-wiping renderer
        if (hasLauncherScript && hasBodyWipingRenderer) {
            const launcherPos = content.indexOf('SandboxLauncher.js');
            for (const renderer of BODY_WIPING_RENDERERS) {
                const rendererPos = content.indexOf(renderer);
                if (rendererPos !== -1 && launcherPos > rendererPos) {
                    issues.push({
                        code: 'SANDBOX-005',
                        severity: 'high',
                        category: 'sandbox',
                        message: `SandboxLauncher.js loaded AFTER ${renderer} which wipes document.body`,
                        file: filePath,
                        fix: `Move SandboxLauncher.js script tag before ${renderer}`
                    });
                }
            }
        }

        // SANDBOX-006: Mount div exists but no renderButton targets it
        if (hasSandboxMount && !hasRenderButton && !hasBodyWipingRenderer) {
            issues.push({
                code: 'SANDBOX-006',
                severity: 'medium',
                category: 'sandbox',
                message: 'sandbox-mount div exists but SandboxLauncher.renderButton() is never called',
                file: filePath,
                fix: 'Add SandboxLauncher.renderButton(mount, labId) or remove the mount div'
            });
        }

        // SANDBOX-007: renderButton called but no mount point in static HTML
        // (Skip for pages with body-wiping renderers — they create mounts dynamically)
        if (hasRenderButton && !hasSandboxMount && !hasBodyWipingRenderer) {
            issues.push({
                code: 'SANDBOX-007',
                severity: 'medium',
                category: 'sandbox',
                message: 'SandboxLauncher.renderButton() called but no sandbox-mount div found in HTML',
                file: filePath,
                fix: 'Add <div id="sandbox-mount"></div> to the page'
            });
        }

        return issues;
    }

    /**
     * Global validation — scan entire codebase and produce a sandbox integration map
     */
    validateGlobal() {
        const issues = [];
        const map = {
            pagesWithSandbox: [],
            pagesWithoutSandbox: [],
            labIdUsage: {},
            totalIntegrations: 0
        };

        // Initialize lab ID usage counters
        for (const id of KNOWN_LAB_IDS) {
            map.labIdUsage[id] = { count: 0, pages: [] };
        }

        // Scan all HTML files
        const htmlFiles = this._findHTMLFiles(this.rootPath);

        for (const filePath of htmlFiles) {
            let content;
            try {
                content = fs.readFileSync(filePath, 'utf8');
            } catch { continue; }

            const relPath = path.relative(this.rootPath, filePath);
            const hasLauncher = /SandboxLauncher\.js/.test(content);
            const hasRenderButton = /SandboxLauncher\.renderButton/.test(content);

            // Check for ArcticEngine integration (renders sandbox programmatically)
            const hasArcticEngine = /ArcticEngine\.js/.test(content);
            const arcticEngineHasSandbox = hasArcticEngine && hasLauncher;

            if (hasLauncher || hasRenderButton) {
                // Extract lab IDs
                const labIdMatches = content.matchAll(/SandboxLauncher\.renderButton\s*\([^,]+,\s*['"]([^'"]+)['"]/g);
                const labIds = [...labIdMatches].map(m => m[1]);

                // For Arctic pages, the lab ID comes from ArcticEngine, not the HTML
                if (arcticEngineHasSandbox && labIds.length === 0) {
                    labIds.push('arctic');
                }

                map.pagesWithSandbox.push({
                    path: relPath,
                    labIds,
                    hasFirebaseAuth: /FirebaseAuth\.js/.test(content),
                    hasMountDiv: /id\s*=\s*["']sandbox-mount["']/.test(content),
                    viaArcticEngine: arcticEngineHasSandbox
                });

                for (const id of labIds) {
                    if (map.labIdUsage[id]) {
                        map.labIdUsage[id].count++;
                        map.labIdUsage[id].pages.push(relPath);
                    }
                }

                map.totalIntegrations++;
            }
        }

        // Check SandboxLauncher.js itself for LAB_INFO consistency
        const launcherPath = path.join(this.rootPath, 'components', 'SandboxLauncher.js');
        if (fs.existsSync(launcherPath)) {
            const launcherContent = fs.readFileSync(launcherPath, 'utf8');
            const labInfoMatches = launcherContent.matchAll(/'([^']+)':\s*\{\s*name:/g);
            const definedLabIds = new Set([...labInfoMatches].map(m => m[1]));

            // Check for lab IDs used in pages but not defined in LAB_INFO
            for (const entry of map.pagesWithSandbox) {
                for (const id of entry.labIds) {
                    if (!definedLabIds.has(id)) {
                        issues.push({
                            code: 'SANDBOX-003',
                            severity: 'high',
                            category: 'sandbox',
                            message: `Lab ID "${id}" used in ${entry.path} but not defined in SandboxLauncher.js LAB_INFO`,
                            file: entry.path,
                            fix: `Add "${id}" to LAB_INFO in SandboxLauncher.js`
                        });
                    }
                }
            }

            // Check for lab IDs defined but never used
            for (const id of definedLabIds) {
                if (!map.labIdUsage[id] || map.labIdUsage[id].count === 0) {
                    issues.push({
                        code: 'SANDBOX-001',
                        severity: 'info',
                        category: 'sandbox',
                        message: `Lab ID "${id}" defined in LAB_INFO but not used on any page`,
                        file: 'components/SandboxLauncher.js'
                    });
                }
            }
        }

        // SANDBOX-008: Check SandboxLauncher.js iframe sandbox attribute
        const launcherPath2 = path.join(this.rootPath, 'components', 'SandboxLauncher.js');
        if (fs.existsSync(launcherPath2)) {
            const launcherSrc = fs.readFileSync(launcherPath2, 'utf8');

            // Check iframe sandbox attribute for required permissions
            const sandboxAttrMatch = launcherSrc.match(/sandbox="([^"]*)"/);
            if (sandboxAttrMatch) {
                const attrs = sandboxAttrMatch[1].split(/\s+/);
                // ttyd requires: allow-scripts (JS), allow-same-origin (WebSocket to own origin)
                // Recommended: remove sandbox attr entirely for trusted content, or add all needed perms
                const required = ['allow-scripts', 'allow-same-origin'];
                const missing = required.filter(r => !attrs.includes(r));
                if (missing.length > 0) {
                    issues.push({
                        code: 'SANDBOX-008',
                        severity: 'critical',
                        category: 'sandbox',
                        message: `iframe sandbox attribute missing required permissions: ${missing.join(', ')}. ttyd terminal will not function.`,
                        file: 'components/SandboxLauncher.js',
                        fix: `Add ${missing.join(' ')} to the iframe sandbox attribute, or remove the sandbox attribute entirely for trusted sandbox content`
                    });
                }

                // Warn if sandbox attribute is present at all — it can interfere with keyboard input in ttyd
                if (attrs.length > 0) {
                    issues.push({
                        code: 'SANDBOX-008',
                        severity: 'high',
                        category: 'sandbox',
                        message: `iframe has sandbox="${sandboxAttrMatch[1]}" — sandboxed iframes can block keyboard/WebSocket interaction in ttyd terminals. Consider removing the sandbox attribute for trusted hexworth content.`,
                        file: 'components/SandboxLauncher.js',
                        fix: 'Remove the sandbox attribute from the iframe element (content is trusted — served from sandbox.hexworth.tech)',
                        autoFixable: true,
                        searchPattern: ` sandbox="${sandboxAttrMatch[1]}"`,
                        replaceWith: ''
                    });
                }
            }

            // Check for --max-clients in any embedded entrypoint references
            if (/max-clients/.test(launcherSrc)) {
                issues.push({
                    code: 'SANDBOX-009',
                    severity: 'high',
                    category: 'sandbox',
                    message: '--max-clients in SandboxLauncher — can cause WebSocket rejection when proxied through Traefik',
                    file: 'components/SandboxLauncher.js',
                    fix: 'Remove --max-clients from ttyd launch flags'
                });
            }
        }

        // SANDBOX-009/010: Scan entrypoint scripts if hexworth-sandbox repo is accessible
        const sandboxRepoPaths = [
            path.resolve(this.rootPath, '../../hexworth-sandbox'),         // sibling repo
            path.resolve(this.rootPath, '../../../hexworth-sandbox'),       // up one more
            path.join(require('os').homedir(), 'hexworth-sandbox'),         // ~/hexworth-sandbox
        ];

        for (const repoPath of sandboxRepoPaths) {
            const imagesDir = path.join(repoPath, 'images');
            if (!fs.existsSync(imagesDir)) continue;

            // Scan all entrypoint.sh files
            const tierDirs = fs.readdirSync(imagesDir).filter(d => {
                return fs.statSync(path.join(imagesDir, d)).isDirectory();
            });

            for (const tier of tierDirs) {
                const entrypoint = path.join(imagesDir, tier, 'entrypoint.sh');
                if (!fs.existsSync(entrypoint)) continue;

                const script = fs.readFileSync(entrypoint, 'utf8');
                const relPath = `hexworth-sandbox/images/${tier}/entrypoint.sh`;

                // SANDBOX-009: --max-clients causes WebSocket rejection via reverse proxy
                if (/--max-clients/.test(script)) {
                    const line = script.split('\n').findIndex(l => /--max-clients/.test(l)) + 1;
                    issues.push({
                        code: 'SANDBOX-009',
                        severity: 'critical',
                        category: 'sandbox',
                        message: `ttyd --max-clients in ${tier} entrypoint — causes "refuse to serve WS client" when proxied through Traefik/Cloudflare. Terminal renders but keyboard input fails.`,
                        file: relPath,
                        line,
                        fix: 'Remove --max-clients flag from ttyd launch command'
                    });
                }

                // SANDBOX-010: --title-fixed is invalid in ttyd 1.7.x
                if (/--title-fixed/.test(script)) {
                    const line = script.split('\n').findIndex(l => /--title-fixed/.test(l)) + 1;
                    issues.push({
                        code: 'SANDBOX-010',
                        severity: 'critical',
                        category: 'sandbox',
                        message: `ttyd --title-fixed in ${tier} entrypoint — invalid flag in ttyd 1.7.x. Causes execvp error ("No such file or directory") as title string is parsed as command.`,
                        file: relPath,
                        line,
                        fix: 'Replace --title-fixed "Title" with -t titleFixed=Title'
                    });
                }
            }

            break; // Found the repo, stop searching
        }

        if (this.verbose) {
            console.log(`[SANDBOX] Found ${map.totalIntegrations} pages with sandbox integration`);
            for (const [id, usage] of Object.entries(map.labIdUsage)) {
                if (usage.count > 0) {
                    console.log(`[SANDBOX]   ${id}: ${usage.count} pages`);
                }
            }
        }

        return { issues, summary: map };
    }

    /**
     * Recursively find all HTML files
     */
    _findHTMLFiles(dir) {
        const results = [];
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    results.push(...this._findHTMLFiles(fullPath));
                } else if (entry.isFile() && entry.name.endsWith('.html')) {
                    results.push(fullPath);
                }
            }
        } catch { /* skip unreadable dirs */ }
        return results;
    }
}

module.exports = SandboxValidator;
