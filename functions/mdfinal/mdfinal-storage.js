/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-storage.js — disks once Windows runs: Disk Management, Shrink/Extend, Storage Spaces.
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, row 5.1, 1.3 knock-ons,
 * 13.6 item 5 (drive letters), R3 caps.
 *
 * Works on the same `state.disks` Setup partitioned (mdfinal-pc.js), so the D: a student creates
 * really sits in the free space Setup left, and the archive's protection carries over: any
 * operation that would destroy the archive volume records the same permanent damage evidence.
 * A formatted NTFS volume is registered with mdfinal-fs.js, so folders and ACLs on D: exist only
 * once D: does.
 *
 * DECLARED SIMPLIFICATIONS: the DVD drive is lettered R: by the lab image, so D: is free;
 * Windows' used space on C: is fixed at 30 GB, which bounds Shrink; a storage space takes the
 * whole pool (fixed provisioning, maximum size); one pool and one space per sitting.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var LIM = require('./mdfinal-limits.js');
    var PC = require('./mdfinal-pc.js');
    var FS = require('./mdfinal-fs.js');

    var MIN_C_MB = 30 * 1024;
    var MIN_POOL_DISK_GB = 4;
    var DVD_LETTER = 'R';

    function ok(msg) { return { ok: true, msg: msg || '' }; }
    function fail(msg) { return { ok: false, msg: msg }; }
    var NOT_RUNNING = 'Windows is not running.';

    /* Every drive letter in use (volumes on any disk, the DVD drive, a storage space). */
    function lettersInUse(state) {
        var used = [DVD_LETTER];
        state.disks.forEach(function (d) { d.partitions.forEach(function (p) { if (p.letter) { used.push(p.letter); } }); });
        return used;
    }
    function letterOk(state, raw) {
        var l = String(raw || '').trim().toUpperCase().replace(':', '');
        if (l.length !== 1 || l < 'D' || l > 'Z') { return null; }
        return lettersInUse(state).indexOf(l) >= 0 ? false : l;
    }

    /* The partition holding a drive letter, with its disk. */
    function byLetter(state, raw) {
        var l = String(raw || '').trim().toUpperCase().replace(':', '');
        for (var i = 0; i < state.disks.length; i++) {
            var d = state.disks[i];
            for (var j = 0; j < d.partitions.length; j++) { if (d.partitions[j].letter === l) { return { disk: d, part: d.partitions[j] }; } }
        }
        return null;
    }

    /* Disk Management > Initialize Disk, Initialize-Disk. GPT unless MBR is asked for. */
    function initDisk(state, n, style) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var d = PC.diskByNumber(state, n);
        if (!d || d.virtual === 'removed') { return fail('No MSFT_Disk objects found with property \'Number\' equal to \'' + n + '\'.'); }
        if (d.inPool) { return fail('The disk is part of a storage pool.'); }
        if (d.style !== null) { return fail('The disk has already been initialized.'); }
        var st = String(style || 'GPT').toUpperCase();
        if (st !== 'GPT' && st !== 'MBR') { return fail('Invalid partition style.'); }
        d.style = st;
        PC.ledger(state, 'disk-init', 'disk' + d.n);
        return ok('');
    }

    /* New Simple Volume wizard, New-Partition + Format-Volume. sizeMB null = use all free space. */
    function newVolume(state, p) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var d = PC.diskByNumber(state, p.disk);
        if (!d) { return fail('The disk was not found.'); }
        if (d.inPool) { return fail('The disk is part of a storage pool.'); }
        if (d.style === null) { return fail('The disk is not initialized. Initialize it before creating a volume.'); }
        if (!PC.roomFor(d, 1)) { return fail(PC.MSG_PART_CAP); }
        var free = PC.freeMb(d);
        var mb = p.sizeMB === null || p.sizeMB === undefined ? free : Math.floor(Number(p.sizeMB));
        if (!(mb >= 8) || mb > free) { return fail('Not enough available capacity'); }
        var letter = null;
        /* the New Simple Volume wizard offers the next free letter by default (Nancy D4 B6) */
        if ((p.letter === undefined || p.letter === '') && p.defaultLetter === true) {
            for (var c = 68; c <= 90 && !letter; c++) { if (lettersInUse(state).indexOf(String.fromCharCode(c)) < 0) { letter = String.fromCharCode(c); } }
        } else if (p.letter !== undefined && p.letter !== null && p.letter !== '') {
            letter = letterOk(state, p.letter);
            if (letter === null) { return fail('The drive letter is not valid.'); }
            if (letter === false) { return fail('The specified drive letter is in use.'); }
        }
        /* RAW: New-Partition makes an unformatted partition; Format-Volume formats it later. */
        var fsType = String(p.fs || 'NTFS').toUpperCase();
        if (['NTFS', 'REFS', 'EXFAT', 'FAT32', 'RAW'].indexOf(fsType) < 0) { return fail('Invalid file system.'); }
        if (fsType === 'FAT32' && mb > 32 * 1024) { return fail('The volume size is too big for FAT32.'); }
        var label = String(p.label || '').slice(0, 32);
        PC.addPartition(d, 'Primary', mb, { letter: letter, fs: fsType === 'RAW' ? null : fsType, label: label || null, explicit: true });
        if (letter && fsType === 'NTFS') { FS.mountVolume(state, letter); }
        PC.ledger(state, 'volume-new', 'disk' + d.n);
        return ok('');
    }

    /* Format-Volume / Disk Management Format on an existing lettered volume. */
    function formatVolume(state, letterRaw, fsRaw, labelRaw) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var hit = byLetter(state, letterRaw);
        if (!hit) { return fail('No MSFT_Volume objects found with property \'DriveLetter\' equal to \'' + String(letterRaw).slice(0, 2) + '\'.'); }
        if (hit.part.letter === 'C') { return fail('You can\'t format this volume. It contains the version of Windows that you are using.'); }
        var fsType = String(fsRaw || 'NTFS').toUpperCase();
        if (['NTFS', 'REFS', 'EXFAT', 'FAT32'].indexOf(fsType) < 0) { return fail('Invalid file system.'); }
        if (hit.part.files) { delete hit.part.files; PC.damageArchive(state, hit.disk, 'formatted'); }
        FS.unmountVolume(state, hit.part.letter);
        hit.part.fs = fsType; hit.part.label = String(labelRaw || '').slice(0, 32) || null;
        if (fsType === 'NTFS') { FS.mountVolume(state, hit.part.letter); }
        PC.ledger(state, 'volume-format', 'disk' + hit.disk.n);
        return ok('');
    }

    /* Change Drive Letter and Paths, Set-Partition -NewDriveLetter. */
    function changeLetter(state, fromRaw, toRaw) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var hit = byLetter(state, fromRaw);
        if (!hit) { return fail('The volume was not found.'); }
        if (hit.part.letter === 'C') { return fail('Windows cannot modify the drive letter of your system or boot volume.'); }
        var to = letterOk(state, toRaw);
        if (to === null) { return fail('The drive letter is not valid.'); }
        if (to === false) { return fail('The specified drive letter is in use.'); }
        var fsv = state.fs && state.fs.volumes[hit.part.letter];
        if (fsv) { state.fs.volumes[to] = fsv; delete state.fs.volumes[hit.part.letter]; rekey(fsv, hit.part.letter, to); }
        hit.part.letter = to;
        PC.ledger(state, 'volume-letter', 'disk' + hit.disk.n);
        return ok('');
    }
    /* Rewrites folder paths after a letter change. */
    function rekey(vol, from, to) {
        var out = {};
        Object.keys(vol.folders).forEach(function (k) {
            var f = vol.folders[k];
            f.path = to + f.path.slice(1);
            out[to + k.slice(1)] = f;
        });
        vol.folders = out;
    }

    /* Delete Volume, Remove-Partition. Never C:; the archive's data is permanent evidence. */
    function deleteVolume(state, letterRaw) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var hit = byLetter(state, letterRaw);
        if (!hit) { return fail('The volume was not found.'); }
        if (hit.part.letter === 'C') { return fail('Windows cannot delete the system or boot volume.'); }
        if (hit.part.files) { PC.damageArchive(state, hit.disk, 'deleted'); }
        FS.unmountVolume(state, hit.part.letter);
        hit.disk.partitions.splice(hit.disk.partitions.indexOf(hit.part), 1);
        PC.ledger(state, 'volume-delete', 'disk' + hit.disk.n);
        return ok('');
    }

    /* Shrink Volume (C: or a data volume): by MB, down to Windows' used space. */
    function shrink(state, letterRaw, byMb) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var hit = byLetter(state, letterRaw);
        if (!hit) { return fail('The volume was not found.'); }
        var n = Math.floor(Number(byMb));
        var floor = hit.part.letter === 'C' ? MIN_C_MB : 8;
        if (!(n >= 1) || hit.part.mb - n < floor) { return fail('The specified shrink size is too big and will cause the volume to be smaller than the minimum volume size.'); }
        hit.part.mb -= n;
        PC.ledger(state, 'volume-shrink', 'disk' + hit.disk.n);
        return ok('');
    }

    /* Extend Volume into free space on the same disk. */
    function extend(state, letterRaw, byMb) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var hit = byLetter(state, letterRaw);
        if (!hit) { return fail('The volume was not found.'); }
        var free = PC.freeMb(hit.disk);
        var n = byMb === null || byMb === undefined ? free : Math.floor(Number(byMb));
        if (!(n >= 1) || n > free) { return fail('Not enough available capacity'); }
        hit.part.mb += n;
        PC.ledger(state, 'volume-extend', 'disk' + hit.disk.n);
        return ok('');
    }

    /* Get-PhysicalDisk -CanPool: blank (no partitions), not the OS disk, at least 4 GB, not pooled. */
    function canPool(state, d) {
        return !!d && d.role !== 'os' && d.role !== 'usb' && !d.virtual && !d.inPool && d.partitions.length === 0 && d.gb >= MIN_POOL_DISK_GB;
    }

    /* Storage Spaces > Create a pool, New-StoragePool. */
    function newPool(state, name, numbers) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        if (state.pool) { return fail('This exam lab allows one storage pool.'); }
        var nm = String(name || '').trim();
        if (!nm || nm.length > 64) { return fail('Enter a pool name.'); }
        var disks = [];
        for (var i = 0; i < numbers.length; i++) {
            var d = PC.diskByNumber(state, numbers[i]);
            if (!canPool(state, d)) { return fail('One or more physical disks cannot be added to the pool (CanPool is False).'); }
            if (disks.indexOf(d) < 0) { disks.push(d); }
        }
        if (!disks.length) { return fail('Select at least one drive.'); }
        disks.forEach(function (d) { d.inPool = true; d.style = null; });
        state.pool = { name: nm, disks: disks.map(function (d) { return d.file; }), space: null };
        PC.ledger(state, 'pool-new', String(disks.length));
        return ok('');
    }

    /* New-VirtualDisk: a space of the whole pool with the chosen resiliency, appearing as a new
     * raw disk (not initialised), exactly as the cmdlet leaves it. */
    function newVirtualDisk(state, p) {
        if (!PC.onDesktop(state)) { return fail(NOT_RUNNING); }
        var pool = state.pool;
        if (!pool || (p.pool !== undefined && String(p.pool).toLowerCase() !== pool.name.toLowerCase())) { return fail('No MSFT_StoragePool objects found with property \'FriendlyName\' equal to \'' + String(p.pool || '').slice(0, 64) + '\'.'); }
        if (pool.space) { return fail('This exam lab allows one storage space.'); }
        var r = String(p.resiliency || '').toLowerCase();
        var res = r === 'mirror' || r === 'two-way mirror' ? 'Two-way mirror' : r === 'simple' ? 'Simple' : null;
        if (!res) { return fail('Choose a resiliency type.'); }
        var members = state.disks.filter(function (d) { return pool.disks.indexOf(d.file) >= 0; });
        if (res === 'Two-way mirror' && members.length < 2) { return fail('A two-way mirror needs at least two drives.'); }
        var raw = members.reduce(function (a, d) { return a + d.gb; }, 0);
        var gb = res === 'Two-way mirror' ? Math.floor(raw / 2) : raw;
        var n = state.disks.reduce(function (m, d) { return Math.max(m, d.n); }, 0) + 1;
        state.disks.push({ n: n, file: 'StorageSpace', gb: gb, role: 'space', style: null, partitions: [], nextId: 1, virtual: 'space' });
        pool.space = { name: String(p.name || 'Storage space').slice(0, 64), resiliency: res, gb: gb, disk: n };
        PC.ledger(state, 'space-new', res === 'Simple' ? 'simple' : 'mirror');
        return ok('');
    }

    /* Control Panel > Storage Spaces > Create a storage space: the space, initialised GPT, one
     * volume of all of it, formatted, in one go. */
    function newSpace(state, p) {
        var letter = letterOk(state, p.letter);
        if (letter === null) { return fail('The drive letter is not valid.'); }
        if (letter === false) { return fail('The specified drive letter is in use.'); }
        var fsType = String(p.fs || 'NTFS').toUpperCase();
        if (['NTFS', 'REFS'].indexOf(fsType) < 0) { return fail('Storage spaces use NTFS or ReFS.'); }
        var v = newVirtualDisk(state, { name: p.name, resiliency: p.resiliency });
        if (!v.ok) { return v; }
        var n = state.pool.space.disk;
        initDisk(state, n, 'GPT');
        return newVolume(state, { disk: n, sizeMB: null, letter: letter, fs: fsType, label: p.label });
    }

    module.exports = {
        MIN_C_MB: MIN_C_MB, DVD_LETTER: DVD_LETTER, lettersInUse: lettersInUse, byLetter: byLetter,
        initDisk: initDisk, newVolume: newVolume, formatVolume: formatVolume, changeLetter: changeLetter,
        deleteVolume: deleteVolume, shrink: shrink, extend: extend, canPool: canPool, newPool: newPool, newVirtualDisk: newVirtualDisk, newSpace: newSpace
    };
})();
