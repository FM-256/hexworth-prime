#!/usr/bin/env node
'use strict';
// Strict Orphan Scanner — Stragglers branch, definition v2 (2026-04-30)
//
// Original orphan-audit.js used a permissive 6-mechanism reachability test.
// That defines "reachable" but not "in a curated hub." This scanner uses the
// stricter definition the operator wants for the Stragglers placement plan:
//
//   ORPHAN = catalog module NOT referenced by any curated hub
//
//   "Curated hub" means a learning-curriculum surface that intentionally
//   curates a specific set of modules in a deliberate sequence:
//
//     IN-HUB:
//       1. Module id appears as data-module="X" attribute on any hub page
//          (course hubs, e.g. python-programming/index.html)
//       2. Module id appears in LearningPaths.PATHS modules array
//          (cert tracks, e.g. security-plus, ccna)
//       3. Module id is referenced in a *Data.js consumed by a sibling
//          *Engine renderer (e.g., ForensicsData → ForensicsEngine.renderHub)
//       4. Module id appears as a quoted string literal inside <script>
//          blocks of a verified hub index.html (CLH, Feh, cortex, etc.
//          that use inline JS module arrays). "Verified hub" = file has
//          a renderer-call signature OR data-module attrs (so we don't
//          contaminate from arbitrary non-hub pages).
//
//     NOT IN-HUB (does NOT make module non-orphan):
//       - getHouseModules('X') runtime call (catalog dump, not curation)
//       - Bespoke <a href="..."> link from any page (navigational, not curation)
//       - ContentDiscovery search index (discovery, not curation)
//
// Output:
//   _tools/reports/STRICT_ORPHAN_MAP.json — full orphan list grouped by house
//   stdout: summary by house with cluster preview

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_APP = path.resolve(__dirname, '../../_app');
const CATALOG_PATH = path.resolve(ROOT_APP, 'components/ContentCatalog.js');
const LEARNING_PATHS_PATH = path.resolve(ROOT_APP, 'components/LearningPaths.js');
const OUTPUT_PATH = path.resolve(__dirname, '../reports/STRICT_ORPHAN_MAP.json');

function loadJSContext(filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    const ctx = vm.createContext({ window: {}, console });
    vm.runInContext(code, ctx);
    return ctx.window;
}

function findIndexFiles(dir) {
    const results = [];
    function walk(d) {
        let entries;
        try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { return; }
        for (const entry of entries) {
            const full = path.join(d, entry.name);
            if (entry.isDirectory()) {
                if (entry.name === '_archive' || entry.name === '_source') continue;
                walk(full);
            } else if (entry.isFile() && entry.name === 'index.html') {
                results.push(full);
            }
        }
    }
    walk(dir);
    return results;
}

function relPath(p) { return path.relative(ROOT_APP, p); }

