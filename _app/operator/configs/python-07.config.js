/* ================================================================
   PYTHON-07 / GHOST PROTOCOL -- Mission Config
   ================================================================
   Tier 5 FINAL mission. 10x10 grid — 100 cells.
   The ultimate test: every Python skill, every agent tool.

   PUZZLE DESIGN:
   - 10x10 grid — the largest in the Operator system
   - 4 operational zones separated by 4 different gate types
   - 8 servers across 4 departments (finance, engineering, ops, executive)
   - 6 traps hidden throughout — 2 per main corridor
   - Student must write a complete, structured Python program:
     * Reusable safe_advance() function
     * Grid sweep via nested for loops
     * Data collection into lists
     * If/elif chains for gate identification
     * Multi-phase execution (recon → catalog → breach → extract)
   - Stealth objective: complete with 4+ of 6 integrity remaining
   - Efficiency objective: use ≤60 agent commands
   - The puzzle rewards planning — brute force exhausts integrity

   This mission is the capstone. It can only be completed by students
   who have internalized functions, loops, conditionals, and data
   structures from Levels 3-9.

   GRID (10x10):
   The grid represents a corporate campus with 4 departments.
   Each department is gated and contains 2 servers to catalog.
   ================================================================ */

var PYTHON_07_CONFIG = {
    id: 'python-07',
    title: 'PYTHON-07 / GHOST PROTOCOL',
    subtitle: 'The final operation. 10x10 grid. Zero margin for error.',
    category: 'python-ops',
    difficulty: 4,
    inputMode: 'python',
    agent: { tier: 3 },

    grid: {
        rows: 10, cols: 10,
        cells: [
            ['gateway',  'empty',    'empty',    'router-a',  'empty',      'wall',     'empty',     'empty',     'empty',     'wall'],
            ['empty',    'honeypot', 'empty',    'empty',     'srv-fin-1',  'empty',    'empty',     'srv-eng-1', 'empty',     'empty'],
            ['empty',    'empty',    'switch-a', 'empty',     'empty',      'empty',    'ids-1',     'empty',     'empty',     'wall'],
            ['wall',     'empty',    'empty',    'fw-finance','empty',      'srv-fin-2','empty',     'fw-eng',    'empty',     'empty'],
            ['empty',    'empty',    'empty',    'empty',     'wall',       'empty',    'empty',     'empty',     'srv-eng-2', 'wall'],
            ['empty',    'honeypot2','empty',    'router-b',  'empty',      'empty',    'empty',     'empty',     'empty',     'empty'],
            ['wall',     'empty',    'empty',    'fw-ops',    'empty',      'srv-ops-1','empty',     'ids-2',     'empty',     'wall'],
            ['empty',    'empty',    'srv-ops-2','empty',     'empty',      'empty',    'fw-exec',   'empty',     'empty',     'empty'],
            ['empty',    'honeypot3','empty',    'empty',     'empty',      'wall',     'empty',     'srv-exec-1','empty',     'empty'],
            ['wall',     'wall',     'empty',    'empty',     'empty',      'wall',     'empty',     'empty',     'srv-exec-2','target']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        /* Infrastructure */
        'gateway':     { label: 'GATEWAY',       abbr: 'GTW', ip: '10.90.0.1',   desc: 'Campus perimeter entry',                ports: ['22/SSH','443/HTTPS'],                     os: 'Cisco IOS 15.4' },
        'router-a':    { label: 'ROUTER-NORTH',  abbr: 'RNA', ip: '10.90.0.2',   desc: 'North wing core router',                ports: ['22/SSH','179/BGP','161/SNMP'],            os: 'Juniper JunOS 21.4' },
        'router-b':    { label: 'ROUTER-SOUTH',  abbr: 'RSB', ip: '10.90.0.3',   desc: 'South wing core router',                ports: ['22/SSH','179/BGP','161/SNMP'],            os: 'Cisco IOS XE 17.9' },
        'switch-a':    { label: 'SWITCH-DIST',   abbr: 'SWA', ip: '10.90.0.5',   desc: 'Distribution layer switch',             ports: ['22/SSH','161/SNMP'],                      os: 'Cisco Catalyst 9300' },

        /* Finance Department (2 servers) */
        'srv-fin-1':   { label: 'FIN-PAYROLL',   abbr: 'FP1', ip: '10.90.1.11',  desc: 'Payroll processing server',             ports: ['22/SSH','443/HTTPS','8443/MGMT'],         os: 'Windows Server 2022' },
        'srv-fin-2':   { label: 'FIN-LEDGER',    abbr: 'FL2', ip: '10.90.1.12',  desc: 'General ledger database',               ports: ['22/SSH','1433/MSSQL','5432/PostgreSQL'],  os: 'RHEL 9.3', vuln: 'CVE-2024-9201', vulnDesc: 'Unpatched MSSQL RCE via xp_cmdshell' },

        /* Engineering Department (2 servers) */
        'srv-eng-1':   { label: 'ENG-GITLAB',    abbr: 'GL1', ip: '10.90.2.11',  desc: 'GitLab source code repository',         ports: ['22/SSH','80/HTTP','443/HTTPS'],            os: 'Ubuntu 24.04 LTS' },
        'srv-eng-2':   { label: 'ENG-CICD',      abbr: 'CI2', ip: '10.90.2.12',  desc: 'CI/CD pipeline server (Jenkins)',        ports: ['22/SSH','8080/JENKINS','50000/AGENT'],     os: 'Debian 12 Bookworm', vuln: 'CVE-2024-9202', vulnDesc: 'Jenkins Script Console unauthenticated access' },

        /* Operations Department (2 servers) */
        'srv-ops-1':   { label: 'OPS-MONITORING', abbr: 'OM1', ip: '10.90.3.11', desc: 'Grafana + Prometheus stack',              ports: ['22/SSH','3000/GRAFANA','9090/PROMETHEUS'], os: 'CentOS Stream 9' },
        'srv-ops-2':   { label: 'OPS-ANSIBLE',    abbr: 'AN2', ip: '10.90.3.12', desc: 'Ansible automation controller',           ports: ['22/SSH','443/HTTPS','8443/AWX'],           os: 'RHEL 9.3', vuln: 'CVE-2024-9203', vulnDesc: 'AWX API key exposed in default config' },

        /* Executive Department (2 servers) */
        'srv-exec-1':  { label: 'EXEC-COMMS',     abbr: 'EC1', ip: '10.90.4.11', desc: 'Executive communications server',         ports: ['22/SSH','443/HTTPS','5061/SRTP'],          os: 'FreePBX 16' },
        'srv-exec-2':  { label: 'EXEC-VAULT',     abbr: 'EV2', ip: '10.90.4.12', desc: 'Executive secrets vault',                 ports: ['22/SSH','8200/VAULT','443/HTTPS'],          os: 'HashiCorp Vault 1.15', vuln: 'CVE-2024-9204', vulnDesc: 'Root token left in default config' },

        /* 4 Department Firewalls (gates) */
        'fw-finance':  { label: 'FW-FINANCE',  abbr: 'FWF', ip: '10.90.0.251', desc: 'Finance department firewall',            ports: ['22/SSH','443/MGMT'],                       os: 'pfSense 2.7.0', vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL allows unauthenticated management access' },
        'fw-eng':      { label: 'FW-ENGINEERING',abbr: 'FWE', ip: '10.90.0.252', desc: 'Engineering department firewall',       ports: ['22/SSH','443/MGMT'],                       os: 'Palo Alto PAN-OS 11', vuln: 'CVE-2024-7744', vulnDesc: 'Management plane RCE via crafted request' },
        'fw-ops':      { label: 'FW-OPERATIONS',abbr: 'FWO', ip: '10.90.0.253', desc: 'Operations department firewall',         ports: ['22/SSH','443/MGMT'],                       os: 'Fortinet FortiGate 7.4', vuln: 'CVE-2024-6221', vulnDesc: 'TCP ISN randomization bypass allows spoofing' },
        'fw-exec':     { label: 'FW-EXECUTIVE', abbr: 'FWX', ip: '10.90.0.254', desc: 'Executive department firewall',          ports: ['22/SSH','443/MGMT'],                       os: 'Check Point R81.20', vuln: 'CVE-2024-8855', vulnDesc: 'SmartConsole credential caching allows replay attack' },

        /* Extraction */
        'target':      { label: 'EXTRACTION',   abbr: 'EXT', ip: '10.90.0.99',  desc: 'Corporate exit point — mission complete', ports: ['22/SSH','8443/HTTPS'],                     os: 'RHEL 9.3' },

        /* 6 Traps (2 per main corridor) */
        'honeypot':    { label: 'TRAP-NORTH-1',  abbr: 'TN1', ip: '10.90.0.200', desc: 'Decoy — north wing entrance',          ports: ['22/SSH-FAKE'],                             os: 'Honeyd [TRAP]' },
        'honeypot2':   { label: 'TRAP-SOUTH-1',  abbr: 'TS1', ip: '10.90.0.201', desc: 'Decoy — south wing crossover',         ports: ['80/HTTP-TRAP'],                            os: 'Honeyd [TRAP]' },
        'honeypot3':   { label: 'TRAP-SOUTH-2',  abbr: 'TS2', ip: '10.90.0.202', desc: 'Decoy — executive corridor',           ports: ['445/SMB-FAKE'],                            os: 'Honeyd [TRAP]' },
        'ids-1':       { label: 'IDS-NORTH',     abbr: 'IN1', ip: '10.90.0.203', desc: 'IDS — engineering approach',            ports: ['514/SYSLOG'],                              os: 'Snort [TRAP]' },
        'ids-2':       { label: 'IDS-SOUTH',     abbr: 'IS2', ip: '10.90.0.204', desc: 'IDS — operations approach',             ports: ['514/SYSLOG'],                              os: 'Suricata [TRAP]' }
    },

    traps: ['honeypot', 'honeypot2', 'honeypot3', 'ids-1', 'ids-2'],

    gates: {
        'fw-finance': { requires: 'nmap',    flag: 'financeBypassed',   vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL' },
        'fw-eng':     { requires: 'exploit', flag: 'engineeringBypassed',vuln: 'CVE-2024-7744', vulnDesc: 'Management plane RCE' },
        'fw-ops':     { requires: 'spoof',   flag: 'opsBypassed',       vuln: 'CVE-2024-6221', vulnDesc: 'TCP ISN bypass' },
        'fw-exec':    { requires: 'decrypt', flag: 'execBypassed',      vuln: 'CVE-2024-8855', vulnDesc: 'Credential replay' }
    },

    objectives: [
        { id: 'obj_0', label: 'RECON -- Discover 12+ nodes across campus',             check: 'nodesDiscovered.size >= 12' },
        { id: 'obj_1', label: 'FINANCE -- Bypass finance firewall + nmap both servers', check: 'financeBypassed && nmapTargets.has("srv-fin-1") && nmapTargets.has("srv-fin-2")' },
        { id: 'obj_2', label: 'ENGINEERING -- Bypass eng firewall + nmap both servers', check: 'engineeringBypassed && nmapTargets.has("srv-eng-1") && nmapTargets.has("srv-eng-2")' },
        { id: 'obj_3', label: 'OPERATIONS -- Bypass ops firewall + nmap both servers',  check: 'opsBypassed && nmapTargets.has("srv-ops-1") && nmapTargets.has("srv-ops-2")' },
        { id: 'obj_4', label: 'EXECUTIVE -- Bypass exec firewall + nmap both servers',  check: 'execBypassed && nmapTargets.has("srv-exec-1") && nmapTargets.has("srv-exec-2")' },
        { id: 'obj_5', label: 'FULL CATALOG -- nmap all 8 department servers',          check: 'nmapTargets.has("srv-fin-1") && nmapTargets.has("srv-fin-2") && nmapTargets.has("srv-eng-1") && nmapTargets.has("srv-eng-2") && nmapTargets.has("srv-ops-1") && nmapTargets.has("srv-ops-2") && nmapTargets.has("srv-exec-1") && nmapTargets.has("srv-exec-2")' },
        { id: 'obj_6', label: 'EXTRACTION -- Reach the corporate exit',                check: 'nodesDiscovered.has("target")' },
        { id: 'obj_7', label: 'STEALTH -- Complete with 4+ integrity remaining',       check: 'integrity >= 4' }
    ],

    integrity: 6,  /* 6 pips for 5 traps + 1 margin — stealth requires avoiding most */

    completion: {
        title: 'GHOST PROTOCOL',
        subtitle: 'Four departments breached. Eight servers cataloged. Ghost in the machine.',
        storageKey: 'hexworth_operator_python07'
    }
};
