// Final check: EVERY element on the hub is a cartridge, in both environment states.
const puppeteer=require('/home/eq/ai-content/hexworth-prime/node_modules/puppeteer');
(async()=>{
  const b=await puppeteer.launch({args:['--no-sandbox']});
  const p=await b.newPage(); await p.setViewport({width:1400,height:1000}); await p.setCacheEnabled(false);
  await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('hexworth_house','cloud');}catch(e){}});
  await p.goto('http://127.0.0.1:5000/houses/hub/cloud-master',{waitUntil:'domcontentloaded',timeout:30000});
  await new Promise(r=>setTimeout(r,3500));
  const on=await p.evaluate(()=>{
    const secs={};
    document.querySelectorAll('.section').forEach(s=>{
      const h=s.querySelector('h2'); if(!h) return;
      const label=(h.querySelector('span')||h).textContent.trim();
      const items=s.querySelectorAll('.item').length, carts=s.querySelectorAll('.item-cart').length,
            kids=s.querySelectorAll('.kid-card').length;
      secs[label]={items,carts,kids};
    });
    const c=document.querySelector('.item-cart'), a=c&&c.querySelector('.item-art');
    return {secs, edge: a? Math.round(a.getBoundingClientRect().width/c.getBoundingClientRect().width*100):0,
            env:document.body.className};
  });
  // env OFF -- cartridges must still hold without the storm layer
  await p.evaluate(()=>document.body.classList.remove('env-on'));
  await new Promise(r=>setTimeout(r,300));
  const off=await p.evaluate(()=>{
    const c=document.querySelector('.item-cart'), a=c&&c.querySelector('.item-art');
    return a? Math.round(a.getBoundingClientRect().width/c.getBoundingClientRect().width*100):0;
  });
  await b.close();
  let tot=0,cart=0;
  for(const [k,v] of Object.entries(on.secs)){
    const n=v.items+v.kids, c=v.carts+v.kids; tot+=n; cart+=c;
    console.log('  '+k.padEnd(18)+String(n).padStart(3)+' element(s)  cartridge: '+c+'/'+n);
  }
  console.log('\n  TOTAL '+cart+'/'+tot+' elements rendered as cartridges');
  console.log('  art panel width, env ON : '+on.edge+'% of card (edge-to-edge)');
  console.log('  art panel width, env OFF: '+off+'% of card');
})();
