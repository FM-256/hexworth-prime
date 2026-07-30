#!/usr/bin/env node
/*
 * ADVERSARIAL QC for the Cinder lab (Nancy BLOCK 2026-07-30). Runs ON bc1.
 *
 * The walkthrough proves the honest path PASSES. That is only half a grade check: it
 * says nothing about whether a shortcut also passes. This runs the two cheats a real
 * student would actually find and REQUIRES them to fail:
 *
 *   A. The five-command shortcut: create volume, create ONE server, attach, and fake the
 *      two evidence files with echo. Never deletes anything. (Beat check 6 v2.)
 *   B. Fabricated evidence with the real volume id present but no real lifecycle:
 *      capture genuine json ONCE while attached and reuse it for both proofs.
 *
 * Exit 0 only if BOTH cheats are rejected by the real grader.
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
  const fail = (m) => { console.error('ADVERSARIAL FAIL:', m); process.exit(1); };
  const su = await post(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    { email: `cheat-qc-${Math.random().toString(36).slice(2, 8)}@hexworth-smoke.local`,
      password: 'Ch' + Math.random().toString(36).slice(2, 6) + '9X', returnSecureToken: true },
    { Referer: 'https://hexworth-prime.web.app/' });
  if (su.status !== 200) fail(`signUp ${su.status}`);
  const { idToken } = su.data;
  const auth = { Authorization: `Bearer ${idToken}` };

  const l = await post(`${BASE}/launch`, { labId: 'openstack-cli' }, auth);
  if (l.status !== 200 || l.data.cloudMode !== 'personal') fail(`launch ${l.status} ${l.data && l.data.cloudMode}`);
  const sid = l.data.sessionId, slot = l.data.cloudSlot;
  const dex = (cmd) => sh(`docker exec sandbox-${sid} sh -lc ${JSON.stringify(cmd)}`);
  console.log(`launched ${slot} (${sid})`);

  let img = '';
  for (let i = 0; i < 6 && !img; i++) { img = dex('openstack image list -f value -c Name | head -1').trim(); if (!img) sh('sleep 10'); }
  if (!img) fail('image list empty');

  const grade = async () => {
    const g = await fetch(`${BASE}/check/${sid}?mission=`, { headers: auth });
    const gr = await g.json();
    return (gr.results || []).filter((r) => r.id >= 3);
  };

  // ── CHEAT A: five-command shortcut with echoed evidence ──
  console.log('cheat A: create volume, ONE server, attach, echo both proofs (no delete cycle)');
  dex('openstack volume create --size 1 lab-vol');
  for (let i = 0; i < 12; i++) { if (dex('openstack volume show lab-vol -f value -c status').trim() === 'available') break; sh('sleep 5'); }
  dex(`openstack server create --flavor m1.nano --image "${img}" --network shared cheat-srv`);
  let st = '';
  for (let i = 0; i < 30; i++) { st = dex('openstack server show cheat-srv -f value -c status').trim(); if (st === 'ACTIVE' || st === 'ERROR') break; sh('sleep 10'); }
  if (st !== 'ACTIVE') fail(`cheat-srv ${st}`);
  dex('openstack server add volume cheat-srv lab-vol');
  for (let i = 0; i < 12; i++) { if (dex('openstack volume show lab-vol -f value -c status').trim() === 'in-use') break; sh('sleep 5'); }
  dex('mkdir -p ~/notes && echo in-use > ~/notes/attach-proof.txt && echo available > ~/notes/detach-proof.txt');
  let r = await grade();
  r.forEach((c) => console.log(`  check ${c.id}: ${c.pass ? 'PASS' : 'fail'}`));
  const aPass = r.filter((c) => c.pass).length;
  if (r.find((c) => c.id === 6 && c.pass)) fail('CHEAT A BEAT CHECK 6 -- the shortcut still passes');
  if (r.find((c) => c.id === 4 && c.pass) || r.find((c) => c.id === 5 && c.pass)) fail('CHEAT A: echoed evidence accepted');
  console.log(`  cheat A rejected (scored ${aPass}/4, checks 4/5/6 all refused)`);

  // ── CHEAT B: real json, but captured once and reused; still no delete cycle ──
  console.log('cheat B: genuine volume json (real uuid) reused for both proofs, still one server');
  dex('openstack volume show lab-vol -f json > ~/notes/attach-proof.txt && cp ~/notes/attach-proof.txt ~/notes/detach-proof.txt');
  r = await grade();
  r.forEach((c) => console.log(`  check ${c.id}: ${c.pass ? 'PASS' : 'fail'}`));
  if (r.find((c) => c.id === 6 && c.pass)) fail('CHEAT B BEAT CHECK 6 -- reused evidence + single server passes');
  if (r.find((c) => c.id === 5 && c.pass)) fail('CHEAT B: in-use json accepted as detach proof');
  console.log('  cheat B rejected (check 6 refuses: attached server IS the one in attach-proof)');

  // cleanup
  dex('openstack server remove volume cheat-srv lab-vol');
  for (let i = 0; i < 12; i++) { if (dex('openstack volume show lab-vol -f value -c status').trim() === 'available') break; sh('sleep 5'); }
  dex('openstack volume delete lab-vol');
  dex('openstack server delete cheat-srv');
  await fetch(`${BASE}/destroy/${sid}`, { method: 'DELETE', headers: auth });
  await post(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${API_KEY}`, { idToken }, { Referer: 'https://hexworth-prime.web.app/' });
  console.log(`OPERATOR: null hexworth_uid on ${slot}`);
  console.log('ADVERSARIAL PASS: both cheats rejected');
})().catch((e) => { console.error('ADVERSARIAL FAIL (throw):', e.message.slice(0, 300)); process.exit(1); });
