#!/usr/bin/env node
/**
 * render-verify.js — RENDER the certified-result branches, don't just trace them
 *
 * @catalog what    Loads tournament-podium.html and broadcast.html in headless Chrome with a stubbed
 * @catalog what    Firestore serving a REAL results-of-record (produced by ctf-finalize.js), then
 * @catalog what    asserts the boards actually paint the certified standings and screenshots them.
 * @catalog run     node _tools/tournament/dump-record.js <dir>   (under the firestore emulator)
 * @catalog run     node _tools/tournament/render-verify.js <dir>
 * @catalog status  TOOL
 *
 * WHY THIS EXISTS
 * ---------------
 * A quality gate blocked taskboard 362 on the last visible layer: the three pages that consume the
 * results-of-record had been syntax-checked and logic-traced, and nobody had looked at a screen.
 * These are the boards a live audience watches and the panel an admin actions a disqualification
 * from — "logic-traced" is not the bar for that. This project's own memory says it twice:
 * `feedback_count_the_dom_or_look_at_the_page` and `feedback_zero_stub_e2e_before_theorizing`.
 *
 * WHY NOT A PREVIEW CHANNEL: a preview channel serves static hosting against PRODUCTION Firestore,
 * and `ctfEndTournament` is not deployed. Verifying there would require deploying functions and
 * rules to production and seeding a tournament in the live database — all behind the production
 * write gate, none of it authorised. This harness gets the render evidence without touching
 * production at all. It is NOT a substitute for a preview-channel check against real infrastructure;
 * it is what can be honestly obtained first.
 *
 * WHY THE DATA IS NOT HAND-WRITTEN: the fixture comes from `dump-record.js`, which runs the ACTUAL
 * finalization transaction against the emulator and dumps what it wrote. A hand-typed record would
 * only prove the pages can render my idea of the schema — and this change has already been bitten
 * once by exactly that, when a first draft dropped `color`/`memberNames` and would have flattened
 * every team to one colour on the projector.
 *
 * WHAT IS STUBBED, AND WHAT IS NOT: only the Firestore transport. The page's own HTML, CSS, and
 * rendering JavaScript are the real files, loaded from disk and executed by a real browser. Nothing
 * about layout is altered — `feedback_a_probe_that_alters_layout_measures_nothing`.
 *
 * EXIT: 0 both boards render the certified result, 1 an assertion failed, 2 could not run.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');

const REPO = path.resolve(__dirname, '../..');
const APP = path.join(REPO, '_app');

let pass = 0, fail = 0;
const chk = (name, cond, detail) => {
    cond ? pass++ : fail++;
    console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${name}${cond ? '' : '  <- ' + String(detail).slice(0, 220)}`);
};

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png',
               '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };

/* Serve _app as Firebase Hosting does. The `/__/firebase/*` reserved paths are answered with an
   empty script: the real compat SDK is never loaded, because the stub below fully replaces it. */
function serve() {
    return new Promise((resolve) => {
        const srv = http.createServer((req, res) => {
            const url = decodeURIComponent(req.url.split('?')[0]);
            if (url.startsWith('/__/firebase/')) {
                res.writeHead(200, { 'Content-Type': 'text/javascript' });
                return res.end('/* stubbed by render-verify */');
            }
            const file = path.join(APP, url);
            if (!file.startsWith(APP) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
                res.writeHead(404); return res.end('not found');
            }
            res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
            fs.createReadStream(file).pipe(res);
        });
        srv.listen(0, '127.0.0.1', () => resolve(srv));
    });
}

/* The stub. Installed BEFORE any page script runs, so `firebase.firestore()` resolves to this.
   Shapes returned deliberately mimic the compat SDK the pages actually use: doc snapshots expose
   `.exists` / `.data()`, query snapshots expose `.empty`, `.size`, `.forEach`, `.docs`. */
