#!/usr/bin/env node
/**
 * discord-link.test.js
 *
 * @catalog what   Proves a student can link their Hexworth account to Discord and that the link
 *                 cannot be forged, replayed, or made with an expired code. Also checks whether
 *                 the two implementations of the linking rule still agree.
 * @catalog run    firebase emulators:exec --only firestore,functions,auth --project=demo-hexworth "TEST_SIGNING_SEED=<seed> NODE_PATH=$(pwd)/functions/node_modules node _tools/rules-test/discord-link.test.js"
 * @catalog status TOOL
 *
 * THE FLOW UNDER TEST. dashboard.html:9772 calls generateDiscordLinkCode, which mints a 6-char code
 * into discord_link_codes/{code} with a 10-minute expiry. The student types /link <code> in
 * Discord; the bot handler looks the code up in Firestore, refuses it if used or expired, marks it
 * used, then writes discord_links/{discordId} -> uid and mirrors discordId onto users/{uid}.
 *
 * THE DUPLICATION THIS ALSO MEASURES. There is a SECOND implementation of that same rule: the
 * callable verifyDiscordLinkCode. It is deployed, and it has zero callers (no reference in
 * _app/dashboard.html, and the /link handler does the work inline instead). This codebase has been
 * burned by duplicated rules before, which is why standings-parity.test.js exists to hold two
 * copies of the tie-break in agreement. So this suite exercises BOTH paths and reports whether they
 * still behave the same, rather than testing only the one students actually reach.
 */
'use strict';
const nacl = require('tweetnacl');
const admin = require('firebase-admin');

const FN_HOST = process.env.FUNCTIONS_EMULATOR_HOST || '127.0.0.1:5001';
const AUTH_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
const PROJECT = 'demo-hexworth';
admin.initializeApp({ projectId: PROJECT });
const db = admin.firestore();

let pass = 0, fail = 0;
const chk = (n, ok, d) => { console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`); ok ? pass++ : fail++; };

const SEED = process.env.TEST_SIGNING_SEED;
if (!SEED) {
    const kp = nacl.sign.keyPair();
    console.log('SETUP: put this public key in functions/.env.demo-hexworth and pass the seed:');
    console.log('  DISCORD_PUBLIC_KEY=' + Buffer.from(kp.publicKey).toString('hex'));
    console.log('  TEST_SIGNING_SEED=' + Buffer.from(kp.secretKey).toString('hex'));
    process.exit(3);
}
const secretKey = Buffer.from(SEED, 'hex');

async function identity() {
    const r = await fetch(`http://${AUTH_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnSecureToken: true }),
    });
    const d = await r.json();
    if (!d.idToken) throw new Error('no token from the auth emulator');
    return d;
}

async function callable(name, token, data) {
    const r = await fetch(`http://${FN_HOST}/${PROJECT}/us-central1/${name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ data: data || {} }),
    });
    const d = await r.json().catch(() => ({}));
    return { status: r.status, ok: r.status === 200, body: d, err: d && d.error && (d.error.status || d.error.message) };
}

async function slashLink(code, discordId, username) {
    const body = JSON.stringify({
        type: 2,
        data: { name: 'link', options: [{ name: 'code', value: code }] },
        member: { user: { id: discordId, username: username || 'Student' } },
    });
    const ts = String(Math.floor(Date.now() / 1000));
    const sig = Buffer.from(nacl.sign.detached(Buffer.from(ts + body), secretKey)).toString('hex');
    const r = await fetch(`http://${FN_HOST}/${PROJECT}/us-central1/discordInteraction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-signature-ed25519': sig, 'x-signature-timestamp': ts },
        body,
    });
    const text = await r.text();
    let json = null; try { json = JSON.parse(text); } catch (e) {}
    return { status: r.status, json, content: (json && json.data && (json.data.content || JSON.stringify(json.data.embeds || ''))) || text };
}

