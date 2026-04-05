/* ================================================================
   PYTHON-15 / STEALTH RUN -- Mission Config
   ================================================================
   Tier 5 mission. 10x10 grid.
   Forces careful route planning: MORE traps than integrity pips.
   Student cannot brute-force — must scan every move or die.

   PUZZLE DESIGN:
   - 10x10 grid with 7 traps scattered across the grid
   - Only 4 integrity pips — hitting 4 traps = compromised
   - Student MUST scan before every move and sweep detected traps
   - The safe_advance() function from Level 6 becomes mandatory
   - Target is in the far corner — long journey through trap field
   - 3 servers to nmap along the way (bonus objectives)
   - 1 nmap gate blocking the final corridor

   KEY LESSON: Defensive programming. In cybersecurity, you don't
   get unlimited retries. In Python, error prevention beats error handling.

   GRID (10x10) — trap-heavy field
   ================================================================ */

var PYTHON_15_CONFIG = {
    id: 'python-15',
    title: 'PYTHON-15 / STEALTH RUN',
    subtitle: 'Seven traps. Four lives. Every step could be your last.',
    category: 'python-ops',
    difficulty: 4,
    inputMode: 'python',
    agent: { tier: 3 },

    grid: {
        rows: 10, cols: 10,
        cells: [
            ['gateway',  'empty',   'empty',    'trap-1',   'empty',    'empty',   'empty',    'trap-2',  'empty',   'wall'],
            ['empty',    'empty',   'empty',    'empty',    'empty',    'empty',   'srv-1',    'empty',   'empty',   'empty'],
            ['empty',    'trap-3',  'empty',    'empty',    'router',   'empty',   'empty',    'empty',   'empty',   'wall'],
            ['wall',     'empty',   'empty',    'empty',    'empty',    'trap-4',  'empty',    'empty',   'empty',   'empty'],
            ['empty',    'empty',   'empty',    'empty',    'wall',     'empty',   'empty',    'empty',   'trap-5',  'wall'],
            ['empty',    'empty',   'srv-2',    'empty',    'empty',    'empty',   'empty',    'empty',   'empty',   'empty'],
            ['wall',     'trap-6',  'empty',    'empty',    'empty',    'empty',   'switch',   'empty',   'empty',   'wall'],
            ['empty',    'empty',   'empty',    'empty',    'srv-3',    'empty',   'empty',    'trap-7',  'empty',   'empty'],
            ['empty',    'empty',   'empty',    'empty',    'empty',    'empty',   'firewall', 'empty',   'empty',   'empty'],
            ['wall',     'wall',    'empty',    'empty',    'empty',    'wall',    'empty',    'empty',   'empty',   'target']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway':   { label: 'GATEWAY',     abbr: 'GTW', ip: '10.150.0.1',   desc: 'Entry point — the minefield begins here',     ports: ['22/SSH','443/HTTPS'],                     os: 'Cisco IOS 15.4' },
        'router':    { label: 'ROUTER',      abbr: 'RTR', ip: '10.150.0.2',   desc: 'Core router — mid-grid landmark',             ports: ['22/SSH','179/BGP'],                       os: 'Juniper JunOS 21.4' },
        'switch':    { label: 'SWITCH',      abbr: 'SWT', ip: '10.150.0.5',   desc: 'Distribution switch — south sector',          ports: ['22/SSH','161/SNMP'],                      os: 'Cisco Catalyst 9300' },

        'srv-1':     { label: 'SRV-COMMS',   abbr: 'SC1', ip: '10.150.1.11',  desc: 'Communications server — northeast',           ports: ['22/SSH','5060/SIP','443/HTTPS'],          os: 'FreePBX 16' },
        'srv-2':     { label: 'SRV-DATA',    abbr: 'SD2', ip: '10.150.1.12',  desc: 'Data warehouse — west sector',                ports: ['22/SSH','9200/ELASTIC','5601/KIBANA'],    os: 'CentOS Stream 9' },
        'srv-3':     { label: 'SRV-VAULT',   abbr: 'SV3', ip: '10.150.1.13',  desc: 'Secrets vault — south center',                ports: ['22/SSH','8200/VAULT','443/HTTPS'],        os: 'HashiCorp Vault 1.15' },

        'firewall':  { label: 'FIREWALL',    abbr: 'FWL', ip: '10.150.0.254', desc: 'Final corridor gate',                          ports: ['22/SSH','443/MGMT'],                      os: 'pfSense 2.7.0', vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL' },
        'target':    { label: 'EXTRACTION',  abbr: 'EXT', ip: '10.150.0.99',  desc: 'Extraction point — mission complete',           ports: ['22/SSH','8443/HTTPS'],                    os: 'RHEL 9.3' },

        /* 7 traps — more than integrity allows */
        'trap-1':    { label: 'TRAP-01',     abbr: 'T01', ip: '10.150.0.201', desc: 'IDS sensor — north row',          ports: ['514/SYSLOG'],      os: 'Snort [TRAP]' },
        'trap-2':    { label: 'TRAP-02',     abbr: 'T02', ip: '10.150.0.202', desc: 'Honeypot — northeast',            ports: ['22/SSH-FAKE'],     os: 'Honeyd [TRAP]' },
        'trap-3':    { label: 'TRAP-03',     abbr: 'T03', ip: '10.150.0.203', desc: 'IDS — west corridor',             ports: ['514/SYSLOG'],      os: 'Suricata [TRAP]' },
        'trap-4':    { label: 'TRAP-04',     abbr: 'T04', ip: '10.150.0.204', desc: 'Honeypot — center east',          ports: ['80/HTTP-TRAP'],    os: 'Honeyd [TRAP]' },
        'trap-5':    { label: 'TRAP-05',     abbr: 'T05', ip: '10.150.0.205', desc: 'IDS — east corridor',             ports: ['514/SYSLOG'],      os: 'Snort [TRAP]' },
        'trap-6':    { label: 'TRAP-06',     abbr: 'T06', ip: '10.150.0.206', desc: 'Honeypot — southwest approach',   ports: ['445/SMB-FAKE'],    os: 'Honeyd [TRAP]' },
        'trap-7':    { label: 'TRAP-07',     abbr: 'T07', ip: '10.150.0.207', desc: 'IDS — extraction corridor',       ports: ['514/SYSLOG'],      os: 'Suricata [TRAP]' }
    },

    traps: ['trap-1', 'trap-2', 'trap-3', 'trap-4', 'trap-5', 'trap-6', 'trap-7'],

    gates: {
        'firewall': { requires: 'nmap', flag: 'firewallBypassed', vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL' }
    },

    objectives: [
        { id: 'obj_0', label: 'RECON -- Discover 8+ nodes',                         check: 'nodesDiscovered.size >= 8' },
        { id: 'obj_1', label: 'INTEL -- nmap all 3 servers',                        check: 'nmapTargets.has("srv-1") && nmapTargets.has("srv-2") && nmapTargets.has("srv-3")' },
        { id: 'obj_2', label: 'ACCESS -- Bypass the final corridor firewall',       check: 'firewallBypassed' },
        { id: 'obj_3', label: 'EXTRACTION -- Reach the extraction point',           check: 'nodesDiscovered.has("target")' },
        { id: 'obj_4', label: 'STEALTH -- Complete with 3+ integrity (max caution)',check: 'integrity >= 3' }
    ],

    /* Only 4 pips for 7 traps — student MUST avoid at least 4 of 7 */
    integrity: 4,

    completion: {
        title: 'STEALTH RUN',
        subtitle: 'Minefield navigated. Zero margin. Maximum stealth.',
        storageKey: 'hexworth_operator_python15'
    }
};
