// Verify the two-step route actually gets a cold visitor to the hub on a preview channel.
const puppeteer=require('puppeteer');
const B=process.env.BASE;
(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 const p=await b.newPage(); await p.setCacheEnabled(false);
 await p.setViewport({width:1440,height:900});
 // Cold: no storage at all. Set the house the way the sorting page would, on THIS origin.
 await p.goto(B+'/sorting.html',{waitUntil:'domcontentloaded',timeout:40000});
 await new Promise(r=>setTimeout(r,1500));
 await p.evaluate(()=>localStorage.setItem('hexworth_house','cloud'));
 await p.goto(B+'/houses/hub/cloud-master',{waitUntil:'domcontentloaded',timeout:40000});
 await new Promise(r=>setTimeout(r,3500));
 const st=await p.evaluate(()=>({url:location.pathname,
   envOn:document.body.classList.contains('env-on'),
   birds:document.querySelectorAll('.bird').length,
   items:document.querySelectorAll('.item').length}));
 console.log(`  after setting a house on the preview origin: ${st.url}`);
 console.log(`  env-on=${st.envOn} birds=${st.birds} items=${st.items}`);
 await b.close();
})();
