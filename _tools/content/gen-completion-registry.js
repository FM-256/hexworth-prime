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

/* ── BUG-274: READ EVERY DECLARATOR, NOT JUST THE FIRST IN THE STATEMENT ─────────────────────────
 * The previous declaration scan was one regex:
 *     /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*['"]([^'"]+)['"]/g
 * It anchors the identifier directly to the keyword, so in a comma-separated declaration it sees
 * the FIRST declarator and nothing after it:
 *     const MODULE_ID='cx-nlp-02', HOUSE_ID='ai';     -> HOUSE_ID never recorded
 *     var M='cx-adv-02',H='ai',done=false;            -> H never recorded
 * With the house unresolvable, the call site was skipped entirely, so the ENTIRE AI Cortex series
 * (cx-nlp / cx-adv / cx-cap / cx-ops / cx-sec, ~50 pages) was absent from the registry. Same
 * consequence as BUG-273 by a different mechanism, and the same one this file's header was written
 * about: enforcement would reject honest students finishing shipped content.
 *
 * AMBIGUITY IS DELETED, NOT RESOLVED. Capturing more declarators also means more chance that one
 * file declares the same name twice with different literals in different scopes. The old scan took
 * last-wins silently. A WRONG id is worse than a missing one — the floor covers a miss, while a
 * wrong entry pollutes the allowlist — so a name declared with conflicting literals is dropped and
 * its call sites become unresolvable. Safe direction, and the count is reported.
 *
 * Known and deliberate limit: a non-literal initializer ends the scan of that statement, so
 * `var a = fn(), B = 'x'` loses B. Conservative by choice — correctly parsing an arbitrary
 * initializer means writing a JS parser, and a miss is the cheap failure.
 *
 * THE LIMIT THAT MATTERS MOST, AND IT IS NOT FIXED: `vars` IS FILE-SCOPED AND FLAT. There is no
 * model of JS scope here, so a `const` declared inside one IIFE or one <script> block can resolve
 * a call site in a DIFFERENT block of the same file that never sees that binding, and identical
 * redeclarations pass the ambiguity guard untouched — only CONFLICTING literals are dropped. The
 * consequence is bounded in the safe direction: over-resolution ADDS an allowlist entry rather
 * than removing one, so it cannot reject work a student earned; the cost is a possibly-unreachable
 * entry, which matters only because BUG-272 makes every entry claimable. Fixing it properly means
 * scope tracking, i.e. a real parser. registry-coverage.js ARM B shares this limitation by
 * construction and therefore cannot detect it — the two implementations are independent in their
 * parsing strategy, NOT in this assumption. Filed as the standing limitation on BUG-275. */
/* Returns the initializer expression text for a declarator, so resolveExpr can evaluate it whole.
 * Scans honouring quote state and stops at a top-level `,` or `;`. A newline also ends it UNLESS
 * the text so far ends in `+`, which keeps a concatenation split across lines intact. Capped so a
 * malformed file cannot make this run away. */
function readRhs(s, start) {
    const CAP = 400;
    let i = start, q = null, out = '';
    while (i < s.length && out.length < CAP) {
        const c = s[i];
        if (q) {
            out += c;
            if (c === '\\') { out += s[i + 1] || ''; i += 2; continue; }
            if (c === q) q = null;
            i++;
            continue;
        }
        if (c === "'" || c === '"') { q = c; out += c; i++; continue; }
        if (c === ',' || c === ';') break;
        if (c === '\n') {
            /* A concatenation may continue across a newline in EITHER style, and the first version
             * of this only handled one of them:
             *     const a = 'x-' +        <- trailing operator, handled from the start
             *               ID;
             *     const a = 'x-'          <- LEADING operator, silently truncated to 'x-'
             *               + ID;
             * Nancy found the gap and swept for it: the leading style exists in this codebase
             * (_app/admin/console.html:5025, _app/hex/apps.html:219 and 7 more) though none of the
             * 9 currently feed a ModuleProgress.complete argument. Latent, but the failure mode is
             * the bad kind — it hands resolveExpr a complete-LOOKING truncated string, which
             * resolves successfully instead of returning null. Confidently wrong beats silently
             * absent only in the sense that it is worse. So look ahead: continue only if the next
             * non-whitespace character is the operator itself, which cannot swallow a following
             * statement (`const B = ...` starts with 'c', not '+'). */
            if (/\+\s*$/.test(out)) { out += ' '; i++; continue; }
            let j = i;
            while (j < s.length && /\s/.test(s[j])) j++;
            if (s[j] === '+') { out += ' '; i = j; continue; }
            break;
        }
        out += c;
        i++;
    }
    const text = out.trim();
    return text ? { text, len: i - start } : null;
}

