/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-os.js — Windows settings once the desktop exists: P2 post-install and P3 identity.
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, 2.2 (realism, reboot
 * semantics), 3.3 rows 2.1-3.3, 13.5 item 2 (domain-join default groups), 13.8.
 *
 * Same contract as mdfinal-pc.js: pure operations over server state, each returning { ok, msg },
 * each shared by the GUI action table and the consoles, each appending server-text-only ledger
 * evidence. Changes that Windows applies at restart (rename, join, cumulative update, EnableLUA)
 * are staged and only become effective through pc.boot()/applyPending, so a check that reads the
 * effective value sees exactly what a technician would see after the restart.
 *
 * WHAT IT READS FROM state.wo: only lab environment facts the student was handed as such: the
 * cumulative update the lab's update source publishes, and the Meridian DNS servers that make the
 * domain reachable. Never a target value used to decide whether the student was right.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var crypto = require('crypto');
    var LIM = require('./mdfinal-limits.js');
    var PC = require('./mdfinal-pc.js');
    var NF = require('../netfinal/netfinal-core.js');

    var own = NF.own;
    var freeze = LIM.deepFreeze;
    var OBJ = LIM.LIMITS.objects;

    function ok(msg) { return { ok: true, msg: msg || '' }; }
    function fail(msg) { return { ok: false, msg: msg }; }
    function desktop(state) { return PC.onDesktop(state); }
    var NOT_RUNNING = 'Windows is not running.';

    /* ═══ TIME ZONES (Windows ids, as tzutil /l lists them) ═══════════════════════════════════ */

    var TIME_ZONES = freeze([
        { id: 'Hawaiian Standard Time', display: '(UTC-10:00) Hawaii' },
        { id: 'Alaskan Standard Time', display: '(UTC-09:00) Alaska' },
        { id: 'Pacific Standard Time', display: '(UTC-08:00) Pacific Time (US & Canada)' },
        { id: 'US Mountain Standard Time', display: '(UTC-07:00) Arizona' },
        { id: 'Mountain Standard Time', display: '(UTC-07:00) Mountain Time (US & Canada)' },
        { id: 'Central Standard Time', display: '(UTC-06:00) Central Time (US & Canada)' },
        { id: 'Eastern Standard Time', display: '(UTC-05:00) Eastern Time (US & Canada)' },
        { id: 'Atlantic Standard Time', display: '(UTC-04:00) Atlantic Time (Canada)' },
        { id: 'UTC', display: '(UTC) Coordinated Universal Time' },
        { id: 'GMT Standard Time', display: '(UTC+00:00) Dublin, Edinburgh, Lisbon, London' }
    ]);

    /* Case-insensitive id lookup; returns the canonical id or null. */
    function tzId(raw) {
        var s = String(raw || '').trim().toLowerCase();
        for (var i = 0; i < TIME_ZONES.length; i++) { if (TIME_ZONES[i].id.toLowerCase() === s) { return TIME_ZONES[i].id; } }
        return null;
    }

    /* Settings > Time & language, tzutil /s, Set-TimeZone -Id. Takes effect at once. */
    function setTimeZone(state, raw) {
        if (!desktop(state)) { return fail(NOT_RUNNING); }
        var id = tzId(raw);
        if (!id) { return fail('Invalid time zone ID.'); }
        if (state.os.timeZone === id) { return ok(''); }
        state.os.timeZone = id;
        PC.ledger(state, 'timezone', '');
        return ok('');
    }

    /* ═══ RENAME AND RESTART ═══════════════════════════════════════════════════════════════════ */

    /* Settings > System > About > Rename this PC, Rename-Computer. Effective after a restart. */
    function rename(state, raw) {
        if (!desktop(state)) { return fail(NOT_RUNNING); }
        var name = String(raw || '').trim();
        if (!PC.validHostname(name)) { return fail(PC.MSG.hostnameBad); }
        var up = name.toUpperCase();
        if (up === state.os.hostname.effective && !state.os.hostname.pending) {
            return fail("Skip computer rename operation because the new computer name is the same as the current name.");
        }
        state.os.hostname.pending = up === state.os.hostname.effective ? null : up;
        PC.ledger(state, 'rename', '');
        return ok('WARNING: The changes will take effect after you restart the computer ' + state.os.hostname.effective + '.');
    }

    /* ═══ WINDOWS UPDATE ═══════════════════════════════════════════════════════════════════════ */

    /* The lab's update source publishes one cumulative update (the WO's KB-A). Its revision raises
     * the build revision when the restart completes. */
    function labCu(state) {
        var kb = state.wo.updates.cumulativeKb;
        var n = Number(kb.slice(2));
        return { kb: kb, title: '2026-11 Cumulative Update for Windows 11 Version 24H2 for x64-based Systems (' + kb + ')',
                 revision: 2000 + (n % 1000) };
    }

    /* True when the update is installed or waiting for its restart. */
    function haveUpdate(state, kb) {
        var u = state.os.updates;
        return u.history.some(function (x) { return x.kb === kb; }) || u.pendingRestart.some(function (x) { return x.kb === kb; });
    }

    /* Settings > Windows Update > Check for updates. */
    function checkUpdates(state) {
        if (!desktop(state)) { return fail(NOT_RUNNING); }
        if (state.os.os !== 'Windows 11') { return ok("You're up to date"); }
        state.os.updates.checked = true;
        var cu = labCu(state);
        return ok(haveUpdate(state, cu.kb) ? "You're up to date" : 'Updates available: ' + cu.title);
    }

    /* Download & install. The update is staged; Windows says "Restart required". */
    function installUpdates(state) {
        if (!desktop(state)) { return fail(NOT_RUNNING); }
        var u = state.os.updates;
        if (!u.checked) { return fail('Check for updates first.'); }
        var cu = labCu(state);
        if (state.os.os !== 'Windows 11' || haveUpdate(state, cu.kb)) { return ok("You're up to date"); }
        u.pendingRestart.push({ kb: cu.kb, title: cu.title, revision: cu.revision, status: 'Pending restart' });
        PC.ledger(state, 'cu-install', '');
        return ok('Restart required. Your device will restart outside active hours.');
    }

    /* Get-HotFix rows (installed only). */
    function hotfixes(state) {
        return state.os.updates.history.map(function (x) {
            return { Source: state.os.hostname.effective, Description: 'Update', HotFixID: x.kb, InstalledBy: 'NT AUTHORITY\\SYSTEM' };
        });
    }

    /* ═══ POWER ════════════════════════════════════════════════════════════════════════════════ */

    /* A plan by GUID, by name, or by powercfg alias (SCHEME_BALANCED/MIN/MAX), or null. */
    function planBy(state, ref) {
        var r = String(ref || '').trim().toLowerCase();
        if (r === 'scheme_balanced') { r = '381b4222-f694-41f0-9685-ff5bb260df2e'; }
        if (r === 'scheme_min') { r = '8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c'; }
        if (r === 'scheme_max') { r = 'a1841308-3542-4fea-9a33-1dbe19d7f2ab'; }
        var plans = state.os.power.plans;
        for (var i = 0; i < plans.length; i++) {
            if (plans[i].guid === r || plans[i].name.toLowerCase() === r) { return plans[i]; }
        }
        return null;
    }
    /* The plan currently active. */
    function activePlan(state) { return planBy(state, state.os.power.active); }

    /* A deterministic GUID for the nth plan this sitting creates. */
    function newGuid(state) {
        var n = ++state.os.power.created;
        var h = crypto.createHash('sha256').update(JSON.stringify(['power-plan', state.meta.studentId, state.meta.examId, n])).digest('hex');
        return h.slice(0, 8) + '-' + h.slice(8, 12) + '-4' + h.slice(13, 16) + '-a' + h.slice(17, 20) + '-' + h.slice(20, 32);
    }

    var PLAN_CAP = 10;

    /* Control Panel > Power Options > Create a power plan: name, based on a plan, "Turn off the
     * display" (plugged in). The new plan becomes active, as the wizard makes it. */
    function createPlan(state, p) {
        if (!desktop(state)) { return fail(NOT_RUNNING); }
        var base = planBy(state, p.basedOn || 'Balanced');
        if (!base) { return fail('The power scheme, subgroup or setting specified does not exist.'); }
        var name = String(p.name || '').trim();
        if (!name || name.length > 64) { return fail('Enter a plan name.'); }
        if (state.os.power.plans.length >= PLAN_CAP) { return fail('You have reached the maximum number of power plans.'); }
        var plan = { guid: newGuid(state), name: name, builtin: false,
                     ac: { display: base.ac.display, sleep: base.ac.sleep }, dc: { display: base.dc.display, sleep: base.dc.sleep } };
        if (p.acDisplay !== undefined) { plan.ac.display = Number(p.acDisplay); }
        state.os.power.plans.push(plan);
        state.os.power.active = plan.guid;
        PC.ledger(state, 'power-create', '');
        return ok('');
    }

    /* powercfg /duplicatescheme <guid>: a copy, not active. */
    function duplicatePlan(state, ref) {
        if (!desktop(state)) { return fail(NOT_RUNNING); }
        var base = planBy(state, ref);
        if (!base) { return fail('Unable to perform operation. An unexpected error (0x0) has occurred.'); }
        if (state.os.power.plans.length >= PLAN_CAP) { return fail('You have reached the maximum number of power plans.'); }
        var plan = JSON.parse(JSON.stringify(base));
        plan.guid = newGuid(state); plan.builtin = false;
        state.os.power.plans.push(plan);
        PC.ledger(state, 'power-duplicate', '');
        return ok('Power Scheme GUID: ' + plan.guid + '  (' + plan.name + ')');
    }

    /* powercfg /changename <guid> <name>. */
    function renamePlan(state, ref, raw) {
        if (!desktop(state)) { return fail(NOT_RUNNING); }
        var plan = planBy(state, ref);
        if (!plan) { return fail('Unable to perform operation. An unexpected error (0x0) has occurred.'); }
        var name = String(raw || '').trim();
        if (!name || name.length > 64) { return fail('Invalid Parameters -- try "/?" for help'); }
        plan.name = name;
        PC.ledger(state, 'power-rename', '');
        return ok('');
    }

    /* powercfg /setactive, Power Options radio button. */
    function setActive(state, ref) {
        if (!desktop(state)) { return fail(NOT_RUNNING); }
        var plan = planBy(state, ref);
        if (!plan) { return fail('Unable to perform operation. An unexpected error (0x0) has occurred.'); }
        state.os.power.active = plan.guid;
        PC.ledger(state, 'power-active', '');
        return ok('');
    }

    /* One timeout on one plan. `which` is display|sleep, `source` ac|dc, minutes 0..999 (0 = never). */
    function setTimeout_(state, ref, source, which, minutes) {
        if (!desktop(state)) { return fail(NOT_RUNNING); }
        var plan = ref === null ? activePlan(state) : planBy(state, ref);
        if (!plan) { return fail('Unable to perform operation. An unexpected error (0x0) has occurred.'); }
        var m = Number(minutes);
        if (!(m >= 0 && m <= 999) || Math.floor(m) !== m) { return fail('Invalid Parameters -- try "/?" for help'); }
        plan[source][which] = m;
        PC.ledger(state, 'power-' + source + '-' + which, '');
        return ok('');
    }

    /* Settings > System > Power & battery > Screen and sleep (active plan, plugged in only on a VM;
     * the guest offers no sleep control, see 13.8 item 2). */
    function screenTimeout(state, minutes) { return setTimeout_(state, null, 'ac', 'display', minutes); }

    /* Power Options > Change plan settings for one plan: "Turn off the display" (plugged in). */
    function editPlan(state, p) {
        if (p.acDisplay === undefined) { return fail('Nothing to change.'); }
        return setTimeout_(state, p.plan, 'ac', 'display', p.acDisplay);
    }

    /* ═══ LOCAL USERS AND GROUPS ═══════════════════════════════════════════════════════════════ */

    var BUILTIN_GROUPS = ['Administrators', 'Users', 'Guests', 'Remote Desktop Users'];

    /* User and group names: 1-20 characters, none of the reserved characters, not all dots/spaces. */
    /* Names that would address an object's prototype if used as a map key. Windows would accept
     * them; the exam refuses them on every create path (declared, 13.9). */
    var RESERVED_NAMES = ['__proto__', 'prototype', 'constructor'];

    function validAccountName(n) {
        if (typeof n !== 'string') { return false; }
        var s = n.trim();
        if (!s || s.length > 20) { return false; }
        if (RESERVED_NAMES.indexOf(s.toLowerCase()) >= 0) { return false; }
        var bad = '"/\\[]:;|=,+*?<>@';
        for (var i = 0; i < s.length; i++) { if (bad.indexOf(s[i]) >= 0) { return false; } }
        return s.replace(/[. ]/g, '').length > 0;
    }

    /* Finds an account or group key case-insensitively (Windows names are). */
    function findKey(map, name) {
        var n = String(name || '').trim().toLowerCase();
        var keys = Object.keys(map);
        for (var i = 0; i < keys.length; i++) { if (keys[i].toLowerCase() === n) { return keys[i]; } }
        return null;
    }

    /* The domain principals that exist in the lab's meridian.local (Mallory D3: invented names were accepted). */
    var DOMAIN_PRINCIPALS = ['Domain Admins', 'Domain Users', 'svc-wsjoin'];

    /* Resolves a member name (bare, .\\name, PC\\name or MERIDIAN\\name once joined) to the key
     * stored in a group's member list, or null when no such account exists. */
    function memberKey(state, raw) {
        var n = String(raw || '').trim();
        var cut = n.lastIndexOf('\\');
        var bare = cut >= 0 ? n.slice(cut + 1) : n;
        var prefix = cut >= 0 ? n.slice(0, cut).toUpperCase() : null;
        if (prefix && prefix !== state.os.hostname.effective && prefix !== '.') {
            if (prefix === 'MERIDIAN' && state.identity.membership.type === 'domain') {
                var known = DOMAIN_PRINCIPALS.filter(function (x) { return x.toLowerCase() === bare.toLowerCase(); })[0];
                return known ? 'MERIDIAN\\' + known : null;
            }
            return null;
        }
        var u = findKey(state.identity.users, bare);
        if (u) { return u; }
        var g = findKey(state.identity.groups, bare);
        return g;
    }

    /* lusrmgr > New User, New-LocalUser, net user /add. New users join Users. lusrmgr's default is
     * "User must change password at next logon" checked; New-LocalUser and net user leave it off. */
    function newUser(state, p) {
        if (!desktop(state)) { return fail(NOT_RUNNING); }
        var id = state.identity;
        var name = String(p.name || '').trim();
        if (!validAccountName(name)) { return fail('The user name or group name parameter is invalid.'); }
        if (findKey(id.users, name) || findKey(id.groups, name)) { return fail('The account already exists.'); }
        if (Object.keys(id.users).length >= OBJ.localUsers + 4) { return fail(LIM.STORAGE_MESSAGE); }
        if (p.password !== undefined && (typeof p.password !== 'string' || p.password.length > 127)) { return fail('The password does not meet the password policy requirements.'); }
        var mustChange = p.mustChange === undefined ? p.source === 'lusrmgr' : p.mustChange === true;
        var neverExpires = p.neverExpires === true;
        if (mustChange && neverExpires) { return fail('You have selected Password never expires. The user will not be required to change the password at next logon.'); }
        if (id.groups.Users.members.length >= OBJ.localUsers + 4) { return fail(LIM.STORAGE_MESSAGE); }
        id.users[name] = { enabled: p.disabled !== true, builtin: false, fullName: String(p.fullName || '').slice(0, 64),
                           mustChange: mustChange, neverExpires: neverExpires, cannotChange: p.cannotChange === true };
        id.groups.Users.members.push(name);
        PC.ledger(state, 'user-new', '');
        return ok('The command completed successfully.');
    }

    /* lusrmgr user properties, Set-LocalUser, net user <name> /active:no, wmic-free flags. */
    function setUser(state, p) {
        if (!desktop(state)) { return fail(NOT_RUNNING); }
        var k = findKey(state.identity.users, p.name);
        if (!k) { return fail('The user name could not be found.'); }
        var u = state.identity.users[k];
        var mustChange = p.mustChange === undefined ? u.mustChange : p.mustChange === true;
        var neverExpires = p.neverExpires === undefined ? u.neverExpires : p.neverExpires === true;
        if (mustChange && neverExpires) {
            if (p.mustChange === true) { return fail('You have selected Password never expires. The user will not be required to change the password at next logon.'); }
            mustChange = false;
        }
        u.mustChange = mustChange; u.neverExpires = neverExpires;
        if (p.cannotChange !== undefined) { u.cannotChange = p.cannotChange === true; }
        if (p.enabled !== undefined) { u.enabled = p.enabled === true; }
        if (p.fullName !== undefined) { u.fullName = String(p.fullName).slice(0, 64); }
        PC.ledger(state, u.builtin ? 'builtin-set' : 'user-set', '');
        return ok('The command completed successfully.');
    }

    /* lusrmgr > Delete, Remove-LocalUser, net user <name> /delete. Built-in accounts cannot be deleted. */
    function deleteUser(state, raw) {
        if (!desktop(state)) { return fail(NOT_RUNNING); }
        var k = findKey(state.identity.users, raw);
        if (!k) { return fail('The user name could not be found.'); }
        if (state.identity.users[k].builtin) { return fail('Cannot perform this operation on built-in accounts.'); }
        delete state.identity.users[k];
        Object.keys(state.identity.groups).forEach(function (g) {
            var m = state.identity.groups[g].members, i = m.indexOf(k);
            if (i >= 0) { m.splice(i, 1); }
        });
        PC.ledger(state, 'user-delete', '');
        return ok('The command completed successfully.');
    }

    /* lusrmgr > Delete group, Remove-LocalGroup, net localgroup <name> /delete. Built-in groups stay. */
    function deleteGroup(state, raw) {
        if (!desktop(state)) { return fail(NOT_RUNNING); }
        var g = findKey(state.identity.groups, raw);
        if (!g) { return fail('The specified local group does not exist.'); }
        if (BUILTIN_GROUPS.indexOf(g) >= 0) { return fail('Cannot perform this operation on built-in accounts.'); }
        delete state.identity.groups[g];
        PC.ledger(state, 'group-delete', '');
        return ok('The command completed successfully.');
    }

    /* lusrmgr > New Group, New-LocalGroup, net localgroup <name> /add. */
    function newGroup(state, p) {
        if (!desktop(state)) { return fail(NOT_RUNNING); }
        var id = state.identity;
        var name = String(p.name || '').trim();
        if (!validAccountName(name)) { return fail('The user name or group name parameter is invalid.'); }
        if (findKey(id.groups, name) || findKey(id.users, name)) { return fail('The account already exists.'); }
        if (Object.keys(id.groups).length >= OBJ.localGroups + BUILTIN_GROUPS.length) { return fail(LIM.STORAGE_MESSAGE); }
        id.groups[name] = { members: [], description: String(p.description || '').slice(0, 64) };
        PC.ledger(state, 'group-new', '');
        return ok('The command completed successfully.');
    }

    /* Add-LocalGroupMember, net localgroup <g> <m> /add, lusrmgr > Add to group. */
    function addMember(state, p) {
        if (!desktop(state)) { return fail(NOT_RUNNING); }
        var g = findKey(state.identity.groups, p.group);
        if (!g) { return fail('The specified local group does not exist.'); }
        var m = memberKey(state, p.member);
        if (!m) { return fail('No mapping between account names and security IDs was done.'); }
        /* Local groups cannot contain local groups (real Windows refuses; Mallory D3 F2). */
        if (m.indexOf('\\') < 0 && findKey(state.identity.groups, m)) {
            return fail('A new member could not be added to a local group because the member has the wrong account type.');
        }
        var list = state.identity.groups[g].members;
        if (list.indexOf(m) >= 0) { return fail('The specified account name is already a member of the group.'); }
        if (list.length >= OBJ.membersPerGroup + 2) { return fail(LIM.STORAGE_MESSAGE); }
        list.push(m);
        PC.ledger(state, 'member-add', g === 'Administrators' ? 'admins' : '');
        return ok('The command completed successfully.');
    }

    /* Remove-LocalGroupMember, net localgroup <g> <m> /delete. */
    function removeMember(state, p) {
        if (!desktop(state)) { return fail(NOT_RUNNING); }
        var g = findKey(state.identity.groups, p.group);
        if (!g) { return fail('The specified local group does not exist.'); }
        var m = memberKey(state, p.member);
        var list = state.identity.groups[g].members;
        if (!m || list.indexOf(m) < 0) { return fail('The specified account name is not a member of the group.'); }
        list.splice(list.indexOf(m), 1);
        PC.ledger(state, 'member-remove', '');
        return ok('The command completed successfully.');
    }

    /* ═══ UAC ══════════════════════════════════════════════════════════════════════════════════ */

    /* The four slider positions (top = Always notify), as the registry writes them. */
    var UAC_LEVELS = freeze({
        4: { ConsentPromptBehaviorAdmin: 2, PromptOnSecureDesktop: 1 },
        3: { ConsentPromptBehaviorAdmin: 5, PromptOnSecureDesktop: 1 },
        2: { ConsentPromptBehaviorAdmin: 5, PromptOnSecureDesktop: 0 },
        1: { ConsentPromptBehaviorAdmin: 0, PromptOnSecureDesktop: 0 }
    });

    /* Control Panel > User Account Control settings slider. */
    function setUacLevel(state, level) {
        if (!desktop(state)) { return fail(NOT_RUNNING); }
        var l = own(UAC_LEVELS, String(level));
        if (!l) { return fail('Select a level.'); }
        state.identity.uac.ConsentPromptBehaviorAdmin = l.ConsentPromptBehaviorAdmin;
        state.identity.uac.PromptOnSecureDesktop = l.PromptOnSecureDesktop;
        PC.ledger(state, 'uac', String(level));
        return ok('');
    }

    /* One UAC registry value (from mdfinal-registry.js). EnableLUA takes effect after a restart. */
    function setUacValue(state, name, value) {
        var u = state.identity.uac;
        if (name === 'ConsentPromptBehaviorAdmin') {
            if (!(value >= 0 && value <= 5)) { return fail('ERROR: Invalid value.'); }
            u.ConsentPromptBehaviorAdmin = value;
        } else if (name === 'PromptOnSecureDesktop') {
            if (value !== 0 && value !== 1) { return fail('ERROR: Invalid value.'); }
            u.PromptOnSecureDesktop = value;
        } else if (name === 'EnableLUA') {
            if (value !== 0 && value !== 1) { return fail('ERROR: Invalid value.'); }
            u.pendingEnableLUA = value === u.EnableLUA ? null : value;
        } else { return fail('ERROR: Invalid value.'); }
        PC.ledger(state, 'uac-reg', name);
        return ok('The operation completed successfully.');
    }

    /* ═══ DOMAIN AND WORKGROUP ═════════════════════════════════════════════════════════════════ */

    /* The join account and password are printed in the student brief (13.6 item 6). */
    var JOIN_ACCOUNTS = freeze(['meridian\\svc-wsjoin', 'svc-wsjoin@meridian.local', 'meridian.local\\svc-wsjoin']);
    var JOIN_PASSWORD = 'Meridian-Join-2026';
    var DOMAIN = 'meridian.local';

    /* Can this PC find a Meridian domain controller? Only through Meridian's DNS (the DCs). */
    function findsDc(state) {
        if (state.wo.join.type !== 'domain') { return false; }
        var dns = state.network.adapters.Ethernet.dns || [];
        return dns.some(function (d) { return state.wo.network.dns.indexOf(d) >= 0; });
    }

    /* System Properties > Computer Name > Change, Add-Computer. Effective after a restart. */
    function join(state, p) {
        if (!desktop(state)) { return fail(NOT_RUNNING); }
        var m = state.identity.membership;
        if (p.type === 'workgroup') {
            var raw = String(p.name || '').trim();
            if (!PC.validHostname(raw)) { return fail('The new workgroup name is not valid.'); }
            var wg = raw.toUpperCase();
            if (m.type === 'domain' || (m.pending && m.pending.type === 'domain')) {
                return fail('This exam lab does not model leaving the domain. Restart or reinstall instead.');
            }
            m.pending = wg === m.name ? null : { type: 'workgroup', name: wg };
            PC.ledger(state, 'join-workgroup', '');
            return ok('Welcome to the ' + wg + ' workgroup. You must restart this computer for the changes to take effect.');
        }
        if (p.type !== 'domain') { return fail('Select Domain or Workgroup.'); }
        if (PC.BUSINESS_EDITIONS.indexOf(state.os.edition) < 0) { return fail('This edition of Windows cannot join a domain.'); }
        var dom = String(p.name || '').trim().toLowerCase();
        if (dom !== DOMAIN && dom !== 'meridian') {
            return fail('The following error occurred attempting to join the domain "' + String(p.name || '').slice(0, 64) + '": The specified domain either does not exist or could not be contacted.');
        }
        if (!findsDc(state)) {
            PC.ledger(state, 'join-fail', 'dns');
            return fail('An Active Directory Domain Controller (AD DC) for the domain "meridian.local" could not be contacted.\n' +
                'Ensure that the domain name is typed correctly.');
        }
        if (JOIN_ACCOUNTS.indexOf(String(p.user || '').trim().toLowerCase()) < 0 || p.password !== JOIN_PASSWORD) {
            PC.ledger(state, 'join-fail', 'credentials');
            return fail('The following error occurred attempting to join the domain "meridian.local": The user name or password is incorrect.');
        }
        if (m.type === 'domain' && !m.pending) { return fail('The computer is already joined to the domain.'); }
        m.pending = { type: 'domain', name: DOMAIN };
        /* Joining adds the domain's default groups to the local groups (13.5 item 2). */
        var admins = state.identity.groups.Administrators.members, users = state.identity.groups.Users.members;
        if (admins.indexOf('MERIDIAN\\Domain Admins') < 0) { admins.push('MERIDIAN\\Domain Admins'); }
        if (users.indexOf('MERIDIAN\\Domain Users') < 0) { users.push('MERIDIAN\\Domain Users'); }
        PC.ledger(state, 'join-domain', '');
        return ok('Welcome to the meridian.local domain. You must restart this computer for the changes to take effect.');
    }

    /* ═══ IPv4 (Network Connections > Ethernet > IPv4 Properties) ═══════════════════════════════ */

    /* Parses a dotted quad, or null. */
    function ipInt(v) { var n = NF.ip.toInt(String(v || '').trim()); return n === null || n === undefined ? null : n; }

    /* "Obtain an IP address automatically" or a static address, and either DNS mode. Validation as
     * the dialog does it: well-formed addresses, a contiguous mask, a host address. The checks
     * (row 4.1, D4) read what this stores. */
    function setIpv4(state, p) {
        if (!desktop(state)) { return fail(NOT_RUNNING); }
        var e = state.network.adapters.Ethernet;
        var next = { dhcp: e.dhcp, ip: e.ip, prefix: e.prefix, gateway: e.gateway, dns: e.dns.slice(), dnsAuto: e.dnsAuto !== false };
        if (p.dhcp === true) {
            next.dhcp = true; next.ip = state.network.dhcpLease || e.ip; next.prefix = 20; next.gateway = '172.25.48.1';
        } else if (p.dhcp === false) {
            var ip = ipInt(p.ip), mask = ipInt(p.mask);
            if (ip === null) { return fail('The IP address you entered is not valid.'); }
            if (mask === null || NF.ip.prefixToMask(NF.ip.maskToPrefix(String(p.mask).trim())) !== String(p.mask).trim()) { return fail('The subnet mask you entered is not valid.'); }
            var prefix = NF.ip.maskToPrefix(String(p.mask).trim());
            if (prefix < 1 || prefix > 30) { return fail('The subnet mask you entered is not valid.'); }
            var net = NF.ip.networkOf(ip, prefix), bcast = net + Math.pow(2, 32 - prefix) - 1;
            if (ip === net || ip === bcast) { return fail('The combination of IP address and subnet mask is invalid. All of the bits in the host address portion of the IP address are set to 0 or 1.'); }
            if (p.gateway !== undefined && p.gateway !== '' && ipInt(p.gateway) === null) { return fail('The default gateway you entered is not valid.'); }
            if (!state.network.dhcpLease && e.dhcp) { state.network.dhcpLease = e.ip; }
            next.dhcp = false; next.ip = NF.ip.toStr(ip); next.prefix = prefix;
            next.gateway = p.gateway ? NF.ip.toStr(ipInt(p.gateway)) : null;
            next.dnsAuto = false;
        }
        /* automatic DNS needs an automatic address (the radio is greyed out on a static IP); it
         * used to report success and change nothing (Nancy R4 #9) */
        if (p.dnsAuto === true && !next.dhcp) { return fail('DNS server addresses can be obtained automatically only when the IP address is obtained automatically. Enter the DNS servers.'); }
        if (p.dnsAuto === true && next.dhcp) { next.dnsAuto = true; next.dns = ['172.25.48.1']; }
        else if (p.dns1 !== undefined || p.dns2 !== undefined) {
            var d = [p.dns1, p.dns2].filter(function (x) { return x !== undefined && x !== null && String(x).trim() !== ''; });
            for (var i = 0; i < d.length; i++) { if (ipInt(d[i]) === null) { return fail('The DNS server address you entered is not valid.'); } }
            next.dns = d.map(function (x) { return NF.ip.toStr(ipInt(x)); });
            next.dnsAuto = false;
        } else if (!next.dhcp && next.dnsAuto) {
            return fail('You must enter a preferred DNS server when the IP address is entered manually.');
        }
        e.dhcp = next.dhcp; e.ip = next.ip; e.prefix = next.prefix; e.gateway = next.gateway; e.dns = next.dns; e.dnsAuto = next.dnsAuto;
        PC.ledger(state, 'ipv4', next.dhcp ? 'dhcp' : 'static');
        return ok('');
    }

    module.exports = {
        setIpv4: setIpv4,
        TIME_ZONES: TIME_ZONES, UAC_LEVELS: UAC_LEVELS, JOIN_ACCOUNTS: JOIN_ACCOUNTS, JOIN_PASSWORD: JOIN_PASSWORD,
        DOMAIN: DOMAIN, PLAN_CAP: PLAN_CAP, BUILTIN_GROUPS: BUILTIN_GROUPS,
        tzId: tzId, setTimeZone: setTimeZone, rename: rename,
        labCu: labCu, checkUpdates: checkUpdates, installUpdates: installUpdates, hotfixes: hotfixes,
        planBy: planBy, activePlan: activePlan, createPlan: createPlan, duplicatePlan: duplicatePlan, renamePlan: renamePlan,
        setActive: setActive, setTimeout: setTimeout_, screenTimeout: screenTimeout, editPlan: editPlan,
        validAccountName: validAccountName, findKey: findKey, newUser: newUser, deleteUser: deleteUser, deleteGroup: deleteGroup,
        RESERVED_NAMES: RESERVED_NAMES, DOMAIN_PRINCIPALS: DOMAIN_PRINCIPALS, setUser: setUser, newGroup: newGroup,
        addMember: addMember, removeMember: removeMember,
        setUacLevel: setUacLevel, setUacValue: setUacValue, findsDc: findsDc, join: join
    };
})();
