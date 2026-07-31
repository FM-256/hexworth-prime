#!/usr/bin/env node
/*
 * Self-service networking lab ADVERSARIAL QC (Stage 4 lab 5). Runs ON bc1.
 *
 * A walkthrough proves a lab is COMPLETABLE. It does not prove it is not trivially
 * beatable -- Nancy found a 5-command shortcut past a 4/4-passing Cinder lab. So each
 * named cheat below must FAIL its target check. If a cheat passes, the lab is broken
 * and the walkthrough is not permitted to run (qc-lab.sh enforces that ordering).
 *
 * The cheats are the three ways this lab is actually gettable wrong, which is the point:
 * each one is a real mistake a student makes, and each must be caught by exactly one check.
 *   A  reuse the SHARED network         -> not something you built    must fail 21
 *   B  network with NO subnet          -> cannot address anything    must fail 22
 *   C  own network, router with NO gw   -> isolated, no way out       must fail 23
 * A is the one that matters: a student who never builds anything and just points at the
 * network every previous lab used must NOT pass. That is what the `owned` flag exists for,
 * and it is why `owned` had to exclude external networks too -- Neutron shows the admin's
 * external net to every project without marking it shared.
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
  const email = `net-adv-${Math.random().toString(36).slice(2, 8)}@hexworth-smoke.local`;
  const su = await post(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    { email, password: 'Cq' + Math.random().toString(36).slice(2, 6) + '9X', returnSecureToken: true },
    { Referer: 'https://hexworth-prime.web.app/' });
  if (su.status !== 200 || !su.data || !su.data.idToken) fail('could not create the QC user');
  const idToken = su.data.idToken;
  const auth = { Authorization: `Bearer ${idToken}` };

  const l1 = await post(`${BASE}/launch`, { labId: 'openstack-cli' }, auth);
  if (l1.status !== 200 || !l1.data || !l1.data.sessionId) fail(`launch failed: ${l1.status}`);
  const sid = l1.data.sessionId;
  if (l1.data.cloudMode !== 'personal') fail(`needed a personal cloud, got '${l1.data.cloudMode}'`);
  const dex = (cmd) => sh(`docker exec sandbox-${sid} sh -lc ${JSON.stringify(cmd)}`);

  const grade = async () => {
    const g = await fetch(`${BASE}/check/${sid}?mission=`, { headers: auth });
    const gr = await g.json();
    return (gr && gr.results) || [];
  };
  const passed = (rs, id) => rs.some((r) => Number(r.id) === id && r.pass);
  const wipe = () => {
    const t = (c) => { try { dex(c); } catch (e) { /* absent is fine */ } };
    try {
      if (dex('openstack server list -f value -c Name').trim().split('\n').map(x => x.trim()).includes('lab5-vm')) {
        dex('openstack server delete lab5-vm');
        for (let i = 0; i < 24; i++) {
          if (!dex('openstack server list -f value -c Name').trim().split('\n').map(x => x.trim()).includes('lab5-vm')) break;
          sh('sleep 5');
        }
      }
      t('openstack router unset --external-gateway lab5-router');
      t('openstack router remove subnet lab5-router lab5-subnet');
      t('openstack router delete lab5-router');
      t('openstack network delete lab5-net');
    } catch (e) { /* nothing to wipe */ }
  };

  let img = '', net = '', bigFlavor = '';
  for (let i = 0; i < 6 && !img; i++) {
    img = dex('openstack image list -f value -c Name | head -1').trim();
    if (!img) sh('sleep 10');
  }
  if (!img) fail('no image visible -- the cloud credential never came up');
  net = dex('openstack network list -f value -c Name | head -1').trim();
  bigFlavor = dex("openstack flavor list -f value -c Name | grep -v '^m1.nano$' | head -1").trim();
  if (!net) fail('no network visible');

  const I = JSON.stringify(img).slice(1, -1), N = JSON.stringify(net).slice(1, -1);

  try {
    // ── Cheat A: build nothing, point at the shared network every earlier lab used. ──
    wipe();
    let rs = await grade();
    if (passed(rs, 21)) fail('cheat A PASSED check 21 -- an existing shared network counted as one the student built');
    console.log('  cheat A (never built anything, shared network present) rejected by check 21');

    // ── Cheat B: a network with no subnet. Exists, addresses nothing. ──
    wipe();
    dex('openstack network create lab5-net');
    rs = await grade();
    if (passed(rs, 22)) fail('cheat B PASSED check 22 -- a network with no subnet counted as addressable');
    if (!passed(rs, 21)) fail('cheat B failed 21 too -- 21 should pass here, only 22 should catch this');
    console.log('  cheat B (network created, no subnet) rejected by check 22, while 21 still passes');

    // ── Cheat C: own network and subnet, router with NO external gateway. Isolated. ──
    wipe();
    dex('openstack network create lab5-net');
    dex('openstack subnet create lab5-subnet --network lab5-net --subnet-range 10.55.0.0/24');
    dex('openstack router create lab5-router');
    dex('openstack router add subnet lab5-router lab5-subnet');
    rs = await grade();
    if (passed(rs, 23)) fail('cheat C PASSED check 23 -- a router with no external gateway counted as a way out');
    if (!passed(rs, 21) || !passed(rs, 22))
      fail('cheat C should satisfy 21 and 22 and fail ONLY 23; the network itself is correct');
    console.log('  cheat C (own network, router with no external gateway) rejected by 23 -- 21,22 pass');

    // ── Cheat D (NANCY, live-proven): everything EXCEPT `router add subnet`. ──
    // This is not a cheat, it is a student skipping one line of four. v1 passed it 4/4
    // and told them they had "a way out" while `port list --router` was empty.
    wipe();
    dex('openstack network create lab5-net');
    dex('openstack subnet create lab5-subnet --network lab5-net --subnet-range 10.55.0.0/24');
    dex('openstack router create lab5-router');
    dex('openstack router set lab5-router --external-gateway public');
    // deliberately NOT: openstack router add subnet lab5-router lab5-subnet
    dex(`openstack server create --image ${I} --flavor m1.nano --network lab5-net lab5-vm`);
    for (let i = 0; i < 30; i++) {
      const s2 = dex('openstack server show lab5-vm -f value -c status').trim();
      if (s2 === 'ACTIVE' || s2 === 'ERROR') break;
      sh('sleep 10');
    }
    rs = await grade();
    if (passed(rs, 23)) fail('cheat D PASSED check 23 -- router never wired to the subnet counted as a way out');
    if (!passed(rs, 21) || !passed(rs, 22))
      fail('cheat D should satisfy 21 and 22 and fail ONLY 23 -- the network itself is correct');
    console.log('  cheat D (gateway set but router NEVER added to the subnet) rejected by 23 -- 21,22 pass');

    wipe();
    console.log('ADVERSARIAL PASS: every named cheat was rejected by its target check');
  } finally {
    await fetch(`${BASE}/destroy/${sid}`, { method: 'DELETE', headers: auth }).catch(() => {});
    await post(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${API_KEY}`, { idToken }, { Referer: 'https://hexworth-prime.web.app/' }).catch(() => {});
  }
})();
