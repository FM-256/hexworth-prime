/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-checks.js — the 24 graded rows and the regression penalties, as data.
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, 3.1-3.7, 13.2-13.6.
 *
 * CHECKS IS THE SINGLE SOURCE OF TRUTH (3.1). Points, phases, objectives, parts and knock-ons live
 * here and nowhere else; the grade tests derive every total in the spec from this table. Each row's
 * `check(view)` returns one score per part, in part order, reading ONLY:
 *   view.s   the graded state (the handover snapshot, or the final state if never handed over)
 *   view.k   the frozen answer key (every trusted value: WO targets, edition, channel, technician)
 * It never reads state.wo: that is the copy the student was shown, not the truth (v1 2.1).
 *
 * D2 SCOPE: every row is declared; P1's four rows have their check(). P2-P8 rows carry
 * `check: null` until their build day, and the grader reports them as not yet implemented rather
 * than scoring them 0, so a partial engine can never be mistaken for a graded one.
 *
 * `actionParam: true` marks a part that scores a parameter of an action the exam REQUIRES (spec 3.2):
 * Generation 2, the vTPM, the pinned build. These are the only parts allowed to score on
 * defaultInstalledState(), and the defaults test asserts exactly that (13.7).
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var LIM = require('./mdfinal-limits.js');
    var PC = require('./mdfinal-pc.js');
    var NET = require('./mdfinal-net.js');
    var FS = require('./mdfinal-fs.js');
    var NF = require('../netfinal/netfinal-core.js');
    var FAULTS = require('./mdfinal-faults.js');
    var BLM = require('./mdfinal-bitlocker.js').METHODS;

    /* Built-in local groups (a WO group can never be one of these). */
    var OS_BUILTIN_GROUPS = ['Administrators', 'Users', 'Guests', 'Remote Desktop Users'];

    /* Score helper: full points when cond holds, else 0. */
    function pts(cond, n) { return cond ? n : 0; }

    /* Case-insensitive key lookup in an account/group map (Windows names are case-insensitive). */
    function findKey(map, name) {
        var n = String(name || '').toLowerCase();
        var ks = Object.keys(map || {});
        for (var i = 0; i < ks.length; i++) { if (ks[i].toLowerCase() === n) { return ks[i]; } }
        return null;
    }

    /* True when a group's member list contains this local account (case-insensitive). */
    function isMember(s, group, name) {
        var g = findKey(s.identity.groups, group);
        if (!g) { return false; }
        var n = String(name).toLowerCase();
        return s.identity.groups[g].members.some(function (m) { return m.toLowerCase() === n; });
    }

    /* The active power plan, or null. */
    function activePlan(s) {
        var p = s.os.power;
        return p.plans.filter(function (x) { return x.guid === p.active; })[0] || null;
    }

    /* Home and Home N: no domain join, no Remote Desktop host, no BitLocker (one helper, Nancy D4 A6). */
    function isHome(s) { return !!s.os && (s.os.edition === 'Home' || s.os.edition === 'Home N'); }

    /* Everything P2+ needs exists only once Windows reached the desktop. */
    function desktopDone(s) { return !!(s.os && s.os.oobe && s.os.oobe.done); }

    /* The disk the student's own OS VHDX became, or null before a VM exists. */
    function targetDisk(s) { return PC.diskByRole(s, 'os'); }

    /* ═══ D4 rows (4.1-5.4): each reads only view.s and view.k ═══ */

    /* 4.1 IPv4 & DNS: [ip, prefix, gateway, dns1, dns2] */
    function check41(v) {
        var s = v.s, n = v.k.wo.network;
        if (!desktopDone(s)) { return [0, 0, 0, 0, 0]; }
        var e = s.network.adapters.Ethernet;
        var stat = e.dhcp === false;
        var mask = NF.ip.prefixToMask(e.prefix);
        var roundTrip = NF.ip.prefixToMask(NF.ip.maskToPrefix(mask)) === mask;
        return [pts(stat && e.ip === n.ip, 1),
            pts(stat && e.prefix === n.prefix && roundTrip, 1),
            pts(stat && e.gateway === n.gateway, 1),
            pts(e.dns[0] === n.dns[0], 1),
            pts(e.dns[1] === n.dns[1], 1)];
    }

    /* 4.2 Firewall & profile: [rule, profiles, remote, category] */
    function check42(v) {
        var s = v.s, wo = v.k.wo;
        if (!desktopDone(s) || !s.network.firewall) { return [0, 0, 0, catPart(v)]; }
        /* ONE rule earns parts 1-3 (Nancy D4 A2): an enabled inbound Allow TCP rule naming the WO
         * port explicitly (an Any-port rule is not "a rule for LedgerSync"). An enabled inbound Block
         * rule covering the port wins in Windows, so it voids parts 1-3. */
        var port = wo.lob.port;
        var rules = s.network.firewall.rules;
        var blocked = rules.some(function (r) {
            return r.enabled && r.direction === 'Inbound' && r.action === 'Block' && (r.protocol === 'TCP' || r.protocol === 'Any') && NET.coversPort(r, port);
        });
        var cands = blocked ? [] : rules.filter(function (r) {
            return r.enabled && r.direction === 'Inbound' && r.action === 'Allow' && r.protocol === 'TCP' && r.localPort[0] !== 'Any' && NET.coversPort(r, port);
        });
        if (!cands.length) { return [0, 0, 0, catPart(v)]; }
        var wantProf = JSON.stringify(wo.join.type === 'domain' ? ['Domain', 'Private'] : ['Private']);
        var wantRemote = NET.remote(wo.network.lobRemoteSubnet);
        var best = cands.reduce(function (m, r) {
            var sc = (JSON.stringify(r.profiles) === wantProf ? 1 : 0) + (r.remote.length === 1 && r.remote[0] === wantRemote ? 2 : 0);
            return Math.max(m, sc);
        }, 0);
        return [1, pts(best === 1 || best === 3, 1), pts(best >= 2, 1), catPart(v)];
    }
    /* Category part: contractor Private; domain DomainAuthenticated, or Private when the join is not effective. */
    function catPart(v) {
        var s = v.s;
        if (!desktopDone(s)) { return 0; }
        var c = NET.category(s);
        if (v.k.wo.join.type !== 'domain') { return pts(c === 'Private', 1); }
        var joined = s.identity.membership.type === 'domain' && !s.identity.membership.pending;
        return pts(c === 'DomainAuthenticated' || (!joined && c === 'Private'), 1);
    }

    /* 4.3 Remote Desktop: [enabled, user in Remote Desktop Users] */
    function check43(v) {
        var s = v.s;
        if (!desktopDone(s)) { return [0, 0]; }
        var r = s.os.policies.rdp;
        var on = !!r && r.fDenyTSConnections === 0 && !isHome(s);
        var uk = findKey(s.identity.users, v.k.wo.user.name);
        return [pts(on, 1), pts(!!uk && isMember(s, 'Remote Desktop Users', uk), 1)];
    }

    /* 4.4 Share: [share on path, Everyone absent, group Change/Full at share, effective network = Modify] */
    function check44(v) {
        var s = v.s, wo = v.k.wo;
        if (!desktopDone(s) || !s.network.shares) { return [0, 0, 0, 0]; }
        var sh = s.network.shares.filter(function (x) { return x.name.toLowerCase() === wo.share.name.toLowerCase(); })[0];
        var path = FS.canon(wo.share.path);
        if (!sh || !path || sh.path.toUpperCase() !== path.toUpperCase()) { return [0, 0, 0, 0]; }
        var noEveryone = !sh.perms.some(function (p) { return p.principal.toLowerCase() === 'everyone'; });
        var gk = findKey(s.identity.groups, wo.group);
        var groupShare = !!gk && OS_BUILTIN_GROUPS.indexOf(gk) < 0 && sh.perms.some(function (p) {
            return p.type === 'Allow' && p.principal.toLowerCase() === gk.toLowerCase() && (p.right === 'Change' || p.right === 'Full');
        });
        var eff = gk ? FS.memberNetworkMask(s, sh, gk) : 0;
        return [1, pts(noEveryone, 1), pts(groupShare, 1), pts(!!gk && eff === FS.RIGHTS.Modify, 1)];
    }

    /* 5.1 Data volumes: [D: fills target free space, D: NTFS + label, pool = two pool disks (2), resiliency (2), spaces volume] */
    function check51(v) {
        var s = v.s, wo = v.k.wo, k = v.k;
        if (!desktopDone(s)) { return [0, 0, 0, 0, 0]; }
        var os = s.disks.filter(function (d) { return d.role === 'os'; })[0];
        var dpart = null;
        s.disks.forEach(function (d) { d.partitions.forEach(function (p) { if (p.letter === 'D') { dpart = { d: d, p: p }; } }); });
        var dOnTarget = !!dpart && dpart.d === os && os.n === s.os.installDisk && freeMbOf(os) < 1024;
        var dFormat = !!dpart && dpart.d === os && dpart.p.fs === 'NTFS' && String(dpart.p.label || '').toLowerCase() === wo.disks.dLabel.toLowerCase();
        var pool = s.pool;
        var poolFiles = pool ? pool.disks.slice().sort() : [];
        var poolOk = !!pool && JSON.stringify(poolFiles) === JSON.stringify(['MER-POOL1.vhdx', 'MER-POOL2.vhdx']);
        /* Each part on its own (Nancy D4 A5): a wrong pool does not also cost the space's parts. */
        var resOk = !!pool && !!pool.space && pool.space.resiliency === k.resiliency;
        var sp = null;
        if (pool && pool.space) { s.disks.forEach(function (d) { if (d.n === pool.space.disk) { sp = d.partitions.filter(function (p) { return p.type === 'Primary'; })[0]; } }); }
        var spOk = !!sp && sp.letter === wo.disks.spacesLetter && sp.fs === 'NTFS' && String(sp.label || '').toLowerCase() === wo.disks.spacesLabel.toLowerCase();
        return [pts(dOnTarget, 1), pts(dFormat, 1), pts(poolOk, 2), pts(resOk, 2), pts(spOk, 1)];
    }
    /* Unallocated MB on a disk. */
    function freeMbOf(d) { return d.gb * 1024 - d.partitions.reduce(function (a, p) { return a + p.mb; }, 0); }

    /* 5.2 BitLocker C:: [XTS-AES 256, protection on and fully encrypted, TPM, recovery password, key file on F:] */
    function check52(v) {
        var s = v.s;
        if (!desktopDone(s) || !s.bitlocker) { return [0, 0, 0, 0, 0]; }
        var b = s.bitlocker.C;
        /* Each part on its own (Nancy D4 A5): only "protection on and fully encrypted" needs the
         * encryption to have completed; the method counts once encryption has started. */
        var started = b.status !== 'off';
        var rps = b.protectors.filter(function (p) { return p.type === 'RecoveryPassword'; });
        var digits = function (x) { return String(x).split('').filter(function (c) { return c >= '0' && c <= '9'; }).join(''); };
        var onUsb = rps.length > 0 && s.host.usb.F.files.some(function (f) {
            var t = digits(f.text);
            /* the full 48-digit password must appear; an empty needle never matches (QC hook) */
            return rps.some(function (p) { var pd = digits(p.password); return pd.length === 48 && t.indexOf(pd) >= 0; });
        });
        return [pts(started && b.method === 7, 1), pts(b.status === 'on', 1), pts(b.protectors.some(function (p) { return p.type === 'Tpm'; }), 1),
            pts(rps.length > 0, 1), pts(onUsb, 1)];
    }

    /* 5.3 Confidential NTFS: [inheritance disabled, Users/Auth Users no access, group RX]; gate: Administrators and SYSTEM keep Full. */
    function check53(v) {
        var s = v.s, wo = v.k.wo;
        if (!desktopDone(s) || !s.fs) { return [0, 0, 0]; }
        var path = FS.canon(wo.confidentialPath);
        var f = path && FS.folder(s, path);
        if (!f) { return [0, 0, 0]; }
        var full = FS.RIGHTS.FullControl;
        if (FS.effectiveMask(s, path, 'Administrators') !== full || FS.effectiveMask(s, path, 'SYSTEM') !== full) { return [0, 0, 0]; }
        var gk = findKey(s.identity.groups, wo.group);
        /* effective access, as the spec says: no allow reaches Users or Authenticated Users (or Everyone, which both carry) */
        var noUsers = FS.effectiveMask(s, path, 'Users') === 0 && FS.effectiveMask(s, path, 'Authenticated Users') === 0;
        return [pts(f.protect === true, 1), pts(noUsers, 1),
            pts(!!gk && OS_BUILTIN_GROUPS.indexOf(gk) < 0 && FS.memberMask(s, path, gk) === FS.RIGHTS.ReadAndExecute, 1)];
    }

    /* 5.4 Defender: [signatures updated after install, exclusions exactly the WO path] */
    function check54(v) {
        var s = v.s;
        if (!desktopDone(s) || !s.defender) { return [0, 0]; }
        var want = FS.canon(v.k.wo.defenderExclusion);
        var ex = s.defender.exclusions;
        return [pts(s.defender.sigUpdated === true, 1), pts(ex.length === 1 && !!want && ex[0].toLowerCase() === want.toLowerCase(), 1)];
    }

    /* ═══ D5 rows (6.1-8.2) ═══ */

    /* 6.1 Applications: [x64 MSI, SERVER= WO host, PORT= WO port, consumer app removed for the user, deprovisioned] */
    function check61(v) {
        var s = v.s, wo = v.k.wo;
        if (!desktopDone(s) || !s.apps) { return [0, 0, 0, 0, 0]; }
        var m = s.apps.msi.filter(function (x) { return x.product === 'LedgerSync'; })[0];
        var server = m && m.server !== null ? String(m.server).toLowerCase() : null;
        var hostOk = !!server && (server === wo.lob.fqdn.toLowerCase() || server === wo.lob.host.toLowerCase());
        var app = s.apps.appx.filter(function (a) { return a.name === wo.consumerApp; })[0];
        return [pts(!!m && m.arch === 'x64', 1), pts(hostOk, 1), pts(!!m && m.port === String(wo.lob.port), 1),
            pts(!!app && app.user === false, 1), pts(!!app && app.provisioned === false, 1)];
    }

    /* 6.2 Update policy: [feature deferral = WO with DeferFeatureUpdates=1, quality likewise, active hours manual = WO] */
    function check62(v) {
        var s = v.s, wo = v.k.wo;
        if (!desktopDone(s)) { return [0, 0, 0]; }
        var w = (s.os.policies && s.os.policies.wu) || {};
        var ah = s.os.updates.activeHours;
        return [pts(w.DeferFeatureUpdates === 1 && w.DeferFeatureUpdatesPeriodInDays === wo.updates.featureDeferralDays, 1),
            pts(w.DeferQualityUpdates === 1 && w.DeferQualityUpdatesPeriodInDays === wo.updates.qualityDeferralDays, 1),
            pts(ah.manual === true && ah.start === wo.updates.activeHours.start && ah.end === wo.updates.activeHours.end, 1)];
    }

    /* 6.3 Performance: [high-impact app 1 disabled, high-impact app 2 disabled, pagefile C: custom initial=max=WO, effective] */
    function check63(v) {
        var s = v.s, wo = v.k.wo;
        if (!desktopDone(s) || !s.apps) { return [0, 0, 0]; }
        var off = function (n) { var e = s.apps.startup.filter(function (x) { return x.name === n; })[0]; return !!e && e.enabled === false; };
        var pf = s.apps.pagefile;
        var pfOk = pf.automatic === false && pf.drive === 'C' && pf.initialMB === wo.performance.pagefileMB && pf.maxMB === wo.performance.pagefileMB;
        return [pts(off(wo.performance.highImpact[0]), 1), pts(off(wo.performance.highImpact[1]), 1), pts(pfOk, 1)];
    }

    /* Ledger index of the first entry at or after `from` whose kind is in `kinds`, or -1. */
    function firstAfter(ledger, from, kinds, ref) {
        for (var i = from; i < ledger.length; i++) { if (kinds.indexOf(ledger[i].k) >= 0 && (ref === undefined || ledger[i].ref === ref)) { return i; } }
        return -1;
    }
    /* Ledger index of the last entry after `from` whose kind is in `kinds`, or -1. */
    function lastAfter(ledger, from, kinds) {
        for (var i = ledger.length - 1; i >= from; i--) { if (kinds.indexOf(ledger[i].k) >= 0) { return i; } }
        return -1;
    }

    /* 7.1 Fault repair: [resolved 0/4/7/10, no-regression 5 (only when resolved >= 4)]; 0 without an OS handover. */
    function check71(v) {
        var f = v.f;
        if (!f || !f.fault || (f.sys && f.sys.reset)) { return [0, 0]; }
        var r = FAULTS.resolved(f, v.k);
        var nr = r >= 4 ? FAULTS.noRegression(v.s, f, f.fault.variant).points : 0;
        return [r, nr];
    }

    /* 8.1 Build record: [B1 first 8 hex of an RP protector id in the snapshot, B2 encryption method]. */
    function check81(v) {
        var s = v.s, ans = (v.f || s).answers || {};
        var b = s.bitlocker && s.bitlocker.C;
        if (!b) { return [0, 0]; }
        var b1 = String(ans.B1 && ans.B1.value || '').toUpperCase().split('{').join('').split('}').join('').split('-').join('').trim();
        var ids = b.protectors.filter(function (p) { return p.type === 'RecoveryPassword'; }).map(function (p) { return p.id.slice(0, 8).toUpperCase(); });
        var b1ok = b1.length === 8 && /^[0-9A-F]{8}$/.test(b1) && ids.indexOf(b1) >= 0;
        var started = b.status === 'on' || b.status === 'pending' || b.status === 'suspended';
        var b2ok = started && b.method !== null && ans.B2 && ans.B2.value === BLM[b.method];
        return [pts(b1ok, 1), pts(!!b2ok, 1)];
    }

    /* 8.2 Incident record: [I1 category (2), I2 evidence (2), I3 verified-by (1)]; gated on a handover with an OS. */
    function check82(v) {
        var f = v.f;
        if (!f || !f.fault) { return [0, 0, 0]; }
        var c = FAULTS.CATALOGUE[f.fault.variant], ans = f.answers || {}, L = f.ledger, from = f.fault.appliedAtLedger;
        var diag = firstAfter(L, from, c.diag) >= 0;
        var i1 = diag && ans.I1 && ans.I1.value === c.category;
        var ev = ans.I2 ? FAULTS.normEvidence(ans.I2.value) : '';
        /* the value must be one the student could have read: a route that displays it ran after the
         * handover (13.19 item 7); values shown only by unledgered windows keep the general gate */
        var routes = FAULTS.evidenceRoutes(v.k), own = Object.prototype.hasOwnProperty.call(routes, ev) ? routes[ev] : undefined;
        /* a route counts only if its output SHOWED this value (the entry's `seen`, stamped by the
         * engine): a query that matched nothing does not (Mallory R6 blocker 1) */
        var seen = own === null || (own !== undefined && L.some(function (e, i) {
            return i >= from && own.indexOf(e.k) >= 0 && typeof e.seen === 'string' && e.seen.split(',').indexOf(ev) >= 0;
        }));
        var i2 = diag && ev.length > 0 && FAULTS.evidenceSet(f, v.k).indexOf(ev) >= 0 && seen;
        /* I3: the fault must really be fixed (Resolved >= 4), and the verification must come after the
         * last fix action; V4's name test must name the LedgerSync server (Nancy D5 R3 #6). */
        var fixAt = lastAfter(L, from, c.fix);
        var opt = ans.I3 && ans.I3.value;
        var kinds = opt && Object.prototype.hasOwnProperty.call(c.verify, opt) ? c.verify[opt] : null;
        var ref = opt === 'name-resolution or port test' ? c.verifyRef : undefined;
        var i3 = fixAt >= 0 && !!kinds && FAULTS.resolved(f, v.k) >= 4 && firstAfter(L, fixAt + 1, kinds, ref) >= 0;
        return [pts(!!i1, 2), pts(i2, 2), pts(i3, 1)];
    }
    var CHECKS = [
        /* ── P1 Build and install (16) ── */
        { id: '1.1', phase: 'P1', objective: 1, points: 4, basis: 'snap', title: 'VM hardware',
          parts: [{ id: 'gen2', points: 1, actionParam: true }, { id: 'vtpm', points: 1, actionParam: true },
                  { id: 'cpu-ram', points: 1 }, { id: 'vhdx', points: 1 }],
          negative: 'Gen1 plus LabConfig bypass: 0 for Gen2 and vTPM; dynamic 4096 MB: cpu-ram 0',
          knockOn: ['5.2', '8.1'],
          check: function (v) {
              /* VM settings are scored from the VM itself, installed or not (13.7 item 5). */
              var vm = v.s.vm, wo = v.k.wo;
              if (!vm) { return [0, 0, 0, 0]; }
              return [pts(vm.generation === 2, 1), pts(vm.generation === 2 && vm.vtpm === true, 1),
                  pts(vm.memoryMB === wo.vm.startupMemoryMB && vm.dynamicMemory === false && vm.vcpu === wo.vm.vcpu, 1),
                  pts(vm.osVhdx.gb === wo.vm.vhdxGB, 1)];
          } },
        { id: '1.2', phase: 'P1', objective: 1, points: 4, basis: 'snap', title: 'Image and edition',
          parts: [{ id: 'build', points: 1, actionParam: true }, { id: 'edition', points: 3 }],
          negative: 'Pro on CORP-SEC: 1/4; Windows 10 ISO: 0/4',
          knockOn: ['3.3', '4.3', '5.2', '8.1'],
          check: function (v) {
              var os = v.s.os;
              if (!os) { return [0, 0]; }
              var win11 = os.os === 'Windows 11' && os.build === 26100;
              return [pts(win11, 1), pts(win11 && os.edition === v.k.edition, 3)];
          } },
        { id: '1.3', phase: 'P1', objective: 1, points: 3, basis: 'snap', title: 'System disk',
          parts: [{ id: 'target-explicit', points: 1 }, { id: 'c-size', points: 2 }],
          negative: 'Next on the whole unallocated disk: 0/3; install on the archive disk: 0/3 plus the archive penalty',
          knockOn: ['5.1', '4.4', '5.3'],
          check: function (v) {
              var s = v.s, os = s.os, t = targetDisk(s);
              if (!os || !t) { return [0, 0]; }
              /* "Explicit" means the partition Windows is ON was created by Setup New or diskpart
               * create partition primary, never Setup's automatic layout (Nancy D2). */
              var onTarget = os.installDisk === t.n;
              var sys = PC.partById(t, os.systemPartition);
              var explicit = !!(sys && sys.explicit === true);
              var c = PC.cSizeGb(s);
              /* "80 GB" read either way: 80 x 1024 MB or 80 x 1000 MB typed into Setup's MB field both
               * count, each within 1 GB (Nancy R4 #1: a decimal reading cost 2 points otherwise) */
              var want = v.k.wo.disks.cGB, decimal = want * 1000 / 1024;
              var sizeOk = c !== null && (Math.abs(c - want) <= 1 || Math.abs(c - decimal) <= 1);
              return [pts(onTarget && explicit, 1), pts(onTarget && sizeOk, 2)];
          } },
        { id: '1.4', phase: 'P1', objective: 1, points: 5, basis: 'snap', title: 'OOBE and activation',
          parts: [{ id: 'account', points: 1 }, { id: 'privacy', points: 2 }, { id: 'key', points: 1 }, { id: 'licensed', points: 1 }],
          negative: 'Optional diagnostics: privacy 1.67/2; retail COA decoy: key 0, licensed 0; wrong /skms host: licensed 0',
          knockOn: ['4.1'],
          check: function (v) {
              var s = v.s, os = s.os, k = v.k;
              if (!os || !os.oobe.done) { return [0, 0, 0, 0]; }
              var tech = k.technician.toLowerCase();
              var acct = Object.keys(s.identity.users).some(function (n) {
                  var u = s.identity.users[n];
                  return n.toLowerCase() === tech && u.oobe === true && u.enabled === true;
              });
              var n = 0;
              PC.PRIVACY_KEYS.forEach(function (key) { if (os.oobe.privacy[key] === k.wo.privacy[key]) { n++; } });
              var a = os.activation;
              var keyOk = k.channel === 'KMS'
                  ? (a.channel === 'KMS' && a.key === PC.GVLK[os.edition])
                  : (a.channel === 'MAK' && a.key === String(k.wo.mak).toUpperCase());
              return [pts(acct, 1), 2 * n / 6, pts(keyOk, 1), pts(a.status === 'Licensed', 1)];
          } },

        /* ── P2 Post-install (9) ── */
        { id: '2.1', phase: 'P2', objective: 1, points: 4, basis: 'snap', title: 'Post-install',
          parts: [{ id: 'hostname', points: 2 }, { id: 'timezone', points: 1 }, { id: 'cu', points: 1 }],
          negative: 'rename without restart: 1/2; time zone left Pacific; CU pending restart', knockOn: [],
          check: function (v) {
              var s = v.s, wo = v.k.wo;
              if (!desktopDone(s)) { return [0, 0, 0]; }
              var h = s.os.hostname, want = wo.hostname.toUpperCase();
              var host = h.effective === want ? 2 : h.pending === want ? 1 : 0;
              var cu = s.os.updates.history.some(function (x) { return x.kb === wo.updates.cumulativeKb && x.status === 'Installed'; });
              return [host, pts(s.os.timeZone === wo.timeZone, 1), pts(cu, 1)];
          } },
        { id: '2.2', phase: 'P2', objective: 5, points: 3, basis: 'snap', title: 'Power (AC)',
          parts: [{ id: 'plan', points: 1 }, { id: 'ac-display', points: 1 }, { id: 'ac-sleep', points: 1 }],
          negative: 'Balanced edited in place: plan 0', knockOn: [],
          check: function (v) {
              var s = v.s, wo = v.k.wo;
              if (!desktopDone(s)) { return [0, 0, 0]; }
              var a = activePlan(s);
              if (!a) { return [0, 0, 0]; }
              var named = !a.builtin && a.name.trim().toLowerCase() === wo.power.planName.toLowerCase();
              return [pts(named, 1), pts(a.ac.display === wo.power.acDisplayMin, 1), pts(a.ac.sleep === wo.power.acSleepMin, 1)];
          } },
        { id: '2.3', phase: 'P2', objective: 9, points: 2, basis: 'snap', title: 'Battery (DC)',
          parts: [{ id: 'dc-display', points: 1 }, { id: 'dc-sleep', points: 1 }],
          negative: 'DC values on an inactive plan: 0/2', knockOn: [],
          check: function (v) {
              var s = v.s, wo = v.k.wo;
              if (!desktopDone(s)) { return [0, 0]; }
              var a = activePlan(s);
              if (!a) { return [0, 0]; }
              return [pts(a.dc.display === wo.power.dcDisplayMin, 1), pts(a.dc.sleep === wo.power.dcSleepMin, 1)];
          } },

        /* ── P3 Identity (10) ── */
        { id: '3.1', phase: 'P3', objective: 6, points: 5, basis: 'snap', title: 'Local user and group',
          parts: [{ id: 'user', points: 1 }, { id: 'standard', points: 1 }, { id: 'password-flags', points: 1 },
                  { id: 'group', points: 1 }, { id: 'members', points: 1 }],
          negative: 'user in Administrators: standard 0; extra member', knockOn: [],
          check: function (v) {
              var s = v.s, wo = v.k.wo;
              if (!desktopDone(s)) { return [0, 0, 0, 0, 0]; }
              var uk = findKey(s.identity.users, wo.user.name);
              var user = uk && !s.identity.users[uk].builtin ? s.identity.users[uk] : null;
              var gk = findKey(s.identity.groups, wo.group);
              var want = [wo.user.name.toLowerCase(), wo.secondMember.name.toLowerCase()].sort();
              var have = gk ? s.identity.groups[gk].members.map(function (m) { return m.toLowerCase(); }).sort() : null;
              return [pts(!!user, 1),
                  pts(!!user && isMember(s, 'Users', uk) && !isMember(s, 'Administrators', uk), 1),
                  pts(!!user && user.neverExpires === true && user.mustChange === false, 1),
                  pts(!!gk && OS_BUILTIN_GROUPS.indexOf(gk) < 0, 1),
                  pts(!!have && OS_BUILTIN_GROUPS.indexOf(gk) < 0 && JSON.stringify(have) === JSON.stringify(want), 1)];
          } },
        { id: '3.2', phase: 'P3', objective: 7, points: 1, basis: 'snap', title: 'UAC',
          parts: [{ id: 'always-notify', points: 1 }], negative: 'Never notify', knockOn: [],
          check: function (v) {
              var s = v.s;
              if (!desktopDone(s)) { return [0]; }
              var u = s.identity.uac;
              return [pts(u.ConsentPromptBehaviorAdmin === 2 && u.PromptOnSecureDesktop === 1 && u.EnableLUA === 1, 1)];
          } },
        { id: '3.3', phase: 'P3', objective: 6, points: 4, basis: 'snap', title: 'Domain or workgroup',
          parts: [{ id: 'membership', points: 4 }],
          negative: 'workgroup MERIDIAN on a domain WO; join before DNS fails', knockOn: ['4.1', '1.2'],
          check: function (v) {
              var s = v.s, wo = v.k.wo;
              if (!desktopDone(s)) { return [0]; }
              var m = s.identity.membership;
              var want = wo.join.type === 'domain' ? { type: 'domain', name: 'meridian.local' } : { type: 'workgroup', name: wo.join.workgroup.toUpperCase() };
              var same = function (x) { return !!x && x.type === want.type && String(x.name).toLowerCase() === want.name.toLowerCase(); };
              return [same(m) && !m.pending ? 4 : same(m.pending) ? 1 : 0];
          } },

        /* ── P4 Network and sharing (15) ── */
        { id: '4.1', phase: 'P4', objective: 3, points: 5, basis: 'snap', title: 'IPv4 and DNS',
          parts: [{ id: 'ip', points: 1 }, { id: 'prefix', points: 1 }, { id: 'gateway', points: 1 },
                  { id: 'dns1', points: 1 }, { id: 'dns2', points: 1 }],
          negative: '255.255.255.0 on a /23 WO: prefix 0; DNS reversed: both DNS parts 0', knockOn: [], check: check41 },
        { id: '4.2', phase: 'P4', objective: 7, points: 4, basis: 'snap', title: 'Firewall and profile',
          parts: [{ id: 'rule', points: 1 }, { id: 'profiles', points: 1 }, { id: 'remote', points: 1 }, { id: 'category', points: 1 }],
          negative: 'rule on Any profile; remote Any; category left Public', knockOn: ['4.1', '3.3'], check: check42 },
        { id: '4.3', phase: 'P4', objective: 9, points: 2, basis: 'snap', title: 'Remote Desktop',
          parts: [{ id: 'enabled', points: 1 }, { id: 'rdu', points: 1 }],
          negative: 'enabled, user not added', knockOn: ['1.2', '3.1'], check: check43 },
        { id: '4.4', phase: 'P4', objective: 3, points: 4, basis: 'snap', title: 'Share',
          parts: [{ id: 'share', points: 1 }, { id: 'no-everyone', points: 1 }, { id: 'group-share', points: 1 },
                  { id: 'effective', points: 1 }],
          negative: 'Everyone Full Control left; group Read at share', knockOn: ['5.1', '1.3', '3.1'], check: check44 },

        /* ── P5 Storage and security (17) ── */
        { id: '5.1', phase: 'P5', objective: 2, points: 7, basis: 'snap', title: 'Data volumes',
          parts: [{ id: 'd-space', points: 1 }, { id: 'd-format', points: 1 }, { id: 'pool', points: 2 },
                  { id: 'resiliency', points: 2 }, { id: 'spaces-volume', points: 1 }],
          negative: 'D: on the archive disk; pool including the archive; mirror where the prose wants Simple',
          knockOn: ['1.3'], check: check51 },
        { id: '5.2', phase: 'P5', objective: 7, points: 5, basis: 'snap', title: 'BitLocker C:',
          parts: [{ id: 'method', points: 1 }, { id: 'protection', points: 1 }, { id: 'tpm', points: 1 },
                  { id: 'rp', points: 1 }, { id: 'usb-backup', points: 1 }],
          negative: 'wizard with no policy: method 0; suspended: protection 0', knockOn: ['1.1', '1.2'], check: check52 },
        { id: '5.3', phase: 'P5', objective: 7, points: 3, basis: 'snap', title: 'Confidential NTFS',
          parts: [{ id: 'inheritance', points: 1 }, { id: 'no-users', points: 1 }, { id: 'group-rx', points: 1 }],
          negative: 'inheritance converted but Users left with Read: 2/3', knockOn: ['5.1', '1.3', '3.1'], check: check53 },
        { id: '5.4', phase: 'P5', objective: 7, points: 2, basis: 'snap', title: 'Defender',
          parts: [{ id: 'signatures', points: 1 }, { id: 'exclusion', points: 1 }],
          negative: 'exclusion D:\\: part 2 = 0', knockOn: [], check: check54 },

        /* ── P6 Apps, updates, performance (11) ── */
        { id: '6.1', phase: 'P6', objective: 4, points: 5, basis: 'snap', title: 'Applications',
          parts: [{ id: 'msi-x64', points: 1 }, { id: 'server', points: 1 }, { id: 'port', points: 1 },
                  { id: 'appx-user', points: 1 }, { id: 'appx-provisioned', points: 1 }],
          negative: 'x86 MSI: part 1 = 0; property omitted; removed only for the user: 4/5', knockOn: [], check: check61 },
        { id: '6.2', phase: 'P6', objective: 8, points: 3, basis: 'snap', title: 'Update policy',
          parts: [{ id: 'feature', points: 1 }, { id: 'quality', points: 1 }, { id: 'active-hours', points: 1 }],
          negative: 'days with no enabling DWORD: part 0; quality 30', knockOn: [], check: check62 },
        { id: '6.3', phase: 'P6', objective: 5, points: 3, basis: 'snap', title: 'Performance tuning',
          parts: [{ id: 'startup-1', points: 1 }, { id: 'startup-2', points: 1 }, { id: 'pagefile', points: 1 }],
          negative: 'SecurityHealth disabled instead; pagefile set without restart: part 0', knockOn: [], check: check63 },

        /* ── P7 (15) and P8 (7) ── */
        { id: '7.1', phase: 'P7', objective: 8, points: 15, basis: 'final', title: 'Fault repair',
          parts: [{ id: 'resolved', points: 10 }, { id: 'no-regression', points: 5 }],
          negative: 'per variant (section 4)', knockOn: [], check: check71 },
        { id: '8.1', phase: 'P8', objective: 7, points: 2, basis: 'ans', title: 'Build record',
          parts: [{ id: 'b1', points: 1 }, { id: 'b2', points: 1 }],
          negative: 'B1 from a removed protector; blank', knockOn: ['5.2'], check: check81 },
        { id: '8.2', phase: 'P8', objective: 8, points: 5, basis: 'ans', title: 'Incident record',
          parts: [{ id: 'i1', points: 2 }, { id: 'i2', points: 2 }, { id: 'i3', points: 1 }],
          negative: 'I3 restart with no restart after the fix', knockOn: ['7.1'], check: check82 }
    ];

    /* Regression penalties (3.4): default state the student broke, deducted within the phase. */
    var PENALTIES = [
        { id: 'P1-archive', phase: 'P1', points: 2, title: 'Archive volume deleted, formatted or changed',
          applies: function (v) { return !PC.archiveIntact(v.s, v.k.wo.disks.archiveManifest); } },
        { id: 'P1-secureboot', phase: 'P1', points: 1, title: 'Secure Boot disabled on a Generation 2 VM',
          applies: function (v) { return !!(v.s.vm && v.s.vm.generation === 2 && v.s.vm.secureBoot && v.s.vm.secureBoot.on === false); } },
        { id: 'P3-administrator', phase: 'P3', points: 1, title: 'Built-in Administrator enabled',
          applies: function (v) { return desktopDone(v.s) && v.s.identity.users.Administrator.enabled === true; } },
        { id: 'P3-guest', phase: 'P3', points: 1, title: 'Guest enabled',
          applies: function (v) { return desktopDone(v.s) && v.s.identity.users.Guest.enabled === true; } },
        /* Local user accounts only: the WO user is graded by 3.1, the OOBE account is expected, and
         * the domain-join default groups (MERIDIAN\Domain Admins) are not accounts (13.5 item 2). */
        { id: 'P3-extra-admin', phase: 'P3', points: 1, title: 'An additional local administrator',
          applies: function (v) {
              var s = v.s;
              if (!desktopDone(s)) { return false; }
              var wouser = String(v.k.wo.user.name).toLowerCase();
              return s.identity.groups.Administrators.members.some(function (m) {
                  if (m.indexOf('\\') >= 0) { return false; }
                  var k = findKey(s.identity.users, m);
                  if (!k) { return false; }
                  var u = s.identity.users[k];
                  return !u.builtin && !u.oobe && k.toLowerCase() !== wouser;
              });
          } },
        { id: 'P4-firewall-off', phase: 'P4', points: 1, title: 'A firewall profile turned off',
          applies: function (v) { var f = v.s.network && v.s.network.firewall; return !!f && desktopDone(v.s) && Object.keys(f.profiles).some(function (k) { return f.profiles[k] === false; }); } },
        { id: 'P4-nla-off', phase: 'P4', points: 1, title: 'Network Level Authentication disabled',
          applies: function (v) { var r = v.s.os && v.s.os.policies && v.s.os.policies.rdp; return desktopDone(v.s) && !!r && r.UserAuthentication === 0; } },
        { id: 'P4-smb1', phase: 'P4', points: 1, title: 'SMB1 enabled',
          applies: function (v) { return desktopDone(v.s) && !!v.s.network && v.s.network.smb1 === true; } },
        { id: 'P4-everyone-full', phase: 'P4', points: 1, title: 'Another share grants Everyone Full Control',
          applies: function (v) {
              var sh = desktopDone(v.s) && v.s.network.shares;
              if (!sh) { return false; }
              var wo = v.k.wo.share.name.toLowerCase();
              return sh.some(function (x) { return x.name.toLowerCase() !== wo && x.perms.some(function (p) { return p.principal.toLowerCase() === 'everyone' && p.right === 'Full' && p.type === 'Allow'; }); });
          } },
        { id: 'P5-realtime-off', phase: 'P5', points: 1, title: 'Defender real-time protection off',
          applies: function (v) { return desktopDone(v.s) && !!v.s.defender && v.s.defender.realtime === false; } },
        { id: 'P6-keep-list', phase: 'P6', points: 1, title: 'A keep-list app or startup item removed or disabled',
          applies: function (v) {
              var a = desktopDone(v.s) && v.s.apps;
              if (!a) { return false; }
              return a.appx.some(function (x) { return x.keep && (!x.user || !x.provisioned); }) ||
                  a.startup.some(function (x) { return x.keep && x.enabled === false; });
          } }
    ];

    LIM.deepFreeze(CHECKS);
    LIM.deepFreeze(PENALTIES);

    module.exports = { CHECKS: CHECKS, PENALTIES: PENALTIES };
})();
