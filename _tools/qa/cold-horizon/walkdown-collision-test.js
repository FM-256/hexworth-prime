#!/usr/bin/env node
/*
 * @catalog what    Proves the walk-down front-end boxes are SOLID: drives the vehicle into each
 * @catalog what    one and observes the ejection, dead centre and on a realistic approach.
 * @catalog run     node _tools/qa/cold-horizon/walkdown-collision-test.js
 * @catalog status  GATE
 *
 * #309. The labelled boxes were solid to the eye and empty to the vehicle. Fixing that needed
 * per-obstacle radii in the flight model, because the collision set is spherical and one sphere
 * around a 40 m switch is a bubble far bigger than the box.
 *
 * ⚠ THE FIRST VERSION OF THIS FILE WAS CALLED collide.js AND TESTED NO COLLISION. It asserted
 * the mission still completed and passed 8/8 while the boxes were still hollow: it could not
 * have failed for the thing it was named after. Rewritten to observe the ejection directly via
 * a localhost-only seam, and it immediately found two more bugs neither the old probe nor any
 * other suite could see:
 *   - a vehicle exactly at an obstacle centre yields a zero-length normal, so normalize() gives
 *     (0,0,0) and the ejection moves it nowhere: stuck inside forever
 *   - my own sphere chain used 1.4-radii spacing spread end to end, which for a 9 m box gave
 *     exactly two spheres, one at each END, leaving the middle of the box uncovered
 *
 * The empty-space control exists so this file can prove it is still able to fail.
 */
const puppeteer=require('puppeteer'),http=require('http'),fs=require('fs'),path=require('path');
const ROOT='/home/eq/ai-content/hexworth-prime/_app';
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
 fs.readFile(path.join(ROOT,p),(e,b)=>{if(e){r.writeHead(404);return r.end('404');}
 r.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});r.end(b);});});
let pass=0,fail=0;
const t=(n,c,d)=>{c?(pass++,console.log('  PASS  '+n+(d?'  -> '+d:''))):(fail++,console.log('  FAIL  '+n+(d?'  -> '+d:'')));};
(async()=>{
 await new Promise(r=>srv.listen(0,'127.0.0.1',r)); const port=srv.address().port;
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox',
  '--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const CASES=[
  {act:'6:ch-rf-topology',tag:'m6 KA-FE-1',box:[-8,2,-6]},
  {act:'6:ch-rf-topology',tag:'m6 S-FE-2', box:[34,-6,4]},
  {act:'8:cable-map',     tag:'m8 LEAF-SW mid', box:[-2,-18,6]},
  {act:'8:cable-map',     tag:'m8 LEAF-SW end', box:[16,-18,6]}   // far along the 40m box
 ];
 for(const c of CASES){
  const p=await b.newPage(); await p.setViewport({width:900,height:600});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e.message).slice(0,90)));
  await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('hexworth_house','cloud');}catch(e){}});
  await p.goto(`http://127.0.0.1:${port}/houses/cloud/games/lagrange-inspect.html?qa=1&act=${c.act}`,
               {waitUntil:'domcontentloaded'});
  await new Promise(r=>setTimeout(r,4500));
  const r=await p.evaluate((box)=>{
    const q=window.__LE_INSPECT_QA__;
    // start INSIDE the box travelling further in; the vehicle must be pushed back out
    /* Two probes: dead centre (the degenerate case) and a realistic slightly-off-centre
       approach, which is what a player actually does. Both must eject. */
    return { centre:q.probeCollision(box,[0,0,0]),
             offset:q.probeCollision([box[0]+1.2,box[1]+0.9,box[2]+1.1],[0,0,0]),
             obstacles:q.obstacleCount() };
  }, c.box);
  t(`${c.tag}: solid on a realistic approach`, r.offset.pushedOut>0.5, `pushed out ${r.offset.pushedOut}m`);
  t(`${c.tag}: solid dead centre too`, r.centre.pushedOut>0.5, `pushed out ${r.centre.pushedOut}m`);
  await p.close();
 }
 // and a control: empty space must NOT bounce
 const p=await b.newPage();
 await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('hexworth_house','cloud');}catch(e){}});
 await p.goto(`http://127.0.0.1:${port}/houses/cloud/games/lagrange-inspect.html?qa=1&act=6:ch-rf-topology`,{waitUntil:'domcontentloaded'});
 await new Promise(r=>setTimeout(r,4500));
 const free=await p.evaluate(()=>window.__LE_INSPECT_QA__.probeCollision([90,60,90],[0,0,0]));
 t('empty space does NOT bounce (the check can fail)', free.pushedOut<0.01, `moved ${free.pushedOut.toFixed(3)}m`);
 await p.close();
 console.log(`\n${pass}/${pass+fail} checks passed`);
 await b.close(); srv.close(); process.exit(fail?1:0);
})().catch(e=>{console.error('ERR '+e.message);process.exit(1);});
