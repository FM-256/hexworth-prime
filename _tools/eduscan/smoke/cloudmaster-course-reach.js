// Alias-aware. az-900 and clf-c02 do not have their own hub cards -- their content is served by the
// dedicated azure-fundamentals and aws-ccp hub pages, which is why the strict directory-path check
// under-reports them.
const puppeteer=require('/home/eq/ai-content/hexworth-prime/node_modules/puppeteer');
const MAP={ 'api':'/houses/cloud/api/index.html','az-104':'/houses/cloud/az-104/index.html',
 'az-900':'/houses/azure-fundamentals/index.html','clf-c02':'/houses/aws-ccp/index.html',
 'cloud-essentials':'/houses/cloud/cloud-essentials/index.html','cse':'/houses/cloud/cse/index.html',
 'ms-102':'/houses/cloud/ms-102/index.html','ms-900':'/houses/cloud/ms-900/index.html',
 'openstack':'/houses/cloud/openstack/index.html','pl-300':'/houses/cloud/pl-300/index.html',
 'server-plus':'/houses/cloud/server-plus/index.html' };
(async()=>{
  const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();
  await p.setCacheEnabled(false);
  await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('hexworth_house','cloud');}catch(e){}});
  await p.goto('https://hexworth.com/houses/hub/cloud-master',{waitUntil:'domcontentloaded',timeout:45000});
  await new Promise(r=>setTimeout(r,4500));
  const hrefs=await p.evaluate(()=>[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')));
  const kids=await p.evaluate(()=>document.querySelectorAll('.kid-card').length);
  await b.close();
  let n=0;
  for(const [c,want] of Object.entries(MAP)){
    const hit=hrefs.includes(want); if(hit)n++;
    console.log('    '+c.padEnd(18)+(hit?'REACHABLE':'-- NOT LINKED --')+'   '+want);
  }
  console.log('\n  child hub cards on the live hub: '+kids);
  console.log('  '+n+' of '+Object.keys(MAP).length+' course directories reachable.');
})();
