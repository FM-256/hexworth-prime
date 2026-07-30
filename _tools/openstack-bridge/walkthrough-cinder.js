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
const sh = (c) => execSync(c, { encoding: 'utf8', timeout: 300000 });

async function post(url, body, headers) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  return { status: r.status, data: await r.json().catch(() => null) };
}

(async () => {
  const fail = (m) => { console.error('WALKTHROUGH FAIL:', m); process.exit(1); };
  const email = `cinder-qc-${Math.random().toString(36).slice(2, 8)}@hexworth-smoke.local`;
  const su = await post(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    { email, password: 'Cq' + Math.random().toString(36).slice(2, 6) + '9X', returnSecureToken: true },
    { Referer: 'https://hexworth-prime.web.app/' });
  if (su.status !== 200) fail(`signUp ${su.status}`);
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
    const cinder = (gr.results || []).filter((r) => r.id >= 3);
    cinder.forEach((r) => console.log(`  run${pass} check ${r.id}: ${r.pass ? 'PASS' : 'FAIL'} -- ${r.desc}`));
    if (cinder.length !== 4 || !cinder.every((r) => r.pass)) fail(`run ${pass}: grader did not pass 4/4`);
    console.log(`  RUN ${pass} PASS 4/4`);
  }

  await runLab(1);
  // deliberately NO cleanup here -- this is the point
  await runLab(2);

  // cleanup: volume + server + session + user (slot mapping cleared by operator pass)
  console.log('cleanup');
  // Detach is ASYNCHRONOUS: the first cleanup deleted straight after remove-volume and hit
  // "Volume status must be available" (HTTP 400). Poll, exactly like the lab's own steps do.
  dex('openstack server remove volume server-b lab-vol');
  for (let i = 0; i < 12; i++) { if (dex('openstack volume show lab-vol -f value -c status').trim() === 'available') break; sh('sleep 5'); }
  dex('openstack volume delete lab-vol');
  dex('openstack server delete server-b');
  await fetch(`${BASE}/destroy/${sid}`, { method: 'DELETE', headers: auth });
  await post(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${API_KEY}`, { idToken }, { Referer: 'https://hexworth-prime.web.app/' });
  console.log(`OPERATOR: null hexworth_uid on ${slot}`);
  console.log('WALKTHROUGH PASS 4/4 on BOTH runs (fresh project AND returning student)');
})().catch((e) => { console.error('WALKTHROUGH FAIL (throw):', e.message.slice(0, 300)); process.exit(1); });
