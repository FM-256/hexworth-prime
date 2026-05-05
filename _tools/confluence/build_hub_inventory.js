#!/usr/bin/env node
// Build a fresh "Hexworth Prime — Complete Course & Hub Inventory" page in
// Confluence storage format, walking the live _app/ tree.
//
// Heuristic for Status:
//   ACTIVE   = ≥4 pres AND ≥4 labs AND ≥3 quiz (substantial curriculum)
//   PARTIAL  = some content but not complete (≥1 of pres/labs/quiz)
//   SCAFFOLD = index.html only, zero pres/labs/quiz
//   PLANNED  = no index, no content (rare; fallback)

const fs = require('fs');
const path = require('path');

const APP = '_app';
const HOUSES_DIR = path.join(APP, 'houses');
// Order matches existing page; Divergent + Matrix were added pre-fusion
const HOUSE_ORDER = ['ai','cloud','code','dark-arts','divergent','eye','forge','key','matrix','script','shield','web'];
const HOUSE_TITLES = {
    'ai':'AI (House of the Machine)','cloud':'Cloud','code':'Code',
    'dark-arts':'Dark Arts','divergent':'Divergent','eye':'Eye',
    'forge':'Forge','key':'Key','matrix':'Matrix','script':'Script',
    'shield':'Shield','web':'Web'
};

// Subdirs that aren't course/hub entries (utility folders)
const SKIP_SUBDIR = new Set([
    'assets','images','reference','speaker-notes','tutorials',
    'handouts','docs','guides','tools','games','reviews','exams',
    'applets','labs','presentations','quizzes','modules','simulators',
    'textbook','backbone','vault','challenges','compliance'
]);

function countContent(dir) {
    const out = { pres:0, labs:0, quiz:0, exam:0, hasIndex:false };
    try {
        const walk = (d) => {
            for (const entry of fs.readdirSync(d, {withFileTypes:true})) {
                const full = path.join(d, entry.name);
                if (entry.isDirectory()) walk(full);
                else if (entry.name === 'index.html' && d === dir) out.hasIndex = true;
                else if (entry.name.endsWith('.presentation.html')) out.pres++;
                else if (entry.name.endsWith('.lab.html') || entry.name.endsWith('.module.html')) out.labs++;
                else if (entry.name.endsWith('.quiz.html')) out.quiz++;
                else if (entry.name.endsWith('.exam.html')) out.exam++;
            }
        };
        walk(dir);
    } catch (e) { /* skip */ }
    return out;
}

function classify(c) {
    if (c.pres >= 4 && c.labs >= 4 && c.quiz >= 3) return 'ACTIVE';
    if (c.pres + c.labs + c.quiz + c.exam > 0) return 'PARTIAL';
    if (c.hasIndex) return 'SCAFFOLD';
    return 'PLANNED';
}

const STATUS_COLOR = { ACTIVE:'Green', PARTIAL:'Yellow', SCAFFOLD:'Blue', PLANNED:'Grey' };

let macroIdCounter = 0;
function statusMacro(label) {
    const color = STATUS_COLOR[label] || 'Grey';
    return `<ac:structured-macro ac:name="status" ac:schema-version="1" ac:macro-id="auto-${++macroIdCounter}"><ac:parameter ac:name="colour">${color}</ac:parameter><ac:parameter ac:name="title">${label}</ac:parameter></ac:structured-macro>`;
}

// Build per-house data
const houseData = {};
const totals = { ACTIVE:0, PARTIAL:0, SCAFFOLD:0, PLANNED:0 };

