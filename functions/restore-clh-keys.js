// EMERGENCY RESTORE: revert the 31 CLH quiz_keys docs to their exact pre-write state
// (clh-keys-backup-2026-07-08.json), undoing the erroneous Layer-B-derived write.
// set() without merge = full overwrite back to the captured original doc.
const admin=require('firebase-admin'),fs=require('fs');
if(!admin.apps.length)admin.initializeApp({projectId:'hexworth-prime'});
const db=admin.firestore();
const backup=JSON.parse(fs.readFileSync('clh-keys-backup-2026-07-08.json','utf8'));
(async()=>{
  let n=0;
  for(const [id,data] of Object.entries(backup)){
    if(!data){console.log('  skip '+id+' (was absent)');continue;}
    await db.doc('quiz_keys/'+id).set(data); // full overwrite to original
    n++;
  }
  console.log('  restored '+n+' docs to pre-write state');
  // verify clh-027 + clh-022 + revealToAll gone
  for(const id of ['clh-022','clh-027','clh-005']){
    const d=(await db.doc('quiz_keys/'+id).get()).data()||{};
    console.log('  '+id+': answers='+JSON.stringify(d.answers)+' revealToAll='+d.revealToAll);
  }
  process.exit(0);
})().catch(e=>{console.error(e.message);process.exit(1);});
