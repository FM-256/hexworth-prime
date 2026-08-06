/* READ-ONLY — full WSA progress integrity check. For every WSA student, inspect ALL places
 * progress can live (users/{uid} root fields + subcollections + tenant class doc). PII redacted
 * (no names/emails/photo/callsign). Goal: is WSA work present somewhere, or genuinely absent? */
const admin=require('firebase-admin'); admin.initializeApp({projectId:'hexworth-prime'});
const db=admin.firestore();
const TCLASS='tenants/summer-2026/classes/87KLCXr9hYSgdIKNuqXE';
const PII=new Set(['displayName','displayNameLower','email','firstName','lastName','photoURL','callsign','callsignLower','name']);
const redact=o=>{ if(!o||typeof o!=='object')return o; const r=Array.isArray(o)?[]:{}; for(const k in o){ if(PII.has(k)){r[k]='[redacted]';continue;} r[k]=o[k]; } return r; };
// summarize any value: arrays -> length+sample; objects -> keys; else value
const summ=v=>Array.isArray(v)?`[${v.length}] ${JSON.stringify(v.slice(0,40))}`:(v&&typeof v==='object'?`{keys: ${Object.keys(v).join(',')}}`:JSON.stringify(v));
(async()=>{
  const prog=await db.collection(TCLASS+'/progress').get();
  console.log('WSA students:', prog.size, '\n');
  let i=0;
  for (const d of prog.docs){
    i++; const uid=d.id; const short=uid.slice(0,6)+'…';
    const t=d.data()||{};
    const us=await db.doc('users/'+uid).get(); const u=us.exists?us.data():{};
    // collect every field in users/{uid} that looks progress-bearing
    const progFields={};
    for (const k in u){
      if (PII.has(k)) continue;
      if (/module|quiz|lab|ctf|flag|progress|complete|course|xp|level|achiev|streak/i.test(k)) progFields[k]=summ(u[k]);
    }
    // subcollections under users/{uid}
    const subs=await db.doc('users/'+uid).listCollections();
    const subInfo=[];
    for (const c of subs){ const cs=await c.get(); subInfo.push(`${c.id}(${cs.size})`); }
    console.log(`#${i} ${short}`);
    console.log('   TENANT class doc: modulesCompleted='+summ(t.modulesCompleted)+'  quizScores='+summ(t.quizScores)+'  labsCompleted='+summ(t.labsCompleted));
    console.log('   users/{uid} progress fields:');
    Object.keys(progFields).forEach(k=>console.log('       '+k+' = '+progFields[k]));
    console.log('   users/{uid} subcollections: '+(subInfo.join(', ')||'(none)'));
    console.log('');
  }
  process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
