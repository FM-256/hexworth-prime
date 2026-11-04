/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-handover.js — the handover: the P1-P6 snapshot, then the P7 fault.
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, 2.1 (snapshot), 2.4.
 *
 * One way, once. The snapshot is a deep copy taken BEFORE the fault touches anything; P1-P6 are
 * graded only against it, so nothing done afterwards can move a P1-P6 score. With Windows on the
 * desktop the variant is applied and the PC restarts, so the student meets the symptom. With no
 * installed OS, the snapshot is still taken and no fault is applied (7.1 and 8.2 score 0, `no-os`).
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var PC = require('./mdfinal-pc.js');
    var FAULTS = require('./mdfinal-faults.js');
    var SYS = require('./mdfinal-sys.js');
    var APPS = require('./mdfinal-apps.js');

    /* Takes the snapshot and applies the fault. Returns { ok, snapshot, applied, reason }. */
    function handover(state, key) {
        if (state.handedOver) { return { ok: false, msg: 'The PC has already been handed over.' }; }
        var installed = !!(state.os && state.os.oobe && state.os.oobe.done);
        /* the areas a fault touches exist BEFORE the snapshot, so both sides compare like with like */
        if (installed) { SYS.sys(state); APPS.apps(state); }
        var snapshot = JSON.parse(JSON.stringify(state));
        state.handedOver = true;
        if (!installed) { return { ok: true, snapshot: snapshot, applied: false, reason: state.os ? 'no-desktop' : 'no-os' }; }
        /* Windows is installed: the fault is applied whatever the power state (Nancy D5 R3 #8); if the
         * VM is running it restarts into the symptom, otherwise the student meets it at the next start. */
        FAULTS.apply(state, key);
        if (state.vm && state.vm.power === 'on') { PC.boot(state); }
        return { ok: true, snapshot: snapshot, applied: true };
    }

    module.exports = { handover: handover };
})();
