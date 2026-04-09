/* ============================================================
   DISPATCH LAB — Box AD-004: New Hire Setup
   Active Directory New Employee Provisioning
   A+ Core 2 & Security+ — 5 scenarios
   ============================================================ */

var AD004Config = {
    title: 'New Hire Setup',
    subtitle: 'AD New Employee Provisioning — A+ / Security+',
    difficulty: 'Intermediate',
    accent: '#8b5cf6',
    storageKey: 'hexworth_lab_ad004',
    registryId: 'ad004-new-hire',
    trackerKey: 'lab_ad004',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the new hire provisioning request to understand what is failing.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check the user account in AD', tip: 'Open ADUC or use Get-ADUser to verify account location, groups, and attributes.', trigger: { event: 'window_open', match: { type: 'aduc' }, alt: [{ event: 'command', match: { cmd: 'contains:Get-ADUser' } }] } },
            { title: 'Identify the provisioning issue', tip: 'Compare expected vs actual: OU, groups, home drive, mailbox, MFA status.', trigger: { event: 'command', match: { cmd: 'contains:Get-AD' } } },
            { title: 'Fix the issue', tip: 'Move user to correct OU, add missing groups, fix DFS path, or resolve the hybrid/MFA issue.', trigger: { event: 'command', match: { cmd: 'contains:Move-ADObject' }, alt: [{ event: 'command', match: { cmd: 'contains:Add-ADGroupMember' } }, { event: 'command', match: { cmd: 'contains:Set-ADUser' } }] } },
            { title: 'Verify and capture the flag', tip: 'Confirm the new hire can log in with proper access. Flag appears after fix.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'A+ Core 2 / Security+',
        mappings: [
            { flagId: 'fixed', objective: '1.6', description: 'Configure Microsoft Windows networking features', skill: 'AD Account Provisioning and OU Management' },
            { flagId: 'fixed', objective: '3.8', description: 'Implement identity and account management controls', skill: 'Security Group Membership and Permissions' },
            { flagId: 'fixed', objective: '2.4', description: 'Implement and maintain access controls', skill: 'Home Drive Mapping and DFS Configuration' }
        ]
    },

    _newHire: { name: 'Jordan Martinez', username: 'jmartinez', expectedOU: 'Marketing', actualOU: 'NewUsers', title: 'Digital Marketing Specialist', manager: 'rhuang', startDate: '2026-03-29', email: 'jmartinez@hexworth.local' },

    _domainUsers: [
        { name: 'Jordan Martinez', username: 'jmartinez', ou: 'NewUsers', title: 'Digital Marketing Specialist', memberOf: ['Domain Users'], email: 'jmartinez@hexworth.local', passwordLastSet: '2026-03-28T14:00:00', homeDir: '' },
        { name: 'Alex Rodriguez', username: 'arodriguez', ou: 'IT', title: 'IT Manager', memberOf: ['Domain Admins', 'IT Staff'], email: 'arodriguez@hexworth.local', passwordLastSet: '2026-03-25T09:00:00', homeDir: 'H:\\' },
        { name: 'Rachel Huang', username: 'rhuang', ou: 'Marketing', title: 'Marketing Director', memberOf: ['Marketing Staff', 'Marketing Managers', 'All Staff', 'VPN Users'], email: 'rhuang@hexworth.local', passwordLastSet: '2026-03-15T09:00:00', homeDir: 'H:\\' },
        { name: 'Steve Evans', username: 'sevans', ou: 'Marketing', title: 'Content Manager', memberOf: ['Marketing Staff', 'All Staff', 'VPN Users', 'Creative Team'], email: 'sevans@hexworth.local', passwordLastSet: '2026-03-18T09:00:00', homeDir: 'H:\\' },
        { name: 'Dana Torres', username: 'dtorres', ou: 'IT', title: 'Help Desk Tech', memberOf: ['IT Staff', 'Help Desk'], email: 'dtorres@hexworth.local', passwordLastSet: '2026-03-20T09:00:00', homeDir: 'H:\\' }
    ],

    _expectedGroups: ['Marketing Staff', 'All Staff', 'VPN Users', 'Creative Team'],

    _scenarios: [
        {
            id: 'wrong_ou',
            name: 'Account Created in Wrong OU',
            ticketSubject: 'New hire Jordan Martinez not receiving Marketing group policies',
            ticketDetail: 'Jordan Martinez started today in Marketing. Their account was created but they are not receiving Marketing GPOs — no mapped drives, no department printers, wrong desktop wallpaper. Other Marketing users have all these settings. The account seems to exist but is not getting the right policies.',
            ticketExtra: 'IT Note: New accounts are created in the default "NewUsers" OU by the provisioning script. The script is supposed to move them to the correct department OU, but it appears the move step failed for this user. Jordan\'s account is in OU=NewUsers instead of OU=Marketing. GPOs linked to Marketing OU are not applying.',
            fixDescription: 'Move jmartinez from NewUsers OU to Marketing OU using Move-ADObject or ADUC drag-and-drop',
            stateOverrides: { _ouFixed: false }
        },
        {
            id: 'missing_groups',
            name: 'Missing Security Group Memberships',
            ticketSubject: 'New hire cannot access Marketing shared drive or VPN',
            ticketDetail: 'Jordan Martinez in Marketing can log in but has no access to the Marketing shared drive (\\\\FILESERVER01\\Marketing), cannot connect to VPN, and is not in the Creative Team group for Adobe license assignment. Their manager Rachel Huang confirmed these are all standard for Marketing hires.',
            ticketExtra: 'IT Note: Jordan is only a member of "Domain Users". Standard Marketing membership should include: Marketing Staff, All Staff, VPN Users, Creative Team. The provisioning script failed to add group memberships. Compare jmartinez\'s groups vs sevans (another Marketing user) to see what is missing.',
            fixDescription: 'Add jmartinez to Marketing Staff, All Staff, VPN Users, and Creative Team groups',
            stateOverrides: { _groupsFixed: false }
        },
        {
            id: 'home_drive',
            name: 'Home Drive Not Mapping — DFS Path Wrong',
            ticketSubject: 'New hire H: drive shows "network path not found" at login',
            ticketDetail: 'Jordan Martinez gets an error at login: "Could not reconnect H: to \\\\FILESERV01\\Users\\jmartinez. Network path not found." Other users\' home drives work fine. Jordan is supposed to have a home directory on the file server like everyone else.',
            ticketExtra: 'IT Note: The home directory path in AD is set to \\\\FILESERV01\\Users\\jmartinez (typo — missing ER, should be FILESERVER01). Also, the folder was never created on the file server. Two fixes needed: (1) correct the path to \\\\FILESERVER01\\Users\\jmartinez, (2) create the folder with proper NTFS permissions.',
            fixDescription: 'Fix the home directory path in AD and create the folder on the file server',
            stateOverrides: { _homeDriveFixed: false }
        },
        {
            id: 'mailbox_fail',
            name: 'Email Mailbox Not Provisioning — Hybrid Exchange',
            ticketSubject: 'New hire has no email — Outlook shows "cannot open mailbox"',
            ticketDetail: 'Jordan Martinez cannot send or receive email. Outlook shows "Cannot open your default e-mail folders." The mailbox was supposed to be provisioned in the hybrid Exchange environment when the AD account was created. Other new hires in the past few months had their mailboxes created automatically.',
            ticketExtra: 'IT Note: In the hybrid Exchange environment, mailboxes are created by the Enable-RemoteMailbox cmdlet after account creation. The provisioning script encountered an error because jmartinez\'s UPN suffix is "@hexworth.local" instead of "@hexworth.com". The remote routing address needs the .com domain. Fix: Set the UPN to jmartinez@hexworth.com, then run Enable-RemoteMailbox.',
            fixDescription: 'Fix UPN suffix to @hexworth.com and run Enable-RemoteMailbox for jmartinez',
            stateOverrides: { _mailboxFixed: false }
        },
        {
            id: 'mfa_blocked',
            name: 'MFA Enrollment Failing — Conditional Access Blocking',
            ticketSubject: 'New hire cannot complete MFA setup — gets "access blocked" error',
            ticketDetail: 'Jordan Martinez is trying to enroll in MFA (required for all employees) but keeps getting an "Access has been blocked" error when trying to register their authenticator app. They can log into their workstation but cannot access any cloud resources or complete the MFA registration process.',
            ticketExtra: 'IT Note: A conditional access policy "Require MFA for All Users" is blocking the MFA registration page because it already requires MFA — creating a chicken-and-egg problem. New users need to be temporarily added to the "MFA-Excluded-NewHires" group so they can complete enrollment, then removed from the exclusion group after enrollment is done.',
            fixDescription: 'Add jmartinez to MFA-Excluded-NewHires group temporarily, complete enrollment, then remove from group',
            stateOverrides: { _mfaFixed: false }
        }
    ],

    _eventLogs: {
        wrong_ou: [
            { id: 1, time: '2026-03-28T14:00:00', eventId: 4720, source: 'DC01', username: 'arodriguez', category: 'Account Mgmt', desc: 'A user account was created.', detail: 'New Account: jmartinez\nCreated in: OU=NewUsers,DC=hexworth,DC=local\nCreated by: HEXWORTH\\arodriguez\nNote: Provisioning script target was OU=Marketing but move step returned error 0x80072030 (no such object in directory).' },
            { id: 2, time: '2026-03-29T08:00:00', eventId: 1085, source: 'DC01', username: 'jmartinez', category: 'Group Policy', desc: 'GPO "Drive Mapping - Marketing" not applied — user not in Marketing OU.', detail: 'User: jmartinez\nCurrent OU: NewUsers\nGPOs linked to Marketing OU: Not applied\nReason: User object is in OU=NewUsers which has no department-specific GPOs.' }
        ],
        missing_groups: [
            { id: 1, time: '2026-03-28T14:00:05', eventId: 4728, source: 'DC01', username: 'arodriguez', category: 'Account Mgmt', desc: 'Member added to group "Domain Users" (automatic).', detail: 'Account: jmartinez\nGroup: Domain Users\nNote: Only default group added. Provisioning script group-add step failed with: "Group Marketing Staff not found in target OU scope."' },
            { id: 2, time: '2026-03-29T08:05:00', eventId: 4656, source: 'FILESERVER01', username: 'jmartinez', category: 'Object Access', desc: 'Access denied to \\\\FILESERVER01\\Marketing.', detail: 'User: jmartinez\nResource: \\\\FILESERVER01\\Marketing\nResult: Access Denied\nReason: User not member of "Marketing Staff" security group.' }
        ],
        home_drive: [
            { id: 1, time: '2026-03-29T08:01:00', eventId: 1502, source: 'DESK-201', username: 'jmartinez', category: 'Drive Mapping', desc: 'Failed to map network drive H: — network path not found.', detail: 'Drive: H:\nTarget: \\\\FILESERV01\\Users\\jmartinez\nError: 0x80070035 — Network path not found\nNote: Server name is "FILESERV01" but correct name is "FILESERVER01" (typo in AD homeDirectory attribute).' }
        ],
        mailbox_fail: [
            { id: 1, time: '2026-03-28T14:05:00', eventId: 1000, source: 'Exchange', username: 'SYSTEM', category: 'Mail Flow', desc: 'Enable-RemoteMailbox failed for jmartinez.', detail: 'Error: The UPN suffix "@hexworth.local" is not a verified domain in Azure AD.\nRequired: UPN must use "@hexworth.com" for hybrid routing.\nAccount UPN: jmartinez@hexworth.local\nExpected UPN: jmartinez@hexworth.com' }
        ],
        mfa_blocked: [
            { id: 1, time: '2026-03-29T08:30:00', eventId: 4625, source: 'AzureAD', username: 'jmartinez', category: 'Logon', desc: 'Sign-in blocked by conditional access policy.', detail: 'User: jmartinez@hexworth.com\nPolicy: "Require MFA for All Users"\nResult: Blocked — user has not enrolled in MFA\nGrant Controls Required: MFA\nUser MFA Status: Not Enrolled\nNote: User cannot enroll because enrollment page also requires MFA. Add to MFA-Excluded-NewHires group.' }
        ]
    },

    _defaultHints: [
        { id: 'hint1', text: 'Open the ticket, then check the new hire account in ADUC or with Get-ADUser.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Compare the new hire to an existing Marketing user to find differences.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Check OU, group memberships, home directory path, UPN, and MFA status.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Each scenario requires one specific fix: move OU, add groups, fix path, fix UPN, or adjust CA exclusion.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        wrong_ou: [
            { id: 'hint1', text: 'Run Get-ADUser jmartinez -Properties * and check the DistinguishedName — what OU is the user in?', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The user is in OU=NewUsers instead of OU=Marketing. Marketing GPOs only apply to the Marketing OU.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Use Move-ADObject to move the user: Move-ADObject -Identity "CN=Jordan Martinez,OU=NewUsers,DC=hexworth,DC=local" -TargetPath "OU=Marketing,DC=hexworth,DC=local"', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After moving, run gpupdate /force on the user workstation. Marketing GPOs will now apply.', cost: 50, penalty: -50 }
        ],
        missing_groups: [
            { id: 'hint1', text: 'Run Get-ADUser jmartinez -Properties MemberOf to see current groups.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Compare to sevans: Marketing Staff, All Staff, VPN Users, Creative Team. jmartinez only has Domain Users.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Add all four groups: Add-ADGroupMember -Identity "Marketing Staff" -Members jmartinez (repeat for each).', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Full fix: Add to all four groups. Access to share drive, VPN, and Adobe licenses will immediately work.', cost: 50, penalty: -50 }
        ],
        home_drive: [
            { id: 'hint1', text: 'Check the user home directory attribute: Get-ADUser jmartinez -Properties HomeDirectory', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The path is \\\\FILESERV01\\... but the server is actually FILESERVER01. There is a typo.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Fix: Set-ADUser jmartinez -HomeDirectory "\\\\FILESERVER01\\Users\\jmartinez" -HomeDrive "H:"', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Two fixes: correct the AD path and create the folder on the server. Use New-Item for the folder.', cost: 50, penalty: -50 }
        ],
        mailbox_fail: [
            { id: 'hint1', text: 'Check the user UPN: Get-ADUser jmartinez -Properties UserPrincipalName', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'UPN is jmartinez@hexworth.local but needs to be @hexworth.com for hybrid Exchange routing.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Fix UPN: Set-ADUser jmartinez -UserPrincipalName "jmartinez@hexworth.com"', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After fixing UPN, run Enable-RemoteMailbox -Identity jmartinez -RemoteRoutingAddress "jmartinez@hexworth.mail.onmicrosoft.com"', cost: 50, penalty: -50 }
        ],
        mfa_blocked: [
            { id: 'hint1', text: 'The user cannot register for MFA because MFA is already required. This is a conditional access catch-22.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'There is an "MFA-Excluded-NewHires" group that bypasses the CA policy temporarily for enrollment.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Add to exclusion: Add-ADGroupMember -Identity "MFA-Excluded-NewHires" -Members jmartinez', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After enrollment, remove from exclusion group: Remove-ADGroupMember -Identity "MFA-Excluded-NewHires" -Members jmartinez', cost: 50, penalty: -50 }
        ]
    },

    _ensureScenario: function(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !AD004Config._flagRestored) { AD004Config._flagRestored = true; var s = AD004Config._scenarios[engine.state._scenarioId]; if (s) AD004Config.hints = AD004Config._scenarioHints[s.id] || AD004Config._defaultHints; } return true; },
    _applyScenario: function(engine, idx) { engine.state._scenarioId = idx; engine.state._scenarioSelected = true; engine.state._ouFixed = false; engine.state._groupsFixed = false; engine.state._homeDriveFixed = false; engine.state._mailboxFixed = false; engine.state._mfaFixed = false; engine.state._labComplete = false; engine.state._flagRevealed = false; AD004Config._flagRestored = true; AD004Config.hints = AD004Config._scenarioHints[AD004Config._scenarios[idx].id] || AD004Config._defaultHints; engine.save(); },
    _getScenario: function(engine) { return engine.state._scenarioId != null ? AD004Config._scenarios[engine.state._scenarioId] : null; },
    _requireScenario: function(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket. Open Help Desk Ticket first.\n'; },
    _escHtml: function(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    _checkFix: function(engine) {
        var s = AD004Config._getScenario(engine); if (!s || engine.state._labComplete) return;
        var done = false;
        if (s.id === 'wrong_ou') done = engine.state._ouFixed;
        if (s.id === 'missing_groups') done = engine.state._groupsFixed;
        if (s.id === 'home_drive') done = engine.state._homeDriveFixed;
        if (s.id === 'mailbox_fail') done = engine.state._mailboxFixed;
        if (s.id === 'mfa_blocked') done = engine.state._mfaFixed;
        if (done) { engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save(); engine.requestFlagText(s.id).then(function(f) { engine.notify(f ? 'New hire provisioning issue fixed. Check ADUC for closure token.' : 'Fixed. Flag pending.', 'success'); }).catch(function() { engine.notify('Fixed. Flag pending.', 'success'); }); }
    },

    boot: { biosLines: ['Dell PowerEdge R750 — BIOS v2.12.1', 'Intel Xeon Gold 5315Y x2', 'Memory: 65536 MB OK', 'RAID-10 OK', 'Loading Windows Boot Manager...'], grubEntries: ['Windows Server 2022 Standard (DC01)'], loginUser: 'Administrator' },
    desktop: { icons: [{ id: 'powershell', label: 'PowerShell', icon: 'PS', app: 'terminal' }, { id: 'aduc', label: 'AD Users &\nComputers', icon: 'AD', app: 'aduc' }, { id: 'event_viewer', label: 'Event\nViewer', icon: 'EVT', app: 'event_viewer' }, { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' }, { id: 'notes', label: 'Notepad', icon: 'TXT', app: 'notes' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }] },
    terminal: { user: 'Administrator', hostname: 'DC01', startDir: 'C:\\Windows\\System32', promptStyle: 'powershell', welcome: 'Windows PowerShell\nCopyright (C) Microsoft Corporation.\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:ad004}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 2400 },
    hints: [{ id: 'hint1', text: 'Read the ticket and check the new hire account in AD.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'Compare jmartinez to an existing Marketing user like sevans.', cost: 10, penalty: -10 }, { id: 'hint3', text: 'Look for OU, groups, home drive path, UPN, and MFA issues.', cost: 25, penalty: -25 }, { id: 'hint4', text: 'Apply the specific fix for the provisioning failure.', cost: 50, penalty: -50 }],
    lore: { intro: 'A new hire is starting today and their account is not fully provisioned. As Domain Admin, diagnose what went wrong and fix it so the employee can work on day one.', scenario: 'New employee provisioning involves many steps: OU placement, group memberships, home drives, mailboxes, and MFA enrollment. Any step can fail silently.', outro: 'New hire provisioning issue resolved. Employee can now access all required resources.' },
    phases: [{ id: 'investigate', name: 'Investigation', requiredFlags: [], unlocks: ['diagnose'], locked: false }, { id: 'diagnose', name: 'Diagnosis', requiredFlags: [], unlocks: ['repair'], locked: true }, { id: 'repair', name: 'Remediation', requiredFlags: [], unlocks: ['verify'], locked: true }, { id: 'verify', name: 'Verification', requiredFlags: ['fixed'], unlocks: [], locked: true }],

    commands: {
        'get-aduser': function(args, term, engine) {
            var gate = AD004Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' '), lower = joined.toLowerCase();
            var target = args[0] && !args[0].startsWith('-') ? args[0].toLowerCase() : null;
            var im = joined.match(/-identity\s+(\S+)/i); if (im) target = im[1].toLowerCase();
            if (target) {
                var f = AD004Config._domainUsers.filter(function(u) { return u.username === target; })[0];
                if (!f) return '\nGet-ADUser : Cannot find: ' + target + '\n';
                var s = AD004Config._getScenario(engine);
                var ou = f.ou; if (target === 'jmartinez' && s && s.id === 'wrong_ou' && !engine.state._ouFixed) ou = 'NewUsers';
                else if (target === 'jmartinez' && s && s.id === 'wrong_ou' && engine.state._ouFixed) ou = 'Marketing';
                var groups = f.memberOf;
                if (target === 'jmartinez' && s && s.id === 'missing_groups' && engine.state._groupsFixed) groups = ['Domain Users', 'Marketing Staff', 'All Staff', 'VPN Users', 'Creative Team'];
                var homeDir = f.homeDir;
                if (target === 'jmartinez' && s && s.id === 'home_drive' && !engine.state._homeDriveFixed) homeDir = '\\\\FILESERV01\\Users\\jmartinez (ERROR: path not found)';
                else if (target === 'jmartinez' && s && s.id === 'home_drive' && engine.state._homeDriveFixed) homeDir = '\\\\FILESERVER01\\Users\\jmartinez';
                var upn = f.email;
                if (target === 'jmartinez' && s && s.id === 'mailbox_fail' && !engine.state._mailboxFixed) upn = 'jmartinez@hexworth.local (ERROR: not a verified Azure AD domain)';
                return '\nDistinguishedName : CN=' + f.name + ',OU=' + ou + ',DC=hexworth,DC=local\nName              : ' + f.name + '\nSamAccountName    : ' + f.username + '\nOU                : ' + ou + '\nTitle             : ' + f.title + '\nMemberOf          : ' + groups.join(', ') + '\nHomeDirectory     : ' + homeDir + '\nUserPrincipalName : ' + upn + '\nPasswordLastSet   : ' + f.passwordLastSet.replace('T',' ').substring(0,19) + '\n';
            }
            if (lower.includes('-filter')) { var out = '\n'; AD004Config._domainUsers.forEach(function(u) { out += u.username.padEnd(16) + u.name.padEnd(22) + u.ou + '\n'; }); return out; }
            return '\nUsage: Get-ADUser <username> [-Properties *]\n';
        },

        'move-adobject': function(args, term, engine) {
            var gate = AD004Config._requireScenario(engine); if (gate) return gate;
            var lower = args.join(' ').toLowerCase();
            if (lower.includes('jmartinez') && lower.includes('marketing')) {
                engine.state._ouFixed = true; engine.save();
                engine.notify('Jordan Martinez moved to Marketing OU. GPOs will apply at next refresh.', 'success');
                AD004Config._checkFix(engine);
                return '\n(no output — object moved successfully)\n';
            }
            return '\nMove-ADObject : Specify -Identity and -TargetPath.\n';
        },

        'add-adgroupmember': function(args, term, engine) {
            var gate = AD004Config._requireScenario(engine); if (gate) return gate;
            var lower = args.join(' ').toLowerCase();
            if (lower.includes('jmartinez') && (lower.includes('marketing') || lower.includes('all staff') || lower.includes('vpn') || lower.includes('creative'))) {
                if (!engine.state._groupAddCount) engine.state._groupAddCount = 0;
                engine.state._groupAddCount++;
                if (engine.state._groupAddCount >= 4 || lower.includes('marketing staff') && lower.includes('all staff')) {
                    engine.state._groupsFixed = true; engine.save();
                    engine.notify('All required groups added to jmartinez.', 'success');
                    AD004Config._checkFix(engine);
                }
                engine.save();
                return '\n(no output — member added successfully)\n';
            }
            return '\nAdd-ADGroupMember : Specify -Identity <group> -Members <user>.\n';
        },

        'set-aduser': function(args, term, engine) {
            var gate = AD004Config._requireScenario(engine); if (gate) return gate;
            var lower = args.join(' ').toLowerCase();
            if (lower.includes('jmartinez') && lower.includes('homedirectory') && lower.includes('fileserver01')) {
                engine.state._homeDriveFixed = true; engine.save();
                engine.notify('Home directory path corrected for jmartinez.', 'success');
                AD004Config._checkFix(engine);
                return '\n(no output — HomeDirectory updated)\n';
            }
            if (lower.includes('jmartinez') && lower.includes('userprincipalname') && lower.includes('hexworth.com')) {
                engine.state._mailboxFixed = true; engine.save();
                engine.notify('UPN updated to @hexworth.com. Run Enable-RemoteMailbox to provision the mailbox.', 'success');
                AD004Config._checkFix(engine);
                return '\n(no output — UPN updated to jmartinez@hexworth.com)\n';
            }
            return '\nSet-ADUser : Specify -Identity and property to change.\n';
        },

        'enable-remotemailbox': function(args, term, engine) {
            var gate = AD004Config._requireScenario(engine); if (gate) return gate;
            var s = AD004Config._getScenario(engine);
            if (s && s.id === 'mailbox_fail' && engine.state._mailboxFixed) {
                return '\nRemote mailbox enabled for jmartinez.\nRouting address: jmartinez@hexworth.mail.onmicrosoft.com\nMailbox provisioning will complete within 5 minutes.\n';
            }
            if (s && s.id === 'mailbox_fail') return '\nEnable-RemoteMailbox : Failed. UPN suffix "@hexworth.local" is not a verified domain.\nFix the UPN first with Set-ADUser.\n';
            return '\nEnable-RemoteMailbox : Specify -Identity <user>.\n';
        },

        'remove-adgroupmember': function(args, term, engine) {
            var lower = args.join(' ').toLowerCase();
            if (lower.includes('mfa-excluded') && lower.includes('jmartinez')) {
                return '\n(no output — jmartinez removed from MFA-Excluded-NewHires)\nConditional access MFA requirement is now enforced for this user.\n';
            }
            return '\nRemove-ADGroupMember : Specify -Identity <group> -Members <user>.\n';
        },

        whoami: function() { return 'HEXWORTH\\Administrator'; },
        hostname: function() { return 'DC01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; }
    },

    onAppLaunch: function(iconDef, engine) {
        if (['aduc','event_viewer'].indexOf(iconDef.app) !== -1 && !engine.state._scenarioSelected) { engine.notify('Open Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': AD004Config._openTicket(iconDef, engine); break;
            case 'event_viewer': AD004Config._openEV(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset lab?')) engine.resetLab(); break;
        }
    },

    _openTicket: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'tc004'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        AD004Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) { var s = AD004Config._getScenario(engine); c.innerHTML = '<div style="color:#8b5cf6; font-weight:bold; font-size:1rem; margin-bottom:16px;">INCIDENT #INC-' + (4200 + engine.state._scenarioId) + '</div><div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + AD004Config._escHtml(s.ticketSubject) + '</div></div><div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + AD004Config._escHtml(s.ticketDetail) + '</div></div><div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(139,92,246,0.08); border:1px solid rgba(139,92,246,0.25); border-radius:4px; padding:12px; line-height:1.6; color:#c4b5fd;">' + AD004Config._escHtml(s.ticketExtra) + '</div></div><div style="color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div>'; }
        else {
            var previews = ['Not receiving Marketing GPOs — wrong OU?', 'No access to share drive or VPN — missing groups', 'H: drive shows network path not found', 'Outlook cannot open mailbox — hybrid Exchange', 'MFA enrollment blocked by conditional access'];
            var h = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#8b5cf6; font-weight:bold; font-size:1.1rem;">NEW HIRE PROVISIONING ISSUES</div></div>';
            AD004Config._scenarios.forEach(function(s, i) { h += '<button class="sb" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; cursor:pointer; font-family:Consolas,monospace; font-size:0.8rem;"><span style="color:#8b5cf6; font-weight:bold;">INC-' + (4200+i) + '</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>'; });
            h += '<div style="text-align:center; padding-top:16px;"><button id="rb" style="padding:10px 28px; background:#8b5cf6; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
            c.innerHTML = h;
            c.querySelectorAll('.sb').forEach(function(b) { b.addEventListener('click', function() { AD004Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); AD004Config._openTicket(iconDef, engine); }); });
            document.getElementById('rb').addEventListener('click', function() { AD004Config._applyScenario(engine, Math.floor(Math.random()*5)); AD004Config._openTicket(iconDef, engine); });
        }
    },

    _openEV: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.style.cssText = 'display:flex; flex-direction:column; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Event Viewer', 'EVT', c);
        var s = AD004Config._getScenario(engine); var logs = s ? (AD004Config._eventLogs[s.id] || []) : [];
        var h = '<div style="padding:10px 16px; border-bottom:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2);"><span style="color:#8b5cf6; font-weight:bold;">Provisioning Event Log</span></div><div style="flex:1; overflow-y:auto;">';
        logs.forEach(function(e) { h += '<div style="border-bottom:1px solid rgba(255,255,255,0.04); cursor:pointer;" onclick="this.querySelector(\'.d\').style.display=this.querySelector(\'.d\').style.display===\'none\'?\'block\':\'none\'"><div style="display:flex; padding:6px 12px;"><span style="flex:1.5; color:#888; font-size:0.75rem;">' + e.time.replace('T',' ').substring(0,19) + '</span><span style="flex:0.5; color:#e67e22; font-weight:bold;">' + e.eventId + '</span><span style="flex:3; font-size:0.75rem;">' + e.desc + '</span></div><div class="d" style="display:none; background:rgba(0,0,0,0.3); border-left:3px solid #e67e22; padding:10px 16px; font-size:0.75rem; white-space:pre-wrap; color:#aaa;">' + e.detail + '</div></div>'; });
        h += '</div>'; c.innerHTML = h;
    }
};
