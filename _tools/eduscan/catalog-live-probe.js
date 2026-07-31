// Renders a DEPLOYED catalog.html (preview channel or production) against REAL Firestore and
// asserts the dynamic-hub merge actually produced a card. The local probe cannot do this:
// ArenaFirebase needs real Firebase, so locally we can only prove the merge FAILS SAFELY.
// Chris blocked the container-grouping change on exactly this gap (2026-07-31).
const puppeteer = require('puppeteer');
const URL = process.argv[2];
if (!URL) { console.error('usage: node catalog-live-probe.js <url>'); process.exit(2); }
(async () => {
  const b = await puppeteer.launch({ headless:'new', args:['--no-sandbox','--disable-dev-shm-usage'] });
  const pg = await b.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  pg.on('console', m => { if (m.type()==='error') errs.push('CONSOLE: ' + m.text().slice(0,160)); });
  await pg.goto(URL, { waitUntil:'domcontentloaded', timeout:45000 });
  // The merge is async (Firestore round-trip); poll rather than fixed-sleep so a slow
  // network does not read as a failure.
  let n = 0;
  for (let i = 0; i < 20; i++) {
    n = await pg.evaluate(() => document.querySelectorAll('.cart').length);
    const has = await pg.evaluate(() => [...document.querySelectorAll('.cart')].some(c => (c.getAttribute('href')||'').includes('cloud-master')));
    if (has) break;
    await new Promise(r => setTimeout(r, 1500));
  }
  const out = await pg.evaluate(() => {
    const cards = [...document.querySelectorAll('.cart')];
    const hrefs = cards.map(c => c.getAttribute('href') || '');
    const kidIds = ['aws-ccp','aws-developer','azure-fundamentals','az-104','cloud-essentials','openstack'];
    return {
      cards: cards.length,
      cloudMasterCard: hrefs.filter(h => h.includes('cloud-master')),
      cloudMasterKidsLeaked: kidIds.filter(k => hrefs.some(h => h.replace(/\/$/,'').endsWith('/' + k) || h.includes('/' + k + '/'))),
      titles: cards.map(c => c.querySelector('.t')?.textContent).filter(t => /cloud|master/i.test(t||''))
    };
  });
  if (process.env.DUMP) {
    const hrefs = await pg.evaluate(() => [...document.querySelectorAll('.cart')].map(c => c.getAttribute('href')));
    require('fs').writeFileSync('/tmp/live-cards.json', JSON.stringify(hrefs));
    console.log('dumped ' + hrefs.length + ' hrefs to /tmp/live-cards.json');
  }
  console.log(JSON.stringify(out, null, 2));
  console.log('page errors:', errs.length ? errs.slice(0,5) : 'none');
  console.log(out.cloudMasterCard.length ? 'DYNAMIC MERGE VERIFIED: a cloud-master card rendered from Firestore'
                                         : 'NO CLOUD-MASTER CARD -- dynamic merge did NOT produce one');
  console.log(out.cloudMasterKidsLeaked.length ? ('CHILDREN LEAKED: ' + out.cloudMasterKidsLeaked.join(', '))
                                               : 'container members correctly hidden');
  await b.close();
})();
