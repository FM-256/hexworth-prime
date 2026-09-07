/**
 * audit-gate-achievement-backing.js
 *
 * @catalog what    READ-ONLY. For every user claiming a gate achievement, checks whether the real
 * @catalog what    users/{uid}/gates ledger backs it, and splits the unbacked ones into LEGACY
 * @catalog what    (account predates the ledger) vs SUSPECT (ledger existed, entry missing).
 * @catalog run     node functions/audit-gate-achievement-backing.js
 * @catalog status  TOOL
 *
 * WHY THIS EXISTS
 * ---------------
 * BUG-264 (taskboard 355). `deriveXP` grants 500 XP per `gate_N`/`dark_arts_gateN` string found in
 * the `achievements` array — an array the client could write directly until BUG-263, and which two
 * callables (`syncProgress`, `recordProgress`) still accept from their caller unvalidated. It never
 * consults `users/{uid}/gates`, the ledger `completeGate` actually writes.
 *
 * The panel's fix is to point deriveXP's gate term at that ledger. Nancy attached the condition
 * that makes this script necessary: DO NOT FLIP IT BLIND. An exploit auditor measured 17 accounts
 * claiming gate achievements with no matching ledger doc. If those are forgeries, repointing
 * deriveXP corrects them. If they are OUR OWN HISTORY, repointing deriveXP silently deletes real
 * earned XP from real students — the exact harm the capture-first redirect exists to prevent.
 * Nobody can tell which from the claim alone. That is what this measures.
 *
 * THE DISCRIMINATOR, and why it is defensible.
 * `completeGate` began writing users/{uid}/gates on 2026-02-20 (commit a17a4afbe, "Security
 * hardening: server-side gate validation"). An account created BEFORE that date could have earned a
 * gate honestly and left no ledger entry, because the ledger did not exist yet. An account created
 * AFTER it had the ledger available the whole time, so a missing entry is not explained by history.
 * That is evidence, not proof — a legacy account could also have been forged later — so this
 * reports the split and does not pronounce a verdict on any individual.
 *
 * READ-ONLY BY CONSTRUCTION. No set/update/delete anywhere in this file. Prints SHAPE ONLY:
 * counts and XP totals, never a uid, email, callsign or any other identifier.
 */
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({ projectId: 'hexworth-prime' });
const db = getFirestore();

// The commit that introduced users/{uid}/gates. Before this, absence of a doc proves nothing.
const LEDGER_EPOCH = new Date('2026-02-20T00:00:00Z');
// deriveXP's own pattern, kept in sync with functions/index.js:1421-1428.
const GATE_RE = /^(gate_\d+|dark_arts_gate\d+)$/;
const XP_PER_GATE = 500;

const gateNum = (a) => {
    const m = String(a).match(/(\d+)$/);
    return m ? m[1] : null;
};

(async () => {
    const users = await db.collection('users').get();
    const out = {
        scanned: users.size,
        claimAnyGate: 0,
        fullyBacked: 0,
        partiallyBacked: 0,
        zeroBacked: 0,
        legacyAccounts: 0,          // created before the ledger existed
        suspectAccounts: 0,         // created after, so history does not explain it
        unknownCreatedAt: 0,
        unbackedClaims: 0,
        xpAtStake: 0,
        verifiedTrue: 0,
        clientAttested: 0,
    };

    for (const doc of users.docs) {
        const d = doc.data() || {};
        const claims = (Array.isArray(d.achievements) ? d.achievements : []).filter(a => GATE_RE.test(a));
        if (!claims.length) continue;
        out.claimAnyGate++;

        // The authoritative ledger for this user.
        const ledger = await doc.ref.collection('gates').get();
        const have = new Set();
        ledger.forEach(g => {
            if (g.id.startsWith('_')) return;            // _merge_log / _reset_log are not completions
            have.add(g.id.replace(/^gate/, ''));
            const gd = g.data() || {};
            if (gd.verified === true) out.verifiedTrue++;
            if (gd.source === 'client-attested') out.clientAttested++;
        });

        let backed = 0;
        for (const c of claims) {
            const n = gateNum(c);
            if (n && have.has(n)) backed++;
        }
        const unbacked = claims.length - backed;
        out.unbackedClaims += unbacked;
        out.xpAtStake += unbacked * XP_PER_GATE;

        if (unbacked === 0) out.fullyBacked++;
        else if (backed > 0) out.partiallyBacked++;
        else out.zeroBacked++;

        if (unbacked > 0) {
            // createdAt may be a Timestamp, an ISO string, or absent on older docs.
            const raw = d.createdAt;
            let created = null;
            if (raw && typeof raw.toDate === 'function') created = raw.toDate();
            else if (typeof raw === 'string') { const p = new Date(raw); if (!isNaN(p)) created = p; }

            if (!created) out.unknownCreatedAt++;
            else if (created < LEDGER_EPOCH) out.legacyAccounts++;
            else out.suspectAccounts++;
        }
    }

    console.log('\n  audit-gate-achievement-backing — READ ONLY, shape only\n');
    console.log(`  users scanned                     ${out.scanned}`);
    console.log(`  claiming >=1 gate achievement     ${out.claimAnyGate}`);
    console.log(`    fully backed by the ledger      ${out.fullyBacked}`);
    console.log(`    partially backed                ${out.partiallyBacked}`);
    console.log(`    zero backing                    ${out.zeroBacked}`);
    console.log(`  unbacked claims (total)           ${out.unbackedClaims}`);
    console.log(`  XP at stake if deriveXP repoints  ${out.xpAtStake}`);
    console.log('\n  OF THE ACCOUNTS WITH UNBACKED CLAIMS:');
    console.log(`    LEGACY  (created before ${LEDGER_EPOCH.toISOString().slice(0,10)})   ${out.legacyAccounts}`);
    console.log(`    SUSPECT (created after, ledger existed)  ${out.suspectAccounts}`);
    console.log(`    createdAt missing/unparseable           ${out.unknownCreatedAt}`);
    console.log('\n  LEDGER PROVENANCE ACROSS ALL GATE DOCS SEEN:');
    console.log(`    verified: true                  ${out.verifiedTrue}`);
    console.log(`    source: client-attested         ${out.clientAttested}`);
    console.log('\n  LEGACY is an EXPLANATION, not an acquittal: an old account could still have');
    console.log('  been forged later. SUSPECT is not a conviction either. This sizes the problem');
    console.log('  so the deriveXP repoint can be made without deleting real earned XP.\n');
    process.exit(0);
})().catch(e => {
    console.error('  audit failed, nothing measured:', e && e.message);
    process.exit(2);
});
