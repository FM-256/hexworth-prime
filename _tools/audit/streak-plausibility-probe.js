#!/usr/bin/env node
/**
 * streak-plausibility-probe.js: how inflated are stored streaks, and how old are accounts?
 *
 * @catalog what    Read-only production counts behind the task-367 streak bound: how many users
 * @catalog what    hold a streak above each threshold, and how many accounts are old enough that
 * @catalog what    the account-age bound no longer constrains them (older than the 365-day XP cap).
 * @catalog run     node _tools/audit/streak-plausibility-probe.js
 * @catalog status  PROBE
 *
 * WHY THIS EXISTS RATHER THAN A THROWAWAY QUERY
 * ---------------------------------------------
 * The task-367 fix bounds a client-supplied `streak` by the account's Firebase Auth creation time.
 * Two numbers were used to argue it was safe to ship: that nothing currently stored exceeds the
 * 365-day XP cap (so there is no forged data to reconcile), and that the bound's decay past one
 * year is not yet reachable. A reviewer pointed out that both were asserted in prose with no
 * citable source, against two standing rules here: a count in prose is stale on arrival, and
 * measure the claim rather than a proxy. So the measurement is a script.
 *
 * WHAT THE NUMBERS MEAN
 *   streak > 365   anything here is XP-inert (deriveXP stops paying at 365) and a candidate for
 *                  reconciliation. Expected: 0. Non-zero means investigate before trusting XP.
 *   accounts older than 365 days   the population for whom the age bound no longer constrains a
 *                  claim, because maxPlausible already exceeds the cap deriveXP enforces anyway.
 *                  Expected today: 0. As this grows, revisit with a rate-of-change bound
 *                  (a `streakUpdatedAt` field) rather than a larger age multiplier.
 *
 * READ-ONLY. Aggregation counts only. No documents are fetched, so no PII is read or printed.
 *
 * EXIT: 0 ran, 2 could not run.
 */
'use strict';
const { execSync } = require('child_process');

const PROJECT = 'hexworth-prime';

function agg(filterJson) {
    const token = execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim();
    const body = JSON.stringify({
        structuredAggregationQuery: {
            structuredQuery: { from: [{ collectionId: 'users' }], where: filterJson },
            aggregations: [{ alias: 'c', count: {} }],
        },
    });
    const out = execSync(
        `curl -s -X POST -H "Authorization: Bearer ${token}" -H "X-Goog-User-Project: ${PROJECT}" ` +
        `-H "Content-Type: application/json" ` +
        `"https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents:runAggregationQuery" ` +
        `-d '${body.replace(/'/g, "'\\''")}'`,
        { encoding: 'utf8', maxBuffer: 1 << 22 });
    return parseInt(JSON.parse(out)[0].result.aggregateFields.c.integerValue, 10);
}

function main() {
    console.log(`  streak plausibility probe, project ${PROJECT}, ${new Date().toISOString()}\n`);

    console.log('  stored streak distribution:');
    for (const t of [0, 30, 100, 365, 1000]) {
        const n = agg({ fieldFilter: { field: { fieldPath: 'streak' }, op: 'GREATER_THAN',
                                       value: { integerValue: String(t) } } });
        const flag = (t >= 365 && n > 0) ? '   <-- ABOVE THE XP CAP, investigate' : '';
        console.log(`    streak > ${String(t).padEnd(5)} ${String(n).padStart(5)} user(s)${flag}`);
    }

    /* Accounts older than the 365-day cap. Measured on the Firestore `createdAt` field, which is
       NOT a trust anchor (it is client-writable on create, which is exactly why the fix itself
       anchors on Firebase Auth instead). It is fine for a population estimate: a forged value skews
       this count, it does not weaken the bound. */
    const cutoff = new Date(Date.now() - 365 * 86400000).toISOString();
    const older = agg({ fieldFilter: { field: { fieldPath: 'createdAt' }, op: 'LESS_THAN',
                                       value: { timestampValue: cutoff } } });
    console.log(`\n  accounts with createdAt older than 365d (bound no longer constrains): ${older}`);
    console.log('    (estimate only: createdAt is client-writable on create, hence the Auth anchor)');
    return 0;
}

try { process.exit(main()); }
catch (e) { console.error('  streak-plausibility-probe could not run:', e && e.message); process.exit(2); }
