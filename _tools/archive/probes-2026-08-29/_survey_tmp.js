// Measure every lab the way the capstone should have been measured from the start:
// prose line length, command legibility, wasted horizontal space, and whether a launched
// terminal would scroll away from the steps it belongs to.
const puppeteer = require('puppeteer');
const fs = require('fs');
(async () => {
  const dir = process.argv[2];
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html')).sort();
  const b = await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
  const p = await b.newPage();
  await p.setViewport({width:1600, height:900});
  console.log('  lab'.padEnd(42), 'prose', 'cmdFont', 'deadRight', 'pageH', 'termAway');
  for (const f of files) {
    await p.goto('file://' + dir + '/' + f, {waitUntil:'domcontentloaded'});
    await new Promise(r=>setTimeout(r,300));
    const m = await p.evaluate(() => {
      // widest prose line in characters
      let maxChars = 0;
      const probe = document.createElement('span');
      probe.style.cssText='visibility:hidden;position:absolute;white-space:pre';
      document.body.appendChild(probe);
      for (const el of document.querySelectorAll('p, li')) {
        if (el.closest('.cmd') || el.innerText.trim().length < 60) continue;
        const cs = getComputedStyle(el); probe.style.font = cs.font;
        probe.textContent = 'abcdefghijklmnopqrstuvwxyz';
        const cw = probe.getBoundingClientRect().width/26;
        const w = el.getBoundingClientRect().width;
        maxChars = Math.max(maxChars, Math.round(w/cw));
      }
      probe.remove();
      const cmds = Array.from(document.querySelectorAll('.cmd'));
      const fs2 = cmds.length ? getComputedStyle(cmds[0]).fontSize : 'n/a';
      const wrapR = document.querySelector('.wrap')?.getBoundingClientRect().right || 0;
      const els = Array.from(document.querySelectorAll('.card, .cmd'));
      const maxR = els.length ? Math.max(...els.map(e=>e.getBoundingClientRect().right)) : wrapR;
      // would a launched terminal scroll away?
      const wrap = document.querySelector('.sandbox-launcher__iframe-wrap');
      let termAway = 'n/a';
      if (wrap) { const card = wrap.closest('.card');
        termAway = card && getComputedStyle(card).position !== 'sticky' ? 'YES' : 'no'; }
      return { maxChars, fs2, dead: Math.round(wrapR - maxR),
               pageH: document.body.scrollHeight, termAway };
    });
    console.log('  ' + f.replace('cloud-openstack-','').replace('.lab.html','').padEnd(40),
      String(m.maxChars).padStart(5), String(m.fs2).padStart(7), String(m.dead).padStart(9),
      String(m.pageH).padStart(6), String(m.termAway).padStart(8));
  }
  await b.close();
})();
