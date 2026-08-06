const puppeteer=require('puppeteer');
const BASE=process.env.BASE;
(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 const ctx=await b.createBrowserContext ? await b.createBrowserContext() : b.defaultBrowserContext();
 const p=await (ctx.newPage?ctx.newPage():b.newPage());
 await p.setCacheEnabled(false);
 await p.evaluateOnNewDocument(()=>localStorage.setItem('hexworth_house','cloud'));
 const resp=await p.goto(BASE+'/houses/hub/cloud-master',{waitUntil:'domcontentloaded',timeout:45000});
 const html=await resp.text();
 const m=html.match(/ENV_HUBS = \{[^}]*\}/);
 console.log('  ENV_HUBS in the HTML the BROWSER received:');
 console.log('    '+(m?m[0]:'NOT FOUND'));
 await new Promise(r=>setTimeout(r,3000));
 console.log('  inline style on .env-plane at runtime:');
 console.log('    '+await p.evaluate(()=>{const e=document.querySelector('.env-plane');return e?e.style.backgroundImage:'NO .env-plane';}));
 await b.close();
})();
