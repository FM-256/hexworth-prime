#!/usr/bin/env node
/* ============================================================================
   labkit/lab-qc.mjs  —  Gold-Standard Lab QC Harness
   ----------------------------------------------------------------------------
   Mechanizes the "definition of done" for a self-contained Shield/Security+
   lab (the Access Control Architect pattern): a REAL engine, full-bleed, zero
   console errors, score-gated completion, EduScan-clean.

   Usage:
     node _tools/labkit/lab-qc.mjs _tools/labkit/configs/<lab>.qc.mjs
     node _tools/labkit/lab-qc.mjs --all          # run every config

   A per-lab config (see configs/*.qc.mjs) exports default:
     {
       lab:          'houses/shield/labs/<file>.lab.html',   // path under _app/
       moduleId:     'shield-...-lab',                       // expected completeModule id
       solve:        () => { ... },   // page-context: drive the lab to PASS state
       wrong:        () => { ... },   // page-context: drive to a NON-passing state
       certifiedWhen:() => boolean,   // page-context: true when the lab certifies
       engineTest?:  () => ({ok, detail}), // node-context: prove engine correctness/discrimination
       skipStubs?:   [/regex/],       // component scripts to SERVE instead of stub (real engines)
     }

   Exit code 0 = PASS, 1 = FAIL. Scope: self-contained single-file labs whose
   logic is inline (not BoxEngine config.js arena boxes).
   ============================================================================ */

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..', '..');
const APP  = path.join(REPO, '_app');

// resolve puppeteer from the repo's node_modules (createRequire walks up from here)
const require = (await import('module')).createRequire(path.join(REPO, 'package.json'));
const puppeteer = require('puppeteer');

const MIME = { '.html':'text/html', '.js':'application/javascript', '.mjs':'application/javascript',
  '.css':'text/css', '.json':'application/json', '.webp':'image/webp', '.svg':'image/svg+xml',
  '.png':'image/png', '.jpg':'image/jpeg', '.ico':'image/x-icon' };

// Platform chrome we stub so a self-contained lab runs headless without auth/Firebase.
function stubFor(url) {
  if (/AccessGuard\.js/.test(url))        return 'window.AccessGuard={require:function(){}};';
  if (/AchievementManager\.js/.test(url)) return 'window.AchievementManager={unlock:function(){},award:function(){}};';
  if (/ModuleProgress\.js/.test(url))     return 'window.ModuleProgress={isCompleted:function(){return false;},complete:function(){},trackVisit:function(){},getCompleted:function(){return[];}};';
  if (/ProgressSystem\.js/.test(url))     return 'window.ProgressManager={completeModule:function(h,i,t){window.__qcCompleted=[h,i,t];}};';
  if (/(HexAIButton|FirebaseAuth|TenantShell|TenantRouter|ContentDiscovery|GlobalSearch)\.js/.test(url)) return '';
  return null;
}

const C = { g:'\x1b[32m', r:'\x1b[31m', y:'\x1b[33m', d:'\x1b[2m', x:'\x1b[0m', b:'\x1b[1m' };
// Print one PASS/FAIL/WARN result row to the console (ok===null renders WARN).
// Returns `ok` so callers can fold it into a running `ok = line(...) && ok` chain.
function line(ok, label, detail) {
  const mark = ok===true ? `${C.g}PASS${C.x}` : ok===false ? `${C.r}FAIL${C.x}` : `${C.y}WARN${C.x}`;
  console.log(`   [${mark}] ${label}${detail?`  ${C.d}${detail}${C.x}`:''}`);
  return ok;
}

