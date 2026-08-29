const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setRequestInterception(true);
  p.on('request', (r) => (/AccessGuard\.js/.test(r.url()) ? r.abort() : r.continue()));
  await p.setViewport({ width: 1920, height: 1000 });
  await p.goto('http://127.0.0.1:8899/houses/cloud/openstack/labs/cloud-openstack-security-sprint.lab.html', { waitUntil: 'domcontentloaded' });
  await new Promise(x=>setTimeout(x,500));
  const ok = await p.evaluate(() => {
    const el = [...document.querySelectorAll('.step')].find(s => /cannot be undone|mkfs on the wrong device/i.test(s.textContent));
    if (!el) return false;
    // put the step at the TOP of the viewport so the whole thing is in frame
    window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - 30);
    return true;
  });
  if (!ok) { console.log('  step not found'); await b.close(); return; }
  await new Promise(x=>setTimeout(x,400));
  await p.screenshot({ path: '_m2_step1.png' });   // viewport shot, no clip maths
  console.log('  captured');
  await b.close();
})();
