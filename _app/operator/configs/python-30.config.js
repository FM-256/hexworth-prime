/* ================================================================
   PYTHON-30 / SINKHOLE -- Mission Config
   ================================================================
   Bridge mastery. 9x9 grid. 8 holes — bridge 4, jump 4.
   Student learns to use bridge strategically (permanent = valuable)
   vs jump (per-transit = cheap but temporary).
   Dict dispatch begins emerging: tools = {'HOLE': agent.bridge}
   ================================================================ */

var PYTHON_30_CONFIG = {
    id: 'python-30',
    title: 'PYTHON-30 / SINKHOLE',
    subtitle: 'Eight holes. Bridge the critical ones. Jump the rest.',
    category: 'python-ops',
    difficulty: 4,
    inputMode: 'python',
    agent: { tier: 3 },

    grid: {
        rows: 9, cols: 9,
        cells: [
            ['gateway',  'hole-1',  'empty',   'empty',   'hole-2',  'empty',   'fire-1',  'empty',  'wall'],
            ['empty',    'empty',   'empty',   'srv-1',   'empty',   'empty',   'empty',   'empty',  'empty'],
            ['hole-3',   'empty',   'empty',   'empty',   'empty',   'hole-4',  'empty',   'enemy-1','wall'],
            ['empty',    'empty',   'router',  'empty',   'empty',   'empty',   'empty',   'empty',  'empty'],
            ['empty',    'hole-5',  'empty',   'empty',   'fire-2',  'empty',   'hole-6',  'empty',  'wall'],
            ['empty',    'empty',   'empty',   'srv-2',   'empty',   'empty',   'empty',   'empty',  'empty'],
            ['wall',     'hole-7',  'empty',   'empty',   'enemy-2', 'empty',   'hole-8',  'empty',  'wall'],
            ['empty',    'empty',   'empty',   'empty',   'empty',   'srv-3',   'empty',   'trap-1', 'empty'],
            ['wall',     'wall',    'empty',   'empty',   'empty',   'wall',    'empty',   'empty',  'target']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway': { label: 'GATEWAY',    abbr: 'GTW', ip: '10.300.0.1',  desc: 'Entry',              ports: ['22/SSH','443/HTTPS'],        os: 'Cisco IOS 15.4' },
        'router':  { label: 'ROUTER',     abbr: 'RTR', ip: '10.300.0.2',  desc: 'Core router',        ports: ['22/SSH','179/BGP'],         os: 'Juniper JunOS 21.4' },
        'srv-1':   { label: 'SRV-ALPHA',  abbr: 'SRA', ip: '10.300.1.11', desc: 'Server Alpha',       ports: ['22/SSH','8080/HTTP'],        os: 'Ubuntu 24.04 LTS' },
        'srv-2':   { label: 'SRV-BRAVO',  abbr: 'SRB', ip: '10.300.1.12', desc: 'Server Bravo',       ports: ['22/SSH','5432/PostgreSQL'],  os: 'RHEL 9.3' },
        'srv-3':   { label: 'SRV-CHARLIE',abbr: 'SRC', ip: '10.300.1.13', desc: 'Server Charlie',     ports: ['22/SSH','9200/ELASTIC'],     os: 'CentOS Stream 9' },
        'target':  { label: 'EXTRACTION', abbr: 'EXT', ip: '10.300.0.99', desc: 'Extraction',          ports: ['22/SSH','8443/HTTPS'],      os: 'RHEL 9.3' },
        'hole-1':  { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] },
        'hole-2':  { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] },
        'hole-3':  { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] },
        'hole-4':  { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] },
        'hole-5':  { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] },
        'hole-6':  { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] },
        'hole-7':  { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] },
        'hole-8':  { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] },
        'fire-1':  { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Breach — extinguish', ports: [] },
        'fire-2':  { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Thermal — extinguish', ports: [] },
        'enemy-1': { label: 'ENEMY GUARD', abbr: 'GRD', ip: null, desc: 'Guard — fight', ports: [] },
        'enemy-2': { label: 'ENEMY DRONE', abbr: 'DRN', ip: null, desc: 'Drone — fight', ports: [] },
        'trap-1':  { label: 'HONEYPOT', abbr: 'HP1', ip: '10.300.0.200', desc: 'Decoy', ports: ['22/SSH-FAKE'], os: 'Honeyd [TRAP]' }
    },

    traps: ['trap-1'],
    obstacles: { holes: ['hole-1','hole-2','hole-3','hole-4','hole-5','hole-6','hole-7','hole-8'], fires: ['fire-1','fire-2'], enemies: ['enemy-1','enemy-2'] },
    gates: {},

    objectives: [
        { id: 'obj_0', label: 'NAVIGATE -- Cross all 8 holes (bridge or jump)',   check: 'nodesDiscovered.size >= 10' },
        { id: 'obj_1', label: 'INTEL -- nmap all 3 servers',                      check: 'nmapTargets.has("srv-1") && nmapTargets.has("srv-2") && nmapTargets.has("srv-3")' },
        { id: 'obj_2', label: 'EXTRACTION -- Reach extraction',                   check: 'nodesDiscovered.has("target")' },
        { id: 'obj_3', label: 'STEALTH -- 4+ integrity remaining',               check: 'integrity >= 4' }
    ],

    integrity: 6,
    completion: { title: 'SINKHOLE', subtitle: 'Eight holes conquered. Bridge vs jump — strategy matters.', storageKey: 'hexworth_operator_python30' }
};
