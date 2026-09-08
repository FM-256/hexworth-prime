#!/usr/bin/env node
/**
 * EduScan RULES-001: client collection QUERIES must be permitted by firestore.rules
 *
 * @catalog what    Cross-checks every client-side Firestore collection query against the `list`
 * @catalog what    rule for that collection. Catches client code asking a question the rules
 * @catalog what    forbid, which fails at runtime for ordinary users and often gets swallowed.
 * @catalog run     node _tools/eduscan/client-query-rules-parity.js
 * @catalog status  GATE
 *
 * WHY THIS RULE EXISTS
 * --------------------
 * 2026-09-08, P0: new users could not finish signing up. Google sign-in worked, the callsign modal
 * appeared, and every callsign they tried came back "already taken" forever.
 *
 * `FirestoreManager.isCallsignAvailable()` checked uniqueness with a COLLECTION QUERY:
 *     getDocs(query(collection(db,'users'), where('callsignLower','==', x)))
 * That is a `list` operation. `firestore.rules` says, for `users/{userId}`:
 *     allow get:  if request.auth != null;      <-- reading ONE doc is fine
 *     allow list: if isAdmin();                 <-- QUERYING the collection is admin-only
 * So a brand-new non-admin account got PERMISSION_DENIED, the client's catch returned `false`, and
 * every caller reads `false` as "taken". A denied read became a permanent "that name is gone".
 *
 * THE RULES CHANGE WAS CORRECT. Commit 9b5970b15 (2026-08-21) split `read` into `get`/`list` to
 * close a real user-enumeration hole. Nothing was wrong with it. What was missing was anything that
 * noticed a client feature still depended on the `list` it had just removed. The bug then sat live
 * for 18 days, because it never broke signup itself -- only the callsign step, for new users only,
 * who mostly do not file bug reports, they just leave.
 *
 * THAT IS THE CLASS THIS CATCHES: not "the rules are wrong" and not "the client is wrong", but the
 * two DISAGREEING. Neither file is inspectable alone to find it, which is exactly why it survived
 * review. Same shape as GUARD-07, where three copies of a house list each looked fine individually
 * and only a cross-file comparison found the drift.
 *
 * WHAT IT CHECKS
 *   For every `list`-shaped client query it can find, is the target collection's `list` rule
 *   satisfiable by an ORDINARY SIGNED-IN USER? If the rule requires admin/handler/owner, a normal
 *   student running that code path gets PERMISSION_DENIED.
 *
 * WHAT IT DOES NOT CHECK, stated so nobody over-trusts it:
 *   - Dynamic collection names (`collection(db, someVar)`) are invisible to a static scan. This is
 *     the same blind spot that made the completion registry's first pass miss 74 call sites, so it
 *     is named here rather than discovered later.
 *   - Whether the query would return the RIGHT answer. Only whether it is permitted to run.
 *   - Server-side (admin SDK) code, which bypasses rules by construction and is exempt on purpose.
 *
 * EXIT: 0 no client query violates a list rule, 1 at least one does, 2 could not run.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '../..');
const RULES = path.join(REPO, 'firestore.rules');
const APP = path.join(REPO, '_app');

/* Collections a normal student legitimately queries and whose list rule is open by design.
   Kept explicit rather than inferred: an allowlist that is derived from the rules would agree with
   the rules by construction and could never disagree, which is the whole point of the check. */
const EXPECTED_PUBLIC = new Set(['tournaments', 'teams', 'challenges', 'leaderboard']);

