#!/usr/bin/env node
/*
 * Does the roster write path actually EXECUTE? Real browser, real Firebase Web SDK, real
 * writeBatch, real commits — against the Firestore emulator.
 *
 * @catalog what    runtime proof that console.html's batched team-roster write works
 * @catalog run     firebase emulators:exec --only firestore --project=demo-hexworth "node _tools/tournament/writebatch-runtime-proof.js"
 * @catalog status  TOOL
 *
 * WHY. Chris blocked TOURN-01 on exactly one thing: the code had never run. Anywhere. Not in a
 * browser, not in an emulator. `_firestoreModule.writeBatch(db)` inside saveTournament() is the
 * single action that provisions the whole team roster for a live class, and the fact that the
 * same pattern appears elsewhere in the repo is precedent, not execution. Round 1 of this change
 * already proved that tracing logic misses load-bearing bugs.
 *
 * The admin console itself cannot be driven headlessly — it redirects any non-admin before its
 * script defines anything — so this lifts the EXACT write path out of console.html and runs it
 * in a real Chromium page against the same SDK build the console loads:
 *   - namespace import of firebase-firestore.js@12.7.0, then writeBatch accessed AS A PROPERTY
 *     of that namespace, which is precisely the call shape under suspicion
 *   - batch.set() carrying serverTimestamp()
 *   - the 400-per-chunk loop, at a count that forces more than one chunk
 *
 * It runs against the EMULATOR, so it writes nothing to production and needs no admin rights.
 * What it does NOT cover: the click, the toast, and the list-row render. Those still want a human
 * on a preview channel, and that gap is reported rather than papered over.
 */
const puppeteer = require('puppeteer');
const http = require('http');

const SDK = 'https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js';
const APP = 'https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js';
const COUNT = 450;   // > 400 on purpose: forces the chunking loop to run twice

// The emulator enforces the REAL firestore.rules, which correctly require isAdmin() to write a
// team — so an unauthenticated browser is PERMISSION_DENIED, as it should be. That rule is under
// test elsewhere (_tools/rules-test/*). What is under test HERE is the SDK write path itself, so
// this run installs permissive rules on the emulator first, via its own admin REST endpoint.
// This touches the emulator only; production rules are never involved.
// Serves a blank page so the browser has a REAL http origin.
//
// SELF-CONTAINED ON PURPOSE (Chris, 2026-08-29). The first version hardcoded
// http://127.0.0.1:8901 and never started anything there — it silently depended on a server
// left running by hand in another terminal. Chris killed that process, re-ran the exact
// documented command, and got ERR_CONNECTION_REFUSED. A tool whose @catalog run line does not
// actually work is worse than no tool, because the next person concludes the code is broken.
function startHost() {
  return new Promise((resolve) => {
    const srv = http.createServer((_, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<!doctype html><title>runtime proof host</title><body>ok</body>');
    });
    srv.listen(0, '127.0.0.1', () => resolve({ srv, port: srv.address().port }));
  });
}

