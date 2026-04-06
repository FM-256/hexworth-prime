/* ================================================================
   JS-30 / CLOSURE FACTORY -- Mission Config
   ================================================================
   Tier 5 mission. 10x10 grid -- 100 cells.
   CLOSURES introduced. The student builds handler functions using
   the factory pattern: function makeHandler(tool) returns a
   specialized handler for a specific obstacle type.

   DESIGN RATIONALE:
   - Multiple obstacle types demand repetitive if/else branching
   - Closures eliminate redundancy: one factory, many handlers
   - function makeHandler(tool) { return dir => tool(dir); }
   - The returned function "closes over" the tool parameter
   - 4 holes, 3 fires, 2 enemies -- enough variety to justify
     creating specialized handlers via the factory
   - 4 servers require full grid traversal

   JS SKILL: CLOSURES -- function factories
   - A closure is a function that remembers its creation context
   - makeHandler(agent.bridge) returns a function that bridges
   - makeHandler(agent.extinguish) returns a function that extinguishes
   - The inner function has permanent access to the outer 'tool' param
   - This is the factory pattern -- one function produces many

   REFERENCE SOLUTION:
     // Closure factory -- one function to rule them all
     function makeHandler(tool) {
         return function(dir) { return tool(dir); };
     }

     // Create specialized handlers via closures
     const handleHole = makeHandler(agent.bridge);
     const handleFire = makeHandler(agent.extinguish);
     const handleEnemy = makeHandler(agent.fight);

     async function closureFactory() {
         const results = await agent.scan();
         for (const node of results) {
             const { name, direction } = node;
             if (name.includes('HOLE'))       await handleHole(direction);
             else if (name.includes('FIRE'))  await handleFire(direction);
             else if (name.includes('ENEMY')) await handleEnemy(direction);
             else await agent.move(direction);
         }
     }
     closureFactory();

   WHY CLOSURES MATTER:
   - Eliminates code duplication (DRY principle)
   - The returned function carries its context forever
   - Foundation for callbacks, event handlers, middleware
   - Real-world parallel: Express middleware factories,
     React HOCs, event handler creators

   GRID LAYOUT (10x10):
     [start]  [empty]  [hole-1] [empty]  [empty]  [fire-1] [empty]  [empty]  [empty]  [empty]
     [empty]  [empty]  [empty]  [empty]  [server-a][empty]  [empty]  [hole-2] [empty]  [wall]
     [empty]  [fire-2] [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]
     [empty]  [empty]  [empty]  [enemy-1][empty]  [empty]  [server-b][empty]  [empty]  [empty]
     [wall]   [empty]  [empty]  [empty]  [empty]  [hole-3] [empty]  [empty]  [empty]  [empty]
     [empty]  [empty]  [empty]  [fire-3] [empty]  [empty]  [empty]  [empty]  [server-c][empty]
     [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [hole-4] [empty]  [empty]  [empty]
     [empty]  [enemy-2][empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [wall]
     [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [server-d][empty]  [empty]
     [empty]  [empty]  [empty]  [empty]  [empty]  [wall]   [empty]  [empty]  [empty]  [target]

   4 holes + 3 fires + 2 enemies. Factory pattern handles them all.
   ================================================================ */

