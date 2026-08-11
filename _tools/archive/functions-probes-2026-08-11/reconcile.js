// Confirm pass1==pass2, compare Page A keys to current clh-NNN keys, and derive the change set.
const fs=require('fs');
const j=JSON.parse(fs.readFileSync('quiz_keys.json','utf8'));
// Both passes produced identical output; encode it once (A + B per module).
const D={
 'clh-005':{A:[1,2,1,0,2],B:[1,2,2,1,1]},'clh-006':{A:[1,1,2,2,1],B:[0,2,1,1,1]},
 'clh-007':{A:[1,1,1,2,1],B:[1,1,3,0,0]},'clh-008':{A:[1,1,2,2,2],B:[1,2,1,1,1]},
 'clh-009':{A:[1,1,1,2,1],B:[1,1,1,2,1]},'clh-010':{A:[1,1,2,1,2,0],B:[1,1,1,2,2,1]},
 'clh-011':{A:[1,2,1,1,2],B:[1,1,2,1,1]},'clh-012':{A:[1,1,2,1,2],B:[1,2,1,1,2]},
 'clh-013':{A:[1,0,2,1,2],B:[1,2,2,1,1]},'clh-014':{A:[2,2,1,2,1],B:[1,0,1,1,2]},
 'clh-022':{A:[1,1,1,1,1],B:[0,1,2,3,0]},'clh-023':{A:[1,1,1,1,1],B:[2,0,1,3,0]},
 'clh-027':{A:[1,3,0,2,0],B:[1,1,1,1,1]},
};
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
console.log('module | curKey | PageA | PageB | curMatches | action');
for(const [id,d] of Object.entries(D)){
  const cur=j[id].answers;
  const matchesA=eq(cur,d.A), matchesB=eq(cur,d.B);
  const noSplit=eq(d.A,d.B); // page A and B key identical => no split needed
  const who = matchesA&&matchesB?'BOTH':matchesA?'A':matchesB?'B':'NEITHER';
  let action;
  if(noSplit) action='NONE (A==B, shared key ok)';
  else action=`legacy=${JSON.stringify(d.A)} ; clh-NNN=${JSON.stringify(d.B)}${matchesB?' (already B)':' (RESEED)'}`;
  console.log(`${id} | ${JSON.stringify(cur)} | ${JSON.stringify(d.A)} | ${JSON.stringify(d.B)} | ${who} | ${action}`);
}
