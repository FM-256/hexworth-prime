// Proves LabStateSync actually round-trips, now that BUG-068's guard fix makes it live.
//
// WHY THIS EXISTS: before the guard fix, _uid() and _db() returned null unconditionally, so this
// module was a total no-op on every page that loaded it. The fix flips it to REAL Firestore
// reads and writes for real students. Reading the code and finding the design careful is a
// proxy — and this exact feature was already recorded as SHIPPED once when it had never worked,
// precisely because "the guard passes" was mistaken for "the feature works". Chris blocked the
// deploy on this gap. So: exercise the behaviour.
//
// Uses an in-memory fake Firestore, so it touches NOTHING in production. It asserts the
// properties the module claims for itself: push/pull symmetry across two simulated devices, the
// monotonic counter ordering, adopt-instead-of-clobber when the cloud is ahead, and the refusal
// to ever push unparseable or oversized state.
//
// Ends with an ABLATION (--ablate): serves LabStateSync with its PRE-FIX dead guards restored
// and requires the round-trip assertions to FAIL. A probe that has not been shown to fail is not
// evidence -- which is the same reasoning that made a design read insufficient here.
//
// usage: node _tools/eduscan/smoke/labstatesync-roundtrip-probe.js [--ablate]
const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../../_app');
const PORT = 8987;
const KEY = 'hexworth_lab_probe_state';
const ABLATE = process.argv.includes('--ablate');

// A page that loads LabStateSync plus a fake Firestore. Built here rather than reusing a real
// page so the only moving part is the module under test.
const PAGE = `
<!doctype html><meta charset="utf-8"><title>labstatesync probe</title>
<script>
  // ── in-memory Firestore ──
  window.__docs = {};
  function _key(ref) { return ref.path; }
  window.firebaseFirestore = {
    doc: function () { var parts = Array.prototype.slice.call(arguments, 1); return { path: parts.join('/') }; },
    getDoc: function (ref) {
      var d = window.__docs[_key(ref)];
      return Promise.resolve({ exists: function () { return !!d; }, data: function () { return d; } });
    },
    setDoc: function (ref, val) { window.__docs[_key(ref)] = JSON.parse(JSON.stringify(val)); return Promise.resolve(); },
    deleteDoc: function (ref) { delete window.__docs[_key(ref)]; return Promise.resolve(); },
    serverTimestamp: function () { return '__ts__'; }
  };
  const FirestoreManager = { getDb: function () { return { __fake: true }; } };
  const FirebaseAuth = { getUser: function () { return { uid: 'probe-uid' }; } };
</script>
<script src="/components/LabStateSync.js"></script>
`;

const MIME = { '.js': 'text/javascript' };
const srv = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/probe.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(PAGE); return; }
  if (url === '/components/LabStateSync.js') {
    let src = fs.readFileSync(path.join(ROOT, 'components/LabStateSync.js'), 'utf8');
    if (ABLATE) {
      // Put back the exact dead guards BUG-068 fixed: window.X on a lexical const is undefined,
      // so _uid()/_db() return null and the module is a total no-op again.
      src = src.replace("(typeof FirestoreManager !== 'undefined' && FirestoreManager) && FirestoreManager.getDb", 'window.FirestoreManager && FirestoreManager.getDb')
               .replace("(typeof FirebaseAuth !== 'undefined' && FirebaseAuth) && FirebaseAuth.getUser", 'window.FirebaseAuth && FirebaseAuth.getUser');
    }
    res.writeHead(200, { 'Content-Type': 'text/javascript' }); res.end(src); return;
  }
  const p = path.join(ROOT, url);
  fs.readFile(p, (e, b) => {
    if (e) { res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
    res.end(b);
  });
});

let pass = 0, fail = 0; const fails = [];
function check(l, ok, d) { if (ok) { pass++; console.log(`  PASS  ${l}`); } else { fail++; fails.push(`${l}${d ? ': ' + d : ''}`); console.log(`  FAIL  ${l}${d ? ': ' + d : ''}`); } }

