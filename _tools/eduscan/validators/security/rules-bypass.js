/**
 * rules-bypass.js — find Cloud Function validation that firestore.rules lets clients skip.
 *
 * WHY THIS EXISTS
 *   Twice on 2026-08-04 a gate was written into a Cloud Function and declared closed, while
 *   firestore.rules quietly permitted a client to write the same document directly:
 *
 *     tenants/{id}/classes/{classId}       — adminUids could create a class for any course,
 *                                            bypassing adminCreateClass and its licence check
 *     .../classes/{id}/assignments/{id}    — the identical hole one level down. PROVEN: a
 *                                            direct REST write landed a 300-char title, points
 *                                            999999999, a bogus contentType and status, and a
 *                                            FORGED createdBy — every validation optional
 *
 *   Cloud Functions run on the Admin SDK, which BYPASSES rules. That makes a CF the right
 *   place for validation — but only if nothing else can write the document. The reasoning
 *   "if the bad record never gets created, nothing downstream can use it" is false whenever
 *   the rules layer is itself an ungated writer.
 *
 *   Nothing detected this. Both were found by reading, late, after shipping.
 *
 * WHAT IT FLAGS
 *   SEC-010 (high) a collection has a non-trivial client write rule AND a Cloud Function that
 *                  writes the same path. The CF's validation is bypassable.
 *   SEC-011 (medium) VERB ASYMMETRY — `create` is scoped to request.auth.uid while `update`
 *                  is not. Whoever wrote it understood ownership and applied it to one verb.
 *                  This is exactly the edt_submissions defect: create was uid-scoped, update
 *                  was bare, and any user could forge a grade on anyone's submission.
 *
 * DELIBERATELY STATIC. Reads firestore.rules and functions/index.js only — no credentials, no
 * network — so it can run anywhere, including a pre-deploy gate.
 *
 * KNOWN LIMIT, STATED RATHER THAN HIDDEN: matching a rules path to a CF path is textual. A CF
 * that builds its path from variables will be missed. This narrows the gap; it does not close
 * it. Treat a clean result as "no obvious bypass", never as "proven safe".
 */
const fs = require('fs');
const path = require('path');

class RulesBypassValidator {
    constructor(options = {}) {
        this.repoRoot = options.repoRoot;
    }

    /** Collection paths a Cloud Function writes, as literal db.doc/db.collection strings. */
    _cfWritePaths(src) {
        const paths = new Set();
        // db.doc(`a/${x}/b/${y}`) and db.collection('a/b') — capture the literal segments
        const re = /db\s*\.\s*(?:doc|collection)\s*\(\s*[`'"]([^`'"]+)[`'"]/g;
        let m;
        while ((m = re.exec(src)) !== null) {
            // normalise ${...} interpolations to a wildcard so paths compare structurally
            paths.add(m[1].replace(/\$\{[^}]*\}/g, '*').replace(/^\/+|\/+$/g, ''));
        }
        return paths;
    }

    /** Does a rules match path correspond to a CF-written path? */
    _matches(rulesPath, cfPaths) {
        const norm = rulesPath.replace(/\{[^}]*\}/g, '*').replace(/^\/+|\/+$/g, '');
        // A rules path names a DOCUMENT (.../classes/{classId}); a Cloud Function often names
        // the COLLECTION instead, via db.collection(`.../classes`).add(...). Comparing only
        // for equality missed exactly that — and it was the shape of the real class-write
        // bypass, so the rule silently failed to catch the bug it was written for.
        const parent = norm.replace(/\/\*$/, '');
        for (const p of cfPaths) {
            if (p === norm) return true;
            if (p === parent) return true;                 // CF writes the collection, rule guards the doc
            if (p.startsWith(norm + '/')) return true;     // CF owns a subcollection beneath it
        }
        return false;
    }

