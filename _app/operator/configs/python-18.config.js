/* ================================================================
   PYTHON-18 / PIT STOP -- Mission Config
   ================================================================
   FIRST OBSTACLE LEVEL. 8x8 grid.
   Introduces HOLES — a new obstacle type that requires agent.jump()
   to cross. This is the student's first encounter with an obstacle
   that isn't a trap (can't be swept — must be jumped).

   PUZZLE DESIGN:
   - 8x8 grid with 3 holes blocking key paths
   - Holes cannot be swept like traps — agent.sweep() does nothing
   - Student must detect holes via scan() and use agent.jump(dir)
   - The if statement now needs TWO branches: trap vs hole
   - 2 traps remain to ensure the student handles BOTH types
   - 1 gate (nmap) to maintain familiarity with existing mechanics
   - Bonus objective: reach a hidden server behind a 4th hole that
     requires the 'bridge' permanent tool (unavailable yet — Metroidvania)

   PYTHON SKILL: Multi-branch obstacle handling
     result = agent.scan()
     for node in result:
         name = node['name']
         d = node['direction']
         if 'HOLE' in name:
             agent.jump(d)      # NEW — jump over the hole
         elif 'TRAP' in name or 'HONEYPOT' in name:
             agent.sweep(d)     # existing — disarm the trap
     agent.move(d)

   WHAT'S NEW FOR THE STUDENT:
   - First time seeing an obstacle that isn't a trap
   - First time needing TWO different responses to scan data
   - First time agent.jump() appears in their code
   - The if/elif is no longer optional — it's required to survive

   GRID (8x8):
     [start]  [empty]  [empty]   [hole-1]  [empty]   [empty]   [empty]  [wall]
     [empty]  [empty]  [router]  [empty]   [empty]   [empty]   [empty]  [empty]
     [empty]  [trap-1] [empty]   [empty]   [hole-2]  [empty]   [srv-1]  [wall]
     [wall]   [empty]  [empty]   [empty]   [empty]   [empty]   [empty]  [empty]
     [empty]  [empty]  [empty]   [switch]  [empty]   [hole-3]  [empty]  [wall]
     [empty]  [empty]  [empty]   [empty]   [empty]   [empty]   [fw]     [empty]
     [wall]   [empty]  [trap-2]  [empty]   [srv-2]   [empty]   [empty]  [empty]
     [wall]   [wall]   [empty]   [empty]   [empty]   [wall]    [empty]  [target]

   BONUS: hole-4 blocks path to hidden-srv (behind wall gap in row 3).
   Requires 'bridge' tool — impossible on first play. Metroidvania hook.
   ================================================================ */

