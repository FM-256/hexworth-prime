/* ================================================================
   WINDOWS-CMD-02: Blue Screen Protocol -- Mission Config
   ================================================================
   Terminal-mode mission. Windows Server admin environment on SRV-DC01.
   Custom commands: scan, move, schtasks, sc, net, wevtutil, reg, gpresult.
   Location-specific: commands only work at the correct panel node.
   Objectives: find rogue task, stop service, disable user, verify in logs.
   ================================================================ */

var WINDOWS_CMD_02_CONFIG = {
    id: 'windows-cmd-02',
    title: 'WINDOWS-CMD-02 / BLUE SCREEN PROTOCOL',
    subtitle: 'Diagnose rogue persistence on SRV-DC01. Remediate all threats.',
    category: 'windows-admin',
    difficulty: 2,
    inputMode: 'terminal',
    promptText: 'C:\\Operator> ',

    grid: {
        rows: 4,
        cols: 5,
        cells: [
            ['task-scheduler', 'services-panel', 'event-viewer', 'wall',            'wall'],
            ['empty',          'user-accounts',  'empty',         'registry-editor', 'wall'],
            ['wall',           'group-policy',   'empty',         'empty',           'network-shares'],
            ['wall',           'empty',          'startup-config','empty',           'wall']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'task-scheduler': { label: 'TASK SCHEDULER', abbr: 'TSK', ip: 'SRV-DC01', desc: 'Windows Task Scheduler -- scheduled jobs & automation',          ports: ['N/A (local admin tool)'], os: 'Windows Server 2022' },
        'services-panel': { label: 'SERVICES',        abbr: 'SVC', ip: 'SRV-DC01', desc: 'Service Control Manager -- running services list',               ports: ['N/A (local admin tool)'], os: 'Windows Server 2022' },
        'event-viewer':   { label: 'EVENT VIEWER',    abbr: 'EVT', ip: 'SRV-DC01', desc: 'Windows Event Log -- Security/System/Application logs',          ports: ['N/A (local admin tool)'], os: 'Windows Server 2022' },
        'user-accounts':  { label: 'USER ACCOUNTS',   abbr: 'USR', ip: 'SRV-DC01', desc: 'Local user & group management -- net user/localgroup',           ports: ['N/A (local admin tool)'], os: 'Windows Server 2022' },
        'registry-editor':{ label: 'REGISTRY',        abbr: 'REG', ip: 'SRV-DC01', desc: 'Windows Registry -- system configuration and persistence store',  ports: ['N/A (local admin tool)'], os: 'Windows Server 2022' },
        'group-policy':   { label: 'GROUP POLICY',    abbr: 'GPO', ip: 'SRV-DC01', desc: 'Group Policy Objects -- domain-wide security settings',           ports: ['N/A (local admin tool)'], os: 'Windows Server 2022' },
        'network-shares': { label: 'NET SHARES',      abbr: 'NET', ip: 'SRV-DC01', desc: 'SMB network shares -- shared folders and drive mappings',         ports: ['445/SMB', '139/NetBIOS'], os: 'Windows Server 2022' },
        'startup-config': { label: 'STARTUP CONFIG',  abbr: 'STP', ip: 'SRV-DC01', desc: 'Boot configuration & startup programs -- msconfig/autoruns',      ports: ['N/A (local admin tool)'], os: 'Windows Server 2022' }
    },

    traps: [],
    gates: {},

    objectives: [
        { id: 'rogue-task',       label: 'Find rogue task',             check: 'rogueTaskFound' },
        { id: 'stop-service',     label: 'Stop malicious service',     check: 'maliciousServiceStopped' },
        { id: 'disable-user',     label: 'Disable unauthorized user',  check: 'unauthorizedUserDisabled' },
        { id: 'verify-remediate', label: 'Verify remediation (logs)',  check: 'remediationVerified' }
    ],

    integrity: 3,

    completion: {
        title: 'BLUE SCREEN PROTOCOL',
        subtitle: 'SRV-DC01 is clean. Incident contained.',
        storageKey: 'hexworth_operator_windowscmd02'
    },

    briefing: [
        'SRV-DC01 triggered a blue-screen overnight.',
        'Automated recovery brought it back online,',
        'but persistence artifacts detected.',
        'Navigate admin panels. Diagnose threats.',
        'Remediate and verify via event logs.'
    ],

    commands: ['scan', 'move', 'schtasks', 'sc', 'net', 'wevtutil', 'reg', 'gpresult', 'status', 'help', 'clear'],

    // Custom state fields beyond engine baseline
    customState: {
        rogueTaskFound: false,
        rogueTaskDisabled: false,
        serviceViewed: false,
        maliciousServiceStopped: false,
        userViewed: false,
        unauthorizedUserDisabled: false,
        remediationVerified: false
    }
};
