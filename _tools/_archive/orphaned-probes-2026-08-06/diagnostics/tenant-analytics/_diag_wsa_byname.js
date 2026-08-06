/* READ-ONLY — operator-requested: list WSA progress data by student name.
 * For each of the 17 WSA-class students, find every WSA-related item across all
 * the places it can live. WSA signal = id contains 'wsa'. */
const admin=require('firebase-admin'); admin.initializeApp({projectId:'hexworth-prime'});
const db=admin.firestore();
const TCLASS='tenants/summer-2026/classes/87KLCXr9hYSgdIKNuqXE';
const isWsa=s=>typeof s==='string' && s.toLowerCase().includes('wsa');
(async()=>{
  const prog=await db.collection(TCLASS+'/progress').get();
  let withData=0, totalItems=0;
  const lines=[];
  for (const d of prog.docs){
    const uid=d.id; const t=d.data()||{};
    const us=await db.doc('users/'+uid).get(); const u=us.exists?us.data():{};
    const name=u.displayName||t.displayName||u.callsign||'(no name)';
    const mods=(u.modulesCompleted||[]).filter(isWsa);
    const labs=(u.labsCompleted||[]).filter(isWsa);
    const quizKeys=Object.keys(u.quizzes||{}).filter(isWsa);
    const tMods=(t.modulesCompleted||[]).filter(isWsa);
    const tQuiz=Object.keys(t.quizScores||{}).filter(isWsa);
    // subcollections: quiz_attempts / lab_attempts whose doc id references wsa
    let qa=[], la=[];
    try{ const s=await db.collection('users/'+uid+'/quiz_attempts').get(); qa=s.docs.map(x=>x.id).filter(isWsa);}catch(e){}
    try{ const s=await db.collection('users/'+uid+'/lab_attempts').get(); la=s.docs.map(x=>x.id).filter(isWsa);}catch(e){}
    const n=mods.length+labs.length+quizKeys.length+qa.length+la.length;
    totalItems+=n; if(n>0) withData++;
    lines.push({name, uid:uid.slice(0,6), n, mods, labs, quizKeys, qa, la, tMods, tQuiz});
  }
  lines.sort((a,b)=>b.n-a.n);
  console.log('WSA class: '+prog.size+' students   |   with ANY WSA data: '+withData+'   |   total WSA items found: '+totalItems+'\n');
  for (const l of lines){
    console.log('● '+l.name+'  ('+l.uid+'…)   — '+l.n+' WSA item(s)');
    if(l.mods.length)  console.log('     modules (personal):  '+l.mods.join(', '));
    if(l.labs.length)  console.log('     labs (personal):     '+l.labs.join(', '));
    if(l.quizKeys.length) console.log('     quizzes (personal):  '+l.quizKeys.join(', '));
    if(l.qa.length)    console.log('     quiz_attempts:       '+l.qa.join(', '));
    if(l.la.length)    console.log('     lab_attempts:        '+l.la.join(', '));
    if(l.tMods.length||l.tQuiz.length) console.log('     IN CLASS DOC:        '+[...l.tMods,...l.tQuiz].join(', '));
    if(l.n===0) console.log('     (no WSA items found in any record)');
  }
  process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
