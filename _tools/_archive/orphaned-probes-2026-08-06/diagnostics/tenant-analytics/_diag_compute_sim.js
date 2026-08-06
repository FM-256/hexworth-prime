/* READ-ONLY — prove the map-constrained compute is correct vs the old raw compute, against
 * real ALA progress, incl. a synthetic Matrix cross-course contamination case. No writes; no PII. */
const admin = require('firebase-admin'); admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
global.ADV_LINUX_MAP = null;
eval(require('fs').readFileSync('../_app/tenant/adv-linux-map.js','utf8'));
const MAP = ADV_LINUX_MAP;
const itemIds = {}; let TOTAL = 0;
MAP.chapters.forEach(c => c.items.forEach(i => { itemIds[i.id] = true; TOTAL++; }));

function newPct(mods, qs) { // map-constrained (roster/detail logic)
  const done = {}; mods.forEach(id => done[id]=1); Object.keys(qs).forEach(id => done[id]=1);
  let c = 0; Object.keys(itemIds).forEach(id => { if (done[id]) c++; });
  return Math.round(c / TOTAL * 100);
}
function oldPct(mods, qs) { return Math.round((mods.length + Object.keys(qs).length) / 42 * 100); }

(async () => {
  const snap = await db.collection('tenants/summer-2026/classes/ujIeZwa0KAb4x3Um7LUn/progress').get();
  console.log('MAP items (denominator):', TOTAL);
  let aMods=0,aQ=0,act=0; let maxNew=0; const rows=[];
  snap.forEach(d => {
    const x=d.data()||{}; const mods=x.modulesCompleted||[]; const qs=x.quizScores||{};
    const np=newPct(mods,qs), op=oldPct(mods,qs);
    maxNew=Math.max(maxNew,np);
    if (mods.length||Object.keys(qs).length) { act++; rows.push({np,op,m:mods.length,q:Object.keys(qs).length}); }
    aMods += mods.filter(id=>itemIds[id]).length;
    aQ += Object.keys(qs).filter(id=>itemIds[id]).length;
  });
  console.log('active students:', act, '| max NEW roster pct:', maxNew+'%', '(must be <=100)');
  console.log('sample (new% vs old%, mods/quiz):');
  rows.sort((a,b)=>b.np-a.np).slice(0,6).forEach(r=>console.log(`   new ${String(r.np).padStart(3)}%  old ${String(r.op).padStart(3)}%   mods=${r.m} quiz=${r.q}`));
  const classNew = Math.round((aMods+aQ)/(TOTAL*act)*100);
  console.log('class-report overallPct (NEW, map-constrained):', classNew+'%');

  // CONTAMINATION TEST: take an active student, inject 25 fake Matrix pc-* completions
  const victim = rows[0];
  const fakeMods = MAP.chapters[1].items.map(i=>i.id).slice(0,3) // 3 real ALA ids
    .concat(Array.from({length:25},(_,i)=>'pc-ard-'+String(i+1).padStart(2,'0')+'-pres')); // 25 foreign
  console.log('\nCONTAMINATION (3 real ALA + 25 foreign pc-* in modulesCompleted):');
  console.log('   OLD raw compute pct:', oldPct(fakeMods,{}) + '%  <-- inflated / can exceed 100');
  console.log('   NEW map-constrained pct:', newPct(fakeMods,{}) + '%  <-- only the 3 real ALA items counted');
  process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
