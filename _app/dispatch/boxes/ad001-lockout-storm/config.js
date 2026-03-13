/* ============================================================
   DISPATCH LAB — Box AD-001: Lockout Storm
   Active Directory & Authentication Troubleshooting
   Security+ (SY0-701) — Identity Management & Threat Analysis
   5 distinct scenarios: stale creds, expired svc account,
   brute force, GPO misconfiguration, rogue scheduled task
   ============================================================ */

var AD001Config = {

    // ==========================================================
    // BOX METADATA
    // ==========================================================

    title: 'Lockout Storm',
    subtitle: 'Active Directory & Authentication Troubleshooting — Security+',
    difficulty: 'Advanced',
    accent: '#9b59b6',
    storageKey: 'hexworth_lab_ad001',
    registryId: 'ad001-lockout-storm',
    trackerKey: 'lab_ad001',

    // ==========================================================
    // TUTORIAL MODE
    // ==========================================================

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Open the Help Desk Ticket',
                tip: 'Double-click the Help Desk Ticket icon to read the incident report and understand the lockout pattern.',
                trigger: { event: 'window_open', match: { type: 'ticket' } }
            },
            {
                title: 'Check Event Viewer for lockout events',
                tip: 'Open Event Viewer and filter for Event ID 4625 (failed logon) and 4740 (account lockout). The source IP or caller computer reveals the attacker.',
                trigger: { event: 'window_open', match: { type: 'event_viewer' } }
            },
            {
                title: 'Identify the affected accounts',
                tip: 'Open AD Users & Computers or run: Search-ADAccount -LockedOut to see which accounts are locked and why.',
                trigger: {
                    event: 'window_open',
                    match: { type: 'aduc' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:LockedOut' } },
                        { event: 'command', match: { cmd: 'contains:Search-ADAccount' } }
                    ]
                }
            },
            {
                title: 'Apply the fix',
                tip: 'Each scenario has a specific fix: update credentials, reset a service account, block an IP, fix a GPO, or disable a switch port.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:Unlock-ADAccount' },
                    alt: [
                        { event: 'window_open', match: { type: 'firewall_console' } },
                        { event: 'window_open', match: { type: 'gpo_management' } },
                        { event: 'window_open', match: { type: 'iis_manager' } },
                        { event: 'window_open', match: { type: 'net_device_config' } },
                        { event: 'window_open', match: { type: 'net_management' } }
                    ]
                }
            },
            {
                title: 'Verify and capture the flag',
                tip: 'After applying the fix, verify accounts are unlocked and the root cause is addressed. The flag appears after the fix is confirmed.',
                trigger: { event: 'flag_correct', match: { flagId: 'fixed' } }
            }
        ]
    },

    // ==========================================================
    // CERT OBJECTIVES (Security+ SY0-701 mapping)
    // ==========================================================

    certObjectives: {
        certPath: 'Security+',
        mappings: [
            { flagId: 'fixed', objective: '3.8', description: 'Implement identity and account management controls', skill: 'Active Directory Account Lockout Troubleshooting' },
            { flagId: 'fixed', objective: '4.4', description: 'Analyze indicators of malicious activity', skill: 'Event Log Analysis (4625, 4740, 4624)' },
            { flagId: 'fixed', objective: '2.4', description: 'Analyze indicators of compromise', skill: 'Credential Stuffing and Brute Force Detection' }
        ]
    },

    // ==========================================================
    // DOMAIN DATA MODEL — 50+ users across 6 OUs
    // ==========================================================

    _domainUsers: [
        // IT — 8 users
        { name: 'Alex Rodriguez',    username: 'arodriguez',   ou: 'IT',        title: 'IT Manager',            status: 'active',  lastLogon: '2026-03-13T08:12:00', passwordLastSet: '2026-01-10T09:00:00', accountCreated: '2019-03-01', memberOf: ['Domain Admins', 'IT Staff', 'VPN Users'], email: 'arodriguez@hexworth.local' },
        { name: 'Dana Torres',       username: 'dtorres',      ou: 'IT',        title: 'Help Desk Technician',  status: 'active',  lastLogon: '2026-03-13T07:58:00', passwordLastSet: '2026-02-05T09:00:00', accountCreated: '2021-06-15', memberOf: ['IT Staff', 'Help Desk'], email: 'dtorres@hexworth.local' },
        { name: 'Marcus Webb',       username: 'mwebb',        ou: 'IT',        title: 'Systems Administrator', status: 'active',  lastLogon: '2026-03-13T08:01:00', passwordLastSet: '2026-01-28T09:00:00', accountCreated: '2020-11-09', memberOf: ['Domain Admins', 'IT Staff', 'Server Operators'], email: 'mwebb@hexworth.local' },
        { name: 'Priya Patel',       username: 'ppatel',       ou: 'IT',        title: 'Network Engineer',      status: 'active',  lastLogon: '2026-03-12T17:44:00', passwordLastSet: '2026-02-20T09:00:00', accountCreated: '2022-02-14', memberOf: ['IT Staff', 'Network Admins'], email: 'ppatel@hexworth.local' },
        { name: 'Jordan Lee',        username: 'jlee',         ou: 'IT',        title: 'Security Analyst',      status: 'active',  lastLogon: '2026-03-13T07:55:00', passwordLastSet: '2026-01-15T09:00:00', accountCreated: '2023-04-01', memberOf: ['IT Staff', 'Security Team'], email: 'jlee@hexworth.local' },
        { name: 'Sam Nguyen',        username: 'snguyen',      ou: 'IT',        title: 'Help Desk Technician',  status: 'active',  lastLogon: '2026-03-13T08:05:00', passwordLastSet: '2026-03-01T09:00:00', accountCreated: '2024-01-10', memberOf: ['IT Staff', 'Help Desk'], email: 'snguyen@hexworth.local' },
        { name: 'Riley Chen',        username: 'rchen',        ou: 'IT',        title: 'Systems Administrator', status: 'active',  lastLogon: '2026-03-12T16:30:00', passwordLastSet: '2026-01-22T09:00:00', accountCreated: '2021-09-01', memberOf: ['Domain Admins', 'IT Staff'], email: 'rchen@hexworth.local' },
        { name: 'Casey Morgan',      username: 'cmorgan',      ou: 'IT',        title: 'Database Administrator', status: 'active', lastLogon: '2026-03-13T07:48:00', passwordLastSet: '2026-02-11T09:00:00', accountCreated: '2020-07-06', memberOf: ['IT Staff', 'Database Admins'], email: 'cmorgan@hexworth.local' },

        // HR — 8 users
        { name: 'Susan Hall',        username: 'shall',        ou: 'HR',        title: 'HR Director',           status: 'active',  lastLogon: '2026-03-13T08:30:00', passwordLastSet: '2026-01-08T09:00:00', accountCreated: '2018-05-01', memberOf: ['HR Staff', 'HR Managers', 'All Staff'], email: 'shall@hexworth.local' },
        { name: 'Tom Wright',        username: 'twright',      ou: 'HR',        title: 'HR Manager',            status: 'active',  lastLogon: '2026-03-13T08:22:00', passwordLastSet: '2026-02-14T09:00:00', accountCreated: '2019-11-15', memberOf: ['HR Staff', 'HR Managers', 'All Staff'], email: 'twright@hexworth.local' },
        { name: 'Olivia Baker',      username: 'obaker',       ou: 'HR',        title: 'Recruiter',             status: 'active',  lastLogon: '2026-03-12T15:11:00', passwordLastSet: '2026-03-02T09:00:00', accountCreated: '2023-08-21', memberOf: ['HR Staff', 'All Staff'], email: 'obaker@hexworth.local' },
        { name: 'Ethan Clark',       username: 'eclark',       ou: 'HR',        title: 'Recruiter',             status: 'active',  lastLogon: '2026-03-13T08:18:00', passwordLastSet: '2026-02-28T09:00:00', accountCreated: '2024-02-01', memberOf: ['HR Staff', 'All Staff'], email: 'eclark@hexworth.local' },
        { name: 'Nina Foster',       username: 'nfoster',      ou: 'HR',        title: 'HR Coordinator',        status: 'active',  lastLogon: '2026-03-13T08:10:00', passwordLastSet: '2026-01-20T09:00:00', accountCreated: '2022-03-07', memberOf: ['HR Staff', 'All Staff'], email: 'nfoster@hexworth.local' },
        { name: 'Carlos Mendez',     username: 'cmendez',      ou: 'HR',        title: 'Benefits Coordinator',  status: 'active',  lastLogon: '2026-03-12T17:02:00', passwordLastSet: '2026-02-10T09:00:00', accountCreated: '2021-01-18', memberOf: ['HR Staff', 'All Staff'], email: 'cmendez@hexworth.local' },
        { name: 'Aisha Johnson',     username: 'ajohnson',     ou: 'HR',        title: 'HR Generalist',         status: 'active',  lastLogon: '2026-03-13T08:28:00', passwordLastSet: '2026-03-05T09:00:00', accountCreated: '2023-11-01', memberOf: ['HR Staff', 'All Staff'], email: 'ajohnson@hexworth.local' },
        { name: 'Derek Wilson',      username: 'dwilson',      ou: 'HR',        title: 'Training Coordinator',  status: 'active',  lastLogon: '2026-03-12T14:50:00', passwordLastSet: '2026-01-30T09:00:00', accountCreated: '2020-09-14', memberOf: ['HR Staff', 'All Staff'], email: 'dwilson@hexworth.local' },

        // Finance — 10 users (5 get locked in S1)
        { name: 'Linda Reyes',       username: 'lreyes',       ou: 'Finance',   title: 'CFO',                   status: 'active',  lastLogon: '2026-03-13T07:45:00', passwordLastSet: '2026-01-05T09:00:00', accountCreated: '2016-04-01', memberOf: ['Finance Staff', 'Finance Managers', 'Executives', 'All Staff'], email: 'lreyes@hexworth.local' },
        { name: 'Frank Turner',      username: 'fturner',      ou: 'Finance',   title: 'Controller',            status: 'active',  lastLogon: '2026-03-13T08:02:00', passwordLastSet: '2026-01-12T09:00:00', accountCreated: '2018-07-01', memberOf: ['Finance Staff', 'Finance Managers', 'All Staff'], email: 'fturner@hexworth.local' },
        { name: 'Grace Kim',         username: 'gkim',         ou: 'Finance',   title: 'Senior Accountant',     status: 'active',  lastLogon: '2026-03-13T07:50:00', passwordLastSet: '2026-02-18T09:00:00', accountCreated: '2019-10-07', memberOf: ['Finance Staff', 'All Staff'], email: 'gkim@hexworth.local' },
        { name: 'Harold Lewis',      username: 'hlewis',       ou: 'Finance',   title: 'Accountant',            status: 'active',  lastLogon: '2026-03-13T07:55:00', passwordLastSet: '2026-02-25T09:00:00', accountCreated: '2021-04-12', memberOf: ['Finance Staff', 'All Staff'], email: 'hlewis@hexworth.local' },
        { name: 'Irene Scott',       username: 'iscott',       ou: 'Finance',   title: 'Accounts Payable',      status: 'active',  lastLogon: '2026-03-13T08:08:00', passwordLastSet: '2026-01-29T09:00:00', accountCreated: '2022-06-20', memberOf: ['Finance Staff', 'All Staff'], email: 'iscott@hexworth.local' },
        { name: 'James Park',        username: 'jpark',        ou: 'Finance',   title: 'Financial Analyst',     status: 'active',  lastLogon: '2026-03-12T16:45:00', passwordLastSet: '2026-03-01T09:00:00', accountCreated: '2023-01-09', memberOf: ['Finance Staff', 'All Staff'], email: 'jpark@hexworth.local' },
        { name: 'Karen Mitchell',    username: 'kmitchell',    ou: 'Finance',   title: 'Financial Analyst',     status: 'active',  lastLogon: '2026-03-13T07:58:00', passwordLastSet: '2026-02-07T09:00:00', accountCreated: '2023-05-15', memberOf: ['Finance Staff', 'All Staff'], email: 'kmitchell@hexworth.local' },
        { name: 'Leo Adams',         username: 'ladams',       ou: 'Finance',   title: 'Accounts Receivable',   status: 'active',  lastLogon: '2026-03-13T08:15:00', passwordLastSet: '2026-01-17T09:00:00', accountCreated: '2022-11-01', memberOf: ['Finance Staff', 'All Staff'], email: 'ladams@hexworth.local' },
        { name: 'Megan Brooks',      username: 'mbrooks',      ou: 'Finance',   title: 'Payroll Specialist',    status: 'active',  lastLogon: '2026-03-13T08:00:00', passwordLastSet: '2026-02-22T09:00:00', accountCreated: '2020-08-03', memberOf: ['Finance Staff', 'Payroll', 'All Staff'], email: 'mbrooks@hexworth.local' },
        { name: 'Nathan Cole',       username: 'ncole',        ou: 'Finance',   title: 'Budget Analyst',        status: 'active',  lastLogon: '2026-03-12T17:30:00', passwordLastSet: '2026-01-25T09:00:00', accountCreated: '2021-12-06', memberOf: ['Finance Staff', 'All Staff'], email: 'ncole@hexworth.local' },

        // Marketing — 8 users
        { name: 'Rachel Huang',      username: 'rhuang',       ou: 'Marketing', title: 'Marketing Director',    status: 'active',  lastLogon: '2026-03-13T08:25:00', passwordLastSet: '2026-01-06T09:00:00', accountCreated: '2018-02-01', memberOf: ['Marketing Staff', 'Marketing Managers', 'All Staff'], email: 'rhuang@hexworth.local' },
        { name: 'Steve Evans',       username: 'sevans',       ou: 'Marketing', title: 'Content Manager',       status: 'active',  lastLogon: '2026-03-13T08:20:00', passwordLastSet: '2026-02-16T09:00:00', accountCreated: '2020-06-01', memberOf: ['Marketing Staff', 'All Staff'], email: 'sevans@hexworth.local' },
        { name: 'Tanya Green',       username: 'tgreen',       ou: 'Marketing', title: 'Social Media Specialist', status: 'active', lastLogon: '2026-03-13T08:17:00', passwordLastSet: '2026-03-01T09:00:00', accountCreated: '2023-03-14', memberOf: ['Marketing Staff', 'All Staff'], email: 'tgreen@hexworth.local' },
        { name: 'Ulric Santos',      username: 'usantos',      ou: 'Marketing', title: 'Graphic Designer',      status: 'active',  lastLogon: '2026-03-12T17:10:00', passwordLastSet: '2026-01-19T09:00:00', accountCreated: '2022-07-18', memberOf: ['Marketing Staff', 'Creative Team', 'All Staff'], email: 'usantos@hexworth.local' },
        { name: 'Vera Price',        username: 'vprice',       ou: 'Marketing', title: 'Web Designer',          status: 'active',  lastLogon: '2026-03-13T08:10:00', passwordLastSet: '2026-02-08T09:00:00', accountCreated: '2021-10-25', memberOf: ['Marketing Staff', 'Creative Team', 'All Staff'], email: 'vprice@hexworth.local' },
        { name: 'William Chang',     username: 'wchang',       ou: 'Marketing', title: 'SEO Specialist',        status: 'active',  lastLogon: '2026-03-13T08:14:00', passwordLastSet: '2026-01-31T09:00:00', accountCreated: '2023-09-01', memberOf: ['Marketing Staff', 'All Staff'], email: 'wchang@hexworth.local' },
        { name: 'Xena Roberts',      username: 'xroberts',     ou: 'Marketing', title: 'Marketing Analyst',     status: 'active',  lastLogon: '2026-03-12T16:00:00', passwordLastSet: '2026-02-26T09:00:00', accountCreated: '2024-01-22', memberOf: ['Marketing Staff', 'All Staff'], email: 'xroberts@hexworth.local' },
        { name: 'Yusuf Okafor',      username: 'yokafor',      ou: 'Marketing', title: 'Brand Strategist',      status: 'active',  lastLogon: '2026-03-13T07:52:00', passwordLastSet: '2026-01-13T09:00:00', accountCreated: '2022-04-11', memberOf: ['Marketing Staff', 'All Staff'], email: 'yokafor@hexworth.local' },

        // Executives — 6 users
        { name: 'David Kim',         username: 'dkim',         ou: 'Executives', title: 'CEO',                  status: 'active',  lastLogon: '2026-03-13T07:30:00', passwordLastSet: '2026-01-01T09:00:00', accountCreated: '2014-01-01', memberOf: ['Executives', 'Domain Admins', 'All Staff'], email: 'dkim@hexworth.local' },
        { name: 'Elena Vasquez',     username: 'evasquez',     ou: 'Executives', title: 'CTO',                  status: 'active',  lastLogon: '2026-03-13T07:35:00', passwordLastSet: '2026-01-02T09:00:00', accountCreated: '2015-03-01', memberOf: ['Executives', 'IT Staff', 'All Staff'], email: 'evasquez@hexworth.local' },
        { name: 'Frank DeSouza',     username: 'fdesouza',     ou: 'Executives', title: 'COO',                  status: 'active',  lastLogon: '2026-03-13T07:40:00', passwordLastSet: '2026-01-03T09:00:00', accountCreated: '2015-06-15', memberOf: ['Executives', 'All Staff'], email: 'fdesouza@hexworth.local' },
        { name: 'Gloria Watts',      username: 'gwatts',       ou: 'Executives', title: 'VP of Sales',          status: 'active',  lastLogon: '2026-03-12T18:00:00', passwordLastSet: '2026-01-04T09:00:00', accountCreated: '2016-09-01', memberOf: ['Executives', 'All Staff'], email: 'gwatts@hexworth.local' },
        { name: 'Henry Nash',        username: 'hnash',        ou: 'Executives', title: 'VP of Engineering',    status: 'active',  lastLogon: '2026-03-13T07:50:00', passwordLastSet: '2026-01-05T09:00:00', accountCreated: '2016-11-01', memberOf: ['Executives', 'IT Staff', 'All Staff'], email: 'hnash@hexworth.local' },
        { name: 'Ingrid Larson',     username: 'ilarson',      ou: 'Executives', title: 'VP of Operations',     status: 'active',  lastLogon: '2026-03-13T07:45:00', passwordLastSet: '2026-01-06T09:00:00', accountCreated: '2017-02-14', memberOf: ['Executives', 'All Staff'], email: 'ilarson@hexworth.local' },

        // Service Accounts — 6
        { name: 'Web Portal Service', username: 'svc_webportal',  ou: 'Service Accounts', title: 'Service Account',   status: 'active',  lastLogon: '2026-03-13T00:00:00', passwordLastSet: '2025-03-13T09:00:00', accountCreated: '2021-05-01', memberOf: ['Service Accounts', 'IIS_IUSRS'], email: 'svc_webportal@hexworth.local' },
        { name: 'Backup Service',     username: 'svc_backup',     ou: 'Service Accounts', title: 'Service Account',   status: 'active',  lastLogon: '2026-03-13T02:00:00', passwordLastSet: '2025-09-01T09:00:00', accountCreated: '2018-01-01', memberOf: ['Service Accounts', 'Backup Operators'], email: 'svc_backup@hexworth.local' },
        { name: 'SQL Service',        username: 'svc_sql',        ou: 'Service Accounts', title: 'Service Account',   status: 'active',  lastLogon: '2026-03-13T00:01:00', passwordLastSet: '2025-11-01T09:00:00', accountCreated: '2019-06-01', memberOf: ['Service Accounts', 'SQL Server Users'], email: 'svc_sql@hexworth.local' },
        { name: 'Scanner Service',    username: 'svc_scanner',    ou: 'Service Accounts', title: 'Service Account',   status: 'active',  lastLogon: '2026-03-13T06:00:00', passwordLastSet: '2025-06-01T09:00:00', accountCreated: '2020-03-01', memberOf: ['Service Accounts'], email: 'svc_scanner@hexworth.local' },
        { name: 'Monitoring Service', username: 'svc_monitoring', ou: 'Service Accounts', title: 'Service Account',   status: 'active',  lastLogon: '2026-03-13T07:59:00', passwordLastSet: '2025-12-01T09:00:00', accountCreated: '2020-09-01', memberOf: ['Service Accounts', 'Performance Monitor Users'], email: 'svc_monitoring@hexworth.local' },
        { name: 'Email Service',      username: 'svc_email',      ou: 'Service Accounts', title: 'Service Account',   status: 'active',  lastLogon: '2026-03-13T08:00:00', passwordLastSet: '2025-10-01T09:00:00', accountCreated: '2019-01-15', memberOf: ['Service Accounts'], email: 'svc_email@hexworth.local' }
    ],

    // Finance users locked in S1 (indices 16-20: gkim, hlewis, iscott, jpark, kmitchell)
    _s1LockedUsers: ['gkim', 'hlewis', 'iscott', 'jpark', 'kmitchell'],

    // ==========================================================
    // SCENARIO FLAGS
    // ==========================================================

    _scenarioFlags: {
        stale_creds:    'flag{st4l3_cr3d_f0und}',
        expired_svc:    'flag{svc_4cc0unt_r3n3w3d}',
        brute_force:    'flag{brut3_f0rc3_bl0ck3d}',
        gpo_misconfig:  'flag{gp0_p0l1cy_f1x3d}',
        rogue_task:     'flag{r0gu3_t4sk_k1ll3d}'
    },

    // ==========================================================
    // SCENARIOS
    // ==========================================================

    _scenarios: [
        {
            id: 'stale_creds',
            name: 'Stale Credentials on Mapped Drive',
            ticketSubject: 'Five Finance accounts locked out every morning between 6:00 and 6:30 AM',
            ticketDetail: 'Five Finance team members are arriving every morning to find their accounts locked. This has happened three days in a row. It always occurs between 6:00 and 6:30 AM — before anyone is even in the office. The affected users are: Grace Kim, Harold Lewis, Irene Scott, James Park, and Karen Mitchell.',
            ticketExtra: 'IT Note: Event Viewer shows a high volume of 4625 failures originating from 192.168.1.150 targeting Finance OU accounts during early morning hours. The source appears to be an internal network device. The mapped drive P:\\ (\\\\FILESERVER01\\Finance) is configured for Finance users.',
            fixDescription: 'Identify source IP in Event Viewer, unlock Finance accounts, update scanner credentials in Network Device Config',
            stateOverrides: { _scannerCredsUpdated: false, _s1AccountsUnlocked: false }
        },
        {
            id: 'expired_svc',
            name: 'Expired Service Account',
            ticketSubject: 'Internal web portal shows Access Denied for all users — nobody can log in',
            ticketDetail: 'The internal HR/Payroll portal at http://portal.hexworth.local is showing "Access Denied" for every user who tries to log in. This affects the entire organization. The portal was working fine yesterday afternoon. No code changes were deployed. The error appears immediately at the login screen, before credentials are even entered.',
            ticketExtra: 'IT Note: The web portal runs on IIS using application pool "WebPortalPool" with identity svc_webportal. Check that account status in Active Directory — service accounts can expire.',
            fixDescription: 'Reset svc_webportal password in ADUC, update IIS App Pool identity with new password',
            stateOverrides: { _svcPasswordReset: false, _iisPoolUpdated: false }
        },
        {
            id: 'brute_force',
            name: 'Brute Force Attack — Credential Stuffing',
            ticketSubject: '47 user accounts locked in 15 minutes — mass lockout event in progress',
            ticketDetail: 'We have a critical incident. 47 user accounts across multiple departments locked out in a 15-minute window. This has never happened before. Normal lockout rate is maybe 1-2 per day due to password typos. This appears to be an active attack. The CEO, CTO, and multiple executives are included in the locked accounts.',
            ticketExtra: 'IT Note: All 4625 events show the same source IP: 10.0.0.1 (VPN Gateway). This is a credential stuffing attack coming through the VPN. You need to block the source at the firewall and bulk-unlock accounts.',
            fixDescription: 'Identify attack source in Event Viewer, add firewall deny rule for 10.0.0.1, bulk unlock accounts',
            stateOverrides: { _firewallRuleAdded: false, _s3AccountsUnlocked: false }
        },
        {
            id: 'gpo_misconfig',
            name: 'GPO Misconfiguration — Zero Tolerance Lockout',
            ticketSubject: 'Users locking out after ONE wrong password since security audit yesterday',
            ticketDetail: 'Since the security team ran an audit yesterday afternoon, users are getting locked out after a single bad password attempt. Before the audit, they got 5 tries. Now it is one strike and out. With password complexity rules, typos happen. Help desk is flooded with unlock requests. This is a productivity crisis.',
            ticketExtra: 'IT Note: The security audit modified the Default Domain Password Policy GPO. The lockout threshold appears to have been changed. Normal settings: threshold 5, duration 30 minutes, counter reset 30 minutes.',
            fixDescription: 'Review Default Domain Policy in GPO Management, fix threshold to 5 and duration to 30, run gpupdate /force, unlock accounts',
            stateOverrides: { _gpoFixed: false, _gpupdateRun: false, _s4AccountsUnlocked: false }
        },
        {
            id: 'rogue_task',
            name: 'Rogue Scheduled Task — Former Contractor',
            ticketSubject: 'Random account lockouts at exactly 2:00 PM daily for the past week',
            ticketDetail: 'Every day at exactly 2:00 PM, a batch of user accounts locks out. Different accounts each day, no obvious pattern by department or name. This started exactly one week ago. Help desk has been manually unlocking accounts each day, but we need to find the root cause. The precision timing suggests automation.',
            ticketExtra: 'IT Note: Event Viewer shows 4740 lockout events all citing caller computer DESK-142 (192.168.1.142). That machine belongs to a contractor whose engagement ended 10 days ago. Their workstation was not decommissioned. The device appears to be running a credential scanner on a scheduled task.',
            fixDescription: 'Confirm source in Event Viewer, disable switch port for 192.168.1.142 in Network Management, unlock affected accounts',
            stateOverrides: { _roguePortDisabled: false, _s5AccountsUnlocked: false }
        }
    ],

    // ==========================================================
    // EVENT LOG DATA (per scenario — 20-40 entries each)
    // ==========================================================

    _eventLogs: {
        stale_creds: [
            // 4625 failures from scanner IP targeting finance accounts
            { id: 1, time: '2026-03-13T06:03:11', eventId: 4625, source: '192.168.1.150', username: 'gkim',      category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nSub Status: 0xC000006A\nWorkstation Name: NETSCANNER01\nCaller IP: 192.168.1.150' },
            { id: 2, time: '2026-03-13T06:03:14', eventId: 4625, source: '192.168.1.150', username: 'hlewis',     category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nSub Status: 0xC000006A\nWorkstation Name: NETSCANNER01\nCaller IP: 192.168.1.150' },
            { id: 3, time: '2026-03-13T06:03:17', eventId: 4625, source: '192.168.1.150', username: 'iscott',     category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nSub Status: 0xC000006A\nWorkstation Name: NETSCANNER01\nCaller IP: 192.168.1.150' },
            { id: 4, time: '2026-03-13T06:03:20', eventId: 4625, source: '192.168.1.150', username: 'jpark',      category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nSub Status: 0xC000006A\nWorkstation Name: NETSCANNER01\nCaller IP: 192.168.1.150' },
            { id: 5, time: '2026-03-13T06:03:23', eventId: 4625, source: '192.168.1.150', username: 'kmitchell',  category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nSub Status: 0xC000006A\nWorkstation Name: NETSCANNER01\nCaller IP: 192.168.1.150' },
            { id: 6, time: '2026-03-13T06:03:26', eventId: 4625, source: '192.168.1.150', username: 'gkim',      category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nSub Status: 0xC000006A\nWorkstation Name: NETSCANNER01\nCaller IP: 192.168.1.150' },
            { id: 7, time: '2026-03-13T06:03:29', eventId: 4625, source: '192.168.1.150', username: 'hlewis',     category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nSub Status: 0xC000006A\nWorkstation Name: NETSCANNER01\nCaller IP: 192.168.1.150' },
            { id: 8, time: '2026-03-13T06:03:32', eventId: 4625, source: '192.168.1.150', username: 'iscott',     category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nSub Status: 0xC000006A\nWorkstation Name: NETSCANNER01\nCaller IP: 192.168.1.150' },
            { id: 9, time: '2026-03-13T06:04:01', eventId: 4625, source: '192.168.1.150', username: 'jpark',      category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nSub Status: 0xC000006A\nWorkstation Name: NETSCANNER01\nCaller IP: 192.168.1.150' },
            { id: 10, time: '2026-03-13T06:04:04', eventId: 4625, source: '192.168.1.150', username: 'kmitchell', category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nSub Status: 0xC000006A\nWorkstation Name: NETSCANNER01\nCaller IP: 192.168.1.150' },
            { id: 11, time: '2026-03-13T06:04:07', eventId: 4740, source: '192.168.1.150', username: 'gkim',      category: 'Account Mgmt', desc: 'A user account was locked out.', detail: 'Subject Account Name: HEXWORTH\\gkim\nCaller Computer Name: NETSCANNER01\nLock threshold exceeded (5 attempts)' },
            { id: 12, time: '2026-03-13T06:04:10', eventId: 4740, source: '192.168.1.150', username: 'hlewis',    category: 'Account Mgmt', desc: 'A user account was locked out.', detail: 'Subject Account Name: HEXWORTH\\hlewis\nCaller Computer Name: NETSCANNER01\nLock threshold exceeded (5 attempts)' },
            { id: 13, time: '2026-03-13T06:04:13', eventId: 4740, source: '192.168.1.150', username: 'iscott',    category: 'Account Mgmt', desc: 'A user account was locked out.', detail: 'Subject Account Name: HEXWORTH\\iscott\nCaller Computer Name: NETSCANNER01\nLock threshold exceeded (5 attempts)' },
            { id: 14, time: '2026-03-13T06:04:16', eventId: 4740, source: '192.168.1.150', username: 'jpark',     category: 'Account Mgmt', desc: 'A user account was locked out.', detail: 'Subject Account Name: HEXWORTH\\jpark\nCaller Computer Name: NETSCANNER01\nLock threshold exceeded (5 attempts)' },
            { id: 15, time: '2026-03-13T06:04:19', eventId: 4740, source: '192.168.1.150', username: 'kmitchell', category: 'Account Mgmt', desc: 'A user account was locked out.', detail: 'Subject Account Name: HEXWORTH\\kmitchell\nCaller Computer Name: NETSCANNER01\nLock threshold exceeded (5 attempts)' },
            { id: 16, time: '2026-03-13T06:05:00', eventId: 4625, source: '192.168.1.150', username: 'gkim',      category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Account currently locked out.\nStatus: 0xC0000234\nCaller IP: 192.168.1.150' },
            { id: 17, time: '2026-03-13T06:05:03', eventId: 4625, source: '192.168.1.150', username: 'hlewis',    category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Account currently locked out.\nStatus: 0xC0000234\nCaller IP: 192.168.1.150' },
            { id: 18, time: '2026-03-13T06:05:06', eventId: 4625, source: '192.168.1.150', username: 'iscott',    category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Account currently locked out.\nStatus: 0xC0000234\nCaller IP: 192.168.1.150' },
            { id: 19, time: '2026-03-13T06:05:09', eventId: 4625, source: '192.168.1.150', username: 'jpark',     category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Account currently locked out.\nStatus: 0xC0000234\nCaller IP: 192.168.1.150' },
            { id: 20, time: '2026-03-13T06:05:12', eventId: 4625, source: '192.168.1.150', username: 'kmitchell', category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Account currently locked out.\nStatus: 0xC0000234\nCaller IP: 192.168.1.150' }
        ],
        expired_svc: [
            { id: 1, time: '2026-03-13T07:00:01', eventId: 4625, source: '127.0.0.1', username: 'svc_webportal', category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: The password is expired.\nStatus: 0xC0000224\nSub Status: 0x0\nLogon Type: 5 (Service)\nProcess Name: C:\\Windows\\System32\\inetsrv\\w3wp.exe\nCaller IP: 127.0.0.1' },
            { id: 2, time: '2026-03-13T07:01:15', eventId: 4625, source: '127.0.0.1', username: 'svc_webportal', category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: The password is expired.\nStatus: 0xC0000224\nLogon Type: 5 (Service)\nProcess Name: C:\\Windows\\System32\\inetsrv\\w3wp.exe' },
            { id: 3, time: '2026-03-13T07:01:30', eventId: 4625, source: '127.0.0.1', username: 'svc_webportal', category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: The password is expired.\nStatus: 0xC0000224\nLogon Type: 5 (Service)' },
            { id: 4, time: '2026-03-13T07:01:45', eventId: 4625, source: '127.0.0.1', username: 'svc_webportal', category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: The password is expired.\nStatus: 0xC0000224\nLogon Type: 5 (Service)' },
            { id: 5, time: '2026-03-13T07:02:00', eventId: 4740, source: '127.0.0.1', username: 'svc_webportal', category: 'Account Mgmt', desc: 'A user account was locked out.', detail: 'Subject Account Name: HEXWORTH\\svc_webportal\nCaller Computer Name: DC01\nLock threshold exceeded (5 attempts)' },
            { id: 6, time: '2026-03-13T07:02:01', eventId: 4625, source: '127.0.0.1', username: 'svc_webportal', category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Account currently locked out.\nStatus: 0xC0000234\nLogon Type: 5 (Service)' },
            { id: 7, time: '2026-03-13T07:03:00', eventId: 4625, source: '192.168.1.50', username: 'shall',       category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: The referenced account is currently locked out and may not be logged on to.\nStatus: 0xC0000234' },
            { id: 8, time: '2026-03-13T07:03:15', eventId: 4625, source: '192.168.1.62', username: 'twright',     category: 'Logon', desc: 'Account failed to log on.', detail: 'Portal authentication failure — svc_webportal locked.\nStatus: 0xC0000234' },
            { id: 9, time: '2026-03-13T07:04:00', eventId: 4625, source: '192.168.1.74', username: 'mbrooks',     category: 'Logon', desc: 'Account failed to log on.', detail: 'Portal authentication failure — svc_webportal locked.\nStatus: 0xC0000234' },
            { id: 10, time: '2026-03-13T07:10:00', eventId: 4625, source: '192.168.1.88', username: 'ncole',      category: 'Logon', desc: 'Account failed to log on.', detail: 'Portal authentication failure — svc_webportal locked.\nStatus: 0xC0000234' }
        ],
        brute_force: [
            { id: 1, time: '2026-03-13T10:00:02', eventId: 4625, source: '10.0.0.1', username: 'dkim',       category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nWorkstation Name: VPN-GATEWAY\nCaller IP: 10.0.0.1\nAuth Package: Kerberos' },
            { id: 2, time: '2026-03-13T10:00:04', eventId: 4625, source: '10.0.0.1', username: 'evasquez',   category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nWorkstation Name: VPN-GATEWAY\nCaller IP: 10.0.0.1' },
            { id: 3, time: '2026-03-13T10:00:06', eventId: 4625, source: '10.0.0.1', username: 'fdesouza',   category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nWorkstation Name: VPN-GATEWAY\nCaller IP: 10.0.0.1' },
            { id: 4, time: '2026-03-13T10:00:08', eventId: 4625, source: '10.0.0.1', username: 'gwatts',     category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nCaller IP: 10.0.0.1' },
            { id: 5, time: '2026-03-13T10:00:10', eventId: 4625, source: '10.0.0.1', username: 'hnash',      category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nCaller IP: 10.0.0.1' },
            { id: 6, time: '2026-03-13T10:00:12', eventId: 4625, source: '10.0.0.1', username: 'arodriguez', category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nCaller IP: 10.0.0.1' },
            { id: 7, time: '2026-03-13T10:00:14', eventId: 4625, source: '10.0.0.1', username: 'lreyes',     category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nCaller IP: 10.0.0.1' },
            { id: 8, time: '2026-03-13T10:00:16', eventId: 4625, source: '10.0.0.1', username: 'fturner',    category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nCaller IP: 10.0.0.1' },
            { id: 9, time: '2026-03-13T10:00:18', eventId: 4625, source: '10.0.0.1', username: 'rhuang',     category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nCaller IP: 10.0.0.1' },
            { id: 10, time: '2026-03-13T10:00:20', eventId: 4625, source: '10.0.0.1', username: 'shall',     category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nCaller IP: 10.0.0.1' },
            { id: 11, time: '2026-03-13T10:00:22', eventId: 4625, source: '10.0.0.1', username: 'mwebb',     category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nCaller IP: 10.0.0.1' },
            { id: 12, time: '2026-03-13T10:00:24', eventId: 4625, source: '10.0.0.1', username: 'dtorres',   category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nCaller IP: 10.0.0.1' },
            { id: 13, time: '2026-03-13T10:02:00', eventId: 4740, source: '10.0.0.1', username: 'dkim',      category: 'Account Mgmt', desc: 'A user account was locked out.', detail: 'Subject Account Name: HEXWORTH\\dkim\nCaller Computer Name: VPN-GATEWAY\nLock threshold exceeded.' },
            { id: 14, time: '2026-03-13T10:02:02', eventId: 4740, source: '10.0.0.1', username: 'evasquez',  category: 'Account Mgmt', desc: 'A user account was locked out.', detail: 'Subject Account Name: HEXWORTH\\evasquez\nCaller Computer Name: VPN-GATEWAY' },
            { id: 15, time: '2026-03-13T10:02:04', eventId: 4740, source: '10.0.0.1', username: 'fdesouza',  category: 'Account Mgmt', desc: 'A user account was locked out.', detail: 'Subject Account Name: HEXWORTH\\fdesouza\nCaller Computer Name: VPN-GATEWAY' },
            { id: 16, time: '2026-03-13T10:02:06', eventId: 4740, source: '10.0.0.1', username: 'gwatts',    category: 'Account Mgmt', desc: 'A user account was locked out.', detail: 'Subject Account Name: HEXWORTH\\gwatts\nCaller Computer Name: VPN-GATEWAY' },
            { id: 17, time: '2026-03-13T10:02:08', eventId: 4740, source: '10.0.0.1', username: 'hnash',     category: 'Account Mgmt', desc: 'A user account was locked out.', detail: 'Subject Account Name: HEXWORTH\\hnash\nCaller Computer Name: VPN-GATEWAY' },
            { id: 18, time: '2026-03-13T10:02:10', eventId: 4740, source: '10.0.0.1', username: 'arodriguez',category: 'Account Mgmt', desc: 'A user account was locked out.', detail: 'Subject Account Name: HEXWORTH\\arodriguez\nCaller Computer Name: VPN-GATEWAY' },
            { id: 19, time: '2026-03-13T10:05:00', eventId: 4625, source: '10.0.0.1', username: 'ppatel',    category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nCaller IP: 10.0.0.1' },
            { id: 20, time: '2026-03-13T10:05:02', eventId: 4625, source: '10.0.0.1', username: 'jlee',      category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nCaller IP: 10.0.0.1' },
            { id: 21, time: '2026-03-13T10:05:04', eventId: 4625, source: '10.0.0.1', username: 'cmorgan',   category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nCaller IP: 10.0.0.1' },
            { id: 22, time: '2026-03-13T10:05:06', eventId: 4625, source: '10.0.0.1', username: 'lreyes',    category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nCaller IP: 10.0.0.1' }
        ],
        gpo_misconfig: [
            { id: 1, time: '2026-03-13T08:01:22', eventId: 4740, source: 'DC01', username: 'obaker',      category: 'Account Mgmt', desc: 'A user account was locked out.', detail: 'Subject Account Name: HEXWORTH\\obaker\nCaller Computer Name: DESK-047\nLock threshold: 1 attempt\nNote: Policy applied from Default Domain Policy' },
            { id: 2, time: '2026-03-13T08:03:45', eventId: 4740, source: 'DC01', username: 'sevans',      category: 'Account Mgmt', desc: 'A user account was locked out.', detail: 'Subject Account Name: HEXWORTH\\sevans\nCaller Computer Name: DESK-022\nLock threshold: 1 attempt' },
            { id: 3, time: '2026-03-13T08:06:11', eventId: 4740, source: 'DC01', username: 'wchang',      category: 'Account Mgmt', desc: 'A user account was locked out.', detail: 'Subject Account Name: HEXWORTH\\wchang\nCaller Computer Name: DESK-091\nLock threshold: 1 attempt' },
            { id: 4, time: '2026-03-13T08:08:55', eventId: 4740, source: 'DC01', username: 'ncole',       category: 'Account Mgmt', desc: 'A user account was locked out.', detail: 'Subject Account Name: HEXWORTH\\ncole\nCaller Computer Name: DESK-033\nLock threshold: 1 attempt' },
            { id: 5, time: '2026-03-13T08:10:02', eventId: 4625, source: '192.168.1.71', username: 'tgreen', category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Wrong Password.\nStatus: 0xC000006A (single attempt — lockout triggered)' },
            { id: 6, time: '2026-03-13T08:10:03', eventId: 4740, source: 'DC01', username: 'tgreen',      category: 'Account Mgmt', desc: 'A user account was locked out.', detail: 'Subject Account Name: HEXWORTH\\tgreen\nCaller Computer Name: DESK-071\nLock threshold: 1 attempt' },
            { id: 7, time: '2026-03-13T08:12:30', eventId: 4625, source: '192.168.1.85', username: 'usantos', category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Wrong Password.\nStatus: 0xC000006A (single attempt — lockout triggered)' },
            { id: 8, time: '2026-03-13T08:12:31', eventId: 4740, source: 'DC01', username: 'usantos',     category: 'Account Mgmt', desc: 'A user account was locked out.', detail: 'Subject Account Name: HEXWORTH\\usantos\nCaller Computer Name: DESK-085\nLock threshold: 1 attempt' },
            { id: 9, time: '2026-03-13T08:15:44', eventId: 4740, source: 'DC01', username: 'ladams',      category: 'Account Mgmt', desc: 'A user account was locked out.', detail: 'Subject Account Name: HEXWORTH\\ladams\nCaller Computer Name: DESK-014\nLock threshold: 1 attempt' },
            { id: 10, time: '2026-03-13T08:18:22', eventId: 4740, source: 'DC01', username: 'cmendez',    category: 'Account Mgmt', desc: 'A user account was locked out.', detail: 'Subject Account Name: HEXWORTH\\cmendez\nCaller Computer Name: DESK-056\nLock threshold: 1 attempt' }
        ],
        rogue_task: [
            { id: 1, time: '2026-03-13T14:00:01', eventId: 4625, source: '192.168.1.142', username: 'dtorres',    category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nWorkstation Name: DESK-142\nCaller IP: 192.168.1.142' },
            { id: 2, time: '2026-03-13T14:00:02', eventId: 4625, source: '192.168.1.142', username: 'snguyen',    category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nWorkstation Name: DESK-142\nCaller IP: 192.168.1.142' },
            { id: 3, time: '2026-03-13T14:00:03', eventId: 4625, source: '192.168.1.142', username: 'rchen',      category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nWorkstation Name: DESK-142\nCaller IP: 192.168.1.142' },
            { id: 4, time: '2026-03-13T14:00:04', eventId: 4625, source: '192.168.1.142', username: 'yokafor',    category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nWorkstation Name: DESK-142\nCaller IP: 192.168.1.142' },
            { id: 5, time: '2026-03-13T14:00:05', eventId: 4625, source: '192.168.1.142', username: 'vprice',     category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nWorkstation Name: DESK-142\nCaller IP: 192.168.1.142' },
            { id: 6, time: '2026-03-13T14:00:06', eventId: 4625, source: '192.168.1.142', username: 'dwilson',    category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nWorkstation Name: DESK-142\nCaller IP: 192.168.1.142' },
            { id: 7, time: '2026-03-13T14:00:07', eventId: 4625, source: '192.168.1.142', username: 'eclark',     category: 'Logon', desc: 'Account failed to log on.', detail: 'Failure Reason: Unknown user name or bad password.\nStatus: 0xC000006A\nWorkstation Name: DESK-142\nCaller IP: 192.168.1.142' },
            { id: 8, time: '2026-03-13T14:00:08', eventId: 4740, source: '192.168.1.142', username: 'dtorres',    category: 'Account Mgmt', desc: 'A user account was locked out.', detail: 'Subject Account Name: HEXWORTH\\dtorres\nCaller Computer Name: DESK-142\nLock threshold exceeded.' },
            { id: 9, time: '2026-03-13T14:00:09', eventId: 4740, source: '192.168.1.142', username: 'snguyen',    category: 'Account Mgmt', desc: 'A user account was locked out.', detail: 'Subject Account Name: HEXWORTH\\snguyen\nCaller Computer Name: DESK-142\nLock threshold exceeded.' },
            { id: 10, time: '2026-03-13T14:00:10', eventId: 4740, source: '192.168.1.142', username: 'rchen',     category: 'Account Mgmt', desc: 'A user account was locked out.', detail: 'Subject Account Name: HEXWORTH\\rchen\nCaller Computer Name: DESK-142\nLock threshold exceeded.' },
            { id: 11, time: '2026-03-13T14:00:11', eventId: 4740, source: '192.168.1.142', username: 'yokafor',   category: 'Account Mgmt', desc: 'A user account was locked out.', detail: 'Subject Account Name: HEXWORTH\\yokafor\nCaller Computer Name: DESK-142\nLock threshold exceeded.' },
            { id: 12, time: '2026-03-13T14:00:12', eventId: 4740, source: '192.168.1.142', username: 'vprice',    category: 'Account Mgmt', desc: 'A user account was locked out.', detail: 'Subject Account Name: HEXWORTH\\vprice\nCaller Computer Name: DESK-142\nLock threshold exceeded.' }
        ]
    },

    // ==========================================================
    // GPO STATE (modified per scenario)
    // ==========================================================

    _gpoState: {
        lockoutThreshold: 5,        // S4 breaks this to 1
        lockoutDuration: 30,        // S4 breaks this to 0 (permanent)
        lockoutCounterReset: 30,
        minPasswordLength: 12,
        passwordComplexity: true,
        passwordHistory: 10,
        maxPasswordAge: 90
    },

    // ==========================================================
    // SCENARIO HINTS
    // ==========================================================

    _defaultHints: [
        { id: 'hint1', text: 'Open the Help Desk Ticket first, then use Event Viewer to identify the source of the lockouts.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Event IDs 4625 (failed logon) and 4740 (account lockout) are your primary diagnostic events. Look at the source IP and caller computer.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use Search-ADAccount -LockedOut or Unlock-ADAccount in PowerShell, and open ADUC to manage accounts. The root cause fix matters as much as unlocking.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Each scenario requires two steps: fix the root cause AND unlock the affected accounts. The flag only appears after both are done.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        stale_creds: [
            { id: 'hint1', text: 'Open Event Viewer and filter for Event ID 4625. Look at the source IP — is it a legitimate user workstation?', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'All failures come from 192.168.1.150 at 6 AM. That is not a user — it is a network device using old credentials for scan-to-folder access.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Open Network Device Config (scanner), update the stored credentials to the current Finance share password. Then unlock the Finance accounts in ADUC or with Unlock-ADAccount.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Full fix: (1) Event Viewer shows 192.168.1.150 as source, (2) Open Network Device Config and update scanner credentials, (3) Unlock gkim, hlewis, iscott, jpark, kmitchell via ADUC or PowerShell.', cost: 50, penalty: -50 }
        ],
        expired_svc: [
            { id: 'hint1', text: 'The portal is broken for everyone at once — this is not a user account problem. Open Event Viewer and look for Logon Type 5 (Service) failures.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Event ID 4625 shows svc_webportal failing with Status 0xC0000224 — that is an expired password. The IIS app pool is using stale credentials.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'In ADUC, find svc_webportal in Service Accounts OU. Reset the password. Then open IIS Manager and update WebPortalPool identity with the new password.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Full fix: (1) ADUC -> Service Accounts -> svc_webportal -> Reset Password, (2) IIS Manager -> Application Pools -> WebPortalPool -> Advanced Settings -> Identity -> update password.', cost: 50, penalty: -50 }
        ],
        brute_force: [
            { id: 'hint1', text: 'Open Event Viewer and look at the 4625 failures. Are they all coming from the same source IP? What is that IP?', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'All failures originate from 10.0.0.1 (VPN Gateway). This is an external credential stuffing attack. You need to block it AND unlock the victims.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Open Firewall Console and add a deny rule for source IP 10.0.0.1. Then bulk-unlock accounts with: Search-ADAccount -LockedOut | Unlock-ADAccount', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Full fix: (1) Event Viewer confirms 10.0.0.1 as attacker, (2) Firewall Console -> Add Rule -> Deny inbound from 10.0.0.1, (3) PowerShell bulk unlock.', cost: 50, penalty: -50 }
        ],
        gpo_misconfig: [
            { id: 'hint1', text: 'Run Get-ADDefaultDomainPasswordPolicy to see the current lockout threshold. Does it match normal policy?', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The lockout threshold is set to 1 — one wrong password locks you out permanently (duration 0). Open Group Policy Management to find and fix it.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'In GPO Management, open Default Domain Policy -> Computer Config -> Windows Settings -> Security Settings -> Account Lockout Policy. Set threshold to 5, duration to 30.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Full fix: (1) GPO Management -> fix threshold=5, duration=30, counter reset=30, (2) Run gpupdate /force, (3) Unlock locked accounts in ADUC or via Unlock-ADAccount.', cost: 50, penalty: -50 }
        ],
        rogue_task: [
            { id: 'hint1', text: 'Event ID 4740 lockouts at exactly 2:00 PM every day. Filter Event Viewer and look at the Caller Computer Name field in each lockout event.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'All lockouts cite caller computer DESK-142 (192.168.1.142). That machine belongs to a contractor who left 10 days ago. The workstation is still running.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Open Network Management and find the switch port connected to 192.168.1.142. Disable that port to cut off the rogue device. Then unlock the affected accounts.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Full fix: (1) Event Viewer confirms DESK-142 / 192.168.1.142 as source, (2) Network Management -> disable switch port, (3) Unlock dtorres, snguyen, rchen, yokafor, vprice via ADUC or PowerShell.', cost: 50, penalty: -50 }
        ]
    },

    // ==========================================================
    // HELPERS
    // ==========================================================

    _ensureScenario: function(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !AD001Config._flagRestored) {
            AD001Config._flagRestored = true;
            var scenario = AD001Config._scenarios[engine.state._scenarioId];
            if (scenario) {
                AD001Config.flags[0].value = AD001Config._scenarioFlags[scenario.id];
                AD001Config.hints = AD001Config._scenarioHints[scenario.id] || AD001Config._defaultHints;
                if (engine._computeFlagHashes) engine._computeFlagHashes();
            }
        }
        return true;
    },

    _applyScenario: function(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._scenarioSelected = true;

        // Reset all scenario state
        engine.state._scannerCredsUpdated = false;
        engine.state._s1AccountsUnlocked = false;
        engine.state._svcPasswordReset = false;
        engine.state._iisPoolUpdated = false;
        engine.state._firewallRuleAdded = false;
        engine.state._s3AccountsUnlocked = false;
        engine.state._gpoFixed = false;
        engine.state._gpupdateRun = false;
        engine.state._s4AccountsUnlocked = false;
        engine.state._roguePortDisabled = false;
        engine.state._s5AccountsUnlocked = false;
        engine.state._labComplete = false;
        engine.state._flagRevealed = false;
        engine.state._unlockedAccounts = {};

        // Apply scenario GPO overrides
        engine.state._gpoThreshold = AD001Config._gpoState.lockoutThreshold;
        engine.state._gpoDuration = AD001Config._gpoState.lockoutDuration;
        engine.state._gpoCounterReset = AD001Config._gpoState.lockoutCounterReset;

        if (idx === 3) {
            // S4: GPO misconfiguration
            engine.state._gpoThreshold = 1;
            engine.state._gpoDuration = 0;
        }

        // Apply scenario-specific state overrides
        var overrides = AD001Config._scenarios[idx].stateOverrides || {};
        for (var key in overrides) {
            engine.state[key] = overrides[key];
        }

        // Set S2: mark svc_webportal as expired
        if (idx === 1) {
            engine.state._svcExpired = true;
        } else {
            engine.state._svcExpired = false;
        }

        var scenario = AD001Config._scenarios[idx];
        AD001Config.flags[0].value = AD001Config._scenarioFlags[scenario.id];
        AD001Config._flagRestored = true;
        AD001Config.hints = AD001Config._scenarioHints[scenario.id] || AD001Config._defaultHints;

        engine.save();
        if (engine._computeFlagHashes) engine._computeFlagHashes();
    },

    _getScenario: function(engine) {
        if (engine.state._scenarioId == null) return null;
        return AD001Config._scenarios[engine.state._scenarioId];
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

    // Returns effective locked status for a username in current scenario
    _isLocked: function(username, engine) {
        var scenario = AD001Config._getScenario(engine);
        if (!scenario) return false;
        var unlocked = engine.state._unlockedAccounts || {};
        if (unlocked[username]) return false;

        if (scenario.id === 'stale_creds' && AD001Config._s1LockedUsers.indexOf(username) !== -1) return !engine.state._s1AccountsUnlocked;
        if (scenario.id === 'expired_svc' && username === 'svc_webportal') return !engine.state._svcPasswordReset;
        if (scenario.id === 'brute_force') {
            var s3Locked = ['dkim','evasquez','fdesouza','gwatts','hnash','arodriguez','lreyes','fturner','rhuang','shall','mwebb','dtorres'];
            return s3Locked.indexOf(username) !== -1 && !engine.state._s3AccountsUnlocked;
        }
        if (scenario.id === 'gpo_misconfig') {
            var s4Locked = ['obaker','sevans','wchang','ncole','tgreen','usantos','ladams','cmendez'];
            return s4Locked.indexOf(username) !== -1 && !engine.state._s4AccountsUnlocked;
        }
        if (scenario.id === 'rogue_task') {
            var s5Locked = ['dtorres','snguyen','rchen','yokafor','vprice','dwilson','eclark'];
            return s5Locked.indexOf(username) !== -1 && !engine.state._s5AccountsUnlocked;
        }
        return false;
    },

    // Check if the complete fix for the current scenario is done
    _checkLockoutFix: function(engine) {
        var scenario = AD001Config._getScenario(engine);
        if (!scenario || engine.state._labComplete) return;

        var done = false;
        if (scenario.id === 'stale_creds')   done = engine.state._scannerCredsUpdated && engine.state._s1AccountsUnlocked;
        if (scenario.id === 'expired_svc')   done = engine.state._svcPasswordReset && engine.state._iisPoolUpdated;
        if (scenario.id === 'brute_force')   done = engine.state._firewallRuleAdded && engine.state._s3AccountsUnlocked;
        if (scenario.id === 'gpo_misconfig') done = engine.state._gpoFixed && engine.state._gpupdateRun && engine.state._s4AccountsUnlocked;
        if (scenario.id === 'rogue_task')    done = engine.state._roguePortDisabled && engine.state._s5AccountsUnlocked;

        if (done) {
            engine.state._labComplete = true;
            engine.state._flagRevealed = true;
            engine.save();
            setTimeout(function() {
                engine.notify('Incident resolved. All root causes addressed and accounts restored. Check ADUC for the incident closure token.', 'success');
            }, 400);
        }
    },

    // ==========================================================
    // BOOT SEQUENCE (Windows Server)
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
    // TERMINAL CONFIG (PowerShell)
    // ==========================================================

    terminal: {
        user: 'Administrator',
        hostname: 'DC01',
        startDir: 'C:\\Windows\\System32',
        promptStyle: 'powershell',
        welcome: 'Windows PowerShell\nCopyright (C) Microsoft Corporation. All rights reserved.\n\nInstall the latest PowerShell for new features and improvements! https://aka.ms/PSWindows\n'
    },

    // ==========================================================
    // FILESYSTEM (minimal — AD lab, not a file lab)
    // ==========================================================

    filesystem: {
        '/': { type: 'dir', children: {} }
    },

    // ==========================================================
    // FLAGS
    // ==========================================================

    flags: [
        { id: 'fixed', value: 'flag{placeholder}', points: 500 }
    ],

    // ==========================================================
    // SCORING
    // ==========================================================

    scoring: {
        base: 0,
        maxScore: 600,
        hintPenalty: true,
        wrongFlagPenalty: 0,
        speedBonus: { threshold: 600000, points: 100 },
        timeBonusThreshold: 2400
    },

    // ==========================================================
    // HINTS (replaced per-scenario by _applyScenario)
    // ==========================================================

    hints: [
        { id: 'hint1', text: 'Open the Help Desk Ticket, then use Event Viewer to identify lockout sources.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Event IDs 4625 and 4740 reveal who is locking out accounts and from where.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Fix the root cause first, then unlock accounts. Both steps are required for the flag.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears in ADUC after both the root cause fix and account unlocks are complete.', cost: 50, penalty: -50 }
    ],

    // ==========================================================
    // LORE
    // ==========================================================

    lore: {
        intro: 'A wave of account lockout incidents has hit HEXWORTH domain. Users cannot authenticate, help desk calls are flooding in, and operations are grinding to a halt. As the Domain Administrator, your job is to diagnose the root cause and restore normal authentication.',
        scenario: 'Account lockouts in Active Directory rarely happen by accident. Common causes include stale credentials on devices, expired service accounts, brute force attacks, misconfigured Group Policy, or rogue processes. Your job is to identify which pattern is occurring and stop it.',
        outro: 'Authentication storm contained. Root cause identified and neutralized. Affected accounts restored. Document the incident and schedule a post-mortem to prevent recurrence.'
    },

    // ==========================================================
    // PHASES
    // ==========================================================

    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read the help desk ticket and review Event Viewer for lockout patterns.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the root cause: source IP, caller computer, policy issue, or expired account.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Remediation', description: 'Fix the root cause and unlock affected accounts.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm the lockout storm has stopped and retrieve the incident closure flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    // ==========================================================
    // POWERSHELL COMMANDS
    // ==========================================================

    commands: {

        // --- GET-ADUSER ---

        'get-aduser': function(args, term, engine) {
            var gate = AD001Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ');
            var lower = joined.toLowerCase();

            // Get-ADUser -Filter * -Properties LockedOut | Where LockedOut / Search-ADAccount -LockedOut pattern
            if (lower.includes('-filter') && lower.includes('lockedout') && (lower.includes('where') || lower.includes('where-object'))) {
                return AD001Config._cmdListLockedUsers(engine);
            }

            // Get-ADUser -Filter * (list all, abbreviated)
            if (lower.includes('-filter') && lower.includes('*') && !lower.includes('lockedout')) {
                var out = '\n';
                out += 'DistinguishedName                                    Enabled  Name                  ObjectClass  SamAccountName\n';
                out += '---                                                  -------  ----                  -----------  --------------\n';
                AD001Config._domainUsers.forEach(function(u) {
                    var locked = AD001Config._isLocked(u.username, engine);
                    var en = locked ? 'False  ' : 'True   ';
                    out += ('CN=' + u.name + ',OU=' + u.ou + ',DC=hexworth,DC=local').substring(0, 50).padEnd(52) + en + u.name.substring(0, 22).padEnd(22) + '  user         ' + u.username + '\n';
                });
                return out;
            }

            // Get-ADUser username -Properties *
            var targetUser = null;
            // Check if first arg is not a flag
            if (args.length > 0 && !args[0].startsWith('-')) {
                targetUser = args[0].toLowerCase().replace(/^-identity\s*/i, '');
            }
            // Or -Identity username
            var identMatch = joined.match(/-identity\s+(\S+)/i);
            if (identMatch) targetUser = identMatch[1].toLowerCase();

            if (targetUser) {
                var found = AD001Config._domainUsers.filter(function(u) { return u.username.toLowerCase() === targetUser; })[0];
                if (!found) return '\nGet-ADUser : Cannot find an object with identity: \'' + targetUser + '\'.\nAt line:1 char:1\n';
                var locked = AD001Config._isLocked(found.username, engine);
                var pwAge = Math.floor((new Date() - new Date(found.passwordLastSet)) / (1000 * 60 * 60 * 24));
                return '\nDistinguishedName : CN=' + found.name + ',OU=' + found.ou + ',DC=hexworth,DC=local'
                    + '\nEnabled           : ' + (locked ? 'False' : 'True')
                    + '\nGivenName         : ' + found.name.split(' ')[0]
                    + '\nLockedOut         : ' + (locked ? 'True' : 'False')
                    + '\nName              : ' + found.name
                    + '\nObjectClass       : user'
                    + '\nPasswordExpired   : ' + (found.username === 'svc_webportal' && engine.state._svcExpired ? 'True' : 'False')
                    + '\nPasswordLastSet   : ' + found.passwordLastSet.replace('T', ' ').substring(0, 19)
                    + '\nPasswordAge       : ' + pwAge + ' days'
                    + '\nSamAccountName    : ' + found.username
                    + '\nSurname           : ' + (found.name.split(' ')[1] || '')
                    + '\nTitle             : ' + found.title
                    + '\nUserPrincipalName : ' + found.email
                    + '\nMemberOf          : ' + found.memberOf.join(', ')
                    + '\nOU                : ' + found.ou + '\n';
            }

            return '\nGet-ADUser : A parameter cannot be found that matches parameter name.\nUsage: Get-ADUser -Identity <username> [-Properties *]\n       Get-ADUser -Filter * [-Properties LockedOut]\n';
        },

        // --- SEARCH-ADACCOUNT ---

        'search-adaccount': function(args, term, engine) {
            var gate = AD001Config._requireScenario(engine);
            if (gate) return gate;
            var lower = args.join(' ').toLowerCase();
            if (lower.includes('lockedout')) {
                return AD001Config._cmdListLockedUsers(engine);
            }
            return '\nSearch-ADAccount : Please specify a search parameter such as -LockedOut, -PasswordExpired, -AccountDisabled.\n';
        },

        // --- UNLOCK-ADACCOUNT ---

        'unlock-adaccount': function(args, term, engine) {
            var gate = AD001Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ');
            var lower = joined.toLowerCase();

            // Piped from Search-ADAccount (bulk unlock)
            // PowerShell doesn't truly pipe here but we detect the pattern
            // Users often type the piped form as one command
            if (lower.includes('search-adaccount') && lower.includes('lockedout')) {
                return AD001Config._cmdBulkUnlock(engine);
            }

            var identMatch = joined.match(/-identity\s+(\S+)/i);
            var target = identMatch ? identMatch[1].toLowerCase() : (args[0] && !args[0].startsWith('-') ? args[0].toLowerCase() : null);

            if (!target) return '\nUnlock-ADAccount : Parameter -Identity is required.\n';

            var found = AD001Config._domainUsers.filter(function(u) { return u.username.toLowerCase() === target; })[0];
            if (!found) return '\nUnlock-ADAccount : Cannot find an object with identity: \'' + target + '\'.\n';

            var locked = AD001Config._isLocked(found.username, engine);
            if (!locked) return '\n(no output — ' + found.username + ' is not locked)\n';

            // Unlock the individual account
            if (!engine.state._unlockedAccounts) engine.state._unlockedAccounts = {};
            engine.state._unlockedAccounts[found.username] = true;

            // Check if scenario-specific locked users are now all unlocked
            AD001Config._checkBulkUnlockProgress(engine);
            engine.save();
            AD001Config._checkLockoutFix(engine);
            return '\n(no output — ' + found.username + ' unlocked successfully)\n';
        },

        // --- SET-ADACCOUNTPASSWORD ---

        'set-adaccountpassword': function(args, term, engine) {
            var gate = AD001Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ');
            var lower = joined.toLowerCase();
            var identMatch = joined.match(/-identity\s+(\S+)/i);
            var target = identMatch ? identMatch[1].toLowerCase() : null;

            if (!target) return '\nSet-ADAccountPassword : Parameter -Identity is required.\n';
            if (!lower.includes('-reset')) return '\nSet-ADAccountPassword : The -Reset parameter is required to reset a password.\nUsage: Set-ADAccountPassword -Identity <user> -Reset -NewPassword (ConvertTo-SecureString "NewPass123!" -AsPlainText -Force)\n';

            var found = AD001Config._domainUsers.filter(function(u) { return u.username.toLowerCase() === target; })[0];
            if (!found) return '\nSet-ADAccountPassword : Cannot find an object with identity: \'' + target + '\'.\n';

            if (target === 'svc_webportal') {
                engine.state._svcExpired = false;
                engine.state._svcPasswordReset = true;
                if (!engine.state._unlockedAccounts) engine.state._unlockedAccounts = {};
                engine.state._unlockedAccounts['svc_webportal'] = true;
                engine.save();
                engine.notify('svc_webportal password reset. Now update the IIS App Pool identity in IIS Manager.', 'success');
                AD001Config._checkLockoutFix(engine);
                return '\n(no output — password reset successfully)\nNote: Update the IIS WebPortalPool identity with the new password.\n';
            }

            return '\n(no output — password for ' + found.username + ' reset successfully)\n';
        },

        // --- GET-ADDEFAULTDOMAINPASSWORDPOLICY ---

        'get-addefaultdomainpasswordpolicy': function(args, term, engine) {
            var gate = AD001Config._requireScenario(engine);
            if (gate) return gate;
            var threshold = engine.state._gpoThreshold !== undefined ? engine.state._gpoThreshold : 5;
            var duration = engine.state._gpoDuration !== undefined ? engine.state._gpoDuration : 30;
            var counterReset = engine.state._gpoCounterReset !== undefined ? engine.state._gpoCounterReset : 30;
            return '\n'
                + 'ComplexityEnabled           : True\n'
                + 'DistinguishedName           : DC=hexworth,DC=local\n'
                + 'LockoutDuration             : ' + (duration === 0 ? '00:00:00 (permanent until admin unlock)' : '00:' + String(duration).padStart(2, '0') + ':00') + '\n'
                + 'LockoutObservationWindow    : 00:' + String(counterReset).padStart(2, '0') + ':00\n'
                + 'LockoutThreshold            : ' + threshold + '\n'
                + 'MaxPasswordAge              : 90.00:00:00\n'
                + 'MinPasswordAge              : 1.00:00:00\n'
                + 'MinPasswordLength           : 12\n'
                + 'PasswordHistoryCount        : 10\n'
                + 'ReversibleEncryptionEnabled : False\n';
        },

        // --- GPUPDATE ---

        gpupdate: function(args, term, engine) {
            var gate = AD001Config._requireScenario(engine);
            if (gate) return gate;
            var lower = args.join(' ').toLowerCase();
            var scenario = AD001Config._getScenario(engine);
            if (lower.includes('/force') || lower.includes('-force')) {
                engine.state._gpupdateRun = true;
                engine.save();
                if (scenario && scenario.id === 'gpo_misconfig' && engine.state._gpoFixed) {
                    AD001Config._checkLockoutFix(engine);
                }
                return '\nUpdating policy...\n\nComputer Policy update has completed successfully.\nUser Policy update has completed successfully.\n';
            }
            return '\nUpdating policy...\n\nComputer Policy update has completed successfully.\nUser Policy update has completed successfully.\n(Use /force to force a full policy refresh)\n';
        },

        // --- GPRESULT ---

        gpresult: function(args, term, engine) {
            var gate = AD001Config._requireScenario(engine);
            if (gate) return gate;
            var threshold = engine.state._gpoThreshold !== undefined ? engine.state._gpoThreshold : 5;
            var duration = engine.state._gpoDuration !== undefined ? engine.state._gpoDuration : 30;
            return '\nMicrosoft (R) Windows (R) Operating System Group Policy Result tool v2.0\n'
                + '\nCreated on ' + new Date().toLocaleDateString('en-US') + '\n'
                + '\nCOMPUTER SETTINGS\n'
                + '----------------\n'
                + '    CN=DC01,OU=Domain Controllers,DC=hexworth,DC=local\n\n'
                + '    Applied Group Policy Objects\n'
                + '    ---------------------------\n'
                + '        Default Domain Controllers Policy\n'
                + '        Default Domain Policy\n\n'
                + '    Account Policies (from Default Domain Policy)\n'
                + '    -----------------------------------------------\n'
                + '        Account Lockout Threshold: ' + threshold + ' invalid logon attempt(s)\n'
                + '        Account Lockout Duration: ' + (duration === 0 ? 'Until unlocked by administrator' : duration + ' minutes') + '\n'
                + '        Reset Account Lockout Counter: ' + (engine.state._gpoCounterReset || 30) + ' minutes\n'
                + '        Minimum Password Length: 12\n'
                + '        Password Complexity: Enabled\n';
        },

        // --- NET USER ---

        net: function(args, term, engine) {
            var gate = AD001Config._requireScenario(engine);
            if (gate) return gate;
            var lower = args.join(' ').toLowerCase();
            if (lower.startsWith('user ') || lower.startsWith('user\t')) {
                var parts = args.slice(1);
                var domainFlag = parts.indexOf('/domain');
                var username = parts[0] ? parts[0].toLowerCase() : null;
                if (username) {
                    var found = AD001Config._domainUsers.filter(function(u) { return u.username.toLowerCase() === username; })[0];
                    if (!found) return '\nThe user name could not be found.\nMore help is available by typing NET HELPMSG 2221.\n';
                    var locked = AD001Config._isLocked(found.username, engine);
                    var pwExpired = found.username === 'svc_webportal' && engine.state._svcExpired;
                    return '\nUser name                    ' + found.username
                        + '\nFull Name                    ' + found.name
                        + '\nComment                      ' + found.title
                        + '\nUser\'s comment'
                        + '\nCountry/region code          001 (United States)'
                        + '\nAccount active               ' + (locked ? 'No  (Account Locked)' : 'Yes')
                        + '\nAccount expires              Never'
                        + '\n'
                        + '\nPassword last set            ' + found.passwordLastSet.split('T')[0]
                        + '\nPassword expires             ' + (pwExpired ? 'Password EXPIRED' : 'Never')
                        + '\nPassword changeable          ' + found.passwordLastSet.split('T')[0]
                        + '\nPassword required            Yes'
                        + '\nUser may change password     Yes'
                        + '\n'
                        + '\nWorkstations allowed         All'
                        + '\nLogon script'
                        + '\nUser profile'
                        + '\nHome directory'
                        + '\nLast logon                   ' + found.lastLogon.replace('T', ' ').substring(0, 16)
                        + '\n'
                        + '\nLogon hours allowed          All'
                        + '\n'
                        + '\nLocal Group Memberships'
                        + '\nGlobal Group memberships     *' + found.memberOf.join('  *')
                        + '\nThe command completed successfully.\n';
                }
            }
            if (lower.includes('accounts')) {
                return '\nForce user logoff how long after time expires?:       Never\nMinimum password age (days):                          1\nMaximum password age (days):                          90\nMinimum password length:                              12\nLength of password history maintained:                10\nLockout threshold:                                    ' + (engine.state._gpoThreshold || 5) + '\nLockout duration (minutes):                           ' + (engine.state._gpoDuration || 30) + '\nLockout observation window (minutes):                 ' + (engine.state._gpoCounterReset || 30) + '\nComputer role:                                        PRIMARY\nThe command completed successfully.\n';
            }
            return '\nThe syntax of this command is:\n\nNET USER [username [/DOMAIN]]\nNET ACCOUNTS [/DOMAIN]\n';
        },

        // --- WHOAMI / HOSTNAME ---

        whoami: function() { return 'HEXWORTH\\Administrator'; },
        hostname: function() { return 'DC01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },

        dir: function() {
            return ' Volume in drive C has no label.\n Volume Serial Number is 9C7D-3E5F\n\n Directory of C:\\Windows\\System32\n\n03/13/2026  08:00 AM    <DIR>          .\n03/13/2026  08:00 AM    <DIR>          ..\n03/13/2026  08:00 AM    <DIR>          WindowsPowerShell\n               0 File(s)              0 bytes\n               3 Dir(s)  102,400,000,000 bytes free';
        },

        // Block Linux-only commands with helpful responses
        ifconfig: function() { return '\'ifconfig\' is not recognized. On Windows Server, use: Get-NetIPAddress or ipconfig'; },
        grep:     function() { return '\'grep\' is not recognized. On PowerShell, use: Select-String or Where-Object'; },
        sudo:     function() { return '\'sudo\' is not recognized. Run PowerShell as Administrator or use: Start-Process -Verb RunAs'; },
        ls:       function() { return '\'ls\' is an alias for Get-ChildItem in PowerShell.\nDirectory: C:\\Windows\\System32\n\n    Directory: C:\\Windows\\System32\n\nMode     LastWriteTime   Length Name\n----     -------------   ------ ----\nd-----   3/13/2026       <DIR>  WindowsPowerShell\nd-----   3/13/2026       <DIR>  drivers\nd-----   3/13/2026       <DIR>  spool'; },
        bash:     function() { return '\'bash\' is not recognized as the name of a cmdlet, function, script file, or operable program.'; },
        chmod:    function() { return '\'chmod\' is not recognized. Use Set-Acl in PowerShell for permission management.'; }
    },

    // ==========================================================
    // HELPER — list locked users (shared by multiple commands)
    // ==========================================================

    _cmdListLockedUsers: function(engine) {
        var locked = [];
        AD001Config._domainUsers.forEach(function(u) {
            if (AD001Config._isLocked(u.username, engine)) locked.push(u);
        });
        if (!locked.length) return '\n(no output — no locked accounts found)\n';
        var out = '\n';
        out += 'DistinguishedName                                    Enabled  LockedOut  Name                  SamAccountName\n';
        out += '---                                                  -------  ---------  ----                  --------------\n';
        locked.forEach(function(u) {
            out += ('CN=' + u.name + ',OU=' + u.ou + ',DC=hexworth,DC=local').substring(0, 50).padEnd(52) + 'False    True       ' + u.name.substring(0, 22).padEnd(22) + '  ' + u.username + '\n';
        });
        return out;
    },

    _cmdBulkUnlock: function(engine) {
        var scenario = AD001Config._getScenario(engine);
        if (!scenario) return '\nNo locked accounts found.\n';

        var lockedUsers = [];
        AD001Config._domainUsers.forEach(function(u) {
            if (AD001Config._isLocked(u.username, engine)) lockedUsers.push(u);
        });

        if (!lockedUsers.length) return '\n(no output — no locked accounts to unlock)\n';

        if (!engine.state._unlockedAccounts) engine.state._unlockedAccounts = {};
        lockedUsers.forEach(function(u) { engine.state._unlockedAccounts[u.username] = true; });

        AD001Config._checkBulkUnlockProgress(engine);
        engine.save();
        AD001Config._checkLockoutFix(engine);
        return '\n(no output — ' + lockedUsers.length + ' account(s) unlocked)\n';
    },

    _checkBulkUnlockProgress: function(engine) {
        var scenario = AD001Config._getScenario(engine);
        if (!scenario) return;
        var unlocked = engine.state._unlockedAccounts || {};

        if (scenario.id === 'stale_creds') {
            var allDone = AD001Config._s1LockedUsers.every(function(u) { return unlocked[u]; });
            if (allDone) engine.state._s1AccountsUnlocked = true;
        }
        if (scenario.id === 'brute_force') {
            var s3Users = ['dkim','evasquez','fdesouza','gwatts','hnash','arodriguez','lreyes','fturner','rhuang','shall','mwebb','dtorres'];
            var s3Done = s3Users.every(function(u) { return unlocked[u]; });
            if (s3Done) engine.state._s3AccountsUnlocked = true;
        }
        if (scenario.id === 'gpo_misconfig') {
            var s4Users = ['obaker','sevans','wchang','ncole','tgreen','usantos','ladams','cmendez'];
            var s4Done = s4Users.every(function(u) { return unlocked[u]; });
            if (s4Done) engine.state._s4AccountsUnlocked = true;
        }
        if (scenario.id === 'rogue_task') {
            var s5Users = ['dtorres','snguyen','rchen','yokafor','vprice','dwilson','eclark'];
            var s5Done = s5Users.every(function(u) { return unlocked[u]; });
            if (s5Done) engine.state._s5AccountsUnlocked = true;
        }
        if (scenario.id === 'expired_svc') {
            if (unlocked['svc_webportal']) engine.state._svcPasswordReset = true;
        }
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

        var scenario = AD001Config._getScenario(engine);

        switch (iconDef.app) {
            case 'ticket':          AD001Config._openTicket(iconDef, engine); break;
            case 'aduc':            AD001Config._openADUC(iconDef, engine); break;
            case 'event_viewer':    AD001Config._openEventViewer(iconDef, engine); break;
            case 'gpo_management':  AD001Config._openGPO(iconDef, engine); break;
            // Scenario-specific windows launched from within other windows
            case 'firewall_console': AD001Config._openFirewallConsole(iconDef, engine); break;
            case 'net_device_config': AD001Config._openNetDeviceConfig(iconDef, engine); break;
            case 'iis_manager':     AD001Config._openIISManager(iconDef, engine); break;
            case 'net_management':  AD001Config._openNetManagement(iconDef, engine); break;
            case 'reset_lab':       AD001Config._confirmReset(engine); break;
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
        AD001Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) {
            AD001Config._renderTicket(engine, container);
        } else {
            AD001Config._renderScenarioPicker(engine, container);
        }
    },

    _renderScenarioPicker: function(engine, container) {
        var previews = [
            'Multiple Finance users — "Locked out every morning at 6 AM"',
            'Entire company — "Portal shows Access Denied for everyone"',
            'Mass lockout event — "47 accounts locked in 15 minutes"',
            'All users — "Locked out after one wrong password since audit"',
            'Random accounts — "Locked at exactly 2:00 PM every day"'
        ];

        var html = '<div style="text-align:center; margin-bottom:20px;">'
            + '<div style="color:#9b59b6; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">HELP DESK QUEUE — LOCKOUT INCIDENTS</div>'
            + '<div style="color:#888; font-size:0.75rem;">Select an incident ticket to begin your investigation, or let the system assign one randomly.</div>'
            + '</div><div style="margin-bottom:16px;">';

        AD001Config._scenarios.forEach(function(s, i) {
            var severity = i === 2 ? 'CRITICAL' : i === 1 ? 'HIGH' : 'URGENT';
            var sevColor = i === 2 ? '#c0392b' : '#e74c3c';
            html += '<button class="ad001-scenario-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer; transition:border-color 0.2s;">'
                + '<div style="display:flex; justify-content:space-between; align-items:center;">'
                + '<span style="color:#9b59b6; font-weight:bold;">INC-' + (3000 + i) + '</span>'
                + '<span style="background:' + sevColor + '; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">' + severity + '</span>'
                + '</div>'
                + '<div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div>'
                + '</button>';
        });
        html += '</div>';
        html += '<div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;">'
            + '<button id="ad001RandomBtn" style="padding:10px 28px; background:#9b59b6; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.85rem; font-family:Consolas,monospace;">Random Assignment</button>'
            + '</div>';

        container.innerHTML = html;

        container.querySelectorAll('.ad001-scenario-btn').forEach(function(btn) {
            btn.addEventListener('mouseenter', function() { this.style.borderColor = '#9b59b6'; });
            btn.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; });
            btn.addEventListener('click', function() {
                AD001Config._applyScenario(engine, parseInt(this.getAttribute('data-idx')));
                AD001Config._renderTicket(engine, container);
            });
        });

        document.getElementById('ad001RandomBtn').addEventListener('click', function() {
            AD001Config._applyScenario(engine, Math.floor(Math.random() * AD001Config._scenarios.length));
            AD001Config._renderTicket(engine, container);
        });
    },

    _renderTicket: function(engine, container) {
        var scenario = AD001Config._getScenario(engine);
        var submitters = [
            'Finance Team — via Help Desk Portal',
            'Office-wide — multiple users reporting simultaneously',
            'IT Security Alert — automated detection + user reports',
            'Help Desk Manager — escalation from call volume spike',
            'Operations Manager — recurring daily pattern identified'
        ];
        var submitter = submitters[engine.state._scenarioId] || 'Unknown';
        var severity = engine.state._scenarioId === 2 ? 'CRITICAL' : engine.state._scenarioId === 1 ? 'HIGH' : 'URGENT';
        var sevColor = engine.state._scenarioId === 2 ? '#c0392b' : '#e74c3c';

        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;">'
            + '<div style="display:flex; justify-content:space-between; align-items:center;">'
            + '<span style="color:#9b59b6; font-weight:bold; font-size:1rem;">INCIDENT TICKET #INC-' + (3000 + engine.state._scenarioId) + '</span>'
            + '<span style="background:' + sevColor + '; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">PRIORITY: ' + severity + '</span>'
            + '</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">REPORTED BY</div>'
            + '<div>' + submitter + '</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DATE / TIME</div>'
            + '<div>March 13, 2026 — ' + ['06:45 AM', '07:30 AM', '10:15 AM', '09:00 AM', '14:05 PM'][engine.state._scenarioId] + '</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBJECT</div>'
            + '<div style="font-weight:bold;">' + AD001Config._escHtml(scenario.ticketSubject) + '</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DESCRIPTION</div>'
            + '<div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">'
            + AD001Config._escHtml(scenario.ticketDetail)
            + '</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">INTERNAL NOTES</div>'
            + '<div style="background:rgba(155,89,182,0.08); border:1px solid rgba(155,89,182,0.25); border-radius:4px; padding:12px; line-height:1.6; color:#ce93d8;">'
            + AD001Config._escHtml(scenario.ticketExtra) + '</div></div>'

            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">ASSIGNED TO</div>'
            + '<div style="color:#2ecc71; font-weight:bold;">YOU — Domain Administrator</div></div>';

        // Add scenario-specific quick-launch button after ticket loads
        setTimeout(function() {
            AD001Config._addTicketActionButtons(engine, container);
        }, 100);
    },

    _addTicketActionButtons: function(engine, container) {
        var scenario = AD001Config._getScenario(engine);
        if (!scenario) return;

        var extra = document.createElement('div');
        extra.style.cssText = 'margin-top:16px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.1);';
        extra.innerHTML = '<div style="color:#888; font-size:0.7rem; margin-bottom:8px;">QUICK LAUNCH — INVESTIGATION TOOLS</div>'
            + '<div style="display:flex; flex-wrap:wrap; gap:8px;">'
            + '<button class="ad-ticket-btn" data-app="event_viewer" style="padding:6px 14px; background:rgba(155,89,182,0.15); border:1px solid rgba(155,89,182,0.3); border-radius:3px; color:#ce93d8; cursor:pointer; font-family:Consolas,monospace; font-size:0.75rem;">Event Viewer</button>'
            + '<button class="ad-ticket-btn" data-app="aduc" style="padding:6px 14px; background:rgba(155,89,182,0.15); border:1px solid rgba(155,89,182,0.3); border-radius:3px; color:#ce93d8; cursor:pointer; font-family:Consolas,monospace; font-size:0.75rem;">AD Users & Computers</button>'
            + (scenario.id === 'gpo_misconfig' ? '<button class="ad-ticket-btn" data-app="gpo_management" style="padding:6px 14px; background:rgba(155,89,182,0.15); border:1px solid rgba(155,89,182,0.3); border-radius:3px; color:#ce93d8; cursor:pointer; font-family:Consolas,monospace; font-size:0.75rem;">Group Policy Mgmt</button>' : '')
            + (scenario.id === 'brute_force' ? '<button class="ad-ticket-btn" data-app="firewall_console" style="padding:6px 14px; background:rgba(155,89,182,0.15); border:1px solid rgba(155,89,182,0.3); border-radius:3px; color:#ce93d8; cursor:pointer; font-family:Consolas,monospace; font-size:0.75rem;">Firewall Console</button>' : '')
            + (scenario.id === 'expired_svc' ? '<button class="ad-ticket-btn" data-app="iis_manager" style="padding:6px 14px; background:rgba(155,89,182,0.15); border:1px solid rgba(155,89,182,0.3); border-radius:3px; color:#ce93d8; cursor:pointer; font-family:Consolas,monospace; font-size:0.75rem;">IIS Manager</button>' : '')
            + (scenario.id === 'stale_creds' ? '<button class="ad-ticket-btn" data-app="net_device_config" style="padding:6px 14px; background:rgba(155,89,182,0.15); border:1px solid rgba(155,89,182,0.3); border-radius:3px; color:#ce93d8; cursor:pointer; font-family:Consolas,monospace; font-size:0.75rem;">Network Device Config</button>' : '')
            + (scenario.id === 'rogue_task' ? '<button class="ad-ticket-btn" data-app="net_management" style="padding:6px 14px; background:rgba(155,89,182,0.15); border:1px solid rgba(155,89,182,0.3); border-radius:3px; color:#ce93d8; cursor:pointer; font-family:Consolas,monospace; font-size:0.75rem;">Network Management</button>' : '')
            + '</div>';

        container.appendChild(extra);

        extra.querySelectorAll('.ad-ticket-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var appId = this.getAttribute('data-app');
                AD001Config.onAppLaunch({ id: appId, app: appId, label: appId }, engine);
            });
        });
    },

    // ==========================================================
    // AD USERS & COMPUTERS (ADUC)
    // ==========================================================

    _openADUC: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); AD001Config._renderADUC(engine, 'all'); return; }
        var container = document.createElement('div');
        container.id = 'aducContainer';
        container.style.cssText = 'display:flex; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; overflow:hidden;';
        engine.openWindow(iconDef.id, 'Active Directory Users and Computers', 'AD', container);
        engine.state._aducSelectedOU = 'all';
        AD001Config._renderADUC(engine, 'all');
    },

    _renderADUC: function(engine, selectedOU) {
        var container = document.getElementById('aducContainer');
        if (!container) return;
        engine.state._aducSelectedOU = selectedOU;

        var ous = ['all', 'IT', 'HR', 'Finance', 'Marketing', 'Executives', 'Service Accounts'];
        var ouLabels = { all: 'All Users', IT: 'IT', HR: 'HR', Finance: 'Finance', Marketing: 'Marketing', Executives: 'Executives', 'Service Accounts': 'Service Accounts' };

        // Left: OU tree
        var leftHtml = '<div style="width:200px; min-width:200px; border-right:1px solid rgba(255,255,255,0.1); padding:12px; overflow-y:auto; background:rgba(0,0,0,0.2);">'
            + '<div style="color:#9b59b6; font-weight:bold; margin-bottom:8px; font-size:0.75rem;">HEXWORTH.LOCAL</div>'
            + '<div style="padding-left:0; margin-bottom:4px; color:#aaa;">&#9660; hexworth.local</div>'
            + '<div style="padding-left:12px;">';

        ous.forEach(function(ou) {
            var isActive = selectedOU === ou;
            var lockedCount = AD001Config._domainUsers.filter(function(u) {
                return (ou === 'all' || u.ou === ou) && AD001Config._isLocked(u.username, engine);
            }).length;
            leftHtml += '<div class="aduc-ou-item" data-ou="' + ou + '" style="padding:4px 6px; margin-bottom:2px; border-radius:3px; cursor:pointer; background:' + (isActive ? 'rgba(155,89,182,0.15)' : 'transparent') + '; color:' + (isActive ? '#ce93d8' : '#888') + '; font-weight:' + (isActive ? 'bold' : 'normal') + ';">'
                + ouLabels[ou]
                + (lockedCount > 0 ? ' <span style="background:#e74c3c; color:#fff; font-size:0.6rem; padding:0 5px; border-radius:3px; margin-left:4px;">' + lockedCount + '</span>' : '')
                + '</div>';
        });
        leftHtml += '</div></div>';

        // Right: user list
        var users = selectedOU === 'all'
            ? AD001Config._domainUsers
            : AD001Config._domainUsers.filter(function(u) { return u.ou === selectedOU; });

        var rightHtml = '<div id="aducRightPane" style="flex:1; display:flex; flex-direction:column; overflow:hidden;">'
            + '<div style="padding:10px 16px; border-bottom:1px solid rgba(255,255,255,0.08); background:rgba(0,0,0,0.1);">'
            + '<span style="color:#9b59b6; font-weight:bold;">' + ouLabels[selectedOU] + '</span>'
            + '<span style="color:#888; font-size:0.75rem; margin-left:12px;">' + users.length + ' objects</span>'
            + '</div>'
            + '<div style="display:flex; font-size:0.7rem; color:#888; padding:6px 12px; border-bottom:1px solid rgba(255,255,255,0.06);">'
            + '<span style="flex:2.2;">Name</span><span style="flex:1.5;">Account Name</span><span style="flex:1;">OU</span><span style="flex:1.5;">Last Logon</span><span style="flex:0.8;">Status</span>'
            + '</div>'
            + '<div style="flex:1; overflow-y:auto;">';

        users.forEach(function(u) {
            var locked = AD001Config._isLocked(u.username, engine);
            var statusColor = locked ? '#e74c3c' : '#2ecc71';
            var statusText = locked ? 'Locked' : 'Active';
            var logonDate = u.lastLogon.replace('T', ' ').substring(0, 16);

            rightHtml += '<div class="aduc-user-row" data-username="' + u.username + '" style="display:flex; align-items:center; padding:6px 12px; border-bottom:1px solid rgba(255,255,255,0.04); cursor:pointer; transition:background 0.1s; background:' + (locked ? 'rgba(231,76,60,0.05)' : 'transparent') + ';">'
                + '<span style="flex:2.2; font-weight:' + (locked ? 'bold' : 'normal') + ';">' + u.name + '</span>'
                + '<span style="flex:1.5; color:#888; font-size:0.75rem;">' + u.username + '</span>'
                + '<span style="flex:1; color:#888; font-size:0.75rem;">' + u.ou + '</span>'
                + '<span style="flex:1.5; color:#888; font-size:0.75rem;">' + logonDate + '</span>'
                + '<span style="flex:0.8; color:' + statusColor + '; font-size:0.75rem; font-weight:bold;">' + statusText + '</span>'
                + '</div>';
        });

        rightHtml += '</div></div>';

        container.innerHTML = leftHtml + rightHtml;

        // OU tree click
        container.querySelectorAll('.aduc-ou-item').forEach(function(item) {
            item.addEventListener('click', function() {
                AD001Config._renderADUC(engine, this.getAttribute('data-ou'));
            });
            item.addEventListener('mouseenter', function() { this.style.background = 'rgba(155,89,182,0.1)'; });
            item.addEventListener('mouseleave', function() {
                this.style.background = (this.getAttribute('data-ou') === (engine.state._aducSelectedOU || 'all')) ? 'rgba(155,89,182,0.15)' : 'transparent';
            });
        });

        // User row double-click
        container.querySelectorAll('.aduc-user-row').forEach(function(row) {
            row.addEventListener('mouseenter', function() { this.style.background = 'rgba(155,89,182,0.08)'; });
            row.addEventListener('mouseleave', function() {
                var locked = AD001Config._isLocked(this.getAttribute('data-username'), engine);
                this.style.background = locked ? 'rgba(231,76,60,0.05)' : 'transparent';
            });
            row.addEventListener('dblclick', function() {
                AD001Config._openUserProperties(engine, this.getAttribute('data-username'));
            });
            row.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                AD001Config._openUserProperties(engine, this.getAttribute('data-username'));
            });
        });
    },

    // ==========================================================
    // USER PROPERTIES DIALOG
    // ==========================================================

    _openUserProperties: function(engine, username) {
        var existing = document.getElementById('adUserPropsOverlay');
        if (existing) existing.remove();

        var user = AD001Config._domainUsers.filter(function(u) { return u.username === username; })[0];
        if (!user) return;

        var overlay = document.createElement('div');
        overlay.id = 'adUserPropsOverlay';
        overlay.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:8000;';

        var activeTab = 0;
        var scenario = AD001Config._getScenario(engine);
        var tabs = ['Account', 'General', 'Member Of'];

        function renderDialog() {
            var tabHtml = tabs.map(function(t, i) {
                return '<div class="user-props-tab" data-tab="' + i + '" style="padding:8px 16px; cursor:pointer; font-size:0.8rem; border-bottom:2px solid ' + (i === activeTab ? '#9b59b6' : 'transparent') + '; color:' + (i === activeTab ? '#ce93d8' : '#888') + '; font-weight:' + (i === activeTab ? 'bold' : 'normal') + ';">' + t + '</div>';
            }).join('');

            var locked = AD001Config._isLocked(user.username, engine);
            var pwExpired = user.username === 'svc_webportal' && engine.state._svcExpired;
            var bodyHtml = '';

            if (activeTab === 0) {
                // Account tab
                var flagVal = engine.state._flagRevealed ? AD001Config._scenarioFlags[scenario ? scenario.id : ''] || '' : '';
                bodyHtml = '<div style="padding:16px;">'
                    + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">User logon name</div>'
                    + '<div style="font-weight:bold;">' + user.username + '@hexworth.local</div></div>'
                    + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">SAM Account Name</div>'
                    + '<div>' + user.username + '</div></div>'
                    + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">Account Status</div>'
                    + '<div style="color:' + (locked ? '#e74c3c' : '#2ecc71') + '; font-weight:bold;">' + (locked ? 'LOCKED OUT' : 'Active') + '</div></div>'
                    + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">Password Last Set</div>'
                    + '<div>' + user.passwordLastSet.split('T')[0] + (pwExpired ? ' <span style="color:#e74c3c; font-weight:bold;">(EXPIRED)</span>' : '') + '</div></div>'

                    + (locked ? '<div style="margin-bottom:16px; padding:10px; background:rgba(155,89,182,0.1); border:1px solid rgba(155,89,182,0.25); border-radius:4px;">'
                        + '<label style="display:flex; align-items:center; gap:8px; cursor:pointer;">'
                        + '<input type="checkbox" id="unlockAcctChk" style="cursor:pointer;">'
                        + '<span>Unlock account (account is currently locked on this Active Directory Domain Controller)</span>'
                        + '</label></div>' : '')

                    + (pwExpired ? '<div style="margin-bottom:16px; padding:10px; background:rgba(231,76,60,0.1); border:1px solid rgba(231,76,60,0.25); border-radius:4px; font-size:0.75rem; color:#ffcc80;">'
                        + 'Password is expired. This account cannot authenticate until the password is reset.'
                        + '</div>' : '')

                    + '<div style="margin-bottom:12px;">'
                    + '<label style="display:flex; align-items:center; gap:8px;">'
                    + '<input type="checkbox" ' + (pwExpired ? '' : 'checked') + ' disabled> User must change password at next logon'
                    + '</label></div>'

                    + '<div style="margin-bottom:12px;">'
                    + '<label style="display:flex; align-items:center; gap:8px;">'
                    + '<input type="checkbox" ' + (user.ou === 'Service Accounts' ? 'checked' : '') + ' disabled> Password never expires'
                    + '</label></div>'

                    + (engine.state._flagRevealed && flagVal
                        ? '<div style="margin-top:16px; padding:10px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; font-size:0.75rem;">'
                        + '<div style="color:#2ecc71; font-weight:bold; margin-bottom:4px;">Incident Closure Token:</div>'
                        + '<div style="color:#c8e6c9;">' + flagVal + '</div></div>'
                        : '')
                    + '</div>';
            } else if (activeTab === 1) {
                // General
                bodyHtml = '<div style="padding:16px;">'
                    + '<div style="margin-bottom:10px;"><div style="color:#888; font-size:0.7rem;">Full Name</div><div style="font-weight:bold;">' + user.name + '</div></div>'
                    + '<div style="margin-bottom:10px;"><div style="color:#888; font-size:0.7rem;">Job Title</div><div>' + user.title + '</div></div>'
                    + '<div style="margin-bottom:10px;"><div style="color:#888; font-size:0.7rem;">Department / OU</div><div>' + user.ou + '</div></div>'
                    + '<div style="margin-bottom:10px;"><div style="color:#888; font-size:0.7rem;">Email Address</div><div>' + user.email + '</div></div>'
                    + '<div style="margin-bottom:10px;"><div style="color:#888; font-size:0.7rem;">Account Created</div><div>' + user.accountCreated + '</div></div>'
                    + '<div style="margin-bottom:10px;"><div style="color:#888; font-size:0.7rem;">Last Logon</div><div>' + user.lastLogon.replace('T', ' ').substring(0, 16) + '</div></div>'
                    + '</div>';
            } else if (activeTab === 2) {
                // Member Of
                bodyHtml = '<div style="padding:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:8px;">Member of the following groups:</div>'
                    + '<div style="border:1px solid rgba(255,255,255,0.1); border-radius:4px; overflow:hidden;">';
                user.memberOf.forEach(function(g) {
                    bodyHtml += '<div style="padding:6px 10px; border-bottom:1px solid rgba(255,255,255,0.06); font-size:0.8rem;">' + g + '</div>';
                });
                bodyHtml += '</div></div>';
            }

            overlay.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(155,89,182,0.3); border-radius:6px; width:480px; max-height:520px; display:flex; flex-direction:column; overflow:hidden;">'
                + '<div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; border-bottom:1px solid rgba(255,255,255,0.1);">'
                + '<div style="font-weight:bold; color:#c8e6c9;">' + user.name + ' Properties</div>'
                + '<button id="userPropsClose" style="background:none; border:none; color:#888; font-size:1.2rem; cursor:pointer;">x</button>'
                + '</div>'
                + '<div style="display:flex; border-bottom:1px solid rgba(255,255,255,0.1);">' + tabHtml + '</div>'
                + '<div style="flex:1; overflow-y:auto; font-family:Consolas,monospace; font-size:0.8rem; color:#c8e6c9;">' + bodyHtml + '</div>'
                + '<div style="padding:10px 16px; border-top:1px solid rgba(255,255,255,0.1); display:flex; justify-content:flex-end; gap:8px;">'
                + (locked ? '<button id="userPropsResetPwd" style="padding:6px 16px; background:#e67e22; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.8rem;">Reset Password</button>' : '')
                + '<button id="userPropsOk" style="padding:6px 20px; background:#9b59b6; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.8rem; font-weight:bold;">OK</button>'
                + '<button id="userPropsCancel" style="padding:6px 16px; background:rgba(255,255,255,0.08); color:#ccc; border:1px solid rgba(255,255,255,0.15); border-radius:3px; cursor:pointer; font-size:0.8rem;">Cancel</button>'
                + '</div>'
                + '</div>';

            // Tab switching
            overlay.querySelectorAll('.user-props-tab').forEach(function(tab) {
                tab.addEventListener('click', function() {
                    activeTab = parseInt(this.getAttribute('data-tab'));
                    renderDialog();
                });
            });

            var closeBtn = document.getElementById('userPropsClose');
            var cancelBtn = document.getElementById('userPropsCancel');
            var okBtn = document.getElementById('userPropsOk');
            var resetPwdBtn = document.getElementById('userPropsResetPwd');

            if (closeBtn) closeBtn.addEventListener('click', function() { overlay.remove(); });
            if (cancelBtn) cancelBtn.addEventListener('click', function() { overlay.remove(); });

            if (okBtn) {
                okBtn.addEventListener('click', function() {
                    // Check unlock checkbox
                    var unlockChk = document.getElementById('unlockAcctChk');
                    if (unlockChk && unlockChk.checked) {
                        if (!engine.state._unlockedAccounts) engine.state._unlockedAccounts = {};
                        engine.state._unlockedAccounts[user.username] = true;
                        AD001Config._checkBulkUnlockProgress(engine);
                        engine.save();
                        engine.notify(user.username + ' unlocked successfully.', 'success');
                        AD001Config._checkLockoutFix(engine);
                        overlay.remove();
                        AD001Config._renderADUC(engine, engine.state._aducSelectedOU || 'all');
                    } else {
                        overlay.remove();
                    }
                });
            }

            if (resetPwdBtn) {
                resetPwdBtn.addEventListener('click', function() {
                    AD001Config._openResetPasswordDialog(engine, user, overlay);
                });
            }
        }

        var arena = document.getElementById('arena');
        arena.appendChild(overlay);
        renderDialog();

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) overlay.remove();
        });
    },

    _openResetPasswordDialog: function(engine, user, parentOverlay) {
        var dlg = document.createElement('div');
        dlg.style.cssText = 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background:#1a1a2e; border:1px solid rgba(155,89,182,0.3); border-radius:6px; padding:20px; width:340px; z-index:9000; font-family:Consolas,monospace; color:#c8e6c9; font-size:0.8rem;';
        dlg.innerHTML = '<div style="font-weight:bold; margin-bottom:12px; color:#9b59b6;">Reset Password — ' + user.name + '</div>'
            + '<div style="margin-bottom:8px;">New Password:</div>'
            + '<input id="resetPwdNew" type="password" placeholder="Min 12 chars, complex" style="width:100%; box-sizing:border-box; padding:6px 8px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.2); border-radius:3px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; margin-bottom:8px;">'
            + '<div style="margin-bottom:8px;">Confirm Password:</div>'
            + '<input id="resetPwdConfirm" type="password" placeholder="Confirm" style="width:100%; box-sizing:border-box; padding:6px 8px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.2); border-radius:3px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; margin-bottom:12px;">'
            + '<div id="resetPwdError" style="color:#e74c3c; font-size:0.75rem; margin-bottom:8px; display:none;"></div>'
            + '<div style="display:flex; gap:8px; justify-content:flex-end;">'
            + '<button id="resetPwdOk" style="padding:6px 16px; background:#9b59b6; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.8rem;">Reset</button>'
            + '<button id="resetPwdCancel" style="padding:6px 16px; background:rgba(255,255,255,0.08); color:#ccc; border:1px solid rgba(255,255,255,0.15); border-radius:3px; cursor:pointer; font-size:0.8rem;">Cancel</button>'
            + '</div>';

        parentOverlay.appendChild(dlg);

        document.getElementById('resetPwdCancel').addEventListener('click', function() { dlg.remove(); });
        document.getElementById('resetPwdOk').addEventListener('click', function() {
            var newPwd = document.getElementById('resetPwdNew').value;
            var confirm = document.getElementById('resetPwdConfirm').value;
            var errEl = document.getElementById('resetPwdError');
            if (!newPwd || newPwd.length < 12) {
                errEl.textContent = 'Password must be at least 12 characters.';
                errEl.style.display = 'block';
                return;
            }
            if (newPwd !== confirm) {
                errEl.textContent = 'Passwords do not match.';
                errEl.style.display = 'block';
                return;
            }
            if (!engine.state._unlockedAccounts) engine.state._unlockedAccounts = {};
            engine.state._unlockedAccounts[user.username] = true;

            if (user.username === 'svc_webportal') {
                engine.state._svcExpired = false;
                engine.state._svcPasswordReset = true;
                engine.save();
                engine.notify('svc_webportal password reset. Now update the WebPortalPool identity in IIS Manager.', 'success');
                AD001Config._checkLockoutFix(engine);
            } else {
                AD001Config._checkBulkUnlockProgress(engine);
                engine.save();
                engine.notify(user.username + ' password reset and account unlocked.', 'success');
                AD001Config._checkLockoutFix(engine);
            }
            dlg.remove();
            parentOverlay.remove();
            AD001Config._renderADUC(engine, engine.state._aducSelectedOU || 'all');
        });
    },

    // ==========================================================
    // EVENT VIEWER
    // ==========================================================

    _openEventViewer: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); AD001Config._renderEventViewer(engine); return; }
        var container = document.createElement('div');
        container.id = 'evtContainer';
        container.style.cssText = 'display:flex; flex-direction:column; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; overflow:hidden;';
        engine.openWindow(iconDef.id, 'Event Viewer — Windows Security Log', 'EVT', container);
        engine.state._evtFilter = '';
        engine.state._evtIPFilter = '';
        engine.state._evtExpanded = null;
        AD001Config._renderEventViewer(engine);
    },

    _renderEventViewer: function(engine) {
        var container = document.getElementById('evtContainer');
        if (!container) return;
        var scenario = AD001Config._getScenario(engine);
        if (!scenario) { container.innerHTML = '<div style="padding:20px; color:#888;">Open a Help Desk Ticket first.</div>'; return; }

        var logs = AD001Config._eventLogs[scenario.id] || [];
        var filterEid = engine.state._evtFilter || '';
        var filterIP = engine.state._evtIPFilter || '';

        var filtered = logs.filter(function(e) {
            if (filterEid && String(e.eventId) !== String(filterEid)) return false;
            if (filterIP && !e.source.includes(filterIP)) return false;
            return true;
        });

        var html = '<div style="padding:10px 16px; border-bottom:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2); display:flex; align-items:center; gap:12px; flex-shrink:0;">'
            + '<span style="color:#9b59b6; font-weight:bold;">Security Log — DC01</span>'
            + '<span style="color:#888; font-size:0.75rem;">Showing ' + filtered.length + ' of ' + logs.length + ' events</span>'
            + '<div style="margin-left:auto; display:flex; gap:8px;">'
            + '<input id="evtFilterEid" type="text" placeholder="Filter: Event ID" value="' + filterEid + '" style="padding:4px 8px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); border-radius:3px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.75rem; width:120px;">'
            + '<input id="evtFilterIP" type="text" placeholder="Filter: Source IP" value="' + filterIP + '" style="padding:4px 8px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); border-radius:3px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.75rem; width:130px;">'
            + '<button id="evtClearFilter" style="padding:4px 10px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); border-radius:3px; color:#ccc; cursor:pointer; font-size:0.75rem;">Clear</button>'
            + '</div>'
            + '</div>';

        // Column headers
        html += '<div style="display:flex; font-size:0.7rem; color:#888; padding:5px 12px; border-bottom:1px solid rgba(255,255,255,0.06); flex-shrink:0; background:rgba(0,0,0,0.1);">'
            + '<span style="flex:1.8;">Date / Time</span>'
            + '<span style="flex:0.7;">Event ID</span>'
            + '<span style="flex:1.5;">Source / IP</span>'
            + '<span style="flex:1;">Account</span>'
            + '<span style="flex:1;">Category</span>'
            + '<span style="flex:2.5;">Description</span>'
            + '</div>';

        html += '<div id="evtLogBody" style="flex:1; overflow-y:auto;">';

        if (!filtered.length) {
            html += '<div style="padding:20px; color:#888; text-align:center;">No events match the current filter.</div>';
        } else {
            filtered.forEach(function(e) {
                var isExpanded = engine.state._evtExpanded === e.id;
                var eidColor = e.eventId === 4740 ? '#e74c3c' : e.eventId === 4625 ? '#e67e22' : '#2ecc71';
                var eidBg = e.eventId === 4740 ? 'rgba(231,76,60,0.08)' : e.eventId === 4625 ? 'rgba(230,126,34,0.06)' : 'rgba(46,204,113,0.05)';
                var timeStr = e.time.replace('T', ' ').substring(0, 19);

                html += '<div class="evt-row" data-evtid="' + e.id + '" style="border-bottom:1px solid rgba(255,255,255,0.04); cursor:pointer;">'
                    + '<div style="display:flex; align-items:center; padding:6px 12px; background:' + (isExpanded ? eidBg : 'transparent') + '; transition:background 0.1s;">'
                    + '<span style="flex:1.8; color:#888; font-size:0.75rem;">' + timeStr + '</span>'
                    + '<span style="flex:0.7; color:' + eidColor + '; font-weight:bold;">' + e.eventId + '</span>'
                    + '<span style="flex:1.5; font-size:0.75rem;">' + e.source + '</span>'
                    + '<span style="flex:1; font-size:0.75rem; color:#ce93d8;">' + e.username + '</span>'
                    + '<span style="flex:1; font-size:0.7rem; color:#888;">' + e.category + '</span>'
                    + '<span style="flex:2.5; font-size:0.75rem; color:#ccc;">' + e.desc + '</span>'
                    + '</div>'
                    + (isExpanded ? '<div style="background:rgba(0,0,0,0.3); border-left:3px solid ' + eidColor + '; padding:10px 12px 10px 16px; font-size:0.75rem; white-space:pre-wrap; color:#aaa;">'
                        + 'Event ID: ' + e.eventId + '\n'
                        + 'Time: ' + timeStr + '\n'
                        + 'Source IP: ' + e.source + '\n'
                        + 'Account: ' + e.username + '\n'
                        + '---\n'
                        + e.detail + '</div>' : '')
                    + '</div>';
            });
        }

        html += '</div>';

        container.innerHTML = html;

        // Filter input listeners
        var eidInput = document.getElementById('evtFilterEid');
        var ipInput = document.getElementById('evtFilterIP');
        var clearBtn = document.getElementById('evtClearFilter');

        if (eidInput) {
            eidInput.addEventListener('input', function() {
                engine.state._evtFilter = this.value;
                AD001Config._renderEventViewer(engine);
            });
        }
        if (ipInput) {
            ipInput.addEventListener('input', function() {
                engine.state._evtIPFilter = this.value;
                AD001Config._renderEventViewer(engine);
            });
        }
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                engine.state._evtFilter = '';
                engine.state._evtIPFilter = '';
                AD001Config._renderEventViewer(engine);
            });
        }

        // Row click to expand
        container.querySelectorAll('.evt-row').forEach(function(row) {
            row.addEventListener('mouseenter', function() {
                var inner = this.querySelector('div');
                if (inner) inner.style.background = 'rgba(155,89,182,0.08)';
            });
            row.addEventListener('mouseleave', function() {
                var inner = this.querySelector('div');
                if (inner) inner.style.background = 'transparent';
            });
            row.addEventListener('click', function() {
                var evtId = parseInt(this.getAttribute('data-evtid'));
                engine.state._evtExpanded = (engine.state._evtExpanded === evtId) ? null : evtId;
                AD001Config._renderEventViewer(engine);
            });
        });
    },

    // ==========================================================
    // GROUP POLICY MANAGEMENT
    // ==========================================================

    _openGPO: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); AD001Config._renderGPO(engine); return; }
        var container = document.createElement('div');
        container.id = 'gpoContainer';
        container.style.cssText = 'display:flex; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; overflow:hidden;';
        engine.openWindow(iconDef.id, 'Group Policy Management', 'GPO', container);
        AD001Config._renderGPO(engine);
    },

    _renderGPO: function(engine) {
        var container = document.getElementById('gpoContainer');
        if (!container) return;
        var scenario = AD001Config._getScenario(engine);
        var isS4 = scenario && scenario.id === 'gpo_misconfig';
        var threshold = engine.state._gpoThreshold !== undefined ? engine.state._gpoThreshold : 5;
        var duration = engine.state._gpoDuration !== undefined ? engine.state._gpoDuration : 30;
        var counterReset = engine.state._gpoCounterReset !== undefined ? engine.state._gpoCounterReset : 30;
        var gpoFixed = engine.state._gpoFixed;

        // Left tree
        var leftHtml = '<div style="width:200px; min-width:200px; border-right:1px solid rgba(255,255,255,0.1); padding:12px; overflow-y:auto; background:rgba(0,0,0,0.2);">'
            + '<div style="color:#9b59b6; font-weight:bold; margin-bottom:10px; font-size:0.75rem;">Group Policy Management</div>'
            + '<div style="color:#aaa; padding:3px 0;">&#9660; Forest: hexworth.local</div>'
            + '<div style="padding-left:12px;">'
            + '<div style="color:#aaa; padding:3px 0;">&#9660; Domains</div>'
            + '<div style="padding-left:12px;">'
            + '<div style="color:#aaa; padding:3px 0;">&#9660; hexworth.local</div>'
            + '<div style="padding-left:12px;">'
            + '<div style="color:#9b59b6; font-weight:bold; padding:3px 0; cursor:pointer;">&#9660; Group Policy Objects</div>'
            + '<div style="padding-left:12px;">'
            + '<div style="padding:3px 0; cursor:pointer; color:' + (isS4 && !gpoFixed ? '#e74c3c' : '#ccc') + ';">Default Domain Policy ' + (isS4 && !gpoFixed ? '[!]' : '') + '</div>'
            + '<div style="padding:3px 0; cursor:pointer; color:#888;">Default Domain Controllers Policy</div>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '</div>';

        // Right: policy editor
        var rightHtml = '<div style="flex:1; padding:16px; overflow-y:auto;">'
            + '<div style="font-size:0.9rem; font-weight:bold; color:#9b59b6; margin-bottom:4px;">Default Domain Policy</div>'
            + '<div style="color:#888; font-size:0.75rem; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:8px;">Computer Configuration > Windows Settings > Security Settings</div>';

        // Account Lockout Policy section
        rightHtml += '<div style="margin-bottom:16px;">'
            + '<div style="font-weight:bold; color:#ce93d8; margin-bottom:8px; padding-bottom:4px; border-bottom:1px solid rgba(155,89,182,0.2);">Account Lockout Policy</div>';

        if (isS4 && !gpoFixed) {
            rightHtml += '<div style="margin-bottom:8px; padding:8px; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:3px; font-size:0.75rem; color:#ffcc80;">'
                + 'WARNING: Policy was modified during the security audit. Current settings do not match security baseline.'
                + '</div>';
        }

        // Threshold field
        rightHtml += '<div style="display:flex; align-items:center; padding:8px; margin-bottom:4px; background:rgba(255,255,255,0.02); border:1px solid ' + (isS4 && !gpoFixed && threshold < 3 ? '#e74c3c' : 'rgba(255,255,255,0.06)') + '; border-radius:3px;">'
            + '<span style="flex:2; font-size:0.8rem;">Account lockout threshold</span>'
            + '<span style="flex:1; font-size:0.8rem;">';
        if (isS4 && !gpoFixed) {
            rightHtml += '<input id="gpoThresholdInput" type="number" value="' + threshold + '" min="0" max="999" style="width:60px; padding:3px 6px; background:rgba(255,255,255,0.08); border:1px solid rgba(155,89,182,0.4); border-radius:3px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;"> invalid logon attempts</span>';
        } else {
            rightHtml += threshold + ' invalid logon attempts</span>';
        }
        rightHtml += '</div>';

        // Duration field
        rightHtml += '<div style="display:flex; align-items:center; padding:8px; margin-bottom:4px; background:rgba(255,255,255,0.02); border:1px solid ' + (isS4 && !gpoFixed && duration === 0 ? '#e74c3c' : 'rgba(255,255,255,0.06)') + '; border-radius:3px;">'
            + '<span style="flex:2; font-size:0.8rem;">Account lockout duration</span>'
            + '<span style="flex:1; font-size:0.8rem;">';
        if (isS4 && !gpoFixed) {
            rightHtml += '<input id="gpoDurationInput" type="number" value="' + duration + '" min="0" max="99999" style="width:60px; padding:3px 6px; background:rgba(255,255,255,0.08); border:1px solid rgba(155,89,182,0.4); border-radius:3px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;"> minutes (0 = permanent)</span>';
        } else {
            rightHtml += (duration === 0 ? '0 (permanent until unlocked)' : duration + ' minutes') + '</span>';
        }
        rightHtml += '</div>';

        // Counter reset field
        rightHtml += '<div style="display:flex; align-items:center; padding:8px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:3px;">'
            + '<span style="flex:2; font-size:0.8rem;">Reset account lockout counter after</span>'
            + '<span style="flex:1; font-size:0.8rem;">';
        if (isS4 && !gpoFixed) {
            rightHtml += '<input id="gpoCounterInput" type="number" value="' + counterReset + '" min="1" max="99999" style="width:60px; padding:3px 6px; background:rgba(255,255,255,0.08); border:1px solid rgba(155,89,182,0.4); border-radius:3px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;"> minutes</span>';
        } else {
            rightHtml += counterReset + ' minutes</span>';
        }
        rightHtml += '</div>';

        if (isS4 && !gpoFixed) {
            rightHtml += '<div style="margin-top:12px; display:flex; gap:8px;">'
                + '<button id="gpoApplyBtn" style="padding:7px 22px; background:#9b59b6; color:#fff; border:none; border-radius:3px; cursor:pointer; font-weight:bold; font-size:0.8rem;">Apply Policy</button>'
                + '</div>';
        }

        rightHtml += '</div>';

        // Password Policy section (read-only always)
        rightHtml += '<div style="margin-bottom:16px;">'
            + '<div style="font-weight:bold; color:#ce93d8; margin-bottom:8px; padding-bottom:4px; border-bottom:1px solid rgba(155,89,182,0.2);">Password Policy</div>'
            + '<div style="display:flex; align-items:center; padding:6px 8px; margin-bottom:3px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:3px; font-size:0.8rem;"><span style="flex:2;">Minimum password length</span><span style="flex:1;">12 characters</span></div>'
            + '<div style="display:flex; align-items:center; padding:6px 8px; margin-bottom:3px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:3px; font-size:0.8rem;"><span style="flex:2;">Password must meet complexity requirements</span><span style="flex:1;">Enabled</span></div>'
            + '<div style="display:flex; align-items:center; padding:6px 8px; margin-bottom:3px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:3px; font-size:0.8rem;"><span style="flex:2;">Enforce password history</span><span style="flex:1;">10 passwords</span></div>'
            + '<div style="display:flex; align-items:center; padding:6px 8px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:3px; font-size:0.8rem;"><span style="flex:2;">Maximum password age</span><span style="flex:1;">90 days</span></div>'
            + '</div>';

        if (gpoFixed) {
            rightHtml += '<div style="margin-top:8px; padding:10px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; font-size:0.75rem; color:#2ecc71;">'
                + 'Policy corrected successfully. Run gpupdate /force in PowerShell to push the policy to all domain members.</div>';
        }

        rightHtml += '</div>';
        container.innerHTML = leftHtml + rightHtml;

        if (isS4 && !gpoFixed) {
            var applyBtn = document.getElementById('gpoApplyBtn');
            if (applyBtn) {
                applyBtn.addEventListener('click', function() {
                    var newThreshold = parseInt(document.getElementById('gpoThresholdInput').value) || 0;
                    var newDuration = parseInt(document.getElementById('gpoDurationInput').value);
                    var newCounter = parseInt(document.getElementById('gpoCounterInput').value) || 30;

                    if (newThreshold < 3 || newThreshold > 10) {
                        engine.notify('Lockout threshold should be between 3 and 10. Recommended: 5.', 'error');
                        return;
                    }
                    if (newDuration < 15) {
                        engine.notify('Lockout duration should be at least 15 minutes. Recommended: 30.', 'error');
                        return;
                    }

                    engine.state._gpoThreshold = newThreshold;
                    engine.state._gpoDuration = newDuration;
                    engine.state._gpoCounterReset = newCounter;
                    engine.state._gpoFixed = true;
                    engine.save();
                    engine.notify('GPO updated. Run gpupdate /force in PowerShell to apply the policy, then unlock affected accounts.', 'success');
                    AD001Config._renderGPO(engine);
                });
            }
        }
    },

    // ==========================================================
    // FIREWALL CONSOLE (S3 only)
    // ==========================================================

    _openFirewallConsole: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); AD001Config._renderFirewallConsole(engine); return; }
        var container = document.createElement('div');
        container.id = 'fwConsoleContainer';
        container.style.cssText = 'padding:0; overflow:hidden; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; display:flex; flex-direction:column;';
        engine.openWindow(iconDef.id, 'Firewall Console — Perimeter Rules', 'FW', container);
        AD001Config._renderFirewallConsole(engine);
    },

    _renderFirewallConsole: function(engine) {
        var container = document.getElementById('fwConsoleContainer');
        if (!container) return;
        var ruleAdded = engine.state._firewallRuleAdded;

        var html = '<div style="padding:10px 16px; border-bottom:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2); flex-shrink:0;">'
            + '<span style="color:#9b59b6; font-weight:bold;">Perimeter Firewall — Inbound Rules</span>'
            + '</div>'
            + '<div style="padding:8px 16px; font-size:0.7rem; color:#888; border-bottom:1px solid rgba(255,255,255,0.06); flex-shrink:0; display:flex;">'
            + '<span style="flex:0.5;">Status</span><span style="flex:1;">Name</span><span style="flex:1.2;">Source</span><span style="flex:1.2;">Destination</span><span style="flex:0.7;">Port</span><span style="flex:0.7;">Action</span>'
            + '</div>'
            + '<div style="flex:1; overflow-y:auto;">';

        // Standard allow rules
        var existingRules = [
            { status: 'Allow', name: 'VPN — Employee Access', src: '0.0.0.0/0', dst: '10.0.0.0/24', port: '443/TCP', action: 'Allow' },
            { status: 'Allow', name: 'HTTPS — Web Traffic', src: '0.0.0.0/0', dst: 'Any', port: '443/TCP', action: 'Allow' },
            { status: 'Allow', name: 'LDAP — Internal DC', src: '192.168.1.0/24', dst: '192.168.1.10', port: '389/TCP', action: 'Allow' },
            { status: 'Allow', name: 'DNS — Internal Resolver', src: '192.168.1.0/24', dst: '192.168.1.10', port: '53/UDP', action: 'Allow' },
            { status: 'Allow', name: 'RDP — IT Admin', src: '192.168.1.10/32', dst: 'Any', port: '3389/TCP', action: 'Allow' }
        ];

        existingRules.forEach(function(r) {
            html += '<div style="display:flex; align-items:center; padding:7px 16px; border-bottom:1px solid rgba(255,255,255,0.04);">'
                + '<span style="flex:0.5; color:#2ecc71; font-size:0.75rem;">ON</span>'
                + '<span style="flex:1; font-size:0.8rem;">' + r.name + '</span>'
                + '<span style="flex:1.2; color:#888; font-size:0.75rem;">' + r.src + '</span>'
                + '<span style="flex:1.2; color:#888; font-size:0.75rem;">' + r.dst + '</span>'
                + '<span style="flex:0.7; color:#888; font-size:0.75rem;">' + r.port + '</span>'
                + '<span style="flex:0.7; color:#2ecc71; font-size:0.75rem;">' + r.action + '</span>'
                + '</div>';
        });

        if (ruleAdded) {
            html += '<div style="display:flex; align-items:center; padding:7px 16px; border-bottom:1px solid rgba(255,255,255,0.04); background:rgba(155,89,182,0.08);">'
                + '<span style="flex:0.5; color:#e74c3c; font-size:0.75rem;">ON</span>'
                + '<span style="flex:1; font-size:0.8rem; color:#ce93d8;">BLOCK — Credential Attack Source</span>'
                + '<span style="flex:1.2; color:#e74c3c; font-size:0.75rem;">10.0.0.1</span>'
                + '<span style="flex:1.2; color:#888; font-size:0.75rem;">Any</span>'
                + '<span style="flex:0.7; color:#888; font-size:0.75rem;">All</span>'
                + '<span style="flex:0.7; color:#e74c3c; font-size:0.75rem; font-weight:bold;">Deny</span>'
                + '</div>';
        }

        html += '</div>';

        if (!ruleAdded) {
            html += '<div style="padding:12px 16px; border-top:1px solid rgba(255,255,255,0.1); flex-shrink:0; background:rgba(0,0,0,0.15);">'
                + '<div style="font-size:0.75rem; color:#888; margin-bottom:8px;">Add new deny rule to block credential stuffing source:</div>'
                + '<div style="display:flex; gap:8px; align-items:center;">'
                + '<input id="fwSourceIP" type="text" placeholder="Source IP to block" value="10.0.0.1" style="padding:5px 8px; background:rgba(255,255,255,0.06); border:1px solid rgba(155,89,182,0.3); border-radius:3px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; width:160px;">'
                + '<select id="fwAction" style="padding:5px 8px; background:#0d1117; border:1px solid rgba(155,89,182,0.3); border-radius:3px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;">'
                + '<option value="deny">Deny</option><option value="allow">Allow</option>'
                + '</select>'
                + '<button id="fwAddRuleBtn" style="padding:6px 18px; background:#9b59b6; color:#fff; border:none; border-radius:3px; cursor:pointer; font-weight:bold; font-size:0.8rem;">Add Rule</button>'
                + '</div>'
                + '</div>';
        } else {
            var flagVal = engine.state._flagRevealed ? AD001Config._scenarioFlags.brute_force : '';
            html += '<div style="padding:12px 16px; border-top:1px solid rgba(255,255,255,0.1); flex-shrink:0; background:rgba(46,204,113,0.05);">'
                + '<div style="color:#2ecc71; font-size:0.8rem; font-weight:bold; margin-bottom:4px;">Deny rule active — attack source blocked.</div>'
                + (flagVal ? '<div style="margin-top:8px; padding:8px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:3px; font-size:0.75rem; color:#c8e6c9;">Incident token: ' + flagVal + '</div>' : '<div style="color:#888; font-size:0.75rem;">Bulk-unlock accounts to complete remediation and retrieve the incident token.</div>')
                + '</div>';
        }

        container.innerHTML = html;

        if (!ruleAdded) {
            var addBtn = document.getElementById('fwAddRuleBtn');
            if (addBtn) {
                addBtn.addEventListener('click', function() {
                    var srcIP = document.getElementById('fwSourceIP').value.trim();
                    var action = document.getElementById('fwAction').value;
                    if (!srcIP.match(/^\d+\.\d+\.\d+\.\d+$/)) {
                        engine.notify('Invalid IP address format.', 'error');
                        return;
                    }
                    if (action === 'deny' && srcIP === '10.0.0.1') {
                        engine.state._firewallRuleAdded = true;
                        engine.save();
                        engine.notify('Deny rule added for 10.0.0.1. Attack source blocked. Now bulk-unlock affected accounts.', 'success');
                        AD001Config._checkLockoutFix(engine);
                        AD001Config._renderFirewallConsole(engine);
                    } else if (action === 'deny') {
                        engine.notify('Rule added for ' + srcIP + ' (no effect on current scenario).', 'info');
                    } else {
                        engine.notify('Allow rules for attacking IPs are not effective. Choose Deny.', 'error');
                    }
                });
            }
        }
    },

    // ==========================================================
    // NETWORK DEVICE CONFIG (S1 — scanner creds)
    // ==========================================================

    _openNetDeviceConfig: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); AD001Config._renderNetDeviceConfig(engine); return; }
        var container = document.createElement('div');
        container.id = 'ndcContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Network Device Config — Scanner 192.168.1.150', 'NDC', container);
        AD001Config._renderNetDeviceConfig(engine);
    },

    _renderNetDeviceConfig: function(engine) {
        var container = document.getElementById('ndcContainer');
        if (!container) return;
        var credsUpdated = engine.state._scannerCredsUpdated;

        var html = '<div style="font-size:0.9rem; font-weight:bold; color:#9b59b6; margin-bottom:4px;">Network Scanner — NETSCANNER01</div>'
            + '<div style="color:#888; font-size:0.75rem; margin-bottom:16px;">IP: 192.168.1.150 &nbsp; | &nbsp; Model: Ricoh IM 7000 &nbsp; | &nbsp; Firmware: 2.04.1</div>'

            + '<div style="margin-bottom:16px; padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px;">'
            + '<div style="font-weight:bold; color:#ce93d8; margin-bottom:8px;">Scan-to-Folder Configuration</div>'
            + '<div style="margin-bottom:8px;"><div style="color:#888; font-size:0.7rem;">Destination Path</div><div>\\\\FILESERVER01\\Finance</div></div>'
            + '<div style="margin-bottom:8px;"><div style="color:#888; font-size:0.7rem;">Authentication Account</div><div>HEXWORTH\\svc_scanner</div></div>'
            + '<div style="margin-bottom:8px;"><div style="color:#888; font-size:0.7rem;">Stored Password</div>'
            + '<div style="color:' + (credsUpdated ? '#2ecc71' : '#e74c3c') + ';">' + (credsUpdated ? '[Updated — new credentials stored]' : '&#x25cf;&#x25cf;&#x25cf;&#x25cf;&#x25cf;&#x25cf;&#x25cf;&#x25cf; (last changed: 2025-06-01 — STALE)') + '</div></div>'
            + '</div>'

            + (credsUpdated
                ? '<div style="padding:10px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; font-size:0.8rem; color:#2ecc71; margin-bottom:12px;">'
                    + 'Credentials updated. Scanner will use new password on next scan cycle. Unlock affected Finance accounts to complete remediation.</div>'
                : '<div style="margin-bottom:16px;">'
                    + '<div style="margin-bottom:8px; padding:8px; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:3px; font-size:0.75rem; color:#ffcc80;">'
                    + 'The stored password for \\\\FILESERVER01\\Finance is outdated. The Finance share password was changed 9 months ago. This scanner is causing lockouts by repeatedly attempting authentication with the old password.'
                    + '</div>'
                    + '<div style="margin-bottom:8px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">New Password</div>'
                    + '<input id="ndcNewPwd" type="password" placeholder="Enter updated Finance share password" style="width:100%; box-sizing:border-box; padding:6px 8px; background:rgba(255,255,255,0.06); border:1px solid rgba(155,89,182,0.3); border-radius:3px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;"></div>'
                    + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">Confirm Password</div>'
                    + '<input id="ndcConfirmPwd" type="password" placeholder="Confirm" style="width:100%; box-sizing:border-box; padding:6px 8px; background:rgba(255,255,255,0.06); border:1px solid rgba(155,89,182,0.3); border-radius:3px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;"></div>'
                    + '<button id="ndcUpdateBtn" style="padding:7px 22px; background:#9b59b6; color:#fff; border:none; border-radius:3px; cursor:pointer; font-weight:bold; font-size:0.8rem;">Update Credentials</button>'
                    + '</div>');

        container.innerHTML = html;

        if (!credsUpdated) {
            var updateBtn = document.getElementById('ndcUpdateBtn');
            if (updateBtn) {
                updateBtn.addEventListener('click', function() {
                    var pwd = document.getElementById('ndcNewPwd').value;
                    var confirm = document.getElementById('ndcConfirmPwd').value;
                    if (!pwd || pwd.length < 8) {
                        engine.notify('Password must be at least 8 characters.', 'error');
                        return;
                    }
                    if (pwd !== confirm) {
                        engine.notify('Passwords do not match.', 'error');
                        return;
                    }
                    engine.state._scannerCredsUpdated = true;
                    engine.save();
                    engine.notify('Scanner credentials updated. Now unlock the affected Finance accounts in ADUC or via PowerShell.', 'success');
                    AD001Config._checkLockoutFix(engine);
                    AD001Config._renderNetDeviceConfig(engine);
                });
            }
        }
    },

    // ==========================================================
    // IIS MANAGER (S2 — service account app pool)
    // ==========================================================

    _openIISManager: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); AD001Config._renderIISManager(engine); return; }
        var container = document.createElement('div');
        container.id = 'iisContainer';
        container.style.cssText = 'display:flex; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; overflow:hidden;';
        engine.openWindow(iconDef.id, 'IIS Manager — DC01', 'IIS', container);
        AD001Config._renderIISManager(engine);
    },

    _renderIISManager: function(engine) {
        var container = document.getElementById('iisContainer');
        if (!container) return;
        var poolUpdated = engine.state._iisPoolUpdated;
        var pwdReset = engine.state._svcPasswordReset;

        var appPools = [
            { name: 'DefaultAppPool', identity: 'ApplicationPoolIdentity', state: 'Started', apps: 1 },
            { name: 'WebPortalPool', identity: 'HEXWORTH\\svc_webportal', state: poolUpdated ? 'Started' : 'Stopped', apps: 1 }
        ];

        // Left pane
        var leftHtml = '<div style="width:200px; min-width:200px; border-right:1px solid rgba(255,255,255,0.1); padding:12px; background:rgba(0,0,0,0.2);">'
            + '<div style="color:#9b59b6; font-weight:bold; margin-bottom:10px; font-size:0.75rem;">IIS Manager</div>'
            + '<div style="color:#aaa; padding:3px 0;">&#9660; DC01 (localhost)</div>'
            + '<div style="padding-left:12px;">'
            + '<div style="color:#ce93d8; padding:3px 0; cursor:pointer; font-weight:bold;">Application Pools</div>'
            + '<div style="color:#888; padding:3px 0; cursor:pointer;">Sites</div>'
            + '</div>'
            + '</div>';

        // Right pane
        var rightHtml = '<div style="flex:1; padding:16px; overflow-y:auto;">'
            + '<div style="font-size:0.9rem; font-weight:bold; color:#9b59b6; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:8px;">Application Pools</div>'
            + '<div style="display:flex; font-size:0.7rem; color:#888; padding:5px 8px; border-bottom:1px solid rgba(255,255,255,0.06); margin-bottom:4px;">'
            + '<span style="flex:2;">Name</span><span style="flex:1.5;">Identity</span><span style="flex:0.7;">State</span><span style="flex:0.5;">Apps</span><span style="flex:1;">Actions</span>'
            + '</div>';

        appPools.forEach(function(pool, pi) {
            var isPortal = pool.name === 'WebPortalPool';
            var isBroken = isPortal && !poolUpdated;
            rightHtml += '<div style="display:flex; align-items:center; padding:8px; margin-bottom:4px; background:' + (isBroken ? 'rgba(231,76,60,0.06)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (isBroken ? 'rgba(231,76,60,0.25)' : 'rgba(255,255,255,0.06)') + '; border-radius:3px; cursor:pointer; transition:border-color 0.15s;" class="iis-pool-row" data-pi="' + pi + '">'
                + '<span style="flex:2; font-weight:' + (isPortal ? 'bold' : 'normal') + ';">' + pool.name + '</span>'
                + '<span style="flex:1.5; font-size:0.75rem; color:#888;">' + pool.identity + '</span>'
                + '<span style="flex:0.7; font-size:0.75rem; color:' + (pool.state === 'Started' ? '#2ecc71' : '#e74c3c') + '; font-weight:bold;">' + pool.state + '</span>'
                + '<span style="flex:0.5; font-size:0.75rem; color:#888;">' + pool.apps + '</span>'
                + '<span style="flex:1;">' + (isPortal && !poolUpdated ? '<button class="iis-fix-btn" data-pi="' + pi + '" style="padding:4px 10px; background:#9b59b6; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.75rem;">Fix Identity</button>' : '') + '</span>'
                + '</div>';
        });

        if (!pwdReset) {
            rightHtml += '<div style="margin-top:12px; padding:10px; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; font-size:0.75rem; color:#ffcc80;">'
                + 'WebPortalPool is stopped because svc_webportal password is expired. Reset the password in ADUC first, then update the pool identity here.'
                + '</div>';
        } else if (!poolUpdated) {
            rightHtml += '<div style="margin-top:12px; padding:10px; background:rgba(155,89,182,0.1); border:1px solid rgba(155,89,182,0.25); border-radius:4px; font-size:0.75rem; color:#ce93d8;">'
                + 'svc_webportal password has been reset. Click "Fix Identity" on WebPortalPool to update the stored password and restart the pool.'
                + '</div>';
        }

        rightHtml += '</div>';
        container.innerHTML = leftHtml + rightHtml;

        container.querySelectorAll('.iis-fix-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (!engine.state._svcPasswordReset) {
                    engine.notify('Reset svc_webportal password in ADUC first before updating the app pool identity.', 'error');
                    return;
                }
                AD001Config._openIISPoolDialog(engine);
            });
        });

        container.querySelectorAll('.iis-pool-row').forEach(function(row) {
            row.addEventListener('mouseenter', function() { this.style.borderColor = '#9b59b6'; });
            row.addEventListener('mouseleave', function() {
                var pi = parseInt(this.getAttribute('data-pi'));
                var isPortal = pi === 1;
                this.style.borderColor = isPortal && !engine.state._iisPoolUpdated ? 'rgba(231,76,60,0.25)' : 'rgba(255,255,255,0.06)';
            });
        });
    },

    _openIISPoolDialog: function(engine) {
        var existing = document.getElementById('iisPoolDlg');
        if (existing) existing.remove();

        var dlg = document.createElement('div');
        dlg.id = 'iisPoolDlg';
        dlg.style.cssText = 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background:#1a1a2e; border:1px solid rgba(155,89,182,0.35); border-radius:6px; padding:20px; width:380px; z-index:9000; font-family:Consolas,monospace; color:#c8e6c9; font-size:0.8rem;';
        dlg.innerHTML = '<div style="font-weight:bold; margin-bottom:4px; color:#9b59b6;">WebPortalPool — Advanced Settings</div>'
            + '<div style="color:#888; font-size:0.75rem; margin-bottom:16px;">Identity Configuration</div>'
            + '<div style="margin-bottom:8px;"><div style="color:#888; font-size:0.7rem;">Identity Type</div><div>Custom account: HEXWORTH\\svc_webportal</div></div>'
            + '<div style="margin-bottom:8px;"><div style="color:#888; font-size:0.7rem;">Username</div><div>HEXWORTH\\svc_webportal</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">Password (enter new password to sync with AD)</div>'
            + '<input id="iisNewPwd" type="password" placeholder="Enter the new svc_webportal password" style="width:100%; box-sizing:border-box; padding:6px 8px; background:rgba(255,255,255,0.06); border:1px solid rgba(155,89,182,0.3); border-radius:3px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;">'
            + '</div>'
            + '<div style="display:flex; gap:8px; justify-content:flex-end;">'
            + '<button id="iisPoolOk" style="padding:6px 18px; background:#9b59b6; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.8rem; font-weight:bold;">Update</button>'
            + '<button id="iisPoolCancel" style="padding:6px 14px; background:rgba(255,255,255,0.08); color:#ccc; border:1px solid rgba(255,255,255,0.15); border-radius:3px; cursor:pointer; font-size:0.8rem;">Cancel</button>'
            + '</div>';

        var arena = document.getElementById('arena');
        arena.appendChild(dlg);

        document.getElementById('iisPoolCancel').addEventListener('click', function() { dlg.remove(); });
        document.getElementById('iisPoolOk').addEventListener('click', function() {
            var pwd = document.getElementById('iisNewPwd').value;
            if (!pwd || pwd.length < 8) {
                engine.notify('Please enter the new password for svc_webportal.', 'error');
                return;
            }
            engine.state._iisPoolUpdated = true;
            engine.save();
            dlg.remove();
            engine.notify('WebPortalPool identity updated. Portal will be available within 60 seconds.', 'success');
            AD001Config._checkLockoutFix(engine);
            AD001Config._renderIISManager(engine);
        });
    },

    // ==========================================================
    // NETWORK MANAGEMENT (S5 — disable rogue switch port)
    // ==========================================================

    _openNetManagement: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); AD001Config._renderNetManagement(engine); return; }
        var container = document.createElement('div');
        container.id = 'netMgmtContainer';
        container.style.cssText = 'display:flex; flex-direction:column; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; overflow:hidden;';
        engine.openWindow(iconDef.id, 'Network Management — Core Switch', 'NET', container);
        AD001Config._renderNetManagement(engine);
    },

    _renderNetManagement: function(engine) {
        var container = document.getElementById('netMgmtContainer');
        if (!container) return;
        var portDisabled = engine.state._roguePortDisabled;

        var ports = [
            { port: 'Gi0/1',  ip: '192.168.1.1',   mac: '00:1A:2B:3C:4D:01', device: 'Core Router',             status: 'connected', vlan: 1 },
            { port: 'Gi0/2',  ip: '192.168.1.10',  mac: '00:1A:2B:3C:4D:02', device: 'DC01 (Domain Controller)', status: 'connected', vlan: 1 },
            { port: 'Gi0/10', ip: '192.168.1.50',  mac: '00:1A:2B:3C:4D:10', device: 'Admin Workstation',        status: 'connected', vlan: 1 },
            { port: 'Gi0/20', ip: '192.168.1.100', mac: '00:1A:2B:3C:4D:14', device: 'FILESERVER01',             status: 'connected', vlan: 10 },
            { port: 'Gi0/21', ip: '192.168.1.142', mac: 'A4:BB:CC:DD:EE:F0', device: 'DESK-142 (UNMANAGED)',      status: portDisabled ? 'disabled' : 'connected', vlan: 1, rogue: true },
            { port: 'Gi0/22', ip: '192.168.1.143', mac: '00:1A:2B:3C:4D:16', device: 'User Workstation',          status: 'connected', vlan: 1 },
            { port: 'Gi0/30', ip: '192.168.1.150', mac: '08:00:27:AB:CD:EF', device: 'NETSCANNER01',              status: 'connected', vlan: 20 }
        ];

        var html = '<div style="padding:10px 16px; border-bottom:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2); flex-shrink:0;">'
            + '<span style="color:#9b59b6; font-weight:bold;">Core Switch — CISCO-SW-01 — Port Status</span>'
            + '</div>'
            + '<div style="display:flex; font-size:0.7rem; color:#888; padding:5px 12px; border-bottom:1px solid rgba(255,255,255,0.06); flex-shrink:0; background:rgba(0,0,0,0.1);">'
            + '<span style="flex:0.7;">Port</span><span style="flex:1.3;">IP Address</span><span style="flex:1.5;">MAC</span><span style="flex:2;">Device</span><span style="flex:0.5;">VLAN</span><span style="flex:0.8;">Status</span><span style="flex:1;">Action</span>'
            + '</div>'
            + '<div style="flex:1; overflow-y:auto;">';

        ports.forEach(function(p) {
            var isRogue = p.rogue;
            var rowBg = isRogue ? 'rgba(231,76,60,0.06)' : 'rgba(255,255,255,0.01)';
            var borderColor = isRogue ? 'rgba(231,76,60,0.2)' : 'rgba(255,255,255,0.04)';
            var statusColor = p.status === 'connected' ? '#2ecc71' : '#888';

            html += '<div style="display:flex; align-items:center; padding:7px 12px; border-bottom:1px solid ' + borderColor + '; background:' + rowBg + ';">'
                + '<span style="flex:0.7; font-size:0.75rem; color:#888;">' + p.port + '</span>'
                + '<span style="flex:1.3; font-size:0.75rem;">' + p.ip + '</span>'
                + '<span style="flex:1.5; font-size:0.7rem; color:#888; font-variant:small-caps;">' + p.mac + '</span>'
                + '<span style="flex:2; font-size:0.8rem; color:' + (isRogue ? '#e74c3c' : '#ccc') + '; font-weight:' + (isRogue ? 'bold' : 'normal') + ';">' + p.device + '</span>'
                + '<span style="flex:0.5; font-size:0.75rem; color:#888;">' + p.vlan + '</span>'
                + '<span style="flex:0.8; font-size:0.75rem; color:' + statusColor + '; font-weight:bold;">' + p.status.toUpperCase() + '</span>'
                + '<span style="flex:1;">' + (isRogue && p.status === 'connected' ? '<button id="disablePort142Btn" style="padding:4px 10px; background:#e74c3c; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.75rem; font-weight:bold;">Disable Port</button>' : (isRogue && p.status === 'disabled' ? '<span style="color:#888; font-size:0.75rem;">Disabled</span>' : '')) + '</span>'
                + '</div>';
        });

        html += '</div>';

        if (portDisabled) {
            var flagVal = engine.state._flagRevealed ? AD001Config._scenarioFlags.rogue_task : '';
            html += '<div style="padding:12px 16px; border-top:1px solid rgba(255,255,255,0.1); flex-shrink:0; background:rgba(46,204,113,0.05);">'
                + '<div style="color:#2ecc71; font-weight:bold; font-size:0.8rem;">Gi0/21 disabled — DESK-142 is offline. Rogue scheduled task neutralized.</div>'
                + (flagVal ? '<div style="margin-top:8px; padding:8px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:3px; font-size:0.75rem; color:#c8e6c9;">Incident token: ' + flagVal + '</div>' : '<div style="color:#888; font-size:0.75rem; margin-top:4px;">Unlock affected accounts to complete remediation.</div>')
                + '</div>';
        }

        container.innerHTML = html;

        var disableBtn = document.getElementById('disablePort142Btn');
        if (disableBtn) {
            disableBtn.addEventListener('click', function() {
                engine.state._roguePortDisabled = true;
                engine.save();
                engine.notify('Switch port Gi0/21 disabled. DESK-142 (192.168.1.142) is now offline. Unlock affected accounts to complete remediation.', 'success');
                AD001Config._checkLockoutFix(engine);
                AD001Config._renderNetManagement(engine);
            });
        }
    },

    // ==========================================================
    // CONFIRM RESET
    // ==========================================================

    _confirmReset: function(engine) {
        var existing = document.getElementById('ad001ResetOverlay');
        if (existing) existing.remove();

        var overlay = document.createElement('div');
        overlay.id = 'ad001ResetOverlay';
        overlay.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        overlay.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(155,89,182,0.3); border-radius:6px; padding:28px; width:380px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9; font-size:0.85rem;">'
            + '<div style="color:#9b59b6; font-weight:bold; font-size:1rem; margin-bottom:12px;">Reset Lab</div>'
            + '<div style="color:#aaa; margin-bottom:20px; font-size:0.8rem;">This will reset all progress, clear the active scenario, and return the lab to its initial state.</div>'
            + '<div style="display:flex; gap:12px; justify-content:center;">'
            + '<button id="ad001ResetConfirm" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button>'
            + '<button id="ad001ResetCancel" style="padding:8px 24px; background:rgba(255,255,255,0.08); color:#ccc; border:1px solid rgba(255,255,255,0.15); border-radius:4px; cursor:pointer;">Cancel</button>'
            + '</div></div>';

        var arena = document.getElementById('arena');
        arena.appendChild(overlay);

        document.getElementById('ad001ResetConfirm').addEventListener('click', function() {
            overlay.remove();
            engine.resetLab();
        });
        document.getElementById('ad001ResetCancel').addEventListener('click', function() { overlay.remove(); });
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    },

    // ==========================================================
    // SHARED HELPER
    // ==========================================================

    _showStatus: function(id, msg, color) {
        var el = document.getElementById(id);
        if (!el) return;
        el.textContent = msg;
        el.style.color = color;
        el.style.display = 'block';
    }

};
