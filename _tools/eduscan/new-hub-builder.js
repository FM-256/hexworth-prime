#!/usr/bin/env node
'use strict';
// New Hub Builder — Stragglers branch (2026-04-30)
// Builds 3 truly-new curriculum hubs from STRICT_ORPHAN_MAP.json:
//
//   1. _app/houses/script/modules/databases/index.html  (35 db-* modules, SQL course)
//   2. _app/houses/script/labs/linux/bash/index.html    (14 bash-* modules, Bash Mastery)
//   3. _app/houses/shield/compliance/cmmc/index.html    (15 cmmc-* modules, CMMC compliance hub)
//
// Each hub:
//   - Inline INCUBATOR_MODULES-style array (Mech 4 detection)
//   - data-module attrs on cards (Mech 1 backup)
//   - Banner with course/track context (NOT incubator language — these are permanent)
//   - Back-link to parent house
//   - Module-card grid

const fs = require('fs');
const path = require('path');

const ROOT_APP = path.resolve(__dirname, '../../_app');
const STRICT_PATH = path.resolve(__dirname, '../reports/STRICT_ORPHAN_MAP.json');

const HUB_SPECS = {
    databases: {
        outFile: 'houses/script/modules/databases/index.html',
        backLink: '/houses/script/index.html',
        backLabel: 'Back to House of the Script',
        title: 'Database Track — SQL Fundamentals',
        pageTitle: 'Database Track | House of the Script | Hexworth Prime',
        kicker: 'SQL & Data Engineering',
        description: '35 modules from SELECT basics through joins, window functions, schema design, indexing, and ETL pipelines. Mix of presentations, labs, and quizzes — sequential coverage of practical SQL for IT.',
        primary: '#facc15', // script yellow
        secondary: '#ca8a04',
        emblem: '/assets/images/icons/icon-database.webp',
        clusterFilter: i => i.id.startsWith('script-db-'),
        // Sub-cluster by file type
        groupBy: m => /\.(quiz|exam)\.html$/.test(m.href || '') ? 'Assessments'
                    : /\.lab\.html$/.test(m.href || '') ? 'Labs'
                    : 'Modules',
    },
    bash: {
        outFile: 'houses/script/labs/linux/bash/index.html',
        backLink: '/houses/script/index.html',
        backLabel: 'Back to House of the Script',
        title: 'Bash Mastery',
        pageTitle: 'Bash Mastery | House of the Script | Hexworth Prime',
        kicker: 'Linux Shell Scripting',
        description: '14 hands-on bash labs covering the practical scripting core: variables, conditionals, loops, arrays, functions, pipes, I/O redirection, and cron automation. Mix of missions (full labs) and drills (focused practice).',
        primary: '#facc15',
        secondary: '#ca8a04',
        emblem: '/assets/images/icons/icon-terminal.webp',
        clusterFilter: i => i.id.startsWith('script-bash-'),
        groupBy: m => /-drill\b/.test(m.id) ? 'Drills (focused practice)'
                     : /-prep\b/.test(m.id) ? 'Prep'
                     : 'Missions (labs)',
    },
    cmmc: {
        outFile: 'houses/shield/compliance/cmmc/index.html',
        backLink: '/houses/shield/index.html',
        backLabel: 'Back to House of the Shield',
        title: 'CMMC 2.0 — Cybersecurity Maturity Model Certification',
        pageTitle: 'CMMC | Compliance | House of the Shield | Hexworth Prime',
        kicker: 'DoD Compliance Framework',
        description: '15 applets covering the CMMC 2.0 domain map: access control, audit & accountability, config management, incident response, maintenance, media protection, personnel security, physical protection, risk assessment, security assessment, system & comm protection, and system & info integrity. Plus CUI overview, framework overview, and a comprehensive quiz.',
        primary: '#34d399', // shield green
        secondary: '#10b981',
        emblem: '/assets/images/icons/icon-shield.webp',
        clusterFilter: i => i.id.startsWith('shield-cmmc-') || i.id === 'shield-cmmc-cui' || i.id === 'shield-cmmc-overview',
        groupBy: m => m.id.includes('overview') || m.id.includes('cui') ? 'Foundations'
                    : m.id.includes('quiz') ? 'Assessment'
                    : 'CMMC Practice Domains',
    },
};

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function jsonStringify(s) {
    return JSON.stringify(String(s));
}

function resolveHref(rawHref, outFile, house) {
    if (!rawHref) return '#';
    if (rawHref.startsWith('/') || rawHref.startsWith('http')) return rawHref;
    // Catalog hrefs are relative to the house basePath (houses/<house>/).
    // The new hub's outFile is also under the house. Compute relative path
    // from outFile dir back up to the house dir, then prepend the catalog href.
    const outDir = path.posix.dirname(outFile);                     // e.g., 'houses/script/modules/databases'
    const houseDir = `houses/${house}`;                             // 'houses/script'
    const upParts = path.posix.relative(outDir, houseDir);          // '../..'
    return path.posix.join(upParts, rawHref);
}

