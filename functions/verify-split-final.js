// Confirm live Firestore: each clh-NNN-legacy = Page A key, each clh-NNN = Page B key.
const admin=require('firebase-admin'); if(!admin.apps.length)admin.initializeApp({projectId:'hexworth-prime'});
const db=admin.firestore();
const A={'clh-005':[1,2,1,0,2],'clh-006':[1,1,1,2,1],'clh-007':[1,1,1,2,1],'clh-008':[1,1,2,2,2],'clh-010':[1,1,2,1,2,0],'clh-011':[1,2,1,1,2],'clh-012':[1,1,2,1,2],'clh-013':[1,0,2,1,2],'clh-014':[2,2,1,2,1],'clh-022':[1,1,1,1,1],'clh-023':[1,1,1,1,1],'clh-027':[1,3,0,2,0]};
const B={'clh-005':[1,2,2,1,1],'clh-006':[0,2,1,1,1],'clh-007':[1,1,3,0,0],'clh-008':[1,2,1,1,1],'clh-010':[1,1,1,2,2,1],'clh-011':[1,1,2,1,1],'clh-012':[1,2,1,1,2],'clh-013':[1,2,2,1,1],'clh-014':[1,0,1,1,2],'clh-022':[0,1,2,3,0],'clh-023':[2,0,1,3,0],'clh-027':[1,1,1,1,1]};
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
(async()=>{
  let bad=0;
  for(const id of Object.keys(A)){
    const leg=((await db.doc('quiz_keys/'+id+'-legacy').get()).data()||{}).answers;
    const base=((await db.doc('quiz_keys/'+id).get()).data()||{}).answers;
    const lok=eq(leg,A[id]), bok=eq(base,B[id]);
    if(!lok||!bok){bad++;console.log(`  MISMATCH ${id}: legacy=${JSON.stringify(leg)} want ${JSON.stringify(A[id])} [${lok?'ok':'BAD'}] | base=${JSON.stringify(base)} want ${JSON.stringify(B[id])} [${bok?'ok':'BAD'}]`);}
  }
  console.log(bad===0?'  ALL 24 KEYS CORRECT (12 legacy=PageA, 12 base=PageB)':`  ${bad} MISMATCH`);
  process.exit(0);
})();
