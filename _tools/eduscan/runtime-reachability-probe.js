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
    let rendered = null;
    try {
      const resp = await p.goto(BASE + hub, { waitUntil: 'networkidle0', timeout: 25000 });
      if (resp && resp.status() < 400) {
        await new Promise(r => setTimeout(r, 900));   // let catalog projection paint
        rendered = await p.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')));
      }
    } catch (e) { rendered = null; }
    await p.close();
    if (rendered === null) { rows.push({ house, hub, total: cands.length, hit: null }); continue; }
    const set = new Set(rendered.map(norm));
    let hit = 0;
    for (const c of cands) {
      const abs = norm('/houses/' + house + '/' + c.href);
      if (set.has(abs) || set.has(norm(c.href))) hit++;
    }
    rows.push({ house, hub, total: cands.length, hit, anchors: rendered.length });
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
