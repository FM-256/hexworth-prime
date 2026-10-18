/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * netfinal-client.js — the ONLY thing a browser may be given.
 *
 * Spec section 9, which is a security requirement rather than a preference:
 *   "The server generates { initialState, answerKey } from the seed and sends only initialState to
 *    the browser. Answers, the event log, and final state go back to the server, which grades. The
 *    browser never holds expected values or grader functions."
 *   "Fault metadata stays server-side. initialState contains the broken config but no field naming
 *    the fault, slot, or variant. A student reading state in dev tools sees a misconfigured
 *    network, which is what they would see anyway."
 *
 * WHY THIS FILE EXISTS, AND WHY NOW. Mallory audited stages 1-5 and found that `state` as generated
 * carries, in the same object a page would need: all twelve `faults[]` entries with slot, variant,
 * id, layer, group and -- for four of them -- the exact target host, switch and port; `meta.seedStr`
 * and `meta.seed32`; and `baseline.deviceConfigs`, a full exam-start snapshot whose diff against
 * live state locates every fault. 47KB of object, essentially all of it answer-key-adjacent, with
 * no function anywhere that trimmed it. Her point about timing is the one that mattered: cheap to
 * add before a frontend exists, catastrophic to retrofit once one expects a full-state blob.
 *
 * A WHITELIST, NEVER A BLACKLIST. `toInitialState` names what may leave. A blacklist of secrets to
 * strip fails open the moment a later stage adds a field -- and stage 6 is about to add the answer
 * key. A whitelist fails closed: a new secret field is absent from the payload until someone
 * deliberately adds it, and the leak test below fails if anyone does.
 *
 * NOTE ON THIS ARCHITECTURE. Because the engine is server-authoritative -- the page posts a command
 * and renders returned text -- a browser does not strictly need lab state at all. This projection
 * exists for the parts a page genuinely draws locally (the desktop, the device list, the rack
 * outline) and as the single enforced boundary if stage 7 ever wants more. Sending less is always
 * safe; sending `state` never is.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var TOPO = require('./netfinal-topology.js');

    /* Fields that must never appear in anything a client receives DURING the exam, at any depth.
     * The leak test points this at every client-facing function in the engine, not just at this
     * projector, which is the only way it stays true as stages 6 and 7 add surfaces.
     *
     * SCOPED TO DURING-EXAM, deliberately. A graded report issued after submission legitimately
     * contains root causes, expected fixes and per-slot results -- that is what a report is for.
     *
     * `rootCause` and `ticket` are NOT on this list even though fault definitions carry them,
     * because the change-request form has fields by those names and echoes the STUDENT'S OWN words
     * back to them. Listing them would have made the detector cry leak over a student reading their
     * own submission, and a detector that fires on innocent data is one people learn to ignore.
     * Fault definitions live in netfinal-faults.js and never enter `state`, so there is no path for
     * the authored strings to reach a client through a payload. */
    var FORBIDDEN_KEYS = [
        'faults', 'baseline', 'answerKey', 'seedStr', 'seed32', 'violatedAtStart', 'amnesty',
        'deviceConfigs', 'fixedAtEvent', 'undone', 'undoneCount', 'variantSpace', 'rejected',
        'wrongFix', 'correctFix', 'expectedFix', 'ticketId',
        'claimsIp', 'placed', 's9aShortfall', 'nocDecoy', 'decoyAlert', 'devSeed',
        /* `slot` and `variant` as KEY NAMES. They were only ever matched as string VALUES by the
         * patterns below, so an object carrying `{ slot: 'S3', variant: 'A' }` passed cleanly --
         * and 'S3' alone does not match the S<n><A|B> pattern either. Found by the derived-coverage
         * test the moment it was written, which is the argument for deriving rather than listing. */
        'slot', 'variant'
    ];

    /* Checked by VALUE rather than by name, because the name is too common to forbid. A fault's id
     * is 'S3A', which the pattern sweep below catches wherever it appears; banning the key `id`
     * would flag every legitimate object in the engine. */
    var VALUE_CHECKED_KEYS = ['id'];

    /* Checked by SHAPE: see isFaultTarget. The firewall window legitimately uses `target` for a
     * port forward's destination. */
    var SHAPE_CHECKED_KEYS = ['target'];

    /* THE SCANNER IS A BLACKLIST, AND A BLACKLIST FAILS OPEN. The projector above is a whitelist and
     * fails closed, but findDisclosures() below is pointed at every GUI render, every action return
     * and every command's output, and it only knows the names listed here.
     *
     * Chris caught exactly that: `ticketId` was added to the fault objects in the round that
     * introduced tickets, and nobody added it here -- so the generic scanner would have missed a
     * future window that destructured a fault and returned a new object carrying it. `faults` being
     * forbidden does not help once something copies a field out of one. That is Mallory's original
     * finding reappearing, caused by this file's own next change.
     *
     * SO THE COVERAGE IS DERIVED, NOT REMEMBERED. Every field that appears on a fault object must be
     * either forbidden here or named benign below, and a test asserts it against a real generated
     * lab. Adding a field to a fault without classifying it now fails a test instead of quietly
     * widening the hole. */
    var BENIGN_FAULT_FIELDS = ['active', 'applied', 'layer', 'group'];

    /* `target` is SHAPE-CHECKED rather than banned outright. A fault's target is an object naming
     * the host, switch and port it broke -- a disclosure. But the firewall window legitimately uses
     * `target` for a port forward's destination ("172.16.50.10:443"), which is pfSense's own wording
     * and something a student must be able to read.
     *
     * Banning the name would have meant renaming a correct UI field to appease the detector, which
     * is how a detector stops being trusted and starts being routed around. Flagged only when the
     * value is an object carrying fault-target fields. */
    var TARGET_SHAPE = ['host', 'switch', 'port', 'aps'];
    function isFaultTarget(v) {
        return !!v && typeof v === 'object' && !Array.isArray(v)
            && TARGET_SHAPE.some(function (k) { return v[k] !== undefined; });
    }

    /* Substrings that would name a fault. A slot id in any string is a disclosure, so the test
     * greps rendered text as well as object keys. */
    var FORBIDDEN_PATTERNS = [
        /\bS(?:[1-9]|1[0-2])[AB]\b/,          // S1A ... S12B
        /\bslot\b/i,
        /\bvariant\b/i
    ];

    function pick(obj, keys) {
        var out = {};
        keys.forEach(function (k) { if (obj && obj[k] !== undefined) { out[k] = obj[k]; } });
        return out;
    }

    /* The projection. Everything here is something a student can see by looking at the network
     * anyway -- addresses, port assignments, device names -- which is the spec's own standard:
     * "a misconfigured network, which is what they would see anyway". */
    function toInitialState(state) {
        return {
            exam: {
                /* Identity WITHOUT the seed. A student knowing which exam they sit is not a leak;
                 * knowing the string that generated it is the whole answer key. */
                studentId: state.meta.studentId,
                examId: state.meta.examId,
                generatorVersion: state.meta.generatorVersion,
                elapsedSec: state.examElapsedSec
            },
            /* The network as it currently stands, broken. No marker of WHAT is broken. */
            vlans: Object.keys(state.subnets).map(function (v) {
                var s = state.subnets[v];
                return { id: s.vlan, name: s.name, cidr: s.cidr, mask: s.mask, gateway: s.gateway };
            }),
            devices: TOPO.DEVICES.map(function (d) {
                return { id: d.id, role: d.role, platform: d.platform, access: d.access,
                         mgmtIp: state.devices[d.id] ? state.devices[d.id].mgmtIp : null };
            }),
            ports: Object.keys(state.ports).reduce(function (acc, sw) {
                acc[sw] = Object.keys(state.ports[sw]).map(function (pn) {
                    return pick(state.ports[sw][pn],
                        ['name', 'mode', 'vlan', 'allowed', 'shutdown', 'up', 'speed', 'duplex', 'label']);
                });
                return acc;
            }, {}),
            /* The stale diagram, which is handed over deliberately and is deliberately wrong. */
            decoyDiagram: state.decoyDiagram,
            /* The ticket queue. The TEXT is the symptom and reading it is the first thing the exam
             * asks for, so it is legitimately client-facing; the id-to-slot mapping is not here and
             * lives only on faults[], which this projection excludes. */
            tickets: (state.tickets || []).map(function (t) {
                return { id: t.id, kind: t.kind, text: t.text };
            }),
            /* Progress, as counts only. Which questions are answered is the student's own business;
             * whether they are RIGHT is not in this payload and is not computed client-side. */
            progress: {
                answered: Object.keys(state.answers || {}).length,
                changeRequests: (state.changeRequests || []).length,
                incidentEntries: (state.incidentLog || []).length
            }
        };
    }

    /* ═══ FIELDS WHOSE CONTENTS THE STUDENT WROTE ════════════════════════════════════════════════
     *
     * Their VALUES are exempt from the pattern sweep. Not from the forbidden-key check, not from the
     * fault-target shape check -- only from "does this text look like a fault id".
     *
     * WHY, AND IT IS NOT A CONVENIENCE. The comment above FORBIDDEN_KEYS records that `rootCause`
     * and `ticket` were deliberately left OFF the key list because the change-request form has
     * fields by those names and echoes the student's own words back: "a detector that fires on
     * innocent data is one people learn to ignore." The value-pattern sweep one check later never
     * got the same exemption, so the same innocent text the key exemption exists to protect was
     * caught anyway, one line down.
     *
     * The consequence was not a stray warning. `renderWindow` REFUSES to send a window that
     * discloses, and `CR_ACTIONS.submit` only pushes -- there is no replace-by-ticket the way the
     * incident log has. So a student who wrote "I think this is fault S7B" in a root cause poisoned
     * the array permanently: every later render re-scanned the stored entry and threw, locking them
     * out of filing or reading ANY change request for the rest of the exam. That destroys the
     * "change request filed before the change" full-credit path on every remaining fix question --
     * six points against three, per fix, with no recovery and no UI that explains it. Reproduced:
     * three consecutive renders, three refusals, from one sentence a confident student might write.
     *
     * The scan still protects what it exists to protect. Fault definitions live in netfinal-faults.js
     * and never enter `state`, so there is no path for an AUTHORED fault string to arrive inside one
     * of these fields -- the only writer is the student, through GUI actions that take their input
     * verbatim. A server-placed fault id anywhere else is still caught, and the leak suite asserts
     * both halves of that. */
    var STUDENT_AUTHORED_FIELDS = [
        'rootCause', 'symptom', 'fix', 'verification', 'plannedChange', 'rollback',
        /* The student's saved answers, returned so a refresh can restore the form. Exempted
         * pre-emptively: nothing scans that envelope today, and a typed answer is the same class of
         * student-authored text as a root cause. */
        'answers'
    ];

    /* Deep scan for a disclosure. Exported so the leak test can point it at ANY value -- a GUI
     * render, a command's text output, a callable's return -- rather than only at this projector.
     *
     * `exempt` is inherited down a subtree, so `answers.q24.name` is covered by `answers` without
     * every nested field having to be listed. */
    function findDisclosures(value, path) {
        var hits = [];
        var walk = function (v, p, exempt) {
            if (v === null || v === undefined) { return; }
            if (typeof v === 'string') {
                if (exempt) { return; }
                FORBIDDEN_PATTERNS.forEach(function (re) {
                    if (re.test(v)) { hits.push({ path: p, why: 'text matches ' + re, sample: v.slice(0, 90) }); }
                });
                return;
            }
            if (typeof v !== 'object') { return; }
            if (Array.isArray(v)) {
                v.forEach(function (x, i) { walk(x, p + '[' + i + ']', exempt); });
                return;
            }
            Object.keys(v).forEach(function (k) {
                /* These two run REGARDLESS of exemption: a forbidden key, or an object under the
                 * key `target` that has a fault target's shape, inside a student-authored field
                 * would mean the SERVER put it there, which is exactly the disclosure this scanner
                 * exists for.
                 *
                 * BE PRECISE ABOUT THE SECOND ONE. It is gated on the key being spelled `target`;
                 * it is NOT a generic sweep for target-shaped objects under any key, and an earlier
                 * comment of mine implied it was. A generic sweep would be actively wrong here:
                 * `state.endpoints` entries legitimately carry `switch` and `port` and are shown to
                 * students in the MAC address table and the rack view, so a shape-only rule would
                 * fire on the lab's own furniture. Nothing in the engine writes a target-shaped
                 * object under any other key, so the narrow gate is sufficient today -- but a future
                 * reader should not assume more coverage than the line actually has. */
                if (FORBIDDEN_KEYS.indexOf(k) >= 0) {
                    hits.push({ path: p + '.' + k, why: 'forbidden key', sample: JSON.stringify(v[k]).slice(0, 90) });
                } else if (k === 'target' && isFaultTarget(v[k])) {
                    hits.push({ path: p + '.' + k, why: 'fault target object', sample: JSON.stringify(v[k]).slice(0, 90) });
                }
                walk(v[k], p + '.' + k, exempt || STUDENT_AUTHORED_FIELDS.indexOf(k) >= 0);
            });
        };
        walk(value, path || '$', false);
        return hits;
    }

    module.exports = {
        toInitialState: toInitialState, findDisclosures: findDisclosures,
        FORBIDDEN_KEYS: FORBIDDEN_KEYS, FORBIDDEN_PATTERNS: FORBIDDEN_PATTERNS,
        BENIGN_FAULT_FIELDS: BENIGN_FAULT_FIELDS, VALUE_CHECKED_KEYS: VALUE_CHECKED_KEYS,
        SHAPE_CHECKED_KEYS: SHAPE_CHECKED_KEYS, isFaultTarget: isFaultTarget,
        STUDENT_AUTHORED_FIELDS: STUDENT_AUTHORED_FIELDS
    };
})();
