// The fix must do TWO things: stop the gradebook write, keep the practice experience.
// Two fixtures: complete the module via the cheat, then assert (a) ModuleProgress.complete never
// fires, and (b) the chips/progress still work so the student is not left with a dead page.
const puppeteer=require('/home/eq/ai-content/hexworth-prime/node_modules/puppeteer');
const M=[['arm-bash-05-loops','echo "for x in a b c do echo done {1..5} while [ -lt ] ((i++)) for f in /etc/*.conf"'],
         ['arm-bash-10-advanced','echo "=( ${x[@]} declare -A declare -a trap set -x getopts"']];
(async()=>{
  const b=await puppeteer.launch({args:['--no-sandbox']});let pass=0;
  for(const [m,cheat] of M){
    const p=await b.newPage(); await p.setCacheEnabled(false);
    await p.evaluateOnNewDocument(()=>{try{localStorage.clear();localStorage.setItem('hexworth_house','code');}catch(e){}});
    await p.goto('http://127.0.0.1:8901/houses/code/armory/bash/'+m+'.module.html',{waitUntil:'domcontentloaded',timeout:30000});
    await new Promise(r=>setTimeout(r,900));
    const r=await p.evaluate((c)=>{
      const rec={wrote:false};
      if(window.ModuleProgress&&ModuleProgress.complete){const o=ModuleProgress.complete;
        ModuleProgress.complete=function(){rec.wrote=true;return o.apply(this,arguments);};}
      const inp=document.querySelector('#terminal input')||document.querySelector('.terminal-input');
      inp.focus(); inp.value=c;
      inp.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',keyCode:13,which:13,bubbles:true}));
      return new Promise(res=>setTimeout(()=>res({
        wrote:rec.wrote,
        chips:document.querySelectorAll('.task-chip.completed').length,
        total:document.querySelectorAll('.task-chip').length,
        honest:/practice, not graded/i.test(document.body.innerText),
      }),500));
    },cheat);
    await p.close();
    const good = r.wrote===false && r.chips>0 && r.honest;
    if(good) pass++;
    console.log('  '+m.padEnd(22)+'gradebook write: '+String(r.wrote).padEnd(6)+
                ' chips '+r.chips+'/'+r.total+'  honest copy: '+r.honest+'  -> '+(good?'PASS':'CHECK'));
  }
  await b.close();
  console.log('\n  '+pass+'/'+M.length+' -- cheat no longer writes to the gradebook; practice UI intact');
})();
