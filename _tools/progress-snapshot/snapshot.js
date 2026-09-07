#!/usr/bin/env node
/**
 * snapshot.js — progress snapshot and diff
 *
 * @catalog what    Snapshots every user's progress fields to a timestamped JSON, and diffs two
 * @catalog what    snapshots to show exactly what a change gained, lost or altered. Read-only.
 * @catalog run     node _tools/progress-snapshot/snapshot.js snapshot
 * @catalog run     node _tools/progress-snapshot/snapshot.js diff <before.json> <after.json>
 * @catalog status  TOOL
 *
 * WHY THIS EXISTS
 * ---------------
 * There is NO Firestore backup or export configured for this project — seven scheduled functions
 * and not one of them is a backup. That was discovered while weighing a fix to `deriveXP` that
 * would have deleted roughly 51,000 XP across 17 students. A 4-0 panel vote approved that change;
 * only a read-only reconciliation caught it. Had it shipped there would have been nothing to
 * restore from.
 *
 * The operator's point, which is the correct one: we do not need point-in-time recovery to be
 * safe. Snapshot before, apply the change, diff after, and re-inject only what was lost.
 *
 * TWO TRAPS THIS TOOL IS SHAPED AROUND
 * ------------------------------------
 * 1. THE WINDOW. A snapshot is a point in time and students keep working. A blind restore would
 *    clobber progress earned between snapshot and fix. So `diff` reports LOST and GAINED
 *    separately and never proposes overwriting a value that grew. Any restore built on this must
 *    be a MONOTONIC MERGE — restore what is missing, never overwrite what is newer. That is the
 *    same primitive the codebase already uses at users/{uid}/sync/localStorage: "deep merge per
 *    key: preserves completion monotonicity (a sparse device can't overwrite a full device's
 *    progress)".
 * 2. RESTORING THE FORGERIES. A pre-fix snapshot faithfully contains forged progress. A blind
 *    diff-and-restore would put it straight back and undo the fix it exists to protect. So diff
 *    flags accounts holding gate achievements with no backing ledger entry (the BUG-264 signature,
 *    17 accounts / 102 claims measured 2026-09-06) as REVIEW rather than folding them into LOST.
 *
 * SNAPSHOTS CONTAIN STUDENT UIDs. They are written under `_tools/`, which is gitignored
 * (.gitignore:48), so an accidental `git add -A` cannot commit them. STDOUT is shape only —
 * counts and totals, never a uid, email or callsign.
 *
 * THIS FILE NEVER WRITES TO FIRESTORE. Restore is deliberately a separate, explicitly authorized
 * step: snapshotting and diffing are safe, re-injecting student records is not.
 */
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, 'snapshots');
// Exactly the fields deriveXP consumes or produces, plus createdAt for legacy/suspect context.
const FIELDS = ['xp', 'level', 'modulesCompleted', 'labsCompleted', 'achievements', 'quizzes',
                'streak', 'gamesPlayed', 'createdAt'];
const GATE_RE = /^(gate_\d+|dark_arts_gate\d+)$/;

const iso = (v) => {
    if (!v) return null;
    if (typeof v.toDate === 'function') { try { return v.toDate().toISOString(); } catch (e) { return null; } }
    if (typeof v === 'string') return v;
    return null;
};
/* Compare array entries BY VALUE, never by reference. An achievements array can contain OBJECTS,
   not only strings -- a real account holds four of them -- and two separately parsed JSON objects
   are never ===, so a Set of them reports every entry as missing from the other snapshot. That
   produced a phantom "lost 4 items" on an account whose XP was identical before and after
   (5200 -> 5200). A safety tool that cries wolf is worse than none: this one exists to decide
   whether to RESTORE student records, and a false loss could trigger a spurious write. */
const key = (v) => (typeof v === 'string' ? v : JSON.stringify(v));
const arr = (v) => (Array.isArray(v) ? v.map(key).sort() : []);
const setOf = (v) => new Set(arr(v));
/* Trailing digits, and NOTHING else. Used on BOTH sides of the gate comparison in diff() so a
   ledger doc id (`gate3`) and an achievement string (`gate_3`, `dark_arts_gate3`) normalise to
   the same key. Same helper as functions/audit-gate-achievement-backing.js. */
const gateNum = (s) => (String(s).match(/(\d+)$/) || [])[1] || '';

