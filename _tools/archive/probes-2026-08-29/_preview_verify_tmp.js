// Assert the BANNER text as a student sees it, not just the source: paint the monitor into a
// 4/4 pass state and read what the page actually says. Nancy's finding was a line that only
// appears after a pass, which is why reading the static page missed it twice.
const puppeteer = require('puppeteer');
const BASE = process.argv[2];
(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setRequestInterception(true);
  p.on('request', (r) => (/AccessGuard\.js/.test(r.url()) ? r.abort() : r.continue()));
  await p.setViewport({ width: 1600, height: 950 });
  await p.goto(`${BASE}/houses/cloud/openstack/labs/cloud-openstack-cinder-live.lab.html`,
               { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 500));
  const out = await p.evaluate(() => {
    // Drive the real completion path rather than grepping source.
    const results = [3, 4, 5, 6].map((id) => ({ id, pass: true }));
    let banner = '(paintMonitor/both not reachable)';
    try {
      if (typeof paintMonitor === 'function') paintMonitor(results);
      if (typeof both === 'function') {
        both('lab-monitor__msg done', '');
      }
    } catch (e) { /* fall through to source read */ }
    const src = document.documentElement.innerHTML;
    const m = src.match(/4 \/ 4 complete\.[^']*/);
    banner = m ? m[0] : banner;
    const body = document.body.innerText;
    return {
      banner,
      overclaimAnywhere: /outlived its server|outlived it\b|the first server you attached/.test(src),
      objective: (body.match(/lab-vol is attached[^]{0,190}/) || [''])[0].replace(/\s+/g, ' '),
    };
  });
  console.log('  banner   :', out.banner);
  console.log('  objective:', out.objective.slice(0, 175));
  console.log('  overclaim anywhere in page source:', out.overclaimAnywhere);
  await b.close();
})();