var PYTHON_18_CONFIG = {
    id: 'python-18',
    title: 'PYTHON-18 / PIT STOP',
    subtitle: 'New threat: holes. Sweep won\'t work. Learn to jump.',
    category: 'python-ops',
    difficulty: 3,
    inputMode: 'python',
    agent: { tier: 3 },

    grid: {
        rows: 8, cols: 8,
        cells: [
            ['gateway',  'empty',   'empty',    'hole-1',  'empty',    'empty',    'empty',   'wall'],
            ['empty',    'empty',   'router',   'empty',   'empty',    'empty',    'empty',   'empty'],
            ['empty',    'trap-1',  'empty',    'empty',   'hole-2',   'empty',    'srv-1',   'wall'],
            ['wall',     'empty',   'empty',    'empty',   'empty',    'empty',    'empty',   'empty'],
            ['empty',    'empty',   'empty',    'switch',  'empty',    'hole-3',   'empty',   'wall'],
            ['empty',    'empty',   'empty',    'empty',   'empty',    'empty',    'firewall','empty'],
            ['wall',     'empty',   'trap-2',   'empty',   'srv-2',    'empty',    'empty',   'empty'],
            ['wall',     'wall',    'empty',    'empty',   'empty',    'wall',     'empty',   'target']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway':  { label: 'GATEWAY',     abbr: 'GTW', ip: '10.180.0.1',  desc: 'Entry point',                            ports: ['22/SSH','443/HTTPS'],                     os: 'Cisco IOS 15.4' },
        'router':   { label: 'ROUTER',      abbr: 'RTR', ip: '10.180.0.2',  desc: 'Core router',                            ports: ['22/SSH','179/BGP'],                       os: 'Juniper JunOS 21.4' },
        'switch':   { label: 'SWITCH',      abbr: 'SWT', ip: '10.180.0.5',  desc: 'Distribution switch',                    ports: ['22/SSH','161/SNMP'],                      os: 'Cisco Catalyst 9300' },

        'srv-1':    { label: 'SRV-ALPHA',   abbr: 'SRA', ip: '10.180.1.11', desc: 'Server Alpha — northeast sector',        ports: ['22/SSH','8080/HTTP','8443/HTTPS'],        os: 'Ubuntu 24.04 LTS' },
        'srv-2':    { label: 'SRV-BRAVO',   abbr: 'SRB', ip: '10.180.1.12', desc: 'Server Bravo — south sector',            ports: ['22/SSH','5432/PostgreSQL'],               os: 'RHEL 9.3' },

        'firewall': { label: 'FIREWALL',    abbr: 'FWL', ip: '10.180.0.254',desc: 'Corridor gate — requires nmap',           ports: ['22/SSH','443/MGMT'],                      os: 'pfSense 2.7.0', vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL allows bypass' },
        'target':   { label: 'EXTRACTION',  abbr: 'EXT', ip: '10.180.0.99', desc: 'Extraction point — mission complete',     ports: ['22/SSH','8443/HTTPS'],                    os: 'RHEL 9.3' },

        /* 3 holes — NEW obstacle type. Cannot be swept. Must be jumped. */
        'hole-1':   { label: 'HOLE',        abbr: 'HLE', ip: null, desc: 'Gap in network fabric — jump to cross',           ports: [] },
        'hole-2':   { label: 'HOLE',        abbr: 'HLE', ip: null, desc: 'Severed connection — jump to cross',              ports: [] },
        'hole-3':   { label: 'HOLE',        abbr: 'HLE', ip: null, desc: 'Missing link segment — jump to cross',            ports: [] },

        /* 2 traps — familiar obstacle. Sweep to disarm. */
        'trap-1':   { label: 'HONEYPOT',    abbr: 'HP1', ip: '10.180.0.200',desc: 'Decoy — west corridor',                   ports: ['22/SSH-FAKE'],                            os: 'Honeyd [TRAP]' },
        'trap-2':   { label: 'IDS-SENSOR',  abbr: 'IDS', ip: '10.180.0.201',desc: 'Intrusion detection — south corridor',    ports: ['514/SYSLOG'],                             os: 'Snort [TRAP]' }
    },

    traps: ['trap-1', 'trap-2'],

    /* NEW: obstacles field — defines hole/fire/enemy cell types */
    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3']
    },

    gates: {
        'firewall': { requires: 'nmap', flag: 'firewallBypassed', vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL allows bypass' }
    },

    objectives: [
        { id: 'obj_0', label: 'RECON -- Discover 5+ network nodes',               check: 'nodesDiscovered.size >= 5' },
        { id: 'obj_1', label: 'INTEL -- nmap both servers',                        check: 'nmapTargets.has("srv-1") && nmapTargets.has("srv-2")' },
        { id: 'obj_2', label: 'ACCESS -- Bypass the firewall',                     check: 'firewallBypassed' },
        { id: 'obj_3', label: 'NAVIGATE -- Cross all 3 holes safely',             check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3")' },
        { id: 'obj_4', label: 'EXTRACTION -- Reach the extraction point',          check: 'nodesDiscovered.has("target")' },
        { id: 'obj_5', label: 'STEALTH -- 2+ integrity remaining',                check: 'integrity >= 2' }
    ],

    integrity: 4,

    completion: {
        title: 'PIT STOP',
        subtitle: 'New obstacle conquered. Holes jumped. Extraction clean.',
        storageKey: 'hexworth_operator_python18'
    }
};