// ── Cluster naming heuristics ──
// Detect curriculum signals from module id / title to suggest assignment.
// Returns { signal, label } or null.
function detectCluster(mod) {
    const id = (mod.id || '').toLowerCase();
    const title = (mod.title || '').toLowerCase();
    const tags = (mod.tags || []).map(t => t.toLowerCase());
    const desc = (mod.description || '').toLowerCase();

    // Cert codes (priority — most specific)
    const certPatterns = [
        ['chfi', 'EC-Council CHFI'],
        ['gcfa', 'GIAC GCFA'],
        ['gcfe', 'GIAC GCFE'],
        ['gnfa', 'GIAC GNFA'],
        ['grem', 'GIAC GREM'],
        ['cysa', 'CompTIA CySA+ (CS0-003)'],
        ['casp', 'CompTIA CASP+'],
        ['pentest', 'CompTIA PenTest+'],
        ['secplus', 'CompTIA Security+ (SY0-701)'],
        ['sec-plus', 'CompTIA Security+ (SY0-701)'],
        ['security-plus', 'CompTIA Security+ (SY0-701)'],
        ['netplus', 'CompTIA Network+'],
        ['net-plus', 'CompTIA Network+'],
        ['network-plus', 'CompTIA Network+'],
        ['aplus-core1', 'CompTIA A+ Core 1'],
        ['aplus-core2', 'CompTIA A+ Core 2'],
        ['linux-plus', 'CompTIA Linux+'],
        ['cloud-plus', 'CompTIA Cloud+'],
        ['server-plus', 'CompTIA Server+'],
        ['ms-900', 'Microsoft 365 Fundamentals (MS-900)'],
        ['ms-102', 'Microsoft M365 Administrator (MS-102)'],
        ['ai-900', 'Microsoft AI Fundamentals (AI-900)'],
        ['az-900', 'Microsoft Azure Fundamentals (AZ-900)'],
        ['az-104', 'Microsoft Azure Administrator (AZ-104)'],
        ['az-204', 'Microsoft Azure Developer (AZ-204)'],
        ['az-305', 'Microsoft Azure Architect (AZ-305)'],
        ['az-500', 'Microsoft Azure Security (AZ-500)'],
        ['az-700', 'Microsoft Azure Network (AZ-700)'],
        ['sc-200', 'Microsoft SC-200'],
        ['sc-900', 'Microsoft SC-900'],
        ['pl-300', 'Microsoft Power BI (PL-300)'],
        ['md-102', 'Microsoft MD-102'],
        ['aws-ccp', 'AWS Cloud Practitioner'],
        ['aws-saa', 'AWS Solutions Architect Associate'],
        ['aws-dva', 'AWS Developer Associate'],
        ['aws-soa', 'AWS SysOps Associate'],
        ['aws-scs', 'AWS Security Specialty'],
        ['aws-sap', 'AWS Solutions Architect Pro'],
        ['aws-ans', 'AWS Networking Specialty'],
        ['aws-mls', 'AWS ML Specialty'],
        ['aws-dop', 'AWS DevOps Pro'],
        ['gcp-ace', 'Google Cloud Associate'],
        ['gcp-pca', 'Google Cloud Architect'],
        ['gcp-pcse', 'Google Cloud Security Engineer'],
        ['gcp-pde', 'Google Cloud Data Engineer'],
        ['gcp-pcde', 'Google Cloud DevOps Engineer'],
        ['ccna', 'Cisco CCNA'],
        ['ccnp', 'Cisco CCNP'],
        ['oscp', 'OffSec OSCP'],
        ['ceh', 'EC-Council CEH'],
        ['cissp', 'ISC2 CISSP'],
        ['ccsp', 'ISC2 CCSP'],
        ['sscp', 'ISC2 SSCP'],
        ['itil', 'ITIL 4 Foundation'],
        ['pmp', 'PMP'],
        ['capm', 'CAPM'],
    ];

    for (const [pattern, label] of certPatterns) {
        if (id.includes(pattern) || title.includes(pattern) || tags.includes(pattern)) {
            return { signal: 'cert', pattern, label };
        }
    }

    // Course / curriculum prefixes (heuristic from observed naming)
    const coursePatterns = [
        ['sp-w', 'Snake Pit (Python Programming)'],
        ['cb-w', 'Cloud Base (Cloud Essentials)'],
        ['ra-w', 'Linux Ascent (Linux Essentials)'],
        ['fl-w', 'First Link (Intro Networks)'],
        ['fw-w', 'First Watch (Intro Security)'],
        ['cr-w', 'Cyber Range'],
        ['bm-w', 'Bare Metal (Hardware Support)'],
        ['sr-w', 'Server Room'],
        // cse- is overloaded: divergent uses it for CIS2253 Cybersecurity Ethics,
        // cloud + shield use it for EC-Council Cloud Security Engineer cert.
        // Disambiguate by title: titles starting "CSE:" or "CSE Module" are CSE cert;
        // anything else (Cyberethics, Cybercrime, NIST CSF) is CIS2253.
        // (No house-conditional — that would compensate for catalog data, not classify it.)
        ['eth-', 'CIS4253 Ethics in IT'],
        ['csp-', 'CIS2208 Cybersecurity Policy'],
        ['feh-', 'Dark Arts Feh'],
        ['clh-', 'CLH Terminal'],
        ['df-', 'Digital Forensics'],
        ['eye-cysa', 'CySA+ Eye House Track'],
        ['eye-wireshark', 'Wireshark (Eye)'],
        ['shield-', 'Shield (Security)'],
        ['matrix-', 'The Matrix'],
        ['operator-', 'Operator Missions'],
        ['piverse-', 'Piverse (Matrix)'],
        ['protocore-', 'Protocore (Matrix)'],
        ['adv-linux-', 'Advanced Linux (Matrix)'],
    ];

    for (const [prefix, label] of coursePatterns) {
        if (id.startsWith(prefix) || id.includes('-' + prefix)) {
            return { signal: 'course', pattern: prefix, label };
        }
    }

    // cse- disambiguation (title-based, not house-based)
    if (id.startsWith('cse-') || id.includes('-cse-')) {
        if (/^cse:|^cse module/.test(title)) {
            return { signal: 'cert', pattern: 'cse-cert', label: 'EC-Council Cloud Security Engineer (CSE)' };
        }
        return { signal: 'course', pattern: 'cse-ethics', label: 'CIS2253 Cybersecurity Ethics' };
    }

    // Topic signals (broader)
    const topicPatterns = [
        ['python', 'Python Programming'],
        ['linux', 'Linux'],
        ['network', 'Networking'],
        ['forensic', 'Digital Forensics'],
        ['firewall', 'Firewalls'],
        ['malware', 'Malware Analysis'],
        ['incident', 'Incident Response'],
        ['cloud', 'Cloud'],
        ['azure', 'Azure'],
        ['aws', 'AWS'],
        ['kubernetes', 'Kubernetes'],
        ['docker', 'Docker / Containers'],
        ['sql', 'SQL / Databases'],
        ['javascript', 'JavaScript'],
        ['html', 'Web (HTML/CSS)'],
        ['crypt', 'Cryptography'],
        ['osint', 'OSINT'],
        ['recon', 'Reconnaissance'],
    ];

    for (const [keyword, label] of topicPatterns) {
        if (title.includes(keyword) || tags.includes(keyword) || desc.includes(keyword)) {
            return { signal: 'topic', pattern: keyword, label };
        }
    }

    return null;
}

