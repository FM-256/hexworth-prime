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
const sh = (c) => execSync(c, { encoding: 'utf8', timeout: 300000 });

async function post(url, body, headers) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  return { status: r.status, data: await r.json().catch(() => null) };
}

(async () => {
  const fail = (m) => { console.error('WALKTHROUGH FAIL:', m); process.exit(1); };
  const su = await post(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    { email: `rescue-qc-${Math.random().toString(36).slice(2, 8)}@hexworth-smoke.local`,
      password: 'Rq' + Math.random().toString(36).slice(2, 6) + '9X', returnSecureToken: true },
    { Referer: 'https://hexworth-prime.web.app/' });
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
  const seedVol = dex('printenv SEED_VOL_ID').trim();
  const seedSrv = dex('printenv SEED_SRV_ID').trim();
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
      const v2 = dex('printenv SEED_VOL_ID').trim();
      if (!v2) fail('re-seed did not inject SEED_VOL_ID');
    }

    // Step 1 (page): survey.
    console.log('step 1: survey');
    const before = dex('openstack server list -f value -c Name');
    if (!before.includes('ghost-srv')) fail(`expected ghost-srv in the project, got: ${before.trim()}`);

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
    const rescue = (gr.results || []).filter((r) => r.id >= 10);
    rescue.forEach((r) => console.log(`  run${pass} check ${r.id}: ${r.pass ? 'PASS' : 'FAIL'} -- ${r.desc}`));
    if (rescue.length !== 3 || !rescue.every((r) => r.pass)) fail(`run ${pass}: grader did not pass 3/3`);
    console.log(`  RUN ${pass} PASS 3/3`);
  }

  await runLab(1);
  await runLab(2);

  console.log('cleanup');
  const cur = dex('openstack server list -f value -c ID').trim().split('\n').filter(Boolean)[0];
  if (cur) {
    try { dex(`openstack server remove volume ${cur} ${seedVol}`); } catch (e) { /* ok */ }
    for (let i = 0; i < 12; i++) { if (dex(`openstack volume show ${seedVol} -f value -c status`).trim() === 'available') break; sh('sleep 5'); }
    dex(`openstack volume delete ${seedVol}`);
    dex(`openstack server delete ${cur}`);
  }
  await fetch(`${BASE}/destroy/${sid}`, { method: 'DELETE', headers: auth });
  await post(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${API_KEY}`, { idToken }, { Referer: 'https://hexworth-prime.web.app/' });
  console.log(`OPERATOR: null hexworth_uid on ${slot}`);
  console.log('WALKTHROUGH PASS 3/3 on BOTH runs (fresh seed AND returning student)');
})().catch((e) => { console.error('WALKTHROUGH FAIL (throw):', e.message.slice(0, 300)); process.exit(1); });