var JS_30_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-30',
    title: 'JS-30 / CLOSURE FACTORY',
    subtitle: 'One factory function. Many handlers. Closures unlock the pattern.',
    category: 'javascript-ops',
    difficulty: 4,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 4 = full capabilities) -- */
    agent: { tier: 4 },

    /* -- 10x10 Grid -- */
    grid: {
        rows: 10, cols: 10,
        cells: [
            /* Row 0 */ ['gateway',  'empty',    'hole-1',   'empty',    'empty',    'fire-1',   'empty',    'empty',    'empty',    'empty'],
            /* Row 1 */ ['empty',    'empty',    'empty',    'empty',    'server-a', 'empty',    'empty',    'hole-2',   'empty',    'wall'],
            /* Row 2 */ ['empty',    'fire-2',   'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 3 */ ['empty',    'empty',    'empty',    'enemy-1',  'empty',    'empty',    'server-b', 'empty',    'empty',    'empty'],
            /* Row 4 */ ['wall',     'empty',    'empty',    'empty',    'empty',    'hole-3',   'empty',    'empty',    'empty',    'empty'],
            /* Row 5 */ ['empty',    'empty',    'empty',    'fire-3',   'empty',    'empty',    'empty',    'empty',    'server-c', 'empty'],
            /* Row 6 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'hole-4',   'empty',    'empty',    'empty'],
            /* Row 7 */ ['empty',    'enemy-2',  'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'wall'],
            /* Row 8 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-d', 'empty',    'empty'],
            /* Row 9 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'wall',     'empty',    'empty',    'empty',    'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':  { label: 'GATEWAY',       abbr: 'GTW', ip: '10.300.1.1',   desc: 'Factory perimeter -- closures are forged here',                ports: ['22/SSH', '443/HTTPS'],                    os: 'Cisco Firepower 4110' },

        /* 4 target servers -- closure factory network */
        'server-a': { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.300.1.10',  desc: 'Template engine -- function blueprint store',                  ports: ['22/SSH', '443/HTTPS', '8080/HTTP'],       os: 'Ubuntu 24.04 LTS' },
        'server-b': { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.300.1.11',  desc: 'Scope analyzer -- lexical environment mapper',                 ports: ['22/SSH', '5432/PostgreSQL', '9090/API'],  os: 'Debian 12 Bookworm' },
        'server-c': { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.300.1.12',  desc: 'Handler registry -- generated function catalog',               ports: ['22/SSH', '443/HTTPS', '9200/ELASTIC'],    os: 'CentOS Stream 9' },
        'server-d': { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.300.1.13',  desc: 'Dispatch controller -- routes handlers to threats',            ports: ['22/SSH', '443/HTTPS', '8443/MGMT'],       os: 'RHEL 9.3' },

        /* Extraction point */
        'target':   { label: 'EXTRACTION',     abbr: 'EXT', ip: '10.300.1.99',  desc: 'Extraction point -- closure factory mapped',                   ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* 4 holes -- bridge (permanent) or jump (per-transit) */
        'hole-1':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Network gap -- use handleHole closure',                                  ports: [] },
        'hole-2':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Backbone void -- use handleHole closure',                                ports: [] },
        'hole-3':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Core fracture -- use handleHole closure',                                ports: [] },
        'hole-4':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Severed link -- use handleHole closure',                                 ports: [] },

        /* 3 fires -- extinguish or fireproof */
        'fire-1':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Thermal breach -- use handleFire closure',                               ports: [] },
        'fire-2':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Power surge -- use handleFire closure',                                  ports: [] },
        'fire-3':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Circuit overload -- use handleFire closure',                             ports: [] },

        /* 2 enemies -- fight or terminate */
        'enemy-1':  { label: 'ENEMY ROOTKIT',  abbr: 'RKT', ip: null, desc: 'Persistent rootkit -- use handleEnemy closure',                          ports: [] },
        'enemy-2':  { label: 'ENEMY RANSOMWARE',abbr: 'RNS', ip: null, desc: 'Ransomware payload -- use handleEnemy closure',                        ports: [] }
    },

    /* No traps */
    traps: [],

    /* Obstacles: mixed types for closure handlers */
    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3', 'hole-4'],
        fires: ['fire-1', 'fire-2', 'fire-3'],
        enemies: ['enemy-1', 'enemy-2']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'FACTORY -- Create closure handlers for each obstacle type',check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("fire-1") && nodesDiscovered.has("enemy-1")' },
        { id: 'obj_1', label: 'DISCOVER -- Map all 4 factory servers',                    check: 'nodesDiscovered.has("server-a") && nodesDiscovered.has("server-b") && nodesDiscovered.has("server-c") && nodesDiscovered.has("server-d")' },
        { id: 'obj_2', label: 'CLEAR -- Handle all 9 obstacles with closures',            check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3") && nodesDiscovered.has("hole-4") && nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2") && nodesDiscovered.has("fire-3") && nodesDiscovered.has("enemy-1") && nodesDiscovered.has("enemy-2")' },
        { id: 'obj_3', label: 'EXTRACTION -- Reach extraction point',                     check: 'nodesDiscovered.has("target")' },
        { id: 'obj_4', label: 'STEALTH -- 4+ integrity remaining',                        check: 'integrity >= 4' }
    ],

    /* 6 integrity -- standard Tier 5 */
    integrity: 6,

    /* -- Completion screen -- */
    completion: {
        title: 'CLOSURE FACTORY',
        subtitle: 'Closures mastered. One factory, many handlers. Functions that remember.',
        storageKey: 'hexworth_operator_js30'
    }
};
