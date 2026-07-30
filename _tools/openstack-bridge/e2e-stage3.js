#!/usr/bin/env node
/*
 * Stage 3 end-to-end proof. Runs ON bc1. Uses the platform's established smoke pattern
 * (referer-restricted web API key + accounts:signUp) to mint a REAL password-provider
 * Firebase user, then drives the full student path:
 *
 *   launch openstack-cli  -> expect cloudMode 'personal' + a slot
 *   in-container          -> openstack server create (a WRITE -- impossible pre-Stage-3)
 *   destroy session       -> cred should die, instance should SURVIVE
 *   relaunch              -> SAME slot (sticky mapping), instance still visible
 *   cleanup               -> delete instance, destroy, delete test user
 *
 * Cleanup of the slot mapping is printed as a command for the operator pass
 * (openstack project unset --property hexworth_uid <slot>), run by the wrapper.
 */
const { execSync } = require('child_process');

const API_KEY = 'AIzaSyC3tWNETi36DA8Q1I60n7t09YfU9HapA4M';
const BASE = 'http://localhost/api/sandbox';
const sh = (cmd) => execSync(cmd, { encoding: 'utf8', timeout: 300000 });

async function post(url, body, headers) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  return { status: r.status, data: await r.json().catch(() => null) };
}

(async () => {
  const fail = (m) => { console.error('E2E FAIL:', m); process.exit(1); };

  // 1. real password-provider test user
  const email = `stage3-e2e-${Math.random().toString(36).slice(2, 8)}@hexworth-smoke.local`;
  const password = 'St' + Math.random().toString(36).slice(2, 6) + '9X';
  const su = await post(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    { email, password, returnSecureToken: true }, { Referer: 'https://hexworth-prime.web.app/' });
  if (su.status !== 200) fail(`signUp ${su.status}: ${JSON.stringify(su.data).slice(0, 200)}`);
  const { idToken, localId } = su.data;
  console.log('1. test user minted:', localId);

  const auth = { Authorization: `Bearer ${idToken}` };
  const launch = async () => post(`${BASE}/launch`, { labId: 'openstack-cli' }, auth);

  // 2. first launch -> personal cloud
  let l1 = await launch();
  if (l1.status !== 200) fail(`launch ${l1.status}: ${JSON.stringify(l1.data).slice(0, 300)}`);
  if (l1.data.cloudMode !== 'personal') fail(`expected cloudMode personal, got ${l1.data.cloudMode} (bridge down? pool empty?)`);
  const slot = l1.data.cloudSlot, sid1 = l1.data.sessionId;
  console.log(`2. launched personal cloud: slot=${slot} session=${sid1}`);

  const dex = (sid, cmd) => sh(`docker exec sandbox-${sid} sh -lc ${JSON.stringify(cmd)}`);

  // 3. the WRITE: create an instance in the student's own project
  console.log('3. creating instance (the write that was impossible before Stage 3)...');
  // Retry the first CLI call: a cold 384MB container's first python-CLI invocation
  // races ttyd startup and can return empty (seen live 2026-07-30, run 3).
  let img = '';
  for (let i = 0; i < 6 && !img; i++) {
    img = dex(sid1, 'openstack image list -f value -c Name | head -1').trim();
    if (!img) sh('sleep 10');
  }
  if (!img) fail('image list returned empty after 6 attempts');
  dex(sid1, `openstack server create --flavor m1.nano --image "${img}" --network shared e2e-proof`);
  // Poll rather than --wait: the FIRST boot on a cold compute node is the slowest path
  // (image fetch + qemu spinup) and blew a 120s exec timeout on the first run.
  let st1 = '';
  for (let i = 0; i < 30; i++) {
    st1 = dex(sid1, 'openstack server show e2e-proof -f value -c status').trim();
    if (st1 === 'ACTIVE' || st1 === 'ERROR') break;
    sh('sleep 10');
  }
  if (st1 !== 'ACTIVE') fail(`instance status ${st1}, wanted ACTIVE`);
  console.log('   instance e2e-proof ACTIVE in', slot);

  // 4. destroy the session (container dies, cred dies) -- instance must SURVIVE
  const d = await fetch(`${BASE}/destroy/${sid1}`, { method: 'DELETE', headers: auth });
  if (d.status !== 200) fail(`destroy ${d.status}`);
  console.log('4. session destroyed');

  // 5. relaunch: sticky slot + persistent instance
  const l2 = await launch();
  if (l2.status !== 200) fail(`relaunch ${l2.status}: ${JSON.stringify(l2.data).slice(0, 300)}`);
  if (l2.data.cloudSlot !== slot) fail(`sticky mapping broken: ${l2.data.cloudSlot} != ${slot}`);
  const sid2 = l2.data.sessionId;
  const seen = dex(sid2, 'openstack server list -f value -c Name').trim();
  if (!seen.includes('e2e-proof')) fail(`instance did not survive session teardown; server list: ${seen}`);
  console.log('5. relaunch: same slot, instance SURVIVED the container teardown');

  // 6. isolation spot-check: the student must not see other projects' worlds
  const all = dex(sid2, 'openstack server list --all-projects 2>&1 || true');
  if (!/403|Forbidden|not authorized|HTTP 403/i.test(all)) fail(`--all-projects was not refused: ${all.slice(0, 200)}`);
  console.log('6. --all-projects refused (project isolation holds)');

  // 7. cleanup: instance, session, user
  dex(sid2, 'openstack server delete e2e-proof --wait');
  await fetch(`${BASE}/destroy/${sid2}`, { method: 'DELETE', headers: auth });
  await post(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${API_KEY}`,
    { idToken }, { Referer: 'https://hexworth-prime.web.app/' });
  console.log('7. cleanup done (instance deleted, session destroyed, test user removed)');
  console.log(`OPERATOR: clear the test mapping on bc2:  openstack project unset --property hexworth_uid ${slot}`);
  console.log('E2E PASS');
})().catch((e) => { console.error('E2E FAIL (throw):', e.message); process.exit(1); });
