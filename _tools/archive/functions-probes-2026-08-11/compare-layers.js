// DECISIVE: for each of the 11, show Layer A (student-served) options+explanation, the
// ORIGINAL key (from the pre-write backup), and MY written key. Determine which matches Layer A.
const fs=require('fs'),path=require('path');
const backup=JSON.parse(fs.readFileSync('clh-keys-backup-2026-07-08.json','utf8'));
const MINE={'clh-005':[1,2,2,1,1],'clh-006':[0,2,1,1,1],'clh-007':[1,1,3,0,0],'clh-008':[1,2,1,1,1],'clh-010':[1,1,1,2,2,1],'clh-011':[1,1,2,1,1],'clh-012':[1,2,1,1,2],'clh-013':[1,2,2,1,1],'clh-014':[1,0,1,1,2],'clh-022':[0,1,2,3,0],'clh-027':[1,1,1,1,1]};
const AROOT=path.resolve(__dirname,'../_app/houses/script/clh');
function parseA(id){
  const f=path.join(AROOT,`script-${id}.quiz.html`); if(!fs.existsSync(f))return null;
  const t=fs.readFileSync(f,'utf8'); const qs=[];
  const re=/question:\s*'((?:\\'|[^'])*)'[\s\S]*?options:\s*\[([\s\S]*?)\][\s\S]*?explanation:\s*'((?:\\'|[^'])*)'/g;
  let m; while((m=re.exec(t))){const opts=[...m[2].matchAll(/'((?:\\'|[^'])*)'/g)].map(o=>o[1].replace(/<[^>]+>/g,''));qs.push({q:m[1].replace(/<[^>]+>/g,''),opts,ex:m[3]});}
  return qs;
}
for(const id of Object.keys(MINE)){
  const qs=parseA(id)||[]; const orig=(backup[id]||{}).answers||[];
  console.log(`\n### ${id}  Layer A has ${qs.length} Qs | ORIGINAL(backup)=${JSON.stringify(orig)} | MINE=${JSON.stringify(MINE[id])}`);
  qs.forEach((q,i)=>{
    const o=orig[i], mine=MINE[id][i];
    console.log(`  Q${i+1}: ${q.q.slice(0,60)}`);
    console.log(`     orig->[${o}] "${q.opts[o]??'?'}"  | mine->[${mine}] "${q.opts[mine]??'?'}"`);
    console.log(`     expl: ${q.ex.slice(0,85)}`);
  });
}
process.exit(0);
