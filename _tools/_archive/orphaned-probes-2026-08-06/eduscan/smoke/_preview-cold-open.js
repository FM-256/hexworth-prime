// Open the preview EXACTLY as the operator would: a fresh browser, no localStorage, no house.
// Every probe I have written injects hexworth_house first, so none of them would ever see this.
const puppeteer=require('puppeteer');
const B=process.env.BASE;
(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 const p=await b.newPage(); await p.setCacheEnabled(false);
 await p.setViewport({width:1440,height:900});
 await p.goto(B+'/houses/hub/cloud-master',{waitUntil:'domcontentloaded',timeout:40000});
 await new Promise(r=>setTimeout(r,3500));
 const st=await p.evaluate(()=>({url:location.href, title:document.title,
   body:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,120),
   envOn:document.body.classList.contains('env-on')}));
 console.log('  landed on : '+st.url);
 console.log('  title     : '+st.title);
 console.log('  visible   : '+st.body);
 console.log('  env-on    : '+st.envOn);
 await b.close();
})();
