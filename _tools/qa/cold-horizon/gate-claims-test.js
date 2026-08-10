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

/* Each case: the distractor pair the mission's own text invites, then the comparisons that
   genuinely establish the trap. The control runs the same correct work with no distractor. */
const CASES = [
    /* `earn` matters: the distractor pairs involve each mission's EARNED corroborator, which
       the act layer keeps out of the selects until it is obtained. Without seeding it the
       page.select() calls silently no-op, the distractor never happens, and this whole test
       goes vacuous. It did exactly that on the first run: the sabotage build passed 8/8. */
    { m: 3, flag: 'm3-last-good-contact', earn: '3:range-fix',
      distractor: ['gs-maser', 'range-fix'],            // share logPipeline, NOT timeRoot
      correct: [['plat-log', 'moc-log'], ['moc-log', 'sso-time']] },
    { m: 2, flag: 'm2-ghost-session', earn: '2:badge-log',
      distractor: ['badge-log', 'cam-still'],           // share logPipeline/clockSource, NOT issuer
      correct: [['sess-token', 'sso-audit'], ['sess-token', 'vpn-log']] }
];

(async () => {
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    const port = server.address().port;
    const base = `http://127.0.0.1:${port}`;
    const browser = await puppeteer.launch({ headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const errors = [];

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
        }, c.earn);
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
        const pairs = (withDistractor ? [c.distractor] : []).concat(c.correct);
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

    for (const c of CASES) {
        const gate = SPEC[c.flag];
        const nec0 = gate.necessaries[0];
        const spec = gate.findings[nec0];

        for (const withDistractor of [false, true]) {
            const label = withDistractor ? 'AFTER the distractor the mission invites' : 'control, no distractor';
            const { claims, missing } = await run(c, withDistractor);
            if (missing.length) {
                t(`m${c.m} ${label}: sources are selectable`, false, 'not in the menu: ' + missing.join(', '));
                continue;
            }
            const forNec0 = claims.filter(p => p.findingId === nec0);
            // The real server verifier, not a reimplementation of it.
            const accepted = forNec0.filter(p =>
                verifyFinding(spec, { sources: p.sources }, gate.sources).ok);
            t(`m${c.m} ${label}: a claim still VERIFIES`, accepted.length > 0,
              accepted.length ? `${accepted.length}/${forNec0.length} claims accepted`
                              : `0/${forNec0.length} accepted; last=${JSON.stringify((forNec0[forNec0.length-1]||{}).sources||[])}`);
            /* And no claim may be a lie. The server would decline them anyway, but a UI that
               sprays false claims is telling the player's ledger things they did not show. */
            const lies = forNec0.filter(p => !verifyFinding(spec, { sources: p.sources }, gate.sources).ok
                                             && p.sources.length >= (spec.minSources || 2));
            t(`m${c.m} ${label}: no oversized FALSE claim is sent`, lies.length === 0,
              lies.length ? JSON.stringify(lies[0].sources) : 'none');
        }
    }

    console.log(`\n=== page errors (${errors.length}) ===`);
    if (errors.length) console.log('  ' + [...new Set(errors)].join('\n  '));
    console.log(`\n${pass}/${pass + fail} checks passed, ${errors.length} runtime errors`);
    await browser.close(); server.close();
    process.exit(pass === pass + fail && !errors.length ? 0 : 1);
})().catch(e => { console.error('HARNESS ERROR: ' + e.message); process.exit(1); });
