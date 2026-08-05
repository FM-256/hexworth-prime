/**
 * drhex-button-test.js — the REAL Dr. Hex floating button.
 * Cold Horizon carries TWO help surfaces and they must not be confused:
 *   Sortie Coach  — scripted, tiered, objective-scoped, costs decision discipline
 *   Dr. Hex       — the platform's LLM chat tutor, free-form, no cost
 * Also guards the layout: the button is fixed bottom-right at z-index 9000 and
 * previously sat underneath the corroborators panel.
 */
const http=require('http'),fs=require('fs'),path=require('path');
const puppeteer=require('/home/eq/ai-content/hexworth-prime/node_modules/puppeteer');
const ROOT='/home/eq/ai-content/hexworth-prime/_app';
const MIME={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png'};
const s=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
 fs.readFile(path.join(ROOT,p),(e,b)=>{if(e){r.writeHead(404);return r.end('404');}
 r.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});r.end(b);});});
let pass=0,fail=0;
const ck=(l,ok,d)=>{ok?pass++:fail++;console.log(`  ${ok?'PASS':'FAIL'}  ${l}${d?'  -> '+d:''}`);};
(async()=>{
 await new Promise(r=>s.listen(0,'127.0.0.1',r));
 const port=s.address().port;
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox',
   '--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await b.newPage(); await p.setViewport({width:1440,height:810});
 const errs=[],bad=[];
 p.on('pageerror',e=>errs.push(e.message));
 p.on('response',r=>{if(r.status()>=400)bad.push(r.status()+' '+r.url().split('/').pop());});
 await p.evaluateOnNewDocument(()=>{localStorage.clear();localStorage.setItem('hexworth_house','cloud');localStorage.setItem('hexworth_sorted','true');});
 await p.goto(`http://127.0.0.1:${port}/houses/cloud/games/cloud-cold-horizon.html?qa=1`,{waitUntil:'domcontentloaded',timeout:60000});
 await new Promise(r=>setTimeout(r,6000));

 const mount=await p.evaluate(()=>{
   const el=document.querySelector('hex-ai-button');
   return { present:!!el,
     mission: el&&el.getAttribute('mission-id'), house: el&&el.getAttribute('house'),
     upgraded: !!(el && el.shadowRoot),          // custom element actually defined + rendered
     defined: !!customElements.get('hex-ai-button') };
 });
 ck('hex-ai-button element is on the page', mount.present);
 ck('mission-id matches the GameTracker id', mount.mission==='cold-horizon', 'mission='+mount.mission);
 ck('house is cloud', mount.house==='cloud');
 ck('custom element upgraded (module actually loaded and ran)',
    mount.defined===true && mount.upgraded===true,
    'defined='+mount.defined+' shadowRoot='+mount.upgraded);
 ck('HexAIButton.js served without error', !bad.some(x=>/HexAIButton/i.test(x)), bad.join(', ')||'no 4xx');

 await p.evaluate(()=>document.getElementById('startBtn').click());
 await new Promise(r=>setTimeout(r,2500));

 // layout: the button must not be buried under the corroborators panel
 const geo=await p.evaluate(()=>{
   const btn=document.querySelector('hex-ai-button');
   const br=document.getElementById('br');
   const rb=btn.getBoundingClientRect(), rr=br.getBoundingClientRect();
   const overlap=!(rb.right<=rr.left||rr.right<=rb.left||rb.bottom<=rr.top||rr.bottom<=rb.top);
   // is the button the topmost element at its own centre?
   const cx=rb.left+rb.width/2, cy=rb.top+rb.height/2;
   const top=document.elementFromPoint(cx,cy);
   return { btn:{x:Math.round(rb.x),y:Math.round(rb.y),w:Math.round(rb.width),h:Math.round(rb.height)},
            br:{x:Math.round(rr.x),y:Math.round(rr.y),w:Math.round(rr.width),h:Math.round(rr.height)},
            overlap, topTag: top?top.tagName.toLowerCase():null };
 });
 ck('button does not overlap the corroborators panel', geo.overlap===false, JSON.stringify(geo.btn)+' vs '+JSON.stringify(geo.br));
 ck('button is clickable (topmost at its own centre)', geo.topTag==='hex-ai-button', 'topmost='+geo.topTag);

 // the two help surfaces must stay distinct
 await p.keyboard.press('h');
 await new Promise(r=>setTimeout(r,1200));
 const two=await p.evaluate(()=>({
   coachOpen: document.getElementById('hex').classList.contains('show'),
   coachLabel: document.querySelector('#hex .who').textContent.trim(),
   btnStillThere: !!document.querySelector('hex-ai-button'),
 }));
 ck('Sortie Coach opens on [H] and is not the Dr. Hex button', two.coachOpen===true && two.btnStillThere===true);
 ck('coach panel does not claim to be Dr. Hex', !/dr\.?\s*hex/i.test(two.coachLabel), 'label="'+two.coachLabel+'"');

 // attempt event must fire on a graded action
 const fired=await p.evaluate(()=>new Promise(res=>{
   let seen=false;
   window.addEventListener('hexworth:lab-attempt-submitted',()=>{seen=true;},{once:true});
   window.__COLD_HORIZON_QA__.forceScan('VESTA-2');
   setTimeout(()=>res(seen),300);
 }));
 ck('a graded action dispatches hexworth:lab-attempt-submitted', fired===true);

 await p.screenshot({path:'/tmp/claude-1000/-home-eq/d7b814d9-d937-47c0-8ed6-0ba92645deec/scratchpad/drhex.png'});
 console.log('\nnon-200:',bad.length,bad.slice(0,5));
 console.log('pageerrors:',errs.length,errs.slice(0,3));
 console.log(`${pass} passed, ${fail} failed`);
 await b.close(); s.close();
 process.exit(fail?1:0);
})();
