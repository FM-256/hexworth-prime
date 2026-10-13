#!/usr/bin/env node
/**
 * public-enrollment-guards.test.js
 *
 * @catalog what    Proves the two guards added after the 2026-10-11 exploit audit of the public
 * @catalog what    tournament-join surface: box credentials are refused on an UNGATED event that has
 * @catalog what    real machines wired, and resolveJoinCode throttles brute force. Invokes the REAL
 * @catalog what    callables against the Firestore emulator.
 * @catalog run     firebase emulators:exec --only firestore "node _tools/tournament/public-enrollment-guards.test.js"
 * @catalog status  TOOL
 *
 * WHY THESE TWO GUARDS EXIST
 * --------------------------
 * `_app/tournament-join.html` lets someone with no Hexworth account join a tournament: callsign,
 * anonymous sign-in, pick a team. An exploit audit then proved the feature was a front door onto a
 * live privilege escalation that predated it:
 *
 *     anonymous session -> ctfJoinTeam writes itself into members[] (no vetting, and no code at all
 *     when hasJoinCode is unset) -> ctfGetBoxCredential derives the team from members[].includes(uid)
 *     and hands that session the url, username and password of a REAL VM.
 *
 * Team ids are the platform's fixed preset (team-red .. team-cyan) published in unauthenticated
 * static HTML, `tournaments` is world-listable, and ENFORCE_APP_CHECK is false — so none of the
 * reconnaissance was hard either. 6 of 6 teams on the live active tournament had a box wired.
 *
 * It was NOT a rules leak: box_pool and the per-team assignments subdoc are admin-only, and an
 * audit confirmed even a legitimate member cannot read them directly. The escalation ran entirely
 * through the callable's identity model. That is exactly why "the rules say admin-only, so a joined
 * stranger only gets a roster entry" was the wrong conclusion — the rules were never the leak.
 *
 * GUARD 1 gates on the EVENT, not the user: if real machines are assigned, the event must have a
 * join code. Open events keep working for everything that is not infrastructure. The two
 * user-keyed alternatives were both worse — refusing anonymous callers breaks a pattern the
 * platform already uses (2 of the 3 competitors who have ever joined are anonymous), and requiring
 * a verified join silently locks everyone out of a legitimately open event, since an open event has
 * no code for anyone to have supplied.
 *
 * GUARD 2 throttles resolveJoinCode, measured at 60 unauthenticated guesses in 681ms with no
 * backoff over a 923,521-code space. It fails CLOSED, because failing open on a brute-force control
 * makes inducing limiter errors the attack.
 *
 * WHAT THIS FILE DOES NOT CLAIM. Guard 1 removes the zero-effort path, not every path: a correct
 * code still yields a credential, so cracking a code still works and guard 2 is what makes that
 * expensive. Neither guard addresses the registration-DoS (one actor, unlimited free anonymous
 * uids, 24 slots filled in 779ms) — that is open and tracked separately.
 *
 * Emulator discipline: `--only firestore` and `.run()` on the exported callables, never the
 * functions emulator, which loads functions/.env and has fired real Discord webhooks in this repo.
 */
const path = require('path');
const REPO = path.resolve(__dirname, '../..');

let pass = 0, fail = 0;
const chk = (name, cond, detail) => {
    if (cond) { pass++; console.log('    ok   ' + name); }
    else { fail++; console.log('    FAIL ' + name + (detail ? '  <- ' + detail : '')); }
};