// ---- EduScan-style static checks (mirror the rules that bit us) -------------
// Run the source-text checks that mirror the EduScan rules a lab must pass:
// recognizable back nav (NAV-001), no position:fixed (HEUR-008), no emoji,
// and no narrow centered column. Returns [label, pass, detail?] rows.
function staticChecks(src) {
  const out = [];
  // NAV-001: recognizable back/return navigation
  const navOk = /class\s*=\s*["'][^"']*\b(back-btn|back-link|nav-back|back-button|return-btn|return-link)\b/i.test(src)
    || /href\s*=\s*["'][^"']*(\.\.\/index\.html|\.\.\/\.\.\/index\.html|dashboard\.html)/i.test(src)
    || /(Return to|Go\s*Back|Exit\s*Lab|&larr;\s*\w|←\s*\w)/i.test(src);
  out.push(['NAV-001 back navigation recognized', navOk]);
  // Critical Rule #5 / HEUR-008: no position:fixed
  out.push(['HEUR-008 no position:fixed', !/position\s*:\s*fixed/i.test(src)]);
  // Critical Rule #2: no emoji — mirror EduScan's exact emoji.js codepoint set
  const EMOJI_RE = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{2B50}\u{2692}-\u{2699}\u{FE00}-\u{FE0F}\u{200D}\u{2702}-\u{27B0}\u{1FA00}-\u{1FAFF}\u{231A}-\u{231B}\u{23E9}-\u{23FA}\u{2934}-\u{2935}]/gu;
  const emoji = src.match(EMOJI_RE);
  out.push(['No emoji (EduScan rule)', !emoji, emoji?`found ${[...new Set(emoji)].join(' ')}`:'']);
  // HEUR-035: no literal em-dash (U+2014) in content (operator style; the &mdash; entity is fine)
  const contentOnly = src.replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<script[\s\S]*?<\/script>/gi,'');
  const emdash = (contentOnly.match(/—/g)||[]).length;
  out.push(['HEUR-035 no literal em-dash', emdash===0, emdash?`${emdash} found (use commas, or the &mdash; entity)`:'']);
  // (full-bleed is verified at runtime by content-width ratio, not by regex)
  return out;
}