(async () => {
    console.log('\n== discord account linking ==');

    // ── 1. CAN IT BE LINKED: the whole student journey ──────────────────────────────────────
    const user = await identity();
    const gen = await callable('generateDiscordLinkCode', user.idToken, {});
    const code = gen.ok && gen.body.result && gen.body.result.code;
    chk('a signed-in student can mint a link code', !!code && /^[A-Z0-9]{6}$/.test(code), code ? `${code.length} chars` : (gen.err || 'no code'));
    chk('the code avoids look-alike characters', !!code && !/[IO01]/.test(code), code || '');

    const stored = code ? await db.collection('discord_link_codes').doc(code).get() : null;
    chk('it is stored against that student, unused, with an expiry',
        !!stored && stored.exists && stored.data().uid === user.localId && stored.data().used === false && !!stored.data().expiresAt,
        stored && stored.exists ? `used=${stored.data().used}` : 'not stored');

    const DISCORD_ID = '900000000000000001';
    const link = await slashLink(code, DISCORD_ID, 'TestStudent');
    chk('/link with that code succeeds', link.status === 200 && !/not found|expired|already been used|Invalid code/i.test(link.content),
        String(link.content).slice(0, 80));

    const mapping = await db.collection('discord_links').doc(DISCORD_ID).get();
    chk('the Discord id now maps to that Hexworth uid (second channel, not the reply)',
        mapping.exists && mapping.data().uid === user.localId,
        mapping.exists ? `uid matches: ${mapping.data().uid === user.localId}` : 'no mapping written');

    const profile = await db.doc(`users/${user.localId}`).get();
    chk('and the uid carries the Discord id back', profile.exists && profile.data().discordId === DISCORD_ID,
        profile.exists ? String(profile.data().discordId) : 'no user doc');

    // ── 2. IT CANNOT BE REPLAYED ────────────────────────────────────────────────────────────
    const replay = await slashLink(code, '900000000000000002', 'Impostor');
    chk('the same code cannot be used twice', /already been used/i.test(String(replay.content)), String(replay.content).slice(0, 70));
    const hijack = await db.collection('discord_links').doc('900000000000000002').get();
    chk('and no second mapping was created', !hijack.exists, hijack.exists ? 'A SECOND ACCOUNT GOT LINKED' : 'none');

    // ── 3. A CODE THAT WAS NEVER MINTED ─────────────────────────────────────────────────────
    const bogus = await slashLink('ZZZZZZ', '900000000000000003', 'Nobody');
    chk('an invented code is refused', /not found/i.test(String(bogus.content)), String(bogus.content).slice(0, 60));

    // ── 4. AN EXPIRED CODE ─────────────────────────────────────────────────────────────────
    const user2 = await identity();
    const gen2 = await callable('generateDiscordLinkCode', user2.idToken, {});
    const code2 = gen2.body.result.code;
    await db.collection('discord_link_codes').doc(code2).update({ expiresAt: new Date(Date.now() - 60000) });
    const expired = await slashLink(code2, '900000000000000004', 'Late');
    chk('an expired code is refused', /expired/i.test(String(expired.content)), String(expired.content).slice(0, 60));

    // ── 5. ANONYMOUS CANNOT MINT WITHOUT AUTH AT ALL ────────────────────────────────────────
    const noAuth = await callable('generateDiscordLinkCode', null, {});
    chk('an unauthenticated caller cannot mint a code', !noAuth.ok, `http ${noAuth.status} ${String(noAuth.err || '').slice(0, 40)}`);

    // ── 6. THE DUPLICATE IMPLEMENTATION: do the two paths still agree? ──────────────────────
    const user3 = await identity();
    const gen3 = await callable('generateDiscordLinkCode', user3.idToken, {});
    const code3 = gen3.body.result.code;
    const viaCallable = await callable('verifyDiscordLinkCode', user3.idToken,
        { code: code3, discordId: '900000000000000005', discordUsername: 'ViaCallable' });
    chk('the unused verifyDiscordLinkCode callable still works', viaCallable.ok,
        viaCallable.ok ? 'ok' : String(viaCallable.err || '').slice(0, 60));
    const m2 = await db.collection('discord_links').doc('900000000000000005').get();
    chk('and it writes the SAME mapping shape as the /link handler',
        m2.exists && m2.data().uid === user3.localId && 'linkedAt' in m2.data(),
        m2.exists ? Object.keys(m2.data()).sort().join(',') : 'nothing written');
    const replayCallable = await callable('verifyDiscordLinkCode', user3.idToken,
        { code: code3, discordId: '900000000000000006', discordUsername: 'Again' });
    chk('and it refuses a replay too, like the handler', !replayCallable.ok,
        String(replayCallable.err || '').slice(0, 50));

    // ── 7. the codes collection must not be client-readable: it maps codes to uids ───────────
    const restBase = `http://${process.env.FIRESTORE_EMULATOR_HOST}/v1/projects/${PROJECT}/databases/(default)/documents`;
    const peek = await fetch(`${restBase}/discord_link_codes/${code3}`, { headers: { Authorization: `Bearer ${user.idToken}` } });
    chk('another student cannot read a link code document', peek.status === 403, `http ${peek.status}`);
    const peekLinks = await fetch(`${restBase}/discord_links/${DISCORD_ID}`, { headers: { Authorization: `Bearer ${user.idToken}` } });
    chk('and the link mapping is not client-readable either', peekLinks.status === 403, `http ${peekLinks.status}`);

    console.log(`\n${pass} passed, ${fail} failed`);
    process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('SUITE ERROR:', e); process.exit(2); });
