/*
 * Render a page AS A SORTED STUDENT SEES IT and look for overlapping text.
 *
 * WHY THE FIRST VERSION WAS USELESS: headless had no session, AccessGuard bounced it to
 * the sorting gate, and the probe happily reported "0 overlaps" -- on the welcome page.
 * It was measuring a page the student never sees. Setting hexworth_house before any page
 * script runs is what makes this a real render.
 *
 * WHY THE SECOND VERSION WAS WORSE THAN USELESS (2026-08-02, Nancy):
 * it was wrong in BOTH directions, and I made corner decisions on its output for a day.
 *
 *   FALSE NEGATIVE -- shadow DOM. HexAIButton builds itself via shadowRoot.innerHTML.
 *   `document.querySelectorAll` does not pierce shadow roots, so the probe could not see the
 *   Dr. Hex FAB at all. I moved the achievement toast onto that button on 1,479 pages and the
 *   probe reported those pages CLEAN. A check that cannot see the element cannot fail on it.
 *
 *   FALSE POSITIVE -- wrapped inline elements. getBoundingClientRect() on an inline element
 *   returns the UNION of its line boxes. In `<strong>Objective:</strong> <span>long text that
 *   wraps</span>`, once the span wraps its union rect starts at the paragraph's left edge --
 *   underneath the label -- so label and value "intersect" by a full line height while nothing
 *   visually overlaps. This fires on every label/value pair on the platform and gets worse as
 *   the viewport narrows, which is why text-dense side panels "failed" and monospace terminals
 *   "passed". The fix is to compare individual LINE BOXES via getClientRects().
 *
 *   FALSE POSITIVE -- containers counted as leaves. The old filter was `children.length > 2`,
 *   so any div with one or two element children entered the comparison set carrying a union
 *   rect that covered its children.
 *
 *   FALSE POSITIVE -- inherited invisibility. opacity was read on the element only, so a child
 *   of an opacity:0 parent computed opacity:1 and counted. Same for off-canvas transforms,
 *   which is exactly how .achievement-toast parks itself (opacity:0; translateX(100px)).
 *
 *   UNSTABLE -- animation phase. Sampling getBoundingClientRect() on a page running
 *   achievementGlow/gs-row-flash/rAF canvas loops measures whichever frame you landed on, so
 *   repeat runs disagree. Animations are frozen before measuring.
 *
 * TWO FIXTURES, ALWAYS: run `node overlap-probe.js --self-test` to prove this probe still
 * discriminates -- it must report the planted collision and stay silent on the label/value pair.
 */
const puppeteer = require('puppeteer');
const OUT = process.env.PROBE_OUT ||
  '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/77980b61-f845-464e-b03e-89593a796ebd/scratchpad';

const MIN = 6;   // px of overlap on BOTH axes before it counts

/* Runs in the page. Returns overlaps, spills, and what it could/could not see. */
function collect(MIN) {
  /* Walk light DOM AND every shadow root. The FAB lives in one. */
  const all = [];
  (function walk(root) {
    const els = root.querySelectorAll('*');
    for (const e of els) {
      all.push(e);
      if (e.shadowRoot) walk(e.shadowRoot);
    }
  })(document);

  const TAGS = /^(H1|H2|H3|H4|P|SPAN|LI|CODE|STRONG|A|BUTTON|LABEL|TD|TH)$/;

  /* opacity and off-canvas transforms are INHERITED effects -- check ancestors, and cross
     shadow boundaries via host. */
  const hidden = (e) => {
    let n = e;
    while (n && n.nodeType === 1) {
      const cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return true;
      n = n.parentElement || (n.parentNode && n.parentNode.host) || null;
    }
    return false;
  };

  const els = all.filter(e => {
    if (!TAGS.test(e.tagName)) return false;
    const t = (e.textContent || '').trim();
    if (!t || t.length > 300) return false;
    if (e.children.length > 0) return false;        // TRUE leaves only, not "children <= 2"
    if (hidden(e)) return false;
    const r = e.getBoundingClientRect();
    if (r.width <= 4 || r.height <= 4) return false;
    if (r.right <= 0 || r.bottom <= 0) return false;              // parked off-canvas
    if (r.left >= window.innerWidth || r.top >= document.documentElement.scrollHeight) return false;
    return true;
  });

  /* Line boxes, not the union rect. This is the whole wrapped-inline fix. */
  const boxes = els.map(e => [...e.getClientRects()].filter(r => r.width > 4 && r.height > 4));

  const out = [];
  for (let i = 0; i < els.length; i++) {
    for (let j = i + 1; j < els.length; j++) {
      const a = els[i], b = els[j];
      if (a.contains(b) || b.contains(a)) continue;
      let hit = null;
      for (const ra of boxes[i]) {
        for (const rb of boxes[j]) {
          const ox = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
          const oy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
          if (ox > MIN && oy > MIN) { hit = Math.round(ox) + 'x' + Math.round(oy); break; }
        }
        if (hit) break;
      }
      if (hit) {
        const d = e => e.tagName + '.' + String(e.className || '').split(' ')[0] +
                       ' :: ' + (e.textContent || '').trim().slice(0, 50);
        out.push({ o: hit, a: d(a), b: d(b) });
      }
    }
  }

  const spills = els.filter(e => e.scrollWidth > e.clientWidth + 8)
    .map(e => e.tagName + '.' + String(e.className || '').split(' ')[0] +
              ' :: ' + (e.textContent || '').trim().slice(0, 50));

  return {
    gated: /WELCOME, EXPLORER|Sorting Quiz/i.test(document.body.innerText || ''),
    title: document.title,
    overlaps: out.slice(0, 12), n: out.length,
    spills: spills.slice(0, 6),
    bodyOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
    considered: els.length,
    shadowHosts: all.filter(e => e.shadowRoot).length
  };
}

