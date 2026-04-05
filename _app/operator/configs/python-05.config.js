/* ================================================================
   PYTHON-05 / FULL SPECTRUM -- Mission Config
   ================================================================
   Tier 4 mission. 9x9 grid — 81 cells.
   Combines ALL previously learned skills into one mission.

   PUZZLE DESIGN:
   - 9x9 grid with multiple zones separated by gates
   - Zone 1 (accessible): reconnaissance area with traps
   - Zone 2 (nmap gate): server farm — scan and catalog servers
   - Zone 3 (exploit gate): data center — exploit vulnerable targets
   - Zone 4 (spoof gate): extraction corridor to target
   - Student must: sweep safely (function), discover nodes (loop),
     catalog vulnerabilities (list building), bypass 3 gate types
     (if/elif based on nmap data), and reach the target

   This is the "boss level" of the Phase 1 difficulty curve.
   Every Python skill from levels 3-7 is needed here.

   PYTHON SKILLS COMBINED:
   - def safe_advance() — reusable function (from Level 6)
   - for loop sweep — systematic grid coverage (from Level 4)
   - if/elif chain — gate-type identification (from Level 5)
   - list building — vulnerable target collection (from Level 7)
   - scan() result inspection — trap detection (from Level 3)

   GRID (9x9):
     [start]  [empty]   [empty]   [wall]    [empty]   [empty]   [empty]   [empty]  [wall]
     [empty]  [trap-1]  [empty]   [empty]   [srv-1]   [empty]   [empty]   [empty]  [empty]
     [empty]  [empty]   [empty]   [empty]   [empty]   [trap-2]  [empty]   [srv-2]  [wall]
     [wall]   [empty]   [nmap-gw] [empty]   [empty]   [empty]   [empty]   [empty]  [empty]
     [empty]  [empty]   [empty]   [srv-3]   [empty]   [wall]    [exploit-gw][empty][empty]
     [empty]  [srv-4]   [empty]   [empty]   [empty]   [empty]   [empty]   [empty]  [wall]
     [wall]   [empty]   [empty]   [trap-3]  [empty]   [srv-5]   [empty]   [empty]  [empty]
     [empty]  [empty]   [empty]   [empty]   [empty]   [empty]   [spoof-gw][empty]  [empty]
     [wall]   [wall]    [empty]   [empty]   [empty]   [wall]    [empty]   [empty]  [target]
   ================================================================ */

