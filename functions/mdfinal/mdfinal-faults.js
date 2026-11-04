/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-faults.js — the P7 single-fault catalogue: applying a variant at handover, the resolved
 * ladders evaluated after a simulated normal boot, the no-regression comparison over 13 state
 * domains, and the truth the P8 incident fields are graded against.
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, section 4 (4.1 variants,
 * 4.2 no-regression, 4.3 System Restore), 5 (P8), 13.5 item 5 (ladders, diagnostic gates), 13.12.
 *
 * WHERE THE HIDDEN VALUES GO. Before handover the state carries nothing of the fault. At handover,
 * `state.fault` records the variant and the per-sitting values the symptoms need (fault KB, driver
 * inf, decoy IP), because from that moment they ARE on the PC for the student to find; this record
 * itself is never projected to the client. The answer key keeps the truth either way.
 *
 * Boot-time behaviour (filter driver blocks the boot, Explorer crash loop, persistence restarting
 * the sync helper, the VPN helper re-writing DNS and hosts) lives in mdfinal-pc.js's boot path as
 * data rules over state.fault and state.sys, so every restart a student does goes through it.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var crypto = require('crypto');
    var LIM = require('./mdfinal-limits.js');
    var PC = require('./mdfinal-pc.js');
    var SYS = require('./mdfinal-sys.js');
    var APPS = require('./mdfinal-apps.js');
    var NET = require('./mdfinal-net.js');
    var BL = require('./mdfinal-bitlocker.js');
    var freeze = LIM.deepFreeze;

    var VENDOR_DNS = freeze(['203.0.113.53', '203.0.113.54']);   /* RFC 5737 TEST-NET-3 */
    var CATEGORIES = freeze(['driver', 'boot configuration', 'update', 'system file corruption', 'name resolution', 'runaway process', 'data loss', 'hardware']);
    var VERIFY_OPTIONS = freeze(['restart and confirm normal boot', 'restart and confirm Explorer stable', 'Task Manager or Get-Process after restart',
        'name-resolution or port test', 'Event Viewer recheck', 'Update history check', 'none']);

    /* Per variant: category, valid I3 methods (option -> ledger kinds that prove it), qualifying
     * diagnostic ledger kinds for I1/I2 (13.5 item 5), and the ledger kinds that count as fix work. */
    var CATALOGUE = freeze({
        V1: { category: 'driver', ticket: 'After the backup agent install last night the PC blue-screens and lands on a blue recovery screen.',
              verify: { 'restart and confirm normal boot': ['boot-normal'], 'Event Viewer recheck': ['eventvwr'] },
              diag: ['winre-view', 'eventvwr', 'pnputil-enum'], fix: ['driver-delete', 'program-uninstall', 'offline-reg', 'dism-remove-driver', 'system-restore', 'service-start'] },
        V2: { category: 'update', ticket: 'Since I installed the hotfix support emailed, the taskbar and Start keep disappearing.',
              verify: { 'restart and confirm Explorer stable': ['boot-normal'], 'Update history check': ['update-history'], 'Event Viewer recheck': ['eventvwr'] },
              diag: ['taskmgr-view', 'update-history', 'eventvwr', 'hotfix-list'], fix: ['hotfix-uninstall', 'system-restore'] },
        V3: { category: 'runaway process', ticket: 'PC got very slow this morning, fans loud.',
              verify: { 'Task Manager or Get-Process after restart': ['taskmgr-view', 'get-process'] },
              diag: ['taskmgr-view', 'get-process'], fix: ['process-end', 'task-disable', 'task-delete', 'startup', 'program-uninstall', 'system-restore', 'run-delete'] },
        V4: { category: 'name resolution', ticket: "LedgerSync says 'server not found' since I installed the VPN helper.",
              verify: { 'name-resolution or port test': ['name-test'] },
              diag: ['ipconfig', 'name-test', 'hosts-view', 'eventvwr'], fix: ['service-start', 'program-uninstall', 'hosts-write', 'ipv4'], verifyRef: 'lob' }
    });

    /* JSON round-trip copy (state is plain JSON). */
    function clone(o) { return JSON.parse(JSON.stringify(o)); }

    /* A stable ticket id for the sitting (visible once the ticket exists; reveals nothing hidden). */
    function ticketId(state) {
        var h = crypto.createHash('sha256').update(JSON.stringify(['ticket', state.meta.studentId, state.meta.examId])).digest();
        return 'INC' + String(100000 + (h.readUInt32BE(0) % 900000));
    }

    /* Applies the variant to a PC that reached the desktop. Returns the record stored in state.fault. */
    function apply(state, key) {
        var v = key.variant, f = key.fault, s = SYS.sys(state), wo = state.wo;
        var rec = { variant: v, ticketId: ticketId(state), appliedAtLedger: state.ledger.length, kb: f.kb, driverInf: f.driverInf, decoyIp: f.decoyIp,
                    snapshotDns: state.network.adapters.Ethernet.dns.slice() };
        if (v === 'V1') {
            s.drivers.push({ inf: f.driverInf, original: 'mbafilt.inf', provider: 'Meridian Software', className: 'DiskDrive', name: 'Meridian Backup Agent Volume Filter',
                             service: 'mbafilt', filter: 'mbafilt', fault: true, inUse: true });
            s.services.mbafilt = { display: 'Meridian Backup Agent Volume Filter', start: 'Boot', status: 'Running', fault: true };
            s.upperFilters.disk.push('mbafilt');
            s.programs.push({ name: 'Meridian Backup Agent', uninstall: 'meridian-backup', fault: true });
        } else if (v === 'V2') {
            state.os.updates.history.push({ kb: f.kb, title: 'Hotfix for Microsoft Windows (' + f.kb + ')', revision: state.os.revision, status: 'Installed', hotfix: true, fault: true });
        } else if (v === 'V3') {
            s.programs.push({ name: 'Meridian Sync Helper', uninstall: 'meridian-sync', fault: true });
            s.tasks.push({ path: '\\Meridian\\', name: 'SyncHelperWatchdog', enabled: true, fault: true, triggers: 'At log on; every 5 minutes' });
            if (state.apps) { state.apps.startup.push({ name: 'MerSync', impact: 'High', enabled: true, keep: false, runValue: true, fault: true }); }
        } else if (v === 'V4') {
            s.services.MerVpnHelper = { display: 'Meridian VPN Helper', start: 'Automatic', status: 'Running', fault: true };
            s.programs.push({ name: 'Meridian VPN Helper', uninstall: 'meridian-vpn', fault: true });
            rec.vendorDns = VENDOR_DNS.slice();
            rec.hostsLine = f.decoyIp + ' ' + wo.lob.fqdn + ' ' + wo.lob.host;
        }
        state.fault = rec;
        PC.ledger(state, 'handover', '');
        return rec;
    }

    /* ═══ RESOLVED LADDER (on a clone after a simulated normal boot) ═══ */

    /* Boots a deep copy normally (pc.boot applies every boot-time fault rule) and returns it. */
    /* The clone is powered on and booted whatever power state the student left it in: "after a
     * simulated normal boot" (Nancy D5 R3: a VM switched off at the end failed V1/V2). */
    function bootedClone(state) {
        var c = clone(state);
        if (c.sys) { c.sys.nextBootSafe = false; }
        if (c.vm && c.os) { c.vm.power = 'on'; PC.boot(c); }
        return c;
    }

    /* True while the fault's driver package is still in the driver store. */
    function hasFaultDriver(s) { return !!s.sys && s.sys.drivers.some(function (d) { return d.fault; }); }

    /* Resolved points 0/4/7/10 for the variant, or 0 after Reset this PC or a reinstall. */
    function resolved(state, key) {
        if (!state.fault || (state.sys && state.sys.reset) || state.fault.reinstalled) { return 0; }   /* 4: reset or reinstall scores 0 */
        var b = bootedClone(state), s = b.sys, v = state.fault.variant;
        var normalDesktop = b.screen === 'desktop' && !s.safeMode;
        if (v === 'V1') {
            if (!normalDesktop) { return 0; }
            if (!hasFaultDriver(b)) { return 10; }
            var filterGone = s.upperFilters.disk.indexOf('mbafilt') < 0;
            var svcOff = !s.services.mbafilt || s.services.mbafilt.start === 'Disabled';
            return filterGone || svcOff ? 7 : 0;
        }
        if (v === 'V2') {
            var kbGone = !b.os.updates.history.some(function (x) { return x.kb === state.fault.kb; });
            return kbGone && s.explorer === 'ok' && normalDesktop ? 10 : 0;
        }
        if (v === 'V3') {
            var uninstalled = !s.programs.some(function (p) { return p.name === 'Meridian Sync Helper'; });
            var task = s.tasks.filter(function (t) { return t.fault; })[0];
            var run = b.apps && b.apps.startup.filter(function (x) { return x.name === 'MerSync'; })[0];
            var taskOff = !task || !task.enabled, runOff = !run || !run.runValue || !run.enabled;
            var noProc = !s.processes.some(function (p) { return p.fault; });
            if (uninstalled || (taskOff && runOff && noProc)) { return 10; }
            return taskOff !== runOff ? 4 : 0;
        }
        if (v === 'V4') {
            var lob = [state.wo.lob.fqdn.toLowerCase(), state.wo.lob.host.toLowerCase()];
            var clean = function (st) {
                var dns = st.network.adapters.Ethernet.dns;
                var snapDns = state.fault.snapshotDns || [];
                /* order-insensitive: the same servers in either order resolve the same (Nancy D5 R3 #10) */
                var key2 = function (x) { return JSON.stringify(x.slice().sort()); };
                var dnsOk = key2(dns) === key2(snapDns) || key2(dns) === key2(state.wo.network.dns);
                var hostsOk = !st.sys.hosts.some(function (l) { return l.toLowerCase().split(/\s+/).slice(1).some(function (n) { return lob.indexOf(n) >= 0; }); });
                return dnsOk && hostsOk;
            };
            var helper = s.services.MerVpnHelper;
            var helperOff = !helper || helper.start === 'Disabled' || helper.start === 'Manual';
            if (clean(b) && helperOff) { return 10; }
            return clean(state) && !helperOff ? 4 : 0;
        }
        return 0;
    }

    /* ═══ NO-REGRESSION (4.2): 13 domains, snapshot vs final, amnesty removed ═══ */

    /* The 13 canonical domain projections of a state (4.2), with the variant's amnesty applied:
     * V2 drops the fault KB from updates; V4 drops adapter DNS; fault startup items never count. */
    function domains(st, variant) {
        var os = st.os || {}, id = st.identity || {}, net = st.network || {}, sys = st.sys || {};
        var amnestyKb = st.fault && variant === 'V2' ? st.fault.kb : null;
        var osDisk = (st.disks || []).filter(function (d) { return d.role === 'os'; })[0];
        return {
            vm: st.vm ? [st.vm.generation, st.vm.memoryMB, st.vm.dynamicMemory, st.vm.vcpu, st.vm.vtpm, st.vm.secureBoot] : null,
            install: [os.edition, os.activation, osDisk ? osDisk.partitions.map(function (p) { return [p.type, p.mb, p.letter, p.fs]; }) : null],
            names: [os.hostname, os.timeZone],
            updates: (os.updates ? os.updates.history : []).filter(function (x) { return x.kb !== amnestyKb; }).map(function (x) { return x.kb + ':' + x.status; }),
            power: os.power ? [os.power.active, os.power.plans] : null,
            accounts: [id.users, id.groups, id.uac],
            membership: id.membership,
            ipdns: variant === 'V4' ? [net.adapters && [net.adapters.Ethernet.dhcp, net.adapters.Ethernet.ip, net.adapters.Ethernet.prefix, net.adapters.Ethernet.gateway], net.category]
                                    : [net.adapters, net.category],
            netsec: [net.firewall || null, os.policies ? os.policies.rdp || null : null, net.shares || null, net.smb1 || false],
            storage: [(st.disks || []).map(function (d) { return [d.n, d.partitions.map(function (p) { return [p.letter, p.fs, p.label, p.mb]; })]; }), st.pool || null,
                      st.bitlocker ? [st.bitlocker.C.status, st.bitlocker.C.method, st.bitlocker.C.protectors.map(function (p) { return p.type; })] : null, st.fs || null],
            defender: st.defender || null,
            apps: st.apps ? [st.apps.msi, st.apps.appx, os.policies ? os.policies.wu || null : null, os.updates ? os.updates.activeHours : null,
                             st.apps.startup.filter(function (x) { return !x.fault; }), st.apps.pagefile] : null,
            services: SYS.PROTECTED_SERVICES.map(function (k) { var x = sys.services && sys.services[k]; return x ? x.start : null; })
        };
    }

    /* A comparable copy: lazily created state at its defaults, and every pending restart change
     * applied, so the comparison sees effective values only (Nancy D5 R3: an untouched area or a
     * pending flag flipped by a restart counted as a regression). */
    function normalised(st) {
        var c = clone(st);
        if (c.os && c.os.oobe && c.os.oobe.done) {
            SYS.sys(c); APPS.apps(c); NET.net(c); BL.vol(c); NET.rdp(c);
            if (!c.os.policies.wu) { c.os.policies.wu = {}; }
            if (c.bitlocker.C.status === 'pending') { c.bitlocker.C.status = c.bitlocker.C.protectors.some(function (p) { return p.type === 'Tpm'; }) ? 'on' : 'off'; }
            PC.applyPending(c);
            c.os.hostname.pending = null;
            delete c.os.policies.keys;
        }
        return c;
    }

    /* −1 per changed domain, floor 0 (5 points). */
    function noRegression(snapshot, final, variant) {
        var a = domains(normalised(snapshot), variant), b = domains(normalised(final), variant);
        var changed = Object.keys(a).filter(function (k) { return JSON.stringify(a[k]) !== JSON.stringify(b[k]); });
        return { points: Math.max(0, 5 - changed.length), changed: changed };
    }

    /* ═══ P8 truth ═══ */

    /* Normalises an I2 evidence answer for comparison: hex/int stop codes to one form, KB prefix
     * optional, .exe optional, case-insensitive. */
    function normEvidence(raw) {
        var s = String(raw || '').trim().toLowerCase().split(' ').join('');
        if (!s) { return ''; }
        if (s.slice(0, 4) === 'stop') { s = s.slice(4); if (s[0] === ':') { s = s.slice(1); } }
        if (s === 'inaccessible_boot_device' || s === 'inaccessiblebootdevice') { return 'stop:7b'; }
        if (s.slice(0, 2) === '0x') { var h = s.slice(2).replace(/^0+/, ''); return h === '7b' ? 'stop:7b' : 'hex:' + h; }
        /* the stop code as decimal (123) or bare hex (7B) */
        if (s === '123' || s === '7b' || s === '0000007b') { return 'stop:7b'; }
        if (s.slice(0, 2) === 'kb') { s = s.slice(2); }
        if (s.slice(-4) === '.exe') { s = s.slice(0, -4); }
        return s;
    }

    /* The evidence set for the variant (normalised). */
    function evidenceSet(state, key) {
        var v = key.variant, kbn = key.fault.kb.slice(2);
        if (v === 'V1') { return ['stop:7b', '1001']; }
        if (v === 'V2') { return [kbn, '1000']; }
        if (v === 'V3') { return ['msynchlp']; }
        /* 5719 exists only when the PC really is a domain member (the event is logged then) */
        var m = state.identity && state.identity.membership;
        return m && m.type === 'domain' && !m.pending ? ['1014', '5719'] : ['1014'];
    }

    module.exports = {
        VENDOR_DNS: VENDOR_DNS, CATEGORIES: CATEGORIES, VERIFY_OPTIONS: VERIFY_OPTIONS, CATALOGUE: CATALOGUE,
        ticketId: ticketId, apply: apply, bootedClone: bootedClone, resolved: resolved,
        domains: domains, normalised: normalised, noRegression: noRegression, normEvidence: normEvidence, evidenceSet: evidenceSet
    };
})();
