/* ================================================================
   PYTHON-27 / LOCKDOWN -- Mission Config
   ================================================================
   Keys + full obstacle mix. 9x9 grid (first 9x9 in obstacle arc).
   2 locked doors, 2 keys scattered behind obstacles.
   Student must plan: get key BEFORE going to door.
   Forces sequencing logic — the student can't just sweep linearly.

   This is the last Act II level. After this: TOOL FORGE begins.
   ================================================================ */

var PYTHON_27_CONFIG = {
    id: 'python-27',
    title: 'PYTHON-27 / LOCKDOWN',
    subtitle: 'Two doors. Two keys. Plan your route or get stuck.',
    category: 'python-ops',
    difficulty: 4,
    inputMode: 'python',
    agent: { tier: 3 },

    grid: {
        rows: 9, cols: 9,
        cells: [
            ['gateway',     'empty',       'empty',       'hole-1',      'empty',       'key-1',       'empty',       'empty',  'wall'],
            ['empty',       'enemy-1',     'empty',       'empty',       'router',      'empty',       'empty',       'empty',  'empty'],
            ['empty',       'empty',       'fire-1',      'empty',       'empty',       'empty',       'srv-1',       'empty',  'wall'],
            ['wall',        'empty',       'empty',       'empty',       'locked-door-1','empty',      'empty',       'empty',  'empty'],
            ['empty',       'hole-2',      'empty',       'empty',       'empty',       'fire-2',      'empty',       'srv-2',  'wall'],
            ['empty',       'empty',       'enemy-2',     'empty',       'empty',       'empty',       'empty',       'empty',  'empty'],
            ['wall',        'empty',       'empty',       'key-2',       'empty',       'empty',       'locked-door-2','empty', 'wall'],
            ['empty',       'trap-1',      'empty',       'empty',       'srv-3',       'empty',       'empty',       'empty',  'empty'],
            ['wall',        'wall',        'empty',       'empty',       'empty',       'wall',        'empty',       'empty',  'target']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway':        { label: 'GATEWAY',      abbr: 'GTW', ip: '10.270.0.1',  desc: 'Entry point',          ports: ['22/SSH','443/HTTPS'],        os: 'Cisco IOS 15.4' },
        'router':         { label: 'ROUTER',       abbr: 'RTR', ip: '10.270.0.2',  desc: 'Core router',          ports: ['22/SSH','179/BGP'],         os: 'Juniper JunOS 21.4' },
        'srv-1':          { label: 'SRV-ALPHA',    abbr: 'SRA', ip: '10.270.1.11', desc: 'Server Alpha',         ports: ['22/SSH','8080/HTTP'],        os: 'Ubuntu 24.04 LTS' },
        'srv-2':          { label: 'SRV-BRAVO',    abbr: 'SRB', ip: '10.270.1.12', desc: 'Server Bravo',         ports: ['22/SSH','5432/PostgreSQL'],  os: 'RHEL 9.3' },
        'srv-3':          { label: 'SRV-CHARLIE',  abbr: 'SRC', ip: '10.270.1.13', desc: 'Server Charlie',       ports: ['22/SSH','9200/ELASTIC'],     os: 'CentOS Stream 9' },
        'target':         { label: 'EXTRACTION',   abbr: 'EXT', ip: '10.270.0.99', desc: 'Extraction point',      ports: ['22/SSH','8443/HTTPS'],      os: 'RHEL 9.3' },

        'key-1':          { label: 'ACCESS KEY A', abbr: 'KYA', ip: null, desc: 'Security credential A',         ports: [] },
        'key-2':          { label: 'ACCESS KEY B', abbr: 'KYB', ip: null, desc: 'Security credential B',         ports: [] },
        'locked-door-1':  { label: 'LOCKED DOOR A',abbr: 'LKA', ip: null, desc: 'Sealed corridor A — key required', ports: [] },
        'locked-door-2':  { label: 'LOCKED DOOR B',abbr: 'LKB', ip: null, desc: 'Sealed corridor B — key required', ports: [] },

        'hole-1':         { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap — jump',              ports: [] },
        'hole-2':         { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Broken link — jump',      ports: [] },
        'fire-1':         { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Breach — extinguish',     ports: [] },
        'fire-2':         { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Thermal — extinguish',    ports: [] },
        'enemy-1':        { label: 'ENEMY GUARD',  abbr: 'GRD', ip: null, desc: 'Guard — fight',   ports: [] },
        'enemy-2':        { label: 'ENEMY DRONE',  abbr: 'DRN', ip: null, desc: 'Drone — fight',   ports: [] },
        'trap-1':         { label: 'HONEYPOT',     abbr: 'HP1', ip: '10.270.0.200', desc: 'Decoy', ports: ['22/SSH-FAKE'], os: 'Honeyd [TRAP]' }
    },

    traps: ['trap-1'],
    obstacles: {
        holes: ['hole-1', 'hole-2'],
        fires: ['fire-1', 'fire-2'],
        enemies: ['enemy-1', 'enemy-2']
    },
    gates: {},

    objectives: [
        { id: 'obj_0', label: 'COLLECT -- Find both access keys',                 check: 'nodesDiscovered.has("key-1") && nodesDiscovered.has("key-2")' },
        { id: 'obj_1', label: 'UNLOCK -- Open both locked doors',                 check: 'nodesDiscovered.has("locked-door-1") && nodesDiscovered.has("locked-door-2")' },
        { id: 'obj_2', label: 'NAVIGATE -- Handle all obstacles (holes/fires/enemies)', check: 'nodesDiscovered.size >= 12' },
        { id: 'obj_3', label: 'INTEL -- nmap all 3 servers',                      check: 'nmapTargets.has("srv-1") && nmapTargets.has("srv-2") && nmapTargets.has("srv-3")' },
        { id: 'obj_4', label: 'EXTRACTION -- Reach extraction point',             check: 'nodesDiscovered.has("target")' }
    ],

    integrity: 5,
    completion: { title: 'LOCKDOWN', subtitle: 'Two doors opened. Route planned. Act II complete.', storageKey: 'hexworth_operator_python27' }
};
