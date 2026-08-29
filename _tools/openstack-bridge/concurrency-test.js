#!/usr/bin/env node
/*
 * How many students can start the lab AT THE SAME TIME? Runs ON bc1.
 *
 * @catalog what    fire N simultaneous launches, prove every one gets its own slot
 * @catalog run     node _tools/openstack-bridge/concurrency-test.js [N]   (on bc1)
 * @catalog status  TOOL
 *
 * WHY THIS EXISTS. On 2026-08-26 this was run inline as a throwaway and reported 6 of 20
 * launches succeeding, 14 POOL_EXHAUSTED -- a class of 20 could not have started. Because it
 * was inline, nothing was left behind to re-run after the fix, which is precisely the habit
 * CATALOG.md exists to stop. It is a file now.
 *
 * IT COSTS A CONSTANT NUMBER OF SLOTS, NOT A GROWING ONE. The bridge binds a pool slot to a
 * uid PERMANENTLY (sticky mapping; released only by explicit operator action, policy
 * 2026-08-11). A harness that invents a random identity per run therefore eats one slot per
 * run forever -- that is how the pool was walked to exhaustion before, and the fix in
 * walkthrough-cinder.js:44-49 was a FIXED identity. Same here: N fixed identities, reused
 * every run, and every slot handed back in `finally`.
 *
 * WHAT IT ACTUALLY PROVES, beyond a success count:
 *   1. capacity  -- N concurrent launches all return 200 with cloudMode 'personal'
 *   2. NO DOUBLE-ASSIGN -- no two distinct uids receive the SAME slot. claim() serialises
 *      assignment under a single lock (claim_service.py:193) and that property had never once
 *      been tested under real concurrency; a count of successes cannot see this bug at all.
 *      Two students sharing a slot would see each other's servers and grade each other's work.
 *
 * FAILURE MODES ARE DISTINCT AND ARE REPORTED SEPARATELY. Collapsing them wasted a class
 * period: POOL_EXHAUSTED means no free slot (a cap on distinct users EVER, only goes down),
 * CLOUD_FULL means no hypervisor RAM (a cap on instances running AT ONCE, recovers). See
 * pool-capacity.sh for both ceilings.
 *
 * THROWS, never process.exit -- process.exit does not unwind, so it would skip the cleanup in
 * `finally` and leak N bound slots on exactly the failing runs this exists to catch
 * (walkthrough-cinder.js:39-42 learned this the hard way).
 */
const { execSync } = require('child_process');
const API_KEY = 'AIzaSyC3tWNETi36DA8Q1I60n7t09YfU9HapA4M';
const BASE = 'http://localhost/api/sandbox';
const N = parseInt(process.argv[2] || '20', 10);
// --freeplay launches the way THE RIG does (freePlay:true), which is what the practice cap
// applies to. Without it, launches look like the course pages: coursework, capped only by
// MAX_TOTAL. Both are worth running and they prove different halves of BUG-233:
//   plain      -> a whole class can start (the cap must NOT throttle coursework)
//   --freeplay -> the cap actually FIRES (it must refuse past FREE_PLAY_CAP)
// Before the fix, --freeplay would have been meaningless for openstack-cli: it sat in the
// server's unconditional FREE_PLAY_LABS, so every launch counted as practice either way.
const FREE_PLAY = process.argv.includes('--freeplay');
// Firebase policy on this project caps passwords at 10 characters; a longer one fails signUp
// with PASSWORD_DOES_NOT_MEET_REQUIREMENTS and then signIn cannot work either, because the
// account was never created (walkthrough-cinder.js:51-53).
const PASSWORD = 'CcQ7x2n';

const sh = (c) => execSync(c, { encoding: 'utf8', timeout: 120000 });

async function req(method, url, body, headers) {
  const opt = { method, headers: { 'Content-Type': 'application/json', ...headers } };
  if (body) opt.body = JSON.stringify(body);
  const r = await fetch(url, opt);
  return { status: r.status, data: await r.json().catch(() => null) };
}
const post = (u, b, h) => req('POST', u, b, h);

