#!/usr/bin/env node
/**
 * mdfinal-page.test.js — static checks on the MD-100 final exam page (spec 1.6, 9 item 13).
 *
 * @catalog what    MD-100 final exam page: only the allowed scripts, no tutor/progress/client
 * @catalog what    grading, no course links, no innerHTML of server text, no viewport-pinned
 * @catalog what    positioning, no emoji or long dashes, every CSS class defined, auth before start,
 * @catalog what    every mdfinal callable it calls exists in index.js.
 * @catalog run     node _tools/mdfinal/mdfinal-page.test.js
 * @catalog status  TOOL
 *
 * Static by design: these properties hold or fail in the file itself, so they are checked on the
 * file. Behaviour in a browser is the render test's job (D9).
 */
const fs = require('fs');
const path = require('path');
const kit = require('./mdfinal-test-kit.js');
const t = kit.harness('mdfinal-page');
const REPO = path.resolve(__dirname, '../..');
const PAGE = path.join(REPO, '_app/houses/forge/md-100/exams/md100-final.exam.html');
const html = fs.readFileSync(PAGE, 'utf8');
const script = html.split('<script>').pop().split('</script>')[0];

/* scripts: exactly the three the spec allows, plus the inline AccessGuard call */
const srcs = (html.match(/<script[^>]*src="([^"]+)"/g) || []).map((s) => s.match(/src="([^"]+)"/)[1]);
t.check(JSON.stringify(srcs) === JSON.stringify(['../../../../components/AccessGuard.js', '../../../../components/FirebaseAuth.js', '/components/ObservatoryTelemetry.js']),
    'loads only AccessGuard, FirebaseAuth and ObservatoryTelemetry: ' + srcs.join(', '));
srcs.forEach((s) => {
    const f = s[0] === '/' ? path.join(REPO, '_app', s) : path.resolve(path.dirname(PAGE), s);
    t.check(fs.existsSync(f), 'script exists at its path: ' + s);
});
['HexAIButton', 'ModuleProgress', 'completeQuiz', 'localStorage', 'sessionStorage', 'AchievementManager', 'gradeQuiz'].forEach((w) =>
    t.check(html.indexOf(w) < 0, 'page never names ' + w));
t.check(!/>\s*Correct\b|['"]Correct['"]|✓|✔/.test(html), 'no "Correct" text or tick marks');

/* no course links: the only anchors would be none at all */
t.check(!/<a\s[^>]*href=/i.test(html), 'no links to course content');

/* rendering safety */
t.check(script.indexOf('innerHTML') < 0 && script.indexOf('insertAdjacentHTML') < 0 && script.indexOf('document.write') < 0, 'server text is never parsed as HTML');
t.check(/function isS\(v\)/.test(script) && /\$s/.test(script), 'student-text nodes are unwrapped');

/* CLAUDE.md rule 5 (HEUR-008), the no-emoji rule and no long dashes on _app lines */
t.check(!/position\s*:\s*fixed/i.test(html), 'no position: fixed');
t.check(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(html), 'no emoji');
t.check(!/[—–]/.test(html), 'no em or en dashes');

/* the script parses */
let parses = true;
try { new Function(script); } catch (e) { parses = false; }
t.check(parses, 'the page script parses');

/* every class used in markup or script is defined in the stylesheet */
const css = html.split('<style>')[1].split('</style>')[0];
const defined = new Set((css.match(/\.([a-zA-Z][\w-]*)/g) || []).map((c) => c.slice(1)));
const used = new Set();
(html.match(/class="([^"]+)"/g) || []).forEach((c) => c.slice(7, -1).split(/\s+/).forEach((x) => used.add(x)));
(script.match(/node\('[a-z0-9]+', '([a-z][\w-]*)'/g) || []).forEach((c) => used.add(c.match(/, '([^']+)'/)[1]));
const undefinedCls = [...used].filter((c) => !defined.has(c));
t.check(undefinedCls.length === 0, 'every class used is defined: ' + undefinedCls.join(','));

/* auth before the first callable */
const wait = script.indexOf('FirebaseAuth.waitForAuth()'), start = script.lastIndexOf("reload(null)");
t.check(wait > 0 && start > wait, 'the first start waits for sign-in');

/* every callable the page calls is an exported mdfinal callable */
const idx = fs.readFileSync(path.join(REPO, 'functions/index.js'), 'utf8');
const called = [...new Set((script.match(/call\('(mdfinal\w+)'/g) || []).map((c) => c.slice(6, -1)))];
t.check(called.length >= 8, 'the page calls the student callables: ' + called.join(','));
called.forEach((c) => t.check(new RegExp('exports\\.' + c + ' = onCall').test(idx), 'callable exists in index.js: ' + c));
t.check(called.indexOf('mdfinalResults') < 0 && called.indexOf('mdfinalControl') < 0 && called.indexOf('mdfinalProvision') < 0, 'no staff callable from the student page');

/* the rehearsal is a query flag, decided by the server allowlist */
t.check(/exam=rehearsal/.test(script) && /'md100-final-rehearsal'/.test(script) && /'md100-final-2026'/.test(script), 'exam id from ?exam=rehearsal, else the real id');

/* handover asks twice and quotes the spec's consequence text */
t.check(/Phases 1-6 are recorded as they stand now/.test(script) && (script.match(/confirmStep\(/g) || []).length >= 4, 'handover is a two-step confirmation with the 2.4 text');

/* the staff results page */
{
    const R = fs.readFileSync(path.join(REPO, '_app/houses/forge/md-100/exams/md100-final-results.html'), 'utf8');
    const rs = R.split('<script>').pop().split('</script>')[0];
    const rsrcs = (R.match(/<script[^>]*src="([^"]+)"/g) || []).map((s) => s.match(/src="([^"]+)"/)[1]);
    t.check(JSON.stringify(rsrcs) === JSON.stringify(['../../../../components/AccessGuard.js', '../../../../components/FirebaseAuth.js']), 'results page loads only AccessGuard and FirebaseAuth');
    t.check(rs.indexOf('innerHTML') < 0, 'results page never parses server text as HTML');
    let ok = true; try { new Function(rs); } catch (e) { ok = false; }
    t.check(ok, 'results page script parses');
    t.check(!/position\s*:\s*fixed/i.test(R) && !/[\u2014\u2013]/.test(R) && !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(R), 'results page: no fixed positioning, long dashes or emoji');
    const rcalled = [...new Set((rs.match(/call\('(mdfinal\w+)'/g) || []).map((c) => c.slice(6, -1)))];
    t.check(['mdfinalResults', 'mdfinalReset', 'mdfinalProvision', 'mdfinalControl'].every((c) => rcalled.indexOf(c) >= 0), 'results page calls the staff callables: ' + rcalled.join(','));
    rcalled.forEach((c) => t.check(new RegExp('exports\\.' + c + ' = onCall').test(idx), 'callable exists in index.js: ' + c));
    t.check(/'vm_unreachable', 'provision_failed', 'engine_error', 'outage'/.test(rs), 'restart reasons are the platform fault codes');
}

t.done();
