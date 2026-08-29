// 20 students hitting Launch at once -- what the start of a class actually looks like.
// Yesterday's failures were all load-shaped (cap at 12, pool exhaustion, host memory), and a
// single sequential run says nothing about any of them.
const K='AIzaSyC3tWNETi36DA8Q1I60n7t09YfU9HapA4M';
const B='https://sandbox.hexworth.tech/api/sandbox';
const N=20;
const j=async(u,o)=>{const r=await fetch(u,o);return{status:r.status,data:await r.json().catch(()=>null)};};

(async()=>{
  console.log(`  creating ${N} identities...`);
  const users=[];
  for(let i=0;i<N;i++){
    const e=`conc${i}-${Date.now()}@hexworth-smoke.local`;
    const r=await j(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${K}`,
      {method:'POST',headers:{'Content-Type':'application/json',Referer:'https://hexworth-prime.web.app/'},
       body:JSON.stringify({email:e,password:'Conc9xTst',returnSecureToken:true})});
    if(r.status===200) users.push(r.data);
  }
  console.log(`  identities ready: ${users.length}`);

  const t0=Date.now();
  console.log('  launching ALL simultaneously...');
  const res=await Promise.all(users.map(u=>
    j(`${B}/launch`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+u.idToken},
      body:JSON.stringify({labId:'openstack-cli'})})
      .then(r=>({u,r})).catch(e=>({u,r:{status:0,data:{error:String(e).slice(0,60)}}}))));
  const secs=((Date.now()-t0)/1000).toFixed(1);

  let ok=0, personal=0, horizon=0, readonly=0, failed=0;
  const errs={};
  for(const {r} of res){
    const d=r.data||{};
    if(r.status===200 && d.sessionId){ ok++;
      if(d.cloudMode==='personal') personal++; else readonly++;
      if(d.horizonUrl&&d.horizonUser&&d.horizonPassword) horizon++;
    } else { failed++; const k=(d.code||d.error||('HTTP '+r.status)).toString().slice(0,60); errs[k]=(errs[k]||0)+1; }
  }
  console.log(`  --- RESULTS (${secs}s wall clock) ---`);
  console.log(`    launched OK            : ${ok}/${N}`);
  console.log(`    got a PERSONAL cloud   : ${personal}`);
  console.log(`    fell back to read-only : ${readonly}`);
  console.log(`    Horizon panel complete : ${horizon}`);
  console.log(`    failed                 : ${failed}`);
  for(const [k,v] of Object.entries(errs)) console.log(`      ${v}x  ${k}`);
  require('fs').writeFileSync('/tmp/conc.json',JSON.stringify(
    res.map(({u,r})=>({uid:u.localId,tok:u.idToken,sid:(r.data||{}).sessionId,slot:(r.data||{}).cloudSlot}))));
})();
