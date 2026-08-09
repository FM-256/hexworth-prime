#!/usr/bin/env node
/**
 * verify-box-flags.js — Verify the bridge between a box's declared flags and live
 * flag_registry, the same way verify-quiz-keys.js does for server-graded exams.
 *
 * @catalog what    Catches a box declaring flags Firestore cannot yield, which silently
 *                  tells a correct student they are WRONG and docks them points.
 * @catalog run     cd functions && node verify-box-flags.js [boxId ...]
 * @catalog status  GATE
 *
 * WHY THIS EXISTS, and it is not hypothetical.
 *
 * validateFlag answers a MISSING registry entry with {correct:false} — byte-identical
 * to a genuinely wrong answer. The client cannot tell the two apart, so it takes the
 * wrong-answer branch, subtracts wrongAnswerPenalty and renders "Rejected". A student
 * who solved the mission correctly is told they failed AND loses points, and nothing
 * anywhere logs that it happened.
 *
 * le-01-cold-horizon mitigates this with a per-flag `gradable` declaration in its
 * config. That is a CLIENT-SIDE MIRROR of Firestore state maintained by hand, and the
 * platform's own rule says a gate must RE-DERIVE rather than trust a cache. This script
 * is the re-derivation: it reads live Firestore and reports where the mirror has drifted.
 *
 * Two drift directions, and they are not equally bad:
 *
 *   gradable:true  but NOT in registry  → DANGEROUS. Correct answers are punished.
 *   gradable:false but IS  in registry  → wasteful. A solvable mission refuses to grade.
 *
 * It also checks the arena card, because that is a third copy of the same truth. On
 * 2026-08-09 an uncounted find-and-replace left 14 unrelated boxes advertising a flag
 * they could not yield, which is the 2026-08-04 defect (88 boxes solvable and never
 * creditable) reintroduced by hand. The card's `flags:` count is the completion
 * denominator, so it must equal what the registry can actually award.
 *
 * USAGE (from functions/):
 *   node verify-box-flags.js                      # every box with a parseable config
 *   node verify-box-flags.js le-01-cold-horizon   # one box
 *   node verify-box-flags.js --offline            # config vs arena card only, no Firestore
 *
 * EXIT CODES (CI-friendly):
 *   0 = no drift
 *   1 = drift found
 *   2 = script error
 */

'use strict';

const fs = require('fs');
const path = require('path');

const APP = path.resolve(__dirname, '..', '_app');
const BOXES = path.join(APP, 'arena', 'boxes');
const ARENA_INDEX = path.join(APP, 'arena', 'index.html');

const OFFLINE = process.argv.includes('--offline');
const ARGS = process.argv.slice(2).filter((a) => !a.startsWith('--'));

let problems = 0;
const note = (s) => console.log(s);
const fail = (s) => { problems++; console.log('  FAIL  ' + s); };
const ok = (s) => console.log('  ok    ' + s);

/**
 * Load a box config without executing it as a module. The configs are plain
 * `const X = {...}` scripts written for a browser, so they are evaluated in a
 * throwaway sandbox rather than required.
 */
function loadBoxConfig(dir) {
    const cfgPath = path.join(dir, 'config-shared.js');
    if (!fs.existsSync(cfgPath)) return null;
    const src = fs.readFileSync(cfgPath, 'utf8');
    try {
        const vm = require('vm');
        const sandbox = { module: { exports: {} }, console: { warn() {} } };
        vm.createContext(sandbox);
        new vm.Script(src + '\n;__out = (typeof module !== "undefined" && module.exports) || null;')
            .runInContext(sandbox, { timeout: 3000 });
        return sandbox.__out || null;
    } catch (e) {
        note(`  (could not evaluate ${path.basename(dir)}/config-shared.js: ${e.message})`);
        return null;
    }
}

/** The arena card's advertised flag count. This is the completion denominator. */
function cardFlagCount(registryId) {
    if (!fs.existsSync(ARENA_INDEX)) return null;
    const src = fs.readFileSync(ARENA_INDEX, 'utf8');
    // Match on the box's href, which is unique. Matching on a field pattern is how
    // 14 unrelated cards got edited by mistake.
    const re = new RegExp(`\\{ id: '[a-z0-9]+',[^}]*?boxes/${registryId}/[^}]*?\\}`, 's');
    const m = src.match(re);
    if (!m) return null;
    const f = m[0].match(/flags: (\d+)/);
    return f ? parseInt(f[1], 10) : null;
}

async function main() {
    const dirs = fs.existsSync(BOXES)
        ? fs.readdirSync(BOXES).filter((d) => fs.statSync(path.join(BOXES, d)).isDirectory())
        : [];
    const targets = ARGS.length ? dirs.filter((d) => ARGS.includes(d)) : dirs;

    if (ARGS.length && targets.length !== ARGS.length) {
        console.error('Unknown box id(s): ' +
            ARGS.filter((a) => !dirs.includes(a)).join(', '));
        process.exit(2);
    }

    let db = null;
    if (!OFFLINE) {
        try {
            const admin = require('firebase-admin');
            if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
            db = admin.firestore();
        } catch (e) {
            console.error('Firebase Admin unavailable: ' + e.message);
            console.error('Run with --offline to check config vs arena card only.');
            process.exit(2);
        }
    }

    console.log('\nBox flag bridge check' + (OFFLINE ? '  (OFFLINE: no Firestore)' : '') + '\n');

    for (const d of targets) {
        const cfg = loadBoxConfig(path.join(BOXES, d));
        if (!cfg || !Array.isArray(cfg.flags)) continue;
        const boxId = cfg.registryId || cfg.id || d;
        console.log(`${boxId}`);

        const declared = cfg.flags.map((f) => f.id);
        // A box with no `gradable` field at all predates the convention. Treat every
        // flag as claimed-gradable, which is the assumption its UI already makes.
        const claimed = cfg.flags
            .filter((f) => f.gradable === undefined || f.gradable === true)
            .map((f) => f.id);

        let seeded = null;
        if (db) {
            const doc = await db.doc(`flag_registry/${boxId}`).get();
            if (!doc.exists) {
                fail(`no flag_registry/${boxId} document at all; ${declared.length} flag(s) declared`);
                continue;
            }
            const data = doc.data() || {};
            seeded = Object.keys(data.flags || {});

            const punishing = claimed.filter((id) => !seeded.includes(id));
            const wasted = declared.filter((id) => !claimed.includes(id) && seeded.includes(id));

            if (punishing.length) {
                fail(`DANGEROUS — claimed gradable but NOT seeded: ${punishing.join(', ')}`);
                note('        A correct answer to these is scored as wrong and docked points.');
            } else {
                ok(`every claimed-gradable flag is seeded (${claimed.length})`);
            }
            if (wasted.length) {
                fail(`stale — seeded but marked ungradable: ${wasted.join(', ')} (flip gradable:true)`);
            }
        }

        // The card is a third copy of the same truth, and it is the one students see.
        const card = cardFlagCount(boxId);
        const creditable = seeded
            ? claimed.filter((id) => seeded.includes(id)).length
            : claimed.length;
        if (card === null) {
            note('        (no arena card found for this box; skipping card check)');
        } else if (card !== creditable) {
            fail(`arena card advertises ${card} flag(s); ${creditable} ${db ? 'are creditable' : 'claimed gradable'}`);
            note('        The card count is the completion denominator. Over-claiming makes the box uncompletable.');
        } else {
            ok(`arena card advertises ${card}, matching what can be awarded`);
        }
    }

    console.log(problems
        ? `\n${problems} problem(s) found.\n`
        : '\nNo drift.\n');
    process.exit(problems ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(2); });