function makeStub() {
    // Serialised to source and injected via evaluateOnNewDocument; the record, tournament and team
    // arrays are passed as JSON arguments at the call site, not captured from this scope.
    return function (rec, tourn, tms) {
        const docSnap = (data) => ({ exists: !!data, data: () => data, id: 'final' });
        const qSnap = (arr) => ({
            empty: arr.length === 0, size: arr.length,
            docs: arr.map(t => ({ id: t.id, data: () => t })),
            forEach: (fn) => arr.forEach(t => fn({ id: t.id, data: () => t }))
        });
        const chain = (kind) => ({
            orderBy: function () { return this; },
            limit: function () { return this; },
            where: function () { return this; },
            doc: (id) => ({
                onSnapshot: (cb) => { setTimeout(() => cb(docSnap(kind === 'results' ? rec : null)), 0); return () => {}; },
                get: () => Promise.resolve(docSnap(kind === 'results' ? rec : null)),
                collection: (c) => chain(c)
            }),
            onSnapshot: (cb) => { setTimeout(() => cb(qSnap(kind === 'teams' ? tms : [])), 0); return () => {}; },
            get: () => Promise.resolve(qSnap(kind === 'teams' ? tms : []))
        });
        const tournDocRef = {
            onSnapshot: (cb) => { setTimeout(() => cb(docSnap(tourn)), 0); return () => {}; },
            get: () => Promise.resolve(docSnap(tourn)),
            collection: (c) => chain(c)
        };
        /* The tournaments COLLECTION must answer `.get()` with this tournament, because broadcast.html
           populates a dropdown from it before anything renders. It also only auto-selects an
           active/frozen event, so an 'ended' one is chosen explicitly by the harness afterwards —
           faithful to how an operator actually drives that page. */
        const TID = 'render-verify-tournament';
        const tournamentsCollection = {
            doc: () => tournDocRef,
            orderBy: function () { return this; },
            limit: function () { return this; },
            where: function () { return this; },
            get: () => Promise.resolve(qSnap([Object.assign({ id: TID }, tourn)])),
            onSnapshot: (cb) => { setTimeout(() => cb(qSnap([Object.assign({ id: TID }, tourn)])), 0); return () => {}; }
        };
        window.firebase = {
            apps: [{}],
            initializeApp: () => {},
            firestore: () => ({ collection: () => tournamentsCollection }),
            // broadcast.html gates all loading behind signInAnonymously(); without it the page
            // never leaves STANDBY and the harness would measure an empty screen.
            auth: () => ({
                signInAnonymously: () => Promise.resolve({ user: { uid: 'anon-render' } }),
                onAuthStateChanged: (cb) => { setTimeout(() => cb({ uid: 'anon-render' }), 0); return () => {}; },
                currentUser: { uid: 'anon-render' }
            })
        };
        window.firebase.firestore.FieldValue = { serverTimestamp: () => null };
    }.toString();
}

