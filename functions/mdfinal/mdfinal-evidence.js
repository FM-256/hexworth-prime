/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-evidence.js — which I2 evidence values a piece of output actually SHOWED (spec 13.19 item
 * 7, Mallory R6 blocker 1).
 *
 * A diagnostic route used to count as "seen" the moment it wrote its ledger entry, before its own
 * filter ran, so a query that matched nothing ("No events.") let a guessed constant score. Now the
 * engine's two entry points (gui.act, shell.exec) stamp each diagnostic ledger entry the call wrote
 * with the evidence values its reply text contains, and I2 credits a value only when an entry from
 * one of its routes recorded it as shown.
 *
 * Pure, no requires, so the GUI and the shell can both use it without a module cycle.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* The ledger kinds that display evidence (the routes in mdfinal-faults.js evidenceRoutes). */
    var ROUTE_KINDS = ['eventvwr', 'pnputil-enum', 'update-history', 'hotfix-list', 'taskmgr-view', 'get-process', 'hosts-view', 'name-test', 'winre-view'];

    /* Event ids are matched as whole numbers, so 1001 inside KB5091001 does not count. */
    var EVENT_IDS = ['41', '1000', '1001', '1014', '5719', '1129'];
    var WORDS = ['mbafilt', 'msynchlp', 'mer_shellhook'];

    /* A whole-token test with no regex built from the text (R4: no student-driven RegExp). */
    function hasToken(hay, tok) {
        if (!tok) { return false; }
        var from = 0;
        for (;;) {
            var i = hay.indexOf(tok, from);
            if (i < 0) { return false; }
            var before = i === 0 ? '' : hay[i - 1], after = hay[i + tok.length] || '';
            var isWord = function (c) { return /[A-Za-z0-9_.]/.test(c); };
            if (!isWord(before) && !isWord(after.replace(/\.$/, ''))) { return true; }
            from = i + 1;
        }
    }

    /* The normalised evidence values (as mdfinal-faults.js normEvidence produces them) in `text`.
     * `fault` is state.fault, for the values unique to a sitting. */
    function shown(text, fault) {
        var s = String(text || ''), low = s.toLowerCase(), out = [];
        EVENT_IDS.forEach(function (id) { if (hasToken(s, id)) { out.push(id); } });
        if (low.indexOf('0x0000007b') >= 0 || low.indexOf('inaccessible_boot_device') >= 0) { out.push('stop:7b'); }
        WORDS.forEach(function (w) { if (low.indexOf(w) >= 0) { out.push(w); } });
        if (fault) {
            /* every per-sitting value is checked non-empty first: an empty needle matches anything */
            var kbn = typeof fault.kb === 'string' ? fault.kb.slice(2) : '';
            if (kbn.length >= 4 && s.indexOf(kbn) >= 0) { out.push(kbn); }
            var inf = typeof fault.driverInf === 'string' ? fault.driverInf.toLowerCase() : '';
            if (inf.length >= 5 && low.indexOf(inf) >= 0) { out.push(inf.replace(/\.inf$/, '')); }
            if (typeof fault.decoyIp === 'string' && fault.decoyIp.length >= 7 && hasToken(s, fault.decoyIp)) { out.push(fault.decoyIp); }
        }
        return out;
    }

    /* Stamps every diagnostic ledger entry written since `before` with what `text` showed. */
    function stamp(state, before, text) {
        if (!state || !state.ledger || !state.fault) { return; }
        var seen = null;
        for (var i = before; i < state.ledger.length; i++) {
            var e = state.ledger[i];
            if (ROUTE_KINDS.indexOf(e.k) < 0) { continue; }
            /* a route that stamped from its own data keeps it (Get-Process: text can echo input) */
            if (typeof e.seen === 'string') { continue; }
            if (seen === null) { seen = shown(text, state.fault).join(',').slice(0, 160); }
            e.seen = seen;
        }
    }

    module.exports = { ROUTE_KINDS: ROUTE_KINDS, shown: shown, stamp: stamp };
})();
