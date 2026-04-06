/* ================================================================
   PYTHON-23 / ENEMY LINES -- Mission Config
   ================================================================
   Enemy mastery. 8x8 grid. Reintroduce holes alongside enemies.
   Student consolidates enemies + holes in one level before the
   full four-type mix. Nancy's consolidation buffer.
   ================================================================ */

var PYTHON_23_CONFIG = {
    id: 'python-23',
    title: 'PYTHON-23 / ENEMY LINES',
    subtitle: 'Enemies and holes together. Two threats. One response each.',
    category: 'python-ops',
    difficulty: 3,
    inputMode: 'python',
    agent: { tier: 3 },

    grid: {
        rows: 8, cols: 8,
        cells: [
            ['gateway',  'empty',      'hole-1',     'empty',      'empty',      'empty',      'empty',   'wall'],
            ['empty',    'enemy-sentry','empty',      'empty',      'srv-1',      'empty',      'empty',   'empty'],
            ['empty',    'empty',      'empty',       'hole-2',     'empty',      'enemy-scout','empty',   'wall'],
            ['wall',     'empty',      'empty',       'empty',      'router',     'empty',      'empty',   'empty'],
            ['empty',    'hole-3',     'empty',       'empty',      'empty',      'empty',      'srv-2',   'wall'],
            ['empty',    'empty',      'enemy-patrol','empty',      'empty',      'hole-4',     'empty',   'empty'],
            ['wall',     'trap-1',     'empty',       'srv-3',      'empty',      'empty',      'empty',   'wall'],
            ['wall',     'wall',       'empty',       'empty',      'empty',      'wall',       'empty',   'target']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway':      { label: 'GATEWAY',      abbr: 'GTW', ip: '10.230.0.1',  desc: 'Entry point',            ports: ['22/SSH','443/HTTPS'],        os: 'Cisco IOS 15.4' },
        'router':       { label: 'ROUTER',       abbr: 'RTR', ip: '10.230.0.2',  desc: 'Core router',            ports: ['22/SSH','179/BGP'],         os: 'Juniper JunOS 21.4' },
        'srv-1':        { label: 'SRV-ALPHA',    abbr: 'SRA', ip: '10.230.1.11', desc: 'Server Alpha',           ports: ['22/SSH','8080/HTTP'],        os: 'Ubuntu 24.04 LTS' },
        'srv-2':        { label: 'SRV-BRAVO',    abbr: 'SRB', ip: '10.230.1.12', desc: 'Server Bravo',           ports: ['22/SSH','5432/PostgreSQL'],  os: 'RHEL 9.3' },
        'srv-3':        { label: 'SRV-CHARLIE',  abbr: 'SRC', ip: '10.230.1.13', desc: 'Server Charlie',         ports: ['22/SSH','9200/ELASTIC'],     os: 'CentOS Stream 9' },
        'target':       { label: 'EXTRACTION',   abbr: 'EXT', ip: '10.230.0.99', desc: 'Extraction point',        ports: ['22/SSH','8443/HTTPS'],      os: 'RHEL 9.3' },
        'enemy-sentry': { label: 'ENEMY SENTRY', abbr: 'SNT', ip: null, desc: 'Sentry process — fight to pass',  ports: [] },
        'enemy-scout':  { label: 'ENEMY SCOUT',  abbr: 'SCT', ip: null, desc: 'Scout drone — fight to pass',     ports: [] },
        'enemy-patrol': { label: 'ENEMY PATROL',  abbr: 'PTR', ip: null, desc: 'Patrol bot — fight to pass',     ports: [] },
        'hole-1':       { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Network gap', ports: [] },
        'hole-2':       { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Broken link', ports: [] },
        'hole-3':       { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Collapsed path', ports: [] },
        'hole-4':       { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Missing segment', ports: [] },
        'trap-1':       { label: 'HONEYPOT', abbr: 'HP1', ip: '10.230.0.200', desc: 'Decoy', ports: ['22/SSH-FAKE'], os: 'Honeyd [TRAP]' }
    },

    traps: ['trap-1'],
    obstacles: { holes: ['hole-1', 'hole-2', 'hole-3', 'hole-4'], enemies: ['enemy-sentry', 'enemy-scout', 'enemy-patrol'] },
    gates: {},

    objectives: [
        { id: 'obj_0', label: 'COMBAT -- Defeat all 3 enemies',          check: 'nodesDiscovered.has("enemy-sentry") && nodesDiscovered.has("enemy-scout") && nodesDiscovered.has("enemy-patrol")' },
        { id: 'obj_1', label: 'NAVIGATE -- Cross all 4 holes',           check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3") && nodesDiscovered.has("hole-4")' },
        { id: 'obj_2', label: 'INTEL -- nmap all 3 servers',             check: 'nmapTargets.has("srv-1") && nmapTargets.has("srv-2") && nmapTargets.has("srv-3")' },
        { id: 'obj_3', label: 'EXTRACTION -- Reach extraction point',    check: 'nodesDiscovered.has("target")' }
    ],

    integrity: 5,
    completion: { title: 'ENEMY LINES', subtitle: 'Enemies defeated. Chasms crossed. Area secured.', storageKey: 'hexworth_operator_python23' }
};
