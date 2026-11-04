/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-cmdlets-d4.js — desktop console commands for P4/P5: IP, network profile, firewall,
 * Remote Desktop users, SMB shares and SMB1, disks, volumes, Storage Spaces, BitLocker, NTFS
 * (icacls, Get-Acl), folders and TECH-USB files, Defender.
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, cut item 1 (PowerShell
 * parity for network, disk, BitLocker), rows 4.1-5.4, R4 (fixed projections), 13.10.
 *
 * install(api) registers into mdfinal-cmdlets.js's tables (PRODUCERS read-only, MUTATORS first
 * stage only, LEGACY whole-line executables) using its helpers, so the pipeline engine, the deny
 * rules and the budget apply unchanged. Every command calls the same operation as its GUI twin.
 *
 * DECLARED SIMPLIFICATIONS: one adapter ("Ethernet", InterfaceIndex 4); New-StoragePool
 * -PhysicalDisks takes friendly names (PhysicalDisk<n>) or numbers, because the usual
 * (Get-PhysicalDisk -CanPool $true) subexpression is outside the console grammar;
 * Get-NetFirewallRule shows Protocol/LocalPort/RemoteAddress itself (no filter objects);
 * files exist only on TECH-USB (F:), folders on NTFS data volumes.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var PC = require('./mdfinal-pc.js');
    var OS = require('./mdfinal-os.js');
    var NET = require('./mdfinal-net.js');
    var FS = require('./mdfinal-fs.js');
    var STO = require('./mdfinal-storage.js');
    var BL = require('./mdfinal-bitlocker.js');
    var APPS = require('./mdfinal-apps.js');
    var NF = require('../netfinal/netfinal-core.js');

    var ADAPTER = 'Ethernet';

    function install(api) {
        var has = api.has, objs = api.objs, missingArg = api.missingArg, bool = api.bool;
        var P = api.PRODUCERS, Mu = api.MUTATORS, L = api.LEGACY;

        /* Value of the first present parameter among names, else the nth positional, else undefined. */
        function arg(a, names, pos) {
            for (var i = 0; i < names.length; i++) { if (has(a, names[i]) && a[names[i]] !== true) { return a[names[i]]; } }
            return pos === undefined ? undefined : a._[pos];
        }
        /* A comma list parameter as an array of trimmed strings. */
        function listArg(v) { return v === undefined || v === true ? [] : String(v).split(',').map(function (x) { return x.trim(); }).filter(function (x) { return x.length; }); }
        /* "C", "C:", "C:\" -> "C". */
        function letterOf(v) { return String(v === undefined ? '' : v).trim().toUpperCase().replace(':', '').replace('\\', ''); }
        /* PowerShell size literal to MB. */
        function mb(v) {
            var s = String(v === undefined ? '' : v).trim().toUpperCase(), mult = 1 / (1024 * 1024);
            [['TB', 1024 * 1024], ['GB', 1024], ['MB', 1], ['KB', 1 / 1024]].some(function (u) {
                if (s.length > u[0].length && s.slice(-u[0].length) === u[0]) { s = s.slice(0, -u[0].length); mult = u[1]; return true; }
                return false;
            });
            if (!s.length || isNaN(Number(s))) { return NaN; }
            return Number(s) * mult;
        }
        function alias(a) { var x = arg(a, ['interfacealias'], undefined); return x === undefined || String(x).toLowerCase() === ADAPTER.toLowerCase() || String(arg(a, ['interfaceindex'])) === '4'; }

        /* ═══ IP and DNS ═══ */
        Mu['new-netipaddress'] = function (state, a) {
            if (!alias(a)) { return "New-NetIPAddress : No matching MSFT_NetAdapter objects found by CIM query for instances of the ROOT/StandardCimv2/MSFT_NetAdapter class."; }
            var ip = arg(a, ['ipaddress']), pre = Number(arg(a, ['prefixlength']));
            if (ip === undefined) { return missingArg('New-NetIPAddress', 'IPAddress'); }
            if (!(pre >= 1 && pre <= 32)) { return missingArg('New-NetIPAddress', 'PrefixLength'); }
            var e = state.network.adapters.Ethernet;
            var p = { dhcp: false, ip: ip, mask: NF.ip.prefixToMask(pre), gateway: arg(a, ['defaultgateway']) || '' };
            p.dns1 = e.dns[0]; p.dns2 = e.dns[1];
            var r = OS.setIpv4(state, p);
            return r.ok ? '' : 'New-NetIPAddress : ' + r.msg;
        };
        Mu['set-dnsclientserveraddress'] = function (state, a) {
            if (!alias(a)) { return 'Set-DnsClientServerAddress : No MSFT_DNSClientServerAddress objects found.'; }
            if (has(a, 'resetserveraddresses')) { var rr = OS.setIpv4(state, { dnsAuto: true }); return rr.ok ? '' : 'Set-DnsClientServerAddress : ' + rr.msg; }
            var list = listArg(arg(a, ['serveraddresses']));
            if (!list.length) { return missingArg('Set-DnsClientServerAddress', 'ServerAddresses'); }
            var r = OS.setIpv4(state, { dns1: list[0], dns2: list[1] || '' });
            return r.ok ? '' : 'Set-DnsClientServerAddress : ' + r.msg;
        };
        Mu['set-netipinterface'] = function (state, a) {
            var d = String(arg(a, ['dhcp']) || '').toLowerCase();
            if (d !== 'enabled' && d !== 'disabled') { return "Set-NetIPInterface : Cannot bind parameter 'Dhcp'. Specify Enabled or Disabled."; }
            if (d === 'disabled') { return ''; }
            var r = OS.setIpv4(state, { dhcp: true, dnsAuto: true });
            return r.ok ? '' : 'Set-NetIPInterface : ' + r.msg;
        };
        Mu['remove-netipaddress'] = function () { return ''; };
        L['ipconfig'] = function (state, t) {
            var e = state.network.adapters.Ethernet, all = t[1] && t[1].toLowerCase() === '/all';
            var lines = ['Windows IP Configuration', ''];
            if (all) { lines.push('   Host Name . . . . . . . . . . . . : ' + state.os.hostname.effective, '   Primary Dns Suffix  . . . . . . . : ' + (state.identity.membership.type === 'domain' && !state.identity.membership.pending ? 'meridian.local' : ''), ''); }
            lines.push('Ethernet adapter Ethernet:', '');
            if (all) { lines.push('   DHCP Enabled. . . . . . . . . . . : ' + (e.dhcp ? 'Yes' : 'No')); }
            lines.push('   IPv4 Address. . . . . . . . . . . : ' + e.ip, '   Subnet Mask . . . . . . . . . . . : ' + NF.ip.prefixToMask(e.prefix),
                '   Default Gateway . . . . . . . . . : ' + (e.gateway || ''));
            if (all) { lines.push('   DNS Servers . . . . . . . . . . . : ' + e.dns.join('\n                                       ')); }
            return lines.join('\n');
        };
        L['ipconfig.exe'] = L['ipconfig'];
        P['get-netipconfiguration'] = function (state) {
            var e = state.network.adapters.Ethernet;
            var o = objs([{ InterfaceAlias: ADAPTER, InterfaceIndex: 4, IPv4Address: e.ip, PrefixLength: e.prefix, IPv4DefaultGateway: e.gateway || '', DNSServer: e.dns.join(', ') }],
                ['InterfaceAlias', 'InterfaceIndex', 'IPv4Address', 'PrefixLength', 'IPv4DefaultGateway', 'DNSServer'], ['InterfaceAlias', 'InterfaceIndex', 'IPv4Address', 'IPv4DefaultGateway', 'DNSServer']);
            o.forceList = true; return o;
        };
        P['get-dnsclientserveraddress'] = function (state) {
            return objs([{ InterfaceAlias: ADAPTER, InterfaceIndex: 4, AddressFamily: 'IPv4', ServerAddresses: '{' + state.network.adapters.Ethernet.dns.join(', ') + '}' }],
                ['InterfaceAlias', 'InterfaceIndex', 'AddressFamily', 'ServerAddresses'], ['InterfaceAlias', 'InterfaceIndex', 'AddressFamily', 'ServerAddresses']);
        };

        /* ═══ Network profile ═══ */
        P['get-netconnectionprofile'] = function (state) {
            var c = NET.category(state);
            var o = objs([{ Name: c === 'DomainAuthenticated' ? 'meridian.local' : 'Network', InterfaceAlias: ADAPTER, InterfaceIndex: 4, NetworkCategory: c,
                IPv4Connectivity: 'Internet' }], ['Name', 'InterfaceAlias', 'InterfaceIndex', 'NetworkCategory', 'IPv4Connectivity'], ['Name', 'InterfaceAlias', 'InterfaceIndex', 'NetworkCategory', 'IPv4Connectivity']);
            o.forceList = true; return o;
        };
        Mu['set-netconnectionprofile'] = function (state, a) {
            var r = NET.setCategory(state, arg(a, ['networkcategory']));
            return r.ok ? '' : 'Set-NetConnectionProfile : ' + r.msg;
        };

        /* ═══ Firewall ═══ */
        function ruleParams(a) {
            return { name: arg(a, ['displayname', 'name']), direction: arg(a, ['direction']), action: arg(a, ['action']), protocol: arg(a, ['protocol']),
                     localPort: arg(a, ['localport']), profile: arg(a, ['profile']), remoteAddress: arg(a, ['remoteaddress']),
                     enabled: has(a, 'enabled') ? bool(String(a.enabled).replace(/^true$/i, '$true').replace(/^false$/i, '$false')) !== false : undefined };
        }
        Mu['new-netfirewallrule'] = function (state, a) {
            var p = ruleParams(a);
            if (p.name === undefined) { return missingArg('New-NetFirewallRule', 'DisplayName'); }
            var r = NET.newRule(state, p);
            return r.ok ? '' : 'New-NetFirewallRule : ' + r.msg;
        };
        Mu['set-netfirewallrule'] = function (state, a) {
            var p = ruleParams(a);
            if (p.name === undefined) { return missingArg('Set-NetFirewallRule', 'DisplayName'); }
            var q = {};
            ['profile', 'remoteAddress', 'localPort', 'enabled'].forEach(function (k) { if (p[k] !== undefined) { q[k] = p[k]; } });
            var r = NET.setRule(state, p.name, q);
            return r.ok ? '' : 'Set-NetFirewallRule : ' + r.msg;
        };
        Mu['enable-netfirewallrule'] = function (state, a) { var r = NET.setRule(state, arg(a, ['displayname', 'name'], 0), { enabled: true }); return r.ok ? '' : 'Enable-NetFirewallRule : ' + r.msg; };
        Mu['disable-netfirewallrule'] = function (state, a) { var r = NET.setRule(state, arg(a, ['displayname', 'name'], 0), { enabled: false }); return r.ok ? '' : 'Disable-NetFirewallRule : ' + r.msg; };
        P['get-netadapter'] = function () {
            return objs([{ Name: ADAPTER, InterfaceDescription: 'Microsoft Hyper-V Network Adapter', ifIndex: 4, Status: 'Up', LinkSpeed: '10 Gbps' }],
                ['Name', 'InterfaceDescription', 'ifIndex', 'Status', 'LinkSpeed'], ['Name', 'InterfaceDescription', 'ifIndex', 'Status', 'LinkSpeed']);
        };
        P['get-netipaddress'] = function (state) {
            var e = state.network.adapters.Ethernet;
            return objs([{ IPAddress: e.ip, InterfaceAlias: ADAPTER, AddressFamily: 'IPv4', PrefixLength: e.prefix, PrefixOrigin: e.dhcp ? 'Dhcp' : 'Manual' }],
                ['IPAddress', 'InterfaceAlias', 'AddressFamily', 'PrefixLength', 'PrefixOrigin'], ['IPAddress', 'InterfaceAlias', 'AddressFamily', 'PrefixLength', 'PrefixOrigin']);
        };
        Mu['remove-netfirewallrule'] = function (state, a) {
            var n = arg(a, ['displayname', 'name'], 0);
            var r = NET.deleteRule(state, n);
            return r.ok ? '' : 'Remove-NetFirewallRule : ' + r.msg;
        };
        Mu['set-netfirewallprofile'] = function (state, a) {
            var on = bool(String(arg(a, ['enabled']) || '').replace(/^true$/i, '$true').replace(/^false$/i, '$false'));
            if (on === null) { return "Set-NetFirewallProfile : Cannot bind parameter 'Enabled'. Specify True or False."; }
            var r = NET.setProfile(state, arg(a, ['profile', 'name'], 0) || 'Any', on);
            return r.ok ? '' : 'Set-NetFirewallProfile : ' + r.msg;
        };
        P['get-netfirewallrule'] = function (state, a) {
            NET.net(state);
            var n = arg(a, ['displayname', 'name'], 0);
            var rules = state.network.firewall.rules.filter(function (r) { return n === undefined || r.name.toLowerCase() === String(n).toLowerCase(); });
            if (n !== undefined && !rules.length) { return "Get-NetFirewallRule : No MSFT_NetFirewallRule objects found with property 'DisplayName' equal to '" + String(n).slice(0, 64) + "'."; }
            return objs(rules.map(function (r) {
                return { DisplayName: r.name, Enabled: r.enabled, Direction: r.direction, Action: r.action, Profile: r.profiles.length === 3 ? 'Any' : r.profiles.join(', '),
                         Protocol: r.protocol, LocalPort: r.localPort.join(','), RemoteAddress: r.remote.join(',') };
            }), ['DisplayName', 'Enabled', 'Direction', 'Action', 'Profile', 'Protocol', 'LocalPort', 'RemoteAddress'], ['DisplayName', 'Enabled', 'Direction', 'Action', 'Profile']);
        };
        P['get-netfirewallprofile'] = function (state) {
            NET.net(state);
            var f = state.network.firewall.profiles;
            return objs(NET.PROFILES.map(function (p) { return { Name: p, Enabled: f[p] }; }), ['Name', 'Enabled'], ['Name', 'Enabled']);
        };
        /* netsh advfirewall firewall add rule name=X dir=in action=allow protocol=TCP localport=N remoteip=S profile=domain,private
         * netsh advfirewall firewall delete rule name=X ; netsh advfirewall set allprofiles state on|off */
        L['netsh'] = function (state, t) {
            var w = t.map(function (x) { return x.toLowerCase(); });
            var kv = Object.create(null);
            /* netsh is case-insensitive in names and keyword values (Nancy D4 A4); names keep their case */
            t.forEach(function (x) { var i = x.indexOf('='); if (i > 0) { var k = x.slice(0, i).toLowerCase(); kv[k] = k === 'name' ? x.slice(i + 1) : x.slice(i + 1).toLowerCase(); } });
            if (w[1] === 'advfirewall' && w[2] === 'firewall' && (w[3] === 'add' || w[3] === 'delete') && w[4] === 'rule') {
                if (kv.name === undefined) { return 'One or more essential parameters were not entered.\nVerify the required parameters, and reenter them.'; }
                if (w[3] === 'delete') { var d = NET.deleteRule(state, kv.name); return d.ok ? '\nDeleted 1 rule(s).\nOk.\n' : '\nNo rules match the specified criteria.\n'; }
                var r = NET.newRule(state, { name: kv.name, direction: kv.dir === 'out' ? 'Outbound' : 'Inbound', action: kv.action === 'block' ? 'Block' : 'Allow',
                    protocol: kv.protocol, localPort: kv.localport, profile: kv.profile === undefined ? 'Any' : kv.profile, remoteAddress: kv.remoteip === undefined ? 'Any' : kv.remoteip });
                return r.ok ? 'Ok.\n' : r.msg;
            }
            if (w[1] === 'advfirewall' && w[2] === 'set' && (w[3] === 'allprofiles' || w[3] === 'domainprofile' || w[3] === 'privateprofile' || w[3] === 'publicprofile') && w[4] === 'state') {
                var prof = w[3] === 'allprofiles' ? 'Any' : w[3].replace('profile', '');
                var s = NET.setProfile(state, prof, w[5] === 'on');
                return s.ok ? 'Ok.\n' : s.msg;
            }
            return 'The following command was not found: ' + t.slice(1).join(' ').slice(0, 80) + '.';
        };
        L['netsh.exe'] = L['netsh'];

        /* ═══ Remote Desktop (registry route already exists; this is the group) ═══ */

        /* ═══ SMB ═══ */
        Mu['new-smbshare'] = function (state, a) {
            var grants = [];
            [['fullaccess', 'Full'], ['changeaccess', 'Change'], ['readaccess', 'Read']].forEach(function (x) {
                listArg(arg(a, [x[0]])).forEach(function (p) { grants.push({ principal: p, right: x[1] }); });
            });
            var name = arg(a, ['name'], 0), path = arg(a, ['path'], 1);
            if (name === undefined) { return missingArg('New-SmbShare', 'Name'); }
            if (path === undefined) { return missingArg('New-SmbShare', 'Path'); }
            if (grants.length > 16) { return api.LIMIT_MSG; }
            var r = NET.newShare(state, { name: name, path: path, grants: grants });
            return r.ok ? '' : 'New-SmbShare : ' + r.msg;
        };
        Mu['grant-smbshareaccess'] = function (state, a) {
            var right = String(arg(a, ['accessright']) || '');
            right = right.charAt(0).toUpperCase() + right.slice(1).toLowerCase();
            var acc = listArg(arg(a, ['accountname']));
            if (!acc.length) { return missingArg('Grant-SmbShareAccess', 'AccountName'); }
            for (var i = 0; i < acc.length; i++) { var r = NET.sharePermSet(state, arg(a, ['name'], 0), acc[i], right, 'Allow'); if (!r.ok) { return 'Grant-SmbShareAccess : ' + r.msg; } }
            return '';
        };
        Mu['block-smbshareaccess'] = function (state, a) {
            var acc = listArg(arg(a, ['accountname']));
            for (var i = 0; i < acc.length; i++) { var r = NET.sharePermSet(state, arg(a, ['name'], 0), acc[i], 'Full', 'Deny'); if (!r.ok) { return 'Block-SmbShareAccess : ' + r.msg; } }
            return '';
        };
        Mu['revoke-smbshareaccess'] = function (state, a) {
            var acc = listArg(arg(a, ['accountname']));
            for (var i = 0; i < acc.length; i++) { var r = NET.sharePermRemove(state, arg(a, ['name'], 0), acc[i], 'Allow'); if (!r.ok) { return 'Revoke-SmbShareAccess : ' + r.msg; } }
            return '';
        };
        Mu['remove-smbshare'] = function (state, a) { var r = NET.removeShare(state, arg(a, ['name'], 0)); return r.ok ? '' : 'Remove-SmbShare : ' + r.msg; };
        P['get-smbshare'] = function (state) {
            NET.net(state);
            return objs(state.network.shares.map(function (s) { return { Name: s.name, ScopeName: '*', Path: s.path, Description: '' }; }),
                ['Name', 'ScopeName', 'Path', 'Description'], ['Name', 'ScopeName', 'Path', 'Description']);
        };
        P['get-smbshareaccess'] = function (state, a) {
            var sh = NET.shareByName(state, arg(a, ['name'], 0));
            if (!sh) { return "Get-SmbShareAccess : No MSFT_SMBShare objects found with property 'Name' equal to '" + String(arg(a, ['name'], 0) || '').slice(0, 64) + "'."; }
            return objs(sh.perms.map(function (p) { return { Name: sh.name, ScopeName: '*', AccountName: p.principal, AccessControlType: p.type, AccessRight: p.right }; }),
                ['Name', 'ScopeName', 'AccountName', 'AccessControlType', 'AccessRight'], ['Name', 'ScopeName', 'AccountName', 'AccessControlType', 'AccessRight']);
        };
        /* net share | net share name=path [/grant:user,right] | net share name /delete */
        var netBase = L['net'];
        L['net'] = function (state, t) {
            if (String(t[1] || '').toLowerCase() !== 'share') { return netBase(state, t); }
            if (t.length === 2) {
                NET.net(state);
                return 'Share name   Resource                        Remark\n\n-------------------------------------------------------------------------------\n' +
                    state.network.shares.map(function (s) { return s.name + '    ' + s.path; }).join('\n') + '\nThe command completed successfully.';
            }
            var spec = t[2], eq = spec.indexOf('=');
            if (eq < 0) {
                if (t.slice(3).some(function (x) { return x.toLowerCase() === '/delete'; })) { var d = NET.removeShare(state, spec); return d.ok ? spec + ' was deleted successfully.' : 'This shared resource does not exist.'; }
                return 'This shared resource does not exist.';
            }
            var grants = [];
            for (var i = 3; i < t.length; i++) {
                var x = t[i];
                if (x.toLowerCase().indexOf('/grant:') === 0) {
                    var g = x.slice(7), c = g.lastIndexOf(',');
                    if (c < 0) { return 'The syntax of this command is:\n\nNET SHARE sharename=drive:path [/GRANT:user,[READ | CHANGE | FULL]]'; }
                    var right = g.slice(c + 1).toLowerCase();
                    grants.push({ principal: g.slice(0, c), right: right === 'full' ? 'Full' : right === 'change' ? 'Change' : 'Read' });
                }
            }
            var r = NET.newShare(state, { name: spec.slice(0, eq), path: spec.slice(eq + 1), grants: grants });
            return r.ok ? spec.slice(0, eq) + ' was shared successfully.' : 'System error 2310 has occurred.\n\n' + r.msg;
        };
        L['net.exe'] = L['net'];
        function smb1Feature(state, a, on) {
            if (String(arg(a, ['featurename']) || '').toLowerCase() !== 'smb1protocol') { return 'This exam console manages the SMB1Protocol feature.'; }
            NET.setSmb1(state, on);
            return '';
        }
        Mu['enable-windowsoptionalfeature'] = function (state, a) { return smb1Feature(state, a, true); };
        Mu['disable-windowsoptionalfeature'] = function (state, a) { return smb1Feature(state, a, false); };
        Mu['set-smbserverconfiguration'] = function (state, a) {
            if (!has(a, 'enablesmb1protocol')) { return 'This exam console sets -EnableSMB1Protocol.'; }
            var b = bool(String(a.enablesmb1protocol).replace(/^true$/i, '$true').replace(/^false$/i, '$false'));
            if (b === null) { return "Set-SmbServerConfiguration : Cannot convert value to type System.Boolean."; }
            NET.setSmb1(state, b); return '';
        };
        P['get-windowsoptionalfeature'] = function (state, a) {
            if (String(arg(a, ['featurename']) || '').toLowerCase() !== 'smb1protocol') { return 'This exam console reports the SMB1Protocol feature.'; }
            NET.net(state);
            return objs([{ FeatureName: 'SMB1Protocol', State: state.network.smb1 ? 'Enabled' : 'Disabled' }], ['FeatureName', 'State'], ['FeatureName', 'State']);
        };

        /* ═══ Disks, partitions, volumes, Storage Spaces ═══ */
        P['get-disk'] = function (state) {
            return objs(state.disks.filter(function (d) { return !d.inPool; }).map(function (d) {
                return { Number: d.n, FriendlyName: d.virtual ? 'MerSpace' : 'Msft Virtual Disk', OperationalStatus: 'Online', Size: d.gb + ' GB',
                         PartitionStyle: d.style === null ? 'RAW' : d.style, FreeMB: Math.floor(PC.freeMb(d)) };
            }), ['Number', 'FriendlyName', 'OperationalStatus', 'Size', 'PartitionStyle', 'FreeMB'], ['Number', 'FriendlyName', 'OperationalStatus', 'Size', 'PartitionStyle']);
        };
        P['get-partition'] = function (state, a) {
            var n = arg(a, ['disknumber']);
            var rows = [];
            state.disks.forEach(function (d) {
                if (n !== undefined && String(d.n) !== String(n)) { return; }
                d.partitions.forEach(function (p, i) { rows.push({ DiskNumber: d.n, PartitionNumber: i + 1, DriveLetter: p.letter || '', Size: Math.round(p.mb / 1024 * 100) / 100 + ' GB', Type: p.type === 'Primary' ? 'Basic' : p.type }); });
            });
            return objs(rows, ['DiskNumber', 'PartitionNumber', 'DriveLetter', 'Size', 'Type'], ['DiskNumber', 'PartitionNumber', 'DriveLetter', 'Size', 'Type']);
        };
        P['get-volume'] = function (state) {
            var rows = [];
            state.disks.forEach(function (d) { d.partitions.forEach(function (p) { if (p.letter) { rows.push({ DriveLetter: p.letter, FileSystemLabel: p.label || '', FileSystem: p.fs || 'RAW', Size: Math.round(p.mb / 1024 * 100) / 100 + ' GB' }); } }); });
            return objs(rows.sort(function (x, y) { return x.DriveLetter < y.DriveLetter ? -1 : 1; }), ['DriveLetter', 'FileSystemLabel', 'FileSystem', 'Size'], ['DriveLetter', 'FileSystemLabel', 'FileSystem', 'Size']);
        };
        P['get-physicaldisk'] = function (state, a) {
            var only = has(a, 'canpool') ? bool(String(a.canpool === true ? '$true' : a.canpool)) : null;
            return objs(state.disks.filter(function (d) { return !d.virtual; }).map(function (d) {
                return { FriendlyName: 'PhysicalDisk' + d.n, DeviceId: d.n, CanPool: STO.canPool(state, d), Size: d.gb + ' GB' };
            }).filter(function (r) { return only === null || r.CanPool === only; }), ['FriendlyName', 'DeviceId', 'CanPool', 'Size'], ['FriendlyName', 'DeviceId', 'CanPool', 'Size']);
        };
        P['get-storagepool'] = function (state) {
            return objs(state.pool ? [{ FriendlyName: state.pool.name, OperationalStatus: 'OK', HealthStatus: 'Healthy', IsPrimordial: false }] : [],
                ['FriendlyName', 'OperationalStatus', 'HealthStatus', 'IsPrimordial'], ['FriendlyName', 'OperationalStatus', 'HealthStatus', 'IsPrimordial']);
        };
        P['get-virtualdisk'] = function (state) {
            var sp = state.pool && state.pool.space;
            return objs(sp ? [{ FriendlyName: sp.name, ResiliencySettingName: sp.resiliency === 'Simple' ? 'Simple' : 'Mirror', Size: sp.gb + ' GB' }] : [],
                ['FriendlyName', 'ResiliencySettingName', 'Size'], ['FriendlyName', 'ResiliencySettingName', 'Size']);
        };
        Mu['initialize-disk'] = function (state, a) {
            var n = arg(a, ['number'], 0);
            var r = STO.initDisk(state, Number(n), arg(a, ['partitionstyle']) || 'GPT');
            return r.ok ? '' : 'Initialize-Disk : ' + r.msg;
        };
        Mu['new-partition'] = function (state, a) {
            var n = arg(a, ['disknumber']);
            if (n === undefined) { return missingArg('New-Partition', 'DiskNumber'); }
            var size = has(a, 'usemaximumsize') ? null : mb(arg(a, ['size']));
            if (size !== null && isNaN(size)) { return missingArg('New-Partition', 'Size'); }
            var letter = has(a, 'assigndriveletter') ? nextFree(state) : arg(a, ['driveletter']);
            var r = STO.newVolume(state, { disk: Number(n), sizeMB: size === null ? null : Math.floor(size), letter: letter, fs: 'RAW', label: '' });
            return r.ok ? '' : 'New-Partition : ' + r.msg;
        };
        /* The next free drive letter from D:, as -AssignDriveLetter picks. */
        function nextFree(state) {
            var used = STO.lettersInUse(state);
            for (var c = 68; c <= 90; c++) { if (used.indexOf(String.fromCharCode(c)) < 0) { return String.fromCharCode(c); } }
            return null;
        }
        Mu['format-volume'] = function (state, a) {
            var l = letterOf(arg(a, ['driveletter'], 0));
            var r = STO.formatVolume(state, l, arg(a, ['filesystem']) || 'NTFS', arg(a, ['newfilesystemlabel']) || '');
            return r.ok ? '' : 'Format-Volume : ' + r.msg;
        };
        Mu['resize-partition'] = function (state, a) {
            var l = letterOf(arg(a, ['driveletter']));
            var hit = STO.byLetter(state, l);
            if (!hit) { return "Resize-Partition : No MSFT_Partition objects found with property 'DriveLetter' equal to '" + l.slice(0, 2) + "'."; }
            var want = mb(arg(a, ['size']));
            if (isNaN(want)) { return missingArg('Resize-Partition', 'Size'); }
            var delta = Math.floor(want) - hit.part.mb;
            var r = delta < 0 ? STO.shrink(state, l, -delta) : delta > 0 ? STO.extend(state, l, delta) : { ok: true, msg: '' };
            return r.ok ? '' : 'Resize-Partition : ' + r.msg;
        };
        Mu['set-partition'] = function (state, a) {
            var r = STO.changeLetter(state, letterOf(arg(a, ['driveletter'])), letterOf(arg(a, ['newdriveletter'])));
            return r.ok ? '' : 'Set-Partition : ' + r.msg;
        };
        Mu['remove-partition'] = function (state, a) {
            var r = STO.deleteVolume(state, letterOf(arg(a, ['driveletter'])));
            return r.ok ? '' : 'Remove-Partition : ' + r.msg;
        };
        Mu['new-storagepool'] = function (state, a) {
            var names = listArg(arg(a, ['physicaldisks']));
            if (!names.length) { return missingArg('New-StoragePool', 'PhysicalDisks'); }
            var nums = names.map(function (x) { var s = x.toLowerCase().replace('physicaldisk', ''); return s.length && !isNaN(Number(s)) ? Number(s) : -1; });
            var r = STO.newPool(state, arg(a, ['friendlyname']), nums);
            return r.ok ? '' : 'New-StoragePool : ' + r.msg;
        };
        Mu['new-virtualdisk'] = function (state, a) {
            if (!has(a, 'usemaximumsize')) { return 'This exam lab creates a storage space of the whole pool: use -UseMaximumSize.'; }
            var r = STO.newVirtualDisk(state, { pool: arg(a, ['storagepoolfriendlyname']), name: arg(a, ['friendlyname']), resiliency: arg(a, ['resiliencysettingname']) });
            return r.ok ? '' : 'New-VirtualDisk : ' + r.msg;
        };

        /* ═══ BitLocker ═══ */
        function emArg(v) { return v === undefined ? undefined : String(v); }
        L['manage-bde'] = function (state, t, ctx) {
            var w = t.map(function (x) { return x.toLowerCase(); });
            var drive = w[2] || '';
            if (w[1] === '-status' || w[1] === '/status') { return BL.status(state).text; }
            if (drive !== 'c:' && w[1] !== '-protectors' && w[1] !== '/protectors') { return 'ERROR: An error occurred (code 0x80070057):\nThe parameter is incorrect.'; }
            if (w[1] === '-off' || w[1] === '/off') { return BL.decrypt(state).msg; }
            if (w[1] === '-on' || w[1] === '/on') {
                var em, i = w.indexOf('-em'); if (i < 0) { i = w.indexOf('-encryptionmethod'); }
                if (i >= 0) { em = t[i + 1]; }
                var r = BL.manageBdeOn(state, ctx, { em: emArg(em), rp: w.indexOf('-rp') >= 0 || w.indexOf('-recoverypassword') >= 0, skipTest: w.indexOf('-s') >= 0 || w.indexOf('-skiphardwaretest') >= 0 });
                return r.msg;
            }
            if (w[1] === '-protectors' || w[1] === '/protectors') {
                var op = w[2], dv = w[3];
                if (dv !== 'c:') { return 'ERROR: An error occurred (code 0x80070057):\nThe parameter is incorrect.'; }
                if (op === '-get') { return BL.listProtectors(state); }
                if (op === '-add') {
                    var type = w.indexOf('-rp') >= 0 || w.indexOf('-recoverypassword') >= 0 ? 'RecoveryPassword' : w.indexOf('-tpm') >= 0 ? 'Tpm' : null;
                    if (!type) { return 'ERROR: A key protector type must be specified.'; }
                    return BL.protectorAdd(state, ctx, type).msg;
                }
                if (op === '-delete') { var j = w.indexOf('-id'); return BL.protectorDelete(state, j >= 0 ? t[j + 1] : '').msg; }
                if (op === '-disable') { return BL.suspend(state, true).msg; }
                if (op === '-enable') { return BL.suspend(state, false).msg; }
            }
            return 'ERROR: An error occurred (code 0x80070057):\nThe parameter is incorrect.';
        };
        L['manage-bde.exe'] = L['manage-bde'];
        Mu['enable-bitlocker'] = function (state, a, ctx) {
            if (letterOf(arg(a, ['mountpoint'], 0)) !== 'C') { return 'Enable-BitLocker : This exam lab encrypts C: only.'; }
            if (has(a, 'tpmprotector') && has(a, 'recoverypasswordprotector')) {
                return 'Enable-BitLocker : Parameter set cannot be resolved using the specified named parameters. One or more parameters issued cannot be used together.';
            }
            var r = BL.enableBitLocker(state, ctx, { method: arg(a, ['encryptionmethod']), tpm: has(a, 'tpmprotector'), rp: has(a, 'recoverypasswordprotector'), skipTest: has(a, 'skiphardwaretest') });
            return r.ok ? '' : 'Enable-BitLocker : ' + r.msg;
        };
        Mu['add-bitlockerkeyprotector'] = function (state, a, ctx) {
            var type = has(a, 'recoverypasswordprotector') ? 'RecoveryPassword' : has(a, 'tpmprotector') ? 'Tpm' : null;
            if (!type) { return 'Add-BitLockerKeyProtector : Parameter set cannot be resolved using the specified named parameters.'; }
            var r = BL.protectorAdd(state, ctx, type);
            return r.ok ? '' : 'Add-BitLockerKeyProtector : ' + r.msg;
        };
        Mu['disable-bitlocker'] = function (state, a) {
            if (letterOf(arg(a, ['mountpoint'], 0)) !== 'C') { return 'Disable-BitLocker : This exam lab encrypts C: only.'; }
            var r = BL.decrypt(state); return r.ok ? '' : 'Disable-BitLocker : ' + r.msg;
        };
        Mu['suspend-bitlocker'] = function (state) { var r = BL.suspend(state, true); return r.ok ? '' : 'Suspend-BitLocker : ' + r.msg; };
        Mu['resume-bitlocker'] = function (state) { var r = BL.suspend(state, false); return r.ok ? '' : 'Resume-BitLocker : ' + r.msg; };
        P['get-bitlockervolume'] = function (state) {
            var st = BL.status(state);
            var o = objs([{ MountPoint: st.MountPoint, EncryptionMethod: st.EncryptionMethod, VolumeStatus: st.VolumeStatus, ProtectionStatus: st.ProtectionStatus,
                EncryptionPercentage: st.EncryptionPercentage, KeyProtector: st.KeyProtector }],
                ['MountPoint', 'EncryptionMethod', 'VolumeStatus', 'ProtectionStatus', 'EncryptionPercentage', 'KeyProtector'],
                ['MountPoint', 'EncryptionMethod', 'VolumeStatus', 'ProtectionStatus', 'EncryptionPercentage', 'KeyProtector']);
            o.forceList = true; return o;
        };

        /* ═══ NTFS, folders, TECH-USB files ═══ */
        var ICACLS_OK = function (path) { return 'processed file: ' + path + '\nSuccessfully processed 1 files; Failed processing 0 files'; };
        L['icacls'] = function (state, t) {
            var path = t[1];
            if (path === undefined) { return 'ICACLS name /grant[:r] Sid:perm[...] /deny Sid:perm [...] /remove[:g|:d]] Sid[...] /inheritance:e|d|r'; }
            var f = FS.folder(state, path);
            if (!f) { return path.slice(0, 120) + ': The system cannot find the file specified.\nSuccessfully processed 0 files; Failed processing 1 files'; }
            var c = FS.canon(path);
            if (t.length === 2) {
                return c + ' ' + (FS.effectiveAcl(state, c) || []).map(function (a) {
                    return a.principal + ':' + (a.inherited ? '(I)' : '') + '(OI)(CI)' + (a.type === 'Deny' ? '(DENY)' : '') + '(' + simple(a.mask) + ')';
                }).join('\n' + ' '.repeat(c.length + 1)) + '\n\nSuccessfully processed 1 files; Failed processing 0 files';
            }
            for (var i = 2; i < t.length; i++) {
                var op = t[i].toLowerCase();
                var r = null;
                if (op.indexOf('/inheritance:') === 0) {
                    var m = op.slice(13);
                    r = NET.ntfsInheritance(state, c, m === 'd' ? 'convert' : m === 'r' ? 'remove' : m === 'e' ? 'enable' : 'bad');
                } else if (op === '/grant' || op === '/grant:r' || op === '/deny') {
                    var spec = t[++i];
                    if (spec === undefined) { return 'Invalid parameter "' + op + '"'; }
                    var colon = spec.lastIndexOf(':');
                    if (colon < 1) { return 'Invalid parameter "' + spec.slice(0, 40) + '"'; }
                    var who = spec.slice(0, colon);
                    var mask = icaclsMask(spec.slice(colon + 1));
                    if (mask < 0) { return 'Invalid parameter "' + spec.slice(0, 40) + '"'; }
                    if (mask === 0) { r = { ok: true, msg: '' }; continue; }   /* N: no access granted */
                    if (op === '/grant:r') { NET.ntfsRemove(state, c, who, 'Allow'); }
                    r = NET.ntfsGrant(state, c, who, mask, op === '/deny' ? 'Deny' : 'Allow');
                } else if (op === '/t' || op === '/c' || op === '/q' || op === '/l') {
                    r = { ok: true, msg: '' };   /* recurse/continue/quiet/link switches: accepted, no effect on folders-only NTFS */
                } else if (op === '/remove' || op === '/remove:g' || op === '/remove:d') {
                    r = NET.ntfsRemove(state, c, t[++i], op === '/remove:g' ? 'Allow' : op === '/remove:d' ? 'Deny' : undefined);
                } else { return 'Invalid parameter "' + t[i].slice(0, 40) + '"'; }
                if (!r.ok) { return c + ': ' + r.msg + '\nSuccessfully processed 0 files; Failed processing 1 files'; }
            }
            return ICACLS_OK(c);
        };
        L['icacls.exe'] = L['icacls'];
        /* icacls permission text: (OI)(CI)(IO)(NP)(I) flag groups, (R,W)-style right lists, and a bare
         * trailing right (F, M, RX, R, W, D). Returns the mask, or 0 when any piece is not valid. */
        function icaclsMask(raw) {
            var s = String(raw || '').toUpperCase(), i = 0, mask = 0, any = false;
            if (s === 'N') { return 0; }
            var flags = ['OI', 'CI', 'IO', 'NP', 'I'];
            /* N (no access) is a valid right that grants nothing, alone or after flag groups (Nancy D4 re-check) */
            var addRight = function (r) { if (r === 'N') { any = true; return true; } if (!Object.prototype.hasOwnProperty.call(FS.ICACLS, r)) { return false; } mask = mask | FS.ICACLS[r]; any = true; return true; };
            while (i < s.length) {
                if (s[i] === '(') {
                    var j = s.indexOf(')', i);
                    if (j < 0) { return -1; }
                    var inner = s.slice(i + 1, j);
                    if (flags.indexOf(inner) < 0) {
                        var parts = inner.split(',');
                        for (var k = 0; k < parts.length; k++) { if (!addRight(parts[k].trim())) { return -1; } }
                    }
                    i = j + 1;
                } else {
                    var rest = s.slice(i);
                    if (rest.indexOf('(') >= 0 || !addRight(rest.trim())) { return -1; }
                    i = s.length;
                }
            }
            return any ? mask : -1;
        }

        /* icacls short form of a mask. */
        function simple(mask) {
            var n = Object.keys(FS.ICACLS).filter(function (k) { return FS.ICACLS[k] === mask; })[0];
            return n || 'special';
        }
        P['get-acl'] = function (state, a) {
            var path = arg(a, ['path'], 0);
            var c = FS.canon(path), f = c && FS.folder(state, c);
            if (!f) { return "Get-Acl : Cannot find path '" + String(path || '').slice(0, 120) + "' because it does not exist."; }
            var o = objs([{ Path: c, Owner: 'BUILTIN\\Administrators', AreAccessRulesProtected: f.protect === true,
                AccessToString: (FS.effectiveAcl(state, c) || []).map(function (x) { return x.principal + ' ' + x.type + '  ' + FS.rightsName(x.mask) + (x.inherited ? ' (inherited)' : ''); }).join('; ') }],
                ['Path', 'Owner', 'AreAccessRulesProtected', 'AccessToString'], ['Path', 'Owner', 'AccessToString']);
            o.forceList = true; return o;
        };
        function mkdirCmd(state, t) {
            var path = t.slice(1).join(' ');
            var r = NET.newFolder(state, path, true);
            return r.ok ? '' : r.msg;
        }
        L['mkdir'] = mkdirCmd; L['md'] = mkdirCmd;
        /* A path on TECH-USB: F:\name (flat). */
        function usbName(path) {
            var c = String(path || '').trim();
            if (c.length < 4 || c[0].toUpperCase() !== 'F' || c[1] !== ':' || c[2] !== '\\') { return null; }
            var n = c.slice(3);
            if (!n || n.length > 64 || n.indexOf('\\') >= 0 || n.indexOf('/') >= 0 || n.indexOf(':') >= 0) { return null; }
            return n;
        }
        var registryNewItem = Mu['new-item'];
        Mu['new-item'] = function (state, a) {
            var type = String(arg(a, ['itemtype', 'type']) || '').toLowerCase();
            var path = arg(a, ['path'], 0);
            if (type === 'directory') { var r = NET.newFolder(state, path, has(a, 'force')); return r.ok ? '' : 'New-Item : ' + r.msg; }
            if (type === 'file') {
                var n = usbName(path);
                if (!n) { return 'New-Item : Files can be created on TECH-USB (F:\\) only in this lab.'; }
                var w = BL.writeUsb(state, n, String(arg(a, ['value']) || ''), true);
                return w.ok ? '' : 'New-Item : ' + w.msg;
            }
            return registryNewItem(state, a);
        };
        Mu['set-content'] = function (state, a) {
            var n = usbName(arg(a, ['path'], 0));
            if (!n) { return 'Set-Content : Files can be written on TECH-USB (F:\\) only in this lab.'; }
            var w = BL.writeUsb(state, n, String(arg(a, ['value'], 1) || ''), true);
            return w.ok ? '' : 'Set-Content : ' + w.msg;
        };
        P['get-content'] = function (state, a) {
            var n = usbName(arg(a, ['path'], 0));
            var f = n && state.host.usb.F.files.filter(function (x) { return x.name.toLowerCase() === n.toLowerCase(); })[0];
            if (!f) { return "Get-Content : Cannot find path '" + String(arg(a, ['path'], 0) || '').slice(0, 120) + "' because it does not exist."; }
            return f.text;
        };
        P['get-childitem'] = function (state, a) {
            var path = String(arg(a, ['path'], 0) || '').trim();
            if (path.toUpperCase().indexOf('F:') === 0) {
                return objs(state.host.usb.F.files.map(function (f) { return { Mode: '-a----', Length: Buffer.byteLength(f.text), Name: f.name }; }), ['Mode', 'Length', 'Name'], ['Mode', 'Length', 'Name']);
            }
            var c = FS.canon(path);
            /* the fabric's C:\LabFiles on the installed image (the LedgerSync packages, row 6.1) */
            if (c && c.toUpperCase().replace(/\\$/, '') === 'C:\\LABFILES' && state.os && state.os.installed) {
                return objs(APPS.labFiles().map(function (f) { return { Mode: '-a----', Length: f.bytes, Name: f.name }; }), ['Mode', 'Length', 'Name'], ['Mode', 'Length', 'Name']);
            }
            var vol = c && state.fs && state.fs.volumes[c[0]];
            if (!vol || !FS.folder(state, c)) { return "Get-ChildItem : Cannot find path '" + path.slice(0, 120) + "' because it does not exist."; }
            var pre = c.toUpperCase().replace(/\\$/, '') + '\\';
            var kids = Object.keys(vol.folders).filter(function (k) { return k.indexOf(pre) === 0 && k.slice(pre.length).indexOf('\\') < 0 && k.length > pre.length; });
            return objs(kids.map(function (k) { return { Mode: 'd-----', Length: '', Name: vol.folders[k].path.slice(pre.length) }; }), ['Mode', 'Length', 'Name'], ['Mode', 'Length', 'Name']);
        };
        P['dir'] = P['get-childitem']; P['ls'] = P['get-childitem']; P['gci'] = P['get-childitem']; P['type'] = P['get-content']; P['cat'] = P['get-content'];

        /* ═══ Defender ═══ */
        Mu['update-mpsignature'] = function (state) { var r = NET.updateSignatures(state); return r.ok ? '' : r.msg; };
        Mu['set-mppreference'] = function (state, a) {
            if (has(a, 'disablerealtimemonitoring')) {
                var b = a.disablerealtimemonitoring === true ? true : bool(a.disablerealtimemonitoring);
                if (b === null) { return 'Set-MpPreference : Cannot convert value to type System.Boolean.'; }
                NET.setRealtime(state, !b, true); return '';
            }
            if (has(a, 'exclusionpath')) { return 'Set-MpPreference : use Add-MpPreference -ExclusionPath in this lab.'; }
            return '';
        };
        Mu['add-mppreference'] = function (state, a) {
            var list = listArg(arg(a, ['exclusionpath']));
            if (!list.length) { return missingArg('Add-MpPreference', 'ExclusionPath'); }
            for (var i = 0; i < list.length; i++) { var r = NET.addExclusion(state, list[i]); if (!r.ok) { return 'Add-MpPreference : ' + r.msg; } }
            return '';
        };
        Mu['remove-mppreference'] = function (state, a) {
            var list = listArg(arg(a, ['exclusionpath']));
            for (var i = 0; i < list.length; i++) { var r = NET.removeExclusion(state, list[i]); if (!r.ok) { return 'Remove-MpPreference : ' + r.msg; } }
            return '';
        };
        P['get-mppreference'] = function (state) {
            NET.net(state);
            var o = objs([{ ExclusionPath: '{' + state.defender.exclusions.join(', ') + '}', DisableRealtimeMonitoring: !state.defender.realtime }],
                ['ExclusionPath', 'DisableRealtimeMonitoring'], ['ExclusionPath', 'DisableRealtimeMonitoring']);
            o.forceList = true; return o;
        };
        P['get-mpcomputerstatus'] = function (state) {
            NET.net(state);
            var o = objs([{ RealTimeProtectionEnabled: state.defender.realtime, IsTamperProtected: state.defender.tamper,
                AntivirusSignatureLastUpdated: state.defender.sigUpdated ? '11/19/2026 5:45:12 PM' : '10/14/2024 3:12:40 AM' }],
                ['RealTimeProtectionEnabled', 'IsTamperProtected', 'AntivirusSignatureLastUpdated'], ['RealTimeProtectionEnabled', 'IsTamperProtected', 'AntivirusSignatureLastUpdated']);
            o.forceList = true; return o;
        };
    }

    module.exports = { install: install, ADAPTER: ADAPTER };
})();
