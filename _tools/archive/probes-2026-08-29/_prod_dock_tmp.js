// Production dock + dash verification, in a real browser.
const puppeteer = require('puppeteer');
const PAGES = ['cinder-live','launch-chain-live','neutron-live','secgroup-live',
               'rescue-live','project-iac','console','security-sprint'];
(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setRequestInterception(true);
  p.on('request', (r) => (/AccessGuard\.js/.test(r.url()) ? r.abort() : r.continue()));
  await p.setViewport({ width: 1600, height: 950 });
  let bad = 0;
  for (const n of PAGES) {
    const r = await p.goto(`https://hexworth.com/houses/cloud/openstack/labs/cloud-openstack-${n}.lab.html`,
                           { waitUntil: 'domcontentloaded' });
    await new Promise((x) => setTimeout(x, 350));
    const m = await p.evaluate(() => {
      const d = document.querySelector('.term-dock');
      const st = [...document.querySelectorAll('.step')];
      if (!d) return { none: true };
      const before = st.length ? d.getBoundingClientRect().top < st[0].getBoundingClientRect().top : null;
      const pos = getComputedStyle(d).position;
      let vis = null;
      if (st.length) { st[st.length-1].scrollIntoView({block:'center'});
        const q = d.getBoundingClientRect(); vis = q.bottom>0 && q.top<window.innerHeight; }
      return { before, pos, vis, mdash: (document.documentElement.innerHTML.match(/&mdash;|—/g)||[]).length };
    });
    const ok = !m.none && m.before !== false && m.pos === 'sticky' && m.vis !== false;
    if (!ok) bad++;
    console.log(`  ${n.padEnd(20)} ${r.status()} ${(ok?'DOCKED':'PROBLEM').padEnd(8)}` +
                `above=${m.before} sticky=${m.pos==='sticky'} visible-at-end=${m.vis} em-dashes=${m.mdash}`);
  }
  console.log(`  ${bad === 0 ? 'ALL 8 DOCKED ON PRODUCTION' : bad + ' PAGE(S) BROKEN'}`);
  await b.close();
})();
