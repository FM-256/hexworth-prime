/**
 * ctf-boxes.js — cross-check CTF boxes on disk against the server-side flag registry.
 *
 * WHY THIS EXISTS
 *   ops-05-operation-blackwire shipped to students fully built, listed in the arena, and
 *   completely unsolvable: it had no flag_registry doc, so validateFlag threw
 *   "Box not found in flag registry" on every submission. The box files were fine, the
 *   registry was internally consistent, and every existing EduScan rule passed. The defect
 *   lived in the GAP between two systems that no check spanned — content on disk, and flags
 *   in Firestore. It was found by hand, months late, by a cross-reference nothing ran.
 *
 *   That is the whole point of this validator: neither half is wrong on its own.
 *
 * WHY IT NEEDS CREDENTIALS, AND WHY THAT IS OK
 *   The registry is a Firestore collection, so this cannot be a purely static check. It
 *   lazily requires firebase-admin and SKIPS CLEANLY when credentials are unavailable —
 *   a scan without admin access loses this rule but never fails because of it. Never let a
 *   missing credential turn into a false CRITICAL; an unrunnable check must report that it
 *   did not run, not that everything is fine.
 *
 * RULES
 *   BOX-001 (critical) box directory on disk with NO flag_registry doc. Every flag
 *                      submission for it fails. This is the Blackwire case.
 *   BOX-002 (high)     registry doc exists but declares zero flags — nothing is solvable.
 *   BOX-003 (high)     a box declares REACHABLE flags (on a node whose page file exists)
 *                      that the registry does not know. Partial seeding: those specific
 *                      flags fail server-side while the rest of the box works.
 *
 * BOX-003 deliberately ignores flags belonging to nodes whose page file is MISSING. Staged
 * releases are legitimate — Blackwire ships gateway and database as "Phase 1" with three
 * devices unbuilt, and its unreachable flags must not be reported as unseeded.
 */
const fs = require('fs');
const path = require('path');

class CtfBoxValidator {
    /**
     * @param {object} options
     * @param {string} options.appRoot   path to _app
     * @param {string} [options.projectId]
     */
    constructor(options = {}) {
        this.appRoot = options.appRoot;
        this.projectId = options.projectId || 'hexworth-prime';
        this.boxDirs = [
            path.join(this.appRoot, 'arena', 'boxes'),
            path.join(this.appRoot, 'dispatch', 'boxes')
        ];
    }

    /** Lazily open Firestore. Returns null when unavailable — never throws. */
    async _db() {
        try {
            // firebase-admin is a dependency of functions/, not of _tools/. Resolve it from
            // there explicitly — a bare require() fails here and the check would silently
            // report SKIPPED forever, which is exactly the "looks fine, never ran" failure
            // this validator exists to prevent.
            let admin;
            try {
                admin = require('firebase-admin');
            } catch (e) {
                admin = require(path.join(__dirname, '../../../../functions/node_modules/firebase-admin'));
            }
            if (!admin.apps.length) admin.initializeApp({ projectId: this.projectId });
            const db = admin.firestore();
            // Prove we can actually read before claiming the rule ran.
            await db.collection('flag_registry').limit(1).get();
            return db;
        } catch (e) {
            return null;
        }
    }

    /** Flag ids a box declares on nodes whose page file EXISTS (i.e. actually reachable). */
    _reachableFlagIds(boxPath) {
        const configPath = path.join(boxPath, 'config.js');
        if (!fs.existsSync(configPath)) return null;          // not a flag-bearing box
        const src = fs.readFileSync(configPath, 'utf8');

        // Node blocks look like: { id: '...', ..., flags: ['f1','f2'], ..., page: 'x.html' }
        const ids = new Set();
        const nodeRe = /flags:\s*\[([^\]]*)\][\s\S]{0,400}?page:\s*'([^']+)'/g;
        let m, sawAny = false;
        while ((m = nodeRe.exec(src)) !== null) {
            sawAny = true;
            const page = m[2];
            if (!fs.existsSync(path.join(boxPath, page))) continue;   // unbuilt node — skip
            (m[1].match(/'([^']+)'/g) || []).forEach(q => ids.add(q.replace(/'/g, '')));
        }
        return sawAny ? ids : null;
    }

    async validate() {
        const issues = [];
        const db = await this._db();
        if (!db) {
            issues.push({
                code: 'BOX-000',
                severity: 'info',
                category: 'ctf',
                message: 'CTF box/registry cross-check SKIPPED — no Firestore credentials. '
                       + 'BOX-001..003 did not run; this is not a pass.',
                file: '_tools/eduscan/validators/functional/ctf-boxes.js',
                fix: 'Run with application-default credentials to enable this check.'
            });
            return issues;
        }

        const snap = await db.collection('flag_registry').get();
        const registry = new Map();
        snap.forEach(d => {
            const data = d.data() || {};
            const flags = data.flags || {};
            const aliases = data.aliases || {};
            // Canonical ids only — several accepted spellings may alias to one flag.
            registry.set(d.id, new Set(Object.keys(flags).map(k => aliases[k] || k)));
        });

        for (const dir of this.boxDirs) {
            if (!fs.existsSync(dir)) continue;
            for (const boxId of fs.readdirSync(dir)) {
                if (boxId.startsWith('.')) continue;
                const boxPath = path.join(dir, boxId);
                if (!fs.statSync(boxPath).isDirectory()) continue;

                const reachable = this._reachableFlagIds(boxPath);
                if (reachable === null) continue;    // no flag-bearing config; not our concern
                const rel = path.relative(this.appRoot, boxPath);

                if (!registry.has(boxId)) {
                    issues.push({
                        code: 'BOX-001',
                        severity: 'critical',
                        category: 'ctf',
                        message: `Box "${boxId}" has no flag_registry entry. validateFlag throws `
                               + `"Box not found in flag registry" on EVERY submission — the box `
                               + `is playable and unsolvable.`,
                        file: rel,
                        fix: `Seed flag_registry/${boxId} with the values its pages actually `
                           + `reveal, or remove the box from the arena listing.`
                    });
                    continue;
                }

                const known = registry.get(boxId);
                if (known.size === 0) {
                    issues.push({
                        code: 'BOX-002',
                        severity: 'high',
                        category: 'ctf',
                        message: `Box "${boxId}" has a flag_registry entry with zero flags — `
                               + `nothing in it can be solved.`,
                        file: rel,
                        fix: `Populate flag_registry/${boxId}.flags.`
                    });
                    continue;
                }

                const unseeded = [...reachable].filter(f => !known.has(f));
                if (unseeded.length) {
                    issues.push({
                        code: 'BOX-003',
                        severity: 'high',
                        category: 'ctf',
                        message: `Box "${boxId}" declares reachable flag(s) the registry does not `
                               + `know: ${unseeded.join(', ')}. Those submissions fail server-side `
                               + `while the rest of the box works.`,
                        file: rel,
                        fix: `Add ${unseeded.join(', ')} to flag_registry/${boxId}.flags, or alias `
                           + `them to an existing canonical flag id.`
                    });
                }
            }
        }

        return issues;
    }
}

module.exports = CtfBoxValidator;
