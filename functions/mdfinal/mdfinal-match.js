/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-match.js — literal and wildcard matching for the exam consoles, with a step budget.
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, R4, 13.4.
 *
 * NO USER REGEX, ANYWHERE. `-like`, `Where-Object ... -like` and `Select-String -SimpleMatch` come
 * here. The wildcard matcher is the iterative two-pointer glob (one backtrack point, the last `*`),
 * so it is O(n*m) in the worst case, never exponential: a pattern like `(a+)+$`, which is
 * catastrophic for a backtracking regex, is just literal text here. Every comparison is charged to a
 * shared budget; a caller that runs out gets { ok:false } and refuses the whole command.
 *
 * PowerShell wildcard semantics: `*` any run, `?` one character, case-insensitive. Character
 * ranges (`[a-c]`) are treated as literal text (declared simplification; the exam never needs them).
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var LIM = require('./mdfinal-limits.js');

    /* A per-command work budget shared by every match the command performs. */
    function budget(steps) {
        var b = { left: steps === undefined ? LIM.LIMITS.command.maxMatcherSteps : steps, spent: false };
        return b;
    }

    /* Charges n steps; false once the budget is gone (and stays gone). */
    function charge(b, n) {
        if (b.spent) { return false; }
        b.left -= n;
        if (b.left < 0) { b.spent = true; return false; }
        return true;
    }

    /* Case-insensitive wildcard match. Returns { ok, match }: ok is false when the budget ran out. */
    function like(text, pattern, b) {
        var s = String(text).toLowerCase(), p = String(pattern).toLowerCase();
        var i = 0, j = 0, star = -1, mark = 0;
        while (i < s.length) {
            if (!charge(b, 1)) { return { ok: false, match: false }; }
            if (j < p.length && (p[j] === '?' || p[j] === s[i])) { i++; j++; }
            else if (j < p.length && p[j] === '*') { star = j++; mark = i; }
            else if (star >= 0) { j = star + 1; i = ++mark; }
            else { return { ok: true, match: false }; }
        }
        while (j < p.length && p[j] === '*') { j++; }
        return { ok: true, match: j === p.length };
    }

    /* Case-insensitive substring test (Select-String -SimpleMatch, findstr /l). */
    function contains(text, needle, b) {
        var s = String(text).toLowerCase(), n = String(needle).toLowerCase();
        if (!charge(b, s.length + n.length)) { return { ok: false, match: false }; }
        return { ok: true, match: s.indexOf(n) >= 0 };
    }

    /* Case-insensitive equality (-eq / -ne on strings). */
    function equals(a, c, b) {
        var x = String(a), y = String(c);
        if (!charge(b, Math.min(x.length, y.length) + 1)) { return { ok: false, match: false }; }
        return { ok: true, match: x.toLowerCase() === y.toLowerCase() };
    }

    module.exports = { budget: budget, charge: charge, like: like, contains: contains, equals: equals };
})();
