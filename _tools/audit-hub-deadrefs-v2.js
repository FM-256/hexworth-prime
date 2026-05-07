#!/usr/bin/env node
/**
 * audit-hub-deadrefs-v2.js — catalog-aware dead-reference auditor for HUB-001
 *
 * Walks _app/components/ContentCatalog.js for all entries' (house, id, href)
 * triples, then for each hub's referenced data-module:
 *
 *   - LIVE       : catalog has entry AND its href file exists on disk
 *   - BROKEN     : catalog has entry BUT its href file is missing (catalog drift)
 *   - UNMAPPED   : catalog has NO entry (HUB-001's basic finding)
 *   - DEAD       : UNMAPPED + no fallback file match for the id (Class E)
 *
 * Replaces v1's heuristic with a real catalog-href traversal. Trustworthy
 * counts for operator review.
 *
 * Read-only. Reports to stdout. JSON via --json.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const APP_ROOT = path.join(REPO_ROOT, '_app');
const CATALOG_PATH = path.join(APP_ROOT, 'components/ContentCatalog.js');
const TREASURE = path.join(REPO_ROOT, '_tools/reports/TREASURE_MAP.json');

const JSON_MODE = process.argv.includes('--json');

// ── Catalog ingest ──
function loadCatalogEntries() {
    // Catalog entries are object literals like:
    //   { house: 'cloud', id: 'wsa-module01', title: '...', ... href: 'modules/wsa/m01-fundamentals/cloud-presentation.module.html', ... }
    // Pull (house, id, href) per line.
    const text = fs.readFileSync(CATALOG_PATH, 'utf8');
    const entries = new Map();  // id → { house, href }
    const re = /\{\s*house:\s*'([^']+)'\s*,\s*id:\s*'([^']+)'[^}]*href:\s*'([^']*)'[^}]*\}/g;
    let m;
    while ((m = re.exec(text)) !== null) {
        const [_, house, id, href] = m;
        entries.set(id, { house, href });
    }
    return entries;
}

function getHubFindings() {
    const data = JSON.parse(fs.readFileSync(TREASURE, 'utf8'));
    return data.issues.filter(i => i.code === 'HUB-001' && i.severity === 'high');
}

function getDataModuleIds(hubFile) {
    const content = fs.readFileSync(hubFile, 'utf8');
    const ids = new Set();
    const re = /data-module="([^"]+)"/g;
    let m;
    while ((m = re.exec(content)) !== null) {
        const id = m[1];
        if (id.includes("'") || id.includes('+') || id.includes('${')) continue;
        ids.add(id);
    }
    return [...ids];
}

function houseOfHub(hubFile) {
    // _app/houses/<house>/.../index.html
    const parts = path.relative(APP_ROOT, hubFile).split(path.sep);
    if (parts[0] === 'houses' && parts.length >= 2) return parts[1];
    return null;
}

function resolveHrefFile(house, href) {
    // House-relative href: _app/houses/<house>/<href>
    if (!href) return null;
    return path.join(APP_ROOT, 'houses', house, href);
}

function collectFileStems(rootDir) {
    // Walk rootDir, return Set of all {id}.{kind}.html stems found.
    const stems = new Set();
    const stack = [rootDir];
    while (stack.length) {
        const d = stack.pop();
        let entries;
        try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { continue; }
        for (const ent of entries) {
            const full = path.join(d, ent.name);
            if (ent.isDirectory()) {
                stack.push(full);
            } else if (ent.isFile()) {
                const m = ent.name.match(/^(.+)\.(presentation|lab|quiz|module|exam|applet)\.html$/);
                if (m) stems.add(m[1]);
            }
        }
    }
    return stems;
}

function audit() {
    const catalog = loadCatalogEntries();
    const findings = getHubFindings();
    const results = [];

    for (const f of findings) {
        const hubFile = path.join(APP_ROOT, f.file);
        const hubHouse = houseOfHub(hubFile);
        const ids = getDataModuleIds(hubFile);

        const buckets = { LIVE: [], BROKEN: [], FILE_NO_CATALOG: [], DEAD: [] };
        const hubDir = path.dirname(hubFile);
        const fileStems = collectFileStems(hubDir);

        for (const id of ids) {
            const entry = catalog.get(id);
            if (entry) {
                const filePath = resolveHrefFile(entry.house, entry.href);
                const exists = filePath && fs.existsSync(filePath);
                buckets[exists ? 'LIVE' : 'BROKEN'].push({ id, href: entry.href, house: entry.house });
            } else {
                // No catalog entry. Does the id match a file stem in the hub's tree?
                const stems = [
                    id,
                    id.replace(/-pres$/, ''),
                    id.replace(/-pres$/, '-presentation'),
                ];
                const fileMatch = stems.find(s => fileStems.has(s));
                if (fileMatch) {
                    buckets.FILE_NO_CATALOG.push({ id, fileStem: fileMatch });
                } else {
                    buckets.DEAD.push({ id });
                }
            }
        }

        results.push({
            hub: f.file,
            hubHouse,
            referenced: ids.length,
            live: buckets.LIVE.length,
            broken: buckets.BROKEN.length,
            fileNoCatalog: buckets.FILE_NO_CATALOG.length,
            dead: buckets.DEAD.length,
            samples: {
                broken: buckets.BROKEN.slice(0, 3),
                fileNoCatalog: buckets.FILE_NO_CATALOG.slice(0, 3),
                dead: buckets.DEAD.slice(0, 5),
            },
        });
    }

    return results;
}

const results = audit();

if (JSON_MODE) {
    console.log(JSON.stringify(results, null, 2));
} else {
    console.log('');
    console.log('CATALOG-AWARE HUB-001 AUDIT (v2)');
    console.log('─'.repeat(72));
    let tLive = 0, tBroken = 0, tFnc = 0, tDead = 0;
    for (const r of results) {
        console.log(`  ${r.hub} (house: ${r.hubHouse})`);
        console.log(`    refs: ${r.referenced}  |  live: ${r.live}  broken: ${r.broken}  fileNoCatalog: ${r.fileNoCatalog}  dead: ${r.dead}`);
        if (r.broken > 0) {
            console.log('    BROKEN (catalog has entry, href file missing):');
            for (const b of r.samples.broken) console.log(`      - ${b.id} → ${b.href}`);
            if (r.broken > 3) console.log(`      ... +${r.broken - 3} more`);
        }
        if (r.fileNoCatalog > 0) {
            console.log('    FILE_NO_CATALOG (file exists but no catalog entry — catalog gap):');
            for (const x of r.samples.fileNoCatalog) console.log(`      - ${x.id} (file stem: ${x.fileStem})`);
            if (r.fileNoCatalog > 3) console.log(`      ... +${r.fileNoCatalog - 3} more`);
        }
        if (r.dead > 0) {
            console.log('    DEAD (no catalog entry AND no file stem match — Class E):');
            for (const d of r.samples.dead) console.log(`      - ${d.id}`);
            if (r.dead > 5) console.log(`      ... +${r.dead - 5} more`);
        }
        tLive += r.live; tBroken += r.broken; tFnc += r.fileNoCatalog; tDead += r.dead;
    }
    console.log('─'.repeat(72));
    const total = tLive + tBroken + tFnc + tDead;
    console.log(`  TOTALS: live=${tLive}  broken=${tBroken}  fileNoCatalog=${tFnc}  dead=${tDead}  (refs=${total})`);
    console.log('');
    console.log('  Bucket meanings:');
    console.log('    LIVE             = catalog entry exists AND href file exists');
    console.log('    BROKEN           = catalog drift (entry present, file missing)');
    console.log('    FILE_NO_CATALOG  = real content exists but catalog has no entry (gap)');
    console.log('    DEAD             = no catalog entry AND no file (true Class E)');
    console.log('');
}
