#!/usr/bin/env node
/*
 * Lab 2 "Read the Wall" ADVERSARIAL QC. Runs ON bc1. Written alongside the walkthrough,
 * not after a reviewer demands it (Lab 1 lesson).
 *
 * Cheats a real student would actually find:
 *   A. Fabricate both evidence files with echo, and never build anything. Should fail 7, 8
 *      (no request id) and 9 (no phoenix).
 *   B. Fabricate the evidence WITH plausible request ids, and boot phoenix directly without
 *      ever hitting either wall. This is the dangerous one: it satisfies the real-state check
 *      by shape. It SHOULD still fail 7/8 because invented req- ids... will actually PASS the
 *      grep. Recording that honestly: checks 7/8 are anti-typo, not anti-forgery. The bar this
 *      lab claims on the page must therefore be exactly "9 is real state; 7/8 are your captured
 *      output" -- and this harness asserts the page says so, so the claim can never drift
 *      above the enforcement.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const API_KEY = 'AIzaSyC3tWNETi36DA8Q1I60n7t09YfU9HapA4M';
const BASE = 'http://localhost/api/sandbox';
const PAGE = '/home/eq1/hexworth-sandbox/lab2-page-copy.txt';   // copied in by the runner
const sh = (c) => execSync(c, { encoding: 'utf8', timeout: 300000 });

async function post(url, body, headers) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  return { status: r.status, data: await r.json().catch(() => null) };
}

(async () => {
  const fail = (m) => { console.error('ADVERSARIAL FAIL:', m); process.exit(1); };

  // Claim-vs-enforcement guard: the page must NOT claim the evidence files are unforgeable.
  if (fs.existsSync(PAGE)) {
    const copy = fs.readFileSync(PAGE, 'utf8');
    if (/nothing is self-reported|cannot be faked|unforgeable/i.test(copy)) {
      fail('page claims the evidence files cannot be faked, but checks 7/8 are grep-based -- claim exceeds enforcement');
    }
    console.log('page-claim guard: page does not overclaim evidence integrity');
  }

  // FIXED QC identity. This used to mint a random address on EVERY run. The bridge binds a pool
  // slot to a uid PERMANENTLY (sticky mapping), and nothing releases it -- reclaim-idle-slots.py
  // cannot even run (taskboard #275, it imports a path that only exists on bc2). So every run
  // consumed one of the 30 slots forever. The pool was measured at 29 bound / 1 free on
  // 2026-08-01, and of the 29, every uid that still resolves in Firebase Auth is a QC account.
  // Every other harness was moved to a fixed identity for exactly this reason; wall was missed.
  const email = 'wall-adv-qc@hexworth-smoke.local';
  // Firebase policy on this project caps passwords at 10 characters.
  const password = 'QcWaA9x';
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
  if (l.status !== 200 || l.data.cloudMode !== 'personal') fail(`launch ${l.status}`);
  const sid = l.data.sessionId, slot = l.data.cloudSlot;
  const dex = (cmd) => sh(`docker exec sandbox-${sid} sh -lc ${JSON.stringify(cmd)}`);
  console.log(`launched ${slot} (${sid})`);

  const grade = async () => {
    const g = await fetch(`${BASE}/check/${sid}?mission=`, { headers: auth });
    const gr = await g.json();
    return (gr.results || []).filter((r) => r.id >= 7);
  };

  // ── CHEAT A: echo junk, build nothing ──
  console.log('cheat A: echo both evidence files, build nothing');
  dex('mkdir -p ~/notes && echo "quota exceeded" > ~/notes/quota-error.txt && echo "invalid volume" > ~/notes/state-error.txt');
  let r = await grade();
  r.forEach((c) => console.log(`  check ${c.id}: ${c.pass ? 'PASS' : 'fail'}`));
  if (r.find((c) => c.id === 9 && c.pass)) fail('CHEAT A beat check 9 -- real-state check is not real');
  if (r.find((c) => c.id === 7 && c.pass) || r.find((c) => c.id === 8 && c.pass)) fail('CHEAT A: evidence with no request id accepted');
  console.log('  cheat A rejected');

  // ── CHEAT B: skip both walls, boot phoenix directly, forge plausible evidence ──
  console.log('cheat B: forge evidence WITH plausible request ids, boot phoenix without hitting either wall');
  let img = '';
  for (let i = 0; i < 6 && !img; i++) { img = dex('openstack image list -f value -c Name | head -1').trim(); if (!img) sh('sleep 10'); }
  dex(`openstack server create --flavor m1.nano --image "${img}" --network shared phoenix`);
  let st = '';
  for (let i = 0; i < 30; i++) { st = dex('openstack server show phoenix -f value -c status').trim(); if (st === 'ACTIVE' || st === 'ERROR') break; sh('sleep 10'); }
  if (st !== 'ACTIVE') fail(`phoenix ${st}`);
  dex('echo "Quota exceeded for instances (HTTP 403) (Request-ID: req-deadbeef-0000-1111-2222-333344445555)" > ~/notes/quota-error.txt');
  dex('echo "Invalid volume: must be available (HTTP 400) (Request-ID: req-deadbeef-6666-7777-8888-999900001111)" > ~/notes/state-error.txt');
  r = await grade();
  r.forEach((c) => console.log(`  check ${c.id}: ${c.pass ? 'PASS' : 'fail'}`));
  const forged = r.filter((c) => c.pass).length;
  // HONEST RECORD: this is expected to score 3/3. It is the ceiling of a grep-based
  // evidence check, and the page must claim no more than that. The guard above enforces
  // the page's wording; this line makes the ceiling visible in the QC output rather than
  // discovered later by a student.
  console.log(`  cheat B scored ${forged}/3 -- forged evidence + real end state is the KNOWN CEILING of this design (page must not claim otherwise; guard above enforces that)`);

  dex('openstack server delete phoenix');
  await fetch(`${BASE}/destroy/${sid}`, { method: 'DELETE', headers: auth });
  // The QC account is deliberately NOT deleted. With a fixed identity the whole point is that
  // the uid -- and therefore the ONE pool slot bound to it -- survives between runs. Deleting
  // the account frees the email, so the next run's signUp mints a NEW uid and binds ANOTHER
  // slot, which is the leak this change exists to stop. Nor is the old
  // `OPERATOR: null hexworth_uid on <slot>` line printed any more: it asked a human to release
  // the binding by hand after every run, and that step was never performed, which is precisely
  // how the pool reached 29 bound of 30 with only QC identities holding the slots.
  console.log('ADVERSARIAL DONE: cheat A rejected; cheat B ceiling recorded honestly');
})().catch((e) => { console.error('ADVERSARIAL FAIL (throw):', e.message.slice(0, 300)); process.exit(1); });
