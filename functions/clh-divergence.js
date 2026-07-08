// READ-ONLY: for the 29 shared-key CLH modules, compare Page A vs Page B question text + option
// ORDER. If identical, one key grades both (fine). If divergent, the single key mis-grades one page.
const fs=require('fs'),path=require('path');
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
const SHARED=[]; for(let n=1;n<=31;n++){const id='clh-'+String(n).padStart(3,'0'); if(id==='clh-001'||id==='clh-003')continue; SHARED.push(id);}
let identical=[],divergent=[];
for(const id of SHARED){
  const a=parse(A(id)),b=parse(B(id));
  if(!a||!b){divergent.push(`${id}: MISSING PAGE`);continue;}
  const sameCount=a.length===b.length;
  // compare question text + option order per question
  let diffs=[];
  const n=Math.max(a.length,b.length);
  for(let i=0;i<n;i++){
    const qa=a[i],qb=b[i];
    if(!qa||!qb){diffs.push(`Q${i+1} missing`);continue;}
    if(qa.q!==qb.q){diffs.push(`Q${i+1} text`);continue;}
    // option order compare
    const oa=JSON.stringify(qa.opts),ob=JSON.stringify(qb.opts);
    if(oa!==ob)diffs.push(`Q${i+1} optorder`);
  }
  if(diffs.length===0&&sameCount) identical.push(id);
  else divergent.push(`${id}: ${diffs.slice(0,6).join(', ')}${diffs.length>6?'...':''}`);
}
console.log('\n=== IDENTICAL A==B (shared key grades both correctly) ===');
console.log('  '+(identical.join(', ')||'none'));
console.log('\n=== DIVERGENT (shared key MIS-GRADES one page) ===');
divergent.forEach(l=>console.log('  '+l));
console.log(`\n  totals: identical=${identical.length} divergent=${divergent.length} (of 29 shared)`);
process.exit(0);
