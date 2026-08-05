#!/usr/bin/env node
/**
 * migrate-dispatch-aliases.js — give every scenario-style box the alias map it is missing.
 *
 * WHY
 *   A box like ad001-lockout-storm stores five accepted scenario flags (brute_force,
 *   gpo_misconfig, ...) that all represent ONE achievement, and collapses them onto the
 *   single flag id its config declares ('fixed') via an `aliases` map. validateFlag resolves
 *   through that map before writing the capture, so a student produces exactly one capture
 *   doc however they solved it.
 *
 *   91 boxes have the scenario flags but NO alias map. Submissions still succeed — matching
 *   is on flag VALUE, not id — but each capture lands under a different scenario id, while
 *   _recomputeCtfStats derives the completion threshold from the count of distinct CANONICAL
 *   ids. So a one-achievement box demands five captures and can never be marked pwned. This
 *   is why students who fully solved nt1-network-troubleshoot were shown 1/5.
 *
 * WHAT IT DOES
 *   For each affected box: aliases = { every registry flag key -> the box config's single
 *   declared flag id }, written with merge so nothing else on the doc is touched.
 *
 * SAFETY
 *   - Refuses any box whose config declares more than one flag id — that is not a simple
 *     collapse and must be decided by a human. (Measured: zero such boxes today.)
 *   - Refuses to touch a box that already has an alias map.
 *   - Archives every prior doc state before writing.
 *   - --dry-run (default) writes nothing.
 *
 * USAGE
 *   node functions/migrate-dispatch-aliases.js            # dry run
 *   node functions/migrate-dispatch-aliases.js --apply
 */
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

const APPLY = process.argv.includes('--apply');
const CtfBoxValidator = require('../_tools/eduscan/validators/functional/ctf-boxes');
const validator = new CtfBoxValidator({ appRoot: path.join(__dirname, '../_app') });

(async () => {
    const snap = await db.collection('flag_registry').get();
    const registry = new Map();
    snap.forEach(d => {
        const x = d.data() || {};
        registry.set(d.id, { flags: Object.keys(x.flags || {}), aliases: x.aliases || {}, raw: x });
    });

    const plan = [], refused = [];
    for (const rel of ['arena/boxes', 'dispatch/boxes']) {
        const dir = path.join(__dirname, '../_app', rel);
        if (!fs.existsSync(dir)) continue;
        for (const boxId of fs.readdirSync(dir)) {
            const p = path.join(dir, boxId);
            if (!fs.statSync(p).isDirectory()) continue;
            const declared = validator._reachableFlagIds(p);
            if (declared === null) continue;
            const r = registry.get(boxId);
            if (!r) continue;
            if (Object.keys(r.aliases).length) continue;           // already mapped
            // Same test the BOX-003 rule uses: the defect is a canonical set LARGER than the
            // achievements the box can yield, which makes the completion threshold
            // unreachable. A differently-NAMED canonical id is harmless — hw001-dead-workstation
            // collapses onto 'repaired' while its config says 'fixed' and works fine.
            const canonical = new Set(r.flags.map(k => r.aliases[k] || k));
            if (canonical.size <= declared.size) continue;           // threshold is reachable
            if (declared.size !== 1) { refused.push({ boxId, declared: [...declared] }); continue; }
            const target = [...declared][0];
            const aliases = {};
            r.flags.forEach(k => { aliases[k] = target; });
            plan.push({ boxId, target, aliases, keyCount: r.flags.length, prior: r.raw });
        }
    }

    console.log(APPLY ? 'APPLYING\n' : 'DRY RUN — nothing will be written\n');
    console.log(`  boxes to fix: ${plan.length}`);
    console.log(`  refused (multiple declared flags, needs a human): ${refused.length}`);
    refused.forEach(r => console.log(`    ! ${r.boxId}: declares ${r.declared.join(', ')}`));
    plan.slice(0, 5).forEach(p => console.log(`    ${p.boxId.padEnd(30)} ${p.keyCount} keys -> '${p.target}'`));
    if (plan.length > 5) console.log(`    … and ${plan.length - 5} more`);

    if (!APPLY) { console.log('\n  Re-run with --apply.'); process.exit(0); }

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.writeFileSync(path.join(__dirname, `_backups/flag-registry-pre-aliases-${stamp}.json`),
        JSON.stringify(plan.map(p => ({ boxId: p.boxId, prior: p.prior })), null, 2) + '\n');
    console.log(`\n  archived ${plan.length} prior doc states to _backups/`);

    let done = 0;
    for (let i = 0; i < plan.length; i += 400) {
        const batch = db.batch();
        for (const p of plan.slice(i, i + 400)) {
            batch.set(db.doc(`flag_registry/${p.boxId}`), { aliases: p.aliases }, { merge: true });
            done++;
        }
        await batch.commit();
    }
    console.log(`  wrote alias maps for ${done} boxes`);
    process.exit(0);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
