// The component is shared by 91 pages. node --check proves it PARSES; it does not prove a consumer
// page still boots and can construct the modal. Look, do not assume.
const puppeteer=require('/home/eq/ai-content/hexworth-prime/node_modules/puppeteer');
(async()=>{
  const b=await puppeteer.launch({args:['--no-sandbox']});
  const p=await b.newPage();
  const errs=[];
  p.on('pageerror',e=>errs.push(String(e).slice(0,120)));
  p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,120));});
  await p.evaluateOnNewDocument(()=>{try{localStorage.clear();localStorage.setItem('hexworth_house','script');}catch(e){}});
  await p.goto('http://127.0.0.1:8901/houses/script/courses/clh/modules/clh-013/script-lab.lab.html',{waitUntil:'domcontentloaded',timeout:30000});
  await new Promise(r=>setTimeout(r,1500));
  const r=await p.evaluate(()=>({
    // BARE identifier, not window.X. `class Foo {}` at top level lives in global LEXICAL scope
    // and is never attached to window -- checking window.CLHCompletionModal reports undefined on a
    // perfectly working page. That is the lexical-const trap already in memory, and my first probe
    // walked straight into it.
    loaded: typeof CLHCompletionModal,
    canConstruct: (()=>{ try { return typeof CLHCompletionModal === 'function'; } catch(e){ return 'threw: '+e.message; } })(),
    onPage: /clh-013/.test(location.pathname),
  }));
  await b.close();
  console.log('  landed on clh-013      : '+r.onPage);
  console.log('  CLHCompletionModal     : '+r.loaded);
  const real=errs.filter(e=>!/favicon|net::ERR_|firebase|firestore/i.test(e));
  console.log('  page errors (filtered) : '+real.length+(real.length?' -> '+real[0]:''));
  console.log('\n  '+((r.onPage && r.loaded!=='undefined' && real.length===0)?'PASS -- consumer page boots and the component loads':'CHECK ABOVE'));
})();
