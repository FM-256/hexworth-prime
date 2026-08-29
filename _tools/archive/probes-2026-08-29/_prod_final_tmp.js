// Production verification: the button must EXIST, be VISIBLE with the terminal open, and be
// WIRED. Reading markup proves only the first of those three.
const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setRequestInterception(true);
  p.on('request', (r) => (/AccessGuard\.js/.test(r.url()) ? r.abort() : r.continue()));
  for (const [w,h] of [[1366,768],[1920,1080]]) {
    await p.setViewport({ width: w, height: h });
    const r = await p.goto('https://hexworth.com/houses/cloud/openstack/labs/cloud-openstack-cinder-live.lab.html',
                           { waitUntil: 'domcontentloaded' });
    await new Promise((x) => setTimeout(x, 500));
    const pre = await p.evaluate(() => {
      const wrap = document.querySelector('.term-dock .sandbox-launcher__iframe-wrap');
      if (wrap) wrap.style.display = '';
      const btn = document.getElementById('record-attach');
      const para = [...document.querySelectorAll('p')].find((n) => /Record the attachment/.test(n.textContent));
      if (!btn || !para) return { none: true };
      para.scrollIntoView({ block: 'center' });
      const br = btn.getBoundingClientRect(), pr = para.getBoundingClientRect();
      const at = (rr) => { const e = document.elementFromPoint(Math.max(4, rr.left+20), Math.max(4, rr.top+8));
        return e ? e.tagName.toLowerCase()+(e.className?'.'+String(e.className).split(' ')[0]:'') : null; };
      return { vis: br.bottom>0 && br.top<window.innerHeight, overBtn: at(br), overPara: at(pr),
               stop: [...document.querySelectorAll('.mode-note')].some(n=>/Stop before the last command/.test(n.textContent)),
               msg: (document.getElementById('cinder-monitor-msg')||{}).textContent||'' };
    });
    if (pre.none) { console.log(`  ${w}x${h}: MISSING button/paragraph`); continue; }
    await p.click('#record-attach');
    await new Promise((x)=>setTimeout(x,300));
    const after = await p.evaluate(()=> (document.getElementById('cinder-monitor-msg')||{}).textContent||'');
    console.log(`  ${w}x${h} HTTP ${r.status()}  buttonVisible=${pre.vis}  paintedOverButton=${pre.overBtn}  hardStop=${pre.stop}`);
    console.log(`            click -> ${after!==pre.msg?'WIRED':'DEAD'}: "${after.slice(0,70)}"`);
  }
  await b.close();
})();
