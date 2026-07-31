#!/usr/bin/env node
/*
 * "Rescue the Data" ADVERSARIAL QC. Runs ON bc1. Written WITH the walkthrough, not after.
 *
 * This is the lab that exists BECAUSE error-reading could not be graded. So the whole
 * design rests on one claim: a student cannot fake having saved the seeded volume. These
 * are the cheats that would break that claim if the design were weak:
 *
 *   A. THE HEADLINE CHEAT -- delete the seeded volume, create a new one with the SAME NAME,
 *      attach it to a new server. Every name-based check would pass. Check 12 compares the
 *      seeded ID from the container env, so it must FAIL.
 *   B. Delete ghost-srv WITHOUT detaching (data loss), then build a same-named replacement.
 *      Check 10 must FAIL: the seeded volume no longer exists.
 *   C. Leave ghost-srv running and just attach nothing: check 11 must FAIL.
 *
 * Exit 0 only if every cheat is refused.
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
  const fail = (m) => { console.error('ADVERSARIAL FAIL:', m); process.exit(1); };
  // FIXED QC identity. This USED TO BE a random address per run, which created a brand new
  // Firebase user every time -- and the bridge binds a pool slot to a uid PERMANENTLY for
  // sticky mapping, so every gate run consumed one of the 30 slots and never gave it back.
  // Repeated runs walked the pool to exhaustion and launches began returning 503, which is
  // exactly what a real student would have hit. A fixed identity binds ONE slot and every
  // later run reuses it, so QC costs a constant number of slots instead of growing forever.
  const email = 'rescue-adv-qc@hexworth-smoke.local';
  // Firebase policy on this project caps passwords at 10 characters -- a longer one
  // fails signUp with PASSWORD_DOES_NOT_MEET_REQUIREMENTS and then signIn cannot work
  // either, because the account was never created.
  const password = 'QcReA9x';
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

  const l = await post(`${BASE}/launch`, { labId: 'openstack-cli', scenario: 'orphaned-volume' }, auth);
  if (l.status !== 200 || l.data.cloudMode !== 'personal') fail(`launch ${l.status}`);
  const sid = l.data.sessionId, slot = l.data.cloudSlot;
  const dex = (cmd) => sh(`docker exec sandbox-${sid} sh -lc ${JSON.stringify(cmd)}`);
  const seedVol = dex('printenv SEED_VOL_ID').trim();
  if (!seedVol) fail('no SEED_VOL_ID in env -- the checks would be inert');
  console.log(`launched ${slot} (${sid}), seeded vol ${seedVol.slice(0, 8)}...`);

  const grade = async () => {
    const g = await fetch(`${BASE}/check/${sid}?mission=`, { headers: auth });
    const gr = await g.json();
    emitCoverage(gr.results || []);
    // Scoped to THIS lab's ids explicitly. It used to be `r.id >= 10`, an open-ended
    // range -- but every OpenStack lab shares the single labId 'openstack-cli', so as
    // later labs added checks the range quietly swept them in and the pass count could
    // never be reached. Latent since the first lab was added; it only became visible when
    // the capstone's 25-28 pushed the total high enough to notice.
    return (gr.results || []).filter((r) => [10, 11, 12].includes(Number(r.id)));
  };

  let img = '';
  for (let i = 0; i < 6 && !img; i++) { img = dex('openstack image list -f value -c Name | head -1').trim(); if (!img) sh('sleep 10'); }

  // ── CHEAT D: POISON THE SHELL (found 2026-07-30; the design's real weak point) ──
  // execCheck runs `bash -lc`, a LOGIN shell, which sources student-writable ~/.bashrc and
  // ~/.profile. If a check reads $SEED_VOL_ID from the container env, the student simply
  // exports their own value and forges everything. This cheat MUST fail; if it ever passes,
  // seeded labs are worthless. (The fix was to stop reading the env at all: the server now
  // substitutes the id into the command from the session record.)
  console.log('cheat D: poison ~/.bashrc and ~/.profile with a forged SEED_VOL_ID');
  dex('echo "export SEED_VOL_ID=00000000-0000-0000-0000-000000000000" >> ~/.bashrc');
  dex('echo "export SEED_SRV_ID=00000000-0000-0000-0000-000000000000" >> ~/.bashrc');
  dex('echo "export SEED_VOL_ID=00000000-0000-0000-0000-000000000000" >> ~/.profile');
  const poisoned = dex('bash -lc "echo $SEED_VOL_ID"').trim();
  console.log(`  shell now reports SEED_VOL_ID=${poisoned} (poisoning itself succeeded, as expected)`);
  let rd = await grade();
  rd.forEach((c) => console.log(`  check ${c.id}: ${c.pass ? 'PASS' : 'fail'}`));
  // check 10 SHOULD still pass: the real seeded volume genuinely still exists, and the
  // server-substituted id is immune to the poisoning. 11/12 should still fail (nothing done).
  if (!rd.find((c) => c.id === 10 && c.pass)) {
    fail('CHEAT D: check 10 broke under shell poisoning -- substitution is not working');
  }
  if (rd.find((c) => c.id === 12 && c.pass)) {
    fail('CHEAT D BEAT CHECK 12 -- shell poisoning forged a pass; seeded labs are unsafe');
  }
  console.log('  cheat D rejected: checks read the SERVER-held id, not the shell');
  dex('sed -i "/SEED_VOL_ID/d;/SEED_SRV_ID/d" ~/.bashrc ~/.profile');

  // ── CHEAT E: TRY TO SHIM THE CLI AS ROOT ──
  // CORRECTED 2026-07-30: this attack does NOT work in the deployed container. Launched
  // sandboxes set no-new-privileges:true + CapDrop ALL, so sudo is refused even though the
  // image carries NOPASSWD sudo. (I originally "verified" the shim with a bare docker run
  // against the IMAGE, without production security options -- the proxy-not-the-claim error.)
  //
  // So this case now asserts TWO things:
  //   1. the hardening still holds -- if sudo ever succeeds here, a config regression has
  //      re-opened a real attack path and we want to know immediately;
  //   2. grading is unaffected either way, because cloud checks read bc2, not the container.
  console.log('cheat E: attempt a root CLI shim (expect: refused by no-new-privileges)');
  let sudoWorked = true;
  try {
    dex('sudo -n cp /usr/bin/openstack /usr/bin/openstack.real');
  } catch (e) {
    sudoWorked = false;
  }
  if (sudoWorked) {
    fail('CHEAT E: sudo SUCCEEDED in a launched container -- no-new-privileges has regressed; '
       + 'the image grants NOPASSWD sudo and a student can now shim the CLI');
  }
  console.log('  sudo refused (no-new-privileges holds) -- container hardening intact');
  // Belt and braces: prove grading ignores the student's PATH even without sudo, which is
  // the sudo-free version of the same attack and DOES work at the shell level.
  dex('mkdir -p ~/bin && printf "#!/bin/sh\necho in-use\n" > ~/bin/openstack && chmod +x ~/bin/openstack');
  dex('echo "export PATH=$HOME/bin:$PATH" >> ~/.bashrc');
  const pathLie = dex('bash -lc "openstack volume show anything -f value -c status"').trim();
  console.log(`  student's PATH shim active: their CLI says "${pathLie}"`);
  let rp = await grade();
  rp.forEach((c) => console.log(`  check ${c.id}: ${c.pass ? 'PASS' : 'fail'}`));
  if (rp.find((c) => c.id === 12 && c.pass)) {
    fail('CHEAT E/PATH BEAT CHECK 12 -- a lying CLI on PATH forged a pass; grading is still container-side');
  }
  if (!rp.find((c) => c.id === 10 && c.pass)) {
    fail('CHEAT E/PATH: check 10 broke under a PATH shim -- grading still depends on the container');
  }
  console.log('  PATH shim rejected: grading reads the CLOUD from the server, not the student CLI');
  dex('sed -i "/HOME\/bin/d" ~/.bashrc; rm -rf ~/bin');

  // ── CHEAT C (cheapest): leave everything, change nothing ──
  console.log('cheat C: do nothing at all');
  let r = await grade();
  r.forEach((c) => console.log(`  check ${c.id}: ${c.pass ? 'PASS' : 'fail'}`));
  if (r.find((c) => c.id === 11 && c.pass)) fail('CHEAT C: ghost-srv still running but check 11 passed');
  if (r.find((c) => c.id === 12 && c.pass)) fail('CHEAT C: nothing rebuilt but check 12 passed');
  console.log('  cheat C rejected');

  // ── CHEAT A: the headline -- destroy the data, fake it with a same-named volume ──
  console.log('cheat A: delete the seeded volume, recreate SAME NAME, attach to a new server');
  dex('openstack server remove volume ghost-srv orphan-vol');
  for (let i = 0; i < 12; i++) { if (dex(`openstack volume show ${seedVol} -f value -c status`).trim() === 'available') break; sh('sleep 5'); }
  dex(`openstack volume delete ${seedVol}`);
  sh('sleep 6');
  dex('openstack volume create --size 1 orphan-vol');            // same NAME, new identity
  for (let i = 0; i < 12; i++) { if (dex('openstack volume show orphan-vol -f value -c status').trim() === 'available') break; sh('sleep 5'); }
  dex('openstack server delete ghost-srv');
  for (let i = 0; i < 12; i++) { if (!dex('openstack server list -f value -c ID').trim()) break; sh('sleep 5'); }
  dex(`openstack server create --flavor m1.nano --image "${img}" --network shared rescue-srv`);
  let st = '';
  for (let i = 0; i < 30; i++) { st = dex('openstack server show rescue-srv -f value -c status').trim(); if (st === 'ACTIVE' || st === 'ERROR') break; sh('sleep 10'); }
  if (st !== 'ACTIVE') fail(`cheat rescue-srv ${st}`);
  dex('openstack server add volume rescue-srv orphan-vol');
  for (let i = 0; i < 12; i++) { if (dex('openstack volume show orphan-vol -f value -c status').trim() === 'in-use') break; sh('sleep 5'); }

  r = await grade();
  r.forEach((c) => console.log(`  check ${c.id}: ${c.pass ? 'PASS' : 'fail'}`));
  // This is the whole design on trial: name looks perfect, identity does not match.
  if (r.find((c) => c.id === 10 && c.pass)) fail('CHEAT A BEAT CHECK 10 -- destroyed volume still counted as existing');
  if (r.find((c) => c.id === 12 && c.pass)) fail('CHEAT A BEAT CHECK 12 -- a same-named replacement passed as the rescued volume');
  const aScore = r.filter((c) => c.pass).length;
  console.log(`  cheat A rejected (scored ${aScore}/3; check 11 legitimately passes -- ghost-srv really is gone)`);

  // cleanup
  const cur = dex('openstack server list -f value -c ID').trim().split('\n').filter(Boolean)[0];
  if (cur) {
    try { dex(`openstack server remove volume ${cur} orphan-vol`); } catch (e) { /* ok */ }
    for (let i = 0; i < 12; i++) { if (dex('openstack volume show orphan-vol -f value -c status').trim() === 'available') break; sh('sleep 5'); }
    try { dex('openstack volume delete orphan-vol'); } catch (e) { /* ok */ }
    dex(`openstack server delete ${cur}`);
  }
  await fetch(`${BASE}/destroy/${sid}`, { method: 'DELETE', headers: auth });
  await post(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${API_KEY}`, { idToken }, { Referer: 'https://hexworth-prime.web.app/' });
  console.log(`OPERATOR: null hexworth_uid on ${slot}`);
  // Keep this line honest about what actually ran: it described 3 cheats after the suite
  // had grown to 5, and an under-selling summary is exactly what gets quoted later as the
  // full scope of the testing.
  console.log('ADVERSARIAL PASS: 5/5 rejected -- same-name forgery, do-nothing, .bashrc env '
    + 'poisoning, root CLI shim (refused by no-new-privileges), and PATH shim');
})().catch((e) => { console.error('ADVERSARIAL FAIL (throw):', e.message.slice(0, 300)); process.exit(1); });
