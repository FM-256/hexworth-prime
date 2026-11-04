/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-registry.js — the registry as the exam models it: canonical paths, a whitelist of
 * values that change the simulated PC, and an inert scratch store for everything else.
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, R9, 13.4 (R9 items), 13.8.
 *
 * ONE WRITER. reg add, Set-ItemProperty, New-ItemProperty and the regedit window all call write();
 * a whitelisted value is routed into the same model the GUI changes (through the same validation),
 * so no spelling of a path can reach a state the GUI cannot. A value outside the whitelist, or a
 * whitelisted value with the wrong type or an out-of-range DWORD, is stored inert in regScratch:
 * `reg query` shows it back, exactly as Windows would, and NO CHECK EVER READS regScratch.
 *
 * KEY EXISTENCE IS REAL. The Windows Update and BitLocker policy keys do not exist on a fresh
 * install; `reg add` creates keys as it goes, Set-ItemProperty needs New-Item first, and
 * Set-ItemProperty on a value that does not exist yet creates REG_SZ unless -Type is given.
 *
 * D3 SCOPE: LabConfig, UAC, Windows Update policy and active hours, the BitLocker method policy,
 * the Remote Desktop values. Paging file, Run keys, services and UpperFilters join at D5 with
 * their models; until then they are scratch.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var LIM = require('./mdfinal-limits.js');
    var PC = require('./mdfinal-pc.js');
    var OS = require('./mdfinal-os.js');

    var freeze = LIM.deepFreeze;
    var OBJ = LIM.LIMITS.objects;

    var K_LABCONFIG = 'HKLM\\SYSTEM\\SETUP\\LABCONFIG';
    var K_UAC = 'HKLM\\SOFTWARE\\MICROSOFT\\WINDOWS\\CURRENTVERSION\\POLICIES\\SYSTEM';
    var K_WU = 'HKLM\\SOFTWARE\\POLICIES\\MICROSOFT\\WINDOWS\\WINDOWSUPDATE';
    var K_UX = 'HKLM\\SOFTWARE\\MICROSOFT\\WINDOWSUPDATE\\UX\\SETTINGS';
    var K_FVE = 'HKLM\\SOFTWARE\\POLICIES\\MICROSOFT\\FVE';
    var K_TS = 'HKLM\\SYSTEM\\CURRENTCONTROLSET\\CONTROL\\TERMINAL SERVER';
    var K_RDP = 'HKLM\\SYSTEM\\CURRENTCONTROLSET\\CONTROL\\TERMINAL SERVER\\WINSTATIONS\\RDP-TCP';

    /* Keys that exist on a fresh install (others must be created). Parents of these exist too. */
    /* Leaf keys present on a fresh install; every ancestor of one exists too (keyExists). */
    var DEFAULT_KEYS = freeze([K_UAC, K_UX, K_TS, K_RDP, 'HKLM\\SOFTWARE\\POLICIES\\MICROSOFT\\WINDOWS',
        'HKLM\\SOFTWARE\\MICROSOFT\\WINDOWS\\CURRENTVERSION\\RUN', 'HKLM\\SYSTEM\\CURRENTCONTROLSET\\SERVICES',
        'HKLM\\SYSTEM\\CURRENTCONTROLSET\\CONTROL\\SESSION MANAGER\\MEMORY MANAGEMENT',
        'HKCU\\SOFTWARE\\MICROSOFT\\WINDOWS\\CURRENTVERSION\\RUN', 'HKLM\\SYSTEM\\SETUP']);

    /* The whitelist: canonical key -> value name (as Windows spells it) -> DWORD range. */
    var WHITELIST = freeze({
        'HKLM\\SYSTEM\\SETUP\\LABCONFIG': { BypassTPMCheck: [0, 1], BypassSecureBootCheck: [0, 1], BypassRAMCheck: [0, 1], BypassCPUCheck: [0, 1] },
        'HKLM\\SOFTWARE\\MICROSOFT\\WINDOWS\\CURRENTVERSION\\POLICIES\\SYSTEM': { ConsentPromptBehaviorAdmin: [0, 5], PromptOnSecureDesktop: [0, 1], EnableLUA: [0, 1] },
        'HKLM\\SOFTWARE\\POLICIES\\MICROSOFT\\WINDOWS\\WINDOWSUPDATE': { DeferFeatureUpdates: [0, 1], DeferFeatureUpdatesPeriodInDays: [0, 365],
            DeferQualityUpdates: [0, 1], DeferQualityUpdatesPeriodInDays: [0, 30] },
        'HKLM\\SOFTWARE\\MICROSOFT\\WINDOWSUPDATE\\UX\\SETTINGS': { ActiveHoursStart: [0, 23], ActiveHoursEnd: [0, 23] },
        'HKLM\\SOFTWARE\\POLICIES\\MICROSOFT\\FVE': { EncryptionMethodWithXtsOs: [3, 7] },
        'HKLM\\SYSTEM\\CURRENTCONTROLSET\\CONTROL\\TERMINAL SERVER': { fDenyTSConnections: [0, 1] },
        'HKLM\\SYSTEM\\CURRENTCONTROLSET\\CONTROL\\TERMINAL SERVER\\WINSTATIONS\\RDP-TCP': { UserAuthentication: [0, 1] }
    });

    var FVE_METHODS = freeze([3, 4, 6, 7]);   /* AES-CBC 128, AES-CBC 256, XTS-AES 128, XTS-AES 256 */
    var TYPES = freeze(['REG_SZ', 'REG_DWORD', 'REG_QWORD', 'REG_EXPAND_SZ', 'REG_MULTI_SZ', 'REG_BINARY']);

    /* ═══ CANONICAL FORM ═══════════════════════════════════════════════════════════════════════ */

    /* Hive aliases, case, doubled and trailing backslashes, ControlSet001 -> CurrentControlSet,
     * WOW6432Node mapped to the native view. Returns '' for an unknown hive. */
    function canonKey(raw) {
        var parts = String(raw || '').split('/').join('\\').split('\\').filter(function (x) { return x.length; });
        if (!parts.length) { return ''; }
        var hive = parts[0].toUpperCase();
        var map = { 'HKLM': 'HKLM', 'HKLM:': 'HKLM', 'HKEY_LOCAL_MACHINE': 'HKLM', 'REGISTRY::HKEY_LOCAL_MACHINE': 'HKLM',
                    'REGISTRY::HKLM': 'HKLM', 'HKCU': 'HKCU', 'HKCU:': 'HKCU', 'HKEY_CURRENT_USER': 'HKCU',
                    'REGISTRY::HKEY_CURRENT_USER': 'HKCU' };
        if (!Object.prototype.hasOwnProperty.call(map, hive)) { return ''; }
        var rest = parts.slice(1).map(function (x) { return x.toUpperCase(); })
            .filter(function (x) { return x !== 'WOW6432NODE'; })
            .map(function (x) { return x === 'CONTROLSET001' ? 'CURRENTCONTROLSET' : x; });
        return [map[hive]].concat(rest).join('\\');
    }

    /* The whitelist's spelling of a value name on a key, case-insensitively, or null. */
    function canonValue(key, name) {
        var w = Object.prototype.hasOwnProperty.call(WHITELIST, key) ? WHITELIST[key] : null;
        if (!w) { return null; }
        var n = String(name || '').toLowerCase();
        var names = Object.keys(w);
        for (var i = 0; i < names.length; i++) { if (names[i].toLowerCase() === n) { return names[i]; } }
        return null;
    }

    /* DWORD data: decimal or 0x hex, 0..4294967295; NaN otherwise. */
    function dword(v) {
        if (typeof v === 'number') { return v >= 0 && v <= 4294967295 && Math.floor(v) === v ? v : NaN; }
        var s = String(v === undefined ? '' : v).trim().toLowerCase();
        var hex = s.length > 2 && s.slice(0, 2) === '0x';
        var digits = hex ? s.slice(2) : s;
        if (!digits.length || digits.length > 10) { return NaN; }
        for (var i = 0; i < digits.length; i++) {
            if ((hex ? '0123456789abcdef' : '0123456789').indexOf(digits[i]) < 0) { return NaN; }
        }
        var n = hex ? parseInt(digits, 16) : Number(digits);
        return n <= 4294967295 ? n : NaN;
    }

    /* ═══ KEY EXISTENCE ════════════════════════════════════════════════════════════════════════ */

    /* The policies sub-object, with its list of student-created keys initialised. */
    function regState(state) {
        var p = state.os.policies;
        if (!p.keys) { p.keys = []; }
        return p;
    }
    /* True when the key exists by default or because the student (or one of its subkeys) created it. */
    function keyExists(state, key) {
        if (DEFAULT_KEYS.some(function (k) { return k === key || k.indexOf(key + '\\') === 0; })) { return true; }
        var made = regState(state).keys;
        return made.some(function (k) { return k === key || k.indexOf(key + '\\') === 0; });
    }
    /* New-Item / reg add create a key and its parents. Capped with the scratch store. */
    function createKey(state, key) {
        if (keyExists(state, key)) { return true; }
        var made = regState(state).keys;
        if (made.length >= OBJ.regScratchValues) { return false; }
        made.push(key);
        return true;
    }

    /* ═══ WRITE / DELETE / READ ════════════════════════════════════════════════════════════════ */

    /* Routes one whitelisted DWORD into the model. Returns { ok, msg } or null (not modelled). */
    function applyModel(state, key, name, n) {
        if (key === K_LABCONFIG) { return PC.setLabConfig(state, name, n); }
        if (key === K_UAC) { return OS.setUacValue(state, name, n); }
        var pol = regState(state);
        if (key === K_WU) {
            if (!pol.wu) { pol.wu = {}; }
            pol.wu[name] = n;
            PC.ledger(state, 'policy-wu', name);
            return { ok: true, msg: '' };
        }
        if (key === K_UX) {
            var ah = state.os.updates.activeHours;
            if (name === 'ActiveHoursStart') { ah.start = n; } else { ah.end = n; }
            ah.manual = true;
            PC.ledger(state, 'active-hours', 'reg');
            return { ok: true, msg: '' };
        }
        if (key === K_FVE) {
            if (FVE_METHODS.indexOf(n) < 0) { return null; }
            if (!pol.fve) { pol.fve = {}; }
            pol.fve.EncryptionMethodWithXtsOs = n;
            PC.ledger(state, 'policy-fve', String(n));
            return { ok: true, msg: '' };
        }
        if (key === K_TS || key === K_RDP) {
            if (!pol.rdp) { pol.rdp = { fDenyTSConnections: 1, UserAuthentication: 1 }; }
            pol.rdp[name] = n;
            PC.ledger(state, 'policy-rdp', name);
            return { ok: true, msg: '' };
        }
        return null;
    }

    /* Inert store: shows back in queries, changes nothing. */
    function scratch(state, key, name, type, data) {
        var store = state.regScratch;
        var id = key + '|' + String(name).toLowerCase();
        var text = String(data === undefined ? '' : data);
        if (Buffer.byteLength(text) > OBJ.regScratchBytes) { return false; }
        if (!Object.prototype.hasOwnProperty.call(store, id) && Object.keys(store).length >= OBJ.regScratchValues) { return false; }
        store[id] = { key: key, name: String(name).slice(0, 64), type: type, data: text };
        return true;
    }

    /* Every registry write from every surface. ctx: 'setup' (Shift+F10 in Setup) or 'desktop'.
     * createKeys: reg add and New-ItemProperty -Force create missing keys; Set-ItemProperty doesn't. */
    function write(state, ctx, keyRaw, name, typeRaw, data, createKeys) {
        var key = canonKey(keyRaw);
        if (!key) { return { ok: false, msg: 'ERROR: Invalid key name.' }; }
        var type = String(typeRaw || 'REG_SZ').toUpperCase();
        if (type === 'DWORD') { type = 'REG_DWORD'; }
        if (type === 'STRING') { type = 'REG_SZ'; }
        if (TYPES.indexOf(type) < 0) { return { ok: false, msg: 'ERROR: Invalid syntax.' }; }
        if (typeof name !== 'string' || name.length > 64) { return { ok: false, msg: 'ERROR: Invalid syntax.' }; }
        if (ctx === 'setup') {
            if (key !== K_LABCONFIG) { return { ok: false, msg: 'ERROR: The system was unable to find the specified registry key or value.' }; }
        } else if (ctx === 'desktop') {
            if (key === K_LABCONFIG) { return { ok: true, msg: 'The operation completed successfully.', inert: true, done: scratch(state, key, name, type, data) }; }
        } else { return { ok: false, msg: 'ERROR: Access is denied.' }; }
        if (ctx === 'desktop' && !keyExists(state, key)) {
            if (!createKeys) { return { ok: false, msg: "Cannot find path '" + String(keyRaw).slice(0, 120) + "' because it does not exist." }; }
            if (!createKey(state, key)) { return { ok: false, msg: LIM.STORAGE_MESSAGE }; }
        }
        var vname = canonValue(key, name);
        if (vname && type === 'REG_DWORD') {
            var n = dword(data);
            var range = WHITELIST[key][vname];
            if (!isNaN(n) && n >= range[0] && n <= range[1]) {
                var r = applyModel(state, key, vname, n);
                if (r && r.ok) { return { ok: true, msg: 'The operation completed successfully.' }; }
                if (r && !r.ok) { return r; }
            }
        }
        if (ctx === 'setup') {
            return { ok: false, msg: vname ? 'ERROR: Invalid syntax. LabConfig values are REG_DWORD.' : 'ERROR: The system was unable to find the specified registry key or value.' };
        }
        if (!scratch(state, key, name, type, data)) { return { ok: false, msg: LIM.STORAGE_MESSAGE }; }
        return { ok: true, msg: 'The operation completed successfully.', inert: true };
    }

    /* reg delete /v, Remove-ItemProperty: a whitelisted value goes back to its Windows default. */
    function del(state, keyRaw, name) {
        var key = canonKey(keyRaw);
        var vname = canonValue(key, name);
        var pol = regState(state);
        if (vname && key === K_UAC) { return OS.setUacValue(state, vname, vname === 'ConsentPromptBehaviorAdmin' ? 5 : 1); }
        if (vname && key === K_WU && pol.wu && Object.prototype.hasOwnProperty.call(pol.wu, vname)) {
            delete pol.wu[vname]; PC.ledger(state, 'policy-wu-del', vname); return { ok: true, msg: 'The operation completed successfully.' };
        }
        if (vname && key === K_FVE && pol.fve) { delete pol.fve.EncryptionMethodWithXtsOs; PC.ledger(state, 'policy-fve-del', ''); return { ok: true, msg: 'The operation completed successfully.' }; }
        var id = key + '|' + String(name || '').toLowerCase();
        if (Object.prototype.hasOwnProperty.call(state.regScratch, id)) { delete state.regScratch[id]; return { ok: true, msg: 'The operation completed successfully.' }; }
        return { ok: false, msg: 'ERROR: The system was unable to find the specified registry key or value.' };
    }

    /* The values a key holds right now, as reg query and Get-ItemProperty show them. */
    function read(state, keyRaw) {
        var key = canonKey(keyRaw);
        if (!key || !keyExists(state, key)) { return null; }
        var out = [];
        var pol = state.os.policies || {};
        var dw = function (n, v) { out.push({ name: n, type: 'REG_DWORD', data: v }); };
        if (key === K_UAC) { var u = state.identity.uac; dw('ConsentPromptBehaviorAdmin', u.ConsentPromptBehaviorAdmin); dw('EnableLUA', u.pendingEnableLUA === null || u.pendingEnableLUA === undefined ? u.EnableLUA : u.pendingEnableLUA); dw('PromptOnSecureDesktop', u.PromptOnSecureDesktop); }
        if (key === K_WU && pol.wu) { Object.keys(pol.wu).sort().forEach(function (n) { dw(n, pol.wu[n]); }); }
        if (key === K_UX && state.os.updates.activeHours.manual) { dw('ActiveHoursEnd', state.os.updates.activeHours.end); dw('ActiveHoursStart', state.os.updates.activeHours.start); }
        if (key === K_FVE && pol.fve && pol.fve.EncryptionMethodWithXtsOs !== undefined) { dw('EncryptionMethodWithXtsOs', pol.fve.EncryptionMethodWithXtsOs); }
        if (key === K_TS) { dw('fDenyTSConnections', pol.rdp ? pol.rdp.fDenyTSConnections : 1); }
        if (key === K_RDP) { dw('UserAuthentication', pol.rdp ? pol.rdp.UserAuthentication : 1); }
        /* Inert values show too, but never shadow a modelled value of the same name. */
        Object.keys(state.regScratch).forEach(function (id) {
            var v = state.regScratch[id];
            if (v.key !== key) { return; }
            if (out.some(function (o) { return o.name.toLowerCase() === v.name.toLowerCase(); })) { return; }
            out.push({ name: v.name, type: v.type, data: v.data });
        });
        return { key: key, values: out };
    }

    /* Effective DWORD a model reader may use: only from the model, never from regScratch. */
    function policy(state, area, name) {
        var a = state.os && state.os.policies && state.os.policies[area];
        return a && Object.prototype.hasOwnProperty.call(a, name) ? a[name] : undefined;
    }

    module.exports = {
        K_LABCONFIG: K_LABCONFIG, K_UAC: K_UAC, K_WU: K_WU, K_UX: K_UX, K_FVE: K_FVE, K_TS: K_TS, K_RDP: K_RDP,
        WHITELIST: WHITELIST, DEFAULT_KEYS: DEFAULT_KEYS, FVE_METHODS: FVE_METHODS,
        canonKey: canonKey, canonValue: canonValue, dword: dword, keyExists: keyExists, createKey: createKey,
        write: write, del: del, read: read, policy: policy
    };
})();
