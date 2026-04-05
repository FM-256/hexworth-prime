/* ================================================================
   PYTHON-09 / CHAIN REACTION -- Mission Config
   ================================================================
   Tier 5 mission. 9x9 grid.
   Forces chained dependencies: exploit server A to get intel
   needed to nmap server B, which reveals the key to spoof server C.

   PUZZLE DESIGN:
   - 3 servers in a dependency chain: A → B → C
   - Server A is behind an nmap gate (standard)
   - Server B is behind an exploit gate that requires A to be nmapped first
   - Server C is behind a spoof gate that requires B to be exploited first
   - Target is behind server C's gate
   - Student must figure out the order: nmap A → exploit B → spoof C → target
   - Forces: sequential dependency tracking, variables to hold state,
     print() for debugging, systematic approach

   PYTHON SKILL: Sequential dependency resolution
     # Phase 1: Clear the first gate
     agent.nmap('server-a')
     # Phase 2: Use A's intel to breach B
     agent.exploit('server-b')
     # Phase 3: Use B's access to spoof C
     agent.spoof('server-c')
     # Phase 4: Navigate to target

   GRID (9x9):
     [start]  [empty]   [empty]    [empty]    [server-a] [empty]   [wall]    [empty]  [wall]
     [empty]  [trap-1]  [empty]    [empty]    [empty]    [empty]   [empty]   [empty]  [empty]
     [empty]  [empty]   [router]   [empty]    [gate-a]   [empty]   [empty]   [empty]  [wall]
     [wall]   [empty]   [empty]    [empty]    [empty]    [server-b][empty]   [empty]  [empty]
     [empty]  [empty]   [trap-2]   [empty]    [wall]     [empty]   [gate-b]  [empty]  [wall]
     [empty]  [switch]  [empty]    [empty]    [empty]    [empty]   [empty]   [empty]  [empty]
     [wall]   [empty]   [empty]    [trap-3]   [empty]    [server-c][empty]   [gate-c] [empty]
     [empty]  [empty]   [empty]    [empty]    [empty]    [empty]   [empty]   [empty]  [empty]
     [wall]   [wall]    [empty]    [empty]    [empty]    [wall]    [empty]   [empty]  [target]
   ================================================================ */

