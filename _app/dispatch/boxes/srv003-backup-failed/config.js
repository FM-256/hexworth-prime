/* ============================================================
   DISPATCH LAB — Box SRV003: Backup Failed
   Server Troubleshooting — Backup agent, storage, VSS, schedule
   5 distinct scenarios: agent not running, storage full,
   VSS writer error, schedule conflict, retention policy
   ============================================================ */

var SRV003Config = {

    title: 'Backup Failed',
    subtitle: 'Last Night\'s Backup Never Completed — Server Troubleshooting',
    difficulty: 'Intermediate',
    accent: '#6366f1',
    storageKey: 'hexworth_lab_srv003',
    registryId: 'srv003-backup-failed',
    trackerKey: 'lab_srv003',

    tutorialMode: true,

    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Double-click the Help Desk Ticket icon to read the backup failure report.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check the backup agent', tip: 'Verify whether the backup agent service is running and check recent backup job logs.', trigger: { event: 'command', match: { cmd: 'contains:backup' }, alt: [{ event: 'command', match: { cmd: 'contains:wbadmin' } }, { event: 'window_open', match: { type: 'backup_console' } }] } },
            { title: 'Investigate the root cause', tip: 'Check storage capacity, VSS writers, job schedules, or retention policies.', trigger: { event: 'command', match: { cmd: 'contains:vssadmin' } }, alt: [{ event: 'command', match: { cmd: 'contains:wmic' } }, { event: 'command', match: { cmd: 'contains:schtasks' } }] } },
            { title: 'Apply the fix', tip: 'Start the agent, free storage, fix VSS, resolve schedule conflicts, or adjust retention.', trigger: { event: 'command', match: { cmd: 'contains:start' }, alt: [{ event: 'command', match: { cmd: 'contains:delete' } }, { event: 'command', match: { cmd: 'contains:resize' } }] } },
            { title: 'Capture the flag', tip: 'After fixing the backup issue, the recovery token appears in the diagnostic tool.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'Network+',
        mappings: [
            { flagId: 'fixed', objective: '3.2', description: 'Explain the purpose of organizational documents and policies', skill: 'Backup and Recovery Management' },
            { flagId: 'fixed', objective: '5.5', description: 'Given a scenario, troubleshoot general networking issues', skill: 'Server Backup Troubleshooting' }
        ]
    },

    _servers: [
        { name: 'FILE-PROD-01', ip: '10.0.3.10', os: 'Windows Server 2022', role: 'File Server + Backup Target', service: 'Veeam Agent' }
    ],

    _scenarioFlags: { agent_stopped: null, storage_full: null, vss_error: null, schedule_conflict: null, retention_policy: null },

    _scenarios: [
        {
            id: 'agent_stopped',
            name: 'Backup Agent Not Running',
            ticketSubject: 'Nightly backup job did not execute — no backup since yesterday',
            ticketDetail: 'The nightly backup scheduled for 11:00 PM did not run at all. The backup management console shows "Missed" for last night\'s job. No backup has been created in 24 hours. All other scheduled tasks on the server ran normally — only the backup agent appears affected.',
            ticketExtra: 'IT Note: An antivirus update was pushed at 10:45 PM. The AV software may have quarantined or interfered with the backup agent service. The Veeam Agent service needs to be checked.',
            affectedServer: 0,
            fixDescription: 'Start the Veeam Agent service and verify the next scheduled backup runs',
            stateOverrides: { _backupAgentRunning: false }
        },
        {
            id: 'storage_full',
            name: 'Storage Target Full (NAS Out of Space)',
            ticketSubject: 'Backup failed with "insufficient storage" — NAS is full',
            ticketDetail: 'Last night\'s backup failed at 11:23 PM with error "The backup storage location does not have sufficient free space." The backup target is \\\\NAS-01\\Backups which is a 4TB volume. Previous backups have been filling it up and there is no automatic cleanup configured.',
            ticketExtra: 'Storage Note: NAS-01 volume \\Backups shows 3.98TB used out of 4.00TB. The oldest backups are from 6 months ago. Current retention should be 30 days but old backups were never cleaned up after the migration from the old backup system.',
            affectedServer: 0,
            fixDescription: 'Delete old backup files older than 30 days to free space on the NAS',
            stateOverrides: { _storageFullNas: true, _backupAgentRunning: true }
        },
        {
            id: 'vss_error',
            name: 'VSS Writer Error',
            ticketSubject: 'Backup completes with errors — "VSS writer failed to quiesce application"',
            ticketDetail: 'The backup job runs but completes with errors every night. The log shows "VSS Writer \'SQL Server Writer\' failed with error 0x800423f4 — the writer experienced a transient error. The application failed to quiesce I/O before the snapshot." The backup is incomplete and cannot be used for restore.',
            ticketExtra: 'DBA Note: The SQL Server VSS writer has been failing since a SQL Server cumulative update was applied last week. The VSS writer may need to be restarted by cycling the SQL VSS Writer service, or the SQL Server service itself may need a restart.',
            affectedServer: 0,
            fixDescription: 'Restart the SQL Server VSS Writer service to clear the transient error state',
            stateOverrides: { _vssWriterFailing: true, _backupAgentRunning: true }
        },
        {
            id: 'schedule_conflict',
            name: 'Schedule Conflict',
            ticketSubject: 'Backup and disk defrag running at same time — both fail',
            ticketDetail: 'The nightly backup has been failing intermittently for the past week. When it fails, the error says "Another process has locked the volume." Investigation shows the Windows Disk Optimization (defrag) scheduled task runs at 11:00 PM — the exact same time as the backup. When defrag grabs the volume lock first, the backup fails.',
            ticketExtra: 'Ops Note: The defrag task was added last week by a junior admin as part of a "performance optimization" initiative. It was scheduled at the default time without checking for conflicts with existing maintenance windows.',
            affectedServer: 0,
            fixDescription: 'Reschedule the defrag task to a non-conflicting window or disable it',
            stateOverrides: { _scheduleConflict: true, _backupAgentRunning: true }
        },
        {
            id: 'retention_policy',
            name: 'Retention Policy Deleting Backups Too Early',
            ticketSubject: 'Compliance audit failed — backups older than 7 days are missing',
            ticketDetail: 'The compliance team ran an audit and discovered that no backups older than 7 days exist. Company policy requires 90-day retention for all server backups. The backup jobs themselves are completing successfully every night, but the retention policy is configured to keep only 7 days of backups. Everything older is automatically deleted.',
            ticketExtra: 'Compliance Note: The backup retention was set to 7 days during the initial setup as a "temporary" configuration. It was never updated to match the 90-day compliance requirement. This is a regulatory finding that must be remediated immediately.',
            affectedServer: 0,
            fixDescription: 'Update the retention policy from 7 days to 90 days',
            stateOverrides: { _retentionTooShort: true, _backupAgentRunning: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Check if the backup agent service is running first.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use wbadmin or the backup console to check recent job status.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Check storage space, VSS writers, scheduled tasks, and retention settings.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after you fix the issue.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        agent_stopped: [
            { id: 'hint1', text: 'The backup job shows "Missed" — it never ran. Check if the backup agent service is running.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "sc query VeeamAgentSvc" — the service is Stopped. The AV update may have killed it.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Start the service: "net start VeeamAgentSvc" and verify it stays running.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Full fix: net start VeeamAgentSvc, then run a manual backup test with wbadmin to verify.', cost: 150, penalty: -150 }
        ],
        storage_full: [
            { id: 'hint1', text: 'The error says "insufficient storage." Check the backup target free space.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The NAS volume is 3.98TB/4.00TB used. Old backups from months ago were never cleaned up.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Delete backups older than 30 days. Use "wbadmin delete backup -keepVersions:30" or manually remove old files.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Fix: wbadmin delete backup -keepVersions:30 to prune old backups. Then verify free space and re-run the backup.', cost: 150, penalty: -150 }
        ],
        vss_error: [
            { id: 'hint1', text: 'The backup runs but completes with errors. VSS writer failure means the application did not quiesce I/O.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "vssadmin list writers" — the SQL Server Writer shows state "Failed" with error 0x800423f4.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Restart the SQL Server VSS Writer service: "net stop SQLWriter && net start SQLWriter".', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Fix: net stop SQLWriter, net start SQLWriter. Re-run vssadmin list writers to confirm it shows "Stable". Then re-run backup.', cost: 150, penalty: -150 }
        ],
        schedule_conflict: [
            { id: 'hint1', text: 'The backup fails intermittently with "volume locked." Something else is using the disk at the same time.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "schtasks /query" — the ScheduledDefrag task is set for 11:00 PM, same as the backup window.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Reschedule defrag to a different time: "schtasks /change /tn ScheduledDefrag /st 03:00".', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Fix: schtasks /change /tn "\\Microsoft\\Windows\\Defrag\\ScheduledDefrag" /st 03:00. Or disable it: schtasks /change /tn ... /disable.', cost: 150, penalty: -150 }
        ],
        retention_policy: [
            { id: 'hint1', text: 'Backups are running fine but only 7 days of history exists. The retention policy is wrong.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Check the backup configuration — retention is set to 7 days. Company policy requires 90 days.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Update the retention policy to 90 days in the backup configuration.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Fix: Update retention from 7 to 90 days in the backup console configuration. Note: previously deleted backups cannot be recovered.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !SRV003Config._flagRestored) {
            SRV003Config._flagRestored = true;
            var scenario = SRV003Config._scenarios[engine.state._scenarioId];
            if (scenario) SRV003Config.hints = SRV003Config._scenarioHints[scenario.id] || SRV003Config._defaultHints;
        }
        return true;
    },

    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._scenarioSelected = true;
        engine.state._backupAgentRunning = true;
        engine.state._storageFullNas = false;
        engine.state._vssWriterFailing = false;
        engine.state._scheduleConflict = false;
        engine.state._retentionTooShort = false;
        engine.state._labComplete = false;
        engine.state._flagRevealed = false;

        var overrides = SRV003Config._scenarios[idx].stateOverrides || {};
        for (var key in overrides) engine.state[key] = overrides[key];

        var scenario = SRV003Config._scenarios[idx];
        SRV003Config._flagRestored = true;
        SRV003Config.hints = SRV003Config._scenarioHints[scenario.id] || SRV003Config._defaultHints;
        engine.save();
    },

    _getScenario(engine) { return engine.state._scenarioId == null ? null : SRV003Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket assigned.\nOpen the Help Desk Ticket first to receive your assignment.'; },
    _escHtml(str) { var div = document.createElement('div'); div.textContent = str; return div.innerHTML; },

    boot: {
        biosLines: ['Dell PowerEdge R640 UEFI BIOS v2.14.1', 'Initializing hardware...', 'Memory Test: 32768 MB OK', 'Detecting drives... RAID-5: 4x 2TB SAS', 'Network: Broadcom BCM5720', 'Boot device: Virtual Disk 0', 'Loading Windows Server 2022...'],
        grubEntries: ['Windows Server 2022', 'Windows Recovery Environment'],
        loginUser: 'Administrator'
    },

    desktop: {
        icons: [
            { id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' },
            { id: 'backup_console', label: 'Backup\nConsole', icon: 'BKP', app: 'backup_console' },
            { id: 'event_viewer', label: 'Event\nViewer', icon: 'EVT', app: 'event_viewer' },
            { id: 'services', label: 'Services', icon: 'SVC', app: 'services' },
            { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' },
            { id: 'hints', label: 'Hints', icon: '?', app: 'hints' },
            { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }
        ]
    },

    terminal: { user: 'Administrator', hostname: 'FILE-PROD-01', startDir: 'C:\\Users\\Administrator', promptStyle: 'windows', welcome: 'Microsoft Windows [Version 10.0.20348.2340]\n(c) Microsoft Corporation. All rights reserved.\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Check the backup agent service status.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Review recent backup job logs.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Check storage, VSS, schedule, and retention.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after applying the fix.', cost: 50, penalty: -50 }
    ],
    lore: {
        intro: 'Backup failures are a ticking time bomb. If the backup system is broken and a real disaster strikes, the organization could lose everything. Diagnose and fix the backup failure before it becomes a catastrophe.',
        scenario: 'Each scenario represents a different backup failure mode. The agent, storage, VSS, schedule, and retention can all cause problems independently.',
        outro: 'Backup system restored. The next scheduled backup should complete successfully. Your troubleshooting protected the organization from potential data loss.'
    },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read the ticket and check backup agent status.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the root cause of the backup failure.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Fix the backup issue.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm backups will succeed and capture the flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        sc: function(args, term, engine) {
            var gate = SRV003Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            if (joined.includes('query') && (joined.includes('veeam') || joined.includes('backup'))) {
                var running = engine.state._backupAgentRunning;
                return '\nSERVICE_NAME: VeeamAgentSvc\n        TYPE               : 10  WIN32_OWN_PROCESS\n        STATE              : ' + (running ? '4  RUNNING' : '1  STOPPED') + '\n        WIN32_EXIT_CODE    : 0  (0x0)';
            }
            return '\nUsage: sc query <service_name>';
        },

        net: function(args, term, engine) {
            var gate = SRV003Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = SRV003Config._getScenario(engine);

            if (joined.includes('start') && (joined.includes('veeam') || joined.includes('backup'))) {
                if (engine.state._backupAgentRunning) return '\nThe requested service has already been started.';
                engine.state._backupAgentRunning = true;
                engine.save();
                if (scenario && scenario.id === 'agent_stopped' && !engine.state._flagRevealed) {
                    engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save();
                    setTimeout(function() { engine.notify('Backup agent started. Check Backup Console for the recovery token.', 'success'); }, 400);
                }
                return '\nThe Veeam Agent service was started successfully.';
            }
            if (joined.includes('stop') && joined.includes('sqlwriter')) {
                return '\nThe SQL Server VSS Writer service was stopped successfully.';
            }
            if (joined.includes('start') && joined.includes('sqlwriter')) {
                if (scenario && scenario.id === 'vss_error') {
                    engine.state._vssWriterFailing = false;
                    engine.save();
                    if (!engine.state._flagRevealed) {
                        engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save();
                        setTimeout(function() { engine.notify('SQL Writer restarted. VSS writer is now stable. Check Backup Console for the recovery token.', 'success'); }, 400);
                    }
                }
                return '\nThe SQL Server VSS Writer service was started successfully.';
            }
            return '\nUsage: net start <service>\n       net stop <service>';
        },

        vssadmin: function(args, term, engine) {
            var gate = SRV003Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();

            if (joined.includes('list') && joined.includes('writers')) {
                var sqlState = engine.state._vssWriterFailing ? 'Failed' : 'Stable';
                var sqlError = engine.state._vssWriterFailing ? '\n   Last error: Non-retryable error (0x800423f4)' : '';
                return '\nvssadmin 1.1 - Volume Shadow Copy Service administrative command-line tool\n\nWriter name: \'System Writer\'\n   Writer Id: {e8132975-6f93-4464-a53e-1050253ae220}\n   State: [1] Stable\n\nWriter name: \'SQL Server Writer\'\n   Writer Id: {a65faa63-5ea8-4ebc-9dbd-a0c4db26912a}\n   State: ' + (engine.state._vssWriterFailing ? '[8] Failed' : '[1] Stable') + sqlError + '\n\nWriter name: \'Registry Writer\'\n   Writer Id: {afbab4a2-367d-4d15-a586-71dbb18f8485}\n   State: [1] Stable';
            }

            if (joined.includes('list') && joined.includes('shadows')) {
                return '\nvssadmin 1.1 - Volume Shadow Copy Service\n\nContents of shadow copy set ID: {a1b2c3d4-...}\n   Contained 1 shadow copies at creation time: 3/29/2026 11:00:05 PM\n      Shadow Copy ID: {e5f6a7b8-...}\n         Original Volume: (C:)\\\\\n         Shadow Copy Volume: \\\\?\\GLOBALROOT\\Device\\HarddiskVolumeShadowCopy14';
            }

            return '\nUsage: vssadmin list writers\n       vssadmin list shadows\n       vssadmin list shadowstorage';
        },

        wbadmin: function(args, term, engine) {
            var gate = SRV003Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = SRV003Config._getScenario(engine);

            if (joined.includes('get') && joined.includes('status')) {
                if (!engine.state._backupAgentRunning) return '\nERROR - The backup service is not running. Start the Veeam Agent service.';
                if (engine.state._storageFullNas) return '\nBackup status:\n  Last backup: FAILED (3/29/2026 11:23 PM)\n  Error: The backup storage location \\\\NAS-01\\Backups does not have sufficient free space.\n  Space available: 20 MB of 4,000,000 MB';
                if (engine.state._vssWriterFailing) return '\nBackup status:\n  Last backup: COMPLETED WITH ERRORS (3/29/2026 11:45 PM)\n  Warning: VSS Writer \'SQL Server Writer\' failed. Application data may be inconsistent.\n  Error code: 0x800423f4';
                if (engine.state._scheduleConflict) return '\nBackup status:\n  Last backup: FAILED (3/29/2026 11:02 PM)\n  Error: Unable to lock volume C:\\ — another process has exclusive access.\n  Note: Check for conflicting scheduled tasks running at the same time.';
                if (engine.state._retentionTooShort) return '\nBackup status:\n  Last backup: SUCCESS (3/29/2026 11:42 PM)\n  Retention policy: 7 days (WARNING: Company policy requires 90 days)\n  Oldest available backup: 3/23/2026';
                return '\nBackup status:\n  Last backup: SUCCESS (3/29/2026 11:42 PM)\n  All systems operational.';
            }

            if (joined.includes('delete') && joined.includes('backup')) {
                if (scenario && scenario.id === 'storage_full') {
                    engine.state._storageFullNas = false;
                    engine.save();
                    if (!engine.state._flagRevealed) {
                        engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save();
                        setTimeout(function() { engine.notify('Old backups deleted. 2.1 TB freed on NAS. Check Backup Console for the recovery token.', 'success'); }, 400);
                    }
                    return '\nDeleting backup versions older than 30 days...\nDeleted 147 backup files.\nFreed 2.1 TB on \\\\NAS-01\\Backups.\n\nCurrent usage: 1.88 TB / 4.00 TB (47%)';
                }
                return '\nNo old backups to delete.';
            }

            return '\nUsage: wbadmin get status\n       wbadmin delete backup -keepVersions:30\n       wbadmin start backup -backuptarget:\\\\NAS-01\\Backups';
        },

        schtasks: function(args, term, engine) {
            var gate = SRV003Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = SRV003Config._getScenario(engine);

            if (joined.includes('/query')) {
                var defragTime = engine.state._scheduleConflict ? '11:00:00 PM' : '3:00:00 AM';
                return '\nTaskName                          Next Run Time          Status\n================================= ====================== ===============\n\\Backup\\NightlyBackup             3/30/2026 11:00:00 PM  Ready\n\\Microsoft\\Windows\\Defrag\\ScheduledDefrag  3/30/2026 ' + defragTime + '  Ready\n\\Microsoft\\Windows\\WindowsUpdate\\Scheduled Start  3/31/2026 3:00:00 AM  Ready';
            }

            if (joined.includes('/change') && joined.includes('defrag')) {
                if (joined.includes('/disable') || joined.includes('/st')) {
                    if (scenario && scenario.id === 'schedule_conflict') {
                        engine.state._scheduleConflict = false;
                        engine.save();
                        if (!engine.state._flagRevealed) {
                            engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save();
                            setTimeout(function() { engine.notify('Defrag rescheduled. Backup window is clear. Check Backup Console for the recovery token.', 'success'); }, 400);
                        }
                        return '\nSUCCESS: The parameters of scheduled task "ScheduledDefrag" have been changed.';
                    }
                }
            }

            return '\nUsage: schtasks /query\n       schtasks /change /tn <taskname> /st <time>\n       schtasks /change /tn <taskname> /disable';
        },

        // Retention policy fix
        reg: function(args, term, engine) {
            var gate = SRV003Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = SRV003Config._getScenario(engine);

            if (joined.includes('retention') && (joined.includes('90') || joined.includes('add') || joined.includes('update'))) {
                if (scenario && scenario.id === 'retention_policy') {
                    engine.state._retentionTooShort = false;
                    engine.save();
                    if (!engine.state._flagRevealed) {
                        engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save();
                        setTimeout(function() { engine.notify('Retention policy updated to 90 days. Compliance requirement met. Check Backup Console for the recovery token.', 'success'); }, 400);
                    }
                    return '\nThe operation completed successfully.\nRetention policy updated: 7 days -> 90 days.';
                }
            }
            return '\nUsage: reg add HKLM\\SOFTWARE\\Backup\\Config /v RetentionDays /t REG_DWORD /d 90';
        },

        wmic: function(args, term, engine) {
            var gate = SRV003Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            if (joined.includes('logicaldisk') || joined.includes('diskdrive')) {
                return '\nDeviceID  Size          FreeSpace     VolumeName\nC:        500,000 MB    142,000 MB    System\nD:        2,000,000 MB  850,000 MB    Data\n\\\\NAS-01  4,000,000 MB  ' + (engine.state._storageFullNas ? '20 MB' : '2,120,000 MB') + '         Backups';
            }
            return '\nUsage: wmic logicaldisk get DeviceID,Size,FreeSpace,VolumeName';
        },

        ping: function(args, term, engine) {
            var gate = SRV003Config._requireScenario(engine);
            if (gate) return gate;
            if (!args.length) return '\nUsage: ping target_name';
            var t = args[args.length - 1];
            if (t === 'NAS-01' || t === '10.0.3.20') return '\nPinging 10.0.3.20 with 32 bytes of data:\nReply from 10.0.3.20: bytes=32 time=1ms TTL=64\nReply from 10.0.3.20: bytes=32 time=1ms TTL=64\n\nPackets: Sent = 4, Received = 4, Lost = 0 (0% loss),';
            if (t === 'localhost' || t === '127.0.0.1') return '\nPinging 127.0.0.1: Reply from 127.0.0.1: bytes=32 time<1ms TTL=128\n\nPackets: Sent = 4, Received = 4, Lost = 0';
            return '\nPing request could not find host ' + t;
        },

        whoami: function() { return 'FILE-PROD-01\\Administrator'; },
        hostname: function() { return 'FILE-PROD-01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        ipconfig: function() { return '\nIPv4 Address: 10.0.3.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 10.0.3.1'; },
        sudo: function() { return '\'sudo\' is not recognized as an internal or external command.'; },
        grep: function() { return '\'grep\' is not recognized as an internal or external command.'; }
    },

    onAppLaunch(iconDef, engine) {
        var requireTicket = ['backup_console', 'event_viewer', 'services'];
        if (requireTicket.includes(iconDef.app) && !engine.state._scenarioSelected) {
            engine.notify('Open the Help Desk Ticket first.', 'error'); return;
        }
        switch (iconDef.app) {
            case 'ticket': SRV003Config._openTicket(iconDef, engine); break;
            case 'backup_console': SRV003Config._openBackupConsole(iconDef, engine); break;
            case 'event_viewer': SRV003Config._openEventViewer(iconDef, engine); break;
            case 'services': SRV003Config._openServices(iconDef, engine); break;
            case 'reset_lab': SRV003Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.id = 'ticketContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', container);
        SRV003Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) SRV003Config._renderTicket(engine, container);
        else SRV003Config._renderScenarioPicker(engine, container);
    },

    _renderScenarioPicker(engine, container) {
        var previews = [
            'IT Ops — "Nightly backup missed — agent may be down"',
            'Storage Team — "Backup failed with insufficient storage error"',
            'DBA — "Backup completing with VSS writer errors"',
            'IT Ops — "Backup and defrag fighting for volume lock"',
            'Compliance — "Only 7 days of backups exist — policy requires 90"'
        ];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#6366f1; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">INCIDENT QUEUE</div><div style="color:#888; font-size:0.75rem;">Select an incident to begin.</div></div><div style="margin-bottom:16px;">';
        SRV003Config._scenarios.forEach(function(s, i) {
            html += '<button class="srv003-scenario-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><div style="display:flex; justify-content:space-between;"><span style="color:#6366f1; font-weight:bold;">INC-' + (7001 + i) + '</span><span style="background:#e74c3c; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">SEV-1</span></div><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>';
        });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="srv003RandomBtn" style="padding:10px 28px; background:#6366f1; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.85rem; font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.srv003-scenario-btn').forEach(function(btn) {
            btn.addEventListener('mouseenter', function() { this.style.borderColor = '#6366f1'; });
            btn.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; });
            btn.addEventListener('click', function() { SRV003Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); SRV003Config._renderTicket(engine, container); });
        });
        document.getElementById('srv003RandomBtn').addEventListener('click', function() { SRV003Config._applyScenario(engine, Math.floor(Math.random() * SRV003Config._scenarios.length)); SRV003Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var scenario = SRV003Config._getScenario(engine);
        var submitters = ['Alex Turner — IT Operations', 'Maria Santos — Storage Engineering', 'Ryan Kim — Database Administration', 'Josh Brown — IT Operations', 'Priya Patel — Compliance Department'];
        var submitter = submitters[engine.state._scenarioId] || 'System';
        var server = SRV003Config._servers[scenario.affectedServer];
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><div style="display:flex; justify-content:space-between;"><span style="color:#6366f1; font-weight:bold; font-size:1rem;">INCIDENT #INC-' + (7001 + engine.state._scenarioId) + '</span><span style="background:#e74c3c; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">SEV-1</span></div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">REPORTED BY</div><div>' + submitter + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DATE</div><div>March 30, 2026 — 7:00 AM</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">AFFECTED SERVER</div><div style="font-weight:bold; color:#6366f1;">' + server.name + '</div><div style="color:#888; font-size:0.7rem;">' + server.ip + ' &mdash; ' + server.role + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + SRV003Config._escHtml(scenario.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + SRV003Config._escHtml(scenario.ticketDetail) + '</div></div>'
            + (scenario.ticketExtra ? '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(99,102,241,0.08); border:1px solid rgba(99,102,241,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#a5b4fc;">' + SRV003Config._escHtml(scenario.ticketExtra) + '</div></div>' : '')
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#888; font-size:0.7rem;">ASSIGNED TO</div><div style="color:#2ecc71; font-weight:bold;">YOU — Backup Administrator</div></div>';
    },

    _openBackupConsole(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); SRV003Config._renderBackupConsole(engine); return; }
        var container = document.createElement('div');
        container.id = 'backupContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Backup Console', 'BKP', container);
        SRV003Config._renderBackupConsole(engine);
    },

    _renderBackupConsole(engine) {
        var container = document.getElementById('backupContainer');
        if (!container) return;
        var scenario = SRV003Config._getScenario(engine);
        var html = '<div style="font-size:1rem; font-weight:bold; color:#6366f1; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Backup Management Console</div>';

        // Agent status
        var agentStatus = engine.state._backupAgentRunning ? 'Running' : 'Stopped';
        var agentColor = engine.state._backupAgentRunning ? '#2ecc71' : '#e74c3c';
        html += '<div style="margin-bottom:12px; padding:8px 12px; background:' + (engine.state._backupAgentRunning ? 'rgba(46,204,113,0.06)' : 'rgba(231,76,60,0.06)') + '; border:1px solid ' + (engine.state._backupAgentRunning ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.2)') + '; border-radius:4px;"><div style="display:flex; justify-content:space-between;"><span style="font-weight:bold;">Backup Agent</span><span style="color:' + agentColor + '; font-weight:bold;">' + agentStatus + '</span></div></div>';

        // Last backup status
        var lastStatus = 'Success';
        var lastColor = '#2ecc71';
        if (!engine.state._backupAgentRunning) { lastStatus = 'Missed'; lastColor = '#e74c3c'; }
        else if (engine.state._storageFullNas) { lastStatus = 'Failed (Storage Full)'; lastColor = '#e74c3c'; }
        else if (engine.state._vssWriterFailing) { lastStatus = 'Completed with Errors'; lastColor = '#f1c40f'; }
        else if (engine.state._scheduleConflict) { lastStatus = 'Failed (Volume Locked)'; lastColor = '#e74c3c'; }
        else if (engine.state._retentionTooShort) { lastStatus = 'Success (Retention: 7 days)'; lastColor = '#f1c40f'; }

        html += '<div style="margin-bottom:12px; padding:8px 12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px;"><div>Last Backup: <span style="color:' + lastColor + '; font-weight:bold;">' + lastStatus + '</span></div><div style="font-size:0.7rem; color:#888;">Schedule: Daily at 11:00 PM &mdash; Target: \\\\NAS-01\\Backups</div></div>';

        // Storage
        html += '<div style="margin-bottom:12px; padding:8px 12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px;"><div>Storage Target: \\\\NAS-01\\Backups</div><div style="font-size:0.7rem; color:' + (engine.state._storageFullNas ? '#e74c3c' : '#888') + ';">Used: ' + (engine.state._storageFullNas ? '3.98 TB / 4.00 TB (99.5%)' : '1.88 TB / 4.00 TB (47%)') + '</div></div>';

        if (engine.state._flagRevealed && scenario) {
            html += '<div style="margin-top:16px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;"><div style="color:#2ecc71; font-weight:bold; margin-bottom:4px;">Issue Resolved:</div><div style="font-size:0.8rem;">' + scenario.fixDescription + '</div><div id="srv003-flag-reveal" style="font-size:0.8rem; margin-top:4px;">Recovery token: loading...</div></div>';
            setTimeout(function() { BoxEngine.requestFlagText(scenario.id).then(function(f) { var el = document.getElementById('srv003-flag-reveal'); if (el) el.textContent = 'Recovery token: ' + (f || 'Flag unavailable'); }); }, 0);
        }
        container.innerHTML = html;
    },

    _openEventViewer(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Event Viewer', 'EVT', container);
        var scenario = SRV003Config._getScenario(engine);
        var events = [];
        if (scenario) {
            if (scenario.id === 'agent_stopped') events.push({ level: 'Error', time: '03/29/2026 10:47 PM', source: 'VeeamAgent', msg: 'Service terminated unexpectedly. The Veeam Agent service was stopped.' });
            else if (scenario.id === 'storage_full') events.push({ level: 'Error', time: '03/29/2026 11:23 PM', source: 'Backup', msg: 'Backup failed: The backup storage location does not have sufficient free space.' });
            else if (scenario.id === 'vss_error') events.push({ level: 'Warning', time: '03/29/2026 11:15 PM', source: 'VSS', msg: 'VSS Writer "SQL Server Writer" failed with error 0x800423f4.' });
            else if (scenario.id === 'schedule_conflict') events.push({ level: 'Error', time: '03/29/2026 11:02 PM', source: 'Backup', msg: 'Unable to lock volume C:\\ — another process has exclusive access.' });
            else if (scenario.id === 'retention_policy') events.push({ level: 'Warning', time: '03/30/2026 06:00 AM', source: 'Compliance', msg: 'Backup retention set to 7 days. Policy requires 90 days.' });
        }
        var html = '<div style="font-size:1rem; font-weight:bold; color:#6366f1; margin-bottom:16px;">Event Viewer</div>';
        events.forEach(function(e) {
            var c = e.level === 'Error' ? '#e74c3c' : '#f1c40f';
            html += '<div style="padding:6px 8px; margin-bottom:4px; background:rgba(' + (e.level === 'Error' ? '231,76,60' : '241,196,15') + ',0.06); border:1px solid rgba(' + (e.level === 'Error' ? '231,76,60' : '241,196,15') + ',0.2); border-radius:3px; font-size:0.75rem;"><span style="color:' + c + '; font-weight:bold;">' + e.level + '</span> <span style="color:#888;">' + e.time + '</span> <span style="color:#aaa;">' + e.source + '</span><br>' + e.msg + '</div>';
        });
        container.innerHTML = html;
    },

    _openServices(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Services', 'SVC', container);
        var html = '<div style="font-size:1rem; font-weight:bold; color:#6366f1; margin-bottom:16px;">Services</div>';
        var svcs = [
            { name: 'SQL Server VSS Writer', status: engine.state._vssWriterFailing ? 'Running (Errors)' : 'Running' },
            { name: 'Veeam Agent Service', status: engine.state._backupAgentRunning ? 'Running' : 'Stopped' },
            { name: 'Volume Shadow Copy', status: 'Running' }
        ];
        svcs.forEach(function(s) {
            var stopped = s.status === 'Stopped' || s.status.includes('Errors');
            html += '<div style="display:flex; justify-content:space-between; padding:6px 12px; margin-bottom:4px; background:' + (stopped ? 'rgba(231,76,60,0.06)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (stopped ? 'rgba(231,76,60,0.2)' : 'rgba(255,255,255,0.06)') + '; border-radius:3px;"><span>' + s.name + '</span><span style="color:' + (stopped ? '#e74c3c' : '#2ecc71') + ';">' + s.status + '</span></div>';
        });
        container.innerHTML = html;
    },

    _confirmReset(engine) {
        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        overlay.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px 32px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9; max-width:360px;"><div style="font-size:1rem; font-weight:bold; margin-bottom:12px; color:#e74c3c;">Reset Lab?</div><div style="font-size:0.8rem; color:#aaa; margin-bottom:20px;">This will clear all progress and restart.</div><div style="display:flex; gap:12px; justify-content:center;"><button id="srv003ResetConfirm" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="srv003ResetCancel" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(overlay);
        document.getElementById('srv003ResetConfirm').addEventListener('click', function() { SRV003Config._flagRestored = false; SRV003Config.hints = SRV003Config._defaultHints; engine.reset(); });
        document.getElementById('srv003ResetCancel').addEventListener('click', function() { overlay.remove(); });
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    }
};
