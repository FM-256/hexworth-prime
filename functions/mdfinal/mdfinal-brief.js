/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-brief.js — the student brief (fixed rules) and the work order's task list (per sitting).
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, 1.5, 2.2, 3.3, 13.5 item 8,
 * 13.6 items 2 and 6, 13.7 item 12, 13.8 item 2, 13.14 item 6.
 *
 * THE TASK LIST STATES WHAT IS REQUIRED, NEVER HOW. Each line names the outcome a CHECKS row
 * grades, in the words a real Meridian work order would use, with the WO's own values; it never
 * names the tool, the cmdlet or the setting path. Two things are deliberately left to the student:
 *   - the edition and licensing channel (derived from the requirements prose and the edition rule);
 *   - which startup apps are High impact (found in Task Manager; 13.14 item 6).
 * The VM is stated in full, as a host build sheet would: name, generation, memory, processors,
 * disk, switch, vTPM and Secure Boot (operator, 2026-11-05: every slot the student fills has its
 * value in the brief). "No Setup bypasses" still stands: the Setup checks are not to be skipped.
 *
 * Pure: reads the projected WO only (mdfinal-client.js projectWo), so it can say nothing the
 * projection withholds.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var LIM = require('./mdfinal-limits.js');
    var OS = require('./mdfinal-os.js');
    var PC = require('./mdfinal-pc.js');
    var EXAMS = require('./mdfinal-exams.js');

    /* Fixed passwords the brief prints (13.6 item 6). Only the join password is checked by the lab. */
    var PASSWORDS = LIM.deepFreeze({ technician: 'Meridian-Tech-2026', user: 'Meridian-User-2026', join: OS.JOIN_PASSWORD });

    /* The rules every student reads before starting. The numbers come from the exam constants, so
     * a change to the duration or the restart cap cannot leave the brief stale (Nancy D6 #8). */
    function rules(examId) {
        var minutes = EXAMS.durationMinutes(examId);
        var handoverBy = minutes - 40;
        var cap = EXAMS.SELF_RESET_CAP;
        return [
            'You have ' + minutes + ' minutes on the server clock. Refreshing the page resumes the same lab and the same clock.',
            'Build the workstation in this work order, then hand it over. Hand over by minute ' + handoverBy + ' (at least 40 minutes left): after handover a user ticket arrives on this PC, and you diagnose, fix, verify and record it.',
            'Handover is one way. Phases 1-6 are recorded as they stand at handover: a change that waits for a restart (a rename, a domain join, an update, BitLocker, the page file) counts only once the PC has restarted, so restart before you hand over. If Windows is not installed and set up when you hand over, Phase 7 and the incident record cannot be earned.',
            'You may restart your build up to ' + (cap === 1 ? 'once' : cap === 2 ? 'twice' : cap + ' times') + ' before handover. Restarting gives no extra time and your clock keeps running; it is not a second attempt, and any penalty you already incurred (for example, damaging the archive disk) still counts. You submit once.',
            'There is no Dr. Hex, no course content and no hint system during the exam. Nothing on screen tells you whether a step is right.',
            'The lab host is Hyper-V. The fabric attaches the MER-ARCHIVE, MER-POOL1, MER-POOL2 and TECH-USB disks to the VM you create. TECH-USB appears as F: inside Windows and in the host\'s Lab Files panel. After setup, C:\\LabFiles on the PC holds the installation packages.',
            'Windows 11 version 24H2 (build 26100) is pinned for this exam. KB numbers are lab values.',
            'The edition is chosen at install. Product keys do not change the edition in this lab. The KMS client setup keys are in the key table below.',
            'Setup and the OOBE consoles (Shift+F10) take one command per line; pipelines are available in the Windows console after setup. oobe\\bypassnro is the offline OOBE route. To reinstall, start the VM with the ISO attached and press any key.',
            'This image ships to laptops, but a VM has no battery and no sleep state: set the battery and sleep values with powercfg.',
            'Registry edits outside the areas this work order covers are recorded but have no effect.',
            'The consoles support the common cmdlets and tools, not every one. To set a password from a console: New-LocalUser prompts for it; for an existing account use net user <name> <password>. ConvertTo-SecureString is not available. If a command is not recognised, the matching window does the same job.',
            'Save the BitLocker recovery key to TECH-USB. You may need it.',
            'Passwords: technician account ' + PASSWORDS.technician + '; end-user accounts ' + PASSWORDS.user + '; domain join account (domain PCs only) ' + PASSWORDS.join + '.'
        ];
    }

    /* The public KMS client setup keys (GVLKs) for every edition the ISO library offers (spec 2.2:
     * "an in-exam GVLK table"). Every edition is listed, so the table says nothing about which one
     * this work order needs (Nancy D6 #3). */
    function keyTable() {
        return Object.keys(PC.GVLK).map(function (ed) { return { edition: 'Windows 11 ' + ed, key: PC.GVLK[ed] }; });
    }

    /* The time zone's display name, as Settings shows it. */
    function tzName(id) {
        var z = OS.TIME_ZONES.filter(function (x) { return x.id === id; })[0];
        return z ? z.display : id;
    }
    /* "08:00". */
    function hh(n) { return (n < 10 ? '0' : '') + n + ':00'; }

    /* The work order's tasks for one sitting, grouped by phase. `wo` is the PROJECTED work order. */
    function tasks(wo) {
        var domain = wo.join && wo.join.type === 'domain';
        var n = wo.network, d = wo.disks, u = wo.updates, p = wo.power;
        var T = [];
        var add = function (phase, text) { T.push({ phase: phase, text: text }); };

        /* The VM is named after the PC it hosts, as a host inventory would list it. The name is not a
         * generator field (GENERATOR_VERSION is frozen while sittings are live) and no check grades it. */
        add('P1', 'Create one Generation 2 VM named ' + wo.hostname + ' on the Meridian-LAN switch: ' + wo.vm.startupMemoryMB + ' MB of startup memory (static, not dynamic), ' + wo.vm.vcpu +
            ' virtual processors, and a new ' + wo.vm.vhdxGB + ' GB OS virtual hard disk. Enable its virtual TPM. Keep Secure Boot on. It must meet the Windows 11 hardware requirements natively: no Setup bypasses.');
        add('P1', 'Install Windows 11 ' + wo.build.version + ' (build ' + wo.build.build + ') from the ISO library, in the edition the requirements call for (see Requirements).');
        add('P1', 'Install Windows on the new OS disk. Create the Windows partition yourself, with C: at ' + d.cGB + ' GB; leave the rest of that disk unallocated for D:.');
        add('P1', 'MER-ARCHIVE holds the only copy of these files. Do not modify, format or delete it: ' +
            d.archiveManifest.map(function (f) { return f.name + ' (' + f.bytes + ' bytes, SHA-256 ' + f.sha256 + ')'; }).join('; ') + '.');
        add('P1', 'During setup, create the local technician administrator ' + wo.technician + ' (no Microsoft account). Turn off all six privacy settings and send required diagnostic data only.');
        /* a KMS host exists only on the volume-licensed (domain) work orders; the requirement prose
         * already names the channel, so printing it reveals nothing */
        add('P1', 'Activate Windows as the licensing requirement says.' + (n.kms ? ' KMS host: ' + n.kms.fqdn + ' (' + n.kms.ip + ').' : '') +
            ' Multiple Activation Key on this work order: ' + wo.mak + '. The box also carries a retail COA sticker: ' + wo.retailCoa + '.');

        add('P2', 'Name the PC ' + wo.hostname + ' and set the time zone to ' + tzName(wo.timeZone) + '.');
        add('P2', 'Install the ' + u.cumulativeKb + ' cumulative update and complete its restart.');
        add('P2', 'Create the power plan "' + p.planName + '" and make it the active plan. Plugged in: turn off the display after ' + p.acDisplayMin +
            ' minutes and sleep after ' + p.acSleepMin + ' minutes. On battery: turn off the display after ' + p.dcDisplayMin + ' minutes and sleep after ' + p.dcSleepMin + ' minutes.');

        add('P3', 'Create the local standard users ' + wo.user.name + ' (' + wo.user.fullName + ') and ' + wo.secondMember.name + ' (' + wo.secondMember.fullName +
            '). Their passwords never expire and they are not made to change them at next sign-in. ' + wo.user.name + ' is not an administrator.');
        add('P3', 'Create the local group ' + wo.group + ' with exactly two members: ' + wo.user.name + ' and ' + wo.secondMember.name + '.');
        add('P3', 'Set User Account Control to always notify.');
        add('P3', domain ? 'Join the ' + wo.join.domain + ' domain with ' + wo.join.joinAccount + '.'
                         : 'Keep the PC out of the domain, in the workgroup ' + wo.join.workgroup + '.');
        add('P3', 'The only local administrators are ' + wo.technician + (domain ? ' and what the domain join adds' : '') + '. The built-in Administrator and Guest stay disabled.');

        add('P4', 'Static IPv4 ' + n.ip + '/' + n.prefix + ' (mask ' + n.mask + '), gateway ' + n.gateway + ', DNS ' + n.dns[0] + ' then ' + n.dns[1] + '.');
        add('P4', 'LedgerSync listens on TCP ' + wo.lob.port + '. Allow it inbound from ' + n.lobRemoteSubnet + ' only, on the ' + (domain ? 'Domain and Private profiles' : 'Private profile') +
            ', never Public. This PC is not on a public network. All firewall profiles stay on.');
        add('P4', 'Allow Remote Desktop connections with Network Level Authentication; ' + wo.user.name + ' may sign in remotely.');
        add('P4', 'Share ' + wo.share.path + ' as ' + wo.share.name + '. Everyone has no share permission; ' + wo.group + ' may change files at share level, and its members end up with Modify access over the network. SMB 1.0 stays off.');

        add('P5', 'Create D: in all of the free space on the OS disk: NTFS, label ' + d.dLabel + '.');
        add('P5', 'Put both blank pool disks into one storage pool and create one storage space on it. ' + d.resiliencyProse + ' Give its volume the letter ' + d.spacesLetter +
            ':, NTFS, label ' + d.spacesLabel + '.');
        add('P5', 'Encrypt C: with BitLocker, XTS-AES 256, unlocked by the TPM, with a recovery password.');
        add('P5', 'On ' + wo.confidentialPath + ': it no longer inherits permissions; Users and Authenticated Users have no access; ' + wo.group +
            ' can read and run files; Administrators and SYSTEM keep full control.');
        add('P5', 'Update the Defender signatures. Exclude ' + wo.defenderExclusion + ' and nothing else. Real-time protection stays on.');

        add('P6', 'Install LedgerSync from C:\\LabFiles (LedgerSync_2.4_x64.msi and LedgerSync_2.4_x86.msi are there): the 64-bit package, configured for the server ' + wo.lob.fqdn + ' on port ' + wo.lob.port + '.');
        add('P6', 'Remove ' + wo.consumerApp + ' for the user and from the image, so new users do not get it. Calculator, Microsoft Store and Notepad stay.');
        add('P6', 'Defer feature updates ' + u.featureDeferralDays + ' days and quality updates ' + u.qualityDeferralDays + ' days by policy. Active hours ' + hh(u.activeHours.start) + ' to ' + hh(u.activeHours.end) + '.');
        add('P6', 'Disable the startup apps with a High startup impact. SecurityHealth stays enabled.');
        add('P6', 'Use a fixed page file on C: of ' + wo.performance.pagefileMB + ' MB (initial and maximum size the same), not system managed.');

        add('P7', 'When the build is done, hand the PC over. Then work the user\'s ticket on this PC: find the cause, fix it without breaking the build, and confirm the fix.');
        add('P8', 'Complete the as-built record: the recovery-password protector ID (its first 8 characters) and C:\'s encryption method. After handover, complete the incident record: root-cause category, the evidence identifier you found, and how you verified the fix.');
        return T;
    }

    module.exports = { rules: rules, keyTable: keyTable, PASSWORDS: PASSWORDS, tasks: tasks };
})();