async function openEmulatorRules() {
  const body = {
    rules: {
      files: [{ name: 'proof.rules',
        content: "rules_version='2';service cloud.firestore{match /databases/{db}/documents{match /{d=**}{allow read,write: if true;}}}" }],
    },
  };
  const r = await fetch('http://127.0.0.1:8181/emulator/v1/projects/demo-hexworth:securityRules', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error('could not set emulator rules: ' + r.status + ' ' + (await r.text()).slice(0, 120));
}

(async () => {
  await openEmulatorRules();
  const host = await startHost();   // ephemeral port: cannot collide with anything
  // protocolTimeout raised: 450 documents over two batch commits from a real browser to the
  // emulator legitimately exceeds puppeteer's 30s default for a single evaluate() call. The
  // first run hit that and reported a timeout, which is a harness limit, not a code failure.
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    protocolTimeout: 180000,
  });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
  // MUST be a real HTTP origin, not about:blank. The first run used about:blank, whose origin
  // is `null`, and the Firestore emulator rejected every request with a CORS failure — which
  // surfaced as a protocol TIMEOUT rather than an error, because the SDK retries a failed
  // channel indefinitely rather than rejecting. A hang that looks like slowness is worth
  // naming: it cost two runs before the console errors revealed ERR_FAILED on the Write channel.
  await page.goto(`http://127.0.0.1:${host.port}/`, { waitUntil: 'domcontentloaded', timeout: 20000 });

  const result = await page.evaluate(async (sdk, appSdk, count) => {
    const { initializeApp } = await import(appSdk);
    // NAMESPACE import — the same shape console.html uses (`_firestoreModule = mod`).
    const mod = await import(sdk);
    const app = initializeApp({ projectId: 'demo-hexworth' });
    const db = mod.getFirestore(app);
    mod.connectFirestoreEmulator(db, '127.0.0.1', 8181);

    // THE CALL UNDER SUSPICION: property access on the namespace, not a destructured import.
    if (typeof mod.writeBatch !== 'function') {
      return { ok: false, why: 'writeBatch is NOT a function on the namespace import: ' + typeof mod.writeBatch };
    }

    // Roster generator, verbatim from console.html.
    const NAMED = ['team-red','team-blue','team-green','team-gold','team-purple','team-cyan',
                   'team-orange','team-pink','team-lime','team-teal','team-indigo','team-amber'];
    const hslToHex = (h, s, l) => { s/=100; l/=100;
      const k=n=>(n+h/30)%12, a=s*Math.min(l,1-l);
      const f=n=>Math.round(255*(l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)))));
      return '#'+[f(0),f(8),f(4)].map(v=>v.toString(16).padStart(2,'0')).join(''); };
    const roster = [];
    for (let i = 0; i < count; i++) {
      roster.push(i < NAMED.length
        ? { id: NAMED[i], name: 'Named ' + i, color: '#ef4444' }
        : { id: 'team-' + String(i+1).padStart(3,'0'), name: 'Squad ' + (i+1),
            color: hslToHex(Math.round((i*137.508)%360), 62, 55) });
    }

    const tid = 'QCBENCH-writebatch-proof';
    const t0 = performance.now();
    let chunks = 0;
    // THE EXACT LOOP from console.html, including serverTimestamp() inside batch.set().
    for (let i = 0; i < roster.length; i += 400) {
      const batch = mod.writeBatch(db);
      for (const team of roster.slice(i, i + 400)) {
        batch.set(mod.doc(db, 'tournaments', tid, 'teams', team.id), {
          name: team.name, color: team.color, captain: null,
          members: [], memberNames: [], score: 0, solves: [],
          hintPenalty: 0, lastSolveTime: null,
          createdAt: mod.serverTimestamp(),
        });
      }
      await batch.commit();
      chunks++;
    }
    const ms = Math.round(performance.now() - t0);

    // Read back: a commit that resolves is not proof the docs landed.
    const snap = await mod.getDocs(mod.collection(db, 'tournaments', tid, 'teams'));
    const ids = new Set(); let tsOk = 0, colourOk = 0;
    snap.forEach(d => { ids.add(d.id);
      const v = d.data();
      if (v.createdAt) tsOk++;                                  // serverTimestamp resolved
      if (/^#[0-9a-fA-F]{3,8}$/.test(v.color)) colourOk++; });   // renderers whitelist hex

    // Clean up after ourselves even in the emulator.
    for (let i = 0; i < snap.docs.length; i += 400) {
      const b = mod.writeBatch(db);
      snap.docs.slice(i, i + 400).forEach(d => b.delete(d.ref));
      await b.commit();
    }
    return { ok: true, asked: count, written: snap.size, unique: ids.size, chunks, ms, tsOk, colourOk };
  }, SDK, APP, COUNT);

  let pass = 0, fail = 0;
  const chk = (n, ok, d) => { console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`); ok ? pass++ : fail++; };

  chk('no page errors during the run', errs.length === 0, errs[0] || '');
  chk('writeBatch resolves as a property of the namespace import', result.ok, result.why || '');
  if (result.ok) {
    console.log(`        ${result.asked} teams · ${result.chunks} chunk(s) · ${result.ms}ms`);
    chk('every team document actually committed', result.written === result.asked,
        `${result.written}/${result.asked}`);
    chk('no id collisions after a real round trip', result.unique === result.asked,
        `${result.unique} unique`);
    chk('serverTimestamp() resolved inside batch.set()', result.tsOk === result.asked,
        `${result.tsOk}/${result.asked} carry createdAt`);
    chk('every stored colour is renderer-valid hex', result.colourOk === result.asked,
        `${result.colourOk}/${result.asked}`);
    chk('the chunking loop ran more than once (>400 forces it)', result.chunks > 1,
        `${result.chunks} chunks`);
  }

  console.log(`\n  ${pass} passed, ${fail} failed`);
  await browser.close();
  host.srv.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('  FAILED:', e.message); process.exit(1); });
