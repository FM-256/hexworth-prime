/* ============================================================
   DISPATCH LAB — Box HW2: Blue Screen Blues
   CompTIA A+ Core 1 — BSOD Troubleshooting
   5 scenarios: driver conflict, RAM failure, CPU overheat,
   corrupt system file, failing SSD
   ============================================================ */

var HW2Config = {

    title: 'Blue Screen Blues',
    subtitle: 'STOP Error — A+ Core 1 BSOD Troubleshooting',
    difficulty: 'Intermediate',
    accent: '#ef4444',
    storageKey: 'hexworth_lab_hw2',
    registryId: 'hw002-blue-screen',
    trackerKey: 'lab_hw2',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the BSOD complaint and note the stop code if mentioned.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check Event Viewer', tip: 'Open Event Viewer to find crash logs, driver errors, and hardware warnings.', trigger: { event: 'window_open', match: { type: 'event_viewer' } } },
            { title: 'Run diagnostics', tip: 'Use Command Prompt to run sfc, DISM, memtest, or check SMART status depending on the symptoms.', trigger: { event: 'command', match: { cmd: 'contains:sfc' }, alt: [{ event: 'command', match: { cmd: 'contains:dism' } }, { event: 'command', match: { cmd: 'contains:wmic' } }] } },
            { title: 'Apply the fix', tip: 'Roll back the driver, replace RAM, reapply thermal paste, repair system files, or replace the SSD.', trigger: { event: 'command', match: { cmd: 'contains:fix' }, alt: [{ event: 'window_open', match: { type: 'hw_panel' } }] } },
            { title: 'Capture the flag', tip: 'After resolving the BSOD cause, locate the diagnostic token.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: { certPath: 'A+ Core 1 / MD-100', mappings: [
            /* MD-100 M11: Troubleshoot Hardware & Drivers. Module id and title taken from
               _app/tenant/md-100-map.js, the course map, so this claim matches what the
               course actually teaches. Deliberately NOT the 5.1/4.1 style the two older
               MD-100 boxes use: MD-100 has four exam domains and no in-repo source
               defines that numbering, so reusing it would be inventing a citation. */
            { flagId: 'fixed', objective: 'M11', description: 'Troubleshoot Hardware & Drivers', skill: 'STOP code analysis, driver rollback, memory and storage diagnostics' },
        { flagId: 'fixed', objective: '5.3', description: 'Troubleshoot and diagnose problems with storage', skill: 'SMART Monitoring and SSD Health' },
        { flagId: 'fixed', objective: '5.2', description: 'Troubleshoot common hardware problems', skill: 'BSOD Analysis and Hardware Diagnostics' }
    ] },

    _devices: [
        { name: 'Dell OptiPlex 5090', cpu: 'Intel Core i5-11500', ram: '16 GB DDR4', storage: 'WD SN750 500GB NVMe', gpu: 'Intel UHD 750', os: 'Windows 10 Pro' }
    ],

    _scenarioFlags: { driver_conflict: null, ram_fail: null, cpu_overheat: null, corrupt_file: null, ssd_failing: null },

    _scenarios: [
        {
            id: 'driver_conflict',
            name: 'Driver Conflict (Recently Installed)',
            ticketSubject: 'Workstation BSODs with IRQL_NOT_LESS_OR_EQUAL after GPU driver update',
            ticketDetail: 'My workstation keeps crashing with a blue screen. The error says "IRQL_NOT_LESS_OR_EQUAL" and mentions something about nvlddmkm.sys. This started happening yesterday after I installed a new NVIDIA driver for my external GPU dock. It crashes randomly — sometimes during boot, sometimes while working.',
            ticketExtra: 'IT Note: User installed NVIDIA driver v537.58 from the NVIDIA website instead of the IT-approved driver package. The external GPU dock uses a Thunderbolt connection. The IRQL error and nvlddmkm.sys reference point to a kernel-mode driver conflict.',
            affectedDevice: 0,
            fixDescription: 'Roll back NVIDIA driver to previous stable version via Device Manager',
            stateOverrides: { _driverConflict: true, _stopCode: 'IRQL_NOT_LESS_OR_EQUAL', _faultModule: 'nvlddmkm.sys' }
        },
        {
            id: 'ram_fail',
            name: 'RAM Stick Failing (Memtest Errors)',
            ticketSubject: 'Workstation crashes with MEMORY_MANAGEMENT error — multiple times a day',
            ticketDetail: 'My computer crashes 3-4 times a day with a blue screen that says "MEMORY_MANAGEMENT". Sometimes it also says "PAGE_FAULT_IN_NONPAGED_AREA". It happens at random times — no pattern. I have not installed anything new. It has been getting worse over the past week.',
            ticketExtra: 'IT Note: MEMORY_MANAGEMENT and PAGE_FAULT errors often indicate physical RAM failure. This workstation has 2x8GB DDR4 sticks. One may be failing. Run Windows Memory Diagnostic or memtest to identify the bad stick.',
            affectedDevice: 0,
            fixDescription: 'Identify and replace the failing RAM stick using memtest results',
            stateOverrides: { _ramFail: true, _stopCode: 'MEMORY_MANAGEMENT', _badSlot: 'DIMM Slot B (8GB Stick #2)' }
        },
        {
            id: 'cpu_overheat',
            name: 'CPU Overheating (Thermal Paste Dried)',
            ticketSubject: 'Workstation BSODs with KERNEL_DATA_INPAGE_ERROR during heavy tasks',
            ticketDetail: 'My workstation crashes whenever I run anything CPU-intensive — compiling code, rendering video, even running multiple Excel spreadsheets. The blue screen says "KERNEL_DATA_INPAGE_ERROR". The computer also seems very sluggish before the crash and the fan is incredibly loud. It never crashes when idle.',
            ticketExtra: 'IT Note: KERNEL_DATA_INPAGE_ERROR under load combined with loud fans and sluggishness suggests thermal throttling leading to crash. This workstation is 4 years old. The thermal paste between the CPU and heatsink may have dried out. Check CPU temperature under load.',
            affectedDevice: 0,
            fixDescription: 'Clean heatsink, reapply thermal paste, and verify fan operation',
            stateOverrides: { _cpuOverheat: true, _stopCode: 'KERNEL_DATA_INPAGE_ERROR', _cpuTemp: '98°C (Throttling at 100°C)' }
        },
        {
            id: 'corrupt_file',
            name: 'Corrupt System File (DISM/SFC)',
            ticketSubject: 'Workstation BSODs with CRITICAL_PROCESS_DIED randomly',
            ticketDetail: 'My workstation crashes with "CRITICAL_PROCESS_DIED" at random intervals. Sometimes it runs for hours, sometimes it crashes within 10 minutes of booting. A few weeks ago we had a power outage and since then these crashes have been happening. The IT guy said the hard drive passed the health check.',
            ticketExtra: 'IT Note: CRITICAL_PROCESS_DIED often means a critical Windows process terminated unexpectedly. The power outage may have corrupted system files during an active write. SSD SMART is clean but filesystem integrity may be compromised. Run SFC and DISM to check for corruption.',
            affectedDevice: 0,
            fixDescription: 'Run DISM /RestoreHealth then SFC /scannow to repair corrupt system files',
            stateOverrides: { _corruptFile: true, _stopCode: 'CRITICAL_PROCESS_DIED' }
        },
        {
            id: 'ssd_failing',
            name: 'Failing SSD (SMART Warnings)',
            ticketSubject: 'Workstation BSODs with WHEA_UNCORRECTABLE_ERROR and is getting slower',
            ticketDetail: 'My workstation is crashing with "WHEA_UNCORRECTABLE_ERROR" and everything is getting slower. Programs take forever to open. Saving files sometimes fails. The blue screen happens once or twice a day. I also noticed a warning pop-up about "disk health" a few days ago but I dismissed it.',
            ticketExtra: 'IT Note: WHEA_UNCORRECTABLE_ERROR can indicate hardware failure. The SMART disk health warning combined with degraded performance points to SSD failure. Check SMART attributes for reallocated sectors, wear leveling, and media errors. This SSD may need immediate replacement.',
            affectedDevice: 0,
            fixDescription: 'Back up data and replace the failing SSD — SMART confirms end-of-life',
            stateOverrides: { _ssdFailing: true, _stopCode: 'WHEA_UNCORRECTABLE_ERROR' }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Check Event Viewer for crash logs and the BSOD stop code from the ticket.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'BSODs have many causes: drivers, RAM, overheating, corrupt files, failing storage.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use sfc, dism, wmic diskdrive, or the Hardware Panel to diagnose.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after identifying and fixing the root cause.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        driver_conflict: [
            { id: 'hint1', text: 'IRQL_NOT_LESS_OR_EQUAL with nvlddmkm.sys — this is an NVIDIA kernel driver.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The user installed a non-approved NVIDIA driver. Roll it back to the previous version.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Use Device Manager to roll back the GPU driver, or uninstall the problematic driver.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Hardware Panel: Device Manager > Display Adapter > Roll Back Driver.', cost: 150, penalty: -150 }
        ],
        ram_fail: [
            { id: 'hint1', text: 'MEMORY_MANAGEMENT errors at random = likely physical RAM failure.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run memtest or Windows Memory Diagnostic to identify the failing DIMM.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Memtest shows errors on DIMM Slot B. Replace the 8GB stick in Slot B.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Hardware Panel: Memory > Run Memtest > Replace DIMM B.', cost: 150, penalty: -150 }
        ],
        cpu_overheat: [
            { id: 'hint1', text: 'Crashes only under load + loud fans = thermal issue. Check CPU temperature.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'CPU is at 98C under load. Thermal paste has dried out after 4 years.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Clean the heatsink, remove old thermal paste, apply new paste, verify fan.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Hardware Panel: CPU/Cooling > Reapply Thermal Paste.', cost: 150, penalty: -150 }
        ],
        corrupt_file: [
            { id: 'hint1', text: 'CRITICAL_PROCESS_DIED after a power outage suggests file system corruption.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'SSD SMART is clean but system files may be corrupt. Run SFC and DISM.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Run: DISM /Online /Cleanup-Image /RestoreHealth, then sfc /scannow.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run DISM first, then SFC. Both commands will report if corruption was found and repaired.', cost: 150, penalty: -150 }
        ],
        ssd_failing: [
            { id: 'hint1', text: 'WHEA_UNCORRECTABLE_ERROR + slow performance + disk warnings = failing drive.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Check SMART attributes: wmic diskdrive get status, or use the Hardware Panel.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'SMART shows critical warnings: reallocated sectors high, media errors detected. SSD is end-of-life.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Back up data immediately and replace the SSD. In Hardware Panel: Storage > Replace SSD.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !HW2Config._flagRestored) { HW2Config._flagRestored = true; var s = HW2Config._scenarios[engine.state._scenarioId]; if (s) HW2Config.hints = HW2Config._scenarioHints[s.id] || HW2Config._defaultHints; } return true; },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        engine.state._driverConflict = false; engine.state._ramFail = false; engine.state._cpuOverheat = false; engine.state._corruptFile = false; engine.state._ssdFailing = false;
        engine.state._labComplete = false; engine.state._flagRevealed = false;
        var ov = HW2Config._scenarios[idx].stateOverrides || {}; for (var k in ov) engine.state[k] = ov[k];
        HW2Config._flagRestored = true; HW2Config.hints = HW2Config._scenarioHints[HW2Config._scenarios[idx].id] || HW2Config._defaultHints; engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : HW2Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Help Desk Ticket first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['American Megatrends UEFI BIOS v2.20', 'Memory: 16384 MB', 'NVMe: WD SN750 500GB', 'Boot: NVMe0'], grubEntries: ['Windows 10 Pro'], loginUser: 'Technician' },
    desktop: { icons: [
        { id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' },
        { id: 'event_viewer', label: 'Event\nViewer', icon: 'EVT', app: 'event_viewer' },
        { id: 'hw_panel', label: 'Hardware\nPanel', icon: 'HW', app: 'hw_panel' },
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
        { id: 'hint1', text: 'Check Event Viewer for crash details.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'BSODs: drivers, RAM, heat, corruption, storage.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use SFC, DISM, WMIC, or Hardware Panel.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Flag appears after fixing the root cause.', cost: 50, penalty: -50 }
    ],
    lore: { intro: 'The blue screen of death is the most dreaded sight in Windows. Each BSOD has a specific stop code that points to the root cause. Your job is to decode the crash and fix it.', scenario: 'Five different BSOD causes — driver, memory, thermal, filesystem, and storage. Use the stop code, Event Viewer, and diagnostic tools to identify and resolve each one.', outro: 'System stabilized. The root cause of the BSOD has been identified and resolved.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read ticket and check Event Viewer.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the BSOD cause.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Apply the fix.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm stability.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        sfc: function(args, term, engine) {
            var g = HW2Config._requireScenario(engine); if (g) return g;
            var j = args.join(' ').toLowerCase(); var sc = HW2Config._getScenario(engine);
            if (j.includes('/scannow')) {
                if (sc && sc.id === 'corrupt_file' && engine.state._corruptFile) {
                    if (engine.state._dismRun) {
                        engine.state._corruptFile = false; engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save();
                        setTimeout(function() { engine.notify('SFC repaired corrupt system files. BSOD should be resolved. Check Event Viewer for the token.', 'success'); }, 400);
                        return '\nBeginning system scan...\n\nWindows Resource Protection found corrupt files and successfully repaired them.\nDetails in CBS.Log:\n  Repaired: C:\\Windows\\System32\\ntoskrnl.exe\n  Repaired: C:\\Windows\\System32\\drivers\\ntfs.sys\n  Repaired: C:\\Windows\\System32\\csrss.exe';
                    }
                    return '\nBeginning system scan...\n\nWindows Resource Protection found corrupt files but was unable to fix some of them.\nRun DISM /Online /Cleanup-Image /RestoreHealth first, then retry SFC.';
                }
                return '\nBeginning system scan...\n\nWindows Resource Protection did not find any integrity violations.';
            }
            return '\nUsage: sfc /scannow';
        },
        dism: function(args, term, engine) {
            var g = HW2Config._requireScenario(engine); if (g) return g;
            var j = args.join(' ').toLowerCase(); var sc = HW2Config._getScenario(engine);
            if (j.includes('restorehealth') || j.includes('restore-health')) {
                if (sc && sc.id === 'corrupt_file') { engine.state._dismRun = true; engine.save(); }
                return '\nDeployment Image Servicing and Management tool\n\n[==========================100.0%==========================]\nThe restore operation completed successfully.\nThe component store has been repaired.';
            }
            if (j.includes('checkhealth')) return '\nNo component store corruption detected.';
            return '\nUsage: DISM /Online /Cleanup-Image /RestoreHealth';
        },
        wmic: function(args, term, engine) {
            var g = HW2Config._requireScenario(engine); if (g) return g;
            var j = args.join(' ').toLowerCase(); var sc = HW2Config._getScenario(engine);
            if (j.includes('diskdrive') && j.includes('status')) {
                if (sc && sc.id === 'ssd_failing') return '\nDeviceID            Model                     Status\n\\\\.\\PHYSICALDRIVE0   WD SN750 500GB NVMe       Pred Fail\n\nWARNING: SMART Predictive Failure detected.\nReallocated Sectors: 847 (Critical)\nWear Leveling Count: 3% remaining\nMedia Errors: 23\nUnsafe Shutdowns: 12';
                return '\nDeviceID            Model                     Status\n\\\\.\\PHYSICALDRIVE0   WD SN750 500GB NVMe       OK';
            }
            if (j.includes('memorychip')) {
                if (sc && sc.id === 'ram_fail') return '\nBankLabel      Capacity    Speed    Manufacturer\nBank0/DIMM0    8589934592  3200     Samsung          [OK]\nBank1/DIMM1    8589934592  3200     Samsung          [ERRORS DETECTED]';
                return '\nBankLabel      Capacity    Speed    Manufacturer\nBank0/DIMM0    8589934592  3200     Samsung\nBank1/DIMM1    8589934592  3200     Samsung';
            }
            if (j.includes('temperature') || j.includes('cpu')) {
                if (sc && sc.id === 'cpu_overheat') return '\nCPU Temperature: 98 C  [CRITICAL - Throttling at 100 C]\nFan Speed: 4200 RPM (Max: 4500 RPM)\nThermal Paste Condition: Estimated 4+ years — likely dried/degraded';
                return '\nCPU Temperature: 42 C  [Normal]\nFan Speed: 1200 RPM';
            }
            return '\nUsage: wmic diskdrive get status\n       wmic memorychip get banklabel,capacity,speed\n       wmic cpu get temperature';
        },
        'get-eventlog': function(args, term, engine) {
            var g = HW2Config._requireScenario(engine); if (g) return g;
            var sc = HW2Config._getScenario(engine); if (!sc) return '\nNo events.';
            return '\nSystem Event Log — Critical/Error (Last 24 Hours)\n\nSource: BugCheck\nStop Code: ' + (engine.state._stopCode || 'UNKNOWN') + '\nTimestamp: March 29, 2026 — 02:47:33 AM\nDescription: The system has rebooted without cleanly shutting down first.\n' + (engine.state._faultModule ? 'Faulting Module: ' + engine.state._faultModule + '\n' : '') + (engine.state._badSlot ? 'Hardware Error: Memory in ' + engine.state._badSlot + '\n' : '') + (engine.state._cpuTemp ? 'CPU Temperature at crash: ' + engine.state._cpuTemp + '\n' : '');
        },
        whoami: function() { return 'HELPDESK01\\Technician'; },
        hostname: function() { return 'HELPDESK01'; },
        cls: function(a, t) { t.outputEl.innerHTML = ''; return null; },
        systeminfo: function() { return '\nHost Name: HELPDESK01\nOS: Windows 10 Pro 10.0.19045\nProcessor: Intel Core i5-11500\nTotal Physical Memory: 16,384 MB'; },
        dir: function() { return ' Directory of C:\\Users\\Technician\n  0 File(s)'; },
        ifconfig: function() { return '\'ifconfig\' is not recognized.'; },
        sudo: function() { return '\'sudo\' is not recognized.'; }
    },

    onAppLaunch(iconDef, engine) {
        if (['event_viewer', 'hw_panel'].includes(iconDef.app) && !engine.state._scenarioSelected) { engine.notify('Open the Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': HW2Config._openTicket(iconDef, engine); break;
            case 'event_viewer': HW2Config._openEventViewer(iconDef, engine); break;
            case 'hw_panel': HW2Config._openHWPanel(iconDef, engine); break;
            case 'reset_lab': HW2Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        HW2Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) HW2Config._renderTicket(engine, c); else HW2Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var pv = ['Dev Team — "BSOD after GPU driver update"', 'Accounting — "MEMORY_MANAGEMENT crashes daily"', 'Engineering — "Crashes under heavy CPU load"', 'Admin — "Random CRITICAL_PROCESS_DIED since outage"', 'Design — "WHEA error and getting slower"'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#ef4444; font-weight:bold; font-size:1.1rem;">HELP DESK QUEUE</div></div><div>';
        HW2Config._scenarios.forEach(function(s, i) { html += '<button class="hw2-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><span style="color:#ef4444; font-weight:bold;">HW-' + (2000 + i) + '</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + pv[i] + '</div></button>'; });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="hw2Rand" style="padding:10px 28px; background:#ef4444; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.hw2-btn').forEach(function(b) { b.addEventListener('click', function() { HW2Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); HW2Config._renderTicket(engine, container); }); });
        document.getElementById('hw2Rand').addEventListener('click', function() { HW2Config._applyScenario(engine, Math.floor(Math.random() * 5)); HW2Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var sc = HW2Config._getScenario(engine);
        var subs = ['Tyler Park — Dev Team', 'Maria Santos — Accounting', 'James Wright — Engineering', 'Lisa Chang — Administration', 'Carlos Rivera — Design'];
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><span style="color:#ef4444; font-weight:bold;">TICKET #HW-' + (2000 + engine.state._scenarioId) + '</span></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">FROM</div><div>' + subs[engine.state._scenarioId] + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">STOP CODE</div><div style="color:#ef4444; font-weight:bold; font-size:1rem;">' + (engine.state._stopCode || 'Unknown') + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + HW2Config._escHtml(sc.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:4px; line-height:1.6;">' + HW2Config._escHtml(sc.ticketDetail) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); padding:12px; border-radius:4px; color:#fca5a5;">' + HW2Config._escHtml(sc.ticketExtra) + '</div></div>'
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px; color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div>';
    },

    _openEventViewer(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Event Viewer', 'EVT', c);
        var sc = HW2Config._getScenario(engine);
        c.innerHTML = '<div style="font-weight:bold; color:#ef4444; margin-bottom:16px;">Event Viewer — System Critical Events</div>'
            + '<div style="padding:12px; background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.25); border-radius:4px; margin-bottom:8px;"><div style="color:#ef4444; font-weight:bold;">BugCheck</div><div style="color:#aaa; font-size:0.75rem;">Stop Code: ' + (engine.state._stopCode || 'N/A') + '</div><div style="color:#888; font-size:0.7rem;">March 29, 2026 02:47:33 AM</div>' + (engine.state._faultModule ? '<div style="color:#fca5a5; font-size:0.75rem;">Faulting Module: ' + engine.state._faultModule + '</div>' : '') + '</div>'
            + '<div style="padding:12px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:4px; margin-bottom:8px;"><div style="color:#f39c12;">Warning</div><div style="color:#aaa; font-size:0.75rem;">Kernel-Power: System rebooted without clean shutdown</div></div>'
            + (engine.state._flagRevealed ? '<div style="margin-top:16px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;"><div style="color:#2ecc71; font-weight:bold;">BSOD Resolved</div><div id="hw2-flag" style="margin-top:4px;">Token: loading...</div></div>' : '');
        if (engine.state._flagRevealed) { setTimeout(function() { BoxEngine.requestFlagText(sc.id).then(function(f) { var el = document.getElementById('hw2-flag'); if (el) el.textContent = 'Token: ' + (f || 'N/A'); }); }, 0); }
    },

    _openHWPanel(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); HW2Config._renderHWPanel(engine); return; }
        var c = document.createElement('div'); c.id = 'hwContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Hardware Diagnostics Panel', 'HW', c);
        HW2Config._renderHWPanel(engine);
    },

    _renderHWPanel(engine) {
        var c = document.getElementById('hwContainer'); if (!c) return;
        var sc = HW2Config._getScenario(engine);
        if (!sc) { c.innerHTML = '<div style="color:#888;">No active scenario.</div>'; return; }
        var html = '<div style="font-size:1rem; font-weight:bold; color:#ef4444; margin-bottom:16px;">Hardware Diagnostics — Dell OptiPlex 5090</div>';

        var comps = [];
        if (sc.id === 'driver_conflict') {
            comps.push({ name: 'GPU Driver', desc: engine.state._driverConflict ? 'ALERT: NVIDIA driver v537.58 (user-installed) is causing kernel-mode conflicts. Previous stable driver: v535.98 (IT-approved). nvlddmkm.sys is crashing in kernel space.' : 'Driver rolled back to v535.98. No kernel conflicts detected.', issue: engine.state._driverConflict, fixId: 'rollback_driver', action: 'Roll Back to v535.98' });
            comps.push({ name: 'CPU', desc: 'Intel Core i5-11500 — Normal temperature, no errors.', issue: false });
        } else if (sc.id === 'ram_fail') {
            comps.push({ name: 'Memory — DIMM A (Slot 0)', desc: 'Samsung 8GB DDR4-3200 — PASSED. No errors in 47 test passes.', issue: false });
            comps.push({ name: 'Memory — DIMM B (Slot 1)', desc: engine.state._ramFail ? 'ALERT: Samsung 8GB DDR4-3200 — FAILED. 2,847 errors detected in memtest pass #3. Errors concentrated in address range 0x4000000-0x7FFFFFF. This DIMM must be replaced.' : 'DIMM B replaced. New module PASSED all memtest passes.', issue: engine.state._ramFail, fixId: 'replace_ram', action: 'Replace DIMM B' });
        } else if (sc.id === 'cpu_overheat') {
            comps.push({ name: 'CPU Temperature', desc: engine.state._cpuOverheat ? 'ALERT: CPU at 98C under load (throttle threshold: 100C). Fan at max RPM (4200/4500). Heatsink has dust buildup. Thermal paste is dried and cracked after 4 years.' : 'CPU at 52C under load. Thermal paste reapplied. Fan running normally.', issue: engine.state._cpuOverheat, fixId: 'thermal_fix', action: 'Clean Heatsink & Reapply Thermal Paste' });
            comps.push({ name: 'Storage', desc: 'WD SN750 500GB — SMART: OK', issue: false });
        } else if (sc.id === 'corrupt_file') {
            comps.push({ name: 'System Files', desc: engine.state._corruptFile ? 'ALERT: System file integrity check shows corruption. Power outage may have interrupted writes. Run DISM /RestoreHealth then SFC /scannow from Command Prompt.' : 'System files repaired by DISM and SFC. No corruption detected.', issue: engine.state._corruptFile });
            comps.push({ name: 'Storage', desc: 'WD SN750 — SMART: OK. Physical drive is healthy.', issue: false });
        } else if (sc.id === 'ssd_failing') {
            comps.push({ name: 'SSD — WD SN750 500GB', desc: engine.state._ssdFailing ? 'CRITICAL: SMART Predictive Failure.\n  Reallocated Sectors: 847 (threshold: 100)\n  Wear Leveling: 3% remaining\n  Media Errors: 23\n  Unsafe Shutdowns: 12\n  Status: END OF LIFE — Replace immediately. Back up all data first.' : 'New SSD installed. SMART: OK. All attributes normal.', issue: engine.state._ssdFailing, fixId: 'replace_ssd', action: 'Back Up Data & Replace SSD' });
            comps.push({ name: 'Memory', desc: '16 GB DDR4 — No errors.', issue: false });
        }

        comps.forEach(function(comp) {
            html += '<div style="margin-bottom:12px; padding:12px; background:' + (comp.issue ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (comp.issue ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.06)') + '; border-radius:4px;"><div style="font-weight:bold; color:' + (comp.issue ? '#ef4444' : '#2ecc71') + ';">' + comp.name + '</div><div style="color:#aaa; font-size:0.75rem; margin:4px 0 8px; white-space:pre-wrap;">' + comp.desc + '</div>';
            if (comp.action && comp.issue) html += '<button class="hw-fix" data-fix="' + comp.fixId + '" style="padding:6px 16px; background:#ef4444; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.75rem; font-weight:bold;">' + comp.action + '</button>';
            html += '</div>';
        });

        if (engine.state._flagRevealed) {
            var labels = { driver_conflict: 'GPU driver rolled back. BSOD resolved.', ram_fail: 'DIMM B replaced. Memory errors eliminated.', cpu_overheat: 'Thermal paste reapplied. CPU temp normal.', corrupt_file: 'System files repaired via DISM/SFC.', ssd_failing: 'SSD replaced. SMART: OK.' };
            var fid = 'hw2-flag-' + sc.id;
            html += '<div style="margin-top:16px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;"><div style="color:#2ecc71; font-weight:bold;">Fix Confirmed:</div><div>' + labels[sc.id] + '</div><div id="' + fid + '" style="margin-top:4px;">Token: loading...</div></div>';
            setTimeout(function() { BoxEngine.requestFlagText(sc.id).then(function(f) { var el = document.getElementById(fid); if (el) el.textContent = 'Token: ' + (f || 'N/A'); }); }, 0);
        }
        c.innerHTML = html;
        c.querySelectorAll('.hw-fix').forEach(function(b) { b.addEventListener('click', function() { HW2Config._applyFix(engine, this.getAttribute('data-fix')); }); });
    },

    _applyFix(engine, fixId) {
        var sc = HW2Config._getScenario(engine); if (!sc) return; var fixed = false;
        if (fixId === 'rollback_driver') { engine.state._driverConflict = false; fixed = true; }
        if (fixId === 'replace_ram') { engine.state._ramFail = false; fixed = true; }
        if (fixId === 'thermal_fix') { engine.state._cpuOverheat = false; fixed = true; }
        if (fixId === 'replace_ssd') { engine.state._ssdFailing = false; fixed = true; }
        if (fixed) { engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save(); engine.notify('Hardware fix applied. BSOD cause eliminated. Check Hardware Panel for token.', 'success'); HW2Config._renderHWPanel(engine); }
    },

    _confirmReset(engine) {
        var o = document.createElement('div'); o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9;"><div style="color:#ef4444; font-weight:bold; margin-bottom:12px;">Reset Lab?</div><div style="display:flex; gap:12px; justify-content:center;"><button id="hw2RC" style="padding:8px 24px; background:#ef4444; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="hw2CC" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('hw2RC').addEventListener('click', function() { HW2Config._flagRestored = false; HW2Config.hints = HW2Config._defaultHints; engine.reset(); });
        document.getElementById('hw2CC').addEventListener('click', function() { o.remove(); });
        o.addEventListener('click', function(e) { if (e.target === o) o.remove(); });
    }
};
