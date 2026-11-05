/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-provision.js — the staff "provision PC" rescue after a failed install (spec 2.5, 13.5
 * item 4).
 *
 * The replacement PC is built THROUGH THE ENGINE'S OWN ACTIONS on a pristine copy of the sitting's
 * lab (gui.act and shell.exec, the routes a student has), never by writing state by hand, so it can
 * only be a PC the exam itself could produce. The fabric baseline:
 *   - Generation 2, vTPM, Secure Boot, the WO's memory, vCPUs and disk size;
 *   - Windows 11 Pro (fixed, never the derived edition) on the OS disk, C: at the WO size, so D:
 *     stays possible; the archive as the fabric delivered it;
 *   - the student's SEEDED technician admin (wo.technician), so 1.4 matches beyond P1 as it stood;
 *   - default OOBE privacy, default hostname, unactivated.
 * P1 is graded from the PC as it stood before the rescue (mdfinal-grade.js gradeSitting).
 *
 * Pure: no clock, no Firestore. Throws if a step fails, because a failing step is an engine bug
 * and a half-built PC must never be handed to a student.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var GUI = require('./mdfinal-gui.js');
    var SH = require('./mdfinal-shell.js');
    var PC = require('./mdfinal-pc.js');

    /* The technician password staff read from the runbook. The engine never stores or checks it. */
    var PROVISION_PASSWORD = 'Meridian-Tech-2026';

    var DEFAULT_PRIVACY = { location: true, findMyDevice: true, diagnosticData: 'Optional', inking: true, tailored: true, advertisingId: true };

    /* One action that must succeed. */
    function step(s, win, action, params) {
        var r = GUI.act(s, win, action, params || {}, {});
        if (!r.ok) { throw new Error('mdfinal-provision: ' + win + '/' + action + ' failed'); }
        return r;
    }

    /* Builds the fabric baseline on `fresh`, a pristine generated state for the same sitting, and
     * returns it on the desktop with a `provisioned` ledger entry (ref 'staff': never student text). */
    function build(fresh) {
        var s = fresh, wo = s.wo;
        /* named as the brief names it (the sitting's hostname), so a rescued PC matches the work order */
        step(s, 'hyperv', 'new-vm', { name: wo.hostname, generation: 2, memoryMB: wo.vm.startupMemoryMB, dynamicMemory: false,
                                      vhdxGB: wo.vm.vhdxGB, switch: 'Meridian-LAN', iso: 'Win11_24H2_Business_x64.iso' });
        step(s, 'vm-settings', 'apply', { vcpu: wo.vm.vcpu, vtpm: true });
        step(s, 'hyperv', 'start');
        step(s, 'setup', 'lang', {});
        step(s, 'setup', 'option', { agree: true });
        step(s, 'setup', 'key', { noKey: true });
        step(s, 'setup', 'edition', { edition: 'Pro' });
        step(s, 'setup', 'eula', { accept: true });
        var os = s.disks.filter(function (d) { return d.role === 'os'; })[0];
        step(s, 'setup', 'new', { disk: os.n, sizeMB: wo.disks.cGB * 1024 + 116 });
        var prim = os.partitions.filter(function (p) { return p.type === 'Primary'; });
        step(s, 'setup', 'install', { disk: os.n, part: prim[prim.length - 1].id });
        step(s, 'oobe', 'region', {});
        step(s, 'oobe', 'keyboard', {});
        step(s, 'oobe', 'name', { skip: true });
        /* Pro's OOBE either insists on a Microsoft account (the "msa" screen: bypass it with
         * oobe\bypassnro, which restarts OOBE, then "I don't have internet" > limited setup) or
         * offers "Set up for work or school" > Domain join instead. Both end at a local account. */
        if (s.os.oobe.screen === 'msa') {
            SH.exec(s, 'oobe-cmd', 'oobe\\bypassnro', {});
            step(s, 'oobe', 'region', {});
            step(s, 'oobe', 'keyboard', {});
            step(s, 'oobe', 'name', { skip: true });
            step(s, 'oobe', 'limited-setup', {});
        } else {
            step(s, 'oobe', 'setup-type', { type: 'work' });
            step(s, 'oobe', 'domain-join-instead', {});
        }
        step(s, 'oobe', 'account', { name: wo.technician, password: PROVISION_PASSWORD });
        step(s, 'oobe', 'privacy', DEFAULT_PRIVACY);
        if (!PC.onDesktop(s)) { throw new Error('mdfinal-provision: the baseline did not reach the desktop'); }
        if (s.shell) { s.shell.history = []; }
        PC.ledger(s, 'provisioned', 'staff');
        return s;
    }

    module.exports = { build: build, PROVISION_PASSWORD: PROVISION_PASSWORD };
})();
