/**
 * strip-noncode.js — shared comment/string neutralization for HTML+JS scanning.
 *
 * Single source of truth for the hardened stripping logic that originated in
 * validators/syntax/html.js (Task #207 + the 2026-05-25 strip-order bug). Two
 * consumers with different needs:
 *
 *   - validators/syntax/html.js (tag-balance validation): delegates its
 *     inline-script neutralization + HTML-comment stripping here.
 *   - nexus/adapters/deploy-check.js Check 8 (dependency scanning): needs
 *     comments AND string contents removed while KEEPING live JS code, so
 *     commented-out or string-quoted API references don't produce false
 *     positives/negatives.
 *
 * ORDER MATTERS (Task #207): inside inline <script> blocks, JS string literals
 * are blanked FIRST (so `//` inside "https://..." is not misread as a comment
 * start, and a fake `<!--` inside a teaching-payload string cannot fool the
 * HTML-comment pass), THEN JS line/block comments are blanked. Only after
 * script bodies are neutralized is it safe to strip HTML comments.
 *
 * All replacements are length/line-preserving (spaces, newlines kept) so
 * downstream line numbers stay accurate.
 */

'use strict';

/** Blank every non-newline character (length/line-preserving). */
function stripPreserveLines(s) {
    return s.replace(/[^\n]/g, ' ');
}

/**
 * Within each inline <script> block (no src attribute), blank JS string
 * literal CONTENTS (quotes kept), then blank line + block comments.
 * External <script src="..."> tags are untouched (their `//` lives in an
 * HTML attribute, not JS, and their body is empty).
 * Verbatim port of validators/syntax/html.js checkCriticalUnclosedTags
 * inner transform (lines ~210-224 at extraction time).
 */
function neutralizeInlineScripts(content) {
    return content.replace(
        /<script(?![^>]*\bsrc\b)[^>]*>[\s\S]*?<\/script>/gi,
        (block) => block
            // ORDER MATTERS: strip JS string literals FIRST so that `//`
            // appearing inside `"http://..."` or `"//etc/path/"` is NOT
            // treated as a comment-start. Without this, the comment
            // stripper eats from the string's `//` to end of line,
            // including any `</script>` that follows.
            .replace(/"(?:[^"\\\n]|\\[\s\S])*"/g, (m) => '"' + stripPreserveLines(m.slice(1, -1)) + '"')
            .replace(/'(?:[^'\\\n]|\\[\s\S])*'/g, (m) => "'" + stripPreserveLines(m.slice(1, -1)) + "'")
            // Now strip line + block comments (no risk of matching inside
            // string literals because those have been blanked).
            .replace(/\/\/[^\n]*/g, (m) => ' '.repeat(m.length))
            .replace(/\/\*[\s\S]*?\*\//g, (m) => stripPreserveLines(m))
    );
}

/** Blank HTML comments (length/line-preserving). */
function stripHtmlComments(content) {
    return content.replace(/<!--[\s\S]*?-->/g, (m) => stripPreserveLines(m));
}

/**
 * Dependency-scan view of a page: live code and markup only.
 * JS strings/comments blanked inside inline scripts, then HTML comments
 * blanked (safe order per above). Use this when regex-testing for API
 * calls (`Foo.bar(`) or script loads (`Foo.js`) so that commented-out or
 * string-quoted mentions neither trigger nor satisfy the check.
 * Note: corpus-verified 2026-07-23 that all ModuleProgress.js loads are
 * literal <script src> tags (no dynamic string-based loaders), so blanking
 * string contents cannot hide a real load.
 */
function stripNonCode(content) {
    return stripHtmlComments(neutralizeInlineScripts(content));
}

module.exports = {
    stripPreserveLines,
    neutralizeInlineScripts,
    stripHtmlComments,
    stripNonCode,
};