async function snapshot() {
    const { initializeApp } = require('firebase-admin/app');
    const { getFirestore } = require('firebase-admin/firestore');
    initializeApp({ projectId: 'hexworth-prime' });
    const db = getFirestore();

    const users = await db.collection('users').get();
    const rows = {};
    let xpTotal = 0, withAny = 0;

    for (const doc of users.docs) {
        const d = doc.data() || {};
        const rec = {};
        for (const f of FIELDS) {
            if (f === 'createdAt') { rec.createdAt = iso(d.createdAt); continue; }
            if (f === 'quizzes') { rec.quizzes = (d.quizzes && typeof d.quizzes === 'object') ? d.quizzes : {}; continue; }
            if (['modulesCompleted', 'labsCompleted', 'achievements'].includes(f)) { rec[f] = arr(d[f]); continue; }
            rec[f] = typeof d[f] === 'number' ? d[f] : 0;
        }
        // The gates ledger, so a later restore can tell a real completion from a claimed one.
        const ledger = await doc.ref.collection('gates').get();
        rec.gatesLedger = ledger.docs.filter(g => !g.id.startsWith('_')).map(g => g.id).sort();

        rows[doc.id] = rec;
        xpTotal += rec.xp;
        if (rec.xp || rec.modulesCompleted.length || rec.labsCompleted.length ||
            rec.achievements.length || Object.keys(rec.quizzes).length) withAny++;
    }

    fs.mkdirSync(OUT_DIR, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const file = path.join(OUT_DIR, `progress-${stamp}.json`);
    fs.writeFileSync(file, JSON.stringify({ takenAt: new Date().toISOString(), users: rows }, null, 1));

    console.log('\n  progress snapshot — READ ONLY, stdout is shape only\n');
    console.log(`  users captured          ${users.size}`);
    console.log(`  with any progress       ${withAny}`);
    console.log(`  total XP across all     ${xpTotal}`);
    console.log(`  written to              ${path.relative(process.cwd(), file)}`);
    console.log('\n  Contains student UIDs. _tools/ is gitignored, so this cannot be committed');
    console.log('  by accident. Do not move it into a tracked directory.\n');
}

function diff(beforePath, afterPath) {
    const B = JSON.parse(fs.readFileSync(beforePath, 'utf8'));
    const A = JSON.parse(fs.readFileSync(afterPath, 'utf8'));
    const out = { lost: 0, gained: 0, xpDown: 0, xpUp: 0, xpLostTotal: 0, review: 0, vanished: 0, unchanged: 0 };

    for (const [uid, b] of Object.entries(B.users)) {
        const a = A.users[uid];
        if (!a) { out.vanished++; continue; }

        /* A gate achievement with no backing ledger entry is the BUG-264 signature. If such an
           account loses progress, that may be the FIX WORKING, not damage. Never auto-restore it.

           BOTH SIDES NORMALISE THE SAME WAY, via gateNum(). They did not originally: the ledger
           side stripped a literal `gate` prefix while the achievement side stripped non-digits.
           That happens to match for today's doc ids (`gate3` -> `3`, and `gate_3` -> `3`), but it
           silently depends on a ledger id never containing an underscore. If that ever drifted,
           every comparison would fail, EVERY account would be classified REVIEW, the restore
           candidate set would be empty, and an operator would read real data loss as the fix
           working -- the exact outcome this tool exists to prevent. Comparing trailing digits on
           both sides cannot drift that way. */
        const ledger = new Set((b.gatesLedger || []).map(gateNum).filter(Boolean));
        const unbackedGate = (b.achievements || []).some(x =>
            GATE_RE.test(x) && !ledger.has(gateNum(x)));

        let lost = false, gained = false;
        for (const f of ['modulesCompleted', 'labsCompleted', 'achievements']) {
            const bs = setOf(b[f]), as = setOf(a[f]);
            for (const v of bs) if (!as.has(v)) lost = true;
            for (const v of as) if (!bs.has(v)) gained = true;
        }
        for (const q of Object.keys(b.quizzes || {})) if (!(q in (a.quizzes || {}))) lost = true;

        if (a.xp < b.xp) { out.xpDown++; out.xpLostTotal += (b.xp - a.xp); }
        if (a.xp > b.xp) out.xpUp++;

        if (unbackedGate && (lost || a.xp < b.xp)) out.review++;
        else if (lost) out.lost++;
        else if (gained) out.gained++;
        else out.unchanged++;
    }

    console.log('\n  progress diff\n');
    console.log(`  before  ${B.takenAt}   (${Object.keys(B.users).length} users)`);
    console.log(`  after   ${A.takenAt}   (${Object.keys(A.users).length} users)`);
    console.log(`\n  LOST     accounts that lost items and are NOT forgery-flagged   ${out.lost}`);
    console.log(`  REVIEW   lost items BUT hold unbacked gate claims (fix working?)  ${out.review}`);
    console.log(`  GAINED   accounts that only gained (the window — do not revert)   ${out.gained}`);
    console.log(`  UNCHANGED                                                         ${out.unchanged}`);
    console.log(`  VANISHED user doc absent after                                    ${out.vanished}`);
    console.log(`\n  xp decreased on ${out.xpDown} accounts, total XP lost ${out.xpLostTotal}`);
    console.log(`  xp increased on ${out.xpUp} accounts`);
    console.log('\n  LOST is the restore candidate set. REVIEW is NOT — those are the accounts the');
    console.log('  fix was meant to correct, and auto-restoring them would reinstate the forgery.\n');
}

const [, , cmd, a, b] = process.argv;
if (cmd === 'snapshot') {
    snapshot().then(() => process.exit(0)).catch(e => { console.error('  snapshot failed:', e && e.message); process.exit(2); });
} else if (cmd === 'diff' && a && b) {
    try { diff(a, b); process.exit(0); } catch (e) { console.error('  diff failed:', e && e.message); process.exit(2); }
} else {
    console.error('usage: snapshot.js snapshot | diff <before.json> <after.json>');
    process.exit(2);
}
