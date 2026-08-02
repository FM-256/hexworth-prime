#!/usr/bin/env node
/*
 * Lab "Rescue the Data" walkthrough QC. Runs ON bc1.
 *
 * Doctrine applied from the start (Lab 1 paid for all three):
 *  - VERBATIM: every command is a page line; every wait matches a "# WAIT for:" the page shows.
 *  - TWO RUNS, no cleanup between: run 2 starts from a COMPLETED run (rescue-srv holding the
 *    volume), which is the state the seed engine must refuse to clobber.
 *  - Companion adversarial-rescue.js proves the delete-and-recreate cheat FAILS.
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
  // THROWS, never process.exit. process.exit does not unwind, so it skipped the platform
  // teardown in the finally below and every FAILING run leaked its session and QC account --
  // and failure paths are a large fraction of what these harnesses exist to exercise.
  // Same fix already proven on walkthrough-project.js:188-198.
  const fail = (m) => { console.error('WALKTHROUGH FAIL:', m); throw new Error('__harness_fail__'); };
  // FIXED QC identity. This USED TO BE a random address per run, which created a brand new
  // Firebase user every time -- and the bridge binds a pool slot to a uid PERMANENTLY for
  // sticky mapping, so every gate run consumed one of the 30 slots and never gave it back.
  // Repeated runs walked the pool to exhaustion and launches began returning 503, which is
  // exactly what a real student would have hit. A fixed identity binds ONE slot and every
  // later run reuses it, so QC costs a constant number of slots instead of growing forever.
  const email = 'rescue-walk-qc@hexworth-smoke.local';
  // Firebase policy on this project caps passwords at 10 characters -- a longer one
  // fails signUp with PASSWORD_DOES_NOT_MEET_REQUIREMENTS and then signIn cannot work
  // either, because the account was never created.
  const password = 'QcReW9x';
  let su = await post(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    { email, password, returnSecureToken: true },
    { Referer: 'https://hexworth-prime.web.app/' });
  if (su.status !== 200) {
    // EMAIL_EXISTS is the NORMAL path after the first ever run -- sign in instead.
    su = await post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      { email, password, returnSecureToken: true },
      { Referer: 'https://hexworth-prime.web.app/' });
  }
  if (su.status !== 200) fail(`signUp ${su.status}`);
  const { idToken } = su.data;
  const auth = { Authorization: `Bearer ${idToken}` };

  // The page declares scenario:'orphaned-volume'; the launch must carry it.
  const launch = async () => post(`${BASE}/launch`, { labId: 'openstack-cli', scenario: 'orphaned-volume' }, auth);

  let l = await launch();
  if (l.status !== 200) fail(`launch ${l.status}: ${JSON.stringify(l.data).slice(0, 300)}`);
  if (l.data.cloudMode !== 'personal') fail(`expected personal cloud, got ${l.data.cloudMode}`);
  if (l.data.seeded !== true) fail(`expected a fresh seed, got seeded=${l.data.seeded}`);
  let sid = l.data.sessionId;
  const slot = l.data.cloudSlot;
  console.log(`launched ${slot} (${sid}), scenario seeded`);
  const dex = (cmd) => sh(`docker exec sandbox-${sid} sh -lc ${JSON.stringify(cmd)}`);

  // The seeded ids must be present in the container env -- that is what makes the checks
  // unforgeable. If they are missing the whole design is inert, so fail loudly.
  let seedVol = dex('printenv SEED_VOL_ID').trim();
  let seedSrv = dex('printenv SEED_SRV_ID').trim();
  if (!seedVol || !seedSrv) fail(`seed ids missing from container env (vol=${seedVol} srv=${seedSrv})`);
  console.log(`  seed ids in env: vol=${seedVol.slice(0, 8)}... srv=${seedSrv.slice(0, 8)}...`);

  let img = '';
  for (let i = 0; i < 6 && !img; i++) { img = dex('openstack image list -f value -c Name | head -1').trim(); if (!img) sh('sleep 10'); }
  if (!img) fail('image list empty');

  async function runLab(pass) {
    console.log(`===== RUN ${pass} =====`);

    // Run 2 begins from a COMPLETED run: rescue-srv exists holding the volume, and the seed
    // will have returned seeded:false. The page tells the student to continue or clean up;
    // this harness takes the clean-up path so the rescue arc can be exercised again.
    if (pass === 2) {
      const cur = dex('openstack server list -f value -c ID').trim().split('\n').filter(Boolean)[0];
      if (cur) {
        console.log('  (completed-run state: detaching and clearing so the arc can repeat)');
        try { dex(`openstack server remove volume ${cur} ${seedVol}`); } catch (e) { /* not attached */ }
        for (let i = 0; i < 12; i++) { if (dex(`openstack volume show ${seedVol} -f value -c status`).trim() === 'available') break; sh('sleep 5'); }
        dex(`openstack server delete ${cur}`);
        for (let i = 0; i < 12; i++) { if (!dex('openstack server list -f value -c ID').trim()) break; sh('sleep 5'); }
      }
      // Re-seed by relaunching, exactly as a returning student would.
      await fetch(`${BASE}/destroy/${sid}`, { method: 'DELETE', headers: auth });
      const l2 = await launch();
      if (l2.status !== 200 || l2.data.cloudMode !== 'personal') fail(`relaunch ${l2.status}`);
      sid = l2.data.sessionId;
      console.log(`  relaunched (${sid}), seeded=${l2.data.seeded}`);
      // Re-seed mints NEW ids; refresh them or cleanup will chase a deleted volume.
      seedVol = dex('printenv SEED_VOL_ID').trim();
      seedSrv = dex('printenv SEED_SRV_ID').trim();
      if (!seedVol || !seedSrv) fail('re-seed did not inject SEED_VOL_ID/SEED_SRV_ID');
      console.log(`  refreshed seed ids: vol=${seedVol.slice(0, 8)}... srv=${seedSrv.slice(0, 8)}...`);
    }

    // Step 1 (page): survey. RUN THE PAGE'S ACTUAL COMMANDS (Chris block 2026-07-30).
    // This harness claimed "VERBATIM" while skipping straight to step 2, so the page's
    // survey lines were never executed -- which is how `openstack quota show --default`
    // survived. It shows the default quota CLASS (instances 10), not the project's real
    // quota (1), so a student following the page saw the number that DISPROVES the lesson.
    // Verbatim now means verbatim, and the quota value is asserted, not merely printed.
    console.log('step 1: survey');
    const before = dex('openstack server list -f value -c Name');
    if (!before.includes('ghost-srv')) fail(`expected ghost-srv in the project, got: ${before.trim()}`);
    const volList = dex('openstack volume list -f value -c Name');
    if (!volList.includes('orphan-vol')) fail(`expected orphan-vol in the project, got: ${volList.trim()}`);
    const volShow = dex('openstack volume show orphan-vol -f value -c status').trim();
    if (volShow !== 'in-use') fail(`step 1 expected orphan-vol in-use, got: ${volShow}`);
    const quota = dex('openstack quota show -f value -c instances 2>/dev/null || openstack quota show | grep -E "^\\| instances"');
    if (!/\b1\b/.test(quota)) {
      fail(`step 1 quota command must show the PROJECT quota of 1 instance -- got: ${quota.trim()}. `
         + `If this reads 10, the page is using --default (the default quota CLASS) again.`);
    }
    console.log(`  survey verified: ghost-srv + orphan-vol in-use, quota instances=1`);

    // Step 2 (page): the refusal that protects you.
    console.log('step 2: confirm the trap (delete refused while in-use)');
    const refusal = dex('openstack volume delete orphan-vol 2>&1 || true');
    if (!/invalid volume|must be available/i.test(refusal)) fail(`expected an in-use refusal, got: ${refusal.slice(0, 200)}`);

    // Step 3 (page): detach, WAIT for available.
    console.log('step 3: detach');
    dex('openstack server remove volume ghost-srv orphan-vol');
    let dst = '';
    for (let i = 0; i < 12; i++) { dst = dex('openstack volume show orphan-vol -f value -c status').trim(); if (dst === 'available') break; sh('sleep 5'); }
    if (dst !== 'available') fail(`detach never reached available (last: ${dst}) -- the page's wait is not sufficient`);

    // Step 4 (page): reclaim the quota, WAIT for empty.
    console.log('step 4: reclaim quota');
    dex('openstack server delete ghost-srv');
    for (let i = 0; i < 12; i++) { if (!dex('openstack server list -f value -c ID').trim()) break; sh('sleep 5'); }

    // Step 5 (page): rebuild and re-attach the SAME volume.
    console.log('step 5: rebuild and re-attach');
    dex(`openstack server create --flavor m1.nano --image "${img}" --network shared rescue-srv`);
    let st = '';
    for (let i = 0; i < 30; i++) { st = dex('openstack server show rescue-srv -f value -c status').trim(); if (st === 'ACTIVE' || st === 'ERROR') break; sh('sleep 10'); }
    if (st !== 'ACTIVE') fail(`rescue-srv ${st}`);
    dex('openstack server add volume rescue-srv orphan-vol');
    for (let i = 0; i < 12; i++) { if (dex('openstack volume show orphan-vol -f value -c status').trim() === 'in-use') break; sh('sleep 5'); }

    const g = await fetch(`${BASE}/check/${sid}?mission=`, { headers: auth });
    const gr = await g.json();
    emitCoverage(gr.results || []);
    // Scoped to THIS lab's ids explicitly. It used to be `r.id >= 10`, an open-ended
    // range -- but every OpenStack lab shares the single labId 'openstack-cli', so as
    // later labs added checks the range quietly swept them in and the pass count could
    // never be reached. Latent since the first lab was added; it only became visible when
    // the capstone's 25-28 pushed the total high enough to notice.
    const rescue = (gr.results || []).filter((r) => [10, 11, 12].includes(Number(r.id)));
    rescue.forEach((r) => console.log(`  run${pass} check ${r.id}: ${r.pass ? 'PASS' : 'FAIL'} -- ${r.desc}`));
    if (rescue.length !== 3 || !rescue.every((r) => r.pass)) fail(`run ${pass}: grader did not pass 3/3`);
    console.log(`  RUN ${pass} PASS 3/3`);
  }

  try {
  await runLab(1);
  await runLab(2);

  console.log('cleanup');
  // Best-effort: teardown must never turn a PASSED run into a gate failure. Resources may
  // already be gone; the verdict has been earned by this point and cleanup is hygiene.
  try {
    const cur = dex('openstack server list -f value -c ID').trim().split('\n').filter(Boolean)[0];
    if (cur) {
      try { dex(`openstack server remove volume ${cur} ${seedVol}`); } catch (e) { /* not attached */ }
      for (let i = 0; i < 12; i++) {
        let st2 = '';
        try { st2 = dex(`openstack volume show ${seedVol} -f value -c status`).trim(); } catch (e) { break; }
        if (st2 === 'available') break;
        sh('sleep 5');
      }
      try { dex(`openstack volume delete ${seedVol}`); } catch (e) { /* already gone */ }
      try { dex(`openstack server delete ${cur}`); } catch (e) { /* already gone */ }
    }
  } catch (e) {
    console.log(`  (cleanup best-effort: ${e.message.split('\n')[0]})`);
  }
  console.log(`OPERATOR: null hexworth_uid on ${slot}`);
  console.log('WALKTHROUGH PASS 3/3 on BOTH runs (fresh seed AND returning student)');
  } finally {
    // Runs on the FAILING path too -- the whole point. The rescue-specific resource cleanup
    // above stays on the success path (it has its own best-effort try/catch and its own volume
    // names); only the PLATFORM teardown belongs here, matching walkthrough-project.js:188-191.
    await fetch(`${BASE}/destroy/${sid}`, { method: 'DELETE', headers: auth }).catch(() => {});
    await post(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${API_KEY}`, { idToken }, { Referer: 'https://hexworth-prime.web.app/' }).catch(() => {});
  }
})().catch((e) => {
  // Runs AFTER the finally. Sentinel filtered so a normal failure does not print
  // "__harness_fail__" into stdout, which qc-lab.sh stage 3 parses.
  if (!e || e.message !== '__harness_fail__') console.error('WALKTHROUGH FAIL (throw):', (e && e.message || '').slice(0, 300));
  process.exit(1);
});
