const fs=require('fs');
const admin=require('firebase-admin');
try{ admin.initializeApp({projectId:'hexworth-prime'}); }catch(e){}
const db=admin.firestore();
const ak=JSON.parse(fs.readFileSync('./_exam-keys/sy0-701-practice-exam-1.answerkey.json','utf8'));
const quizId=ak.quizId; const answers=ak.answers;
const entry={ answers, passingScore:83, questionCount:answers.length };
(async()=>{
  if(answers.length!==90){console.log('BAD answer count:',answers.length);process.exit(1);}
  // 1. static registry
  const reg=JSON.parse(fs.readFileSync('./quiz_keys.json','utf8'));
  reg[quizId]=entry;
  fs.writeFileSync('./quiz_keys.json', JSON.stringify(reg,null,2)+'\n');
  console.log('static quiz_keys.json updated for',quizId);
  // 2. seed Firestore
  await db.doc('quiz_keys/'+quizId).set(entry,{merge:true});
  console.log('Firestore quiz_keys/'+quizId+' seeded');
  // 3. readback verify
  const d=await db.doc('quiz_keys/'+quizId).get();
  const dd=d.data();
  console.log('readback: exists='+d.exists+' answers='+(dd.answers||[]).length+' qCount='+dd.questionCount+' pass='+dd.passingScore);
  process.exit(0);
})().catch(e=>{console.error('ERR:',e.message);process.exit(1);});
