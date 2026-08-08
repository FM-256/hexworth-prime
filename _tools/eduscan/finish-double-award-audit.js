#!/usr/bin/env node
/**
 * @catalog what    Finds labs where ModuleProgress.complete() can fire more than once (#296)
 * @catalog run     node _tools/eduscan/finish-double-award-audit.js [--json] [--all] [--file <path>]
 * @catalog status  TOOL
 *
 * THE DEFECT
 *
 * ModuleProgress.complete() is NOT idempotent. It increments the lifetime
 * modules-completed counter, calls updateStreak(), queues an activity event and shows the
 * completion overlay. Calling it twice for one lab inflates a student's record.
 *
 * Nancy found this on ch25 forge-virtualization.lab.html, 2026-08-07. The lab derived its
 * Finish button's disabled state from task ticks, and those ticks are deliberately
 * REVOCABLE — renderTasks() recomputes them on every evaluate(). So: finish the lab, rename
 * a machine, rename it back, press Finish again, and credit fired a second time. No exploit
 * intent required, just using a feature you were told about.
 *
 * Fixed there with a sticky `LAB.completed` flag persisted as `completedOnce`, deliberately
 * NOT cleared by resetLab so that redoing a lab cannot re-award lifetime credit.
 *
 * WHAT THIS TOOL CLAIMS, AND WHAT IT DOES NOT
 *
 * It reports RISK SHAPES, not confirmed exploits. Proving re-reachability statically would
 * mean evaluating the lab's control flow; that is what a browser is for. What it does do is
 * enumerate EVERY lab that calls ModuleProgress.complete() and classify each call site, so
 * the triage is over a complete list rather than a sample.
 *
 *   GUARDED     a sticky boolean gates the call and survives a reset
 *   SOFT        a boolean gates the call but a reset path clears it, so credit can re-fire
 *               after the student restarts the lab
 *   RECOMPUTED  the call sits inside a render/evaluate/update function, so it fires on
 *               EVERY invocation once its condition holds -- the worst shape, because it
 *               does not even need a second click
 *   HANDLER     the call is reachable from an event handler with no sticky guard
 *   UNGUARDED   a call site with no boolean gate at all
 *
 * A GUARDED verdict is the only one that means "no action needed", and even that is a
 * reading of the source rather than a run of the page.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const APP = path.join(ROOT, '_app');

const args = process.argv.slice(2);
const AS_JSON = args.includes('--json');
const SHOW_ALL = args.includes('--all');
const fileIdx = args.indexOf('--file');
const ONE_FILE = fileIdx !== -1 ? args[fileIdx + 1] : null;

/**
 * Blank out comments and string literals, preserving length so every offset and line number
 * stays valid against the original text.
 *
 * This is not cosmetic. The first version of this tool matched `ModuleProgress.complete`
 * inside the very comment that DOCUMENTS the fix on ch25, then computed "the code before
 * the call" from that comment's position — which sits ABOVE the `if (!LAB.completed)` guard.
 * So the audit reported the one lab known to be fixed as UNGUARDED. A detector that fails
 * its own control case is worse than no detector, because its output looks like data.
 */
function maskCommentsAndStrings(src) {
    const out = src.split('');
    let i = 0;
    const n = src.length;
    const blank = (from, to) => {
        for (let k = from; k < to && k < n; k++) if (out[k] !== '\n') out[k] = ' ';
    };
    while (i < n) {
        const two = src.slice(i, i + 2);
        if (two === '//') {
            let j = src.indexOf('\n', i);
            if (j === -1) j = n;
            blank(i, j); i = j;
        } else if (two === '/*') {
            let j = src.indexOf('*/', i + 2);
            j = j === -1 ? n : j + 2;
            blank(i, j); i = j;
        } else if (two === '<!' && src.slice(i, i + 4) === '<!--') {
            let j = src.indexOf('-->', i + 4);
            j = j === -1 ? n : j + 3;
            blank(i, j); i = j;
        } else if (src[i] === '"' || src[i] === "'" || src[i] === '`') {
            // Strings are masked too: an onclick="finishStage()" attribute is matched
            // separately against the RAW text, so nothing needed here survives masking.
            const q = src[i];
            let j = i + 1;
            while (j < n && src[j] !== q) {
                if (src[j] === '\\') j++;
                if (src[j] === '\n' && q !== '`') break;
                j++;
            }
            blank(i + 1, j); i = j + 1;
        } else i++;
    }
    return out.join('');
}