// Run the full QC suite for one lab config: static checks, optional engine
// correctness test, then a headless pass (zero console errors, no overflow,
// correct solution certifies + fires completion, wrong solution is rejected).
// Returns true only if every check passes.
async function runLab(cfg) {
  const labPath = path.join(APP, cfg.lab);
  if (!fs.existsSync(labPath)) { console.log(`${C.r}missing lab file: ${cfg.lab}${C.x}`); return false; }
  const src = fs.readFileSync(labPath, 'utf8');
  console.log(`\n${C.b}● ${cfg.lab}${C.x}`);

  let ok = true;
  // 1) static / EduScan-style
  console.log(`  ${C.d}static checks${C.x}`);
  for (const [label, pass, detail] of staticChecks(src)) ok = line(pass, label, detail) && ok;

  // 1b) engine correctness (node-side, lab-specific)
  if (typeof cfg.engineTest === 'function') {
    try { const r = await cfg.engineTest(); ok = line(!!r.ok, 'Engine correctness + discrimination', r.detail) && ok; }
    catch (e) { ok = line(false, 'Engine correctness + discrimination', e.message) && ok; }
  } else line(null, 'Engine correctness', 'no engineTest provided');

  // 2) headless browser
  const browser = await puppeteer.launch({ headless:'new', args:['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width:1440, height:1600 });
    const errors = [];
    page.on('console', m => { if (m.type()==='error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push('PAGEERROR: '+e.message));
    await page.setRequestInterception(true);
    page.on('request', req => {
      const u = req.url();
      const keepReal = (cfg.skipStubs||[]).some(rx => rx.test(u));
      if (!keepReal) { const s = stubFor(u); if (s!==null) return req.respond({status:200, contentType:'application/javascript', body:s}); }
      // serve from _app
      let rel = decodeURIComponent(u.replace(/^https?:\/\/[^/]+/, '').split('?')[0].split('#')[0]);
      const fp = path.join(APP, rel);
      if (fp.startsWith(APP) && fs.existsSync(fp) && fs.statSync(fp).isFile())
        return req.respond({status:200, contentType:MIME[path.extname(fp)]||'application/octet-stream', body:fs.readFileSync(fp)});
      return req.respond({status:404, body:'not found'});
    });

    await page.goto('http://localhost/'+cfg.lab, { waitUntil:'load', timeout:20000 });
    await new Promise(r => setTimeout(r, 600));

    // 3) no console errors
    ok = line(errors.length===0, 'Zero console errors', errors.slice(0,3).join(' | ')) && ok;

    // 4) full-bleed, no horizontal overflow at desktop + reflow width
    for (const w of [1440, 1100]) {
      await page.setViewport({ width:w, height:1400 });
      await new Promise(r => setTimeout(r, 150));
      const of = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      ok = line(of <= 2, `No horizontal overflow @ ${w}px`, of>2?`overflow ${of}px`:'') && ok;
    }
    await page.setViewport({ width:1440, height:1600 });
    await new Promise(r => setTimeout(r, 150));

    // 4b) full-bleed: the widest visible top-level block must span most of the
    // viewport (catches the banned narrow centered column without false-flagging
    // inner readability widths like a centered confirmation paragraph)
    const ratio = await page.evaluate(() => {
      const kids = [...document.body.children].filter(el => {
        const cs = getComputedStyle(el);
        return cs.position !== 'fixed' && cs.position !== 'absolute' &&
               el.tagName !== 'SCRIPT' && el.offsetParent !== null;
      });
      let best = 0;
      kids.forEach(el => { best = Math.max(best, el.getBoundingClientRect().width); });
      return best / window.innerWidth;
    });
    ok = line(ratio >= 0.7, 'Full-bleed (content spans viewport)', `widest block ${(ratio*100).toFixed(0)}% of viewport`) && ok;

    // 5) solve -> certifies + completion fires with correct moduleId
    await page.evaluate(cfg.solve);
    await new Promise(r => setTimeout(r, cfg.solveWaitMs || 11000));
    const solved = await page.evaluate(cfg.certifiedWhen);
    const completed = await page.evaluate(() => window.__qcCompleted || null);
    ok = line(solved===true, 'Correct solution certifies', solved?'':'cert did not show') && ok;
    // ProgressManager.completeModule(moduleId, houseId, type) — moduleId is arg0
    const idOk = completed && completed[0] === cfg.moduleId;
    ok = line(!!idOk, 'Completion fires with right moduleId',
      completed ? `completeModule(${completed.join(', ')})` : 'completeModule not called') && ok;

    // 6) wrong -> does NOT certify / complete  (fresh load)
    await page.evaluate(() => { try { localStorage.clear(); } catch(e){} window.__qcCompleted=null; });
    await page.goto('http://localhost/'+cfg.lab, { waitUntil:'load', timeout:20000 });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(cfg.wrong);
    await new Promise(r => setTimeout(r, cfg.solveWaitMs || 11000));
    const wrongCert = await page.evaluate(cfg.certifiedWhen);
    const wrongDone = await page.evaluate(() => window.__qcCompleted || null);
    ok = line(wrongCert===false && !wrongDone, 'Wrong solution is rejected (no false pass)',
      wrongCert?'certified anyway!':wrongDone?'completed anyway!':'') && ok;

  } finally { await browser.close(); }

  console.log(`  ${ok?C.g+C.b+'▲ LAB PASS':C.r+C.b+'▼ LAB FAIL'}${C.x}`);
  return ok;
}

// ---- main -------------------------------------------------------------------
const args = process.argv.slice(2);
let configs = [];
if (args[0] === '--all') {
  const dir = path.join(__dirname, 'configs');
  configs = fs.readdirSync(dir).filter(f=>f.endsWith('.qc.mjs')).map(f=>path.join(dir, f));
} else if (args[0]) {
  configs = [path.resolve(args[0])];
} else {
  console.log('usage: node _tools/labkit/lab-qc.mjs <config.qc.mjs> | --all');
  process.exit(2);
}

console.log(`${C.b}Gold-Standard Lab QC${C.x}  ${C.d}(${configs.length} lab${configs.length>1?'s':''})${C.x}`);
let allOk = true;
for (const c of configs) {
  const cfg = (await import(pathToFileURL(c).href)).default;
  allOk = await runLab(cfg) && allOk;
}
console.log(`\n${allOk?C.g+C.b+'━━ ALL LABS PASS ━━':C.r+C.b+'━━ FAILURES ABOVE ━━'}${C.x}`);
process.exit(allOk ? 0 : 1);
