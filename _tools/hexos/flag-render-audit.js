#!/usr/bin/env node
/**
 * flag-render-audit.js
 *
 * @catalog what   Finds every place a delivered flag value reaches student-visible text
 *                 without a guard, so a failed delivery cannot print the literal word
 *                 "null". Traces the VARIABLE each requestFlagText/getDeliveredFlag result
 *                 is assigned to, then reports concatenations of that variable — instead of
 *                 grepping for a hand-picked set of variable names.
 * @catalog run    node _tools/hexos/flag-render-audit.js [--json] [--area dispatch|arena|all]
 * @catalog status TOOL
 *
 * WHY IT EXISTS, and why the obvious grep was not enough.
 * The live incident was a student completing NT1 and being shown "null" where their flag
 * belonged, because `'Recovery token: ' + flagVal` is `'Recovery token: null'` when delivery
 * fails. I then claimed "0 unguarded sites remain across dispatch + arena" on the strength of
 * a grep for `+ flagVal +`, `+ flagValue +` and `+ flagText +`.
 *
 * That claim was FALSE and Chris disproved it. Boxes use other names, and one box I had
 * listed as fixed (nt002-no-internet) had 5 sites of which my sweep covered 2. A detector
 * keyed on the names I happened to have seen will always report the tree clean the moment
 * someone picks a different name — and it reports that clean result with total confidence.
 *
 * So this keys on the SOURCE of the value, not its spelling: anything assigned from
 * requestFlagText / getDeliveredFlag / requestFlagText's awaited result is a flag value, and
 * any concatenation of that identifier that is not wrapped in a _flagText-style guard is a
 * site where a student can be shown "null".
 *
 * Exit 0 = no unguarded sites. Exit 1 = at least one.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const argv = process.argv.slice(2);
const AS_JSON = argv.includes('--json');
const areaIdx = argv.indexOf('--area');
const AREA = areaIdx > -1 ? argv[areaIdx + 1] : 'dispatch';

/** Box config files in the requested area. */
function configs() {
    const areas = AREA === 'all' ? ['dispatch/boxes', 'arena/boxes'] : [`${AREA}/boxes`];
    const out = [];
    for (const a of areas) {
        const dir = path.join(ROOT, '_app', a);
        if (!fs.existsSync(dir)) continue;
        for (const name of fs.readdirSync(dir)) {
            const f = path.join(dir, name, 'config.js');
            if (fs.existsSync(f)) out.push({ name, area: a.split('/')[0], file: f });
        }
    }
    return out;
}

// Anything assigned from one of these is a delivered flag value.
const SOURCE = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:await\s+)?[\w.]*(?:requestFlagText|getDeliveredFlag)\s*\(/g;

const findings = [];

for (const box of configs()) {
    const src = fs.readFileSync(box.file, 'utf8');
    const lines = src.split('\n');

    // 1. Which identifiers hold a flag value in this file?
    const vars = new Set();
    let m;
    SOURCE.lastIndex = 0;
    while ((m = SOURCE.exec(src)) !== null) vars.add(m[1]);
    if (!vars.size) continue;

    // 2. Where is each concatenated into a string without a guard?
    for (const v of vars) {
        // `+ v +`, `+ v}` in a template, `+ v;` at the end of a concatenation
        const use = new RegExp("\\+\\s*" + v.replace(/\$/g, '\\$') + "\\s*(?=[+;,)\\]}]|\\s*'|\\s*\"|\\s*`)", 'g');
        lines.forEach((line, i) => {
            use.lastIndex = 0;
            if (!use.test(line)) return;
            /* COMMENTS ARE NOT RENDER SITES. The guard helper's own docstring contains the
             * example `'Recovery token: ' + fv`, so without this the audit reported one
             * false finding per box it had just fixed — a detector flagging the very comment
             * that documents the fix. Check the detector before believing the data. */
            const t = line.trim();
            if (t.startsWith('*') || t.startsWith('//') || t.startsWith('/*')) return;
            // Guarded if the value goes through a *_flagText-style helper on this line.
            if (/_flagText\s*\(/.test(line)) return;
            // A pure assignment (a = b + c) with no string literal is not a render.
            if (!/['"`]/.test(line)) return;
            findings.push({
                box: `${box.name} (${box.area})`,
                file: box.file.replace(ROOT + '/', ''),
                line: i + 1,
                variable: v,
                excerpt: line.trim().slice(0, 120)
            });
        });
    }
}

if (AS_JSON) {
    console.log(JSON.stringify({ generatedAt: new Date().toISOString(), area: AREA, findings }, null, 2));
} else {
    console.log('=== flag render audit ===');
    console.log(`area: ${AREA}\n`);
    const byBox = {};
    for (const f of findings) (byBox[f.box] = byBox[f.box] || []).push(f);
    for (const b of Object.keys(byBox).sort()) {
        console.log(`${b}  (${byBox[b].length} unguarded)`);
        for (const f of byBox[b]) console.log(`   ${f.file}:${f.line}  [${f.variable}]  ${f.excerpt}`);
        console.log('');
    }
    console.log(`${findings.length} unguarded render site(s) in ${Object.keys(byBox).length} box(es)`);
}

process.exitCode = findings.length ? 1 : 0;
