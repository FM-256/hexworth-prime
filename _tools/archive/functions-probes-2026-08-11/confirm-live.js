const admin=require('firebase-admin'); if(!admin.apps.length)admin.initializeApp({projectId:'hexworth-prime'});
const db=admin.firestore();
const EXP={'clh-005':[1,2,2,1,1],'clh-006':[0,2,1,1,1],'clh-007':[1,1,3,0,0],'clh-008':[1,2,1,1,1],'clh-010':[1,1,1,2,2,1],'clh-011':[1,1,2,1,1],'clh-012':[1,2,1,1,2],'clh-013':[1,2,2,1,1],'clh-014':[1,0,1,1,2],'clh-022':[0,1,2,3,0],'clh-027':[1,1,1,1,1]};
(async()=>{let ok=0,bad=0;
 for(const [id,e] of Object.entries(EXP)){const d=(await db.doc('quiz_keys/'+id).get()).data()||{};
   const m=JSON.stringify(d.answers)===JSON.stringify(e)&&d.revealToAll===true;
   if(m)ok++;else{bad++;console.log('  MISMATCH '+id+': answers='+JSON.stringify(d.answers)+' revealToAll='+d.revealToAll);}}
 console.log('  answers+revealToAll correct: '+ok+'/11'+(bad?' ('+bad+' BAD)':''));
 // also confirm revealToAll on the other 20
 let r=0; for(let n=1;n<=31;n++){const id='clh-'+String(n).padStart(3,'0');const d=(await db.doc('quiz_keys/'+id).get()).data()||{};if(d.revealToAll)r++;}
 console.log('  revealToAll on all CLH: '+r+'/31');
 process.exit(0);})();
