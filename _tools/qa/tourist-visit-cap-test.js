#!/usr/bin/env node
/*
 * @catalog what    Proves the tourist 3-house visit cap actually stops a 4th house.
 * @catalog run     node _tools/qa/tourist-visit-cap-test.js
 * @catalog status  GATE
 *
 * WHY. Mallory, 2026-08-11: the cap was DEAD CODE platform-wide. AccessGuard appends
 * TouristVisa.js asynchronously, every gated page calls AccessGuard.require() synchronously in
 * the next <script> tag, so `typeof TouristVisa !== 'undefined'` was ALWAYS false at check time
 * and the enforcement inside that guard never ran. Not "ran and permitted": never ran. She
 * proved it by exhausting a tourist's 3 visits and browsing four more houses on production with
 * no redirect and no counter movement.
 *
 * This drives real navigations against the real guard. The load-order bug is invisible to any
 * test that calls TouristVisa directly, because calling it proves it works, not that the guard
 * ever reaches it.
 */
const puppeteer = require('puppeteer');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../../_app');
const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css',
               '.json':'application/json', '.webp':'image/webp', '.png':'image/png', '.svg':'image/svg+xml' };
const server = http.createServer((req,res)=>{
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  fs.readFile(path.join(ROOT,p),(e,buf)=>{
    if(e){res.writeHead(404);return res.end('404');}
    res.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});
    res.end(buf);
  });
});
let pass=0,fail=0;
const t=(n,c,d)=>{c?(pass++,console.log('  PASS  '+n+(d?'  -> '+d:''))):(fail++,console.log('  FAIL  '+n+(d?'  -> '+d:'')));};

(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const port=server.address().port, base=`http://127.0.0.1:${port}`;
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox']});
  const p=await b.newPage();
  // A tourist who has already spent all three visits.
  await p.evaluateOnNewDocument(()=>{ try{
    localStorage.setItem('hexworth_tourist_active','true');
    localStorage.setItem('hexworth_tourist_visited', JSON.stringify(['shield','web','code']));
  }catch(e){} });

  // Already-visited houses stay free: revisiting must NOT be charged or blocked.
  await p.goto(`${base}/houses/shield/index.html`,{waitUntil:'domcontentloaded',timeout:40000});
  await new Promise(r=>setTimeout(r,900));
  const revisit=await p.evaluate(()=>({url:location.pathname,
    visited:JSON.parse(localStorage.getItem('hexworth_tourist_visited')||'[]')}));
  t('a house already visited is still reachable', revisit.url.includes('/houses/shield/'), revisit.url);
  t('revisiting does not consume a 4th slot', revisit.visited.length===3, JSON.stringify(revisit.visited));

  // A FOURTH, new house must be refused.
  const fresh=['key','ai','cloud','eye'];
  let blocked=0;
  for (const h of fresh){
    await p.goto(`${base}/houses/${h}/index.html`,{waitUntil:'domcontentloaded',timeout:40000});
    await new Promise(r=>setTimeout(r,900));
    const s=await p.evaluate(()=>({url:location.pathname,
      visited:JSON.parse(localStorage.getItem('hexworth_tourist_visited')||'[]')}));
    const redirected = !s.url.includes(`/houses/${h}/`);
    if (redirected) blocked++;
    t(`4th house "${h}" is refused`, redirected, s.url+' visited='+s.visited.length);
  }
  t('the cap held for every new house', blocked===fresh.length, `${blocked}/${fresh.length} blocked`);

  /* ── WHO MUST NOT BE AFFECTED ────────────────────────────────────────────────────
     A cap that also stops the people it was never aimed at is worse than no cap.

     ⚠ EACH CASE GETS ITS OWN BROWSER CONTEXT. localStorage is shared per-origin across pages
     in one context, so the sorted-student case below set hexworth_house and the "fresh
     tourist" case after it was still a SORTED user: isTourist() returned false, the tourist
     branch never ran, and the test reported an uncounted visit against working code. That is
     feedback_the_harness_carried_state, reproduced here before it was noticed. */
  async function isolated(seed, url) {
    const ctx = await b.createBrowserContext();
    const pg = await ctx.newPage();
    await pg.evaluateOnNewDocument(seed);
    await pg.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 });
    await new Promise(r => setTimeout(r, 1200));
    const out = await pg.evaluate(() => ({
      url: location.pathname,
      visited: (() => { try { return JSON.parse(localStorage.getItem('hexworth_tourist_visited') || '[]'); }
                        catch (e) { return null; } })()
    }));
    await pg.close();
    return out;
  }

  const sorted = await isolated(() => { try { localStorage.setItem('hexworth_house','cloud'); } catch(e){} },
                                `${base}/houses/cloud/index.html`);
  t('a SORTED student is untouched by the cap', sorted.url.includes('/houses/cloud/'), sorted.url);

  const fresh0 = await isolated(() => { try {
      localStorage.setItem('hexworth_tourist_active','true');
      localStorage.setItem('hexworth_tourist_visited','[]'); } catch(e){} },
      `${base}/houses/key/index.html`);
  t('a fresh tourist gets their 1st house', fresh0.url.includes('/houses/key/'), fresh0.url);
  /* The counter incrementing is what makes the cap REACHABLE. Without it the cap only ever
     fires for a pre-seeded value, and a real tourist browses forever, which is the original
     bug wearing a passing test. */
  t('and the visit is COUNTED', Array.isArray(fresh0.visited) && fresh0.visited.length === 1,
    JSON.stringify(fresh0.visited));

  const blockedStorage = await isolated(() => {
      try { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); } catch(e){}
    }, `${base}/houses/eye/index.html`);
  t('storage blocked fails OPEN, not locked out', blockedStorage.url.length > 0, blockedStorage.url);

  console.log(`\n${pass}/${pass+fail} checks passed`);
  await b.close(); server.close(); process.exit(fail?1:0);
})().catch(e=>{console.error('HARNESS ERROR: '+e.message);process.exit(1);});
