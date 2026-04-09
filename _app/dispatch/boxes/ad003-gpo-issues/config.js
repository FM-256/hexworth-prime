/* ============================================================
   DISPATCH LAB — Box AD-003: Group Policy Gone Wrong
   GPO Troubleshooting — A+ Core 2 & Security+
   5 scenarios: GPO filtered, loopback blocking, WMI filter,
   security filtering wrong group, conflicting GPOs
   ============================================================ */

var AD003Config = {

    title: 'Group Policy Gone Wrong',
    subtitle: 'GPO Troubleshooting — A+ / Security+',
    difficulty: 'Advanced',
    accent: '#8b5cf6',
    storageKey: 'hexworth_lab_ad003',
    registryId: 'ad003-gpo-issues',
    trackerKey: 'lab_ad003',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the ticket to understand which GPO is misbehaving and what the expected behavior should be.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Run gpresult on the affected machine', tip: 'Use gpresult /r or gpresult /h to see which GPOs are applied and which are filtered or denied.', trigger: { event: 'command', match: { cmd: 'contains:gpresult' }, alt: [{ event: 'window_open', match: { type: 'gpo_management' } }] } },
            { title: 'Identify the GPO issue', tip: 'Check security filtering, WMI filters, loopback processing mode, and GPO link order in Group Policy Management.', trigger: { event: 'window_open', match: { type: 'gpo_management' } } },
            { title: 'Apply the fix', tip: 'Fix the filtering, adjust the WMI query, correct the security group, or change GPO precedence.', trigger: { event: 'command', match: { cmd: 'contains:gpupdate' }, alt: [{ event: 'window_open', match: { type: 'gpo_management' } }] } },
            { title: 'Verify and capture the flag', tip: 'Run gpupdate /force and confirm the GPO now applies correctly. The flag appears after verification.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'A+ Core 2 / Security+',
        mappings: [
            { flagId: 'fixed', objective: '1.6', description: 'Configure Microsoft Windows networking features', skill: 'Group Policy Object Troubleshooting' },
            { flagId: 'fixed', objective: '3.8', description: 'Implement identity and account management controls', skill: 'GPO Security Filtering and WMI Filters' },
            { flagId: 'fixed', objective: '4.1', description: 'Summarize monitoring resources', skill: 'GPResult and RSoP Analysis' }
        ]
    },

    _domainUsers: [
        { name: 'Alex Rodriguez', username: 'arodriguez', ou: 'IT', title: 'IT Manager', memberOf: ['Domain Admins', 'IT Staff', 'GPO-Admins'] },
        { name: 'Dana Torres', username: 'dtorres', ou: 'IT', title: 'Help Desk Tech', memberOf: ['IT Staff', 'Help Desk'] },
        { name: 'Marcus Webb', username: 'mwebb', ou: 'IT', title: 'Sysadmin', memberOf: ['Domain Admins', 'IT Staff'] },
        { name: 'Susan Hall', username: 'shall', ou: 'HR', title: 'HR Director', memberOf: ['HR Staff', 'HR Managers'] },
        { name: 'Tom Wright', username: 'twright', ou: 'HR', title: 'HR Manager', memberOf: ['HR Staff', 'HR Managers'] },
        { name: 'Grace Kim', username: 'gkim', ou: 'Finance', title: 'Senior Accountant', memberOf: ['Finance Staff'] },
        { name: 'Rachel Huang', username: 'rhuang', ou: 'Marketing', title: 'Marketing Director', memberOf: ['Marketing Staff', 'Marketing Managers'] },
        { name: 'Steve Evans', username: 'sevans', ou: 'Marketing', title: 'Content Manager', memberOf: ['Marketing Staff'] },
        { name: 'David Kim', username: 'dkim', ou: 'Executives', title: 'CEO', memberOf: ['Executives', 'Domain Admins'] }
    ],

    _gpoList: [
        { name: 'Default Domain Policy', linked: 'hexworth.local', status: 'Enabled', secFilter: 'Authenticated Users' },
        { name: 'Desktop Wallpaper - Corp', linked: 'hexworth.local', status: 'Enabled', secFilter: 'Authenticated Users' },
        { name: 'USB Block Policy', linked: 'OU=Marketing', status: 'Enabled', secFilter: 'Marketing-Desktops' },
        { name: 'Drive Mapping - Finance', linked: 'OU=Finance', status: 'Enabled', secFilter: 'Finance Staff' },
        { name: 'Software Restriction - HR', linked: 'OU=HR', status: 'Enabled', secFilter: 'HR Staff' },
        { name: 'Windows Update - WSUS', linked: 'hexworth.local', status: 'Enabled', secFilter: 'Authenticated Users', wmiFilter: 'WMI-Win11-Only' },
        { name: 'Loopback - Conference Rooms', linked: 'OU=Conference Rooms', status: 'Enabled', secFilter: 'Authenticated Users', loopback: 'Replace' },
        { name: 'Security Baseline - Servers', linked: 'OU=Servers', status: 'Enabled', secFilter: 'Domain Computers' }
    ],

    _scenarios: [
        {
            id: 'gpo_filtered',
            name: 'GPO Not Applying — Filtered in gpresult',
            ticketSubject: 'Drive mapping GPO not applying to Finance users — gpresult shows "Filtering: Denied"',
            ticketDetail: 'Finance users are no longer getting their P: drive mapped at login. This broke two days ago after a change request was implemented. gpresult on Grace Kim\'s machine shows the "Drive Mapping - Finance" GPO with status "Filtering: Denied (Security)". Before the change, it was applying normally.',
            ticketExtra: 'IT Note: A change request on Monday modified the security filtering on "Drive Mapping - Finance" GPO. Someone changed the security filter from "Finance Staff" to "Finance-Desktops" — a group that does not exist. The GPO cannot apply because no computer objects match the filter. Fix: Change security filtering back to "Finance Staff" or "Authenticated Users" with scope to Finance OU.',
            fixDescription: 'Fix security filtering on Drive Mapping GPO to target correct group, then gpupdate /force',
            stateOverrides: { _filterFixed: false, _gpupdateRun: false }
        },
        {
            id: 'loopback_blocking',
            name: 'Loopback Processing Blocking User Policy',
            ticketSubject: 'Users in conference room lose all their drive mappings and printers',
            ticketDetail: 'When users log into the conference room computers, they lose all their personal drive mappings, printers, and desktop shortcuts. This only happens on conference room machines — their regular desktops are fine. The conference room GPO was supposed to just set a clean wallpaper and disable USB ports, not strip everything else.',
            ticketExtra: 'IT Note: The "Loopback - Conference Rooms" GPO has loopback processing set to "Replace" mode. Replace mode completely replaces the user\'s policy with the computer\'s policy. It should be set to "Merge" mode so the conference room settings are ADDED to the user\'s existing policy, not replacing it entirely.',
            fixDescription: 'Change loopback processing from Replace to Merge in the Conference Rooms GPO',
            stateOverrides: { _loopbackFixed: false, _gpupdateRun: false }
        },
        {
            id: 'wmi_filter',
            name: 'WMI Filter Excluding Windows 11',
            ticketSubject: 'WSUS policy not applying to new Windows 11 machines — updates not being managed',
            ticketDetail: 'New Windows 11 machines deployed this month are not receiving WSUS policy. They are pulling updates directly from Microsoft instead of the internal WSUS server. All existing Windows 10 machines are fine. gpresult on a Win 11 machine shows the WSUS GPO is "Filtering: Denied (WMI Filter)".',
            ticketExtra: 'IT Note: The "Windows Update - WSUS" GPO has a WMI filter called "WMI-Win11-Only" but it actually filters FOR Windows 10 only. The WMI query is: SELECT * FROM Win32_OperatingSystem WHERE Version LIKE "10.0.1%" — this matches Win10 builds (10.0.1xxxx) but not Win11 builds (10.0.2xxxx). Fix: Update the WMI query to include both: Version LIKE "10.0.%"',
            fixDescription: 'Update WMI filter query to include Windows 11 build numbers, then gpupdate',
            stateOverrides: { _wmiFixed: false, _gpupdateRun: false }
        },
        {
            id: 'sec_filter_wrong',
            name: 'Security Filtering Set to Wrong Group',
            ticketSubject: 'USB block policy applying to IT staff who need USB access for support',
            ticketDetail: 'IT technicians are reporting that their USB ports are blocked on their workstations. They need USB access to image machines, transfer data, and connect peripherals. The USB Block policy is only supposed to apply to Marketing department workstations, but it\'s somehow hitting IT machines too.',
            ticketExtra: 'IT Note: The "USB Block Policy" GPO is linked to OU=Marketing, but the security filtering was changed from "Marketing-Desktops" to "Authenticated Users" during a cleanup. This means ANY user who logs into a Marketing OU computer gets the policy, but also — since it is linked at the domain level for testing — it applies everywhere. Fix: Revert security filtering to "Marketing-Desktops" group only.',
            fixDescription: 'Fix security filtering on USB Block GPO to only target Marketing-Desktops group',
            stateOverrides: { _secFilterFixed: false, _gpupdateRun: false }
        },
        {
            id: 'conflicting_gpos',
            name: 'RSoP Shows Unexpected Policy — Conflicting GPOs',
            ticketSubject: 'Wallpaper GPO shows wrong image — should be corporate logo but showing old holiday theme',
            ticketDetail: 'Users across the company are seeing the old holiday wallpaper instead of the new corporate logo wallpaper that was deployed last week. The "Desktop Wallpaper - Corp" GPO is linked at the domain level, but RSoP shows the wallpaper setting is coming from a different GPO: "Holiday Theme 2025" which was supposed to be disabled after December.',
            ticketExtra: 'IT Note: The "Holiday Theme 2025" GPO is linked at the OU level (multiple OUs) and has higher precedence than the domain-level "Desktop Wallpaper - Corp" GPO. It was never disabled after the holidays. The wallpaper settings conflict. Fix: Either disable the Holiday Theme GPO or delete the wallpaper setting from it.',
            fixDescription: 'Disable the Holiday Theme 2025 GPO or remove conflicting wallpaper setting, then gpupdate',
            stateOverrides: { _conflictFixed: false, _gpupdateRun: false }
        }
    ],

    _eventLogs: {
        gpo_filtered: [
            { id: 1, time: '2026-03-28T08:00:15', eventId: 1085, source: 'DC01', username: 'gkim', category: 'Group Policy', desc: 'GPO "Drive Mapping - Finance" not applied — security filtering denied.', detail: 'GPO: Drive Mapping - Finance\nUser: HEXWORTH\\gkim\nReason: Access Denied (Security Filtering)\nSecurity Filter: Finance-Desktops (group does not contain user or computer)\nExpected Filter: Finance Staff' },
            { id: 2, time: '2026-03-28T08:01:22', eventId: 1085, source: 'DC01', username: 'hlewis', category: 'Group Policy', desc: 'GPO "Drive Mapping - Finance" not applied — security filtering denied.', detail: 'GPO: Drive Mapping - Finance\nUser: HEXWORTH\\hlewis\nReason: Access Denied (Security Filtering)' },
            { id: 3, time: '2026-03-28T08:15:00', eventId: 8004, source: 'DC01', username: 'gkim', category: 'Group Policy', desc: 'Group Policy processing completed — 1 GPO denied.', detail: 'Applied GPOs: Default Domain Policy, Desktop Wallpaper\nFiltered GPOs: Drive Mapping - Finance (Denied - Security)\nTotal processing time: 2.3 seconds' }
        ],
        loopback_blocking: [
            { id: 1, time: '2026-03-28T09:00:00', eventId: 1109, source: 'CONF-PC01', username: 'shall', category: 'Group Policy', desc: 'Loopback processing mode: Replace. User policy replaced by computer policy.', detail: 'Computer: CONF-PC01 (Conference Room A)\nUser: HEXWORTH\\shall\nLoopback Mode: Replace\nEffect: All user-specific GPOs replaced by computer GPOs.\nUser drive mappings: REMOVED\nUser printers: REMOVED' },
            { id: 2, time: '2026-03-28T09:05:22', eventId: 1109, source: 'CONF-PC02', username: 'sevans', category: 'Group Policy', desc: 'Loopback processing mode: Replace. User policy replaced by computer policy.', detail: 'Computer: CONF-PC02 (Conference Room B)\nUser: HEXWORTH\\sevans\nLoopback Mode: Replace\nAll user settings overwritten.' }
        ],
        wmi_filter: [
            { id: 1, time: '2026-03-28T08:30:00', eventId: 1085, source: 'DESK-201', username: 'SYSTEM', category: 'Group Policy', desc: 'GPO "Windows Update - WSUS" not applied — WMI filter evaluated to FALSE.', detail: 'GPO: Windows Update - WSUS\nComputer: DESK-201 (Windows 11 23H2, Build 10.0.22631)\nWMI Filter: WMI-Win11-Only\nQuery: SELECT * FROM Win32_OperatingSystem WHERE Version LIKE "10.0.1%"\nResult: FALSE (Build 10.0.22631 does not match 10.0.1%)' },
            { id: 2, time: '2026-03-28T08:30:05', eventId: 1085, source: 'DESK-202', username: 'SYSTEM', category: 'Group Policy', desc: 'GPO "Windows Update - WSUS" not applied — WMI filter FALSE.', detail: 'Computer: DESK-202 (Windows 11 24H2, Build 10.0.26100)\nWMI Filter Result: FALSE' },
            { id: 3, time: '2026-03-28T08:30:10', eventId: 8004, source: 'DESK-105', username: 'SYSTEM', category: 'Group Policy', desc: 'GPO "Windows Update - WSUS" applied successfully.', detail: 'Computer: DESK-105 (Windows 10 22H2, Build 10.0.19045)\nWMI Filter: WMI-Win11-Only\nQuery Result: TRUE (Build 10.0.19045 matches 10.0.1%)\nWSUS server configured.' }
        ],
        sec_filter_wrong: [
            { id: 1, time: '2026-03-28T07:45:00', eventId: 8004, source: 'IT-DESK01', username: 'dtorres', category: 'Group Policy', desc: 'GPO "USB Block Policy" applied to IT workstation.', detail: 'Computer: IT-DESK01\nUser: HEXWORTH\\dtorres (IT Staff)\nGPO: USB Block Policy\nSecurity Filter: Authenticated Users\nLinked to: Domain root (was OU=Marketing)\nEffect: USB mass storage BLOCKED on IT workstation' },
            { id: 2, time: '2026-03-28T07:50:15', eventId: 8004, source: 'IT-DESK02', username: 'mwebb', category: 'Group Policy', desc: 'GPO "USB Block Policy" applied to IT workstation.', detail: 'Computer: IT-DESK02\nUser: HEXWORTH\\mwebb\nUSB mass storage BLOCKED unexpectedly' }
        ],
        conflicting_gpos: [
            { id: 1, time: '2026-03-28T08:00:00', eventId: 8004, source: 'DC01', username: 'rhuang', category: 'Group Policy', desc: 'Multiple GPOs setting Desktop Wallpaper — conflict detected.', detail: 'Setting: Desktop Wallpaper Path\nWinning GPO: Holiday Theme 2025 (OU-level, higher precedence)\nLosing GPO: Desktop Wallpaper - Corp (Domain-level, lower precedence)\nResult: Holiday wallpaper displayed instead of corporate logo.\nNote: Holiday Theme 2025 should have been disabled after 2025-12-31.' },
            { id: 2, time: '2026-03-28T08:00:05', eventId: 8004, source: 'DC01', username: 'sevans', category: 'Group Policy', desc: 'RSoP conflict: Holiday Theme 2025 overrides Desktop Wallpaper - Corp.', detail: 'Both GPOs set the same registry value:\nHKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System\\Wallpaper\nHoliday Theme wins due to OU precedence over domain.' }
        ]
    },

    _defaultHints: [
        { id: 'hint1', text: 'Open the ticket, then run gpresult /r to see which GPOs are applied and which are filtered.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Look for "Filtering: Denied" entries in gpresult — they tell you exactly why a GPO is not applying.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Common GPO issues: wrong security filter, WMI filter excluding machines, loopback mode, or conflicting GPOs at different levels.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Fix the root cause in GPO Management, then run gpupdate /force to push changes immediately.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        gpo_filtered: [
            { id: 'hint1', text: 'gpresult shows the Drive Mapping GPO as "Filtering: Denied (Security)". Check the security filter group.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The security filter was changed to "Finance-Desktops" — a group that does not exist. It was supposed to be "Finance Staff".', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Open GPO Management, select the Drive Mapping GPO, and change security filtering back to "Finance Staff".', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Fix: Change security filter to "Finance Staff" in GPO Management, then gpupdate /force. Verify with gpresult.', cost: 50, penalty: -50 }
        ],
        loopback_blocking: [
            { id: 'hint1', text: 'Users lose all their settings only in conference rooms. Check loopback processing mode on the Conference Room GPO.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Loopback is set to "Replace" which completely overwrites user policy. It should be "Merge" to add settings on top.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'In GPO Management, edit the Conference Rooms GPO and change loopback from Replace to Merge mode.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Fix: Set loopback to Merge in the GPO editor, gpupdate /force on conference room PCs. User settings will persist.', cost: 50, penalty: -50 }
        ],
        wmi_filter: [
            { id: 'hint1', text: 'The WSUS GPO is not applying to new Win11 machines. Check the WMI filter attached to the GPO.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The WMI query uses "10.0.1%" which matches Win10 (10.0.1xxxx) but not Win11 (10.0.2xxxx). It needs "10.0.%".', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Edit the WMI filter "WMI-Win11-Only" and change the query to: Version LIKE "10.0.%"', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Fix: Update WMI filter query to "10.0.%", gpupdate /force on Win11 machines. They will now get WSUS settings.', cost: 50, penalty: -50 }
        ],
        sec_filter_wrong: [
            { id: 'hint1', text: 'The USB Block policy is hitting IT machines. Check the security filtering and GPO link scope.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Security filter was changed to "Authenticated Users" and the GPO link was moved to domain root during testing. Both need to be reverted.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Change security filtering back to "Marketing-Desktops" and ensure the GPO is linked only to OU=Marketing.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Fix: Revert security filter to "Marketing-Desktops", confirm GPO is linked to Marketing OU only, then gpupdate /force.', cost: 50, penalty: -50 }
        ],
        conflicting_gpos: [
            { id: 'hint1', text: 'RSoP shows wallpaper coming from "Holiday Theme 2025" instead of the corporate GPO. Check if that GPO should still be active.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The Holiday Theme 2025 GPO was never disabled after December. It has higher precedence because it is linked at the OU level.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Disable the Holiday Theme 2025 GPO in Group Policy Management. The corporate wallpaper GPO will then take effect.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Fix: Disable "Holiday Theme 2025" GPO, gpupdate /force. The corporate wallpaper will now be the winning setting.', cost: 50, penalty: -50 }
        ]
    },

    // Helpers
    _ensureScenario: function(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !AD003Config._flagRestored) {
            AD003Config._flagRestored = true;
            var scenario = AD003Config._scenarios[engine.state._scenarioId];
            if (scenario) AD003Config.hints = AD003Config._scenarioHints[scenario.id] || AD003Config._defaultHints;
        }
        return true;
    },
    _applyScenario: function(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._scenarioSelected = true;
        engine.state._filterFixed = false;
        engine.state._loopbackFixed = false;
        engine.state._wmiFixed = false;
        engine.state._secFilterFixed = false;
        engine.state._conflictFixed = false;
        engine.state._gpupdateRun = false;
        engine.state._labComplete = false;
        engine.state._flagRevealed = false;
        var scenario = AD003Config._scenarios[idx];
        AD003Config._flagRestored = true;
        AD003Config.hints = AD003Config._scenarioHints[scenario.id] || AD003Config._defaultHints;
        engine.save();
    },
    _getScenario: function(engine) { return engine.state._scenarioId != null ? AD003Config._scenarios[engine.state._scenarioId] : null; },
    _requireScenario: function(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket assigned.\nOpen the Help Desk Ticket first.\n'; },
    _escHtml: function(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    _checkFix: function(engine) {
        var scenario = AD003Config._getScenario(engine);
        if (!scenario || engine.state._labComplete) return;
        var done = false;
        if (scenario.id === 'gpo_filtered')     done = engine.state._filterFixed && engine.state._gpupdateRun;
        if (scenario.id === 'loopback_blocking') done = engine.state._loopbackFixed && engine.state._gpupdateRun;
        if (scenario.id === 'wmi_filter')       done = engine.state._wmiFixed && engine.state._gpupdateRun;
        if (scenario.id === 'sec_filter_wrong') done = engine.state._secFilterFixed && engine.state._gpupdateRun;
        if (scenario.id === 'conflicting_gpos') done = engine.state._conflictFixed && engine.state._gpupdateRun;
        if (done) {
            engine.state._labComplete = true;
            engine.state._flagRevealed = true;
            engine.save();
            engine.requestFlagText(scenario.id).then(function(f) {
                engine.notify(f ? 'GPO issue resolved. Check GPO Management for the closure token.' : 'GPO issue resolved. Flag delivery pending.', 'success');
            }).catch(function() { engine.notify('GPO issue resolved. Flag delivery pending.', 'success'); });
        }
    },

    boot: { biosLines: ['Dell PowerEdge R750 — BIOS v2.12.1', 'Intel Xeon Gold 5315Y x2', 'Memory: 65536 MB DDR4 ECC OK', 'RAID-10: SAMSUNG PM883 (2TB x4)', 'Network: Intel X710-DA2 10GbE', 'Loading Windows Boot Manager...'], grubEntries: ['Windows Server 2022 Standard (DC01)'], loginUser: 'Administrator' },

    desktop: { icons: [
        { id: 'powershell', label: 'PowerShell', icon: 'PS', app: 'terminal' },
        { id: 'aduc', label: 'AD Users &\nComputers', icon: 'AD', app: 'aduc' },
        { id: 'event_viewer', label: 'Event\nViewer', icon: 'EVT', app: 'event_viewer' },
        { id: 'gpo', label: 'Group Policy\nMgmt', icon: 'GPO', app: 'gpo_management' },
        { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' },
        { id: 'notes', label: 'Notepad', icon: 'TXT', app: 'notes' },
        { id: 'hints', label: 'Hints', icon: '?', app: 'hints' },
        { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }
    ]},

    terminal: { user: 'Administrator', hostname: 'DC01', startDir: 'C:\\Windows\\System32', promptStyle: 'powershell', welcome: 'Windows PowerShell\nCopyright (C) Microsoft Corporation.\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:ad003}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 2400 },
    hints: [
        { id: 'hint1', text: 'Open the ticket, then use gpresult to see GPO application status.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Look for Filtering: Denied entries and check why the GPO is not applying.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Fix the issue in GPO Management, then gpupdate /force.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Each scenario has a specific fix: security filter, WMI query, loopback mode, or disable conflicting GPO.', cost: 50, penalty: -50 }
    ],
    lore: {
        intro: 'Group Policy is the backbone of Windows domain management, but when GPOs break, they can silently fail or apply to the wrong targets. As Domain Admin, diagnose and fix the GPO issue.',
        scenario: 'GPO problems often come from security filtering changes, WMI filter mismatches, loopback processing misconfiguration, or conflicting policies at different scope levels.',
        outro: 'Group Policy issue resolved. The correct policies are now applying to the intended targets. Document the change and update the GPO management procedures.'
    },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read the ticket and run gpresult.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the specific GPO issue.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Remediation', description: 'Fix the GPO and run gpupdate.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm GPO applies correctly.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        gpresult: function(args, term, engine) {
            var gate = AD003Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = AD003Config._getScenario(engine);
            var out = '\nMicrosoft (R) Windows (R) Group Policy Result\n\nApplied GPOs:\n';
            out += '    Default Domain Policy\n    Desktop Wallpaper - Corp\n';
            if (scenario.id === 'gpo_filtered') {
                out += '\nFiltered GPOs:\n    Drive Mapping - Finance — Filtering: Denied (Security)\n      Reason: Security filter group "Finance-Desktops" does not contain the user or computer.\n';
            }
            if (scenario.id === 'loopback_blocking') {
                out += '    Loopback - Conference Rooms (Mode: Replace)\n';
                out += '\nWARNING: Loopback Replace mode is active. All user-specific GPO settings have been replaced.\n';
            }
            if (scenario.id === 'wmi_filter') {
                out += '\nFiltered GPOs:\n    Windows Update - WSUS — Filtering: Denied (WMI Filter)\n      WMI Filter: WMI-Win11-Only\n      Query: SELECT * FROM Win32_OperatingSystem WHERE Version LIKE "10.0.1%"\n      Result: FALSE (Current build: 10.0.22631 does not match)\n';
            }
            if (scenario.id === 'sec_filter_wrong') {
                out += '    USB Block Policy — Applied (Security Filter: Authenticated Users)\n';
                out += '\nWARNING: USB Block Policy applying to all workstations. Expected: Marketing only.\n';
            }
            if (scenario.id === 'conflicting_gpos') {
                out += '    Holiday Theme 2025 — Applied (OU-level, winning)\n';
                out += '\nConflict: Desktop Wallpaper setting\n    Winning: Holiday Theme 2025 (OU precedence)\n    Losing: Desktop Wallpaper - Corp (Domain level)\n';
            }
            return out;
        },

        gpupdate: function(args, term, engine) {
            var gate = AD003Config._requireScenario(engine);
            if (gate) return gate;
            var lower = args.join(' ').toLowerCase();
            if (lower.includes('/force') || lower.includes('-force')) {
                engine.state._gpupdateRun = true;
                engine.save();
                AD003Config._checkFix(engine);
                return '\nUpdating policy...\n\nComputer Policy update has completed successfully.\nUser Policy update has completed successfully.\n';
            }
            return '\nUpdating policy...\n\nComputer Policy update has completed successfully.\nUser Policy update has completed successfully.\n(Use /force for immediate full refresh)\n';
        },

        whoami: function() { return 'HEXWORTH\\Administrator'; },
        hostname: function() { return 'DC01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },

        'get-aduser': function(args, term, engine) {
            var gate = AD003Config._requireScenario(engine);
            if (gate) return gate;
            var target = args[0] ? args[0].toLowerCase() : null;
            if (target) {
                var found = AD003Config._domainUsers.filter(function(u) { return u.username === target; })[0];
                if (!found) return '\nGet-ADUser : Cannot find object: ' + target + '\n';
                return '\nName: ' + found.name + '\nSamAccountName: ' + found.username + '\nOU: ' + found.ou + '\nTitle: ' + found.title + '\nMemberOf: ' + found.memberOf.join(', ') + '\n';
            }
            return '\nUsage: Get-ADUser <username> [-Properties *]\n';
        }
    },

    onAppLaunch: function(iconDef, engine) {
        if (['aduc', 'event_viewer', 'gpo_management'].indexOf(iconDef.app) !== -1 && !engine.state._scenarioSelected) {
            engine.notify('Open the Help Desk Ticket first.', 'error'); return;
        }
        switch (iconDef.app) {
            case 'ticket': AD003Config._openTicket(iconDef, engine); break;
            case 'event_viewer': AD003Config._openEventViewer(iconDef, engine); break;
            case 'gpo_management': AD003Config._openGPO(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset lab?')) engine.resetLab(); break;
        }
    },

    _openTicket: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        AD003Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) { AD003Config._renderTicket(engine, c); }
        else { AD003Config._renderPicker(engine, c); }
    },

    _renderPicker: function(engine, c) {
        var previews = ['Finance drive mapping not working — gpresult shows Denied', 'Conference room users lose all personal settings', 'New Win11 machines not getting WSUS policy', 'USB block hitting IT workstations unexpectedly', 'Wrong wallpaper showing — holiday theme still active'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#8b5cf6; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">HELP DESK QUEUE — GPO ISSUES</div></div><div>';
        AD003Config._scenarios.forEach(function(s, i) {
            html += '<button class="s-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><span style="color:#8b5cf6; font-weight:bold;">INC-' + (4100 + i) + '</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>';
        });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="rndBtn" style="padding:10px 28px; background:#8b5cf6; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random Assignment</button></div>';
        c.innerHTML = html;
        c.querySelectorAll('.s-btn').forEach(function(b) { b.addEventListener('click', function() { AD003Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); AD003Config._renderTicket(engine, c); }); });
        document.getElementById('rndBtn').addEventListener('click', function() { AD003Config._applyScenario(engine, Math.floor(Math.random() * 5)); AD003Config._renderTicket(engine, c); });
    },

    _renderTicket: function(engine, c) {
        var s = AD003Config._getScenario(engine);
        c.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><span style="color:#8b5cf6; font-weight:bold; font-size:1rem;">INCIDENT #INC-' + (4100 + engine.state._scenarioId) + '</span></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + AD003Config._escHtml(s.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + AD003Config._escHtml(s.ticketDetail) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(139,92,246,0.08); border:1px solid rgba(139,92,246,0.25); border-radius:4px; padding:12px; line-height:1.6; color:#c4b5fd;">' + AD003Config._escHtml(s.ticketExtra) + '</div></div>'
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#888; font-size:0.7rem;">ASSIGNED TO</div><div style="color:#2ecc71; font-weight:bold;">YOU — Domain Administrator</div></div>';
    },

    _openEventViewer: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.id = 'evtC003';
        c.style.cssText = 'display:flex; flex-direction:column; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; overflow:hidden;';
        engine.openWindow(iconDef.id, 'Event Viewer', 'EVT', c);
        var s = AD003Config._getScenario(engine);
        var logs = s ? (AD003Config._eventLogs[s.id] || []) : [];
        var html = '<div style="padding:10px 16px; border-bottom:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2);"><span style="color:#8b5cf6; font-weight:bold;">Group Policy Event Log</span></div><div style="flex:1; overflow-y:auto;">';
        logs.forEach(function(e) {
            var col = e.eventId === 1085 ? '#e74c3c' : e.eventId === 1109 ? '#e67e22' : '#888';
            html += '<div style="border-bottom:1px solid rgba(255,255,255,0.04); cursor:pointer;" onclick="this.querySelector(\'.d\').style.display=this.querySelector(\'.d\').style.display===\'none\'?\'block\':\'none\'">'
                + '<div style="display:flex; padding:6px 12px;"><span style="flex:1.5; color:#888; font-size:0.75rem;">' + e.time.replace('T',' ').substring(0,19) + '</span><span style="flex:0.5; color:' + col + '; font-weight:bold;">' + e.eventId + '</span><span style="flex:3; font-size:0.75rem;">' + e.desc + '</span></div>'
                + '<div class="d" style="display:none; background:rgba(0,0,0,0.3); border-left:3px solid ' + col + '; padding:10px 16px; font-size:0.75rem; white-space:pre-wrap; color:#aaa;">' + e.detail + '</div></div>';
        });
        html += '</div>';
        c.innerHTML = html;
    },

    _openGPO: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.id = 'gpoC003';
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Group Policy Management', 'GPO', c);
        var s = AD003Config._getScenario(engine);
        var html = '<div style="font-size:0.9rem; font-weight:bold; color:#8b5cf6; margin-bottom:16px;">Group Policy Objects — hexworth.local</div>';

        AD003Config._gpoList.forEach(function(g) {
            html += '<div style="padding:8px; margin-bottom:6px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px;">'
                + '<div style="font-weight:bold; color:#c4b5fd;">' + g.name + '</div>'
                + '<div style="color:#888; font-size:0.75rem;">Linked: ' + g.linked + ' | Filter: ' + g.secFilter + (g.wmiFilter ? ' | WMI: ' + g.wmiFilter : '') + (g.loopback ? ' | Loopback: ' + g.loopback : '') + '</div>'
                + '</div>';
        });

        if (s && !engine.state._labComplete) {
            html += '<div style="margin-top:20px; padding:12px; border:1px solid rgba(139,92,246,0.3); border-radius:4px; background:rgba(139,92,246,0.08);">'
                + '<div style="font-weight:bold; color:#c4b5fd; margin-bottom:8px;">Apply Fix</div>';
            if (s.id === 'gpo_filtered') html += '<button id="fixBtn" style="padding:8px 20px; background:#8b5cf6; color:#fff; border:none; border-radius:3px; cursor:pointer; font-weight:bold;">Change Security Filter to "Finance Staff"</button>';
            if (s.id === 'loopback_blocking') html += '<button id="fixBtn" style="padding:8px 20px; background:#8b5cf6; color:#fff; border:none; border-radius:3px; cursor:pointer; font-weight:bold;">Change Loopback from Replace to Merge</button>';
            if (s.id === 'wmi_filter') html += '<button id="fixBtn" style="padding:8px 20px; background:#8b5cf6; color:#fff; border:none; border-radius:3px; cursor:pointer; font-weight:bold;">Update WMI Filter to "10.0.%"</button>';
            if (s.id === 'sec_filter_wrong') html += '<button id="fixBtn" style="padding:8px 20px; background:#8b5cf6; color:#fff; border:none; border-radius:3px; cursor:pointer; font-weight:bold;">Revert Security Filter to "Marketing-Desktops"</button>';
            if (s.id === 'conflicting_gpos') html += '<button id="fixBtn" style="padding:8px 20px; background:#8b5cf6; color:#fff; border:none; border-radius:3px; cursor:pointer; font-weight:bold;">Disable "Holiday Theme 2025" GPO</button>';
            html += '</div>';
        }

        if (engine.state._flagRevealed && engine._deliveredFlags) {
            var fv = engine._deliveredFlags[s ? s.id : ''];
            if (fv) html += '<div style="margin-top:16px; padding:10px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px;"><div style="color:#2ecc71; font-weight:bold;">Closure Token:</div><div>' + fv + '</div></div>';
        }

        c.innerHTML = html;

        var fb = document.getElementById('fixBtn');
        if (fb) fb.addEventListener('click', function() {
            if (s.id === 'gpo_filtered') engine.state._filterFixed = true;
            if (s.id === 'loopback_blocking') engine.state._loopbackFixed = true;
            if (s.id === 'wmi_filter') engine.state._wmiFixed = true;
            if (s.id === 'sec_filter_wrong') engine.state._secFilterFixed = true;
            if (s.id === 'conflicting_gpos') engine.state._conflictFixed = true;
            engine.save();
            engine.notify('GPO fix applied. Run gpupdate /force in PowerShell to push changes.', 'success');
            AD003Config._checkFix(engine);
            AD003Config._openGPO(iconDef, engine);
        });
    }
};
