/* ================================================================
   PYTHON-20 / FIRESTORM -- Mission Config
   ================================================================
   FIRES introduced. 8x8 grid.
   Student encounters fires for the first time — a third obstacle type.
   The if/elif chain grows: trap → hole → fire.
   Fires block passage and damage on contact, cleared by extinguish().

   GRID (8x8) — fires along key corridors, holes and traps mixed in
   ================================================================ */

var PYTHON_20_CONFIG = {
    id: 'python-20',
    title: 'PYTHON-20 / FIRESTORM',
    subtitle: 'New threat: fire. Three obstacle types. Three responses.',
    category: 'python-ops',
    difficulty: 3,
    inputMode: 'python',
    agent: { tier: 3 },

    grid: {
        rows: 8, cols: 8,
        cells: [
            ['gateway',  'empty',   'empty',   'fire-1',  'empty',   'empty',   'empty',  'wall'],
            ['empty',    'empty',   'router',  'empty',   'empty',   'hole-1',  'empty',  'empty'],
            ['empty',    'trap-1',  'empty',   'empty',   'empty',   'empty',   'srv-1',  'wall'],
            ['wall',     'empty',   'empty',   'fire-2',  'empty',   'empty',   'empty',  'empty'],
            ['empty',    'hole-2',  'empty',   'empty',   'switch',  'empty',   'fire-3', 'wall'],
            ['empty',    'empty',   'empty',   'empty',   'empty',   'empty',   'empty',  'empty'],
            ['wall',     'empty',   'trap-2',  'empty',   'srv-2',   'empty',   'empty',  'wall'],
            ['wall',     'wall',    'empty',   'empty',   'empty',   'wall',    'empty',  'target']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway': { label: 'GATEWAY',    abbr: 'GTW', ip: '10.200.0.1',  desc: 'Entry point',                     ports: ['22/SSH','443/HTTPS'],              os: 'Cisco IOS 15.4' },
        'router':  { label: 'ROUTER',     abbr: 'RTR', ip: '10.200.0.2',  desc: 'Core router',                     ports: ['22/SSH','179/BGP'],               os: 'Juniper JunOS 21.4' },
        'switch':  { label: 'SWITCH',     abbr: 'SWT', ip: '10.200.0.5',  desc: 'Distribution switch',             ports: ['22/SSH','161/SNMP'],              os: 'Cisco Catalyst 9300' },
        'srv-1':   { label: 'SRV-ALPHA',  abbr: 'SRA', ip: '10.200.1.11', desc: 'Server Alpha',                    ports: ['22/SSH','8080/HTTP'],              os: 'Ubuntu 24.04 LTS' },
        'srv-2':   { label: 'SRV-BRAVO',  abbr: 'SRB', ip: '10.200.1.12', desc: 'Server Bravo',                    ports: ['22/SSH','5432/PostgreSQL'],        os: 'RHEL 9.3' },
        'target':  { label: 'EXTRACTION', abbr: 'EXT', ip: '10.200.0.99', desc: 'Extraction point',                 ports: ['22/SSH','8443/HTTPS'],            os: 'RHEL 9.3' },

        /* 3 fires — NEW obstacle. Cannot be jumped or swept. Must be extinguished. */
        'fire-1':  { label: 'FIRE',       abbr: 'FIR', ip: null, desc: 'Active breach — extinguish to pass',   ports: [] },
        'fire-2':  { label: 'FIRE',       abbr: 'FIR', ip: null, desc: 'Thermal barrier — extinguish to pass', ports: [] },
        'fire-3':  { label: 'FIRE',       abbr: 'FIR', ip: null, desc: 'Burning link — extinguish to pass',    ports: [] },

        /* 2 holes — familiar from L18-19 */
        'hole-1':  { label: 'HOLE',       abbr: 'HLE', ip: null, desc: 'Network gap — jump to cross',          ports: [] },
        'hole-2':  { label: 'HOLE',       abbr: 'HLE', ip: null, desc: 'Broken bridge — jump to cross',        ports: [] },

        /* 2 traps — familiar from Act I */
        'trap-1':  { label: 'HONEYPOT',   abbr: 'HP1', ip: '10.200.0.200', desc: 'Decoy west',                 ports: ['22/SSH-FAKE'],    os: 'Honeyd [TRAP]' },
        'trap-2':  { label: 'IDS-SENSOR', abbr: 'IDS', ip: '10.200.0.201', desc: 'IDS south',                  ports: ['514/SYSLOG'],     os: 'Snort [TRAP]' }
    },

    traps: ['trap-1', 'trap-2'],

    obstacles: {
        holes: ['hole-1', 'hole-2'],
        fires: ['fire-1', 'fire-2', 'fire-3']
    },

    gates: {},

    objectives: [
        { id: 'obj_0', label: 'NAVIGATE -- Extinguish all 3 fires',               check: 'nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2") && nodesDiscovered.has("fire-3")' },
        { id: 'obj_1', label: 'NAVIGATE -- Cross both holes safely',               check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2")' },
        { id: 'obj_2', label: 'INTEL -- nmap both servers',                        check: 'nmapTargets.has("srv-1") && nmapTargets.has("srv-2")' },
        { id: 'obj_3', label: 'EXTRACTION -- Reach the extraction point',          check: 'nodesDiscovered.has("target")' },
        { id: 'obj_4', label: 'STEALTH -- 3+ integrity remaining',                check: 'integrity >= 3' }
    ],

    integrity: 5,

    completion: {
        title: 'FIRESTORM',
        subtitle: 'Fires extinguished. Three obstacle types mastered.',
        storageKey: 'hexworth_operator_python20'
    }
};
