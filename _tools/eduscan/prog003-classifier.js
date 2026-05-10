#!/usr/bin/env node
/**
 * prog003-classifier.js — Reconcile PROG-003 shared-progress-key findings
 * with actual catalog routing state.
 *
 * For each PROG-003 finding (two files calling ModuleProgress.complete with
 * the same (house, moduleId)):
 *   - Classify by structural pattern (CLH applet/module, web Network+ rebuild,
 *     etc.)
 *   - Verify each file's catalog routing state (referenced in
 *     ContentCatalog.js / LearningPaths.js / content-registry*.js)
 *   - Distinguish ACTIVE-DUAL (both routes live = active XP suppression)
 *     from ZOMBIE-FILE (one path has no catalog/registry references)
 *
 * Inputs:
 *   - _tools/nexus/findings.json (filtered to PROG-003)
 *   - _app/components/ContentCatalog.js
 *   - _app/components/LearningPaths.js
 *   - _app/config/content-registry*.js
 *   - _app/houses/**\/index.html (hub direct-link references)
 *
 * Output: stdout report + optional JSON.
 *
 * Usage:
 *   node _tools/eduscan/prog003-classifier.js              # human-readable
 *   node _tools/eduscan/prog003-classifier.js --json       # machine-readable
 *
 * Authoritative reference:
 *   _docs/operations/prog-003-shared-progress-key-reconciliation-2026-05-09.md
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const FINDINGS = path.join(ROOT, '_tools/nexus/findings.json');
const APP = path.join(ROOT, '_app');

const wantJson = process.argv.includes('--json');

// ─── Step 1: Extract PROG-003 findings ──────────────────────────────
const data = JSON.parse(fs.readFileSync(FINDINGS, 'utf8'));
const prog003 = data.findings.filter(f => f.code === 'PROG-003');

const byKey = {};
for (const f of prog003) {
    const m = f.message.match(/'([^']+)', '([^']+)'/);
    if (!m) continue;
    const [, house, modId] = m;
    const filesMatch = f.message.match(/Files:\n([\s\S]+?)$/);
    const files = filesMatch
        ? filesMatch[1].split('\n').map(l => l.replace(/^\s*-\s*/, '').trim()).filter(Boolean)
        : [];
    byKey[`${house}::${modId}`] = { house, modId, files };
}

// ─── Step 2: Classify by structural pattern ─────────────────────────
const buckets = {
    clhAppletModule: [],
    webNetworkPlusPresentations: [],
    webNetworkPlusTools: [],
    webNetworkPlusLabs: [],
    webNetworkPlusModules: [],
    webNetworkPlusQuizzes: [],
    appletVsTools: [],
    other: [],
};

for (const k in byKey) {
    const e = byKey[k];
    const f = e.files;
    if (f.length !== 2) { buckets.other.push(e); continue; }
    const [a, b] = f;
    const isCLH = (s) => s.includes('/script/clh/') || s.includes('/script/courses/clh/');
    const isApplet = (s) => s.includes('.applet.html');
    const isModule = (s) => s.includes('.module.html');

    if (isCLH(a) && isCLH(b) && (isApplet(a) || isApplet(b)) && (isModule(a) || isModule(b))) {
        buckets.clhAppletModule.push(e);
    } else if ((a.includes('/network-plus/presentations/') || b.includes('/network-plus/presentations/')) && (a.includes('/web/presentations/') || b.includes('/web/presentations/'))) {
        buckets.webNetworkPlusPresentations.push(e);
    } else if ((a.includes('/network-plus/tools/') || b.includes('/network-plus/tools/')) && (a.includes('/web/tools/') || b.includes('/web/tools/'))) {
        buckets.webNetworkPlusTools.push(e);
    } else if ((a.includes('/network-plus/labs/') || b.includes('/network-plus/labs/')) && (a.includes('/web/labs/') || b.includes('/web/labs/'))) {
        buckets.webNetworkPlusLabs.push(e);
    } else if ((a.includes('/network-plus/modules/') || b.includes('/network-plus/modules/')) && (a.includes('/web/network-essentials/') || b.includes('/web/network-essentials/'))) {
        buckets.webNetworkPlusModules.push(e);
    } else if ((a.includes('/network-plus/quizzes/') || b.includes('/network-plus/quizzes/')) && (a.includes('/web/quizzes/') || b.includes('/web/quizzes/'))) {
        buckets.webNetworkPlusQuizzes.push(e);
    } else if (isApplet(a) || isApplet(b)) {
        buckets.appletVsTools.push(e);
    } else {
        buckets.other.push(e);
    }
}

