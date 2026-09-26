#!/usr/bin/env node
'use strict';
/**
 * repair-roster.js
 *
 * @catalog what   Repairs a tournament's roster: adds locked-but-missing members, rebuilds
 *                 memberNames index-aligned and non-identifying, and corrects teamCount
 * @catalog run    node _tools/tournament/repair-roster.js --tournament <id> [--write]
 * @catalog status TOOL
 *
 * WHY (taskboard 420). On the live tournament rosterLocks named three users and members[] listed one.
 * ctfSubmitFlag resolves a team from members.includes(uid), so the two missing users could not score,
 * and ctfJoinTeam's idempotent branch meant re-joining could never repair it. The code defect is fixed
 * separately; this repairs the data that defect already produced.
 *
 * rosterLocks IS THE AUTHORITY for who joined, and that is the whole reason this is safe to automate.
 * A lock is written only by ctfJoinTeam, inside the transaction that adds the member, so a lock without
 * a members entry is unambiguous evidence of a half-applied join rather than a guess about intent. The
 * repair adds to members[]; it never removes anyone, and it never invents a lock.
 *
 * memberNames is rebuilt rather than patched, index-aligned to members, using
 * callsign > displayName > a hash-derived Player-xxxx placeholder. It is NOT a cosmetic change:
 * teams/{teamId} is `allow read: if true` for the podium, and the old resolver could publish a uid or
 * an email there. Rebuilding is what removes the two UID-shaped entries already live.
 *
 * DRY RUN BY DEFAULT. Prints exactly what would change and writes nothing without --write. Identities
 * are redacted in output: this repairs a privacy leak, so it must not restate one.
 */
const crypto = require('crypto');
const admin = require('firebase-admin');

const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const TID = arg('--tournament');
const WRITE = process.argv.includes('--write');
if (!TID) { console.error('usage: --tournament <id> [--write]'); process.exit(2); }

admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
const red = (s) => { const t = String(s || ''); return t ? t.slice(0, 2) + '***' : '(none)'; };
const placeholder = (uid) => 'Player-' + crypto.createHash('sha256').update(String(uid)).digest('hex').slice(0, 4);

async function displayName(uid) {
    const u = await db.doc(`users/${uid}`).get();
    if (u.exists) {
        const d = u.data();
        if (d.callsign) return { name: d.callsign, src: 'callsign' };
        if (d.displayName) return { name: d.displayName, src: 'displayName' };
    }
    return { name: placeholder(uid), src: 'placeholder' };
}

(async () => {
    const tRef = db.doc(`tournaments/${TID}`);
    const t = await tRef.get();
    if (!t.exists) { console.error(`tournament ${TID} not found`); process.exit(1); }
    console.log(`tournament: ${t.get('name')}  status=${t.get('status')}  teamCount=${JSON.stringify(t.get('teamCount'))}`);

    const teams = await db.collection(`tournaments/${TID}/teams`).get();
    const locks = await db.collection(`tournaments/${TID}/rosterLocks`).get();
    const lockTeam = new Map();
    locks.forEach(d => lockTeam.set(d.id, d.get('teamId')));
    console.log(`teams=${teams.size}  rosterLocks=${locks.size}\n`);

    const plan = [];
    for (const d of teams.docs) {
        const members = Array.isArray(d.get('members')) ? d.get('members').slice() : [];
        const namesBefore = Array.isArray(d.get('memberNames')) ? d.get('memberNames') : [];
        // Locked to THIS team but absent from members: a half-applied join, added back.
        const add = [...lockTeam.entries()].filter(([u, tm]) => tm === d.id && !members.includes(u)).map(([u]) => u);
        const after = members.concat(add);
        const names = [];
        const srcs = [];
        for (const uid of after) { const r = await displayName(uid); names.push(r.name); srcs.push(r.src); }
        const nameChange = JSON.stringify(namesBefore) !== JSON.stringify(names);
        if (add.length || nameChange) {
            plan.push({ ref: d.ref, id: d.id, label: d.get('name') || d.id, add, after, names, srcs, namesBefore });
        }
        const flag = add.length ? ' ADD-MEMBER' : '';
        console.log(`${d.id.padEnd(12)} members ${members.length} -> ${after.length}${flag}`);
        if (add.length) console.log(`   adding (locked to this team, absent from members): ${add.map(red).join(', ')}`);
        if (nameChange) {
            console.log(`   memberNames ${namesBefore.length} -> ${names.length}  sources: ${srcs.join(', ') || '(none)'}`);
            const exposing = namesBefore.filter(n => /^[A-Za-z0-9]{28}$/.test(String(n)) || String(n).includes('@')).length;
            if (exposing) console.log(`   REMOVES ${exposing} identifier-shaped entr(ies) from a world-readable document`);
        }
    }

    const needCount = t.get('teamCount') !== teams.size;
    if (needCount) console.log(`\nteamCount ${JSON.stringify(t.get('teamCount'))} -> ${teams.size}`);
    if (!plan.length && !needCount) { console.log('\nNothing to repair.'); process.exit(0); }
    if (!WRITE) { console.log('\nDRY RUN. Nothing written. Re-run with --write.'); process.exit(0); }

    await db.runTransaction(async (tx) => {
        /* Re-read every document being written INSIDE the transaction, so a concurrent join or leave
         * between the plan and the commit aborts this instead of overwriting it. members[] is the field
         * that decides who can score; clobbering a live join would create the very problem being fixed. */
        for (const p of plan) {
            const live = await tx.get(p.ref);
            const liveMembers = Array.isArray(live.get('members')) ? live.get('members') : [];
            const planned = p.after.filter(u => !p.add.includes(u));
            if (JSON.stringify(liveMembers) !== JSON.stringify(planned)) {
                throw new Error(`${p.id}: members[] changed between plan and commit. Nothing written.`);
            }
        }
        for (const p of plan) tx.update(p.ref, { members: p.after, memberNames: p.names });
        if (needCount) tx.update(tRef, { teamCount: teams.size });
    });

    /* Verify by reading the documents back, not by the write returning. */
    let ok = true;
    for (const p of plan) {
        const after = await p.ref.get();
        const m = after.get('members') || [], n = after.get('memberNames') || [];
        const aligned = m.length === n.length;
        const clean = !n.some(x => /^[A-Za-z0-9]{28}$/.test(String(x)) || String(x).includes('@'));
        if (!aligned || !clean || m.length !== p.after.length) ok = false;
        console.log(`  ${p.id.padEnd(12)} members=${m.length} names=${n.length} aligned=${aligned} no-identifiers=${clean}`);
    }
    const tc = (await tRef.get()).get('teamCount');
    console.log(`  teamCount=${tc} (collection holds ${teams.size})`);
    process.exit(ok && tc === teams.size ? 0 : 1);
})().catch(e => { console.error('FAILED, nothing partial (single transaction):', e.message); process.exit(1); });
