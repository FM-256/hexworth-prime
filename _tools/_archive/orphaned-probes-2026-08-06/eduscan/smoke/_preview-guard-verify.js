// Verifies the guard fix on the PREVIEW channel — the standing-deploy condition.
// Auth does not work on preview channels, so this checks what preview CAN prove:
// the guards resolve and the unlock path persists (localStorage-based, no auth needed).
const puppeteer=require('puppeteer');
const BASE=process.env.BASE;
const CASES=[
 ['/houses/cloud/games/cloud-aws-sts.html','game_awssts','cloud'],
 ['/houses/code/games/code-kill-nine.applet.html','game_kill9','code'],
 ['/houses/shield/games/shield-threat-runner.applet.html','game_threatrunner','shield'],
 ['/houses/web/games/web-packet-run.applet.html','game_packetrun','web'],
];
let pass=0,fail=0;
(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 try{
  for(const [u,id,house] of CASES){
   const p=await b.newPage();
   await p.evaluateOnNewDocument(h=>{localStorage.clear();localStorage.setItem('hexworth_house',h);},house);
   await p.goto(BASE+u,{waitUntil:'domcontentloaded',timeout:30000});
   await new Promise(r=>setTimeout(r,1500));
   const r=await p.evaluate(a=>{
     const o={loaded:typeof AchievementManager,onWindow:typeof window.AchievementManager};
     try{ o.guard=!!(typeof AchievementManager!=='undefined'&&AchievementManager);
          if(o.guard){o.unlocked=AchievementManager.unlock(a);
                      o.persisted=(AchievementManager.getUnlockedIds()||[]).indexOf(a)!==-1;} }
     catch(e){o.err=e.message;}
     return o;},id);
   const ok=r.loaded==='object'&&r.onWindow==='undefined'&&r.guard===true&&r.unlocked===true&&r.persisted===true;
   console.log(`  ${ok?'PASS':'FAIL'}  ${u}  guard=${r.guard} unlocked=${r.unlocked} persisted=${r.persisted}`);
   ok?pass++:fail++;
   await p.close();
  }
 } finally { await b.close().catch(()=>{}); }
 console.log(`\n${pass} passed, ${fail} failed on PREVIEW`);
 process.exit(fail?1:0);
})();
