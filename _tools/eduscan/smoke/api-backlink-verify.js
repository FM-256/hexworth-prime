const puppeteer=require('/home/eq/ai-content/hexworth-prime/node_modules/puppeteer');
const fs=require('fs'),path=require('path');
(async()=>{const b=await puppeteer.launch({args:['--no-sandbox']});let ok=true;
for(const d of ['pentest','capstone','event-driven','rate-limiting']){
  const p=await b.newPage(); await p.setCacheEnabled(false);
  await p.evaluateOnNewDocument(()=>{try{localStorage.clear();localStorage.setItem('hexworth_house','cloud');}catch(e){}});
  await p.goto('http://127.0.0.1:8901/houses/cloud/api/'+d+'/index.html',{waitUntil:'domcontentloaded',timeout:25000});
  await new Promise(r=>setTimeout(r,700));
  const l=await p.evaluate(()=>{
    const a=[...document.querySelectorAll('a')].find(x=>/API (Security )?Track/i.test(x.textContent));
    return a?{href:a.getAttribute('href'),text:a.textContent.trim()}:null;});
  await p.close();
  if(!l){console.log('  '+d+': NO track link found'); ok=false; continue;}
  const target=path.resolve('/home/eq/ai-content/hexworth-prime/_app/houses/cloud/api/'+d, l.href);
  const exists=fs.existsSync(target);
  const isTrack=/\/api\/index\.html$/.test(target);
  console.log('  '+d.padEnd(10)+'"'+l.text+'" -> '+l.href+'   exists='+exists+'  isTrackIndex='+isTrack);
  if(!exists||!isTrack) ok=false;
}
await b.close();
console.log('\n  '+(ok?'PASS -- both land on the API Security track index':'FAIL'));
process.exitCode=ok?0:1;})();
