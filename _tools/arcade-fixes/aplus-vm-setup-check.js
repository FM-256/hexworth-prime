// Self-check harness for forge-vm-setup.lab.html
//
// Regression guard for two fixes made 2026-07-05:
//   1. Type-1 hypervisor dead-end: picking the Type 1 card used to silently leave Next
//      disabled with no explanation. Now it shows feedback explaining a Type 2 hosted
//      hypervisor is required for a desktop VM, and only Type 2 advances.
//   2. Direct-call gate bypass: nextStep() advanced (and completed) without re-checking the
//      step's validity (the button was only visually disabled). Now nextStep() hard-gates on
//      isStepValid(currentStep), so a direct call cannot skip a step or force completion.
//
// Serves _app over http so the lab + its component scripts load same-origin, and stubs
// AccessGuard/AchievementManager/ModuleProgress/HexAIButton the same way the sibling
// aplus-*-check.js harnesses do. ModuleProgress.complete is instrumented (not no-op'd) so we
// can prove it fires exactly once on a real playthrough and never on a bypass.

const http = require('http');
const fs = require('fs');
const path = require('path');
const pup = require('puppeteer');

const APP = path.resolve(__dirname, '../../_app');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let pass = true;
const ok = (n, c, e) => { if (!c) pass = false; console.log('  ' + (c ? 'PASS' : 'FAIL') + '  ' + n + (e !== undefined ? '  ' + JSON.stringify(e).slice(0, 400) : '')); };

const LAB_URL_PATH = '/houses/forge/applets/comptia-aplus/core-1/labs/forge-vm-setup.lab.html';

const srv = http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]); let fp = path.join(APP, p);
  if (fs.existsSync(fp) && fs.statSync(fp).isFile()) { s.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' }); fs.createReadStream(fp).pipe(s); }
  else { s.writeHead(404); s.end('nf'); }
});

async function newStubbedPage(browser) {
  const pg = await browser.newPage();
  const errs = [];
  pg.on('pageerror', e => { const m = String(e.message); if (!/firebase|firestore|auth\/|AccessGuard|not authenticated|AchievementManager|ModuleProgress|GameTracker|GameScoreboard/i.test(m)) errs.push(m.slice(0, 300)); });
  pg.on('console', msg => { if (msg.type() === 'error') { const t = msg.text(); if (!/firebase|firestore/i.test(t)) errs.push('console.error: ' + t.slice(0, 300)); } });
  await pg.setRequestInterception(true);
  pg.on('request', r => {
    const u = r.url();
    if (u.endsWith('/components/AccessGuard.js')) {
      r.respond({ status: 200, contentType: 'text/javascript', body: 'window.AccessGuard={require:function(){return true;},requireAll:function(){return true;},requireAny:function(){return true;}};' });
    } else if (u.endsWith('/components/AchievementManager.js')) {
      r.respond({ status: 200, contentType: 'text/javascript', body: 'window.AchievementManager=new Proxy({},{get:function(){return function(){};}});' });
    } else if (u.endsWith('/components/ModuleProgress.js')) {
      r.respond({ status: 200, contentType: 'text/javascript', body:
        'window.__mpCalls=[];' +
        'window.ModuleProgress={complete:function(house,mod,opts){window.__mpCalls.push([house,mod,opts]);},isCompleted:function(){return false;}};'
      });
    } else if (u.endsWith('/_lib/HexAIButton.js')) {
      r.respond({ status: 200, contentType: 'text/javascript', body: '' });
    } else {
      r.continue();
    }
  });
  return { pg, errs };
}

