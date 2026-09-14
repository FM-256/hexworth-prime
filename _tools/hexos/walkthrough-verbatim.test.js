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
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function scenarios(md){
  const t=fs.readFileSync(md,'utf8');
  const parts=t.split(/^##\s*Scenario\s*(\d+):?\s*(.*)$/m);
  const out=[];
  for(let i=1;i<parts.length;i+=3){
    const cmds=[];
    for(const blk of parts[i+2].match(/```[a-zA-Z]*\n[\s\S]*?```/g)||[]){
      for(const line of blk.replace(/```[a-zA-Z]*\n?/g,'').split('\n')){
        const m=line.match(/^\s*(?:C:\\[^>]*>|PS\s+[A-Za-z]:\\[^>]*>)\s?(.*)$/);
        if(m && m[1].trim()) cmds.push(m[1].trim());
      }
    }
    out.push({n:parts[i], title:parts[i+1].trim(), cmds});
  }
  return out;
}

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