srv.listen(PORT, async () => {
  console.log(ABLATE ? 'ABLATED run (pre-fix dead guards) -- these checks MUST fail\n' : 'Fixed source\n');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`http://localhost:${PORT}/probe.html`, { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 400));

    check('LabStateSync loaded', await page.evaluate(() => typeof LabStateSync === 'object'));

    const r = await page.evaluate(async (KEY) => {
      const out = {};
      // queuePush DEBOUNCES the real write by PUSH_DEBOUNCE_MS (3500) and bumps the counter
      // SYNCHRONOUSLY first. ready() settles the initial PULL, not the push -- awaiting it proves
      // nothing about whether the write landed. So: wait out the debounce explicitly.
      const settlePush = () => new Promise((r) => setTimeout(r, 4200));
      const DOC = 'users/probe-uid/sync/labstate_' + KEY.replace(/[^a-zA-Z0-9_-]/g, '_');
      const stateA = JSON.stringify({ stage: 3, answers: ['a', 'b'], device: 'A' });

      // ── DEVICE A: local state at counter 5, push ──
      localStorage.setItem(KEY, stateA);
      localStorage.setItem(KEY + '__lsv', '5');
      LabStateSync.register(KEY);
      LabStateSync.queuePush(KEY);          // bumps lsv 5 -> 6, then debounces the write
      await settlePush();
      out.pushedDoc = window.__docs[DOC] ? { value: window.__docs[DOC].value, lastSaved: window.__docs[DOC].lastSaved, type: window.__docs[DOC].type } : null;

      // ── DEVICE B: same account, empty local (cache cleared / new device). Pull. ──
      localStorage.removeItem(KEY);
      localStorage.removeItem(KEY + '__lsv');
      out.restoredCount = await LabStateSync.pull();
      out.deviceBValue = localStorage.getItem(KEY);
      out.deviceBLsv = localStorage.getItem(KEY + '__lsv');
      out.roundTripEqual = out.deviceBValue === stateA;

      // ── COUNTER ORDERING: local BEHIND cloud must not clobber; must adopt cloud ──
      const stale = JSON.stringify({ stage: 1, device: 'stale' });
      localStorage.setItem(KEY, stale);
      localStorage.setItem(KEY + '__lsv', '2');          // behind the cloud's 5
      LabStateSync.queuePush(KEY);          // bumps 2 -> 3, still behind the cloud's 6
      await settlePush();
      out.cloudAfterStalePush = window.__docs[DOC] ? window.__docs[DOC].value : null;
      out.staleClobbered = (window.__docs[DOC] ? window.__docs[DOC].value : null) === stale;   // must be FALSE
      out.adoptedCloud = localStorage.getItem(KEY) === stateA;   // must be TRUE

      // ── CORRUPT STATE must never be pushed ──
      const goodDocBefore = window.__docs[DOC] ? window.__docs[DOC].value : null;
      localStorage.setItem(KEY, '{not valid json');
      localStorage.setItem(KEY + '__lsv', '99');         // newer, so only the parse check can stop it
      LabStateSync.queuePush(KEY);
      await settlePush();
      out.corruptPushed = (window.__docs[DOC] ? window.__docs[DOC].value : null) !== goodDocBefore;   // must be FALSE

      // ── OVERSIZE state must never be pushed ──
      localStorage.setItem(KEY, JSON.stringify({ blob: 'x'.repeat(750000) }));
      localStorage.setItem(KEY + '__lsv', '100');
      LabStateSync.queuePush(KEY);
      await settlePush();
      out.oversizePushed = (window.__docs[DOC] ? window.__docs[DOC].value : null) !== goodDocBefore;  // must be FALSE

      // ── deleteCloud removes the doc ──
      localStorage.setItem(KEY, stateA);
      localStorage.setItem(KEY + '__lsv', '5');
      await LabStateSync.deleteCloud(KEY);
      out.docAfterDelete = window.__docs[DOC] || null;
      return out;
    }, KEY);

    check('device A push wrote a doc', !!r.pushedDoc, JSON.stringify(r.pushedDoc && r.pushedDoc.type));
    // 6, not 5: queuePush bumps the counter synchronously so a genuine save always out-ranks
    // the cloud. Asserting 5 would have been asserting my own misreading of the module.
    check('pushed doc carries the bumped local counter (5 -> 6)', r.pushedDoc && r.pushedDoc.lastSaved === 6,
      r.pushedDoc ? `lastSaved=${r.pushedDoc.lastSaved}` : 'no doc');
    check('device B pull restored exactly what device A pushed (ROUND TRIP)', r.roundTripEqual === true,
      `got ${String(r.deviceBValue).slice(0, 60)}`);
    check('device B pull reported 1 restored key', r.restoredCount === 1, `restored=${r.restoredCount}`);
    check('device B counter matches the cloud counter', r.deviceBLsv === '6', `lsv=${r.deviceBLsv}`);
    check('a BEHIND local state does not clobber a newer cloud', r.staleClobbered === false);
    check('a behind device ADOPTS the cloud copy instead', r.adoptedCloud === true);
    check('unparseable state is NEVER pushed', r.corruptPushed === false);
    check('oversized state is NEVER pushed', r.oversizePushed === false);
    check('deleteCloud removes the doc', r.docAfterDelete === null);
    check('no page errors', errors.length === 0, errors.slice(0, 2).join(' | '));

    await page.close();
  } finally { await browser.close().catch(() => {}); srv.close(); }

  console.log(`\n${pass} passed, ${fail} failed`);
  fails.forEach((f) => console.log('  - ' + f));
  if (ABLATE) {
    console.log(fail > 0
      ? '\nABLATION OK -- the probe fails against the pre-fix dead guards, so it is live.'
      : '\nABLATION FAILED -- probe passed against the NO-OP module. It is a false oracle.');
    process.exit(fail > 0 ? 0 : 1);
  }
  process.exit(fail ? 1 : 0);
});
