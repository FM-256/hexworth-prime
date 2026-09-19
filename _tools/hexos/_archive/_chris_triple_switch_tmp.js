'use strict';
const puppeteer = require('puppeteer');
const BASE = process.env.BOARD_BASE || 'http://127.0.0.1:5000';
const T = 'triplecheck1';
const CRED_A = { url: 'https://engine1-A.example.test', username: 'player', password: 'A-pw-111' };
const CRED_C = { url: 'https://engine1-C.example.test', username: 'player', password: 'C-pw-333' };
let pass=0, fail=0;
const chk=(n,ok,d)=>{ console.log(`  ${ok?'PASS':'FAIL'}  ${n}${d?' :: '+d:''}`); ok?pass++:fail++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-dev-shm-usage'] });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (req.url().includes('/__/firebase/init.js')) {
      return req.respond({ status: 200, contentType: 'application/javascript', body: `
        window.__boxScript = { mode: 'multi', delays: {'ch-a': 1600, 'ch-b': 0, 'ch-c': 800} };
        const CRED = { 'ch-a': ${JSON.stringify(CRED_A)}, 'ch-c': ${JSON.stringify(CRED_C)} };
        const CHALLENGES = [
            { id: 'ch-a', title: 'A', category: 'misc', description: 'a', points: 100, currentPoints: 100, visible: true, solveCount: 0, order: 0, hints: [] },
            { id: 'ch-b', title: 'B', category: 'misc', description: 'b', points: 100, currentPoints: 100, visible: true, solveCount: 0, order: 1, hints: [] },
            { id: 'ch-c', title: 'C', category: 'misc', description: 'c', points: 100, currentPoints: 100, visible: true, solveCount: 0, order: 2, hints: [] }
        ];
        const TOURNAMENT = { name: 'Triple Check', status: 'active', boardStyle: 'default', duration: 120, scoringModel: 'static' };
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
                    const cid = payload && payload.challengeId;
                    const delay = (sc.delays && sc.delays[cid]) || 0;
                    if (delay) await new Promise(r => setTimeout(r, delay));
                    if (CRED[cid]) return { data: CRED[cid] };
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

  // Triple rapid switch: open A (slow, 1600ms), then B (instant, no cred) at +100ms,
  // then C (medium, 800ms, HAS a cred) at +250ms. A resolves last, C resolves second-last,
  // and the modal ends up showing C. Neither A's nor B's response should ever land, and only
  // C's own credential (if it resolves while C is still open) should be allowed to render.
  await page.evaluate(() => {
    window.openChallenge('ch-a');
    setTimeout(() => window.openChallenge('ch-b'), 100);
    setTimeout(() => window.openChallenge('ch-c'), 250);
  });
  await sleep(3500);
  const result = await page.evaluate(() => {
    const s = document.getElementById('realBoxSlot');
    return { ch: s ? s.getAttribute('data-ch') : null, text: s ? (s.innerText || '') : '', html: s ? s.innerHTML.length : -1 };
  });
  chk('after THREE rapid switches, live modal is the THIRD challenge', result.ch === 'ch-c', `data-ch=${result.ch}`);
  chk('challenge A credentials never leaked in', !result.text.includes('A-pw-111'), result.text.slice(0,80) || '(empty)');
  chk('challenge C got its OWN credential (not blocked as collateral)', result.text.includes('C-pw-333'), result.text.slice(0,80));

  await browser.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('SUITE ERROR:', e); process.exit(2); });
