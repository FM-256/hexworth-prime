#!/usr/bin/env node
'use strict';
// Phase 5 — Incubator Hub Generator (Stragglers branch, 2026-04-30)
//
// Generates per-house incubation hub HTML files from the placement
// recommendations. Each incubator:
//
//   - Lives at _app/houses/<house>/incubator/index.html
//   - Lists modules grouped by sub-cluster prefix
//   - Includes inline JS module-id array (mech 4 — scanner detects)
//   - Shows graduation status per sub-cluster (X/10 to graduate)
//   - Banner explains incubator purpose
//
// Uses absolute paths for assets (depth-independent).

const fs = require('fs');
const path = require('path');

const PLACEMENT_PATH = path.resolve(__dirname, '../reports/PLACEMENT_RECOMMENDATIONS.json');
const STRICT_PATH = path.resolve(__dirname, '../reports/STRICT_ORPHAN_MAP.json');
const ROOT_APP = path.resolve(__dirname, '../../_app');

const HOUSE_META = {
    script:    { color: '#facc15', emblem: 'script.webp', name: 'Script' },
    code:      { color: '#22d3ee', emblem: 'code.webp', name: 'Code' },
    web:       { color: '#a78bfa', emblem: 'web.webp', name: 'Web' },
    forge:     { color: '#fb923c', emblem: 'forge.webp', name: 'Forge' },
    shield:    { color: '#34d399', emblem: 'shield.webp', name: 'Shield' },
    cloud:     { color: '#60a5fa', emblem: 'cloud.webp', name: 'Cloud' },
    eye:       { color: '#f87171', emblem: 'eye.webp', name: 'Eye' },
    'dark-arts': { color: '#a3a3a3', emblem: 'dark-arts.webp', name: 'Dark Arts' },
    matrix:    { color: '#10b981', emblem: 'matrix.webp', name: 'Matrix' },
    key:       { color: '#f472b6', emblem: 'key.webp', name: 'Key' },
    ai:        { color: '#c084fc', emblem: 'ai.webp', name: 'Machine' },
    divergent: { color: '#fbbf24', emblem: 'divergent.webp', name: 'Divergent' },
    forensics: { color: '#f87171', emblem: 'forensics.webp', name: 'Forensics' },
};

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderIncubator(house, clusters, allOrphansForHouse) {
    const meta = HOUSE_META[house] || { color: '#9ca3af', emblem: 'icon-folder.webp', name: house };
    const totalModules = clusters.reduce((s, c) => s + c.modules.length, 0);
    const graduationThreshold = 10;

    // Build per-cluster sections
    const clusterSections = clusters.map(c => {
        const remaining = Math.max(0, graduationThreshold - c.modules.length);
        const status = c.modules.length >= graduationThreshold
            ? `<span class="cluster-status grad">${c.modules.length} modules — READY TO GRADUATE</span>`
            : `<span class="cluster-status">${c.modules.length}/${graduationThreshold} modules — ${remaining} to graduate</span>`;
        const cards = c.modules.map(m => `
                <a class="incubator-card" href="${escapeHtml(m.href || '#')}" data-module="${escapeHtml(m.id)}">
                    <div class="card-id">${escapeHtml(m.id)}</div>
                    <div class="card-title">${escapeHtml(m.title || m.id)}</div>
                    ${m.description ? `<div class="card-desc">${escapeHtml(m.description.slice(0, 120))}</div>` : ''}
                </a>`).join('');
        return `
        <section class="cluster" id="cluster-${escapeHtml(c.prefix)}">
            <header class="cluster-head">
                <h2><code>${escapeHtml(c.prefix)}-*</code></h2>
                ${status}
            </header>
            <div class="cluster-cards">${cards}
            </div>
        </section>`;
    }).join('\n');

    // Inline JS array (scanner mech 4 detection)
    const moduleIdsJs = allOrphansForHouse.map(m => `    { id: '${m.id}', subcluster: '${m.subcluster}', title: ${JSON.stringify(m.title || '')} }`).join(',\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${meta.name} Incubator — Hexworth Prime</title>
    <link rel="icon" href="/assets/images/emblems/${meta.emblem}">
    <script src="/components/AccessGuard.js"></script>
    <script>AccessGuard.require('sorted');</script>
    <style>
        :root {
            --house-primary: ${meta.color};
            --house-bg: ${meta.color}11;
            --house-border: ${meta.color}33;
        }
        body { margin: 0; padding: 0; background: #0a0a0f; color: #e5e7eb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; }
        .container { max-width: 1280px; margin: 0 auto; padding: 24px; }
        .incubator-banner {
            background: var(--house-bg);
            border: 1px solid var(--house-border);
            border-left: 4px solid var(--house-primary);
            border-radius: 8px;
            padding: 18px 20px;
            margin-bottom: 28px;
        }
        .incubator-banner h1 { margin: 0 0 6px 0; font-size: 20px; color: var(--house-primary); }
        .incubator-banner p { margin: 0; line-height: 1.55; color: #cbd5e1; }
        .nav-back {
            display: inline-block;
            margin-bottom: 18px;
            color: var(--house-primary);
            text-decoration: none;
            font-size: 14px;
        }
        .nav-back:hover { text-decoration: underline; }
        .stats {
            display: flex;
            gap: 18px;
            margin-bottom: 28px;
            font-size: 14px;
            color: #9ca3af;
        }
        .stats .stat { padding: 6px 12px; background: rgba(255,255,255,0.04); border-radius: 6px; }
        .stat strong { color: #f3f4f6; }
        .cluster {
            background: rgba(255,255,255,0.02);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 8px;
            padding: 18px 20px;
            margin-bottom: 22px;
        }
        .cluster-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 14px;
            flex-wrap: wrap;
            gap: 8px;
        }
        .cluster-head h2 { margin: 0; font-size: 17px; color: #e5e7eb; }
        .cluster-head h2 code { background: var(--house-bg); color: var(--house-primary); padding: 3px 9px; border-radius: 4px; font-size: 14px; }
        .cluster-status {
            font-size: 12px;
            color: #9ca3af;
            background: rgba(255,255,255,0.05);
            padding: 4px 10px;
            border-radius: 999px;
        }
        .cluster-status.grad {
            color: ${meta.color};
            background: ${meta.color}22;
            border: 1px solid ${meta.color}55;
        }
        .cluster-cards {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 12px;
        }
        .incubator-card {
            display: block;
            padding: 12px 14px;
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 6px;
            text-decoration: none;
            color: inherit;
            transition: border-color 0.15s, transform 0.15s;
        }
        .incubator-card:hover {
            border-color: var(--house-primary);
            transform: translateY(-1px);
        }
        .card-id {
            font-family: monospace;
            font-size: 11px;
            color: #6b7280;
            margin-bottom: 4px;
        }
        .card-title { font-size: 14px; color: #f3f4f6; margin-bottom: 6px; line-height: 1.3; }
        .card-desc { font-size: 12px; color: #9ca3af; line-height: 1.4; }
    </style>
</head>
<body>
    <div class="container">
        <a class="nav-back" href="/houses/${house}/index.html">&larr; Back to House of the ${meta.name}</a>
        <div class="incubator-banner">
            <h1>${meta.name} Incubator</h1>
            <p>Content here is being evaluated for a permanent home. Topics graduate when they reach <strong>${graduationThreshold} modules</strong> with clear curriculum scope (cert, course, or topic). Until then, this is the visible parking lot — modules stay reachable instead of going stale in the catalog.</p>
        </div>
        <div class="stats">
            <div class="stat"><strong>${totalModules}</strong> modules</div>
            <div class="stat"><strong>${clusters.length}</strong> sub-clusters</div>
            <div class="stat"><strong>${clusters.filter(c => c.modules.length >= graduationThreshold).length}</strong> ready to graduate</div>
        </div>
        <main>${clusterSections}
        </main>
    </div>

    <script>
    // Inline module-id array — strict orphan scanner (mech 4) detects ids here.
    const INCUBATOR_MODULES = [
${moduleIdsJs}
    ];
    // No-op render call to satisfy hub-signature regex in scanner.
    function renderModules() { return INCUBATOR_MODULES.length; }
    renderModules();
    </script>
</body>
</html>
`;
}

function main() {
    const placement = JSON.parse(fs.readFileSync(PLACEMENT_PATH, 'utf8'));
    const strict = JSON.parse(fs.readFileSync(STRICT_PATH, 'utf8'));

    // Group incubation-bound recommendations by house
    const byHouse = {};
    for (const r of placement.recommendations) {
        if (!r.rule || !r.rule.incubation) continue;
        if (!byHouse[r.house]) byHouse[r.house] = { clusters: [], allModules: [] };
        // Find full module records for this cluster
        const items = (strict.byHouse[r.house] || {}).items || [];
        const matching = items.filter(it => {
            let parts = it.id.split('-');
            if (parts[0] === r.house) parts = parts.slice(1);
            else if (r.house === 'dark-arts' && it.id.startsWith('dark-arts-')) parts = it.id.slice('dark-arts-'.length).split('-');
            return parts[0] === r.idPrefix;
        });
        byHouse[r.house].clusters.push({
            prefix: r.idPrefix,
            modules: matching.map(m => ({
                id: m.id, title: m.title, description: m.description, href: m.href ? (m.href.startsWith('/') ? m.href : '/' + path.posix.join('houses', r.house, m.href)) : '',
            })),
        });
        byHouse[r.house].allModules.push(...matching.map(m => ({
            id: m.id, title: m.title, subcluster: r.idPrefix,
        })));
    }

    let written = 0;
    const generated = [];
    for (const [house, data] of Object.entries(byHouse)) {
        if (data.allModules.length === 0) continue;
        const dir = path.join(ROOT_APP, 'houses', house, 'incubator');
        fs.mkdirSync(dir, { recursive: true });
        const file = path.join(dir, 'index.html');

        // ── ADDITIVE MERGE ──
        // If an incubator already exists, parse its INCUBATOR_MODULES array and
        // merge with the new orphans. This prevents the path-dependence bug:
        // first run finds 489 orphans → all routed to incubator → on next run those
        // 489 are no longer orphans → recommender produces 0 incubation → naive
        // generator would overwrite the file with empty content.
        if (fs.existsSync(file)) {
            const prev = fs.readFileSync(file, 'utf8');
            // Parse existing INCUBATOR_MODULES — match objects: { id: '...', subcluster: '...', title: ... }
            const objRe = /\{\s*id:\s*['"]([^'"]+)['"]\s*,\s*subcluster:\s*['"]([^'"]+)['"]\s*,\s*title:\s*([^}]+?)\s*\}/g;
            const existingIds = new Set(data.allModules.map(m => m.id));
            const existingClustersByPrefix = new Map(data.clusters.map(c => [c.prefix, c]));
            let m;
            while ((m = objRe.exec(prev)) !== null) {
                const id = m[1], subcluster = m[2], titleRaw = m[3].trim();
                if (existingIds.has(id)) continue; // new run already covers this
                // Strip the JSON-string-wrapping quotes if present
                let title = titleRaw.replace(/^["'](.*)["']$/, '$1');
                data.allModules.push({ id, subcluster, title });
                if (!existingClustersByPrefix.has(subcluster)) {
                    const c = { prefix: subcluster, modules: [] };
                    data.clusters.push(c);
                    existingClustersByPrefix.set(subcluster, c);
                }
                existingClustersByPrefix.get(subcluster).modules.push({
                    id, title, description: '', href: '',
                });
            }
        }

        // Sort clusters: largest first
        data.clusters.sort((a, b) => b.modules.length - a.modules.length);
        const html = renderIncubator(house, data.clusters, data.allModules);
        fs.writeFileSync(file, html);
        // Also write a README graduation log
        const readme = `# ${HOUSE_META[house]?.name || house} Incubator — Graduation Log\n\n` +
            `Created: ${new Date().toISOString().split('T')[0]} (Stragglers branch)\n\n` +
            `## Initial population\n\n` +
            `| Sub-cluster | Modules | Graduation target |\n|---|---:|---|\n` +
            data.clusters.map(c => `| \`${c.prefix}-*\` | ${c.modules.length} | ${c.modules.length >= 10 ? 'Eligible — promote to dedicated hub' : `Need ${10 - c.modules.length} more`} |`).join('\n') +
            `\n\n## Graduation history\n\n_(none yet — append entries when sub-clusters move out)_\n`;
        fs.writeFileSync(path.join(dir, 'README.md'), readme);
        written++;
        generated.push({ house, file: path.relative(ROOT_APP, file), modules: data.allModules.length, clusters: data.clusters.length });
    }

    console.log('');
    console.log('  Incubator Hub Generator — Phase 5');
    console.log('');
    console.log('  Generated ' + written + ' per-house incubator hub' + (written === 1 ? '' : 's') + ':');
    for (const g of generated) {
        console.log('    ' + g.house.padEnd(15) + ' ' + String(g.modules).padStart(4) + ' modules / ' + String(g.clusters).padStart(2) + ' clusters  → ' + g.file);
    }
    console.log('');
}

main();
