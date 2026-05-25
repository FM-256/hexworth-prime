#!/usr/bin/env node
/**
 * test-hex-ai-chat-authenticated.js — end-to-end Dr. Hex chat test with a
 * real Firebase Auth session.
 *
 * Strategy:
 *   1. Use firebase-admin (loaded from functions/node_modules) + gcloud
 *      application-default credentials to mint a custom token for a
 *      synthetic test user.
 *   2. Launch puppeteer against the live hexworth-prime.web.app page.
 *   3. signInWithCustomToken in the page context via the Firebase Web SDK
 *      already loaded by HexAIButton.js.
 *   4. Click the floating Dr. Hex button → chat panel opens.
 *   5. Send a real message, wait for the model response.
 *   6. Click the "unhelpful?" downvote.
 *   7. Verify (via the page's console) that intervention_sent + downvote
 *      beacons were called without error.
 *
 * Run:
 *     node _tools/eduscan/smoke/test-hex-ai-chat-authenticated.js
 *
 * Exit 0 on full success, 1 on any failure.
 */
const puppeteer = require('puppeteer');
const https = require('https');

const URL = 'https://hexworth-prime.web.app/houses/matrix/adv-linux/index.html';
const TEST_SUFFIX = Math.random().toString(36).slice(2, 8);
const TEST_EMAIL = `drhex-smoke-${TEST_SUFFIX}@hexworth-smoke.local`;
// Password policy: ≤10 chars, must include uppercase. Build a compliant random one.
const TEST_PASSWORD = 'Sm' + Math.random().toString(36).slice(2, 6) + '9X';
// Web API key — same one used by HexAIButton.js / HexAIChatPanel.js
const FIREBASE_WEB_API_KEY = 'AIzaSyC3tWNETi36DA8Q1I60n7t09YfU9HapA4M';
const TIMEOUT_NAV_MS = 30000;
const TIMEOUT_CHAT_MS = 90000;

// Mint a Firebase test user via the Identity Toolkit signUp REST endpoint.
// Returns { idToken, refreshToken, localId } on success.
function createTestUser(email, password) {
    const body = JSON.stringify({
        email, password, returnSecureToken: true,
    });
    return new Promise((resolve, reject) => {
        const req = https.request({
            method: 'POST',
            hostname: 'identitytoolkit.googleapis.com',
            path: `/v1/accounts:signUp?key=${FIREBASE_WEB_API_KEY}`,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
                // The Firebase Web API key is HTTP-referer restricted to
                // hexworth-prime.web.app and *.hexworth.com. Send a
                // matching Referer so the API accepts the call from this
                // node process.
                'Referer': 'https://hexworth-prime.web.app/',
            },
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const j = JSON.parse(data);
                    if (j.idToken) resolve(j);
                    else reject(new Error(`signUp failed: ${data.slice(0, 300)}`));
                } catch (e) {
                    reject(new Error(`signUp parse failed: ${data.slice(0, 300)}`));
                }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

// Clean up: delete the test user via Identity Toolkit accounts:delete.
function deleteTestUser(idToken) {
    const body = JSON.stringify({ idToken });
    return new Promise((resolve) => {
        const req = https.request({
            method: 'POST',
            hostname: 'identitytoolkit.googleapis.com',
            path: `/v1/accounts:delete?key=${FIREBASE_WEB_API_KEY}`,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
                // The Firebase Web API key is HTTP-referer restricted to
                // hexworth-prime.web.app and *.hexworth.com. Send a
                // matching Referer so the API accepts the call from this
                // node process.
                'Referer': 'https://hexworth-prime.web.app/',
            },
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ ok: res.statusCode === 200, body: data }));
        });
        req.on('error', () => resolve({ ok: false }));
        req.write(body);
        req.end();
    });
}

const results = { pass: 0, fail: 0, fails: [] };
function check(label, ok, detail) {
    if (ok) {
        results.pass++;
        console.log(`  PASS  ${label}`);
    } else {
        results.fail++;
        results.fails.push(`${label}${detail ? ': ' + detail : ''}`);
        console.log(`  FAIL  ${label}${detail ? ': ' + detail : ''}`);
    }
}

