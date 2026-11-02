#!/usr/bin/env node
/**
 * bug292-false-positives.test.js — the four EduScan false positives fixed for BUG-292, each with the
 * real defect its rule exists for, so a fix that silences the rule outright fails here.
 *
 * @catalog what    Fixture checks for HEUR-022, HTML-012, SANDBOX-007 and PATH-004: the false
 * @catalog what    positive stays silent, and the genuine defect next to it still fires.
 * @catalog run     node _tools/eduscan/bug292-false-positives.test.js
 * @catalog status  TOOL
 *
 * Found 2026-10-31 triaging a Nexus run: every one of these was reported on a live page, and each
 * was checked by hand (a browser click, a tag count, a resolved path) before the rule was changed.
 * Across the whole of _app the changes removed exactly those findings and added none.
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const Heur = require('./validators/syntax/heuristics.js');
const Html = require('./validators/syntax/html.js');
const Sandbox = require('./validators/syntax/sandbox.js');
const Paths = require('./validators/syntax/paths.js');

let pass = 0, fail = 0;
/* Records one assertion and prints it. */
function chk(name, cond, detail) {
    if (cond) { pass++; console.log('  ok   ' + name); }
    else { fail++; console.log('  FAIL ' + name + (detail !== undefined ? '  <- ' + JSON.stringify(detail) : '')); }
}

/* A throwaway _app with the given files, so link targets can exist or not. */
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bug292-'));
const put = (p, body) => { fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true }); fs.writeFileSync(path.join(root, p), body || 'x'); };
put('index.html'); put('arena/boxes/le-01/index.html'); put('houses/cloud/index.html');

try {
    console.log('\nHEUR-022  a link that leaves its house');
    const heur = new Heur({ rootPath: root });
    const h22 = (href) => heur.checkOverDeepIndexLinks({ path: 'houses/cloud/games/g.html', content: `<a href="${href}">x</a>` }).length;
    chk('to a specific page that exists elsewhere is deliberate, not reported', h22('../../../arena/boxes/le-01/index.html') === 0);
    chk('overshooting to the platform root IS reported', h22('../../../index.html') === 1);
    chk('to a page that does not exist IS reported', h22('../../../arena/boxes/missing/index.html') === 1);

    console.log('\nHTML-012  a ${{ in lesson prose');
    const html = new Html({ profile: 'ci' });
    const h12 = (body) => html.validate({ path: 'x.html', content: body }).filter((i) => i.code === 'HTML-012').length;
    chk('a lone "${{" in prose does not swallow a closing </div>',
        h12('<div><p>Never interpolate <code>${{</code> into run: steps.</p></div>\n<p>a } b</p>') === 0);
    chk('a div that really is unclosed IS reported', h12('<div><p>open</p>\n<div>also</div>') === 1);
    chk('a real ${x} placeholder is still stripped', h12('<div title="${a}">ok</div>') === 0);

    console.log('\nSANDBOX-007  where the launch button renders');
    const sb = new Sandbox({ rootPath: root });
    const head = '<script src="/components/FirebaseAuth.js"></script><script src="/components/SandboxLauncher.js"></script>';
    const s7 = (body) => sb.validate({ path: 'x/lab.html', content: head + body }).filter((i) => i.code === 'SANDBOX-007').length;
    chk('a lookup inside the call, element present: not reported',
        s7('<div id="m"></div><script>SandboxLauncher.renderButton(document.getElementById("m"),"x")</script>') === 0);
    chk('a lookup inside the call, element MISSING: reported',
        s7('<script>SandboxLauncher.renderButton(document.getElementById("nope"),"x")</script>') === 1);
    chk('a mount the script creates itself: not reported',
        s7('<script>var m=document.createElement("div");SandboxLauncher.renderButton(m,"x")</script>') === 0);
    chk('an unknown variable with nothing to find: reported',
        s7('<script>SandboxLauncher.renderButton(someVar,"x")</script>') === 1);

    console.log('\nPATH-004  a card for an unbuilt page');
    const pv = new Paths({ rootPath: root, profile: 'ci' });
    const p4 = (body) => pv.validate({ path: 'houses/cloud/hub.html', content: body }).filter((i) => i.code === 'PATH-004').length;
    const gate = '<script>var COMING_SOON = ["labs/later.html"]; a.addEventListener("click", function (e) { e.preventDefault(); });</script>';
    chk('a missing target the page gates as coming soon: not reported', p4('<a href="labs/later.html">x</a>' + gate) === 0);
    chk('a missing target NOT in the list: reported', p4('<a href="labs/other.html">x</a>' + gate) === 1);
    chk('a list with no click gate proves nothing: reported',
        p4('<a href="labs/later.html">x</a><script>var COMING_SOON = ["labs/later.html"];</script>') === 1);
} finally {
    fs.rmSync(root, { recursive: true, force: true });
}

console.log('\n  ' + pass + '/' + (pass + fail) + ' assertions passed');
process.exit(fail ? 1 : 0);
