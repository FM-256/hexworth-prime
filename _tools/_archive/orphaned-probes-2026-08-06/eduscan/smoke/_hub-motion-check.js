// Proves the scene is ALIVE: two frames captured seconds apart, with NO pointer or scroll
// input, must differ. Asserting "it animates" from a single screenshot is not possible.
const puppeteer=require('puppeteer');
const BASE=process.env.BASE, SP=process.env.SP;
(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 const p=await b.newPage();
  await p.setCacheEnabled(false);   // preview redeploys serve max-age=3600; never measure a stale build
 await p.setViewport({width:1440,height:900});
 await p.evaluateOnNewDocument(()=>localStorage.setItem('hexworth_house','cloud'));
 await p.goto(BASE+'/houses/hub/cloud-master',{waitUntil:'domcontentloaded',timeout:40000});
 await new Promise(r=>setTimeout(r,4000));
 const clip={x:0,y:0,width:1440,height:520};
 const a=await p.screenshot({encoding:'base64',clip});
 await p.screenshot({path:SP+'/env-focus.png'});
 await new Promise(r=>setTimeout(r,6000));          // no input at all -- ambient drift only
 const c=await p.screenshot({encoding:'base64',clip});
 const diff=await p.evaluate(async(x,y)=>{
   async function px(s){const i=new Image();i.src='data:image/png;base64,'+s;await i.decode();
     const cv=document.createElement('canvas');cv.width=i.width;cv.height=i.height;
     const g=cv.getContext('2d');g.drawImage(i,0,0);return g.getImageData(0,0,cv.width,cv.height).data;}
   const A=await px(x),B=await px(y);let n=0,tot=0;
   for(let i=0;i<A.length;i+=4){tot++;if(Math.abs(A[i]-B[i])+Math.abs(A[i+1]-B[i+1])+Math.abs(A[i+2]-B[i+2])>9)n++;}
   return n/tot;
 },a,c);
 console.log('  changed pixels with ZERO input over 6s: '+(diff*100).toFixed(2)+'%');
 console.log(diff>0.02 ? '  ALIVE -- the scene animates on its own' : '  STATIC -- ambient motion is NOT running');
 await b.close();
 process.exit(diff>0.02?0:1);
})();
