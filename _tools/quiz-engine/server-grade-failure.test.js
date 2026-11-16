#!/usr/bin/env node
/**
 * server-grade-failure.test.js — what a student sees when server grading fails (QuizEngine).
 *
 * @catalog what    Real QuizEngine.js in headless Chrome: a refused or failed gradeQuiz must never
 * @catalog what    show a score (it showed 0% on MD-100 M10, 2026-11-16); the student is told why, keeps
 * @catalog what    their answers and can submit again; a quiz that carries its answers still grades locally.
 * @catalog run     node _tools/quiz-engine/server-grade-failure.test.js
 * @catalog status  TOOL
 *
 * Pages are served from _app/ (plus two fixture quizzes); FirebaseAuth is a stand-in whose
 * gradeQuiz answers per call from a list of modes (ok / 401 / net); AccessGuard lets everyone in.
 * Nothing leaves the machine.
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require(path.join(__dirname, '../../node_modules/puppeteer'));

const APP = path.join(__dirname, '../../_app');
const ORIGIN = 'http://hx.test';
let pass = 0, fail = 0;
/* records one assertion */
function check(name, cond, extra) { if (cond) { pass++; console.log('ok   ' + name); } else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); } }

/* A server-graded fixture: no `correct` on any question, like every real server-graded quiz. */
const QS = [0, 1, 2, 3, 4].map((i) => ({ question: 'Fixture question ' + i + '?', options: ['opt' + i + 'a', 'opt' + i + 'b', 'opt' + i + 'c'] }));
const KEY = [1, 1, 1, 1, 1];
const fixture = (withAnswers) => '<!doctype html><html><head><meta charset="utf-8"></head><body><div id="quiz-container"></div>' +
    '<script src="/components/FirebaseAuth.js"></script><script src="/components/ProgressSystem.js"></script><script src="/components/QuizEngine.js"></script><script>const quiz = new QuizEngine(' + JSON.stringify({
        containerId: 'quiz-container', title: 'Fixture', passingScore: 70, showFeedback: true, randomize: true, theme: 'forge',
        moduleId: 'fixture-quiz', serverGrading: true, houseId: 'forge', trackProgress: false,
        questions: QS.map((q, i) => (withAnswers ? Object.assign({ correct: KEY[i] }, q) : q))
    }) + '); quiz.start();</script></body></html>';

/* FirebaseAuth stand-in: gradeQuiz follows window.__modes (set before load), grading like the server. */
const AUTH = 'window.__calls=[];window.__modes=(window.__modesInit||[]).slice();' +
    'const FirebaseAuth={init:async()=>{},isSignedIn:()=>true,getUser:()=>({uid:"t"}),waitForAuth:async()=>({uid:"t"}),' +
    'signInWithGoogle:async()=>{window.__signIns=(window.__signIns||0)+1;return window.__signInResult===undefined?{uid:"t"}:window.__signInResult;},onAuthStateChanged:()=>{},' +
    'callFunction:async(n,d)=>{window.__calls.push([n,JSON.parse(JSON.stringify(d))]);const m=window.__modes.shift()||"ok";' +
    'if(m==="401"){const e=new Error("Must be signed in.");e.code="functions/unauthenticated";throw e;}' +
    'if(m==="net"){const e=new Error("Failed to fetch");e.code="functions/unavailable";throw e;}' +
    'if(m==="nokey"){const e=new Error("Quiz key not found.");e.code="functions/not-found";throw e;}' +
    'const key=window.__key||[];const results=key.map((k,i)=>({correct:d.answers[String(i)]===k}));const score=results.filter(r=>r.correct).length;' +
    'return{data:{score,total:key.length,percentage:Math.round(score/key.length*100),passed:score/key.length>=0.7,results}};}};';

