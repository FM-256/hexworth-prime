/* ================================================================
   IR-01: Breach Protocol -- Mission Config
   ================================================================
   Terminal-mode mission. Incident response lifecycle.
   Custom commands: scan, move, ping, logs, isolate, contain,
   eradicate, restore, status.
   IR lifecycle: Identify > Contain > Eradicate > Recover.
   ================================================================ */

var IR_01_CONFIG = {
    id: 'incident-response-01',
    title: 'IR-01 / BREACH PROTOCOL',
    subtitle: 'Active ransomware detected. Contain, eradicate, recover.',
    category: 'incident-response',
    difficulty: 2,
    inputMode: 'terminal',
    promptText: 'soc-analyst@siem:~$ ',

    grid: {
        rows: 4,
        cols: 5,
        cells: [
            ['siem',  'empty',       'web-server',  'app-server',      'wall'],
            ['empty', 'core-switch', 'empty',       'infected-server', 'wall'],
            ['wall',  'firewall',    'empty',       'database',        'backup'],
            ['wall',  'wall',        'honeypot',    'wall',            'wall']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'siem':            { label: 'SIEM',      abbr: 'SIM', ip: '10.1.0.5',   desc: 'Splunk SIEM -- central log aggregation',  ports: ['8000/SPLUNK-WEB','8089/SPLUNK-API','9997/FORWARDER'], os: 'CentOS Stream 9' },
        'web-server':      { label: 'WEB-SRV',   abbr: 'WEB', ip: '10.1.0.20',  desc: 'Customer-facing web server',              ports: ['80/HTTP','443/HTTPS','22/SSH'],                       os: 'Ubuntu 22.04 LTS' },
        'app-server':      { label: 'APP-SRV',   abbr: 'APP', ip: '10.1.0.25',  desc: 'Internal application server',             ports: ['8080/HTTP','8443/HTTPS','22/SSH'],                    os: 'RHEL 9.3' },
        'core-switch':     { label: 'CORE-SW',   abbr: 'CSW', ip: '10.1.0.1',   desc: 'Core network switch -- L3 VLAN routing',  ports: ['22/SSH','161/SNMP','443/HTTPS-MGMT'],                 os: 'Cisco IOS-XE 17.9' },
        'infected-server': { label: 'INFECTED',  abbr: 'INF', ip: '10.1.0.30',  desc: 'Compromised server -- ransomware detected', ports: ['22/SSH','445/SMB','4444/REVERSE-SHELL'],            os: 'Ubuntu 20.04 LTS' },
        'firewall':        { label: 'FIREWALL',  abbr: 'FWL', ip: '10.1.0.254', desc: 'Perimeter firewall -- Palo Alto',          ports: ['443/HTTPS-MGMT','22/SSH'],                           os: 'PAN-OS 11.1' },
        'database':        { label: 'DB-SRV',    abbr: 'DBS', ip: '10.1.0.40',  desc: 'Production database server',               ports: ['5432/PostgreSQL','22/SSH'],                          os: 'Ubuntu 22.04 LTS' },
        'backup':          { label: 'BACKUP',    abbr: 'BAK', ip: '10.1.0.50',  desc: 'Air-gapped backup server',                 ports: ['22/SSH','9392/VEEAM'],                               os: 'Windows Server 2022' },
        'honeypot':        { label: 'HONEYPOT',  abbr: 'HPT', ip: '10.1.0.99',  desc: 'Decoy server -- attacker bait',            ports: ['22/SSH','80/HTTP','445/SMB','3389/RDP'],              os: 'T-Pot Honeypot' }
    },

    traps: [],
    gates: {},

    objectives: [
        { id: 'threat-id',    label: 'Identify threat vector',   check: 'threatIdentified' },
        { id: 'isolate-host', label: 'Isolate infected host',    check: 'hostIsolated' },
        { id: 'eradicate',    label: 'Eradicate malware',        check: 'malwareEradicated' },
        { id: 'restore',      label: 'Restore from backup',      check: 'backupRestored' }
    ],

    integrity: 3,

    completion: {
        title: 'BREACH PROTOCOL',
        subtitle: 'Breach contained and resolved. Well done, analyst.',
        storageKey: 'hexworth_operator_ir01'
    },

    briefing: [
        'CRITICAL ALERT: Ransomware detected on',
        '10.1.0.30 (INFECTED). Lateral movement',
        'suspected. Follow IR lifecycle:',
        'Identify > Contain > Eradicate > Recover.'
    ],

    commands: ['scan', 'move', 'ping', 'logs', 'isolate', 'contain', 'eradicate', 'restore', 'status', 'help', 'clear'],

    // Custom state fields beyond engine baseline
    customState: {
        threatIdentified: false,
        hostIsolated: false,
        malwareEradicated: false,
        backupRestored: false,
        firewallContained: false
    }
};
