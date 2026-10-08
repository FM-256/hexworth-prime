#!/usr/bin/env node
'use strict';
/*
 * @catalog what    Cross-checks the TWO independent expression resolvers — gen-completion-registry's
 * @catalog what    (which BUILDS the allowlist) and registry-coverage ARM B's (which VERIFIES it) —
 * @catalog what    across every _app file containing a ModuleProgress.complete call. Fails if they
 * @catalog what    disagree about any id that actually reaches the registry.
 * @catalog run     node _tools/content/registry-parser-parity.js
 * @catalog status  TOOL
 *
 * WHY TWO RESOLVERS EXIST AT ALL. `registry-coverage.js` ARM B verifies that every statically
 * determinable completion id is in the registry. If it called into the generator to resolve them,
 * it would agree by construction and prove nothing — a gate reading the cache the gated thing
 * writes. So it has its own implementation, structured differently on purpose: statement-slice and
 * top-level comma split, versus the generator's character walk.
 *
 * THAT INDEPENDENCE HAS ALREADY PAID AND ALREADY LIED, which is why this file exists.
 *   PAID: when BUG-275 was fixed in the generator and not in ARM B, ARM B reported a blocker for
 *   the id `script-` within one run and the test suite dropped to 26/27. The stale half was caught
 *   by its counterpart, not by review.
 *   LIED: the two then agreed on every call site while differing on 572 VARIABLES. "They agree on
 *   everything that matters today" is not a property — it is a coincidence that holds until someone
 *   writes a new page. Nancy measured that gap; this tool is what keeps it measured.
 *
 * WHAT IS LOAD-BEARING, AND WHAT IS NOT. The invariant this tool ENFORCES is CALL-SITE agreement:
 * for every `ModuleProgress.complete(house, key)` in the tree, both resolvers must produce the same
 * house and the same key, including both agreeing that it is unresolvable. That is exactly the set
 * of ids that reach the allowlist, so a disagreement there means one of them is wrong about
 * something that ships. Exit 1.
 *
 * Variable-level divergence is REPORTED BUT NOT FAILED, because the two resolvers are allowed to
 * give up in different places on code that no completion id depends on. The surviving cases are
 * backtick TEMPLATE LITERALS: neither implementation parses them, and they differ on where each
 * stops. Every one measured is an HTML- or terminal-output-building variable. Fixing it means
 * template-literal support in both, which buys nothing until a page builds a completion id that
 * way — and if one ever does, the call-site check above fails and this comment is how you will
 * know where to look.
 *
 * EXIT: 0 call sites agree. 1 they disagree. 2 could not run.
 */
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '../..');

function lift(file, ...patterns) {
    const src = fs.readFileSync(path.join(REPO, file), 'utf8');
    return patterns.map((re) => {
        const m = src.match(re);
        if (!m) throw new Error(`could not lift a function out of ${file} — it was renamed or reshaped`);
        return m[0];
    });
}

function main() {
    /* Both resolvers are LIFTED FROM THE SHIPPED FILES rather than reimplemented here. A parity
     * checker that carries its own copy of either side is checking itself. */
    const [readRhs, resolveExpr, collectVars] = lift('_tools/content/gen-completion-registry.js',
        /function readRhs[\s\S]*?\n}\n/, /function resolveExpr[\s\S]*?\n}\n/, /function collectVars[\s\S]*?\n}\n/);
    const armB = fs.readFileSync(path.join(REPO, '_tools/content/registry-coverage.js'), 'utf8')
        .match(/function armB\(known\)[\s\S]*?\n}\n/)[0];
    const varsOf = armB.match(/ {4}function varsOf\(src\)[\s\S]*?\n {4}}\n/)[0].replace(/^ {4}/gm, '');
    const resolve = armB.match(/ {4}function resolve\(arg, vars\)[\s\S]*?\n {4}}\n/)[0].replace(/^ {4}/gm, '');

    const G = new Function(`${readRhs}\n${resolveExpr}\n${collectVars}\n return { collectVars, resolveExpr };`)();
    const B = new Function(`${varsOf}\n${resolve}\n return { varsOf, resolve };`)();

    let files = 0, varDiff = 0, callDiff = 0;
    const varEx = [], callEx = [];

    (function walk(dir) {
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
            const p = path.join(dir, e.name);
            if (e.isDirectory()) {
                if (/node_modules|_archive|_backups/.test(p)) continue;
                walk(p);
                continue;
            }
            if (!/\.(html|js)$/.test(e.name)) continue;
            const s = fs.readFileSync(p, 'utf8');
            if (!s.includes('ModuleProgress.complete(')) continue;
            files++;
            const vg = G.collectVars(s), vb = B.varsOf(s);
            for (const k of new Set([...Object.keys(vg), ...Object.keys(vb)])) {
                if (vg[k] !== vb[k]) {
                    varDiff++;
                    if (varEx.length < 8) varEx.push(`${k}  @ ${path.relative(REPO, p)}`);
                }
            }
            for (const m of s.matchAll(/ModuleProgress\.complete\(\s*([^,)]+)\s*,\s*([^,)]+)/g)) {
                const hg = G.resolveExpr(m[1], vg), kg = G.resolveExpr(m[2], vg);
                const hb = B.resolve(m[1], vb), kb = B.resolve(m[2], vb);
                if (hg !== hb || kg !== kb) {
                    callDiff++;
                    if (callEx.length < 12) {
                        callEx.push(`${path.relative(REPO, p)}\n       generator: house=${JSON.stringify(hg)} key=${JSON.stringify(kg)}`
                            + `\n       ARM B    : house=${JSON.stringify(hb)} key=${JSON.stringify(kb)}`);
                    }
                }
            }
        }
    })(path.join(REPO, '_app'));

    if (!files) { console.error('  found 0 files containing ModuleProgress.complete — the sweep is broken, not the tree.'); return 2; }

    console.log(`  swept ${files} files containing a ModuleProgress.complete call`);
    console.log(`  CALL-SITE disagreements (enforced): ${callDiff}`);
    console.log(`  variable-level divergence (reported, not enforced): ${varDiff}`);
    if (varDiff) {
        console.log('    these are backtick template literals neither resolver parses; none builds a completion id:');
        for (const x of varEx) console.log(`      ${x}`);
    }
    if (callDiff) {
        console.error('\n  THE TWO RESOLVERS DISAGREE ABOUT AN ID THAT REACHES THE REGISTRY:');
        for (const x of callEx) console.error(`     ${x}`);
        console.error('\n  One of them is wrong about something that ships. Do not regenerate the registry until this is resolved.');
        return 1;
    }
    console.log('\n  the two resolvers agree on every call site in the tree.');
    return 0;
}

try { process.exit(main()); }
catch (e) { console.error('  registry-parser-parity could not run:', e && e.message); process.exit(2); }
