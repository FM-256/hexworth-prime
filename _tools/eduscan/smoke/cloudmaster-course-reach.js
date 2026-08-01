// Can a student standing on the Cloud Master hub reach any of the eleven course pages?
const puppeteer=require('/home/eq/ai-content/hexworth-prime/node_modules/puppeteer');
const COURSES=['api','az-104','az-900','clf-c02','cloud-essentials','cse','ms-102','ms-900','openstack','pl-300','server-plus'];
(async()=>{
  const b=await puppeteer.launch({args:['--no-sandbox']});const p=await b.newPage();
  await p.setCacheEnabled(false);
  await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('hexworth_house','cloud');}catch(e){}});
  await p.goto('https://hexworth.com/houses/hub/cloud-master',{waitUntil:'domcontentloaded',timeout:45000});
  await new Promise(r=>setTimeout(r,4000));
  const hrefs=await p.evaluate(()=>[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')));
  await b.close();
  console.log('  total anchors on the hub: '+hrefs.length);
  let reach=0;
  for(const c of COURSES){
    const hit=hrefs.some(h=>h && h.includes('/cloud/'+c+'/index.html'));
    if(hit) reach++;
    console.log('    '+c.padEnd(20)+(hit?'REACHABLE':'-- not linked from the hub --'));
  }
  console.log('\n  '+reach+' of '+COURSES.length+' courses reachable from the Cloud Master hub.');
})();
