/* ================================================================
   PYTHON-18 / PERIMETER BREACH -- Mission Config
   ================================================================
   Tier 6 mission. 11x11 grid — 121 cells.
   First grid larger than 10x10. Forces nested loop sweeps.

   PUZZLE DESIGN:
   - 11x11 grid representing a corporate perimeter with DMZ
   - 4 perimeter zones: North, East, South, West
   - Each zone has a firewall gate + 2 servers behind it
   - Central core has 2 critical servers + extraction target
   - 6 traps along perimeter corridors
   - Student must sweep all 4 zones then breach the core
   - 121 cells — manual pathing is absurd. Nested loops mandatory.

   PYTHON SKILL: Nested for loops + zone-based function dispatch
     def sweep_zone(start_dir, zone_length):
         for i in range(zone_length):
             safe_advance(start_dir)
             agent.scan()

     # Sweep north zone
     sweep_zone('east', 10)
     # Turn south, sweep next zone
     safe_advance('south')
     sweep_zone('west', 10)

   GRID (11x11):
     [start]  [empty]  [empty]  [trap-1] [empty]  [fw-n]   [empty]  [empty]  [trap-2] [empty]  [wall]
     [empty]  [empty]  [empty]  [empty]  [srv-n1] [empty]  [srv-n2] [empty]  [empty]  [empty]  [empty]
     [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [wall]
     [wall]   [empty]  [empty]  [empty]  [wall]   [empty]  [wall]   [empty]  [empty]  [fw-e]   [empty]
     [empty]  [trap-3] [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [srv-e1] [empty]  [empty]
     [fw-w]   [empty]  [empty]  [empty]  [empty]  [core-1] [empty]  [empty]  [empty]  [empty]  [srv-e2]
     [empty]  [srv-w1] [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [trap-4] [wall]
     [empty]  [empty]  [empty]  [empty]  [wall]   [empty]  [wall]   [empty]  [empty]  [empty]  [empty]
     [wall]   [empty]  [srv-w2] [empty]  [empty]  [core-2] [empty]  [empty]  [empty]  [empty]  [wall]
     [empty]  [empty]  [empty]  [trap-5] [srv-s1] [empty]  [srv-s2] [trap-6] [empty]  [empty]  [empty]
     [wall]   [wall]   [empty]  [empty]  [empty]  [fw-s]   [empty]  [empty]  [empty]  [empty]  [target]
   ================================================================ */

