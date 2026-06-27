const admin=require('firebase-admin');try{admin.initializeApp({projectId:'hexworth-prime'});}catch(e){}
const db=admin.firestore();const reg=require('./quiz_keys.json');const id='shield-sy0-701-practice-exam-2';
(async()=>{await db.doc('quiz_keys/'+id).set(reg[id],{merge:false});const d=(await db.doc('quiz_keys/'+id).get()).data();console.log('Firestore seeded:',id,'answers='+d.answers.length,'pass='+d.passingScore);process.exit(0);})().catch(e=>{console.error(e.message);process.exit(1);});