async function fresh(b, port) {
  const { pg, errs } = await newStubbedPage(b);
  await pg.goto('http://localhost:' + port + LAB_URL_PATH, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(300);
  return { pg, errs };
}

(async () => {
  await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
  const b = await pup.launch({ headless: 'new', args: ['--no-sandbox'] });

  // ── 1. Load + initial state ─────────────────────────────────────────────
  {
    const { pg, errs } = await fresh(b, port);
    const st = await pg.evaluate(() => ({
      step: currentStep,
      nextDisabled: document.getElementById('nextBtn').disabled,
      fbHidden: document.getElementById('hypervisorFeedback').style.display === 'none',
      hasIsStepValid: typeof isStepValid === 'function'
    }));
    ok('loads at step 1 with Next disabled and no hypervisor feedback shown', st.step === 1 && st.nextDisabled && st.fbHidden, st);
    ok('isStepValid() gate function exists (script parsed fully)', st.hasIsStepValid, st);
    ok('0 non-platform pageErrors on load', errs.length === 0, errs.slice(0, 4));
    await pg.close();
  }

  // ── 2. Type 1 pick: explains, does NOT advance (dead-end fix) ────────────
  {
    const { pg } = await fresh(b, port);
    const r = await pg.evaluate(() => {
      selectHypervisor('type1');
      const fb = document.getElementById('hypervisorFeedback');
      return {
        nextDisabled: document.getElementById('nextBtn').disabled,
        fbShown: fb.style.display !== 'none',
        fbWarning: fb.className.indexOf('warning') !== -1,
        mentionsType2: /Type 2/.test(fb.textContent),
        fbText: fb.textContent.slice(0, 80),
        hyp: hypervisorSelected
      };
    });
    ok('Type 1 pick shows a warning feedback message that points to Type 2 (not a silent dead-end)', r.fbShown && r.fbWarning && r.mentionsType2, r);
    ok('Type 1 pick leaves Next disabled (hypervisorSelected stays false)', r.nextDisabled && r.hyp === false, r);
    // direct nextStep bypass while invalid
    const bypass = await pg.evaluate(() => { nextStep(); return { step: currentStep, mp: window.__mpCalls.length }; });
    ok('direct nextStep() after Type 1 pick is a no-op (stays on step 1, no completion)', bypass.step === 1 && bypass.mp === 0, bypass);
    await pg.close();
  }

  // ── 3. Type 2 pick: confirms + enables Next ──────────────────────────────
  {
    const { pg } = await fresh(b, port);
    const r = await pg.evaluate(() => {
      selectHypervisor('type2');
      const fb = document.getElementById('hypervisorFeedback');
      return {
        nextDisabled: document.getElementById('nextBtn').disabled,
        fbSuccess: fb.className.indexOf('success') !== -1,
        hyp: hypervisorSelected
      };
    });
    ok('Type 2 pick confirms and enables Next', !r.nextDisabled && r.fbSuccess && r.hyp === true, r);
    await pg.close();
  }

  // ── 4. Direct-call bypass from a fresh load cannot skip steps ────────────
  {
    const { pg } = await fresh(b, port);
    const r = await pg.evaluate(() => {
      const before = currentStep;
      nextStep(); nextStep(); nextStep(); // no hypervisor selected yet
      return { before, after: currentStep, mp: window.__mpCalls.length };
    });
    ok('spamming nextStep() with nothing selected never advances or completes', r.after === 1 && r.mp === 0, r);
    await pg.close();
  }

  // ── 5. Full correct playthrough completes exactly once ───────────────────
  {
    const { pg, errs } = await fresh(b, port);
    // step 1
    await pg.evaluate(() => { selectHypervisor('type2'); nextStep(); });
    // step 2: name + OS
    await pg.evaluate(() => {
      const n = document.getElementById('vmName'); n.value = 'Win11-Dev-Test'; n.dispatchEvent(new Event('input'));
      const t = document.getElementById('vmType'); t.value = 'windows'; t.dispatchEvent(new Event('change'));
    });
    const step2valid = await pg.evaluate(() => !document.getElementById('nextBtn').disabled);
    ok('step 2 valid once name + OS type set', step2valid);
    await pg.evaluate(() => nextStep()); // -> step 3 (RAM)
    await pg.evaluate(() => nextStep()); // -> step 4 (disk)
    await pg.evaluate(() => nextStep()); // -> step 5 (create)
    const atStep5 = await pg.evaluate(() => currentStep);
    ok('reached step 5 (create) via the wizard', atStep5 === 5, atStep5);
    // before vmCreated, the Complete click must not fire completion
    const early = await pg.evaluate(() => { nextStep(); return { mp: window.__mpCalls.length, created: vmCreated }; });
    ok('nextStep() at step 5 before VM is created does NOT complete (gate on vmCreated)', early.mp === 0 && early.created === false, early);
    // wait for the 2s creation timer
    await sleep(2300);
    const created = await pg.evaluate(() => vmCreated);
    ok('VM creation completes (vmCreated true) after the create step', created === true);
    const done = await pg.evaluate(() => { nextStep(); return { mp: window.__mpCalls.slice(), shown: document.getElementById('completionScreen').classList.contains('show') }; });
    ok('completion fires ModuleProgress.complete exactly once with the exact signature',
      done.mp.length === 1 && JSON.stringify(done.mp[0]) === JSON.stringify(['forge', 'forge-vm-setup', { returnUrl: '../index.html' }]),
      done.mp);
    ok('completion screen shown', done.shown, done);
    ok('0 non-platform pageErrors across the full playthrough', errs.length === 0, errs.slice(0, 4));
    await pg.close();
  }

  await b.close();
  await new Promise(r => srv.close(r));
  console.log(pass ? '\n*** A+ VM SETUP CHECK OK ***' : '\n*** A+ VM SETUP CHECK FAILED ***');
  process.exit(pass ? 0 : 1);
})();
