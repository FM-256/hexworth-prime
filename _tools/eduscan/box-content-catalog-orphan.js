#!/usr/bin/env node
/**
 * EduScan — Box Discoverability Orphan Audit (BOX-014)
 *
 * Detects boxes that exist on disk (config.js + index.html with
 * BoxEngine.init) but are NOT referenced from ANY platform-level
 * discovery surface. Orphan labs cannot be reached through search,
 * dashboard widgets, house indices, or hub pages, so students who
 * don't have the direct URL never find them.
 *
 * Why this rule matters:
 *   PIS-FINAL was built end-to-end and shipped to a preview channel
 *   before BOX-129 surfaced that the ContentCatalog entry was missing.
 *
 *   The platform has TWO discovery taxonomies:
 *     1. Curriculum content — catalogued in
 *        `_app/components/ContentCatalog.js`. Houses, courses,
 *        presentations, labs in courses (e.g. PIS, ETH).
 *     2. CTF arena content — catalogued in `_app/arena/index.html`
 *        (arena hub), `_app/dispatch/index.html`, and similar hub
 *        files. Stand-alone CTF boxes.
 *
 *   ES-10 (ContentCatalog Validator) covers catalog → file path
 *   resolution. This rule covers file → discovery surface:
 *   "this box exists; can a student get to it from somewhere?"
 *
 * Detection:
 *   For each BoxEngine config dirname on disk:
 *     1. Search the discovery surfaces (ContentCatalog.js plus all
 *        HTML hub files outside the box's own dir) for the dirname.
 *     2. If absent from ALL → orphan finding (HIGH — invisible lab).
 *
 *   The slash boundary prevents false matches on dirnames that are
 *   substrings of other paths (e.g., a-1 matching a-10).
 *
 * Issue code:
 *   BOX-014-DISCOVERY-ORPHAN  Box dirname not referenced in any
 *                             platform-level discovery surface.
 *                             Students cannot find it via navigation.
 *                             Severity: HIGH.
 *
 * Self-validation cases:
 *   - pis-final-patient-zero — MUST be catalogued (added 2026-05-22)
 *   - a1-ancient-ledger      — MUST be discoverable (arena hub)
 *
 * Read-only.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const APP_DIR = path.join(ROOT, '_app');
const CATALOG_PATH = path.join(ROOT, '_app/components/ContentCatalog.js');
const REPORTS_DIR = path.join(ROOT, '_tools/reports');
const OUT_FILE = path.join(REPORTS_DIR, 'BOX_CONTENT_CATALOG_ORPHAN.json');

const REPORT_ONLY = process.argv.includes('--report-only');

// Hub-style discovery surfaces. The box's OWN index.html doesn't count
// (every box references itself). We search the catalog plus other hub
// HTML files in the platform.
const DISCOVERY_HUB_GLOBS = [
    'arena/index.html',
    'arena/sub-hubs',          // any HTML in arena sub-hubs
    'dispatch/index.html',
    'workshop/index.html',
    'houses',                  // any HTML in houses/*/
    'dashboard.html',
    'sorting.html'
];

const SELF_VALIDATION = {
    'pis-final-patient-zero': { expectDiscoverable: true },
    'a1-ancient-ledger':      { expectDiscoverable: true }
};

function collectDiscoverySurfaces() {
    const surfaces = [];
    if (fs.existsSync(CATALOG_PATH)) {
        surfaces.push({ file: CATALOG_PATH, content: fs.readFileSync(CATALOG_PATH, 'utf8') });
    }
    // Dispatch hub manifest — boxes are rendered from this JSON at runtime
    // (not embedded in dispatch/index.html as hardcoded cards anymore).
    const dispatchManifest = path.join(APP_DIR, 'dispatch/boxes.json');
    if (fs.existsSync(dispatchManifest)) {
        surfaces.push({ file: dispatchManifest, content: fs.readFileSync(dispatchManifest, 'utf8') });
    }
    const stack = [APP_DIR];
    while (stack.length > 0) {
        const d = stack.pop();
        let entries;
        try { entries = fs.readdirSync(d, { withFileTypes: true }); }
        catch (e) { continue; }
        for (const e of entries) {
            if (e.name.startsWith('.') || e.name === 'node_modules') continue;
            if (e.name === '_archive' || e.name === '_source') continue;
            const p = path.join(d, e.name);
            if (e.isDirectory()) {
                // Skip arena/boxes and dispatch/boxes subtrees — those are
                // each box's own dir and we don't want a box's own files
                // to count as "discovered." We catch the hub index files
                // (arena/index.html, dispatch/index.html) before descending.
                if (p.endsWith(path.sep + 'arena' + path.sep + 'boxes')) continue;
                if (p.endsWith(path.sep + 'dispatch' + path.sep + 'boxes')) continue;
                if (p.endsWith(path.sep + 'workshop') && fs.existsSync(path.join(p, 'index.html'))) {
                    // descend but don't add per-box workshop pages
                }
                stack.push(p);
            } else if (e.isFile() && /(index|hub|sub-hub|sorting|dashboard).*\.html$/i.test(e.name)) {
                try {
                    surfaces.push({ file: p, content: fs.readFileSync(p, 'utf8') });
                } catch (err) { /* skip */ }
            }
        }
    }
    return surfaces;
}

