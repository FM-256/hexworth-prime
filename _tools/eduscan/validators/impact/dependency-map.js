/**
 * EduScan — Dependency Map Builder
 *
 * Scans _app/ to build a dependency graph of shared components:
 *   - Which components exist (components/*.js, config/*.js)
 *   - Which HTML files load each component via <script src>
 *   - Which JS files reference each component by name
 *
 * Output: { components: { name → { path, usedBy: [files] } } }
 */

const fs = require('fs');
const path = require('path');

class DependencyMap {
    constructor(options = {}) {
        this.rootPath = options.rootPath || './_app';
        this.verbose = options.verbose || false;
    }

    /**
     * Build the full dependency map
     * @returns {Object} { components, summary }
     */
    build() {
        const startTime = Date.now();

        // 1. Discover all shared components
        const components = this._discoverComponents();

        // 2. Collect all HTML files
        const htmlFiles = this._collectFiles(this.rootPath, '.html');

        // 3. For each HTML file, find which components it loads
        for (const htmlFile of htmlFiles) {
            const content = this._readFile(htmlFile);
            if (!content) continue;

            const relPath = path.relative(this.rootPath, htmlFile).replace(/\\/g, '/');

            // Find <script src="..."> tags
            const scriptRefs = this._extractScriptSources(content, htmlFile);

            for (const ref of scriptRefs) {
                // Normalize to component name
                const compName = this._resolveToComponent(ref, htmlFile);
                if (compName && components[compName]) {
                    components[compName].usedBy.push(relPath);
                }
            }
        }

        // 4. Sort usedBy arrays and compute stats
        const summary = {
            totalComponents: 0,
            usedComponents: 0,
            unusedComponents: 0,
            totalDependencies: 0,
            mostDepended: null,
            mostDependedCount: 0,
            duration: Date.now() - startTime
        };

        for (const [name, comp] of Object.entries(components)) {
            comp.usedBy = [...new Set(comp.usedBy)].sort();
            comp.dependencyCount = comp.usedBy.length;
            summary.totalComponents++;
            summary.totalDependencies += comp.dependencyCount;

            if (comp.dependencyCount > 0) {
                summary.usedComponents++;
            } else {
                summary.unusedComponents++;
            }

            if (comp.dependencyCount > summary.mostDependedCount) {
                summary.mostDepended = name;
                summary.mostDependedCount = comp.dependencyCount;
            }
        }

        if (this.verbose) {
            console.log(`[IMPACT] Built dependency map in ${summary.duration}ms`);
            console.log(`[IMPACT] ${summary.totalComponents} components, ${summary.usedComponents} used, ${summary.unusedComponents} unused`);
            console.log(`[IMPACT] Most depended: ${summary.mostDepended} (${summary.mostDependedCount} files)`);
        }

        return { components, summary };
    }

    /**
     * Get impact analysis for a specific file
     * @param {string} filePath - Path to the changed file
     * @param {Object} depMap - Pre-built dependency map
     * @returns {Object} Impact analysis
     */
    analyzeImpact(filePath, depMap) {
        const components = depMap.components;
        const relPath = path.relative(this.rootPath, filePath).replace(/\\/g, '/');

        // Check if the changed file IS a component
        const compName = path.basename(filePath, '.js');
        if (components[compName]) {
            const comp = components[compName];
            return {
                isComponent: true,
                componentName: compName,
                path: comp.path,
                affectedFiles: comp.usedBy,
                affectedCount: comp.usedBy.length,
                severity: comp.usedBy.length >= 10 ? 'critical' :
                         comp.usedBy.length >= 5 ? 'high' :
                         comp.usedBy.length >= 2 ? 'medium' : 'low',
                message: `${compName} is used by ${comp.usedBy.length} files — verify downstream impact`
            };
        }

        // Check if the changed file USES components
        const usedComponents = [];
        for (const [name, comp] of Object.entries(components)) {
            if (comp.usedBy.includes(relPath)) {
                usedComponents.push(name);
            }
        }

        return {
            isComponent: false,
            path: relPath,
            usedComponents,
            usedComponentCount: usedComponents.length,
            message: usedComponents.length > 0
                ? `Uses ${usedComponents.length} shared components: ${usedComponents.join(', ')}`
                : 'No shared component dependencies'
        };
    }

    /**
     * Discover all shared component files
     */
    _discoverComponents() {
        const components = {};
        const dirs = [
            path.join(this.rootPath, 'components'),
            path.join(this.rootPath, 'config')
        ];

        for (const dir of dirs) {
            if (!fs.existsSync(dir)) continue;

            const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
            for (const file of files) {
                const name = file.replace('.js', '');
                const fullPath = path.join(dir, file);
                const relPath = path.relative(this.rootPath, fullPath).replace(/\\/g, '/');

                components[name] = {
                    name,
                    path: relPath,
                    fullPath,
                    category: dir.includes('config') ? 'config' : 'component',
                    usedBy: [],
                    dependencyCount: 0
                };
            }
        }

        return components;
    }

    /**
     * Extract <script src="..."> values from HTML content
     */
    _extractScriptSources(content, htmlFile) {
        const sources = [];
        const regex = /<script\s+[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/gi;
        let match;

        while ((match = regex.exec(content)) !== null) {
            sources.push(match[1]);
        }

        return sources;
    }

    /**
     * Resolve a script src path to a component name
     * e.g., "components/FirebaseAuth.js" → "FirebaseAuth"
     *        "../components/TitleManager.js" → "TitleManager"
     *        "config/cipher.js" → "cipher"
     */
    _resolveToComponent(src, htmlFile) {
        // Strip query strings
        const cleanSrc = src.split('?')[0];

        // Match components/ or config/ path segments
        const compMatch = cleanSrc.match(/(?:components|config)\/([^/]+\.js)$/);
        if (compMatch) {
            return compMatch[1].replace('.js', '');
        }

        return null;
    }

    /**
     * Recursively collect files with a given extension
     */
    _collectFiles(dir, extension) {
        const files = [];
        const skip = new Set(['node_modules', '.git', '_archive', '_planning', 'assets', 'audio', 'images', 'fonts', '_tools']);

        const walk = (d) => {
            let entries;
            try {
                entries = fs.readdirSync(d, { withFileTypes: true });
            } catch {
                return;
            }

            for (const entry of entries) {
                if (skip.has(entry.name)) continue;

                const fullPath = path.join(d, entry.name);
                if (entry.isDirectory()) {
                    walk(fullPath);
                } else if (entry.name.endsWith(extension)) {
                    files.push(fullPath);
                }
            }
        };

        walk(dir);
        return files;
    }

    /**
     * Read file safely
     */
    _readFile(filePath) {
        try {
            return fs.readFileSync(filePath, 'utf8');
        } catch {
            return null;
        }
    }
}

module.exports = DependencyMap;
