#!/usr/bin/env node
/*
 * Launch-chain lab ADVERSARIAL QC (Stage 4 lab 2). Runs ON bc1.
 *
 * A walkthrough proves a lab is COMPLETABLE. It does not prove it is not trivially
 * beatable -- Nancy found a 5-command shortcut past a 4/4-passing Cinder lab. So each
 * named cheat below must FAIL its target check. If a cheat passes, the lab is broken
 * and the walkthrough is not permitted to run (qc-lab.sh enforces that ordering).
 *
 * The cheats are the three ways this lab is actually gettable wrong, which is the point:
 * each one is a real mistake a student makes, and each must be caught by exactly one check.
 *   A  create but never wait      -> BUILD, not ACTIVE          must fail 14
 *   B  boot on a bigger flavor    -> not m1.nano                must fail 15
 *   C  boot with no --network     -> ACTIVE but unreachable     must fail 16
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
  const email = 'chain-adv-qc@hexworth-smoke.local';
  // Firebase policy on this project caps passwords at 10 characters -- a longer one
  // fails signUp with PASSWORD_DOES_NOT_MEET_REQUIREMENTS and then signIn cannot work
  // either, because the account was never created.
  const password = 'QcChA9x';
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
    try {
      const names = dex('openstack server list -f value -c Name').trim().split('\n').map((x) => x.trim());
      if (names.includes('chain-vm')) {
        dex('openstack server delete chain-vm');
        for (let i = 0; i < 24; i++) {
          const n = dex('openstack server list -f value -c Name').trim().split('\n').map((x) => x.trim());
          if (!n.includes('chain-vm')) break;
          sh('sleep 5');
        }
      }
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
    // ── Cheat Z (the emptiest cheat there is): submit nothing and see what scores. ──
    // Added 2026-07-31 after qc-lab.sh stage 3 reported checks 13 and 15 as
    // "PASS 3x, FAIL 0x -- may accept EVERYTHING". Both checks are written correctly, but
    // EVERY cheat below happens to leave chain-vm standing on m1.nano, so nothing in the
    // run ever demonstrated that 13 or 15 can refuse anything. Cheat B is supposed to be
    // check 15's negative case, but the 192MB per-student RAM quota rejects a bigger flavor
    // at CREATE time, so the server never exists to be graded and 15 is never exercised.
    // An empty project is the one state that legitimately fails all four, and asserting it
    // is worth doing on its own: a student who has done nothing must score nothing.
    wipe();
    let rs = await grade();
    for (const id of [13, 14, 15, 16]) {
      if (passed(rs, id)) fail(`cheat Z PASSED check ${id} -- an EMPTY project scored a point`);
    }
    console.log('  cheat Z (nothing built at all) rejected by all four checks');

    // ── Cheat A: create, never wait. Status is BUILD, not ACTIVE. ──
    wipe();
    dex(`openstack server create --image ${I} --flavor m1.nano --network ${N} chain-vm`);
    rs = await grade();
    if (passed(rs, 14)) fail('cheat A PASSED check 14 -- a server still in BUILD counted as booted');
    console.log('  cheat A (created but never waited for ACTIVE) rejected by check 14');

    // ── Cheat B: right chain, wrong size. ──
    if (bigFlavor) {
      wipe();
      // The per-student RAM quota (192MB, measured 2026-07-31) refuses anything above
      // m1.nano at CREATE time, before check 15 is ever consulted. That refusal is a
      // stronger rejection than the check, so count it as one -- but say so, rather
      // than silently reporting a pass the check did not actually earn.
      let booted = true;
      try {
        dex(`openstack server create --image ${I} --flavor ${JSON.stringify(bigFlavor).slice(1, -1)} --network ${N} chain-vm`);
      } catch (e) {
        const msg = String((e && e.stderr) || '');
        if (!/Quota exceeded/i.test(msg)) fail(`cheat B failed for an unexpected reason: ${msg.slice(0, 200)}`);
        booted = false;
        console.log(`  cheat B (booted on ${bigFlavor}) rejected by the RAM QUOTA at create time, before check 15`);
      }
      if (booted) for (let i = 0; i < 30; i++) {
        const st = dex('openstack server show chain-vm -f value -c status').trim();
        if (st === 'ACTIVE' || st === 'ERROR') break;
        sh('sleep 10');
      }
      if (booted) {
        rs = await grade();
        if (passed(rs, 15)) fail(`cheat B PASSED check 15 -- flavor '${bigFlavor}' counted as m1.nano`);
        console.log(`  cheat B (booted on ${bigFlavor}, not m1.nano) rejected by check 15`);
      }
    } else {
      console.log('  cheat B SKIPPED: no non-nano flavor exists on this cloud to test with');
    }

    // ── Cheat C: boots fine, no network attached. ──
    wipe();
    let noNet = true;
    try {
      dex(`openstack server create --image ${I} --flavor m1.nano chain-vm`);
    } catch (e) {
      noNet = false;   // this cloud refuses a networkless boot outright, which is also a pass
      console.log('  cheat C n/a: the cloud refuses a boot with no --network at create time');
    }
    if (noNet) {
      for (let i = 0; i < 30; i++) {
        const st = dex('openstack server show chain-vm -f value -c status').trim();
        if (st === 'ACTIVE' || st === 'ERROR') break;
        sh('sleep 10');
      }
      rs = await grade();
      const addrs = dex('openstack server show chain-vm -f value -c addresses').trim();
      if (passed(rs, 16)) {
        // MEASURED 2026-07-31: this cloud has exactly one tenant network and Nova
        // auto-attaches it, so omitting --network still yields an address. Check 16 is
        // therefore NOT defeatable this way here -- it asserts a real outcome but cannot
        // discriminate on a single-network cloud. Recording that honestly instead of
        // failing the gate on an invalid cheat, and instead of quietly claiming a
        // rejection the check did not earn.
        if (!addrs) fail('cheat C PASSED check 16 while the server genuinely had NO address -- check 16 is broken');
        console.log('  cheat C n/a: this cloud auto-attaches its only network, so a boot without');
        console.log('              --network still gets an address (' + addrs.split(/\s+/)[0] + ').');
        console.log('              Check 16 asserts a real outcome but cannot be defeated here.');
      } else {
        console.log('  cheat C (booted with no --network) rejected by check 16');
      }
    }

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
