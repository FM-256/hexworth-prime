/**
 * EduScan - HubRefs Validator
 *
 * Validates that hub indices' data-module="X" references resolve to real
 * catalog entries (or recognized house-prefixed forms).
 *
 * Rules:
 * - HUB-001: Hub index references a moduleId via data-module that has no
 *            matching ContentCatalog entry (after house-prefix tolerance).
 *            Effect: hub renderer creates a card slot for a nonexistent
 *            module — students see broken/empty/silent-skip card.
 *            MEDIUM (visible to students). Stragglers branch found 503 such
 *            references across 30+ hubs (e.g., WSA hub uses 'm01'..'m19'
 *            short ids while catalog has 'wsa-module01'..'wsa-module19';
 *            CCNA hub uses 'ccna-01' while catalog has different naming).
 *
 * Created: 2026-04-30 (Stragglers QA pass)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

class HubRefsValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.rootPath = options.rootPath || './_app';
        this.catalogFile = options.catalogFile || 'components/ContentCatalog.js';
    }

    validate() {
        const issues = [];
        const summary = { hubsScanned: 0, brokenRefs: 0, hubsWithBroken: 0 };

        const catalog = this._loadCatalog();
        if (!catalog) return { issues, summary };
        const catalogIds = new Set(catalog.MODULES.map(m => m.id));
        const houses = Object.keys(catalog.HOUSES || {});

        const hubs = this._collectHubIndices(this.rootPath);
        summary.hubsScanned = hubs.length;

        const refRe = /data-module\s*=\s*["']([^"']+)["']/g;
        const brokenByHub = new Map();
        for (const hub of hubs) {
            // Skip _source/_archive
            if (hub.includes('/_source/') || hub.includes('/_archive/')) continue;
            let html;
            try { html = fs.readFileSync(hub, 'utf8'); } catch (e) { continue; }
            refRe.lastIndex = 0;
            let m;
            const broken = [];
            while ((m = refRe.exec(html)) !== null) {
                const id = m[1];
                // Skip template placeholders + obvious non-ids
                if (id.includes('${') || id === 'X' || id.length < 2) continue;
                if (catalogIds.has(id)) continue;
                // Try house-prefixed forms + component-suffix tolerance
                // (PFI Option 1, hub-001-pfi-catalog-patch.md). Catalog uses
                // `{house}-{id}-{component}` IDs (e.g. `code-pfi-w1-conditionals-pres`)
                // while hubs use bare `{id}` for progress-tracking. Suffix tolerance
                // codifies this two-namespace pattern; clears 68 refs across 4 hubs.
                const COMPONENT_SUFFIXES = ['-pres', '-presentation', '-lab', '-quiz', '-classroom', '-inclass', '-module', '-exam'];
                let resolved = false;
                for (const h of houses) {
                    if (catalogIds.has(`${h}-${id}`)) { resolved = true; break; }
                    for (const sfx of COMPONENT_SUFFIXES) {
                        if (catalogIds.has(`${h}-${id}${sfx}`)) { resolved = true; break; }
                    }
                    if (resolved) break;
                }
                if (resolved) continue;
                broken.push(id);
            }
            if (broken.length > 0) {
                brokenByHub.set(path.relative(this.rootPath, hub), broken);
                summary.hubsWithBroken++;
                summary.brokenRefs += broken.length;
            }
        }

        // Emit one issue per hub (rather than per ref) to avoid 503 noise
        for (const [hub, ids] of brokenByHub) {
            const sample = ids.slice(0, 5).join(', ');
            const more = ids.length > 5 ? ` ... +${ids.length - 5} more` : '';
            issues.push({
                code: 'HUB-001',
                severity: ids.length >= 20 ? 'high' : 'medium',
                category: 'hub-refs',
                message: `Hub references ${ids.length} module id(s) not in ContentCatalog (after house-prefix tolerance). Renderer creates card slots for nonexistent modules. Sample: ${sample}${more}`,
                file: hub,
                fix: `Either (a) update the data-module values to match catalog ids, OR (b) add aliases/short-id catalog entries pointing to the same content, OR (c) remove the dead card slots. Most common pattern: hub uses short navigation ids (m01, ch01, ccna-01) while catalog uses descriptive ids (wsa-module01, etc.) — same content, different naming. STR-29 covers similar do-* mismatch.`,
            });
        }

        return { issues, summary };
    }

    _collectHubIndices(root) {
        const out = [];
        const walk = (d) => {
            let entries;
            try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { return; }
            for (const e of entries) {
                if (e.name.startsWith('_') || e.name === 'node_modules') continue;
                const full = path.join(d, e.name);
                if (e.isDirectory()) walk(full);
                else if (e.isFile() && e.name === 'index.html') out.push(full);
            }
        };
        walk(root);
        return out;
    }

    _loadCatalog() {
        try {
            const code = fs.readFileSync(path.resolve(this.rootPath, this.catalogFile), 'utf8');
            const ctx = vm.createContext({ window: {}, console });
            vm.runInContext(code, ctx);
            return ctx.window.ContentCatalog;
        } catch (e) {
            return null;
        }
    }
}

module.exports = HubRefsValidator;