var PYTHON_18_CONFIG = {
    id: 'python-18',
    title: 'PYTHON-18 / PERIMETER BREACH',
    subtitle: '11x11 corporate perimeter. Four zones. One core. Sweep everything.',
    category: 'python-ops',
    difficulty: 4,
    inputMode: 'python',
    agent: { tier: 3 },

    grid: {
        rows: 11, cols: 11,
        cells: [
            ['gateway','empty', 'empty', 'trap-1','empty', 'fw-n',  'empty', 'empty', 'trap-2','empty', 'wall'],
            ['empty',  'empty', 'empty', 'empty', 'srv-n1','empty', 'srv-n2','empty', 'empty', 'empty', 'empty'],
            ['empty',  'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'wall'],
            ['wall',   'empty', 'empty', 'empty', 'wall',  'empty', 'wall',  'empty', 'empty', 'fw-e',  'empty'],
            ['empty',  'trap-3','empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'srv-e1','empty', 'empty'],
            ['fw-w',   'empty', 'empty', 'empty', 'empty', 'core-1','empty', 'empty', 'empty', 'empty', 'srv-e2'],
            ['empty',  'srv-w1','empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'trap-4','wall'],
            ['empty',  'empty', 'empty', 'empty', 'wall',  'empty', 'wall',  'empty', 'empty', 'empty', 'empty'],
            ['wall',   'empty', 'srv-w2','empty', 'empty', 'core-2','empty', 'empty', 'empty', 'empty', 'wall'],
            ['empty',  'empty', 'empty', 'trap-5','srv-s1','empty', 'srv-s2','trap-6','empty', 'empty', 'empty'],
            ['wall',   'wall',  'empty', 'empty', 'empty', 'fw-s',  'empty', 'empty', 'empty', 'empty', 'target']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway':  { label: 'GATEWAY',      abbr: 'GTW', ip: '10.180.0.1',   desc: 'Perimeter entry — northwest corner',       ports: ['22/SSH','443/HTTPS'],                     os: 'Cisco IOS 15.4' },

        /* North zone servers */
        'srv-n1':   { label: 'SRV-NORTH-1',  abbr: 'SN1', ip: '10.180.1.11',  desc: 'North zone — web frontend',               ports: ['22/SSH','80/HTTP','443/HTTPS'],            os: 'Ubuntu 24.04 LTS' },
        'srv-n2':   { label: 'SRV-NORTH-2',  abbr: 'SN2', ip: '10.180.1.12',  desc: 'North zone — API gateway',                ports: ['22/SSH','8080/HTTP','8443/HTTPS'],         os: 'Kong Gateway 3.4' },

        /* East zone servers */
        'srv-e1':   { label: 'SRV-EAST-1',   abbr: 'SE1', ip: '10.180.2.11',  desc: 'East zone — mail server',                 ports: ['25/SMTP','143/IMAP','993/IMAPS'],         os: 'Exchange 2019 CU14' },
        'srv-e2':   { label: 'SRV-EAST-2',   abbr: 'SE2', ip: '10.180.2.12',  desc: 'East zone — file server',                 ports: ['22/SSH','445/SMB','2049/NFS'],             os: 'Windows Server 2022' },

        /* South zone servers */
        'srv-s1':   { label: 'SRV-SOUTH-1',  abbr: 'SS1', ip: '10.180.3.11',  desc: 'South zone — database cluster',           ports: ['22/SSH','3306/MySQL','5432/PostgreSQL'],  os: 'RHEL 9.3' },
        'srv-s2':   { label: 'SRV-SOUTH-2',  abbr: 'SS2', ip: '10.180.3.12',  desc: 'South zone — backup server',              ports: ['22/SSH','873/RSYNC','3260/ISCSI'],        os: 'Debian 12 Bookworm' },

        /* West zone servers */
        'srv-w1':   { label: 'SRV-WEST-1',   abbr: 'SW1', ip: '10.180.4.11',  desc: 'West zone — SIEM server',                 ports: ['22/SSH','9200/ELASTIC','5601/KIBANA'],    os: 'CentOS Stream 9' },
        'srv-w2':   { label: 'SRV-WEST-2',   abbr: 'SW2', ip: '10.180.4.12',  desc: 'West zone — log collector',               ports: ['22/SSH','514/SYSLOG','601/SYSLOG-TLS'],   os: 'Ubuntu 24.04 LTS' },

        /* Core servers */
        'core-1':   { label: 'CORE-DC',      abbr: 'DC1', ip: '10.180.0.10',  desc: 'Core — domain controller',                ports: ['53/DNS','88/KERBEROS','389/LDAP','445/SMB'],os: 'Windows Server 2022 AD' },
        'core-2':   { label: 'CORE-VAULT',   abbr: 'CV2', ip: '10.180.0.20',  desc: 'Core — secrets vault',                    ports: ['22/SSH','8200/VAULT','443/HTTPS'],         os: 'HashiCorp Vault 1.15' },

        /* 4 zone firewalls */
        'fw-n':     { label: 'FW-NORTH',     abbr: 'FWN', ip: '10.180.0.251', desc: 'North zone gate',                          ports: ['22/SSH','443/MGMT'],                      os: 'pfSense 2.7.0', vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL' },
        'fw-e':     { label: 'FW-EAST',      abbr: 'FWE', ip: '10.180.0.252', desc: 'East zone gate',                           ports: ['22/SSH','443/MGMT'],                      os: 'Palo Alto PAN-OS', vuln: 'CVE-2024-7744', vulnDesc: 'Management RCE' },
        'fw-s':     { label: 'FW-SOUTH',     abbr: 'FWS', ip: '10.180.0.253', desc: 'South zone gate',                          ports: ['22/SSH','443/MGMT'],                      os: 'Fortinet FortiGate', vuln: 'CVE-2024-6221', vulnDesc: 'ISN bypass' },
        'fw-w':     { label: 'FW-WEST',      abbr: 'FWW', ip: '10.180.0.254', desc: 'West zone gate',                           ports: ['22/SSH','443/MGMT'],                      os: 'Check Point R81.20', vuln: 'CVE-2024-8855', vulnDesc: 'Credential replay' },

        'target':   { label: 'EXTRACTION',   abbr: 'EXT', ip: '10.180.0.99',  desc: 'Southeast extraction point',                ports: ['22/SSH','8443/HTTPS'],                    os: 'RHEL 9.3' },

        /* 6 traps */
        'trap-1':   { label: 'TRAP-NW',  abbr: 'T01', ip: '10.180.0.201', desc: 'IDS north-west',   ports: ['514/SYSLOG'],   os: 'Snort [TRAP]' },
        'trap-2':   { label: 'TRAP-NE',  abbr: 'T02', ip: '10.180.0.202', desc: 'Honeypot NE',      ports: ['22/SSH-FAKE'],  os: 'Honeyd [TRAP]' },
        'trap-3':   { label: 'TRAP-W',   abbr: 'T03', ip: '10.180.0.203', desc: 'IDS west corridor', ports: ['514/SYSLOG'],   os: 'Suricata [TRAP]' },
        'trap-4':   { label: 'TRAP-E',   abbr: 'T04', ip: '10.180.0.204', desc: 'Honeypot east',     ports: ['80/HTTP-TRAP'], os: 'Honeyd [TRAP]' },
        'trap-5':   { label: 'TRAP-SW',  abbr: 'T05', ip: '10.180.0.205', desc: 'IDS south-west',    ports: ['514/SYSLOG'],   os: 'Snort [TRAP]' },
        'trap-6':   { label: 'TRAP-SE',  abbr: 'T06', ip: '10.180.0.206', desc: 'Honeypot south',    ports: ['445/SMB-FAKE'], os: 'Honeyd [TRAP]' }
    },

    traps: ['trap-1', 'trap-2', 'trap-3', 'trap-4', 'trap-5', 'trap-6'],

    gates: {
        'fw-n': { requires: 'nmap',    flag: 'northZoneCleared',  vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL' },
        'fw-e': { requires: 'exploit', flag: 'eastZoneCleared',   vuln: 'CVE-2024-7744', vulnDesc: 'Management RCE' },
        'fw-s': { requires: 'spoof',   flag: 'southZoneCleared',  vuln: 'CVE-2024-6221', vulnDesc: 'ISN bypass' },
        'fw-w': { requires: 'decrypt', flag: 'westZoneCleared',   vuln: 'CVE-2024-8855', vulnDesc: 'Credential replay' }
    },

    objectives: [
        { id: 'obj_0',  label: 'NORTH -- Bypass gate + nmap both servers',          check: 'northZoneCleared && nmapTargets.has("srv-n1") && nmapTargets.has("srv-n2")' },
        { id: 'obj_1',  label: 'EAST -- Bypass gate + nmap both servers',            check: 'eastZoneCleared && nmapTargets.has("srv-e1") && nmapTargets.has("srv-e2")' },
        { id: 'obj_2',  label: 'SOUTH -- Bypass gate + nmap both servers',           check: 'southZoneCleared && nmapTargets.has("srv-s1") && nmapTargets.has("srv-s2")' },
        { id: 'obj_3',  label: 'WEST -- Bypass gate + nmap both servers',            check: 'westZoneCleared && nmapTargets.has("srv-w1") && nmapTargets.has("srv-w2")' },
        { id: 'obj_4',  label: 'CORE -- nmap both core servers (DC + Vault)',        check: 'nmapTargets.has("core-1") && nmapTargets.has("core-2")' },
        { id: 'obj_5',  label: 'FULL MAP -- Discover 15+ nodes',                    check: 'nodesDiscovered.size >= 15' },
        { id: 'obj_6',  label: 'EXTRACTION -- Reach the extraction point',           check: 'nodesDiscovered.has("target")' },
        { id: 'obj_7',  label: 'STEALTH -- 4+ integrity remaining',                 check: 'integrity >= 4' }
    ],

    integrity: 6,

    completion: {
        title: 'PERIMETER BREACH',
        subtitle: 'Four zones breached. Ten servers cataloged. Core compromised.',
        storageKey: 'hexworth_operator_python18'
    }
};
