#!/usr/bin/env node
/**
 * EduScan — Critical Guard Registry Audit (GUARD-001)
 *
 * @catalog what    Verifies every guard in _docs/operations/critical-guards-registry.md still
 * @catalog what    exists in the code and still carries a rationale comment. Catches a guard
 * @catalog what    silently deleted in a cleanup or a "this rejects something real" fix.
 * @catalog run     node _tools/eduscan/guard-registry-audit.js
 * @catalog status  TOOL
 *
 * WHY THIS RULE EXISTS
 * --------------------
 * 2026-09-07: I removed a real guard from `functions/index.js` and deployed it. `_isValidModuleId`
 * rejected doubled prefixes (`forge-forge-...`); it fired on a completion one account held, I read
 * that as the rule being wrong, and deleted the clause. It was not wrong -- `forge-core2-ch13..ch20`
 * are the real namespace, exactly ONE account held the doubled form, and no content file defines
 * it. It was precisely the garbage the guard was built to reject, after a historical sync bug put
 * 942+ such entries into user records and inflated XP by 10-30K per user.
 *
 * What stopped me was the SAME rule's comment in `_app/components/XPCalculator.js`, which recorded
 * that incident. The server's comment said `// Validate module IDs: must be {knownHouse}-{key}
 * format` -- it described what the code did, which I could already read, so it did not argue back.
 *
 * A BLANKET LINTER WAS MEASURED AND REJECTED FIRST. Requiring a rationale on every guard-shaped
 * function flags 156 of 170 across functions/ and _app/components/, most of them `init`, `load`,
 * `joinClass` -- ordinary functions with two throws. A gate that fires 156 times is one everyone
 * learns to ignore, which is worse than no gate. So this checks a small REGISTERED set instead,
 * the same shape as META-001's rule registry.
 *
 * WHAT IT CHECKS, per registry entry:
 *   1. the file still exists
 *   2. the guard's signature is still present in it   <- catches deletion, which is what happened
 *   3. a rationale comment is still near it            <- catches the comment being stripped
 *
 * WHAT IT DOES NOT CHECK: whether the rationale is any good. No linter can. It checks that
 * SOMEBODY had to think, and that removing a guard is a deliberate act with a paper trail rather
 * than a quiet deletion inside a larger diff.
 *
 * EXIT: 0 all present, 1 a registered guard is missing or undocumented, 2 could not run.
 */
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '../..');
const REGISTRY = path.join(REPO, '_docs/operations/critical-guards-registry.md');

/* Signature = a distinctive fragment of the guard, chosen to survive reformatting but break if the
   guard is removed. Deliberately NOT a line number: those rot on the next insertion, which this
   codebase has already been bitten by (a back-link comment moved four times in one session). */
const GUARDS = [
    { id: 'GUARD-01', file: 'functions/index.js',
      sig: "key.startsWith(house + '-')", why: /942\+|doubled-prefix|forge-forge/i },
    { id: 'GUARD-02', file: '_app/components/XPCalculator.js',
      sig: "key.startsWith(house + '-')", why: /942\+|double-prefixed|garbage/i },
    { id: 'GUARD-03', file: '_app/components/FirestoreManager.js',
      sig: "key.startsWith(house + '-')", why: /garbage|known house|double/i },
    { id: 'GUARD-04', file: 'functions/index.js',
      sig: 'const mergedModules', why: /BUG-266|CLOUD SIDE IS NO LONGER FILTERED|already earned/i },
    { id: 'GUARD-05', file: 'functions/index.js',
      sig: 'Gate completions are recorded by the gate validator', why: /BUG-264|gates ledger|xp=4000/i },
    { id: 'GUARD-06', file: 'firestore.rules',
      sig: 'allow update: if request.auth', why: /BUG-262|BUG-263|hasOnly/i },
];

function main() {
    if (!fs.existsSync(REGISTRY)) {
        console.error(`  GUARD-001: registry missing at ${path.relative(REPO, REGISTRY)}`);
        console.error('  Cannot verify guards without it. This is a harness fault, not a pass.');
        return 2;
    }
    const registryText = fs.readFileSync(REGISTRY, 'utf8');

    let fail = 0, ok = 0;
    for (const g of GUARDS) {
        const abs = path.join(REPO, g.file);
        if (!fs.existsSync(abs)) {
            console.log(`  FAIL ${g.id}  file is gone: ${g.file}`);
            fail++; continue;
        }
        const src = fs.readFileSync(abs, 'utf8');

        if (!src.includes(g.sig)) {
            /* `CRITICAL:` prefix is REQUIRED, not decoration. The smoke runner
               (_tools/eduscan/smoke/run.js) filters every validator's output through
               /^\s*(CRITICAL|HIGH|MEDIUM|MISSING|drift|...):/ and prints only the first three
               matches. A message that does not match that shape is dropped, so the operator would
               see a bare red line with no reason. That exact class of mistake -- a diagnosis eaten
               by the caller's output filter -- cost a full review round earlier the same night. */
            console.log(`  CRITICAL: ${g.id} guard removed from ${g.file} — ${g.sig}`);
            console.log(`  FAIL ${g.id}  GUARD REMOVED from ${g.file}`);
            console.log(`         expected to find: ${g.sig}`);
            console.log('         If this removal is deliberate, say so in');
            console.log('         _docs/operations/critical-guards-registry.md and update this rule.');
            console.log('         Do not delete a guard because it rejects something a student holds:');
            console.log('         holding an id is not evidence of having earned it.');
            fail++; continue;
        }

        // The rationale must be near the guard, not merely somewhere in a large file.
        const at = src.indexOf(g.sig);
        const window = src.slice(Math.max(0, at - 2600), at + 600);
        if (!g.why.test(window)) {
            // Same reason as above: must match the smoke runner's summary filter to be seen.
            console.log(`  CRITICAL: ${g.id} rationale removed in ${g.file} — the guard is now undefended`);
            console.log(`  FAIL ${g.id}  guard present but its RATIONALE is gone in ${g.file}`);
            console.log('         The comment that explains what happened without it was removed or moved away.');
            console.log('         That comment is the only thing that stops the next person deleting the guard.');
            fail++; continue;
        }

        if (!registryText.includes(g.id)) {
            console.log(`  FAIL ${g.id}  present in code but not documented in the registry`);
            fail++; continue;
        }
        console.log(`  ok   ${g.id}  ${g.file}`);
        ok++;
    }

    console.log(`\n  ${ok}/${GUARDS.length} registered guards intact and documented`);
    if (fail) {
        console.log('  A registered guard was removed or lost its rationale. This blocks by design:');
        console.log('  every one of these was written after something broke in production.');
    }
    return fail ? 1 : 0;
}

try { process.exit(main()); }
catch (e) { console.error('  GUARD-001 could not run:', e && e.message); process.exit(2); }