/** Every *.lab.html under _app. */
function labFiles(dir, out = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) labFiles(p, out);
        else if (e.name.endsWith('.lab.html')) out.push(p);
    }
    return out;
}

/**
 * Walk backwards from an index to find the enclosing `function name(` declaration.
 * Brace-counting rather than a regex: a regex for "the function containing offset N" cannot
 * be written, and guessing by nearest-preceding-`function` picks up nested helpers.
 */
function enclosingFunction(src, callIdx) {
    let depth = 0;
    for (let i = callIdx; i >= 0; i--) {
        const ch = src[i];
        if (ch === '}') depth++;
        else if (ch === '{') {
            if (depth === 0) {
                // Opening brace of the block containing the call. Read the header before it.
                const head = src.slice(Math.max(0, i - 220), i);
                const m = head.match(/(?:function\s+([A-Za-z0-9_$]+)\s*\([^)]*\)|([A-Za-z0-9_$.]+)\s*=\s*(?:async\s*)?function\s*\([^)]*\)|([A-Za-z0-9_$]+)\s*[:=]\s*(?:async\s*)?\([^)]*\)\s*=>)\s*$/);
                if (m) return { name: m[1] || m[2] || m[3], start: i };
                // An anonymous or nested block: keep climbing.
            } else depth--;
        }
    }
    return { name: null, start: 0 };
}

/** The body of the function enclosing the call, for guard analysis. */
function functionBody(src, startBrace) {
    let depth = 0;
    for (let i = startBrace; i < src.length; i++) {
        if (src[i] === '{') depth++;
        else if (src[i] === '}') {
            depth--;
            if (depth === 0) return src.slice(startBrace, i + 1);
        }
    }
    return src.slice(startBrace);
}

// A boolean that gates the award. `typeof ModuleProgress !== 'undefined'` is a LOAD check,
// not a guard, and matching it would mark every lab safe.
const GUARD_NAME = /(complet|award|credit|fired|granted|claimed|finish|done|marked)/i;

function analyseCall(src, callIdx, fileText) {
    const fn = enclosingFunction(src, callIdx);
    const body = fn.start ? functionBody(src, fn.start) : '';
    // Slice to the ACTUAL call offset, not to the first textual occurrence in the body.
    // finishStage() on ch25 mentions the call in a comment above the guard, so using
    // indexOf here cut the guard out of `before` and mis-graded the reference fix.
    const before = fn.start ? src.slice(fn.start, callIdx) : body;

    // Guard: a conditional on a completion-ish boolean, or an early return on one.
    let guardVar = null;
    const condRe = /if\s*\(\s*!?\s*([A-Za-z0-9_$.]*(?:complet|award|credit|fired|granted|claimed)[A-Za-z0-9_$.]*)\s*[)&]/gi;
    let m;
    while ((m = condRe.exec(before)) !== null) {
        if (GUARD_NAME.test(m[1])) { guardVar = m[1]; break; }
    }
    // Also accept `if (X.already) return;` style anywhere before the call.
    if (!guardVar) {
        const early = before.match(/if\s*\(\s*([A-Za-z0-9_$.]*(?:complet|award|credit|fired)[A-Za-z0-9_$.]*)\s*\)\s*return/i);
        if (early) guardVar = early[1];
    }

    let verdict;
    if (guardVar) {
        // A guard that a reset path clears is not sticky: redoing the lab re-awards credit.
        const short = guardVar.split('.').pop();
        const resetClears = new RegExp(
            `(reset|restart|clear|startOver)[A-Za-z0-9_$]*\\s*\\([^)]*\\)\\s*\\{[\\s\\S]{0,900}?\\b${short}\\s*=\\s*(false|0|null)`,
            'i').test(fileText);
        verdict = resetClears ? 'SOFT' : 'GUARDED';
    } else if (fn.name && /^(render|update|evaluate|refresh|draw|sync|check|recompute|paint)/i.test(fn.name)) {
        // Fires on EVERY call once the condition holds. No second click needed.
        verdict = 'RECOMPUTED';
    } else if (fn.name && new RegExp(`(onclick\\s*=\\s*["'][^"']*\\b${fn.name}\\b|addEventListener\\([^)]*\\b${fn.name}\\b)`).test(fileText)) {
        verdict = 'HANDLER';
    } else {
        verdict = 'UNGUARDED';
    }

    return { fn: fn.name || '(anonymous)', guardVar, verdict };
}

