/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-fs.js — NTFS folders, ACLs, inheritance, and effective access (local and over a share).
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, rows 4.4 and 5.3, R3 caps.
 *
 * RIGHTS ARE A BITSET, so "effective access" is computed, never looked up: R read, X list/execute,
 * W write, D delete, P change permissions, O take ownership. Read = R, Read & execute = RX,
 * Modify = RXWD, Full control = RXWDPO. A principal's effective access on a folder is the union of
 * the Allow ACEs for every SID the principal carries (the account, every local group that contains
 * it, Users, Authenticated Users, Everyone), minus the union of the Deny ACEs. Over SMB it is that,
 * intersected with the share permission the same SIDs earn. This is Windows' model with the two
 * declared simplifications below.
 *
 * DECLARED SIMPLIFICATIONS: folders only (files inherit their folder); no ACE ordering beyond
 * "explicit before inherited, deny before allow" (which Windows canonical order already implies);
 * no CREATOR OWNER expansion; ownership is not modelled.
 *
 * Paths are canonical: upper-case drive letter, backslashes, no trailing slash, case-insensitive
 * comparison (NTFS). A path key is the upper-cased canonical path.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var LIM = require('./mdfinal-limits.js');
    var OBJ = LIM.LIMITS.objects;
    var freeze = LIM.deepFreeze;

    var BITS = freeze({ R: 1, X: 2, W: 4, D: 8, P: 16, O: 32 });
    var RIGHTS = freeze({ Read: 1, ReadAndExecute: 3, Write: 4, Modify: 15, FullControl: 63 });
    /* icacls simple rights */
    var ICACLS = freeze({ R: 1, X: 2, RX: 3, W: 4, M: 15, F: 63, D: 8 });
    /* Share permissions */
    var SHARE = freeze({ Read: 3, Change: 15, Full: 63 });

    /* Well-known SIDs every interactive or network user carries. */
    var IMPLICIT = freeze(['Everyone', 'Authenticated Users']);

    /* Default ACL of the root of a newly formatted NTFS data volume. */
    function defaultRootAcl() {
        return [
            { principal: 'Administrators', mask: 63, type: 'Allow', inherited: false },
            { principal: 'SYSTEM', mask: 63, type: 'Allow', inherited: false },
            { principal: 'Users', mask: 3, type: 'Allow', inherited: false },
            { principal: 'Authenticated Users', mask: 15, type: 'Allow', inherited: false }
        ];
    }

    /* Canonical path, or null: X:\ or X:\a\b (no ., .., device names, or reserved characters). */
    function canon(raw) {
        var s = String(raw || '').trim().split('/').join('\\');
        if (s.length < 2 || s[1] !== ':') { return null; }
        var letter = s[0].toUpperCase();
        if (letter < 'A' || letter > 'Z') { return null; }
        var parts = s.slice(2).split('\\').filter(function (x) { return x.length; });
        var bad = '<>:"|?*';
        for (var i = 0; i < parts.length; i++) {
            var p = parts[i];
            if (p === '.' || p === '..' || p.length > 64) { return null; }
            for (var j = 0; j < p.length; j++) { if (bad.indexOf(p[j]) >= 0 || p.charCodeAt(j) < 32) { return null; } }
            if (p[p.length - 1] === '.' || p[p.length - 1] === ' ') { return null; }
        }
        if (parts.length > 8) { return null; }
        return letter + ':\\' + parts.join('\\');
    }
    /* Lookup key for a canonical path (NTFS paths are case-insensitive). */
    function key(path) { return path.toUpperCase(); }
    /* The parent folder of a canonical path, or null for a volume root. */
    function parentOf(path) {
        var i = path.lastIndexOf('\\');
        if (i <= 2) { return path.length > 3 ? path.slice(0, 3) : null; }
        return path.slice(0, i);
    }

    /* The file-system store, created on first use. Volumes are registered by the disk model. */
    function fs(state) {
        if (!state.fs) { state.fs = { volumes: {}, count: 0 }; }
        return state.fs;
    }

    /* Registers a freshly formatted NTFS volume (its root gets the default ACL). */
    function mountVolume(state, letter) {
        var f = fs(state);
        var root = letter.toUpperCase() + ':\\';
        f.volumes[letter.toUpperCase()] = { folders: {} };
        f.volumes[letter.toUpperCase()].folders[key(root)] = { path: root, acl: defaultRootAcl(), protect: false };
        return true;
    }
    /* Forgets a volume (delete or reformat). */
    function unmountVolume(state, letter) {
        var f = fs(state), L = String(letter).toUpperCase();
        if (f.volumes[L]) { f.count -= Object.keys(f.volumes[L].folders).length - 1; delete f.volumes[L]; }
    }

    /* The stored folder record for a path, or null when it does not exist. */
    function folder(state, path) {
        var c = canon(path);
        if (!c) { return null; }
        var v = fs(state).volumes[c[0]];
        if (!v) { return null; }
        return Object.prototype.hasOwnProperty.call(v.folders, key(c)) ? v.folders[key(c)] : null;
    }

    /* New-Item -ItemType Directory, mkdir, Explorer New folder. `-Force`/mkdir create parents. */
    function mkdir(state, raw, parents) {
        var c = canon(raw);
        if (!c) { return { ok: false, msg: 'The filename, directory name, or volume label syntax is incorrect.' }; }
        var v = fs(state).volumes[c[0]];
        if (!v) { return { ok: false, msg: 'The system cannot find the drive specified.' }; }
        if (folder(state, c)) { return { ok: false, msg: 'A subdirectory or file ' + c + ' already exists.' }; }
        var chain = [], p = c;
        while (p && !folder(state, p)) { chain.unshift(p); p = parentOf(p); }
        if (chain.length > 1 && !parents) { return { ok: false, msg: 'The system cannot find the path specified.' }; }
        if (fs(state).count + chain.length > OBJ.aclPaths) { return { ok: false, msg: LIM.STORAGE_MESSAGE }; }
        chain.forEach(function (x) { v.folders[key(x)] = { path: x, acl: [], protect: false }; fs(state).count++; });
        return { ok: true, msg: '' };
    }

    /* The ACL as Windows shows it: explicit ACEs, then (unless protected) everything inherited
     * from the parent chain, marked inherited. */
    function effectiveAcl(state, path) {
        var c = canon(path), f = folder(state, c);
        if (!f) { return null; }
        var own = f.acl.slice();
        if (f.protect) { return own; }
        var parent = parentOf(c);
        if (!parent) { return own; }
        var up = effectiveAcl(state, parent) || [];
        return own.concat(up.map(function (a) { return { principal: a.principal, mask: a.mask, type: a.type, inherited: true }; }));
    }

    /* Disable inheritance: 'convert' copies the inherited ACEs in as explicit; 'remove' drops them. */
    function disableInheritance(state, path, mode) {
        var c = canon(path), f = folder(state, c);
        if (!f) { return { ok: false, msg: 'The system cannot find the file specified.' }; }
        if (f.protect) { return { ok: true, msg: '' }; }
        if (mode === 'convert') {
            var inh = (effectiveAcl(state, c) || []).filter(function (a) { return a.inherited; });
            f.acl = f.acl.concat(inh.map(function (a) { return { principal: a.principal, mask: a.mask, type: a.type, inherited: false }; }));
        }
        if (mode !== 'convert' && mode !== 'remove') { return { ok: false, msg: 'Invalid parameter.' }; }
        f.protect = true;
        return { ok: true, msg: '' };
    }

    /* Re-enable inheritance (icacls /inheritance:e). */
    function enableInheritance(state, path) {
        var f = folder(state, path);
        if (!f) { return { ok: false, msg: 'The system cannot find the file specified.' }; }
        f.protect = false;
        return { ok: true, msg: '' };
    }

    /* Grant, deny or remove one principal's explicit entries. `mask` is a bitset. */
    function setAce(state, path, principal, mask, type) {
        var f = folder(state, path);
        if (!f) { return { ok: false, msg: 'The system cannot find the file specified.' }; }
        if (f.acl.length >= OBJ.acesPerPath) { return { ok: false, msg: LIM.STORAGE_MESSAGE }; }
        var p = String(principal);
        var existing = f.acl.filter(function (a) { return a.principal.toLowerCase() === p.toLowerCase() && a.type === type; })[0];
        if (existing) { existing.mask = existing.mask | mask; } else { f.acl.push({ principal: p, mask: mask, type: type, inherited: false }); }
        return { ok: true, msg: '' };
    }
    /* icacls /remove[:g|:d] <principal>: drops that principal's explicit ACEs (inherited ones stay). */
    function removeAces(state, path, principal, type) {
        var f = folder(state, path);
        if (!f) { return { ok: false, msg: 'The system cannot find the file specified.' }; }
        var p = String(principal).toLowerCase();
        f.acl = f.acl.filter(function (a) { return !(a.principal.toLowerCase() === p && (!type || a.type === type)); });
        return { ok: true, msg: '' };
    }

    /* Every SID name a local account carries: itself, its local groups, and the implicit ones. */
    function sidsOf(state, account) {
        var id = state.identity, n = String(account).toLowerCase();
        var out = [String(account)].concat(IMPLICIT);
        var isGroup = Object.keys(id.groups).some(function (g) { return g.toLowerCase() === n; });
        if (isGroup) { return out; }
        Object.keys(id.groups).forEach(function (g) {
            if (id.groups[g].members.some(function (m) { return m.toLowerCase() === n; })) { out.push(g); }
        });
        return out;
    }

    /* Effective NTFS mask for a principal on a folder. For a group, its members' view is the
     * group's own entries plus the implicit ones (what a member who is in no other group gets). */
    function effectiveMask(state, path, principal) {
        var acl = effectiveAcl(state, path);
        if (!acl) { return 0; }
        var sids = sidsOf(state, principal).map(function (x) { return x.toLowerCase(); });
        var allow = 0, deny = 0;
        acl.forEach(function (a) {
            if (sids.indexOf(a.principal.toLowerCase()) < 0) { return; }
            if (a.type === 'Deny') { deny = deny | a.mask; } else { allow = allow | a.mask; }
        });
        return allow & ~deny & 63;
    }

    /* What a member of `group` gets: the group plus Users, Authenticated Users and Everyone, which
     * every local member carries (Nancy D4 A1: a group's own SIDs alone miss a Deny on Users). */
    function memberSids(group) { return [String(group), 'Users', 'Authenticated Users', 'Everyone']; }
    function maskFor(acl, sids) {
        var lower = sids.map(function (x) { return x.toLowerCase(); });
        var allow = 0, deny = 0;
        acl.forEach(function (a) {
            if (lower.indexOf(a.principal.toLowerCase()) < 0) { return; }
            if (a.type === 'Deny') { deny = deny | a.mask; } else { allow = allow | a.mask; }
        });
        return allow & ~deny & 63;
    }
    /* Effective NTFS mask for a representative member of a local group. */
    function memberMask(state, path, group) {
        var acl = effectiveAcl(state, path);
        return acl ? maskFor(acl, memberSids(group)) : 0;
    }
    /* Effective network access for a representative member of a group: share AND NTFS. */
    function memberNetworkMask(state, share, group) {
        var perms = share.perms.map(function (p) { return { principal: p.principal, mask: SHARE[p.right], type: p.type }; });
        return maskFor(perms, memberSids(group)) & memberMask(state, share.path, group);
    }

    /* Mask a principal gets from a share's permission list. */
    function shareMask(state, share, principal) {
        var sids = sidsOf(state, principal).map(function (x) { return x.toLowerCase(); });
        var allow = 0, deny = 0;
        share.perms.forEach(function (p) {
            if (sids.indexOf(p.principal.toLowerCase()) < 0) { return; }
            if (p.type === 'Deny') { deny = deny | SHARE[p.right]; } else { allow = allow | SHARE[p.right]; }
        });
        return allow & ~deny & 63;
    }

    /* The name Windows shows for a mask ('' when it is none of the standard sets). */
    function rightsName(mask) {
        var names = Object.keys(RIGHTS);
        for (var i = names.length - 1; i >= 0; i--) { if (RIGHTS[names[i]] === mask) { return names[i]; } }
        return mask === 0 ? 'None' : 'Special';
    }

    module.exports = {
        BITS: BITS, RIGHTS: RIGHTS, ICACLS: ICACLS, SHARE: SHARE, IMPLICIT: IMPLICIT,
        canon: canon, parentOf: parentOf, mountVolume: mountVolume, unmountVolume: unmountVolume, folder: folder, mkdir: mkdir,
        effectiveAcl: effectiveAcl, disableInheritance: disableInheritance, enableInheritance: enableInheritance,
        setAce: setAce, removeAces: removeAces, sidsOf: sidsOf, effectiveMask: effectiveMask, shareMask: shareMask,
        rightsName: rightsName, defaultRootAcl: defaultRootAcl,
        memberMask: memberMask, memberNetworkMask: memberNetworkMask, memberSids: memberSids
    };
})();