    validate() {
        const issues = [];
        const rulesPath = path.join(this.repoRoot, 'firestore.rules');
        const fnPath = path.join(this.repoRoot, 'functions', 'index.js');
        if (!fs.existsSync(rulesPath) || !fs.existsSync(fnPath)) return issues;

        const rulesSrc = fs.readFileSync(rulesPath, 'utf8');
        const cfPaths = this._cfWritePaths(fs.readFileSync(fnPath, 'utf8'));

        const lines = rulesSrc.split('\n');
        const stack = [];
        let depth = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            /* [^\s{]+ STOPPED AT THE FIRST BRACE, so /tenants/{tenantId}/classes/{classId}
               was captured as "/tenants/". Every path this rule compared was truncated
               garbage, which is why it reported clean against a ruleset containing the exact
               bypass it was written to find. Rules are always written `match /path {`, so
               take everything up to the whitespace before the brace. */
            const mm = line.match(/match\s+(\/\S+)\s*\{/);
            if (mm) stack.push({ seg: mm[1], depth });
            depth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
            while (stack.length && depth <= stack[stack.length - 1].depth) stack.pop();

            const am = line.match(/allow\s+([a-z,\s]+):\s*if\s+(.*)$/);
            if (!am) continue;
            const verbs = am[1].split(',').map(v => v.trim());
            if (!verbs.some(v => ['write', 'create', 'update', 'delete'].includes(v))) continue;

            // gather the full predicate (it may wrap across lines)
            let pred = am[2];
            let j = i;
            while (!pred.trim().endsWith(';') && j + 1 < lines.length && j - i < 8) {
                pred += ' ' + lines[++j].trim();
            }
            if (/\bif\s+false\b/.test('if ' + pred)) continue;              // CF-only, fine
            if (/isAdmin\(\)/.test(pred)) continue;                          // admin-gated, fine
            /* OWNERSHIP vs MEMBERSHIP — the distinction that decides whether this is a bug.
               `resource.data.senderUid == request.auth.uid` (either operand order) means the
               caller may only touch their OWN document: that is a real guard, skip it.
               `request.auth.uid in <some list>` means the caller belongs to a GROUP, which is
               exactly the class/assignments bypass — adminUids membership let a whole
               population write documents a Cloud Function was supposed to validate. Do NOT
               treat membership as ownership.
               An earlier version tested only `request.auth.uid ==` and so missed the reversed
               operand order, producing false positives on correctly-scoped rules. */
            const ownershipScoped = /request\.auth\.uid\s*==/.test(pred)
                                 || /==\s*request\.auth\.uid/.test(pred);
            if (ownershipScoped) continue;

            const full = stack.map(s => s.seg).join('').replace(/^\/databases\/\{database\}\/documents/, '');
            if (!full) continue;

            if (this._matches(full, cfPaths)) {
                issues.push({
                    code: 'SEC-010',
                    severity: 'high',
                    category: 'security',
                    message: `firestore.rules permits a client ${verbs.join('/')} on "${full}", and a `
                           + `Cloud Function writes the same path. Any validation that function `
                           + `performs is bypassable — the client can write the document directly.`,
                    file: `firestore.rules:${i + 1}`,
                    fix: 'Remove the client write (Firestore denies by default) and route all writes '
                       + 'through the Cloud Function, as tenants/{id}/classes/{classId} now does.'
                });
            }
        }

        // Verb asymmetry — create scoped to the caller, update not.
        const blocks = rulesSrc.split(/match\s+/).slice(1);
        for (const b of blocks) {
            const head = (b.match(/^(\/\S+)\s*\{/) || [])[1];   // same truncation bug
            if (!head) continue;
            const create = b.match(/allow\s+create[^;]*;/);
            const update = b.match(/allow\s+update[^;]*;/);
            if (!create || !update) continue;
            const createScoped = /request\.auth\.uid/.test(create[0]);
            const updateScoped = /request\.auth\.uid/.test(update[0]) || /if\s+false/.test(update[0])
                              || /isAdmin\(\)/.test(update[0]);
            if (createScoped && !updateScoped) {
                issues.push({
                    code: 'SEC-011',
                    severity: 'medium',
                    category: 'security',
                    message: `VERB ASYMMETRY on "${head}": create is scoped to request.auth.uid but `
                           + `update is not. Whoever wrote this understood ownership mattered and `
                           + `applied it to one verb only — the edt_submissions defect exactly, where `
                           + `any user could forge a grade on another student's submission.`,
                    file: 'firestore.rules',
                    fix: 'Scope update the same way create is scoped, or close it to Cloud Functions.'
                });
            }
        }

        return issues;
    }
}

module.exports = RulesBypassValidator;
