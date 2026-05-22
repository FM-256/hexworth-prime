/* ============================================================
   DISPATCH LAB — Box SRV004: Disk Space Emergency
   Server Troubleshooting — Disk full, logs, temp, SQL log, shadow copies, recycle bin
   ============================================================ */

var SRV004Config = {

    title: 'Disk Space Emergency',
    subtitle: 'C:\\ Is 99% Full — Server Troubleshooting',
    difficulty: 'Intermediate',
    accent: '#6366f1',
    storageKey: 'hexworth_lab_srv004',
    registryId: 'srv004-disk-space',
    trackerKey: 'lab_srv004',
    tutorialMode: true,

    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the disk space alert.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check disk usage', tip: 'Use dir, wmic, or Disk Management to see what is consuming space.', trigger: { event: 'command', match: { cmd: 'contains:dir' }, alt: [{ event: 'command', match: { cmd: 'contains:wmic' } }, { event: 'window_open', match: { type: 'disk_mgmt' } }] } },
            { title: 'Find the culprit', tip: 'Identify which files or feature is consuming the most space.', trigger: { event: 'command', match: { cmd: 'contains:size' }, alt: [{ event: 'command', match: { cmd: 'contains:vssadmin' } }, { event: 'command', match: { cmd: 'contains:cleanmgr' } }] } },
            { title: 'Free the space', tip: 'Delete logs, clean temp files, shrink SQL logs, delete shadow copies, or empty the recycle bin.', trigger: { event: 'command', match: { cmd: 'contains:del' }, alt: [{ event: 'command', match: { cmd: 'contains:shrink' } }, { event: 'command', match: { cmd: 'contains:clean' } }] } },
            { title: 'Capture the flag', tip: 'After freeing space, the recovery token appears.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: { certPath: 'Network+', mappings: [{ flagId: 'fixed', objective: '5.5', description: 'Troubleshoot general networking issues', skill: 'Disk Space Management' }] },

    _servers: [{ name: 'APP-PROD-02', ip: '10.0.1.30', os: 'Windows Server 2022', role: 'Application/Web Server' }],

    _scenarios: [
        {
            id: 'iis_logs',
            name: 'IIS Log Files Filling C:\\',
            ticketSubject: 'C:\\ drive at 99% — server performance degrading rapidly',
            ticketDetail: 'The APP-PROD-02 server C: drive is at 99% capacity. IIS has been writing log files to C:\\inetpub\\logs\\LogFiles for 18 months without log rotation configured. The log directory contains over 50GB of .log files. Services are failing to start due to insufficient disk space.',
            ticketExtra: 'Ops Note: IIS logging was configured with default settings during initial server setup. No log rotation policy was ever applied. The server handles high traffic — approximately 2 million requests per day, generating ~100MB of logs daily.',
            affectedServer: 0, fixDescription: 'Delete old IIS logs and configure log rotation',
            stateOverrides: { _diskIssue: 'iis_logs', _spaceFreed: false }
        },
        {
            id: 'temp_files',
            name: 'Temp Files Not Cleaned',
            ticketSubject: 'C:\\ at 98% — Windows Update cache and temp files consuming 40GB',
            ticketDetail: 'Disk space alert triggered on APP-PROD-02. Investigation shows C:\\Windows\\Temp has 15GB of orphaned temp files and C:\\Windows\\SoftwareDistribution\\Download has 25GB of cached Windows Update files. Nobody has run disk cleanup on this server since it was provisioned 2 years ago.',
            ticketExtra: 'Ops Note: This server was deployed with a 100GB C: partition. No automated cleanup tasks were configured. Windows Update downloads have accumulated over 24 months of updates.',
            affectedServer: 0, fixDescription: 'Clean Windows Update cache and temp files',
            stateOverrides: { _diskIssue: 'temp_files', _spaceFreed: false }
        },
        {
            id: 'sql_log',
            name: 'SQL Transaction Log Unbounded',
            ticketSubject: 'C:\\ full — SQL Server transaction log is 75GB and growing',
            ticketDetail: 'The SQL Server transaction log file (HRData_log.ldf) on C:\\ has grown to 75GB. The database is in Full recovery mode but no transaction log backups have ever been configured. The log file has been growing continuously since the database was created 6 months ago, and it cannot truncate without a log backup.',
            ticketExtra: 'DBA Note: The database was set to Full recovery mode for point-in-time recovery capability, but the corresponding log backup job was never created. Without log backups, the transaction log can never be truncated and will grow until the disk is full.',
            affectedServer: 0, fixDescription: 'Take a transaction log backup and shrink the log file',
            stateOverrides: { _diskIssue: 'sql_log', _spaceFreed: false }
        },
        {
            id: 'shadow_copies',
            name: 'Shadow Copies Consuming 50% of Volume',
            ticketSubject: 'C:\\ at 97% — shadow copies using 50GB of a 100GB volume',
            ticketDetail: 'Volume Shadow Copies on C:\\ are consuming 50GB out of a 100GB volume. The shadow copy storage limit was set to "No Limit" and has been accumulating snapshots for 12 months. While shadow copies are useful for file recovery, the unbounded growth is now threatening server stability.',
            ticketExtra: 'Ops Note: Shadow copies were enabled during initial configuration with no maximum size limit. The server creates a shadow copy every day. 365 shadow copies now exist, consuming half the volume.',
            affectedServer: 0, fixDescription: 'Delete old shadow copies and set a storage limit',
            stateOverrides: { _diskIssue: 'shadow_copies', _spaceFreed: false }
        },
        {
            id: 'recycle_bin',
            name: 'Recycle Bin Holding 200GB',
            ticketSubject: 'D:\\ data drive at 95% — Recycle Bin contains 200GB of deleted files',
            ticketDetail: 'An admin deleted a large folder of archived project files last month but never emptied the Recycle Bin. The D:\\ data drive shows 200GB in the Recycle Bin (C:\\$Recycle.Bin). The admin thought deleting files frees the space immediately. Users are unable to save new files to the data share.',
            ticketExtra: 'Ops Note: The Recycle Bin on server volumes can grow very large. Unlike workstations, server admins often delete large datasets and forget to empty the bin. The 200GB consists of a single folder of archived video files that was "deleted" on March 1st.',
            affectedServer: 0, fixDescription: 'Empty the Recycle Bin to reclaim 200GB',
            stateOverrides: { _diskIssue: 'recycle_bin', _spaceFreed: false }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Check which files or folders are consuming the most space.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use "dir /s /o-s" to find the largest directories on the drive.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Common culprits: log files, temp files, SQL logs, shadow copies, recycle bin.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after you free enough space.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        iis_logs: [
            { id: 'hint1', text: 'Check C:\\inetpub\\logs\\LogFiles — IIS logs may have accumulated without rotation.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The LogFiles directory contains 50GB of .log files dating back 18 months.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Delete logs older than 30 days: forfiles /p C:\\inetpub\\logs\\LogFiles /d -30 /c "cmd /c del @file"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Full fix: Delete old logs, then configure IIS log rotation in IIS Manager or via PowerShell.', cost: 150, penalty: -150 }
        ],
        temp_files: [
            { id: 'hint1', text: 'Check C:\\Windows\\Temp and C:\\Windows\\SoftwareDistribution\\Download for accumulated files.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Temp has 15GB, SoftwareDistribution\\Download has 25GB — 40GB total of cleanup candidates.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Run "cleanmgr /d C:" or manually delete: del C:\\Windows\\Temp\\* and stop wuauserv then delete SoftwareDistribution\\Download\\*.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Fix: net stop wuauserv, del /q /s C:\\Windows\\SoftwareDistribution\\Download\\*, del /q C:\\Windows\\Temp\\*, net start wuauserv.', cost: 150, penalty: -150 }
        ],
        sql_log: [
            { id: 'hint1', text: 'A SQL Server transaction log can grow unbounded if no log backups are configured.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The HRData_log.ldf file is 75GB. The database is in Full recovery mode with no log backups.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Take a log backup first: BACKUP LOG HRData TO DISK, then DBCC SHRINKFILE to shrink the log.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Fix: sqlcmd -Q "BACKUP LOG HRData TO DISK=\'C:\\Temp\\HRData_log.trn\'", then sqlcmd -Q "DBCC SHRINKFILE(HRData_log, 1024)". Schedule regular log backups.', cost: 150, penalty: -150 }
        ],
        shadow_copies: [
            { id: 'hint1', text: 'Shadow copies can consume enormous space if no limit is set. Check vssadmin list shadowstorage.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Shadow copies are using 50GB on C:\\ with no size limit. 365 snapshots exist.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Delete old shadows: vssadmin delete shadows /for=C: /oldest. Set a limit: vssadmin resize shadowstorage /for=C: /maxsize=10GB.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Fix: vssadmin delete shadows /for=C: /all, then vssadmin resize shadowstorage /for=C: /maxsize=10GB to prevent recurrence.', cost: 150, penalty: -150 }
        ],
        recycle_bin: [
            { id: 'hint1', text: 'Deleted files go to the Recycle Bin and still consume disk space until emptied.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The Recycle Bin holds 200GB of archived video files deleted on March 1st.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Empty the Recycle Bin: rd /s /q C:\\$Recycle.Bin or use Clear-RecycleBin in PowerShell.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Fix: rd /s /q C:\\$Recycle.Bin (or PowerShell: Clear-RecycleBin -Force). 200GB will be reclaimed.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !SRV004Config._flagRestored) {
            SRV004Config._flagRestored = true;
            var s = SRV004Config._scenarios[engine.state._scenarioId];
            if (s) SRV004Config.hints = SRV004Config._scenarioHints[s.id] || SRV004Config._defaultHints;
        }
        return true;
    },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        engine.state._diskIssue = null; engine.state._spaceFreed = false;
        engine.state._labComplete = false; engine.state._flagRevealed = false;
        var overrides = SRV004Config._scenarios[idx].stateOverrides || {};
        for (var k in overrides) engine.state[k] = overrides[k];
        SRV004Config._flagRestored = true;
        SRV004Config.hints = SRV004Config._scenarioHints[SRV004Config._scenarios[idx].id] || SRV004Config._defaultHints;
        engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : SRV004Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Help Desk Ticket first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['Dell PowerEdge R640 UEFI BIOS', 'Memory Test: 32768 MB OK', 'Boot device: Virtual Disk 0', 'Loading Windows Server 2022...'], grubEntries: ['Windows Server 2022'], loginUser: 'Administrator' },
    desktop: {
        icons: [
            { id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' },
            { id: 'disk_mgmt', label: 'Disk\nManagement', icon: 'DSK', app: 'disk_mgmt' },
            { id: 'event_viewer', label: 'Event\nViewer', icon: 'EVT', app: 'event_viewer' },
            { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' },
            { id: 'hints', label: 'Hints', icon: '?', app: 'hints' },
            { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }
        ]
    },
    terminal: { user: 'Administrator', hostname: 'APP-PROD-02', startDir: 'C:\\Users\\Administrator', promptStyle: 'windows', welcome: 'Microsoft Windows [Version 10.0.20348.2340]\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [{ id: 'hint1', text: 'Check what is consuming disk space.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'Use dir, wmic, or cleanmgr to investigate.', cost: 10, penalty: -10 }, { id: 'hint3', text: 'Common culprits: logs, temp, SQL logs, shadow copies, recycle bin.', cost: 25, penalty: -25 }, { id: 'hint4', text: 'Flag appears after freeing space.', cost: 50, penalty: -50 }],
    lore: { intro: 'A server at 99% disk capacity is on the edge of catastrophe. Services will crash, databases will corrupt, and users will riot.', scenario: 'Each scenario has a different disk space hog. Find it and eliminate it.', outro: 'Disk space reclaimed. Server is breathing again.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Check disk usage.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Find what is consuming space.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Free the disk space.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm space is freed.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        wmic: function(args, term, engine) {
            var gate = SRV004Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            if (joined.includes('logicaldisk') || joined.includes('disk')) {
                var cFree = engine.state._spaceFreed ? '42,000 MB' : '1,200 MB';
                return '\nDeviceID  Size          FreeSpace     VolumeName\nC:        100,000 MB    ' + cFree + '         System\nD:        500,000 MB    ' + (engine.state._diskIssue === 'recycle_bin' && !engine.state._spaceFreed ? '25,000 MB' : '225,000 MB') + '    Data';
            }
            return '\nUsage: wmic logicaldisk get DeviceID,Size,FreeSpace';
        },

        dir: function(args, term, engine) {
            var gate = SRV004Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = SRV004Config._getScenario(engine);
            if (joined.includes('inetpub') || joined.includes('logfiles')) {
                if (scenario && scenario.id === 'iis_logs' && !engine.state._spaceFreed) return '\n Directory of C:\\inetpub\\logs\\LogFiles\n\n547 File(s)     52,428,800,000 bytes (50 GB)\n\nOldest file: u_ex240930.log (9/30/2024)\nNewest file: u_ex260329.log (3/29/2026)';
                return '\n Directory of C:\\inetpub\\logs\\LogFiles\n\n30 File(s)     3,145,728,000 bytes (3 GB)';
            }
            if (joined.includes('temp')) {
                if (scenario && scenario.id === 'temp_files' && !engine.state._spaceFreed) return '\n Directory of C:\\Windows\\Temp\n\n12,847 File(s)     15,728,640,000 bytes (15 GB)\n\n Directory of C:\\Windows\\SoftwareDistribution\\Download\n\n2,341 File(s)     26,843,545,600 bytes (25 GB)\n\nTotal: ~40 GB of cleanable files';
                return '\n Directory of C:\\Windows\\Temp\n\n23 File(s)     12,582,912 bytes (12 MB)';
            }
            return ' Volume in drive C has no label.\n\n Directory of C:\\Users\\Administrator\n\n03/30/2026  06:00 AM    <DIR>          Desktop\n03/30/2026  06:00 AM    <DIR>          Documents\n               0 File(s)              0 bytes';
        },

        del: function(args, term, engine) {
            var gate = SRV004Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = SRV004Config._getScenario(engine);

            if (scenario && scenario.id === 'iis_logs' && (joined.includes('inetpub') || joined.includes('log'))) {
                engine.state._spaceFreed = true; engine.save();
                if (!engine.state._flagRevealed) { engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save(); setTimeout(function() { engine.notify('IIS logs cleaned. 47 GB freed. Check Disk Management for the recovery token.', 'success'); }, 400); }
                return '\nDeleted 517 log files older than 30 days.\nFreed 47 GB on C:\\.';
            }
            if (scenario && scenario.id === 'temp_files' && (joined.includes('temp') || joined.includes('softwaredistribution'))) {
                engine.state._spaceFreed = true; engine.save();
                if (!engine.state._flagRevealed) { engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save(); setTimeout(function() { engine.notify('Temp files cleaned. 40 GB freed. Check Disk Management for the recovery token.', 'success'); }, 400); }
                return '\nDeleted temp files and Windows Update cache.\nFreed 40 GB on C:\\.';
            }
            return '\nFile(s) deleted.';
        },

        forfiles: function(args, term, engine) {
            var gate = SRV004Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = SRV004Config._getScenario(engine);
            if (scenario && scenario.id === 'iis_logs' && joined.includes('inetpub')) {
                engine.state._spaceFreed = true; engine.save();
                if (!engine.state._flagRevealed) { engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save(); setTimeout(function() { engine.notify('Old IIS logs deleted. 47 GB freed.', 'success'); }, 400); }
                return '\nDeleted 517 files older than 30 days. Freed 47 GB.';
            }
            return '\nUsage: forfiles /p <path> /d -<days> /c "cmd /c del @file"';
        },

        cleanmgr: function(args, term, engine) {
            var gate = SRV004Config._requireScenario(engine); if (gate) return gate;
            var scenario = SRV004Config._getScenario(engine);
            if (scenario && scenario.id === 'temp_files') {
                engine.state._spaceFreed = true; engine.save();
                if (!engine.state._flagRevealed) { engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save(); setTimeout(function() { engine.notify('Disk Cleanup complete. 40 GB freed.', 'success'); }, 400); }
                return '\nDisk Cleanup for C:\\\n\nWindows Update Cleanup:    25.0 GB\nTemporary files:           15.0 GB\n\nTotal freed: 40.0 GB';
            }
            return '\nDisk Cleanup complete. No significant space to reclaim.';
        },

        sqlcmd: function(args, term, engine) {
            var gate = SRV004Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = SRV004Config._getScenario(engine);

            if (scenario && scenario.id === 'sql_log') {
                if (joined.includes('backup log') || joined.includes('backup')) {
                    return '\nProcessed 524288 pages for database \'HRData\', file \'HRData_log\' on backup device.\nBACKUP LOG successfully processed.';
                }
                if (joined.includes('shrinkfile') || joined.includes('shrink')) {
                    engine.state._spaceFreed = true; engine.save();
                    if (!engine.state._flagRevealed) { engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save(); setTimeout(function() { engine.notify('Transaction log shrunk from 75 GB to 1 GB. Space reclaimed.', 'success'); }, 400); }
                    return '\nDbId   FileId      CurrentSize  MinimumSize  UsedPages    EstimatedPages\n------ ----------- ------------ ------------ ------------ ----------\n5      2           131072       131072       128          128\n\nDBCC SHRINKFILE: HRData_log shrunk from 75 GB to 1 GB.\n74 GB freed.';
                }
            }
            return '\nUsage: sqlcmd -Q "BACKUP LOG dbname TO DISK=\'path\'"\n       sqlcmd -Q "DBCC SHRINKFILE(logname, target_size_mb)"';
        },

        vssadmin: function(args, term, engine) {
            var gate = SRV004Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = SRV004Config._getScenario(engine);

            if (joined.includes('list') && joined.includes('shadowstorage')) {
                var used = scenario && scenario.id === 'shadow_copies' && !engine.state._spaceFreed ? '50 GB' : '2 GB';
                var max = engine.state._spaceFreed ? '10 GB' : 'UNBOUNDED';
                return '\nShadow Copy Storage association\n   For volume: (C:)\\\\\n   Shadow Copy Storage volume: (C:)\\\\\n   Used Shadow Copy Storage space: ' + used + '\n   Maximum Shadow Copy Storage space: ' + max;
            }
            if (joined.includes('delete') && joined.includes('shadows')) {
                if (scenario && scenario.id === 'shadow_copies') {
                    engine.state._spaceFreed = true; engine.save();
                    if (!engine.state._flagRevealed) { engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save(); setTimeout(function() { engine.notify('Shadow copies deleted. 48 GB freed.', 'success'); }, 400); }
                    return '\nSuccessfully deleted 365 shadow copies.\nFreed 48 GB on volume C:\\.';
                }
                return '\nNo shadow copies found to delete.';
            }
            if (joined.includes('resize')) {
                return '\nSuccessfully resized the shadow copy storage association.\nMaximum size set to 10 GB.';
            }
            return '\nUsage: vssadmin list shadowstorage\n       vssadmin delete shadows /for=C: /all\n       vssadmin resize shadowstorage /for=C: /maxsize=10GB';
        },

        rd: function(args, term, engine) {
            var gate = SRV004Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = SRV004Config._getScenario(engine);
            if (scenario && scenario.id === 'recycle_bin' && joined.includes('recycle')) {
                engine.state._spaceFreed = true; engine.save();
                if (!engine.state._flagRevealed) { engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save(); setTimeout(function() { engine.notify('Recycle Bin emptied. 200 GB reclaimed.', 'success'); }, 400); }
                return '\nC:\\$Recycle.Bin - removed.\n200 GB reclaimed on D:\\.';
            }
            return '\nUsage: rd /s /q C:\\$Recycle.Bin';
        },

        ping: function(args, term, engine) { var gate = SRV004Config._requireScenario(engine); if (gate) return gate; return '\nReply from 10.0.1.30: bytes=32 time<1ms TTL=128\nPackets: Sent = 4, Received = 4, Lost = 0'; },
        whoami: function() { return 'APP-PROD-02\\Administrator'; },
        hostname: function() { return 'APP-PROD-02'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        ipconfig: function() { return '\nIPv4 Address: 10.0.1.30\nSubnet Mask: 255.255.255.0\nDefault Gateway: 10.0.1.1'; },
        sudo: function() { return '\'sudo\' is not recognized.'; },
        grep: function() { return '\'grep\' is not recognized.'; }
    },

    onAppLaunch(iconDef, engine) {
        var req = ['disk_mgmt', 'event_viewer'];
        if (req.includes(iconDef.app) && !engine.state._scenarioSelected) { engine.notify('Open the Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': SRV004Config._openTicket(iconDef, engine); break;
            case 'disk_mgmt': SRV004Config._openDiskMgmt(iconDef, engine); break;
            case 'event_viewer': SRV004Config._openEventViewer(iconDef, engine); break;
            case 'reset_lab': SRV004Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        SRV004Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) SRV004Config._renderTicket(engine, c);
        else SRV004Config._renderScenarioPicker(engine, c);
    },

    _renderScenarioPicker(engine, container) {
        var previews = ['Monitoring — "C:\\ at 99% — IIS logs consuming 50GB"', 'Ops — "C:\\ at 98% — temp files and WU cache consuming 40GB"', 'DBA — "C:\\ full — SQL transaction log at 75GB"', 'Ops — "C:\\ at 97% — shadow copies using 50GB"', 'Admin — "D:\\ at 95% — Recycle Bin holding 200GB"'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#6366f1; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">INCIDENT QUEUE</div></div><div>';
        SRV004Config._scenarios.forEach(function(s, i) {
            html += '<button class="srv004-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><div style="display:flex; justify-content:space-between;"><span style="color:#6366f1; font-weight:bold;">INC-' + (8001 + i) + '</span><span style="background:#e74c3c; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">SEV-1</span></div><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>';
        });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="srv004RandBtn" style="padding:10px 28px; background:#6366f1; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.srv004-btn').forEach(function(b) { b.addEventListener('click', function() { SRV004Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); SRV004Config._renderTicket(engine, container); }); });
        document.getElementById('srv004RandBtn').addEventListener('click', function() { SRV004Config._applyScenario(engine, Math.floor(Math.random() * 5)); SRV004Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var s = SRV004Config._getScenario(engine);
        var names = ['Monitoring Alert', 'Ben Harper — IT Operations', 'Kenji Watanabe — DBA', 'Lisa Tran — IT Operations', 'Marcus Webb — Systems Admin'];
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><div style="display:flex; justify-content:space-between;"><span style="color:#6366f1; font-weight:bold;">INCIDENT #INC-' + (8001 + engine.state._scenarioId) + '</span><span style="background:#e74c3c; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem;">SEV-1</span></div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">REPORTED BY</div><div>' + names[engine.state._scenarioId] + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + SRV004Config._escHtml(s.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + SRV004Config._escHtml(s.ticketDetail) + '</div></div>'
            + (s.ticketExtra ? '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(99,102,241,0.08); border:1px solid rgba(99,102,241,0.2); border-radius:4px; padding:12px; color:#a5b4fc;">' + SRV004Config._escHtml(s.ticketExtra) + '</div></div>' : '')
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#888; font-size:0.7rem;">ASSIGNED TO</div><div style="color:#2ecc71; font-weight:bold;">YOU — Server Administrator</div></div>';
    },

    _openDiskMgmt(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); SRV004Config._renderDiskMgmt(engine); return; }
        var c = document.createElement('div'); c.id = 'diskContainer';
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Disk Management', 'DSK', c);
        SRV004Config._renderDiskMgmt(engine);
    },

    _renderDiskMgmt(engine) {
        var c = document.getElementById('diskContainer'); if (!c) return;
        var s = SRV004Config._getScenario(engine);
        var cFree = engine.state._spaceFreed ? '42 GB' : '1.2 GB';
        var cPct = engine.state._spaceFreed ? '58%' : '99%';
        var html = '<div style="font-size:1rem; font-weight:bold; color:#6366f1; margin-bottom:16px;">Disk Management</div>';
        html += '<div style="padding:12px; margin-bottom:8px; background:rgba(' + (engine.state._spaceFreed ? '46,204,113' : '231,76,60') + ',0.06); border:1px solid rgba(' + (engine.state._spaceFreed ? '46,204,113' : '231,76,60') + ',0.2); border-radius:4px;"><div style="font-weight:bold;">C:\\ (System)</div><div style="font-size:0.75rem; color:#888;">100 GB total &mdash; ' + cFree + ' free (' + cPct + ' used)</div><div style="margin-top:4px; height:8px; background:rgba(255,255,255,0.1); border-radius:4px;"><div style="height:100%; width:' + cPct + '; background:' + (engine.state._spaceFreed ? '#2ecc71' : '#e74c3c') + '; border-radius:4px;"></div></div></div>';
        html += '<div style="padding:12px; margin-bottom:8px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px;"><div style="font-weight:bold;">D:\\ (Data)</div><div style="font-size:0.75rem; color:#888;">500 GB total &mdash; ' + (s && s.id === 'recycle_bin' && !engine.state._spaceFreed ? '25 GB' : '225 GB') + ' free</div></div>';

        if (engine.state._flagRevealed && s) {
            html += '<div style="margin-top:16px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;"><div style="color:#2ecc71; font-weight:bold;">Issue Resolved:</div><div style="font-size:0.8rem;">' + s.fixDescription + '</div><div id="srv004-flag" style="font-size:0.8rem; margin-top:4px;">Recovery token: loading...</div></div>';
            setTimeout(function() { BoxEngine.requestFlagText(s.id).then(function(f) { var el = document.getElementById('srv004-flag'); if (el) el.textContent = 'Recovery token: ' + (f || 'Flag unavailable'); }); }, 0);
        }
        c.innerHTML = html;
    },

    _openEventViewer(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Event Viewer', 'EVT', c);
        c.innerHTML = '<div style="font-size:1rem; font-weight:bold; color:#6366f1; margin-bottom:16px;">Event Viewer</div><div style="padding:6px 8px; background:rgba(231,76,60,0.06); border:1px solid rgba(231,76,60,0.2); border-radius:3px;"><span style="color:#e74c3c; font-weight:bold;">Error</span> <span style="color:#888;">03/30/2026 05:45 AM</span> — srv — Low Disk Space: Drive C: has less than 2% free space remaining.</div>';
    },

    _confirmReset(engine) {
        var o = document.createElement('div');
        o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px 32px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9;"><div style="font-weight:bold; margin-bottom:12px; color:#e74c3c;">Reset Lab?</div><div style="display:flex; gap:12px; justify-content:center;"><button id="srv004RC" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="srv004CC" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('srv004RC').addEventListener('click', function() { SRV004Config._flagRestored = false; SRV004Config.hints = SRV004Config._defaultHints; engine.reset(); });
        document.getElementById('srv004CC').addEventListener('click', function() { o.remove(); });
        o.addEventListener('click', function(e) { if (e.target === o) o.remove(); });
    }
};
