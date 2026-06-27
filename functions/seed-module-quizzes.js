const admin=require('firebase-admin');try{admin.initializeApp({projectId:'hexworth-prime'});}catch(e){}
const db=admin.firestore();const keys=require('/tmp/secplus-module-keys.json');
(async()=>{
  let n=0;const batch=db.batch();
  for(const id in keys){ batch.set(db.doc('quiz_keys/'+id),keys[id],{merge:false}); n++; }
  await batch.commit();
  console.log('Firestore: seeded '+n+' module-quiz keys');
  process.exit(0);
})().catch(e=>{console.error(e.message);process.exit(1);});
