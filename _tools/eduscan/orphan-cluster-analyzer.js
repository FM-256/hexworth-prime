#!/usr/bin/env node
'use strict';
// Phase 2 — Orphan Cluster Analyzer (Stragglers branch, 2026-04-30)
//
// Reads STRICT_ORPHAN_MAP.json and produces a deeper cluster-to-hub matrix:
//
//   - Sub-content detection: a module is "sub-content" if its id starts with
//     an in-hub parent id (e.g., clh-001-quiz -> parent clh-001).
//   - True curriculum orphan = orphan WITH no in-hub parent.
//   - Granular id-prefix sub-clustering within each cluster signal.
//   - Per-cluster recommendation: existing hub OR proposed new/incubation hub.
//
// Output:
//   _tools/reports/ORPHAN_CLUSTER_MATRIX.json — granular sub-cluster map
//   _tools/reports/ORPHAN_CLUSTER_MATRIX.md   — human-readable placement plan

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_APP = path.resolve(__dirname, '../../_app');
const STRICT_ORPHAN_PATH = path.resolve(__dirname, '../reports/STRICT_ORPHAN_MAP.json');
const CATALOG_PATH = path.resolve(ROOT_APP, 'components/ContentCatalog.js');
const OUT_JSON = path.resolve(__dirname, '../reports/ORPHAN_CLUSTER_MATRIX.json');
const OUT_MD = path.resolve(__dirname, '../reports/ORPHAN_CLUSTER_MATRIX.md');

function loadJSContext(filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    const ctx = vm.createContext({ window: {}, console });
    vm.runInContext(code, ctx);
    return ctx.window;
}