async function probe(browser, url, vp, label) {
  const page = await browser.newPage();
  await page.setViewport({ width: vp.w, height: vp.h });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem('hexworth_house', 'cloud');   // AccessGuard.require('sorted')
      localStorage.setItem('hexworth_theme', 'cloud');
    } catch (e) {}
  });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));
  /* Freeze motion so two runs of the same page agree. Injected AFTER load so page CSS
     cannot override it, and it carries !important. */
  await page.addStyleTag({ content:
    '*,*::before,*::after{animation:none!important;transition:none!important;' +
    'animation-duration:0s!important;transition-duration:0s!important}' });
  await new Promise(r => setTimeout(r, 250));
  let info = await page.evaluate(collect, MIN);

  /* DEEPER PASS: sample SCROLLED state too, not just scroll-top.
     Floating panels are pinned to the viewport (or to body) while page content moves past them,
     so an element that clears a panel at rest can sit under it once scrolled. Measured case:
     cloud-aws-sts scrolls inside #game-container (body is height:100vh/overflow:hidden) and at
     scrollTop 328 two HUD readouts sat under the leaderboard band that were clear at 0.
     A probe that only ever looks at scroll 0 reports those pages clean. Scrolls the window AND
     any internal overflow region, since fixed-viewport games scroll inside a div. */
  if (process.env.PROBE_SCROLL !== 'off') {
    const positions = await page.evaluate(() => {
      const regions = [document.scrollingElement, ...document.querySelectorAll('*')].filter(e => {
        if (!e) return false;
        const cs = e === document.scrollingElement ? null : getComputedStyle(e);
        if (cs && !/auto|scroll/.test(cs.overflowY)) return false;
        return e.scrollHeight > e.clientHeight + 40;
      });
      return regions.slice(0, 3).map(e => e.scrollHeight - e.clientHeight);
    });
    for (const frac of [0.35, 0.75]) {
      if (!positions.length) break;
      await page.evaluate((f) => {
        const regions = [document.scrollingElement, ...document.querySelectorAll('*')].filter(e => {
          if (!e) return false;
          const cs = e === document.scrollingElement ? null : getComputedStyle(e);
          if (cs && !/auto|scroll/.test(cs.overflowY)) return false;
          return e.scrollHeight > e.clientHeight + 40;
        });
        regions.slice(0, 3).forEach(e => { e.scrollTop = (e.scrollHeight - e.clientHeight) * f; });
      }, frac);
      await new Promise(r => setTimeout(r, 350));
      const scrolled = await page.evaluate(collect, MIN);
      if (scrolled.n > info.n) {
        info = scrolled;
        info.scrolledAt = frac;
      }
    }
  }

  const slug = (label || url.split('/').pop().split('.')[0] || 'page').replace(/[^a-z0-9-]/gi, '_');
  await page.screenshot({ path: `${OUT}/overlap-${slug}-${vp.n}.png`, fullPage: true });
  await page.close();
  return info;
}

