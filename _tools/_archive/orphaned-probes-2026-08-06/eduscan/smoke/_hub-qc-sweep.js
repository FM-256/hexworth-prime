// Real QC sweep: capture the hub across viewports, scroll depths and states, so a human (me)
// can LOOK at it instead of trusting a probe that only checks mechanism.
const puppeteer=require('puppeteer');
const BASE=process.env.BASE, SP=process.env.SP;
const VIEWS=[[390,844,'mobile'],[820,1180,'tablet'],[1440,900,'desktop'],[1920,1080,'wide']];
(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 const issues=[];
 for(const [w,h,name] of VIEWS){
  const p=await b.newPage(); await p.setCacheEnabled(false);
  await p.setViewport({width:w,height:h});
  await p.evaluateOnNewDocument(()=>localStorage.setItem('hexworth_house','cloud'));
  await p.goto(BASE+'/houses/hub/cloud-master',{waitUntil:'domcontentloaded',timeout:40000});
  await new Promise(r=>setTimeout(r,3500));
  await p.screenshot({path:`${SP}/qc-${name}-top.png`});
  // Layout facts a screenshot alone will not tell me.
  const f=await p.evaluate(()=>{
    const out={};
    const de=document.documentElement;
    out.hScroll = de.scrollWidth > de.clientWidth + 1;   // horizontal overflow = layout bug
    out.overflowBy = de.scrollWidth - de.clientWidth;
    const items=[...document.querySelectorAll('.item')];
    out.itemCount=items.length;
    // Does any card's text overflow its own box?
    out.textOverflow = items.filter(i=>{
      const t=i.querySelector('.t'); if(!t) return false;
      return t.scrollWidth > t.clientWidth + 1;
    }).length;
    // Does the label plate (::after) sit under the text? Hit-test the title.
    const first=items[0];
    if(first){ const t=first.querySelector('.t'); const r=t.getBoundingClientRect();
      const hit=document.elementFromPoint(r.left+4, r.top+r.height/2);
      out.titleHitIsText = !!(hit && (hit===t || t.contains(hit)));
    }
    const kids=[...document.querySelectorAll('.kid-card')];
    out.kidCount=kids.length;
    out.birds=document.querySelectorAll('.bird').length;
    return out;
  });
  console.log(`  ${name.padEnd(8)} ${String(w).padStart(4)}x${h}  items=${f.itemCount} kids=${f.kidCount} birds=${f.birds}` +
              `  hOverflow=${f.hScroll?('YES +'+f.overflowBy+'px'):'no'}  titleClipped=${f.textOverflow}  titleOnTop=${f.titleHitIsText}`);
  if(f.hScroll) issues.push(`${name}: horizontal overflow +${f.overflowBy}px`);
  if(f.textOverflow) issues.push(`${name}: ${f.textOverflow} card titles clipped`);
  if(f.titleHitIsText===false) issues.push(`${name}: label plate covers the title text`);
  await p.close();
 }
 console.log('\n  '+(issues.length?issues.length+' LAYOUT ISSUE(S): '+issues.join(' | '):'no layout issues from measurement'));
 await b.close();
})();
