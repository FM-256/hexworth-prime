// READ-ONLY: for each divergent module, dump Page A and Page B (all Qs + options w/ indices) +
// the current shared clh-NNN key, so the correct key for EACH page can be derived + verified.
const fs=require('fs'),path=require('path');
const j=JSON.parse(fs.readFileSync('quiz_keys.json','utf8'));
const R=path.resolve(__dirname,'..');
const A=id=>path.join(R,'_app/houses/script/clh',`script-${id}.quiz.html`);
const B=id=>path.join(R,'_app/houses/script/courses/clh/modules',id,'script-quiz.quiz.html');
function parse(f){
  if(!fs.existsSync(f))return null;
  const t=fs.readFileSync(f,'utf8'); const qs=[];
  const re=/question:\s*'((?:\\'|[^'])*)'\s*,\s*options:\s*\[([\s\S]*?)\n\s*\]/g; let m;
  while((m=re.exec(t))){
    const opts=[...m[2].matchAll(/'((?:\\'|[^'])*)'/g)].map(o=>o[1].replace(/<[^>]+>/g,'').trim());
    qs.push({q:m[1].replace(/<[^>]+>/g,'').trim(),opts});
  }
  return qs;
}
const DIV=['clh-005','clh-006','clh-007','clh-008','clh-009','clh-010','clh-011','clh-012','clh-013','clh-014','clh-022','clh-023','clh-027'];
for(const id of DIV){
  console.log(`\n############### ${id}  (current shared key clh-NNN = ${JSON.stringify((j[id]||{}).answers)}) ###############`);
  for(const [label,f] of [['PAGE A (houses/script/clh)',A(id)],['PAGE B (courses/clh/modules)',B(id)]]){
    const qs=parse(f)||[];
    console.log(`\n--- ${label}  (${qs.length} Qs) ---`);
    qs.forEach((q,i)=>{console.log(`  Q${i+1}: ${q.q}`); q.opts.forEach((o,oi)=>console.log(`      ${oi}: ${o}`));});
  }
}
process.exit(0);
