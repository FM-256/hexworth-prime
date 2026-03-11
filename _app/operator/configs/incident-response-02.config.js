/* ================================================================
   IR-02: Ransomware Dawn -- Mission Config
   ================================================================
   Terminal-mode mission. Active ransomware on corporate network.
   Custom commands: scan, move, isolate, analyze, restore, trace,
   contain, status.
   File shares encrypting. Lateral movement detected.
   ================================================================ */

var IR_02_CONFIG = {
    id: 'incident-response-02',
    title: 'IR-02 / RANSOMWARE DAWN',
    subtitle: 'Active ransomware. Contain spread. Find patient zero. Sever C2.',
    category: 'incident-response',
    difficulty: 3,
    inputMode: 'terminal',
    promptText: 'responder@ir:~$ ',

    grid: {
        rows: 4,
        cols: 5,
        cells: [
            ['file-server',  'email-gateway', 'empty',         'wall',          'wall'],
            ['empty',        'ad-controller', 'empty',          'workstation-a', 'wall'],
            ['wall',         'empty',         'patient-zero',   'empty',         'workstation-b'],
            ['wall',         'backup-vault',  'empty',          'c2-server',     'empty']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'file-server':    { label: 'FILE-SERVER',    abbr: 'FSV', ip: '10.1.0.10',      desc: 'Primary file share -- SMB, currently encrypting',           ports: ['22/SSH','445/SMB','139/NetBIOS'],            os: 'Windows Server 2019' },
        'email-gateway':  { label: 'EMAIL-GW',       abbr: 'EGW', ip: '10.1.0.5',       desc: 'Email gateway -- inbound/outbound mail filtering',          ports: ['25/SMTP','143/IMAP','443/HTTPS'],            os: 'Proofpoint Appliance' },
        'ad-controller':  { label: 'AD-CONTROLLER',  abbr: 'ADC', ip: '10.1.0.2',       desc: 'Active Directory domain controller',                       ports: ['53/DNS','88/Kerberos','389/LDAP','445/SMB'], os: 'Windows Server 2022' },
        'workstation-a':  { label: 'WORKSTATION-A',  abbr: 'WKA', ip: '10.1.1.50',      desc: 'Finance department workstation',                           ports: ['135/RPC','445/SMB','3389/RDP'],              os: 'Windows 11 Pro' },
        'patient-zero':   { label: 'PATIENT-ZERO',   abbr: 'PZ0', ip: '10.1.1.25',      desc: 'First infected machine -- phishing email origin',           ports: ['135/RPC','445/SMB','3389/RDP','4444/BACKDOOR'], os: 'Windows 11 Pro' },
        'workstation-b':  { label: 'WORKSTATION-B',  abbr: 'WKB', ip: '10.1.1.60',      desc: 'HR department workstation -- encrypted files found',        ports: ['135/RPC','445/SMB','3389/RDP'],              os: 'Windows 11 Pro' },
        'backup-vault':   { label: 'BACKUP-VAULT',   abbr: 'BKV', ip: '10.1.0.200',     desc: 'Offline backup storage -- Veeam repository',               ports: ['22/SSH','9392/VEEAM-API'],                   os: 'Ubuntu 22.04 LTS' },
        'c2-server':      { label: 'C2-SERVER',       abbr: 'C2S', ip: '185.147.xx.xx',  desc: 'External command & control server -- encrypted beacon',     ports: ['443/HTTPS','8443/C2-BEACON'],                os: 'Unknown (external)' }
    },

    traps: [],
    gates: {},

    objectives: [
        { id: 'isolate-fs',     label: 'Isolate file server',       check: 'fileServerIsolated' },
        { id: 'patient-zero',   label: 'Identify patient zero',     check: 'patientZeroIdentified' },
        { id: 'verify-backup',  label: 'Verify backups',            check: 'backupVerified' },
        { id: 'block-c2',       label: 'Block C2 communication',    check: 'c2Blocked' }
    ],

    integrity: 3,

    completion: {
        title: 'RANSOMWARE DAWN',
        subtitle: 'Incident contained. Ransomware neutralized.',
        storageKey: 'hexworth_operator_ir02'
    },

    briefing: [
        'Active ransomware on corporate network.',
        'File shares encrypting. Lateral movement',
        'detected. Contain the spread. Find patient',
        'zero. Verify backups. Cut off C2 comms.'
    ],

    commands: ['scan', 'move', 'isolate', 'analyze', 'restore', 'trace', 'contain', 'status', 'help', 'clear'],

    // Custom state fields beyond engine baseline
    customState: {
        fileServerIsolated: false,
        patientZeroIdentified: false,
        backupVerified: false,
        c2Blocked: false,
        infectionChain: []
    }
};
