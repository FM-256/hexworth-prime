const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setRequestInterception(true);
  p.on('request', (r) => (/AccessGuard\.js/.test(r.url()) ? r.abort() : r.continue()));
  await p.setViewport({ width: 1920, height: 1000 });
  await p.goto('http://127.0.0.1:8899/houses/cloud/openstack/labs/cloud-openstack-security-sprint.lab.html', { waitUntil: 'domcontentloaded' });
  await new Promise(x=>setTimeout(x,500));
  const r = await p.evaluate(() => {
    const steps = [...document.querySelectorAll('.step')];
    const lens = [];
    steps.forEach((s, i) => {
      [...s.querySelectorAll('p')].forEach(q => lens.push({ i, n: q.textContent.trim().length,
        codes: q.querySelectorAll('code').length,
        head: (s.querySelector('h3') || {}).textContent || '(no heading)' }));
    });
    const target = lens.filter(x => /supplied helper|Format only the new empty/.test(
      steps[x.i].textContent) );
    const all = lens.map(x => x.n).sort((a,b)=>a-b);
    const median = all[Math.floor(all.length/2)];
    // does the destructive step carry any visual warning treatment?
    const dest = steps.find(s => /cannot be undone/i.test(s.textContent));
    return { total: lens.length, median, max: all[all.length-1],
             destParas: [...dest.querySelectorAll('p')].map(q => ({ n: q.textContent.trim().length, codes: q.querySelectorAll('code').length })),
             destHasCallout: !!dest.querySelector('.brief, .mode-note, .io'),
             destHeading: (dest.querySelector('h3')||{}).textContent,
             pageCallouts: document.querySelectorAll('.brief, .mode-note').length };
  });
  console.log(`  paragraphs in steps: ${r.total} | median length ${r.median} chars | longest ${r.max}`);
  console.log(`  destructive step: "${r.destHeading}"`);
  r.destParas.forEach((q,i)=>console.log(`    para ${i+1}: ${q.n} chars, ${q.codes} inline code chips`));
  console.log(`  does that step use ANY warning callout? ${r.destHasCallout}  (page has ${r.pageCallouts} callouts elsewhere)`);
  await b.close();
})();
