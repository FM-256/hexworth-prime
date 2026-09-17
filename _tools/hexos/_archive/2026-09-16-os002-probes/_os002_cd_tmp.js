const puppeteer=require('puppeteer');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
const ctx=await b.createBrowserContext();const p=await ctx.newPage();
p.on('dialog',async d=>{try{await d.dismiss()}catch(e){}});
await p.goto('http://127.0.0.1:5600/dispatch/boxes/os002-update-nightmare/',{waitUntil:'networkidle2',timeout:60000});
await sleep(1000);
await p.evaluate(()=>{const x=[...document.querySelectorAll('button')].filter(e=>e.offsetParent!==null).find(e=>/start|begin|launch|enter/i.test(e.textContent));if(x)x.click();});
for(let i=0;i<30;i++){if(await p.evaluate(()=>!!(typeof BoxEngine!=='undefined'&&BoxEngine.state&&BoxEngine.state.booted)))break;await sleep(500);}
await p.keyboard.press('Shift');await sleep(350);
await p.evaluate(()=>{const bt=[...document.querySelectorAll('#survey-overlay button')].find(x=>/skip/i.test(x.textContent));if(bt)bt.click();});
await sleep(500);
await p.evaluate(()=>{const t=BoxEngine.config.desktop.icons.find(i=>i.app==='ticket');BoxEngine._launchApp(t);});
await p.waitForSelector('[data-idx]',{timeout:9000});
await p.evaluate(()=>document.querySelectorAll('[data-idx]')[4].click());await sleep(800);
await p.evaluate(()=>{const t=BoxEngine.config.desktop.icons.find(i=>i.app==='terminal');BoxEngine._launchApp(t);});await sleep(700);
for(const c of ['cd','cd Documents','cd','cd ..','cd','cd C:\\Windows.old','dir','cd C:\\Nope','cd \\','dir']){
 const out=await p.evaluate(async cmd=>{const t=ArenaTerminal._instances[ArenaTerminal._instances.length-1];const n=t.outputEl.innerText.length;await t._execute(cmd);return t.outputEl.innerText.slice(n);},c);
 console.log('$ '+c+'\n'+out.split('\n').filter(Boolean).map(l=>'   '+l).join('\n'));}
await ctx.close();await b.close();})();
