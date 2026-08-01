// TWO FIXTURES. The cheat must award NOTHING; a real query must still award.
// A gate that blocks everything passes a "does it block the cheat" test while breaking the module.
const puppeteer=require('/home/eq/ai-content/hexworth-prime/node_modules/puppeteer');
async function run(b,mod,cheat,honest){
  const out={};
  for(const [label,cmd] of [['cheat',cheat],['honest',honest]]){
    const p=await b.newPage(); await p.setCacheEnabled(false);
    await p.evaluateOnNewDocument(()=>{try{localStorage.clear();localStorage.setItem('hexworth_house','code');}catch(e){}});
    await p.goto('http://127.0.0.1:8901/houses/code/armory/sql/'+mod+'.module.html',{waitUntil:'domcontentloaded',timeout:30000});
    await new Promise(r=>setTimeout(r,900));
    const r=await p.evaluate((c)=>{
      const rec={wrote:false};
      if(window.ModuleProgress&&ModuleProgress.complete){const o=ModuleProgress.complete;
        ModuleProgress.complete=function(){rec.wrote=true;return o.apply(this,arguments);};}
      const inp=document.querySelector('#terminal input')||document.querySelector('.terminal-input');
      inp.focus(); inp.value=c;
      inp.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',keyCode:13,which:13,bubbles:true}));
      return new Promise(res=>setTimeout(()=>res({wrote:rec.wrote,
        chips:document.querySelectorAll('.task-chip.completed').length,
        total:document.querySelectorAll('.task-chip').length}),600));
    },cmd);
    await p.close(); out[label]=r;
  }
  const good = out.cheat.chips===0 && out.honest.chips>0;
  console.log('  '+mod.padEnd(22)+'cheat '+out.cheat.chips+'/'+out.cheat.total+
              '   honest '+out.honest.chips+'/'+out.honest.total+'   -> '+(good?'PASS':'CHECK'));
  return good;
}
(async()=>{
  const b=await puppeteer.launch({args:['--no-sandbox']});let ok=0,n=0;
  n++; ok+=await run(b,'arm-sql-07-crud','echo "insert into update delete from begin rollback"',
    "INSERT INTO users (username,email,role,department,created_at,is_active) VALUES ('zz','z@b.c','viewer','IT','2024-01-01',1)")?1:0;
  n++; ok+=await run(b,'arm-sql-02-select','echo "select * from where order by distinct"',
    'SELECT * FROM users')?1:0;
  await b.close();
  console.log('\n  '+ok+'/'+n+' modules: cheat blocked AND honest work still credited');
})();
