#!/usr/bin/env node
/*
 * @catalog what    Drives the REAL independence-test UI and checks every claim it sends against
 * @catalog what    the REAL server verifier, including the distractor comparisons the missions invite.
 * @catalog run     node _tools/qa/cold-horizon/gate-claims-test.js
 * @catalog status  GATE
 *
 * WHY THIS EXISTS. gateway.html accumulated every "not independent" pair into ONE set,
 * regardless of which axis made the pair dependent, and then claimed the whole set shared the
 * mission's trap axis. The server requires all claimed sources to agree on one axis, so a
 * single unrelated dependent pair poisoned every later claim for the rest of the session.
 *
 * THE MISSIONS INVITE THE POISONING PAIR. Mission 3's corroborator text says gs-maser "shares
 * a pipeline with the ranging fix"; those two are dependent on logPipeline, not on the trap
 * axis timeRoot. A player who did what the game told them and then did all the correct work
 * had their TRUE finding rejected, with a refusal that deliberately names nothing and no way
 * to recover short of reloading. Rejecting a correct finding is the exact failure #306 exists
 * to remove. Found by Chris on review; neither acts-test nor playthrough touches this UI.
 *
 * So this asserts the property that actually matters: after a distractor comparison AND the
 * correct work, at least one claim the UI sent still verifies against the real spec. It runs
 * the claims through functions/mission-gates.js itself rather than a copy, so the test cannot
 * drift from the server.
 */
'use strict';
const puppeteer = require('puppeteer');
const http = require('http'), fs = require('fs'), path = require('path');
const { verifyFinding } = require('../../../functions/mission-gates');

const ROOT = path.resolve(__dirname, '../../../_app');
const SPEC = JSON.parse(fs.readFileSync(
    path.resolve(__dirname, '../../../functions/mission-gates.generated.json'), 'utf8')).gates;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    fs.readFile(path.join(ROOT, p), (e, buf) => {
        if (e) { res.writeHead(404); return res.end('404'); }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
        res.end(buf);
    });
});

let pass = 0, fail = 0;
const t = (n, c, d) => { c ? (pass++, console.log('  PASS  ' + n + (d ? '  -> ' + d : '')))
                           : (fail++, console.log('  FAIL  ' + n + (d ? '  -> ' + d : ''))); };

/* CASES ARE DERIVED FROM THE SPEC, NOT HARDCODED, and that is the point of this revision.
   The previous version covered m2 and m3 and inferred the rest. Chris blocked on exactly that:
   "the mechanism looks generic, it should just work" is the assumption that made this very test
   vacuous twice already. So every gated mission is derived and driven, including the drone- and
   satellite-kind acts whose corroborators unlock differently.

   For each gate:
     correct    a chain through the sources that genuinely share the trap axis, which is what a
                player establishes by testing pairs
     distractor a pair that shares SOME OTHER axis while differing on the trap axis: the poison.
                Five of the twelve missions have no such pair at all, so poisoning is
                structurally impossible there. That is reported rather than silently skipped,
                because "no case found" and "case found and passed" must never look alike. */
function deriveCases(spec) {
    return Object.keys(spec).map(function (flag) {
        var g = spec[flag], T = g.trapAxis, V = g.trapValue, S = g.sources;
        var ids = Object.keys(S);
        var trap = ids.filter(function (id) { return (S[id].axes || {})[T] === V; });
        var distractor = null;
        outer:
        for (var i = 0; i < ids.length; i++) {
            for (var j = i + 1; j < ids.length; j++) {
                var x = ids[i], y = ids[j];
                if ((S[x].axes || {})[T] === (S[y].axes || {})[T]) continue;   // must NOT share the trap
                var ax = Object.keys(S[x].axes || {}).filter(function (a) {
                    return a !== T && S[x].axes[a] !== undefined && S[y].axes[a] === S[x].axes[a];
                })[0];
                if (ax) { distractor = [x, y]; break outer; }
            }
        }
        var correct = [];
        for (var k = 0; k + 1 < trap.length && k < 2; k++) correct.push([trap[k], trap[k + 1]]);

        /* NEC[1], the independent witness, is the OTHER half of every gate and had ZERO
           coverage: independenceOf only returns ok:true when the pair shares NO declared axis,
           and neither `correct` (shares the trap) nor `distractor` (shares something else) can
           ever produce that. So half the reveal-gate mechanism went undriven on all 12 missions
           while the suite reported 36/36. Found by Chris driving the branch by hand. */
        var disjoint = null;
        outer2:
        for (var a2 = 0; a2 < ids.length; a2++) {
            for (var b2 = a2 + 1; b2 < ids.length; b2++) {
                var p1 = S[ids[a2]].axes || {}, p2 = S[ids[b2]].axes || {};
                var shares = Object.keys(p1).some(function (ax) {
                    return p1[ax] !== undefined && p2[ax] === p1[ax];
                });
                if (!shares) { disjoint = [ids[a2], ids[b2]]; break outer2; }
            }
        }
        return { flag: flag, m: g.missionId, correct: correct, distractor: distractor,
                 disjoint: disjoint, trapCount: trap.length };
    }).filter(function (c) { return c.correct.length > 0; });
}

