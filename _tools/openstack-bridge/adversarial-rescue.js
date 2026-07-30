#!/usr/bin/env node
/*
 * "Rescue the Data" ADVERSARIAL QC. Runs ON bc1. Written WITH the walkthrough, not after.
 *
 * This is the lab that exists BECAUSE error-reading could not be graded. So the whole
 * design rests on one claim: a student cannot fake having saved the seeded volume. These
 * are the cheats that would break that claim if the design were weak:
 *
 *   A. THE HEADLINE CHEAT -- delete the seeded volume, create a new one with the SAME NAME,
 *      attach it to a new server. Every name-based check would pass. Check 12 compares the
 *      seeded ID from the container env, so it must FAIL.
 *   B. Delete ghost-srv WITHOUT detaching (data loss), then build a same-named replacement.
 *      Check 10 must FAIL: the seeded volume no longer exists.
 *   C. Leave ghost-srv running and just attach nothing: check 11 must FAIL.
 *
 * Exit 0 only if every cheat is refused.
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
    { email: `rescuecheat-${Math.random().toString(36).slice(2, 8)}@hexworth-smoke.local`,
      password: 'Rc' + Math.random().toString(36).slice(2, 6) + '9X', returnSecureToken: true },
    { Referer: 'https://hexworth-prime.web.app/' });
  if (su.status !== 200) fail(`signUp ${su.status}`);
  const { idToken } = su.data;
  const auth = { Authorization: `Bearer ${idToken}` };

  const l = await post(`${BASE}/launch`, { labId: 'openstack-cli', scenario: 'orphaned-volume' }, auth);
  if (l.status !== 200 || l.data.cloudMode !== 'personal') fail(`launch ${l.status}`);
  const sid = l.data.sessionId, slot = l.data.cloudSlot;
  const dex = (cmd) => sh(`docker exec sandbox-${sid} sh -lc ${JSON.stringify(cmd)}`);
  const seedVol = dex('printenv SEED_VOL_ID').trim();
  if (!seedVol) fail('no SEED_VOL_ID in env -- the checks would be inert');
  console.log(`launched ${slot} (${sid}), seeded vol ${seedVol.slice(0, 8)}...`);

  const grade = async () => {
    const g = await fetch(`${BASE}/check/${sid}?mission=`, { headers: auth });
    const gr = await g.json();
    return (gr.results || []).filter((r) => r.id >= 10);
  };

  let img = '';
  for (let i = 0; i < 6 && !img; i++) { img = dex('openstack image list -f value -c Name | head -1').trim(); if (!img) sh('sleep 10'); }

  // ── CHEAT C first (cheapest): leave everything, change nothing ──
  console.log('cheat C: do nothing at all');
  let r = await grade();
  r.forEach((c) => console.log(`  check ${c.id}: ${c.pass ? 'PASS' : 'fail'}`));
  if (r.find((c) => c.id === 11 && c.pass)) fail('CHEAT C: ghost-srv still running but check 11 passed');
  if (r.find((c) => c.id === 12 && c.pass)) fail('CHEAT C: nothing rebuilt but check 12 passed');
  console.log('  cheat C rejected');

  // ── CHEAT A: the headline -- destroy the data, fake it with a same-named volume ──
  console.log('cheat A: delete the seeded volume, recreate SAME NAME, attach to a new server');
  dex('openstack server remove volume ghost-srv orphan-vol');
  for (let i = 0; i < 12; i++) { if (dex(`openstack volume show ${seedVol} -f value -c status`).trim() === 'available') break; sh('sleep 5'); }
  dex(`openstack volume delete ${seedVol}`);
  sh('sleep 6');
  dex('openstack volume create --size 1 orphan-vol');            // same NAME, new identity
  for (let i = 0; i < 12; i++) { if (dex('openstack volume show orphan-vol -f value -c status').trim() === 'available') break; sh('sleep 5'); }
  dex('openstack server delete ghost-srv');
  for (let i = 0; i < 12; i++) { if (!dex('openstack server list -f value -c ID').trim()) break; sh('sleep 5'); }
  dex(`openstack server create --flavor m1.nano --image "${img}" --network shared rescue-srv`);
  let st = '';
  for (let i = 0; i < 30; i++) { st = dex('openstack server show rescue-srv -f value -c status').trim(); if (st === 'ACTIVE' || st === 'ERROR') break; sh('sleep 10'); }
  if (st !== 'ACTIVE') fail(`cheat rescue-srv ${st}`);
  dex('openstack server add volume rescue-srv orphan-vol');
  for (let i = 0; i < 12; i++) { if (dex('openstack volume show orphan-vol -f value -c status').trim() === 'in-use') break; sh('sleep 5'); }

  r = await grade();
  r.forEach((c) => console.log(`  check ${c.id}: ${c.pass ? 'PASS' : 'fail'}`));
  // This is the whole design on trial: name looks perfect, identity does not match.
  if (r.find((c) => c.id === 10 && c.pass)) fail('CHEAT A BEAT CHECK 10 -- destroyed volume still counted as existing');
  if (r.find((c) => c.id === 12 && c.pass)) fail('CHEAT A BEAT CHECK 12 -- a same-named replacement passed as the rescued volume');
  const aScore = r.filter((c) => c.pass).length;
  console.log(`  cheat A rejected (scored ${aScore}/3; check 11 legitimately passes -- ghost-srv really is gone)`);

  // cleanup
  const cur = dex('openstack server list -f value -c ID').trim().split('\n').filter(Boolean)[0];
  if (cur) {
    try { dex(`openstack server remove volume ${cur} orphan-vol`); } catch (e) { /* ok */ }
    for (let i = 0; i < 12; i++) { if (dex('openstack volume show orphan-vol -f value -c status').trim() === 'available') break; sh('sleep 5'); }
    try { dex('openstack volume delete orphan-vol'); } catch (e) { /* ok */ }
    dex(`openstack server delete ${cur}`);
  }
  await fetch(`${BASE}/destroy/${sid}`, { method: 'DELETE', headers: auth });
  await post(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${API_KEY}`, { idToken }, { Referer: 'https://hexworth-prime.web.app/' });
  console.log(`OPERATOR: null hexworth_uid on ${slot}`);
  console.log('ADVERSARIAL PASS: same-name forgery and do-nothing both rejected');
})().catch((e) => { console.error('ADVERSARIAL FAIL (throw):', e.message.slice(0, 300)); process.exit(1); });
