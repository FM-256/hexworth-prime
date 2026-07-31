// Contrast DURING a strike. The standing contrast probe samples the resting sky; a flash is the
// brightest the background ever gets, so it is the worst case for text legibility and the only
// state that actually matters for this effect.
const puppeteer=require('puppeteer');
const BASE=process.env.BASE;
const T=[['.sub','hub subtitle'],['.topbar a:last-child','topbar link'],['.section h2','section heading'],['h1','page title']];
function lum(c){const a=c.map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2];}
function ratio(f,b){const L1=lum(f),L2=lum(b);return (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);}
(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 const p=await b.newPage(); await p.setCacheEnabled(false);
 await p.setViewport({width:1440,height:900});
 await p.evaluateOnNewDocument(()=>localStorage.setItem('hexworth_house','cloud'));
 await p.goto(BASE+'/houses/hub/cloud-master',{waitUntil:'domcontentloaded',timeout:40000});
 await new Promise(r=>setTimeout(r,3000));
 // Pin BOTH cells at peak simultaneously -- brighter than they ever get naturally, so this is a
 // deliberately pessimistic worst case.
 await p.evaluate(()=>{ document.querySelectorAll('.bolt').forEach(x=>{x.style.animation='none';x.style.opacity='.34';}); });
 await new Promise(r=>setTimeout(r,400));
 let fail=0;
 for(const [sel,label] of T){
   const r=await p.evaluate(s=>{const e=document.querySelector(s); if(!e) return null;
     const b=e.getBoundingClientRect(); const cs=getComputedStyle(e);
     return {fg:cs.color.match(/\d+/g).slice(0,3).map(Number),x:Math.round(b.left),y:Math.round(b.top),w:Math.round(b.width),h:Math.round(b.height)};},sel);
   if(!r||r.y<0||r.y>860) { console.log(`  ${label.padEnd(16)} (off-screen, skipped)`); continue; }
   const shot=await p.screenshot({encoding:'base64',clip:{x:Math.max(0,r.x),y:Math.max(0,r.y),width:Math.max(8,Math.min(r.w,420)),height:Math.max(8,Math.min(r.h,40))}});
   const bg=await p.evaluate(async s=>{const i=new Image();i.src='data:image/png;base64,'+s;await i.decode();
     const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const g=c.getContext('2d');g.drawImage(i,0,0);
     const d=g.getImageData(0,0,c.width,c.height).data; const L=[];
     for(let k=0;k<d.length;k+=4)L.push([0.2126*d[k]+0.7152*d[k+1]+0.0722*d[k+2],d[k],d[k+1],d[k+2]]);
     L.sort((a,b)=>a[0]-b[0]); const take=Math.max(1,Math.floor(L.length*0.10));
     let rr=0,gg=0,bb=0; for(let k=0;k<take;k++){rr+=L[k][1];gg+=L[k][2];bb+=L[k][3];}
     return [Math.round(rr/take),Math.round(gg/take),Math.round(bb/take)];},shot);
   const cr=ratio(r.fg,bg);
   const ok=cr>=4.5;
   if(!ok)fail++;
   console.log(`  ${ok?'PASS':'FAIL'}  ${label.padEnd(16)} ${cr.toFixed(2)}:1 at PEAK flash  fg=rgb(${r.fg}) bg=rgb(${bg})`);
 }
 console.log(fail?`\n  ${fail} element(s) fail AA during a strike`:'\n  all sampled text holds AA even at peak flash');
 await b.close(); process.exit(fail?1:0);
})();
