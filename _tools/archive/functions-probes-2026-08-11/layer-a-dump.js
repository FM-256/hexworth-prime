// READ-ONLY: dump LAYER A CLH quizzes (question + options, no explanation) vs current Firestore key.
const admin=require('firebase-admin'),fs=require('fs'),path=require('path');
if(!admin.apps.length)admin.initializeApp({projectId:'hexworth-prime'});
const db=admin.firestore();
const AROOT=path.resolve(__dirname,'../_app/houses/script/clh');
function parseA(id){
  const f=path.join(AROOT,`script-${id}.quiz.html`); if(!fs.existsSync(f))return null;
  const t=fs.readFileSync(f,'utf8'); const qs=[];
  // options array terminates at a newline-indented ']' (so inline [PID]/[@] brackets are safe)
  const re=/question:\s*'((?:\\'|[^'])*)'\s*,\s*options:\s*\[([\s\S]*?)\n\s*\]/g;
  let m;
  while((m=re.exec(t))){
    const opts=[...m[2].matchAll(/'((?:\\'|[^'])*)'/g)].map(o=>o[1].replace(/<[^>]+>/g,''));
    qs.push({q:m[1].replace(/<[^>]+>/g,''),opts});
  }
  return qs;
}
(async()=>{
  for(let n=1;n<=31;n++){
    const id='clh-'+String(n).padStart(3,'0');
    const qs=parseA(id); if(qs===null){console.log(`\n### ${id}: NO LAYER A FILE`);continue;}
    const key=((await db.doc('quiz_keys/'+id).get()).data()||{}).answers||[];
    const mism=qs.length!==key.length;
    console.log(`\n### ${id}  key=${JSON.stringify(key)}  (LayerA Qs=${qs.length}${mism?' !!COUNT MISMATCH':''})`);
    qs.forEach((q,i)=>{
      console.log(`  Q${i+1}: ${q.q}`);
      q.opts.forEach((o,oi)=>console.log(`      ${oi}: ${o}${oi===key[i]?'  <== KEY':''}`));
    });
  }
  process.exit(0);
})().catch(e=>{console.error(e.message);process.exit(1);});
