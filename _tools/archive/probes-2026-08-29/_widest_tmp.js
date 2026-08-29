const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setRequestInterception(true);
  p.on('request', (r) => (/AccessGuard\.js/.test(r.url()) ? r.abort() : r.continue()));
  await p.setViewport({ width: 1920, height: 1080 });
  await p.goto('http://127.0.0.1:8899/houses/cloud/openstack/labs/cloud-openstack-security-sprint.lab.html', { waitUntil: 'domcontentloaded' });
  await new Promise((x) => setTimeout(x, 500));
  const rows = await p.evaluate(() => {
    const out = [];
    const walk = (n) => {
      if (n.nodeType === 3 && n.textContent.trim().length > 30) {
        const rg = document.createRange(); rg.selectNodeContents(n);
        for (const r of rg.getClientRects()) {
          if (r.width > 700) {
            const el = n.parentElement;
            const fs = parseFloat(getComputedStyle(el).fontSize);
            out.push({ w: Math.round(r.width), ch: Math.round(r.width / (fs * 0.5)),
                       cls: el.className || el.tagName, mono: /Consolas|monospace/.test(getComputedStyle(el).fontFamily),
                       txt: n.textContent.trim().slice(0, 42) });
          }
        }
      }
      for (const c of n.childNodes) walk(c);
    };
    walk(document.body);
    return out.sort((a,b)=>b.w-a.w).slice(0, 6);
  });
  for (const r of rows) console.log(`  ${String(r.w).padStart(4)}px ~${String(r.ch).padStart(3)}ch mono=${r.mono?'yes':'no '} <${r.cls}> "${r.txt}"`);
  await b.close();
})();
