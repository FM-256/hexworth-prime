#!/usr/bin/env node
/*
 * Security-group lab walkthrough-verbatim QC (Stage 4 lab 3). Runs ON bc1.
 *
 * VERBATIM MEANS VERBATIM. walkthrough-cinder.js v1 inserted a poll the page never
 * taught, passed 4/4, and would have failed an honest student following the page. So:
 * every command below is a line lifted from cloud-openstack-secgroup-live.lab.html,
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
  const email = 'sg-walk-qc@hexworth-smoke.local';
  // Firebase policy on this project caps passwords at 10 characters -- a longer one
  // fails signUp with PASSWORD_DOES_NOT_MEET_REQUIREMENTS and then signIn cannot work
  // either, because the account was never created.
  const password = 'QcSgW9x';
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

    // Page step 2: start clean. Delete a leftover group AND the server holding it, or the
    // group delete fails with "in use" -- the exact wall a returning student hits.
    const names = dex('openstack security group list -f value -c Name').trim().split('\n').map(x => x.trim());
    if (dex('openstack server list -f value -c Name').trim().split('\n').map(x => x.trim()).includes('guard-vm')) {
      dex('openstack server delete guard-vm');
      for (let i = 0; i < 24; i++) {
        if (!dex('openstack server list -f value -c Name').trim().split('\n').map(x => x.trim()).includes('guard-vm')) break;
        sh('sleep 5');
      }
    }
    if (names.includes('web-sg')) dex('openstack security group delete web-sg');

    // Page step 2: create the group.
    dex('openstack security group create web-sg --description "lab 3"');

    // Page step 3: one port, one source. Verbatim from the page, including the CIDR.
    dex('openstack security group rule create web-sg --protocol tcp --dst-port 22:22 --remote-ip 10.0.0.0/8 --ingress');
    dex('openstack security group rule list web-sg');

    // Page step 4: attach it. This is the lab.
    dex(`openstack server create --image ${JSON.stringify(img).slice(1,-1)} --flavor m1.nano --network ${JSON.stringify(net).slice(1,-1)} --security-group web-sg guard-vm`);
    let st = '';
    for (let i = 0; i < 30; i++) {                     // page: "WAIT for: ACTIVE"
      st = dex('openstack server show guard-vm -f value -c status').trim();
      if (st === 'ACTIVE' || st === 'ERROR') break;
      sh('sleep 10');
    }
    if (st !== 'ACTIVE') fail(`run ${pass}: guard-vm ended '${st}', not ACTIVE`);
    const sg = dex('openstack server show guard-vm -f value -c security_groups').trim();
    if (!/web-sg/.test(sg)) fail(`run ${pass}: guard-vm is ACTIVE but web-sg is not attached (${sg})`);

    const g = await fetch(`${BASE}/check/${sid}?mission=`, { headers: auth });
    const gr = await g.json();
    const results = (gr && gr.results) || [];
    emitCoverage(results);
    const want = [17, 18, 19, 20];
    const missed = want.filter(id => !results.some(r => Number(r.id) === id && r.pass));
    console.log(`run ${pass}: ` + want.map(id => {
      const hit = results.filter(r => Number(r.id) === id)[0];
      return `${id}=${hit && hit.pass ? 'PASS' : 'fail'}`;
    }).join(' '));
    if (missed.length) fail(`run ${pass}: honest path did not satisfy ${missed.join(', ')}`);
  }

  try {
    await runLab(1);
    await runLab(2);            // deliberately NO cleanup between
    console.log('WALKTHROUGH PASS: 4/4 twice, second run started from the first run\'s leftovers');
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