function main() {
    const w1 = loadJSContext(CATALOG_PATH);
    const catalog = w1.ContentCatalog;
    const w2 = loadJSContext(LEARNING_PATHS_PATH);
    const learningPaths = w2.LearningPaths;

    if (!catalog || !Array.isArray(catalog.MODULES)) {
        console.error('ContentCatalog load failed'); process.exit(1);
    }

    // ── HUB SIGNAL #1: data-module attrs across all index.html ──
    const hubCardIds = new Set();  // module ids referenced by ANY data-module
    const hubCardSources = new Map();  // module id -> [hub paths]
    const allDirs = [];
    for (const houseId of Object.keys(catalog.HOUSES || {})) {
        const basePath = catalog.HOUSES[houseId].basePath || `houses/${houseId}/`;
        allDirs.push(path.resolve(ROOT_APP, basePath));
    }
    allDirs.push(path.resolve(ROOT_APP, 'houses'));
    // Top-level hub locations outside houses/ (signal, arctic, arena, dark-arts/vault, etc.)
    // — walk these too so their inline-script ids count toward Mech 4.
    for (const topDir of ['signal', 'arctic', 'arena', 'wireshark', 'dark-arts']) {
        const p = path.resolve(ROOT_APP, topDir);
        if (fs.existsSync(p)) allDirs.push(p);
    }
    const seen = new Set();
    const indexFiles = [];
    for (const d of allDirs) {
        for (const f of findIndexFiles(d)) {
            if (!seen.has(f)) { seen.add(f); indexFiles.push(f); }
        }
    }

    const DM_RE = /data-module\s*=\s*["']([^"']+)["']/g;
    for (const file of indexFiles) {
        const html = fs.readFileSync(file, 'utf8');
        let m;
        DM_RE.lastIndex = 0;
        while ((m = DM_RE.exec(html)) !== null) {
            hubCardIds.add(m[1]);
            if (!hubCardSources.has(m[1])) hubCardSources.set(m[1], []);
            hubCardSources.get(m[1]).push(relPath(file));
        }
    }

    // ── HUB SIGNAL #2: LearningPaths.PATHS modules ──
    const lpIds = new Set();
    const lpSources = new Map();
    for (const [pathName, pathObj] of Object.entries(learningPaths.PATHS || {})) {
        for (const mod of pathObj.modules || []) {
            const id = mod.id || mod;
            if (typeof id === 'string') {
                lpIds.add(id);
                if (!lpSources.has(id)) lpSources.set(id, []);
                lpSources.get(id).push(pathName);
            }
        }
    }

    // ── HUB SIGNAL #3: dedicated *Data.js loaded by *Engine hubs ──
    // Walk index.html looking for <script src="*Data.js"> AND a *Engine.renderHub() call.
    // For matching files, scan the Data file for `id: 'X'` patterns.
    const engineIds = new Set();
    const engineSources = new Map();
    const DATA_SCRIPT_RE = /<script[^>]+src\s*=\s*["']([^"']+Data\.js)["']/g;
    const ENGINE_CALL_RE = /([A-Z][A-Za-z]+)Engine\s*\.\s*(?:renderHub|renderCertHub|render)\s*\(/g;
    for (const file of indexFiles) {
        const html = fs.readFileSync(file, 'utf8');
        if (!ENGINE_CALL_RE.test(html)) continue;  // not a curated engine hub
        ENGINE_CALL_RE.lastIndex = 0;
        DATA_SCRIPT_RE.lastIndex = 0;
        let dm;
        while ((dm = DATA_SCRIPT_RE.exec(html)) !== null) {
            const dataPath = path.normalize(path.join(path.dirname(file), dm[1]));
            if (!fs.existsSync(dataPath)) continue;
            const dataContent = fs.readFileSync(dataPath, 'utf8');
            const idRe = /\bid\s*:\s*["']([a-zA-Z0-9_-]+)["']/g;
            let im;
            while ((im = idRe.exec(dataContent)) !== null) {
                engineIds.add(im[1]);
                if (!engineSources.has(im[1])) engineSources.set(im[1], []);
                engineSources.get(im[1]).push(relPath(file));
            }
        }
    }

    // ── HUB SIGNAL #4: inline JS module-id strings in verified hub indices ──
    // Many hubs (CLH, Feh, cortex, code/algorithms, etc.) inline their module
    // list as a JS array in <script> rather than data-module attrs. Detect by:
    //   (a) gating to "verified hub" files: has a renderer-call signature OR
    //       already known to have data-module attrs (mech 1).
    //   (b) extracting <script> content from those files only.
    //   (c) collecting quoted slug-like string literals.
    //   (d) marking a catalog id in-hub if its literal id (or stripped form)
    //       appears in that quoted-string set.
    // The hub-gate prevents contamination from leaf content pages.
    const HUB_SIGNATURE_RE = /HouseRenderer|CertPathRenderer|LearningPathRenderer|ContentCatalog\.getHouseModules|renderModules|renderTracks|renderHub|PathRenderer\.init|MODULES\s*=\s*\[\s*[{['"]|MODULE_IDS\s*=\s*\[\s*[{['"]/;
    const SCRIPT_BLOCK_RE = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
    const QUOTED_SLUG_RE = /['"]([a-zA-Z0-9][a-zA-Z0-9_-]{2,})['"]/g;
    const inlineIds = new Set();
    const inlineSources = new Map();
    for (const file of indexFiles) {
        const html = fs.readFileSync(file, 'utf8');
        const isHub = HUB_SIGNATURE_RE.test(html) || hubCardSources && Array.from(hubCardSources.values()).some(arr => arr.includes(relPath(file)));
        if (!isHub) continue;
        SCRIPT_BLOCK_RE.lastIndex = 0;
        let sm;
        while ((sm = SCRIPT_BLOCK_RE.exec(html)) !== null) {
            const scriptText = sm[1];
            QUOTED_SLUG_RE.lastIndex = 0;
            let qm;
            while ((qm = QUOTED_SLUG_RE.exec(scriptText)) !== null) {
                const slug = qm[1];
                inlineIds.add(slug);
                if (!inlineSources.has(slug)) inlineSources.set(slug, []);
                if (!inlineSources.get(slug).includes(relPath(file))) {
                    inlineSources.get(slug).push(relPath(file));
                }
            }
        }
    }

    // ── For each catalog module, classify ──
    const catalogById = new Map();
    catalog.MODULES.forEach(m => { if (m.id) catalogById.set(m.id, m); });

    const orphans = [];  // catalog modules NOT in any hub by strict definition
    const inHub = [];

    for (const m of catalog.MODULES) {
        if (!m.id) continue;
        const id = m.id;
        const house = m.house || '?';
        const stripped = (house !== '?' && id.startsWith(house + '-')) ? id.slice(house.length + 1) : null;

        // Also tolerate `.module` suffix on catalog ids (CAT-002 deriveModuleId artifact).
        // Open STR-28 to clean these up at the catalog level — until then strip in matching.
        const desuffixed = id.endsWith('.module') ? id.slice(0, -'.module'.length) : null;
        const strippedDesuffixed = stripped && stripped.endsWith('.module') ? stripped.slice(0, -'.module'.length) : null;
        const inMech1 = hubCardIds.has(id) || (stripped && hubCardIds.has(stripped)) || (desuffixed && hubCardIds.has(desuffixed)) || (strippedDesuffixed && hubCardIds.has(strippedDesuffixed));
        const inMech2 = lpIds.has(id) || (stripped && lpIds.has(stripped)) || (desuffixed && lpIds.has(desuffixed)) || (strippedDesuffixed && lpIds.has(strippedDesuffixed));
        const inMech3 = engineIds.has(id) || (stripped && engineIds.has(stripped)) || (desuffixed && engineIds.has(desuffixed)) || (strippedDesuffixed && engineIds.has(strippedDesuffixed));
        const inMech4 = inlineIds.has(id) || (stripped && inlineIds.has(stripped)) || (desuffixed && inlineIds.has(desuffixed)) || (strippedDesuffixed && inlineIds.has(strippedDesuffixed));
        const isInHub = inMech1 || inMech2 || inMech3 || inMech4;

        const record = {
            id, house,
            title: m.title || '',
            description: m.description || '',
            href: m.href || '',
            status: m.status || '',
            category: m.category || '',
            tags: m.tags || [],
            autoGenerated: (m.icon === '/assets/images/icons/icon-folder.webp' && m.category === 'general'),
            inHub: isInHub,
            mech: { hubCard: inMech1, learningPath: inMech2, dedicatedEngine: inMech3, inlineHubScript: inMech4 },
            cluster: detectCluster(m),
        };
        if (isInHub) inHub.push(record); else orphans.push(record);
    }

    // ── Group orphans by house ──
    const byHouse = {};
    for (const o of orphans) {
        if (!byHouse[o.house]) byHouse[o.house] = { total: 0, autoGenerated: 0, curated: 0, byCluster: {}, items: [] };
        const h = byHouse[o.house];
        h.total++;
        if (o.autoGenerated) h.autoGenerated++; else h.curated++;
        h.items.push(o);
        const ck = o.cluster ? `${o.cluster.signal}:${o.cluster.label}` : 'unclassified';
        if (!h.byCluster[ck]) h.byCluster[ck] = { count: 0, label: o.cluster ? o.cluster.label : '(no curriculum signal detected)', signal: o.cluster ? o.cluster.signal : 'unknown', sample: [] };
        h.byCluster[ck].count++;
        if (h.byCluster[ck].sample.length < 3) h.byCluster[ck].sample.push({ id: o.id, title: o.title });
    }

    const report = {
        generated: new Date().toISOString(),
        definition: 'orphan = catalog module NOT referenced via data-module, LearningPaths, or dedicated-engine *Data.js',
        rootPath: ROOT_APP,
        summary: {
            catalogTotal: catalog.MODULES.length,
            inHub: inHub.length,
            orphans: orphans.length,
            orphanPctOfCatalog: Math.round(100 * orphans.length / catalog.MODULES.length),
            orphansAutoGenerated: orphans.filter(o => o.autoGenerated).length,
            orphansCurated: orphans.filter(o => !o.autoGenerated).length,
            mechanism1_hubCardModules: hubCardIds.size,
            mechanism2_learningPathModules: lpIds.size,
            mechanism3_engineModules: engineIds.size,
            mechanism4_inlineHubScriptIds: inlineIds.size,
        },
        byHouse,
    };

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(report, null, 2));

    // ── stdout summary ──
    const s = report.summary;
    console.log('');
    console.log('  Strict Orphan Scanner — definition v2 (in-hub = curated curriculum only)');
    console.log('');
    console.log('    Catalog total:           ' + s.catalogTotal);
    console.log('    IN-HUB:                  ' + s.inHub + '  (' + Math.round(100 * s.inHub / s.catalogTotal) + '%)');
    console.log('    ORPHANS:                 ' + s.orphans + '  (' + s.orphanPctOfCatalog + '%)');
    console.log('      auto-generated:        ' + s.orphansAutoGenerated);
    console.log('      curated:               ' + s.orphansCurated);
    console.log('');
    console.log('    Hub signal coverage:');
    console.log('      data-module refs:      ' + s.mechanism1_hubCardModules + ' unique modules');
    console.log('      LearningPath refs:     ' + s.mechanism2_learningPathModules + ' unique modules');
    console.log('      Dedicated-engine refs: ' + s.mechanism3_engineModules + ' unique modules');
    console.log('      Inline-hub script ids: ' + s.mechanism4_inlineHubScriptIds + ' unique slugs (filtered by catalog)');
    console.log('');
    console.log('  Per-house orphan map:');
    console.log('    ' + 'house'.padEnd(15) + 'orph'.padStart(6) + 'auto'.padStart(6) + 'curated'.padStart(8) + '  top clusters');
    for (const h of Object.keys(byHouse).sort()) {
        const data = byHouse[h];
        const topClusters = Object.entries(data.byCluster)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 3)
            .map(([k, v]) => `${v.label.slice(0, 20)} (${v.count})`)
            .join(', ');
        console.log('    ' + h.padEnd(15)
            + String(data.total).padStart(6)
            + String(data.autoGenerated).padStart(6)
            + String(data.curated).padStart(8)
            + '  ' + topClusters);
    }
    console.log('');
    console.log('  Full report: ' + path.relative(process.cwd(), OUTPUT_PATH));
}

main();
