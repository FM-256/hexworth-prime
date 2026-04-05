/* ================================================================
   PYTHON-04 / DATA HEIST -- Mission Config
   ================================================================
   Tier 4 mission. 8x8 grid.
   Forces list building and data collection patterns.

   PUZZLE DESIGN:
   - Student must scan the grid, discover servers, nmap each one,
     and build a list of vulnerable targets from the nmap results
   - 6 servers total but only 3 have vulnerabilities — student must
     filter based on nmap return data
   - After identifying the 3 vulnerable servers, exploit each one
   - Then navigate to the extraction point
   - Forces: variables to store results, list concatenation, if checks
     on dict values, for loops to process collected data

   PYTHON SKILLS:
   - Building lists: targets = []  /  targets = targets + [result]
   - Dict access on nmap results: result['vuln']
   - Filtering: if result['vuln'] is not None
   - Processing collected data: for target in targets: agent.exploit(target)

   REFERENCE SOLUTION:
     def safe_advance(direction):
         result = agent.scan()
         for node in result:
             if node['direction'] == direction:
                 if 'HONEYPOT' in node['name'] or 'TRAP' in node['name']:
                     agent.sweep(direction)
         agent.move(direction)

     # Phase 1: Sweep and scan
     vuln_targets = []
     for i in range(7):
         safe_advance('east')
         result = agent.scan()
         for node in result:
             nmap_result = agent.nmap(node['name'])
             if nmap_result and nmap_result['vuln']:
                 vuln_targets = vuln_targets + [node['name']]
                 print("Vulnerable: " + node['name'])

     # Phase 2: Exploit vulnerable targets
     for target in vuln_targets:
         agent.exploit(target)

   GRID (8x8) — servers scattered, 3 with vulns, 3 without:
     [start]  [empty]  [empty]   [server-1] [empty]    [empty]   [empty]   [wall]
     [empty]  [empty]  [empty]   [empty]    [empty]    [server-2][empty]   [empty]
     [wall]   [empty]  [honeypot][empty]    [empty]    [empty]   [empty]   [wall]
     [empty]  [server-3][empty]  [empty]    [server-4] [empty]   [empty]   [empty]
     [empty]  [empty]  [empty]   [empty]    [empty]    [empty]   [server-5][wall]
     [wall]   [empty]  [empty]   [ids]      [empty]    [empty]   [empty]   [empty]
     [empty]  [empty]  [empty]   [empty]    [empty]    [server-6][empty]   [empty]
     [wall]   [wall]   [empty]   [empty]    [empty]    [wall]    [empty]   [target]
   ================================================================ */

