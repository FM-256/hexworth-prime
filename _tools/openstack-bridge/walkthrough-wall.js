#!/usr/bin/env node
/*
 * Lab 2 "Read the Wall" walkthrough QC. Runs ON bc1.
 *
 * Doctrine inherited from Lab 1, applied from the START this time:
 *  - VERBATIM: every command below is a line from the page, and every wait corresponds to a
 *    "# WAIT for:" the page shows. No poll the page does not instruct.
 *  - TWO RUNS, no cleanup between: run 2 begins from what a real completed run leaves
 *    behind (a phoenix instance), which is exactly the state that blocks a naive restart.
 *  - A companion adversarial-wall.js proves the named cheats FAIL.
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
  // THROWS, never process.exit. process.exit does not unwind, so it skipped the finally at the
  // bottom and every FAILING run leaked its session. Pattern proven on
  // walkthrough-project.js:188-198.
  const fail = (m) => { console.error('WALKTHROUGH FAIL:', m); throw new Error('__harness_fail__'); };
  // FIXED QC identity -- see the matching note in adversarial-wall.js. A random address per run
  // created a new Firebase user each time, and the bridge binds a pool slot to a uid
  // PERMANENTLY with nothing to release it (reclaim-idle-slots.py cannot even run, taskboard
  // #275). The pool measured 29 bound of 30 on 2026-08-01, held almost entirely by QC uids.
  const email = 'wall-walk-qc@hexworth-smoke.local';
  // Firebase policy on this project caps passwords at 10 characters.
  const password = 'QcWaW9x';
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

  const l = await post(`${BASE}/launch`, { labId: 'openstack-cli' }, auth);
  if (l.status !== 200 || l.data.cloudMode !== 'personal') fail(`launch ${l.status} ${l.data && l.data.cloudMode}`);
  const sid = l.data.sessionId, slot = l.data.cloudSlot;
  const dex = (cmd) => sh(`docker exec sandbox-${sid} sh -lc ${JSON.stringify(cmd)}`);
  console.log(`launched ${slot} (${sid})`);

  // Opened after sid and auth are bound, because the finally at the bottom uses both.
  // Everything below runs inside it so the session is torn down however this exits.
  try {
  let img = '';
  for (let i = 0; i < 6 && !img; i++) { img = dex('openstack image list -f value -c Name | head -1').trim(); if (!img) sh('sleep 10'); }
  if (!img) fail('image list empty');

  async function runLab(pass) {
    console.log(`===== RUN ${pass} =====`);

    // Step 1 (page): clean start -- clear BOTH a leftover server and a leftover volume.
    console.log('step 1: clean start');
    const oldSrv = dex('openstack server list -f value -c ID').trim().split('\n').filter(Boolean)[0];
    const oldVol = dex('openstack volume list -f value -c Name').includes('wall-vol');
    if (oldSrv || oldVol) {
      console.log(`  (prior-run state: server=${oldSrv || 'none'} wall-vol=${oldVol} -- clearing as the page instructs)`);
      if (oldSrv && oldVol) {
        try { dex(`openstack server remove volume ${oldSrv} wall-vol`); } catch (e) { /* not attached */ }
        for (let i = 0; i < 12; i++) { if (dex('openstack volume show wall-vol -f value -c status').trim() === 'available') break; sh('sleep 5'); }
      }
      if (oldSrv) {
        dex(`openstack server delete ${oldSrv}`);
        for (let i = 0; i < 12; i++) { if (!dex('openstack server list -f value -c ID').trim()) break; sh('sleep 5'); }
      }
      if (oldVol) { dex('openstack volume delete wall-vol'); sh('sleep 5'); }
    }

    // Step 2 (page): build the situation that will hit the walls.
    console.log('step 2: build wall-srv + wall-vol, attach');
    dex(`openstack server create --flavor m1.nano --image "${img}" --network shared wall-srv`);
    let st = '';
    for (let i = 0; i < 30; i++) { st = dex('openstack server show wall-srv -f value -c status').trim(); if (st === 'ACTIVE' || st === 'ERROR') break; sh('sleep 10'); }
    if (st !== 'ACTIVE') fail(`wall-srv ${st}`);
    dex('openstack volume create --size 1 wall-vol');
    for (let i = 0; i < 12; i++) { if (dex('openstack volume show wall-vol -f value -c status').trim() === 'available') break; sh('sleep 5'); }
    dex('openstack server add volume wall-srv wall-vol');
    for (let i = 0; i < 12; i++) { if (dex('openstack volume show wall-vol -f value -c status').trim() === 'in-use') break; sh('sleep 5'); }

    // Step 3 (page): WALL ONE -- the quota refusal. The command is EXPECTED to fail;
    // the page tells the student to capture it with 2>&1.
    console.log('step 3: hit the quota wall, capture it');
    dex(`mkdir -p ~/notes && openstack server create --flavor m1.nano --image "${img}" --network shared phoenix > ~/notes/quota-error.txt 2>&1 || true`);
    const q = dex('cat ~/notes/quota-error.txt');
    if (!/quota exceeded/i.test(q)) fail(`expected a quota refusal, got: ${q.slice(0, 200)}`);

    // Step 4 (page): WALL TWO -- the volume state machine refusal.
    console.log('step 4: hit the volume-state wall, capture it');
    dex('openstack volume delete wall-vol > ~/notes/state-error.txt 2>&1 || true');
    const v = dex('cat ~/notes/state-error.txt');
    if (!/invalid volume|must be available/i.test(v)) fail(`expected an in-use refusal, got: ${v.slice(0, 200)}`);

    // Step 5 (page): resolve BOTH walls.
    console.log('step 5: resolve both walls');
    dex('openstack server remove volume wall-srv wall-vol');
    for (let i = 0; i < 12; i++) { if (dex('openstack volume show wall-vol -f value -c status').trim() === 'available') break; sh('sleep 5'); }
    dex('openstack volume delete wall-vol');
    dex('openstack server delete wall-srv');
    for (let i = 0; i < 12; i++) { if (!dex('openstack server list -f value -c ID').trim()) break; sh('sleep 5'); }
    dex(`openstack server create --flavor m1.nano --image "${img}" --network shared phoenix`);
    st = '';
    for (let i = 0; i < 30; i++) { st = dex('openstack server show phoenix -f value -c status').trim(); if (st === 'ACTIVE' || st === 'ERROR') break; sh('sleep 10'); }
    if (st !== 'ACTIVE') fail(`phoenix ${st}`);

    const g = await fetch(`${BASE}/check/${sid}?mission=`, { headers: auth });
    const gr = await g.json();
    const wall = (gr.results || []).filter((r) => r.id >= 7);
    wall.forEach((r) => console.log(`  run${pass} check ${r.id}: ${r.pass ? 'PASS' : 'FAIL'} -- ${r.desc}`));
    if (wall.length !== 3 || !wall.every((r) => r.pass)) fail(`run ${pass}: grader did not pass 3/3`);
    console.log(`  RUN ${pass} PASS 3/3`);
  }

  await runLab(1);
  // deliberately NO cleanup -- run 2 must start from a completed run's steady state
  await runLab(2);

  console.log('cleanup');
  dex('openstack server delete phoenix');
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

    // Session teardown on the FAILING path too. The QC account stays -- see the note below.
    await fetch(`${BASE}/destroy/${sid}`, { method: 'DELETE', headers: auth }).catch(() => {});
  }
  // The QC account is deliberately NOT deleted, and the old `OPERATOR: null hexworth_uid`
  // instruction is gone. See adversarial-wall.js for the full reasoning: deleting a fixed
  // identity frees the email so the next run mints a new uid and binds another slot, and the
  // manual release step that line asked for was never actually performed.
  console.log('WALKTHROUGH PASS 3/3 on BOTH runs (fresh project AND returning student)');
})().catch((e) => {
  // Runs AFTER the finally. Sentinel filtered so qc-lab.sh stage 3 does not parse it.
  if (!e || e.message !== '__harness_fail__') console.error('WALKTHROUGH FAIL (throw):', (e && e.message || '').slice(0, 300));
  process.exit(1);
});
