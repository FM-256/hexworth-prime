/* QC config for the Hash Deep-Dive lab. Runs all 5 real hashing missions
   (algorithm tour, MD5 collision, salting, HMAC, capstone) to certification;
   the wrong path picks a weak primitive in the capstone (no false pass). */
const wait = () => new Promise(r => setTimeout(r, 80));

export default {
  lab: 'houses/shield/labs/shield-hashing.lab.html',
  moduleId: 'shield-hashing',
  solveWaitMs: 4500,
  // page-context: drive every mission with real hashing operations, then the capstone.
  solve: async () => {
    const wait = () => new Promise(r => setTimeout(r, 90));
    await window.m1runAll(); window.m1confirm();
    window.goMission(2); await wait(); await window.m2compute(); window.m2confirm();
    window.goMission(3); await wait(); await window.m3store();
    document.getElementById('m3loginPw').value = '__definitely_wrong__'; await window.m3verify();   // rejection
    document.getElementById('m3loginPw').value = document.getElementById('m3password').value; await window.m3verify();  // acceptance
    window.goMission(4); await wait(); await window.m4sign();
    await window.m4verify(false); await window.m4verify(true);
    window.goMission(5); await wait();
    const key = { 'file-int':'sha-256', 'pw-store':'pbkdf2', 'msg-auth':'hmac-sha256', 'tls-prf':'hmac-sha256', 'cert-fp':'sha-256' };
    Object.entries(key).forEach(([id,v])=>{ const el=document.getElementById('sel-'+id); if(el) el.value=v; });
    window.m5check();
  },
  // page-context: a weak capstone pick (MD5 for password storage) blocks certification.
  wrong: () => {
    const bad = { 'file-int':'sha-256', 'pw-store':'md5', 'msg-auth':'hmac-sha256', 'tls-prf':'sha-256', 'cert-fp':'sha-256' };
    Object.entries(bad).forEach(([id,v])=>{ const el=document.getElementById('sel-'+id); if(el) el.value=v; });
    window.m5check();
  },
  // page-context: true once the certification banner is shown.
  certifiedWhen: () => !!document.getElementById('cert') && document.getElementById('cert').classList.contains('show'),
};
