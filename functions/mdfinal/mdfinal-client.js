/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-client.js — what a browser may be given at start and resume, and the disclosure scanner
 * every window and action result passes through on its way out (spec R5).
 *
 * toInitialState IS A WHITELIST. It names each field that leaves; it never copies `state`. The WO is
 * copied by an explicit key list (WO_KEYS), and the leak suite fails when the generator grows a WO
 * key nobody reviewed, so a new field stays server-side until someone decides it is student prose.
 * One WO field is withheld on purpose: `performance.highImpact` (WHICH startup apps are High
 * impact). Finding them in Task Manager is the skill row 6.3 grades; the brief says "disable the
 * High-impact startup apps" without naming them.
 *
 * findDisclosures IS A BACKSTOP, NOT THE BOUNDARY. The views (mdfinal-views.js) are the boundary;
 * this re-checks the actual payload, because a disclosure that reached a student cannot be taken
 * back. Exact key names (no wildcards), value patterns, and { $s } nodes for student text: a $s
 * value is skipped for patterns (so a student who types "mdf-v1" as a hostname is not locked out)
 * but must be a capped string with no other key.
 *
 * WHAT A HIT RETURNS: paths and reasons, never the matched value. netfinal's first scanner printed
 * the secret it refused to send (netfinal-exam.js, the long note in runCommand); the callers here
 * log the paths server-side and give the student a generic message.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var GUI = require('./mdfinal-gui.js');
    var SH = require('./mdfinal-shell.js');
    var PC = require('./mdfinal-pc.js');
    var ANS = require('./mdfinal-answers.js');
    var VIEWS = require('./mdfinal-views.js');
    var BRIEF = require('./mdfinal-brief.js');
    var LIM = require('./mdfinal-limits.js');

    var own = function (o, k) { return !!o && Object.prototype.hasOwnProperty.call(o, k); };

    /* Exact key names that never reach a client during the exam (R5), plus every key on the
     * `state.fault` record except `ticketId`, which the ticket shows (coverage is test-derived:
     * mdfinal-leak.test.js fails when the fault record grows a key that is not listed here), plus
     * the per-object markers views must strip (`hotfix`, `keep`) and the graded ledger. */
    var FORBIDDEN_KEYS = LIM.deepFreeze([
        'answerKey', 'fault', 'faults', 'snapshot', 'baseline', 'seedStr', 'seed32', 'devSeed', 'derivedKey', 'hmac',
        'fixedAtLedger', 'appliedAtLedger', 'amnesty', 'variantSpace', 'expectedEdition', 'expectedChannel',
        'canonicalRepair', 'validVerify', 'evidenceSet', 'resolutionLadder', 'profileId',
        'variant', 'driverInf', 'decoyIp', 'snapshotDns', 'vendorDns', 'hostsLine', 'reinstalled',
        'hotfix', 'keep', 'ledger', 'ledgerAt', 'regScratch', 'highImpact'
    ]);

    /* Value patterns: internal fault and profile ids, the HMAC domain, and a serialised marker. */
    var PATTERNS = LIM.deepFreeze([
        { why: 'fault id', re: /\bmdf-v[1-4]\b/i },
        { why: 'profile id', re: /\bmdp-[abc]\b/i },
        { why: 'hmac domain', re: /hexworth\/mdfinal/i },
        { why: 'serialised marker', re: /"(fault|hotfix|keep)"\s*:/ }
    ]);

    /* Is this node a student-text wrapper? Exactly { $s: <string> }. */
    function isS(v) {
        return v !== null && typeof v === 'object' && !Array.isArray(v) && own(v, '$s');
    }

    /* Scans a payload. Returns [{ path, why }] (never the value). `where` prefixes the paths. */
    function findDisclosures(value, where) {
        var found = [];
        var seen = 0;
        (function walk(v, path) {
            if (++seen > 200000) { found.push({ path: path, why: 'too large to scan' }); return; }
            if (typeof v === 'string') {
                PATTERNS.forEach(function (p) { if (p.re.test(v)) { found.push({ path: path, why: p.why }); } });
                return;
            }
            if (v === null || typeof v !== 'object') { return; }
            if (isS(v)) {
                var keys = Object.keys(v);
                if (keys.length !== 1 || typeof v.$s !== 'string' || v.$s.length > VIEWS.S_MAX) { found.push({ path: path, why: 'malformed $s' }); }
                return;
            }
            if (Array.isArray(v)) { v.forEach(function (x, i) { walk(x, path + '[' + i + ']'); }); return; }
            Object.keys(v).forEach(function (k) {
                if (FORBIDDEN_KEYS.indexOf(k) >= 0) { found.push({ path: path + '.' + k, why: 'forbidden key' }); return; }
                if (k === '__proto__' || k === 'constructor' || k === 'prototype') { found.push({ path: path + '.' + k, why: 'prototype key' }); return; }
                walk(v[k], path + '.' + k);
            });
        })(value, String(where || '$'));
        return found;
    }

    /* The WO keys a student is shown, and how each is copied (true = the whole subtree; a list =
     * those subkeys only). A key missing here never leaves the server. */
    var WO_KEYS = LIM.deepFreeze({
        ticket: true, requirements: true, editionRule: true, hostname: true, technician: true, user: true,
        secondMember: true, group: true, join: true, network: true, vm: true, disks: true, lob: true, share: true,
        confidentialPath: true, updates: true, power: true, timeZone: true, performance: ['pagefileMB'],
        consumerApp: true, defenderExclusion: true, privacy: true, mak: true, retailCoa: true, build: true
    });

    /* The WO as the student reads it. */
    function projectWo(wo) {
        var out = {};
        Object.keys(WO_KEYS).forEach(function (k) {
            if (!own(wo, k)) { return; }
            var how = WO_KEYS[k];
            if (how === true) { out[k] = JSON.parse(JSON.stringify(wo[k])); return; }
            out[k] = {};
            how.forEach(function (sub) { if (own(wo[k], sub)) { out[k][sub] = JSON.parse(JSON.stringify(wo[k][sub])); } });
        });
        return out;
    }

    /* The action table the page builds its forms from: static, no state. */
    var ACTION_TABLE = LIM.deepFreeze(Object.keys(GUI.ACTION_SCHEMA).map(function (id) {
        var a = GUI.ACTION_SCHEMA[id];
        var params = {};
        Object.keys(a.params).forEach(function (k) {
            var t = a.params[k];
            var d = { type: t.type };
            ['max', 'min', 'maxLen', 'word', 'nullable'].forEach(function (f) { if (own(t, f)) { d[f] = t[f]; } });
            if (own(t, 'values')) { d.values = t.values.slice(); }
            params[k] = d;
        });
        return { id: id, params: params, required: a.required.slice() };
    }));

    /* What a full-screen boot message says, if the VM shows one. */
    function screenMessage(state) {
        var sc = GUI.currentScreen(state);
        if (sc === 'firmware-error') { return PC.MSG.sbDenied; }
        if (sc === 'no-os') { return PC.MSG.noOs; }
        return null;
    }

    /* The page's starting picture of the sitting: screen, WO, open windows and consoles, the ticket
     * once there is one, the P8 fields offered, the brief and the task list. Never the shell history
     * or a pending prompt (13.13 item 7): the page keeps its own scrollback within a visit. */
    function toInitialState(state) {
        var wo = projectWo(state.wo);
        return {
            screen: GUI.currentScreen(state),
            screenMessage: screenMessage(state),
            wo: wo,
            rules: BRIEF.rules(state.meta.examId),
            keyTable: BRIEF.keyTable(),
            tasks: BRIEF.tasks(wo),
            windows: VIEWS.WINDOW_NAMES.filter(function (w) { return GUI.screenAllows(state, w); }),
            consoles: SH.CONSOLES.filter(function (c) { return SH.consoleAvailable(state, c); }),
            handedOver: !!state.handedOver,
            ticket: VIEWS.ticket(state),
            answerFields: ANS.answerFields(state),
            actions: ACTION_TABLE
        };
    }

    module.exports = {
        FORBIDDEN_KEYS: FORBIDDEN_KEYS, PATTERNS: PATTERNS, WO_KEYS: WO_KEYS, ACTION_TABLE: ACTION_TABLE,
        findDisclosures: findDisclosures, toInitialState: toInitialState, projectWo: projectWo, isS: isS
    };
})();
