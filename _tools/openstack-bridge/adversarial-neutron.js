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

// Coverage trace consumed by qc-lab.sh stage 3. Emits EVERY id the grader returned rather
// than a hardcoded list, so a harness can never silently disagree with the gate about which
// checks a lab owns -- the gate's IDS list decides what is actually enforced.
// Exists because check 27 shipped rejecting EVERYONE while the adversarial harness happily
// reported "the cheat was rejected". A check only seen failing is not a working check.
function emitCoverage(results) {
  for (const r of (results || [])) {
    if (r && r.id !== undefined) console.log(`COVERAGE ${r.id} ${r.pass ? 'PASS' : 'FAIL'}`);
  }
}

const sh = (c) => execSync(c, { encoding: 'utf8', timeout: 300000 });

async function post(url, body, headers) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  return { status: r.status, data: await r.json().catch(() => null) };
}

(async () => {
  const fail = (m) => { console.error('ADVERSARIAL FAIL:', m); throw new Error('__harness_fail__'); };
  // FIXED QC identity. This USED TO BE a random address per run, which created a brand new
  // Firebase user every time -- and the bridge binds a pool slot to a uid PERMANENTLY for
  // sticky mapping, so every gate run consumed one of the 30 slots and never gave it back.
  // Repeated runs walked the pool to exhaustion and launches began returning 503, which is
  // exactly what a real student would have hit. A fixed identity binds ONE slot and every
  // later run reuses it, so QC costs a constant number of slots instead of growing forever.
  const email = 'net-adv-qc@hexworth-smoke.local';
  // Firebase policy on this project caps passwords at 10 characters -- a longer one
  // fails signUp with PASSWORD_DOES_NOT_MEET_REQUIREMENTS and then signIn cannot work
  // either, because the account was never created.
  const password = 'QcNeA9x';
  let su = await post(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    { email, password, returnSecureToken: true },
    { Referer: 'https://hexworth-prime.web.app/' });
  if (su.status !== 200) {
    // EMAIL_EXISTS is the NORMAL path after the first ever run -- sign in instead.
    su = await post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      { email, password, returnSecureToken: true },
      { Referer: 'https://hexworth-prime.web.app/' });
  }
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
    const rs = (gr && gr.results) || [];
    emitCoverage(rs);
    return rs;
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
    /* TEARDOWN ON EVERY PATH, INCLUDING FAILURE.
       Cleanup used to sit at the END OF THE TRY BLOCK, so a run that FAILED left its instance
       behind -- and because the bridge binds a pool slot to a uid permanently, a stranded VM
       consumed that slot for good. 25 of 30 slots were lost this way and had to be purged by
       hand on 2026-08-03, after real students hit "cloud is at capacity".
       Sweeping the whole project is safe: a harness owns one pool slot exclusively. It must run
       BEFORE /destroy because it needs the sandbox container, and servers must go before
       volumes because an attached volume refuses to delete. */
    try {
      const names = () => dex('openstack server list -f value -c Name').trim().split('\n')
        .map((n) => n.trim()).filter(Boolean);
      names().forEach((n) => { try { dex(`openstack server delete ${n}`); } catch (e) { /* already gone */ } });
      for (let i = 0; i < 12 && names().length; i++) { sh('sleep 5'); }
      dex('openstack volume list -f value -c Name').trim().split('\n')
        .map((v) => v.trim()).filter(Boolean)
        .forEach((v) => { try { dex(`openstack volume delete ${v}`); } catch (e) { /* still attached or gone */ } });
    } catch (e) { /* sandbox already torn down -- nothing left to sweep */ }

    // The QC account is deliberately NOT deleted -- see adversarial-wall.js:105-111. Deleting it
    // frees the email, so the next run's signUp mints a NEW uid and binds ANOTHER pool slot.
    // Self-inflicted leak, one per run per harness.
    await fetch(`${BASE}/destroy/${sid}`, { method: 'DELETE', headers: auth }).catch(() => {});
  }
})().catch((e) => {
  // Runs AFTER the finally block. That ordering is the entire fix: fail() throws rather than
  // calling process.exit, because process.exit does not unwind and therefore skipped the
  // session teardown and QC-account deletion on every failing run.
  if (!e || e.message !== '__harness_fail__') console.error('HARNESS ERROR:', e && e.message);
  process.exit(1);
});
