/* ============================================================
   DISPATCH LAB — Box OS2: Update Nightmare
   CompTIA A+ Core 2 — Update Nightmare (1.6)
   5 distinct scenarios
   ============================================================ */

var OS2Config = {

    title: 'Update Nightmare',
    subtitle: 'Stuck at 47% — A+ Core 2 Windows Update Troubleshooting',
    difficulty: 'Intermediate',
    accent: '#3b82f6',
    storageKey: 'hexworth_lab_os2',
    registryId: 'os002-update-nightmare',
    trackerKey: 'lab_os2',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the complaint.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check diagnostics', tip: 'Open the diagnostic panel to inspect the system.', trigger: { event: 'window_open', match: { type: 'hw_panel' } } },
            { title: 'Investigate the root cause', tip: 'Use Command Prompt and the diagnostic panel to identify the problem.', trigger: { event: 'command', match: { cmd: 'contains:help' }, alt: [{ event: 'window_open', match: { type: 'hw_panel' } }] } },
            { title: 'Apply the fix', tip: 'Each scenario has a different fix. Most can be performed in Command Prompt — type help for the tools — or applied from the Update Panel.', trigger: { event: 'window_open', match: { type: 'hw_panel' } } },
            { title: 'Capture the flag', tip: 'After fixing the issue, locate the token.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: { certPath: 'A+ Core 2 / MD-100', mappings: [
            /* MD-100 M07: Manage Apps & Windows Updates. Module id and title taken from
               _app/tenant/md-100-map.js, the course map, so this claim matches what the
               course actually teaches. Deliberately NOT the 5.1/4.1 style the two older
               MD-100 boxes use: MD-100 has four exam domains and no in-repo source
               defines that numbering, so reusing it would be inventing a citation. */
            { flagId: 'fixed', objective: 'M07', description: 'Manage Apps & Windows Updates', skill: 'Windows Update troubleshooting, servicing stack, update rollback' },
        { flagId: 'fixed', objective: '1.6', description: 'Configure Windows updates', skill: 'Windows Update Troubleshooting' }
    ] },

    _scenarioFlags: { update_stuck: null, rollback_fail: null, driver_update_broke: null, reboot_loop: null, no_space_update: null },

    _scenarios: [
        {
            id: 'update_stuck',
            name: 'Windows Update Stuck at Percentage',
            ticketSubject: 'Windows Update has been stuck at 47% for 3 hours',
            ticketDetail: 'I started a Windows Update this morning and it has been stuck at 47% for over 3 hours. The progress bar is not moving at all. The computer is not frozen — I can still use it. But the update will not progress or cancel. I need this computer for work.',
            ticketExtra: 'IT Note: Stuck updates often mean the Windows Update service or BITS (Background Intelligent Transfer Service) has stalled. Try stopping the wuauserv and BITS services, clearing the SoftwareDistribution folder, and restarting the services. The update will re-download cleanly.',
            affectedDevice: 0,
            fixDescription: 'Stop wuauserv/BITS, clear SoftwareDistribution folder, restart services',
            stateOverrides: { _updateStuck: true }
        },
        {
            id: 'rollback_fail',
            name: 'Failed Update Will Not Roll Back',
            ticketSubject: 'Update failed but now Windows will not roll back — stuck in a loop',
            ticketDetail: 'A Windows Update failed during installation. Now every time the computer restarts it says "Undoing changes made to your computer" and then restarts again. It has been in this loop for an hour. I cannot get to the desktop at all.',
            ticketExtra: 'IT Note: The automatic rollback is failing. On the real machine you would boot into Windows Recovery Environment (WinRE) — interrupt boot three times, or use the USB recovery drive — and choose Uninstall Updates or System Restore. In this lab: the workstation is already attached over the out-of-band console, so perform the recovery action from the Update Panel. The terminal cannot reach WinRE, and offline switches such as /offbootdir will say so.',
            affectedDevice: 0,
            fixDescription: 'Boot to WinRE, use Uninstall Latest Quality Update or System Restore',
            stateOverrides: { _rollbackFail: true }
        },
        {
            id: 'driver_update_broke',
            name: 'Driver Update Broke Audio',
            ticketSubject: 'No sound at all after Windows Update — speaker icon shows X',
            ticketDetail: 'After the latest Windows Update, I have no audio at all. The speaker icon in the system tray has a red X. I checked the volume — it is not muted. I tried plugging in headphones and those do not work either. Audio was working perfectly before the update.',
            ticketExtra: 'IT Note: Windows Update occasionally pushes generic audio drivers that replace the manufacturer driver. On the real machine, Device Manager would show a generic "High Definition Audio Device" instead of the Realtek/manufacturer driver, and you would use Driver > Roll Back Driver. In this lab: perform the rollback from the Update Panel. Separately, reg add ExcludeWUDriversInQualityUpdate stops Windows Update replacing drivers again — that is prevention, not the fix for this ticket.',
            affectedDevice: 0,
            fixDescription: 'Roll back audio driver in Device Manager to restore OEM driver',
            stateOverrides: { _driverBrokeAudio: true }
        },
        {
            id: 'reboot_loop',
            name: 'Cumulative Update Reboot Loop',
            ticketSubject: 'Computer keeps restarting after cumulative update — never finishes',
            ticketDetail: 'My computer installed a cumulative update last night. Now it keeps restarting in a loop: "Working on updates 63% — Don\'t turn off your computer" then it restarts, then goes back to 63%, restarts again. This has been going on since this morning.',
            ticketExtra: 'IT Note: Cumulative update is failing at the same point repeatedly. The update package may be corrupt. Boot into Safe Mode (since the update processing does not run in Safe Mode), then use DISM to clean up the component store and run the Windows Update troubleshooter. If that fails, use WUSA to uninstall the specific KB.',
            affectedDevice: 0,
            fixDescription: 'Boot Safe Mode, run DISM component cleanup, remove corrupt update via WUSA',
            stateOverrides: { _rebootLoop: true }
        },
        {
            id: 'no_space_update',
            name: 'Not Enough Disk Space for Update',
            ticketSubject: 'Windows Update says not enough disk space — C: drive is almost full',
            ticketDetail: 'Windows Update keeps failing with "Not enough disk space to install the update." My C: drive only has 2 GB free. I tried deleting some files but the update needs at least 20 GB according to the error. I do not know what else I can delete safely.',
            ticketExtra: 'IT Note: Major feature updates require 20+ GB. Run Disk Cleanup with system file cleanup (Previous Windows installations, Windows Update Cleanup, Delivery Optimization Files). Also check for large files in Downloads, Temp, and user profile. If still insufficient, use an external USB drive as temporary update storage (Windows 10 2004+ supports this).',
            affectedDevice: 0,
            fixDescription: 'Run Disk Cleanup with system files, clear temp/downloads, use USB for update storage',
            /* 2.1 GB matches the ticket ('only has 2 GB free') and the walkthrough's
             * measured 2,253,619,200 bytes. Without it the scenario opened with the
             * default 84.3 GB and was already solved before the student typed anything. */
            stateOverrides: { _noSpaceUpdate: true, _freeGb: 2.1 }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Read the ticket and check the diagnostic panel.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Each scenario has a unique root cause. Investigate carefully.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use the diagnostic panel to inspect and fix components.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after applying the fix.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        update_stuck: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'In Command Prompt: net stop wuauserv, then net stop bits, then del /q /s C:\\Windows\\SoftwareDistribution\\Download\\*, then net start wuauserv and net start bits. The delete is refused until the service is stopped.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Either finish the procedure in Command Prompt, or click Apply Fix in the Update Panel. Both complete the ticket.', cost: 150, penalty: -150 }
        ],
        rollback_fail: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The real fix is WinRE: Uninstall Latest Quality Update, or System Restore. This lab image does not boot to WinRE, so apply the recovery action from the Update Panel.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Either finish the procedure in Command Prompt, or click Apply Fix in the Update Panel. Both complete the ticket.', cost: 150, penalty: -150 }
        ],
        driver_update_broke: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Roll back the audio driver to restore the OEM driver. Device Manager is not part of this lab image — do it from the Update Panel.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Either finish the procedure in Command Prompt, or click Apply Fix in the Update Panel. Both complete the ticket.', cost: 150, penalty: -150 }
        ],
        reboot_loop: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Find the failing update with wmic qfe list brief, then run dism /online /cleanup-image /startcomponentcleanup and remove it with wusa /uninstall /kb:<id>.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Either finish the procedure in Command Prompt, or click Apply Fix in the Update Panel. Both complete the ticket.', cost: 150, penalty: -150 }
        ],
        no_space_update: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Check the shortfall with wmic logicaldisk get size,freespace,caption. Reclaim space with cleanmgr /sagerun:1, or individually: del /q /s C:\\Windows\\Temp\\*, rd /s /q C:\\Windows.old. The update needs 20 GB.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Either finish the procedure in Command Prompt, or click Apply Fix in the Update Panel. Both complete the ticket.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !OS2Config._flagRestored) { OS2Config._flagRestored = true; var s = OS2Config._scenarios[engine.state._scenarioId]; if (s) OS2Config.hints = OS2Config._scenarioHints[s.id] || OS2Config._defaultHints; } return true; },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        engine.state._updateStuck = false; engine.state._rollbackFail = false; engine.state._driverBrokeAudio = false; engine.state._rebootLoop = false; engine.state._noSpaceUpdate = false;
        engine.state._labComplete = false; engine.state._flagRevealed = false;
        /* Simulated machine state the terminal acts on. Reset per scenario so switching
         * tickets cannot carry a half-finished repair into the next one. */
        engine.state._svc = OS2Config._freshServices();
        engine.state._sdCleared = false; engine.state._sdRemoved = false;
        engine.state._componentCleanup = false; engine.state._kbRemoved = false;
        engine.state._regDriverBlock = false; engine.state._freeGb = OS2Config._FREE_GB_DEFAULT;
        engine.state._tempCleared = false; engine.state._windowsOldRemoved = false;
        var ov = OS2Config._scenarios[idx].stateOverrides || {}; for (var k in ov) engine.state[k] = ov[k];
        OS2Config._flagRestored = true; OS2Config.hints = OS2Config._scenarioHints[OS2Config._scenarios[idx].id] || OS2Config._defaultHints; engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : OS2Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Help Desk Ticket first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    /* ────────────────────────────────────────────────────────────────────────────
       SIMULATED MACHINE STATE

       Before this existed the box had none: the terminal declared 23 commands, none of
       which were Windows Update tools, while the ticket, the hints and the walkthrough all
       instructed `net stop wuauserv`, `del …\SoftwareDistribution\Download\*`,
       `sfc /scannow`, `dism`, `wmic`, `cleanmgr`, `wusa` and `reg`. Measured on production
       2026-09-16: 28 documented commands typed verbatim, 28 failed, 0 of 5 scenarios
       reachable by the path the box itself documents.

       The state below is what those commands act on. It is deliberately small — services,
       a cleared-cache flag, a component-store flag, a removed-KB flag and a free-space
       number — because that is exactly the surface the five tickets describe and nothing
       more.
       ──────────────────────────────────────────────────────────────────────────── */

    /* name -> display name, as `net stop` accepts either. */
    _SERVICES: [
        { key: 'wuauserv',         display: 'Windows Update' },
        { key: 'bits',             display: 'Background Intelligent Transfer Service' },
        { key: 'cryptsvc',         display: 'Cryptographic Services' },
        { key: 'msiserver',        display: 'Windows Installer' },
        { key: 'trustedinstaller', display: 'Windows Modules Installer' }
    ],

    _freshServices() {
        return { wuauserv: 'Running', bits: 'Running', cryptsvc: 'Running', msiserver: 'Stopped', trustedinstaller: 'Stopped' };
    },

    /* LAZY, because a student mid-box has a saved state from before these fields existed.
     * BoxEngine.load() merges the saved JSON over _defaults(), so _svc is simply absent
     * there and every accessor would read undefined. */
    _svc(engine) {
        if (!engine.state._svc) { engine.state._svc = OS2Config._freshServices(); engine.save(); }
        return engine.state._svc;
    },

    _FREE_GB_DEFAULT: 84.3,

    /* DERIVED, NOT DUPLICATED. The starting free-space figure for a scenario lives in that
     * scenario's own stateOverrides. This fallback used to repeat the 2.1 literal, with
     * nothing forcing the two to agree — so editing the ticket's number would silently leave
     * a student restored from an older save on the old one. */
    _free(engine) {
        if (typeof engine.state._freeGb !== 'number') {
            var sc = OS2Config._getScenario(engine);
            var ov = (sc && sc.stateOverrides) || {};
            engine.state._freeGb = (typeof ov._freeGb === 'number') ? ov._freeGb : OS2Config._FREE_GB_DEFAULT;
            engine.save();
        }
        return engine.state._freeGb;
    },

    /* Services that hold handles under SoftwareDistribution. Named once so `del` and `rd`
     * cannot drift apart, and so the refusal message lists exactly what is still running. */
    _SD_HOLDERS: ['wuauserv', 'bits'],

    _svcHolding(engine) {
        var table = OS2Config._svc(engine);
        return OS2Config._SERVICES.filter(function (s) {
            return OS2Config._SD_HOLDERS.indexOf(s.key) > -1 && table[s.key] === 'Running';
        });
    },

    /* SPACE IS CREDITED ONCE PER RESOURCE, BY THE FLAG THAT OWNS IT.
     * Chris found `rd C:\Windows\SoftwareDistribution\Download` followed by
     * `rd C:\Windows\SoftwareDistribution` paying out 3.2 GB TWICE: the child branch set
     * _sdCleared, the parent branch gated its credit on _sdRemoved, and neither knew what the
     * other had already reclaimed. Free space went 2.1 -> 5.3 -> 8.5 for one folder's worth
     * of files, in the box whose entire ticket is counting gigabytes.
     *
     * _completeScenario exists because two writers cannot be trusted to agree about what
     * "done" means. The same is true of arithmetic: every reclamation now goes through here,
     * keyed on the flag that owns those bytes, so no ordering of del / rd / cleanmgr can pay
     * for the same files more than once. */
    _RECLAIM: { _sdCleared: 3.2, _tempCleared: 1.8, _windowsOldRemoved: 18.4, _componentCleanup: 2.6 },

    _reclaim(engine, flag) {
        if (engine.state[flag]) return 0;
        engine.state[flag] = true;
        var gb = OS2Config._RECLAIM[flag] || 0;
        OS2Config._addFree(engine, gb);
        return gb;
    },

    _addFree(engine, gb) {
        engine.state._freeGb = Math.round((OS2Config._free(engine) + gb) * 10) / 10;
        engine.save();
    },

    /* `net stop bits` and `net stop "Background Intelligent Transfer Service"` are the same
     * command. Terminal._parseLine strips quotes, so the display form arrives as separate
     * argv entries and is matched on the rejoined string. */
    _resolveSvc(text) {
        var t = String(text || '').trim().toLowerCase();
        if (!t) return null;
        for (var i = 0; i < OS2Config._SERVICES.length; i++) {
            var s = OS2Config._SERVICES[i];
            if (t === s.key || t === s.display.toLowerCase()) return s;
        }
        return null;
    },

    /* THE ONLY PLACE A SCENARIO IS MARKED COMPLETE.
     *
     * The Apply Fix button and every terminal repair sequence route through here. An
     * earlier design had the terminal path mirror the button's writes; Nancy pointed out
     * that it would have set _flagRevealed and _labComplete but forgotten the scenario's
     * OWN stateOverrides key — and _renderPanel gates "ISSUE DETECTED" on that key alone,
     * so the panel would have shown "ISSUE DETECTED" and "Fix Confirmed" simultaneously.
     * One writer cannot disagree with itself. */
    _completeScenario(engine, notice) {
        var sc = OS2Config._getScenario(engine);
        if (!sc || engine.state._flagRevealed) return;
        engine.state[Object.keys(sc.stateOverrides)[0]] = false;
        engine.state._flagRevealed = true;
        engine.state._labComplete = true;
        engine.save();
        engine.notify(notice || 'Fix applied successfully. Check the Update Panel for the token.', 'success');
        OS2Config._renderPanel(engine);
        OS2Config._renderServices(engine);
    },

    _BAD_KB: 'KB5031354',

    _pad(str, n) { str = String(str); return new Array(Math.max(0, n - str.length) + 1).join(' ') + str; },
    _commas(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); },

    /* The four paths the walkthrough investigates, plus their parents. Contents derive from
     * the SAME state del/rd/cleanmgr mutate, so `dir` shows the machine as the student has
     * actually left it rather than a fixed string. */
    _normPath(rawPath) {
        var path = String(rawPath || '').trim().replace(/^["']|["']$/g, '').replace(/\\+$/, '').toLowerCase();
        return (path === 'c:') ? 'c:\\' : path;
    },

    /* DIR AND CD MUST AGREE, OR DIR IS LYING.
     * box-shell-consistency's SHELL-002 caught this the moment `dir` grew a real listing:
     * it advertised Desktop, Documents and Downloads at the start directory while `cd`
     * refused all three, because the box's declared `filesystem` is empty. Rather than
     * trim the listing, both commands now resolve through here — so anything `dir` shows
     * as <DIR> is by construction somewhere `cd` can go. */
    _dirEntry(engine, rawPath) {
        var path = OS2Config._normPath(rawPath);
        var explicit = OS2Config._dirExplicit(engine, path);
        if (explicit) return explicit;
        var advertised = OS2Config._advertisedDir(engine, path);
        if (advertised) return { label: advertised, items: [], totalFiles: 0, totalBytes: 0 };
        return null;
    },

    /* Is `path` a directory some other listing shows? Returns its display label. */
    _advertisedDir(engine, path) {
        var i = path.lastIndexOf('\\');
        if (i < 2) return null;
        var parent = path.slice(0, i);
        if (parent === 'c:') parent = 'c:\\';
        var leaf = path.slice(i + 1);
        var pe = OS2Config._dirExplicit(engine, parent);
        if (!pe) return null;
        var hit = null;
        pe.items.forEach(function (it) { if (it.dir && it.name.toLowerCase() === leaf) hit = it.name; });
        return hit ? (pe.label.replace(/\\+$/, '') + '\\' + hit) : null;
    },

    _dirExplicit(engine, path) {
        var st = engine.state;
        var GB = 1073741824;
        if (path === 'c:\\' || path === 'c:\\.') {
            var roots = [{ name: 'PerfLogs', dir: true }, { name: 'Program Files', dir: true }, { name: 'Users', dir: true }, { name: 'Windows', dir: true }];
            if (!st._windowsOldRemoved) roots.push({ name: 'Windows.old', dir: true });
            return { label: 'C:\\', items: roots };
        }
        if (path === 'c:\\users') {
            return { label: 'C:\\Users', items: [{ name: 'Public', dir: true }, { name: 'Technician', dir: true }], totalFiles: 12847, totalBytes: Math.round(4.1 * GB) };
        }
        if (path === 'c:\\users\\technician') {
            return { label: 'C:\\Users\\Technician', items: [{ name: 'Desktop', dir: true }, { name: 'Documents', dir: true }, { name: 'Downloads', dir: true }], totalFiles: 61, totalBytes: Math.round(0.4 * GB) };
        }
        if (path === 'c:\\windows\\temp') {
            if (st._tempCleared) return { label: 'C:\\Windows\\Temp', items: [], totalFiles: 0, totalBytes: 0 };
            return { label: 'C:\\Windows\\Temp', items: [{ name: 'CBS.log', size: 412000000 }, { name: 'MpCmdRun.log', size: 18400000 }, { name: 'TS_A41C.tmp', size: 92100000 }], totalFiles: 3911, totalBytes: Math.round(1.8 * GB) };
        }
        if (path === 'c:\\windows.old') {
            if (st._windowsOldRemoved) return null;
            return { label: 'C:\\Windows.old', items: [{ name: 'Program Files', dir: true }, { name: 'Users', dir: true }, { name: 'Windows', dir: true }], totalFiles: 184203, totalBytes: Math.round(18.4 * GB) };
        }
        if (path === 'c:\\windows\\softwaredistribution' || path === 'c:\\windows\\softwaredistribution\\download') {
            if (st._sdRemoved) return null;
            if (path.indexOf('download') === -1) return { label: 'C:\\Windows\\SoftwareDistribution', items: [{ name: 'DataStore', dir: true }, { name: 'Download', dir: true }] };
            if (st._sdCleared) return { label: 'C:\\Windows\\SoftwareDistribution\\Download', items: [], totalFiles: 0, totalBytes: 0 };
            return { label: 'C:\\Windows\\SoftwareDistribution\\Download', items: [{ name: 'a9f2c1e0b7', dir: true }, { name: 'install.esd', size: 3120000000 }], totalFiles: 1284, totalBytes: Math.round(3.2 * GB) };
        }
        if (path === 'c:\\windows') return { label: 'C:\\Windows', items: [{ name: 'Logs', dir: true }, { name: 'SoftwareDistribution', dir: true }, { name: 'System32', dir: true }, { name: 'Temp', dir: true }] };
        return null;
    },

    /* Called after every state-changing command. Each scenario names the condition its own
     * hint3 and ticket describe, so a student who follows the documented procedure finishes
     * — and one who types an unrelated command does not. */
    _checkComplete(engine) {
        var sc = OS2Config._getScenario(engine);
        if (!sc || engine.state._flagRevealed) return '';
        var svc = OS2Config._svc(engine);
        if (sc.id === 'update_stuck') {
            if (engine.state._sdCleared && svc.wuauserv === 'Running' && svc.bits === 'Running') {
                OS2Config._completeScenario(engine, 'Update cache cleared and services restarted. Token available in the Update Panel.');
                return '\nWindows Update is servicing normally. The stalled update has been discarded and will re-download.\n';
            }
        } else if (sc.id === 'reboot_loop') {
            /* TWO legitimate remedies for a cumulative update that fails at the same point
             * every time, and the box documents both: remove the failing package (hint3,
             * fixDescription), or discard the cached download so it re-acquires cleanly
             * (the walkthrough's Step 1). Accepting only the first would have failed a
             * student who followed the walkthrough exactly. */
            /* EITHER WAY OF DISCARDING THE CACHE COUNTS.
             * Chris found this branch accepted only `rd /s /q C:\Windows\SoftwareDistribution`
             * (which sets _sdRemoved). A student who instead used
             * `del /q /s C:\Windows\SoftwareDistribution\Download\*` — the very command that
             * legitimately solves update_stuck — got an honest "1,284 File(s) deleted", both
             * services back up, and no completion. Nothing on screen was wrong, but the box
             * withheld credit for a fix that genuinely works: emptying the Download folder
             * forces the corrupt cumulative update to re-acquire just as removing the parent
             * does. The acceptance set now matches what actually repairs the machine rather
             * than the one spelling the walkthrough happens to print. */
            var cacheCleared = (engine.state._sdRemoved || engine.state._sdCleared)
                && svc.wuauserv === 'Running' && svc.bits === 'Running';
            if ((engine.state._componentCleanup && engine.state._kbRemoved) || cacheCleared) {
                OS2Config._completeScenario(engine, 'The failing cumulative update has been cleared. Token available in the Update Panel.');
                return '\nThe update loop is broken. The system will complete its next boot normally.\n';
            }
        } else if (sc.id === 'no_space_update') {
            if (OS2Config._free(engine) >= 20) {
                OS2Config._completeScenario(engine, 'Enough space reclaimed for the feature update. Token available in the Update Panel.');
                return '\nC: now has enough free space for the feature update to stage.\n';
            }
        }
        return '';
    },


    boot: { biosLines: ['UEFI BIOS v2.20', 'Memory: 16384 MB', 'Boot: NVMe0'], grubEntries: ['Windows 10 Pro'], loginUser: 'Technician' },
    desktop: { icons: [
        { id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' },
        { id: 'hw_panel', label: 'Update\nPanel', icon: 'UPD', app: 'hw_panel' },
        { id: 'services', label: 'Services', icon: 'SVC', app: 'services' },
        { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' },
        { id: 'hints', label: 'Hints', icon: '?', app: 'hints' },
        { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }
    ] },
    terminal: { user: 'Technician', hostname: 'HELPDESK01', startDir: 'C:\\Users\\Technician', promptStyle: 'windows', welcome: 'Microsoft Windows [Version 10.0.19045.3803]\n(c) Microsoft Corporation. All rights reserved.\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Check the diagnostic panel.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Each scenario has a unique root cause.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use the panel to inspect and fix.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Flag after fix.', cost: 50, penalty: -50 }
    ],
    lore: { intro: 'Update Nightmare scenarios test your ability to diagnose and resolve real-world A+ Core 2 problems.', scenario: 'Five distinct failure modes, each requiring different tools and approaches.', outro: 'Issue resolved. Solid troubleshooting identified and fixed the root cause.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read ticket and check status.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify root cause.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Apply the fix.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm and get flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        whoami: function() { return 'HELPDESK01\\Technician'; },
        hostname: function() { return 'HELPDESK01'; },
        cls: function(a, t) { t.outputEl.innerHTML = ''; return ''; },
        systeminfo: function() { return '\nHost Name: HELPDESK01\nOS: Windows 10 Pro 10.0.19045\nTotal Physical Memory: 16,384 MB'; },

        /* Windows `cd`. Without an override, `cd` fell through to Terminal.js's POSIX
         * builtin, which walks this box's declared `filesystem` and answers
         * "cd: X: No such file or directory" — a bash error inside a Windows command
         * prompt. This box's `dir` advertises no enterable directory, so the honest
         * behaviour is cmd.exe's own: print the current directory for a bare `cd`, and
         * refuse anything else exactly as Windows does for a path that is not there.
         * MUST NOT return null: Terminal.js reads null as "fall through to the builtin",
         * which is the very fallthrough this exists to stop. */
        /* Windows `cd`. Resolves against the same directory model `dir` prints, so the two
         * cannot disagree (see _dirEntry). Previously it refused every path, which was at
         * least consistent while `dir` returned one canned line; once `dir` listed real
         * directories it became a lie the shell-consistency gate caught.
         * MUST NOT return null: Terminal.js reads null as "fall through to the builtin",
         * which is the POSIX `cd` this exists to keep out of a cmd.exe prompt. */
        cd: function(args, term, engine) {
            var raw = (args || []).filter(function (a) { return a.indexOf('/') !== 0; })[0];
            var cwd = (term && term.cwd) || 'C:\\Users\\Technician';
            if (!raw) return cwd;
            if (raw === '.') return '';
            var target;
            if (raw === '..') {
                var i = cwd.lastIndexOf('\\');
                target = (i <= 2) ? 'C:\\' : cwd.slice(0, i);
            } else if (raw === '\\') {
                target = 'C:\\';
            } else if (/^[a-z]:/i.test(raw) || raw.charAt(0) === '\\') {
                target = raw;
            } else {
                target = cwd.replace(/\\+$/, '') + '\\' + raw;
            }
            var e = OS2Config._dirEntry(engine, target);
            if (!e) return 'The system cannot find the path specified.';
            if (term) { term.cwd = e.label; if (typeof term._updatePrompt === 'function') term._updatePrompt(); }
            return '';
        },
        /* ── dir ────────────────────────────────────────────────────────────────────
         * Path- and /s-aware over the four paths the walkthrough investigates, backed by
         * the same state `del`/`rd`/`cleanmgr` mutate, so a student watches a directory
         * actually empty. It previously returned one canned string with no size data, which
         * meant `dir /s C:\Users | find "Total"` could never teach what that step is for
         * even once piping worked. */
        dir: function(args, term, engine) {
            var a = args || [];
            var flags = a.filter(function (x) { return x.charAt(0) === '/'; }).map(function (x) { return x.toLowerCase(); });
            var recurse = flags.indexOf('/s') > -1;
            var path = a.filter(function (x) { return x.charAt(0) !== '/'; }).join(' ')
                || (term && term.cwd) || 'C:\\Users\\Technician';
            var e = OS2Config._dirEntry(engine, path);
            if (!e) return '\nThe system cannot find the path specified.';
            var out = '\n Volume in drive C has no label.\n Volume Serial Number is 9C4E-13A7\n\n Directory of ' + e.label + '\n\n';
            var files = 0, bytes = 0;
            e.items.forEach(function (it) {
                if (it.dir) { out += '10/14/2025  09:12 AM    <DIR>          ' + it.name + '\n'; }
                else { files++; bytes += it.size; out += '10/14/2025  09:12 AM    ' + OS2Config._pad(OS2Config._commas(it.size), 14) + ' ' + it.name + '\n'; }
            });
            if (!e.items.length) out += '  0 File(s)              0 bytes\n';
            out += '\n' + OS2Config._pad(String(files), 15) + ' File(s) ' + OS2Config._commas(bytes) + ' bytes\n';
            if (recurse) {
                var tb = e.totalBytes != null ? e.totalBytes : bytes;
                out += '\n     Total Files Listed:\n' + OS2Config._pad(String(e.totalFiles != null ? e.totalFiles : files), 15)
                    + ' File(s) ' + OS2Config._commas(tb) + ' bytes\n';
            }
            var dirs = 0; e.items.forEach(function (it) { if (it.dir) dirs++; });
            out += OS2Config._pad(String(dirs), 15) + ' Dir(s)  ' + OS2Config._commas(Math.round(OS2Config._free(engine) * 1073741824)) + ' bytes free';
            return out;
        },

        /* ── net ────────────────────────────────────────────────────────────────────
         * Modelled on pr001's `net` (dispatch/boxes/pr001-printer-nightmare/config.js:482),
         * which the operator has played. Difference: pr001 toggles ONE service, os002 needs
         * five, and scenario 1 is only fixed by the ORDERED sequence its ticket describes. */
        net: function(args, term, engine) {
            var gate = OS2Config._requireScenario(engine); if (gate) return gate;
            var a = args || [];
            var verb = (a[0] || '').toLowerCase();
            if (verb !== 'stop' && verb !== 'start') {
                return '\nThe syntax of this command is:\n\nNET [ ACCOUNTS | COMPUTER | CONFIG | CONTINUE | FILE | GROUP |\n      HELP | HELPMSG | LOCALGROUP | PAUSE | SESSION | SHARE | START |\n      STATISTICS | STOP | TIME | USE | USER | VIEW ]';
            }
            var svc = OS2Config._resolveSvc(a.slice(1).join(' '));
            if (!svc) return '\nThe service name is invalid.\n\nMore help is available by typing NET HELPMSG 2185.';
            var table = OS2Config._svc(engine);
            if (verb === 'stop') {
                if (table[svc.key] !== 'Running') return '\nThe ' + svc.display + ' service is not started.\n\nMore help is available by typing NET HELPMSG 3521.';
                table[svc.key] = 'Stopped'; engine.save(); OS2Config._renderServices(engine);
                return '\nThe ' + svc.display + ' service is stopping.\nThe ' + svc.display + ' service was stopped successfully.\n';
            }
            if (table[svc.key] === 'Running') return '\nThe requested service has already been started.\n\nMore help is available by typing NET HELPMSG 2182.';
            table[svc.key] = 'Running'; engine.save(); OS2Config._renderServices(engine);
            return '\nThe ' + svc.display + ' service is starting.\nThe ' + svc.display + ' service was started successfully.\n' + OS2Config._checkComplete(engine);
        },

        /* ── sfc ──────────────────────────────────────────────────────────────────── */
        sfc: function(args, term, engine) {
            var gate = OS2Config._requireScenario(engine); if (gate) return gate;
            var joined = (args || []).join(' ').toLowerCase();
            if (!joined) return '\nMicrosoft (R) Windows (R) Resource Checker Version 6.0\n\nScans all protected system files and replaces incorrect versions.\n\nSFC [/SCANNOW] [/VERIFYONLY] [/OFFBOOTDIR=<offline boot directory>\n     /OFFWINDIR=<offline windows directory>]';
            if (joined.indexOf('/offbootdir') > -1 || joined.indexOf('/offwindir') > -1) {
                /* HONEST FAILURE, NOT A FAKE SUCCESS. Offline servicing switches are only
                 * meaningful against an image that is not running. The walkthrough prints
                 * this form for scenario 2, where the real procedure is performed from
                 * WinRE — which this lab image does not simulate. */
                return '\nWindows Resource Protection could not start the repair service.\n\nNote: /OFFBOOTDIR and /OFFWINDIR service an OFFLINE image. They cannot target the\nrunning system. The real procedure runs them from the Windows Recovery Environment.\nThis lab image does not boot to WinRE — use the Update Panel for this ticket.';
            }
            if (joined.indexOf('/verifyonly') > -1) return '\nBeginning system scan.  This process will take some time.\n\nBeginning verification phase of system scan.\nVerification 100% complete.\n\nWindows Resource Protection found integrity violations.';
            if (joined.indexOf('/scannow') === -1) return '\nUnsupported switch. Run SFC with no arguments for usage.';
            engine.state._sfcRun = true; engine.save();
            return '\nBeginning system scan.  This process will take some time.\n\nBeginning verification phase of system scan.\nVerification 100% complete.\n\nWindows Resource Protection found corrupt files and successfully repaired them.\nFor online repairs, details are included in the CBS log file located at\nC:\\Windows\\Logs\\CBS\\CBS.log.\n';
        },

        /* ── dism ─────────────────────────────────────────────────────────────────── */
        dism: function(args, term, engine) {
            var gate = OS2Config._requireScenario(engine); if (gate) return gate;
            var joined = (args || []).join(' ').toLowerCase();
            var head = '\nDeployment Image Servicing and Management tool\nVersion: 10.0.19041.3636\n\n';
            if (!joined) return head + 'DISM /Online /Cleanup-Image /ScanHealth\nDISM /Online /Cleanup-Image /RestoreHealth\nDISM /Online /Cleanup-Image /StartComponentCleanup';
            if (joined.indexOf('/image:') > -1) {
                /* Error 50 is ERROR_NOT_SUPPORTED, which is what DISM returns when an
                 * offline-image option is aimed at the running OS. Same reasoning as sfc's
                 * offline switches above. */
                return head + 'Error: 50\n\nDISM does not support servicing the running operating system with the /Image\noption. Use /Online for the running system, or run /Image from WinRE.\n\nThe DISM log file can be found at C:\\Windows\\Logs\\DISM\\dism.log';
            }
            if (joined.indexOf('/online') === -1) return head + 'Error: 87\n\nThe command was not recognized. Specify /Online or /Image.';
            if (joined.indexOf('/scanhealth') > -1) return head + 'Image Version: 10.0.19045.3803\n\n[==========================100.0%==========================]\nComponent store corruption was detected.\nThe operation completed successfully.\n';
            if (joined.indexOf('/restorehealth') > -1) {
                engine.state._dismRestore = true; engine.save();
                return head + 'Image Version: 10.0.19045.3803\n\n[==========================100.0%==========================]\nThe restore operation completed successfully. The component store corruption was repaired.\nThe operation completed successfully.\n';
            }
            if (joined.indexOf('/startcomponentcleanup') > -1) {
                OS2Config._reclaim(engine, '_componentCleanup');
                return head + 'Image Version: 10.0.19045.3803\n\n[==========================100.0%==========================]\nThe operation completed successfully.\n' + OS2Config._checkComplete(engine);
            }
            return head + 'Error: 87\n\nThe /cleanup-image option requires /ScanHealth, /RestoreHealth or /StartComponentCleanup.';
        },

        /* ── del / rd ─────────────────────────────────────────────────────────────── */
        del: function(args, term, engine) {
            var gate = OS2Config._requireScenario(engine); if (gate) return gate;
            var t = (args || []).filter(function (x) { return x.charAt(0) !== '/'; }).join(' ').toLowerCase();
            if (!t) return '\nThe syntax of the command is incorrect.';
            if (t.indexOf('softwaredistribution') > -1) {
                /* THE ORDERING IS THE TEACHING. Both services hold handles in this folder,
                 * so the real machine refuses until BOTH are stopped. The gate originally
                 * checked only wuauserv while the ticket, ticketExtra and hint3 all say
                 * "stop wuauserv AND BITS" — a student could have finished having never
                 * touched bits, and the box would have taught them a procedure it did not
                 * actually require. Same gate shape as pr001's spool-file delete. */
                var holding = OS2Config._svcHolding(engine);
                if (holding.length) {
                    return '\nAccess is denied.\n\n' + holding.map(function (h) { return 'The ' + h.display + ' service has files open here.'; }).join('\n')
                        + '\n\nStop ' + (holding.length > 1 ? 'them' : 'it') + ' first:\n\n' + holding.map(function (h) { return '    net stop ' + h.key; }).join('\n') + '\n';
                }
                if (engine.state._sdCleared) return '\nC:\\Windows\\SoftwareDistribution\\Download\\*, 0 File(s) deleted.\n';
                OS2Config._reclaim(engine, '_sdCleared');
                return '\nC:\\Windows\\SoftwareDistribution\\Download\\*, 1,284 File(s) deleted.\n' + OS2Config._checkComplete(engine);
            }
            if (t.indexOf('temp') > -1) {
                if (engine.state._tempCleared) return '\nC:\\Windows\\Temp\\*, 0 File(s) deleted.\n';
                OS2Config._reclaim(engine, '_tempCleared');
                return '\nC:\\Windows\\Temp\\*, 3,911 File(s) deleted.\n' + OS2Config._checkComplete(engine);
            }
            return '\nCould Not Find ' + (args || []).filter(function (x) { return x.charAt(0) !== '/'; }).join(' ');
        },

        rd: function(args, term, engine) {
            var gate = OS2Config._requireScenario(engine); if (gate) return gate;
            var t = (args || []).filter(function (x) { return x.charAt(0) !== '/'; }).join(' ').toLowerCase();
            if (t.indexOf('windows.old') > -1) {
                if (engine.state._windowsOldRemoved) return '\nThe system cannot find the file specified.';
                OS2Config._reclaim(engine, '_windowsOldRemoved');
                /* Real `rd /s /q` prints nothing on success; the only output worth showing
                 * is the completion notice, when this was the step that finished the job. */
                return OS2Config._checkComplete(engine) || '';
            }
            if (t.indexOf('softwaredistribution') > -1) {
                var holdingRd = OS2Config._svcHolding(engine);
                if (holdingRd.length) return '\nThe process cannot access the file because it is being used by another process.\n\nStop ' + (holdingRd.length > 1 ? 'them' : 'it') + ' first:\n\n' + holdingRd.map(function (h) { return '    net stop ' + h.key; }).join('\n') + '\n';
                /* REMOVING \Download IS NOT REMOVING ITS PARENT. The match was a bare
                 * substring, so `rd C:\Windows\SoftwareDistribution\Download` set
                 * _sdRemoved and reported the parent folder gone — the shell claiming
                 * something the student never asked for. */
                if (t.indexOf('download') > -1) {
                    if (engine.state._sdRemoved) return '\nThe system cannot find the file specified.';
                    OS2Config._reclaim(engine, '_sdCleared');
                    return '\nC:\\Windows\\SoftwareDistribution\\Download removed. Windows Update will rebuild it.\n' + OS2Config._checkComplete(engine);
                }
                if (engine.state._sdRemoved) return '\nThe system cannot find the file specified.';
                engine.state._sdRemoved = true; engine.save();
                /* Pays nothing if `del` or `rd …\Download` already reclaimed these bytes. */
                OS2Config._reclaim(engine, '_sdCleared');
                return '\nC:\\Windows\\SoftwareDistribution removed. Windows Update will rebuild it.\n' + OS2Config._checkComplete(engine);
            }
            if (!t) return '\nThe syntax of the command is incorrect.';
            return '\nThe system cannot find the file specified.';
        },

        /* ── wmic ─────────────────────────────────────────────────────────────────── */
        wmic: function(args, term, engine) {
            var gate = OS2Config._requireScenario(engine); if (gate) return gate;
            var joined = (args || []).join(' ').toLowerCase();
            if (joined.indexOf('logicaldisk') > -1) {
                var free = Math.round(OS2Config._free(engine) * 1073741824);
                return '\nCaption  FreeSpace     Size\nC:       ' + OS2Config._pad(String(free), 13) + ' 255060844544\nD:       107374182400  214748364800\n';
            }
            if (joined.indexOf('qfe') > -1) {
                var sc = OS2Config._getScenario(engine);
                var bad = (sc && sc.id === 'reboot_loop' && !engine.state._kbRemoved);
                return '\nHotFixID    InstalledOn   Description\nKB5031356   10/10/2025    Security Update\nKB5030310   09/12/2025    Update\n'
                    + (bad ? OS2Config._BAD_KB + '   10/14/2025    Cumulative Update   (installation state: FAILED, pending rollback)\n' : '');
            }
            return '\nInvalid alias verb.';
        },

        /* ── cleanmgr / wusa / reg / msconfig ─────────────────────────────────────── */
        cleanmgr: function(args, term, engine) {
            var gate = OS2Config._requireScenario(engine); if (gate) return gate;
            var joined = (args || []).join(' ').toLowerCase();
            if (joined.indexOf('/sagerun') === -1) {
                /* /sageset only OPENS the settings dialog; /sagerun is what executes the
                 * cleanup. The walkthrough had this backwards and has been corrected. */
                return '\nDisk Cleanup is a graphical tool. /SAGESET:n opens the settings dialog to CHOOSE\nwhat to clean; it does not clean anything. Run the selection you saved with:\n\n    cleanmgr /sagerun:1\n';
            }
            var freed = OS2Config._reclaim(engine, '_tempCleared')
                + OS2Config._reclaim(engine, '_sdCleared')
                + OS2Config._reclaim(engine, '_windowsOldRemoved');
            freed = Math.round(freed * 10) / 10;
            return '\nDisk Cleanup is calculating how much space you will be able to free...\n\nCleaned: Temporary files, Windows Update Cleanup, Previous Windows installations,\n         Delivery Optimization Files\n\nFreed ' + freed.toFixed(1) + ' GB.\n' + OS2Config._checkComplete(engine);
        },

        wusa: function(args, term, engine) {
            var gate = OS2Config._requireScenario(engine); if (gate) return gate;
            var joined = (args || []).join(' ').toUpperCase();
            if (joined.indexOf('/UNINSTALL') === -1) return '\nWindows Update Standalone Installer\n\nUsage: wusa /uninstall /kb:<id>';
            var m = joined.match(/KB\s*:?\s*(\d{6,7})/);
            if (!m) return '\nWindows Update Standalone Installer\n\nSpecify the update to remove, e.g. wusa /uninstall /kb:5031354';
            var kb = 'KB' + m[1];
            var sc = OS2Config._getScenario(engine);
            if (!(sc && sc.id === 'reboot_loop') || kb !== OS2Config._BAD_KB) {
                return '\nWindows Update Standalone Installer\n\nUpdate for Windows (' + kb + ') is not installed on this computer.\n';
            }
            if (engine.state._kbRemoved) return '\nWindows Update Standalone Installer\n\nUpdate for Windows (' + kb + ') is not installed on this computer.\n';
            engine.state._kbRemoved = true; engine.save();
            return '\nWindows Update Standalone Installer\n\nUninstalling update ' + kb + '...\nThe update was uninstalled successfully.\n' + OS2Config._checkComplete(engine);
        },

        reg: function(args, term, engine) {
            var gate = OS2Config._requireScenario(engine); if (gate) return gate;
            var a = args || [];
            var verb = (a[0] || '').toLowerCase();
            var joined = a.join(' ').toLowerCase();
            if (verb === 'query') {
                if (joined.indexOf('rebootpending') > -1) {
                    var sc = OS2Config._getScenario(engine);
                    if (sc && sc.id === 'reboot_loop') return '\nHKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Component Based Servicing\\RebootPending\n';
                    return '\nERROR: The system was unable to find the specified registry key or value.';
                }
                return '\nERROR: The system was unable to find the specified registry key or value.';
            }
            if (verb === 'add') {
                if (joined.indexOf('excludewudriversinqualityupdate') > -1) {
                    engine.state._regDriverBlock = true; engine.save();
                    /* Deliberately does NOT complete driver_update_broke. Blocking FUTURE
                     * driver replacement is prevention; this ticket needs the CURRENT driver
                     * rolled back, which is a Device Manager operation. */
                    return '\nThe operation completed successfully.\n\nWindows Update will no longer replace drivers during quality updates.\nThis prevents a recurrence — it does not restore the driver already replaced.';
                }
                return '\nThe operation completed successfully.';
            }
            return '\nERROR: Invalid syntax.\nType "REG /?" for usage.';
        },

        msconfig: function() { return '\nSystem Configuration is a graphical tool and is not available in this lab image.\nUse the Services window on the desktop to inspect and control services.'; },

        /* PowerShell cmdlet typed at a cmd.exe prompt. The engine now answers unknown
         * commands in the box's own dialect, so this would already be correct — it is
         * declared only to explain WHY, which is the teaching point of the walkthrough
         * step that prints it. */
        'get-windowsupdatelog': function() {
            return "\n'Get-WindowsUpdateLog' is not recognized as an internal or external command,\noperable program or batch file.\n\nGet-WindowsUpdateLog is a PowerShell cmdlet. This window is cmd.exe.";
        },

        /* ── find ─────────────────────────────────────────────────────────────────────
         * TWO bugs, both measured. (1) It ignored piped stdin entirely. (2) Its gate was
         * `if (a.length < 2) return 'FIND: Parameter format not correct'` — but real
         * `FIND "string"` reading a pipe has exactly ONE argument, so the legitimate piped
         * form was rejected before stdin was ever consulted. On production 2026-09-16 all
         * three of the walkthrough's `dir /s ... | find "Total"` steps hit that gate. */
        find: function(args, term, engine) {
            var a = (args || []).filter(function (x) { return x.charAt(0) !== '/'; });
            var piped = term && typeof term._pipedStdin === 'string';
            if (!a.length) return 'FIND: Parameter format not correct';
            var needle = String(a[0]);
            if (piped) {
                var hits = String(term._pipedStdin).split('\n').filter(function (l) { return l.indexOf(needle) > -1; });
                return hits.join('\n');
            }
            if (a.length < 2) return 'FIND: Parameter format not correct';
            return 'File not found - ' + a[1];
        },

        /* RESTORED, and the reason is worth recording: rebuilding this box's command surface
         * replaced the whole `commands` object and silently dropped these thirteen refusals
         * with it. box-contract-lint's SHELL-004 caught it as a NEW finding — all thirteen
         * Terminal.js builtins had started leaking back into a cmd.exe prompt. They are
         * builtins, so the engine's dialect-aware unknown-command message never sees them;
         * only an explicit override keeps a GNU tool out of a Windows shell. */
        /* Linux builtins reach the student unless the box refuses them: Terminal.js provides
         * ls/cat/pwd/head/tail/man/uname/file/history, so in a cmd.exe prompt `ls` answered with
         * the GNU error "ls: cannot access '...'" — a Linux tool reporting failure inside a
         * Windows shell. cmd.exe has none of these, so its own not-recognized message is the
         * honest answer. NT1 already did this; 49 other Windows boxes did not. */
        ls: function() { return "'ls' is not recognized as an internal or external command,\noperable program or batch file.\n\nDid you mean: dir"; },
        cat: function() { return "'cat' is not recognized as an internal or external command,\noperable program or batch file.\n\nDid you mean: type"; },
        pwd: function() { return "'pwd' is not recognized as an internal or external command,\noperable program or batch file.\n\nDid you mean: cd"; },
        head: function() { return "'head' is not recognized as an internal or external command,\noperable program or batch file."; },
        tail: function() { return "'tail' is not recognized as an internal or external command,\noperable program or batch file."; },
        man: function() { return "'man' is not recognized as an internal or external command,\noperable program or batch file.\n\nDid you mean: help"; },
        uname: function() { return "'uname' is not recognized as an internal or external command,\noperable program or batch file.\n\nDid you mean: systeminfo"; },
        file: function() { return "'file' is not recognized as an internal or external command,\noperable program or batch file."; },
        history: function() { return "'history' is not recognized as an internal or external command,\noperable program or batch file.\n\nDid you mean: doskey /history"; },
        /* The remaining Terminal.js builtins this box would otherwise inherit.
         * Measured: `id` answered "uid=1000(Administrator) ... groups=...,27(sudo)" — a POSIX
         * identity string, sudo and all — in EVERY Windows-family box, and `find` returned GNU's
         * exact error format. An earlier pass fixed nine commands chosen by hand; the real
         * builtin surface is 23, which is why this second pass exists. Commands whose inherited
         * behaviour is already right for this shell (echo, help, exit, and clear/alias under
         * PowerShell) are deliberately left alone. */
        id: function() { return "'id' is not recognized as an internal or external command,\noperable program or batch file.\n\nDid you mean: whoami"; },
        export: function() { return "'export' is not recognized as an internal or external command,\noperable program or batch file.\n\nDid you mean: set"; },
        alias: function() { return "'alias' is not recognized as an internal or external command,\noperable program or batch file.\n\nDid you mean: doskey"; },
        clear: function() { return "'clear' is not recognized as an internal or external command,\noperable program or batch file.\n\nDid you mean: cls"; },
        ifconfig: function() { return "'ifconfig' is not recognized as an internal or external command,\noperable program or batch file.\n\nDid you mean: ipconfig"; },
        sudo: function() { return "'sudo' is not recognized as an internal or external command,\noperable program or batch file.\n\nDid you mean: runas"; },
        help: function() { return '\nWindows Update troubleshooting tools available in this image:\n\n  net start|stop <service>   start or stop a service (wuauserv, bits, cryptsvc, ...)\n  sfc /scannow              scan and repair protected system files\n  dism /online /cleanup-image /scanhealth|/restorehealth|/startcomponentcleanup\n  wusa /uninstall /kb:<id>  remove an installed update\n  wmic logicaldisk get size,freespace,caption\n  wmic qfe list brief       list installed updates\n  cleanmgr /sagerun:1       run Disk Cleanup with system files\n  del | rd                  delete files or folders\n  reg query|add             read or write the registry\n  dir, cd, whoami, hostname, systeminfo, find, cls\n\nThe Services and Update Panel windows on the desktop do the same work with a mouse.'; }
    },

    onAppLaunch(iconDef, engine) {
        if (['hw_panel', 'services', 'disk_mgmt', 'devmgr', 'event_viewer'].includes(iconDef.app) && !engine.state._scenarioSelected) { engine.notify('Open the Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': OS2Config._openTicket(iconDef, engine); break;
            case 'services': OS2Config._openServices(iconDef, engine); break;
            case 'hw_panel': case 'disk_mgmt': case 'devmgr': case 'event_viewer': OS2Config._openPanel(iconDef, engine); break;
            case 'reset_lab': engine.resetLab(); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        OS2Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) OS2Config._renderTicket(engine, c); else OS2Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var pv = ['User — "Windows Update has been stuck at 47% for 3 hours"', 'User — "Update failed but now Windows will not roll back — stuck in ..."', 'User — "No sound at all after Windows Update — speaker icon shows X"', 'User — "Computer keeps restarting after cumulative update — never fi..."', 'User — "Windows Update says not enough disk space — C: drive is almo..."'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#3b82f6; font-weight:bold; font-size:1.1rem;">HELP DESK QUEUE</div></div><div>';
        OS2Config._scenarios.forEach(function(s, i) { html += '<button class="os2-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><span style="color:#3b82f6; font-weight:bold;">OS2-' + (2000 + i) + '</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + pv[i] + '</div></button>'; });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="os2Rand" style="padding:10px 28px; background:#3b82f6; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.os2-btn').forEach(function(b) { b.addEventListener('click', function() { OS2Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); OS2Config._renderTicket(engine, container); }); });
        document.getElementById('os2Rand').addEventListener('click', function() { OS2Config._applyScenario(engine, Math.floor(Math.random() * 5)); OS2Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var sc = OS2Config._getScenario(engine);
        var subs = ['User A — Department', 'User B — Department', 'User C — Department', 'User D — Department', 'User E — Department'];
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><span style="color:#3b82f6; font-weight:bold;">TICKET #OS2-' + (2000 + engine.state._scenarioId) + '</span></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + OS2Config._escHtml(sc.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:4px; line-height:1.6;">' + OS2Config._escHtml(sc.ticketDetail) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.2); padding:12px; border-radius:4px; color:#93c5fd;">' + OS2Config._escHtml(sc.ticketExtra) + '</div></div>'
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px; color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div>';
    },

    /* THE ID WAS SHARED AND THE SECOND WINDOW CAME UP EMPTY.
     * `services` and `hw_panel` both routed here, each creating a div with the literal id
     * "hwContainer", and _renderPanel called getElementById — which returns the FIRST match
     * in document order. Measured on production 2026-09-16: open Services, then the Update
     * Panel, and the panel's content length is 0. The Apply Fix button, the box's only
     * completion path at the time, was not in it. Services now has its own window entirely
     * (_openServices), and panels are addressed by attribute so any number can coexist. */
    _openPanel(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); OS2Config._renderPanel(engine); return; }
        var c = document.createElement('div'); c.setAttribute('data-os2-panel', iconDef.id); c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Update Nightmare — Diagnostics', iconDef.icon, c); OS2Config._renderPanel(engine);
    },

    _openServices(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); OS2Config._renderServices(engine); return; }
        var c = document.createElement('div'); c.setAttribute('data-os2-services', iconDef.id); c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Services (Local)', 'SVC', c); OS2Config._renderServices(engine);
    },

    /* The Services icon used to open a SECOND copy of the Update Panel — a window labelled
     * "Services" containing no services, in a box whose own ticket says to stop wuauserv and
     * BITS. Modelled on pr001's services console (pr001-printer-nightmare/config.js:1647). */
    _renderServices(engine) {
        var nodes = document.querySelectorAll('[data-os2-services]');
        if (!nodes.length) return;
        var sc = OS2Config._getScenario(engine);
        var table = OS2Config._svc(engine);
        var relevant = { update_stuck: ['wuauserv', 'bits'], reboot_loop: ['wuauserv', 'bits', 'trustedinstaller'], no_space_update: ['wuauserv'] };
        var hot = (sc && relevant[sc.id]) || [];
        var html = '<div style="font-size:1rem; font-weight:bold; color:#3b82f6; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Services (Local)</div>';
        html += '<div style="display:flex; gap:12px; font-size:0.7rem; color:#888; padding:4px 8px; margin-bottom:4px; border-bottom:1px solid rgba(255,255,255,0.08);"><span style="flex:2.6;">Name</span><span style="flex:1;">Status</span><span style="flex:1.1;">Startup Type</span><span style="flex:1.2;">Action</span></div>';
        OS2Config._SERVICES.forEach(function (svc) {
            var status = table[svc.key] || 'Stopped';
            var stopped = status !== 'Running';
            var isHot = hot.indexOf(svc.key) > -1;
            html += '<div style="display:flex; gap:12px; align-items:center; padding:6px 8px; margin-bottom:2px; background:' + (isHot ? (stopped ? 'rgba(231,76,60,0.08)' : 'rgba(46,204,113,0.06)') : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (isHot ? (stopped ? 'rgba(231,76,60,0.3)' : 'rgba(46,204,113,0.2)') : 'rgba(255,255,255,0.04)') + '; border-radius:3px;">'
                + '<span style="flex:2.6; font-weight:' + (isHot ? 'bold' : 'normal') + ';">' + OS2Config._escHtml(svc.display) + '<span style="color:#666;"> (' + svc.key + ')</span></span>'
                + '<span style="flex:1; color:' + (stopped ? '#e74c3c' : '#2ecc71') + '; font-weight:' + (stopped ? 'bold' : 'normal') + ';">' + status + '</span>'
                + '<span style="flex:1.1; color:#888;">' + (svc.key === 'msiserver' || svc.key === 'trustedinstaller' ? 'Manual' : 'Automatic') + '</span>'
                + '<span style="flex:1.2;"><button class="os2-svc-btn" data-svc="' + svc.key + '" data-act="' + (stopped ? 'start' : 'stop') + '" style="padding:3px 12px; background:' + (stopped ? '#3b82f6' : 'rgba(255,255,255,0.1)') + '; color:' + (stopped ? '#fff' : '#ccc') + '; border:1px solid rgba(255,255,255,0.15); border-radius:3px; cursor:pointer; font-size:0.7rem; font-weight:bold;">' + (stopped ? 'Start' : 'Stop') + '</button></span>'
                + '</div>';
        });
        html += '<div style="margin-top:14px; color:#888; font-size:0.72rem;">Equivalent commands: <span style="color:#93c5fd;">net stop &lt;service&gt;</span> / <span style="color:#93c5fd;">net start &lt;service&gt;</span></div>';
        Array.prototype.forEach.call(nodes, function (node) {
            node.innerHTML = html;
            Array.prototype.forEach.call(node.querySelectorAll('.os2-svc-btn'), function (btn) {
                btn.addEventListener('click', function () {
                    var key = this.getAttribute('data-svc');
                    var act = this.getAttribute('data-act');
                    OS2Config._svc(engine)[key] = (act === 'start') ? 'Running' : 'Stopped';
                    engine.save();
                    if (act === 'start') OS2Config._checkComplete(engine);
                    OS2Config._renderServices(engine);
                    OS2Config._renderPanel(engine);
                });
            });
        });
    },

    _renderPanel(engine) {
        var nodes = document.querySelectorAll('[data-os2-panel]');
        if (!nodes.length) return;
        var sc = OS2Config._getScenario(engine);
        if (!sc) {
            Array.prototype.forEach.call(nodes, function (n) { n.innerHTML = '<div style="color:#888;">No active scenario.</div>'; });
            return;
        }
        var stateKey = Object.keys(sc.stateOverrides)[0];
        var isIssue = engine.state[stateKey];
        var table = OS2Config._svc(engine);

        var html = '<div style="font-size:1rem; font-weight:bold; color:#3b82f6; margin-bottom:16px;">Update Nightmare — Diagnostics</div>';
        html += '<div style="margin-bottom:12px; padding:12px; background:' + (isIssue ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (isIssue ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.06)') + '; border-radius:4px;">'
            + '<div style="font-weight:bold; color:' + (isIssue ? '#3b82f6' : '#2ecc71') + ';">' + OS2Config._escHtml(sc.name) + '</div>';
        if (isIssue) {
            /* THE LABEL WAS WRONG. This block read "ISSUE DETECTED: " + fixDescription — it
             * announced the FIX under the word ISSUE. The scenario carries `name` for the
             * problem and `fixDescription` for the remedy; they are now shown as what they
             * are. (The wider question of a panel that states the remedy at all is task 391,
             * which spans all eight boxes built on this template.) */
            html += '<div style="color:#aaa; font-size:0.75rem; margin:4px 0 2px;">STATUS: unresolved</div>'
                + '<div style="color:#93c5fd; font-size:0.75rem; margin:0 0 8px;">RECOMMENDED FIX: ' + OS2Config._escHtml(sc.fixDescription) + '</div>'
                + '<button class="os2-panel-fix" style="padding:6px 16px; background:#3b82f6; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.75rem; font-weight:bold;">Apply Fix</button>'
                + '<div style="color:#666; font-size:0.7rem; margin-top:6px;">Or perform the repair yourself in Command Prompt — type <span style="color:#93c5fd;">help</span> for the tools.</div>';
        } else {
            html += '<div style="color:#aaa; font-size:0.75rem; margin:4px 0 8px;">Issue resolved. System operating normally.</div>';
        }
        html += '</div>';

        /* A diagnostics panel that shows nothing the student changed is decoration. These
         * two rows are the state every terminal command in this box acts on. */
        html += '<div style="padding:12px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:4px; margin-bottom:12px;">'
            + '<div style="font-weight:bold; color:#2ecc71; margin-bottom:6px;">System Summary</div>'
            + '<div style="color:#aaa; font-size:0.75rem;">Windows Update (wuauserv): <span style="color:' + (table.wuauserv === 'Running' ? '#2ecc71' : '#e74c3c') + ';">' + table.wuauserv + '</span> &nbsp;|&nbsp; BITS: <span style="color:' + (table.bits === 'Running' ? '#2ecc71' : '#e74c3c') + ';">' + table.bits + '</span></div>'
            + '<div style="color:#aaa; font-size:0.75rem;">Update cache: ' + (engine.state._sdCleared ? 'cleared' : 'populated') + ' &nbsp;|&nbsp; C: free: <span style="color:' + (OS2Config._free(engine) < 20 ? '#e74c3c' : '#2ecc71') + ';">' + OS2Config._free(engine).toFixed(1) + ' GB</span></div>'
            + '</div>';

        if (engine.state._flagRevealed) {
            html += '<div style="margin-top:16px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;"><div style="color:#2ecc71; font-weight:bold;">Fix Confirmed</div><div class="os2-flag-slot" style="margin-top:4px;">Token: loading...</div></div>';
        }

        Array.prototype.forEach.call(nodes, function (node) {
            node.innerHTML = html;
            var fix = node.querySelector('.os2-panel-fix');
            if (fix) fix.addEventListener('click', function () {
                /* Routes through the SAME writer the terminal uses, so the two paths cannot
                 * disagree about what "complete" means. */
                OS2Config._completeScenario(engine, 'Fix applied successfully. Check the Update Panel for the token.');
            });
        });

        if (engine.state._flagRevealed) {
            setTimeout(function () {
                BoxEngine.requestFlagText(sc.id).then(function (f) {
                    var slots = document.querySelectorAll('.os2-flag-slot');
                    Array.prototype.forEach.call(slots, function (el) { el.textContent = 'Token: ' + (f || 'N/A'); });
                });
            }, 0);
        }
    },

    _confirmReset(engine) {
        var o = document.createElement('div'); o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9;"><div style="color:#3b82f6; font-weight:bold; margin-bottom:12px;">Reset Lab?</div><div style="display:flex; gap:12px; justify-content:center;"><button id="os2RC" style="padding:8px 24px; background:#3b82f6; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="os2CC" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('os2RC').addEventListener('click', function() { OS2Config._flagRestored = false; OS2Config.hints = OS2Config._defaultHints; engine.reset(); });
        document.getElementById('os2CC').addEventListener('click', function() { o.remove(); });
        o.addEventListener('click', function(e) { if (e.target === o) o.remove(); });
    }
};