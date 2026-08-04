/**
 * test-licensing.js — unit tests for isCourseLicensed().
 *
 * The two properties that matter most are asserted in BOTH directions, because asserting
 * only the half you are building is how the 2026-08-04 outage shipped green:
 *   1. OPT-IN — a tenant without licensing.enforce is completely unaffected, even when its
 *      course list would otherwise deny. This is what makes the deploy safe for the five
 *      tenants we are not touching.
 *   2. DENIAL — an opted-in tenant genuinely refuses an unlicensed course. Without this the
 *      feature is decorative.
 *
 * Run: node functions/test-licensing.js
 */
const { isCourseLicensed } = require('./licensing');

let fail = 0;
function ok(cond, msg) {
    console.log((cond ? '  PASS  ' : '  FAIL  ') + msg);
    if (!cond) fail++;
}

// ── opt-in: nothing happens without the flag ──────────────────────────────────
ok(isCourseLicensed({}, 'anything').allowed === true,
   'no licensing block at all -> allowed');
ok(isCourseLicensed(null, 'anything').allowed === true,
   'null tenant data -> allowed (never throws)');
ok(isCourseLicensed(undefined, undefined).allowed === true,
   'undefined everything -> allowed (never throws)');

// The decisive opt-in case: a course list that WOULD deny, but no enforce flag.
// This is the exact shape of the five tenants we are not opting in.
const notOptedIn = { licensing: { contentAccess: { courses: ['aplus-core2'] } } };
ok(isCourseLicensed(notOptedIn, 'network-plus').allowed === true,
   'courses listed but enforce absent -> ALLOWED (opt-in holds)');
ok(isCourseLicensed(notOptedIn, 'network-plus').enforced === false,
   'and it reports enforced=false');

// Truthy-but-not-true must not enable enforcement — a string "true" from a hand-edited
// console is the realistic way this gets set wrong.
const stringy = { licensing: { enforce: 'true', contentAccess: { courses: ['aplus-core2'] } } };
ok(isCourseLicensed(stringy, 'network-plus').allowed === true,
   'enforce:"true" (string) does NOT enable enforcement — strict === true');

// ── enforcement: the flag actually denies ─────────────────────────────────────
const enforced = { licensing: { enforce: true, contentAccess: { courses: ['aplus-core2', 'md-100'] } } };
ok(isCourseLicensed(enforced, 'aplus-core2').allowed === true,
   'enforce on, course licensed -> allowed');
ok(isCourseLicensed(enforced, 'md-100').allowed === true,
   'enforce on, second licensed course -> allowed');
ok(isCourseLicensed(enforced, 'network-plus').allowed === false,
   'enforce on, course NOT licensed -> DENIED');
ok(isCourseLicensed(enforced, 'network-plus').licensed.join(',') === 'aplus-core2,md-100',
   'denial reports the licensed set (so the error message can name the fix)');
ok(isCourseLicensed(enforced, undefined).allowed === false,
   'enforce on, missing courseId -> DENIED (cannot prove it is licensed)');

// Case sensitivity is real: courseIds are document values, not user input.
ok(isCourseLicensed(enforced, 'APLUS-CORE2').allowed === false,
   'course matching is case-sensitive (APLUS-CORE2 !== aplus-core2)');

// ── the deliberate fail-open ──────────────────────────────────────────────────
const emptyList = { licensing: { enforce: true, contentAccess: { courses: [] } } };
ok(isCourseLicensed(emptyList, 'anything').allowed === true,
   'enforce on, EMPTY course list -> allowed (fails open by design)');
ok(isCourseLicensed(emptyList, 'anything').enforced === true,
   'and still reports enforced=true, so preflight can flag the misconfiguration');

const noContentAccess = { licensing: { enforce: true } };
ok(isCourseLicensed(noContentAccess, 'anything').allowed === true,
   'enforce on, contentAccess missing entirely -> allowed (fails open)');

const notAnArray = { licensing: { enforce: true, contentAccess: { courses: 'aplus-core2' } } };
ok(isCourseLicensed(notAnArray, 'aplus-core2').allowed === true,
   'courses as a STRING is treated as unset, not iterated -> fails open');

// ── real production shapes ────────────────────────────────────────────────────
// faculty-testing-primus as it exists today, plus the flag we intend to set.
const primus = { licensing: { enforce: true, tier: 'team', maxSeats: 25,
    contentAccess: { series: ['a'], houses: [], hubs: ['wireshark'],
                     courses: ['aplus-core2', 'md-100'] } } };
ok(isCourseLicensed(primus, 'aplus-core2').allowed === true,
   'REAL primus shape: its own A+ Core 2 class is allowed');
ok(isCourseLicensed(primus, 'md-100').allowed === true,
   'REAL primus shape: its own MD-100 class is allowed');
ok(isCourseLicensed(primus, 'network-plus').allowed === false,
   'REAL primus shape: an unlicensed course is denied');

// test-x as it exists today (NOT opted in) — proves Dr. Wallace is untouched by this deploy,
// including the stale NET TEST class that preflight flags.
const testx = { licensing: { tier: 'team', contentAccess: { courses: ['aplus-core2'] } } };
ok(isCourseLicensed(testx, 'network-plus').allowed === true,
   'REAL test-x shape (no enforce): stale network-plus class still allowed — unaffected');

console.log(fail ? `\n${fail} FAILED` : '\nALL PASSED');
process.exit(fail ? 1 : 0);
