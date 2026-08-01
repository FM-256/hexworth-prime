#!/usr/bin/env node
/*
 * Launch-chain lab walkthrough-verbatim QC (Stage 4 lab 2). Runs ON bc1.
 *
 * VERBATIM MEANS VERBATIM. walkthrough-cinder.js v1 inserted a poll the page never
 * taught, passed 4/4, and would have failed an honest student following the page. So:
 * every command below is a line lifted from cloud-openstack-launch-chain-live.lab.html,
 * and the ONLY waits are the two the page marks with "# WAIT for:" / "WAIT until":
 *   step 2  -- server list, until the old chain-vm is gone
 *   step 4  -- server show ... -c status, until ACTIVE
 * If a wait is needed anywhere else, that is the LAB's bug to fix, not this harness's
 * to paper over by adding a poll the student was never told to run.
 *
 * Runs the lab TWICE with no cleanup between. A successful run leaves chain-vm behind,
 * and the page's own step 2 is the clean-up -- so run 2 proves a returning student is
 * not blocked by their own previous success (the failure Chris found on Cinder).
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
  const fail = (m) => { console.error('WALKTHROUGH FAIL:', m); throw new Error('__harness_fail__'); };
  // FIXED QC identity. This USED TO BE a random address per run, which created a brand new
  // Firebase user every time -- and the bridge binds a pool slot to a uid PERMANENTLY for
  // sticky mapping. So every gate run consumed another of the 30 slots and never gave it
  // back; repeated runs walked the pool to exhaustion and launches started returning 503,
  // which is what real students would have hit. A fixed identity binds exactly ONE slot and
  // every later run reuses it, so QC costs a constant 12 slots instead of growing forever.
  const email = 'chain-walk-qc@hexworth-smoke.local';
  // Firebase policy on this project caps passwords at 10 characters -- a longer one
  // fails signUp with PASSWORD_DOES_NOT_MEET_REQUIREMENTS and then signIn cannot work
  // either, because the account was never created.
  const password = 'QcChW9x';
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
  if (l1.data.cloudMode !== 'personal') fail(`needed a personal cloud, got '${l1.data.cloudMode}' -- cannot grade this lab`);
  const dex = (cmd) => sh(`docker exec sandbox-${sid} sh -lc ${JSON.stringify(cmd)}`);

  // Page step 1: look before you boot. These are the three discovery commands verbatim.
  let img = '', net = '';
  for (let i = 0; i < 6 && !img; i++) {
    img = dex('openstack image list -f value -c Name | head -1').trim();
    if (!img) sh('sleep 10');                       // credential warm-up, pre-lab, not a lab step
  }
  if (!img) fail('no image visible -- the cloud credential never came up');
  dex('openstack flavor list');
  net = dex('openstack network list -f value -c Name | head -1').trim();
  if (!net) fail('no network visible');

  async function runLab(pass) {
    console.log(`--- run ${pass}: image=${img} network=${net} ---`);

    // Page step 2: start clean. The page shows THREE lines and one wait.
    const existing = dex('openstack server list -f value -c Name').trim();
    if (existing.split('\n').some((n) => n.trim() === 'chain-vm')) {
      dex('openstack server delete chain-vm');
      let gone = false;                              // page: "WAIT until it is gone"
      for (let i = 0; i < 24; i++) {
        const names = dex('openstack server list -f value -c Name').trim().split('\n').map((x) => x.trim());
        if (!names.includes('chain-vm')) { gone = true; break; }
        sh('sleep 5');
      }
      if (!gone) fail(`run ${pass}: old chain-vm never disappeared -- a returning student is stuck here`);
    }

    // Page step 3: drive the chain. One command, three ingredients.
    dex(`openstack server create --image ${JSON.stringify(img).slice(1, -1)} --flavor m1.nano --network ${JSON.stringify(net).slice(1, -1)} chain-vm`);

    // Page step 4: prove it booted. The page's only other wait.
    let st = '';
    for (let i = 0; i < 30; i++) {
      st = dex('openstack server show chain-vm -f value -c status').trim();
      if (st === 'ACTIVE' || st === 'ERROR') break;
      sh('sleep 10');
    }
    if (st !== 'ACTIVE') {
      let fault = '';
      try { fault = dex('openstack server show chain-vm -c fault').trim(); } catch (e) { /* page offers this only on ERROR */ }
      fail(`run ${pass}: chain-vm ended '${st}', not ACTIVE. ${fault}`);
    }
    const addrs = dex('openstack server show chain-vm -f value -c addresses').trim();
    if (!addrs) fail(`run ${pass}: ACTIVE but no address -- check 16 would fail an honest student`);
    dex('openstack server show chain-vm -f value -c flavor');

    const g = await fetch(`${BASE}/check/${sid}?mission=`, { headers: auth });
    const gr = await g.json();
    const results = (gr && gr.results) || [];
    emitCoverage(results);
    const want = [13, 14, 15, 16];
    const missed = want.filter((id) => !results.some((r) => Number(r.id) === id && r.pass));
    console.log(`run ${pass}: ` + want.map((id) => {
      const hit = results.filter((r) => Number(r.id) === id)[0];
      return `${id}=${hit && hit.pass ? 'PASS' : 'fail'}`;
    }).join(' '));
    if (missed.length) fail(`run ${pass}: honest path did not satisfy ${missed.join(', ')}`);
  }

  try {
    await runLab(1);
    await runLab(2);            // deliberately NO cleanup between
    console.log('WALKTHROUGH PASS: 4/4 twice, second run started from the first run\'s leftovers');
  } finally {
    await fetch(`${BASE}/destroy/${sid}`, { method: 'DELETE', headers: auth }).catch(() => {});
    await post(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${API_KEY}`, { idToken }, { Referer: 'https://hexworth-prime.web.app/' }).catch(() => {});
  }
})().catch((e) => {
  // Runs AFTER the finally block. That ordering is the entire fix: fail() throws rather than
  // calling process.exit, because process.exit does not unwind and therefore skipped the
  // session teardown and QC-account deletion on every failing run.
  if (!e || e.message !== '__harness_fail__') console.error('HARNESS ERROR:', e && e.message);
  process.exit(1);
});
