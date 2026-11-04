/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-bitlocker.js — BitLocker on C:, its protectors, and the recovery-key backup to TECH-USB.
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, 2.2 (method by policy,
 * the wizard has no picker), rows 5.2 and 8.1, 4.4 (WinRE key, D5), R1 (hidden derivation).
 *
 * HIDDEN VALUES COME FROM THE KEY. Protector GUIDs and recovery passwords are HMAC-derived per
 * sitting (R1) and live in the frozen answer key (`key.bitlocker`); the nth protector a student
 * creates takes the nth value. Nothing here can derive one, so nothing here needs the secret. The
 * engine passes the key in `ctx`; a value appears in state only once its protector exists, which is
 * when real Windows would show it too.
 *
 * REAL BEHAVIOUR KEPT: the method is fixed when encryption starts (policy, or -em / -EncryptionMethod,
 * else XTS-AES 128); the wizard saves the recovery key to a file but never onto the drive being
 * encrypted; encryption completes after the hardware-test restart unless the test is skipped;
 * suspending leaves the drive encrypted with protection off; Home has no BitLocker.
 * DECLARED: without a TPM, BitLocker cannot start (the no-TPM startup policy is not modelled).
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var LIM = require('./mdfinal-limits.js');
    var PC = require('./mdfinal-pc.js');

    var freeze = LIM.deepFreeze;
    var OBJ = LIM.LIMITS.objects;

    var METHODS = freeze({ 3: 'AES-CBC 128', 4: 'AES-CBC 256', 6: 'XTS-AES 128', 7: 'XTS-AES 256' });
    var EM_ARGS = freeze({ 'aes128': 3, 'aes256': 4, 'xts_aes128': 6, 'xts_aes256': 7,
                           'aes128cbc': 3, 'aes256cbc': 4, 'xtsaes128': 6, 'xtsaes256': 7 });
    var MAX_PROTECTORS = 4;

    function ok(msg) { return { ok: true, msg: msg || '' }; }
    function fail(msg) { return { ok: false, msg: msg }; }

    /* The BitLocker record for C:, created on first use. */
    function vol(state) {
        if (!state.bitlocker) { state.bitlocker = { C: { status: 'off', method: null, protectors: [], made: 0, pendingRestart: false } }; }
        return state.bitlocker.C;
    }

    /* Why BitLocker cannot run on this PC, or null. */
    function blocked(state) {
        if (!PC.onDesktop(state)) { return 'Windows is not running.'; }
        if (state.os.edition === 'Home' || state.os.edition === 'Home N') { return "BitLocker Drive Encryption isn't available on this edition of Windows."; }
        if (!(state.vm.generation === 2 && state.vm.vtpm)) {
            return "This device can't use a Trusted Platform Module. Your administrator must set the \"Allow BitLocker without a compatible TPM\" option in the \"Require additional authentication at startup\" policy for OS volumes.";
        }
        return null;
    }

    /* The method a new encryption uses: the explicit argument, else policy, else XTS-AES 128. */
    function methodFor(state, explicit) {
        if (explicit !== undefined && explicit !== null) { return explicit; }
        var pol = state.os.policies && state.os.policies.fve;
        return pol && METHODS[pol.EncryptionMethodWithXtsOs] ? pol.EncryptionMethodWithXtsOs : 6;
    }

    /* Adds the next protector of a type, drawing its id (and password) from the key. */
    function addProtector(state, ctx, type) {
        var v = vol(state);
        if (v.protectors.length >= MAX_PROTECTORS || v.made >= ctx.key.bitlocker.ids.length) { return fail('ERROR: The maximum number of key protectors has been reached for this volume.'); }
        if (type === 'Tpm' && v.protectors.some(function (p) { return p.type === 'Tpm'; })) { return fail('ERROR: A key protector of this type already exists. Only one TPM protector is allowed.'); }
        var i = v.made++;
        var p = { type: type, id: ctx.key.bitlocker.ids[i] };
        if (type === 'RecoveryPassword') { p.password = ctx.key.bitlocker.passwords[i]; }
        v.protectors.push(p);
        PC.ledger(state, 'bl-protector', type === 'Tpm' ? 'tpm' : 'rp');
        return ok(type === 'RecoveryPassword'
            ? 'Key Protectors Added:\n\n    Numerical Password:\n      ID: {' + p.id + '}\n      Password:\n        ' + p.password + '\n'
            : 'Key Protectors Added:\n\n    TPM:\n      ID: {' + p.id + '}\n');
    }

    /* Starts encryption. `skipTest` completes it at once; otherwise the hardware-test restart does. */
    function start(state, method, skipTest) {
        var v = vol(state);
        v.method = method;
        v.status = skipTest ? 'on' : 'pending';
        v.pendingRestart = !skipTest;
        PC.ledger(state, 'bl-start', METHODS[method] === 'XTS-AES 256' ? 'xts256' : 'other');
    }

    /* The recovery-key file text, as the wizard writes it. */
    function keyFileText(p) {
        return 'BitLocker Drive Encryption recovery key\n\nTo verify that this is the correct recovery key, compare the start of the following identifier with the identifier value displayed on your PC.\n\n' +
            'Identifier:\n\n\t' + p.id + '\n\nIf the above identifier matches the one displayed by your PC, then use the following key to unlock your drive.\n\nRecovery Key:\n\n\t' + p.password + '\n';
    }

    /* Writes a file onto TECH-USB (F:), the only place outside the VM a key can be kept. */
    function writeUsb(state, name, text, byStudent) {
        var files = state.host.usb.F.files;
        if (Buffer.byteLength(text) > OBJ.fileBytes) { return fail('There is not enough space on the disk.'); }
        var existing = files.filter(function (f) { return f.name.toLowerCase() === name.toLowerCase(); })[0];
        if (!existing && files.length >= OBJ.files) { return fail(LIM.STORAGE_MESSAGE); }
        /* origin is recorded at the write site (R5): the views tag a student's file as student text */
        if (existing) { existing.text = text; if (byStudent) { existing.student = true; } }
        else { files.push(byStudent ? { name: name, text: text, student: true } : { name: name, text: text }); }
        PC.ledger(state, 'usb-write', '');
        return ok('');
    }

    /* Control Panel > BitLocker > Turn on: back up the key (file on F:), then encrypt. The wizard
     * adds a TPM and a recovery-password protector; its method comes from policy only. */
    function wizard(state, ctx, p) {
        var why = blocked(state);
        if (why) { return fail(why); }
        var v = vol(state);
        if (v.status !== 'off') { return fail('BitLocker is already turned on for this drive.'); }
        var dest = String(p.saveTo || '').trim().toUpperCase();
        while (dest.length && (dest[dest.length - 1] === '\\' || dest[dest.length - 1] === '/')) { dest = dest.slice(0, -1); }
        if (dest === 'C:' || dest.indexOf('C:\\') === 0) { return fail("Your recovery key can't be saved in this location. Choose a different location."); }
        if (dest !== 'F:' && p.backup !== 'print') { return fail('Choose where to back up your recovery key.'); }
        /* the wizard reuses an existing TPM protector (Nancy D4 B2) */
        if (!v.protectors.some(function (x) { return x.type === 'Tpm'; })) {
            var t = addProtector(state, ctx, 'Tpm');
            if (!t.ok) { return t; }
        }
        var r = addProtector(state, ctx, 'RecoveryPassword');
        if (!r.ok) { return r; }
        var rp = v.protectors[v.protectors.length - 1];
        if (dest === 'F:') {
            var w = writeUsb(state, 'BitLocker Recovery Key ' + rp.id.toUpperCase() + '.TXT', keyFileText(rp));
            if (!w.ok) { return w; }
        }
        start(state, methodFor(state, null), p.runSystemCheck === false);
        return ok(p.runSystemCheck === false ? 'Encryption in progress.' : 'Restart your PC to run the BitLocker system check and start encrypting.');
    }

    /* Control Panel > BitLocker > Back up your recovery key > Save to a file (F:\ only; never C:). */
    function backupToUsb(state, saveTo) {
        if (!PC.onDesktop(state)) { return fail('Windows is not running.'); }
        var v = vol(state);
        var rp = v.protectors.filter(function (x) { return x.type === 'RecoveryPassword'; });
        if (!rp.length) { return fail('There is no recovery password protector to back up. Add one first.'); }
        var dest = String(saveTo || '').trim().toUpperCase();
        while (dest.length && (dest[dest.length - 1] === '\\' || dest[dest.length - 1] === '/')) { dest = dest.slice(0, -1); }
        if (dest === 'C:' || dest.indexOf('C:\\') === 0) { return fail("Your recovery key can't be saved in this location. Choose a different location."); }
        if (dest !== 'F:') { return fail('Choose a location on a removable drive (TECH-USB, F:).'); }
        var p = rp[rp.length - 1];
        return writeUsb(state, 'BitLocker Recovery Key ' + p.id.toUpperCase() + '.TXT', keyFileText(p));
    }

    /* manage-bde -on C: [-RecoveryPassword] [-em <m>] [-SkipHardwareTest]. Adds a TPM protector
     * (and a recovery password when asked). */
    function manageBdeOn(state, ctx, p) {
        var why = blocked(state);
        if (why) { return fail(why); }
        var v = vol(state);
        if (v.status !== 'off') { return fail('ERROR: The volume C: is already encrypted or being encrypted.'); }
        var m = null;
        if (p.em !== undefined) {
            var k = String(p.em).toLowerCase();
            if (!Object.prototype.hasOwnProperty.call(EM_ARGS, k)) { return fail('ERROR: An error occurred while parsing the encryption method.'); }
            m = EM_ARGS[k];
        }
        var out = [];
        if (!v.protectors.some(function (x) { return x.type === 'Tpm'; })) { var t = addProtector(state, ctx, 'Tpm'); if (!t.ok) { return t; } out.push(t.msg); }
        if (p.rp) { var r = addProtector(state, ctx, 'RecoveryPassword'); if (!r.ok) { return r; } out.push(r.msg); }
        start(state, methodFor(state, m), p.skipTest === true);
        out.push(p.skipTest ? 'Encryption is now in progress.' : 'ACTIONS REQUIRED:\n\n    1. Restart the computer to run a hardware test.\n       (Type "shutdown /?" for command line instructions.)\n\n    2. Type "manage-bde -status" to check if the hardware test succeeded.');
        return ok(out.join('\n'));
    }

    /* Enable-BitLocker -MountPoint C: -EncryptionMethod <m> (-TpmProtector | -RecoveryPasswordProtector) [-SkipHardwareTest]. */
    function enableBitLocker(state, ctx, p) {
        var why = blocked(state);
        if (why) { return fail(why); }
        var v = vol(state);
        if (v.status !== 'off') { return fail('The volume is already encrypted.'); }
        if (!p.tpm && !p.rp) { return fail("Parameter set cannot be resolved using the specified named parameters. One or more parameters issued cannot be used together or an insufficient number of parameters were provided."); }
        var m = null;
        if (p.method !== undefined) {
            var k = String(p.method).toLowerCase();
            if (!Object.prototype.hasOwnProperty.call(EM_ARGS, k)) { return fail("Cannot bind parameter 'EncryptionMethod'."); }
            m = EM_ARGS[k];
        }
        /* An OS volume needs a TPM protector to start; Windows refuses a recovery-password-only start up front. */
        if (!p.tpm && !v.protectors.some(function (x) { return x.type === 'Tpm'; })) {
            return fail('BitLocker cannot be enabled on the operating system drive without a TPM protector. Add one with -TpmProtector first.');
        }
        var r = addProtector(state, ctx, p.tpm ? 'Tpm' : 'RecoveryPassword');
        if (!r.ok) { return r; }
        start(state, methodFor(state, m), p.skipTest === true);
        return ok('');
    }

    /* manage-bde -protectors -add C: -rp | -tpm, Add-BitLockerKeyProtector. Allowed before or after encryption. */
    function protectorAdd(state, ctx, type) {
        var why = blocked(state);
        if (why) { return fail(why); }
        return addProtector(state, ctx, type);
    }

    /* manage-bde -protectors -delete C: -id {guid}. */
    function protectorDelete(state, id) {
        var v = vol(state);
        var g = String(id || '').replace(/[{}]/g, '').toLowerCase();
        var p = v.protectors.filter(function (x) { return x.id.toLowerCase() === g; })[0];
        if (!p) { return fail('ERROR: The key protector specified cannot be found.'); }
        if (v.status !== 'off' && v.protectors.length === 1) { return fail('ERROR: The last key protector of an encrypted volume cannot be deleted while protection is on.'); }
        v.protectors.splice(v.protectors.indexOf(p), 1);
        PC.ledger(state, 'bl-protector-del', p.type === 'Tpm' ? 'tpm' : 'rp');
        return ok('The key protector was deleted.');
    }

    /* Suspend-BitLocker / manage-bde -protectors -disable; Resume-BitLocker / -enable. */
    function suspend(state, on) {
        var v = vol(state);
        if (v.status === 'off' || v.status === 'pending') { return fail('ERROR: The volume C: is not encrypted.'); }
        v.status = on ? 'suspended' : 'on';
        PC.ledger(state, on ? 'bl-suspend' : 'bl-resume', '');
        return ok(on ? 'Key protectors are disabled for volume C:.' : 'Key protectors are enabled for volume C:.');
    }

    /* manage-bde -off, Disable-BitLocker, Control Panel > Turn off BitLocker: decrypts C: and removes
     * every protector, as Windows does. Slots already used stay used (the key budget is per sitting). */
    function decrypt(state) {
        if (!PC.onDesktop(state)) { return fail('Windows is not running.'); }
        var v = vol(state);
        if (v.status === 'off') { return fail('ERROR: The volume C: is not encrypted.'); }
        v.status = 'off'; v.method = null; v.protectors = []; v.pendingRestart = false;
        PC.ledger(state, 'bl-off', '');
        return ok('Decryption is now in progress.');
    }

    /* manage-bde -status C: (and Get-BitLockerVolume's fields). */
    function status(state) {
        var v = vol(state);
        var conv = v.status === 'off' ? 'Fully Decrypted' : v.status === 'pending' ? 'Fully Decrypted' : 'Fully Encrypted';
        return {
            MountPoint: 'C:', VolumeStatus: conv === 'Fully Encrypted' ? 'FullyEncrypted' : 'FullyDecrypted',
            EncryptionPercentage: conv === 'Fully Encrypted' ? 100 : 0,
            EncryptionMethod: v.method && conv === 'Fully Encrypted' ? METHODS[v.method].replace(/[- ]/g, '') : 'None',
            ProtectionStatus: v.status === 'on' ? 'On' : 'Off',
            KeyProtector: v.protectors.map(function (p) { return p.type; }).join(', '),
            text: 'Volume C: [Windows]\n[OS Volume]\n\n    Size:                 ' + Math.round(PC.cSizeGb(state)) + '.00 GB\n    BitLocker Version:    ' + (conv === 'Fully Encrypted' ? '2.0' : 'None') +
                '\n    Conversion Status:    ' + conv + '\n    Percentage Encrypted: ' + (conv === 'Fully Encrypted' ? '100.0%' : '0.0%') +
                '\n    Encryption Method:    ' + (v.method && conv === 'Fully Encrypted' ? METHODS[v.method] : 'None') +
                '\n    Protection Status:    ' + (v.status === 'on' ? 'Protection On' : 'Protection Off') +
                '\n    Lock Status:          Unlocked\n    Key Protectors:\n' + (v.protectors.length ? v.protectors.map(function (p) { return '        ' + (p.type === 'Tpm' ? 'TPM' : 'Numerical Password'); }).join('\n') : '        None Found')
        };
    }

    /* manage-bde -protectors -get C:. */
    function listProtectors(state) {
        var v = vol(state);
        if (!v.protectors.length) { return 'ERROR: No key protectors found.'; }
        return 'Volume C: [Windows]\nAll Key Protectors\n\n' + v.protectors.map(function (p) {
            return p.type === 'Tpm' ? '    TPM:\n      ID: {' + p.id + '}\n      PCR Validation Profile:\n        7, 11\n'
                : '    Numerical Password:\n      ID: {' + p.id + '}\n      Password:\n        ' + p.password + '\n';
        }).join('\n');
    }

    module.exports = {
        METHODS: METHODS, EM_ARGS: EM_ARGS, MAX_PROTECTORS: MAX_PROTECTORS,
        vol: vol, blocked: blocked, methodFor: methodFor, wizard: wizard, manageBdeOn: manageBdeOn, enableBitLocker: enableBitLocker,
        protectorAdd: protectorAdd, protectorDelete: protectorDelete, suspend: suspend, decrypt: decrypt,
        status: status, listProtectors: listProtectors, writeUsb: writeUsb, keyFileText: keyFileText, backupToUsb: backupToUsb
    };
})();
