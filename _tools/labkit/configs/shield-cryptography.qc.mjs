/* QC config for the Crypto Workbench lab. Drives all 5 real Web-Crypto
   missions to certification and back, and proves the capstone suite engine
   is sound + discriminating. Consumed by _tools/labkit/lab-qc.mjs.
   (Run over http://localhost so crypto.subtle is available — secure context.) */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const LAB  = 'houses/shield/labs/shield-cryptography.lab.html';

// Node-side: extract the capstone suite data and prove it is sound + discriminating —
// every requirement has a correct primitive, none of the correct ones are weak,
// and the weak/legacy traps are all flagged (so a weak pick fails review).
function engineTest() {
  const html = fs.readFileSync(path.join(REPO, '_app', LAB), 'utf8');
  const m = html.match(/<script>\s*\/\* =+\s*CRYPTO WORKBENCH[\s\S]*?<\/script>/);
  if (!m) return { ok:false, detail:'engine <script> not found' };
  let code = m[0].replace(/^<script>/,'').replace(/<\/script>$/,'');
  const window = { crypto: globalThis.crypto };                         // eslint-disable-line
  const document = { addEventListener(){}, getElementById:()=>null, querySelector:()=>null, querySelectorAll:()=>[] }; // eslint-disable-line
  const localStorage = { getItem(){return null;}, setItem(){} };        // eslint-disable-line
  const ProgressManager = { completeModule(){} }, AchievementManager = { unlock(){} }; // eslint-disable-line
  code += '\nglobal.__c={REQS,PALETTE,WEAK};';
  eval(code);                                                           // eslint-disable-line no-eval
  const { REQS, PALETTE, WEAK } = global.__c;
  const palette = new Set(PALETTE.map(p=>p.v));
  const everyReqSolvable = REQS.every(r => r.correct.length && r.correct.every(c => palette.has(c) && !WEAK.has(c)));
  const trapsFlagged = ['md5','sha-1','des','rsa-512','ecb','plain'].every(w => WEAK.has(w));
  const ok = everyReqSolvable && trapsFlagged && WEAK.size >= 6;
  return { ok, detail:`${REQS.length} reqs all solvable w/ non-weak primitive: ${everyReqSolvable}; ${WEAK.size} weak traps flagged: ${trapsFlagged}` };
}

export default {
  lab: LAB,
  moduleId: 'shield-crypto-lab',
  solveWaitMs: 3500,
  engineTest,
  // page-context: perform all five real crypto missions correctly
  solve: async () => {
    await window.m1hash(); await window.m1submit('tampered');                 // integrity: received copy IS altered
    await window.m2encrypt(); await window.m2decrypt(); window.m2pickMode('gcm'); // confidentiality round-trip + GCM
    await window.m3keygen(); await window.m3sign(); await window.m3verify(false); await window.m3verify(true); // signatures
    await window.m4gen(); await window.m4derive();                             // ECDH shared secret
    const right = { conf:'aes-gcm', integ:'sha-256', pw:'pbkdf2', sign:'ecdsa', kex:'ecdh' };
    Object.entries(right).forEach(([id,v]) => { document.getElementById('sel-'+id).value = v; });
    window.m5check();                                                          // sound suite
  },
  // page-context: a suite with a weak primitive (and no missions done) must NOT certify
  wrong: () => {
    document.getElementById('sel-conf').value = 'md5';   // weak
    document.getElementById('sel-integ').value = 'sha-256';
    document.getElementById('sel-pw').value = 'pbkdf2';
    document.getElementById('sel-sign').value = 'ecdsa';
    document.getElementById('sel-kex').value = 'ecdh';
    window.m5check();
  },
  certifiedWhen: () => !!document.getElementById('cert') && document.getElementById('cert').classList.contains('show'),
};
