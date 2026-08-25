#!/usr/bin/env node
/*
 * ADVERSARIAL QC for the Cinder lab (Nancy BLOCK 2026-07-30). Runs ON bc1.
 *
 * The walkthrough proves the honest path PASSES. That is only half a grade check: it
 * says nothing about whether a shortcut also passes. This runs the two cheats a real
 * student would actually find and REQUIRES them to fail:
 *
 *   A. The five-command shortcut: create volume, create ONE server, attach, and fake the
 *      two evidence files with echo. Never deletes anything. (Beat check 6 v2.)
 *   B. Fabricated evidence with the real volume id present but no real lifecycle:
 *      capture genuine json ONCE while attached and reuse it for both proofs.
 *
 * Exit 0 only if BOTH cheats are rejected by the real grader.
 */
const { execSync } = require('child_process');
// Shared dirty-tenant preflight. Same directory; both files are deployed to ~/hexworth-sandbox
// on bc1 together, so the relative require resolves there as well as in the repo.
const preflight = require('./preflight.js');
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
  // THROWS, never process.exit. process.exit does not unwind, so it skipped the finally at the
  // bottom and every FAILING run leaked its session -- and for an ADVERSARIAL harness, failing
  // is a normal outcome. Pattern proven on walkthrough-project.js:188-198.
  const fail = (m) => { console.error('ADVERSARIAL FAIL:', m); throw new Error('__harness_fail__'); };
  // FIXED QC identity. This USED TO BE a random address per run, which created a brand new
  // Firebase user every time -- and the bridge binds a pool slot to a uid PERMANENTLY for
  // sticky mapping, so every gate run consumed one of the 30 slots and never gave it back.
  // Repeated runs walked the pool to exhaustion and launches began returning 503, which is
  // exactly what a real student would have hit. A fixed identity binds ONE slot and every
  // later run reuses it, so QC costs a constant number of slots instead of growing forever.
  const email = 'cinder-adv-qc@hexworth-smoke.local';
  // Firebase policy on this project caps passwords at 10 characters -- a longer one
  // fails signUp with PASSWORD_DOES_NOT_MEET_REQUIREMENTS and then signIn cannot work
  // either, because the account was never created.
  const password = 'QcCiA9x';
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

  const l = await post(`${BASE}/launch`, { labId: 'openstack-cli' }, auth);
  if (l.status !== 200 || l.data.cloudMode !== 'personal') fail(`launch ${l.status} ${l.data && l.data.cloudMode}`);
  const sid = l.data.sessionId, slot = l.data.cloudSlot;
  const dex = (cmd) => sh(`docker exec sandbox-${sid} sh -lc ${JSON.stringify(cmd)}`);
  console.log(`launched ${slot} (${sid})`);

  // try/finally so the SESSION is torn down even when this harness fails -- and an adversarial
  // harness failing is a normal outcome, not an edge case. See the finally at the bottom.
  try {
  // ── PREFLIGHT: refuse to start on a dirty tenant, and say exactly what is in the way ──
  //
  // This harness resolves resources BY NAME, and OpenStack permits duplicate names. Once a
  // previous run leaves a `lab-vol` behind, every later `volume show lab-vol` is AMBIGUOUS and
  // the run dies with "More than one volume exists with the name 'lab-vol'" -- at the first
  // volume step, BEFORE reaching any cleanup, so the debris blocks the very code that would
  // clear it. Measured on 2026-08-02: slot student-25 held two `lab-vol` volumes and a stranded
  // `cheat-srv` from a Jul 31 run, and the gate had been unrunnable since (BUG-091).
  //
  // It also cannot create its server regardless: the pool caps --instances 1
  // (provision-pool.sh:52), confirmed live as maxTotalInstances=1/used=1, so one leftover
  // server exhausts the quota outright.
  //
  // Failing here with the IDs is strictly better than failing later with an ambiguous lookup:
  // the operator gets an actionable list instead of a cryptic OpenStack error.
  // Shared with every other harness (preflight.js) rather than copied per file: the QUOTA half
  // is identical everywhere, and a check duplicated 15 times is a check written in the wrong
  // place. Only the resource NAMES differ, so they are passed in.
  const stale = preflight.findBlockers(dex, slot, ['lab-vol', 'cheat-srv']);
  if (stale.length) {
    preflight.report(slot, stale);
    fail(`tenant not clean: ${stale.length} blocker(s)`);
  }

  let img = '';
  for (let i = 0; i < 6 && !img; i++) { img = dex('openstack image list -f value -c Name | head -1').trim(); if (!img) sh('sleep 10'); }
  if (!img) fail('image list empty');

  const grade = async () => {
    const g = await fetch(`${BASE}/check/${sid}?mission=`, { headers: auth });
    const gr = await g.json();
    emitCoverage(gr.results || []);
    // Scoped to THIS lab's ids explicitly. It used to be `r.id >= 3`, an open-ended
    // range -- but every OpenStack lab shares the single labId 'openstack-cli', so as
    // later labs added checks the range quietly swept them in and the pass count could
    // never be reached. Latent since the first lab was added; it only became visible when
    // the capstone's 25-28 pushed the total high enough to notice.
    return (gr.results || []).filter((r) => [3, 4, 5, 6].includes(Number(r.id)));
  };

  // ── CHEAT 0: grade the UNTOUCHED tenant. Nothing done, so nothing may pass. ──
  // Added 2026-08-25 alongside the BUG-058 fix. Until then this gate aborted at cheat A, so
  // stage 3 never ran and nobody had ever observed check 3 FAIL -- it was reported as
  // "may accept EVERYTHING" the moment the gate could reach that far. Preflight has just
  // proven the tenant is clean, so this costs one grade call and hands every check in the
  // lab its negative observation.
  console.log('cheat 0: grade a clean tenant -- nothing done, nothing may pass');
  const r0 = await grade();
  r0.forEach((c) => console.log(`  check ${c.id}: ${c.pass ? 'PASS' : 'fail'}`));
  const zeroPass = r0.filter((c) => c.pass);
  if (zeroPass.length) fail(`CLEAN TENANT SCORED ${zeroPass.length} check(s): ${zeroPass.map((c) => c.id).join(',')}`);
  console.log('  clean tenant rejected by all four checks');

  // ── CHEAT A: five-command shortcut with echoed evidence ──
  console.log('cheat A: create volume, ONE server, attach, echo both proofs (no delete cycle)');
  dex('openstack volume create --size 1 lab-vol');
  for (let i = 0; i < 12; i++) { if (dex('openstack volume show lab-vol -f value -c status').trim() === 'available') break; sh('sleep 5'); }
  dex(`openstack server create --flavor m1.nano --image "${img}" --network shared cheat-srv`);
  let st = '';
  for (let i = 0; i < 30; i++) { st = dex('openstack server show cheat-srv -f value -c status').trim(); if (st === 'ACTIVE' || st === 'ERROR') break; sh('sleep 10'); }
  if (st !== 'ACTIVE') fail(`cheat-srv ${st}`);
  dex('openstack server add volume cheat-srv lab-vol');
  for (let i = 0; i < 12; i++) { if (dex('openstack volume show lab-vol -f value -c status').trim() === 'in-use') break; sh('sleep 5'); }
  dex('mkdir -p ~/notes && echo in-use > ~/notes/attach-proof.txt && echo available > ~/notes/detach-proof.txt');
  let r = await grade();
  r.forEach((c) => console.log(`  check ${c.id}: ${c.pass ? 'PASS' : 'fail'}`));
  const aPass = r.filter((c) => c.pass).length;
  if (r.find((c) => c.id === 6 && c.pass)) fail('CHEAT A BEAT CHECK 6 -- the shortcut still passes');
  if (r.find((c) => c.id === 4 && c.pass) || r.find((c) => c.id === 5 && c.pass)) fail('CHEAT A: echoed evidence accepted');
  console.log(`  cheat A rejected (scored ${aPass}/4, checks 4/5/6 all refused)`);
  // ── CHEAT C: the throwaway-volume swap, which beat the PREVIOUS witness ──
  // Nancy, 2026-08-25: Nova's action log records THAT a server attached a volume, never WHICH.
  // So a student could attach a junk volume to the server they delete, attach lab-vol somewhere
  // else, and score a check that claims lab-vol outlived a server. The suite had never generated
  // this input, which is why it survived a dedicated review. It runs here now.
  console.log('cheat C: witness a JUNK volume, then attach lab-vol elsewhere (the identity swap)');
  dex('openstack volume create --size 1 junk-vol');
  for (let i = 0; i < 12; i++) { if (dex('openstack volume show junk-vol -f value -c status').trim() === 'available') break; sh('sleep 5'); }
  dex('openstack server add volume cheat-srv junk-vol');
  for (let i = 0; i < 12; i++) { if (dex('openstack volume show junk-vol -f value -c status').trim() === 'in-use') break; sh('sleep 5'); }
  // Record while the JUNK volume is the one attached -- the swap the old witness could not see.
  const cRec = await (await fetch(`${BASE}/baseline/${sid}`, {
  method: 'POST',
  headers: { ...auth, 'Content-Type': 'application/json' },
  body: JSON.stringify({ kind: 'attach' }),
  })).json();
  // The witness names lab-vol specifically, so with lab-vol NOT attached it must refuse outright.
  if (cRec && cRec.ok) {
  console.log(`  (witness accepted while junk-vol held the server: recorded ${cRec.recorded && cRec.recorded.volume})`);
  } else {
  console.log(`  witness refused, as it should: ${cRec && cRec.error}`);
  }
  r = await grade();
  r.forEach((c) => console.log(`  check ${c.id}: ${c.pass ? 'PASS' : 'fail'}`));
  if (r.find((c) => c.id === 6 && c.pass)) fail('CHEAT C BEAT CHECK 6 -- the throwaway-volume swap still passes');
  console.log('  cheat C rejected (check 6 is bound to the volume ID that was recorded)');
  dex('openstack server remove volume cheat-srv junk-vol');
  for (let i = 0; i < 12; i++) { if (dex('openstack volume show junk-vol -f value -c status').trim() === 'available') break; sh('sleep 5'); }
  dex('openstack volume delete junk-vol');


  // ── CHEAT B: real json, but captured once and reused; still no delete cycle ──
  console.log('cheat B: genuine volume json (real uuid) reused for both proofs, still one server');
  dex('openstack volume show lab-vol -f json > ~/notes/attach-proof.txt && cp ~/notes/attach-proof.txt ~/notes/detach-proof.txt');
  r = await grade();
  r.forEach((c) => console.log(`  check ${c.id}: ${c.pass ? 'PASS' : 'fail'}`));
  if (r.find((c) => c.id === 6 && c.pass)) fail('CHEAT B BEAT CHECK 6 -- reused evidence + single server passes');
  if (r.find((c) => c.id === 5 && c.pass)) fail('CHEAT B: in-use json accepted as detach proof');
  console.log('  cheat B rejected (check 6 refuses: attached server IS the one in attach-proof)');

  // cleanup
  dex('openstack server remove volume cheat-srv lab-vol');
  for (let i = 0; i < 12; i++) { if (dex('openstack volume show lab-vol -f value -c status').trim() === 'available') break; sh('sleep 5'); }
  dex('openstack volume delete lab-vol');
  dex('openstack server delete cheat-srv');
  console.log(`OPERATOR: null hexworth_uid on ${slot}`);
  console.log('ADVERSARIAL PASS: both cheats rejected');
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
    // Only the SESSION is torn down, and it happens on the failing path too.
    await fetch(`${BASE}/destroy/${sid}`, { method: 'DELETE', headers: auth }).catch(() => {});
  }
})().catch((e) => {
  // Runs AFTER the finally. Sentinel filtered so a normal failure does not print
  // "__harness_fail__" into stdout, which qc-lab.sh stage 3 parses.
  if (!e || e.message !== '__harness_fail__') console.error('ADVERSARIAL FAIL (throw):', (e && e.message || '').slice(0, 300));
  process.exit(1);
});
