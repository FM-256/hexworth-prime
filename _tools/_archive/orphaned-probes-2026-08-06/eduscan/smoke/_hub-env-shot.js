const puppeteer=require('puppeteer');
const BASE=process.env.BASE, OUT=process.env.OUT;
(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 const p=await b.newPage();
  await p.setCacheEnabled(false);   // preview redeploys serve max-age=3600; never measure a stale build
 await p.setViewport({width:1440,height:900,deviceScaleFactor:1});
 await p.evaluateOnNewDocument(()=>localStorage.setItem('hexworth_house','cloud'));
 await p.goto(BASE+'/houses/hub/cloud-master',{waitUntil:'domcontentloaded',timeout:40000});
 await new Promise(r=>setTimeout(r,4000));
 await p.screenshot({path:OUT});
 console.log('shot ->',OUT);
 await b.close();
})();
