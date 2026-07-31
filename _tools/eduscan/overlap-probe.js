/*
 * Render a lab AS A SORTED STUDENT SEES IT and look for overlapping text.
 *
 * WHY THE FIRST VERSION WAS USELESS: headless had no session, AccessGuard bounced it to
 * the sorting gate, and the probe happily reported "0 overlaps" -- on the welcome page.
 * It was measuring a page the student never sees. Setting hexworth_house before any page
 * script runs is what makes this a real render.
 */
const puppeteer = require('puppeteer');
const URL = process.argv[2] || 'https://hexworth.com/houses/cloud/openstack/labs/cloud-openstack-rescue-live.lab.html';
const OUT = '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/77980b61-f845-464e-b03e-89593a796ebd/scratchpad';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-dev-shm-usage'] });
  for (const vp of [{w:1600,h:1000,n:'desktop'},{w:1280,h:900,n:'laptop'},{w:1024,h:800,n:'small'}]) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.w, height: vp.h });
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('hexworth_house', 'cloud');   // AccessGuard.require('sorted')
      localStorage.setItem('hexworth_theme', 'cloud');
    });
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 2000));

    const info = await page.evaluate(() => {
      const gated = /WELCOME, EXPLORER|Sorting Quiz/i.test(document.body.innerText || '');
      const els = [...document.querySelectorAll('h1,h2,h3,h4,p,span,li,code,strong,a,button,div')]
        .filter(e => {
          const t = (e.textContent||'').trim();
          if (!t || t.length > 300) return false;
          if (e.children.length > 2) return false;          // leaf-ish only
          const cs = getComputedStyle(e);
          if (cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0) return false;
          const r = e.getBoundingClientRect();
          return r.width>4 && r.height>4;
        });
      const out = [];
      for (let i=0;i<els.length;i++) for (let j=i+1;j<els.length;j++) {
        const a=els[i],b=els[j];
        if (a.contains(b)||b.contains(a)) continue;
        const ra=a.getBoundingClientRect(), rb=b.getBoundingClientRect();
        const ox=Math.min(ra.right,rb.right)-Math.max(ra.left,rb.left);
        const oy=Math.min(ra.bottom,rb.bottom)-Math.max(ra.top,rb.top);
        if (ox>6&&oy>6) out.push({o:Math.round(ox)+'x'+Math.round(oy),
          a:a.tagName+'.'+String(a.className||'').split(' ')[0]+' :: '+(a.textContent||'').trim().slice(0,50),
          b:b.tagName+'.'+String(b.className||'').split(' ')[0]+' :: '+(b.textContent||'').trim().slice(0,50)});
      }
      const spills = els.filter(e=>e.scrollWidth>e.clientWidth+8)
        .map(e=>e.tagName+'.'+String(e.className||'').split(' ')[0]+' :: '+(e.textContent||'').trim().slice(0,50));
      const bodyOverflow = document.documentElement.scrollWidth > window.innerWidth + 2;
      return { gated, title: document.title, overlaps: out.slice(0,10), n: out.length,
               spills: spills.slice(0,6), bodyOverflow };
    });
    console.log(`--- ${vp.n} ${vp.w}x${vp.h} | gated=${info.gated} | "${info.title.slice(0,50)}"`);
    console.log(`    overlaps=${info.n}  spills=${info.spills.length}  h-scroll=${info.bodyOverflow}`);
    info.overlaps.forEach(o=>console.log(`    [${o.o}] ${o.a}\n              vs ${o.b}`));
    info.spills.forEach(s=>console.log(`    SPILL ${s}`));
    await page.screenshot({ path: `${OUT}/rescue-${vp.n}.png`, fullPage: true });
    await page.close();
  }
  await browser.close();
})();