for (const house of HOUSE_ORDER) {
    const hdir = path.join(HOUSES_DIR, house);
    if (!fs.existsSync(hdir)) continue;
    const entries = [];
    const sharedCounts = { pres:0, labs:0, quiz:0, exam:0, hasIndex:true };
    let sharedFolders = [];

    for (const entry of fs.readdirSync(hdir, {withFileTypes:true})) {
        if (!entry.isDirectory()) continue;
        if (entry.name.startsWith('_')) continue;
        const d = path.join(hdir, entry.name);

        if (SKIP_SUBDIR.has(entry.name)) {
            // Shared content folder (e.g., key/labs/, key/presentations/) —
            // aggregate into "House Library" row at end.
            const c = countContent(d);
            sharedCounts.pres += c.pres;
            sharedCounts.labs += c.labs;
            sharedCounts.quiz += c.quiz;
            sharedCounts.exam += c.exam;
            if (c.pres + c.labs + c.quiz + c.exam > 0) sharedFolders.push(entry.name);
            continue;
        }

        const counts = countContent(d);
        const status = classify(counts);
        entries.push({
            name: entry.name,
            displayName: prettyName(entry.name),
            pathRel: path.relative(APP, d).replace(/\\/g,'/'),
            counts, status
        });
        totals[status]++;
    }
    entries.sort((a,b) => a.name.localeCompare(b.name));

    // Append House Library row if shared folders had content
    if (sharedCounts.pres + sharedCounts.labs + sharedCounts.quiz + sharedCounts.exam > 0) {
        const status = classify(sharedCounts);
        entries.push({
            name: '__shared__',
            displayName: `House Library (shared: ${sharedFolders.join(', ')})`,
            pathRel: `houses/${house}/{${sharedFolders.join(',')}}`,
            counts: sharedCounts,
            status
        });
        totals[status]++;
    }

    houseData[house] = entries;
}

