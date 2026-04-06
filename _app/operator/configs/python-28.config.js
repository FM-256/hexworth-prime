/* ================================================================
   PYTHON-28 / THE BRIDGE -- Mission Config
   ================================================================
   *** THE METROIDVANIA BOOTSTRAP ***
   9x9 grid. Upon COMPLETING this level, the student earns the
   'bridge' permanent tool — their first persistent capability.

   This is a COMPLETION REWARD, not a grid pickup. The student
   doesn't need any previous permanent tools to earn bridge.
   This solves the chicken-and-egg problem.

   After earning bridge, students can:
   - Return to earlier levels and cross holes permanently
   - Access bonus objectives that were impossible before
   - Feel the Metroidvania loop for the first time

   LEVEL DESIGN:
   - 6 holes that must be jumped (per-transit) — a gauntlet
   - The level TEACHES you how annoying per-transit jumping is
   - Upon completion, the student earns bridge which makes holes
     trivial forever — the reward feels earned and impactful
   - 2 traps, 1 gate, 2 servers. Standard objectives.

   COMPLETION TRIGGERS:
   - When mission completes, the engine awards 'bridge' to the
     persistent inventory via localStorage.
   ================================================================ */

var PYTHON_28_CONFIG = {
    id: 'python-28',
    title: 'PYTHON-28 / THE BRIDGE',
    subtitle: 'Survive the gauntlet. Earn your first permanent tool.',
    category: 'python-ops',
    difficulty: 4,
    inputMode: 'python',
    agent: { tier: 3 },

    /* Flag: award this tool on mission completion */
    completionReward: { tool: 'bridge' },

    grid: {
        rows: 9, cols: 9,
        cells: [
            ['gateway',  'empty',   'hole-1',  'empty',   'hole-2',  'empty',   'empty',   'empty',  'wall'],
            ['empty',    'empty',   'empty',   'empty',   'empty',   'empty',   'srv-1',   'empty',  'empty'],
            ['empty',    'trap-1',  'empty',   'hole-3',  'empty',   'empty',   'empty',   'empty',  'wall'],
            ['wall',     'empty',   'empty',   'empty',   'empty',   'router',  'empty',   'empty',  'empty'],
            ['empty',    'empty',   'hole-4',  'empty',   'empty',   'empty',   'hole-5',  'empty',  'wall'],
            ['empty',    'empty',   'empty',   'empty',   'firewall','empty',   'empty',   'empty',  'empty'],
            ['wall',     'empty',   'empty',   'hole-6',  'empty',   'empty',   'srv-2',   'empty',  'wall'],
            ['empty',    'empty',   'empty',   'empty',   'empty',   'trap-2',  'empty',   'empty',  'empty'],
            ['wall',     'wall',    'empty',   'empty',   'empty',   'wall',    'empty',   'empty',  'target']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway':  { label: 'GATEWAY',    abbr: 'GTW', ip: '10.280.0.1',  desc: 'Entry point — the gauntlet begins',  ports: ['22/SSH','443/HTTPS'],        os: 'Cisco IOS 15.4' },
        'router':   { label: 'ROUTER',     abbr: 'RTR', ip: '10.280.0.2',  desc: 'Core router',                        ports: ['22/SSH','179/BGP'],         os: 'Juniper JunOS 21.4' },
        'srv-1':    { label: 'SRV-ALPHA',  abbr: 'SRA', ip: '10.280.1.11', desc: 'Server Alpha',                       ports: ['22/SSH','8080/HTTP'],        os: 'Ubuntu 24.04 LTS' },
        'srv-2':    { label: 'SRV-BRAVO',  abbr: 'SRB', ip: '10.280.1.12', desc: 'Server Bravo',                       ports: ['22/SSH','5432/PostgreSQL'],  os: 'RHEL 9.3' },
        'firewall': { label: 'FIREWALL',   abbr: 'FWL', ip: '10.280.0.254',desc: 'Corridor gate',                       ports: ['22/SSH','443/MGMT'],        os: 'pfSense 2.7.0', vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL' },
        'target':   { label: 'EXTRACTION', abbr: 'EXT', ip: '10.280.0.99', desc: 'Complete this to earn BRIDGE tool',   ports: ['22/SSH','8443/HTTPS'],      os: 'RHEL 9.3' },

        'hole-1':   { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap 1 of 6 — jump', ports: [] },
        'hole-2':   { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap 2 of 6 — jump', ports: [] },
        'hole-3':   { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap 3 of 6 — jump', ports: [] },
        'hole-4':   { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap 4 of 6 — jump', ports: [] },
        'hole-5':   { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap 5 of 6 — jump', ports: [] },
        'hole-6':   { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap 6 of 6 — jump', ports: [] },

        'trap-1':   { label: 'HONEYPOT', abbr: 'HP1', ip: '10.280.0.200', desc: 'Decoy', ports: ['22/SSH-FAKE'], os: 'Honeyd [TRAP]' },
        'trap-2':   { label: 'IDS-SENSOR',abbr: 'IDS', ip: '10.280.0.201', desc: 'IDS',  ports: ['514/SYSLOG'],  os: 'Snort [TRAP]' }
    },

    traps: ['trap-1', 'trap-2'],
    obstacles: { holes: ['hole-1', 'hole-2', 'hole-3', 'hole-4', 'hole-5', 'hole-6'] },
    gates: { 'firewall': { requires: 'nmap', flag: 'firewallBypassed', vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL' } },

    objectives: [
        { id: 'obj_0', label: 'GAUNTLET -- Jump across all 6 holes',              check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3") && nodesDiscovered.has("hole-4") && nodesDiscovered.has("hole-5") && nodesDiscovered.has("hole-6")' },
        { id: 'obj_1', label: 'ACCESS -- Bypass the firewall',                    check: 'firewallBypassed' },
        { id: 'obj_2', label: 'INTEL -- nmap both servers',                       check: 'nmapTargets.has("srv-1") && nmapTargets.has("srv-2")' },
        { id: 'obj_3', label: 'EXTRACTION -- Reach extraction (earn BRIDGE tool)',check: 'nodesDiscovered.has("target")' },
        { id: 'obj_4', label: 'STEALTH -- 4+ integrity remaining',               check: 'integrity >= 4' }
    ],

    integrity: 6,
    completion: { title: 'THE BRIDGE', subtitle: '*** BRIDGE TOOL EARNED *** Holes are now permanently crossable.', storageKey: 'hexworth_operator_python28' }
};
