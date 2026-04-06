/* ================================================================
   JS-36 / SPREAD TACTICS -- Mission Config
   ================================================================
   Tier 5 mission. 10x10 grid -- 100 cells.
   SPREAD OPERATOR introduced. Multiple arrays of threats need
   combining into a single processing pipeline.

   DESIGN RATIONALE:
   - 10x10 grid with all 3 obstacle types + locked doors
   - 3 holes, 3 fires, 3 enemies, 2 locked doors = 11 obstacles
   - Student scans and filters results into separate arrays
   - Spread operator merges them: [...holes, ...fires, ...enemies]
   - The merged array becomes a single processing queue
   - 2 keys + 2 locked doors add route planning complexity
   - 4 servers require full grid traversal

   JS SKILL: ... spread -- array merging for unified processing
   - const holes = results.filter(n => n.name.includes('HOLE'));
   - const fires = results.filter(n => n.name.includes('FIRE'));
   - const allThreats = [...holes, ...fires, ...enemies];
   - Spread copies elements into a new array, not references
   - Also works for object merging: { ...defaults, ...overrides }

   REFERENCE SOLUTION:
     async function spreadTactics() {
         const results = await agent.scan();

         // Classify threats into separate arrays
         const holes = results.filter(n => n.name.includes('HOLE'));
         const fires = results.filter(n => n.name.includes('FIRE'));
         const enemies = results.filter(n => n.name.includes('ENEMY'));

         // Spread into unified threat pipeline
         const allThreats = [...holes, ...fires, ...enemies];

         // Process the merged array
         for (const threat of allThreats) {
             const { name, direction } = threat;
             if (name.includes('HOLE'))       await agent.bridge(direction);
             else if (name.includes('FIRE'))  await agent.fireproof(direction);
             else if (name.includes('ENEMY')) await agent.terminate(direction);
         }

         // Handle remaining non-threat navigation
         const safe = results.filter(n =>
             !n.name.includes('HOLE') &&
             !n.name.includes('FIRE') &&
             !n.name.includes('ENEMY')
         );
         for (const node of safe) {
             if (node.name.includes('LOCKED')) await agent.unlock(node.direction);
             else await agent.move(node.direction);
         }
     }
     spreadTactics();

   WHY SPREAD OPERATOR:
   - Arrays from different sources often need merging
   - Spread is cleaner than .concat() and more readable
   - Foundation for: React state updates, Redux reducers,
     function arguments (...args), object composition
   - Real-world: merge API responses, combine log sources,
     aggregate sensor data from multiple feeds

   GRID LAYOUT (10x10):
     [start]  [empty]  [enemy-1][empty]  [key-1]  [empty]  [empty]  [empty]  [empty]  [empty]
     [empty]  [empty]  [empty]  [hole-1] [empty]  [empty]  [server-a][empty]  [empty]  [wall]
     [empty]  [fire-1] [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]
     [empty]  [empty]  [empty]  [empty]  [locked-1][empty] [server-b][empty]  [empty]  [empty]
     [empty]  [empty]  [enemy-2][empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [wall]
     [empty]  [empty]  [empty]  [fire-2] [empty]  [empty]  [empty]  [server-c][empty]  [empty]
     [empty]  [hole-2] [empty]  [empty]  [empty]  [enemy-3][empty]  [empty]  [key-2]  [empty]
     [empty]  [empty]  [empty]  [empty]  [fire-3] [empty]  [empty]  [empty]  [empty]  [empty]
     [empty]  [empty]  [empty]  [hole-3] [empty]  [empty]  [locked-2][empty] [server-d][empty]
     [empty]  [empty]  [empty]  [empty]  [empty]  [wall]   [empty]  [empty]  [empty]  [target]

   3 holes + 3 fires + 3 enemies + 2 locked doors. Spread merges them.
   ================================================================ */

