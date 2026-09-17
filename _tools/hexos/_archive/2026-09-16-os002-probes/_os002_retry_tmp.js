const puppeteer=require('puppeteer');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const PLAN=[{idx:0,id:'update_stuck',cmds:['net stop wuauserv','net stop bits','del /q /s C:\\Windows\\SoftwareDistribution\\Download\\*','net start wuauserv','net start bits']},
            {idx:1,id:'rollback_fail',panel:true}];
(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
 for(let round=1;round<=2;round++){
  for(const sc of PLAN){
   const ctx=await b.createBrowserContext();const p=await ctx.newPage();
   p.on('dialog',async d=>{try{await d.dismiss()}catch(e){}});
   await p.goto('https://hexworth.com/dispatch/boxes/os002-update-nightmare/',{waitUntil:'networkidle2',timeout:60000});
   await sleep(1200);
   await p.evaluate(()=>{const x=[...document.querySelectorAll('button')].filter(e=>e.offsetParent!==null).find(e=>/start|begin|launch|enter/i.test(e.textContent));if(x)x.click();});
   for(let i=0;i<30;i++){if(await p.evaluate(()=>!!(typeof BoxEngine!=='undefined'&&BoxEngine.state&&BoxEngine.state.booted)))break;await sleep(500);}
   await p.keyboard.press('Shift');await sleep(350);
   await p.evaluate(()=>{const bt=[...document.querySelectorAll('#survey-overlay button')].find(x=>/skip/i.test(x.textContent));if(bt)bt.click();});
   await sleep(500);
   await p.evaluate(()=>{const t=BoxEngine.config.desktop.icons.find(i=>i.app==='ticket');BoxEngine._launchApp(t);});
   await p.waitForSelector('[data-idx]',{timeout:9000});
   await p.evaluate(i=>document.querySelectorAll('[data-idx]')[i].click(),sc.idx);
   await sleep(900);
   await p.evaluate(()=>{const t=BoxEngine.config.desktop.icons.find(i=>i.app==='hw_panel');BoxEngine._launchApp(t);});
   await sleep(700);
   if(sc.panel){await p.evaluate(()=>{const f=document.querySelector('.os2-panel-fix');if(f)f.click();});}
   else{
     await p.evaluate(()=>{const t=BoxEngine.config.desktop.icons.find(i=>i.app==='terminal');BoxEngine._launchApp(t);});
     await sleep(800);
     await p.evaluate(async cmds=>{const t=ArenaTerminal._instances[ArenaTerminal._instances.length-1];for(const c of cmds)await t._execute(c);},sc.cmds);
   }
   await sleep(3000);
   const tok=await p.evaluate(()=>{const m=document.body.innerText.match(/flag\{[^}]{3,60}\}/i);return m?m[0]:(document.querySelector('.os2-flag-slot')||{}).textContent||null;});
   console.log(`round ${round}  ${sc.id.padEnd(16)} -> ${tok}`);
   await ctx.close();
  }
 }
 await b.close();
})();
