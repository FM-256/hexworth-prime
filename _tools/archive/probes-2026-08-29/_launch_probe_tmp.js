// What does a launch actually return right now? The Horizon panel is skipped when
// horizonPassword is absent, which is exactly what read-only mode returns when no personal
// cloud slot is free. So the question is not "is the panel broken" but "did the student get a
// slot at all".
const API_KEY = 'AIzaSyC3tWNETi36DA8Q1I60n7t09YfU9HapA4M';
const BASE = 'https://sandbox.hexworth.tech/api/sandbox';
const post = async (u,b,h) => { const r = await fetch(u,{method:'POST',headers:{'Content-Type':'application/json',...(h||{})},body:JSON.stringify(b)}); return {status:r.status,data:await r.json().catch(()=>null)}; };
(async () => {
  const email='cinder-adv-qc@hexworth-smoke.local', password='QcCiA9x';
  let su = await post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,{email,password,returnSecureToken:true},{Referer:'https://hexworth-prime.web.app/'});
  if (su.status!==200) { console.log('  sign-in failed', su.status); return; }
  const auth = { Authorization:`Bearer ${su.data.idToken}` };
  const l = await post(`${BASE}/launch`, { labId:'openstack-cli' }, auth);
  const d = l.data || {};
  console.log('  launch HTTP:', l.status);
  console.log('  cloudMode          :', d.cloudMode || '(none)');
  console.log('  cloudSlot          :', d.cloudSlot || '(none)');
  console.log('  horizonUrl         :', d.horizonUrl || '(MISSING)');
  console.log('  horizonUser        :', d.horizonUser || '(MISSING)');
  console.log('  horizonPassword    :', d.horizonPassword ? 'present' : '(MISSING -> panel is skipped)');
  if (d.reason || d.error) console.log('  reason/error       :', d.reason || d.error);
  if (d.sessionId) {
    await fetch(`${BASE}/destroy/${d.sessionId}`, { method:'DELETE', headers:auth }).catch(()=>{});
    console.log('  (test session destroyed)');
  }
})();
