#!/usr/bin/env node
/**
 * @catalog what    PROBE, NEGATIVE RESULT: registry `paths:` is NOT a reachability signal
 * @catalog run     node _tools/eduscan/path-registry-disagreement.js [--json]
 * @catalog status  PROBE
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * READ THIS BEFORE USING THE OUTPUT. THE HYPOTHESIS BELOW WAS TESTED AND FAILED.
 *
 * Built 2026-08-08 to ask whether #272 was systemic: the AWS CCP final exam declares
 * `paths: ['aws-ccp']` in content-registry.js and is absent from
 * LearningPaths.PATHS['aws-ccp'].modules, which is the only thing CertPathRenderer reads.
 * If that disagreement meant "unreachable", the same query across every path would find a
 * whole class of orphaned content.
 *
 * IT DOES NOT MEAN THAT. The run found 1242 disagreements out of 1334 registry entries
 * carrying a `paths` field -- a 93% hit rate, which is the shape of a broken premise, not a
 * finding. Spot-checked by hand: `shield-web-attacks` (an SQL-injection applet) is flagged,
 * genuinely does not appear in LearningPaths.js, and is perfectly reachable through its
 * house hub. Likewise every `script-clh-0NN` entry claims a `command-line-hacker` path that
 * LearningPaths.js has never defined, while CLH is a live course reachable by its own hub.
 *
 * THE CONCLUSION: `paths:` in content-registry.js is CATEGORICAL METADATA -- what a piece of
 * content is *about* -- not a routing table. Learning paths render from LearningPaths.js,
 * and everything else reaches students through house hubs, course hubs and galleries. The
 * two fields were never meant to agree, so their disagreement measures nothing.
 *
 * KEPT, NOT DELETED, so the next person does not rebuild it. If you want real reachability,
 * use reachability-walk.js, which follows links a student can actually click.
 *
 * #272 itself is still a genuine defect; it just does not generalise. See the taskboard note.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * TWO SOURCES OF TRUTH, AND ONLY ONE OF THEM RENDERS
 *
 * `_app/config/content-registry.js` entries declare `paths: ['aws-ccp', ...]`.
 * `_app/components/LearningPaths.js` declares `PATHS[id].modules = [...]`.
 *
 * CertPathRenderer reads `LearningPaths.PATHS[id].modules` and NOTHING ELSE
 * (CertPathRenderer.js:390, :326). So a registry entry can claim membership in a path
 * while the hub that renders that path never mentions it. The content is live, returns
 * HTTP 200, is listed in the registry, and no student can click to it.
 *
 * That is exactly taskboard #272: cloud-ch12-aws-practitioner-final.quiz.html declares
 * `paths: ['aws-ccp']` and is absent from `LearningPaths.PATHS['aws-ccp'].modules`, so a
 * student on the AWS CCP path never sees the final exam. It was found by walking one hub.
 * This tool asks the same question of every path at once, so the answer is a count rather
 * than an anecdote.
 *
 * WHAT A HIT MEANS, AND WHAT IT DOES NOT
 *
 * A hit means the two files disagree. It does NOT automatically mean "add it to the path":
 * #272's own quiz turned out to be legacy Solutions-Architect-level material (Aurora
 * internals, NAT gateways, OpsWorks, Direct Connect) sitting in a 3-chapter foundational
 * course, so wiring it in would hand students an exam on content nobody taught them.
 * Each hit is a question for a human: does this belong in the path, or does the claim
 * belong deleted?
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REGISTRY = path.join(ROOT, '_app', 'config', 'content-registry.js');
const PATHS_FILE = path.join(ROOT, '_app', 'components', 'LearningPaths.js');

const AS_JSON = process.argv.includes('--json');

/**
 * Pull `id: { ... paths: [...] ... }` pairs out of the registry.
 * Regex rather than a parser because the file is a browser IIFE with no export; the shape
 * is stable and every hit is verified against the paths file before it is reported.
 */