function analyseFile(file) {
    const raw = fs.readFileSync(file, 'utf8');
    // Scan the MASKED text so a comment mentioning the call is not counted as a call site.
    // Masking preserves length, so offsets and line numbers still refer to the real file.
    // `raw` is passed separately for the onclick="fn()" lookup, which lives in an HTML
    // attribute and would be blanked out by the string masking.
    const masked = maskCommentsAndStrings(raw);
    const calls = [];
    let idx = masked.indexOf('ModuleProgress.complete');
    while (idx !== -1) {
        const line = masked.slice(0, idx).split('\n').length;
        calls.push({ line, ...analyseCall(masked, idx, raw) });
        idx = masked.indexOf('ModuleProgress.complete', idx + 1);
    }
    return { file: path.relative(ROOT, file), calls };
}

const RANK = { RECOMPUTED: 0, HANDLER: 1, UNGUARDED: 2, SOFT: 3, GUARDED: 4 };

function main() {
    const files = ONE_FILE
        ? [path.resolve(ONE_FILE)]
        : labFiles(APP).filter(f => fs.readFileSync(f, 'utf8').includes('ModuleProgress.complete'));

    const results = files.map(analyseFile).filter(r => r.calls.length);
    const counts = {};
    for (const r of results) for (const c of r.calls) counts[c.verdict] = (counts[c.verdict] || 0) + 1;

    if (AS_JSON) {
        console.log(JSON.stringify({ scanned: files.length, counts, results }, null, 2));
        return;
    }

    console.log('\nfinishStage double-award audit (#296)');
    console.log(`${files.length} lab file(s) call ModuleProgress.complete()\n`);

    const worst = results
        .map(r => ({ ...r, rank: Math.min(...r.calls.map(c => RANK[c.verdict])) }))
        .sort((a, b) => a.rank - b.rank);

    const show = SHOW_ALL ? worst : worst.filter(r => r.rank <= RANK.UNGUARDED);
    for (const r of show) {
        for (const c of r.calls) {
            if (!SHOW_ALL && RANK[c.verdict] > RANK.UNGUARDED) continue;
            console.log(`  ${c.verdict.padEnd(11)} ${r.file}:${c.line}  ${c.fn}()`
                + (c.guardVar ? `  guard=${c.guardVar}` : ''));
        }
    }

    console.log('\n─── Totals ───');
    for (const k of Object.keys(RANK).sort((a, b) => RANK[a] - RANK[b])) {
        if (counts[k]) console.log(`  ${k.padEnd(11)} ${counts[k]}`);
    }
    console.log('\nGUARDED is the only verdict meaning no action. RECOMPUTED is worst: the');
    console.log('award re-fires on every render once its condition holds, with no second click.');
    console.log('These are risk SHAPES read from source, not confirmed exploits. Verify in a browser.');
}

if (require.main === module) main();
module.exports = { analyseFile, analyseCall, enclosingFunction };
