/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-net.js — network category, Windows Defender Firewall, Remote Desktop, SMB shares, SMB1,
 * and Microsoft Defender Antivirus.
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, rows 4.2-4.4 and 5.4,
 * P4/P5 penalties (3.4), R3 caps.
 *
 * Same contract as mdfinal-os.js. Values a check compares are stored canonical: firewall
 * profiles as a sorted list, remote addresses as network/prefix, share principals case-folded on
 * comparison. Remote Desktop has ONE model, `os.policies.rdp` (the registry values the GUI also
 * writes), so the registry route and the System Properties route cannot disagree.
 *
 * REAL BEHAVIOUR KEPT: a domain-joined PC that can reach its DC is DomainAuthenticated and its
 * category cannot be set by hand; Advanced Sharing and New-SmbShare default to Everyone Read;
 * a share needs an existing folder; Tamper Protection (on by default) makes
 * Set-MpPreference -DisableRealtimeMonitoring report success and change nothing, while the
 * Windows Security toggle works.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var LIM = require('./mdfinal-limits.js');
    var PC = require('./mdfinal-pc.js');
    var OS = require('./mdfinal-os.js');
    var FS = require('./mdfinal-fs.js');
    var NF = require('../netfinal/netfinal-core.js');

    var OBJ = LIM.LIMITS.objects;
    var PROFILES = ['Domain', 'Private', 'Public'];
    var NOT_RUNNING = 'Windows is not running.';

    function ok(msg) { return { ok: true, msg: msg || '' }; }
    function fail(msg) { return { ok: false, msg: msg }; }

    /* Network, firewall, share and Defender state, created at their Windows defaults on first use. */
    function net(state) {
        var n = state.network;
        if (!n.firewall) {
            n.firewall = { profiles: { Domain: true, Private: true, Public: true }, rules: [] };
            n.shares = [];
            n.smb1 = false;
        }
        if (!state.defender) { state.defender = { realtime: true, tamper: true, sigUpdated: false, exclusions: [] }; }
        return n;
    }

    /* ═══ NETWORK CATEGORY ═════════════════════════════════════════════════════════════════════ */

    /* What Get-NetConnectionProfile reports: DomainAuthenticated once joined and the DC is
     * reachable, else the category the user chose (Public by default). */
    function category(state) {
        var m = state.identity.membership;
        if (m.type === 'domain' && !m.pending && OS.findsDc(state)) { return 'DomainAuthenticated'; }
        return state.network.category;
    }

    /* Settings > Network > Ethernet > Network profile type, Set-NetConnectionProfile. */
    function setCategory(state, raw) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var c = String(raw || '').trim().toLowerCase();
        var want = c === 'private' ? 'Private' : c === 'public' ? 'Public' : c === 'domainauthenticated' ? 'DomainAuthenticated' : null;
        if (!want) { return fail("Cannot bind parameter 'NetworkCategory'. Specify Public or Private."); }
        if (want === 'DomainAuthenticated') { return fail("Unable to set NetworkCategory to 'DomainAuthenticated'. This NetworkCategory type will be set automatically when authenticated to a domain network."); }
        if (category(state) === 'DomainAuthenticated') { return fail('The network category of a domain network cannot be changed.'); }
        state.network.category = want;
        PC.ledger(state, 'net-category', want === 'Private' ? 'private' : 'public');
        return ok('');
    }

    /* ═══ FIREWALL ═════════════════════════════════════════════════════════════════════════════ */

    /* Profile list from "Domain,Private", ['Domain','Private'] or "Any"; sorted, or null. */
    function profiles(raw) {
        var list = Array.isArray(raw) ? raw : String(raw === undefined ? 'Any' : raw).split(',');
        var out = [];
        for (var i = 0; i < list.length; i++) {
            var p = String(list[i]).trim().toLowerCase();
            if (p === 'any' || p === 'all') { return PROFILES.slice(); }
            var hit = PROFILES.filter(function (x) { return x.toLowerCase() === p; })[0];
            if (!hit) { return null; }
            if (out.indexOf(hit) < 0) { out.push(hit); }
        }
        return out.length ? PROFILES.filter(function (x) { return out.indexOf(x) >= 0; }) : null;
    }

    /* One remote address: Any, LocalSubnet, an address, a.b.c.d/prefix or a.b.c.d/mask, canonical. */
    function remote(raw) {
        var s = String(raw || '').trim();
        var l = s.toLowerCase();
        if (l === 'any' || l === '*') { return 'Any'; }
        if (l === 'localsubnet') { return 'LocalSubnet'; }
        /* a-b address range (stored as typed, canonical dotted quads) */
        var dash = s.indexOf('-');
        if (dash > 0 && s.indexOf('/') < 0) {
            var lo = NF.ip.toInt(s.slice(0, dash)), hi = NF.ip.toInt(s.slice(dash + 1));
            if (lo === null || hi === null || lo === undefined || hi === undefined || lo > hi) { return null; }
            return NF.ip.toStr(lo) + '-' + NF.ip.toStr(hi);
        }
        var slash = s.indexOf('/');
        var ip = NF.ip.toInt(slash >= 0 ? s.slice(0, slash) : s);
        if (ip === null || ip === undefined) { return null; }
        if (slash < 0) { return NF.ip.toStr(ip) + '/32'; }
        var rest = s.slice(slash + 1), prefix;
        if (rest.indexOf('.') >= 0) {
            if (NF.ip.prefixToMask(NF.ip.maskToPrefix(rest)) !== rest) { return null; }
            prefix = NF.ip.maskToPrefix(rest);
        } else {
            prefix = Number(rest);
            if (!(prefix >= 0 && prefix <= 32) || Math.floor(prefix) !== prefix || !rest.length) { return null; }
        }
        return NF.ip.toStr(NF.ip.networkOf(ip, prefix)) + '/' + prefix;
    }
    /* A remote-address list, canonical and sorted; ['Any'] when any entry is Any; null if invalid. */
    function remotes(raw) {
        var list = Array.isArray(raw) ? raw : String(raw === undefined ? 'Any' : raw).split(',');
        if (list.length > 16) { return null; }
        var out = [];
        for (var i = 0; i < list.length; i++) {
            var r = remote(list[i]);
            if (!r) { return null; }
            if (r === 'Any') { return ['Any']; }
            if (out.indexOf(r) < 0) { out.push(r); }
        }
        return out.sort();
    }

    /* Local ports "8443", "8443,9443", "8000-8100" or Any; returns the list as entered (validated). */
    function ports(raw) {
        var s = String(raw === undefined ? 'Any' : raw).trim();
        if (s.toLowerCase() === 'any') { return ['Any']; }
        var parts = s.split(',');
        if (parts.length > 16) { return null; }
        var out = [];
        for (var i = 0; i < parts.length; i++) {
            var p = parts[i].trim(), dash = p.indexOf('-');
            var nums = dash > 0 ? [p.slice(0, dash), p.slice(dash + 1)] : [p];
            for (var j = 0; j < nums.length; j++) {
                var n = Number(nums[j]);
                if (!nums[j].length || !(n >= 1 && n <= 65535) || Math.floor(n) !== n) { return null; }
            }
            out.push(p);
        }
        return out;
    }

    /* True when a rule's port list covers this port. */
    function coversPort(rule, port) {
        return rule.localPort.some(function (p) {
            if (p === 'Any') { return true; }
            var dash = p.indexOf('-');
            if (dash > 0) { return port >= Number(p.slice(0, dash)) && port <= Number(p.slice(dash + 1)); }
            return Number(p) === port;
        });
    }

    /* Inbound/Outbound Rules > New Rule, New-NetFirewallRule, netsh advfirewall firewall add rule. */
    function newRule(state, p) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var n = net(state);
        if (n.firewall.rules.length >= OBJ.firewallRules) { return fail(LIM.STORAGE_MESSAGE); }
        var name = String(p.name || '').trim();
        if (!name || name.length > 64) { return fail('A name is required.'); }
        var dir = String(p.direction || 'Inbound').toLowerCase().indexOf('out') === 0 ? 'Outbound' : 'Inbound';
        var act = String(p.action || 'Allow').toLowerCase() === 'block' ? 'Block' : 'Allow';
        var proto = String(p.protocol || 'Any').toUpperCase();
        if (['TCP', 'UDP', 'ANY'].indexOf(proto) < 0) { return fail('The protocol is not valid.'); }
        var lp = ports(p.localPort);
        if (!lp) { return fail('The port is invalid.'); }
        if (proto === 'ANY' && lp[0] !== 'Any') { return fail('Ports can only be specified for TCP or UDP.'); }
        var prof = profiles(p.profile);
        if (!prof) { return fail('The profile is invalid.'); }
        var rem = remotes(p.remoteAddress);
        if (!rem) { return fail('The address is invalid. Addresses may be specified as IPs, IP ranges, or subnets.'); }
        n.firewall.rules.push({ name: name, direction: dir, action: act, protocol: proto === 'ANY' ? 'Any' : proto, localPort: lp,
                                profiles: prof, remote: rem, enabled: p.enabled !== false });
        PC.ledger(state, 'fw-rule-new', dir === 'Inbound' ? 'in' : 'out');
        return ok('');
    }

    /* Every firewall rule with this display name (names are not unique in Windows). */
    function ruleByName(state, raw) {
        var nm = String(raw || '').trim().toLowerCase();
        return net(state).firewall.rules.filter(function (r) { return r.name.toLowerCase() === nm; });
    }

    /* Set-NetFirewallRule / rule Properties: profiles, remote address, enabled. Applies to every rule of that name. */
    function setRule(state, raw, p) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var rules = ruleByName(state, raw);
        if (!rules.length) { return fail('No MSFT_NetFirewallRule objects found with property \'DisplayName\' equal to \'' + String(raw).slice(0, 64) + '\'.'); }
        var prof = p.profile !== undefined ? profiles(p.profile) : null;
        if (p.profile !== undefined && !prof) { return fail('The profile is invalid.'); }
        var rem = p.remoteAddress !== undefined ? remotes(p.remoteAddress) : null;
        if (p.remoteAddress !== undefined && !rem) { return fail('The address is invalid.'); }
        var lp = p.localPort !== undefined ? ports(p.localPort) : null;
        if (p.localPort !== undefined && !lp) { return fail('The port is invalid.'); }
        rules.forEach(function (r) {
            if (prof) { r.profiles = prof; }
            if (rem) { r.remote = rem; }
            if (lp) { r.localPort = lp; }
            if (p.enabled !== undefined) { r.enabled = p.enabled === true; }
        });
        PC.ledger(state, 'fw-rule-set', '');
        return ok('');
    }

    /* Remove-NetFirewallRule / Delete. */
    function deleteRule(state, raw) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var rules = ruleByName(state, raw);
        if (!rules.length) { return fail('No MSFT_NetFirewallRule objects found with property \'DisplayName\' equal to \'' + String(raw).slice(0, 64) + '\'.'); }
        var n = net(state);
        n.firewall.rules = n.firewall.rules.filter(function (r) { return rules.indexOf(r) < 0; });
        PC.ledger(state, 'fw-rule-delete', '');
        return ok('');
    }

    /* Turn a firewall profile on or off (Set-NetFirewallProfile -Profile X -Enabled ...). */
    function setProfile(state, raw, on) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var prof = profiles(raw);
        if (!prof) { return fail('The profile is invalid.'); }
        var n = net(state);
        prof.forEach(function (p) { n.firewall.profiles[p] = on === true; });
        PC.ledger(state, on ? 'fw-profile-on' : 'fw-profile-off', '');
        return ok('');
    }

    /* ═══ REMOTE DESKTOP ═══════════════════════════════════════════════════════════════════════ */

    /* The single Remote Desktop model (the registry values), at its defaults on first use. */
    function rdp(state) {
        var pol = state.os.policies;
        if (!pol.rdp) { pol.rdp = { fDenyTSConnections: 1, UserAuthentication: 1 }; }
        return pol.rdp;
    }

    /* System Properties > Remote, Settings > Remote Desktop. Home cannot host Remote Desktop. */
    function setRemote(state, p) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        if (state.os.edition === 'Home' || state.os.edition === 'Home N') { return fail('Your Home edition of Windows 11 doesn\'t support Remote Desktop.'); }
        var r = rdp(state);
        if (p.enabled !== undefined) { r.fDenyTSConnections = p.enabled === true ? 0 : 1; }
        if (p.nla !== undefined) { r.UserAuthentication = p.nla === true ? 1 : 0; }
        PC.ledger(state, 'rdp-set', r.fDenyTSConnections === 0 ? 'on' : 'off');
        return ok('');
    }

    /* ═══ SHARES ═══════════════════════════════════════════════════════════════════════════════ */

    var RIGHTS = ['Read', 'Change', 'Full'];

    /* A principal name a share or ACL may name: a local account or group, a well-known group,
     * or a MERIDIAN principal once joined. Returns the stored spelling, or null. */
    function principal(state, raw) {
        var s = String(raw || '').trim();
        if (!s || s.length > 64) { return null; }
        var wk = ['Everyone', 'Authenticated Users', 'SYSTEM', 'CREATOR OWNER'];
        for (var i = 0; i < wk.length; i++) { if (wk[i].toLowerCase() === s.toLowerCase()) { return wk[i]; } }
        var cut = s.lastIndexOf('\\'), bare = cut >= 0 ? s.slice(cut + 1) : s, pre = cut >= 0 ? s.slice(0, cut).toUpperCase() : null;
        if (pre === 'MERIDIAN') { return state.identity.membership.type === 'domain' ? 'MERIDIAN\\' + bare : null; }
        if (pre && pre !== state.os.hostname.effective && pre !== 'BUILTIN' && pre !== 'NT AUTHORITY' && pre !== '.') { return null; }
        return OS.findKey(state.identity.users, bare) || OS.findKey(state.identity.groups, bare) ||
            (bare.toLowerCase() === 'system' ? 'SYSTEM' : null);
    }

    /* A share by name (case-insensitive), or null. */
    function shareByName(state, raw) {
        var nm = String(raw || '').trim().toLowerCase();
        return net(state).shares.filter(function (s) { return s.name.toLowerCase() === nm; })[0] || null;
    }

    /* Advanced Sharing > Share this folder, New-SmbShare, net share. Default permission Everyone Read. */
    function newShare(state, p) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var n = net(state);
        var name = String(p.name || '').trim();
        if (!name || name.length > 80 || name.indexOf('\\') >= 0 || name.indexOf('/') >= 0) { return fail('The share name is not valid.'); }
        if (shareByName(state, name)) { return fail('The name has already been shared.'); }
        if (n.shares.length >= OBJ.shares) { return fail(LIM.STORAGE_MESSAGE); }
        var path = FS.canon(p.path);
        if (!path || !FS.folder(state, path)) { return fail('The device or directory does not exist.'); }
        var perms = [];
        var grants = p.grants && p.grants.length ? p.grants : [{ principal: 'Everyone', right: 'Read' }];
        for (var i = 0; i < grants.length; i++) {
            var who = principal(state, grants[i].principal), right = grants[i].right;
            if (!who) { return fail('No mapping between account names and security IDs was done.'); }
            if (RIGHTS.indexOf(right) < 0) { return fail('The access right is not valid.'); }
            perms.push({ principal: who, right: right, type: 'Allow' });
        }
        n.shares.push({ name: name, path: path, perms: perms });
        PC.ledger(state, 'share-new', '');
        return ok('');
    }

    /* Share Permissions: add or change an Allow/Deny entry (Grant-SmbShareAccess / Block-SmbShareAccess). */
    function sharePermSet(state, shareName, raw, right, type) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var sh = shareByName(state, shareName);
        if (!sh) { return fail('No MSFT_SMBShare objects found with property \'Name\' equal to \'' + String(shareName).slice(0, 64) + '\'.'); }
        var who = principal(state, raw);
        if (!who) { return fail('No mapping between account names and security IDs was done.'); }
        if (RIGHTS.indexOf(right) < 0) { return fail('The access right is not valid.'); }
        sh.perms = sh.perms.filter(function (x) { return !(x.principal.toLowerCase() === who.toLowerCase() && x.type === (type || 'Allow')); });
        if (sh.perms.length >= OBJ.acesPerShare) { return fail(LIM.STORAGE_MESSAGE); }
        sh.perms.push({ principal: who, right: right, type: type || 'Allow' });
        PC.ledger(state, 'share-perm', '');
        return ok('');
    }

    /* Share Permissions: Remove (Revoke-SmbShareAccess removes Allow entries; Unblock removes Deny). */
    function sharePermRemove(state, shareName, raw, type) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var sh = shareByName(state, shareName);
        if (!sh) { return fail('No MSFT_SMBShare objects found with property \'Name\' equal to \'' + String(shareName).slice(0, 64) + '\'.'); }
        var who = principal(state, raw) || String(raw || '');
        var before = sh.perms.length;
        sh.perms = sh.perms.filter(function (x) { return !(x.principal.toLowerCase() === who.toLowerCase() && (!type || x.type === type)); });
        if (sh.perms.length === before) { return fail('The specified account is not on the share permission list.'); }
        PC.ledger(state, 'share-perm-remove', '');
        return ok('');
    }

    /* Stop sharing / Remove-SmbShare. */
    function removeShare(state, shareName) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var sh = shareByName(state, shareName);
        if (!sh) { return fail('The share name does not exist.'); }
        net(state).shares.splice(net(state).shares.indexOf(sh), 1);
        PC.ledger(state, 'share-remove', '');
        return ok('');
    }

    /* Windows Features > SMB 1.0/CIFS, Enable/Disable-WindowsOptionalFeature SMB1Protocol. */
    function setSmb1(state, on) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        net(state).smb1 = on === true;
        PC.ledger(state, on ? 'smb1-on' : 'smb1-off', '');
        return ok(on ? 'Restart required. (Restart is not required for this lab.)' : '');
    }

    /* ═══ DEFENDER ═════════════════════════════════════════════════════════════════════════════ */

    /* Windows Security > Virus & threat protection > Protection updates, Update-MpSignature. */
    function updateSignatures(state) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        net(state); state.defender.sigUpdated = true;
        PC.ledger(state, 'defender-update', '');
        return ok('Security intelligence is up to date.');
    }

    /* The Windows Security real-time toggle (works) vs Set-MpPreference (blocked by Tamper Protection). */
    function setRealtime(state, on, viaCmdlet) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        net(state);
        if (viaCmdlet && state.defender.tamper) { PC.ledger(state, 'defender-rt-blocked', ''); return ok(''); }
        state.defender.realtime = on === true;
        PC.ledger(state, on ? 'defender-rt-on' : 'defender-rt-off', '');
        return ok('');
    }

    /* Windows Security > Tamper Protection toggle. */
    function setTamper(state, on) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        net(state); state.defender.tamper = on === true;
        PC.ledger(state, 'defender-tamper', on ? 'on' : 'off');
        return ok('');
    }

    /* Exclusions > Add (Folder), Add-MpPreference -ExclusionPath. Stored canonical. */
    /* %ProgramData%, %SystemDrive%, %ProgramFiles% as Defender expands them. */
    function expandEnv(raw) {
        var s = String(raw || '');
        var map = { '%programdata%': 'C:\\ProgramData', '%systemdrive%': 'C:', '%programfiles%': 'C:\\Program Files', '%systemroot%': 'C:\\Windows' };
        Object.keys(map).forEach(function (k) { var i = s.toLowerCase().indexOf(k); if (i >= 0) { s = s.slice(0, i) + map[k] + s.slice(i + k.length); } });
        return s;
    }

    function addExclusion(state, raw) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        net(state);
        var c = FS.canon(expandEnv(raw));
        if (!c) { return fail('The path is not valid.'); }
        var ex = state.defender.exclusions;
        if (ex.some(function (x) { return x.toLowerCase() === c.toLowerCase(); })) { return ok(''); }
        if (ex.length >= OBJ.defenderExclusions) { return fail(LIM.STORAGE_MESSAGE); }
        ex.push(c);
        PC.ledger(state, 'defender-exclusion', '');
        return ok('');
    }

    /* Exclusions > Remove, Remove-MpPreference -ExclusionPath. */
    function removeExclusion(state, raw) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        net(state);
        var c = FS.canon(expandEnv(raw));
        var ex = state.defender.exclusions;
        var i = c ? ex.map(function (x) { return x.toLowerCase(); }).indexOf(c.toLowerCase()) : -1;
        if (i < 0) { return fail('The exclusion was not found.'); }
        ex.splice(i, 1);
        PC.ledger(state, 'defender-exclusion-remove', '');
        return ok('');
    }

    /* ═══ NTFS through Explorer, icacls and New-Item (desktop, principal-checked, ledgered) ═══ */

    /* New folder (Explorer), New-Item -ItemType Directory, mkdir. */
    function newFolder(state, path, parents) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var r = FS.mkdir(state, path, parents === true);
        if (r.ok) { PC.ledger(state, 'folder-new', ''); }
        return r;
    }

    /* Advanced Security > Disable inheritance (convert | remove), or re-enable it. */
    function ntfsInheritance(state, path, mode) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var r = mode === 'enable' ? FS.enableInheritance(state, path) : FS.disableInheritance(state, path, mode);
        if (r.ok) { PC.ledger(state, 'ntfs-inherit', mode === 'enable' ? 'on' : mode); }
        return r;
    }

    /* Security > Edit > Add/Allow or Deny one standard right set for a principal. */
    function ntfsGrant(state, path, who, rights, type) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var p = principal(state, who);
        if (!p) { return fail('No mapping between account names and security IDs was done.'); }
        var mask = Object.prototype.hasOwnProperty.call(FS.RIGHTS, rights) ? FS.RIGHTS[rights] : (typeof rights === 'number' ? rights : null);
        if (!mask || mask < 1 || mask > 63) { return fail('Invalid permission.'); }
        var r = FS.setAce(state, path, p, mask, type === 'Deny' ? 'Deny' : 'Allow');
        if (r.ok) { PC.ledger(state, 'ntfs-ace', type === 'Deny' ? 'deny' : 'allow'); }
        return r;
    }

    /* Security > Edit > Remove (explicit entries only; inherited ones need inheritance off first). */
    function ntfsRemove(state, path, who, type) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var f = FS.folder(state, path);
        if (!f) { return fail('The system cannot find the file specified.'); }
        var name = String(who || '').trim().toLowerCase();
        var acl = FS.effectiveAcl(state, path) || [];
        var hasExplicit = f.acl.some(function (a) { return a.principal.toLowerCase() === name; });
        var hasInherited = acl.some(function (a) { return a.inherited && a.principal.toLowerCase() === name; });
        if (!hasExplicit && hasInherited) { return fail("You can't remove " + String(who).slice(0, 40) + ' because this object is inheriting permissions from its parent. To remove it, you must first prevent this object from inheriting permissions.'); }
        var r = FS.removeAces(state, path, who, type);
        if (r.ok) { PC.ledger(state, 'ntfs-remove', ''); }
        return r;
    }

    module.exports = {
        newFolder: newFolder, ntfsInheritance: ntfsInheritance, ntfsGrant: ntfsGrant, ntfsRemove: ntfsRemove,
        PROFILES: PROFILES, RIGHTS: RIGHTS, net: net, category: category, setCategory: setCategory,
        profiles: profiles, remote: remote, remotes: remotes, ports: ports, coversPort: coversPort,
        newRule: newRule, setRule: setRule, deleteRule: deleteRule, setProfile: setProfile,
        rdp: rdp, setRemote: setRemote, principal: principal, shareByName: shareByName,
        newShare: newShare, sharePermSet: sharePermSet, sharePermRemove: sharePermRemove, removeShare: removeShare, setSmb1: setSmb1,
        updateSignatures: updateSignatures, setRealtime: setRealtime, setTamper: setTamper, addExclusion: addExclusion, removeExclusion: removeExclusion
    };
})();