function renderHub(spec, items, house) {
    const groups = new Map();
    for (const m of items) {
        const g = spec.groupBy(m);
        if (!groups.has(g)) groups.set(g, []);
        groups.get(g).push(m);
    }
    // Stable order: sort each group by id
    for (const arr of groups.values()) arr.sort((a, b) => a.id.localeCompare(b.id));

    const groupSections = Array.from(groups.entries()).map(([groupName, mods]) => {
        const cards = mods.map(m => {
            const href = escapeHtml(resolveHref(m.href, spec.outFile, house));
            return `
            <a class="hub-card" href="${href}" data-module="${escapeHtml(m.id)}">
                <div class="card-id">${escapeHtml(m.id)}</div>
                <div class="card-title">${escapeHtml(m.title || m.id)}</div>
                ${m.description ? `<div class="card-desc">${escapeHtml(String(m.description).slice(0, 140))}</div>` : ''}
            </a>`;
        }).join('');
        return `
        <section class="group">
            <header class="group-head">
                <h2>${escapeHtml(groupName)}</h2>
                <span class="group-count">${mods.length}</span>
            </header>
            <div class="group-cards">${cards}
            </div>
        </section>`;
    }).join('\n');

    const inlineModulesJs = items.map(m => `        { id: '${m.id}', title: ${jsonStringify(m.title || '')} }`).join(',\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(spec.pageTitle)}</title>
    <link rel="icon" href="${spec.emblem}">
    <script src="/components/AccessGuard.js"></script>
    <script>AccessGuard.require('sorted');</script>
    <style>
        :root {
            --hub-primary: ${spec.primary};
            --hub-secondary: ${spec.secondary};
            --hub-bg: ${spec.primary}11;
            --hub-border: ${spec.primary}33;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0; padding: 0;
            background: #0a0a0f; color: #e5e7eb;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            min-height: 100vh;
        }
        a { color: inherit; text-decoration: none; }
        .container { max-width: 1280px; margin: 0 auto; padding: 24px; }
        .nav-back {
            display: inline-block; margin-bottom: 18px;
            color: var(--hub-primary); font-size: 14px;
        }
        .nav-back:hover { text-decoration: underline; }
        .hub-header {
            background: linear-gradient(135deg, ${spec.primary}1A, transparent);
            border: 1px solid var(--hub-border);
            border-left: 4px solid var(--hub-primary);
            border-radius: 10px;
            padding: 22px 26px;
            margin-bottom: 28px;
        }
        .hub-kicker {
            display: inline-block;
            font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase;
            color: var(--hub-primary); margin-bottom: 8px;
        }
        .hub-header h1 { margin: 0 0 10px 0; font-size: 28px; color: #f3f4f6; }
        .hub-header p { margin: 0; color: #cbd5e1; line-height: 1.6; max-width: 880px; }
        .stats {
            display: flex; gap: 14px; margin-bottom: 26px; flex-wrap: wrap;
            font-size: 13px; color: #9ca3af;
        }
        .stats .stat { padding: 7px 13px; background: rgba(255,255,255,0.04); border-radius: 6px; }
        .stat strong { color: #f3f4f6; }
        .group {
            background: rgba(255,255,255,0.02);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 10px;
            padding: 20px 22px;
            margin-bottom: 22px;
        }
        .group-head {
            display: flex; justify-content: space-between; align-items: baseline;
            margin-bottom: 14px;
        }
        .group-head h2 {
            margin: 0; font-size: 17px; color: #e5e7eb;
            border-bottom: 2px solid var(--hub-border);
            padding-bottom: 6px;
        }
        .group-count {
            font-size: 12px; color: var(--hub-primary);
            background: var(--hub-bg);
            padding: 3px 10px; border-radius: 999px;
        }
        .group-cards {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
            gap: 12px;
        }
        .hub-card {
            display: block;
            padding: 14px 16px;
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 7px;
            transition: border-color 0.15s, transform 0.15s, background 0.15s;
        }
        .hub-card:hover {
            border-color: var(--hub-primary);
            background: rgba(255,255,255,0.05);
            transform: translateY(-1px);
        }
        .card-id {
            font-family: 'Menlo', 'Consolas', monospace;
            font-size: 11px; color: #6b7280;
            margin-bottom: 5px;
        }
        .card-title { font-size: 14px; color: #f3f4f6; margin-bottom: 6px; line-height: 1.35; font-weight: 500; }
        .card-desc { font-size: 12px; color: #9ca3af; line-height: 1.45; }
    </style>
</head>
<body>
    <div class="container">
        <a class="nav-back" href="${spec.backLink}">&larr; ${escapeHtml(spec.backLabel)}</a>
        <header class="hub-header">
            <div class="hub-kicker">${escapeHtml(spec.kicker)}</div>
            <h1>${escapeHtml(spec.title)}</h1>
            <p>${escapeHtml(spec.description)}</p>
        </header>
        <div class="stats">
            <div class="stat"><strong>${items.length}</strong> modules</div>
            <div class="stat"><strong>${groups.size}</strong> sections</div>
        </div>
        <main>${groupSections}
        </main>
    </div>

    <script>
    // Inline module-id array — strict orphan scanner (mech 4) detects ids here.
    const MODULES = [
${inlineModulesJs}
    ];
    function renderModules() { return MODULES.length; }
    renderModules();
    </script>
</body>
</html>
`;
}

function main() {
    const strict = JSON.parse(fs.readFileSync(STRICT_PATH, 'utf8'));
    let written = 0;

    for (const [key, spec] of Object.entries(HUB_SPECS)) {
        const house = spec.outFile.match(/^houses\/([^\/]+)\//)[1];
        const items = strict['byHouse'][house] ? strict['byHouse'][house].items.filter(spec.clusterFilter) : [];
        if (items.length === 0) {
            console.log(`  ${key}: no matching items in current orphan map (already in-hub?) — skipping build`);
            continue;
        }
        const outPath = path.join(ROOT_APP, spec.outFile);
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, renderHub(spec, items, house));
        written++;
        console.log(`  ${key}: wrote ${items.length} modules → ${spec.outFile}`);
    }
    console.log(`\n  ${written} hub${written === 1 ? '' : 's'} built.`);
}

main();
