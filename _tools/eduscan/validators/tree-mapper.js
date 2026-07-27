/**
 * EduScan - Course Tree Mapper
 *
 * Crawls from a hub entry point, follows links, and builds a navigation
 * tree showing the student experience. Used by CLI (--tree) and admin console.
 *
 * Output: JSON tree with node status (ok, broken, warning) and link types
 * (href, next, prev, course-home, returnUrl, breadcrumb)
 */

const fs = require('fs');
const path = require('path');

class TreeMapper {
    constructor(options = {}) {
        this.rootPath = options.rootPath || './_app';
        this.verbose = options.verbose || false;
        this.maxDepth = options.maxDepth || 5;
        this.visited = new Set();
    }

    /**
     * Discover all hub pages (index.html files inside house subdirectories).
     * Returns array of { path, title, house, shortName }
     * Used by CLI autocomplete and admin console dropdown.
     */
    discoverHubs() {
        const housesDir = path.resolve(this.rootPath, 'houses');
        const hubs = [];

        if (!fs.existsSync(housesDir)) {
            if (this.verbose) {
                console.warn(`[TREE] Houses directory not found: ${housesDir}`);
            }
            return hubs;
        }

        const houseDirs = fs.readdirSync(housesDir, { withFileTypes: true })
            .filter(d => d.isDirectory())
            .map(d => d.name);

        for (const house of houseDirs) {
            const houseDir = path.join(housesDir, house);

            // House root index (e.g., houses/web/index.html)
            const houseIndex = path.join(houseDir, 'index.html');
            if (fs.existsSync(houseIndex)) {
                const relPath = path.relative(path.resolve(this.rootPath), houseIndex).replace(/\\/g, '/');
                hubs.push({
                    path: relPath,
                    title: this._extractTitle(houseIndex),
                    house: house,
                    shortName: house
                });
            }

            // Course hubs — subdirectories of the house that contain index.html
            this._findCourseHubs(houseDir, house, hubs);
        }

        // Sort by house then shortName
        hubs.sort((a, b) => {
            if (a.house !== b.house) return a.house.localeCompare(b.house);
            return a.shortName.localeCompare(b.shortName);
        });

        return hubs;
    }

