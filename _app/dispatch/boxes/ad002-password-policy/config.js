/* ============================================================
   DISPATCH LAB — Box AD-002: Password Policy Panic
   Active Directory Password Policy Troubleshooting
   A+ Core 2 (220-1102) & Security+ (SY0-701)
   5 scenarios: min age block, complexity fail, expired on
   vacation, fine-grained policy wrong GPO, SSPR agent down
   ============================================================ */

var AD002Config = {

    // ==========================================================
    // BOX METADATA
    // ==========================================================

    title: 'Password Policy Panic',
    subtitle: 'Active Directory Password Policy Troubleshooting — A+ / Security+',
    difficulty: 'Intermediate',
    accent: '#8b5cf6',
    storageKey: 'hexworth_lab_ad002',
    registryId: 'ad002-password-policy',
    trackerKey: 'lab_ad002',

    // ==========================================================
    // TUTORIAL MODE
    // ==========================================================

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Open the Help Desk Ticket',
                tip: 'Double-click the Help Desk Ticket icon to read the password complaint and identify which policy is causing the issue.',
                trigger: { event: 'window_open', match: { type: 'ticket' } }
            },
            {
                title: 'Check the password policy settings',
                tip: 'Open Group Policy Management or run Get-ADDefaultDomainPasswordPolicy to review current password requirements.',
                trigger: {
                    event: 'window_open',
                    match: { type: 'gpo_management' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:PasswordPolicy' } },
                        { event: 'command', match: { cmd: 'contains:Get-ADFineGrained' } }
                    ]
                }
            },
            {
                title: 'Investigate the affected user account',
                tip: 'Open AD Users & Computers or use Get-ADUser to check the user account status, password age, and group memberships.',
                trigger: {
                    event: 'window_open',
                    match: { type: 'aduc' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:Get-ADUser' } }
                    ]
                }
            },
            {
                title: 'Apply the fix',
                tip: 'Each scenario requires a different fix: adjust policy, reset password, fix GPO scope, or restart the SSPR agent service.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:Set-' },
                    alt: [
                        { event: 'window_open', match: { type: 'gpo_management' } },
                        { event: 'window_open', match: { type: 'service_manager' } },
                        { event: 'command', match: { cmd: 'contains:Restart-Service' } }
                    ]
                }
            },
            {
                title: 'Verify and capture the flag',
                tip: 'Confirm the user can now change their password or the policy is corrected. The flag appears after verification.',
                trigger: { event: 'flag_correct', match: { flagId: 'fixed' } }
            }
        ]
    },

    // ==========================================================
    // CERT OBJECTIVES
    // ==========================================================

    certObjectives: {
        certPath: 'A+ Core 2 / Security+',
        mappings: [
            { flagId: 'fixed', objective: '1.6', description: 'Given a scenario, configure Microsoft Windows networking features on a client/desktop', skill: 'Password Policy Configuration' },
            { flagId: 'fixed', objective: '3.8', description: 'Implement identity and account management controls', skill: 'Fine-Grained Password Policies' },
            { flagId: 'fixed', objective: '2.1', description: 'Summarize fundamental security concepts', skill: 'Password Complexity and Expiration Management' }
        ]
    },

    // ==========================================================
    // DOMAIN DATA MODEL
    // ==========================================================

    _domainUsers: [
        { name: 'Alex Rodriguez',    username: 'arodriguez',   ou: 'IT',        title: 'IT Manager',            status: 'active', lastLogon: '2026-03-28T08:12:00', passwordLastSet: '2026-03-25T09:00:00', accountCreated: '2019-03-01', memberOf: ['Domain Admins', 'IT Staff', 'VPN Users'], email: 'arodriguez@hexworth.local' },
        { name: 'Dana Torres',       username: 'dtorres',      ou: 'IT',        title: 'Help Desk Technician',  status: 'active', lastLogon: '2026-03-28T07:58:00', passwordLastSet: '2026-03-20T09:00:00', accountCreated: '2021-06-15', memberOf: ['IT Staff', 'Help Desk'], email: 'dtorres@hexworth.local' },
        { name: 'Marcus Webb',       username: 'mwebb',        ou: 'IT',        title: 'Systems Administrator', status: 'active', lastLogon: '2026-03-28T08:01:00', passwordLastSet: '2026-03-10T09:00:00', accountCreated: '2020-11-09', memberOf: ['Domain Admins', 'IT Staff', 'Server Operators'], email: 'mwebb@hexworth.local' },
        { name: 'Priya Patel',       username: 'ppatel',       ou: 'IT',        title: 'Network Engineer',      status: 'active', lastLogon: '2026-03-27T17:44:00', passwordLastSet: '2026-02-20T09:00:00', accountCreated: '2022-02-14', memberOf: ['IT Staff', 'Network Admins'], email: 'ppatel@hexworth.local' },
        { name: 'Susan Hall',        username: 'shall',        ou: 'HR',        title: 'HR Director',           status: 'active', lastLogon: '2026-03-28T08:30:00', passwordLastSet: '2026-03-01T09:00:00', accountCreated: '2018-05-01', memberOf: ['HR Staff', 'HR Managers', 'All Staff'], email: 'shall@hexworth.local' },
        { name: 'Tom Wright',        username: 'twright',      ou: 'HR',        title: 'HR Manager',            status: 'active', lastLogon: '2026-03-28T08:22:00', passwordLastSet: '2026-03-15T09:00:00', accountCreated: '2019-11-15', memberOf: ['HR Staff', 'HR Managers', 'All Staff'], email: 'twright@hexworth.local' },
        { name: 'Olivia Baker',      username: 'obaker',       ou: 'HR',        title: 'Recruiter',             status: 'active', lastLogon: '2026-03-27T15:11:00', passwordLastSet: '2026-03-27T10:00:00', accountCreated: '2023-08-21', memberOf: ['HR Staff', 'All Staff'], email: 'obaker@hexworth.local' },
        { name: 'Grace Kim',         username: 'gkim',         ou: 'Finance',   title: 'Senior Accountant',     status: 'active', lastLogon: '2026-03-28T07:50:00', passwordLastSet: '2026-01-02T09:00:00', accountCreated: '2019-10-07', memberOf: ['Finance Staff', 'All Staff'], email: 'gkim@hexworth.local' },
        { name: 'Harold Lewis',      username: 'hlewis',       ou: 'Finance',   title: 'Accountant',            status: 'active', lastLogon: '2026-03-28T07:55:00', passwordLastSet: '2025-12-28T09:00:00', accountCreated: '2021-04-12', memberOf: ['Finance Staff', 'All Staff'], email: 'hlewis@hexworth.local' },
        { name: 'Rachel Huang',      username: 'rhuang',       ou: 'Marketing', title: 'Marketing Director',    status: 'active', lastLogon: '2026-03-28T08:25:00', passwordLastSet: '2026-03-01T09:00:00', accountCreated: '2018-02-01', memberOf: ['Marketing Staff', 'Marketing Managers', 'All Staff'], email: 'rhuang@hexworth.local' },
        { name: 'Steve Evans',       username: 'sevans',       ou: 'Marketing', title: 'Content Manager',       status: 'active', lastLogon: '2026-03-28T08:20:00', passwordLastSet: '2026-03-18T09:00:00', accountCreated: '2020-06-01', memberOf: ['Marketing Staff', 'All Staff'], email: 'sevans@hexworth.local' },
        { name: 'David Kim',         username: 'dkim',         ou: 'Executives', title: 'CEO',                  status: 'active', lastLogon: '2026-03-28T07:30:00', passwordLastSet: '2026-03-01T09:00:00', accountCreated: '2014-01-01', memberOf: ['Executives', 'Domain Admins', 'All Staff'], email: 'dkim@hexworth.local' },
        { name: 'Elena Vasquez',     username: 'evasquez',     ou: 'Executives', title: 'CTO',                  status: 'active', lastLogon: '2026-03-28T07:35:00', passwordLastSet: '2026-03-05T09:00:00', accountCreated: '2015-03-01', memberOf: ['Executives', 'IT Staff', 'All Staff'], email: 'evasquez@hexworth.local' },
        { name: 'Nina Foster',       username: 'nfoster',      ou: 'HR',        title: 'HR Coordinator',        status: 'active', lastLogon: '2026-03-14T08:10:00', passwordLastSet: '2025-12-20T09:00:00', accountCreated: '2022-03-07', memberOf: ['HR Staff', 'All Staff'], email: 'nfoster@hexworth.local' },
        { name: 'James Park',        username: 'jpark',        ou: 'Finance',   title: 'Financial Analyst',     status: 'active', lastLogon: '2026-03-27T16:45:00', passwordLastSet: '2026-03-20T09:00:00', accountCreated: '2023-01-09', memberOf: ['Finance Staff', 'Finance-HighSec', 'All Staff'], email: 'jpark@hexworth.local' },
        { name: 'Web Portal Service', username: 'svc_webportal', ou: 'Service Accounts', title: 'Service Account', status: 'active', lastLogon: '2026-03-28T00:00:00', passwordLastSet: '2026-01-01T09:00:00', accountCreated: '2021-05-01', memberOf: ['Service Accounts', 'IIS_IUSRS'], email: 'svc_webportal@hexworth.local' },
        { name: 'SSPR Agent Service', username: 'svc_sspr',     ou: 'Service Accounts', title: 'Service Account', status: 'active', lastLogon: '2026-03-28T07:00:00', passwordLastSet: '2026-02-01T09:00:00', accountCreated: '2023-01-01', memberOf: ['Service Accounts'], email: 'svc_sspr@hexworth.local' }
    ],

    // ==========================================================
    // SCENARIOS
    // ==========================================================

    _scenarios: [
        {
            id: 'min_age',
            name: 'Minimum Password Age Blocking Change',
            ticketSubject: 'User cannot change password — system says "password cannot be changed at this time"',
            ticketDetail: 'Olivia Baker in HR just had her password reset by the help desk yesterday morning. Now she wants to change it to something she prefers, but the system gives an error: "You must wait before changing your password." She is frustrated and says she never had this issue before.',
            ticketExtra: 'IT Note: The Default Domain Policy has a minimum password age of 1 day. Olivia\'s password was last set yesterday at 10:00 AM. She cannot change it until that 24-hour window passes. Check if the minimum age is appropriate or if a temporary override is needed.',
            fixDescription: 'Reset password again with "User must change password at next logon" flag, or temporarily set min password age to 0 in GPO, then revert after user changes password',
            stateOverrides: { _minAgeFixed: false }
        },
        {
            id: 'complexity',
            name: 'Password Complexity Rejection',
            ticketSubject: 'New password keeps getting rejected — user says it meets all the rules',
            ticketDetail: 'Harold Lewis in Finance is trying to set a new password. He says he is using uppercase, lowercase, numbers, and symbols. But AD keeps rejecting it. He has tried five different passwords. He says the password is "Harold2026!" and doesn\'t understand why it fails.',
            ticketExtra: 'IT Note: Windows complexity requirements prohibit passwords that contain the user\'s display name or username. "Harold" is literally his first name and part of his sAMAccountName (hlewis). The password "Harold2026!" contains "Harold" and will always be rejected by the complexity filter.',
            fixDescription: 'Educate user on complexity rules (no display name/username in password), help them choose a compliant password',
            stateOverrides: { _complexityFixed: false }
        },
        {
            id: 'vacation_expired',
            name: 'Password Expired During Vacation',
            ticketSubject: 'User locked out after 2-week vacation — cannot log in at all',
            ticketDetail: 'Nina Foster from HR returned from a two-week vacation today. She cannot log in — the system says her password has expired. Her last password was set on December 20, 2025, and the maximum password age is 90 days. That means it expired around March 20, and she was out of office from March 14-28.',
            ticketExtra: 'IT Note: With maxPwdAge of 90 days, Nina\'s password expired March 20. She left March 14. She has no way to change it remotely because VPN also requires AD authentication. The account is not locked — just expired. An admin must reset her password.',
            fixDescription: 'Admin resets Nina\'s password in ADUC or via Set-ADAccountPassword, user logs in with temp password and sets new one',
            stateOverrides: { _vacationFixed: false }
        },
        {
            id: 'fgpp_wrong',
            name: 'Fine-Grained Password Policy Wrong Scope',
            ticketSubject: 'Finance user forced to use 20-character password — should be 12 minimum',
            ticketDetail: 'James Park in Finance says the system is requiring a 20-character password. The company standard is 12 characters minimum. James recently got added to a new security group "Finance-HighSec" for a project, and ever since then his password requirements changed. Other Finance users still have the 12-character minimum.',
            ticketExtra: 'IT Note: There is a Fine-Grained Password Policy (FGPP) called "HighSec-Policy" applied to the Finance-HighSec group with MinPasswordLength=20. James was added to this group for a data audit project, but the FGPP was not supposed to apply to regular analysts. Either remove James from the group or adjust the FGPP scope.',
            fixDescription: 'Remove James from Finance-HighSec group or adjust FGPP precedence/scope so it only applies to intended users',
            stateOverrides: { _fgppFixed: false }
        },
        {
            id: 'sspr_down',
            name: 'Self-Service Password Reset Portal Broken',
            ticketSubject: 'Password reset portal showing "Service Unavailable" — users cannot self-service reset',
            ticketDetail: 'Multiple users are reporting that the self-service password reset portal at https://sspr.hexworth.local is returning "503 Service Unavailable." This started about 2 hours ago. Help desk call volume has tripled because users who normally reset their own passwords cannot do so.',
            ticketExtra: 'IT Note: The SSPR portal depends on the "HexSSPRAgent" Windows service running on WEB01. Check the service status. The service account svc_sspr may have issues, or the service may have crashed. The SSPR agent connects to AD on port 636 (LDAPS) for password write-back.',
            fixDescription: 'Restart the HexSSPRAgent service on WEB01, verify LDAPS connectivity, confirm portal is responding',
            stateOverrides: { _ssprFixed: false }
        }
    ],

    // ==========================================================
    // EVENT LOG DATA
    // ==========================================================

    _eventLogs: {
        min_age: [
            { id: 1, time: '2026-03-27T10:00:15', eventId: 4723, source: '192.168.1.62', username: 'obaker', category: 'Account Mgmt', desc: 'An attempt was made to change an account password.', detail: 'Subject: HEXWORTH\\dtorres (Help Desk reset)\nTarget: HEXWORTH\\obaker\nResult: Success\nPassword was reset by administrator.' },
            { id: 2, time: '2026-03-28T08:15:22', eventId: 4723, source: '192.168.1.62', username: 'obaker', category: 'Account Mgmt', desc: 'An attempt was made to change an account password.', detail: 'Subject: HEXWORTH\\obaker\nTarget: HEXWORTH\\obaker\nResult: FAILURE\nStatus: 0xC000006C — Password restriction\nDetail: Minimum password age not met (1 day). Password was last set 2026-03-27 10:00 AM.' },
            { id: 3, time: '2026-03-28T08:18:44', eventId: 4723, source: '192.168.1.62', username: 'obaker', category: 'Account Mgmt', desc: 'An attempt was made to change an account password.', detail: 'Subject: HEXWORTH\\obaker\nTarget: HEXWORTH\\obaker\nResult: FAILURE\nStatus: 0xC000006C — Password restriction\nDetail: Minimum password age not met. Wait until 2026-03-28 10:00 AM.' },
            { id: 4, time: '2026-03-28T08:22:01', eventId: 4723, source: '192.168.1.62', username: 'obaker', category: 'Account Mgmt', desc: 'An attempt was made to change an account password.', detail: 'Subject: HEXWORTH\\obaker\nTarget: HEXWORTH\\obaker\nResult: FAILURE\nStatus: 0xC000006C — Password restriction' }
        ],
        complexity: [
            { id: 1, time: '2026-03-28T09:30:11', eventId: 4723, source: '192.168.1.44', username: 'hlewis', category: 'Account Mgmt', desc: 'An attempt was made to change an account password.', detail: 'Subject: HEXWORTH\\hlewis\nTarget: HEXWORTH\\hlewis\nResult: FAILURE\nStatus: 0xC000006C — Password does not meet complexity requirements\nAttempted password contains the user display name.' },
            { id: 2, time: '2026-03-28T09:32:45', eventId: 4723, source: '192.168.1.44', username: 'hlewis', category: 'Account Mgmt', desc: 'An attempt was made to change an account password.', detail: 'Subject: HEXWORTH\\hlewis\nTarget: HEXWORTH\\hlewis\nResult: FAILURE\nStatus: 0xC000006C — Password does not meet complexity requirements\nNote: Password cannot contain username or display name parts.' },
            { id: 3, time: '2026-03-28T09:35:10', eventId: 4723, source: '192.168.1.44', username: 'hlewis', category: 'Account Mgmt', desc: 'An attempt was made to change an account password.', detail: 'Subject: HEXWORTH\\hlewis\nResult: FAILURE\nStatus: 0xC000006C' },
            { id: 4, time: '2026-03-28T09:37:22', eventId: 4723, source: '192.168.1.44', username: 'hlewis', category: 'Account Mgmt', desc: 'An attempt was made to change an account password.', detail: 'Subject: HEXWORTH\\hlewis\nResult: FAILURE\nStatus: 0xC000006C' },
            { id: 5, time: '2026-03-28T09:40:55', eventId: 4723, source: '192.168.1.44', username: 'hlewis', category: 'Account Mgmt', desc: 'An attempt was made to change an account password.', detail: 'Subject: HEXWORTH\\hlewis\nResult: FAILURE\nStatus: 0xC000006C — Fifth failed attempt. User called help desk.' }
        ],
        vacation_expired: [
            { id: 1, time: '2026-03-20T00:00:01', eventId: 4740, source: 'DC01', username: 'nfoster', category: 'Account Mgmt', desc: 'Password has expired.', detail: 'Subject Account: HEXWORTH\\nfoster\nPassword Last Set: 2025-12-20 09:00\nMax Password Age: 90 days\nExpiration Date: 2026-03-20\nNote: User is marked as out of office (vacation 3/14-3/28).' },
            { id: 2, time: '2026-03-28T08:05:33', eventId: 4625, source: '192.168.1.73', username: 'nfoster', category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: The user account has an expired password.\nStatus: 0xC0000224\nWorkstation Name: DESK-073\nNote: User returning from vacation.' },
            { id: 3, time: '2026-03-28T08:06:11', eventId: 4625, source: '192.168.1.73', username: 'nfoster', category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Password expired.\nStatus: 0xC0000224\nUser attempted VPN first, then workstation.' },
            { id: 4, time: '2026-03-28T08:08:45', eventId: 4625, source: '192.168.1.73', username: 'nfoster', category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Password expired.\nStatus: 0xC0000224' }
        ],
        fgpp_wrong: [
            { id: 1, time: '2026-03-25T14:00:00', eventId: 4735, source: 'DC01', username: 'admin', category: 'Account Mgmt', desc: 'A security-enabled local group was changed.', detail: 'Group: Finance-HighSec\nMember Added: HEXWORTH\\jpark\nChanged By: HEXWORTH\\arodriguez\nNote: Added for data audit project access.' },
            { id: 2, time: '2026-03-28T09:15:22', eventId: 4723, source: '192.168.1.55', username: 'jpark', category: 'Account Mgmt', desc: 'An attempt was made to change an account password.', detail: 'Subject: HEXWORTH\\jpark\nResult: FAILURE\nStatus: 0xC000006C — Password too short\nPolicy Applied: HighSec-Policy (FGPP, precedence 10)\nRequired Length: 20 characters\nProvided Length: 14 characters' },
            { id: 3, time: '2026-03-28T09:18:44', eventId: 4723, source: '192.168.1.55', username: 'jpark', category: 'Account Mgmt', desc: 'An attempt was made to change an account password.', detail: 'Subject: HEXWORTH\\jpark\nResult: FAILURE\nStatus: 0xC000006C — Password too short\nFGPP: HighSec-Policy requires minimum 20 characters.' }
        ],
        sspr_down: [
            { id: 1, time: '2026-03-28T06:00:00', eventId: 7034, source: 'WEB01', username: 'SYSTEM', category: 'Service Control', desc: 'The HexSSPRAgent service terminated unexpectedly.', detail: 'Service: HexSSPRAgent\nAccount: HEXWORTH\\svc_sspr\nError: Faulting application, version 3.2.1\nCrash dump: C:\\ProgramData\\SSPR\\crash_20260328.dmp\nThis service has crashed 1 time(s).' },
            { id: 2, time: '2026-03-28T06:00:01', eventId: 7036, source: 'WEB01', username: 'SYSTEM', category: 'Service Control', desc: 'The HexSSPRAgent service entered the stopped state.', detail: 'Service: HexSSPRAgent\nPrevious State: Running\nNew State: Stopped\nExit Code: 0xC0000005 (Access Violation)' },
            { id: 3, time: '2026-03-28T06:30:00', eventId: 4625, source: '192.168.1.80', username: 'rhuang', category: 'Logon', desc: 'SSPR portal authentication failure.', detail: 'User rhuang attempted SSPR portal reset.\nSSPR agent is not running.\nHTTP 503 returned to client.' },
            { id: 4, time: '2026-03-28T07:15:22', eventId: 4625, source: '192.168.1.91', username: 'sevans', category: 'Logon', desc: 'SSPR portal authentication failure.', detail: 'User sevans attempted SSPR portal reset.\nSSPR agent is not running.\nHTTP 503 returned to client.' },
            { id: 5, time: '2026-03-28T07:45:00', eventId: 4625, source: '192.168.1.33', username: 'gkim', category: 'Logon', desc: 'SSPR portal authentication failure.', detail: 'User gkim attempted SSPR portal reset.\nSSPR agent is not running.\nHTTP 503 returned to client.' }
        ]
    },

    // ==========================================================
    // GPO / POLICY STATE
    // ==========================================================

    _gpoState: {
        lockoutThreshold: 5,
        lockoutDuration: 30,
        lockoutCounterReset: 30,
        minPasswordLength: 12,
        minPasswordAge: 1,
        maxPasswordAge: 90,
        passwordComplexity: true,
        passwordHistory: 10
    },

    _fgppPolicies: [
        { name: 'HighSec-Policy', precedence: 10, appliesTo: 'Finance-HighSec', minLength: 20, maxAge: 60, complexity: true, history: 24, lockoutThreshold: 3 },
        { name: 'Service-Accounts-Policy', precedence: 50, appliesTo: 'Service Accounts', minLength: 24, maxAge: 0, complexity: true, history: 24, lockoutThreshold: 0 }
    ],

    // ==========================================================
    // SCENARIO HINTS
    // ==========================================================

    _defaultHints: [
        { id: 'hint1', text: 'Open the Help Desk Ticket first, then check the password policy with Get-ADDefaultDomainPasswordPolicy or GPO Management.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Event ID 4723 logs password change attempts. Filter Event Viewer for that ID to see what is failing and why.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use Get-ADUser -Properties * to check password timestamps. Use Get-ADFineGrainedPasswordPolicy -Filter * for FGPP issues.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Each scenario has a specific root cause: min age, complexity rules, expiration, FGPP scope, or service failure. Match the fix to the cause.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        min_age: [
            { id: 'hint1', text: 'The user had their password reset yesterday. Check what the minimum password age policy is set to.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Get-ADDefaultDomainPasswordPolicy shows MinPasswordAge = 1 day. The user cannot change until 24 hours pass from the last admin reset.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Option 1: Wait until the 24-hour window passes. Option 2: Admin resets again with "must change at next logon" which bypasses min age. Option 3: Temporarily set min age to 0.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Fix: Use Set-ADAccountPassword to reset Olivia\'s password again, then Set-ADUser obaker -ChangePasswordAtLogon $true. She logs in and changes it immediately.', cost: 50, penalty: -50 }
        ],
        complexity: [
            { id: 'hint1', text: 'The user says the password meets complexity rules, but it keeps getting rejected. Look at the exact password they tried in the ticket.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Windows complexity rules prohibit passwords containing the user\'s display name or sAMAccountName. "Harold2026!" contains "Harold" — his first name.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Help the user choose a password that does not contain "Harold", "Lewis", or "hlewis". Then verify it passes by checking Event Viewer for a success event.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Fix: Educate the user, then set a compliant password via Set-ADAccountPassword -Identity hlewis -Reset. Confirm Event ID 4723 shows success.', cost: 50, penalty: -50 }
        ],
        vacation_expired: [
            { id: 'hint1', text: 'The user has been on vacation for 2 weeks. Check when their password was last set and what the max password age is.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Password was set Dec 20, 2025. Max age is 90 days. That means it expired around March 20, while the user was on vacation (March 14-28).', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'An admin must reset the password because the user cannot authenticate at all (even VPN requires AD creds). Use Set-ADAccountPassword or ADUC.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Fix: Reset Nina\'s password in ADUC or via Set-ADAccountPassword -Identity nfoster -Reset -NewPassword (ConvertTo-SecureString "TempPass123!!" -AsPlainText -Force). Set must-change-at-logon flag.', cost: 50, penalty: -50 }
        ],
        fgpp_wrong: [
            { id: 'hint1', text: 'James says his password requirements changed recently. Check if any Fine-Grained Password Policies apply to his account.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Get-ADFineGrainedPasswordPolicy shows HighSec-Policy applied to Finance-HighSec group. James was added to that group recently. That FGPP requires 20-char passwords.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Either remove James from Finance-HighSec group (if he doesn\'t need it), or create a new FGPP with lower precedence for regular Finance analysts.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Fix: Remove-ADGroupMember -Identity "Finance-HighSec" -Members jpark. James will revert to the Default Domain Policy (12 char minimum).', cost: 50, penalty: -50 }
        ],
        sspr_down: [
            { id: 'hint1', text: 'Multiple users are reporting the SSPR portal is down (503 error). Check what services power the portal.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Event Viewer shows the HexSSPRAgent service crashed at 6:00 AM (Event ID 7034). It has not been restarted since.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Open Service Manager or run Get-Service HexSSPRAgent to confirm it is stopped. Restart it with Restart-Service HexSSPRAgent or Start-Service HexSSPRAgent.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Fix: (1) Restart-Service HexSSPRAgent -Force, (2) Verify with Get-Service HexSSPRAgent that status is Running, (3) Test the SSPR portal URL responds.', cost: 50, penalty: -50 }
        ]
    },

    // ==========================================================
    // HELPERS
    // ==========================================================

    _ensureScenario: function(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !AD002Config._flagRestored) {
            AD002Config._flagRestored = true;
            var scenario = AD002Config._scenarios[engine.state._scenarioId];
            if (scenario) {
                AD002Config.hints = AD002Config._scenarioHints[scenario.id] || AD002Config._defaultHints;
            }
        }
        return true;
    },

    _applyScenario: function(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._scenarioSelected = true;
        engine.state._minAgeFixed = false;
        engine.state._complexityFixed = false;
        engine.state._vacationFixed = false;
        engine.state._fgppFixed = false;
        engine.state._ssprFixed = false;
        engine.state._labComplete = false;
        engine.state._flagRevealed = false;

        var scenario = AD002Config._scenarios[idx];
        AD002Config._flagRestored = true;
        AD002Config.hints = AD002Config._scenarioHints[scenario.id] || AD002Config._defaultHints;
        engine.save();
    },

    _getScenario: function(engine) {
        if (engine.state._scenarioId == null) return null;
        return AD002Config._scenarios[engine.state._scenarioId];
    },

    _requireScenario: function(engine) {
        if (!engine.state._scenarioSelected) {
            return '\nERROR: No active ticket assigned.\nOpen the Help Desk Ticket first to receive your assignment.';
        }
        return null;
    },

    _escHtml: function(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _checkFix: function(engine) {
        var scenario = AD002Config._getScenario(engine);
        if (!scenario || engine.state._labComplete) return;

        var done = false;
        if (scenario.id === 'min_age')          done = engine.state._minAgeFixed;
        if (scenario.id === 'complexity')       done = engine.state._complexityFixed;
        if (scenario.id === 'vacation_expired') done = engine.state._vacationFixed;
        if (scenario.id === 'fgpp_wrong')       done = engine.state._fgppFixed;
        if (scenario.id === 'sspr_down')        done = engine.state._ssprFixed;

        if (done) {
            engine.state._labComplete = true;
            engine.state._flagRevealed = true;
            engine.save();
            engine.requestFlagText(scenario.id).then(function(flagText) {
                if (flagText) {
                    engine.notify('Issue resolved. The password policy problem has been addressed. Check ADUC for the closure token.', 'success');
                } else {
                    engine.notify('Issue resolved. Flag delivery pending -- refresh ADUC to check.', 'success');
                }
            }).catch(function() {
                engine.notify('Issue resolved. Flag delivery pending -- refresh ADUC to check.', 'success');
            });
        }
    },

    // ==========================================================
    // BOOT SEQUENCE
    // ==========================================================

    boot: {
        biosLines: [
            'Dell PowerEdge R750 — System BIOS v2.12.1',
            'Intel(R) Xeon(R) Gold 5315Y @ 3.20GHz x2',
            'Memory Test: 65536 MB DDR4 ECC OK',
            'Detecting drives... RAID-10: SAMSUNG PM883 (2TB x4)',
            'Network: Intel(R) X710-DA2 10GbE',
            'iDRAC: Monitoring active',
            'Boot device: RAID volume 0',
            'Loading Windows Boot Manager...'
        ],
        grubEntries: [
            'Windows Server 2022 Standard (Primary DC)',
            'Windows Server Recovery Environment'
        ],
        loginUser: 'Administrator'
    },

    // ==========================================================
    // DESKTOP ICONS
    // ==========================================================

    desktop: {
        icons: [
            { id: 'powershell',  label: 'PowerShell',           icon: 'PS',  app: 'terminal' },
            { id: 'aduc',        label: 'AD Users &\nComputers', icon: 'AD',  app: 'aduc' },
            { id: 'event_viewer',label: 'Event\nViewer',         icon: 'EVT', app: 'event_viewer' },
            { id: 'gpo',         label: 'Group Policy\nMgmt',    icon: 'GPO', app: 'gpo_management' },
            { id: 'ticket',      label: 'Help Desk\nTicket',     icon: 'HD',  app: 'ticket' },
            { id: 'notes',       label: 'Notepad',               icon: 'TXT', app: 'notes' },
            { id: 'hints',       label: 'Hints',                 icon: '?',   app: 'hints' },
            { id: 'reset',       label: 'Reset\nLab',            icon: 'RST', app: 'reset_lab' }
        ]
    },

    // ==========================================================
    // TERMINAL CONFIG
    // ==========================================================

    terminal: {
        user: 'Administrator',
        hostname: 'DC01',
        startDir: 'C:\\Windows\\System32',
        promptStyle: 'powershell',
        welcome: 'Windows PowerShell\nCopyright (C) Microsoft Corporation. All rights reserved.\n\nInstall the latest PowerShell for new features and improvements! https://aka.ms/PSWindows\n'
    },

    filesystem: {
        '/': { type: 'dir', children: {} }
    },

    // ==========================================================
    // FLAGS
    // ==========================================================

    flags: [
        { id: 'fixed', value: '{{FLAG:ad002}}', points: 500 }
    ],

    scoring: {
        base: 0,
        maxScore: 600,
        hintPenalty: true,
        wrongFlagPenalty: 0,
        speedBonus: { threshold: 600000, points: 100 },
        timeBonusThreshold: 2400
    },

    hints: [
        { id: 'hint1', text: 'Open the Help Desk Ticket, then check the password policy settings in GPO or PowerShell.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Event ID 4723 logs password change attempts. Check Event Viewer for failure reasons.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use Get-ADUser to check account status and Get-ADFineGrainedPasswordPolicy for FGPP issues.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Match the fix to the root cause: policy timing, complexity naming rules, expiration, FGPP scope, or service crash.', cost: 50, penalty: -50 }
    ],

    lore: {
        intro: 'Users are unable to change or reset their passwords due to various policy configurations in Active Directory. As the Domain Administrator, diagnose the specific policy issue and resolve it so users can authenticate properly.',
        scenario: 'Password policies in AD can be deceptively complex. Minimum age prevents rapid cycling, complexity rules block display names, max age causes vacation lockouts, Fine-Grained Password Policies can override defaults unexpectedly, and SSPR infrastructure can fail silently.',
        outro: 'Password policy issue resolved. Users can now manage their credentials properly. Document the root cause and update the IT knowledge base.'
    },

    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read the help desk ticket and review password policy configuration.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the specific policy rule or service causing the password problem.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Remediation', description: 'Fix the policy, reset the password, or restart the service.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm the user can now change/reset their password and capture the flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    // ==========================================================
    // COMMANDS
    // ==========================================================

    commands: {

        'get-addefaultdomainpasswordpolicy': function(args, term, engine) {
            var gate = AD002Config._requireScenario(engine);
            if (gate) return gate;
            return '\n'
                + 'ComplexityEnabled           : True\n'
                + 'DistinguishedName           : DC=hexworth,DC=local\n'
                + 'LockoutDuration             : 00:30:00\n'
                + 'LockoutObservationWindow    : 00:30:00\n'
                + 'LockoutThreshold            : 5\n'
                + 'MaxPasswordAge              : 90.00:00:00\n'
                + 'MinPasswordAge              : 1.00:00:00\n'
                + 'MinPasswordLength           : 12\n'
                + 'PasswordHistoryCount        : 10\n'
                + 'ReversibleEncryptionEnabled : False\n';
        },

        'get-adfinegrainedpasswordpolicy': function(args, term, engine) {
            var gate = AD002Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = AD002Config._getScenario(engine);
            var out = '\n';
            AD002Config._fgppPolicies.forEach(function(p) {
                var scopeNote = (scenario && scenario.id === 'fgpp_wrong' && p.name === 'HighSec-Policy' && engine.state._fgppFixed) ? ' [SCOPE CORRECTED]' : '';
                out += 'Name                   : ' + p.name + scopeNote + '\n'
                    + 'Precedence             : ' + p.precedence + '\n'
                    + 'AppliesTo              : ' + p.appliesTo + '\n'
                    + 'MinPasswordLength      : ' + p.minLength + '\n'
                    + 'MaxPasswordAge         : ' + (p.maxAge === 0 ? 'Never' : p.maxAge + ' days') + '\n'
                    + 'ComplexityEnabled      : ' + p.complexity + '\n'
                    + 'PasswordHistoryCount   : ' + p.history + '\n'
                    + 'LockoutThreshold       : ' + p.lockoutThreshold + '\n'
                    + '\n';
            });
            return out;
        },

        'get-aduser': function(args, term, engine) {
            var gate = AD002Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ');
            var lower = joined.toLowerCase();
            var targetUser = null;
            if (args.length > 0 && !args[0].startsWith('-')) {
                targetUser = args[0].toLowerCase();
            }
            var identMatch = joined.match(/-identity\s+(\S+)/i);
            if (identMatch) targetUser = identMatch[1].toLowerCase();

            if (targetUser) {
                var found = AD002Config._domainUsers.filter(function(u) { return u.username.toLowerCase() === targetUser; })[0];
                if (!found) return '\nGet-ADUser : Cannot find an object with identity: \'' + targetUser + '\'.\n';
                var pwAge = Math.floor((new Date() - new Date(found.passwordLastSet)) / (1000 * 60 * 60 * 24));
                var scenario = AD002Config._getScenario(engine);
                var expired = (found.username === 'nfoster' && scenario && scenario.id === 'vacation_expired' && !engine.state._vacationFixed);
                return '\nDistinguishedName : CN=' + found.name + ',OU=' + found.ou + ',DC=hexworth,DC=local'
                    + '\nEnabled           : True'
                    + '\nLockedOut         : False'
                    + '\nName              : ' + found.name
                    + '\nPasswordExpired   : ' + (expired ? 'True' : 'False')
                    + '\nPasswordLastSet   : ' + found.passwordLastSet.replace('T', ' ').substring(0, 19)
                    + '\nPasswordAge       : ' + pwAge + ' days'
                    + '\nSamAccountName    : ' + found.username
                    + '\nTitle             : ' + found.title
                    + '\nUserPrincipalName : ' + found.email
                    + '\nMemberOf          : ' + found.memberOf.join(', ')
                    + '\n';
            }
            if (lower.includes('-filter')) {
                var out = '\n';
                out += 'Name                  SamAccountName  OU               Title\n';
                out += '----                  --------------  --               -----\n';
                AD002Config._domainUsers.forEach(function(u) {
                    out += u.name.padEnd(22) + u.username.padEnd(16) + u.ou.padEnd(17) + u.title + '\n';
                });
                return out;
            }
            return '\nGet-ADUser : A parameter cannot be found that matches parameter name.\nUsage: Get-ADUser -Identity <username> [-Properties *]\n';
        },

        'set-adaccountpassword': function(args, term, engine) {
            var gate = AD002Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ');
            var lower = joined.toLowerCase();
            var identMatch = joined.match(/-identity\s+(\S+)/i);
            var target = identMatch ? identMatch[1].toLowerCase() : null;
            if (!target) return '\nSet-ADAccountPassword : Parameter -Identity is required.\n';
            if (!lower.includes('-reset')) return '\nSet-ADAccountPassword : The -Reset parameter is required.\n';
            var found = AD002Config._domainUsers.filter(function(u) { return u.username.toLowerCase() === target; })[0];
            if (!found) return '\nSet-ADAccountPassword : Cannot find an object with identity: \'' + target + '\'.\n';
            var scenario = AD002Config._getScenario(engine);

            if (scenario.id === 'min_age' && target === 'obaker') {
                engine.state._minAgeFixed = true;
                engine.save();
                engine.notify('Password reset for obaker. The minimum age bypass via admin reset allows immediate change at next logon.', 'success');
                AD002Config._checkFix(engine);
                return '\n(no output — password reset successfully for obaker)\nNote: Set -ChangePasswordAtLogon $true so the user can pick their own password.\n';
            }
            if (scenario.id === 'complexity' && target === 'hlewis') {
                engine.state._complexityFixed = true;
                engine.save();
                engine.notify('Password set for hlewis with a compliant password. User educated on display name restriction.', 'success');
                AD002Config._checkFix(engine);
                return '\n(no output — password reset successfully for hlewis)\nReminder: Password cannot contain the display name or username.\n';
            }
            if (scenario.id === 'vacation_expired' && target === 'nfoster') {
                engine.state._vacationFixed = true;
                engine.save();
                engine.notify('Password reset for nfoster. She can now log in with the temporary password and set a new one.', 'success');
                AD002Config._checkFix(engine);
                return '\n(no output — password reset successfully for nfoster)\nExpired password has been replaced. User can log in at next attempt.\n';
            }
            return '\n(no output — password reset successfully for ' + found.username + ')\n';
        },

        'set-aduser': function(args, term, engine) {
            var gate = AD002Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ');
            var lower = joined.toLowerCase();
            if (lower.includes('changepasswordatlogon') && lower.includes('true')) {
                return '\n(no output — ChangePasswordAtLogon flag set)\n';
            }
            return '\nSet-ADUser : Specify -Identity and the property to change.\n';
        },

        'remove-adgroupmember': function(args, term, engine) {
            var gate = AD002Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ');
            var lower = joined.toLowerCase();
            var scenario = AD002Config._getScenario(engine);
            if (scenario.id === 'fgpp_wrong' && lower.includes('finance-highsec') && lower.includes('jpark')) {
                engine.state._fgppFixed = true;
                engine.save();
                engine.notify('James Park removed from Finance-HighSec group. He now falls under the Default Domain Policy (12-char minimum).', 'success');
                AD002Config._checkFix(engine);
                return '\n(no output — jpark removed from Finance-HighSec group)\nThe HighSec-Policy FGPP no longer applies to this user.\n';
            }
            return '\nRemove-ADGroupMember : Specify -Identity <GroupName> -Members <User>.\n';
        },

        'get-service': function(args, term, engine) {
            var gate = AD002Config._requireScenario(engine);
            if (gate) return gate;
            var lower = args.join(' ').toLowerCase();
            var scenario = AD002Config._getScenario(engine);
            if (lower.includes('hexsspragent') || lower.includes('sspr')) {
                var running = (scenario.id === 'sspr_down' && engine.state._ssprFixed) || (scenario.id !== 'sspr_down');
                return '\nStatus   Name               DisplayName\n------   ----               -----------\n' + (running ? 'Running' : 'Stopped') + '  HexSSPRAgent       Hexworth SSPR Agent Service\n';
            }
            return '\nGet-Service : Specify a service name. Example: Get-Service HexSSPRAgent\n';
        },

        'restart-service': function(args, term, engine) {
            var gate = AD002Config._requireScenario(engine);
            if (gate) return gate;
            var lower = args.join(' ').toLowerCase();
            var scenario = AD002Config._getScenario(engine);
            if ((lower.includes('hexsspragent') || lower.includes('sspr')) && scenario.id === 'sspr_down') {
                engine.state._ssprFixed = true;
                engine.save();
                engine.notify('HexSSPRAgent service restarted. SSPR portal is back online.', 'success');
                AD002Config._checkFix(engine);
                return '\nWARNING: Waiting for service \'HexSSPRAgent\' to stop...\nWARNING: Waiting for service \'HexSSPRAgent\' to start...\n(no output — service restarted successfully)\n';
            }
            return '\nRestart-Service : Specify a service name.\n';
        },

        'start-service': function(args, term, engine) {
            var gate = AD002Config._requireScenario(engine);
            if (gate) return gate;
            var lower = args.join(' ').toLowerCase();
            var scenario = AD002Config._getScenario(engine);
            if ((lower.includes('hexsspragent') || lower.includes('sspr')) && scenario.id === 'sspr_down') {
                engine.state._ssprFixed = true;
                engine.save();
                engine.notify('HexSSPRAgent service started. SSPR portal is back online.', 'success');
                AD002Config._checkFix(engine);
                return '\n(no output — service started successfully)\n';
            }
            return '\nStart-Service : Specify a service name.\n';
        },

        gpresult: function(args, term, engine) {
            var gate = AD002Config._requireScenario(engine);
            if (gate) return gate;
            return '\nMicrosoft (R) Windows (R) Operating System Group Policy Result tool v2.0\n'
                + '\nCOMPUTER SETTINGS\n'
                + '----------------\n'
                + '    Applied Group Policy Objects\n'
                + '    ---------------------------\n'
                + '        Default Domain Controllers Policy\n'
                + '        Default Domain Policy\n\n'
                + '    Password Policy (from Default Domain Policy)\n'
                + '    -----------------------------------------------\n'
                + '        Minimum Password Length: 12\n'
                + '        Password Complexity: Enabled\n'
                + '        Minimum Password Age: 1 day\n'
                + '        Maximum Password Age: 90 days\n'
                + '        Password History: 10 passwords\n'
                + '        Lockout Threshold: 5 attempts\n';
        },

        whoami: function() { return 'HEXWORTH\\Administrator'; },
        hostname: function() { return 'DC01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        ipconfig: function() { return '\nWindows IP Configuration\n\nEthernet adapter Ethernet0:\n   IPv4 Address. . . . : 192.168.1.10\n   Subnet Mask . . . . : 255.255.255.0\n   Default Gateway . . : 192.168.1.1\n'; }
    },

    // ==========================================================
    // CUSTOM WINDOW HANDLERS
    // ==========================================================

    onAppLaunch: function(iconDef, engine) {
        var requireTicket = ['aduc', 'event_viewer', 'gpo_management'];
        if (requireTicket.indexOf(iconDef.app) !== -1 && !engine.state._scenarioSelected) {
            engine.notify('Open the Help Desk Ticket first to receive your assignment.', 'error');
            return;
        }

        switch (iconDef.app) {
            case 'ticket':          AD002Config._openTicket(iconDef, engine); break;
            case 'aduc':            AD002Config._openADUC(iconDef, engine); break;
            case 'event_viewer':    AD002Config._openEventViewer(iconDef, engine); break;
            case 'gpo_management':  AD002Config._openGPO(iconDef, engine); break;
            case 'service_manager': AD002Config._openServiceManager(iconDef, engine); break;
            case 'reset_lab':       AD002Config._confirmReset(engine); break;
        }
    },

    // ==========================================================
    // HELP DESK TICKET
    // ==========================================================

    _openTicket: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.id = 'ticketContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', container);
        AD002Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) {
            AD002Config._renderTicket(engine, container);
        } else {
            AD002Config._renderScenarioPicker(engine, container);
        }
    },

    _renderScenarioPicker: function(engine, container) {
        var previews = [
            'HR user — "I changed my password yesterday but can\'t change it again"',
            'Finance user — "My new password keeps getting rejected for complexity"',
            'HR user — "Came back from vacation and my password is expired"',
            'Finance user — "System wants a 20-character password now"',
            'Multiple users — "Password reset portal is down, 503 error"'
        ];

        var html = '<div style="text-align:center; margin-bottom:20px;">'
            + '<div style="color:#8b5cf6; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">HELP DESK QUEUE — PASSWORD ISSUES</div>'
            + '<div style="color:#888; font-size:0.75rem;">Select an incident ticket to begin, or let the system assign one randomly.</div>'
            + '</div><div style="margin-bottom:16px;">';

        AD002Config._scenarios.forEach(function(s, i) {
            html += '<button class="ad002-scenario-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;">'
                + '<div style="display:flex; justify-content:space-between; align-items:center;">'
                + '<span style="color:#8b5cf6; font-weight:bold;">INC-' + (4000 + i) + '</span>'
                + '<span style="background:#e67e22; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">MEDIUM</span>'
                + '</div>'
                + '<div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div>'
                + '</button>';
        });
        html += '</div>';
        html += '<div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;">'
            + '<button id="ad002RandomBtn" style="padding:10px 28px; background:#8b5cf6; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.85rem; font-family:Consolas,monospace;">Random Assignment</button>'
            + '</div>';

        container.innerHTML = html;

        container.querySelectorAll('.ad002-scenario-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                AD002Config._applyScenario(engine, parseInt(this.getAttribute('data-idx')));
                AD002Config._renderTicket(engine, container);
            });
        });

        document.getElementById('ad002RandomBtn').addEventListener('click', function() {
            AD002Config._applyScenario(engine, Math.floor(Math.random() * AD002Config._scenarios.length));
            AD002Config._renderTicket(engine, container);
        });
    },

    _renderTicket: function(engine, container) {
        var scenario = AD002Config._getScenario(engine);
        var submitters = [
            'HR — Olivia Baker (self-reported)',
            'Finance — Harold Lewis (self-reported)',
            'HR — Nina Foster (reported by HR Director)',
            'Finance — James Park (self-reported)',
            'Multiple users — Help Desk escalation'
        ];
        var submitter = submitters[engine.state._scenarioId] || 'Unknown';

        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;">'
            + '<div style="display:flex; justify-content:space-between; align-items:center;">'
            + '<span style="color:#8b5cf6; font-weight:bold; font-size:1rem;">INCIDENT TICKET #INC-' + (4000 + engine.state._scenarioId) + '</span>'
            + '<span style="background:#e67e22; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">PRIORITY: MEDIUM</span>'
            + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">REPORTED BY</div><div>' + submitter + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBJECT</div><div style="font-weight:bold;">' + AD002Config._escHtml(scenario.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DESCRIPTION</div>'
            + '<div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">'
            + AD002Config._escHtml(scenario.ticketDetail) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">INTERNAL NOTES</div>'
            + '<div style="background:rgba(139,92,246,0.08); border:1px solid rgba(139,92,246,0.25); border-radius:4px; padding:12px; line-height:1.6; color:#c4b5fd;">'
            + AD002Config._escHtml(scenario.ticketExtra) + '</div></div>'
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">ASSIGNED TO</div>'
            + '<div style="color:#2ecc71; font-weight:bold;">YOU — Domain Administrator</div></div>';
    },

    // ==========================================================
    // AD USERS & COMPUTERS
    // ==========================================================

    _openADUC: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.id = 'aducContainer002';
        container.style.cssText = 'display:flex; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; overflow:hidden;';
        engine.openWindow(iconDef.id, 'Active Directory Users and Computers', 'AD', container);
        AD002Config._renderADUC(engine);
    },

    _renderADUC: function(engine) {
        var container = document.getElementById('aducContainer002');
        if (!container) return;
        var scenario = AD002Config._getScenario(engine);
        var users = AD002Config._domainUsers;

        var html = '<div style="width:180px; min-width:180px; border-right:1px solid rgba(255,255,255,0.1); padding:12px; overflow-y:auto; background:rgba(0,0,0,0.2);">'
            + '<div style="color:#8b5cf6; font-weight:bold; margin-bottom:8px; font-size:0.75rem;">HEXWORTH.LOCAL</div>'
            + '<div style="color:#aaa; font-size:0.75rem; padding:3px 0;">All Users (' + users.length + ')</div>'
            + '</div>';

        html += '<div style="flex:1; display:flex; flex-direction:column; overflow:hidden;">'
            + '<div style="display:flex; font-size:0.7rem; color:#888; padding:6px 12px; border-bottom:1px solid rgba(255,255,255,0.06);">'
            + '<span style="flex:2;">Name</span><span style="flex:1.2;">Account</span><span style="flex:1;">OU</span><span style="flex:1.5;">Password Last Set</span><span style="flex:0.8;">Status</span>'
            + '</div><div style="flex:1; overflow-y:auto;">';

        users.forEach(function(u) {
            var expired = (u.username === 'nfoster' && scenario && scenario.id === 'vacation_expired' && !engine.state._vacationFixed);
            var statusText = expired ? 'Expired' : 'Active';
            var statusColor = expired ? '#e74c3c' : '#2ecc71';
            html += '<div style="display:flex; align-items:center; padding:6px 12px; border-bottom:1px solid rgba(255,255,255,0.04);">'
                + '<span style="flex:2;">' + u.name + '</span>'
                + '<span style="flex:1.2; color:#888; font-size:0.75rem;">' + u.username + '</span>'
                + '<span style="flex:1; color:#888; font-size:0.75rem;">' + u.ou + '</span>'
                + '<span style="flex:1.5; color:#888; font-size:0.75rem;">' + u.passwordLastSet.split('T')[0] + '</span>'
                + '<span style="flex:0.8; color:' + statusColor + '; font-size:0.75rem; font-weight:bold;">' + statusText + '</span>'
                + '</div>';
        });

        html += '</div></div>';

        var flagVal = (engine.state._flagRevealed && engine._deliveredFlags && engine._deliveredFlags[scenario ? scenario.id : '']) ? engine._deliveredFlags[scenario.id] : '';
        if (flagVal) {
            html += '<div style="padding:12px; background:rgba(46,204,113,0.1); border-top:1px solid rgba(46,204,113,0.3);">'
                + '<div style="color:#2ecc71; font-weight:bold; margin-bottom:4px;">Incident Closure Token:</div>'
                + '<div style="color:#c8e6c9;">' + flagVal + '</div></div>';
        }

        container.innerHTML = html;
    },

    // ==========================================================
    // EVENT VIEWER
    // ==========================================================

    _openEventViewer: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.id = 'evtContainer002';
        container.style.cssText = 'display:flex; flex-direction:column; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; overflow:hidden;';
        engine.openWindow(iconDef.id, 'Event Viewer — Security Log', 'EVT', container);
        AD002Config._renderEventViewer(engine);
    },

    _renderEventViewer: function(engine) {
        var container = document.getElementById('evtContainer002');
        if (!container) return;
        var scenario = AD002Config._getScenario(engine);
        if (!scenario) { container.innerHTML = '<div style="padding:20px; color:#888;">Open a Help Desk Ticket first.</div>'; return; }

        var logs = AD002Config._eventLogs[scenario.id] || [];

        var html = '<div style="padding:10px 16px; border-bottom:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2); flex-shrink:0;">'
            + '<span style="color:#8b5cf6; font-weight:bold;">Security Log — DC01</span>'
            + '<span style="color:#888; font-size:0.75rem; margin-left:12px;">' + logs.length + ' events</span>'
            + '</div>';

        html += '<div style="display:flex; font-size:0.7rem; color:#888; padding:5px 12px; border-bottom:1px solid rgba(255,255,255,0.06); flex-shrink:0;">'
            + '<span style="flex:1.8;">Date / Time</span><span style="flex:0.7;">Event ID</span><span style="flex:1;">Account</span><span style="flex:3;">Description</span>'
            + '</div><div style="flex:1; overflow-y:auto;">';

        logs.forEach(function(e) {
            var eidColor = e.eventId === 4740 ? '#e74c3c' : e.eventId === 4723 ? '#e67e22' : e.eventId === 7034 ? '#e74c3c' : '#888';
            html += '<div style="border-bottom:1px solid rgba(255,255,255,0.04); cursor:pointer;" onclick="this.querySelector(\'.evt-detail\').style.display=this.querySelector(\'.evt-detail\').style.display===\'none\'?\'block\':\'none\'">'
                + '<div style="display:flex; align-items:center; padding:6px 12px;">'
                + '<span style="flex:1.8; color:#888; font-size:0.75rem;">' + e.time.replace('T', ' ').substring(0, 19) + '</span>'
                + '<span style="flex:0.7; color:' + eidColor + '; font-weight:bold;">' + e.eventId + '</span>'
                + '<span style="flex:1; font-size:0.75rem; color:#c4b5fd;">' + e.username + '</span>'
                + '<span style="flex:3; font-size:0.75rem; color:#ccc;">' + e.desc + '</span>'
                + '</div>'
                + '<div class="evt-detail" style="display:none; background:rgba(0,0,0,0.3); border-left:3px solid ' + eidColor + '; padding:10px 16px; font-size:0.75rem; white-space:pre-wrap; color:#aaa;">' + e.detail + '</div>'
                + '</div>';
        });

        html += '</div>';
        container.innerHTML = html;
    },

    // ==========================================================
    // GROUP POLICY MANAGEMENT
    // ==========================================================

    _openGPO: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.id = 'gpoContainer002';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Group Policy Management', 'GPO', container);
        AD002Config._renderGPO(engine);
    },

    _renderGPO: function(engine) {
        var container = document.getElementById('gpoContainer002');
        if (!container) return;

        var html = '<div style="font-size:0.9rem; font-weight:bold; color:#8b5cf6; margin-bottom:16px;">Default Domain Policy — Password Settings</div>'
            + '<div style="margin-bottom:16px;">'
            + '<div style="font-weight:bold; color:#c4b5fd; margin-bottom:8px; border-bottom:1px solid rgba(139,92,246,0.2); padding-bottom:4px;">Password Policy</div>'
            + '<div style="display:flex; padding:6px 8px; margin-bottom:3px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:3px;"><span style="flex:2;">Minimum password length</span><span style="flex:1;">12 characters</span></div>'
            + '<div style="display:flex; padding:6px 8px; margin-bottom:3px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:3px;"><span style="flex:2;">Password complexity</span><span style="flex:1;">Enabled (no display name in password)</span></div>'
            + '<div style="display:flex; padding:6px 8px; margin-bottom:3px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:3px;"><span style="flex:2;">Minimum password age</span><span style="flex:1;">1 day</span></div>'
            + '<div style="display:flex; padding:6px 8px; margin-bottom:3px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:3px;"><span style="flex:2;">Maximum password age</span><span style="flex:1;">90 days</span></div>'
            + '<div style="display:flex; padding:6px 8px; margin-bottom:3px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:3px;"><span style="flex:2;">Password history</span><span style="flex:1;">10 passwords</span></div>'
            + '</div>';

        html += '<div style="margin-bottom:16px;">'
            + '<div style="font-weight:bold; color:#c4b5fd; margin-bottom:8px; border-bottom:1px solid rgba(139,92,246,0.2); padding-bottom:4px;">Fine-Grained Password Policies (FGPP)</div>';
        AD002Config._fgppPolicies.forEach(function(p) {
            html += '<div style="padding:8px; margin-bottom:6px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px;">'
                + '<div style="font-weight:bold; color:#c4b5fd;">' + p.name + ' (Precedence: ' + p.precedence + ')</div>'
                + '<div style="color:#888; font-size:0.75rem;">Applies to: ' + p.appliesTo + ' | Min Length: ' + p.minLength + ' | Max Age: ' + (p.maxAge === 0 ? 'Never' : p.maxAge + ' days') + '</div>'
                + '</div>';
        });
        html += '</div>';

        container.innerHTML = html;
    },

    // ==========================================================
    // SERVICE MANAGER (for SSPR scenario)
    // ==========================================================

    _openServiceManager: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.id = 'svcContainer002';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Service Manager — WEB01', 'SVC', container);
        var scenario = AD002Config._getScenario(engine);
        var running = (scenario && scenario.id === 'sspr_down' && !engine.state._ssprFixed) ? false : true;
        container.innerHTML = '<div style="font-size:0.9rem; font-weight:bold; color:#8b5cf6; margin-bottom:16px;">Services on WEB01</div>'
            + '<div style="display:flex; padding:6px 8px; border-bottom:1px solid rgba(255,255,255,0.1); font-size:0.7rem; color:#888;"><span style="flex:2;">Service Name</span><span style="flex:1;">Status</span><span style="flex:1;">Account</span></div>'
            + '<div style="display:flex; padding:8px; background:' + (running ? 'transparent' : 'rgba(231,76,60,0.08)') + '; border-bottom:1px solid rgba(255,255,255,0.06);"><span style="flex:2;">HexSSPRAgent</span><span style="flex:1; color:' + (running ? '#2ecc71' : '#e74c3c') + '; font-weight:bold;">' + (running ? 'Running' : 'Stopped') + '</span><span style="flex:1; color:#888;">svc_sspr</span></div>'
            + '<div style="display:flex; padding:8px; border-bottom:1px solid rgba(255,255,255,0.06);"><span style="flex:2;">W3SVC (IIS)</span><span style="flex:1; color:#2ecc71;">Running</span><span style="flex:1; color:#888;">LocalSystem</span></div>'
            + '<div style="display:flex; padding:8px; border-bottom:1px solid rgba(255,255,255,0.06);"><span style="flex:2;">WinRM</span><span style="flex:1; color:#2ecc71;">Running</span><span style="flex:1; color:#888;">LocalService</span></div>';
    },

    _confirmReset: function(engine) {
        if (confirm('Reset this lab? All progress will be lost.')) {
            engine.resetLab();
        }
    }
};
