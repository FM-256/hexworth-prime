// The FULL student journey, executed from the office network with tailscale offline:
// sign in -> launch a lab -> receive Horizon credentials -> log in -> open the instance console.
// This is the only test that proves the server-side bc1<->bc2 hop still works while MY access to
// bc2 is gone: if that hop were broken, the launch would never return cloud credentials.
const API_KEY = 'AIzaSyC3tWNETi36DA8Q1I60n7t09YfU9HapA4M';
const BASE = 'https://sandbox.hexworth.tech/api/sandbox';
const post = async (u, b, h) => { const r = await fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(h||{}) }, body: JSON.stringify(b) }); return { status: r.status, data: await r.json().catch(()=>null) }; };

(async () => {
  const email = 'cinder-adv-qc@hexworth-smoke.local', password = 'QcCiA9x';
  let su = await post(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`, { email, password, returnSecureToken: true }, { Referer: 'https://hexworth-prime.web.app/' });
  if (su.status !== 200) su = await post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, { email, password, returnSecureToken: true }, { Referer: 'https://hexworth-prime.web.app/' });
  if (su.status !== 200) { console.log('  1. sign in: FAILED', su.status); return; }
  console.log('  1. Firebase sign-in from the office: OK');
  const auth = { Authorization: `Bearer ${su.data.idToken}` };

  const l = await post(`${BASE}/launch`, { labId: 'openstack-cli' }, auth);
  console.log('  2. launch lab:', l.status, l.data && l.data.sessionId ? 'session created' : JSON.stringify(l.data).slice(0,100));
  if (!l.data || !l.data.sessionId) return;
  const sid = l.data.sessionId;
  console.log('  3. cloud slot from bc2 (proves bc1->bc2 works server-side):',
              l.data.cloudSlot || '(none)', '| mode:', l.data.cloudMode || '(none)');
  console.log('  4. Horizon credentials issued:', l.data.horizonUser ? `user=${l.data.horizonUser}, password=<redacted>` : 'NONE');
  console.log('     horizonUrl:', l.data.horizonUrl || '(none)');

  const cs = await post(`${BASE}/console-session`, {}, auth);
  console.log('  5. console-session (mints the gate cookie):', cs.status);

  require('fs').writeFileSync('/tmp/office_e2e.json', JSON.stringify({
    sid, slot: l.data.cloudSlot, user: l.data.horizonUser, pw: l.data.horizonPassword,
    idToken: su.data.idToken }));
  console.log('  6. handoff written for the browser stage');
})();
