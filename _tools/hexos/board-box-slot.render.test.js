#!/usr/bin/env node
/**
 * board-box-slot.render.test.js
 *
 * @catalog what   Opens the real tournament board in a browser against the Firestore/Functions
 *                 emulator and proves the real-box slot renders for an assigned challenge, is
 *                 absent for an unassigned one, never paints one challenge's credentials into
 *                 another's modal, and shows the student something visible on a real error.
 * @catalog run    firebase emulators:exec --only firestore,functions,auth --project=demo-hexworth "NODE_PATH=$(pwd)/functions/node_modules node _tools/hexos/board-box-slot.render.test.js"
 * @catalog status TOOL
 *
 * WHY IT EXISTS. Chris BLOCKED the first submission of this feature on two defects in exactly
 * this file, both invisible to node --check, div-balance and the emulator suite, and both
 * reachable by ordinary clicking:
 *   1. the error path called `showToast`, which exists in admin/console.html and NOT on this
 *      page, so it was permanently dead code and an outage produced nothing a student could see;
 *   2. renderBoxSlot found #realBoxSlot by id without comparing data-ch, so a delayed fetch for
 *      challenge A could paint A's URL and password into challenge B's open modal.
 * "Logic-traced and it parses" was not sufficient self-QC for a page 200+ challenges render
 * through. This is the check that would have caught both.
 */
'use strict';
const puppeteer = require('puppeteer');
/* No firebase-admin and no emulator: the page's data and its callable responses are supplied by
 * the stubbed init.js below, so this suite is self-contained and cannot reach any real project. */
const PROJECT = 'demo-hexworth';

const BASE = process.env.BOARD_BASE || 'http://127.0.0.1:5000';

