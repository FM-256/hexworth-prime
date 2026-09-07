#!/usr/bin/env node
/**
 * gen-completion-registry.js — the canonical set of valid completion ids
 *
 * @catalog what    Generates functions/completion-registry.json: every completion id the platform
 * @catalog what    can legitimately award, unioned from declared content plus the ids students
 * @catalog what    already hold. --check fails if the committed registry is stale.
 * @catalog run     node _tools/content/gen-completion-registry.js
 * @catalog run     node _tools/content/gen-completion-registry.js --check
 * @catalog status  GATE
 *
 * WHY THIS EXISTS
 * ---------------
 * BUG-264: `recordProgress` and `syncProgress` accept any string as a completed module or lab and
 * `deriveXP` pays XP for it, so a student can mint arbitrary XP for work never done. Proven in
 * production. The fix is existence validation, and the reason it was never written is that THERE
 * WAS NOTHING TO VALIDATE AGAINST.
 *
 * Measured before building this, against a real snapshot of 7528 completions held by 3874 users:
 *   scraping ModuleProgress.complete call sites          0.7% coverage
 *   + LearningPaths + trackerKeys + house prefixes      55.1% coverage
 * Enforcing at 55% would have REJECTED 3383 real completions -- cloud-openstack-neutron held by 32
 * students, forge-raid-config by 30. That is far more student work destroyed than forgery
 * prevented, and it is the third time in one session that testing a change against production data
 * stopped one that would have deleted real progress.
 *
 * Coverage is poor because completion ids are DATA-DRIVEN, not literals: `_app/path-view.html`
 * pushes straight to `progress.completedModules` with an id assembled from URL params and
 * LearningPaths lookups, never touching ModuleProgress.complete. There is no single source of
 * truth, which is exactly why no one could add validation.
 *
 * THE SHAPE OF THE FIX IS THIS REPO'S OWN. `_tools/hexos/gen-app-manifest.js` generates the Hex OS
 * manifest from sources and deploy.sh gate 3.8 runs it with `--check`, so a stale manifest blocks
 * the deploy. Same contract here.
 *
 * THE LEGACY FLOOR IS NOT OPTIONAL. `_tools/content/legacy-completion-ids.json` holds the 774
 * distinct ids students already hold, from BOTH surfaces: `users/{uid}` and the per-class rosters
 * at `tenants/{slug}/classes/{id}/progress/{uid}`. Content ids only, no PII. Declared sources cover
 * barely half of each -- 55.1% of user completions and 53.6% of roster entries -- so without this
 * floor, enforcement deletes half the platform's earned progress and breaks gradebooks.
 * NOTHING IS EXCLUDED FROM THE FLOOR. One id was excluded as "garbage" on 2026-09-07 and that was
 * WRONG: `forge-forge-core2-virtualization-lab` is declared at ContentCatalog.js:524 and completed
 * by a real page. A student earned it. If you find yourself about to exclude an id here, open the
 * catalogue first -- that mistake survived a review and a deploy because nobody did.
 *
 * AND THE GATE IS THE POINT. If new content ships without regenerating this registry, every
 * student who completes that new module gets rejected -- the identical data-loss failure in a new
 * coat. `--check` in the deploy gate is what stops that, not discipline.
 *
 * EXIT: 0 written / in sync. 1 stale (--check only). 2 could not run.
 */
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '../..');
const OUT = path.join(REPO, 'functions/completion-registry.json');
const LEGACY = path.join(__dirname, 'legacy-completion-ids.json');

/* Kept in sync with functions/index.js _KNOWN_HOUSES (GUARD-07 enforces that they agree).
   Used only to expand bare LearningPaths ids into their house-prefixed forms, because
   path-view.html strips the house prefix before looking an id up. */
const HOUSES = ['ai', 'ala', 'arena', 'career', 'cloud', 'code', 'dark-arts', 'divergent', 'eth',
                'eye', 'forensics', 'forge', 'key', 'linux', 'matrix', 'observatory',
                'platform', 'script', 'shield', 'signal', 'web', 'windows'];

function walk(dir, fn) {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (/node_modules|_archive|_backups/.test(p)) continue;
            walk(p, fn);
        } else fn(p, e.name);
    }
}

