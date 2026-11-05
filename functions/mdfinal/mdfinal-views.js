/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-views.js — what each exam window shows. The renderers behind mdfinalWindow (spec 1.1,
 * 1.2: "Read only; scanned"), and the only code that turns server state into window data.
 *
 * A WHITELIST, FIELD BY FIELD. Every value a view emits is named here and copied out of one state
 * path; nothing spreads a state object. State carries what no window may show: `fault:true` and
 * `hotfix:true` markers on services, drivers, tasks, programs, updates and startup items; the
 * keep-list flags (`keep`, which ARE the P6 penalty answer); `restorePoints[].data` (a JSON capture
 * that includes those markers); `state.fault` itself; the ledger. A blacklist would fail open the
 * day a module adds a field; this fails closed, because a new field is absent until named here.
 *
 * READ ONLY, BY CONSTRUCTION. Several domain helpers initialise lazily (bitlocker vol(), net rdp(),
 * sys()). Each render therefore works on a JSON clone, so a view can never write the stored lab.
 *
 * DIAGNOSTIC CONTENT IS NOT IN THE VIEWS. Task Manager's process list, Event Viewer's events, Update
 * history and the hosts file reach the student only through their actions (taskmgr/view,
 * eventvwr/query, settings/update-history, notepad/hosts-open), because those actions write the
 * diagnostic ledger events that gate I1/I2 (13.5 item 5). A view that showed them would let an
 * honest student diagnose without credit.
 *
 * STUDENT TEXT IS TAGGED. Every string a student can have typed is emitted as { $s: "..." } (R5),
 * so the disclosure scanner skips that value for patterns while still checking keys and shapes. A
 * value is tagged by its provenance (a non-builtin user, a created rule), never by its field name.
 * The page unwraps $s nodes. Server-authored strings are plain.
 *
 * Pure: no clock, no Firestore.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var GUI = require('./mdfinal-gui.js');
    var PC = require('./mdfinal-pc.js');
    var OS = require('./mdfinal-os.js');
    var NET = require('./mdfinal-net.js');
    var FS = require('./mdfinal-fs.js');
    var BL = require('./mdfinal-bitlocker.js');
    var STO = require('./mdfinal-storage.js');
    var REG = require('./mdfinal-registry.js');
    var APPS = require('./mdfinal-apps.js');
    var SYS = require('./mdfinal-sys.js');
    var WINRE = require('./mdfinal-winre.js');
    var ANS = require('./mdfinal-answers.js');
    var FAULTS = require('./mdfinal-faults.js');
    var LIM = require('./mdfinal-limits.js');

    var own = function (o, k) { return !!o && Object.prototype.hasOwnProperty.call(o, k); };

    /* Longest student string a view carries (a file on TECH-USB is the longest input there is). */
    var S_MAX = LIM.LIMITS.objects.fileBytes;

    /* Student-authored text. Always a capped string, so a $s node can never carry an object. */
    function S(v) {
        if (v === null || v === undefined) { return null; }
        return { $s: String(v).slice(0, S_MAX) };
    }

    /* Each ISO on the host with its OS, version and edition list (spec 2.2: the host panel lists
     * each ISO with its edition list), so the right image is chosen before Setup, not by trial. */
    function isoEditions(s) {
        return s.host.isoLibrary.filter(function (f) { return Object.prototype.hasOwnProperty.call(PC.ISO_LIBRARY, f); }).map(function (f) {
            var x = PC.ISO_LIBRARY[f];
            return { file: f, os: x.os, version: x.version, build: x.build, editions: x.editions.slice() };
        });
    }

    /* Read-only parameters some windows take (the address bar). Anything else is refused. */
    var VIEW_PARAMS = LIM.deepFreeze({ regedit: ['key'], explorer: ['path'] });

    function prefixToMask(p) {
        var n = Number(p);
        if (!(n >= 0 && n <= 32)) { return null; }
        var bits = n === 0 ? 0 : (0xFFFFFFFF << (32 - n)) >>> 0;
        return [24, 16, 8, 0].map(function (sh) { return (bits >>> sh) & 255; }).join('.');
    }

    /* ── shared pieces ───────────────────────────────────────────────────────────────────────── */

    function hostname(s) {
        var h = s.os && s.os.hostname;
        if (!h) { return { effective: null, pending: null }; }
        var dflt = PC.defaultHostname(s);
        var tag = function (v) { return v === null || v === undefined ? null : (v === dflt ? v : S(v)); };
        return { effective: tag(h.effective), pending: tag(h.pending) };
    }

    /* Settings' "Restart required" banner: anything that takes effect at the next restart. */
    function restartRequired(s) {
        if (!s.os) { return false; }
        var pf = s.apps && s.apps.pagefile;
        var bl = s.bitlocker && s.bitlocker.C;
        return !!(s.os.hostname.pending
            || (s.identity && s.identity.membership.pending)
            || (s.identity && s.identity.uac.pendingEnableLUA !== null && s.identity.uac.pendingEnableLUA !== undefined)
            || (pf && pf.pending)
            || (bl && bl.status === 'pending')
            || (s.os.updates && s.os.updates.pendingRestart.length)
            || Object.keys(s.os.pending || {}).length);
    }

    function partition(p) {
        return { id: p.id, type: p.type, sizeMB: p.mb, letter: p.letter || null, fs: p.fs || null,
                 label: p.label ? S(p.label) : null };
    }

    /* Disks as the VM sees them (Setup, Disk Management). */
    function disks(s) {
        return (s.disks || []).map(function (d) {
            return { n: d.n, sizeGB: d.gb, style: d.style || null, kind: d.virtual === 'space' ? 'Storage Space' : 'Virtual Disk',
                     inPool: !!d.inPool, partitions: d.inPool ? [] : d.partitions.map(partition),
                     unallocatedMB: d.inPool ? 0 : PC.freeMb(d) };
        });
    }

    function isBuiltinUser(s, name) { var u = s.identity && s.identity.users[name]; return !!(u && u.builtin); }
    /* A CLOSED set: the built-in groups and identities, and the domain principals the join adds.
     * Anything else (including a typed MERIDIAN\\<name>) is student text (Nancy D6 #6). */
    var SYSTEM_PRINCIPALS = ['SYSTEM', 'Authenticated Users', 'Everyone', 'CREATOR OWNER'];
    function isSystemPrincipal(name) {
        var n = String(name);
        if (OS.BUILTIN_GROUPS.indexOf(n) >= 0 || SYSTEM_PRINCIPALS.indexOf(n) >= 0) { return true; }
        return OS.DOMAIN_PRINCIPALS.some(function (d) { return n === 'MERIDIAN\\' + d; });
    }
    /* A principal name: plain when Windows or the domain authored it, tagged when the student did. */
    function principal(s, name) { return isBuiltinUser(s, name) || isSystemPrincipal(name) ? String(name) : S(name); }

    function ticket(s) {
        if (!s.fault) { return null; }
        var f = FAULTS.CATALOGUE[s.fault.variant];
        return f ? { ticketId: s.fault.ticketId, text: f.ticket } : null;
    }

    /* ── per-window renderers ────────────────────────────────────────────────────────────────── */

    var R = {};

    /* Hyper-V Manager on the host: ISOs, switches, the VM, and the Lab Files panel. */
    R.hyperv = function (s) {
        var vm = s.vm;
        return {
            isoLibrary: s.host.isoLibrary.slice(),
            isoEditions: isoEditions(s),
            switches: s.host.switches.map(function (x) { return { name: x.name, type: x.type }; }),
            vm: vm ? { name: S(vm.name), generation: vm.generation, memoryMB: vm.memoryMB, dynamicMemory: vm.dynamicMemory,
                       vcpu: vm.vcpu, state: vm.power === 'on' ? 'Running' : 'Off', osVhdx: { file: S(vm.osVhdx.file), sizeGB: vm.osVhdx.gb },
                       dvd: vm.dvd || null } : null,
            /* The host's Lab Files panel: TECH-USB, readable from the host (2.2, declared). */
            labFiles: s.host.usb.F.files.map(function (f) { return f.student ? { name: S(f.name), text: S(f.text) } : { name: f.name, text: f.text }; })
        };
    };

    /* VM Settings: hardware, firmware, security and the SCSI disks the fabric attached. */
    R['vm-settings'] = function (s) {
        var vm = s.vm;
        if (!vm) { return { vm: null }; }
        return {
            vm: { name: S(vm.name), generation: vm.generation, memoryMB: vm.memoryMB, dynamicMemory: vm.dynamicMemory, vcpu: vm.vcpu,
                  /* Generation 1 firmware has no Secure Boot and no TPM */
                  secureBoot: vm.secureBoot ? { on: !!vm.secureBoot.on, template: vm.secureBoot.template || null } : null, vtpm: !!vm.vtpm, dvd: vm.dvd || null,
                  bootFirst: vm.bootFirst, running: vm.power === 'on' },
            scsi: (s.disks || []).filter(function (d) { return !d.virtual; }).map(function (d) {
                return { location: d.n, file: d.role === 'os' ? S(d.file) : d.file, sizeGB: d.gb };
            }),
            isoLibrary: s.host.isoLibrary.slice(),
            isoEditions: isoEditions(s),
            secureBootTemplates: PC.SECURE_BOOT_TEMPLATES.slice()
        };
    };

    /* Windows Setup: the current wizard screen, with the edition list (real order) and the disks. */
    R.setup = function (s) {
        var st = s.setup;
        var out = { screen: st.screen };
        if (st.screen === 'edition') {
            var iso = own(PC.ISO_LIBRARY, st.iso) ? PC.ISO_LIBRARY[st.iso] : null;
            out.editions = iso ? iso.editions.map(function (e) { return 'Windows ' + iso.os.split(' ')[1] + ' ' + e; }) : [];
            out.editionValues = iso ? iso.editions.slice() : [];
        }
        if (st.screen === 'cant-run') { out.message = "This PC can't run Windows 11"; }
        if (st.screen === 'disk') { out.disks = disks(s); }
        return out;
    };

    /* Setup's Shift+F10 prompt (commands go through mdfinalCommand). */
    R['setup-cmd'] = function () { return { console: 'setup-cmd' }; };
    /* The OOBE Shift+F10 prompt (commands go through mdfinalCommand). */
    R['oobe-cmd'] = function () { return { console: 'oobe-cmd' }; };

    /* OOBE: the current screen, and the privacy toggles as they stand. */
    R.oobe = function (s) {
        var o = s.os.oobe;
        var out = { screen: o.screen };
        if (o.screen === 'privacy') {
            var p = o.privacy || {};
            out.privacy = { location: p.location !== false, findMyDevice: p.findMyDevice !== false,
                            diagnosticData: p.diagnosticData || 'Optional', inking: p.inking !== false,
                            tailored: p.tailored !== false, advertisingId: p.advertisingId !== false };
        }
        return out;
    };

    /* The desktop: name, Safe Mode watermark, Explorer health, restart banner, open ticket. */
    R.desktop = function (s) {
        var sy = s.sys || {};
        return {
            hostname: hostname(s),
            safeMode: !!sy.safeMode,
            explorer: sy.explorer === 'crashing' ? 'crashing' : 'ok',
            restartRequired: restartRequired(s),
            edition: s.os.edition,
            ticket: ticket(s)
        };
    };

    /* Settings > System > Activation: edition, status, channel, last five key characters. */
    R.activation = function (s) {
        var a = s.os.activation || {};
        return { edition: s.os.edition, status: a.status || 'Unlicensed', channel: a.channel || null,
                 partialKey: a.key ? String(a.key).slice(-5) : null };
    };

    /* Settings: system, time, update, network, power, Remote Desktop, apps and startup pages. */
    R.settings = function (s) {
        var plan = OS.activePlan(s);
        var tz = OS.TIME_ZONES.filter(function (z) { return z.id === s.os.timeZone; })[0];
        var u = s.os.updates;
        var ap = s.os && s.os.oobe && s.os.oobe.done ? APPS.apps(s) : null;
        var rdp = NET.rdp(s);
        return {
            system: { deviceName: hostname(s), edition: s.os.edition, version: s.os.version,
                      build: s.os.build + '.' + s.os.revision, restartRequired: restartRequired(s) },
            time: { timeZone: s.os.timeZone, display: tz ? tz.display : s.os.timeZone, zones: OS.TIME_ZONES.map(function (z) { return { id: z.id, display: z.display }; }) },
            update: { checked: !!u.checked, pendingRestart: u.pendingRestart.map(function (x) { return x.title; }),
                      activeHours: { manual: !!u.activeHours.manual, start: u.activeHours.start, end: u.activeHours.end } },
            network: { category: NET.category(s) },
            power: { screenOffMin: plan ? plan.ac.display : null, sleepMin: plan ? plan.ac.sleep : null },
            remoteDesktop: { enabled: rdp.fDenyTSConnections === 0, nla: rdp.UserAuthentication === 1 },
            apps: installedApps(s),
            startup: ap ? ap.startup.map(function (x) { return { name: x.name, impact: x.impact, enabled: !!x.enabled }; }) : []
        };
    };

    /* Settings > Apps > Installed apps, and the Apps window: Store apps, MSI products, programs. */
    function installedApps(s) {
        var ap = s.os && s.os.oobe && s.os.oobe.done ? APPS.apps(s) : null;
        if (!ap) { return []; }
        var rows = ap.appx.filter(function (a) { return a.user; }).map(function (a) { return { name: a.display, package: a.name, version: a.version, kind: 'Store' }; });
        ap.msi.forEach(function (m) { rows.push({ name: m.product, version: m.version, kind: 'MSI' }); });
        ((s.sys && s.sys.programs) || []).forEach(function (p) { rows.push({ name: p.name, version: null, kind: 'Program' }); });
        return rows;
    }

    /* Control Panel > Power Options: plans with their plugged-in values (a VM has no battery). */
    R.power = function (s) {
        var pw = s.os.power;
        return { plans: pw.plans.map(function (p) {
            return { guid: p.guid, name: p.builtin ? p.name : S(p.name), builtin: !!p.builtin, active: p.guid === pw.active,
                     displayOffMin: p.ac.display, sleepMin: p.ac.sleep };
        }) };
    };

    /* Local Users and Groups. */
    R.lusrmgr = function (s) {
        var id = s.identity;
        var users = Object.keys(id.users).map(function (n) {
            var u = id.users[n];
            return { name: u.builtin ? n : S(n), fullName: u.fullName ? S(u.fullName) : null, enabled: !!u.enabled, builtin: !!u.builtin,
                     mustChange: !!u.mustChange, cannotChange: !!u.cannotChange, neverExpires: !!u.neverExpires };
        });
        var groups = Object.keys(id.groups).map(function (n) {
            var g = id.groups[n];
            var b = OS.BUILTIN_GROUPS.indexOf(n) >= 0;
            return { name: b ? n : S(n), builtin: b, description: g.description ? S(g.description) : null,
                     members: g.members.map(function (m) { return principal(s, m); }) };
        });
        return { users: users, groups: groups };
    };

    /* User Account Control settings: the slider level that matches the values, or null. */
    /* The slider's four positions, top (always notify) to bottom (never notify). */
    var UAC_LABELS = LIM.deepFreeze([{ level: 4, label: 'Always notify' }, { level: 3, label: 'Notify me only when apps try to make changes (default)' },
        { level: 2, label: 'Notify me only when apps try to make changes (do not dim my desktop)' }, { level: 1, label: 'Never notify' }]);
    R.uac = function (s) {
        var u = s.identity.uac;
        var level = null;
        Object.keys(OS.UAC_LEVELS).forEach(function (l) {
            var x = OS.UAC_LEVELS[l];
            if (x.ConsentPromptBehaviorAdmin === u.ConsentPromptBehaviorAdmin && x.PromptOnSecureDesktop === u.PromptOnSecureDesktop) { level = Number(l); }
        });
        return { level: level, enabled: u.EnableLUA === 1, levels: UAC_LABELS.slice() };
    };

    /* System Properties: name, membership, Remote, virtual memory, System Protection. */
    R.sysprops = function (s) {
        var m = s.identity.membership;
        var tagName = function (x) { return !x ? null : (x.type === 'domain' ? x.name : S(x.name)); };
        var rdp = NET.rdp(s);
        var pf = s.apps ? s.apps.pagefile : null;
        var pfView = function (x) { return x ? { automatic: !!x.automatic, drive: x.drive || null, initialMB: x.initialMB, maxMB: x.maxMB } : null; };
        var sy = s.sys || { protection: { C: false }, restorePoints: [] };
        return {
            computerName: hostname(s),
            membership: { type: m.type, name: tagName(m), pending: m.pending ? { type: m.pending.type, name: tagName(m.pending) } : null },
            remote: { enabled: rdp.fDenyTSConnections === 0, nla: rdp.UserAuthentication === 1,
                      users: (s.identity.groups['Remote Desktop Users'] ? s.identity.groups['Remote Desktop Users'].members : []).map(function (x) { return principal(s, x); }) },
            virtualMemory: pf ? Object.assign(pfView(pf), { pending: pfView(pf.pending) }) : null,
            protection: { C: !!sy.protection.C },
            /* name and sequence only: `data` is a capture that carries the fault markers */
            restorePoints: sy.restorePoints.map(function (p) { return { seq: p.seq, name: S(p.name) }; })
        };
    };

    var HIVES = ['HKEY_LOCAL_MACHINE', 'HKEY_CURRENT_USER'];

    /* Registry Editor at one key (the address bar), or the hive list. */
    R.regedit = function (s, p) {
        if (!p.key) { return { hives: HIVES.slice(), key: null, values: [] }; }
        var r = REG.read(s, p.key);
        if (!r) { return { hives: HIVES.slice(), key: S(p.key), values: [], missing: true }; }
        var scratch = Object.keys(s.regScratch || {}).map(function (k) { return s.regScratch[k]; })
            .filter(function (v) { return v.key === r.key; }).map(function (v) { return String(v.name).toLowerCase(); });
        return {
            /* the address bar is the student's own input (canonicalised), so it is student text */
            hives: HIVES.slice(), key: S(r.key),
            values: r.values.map(function (v) {
                var mine = scratch.indexOf(String(v.name).toLowerCase()) >= 0;
                return { name: mine ? S(v.name) : v.name, type: v.type, data: mine ? S(v.data) : v.data };
            })
        };
    };

    /* Network Connections: the Ethernet adapter's IPv4 properties. */
    R.ncpa = function (s) {
        var a = s.network.adapters.Ethernet;
        return { adapters: [{ name: 'Ethernet', status: 'Connected', dhcp: !!a.dhcp, ip: a.dhcp ? null : a.ip,
                              mask: a.dhcp ? null : prefixToMask(a.prefix), gateway: a.dhcp ? null : a.gateway,
                              dnsAuto: !!a.dnsAuto, dns: a.dnsAuto ? [] : (a.dns || []).slice() }] };
    };

    /* Windows Defender Firewall with Advanced Security: profiles and rules. */
    R.wf = function (s) {
        var fw = NET.net(s).firewall;
        return {
            category: NET.category(s),
            profiles: { Domain: !!fw.profiles.Domain, Private: !!fw.profiles.Private, Public: !!fw.profiles.Public },
            rules: fw.rules.map(function (r) {
                return { name: S(r.name), direction: r.direction, action: r.action, protocol: r.protocol, localPort: r.localPort.slice(),
                         profiles: r.profiles.slice(), remoteAddress: r.remote.slice(), enabled: !!r.enabled };
            })
        };
    };

    /* File Explorer: the drives, or one folder with its subfolders, sharing and security. */
    R.explorer = function (s, p) {
        var vols = [];
        (s.disks || []).forEach(function (d) {
            if (d.inPool) { return; }
            d.partitions.forEach(function (x) { if (x.letter) { vols.push({ letter: x.letter, label: x.label ? S(x.label) : null, fs: x.fs || null, sizeMB: x.mb }); } });
        });
        vols.sort(function (a, b) { return a.letter < b.letter ? -1 : 1; });
        var out = { drives: vols, path: null };
        if (!p.path) { return out; }
        var c = FS.canon(p.path);
        out.path = S(p.path);
        if (!c) { out.missing = true; return out; }
        /* The fabric volumes show their files; NTFS folders show children, sharing and security. */
        if (c === 'F:\\') { out.files = s.host.usb.F.files.map(function (f) { return { name: f.student ? S(f.name) : f.name, bytes: Buffer.byteLength(f.text) }; }); return out; }
        /* the fabric's C:\\LabFiles on the installed image: the LedgerSync packages (row 6.1) */
        if (c.toUpperCase().replace(/\\$/, '') === 'C:\\LABFILES' && s.os && s.os.installed) { out.files = APPS.labFiles(); return out; }
        var arch = (s.disks || []).filter(function (d) { return d.role === 'archive'; })[0];
        var ap = arch && arch.partitions.filter(function (x) { return x.files && x.letter && (x.letter + ':\\') === c; })[0];
        if (ap) { out.files = ap.files.map(function (f) { return { name: f.name, bytes: f.bytes }; }); return out; }
        var f = FS.folder(s, c);
        if (!f) { out.missing = true; return out; }
        var vol = s.fs.volumes[c[0]];
        out.folders = Object.keys(vol.folders).map(function (k) { return vol.folders[k]; })
            .filter(function (x) { return FS.parentOf(FS.canon(x.path)) === c; }).map(function (x) { return S(x.path); });
        var share = (s.network.shares || []).filter(function (x) { return FS.canon(x.path) === c; })[0];
        out.share = share ? { name: S(share.name), permissions: share.perms.map(function (q) { return { principal: principal(s, q.principal), right: q.right, type: q.type }; }) } : null;
        out.inheritance = !f.protect;
        out.acl = (FS.effectiveAcl(s, c) || []).map(function (a) {
            return { principal: principal(s, a.principal), rights: FS.rightsName(a.mask), type: a.type, inherited: !!a.inherited };
        });
        return out;
    };

    /* Windows Features: SMB 1.0/CIFS File Sharing Support. */
    R.features = function (s) { return { smb1: !!NET.net(s).smb1 }; };

    /* Disk Management: every disk and its partitions. */
    R.diskmgmt = function (s) { return { disks: disks(s) }; };

    /* Storage Spaces: the pool, its space, and the disks that can join a pool. */
    R.storagespaces = function (s) {
        var pool = s.pool;
        var num = function (file) { var d = (s.disks || []).filter(function (x) { return x.file === file; })[0]; return d ? d.n : null; };
        return {
            pool: pool ? { name: S(pool.name), disks: pool.disks.map(num),
                           space: pool.space ? { name: S(pool.space.name), resiliency: pool.space.resiliency, sizeGB: pool.space.gb } : null } : null,
            eligible: (s.disks || []).filter(function (d) { return STO.canPool(s, d); }).map(function (d) { return { n: d.n, sizeGB: d.gb }; })
        };
    };

    /* BitLocker Drive Encryption control panel for C:. */
    R.bitlocker = function (s) {
        var v = BL.vol(s);
        var on = v.status === 'on';
        return {
            C: { status: v.status, method: on && v.method ? BL.METHODS[v.method] : null, pendingRestart: !!v.pendingRestart,
                 protectors: v.protectors.map(function (x) { return x.type; }) },
            unavailable: BL.blocked(s)
        };
    };

    /* Windows Security > Virus & threat protection. */
    R.defender = function (s) {
        NET.net(s);
        var d = s.defender;
        return { realtime: d.realtime !== false, tamper: d.tamper !== false, signaturesUpdated: !!d.sigUpdated,
                 exclusions: (d.exclusions || []).map(S) };
    };

    /* Local Group Policy Editor: the three policies the exam models. */
    R.gpedit = function (s) {
        var pol = s.os.policies || {};
        var wu = pol.wu || {};
        var fve = pol.fve || {};
        var cfg = function (flag, days) { return own(wu, flag) ? { enabled: wu[flag] === 1, days: own(wu, days) ? wu[days] : null } : null; };
        return {
            fveOsMethod: own(fve, 'EncryptionMethodWithXtsOs') ? (BL.METHODS[fve.EncryptionMethodWithXtsOs] || null) : null,
            wuFeature: cfg('DeferFeatureUpdates', 'DeferFeatureUpdatesPeriodInDays'),
            wuQuality: cfg('DeferQualityUpdates', 'DeferQualityUpdatesPeriodInDays')
        };
    };

    /* Apps: installed apps and the MSI products with their configured server and port. */
    R.apps = function (s) {
        var ap = s.os && s.os.oobe && s.os.oobe.done ? APPS.apps(s) : null;
        return {
            installed: installedApps(s),
            msi: ap ? ap.msi.map(function (m) { return { product: m.product, version: m.version, server: m.server ? S(m.server) : null, port: m.port ? S(m.port) : null }; }) : []
        };
    };

    /* The Startup tab only: the process list is the taskmgr/view action (a diagnostic event). */
    R.taskmgr = function (s) {
        var ap = s.os && s.os.oobe && s.os.oobe.done ? APPS.apps(s) : null;
        return { startup: ap ? ap.startup.map(function (x) { return { name: x.name, impact: x.impact, enabled: !!x.enabled }; }) : [] };
    };

    /* services.msc lists services, not kernel drivers (boot- and system-start entries). */
    R.services = function (s) {
        var sv = SYS.sys(s).services;
        return { services: Object.keys(sv).filter(function (n) { return sv[n].start !== 'Boot' && sv[n].start !== 'System'; }).map(function (n) {
            return { name: n, display: sv[n].display, startType: sv[n].start, status: sv[n].status };
        }) };
    };

    R.taskschd = function (s) {
        return { tasks: SYS.sys(s).tasks.map(function (t) { return { path: t.path + t.name, enabled: !!t.enabled, triggers: t.triggers || '' }; }) };
    };

    /* The log list only: events come from eventvwr/query (a diagnostic event). */
    R.eventvwr = function () { return { logs: ['Application', 'Security', 'Setup', 'System'] }; };

    /* The hosts file opens through notepad/hosts-open (a diagnostic event). */
    R.notepad = function () { return { file: null }; };

    /* Windows Recovery Environment: BitLocker lock state, key prompt, restore points. */
    R.winre = function (s) {
        var re = WINRE.re(s);
        var locked = WINRE.protectedC(s) && !re.unlocked;
        /* After a failed normal boot (only V1 fails one) the student has just seen the stop screen.
         * The boot that showed it may have run inside handover, whose reply carries no boot message,
         * so the recovery screen repeats it; entering WinRE already wrote the winre-view ledger event. */
        var failed = (SYS.sys(s).failedBoots || 0) > 0;
        return {
            stopScreen: failed ? 'Your PC ran into a problem and needs to restart.' : null,
            /* the copyable token on its own, so pasting it into I2 is an accepted form (Nancy D6 #7) */
            stopCode: failed ? 'INACCESSIBLE_BOOT_DEVICE' : null,
            bitlockerLocked: locked, skipped: !!re.skipped,
            keyPrompt: locked ? WINRE.keyPrompt(s) : null,
            restorePoints: SYS.sys(s).restorePoints.map(function (p) { return { seq: p.seq, name: S(p.name) }; }),
            startupOptions: [{ option: 4, label: 'Enable Safe Mode' }, { option: 5, label: 'Enable Safe Mode with Networking' }, { option: 6, label: 'Enable Safe Mode with Command Prompt' }]
        };
    };

    /* The as-built record (P8): the fields offered now, the student's saved values, the ticket. */
    R.asbuilt = function (s) {
        var saved = s.answers || {};
        return {
            ticket: ticket(s),
            fields: ANS.answerFields(s).map(function (id) {
                var f = ANS.FIELDS[id];
                var v = own(saved, id) ? saved[id].value : null;
                return { id: id, label: f.label, type: f.type, options: f.options ? f.options.slice() : null, max: f.max || null,
                         value: v === null ? null : (f.type === 'text' ? S(v) : v) };
            })
        };
    };

    /* ── entry point ─────────────────────────────────────────────────────────────────────────── */

    /* Renders one window. Refuses (generic message) a window the screen does not offer, or params
     * the window does not take. Returns { ok:true, view } or { ok:false, msg, refused }. */
    function render(state, windowName, params) {
        var w = String(windowName);
        if (!own(R, w)) { return { ok: false, msg: GUI.GENERIC, refused: 'unknown window' }; }
        if (!GUI.screenAllows(state, w)) { return { ok: false, msg: GUI.GENERIC, refused: 'screen' }; }
        var p = params === undefined || params === null ? {} : params;
        if (typeof p !== 'object' || Array.isArray(p) || (Object.getPrototypeOf(p) !== Object.prototype && Object.getPrototypeOf(p) !== null)) {
            return { ok: false, msg: GUI.GENERIC, refused: 'params' };
        }
        var allowed = own(VIEW_PARAMS, w) ? VIEW_PARAMS[w] : [];
        var keys = Object.keys(p);
        for (var i = 0; i < keys.length; i++) {
            if (allowed.indexOf(keys[i]) < 0) { return { ok: false, msg: GUI.GENERIC, refused: 'param ' + keys[i] }; }
            if (typeof p[keys[i]] !== 'string' || p[keys[i]].length > 260) { return { ok: false, msg: GUI.GENERIC, refused: 'param ' + keys[i] }; }
        }
        var clone = JSON.parse(JSON.stringify(state));
        /* a renderer fault refuses this window generically and is logged, never a 500 (Nancy D6 #1) */
        try { return { ok: true, view: R[w](clone, p) }; }
        catch (e) {
            if (typeof console !== 'undefined') { console.error('[mdfinal] render ' + w + ' failed: ' + (e && e.message)); }
            return { ok: false, msg: GUI.GENERIC, refused: 'render error' };
        }
    }

    module.exports = { render: render, S: S, S_MAX: S_MAX, VIEW_PARAMS: VIEW_PARAMS, WINDOW_NAMES: Object.keys(R),
                       restartRequired: restartRequired, ticket: ticket, hostname: hostname };
})();