// ─── Step 3: Per-file catalog-routing verification ──────────────────
function refsForFile(filePath) {
    const basename = path.basename(filePath);
    const tail = filePath.split('/').slice(-2).join('/');
    const cmd = `grep -lE "${basename.replace(/\./g, '\\.')}" \
        ${APP}/components/ContentCatalog.js \
        ${APP}/components/LearningPaths.js \
        ${APP}/config/content-registry.js \
        ${APP}/config/content-registry-migrated.js 2>/dev/null || true`;
    let registries = [];
    try {
        registries = execSync(cmd, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
    } catch (e) {}
    let hubRefs = [];
    try {
        const hubCmd = `grep -rl "${tail}" ${APP}/houses/ --include="index.html" 2>/dev/null || true`;
        hubRefs = execSync(hubCmd, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
    } catch (e) {}
    return { registries, hubRefs };
}

function classifyRouting(entry) {
    const refs = entry.files.map(f => ({ file: f, ...refsForFile(f) }));
    const live = refs.filter(r => r.registries.length > 0 || r.hubRefs.length > 0);
    if (live.length === 2) return { state: 'ACTIVE-DUAL', refs };
    if (live.length === 1) return { state: 'ZOMBIE-FILE', refs };
    return { state: 'ORPHANED-BOTH', refs };
}

const enriched = {};
for (const bucketName in buckets) {
    enriched[bucketName] = buckets[bucketName].map(e => {
        const r = classifyRouting(e);
        return { ...e, routing: r.state, refs: r.refs };
    });
}

// ─── Step 4: Output ─────────────────────────────────────────────────
const summary = {
    totalFindings: Object.keys(byKey).length,
    structural: {},
    routing: { 'ACTIVE-DUAL': 0, 'ZOMBIE-FILE': 0, 'ORPHANED-BOTH': 0 },
};
for (const bucketName in enriched) {
    summary.structural[bucketName] = enriched[bucketName].length;
    enriched[bucketName].forEach(e => { summary.routing[e.routing] = (summary.routing[e.routing] || 0) + 1; });
}

if (wantJson) {
    console.log(JSON.stringify({ summary, details: enriched }, null, 2));
    process.exit(0);
}

console.log('=== PROG-003 reconciliation ===\n');
console.log('Total findings: ' + summary.totalFindings);
console.log('\nStructural buckets:');
Object.entries(summary.structural).forEach(([k, v]) => console.log('  ' + k.padEnd(35) + v));
console.log('\nRouting state:');
console.log('  ACTIVE-DUAL    (both routes live = P1 XP-suppression bug):  ' + (summary.routing['ACTIVE-DUAL'] || 0));
console.log('  ZOMBIE-FILE    (one path has no catalog refs = silent FP):  ' + (summary.routing['ZOMBIE-FILE'] || 0));
console.log('  ORPHANED-BOTH  (no catalog refs found = orphan):            ' + (summary.routing['ORPHANED-BOTH'] || 0));

for (const bucketName in enriched) {
    if (enriched[bucketName].length === 0) continue;
    console.log('\n--- ' + bucketName + ' ---');
    enriched[bucketName].forEach(e => {
        console.log('  [' + e.routing + '] ' + e.modId);
        e.refs.forEach(r => {
            const tag = (r.registries.length + r.hubRefs.length) > 0 ? 'LIVE' : 'no-refs';
            console.log('      [' + tag + '] ' + r.file);
            if (r.registries.length > 0) console.log('         registry: ' + r.registries.map(p => p.replace(APP, '_app')).join(', '));
            if (r.hubRefs.length > 0)    console.log('         hubs:     ' + r.hubRefs.map(p => p.replace(APP, '_app')).join(', '));
        });
    });
}
