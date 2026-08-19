#!/usr/bin/env node
'use strict';
/**
 * quiz-key-drift-audit.js — compare LIVE Firestore quiz_keys against the authored registry,
 * and flag keys that were machine-generated rather than authored.
 *
 * @catalog what   Detects quiz answer keys in production that drift from functions/quiz_keys.json,
 *                 and keys that are a repeating rotation (a placeholder seed, not a real key).
 * @catalog run    node _tools/eduscan/quiz-key-drift-audit.js [--json]
 * @catalog status TOOL
 *
 * WHY THIS EXISTS
 * On 2026-08-19, 82 server-graded quizzes were being graded against a key of the form
 * [0,1,2,3,0,1,2,3,...] — a rotating placeholder that had been seeded into Firestore and never
 * replaced with the authored key. Because gradeQuiz reads Firestore and nothing compared it to
 * the repo, the defect was silent: the quiz loaded, submitted, and returned a score. It just
 * returned the WRONG score. A student answering pc-ard-19 perfectly scored about 4/15.
 *
 * Nothing caught it because every existing check was satisfied:
 *   verify-quiz-keys.js  — confirms a key EXISTS and its length matches. A placeholder passes.
 *   --missing            — compares registry to Firestore presence, not CONTENT.
 *   answer-balance-audit — reads the repo registry, so it never saw the live value.
 *
 * The gap was that no check compared the key that GRADES to the key that was AUTHORED.
 *
 * TWO SIGNALS
 *   DRIFT    live answers != registry answers. The registry is the reviewed artifact, so drift
 *            is either an unpushed edit or an overwritten key. Both need a human.
 *   ROTATION live is a strictly repeating 4-block cycling through >=3 distinct positions
 *            (0,1,2,3,0,1,2,3... or 1,2,0,3,1,2,0,3...). Across 15 questions that is a 4^-15
 *            coincidence, so it is a machine fingerprint, not authoring.
 *
 * ROTATION IS A FLAG, NOT A VERDICT — verified 2026-08-19. az900-ch03, ceh-01 and two
 * 40-question finals (fw-final, fl-final) are AUTHORED on a deliberate rotation: the writer
 * placed the correct option at the cycling position on purpose. fl-final Q1-Q4 key 0,1,2,3
 * really is 443 / SYN,SYN-ACK,ACK / UDP / IMAP. Those must NOT be "repaired".
 *
 * ⚠ AND IN-SYNC IS NOT A CLEAN BILL EITHER. pc-ard-05 carries the placeholder rotation in the
 * REGISTRY as well as in Firestore, so it drifts from nothing and this audit cannot convict it.
 * Its Q2 key points at "sets the pin to output 5V" for a question whose own explanation
 * describes INPUT_PULLUP as an input mode. Sync only proves the two stores agree — it says
 * nothing about whether either matches the CONTENT. Every rotation is reported for that reason;
 * clearing one means reading its questions against their explanations, as was done for the four
 * above. Rotation alone never justifies a write, and in-sync alone never justifies silence.
 *
 * This tool is READ-ONLY. Repair is push-quiz-keys.js, which is a production write.
 */

const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

const AS_JSON = process.argv.includes('--json');
const FUNCTIONS = path.join(__dirname, '..', '..', 'functions');
const REGISTRY = path.join(FUNCTIONS, 'quiz_keys.json');

// firebase-admin is installed under functions/, not at the repo root, so a bare require() here
// fails with MODULE_NOT_FOUND depending on the caller's cwd. Resolve it from functions/ so this
// runs from anywhere, and say WHICH install is missing rather than emitting a raw stack.
let admin;
try {
    admin = createRequire(path.join(FUNCTIONS, 'package.json'))('firebase-admin');
} catch (err) {
    console.error('  cannot load firebase-admin from functions/ — run `npm install` in functions/');
    console.error(`  (${err.message})`);
    process.exit(2);
}

/**
 * Rotations that were READ question-by-question against their explanations on 2026-08-19 and
 * found to be genuine authoring. Anything not listed here stays UNVERIFIED and keeps the audit
 * non-zero, so a new placeholder cannot arrive and be mistaken for one of these. Add an entry
 * only after actually reading the quiz — the note records what was checked.
 */
const KNOWN_AUTHORED_ROTATIONS = {
    'az900-ch03-quiz': '(11/15 agree with explanations; Q1-Q4 = Pricing Calculator / TCO / Cost Management / Tags)',
    'ceh-01': '(7/14 agree, well above the 25% chance floor for 4 options)',
    'fw-final': '(Q1-Q5 = mantrap / clean agent / bollards / RFID / Availability)',
    'fl-final': '(Q1-Q6 = 443 / SYN,SYN-ACK,ACK / UDP / IMAP / 3389 / destination port)'
};

/**
 * A key with zero HTML callsites cannot be reached by a student, so its drift harms nobody and
 * must not compete for attention with drift on a live quiz. Read from the XREF-002 audit rather
 * than recomputed here — that tool already scans all 5245 HTML files and is the authority.
 * Missing or stale report: treat everything as reachable, which over-reports rather than
 * under-reports. Regenerate with `node _tools/eduscan/quiz-key-callsite-audit.js`.
 */
function loadOrphans() {
    const p = path.join(__dirname, '..', 'reports', 'QUIZ_KEY_CALLSITE_AUDIT.json');
    if (!fs.existsSync(p)) return { set: new Set(), available: false };
    try {
        const rep = JSON.parse(fs.readFileSync(p, 'utf8'));
        const ids = rep.orphanIds || rep.orphans || rep.orphan_ids || [];
        const list = Array.isArray(ids) ? ids.map(o => (typeof o === 'string' ? o : o.quizId || o.id)) : [];
        return { set: new Set(list.filter(Boolean)), available: list.length > 0 };
    } catch {
        return { set: new Set(), available: false };
    }
}

