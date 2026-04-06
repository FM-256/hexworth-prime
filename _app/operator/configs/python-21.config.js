/* ================================================================
   PYTHON-21 / INFERNO ALLEY -- Mission Config
   ================================================================
   Fire mastery. 8x8 grid. 5 fires as dominant obstacle.
   Student perfects the extinguish pattern with high fire density.
   Holes reduced to 2 (familiar), traps reduced to 1.
   ================================================================ */

var PYTHON_21_CONFIG = {
    id: 'python-21',
    title: 'PYTHON-21 / INFERNO ALLEY',
    subtitle: 'Fire on every path. Master the extinguish command.',
    category: 'python-ops',
    difficulty: 3,
    inputMode: 'python',
    agent: { tier: 3 },

    grid: {
        rows: 8, cols: 8,
        cells: [
            ['gateway',  'fire-1',  'empty',   'empty',   'empty',   'fire-2',  'empty',  'wall'],
            ['empty',    'empty',   'empty',   'router',  'empty',   'empty',   'srv-1',  'empty'],
            ['empty',    'empty',   'fire-3',  'empty',   'hole-1',  'empty',   'empty',  'wall'],
            ['wall',     'empty',   'empty',   'empty',   'empty',   'empty',   'empty',  'empty'],
            ['empty',    'empty',   'empty',   'fire-4',  'empty',   'empty',   'srv-2',  'wall'],
            ['empty',    'hole-2',  'empty',   'empty',   'empty',   'fire-5',  'empty',  'empty'],
            ['wall',     'empty',   'trap-1',  'empty',   'srv-3',   'empty',   'empty',  'wall'],
            ['wall',     'wall',    'empty',   'empty',   'empty',   'wall',    'empty',  'target']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway': { label: 'GATEWAY',    abbr: 'GTW', ip: '10.210.0.1',  desc: 'Entry point',           ports: ['22/SSH','443/HTTPS'],        os: 'Cisco IOS 15.4' },
        'router':  { label: 'ROUTER',     abbr: 'RTR', ip: '10.210.0.2',  desc: 'Core router',           ports: ['22/SSH','179/BGP'],         os: 'Juniper JunOS 21.4' },
        'srv-1':   { label: 'SRV-ALPHA',  abbr: 'SRA', ip: '10.210.1.11', desc: 'Server Alpha',          ports: ['22/SSH','8080/HTTP'],        os: 'Ubuntu 24.04 LTS' },
        'srv-2':   { label: 'SRV-BRAVO',  abbr: 'SRB', ip: '10.210.1.12', desc: 'Server Bravo',          ports: ['22/SSH','5432/PostgreSQL'],  os: 'RHEL 9.3' },
        'srv-3':   { label: 'SRV-CHARLIE',abbr: 'SRC', ip: '10.210.1.13', desc: 'Server Charlie',        ports: ['22/SSH','9200/ELASTIC'],     os: 'CentOS Stream 9' },
        'target':  { label: 'EXTRACTION', abbr: 'EXT', ip: '10.210.0.99', desc: 'Extraction point',       ports: ['22/SSH','8443/HTTPS'],      os: 'RHEL 9.3' },
        'fire-1':  { label: 'FIRE',       abbr: 'FIR', ip: null, desc: 'Burning entry corridor',    ports: [] },
        'fire-2':  { label: 'FIRE',       abbr: 'FIR', ip: null, desc: 'Thermal barrier east',      ports: [] },
        'fire-3':  { label: 'FIRE',       abbr: 'FIR', ip: null, desc: 'Active breach center',      ports: [] },
        'fire-4':  { label: 'FIRE',       abbr: 'FIR', ip: null, desc: 'Firewall meltdown',         ports: [] },
        'fire-5':  { label: 'FIRE',       abbr: 'FIR', ip: null, desc: 'Burning south corridor',    ports: [] },
        'hole-1':  { label: 'HOLE',       abbr: 'HLE', ip: null, desc: 'Network gap',               ports: [] },
        'hole-2':  { label: 'HOLE',       abbr: 'HLE', ip: null, desc: 'Broken link',               ports: [] },
        'trap-1':  { label: 'HONEYPOT',   abbr: 'HP1', ip: '10.210.0.200', desc: 'Decoy',           ports: ['22/SSH-FAKE'], os: 'Honeyd [TRAP]' }
    },

    traps: ['trap-1'],
    obstacles: { holes: ['hole-1', 'hole-2'], fires: ['fire-1', 'fire-2', 'fire-3', 'fire-4', 'fire-5'] },
    gates: {},

    objectives: [
        { id: 'obj_0', label: 'NAVIGATE -- Extinguish all 5 fires',     check: 'nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2") && nodesDiscovered.has("fire-3") && nodesDiscovered.has("fire-4") && nodesDiscovered.has("fire-5")' },
        { id: 'obj_1', label: 'INTEL -- nmap all 3 servers',            check: 'nmapTargets.has("srv-1") && nmapTargets.has("srv-2") && nmapTargets.has("srv-3")' },
        { id: 'obj_2', label: 'EXTRACTION -- Reach extraction point',   check: 'nodesDiscovered.has("target")' },
        { id: 'obj_3', label: 'STEALTH -- 3+ integrity remaining',      check: 'integrity >= 3' }
    ],

    integrity: 5,
    completion: { title: 'INFERNO ALLEY', subtitle: 'Five fires extinguished. Path cleared.', storageKey: 'hexworth_operator_python21' }
};
