const puppeteer = require('puppeteer');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = require('path').resolve(__dirname, '../../_app');
const MIME = {'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.json':'application/json'};
const srv = http.createServer((req,res)=>{
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('nf'); }
  res.writeHead(200, {'Content-Type': MIME[path.extname(f)] || 'text/plain'});
  res.end(fs.readFileSync(f));
});
(async () => {
  await new Promise(r => srv.listen(8791, r));
  const b = await puppeteer.launch({ headless:'new', args:['--no-sandbox','--disable-dev-shm-usage'] });
  const pg = await b.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  pg.on('console', m => { if (m.type()==='error') errs.push('CONSOLE: ' + m.text().slice(0,140)); });
  await pg.goto('http://127.0.0.1:8791/catalog.html', { waitUntil:'domcontentloaded', timeout:30000 });
  await new Promise(r => setTimeout(r, 4000));
  const out = await pg.evaluate(() => {
    const cards = [...document.querySelectorAll('.cart')];
    return {
      cards: cards.length,
      visible: cards.filter(c => c.style.display !== 'none').length,
      houseBtns: document.querySelectorAll('#filters .filter-btn').length,
      catBtns: document.querySelectorAll('#catfilters .filter-btn').length,
      emptyShown: document.getElementById('empty').style.display,
      hrefs: cards.map(c => c.getAttribute('href')),
      sample: cards.slice(0,4).map(c => c.querySelector('.t')?.textContent)
    };
  });
  // Expectations come from the registry AS THE PAGE LOADED IT, not from a re-parse of the
  // source file. A regex over HubRegistry.js undercounts (indentation varies) and would have
  // reported a false discrepancy against a correct page.
  const audit = await pg.evaluate(() => {
    const all = HubRegistry.all();
    const kids = all.filter(h => h && h.parent).map(h => h.id);
    const hrefs = [...document.querySelectorAll('.cart')].map(c => c.getAttribute('href') || '');
    const leaked = kids.filter(k => hrefs.some(h => h.indexOf('/' + k + '/') !== -1 || h.replace(/\/$/, '').endsWith('/' + k)));
    return { registry: all.length, children: kids.length, leaked: leaked.slice(0, 8) };
  });
  delete out.hrefs;
  console.log(JSON.stringify(out, null, 2));
  console.log('registry entries:', audit.registry, '| entries with a parent:', audit.children);
  console.log(audit.leaked.length ? ('LEAKED CHILDREN: ' + audit.leaked.join(', ')) : 'NO CHILD CARDS RENDERED -- container-grouping filter works');
  console.log('errors:', errs.length ? errs.slice(0,6) : 'none');
  await b.close(); srv.close();
})();
