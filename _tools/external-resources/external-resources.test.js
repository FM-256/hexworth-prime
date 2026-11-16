#!/usr/bin/env node
/**
 * external-resources.test.js — the "Free extra practice" card (components/ExternalResources.js) on its hubs.
 *
 * @catalog what    Renders every hub that opts in, desktop and phone: exactly one visible card, the
 * @catalog what    planned link count, every link one of the component's own SEED/CLARK URLs, new tab
 * @catalog what    with noopener, no page errors, no sideways scroll. --live also checks each URL returns 200.
 * @catalog run     node _tools/external-resources/external-resources.test.js [--live]
 * @catalog status  TOOL
 *
 * --live is run by hand (not scheduled yet; taskboard). _app is served from disk; AccessGuard lets everyone in; everything off-site is aborted (except --live).
 */
const fs = require('fs'), path = require('path');
const puppeteer = require(path.join(__dirname, '../../node_modules/puppeteer'));
const APP = path.join(__dirname, '../../_app'), O = 'http://hx.test';
/* the component's own URL table is the source of truth */
const SRC = fs.readFileSync(path.join(APP, 'components/ExternalResources.js'), 'utf8');
const ER = Function('const window={};const document={currentScript:null,querySelector:()=>null,readyState:"complete",getElementById:()=>null};' + SRC.replace(/^\(function \(\) \{/m, '(function () {') + ';return window.ExternalResources;')();
const VERIFIED = new Set(Object.values(ER.LAB).map((l) => ER.SEED + l[1]).concat([ER.CLARK_BROWSE]));
/* every hub page whose tag names a data-hub; expected links = its labs + the browse link */
const HUBS = {};
(function walk(d) { for (const f of fs.readdirSync(d)) { const q = path.join(d, f); if (fs.statSync(q).isDirectory()) { if (!/_archive|node_modules/.test(q)) walk(q); } else if (f === 'index.html') { const m = fs.readFileSync(q, 'utf8').match(/ExternalResources\.js" data-hub="([^"]+)"/); if (m) HUBS[path.relative(path.join(APP, 'houses'), path.dirname(q))] = ER.HUBS[m[1]] ? ER.HUBS[m[1]].labs.length + 1 : -1; } } })(path.join(APP, 'houses'));
(async () => {
  const br = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  let bad = 0;
  for (const [hub, want] of Object.entries(HUBS)) {
    for (const [w, tag] of [[1366, 'desk'], [390, 'phone']]) {
      const p = await br.newPage(); await p.setViewport({ width: w, height: 900 });
      const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 100)));
      await p.setRequestInterception(true);
      p.on('request', (r) => { const u = r.url(); if (!u.startsWith(O)) return r.abort('blockedbyclient'); const q = decodeURIComponent(new URL(u).pathname);
        if (/\/components\/AccessGuard\.js$/.test(q)) return r.respond({ status: 200, contentType: 'application/javascript', body: 'window.AccessGuard=new Proxy({},{get:()=>function(){return true}});' });
        /* TripWire can fire in a headless browser and flip or spin random elements, which made one
           screenshot show an upside-down link (Nancy): it is switched off here and its classes are checked below */
        if (/\/components\/TripWire(Effects)?\.js$/.test(q)) return r.respond({ status: 200, contentType: 'application/javascript', body: '' });
        if (p.__noCard && /\/components\/ExternalResources\.js$/.test(q)) return r.respond({ status: 200, contentType: 'application/javascript', body: '' });
        const f = path.join(APP, q); if (f.startsWith(APP) && fs.existsSync(f) && fs.statSync(f).isFile()) return r.respond({ status: 200, contentType: { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp', '.json': 'application/json' }[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) }); r.respond({ status: 404, body: '' }); });
      await p.goto(O + '/houses/' + hub + '/index.html', { waitUntil: 'load' }); await new Promise((r) => setTimeout(r, 1500));
      const r = await p.evaluate(() => { const c = document.querySelectorAll('#hx-external-resources'); const el = c[0]; if (!el) return { count: 0 }; el.scrollIntoView(); const b = el.getBoundingClientRect(); const links = [...el.querySelectorAll('a')].map((a) => ({ href: a.href, blank: a.target === '_blank' && /noopener/.test(a.rel) }));
        let hidden = false, n = el; while (n && n !== document.body) { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) hidden = true; n = n.parentElement; }
        const tw = [el, ...el.querySelectorAll('*')].some((x) => /\btw-/.test(String(x.className)));
        /* nothing (a fixed bar, an overlay) is drawn over the card's centre (Nancy) */
        const cx = Math.min(b.left + b.width / 2, innerWidth - 2), cy = Math.min(Math.max(b.top + Math.min(b.height / 2, 40), 2), innerHeight - 2);
        const at = document.elementFromPoint(cx, cy);
        const onTop = !!at && (at === el || el.contains(at));
        const pageSW = document.documentElement.scrollWidth;
        /* the SEED credit appears only when SEED Labs are listed */
        const seedCreditOk = /SEED Labs are by/.test(el.textContent) === links.some((l) => /seedsecuritylabs\.org/.test(l.href));
        const pf = document.querySelector('.page-footer'); const beforeFooter = !pf || !!(el.compareDocumentPosition(pf) & Node.DOCUMENT_POSITION_FOLLOWING);
        /* the CARD must fit the window; a page that already scrolls sideways without it is not the card's doing */
        return { count: c.length, w: Math.round(b.width), h: Math.round(b.height), hidden, links, tw, beforeFooter, seedCreditOk, onTop, pageSW, sw: Math.round(b.right), cw: document.documentElement.clientWidth }; });
      /* a page already wider than the window: the card must not make it wider (baseline without the card) */
      let widened = false;
      if (r.pageSW > r.cw + 1) {
        const q = await br.newPage(); q.__noCard = true; await q.setViewport({ width: w, height: 900 }); await q.setRequestInterception(true);
        q.on('request', (rq) => { const u = rq.url(); if (!u.startsWith(O)) return rq.abort('blockedbyclient'); const qq = decodeURIComponent(new URL(u).pathname);
          if (/\/components\/(AccessGuard|TripWire|TripWireEffects|ExternalResources)\.js$/.test(qq)) return rq.respond({ status: 200, contentType: 'application/javascript', body: /AccessGuard/.test(qq) ? 'window.AccessGuard=new Proxy({},{get:()=>function(){return true}});' : '' });
          const f = path.join(APP, qq); if (f.startsWith(APP) && fs.existsSync(f) && fs.statSync(f).isFile()) return rq.respond({ status: 200, contentType: { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css' }[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) }); rq.respond({ status: 404, body: '' }); });
        await q.goto(O + '/houses/' + hub + '/index.html', { waitUntil: 'load' }); await new Promise((res) => setTimeout(res, 1500));
        const base = await q.evaluate(() => document.documentElement.scrollWidth); await q.close();
        widened = r.pageSW > base + 1;
        console.log('note ' + hub + ' ' + tag + ': page already ' + base + 'px wide at ' + w + 'px without the card; with it ' + r.pageSW + 'px' + (widened ? ' (WIDENED)' : ''));
      }
      const okLinks = r.links && r.links.every((l) => VERIFIED.has(l.href) && l.blank);
      const ok = r.count === 1 && !r.hidden && r.h > 50 && r.links.length === want && okLinks && errs.length === 0 && r.sw <= r.cw + 1 && !r.tw && r.beforeFooter && r.seedCreditOk && r.onTop && !widened;
      if (!ok) bad++;
      if (tag === 'desk' || !ok) console.log((ok ? 'ok  ' : 'FAIL') + ' ' + hub.padEnd(32) + tag.padEnd(6) + ' cards=' + r.count + ' links=' + (r.links || []).length + '/' + want + ' allVerifiedNewTab=' + okLinks + ' size=' + r.w + 'x' + r.h + ' hidden=' + r.hidden + ' cardOverflow=' + (r.sw > r.cw + 1) + ' tripwire=' + r.tw + ' onTop=' + r.onTop + ' beforeFooter=' + r.beforeFooter + (errs.length ? ' ERR ' + errs.join('|') : ''));
      await p.close();
    }
  }
  if (process.argv.includes('--live')) {
    for (const u of VERIFIED) { let st = 'ERR'; try { st = (await fetch(u, { redirect: 'follow' })).status; } catch (e) {} if (st !== 200) bad++; console.log((st === 200 ? 'ok  ' : 'FAIL') + ' live ' + st + ' ' + u); }
  }
  console.log('external-resources: ' + Object.keys(HUBS).length + ' hubs x 2 widths, ' + (bad ? bad + ' failed' : '0 failed'));
  process.exit(bad ? 1 : 0);
  await br.close();
})();
