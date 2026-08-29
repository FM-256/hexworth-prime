// The path a real student takes, in order, exactly as the page now describes it.
// The walkthrough harness proves the MISSIONS; this proves getting to them.
const API_KEY='AIzaSyC3tWNETi36DA8Q1I60n7t09YfU9HapA4M';
const BASE='https://sandbox.hexworth.tech/api/sandbox';
const post=async(u,b,h)=>{const r=await fetch(u,{method:'POST',headers:{'Content-Type':'application/json',...(h||{})},body:JSON.stringify(b)});return{status:r.status,data:await r.json().catch(()=>null),headers:r.headers};};
(async()=>{
  const email='studentrun-'+Date.now()+'@hexworth-smoke.local';
  let su=await post(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,{email,password:'StuRun9x',returnSecureToken:true},{Referer:'https://hexworth-prime.web.app/'});
  console.log('  1. sign up / sign in            :', su.status===200?'OK':'FAIL '+su.status);
  const auth={Authorization:`Bearer ${su.data.idToken}`};

  const l=await post(`${BASE}/launch`,{labId:'openstack-cli'},auth);
  const d=l.data||{};
  console.log('  2. launch the lab               :', l.status===200?'OK':'FAIL '+l.status, d.error?('- '+d.error):'');
  console.log('  3. personal cloud slot          :', d.cloudMode||'(none)', d.cloudSlot||'');
  console.log('  4. Horizon panel data present   :',
      (d.horizonUrl&&d.horizonUser&&d.horizonPassword)?'OK (url+user+password)':'MISSING -> panel will not render');

  // the reload case that was broken all day
  const l2=await post(`${BASE}/launch`,{labId:'openstack-cli'},auth);
  console.log('  5. after a page RELOAD          :',
      (l2.data&&l2.data.horizonPassword)?'OK (credentials still returned)':'MISSING -> panel vanishes');

  const cs=await post(`${BASE}/console-session`,{},auth);
  console.log('  6. console gate cookie          :', cs.status===200?'OK':'FAIL '+cs.status);

  require('fs').writeFileSync('/tmp/studentrun.json',JSON.stringify({sid:d.sessionId,tok:su.data.idToken,slot:d.cloudSlot,user:d.horizonUser,pw:d.horizonPassword}));
  console.log('  session:', d.sessionId, '| slot:', d.cloudSlot);
})();
