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
    const start = src.indexOf(`function ${name}(`);
    if (start === -1) throw new Error(`function ${name}( not found in ${htmlPath}`);
    return matchBraces(src, start, name);
}

module.exports = { extractShipped, extractDecl };
