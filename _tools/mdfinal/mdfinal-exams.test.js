#!/usr/bin/env node
/**
 * mdfinal-exams.test.js — exam identities, release window, pass mark, reset constants (R2, 13.5).
 *
 * @catalog what    Allowlisted exam ids, the server-side release window and arm flag at every
 * @catalog what    boundary, rehearsal gating, durations, catalog ids, pass mark, reset caps.
 * @catalog run     node _tools/mdfinal/mdfinal-exams.test.js
 * @catalog status  TOOL
 */
const kit = require('./mdfinal-test-kit.js');
const X = kit.req('mdfinal-exams.js');
const t = kit.harness('mdfinal-exams');
const REAL = 'md100-final-2026', REH = 'md100-final-rehearsal';
const open = Date.parse('2026-11-19T22:30:00Z'), close = Date.parse('2026-11-19T23:30:00Z');

/* ids */
t.check(X.resolveExamId(undefined) === REAL && X.resolveExamId('') === REAL, 'default id');
t.check(X.resolveExamId(REH) === REH, 'rehearsal id resolves');
for (const bad of ['attempt2', 'md100-final-2026 ', '__proto__', 'constructor', 'net-final-2026']) {
    t.check(X.resolveExamId(bad) === null, 'unknown id refused: ' + JSON.stringify(bad));
}
t.check(X.durationMinutes(REAL) === 150 && X.durationMinutes(REH) === 150, '150 minutes each');
t.check(X.durationMinutes('__proto__') === 150, 'prototype key falls back, finite');
t.check(X.catalogId(REAL) === 'forge-md100-final' && X.catalogId(REH) === null && X.catalogId('toString') === null, 'catalog ids: rehearsal recorded nowhere');

/* window, R2 test list */
const armed = { armed: true, allowUids: [] }, unarmed = { armed: false, allowUids: [] };
t.check(!X.mayCreate(REAL, 'u', false, armed, open - 1), 'before the window: refused');
t.check(X.mayCreate(REAL, 'u', false, armed, open), 'armed at opensAt: created');
t.check(X.mayCreate(REAL, 'u', false, armed, close - 1), 'armed one ms before closesAt: created');
t.check(!X.mayCreate(REAL, 'u', false, armed, close), 'at closesAt: refused (last start is 18:30 exclusive)');
t.check(!X.mayCreate(REAL, 'u', false, unarmed, open + 1000), 'not armed inside the window: refused');
t.check(!X.mayCreate(REAL, 'u', true, unarmed, open + 1000), 'admin is not a bypass on the real id');
t.check(!X.mayCreate(REAL, 'u', false, null, open + 1000), 'missing control document: refused');
t.check(!X.mayCreate(REAL, 'u', false, { armed: 'true' }, open + 1000), 'armed must be boolean true');
t.check(X.mayCreate(REAL, 'u', false, { armed: false, allowUids: ['u'] }, 0), 'allowUids: created any time (operator smoke)');
t.check(!X.mayCreate(REAL, 'v', false, { armed: false, allowUids: ['u'] }, 0), 'allowUids is per uid');
t.check(!X.mayCreate(REAL, 'u', false, armed, NaN), 'bad clock refused');
t.check(!X.mayCreate('attempt2', 'u', true, armed, open + 1), 'unknown exam refused');
t.check(!X.mayCreate(REAL, '', false, armed, open + 1), 'empty uid refused');
/* rehearsal */
t.check(!X.mayCreate(REH, 'u', false, armed, open + 1), 'student on the rehearsal id: refused even when armed');
t.check(X.mayCreate(REH, 'u', true, unarmed, 0), 'admin on the rehearsal id: created');
t.check(X.mayCreate(REH, 'u', false, { allowUids: ['u'] }, 0), 'allowlisted on the rehearsal id: created');
t.check(X.windowFor(REH) === null, 'rehearsal has no window');
/* window is 17:30-18:30 Eastern on 2026-11-19 (EST, UTC-5) */
const fmt = (ms) => new Date(ms).toLocaleString('en-US', { timeZone: 'America/New_York', hour12: false });
t.check(fmt(open) === '11/19/2026, 17:30:00' && fmt(close) === '11/19/2026, 18:30:00', 'window is 17:30-18:30 Eastern: ' + fmt(open) + ' / ' + fmt(close));

