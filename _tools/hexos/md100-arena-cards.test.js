#!/usr/bin/env node
/**
 * md100-arena-cards.test.js
 *
 * @catalog what    Pins the MD-100 Arena Labs cards to the dispatch registry: every card's title,
 * @catalog what    href and MD-100 module tag must match the box it claims, on every surface.
 * @catalog run     node _tools/hexos/md100-arena-cards.test.js
 * @catalog status  GATE
 *
 * WHY
 * ---
 * The commit that added these cards claimed they were "generated from boxes.json, so they cannot
 * drift". A reviewer checked and there is no generator: the HTML is hand-authored and was merely
 * SOURCED from the registry once. Those are different guarantees, and the difference is exactly
 * how the bug below shipped.
 *
 * THE BUG THIS EXISTS TO PREVENT, because it already happened once in the same commit: two cards
 * were given an "MD-100 M04"/"M10" module tag while the boxes themselves still declared only
 * objectives 5.1/5.2/3.1 and 4.1. A student read M04 on the hub card, clicked Launch, and the
 * briefing screen -- which renders config.certObjectives verbatim -- said 5.1, 5.2, 3.1. Nothing
 * anywhere said M04. One card contradicted itself in two adjacent lines of its own markup.
 *
 * So this asserts the three surfaces AGREE per box:
 *   1. the hub card         _app/houses/forge/md-100/index.html
 *   2. the box itself       _app/dispatch/boxes/<dirname>/config.js  (certObjectives -> briefing)
 *   3. the Dispatch Board   _app/dispatch/boxes.json  (tags)
 *
 * A module tag on a card is a claim made to a student. It must be traceable to the box.
 */

'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '../..');
const HUB = path.join(REPO, '_app/houses/forge/md-100/index.html');
const REGISTRY = path.join(REPO, '_app/dispatch/boxes.json');
const COURSE_MAP = path.join(REPO, '_app/tenant/md-100-map.js');

let pass = 0, fail = 0;
const chk = (n, c, d) => {
    c ? pass++ : fail++;
    console.log(`  ${c ? 'ok  ' : 'FAIL'} ${n}${c ? '' : '  <- ' + String(d).slice(0, 130)}`);
};

const hub = fs.readFileSync(HUB, 'utf8');
const reg = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
const boxes = {};
(Array.isArray(reg) ? reg : reg.boxes || []).forEach((b) => { boxes[b.dirname] = b; });

// The authoritative module list. A card may only cite a module the course actually has.
const courseSrc = fs.readFileSync(COURSE_MAP, 'utf8');
const MODULES = {};
(courseSrc.match(/id: "(m\d+)"[^}]*title: "([^"]*)"/g) || []).forEach((row) => {
    const m = row.match(/id: "(m\d+)"[^}]*title: "([^"]*)"/);
    if (m) MODULES[m[1].toUpperCase()] = m[2];
});
chk('the course map yields modules', Object.keys(MODULES).length >= 10,
    `${Object.keys(MODULES).length} found`);

// Pull the Arena Labs section only. Bonus Labs below it is a different section with non-dispatch
// links, and sweeping it in would make this gate fail for the wrong reason.
const secStart = hub.indexOf('<h2>Arena Labs</h2>');
const secEnd = hub.indexOf('<h2>Bonus Labs</h2>');
chk('the Arena Labs section is present and bounded',
    secStart !== -1 && secEnd !== -1 && secEnd > secStart, `${secStart}..${secEnd}`);
const section = hub.slice(secStart, secEnd);

// One entry per card: title, module tags, href.
const cards = section.split('<div class="arena-card">').slice(1);
chk('the section has more than one card', cards.length > 1, `${cards.length} card(s)`);

cards.forEach((card) => {
    const title = (card.match(/<h3>([^<]*)<\/h3>/) || [])[1] || '(no title)';
    const href = (card.match(/href="([^"]*)"[^>]*class="arena-launch"/) || [])[1] || '';
    const modTags = (card.match(/MD-100 (M\d+)/g) || []).map((t) => t.replace('MD-100 ', ''));

    const dirname = (href.match(/\/dispatch\/boxes\/([^/]+)\//) || [])[1];
    chk(`"${title}" links to a dispatch box`, !!dirname, href);
    if (!dirname) return;

    const box = boxes[dirname];
    chk(`"${title}" resolves in the registry`, !!box, dirname);
    if (!box) return;

    // 1. The card's title must be the box's title. Catches a hand-edit drifting from the source,
    //    and caught a truncated title the registry generator had produced.
    chk(`"${title}" matches the registry title`, title === box.title,
        `card="${title}" registry="${box.title}"`);

    // 2. The target must exist. A card pointing at a deleted box is a dead end for a student.
    chk(`"${title}" target exists on disk`,
        fs.existsSync(path.join(REPO, '_app', href)), href);

    modTags.forEach((mod) => {
        // 3. The module must be a real course module, not a number someone invented.
        chk(`${dirname}: ${mod} is a real MD-100 module`, !!MODULES[mod],
            `${mod} is not in md-100-map.js`);

        // 4. THE ONE THAT MATTERS. The box itself must declare this module, or the card is telling
        //    the student something the briefing screen will contradict one click later.
        const cfg = fs.readFileSync(
            path.join(REPO, '_app/dispatch/boxes', dirname, 'config.js'), 'utf8');
        chk(`${dirname}: config.js declares ${mod}`,
            new RegExp(`objective:\\s*'${mod}'`).test(cfg),
            'the hub card claims a module the box does not, so the briefing screen will disagree');

        // 5. And the Dispatch Board must name it too, so all three surfaces agree.
        chk(`${dirname}: registry tags include ${mod}`,
            (box.tags || []).some((t) => t.indexOf(mod) !== -1),
            `tags=${JSON.stringify(box.tags || [])}`);
    });
});

console.log(`\n  ${pass}/${pass + fail} passed`);
process.exitCode = fail ? 1 : 0;