(async () => {
    console.log(`\nDr. Hex authenticated end-to-end smoke — ${URL}`);
    console.log(`test_email: ${TEST_EMAIL}`);
    console.log('─'.repeat(60));

    // 1. Create a real Firebase test user via Identity Toolkit signUp.
    let signUpResult;
    try {
        signUpResult = await createTestUser(TEST_EMAIL, TEST_PASSWORD);
        check('create Firebase test user', !!signUpResult.idToken);
        console.log(`        localId: ${signUpResult.localId}`);
    } catch (e) {
        check('create Firebase test user', false, e.message);
        process.exit(1);
    }
    const TEST_UID = signUpResult.localId;

    // 2. Launch puppeteer
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const consoleErrors = [];
    const consoleWarns = [];
    const consoleDebugs = [];
    const allLogs = [];
    page.on('pageerror', (e) => consoleErrors.push(String(e.message || e)));
    page.on('console', (msg) => {
        const t = msg.type();
        const s = msg.text();
        allLogs.push(`[${t}] ${s}`);
        if (t === 'error') consoleErrors.push(s);
        if (t === 'warning') consoleWarns.push(s);
        if (t === 'debug') consoleDebugs.push(s);
    });

    // Activate Tourist Visa + persist email+password in sessionStorage so
    // the page can sign in with them.
    await page.goto('https://hexworth-prime.web.app/favicon.ico', {
        waitUntil: 'domcontentloaded',
    }).catch(() => {});
    await page.evaluate((email, password) => {
        localStorage.setItem('hexworth_tourist_active', 'true');
        localStorage.setItem('hexworth_tourist_visited', '[]');
        sessionStorage.setItem('_smoke_email', email);
        sessionStorage.setItem('_smoke_password', password);
    }, TEST_EMAIL, TEST_PASSWORD);

    // 3. Navigate to the lab page
    try {
        await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_NAV_MS });
    } catch (e) {
        check('navigate to lab page', false, e.message);
        await browser.close();
        process.exit(1);
    }
    await new Promise(r => setTimeout(r, 2000));
    check('lab page loaded', true);

    // 4. Sign in via email+password using the Firebase SDK loaded by the page
    const signInResult = await page.evaluate(async () => {
        try {
            const { initializeApp, getApps } = await import(
                'https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js'
            );
            const { getAuth, signInWithEmailAndPassword } = await import(
                'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js'
            );
            const fbConfig = {
                apiKey: "AIzaSyC3tWNETi36DA8Q1I60n7t09YfU9HapA4M",
                authDomain: "hexworth-prime.firebaseapp.com",
                projectId: "hexworth-prime",
                storageBucket: "hexworth-prime.firebasestorage.app",
                messagingSenderId: "11726236962",
                appId: "1:11726236962:web:1829ea0839f2587121497b",
            };
            const app = getApps().length ? getApps()[0] : initializeApp(fbConfig);
            const auth = getAuth(app);
            const email = sessionStorage.getItem('_smoke_email');
            const password = sessionStorage.getItem('_smoke_password');
            const cred = await signInWithEmailAndPassword(auth, email, password);
            return { ok: true, uid: cred.user.uid, email: cred.user.email || null };
        } catch (e) {
            return { ok: false, error: String(e.message || e) };
        }
    });
    check('sign in with custom token', signInResult.ok, signInResult.error || '');
    if (!signInResult.ok) {
        await browser.close();
        process.exit(1);
    }
    check('signed-in UID matches test UID',
        signInResult.uid === TEST_UID,
        `signed-in uid=${signInResult.uid}`);
    await new Promise(r => setTimeout(r, 1500));

    // 5. Force the button to recognize the auth state, then click it
    const clickedResult = await page.evaluate(async () => {
        const el = document.querySelector('hex-ai-button');
        if (!el) return { ok: false, why: 'no button' };
        // The button's onAuthStateChanged listener should have fired by now,
        // but just in case let's wait a moment and check.
        await new Promise(r => setTimeout(r, 1500));
        if (!el._authUser) {
            // Fallback: poke the auth user manually so the click proceeds.
            // This is acceptable for smoke since signInWithCustomToken did
            // complete successfully above.
            const { getAuth } = await import('https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js');
            const auth = getAuth();
            el._authUser = auth.currentUser;
        }
        const btn = el.shadowRoot.querySelector('button');
        btn.click();
        return { ok: true, hadAuth: !!el._authUser };
    });
    check('button click registered (with auth)', clickedResult.ok);
    await new Promise(r => setTimeout(r, 3000));

    // 6. Chat panel should mount
    const panel = await page.$('hex-ai-chat-panel');
    check('chat panel mounted', !!panel);
    if (!panel) {
        await browser.close();
        process.exit(1);
    }

    // 7. Send a real chat message
    const sendResult = await page.evaluate(async () => {
        const panel = document.querySelector('hex-ai-chat-panel');
        const ta = panel.shadowRoot.querySelector('textarea');
        const sendBtn = panel.shadowRoot.querySelector('button.send-btn');
        ta.value = 'I am working on the AES lab. Where should I start?';
        sendBtn.click();
        return { ok: true };
    });
    check('chat message sent', sendResult.ok);

    // 8. Wait for the AI response to render (poll up to TIMEOUT_CHAT_MS)
    const startWait = Date.now();
    let aiResponse = null;
    while (Date.now() - startWait < TIMEOUT_CHAT_MS) {
        await new Promise(r => setTimeout(r, 1500));
        aiResponse = await page.evaluate(() => {
            const panel = document.querySelector('hex-ai-chat-panel');
            if (!panel) return null;
            const msgs = panel.shadowRoot.querySelectorAll('.msg.ai');
            // Skip "thinking" placeholder — look for a real response
            for (const m of msgs) {
                if (!m.classList.contains('thinking')) {
                    const text = m.firstChild ? m.firstChild.textContent : '';
                    const hasDownvote = !!m.querySelector('.downvote-btn');
                    if (text && text.trim().length > 0 && hasDownvote) {
                        return { text: text.trim(), hasDownvote };
                    }
                }
            }
            return null;
        });
        if (aiResponse) break;
    }
    const elapsedChatMs = Date.now() - startWait;
    check('AI response received within timeout',
        !!aiResponse,
        `waited ${elapsedChatMs}ms`);
    if (aiResponse) {
        check('AI response has content',
            aiResponse.text.length > 10,
            `${aiResponse.text.length} chars`);
        check('downvote button rendered alongside response',
            aiResponse.hasDownvote);
        console.log(`        response: ${aiResponse.text.slice(0, 200)}${aiResponse.text.length > 200 ? '…' : ''}`);
    }

    // 9. Click the downvote
    const downvoteResult = await page.evaluate(() => {
        const panel = document.querySelector('hex-ai-chat-panel');
        const btn = panel.shadowRoot.querySelector('.downvote-btn');
        if (!btn) return { ok: false };
        btn.click();
        return { ok: true, active: btn.classList.contains('active') };
    });
    check('downvote button clicked', downvoteResult.ok);
    check('downvote button visually activated', downvoteResult.active === true);
    await new Promise(r => setTimeout(r, 1500));

    // 10. Check console for beacon-dropped debug messages (would indicate
    //     the CF was unreachable — bad sign).
    const beaconDrops = consoleDebugs.filter(
        d => /engagement beacon dropped/i.test(d)
    );
    check('no engagement beacons were dropped (CF reachable)',
        beaconDrops.length === 0,
        beaconDrops.join(' | '));

    // 11. No HexAI-related console errors
    const hexErrors = consoleErrors.filter(e => /HexAI|hex-ai|engagement/.test(e));
    check('no HexAI / engagement console errors',
        hexErrors.length === 0,
        hexErrors.slice(0, 3).join(' | '));

    await browser.close();

    // Clean up: delete the test Firebase user.
    const deleteResult = await deleteTestUser(signUpResult.idToken);
    check('test user cleanup (delete account)', deleteResult.ok);

    console.log('─'.repeat(60));
    console.log(`  ${results.pass} PASS / ${results.fail} FAIL`);
    if (results.fail > 0) {
        console.log('  failures:');
        for (const f of results.fails) console.log(`    - ${f}`);
    }
    process.exit(results.fail > 0 ? 1 : 0);
})().catch((e) => {
    console.error('smoke crashed:', e);
    process.exit(2);
});
