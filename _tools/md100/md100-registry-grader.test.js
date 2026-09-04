#!/usr/bin/env node
/**
 * @catalog what    BUG-256: the MD-100 sim must not certify a student who typed the wrong command
 * @catalog run     node _tools/md100/md100-registry-grader.test.js
 * @catalog status  GATE
 *
 * Three graded objectives (c5 lock-screen ads, n4 Remote Desktop, a3 UAC Always Notify) were each
 * satisfied by commands that do not do what the objective asks. Measured against the old logic:
 * c5 passed for a command with NO -Name and NO -Value, and for an invented path that merely
 * CONTAINED the key name; a3 passed for a command that DISABLES UAC, because that branch ignored
 * -Value entirely. A walkthrough proving a lab is completable is not the same as proving it cannot
 * be passed without the skill, which is what this file checks.
 *
 * Every case starts from a FRESH state so no case can be satisfied by a previous one, and the
 * must-fail cases use REAL registry paths so they fail on the value logic under test rather than
 * bouncing off the path check and proving nothing.
 */
const http=require('http'),fs=require('fs'),path=require('path'),puppeteer=require('puppeteer');
const APP=path.resolve('/home/eq/ai-content/hexworth-prime/_app'),PORT=9474;
const MIME={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
 const f=path.join(APP,p);if(!f.startsWith(APP)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}
 r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});r.end(fs.readFileSync(f));});
let pass=0,fail=0;
const chk=(l,c,d)=>{c?(pass++,console.log('  ok   '+l)):(fail++,console.log('  FAIL '+l+(d!==undefined?'  <- '+JSON.stringify(d):'')));};
srv.listen(PORT,'127.0.0.1',async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 const pg=await b.newPage();
 await pg.setRequestInterception(true);
 pg.on('request',r=>{const u=r.url();
   if(/AccessGuard\.js$/.test(u))return r.respond({status:200,contentType:'text/javascript',body:'window.AccessGuard={require(){},redirect(){}};'});
   if(!u.startsWith(`http://127.0.0.1:${PORT}`))return r.abort(); r.continue();});
 await pg.goto(`http://127.0.0.1:${PORT}/houses/forge/md-100/labs/forge-md100-midterm-sim.lab.html`,{waitUntil:'networkidle0',timeout:35000});
 await new Promise(r=>setTimeout(r,1500));
 // Each case runs from a FRESH state so one case cannot satisfy the next.
 const tryCmd=(c)=>pg.evaluate((cmd)=>{
   localStorage.clear();
   state.registry.lockScreenAds = true; state.network.rdpEnabled = false; state.system.uacLevel = 'default';
   initTerminal(); processCommand(cmd);
   return { c5: !state.registry.lockScreenAds, n4: !!state.network.rdpEnabled, a3: state.system.uacLevel === 'always' };
 }, c);

 const PS='Set-ItemProperty';
 // ── must still PASS ──
 let r = await tryCmd(`${PS} -Path "HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\ContentDeliveryManager" -Name "RotatingLockScreenEnabled" -Value 0`);
 chk('correct lock-screen command still completes c5', r.c5===true, r);
 r = await tryCmd(`${PS} 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server' -Name fDenyTSConnections -Value 0`);
 chk("the lab's OWN positional-path RDP command still completes n4", r.n4===true, r);
 r = await tryCmd(`${PS} -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" -Name ConsentPromptBehaviorAdmin -Value 2`);
 chk('the newly documented UAC command completes a3', r.a3===true, r);

 // ── must now FAIL (these all passed before) ──
 r = await tryCmd(`${PS} -Path "HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\ContentDeliveryManager"`);
 chk('INCOMPLETE (no -Name, no -Value) no longer completes c5', r.c5===false, r);
 r = await tryCmd(`${PS} -Path "totally-made-up contentdeliverymanager" -Name RotatingLockScreenEnabled -Value 0`);
 chk('BOGUS path no longer completes c5', r.c5===false, r);
 r = await tryCmd(`${PS} -Path "HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\ContentDeliveryManager" -Name RotatingLockScreenEnabled -Value 1`);
 chk('-Value 1 (ENABLES ads) does not complete c5', r.c5===false, r);
 r = await tryCmd(`${PS} -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" -Name EnableLUA -Value 0`);
 chk('DISABLING UAC no longer completes "Always Notify"', r.a3===false, r);
 r = await tryCmd(`${PS} -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server" -Name fDenyTSConnections -Value 1`);
 chk('fDenyTSConnections=1 (DENIES rdp) does not complete n4', r.n4===false, r);

 await b.close();srv.close();
 console.log(`\n  ${pass} passed, ${fail} failed`);
});
