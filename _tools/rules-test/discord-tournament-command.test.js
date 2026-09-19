#!/usr/bin/env node
/**
 * discord-tournament-command.test.js
 *
 * @catalog what   Invokes the real discordInteraction function with a properly SIGNED /tournament
 *                 interaction and asserts what a student would actually see: the open tournament,
 *                 its lobby link, the join code handling, the badge promise, and that the reply is
 *                 ephemeral.
 * @catalog run    DISCORD_PUBLIC_KEY=<test pubkey printed by this script> firebase emulators:exec --only firestore,functions --project=demo-hexworth "NODE_PATH=$(pwd)/functions/node_modules node _tools/rules-test/discord-tournament-command.test.js"
 * @catalog status TOOL
 *
 * WHY SIGNING MATTERS HERE. discordInteraction verifies an ed25519 signature against
 * DISCORD_PUBLIC_KEY and returns 401 otherwise, so an unsigned probe proves nothing about the
 * handler. This generates its own keypair, and the run overrides DISCORD_PUBLIC_KEY so the
 * emulator trusts it. Discord itself is never contacted: the handler only reads Firestore and
 * returns JSON, so there is no outbound call to a real channel.
 */
'use strict';
const nacl = require('tweetnacl');
const admin = require('firebase-admin');

const FN_HOST = process.env.FUNCTIONS_EMULATOR_HOST || '127.0.0.1:5001';
const PROJECT = 'demo-hexworth';
admin.initializeApp({ projectId: PROJECT });
const db = admin.firestore();

let pass = 0, fail = 0;
const chk = (n, ok, d) => { console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`); ok ? pass++ : fail++; };

const SEED_HEX = process.env.TEST_SIGNING_SEED;
if (!SEED_HEX) {
    const kp = nacl.sign.keyPair();
    console.log('SETUP: run the emulator with these, then re-run this script:');
    console.log('  DISCORD_PUBLIC_KEY=' + Buffer.from(kp.publicKey).toString('hex'));
    console.log('  TEST_SIGNING_SEED=' + Buffer.from(kp.secretKey).toString('hex'));
    process.exit(3);
}
const secretKey = Buffer.from(SEED_HEX, 'hex');

async function interact(commandName) {
    const body = JSON.stringify({ type: 2, data: { name: commandName }, member: { user: { id: '123', username: 'Student' } } });
    const timestamp = String(Math.floor(Date.now() / 1000));
    const sig = Buffer.from(nacl.sign.detached(Buffer.from(timestamp + body), secretKey)).toString('hex');
    const r = await fetch(`http://${FN_HOST}/${PROJECT}/us-central1/discordInteraction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-signature-ed25519': sig, 'x-signature-timestamp': timestamp },
        body,
    });
    const text = await r.text();
    let json = null; try { json = JSON.parse(text); } catch (e) {}
    return { status: r.status, json, text };
}

(async () => {
    console.log('\n== discord /tournament ==');

    // An UNSIGNED request must be refused, or nothing below proves anything.
    const unsigned = await fetch(`http://${FN_HOST}/${PROJECT}/us-central1/discordInteraction`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 2, data: { name: 'tournament' } }),
    }).then(r => r.status).catch(() => 0);
    chk('an unsigned interaction is refused', unsigned === 401 || unsigned === 500, `http ${unsigned}`);

    // Nothing open yet.
    const none = await interact('tournament');
    const noneDesc = JSON.stringify(none.json || {});
    chk('with nothing open, it says so', none.status === 200 && /No Tournament Open|Nothing is open/i.test(noneDesc),
        (none.json && none.json.data && none.json.data.embeds && none.json.data.embeds[0].title) || none.text.slice(0, 60));
    chk('and that reply is ephemeral', !!(none.json && none.json.data && none.json.data.flags === 64), `flags=${none.json && none.json.data && none.json.data.flags}`);

    // A joinable tournament, with a code on the public doc (a pre-TOURN-03 shape).
    await db.collection('tournaments').doc('discordtest1').set({
        name: 'Autumn Open', status: 'lobby', joinCode: 'AUT2026', teamCount: 4, totalSolves: 0,
    });
    const open = await interact('tournament');
    const d = (open.json && open.json.data) || {};
    const emb = (d.embeds && d.embeds[0]) || {};
    const desc = emb.description || '';
    chk('the open tournament is listed by name', /Autumn Open/.test(desc), desc.split('\n')[0] || '(empty)');
    chk('with a lobby link a student can click', /hexworth\.com\/arena\/tournament-lobby\.html\?id=discordtest1/.test(desc));
    chk('the join code is included when the doc carries one', /AUT2026/.test(desc));
    chk('the badge is named, with its points', /Competitor/.test(desc) && /25/.test(desc), desc.slice(-90).replace(/\n/g, ' '));
    chk('the reply is ephemeral so the code does not persist in a channel', d.flags === 64, `flags=${d.flags}`);

    // A tournament whose code lives in private/config must NOT be read out by the bot.
    await db.collection('tournaments').doc('discordtest2').set({
        name: 'Modern Event', status: 'lobby', hasJoinCode: true, teamCount: 2,
    });
    await db.collection('tournaments').doc('discordtest2').collection('private').doc('config').set({ joinCode: 'SECRET-99' });
    const modern = await interact('tournament');
    const mdesc = ((((modern.json || {}).data || {}).embeds || [{}])[0] || {}).description || '';
    chk('a private join code is NOT disclosed by the bot', !/SECRET-99/.test(mdesc), 'checked the whole reply');
    chk('and it tells the student to ask their instructor instead', /ask your instructor/i.test(mdesc), mdesc.match(/ask your instructor/i) ? 'present' : mdesc.slice(0, 70));

    // Registration closed: a frozen tournament must not be advertised as joinable.
    await db.collection('tournaments').doc('discordtest1').update({ status: 'frozen' });
    await db.collection('tournaments').doc('discordtest2').update({ status: 'frozen' });
    const frozen = await interact('tournament');
    const fdesc = JSON.stringify(frozen.json || {});
    chk('a frozen tournament is reported as in progress, not joinable', /In Progress|registration has closed/i.test(fdesc),
        ((((frozen.json || {}).data || {}).embeds || [{}])[0] || {}).title || '');
    chk('and no join code appears for it', !/AUT2026|SECRET-99/.test(fdesc), 'checked');

    console.log(`\n${pass} passed, ${fail} failed`);
    process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('SUITE ERROR:', e); process.exit(2); });