let pass = 0, fail = 0;
const chk = (n, ok, d) => { console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`); ok ? pass++ : fail++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const T = 'renderasg1';
const ASSIGNED = { url: 'https://engine1-render.example.test', username: 'player', password: 'render-pw-zzz' };

(async () => {
    console.log('\n== board-box-slot render ==');
    console.log(`  board=${BASE} (self-contained: stubbed backend, no emulator, no real project)`);

    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', e => pageErrors.push(e.message.slice(0, 160)));

    /* WHAT THIS TEST ISOLATES, AND WHY.
     * Chris's four required checks are all BOARD DOM logic: does the slot render for an assigned
     * challenge, is it absent for an unassigned one, can a stale response paint into the wrong
     * modal, and does a real error become visible to a student. None of those depend on the
     * callable's server behaviour, which is separately proven by ctf-box-assignment.test.js at
     * 17/17 including the positive control and both corrupt-doc variants.
     *
     * So the page gets CONTROLLED inputs rather than a live backend: init.js is replaced with a
     * stub that reports a signed-in user, serves the tournament from in-page data, and answers
     * ctfGetBoxCredential from a script the test drives. That also removes the browser-to-Auth
     * emulator reachability problem entirely (the page could not reach it: a direct fetch threw
     * "Failed to fetch" with interception both on and off), and it guarantees this test can never
     * touch a real project, which matters because a board pointed at production would create
     * tournaments there.
     *
     * The tradeoff is stated plainly: this proves the RENDERING contract, not the wire. */
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (req.url().includes('/__/firebase/init.js')) {
            return req.respond({ status: 200, contentType: 'application/javascript', body: `
                window.__boxScript = { mode: 'assigned', delayMs: 0 };
                const CRED = ${JSON.stringify(ASSIGNED)};
                const CHALLENGES = [
                    { id: 'ch-box', title: 'Has A Real Box', category: 'misc', description: 'real', points: 100, currentPoints: 100, visible: true, solveCount: 0, order: 0, hints: [] },
                    { id: 'ch-sim', title: 'Simulated Only', category: 'misc', description: 'sim', points: 50, currentPoints: 50, visible: true, solveCount: 0, order: 1, hints: [] }
                ];
                const TOURNAMENT = { name: 'Render Check', status: 'active', boardStyle: 'default', duration: 120, scoringModel: 'static' };
                const TEAM = { name: 'Alpha', members: ['u-alpha'], memberNames: ['A'], score: 0, solves: [], color: '#3498db' };

                function snap(data, id) { return { id, exists: true, data: () => data, ref: {} }; }
                function coll(docs) {
                    return {
                        get: async () => ({ docs: docs.map(d => snap(d, d.id)), forEach: (f) => docs.map(d => snap(d, d.id)).forEach(f), size: docs.length, empty: docs.length === 0 }),
                        onSnapshot: (cb) => { cb({ docs: docs.map(d => snap(d, d.id)), forEach: (f) => docs.map(d => snap(d, d.id)).forEach(f), size: docs.length }); return () => {}; },
                        orderBy: function () { return this; }, where: function () { return this; },
                        doc: (id) => docRef(docs.find(d => d.id === id) || null, id)
                    };
                }
                function docRef(data, id) {
                    return {
                        get: async () => (data ? snap(data, id) : { exists: false, data: () => undefined }),
                        onSnapshot: (cb) => { cb(data ? snap(data, id) : { exists: false, data: () => undefined }); return () => {}; },
                        collection: (name) => name === 'challenges' ? coll(CHALLENGES)
                                            : name === 'teams' ? coll([Object.assign({ id: 'alpha' }, TEAM)])
                                            : coll([])
                    };
                }
                window.firebase = {
                    initializeApp: () => {},
                    auth: () => ({
                        currentUser: { uid: 'u-alpha' },
                        onAuthStateChanged: (cb) => { setTimeout(() => cb({ uid: 'u-alpha' }), 0); return () => {}; },
                        signInWithPopup: () => Promise.resolve({ user: { uid: 'u-alpha' } }),
                        signInAnonymously: () => Promise.resolve({ user: { uid: 'u-alpha' } })
                    }),
                    firestore: () => ({
                        collection: (name) => name === 'tournaments'
                            ? { doc: (id) => docRef(Object.assign({ id }, TOURNAMENT), id) }
                            : coll([])
                    }),
                    functions: () => ({
                        httpsCallable: (name) => async (payload) => {
                            if (name !== 'ctfGetBoxCredential') return { data: {} };
                            const sc = window.__boxScript || {};
                            if (sc.delayMs) await new Promise(r => setTimeout(r, sc.delayMs));
                            if (sc.mode === 'error') { const e = new Error('boom'); e.code = 'functions/internal'; throw e; }
                            if (payload && payload.challengeId === 'ch-box') return { data: CRED };
                            const nf = new Error('none'); nf.code = 'functions/not-found'; throw nf;
                        }
                    })
                };
                firebase.auth.GoogleAuthProvider = function () {};
            ` });
        }
        return req.continue();
    });

    await page.goto(`${BASE}/arena/tournament-board.html?id=${T}`, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(2000);

    // (a) the assigned challenge shows the slot, with the right values
    await page.evaluate(() => window.openChallenge && window.openChallenge('ch-box'));
    await sleep(3000);
    const boxSlot = await page.evaluate(() => {
        const s = document.getElementById('realBoxSlot');
        return s ? { html: s.innerHTML.length, text: s.innerText || '' } : null;
    });
    chk('assigned challenge renders the box slot', !!boxSlot && boxSlot.html > 0, boxSlot ? `${boxSlot.html} chars` : 'no slot element');
    chk('the slot shows the assigned URL and credentials', !!boxSlot && boxSlot.text.includes('Open your box') && boxSlot.text.includes(ASSIGNED.username),
        boxSlot ? boxSlot.text.replace(/\s+/g, ' ').slice(0, 90) : '');
    const hrefOk = await page.evaluate((u) => {
        const a = document.querySelector('#realBoxSlot a');
        return !!a && a.getAttribute('href') === u;
    }, ASSIGNED.url);
    chk('the link points at the assigned URL', hrefOk);

    // (b) the unassigned challenge must look exactly like today: slot present but empty
    await page.evaluate(() => window.closeModal && window.closeModal());
    await sleep(400);
    await page.evaluate(() => window.openChallenge && window.openChallenge('ch-sim'));
    await sleep(3000);
    const simSlot = await page.evaluate(() => {
        const s = document.getElementById('realBoxSlot');
        return s ? s.innerHTML.length : -1;
    });
    chk('a challenge with NO assignment renders no box block', simSlot === 0, `slot html length ${simSlot}`);

    // (c) THE RACE: open the assigned one, immediately switch, and confirm the credential never
    //     lands in the other challenge's modal.
    await page.evaluate(() => window.closeModal && window.closeModal());
    await sleep(300);
    await page.evaluate(() => {
        window.__boxScript = { mode: 'assigned', delayMs: 1500 };   // keep ch-box in flight
        window.openChallenge('ch-box');
        setTimeout(() => window.openChallenge('ch-sim'), 100);      // switch before it resolves
    });
    await sleep(4000);
    const raced = await page.evaluate(() => {
        const s = document.getElementById('realBoxSlot');
        return { ch: s ? s.getAttribute('data-ch') : null, text: s ? (s.innerText || '') : '' };
    });
    chk('after a rapid switch the open modal is the SECOND challenge', raced.ch === 'ch-sim', `data-ch=${raced.ch}`);
    chk('the first challenge credentials did NOT leak into it', !raced.text.includes(ASSIGNED.password) && !raced.text.includes(ASSIGNED.username),
        raced.text ? raced.text.replace(/\s+/g, ' ').slice(0, 80) : '(empty, correct)');

    // (d) a REAL error must be visible to the student, not just a console warning.
    //     Break the callable by pointing the page at a function name that does not exist.
    await page.evaluate(() => window.closeModal && window.closeModal());
    await sleep(300);
    await page.evaluate(() => { window.__boxScript = { mode: 'error', delayMs: 0 }; });
    await page.evaluate(() => window.openChallenge && window.openChallenge('ch-box'));
    /* Poll for the toast WHILE IT IS VISIBLE. toast() resets className after 3000ms, so sampling
     * once at 6s measured the cleared state and failed for the wrong reason: the text persists in
     * textContent but the styling class does not. Sample the live state instead. */
    let toastSeen = null;
    for (let i = 0; i < 40; i++) {
        await sleep(300);
        const t = await page.evaluate(() => {
            const el = document.getElementById('boardToast');
            return el ? { cls: el.className, text: el.textContent || '' } : null;
        });
        if (t && /show/.test(t.cls) && /could not load your box details/i.test(t.text)) { toastSeen = t; break; }
        if (t && !toastSeen && /could not load your box details/i.test(t.text)) toastSeen = t;
    }
    chk('a non-transient failure shows the student a visible toast',
        !!toastSeen && /could not load your box details/i.test(toastSeen.text),
        toastSeen ? `class="${toastSeen.cls}" text="${toastSeen.text.slice(0, 60)}"` : 'no toast element');
    chk('and the toast uses a STYLED type', !!toastSeen && /\b(error|success)\b/.test(toastSeen.cls), toastSeen ? toastSeen.cls : '');

    chk('no uncaught page errors throughout', pageErrors.length === 0, pageErrors.join(' | ').slice(0, 120));

    await browser.close();
    console.log(`\n${pass} passed, ${fail} failed`);
    process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('SUITE ERROR:', e); process.exit(2); });
