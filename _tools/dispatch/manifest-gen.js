#!/usr/bin/env node
/**
 * Dispatch Hub Manifest Generator
 *
 * Walks `_app/dispatch/boxes/*\/config.js`, extracts metadata, and
 * writes `_app/dispatch/boxes.json`. The dispatch hub
 * (`_app/dispatch/index.html`) renders this manifest at page load
 * into `<a class="dispatch-card">` elements.
 *
 * Per-box metadata extracted from config.js:
 *   - title
 *   - subtitle
 *   - difficulty            ('Beginner'|'Intermediate'|'Advanced'|'Expert')
 *   - accent                (hex color)
 *   - registryId
 *   - scoring.maxScore
 *   - _scenarios.length     (scenario count for the "N Scenarios" tag)
 *
 * Per-box metadata derived from the box dirname:
 *   - family prefix         (vpn, srv, sec, hw, ad, etc.)
 *   - category              (mapped from family — see FAMILY_CATEGORY)
 *   - ticketId              (e.g., "VPN-001" from "vpn001-tunnel-down")
 *
 * Per-box hand-curated overrides (RICH_OVERRIDES):
 *   The original 5 hardcoded cards in dispatch/index.html had bespoke
 *   descriptions and cert-objective tags that aren't in config.js. We
 *   preserve them here so the generated manifest never loses that
 *   curation. New boxes get a generic fallback description until
 *   somebody hand-curates them.
 *
 * Read-only against configs; writes _app/dispatch/boxes.json.
 *
 * Usage:
 *   node _tools/dispatch/manifest-gen.js          # write manifest
 *   node _tools/dispatch/manifest-gen.js --check  # verify-only, exit 1 if drift
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const DISPATCH_DIR = path.join(ROOT, '_app/dispatch/boxes');
const OUT_FILE = path.join(ROOT, '_app/dispatch/boxes.json');
const OUT_FILE_JS = path.join(ROOT, '_app/dispatch/boxes-manifest.js');

const CHECK_ONLY = process.argv.includes('--check');

// Family prefix → category bucket. Categories drive the filter buttons.
const FAMILY_CATEGORY = {
    ad:    'security',
    cld:   'infrastructure',
    dns:   'network',
    em:    'email',
    hw:    'hardware',
    iot:   'iot',
    mail:  'email',
    mob:   'mobile',
    nt:    'network',
    os:    'os',
    perf:  'network',
    pr:    'hardware',
    sec:   'security',
    srv:   'infrastructure',
    vpn:   'network'
};

const CATEGORY_LABEL = {
    network: 'Network',
    os: 'Operating System',
    hardware: 'Hardware',
    security: 'Security',
    iot: 'IoT',
    infrastructure: 'Infrastructure',
    email: 'Email',
    mobile: 'Mobile'
};

// Difficulty → display info
const DIFFICULTY_META = {
    'Beginner':     { pips: 2, severity: 'medium' },
    'Easy':         { pips: 2, severity: 'medium' },
    'Intermediate': { pips: 3, severity: 'high' },
    'Normal':       { pips: 3, severity: 'high' },
    'Advanced':     { pips: 4, severity: 'critical' },
    'Hard':         { pips: 4, severity: 'critical' },
    'Expert':       { pips: 4, severity: 'critical' }
};

// Hand-curated descriptions + tags for boxes that had rich cards
// pre-generator. New boxes can be added here over time.
const RICH_OVERRIDES = {
    'nt1-network-troubleshoot': {
        description: "A user can't access the internet. Boot into their Windows workstation, read the help desk ticket, diagnose the root cause, and restore full connectivity. Five distinct scenarios — each requires different tools and hides the flag in a different location.",
        tags: ['MD-100 Obj 5.1', 'MD-100 Obj 5.2', 'MD-100 Obj 3.1', '5 Scenarios', 'BoxEngine'],
        time: '~20 min',
        points: 500,
        difficulty: 'Intermediate'
    },
    'os001-boot-failure': {
        description: "A workstation won't boot past the Windows logo. Use recovery tools, Safe Mode, and system repair to diagnose driver conflicts, corrupted boot records, or failed updates.",
        tags: ['MD-100 Obj 4.1', 'WinRE', 'BoxEngine'],
        time: '~25 min',
        points: 500,
        difficulty: 'Advanced'
    },
    'hw001-dead-workstation': {
        description: "A machine powers on but shows no display. Check POST codes, reseat components, swap cables, and interpret beep codes to identify the failing hardware component.",
        tags: ['A+ Core 1 Obj 5.2', 'POST Codes', 'BoxEngine'],
        time: '~20 min',
        points: 500,
        difficulty: 'Intermediate'
    },
    'ad001-lockout-storm': {
        description: "Multiple users are getting locked out of Active Directory. Investigate Group Policy, check authentication logs, trace the source of bad password attempts, and restore access without compromising security.",
        tags: ['MD-100 Obj 4.5', 'Active Directory', 'Blue Team', '5 Scenarios', 'BoxEngine'],
        time: '~30 min',
        points: 750,
        difficulty: 'Expert'
    },
    'pr001-printer-nightmare': {
        description: "Print jobs are stuck or printers won't respond. Restart the spooler service, clear queues, reinstall drivers, and resolve connectivity issues across local and network printers.",
        tags: ['MD-100 Obj 4.4', 'Print Spooler', 'BoxEngine'],
        time: '~20 min',
        points: 500,
        difficulty: 'Beginner'
    }
};

function deriveTicketId(dirname) {
    // "vpn001-tunnel-down" → "VPN-001"
    // "nt1-network-troubleshoot" → "NT-001"
    const m = dirname.match(/^([a-z]+)(\d+)/);
    if (!m) return dirname.toUpperCase();
    const family = m[1].toUpperCase();
    const num = m[2].padStart(3, '0');
    return `${family}-${num}`;
}

function deriveFamily(dirname) {
    const m = dirname.match(/^([a-z]+)\d*/);
    return m ? m[1] : 'misc';
}

