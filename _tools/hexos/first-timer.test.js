#!/usr/bin/env node
/**
 * @catalog what    Hex OS: what a FIRST-TIMER types, and the content tiers ls/search expose
 * @catalog run     node _tools/hexos/first-timer.test.js
 * @catalog status  GATE
 *
 * WHY THIS EXISTS, SEPARATE FROM hex-shell-process.test.js
 * -------------------------------------------------------
 * That suite has 132 assertions and found none of the defects below, and a reviewer named exactly
 * why: every assertion in it is written by someone who already thinks in commands. It exercises
 * single, well-formed invocations with the arguments the author anticipated. What it structurally
 * cannot see is someone who does NOT know the shell's grammar -- a sentence instead of a command,
 * or a house called by the name the platform actually prints on its own page.
 *
 * Three defects, all reproduced against the live shell before being fixed:
 *
 *   1. `how do I find my class` -> "how is not a command here. Try ls do I find my class"
 *      A confident, syntactically valid suggestion that fails on its own and sends the student one
 *      dead end deeper. Worse than "not a command", because it looks like an answer.
 *   2. `search machine` found nothing, because the manifest called House of the Machine "Ai".
 *      A student could only find their own house by knowing the internal slug.
 *   3. `ls`/`search` listed admin-tier and Vault-tier apps as ordinary unflagged rows, while
 *      `info` on the same app printed a caveat. Same question answered two ways in one file.
 *
 * The regressions guarded alongside them matter as much as the fixes: a real command with a
 * multi-word argument (`search house of the machine`) and a single-word synonym carrying its
 * argument (`open arena`) must both keep working, or the sentence fix has broken the shell.
 */
const http=require('http'),fs=require('fs'),path=require('path'),puppeteer=require('puppeteer');
const APP=path.resolve('/home/eq/ai-content/hexworth-prime/_app');
/* PORT 0: the OS assigns a free port at listen time, set in the listen callback below.
   These suites each hardcoded a port, which makes them unsafe to run concurrently with
   each other or with themselves. Two of them were already colliding on 9311. Reproduced
   directly: two instances of one suite at once, one passed and the other died with
   EADDRINUSE. Phantom failures are worse than no test, because they train whoever sees
   them to re-run until green. */
let PORT = 0;
const MIME={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
 const f=path.join(APP,p);if(!f.startsWith(APP)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}
 r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});r.end(fs.readFileSync(f));});
let pass=0,fail=0;
const chk=(l,c,d)=>{c?(pass++,console.log('  ok   '+l)):(fail++,console.log('  FAIL '+l+(d?'\n         '+d.slice(0,180):'')));};
srv.listen(0, '127.0.0.1', async() => {
    PORT = srv.address().port;
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 const pg=await b.newPage();
 await pg.setRequestInterception(true);
 pg.on('request',r=>{const u=r.url();
   if(/AccessGuard\.js$/.test(u))return r.respond({status:200,contentType:'text/javascript',body:'window.AccessGuard={require(){},redirect(){}};'});
   if(/FirebaseAuth\.js$/.test(u))return r.respond({status:200,contentType:'text/javascript',body:'window.FirebaseAuth={waitForAuth(){return Promise.resolve(null)},isSignedIn(){return false},getUser(){return null},uid(){return null},signOut(){return Promise.resolve()},onAuthStateChanged(){},callFunction(){return Promise.resolve({})}};'});
   if(!u.startsWith(`http://127.0.0.1:${PORT}`))return r.abort(); r.continue();});
 await pg.goto(`http://127.0.0.1:${PORT}/hex/`,{waitUntil:'networkidle0',timeout:35000});
 await new Promise(r=>setTimeout(r,2200));
 const run=async(s)=>{await pg.evaluate(()=>{document.getElementById('out').innerHTML='';});
   await pg.click('#cmd'); await pg.type('#cmd',s); await pg.keyboard.press('Enter');
   await new Promise(r=>setTimeout(r,700));
   return pg.evaluate(()=>document.getElementById('out').innerText);};

 let o=await run('search workshop');
 chk('admin-tier app is MARKED in search, not shown as ordinary', /\[admin\]/.test(o), o.slice(0,220));
 o=await run('ls dark-arts');
 chk('vault-tier rows marked in ls', /\[dark-arts\]|\[gate:1\]/.test(o), o.slice(0,220));
 o=await run('search arena');
 chk('ordinary apps get NO badge', !/\[sorted\]|\[public\]/.test(o), o.slice(0,180));
 o=await run('how do I find my class');
 chk('sentence is named as a sentence, not spliced into a verb', /is a sentence, not a command/.test(o), o);
 chk('  -> and does NOT emit the garbled "ls do I find my class"', !/ls do I find/.test(o), o);
 chk('  -> and points at a query that would actually work', /search class/.test(o), o);
 o=await run('show me the arena');
 chk('the direct-synonym sentence is caught too', /is a sentence/.test(o) && !/ls me the/.test(o), o);
 chk('  -> suggests search arena', /search arena/.test(o), o);
 // real commands with legitimate multi-word args must be untouched
 o=await run('search house of the machine');
 chk('REAL command with a multi-word arg still works', /machine/i.test(o) && !/is a sentence/.test(o), o.slice(0,160));
 chk('  -> and finds the house by its real name', /House of the Machine/.test(o), o.slice(0,200));
 // single-word synonym must still carry its argument
 o=await run('open arena');
 chk('single-word synonym still carries its argument', /run arena/.test(o) && !/is a sentence/.test(o), o);
 await b.close();srv.close();
 console.log(`\n  ${pass} passed, ${fail} failed`);
});

