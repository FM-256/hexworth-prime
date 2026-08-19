#!/usr/bin/env node
/*
 * @catalog what    Proves deliverFlag REFUSES a competition box and still serves a teaching box,
 * @catalog what    by calling the deployed callable as a real signed-in user.
 * @catalog run     node functions/verify-deliverflag-guard.js <webApiKeyFile>
 * @catalog status  TOOL
 *
 * WHY THIS EXISTS RATHER THAN A UNIT TEST
 * The guard was unit-tested locally and the registry field was confirmed live, but neither shows
 * that the DEPLOYED function honours it. "The code has the check and the data has the flag"
 * is two facts that each look like proof and together still are not: the deploy could have
 * shipped an older build, or the guard could sit after the value is read. The only statement
 * worth making about a security control is that someone actually tried it and was refused.
 *
 * Mints a custom token with the Admin SDK, exchanges it for a real ID token, and calls the live
 * callable exactly as a browser would. The test uid is a throwaway; nothing is written to a
 * student record because deliverFlag only logs on the SUCCESS path, which the competition box
 * never reaches.
 *
 * The web API key is a PUBLIC client credential (it ships in every page), but it is read from a
 * file rather than pasted into argv so it never lands in shell history or a transcript.
 */
const fs = require('fs');
const admin = require('firebase-admin');

const KEYFILE = process.argv[2];
if (!KEYFILE || !fs.existsSync(KEYFILE)) {
    console.error('  usage: node verify-deliverflag-guard.js <file containing the web api key>');
    process.exit(2);
}
const API_KEY = fs.readFileSync(KEYFILE, 'utf8').trim();
const PROJECT = 'hexworth-prime';
const REGION = 'us-central1';
const TEST_UID = 'guardcheck-deliverflag';

if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });

async function idTokenFor(uid) {
    const custom = await admin.auth().createCustomToken(uid);
    const r = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${API_KEY}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: custom, returnSecureToken: true }) });
    const j = await r.json();
    if (!j.idToken) throw new Error('token exchange failed: ' + JSON.stringify(j).slice(0, 200));
    return j.idToken;
}

async function callDeliverFlag(idToken, boxId, flagId) {
    const r = await fetch(`https://${REGION}-${PROJECT}.cloudfunctions.net/deliverFlag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ data: { boxId, flagId } })
    });
    const body = await r.json().catch(() => ({}));
    return { http: r.status, body };
}

(async () => {
    let bad = 0;
    const idToken = await idTokenFor(TEST_UID);
    console.log('  signed in as a real (throwaway) user\n');

    // 1. The competition box MUST refuse. Assert on the STATUS (permission-denied -> 403), not
    //    on the message prose: a copy edit to the error text must not silently turn this check
    //    green-or-red for reasons unrelated to whether the guard fired.
    const comp = await callDeliverFlag(idToken, 'qual-w1-lockout', 'source-host');
    const refused = comp.http === 403;
    console.log(`  ${refused ? 'ok  ' : 'FAIL'}  competition box refused        HTTP ${comp.http}`);
    console.log(`        message: ${(comp.body.error && comp.body.error.message) || JSON.stringify(comp.body).slice(0, 90)}`);
    if (!refused) bad++;

    // 2. And the flag value must NOT appear anywhere in the refusal.
    const leaked = JSON.stringify(comp.body).includes('192.168.1.150');
    console.log(`  ${leaked ? 'FAIL' : 'ok  '}  answer absent from response`);
    if (leaked) bad++;

    /* 3. A teaching box must STILL work — a control that breaks coursework is not a fix.
     *
     * The flag id here is 'stale_creds', NOT 'fixed'. The box CONFIG declares one flag with
     * id 'fixed', but the REGISTRY is keyed by scenario (stale_creds, expired_svc, ...) with
     * `aliases` mapping each scenario back to 'fixed'. deliverFlag looks up flags[flagId]
     * directly and never consults aliases, so asking for 'fixed' returns not-found and this
     * check would have reported FAIL against a perfectly healthy deployment — inverting the
     * tool's verdict on the one path it exists to confirm. Caught in review.
     */
    const teach = await callDeliverFlag(idToken, 'ad001-lockout-storm', 'stale_creds');
    const served = teach.http === 200 && !!(teach.body.result && teach.body.result.flagText);
    console.log(`  ${served ? 'ok  ' : 'FAIL'}  teaching box still delivers    HTTP ${teach.http}`);
    if (!served) bad++;

    console.log(bad ? `\n  ${bad} FAILED` : '\n  guard proven live: refuses competition, serves teaching');
    process.exit(bad ? 1 : 0);
})().catch(e => { console.error('  verify failed:', e.message); process.exit(2); });
