const admin=require('firebase-admin');
try{ admin.initializeApp({projectId:'hexworth-prime'}); }catch(e){}
const db=admin.firestore();
const reg=require('./quiz_keys.json');
const quizId='shield-sy0-701-practice-exam-1';
const entry=reg[quizId];
(async()=>{
  await db.doc('quiz_keys/'+quizId).set(entry,{merge:false});
  const d=(await db.doc('quiz_keys/'+quizId).get()).data();
  const dist=[0,0,0,0];d.answers.forEach(x=>dist[x]++);
  console.log('re-seeded: answers='+d.answers.length+' pass='+d.passingScore+' dist='+JSON.stringify(dist));
  process.exit(0);
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