var PYTHON_04_CONFIG = {
    id: 'python-04',
    title: 'PYTHON-04 / DATA HEIST',
    subtitle: 'Scan. Collect. Filter. Exploit. Extract.',
    category: 'python-ops',
    difficulty: 4,
    inputMode: 'python',
    agent: { tier: 3 },

    grid: {
        rows: 8, cols: 8,
        cells: [
            ['gateway',  'empty',    'empty',    'server-1', 'empty',    'empty',    'empty',    'wall'],
            ['empty',    'empty',    'empty',    'empty',    'empty',    'server-2', 'empty',    'empty'],
            ['wall',     'empty',    'honeypot', 'empty',    'empty',    'empty',    'empty',    'wall'],
            ['empty',    'server-3', 'empty',    'empty',    'server-4', 'empty',    'empty',    'empty'],
            ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-5', 'wall'],
            ['wall',     'empty',    'empty',    'ids-trap', 'empty',    'empty',    'empty',    'empty'],
            ['empty',    'empty',    'empty',    'empty',    'empty',    'server-6', 'empty',    'empty'],
            ['wall',     'wall',     'empty',    'empty',    'empty',    'wall',     'empty',    'target']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway':  { label: 'GATEWAY',     abbr: 'GTW', ip: '10.60.0.1',   desc: 'Entry point',                                 ports: ['22/SSH','443/HTTPS'],                     os: 'Cisco IOS 15.4' },

        /* 3 servers WITH vulnerabilities (exploitable) */
        'server-1': { label: 'SRV-FINANCE',  abbr: 'FIN', ip: '10.60.0.11', desc: 'Finance department server',                    ports: ['22/SSH','445/SMB','3389/RDP'],            os: 'Windows Server 2022', vuln: 'CVE-2024-8801', vulnDesc: 'SMB null session allows unauthenticated access' },
        'server-4': { label: 'SRV-HR',       abbr: 'HRM', ip: '10.60.0.14', desc: 'Human resources server — PII data',            ports: ['22/SSH','8080/HTTP','5432/PostgreSQL'],   os: 'Ubuntu 24.04 LTS',   vuln: 'CVE-2024-8802', vulnDesc: 'Unpatched PostgreSQL RCE via pg_execute_server_program' },
        'server-6': { label: 'SRV-EXEC',     abbr: 'EXC', ip: '10.60.0.16', desc: 'Executive team server — strategic docs',       ports: ['22/SSH','443/HTTPS','9090/ADMIN'],        os: 'RHEL 9.3',           vuln: 'CVE-2024-8803', vulnDesc: 'Admin console default credentials' },

        /* 3 servers WITHOUT vulnerabilities (not exploitable — filtering test) */
        'server-2': { label: 'SRV-MARKETING',abbr: 'MKT', ip: '10.60.0.12', desc: 'Marketing server — public content only',       ports: ['22/SSH','80/HTTP','443/HTTPS'],           os: 'Ubuntu 24.04 LTS' },
        'server-3': { label: 'SRV-PRINT',    abbr: 'PRT', ip: '10.60.0.13', desc: 'Print server — no sensitive data',             ports: ['515/LPR','631/IPP','9100/RAW'],           os: 'HP JetDirect' },
        'server-5': { label: 'SRV-BACKUP',   abbr: 'BKP', ip: '10.60.0.15', desc: 'Backup server — encrypted archives',           ports: ['22/SSH','873/RSYNC'],                     os: 'Debian 12 Bookworm' },

        /* Target */
        'target':   { label: 'EXTRACTION',   abbr: 'EXT', ip: '10.60.0.99', desc: 'Extraction point — data staging server',        ports: ['22/SSH','8443/HTTPS'],                    os: 'RHEL 9.3' },

        /* Traps */
        'honeypot': { label: 'HONEYPOT',     abbr: 'HNY', ip: '10.60.0.200',desc: 'Decoy server',                                 ports: ['22/SSH-FAKE','80/HTTP-TRAP'],             os: 'Honeyd [TRAP]' },
        'ids-trap': { label: 'IDS-SENSOR',   abbr: 'IDS', ip: '10.60.0.201',desc: 'Intrusion detection sensor',                    ports: ['514/SYSLOG'],                             os: 'Snort 3.1 [TRAP]' }
    },

    traps: ['honeypot', 'ids-trap'],

    /* Exploit gates on the 3 vulnerable servers */
    gates: {
        'server-1': { requires: 'exploit', flag: 'financeExploited', vuln: 'CVE-2024-8801', vulnDesc: 'SMB null session' },
        'server-4': { requires: 'exploit', flag: 'hrExploited',      vuln: 'CVE-2024-8802', vulnDesc: 'PostgreSQL RCE' },
        'server-6': { requires: 'exploit', flag: 'execExploited',    vuln: 'CVE-2024-8803', vulnDesc: 'Default credentials' }
    },

    objectives: [
        { id: 'obj_0', label: 'SCAN -- Discover 8+ network nodes',                   check: 'nodesDiscovered.size >= 8' },
        { id: 'obj_1', label: 'INTEL -- nmap all 6 servers',                        check: 'nmapTargets.has("server-1") && nmapTargets.has("server-2") && nmapTargets.has("server-3") && nmapTargets.has("server-4") && nmapTargets.has("server-5") && nmapTargets.has("server-6")' },
        { id: 'obj_2', label: 'EXPLOIT FINANCE -- Breach the finance server',       check: 'financeExploited' },
        { id: 'obj_3', label: 'EXPLOIT HR -- Breach the HR server',                 check: 'hrExploited' },
        { id: 'obj_4', label: 'EXPLOIT EXEC -- Breach the executive server',        check: 'execExploited' },
        { id: 'obj_5', label: 'EXTRACT -- Reach the extraction point',              check: 'nodesDiscovered.has("target")' }
    ],

    integrity: 3,

    completion: {
        title: 'DATA HEIST',
        subtitle: 'Three targets breached. Data extracted. Ghost protocol.',
        storageKey: 'hexworth_operator_python04'
    }
};