/** Parse firestore.rules into { collectionName: { list: condition|null, read: condition|null } }. */
function parseRules(src) {
    const out = {};
    const lines = src.split('\n');
    const stack = [];
    for (const raw of lines) {
        /* STRIP THE COMMENT BEFORE PARSING ANYTHING.
           The first version did not, so `allow read: if true;  // Public - podium needs pre-auth`
           captured the condition as `true;  // Public - podium needs pre-auth`, which matched
           neither the `true` test nor the auth test and fell through to "denied". That made this
           GATE flag `tournaments` -- a deliberately public collection -- and print advice to widen
           a rule that was already correct, which is precisely the mistake the header warns against.
           A gate that blocks correct code is worse than no gate. Comments are also stripped before
           the brace counting below, so a `{` inside a comment cannot corrupt the match stack. */
        const noComment = raw.replace(/\/\/.*$/, '').replace(/\/\*[\s\S]*?\*\//g, '');
        const line = noComment.trim();
        const m = line.match(/^match\s+\/([A-Za-z0-9_]+)\/\{/);
        if (m) stack.push(m[1]);
        // A rule line applies to the innermost open match block.
        const a = line.match(/^allow\s+([a-z,\s]+):\s*if\s+(.+?);?\s*$/);
        if (a && stack.length) {
            const verbs = a[1].split(',').map(v => v.trim());
            const cond = a[2].replace(/;\s*$/, '').trim();
            const coll = stack[stack.length - 1];
            out[coll] = out[coll] || { list: null, read: null };
            for (const v of verbs) {
                if (v === 'list') out[coll].list = cond;
                if (v === 'read') out[coll].read = cond;
            }
        }
        // Track block depth so nested matches pop correctly. Counted on the COMMENT-STRIPPED line,
        // so a brace inside prose cannot corrupt the stack.
        const opens = (noComment.match(/\{/g) || []).length;
        const closes = (noComment.match(/\}/g) || []).length;
        for (let i = 0; i < closes - opens && stack.length; i++) stack.pop();
    }
    return out;
}

/** Is this rule condition satisfiable by an ordinary signed-in, non-admin user? */
function openToOrdinaryUser(cond) {
    if (cond == null) return null;                 // no rule at all: default deny
    const c = cond.replace(/\s+/g, ' ').trim();
    if (/^true$/.test(c)) return true;
    /* SPLIT ON `||` FIRST. A condition like `isAdmin() || resource.data.status == 'published'` IS
       satisfiable by an ordinary user through the second branch, but a naive scan sees `isAdmin()`
       and calls it closed. The first version of this gate did exactly that and flagged a correct
       rule. If ANY alternative is open to an ordinary user, the query can succeed for them. */
    const branches = c.split('||').map(b => b.trim().replace(/^\(|\)$/g, ''));
    if (branches.length > 1) return branches.some(b => openToOrdinaryUser(b) === true);
    // Anything gated on a privileged role is not available to a student.
    if (/isAdmin\(\)|isHandler\(\)|isInstructor\(\)|isOwner\(\)/.test(c)) return false;
    // `request.auth != null` with nothing privileged attached is fine.
    if (/request\.auth\s*!=\s*null/.test(c)) return true;
    // A per-document data condition (e.g. status == 'published') is evaluated per result and is
    // reachable by an ordinary user.
    if (/resource\.data\./.test(c)) return true;
    return false;                                   // unrecognised: treat as closed, fail loud
}

/* Admin surfaces are EXEMPT, and this is not a loophole.
   `_app/admin/*` is only reachable by an admin, so a query there against an isAdmin()-gated
   collection is correct by construction, not a defect. Including them produced five false
   positives on the first run. A gate that flags correct code is a gate people learn to switch off,
   which is worse than no gate: the point is to catch a STUDENT-facing path depending on a rule
   students cannot satisfy. Deliberately narrow so it stays trustworthy. */
function isAdminSurface(relPath) {
    return /^_app\/admin\//.test(relPath);
}

/** Find client-side collection queries. Literal collection names only, by design. */
function findClientQueries() {
    const hits = [];
    const q1 = /getDocs\s*\(\s*query\s*\(\s*collection\s*\(\s*\w+\s*,\s*['"]([A-Za-z0-9_]+)['"]/g;
    const q2 = /collection\s*\(\s*\w+\s*,\s*['"]([A-Za-z0-9_]+)['"]\s*\)[\s\S]{0,80}?\.get\s*\(\s*\)/g;
    const q3 = /\.collection\s*\(\s*['"]([A-Za-z0-9_]+)['"]\s*\)\s*\.where\s*\(/g;
    (function walk(dir) {
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
            const p = path.join(dir, e.name);
            if (e.isDirectory()) { if (!/node_modules|_archive|_backups/.test(p)) walk(p); continue; }
            if (!/\.(html|js)$/.test(e.name)) continue;
            let s;
            try { s = fs.readFileSync(p, 'utf8'); } catch { continue; }
            for (const re of [q1, q2, q3]) {
                re.lastIndex = 0;
                let m;
                while ((m = re.exec(s))) {
                    const line = s.slice(0, m.index).split('\n').length;
                    hits.push({ file: path.relative(REPO, p), line, collection: m[1] });
                }
            }
        }
    })(APP);
    return hits;
}

function main() {
    if (!fs.existsSync(RULES)) {
        console.error('  RULES-001 could not run: firestore.rules not found');
        return 2;
    }
    const rules = parseRules(fs.readFileSync(RULES, 'utf8'));
    const hits = findClientQueries();
    if (!hits.length) {
        console.error('  RULES-001 could not run: found ZERO client collection queries, which is');
        console.error('  implausible for this codebase and means the detector is broken, not that');
        console.error('  the code is clean. A silent 0 is the failure mode this exits 2 to avoid.');
        return 2;
    }

    const violations = [];
    const seen = new Set();
    let exempt = 0;
    for (const h of hits) {
        const key = h.file + ':' + h.collection;
        if (seen.has(key)) continue;
        seen.add(key);
        if (isAdminSurface(h.file)) { exempt++; continue; }   // admin page, admin rule: correct
        const r = rules[h.collection];
        const listCond = r ? (r.list !== null ? r.list : r.read) : null;
        const open = openToOrdinaryUser(listCond);
        if (open === false || (open === null && !EXPECTED_PUBLIC.has(h.collection))) {
            violations.push({ ...h, cond: listCond || '(no rule: default deny)' });
        }
    }

    console.log(`  RULES-001: ${hits.length} client collection quer(ies), ${seen.size} file/collection pairs, ${exempt} admin-surface exempt`);
    if (!violations.length) {
        console.log('  ok   every client collection query targets a list rule an ordinary user satisfies');
        return 0;
    }
    for (const v of violations) {
        /* `CRITICAL:` prefix is REQUIRED. The smoke runner filters validator output through
           /^\s*(CRITICAL|HIGH|MEDIUM|MISSING|drift|...):/ and prints only the first few matches, so
           a diagnosis in any other shape is dropped and the operator sees a bare red line. */
        console.log(`  CRITICAL: client queries '${v.collection}' but its list rule denies ordinary users`);
        console.log(`  FAIL ${v.file}:${v.line}`);
        console.log(`         collection : ${v.collection}`);
        console.log(`         list rule  : ${v.cond}`);
        console.log('         An ordinary signed-in user running this path gets PERMISSION_DENIED.');
        console.log('         Move the query server-side (a callable using the admin SDK), or widen');
        console.log('         the rule DELIBERATELY. Do not widen it just to make this pass: the');
        console.log('         rule that caused the 2026-09-08 signup outage was CORRECT.');
    }
    console.log(`\n  ${violations.length} violation(s). This blocks by design.`);
    return 1;
}

try { process.exit(main()); }
catch (e) { console.error('  RULES-001 could not run:', e && e.message); process.exit(2); }
