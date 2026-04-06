/* ================================================================
   JS-18 / PIT STOP -- Mission Config
   ================================================================
   Tier 4 mission. 7x7 grid -- 49 cells.
   FIRST OBSTACLE LEVEL for JavaScript. Introduces HOLES.
   The student's first encounter with an obstacle that requires a
   specific countermeasure: agent.jump(direction).

   DESIGN RATIONALE:
   - Gentle introduction to obstacles -- holes only, no fires, no enemies
   - 3 holes placed along direct paths, forcing detours or jumps
   - Scan results reveal holes by name (contains 'HOLE')
   - Student writes their first if-check against scan data
   - 4 servers to discover -- enough to require crossing multiple holes
   - No traps, no gates -- pure focus on the new mechanic

   JS SKILL: Obstacle detection + conditional response
   - Scan results include obstacle nodes with names containing 'HOLE'
   - Student must check node.name.includes('HOLE') before moving
   - If hole detected, call agent.jump(direction) instead of agent.move()
   - First time an if statement is REQUIRED to survive

   REFERENCE SOLUTION:
     let results = agent.scan();
     for (let node of results) {
         if (node.name.includes('HOLE')) {
             agent.jump(node.direction);
         } else {
             agent.move(node.direction);
         }
     }

   WHY THIS WORKS:
   - 3 holes are clearly visible in scan results
   - Student can't brute-force past them -- move() into a hole costs integrity
   - The if/else pattern is simple: hole = jump, anything else = move
   - Builds the muscle memory for obstacle handling before complexity increases

   GRID LAYOUT (7x7):
     [start]    [empty]    [hole-1]   [empty]    [server-a] [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [server-b] [empty]    [empty]    [empty]
     [empty]    [hole-2]   [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [server-c] [empty]
     [empty]    [empty]    [empty]    [hole-3]   [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [server-d] [empty]

   3 holes blocking natural paths. 4 servers along a winding route.
   ================================================================ */

var JS_18_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-18',
    title: 'JS-18 / PIT STOP',
    subtitle: 'New threat: holes. Move won\'t cut it. Learn to jump.',
    category: 'javascript-ops',
    difficulty: 2,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 2 = scan, move, jump) -- */
    agent: { tier: 2 },

    /* -- 7x7 Grid -- */
    grid: {
        rows: 7, cols: 7,
        cells: [
            /* Row 0 */ ['gateway',  'empty',    'hole-1',   'empty',    'server-a', 'empty',    'empty'],
            /* Row 1 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 2 */ ['empty',    'empty',    'empty',    'server-b', 'empty',    'empty',    'empty'],
            /* Row 3 */ ['empty',    'hole-2',   'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 4 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'server-c', 'empty'],
            /* Row 5 */ ['empty',    'empty',    'empty',    'hole-3',   'empty',    'empty',    'empty'],
            /* Row 6 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'server-d', 'empty']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':  { label: 'GATEWAY',       abbr: 'GTW', ip: '10.180.1.1',   desc: 'Edge router -- your insertion point',                  ports: ['22/SSH', '443/HTTPS'],                    os: 'Cisco ASA 5516-X' },

        /* 4 target servers -- industrial control network */
        'server-a': { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.180.1.10',  desc: 'HMI workstation -- plant floor interface',             ports: ['22/SSH', '80/HTTP', '502/MODBUS'],        os: 'Windows 10 IoT Enterprise' },
        'server-b': { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.180.1.11',  desc: 'Historian server -- process data archive',             ports: ['22/SSH', '1433/MSSQL', '8080/HTTP'],      os: 'Windows Server 2022' },
        'server-c': { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.180.1.12',  desc: 'PLC gateway -- programmable logic controllers',        ports: ['22/SSH', '44818/EtherNet-IP'],            os: 'Embedded Linux 5.15' },
        'server-d': { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.180.1.13',  desc: 'SCADA master -- supervisory control station',          ports: ['22/SSH', '443/HTTPS', '20000/DNP3'],      os: 'RHEL 9.3' },

        /* 3 holes -- NEW obstacle type. Cannot be moved through. Must be jumped. */
        'hole-1':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Gap in network fabric -- jump to cross',                        ports: [] },
        'hole-2':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Severed connection segment -- jump to cross',                   ports: [] },
        'hole-3':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Missing link in backbone -- jump to cross',                     ports: [] }
    },

    /* No traps -- focus purely on holes */
    traps: [],

    /* NEW: obstacles field -- defines hole cell types */
    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3']
    },

    /* No gates -- pure obstacle navigation */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER ALPHA -- Find the HMI workstation',           check: 'nodesDiscovered.has("server-a")' },
        { id: 'obj_1', label: 'DISCOVER BRAVO -- Find the historian server',           check: 'nodesDiscovered.has("server-b")' },
        { id: 'obj_2', label: 'DISCOVER CHARLIE -- Find the PLC gateway',             check: 'nodesDiscovered.has("server-c")' },
        { id: 'obj_3', label: 'DISCOVER DELTA -- Find the SCADA master',              check: 'nodesDiscovered.has("server-d")' },
        { id: 'obj_4', label: 'NAVIGATE -- Jump all 3 holes safely',                  check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3")' }
    ],

    /* Generous integrity -- first obstacle level */
    integrity: 4,

    /* -- Completion screen -- */
    completion: {
        title: 'PIT STOP',
        subtitle: 'Three holes jumped. Four servers discovered. Obstacles introduced.',
        storageKey: 'hexworth_operator_js18'
    }
};
