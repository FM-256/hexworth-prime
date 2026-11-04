/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-answers.js — the P8 as-built record: which fields exist when, and what a saved value may be.
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, 5 (P8 fields), R3 (answer
 * caps), 2.3 (B fields once the desktop exists; I fields only after handover).
 *
 * Saves return only { saved, answeredCount }: never correctness. Values stay editable until submit.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var LIM = require('./mdfinal-limits.js');
    var FAULTS = require('./mdfinal-faults.js');
    var BL = require('./mdfinal-bitlocker.js');
    var A = LIM.LIMITS.answers;

    var METHOD_OPTIONS = Object.keys(BL.METHODS).map(function (k) { return BL.METHODS[k]; });

    /* Field definitions: type, options or max length. */
    var FIELDS = LIM.deepFreeze({
        B1: { type: 'text', max: A.typedChars, label: 'Recovery-password protector ID (first 8 hex characters)' },
        B2: { type: 'select', options: METHOD_OPTIONS, label: 'C: encryption method' },
        I1: { type: 'select', options: FAULTS.CATEGORIES, label: 'Root-cause category' },
        I2: { type: 'text', max: 32, label: 'Evidence identifier (as shown in the evidence: a KB number, stop code, event ID, process or file name)' },
        I3: { type: 'select', options: FAULTS.VERIFY_OPTIONS, label: 'Verified by' }
    });

    /* The field ids this sitting offers now (2.3): B once the desktop exists, I after handover. */
    function answerFields(state) {
        var out = [];
        if (state.os && state.os.oobe && state.os.oobe.done) { out.push('B1', 'B2'); }
        if (state.fault) { out.push('I1', 'I2', 'I3'); }
        return out;
    }

    /* Saves one field. '' clears it. Refuses fields not offered and values of the wrong shape. */
    function save(state, fieldId, value) {
        var id = String(fieldId);
        if (answerFields(state).indexOf(id) < 0) { return { ok: false, msg: 'That field is not available.' }; }
        var f = FIELDS[id];
        if (typeof value !== 'string') { return { ok: false, msg: 'That value is not valid.' }; }
        if (!state.answers) { state.answers = {}; }
        if (value === '') { delete state.answers[id]; }
        else if (f.type === 'select') {
            if (value.length > A.optionIdChars * 2 || f.options.indexOf(value) < 0) { return { ok: false, msg: 'That value is not valid.' }; }
            state.answers[id] = { value: value };
        } else {
            if (value.length > f.max) { return { ok: false, msg: 'That value is too long.' }; }
            state.answers[id] = { value: value };
        }
        return { ok: true, saved: true, answeredCount: Object.keys(state.answers).length };
    }

    module.exports = { FIELDS: FIELDS, METHOD_OPTIONS: METHOD_OPTIONS, answerFields: answerFields, save: save };
})();