function registryClaims(src) {
    const claims = [];
    // Each entry opens with  'some-id': {   and carries a paths: [...] somewhere inside.
    const entryRe = /'([a-z0-9][a-z0-9-]*)'\s*:\s*\{/gi;
    let m;
    while ((m = entryRe.exec(src)) !== null) {
        const id = m[1];
        // Look ahead a bounded window; entries are a few dozen lines at most.
        const window = src.slice(m.index, m.index + 2600);
        const pm = window.match(/\bpaths\s*:\s*\[([^\]]*)\]/);
        if (!pm) continue;
        const paths = pm[1].split(',')
            .map(s => s.trim().replace(/^['"]|['"]$/g, ''))
            .filter(Boolean);
        if (!paths.length) continue;
        const title = (window.match(/\btitle\s*:\s*'([^']*)'/) || [])[1] || '';
        const comps = (window.match(/\bcomponents\s*:\s*\{([\s\S]{0,400}?)\}/) || [])[1] || '';
        const hrefs = [...comps.matchAll(/'([^']*\.html)'/g)].map(x => x[1]);
        claims.push({ id, paths, title, hrefs });
    }
    return claims;
}

/** Pull PATHS[id].modules -> the set of module ids and hrefs each path actually renders. */
function renderedPaths(src) {
    const out = {};
    const pathRe = /'([a-z0-9][a-z0-9-]*)'\s*:\s*\{\s*\n\s*name\s*:/gi;
    let m;
    while ((m = pathRe.exec(src)) !== null) {
        const id = m[1];
        // Take everything up to the next path declaration (or a generous cap).
        pathRe.lastIndex = m.index + 1;
        const rest = src.slice(m.index);
        const nextRel = rest.slice(1).search(/\n\s*'[a-z0-9][a-z0-9-]*'\s*:\s*\{\s*\n\s*name\s*:/i);
        const body = nextRel === -1 ? rest.slice(0, 60000) : rest.slice(0, nextRel + 1);
        const ids = [...body.matchAll(/\bid\s*:\s*'([^']+)'/g)].map(x => x[1]);
        const hrefs = [...body.matchAll(/\bhref\s*:\s*'([^']+)'/g)].map(x => x[1]);
        out[id] = { ids: new Set(ids), hrefs: new Set(hrefs) };
    }
    return out;
}

function main() {
    const regSrc = fs.readFileSync(REGISTRY, 'utf8');
    const pathSrc = fs.readFileSync(PATHS_FILE, 'utf8');

    const claims = registryClaims(regSrc);
    const rendered = renderedPaths(pathSrc);

    const missingPath = [];   // claims a path that does not exist at all
    const notRendered = [];   // path exists, but neither the id nor any href appears in it

    for (const c of claims) {
        for (const p of c.paths) {
            const r = rendered[p];
            if (!r) { missingPath.push({ ...c, path: p }); continue; }
            // Reachable if the path renders this id, OR renders any of its component hrefs.
            // Checking hrefs too avoids flagging entries whose registry id and path module
            // id simply differ by naming convention -- a false positive would send someone
            // editing a curriculum that is already correct.
            const byId = r.ids.has(c.id);
            const byHref = c.hrefs.some(h => r.hrefs.has(h)
                || [...r.hrefs].some(rh => rh.endsWith(h) || h.endsWith(rh)));
            if (!byId && !byHref) notRendered.push({ ...c, path: p });
        }
    }

    if (AS_JSON) {
        console.log(JSON.stringify({
            registryEntriesWithPaths: claims.length,
            pathsDefined: Object.keys(rendered).length,
            missingPath, notRendered,
        }, null, 2));
        return;
    }

    console.log('\nregistry-vs-LearningPaths disagreement (#272)');
    console.log(`  ${claims.length} registry entries declare a path`);
    console.log(`  ${Object.keys(rendered).length} paths defined in LearningPaths.js\n`);

    if (missingPath.length) {
        console.log(`  CLAIMS A PATH THAT DOES NOT EXIST (${missingPath.length}):`);
        for (const x of missingPath) console.log(`    ${x.id}  ->  '${x.path}'`);
        console.log('');
    }

    console.log(`  CLAIMED BUT NOT RENDERED (${notRendered.length}) `
        + '- live content the path never links:');
    const byPath = {};
    for (const x of notRendered) (byPath[x.path] = byPath[x.path] || []).push(x);
    for (const p of Object.keys(byPath).sort()) {
        console.log(`\n    ${p}  (${byPath[p].length})`);
        for (const x of byPath[p]) {
            console.log(`      ${x.id}${x.title ? '  "' + x.title + '"' : ''}`);
            for (const h of x.hrefs) console.log(`        ${h}`);
        }
    }

    console.log('\n  ── NEGATIVE RESULT, read before acting on any line above ──');
    console.log('  A 93% hit rate means the premise is wrong, not that this much content is');
    console.log('  orphaned. `paths:` in content-registry.js is categorical metadata (what a');
    console.log('  page is ABOUT), not a routing table. Verified by hand: shield-web-attacks');
    console.log('  is flagged here and is reachable through its house hub; every script-clh-0NN');
    console.log('  claims a command-line-hacker path that has never existed, while CLH is live.');
    console.log('  For real reachability use reachability-walk.js, which follows clickable links.');
}

if (require.main === module) main();
module.exports = { registryClaims, renderedPaths };