/* ── the two fixtures ─────────────────────────────────────────────────────────
   One MUST flag, one MUST NOT. A probe that only ever passes is not a gate. */
const FIXTURE_BAD = `<!doctype html><meta charset=utf-8><title>fixture-bad</title>
<body style="margin:0;font:16px sans-serif">
  <div style="position:relative;height:300px">
    <p style="position:absolute;top:40px;left:40px;margin:0">Your AWS bill is $847</p>
    <span style="position:absolute;top:44px;left:52px">HIGH SCORES</span>
  </div>
  <hex-fixture></hex-fixture>
  <script>
    // a real overlap hidden inside a SHADOW ROOT -- the old probe was blind to this
    const h=document.querySelector('hex-fixture'), s=h.attachShadow({mode:'open'});
    s.innerHTML='<div style="position:fixed;bottom:24px;right:24px;width:64px;height:64px">'
      +'<button style="width:64px;height:64px">ASK</button></div>'
      +'<span style="position:fixed;bottom:30px;right:30px">UNLOCKED</span>';
  <\/script>
</body>`;

const FIXTURE_GOOD = `<!doctype html><meta charset=utf-8><title>fixture-good</title>
<body style="margin:0;font:16px sans-serif">
  <!-- label + WRAPPED value: the exact shape that produced the phantom flags -->
  <div style="width:240px;padding:20px">
    <p><strong>Objective:</strong> <span>Simple group membership chain that wraps across
       several lines so its union rect starts under the label</span></p>
    <p><strong>Hint:</strong> <span>Select MemberOf edges and keep going until the text
       wraps again onto another line</span></p>
  </div>
</body>`;

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });

  if (process.argv.includes('--self-test')) {
    let fail = 0;
    for (const [name, html, mustFlag] of [['BAD (planted collision + shadow DOM)', FIXTURE_BAD, true],
                                          ['GOOD (label + wrapped value)', FIXTURE_GOOD, false]]) {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 900 });
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const info = await page.evaluate(collect, MIN);
      await page.close();
      const ok = mustFlag ? info.n > 0 : info.n === 0;
      if (!ok) fail++;
      console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: overlaps=${info.n} ` +
                  `(expected ${mustFlag ? '>0' : '0'}), considered=${info.considered}, ` +
                  `shadowHosts=${info.shadowHosts}`);
      info.overlaps.forEach(o => console.log(`        [${o.o}] ${o.a} vs ${o.b}`));
    }
    await browser.close();
    console.log(fail ? `\nSELF-TEST FAILED (${fail}) -- do NOT trust this probe's output.`
                     : '\nSELF-TEST PASSED -- probe discriminates in both directions.');
    process.exit(fail ? 1 : 0);
  }

  const URL = process.argv[2] ||
    'https://hexworth.com/houses/cloud/openstack/labs/cloud-openstack-rescue-live.lab.html';
  /* Viewports are overridable so a re-run can sweep a DISJOINT window instead of repeating the
     same five widths. A clean result on the widths you pinned is a cherry-pick, not a measurement
     -- a right-anchored element can clear a viewport-anchored one at 1600 and collide at 1280,
     which is exactly how the hop help-button hid for a day.
       PROBE_VPS="1440x900,1366x768,360x740" node overlap-probe.js <url> */
  const VPS = process.env.PROBE_VPS
    ? process.env.PROBE_VPS.split(',').map(s => {
        const [w, h] = s.trim().split('x').map(Number);
        return { w, h: h || 900, n: `${w}x${h || 900}` };
      })
    : [{w:1920,h:1080,n:'wide'},{w:1600,h:1000,n:'desktop'},
       {w:1280,h:900,n:'laptop'},{w:1024,h:800,n:'small'},{w:390,h:844,n:'phone'}];

  let total = 0;
  for (const vp of VPS) {
    const info = await probe(browser, URL, vp);
    total += info.n;
    console.log(`--- ${vp.n} ${vp.w}x${vp.h} | gated=${info.gated} | "${info.title.slice(0,50)}"`);
    console.log(`    overlaps=${info.n}  spills=${info.spills.length}  h-scroll=${info.bodyOverflow}` +
                `  considered=${info.considered}  shadowHosts=${info.shadowHosts}`);
    info.overlaps.forEach(o => console.log(`    [${o.o}] ${o.a}\n              vs ${o.b}`));
    info.spills.forEach(s => console.log(`    SPILL ${s}`));
  }
  await browser.close();
  process.exit(total > 0 ? 1 : 0);
})();