function findBoxConfigs(root) {
    const out = [];
    const stack = [root];
    while (stack.length > 0) {
        const d = stack.pop();
        let entries;
        try { entries = fs.readdirSync(d, { withFileTypes: true }); }
        catch (e) { continue; }
        for (const e of entries) {
            if (e.name.startsWith('.') || e.name === 'node_modules') continue;
            if (e.name === '_archive' || e.name === '_source') continue;
            if (e.isDirectory()) stack.push(path.join(d, e.name));
        }
        const files = entries.filter(e => e.isFile()).map(e => e.name);
        if (files.includes('index.html') && files.includes('config.js')) {
            try {
                const idx = fs.readFileSync(path.join(d, 'index.html'), 'utf8');
                if (/BoxEngine\.init/.test(idx)) {
                    out.push({
                        dirname: path.basename(d),
                        relDir: path.relative(ROOT, d) + path.sep
                    });
                }
            } catch (e) { /* skip */ }
        }
    }
    return out;
}

function main() {
    const startMs = Date.now();
    if (!fs.existsSync(CATALOG_PATH)) {
        console.error('FATAL: ContentCatalog.js missing at ' + CATALOG_PATH);
        process.exit(99);
    }

    const boxes = findBoxConfigs(APP_DIR);
    if (boxes.length === 0) {
        console.error('FATAL: no BoxEngine configs found.');
        process.exit(99);
    }

    const surfaces = collectDiscoverySurfaces();
    if (surfaces.length === 0) {
        console.error('FATAL: no discovery surfaces found.');
        process.exit(99);
    }

    const verdicts = [];
    for (const box of boxes) {
        const needle = '/' + box.dirname + '/';
        // A box's OWN dir might contain other html files (e.g., workshop/X/current.html).
        // Filter discovery surfaces to those NOT inside the box's own directory.
        const boxDirAbs = path.join(ROOT, box.relDir);
        const externalSurfaces = surfaces.filter(s => !s.file.startsWith(boxDirAbs));
        const matchedIn = externalSurfaces.filter(s => s.content.includes(needle)).map(s => path.relative(ROOT, s.file));

        if (matchedIn.length > 0) {
            verdicts.push({
                dirname: box.dirname,
                class: 'discoverable',
                severity: null,
                surfaces: matchedIn.slice(0, 3)
            });
        } else {
            verdicts.push({
                dirname: box.dirname,
                relDir: box.relDir,
                class: 'orphan',
                severity: 'high',
                code: 'BOX-014-DISCOVERY-ORPHAN',
                message: `Box exists on disk but is not referenced in ContentCatalog.js or any hub/index HTML. Students cannot navigate to it.`,
                fix: `Add a ContentCatalog entry OR a lab card to the appropriate hub index (arena/index.html, houses/<house>/index.html, etc.).`
            });
        }
    }

    // Self-validation
    const selfFailures = [];
    for (const [dn, exp] of Object.entries(SELF_VALIDATION)) {
        const v = verdicts.find(x => x.dirname === dn);
        if (!v) { selfFailures.push({ box: dn, reason: 'not discovered on disk' }); continue; }
        const isDiscoverable = v.class === 'discoverable';
        if (isDiscoverable !== exp.expectDiscoverable) {
            selfFailures.push({ box: dn, expected: exp.expectDiscoverable ? 'discoverable' : 'orphan', got: v.class });
        }
    }
    if (selfFailures.length > 0) {
        console.error('SELF-VALIDATION FAILURE:');
        for (const f of selfFailures) console.error('  ' + JSON.stringify(f));
        console.error('Refusing to write report.');
        process.exit(2);
    }

    const orphans = verdicts.filter(v => v.class === 'orphan');
    const discoverable = verdicts.filter(v => v.class === 'discoverable');

    const report = {
        generatedAt: new Date().toISOString(),
        tool: 'box-content-catalog-orphan',
        validatorCode: 'BOX-014',
        scope: { input: '_app/**/config.js cross-referenced with ContentCatalog.js + hub HTMLs' },
        totals: {
            boxesScanned: boxes.length,
            discoverable: discoverable.length,
            orphans: orphans.length,
            discoverySurfaces: surfaces.length,
            durationMs: Date.now() - startMs
        },
        selfValidation: { cases: Object.keys(SELF_VALIDATION).length, failures: 0, verdict: 'PASS' },
        findings: orphans,
        verdicts
    };
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    console.log('box-content-catalog-orphan (BOX-014)');
    console.log('========================================');
    console.log('  Boxes scanned:           ' + boxes.length);
    console.log('  Discovery surfaces:      ' + surfaces.length);
    console.log('  Discoverable:            ' + discoverable.length);
    console.log('  ORPHANS (HIGH):          ' + orphans.length);
    console.log('  Self-validation:         PASS (' + Object.keys(SELF_VALIDATION).length + ' test cases)');
    console.log('  Duration:                ' + (Date.now() - startMs) + 'ms');
    console.log('  Output:                  ' + path.relative(ROOT, OUT_FILE));

    if (orphans.length > 0) {
        console.log('---');
        console.log('Orphan boxes (' + orphans.length + ' — not in ContentCatalog):');
        orphans.slice(0, 20).forEach(v => console.log('  ' + v.dirname));
        if (orphans.length > 20) console.log('  ... and ' + (orphans.length - 20) + ' more');
    }

    if (REPORT_ONLY || orphans.length === 0) process.exit(0);
    process.exit(1);
}

main();