function extractField(content, key) {
    /* Respects ESCAPED quotes. The old pattern was [^'"]+, which stops at the first quote
       character of any kind -- including a \' inside the string -- so
       `title: 'Boot Failure: It Won\'t Start'` was captured as "Boot Failure: It Won\".
       Seven boxes shipped truncated titles into boxes.json this way, and the dispatch board
       rendered them to students: "Can\" instead of "Can't Send Email".

       The body now matches either an escape sequence or any character that is not a backslash
       and not the opening quote, then the captured text is unescaped. Backreference \1 pins the
       closing quote to the same kind that opened it, so an apostrophe inside a double-quoted
       string is not treated as a terminator. */
    const re = new RegExp(key + '\\s*:\\s*([\'"])((?:\\\\.|(?!\\1)[^\\\\])*)\\1');
    const m = content.match(re);
    if (!m) return null;
    // Unescape what the source escaped: \' \" and \\ are the forms that actually appear here.
    return m[2].replace(/\\(['"\\])/g, '$1');
}

function extractMaxScore(content) {
    const m = content.match(/scoring\s*:\s*\{[^}]*?maxScore\s*:\s*(\d+)/s);
    return m ? parseInt(m[1], 10) : null;
}

function extractScenarioCount(content) {
    const m = content.match(/_scenarios\s*:\s*\[/);
    if (!m) return 0;
    // Count top-level `{ id:` entries inside the scenarios array
    let depth = 0;
    let inStr = null;
    let escape = false;
    let count = 0;
    let topLevelInsideArray = false;
    for (let i = m.index + m[0].length - 1; i < content.length; i++) {
        const c = content[i];
        if (escape) { escape = false; continue; }
        if (c === '\\') { escape = true; continue; }
        if (inStr) { if (c === inStr) inStr = null; continue; }
        if (c === "'" || c === '"' || c === '`') { inStr = c; continue; }
        if (c === '[') depth++;
        else if (c === ']') { depth--; if (depth === 0) break; }
        else if (c === '{' && depth === 1) {
            // Look-ahead: is this an object literal that contains `id:`?
            const slice = content.slice(i, i + 200);
            if (/^\{\s*[^}]*\bid\s*:/.test(slice)) count++;
        }
    }
    return count;
}

function deriveSeverity(difficulty) {
    return (DIFFICULTY_META[difficulty] || DIFFICULTY_META['Intermediate']).severity;
}

function deriveDifficultyPips(difficulty) {
    return (DIFFICULTY_META[difficulty] || DIFFICULTY_META['Intermediate']).pips;
}

function genericDescription(box) {
    const subtitle = box.subtitle || box.title;
    const count = box.scenarioCount;
    const scenarioText = count ? ` Five-scenario exam-style ticket — each play randomizes the root cause.` : '';
    return `${subtitle}.${scenarioText}`;
}

function genericTags(box) {
    const tags = [];
    if (box.scenarioCount > 1) tags.push(`${box.scenarioCount} Scenarios`);
    tags.push('BoxEngine');
    return tags;
}

function buildManifestEntry(box) {
    const override = RICH_OVERRIDES[box.dirname] || {};
    const difficulty = override.difficulty || box.difficulty || 'Intermediate';
    return {
        dirname: box.dirname,
        href: `/dispatch/boxes/${box.dirname}/index.html`,
        ticketId: deriveTicketId(box.dirname),
        category: FAMILY_CATEGORY[box.family] || 'other',
        categoryLabel: CATEGORY_LABEL[FAMILY_CATEGORY[box.family]] || 'Other',
        title: box.title || box.dirname,
        subtitle: box.subtitle || '',
        description: override.description || genericDescription(box),
        difficulty,
        difficultyPips: deriveDifficultyPips(difficulty),
        severity: deriveSeverity(difficulty),
        time: override.time || (box.scenarioCount > 0 ? `~${15 + box.scenarioCount * 2} min` : '~20 min'),
        points: override.points || box.maxScore || 500,
        tags: override.tags || genericTags(box),
        accent: box.accent || '#7c3aed',
        registryId: box.registryId,
        scenarioCount: box.scenarioCount,
        status: 'Open'
    };
}

function walkDispatchBoxes() {
    let entries;
    try { entries = fs.readdirSync(DISPATCH_DIR, { withFileTypes: true }); }
    catch (e) {
        console.error('FATAL: cannot read ' + DISPATCH_DIR);
        process.exit(99);
    }
    const boxes = [];
    for (const e of entries) {
        if (!e.isDirectory()) continue;
        if (e.name.startsWith('.') || e.name === '_archive') continue;
        const cfgFile = path.join(DISPATCH_DIR, e.name, 'config.js');
        const htmlFile = path.join(DISPATCH_DIR, e.name, 'index.html');
        if (!fs.existsSync(cfgFile) || !fs.existsSync(htmlFile)) continue;
        const html = fs.readFileSync(htmlFile, 'utf8');
        if (!/BoxEngine\.init/.test(html)) continue;
        const cfg = fs.readFileSync(cfgFile, 'utf8');
        boxes.push({
            dirname: e.name,
            family: deriveFamily(e.name),
            title: extractField(cfg, 'title'),
            subtitle: extractField(cfg, 'subtitle'),
            difficulty: extractField(cfg, 'difficulty'),
            accent: extractField(cfg, 'accent'),
            registryId: extractField(cfg, 'registryId'),
            maxScore: extractMaxScore(cfg),
            scenarioCount: extractScenarioCount(cfg)
        });
    }
    return boxes;
}

function main() {
    const startMs = Date.now();
    const boxes = walkDispatchBoxes();
    if (boxes.length === 0) {
        console.error('FATAL: no dispatch boxes found.');
        process.exit(99);
    }

    // Sort: rich-override boxes first (the original 5 stay at top),
    // then alphabetical by family + ticket number.
    boxes.sort((a, b) => {
        const aRich = RICH_OVERRIDES[a.dirname] ? 0 : 1;
        const bRich = RICH_OVERRIDES[b.dirname] ? 0 : 1;
        if (aRich !== bRich) return aRich - bRich;
        return a.dirname.localeCompare(b.dirname);
    });

    const manifest = {
        generatedAt: new Date().toISOString(),
        boxCount: boxes.length,
        categories: [...new Set(boxes.map(b => FAMILY_CATEGORY[b.family] || 'other'))].sort(),
        boxes: boxes.map(buildManifestEntry)
    };

    if (CHECK_ONLY) {
        if (!fs.existsSync(OUT_FILE)) {
            console.error('CHECK FAILED: manifest does not exist at ' + OUT_FILE);
            process.exit(1);
        }
        const existing = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'));
        // Compare box arrays ignoring generatedAt
        const stripped = (m) => ({ boxCount: m.boxCount, categories: m.categories, boxes: m.boxes });
        if (JSON.stringify(stripped(existing)) !== JSON.stringify(stripped(manifest))) {
            console.error('CHECK FAILED: manifest is stale. Run without --check to regenerate.');
            process.exit(1);
        }
        console.log('CHECK PASSED — manifest is up to date.');
        console.log('  Boxes:      ' + boxes.length);
        console.log('  Categories: ' + manifest.categories.join(', '));
        return;
    }

    fs.writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2));

    // Also emit a JS wrapper for synchronous availability via <script src=>.
    // Lets the hub render cards without a fetch + flash-of-empty-content.
    const jsWrapper =
        '/* AUTO-GENERATED by _tools/dispatch/manifest-gen.js — do not hand-edit. */\n' +
        'window.DispatchManifest = ' + JSON.stringify(manifest, null, 2) + ';\n';
    fs.writeFileSync(OUT_FILE_JS, jsWrapper);

    console.log('dispatch manifest-gen');
    console.log('========================================');
    console.log('  Boxes scanned:       ' + boxes.length);
    console.log('  Rich overrides hit:  ' + Object.keys(RICH_OVERRIDES).filter(k => boxes.some(b => b.dirname === k)).length);
    console.log('  Categories:          ' + manifest.categories.join(', '));
    console.log('  Output (JSON):       ' + path.relative(ROOT, OUT_FILE));
    console.log('  Output (JS wrapper): ' + path.relative(ROOT, OUT_FILE_JS));
    console.log('  Duration:            ' + (Date.now() - startMs) + 'ms');
    console.log('---');
    console.log('Per-category breakdown:');
    const byCat = {};
    for (const b of manifest.boxes) {
        byCat[b.category] = (byCat[b.category] || 0) + 1;
    }
    for (const [cat, ct] of Object.entries(byCat).sort()) {
        console.log('  ' + cat.padEnd(16) + ct);
    }
}

main();