function prettyName(slug) {
    // Light prettification — title-case-ish, keep cert names uppercase
    if (/^(ai|az|ms|sc|pl|cysa|ccna|md)-?\d+/i.test(slug)) {
        return slug.toUpperCase().replace(/-/g, ' ').replace(/(\d+)/, ' $1').trim().replace(/\s+/g,' ');
    }
    return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Standalone hubs (top-level outside houses/)
const STANDALONE = [
    { name:'Arena', path:'arena', desc:'CTF arena with scored boxes' },
    { name:'Operator', path:'operator', desc:'Admin/staff dashboard' },
    { name:'Hive', path:'hive', desc:'Community / collaboration surface' },
    { name:'Dispatch', path:'dispatch', desc:'Mission/task routing' },
    { name:'Signal', path:'signal', desc:'Operations + status surface' },
    { name:'Forensics', path:'houses/eye/forensics', desc:'Digital forensics labs (relocated 2026-05-04 from /forensics/ → /houses/eye/forensics/, legacy path 301-redirects)' },
    { name:'Wireshark Trainer', path:'houses/eye/tools/eye-wireshark.tool.html', desc:'Standalone packet-analysis trainer' }
];

// Build the storage-format content
let html = '';

// Top info box
html += '<ac:structured-macro ac:name="info" ac:schema-version="1" ac:macro-id="auto-info-1"><ac:rich-text-body>';
html += '<p><strong>Hexworth Prime — Course &amp; Hub Inventory</strong><br/>';
html += 'Last updated: <strong>2026-05-05</strong> (regenerated post-Stragglers-fusion via filesystem walk)</p>';
html += '<table><tbody>';
html += '<tr><th>Metric</th><th>Count</th></tr>';
const totalEntries = Object.values(houseData).reduce((s,a)=>s+a.length,0);
html += `<tr><td>Houses Active</td><td>${HOUSE_ORDER.length} (${HOUSE_ORDER.map(h=>HOUSE_TITLES[h]).join(', ')})</td></tr>`;
html += `<tr><td>Active Courses/Hubs</td><td>${totals.ACTIVE}</td></tr>`;
html += `<tr><td>Partial Courses/Hubs</td><td>${totals.PARTIAL}</td></tr>`;
html += `<tr><td>Scaffold Courses/Hubs</td><td>${totals.SCAFFOLD}</td></tr>`;
html += `<tr><td>Total Course/Hub Entries</td><td>${totalEntries}</td></tr>`;
html += `<tr><td>Standalone Hubs</td><td>${STANDALONE.map(s=>s.name).join(', ')}</td></tr>`;
html += '</tbody></table>';
html += '<p><em>Status heuristic: ACTIVE = ≥4 pres AND ≥4 labs AND ≥3 quiz; PARTIAL = some content; SCAFFOLD = index page only; PLANNED = no index. Classifications are mechanical (filesystem walk) — manual override appropriate where pedagogical intent differs from raw counts.</em></p>';
html += '</ac:rich-text-body></ac:structured-macro>';

// Phase 3 fusion delta callout
html += '<ac:structured-macro ac:name="note" ac:schema-version="1" ac:macro-id="auto-note-1"><ac:rich-text-body>';
html += '<p><strong>Post-Stragglers-fusion delta (2026-05-04)</strong> — content added in this revision:</p>';
html += '<ul>';
html += '<li><strong>8 incubator hubs</strong> — one per house (cloud, code, dark-arts, eye, forge, script, shield, web). Holding areas for content awaiting permanent placement. Path: <code>/houses/&lt;house&gt;/incubator/</code></li>';
html += '<li><strong>Forensics relocation</strong> — moved from <code>/forensics/</code> to <code>/houses/eye/forensics/</code>. Legacy path 301-redirects via firebase.json.</li>';
html += '<li><strong>3 new curriculum hubs</strong> — Database Fundamentals at <code>houses/script/modules/databases/</code>, CMMC at <code>houses/shield/compliance/cmmc/</code>, grep-pipe-mastery at <code>houses/script/courses/grep-pipe-mastery/</code></li>';
html += '<li><strong>Forensics dual-path</strong> — note that <code>_app/forensics/</code> still exists as a legacy entry point alongside the new canonical home; firebase redirects handle visitor routing</li>';
html += '</ul>';
html += '</ac:rich-text-body></ac:structured-macro>';

// Per-house tables
for (const house of HOUSE_ORDER) {
    const entries = houseData[house];
    if (!entries) continue;
    html += `<h2>House: ${HOUSE_TITLES[house]}</h2>`;
    html += '<table><tbody>';
    html += '<tr><th>Course/Hub</th><th>Path</th><th>Pres</th><th>Labs</th><th>Quiz</th><th>Exams</th><th>Status</th></tr>';
    for (const e of entries) {
        html += `<tr><td>${e.displayName}</td><td><code>${e.pathRel}</code></td><td>${e.counts.pres}</td><td>${e.counts.labs}</td><td>${e.counts.quiz}</td><td>${e.counts.exam}</td><td>${statusMacro(e.status)}</td></tr>`;
    }
    html += '</tbody></table>';
}

// Standalone Hubs section
html += '<h2>Standalone Hubs</h2>';
html += '<p>Surfaces that are NOT scoped to a single house — they sit at the platform top level or span houses.</p>';
html += '<table><tbody>';
html += '<tr><th>Hub</th><th>Path</th><th>Description</th></tr>';
for (const s of STANDALONE) {
    html += `<tr><td>${s.name}</td><td><code>${s.path}</code></td><td>${s.desc}</td></tr>`;
}
html += '</tbody></table>';

// Status legend
html += '<h2>Status Legend</h2>';
html += '<table><tbody>';
html += '<tr><th>Badge</th><th>Meaning</th></tr>';
html += `<tr><td>${statusMacro('ACTIVE')}</td><td>Substantial curriculum present (≥4 pres + ≥4 labs + ≥3 quiz)</td></tr>`;
html += `<tr><td>${statusMacro('PARTIAL')}</td><td>Some content present but not a complete curriculum</td></tr>`;
html += `<tr><td>${statusMacro('SCAFFOLD')}</td><td>Hub index page exists, no curriculum content yet</td></tr>`;
html += `<tr><td>${statusMacro('PLANNED')}</td><td>No index, no content — directory exists but empty</td></tr>`;
html += '</tbody></table>';

// Footer
html += '<hr/><p><em>Source of truth: <code>_app/houses/&lt;house&gt;/&lt;course&gt;/</code> filesystem walk on master HEAD at the timestamp above. Regenerate by running the script in the corresponding sprint item or re-walking the tree manually.</em></p>';

// Write to file for the curl push
fs.writeFileSync('/tmp/inv_new_storage.html', html);

// Also a short summary for human inspection
console.log('Per-house entry counts:');
for (const h of HOUSE_ORDER) {
    if (houseData[h]) console.log(`  ${h.padEnd(10)} ${houseData[h].length} entries`);
}
console.log('');
console.log('Status totals:', JSON.stringify(totals));
console.log('Total content size:', html.length, 'chars');
console.log('Output written to /tmp/inv_new_storage.html');
