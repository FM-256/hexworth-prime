// READ-ONLY: report reveal flags on CLH quiz keys
const admin=require('firebase-admin'); if(!admin.apps.length)admin.initializeApp({projectId:'hexworth-prime'});
const db=admin.firestore();
(async()=>{
  let withReveal=0, without=[], withExpl=0;
  for(let n=2;n<=31;n++){
    const id='clh-'+String(n).padStart(3,'0');
    const s=await db.doc(`quiz_keys/${id}`).get(); if(!s.exists){without.push(id+'(nokey)');continue;}
    const d=s.data()||{};
    if(d.revealToAll) withReveal++; else without.push(id);
    if(Array.isArray(d.explanations)&&d.explanations.length>0) withExpl++;
  }
  console.log('  revealToAll=true:', withReveal, '/ 30');
  console.log('  has explanations:', withExpl, '/ 30');
  console.log('  MISSING revealToAll:', without.length?without.join(' '):'none');
  process.exit(0);
})();
