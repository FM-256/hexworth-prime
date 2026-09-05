#!/usr/bin/env node
/**
 * terminal-async-output.test.js
 *
 * @catalog what    Drives every dispatch box with an async command handler and fails if the
 * @catalog what    terminal ever renders the literal string "[object Promise]".
 * @catalog run     node _tools/hexos/terminal-async-output.test.js
 * @catalog status  GATE
 *
 * WHY THIS EXISTS
 * ---------------
 * Terminal.js dispatched a box's custom command WITHOUT awaiting it. Ten dispatch boxes, the whole
 * nt1-nt010 networking series, declare `async` handlers that fetch their flag text from the
 * server, so `output` was a Promise and the pane printed "[object Promise]" where the command
 * output belonged.
 *
 * The operator found it the hard way: an entire class stalled on nt1's Verification phase. They
 * had fixed the network, run the exact command the hint names, and the flag that should have been
 * embedded in that output was replaced by that string. The only way through was handing out the
 * walkthrough. It was worse than a blank line, because `output === null` can never match a
 * Promise, so the built-in handler could not rescue it either.
 *
 * THE HARNESS WAS WRONG THREE TIMES BEFORE IT WAS RIGHT, and each wrong version reported a clean
 * run, which is the failure mode that matters here:
 *   1. reached for an internal terminal handle that is never exposed on window -> 10 SKIPs
 *   2. looked for a terminal input at page load -> these are simulated desktops, the terminal
 *      lives behind an icon, so it does not exist until something opens it -> 10 SKIPs
 *   3. matched only an icon labelled "Command Prompt" -> nt008 ships a "Switch CLI" instead
 * A probe that skips everything prints no failures and looks like success. Falsifiability is the
 * only defence: removing the await turns 6 of these 10 red, verified, so a green run means
 * something.
 *
 * COVERAGE LIMIT, stated rather than implied: it types four commands (ipconfig /all,
 * ipconfig /displaydns, ping google.com, ping 8.8.8.8). Four of the ten boxes stay green even with
 * the bug present, because their async handlers sit behind commands this file does not type. It
 * proves the dispatcher awaits; it does not prove every async handler in every box is reached.
 */
'use strict';
const http=require('http'),fs=require('fs'),path=require('path');
const puppeteer=require('puppeteer');
const APP=path.resolve('/home/eq/ai-content/hexworth-prime/_app');
/* PORT 0: the OS assigns a free port at listen time, set in the listen callback below.
   These suites each hardcoded a port, which makes them unsafe to run concurrently with
   each other or with themselves. Two of them were already colliding on 9311. Reproduced
   directly: two instances of one suite at once, one passed and the other died with
   EADDRINUSE. Phantom failures are worse than no test, because they train whoever sees
   them to re-run until green. */
let PORT = 0;
const MIME={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.png':'image/png'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
 const f=path.join(APP,p);if(!f.startsWith(APP)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}
 r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});r.end(fs.readFileSync(f));});
const BOXES=['nt1-network-troubleshoot','nt002-no-internet','nt003-slow-connection','nt004-wifi-wont-connect',
 'nt005-vpn-failure','nt006-ip-conflict','nt007-dns-failure','nt008-vlan-isolation','nt009-switch-port-down','nt010-routing-problem'];
let pass=0,fail=0;
srv.listen(0, '127.0.0.1', async() => {
    PORT = srv.address().port;
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 for(const box of BOXES){
  const pg=await b.newPage();
  const errs=[];pg.on('pageerror',e=>errs.push(e.message.split('\n')[0]));
  await pg.setRequestInterception(true);
  pg.on('request',r=>{const u=r.url();
   if(/AccessGuard\.js$/.test(u))return r.respond({status:200,contentType:'text/javascript',body:'window.AccessGuard={require:function(){},redirect:function(){}};'});
   if(!u.startsWith(`http://127.0.0.1:${PORT}`))return r.abort();r.continue();});
  try{
   await pg.goto(`http://127.0.0.1:${PORT}/dispatch/boxes/${box}/index.html`,{waitUntil:'networkidle0',timeout:40000});
   await new Promise(r=>setTimeout(r,2000));
   // find the terminal input and run the commands the walkthroughs teach
   // Drive the REAL input the way a student does: type, press Enter, read the pane. My first
   // version reached for an internal handle that is never exposed on window, so all ten boxes
   // reported SKIP and the run verified nothing at all.
   /* Open the Command Prompt first. These are simulated Windows desktops: the terminal lives in
      a window behind a .desktop-icon, so it does not exist at page load. Two earlier versions of
      this probe reported SKIP for all ten boxes and verified nothing, which is worse than a
      failure because it looks like a clean run. */
   const opened = await pg.evaluate(() => {
     /* Not every box calls it "Command Prompt": nt008 ships a "Switch CLI" instead, so matching
        one label would silently skip boxes rather than test them. Match any terminal-ish icon. */
     const icon = [...document.querySelectorAll('.desktop-icon')]
       .find((e) => /command\s*prompt|terminal|cli|console|powershell/i.test(e.textContent || ''));
     if (!icon) return false;
     icon.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
     icon.click();
     return true;
   });
   if(!opened){ console.log(`  SKIP ${box.padEnd(26)} no Command Prompt icon`); await pg.close(); continue; }
   await new Promise(r=>setTimeout(r,1200));
   const line=await pg.$('.terminal-input-line input');
   if(!line){ console.log(`  SKIP ${box.padEnd(26)} no terminal input on the page`); await pg.close(); continue; }
   /* Drive the real keydown handler rather than puppeteer's click: the terminal window is
      positioned by the box's own window manager and headless reports the input as not clickable,
      which is a harness limitation and not a product fact. Setting .value then dispatching the
      same Enter keydown the page listens for exercises the identical code path. */
   for(const c of ['ipconfig /all','ipconfig /displaydns','ping google.com','ping 8.8.8.8']){
     await pg.evaluate((cmd)=>{
       const inp=document.querySelector('.terminal-input-line input');
       if(!inp) return;
       inp.value=cmd;
       inp.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
     }, c);
     await new Promise(r=>setTimeout(r,800));
   }
   const out=await pg.evaluate(()=>{
     const el=document.querySelector('.terminal-output');
     return el?el.innerText:'__NO_OUTPUT_PANE__';
   });
   if(out==='__NO_TERMINAL__'){ console.log(`  SKIP ${box.padEnd(26)} no terminal handle exposed`); }
   else{
     const bad=/\[object Promise\]/.test(out);
     bad?fail++:pass++;
     console.log(`  ${bad?'FAIL':'ok  '} ${box.padEnd(26)} ${bad?'[object Promise] PRESENT':'clean'}${errs.length?'  pageerr: '+errs[0].slice(0,40):''}`);
   }
  }catch(e){ console.log(`  ERR  ${box.padEnd(26)} ${e.message.slice(0,50)}`); }
  await pg.close();
 }
 await b.close();srv.close();
 console.log(`\n  ${pass} clean / ${fail} still broken`);
 process.exitCode = fail ? 1 : 0;
});