function collect() {
    const sources = { learningPaths: 0, trackerKeys: 0, callSites: 0, legacy: 0 };
    const ids = new Set();

    // 1. LearningPaths declares module ids, bare. path-view.html strips the house prefix to match,
    //    so both the bare and the house-prefixed forms are legitimate completion ids.
    const lpFile = path.join(REPO, '_app/components/LearningPaths.js');
    if (fs.existsSync(lpFile)) {
        const lp = fs.readFileSync(lpFile, 'utf8');
        for (const m of lp.matchAll(/id:\s*'([a-zA-Z0-9._-]+)'/g)) {
            ids.add(m[1]); sources.learningPaths++;
            for (const h of HOUSES) ids.add(h + '-' + m[1]);
        }
    }

    // 2. Box trackerKeys. These ARE the completion id for a lab/CTF box -- BoxEngine passes the
    //    trackerKey straight to ProgressManager.completeModule.
    walk(path.join(REPO, '_app'), (p, name) => {
        if (name !== 'config.js') return;
        for (const m of fs.readFileSync(p, 'utf8').matchAll(/trackerKey:\s*'([^']+)'/g)) {
            ids.add(m[1]); sources.trackerKeys++;
        }
    });

    /* 3. ModuleProgress.complete call sites, WITH VARIABLE RESOLUTION.
       This originally matched only LITERAL arguments, and that omission broke production: at least
       74 shipping pages -- the AI-102 certification series, AI Agents, AI Automation, AI Cortex --
       write `const MODULE_ID = 'ai13-langchain'; ModuleProgress.complete(HOUSE_ID, MODULE_ID);`.
       A literal-only regex cannot see those, so their ids never reached the registry, enforcement
       rejected them, and honest students finishing that content got no XP, no cross-device sync and
       no gradebook entry. Measured across _app: 2233 call sites pass literals, 404 pass
       (literal, VAR), and 234 pass (VAR, VAR) -- so a third of them were invisible.
       Resolution is deliberately simple: a same-file `const NAME = 'literal'` declaration. That
       reaches 2815 of 2883 call sites (97.6%). The remaining 68 build an id from an object property
       or a loop variable and are NOT resolvable this way; they are why the legacy floor still
       matters and why enforcement must not be re-enabled on this source alone.
       ID FORM: both `house-key` (what recordProgress and syncProgress receive, since
       ModuleProgress.complete builds `${houseId}-${moduleId}`) and the bare key (what
       syncClassProgress receives). */
    walk(path.join(REPO, '_app'), (p, name) => {
        if (!/\.(html|js)$/.test(name)) return;
        const s = fs.readFileSync(p, 'utf8');
        const vars = {};
        for (const m of s.matchAll(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*['"]([^'"]+)['"]/g)) {
            vars[m[1]] = m[2];
        }
        const unquote = (x) => x.replace(/^['"]|['"]$/g, '');
        const isLit = (x) => /^['"]/.test(x.trim());
        for (const m of s.matchAll(/ModuleProgress\.complete\(\s*([^,)]+)\s*,\s*([^,)]+)/g)) {
            const a = m[1].trim(), b = m[2].trim();
            const house = isLit(a) ? unquote(a) : vars[a];
            const key = isLit(b) ? unquote(b) : vars[b];
            if (!house || !key) continue;          // unresolvable: an object property or loop var
            ids.add(house + '-' + key);
            ids.add(key);
            sources.callSites++;
        }
    });

    // 4. THE FLOOR: ids students already hold. Without this, enforcement deletes earned work.
    if (!fs.existsSync(LEGACY)) {
        throw new Error('legacy-completion-ids.json missing — refusing to build a registry that ' +
                        'would reject work students have already earned');
    }
    const legacy = JSON.parse(fs.readFileSync(LEGACY, 'utf8'));
    for (const id of legacy.ids) { ids.add(id); sources.legacy++; }

    return { ids: [...ids].sort(), sources, excluded: legacy.excluded };
}

function main() {
    const check = process.argv.includes('--check');
    let built;
    try { built = collect(); }
    catch (e) { console.error('  gen-completion-registry could not run:', e.message); return 2; }

    const payload = {
        what: 'Every completion id the platform can legitimately award. Used by recordProgress and ' +
              'syncProgress to reject fabricated module/lab ids (BUG-264).',
        warning: 'GENERATED. Do not hand-edit. Run _tools/content/gen-completion-registry.js. ' +
                 'If you ship new content without regenerating, every student who completes it is ' +
                 'rejected — the same data loss this file exists to prevent.',
        knownSlack: 'DELIBERATE FALSE-POSITIVE SURFACE. LearningPaths declares module ids bare, and ' +
                 'path-view.html strips a house prefix before matching, so this generator expands ' +
                 'each declared id across all 22 houses. That means nonsense combinations like ' +
                 'windows-shield-cia-triad are ACCEPTED. There is no per-id record of which house ' +
                 'prefixes are legitimate, so the alternative is guessing — and guessing wrong ' +
                 'rejects a real completion, which costs a student their work. The trade is chosen ' +
                 'in that direction on purpose: this registry exists to stop fabricated ids earning ' +
                 'XP, and a cross-product id still has to be a real declared module underneath. ' +
                 'Tighten it only when a per-id house mapping exists to tighten it WITH.',
        sources: built.sources,
        excluded: built.excluded,
        count: built.ids.length,
        ids: built.ids,
    };
    const next = JSON.stringify(payload, null, 1);

    if (check) {
        if (!fs.existsSync(OUT)) {
            console.error('  STALE: functions/completion-registry.json does not exist. Run the generator.');
            return 1;
        }
        const cur = fs.readFileSync(OUT, 'utf8');
        const a = JSON.parse(cur).ids || [], b = built.ids;
        if (a.length === b.length && a.every((v, i) => v === b[i])) {
            console.log(`  completion registry in sync (${b.length} ids)`);
            return 0;
        }
        const missing = b.filter(x => !a.includes(x));
        const extra = a.filter(x => !b.includes(x));
        console.error('  STALE: functions/completion-registry.json does not match the content tree.');
        if (missing.length) console.error(`    ${missing.length} id(s) in content but NOT in the registry — students completing these would be REJECTED:`);
        missing.slice(0, 8).forEach(x => console.error('      + ' + x));
        if (extra.length) console.error(`    ${extra.length} id(s) in the registry but no longer in content:`);
        extra.slice(0, 8).forEach(x => console.error('      - ' + x));
        console.error('  Run: node _tools/content/gen-completion-registry.js');
        return 1;
    }

    fs.writeFileSync(OUT, next);
    console.log(`  wrote ${path.relative(REPO, OUT)}`);
    console.log(`    total ids       ${built.ids.length}`);
    console.log(`    LearningPaths   ${built.sources.learningPaths} declared (expanded across ${HOUSES.length} houses)`);
    console.log(`    trackerKeys     ${built.sources.trackerKeys}`);
    console.log(`    literal calls   ${built.sources.callSites}`);
    console.log(`    legacy floor    ${built.sources.legacy}  <- ids students already hold`);
    return 0;
}

try { process.exit(main()); }
catch (e) { console.error('  gen-completion-registry failed:', e && e.message); process.exit(2); }
