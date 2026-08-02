/* Measure the DEFECT directly (does the page scroll sideways) instead of the static proxy
   (does it have a non-wrapping flex row). The proxy was only ~50% precise on the cloud house.
   Reports the widest overflowing element so the cause comes with the finding. */
const puppeteer=require('puppeteer');
const urls=require(process.argv[2]);
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const u of urls){
  const out=[];
  for(const w of [1024,390]){
   const p=await b.newPage();
   await p.setViewport({width:w,height:800});
   await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('hexworth_house','cloud');}catch(e){}});
   try{
    await p.goto(u,{waitUntil:'domcontentloaded',timeout:30000});
    await new Promise(r=>setTimeout(r,1800));
    const r=await p.evaluate(()=>{
      const bad=document.documentElement.scrollWidth>window.innerWidth+2;
      let worst=null;
      if(bad){
        /* Exclude elements CLIPPED by a scrolling ancestor: their layout rect still extends
           past the viewport even though they are contained and invisible. Without this the
           sweeper names THEAD inside an overflow-x:auto table as "the cause" when the table is
           already fixed and the real culprit is elsewhere. Same trap as the overlap probe. */
        const clipped=(e)=>{let n=e.parentElement;const r=e.getBoundingClientRect();
          while(n){const cs=getComputedStyle(n);
            if(/auto|scroll|hidden/.test(cs.overflowX)){const nr=n.getBoundingClientRect();
              if(r.right>nr.right+1) return true;}
            n=n.parentElement;}
          return false;};
        const c=[...document.querySelectorAll('*')].filter(e=>{
          const q=e.getBoundingClientRect(); return q.right>window.innerWidth+1&&q.width>0&&!clipped(e);});
        c.sort((a,z)=>z.getBoundingClientRect().width-a.getBoundingClientRect().width);
        if(c[0]) worst=(c[0].tagName+(c[0].id?'#'+c[0].id:''))+' w='+Math.round(c[0].getBoundingClientRect().width);
      }
      return{bad,docW:document.documentElement.scrollWidth,iw:window.innerWidth,worst};
    });
    out.push(r.bad?`${w}:OVERFLOW(${r.docW}vs${r.iw} ${r.worst})`:`${w}:ok`);
   }catch(e){ out.push(`${w}:ERR`); }
   await p.close();
  }
  const dirty=out.some(o=>o.indexOf('OVERFLOW')!==-1);
  console.log((dirty?'DEFECT  ':'clean   ')+u.split('/').slice(-1)[0].padEnd(42)+out.join('  '));
 }
 await b.close();
})();
