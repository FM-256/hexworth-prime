/* QC config for the Access Control Architect lab (the gold-standard reference).
   Drives the real lab to a certified state and back, and proves the decision
   engine is correct + discriminating. Consumed by _tools/labkit/lab-qc.mjs. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const LAB  = 'houses/shield/labs/shield-access-control.lab.html';

// The correct least-privilege policy the student is meant to build.
const KEY = {
  nurse:['chart:read','chart:write','lab:read'],
  physician:['chart:read','chart:write','rx:create','lab:read'],
  pharmacist:['chart:read','rx:dispense','lab:read'],
  labtech:['lab:read','lab:write'],
  billing:['bill:write'],
  records:['chart:read','audit:read'],
  sysadmin:['users:admin','audit:read']
};
const RIGHT_RULES = ['sod_rx','treating','shift','breakglass','location','sensitive'];

// Node-side: extract the real decide() engine from the lab and verify that the
// answer-key policy scores 17/17, a lazy grant-all scores low, and every
// correct rule is load-bearing (disabling any one drops the score).
function engineTest() {
  const html = fs.readFileSync(path.join(REPO, '_app', LAB), 'utf8');
  const m = html.match(/<script>\s*\/\* =+\s*ACCESS CONTROL ARCHITECT[\s\S]*?<\/script>/);
  if (!m) return { ok:false, detail:'engine <script> not found' };
  let code = m[0].replace(/^<script>/,'').replace(/<\/script>$/,'');
  // direct-eval scope stubs so the inline lab code runs headless
  const elStub = new Proxy({}, { get:(t,p)=> (p==='style'||p==='classList') ? new Proxy({},{get:()=>()=>{}}) : (typeof p==='string'?()=>elStub:undefined) });
  const document = new Proxy({}, { get:()=>()=>elStub });          // eslint-disable-line
  const localStorage = { getItem(){return null;}, setItem(){} };    // eslint-disable-line
  const window = {}, ProgressManager = { completeModule(){} }, AchievementManager = { unlock(){} }; // eslint-disable-line
  code += '\nglobal.__t={decide,REQUESTS,KEY_POLICY,ROLES,PERMS,KEY_MATRIX,RULES};';
  eval(code);                                                       // eslint-disable-line no-eval
  const T = global.__t;
  const EXP = T.REQUESTS.map(r => T.decide(r, T.KEY_POLICY).d);     // engine's own key decisions
  const key = T.REQUESTS.filter((r,i)=>T.decide(r,T.KEY_POLICY).d===EXP[i]).length;
  const lazyMatrix = {}; T.ROLES.forEach(ro=>lazyMatrix[ro.id]=T.PERMS.map(p=>p.key));
  const lazy = T.REQUESTS.filter((r,i)=>T.decide(r,{matrix:lazyMatrix,rules:new Set()}).d===EXP[i]).length;
  const N = T.REQUESTS.length;
  const eachDrops = T.RULES.filter(x=>x.correct).every(rule=>{
    const rules = new Set([...T.KEY_POLICY.rules]); rules.delete(rule.id);
    return T.REQUESTS.filter((r,i)=>T.decide(r,{matrix:T.KEY_MATRIX,rules}).d===EXP[i]).length < N;
  });
  const ok = key===N && lazy < N*0.6 && eachDrops;
  return { ok, detail:`key ${key}/${N}, lazy ${lazy}/${N}, every rule load-bearing: ${eachDrops}` };
}

export default {
  lab: LAB,
  moduleId: 'shield-access-lab',
  engineTest,
  // page-context: build the correct policy, then run the stress test
  solve: () => {
    const KEY = {nurse:['chart:read','chart:write','lab:read'],physician:['chart:read','chart:write','rx:create','lab:read'],pharmacist:['chart:read','rx:dispense','lab:read'],labtech:['lab:read','lab:write'],billing:['bill:write'],records:['chart:read','audit:read'],sysadmin:['users:admin','audit:read']};
    Object.entries(KEY).forEach(([role,perms]) => perms.forEach(pk => window.toggleCell(role, pk)));
    ['sod_rx','treating','shift','breakglass','location','sensitive'].forEach(window.toggleRule);
    window.goStage(3); window.runStressTest();
  },
  // page-context: an under-privileged + over-broad policy that must NOT pass
  wrong: () => {
    window.toggleCell('sysadmin','chart:read');        // least-privilege violation
    window.toggleCell('nurse','bill:write');           // cross-domain over-grant
    ['shift','location'].forEach(window.toggleRule);    // missing treating/sensitive/sod/breakglass
    window.goStage(3); window.runStressTest();
  },
  certifiedWhen: () => !!document.getElementById('cert') && document.getElementById('cert').classList.contains('show'),
};
