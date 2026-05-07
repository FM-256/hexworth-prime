#!/usr/bin/env node
/**
 * audit-hub-deadrefs.js — first-pass dead-reference auditor for HUB-001
 *
 * For each hub flagged in EduScan TREASURE_MAP, count:
 *   - data-module IDs referenced in the hub
 *   - of those, how many appear to have on-disk content (file stem
 *     match OR directory-name match with common suffix stripping)
 *
 * KNOWN LIMITATIONS — interpret results carefully:
 *   - Heuristic tries common naming patterns ({id}.{kind}.html,
 *     {id}-{descriptor}/ directory) but cannot follow catalog href→file
 *     relationships fully. Hubs whose catalog entries point to descriptive
 *     filenames (e.g. catalog href 'm01-fundamentals/cloud-presentation.module.html'
 *     for module id 'wsa-module01') will be undercounted as live.
 *   - 'dead' counts here are an UPPER BOUND. True dead-ref count needs a
 *     catalog-aware audit that walks ContentCatalog.js href values and
 *     verifies each file exists.
 *
 * Verified high-confidence Class E example: forge/intro-computers
 *   (only 3 of 25 referenced IDs have any matching content on disk).
 *
 * Read-only. Reports to stdout. JSON via --json.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const APP_ROOT = path.join(REPO_ROOT, '_app');
const TREASURE = path.join(REPO_ROOT, '_tools/reports/TREASURE_MAP.json');

const JSON_MODE = process.argv.includes('--json');

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
        // Skip template placeholders (string concatenation expressions)
        if (id.includes("'") || id.includes('+') || id.includes('${')) continue;
        ids.add(id);
    }
    return [...ids];
}

function buildOnDiskIndex(hubDir) {
    // Walk hubDir and collect:
    //   - file stems matching {id}.{kind}.html
    //   - directory names (some hubs use directory-based layouts where the
    //     module id is the directory prefix, e.g. m01-fundamentals/ contains
    //     cloud-presentation.module.html for module 'm01')
    const stems = new Set();
    const dirNames = new Set();
    const stack = [hubDir];
    while (stack.length) {
        const d = stack.pop();
        let entries;
        try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { continue; }
        for (const ent of entries) {
            const full = path.join(d, ent.name);
            if (ent.isDirectory()) {
                dirNames.add(ent.name);
                // Directory-based module id: prefix before the first hyphen + descriptor
                // m01-fundamentals → m01
                const m = ent.name.match(/^([a-z]?\d{2,})(-.*)?$/);
                if (m) dirNames.add(m[1]);
                stack.push(full);
            } else if (ent.isFile()) {
                const m = ent.name.match(/^(.+)\.(presentation|lab|quiz|module|exam|applet)\.html$/);
                if (m) stems.add(m[1]);
            }
        }
    }
    return { stems, dirNames };
}

function audit() {
    const findings = getHubFindings();
    const results = [];

    for (const f of findings) {
        const hubFile = path.join(APP_ROOT, f.file);
        const hubDir = path.dirname(hubFile);
        const ids = getDataModuleIds(hubFile);
        const { stems, dirNames } = buildOnDiskIndex(hubDir);

        // For each ID: live if it matches a file stem OR a directory name
        // (directly or via common suffix-stripping for {id}-pres/lab/quiz patterns).
        const dead = [];
        const live = [];
        for (const id of ids) {
            const candidates = [
                id,
                id.replace(/-pres$/, ''),
                id.replace(/-lab$/, ''),
                id.replace(/-quiz$/, ''),
                id.replace(/-pres$/, '-presentation'),
            ];
            const hit = candidates.some(c => stems.has(c) || dirNames.has(c));
            (hit ? live : dead).push(id);
        }

        results.push({
            hub: f.file,
            referenced: ids.length,
            live: live.length,
            dead: dead.length,
            deadIds: dead.slice(0, 10),  // first 10 for brevity
        });
    }

    return results;
}

const results = audit();

if (JSON_MODE) {
    console.log(JSON.stringify(results, null, 2));
} else {
    console.log('');
    console.log('CLASS E DEAD-REFERENCE AUDIT — HUB-001 deeper read');
    console.log('─'.repeat(72));
    let totalDead = 0;
    let totalLive = 0;
    for (const r of results) {
        const pct = r.referenced ? Math.round(r.dead / r.referenced * 100) : 0;
        console.log(`  ${r.hub}`);
        console.log(`    referenced: ${r.referenced}  live: ${r.live}  dead: ${r.dead}  (${pct}% dead)`);
        if (r.dead > 0 && r.dead <= 10) {
            console.log(`    dead ids: ${r.deadIds.join(', ')}`);
        } else if (r.dead > 10) {
            console.log(`    dead ids (first 10): ${r.deadIds.join(', ')}, ...`);
        }
        totalDead += r.dead;
        totalLive += r.live;
    }
    console.log('─'.repeat(72));
    console.log(`  TOTALS: ${totalLive} live + ${totalDead} dead = ${totalLive + totalDead} total references`);
    console.log(`  Class E (dead) severity: ${totalDead > 100 ? 'CRITICAL' : totalDead > 30 ? 'HIGH' : 'MEDIUM'}`);
    console.log('');
}