function collectVars(s) {
    const vars = {};
    const conflict = new Set();
    const DECL = /(?:^|[^\w$.])(?:const|let|var)\s+/g;
    let dm;
    while ((dm = DECL.exec(s)) !== null) {
        let i = dm.index + dm[0].length;
        for (;;) {
            const name = /^([A-Za-z_$][\w$]*)\s*/.exec(s.slice(i));
            if (!name) break;
            i += name[0].length;
            if (s[i] === '=' && s[i + 1] !== '=') {
                i++;
                /* RESOLVE THE WHOLE RIGHT-HAND SIDE, not just a leading literal. Nancy caught the
                 * leading-literal version carrying the IDENTICAL defect as BUG-273 one scope over:
                 * given `const longKey = 'script-' + MODULE_ID;` it matched `'script-'` and stored
                 * that as longKey's value. 52 Linux-Mastery pages declare exactly that
                 * (_app/houses/script/modules/linux-mastery/script-lm-*.module.html:583), and the
                 * truncated value reached the registry as the entries "script-" and
                 * "script-script-" — ids no page writes. I fixed the call-site half and left the
                 * declaration half with the same bug, which is why the same reviewer caught the
                 * same mistake twice in two rounds. resolveExpr already does this correctly; the
                 * fix is to CALL it rather than restate a weaker version. */
                const rhs = readRhs(s, i);
                if (!rhs) break;                      // non-literal initializer: stop this statement
                const v = resolveExpr(rhs.text, vars);
                if (v === null) break;                // unresolvable: do not guess at a partial value
                if (Object.prototype.hasOwnProperty.call(vars, name[1]) && vars[name[1]] !== v) {
                    conflict.add(name[1]);
                }
                vars[name[1]] = v;
                i += rhs.len;
            }
            const comma = /^\s*,\s*/.exec(s.slice(i));
            if (!comma) break;
            i += comma[0].length;
        }
    }
    for (const c of conflict) delete vars[c];          // ambiguous: refuse to guess
    if (conflict.size) collectVars.conflicts = (collectVars.conflicts || 0) + conflict.size;
    return vars;
}

/* ── BUG-273: RESOLVE CONCATENATED ARGUMENTS, NOT JUST LITERALS AND BARE IDENTIFIERS ────────────
 * The previous resolution was `isLit(x) ? unquote(x) : vars[x]`, where isLit tested only for a
 * LEADING quote and unquote stripped a leading and trailing one. Given
 * `ModuleProgress.complete('code', 'pyh-' + LAB_ID)` the second argument is the whole expression
 * `'pyh-' + LAB_ID`: it starts with a quote so isLit said literal, and unquote found no trailing
 * quote to strip, so the registry received the EXPRESSION TEXT `pyh-' + LAB_ID` as if it were a
 * content id. Eight such entries were committed. The real ids never arrived — all 22 Python-for-IT
 * (COP1034C) lab and quiz ids were absent, so enabling _ENFORCE_COMPLETION_REGISTRY would have
 * rejected every Python student's first completion. That is the 2026-09-07 AI-102 incident, which
 * this file's own header describes, reproduced by the very parser the header is about.
 *
 * Note the failure was WORSE THAN A MISS: a silent miss leaves a gap, but emitting the expression
 * text also made the registry assert something false, and made `--check` pass happily because the
 * generator and the committed file agreed on the same garbage. A gate comparing a generator to
 * itself cannot see a generator-side defect.
 *
 * TOKENISED, not split on '+'. `expr.split('+')` is the obvious version and it corrupts any
 * literal containing a plus ('c++' would become two operands). This walks the expression, honours
 * quotes and escapes, and requires a strict operand (+ operand)* alternation. Anything else —
 * a function call, a member expression like `_config.id`, a template literal, an unterminated
 * string — returns null and the call site is skipped, exactly as an unresolvable one was before.
 * Returning null is the safe direction: a missing id is covered by the legacy floor, whereas a
 * WRONG id pollutes the allowlist.
 *
 * Measured in _app at the time of writing: 2212 call sites pass a literal, 639 a bare identifier,
 * 24 a concatenation (this fix), 8 an object property (still unresolvable), 0 a template literal.
 * Verify with _tools/content/registry-coverage.js ARM B, which resolves these independently —
 * deliberately a SECOND implementation, so the two disagreeing is itself the alarm. */
function resolveExpr(expr, vars) {
    const toks = [];
    let i = 0;
    while (i < expr.length) {
        const c = expr[i];
        if (/\s/.test(c)) { i++; continue; }
        if (c === '+') { toks.push({ t: '+' }); i++; continue; }
        if (c === "'" || c === '"') {
            const q = c;
            let j = i + 1, buf = '';
            while (j < expr.length && expr[j] !== q) {
                if (expr[j] === '\\') { buf += expr[j + 1]; j += 2; continue; }
                buf += expr[j]; j++;
            }
            if (j >= expr.length) return null;            // unterminated — not ours to guess at
            toks.push({ t: 'str', v: buf });
            i = j + 1;
            continue;
        }
        const id = /^[A-Za-z_$][\w$]*/.exec(expr.slice(i));
        if (!id) return null;                             // punctuation we do not interpret
        toks.push({ t: 'id', v: id[0] });
        i += id[0].length;
    }
    /* Strict operand (+ operand)* means an ODD token count. Without this, `'a' +` — which the
     * `[^,)]+` capture can produce when an expression is cut short — resolved to 'a' and would have
     * put a truncated id into the allowlist. Caught by the resolver's own unit cases, not by a
     * regeneration, because a half-right id looks perfectly plausible in a 20,000-line registry. */
    if (!toks.length || toks.length % 2 === 0) return null;
    let out = '';
    for (let k = 0; k < toks.length; k++) {
        if (k % 2 === 1) { if (toks[k].t !== '+') return null; continue; }
        const t = toks[k];
        if (t.t === 'str') out += t.v;
        else if (t.t === 'id') {
            if (!Object.prototype.hasOwnProperty.call(vars, t.v)) return null;
            out += vars[t.v];
        } else return null;                               // a '+' where an operand belongs
    }
    return out || null;
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
        const vars = collectVars(s);
        for (const m of s.matchAll(/ModuleProgress\.complete\(\s*([^,)]+)\s*,\s*([^,)]+)/g)) {
            const house = resolveExpr(m[1], vars);
            const key = resolveExpr(m[2], vars);
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
