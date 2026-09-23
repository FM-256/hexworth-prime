#!/usr/bin/env node
'use strict';
/**
 * podium-crest.test.js
 *
 * @catalog what   Proves the podium team crest renders and that a crafted team NAME cannot inject
 *                 markup through the initials, which land inside SVG text
 * @catalog run    node _tools/hexos/podium-crest.test.js
 * @catalog status TOOL
 *
 * WHY THE SANITISER IS THE INTERESTING PART. The crest replaced a coloured dot, which is cosmetic,
 * but the initials come from the TEAM NAME and a team name is attacker-controllable: firestore.rules
 * leaves teams.create open, which is the same hole that forced num() and safeColor() to exist
 * (BUG-023/BUG-024). The initials are injected into SVG <text>, where escHtml's HTML-entity encoding
 * is the wrong tool. So they are reduced to at most two characters from [A-Z0-9] and everything else
 * is discarded, which means no character capable of forming markup can survive.
 *
 * Functions are extracted from the page rather than reimplemented, so this cannot pass while the
 * shipped sanitiser differs.
 */
const fs = require('fs');
const path = require('path');

/* PODIUM_PATH exists so this can be pointed at a deliberately broken copy: an injection test that
 * has never been shown to fail is not evidence that anything is sanitised. */
const src = fs.readFileSync(process.env.PODIUM_PATH
    || path.join(__dirname, '..', '..', '_app', 'arena', 'tournament-podium.html'), 'utf8');
/* Brace-matched rather than regex-matched: the escaping needed to express this as a RegExp inside
 * a shell heredoc produced an unterminated group on the first attempt, and a matcher that is hard
 * to write correctly is a matcher that will be wrong later. */
function grab(name) {
    const marker = 'function ' + name + '(';
    const at = src.indexOf(marker);
    if (at === -1) throw new Error(name + ' not found in tournament-podium.html');
    let i = src.indexOf('{', at), depth = 0;
    for (; i < src.length; i++) {
        if (src[i] === '{') depth++;
        else if (src[i] === '}') { depth--; if (depth === 0) { i++; break; } }
    }
    const body = src.slice(at, i);
    if (body.length < 40) throw new Error(name + ' extracted only ' + body.length + ' chars');
    return body;
}

/* A Function wrapper rather than eval: this file is 'use strict', which scopes declarations made
 * inside eval to the eval itself, so the functions extracted fine and were then invisible. */
const { safeColor, teamInitials, teamCrest } = new Function(
    grab('safeColor') + '\n' + grab('teamInitials') + '\n' + grab('teamCrest')
    + '\nreturn { safeColor, teamInitials, teamCrest };')();

let pass = 0, fail = 0;
const chk = (n, ok, d) => { console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`); ok ? pass++ : fail++; };

console.log('\n== podium team crest ==');

chk('two words become two initials', teamInitials('Red Cell') === 'RC', teamInitials('Red Cell'));
chk('one word takes two letters', teamInitials('Vanguard') === 'VA', teamInitials('Vanguard'));
chk('empty name falls back', teamInitials('') === '?', teamInitials(''));
chk('null name falls back', teamInitials(null) === '?', teamInitials(null));
chk('digits are allowed', teamInitials('7 Ronin') === '7R', teamInitials('7 Ronin'));

/* THE ONE THAT MATTERS. Each of these would be markup if it survived. */
const attacks = [
    '<script>alert(1)</script>',
    '"/><script>x</script>',
    '</text><script>y</script>',
    '&lt;img src=x onerror=1&gt;',
    "' onload='evil()",
];
let clean = true, examples = [];
for (const a of attacks) {
    const ini = teamInitials(a);
    const svg = teamCrest({ name: a, color: '#ff0000' }, 14);
    if (!/^[A-Z0-9?]{1,2}$/.test(ini)) { clean = false; examples.push(ini); }
    /* One <text> element, one <svg>: a broken-out payload would add tags. */
    if ((svg.match(/<text/g) || []).length !== 1) { clean = false; examples.push('extra <text> for ' + a); }
    if (/<script|onerror|onload/i.test(svg)) { clean = false; examples.push('payload survived: ' + a); }
}
chk('a crafted team NAME cannot inject through the initials', clean, examples.join(' | '));

/* Colour is whitelisted by the pre-existing safeColor, but the crest must actually use it. */
const bad = teamCrest({ name: 'Red Cell', color: '#fff" onload="evil()' }, 14);
chk('a crafted team COLOUR falls back instead of breaking out', !/onload/i.test(bad) && /var\(--accent\)/.test(bad));
chk('a valid colour is used as given', /#ef4444/.test(teamCrest({ name: 'Red Cell', color: '#ef4444' }, 14)));

const svg = teamCrest({ name: 'Blue Shield', color: '#3b82f6' }, 26);
chk('renders a shield with the initials', /<svg/.test(svg) && />BS</.test(svg), 'BS present');
chk('hidden from screen readers (the name is read instead)', /aria-hidden="true"/.test(svg));
chk('height scales with width', /width="26"/.test(svg) && /height="30"/.test(svg));

console.log(`\n  ${pass} passed, ${fail} failed\n`);
process.exitCode = fail === 0 ? 0 : 1;