function answersOf(entry) {
    if (Array.isArray(entry)) return entry;
    if (entry && typeof entry === 'object') return entry.answers || entry.key || null;
    return null;
}

/**
 * A placeholder seed repeats a fixed 4-block. Requiring >=3 DISTINCT values in that block is
 * what keeps a legitimately B-heavy key ([1,1,1,2,1,1,1,2...]) from reading as a rotation —
 * repeated identical values satisfy a[i] === a[i-4] trivially, which produced 24 false
 * positives before the distinctness condition was added.
 */
function isRotation(a, tolerance = 1) {
    if (!Array.isArray(a) || a.length < 12) return false;
    let bad = 0;
    for (let i = 4; i < a.length; i++) if (a[i] !== a[i % 4]) bad++;
    return bad <= tolerance && new Set(a.slice(0, 4)).size >= 3;
}

(async () => {
    if (!fs.existsSync(REGISTRY)) {
        console.error(`  registry not found: ${REGISTRY}`);
        process.exit(2);
    }
    const registry = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
    const orphans = loadOrphans();

    if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
    const snap = await admin.firestore().collection('quiz_keys').get();

    const drift = [];
    const rotationInSync = [];
    let compared = 0;

    snap.forEach(doc => {
        const liveAnswers = doc.data().answers;
        if (!Array.isArray(liveAnswers)) return;
        const repoAnswers = answersOf(registry[doc.id]);
        if (!Array.isArray(repoAnswers)) return;
        compared++;

        const same = JSON.stringify(repoAnswers) === JSON.stringify(liveAnswers);
        const rotating = isRotation(liveAnswers);

        if (!same) {
            drift.push({
                quizId: doc.id,
                live: liveAnswers,
                repo: repoAnswers,
                positionsDiffering: repoAnswers.filter((v, i) => v !== liveAnswers[i]).length,
                // rotation + drift is the signature of the 2026-08-19 defect
                liveLooksMachineGenerated: rotating && !isRotation(repoAnswers)
            });
        } else if (rotating) {
            rotationInSync.push(doc.id);
        }
    });

    if (AS_JSON) {
        console.log(JSON.stringify({ compared, drift, rotationInSync }, null, 2));
        process.exit(drift.length ? 1 : 0);
    }

    console.log(`\n  compared ${compared} live keys against the registry\n`);

    const machine = drift.filter(d => d.liveLooksMachineGenerated);
    const other = drift.filter(d => !d.liveLooksMachineGenerated);

    if (machine.length) {
        console.log(`  PLACEHOLDER KEYS IN PRODUCTION (${machine.length}) — live is a rotation, registry is authored.`);
        console.log(`  These grade students against positions unrelated to the content.`);
        for (const d of machine) console.log(`    ${d.quizId}  live=${JSON.stringify(d.live).slice(0, 44)}`);
        console.log('');
    }

    const reachable = other.filter(d => !orphans.set.has(d.quizId));
    const unreachable = other.filter(d => orphans.set.has(d.quizId));

    if (reachable.length) {
        console.log(`  DRIFT NEEDING ADJUDICATION (${reachable.length}) — neither side is mechanically identifiable.`);
        console.log(`  Do NOT bulk-push these; compare each question against its explanation first.`);
        console.log(`  Alignment matters: parse questions POSITIONALLY. A regex that skips a question with an`);
        console.log(`  embedded apostrophe shifts every later index and adjudicates the wrong question.`);
        for (const d of reachable) console.log(`    ${d.quizId}  (${d.positionsDiffering} position(s) differ)`);
        console.log('');
    }

    if (unreachable.length) {
        console.log(`  Drift on ORPHAN keys (${unreachable.length}) — zero HTML callsites, so no student can`);
        console.log(`  reach them and the drift harms nobody. Left in place deliberately; we archive, not delete.`);
        console.log(`    ${unreachable.map(d => d.quizId).join(', ')}\n`);
    }

    if (rotationInSync.length) {
        console.log(`  ROTATION, IN SYNC WITH THE REGISTRY (${rotationInSync.length}) — UNRESOLVED, not cleared.`);
        console.log(`  Both stores agree, so drift cannot convict these. Agreement is not correctness:`);
        console.log(`  pc-ard-05 holds the placeholder in BOTH and is wrong. Clear one only by reading`);
        console.log(`  its questions against their explanations.`);
        for (const id of rotationInSync) {
            const known = KNOWN_AUTHORED_ROTATIONS[id];
            console.log(`    ${id}${known ? `  — verified authored ${known}` : '  — UNVERIFIED'}`);
        }
        console.log('');
    }

    if (!drift.length) console.log('  no drift: every live key matches the authored registry.\n');

    // Non-zero only for what a human must ACT on: drift a student can actually hit, a placeholder
    // in production, or a rotation nobody has read yet. Orphan drift is reported and does not fail
    // — a gate that stays red over unreachable keys trains people to ignore it, which is how the
    // placeholder keys survived in the first place.
    const unverified = rotationInSync.filter(id => !KNOWN_AUTHORED_ROTATIONS[id]);
    const actionable = machine.length + reachable.length + unverified.length;
    if (!actionable) console.log('  nothing actionable: no reachable drift, no placeholder keys, no unread rotations.\n');
    process.exit(actionable ? 1 : 0);
})().catch(err => {
    console.error(`  audit failed: ${err.message}`);
    process.exit(2);
});
