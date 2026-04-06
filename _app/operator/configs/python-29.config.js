/* ================================================================
   PYTHON-29 / BACKTRACK: PIT STOP -- Mission Config
   ================================================================
   First BACKTRACK level. 9x9 grid.
   Student returns to the L18 concept with their new bridge tool.
   Holes that required jumping can now be bridged permanently.
   This is the student's first Metroidvania "aha" moment.

   DESIGN: A grid with holes similar to L18 but larger, plus
   bonus areas that were previously unreachable. The bridge tool
   makes previously frustrating sections trivial.
   ================================================================ */

var PYTHON_29_CONFIG = {
    id: 'python-29',
    title: 'PYTHON-29 / BACKTRACK: PIT STOP',
    subtitle: 'Return with bridge. Cross what was once impossible.',
    category: 'python-ops',
    difficulty: 3,
    inputMode: 'python',
    agent: { tier: 3 },

    grid: {
        rows: 9, cols: 9,
        cells: [
            ['gateway',  'empty',   'hole-1',  'empty',   'empty',   'hole-2',  'empty',   'empty',  'wall'],
            ['empty',    'empty',   'empty',   'empty',   'srv-1',   'empty',   'empty',   'empty',  'empty'],
            ['empty',    'hole-3',  'empty',   'empty',   'empty',   'empty',   'hole-4',  'empty',  'wall'],
            ['wall',     'empty',   'empty',   'router',  'empty',   'empty',   'empty',   'empty',  'empty'],
            ['empty',    'empty',   'empty',   'empty',   'empty',   'hole-5',  'empty',   'srv-2',  'wall'],
            ['empty',    'trap-1',  'empty',   'empty',   'empty',   'empty',   'empty',   'empty',  'empty'],
            ['wall',     'empty',   'hole-6',  'empty',   'srv-3',   'empty',   'hole-7',  'empty',  'wall'],
            ['empty',    'empty',   'empty',   'empty',   'empty',   'empty',   'empty',   'srv-bonus','empty'],
            ['wall',     'wall',    'empty',   'empty',   'empty',   'wall',    'empty',   'empty',  'target']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway':   { label: 'GATEWAY',      abbr: 'GTW', ip: '10.290.0.1',  desc: 'Entry — familiar terrain, new capabilities',  ports: ['22/SSH','443/HTTPS'],        os: 'Cisco IOS 15.4' },
        'router':    { label: 'ROUTER',       abbr: 'RTR', ip: '10.290.0.2',  desc: 'Core router',                                ports: ['22/SSH','179/BGP'],         os: 'Juniper JunOS 21.4' },
        'srv-1':     { label: 'SRV-ALPHA',    abbr: 'SRA', ip: '10.290.1.11', desc: 'Server Alpha',                               ports: ['22/SSH','8080/HTTP'],        os: 'Ubuntu 24.04 LTS' },
        'srv-2':     { label: 'SRV-BRAVO',    abbr: 'SRB', ip: '10.290.1.12', desc: 'Server Bravo',                               ports: ['22/SSH','5432/PostgreSQL'],  os: 'RHEL 9.3' },
        'srv-3':     { label: 'SRV-CHARLIE',  abbr: 'SRC', ip: '10.290.1.13', desc: 'Server Charlie',                             ports: ['22/SSH','9200/ELASTIC'],     os: 'CentOS Stream 9' },
        'srv-bonus': { label: 'SRV-HIDDEN',   abbr: 'SRH', ip: '10.290.1.99', desc: 'Hidden server — only reachable with bridge', ports: ['22/SSH','8443/HTTPS'],      os: 'RHEL 9.3' },
        'target':    { label: 'EXTRACTION',   abbr: 'EXT', ip: '10.290.0.99', desc: 'Extraction point',                            ports: ['22/SSH','8443/HTTPS'],      os: 'RHEL 9.3' },

        'hole-1': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap — bridge or jump', ports: [] },
        'hole-2': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap — bridge or jump', ports: [] },
        'hole-3': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap — bridge or jump', ports: [] },
        'hole-4': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap — bridge or jump', ports: [] },
        'hole-5': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap — bridge or jump', ports: [] },
        'hole-6': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap — bridge or jump', ports: [] },
        'hole-7': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap guarding bonus server — bridge required', ports: [] },
        'trap-1': { label: 'HONEYPOT', abbr: 'HP1', ip: '10.290.0.200', desc: 'Decoy', ports: ['22/SSH-FAKE'], os: 'Honeyd [TRAP]' }
    },

    traps: ['trap-1'],
    obstacles: { holes: ['hole-1', 'hole-2', 'hole-3', 'hole-4', 'hole-5', 'hole-6', 'hole-7'] },
    gates: {},

    objectives: [
        { id: 'obj_0', label: 'BRIDGE -- Permanently bridge 4+ holes',             check: 'nodesDiscovered.size >= 8' },
        { id: 'obj_1', label: 'INTEL -- nmap all 3 standard servers',              check: 'nmapTargets.has("srv-1") && nmapTargets.has("srv-2") && nmapTargets.has("srv-3")' },
        { id: 'obj_2', label: 'BONUS -- Reach the hidden server (bridge required)',check: 'nmapTargets.has("srv-bonus")' },
        { id: 'obj_3', label: 'EXTRACTION -- Reach extraction point',              check: 'nodesDiscovered.has("target")' }
    ],

    integrity: 5,
    completion: { title: 'BACKTRACK: PIT STOP', subtitle: 'Bridge mastered. Hidden server found. The loop begins.', storageKey: 'hexworth_operator_python29' }
};
