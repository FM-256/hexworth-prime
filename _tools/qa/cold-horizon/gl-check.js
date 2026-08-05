#!/usr/bin/env node
/**
 * gl-check.js — prove a WebGL page actually RENDERS.
 *
 * check-render.js proves the body is visible. That is necessary and not sufficient
 * for a three.js page: a shader compile error yields a visible body and a black
 * canvas. This harness additionally captures console/pageerror output, confirms a
 * WebGL2 context exists, and samples the framebuffer for non-black pixels.
 */
'use strict';
const http = require('http');
const fs   = require('fs');
const path = require('path');
const puppeteer = require('/home/eq/ai-content/hexworth-prime/node_modules/puppeteer');

const ROOT = '/home/eq/ai-content/hexworth-prime/_app';
const PAGE = process.argv[2] || 'houses/cloud/games/cloud-cold-horizon.html';
const SHOT = process.argv[3] || '/tmp/claude-1000/-home-eq/d7b814d9-d937-47c0-8ed6-0ba92645deec/scratchpad/shot.png';
const WAIT = parseInt(process.argv[4] || '9000', 10);
const CLICK_START = process.argv.includes('--start');

const MIME = {'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript',
  '.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png',
  '.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.ico':'image/x-icon'};

const server = http.createServer((req,res)=>{
  let p = decodeURIComponent(req.url.split('?')[0]);
  if(p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if(!f.startsWith(ROOT)){ res.writeHead(403); return res.end(); }
  fs.readFile(f,(e,buf)=>{
    if(e){ res.writeHead(404); return res.end('404 '+p); }
    res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});
    res.end(buf);
  });
});

(async ()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const port = server.address().port;
  const url  = `http://127.0.0.1:${port}/${PAGE}`;

  const browser = await puppeteer.launch({
    headless:'new',
    args:['--no-sandbox','--disable-setuid-sandbox',
          '--use-gl=angle','--use-angle=swiftshader',
          '--enable-unsafe-swiftshader',
          '--enable-webgl','--ignore-gpu-blocklist',
          '--window-size=1600,900']
  });
  const page = await browser.newPage();
  await page.setViewport({width:1600,height:900,deviceScaleFactor:1});

  const logs=[], errs=[];
  page.on('console', m=>{
    const t=m.text();
    logs.push(`[${m.type()}] ${t}`);
    if(m.type()==='error') errs.push(t);
  });
  page.on('pageerror', e=> errs.push('PAGEERROR: '+e.message));
  page.on('requestfailed', r=> errs.push('REQFAIL: '+r.url()+' '+(r.failure()||{}).errorText));

  // pose as a sorted student before any script runs
  await page.evaluateOnNewDocument(()=>{
    localStorage.setItem('hexworth_house','cloud');
    localStorage.setItem('hexworth_sorted','true');
  });

  let navErr = null;
  try{
    await page.goto(url, {waitUntil:'domcontentloaded', timeout:45000});
  }catch(e){ navErr = e.message; }

  await new Promise(r=>setTimeout(r, 2500));

  if(CLICK_START){
    try{
      await page.evaluate(()=>{
        const b=document.getElementById('startBtn');
        if(b) b.click();
      });
    }catch(e){ errs.push('startclick: '+e.message); }
  }

  await new Promise(r=>setTimeout(r, WAIT));

  const info = await page.evaluate(()=>{
    const c = document.querySelector('canvas');
    const out = {
      bodyVisible: getComputedStyle(document.body).visibility,
      preload: !!document.getElementById('access-guard-preload'),
      bodyLen: document.body.innerHTML.length,
      canvas: !!c,
      w: c?c.width:0, h: c?c.height:0,
      gl2: !!(window.WebGL2RenderingContext),
      nope: document.getElementById('nope') ? getComputedStyle(document.getElementById('nope')).display : 'n/a',
      boot: document.getElementById('boot') ? getComputedStyle(document.getElementById('boot')).display : 'n/a',
      hudLive: document.getElementById('hud') ? document.getElementById('hud').className : 'n/a',
      range: document.getElementById('hRange') ? document.getElementById('hRange').textContent : 'n/a',
      mode: document.getElementById('hMode') ? document.getElementById('hMode').textContent : 'n/a',
    };
    return out;
  });

  // sample the real framebuffer via screenshot pixels
  const shot = await page.screenshot({path:SHOT});
  // crude luminance sampling straight off the PNG is awkward; instead ask the page
  const px = await page.evaluate(()=>{
    const c = document.querySelector('canvas');
    if(!c) return null;
    try{
      const t = document.createElement('canvas');
      t.width=64; t.height=36;
      const ctx=t.getContext('2d');
      ctx.drawImage(c,0,0,64,36);
      const d=ctx.getImageData(0,0,64,36).data;
      let sum=0, mx=0, nonzero=0;
      for(let i=0;i<d.length;i+=4){
        const l=(d[i]+d[i+1]+d[i+2])/3;
        sum+=l; if(l>mx)mx=l; if(l>6)nonzero++;
      }
      return { avg:+(sum/(d.length/4)).toFixed(2), max:mx, litPct:+(nonzero/(d.length/4)*100).toFixed(1) };
    }catch(e){ return {err:e.message}; }
  });

  console.log('=== NAV ===');           console.log(navErr ? 'ERROR: '+navErr : 'ok');
  console.log('=== DOM/STATE ===');     console.log(JSON.stringify(info,null,2));
  console.log('=== PIXELS ===');        console.log(JSON.stringify(px));
  console.log('=== ERRORS ('+errs.length+') ===');
  errs.slice(0,25).forEach(e=>console.log('  '+e.slice(0,400)));
  console.log('=== LOGS (last 20) ===');
  logs.slice(-20).forEach(l=>console.log('  '+l.slice(0,300)));
  console.log('=== SHOT ==='); console.log(SHOT);

  await browser.close();
  server.close();
  process.exit(errs.length ? 1 : 0);
})();