var JS_36_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-36',
    title: 'JS-36 / SPREAD TACTICS',
    subtitle: 'Classify. Spread. Merge. One pipeline handles everything.',
    category: 'javascript-ops',
    difficulty: 4,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 4 = full capabilities) -- */
    agent: { tier: 4 },

    /* -- 10x10 Grid -- */
    grid: {
        rows: 10, cols: 10,
        cells: [
            /* Row 0 */ ['gateway',  'empty',    'enemy-1',  'empty',    'key-1',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 1 */ ['empty',    'empty',    'empty',    'hole-1',   'empty',    'empty',    'server-a', 'empty',    'empty',    'wall'],
            /* Row 2 */ ['empty',    'fire-1',   'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 3 */ ['empty',    'empty',    'empty',    'empty',    'locked-door-1','empty','server-b', 'empty',    'empty',    'empty'],
            /* Row 4 */ ['empty',    'empty',    'enemy-2',  'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'wall'],
            /* Row 5 */ ['empty',    'empty',    'empty',    'fire-2',   'empty',    'empty',    'empty',    'server-c', 'empty',    'empty'],
            /* Row 6 */ ['empty',    'hole-2',   'empty',    'empty',    'empty',    'enemy-3',  'empty',    'empty',    'key-2',    'empty'],
            /* Row 7 */ ['empty',    'empty',    'empty',    'empty',    'fire-3',   'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 8 */ ['empty',    'empty',    'empty',    'hole-3',   'empty',    'empty',    'locked-door-2','empty','server-d', 'empty'],
            /* Row 9 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'wall',     'empty',    'empty',    'empty',    'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':       { label: 'GATEWAY',       abbr: 'GTW', ip: '10.360.1.1',   desc: 'Tactical perimeter -- spread your resources',             ports: ['22/SSH', '443/HTTPS'],                    os: 'Cisco Firepower 4110' },

        /* 4 target servers -- data aggregation network */
        'server-a':      { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.360.1.10',  desc: 'Log aggregator -- multi-source data merge',               ports: ['22/SSH', '443/HTTPS', '514/SYSLOG'],      os: 'Ubuntu 24.04 LTS' },
        'server-b':      { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.360.1.11',  desc: 'Stream combiner -- real-time data pipeline',              ports: ['22/SSH', '9092/KAFKA', '9090/API'],       os: 'Debian 12 Bookworm' },
        'server-c':      { label: 'SERVER-CHARLIE',  abbr: 'SRC', ip: '10.360.1.12',  desc: 'Sensor array -- distributed collection points',          ports: ['22/SSH', '443/HTTPS', '9200/ELASTIC'],    os: 'CentOS Stream 9' },
        'server-d':      { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.360.1.13',  desc: 'Unified console -- merged data visualization',           ports: ['22/SSH', '443/HTTPS', '3000/GRAFANA'],    os: 'RHEL 9.3' },

        /* Extraction point */
        'target':        { label: 'EXTRACTION',     abbr: 'EXT', ip: '10.360.1.99',  desc: 'Extraction point -- all threats spread and handled',      ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* 2 keys -- auto-collected on entry */
        'key-1':         { label: 'ACCESS KEY',     abbr: 'KY1', ip: null, desc: 'Clearance alpha -- collected automatically',                        ports: [] },
        'key-2':         { label: 'ACCESS KEY',     abbr: 'KY2', ip: null, desc: 'Clearance bravo -- collected automatically',                        ports: [] },

        /* 2 locked doors */
        'locked-door-1': { label: 'LOCKED DOOR',    abbr: 'LK1', ip: null, desc: 'Security checkpoint alpha -- use key to open',                      ports: [] },
        'locked-door-2': { label: 'LOCKED DOOR',    abbr: 'LK2', ip: null, desc: 'Security checkpoint bravo -- use key to open',                      ports: [] },

        /* 3 holes */
        'hole-1':        { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Network gap -- bridge permanently',                                 ports: [] },
        'hole-2':        { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Core void -- bridge permanently',                                   ports: [] },
        'hole-3':        { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Backbone fracture -- bridge permanently',                           ports: [] },

        /* 3 fires */
        'fire-1':        { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Thermal breach -- fireproof permanently',                           ports: [] },
        'fire-2':        { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Power surge -- fireproof permanently',                              ports: [] },
        'fire-3':        { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Circuit overload -- fireproof permanently',                         ports: [] },

        /* 3 enemies */
        'enemy-1':       { label: 'ENEMY WORM',     abbr: 'WRM', ip: null, desc: 'Worm -- terminate permanently',                                    ports: [] },
        'enemy-2':       { label: 'ENEMY TROJAN',   abbr: 'TRJ', ip: null, desc: 'Trojan -- terminate permanently',                                  ports: [] },
        'enemy-3':       { label: 'ENEMY BACKDOOR', abbr: 'BKD', ip: null, desc: 'Backdoor -- terminate permanently',                                ports: [] }
    },

    /* No traps */
    traps: [],

    /* Obstacles: all types -- spread merges them */
    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3'],
        fires: ['fire-1', 'fire-2', 'fire-3'],
        enemies: ['enemy-1', 'enemy-2', 'enemy-3']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'COLLECT -- Find both access keys',                         check: 'nodesDiscovered.has("key-1") && nodesDiscovered.has("key-2")' },
        { id: 'obj_1', label: 'UNLOCK -- Open both locked doors',                         check: 'nodesDiscovered.has("locked-door-1") && nodesDiscovered.has("locked-door-2")' },
        { id: 'obj_2', label: 'SPREAD -- Handle all 9 obstacles via merged pipeline',     check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3") && nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2") && nodesDiscovered.has("fire-3") && nodesDiscovered.has("enemy-1") && nodesDiscovered.has("enemy-2") && nodesDiscovered.has("enemy-3")' },
        { id: 'obj_3', label: 'DISCOVER -- Map all 4 aggregation servers',                check: 'nodesDiscovered.has("server-a") && nodesDiscovered.has("server-b") && nodesDiscovered.has("server-c") && nodesDiscovered.has("server-d")' },
        { id: 'obj_4', label: 'EXTRACTION -- Reach extraction point',                     check: 'nodesDiscovered.has("target")' },
        { id: 'obj_5', label: 'STEALTH -- 4+ integrity remaining',                        check: 'integrity >= 4' }
    ],

    /* 7 integrity -- 11 obstacles + 2 locked doors */
    integrity: 7,

    /* -- Completion screen -- */
    completion: {
        title: 'SPREAD TACTICS',
        subtitle: 'Spread operator mastered. Arrays merged. One pipeline conquered all threats.',
        storageKey: 'hexworth_operator_js36'
    }
};
