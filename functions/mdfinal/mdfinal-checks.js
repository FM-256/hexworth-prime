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

    /* Everything P2+ needs exists only once Windows reached the desktop. */
    function desktopDone(s) { return !!(s.os && s.os.oobe && s.os.oobe.done); }

    /* The disk the student's own OS VHDX became, or null before a VM exists. */
    function targetDisk(s) { return PC.diskByRole(s, 'os'); }

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
              return [pts(onTarget && explicit, 1), pts(onTarget && c !== null && Math.abs(c - v.k.wo.disks.cGB) <= 1, 2)];
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
          negative: '255.255.255.0 on a /23 WO: prefix 0; DNS reversed: both DNS parts 0', knockOn: [], check: null },
        { id: '4.2', phase: 'P4', objective: 7, points: 4, basis: 'snap', title: 'Firewall and profile',
          parts: [{ id: 'rule', points: 1 }, { id: 'profiles', points: 1 }, { id: 'remote', points: 1 }, { id: 'category', points: 1 }],
          negative: 'rule on Any profile; remote Any; category left Public', knockOn: [], check: null },
        { id: '4.3', phase: 'P4', objective: 9, points: 2, basis: 'snap', title: 'Remote Desktop',
          parts: [{ id: 'enabled', points: 1 }, { id: 'rdu', points: 1 }],
          negative: 'enabled, user not added', knockOn: ['1.2', '3.1'], check: null },
        { id: '4.4', phase: 'P4', objective: 3, points: 4, basis: 'snap', title: 'Share',
          parts: [{ id: 'share', points: 1 }, { id: 'no-everyone', points: 1 }, { id: 'group-share', points: 1 },
                  { id: 'effective', points: 1 }],
          negative: 'Everyone Full Control left; group Read at share', knockOn: ['5.1', '1.3', '3.1'], check: null },

        /* ── P5 Storage and security (17) ── */
        { id: '5.1', phase: 'P5', objective: 2, points: 7, basis: 'snap', title: 'Data volumes',
          parts: [{ id: 'd-space', points: 1 }, { id: 'd-format', points: 1 }, { id: 'pool', points: 2 },
                  { id: 'resiliency', points: 2 }, { id: 'spaces-volume', points: 1 }],
          negative: 'D: on the archive disk; pool including the archive; mirror where the prose wants Simple',
          knockOn: ['1.3'], check: null },
        { id: '5.2', phase: 'P5', objective: 7, points: 5, basis: 'snap', title: 'BitLocker C:',
          parts: [{ id: 'method', points: 1 }, { id: 'protection', points: 1 }, { id: 'tpm', points: 1 },
                  { id: 'rp', points: 1 }, { id: 'usb-backup', points: 1 }],
          negative: 'wizard with no policy: method 0; suspended: protection 0', knockOn: ['1.1', '1.2'], check: null },
        { id: '5.3', phase: 'P5', objective: 7, points: 3, basis: 'snap', title: 'Confidential NTFS',
          parts: [{ id: 'inheritance', points: 1 }, { id: 'no-users', points: 1 }, { id: 'group-rx', points: 1 }],
          negative: 'inheritance converted but Users left with Read: 2/3', knockOn: ['5.1', '1.3', '3.1'], check: null },
        { id: '5.4', phase: 'P5', objective: 7, points: 2, basis: 'snap', title: 'Defender',
          parts: [{ id: 'signatures', points: 1 }, { id: 'exclusion', points: 1 }],
          negative: 'exclusion D:\\: part 2 = 0', knockOn: [], check: null },

        /* ── P6 Apps, updates, performance (11) ── */
        { id: '6.1', phase: 'P6', objective: 4, points: 5, basis: 'snap', title: 'Applications',
          parts: [{ id: 'msi-x64', points: 1 }, { id: 'server', points: 1 }, { id: 'port', points: 1 },
                  { id: 'appx-user', points: 1 }, { id: 'appx-provisioned', points: 1 }],
          negative: 'x86 MSI: part 1 = 0; property omitted; removed only for the user: 4/5', knockOn: [], check: null },
        { id: '6.2', phase: 'P6', objective: 8, points: 3, basis: 'snap', title: 'Update policy',
          parts: [{ id: 'feature', points: 1 }, { id: 'quality', points: 1 }, { id: 'active-hours', points: 1 }],
          negative: 'days with no enabling DWORD: part 0; quality 30', knockOn: [], check: null },
        { id: '6.3', phase: 'P6', objective: 5, points: 3, basis: 'snap', title: 'Performance tuning',
          parts: [{ id: 'startup-1', points: 1 }, { id: 'startup-2', points: 1 }, { id: 'pagefile', points: 1 }],
          negative: 'SecurityHealth disabled instead; pagefile set without restart: part 0', knockOn: [], check: null },

        /* ── P7 (15) and P8 (7) ── */
        { id: '7.1', phase: 'P7', objective: 8, points: 15, basis: 'final', title: 'Fault repair',
          parts: [{ id: 'resolved', points: 10 }, { id: 'no-regression', points: 5 }],
          negative: 'per variant (section 4)', knockOn: [], check: null },
        { id: '8.1', phase: 'P8', objective: 7, points: 2, basis: 'ans', title: 'Build record',
          parts: [{ id: 'b1', points: 1 }, { id: 'b2', points: 1 }],
          negative: 'B1 from a removed protector; blank', knockOn: ['5.2'], check: null },
        { id: '8.2', phase: 'P8', objective: 8, points: 5, basis: 'ans', title: 'Incident record',
          parts: [{ id: 'i1', points: 2 }, { id: 'i2', points: 2 }, { id: 'i3', points: 1 }],
          negative: 'I3 restart with no restart after the fix', knockOn: ['7.1'], check: null }
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
          } }
    ];

    LIM.deepFreeze(CHECKS);
    LIM.deepFreeze(PENALTIES);

    module.exports = { CHECKS: CHECKS, PENALTIES: PENALTIES };
})();
