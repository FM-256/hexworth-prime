// Does the ::after label plate ever sit ON TOP of card text?
// The earlier sweep hit-tested the title's box centre, which for a WRAPPED title lands in the
// gap between lines -- so it reported the plate on top at some viewports and not others. That
// inconsistency was the tell. Hit-test real glyph pixels via Range rects instead.
const puppeteer=require('puppeteer');
const BASE=process.env.BASE;
const VIEWS=[[390,844,'mobile'],[820,1180,'tablet'],[1440,900,'desktop'],[1920,1080,'wide']];
(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 let bad=0;
 for(const [w,h,name] of VIEWS){
  const p=await b.newPage(); await p.setCacheEnabled(false);
  await p.setViewport({width:w,height:h});
  await p.evaluateOnNewDocument(()=>localStorage.setItem('hexworth_house','cloud'));
  await p.goto(BASE+'/houses/hub/cloud-master',{waitUntil:'domcontentloaded',timeout:40000});
  await new Promise(r=>setTimeout(r,3000));
  // Scroll the first cartridge into view. Without this, mobile/desktop sampled ZERO on-screen
  // items and reported "clean" -- a check that cannot fail proves nothing.
  await p.evaluate(()=>{ const i=document.querySelector('.item'); if(i) i.scrollIntoView({block:'center'}); });
  await new Promise(r=>setTimeout(r,900));
  const r=await p.evaluate(()=>{
    const items=[...document.querySelectorAll('.item')].slice(0,40);
    let tested=0, covered=0, samples=[];
    for(const it of items){
      for(const sel of ['.t','.d']){
        const el=it.querySelector(sel); if(!el||!el.firstChild) continue;
        const rng=document.createRange(); rng.selectNodeContents(el);
        const rects=[...rng.getClientRects()].filter(x=>x.width>4&&x.height>4);
        for(const rc of rects){
          // sample INSIDE a real text line, a few px in from its left edge
          const x=rc.left+6, y=rc.top+rc.height/2;
          // elementFromPoint only resolves points INSIDE the visible viewport; anywhere else it
          // returns null. Most of the 93 cards are below the fold, so sampling them produced
          // 137/137 "covered" hits that were really 137 off-screen nulls. Only test what is
          // actually on screen.
          if(x<0||y<0||x>=innerWidth||y>=innerHeight) continue;
          const hit=document.elementFromPoint(x,y);
          tested++;
          if(!(hit===el||el.contains(hit))){ covered++;
            if(samples.length<3) samples.push({sel, hit:hit?hit.className||hit.tagName:'null'}); }
        }
      }
    }
    return {tested, covered, samples};
  });
  const verdict = r.tested===0 ? 'NO SAMPLES -- vacuous, not a pass'
                : r.covered===0 ? 'clean'
                : `${r.covered}/${r.tested} COVERED -> ${JSON.stringify(r.samples)}`;
  console.log(`  ${name.padEnd(8)} ${r.tested} glyph-line samples: ${verdict}`);
  if(r.covered || r.tested===0) bad++;
  await p.close();
 }
 console.log('\n  '+(bad? bad+' viewport(s) genuinely covered' : 'label plate never covers text at any viewport'));
 await b.close(); process.exit(bad?1:0);
})();