(async () => {
  const fail = (m) => { console.error('CONCURRENCY FAIL:', m); throw new Error('__harness_fail__'); };
  const bound = [];   // {uid, sid, token} for everything this run must hand back

  try {
    // ── 1. Authenticate N fixed identities. Sequential ON PURPOSE: auth is not what is under
    //       test, and hammering Firebase would add its own failures to the result.
    console.log(`authenticating ${N} fixed identities...`);
    const ids = [];
    for (let i = 1; i <= N; i++) {
      const email = `concur-${String(i).padStart(2, '0')}@hexworth-smoke.local`;
      let su = await post(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
        { email, password: PASSWORD, returnSecureToken: true }, { Referer: 'https://hexworth-prime.web.app/' });
      if (su.status !== 200) {
        // EMAIL_EXISTS is the NORMAL path after the first ever run -- sign in instead.
        su = await post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
          { email, password: PASSWORD, returnSecureToken: true }, { Referer: 'https://hexworth-prime.web.app/' });
      }
      if (su.status !== 200) fail(`auth ${email}: ${su.status} ${JSON.stringify(su.data)}`);
      // localId IS the Firebase uid, and the uid is what release-slot unbinds.
      ids.push({ email, token: su.data.idToken, uid: su.data.localId });
    }
    console.log(`  ${ids.length} authenticated`);

    // ── 2. THE TEST. All N launches in flight at once -- this is the only part that has to be
    //       simultaneous, and a sequential loop here would silently not test anything.
    console.log(`firing ${N} SIMULTANEOUS launches...`);
    const t0 = Date.now();
    const results = await Promise.all(ids.map(async (id) => {
      try {
        const body = FREE_PLAY ? { labId: 'openstack-cli', freePlay: true } : { labId: 'openstack-cli' };
        const r = await post(`${BASE}/launch`, body, { Authorization: `Bearer ${id.token}` });
        return { id, status: r.status, data: r.data };
      } catch (e) {
        return { id, status: 0, data: { error: String(e && e.message) } };
      }
    }));
    const secs = ((Date.now() - t0) / 1000).toFixed(1);

    // ── 3. Classify. Record every success for cleanup BEFORE any assertion can throw.
    const ok = [], exhausted = [], full = [], capped = [], other = [];
    for (const r of results) {
      const err = r.data && r.data.error;
      // The practice-cap refusal carries its marker in `code`, not `error` -- classify it
      // explicitly or it lands in "other" and a WORKING cap reads as an unexplained failure.
      const code = r.data && r.data.code;
      if (r.status === 200 && r.data && r.data.cloudSlot) {
        ok.push(r);
        bound.push({ uid: r.id.uid, sid: r.data.sessionId, token: r.id.token });
      } else if (code === 'FREE_PLAY_CAPACITY') capped.push(r);
      else if (err === 'POOL_EXHAUSTED') exhausted.push(r);
      else if (err === 'CLOUD_FULL') full.push(r);
      else other.push(r);
    }

    console.log('');
    console.log(`  mode             : ${FREE_PLAY ? 'FREE-PLAY (as The Rig launches)' : 'COURSEWORK (as the course pages launch)'}`);
    console.log(`  launched OK      : ${ok.length}/${N}   (${secs}s wall clock)`);
    console.log(`  FREE_PLAY_CAPACITY: ${capped.length}   (practice cap refused -- the BUG-233 guard)`);
    console.log(`  POOL_EXHAUSTED   : ${exhausted.length}   (no free slot -- extend the pool)`);
    console.log(`  CLOUD_FULL       : ${full.length}   (no hypervisor RAM -- delete instances)`);
    console.log(`  other failures   : ${other.length}`);
    for (const r of other.slice(0, 5)) console.log(`      ${r.status} ${JSON.stringify(r.data).slice(0, 120)}`);

    // ── 4. The assertion a success count cannot make. Two uids on one slot is silent and
    //       catastrophic: each student sees and grades against the other's servers.
    const bySlot = new Map();
    for (const r of ok) {
      const s = r.data.cloudSlot;
      if (!bySlot.has(s)) bySlot.set(s, []);
      bySlot.get(s).push(r.id.email);
    }
    const dupes = [...bySlot.entries()].filter(([, who]) => who.length > 1);
    console.log(`  distinct slots   : ${bySlot.size} across ${ok.length} launches`);
    if (dupes.length) {
      for (const [slot, who] of dupes) console.log(`      DOUBLE-ASSIGNED ${slot} -> ${who.join(', ')}`);
      fail(`${dupes.length} slot(s) handed to more than one student`);
    }
    console.log('  no double-assignment');

    console.log('');
    // The verdict is MODE-DEPENDENT, and conflating the two reports a working cap as a
    // failure. In coursework mode every launch must succeed -- that is a class starting. In
    // free-play mode being refused past the cap is the CORRECT behaviour and the whole point
    // of BUG-233; what must not happen is a refusal of any OTHER kind, or a silent success
    // past the cap.
    if (FREE_PLAY) {
      const accounted = ok.length + capped.length === N;
      if (accounted && capped.length > 0) {
        console.log(`  PASS -- the practice cap fired: ${ok.length} admitted, ${capped.length} refused, none leaked past it.`);
      } else if (accounted) {
        console.log(`  PASS -- all ${ok.length} admitted; the cap was never reached (raise N above FREE_PLAY_CAP to exercise it).`);
      } else {
        console.log(`  FAIL -- ${N - ok.length - capped.length} launch(es) failed for reasons OTHER than the cap.`);
      }
    } else if (ok.length === N) {
      console.log(`  PASS -- a class of ${N} can all start at once.`);
    } else {
      console.log(`  FAIL -- only ${ok.length} of ${N} could start.`);
    }

  } finally {
    // ── Cleanup. Runs on success AND failure. Destroy each session, then hand the slot back,
    //    so an idle pool costs nothing between runs. Never let one failure skip the rest.
    console.log('');
    console.log(`cleanup: ${bound.length} session(s)/slot(s) to return`);
    let key = '';
    try { key = sh('docker exec lab-manager printenv SANDBOX_SERVICE_KEY').trim(); }
    catch (e) { console.error('  CANNOT READ SERVICE KEY -- slots NOT released:', e.message); }

    for (const b of bound) {
      if (b.sid) {
        try {
          await req('DELETE', `${BASE}/destroy/${b.sid}`, null, { Authorization: `Bearer ${b.token}` });
        } catch (e) { console.error(`  destroy ${b.sid} failed: ${e.message}`); }
      }
      if (!key) continue;
      try {
        const r = await post(`${BASE}/release-slot`, { uid: b.uid }, { 'x-service-key': key });
        // released:false with SLOT_NOT_EMPTY is the emptiness guard doing its job, not an
        // error -- but it means a slot stayed bound, so say so rather than print a silent OK.
        if (r.data && r.data.released === false) {
          console.log(`  slot KEPT for ${b.uid.slice(0, 8)}...: ${r.data.reason || 'unknown'}`);
        }
      } catch (e) { console.error(`  release failed: ${e.message}`); }
    }
    console.log('cleanup done');
  }
})().catch((e) => {
  if (e && e.message === '__harness_fail__') process.exitCode = 1;
  else { console.error(e); process.exitCode = 1; }
});
