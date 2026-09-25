'use strict';
/**
 * extract-shipped.js
 *
 * @catalog what    Brace-matches a `window.fn = async function(...) {...}` out of an HTML page
 * @catalog run     require('./lib/extract-shipped').extractShipped(htmlPath, 'fnName')
 * @catalog status  TOOL
 *
 * WHY A SHARED MODULE. Two suites now run admin-console functions that live inside a 500KB+ inline
 * script, and the first copy of this matcher was subtly wrong: it tracked quotes but not comments,
 * so an apostrophe in a block comment ("the card's own claim") opened a phantom string, brace
 * depth desynchronised, and extraction ran 43230 characters past the end of the function. It
 * failed loudly, which is the only reason it was caught. A fragile function with two copies is a
 * function that will be fixed once.
 *
 * WHY EXTRACT AT ALL instead of reimplementing the logic in the test: a reimplementation proves the
 * test author's understanding, and drifts from the page the moment someone edits it. This runs the
 * SHIPPED bytes.
 *
 * WHAT IT CANNOT DO. It does not give you a browser. Callers must shim whatever DOM and module
 * surface the function touches, and a shim is not the real thing: `document.getElementById`
 * returning one mock for every id means an id MISMATCH in the real page is invisible to a suite
 * built this way. Verify element ids by inspection, not by a passing test.
 */
const fs = require('fs');

/* The scanner, factored out because there are now two entry points and this is the part that was
 * wrong the first time. A third hand-written copy of a brace matcher is a third chance to get the
 * comment handling wrong. */
function matchBraces(src, start, name) {
    let i = src.indexOf('{', start), depth = 0, inStr = null;
    for (; i < src.length; i++) {
        const c = src[i], next2 = src.substr(i, 2);
        if (inStr) {
            if (c === '\\') { i++; continue; }          // escape: skip the next char entirely
            if (c === inStr) inStr = null;
            continue;
        }
        if (next2 === '//') { const nl = src.indexOf('\n', i); if (nl === -1) break; i = nl; continue; }
        if (next2 === '/*') { const close = src.indexOf('*/', i + 2); if (close === -1) break; i = close + 1; continue; }
        if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
        if (c === '{') depth++;
        else if (c === '}') { depth--; if (depth === 0) { i++; break; } }
    }
    const body = src.slice(start, i) + ';';
    /* A sanity floor: a silent 20-char "success" would mean the matcher broke again. */
    if (body.length < 200) throw new Error(`${name} extracted only ${body.length} chars — matcher is broken`);
    return body;
}

/* `window.fn = async function(` — a handler the page installs globally. */
function extractShipped(htmlPath, name) {
    const src = fs.readFileSync(htmlPath, 'utf8');
    const start = src.indexOf(`window.${name} = async function(`);
    if (start === -1) throw new Error(`${name} not found in ${htmlPath} — renamed, or not an async function?`);
    return matchBraces(src, start, name);
}

/* `function fn(` — a plain declaration inside the page's inline script. Needed because the logic
 * worth testing hardest is usually the PURE part, and pure helpers are not installed on window:
 * planPerTeamFlags decides which team receives which flag, so a resolver bug there would hand one
 * team another team's flag, which is the very defect per-team flags exist to remove. */
function extractDecl(htmlPath, name) {
    const src = fs.readFileSync(htmlPath, 'utf8');
    /* ANCHORED TO A LINE START, and ambiguity is an error rather than a silent first-wins pick.
     * A bare indexOf returns the first TEXTUAL occurrence anywhere in a 14,000-line page, so a
     * mention in a comment, a doc example, or a second same-named local would hand the suite a
     * different span than the one it certified -- or a confusing brace mismatch. The suite would
     * still say PASS, about the wrong function. Nancy flagged it as fragility that compounds each
     * time this is reused; making it loud now is cheaper than debugging it later. */
    const re = new RegExp(`^[ \t]*(?:async\\s+)?function ${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\(`, 'gm');
    const hits = [];
    let m;
    /* Start at the first non-whitespace of the match, which KEEPS a leading `async`. Starting at the
     * word `function` dropped it, and a body containing `await` then cannot be parsed at all:
     * `new Function(extractDecl(page, 'readPerTeamContext'))` threw "await is only valid in async
     * functions". Loud rather than dangerous, but it made async functions un-extractable, which is the
     * thing async support was added for. Found by the test file that should have existed already. */
    while ((m = re.exec(src)) !== null) hits.push(m.index + m[0].search(/\S/));
    if (!hits.length) throw new Error(`function ${name}( not found at a line start in ${htmlPath}`);
    if (hits.length > 1) {
        throw new Error(`function ${name}( is declared ${hits.length} times in ${htmlPath} `
            + `(offsets ${hits.join(', ')}) — ambiguous, so refusing rather than certifying one of them. `
            + `NOTE: a line INSIDE a /* */ block comment that begins at column 0 with "function ${name}(" `
            + `counts as a hit here — the anchor is line-based, not comment-aware. That produces this `
            + `refusal rather than a silently wrong span, which is the safe direction, but if the real `
            + `declaration is unique then re-indent the commented one.`);
    }
    return matchBraces(src, hits[0], name);
}

module.exports = { extractShipped, extractDecl };
