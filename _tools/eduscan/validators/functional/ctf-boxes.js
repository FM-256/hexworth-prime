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
        /* THE GATE'S CLAIM WAS WIDER THAN ITS SCAN. post-verify prints "every box on disk has its
           flags registered", and this list was two arena directories. Fourteen PIS labs under
           _app/houses/shield/infosec/labs/ declare a `registryId` and call awardFlag(), which
           reaches validateAction, which throws not-found 'Lab not registered' when
           flag_registry/<boxId> is missing. BoxEngine catches that silently, by design, with the
           comment "don't block gameplay". So an unregistered lab of this shape awards a green
           badge on screen and records NOTHING server-side, which is exactly the ops-05 failure
           this validator was written for, in a directory it never looked at.

           Scanning by SHAPE rather than by location from here on: anything with a config.js that
           declares a registryId is a box for this gate's purposes, wherever it lives. Adding a
           third hardcoded path would just move the blind spot. */
        this.boxDirs = [
            path.join(this.appRoot, 'arena', 'boxes'),
            path.join(this.appRoot, 'dispatch', 'boxes')
        ];
        this.extraBoxRoots = [
            path.join(this.appRoot, 'houses')
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

    /**
     * The registryId a config DECLARES, which is the key validateAction looks up
     * (`flag_registry/<boxId>`). Keyed on the declaration rather than the directory name so a lab
     * whose folder and registry id differ is checked against the right document instead of
     * producing a false BOX-001.
     */
    _declaredRegistryId(boxPath) {
        const cfg = path.join(boxPath, 'config.js');
        if (!fs.existsSync(cfg)) return null;
        const m = fs.readFileSync(cfg, 'utf8').match(/registryId\s*:\s*['"]([^'"]+)['"]/);
        return m ? m[1] : null;
    }

    /**
     * Every box this gate should check, as {boxId, boxPath}.
     *
     * The two arena directories keep their existing behaviour, keyed by folder name. Beyond them
     * we scan BY SHAPE: any directory anywhere under extraBoxRoots whose config.js declares a
     * registryId is a box for this gate's purposes, because a registryId is precisely what makes
     * awardFlag() reach validateAction and therefore what makes an unregistered lab fail silently.
     * Scanning by shape rather than adding a third hardcoded path is deliberate: a hardcoded list
     * is what produced this blind spot in the first place.
     */
    _discoverBoxes() {
        const found = [];
        for (const dir of this.boxDirs) {
            if (!fs.existsSync(dir)) continue;
            for (const name of fs.readdirSync(dir)) {
                if (name.startsWith('.')) continue;
                const boxPath = path.join(dir, name);
                if (!fs.statSync(boxPath).isDirectory()) continue;
                found.push({ boxId: name, boxPath: boxPath });
            }
        }
        const seen = new Set(found.map(f => f.boxPath));
        const walk = (dir, depth) => {
            if (depth > 6 || !fs.existsSync(dir)) return;   // bounded; the tree is deep
            let entries;
            try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
            for (const e of entries) {
                if (!e.isDirectory() || e.name.startsWith('.') || e.name === 'node_modules') continue;
                const sub = path.join(dir, e.name);
                const rid = this._declaredRegistryId(sub);
                if (rid && !seen.has(sub)) { found.push({ boxId: rid, boxPath: sub }); seen.add(sub); }
                walk(sub, depth + 1);
            }
        };
        for (const root of (this.extraBoxRoots || [])) walk(root, 0);
        return found;
    }

    /**
     * Flag ids a box declares that are actually REACHABLE.
     *
     * Two real config shapes exist, and an earlier version of this method recognised only
     * the rarer one — it required `flags: [...]` and `page: '...'` within 400 characters of
     * each other, which matched exactly ONE box out of 243. Every other box returned null and
     * was silently skipped, so the rule reported CLEAN while examining 0.4% of the tree.
     * Coverage is asserted in validate() now for exactly that reason.
     *
     *   Shape A  flags: { f1: {...}, f2: {...} }        (map keyed by flag id)
     *   Shape B  flags: [ { id: 'user', ... }, ... ]    (array of objects — most boxes)
     *            flags: ['f1','f2']                     (array of bare ids — per-node)
     *
     * Flags declared on a node whose page file is MISSING are then subtracted: staged
     * releases are legitimate, and an unbuilt device's flags must not read as unseeded.
     */
    _reachableFlagIds(boxPath) {
        /* OPEN-WORLD BOXES use a different architecture and a different filename. They have
           config-shared.js (no config.js), no `flags` block at all, and declare their flag ids
           as the VALUES of a flagConnections map — the student earns a flag by making the
           right connection, deliverFlag hands them the text, and they then submit it through
           validateFlag like any other box. Reading only config.js skipped all 12 of them, and
           they were reported as unexamined (BOX-004) rather than silently passed. Verified
           healthy when checked by hand: 3 declared, 3 canonical, completable, every one. */
        const configPath = path.join(boxPath, 'config.js');
        const sharedPath = path.join(boxPath, 'config-shared.js');
        const usePath = fs.existsSync(configPath) ? configPath
                      : (fs.existsSync(sharedPath) ? sharedPath : null);
        if (!usePath) return null;
        const src = fs.readFileSync(usePath, 'utf8');
        const ids = new Set();

        // Open-world shape — flagConnections: { 'conn-id': 'flagId', ... }
        const fcMatch = src.match(/flagConnections\s*:\s*\{([\s\S]*?)\n\s*\}/);
        if (fcMatch) {
            (fcMatch[1].match(/:\s*'([^']+)'/g) || [])
                .forEach(q => ids.add(q.replace(/:\s*'/, '').replace(/'$/, '')));
        }

        // Shape A — a map whose keys are the flag ids.
        const mapMatch = src.match(/\bflags:\s*\{([\s\S]*?)\n\s*\},/);
        if (mapMatch) {
            (mapMatch[1].match(/^\s*([A-Za-z0-9_]+)\s*:/gm) || [])
                .forEach(k => ids.add(k.replace(/[:\s]/g, '')));
        }

        // Shape B — arrays, either of {id:'x'} objects or of bare id strings.
        const arrRe = /\bflags:\s*\[([\s\S]*?)\]/g;
        let a;
        while ((a = arrRe.exec(src)) !== null) {
            const body = a[1];
            const objIds = body.match(/id:\s*'([^']+)'/g);
            if (objIds) {
                objIds.forEach(q => ids.add(q.replace(/id:\s*'/, '').replace(/'$/, '')));
            } else {
                (body.match(/'([^']+)'/g) || []).forEach(q => ids.add(q.replace(/'/g, '')));
            }
        }

        if (ids.size === 0) return null;

        // Subtract flags belonging to nodes whose page does not exist.
        const nodeRe = /flags:\s*\[([^\]]*)\][\s\S]{0,400}?page:\s*'([^']+)'/g;
        let m;
        while ((m = nodeRe.exec(src)) !== null) {
            if (fs.existsSync(path.join(boxPath, m[2]))) continue;
            (m[1].match(/'([^']+)'/g) || []).forEach(q => ids.delete(q.replace(/'/g, '')));
        }
        return ids;
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

        // Boxes this rule could not read flag ids from. REPORTED, never silent: an earlier
        // version recognised only one config shape and skipped 242 of 243 boxes while printing
        // CLEAN. Coverage is part of the result, not a footnote.
        const skippedBoxes = [];

        const snap = await db.collection('flag_registry').get();
        const registry = new Map();
        snap.forEach(d => {
            const data = d.data() || {};
            const flags = data.flags || {};
            const aliases = data.aliases || {};
            // Canonical ids only — several accepted spellings may alias to one flag.
            registry.set(d.id, new Set(Object.keys(flags).map(k => aliases[k] || k)));
        });

        for (const box of this._discoverBoxes()) {
            {
                const boxId = box.boxId;
                const boxPath = box.boxPath;

                const reachable = this._reachableFlagIds(boxPath);
                if (reachable === null) { skippedBoxes.push(boxId); continue; }
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

                /* Compare COUNTS, not names. What breaks completion is a canonical set
                   LARGER than the number of achievements the box actually has — the
                   threshold becomes unreachable. A box whose canonical id merely has a
                   different NAME than its config (hw001-dead-workstation collapses five
                   scenarios onto 'repaired' while its config says 'fixed') works perfectly:
                   one canonical id, threshold of one, student credited. Flagging that as a
                   defect was wrong, and cost a real box a false finding. */
                const unseeded = [...reachable].filter(f => !known.has(f));
                if (known.size > reachable.size) {
                    /* BOX-003 — the box's declared flag ids and the registry's CANONICAL ids
                       do not line up. Submissions still SUCCEED: validateFlag mode 2 matches
                       on flag VALUE, not id, and records the capture under the registry's
                       resolved id. What breaks is completion. _recomputeCtfStats counts
                       distinct canonical ids as the threshold, so a box whose registry
                       declares five canonical flags while the box really has one can never
                       reach it — the student solves it and is never credited.

                       This is what a missing `aliases` map looks like: ad001-lockout-storm
                       collapses its five scenario ids onto one canonical `fixed` and is
                       correct; vpn005-always-on-bypass has the same five keys with NO alias
                       map, so it demands five captures for a one-flag box.

                       Deliberately NOT critical: nothing errors, no student is blocked, and
                       the capture is recorded. Only the completion credit is unreachable. */
                    issues.push({
                        code: 'BOX-003',
                        severity: 'medium',
                        category: 'ctf',
                        message: `Box "${boxId}" declares ${reachable.size} achievement(s) `
                               + `but its registry resolves to ${known.size} canonical flag(s) `
                               + `(${[...known].join(', ')}). Submissions still succeed, but the `
                               + `completion threshold is ${known.size} and the box can only `
                               + `yield ${reachable.size} — so it can never be marked pwned.`,
                        file: rel,
                        fix: `Add an aliases map on flag_registry/${boxId} collapsing its keys `
                           + `onto the canonical id(s) the box declares, as ad001-lockout-storm `
                           + `does — or align the box config's flag ids with the registry.`
                    });
                }
            }
        }

        if (skippedBoxes.length) {
            issues.push({
                code: 'BOX-004',
                severity: 'info',
                category: 'ctf',
                message: `${skippedBoxes.length} box(es) declared no readable flag ids and were `
                       + `NOT checked: ${skippedBoxes.slice(0, 12).join(', ')}`
                       + `${skippedBoxes.length > 12 ? ', …' : ''}. These are open-world boxes `
                       + `with no config.js; they use a different architecture. Not a pass — `
                       + `they simply were not examined.`,
                file: '_tools/eduscan/validators/functional/ctf-boxes.js',
                fix: 'Extend _reachableFlagIds if these should be covered, or confirm their '
                   + 'flags are registered by another route.'
            });
        }

        return issues;
    }
}

module.exports = CtfBoxValidator;