/* The corroborator each mission gates behind an act, so the harness can seed it and make every
   source selectable. Read from the mission data rather than listed here, so a content change
   cannot leave this stale. MissionActs.isEarned keys on missionId:corrId and ignores kind, so
   one seed shape works for terminal, drone and satellite alike. */
function earnedCorroborators() {
    var src = fs.readFileSync(path.resolve(__dirname,
        '../../../_app/arena/boxes/le-01-cold-horizon/missions-held.js'), 'utf8');
    var out = {}, re = /\{ id: '([a-z0-9-]+)',\s*\n\s*earnedBy: \{ kind: '([a-z]+)'/g, m;
    while ((m = re.exec(src))) out[m[1]] = m[2];
    return out;
}

(async () => {
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    const port = server.address().port;
    const base = `http://127.0.0.1:${port}`;
    const browser = await puppeteer.launch({ headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const errors = [];

    /* Which act to seed for this mission: the one earned corroborator that appears among this
       gate's sources. Without it the distractor pair may include a locked corroborator, and
       page.select on a missing option is a SILENT no-op. */
    const EARNED = earnedCorroborators();
    function seedFor(c) {
        const gate = SPEC[c.flag];
        const id = Object.keys(gate.sources).filter(x => EARNED[x])[0];
        return id ? (c.m + ':' + id) : ('' + c.m + ':none');
    }

    async function run(c, withDistractor) {
        const page = await browser.newPage();
        page.on('pageerror', e => errors.push(String(e.message).slice(0, 130)));
        await page.evaluateOnNewDocument((earn) => {
            try {
                localStorage.setItem('hexworth_house', 'cloud');
                // The distractor needs the mission's earned corroborator to be selectable.
                localStorage.setItem('hexworth_le01_acts',
                    JSON.stringify({ [earn]: { kind: 'terminal', at: new Date().toISOString() } }));
            } catch (e) {}
        }, seedFor(c));
        await page.goto(`${base}/arena/boxes/le-01-cold-horizon/gateway.html?m=${c.m}`,
                        { waitUntil: 'networkidle0', timeout: 40000 });
        /* Capture what the page WOULD send. FirebaseAuth.js has already loaded and defined the
           global, so this patch replaces its callFunction rather than racing it. */
        await page.evaluate(() => {
            window.__CLAIMS = [];
            FirebaseAuth.isSignedIn = () => true;
            FirebaseAuth.callFunction = (name, payload) => {
                window.__CLAIMS.push({ name, payload });
                return Promise.resolve({ data: { recorded: true } });
            };
        });

        /* Assert the pairs are actually selectable BEFORE driving them. A page.select on a
           missing option is a silent no-op, which is how the first version of this test
           reported green against a build with the bug still in it. */
        const opts = await page.evaluate(() =>
            Array.from(document.querySelectorAll('#srcA option')).map(o => o.value));
        const pairs = withDistractor === 'independent'
            ? [c.disjoint, c.disjoint]                      // same pair twice: must not resend
            : (withDistractor ? [c.distractor] : []).concat(c.correct);
        const missing = [...new Set(pairs.flat())].filter(id => opts.indexOf(id) === -1);
        if (missing.length) { await page.close(); return { claims: [], missing }; }

        for (const [a, b] of pairs) {
            await page.select('#srcA', a);
            await page.select('#srcB', b);
            await page.click('#testBtn');
            await new Promise(r => setTimeout(r, 3200));   // orbital delay is ~3 ticks
        }
        const claims = await page.evaluate(() => window.__CLAIMS);
        await page.close();
        return { claims: claims.filter(x => x.name === 'recordMissionFinding').map(x => x.payload),
                 missing: [] };
    }

    console.log('\n--- claims the independence-test UI actually sends ---\n');

    const CASES = deriveCases(SPEC);
    console.log(`  ${CASES.length} gated missions derived from the spec\n`);
    let unpoisonable = 0, noWitness = 0;

    for (const c of CASES) {
        const gate = SPEC[c.flag];
        const nec0 = gate.necessaries[0];
        const spec = gate.findings[nec0];
        const orderings = (c.distractor ? [false, true] : [false])
            .concat(c.disjoint ? ['independent'] : []);
        if (!c.distractor) unpoisonable++;
        if (!c.disjoint) noWitness++;

        for (const withDistractor of orderings) {
            const label = withDistractor === 'independent' ? 'independent witness'
                        : withDistractor ? 'distractor first' : 'control';
            const { claims, missing } = await run(c, withDistractor);
            if (missing.length) {
                t(`m${c.m} ${label}: sources selectable`, false, 'not in menu: ' + missing.join(', '));
                continue;
            }
            /* The independent-witness run asserts a different thing: the NEC[1] claim is sent,
               it verifies as a genuine distinct-axis finding, and clicking the SAME pair again
               does NOT resend it. The resend guard existed only on the dependent branch. */
            if (withDistractor === 'independent') {
                const nec1 = gate.necessaries[1];
                const forNec1 = claims.filter(p => p.findingId === nec1);
                const spec1 = gate.findings[nec1];
                t(`m${c.m} ${label}: the NEC[1] claim is sent`, forNec1.length > 0,
                  `${forNec1.length} claim(s)`);
                t(`m${c.m} ${label}: it VERIFIES as a distinct-axis finding`,
                  forNec1.length > 0 && !!spec1
                  && verifyFinding(spec1, { sources: forNec1[0].sources }, gate.sources).ok,
                  forNec1.length ? JSON.stringify(forNec1[0].sources) : 'none');
                t(`m${c.m} ${label}: clicking the same pair twice does NOT resend`,
                  forNec1.length <= 1, `${forNec1.length} sent for 2 clicks`);
                continue;
            }
            const forNec0 = claims.filter(p => p.findingId === nec0);
            const accepted = forNec0.filter(p =>
                verifyFinding(spec, { sources: p.sources }, gate.sources).ok);
            t(`m${c.m} ${label}: a claim VERIFIES`, accepted.length > 0,
              accepted.length ? `${accepted.length}/${forNec0.length}`
                              : `0/${forNec0.length}; last=${JSON.stringify((forNec0[forNec0.length-1]||{}).sources||[])}`);
            /* THE REAL INVARIANT IS INTERNAL CONSISTENCY, not "it matches the trap".
               An earlier version of this assertion failed m7 and m8 on claims like
               ["kvm-hostlog","kvm-netflow","kvm-audit"], which are not lies: those three DO
               all share an axis, just not the one this mission is about. The client cannot
               know which axis is the trap, and is not supposed to guess: the server holds
               that and declines the rest. Asserting the client only ever claims the trap
               grouping would demand exactly the guessing the design removed.
               What must hold is that every claim is TRUE OF SOMETHING: all its sources share
               one value of one axis. A claim that fails this is the client inventing a
               grouping the player never demonstrated. */
            const inconsistent = forNec0.filter(p => {
                const rows = p.sources.map(id => (gate.sources[id] || {}).axes || {});
                if (!rows.length) return true;
                return !Object.keys(rows[0]).some(ax =>
                    rows[0][ax] !== undefined && rows.every(r => r[ax] === rows[0][ax]));
            });
            t(`m${c.m} ${label}: every claim is true of SOME axis`, inconsistent.length === 0,
              inconsistent.length ? JSON.stringify(inconsistent[0].sources) : 'none');
        }
    }
    console.log(`\n  ${unpoisonable} of ${CASES.length} missions have NO poisonable pair at all `
              + `(no source shares a non-trap axis while differing on the trap axis).`);
    console.log(`  ${noWitness} of ${CASES.length} missions have no fully disjoint pair to drive NEC[1].`);

    console.log(`\n=== page errors (${errors.length}) ===`);
    if (errors.length) console.log('  ' + [...new Set(errors)].join('\n  '));
    console.log(`\n${pass}/${pass + fail} checks passed, ${errors.length} runtime errors`);
    await browser.close(); server.close();
    process.exit(pass === pass + fail && !errors.length ? 0 : 1);
})().catch(e => { console.error('HARNESS ERROR: ' + e.message); process.exit(1); });
