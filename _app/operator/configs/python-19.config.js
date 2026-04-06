/* ================================================================
   PYTHON-19 / CHASM RUN -- Mission Config
   ================================================================
   Hole mastery level. 8x8 grid.
   5 holes as the primary obstacle. Student perfects the jump pattern.
   Holes are everywhere — the safe_advance() function must jump
   reliably on every path.

   GRID (8x8) — holes along every major corridor
   ================================================================ */

var PYTHON_19_CONFIG = {
    id: 'python-19',
    title: 'PYTHON-19 / CHASM RUN',
    subtitle: 'Holes everywhere. Jump or fall. Perfect your technique.',
    category: 'python-ops',
    difficulty: 3,
    inputMode: 'python',
    agent: { tier: 3 },

    grid: {
        rows: 8, cols: 8,
        cells: [
            ['gateway',  'empty',   'hole-1',  'empty',   'empty',   'empty',   'empty',  'wall'],
            ['empty',    'empty',   'empty',   'empty',   'hole-2',  'empty',   'srv-1',  'empty'],
            ['empty',    'trap-1',  'empty',   'empty',   'empty',   'empty',   'empty',  'wall'],
            ['wall',     'empty',   'empty',   'hole-3',  'empty',   'router',  'empty',  'empty'],
            ['empty',    'empty',   'empty',   'empty',   'empty',   'empty',   'hole-4', 'wall'],
            ['empty',    'empty',   'srv-2',   'empty',   'empty',   'empty',   'empty',  'empty'],
            ['wall',     'empty',   'empty',   'empty',   'hole-5',  'empty',   'srv-3',  'wall'],
            ['wall',     'wall',    'empty',   'empty',   'empty',   'wall',    'empty',  'target']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway': { label: 'GATEWAY',    abbr: 'GTW', ip: '10.190.0.1',  desc: 'Entry point',                     ports: ['22/SSH','443/HTTPS'],              os: 'Cisco IOS 15.4' },
        'router':  { label: 'ROUTER',     abbr: 'RTR', ip: '10.190.0.2',  desc: 'Core router',                     ports: ['22/SSH','179/BGP'],               os: 'Juniper JunOS 21.4' },
        'srv-1':   { label: 'SRV-ALPHA',  abbr: 'SRA', ip: '10.190.1.11', desc: 'Server Alpha',                    ports: ['22/SSH','8080/HTTP'],              os: 'Ubuntu 24.04 LTS' },
        'srv-2':   { label: 'SRV-BRAVO',  abbr: 'SRB', ip: '10.190.1.12', desc: 'Server Bravo',                    ports: ['22/SSH','5432/PostgreSQL'],        os: 'RHEL 9.3' },
        'srv-3':   { label: 'SRV-CHARLIE',abbr: 'SRC', ip: '10.190.1.13', desc: 'Server Charlie',                  ports: ['22/SSH','9200/ELASTIC'],           os: 'CentOS Stream 9' },
        'target':  { label: 'EXTRACTION', abbr: 'EXT', ip: '10.190.0.99', desc: 'Extraction point',                 ports: ['22/SSH','8443/HTTPS'],            os: 'RHEL 9.3' },

        'hole-1':  { label: 'HOLE',       abbr: 'HLE', ip: null, desc: 'Network gap — jump to cross', ports: [] },
        'hole-2':  { label: 'HOLE',       abbr: 'HLE', ip: null, desc: 'Severed link — jump to cross', ports: [] },
        'hole-3':  { label: 'HOLE',       abbr: 'HLE', ip: null, desc: 'Missing segment — jump to cross', ports: [] },
        'hole-4':  { label: 'HOLE',       abbr: 'HLE', ip: null, desc: 'Broken bridge — jump to cross', ports: [] },
        'hole-5':  { label: 'HOLE',       abbr: 'HLE', ip: null, desc: 'Collapsed path — jump to cross', ports: [] },

        'trap-1':  { label: 'HONEYPOT',   abbr: 'HP1', ip: '10.190.0.200', desc: 'Decoy',                          ports: ['22/SSH-FAKE'],                    os: 'Honeyd [TRAP]' }
    },

    traps: ['trap-1'],

    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3', 'hole-4', 'hole-5']
    },

    gates: {},

    objectives: [
        { id: 'obj_0', label: 'NAVIGATE -- Cross all 5 holes safely',             check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3") && nodesDiscovered.has("hole-4") && nodesDiscovered.has("hole-5")' },
        { id: 'obj_1', label: 'INTEL -- nmap all 3 servers',                      check: 'nmapTargets.has("srv-1") && nmapTargets.has("srv-2") && nmapTargets.has("srv-3")' },
        { id: 'obj_2', label: 'EXTRACTION -- Reach the extraction point',          check: 'nodesDiscovered.has("target")' },
        { id: 'obj_3', label: 'STEALTH -- 3+ integrity remaining',                check: 'integrity >= 3' }
    ],

    integrity: 5,

    completion: {
        title: 'CHASM RUN',
        subtitle: 'Five chasms crossed. Jump technique perfected.',
        storageKey: 'hexworth_operator_python19'
    }
};
