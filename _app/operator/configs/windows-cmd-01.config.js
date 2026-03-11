/* ================================================================
   WINDOWS-CMD-01: Workstation Triage -- Mission Config
   ================================================================
   Terminal-mode mission. Windows command prompt environment.
   Custom commands: scan, move, ipconfig, netstat, tasklist,
   taskkill, sfc, chkdsk, nslookup, ping, status.
   Objectives require running specific commands at workstation.
   ================================================================ */

var WINDOWS_CMD_01_CONFIG = {
    id: 'windows-cmd-01',
    title: 'WINDOWS-CMD-01 / WORKSTATION TRIAGE',
    subtitle: 'Diagnose compromise. Terminate threat. Repair. Verify DNS.',
    category: 'windows-admin',
    difficulty: 1,
    inputMode: 'terminal',
    promptText: 'C:\\Users\\analyst>',

    grid: {
        rows: 4,
        cols: 5,
        cells: [
            ['workstation','empty','dns-server','domain-controller','wall'],
            ['empty','print-server','empty','file-server','malware-host'],
            ['wall','network-share','empty','empty','wall'],
            ['wall','wall','backup-server','wall','wall']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'workstation':       { label: 'WORKSTATION', abbr: 'WKS', ip: '192.168.1.10', desc: 'Compromised Windows workstation',    ports: ['135/RPC','445/SMB','3389/RDP','5985/WinRM'],             os: 'Windows 10 Pro' },
        'dns-server':        { label: 'DNS-SRV',     abbr: 'DNS', ip: '192.168.1.2',  desc: 'Internal DNS server',               ports: ['53/DNS','135/RPC','445/SMB'],                            os: 'Windows Server 2022' },
        'domain-controller': { label: 'DC-01',       abbr: 'DC1', ip: '192.168.1.1',  desc: 'Active Directory domain controller', ports: ['53/DNS','88/Kerberos','389/LDAP','445/SMB','636/LDAPS'], os: 'Windows Server 2022' },
        'print-server':      { label: 'PRINT-SRV',   abbr: 'PRT', ip: '192.168.1.30', desc: 'Network print server',              ports: ['135/RPC','445/SMB','9100/RAW'],                          os: 'Windows Server 2019' },
        'file-server':       { label: 'FILE-SRV',    abbr: 'FSV', ip: '192.168.1.20', desc: 'Corporate file server',             ports: ['445/SMB','137/NetBIOS','138/NetBIOS'],                   os: 'Windows Server 2022' },
        'malware-host':      { label: 'MALWARE-C2',  abbr: 'C2!', ip: '203.0.113.42', desc: 'External command & control server',  ports: ['443/HTTPS','8443/CUSTOM'],                              os: 'Unknown' },
        'network-share':     { label: 'NET-SHARE',   abbr: 'SHR', ip: '192.168.1.25', desc: 'Department shared drive',           ports: ['445/SMB'],                                               os: 'NAS' },
        'backup-server':     { label: 'BACKUP-SRV',  abbr: 'BAK', ip: '192.168.1.50', desc: 'Veeam backup server',               ports: ['22/SSH','9392/VEEAM'],                                   os: 'Windows Server 2022' }
    },

    traps: [],
    gates: {},

    objectives: [
        { id: 'c2-id',       label: 'Identify C2 connection',  check: 'c2Identified' },
        { id: 'kill-proc',   label: 'Kill malicious process',  check: 'malwareKilled' },
        { id: 'repair-sys',  label: 'Repair system files',     check: 'filesRepaired' },
        { id: 'verify-dns',  label: 'Verify DNS integrity',    check: 'dnsVerified' }
    ],

    integrity: 3,

    completion: {
        title: 'WORKSTATION TRIAGE',
        subtitle: 'Threat neutralized. System restored.',
        storageKey: 'hexworth_operator_windowscmd01'
    },

    briefing: [
        'Incoming alert: workstation WKS-192.168.1.10',
        'is sending traffic to an unrecognized',
        'external IP. Diagnose the compromise,',
        'terminate the threat, repair system files,',
        'and verify DNS integrity.'
    ],

    commands: ['scan', 'move', 'ipconfig', 'netstat', 'tasklist', 'taskkill', 'sfc', 'chkdsk', 'nslookup', 'ping', 'status', 'help', 'clear'],

    // Custom state fields beyond engine baseline
    customState: {
        c2Identified: false,
        malwareKilled: false,
        filesRepaired: false,
        dnsVerified: false
    }
};
