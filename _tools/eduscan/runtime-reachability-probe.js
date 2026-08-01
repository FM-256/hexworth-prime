#!/usr/bin/env node
'use strict';
// ARE THE "UNREFERENCED" CATALOG ENTRIES ACTUALLY RUNTIME-RENDERED?
//
// catalog-reachability-audit.js greps _app SOURCE for inbound hrefs. Hubs that build their cards
// from the catalog at RUNTIME are invisible to it, so its output is CANDIDATES, not orphans --
// the task file says so explicitly and prior work has already been burned by treating one as the
// other.
//
// This loads each house hub in a browser, lets its JS run, harvests every href in the rendered
// DOM, and asks which candidates appear. One page load per house clears an entire cluster if that
// cluster is runtime-rendered.
//
// IT PROVES REACHABLE, NEVER ORPHANED. An entry that does not appear on its house hub may still be
// reachable one click deeper. So a hit is a definite clear; a miss is STILL A CANDIDATE and is
// reported that way, never as a confirmed orphan.
const fs = require('fs');
const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../node_modules/puppeteer'));
const BASE = process.env.BASE || 'http://127.0.0.1:8901';

const auditPath = process.argv[2];
if (!auditPath) { console.error('usage: node runtime-reachability-probe.js <audit.json>'); process.exit(2); }
const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
const items = audit.unreferenced || [];

// Group candidates by house; each house's hub is the page that would render them.
const byHouse = new Map();
for (const it of items) {
  if (!it.house || !it.href) continue;
  if (!byHouse.has(it.house)) byHouse.set(it.house, []);
  byHouse.get(it.house).push(it);
}

function norm(h) {
  if (!h) return '';
  let s = h.split('#')[0].split('?')[0];
  s = s.replace(/^https?:\/\/[^/]+/, '');
  if (!s.startsWith('/')) s = '/' + s;
  return s.replace(/\/+/g, '/').toLowerCase();
}

(async () => {
  const b = await puppeteer.launch({ args: ['--no-sandbox'] });
  const rows = [];
  for (const [house, cands] of [...byHouse.entries()].sort((a, b2) => b2[1].length - a[1].length)) {
    const hub = `/houses/${house}/index.html`;
    const p = await b.newPage();
    await p.setCacheEnabled(false);
    await p.evaluateOnNewDocument(h => {
      try { localStorage.clear(); sessionStorage.clear(); localStorage.setItem('hexworth_house', h); } catch (e) {}
    }, house);
    // DEPTH-2 CRAWL, not a single page load. v1 loaded only /houses/<house>/index.html and cleared
    // almost nothing -- house index pages are shallow landing pages (33-37 anchors) that link to
    // SUB-hubs, so "not on the house index" is the same thing the static audit already said and
    // proves nothing new. reachability-walk.js asks the right question but one target at a time with
    // a depth-2 BFS each, which is 550 crawls. Crawling once per house and harvesting every anchor
    // seen answers every candidate for that house in one pass: 13 crawls instead of 550.
    let rendered = null;
    const seen = new Set();
    const collected = new Set();
    let frontier = [hub];
    try {
      for (let depth = 0; depth <= 2; depth++) {
        const next = [];
        for (const path of frontier) {
          if (seen.has(path) || seen.size > 60) continue;   // cap: a runaway crawl is not a measurement
          seen.add(path);
          let hrefs = [];
          try {
            const resp = await p.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 20000 });
            if (!resp || resp.status() >= 400) continue;
            await new Promise(r => setTimeout(r, 1200));    // catalog projection paints after DOM ready
            hrefs = await p.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')));
          } catch (e) { continue; }
          for (const h of hrefs) {
            if (!h || /^(javascript:|mailto:|#)/.test(h)) continue;
            const abs = h.startsWith('/') ? h : ('/' + path.split('/').slice(1, -1).join('/') + '/' + h);
            const n = norm(abs);
            collected.add(n);
            // only follow same-origin html deeper
            if (depth < 2 && /\.html?$/.test(n) && n.startsWith('/houses/')) next.push(n);
          }
        }
        frontier = next;
      }
      rendered = collected.size ? [...collected] : null;
    } catch (e) { rendered = null; }
    if (rendered === null) {
      rows.push({ house, hub, total: cands.length, hit: null });
      console.log(`  [${rows.length}/${byHouse.size}] ${house.padEnd(12)} HUB DID NOT LOAD -- unmeasured, NOT clean`);
      continue;
    }
    const set = new Set(rendered.map(norm));
    let hit = 0;
    for (const c of cands) {
      const abs = norm('/houses/' + house + '/' + c.href);
      if (set.has(abs) || set.has(norm(c.href))) hit++;
    }
    rows.push({ house, hub, total: cands.length, hit, anchors: rendered.length, pages: seen.size });
    // Stream per house. Buffering everything until the end made three separate long runs look
    // identical to a hung process -- I checked an empty output file twice and could not tell
    // "still working" from "died". Progress you cannot observe is progress you re-run.
    console.log(`  [${rows.length}/${byHouse.size}] ${house.padEnd(12)} ${String(hit).padStart(4)}/${String(cands.length).padStart(4)} reachable within 2 clicks (${seen.size} pages, ${rendered.length} distinct links)`);
  }
  await b.close();

  let clearedTot = 0, candTot = 0, unknown = 0;
  console.log('');
  console.log('  house         candidates  rendered-on-hub   still candidates');
  for (const r of rows) {
    if (r.hit === null) {
      console.log(`  ${r.house.padEnd(13)} ${String(r.total).padStart(9)}   HUB DID NOT LOAD -- unmeasured`);
      unknown += r.total; continue;
    }
    clearedTot += r.hit; candTot += r.total - r.hit;
    console.log(`  ${r.house.padEnd(13)} ${String(r.total).padStart(9)}   ${String(r.hit).padStart(6)} (${r.anchors} anchors)   ${r.total - r.hit}`);
  }
  console.log('');
  console.log(`  CLEARED (rendered on their house hub) : ${clearedTot}`);
  console.log(`  STILL CANDIDATES (not on the hub)     : ${candTot}   <- may still be reachable one click deeper`);
  console.log(`  UNMEASURED (hub would not load)       : ${unknown}`);
  console.log('  A hit is a definite clear. A miss is NOT a confirmed orphan.');
})();
