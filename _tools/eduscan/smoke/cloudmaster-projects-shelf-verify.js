// Prove it on the LIVE page, not in the database. Firestore holding 3 items and the hub RENDERING
// 3 cards are different claims, and the dedup layer sits between them.
const puppeteer = require('/home/eq/ai-content/hexworth-prime/node_modules/puppeteer');
(async () => {
  const b = await puppeteer.launch({ args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setCacheEnabled(false);
  await p.evaluateOnNewDocument(() => { try { localStorage.setItem('hexworth_house','cloud'); } catch(e){} });
  await p.goto('https://hexworth.com/houses/hub/cloud-master', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await new Promise(r => setTimeout(r, 4000));
  const r = await p.evaluate(() => {
    const out = {};
    document.querySelectorAll('.section').forEach(s => {
      const h = s.querySelector('h2');
      if (!h) return;
      const label = h.querySelector('span') ? h.querySelector('span').textContent : h.textContent;
      const cards = [...s.querySelectorAll('.item')].map(c => ({
        title: (c.querySelector('.t') || {}).textContent,
        clickable: c.tagName === 'A',
      }));
      out[label.trim()] = cards;
    });
    return { sections: Object.keys(out), projects: out['Projects'] || null,
             labCount: (out['Labs'] || []).length,
             capstoneInLabs: (out['Labs'] || []).some(c => /Environment Is Data|Codify/i.test(c.title || '')) };
  });
  await b.close();
  console.log('  sections rendered:', r.sections.join(', '));
  console.log('  Projects shelf:');
  (r.projects || []).forEach(c => console.log('     - ' + c.title + '   clickable=' + c.clickable));
  console.log('  Labs shelf: ' + r.labCount + ' card(s); capstone present there = ' + r.capstoneInLabs);
  const ok = r.projects && r.projects.length === 3;
  console.log('\n  ' + (ok ? 'PASS -- three projects render on the live hub.' : 'FAIL -- projects shelf shows ' + ((r.projects||[]).length)));
})();
