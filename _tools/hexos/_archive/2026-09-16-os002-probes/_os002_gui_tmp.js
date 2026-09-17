const puppeteer=require('puppeteer');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const BASE=process.argv[2]||'https://hexworth.com';
(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
 const ctx=await b.createBrowserContext(); const p=await ctx.newPage();
 p.on('dialog',async d=>{try{await d.dismiss();}catch(e){}});
 await p.goto(`${BASE}/dispatch/boxes/os002-update-nightmare/`,{waitUntil:'networkidle2',timeout:60000});
 await sleep(1100);
 await p.evaluate(()=>{const x=[...document.querySelectorAll('button')].filter(e=>e.offsetParent!==null).find(e=>/start|begin|launch|enter/i.test(e.textContent));if(x)x.click();});
 for(let i=0;i<30;i++){if(await p.evaluate(()=>!!(typeof BoxEngine!=='undefined'&&BoxEngine.state&&BoxEngine.state.booted)))break;await sleep(500);}
 await p.keyboard.press('Shift'); await sleep(400);
 await p.evaluate(()=>{const bt=[...document.querySelectorAll('#survey-overlay button')].find(x=>/skip/i.test(x.textContent));if(bt)bt.click();});
 await sleep(600);
 await p.evaluate(()=>{const t=(BoxEngine.config.desktop.icons||[]).find(i=>i.app==='ticket');if(t)BoxEngine._launchApp(t);});
 await p.waitForSelector('[data-idx]',{timeout:9000}).catch(()=>{});
 await p.evaluate(()=>{const x=document.querySelectorAll('[data-idx]')[0];if(x)x.click();});
 await sleep(1200);
 // open SERVICES first, then UPDATE PANEL
 await p.evaluate(()=>{const t=(BoxEngine.config.desktop.icons||[]).find(i=>i.app==='services');BoxEngine._launchApp(t);});
 await sleep(900);
 console.log('--- after opening Services icon ---');
 console.log(await p.evaluate(()=>{
   const ids=[...document.querySelectorAll('#hwContainer')].length;
   const wins=Object.keys(BoxEngine._windows);
   const titles=[...document.querySelectorAll('.window-title,.win-title,[class*=title]')].map(e=>e.textContent.trim()).filter(Boolean).slice(0,12);
   return JSON.stringify({dupHwContainer:ids,windows:wins,titles},null,1);
 }));
 await p.evaluate(()=>{const t=(BoxEngine.config.desktop.icons||[]).find(i=>i.app==='hw_panel');BoxEngine._launchApp(t);});
 await sleep(900);
 console.log('--- after ALSO opening Update Panel ---');
 console.log(await p.evaluate(()=>{
   const nodes=[...document.querySelectorAll('#hwContainer')];
   return JSON.stringify({
     dupHwContainer:nodes.length,
     windows:Object.keys(BoxEngine._windows),
     contentLengths:nodes.map(n=>n.innerText.trim().length),
     secondWindowText:nodes.length>1?nodes[1].innerText.trim().slice(0,200):'(n/a)'
   },null,1);
 }));
 await ctx.close(); await b.close();
})();
