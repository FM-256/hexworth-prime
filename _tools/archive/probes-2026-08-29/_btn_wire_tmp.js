// Same check, but in the state that exposed the last mistake: terminal EMBEDDED.
const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setRequestInterception(true);
  p.on('request', (r) => (/AccessGuard\.js/.test(r.url()) ? r.abort() : r.continue()));
  for (const [w, h] of [[1366,768],[1440,900],[1536,864],[1920,1080]]) {
    await p.setViewport({ width: w, height: h });
    await p.goto('http://127.0.0.1:8899/houses/cloud/openstack/labs/cloud-openstack-cinder-live.lab.html', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 350));
    const m = await p.evaluate(() => {
      const dock = document.querySelector('.term-dock');
      const wrap = dock && dock.querySelector('.sandbox-launcher__iframe-wrap');
      if (wrap) { wrap.style.display = ''; }
      const btn = document.getElementById('record-attach');
      const para = [...document.querySelectorAll('p')].find((n) => /Record the attachment/.test(n.textContent));
      para.scrollIntoView({ block: 'center' });
      const br = btn.getBoundingClientRect(), pr = para.getBoundingClientRect(), dr = dock.getBoundingClientRect();
      const at = (r, dx, dy) => { const e = document.elementFromPoint(Math.max(4, r.left + dx), Math.max(4, r.top + dy));
        return e ? e.tagName.toLowerCase() + (e.className ? '.' + String(e.className).split(' ')[0] : '') : null; };
      return { pos: getComputedStyle(dock).position, dockH: Math.round(dr.height),
               share: Math.round(dr.height / window.innerHeight * 100),
               btnVisible: br.bottom > 0 && br.top < window.innerHeight,
               overBtn: at(br, 20, 8), overPara: at(pr, 20, 8) };
    });
    const ok = m.btnVisible && m.overBtn && m.overBtn.startsWith('button') && m.overPara === 'p';
    console.log(`  ${w}x${h}  dock=${m.pos}/${m.dockH}px(${m.share}%)  buttonVisible=${m.btnVisible}  paintedOverButton=${m.overBtn}  paintedOverText=${m.overPara}  ${ok ? 'CLEAR' : 'OBSTRUCTED'}`);
  }
  await b.close();
})();