(async () => {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    /* opens a page with the given grading modes; returns the page */
    async function open(url, modes, key) {
        const p = await browser.newPage();
        p.__errors = [];
        p.on('pageerror', (e) => p.__errors.push(String(e).slice(0, 160)));
        await p.evaluateOnNewDocument((m, k) => { window.__modesInit = m; window.__key = k; }, modes, key);
        await p.setRequestInterception(true);
        p.on('request', (r) => {
            const u = r.url();
            if (!u.startsWith(ORIGIN)) return r.abort('blockedbyclient');
            const q = decodeURIComponent(new URL(u).pathname);
            if (q === '/__fixture.html') return r.respond({ status: 200, contentType: 'text/html', body: fixture(false) });
            if (q === '/__fixture-keyed.html') return r.respond({ status: 200, contentType: 'text/html', body: fixture(true) });
            if (/\/components\/FirebaseAuth\.js$/.test(q)) return r.respond({ status: 200, contentType: 'application/javascript', body: AUTH });
            if (/\/components\/AccessGuard\.js$/.test(q)) return r.respond({ status: 200, contentType: 'application/javascript', body: 'window.AccessGuard=new Proxy({},{get:()=>function(){return true}});' });
            const f = path.join(APP, q);
            if (f.startsWith(APP) && fs.existsSync(f) && fs.statSync(f).isFile()) return r.respond({ status: 200, contentType: { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css' }[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) });
            return r.respond({ status: 404, body: '' });
        });
        await p.goto(ORIGIN + url, { waitUntil: 'load' });
        await new Promise((r) => setTimeout(r, 400));
        return p;
    }
    /* answers every question through the engine's own click handlers (always the first shown option), then finishes */
    async function takeQuiz(p) {
        for (let n = 0; n < 40; n++) {
            const state = await p.evaluate(() => {
                const opt = document.querySelector('#quiz-container .option-btn, #quiz-container .quiz-option, #quiz-container [data-index], #quiz-container .option');
                if (opt) { opt.click(); }
                const b = [...document.querySelectorAll('#quiz-container button')].find((x) => /^(Next|Submit|Finish|Start)/i.test(x.textContent.trim()) && !/again/i.test(x.textContent));
                if (b) { b.click(); return 'clicked ' + b.textContent.trim(); }
                return opt ? 'option' : 'none';
            });
            await new Promise((r) => setTimeout(r, 180));
            if ((await p.evaluate(() => window.__calls.length)) > 0) break;
            if (state === 'none') break;
        }
        await new Promise((r) => setTimeout(r, 700));
        return p.evaluate(() => document.querySelector('#quiz-container').innerText.replace(/\s+/g, ' '));
    }
    const SCORE = /\b\d{1,3}%|\d+\/\d+/;

    /* 1. refused as not signed in: no score, says sign in, offers sign-in and submit again */
    let p = await open('/__fixture.html', ['401', '401'], KEY);
    let shown = await takeQuiz(p);
    check('a refused grade (not signed in) shows NO score', !SCORE.test(shown), shown.slice(0, 160));
    check('...and says to sign in, with Sign in and Submit again buttons', /Sign in to submit this quiz/.test(shown) && /Sign in with Google/.test(shown) && /Submit again/.test(shown), shown.slice(0, 200));

    /* 1b. the sign-in popup is cancelled or blocked (signInWithGoogle returns null): no resubmit */
    await p.evaluate(() => { window.__signInResult = null; });
    await p.evaluate(() => [...document.querySelectorAll('#quiz-container button')].find((x) => x.textContent === 'Sign in with Google').click());
    await new Promise((r) => setTimeout(r, 700));
    const c1b = await p.evaluate(() => ({ calls: window.__calls.length, signIns: window.__signIns, text: document.querySelector('#quiz-container').innerText, enabled: [...document.querySelectorAll('#quiz-container button')].every((b) => !b.disabled) }));
    check('a cancelled sign-in does not resubmit, stays on the sign-in screen, buttons usable again', c1b.calls === 1 && c1b.signIns === 1 && /Sign in to submit/.test(c1b.text) && c1b.enabled, JSON.stringify(c1b).slice(0, 200));
    await p.evaluate(() => { window.__signInResult = undefined; });

    /* 2. Submit again after signing in: same answers, graded */
    await p.evaluate(() => { window.__modes = ['ok']; });
    await p.evaluate(() => [...document.querySelectorAll('#quiz-container button')].find((x) => x.textContent === 'Sign in with Google').click());
    await new Promise((r) => setTimeout(r, 900));
    shown = await p.evaluate(() => document.querySelector('#quiz-container').innerText.replace(/\s+/g, ' '));
    const c2 = await p.evaluate(() => ({ n: window.__calls.length, same: JSON.stringify(window.__calls[0][1].answers) === JSON.stringify(window.__calls[window.__calls.length - 1][1].answers), signIns: window.__signIns }));
    check('Sign in with Google, then the same answers are resubmitted and graded', c2.signIns === 2 && c2.same && SCORE.test(shown) && !/Sign in to submit/.test(shown), JSON.stringify(c2) + ' ' + shown.slice(0, 120));
    check('no page errors (refusal path)', p.__errors.length === 0, p.__errors.join(' | '));
    await p.close();

    /* 3. a network failure: no score, says not graded, Submit again works */
    p = await open('/__fixture.html', ['net', 'net'], KEY);
    shown = await takeQuiz(p);
    check('a failed grade (network) shows NO score and says it was not graded', !SCORE.test(shown) && /Your quiz was not graded/.test(shown) && !/Sign in with Google/.test(shown), shown.slice(0, 160));
    await p.evaluate(() => { window.__modes = ['ok']; [...document.querySelectorAll('#quiz-container button')].find((x) => x.textContent === 'Submit again').click(); });
    await new Promise((r) => setTimeout(r, 900));
    shown = await p.evaluate(() => document.querySelector('#quiz-container').innerText.replace(/\s+/g, ' '));
    check('Submit again after a network failure grades the same answers', SCORE.test(shown) && (await p.evaluate(() => JSON.stringify(window.__calls[0][1].answers) === JSON.stringify(window.__calls[window.__calls.length - 1][1].answers))), shown.slice(0, 120));
    await p.close();

    /* 3b. the server rejected the quiz itself (no key): says so, no futile Submit again, no connection advice */
    p = await open('/__fixture.html', ['nokey'], KEY);
    shown = await takeQuiz(p);
    check('a server rejection (no key) says the quiz could not be graded, without Submit again or connection advice', /This quiz could not be graded/.test(shown) && !/Submit again/.test(shown) && !/connection/.test(shown) && !SCORE.test(shown), shown.slice(0, 200));
    await p.close();

    /* 4. the error text is never parsed as HTML */
    p = await open('/__fixture.html', ['net'], KEY);
    await p.evaluate(() => { const orig = FirebaseAuth.callFunction; FirebaseAuth.callFunction = async (n, d) => { window.__calls.push([n, d]); const e = new Error('<img src=x onerror="window.__pwned=1">'); throw e; }; });
    await takeQuiz(p);
    check('the error message is shown as text, never run', !(await p.evaluate(() => !!window.__pwned || !!document.querySelector('#quiz-container img'))));
    await p.close();

    /* 5. normal grading is unchanged */
    p = await open('/__fixture.html', ['ok'], KEY);
    shown = await takeQuiz(p);
    check('normal server grading still shows the server score', SCORE.test(shown) && !/not graded|Sign in to submit/.test(shown), shown.slice(0, 120));
    await p.close();

    /* 6. a quiz that DOES carry its answers still falls back to local grading */
    p = await open('/__fixture-keyed.html', ['net'], KEY);
    shown = await takeQuiz(p);
    check('a quiz carrying its answers still grades locally when the server fails', SCORE.test(shown) && !/not graded/.test(shown), shown.slice(0, 120));
    await p.close();

    /* 7. the real MD-100 M10 page: a refusal shows the sign-in message, not 0% */
    p = await open('/houses/forge/md-100/quizzes/forge-md100-m10-quiz.quiz.html', ['401', '401'], [1, 1, 1, 1, 2, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1]);
    shown = await takeQuiz(p);
    check('MD-100 M10 refused: "Sign in to submit this quiz", no 0%', /Sign in to submit this quiz/.test(shown) && !/\b0%/.test(shown), shown.slice(0, 160));
    await p.close();

    await browser.close();
    console.log('\nserver-grade-failure: ' + pass + ' passed, ' + fail + ' failed');
    process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('ERROR', e); process.exit(2); });