    /**
     * Discover EVERY destination in the app — not just houses/. A destination is
     * any directory with an index.html. NOTHING is excluded (admin-only pages like
     * /workshop/, features like /career/, incubators, stubs — all included): the
     * tree's job is total accountability, so anything that exists must be readable
     * through it. Same return shape as discoverHubs(); for a non-house destination,
     * `house` is the top-level segment (e.g. 'career', 'arena').
     * @returns {Array<{path,title,house,shortName}>}
     */
    discoverAll() {
        const root = path.resolve(this.rootPath);
        const skip = new Set(['node_modules']);
        const out = [];
        const walk = (absDir, relDir) => {
            let entries;
            try { entries = fs.readdirSync(absDir, { withFileTypes: true }); } catch (e) { return; }
            if (relDir && fs.existsSync(path.join(absDir, 'index.html'))) {
                const rel = relDir + '/index.html';
                const segs = relDir.split('/');
                const house = segs[0] === 'houses' ? (segs[1] || 'houses') : segs[0];
                out.push({
                    path: rel,
                    title: this._extractTitle(path.join(absDir, 'index.html')),
                    house: house,
                    shortName: relDir.replace(/\//g, '--')
                });
            }
            for (const e of entries) {
                if (!e.isDirectory() || e.name.startsWith('.') || skip.has(e.name)) continue;
                walk(path.join(absDir, e.name), relDir ? relDir + '/' + e.name : e.name);
            }
        };
        walk(root, '');
        out.sort((a, b) => a.path.localeCompare(b.path));
        return out;
    }

    /**
     * Recursively find index.html files within a house directory.
     * Searches up to 3 levels deep to find course hubs in nested structures
     * like courses/clh/, modules/linux-mastery/, etc.
     * Skips _archive, node_modules, engine, configs directories.
     * @param {string} dir - Absolute path to search
     * @param {string} house - House ID (e.g., 'web')
     * @param {Array} hubs - Array to push results into
     * @param {number} depth - Current recursion depth (max 3)
     */
    _findCourseHubs(dir, house, hubs, depth) {
        if (depth === undefined) depth = 0;
        if (depth >= 3) return;

        const skipDirs = new Set(['_archive', 'node_modules', 'engine', 'configs', 'assets', 'images', 'fonts', 'css']);
        let entries;
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch (e) {
            return;
        }

        for (const entry of entries) {
            if (!entry.isDirectory()) continue;
            if (skipDirs.has(entry.name)) continue;

            const subDir = path.join(dir, entry.name);
            const indexPath = path.join(subDir, 'index.html');

            if (fs.existsSync(indexPath)) {
                const relPath = path.relative(path.resolve(this.rootPath), indexPath).replace(/\\/g, '/');
                // Derive shortName from the relative path within the house
                const houseDir = path.join(path.resolve(this.rootPath), 'houses', house);
                const shortName = path.relative(houseDir, subDir).replace(/\\/g, '/').replace(/\//g, '--');

                hubs.push({
                    path: relPath,
                    title: this._extractTitle(indexPath),
                    house: house,
                    shortName: shortName
                });
            }

            // Recurse deeper
            this._findCourseHubs(subDir, house, hubs, depth + 1);
        }
    }

    /**
     * Build the navigation tree starting from a hub page.
     * @param {string} hubPath - Relative path from rootPath (e.g., 'houses/web/network-plus/index.html')
     * @returns {Object} Full tree result with metadata
     */
    buildTree(hubPath) {
        this.visited.clear();

        const absoluteHub = path.resolve(this.rootPath, hubPath);

        if (!fs.existsSync(absoluteHub)) {
            return { error: `Hub not found: ${hubPath}`, hub: hubPath };
        }

        // Determine scope: the directory containing the hub and its children.
        // Also allow links up to the parent house index.
        const hubDir = path.dirname(absoluteHub);
        const scopeDir = path.relative(path.resolve(this.rootPath), hubDir).replace(/\\/g, '/');

        // Determine the house directory for scope boundary.
        // hubPath like "houses/web/network-plus/index.html" -> house scope is "houses/web"
        const parts = hubPath.replace(/\\/g, '/').split('/');
        let houseScope = null;
        if (parts[0] === 'houses' && parts.length >= 2) {
            houseScope = parts.slice(0, 2).join('/');
        }

        this._currentScope = scopeDir;
        this._houseScope = houseScope;

        const tree = this._crawlPage(hubPath, 0);

        const stats = this._computeStats(tree);

        return {
            hub: hubPath,
            title: this._extractTitle(absoluteHub),
            generated: new Date().toISOString(),
            stats,
            tree
        };
    }

    /**
     * Crawl a single page, extract links, recursively follow them.
     * @param {string} pagePath - Relative path from rootPath
     * @param {number} depth - Current recursion depth
     * @returns {Object} Tree node
     */
    _crawlPage(pagePath, depth) {
        const absolutePath = path.resolve(this.rootPath, pagePath);
        const exists = fs.existsSync(absolutePath);

        const node = {
            path: pagePath,
            title: exists ? this._extractTitle(absolutePath) : null,
            status: exists ? 'ok' : 'broken',
            depth,
            children: []
        };

        // Don't recurse if broken, max depth reached, or already visited
        if (!exists || depth >= this.maxDepth || this.visited.has(pagePath)) {
            if (this.visited.has(pagePath)) {
                node.status = 'visited';
            }
            return node;
        }

        this.visited.add(pagePath);

        // Read file content and extract links
        let content;
        try {
            content = fs.readFileSync(absolutePath, 'utf8');
        } catch (e) {
            node.status = 'broken';
            return node;
        }

        const links = this._extractLinks(content, pagePath);

        for (const link of links) {
            // Scope check: only follow links within the house directory tree
            if (!this._isInScope(link.resolvedPath)) continue;

            const child = this._crawlPage(link.resolvedPath, depth + 1);
            child.linkType = link.type;
            child.linkText = link.text;
            node.children.push(child);
        }

        return node;
    }

    /**
     * Check if a resolved path is within the crawl scope.
     * Allows links within the same house directory tree or to the
     * immediate parent house index. Blocks links to other houses
     * or global pages like dashboard.html.
     * @param {string} resolvedPath - Relative path from rootPath
     * @returns {boolean}
     */
    _isInScope(resolvedPath) {
        const normalized = resolvedPath.replace(/\\/g, '/');

        if (normalized.startsWith('..') || normalized.includes('_archive') || normalized.includes('node_modules')) return false;

        // In scope if within the destination's OWN subtree — this is what lets
        // non-house destinations (career/, arena/, workshop/, admin/) crawl their
        // children instead of returning a childless stub. Every destination is
        // mapped within its own directory, house or not.
        if (this._currentScope && (normalized === this._currentScope || normalized.startsWith(this._currentScope + '/'))) return true;

        // House hubs may also link within their parent house (e.g. back to the
        // house index or a sibling course) — preserved for backward compatibility.
        if (this._houseScope && normalized.startsWith(this._houseScope + '/')) return true;

        return false;
    }

    /**
     * Extract all navigable links from page content.
     * Categorizes each link by type: next, prev, course-home, breadcrumb, returnUrl, href
     * @param {string} content - HTML content
     * @param {string} pagePath - Current page path (for resolving relative URLs)
     * @returns {Array} [{ href, type, text, resolvedPath }]
     */
    _extractLinks(content, pagePath) {
        const links = [];
        const pageDir = path.dirname(path.resolve(this.rootPath, pagePath));
        const seen = new Set();

        // 1. <a href="..."> tags (with link type classification)
        const aTagPattern = /<a\s+[^>]*href="([^"#]+\.html?)"[^>]*>([\s\S]*?)<\/a>/gi;
        let match;
        while ((match = aTagPattern.exec(content)) !== null) {
            const href = match[1];
            const fullTag = match[0];
            const innerText = match[2].replace(/<[^>]+>/g, '').trim();

            // Skip external URLs, javascript:, mailto:
            if (href.startsWith('http') || href.startsWith('//') ||
                href.startsWith('javascript:') || href.startsWith('mailto:')) continue;

            // Resolve to absolute then back to relative from rootPath
            const absolute = path.resolve(pageDir, href);
            const resolvedPath = path.relative(path.resolve(this.rootPath), absolute).replace(/\\/g, '/');

            // Skip if outside _app scope or already seen
            if (resolvedPath.startsWith('..')) continue;
            if (seen.has(resolvedPath)) continue;
            seen.add(resolvedPath);

            // Skip archived content
            if (resolvedPath.includes('_archive')) continue;

            // Skip disabled links
            if (/class="[^"]*disabled/i.test(fullTag)) continue;

            // Classify link type
            let type = 'href';
            if (/next/i.test(innerText) || /class="[^"]*nav-btn[^"]*primary/i.test(fullTag)) {
                type = 'next';
            } else if (/prev/i.test(innerText) || /&lt;|←|«/i.test(innerText)) {
                type = 'prev';
            } else if (/index\.html$/i.test(href) && (/home|hub|back/i.test(innerText) || /breadcrumb|ne-back/i.test(fullTag))) {
                type = 'course-home';
            } else if (/breadcrumb/i.test(fullTag)) {
                type = 'breadcrumb';
            }

            links.push({ href, type, text: innerText.substring(0, 60), resolvedPath });
        }

        // 2. returnUrl in ModuleProgress.complete() calls
        const returnUrlPattern = /returnUrl:\s*['"]([^'"]+\.html?)['"]/g;
        while ((match = returnUrlPattern.exec(content)) !== null) {
            const href = match[1];
            const absolute = path.resolve(pageDir, href);
            const resolvedPath = path.relative(path.resolve(this.rootPath), absolute).replace(/\\/g, '/');
            if (resolvedPath.startsWith('..') || seen.has(resolvedPath)) continue;
            seen.add(resolvedPath);
            links.push({ href, type: 'returnUrl', text: 'ModuleProgress returnUrl', resolvedPath });
        }

        // 3. window.location.href assignments
        const locPattern = /window\.location\.href\s*=\s*['"]([^'"]+\.html?)['"]/g;
        while ((match = locPattern.exec(content)) !== null) {
            const href = match[1];
            if (href.startsWith('http') || href.startsWith('//')) continue;
            const absolute = path.resolve(pageDir, href);
            const resolvedPath = path.relative(path.resolve(this.rootPath), absolute).replace(/\\/g, '/');
            if (resolvedPath.startsWith('..') || seen.has(resolvedPath)) continue;
            seen.add(resolvedPath);
            links.push({ href, type: 'redirect', text: 'window.location redirect', resolvedPath });
        }

        // 4. meta http-equiv="refresh" redirects
        const metaRefreshPattern = /meta\s+http-equiv=["']refresh["']\s+content=["']\d+;\s*url=([^"']+)["']/gi;
        while ((match = metaRefreshPattern.exec(content)) !== null) {
            const href = match[1].trim();
            if (href.startsWith('http') || href.startsWith('//')) continue;
            // Resolve: if href ends with / it's a directory — append index.html
            const resolvedHref = href.endsWith('/') ? href + 'index.html' : href;
            const absolute = path.resolve(pageDir, resolvedHref);
            const resolvedPath = path.relative(path.resolve(this.rootPath), absolute).replace(/\\/g, '/');
            if (resolvedPath.startsWith('..') || seen.has(resolvedPath)) continue;
            seen.add(resolvedPath);
            links.push({ href: resolvedHref, type: 'redirect', text: 'meta refresh redirect', resolvedPath });
        }

        // 5. JS module arrays with id/href patterns (dynamic hubs like CLH)
        //    Detects: { id: 'xxx', ... href: 'path/file.html' }
        //    Also detects template patterns: `script-${mod.id}-intro.applet.html`
        const jsHrefPattern = /href:\s*['"]([^'"]+\.html?)['"]/g;
        while ((match = jsHrefPattern.exec(content)) !== null) {
            const href = match[1];
            if (href.startsWith('http') || href.startsWith('//') || href.includes('${')) continue;
            const absolute = path.resolve(pageDir, href);
            const resolvedPath = path.relative(path.resolve(this.rootPath), absolute).replace(/\\/g, '/');
            if (resolvedPath.startsWith('..') || seen.has(resolvedPath)) continue;
            seen.add(resolvedPath);
            links.push({ href, type: 'href', text: 'JS href property', resolvedPath });
        }

        // 6. JS template literal hrefs: card.href = `...${mod.id}...`
        //    Extract the template, find all matching id values, resolve each
        const templateHrefPattern = /\.href\s*=\s*(?:mod\.href\s*\|\|\s*)?`([^`]*\$\{[^}]+\}[^`]*)`/g;
        while ((match = templateHrefPattern.exec(content)) !== null) {
            const template = match[1];
            // Find the variable being interpolated (e.g., mod.id)
            const varMatch = template.match(/\$\{(\w+\.)?(\w+)\}/);
            if (!varMatch) continue;
            const varName = varMatch[2]; // e.g., 'id'

            // Find all id values in the same content (JS arrays)
            const idPattern = new RegExp(varName + ":\\s*['\"]([^'\"]+)['\"]", 'g');
            let idMatch;
            while ((idMatch = idPattern.exec(content)) !== null) {
                const idValue = idMatch[1];
                const resolvedHref = template.replace(/\$\{[^}]+\}/, idValue);
                if (resolvedHref.includes('${')) continue; // Multiple interpolations — skip
                const absolute = path.resolve(pageDir, resolvedHref);
                const resolvedPath = path.relative(path.resolve(this.rootPath), absolute).replace(/\\/g, '/');
                if (resolvedPath.startsWith('..') || seen.has(resolvedPath)) continue;
                seen.add(resolvedPath);
                links.push({ href: resolvedHref, type: 'href', text: 'JS template href (' + idValue + ')', resolvedPath });
            }
        }

        return links;
    }

    /**
     * Extract <title> tag content from an HTML file.
     * Strips common suffixes like "- Hexworth Prime" or "| Hexworth Prime".
     * @param {string} absolutePath - Absolute path to the HTML file
     * @returns {string} Extracted title or filename as fallback
     */
    _extractTitle(absolutePath) {
        try {
            const content = fs.readFileSync(absolutePath, 'utf8');
            const match = content.match(/<title>([^<]+)<\/title>/i);
            if (match) {
                return match[1].trim().replace(/\s*[—\-|]\s*Hexworth Prime$/i, '').trim();
            }
            return path.basename(absolutePath);
        } catch (e) {
            return path.basename(absolutePath);
        }
    }

    /**
     * Recursively compute stats from the tree.
     * @param {Object} node - Root tree node
     * @returns {Object} { totalNodes, ok, broken, visited, byLinkType }
     */
    _computeStats(node) {
        const stats = { totalNodes: 0, ok: 0, broken: 0, visited: 0, byLinkType: {} };
        this._walkStats(node, stats);
        return stats;
    }

    /**
     * Walk the tree and accumulate stats.
     * @param {Object} node - Current node
     * @param {Object} stats - Stats accumulator
     */
    _walkStats(node, stats) {
        stats.totalNodes++;
        if (node.status === 'ok') stats.ok++;
        else if (node.status === 'broken') stats.broken++;
        else if (node.status === 'visited') stats.visited++;

        if (node.linkType) {
            stats.byLinkType[node.linkType] = (stats.byLinkType[node.linkType] || 0) + 1;
        }

        for (const child of (node.children || [])) {
            this._walkStats(child, stats);
        }
    }

    /**
     * Format tree as terminal-friendly ASCII art.
     * @param {Object} result - Output from buildTree()
     * @param {Function} colorFn - Optional color function (text, ...colors) => coloredText
     * @returns {string} Formatted tree string
     */
    formatTree(result, colorFn) {
        if (!colorFn) colorFn = (text) => text;

        if (result.error) {
            return colorFn(result.error, 'red');
        }

        const lines = [];
        lines.push('');
        lines.push(colorFn('COURSE TREE: ', 'bold') + colorFn(result.title || result.hub, 'cyan'));
        lines.push(colorFn('─'.repeat(60), 'dim'));
        lines.push(`  Hub: ${result.hub}`);
        lines.push(`  Generated: ${result.generated}`);
        lines.push(`  Nodes: ${result.stats.totalNodes} | ` +
                   colorFn(`OK: ${result.stats.ok}`, 'green') + ' | ' +
                   (result.stats.broken > 0 ? colorFn(`Broken: ${result.stats.broken}`, 'red') : 'Broken: 0') + ' | ' +
                   `Back-refs: ${result.stats.visited}`);
        lines.push(colorFn('─'.repeat(60), 'dim'));
        lines.push('');

        this._formatNode(result.tree, '', true, lines, colorFn);

        lines.push('');
        return lines.join('\n');
    }

    /**
     * Recursively format a single tree node as ASCII art.
     * @param {Object} node - Tree node
     * @param {string} prefix - Current indentation prefix
     * @param {boolean} isLast - Whether this is the last sibling
     * @param {Array} lines - Output lines array
     * @param {Function} colorFn - Color function
     */
    _formatNode(node, prefix, isLast, lines, colorFn) {
        const connector = isLast ? '└── ' : '├── ';
        const extension = isLast ? '    ' : '│   ';

        // Status indicator
        let statusIcon;
        if (node.status === 'broken') statusIcon = colorFn('[X]', 'red');
        else if (node.status === 'visited') statusIcon = colorFn('[~]', 'dim');
        else statusIcon = colorFn('[+]', 'green');

        // Link type badge
        let badge = '';
        if (node.linkType) {
            const typeColors = {
                'next': 'cyan',
                'prev': 'yellow',
                'course-home': 'magenta',
                'breadcrumb': 'dim',
                'returnUrl': 'blue',
                'redirect': 'yellow',
                'href': 'dim'
            };
            badge = colorFn(`[${node.linkType}] `, typeColors[node.linkType] || 'dim');
        }

        // Title or path
        const display = node.title || path.basename(node.path);
        const pathSuffix = node.title ? colorFn(` (${node.path})`, 'dim') : '';

        lines.push(`${prefix}${connector}${statusIcon} ${badge}${display}${pathSuffix}`);

        // Recurse children
        const children = node.children || [];
        for (let i = 0; i < children.length; i++) {
            this._formatNode(children[i], prefix + extension, i === children.length - 1, lines, colorFn);
        }
    }

    /**
     * Write tree result as JSON to the data directory.
     * @param {Object} result - Output from buildTree()
     * @param {string} outputDir - Directory to write to (default: _app/data/course-trees)
     * @returns {string} Path to written file
     */
    writeJSON(result, outputDir) {
        outputDir = outputDir || path.resolve(this.rootPath, 'data', 'course-trees');

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Generate filename from the FULL hub path (houses/ NOT stripped, so a
        // top-level /shield/ can't collide with houses/shield/):
        // houses/web/network-plus/index.html -> houses--web--network-plus.json
        const hubPath = result.hub || 'unknown';
        const slug = hubPath
            .replace(/\/index\.html$/, '')
            .replace(/\//g, '--');

        const filePath = path.join(outputDir, `${slug}.json`);
        fs.writeFileSync(filePath, JSON.stringify(result, null, 2));

        return filePath;
    }

    /**
     * Write a manifest of all available trees (for admin console dropdown).
     * @param {Array} results - Array of buildTree() outputs
     * @param {string} outputDir - Directory to write to
     * @returns {string} Path to manifest file
     */
    writeManifest(results, outputDir) {
        outputDir = outputDir || path.resolve(this.rootPath, 'data', 'course-trees');

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const manifest = {
            generated: new Date().toISOString(),
            hubs: results.map(r => ({
                hub: r.hub,
                title: r.title,
                stats: r.stats,
                file: r.hub
                    .replace(/\/index\.html$/, '')
                    .replace(/\//g, '--') + '.json'
            }))
        };

        const filePath = path.join(outputDir, 'manifest.json');
        fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2));

        return filePath;
    }
}

module.exports = TreeMapper;
