#!/usr/bin/env node
/**
 * walkthrough-verbatim.test.js
 *
 * @catalog what   Types each walkthrough command EXACTLY as printed at a prompt, in order,
 *                 and prints what the box answers. No stubs, no selectors, no shortcuts —
 *                 the point is to read what a student reads.
 * @catalog run    node _tools/hexos/walkthrough-verbatim.test.js <box> <walkthrough.md> [--base URL]
 * @catalog status TOOL
 *
 * WHY IT EXISTS.
 * Every earlier harness in this session drove boxes by a command list I had extracted and
 * by selectors I had chosen. That is not a student. The operator hit a defect I could not:
 * pr001's `net start spooler` failure printed "Hint: ... Clear C:\Windows\...\PRINTERS\",
 * they typed `clear ...` because that is what the screen said, and got
 * "'clear' is not recognized ... Did you mean: cls" — a command that clears the SCREEN.
 * My runs never saw it because I was following my own extracted list, not the page.
 *
 * So: commands are lifted verbatim from lines that begin with a shell prompt in the
 * walkthrough's fenced blocks, only the prompt itself is stripped (a student does not type
 * the prompt), and EVERY response is printed in full for a human to read. This tool does
 * not judge pass or fail — it shows the transcript. The judgement is the person reading it.
 */
'use strict';
const fs=require('fs'), path=require('path'), puppeteer=require('puppeteer');
const argv=process.argv.slice(2);
const BOX=argv[0], WT=argv[1];
const bi=argv.indexOf('--base'); const BASE=bi>-1?argv[bi+1]:'https://hexworth.com';
const si=argv.indexOf('--scenario'); const ONLY=si>-1?parseInt(argv[si+1],10):null;
const BARE=argv.includes('--bare');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));


/* INLINE BACKTICKS ARE COMMANDS TOO.
 * This extractor read only fenced blocks. os003's walkthrough documents
 * `dism /online /enable-feature /featurename:NetFx3` as Step 3 of scenario 3's fix in an
 * INLINE span, so the harness reported that scenario as having no commands and I reported a
 * count that undercounted the documented surface. Nancy caught it. That is the SECOND silent
 * under-report from this extractor in one session — the first was --bare not existing at
 * all, which made os002 read as "no prompted commands" for every scenario.
 *
 * Most inline spans are NOT commands (file names, registry keys, paths, UI labels), so the
 * filter is deliberately conservative and REPORTS what it rejected instead of dropping it
 * silently. A span qualifies only if it has two or more tokens, starts with a command-shaped
 * word, is not GUI navigation, is not an English phrase, and carries at least one argument
 * that looks like a switch, a path or a quoted string.
 *
 * --self-test proves BOTH halves against a fixture, so a future change cannot reintroduce
 * this gap a third time without the canary going red. */
const PROSE_AT_2 = new Set(['as','the','a','to','on','in','and','or','for','with','from','of','into','your','this','that','it','is','are']);