function main() {
    const report = JSON.parse(fs.readFileSync(STRICT_ORPHAN_PATH, 'utf8'));
    const w = loadJSContext(CATALOG_PATH);
    const catalog = w.ContentCatalog;
    const allModules = catalog.MODULES;

    // Collect enriched orphans (with cluster info) from the strict report
    const orphans = [];
    const orphanIdSet = new Set();
    for (const h of Object.values(report.byHouse)) {
        for (const item of (h.items || [])) {
            orphans.push(item);
            orphanIdSet.add(item.id);
        }
    }

    // In-hub = catalog modules NOT in orphan set
    const inHubIds = new Set();
    for (const m of allModules) {
        if (m.id && !orphanIdSet.has(m.id)) inHubIds.add(m.id);
    }

    // ── Sub-content detection ──
    // For each orphan, check if a longer-prefix in-hub id exists such that
    // orphanId starts with parentId + "-".
    const inHubArr = Array.from(inHubIds).sort((a, b) => b.length - a.length);
    function findParent(orphanId) {
        for (const pid of inHubArr) {
            if (orphanId !== pid && orphanId.startsWith(pid + '-')) return pid;
        }
        return null;
    }
    const subContentOf = new Map();
    for (const o of orphans) {
        const p = findParent(o.id);
        if (p) subContentOf.set(o.id, p);
    }

    const trueOrphans = orphans.filter(o => !subContentOf.has(o.id));
    const subOrphans = orphans.filter(o => subContentOf.has(o.id));

    // ── Sub-cluster by id-prefix (first 1-3 segments after house prefix) ──
    function idSegments(id, house) {
        let parts = id.split('-');
        if (parts[0] === house) parts = parts.slice(1);
        else if (house === 'dark-arts' && id.startsWith('dark-arts-')) parts = id.slice('dark-arts-'.length).split('-');
        return parts;
    }

    function bucketOrphan(o) {
        const segs = idSegments(o.id, o.house);
        // 2-segment prefix is usually meaningful (e.g., "py-w1", "core1-quiz")
        const k1 = segs[0] || '?';
        const k2 = segs.length >= 2 ? segs[0] + '-' + segs[1] : k1;
        return { k1, k2 };
    }

    // ── Existing hub inventory (for placement recommendations) ──
    // Walk known hub paths and tag them with house + curriculum label.
    const existingHubs = [];
    const seenHubPaths = new Set();
    function walk(d, house) {
        let entries;
        try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { return; }
        for (const e of entries) {
            if (e.isDirectory()) {
                if (e.name === '_archive' || e.name === '_source') continue;
                walk(path.join(d, e.name), house);
            }
        }
        // Check this dir for index.html
        const idx = path.join(d, 'index.html');
        if (fs.existsSync(idx) && !seenHubPaths.has(idx)) {
            const html = fs.readFileSync(idx, 'utf8');
            const isHub = /HouseRenderer|CertPathRenderer|LearningPathRenderer|ContentCatalog\.getHouseModules|renderModules|renderTracks|renderHub|PathRenderer\.init|data-module=/.test(html);
            if (isHub) {
                seenHubPaths.add(idx);
                const titleMatch = html.match(/<title>([^<]+)<\/title>/);
                existingHubs.push({
                    relPath: path.relative(ROOT_APP, idx),
                    house: house || '?',
                    title: titleMatch ? titleMatch[1].trim() : path.basename(d),
                });
            }
        }
    }
    for (const houseId of Object.keys(catalog.HOUSES || {})) {
        const base = catalog.HOUSES[houseId].basePath || `houses/${houseId}/`;
        walk(path.resolve(ROOT_APP, base), houseId);
    }
    walk(path.resolve(ROOT_APP, 'houses'), null);

    // ── Per-house cluster matrix ──
    const matrix = {};
    for (const o of trueOrphans) {
        const h = o.house || '?';
        if (!matrix[h]) matrix[h] = { trueOrphans: 0, subContent: 0, byCluster: {}, byPrefix: {} };
        matrix[h].trueOrphans++;
        const ck = o.cluster ? `${o.cluster.signal}:${o.cluster.label}` : 'unclassified';
        if (!matrix[h].byCluster[ck]) matrix[h].byCluster[ck] = { count: 0, items: [] };
        matrix[h].byCluster[ck].count++;
        if (matrix[h].byCluster[ck].items.length < 8) {
            matrix[h].byCluster[ck].items.push({ id: o.id, title: o.title });
        }
        const { k1, k2 } = bucketOrphan(o);
        if (!matrix[h].byPrefix[k1]) matrix[h].byPrefix[k1] = { count: 0, sub: {}, sample: [] };
        matrix[h].byPrefix[k1].count++;
        if (!matrix[h].byPrefix[k1].sub[k2]) matrix[h].byPrefix[k1].sub[k2] = 0;
        matrix[h].byPrefix[k1].sub[k2]++;
        if (matrix[h].byPrefix[k1].sample.length < 5) matrix[h].byPrefix[k1].sample.push(o.id);
    }
    for (const o of subOrphans) {
        const h = o.house || '?';
        if (!matrix[h]) matrix[h] = { trueOrphans: 0, subContent: 0, byCluster: {}, byPrefix: {} };
        matrix[h].subContent++;
    }

    // ── Output JSON ──
    const out = {
        generated: new Date().toISOString(),
        sourceReport: path.relative(process.cwd(), STRICT_ORPHAN_PATH),
        summary: {
            catalogTotal: allModules.length,
            inHub: inHubIds.size,
            allOrphans: orphans.length,
            trueOrphans: trueOrphans.length,
            subContentOrphans: subOrphans.length,
        },
        existingHubsCount: existingHubs.length,
        existingHubs,
        byHouse: matrix,
        subContentSamples: subOrphans.slice(0, 30).map(o => ({
            id: o.id, title: o.title, parent: subContentOf.get(o.id),
        })),
    };
    fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2));

    // ── Output Markdown ──
    let md = `# Orphan Cluster Matrix — Phase 2\n\n`;
    md += `**Generated:** ${out.generated}\n\n`;
    md += `## Summary\n\n`;
    md += `| Metric | Count |\n|---|---:|\n`;
    md += `| Catalog total | ${out.summary.catalogTotal} |\n`;
    md += `| In-hub (curated) | ${out.summary.inHub} |\n`;
    md += `| All orphans (strict) | ${out.summary.allOrphans} |\n`;
    md += `| **True curriculum orphans** | **${out.summary.trueOrphans}** |\n`;
    md += `| Sub-content orphans (parent in-hub) | ${out.summary.subContentOrphans} |\n`;
    md += `| Existing hub indices detected | ${existingHubs.length} |\n\n`;

    md += `> "True curriculum orphan" = catalog module not in any curated hub AND not the child of an in-hub parent module.\n> "Sub-content orphan" = parent module IS in a hub, but child cards (quizzes, labs, intros) aren't separately curated. Not necessarily wrong — depends on whether the platform should expose them as separate cards or roll them up.\n\n`;

    md += `## Per-House True Orphan Distribution\n\n`;
    md += `| House | True orphans | Sub-content | Top cluster | Top id-prefix |\n|---|---:|---:|---|---|\n`;
    for (const [h, m] of Object.entries(matrix).sort((a, b) => b[1].trueOrphans - a[1].trueOrphans)) {
        const topCluster = Object.entries(m.byCluster).sort((a, b) => b[1].count - a[1].count)[0];
        const topPrefix = Object.entries(m.byPrefix).sort((a, b) => b[1].count - a[1].count)[0];
        const tcStr = topCluster ? `${topCluster[0].split(':')[1] || topCluster[0]} (${topCluster[1].count})` : '—';
        const tpStr = topPrefix ? `\`${topPrefix[0]}\` (${topPrefix[1].count})` : '—';
        md += `| ${h} | ${m.trueOrphans} | ${m.subContent} | ${tcStr} | ${tpStr} |\n`;
    }
    md += `\n`;

    md += `## Per-House Detail\n\n`;
    for (const [h, m] of Object.entries(matrix).sort((a, b) => b[1].trueOrphans - a[1].trueOrphans)) {
        md += `### \`${h}\` — ${m.trueOrphans} true orphans, ${m.subContent} sub-content\n\n`;
        md += `**Top id-prefix sub-clusters:**\n\n`;
        const sorted = Object.entries(m.byPrefix).sort((a, b) => b[1].count - a[1].count).slice(0, 12);
        for (const [pre, info] of sorted) {
            const subTop = Object.entries(info.sub).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, n]) => `${k}=${n}`).join(', ');
            md += `- \`${pre}-*\` (${info.count}): ${subTop}\n`;
            md += `  - sample: ${info.sample.slice(0, 3).map(s => `\`${s}\``).join(', ')}\n`;
        }
        md += `\n**Top curriculum-signal clusters:**\n\n`;
        const sortedC = Object.entries(m.byCluster).sort((a, b) => b[1].count - a[1].count).slice(0, 8);
        for (const [ck, info] of sortedC) {
            md += `- ${ck} (${info.count})\n`;
        }
        md += `\n`;
    }

    md += `## Existing Hub Inventory (${existingHubs.length})\n\n`;
    md += `Hubs indexed by mechanism 1/3/4 detection (data-module attrs or renderer-call signature).\n\n`;
    const hubsByHouse = {};
    for (const h of existingHubs) {
        if (!hubsByHouse[h.house]) hubsByHouse[h.house] = [];
        hubsByHouse[h.house].push(h);
    }
    for (const [house, hubs] of Object.entries(hubsByHouse).sort()) {
        md += `### \`${house}\` (${hubs.length} hub${hubs.length === 1 ? '' : 's'})\n\n`;
        for (const h of hubs.sort((a, b) => a.relPath.localeCompare(b.relPath))) {
            md += `- \`${h.relPath}\` — ${h.title}\n`;
        }
        md += `\n`;
    }

    md += `## Sub-Content Samples (first 30)\n\n`;
    md += `These orphans have a parent module already in-hub. Decision needed: roll up into parent, or expose as separate hub cards.\n\n`;
    md += `| Orphan id | Parent (in-hub) |\n|---|---|\n`;
    for (const s of out.subContentSamples) {
        md += `| \`${s.id}\` | \`${s.parent}\` |\n`;
    }

    fs.writeFileSync(OUT_MD, md);

    // ── stdout summary ──
    console.log('');
    console.log('  Orphan Cluster Matrix — Phase 2');
    console.log('');
    console.log('    Catalog total:           ' + out.summary.catalogTotal);
    console.log('    In-hub:                  ' + out.summary.inHub);
    console.log('    All orphans (strict):    ' + out.summary.allOrphans);
    console.log('    TRUE curriculum orphans: ' + out.summary.trueOrphans);
    console.log('    Sub-content orphans:     ' + out.summary.subContentOrphans);
    console.log('    Existing hubs detected:  ' + existingHubs.length);
    console.log('');
    console.log('  Per-house (true orphans / sub-content):');
    for (const [h, m] of Object.entries(matrix).sort((a, b) => b[1].trueOrphans - a[1].trueOrphans)) {
        console.log('    ' + h.padEnd(15) + ' ' + String(m.trueOrphans).padStart(4) + ' / ' + String(m.subContent).padStart(4));
    }
    console.log('');
    console.log('  JSON: ' + path.relative(process.cwd(), OUT_JSON));
    console.log('  MD:   ' + path.relative(process.cwd(), OUT_MD));
}

main();
