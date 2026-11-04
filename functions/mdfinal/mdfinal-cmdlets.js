/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-cmdlets.js — the desktop console's commands and its pipeline engine.
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, R4 (fixed projections,
 * budget), 13.4 (default-deny), rows 2.1-3.3.
 *
 * FIXED PROJECTIONS. Every producer (Get-LocalUser, Get-HotFix, ...) returns objects with a fixed
 * property set and a default view. Select-Object, Sort-Object, Where-Object and Format-* only ever
 * see that set, and `*`, Get-Member, ConvertTo-Json and Export-Clixml are refused, so no pipeline
 * can surface a field the exam did not decide to show. Where-Object takes the simple syntax only
 * (Prop -op value); its -like runs through mdfinal-match.js under the command's step budget, and
 * the regex operators are refused.
 *
 * Mutating commands run only as the FIRST stage (pipeline input binding is not modelled) and call
 * the same mdfinal-os.js / mdfinal-pc.js / mdfinal-registry.js operations as the GUI.
 *
 * run(state, stages, budget) -> { out, pending? }. `stages` is an array of token arrays. A command
 * that would prompt (New-LocalUser without a password, Add-Computer -Credential) returns `pending`;
 * the shell hands the next line to resume() without logging it.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var PC = require('./mdfinal-pc.js');
    var OS = require('./mdfinal-os.js');
    var REG = require('./mdfinal-registry.js');
    var M = require('./mdfinal-match.js');
    var LIM = require('./mdfinal-limits.js');

    var C = LIM.LIMITS.command;
    var DENY_MSG = 'This exam console does not support that expression.';
    var LIMIT_MSG = "Command exceeded the console's limits.";

    /* ═══ ARGUMENTS ════════════════════════════════════════════════════════════════════════════ */

    /* Named parameters (-Name value / -Name:value / -Switch), names lowercased, into a map with no
     * prototype, so no student-chosen name can reach Object.prototype. */
    /* "a, b" and "a ,b" are one list argument in PowerShell: re-join tokens around commas (Nancy D4 A3). */
    function joinCommas(tokens) {
        var out = [];
        for (var i = 0; i < tokens.length; i++) {
            var t = tokens[i];
            if (out.length && (out[out.length - 1].slice(-1) === ',' || (t[0] === ',' && t.length))) { out[out.length - 1] += t; }
            else { out.push(t); }
        }
        return out;
    }

    function args(raw) {
        var tokens = joinCommas(raw);
        var a = Object.create(null);
        a._ = [];
        for (var i = 1; i < tokens.length; i++) {
            var t = tokens[i];
            if (t.length > 1 && t[0] === '-' && isNaN(Number(t))) {
                var name = t.slice(1).toLowerCase();
                /* '_' is the positional list's own slot; a parameter can never take it (Mallory N1). */
                if (name === '_' || name.indexOf('_:') === 0) { continue; }
                var colon = name.indexOf(':');
                if (colon > 0) { a[name.slice(0, colon)] = t.slice(colon + 2); continue; }
                var next = tokens[i + 1];
                if (next !== undefined && !(next.length > 1 && next[0] === '-' && isNaN(Number(next)))) { a[name] = next; i++; }
                else { a[name] = true; }
            } else { a._.push(t); }
        }
        return a;
    }
    function has(a, k) { return Object.prototype.hasOwnProperty.call(a, k); }

    /* PowerShell boolean literal, or null. */
    function bool(v) {
        var s = String(v).toLowerCase();
        if (s === '$true' || s === 'true' || s === '1') { return true; }
        if (s === '$false' || s === 'false' || s === '0') { return false; }
        return null;
    }

    function notRecognised(cmd) {
        return cmd + " : The term '" + cmd + "' is not recognized as the name of a cmdlet, function, script file, or operable program.\n" +
            'Check the spelling of the name, or if a path was included, verify that the path is correct and try again.';
    }
    function missingArg(cmd, p) { return cmd + " : Missing an argument for parameter '" + p + "'. Specify a parameter of type 'System.String' and try again."; }

    /* ═══ OBJECTS AND FORMATTING ═══════════════════════════════════════════════════════════════ */

    /* A producer result: rows of plain objects, the fixed property set, the default view. */
    function objs(rows, all, view, title) { return { rows: rows, all: all, view: view || all, kind: 'objects', title: title }; }

    function cell(v) { return v === null || v === undefined ? '' : typeof v === 'boolean' ? (v ? 'True' : 'False') : String(v); }

    function table(rows, props) {
        if (!rows.length) { return ''; }
        var w = props.map(function (p) {
            return Math.min(40, Math.max(p.length, rows.reduce(function (m, r) { return Math.max(m, cell(r[p]).length); }, 0)));
        });
        var pad = function (s, n) { s = String(s); if (s.length > n) { return s.slice(0, n - 3) + '...'; } while (s.length < n) { s += ' '; } return s; };
        var lines = [props.map(function (p, i) { return pad(p, w[i]); }).join(' '), props.map(function (p, i) { return pad('-'.repeat(p.length), w[i]); }).join(' ')];
        rows.forEach(function (r) { lines.push(props.map(function (p, i) { return pad(cell(r[p]), w[i]); }).join(' ')); });
        return lines.map(function (l) { return l.trimEnd(); }).join('\n');
    }

    function list(rows, props) {
        var w = props.reduce(function (m, p) { return Math.max(m, p.length); }, 0);
        return rows.map(function (r) {
            return props.map(function (p) { var k = p; while (k.length < w) { k += ' '; } return k + ' : ' + cell(r[p]); }).join('\n');
        }).join('\n\n');
    }

    /* Default rendering of a pipeline's final value. */
    function render(v) {
        if (v === null || v === undefined) { return ''; }
        if (typeof v === 'string') { return v; }
        if (v.kind === 'values') { return v.values.map(cell).join('\n'); }
        if (v.kind === 'count') { return '\nCount    : ' + v.count + '\nAverage  :\nSum      :\nMaximum  :\nMinimum  :\nProperty :\n'; }
        if (v.kind === 'objects') { return v.view.length > 4 || v.forceList ? list(v.rows, v.view) : table(v.rows, v.view); }
        return '';
    }

    /* Resolves a requested property name against the fixed set (case-insensitive), or null. */
    function prop(v, name) {
        var n = String(name).toLowerCase();
        for (var i = 0; i < v.all.length; i++) { if (v.all[i].toLowerCase() === n) { return v.all[i]; } }
        return null;
    }
    function propList(v, raw) {
        var names = String(raw).split(',').map(function (x) { return x.trim(); }).filter(function (x) { return x.length; });
        if (!names.length || names.length > 16) { return null; }
        var out = [];
        for (var i = 0; i < names.length; i++) {
            if (names[i] === '*' || names[i].indexOf('*') >= 0 || names[i].indexOf('?') >= 0) { return 'wild'; }
            var p = prop(v, names[i]);
            if (!p) { return { bad: names[i] }; }
            out.push(p);
        }
        return out;
    }

    /* ═══ PIPELINE STAGES ══════════════════════════════════════════════════════════════════════ */

    var STAGES = {
        'select-object': function (v, a) {
            if (v.kind !== 'objects') { return 'Select-Object : The input object cannot be bound to any parameters for the command.'; }
            var rows = v.rows;
            if (has(a, 'first')) { var f = Number(a.first); if (!(f >= 0)) { return missingArg('Select-Object', 'First'); } rows = rows.slice(0, f); }
            if (has(a, 'last')) { var l = Number(a.last); if (!(l >= 0)) { return missingArg('Select-Object', 'Last'); } rows = rows.slice(Math.max(0, rows.length - l)); }
            var raw = has(a, 'expandproperty') ? a.expandproperty : has(a, 'property') ? a.property : a._.length ? a._.join(',') : null;
            if (raw === null) { return objs(rows, v.all, v.view); }
            var props = propList(v, raw);
            if (props === 'wild') { return DENY_MSG; }
            if (props === null) { return objs(rows, v.all, v.view); }
            if (props.bad) {
                /* PowerShell returns the objects with the unknown property empty. */
                var bad = String(props.bad).slice(0, 32);
                return objs(rows.map(function () { var o = Object.create(null); o[bad] = ''; return o; }), [bad], [bad]);
            }
            if (has(a, 'expandproperty')) {
                if (props.length !== 1) { return 'Select-Object : Cannot convert to System.String.'; }
                return { kind: 'values', values: rows.map(function (r) { return r[props[0]]; }) };
            }
            return objs(rows.map(function (r) { var o = {}; props.forEach(function (p) { o[p] = r[p]; }); return o; }), props, props);
        },
        'where-object': function (v, a, budget) {
            if (v.kind !== 'objects') { return 'Where-Object : The input object cannot be bound to any parameters for the command.'; }
            var opNames = ['eq', 'ne', 'like', 'notlike', 'gt', 'lt', 'ge', 'le'];
            var refused = ['match', 'notmatch', 'cmatch', 'imatch', 'cnotmatch', 'replace', 'split', 'filterscript'];
            for (var r = 0; r < refused.length; r++) { if (has(a, refused[r])) { return DENY_MSG; } }
            var p = a._[0] !== undefined ? prop(v, a._[0]) : has(a, 'property') ? prop(v, a.property) : null;
            var op = null;
            for (var i = 0; i < opNames.length; i++) { if (has(a, opNames[i])) { op = opNames[i]; } }
            if (!p || !op) { return 'Where-Object : This exam console accepts Where-Object <Property> -<eq|ne|like|notlike|gt|lt|ge|le> <Value>.'; }
            var want = a[op] === true ? (a._[1] !== undefined ? a._[1] : '') : a[op];
            var out = [];
            for (var j = 0; j < v.rows.length; j++) {
                var got = v.rows[j][p], keep;
                if (op === 'like' || op === 'notlike') {
                    var m = M.like(cell(got), want, budget);
                    if (!m.ok) { return LIMIT_MSG; }
                    keep = op === 'like' ? m.match : !m.match;
                } else if (op === 'eq' || op === 'ne') {
                    var target = typeof got === 'boolean' ? bool(want) : want;
                    var e = typeof got === 'boolean' ? { ok: M.charge(budget, 1), match: got === target } : M.equals(cell(got), cell(target), budget);
                    if (!e.ok) { return LIMIT_MSG; }
                    keep = op === 'eq' ? e.match : !e.match;
                } else {
                    if (!M.charge(budget, 1)) { return LIMIT_MSG; }
                    var x = Number(got), y = Number(want);
                    if (isNaN(x) || isNaN(y)) { keep = false; }
                    else { keep = op === 'gt' ? x > y : op === 'lt' ? x < y : op === 'ge' ? x >= y : x <= y; }
                }
                if (keep) { out.push(v.rows[j]); }
            }
            return objs(out, v.all, v.view);
        },
        'sort-object': function (v, a, budget) {
            if (v.kind !== 'objects') { return v; }
            var p = a._[0] !== undefined ? prop(v, a._[0]) : has(a, 'property') ? prop(v, a.property) : v.view[0];
            if (!p) { return objs(v.rows, v.all, v.view); }
            if (!M.charge(budget, v.rows.length * 8 + 1)) { return LIMIT_MSG; }
            var dir = has(a, 'descending') ? -1 : 1;
            var rows = v.rows.slice().sort(function (x, y) {
                var a1 = x[p], b1 = y[p];
                if (typeof a1 === 'number' && typeof b1 === 'number') { return (a1 - b1) * dir; }
                return cell(a1).toLowerCase() < cell(b1).toLowerCase() ? -dir : cell(a1).toLowerCase() > cell(b1).toLowerCase() ? dir : 0;
            });
            return objs(rows, v.all, v.view);
        },
        'format-table': function (v, a) {
            if (v.kind !== 'objects') { return render(v); }
            var raw = has(a, 'property') ? a.property : a._.length ? a._.join(',') : null;
            var props = raw === null ? v.view : propList(v, raw);
            if (props === 'wild') { return DENY_MSG; }
            if (!props || props.bad) { return table(v.rows, v.view); }
            return table(v.rows, props);
        },
        'format-list': function (v, a) {
            if (v.kind !== 'objects') { return render(v); }
            var raw = has(a, 'property') ? a.property : a._.length ? a._.join(',') : null;
            var props = raw === null ? v.view : propList(v, raw);
            if (props === 'wild') { return DENY_MSG; }
            if (!props || props.bad) { return list(v.rows, v.view); }
            return list(v.rows, props);
        },
        'measure-object': function (v) { return { kind: 'count', count: v.kind === 'objects' ? v.rows.length : v.kind === 'values' ? v.values.length : 0 }; }
    };
    STAGES.select = STAGES['select-object']; STAGES.where = STAGES['where-object']; STAGES.sort = STAGES['sort-object'];
    STAGES.ft = STAGES['format-table']; STAGES.fl = STAGES['format-list']; STAGES.measure = STAGES['measure-object'];

    /* Stages and cmdlets that exist in PowerShell but dump everything; refused (R4). */
    var DUMPERS = ['get-member', 'gm', 'convertto-json', 'export-clixml', 'convertto-xml', 'export-csv', 'convertto-csv', 'out-file', 'out-string', 'tee-object', 'format-custom', 'fc'];

    /* ═══ PRODUCERS (read-only cmdlets) ════════════════════════════════════════════════════════ */

    function userRow(state, name) {
        var u = state.identity.users[name];
        return { Name: name, Enabled: u.enabled === true, FullName: u.fullName || '', Description: u.builtin ? 'Built-in account' : '',
                 PasswordExpires: u.neverExpires || u.builtin ? '' : '12/17/2026 9:00:00 AM', UserMayChangePassword: !u.cannotChange,
                 PasswordRequired: !u.builtin, PrincipalSource: 'Local' };
    }

    var PRODUCERS = {
        'get-localuser': function (state, a) {
            var names = Object.keys(state.identity.users).sort(function (x, y) { return x.toLowerCase() < y.toLowerCase() ? -1 : 1; });
            if (has(a, 'name') || a._.length) {
                var k = OS.findKey(state.identity.users, has(a, 'name') ? a.name : a._[0]);
                if (!k) { return 'Get-LocalUser : User ' + String(has(a, 'name') ? a.name : a._[0]).slice(0, 40) + ' was not found.'; }
                names = [k];
            }
            return objs(names.map(function (n) { return userRow(state, n); }),
                ['Name', 'Enabled', 'FullName', 'Description', 'PasswordExpires', 'UserMayChangePassword', 'PasswordRequired', 'PrincipalSource'],
                ['Name', 'Enabled', 'Description']);
        },
        'get-localgroup': function (state, a) {
            var names = Object.keys(state.identity.groups);
            if (has(a, 'name') || a._.length) {
                var k = OS.findKey(state.identity.groups, has(a, 'name') ? a.name : a._[0]);
                if (!k) { return 'Get-LocalGroup : Group ' + String(has(a, 'name') ? a.name : a._[0]).slice(0, 40) + ' was not found.'; }
                names = [k];
            }
            return objs(names.map(function (n) { return { Name: n, Description: state.identity.groups[n].description || '', PrincipalSource: 'Local' }; }),
                ['Name', 'Description', 'PrincipalSource'], ['Name', 'Description']);
        },
        'get-localgroupmember': function (state, a) {
            var gname = has(a, 'group') ? a.group : has(a, 'name') ? a.name : a._[0];
            var g = OS.findKey(state.identity.groups, gname);
            if (!g) { return 'Get-LocalGroupMember : Group ' + String(gname || '').slice(0, 40) + ' was not found.'; }
            var host = state.os.hostname.effective;
            return objs(state.identity.groups[g].members.map(function (m) {
                var dom = m.indexOf('\\') >= 0;
                var isGroup = dom || !!OS.findKey(state.identity.groups, m);
                return { ObjectClass: isGroup ? 'Group' : 'User', Name: dom ? m : host + '\\' + m, PrincipalSource: dom ? 'ActiveDirectory' : 'Local' };
            }), ['ObjectClass', 'Name', 'PrincipalSource'], ['ObjectClass', 'Name', 'PrincipalSource']);
        },
        'get-timezone': function (state) {
            var tz = OS.TIME_ZONES.filter(function (z) { return z.id === state.os.timeZone; })[0];
            var o = objs([{ Id: tz.id, DisplayName: tz.display, StandardName: tz.id, SupportsDaylightSavingTime: tz.id !== 'US Mountain Standard Time' && tz.id !== 'UTC' }],
                ['Id', 'DisplayName', 'StandardName', 'SupportsDaylightSavingTime'], ['Id', 'DisplayName', 'StandardName', 'SupportsDaylightSavingTime']);
            o.forceList = true;
            return o;
        },
        'get-hotfix': function (state) {
            return objs(OS.hotfixes(state), ['Source', 'Description', 'HotFixID', 'InstalledBy'], ['Source', 'Description', 'HotFixID', 'InstalledBy']);
        },
        'get-ciminstance': function (state, a) {
            var cls = String(has(a, 'classname') ? a.classname : a._[0] || '').toLowerCase();
            if (cls !== 'win32_computersystem') { return 'Get-CimInstance : This exam console provides Win32_ComputerSystem.'; }
            var m = state.identity.membership;
            var o = objs([{ Name: state.os.hostname.effective, Domain: m.type === 'domain' ? m.name : 'WORKGROUP',
                Workgroup: m.type === 'workgroup' ? m.name : null, PartOfDomain: m.type === 'domain', Manufacturer: 'Microsoft Corporation', Model: 'Virtual Machine' }],
                ['Name', 'Domain', 'Workgroup', 'PartOfDomain', 'Manufacturer', 'Model'], ['Name', 'Domain', 'Manufacturer', 'Model']);
            return o;
        },
        'get-itemproperty': function (state, a) {
            var path = has(a, 'path') ? a.path : a._[0];
            var r = REG.read(state, path);
            if (!r) { return "Get-ItemProperty : Cannot find path '" + String(path || '').slice(0, 120) + "' because it does not exist."; }
            var vals = r.values;
            if (has(a, 'name')) {
                var n = String(a.name).toLowerCase();
                vals = vals.filter(function (x) { return x.name.toLowerCase() === n; });
                if (!vals.length) { return "Get-ItemProperty : Property " + String(a.name).slice(0, 64) + " does not exist at path " + r.key + '.'; }
            }
            var row = {}, props = [];
            vals.forEach(function (x) { row[x.name] = x.data; props.push(x.name); });
            var o = objs([row], props, props); o.forceList = true;
            return o;
        }
    };
    PRODUCERS['gcim'] = PRODUCERS['get-ciminstance'];
    PRODUCERS['gp'] = PRODUCERS['get-itemproperty'];

    /* ═══ COMMANDS THAT CHANGE STATE (first stage only) ════════════════════════════════════════ */

    function r2s(r) { return r.ok ? r.msg : r.msg; }

    /* Rename-Computer -NewName X [-Restart] [-Force]. */
    function renameComputer(state, a) {
        var n = has(a, 'newname') ? a.newname : a._[0];
        if (n === undefined || n === true) { return missingArg('Rename-Computer', 'NewName'); }
        var r = OS.rename(state, n);
        if (!r.ok) { return 'Rename-Computer : ' + r.msg; }
        if (has(a, 'restart')) { PC.restart(state); return ''; }
        return r.msg;
    }

    /* Add-Computer -DomainName d -Credential u [-Restart] | -WorkgroupName w [-Restart]. */
    function addComputer(state, a) {
        if (has(a, 'workgroupname')) {
            var r = OS.join(state, { type: 'workgroup', name: a.workgroupname });
            if (!r.ok) { return 'Add-Computer : ' + r.msg; }
            if (has(a, 'restart')) { PC.restart(state); return ''; }
            return 'WARNING: The changes will take effect after you restart the computer ' + state.os.hostname.effective + '.';
        }
        if (!has(a, 'domainname') || a.domainname === true) { return missingArg('Add-Computer', 'DomainName'); }
        if (!has(a, 'credential') || a.credential === true) {
            return 'Add-Computer : This exam console needs -Credential <user>; you will then be asked for the password.';
        }
        return { out: 'Windows PowerShell credential request.\nEnter your credentials.\nPassword for user ' + String(a.credential).slice(0, 64) + ': ',
                 pending: { kind: 'join', domain: String(a.domainname).slice(0, 64), user: String(a.credential).slice(0, 64), restart: has(a, 'restart'),
                            newName: has(a, 'newname') ? String(a.newname).slice(0, 64) : null } };
    }

    /* New-LocalUser -Name X [-NoPassword] [-FullName ...] [-PasswordNeverExpires] [-UserMayNotChangePassword]. */
    function newLocalUser(state, a) {
        var name = has(a, 'name') ? a.name : a._[0];
        if (name === undefined || name === true) { return missingArg('New-LocalUser', 'Name'); }
        var p = { name: String(name), fullName: has(a, 'fullname') ? String(a.fullname) : '', neverExpires: has(a, 'passwordneverexpires'),
                  cannotChange: has(a, 'usermaynotchangepassword'), disabled: has(a, 'disabled'), mustChange: false, source: 'ps' };
        if (has(a, 'nopassword')) { return newUserOut(state, p); }
        return { out: 'cmdlet New-LocalUser at command pipeline position 1\nSupply values for the following parameters:\nPassword: ', pending: { kind: 'newuser', p: p } };
    }
    function newUserOut(state, p) {
        var r = OS.newUser(state, p);
        if (!r.ok) { return 'New-LocalUser : ' + r.msg; }
        var k = OS.findKey(state.identity.users, p.name);
        return k ? table([userRow(state, k)], ['Name', 'Enabled', 'Description']) : '';
    }

    /* Set-LocalUser -Name X [-PasswordNeverExpires $bool] [-UserMayChangePassword $bool] [-FullName]. */
    function setLocalUser(state, a) {
        var name = has(a, 'name') ? a.name : a._[0];
        if (name === undefined || name === true) { return missingArg('Set-LocalUser', 'Name'); }
        var p = { name: String(name) };
        if (has(a, 'passwordneverexpires')) {
            var b = a.passwordneverexpires === true ? true : bool(a.passwordneverexpires);
            if (b === null) { return "Set-LocalUser : Cannot convert value to type System.Boolean."; }
            p.neverExpires = b;
        }
        if (has(a, 'usermaychangepassword')) {
            var c = a.usermaychangepassword === true ? true : bool(a.usermaychangepassword);
            if (c === null) { return "Set-LocalUser : Cannot convert value to type System.Boolean."; }
            p.cannotChange = !c;
        }
        if (has(a, 'fullname')) { p.fullName = String(a.fullname); }
        var r = OS.setUser(state, p);
        return r.ok ? '' : 'Set-LocalUser : ' + r.msg;
    }

    /* Group member list: -Member a,b or positional. */
    function members(a) {
        var raw = has(a, 'member') ? a.member : a._[1];
        return String(raw === undefined || raw === true ? '' : raw).split(',').map(function (x) { return x.trim(); }).filter(function (x) { return x.length; });
    }

    function groupMemberCmd(state, a, add) {
        var g = has(a, 'group') ? a.group : has(a, 'name') ? a.name : a._[0];
        var list = members(a);
        if (g === undefined || g === true) { return missingArg(add ? 'Add-LocalGroupMember' : 'Remove-LocalGroupMember', 'Group'); }
        if (!list.length) { return missingArg(add ? 'Add-LocalGroupMember' : 'Remove-LocalGroupMember', 'Member'); }
        if (list.length > 20) { return LIMIT_MSG; }
        if (state.ledger.length + list.length > LIM.LIMITS.ledger.maxEntries) { return LIM.STORAGE_MESSAGE; }
        var out = [];
        list.forEach(function (m) {
            var r = add ? OS.addMember(state, { group: g, member: m }) : OS.removeMember(state, { group: g, member: m });
            if (!r.ok) {
                out.push((add ? 'Add-LocalGroupMember : ' : 'Remove-LocalGroupMember : ') +
                    (r.msg.indexOf('already a member') >= 0 ? m.slice(0, 40) + ' is already a member of group ' + String(g).slice(0, 40) + '.' :
                     r.msg.indexOf('not a member') >= 0 ? m.slice(0, 40) + ' is not a member of group ' + String(g).slice(0, 40) + '.' :
                     r.msg.indexOf('No mapping') >= 0 ? 'Principal ' + m.slice(0, 40) + ' was not found.' : r.msg));
            }
        });
        return out.join('\n');
    }

    /* net user ... */
    function netUser(state, t) {
        var w = t.map(function (x) { return x.toLowerCase(); });
        var id = state.identity;
        if (t.length === 2) {
            return 'User accounts for \\\\' + state.os.hostname.effective + '\n\n-------------------------------------------------------------------------------\n' +
                Object.keys(id.users).join('            ') + '\nThe command completed successfully.';
        }
        var name = t[2];
        var flags = w.slice(3);
        var flag = function (f) { for (var i = 0; i < flags.length; i++) { if (flags[i].indexOf(f) === 0) { return flags[i].slice(f.length); } } return null; };
        if (flags.indexOf('/add') >= 0) {
            var pw = t[3] && t[3][0] !== '/' ? t[3] : '';
            var full = null;
            for (var i = 3; i < t.length; i++) { if (t[i].toLowerCase().indexOf('/fullname:') === 0) { full = t[i].slice(10); } }
            var r = OS.newUser(state, { name: name, password: pw, fullName: full || '', mustChange: false, source: 'net',
                cannotChange: flag('/passwordchg:') === 'no', disabled: flag('/active:') === 'no' });
            return r.ok ? r.msg : 'System error 1378 has occurred.\n\n' + r.msg;
        }
        if (flags.indexOf('/delete') >= 0) { var d = OS.deleteUser(state, name); return d.ok ? d.msg : 'The user name could not be found.\n\nMore help is available by typing NET HELPMSG 2221.'; }
        var k = OS.findKey(id.users, name);
        if (!k) { return 'The user name could not be found.\n\nMore help is available by typing NET HELPMSG 2221.'; }
        var active = flag('/active:'), chg = flag('/passwordchg:'), exp = flag('/expires:');
        if (active !== null || chg !== null || exp !== null) {
            var p = { name: k };
            if (active !== null) { p.enabled = active === 'yes'; }
            if (chg !== null) { p.cannotChange = chg === 'no'; }
            /* /expires is the ACCOUNT expiry date, not the password; it changes nothing graded. */
            var s = OS.setUser(state, p);
            return s.ok ? 'The command completed successfully.' : s.msg;
        }
        var u = id.users[k];
        var groups = Object.keys(id.groups).filter(function (g) { return id.groups[g].members.indexOf(k) >= 0; });
        return ['User name                    ' + k, 'Full Name                    ' + (u.fullName || ''),
            'Account active               ' + (u.enabled ? 'Yes' : 'No'), 'Account expires              Never',
            'Password expires             ' + (u.neverExpires ? 'Never' : '12/17/2026 9:00:00 AM'),
            'User may change password     ' + (u.cannotChange ? 'No' : 'Yes'),
            'Local Group Memberships      ' + groups.map(function (g) { return '*' + g; }).join('  '),
            'The command completed successfully.'].join('\n');
    }

    /* net localgroup ... */
    function netLocalgroup(state, t) {
        var w = t.map(function (x) { return x.toLowerCase(); });
        var id = state.identity;
        if (t.length === 2) {
            return 'Aliases for \\\\' + state.os.hostname.effective + '\n\n-------------------------------------------------------------------------------\n' +
                Object.keys(id.groups).map(function (g) { return '*' + g; }).join('\n') + '\nThe command completed successfully.';
        }
        var g = t[2];
        if (t.length === 3) {
            var k = OS.findKey(id.groups, g);
            if (!k) { return 'The specified local group does not exist.\n\nMore help is available by typing NET HELPMSG 3780.'; }
            return 'Alias name     ' + k + '\n\nMembers\n\n-------------------------------------------------------------------------------\n' +
                id.groups[k].members.join('\n') + '\nThe command completed successfully.';
        }
        var add = w.indexOf('/add') >= 0, del = w.indexOf('/delete') >= 0;
        var who = t.slice(3).filter(function (x) { return x[0] !== '/'; });
        if (!add && !del) { return 'The syntax of this command is:\n\nNET LOCALGROUP\n[groupname [/COMMENT:"text"]] [/DOMAIN]\n              groupname {/ADD [/COMMENT:"text"] | /DELETE}  [/DOMAIN]\n              groupname name [...] {/ADD | /DELETE} [/DOMAIN]'; }
        if (!who.length && add) { var ng = OS.newGroup(state, { name: g }); return ng.msg; }
        if (!who.length && del) { var dg = OS.deleteGroup(state, g); return dg.ok ? dg.msg : dg.msg + '\n\nMore help is available by typing NET HELPMSG 3780.'; }
        if (who.length > 20) { return LIMIT_MSG; }
        var msgs = [];
        for (var i = 0; i < who.length; i++) {
            var r = add ? OS.addMember(state, { group: g, member: who[i] }) : OS.removeMember(state, { group: g, member: who[i] });
            if (!r.ok) { msgs.push('System error 1378 has occurred.\n\n' + r.msg); }
        }
        return msgs.length ? msgs.join('\n') : 'The command completed successfully.';
    }

    /* tzutil /g | /s "id" | /l. */
    function tzutil(state, t) {
        var op = String(t[1] || '').toLowerCase();
        if (op === '/g') { return state.os.timeZone; }
        if (op === '/l') { return OS.TIME_ZONES.map(function (z) { return z.display + '\n' + z.id + '\n'; }).join('\n'); }
        if (op === '/s') {
            var r = OS.setTimeZone(state, t.slice(2).join(' '));
            return r.ok ? '' : 'Invalid time zone ID.';
        }
        return 'Windows Time Zone Utility\n\nUsage:\nTZUTIL </? | /g | /s TimeZoneID[_dstoff] | /l>';
    }

    var POWER_SETTINGS = { 'monitor-timeout-ac': ['ac', 'display'], 'monitor-timeout-dc': ['dc', 'display'],
                           'standby-timeout-ac': ['ac', 'sleep'], 'standby-timeout-dc': ['dc', 'sleep'] };
    var POWERCFG_BAD = 'Invalid Parameters -- try "/?" for help';

    /* powercfg /list /getactivescheme /setactive /change /duplicatescheme /changename /setacvalueindex /setdcvalueindex /a /query. */
    function powercfg(state, t) {
        var op = String(t[1] || '').toLowerCase().replace(/^-/, '/');
        var pw = state.os.power;
        if (op === '/list' || op === '/l') {
            return 'Existing Power Schemes (* Active)\n-----------------------------------\n' + pw.plans.map(function (p) {
                return 'Power Scheme GUID: ' + p.guid + '  (' + p.name + ')' + (p.guid === pw.active ? ' *' : '');
            }).join('\n');
        }
        if (op === '/getactivescheme') { var a = OS.activePlan(state); return 'Power Scheme GUID: ' + a.guid + '  (' + a.name + ')'; }
        if (op === '/setactive' || op === '/s') { var r = OS.setActive(state, t[2]); return r.ok ? '' : r.msg; }
        if (op === '/change' || op === '/x') {
            var set = String(t[2] || '').toLowerCase().replace(/^-/, '');
            if (!Object.prototype.hasOwnProperty.call(POWER_SETTINGS, set) || t[3] === undefined) { return POWERCFG_BAD; }
            var s = POWER_SETTINGS[set];
            var c = OS.setTimeout(state, null, s[0], s[1], t[3]);
            return c.ok ? '' : c.msg;
        }
        if (op === '/duplicatescheme') { var d = OS.duplicatePlan(state, t[2]); return d.msg; }
        if (op === '/changename') { var n = OS.renamePlan(state, t[2], t[3]); return n.ok ? '' : n.msg; }
        if (op === '/setacvalueindex' || op === '/setdcvalueindex') {
            var sub = String(t[3] || '').toUpperCase(), setting = String(t[4] || '').toUpperCase(), secs = Number(t[5]);
            var which = sub === 'SUB_VIDEO' && setting === 'VIDEOIDLE' ? 'display' : sub === 'SUB_SLEEP' && setting === 'STANDBYIDLE' ? 'sleep' : null;
            if (!which || !(secs >= 0) || secs % 60 !== 0) { return POWERCFG_BAD; }
            var plan = String(t[2] || '').toLowerCase() === 'scheme_current' ? OS.activePlan(state).guid : t[2];
            var v = OS.setTimeout(state, plan, op === '/setacvalueindex' ? 'ac' : 'dc', which, secs / 60);
            return v.ok ? '' : v.msg;
        }
        if (op === '/a' || op === '/availablesleepstates') {
            return 'The following sleep states are available on this system:\n    Hibernate\n\nThe following sleep states are not available on this system:\n' +
                '    Standby (S1)\n        The system firmware does not support this standby state.\n        This standby state is disabled when the hypervisor does not support it.\n\n' +
                '    Standby (S2)\n        The system firmware does not support this standby state.\n        This standby state is disabled when the hypervisor does not support it.\n\n' +
                '    Standby (S3)\n        The system firmware does not support this standby state.\n        This standby state is disabled when the hypervisor does not support it.\n\n' +
                '    Standby (S0 Low Power Idle)\n        The system firmware does not support this standby state.';
        }
        if (op === '/query' || op === '/q') {
            var q = t[2] ? OS.planBy(state, t[2]) : OS.activePlan(state);
            if (!q) { return 'Unable to perform operation. An unexpected error (0x0) has occurred.'; }
            return 'Power Scheme GUID: ' + q.guid + '  (' + q.name + ')\n' +
                '  Subgroup: Display\n    Turn off display after\n    Current AC Power Setting Index: 0x' + (q.ac.display * 60).toString(16).padStart(8, '0') +
                '\n    Current DC Power Setting Index: 0x' + (q.dc.display * 60).toString(16).padStart(8, '0') +
                '\n  Subgroup: Sleep\n    Sleep after\n    Current AC Power Setting Index: 0x' + (q.ac.sleep * 60).toString(16).padStart(8, '0') +
                '\n    Current DC Power Setting Index: 0x' + (q.dc.sleep * 60).toString(16).padStart(8, '0');
        }
        return POWERCFG_BAD;
    }

    /* reg add | query | delete on the desktop. */
    function reg(state, t) {
        var op = String(t[1] || '').toLowerCase();
        var key = t[2];
        var f = {};
        for (var i = 3; i < t.length; i++) {
            var x = t[i].toLowerCase();
            if (x === '/f') { f.f = true; continue; }
            if (x === '/ve') { f.v = ''; continue; }
            if (x === '/v' || x === '/t' || x === '/d') { f[x[1]] = t[i + 1]; i++; }
        }
        if (op === 'add') {
            if (key === undefined) { return 'ERROR: Invalid syntax.\nType "REG ADD /?" for usage.'; }
            if (f.v === undefined) {
                var k = REG.canonKey(key);
                if (!k) { return 'ERROR: Invalid key name.'; }
                return REG.createKey(state, k) ? 'The operation completed successfully.' : LIM.STORAGE_MESSAGE;
            }
            var r = REG.write(state, 'desktop', key, f.v, f.t || 'REG_SZ', f.d === undefined ? '' : f.d, true);
            return r.msg;
        }
        if (op === 'query') {
            var q = REG.read(state, key);
            if (!q) { return 'ERROR: The system was unable to find the specified registry key or value.'; }
            var vals = f.v !== undefined ? q.values.filter(function (v) { return v.name.toLowerCase() === String(f.v).toLowerCase(); }) : q.values;
            if (f.v !== undefined && !vals.length) { return 'ERROR: The system was unable to find the specified registry key or value.'; }
            return '\n' + q.key.replace('HKLM', 'HKEY_LOCAL_MACHINE').replace('HKCU', 'HKEY_CURRENT_USER') + '\n' + vals.map(function (v) {
                return '    ' + v.name + '    ' + v.type + '    ' + (v.type === 'REG_DWORD' ? '0x' + Number(v.data).toString(16) : v.data);
            }).join('\n') + '\n';
        }
        if (op === 'delete') {
            if (f.v === undefined) { return 'ERROR: This exam console deletes values only (reg delete <key> /v <name> /f).'; }
            return REG.del(state, key, f.v).msg;
        }
        return 'ERROR: Invalid syntax.\nType "REG /?" for usage.';
    }

    /* PowerShell registry type names to REG_ types. */
    function psType(v) {
        var m = { 'dword': 'REG_DWORD', 'string': 'REG_SZ', 'qword': 'REG_QWORD', 'expandstring': 'REG_EXPAND_SZ', 'multistring': 'REG_MULTI_SZ', 'binary': 'REG_BINARY' };
        var k = String(v || '').toLowerCase();
        return Object.prototype.hasOwnProperty.call(m, k) ? m[k] : null;
    }

    /* Set-ItemProperty / New-ItemProperty on a registry path. */
    function itemProperty(state, a, isNew) {
        var path = has(a, 'path') ? a.path : a._[0];
        var name = has(a, 'name') ? a.name : a._[1];
        var value = has(a, 'value') ? a.value : a._[2];
        var cmd = isNew ? 'New-ItemProperty' : 'Set-ItemProperty';
        if (path === undefined || path === true) { return missingArg(cmd, 'Path'); }
        if (name === undefined || name === true) { return missingArg(cmd, 'Name'); }
        if (value === undefined || value === true) { return missingArg(cmd, 'Value'); }
        var typeArg = isNew ? (has(a, 'propertytype') ? a.propertytype : has(a, 'type') ? a.type : null) : (has(a, 'type') ? a.type : null);
        var type = typeArg === null ? null : psType(typeArg);
        if (typeArg !== null && !type) { return cmd + " : Cannot bind parameter 'Type'. Specify DWord, String, QWord, ExpandString, MultiString or Binary."; }
        if (!type) {
            /* No -Type: an existing value keeps its type; a new value is created as REG_SZ. */
            var cur = REG.read(state, path);
            var existing = cur && cur.values.filter(function (v) { return v.name.toLowerCase() === String(name).toLowerCase(); })[0];
            type = existing ? existing.type : 'REG_SZ';
        }
        var key = REG.canonKey(path);
        if (!key || !REG.keyExists(state, key)) { return cmd + " : Cannot find path '" + String(path).slice(0, 120) + "' because it does not exist."; }
        var r = REG.write(state, 'desktop', path, String(name), type, value, false);
        return r.ok ? '' : cmd + ' : ' + r.msg;
    }

    /* New-Item -Path <registry key> [-Force]: -Force creates missing parents. */
    function newItem(state, a) {
        var path = has(a, 'path') ? a.path : a._[0];
        if (path === undefined || path === true) { return missingArg('New-Item', 'Path'); }
        var key = REG.canonKey(path);
        if (!key) { return 'New-Item : This exam console creates registry keys only (HKLM:\\ or HKCU:\\ paths).'; }
        var parent = key.slice(0, key.lastIndexOf('\\'));
        if (!has(a, 'force') && !REG.keyExists(state, parent)) { return "New-Item : Cannot find path '" + parent + "' because it does not exist."; }
        if (REG.keyExists(state, key) && !has(a, 'force')) { return 'New-Item : A key at this path already exists.'; }
        return REG.createKey(state, key) ? '' : LIM.STORAGE_MESSAGE;
    }

    var MUTATORS = {
        'rename-computer': renameComputer,
        'add-computer': addComputer,
        'restart-computer': function (state) { var r = PC.restart(state); return r.ok ? '' : r.msg; },
        'set-timezone': function (state, a) {
            var id = has(a, 'id') ? a.id : has(a, 'name') ? a.name : a._.join(' ');
            var r = OS.setTimeZone(state, id);
            return r.ok ? '' : "Set-TimeZone : The time zone '" + String(id).slice(0, 64) + "' was not found on the local computer.";
        },
        'new-localuser': newLocalUser,
        'set-localuser': setLocalUser,
        'remove-localuser': function (state, a) {
            var n = has(a, 'name') ? a.name : a._[0];
            var r = OS.deleteUser(state, n); return r.ok ? '' : 'Remove-LocalUser : User ' + String(n).slice(0, 40) + ' was not found.';
        },
        'enable-localuser': function (state, a) { var r = OS.setUser(state, { name: has(a, 'name') ? a.name : a._[0], enabled: true }); return r.ok ? '' : 'Enable-LocalUser : ' + r.msg; },
        'disable-localuser': function (state, a) { var r = OS.setUser(state, { name: has(a, 'name') ? a.name : a._[0], enabled: false }); return r.ok ? '' : 'Disable-LocalUser : ' + r.msg; },
        'remove-localgroup': function (state, a) {
            var n = has(a, 'name') ? a.name : a._[0];
            var r = OS.deleteGroup(state, n); return r.ok ? '' : 'Remove-LocalGroup : Group ' + String(n).slice(0, 40) + ' was not found.';
        },
        'new-localgroup': function (state, a) {
            var r = OS.newGroup(state, { name: has(a, 'name') ? a.name : a._[0], description: has(a, 'description') ? a.description : '' });
            return r.ok ? '' : 'New-LocalGroup : ' + r.msg;
        },
        'add-localgroupmember': function (state, a) { return groupMemberCmd(state, a, true); },
        'remove-localgroupmember': function (state, a) { return groupMemberCmd(state, a, false); },
        'set-itemproperty': function (state, a) { return itemProperty(state, a, false); },
        'new-itemproperty': function (state, a) { return itemProperty(state, a, true); },
        'new-item': newItem,
        'remove-itemproperty': function (state, a) {
            var r = REG.del(state, has(a, 'path') ? a.path : a._[0], has(a, 'name') ? a.name : a._[1]);
            return r.ok ? '' : 'Remove-ItemProperty : Property does not exist.';
        }
    };
    MUTATORS.sp = MUTATORS['set-itemproperty'];

    /* Legacy executables: whole-token parsing, never part of a pipeline. */
    var LEGACY = {
        'net': function (state, t) {
            var s = String(t[1] || '').toLowerCase();
            if (s === 'user') { return netUser(state, t); }
            if (s === 'localgroup') { return netLocalgroup(state, t); }
            return 'The syntax of this command is:\n\nNET\n    [ ACCOUNTS | COMPUTER | CONFIG | CONTINUE | FILE | GROUP | HELP |\n      HELPMSG | LOCALGROUP | PAUSE | SESSION | SHARE | START |\n      STATISTICS | STOP | TIME | USE | USER | VIEW ]';
        },
        'tzutil': tzutil, 'powercfg': powercfg, 'reg': reg,
        'whoami': function (state) {
            var tech = Object.keys(state.identity.users).filter(function (n) { return state.identity.users[n].oobe; })[0] || 'user';
            return state.os.hostname.effective.toLowerCase() + '\\' + tech.toLowerCase();
        }
    };
    ['net.exe', 'tzutil.exe', 'powercfg.exe', 'reg.exe', 'whoami.exe'].forEach(function (x) { LEGACY[x] = LEGACY[x.slice(0, -4)]; });

    /* ═══ RUN ══════════════════════════════════════════════════════════════════════════════════ */

    /* stages: token arrays. extra: legacy table from the shell (slmgr, winver, ...). */
    function run(state, stages, budget, extra, ctx) {
        var first = stages[0];
        var cmd = first[0].toLowerCase();
        for (var s = 0; s < stages.length; s++) {
            if (DUMPERS.indexOf(stages[s][0].toLowerCase()) >= 0) { return { out: DENY_MSG }; }
        }
        /* The one modelled mutator pipeline: New-Partition ... | Format-Volume ... (the new partition's
         * letter flows into Format-Volume; Nancy D4 B5). */
        if (stages.length === 2 && cmd === 'new-partition' && stages[1][0].toLowerCase() === 'format-volume') {
            var a1 = args(first);
            if (!Object.prototype.hasOwnProperty.call(a1, 'driveletter') && !Object.prototype.hasOwnProperty.call(a1, 'assigndriveletter')) {
                return { out: 'Format-Volume : The partition has no drive letter; use -DriveLetter or -AssignDriveLetter on New-Partition.' };
            }
            var before = PC_LETTERS(state);
            var o1 = MUTATORS['new-partition'](state, a1, ctx || {});
            if (o1) { return { out: o1 }; }
            var made = PC_LETTERS(state).filter(function (l) { return before.indexOf(l) < 0; })[0];
            var a2 = args(stages[1]); a2.driveletter = made;
            return { out: MUTATORS['format-volume'](state, a2, ctx || {}) };
        }
        var legacy = Object.prototype.hasOwnProperty.call(LEGACY, cmd) ? LEGACY[cmd] : extra && Object.prototype.hasOwnProperty.call(extra, cmd) ? extra[cmd] : null;
        if (legacy || Object.prototype.hasOwnProperty.call(MUTATORS, cmd)) {
            if (stages.length > 1) { return { out: DENY_MSG }; }
            var r = legacy ? legacy(state, first, ctx || {}) : MUTATORS[cmd](state, args(first), ctx || {});
            return typeof r === 'string' ? { out: r } : r;
        }
        if (!Object.prototype.hasOwnProperty.call(PRODUCERS, cmd)) { return { out: notRecognised(first[0]) }; }
        var v = PRODUCERS[cmd](state, args(first), ctx || {});
        for (var i = 1; i < stages.length; i++) {
            if (typeof v === 'string') { return { out: v }; }
            var st = stages[i][0].toLowerCase();
            if (Object.prototype.hasOwnProperty.call(MUTATORS, st) || Object.prototype.hasOwnProperty.call(LEGACY, st)) { return { out: DENY_MSG }; }
            if (!Object.prototype.hasOwnProperty.call(STAGES, st)) { return { out: notRecognised(stages[i][0]) }; }
            if ((st === 'format-table' || st === 'ft' || st === 'format-list' || st === 'fl') && i !== stages.length - 1) { return { out: DENY_MSG }; }
            v = STAGES[st](v, args(stages[i]), budget);
            if (budget.spent) { return { out: LIMIT_MSG }; }
        }
        return { out: render(v) };
    }

    /* Every drive letter on any disk (for the New-Partition | Format-Volume pipeline). */
    function PC_LETTERS(state) {
        var out = [];
        (state.disks || []).forEach(function (d) { d.partitions.forEach(function (p) { if (p.letter) { out.push(p.letter); } }); });
        return out;
    }

    /* The line after a prompt: the secret. Never logged; only reaches the operation. */
    function resume(state, pending, secret) {
        if (pending.kind === 'newuser') {
            var p = JSON.parse(JSON.stringify(pending.p)); p.password = secret;
            return { out: newUserOut(state, p) };
        }
        if (pending.kind === 'join') {
            /* Atomic, as Add-Computer is: the new name is validated first and applied only if the join succeeds. */
            if (pending.newName && !PC.validHostname(pending.newName)) { return { out: 'Add-Computer : ' + PC.MSG.hostnameBad }; }
            var r = OS.join(state, { type: 'domain', name: pending.domain, user: pending.user, password: secret });
            if (!r.ok) { return { out: 'Add-Computer : Computer \'' + state.os.hostname.effective + "' failed to join domain '" + pending.domain + "' from its current workgroup '" + state.identity.membership.name + "' with following error message: " + r.msg }; }
            if (pending.newName) { OS.rename(state, pending.newName); }
            if (pending.restart) { PC.restart(state); return { out: '' }; }
            return { out: 'WARNING: The changes will take effect after you restart the computer ' + state.os.hostname.effective + '.' };
        }
        return { out: '' };
    }

    /* P4/P5 commands register into the same tables, with the same helpers (no require cycle). */
    require('./mdfinal-cmdlets-d4.js').install({ PRODUCERS: PRODUCERS, MUTATORS: MUTATORS, LEGACY: LEGACY, objs: objs, has: has,
        missingArg: missingArg, bool: bool, LIMIT_MSG: LIMIT_MSG, DENY_MSG: DENY_MSG });

    module.exports = { run: run, resume: resume, args: args, render: render, table: table, PRODUCERS: PRODUCERS, MUTATORS: MUTATORS,
                       LEGACY: LEGACY, STAGES: STAGES, DUMPERS: DUMPERS, DENY_MSG: DENY_MSG, LIMIT_MSG: LIMIT_MSG };
})();
