// Capture the sky DURING a strike, and measure the flash cadence against WCAG 2.3.1.
const puppeteer=require('puppeteer');
const BASE=process.env.BASE, SP=process.env.SP;
(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 const p=await b.newPage(); await p.setCacheEnabled(false);
 await p.setViewport({width:1440,height:900,deviceScaleFactor:2});
 await p.evaluateOnNewDocument(()=>localStorage.setItem('hexworth_house','cloud'));
 await p.goto(BASE+'/houses/hub/cloud-master',{waitUntil:'domcontentloaded',timeout:40000});
 await new Promise(r=>setTimeout(r,3000));

 // Sample bolt opacity at 40ms for 30s: enough to see both cells fire and count flashes.
 const trace=await p.evaluate(()=>new Promise(res=>{
   const out=[]; const t0=performance.now();
   const id=setInterval(()=>{
     const o=[...document.querySelectorAll('.bolt')].map(b=>+getComputedStyle(b).opacity);
     out.push({t:Math.round(performance.now()-t0), o});
     if(performance.now()-t0>30000){clearInterval(id);res(out);}
   },40);
 }));
 const lit = trace.filter(s=>s.o.some(v=>v>0.02));
 console.log(`  samples: ${trace.length} over 30s | frames with a visible flash: ${lit.length}`);
 // Count flash ONSETS (dark -> lit transitions) per rolling 1s window.
 let onsets=[]; let prev=false;
 trace.forEach(s=>{ const on=s.o.some(v=>v>0.02); if(on&&!prev) onsets.push(s.t); prev=on; });
 let worst=0;
 onsets.forEach(t=>{ const n=onsets.filter(x=>x>=t&&x<t+1000).length; if(n>worst) worst=n; });
 console.log(`  flash onsets in 30s: ${onsets.length} at ms ${onsets.join(', ')||'(none)'}`);
 console.log(`  WORST case flashes in any 1s window: ${worst}  (WCAG 2.3.1 limit is 3)`);
 console.log(worst<=3 ? '  WCAG PASS' : '  WCAG FAIL');
 // Grab a frame mid-strike.
 if(lit.length){
   await p.evaluate(()=>{ const b=document.querySelector('.bolt-1');
     b.style.animation='none'; b.style.opacity='.34'; });
   await new Promise(r=>setTimeout(r,300));
   await p.screenshot({path:`${SP}/storm-flash.png`});
   console.log('  mid-strike frame captured');
 }
 await b.close();
})();
