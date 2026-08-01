// Prove the fix END TO END: complete a module the way a student does, then confirm the hub counts
// it. Fresh page per case -- completion is sticky and a shared session would latch a pass.
const puppeteer=require('/home/eq/ai-content/hexworth-prime/node_modules/puppeteer');
const B='http://127.0.0.1:8901';
async function run(b, hub, moduleId){
  // 1. hub with NO progress -> must read 0
  let p=await b.newPage(); await p.setCacheEnabled(false);
  await p.evaluateOnNewDocument(()=>{try{localStorage.clear();localStorage.setItem('hexworth_house','cloud');}catch(e){}});
  await p.goto(B+hub,{waitUntil:'domcontentloaded',timeout:25000});
  await new Promise(r=>setTimeout(r,900));
  const before=await p.evaluate(()=>document.querySelectorAll('.capi-card.done, .capi-card.complete, .done').length);
  const beforeTxt=await p.evaluate(()=>document.body.innerText.match(/(\d+)\s*(?:of\s*\d+\s*)?Completed/i)?.[1]||'n/a');
  await p.close();
  // 2. same hub, but with ONE module completed exactly as ModuleProgress writes it
  p=await b.newPage(); await p.setCacheEnabled(false);
  await p.evaluateOnNewDocument(id=>{try{localStorage.clear();localStorage.setItem('hexworth_house','cloud');
    localStorage.setItem('hexworth_progress', JSON.stringify({cloud:{[id]:{completed:true,completedAt:'x'}}}));}catch(e){}}, moduleId);
  await p.goto(B+hub,{waitUntil:'domcontentloaded',timeout:25000});
  await new Promise(r=>setTimeout(r,900));
  const afterTxt=await p.evaluate(()=>document.body.innerText.match(/(\d+)\s*(?:of\s*\d+\s*)?Completed/i)?.[1]||'n/a');
  await p.close();
  console.log('  '+hub);
  console.log('     completed count with no progress : '+beforeTxt);
  console.log('     completed count after 1 module   : '+afterTxt);
  const ok = beforeTxt==='0' && afterTxt==='1';
  console.log('     -> '+(ok?'PASS  the hub now reflects real completion':'FAIL  hub did not move 0 -> 1'));
  return ok;
}
(async()=>{const b=await puppeteer.launch({args:['--no-sandbox']});
let all=true;
all = await run(b,'/houses/cloud/api/auth/index.html','capi-auth-01') && all;
all = await run(b,'/houses/cloud/api/owasp/index.html','capi-owasp-01') && all;
await b.close();
console.log('\n  '+(all?'BOTH FIXED':'NOT FIXED'));
process.exitCode=all?0:1;})();
