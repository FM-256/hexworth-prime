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

    /* ---- 8. DOCUMENTATION IS NOT A CALL SITE (BUG-277) --------------------------------
       Six ids in the shipped registry came from COMMENTS showing how to call the API — four with a
       literal NN placeholder (`dark-arts-ceh-NN-presentation` and its doubled form, from a `//`
       block at _app/houses/dark-arts/offensive/ceh/index.html:365-366).

       This is a SECOND independent route to "an id no page writes", after BUG-275, and neither
       Nancy nor I went looking for it: not a mis-parse, but parsing something that was never code.
       Nothing in the suite could catch it — the ids are identifier-shaped so the floor predicate
       accepts them, they do not end in a separator so section 6 misses them, and the drift gate
       compares the generator to itself. Parity cannot see it either: comment stripping lives in the
       SCAN, not in the resolvers parity compares.

       TWO FIXTURES, because a test that only proves the comment case is dropped cannot tell that
       from dropping everything. */
    const gen = fs.readFileSync(path.join(REPO, '_tools/content/gen-completion-registry.js'), 'utf8');
    const strip = new Function(gen.match(/function stripComments[\s\S]*?\n}\n/)[0] + '\n return stripComments;')();

    const liveCall = "const H='ai', M='real-module';\nModuleProgress.complete(H, M);";
    chk('scan KEEPS a real call site (negative control for the comment strip)',
        /ModuleProgress\.complete/.test(strip(liveCall)), 'the strip removed a live call — it is too aggressive');

    for (const [fixture, label] of [
        ["const H='ai', M='doc-example';\n//   ModuleProgress.complete(H, M);", 'a // line comment'],
        ["const H='ai', M='doc-example';\n *   ModuleProgress.complete(H, M);", 'a * block-comment line'],
        ["const H='ai', M='doc-example';\n/* ModuleProgress.complete(H, M); */", 'a /* comment line']
    ]) {
        chk(`scan DROPS a call site inside ${label}`, !/ModuleProgress\.complete/.test(strip(fixture)),
            'a documented example would enter the allowlist as a real id');
    }

    /* THE TWO CASES MY BUG-277 RECORD CLAIMED WERE TESTED AND WERE NOT. I wrote into the tracker
       that stripComments had been checked against "a URL's // and a string's /*". Both checks were
       real, but they lived in a scratchpad script, not in this file — so a permanent record claimed
       repo coverage that the repo did not have. Nancy caught it, and it is the same unearned-claim
       pattern BUG-277 itself documents about its own first draft. Making the claim true is the fix;
       weakening the claim was the alternative and these cases are worth having. */
    const DQUOTE = String.fromCharCode(34);
    for (const [fixture, label] of [
        ['const u = ' + DQUOTE + 'http://x//y' + DQUOTE + '; ModuleProgress.complete(H, M);',
         "a URL's // mid-line does not blank the code"],
        ['const css = ' + DQUOTE + 'a /* b' + DQUOTE + '; ModuleProgress.complete(H, M);',
         "a string literal's block opener does not blank the code"]
    ]) {
        chk(`scan KEEPS the call when ${label}`, /ModuleProgress\.complete/.test(strip(fixture)),
            'the stripper treated in-string punctuation as a comment and dropped a real call');
    }

    /* THE REGRESSION THAT COST 87 REAL IDS, as a fixture. The first block-aware stripper was a
       character-level JS tokeniser, and these .html files carry shell teaching content: the DevOps
       Docker lesson has the line `&& rm -rf /var/lib/apt/lists/*`, whose trailing `/*` opens a
       comment in any such scanner. Everything to the next terminator was blanked, including that
       page's own completion call, and the registry lost 87 real ids against the 8 placeholders the
       change was meant to remove. EVERY TEST STILL PASSED — the ids ceased to exist rather than
       becoming wrong, so only the before/after id diff caught it. Hence a fixture. */
    const dockerish = "<span>RUN</span> rm -rf /var/lib/apt/lists/*\nModuleProgress.complete('code', 'do-48-dockerfile');";
    chk('a shell path ending in /* does NOT blank the code after it',
        /ModuleProgress\.complete/.test(strip(dockerish)),
        'the stripper treats teaching content as a comment opener — this deleted 87 real ids once');

    /* And the specific placeholders, so a regression is named rather than merely counted. */
    const placeholders = [...R].filter(id => /(^|-)NN(-|$)/.test(id)).sort();
    chk('no registry id carries an NN placeholder from documentation', placeholders.length === 0,
        `${placeholders.length}: ${JSON.stringify(placeholders)}`);

    /* ---- 9. THE TWO COMMENT STRIPPERS, AND A FLOOR ON WHAT MUST SURVIVE ---------------
       Nancy's two residual concerns from the BUG-277 gate, both closed here.

       (a) THE PARITY GATE CANNOT SEE THIS DIVERGENCE. registry-parser-parity.js compares the two
       RESOLVERS, and comment handling is not a resolver — it lives in the scan, on raw source. So a
       future edit to the generator's stripComments without the matching edit to ARM B's
       stripCommentsB would be invisible to the one gate built to catch exactly that drift, and
       invisible in the DANGEROUS direction too: a generator that under-strips reintroduces BUG-277
       while ARM B stays correct and reports nothing. Re-implementation without comparison is how
       BUG-275 happened. So: same fixtures through both, identical output required. */
    const { stripCommentsB } = require(path.join(REPO, '_tools/content/registry-coverage.js'));
    const stripFixtures = [
        "ModuleProgress.complete(H, M);",
        "// ModuleProgress.complete(H, M);",
        " *  ModuleProgress.complete(H, M);",
        "/* open\n   ModuleProgress.complete(H, M)\n" + '*' + "/",
        "const u = " + DQUOTE + "http://x//y" + DQUOTE + "; ModuleProgress.complete(H, M);",
        "<span>RUN</span> rm -rf /var/lib/apt/lists/*\nModuleProgress.complete('code', 'x');",
        "/* one-liner " + '*' + "/ ModuleProgress.complete(H, M);",
        "",
        "no comments at all\njust two lines"
    ];
    const mismatched = stripFixtures.filter(f => strip(f) !== stripCommentsB(f));
    chk(`the generator and ARM B strip comments identically (${stripFixtures.length} fixtures)`,
        mismatched.length === 0,
        `${mismatched.length} fixture(s) differ, first: ${JSON.stringify(mismatched[0])}`);

    /* (b) A FLOOR ON WHAT MUST SURVIVE, NAMED RATHER THAN COUNTED. `--check` only proves the
       committed registry matches what the generator currently emits — both sides come from the same
       code, so a generator that silently stops emitting real ids passes it. That is what happened:
       the discarded BUG-277 fix dropped 87 real ids and every test here still passed, because an
       absence is invisible to any assertion that was not told to expect the thing. It was caught by
       a hand-run before/after diff — a habit, not a gate. These canaries are the gate. A SET, not a
       size threshold: the registry legitimately shrinks when a placeholder is removed (BUG-277's
       correct fix was -8), so a number would have been both wrong and in the way. */
    /* READ DEFENSIVELY, AND FAIL RATHER THAN CRASH. The first version read this file with a bare
       readFileSync inside main(), whose only handler is the file-level try/catch that prints
       "could not run" and exits 2. `_tools/` is gitignored, so on any clone that did not happen to
       carry the untracked local file — a fresh clone, CI, another machine — the WHOLE suite would
       have gone from 36/36 green to a hard ENOENT crash. Nancy caught that; it is strictly worse
       than the gate quietly vanishing, and it is the same gitignore trap CLAUDE.md's catalog rule
       exists for, which this session had already hit once.

       A missing canary file is a FAILED ASSERTION, never a skip: a skip would let anyone delete the
       file to go green, which is exactly the move the file's own text warns against. */
    let canaries = null, canaryErr = null;
    try {
        canaries = JSON.parse(fs.readFileSync(path.join(REPO, '_tools/content/registry-canaries.json'), 'utf8'));
    } catch (e) {
        canaryErr = e && e.message;
    }
    if (!canaries || !Array.isArray(canaries.ids) || !canaries.ids.length) {
        chk('registry-canaries.json is present and non-empty', false,
            canaryErr ? `cannot read it: ${canaryErr} — _tools/ is gitignored, so it needs \`git add -f\`` : 'it parsed but holds no ids');
    } else {
        const vanished = canaries.ids.filter(id => !R.has(id));
        chk(`all ${canaries.ids.length} canary ids survive regeneration`, vanished.length === 0,
            `${vanished.length} REAL id(s) vanished from the registry: ${JSON.stringify(vanished)} — the generator regressed; do NOT delete the canary to go green`);
        const unexplained = canaries.ids.filter(id => !(canaries.provenance || {})[id]);
        chk('every canary states why it is a canary', unexplained.length === 0,
            `${unexplained.length} without provenance: ${JSON.stringify(unexplained)} — an unexplained canary cannot be safely retired later`);
    }

    console.log(`\n  ${pass}/${pass + fail} passed`);
    return fail ? 1 : 0;
}

try { process.exit(main()); }
catch (e) { console.error('  completion-validation.test could not run:', e && e.message); process.exit(2); }
