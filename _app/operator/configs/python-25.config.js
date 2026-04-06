/* ================================================================
   PYTHON-25 / RESOURCE CRUNCH -- Mission Config
   ================================================================
   Resource awareness. 8x8 grid. HIGH obstacle density.
   Per-transit lesson: student realizes jump/extinguish/fight are
   CONSUMED on crossing. Must call them EVERY time they cross.
   4 of each obstacle type + 2 traps = 14 obstacles total.
   Teaches efficiency — wasteful code burns through integrity.
   ================================================================ */

var PYTHON_25_CONFIG = {
    id: 'python-25',
    title: 'PYTHON-25 / RESOURCE CRUNCH',
    subtitle: 'High density. Every action counts. Efficiency matters.',
    category: 'python-ops',
    difficulty: 4,
    inputMode: 'python',
    agent: { tier: 3 },

    grid: {
        rows: 8, cols: 8,
        cells: [
            ['gateway',     'hole-1',      'empty',       'fire-1',      'empty',       'enemy-1',     'empty',  'wall'],
            ['empty',       'empty',       'enemy-2',     'empty',       'srv-1',       'empty',       'hole-2', 'empty'],
            ['fire-2',      'empty',       'empty',       'hole-3',      'empty',       'empty',       'empty',  'wall'],
            ['empty',       'enemy-3',     'empty',       'empty',       'router',      'fire-3',      'empty',  'empty'],
            ['wall',        'empty',       'fire-4',      'empty',       'empty',       'empty',       'srv-2',  'wall'],
            ['empty',       'hole-4',      'empty',       'enemy-4',     'empty',       'trap-1',      'empty',  'empty'],
            ['wall',        'empty',       'empty',       'empty',       'srv-3',       'empty',       'trap-2', 'wall'],
            ['wall',        'wall',        'empty',       'empty',       'empty',       'wall',        'empty',  'target']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway': { label: 'GATEWAY',    abbr: 'GTW', ip: '10.250.0.1',  desc: 'Entry point',       ports: ['22/SSH','443/HTTPS'],        os: 'Cisco IOS 15.4' },
        'router':  { label: 'ROUTER',     abbr: 'RTR', ip: '10.250.0.2',  desc: 'Core router',       ports: ['22/SSH','179/BGP'],         os: 'Juniper JunOS 21.4' },
        'srv-1':   { label: 'SRV-ALPHA',  abbr: 'SRA', ip: '10.250.1.11', desc: 'Server Alpha',      ports: ['22/SSH','8080/HTTP'],        os: 'Ubuntu 24.04 LTS' },
        'srv-2':   { label: 'SRV-BRAVO',  abbr: 'SRB', ip: '10.250.1.12', desc: 'Server Bravo',      ports: ['22/SSH','5432/PostgreSQL'],  os: 'RHEL 9.3' },
        'srv-3':   { label: 'SRV-CHARLIE',abbr: 'SRC', ip: '10.250.1.13', desc: 'Server Charlie',    ports: ['22/SSH','9200/ELASTIC'],     os: 'CentOS Stream 9' },
        'target':  { label: 'EXTRACTION', abbr: 'EXT', ip: '10.250.0.99', desc: 'Extraction point',   ports: ['22/SSH','8443/HTTPS'],      os: 'RHEL 9.3' },

        'hole-1':  { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap — jump', ports: [] },
        'hole-2':  { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap — jump', ports: [] },
        'hole-3':  { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap — jump', ports: [] },
        'hole-4':  { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap — jump', ports: [] },
        'fire-1':  { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Active breach — extinguish', ports: [] },
        'fire-2':  { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Thermal barrier — extinguish', ports: [] },
        'fire-3':  { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Burning link — extinguish', ports: [] },
        'fire-4':  { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Firewall meltdown — extinguish', ports: [] },
        'enemy-1': { label: 'ENEMY GUARD', abbr: 'GRD', ip: null, desc: 'Guard — fight', ports: [] },
        'enemy-2': { label: 'ENEMY DRONE', abbr: 'DRN', ip: null, desc: 'Drone — fight', ports: [] },
        'enemy-3': { label: 'ENEMY BOT',   abbr: 'BOT', ip: null, desc: 'Bot — fight',   ports: [] },
        'enemy-4': { label: 'ENEMY SENTRY',abbr: 'SNT', ip: null, desc: 'Sentry — fight', ports: [] },
        'trap-1':  { label: 'HONEYPOT', abbr: 'HP1', ip: '10.250.0.200', desc: 'Decoy', ports: ['22/SSH-FAKE'], os: 'Honeyd [TRAP]' },
        'trap-2':  { label: 'IDS-SENSOR',abbr: 'IDS', ip: '10.250.0.201', desc: 'IDS',  ports: ['514/SYSLOG'],  os: 'Snort [TRAP]' }
    },

    traps: ['trap-1', 'trap-2'],
    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3', 'hole-4'],
        fires: ['fire-1', 'fire-2', 'fire-3', 'fire-4'],
        enemies: ['enemy-1', 'enemy-2', 'enemy-3', 'enemy-4']
    },
    gates: {},

    objectives: [
        { id: 'obj_0', label: 'SURVIVE -- Navigate 14 obstacles total',    check: 'nodesDiscovered.size >= 10' },
        { id: 'obj_1', label: 'INTEL -- nmap all 3 servers',               check: 'nmapTargets.has("srv-1") && nmapTargets.has("srv-2") && nmapTargets.has("srv-3")' },
        { id: 'obj_2', label: 'EXTRACTION -- Reach extraction point',      check: 'nodesDiscovered.has("target")' },
        { id: 'obj_3', label: 'EFFICIENCY -- 4+ integrity remaining',      check: 'integrity >= 4' }
    ],

    integrity: 6,
    completion: { title: 'RESOURCE CRUNCH', subtitle: 'High density survived. Every action counted.', storageKey: 'hexworth_operator_python25' }
};
