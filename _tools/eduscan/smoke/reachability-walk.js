#!/usr/bin/env node
'use strict';
// CAN A STUDENT ACTUALLY CLICK THEIR WAY TO THIS PAGE?
//
// WHY THIS EXISTS. strict-orphan-scanner.js answers "is this module referenced by a curated hub
// signal", which is a question about MARKUP. It is deliberately strict, and its same-house
// constraint (scanner :359) means a module catalogued under house X but linked from a hub living
// under houses/Y/ is reported as an orphan even when a student can reach it in two clicks.
// That is the right call for the scanner -- loosening it would smuggle in uncurated content --
// but it means its output needs a second, DIFFERENT question asked of it before anyone acts:
//
//     not "is it curated?" but "starting from a hub, can I get there by clicking?"
//
// This walks real anchors in a real browser, following the same path a student would. It is the
// difference between a genuine orphan (the Stage 4 capstone: built, QC-harnessed, and linked from
// nothing -- found 2026-08-01) and a scanner false positive.
//
// It does NOT replace the scanner. A page reachable only via a link buried three levels down is
// still badly curated; this just stops "orphan" being reported as "unreachable" when it is not.
//
// usage:
//   BASE=https://hexworth.com node reachability-walk.js <startPath> <targetSubstring> [depth]
// e.g.
//   BASE=https://hexworth.com node reachability-walk.js /houses/aws-ccp/index.html cloud-ch09-database-services 2
const puppeteer = require('puppeteer');

const BASE = process.env.BASE;
const START = process.argv[2];
const TARGET = process.argv[3];
const MAX_DEPTH = Number(process.argv[4] || 2);

if (!BASE || !START || !TARGET) {
  console.error('usage: BASE=https://... node reachability-walk.js <startPath> <targetSubstring> [depth]');
  process.exit(2);
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  // The house key is injected because AccessGuard would otherwise redirect and we would be
  // measuring the sorting page. This IS handing the browser a key a cold visitor lacks -- fine
  // here, because the question is "can a SORTED student reach it", not "is the gate correct".
  await page.evaluateOnNewDocument(() => { localStorage.setItem('hexworth_house', 'cloud'); });

  const seen = new Set();
  let found = null;

  async function anchorsOn(url) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 });
    await new Promise((r) => setTimeout(r, 1200));   // let runtime-built cards render
    return page.evaluate(() => [...document.querySelectorAll('a[href]')]
      .map((a) => ({ href: a.href, text: (a.textContent || '').trim().slice(0, 60) }))
      .filter((a) => a.href.startsWith(location.origin)));
  }

  // Breadth-first so the reported path is the SHORTEST click path, which is the number that
  // matters pedagogically -- "reachable at depth 4" is a curation problem even though it passes.
  let frontier = [{ url: BASE + START, path: [START] }];
  for (let depth = 0; depth <= MAX_DEPTH && !found; depth++) {
    const next = [];
    for (const node of frontier) {
      if (seen.has(node.url) || found) { continue; }
      seen.add(node.url);
      let links = [];
      try { links = await anchorsOn(node.url); } catch (e) { continue; }
      for (const l of links) {
        if (l.href.includes(TARGET)) {
          found = { path: [...node.path, new URL(l.href).pathname], clicks: node.path.length, text: l.text };
          break;
        }
        if (!seen.has(l.href)) { next.push({ url: l.href, path: [...node.path, new URL(l.href).pathname] }); }
      }
      if (found) { break; }
    }
    frontier = next;
  }

  await browser.close();

  if (found) {
    console.log(`  REACHABLE in ${found.clicks} click(s), link text: "${found.text}"`);
    found.path.forEach((p, i) => console.log(`    ${i === 0 ? 'start' : '  ->'}  ${p}`));
    console.log(`\n  '${TARGET}' is NOT unreachable. If the scanner calls it an orphan, that is a`);
    console.log('  curation-signal finding, not a "students cannot get there" finding.');
  } else {
    console.log(`  NOT REACHABLE from ${START} within ${MAX_DEPTH} click(s).`);
    console.log(`  Pages visited: ${seen.size}. This is a real dead end for a student starting there.`);
  }
  process.exit(found ? 0 : 1);
})().catch((e) => { console.error('WALK ERROR: ' + e.message); process.exit(1); });
