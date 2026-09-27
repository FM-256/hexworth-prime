#!/usr/bin/env node
'use strict';
/**
 * @catalog what    Authoritative counts for ContentCatalog: total module ids, duplicate (house,href)
 *                  groups, and relative hrefs that do not resolve to a file
 * @catalog run     node _tools/eduscan/catalog-dup-count.js [--ref <git-ref>]
 * @catalog status  TOOL
 *
 * WHY THIS EXISTS. The NP-20 commit cited "4053 catalog ids" and "CAT-007 groups 651 -> 636".
 * Nancy could not reproduce either figure under any scoping and was right not to accept them: they
 * came from a throwaway regex that matched `id:`/`href:` per LINE. That undercounts, because the
 * catalog is a JS module whose real shape only a parse can see, and it is method-dependent, which
 * is the worst property a number in a commit message can have.
 *
 * This EVALUATES the module the way the browser and the EduScan naming validator already do
 * (vm + window shim, matching NamingValidator.buildCatalogHrefSet) and reports from the parsed
 * MODULES array. `--ref` runs the same count against a git revision, so a before/after delta is
 * reproducible by anyone instead of living in one session's scrollback.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const REL = '_app/components/ContentCatalog.js';
const args = process.argv.slice(2);
const refIdx = args.indexOf('--ref');
const REF = refIdx !== -1 ? args[refIdx + 1] : null;

function load(code) {
    const context = vm.createContext({ window: {} });
    vm.runInContext(code, context);
    const c = context.window.ContentCatalog;
    if (!c || !c.MODULES || !c.HOUSES) throw new Error('ContentCatalog did not expose MODULES/HOUSES');
    return c;
}

function resolveHref(basePath, href) {
    if (!href) return null;
    if (href.startsWith('../') || href.startsWith('/')) return href.replace(/^(\.\.\/)+/, '').replace(/^\//, '');
    if (href.startsWith('houses/')) return href;
    return (basePath || '').replace(/\/?$/, '/') + href;
}

function report(label, code) {
    const cat = load(code);
    const groups = new Map();
    let ids = 0, unresolved = 0, checked = 0;
    for (const m of cat.MODULES) {
        ids++;
        if (!m.href) continue;
        const key = `${m.house}|${m.href}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(m.id);
        const house = cat.HOUSES[m.house];
        const resolved = house ? resolveHref(house.basePath, m.href) : null;
        if (resolved && resolved.endsWith('.html')) {
            checked++;
            if (!fs.existsSync(path.join(ROOT, '_app', resolved))) unresolved++;
        }
    }
    const dup = [...groups.values()].filter(v => v.length > 1).length;
    console.log(`${label}`);
    console.log(`  module entries (parsed)          : ${ids}`);
    console.log(`  distinct (house,href) pairs      : ${groups.size}`);
    console.log(`  duplicate (house,href) groups    : ${dup}`);
    console.log(`  html hrefs checked on disk       : ${checked}`);
    console.log(`  of those, not resolving to a file: ${unresolved}`);
    return { ids, dup, unresolved };
}

const now = report('WORKING TREE', fs.readFileSync(path.join(ROOT, REL), 'utf8'));
if (REF) {
    const old = report(`\nAT ${REF}`, execSync(`git show ${REF}:${REL}`, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
    console.log(`\nDELTA ${REF} -> working tree`);
    console.log(`  module entries                : ${old.ids} -> ${now.ids} (${now.ids - old.ids >= 0 ? '+' : ''}${now.ids - old.ids})`);
    console.log(`  duplicate (house,href) groups : ${old.dup} -> ${now.dup} (${now.dup - old.dup >= 0 ? '+' : ''}${now.dup - old.dup})`);
    console.log(`  unresolved html hrefs         : ${old.unresolved} -> ${now.unresolved} (${now.unresolved - old.unresolved >= 0 ? '+' : ''}${now.unresolved - old.unresolved})`);
}
