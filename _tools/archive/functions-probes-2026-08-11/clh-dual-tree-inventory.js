// READ-ONLY: map both CLH quiz trees per module. For each clh-001..031: Page A (houses/script/clh)
// moduleId+Qcount, Page B (courses/clh/modules) moduleId+Qcount, whether they COLLIDE (share a
// moduleId => one key cannot grade both if option orders differ), and whether each used key exists
// with a matching questionCount. No writes.
const fs=require('fs'),path=require('path');
const j=JSON.parse(fs.readFileSync('quiz_keys.json','utf8'));
const R=path.resolve(__dirname,'..');
const A=id=>path.join(R,'_app/houses/script/clh',`script-${id}.quiz.html`);
const B=id=>path.join(R,'_app/houses/script/courses/clh/modules',id,'script-quiz.quiz.html');
function info(f){
  if(!fs.existsSync(f))return null;
  const t=fs.readFileSync(f,'utf8');
  const mid=(t.match(/moduleId:\s*'([^']*)'/)||[])[1]||'?';
  const qn=(t.match(/^\s+question:/gm)||[]).length;
  const sg=/serverGrading:\s*true/.test(t);
  return {mid,qn,sg};
}
let collide=[],splitOK=[],keyIssue=[];
for(let n=1;n<=31;n++){
  const id='clh-'+String(n).padStart(3,'0');
  const a=info(A(id)),b=info(B(id));
  const am=a?a.mid:'-',bm=b?b.mid:'-';
  const same=a&&b&&am===bm;
  // key length check for each distinct moduleId
  const chk=m=>{const k=j[m];if(!k)return `${m}:NOKEY`;return k.answers.length===(m===am&&a?a.qn:(m===bm&&b?b.qn:k.answers.length))?`${m}:ok(${k.answers.length})`:`${m}:LEN${k.answers.length}`;};
  const line=`${id}: A[${am} q${a?a.qn:'-'}] B[${bm} q${b?b.qn:'-'}] ${same?'<< SHARE KEY':''}`;
  if(same){
    // collision only matters if question counts/orders can differ; flag all shared for review
    const kk=j[am];
    const aOK=kk&&a&&kk.answers.length===a.qn, bOK=kk&&b&&kk.answers.length===b.qn;
    collide.push(`${line}  key=${kk?JSON.stringify(kk.answers):'NONE'} lenA_ok=${aOK} lenB_ok=${bOK}`);
  } else {
    splitOK.push(line+`  keyA=${j[am]?j[am].answers.length:'-'} keyB=${j[bm]?j[bm].answers.length:'-'}`);
  }
}
console.log('\n=== SHARED-KEY (both pages same moduleId => potential mis-grade if orders differ) ===');
collide.forEach(l=>console.log('  '+l));
console.log('\n=== SPLIT (different moduleIds => independently keyable) ===');
splitOK.forEach(l=>console.log('  '+l));
console.log(`\n  totals: shared=${collide.length} split=${splitOK.length}`);
process.exit(0);
