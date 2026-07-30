#!/usr/bin/env node
/*
 * Cinder lab walkthrough-verbatim QC (Stage 4 lab 1). Runs ON bc1.
 * Performs the ENTIRE student journey with real student credentials, then runs the four
 * new grader commands VERBATIM (ids 3-6 in SANDBOX_CHALLENGES['openstack-cli']) and
 * requires all four to pass. This is the walkthrough-IS-the-QC rule: if the instructions
 * cannot produce a passing grade, the lab does not ship.
 */
const { execSync } = require('child_process');
const API_KEY = 'AIzaSyC3tWNETi36DA8Q1I60n7t09YfU9HapA4M';
const BASE = 'http://localhost/api/sandbox';
const sh = (c) => execSync(c, { encoding: 'utf8', timeout: 300000 });

async function post(url, body, headers) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  return { status: r.status, data: await r.json().catch(() => null) };
}

(async () => {
  const fail = (m) => { console.error('WALKTHROUGH FAIL:', m); process.exit(1); };
  const email = `cinder-qc-${Math.random().toString(36).slice(2, 8)}@hexworth-smoke.local`;
  const su = await post(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    { email, password: 'Cq' + Math.random().toString(36).slice(2, 6) + '9X', returnSecureToken: true },
    { Referer: 'https://hexworth-prime.web.app/' });
  if (su.status !== 200) fail(`signUp ${su.status}`);
  const { idToken } = su.data;
  const auth = { Authorization: `Bearer ${idToken}` };
  const launch = async () => post(`${BASE}/launch`, { labId: 'openstack-cli' }, auth);

  const l1 = await launch();
  if (l1.status !== 200 || l1.data.cloudMode !== 'personal') fail(`launch: ${l1.status} ${l1.data && l1.data.cloudMode}`);
  let sid = l1.data.sessionId;
  const slot = l1.data.cloudSlot;
  console.log(`launched: ${slot} (${sid})`);
  const dex = (cmd) => sh(`docker exec sandbox-${sid} sh -lc ${JSON.stringify(cmd)}`);
  // cold-start retry (known 384MB first-call race)
  let img = '';
  for (let i = 0; i < 6 && !img; i++) { img = dex('openstack image list -f value -c Name | head -1').trim(); if (!img) sh('sleep 10'); }
  if (!img) fail('image list empty');

  // ── THE LAB, exactly as the page will instruct ──
  console.log('lab step 1: create the volume');
  dex('openstack volume create --size 1 lab-vol -f value -c id');
  for (let i = 0; i < 12; i++) { if (dex('openstack volume show lab-vol -f value -c status').trim() === 'available') break; sh('sleep 5'); }

  console.log('lab step 2: boot server-a and attach');
  dex(`openstack server create --flavor m1.nano --image "${img}" --network shared server-a`);
  let st = '';
  for (let i = 0; i < 30; i++) { st = dex('openstack server show server-a -f value -c status').trim(); if (st === 'ACTIVE' || st === 'ERROR') break; sh('sleep 10'); }
  if (st !== 'ACTIVE') fail(`server-a ${st}`);
  dex('openstack server add volume server-a lab-vol');
  for (let i = 0; i < 12; i++) { if (dex('openstack volume show lab-vol -f value -c status').trim() === 'in-use') break; sh('sleep 5'); }
  dex('mkdir -p ~/notes && openstack volume show lab-vol -f json > ~/notes/attach-proof.txt');

  console.log('lab step 3: detach, capture, delete server-a');
  dex('openstack server remove volume server-a lab-vol');
  for (let i = 0; i < 12; i++) { if (dex('openstack volume show lab-vol -f value -c status').trim() === 'available') break; sh('sleep 5'); }
  dex('openstack volume show lab-vol -f json > ~/notes/detach-proof.txt');
  dex('openstack server delete server-a');
  for (let i = 0; i < 12; i++) { try { dex('openstack server show server-a -f value -c status'); sh('sleep 5'); } catch (e) { break; } }

  console.log('lab step 4: boot server-b (the volume outlives its first server), re-attach');
  dex(`openstack server create --flavor m1.nano --image "${img}" --network shared server-b`);
  st = '';
  for (let i = 0; i < 30; i++) { st = dex('openstack server show server-b -f value -c status').trim(); if (st === 'ACTIVE' || st === 'ERROR') break; sh('sleep 10'); }
  if (st !== 'ACTIVE') fail(`server-b ${st}`);
  dex('openstack server add volume server-b lab-vol');
  for (let i = 0; i < 12; i++) { if (dex('openstack volume show lab-vol -f value -c status').trim() === 'in-use') break; sh('sleep 5'); }

  // ── THE GRADER, via the real endpoint (returns ALL checks; 3-6 must pass) ──
  const g = await fetch(`${BASE}/check/${sid}?mission=`, { headers: auth });
  const gr = await g.json();
  const cinder = (gr.results || []).filter((r) => r.id >= 3);
  cinder.forEach((r) => console.log(`  check ${r.id}: ${r.pass ? 'PASS' : 'FAIL'} -- ${r.desc}`));
  if (cinder.length !== 4 || !cinder.every((r) => r.pass)) fail('grader did not pass 4/4 cinder checks');

  // cleanup: volume + server + session + user (slot mapping cleared by operator pass)
  console.log('cleanup');
  // Detach is ASYNCHRONOUS: the first cleanup deleted straight after remove-volume and hit
  // "Volume status must be available" (HTTP 400). Poll, exactly like the lab's own steps do.
  dex('openstack server remove volume server-b lab-vol');
  for (let i = 0; i < 12; i++) { if (dex('openstack volume show lab-vol -f value -c status').trim() === 'available') break; sh('sleep 5'); }
  dex('openstack volume delete lab-vol');
  dex('openstack server delete server-b');
  await fetch(`${BASE}/destroy/${sid}`, { method: 'DELETE', headers: auth });
  await post(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${API_KEY}`, { idToken }, { Referer: 'https://hexworth-prime.web.app/' });
  console.log(`OPERATOR: null hexworth_uid on ${slot}`);
  console.log('WALKTHROUGH PASS 4/4');
})().catch((e) => { console.error('WALKTHROUGH FAIL (throw):', e.message.slice(0, 300)); process.exit(1); });