async function main() {
    const dir = process.argv[2];
    if (!dir || !fs.existsSync(path.join(dir, 'record-v1.json'))) {
        console.error('  usage: render-verify.js <dir containing record-v1.json / record-v2.json>');
        console.error('  produce it first with: firebase emulators:exec --only firestore \\');
        console.error('    "node _tools/tournament/dump-record.js <dir>"');
        return 2;
    }
    let puppeteer;
    try { puppeteer = require(path.join(REPO, 'node_modules/puppeteer')); }
    catch (e) { console.error('  puppeteer unavailable:', e.message); return 2; }

    const v1 = JSON.parse(fs.readFileSync(path.join(dir, 'record-v1.json'), 'utf8'));
    const v2 = JSON.parse(fs.readFileSync(path.join(dir, 'record-v2.json'), 'utf8'));
    const tournament = { name: 'Hexworth Inaugural (render check)', status: 'ended', scoringModel: 'static' };
    // Deliberately DIFFERENT from the record: if a board is still live-re-sorting, it shows these
    // names/order instead, and the assertions below catch it.
    const liveTeams = [
        { id: 'decoy', name: 'LIVE-RESORT-DECOY', color: '#ffffff', score: 99999, solves: [], members: [], memberNames: [] }
    ];

    const srv = await serve();
    const base = `http://127.0.0.1:${srv.address().port}`;
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });

    /* `drive` runs in the page after load, for surfaces that need an operator action before they
       render anything. broadcast.html auto-selects only an active/frozen event, so an ENDED one
       stays on the standby screen forever unless the dropdown is actually used — which is exactly
       how an operator drives it at a real event. Without this the negated assertions below would
       pass on a blank screen, certifying nothing. */
    async function render(pageUrl, record, label, drive) {
        const page = await browser.newPage();
        await page.setViewport({ width: 1600, height: 1000 });
        const errors = [];
        page.on('pageerror', e => errors.push(String(e.message)));
        await page.evaluateOnNewDocument(
            `(${makeStub()})(${JSON.stringify(record)}, ${JSON.stringify(tournament)}, ${JSON.stringify(liveTeams)});`
        );
        await page.goto(`${base}${pageUrl}?t=render-verify-tournament&id=render-verify-tournament`,
                        { waitUntil: 'networkidle0', timeout: 30000 });
        await new Promise(r => setTimeout(r, 1200));   // let onSnapshot callbacks paint
        if (drive) { await page.evaluate(drive); await new Promise(r => setTimeout(r, 1200)); }
        const text = await page.evaluate(() => document.body.innerText);
        const shot = path.join(dir, label + '.png');
        await page.screenshot({ path: shot, fullPage: false });
        await page.close();
        return { text, errors, shot };
    }

    try {
        // ── PODIUM, v1 ───────────────────────────────────────────────────────────────────
        const p1 = await render('/arena/tournament-podium.html', v1, 'podium-v1');
        chk('podium v1 renders the WINNING team name from the record', /Zulu Cell/.test(p1.text), p1.text.slice(0, 200));
        chk('podium v1 renders the runner-up', /Alpha Squad/.test(p1.text), p1.text.slice(0, 200));
        chk('podium v1 renders third place', /Bravo Unit/.test(p1.text), p1.text.slice(0, 200));
        chk('podium v1 does NOT show the live-resort decoy (record outranks live teams)',
            !/LIVE-RESORT-DECOY/.test(p1.text), 'decoy visible — page is still live re-sorting');
        chk('podium v1 shows no "undefined" in rendered text', !/undefined/i.test(p1.text),
            (p1.text.match(/.{0,40}undefined.{0,40}/i) || [''])[0]);
        chk('podium v1 is not blank', p1.text.replace(/\s/g, '').length > 40, p1.text.length);
        chk('podium v1 threw no page errors', p1.errors.length === 0, p1.errors.join(' | '));

        // ── PODIUM, v2 (corrected board after a disqualification) ────────────────────────
        const p2 = await render('/arena/tournament-podium.html', v2, 'podium-v2');
        /* PRESENCE BEFORE ORDER. A bare `indexOf(a) < indexOf(b)` is a false pass waiting to happen:
           indexOf returns -1 for an absent string, so if 'Alpha Squad' failed to render at all the
           comparison becomes `-1 < someIndex` — TRUE — and the harness would certify a promotion on
           a board the team does not appear on. That is the worst place in this file to accept a
           wrong-answer-shaped pass, because v2 IS the post-disqualification board. */
        const iAlpha = p2.text.indexOf('Alpha Squad');
        const iZulu = p2.text.indexOf('Zulu Cell');
        chk('podium v2 renders both teams (presence, before any ordering claim)',
            iAlpha !== -1 && iZulu !== -1, `Alpha at ${iAlpha}, Zulu at ${iZulu}`);
        chk('podium v2 reflects the correction (Alpha Squad promoted above Zulu Cell)',
            iAlpha !== -1 && iZulu !== -1 && iAlpha < iZulu, `Alpha at ${iAlpha}, Zulu at ${iZulu}`);
        chk('podium v2 threw no page errors', p2.errors.length === 0, p2.errors.join(' | '));

        // ── BROADCAST (the Big Screen), v1 ───────────────────────────────────────────────
        const b1 = await render('/arena/broadcast.html', v1, 'broadcast-v1', () => {
            // Operate the page the way an operator does: pick the event from the dropdown.
            const sel = document.getElementById('tournamentSelect');
            sel.value = 'render-verify-tournament';
            sel.dispatchEvent(new Event('change'));
        });
        /* PRESENCE FIRST. broadcast.html sits on a standby screen until an event is selected, and on
           that screen every NEGATED assertion below passes vacuously — no decoy, no "undefined",
           because there is nothing at all. Assert the page actually left standby before believing
           anything it does not say. */
        chk('broadcast v1 left the standby screen (selection took effect)',
            !/CHOOSE AN EVENT FROM THE DROPDOWN/i.test(b1.text), b1.text.slice(0, 160));
        chk('broadcast v1 renders certified standings', /Zulu Cell/.test(b1.text), b1.text.slice(0, 300));
        chk('broadcast v1 renders all three certified teams',
            /Zulu Cell/.test(b1.text) && /Alpha Squad/.test(b1.text) && /Bravo Unit/.test(b1.text),
            b1.text.slice(0, 300));
        chk('broadcast v1 does NOT show the live-resort decoy',
            !/LIVE-RESORT-DECOY/.test(b1.text), 'decoy visible — Big Screen still live re-sorting');
        chk('broadcast v1 shows no "undefined"', !/undefined/i.test(b1.text),
            (b1.text.match(/.{0,40}undefined.{0,40}/i) || [''])[0]);
        chk('broadcast v1 threw no page errors', b1.errors.length === 0, b1.errors.join(' | '));

        console.log('\n  screenshots:');
        for (const f of ['podium-v1.png', 'podium-v2.png', 'broadcast-v1.png']) {
            const p = path.join(dir, f);
            console.log(`    ${fs.existsSync(p) ? '' : '(missing) '}${p}`);
        }
    } catch (e) {
        console.error('\n  harness fault:', e && e.stack ? e.stack : e);
        await browser.close(); srv.close();
        return 2;
    }

    await browser.close();
    srv.close();
    console.log(`\n  ${pass}/${pass + fail} assertions passed`);
    return fail ? 1 : 0;
}

main().then(c => process.exit(c)).catch(e => {
    console.error('  render-verify could not run:', e && e.message);
    process.exit(2);
});
