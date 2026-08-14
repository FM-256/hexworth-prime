#!/usr/bin/env node
/*
 * @catalog what    Fails if any course hub links a module file that does not exist on disk.
 * @catalog run     node _tools/qa/hub-href-integrity-test.js
 * @catalog status  GATE
 *
 * WHY (BUG-115). The Digital Forensics hub linked TWELVE modules that do not exist — it asked
 * for `df-05-cfaa-laws.module.html` while the file on disk is `df-05-cfaa-federal-laws.module.html`,
 * and eleven more of the same shape. Confirmed 404 on production, not just locally.
 *
 * ⚠ THE IDS MATCHED THE WHOLE TIME, WHICH IS WHY NOTHING CAUGHT IT. Progress recorded correctly
 * and the hub counted correctly; only the FILENAMES drifted. Every id-based check on the platform
 * passed while a quarter of the course was unreachable. That is the third instance today of two
 * enumerations of one course disagreeing — BUG-107 (hub 12 / path 7), the `ws-pa-01` vs `ws-07`
 * split in BUG-099, and this. The family is always the same: two lists, neither derived from the
 * other, and a checker that only ever compares one of them to itself.
 *
 * ⚠ IT WAS ALSO INVISIBLE UNTIL SOMETHING ELSE WAS FIXED. That hub showed 0% progress forever and
 * was largely inert, so nobody followed its links. Fixing BUG-099 made it functional, which made
 * twelve dead links the next thing a student would meet. Fixing one defect promotes the next.
 *
 * It reads each hub's OWN data file for the hrefs it declares, then stats them. No page needs to
 * render and no id is trusted: a link either resolves to a file or it does not.
 */
'use strict';
const fs = require('fs'), path = require('path');
const APP = path.resolve(__dirname, '../../_app');

/* Hubs that declare their modules in a data file, with the directory their hrefs are relative to.
   Add a hub here when it gains one; a hub NOT listed is simply unchecked, which the summary says
   out loud rather than implying full coverage. */
const HUBS = [
    { name: 'Digital Forensics', data: 'houses/eye/forensics/ForensicsData.js', rel: 'houses/eye/forensics' },
    { name: 'Wireshark',         data: 'wireshark/WiresharkData.js',            rel: 'wireshark' },
];

let pass = 0, fail = 0;
const ck = (n, c, d) => { c ? pass++ : fail++; console.log(`  ${c ? 'PASS' : 'FAIL'}  ${n}${c ? '' : '  -> ' + d}`); };

for (const hub of HUBS) {
    const dataPath = path.join(APP, hub.data);
    if (!fs.existsSync(dataPath)) { ck(`${hub.name}: data file exists`, false, hub.data); continue; }
    const src = fs.readFileSync(dataPath, 'utf8');
    const hrefs = [...src.matchAll(/href:\s*'([^']+)'/g)].map(m => m[1]);
    const dead = hrefs.filter(h => !fs.existsSync(path.join(APP, hub.rel, h)));
    ck(`${hub.name}: declares modules at all`, hrefs.length > 0, `${hrefs.length} hrefs`);
    ck(`${hub.name}: all ${hrefs.length} hrefs resolve to a file`, dead.length === 0,
       `${dead.length} dead: ${dead.slice(0, 4).join(', ')}${dead.length > 4 ? ' …' : ''}`);

    /* THE OTHER DIRECTION, which is how df-61 was found: a module that exists, records progress,
       and no hub lists. Unreachable content is a quieter failure than a dead link and nothing
       else looks for it. Reported, not failed — an unlisted module may be deliberate. */
    const linked = new Set(hrefs.map(h => path.basename(h)));
    const onDisk = [];
    const secDir = path.join(APP, hub.rel, 'sections');
    if (fs.existsSync(secDir)) {
        for (const d of fs.readdirSync(secDir)) {
            const full = path.join(secDir, d);
            if (!fs.statSync(full).isDirectory()) continue;
            for (const f of fs.readdirSync(full)) if (f.endsWith('.module.html')) onDisk.push(f);
        }
    }
    const orphans = onDisk.filter(f => !linked.has(f));
    if (orphans.length) {
        console.log(`  NOTE  ${hub.name}: ${orphans.length} module(s) on disk that the hub does not list ` +
                    `— unreachable to a student: ${orphans.slice(0, 4).join(', ')}`);
    }
}

console.log(`\n  ${pass}/${pass + fail} checks passed  (${HUBS.length} hubs checked; ` +
            `a hub not listed in HUBS is NOT covered)`);
process.exit(fail ? 1 : 0);