var PYTHON_05_CONFIG = {
    id: 'python-05',
    title: 'PYTHON-05 / FULL SPECTRUM',
    subtitle: 'Every skill. Every tool. One mission.',
    category: 'python-ops',
    difficulty: 4,
    inputMode: 'python',
    agent: { tier: 3 },

    grid: {
        rows: 9, cols: 9,
        cells: [
            ['gateway',  'empty',    'empty',     'wall',       'empty',      'empty',   'empty',      'empty',  'wall'],
            ['empty',    'honeypot', 'empty',     'empty',      'server-1',   'empty',   'empty',      'empty',  'empty'],
            ['empty',    'empty',    'empty',     'empty',      'empty',      'ids-trap','empty',      'server-2','wall'],
            ['wall',     'empty',    'nmap-gate', 'empty',      'empty',      'empty',   'empty',      'empty',  'empty'],
            ['empty',    'empty',    'empty',     'server-3',   'empty',      'wall',    'exploit-gate','empty', 'empty'],
            ['empty',    'server-4', 'empty',     'empty',      'empty',      'empty',   'empty',      'empty',  'wall'],
            ['wall',     'empty',    'empty',     'honeypot2',  'empty',      'server-5','empty',      'empty',  'empty'],
            ['empty',    'empty',    'empty',     'empty',      'empty',      'empty',   'spoof-gate', 'empty',  'empty'],
            ['wall',     'wall',     'empty',     'empty',      'empty',      'wall',    'empty',      'empty',  'target']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway':      { label: 'GATEWAY',       abbr: 'GTW', ip: '10.70.0.1',   desc: 'Entry point',                              ports: ['22/SSH','443/HTTPS'],                       os: 'Cisco IOS 15.4' },

        /* 5 target servers */
        'server-1':     { label: 'SRV-COMMS',     abbr: 'COM', ip: '10.70.0.11',  desc: 'Communications relay',                     ports: ['22/SSH','5060/SIP','443/HTTPS'],             os: 'FreePBX 16' },
        'server-2':     { label: 'SRV-INTEL',     abbr: 'INT', ip: '10.70.0.12',  desc: 'Intelligence archive',                     ports: ['22/SSH','8443/HTTPS','9200/ELASTIC'],        os: 'Ubuntu 24.04 LTS' },
        'server-3':     { label: 'SRV-CRYPTO',    abbr: 'CRY', ip: '10.70.0.13',  desc: 'Cryptographic key server',                 ports: ['22/SSH','8200/VAULT','443/HTTPS'],           os: 'HashiCorp Vault 1.15' },
        'server-4':     { label: 'SRV-SIEM',      abbr: 'SIM', ip: '10.70.0.14',  desc: 'SIEM correlation engine',                  ports: ['22/SSH','9200/ELASTIC','5601/KIBANA'],       os: 'CentOS Stream 9' },
        'server-5':     { label: 'SRV-C2',        abbr: 'CC2', ip: '10.70.0.15',  desc: 'Command and control relay',                ports: ['443/HTTPS-C2','8080/BEACON','53/DNS-TUN'],   os: 'Cobalt Strike 4.9' },

        /* 3 gates — each a different type */
        'nmap-gate':    { label: 'FIREWALL-A',    abbr: 'FWA', ip: '10.70.0.251', desc: 'Zone 1→2 firewall — requires nmap',         ports: ['22/SSH','443/MGMT'],                        os: 'pfSense 2.7.0', vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL allows bypass' },
        'exploit-gate': { label: 'EDR-SYSTEM',    abbr: 'EDR', ip: '10.70.0.252', desc: 'Zone 2→3 EDR — requires exploit',           ports: ['443/HTTPS','8443/MGMT'],                    os: 'CrowdStrike Falcon', vuln: 'CVE-2024-7733', vulnDesc: 'Kernel driver bypass via signed driver vuln' },
        'spoof-gate':   { label: 'HONEYPOT-NET',  abbr: 'HPN', ip: '10.70.0.253', desc: 'Zone 3→4 honeypot network — requires spoof',ports: ['22/SSH-FAKE','445/SMB-FAKE'],               os: 'Honeyd 1.6', vuln: 'CVE-2024-6221', vulnDesc: 'TCP ISN randomization bypass' },

        /* Target */
        'target':       { label: 'EXTRACTION',    abbr: 'EXT', ip: '10.70.0.99',  desc: 'Extraction point — mission complete here',   ports: ['22/SSH','8443/HTTPS'],                      os: 'RHEL 9.3' },

        /* 3 traps */
        'honeypot':     { label: 'TRAP-ALPHA',    abbr: 'TA',  ip: '10.70.0.200', desc: 'Decoy — north corridor',                    ports: ['22/SSH-FAKE'],                              os: 'Honeyd [TRAP]' },
        'ids-trap':     { label: 'TRAP-BRAVO',    abbr: 'TB',  ip: '10.70.0.201', desc: 'IDS sensor — east passage',                  ports: ['514/SYSLOG'],                               os: 'Snort [TRAP]' },
        'honeypot2':    { label: 'TRAP-CHARLIE',  abbr: 'TC',  ip: '10.70.0.202', desc: 'Decoy — south corridor',                     ports: ['80/HTTP-TRAP'],                             os: 'Honeyd [TRAP]' }
    },

    traps: ['honeypot', 'ids-trap', 'honeypot2'],

    gates: {
        'nmap-gate':    { requires: 'nmap',    flag: 'zone2Unlocked',  vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL allows bypass' },
        'exploit-gate': { requires: 'exploit', flag: 'zone3Unlocked',  vuln: 'CVE-2024-7733', vulnDesc: 'Kernel driver bypass' },
        'spoof-gate':   { requires: 'spoof',   flag: 'zone4Unlocked',  vuln: 'CVE-2024-6221', vulnDesc: 'TCP ISN randomization bypass' }
    },

    objectives: [
        { id: 'obj_0', label: 'RECON -- Discover 8+ network nodes',                check: 'nodesDiscovered.size >= 8' },
        { id: 'obj_1', label: 'ZONE 2 -- Bypass firewall (nmap)',                  check: 'zone2Unlocked' },
        { id: 'obj_2', label: 'ZONE 3 -- Bypass EDR (exploit)',                    check: 'zone3Unlocked' },
        { id: 'obj_3', label: 'ZONE 4 -- Bypass honeypot net (spoof)',             check: 'zone4Unlocked' },
        { id: 'obj_4', label: 'INTEL -- nmap all 5 servers',                       check: 'nmapTargets.has("server-1") && nmapTargets.has("server-2") && nmapTargets.has("server-3") && nmapTargets.has("server-4") && nmapTargets.has("server-5")' },
        { id: 'obj_5', label: 'EXTRACT -- Reach the extraction point',             check: 'nodesDiscovered.has("target")' },
        { id: 'obj_6', label: 'STEALTH -- 2+ integrity remaining',                 check: 'integrity >= 2' }
    ],

    integrity: 4,

    completion: {
        title: 'FULL SPECTRUM',
        subtitle: 'All zones breached. All servers cataloged. Extraction complete.',
        storageKey: 'hexworth_operator_python05'
    }
};
