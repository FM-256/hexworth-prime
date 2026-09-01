/* ============================================================
   DISPATCH LAB — Box OS1: Boot Failure
   Windows Boot Troubleshooting — MD-100 Objective 4.1
   Config: WinRE boot sequence, 5 failure scenarios, GUI recovery tools
   State machine tracks per-scenario repair actions
   ============================================================ */

var OS1Config = {

    // ==========================================================
    // BOX METADATA
    // ==========================================================

    title: 'Boot Failure: It Won\'t Start',
    subtitle: 'Windows Boot Troubleshooting — MD-100 Objective 4.1',
    difficulty: 'Intermediate',
    accent: '#005ba1',
    storageKey: 'hexworth_lab_os1',
    registryId: 'os001-boot-failure',
    trackerKey: 'lab_os1',

    // ==========================================================
    // TUTORIAL MODE
    // ==========================================================

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Read the Help Desk Ticket',
                tip: 'Double-click the Help Desk Ticket icon to see what happened to the workstation.',
                trigger: { event: 'window_open', match: { type: 'ticket' } }
            },
            {
                title: 'Identify the failure type',
                tip: 'Look at the boot error message. Is it a BSOD stop code, a stuck update, or a missing OS error? Each points to a different tool.',
                trigger: {
                    event: 'window_open',
                    match: { type: 'ticket' },
                    alt: [
                        { event: 'window_open', match: { type: 'startup_repair' } },
                        { event: 'command', match: { cmd: 'contains:bcdedit' } }
                    ]
                }
            },
            {
                title: 'Use the right recovery tool',
                tip: 'WinRE offers: Startup Repair, Startup Settings (Safe Mode), Command Prompt, Uninstall Updates, and System Restore. Pick the one that matches the failure.',
                trigger: {
                    event: 'window_open',
                    match: { type: 'startup_repair' },
                    alt: [
                        { event: 'window_open', match: { type: 'startup_settings' } },
                        { event: 'window_open', match: { type: 'uninstall_updates' } },
                        { event: 'window_open', match: { type: 'system_restore' } },
                        { event: 'command', match: { cmd: 'contains:bootrec' } }
                    ]
                }
            },
            {
                title: 'Apply the fix and verify',
                tip: 'After running the repair, look for a success message or check the boot log. The flag will appear when the system can boot again.',
                trigger: { event: 'flag_correct', match: { flagId: 'repaired' } }
            }
        ]
    },

    // ==========================================================
    // CERT OBJECTIVES
    // ==========================================================

    certObjectives: {
        certPath: 'MD-100',
        mappings: [
            /* MD-100 M10: Troubleshoot OS & Apps. Added so the hub card's module tag is BACKED by
               the box itself. This card previously showed a module tag that matched
               nothing downstream: not this file, not the Dispatch Board tags, and not
               the briefing screen a student sees one click later. A reviewer caught the
               contradiction. The objective rows below are UNCHANGED -- both taxonomies
               are true at once, so keeping the original numbering costs nothing. */
            { flagId: 'repaired', objective: 'M10', description: 'Troubleshoot OS & Apps', skill: 'WinRE, BCD repair, Safe Mode, DISM, startup repair' },
            { flagId: 'repaired', objective: '4.1', description: 'Troubleshoot Windows startup and shutdown issues', skill: 'WinRE, BCD Repair, Safe Mode, DISM' },
            { flagId: 'repaired', objective: '3.1', description: 'Troubleshoot common Windows OS problems', skill: 'bootrec, bcdboot, sfc, chkdsk' }
        ]
    },

    // ==========================================================
    // SABOTAGE SCENARIOS
    // ==========================================================

    _scenarioFlags: {
        corrupted_bcd:      null,
        bad_driver:         null,
        stuck_update:       null,
        disk_corruption:    null,
        missing_bootloader: null
    },

    _scenarios: [
        {
            id: 'corrupted_bcd',
            name: 'Corrupted BCD Store',
            ticketSubject: 'Blue screen with "0xc0000034" — won\'t boot at all',
            ticketDetail: 'Workstation WKST-042 is showing a blue screen every time it starts up. The error code on screen is 0xc0000034 and it says something about "Boot Configuration Data." It never makes it past the Windows logo. I\'ve tried restarting it four times.',
            ticketExtra: 'IT Note: This machine had a power outage yesterday during a Windows Update. The update may not have completed cleanly.',
            bootError: {
                type: 'bsod',
                code: '0xc0000034',
                message: 'Your PC ran into a problem and needs to restart.\n\nBoot Configuration Data file is missing or contains errors.\n\nFile: \\BCD\nError code: 0xc0000034\n\nFor more information about this issue and possible fixes,\nvisit https://www.windows.com/stopcode'
            },
            fixDescription: 'Rebuild BCD with bootrec /rebuildbcd then bootrec /fixboot'
        },
        {
            id: 'bad_driver',
            name: 'Bad Graphics Driver BSOD',
            ticketSubject: 'Blue screen during login — "DRIVER_IRQL_NOT_LESS_OR_EQUAL"',
            ticketDetail: 'My computer crashes to a blue screen right when the Windows logo appears. The screen shows DRIVER_IRQL_NOT_LESS_OR_EQUAL and mentions something called "nvlddmkm.sys." This started right after IT pushed a driver update yesterday afternoon.',
            ticketExtra: 'IT Note: An automated NVIDIA driver update (version 546.33) was deployed via WSUS to all workstations in this wing yesterday at 4:30 PM.',
            bootError: {
                type: 'bsod',
                code: 'DRIVER_IRQL_NOT_LESS_OR_EQUAL',
                message: 'Your PC ran into a problem and needs to restart.\n\nWhat failed: nvlddmkm.sys\n\nSTOP CODE: DRIVER_IRQL_NOT_LESS_OR_EQUAL\n\nIf you call a support person, give them this info:\nStop code: DRIVER_IRQL_NOT_LESS_OR_EQUAL'
            },
            fixDescription: 'Boot into Safe Mode via Startup Settings, then roll back the NVIDIA driver in Device Manager'
        },
        {
            id: 'stuck_update',
            name: 'Stuck Windows Update',
            ticketSubject: 'Machine stuck on "Working on updates... 35%" for two hours',
            ticketDetail: 'Lisa\'s computer is stuck on a screen that says "Working on updates... 35% complete. Don\'t turn off your PC." It\'s been like this since 7 AM — almost two hours. When I tried holding the power button to force a reboot, it just came back to the same screen.',
            ticketExtra: 'IT Note: KB5034441 was pushed last night. Several machines in this department appear to be stuck at the same percentage. This update has a known compatibility issue with certain disk configurations.',
            bootError: {
                type: 'hang',
                code: 'STUCK_UPDATE',
                message: 'Working on updates...\n35% complete\nDon\'t turn off your PC'
            },
            fixDescription: 'Uninstall latest quality update from WinRE, or use DISM /revertpendingactions'
        },
        {
            id: 'disk_corruption',
            name: 'Disk Corruption / CRITICAL_PROCESS_DIED',
            ticketSubject: 'Boot loop with "CRITICAL_PROCESS_DIED" blue screen',
            ticketDetail: 'The workstation in conference room B keeps crashing and restarting in a loop. Every time it gets to the Windows logo it shows a blue screen that says CRITICAL_PROCESS_DIED, then restarts and does it again. It\'s been doing this since last night.',
            ticketExtra: 'IT Note: SMART diagnostics flagged this drive last week with reallocated sector count warnings. We were scheduled to replace it next month. The quarterly financials are on this machine.',
            bootError: {
                type: 'bsod',
                code: 'CRITICAL_PROCESS_DIED',
                message: 'Your PC ran into a problem and needs to restart.\n\nSTOP CODE: CRITICAL_PROCESS_DIED\n\nA critical system process died and the system could not recover.\nThis is often caused by corrupted system files or disk errors.'
            },
            fixDescription: 'Run offline SFC, then chkdsk C: /f /r from WinRE Command Prompt'
        },
        {
            id: 'missing_bootloader',
            name: 'Missing Bootloader',
            ticketSubject: 'Black screen: "An operating system wasn\'t found"',
            ticketDetail: 'The computer in Dave\'s office shows a black screen with white text that says "An operating system wasn\'t found. Try disconnecting any drives that don\'t contain an operating system." There are no extra drives connected to it. Windows was working fine yesterday.',
            ticketExtra: 'IT Note: IT intern was working on disk partitioning on this machine yesterday using diskpart. He may have accidentally marked the wrong partition as active or cleared the boot partition.',
            bootError: {
                type: 'blackscreen',
                code: 'NO_OS',
                message: 'An operating system wasn\'t found. Try disconnecting any drives\nthat don\'t contain an operating system. Press Ctrl+Alt+Del to restart.'
            },
            fixDescription: 'Restore the bootloader with bcdboot C:\\Windows /s C:'
        }
    ],

    // Per-scenario hints
    _defaultHints: [
        { id: 'hint1', text: 'Read the ticket carefully — the error code or failure description tells you which recovery tool to use.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'WinRE has five tools: Startup Repair (automated), Startup Settings (Safe Mode), Command Prompt (manual commands), Uninstall Updates, and System Restore.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Not all problems can be fixed with Startup Repair. Check whether you need Command Prompt for manual repair commands.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Match the tool to the problem: BCD errors -> bootrec; driver crash -> Safe Mode + Device Manager; stuck update -> Uninstall Updates or DISM; disk corruption -> sfc + chkdsk; missing bootloader -> bcdboot.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        corrupted_bcd: [
            { id: 'hint1', text: 'The error code 0xc0000034 directly tells you what\'s missing: the BCD (Boot Configuration Data) file.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'WinRE Command Prompt has the bootrec tool specifically for boot record and BCD repair.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Try: bootrec /rebuildbcd to scan and rebuild the BCD store. Follow it with bootrec /fixboot to write a new boot sector.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Run: bootrec /rebuildbcd, then bootrec /fixboot, then type exit and restart. After reboot, check the boot log for the flag.', cost: 50, penalty: -50 }
        ],
        bad_driver: [
            { id: 'hint1', text: 'The .sys file in the BSOD (nvlddmkm.sys) is the NVIDIA display driver. It\'s crashing during the normal boot process.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'You need to boot into a mode that skips the problematic driver. Startup Settings lets you choose Safe Mode, which loads only essential drivers.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Boot into Safe Mode (Startup Settings -> option 4), then open Device Manager. Find Display Adapters -> NVIDIA GeForce RTX 3060 -> Properties -> Driver tab -> Roll Back Driver.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Startup Settings -> Enable Safe Mode -> Device Manager -> Display Adapters -> NVIDIA GeForce RTX 3060 -> Properties -> Driver tab -> Roll Back Driver.', cost: 50, penalty: -50 }
        ],
        stuck_update: [
            { id: 'hint1', text: 'The update is stuck mid-install and the machine loops back to it on every reboot. You need to undo the pending update.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'WinRE has an "Uninstall Updates" option specifically for this scenario. You can also use DISM from Command Prompt.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Try: Uninstall Updates -> Uninstall latest quality update. Or from Command Prompt: dism /image:C:\\ /cleanup-image /revertpendingactions', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Uninstall Updates -> Uninstall latest quality update -> confirm -> restart. Or: dism /image:C:\\ /cleanup-image /revertpendingactions then exit to restart.', cost: 50, penalty: -50 }
        ],
        disk_corruption: [
            { id: 'hint1', text: 'CRITICAL_PROCESS_DIED in a boot loop often means corrupted system files or disk-level errors — exactly what the SMART warning hinted at.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'You need offline repair tools from WinRE Command Prompt. SFC can repair corrupted Windows files; CHKDSK can fix disk-level errors.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Run SFC first (offline mode): sfc /scannow /offbootdir=C:\\ /offwindir=C:\\Windows. Then run disk check: chkdsk C: /f /r', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Run: sfc /scannow /offbootdir=C:\\ /offwindir=C:\\Windows, wait for it to complete, then run: chkdsk C: /f /r, then exit and restart.', cost: 50, penalty: -50 }
        ],
        missing_bootloader: [
            { id: 'hint1', text: '"An operating system wasn\'t found" means the firmware can\'t find the bootloader — the files that start Windows aren\'t where the BIOS expects them.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The bcdboot command can recreate the boot files from an existing Windows installation. Windows is still on the drive — it just can\'t start.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'From WinRE Command Prompt, run: bcdboot C:\\Windows /s C: — this copies the boot files from the Windows installation and sets up the boot partition.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Run: bcdboot C:\\Windows /s C: then exit and restart. Alternatively: bootrec /fixmbr then bootrec /fixboot then bcdboot C:\\Windows', cost: 50, penalty: -50 }
        ]
    },

    // ==========================================================
    // HELPERS
    // ==========================================================

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !OS1Config._flagRestored) {
            OS1Config._flagRestored = true;
            const scenario = OS1Config._scenarios[engine.state._scenarioId];
            if (scenario) {
                OS1Config.hints = OS1Config._scenarioHints[scenario.id] || OS1Config._defaultHints;
            }
        }
        return true;
    },

    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._scenarioSelected = true;
        engine.state._safeModeActive = false;
        engine.state._bcdRebuilt = false;
        engine.state._bootFixed = false;
        engine.state._driverRolledBack = false;
        engine.state._systemRestored = false;
        engine.state._updateUninstalled = false;
        engine.state._dismReverted = false;
        engine.state._sfcCompleted = false;
        engine.state._chkdskCompleted = false;
        engine.state._bootloaderRestored = false;
        engine.state._mbr_fixed = false;
        engine.state._labComplete = false;
        engine.state._flagRevealed = false;
        engine.state._startupRepairRun = false;

        const scenario = OS1Config._scenarios[idx];

        OS1Config.hints = OS1Config._scenarioHints[scenario.id] || OS1Config._defaultHints;

        engine.save();
    },

    _getScenario(engine) {
        if (engine.state._scenarioId == null) return null;
        return OS1Config._scenarios[engine.state._scenarioId];
    },

    _requireScenario(engine) {
        if (!engine.state._scenarioSelected) {
            return '\nERROR: No active ticket assigned.\nOpen the Help Desk Ticket first to receive your assignment.';
        }
        return null;
    },

    _checkRepairComplete(engine) {
        const s = engine.state;
        const scenario = OS1Config._getScenario(engine);
        if (!scenario || s._labComplete) return false;

        let complete = false;
        switch (scenario.id) {
            case 'corrupted_bcd':
                complete = s._bcdRebuilt && s._bootFixed;
                break;
            case 'bad_driver':
                complete = s._driverRolledBack || s._systemRestored;
                break;
            case 'stuck_update':
                complete = s._updateUninstalled || s._dismReverted;
                break;
            case 'disk_corruption':
                complete = s._sfcCompleted && s._chkdskCompleted;
                break;
            case 'missing_bootloader':
                complete = s._bootloaderRestored;
                break;
        }

        if (complete) {
            s._labComplete = true;
            s._flagRevealed = true;
            engine.save();
        }
        return complete;
    },

    async _revealFlag(engine, outputEl) {
        const scenario = OS1Config._getScenario(engine);
        if (!scenario) return;

        let flagVal = null;
        try {
            flagVal = await BoxEngine.requestFlagText(scenario.id);
        } catch (e) {
            flagVal = null;
        }

        const box = document.createElement('div');
        box.style.cssText = 'margin-top:12px; padding:12px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.4); border-radius:4px; font-family:Consolas,monospace; font-size:0.8rem;';
        if (flagVal) {
            box.innerHTML = '<div style="color:#2ecc71; font-weight:bold; margin-bottom:4px;">REPAIR COMPLETE — BOOT LOG ENTRY:</div>'
                + '<div style="color:#c8e6c9;">' + flagVal + '</div>'
                + '<div style="color:#888; font-size:0.7rem; margin-top:4px;">Submit this flag using the SUBMIT FLAG button.</div>';
        } else {
            box.innerHTML = '<div style="color:#2ecc71; font-weight:bold; margin-bottom:4px;">REPAIR COMPLETE — BOOT LOG ENTRY:</div>'
                + '<div style="color:#ffcc80;">Flag could not be retrieved. Please check your connection and try again.</div>';
        }
        if (outputEl) outputEl.appendChild(box);

        setTimeout(function() {
            engine.notify('Repair complete! The workstation can now boot. Flag revealed in the repair log.', 'success');
        }, 400);
    },

    // ==========================================================
    // BOOT SEQUENCE (failure path — WinRE)
    // ==========================================================

    boot: {
        biosLines: [
            'American Megatrends UEFI BIOS v2.20.1271',
            'Initializing hardware...',
            'Memory Test: 16384 MB OK',
            'Detecting drives... NVMe: SAMSUNG MZVL2512 (512GB)',
            'Processor: Intel(R) Core(TM) i7-12700 @ 2.10GHz',
            'Boot device: NVMe0',
            'Loading Windows Boot Manager...'
        ],
        grubEntries: [
            'Windows 11 Pro',
            'Windows Recovery Environment'
        ],
        loginUser: 'WinRE'
    },

    // ==========================================================
    // DESKTOP ICONS (WinRE Advanced Options menu)
    // ==========================================================

    desktop: {
        icons: [
            { id: 'startup-repair',    label: 'Startup\nRepair',      icon: 'SRP', app: 'startup_repair' },
            { id: 'startup-settings',  label: 'Startup\nSettings',    icon: 'SS',  app: 'startup_settings' },
            { id: 'cmd',               label: 'Command\nPrompt',       icon: '>_',  app: 'terminal' },
            { id: 'uninstall-updates', label: 'Uninstall\nUpdates',   icon: 'UU',  app: 'uninstall_updates' },
            { id: 'system-restore',    label: 'System\nRestore',      icon: 'SR',  app: 'system_restore' },
            { id: 'ticket',            label: 'Help Desk\nTicket',     icon: 'HD',  app: 'ticket' },
            { id: 'hints',             label: 'Hints',                 icon: '?',   app: 'hints' },
            { id: 'reset',             label: 'Reset\nLab',            icon: 'RST', app: 'reset_lab' }
        ]
    },

    // ==========================================================
    // TERMINAL CONFIG (WinRE Command Prompt)
    // ==========================================================

    terminal: {
        user: 'X:\\Sources',
        hostname: 'WinRE',
        startDir: 'X:\\Sources',
        promptStyle: 'windows',
        welcome: 'Microsoft Windows [Version 11.0.22631.3007]\n\nWindows Recovery Environment\n\nType EXIT to return to recovery options.\n'
    },

    // ==========================================================
    // FILESYSTEM (WinRE minimal + C: drive)
    // ==========================================================

    filesystem: {
        '/': {
            type: 'dir',
            children: {}
        }
    },

    // ==========================================================
    // FLAGS
    // ==========================================================

    flags: [
        { id: 'repaired', value: null, points: 500 }
    ],

    // ==========================================================
    // SCORING
    // ==========================================================

    scoring: {
        base: 0,
        minScore: 0,
        maxScore: 600,
        hintPenalty: true,
        wrongFlagPenalty: 0,
        speedBonus: { threshold: 600000, points: 100 },
        timeBonusThreshold: 1800
    },

    // ==========================================================
    // HINTS (replaced per-scenario by _applyScenario)
    // ==========================================================

    hints: [
        { id: 'hint1', text: 'Read the help desk ticket. The error code or symptom description tells you which WinRE tool to use.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'WinRE tools: Startup Repair (automated), Startup Settings (Safe Mode), Command Prompt (manual repair), Uninstall Updates, System Restore.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'BCD errors -> bootrec commands. Driver BSOD -> Safe Mode + Device Manager. Stuck update -> Uninstall Updates. Disk corruption -> sfc + chkdsk. Missing bootloader -> bcdboot.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Open the ticket to see the specific error. Then pick the matching tool from the WinRE desktop.', cost: 50, penalty: -50 }
    ],

    // ==========================================================
    // LORE
    // ==========================================================

    lore: {
        intro: 'A critical workstation won\'t boot. The user has the quarterly financials and the CFO needs them by noon. The machine has entered Windows Recovery Environment automatically after repeated boot failures.',
        scenario: 'You are working inside WinRE — Windows Recovery Environment. The normal desktop is inaccessible. Use WinRE recovery tools and Command Prompt to diagnose the failure and get the machine booting again. Do NOT reinstall Windows.',
        outro: 'The workstation boots successfully. The user can access their files. Your targeted repair approach avoided data loss and a full OS reinstall.'
    },

    // ==========================================================
    // PHASES
    // ==========================================================

    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read the help desk ticket and identify the failure type from the boot error.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Determine which WinRE tool addresses the specific boot failure.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Execute the recovery procedure using the correct tool or command sequence.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm the repair is complete and retrieve the flag from the boot log.', requiredFlags: ['repaired'], unlocks: [], locked: true }
    ],

    // ==========================================================
    // CUSTOM COMMANDS (WinRE Command Prompt)
    // ==========================================================

    commands: {

        // --- BOOTREC ---

        bootrec: function(args, term, engine) {
            const gate = OS1Config._requireScenario(engine);
            if (gate) return gate;

            const joined = args.join(' ').toLowerCase();
            const scenario = OS1Config._getScenario(engine);

            if (!args.length || joined === '/?') {
                return '\nUsage: bootrec [/FixMbr] [/FixBoot] [/ScanOs] [/RebuildBcd]\n\nOptions:\n  /FixMbr     Writes a new MBR to the system partition.\n  /FixBoot    Writes a new boot sector to the system partition.\n  /ScanOs     Scans all disks for Windows installations.\n  /RebuildBcd Rebuilds the Boot Configuration Data store.';
            }

            if (joined.includes('/fixmbr')) {
                engine.state._mbr_fixed = true;
                engine.save();
                return '\nThe operation completed successfully.';
            }

            if (joined.includes('/fixboot')) {
                engine.state._bootFixed = true;
                engine.save();
                const didRebuild = engine.state._bcdRebuilt;
                const complete = OS1Config._checkRepairComplete(engine);
                let out = '\nThe operation completed successfully.';
                if (complete && scenario && scenario.id === 'corrupted_bcd') {
                    out += '\n\n[Boot sector written. BCD store rebuilt. System should boot on next restart.]';
                    out += '\n\nBoot log entry: {{FLAG:corrupted_bcd}}';
                    out += '\n\nType EXIT to restart the machine.';
                    OS1Config._revealFlag(engine, null);
                } else if (!didRebuild && scenario && scenario.id === 'corrupted_bcd') {
                    out += '\n\n[Boot sector written, but BCD store may still be missing. Run: bootrec /rebuildbcd]';
                }
                return out;
            }

            if (joined.includes('/scanos')) {
                if (scenario && scenario.id === 'corrupted_bcd') {
                    return '\nScanning all disks for Windows installations...\n\nSuccessfully scanned all disks.\n\nTotal identified Windows installations: 1\nThe operation completed successfully.\n\n  Windows 11 [C:\\Windows]';
                }
                return '\nScanning all disks for Windows installations...\n\nSuccessfully scanned all disks.\n\nTotal identified Windows installations: 1\nThe operation completed successfully.\n\n  Windows 11 [C:\\Windows]';
            }

            if (joined.includes('/rebuildbcd')) {
                engine.state._bcdRebuilt = true;
                engine.save();
                if (scenario && scenario.id === 'corrupted_bcd') {
                    return '\nScanning all disks for Windows installations.\nPlease wait, since this may take a while...\n\nSuccessfully scanned all disks.\n\nTotal identified Windows installations: 1\n[1] C:\\Windows\nAdd installation to boot list? Yes/No/All: \n\n(Installation added to BCD store.)\n\nThe operation completed successfully.\n\n[BCD rebuilt — now run: bootrec /fixboot to write the boot sector]';
                }
                return '\nScanning all disks for Windows installations.\nPlease wait, since this may take a while...\n\nSuccessfully scanned all disks.\n\nTotal identified Windows installations: 1\n[1] C:\\Windows\n\nThe operation completed successfully.';
            }

            return '\nAn error occurred while attempting to perform the operation.\nThe parameter is incorrect.';
        },

        // --- BCDBOOT ---

        bcdboot: function(args, term, engine) {
            const gate = OS1Config._requireScenario(engine);
            if (gate) return gate;

            const scenario = OS1Config._getScenario(engine);
            const line = args.join(' ');

            if (!args.length || args[0] === '/?') {
                return '\nUsage: bcdboot <source> [/s <volume>] [/l <locale>]\n\nCreates a bootable system partition using boot files from a Windows installation.\n\nExample: bcdboot C:\\Windows /s C:';
            }

            const validSource = /c:\\windows/i.test(line);
            if (!validSource) {
                return '\nFailure when attempting to copy boot files.\nMake sure the Windows installation path is correct (e.g., C:\\Windows).';
            }

            engine.state._bootloaderRestored = true;
            engine.save();
            const complete = OS1Config._checkRepairComplete(engine);

            let out = '\nBoot files successfully created.\n';
            if (complete && scenario && scenario.id === 'missing_bootloader') {
                out += '\n[Boot partition configured. UEFI boot entry created.]';
                out += '\n\nBoot log entry: {{FLAG:missing_bootloader}}';
                out += '\n\nType EXIT to restart.';
                OS1Config._revealFlag(engine, null);
            } else {
                out += '\n[Boot files copied to system partition.]';
            }
            return out;
        },

        // --- BCDEDIT ---

        bcdedit: function(args, term, engine) {
            const gate = OS1Config._requireScenario(engine);
            if (gate) return gate;

            const joined = args.join(' ').toLowerCase();
            const scenario = OS1Config._getScenario(engine);

            if (!args.length || joined.includes('/enum')) {
                if (scenario && scenario.id === 'corrupted_bcd') {
                    if (!engine.state._bcdRebuilt) {
                        return '\nAn error has occurred setting an element.\nThe boot configuration data store could not be opened.\nThe system cannot find the file specified.';
                    }
                }
                return '\nWindows Boot Manager\n--------------------\nidentifier              {bootmgr}\ndevice                  partition=\\Device\\HarddiskVolume1\npath                    \\EFI\\Microsoft\\Boot\\bootmgfw.efi\ndescription             Windows Boot Manager\nlocale                  en-US\ndefault                 {current}\ntimeout                 30\n\nWindows Boot Loader\n-------------------\nidentifier              {current}\ndevice                  partition=C:\npath                    \\Windows\\system32\\winload.efi\ndescription             Windows 11\nlocale                  en-US\nosdevice               partition=C:\nsystemroot              \\Windows\nresumeobject            {auto}\nnx                      OptIn';
            }

            if (joined.includes('/set') && joined.includes('safeboot')) {
                engine.state._bcdSafeMode = true;
                engine.save();
                return '\nThe operation completed successfully.\n\n[Safe Mode boot configured. Restart the machine to boot into Safe Mode.]';
            }

            if (joined.includes('/deletevalue') && joined.includes('safeboot')) {
                engine.state._bcdSafeMode = false;
                engine.save();
                return '\nThe operation completed successfully.';
            }

            return '\nThe syntax of the command is:\n  bcdedit /enum\n  bcdedit /set {default} safeboot minimal\n  bcdedit /deletevalue {default} safeboot\n\nType bcdedit /? for full usage.';
        },

        // --- SFC ---

        sfc: function(args, term, engine) {
            const gate = OS1Config._requireScenario(engine);
            if (gate) return gate;

            const joined = args.join(' ').toLowerCase();
            const scenario = OS1Config._getScenario(engine);

            if (!args.length || args[0] === '/?') {
                return '\nUsage:\n  sfc /scannow                              - Scan and repair (online)\n  sfc /scannow /offbootdir=C:\\ /offwindir=C:\\Windows  - Offline scan (WinRE)\n  sfc /verifyonly                           - Scan without repair\n\nNote: Use offline flags when running from WinRE.';
            }

            const isOffline = joined.includes('/offbootdir') && joined.includes('/offwindir');
            const isOnline = joined.includes('/scannow') && !isOffline;

            if (isOnline) {
                return '\nWindows Resource Protection could not start the repair service.\n\nYou must run SFC in offline mode from WinRE:\n  sfc /scannow /offbootdir=C:\\ /offwindir=C:\\Windows';
            }

            if (isOffline || joined.includes('/scannow')) {
                let out = '\nBeginning system scan. This process will take some time.\n\nBeginning verification phase of system scan.\nVerification 100% complete.\n\n';

                if (scenario && scenario.id === 'disk_corruption') {
                    out += 'Windows Resource Protection found corrupt files and successfully repaired them.\nDetails are included in the CBS.Log windir\\Logs\\CBS\\CBS.log.\n\n[Repaired: C:\\Windows\\System32\\ntoskrnl.exe]\n[Repaired: C:\\Windows\\System32\\hal.dll]\n[Repaired: C:\\Windows\\System32\\drivers\\disk.sys]\n\n[SFC complete — run chkdsk C: /f /r to repair disk-level errors]';
                    engine.state._sfcCompleted = true;
                    engine.save();
                    OS1Config._checkRepairComplete(engine);
                } else {
                    out += 'Windows Resource Protection did not find any integrity violations.';
                }
                return out;
            }

            return '\nIncorrect usage. Type sfc /? for help.';
        },

        // --- CHKDSK ---

        chkdsk: function(args, term, engine) {
            const gate = OS1Config._requireScenario(engine);
            if (gate) return gate;

            const joined = args.join(' ').toLowerCase();
            const scenario = OS1Config._getScenario(engine);

            if (!args.length || args[0] === '/?') {
                return '\nUsage: chkdsk [volume] [/F] [/R] [/X]\n\nOptions:\n  /F    Fix errors on the disk.\n  /R    Locate bad sectors and recover readable information (implies /F).\n  /X    Force volume dismount before checking.\n\nExample: chkdsk C: /f /r';
            }

            const hasF = joined.includes('/f');
            const hasR = joined.includes('/r');
            const targetC = joined.includes('c:');

            if (!targetC) {
                return '\nThe type of the file system is NTFS.\nThe volume label is RECOVERY.\n\nThis is read-only mode (no /f or /r specified).\nChkdsk cannot run because the volume is in use by another process.';
            }

            if (!hasF && !hasR) {
                return '\nThe type of the file system is NTFS.\nVolume label: Windows.\n\nWARNING: /f or /r not specified — chkdsk will run in read-only mode.\nRun: chkdsk C: /f /r to repair errors.';
            }

            let out = '\nThe type of the file system is NTFS.\nVolume label: Windows.\n\nChkdsk is running...\n';
            out += 'Stage 1: Examining basic file system structure ...\n';
            out += '  262144 file records processed.  File verification completed.\n\n';
            out += 'Stage 2: Examining file name linkage ...\n';
            out += '  282619 index entries processed.  Index verification completed.\n\n';
            out += 'Stage 3: Examining security descriptors ...\n';
            out += '  Security descriptor verification completed.\n\n';
            out += 'Stage 4: Looking for bad clusters in user file data ...\n';

            if (scenario && scenario.id === 'disk_corruption') {
                out += '  Replacing bad clusters in file C:\\Windows\\System32\\drivers\\disk.sys\n';
                out += '  4 bad clusters detected and repaired.\n\n';
                out += 'Stage 5: Looking for bad, free clusters ...\n';
                out += '  Bad cluster found at offset 0x1F4A000. Recovered readable data.\n\n';
                out += 'Windows has scanned the file system and found no problems.\n';
                out += '476837 MB total disk space.\n';
                out += '212469 MB in 94713 files.\n';
                out += '     42 MB in 14302 indexes.\n';
                out += '      4 KB in bad sectors.\n';
                out += '476311 MB available on disk.\n\n';
                out += 'Chkdsk completed with repairs.';

                engine.state._chkdskCompleted = true;
                engine.save();
                const complete = OS1Config._checkRepairComplete(engine);

                if (complete) {
                    out += '\n\n[All disk errors repaired. System files verified.]';
                    out += '\n\nBoot log entry: {{FLAG:disk_corruption}}';
                    out += '\n\nType EXIT to restart the machine.';
                    OS1Config._revealFlag(engine, null);
                }
            } else {
                out += '  No bad clusters detected.\n\n';
                out += 'Windows has scanned the file system and found no problems.\n';
                out += '476837 MB total disk space.\n  476321 MB available on disk.';
            }

            return out;
        },

        // --- DISM ---

        dism: function(args, term, engine) {
            const gate = OS1Config._requireScenario(engine);
            if (gate) return gate;

            const joined = args.join(' ').toLowerCase();
            const scenario = OS1Config._getScenario(engine);

            if (!args.length || args[0] === '/?') {
                return '\nUsage (from WinRE):\n  dism /image:C:\\ /cleanup-image /revertpendingactions\n  dism /image:C:\\ /cleanup-image /checkhealth\n  dism /image:C:\\ /cleanup-image /restorehealth\n\nNote: Use /image: to target an offline Windows installation.';
            }

            if (joined.includes('/revertpendingactions')) {
                const isUpdateScenario = scenario && scenario.id === 'stuck_update';

                if (!joined.includes('/image:c:')) {
                    return '\nError: 11 - This option is not supported with the /online option in this context.\n\nTry: dism /image:C:\\ /cleanup-image /revertpendingactions';
                }

                let out = '\nDeployment Image Servicing and Management tool\nVersion: 10.0.22621.1\n\nImage Version: 10.0.22631.3007\n\nReverting pending actions from the image...';

                if (isUpdateScenario) {
                    out += '\n\nThe operation completed successfully.\n\n[Update KB5034441 installation rolled back.]\n[Pending actions cleared from the offline image.]\n\n';
                    out += 'Boot log entry: {{FLAG:stuck_update}}\n\nType EXIT to restart.';
                    OS1Config._revealFlag(engine, null);
                    engine.state._dismReverted = true;
                    engine.save();
                    OS1Config._checkRepairComplete(engine);
                } else {
                    out += '\n\nThe operation completed successfully.\n\n[No pending update actions found. Nothing to revert.]';
                }

                return out;
            }

            if (joined.includes('/checkhealth')) {
                return '\nDeployment Image Servicing and Management tool\nVersion: 10.0.22621.1\n\nImage Version: 10.0.22631.3007\n\n[=========================100.0%=========================]\n\nThe component store is repairable.';
            }

            if (joined.includes('/restorehealth') || joined.includes('/scanhealth')) {
                return '\nDeployment Image Servicing and Management tool\nVersion: 10.0.22621.1\n\nImage Version: 10.0.22631.3007\n\n[==                         8.3%                          ]\n[=========================100.0%=========================]\n\nThe restore operation completed successfully.\nThe operation completed successfully.';
            }

            return '\nError: The command line arguments are invalid.\nType dism /? for more information.';
        },

        // --- DISKPART ---

        diskpart: function(args, term, engine) {
            const gate = OS1Config._requireScenario(engine);
            if (gate) return gate;
            return '\nMicrosoft DiskPart version 10.0.22631.3007\n\nDiskPart is an interactive tool. In this simulation, use:\n  list disk     - List disks\n  list volume   - List volumes\n\nInteractive mode not supported. Run diskpart commands directly:\n  list volume\n  list disk';
        },

        'list volume': function(args, term, engine) {
            const gate = OS1Config._requireScenario(engine);
            if (gate) return gate;
            return '\n  Volume ###  Ltr  Label        Fs     Type        Size     Status     Info\n  ----------  ---  -----------  -----  ----------  -------  ---------  --------\n  Volume 0     C   Windows      NTFS   Partition    476 GB   Healthy    Boot\n  Volume 1         System Rese  NTFS   Partition    549 MB   Healthy    System\n  Volume 2     X   Boot         NTFS   Partition    556 MB   Healthy    Hidden';
        },

        'list disk': function(args, term, engine) {
            const gate = OS1Config._requireScenario(engine);
            if (gate) return gate;
            return '\n  Disk ###  Status         Size     Free     Dyn  Gpt\n  --------  -------------  -------  -------  ---  ---\n  Disk 0    Online          512 GB      0 B        *';
        },

        // --- DIR ---

        dir: function(args, term, engine) {
            const gate = OS1Config._requireScenario(engine);
            if (gate) return gate;

            const joined = args.join(' ').toLowerCase();

            if (joined.includes('c:\\windows') || joined.includes('c:/windows')) {
                return ' Volume in drive C is Windows\n Volume Serial Number is 1A2B-3C4D\n\n Directory of C:\\Windows\n\n03/12/2026  09:00 AM    <DIR>          .\n03/12/2026  09:00 AM    <DIR>          ..\n03/10/2026  11:30 AM    <DIR>          System32\n03/10/2026  11:30 AM    <DIR>          SysWOW64\n03/10/2026  11:30 AM    <DIR>          WinSxS\n03/10/2026  11:30 AM    <DIR>          Fonts\n03/10/2026  11:30 AM    <DIR>          Logs\n03/10/2026  11:30 AM            45,312 explorer.exe\n               1 File(s)         45,312 bytes\n               7 Dir(s)  492,473,188,352 bytes free\n\n[Windows installation confirmed at C:\\Windows]';
            }

            return ' Volume in drive X is Boot\n Volume Serial Number is 0001-0002\n\n Directory of X:\\Sources\n\n03/12/2026  09:00 AM    <DIR>          .\n03/12/2026  09:00 AM    <DIR>          ..\n               0 File(s)              0 bytes\n               2 Dir(s)  536,870,912 bytes free\n\nTip: The Windows installation is at C:\\Windows';
        },

        // --- SYSTEMINFO ---

        systeminfo: function(args, term, engine) {
            const gate = OS1Config._requireScenario(engine);
            if (gate) return gate;
            const scenario = OS1Config._getScenario(engine);
            return '\nHost Name:                 WKST-042\nOS Name:                   Microsoft Windows 11 Pro\nOS Version:                10.0.22631 N/A Build 22631\nOS Manufacturer:           Microsoft Corporation\nOS Configuration:          Member Workstation\nSystem Manufacturer:       Dell Inc.\nSystem Model:              OptiPlex 7090\nSystem Type:               x64-based PC\nProcessor(s):              Intel(R) Core(TM) i7-12700 @ 2.10GHz\nTotal Physical Memory:     16,384 MB\nBoot Device:               \\Device\\HarddiskVolume2\nSystem Locale:             en-us\nInput Locale:              en-us\nTime Zone:                 (UTC-05:00) Eastern Time\n\n[Running from Windows Recovery Environment]\n[Failure mode: ' + (scenario ? scenario.bootError.code : 'UNKNOWN') + ']';
        },

        hostname: function() { return 'WKST-042'; },

        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },

        whoami: function() { return 'WKST-042\\WinRE'; },

        exit: function(args, term, engine) {
            engine.notify('Exiting Command Prompt — returning to WinRE Advanced Options.', 'info');
            const win = engine._windows['cmd'];
            if (win && win.closeBtn) win.closeBtn.click();
            return null;
        },

        // Block Linux commands
        ifconfig: function() { return '\'ifconfig\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        sudo: function() { return '\'sudo\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        grep: function() { return '\'grep\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        apt: function() { return '\'apt\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        'apt-get': function() { return '\'apt-get\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        bash: function() { return '\'bash\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        chmod: function() { return '\'chmod\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        ipconfig: function() { return '\'ipconfig\' is not recognized as an internal or external command.\n\n[You are in WinRE — not a standard Windows session. Use bcdedit, bootrec, sfc, chkdsk, dism, or bcdboot.]'; }
    },

    // ==========================================================
    // CUSTOM WINDOW HANDLERS
    // ==========================================================

    onAppLaunch(iconDef, engine) {
        const requireTicket = ['startup_repair', 'startup_settings', 'uninstall_updates', 'system_restore'];
        if (requireTicket.includes(iconDef.app) && !engine.state._scenarioSelected) {
            engine.notify('Open the Help Desk Ticket first to receive your assignment.', 'error');
            return;
        }

        switch (iconDef.app) {
            case 'ticket':           OS1Config._openTicket(iconDef, engine); break;
            case 'startup_repair':   OS1Config._openStartupRepair(iconDef, engine); break;
            case 'startup_settings': OS1Config._openStartupSettings(iconDef, engine); break;
            case 'uninstall_updates':OS1Config._openUninstallUpdates(iconDef, engine); break;
            case 'system_restore':   OS1Config._openSystemRestore(iconDef, engine); break;
            case 'reset_lab':        OS1Config._confirmReset(engine); break;
        }
    },

    // ==========================================================
    // HELP DESK TICKET
    // ==========================================================

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        const container = document.createElement('div');
        container.id = 'ticketContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', container);
        OS1Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) {
            OS1Config._renderTicket(engine, container);
        } else {
            OS1Config._renderScenarioPicker(engine, container);
        }
    },

    _renderScenarioPicker(engine, container) {
        const ticketPreviews = [
            'Dave Richardson — "Blue screen 0xc0000034 — won\'t boot"',
            'Lisa Nguyen — "BSOD with driver name — crashes at logo"',
            'Marcus Webb — "Stuck on 35% update for 2 hours"',
            'Sarah Chen — "Boot loop with CRITICAL_PROCESS_DIED"',
            'Tom Alvarez — "Black screen: no operating system found"'
        ];

        let html = '<div style="text-align:center; margin-bottom:20px;">'
            + '<div style="color:#005ba1; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">DISPATCH QUEUE — BOOT FAILURES</div>'
            + '<div style="color:#888; font-size:0.75rem;">Select a ticket to begin, or let the system assign one randomly.</div>'
            + '</div><div style="margin-bottom:16px;">';

        OS1Config._scenarios.forEach(function(s, i) {
            html += '<button class="os1-scenario-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer; transition:border-color 0.2s;">'
                + '<div style="display:flex; justify-content:space-between; align-items:center;">'
                + '<span style="color:#005ba1; font-weight:bold;">OS-' + (1000 + i) + '</span>'
                + '<span style="background:#e74c3c; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">CRITICAL</span>'
                + '</div>'
                + '<div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + ticketPreviews[i] + '</div>'
                + '</button>';
        });
        html += '</div>';

        html += '<div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;">'
            + '<button id="os1RandomBtn" style="padding:10px 28px; background:#005ba1; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.85rem; font-family:Consolas,monospace;">Random Assignment</button>'
            + '</div>';

        container.innerHTML = html;

        container.querySelectorAll('.os1-scenario-btn').forEach(function(btn) {
            btn.addEventListener('mouseenter', function() { this.style.borderColor = '#005ba1'; });
            btn.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; });
            btn.addEventListener('click', function() {
                OS1Config._applyScenario(engine, parseInt(this.getAttribute('data-idx')));
                OS1Config._renderTicket(engine, container);
            });
        });

        document.getElementById('os1RandomBtn').addEventListener('click', function() {
            OS1Config._applyScenario(engine, Math.floor(Math.random() * OS1Config._scenarios.length));
            OS1Config._renderTicket(engine, container);
        });
    },

    _renderTicket(engine, container) {
        const scenario = OS1Config._getScenario(engine);
        const submitters = [
            'Dave Richardson — Floor Manager',
            'Lisa Nguyen — Finance Department',
            'Marcus Webb — Accounting',
            'Sarah Chen — Conference Room B',
            'Tom Alvarez — Executive Suite'
        ];
        const submitter = submitters[engine.state._scenarioId] || 'Employee';

        const errorBox = scenario.bootError;
        const errorColor = errorBox.type === 'bsod' ? '#0050ef' : errorBox.type === 'blackscreen' ? '#333' : '#cc7000';
        const errorText = errorBox.type === 'bsod' ? 'BSOD STOP CODE' : errorBox.type === 'blackscreen' ? 'BLACK SCREEN ERROR' : 'SYSTEM HANG';

        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;">'
            + '<div style="display:flex; justify-content:space-between; align-items:center;">'
            + '<span style="color:#005ba1; font-weight:bold; font-size:1rem;">DISPATCH TICKET #OS-' + (1000 + engine.state._scenarioId) + '</span>'
            + '<span style="background:#e74c3c; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">PRIORITY: CRITICAL</span>'
            + '</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBMITTED BY</div>'
            + '<div>' + submitter + '</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DATE</div>'
            + '<div>March 13, 2026 — 7:52 AM</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBJECT</div>'
            + '<div style="font-weight:bold;">' + OS1Config._escHtml(scenario.ticketSubject) + '</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DESCRIPTION</div>'
            + '<div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">'
            + OS1Config._escHtml(scenario.ticketDetail)
            + '<br><br>The CFO needs this machine operational by noon. DO NOT reinstall Windows.</div></div>'

            + (scenario.ticketExtra
                ? '<div style="margin-bottom:16px;">'
                + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">INTERNAL NOTES</div>'
                + '<div style="background:rgba(255,165,0,0.08); border:1px solid rgba(255,165,0,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#ffcc80;">'
                + OS1Config._escHtml(scenario.ticketExtra) + '</div></div>'
                : '')

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">BOOT ERROR OBSERVED</div>'
            + '<div style="background:' + errorColor + '; border-radius:4px; padding:12px; font-family:Consolas,monospace; font-size:0.75rem; white-space:pre-wrap; line-height:1.5; color:#fff;">'
            + '<div style="font-size:0.65rem; opacity:0.7; margin-bottom:6px;">[' + errorText + ']</div>'
            + OS1Config._escHtml(errorBox.message) + '</div></div>'

            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">ASSIGNED TO</div>'
            + '<div style="color:#2ecc71; font-weight:bold;">YOU — Desktop Support Technician</div></div>';
    },

    // ==========================================================
    // STARTUP REPAIR
    // ==========================================================

    _openStartupRepair(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        const container = document.createElement('div');
        container.id = 'startupRepairContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Startup Repair', 'SRP', container);
        OS1Config._runStartupRepair(engine, container);
    },

    _runStartupRepair(engine, container) {
        const scenario = OS1Config._getScenario(engine);
        engine.state._startupRepairRun = true;
        engine.save();

        container.innerHTML = '<div style="text-align:center; padding:40px 20px;">'
            + '<div style="color:#005ba1; font-weight:bold; font-size:1rem; margin-bottom:20px;">Startup Repair</div>'
            + '<div style="color:#aaa; font-size:0.8rem; margin-bottom:24px;">Diagnosing your PC...</div>'
            + '<div style="background:rgba(255,255,255,0.06); border-radius:4px; height:6px; overflow:hidden; margin-bottom:24px;">'
            + '<div id="srpProgress" style="height:100%; background:#005ba1; width:0%; transition:width 0.1s;"></div>'
            + '</div>'
            + '<div id="srpStatus" style="color:#888; font-size:0.75rem; min-height:40px;"></div>'
            + '</div>';

        // Animate progress bar
        let pct = 0;
        const statusEl = container.querySelector('#srpStatus');
        const progressEl = container.querySelector('#srpProgress');
        const steps = [
            { at: 15, msg: 'Checking boot configuration...' },
            { at: 35, msg: 'Scanning for startup problems...' },
            { at: 60, msg: 'Attempting automated repair...' },
            { at: 80, msg: 'Verifying system files...' },
            { at: 100, msg: '' }
        ];

        const interval = setInterval(function() {
            pct = Math.min(pct + 2, 100);
            if (progressEl) progressEl.style.width = pct + '%';

            for (const step of steps) {
                if (pct >= step.at && step.msg && statusEl && statusEl.textContent !== step.msg) {
                    statusEl.textContent = step.msg;
                }
            }

            if (pct >= 100) {
                clearInterval(interval);

                // S5 (missing bootloader): succeeds if bootloader was already restored
                const fixed = scenario && scenario.id === 'missing_bootloader' && engine.state._bootloaderRestored;

                if (fixed) {
                    container.innerHTML = '<div style="text-align:center; padding:40px 20px;">'
                        + '<div style="color:#2ecc71; font-size:1.5rem; margin-bottom:16px;">&#10004;</div>'
                        + '<div style="color:#2ecc71; font-weight:bold; font-size:1rem; margin-bottom:12px;">Startup Repair completed successfully</div>'
                        + '<div style="color:#aaa; font-size:0.8rem; margin-bottom:20px;">The boot issue has been resolved. Restart to boot into Windows normally.</div>'
                        + '<div style="background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px; font-size:0.75rem; text-align:left;">'
                        + '<div style="color:#2ecc71; font-weight:bold; margin-bottom:4px;">Repair Log:</div>'
                        + '<div>Boot configuration verified and corrected.</div>'
                        + '<div class="os1-flag-slot" data-scenario="missing_bootloader" style="color:#2ecc71; margin-top:8px;">{{FLAG:missing_bootloader}}</div>'
                        + '</div></div>';
                    OS1Config._fillFlagSlot(container, 'missing_bootloader');
                } else {
                    const reasons = {
                        corrupted_bcd: 'The Boot Configuration Data store is missing or corrupted. Startup Repair cannot automatically rebuild BCD. Use Command Prompt: bootrec /rebuildbcd',
                        bad_driver: 'A third-party driver is preventing startup. Startup Repair cannot roll back drivers. Use Startup Settings to boot in Safe Mode, then use Device Manager.',
                        stuck_update: 'A pending Windows Update is blocking startup. Use "Uninstall Updates" to remove the failed update.',
                        disk_corruption: 'Critical system files are corrupted. Startup Repair cannot repair disk-level errors. Use Command Prompt: sfc /scannow /offbootdir=C:\\ /offwindir=C:\\Windows, then chkdsk C: /f /r',
                        missing_bootloader: 'The bootloader files are missing. Use Command Prompt: bcdboot C:\\Windows /s C:'
                    };
                    const reason = scenario ? (reasons[scenario.id] || 'Startup Repair could not identify the problem.') : 'No active scenario.';

                    container.innerHTML = '<div style="text-align:center; padding:32px 20px;">'
                        + '<div style="color:#e74c3c; font-size:1.5rem; margin-bottom:16px;">&#10006;</div>'
                        + '<div style="color:#e74c3c; font-weight:bold; font-size:1rem; margin-bottom:12px;">Startup Repair couldn\'t repair your PC</div>'
                        + '<div style="background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.25); border-radius:4px; padding:12px; text-align:left; margin-bottom:16px;">'
                        + '<div style="color:#888; font-size:0.7rem; margin-bottom:6px;">DIAGNOSTIC OUTPUT:</div>'
                        + '<div style="color:#ffcc80; font-size:0.78rem; line-height:1.6;">' + OS1Config._escHtml(reason) + '</div>'
                        + '</div>'
                        + '<div style="color:#888; font-size:0.75rem;">Return to the recovery options and try a different tool.</div>'
                        + '</div>';
                }
            }
        }, 60);
    },

    // ==========================================================
    // STARTUP SETTINGS (Safe Mode)
    // ==========================================================

    _openStartupSettings(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        const container = document.createElement('div');
        container.id = 'startupSettingsContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Startup Settings', 'SS', container);
        OS1Config._renderStartupSettings(engine, container);
    },

    _renderStartupSettings(engine, container) {
        const inSafeMode = engine.state._safeModeActive;

        if (inSafeMode) {
            OS1Config._renderSafeModeDesktop(engine, container);
            return;
        }

        container.innerHTML = '<div style="margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px;">'
            + '<div style="color:#005ba1; font-weight:bold; font-size:1rem; margin-bottom:4px;">Startup Settings</div>'
            + '<div style="color:#888; font-size:0.75rem;">After restarting, choose an option:</div>'
            + '</div>'

            + '<div style="margin-bottom:16px;">'
            + OS1Config._startupOption('1', 'Enable Debugging', false)
            + OS1Config._startupOption('2', 'Enable Boot Logging', false)
            + OS1Config._startupOption('3', 'Enable Low-Resolution Video', false)
            + OS1Config._startupOption('4', 'Enable Safe Mode', true)
            + OS1Config._startupOption('5', 'Enable Safe Mode with Networking', false)
            + OS1Config._startupOption('6', 'Enable Safe Mode with Command Prompt', false)
            + OS1Config._startupOption('7', 'Disable Driver Signature Enforcement', false)
            + OS1Config._startupOption('8', 'Disable Early Launch Anti-Malware Protection', false)
            + OS1Config._startupOption('9', 'Disable Automatic Restart After Failure', false)
            + '</div>'

            + '<div style="color:#888; font-size:0.7rem; margin-bottom:16px;">Press a number key to select an option. For this simulation, click the option.</div>'

            + '<button id="ss-restart" style="padding:8px 24px; background:#005ba1; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.8rem;">Restart Now</button>';

        container.querySelectorAll('.ss-option-btn').forEach(function(btn) {
            btn.addEventListener('mouseenter', function() { this.style.background = 'rgba(0,91,161,0.15)'; });
            btn.addEventListener('mouseleave', function() { this.style.background = 'rgba(255,255,255,0.03)'; });
            btn.addEventListener('click', function() {
                const num = parseInt(this.getAttribute('data-num'));
                if (num === 4 || num === 5 || num === 6) {
                    OS1Config._bootIntoSafeMode(engine, container, num);
                } else {
                    engine.notify('Option ' + num + ' selected. Click "Restart Now" to apply — or select Safe Mode (4, 5, or 6) to diagnose the driver issue.', 'info');
                }
            });
        });

        const restartBtn = document.getElementById('ss-restart');
        if (restartBtn) {
            restartBtn.addEventListener('click', function() {
                engine.notify('Restarting into Startup Settings... Select Safe Mode (option 4) to diagnose the driver problem.', 'info');
            });
        }
    },

    _startupOption(num, label, highlight) {
        return '<div class="ss-option-btn" data-num="' + num + '" style="display:flex; align-items:center; padding:8px 12px; margin-bottom:4px; background:rgba(255,255,255,0.03); border:1px solid ' + (highlight ? 'rgba(0,91,161,0.4)' : 'rgba(255,255,255,0.06)') + '; border-radius:3px; cursor:pointer;">'
            + '<span style="color:' + (highlight ? '#005ba1' : '#888') + '; font-weight:bold; min-width:20px;">' + num + '.</span>'
            + '<span style="color:' + (highlight ? '#c8e6c9' : '#aaa') + '; margin-left:8px;">' + label + '</span>'
            + '</div>';
    },

    _bootIntoSafeMode(engine, container, modeNum) {
        const modeNames = { 4: 'Safe Mode', 5: 'Safe Mode with Networking', 6: 'Safe Mode with Command Prompt' };
        const modeName = modeNames[modeNum] || 'Safe Mode';

        container.innerHTML = '<div style="text-align:center; padding:40px 20px;">'
            + '<div style="color:#005ba1; font-weight:bold; font-size:1rem; margin-bottom:20px;">Restarting into ' + modeName + '...</div>'
            + '<div style="background:rgba(255,255,255,0.06); border-radius:4px; height:4px; overflow:hidden; margin:0 auto 20px; max-width:300px;">'
            + '<div id="smProgress" style="height:100%; background:#005ba1; width:0%; transition:width 0.08s;"></div>'
            + '</div>'
            + '<div style="color:#888; font-size:0.75rem;">Loading minimal drivers...</div>'
            + '</div>';

        let pct = 0;
        const prog = container.querySelector('#smProgress');
        const iv = setInterval(function() {
            pct = Math.min(pct + 4, 100);
            if (prog) prog.style.width = pct + '%';
            if (pct >= 100) {
                clearInterval(iv);
                engine.state._safeModeActive = true;
                engine.save();
                OS1Config._renderSafeModeDesktop(engine, container);
            }
        }, 60);
    },

    _renderSafeModeDesktop(engine, container) {
        const scenario = OS1Config._getScenario(engine);
        const driverRolledBack = engine.state._driverRolledBack;
        const isBadDriver = scenario && scenario.id === 'bad_driver';

        container.innerHTML = '<div style="border-bottom:1px solid rgba(0,91,161,0.3); padding-bottom:12px; margin-bottom:16px;">'
            + '<div style="color:#005ba1; font-weight:bold; font-size:1rem; margin-bottom:4px;">Safe Mode Active</div>'
            + '<div style="background:rgba(0,91,161,0.15); border:1px solid rgba(0,91,161,0.3); border-radius:3px; padding:6px 10px; font-size:0.75rem; color:#80b4e0;">Running with minimal drivers. Display adapter not loaded.</div>'
            + '</div>'

            + '<div style="font-size:0.8rem; font-weight:bold; color:#aaa; margin-bottom:12px;">Available Tools in Safe Mode:</div>'

            + '<div id="safeModeDevMgr" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:4px; padding:12px; margin-bottom:8px; cursor:pointer;" '
            + 'onmouseenter="this.style.borderColor=\'#005ba1\'" onmouseleave="this.style.borderColor=\'rgba(255,255,255,0.1)\'">'
            + '<div style="font-weight:bold; color:#c8e6c9; margin-bottom:4px;">Device Manager</div>'
            + '<div style="color:#888; font-size:0.75rem;">Manage hardware drivers, roll back or uninstall problem drivers.</div>'
            + '</div>'

            + (!driverRolledBack && isBadDriver
                ? '<div style="background:rgba(255,165,0,0.08); border:1px solid rgba(255,165,0,0.3); border-radius:4px; padding:10px; margin-bottom:8px; font-size:0.75rem; color:#ffcc80;">'
                + '<strong>Hint:</strong> Open Device Manager, find the display adapter, and roll back the driver.'
                + '</div>'
                : '')

            + (driverRolledBack
                ? '<div style="background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:10px; font-size:0.75rem; color:#2ecc71;">'
                + 'Driver rolled back successfully. The workstation should now boot normally. '
                + '<strong class="os1-flag-slot" data-scenario="bad_driver">{{FLAG:bad_driver}}</strong>'
                + '</div>'
                : '');

        if (driverRolledBack) OS1Config._fillFlagSlot(container, 'bad_driver');

        const devMgrBtn = document.getElementById('safeModeDevMgr');
        if (devMgrBtn) {
            devMgrBtn.addEventListener('click', function() {
                OS1Config._openDeviceManagerSafeMode(engine, container);
            });
        }
    },

    // ==========================================================
    // DEVICE MANAGER (Safe Mode — for S2 bad driver)
    // ==========================================================

    _openDeviceManagerSafeMode(engine, container) {
        const scenario = OS1Config._getScenario(engine);
        const isBadDriver = scenario && scenario.id === 'bad_driver';
        const driverRolledBack = engine.state._driverRolledBack;
        container.innerHTML = '<div style="font-size:1rem; font-weight:bold; color:#005ba1; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">'
            + 'Device Manager — WKST-042 [Safe Mode]</div>'

            + '<div style="margin-bottom:8px;">'
            + '<div style="color:#aaa; padding:4px 0;">&#9660; Computer</div>'

            + '<div style="padding-left:20px;">'
            + '<div style="color:#888; padding:4px 0;">&#9654; Disk drives</div>'
            + '<div style="color:#888; padding:4px 0;">&#9654; Human Interface Devices</div>'
            + '<div style="color:#888; padding:4px 0;">&#9654; Keyboards</div>'
            + '<div style="color:#888; padding:4px 0;">&#9654; Mice and other pointing devices</div>'
            + '<div style="color:#888; padding:4px 0;">&#9654; Network adapters</div>'
            + '<div style="color:#888; padding:4px 0;">&#9654; Storage controllers</div>'

            + '<div style="padding:4px 0;">'
            + '<span style="color:#ccc;">&#9660; Display adapters</span>'
            + '<div style="padding-left:20px; margin-top:4px;">'
            + '<div id="nvidiaEntry" style="background:rgba(255,255,255,0.04); border:1px solid ' + (isBadDriver && !driverRolledBack ? '#e74c3c' : '#2ecc71') + '; border-radius:4px; padding:12px; margin-bottom:8px;">'

            + '<div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">'
            + '<span style="font-size:1.1rem; color:' + (isBadDriver && !driverRolledBack ? '#e74c3c' : '#2ecc71') + ';">'
            + (isBadDriver && !driverRolledBack ? '&#9888;' : '&#10004;') + '</span>'
            + '<span style="font-weight:bold;">NVIDIA GeForce RTX 3060</span>'
            + '</div>'

            + '<div style="font-size:0.75rem; color:#888; margin-bottom:8px;">'
            + '<div>Driver: NVIDIA — 546.33 (2025-11-14)</div>'
            + '<div>Status: <span style="color:' + (isBadDriver && !driverRolledBack ? '#e74c3c; font-weight:bold">ERROR: Code 43 — Device stopped' : '#2ecc71">' + (driverRolledBack ? 'Driver rolled back (537.42)' : 'Working properly')) + '</span></div>'
            + '</div>'

            + (isBadDriver && !driverRolledBack
                ? '<div style="background:rgba(231,76,60,0.1); border:1px solid rgba(231,76,60,0.2); border-radius:3px; padding:8px; margin-bottom:10px; font-size:0.75rem; color:#ffcc80;">'
                + 'This device cannot start. (Code 43)\nDriver version 546.33 may be incompatible with this system configuration.'
                + '</div>'
                : '')

            + (driverRolledBack
                ? '<div style="background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:8px; margin-bottom:8px; font-size:0.75rem;">'
                + '<div style="color:#2ecc71; font-weight:bold; margin-bottom:4px;">Driver Rollback Log:</div>'
                + '<div style="color:#c8e6c9;">Previous driver (546.33) removed. Version 537.42 restored.</div>'
                + '<div class="os1-flag-slot" data-scenario="bad_driver" style="color:#2ecc71; margin-top:4px;">{{FLAG:bad_driver}}</div>'
                + '</div>'
                : '')

            + '<div style="display:flex; gap:8px;">'
            + (isBadDriver && !driverRolledBack
                ? '<button id="rollBackBtn" style="padding:6px 18px; background:#005ba1; color:#fff; border:none; border-radius:3px; cursor:pointer; font-weight:bold; font-size:0.75rem;">Roll Back Driver</button>'
                : '')
            + (isBadDriver && !driverRolledBack
                ? '<button id="uninstallDrvBtn" style="padding:6px 18px; background:#e74c3c; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.75rem;">Uninstall Device</button>'
                : '')
            + '<button id="devPropsBtn" style="padding:6px 18px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:3px; cursor:pointer; font-size:0.75rem;">Properties</button>'
            + '</div>'

            + '</div></div></div>'
            + '</div></div>';

        if (driverRolledBack) OS1Config._fillFlagSlot(container, 'bad_driver');

        const rollBackBtn = document.getElementById('rollBackBtn');
        if (rollBackBtn) {
            rollBackBtn.addEventListener('click', function() {
                engine.state._driverRolledBack = true;
                engine.save();
                OS1Config._checkRepairComplete(engine);
                engine.notify('Driver rolled back to version 537.42. Boot the machine normally to verify the fix.', 'success');
                OS1Config._openDeviceManagerSafeMode(engine, container);
            });
        }

        const uninstallBtn = document.getElementById('uninstallDrvBtn');
        if (uninstallBtn) {
            uninstallBtn.addEventListener('click', function() {
                engine.state._driverRolledBack = true;
                engine.save();
                OS1Config._checkRepairComplete(engine);
                engine.notify('Driver uninstalled. Windows will use the generic display driver. Reboot to verify.', 'success');
                OS1Config._openDeviceManagerSafeMode(engine, container);
            });
        }

        const propsBtn = document.getElementById('devPropsBtn');
        if (propsBtn) {
            propsBtn.addEventListener('click', function() {
                engine.notify('NVIDIA GeForce RTX 3060 — Driver: 546.33 — Status: Code 43 error. Roll back to previous driver to resolve.', 'info');
            });
        }
    },

    // ==========================================================
    // UNINSTALL UPDATES
    // ==========================================================

    _openUninstallUpdates(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        const container = document.createElement('div');
        container.id = 'uninstallUpdatesContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Uninstall Updates', 'UU', container);
        OS1Config._renderUninstallUpdates(engine, container);
    },

    _renderUninstallUpdates(engine, container) {
        const scenario = OS1Config._getScenario(engine);
        const isUpdateScenario = scenario && scenario.id === 'stuck_update';
        const alreadyFixed = engine.state._updateUninstalled;

        if (alreadyFixed) {
            container.innerHTML = '<div style="text-align:center; padding:40px 20px;">'
                + '<div style="color:#2ecc71; font-size:1.5rem; margin-bottom:16px;">&#10004;</div>'
                + '<div style="color:#2ecc71; font-weight:bold; margin-bottom:12px;">Update Uninstalled Successfully</div>'
                + '<div style="background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px; text-align:left;">'
                + '<div style="color:#2ecc71; font-weight:bold; margin-bottom:4px;">Uninstall Log:</div>'
                + '<div>KB5034441 removed. System restored to pre-update state.</div>'
                + '<div class="os1-flag-slot" data-scenario="stuck_update" style="color:#2ecc71; margin-top:8px;">{{FLAG:stuck_update}}</div>'
                + '</div>'
                + '</div>';
            OS1Config._fillFlagSlot(container, 'stuck_update');
            return;
        }

        container.innerHTML = '<div style="margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px;">'
            + '<div style="color:#005ba1; font-weight:bold; font-size:1rem; margin-bottom:4px;">Uninstall Updates</div>'
            + '<div style="color:#888; font-size:0.75rem;">Remove a recent update if it is preventing Windows from starting.</div>'
            + '</div>'

            + '<div style="margin-bottom:16px;">'
            + OS1Config._updateOption('uninstall-quality', 'Uninstall latest quality update',
                isUpdateScenario ? 'Remove KB5034441 (2026-02 Cumulative Update for Windows 11)' : 'Remove the most recently installed quality update',
                isUpdateScenario)
            + OS1Config._updateOption('uninstall-feature', 'Uninstall latest feature update',
                'Remove the most recently installed feature update (Windows version upgrade)',
                false)
            + '</div>';

        container.querySelectorAll('.update-option-btn').forEach(function(btn) {
            btn.addEventListener('mouseenter', function() { this.style.borderColor = '#005ba1'; });
            btn.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; });
            btn.addEventListener('click', function() {
                const which = this.getAttribute('data-which');
                if (which === 'uninstall-quality' && isUpdateScenario) {
                    OS1Config._runUninstallUpdate(engine, container);
                } else if (which === 'uninstall-feature') {
                    engine.notify('No feature update found to uninstall. Try uninstalling the latest quality update instead.', 'error');
                } else {
                    engine.notify('No updates found to uninstall for the current issue. Check if this is the correct tool for this failure type.', 'error');
                }
            });
        });
    },

    _updateOption(id, title, desc, highlight) {
        return '<div class="update-option-btn" data-which="' + id + '" style="background:rgba(255,255,255,0.04); border:1px solid ' + (highlight ? 'rgba(0,91,161,0.4)' : 'rgba(255,255,255,0.12)') + '; border-radius:4px; padding:14px; margin-bottom:8px; cursor:pointer;">'
            + '<div style="font-weight:bold; color:' + (highlight ? '#c8e6c9' : '#aaa') + '; margin-bottom:4px;">' + title + '</div>'
            + '<div style="font-size:0.75rem; color:#888;">' + desc + '</div>'
            + '</div>';
    },

    _runUninstallUpdate(engine, container) {
        container.innerHTML = '<div style="text-align:center; padding:40px 20px;">'
            + '<div style="color:#005ba1; font-weight:bold; margin-bottom:20px;">Uninstalling KB5034441...</div>'
            + '<div style="background:rgba(255,255,255,0.06); border-radius:4px; height:6px; overflow:hidden; margin:0 auto 20px; max-width:320px;">'
            + '<div id="uuProgress" style="height:100%; background:#005ba1; width:0%; transition:width 0.1s;"></div>'
            + '</div>'
            + '<div id="uuStatus" style="color:#888; font-size:0.75rem;">Preparing to uninstall...</div>'
            + '</div>';

        let pct = 0;
        const prog = container.querySelector('#uuProgress');
        const status = container.querySelector('#uuStatus');
        const msgs = [
            { at: 20, msg: 'Reverting pending changes...' },
            { at: 50, msg: 'Removing update files...' },
            { at: 80, msg: 'Restoring previous configuration...' }
        ];
        const iv = setInterval(function() {
            pct = Math.min(pct + 2, 100);
            if (prog) prog.style.width = pct + '%';
            for (const m of msgs) {
                if (pct >= m.at && status && status.textContent !== m.msg) status.textContent = m.msg;
            }
            if (pct >= 100) {
                clearInterval(iv);
                engine.state._updateUninstalled = true;
                engine.save();
                OS1Config._checkRepairComplete(engine);
                OS1Config._renderUninstallUpdates(engine, container);
                engine.notify('Update KB5034441 removed. The workstation should boot normally on restart.', 'success');
            }
        }, 60);
    },

    // ==========================================================
    // SYSTEM RESTORE
    // ==========================================================

    _openSystemRestore(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        const container = document.createElement('div');
        container.id = 'systemRestoreContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'System Restore', 'SR', container);
        OS1Config._renderSystemRestore(engine, container);
    },

    _renderSystemRestore(engine, container) {
        const scenario = OS1Config._getScenario(engine);
        const canRestore = scenario && (scenario.id === 'bad_driver' || scenario.id === 'stuck_update');
        const alreadyRestored = engine.state._systemRestored;

        const restorePoints = [
            { date: 'March 12, 2026 6:00 AM', desc: 'Windows Update KB5034441', type: 'Update' },
            { date: 'March 10, 2026 11:30 PM', desc: 'Automatic Restore Point', type: 'System' },
            { date: 'February 28, 2026 8:00 AM', desc: 'Windows Update KB5033375', type: 'Update' }
        ];

        if (alreadyRestored) {
            container.innerHTML = '<div style="text-align:center; padding:40px 20px;">'
                + '<div style="color:#2ecc71; font-size:1.5rem; margin-bottom:16px;">&#10004;</div>'
                + '<div style="color:#2ecc71; font-weight:bold; margin-bottom:12px;">System Restore completed successfully</div>'
                + '<div style="color:#aaa; font-size:0.8rem; margin-bottom:20px;">The system has been restored to an earlier state.</div>'
                + '<div style="background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px; font-size:0.75rem;">'
                + '<div class="os1-flag-slot" data-scenario="' + scenario.id + '" style="color:#2ecc71; margin-top:4px;">{{FLAG:' + scenario.id + '}}</div>'
                + '</div></div>';
            OS1Config._fillFlagSlot(container, scenario.id);
            return;
        }

        let html = '<div style="margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px;">'
            + '<div style="color:#005ba1; font-weight:bold; font-size:1rem; margin-bottom:4px;">System Restore</div>'
            + '<div style="color:#888; font-size:0.75rem;">Restore Windows to an earlier point in time without affecting your personal files.</div>'
            + '</div>';

        if (!canRestore) {
            html += '<div style="background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.25); border-radius:4px; padding:12px; margin-bottom:16px;">'
                + '<div style="color:#e74c3c; font-weight:bold; margin-bottom:4px;">System Restore cannot complete</div>'
                + '<div style="color:#ffcc80; font-size:0.8rem;">System Restore could not access a file. This is usually because an antivirus program is running, or because the system files are corrupted. System Restore cannot be used to fix this issue.</div>'
                + '</div>';
        } else {
            html += '<div style="font-size:0.75rem; color:#888; margin-bottom:12px;">Select a restore point:</div>';
            restorePoints.forEach(function(rp, idx) {
                html += '<div class="rp-btn" data-idx="' + idx + '" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:4px; padding:12px; margin-bottom:8px; cursor:pointer;">'
                    + '<div style="display:flex; justify-content:space-between; align-items:center;">'
                    + '<span style="font-weight:bold;">' + rp.date + '</span>'
                    + '<span style="background:rgba(255,255,255,0.1); color:#888; padding:2px 8px; border-radius:3px; font-size:0.65rem;">' + rp.type + '</span>'
                    + '</div>'
                    + '<div style="color:#888; font-size:0.75rem; margin-top:4px;">' + rp.desc + '</div>'
                    + '</div>';
            });
        }

        container.innerHTML = html;

        container.querySelectorAll('.rp-btn').forEach(function(btn) {
            btn.addEventListener('mouseenter', function() { this.style.borderColor = '#005ba1'; });
            btn.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.1)'; });
            btn.addEventListener('click', function() {
                OS1Config._runSystemRestore(engine, container, scenario);
            });
        });
    },

    _runSystemRestore(engine, container, scenario) {
        container.innerHTML = '<div style="text-align:center; padding:40px 20px;">'
            + '<div style="color:#005ba1; font-weight:bold; margin-bottom:20px;">Restoring your system...</div>'
            + '<div style="color:#888; font-size:0.75rem; margin-bottom:20px;">Please wait. Do not interrupt this process.</div>'
            + '<div style="background:rgba(255,255,255,0.06); border-radius:4px; height:6px; overflow:hidden; margin:0 auto 20px; max-width:320px;">'
            + '<div id="srProgress" style="height:100%; background:#005ba1; width:0%; transition:width 0.1s;"></div>'
            + '</div></div>';

        let pct = 0;
        const prog = container.querySelector('#srProgress');
        const iv = setInterval(function() {
            pct = Math.min(pct + 1, 100);
            if (prog) prog.style.width = pct + '%';
            if (pct >= 100) {
                clearInterval(iv);
                engine.state._systemRestored = true;
                engine.save();
                OS1Config._checkRepairComplete(engine);
                OS1Config._renderSystemRestore(engine, container);
                engine.notify('System Restore complete. The workstation should boot normally.', 'success');
            }
        }, 60);
    },

    // ==========================================================
    // UTILITY METHODS
    // ==========================================================

    _confirmReset(engine) {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        overlay.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px 32px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9; max-width:360px;">'
            + '<div style="font-size:1rem; font-weight:bold; margin-bottom:12px; color:#e74c3c;">Reset Lab?</div>'
            + '<div style="font-size:0.8rem; color:#aaa; margin-bottom:20px;">This will clear all progress, generate a new scenario, and restart from the beginning.</div>'
            + '<div style="display:flex; gap:12px; justify-content:center;">'
            + '<button id="os1ResetConfirm" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.8rem;">Reset</button>'
            + '<button id="os1ResetCancel" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer; font-size:0.8rem;">Cancel</button>'
            + '</div></div>';

        const arena = document.getElementById('arena');
        arena.appendChild(overlay);

        document.getElementById('os1ResetConfirm').addEventListener('click', function() {
            OS1Config._flagRestored = false;
            OS1Config.hints = OS1Config._defaultHints;
            engine.reset();
        });
        document.getElementById('os1ResetCancel').addEventListener('click', function() { overlay.remove(); });
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    },

    async _fillFlagSlot(container, scenarioId) {
        let flagText = null;
        try {
            flagText = await BoxEngine.requestFlagText(scenarioId);
        } catch (e) {
            flagText = null;
        }
        if (!container) return;
        const slots = container.querySelectorAll('.os1-flag-slot[data-scenario="' + scenarioId + '"]');
        slots.forEach(function(el) {
            el.textContent = flagText || 'Flag could not be retrieved. Please check your connection and try again.';
        });
    },

    _escHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};