async function main() {
    if (!process.env.FIRESTORE_EMULATOR_HOST) {
        console.error('  refusing to run: FIRESTORE_EMULATOR_HOST is not set.');
        console.error('  This test writes tournaments and reads credentials. Run it under');
        console.error('  firebase emulators:exec --only firestore, never against production.');
        return 2;
    }

    /* Belt and braces before loading anything: assert the wire cannot be reached. This test
       requires the FULL functions module, and a populated webhook URL is exactly how live Discord
       posts happened in this repo once already. */
    if (process.env.DISCORD_WEBHOOK_URL) {
        console.error('  refusing to run: DISCORD_WEBHOOK_URL is set and this test loads functions/index.js.');
        return 2;
    }
    /* Init order copied from join-badge.integration.test.js, which is the pattern that works:
       set the project env FIRST and let functions/index.js own initializeApp. Calling it here too
       throws "app named [DEFAULT] already exists with a different configuration". */
    process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || 'hexworth-guards-test';
    process.env.FIREBASE_CONFIG = process.env.FIREBASE_CONFIG
        || JSON.stringify({ projectId: process.env.GCLOUD_PROJECT });

    const admin = require(path.join(REPO, 'functions/node_modules/firebase-admin'));
    const fns = require(path.join(REPO, 'functions/index.js'));
    const db = admin.firestore();

    const TID = 'guards-test-tournament';
    const tRef = db.collection('tournaments').doc(TID);
    const ATTACKER = 'anon-squatter-guards-test';

    const wipe = async () => {
        for (const sub of ['teams', 'rosterLocks', 'private', 'challenges']) {
            const s = await tRef.collection(sub).get();
            for (const d of s.docs) {
                for (const inner of ['assignments']) {
                    const i = await d.ref.collection(inner).get();
                    await Promise.all(i.docs.map(x => x.ref.delete()));
                }
                await d.ref.delete();
            }
        }
        await tRef.delete().catch(() => {});
        const aw = await db.collection(`users/${ATTACKER}/server_awards`).get();
        await Promise.all(aw.docs.map(d => d.ref.delete()));
        await db.doc(`users/${ATTACKER}`).delete().catch(() => {});
    };

    // Anonymous caller: a token with NO name, which is what signInAnonymously actually produces.
    const anon = (fn, data) => fn.run({ data, auth: { uid: ATTACKER, token: {} }, rawRequest: { headers: {} } });

    const wireBox = async (teamId) => {
        await tRef.collection('teams').doc(teamId).collection('assignments').doc('ch-01').set({
            challengeId: 'ch-01',
            url: 'https://example-box.invalid/t/' + 'f'.repeat(32) + '/',
            username: 'player',
            password: 'TEST-ONLY-NOT-A-REAL-SECRET'
        });
    };

    try {
        // ── GUARD 1a: UNGATED event + real box wired => credential REFUSED ──────────────────────
        await wipe();
        await tRef.set({ name: 'Open Event With Boxes', status: 'lobby', maxTeamSize: 4 });
        await tRef.collection('teams').doc('team-blue').set({ name: 'Blue', members: [], memberNames: [], score: 0 });

        const j1 = await anon(fns.ctfJoinTeam, { tournamentId: TID, teamId: 'team-blue', callsign: 'Nobody' });
        chk('G1a an anonymous session still joins an open event (the feature is not broken)',
            j1 && j1.ok === true, JSON.stringify(j1));

        await wireBox('team-blue');
        await tRef.update({ status: 'active' });

        let refused = null;
        try {
            await anon(fns.ctfGetBoxCredential, { tournamentId: TID, challengeId: 'ch-01' });
        } catch (e) { refused = e; }
        chk('G1a THE ESCALATION IS CLOSED: no credential on an ungated event with machines wired',
            !!refused, 'the callable RETURNED a credential to an anonymous squatter');
        chk('G1a the refusal is failed-precondition and explains itself',
            refused && /failed-precondition/.test(String(refused.code || '')) && /join code/i.test(String(refused.message || '')),
            refused ? (refused.code + ': ' + refused.message) : 'n/a');

        /* ── GUARD 1b: THE NEGATIVE CONTROL, which is the half that makes 1a mean anything.
           A guard that refused everyone would pass 1a and be useless. A GATED event must still
           issue credentials to a member who supplied the code. */
        await wipe();
        await tRef.set({ name: 'Gated Event With Boxes', status: 'lobby', hasJoinCode: true, maxTeamSize: 4 });
        await tRef.collection('private').doc('config').set({ joinCode: 'HEX-TEST' });
        await tRef.collection('teams').doc('team-blue').set({ name: 'Blue', members: [], memberNames: [], score: 0 });

        const j2 = await anon(fns.ctfJoinTeam, { tournamentId: TID, teamId: 'team-blue', joinCode: 'HEX-TEST', callsign: 'Invited' });
        chk('G1b a coded join succeeds', j2 && j2.ok === true, JSON.stringify(j2));
        await wireBox('team-blue');
        await tRef.update({ status: 'active' });

        let cred = null, credErr = null;
        try { cred = await anon(fns.ctfGetBoxCredential, { tournamentId: TID, challengeId: 'ch-01' }); }
        catch (e) { credErr = e; }
        chk('G1b A GATED EVENT STILL ISSUES CREDENTIALS (the guard is not a blanket refusal)',
            !!(cred && cred.url), credErr ? (credErr.code + ': ' + credErr.message) : JSON.stringify(cred));

        /* ── GUARD 1d: A STALE ASSIGNMENT ON ANOTHER TEAM MUST NOT GATE THE WHOLE EVENT.
           My first guard ran before the team was derived and asked "does ANY team have an
           assignment", which Nancy pointed out gates a correctly-configured OPEN event for teams
           that never had a machine — one leftover subdoc from a deleted or test team is enough. The
           guard is now sited after the assignment lookup and scoped to the caller's own team. */
        await wipe();
        await tRef.set({ name: 'Open Event, Stale Assignment Elsewhere', status: 'active', maxTeamSize: 4 });
        await tRef.collection('teams').doc('team-red').set({ name: 'Red', members: [ATTACKER], memberNames: ['X'], score: 0 });
        await tRef.collection('teams').doc('team-gold').set({ name: 'Gold', members: [], memberNames: [], score: 0 });
        await wireBox('team-gold');          // a machine on a team the caller is NOT on
        let staleErr = null;
        try { await anon(fns.ctfGetBoxCredential, { tournamentId: TID, challengeId: 'ch-01' }); }
        catch (e) { staleErr = e; }
        chk('G1d a machine on ANOTHER team does not gate this caller (ordinary not-found, not the guard)',
            staleErr && /not-found/.test(String(staleErr.code || '')),
            staleErr ? (staleErr.code + ': ' + staleErr.message) : 'no error at all');

        /* ── GUARD 1c: an ungated event with NO boxes is untouched. The guard keys on machines being
           present, so a scoreboard-only open event must behave exactly as it did before. */
        await wipe();
        await tRef.set({ name: 'Open Event No Boxes', status: 'active', maxTeamSize: 4 });
        await tRef.collection('teams').doc('team-red').set({ name: 'Red', members: [ATTACKER], memberNames: ['X'], score: 0 });
        let noBoxErr = null;
        try { await anon(fns.ctfGetBoxCredential, { tournamentId: TID, challengeId: 'ch-01' }); }
        catch (e) { noBoxErr = e; }
        chk('G1c an ungated event with no machines fails on "no box assigned", NOT on the new guard',
            noBoxErr && /not-found/.test(String(noBoxErr.code || '')),
            noBoxErr ? (noBoxErr.code + ': ' + noBoxErr.message) : 'no error at all');

        // ── GUARD 2: resolveJoinCode throttles ─────────────────────────────────────────────────
        await wipe();
        let throttledAt = 0, lastErr = null;
        for (let i = 1; i <= 20; i++) {
            try {
                await fns.resolveJoinCode.run({
                    data: { code: 'HEX-Z' + String(i).padStart(3, '0') },
                    auth: null,
                    rawRequest: { headers: { 'x-forwarded-for': '203.0.113.7' } }
                });
            } catch (e) {
                lastErr = e;
                if (/resource-exhausted/.test(String(e.code || ''))) { throttledAt = i; break; }
            }
        }
        chk('G2 THE ORACLE IS THROTTLED: brute force is cut off inside 20 unauthenticated guesses',
            throttledAt > 0, 'ran 20 guesses with no resource-exhausted; last error was ' + (lastErr && lastErr.code));
        chk('G2 the throttle leaves room for a real person mistyping a projected code (>5 allowed)',
            throttledAt === 0 || throttledAt > 5, 'cut off after only ' + throttledAt + ' attempts');
        chk('G2 the refusal tells the caller what to do',
            !lastErr || /wait a minute|organiser/i.test(String(lastErr.message || '')),
            lastErr ? String(lastErr.message) : 'n/a');

        /* G2b: a DIFFERENT caller is not punished for the first one's behaviour. Buckets are keyed
           per caller, so a shared limit would turn one attacker into a denial of service against
           every legitimate joiner at the event — trading a brute-force hole for an outage. */
        let otherErr = null;
        try {
            await fns.resolveJoinCode.run({
                data: { code: 'HEX-Q001' },
                auth: null,
                rawRequest: { headers: { 'x-forwarded-for': '198.51.100.9' } }
            });
        } catch (e) { otherErr = e; }
        chk('G2b a different caller is NOT collaterally throttled',
            !otherErr || !/resource-exhausted/.test(String(otherErr.code || '')),
            otherErr ? (otherErr.code + ': ' + otherErr.message) : 'n/a');

        /* ── GUARD 2c: THE SPOOFING BYPASS NANCY DEMANDED A PROOF FOR ─────────────────────────
           My first limiter keyed on the LEFTMOST x-forwarded-for entry. Google's load balancer
           APPENDS, so a caller who sends their own header produces `<forged>, <real client>, <hop>`
           and the leftmost value is whatever the attacker chose. Rotating it per request put every
           attempt in a fresh bucket: not a weak limiter, no limiter at all, wearing the costume of
           one. The parse now takes the second-from-last entry — the one nearest the trusted hop —
           so everything to its left is discarded.

           This asserts the bypass is dead: 20 requests, each with a DIFFERENT forged left entry but
           the same real client behind it, must still get throttled. */
        await wipe();
        let spoofThrottled = 0;
        for (let i = 1; i <= 20; i++) {
            try {
                await fns.resolveJoinCode.run({
                    data: { code: 'HEX-S' + String(i).padStart(3, '0') },
                    auth: null,
                    rawRequest: { headers: { 'x-forwarded-for': `10.0.0.${i}, 203.0.113.44, 130.211.0.1` } }
                });
            } catch (e) {
                if (/resource-exhausted/.test(String(e.code || ''))) { spoofThrottled = i; break; }
            }
        }
        chk('G2c A ROTATING FORGED x-forwarded-for STILL LANDS IN ONE BUCKET (spoof bypass closed)',
            spoofThrottled > 0,
            'ran 20 requests with 20 different forged left-hand entries and was never throttled');

        await wipe();
    } catch (e) {
        console.error('\n  harness fault:', e && e.stack ? e.stack : e);
        return 2;
    }

    console.log(`\n  ${pass}/${pass + fail} assertions passed`);
    return fail ? 1 : 0;
}

main().then(c => process.exit(c)).catch(e => {
    console.error('  public-enrollment-guards.test could not run:', e && e.message);
    process.exit(2);
});
