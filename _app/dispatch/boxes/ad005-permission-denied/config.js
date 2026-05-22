/* ============================================================
   DISPATCH LAB — Box AD-005: Permission Denied
   NTFS / Share / Delegation Permission Troubleshooting
   A+ Core 2 & Security+ — 5 scenarios
   ============================================================ */

var AD005Config = {
    title: 'Permission Denied',
    subtitle: 'File & Share Permission Troubleshooting — A+ / Security+',
    difficulty: 'Advanced',
    accent: '#8b5cf6',
    storageKey: 'hexworth_lab_ad005',
    registryId: 'ad005-permission-denied',
    trackerKey: 'lab_ad005',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the access denied complaint to understand what resource the user cannot reach.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check share and NTFS permissions', tip: 'Use Get-SmbShareAccess or the Share Permissions viewer to see share-level ACLs. Use Get-Acl or icacls for NTFS.', trigger: { event: 'command', match: { cmd: 'contains:Get-Acl' }, alt: [{ event: 'command', match: { cmd: 'contains:icacls' } }, { event: 'command', match: { cmd: 'contains:Get-SmbShareAccess' } }] } },
            { title: 'Identify the permission conflict', tip: 'Effective access = intersection of share + NTFS permissions. Explicit Deny always wins. Check nested group memberships.', trigger: { event: 'command', match: { cmd: 'contains:Get-ADPrincipalGroupMembership' }, alt: [{ event: 'command', match: { cmd: 'contains:Get-Acl' } }] } },
            { title: 'Fix the permissions', tip: 'Remove the deny ACE, fix the share permission, correct the delegation, or change file ownership.', trigger: { event: 'command', match: { cmd: 'contains:Set-Acl' }, alt: [{ event: 'command', match: { cmd: 'contains:icacls' } }, { event: 'command', match: { cmd: 'contains:Grant-SmbShareAccess' } }] } },
            { title: 'Verify and capture the flag', tip: 'Confirm the user can now access the resource. Flag appears after fix verification.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'A+ Core 2 / Security+',
        mappings: [
            { flagId: 'fixed', objective: '1.6', description: 'Configure Windows networking features', skill: 'NTFS and Share Permission Management' },
            { flagId: 'fixed', objective: '3.8', description: 'Implement identity and account management controls', skill: 'Effective Access and Permission Inheritance' },
            { flagId: 'fixed', objective: '2.4', description: 'Implement access controls', skill: 'File Ownership and Delegation' }
        ]
    },

    _scenarios: [
        {
            id: 'share_vs_ntfs',
            name: 'Share Permission Allows but NTFS Denies',
            ticketSubject: 'User can see the Projects folder in network but gets "Access Denied" opening files',
            ticketDetail: 'Grace Kim can browse to \\\\FILESERVER01\\Projects and see folder listings, but when she tries to open any file inside, she gets Access Denied. She says she used to be able to access these files. Other Finance users can still access them. The share permission shows everyone has Read access but the NTFS permission is more restrictive.',
            ticketExtra: 'IT Note: Share permissions grant "Everyone: Read". NTFS ACL on the Projects folder grants "Finance Staff: Modify" and "All Staff: Read". However, there is an explicit NTFS Deny Read for the "Finance-Temps" group. Grace was recently added to Finance-Temps for a cross-training program. Deny always overrides Allow. Remove her from Finance-Temps or remove the Deny ACE.',
            fixDescription: 'Remove Grace from Finance-Temps group or remove the explicit Deny ACE from NTFS',
            stateOverrides: { _shareNtfsFixed: false }
        },
        {
            id: 'inherited_override',
            name: 'Inherited Permission Overriding Explicit',
            ticketSubject: 'HR Confidential subfolder accessible to non-HR staff despite explicit deny',
            ticketDetail: 'The \\\\FILESERVER01\\HR\\Confidential folder is supposed to only be accessible by HR Managers. However, Tom Wright (HR Manager) reports that a Marketing user was able to read files in the Confidential folder. The explicit ACL on Confidential says only HR Managers have access, but inherited permissions from the parent HR folder are overriding it.',
            ticketExtra: 'IT Note: The parent HR folder grants "All Staff: Read" which is being inherited by the Confidential subfolder. The explicit ACL on Confidential grants only "HR Managers: Full Control" but inheritance was re-enabled during a recent backup restore. Fix: Disable inheritance on the Confidential folder and remove the inherited "All Staff: Read" entry.',
            fixDescription: 'Disable inheritance on Confidential folder, remove inherited All Staff Read ACE',
            stateOverrides: { _inheritFixed: false }
        },
        {
            id: 'nested_group_deny',
            name: 'Effective Access Shows Deny from Nested Group',
            ticketSubject: 'IT admin cannot modify files in shared tools folder despite being in IT Staff group',
            ticketDetail: 'Marcus Webb (Systems Administrator, IT Staff) cannot modify files in \\\\FILESERVER01\\IT-Tools. He gets "Access Denied" when trying to save changes. The folder explicitly grants "IT Staff: Modify". Other IT members can edit files fine. Marcus specifically is blocked.',
            ticketExtra: 'IT Note: Marcus is in "IT Staff" (Allow Modify) but is also in "Server Operators" which is nested inside "Restricted-Write" group. "Restricted-Write" has an explicit Deny Write ACE on IT-Tools. Effective access = Deny wins. Fix: Remove "Restricted-Write" Deny ACE or remove "Server Operators" from "Restricted-Write" group, since that deny was meant for a different folder.',
            fixDescription: 'Remove the Deny Write ACE for Restricted-Write group from IT-Tools folder',
            stateOverrides: { _nestedDenyFixed: false }
        },
        {
            id: 'delegation_fail',
            name: 'Delegation Not Granting Expected Rights',
            ticketSubject: 'Help desk cannot reset passwords despite delegation being configured',
            ticketDetail: 'Dana Torres (Help Desk) is supposed to be able to reset passwords for users in the HR and Marketing OUs. The delegation wizard was run last week, but when Dana tries to reset a password, she gets "Access Denied". The delegation was set up on the "Users" container, not on the HR and Marketing OUs directly.',
            ticketExtra: 'IT Note: The delegation was applied to CN=Users (the default container), not to OU=HR and OU=Marketing. AD delegations must be applied to the specific OU where the target user objects reside. The Users container does not contain department users — they are in department OUs. Re-run delegation on OU=HR and OU=Marketing.',
            fixDescription: 'Apply password reset delegation to the correct OUs (HR and Marketing) instead of the Users container',
            stateOverrides: { _delegationFixed: false }
        },
        {
            id: 'ownership_terminated',
            name: 'File Ownership Belongs to Terminated Employee',
            ticketSubject: 'Cannot modify critical spreadsheet — owner is a terminated employee',
            ticketDetail: 'The Finance team cannot modify the annual budget spreadsheet at \\\\FILESERVER01\\Finance\\Budget_2026.xlsx. The file is owned by "fdesouza" (Frank DeSouza, former COO) whose account was disabled three months ago. The file has ownership-based permissions and no one else has Modify access.',
            ticketExtra: 'IT Note: The file owner is the disabled account "fdesouza". The NTFS ACL uses "CREATOR OWNER: Full Control" which only applies to fdesouza. Other users have Read-only. An admin needs to take ownership of the file (takeown or Set-Acl) and then grant Finance Staff appropriate permissions.',
            fixDescription: 'Take ownership of the file and grant Finance Staff Modify permission',
            stateOverrides: { _ownershipFixed: false }
        }
    ],

    _eventLogs: {
        share_vs_ntfs: [
            { id: 1, time: '2026-03-29T08:15:00', eventId: 4656, source: 'FILESERVER01', username: 'gkim', category: 'Object Access', desc: 'Access denied to \\\\FILESERVER01\\Projects\\Q1-Report.xlsx', detail: 'User: HEXWORTH\\gkim\nResource: Projects\\Q1-Report.xlsx\nAccess Requested: Read\nShare Permission: Allow (Everyone: Read)\nNTFS Permission: Deny (Finance-Temps: Deny Read)\nResult: ACCESS DENIED\nNote: User is member of Finance-Temps (explicit Deny overrides Allow).' },
            { id: 2, time: '2026-03-29T08:15:30', eventId: 4656, source: 'FILESERVER01', username: 'gkim', category: 'Object Access', desc: 'Repeated access failure — same cause.', detail: 'Second attempt by gkim. Same Deny ACE blocking access.' }
        ],
        inherited_override: [
            { id: 1, time: '2026-03-29T07:45:00', eventId: 4663, source: 'FILESERVER01', username: 'sevans', category: 'Object Access', desc: 'Unauthorized read access to HR\\Confidential\\Salary_Review.xlsx', detail: 'User: HEXWORTH\\sevans (Marketing, NOT HR)\nResource: HR\\Confidential\\Salary_Review.xlsx\nAccess: Read — GRANTED\nGrant Source: Inherited from parent (All Staff: Read)\nNote: Inheritance is enabled on Confidential folder. Should be disabled.' }
        ],
        nested_group_deny: [
            { id: 1, time: '2026-03-29T09:00:00', eventId: 4656, source: 'FILESERVER01', username: 'mwebb', category: 'Object Access', desc: 'Write access denied to IT-Tools folder.', detail: 'User: HEXWORTH\\mwebb\nResource: IT-Tools\\deploy-script.ps1\nAccess Requested: Write\nAllow: IT Staff: Modify (mwebb is member)\nDeny: Restricted-Write: Deny Write\nMembership chain: mwebb -> Server Operators -> Restricted-Write\nResult: DENY wins over Allow.' }
        ],
        delegation_fail: [
            { id: 1, time: '2026-03-29T08:30:00', eventId: 4725, source: 'DC01', username: 'dtorres', category: 'Account Mgmt', desc: 'Password reset attempt denied — insufficient delegation.', detail: 'Operator: HEXWORTH\\dtorres (Help Desk)\nTarget: HEXWORTH\\obaker (OU=HR)\nAction: Reset Password\nResult: Access Denied\nDelegation exists on: CN=Users (wrong container)\nUser object located in: OU=HR (no delegation here)' }
        ],
        ownership_terminated: [
            { id: 1, time: '2026-03-29T09:30:00', eventId: 4656, source: 'FILESERVER01', username: 'gkim', category: 'Object Access', desc: 'Modify access denied to Budget_2026.xlsx — owner is disabled account.', detail: 'User: HEXWORTH\\gkim\nFile: Finance\\Budget_2026.xlsx\nOwner: HEXWORTH\\fdesouza (DISABLED)\nACL: CREATOR OWNER: Full Control, Finance Staff: Read\nResult: Only Read allowed. Modify denied.\nFix: Admin must take ownership and update ACL.' }
        ]
    },

    _defaultHints: [
        { id: 'hint1', text: 'Open the ticket and identify the resource and user. Then check both share and NTFS permissions.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use Get-SmbShareAccess for share perms, Get-Acl or icacls for NTFS. Effective access = most restrictive of share + NTFS.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Deny always overrides Allow. Check nested group memberships with Get-ADPrincipalGroupMembership.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Fix the specific ACL issue: remove Deny ACE, disable inheritance, fix delegation scope, or take ownership.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        share_vs_ntfs: [
            { id: 'hint1', text: 'Check what groups gkim is in — any new group memberships recently?', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'gkim was added to Finance-Temps which has an explicit Deny Read on the Projects folder NTFS ACL.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Remove the Deny ACE: icacls "\\\\FILESERVER01\\Projects" /remove:d "Finance-Temps" or remove gkim from Finance-Temps.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Best fix: Remove gkim from Finance-Temps if she does not need that group. Or remove the Deny ACE if it is overbroad.', cost: 50, penalty: -50 }
        ],
        inherited_override: [
            { id: 'hint1', text: 'Check if inheritance is enabled on the Confidential folder.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Inheritance was re-enabled during backup restore. "All Staff: Read" is inherited from parent and granting access to non-HR users.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Disable inheritance: icacls "\\\\FILESERVER01\\HR\\Confidential" /inheritance:d — then remove the inherited "All Staff" entry.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After disabling inheritance, verify only HR Managers have access with Get-Acl.', cost: 50, penalty: -50 }
        ],
        nested_group_deny: [
            { id: 'hint1', text: 'mwebb is in IT Staff (Allow Modify) but is also denied. Check nested group memberships.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'mwebb -> Server Operators -> Restricted-Write. Restricted-Write has Deny Write on IT-Tools.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Remove the Deny ACE for Restricted-Write from IT-Tools: icacls "\\\\FILESERVER01\\IT-Tools" /remove:d "Restricted-Write"', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'The Deny was meant for a different folder. Remove it from IT-Tools and it will not affect the intended restrictions elsewhere.', cost: 50, penalty: -50 }
        ],
        delegation_fail: [
            { id: 'hint1', text: 'Check where the password reset delegation was applied. Is it on the correct OU?', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Delegation is on CN=Users (default container) but HR/Marketing users are in OU=HR and OU=Marketing.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Re-run the Delegation of Control wizard on OU=HR and OU=Marketing, granting Help Desk the password reset right.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Use dsacls or the GUI delegation wizard to add Reset Password permission for "Help Desk" group on both OUs.', cost: 50, penalty: -50 }
        ],
        ownership_terminated: [
            { id: 'hint1', text: 'Check who owns the file: Get-Acl "\\\\FILESERVER01\\Finance\\Budget_2026.xlsx" | Select Owner', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Owner is fdesouza (terminated, disabled). CREATOR OWNER ACL only grants access to the original owner.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Take ownership: takeown /f "\\\\FILESERVER01\\Finance\\Budget_2026.xlsx" /a (assigns to Administrators)', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After taking ownership, grant Finance Staff Modify: icacls "path" /grant "Finance Staff:(M)"', cost: 50, penalty: -50 }
        ]
    },

    _ensureScenario: function(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !AD005Config._flagRestored) { AD005Config._flagRestored = true; var s = AD005Config._scenarios[engine.state._scenarioId]; if (s) AD005Config.hints = AD005Config._scenarioHints[s.id] || AD005Config._defaultHints; } return true; },
    _applyScenario: function(engine, idx) { engine.state._scenarioId = idx; engine.state._scenarioSelected = true; engine.state._shareNtfsFixed = false; engine.state._inheritFixed = false; engine.state._nestedDenyFixed = false; engine.state._delegationFixed = false; engine.state._ownershipFixed = false; engine.state._labComplete = false; engine.state._flagRevealed = false; AD005Config._flagRestored = true; AD005Config.hints = AD005Config._scenarioHints[AD005Config._scenarios[idx].id] || AD005Config._defaultHints; engine.save(); },
    _getScenario: function(engine) { return engine.state._scenarioId != null ? AD005Config._scenarios[engine.state._scenarioId] : null; },
    _requireScenario: function(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket. Open Help Desk Ticket first.\n'; },
    _escHtml: function(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },
    _checkFix: function(engine) {
        var s = AD005Config._getScenario(engine); if (!s || engine.state._labComplete) return;
        var done = false;
        if (s.id === 'share_vs_ntfs') done = engine.state._shareNtfsFixed;
        if (s.id === 'inherited_override') done = engine.state._inheritFixed;
        if (s.id === 'nested_group_deny') done = engine.state._nestedDenyFixed;
        if (s.id === 'delegation_fail') done = engine.state._delegationFixed;
        if (s.id === 'ownership_terminated') done = engine.state._ownershipFixed;
        if (done) { engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save(); engine.requestFlagText(s.id).then(function(f) { engine.notify(f ? 'Permission issue resolved. Check Event Viewer for closure token.' : 'Fixed. Flag pending.', 'success'); }).catch(function() { engine.notify('Fixed. Flag pending.', 'success'); }); }
    },

    boot: { biosLines: ['Dell PowerEdge R750 — BIOS v2.12.1', 'Intel Xeon Gold 5315Y x2', 'Memory: 65536 MB OK', 'RAID-10 OK', 'Loading Windows Boot Manager...'], grubEntries: ['Windows Server 2022 (DC01)'], loginUser: 'Administrator' },
    desktop: { icons: [{ id: 'powershell', label: 'PowerShell', icon: 'PS', app: 'terminal' }, { id: 'event_viewer', label: 'Event\nViewer', icon: 'EVT', app: 'event_viewer' }, { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' }, { id: 'notes', label: 'Notepad', icon: 'TXT', app: 'notes' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }] },
    terminal: { user: 'Administrator', hostname: 'DC01', startDir: 'C:\\Windows\\System32', promptStyle: 'powershell', welcome: 'Windows PowerShell\nCopyright (C) Microsoft Corporation.\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:ad005}}', points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 2400 },
    hints: [{ id: 'hint1', text: 'Open the ticket, then check share and NTFS permissions on the target resource.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'Effective access = share AND NTFS combined. Deny always wins.', cost: 10, penalty: -10 }, { id: 'hint3', text: 'Check nested group memberships and inheritance settings.', cost: 25, penalty: -25 }, { id: 'hint4', text: 'Fix the ACL, delegation, or ownership as appropriate.', cost: 50, penalty: -50 }],
    lore: { intro: 'Users are being denied access to files and resources they should be able to reach. As Domain Admin, untangle the permission conflicts.', scenario: 'Windows permissions combine share ACLs and NTFS ACLs. Effective access is the most restrictive combination. Deny ACEs, inheritance, nested groups, delegation scope, and file ownership can all cause unexpected Access Denied errors.', outro: 'Permission issue resolved. Users can now access the resources they need.' },
    phases: [{ id: 'investigate', name: 'Investigation', requiredFlags: [], unlocks: ['diagnose'], locked: false }, { id: 'diagnose', name: 'Diagnosis', requiredFlags: [], unlocks: ['repair'], locked: true }, { id: 'repair', name: 'Remediation', requiredFlags: [], unlocks: ['verify'], locked: true }, { id: 'verify', name: 'Verification', requiredFlags: ['fixed'], unlocks: [], locked: true }],

    commands: {
        'get-acl': function(args, term, engine) {
            var gate = AD005Config._requireScenario(engine); if (gate) return gate;
            var s = AD005Config._getScenario(engine); var path = args.join(' ').toLowerCase();
            if (s.id === 'share_vs_ntfs') return '\nPath: \\\\FILESERVER01\\Projects\n\nAccess Rules:\n  Finance Staff    Allow    Modify\n  All Staff        Allow    Read\n  Finance-Temps    DENY     Read          <-- EXPLICIT DENY\n  Administrators   Allow    FullControl\n\nNote: gkim is member of Finance-Temps. Deny overrides Allow.\n';
            if (s.id === 'inherited_override') return '\nPath: \\\\FILESERVER01\\HR\\Confidential\n\nInheritance: ENABLED (inherited from parent)\n\nAccess Rules:\n  HR Managers      Allow    FullControl   (Explicit)\n  All Staff        Allow    Read          (INHERITED from HR folder)\n  Administrators   Allow    FullControl   (Inherited)\n\nWARNING: "All Staff: Read" is inherited and grants access to non-HR users.\n';
            if (s.id === 'nested_group_deny') return '\nPath: \\\\FILESERVER01\\IT-Tools\n\nAccess Rules:\n  IT Staff            Allow    Modify\n  Restricted-Write    DENY     Write        <-- EXPLICIT DENY\n  Administrators      Allow    FullControl\n\nNote: mwebb is in Server Operators -> Restricted-Write chain.\n';
            if (s.id === 'ownership_terminated') return '\nPath: \\\\FILESERVER01\\Finance\\Budget_2026.xlsx\n\nOwner: HEXWORTH\\fdesouza (ACCOUNT DISABLED)\n\nAccess Rules:\n  CREATOR OWNER    Allow    FullControl   (only applies to fdesouza)\n  Finance Staff    Allow    Read\n  Administrators   Allow    FullControl\n';
            return '\nGet-Acl : Specify a file or folder path.\n';
        },
        'get-smbshareaccess': function(args, term, engine) {
            var gate = AD005Config._requireScenario(engine); if (gate) return gate;
            return '\nShare: Projects\n  Everyone          Allow    Read\n\nShare: HR\n  HR Staff          Allow    Change\n  Administrators    Allow    Full\n\nShare: IT-Tools\n  IT Staff          Allow    Change\n  Administrators    Allow    Full\n\nShare: Finance\n  Finance Staff     Allow    Change\n  Administrators    Allow    Full\n';
        },
        icacls: function(args, term, engine) {
            var gate = AD005Config._requireScenario(engine); if (gate) return gate;
            var lower = args.join(' ').toLowerCase(); var s = AD005Config._getScenario(engine);
            if (lower.includes('/remove:d') && lower.includes('finance-temps') && s.id === 'share_vs_ntfs') {
                engine.state._shareNtfsFixed = true; engine.save(); engine.notify('Deny ACE removed for Finance-Temps. gkim can now access Projects.', 'success'); AD005Config._checkFix(engine);
                return '\nprocessed file: \\\\FILESERVER01\\Projects\nSuccessfully processed 1 files; Failed processing 0 files\n';
            }
            if (lower.includes('/inheritance:d') && lower.includes('confidential') && s.id === 'inherited_override') {
                engine.state._inheritFixed = true; engine.save(); engine.notify('Inheritance disabled on Confidential folder. Only HR Managers retain access.', 'success'); AD005Config._checkFix(engine);
                return '\nprocessed file: \\\\FILESERVER01\\HR\\Confidential\nInheritance disabled. Inherited ACEs converted to explicit (remove unwanted ones manually).\n';
            }
            if (lower.includes('/remove:d') && lower.includes('restricted-write') && s.id === 'nested_group_deny') {
                engine.state._nestedDenyFixed = true; engine.save(); engine.notify('Deny Write ACE removed for Restricted-Write. mwebb can now modify IT-Tools.', 'success'); AD005Config._checkFix(engine);
                return '\nprocessed file: \\\\FILESERVER01\\IT-Tools\nSuccessfully processed 1 files\n';
            }
            if (lower.includes('/grant') && lower.includes('finance staff') && s.id === 'ownership_terminated') {
                engine.state._ownershipFixed = true; engine.save(); engine.notify('Finance Staff granted Modify. Budget spreadsheet is now editable.', 'success'); AD005Config._checkFix(engine);
                return '\nprocessed file: \\\\FILESERVER01\\Finance\\Budget_2026.xlsx\nSuccessfully processed 1 files\n';
            }
            return '\nicacls : Specify path and operation (/grant, /remove, /inheritance:d, etc.)\n';
        },
        takeown: function(args, term, engine) {
            var gate = AD005Config._requireScenario(engine); if (gate) return gate;
            var lower = args.join(' ').toLowerCase();
            if (lower.includes('budget') && lower.includes('/a')) {
                return '\nSUCCESS: The file (or folder): "\\\\FILESERVER01\\Finance\\Budget_2026.xlsx"\nnow owned by the administrators group.\n';
            }
            return '\nTAKEOWN /F <filename> [/A]\n/A — Give ownership to Administrators group.\n';
        },
        dsacls: function(args, term, engine) {
            var gate = AD005Config._requireScenario(engine); if (gate) return gate;
            var lower = args.join(' ').toLowerCase(); var s = AD005Config._getScenario(engine);
            if (s.id === 'delegation_fail' && (lower.includes('ou=hr') || lower.includes('ou=marketing')) && lower.includes('reset')) {
                engine.state._delegationFixed = true; engine.save(); engine.notify('Password reset delegation applied to correct OUs. Help desk can now reset passwords.', 'success'); AD005Config._checkFix(engine);
                return '\nSuccessfully added delegation:\n  "Help Desk" — Reset Password on OU=' + (lower.includes('ou=hr') ? 'HR' : 'Marketing') + '\n';
            }
            return '\ndsacls : Specify OU path and delegation.\n';
        },
        'get-adprincipalgroupmembership': function(args, term, engine) {
            var gate = AD005Config._requireScenario(engine); if (gate) return gate;
            var target = args[0] ? args[0].toLowerCase() : '';
            if (target === 'mwebb') return '\nDomain Users\nDomain Admins\nIT Staff\nServer Operators\n  -> Restricted-Write (nested via Server Operators)\n';
            if (target === 'gkim') return '\nDomain Users\nFinance Staff\nAll Staff\nFinance-Temps    <-- Recently added\n';
            return '\nGet-ADPrincipalGroupMembership : Specify -Identity <username>.\n';
        },
        whoami: function() { return 'HEXWORTH\\Administrator'; },
        hostname: function() { return 'DC01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; }
    },

    onAppLaunch: function(iconDef, engine) {
        if (iconDef.app === 'event_viewer' && !engine.state._scenarioSelected) { engine.notify('Open Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': AD005Config._openTicket(iconDef, engine); break;
            case 'event_viewer': AD005Config._openEV(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset lab?')) engine.resetLab(); break;
        }
    },

    _openTicket: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'tc005'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        AD005Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) { var s = AD005Config._getScenario(engine); c.innerHTML = '<div style="color:#8b5cf6; font-weight:bold; font-size:1rem; margin-bottom:16px;">INCIDENT #INC-' + (4300 + engine.state._scenarioId) + '</div><div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + AD005Config._escHtml(s.ticketSubject) + '</div></div><div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + AD005Config._escHtml(s.ticketDetail) + '</div></div><div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(139,92,246,0.08); border:1px solid rgba(139,92,246,0.25); border-radius:4px; padding:12px; line-height:1.6; color:#c4b5fd;">' + AD005Config._escHtml(s.ticketExtra) + '</div></div><div style="color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div>'; }
        else {
            var previews = ['Can browse folder but Access Denied on files', 'Confidential folder accessible to wrong users', 'IT admin denied despite being in correct group', 'Help desk cannot reset passwords — delegation wrong', 'Critical file owned by terminated employee'];
            var h = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#8b5cf6; font-weight:bold; font-size:1.1rem;">PERMISSION DENIED — ACCESS ISSUES</div></div>';
            AD005Config._scenarios.forEach(function(s, i) { h += '<button class="sb" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; cursor:pointer; font-family:Consolas,monospace;"><span style="color:#8b5cf6; font-weight:bold;">INC-' + (4300+i) + '</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>'; });
            h += '<div style="text-align:center; padding-top:16px;"><button id="rb" style="padding:10px 28px; background:#8b5cf6; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
            c.innerHTML = h;
            c.querySelectorAll('.sb').forEach(function(b) { b.addEventListener('click', function() { AD005Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); AD005Config._openTicket(iconDef, engine); }); });
            document.getElementById('rb').addEventListener('click', function() { AD005Config._applyScenario(engine, Math.floor(Math.random()*5)); AD005Config._openTicket(iconDef, engine); });
        }
    },

    _openEV: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.style.cssText = 'display:flex; flex-direction:column; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Event Viewer', 'EVT', c);
        var s = AD005Config._getScenario(engine); var logs = s ? (AD005Config._eventLogs[s.id] || []) : [];
        var h = '<div style="padding:10px 16px; border-bottom:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2);"><span style="color:#8b5cf6; font-weight:bold;">Security Audit Log — Object Access</span></div><div style="flex:1; overflow-y:auto;">';
        logs.forEach(function(e) { h += '<div style="border-bottom:1px solid rgba(255,255,255,0.04); cursor:pointer;" onclick="this.querySelector(\'.d\').style.display=this.querySelector(\'.d\').style.display===\'none\'?\'block\':\'none\'"><div style="display:flex; padding:6px 12px;"><span style="flex:1.5; color:#888; font-size:0.75rem;">' + e.time.replace('T',' ').substring(0,19) + '</span><span style="flex:0.5; color:#e74c3c; font-weight:bold;">' + e.eventId + '</span><span style="flex:3; font-size:0.75rem;">' + e.desc + '</span></div><div class="d" style="display:none; background:rgba(0,0,0,0.3); border-left:3px solid #e74c3c; padding:10px 16px; font-size:0.75rem; white-space:pre-wrap; color:#aaa;">' + e.detail + '</div></div>'; });
        h += '</div>'; c.innerHTML = h;
    }
};