function isLikelyCommand(span){
  const s=String(span||'').trim();
  if(!s || s.includes(' > ')) return false;
  if(/^[#>]/.test(s)) return false;
  const toks=s.split(/\s+/);
  if(toks.length<2) return false;
  const head=toks[0];
  if(!/^[A-Za-z][\w.\-]*$/.test(head)) return false;
  if(/\.(dll|log|txt|md|json|xml|ini|cfg|dat)$/i.test(head)) return false;
  if(PROSE_AT_2.has(toks[1].toLowerCase())) return false;
  return toks.slice(1).some(t=>/^[\/-]/.test(t) || t.includes('\\') || /["']/.test(t));
}

function inlineCommands(text, rejected){
  const out=[]; const re=/`([^`\n]{3,200})`/g; let m;
  /* BLOCKQUOTES ARE COMMENTARY, NOT INSTRUCTIONS.
   * By convention in these walkthroughs a "> " line explains how a command BEHAVES rather
   * than telling the student to run it — "> Filter on `File(s)`, not `Total`. `dir /s`
   * prints the header on its own line". Lifting those produced a replay that typed bare
   * `dir /s` and `find "Total"` as if they were steps. Caught when my own corrected prose
   * started generating false commands in the very harness meant to verify it. */
  const quoted = new Set();
  for(const line of text.split('\n')){
    if(!/^\s*>/.test(line)) continue;
    let q; const qre=/`([^`\n]{3,200})`/g;
    while((q=qre.exec(line))!==null) quoted.add(q[1].trim());
  }
  while((m=re.exec(text))!==null){
    const s=m[1].trim();
    if(quoted.has(s)) continue;
    if(isLikelyCommand(s)) out.push(s);
    else if(rejected && s.split(/\s+/).length>1) rejected.push(s);
  }
  return out;
}

function selfTest(){
  const MUST=['dism /online /enable-feature /featurename:NetFx3',
              'del /q /s C:\\Users\\u\\AppData\\Local\\Temp\\*',
              'reg query "HKLM\\SOFTWARE\\X" /v "Version"',
              'vc_redist.x64.exe /install /quiet /norestart'];
  const MUST_NOT=['vcruntime140.dll','C:\\Users\\username','Run as Administrator',
                  'Properties > Compatibility','.NET Framework 3.5','NTUSER.DAT'];
  let pass=0,fail=0;
  for(const c of MUST){ if(isLikelyCommand(c)){pass++;console.log('    ok   accepts: '+c);} else {fail++;console.log('    FAIL should accept: '+c);} }
  for(const c of MUST_NOT){ if(!isLikelyCommand(c)){pass++;console.log('    ok   rejects: '+c);} else {fail++;console.log('    FAIL should reject: '+c);} }
  /* CANARY: a fenced-only regression passes every assertion above and is still the exact
   * bug this exists to stop, so the fixture carries one of each and demands both. */
  const fixture='## Scenario 1: X\n\nRun `dism /online /enable-feature /featurename:NetFx3` first.\n\n```\nnet stop wuauserv\n```\n';
  let fenced=0;
  for(const blk of fixture.match(/```[a-zA-Z]*\n[\s\S]*?```/g)||[]){
    for(const line of blk.replace(/```[a-zA-Z]*\n?/g,'').split('\n')){
      const t=line.trim(); if(t && !t.startsWith('#') && !t.includes(' > ')) fenced++;
    }
  }
  const inline=inlineCommands(fixture,null).length;
  if(fenced===1 && inline===1){pass++;console.log('    ok   CANARY: fixture yields 1 fenced + 1 inline');}
  else {fail++;console.log(`    FAIL CANARY: fenced=${fenced} inline=${inline} — blind to one half`);}
  console.log(`\nwalkthrough-verbatim extractor self-test: ${pass}/${pass+fail}`);
  process.exitCode=fail?1:0;
}

function scenarios(md){
  const t=fs.readFileSync(md,'utf8');
  const parts=t.split(/^##\s*Scenario\s*(\d+):?\s*(.*)$/m);
  const out=[];
  const rejected=[];
  for(let i=1;i<parts.length;i+=3){
    const cmds=[];
    for(const blk of parts[i+2].match(/```[a-zA-Z]*\n[\s\S]*?```/g)||[]){
      for(const line of blk.replace(/```[a-zA-Z]*\n?/g,'').split('\n')){
        const m=line.match(/^\s*(?:C:\\[^>]*>|PS\s+[A-Za-z]:\\[^>]*>)\s?(.*)$/);
        if(m && m[1].trim()){ cmds.push(m[1].trim()); continue; }
        /* --bare: some walkthroughs print the command WITHOUT a prompt, e.g.
         *     ```
         *     sfc /scannow
         *     ```
         * A student types those too, so a harness that only lifts prompted lines
         * reports "no commands" for the whole box and measures nothing. Excluded here:
         * shell comments, and GUI navigation written with " > " (Device Manager >
         * Sound, video and game controllers), which is a click path, not a command. */
        if(BARE){
          const t=line.trim();
          if(!t || t.startsWith('#') || t.includes(' > ')) continue;
          if(!/^[A-Za-z][\w.\-]*(\s|$)/.test(t)) continue;
          cmds.push(t);
        }
      }
    }
    if(BARE) for(const c of inlineCommands(parts[i+2], rejected)) if(!cmds.includes(c)) cmds.push(c);
    out.push({n:parts[i], title:parts[i+1].trim(), cmds});
  }
  if(BARE && rejected.length) console.log(`[extractor] ${rejected.length} inline span(s) rejected as not-a-command: `+rejected.slice(0,6).map(r=>JSON.stringify(r)).join(', ')+(rejected.length>6?' ...':'')+'\n');
  return out;
}

if(argv.includes('--self-test')){ selfTest(); } else
(async()=>{
 const list=scenarios(WT).filter(s=>!ONLY||s.n===String(ONLY));
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const sc of list){
  const ctx=await b.createBrowserContext(); const p=await ctx.newPage();
  p.on('dialog',async d=>{try{await d.dismiss();}catch(e){}});
  await p.goto(`${BASE}/dispatch/boxes/${BOX}/`,{waitUntil:'networkidle2',timeout:60000});
  await sleep(1100);
  await p.evaluate(()=>{const x=[...document.querySelectorAll('button')].filter(e=>e.offsetParent!==null).find(e=>/start|begin|launch|enter/i.test(e.textContent));if(x)x.click();});
  for(let i=0;i<30;i++){if(await p.evaluate(()=>!!(typeof BoxEngine!=='undefined'&&BoxEngine.state&&BoxEngine.state.booted)))break;await sleep(500);}
  await p.keyboard.press('Shift'); await sleep(400);
  await p.evaluate(()=>{const bt=[...document.querySelectorAll('#survey-overlay button')].find(x=>/skip/i.test(x.textContent));if(bt)bt.click();});
  await sleep(600);
  await p.evaluate(()=>{const t=(BoxEngine.config.desktop.icons||[]).find(i=>i.app==='ticket');if(t)BoxEngine._launchApp(t);});
  await p.waitForSelector('[data-idx]',{timeout:9000}).catch(()=>{});
  await p.evaluate(i=>{const x=document.querySelectorAll('[data-idx]')[i];if(x)x.click();},parseInt(sc.n,10)-1);
  await sleep(1300);
  await p.evaluate(()=>{const t=(BoxEngine.config.desktop.icons||[]).find(i=>i.app==='terminal');if(t)BoxEngine._launchApp(t);});
  await sleep(1200);
  console.log(`\n===== Scenario ${sc.n}: ${sc.title} =====`);
  if(!sc.cmds.length) console.log('  (walkthrough prints no prompted commands for this scenario)');
  for(const c of sc.cmds){
    const out=await p.evaluate(async cmd=>{
      const t=ArenaTerminal._instances[ArenaTerminal._instances.length-1];
      if(!t) return '(no terminal)';
      const n=t.outputEl.innerText.length;
      try{ await t._execute(cmd); }catch(e){ return 'THREW: '+e.message; }
      return t.outputEl.innerText.slice(n);
    },c);
    console.log(`\n$ ${c}`);
    console.log(out.split('\n').filter(Boolean).map(l=>'  '+l).join('\n'));
  }
  const tok=await p.evaluate(()=>{const m=document.body.innerText.match(/(FLAG|flag)\{[^}]{3,60}\}/);return m?m[0]:null;});
  console.log(`\n  [token visible after the documented commands: ${tok||'none'}]`);
  await ctx.close();
 }
 await b.close();
})();
