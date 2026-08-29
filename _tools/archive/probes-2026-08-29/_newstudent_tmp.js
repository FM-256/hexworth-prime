// A student who has never claimed a slot. If the pool is exhausted they fall to read-only mode,
// which returns NO horizonPassword -- and the panel is skipped by design, not by bug.
const API_KEY='AIzaSyC3tWNETi36DA8Q1I60n7t09YfU9HapA4M';
const BASE='https://sandbox.hexworth.tech/api/sandbox';
const post=async(u,b,h)=>{const r=await fetch(u,{method:'POST',headers:{'Content-Type':'application/json',...(h||{})},body:JSON.stringify(b)});return{status:r.status,data:await r.json().catch(()=>null)};};
(async()=>{
  const email=`horizon-check-${Date.now()}@hexworth-smoke.local`, password='HzChk9x';
  let su=await post(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,{email,password,returnSecureToken:true},{Referer:'https://hexworth-prime.web.app/'});
  if(su.status!==200){console.log('  signUp failed',su.status,JSON.stringify(su.data).slice(0,120));return;}
  console.log('  brand-new student identity created');
  const auth={Authorization:`Bearer ${su.data.idToken}`};
  const l=await post(`${BASE}/launch`,{labId:'openstack-cli'},auth);
  const d=l.data||{};
  console.log('  launch HTTP        :', l.status);
  console.log('  cloudMode          :', d.cloudMode || '(none)');
  console.log('  cloudSlot          :', d.cloudSlot || '(none)');
  console.log('  horizonPassword    :', d.horizonPassword ? 'present' : '(MISSING -> no Horizon panel)');
  if(d.cloudReason||d.reason) console.log('  reason             :', d.cloudReason||d.reason);
  if(d.sessionId){await fetch(`${BASE}/destroy/${d.sessionId}`,{method:'DELETE',headers:auth}).catch(()=>{});console.log('  (session destroyed)');}
})();
