// For each app that FLIPPED from unreached to reached, show the exact file:line that reaches it,
// so "21 became 2" is a claim about the apps and not about the scanner's permissiveness.
// NOTE, added after a reviewer checked this artifact rather than the claim it was cited for:
// the original version used its OWN inline comment-only strip, so it never exercised the gate's
// real stripDead() and could not show what it was offered as proof of. It now extracts stripDead
// from the shipped gate, the same way the gate's own test does.
const fs=require('fs'),path=require('path');
const GATE=path.resolve(__dirname,'../../../hexos/dead-entry-gate.js');
const gsrc=fs.existsSync(GATE)?fs.readFileSync(GATE,'utf8'):'';
const gm=gsrc.match(/function stripDead\(src\) \{[\s\S]*?\n\}/);
const stripDead=gm?new Function('src','return ('+gm[0]+')(src)')
                  :(x=>x.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:])\/\/[^\n]*/g,'$1'));
const APP=path.resolve('/home/eq/ai-content/hexworth-prime/_app');
const FLIPPED=['aws-ccp','aws-developer','azure-fundamentals','casp-plus','cmmc','comptia-linux',
 'cryptography-track','security-plus-crypto','security-operations','devops-fundamentals',
 'algorithms','api-design','cloud-patterns','code-cortex','databases','announcements',
 'wall-of-shame','intro-networks','comptia-network'];
const apps=JSON.parse(fs.readFileSync(path.join(APP,'data/hex-apps.json'),'utf8')).apps;
function walk(d,out){out=out||[];for(const e of fs.readdirSync(d,{withFileTypes:true})){
 if(e.name.startsWith('.')||e.name==='node_modules'||e.name==='_archive')continue;
 const p=path.join(d,e.name);if(e.isDirectory())walk(p,out);
 else if(e.name.endsWith('.html')||e.name.endsWith('.js'))out.push(p);}return out;}
const files=walk(APP);
let clean=0,only=0;
for(const id of FLIPPED){
  const a=apps.find(x=>x.id===id); if(!a){console.log('  '+id+': NOT IN MANIFEST');continue;}
  const target=a.entry.replace(/^\//,'').replace(/index\.html$/,'');
  const hits=[];
  for(const f of files){
    const raw=fs.readFileSync(f,'utf8');
    const stripped=stripDead(raw);
    if(f===path.join(APP,a.entry.replace(/^\//,'')))continue;      // its own page
    const inLive=stripped.includes(target), inRaw=raw.includes(target);
    if(inLive)hits.push({f:path.relative(APP,f),live:true});
    else if(inRaw)hits.push({f:path.relative(APP,f),live:false});
  }
  const live=hits.filter(h=>h.live);
  if(live.length){clean++;console.log('  ok   '+id.padEnd(20)+' live code: '+live.slice(0,2).map(h=>h.f).join(', '));}
  else{only++;console.log('  ONLY-COMMENT '+id+' -> '+hits.slice(0,2).map(h=>h.f).join(', '));}
}
console.log('\n  '+clean+' reached by LIVE code, '+only+' reached only by commented-out text');