/* type strictness (Mallory D1) */
t.check(!X.mayCreate(REH, 'u', 1, unarmed, 0) && !X.mayCreate(REH, 'u', 'true', unarmed, 0), 'rehearsal admin must be boolean true');
t.check(!X.mayCreate(REAL, 'u', false, { allowUids: 'xuy' }, 0) && !X.mayCreate(REAL, 'u', false, { allowUids: 'u' }, 0), 'allowUids must be an array (no substring match)');
t.check(!X.mayCreate(REAL, 123, false, { allowUids: [123] }, 0) && !X.mayCreate(REAL, { a: 1 }, false, armed, open + 1), 'uid must be a string');
{
    /* stand INSIDE the window, so a fallback to the real clock would create (Mallory D1 now-default) */
    const realNow = Date.now; Date.now = () => open + 60000;
    try { t.check(!X.mayCreate(REAL, 'u', false, armed, undefined) && !X.mayCreate(REAL, 'u', false, armed, null), 'omitted now fails closed even inside the window'); }
    finally { Date.now = realNow; }
}
t.check(!X.mayCreate(REAL, 'u', false, armed, String(open + 1)) && !X.mayCreate(REAL, 'u', false, armed, new Date(open + 1)) && !X.mayCreate(REAL, 'u', false, armed, [open + 1]), 'now must be a number (no string, Date or array)');
t.check(['__proto__', 'constructor', 'toString', 'hasOwnProperty'].every((k) => X.windowFor(k) === null && X.catalogId(k) === null), 'prototype names have no window or catalog id');
/* constants frozen; windowFor cannot open the window (Mallory D1 finding 2) */
const w = X.windowFor(REAL);
try { w.opensAt = 0; } catch (e) { /* frozen */ }
try { X.EXAM_IDS.push('attempt2'); } catch (e) { /* frozen */ }
try { X.CATALOG_IDS['md100-final-rehearsal'] = 'x'; } catch (e) { /* frozen */ }
try { X.PLATFORM_FAULT_CODES.push('student_said_so'); } catch (e) { /* frozen */ }
t.check(!X.mayCreate(REAL, 'u', false, armed, open - 3600000), 'mutating windowFor() result does not open the window');
t.check(X.resolveExamId('attempt2') === null && X.catalogId(REH) === null && X.PLATFORM_FAULT_CODES.length === 4, 'exam constants survive mutation attempts');
t.check([X.EXAM_IDS, X.WINDOWS, X.WINDOWS[REAL], X.CATALOG_IDS, X.DURATION_MINUTES, X.PLATFORM_FAULT_CODES].every(Object.isFrozen), 'exam constants frozen');

/* pass mark */
t.check(X.PASS_PERCENT === 70, 'pass mark 70');
t.check(X.passed(70, 100) && !X.passed(69.99, 100) && X.passed(7, 10), 'pass boundary');
t.check(!X.passed(1, 0) && !X.passed('x', 100) && !X.passed(NaN, 100), 'malformed totals never pass');
/* a 70 built from sixths must pass (Nancy D1): 69 + 6 x (1/6) in floating point is 69.99999999999999 */
let six = 69; for (let i = 0; i < 6; i++) { six += 1 / 6; }
t.check(six !== 70 && X.passed(six, 100), 'fractional sum that displays as 70.00 passes (' + six + ')');
t.check(!X.passed(69.994, 100) && X.passed(69.995, 100), 'rounding is to 0.01');

/* reset constants, 13.5 item 6 */
t.check(X.SELF_RESET_CAP === 2 && X.ADMIN_RESET_CAP === 1, 'reset caps 2 self / 1 admin');
t.check(JSON.stringify(X.PLATFORM_FAULT_CODES) === JSON.stringify(['vm_unreachable', 'provision_failed', 'engine_error', 'outage']), 'platform fault codes');

t.done();