var PYTHON_09_CONFIG = {
    id: 'python-09',
    title: 'PYTHON-09 / CHAIN REACTION',
    subtitle: 'A depends on B depends on C. Find the right order.',
    category: 'python-ops',
    difficulty: 4,
    inputMode: 'python',
    agent: { tier: 3 },

    grid: {
        rows: 9, cols: 9,
        cells: [
            ['gateway',  'empty',   'empty',    'empty',    'server-a', 'empty',   'wall',     'empty',  'wall'],
            ['empty',    'trap-1',  'empty',    'empty',    'empty',    'empty',   'empty',    'empty',  'empty'],
            ['empty',    'empty',   'router',   'empty',    'gate-a',   'empty',   'empty',    'empty',  'wall'],
            ['wall',     'empty',   'empty',    'empty',    'empty',    'server-b','empty',    'empty',  'empty'],
            ['empty',    'empty',   'trap-2',   'empty',    'wall',     'empty',   'gate-b',   'empty',  'wall'],
            ['empty',    'switch',  'empty',    'empty',    'empty',    'empty',   'empty',    'empty',  'empty'],
            ['wall',     'empty',   'empty',    'trap-3',   'empty',    'server-c','empty',    'gate-c', 'empty'],
            ['empty',    'empty',   'empty',    'empty',    'empty',    'empty',   'empty',    'empty',  'empty'],
            ['wall',     'wall',    'empty',    'empty',    'empty',    'wall',    'empty',    'empty',  'target']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway':   { label: 'GATEWAY',      abbr: 'GTW', ip: '10.120.0.1',  desc: 'Entry point',                                ports: ['22/SSH','443/HTTPS'],                     os: 'Cisco IOS 15.4' },
        'router':    { label: 'ROUTER',       abbr: 'RTR', ip: '10.120.0.2',  desc: 'Core router',                                ports: ['22/SSH','179/BGP'],                       os: 'Juniper JunOS 21.4' },
        'switch':    { label: 'SWITCH',       abbr: 'SWT', ip: '10.120.0.5',  desc: 'Distribution switch',                        ports: ['22/SSH','161/SNMP'],                      os: 'Cisco Catalyst 9300' },

        /* Chain link 1: nmap to reveal vulnerability */
        'server-a':  { label: 'SRV-ALPHA',    abbr: 'SRA', ip: '10.120.1.11', desc: 'First link — contains credentials for Bravo', ports: ['22/SSH','445/SMB','3389/RDP'],            os: 'Windows Server 2022' },
        'gate-a':    { label: 'FW-ALPHA',     abbr: 'FWA', ip: '10.120.0.251',desc: 'Firewall guarding Alpha zone',                ports: ['22/SSH','443/MGMT'],                      os: 'pfSense 2.7.0', vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL allows bypass' },

        /* Chain link 2: exploit using Alpha's intel */
        'server-b':  { label: 'SRV-BRAVO',    abbr: 'SRB', ip: '10.120.2.11', desc: 'Second link — holds keys to Charlie',         ports: ['22/SSH','8080/HTTP','5432/PostgreSQL'],   os: 'Ubuntu 24.04 LTS', vuln: 'CVE-2024-5512', vulnDesc: 'PostgreSQL RCE via crafted query' },
        'gate-b':    { label: 'FW-BRAVO',     abbr: 'FWB', ip: '10.120.0.252',desc: 'Firewall guarding Bravo zone',                ports: ['22/SSH','443/MGMT'],                      os: 'Palo Alto PAN-OS', vuln: 'CVE-2024-7744', vulnDesc: 'Management plane RCE' },

        /* Chain link 3: spoof to reach target */
        'server-c':  { label: 'SRV-CHARLIE',  abbr: 'SRC', ip: '10.120.3.11', desc: 'Final link — guards the extraction corridor',  ports: ['22/SSH','443/HTTPS-C2','8080/BEACON'],   os: 'Cobalt Strike 4.9', vuln: 'CVE-2024-6221', vulnDesc: 'TCP ISN randomization bypass' },
        'gate-c':    { label: 'FW-CHARLIE',   abbr: 'FWC', ip: '10.120.0.253',desc: 'Final gate before extraction',                 ports: ['22/SSH','443/MGMT'],                      os: 'Fortinet FortiGate', vuln: 'CVE-2024-6221', vulnDesc: 'TCP ISN randomization bypass allows spoofing' },

        'target':    { label: 'EXTRACTION',    abbr: 'EXT', ip: '10.120.0.99', desc: 'Data extraction point — mission complete',     ports: ['22/SSH','8443/HTTPS'],                    os: 'RHEL 9.3' },

        /* 3 traps */
        'trap-1':    { label: 'TRAP-1',        abbr: 'T01', ip: '10.120.0.200',desc: 'IDS sensor — north corridor',                 ports: ['514/SYSLOG'],                             os: 'Snort [TRAP]' },
        'trap-2':    { label: 'TRAP-2',        abbr: 'T02', ip: '10.120.0.201',desc: 'Honeypot — mid corridor',                     ports: ['22/SSH-FAKE'],                            os: 'Honeyd [TRAP]' },
        'trap-3':    { label: 'TRAP-3',        abbr: 'T03', ip: '10.120.0.202',desc: 'Honeypot — south corridor',                   ports: ['80/HTTP-TRAP'],                           os: 'Honeyd [TRAP]' }
    },

    traps: ['trap-1', 'trap-2', 'trap-3'],

    /* Dependency chain: A(nmap) → B(exploit) → C(spoof) */
    gates: {
        'gate-a': { requires: 'nmap',    flag: 'alphaCleared',   vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL allows bypass' },
        'gate-b': { requires: 'exploit', flag: 'bravoCleared',   vuln: 'CVE-2024-7744', vulnDesc: 'Management plane RCE' },
        'gate-c': { requires: 'spoof',   flag: 'charlieCleared', vuln: 'CVE-2024-6221', vulnDesc: 'TCP ISN randomization bypass' }
    },

    objectives: [
        { id: 'obj_0', label: 'CHAIN 1 -- nmap Server Alpha and bypass its gate',        check: 'alphaCleared && nmapTargets.has("server-a")' },
        { id: 'obj_1', label: 'CHAIN 2 -- Exploit Server Bravo and bypass its gate',     check: 'bravoCleared' },
        { id: 'obj_2', label: 'CHAIN 3 -- Spoof Server Charlie and bypass final gate',   check: 'charlieCleared' },
        { id: 'obj_3', label: 'INTEL -- nmap all 3 chain servers',                       check: 'nmapTargets.has("server-a") && nmapTargets.has("server-b") && nmapTargets.has("server-c")' },
        { id: 'obj_4', label: 'EXTRACT -- Reach the extraction point',                   check: 'nodesDiscovered.has("target")' },
        { id: 'obj_5', label: 'STEALTH -- 2+ integrity remaining',                       check: 'integrity >= 2' }
    ],

    integrity: 4,

    completion: {
        title: 'CHAIN REACTION',
        subtitle: 'Dependency chain resolved. All links broken. Extraction complete.',
        storageKey: 'hexworth_operator_python09'
    }
};
