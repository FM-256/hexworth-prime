#!/usr/bin/env node
/*
 * Cinder lab walkthrough-verbatim QC (Stage 4 lab 1). Runs ON bc1.
 *
 * VERBATIM means verbatim (Chris block 2026-07-30): v1 of this harness inserted a poll
 * between `server remove volume` and the detach capture that the PAGE never told the
 * student to do. It passed 4/4 while an honest student following the page could capture
 * a mid-`detaching` volume and fail check 5. The harness was proving its own safer
 * sequence, not the lab.
 *
 * Rule now enforced structurally below: every command this harness runs is a line lifted
 * from the page, and every wait it performs corresponds to a "# WAIT for:" comment the
 * page shows. If the page has no wait there, this harness must not add one -- a failure
 * here is the lab's bug to fix, not the harness's to paper over.
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
  // THROWS, never process.exit. process.exit does not unwind, so it skipped the finally block
  // below and every FAILING run leaked its session and QC account -- and adversarial/failure
  // paths are a large fraction of what these harnesses are for. Same fix already applied to the
  // project/chain/neutron/secgroup harnesses; see walkthrough-project.js:188-198.
  const fail = (m) => { console.error('WALKTHROUGH FAIL:', m); throw new Error('__harness_fail__'); };
  // FIXED QC identity. This USED TO BE a random address per run, which created a brand new
  // Firebase user every time -- and the bridge binds a pool slot to a uid PERMANENTLY for
  // sticky mapping, so every gate run consumed one of the 30 slots and never gave it back.
  // Repeated runs walked the pool to exhaustion and launches began returning 503, which is
  // exactly what a real student would have hit. A fixed identity binds ONE slot and every
  // later run reuses it, so QC costs a constant number of slots instead of growing forever.
  const email = 'cinder-walk-qc@hexworth-smoke.local';
  // Firebase policy on this project caps passwords at 10 characters -- a longer one
  // fails signUp with PASSWORD_DOES_NOT_MEET_REQUIREMENTS and then signIn cannot work
  // either, because the account was never created.
  const password = 'QcCiW9x';
  let su = await post(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    { email, password, returnSecureToken: true },
    { Referer: 'https://hexworth-prime.web.app/' });
  if (su.status !== 200) {
    // EMAIL_EXISTS is the NORMAL path after the first ever run -- sign in instead.
    su = await post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      { email, password, returnSecureToken: true },
      { Referer: 'https://hexworth-prime.web.app/' });
  }
  if (su.status !== 200) fail(`signUp/signIn ${su.status}`);
  const { idToken } = su.data;
  const auth = { Authorization: `Bearer ${idToken}` };
  const launch = async () => post(`${BASE}/launch`, { labId: 'openstack-cli' }, auth);

  const l1 = await launch();
  if (l1.status !== 200 || l1.data.cloudMode !== 'personal') fail(`launch: ${l1.status} ${l1.data && l1.data.cloudMode}`);
  let sid = l1.data.sessionId;
  const slot = l1.data.cloudSlot;
  console.log(`launched: ${slot} (${sid})`);
  const dex = (cmd) => sh(`docker exec sandbox-${sid} sh -lc ${JSON.stringify(cmd)}`);
  // cold-start retry (known 384MB first-call race)
  let img = '';
  for (let i = 0; i < 6 && !img; i++) { img = dex('openstack image list -f value -c Name | head -1').trim(); if (!img) sh('sleep 10'); }
  if (!img) fail('image list empty');

  // Run the WHOLE lab twice with NO cleanup between (Chris block 2026-07-30). Run 2 begins
  // from exactly what a real successful student leaves behind: lab-vol in-use, server-b still
  // running, compute quota fully consumed. My earlier "second run" test only ever saw debris
  // from a CRASHED run, because this harness cleans up after itself on success -- so it had
  // never exercised the state the page's own persistence promise actually creates.
  async function runLab(pass) {
    console.log(`===== RUN ${pass} =====`);
    // ── THE LAB, exactly as the page will instruct ──
    console.log('lab step 1: start clean, then create the volume');
    // page line: `openstack volume list` then a conditional `openstack volume delete lab-vol`.
    // A returning student HAS a lab-vol; without this, `volume show lab-vol` becomes ambiguous
    // ("More than one volume exists with the name 'lab-vol'") and every later step breaks.
    // Found by this harness on a re-run, after both reviewers had passed the page.
    // page lines: `openstack server list` / `openstack volume list`, then conditional
    // remove-volume + server delete + volume delete. The SERVER half matters as much as the
    // volume half: quota is 1 instance, so a leftover server blocks Step 2 entirely (Chris).
    const oldSrv = dex('openstack server list -f value -c ID').trim().split('\n').filter(Boolean)[0];
    const hasVol = dex('openstack volume list -f value -c Name').includes('lab-vol');
    if (oldSrv || hasVol) {
      console.log(`  (prior-run state found: server=${oldSrv || 'none'} volume=${hasVol} -- clearing as the page instructs)`);
      if (oldSrv && hasVol) {
        try { dex(`openstack server remove volume ${oldSrv} lab-vol`); } catch (e) { /* not attached */ }
        for (let i = 0; i < 12; i++) { if (dex('openstack volume show lab-vol -f value -c status').trim() === 'available') break; sh('sleep 5'); }
      }
      if (oldSrv) {
        dex(`openstack server delete ${oldSrv}`);
        for (let i = 0; i < 12; i++) { if (!dex('openstack server list -f value -c ID').trim()) break; sh('sleep 5'); }
      }
      if (hasVol) { dex('openstack volume delete lab-vol'); sh('sleep 5'); }
    }
    dex('openstack volume create --size 1 lab-vol -f value -c id');
    for (let i = 0; i < 12; i++) { if (dex('openstack volume show lab-vol -f value -c status').trim() === 'available') break; sh('sleep 5'); }

    console.log('lab step 2: boot server-a and attach');
    dex(`openstack server create --flavor m1.nano --image "${img}" --network shared server-a`);
    let st = '';
    for (let i = 0; i < 30; i++) { st = dex('openstack server show server-a -f value -c status').trim(); if (st === 'ACTIVE' || st === 'ERROR') break; sh('sleep 10'); }
    if (st !== 'ACTIVE') fail(`server-a ${st}`);
    dex('openstack server add volume server-a lab-vol');
    // page line: `openstack volume show lab-vol -f value -c status   # WAIT for: in-use`
    for (let i = 0; i < 12; i++) { if (dex('openstack volume show lab-vol -f value -c status').trim() === 'in-use') break; sh('sleep 5'); }
    dex('mkdir -p ~/notes && openstack volume show lab-vol -f json > ~/notes/attach-proof.txt');
    // page line: "press Record the attachment beside the terminal". The grader reads the live
    // cloud and writes down which volume is on which server; check 6 is judged against it.
    // This is the ONLY moment it can be taken -- after server-a is deleted the cloud cannot be
    // asked -- so a harness that skipped it would report an uncompletable lab as broken code.
    const rec = await (await fetch(`${BASE}/baseline/${sid}`, {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'attach' }),
    })).json();
    if (!rec || !rec.ok) fail(`attach witness NOT recorded: ${(rec && rec.error) || 'no response'}`);
    console.log(`  witness recorded: ${rec.recorded.volume} on ${rec.recorded.server}`);

    console.log('lab step 3: detach, capture, delete server-a');
    dex('openstack server remove volume server-a lab-vol');
    // page line: `openstack volume show lab-vol -f value -c status   # WAIT for: available`
    let dst = '';
    for (let i = 0; i < 12; i++) { dst = dex('openstack volume show lab-vol -f value -c status').trim(); if (dst === 'available') break; sh('sleep 5'); }
    if (dst !== 'available') fail(`detach never reached available (last: ${dst}) -- the page's wait is not sufficient for a real student`);
    dex('openstack volume show lab-vol -f json > ~/notes/detach-proof.txt');
    dex('openstack server delete server-a');
    for (let i = 0; i < 12; i++) { try { dex('openstack server show server-a -f value -c status'); sh('sleep 5'); } catch (e) { break; } }

    console.log('lab step 4: boot server-b (the volume outlives its first server), re-attach');
    dex(`openstack server create --flavor m1.nano --image "${img}" --network shared server-b`);
    st = '';
    for (let i = 0; i < 30; i++) { st = dex('openstack server show server-b -f value -c status').trim(); if (st === 'ACTIVE' || st === 'ERROR') break; sh('sleep 10'); }
    if (st !== 'ACTIVE') fail(`server-b ${st}`);
    dex('openstack server add volume server-b lab-vol');
    for (let i = 0; i < 12; i++) { if (dex('openstack volume show lab-vol -f value -c status').trim() === 'in-use') break; sh('sleep 5'); }

    // ── THE GRADER, via the real endpoint (returns ALL checks; 3-6 must pass) ──
    const g = await fetch(`${BASE}/check/${sid}?mission=`, { headers: auth });
    const gr = await g.json();
    emitCoverage(gr.results || []);
    // Scoped to THIS lab's ids explicitly. It used to be `r.id >= 3`, an open-ended
    // range -- but every OpenStack lab shares the single labId 'openstack-cli', so as
    // later labs added checks the range quietly swept them in and the pass count could
    // never be reached. Latent since the first lab was added; it only became visible when
    // the capstone's 25-28 pushed the total high enough to notice.
    const cinder = (gr.results || []).filter((r) => [3, 4, 5, 6].includes(Number(r.id)));
    cinder.forEach((r) => console.log(`  run${pass} check ${r.id}: ${r.pass ? 'PASS' : 'FAIL'} -- ${r.desc}`));
    if (cinder.length !== 4 || !cinder.every((r) => r.pass)) fail(`run ${pass}: grader did not pass 4/4`);
    console.log(`  RUN ${pass} PASS 4/4`);
  }

  try {
    await runLab(1);
    // deliberately NO cleanup here -- this is the point
    await runLab(2);

    // Lab-resource cleanup stays on the SUCCESS path: these are the walkthrough's own teaching
    // steps, and they are cinder-specific (the poll below exists only here). Only the platform
    // teardown moves into finally, matching walkthrough-project.js:188-191 exactly.
    console.log('cleanup');
    // Detach is ASYNCHRONOUS: the first cleanup deleted straight after remove-volume and hit
    // "Volume status must be available" (HTTP 400). Poll, exactly like the lab's own steps do.
    dex('openstack server remove volume server-b lab-vol');
    for (let i = 0; i < 12; i++) { if (dex('openstack volume show lab-vol -f value -c status').trim() === 'available') break; sh('sleep 5'); }
    dex('openstack volume delete lab-vol');
    dex('openstack server delete server-b');
    console.log(`OPERATOR: null hexworth_uid on ${slot}`);
    console.log('WALKTHROUGH PASS 4/4 on BOTH runs (fresh project AND returning student)');
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

    // Runs on the FAILING path too, which is the entire point: the SESSION used to leak on
    // every failed run because process.exit did not unwind.
    //
    // The QC account is deliberately NOT deleted here -- see adversarial-wall.js:105-111. With a
    // fixed identity the whole point is that the uid, and therefore the ONE pool slot bound to
    // it, SURVIVES between runs. Deleting the account frees the email, so the next run's signUp
    // mints a NEW uid and binds ANOTHER slot. My first version of this fix moved the delete into
    // this finally, which made the leak fire on failing runs too -- strictly worse than the bug
    // it was meant to fix.
    await fetch(`${BASE}/destroy/${sid}`, { method: 'DELETE', headers: auth }).catch(() => {});
  }
})().catch((e) => {
  // Runs AFTER the finally block. The sentinel is filtered so a normal harness failure does not
  // print "__harness_fail__" into stdout, which qc-lab.sh stage 3 parses.
  if (!e || e.message !== '__harness_fail__') console.error('WALKTHROUGH FAIL (throw):', (e && e.message || '').slice(0, 300));
  process.exit(1);
});
