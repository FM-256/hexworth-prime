#!/usr/bin/env node
/**
 * completion-validation.test.js — BUG-264 validation, asserted rather than asserted-about
 *
 * @catalog what    Proves the completion registry accepts every id real students hold, rejects
 * @catalog what    fabricated ids, and that every live writer of modulesCompleted/labsCompleted
 * @catalog what    actually calls the guard. Runs offline against the committed snapshot.
 * @catalog run     node _tools/content/completion-validation.test.js
 * @catalog status  TOOL
 *
 * WHY THIS EXISTS
 * ---------------
 * Twice in one session I wrote "all fabricated ids rejected" and "all three callables validate"
 * into a commit message, and a reviewer proved both false by reading the source. The second time,
 * the guard had landed INSIDE an `if (type === 'quiz')` branch, so it protected one field and left
 * the two the bug is actually about wide open -- while the commit claimed the sweep was complete.
 *
 * The reviewer's question was the right one: WHERE DID THAT VERIFICATION ACTUALLY RUN? It ran as an
 * ad-hoc one-liner against a Set, never against the code path. So it could not have caught a guard
 * in the wrong scope, and it didn't.
 *
 * This file exists so the claim has an artifact. It fails loudly rather than being re-typed into a
 * commit message.
 *
 * WHAT IT CHECKS
 *   1. STRUCTURAL: every live writer of modulesCompleted/labsCompleted calls _isKnownCompletion,
 *      and in syncClassProgress the call is OUTSIDE the type branches. That is the specific defect
 *      that shipped, so it gets a specific test.
 *   2. ACCEPTANCE: every completion id in the committed snapshot is accepted. A rejection here
 *      means enforcement would delete work a student already earned.
 *   3. REJECTION: fabricated ids are refused.
 *
 * EXIT: 0 pass, 1 a check failed, 2 could not run.
 */
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '../..');
let pass = 0, fail = 0;
const chk = (name, cond, detail) => {
    cond ? pass++ : fail++;
    console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${name}${cond ? '' : '  <- ' + String(detail).slice(0, 160)}`);
};

function main() {
    const idx = fs.readFileSync(path.join(REPO, 'functions/index.js'), 'utf8');

    // ---- 1. STRUCTURAL -----------------------------------------------------------------
    // recordProgress: module and lab branches each guarded.
    const rec = idx.slice(idx.indexOf('exports.recordProgress = onCall'));
    const recBody = rec.slice(0, rec.indexOf('\n});'));
    chk('recordProgress module branch is guarded',
        /case 'module':[\s\S]{0,600}?_isKnownCompletion/.test(recBody), 'no guard before modulesCompleted');
    chk('recordProgress lab branch is guarded',
        /case 'lab':[\s\S]{0,600}?_isKnownCompletion/.test(recBody), 'no guard before labsCompleted');

    // syncProgress: incoming payload filtered.
    chk('syncProgress filters incoming modules',
        /localModules = [\s\S]{0,200}?_isKnownCompletion/.test(idx), 'localModules not filtered');
    chk('syncProgress filters incoming labs',
        /localLabs = [\s\S]{0,200}?_isKnownCompletion/.test(idx), 'localLabs not filtered');

    // submitEDTLab: guard immediately before the write.
    /* ORDERING, NOT PROXIMITY. This first asserted the guard appeared within 400 characters of the
       labsCompleted write. That is the wrong property twice over: it FAILED when the guard was
       moved EARLIER (which was the fix — the guard belongs with the input validation, before
       `edt_submissions` is written at all), and it would PASS a guard sitting after some other
       side effect as long as it was near the arrayUnion. Assert what actually matters: the guard
       runs before EVERY write in the function. Positions are computed from the function slice, and
       from the WRITE (`db.doc(...).set`), never from a mention of the collection name — an earlier
       version of this check matched a comment that merely named `edt_submissions`. */
    const edtStart = idx.indexOf('exports.submitEDTLab');
    const edt = idx.slice(edtStart, idx.indexOf('\n});', edtStart));
    const edtGuard = edt.indexOf('!_isKnownCompletion');
    const edtSubWrite = edt.search(/db\.doc\(`edt_submissions\//);
    const edtLabWrite = edt.indexOf('labsCompleted: FieldValue.arrayUnion');
    chk('submitEDTLab guard is present', edtGuard !== -1, 'no _isKnownCompletion call');
    chk('submitEDTLab guard runs BEFORE the edt_submissions write (no orphan doc)',
        edtGuard !== -1 && edtSubWrite !== -1 && edtGuard < edtSubWrite,
        `guard at ${edtGuard}, edt_submissions write at ${edtSubWrite}`);
    chk('submitEDTLab guard runs BEFORE the labsCompleted write',
        edtGuard !== -1 && edtLabWrite !== -1 && edtGuard < edtLabWrite,
        `guard at ${edtGuard}, labsCompleted write at ${edtLabWrite}`);

    /* syncClassProgress: THE ONE THAT SHIPPED WRONG. The guard must sit OUTSIDE the type branches.
       Asserting merely that _isKnownCompletion appears in the function would have PASSED the
       broken version, because it was present -- just scoped to the quiz branch. So assert ordering:
       the guard must appear BEFORE the first `if (type ===` in the function body. */
    const scpStart = idx.indexOf('exports.syncClassProgress');
    const scp = idx.slice(scpStart, idx.indexOf('\n});', scpStart));
    const guardAt = scp.indexOf('!_isKnownCompletion');
    const firstTypeBranch = scp.indexOf("if (type ===");
    chk('syncClassProgress guard is present', guardAt !== -1, 'no _isKnownCompletion call');
    chk('syncClassProgress guard runs BEFORE the type branches (not inside one)',
        guardAt !== -1 && firstTypeBranch !== -1 && guardAt < firstTypeBranch,
        `guard at ${guardAt}, first type branch at ${firstTypeBranch} — guard is inside a branch`);

    // ---- 2. ACCEPTANCE -----------------------------------------------------------------
    const reg = JSON.parse(fs.readFileSync(path.join(REPO, 'functions/completion-registry.json'), 'utf8'));
    const R = new Set(reg.ids);
    const snapDir = path.join(REPO, '_tools/progress-snapshot/snapshots');
    if (!fs.existsSync(snapDir) || !fs.readdirSync(snapDir).length) {
        console.log('  SKIP acceptance — no snapshot present (run snapshot.js snapshot)');
    } else {
        const S = JSON.parse(fs.readFileSync(path.join(snapDir, fs.readdirSync(snapDir).sort()[0]), 'utf8'));
        let total = 0; const rejected = new Set();
        for (const u of Object.values(S.users)) {
            for (const f of ['modulesCompleted', 'labsCompleted'])
                for (const id of (u[f] || [])) { total++; if (!R.has(id)) rejected.add(id); }
            for (const q of Object.keys(u.quizzes || {})) { total++; if (!R.has(q)) rejected.add(q); }
        }
        chk(`every id a student already holds is accepted (${total} checked)`,
            rejected.size === 0, [...rejected].slice(0, 6).join(', '));
    }

    /* ---- 2b. THE DOUBLED-PREFIX SHAPE MUST BE CAUGHT SOMEWHERE -------------------------
       Chris blocked a deploy because nothing in the pipeline rejected `{house}-{house}-garbage`:
       the client guard was removed on the strength of a compensating control (registry
       enforcement) that was INERT, and no gate asserted the shape either. So the gate asserts it
       now. This check is conditional BY DESIGN: while enforcement is off, the shape guard is the
       only thing standing between a forged doubled id and permanent, XP-paying acceptance. When
       enforcement is on, the registry supersedes it and the guard may go. */
    const enforcing = /_ENFORCE_COMPLETION_REGISTRY\s*=\s*true/.test(idx);
    const shapeGuards = ['functions/index.js', '_app/components/XPCalculator.js',
                         '_app/components/FirestoreManager.js']
        .filter(f => fs.readFileSync(path.join(REPO, f), 'utf8').includes("key.startsWith(house + '-')"));
    chk(enforcing
            ? 'registry is ENFORCING — doubled-prefix shape guard optional'
            : 'registry is REPORT-ONLY — doubled-prefix shape guard required in all 3 validators',
        enforcing || shapeGuards.length === 3,
        `enforcement=${enforcing}, shape guard present in ${shapeGuards.length}/3`);

    // ---- 3. REJECTION ------------------------------------------------------------------
    const forged = ['shield-fabricated-xyz-999', 'web-not-a-real-thing', 'lab_totally_made_up',
                    'ctf_fake99', 'anything-i-want-not-even-house-shaped', 'module_XXXXXX'];
    for (const f of forged) chk(`fabricated id rejected: ${f}`, !R.has(f), 'ACCEPTED by the registry');

    /* ---- 4. THE FLOOR-REFRESHER PREDICATE MUST NOT REJECT A REAL ID -------------------
       Nancy BLOCKED the floor refresher because its reject predicate threw out any id containing
       a dot as "a dotted field NAME artifact." Two real, declared, currently-reachable ids contain
       dots, are written by ModuleProgress.complete() to the very surfaces the refresher reads, and
       were ALREADY in the registry via the call-site extractor:

           dark-arts-redteam.barricade   _app/dark-arts/vault/modules/redteam.barricade.html:15
           shield-eh-exam-1-a.exam       _app/houses/shield/exams/shield-eh-exam-1-a.exam.html:264

       Because registry-coverage.js SHARES that predicate, a wrong answer mis-filed the same id in
       both tools at once — reporting a real coverage BLOCKER as "malformed, expected" and hiding
       precisely the failure the chain exists to catch. It stayed invisible in the first run only
       because no live completion for that family happened to be missing from the registry yet.
       Luck is not a test, so here is the test. */
    const { rejectReason } = require(path.join(REPO, '_tools/content/refresh-legacy-floor.js'));

    for (const [id, where] of [['dark-arts-redteam.barricade', '_app/dark-arts/vault/modules/redteam.barricade.html:15'],
                               ['shield-eh-exam-1-a.exam', '_app/houses/shield/exams/shield-eh-exam-1-a.exam.html:264']])
        chk(`floor predicate accepts the real dotted id ${id}`, rejectReason(id) === null,
            `REJECTED as "${rejectReason(id)}" — declared at ${where}`);

    /* The two named ids are the ones that were caught. Enumerating only those would re-test the
       last mistake and miss the next one, so sweep the WHOLE canonical id space: anything the
       registry's own extractor produced must survive the predicate. The exceptions below are not
       content ids at all — they are gen-completion-registry.js capturing a JS expression as a
       string literal from a template call site. Asserting EQUALITY rather than membership means a
       new artifact, or a newly-rejected real id, fails this test instead of quietly joining a
       growing allowlist of excuses. */
    /* EMPTY, AND THAT IS THE ASSERTION. This list held 8 entries like "code-pyh-' + LAB_ID" —
       gen-completion-registry.js storing unresolved JS expression text as if it were a content id,
       the visible half of BUG-273 (all 22 Python-for-IT ids absent from the registry). BUG-273 is
       now FIXED: the generator tokenises and resolves concatenated arguments, so it emits the real
       ids and no expression text. Keeping the equality check with an empty list turns this into the
       stronger invariant — THE REGISTRY CONTAINS NOTHING THE PREDICATE CALLS MALFORMED — and any
       new artifact fails here instead of quietly joining a growing list of excuses.
       History worth keeping: I first enumerated only the 2 that Nancy surfaced, because she found
       them by filtering for dots and 6 of the 8 contain none. Sweeping the whole id space with the
       predicate found all 8. That is the argument for the sweep over the hand-picked filter. */
    const EXTRACTOR_ARTIFACTS = [];
    const rejectedRegistryIds = [...R].filter(id => rejectReason(id) !== null).sort();
    chk(`floor predicate accepts every registry id except the ${EXTRACTOR_ARTIFACTS.length} known extractor artifacts`,
        JSON.stringify(rejectedRegistryIds) === JSON.stringify([...EXTRACTOR_ARTIFACTS].sort()),
        `rejected ${rejectedRegistryIds.length}: ${JSON.stringify(rejectedRegistryIds)}`);

    /* Self-consistency: the committed floor must never hold an id its own predicate would throw
       out. If it does, one of the two is wrong and students are the ones who pay. */
    const floorIds = JSON.parse(fs.readFileSync(path.join(REPO, '_tools/content/legacy-completion-ids.json'), 'utf8')).ids || [];
    const selfRejected = floorIds.filter(id => rejectReason(id) !== null);
    chk('committed floor holds nothing its own predicate rejects', selfRejected.length === 0,
        `${selfRejected.length} self-rejected: ${JSON.stringify(selfRejected.slice(0, 6))}`);

    /* And the narrowing must not have gone so far that the PROVEN-malformed keys slip through.
       These three are in production completion maps right now (BUG-272 production evidence). */
    for (const bad of ['undefined', '[object Object]', 'any_id'])
        chk(`floor predicate still rejects the proven-malformed key ${JSON.stringify(bad)}`,
            rejectReason(bad) !== null, 'ACCEPTED — it would be blessed into the allowlist');

    /* ---- 5. THE COVERAGE DETECTOR MUST BE ABLE TO FAIL --------------------------------
       ARM B of registry-coverage.js is what stands between a runtime-built id and a student's
       first completion being rejected. A green detector proves nothing until you have watched it go
       red, and this one has already produced a false clean: an early harness invoked it with the
       wrong __dirname, so it walked a nonexistent directory and reported 0 blockers against a
       registry that had 72 real gaps (50 AI Cortex + 22 Python).

       So: run it against a MUTANT registry with a known id removed, and require that it notices.
       Historically verified too — against the pre-fix registries it reported 72 and then 50
       blockers, reaching 0 only once both BUG-273 and BUG-274 were fixed. */
    const { armB } = require(path.join(REPO, '_tools/content/registry-coverage.js'));

    chk('coverage ARM B reports no gaps against the real registry', armB(R).length === 0,
        `${armB(R).length} gap(s): ${JSON.stringify(armB(R).slice(0, 4))}`);

    for (const victim of ['pyh-lab-graphics-01', 'cx-nlp-02']) {
        const mutant = new Set(R);
        mutant.delete(victim);
        for (const h of ['code', 'ai']) mutant.delete(h + '-' + victim);
        const found = armB(mutant).some(m => m.id.startsWith(victim + ' '));
        chk(`coverage ARM B CATCHES a removed id (${victim})`, found,
            'detector stayed silent on a known-missing id — it cannot be trusted');
    }

    /* ---- 6. NO REGISTRY ENTRY MAY BE A TRUNCATION ARTIFACT ----------------------------
       BUG-275 put the ids `script-` and `script-script-` into the allowlist: the extractor stored
       the leading literal of `const longKey = 'script-' + MODULE_ID` and used it as a content id.
       NOTHING IN THIS SUITE CAUGHT THAT, and it is worth being precise about why, because the
       obvious candidates all legitimately failed to:
         - ARM B of registry-coverage.js detects MISSING ids. This was an EXTRA id. Wrong direction.
         - the floor predicate sweep (section 4) accepts `script-` — it IS identifier-shaped.
         - the static drift gate compares the generator to itself, so it agreed with the artifact.
       Nancy found it by reading the code. That is not a repeatable gate, so here is one.

       The invariant: a completion id never ENDS with a separator, and is never just a house name.
       A truncated concatenation always lands in exactly that shape, which is what makes this a
       cheap and falsifiable check rather than a vague tidiness rule. */
    const HOUSES_FOR_SHAPE = (idx.match(/_KNOWN_HOUSES\s*=\s*\[([^\]]+)\]/) || [, ''])[1]
        .split(',').map(h => h.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    const truncated = [...R].filter(id => /[-_.]$/.test(id)).sort();
    chk('no registry id ends with a separator (truncated concatenation)', truncated.length === 0,
        `${truncated.length} truncation artifact(s): ${JSON.stringify(truncated.slice(0, 8))}`);

    const bareHouse = [...R].filter(id => HOUSES_FOR_SHAPE.includes(id)).sort();
    chk(`no registry id is bare a house name (${HOUSES_FOR_SHAPE.length} houses read from _KNOWN_HOUSES)`,
        bareHouse.length === 0, `${bareHouse.length}: ${JSON.stringify(bareHouse)}`);

    /* ---- 7. THE TWO RESOLVERS MUST AGREE ABOUT WHAT SHIPS -----------------------------
       gen-completion-registry.js BUILDS the allowlist and registry-coverage.js ARM B VERIFIES it,
       each with its own expression resolver — deliberately, because a verifier that calls into the
       thing it verifies agrees by construction and proves nothing.

       Keeping two implementations only helps while they are actually compared. When BUG-275 was
       fixed in the generator and not in ARM B, ARM B caught the stale half within one run. But the
       two then agreed on every call site while differing on 572 VARIABLES, and "they agree on
       everything that matters today" is a coincidence, not a property. So the comparison is a gate
       now, and because this test file is itself wired at deploy.sh:494, it reaches the deploy.

       Enforced: CALL-SITE agreement, the ids that actually reach the registry. Reported but not
       enforced: variable-level divergence on backtick template literals neither resolver parses.
       Mutation-proven — reintroducing the BUG-275 truncation into ARM B alone makes it report 52
       call-site disagreements and exit 1. */
    const parity = require('child_process').spawnSync('node',
        [path.join(REPO, '_tools/content/registry-parser-parity.js')], { encoding: 'utf8' });
    chk('the registry builder and its verifier agree on every call site',
        parity.status === 0,
        `registry-parser-parity exited ${parity.status}: ${String(parity.stdout || '').split('\n').filter(l => /disagree/i.test(l)).join(' | ') || String(parity.stderr || '').slice(0, 200)}`);

    console.log(`\n  ${pass}/${pass + fail} passed`);
    return fail ? 1 : 0;
}

try { process.exit(main()); }
catch (e) { console.error('  completion-validation.test could not run:', e && e.message); process.exit(2); }
