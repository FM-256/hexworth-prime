/* ================================================================
   JS-42 / EVENT PATTERNS -- Mission Config
   ================================================================
   Tier 6 mission. 11x11 grid -- 121 cells.
   Event-driven programming patterns. The student builds a custom
   event dispatcher using Map -- threat type maps to handler function.

   DESIGN RATIONALE:
   - 11x11 grid with heavy obstacle density: 4 holes + 3 fires + 3 enemies
   - 10 total obstacles -- highest density yet
   - Student MUST build an event dispatcher pattern to stay organized
   - Without a dispatcher, the if/else chain becomes unmanageable
   - Map-based dispatch: handlers.set('HOLE', dir => agent.jump(dir))
   - Then: handlers.get(threatType)(direction) -- one-line dispatch
   - 5 servers + extraction point

   JS SKILL: Event-driven dispatch patterns
   - Build a Map of event handlers: type -> async function
   - Register handlers before the scan loop
   - On each scan result, detect type and dispatch to registered handler
   - This is the Observer/Strategy pattern in miniature
   - Foundation for real event systems: DOM events, Node.js EventEmitter

   REFERENCE SOLUTION:
     async function eventDriven() {
         // Register event handlers
         const handlers = new Map();
         handlers.set('HOLE', async (dir) => await agent.jump(dir));
         handlers.set('FIRE', async (dir) => await agent.extinguish(dir));
         handlers.set('ENEMY', async (dir) => await agent.fight(dir));

         let results = await agent.scan();
         for (const { name, direction } of results) {
             // Detect threat type
             const type = ['HOLE', 'FIRE', 'ENEMY'].find(t => name.includes(t));

             // Dispatch to registered handler or default move
             if (type && handlers.has(type)) {
                 await handlers.get(type)(direction);
             } else {
                 await agent.move(direction);
             }
         }
     }
     eventDriven();

   WHY EVENT PATTERNS:
   - if/else chains don't scale -- 10 obstacles need organized dispatch
   - Map-based dispatch is O(1) lookup vs O(n) if/else chain
   - Separates REGISTRATION from EXECUTION -- clean architecture
   - Real-world: Express.js route handlers, React event handlers, Redux reducers
   - Foundation for JS-42+ missions with increasing complexity

   GRID LAYOUT (11x11):
     [start]    [empty]    [hole-1]   [empty]    [empty]    [enemy-1]  [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [fire-1]   [empty]    [empty]    [empty]    [server-a] [empty]    [empty]    [wall]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [hole-2]   [empty]    [empty]    [wall]     [empty]    [enemy-2]  [empty]    [empty]    [server-b] [empty]
     [empty]    [empty]    [empty]    [empty]    [wall]     [empty]    [empty]    [fire-2]   [empty]    [empty]    [empty]
     [wall]     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [wall]
     [empty]    [empty]    [fire-3]   [empty]    [empty]    [hole-3]   [empty]    [empty]    [server-c] [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [enemy-3]  [empty]    [empty]    [empty]    [empty]    [wall]     [empty]    [empty]    [server-d] [empty]
     [empty]    [empty]    [empty]    [hole-4]   [empty]    [empty]    [wall]     [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-e] [target]

   4 holes + 3 fires + 3 enemies = 10 obstacles. Event dispatch pattern required.
   ================================================================ */

var JS_42_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-42',
    title: 'JS-42 / EVENT PATTERNS',
    subtitle: 'Build a dispatcher. Register handlers. React to threats systematically.',
    category: 'javascript-ops',
    difficulty: 4,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 4 = full capabilities) -- */
    agent: { tier: 4 },

    /* -- 11x11 Grid -- */
    grid: {
        rows: 11, cols: 11,
        cells: [
            /* Row 0  */ ['gateway',  'empty',    'hole-1',   'empty',    'empty',    'enemy-1',  'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 1  */ ['empty',    'empty',    'empty',    'fire-1',   'empty',    'empty',    'empty',    'server-a', 'empty',    'empty',    'wall'],
            /* Row 2  */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 3  */ ['empty',    'hole-2',   'empty',    'empty',    'wall',     'empty',    'enemy-2',  'empty',    'empty',    'server-b', 'empty'],
            /* Row 4  */ ['empty',    'empty',    'empty',    'empty',    'wall',     'empty',    'empty',    'fire-2',   'empty',    'empty',    'empty'],
            /* Row 5  */ ['wall',     'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'wall'],
            /* Row 6  */ ['empty',    'empty',    'fire-3',   'empty',    'empty',    'hole-3',   'empty',    'empty',    'server-c', 'empty',    'empty'],
            /* Row 7  */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 8  */ ['empty',    'enemy-3',  'empty',    'empty',    'empty',    'empty',    'wall',     'empty',    'empty',    'server-d', 'empty'],
            /* Row 9  */ ['empty',    'empty',    'empty',    'hole-4',   'empty',    'empty',    'wall',     'empty',    'empty',    'empty',    'empty'],
            /* Row 10 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-e', 'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':  { label: 'GATEWAY',       abbr: 'GTW', ip: '10.420.1.1',   desc: 'Event dispatch gateway -- register handlers first',      ports: ['22/SSH', '443/HTTPS'],                    os: 'Arista 7280R3' },

        /* 5 target servers -- event-driven architecture */
        'server-a': { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.420.1.10',  desc: 'Message broker -- event queue ingestion',                ports: ['22/SSH', '5672/AMQP', '15672/MGMT'],      os: 'Ubuntu 24.04 LTS' },
        'server-b': { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.420.1.11',  desc: 'Event processor -- stream computation',                  ports: ['22/SSH', '9092/KAFKA', '8083/CONNECT'],   os: 'Debian 12 Bookworm' },
        'server-c': { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.420.1.12',  desc: 'State store -- event sourcing database',                 ports: ['22/SSH', '2181/ZOOKEEPER', '9200/ELASTIC'], os: 'CentOS Stream 9' },
        'server-d': { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.420.1.13',  desc: 'Replay engine -- event log reprocessing',                ports: ['22/SSH', '443/HTTPS', '6379/REDIS'],      os: 'RHEL 9.3' },
        'server-e': { label: 'SERVER-ECHO',    abbr: 'SRE', ip: '10.420.1.14',  desc: 'Projection service -- materialized views',               ports: ['22/SSH', '443/HTTPS', '5601/KIBANA'],     os: 'Windows Server 2022' },

        /* Extraction point */
        'target':   { label: 'EXTRACTION',     abbr: 'EXT', ip: '10.420.1.99',  desc: 'Extraction point -- all events dispatched',              ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* 3 enemies -- fight required */
        'enemy-1':  { label: 'ENEMY SPAMMER',   abbr: 'SPM', ip: null, desc: 'Event spammer -- fight to neutralize',                            ports: [] },
        'enemy-2':  { label: 'ENEMY INJECTOR',   abbr: 'INJ', ip: null, desc: 'Event injector -- fight to neutralize',                           ports: [] },
        'enemy-3':  { label: 'ENEMY REPLAYER',   abbr: 'RPL', ip: null, desc: 'Replay attacker -- fight to neutralize',                          ports: [] },

        /* 4 holes -- jump required */
        'hole-1':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Queue gap -- jump to cross',                                       ports: [] },
        'hole-2':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Stream void -- jump to cross',                                     ports: [] },
        'hole-3':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Partition gap -- jump to cross',                                   ports: [] },
        'hole-4':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Consumer lag void -- jump to cross',                               ports: [] },

        /* 3 fires -- extinguish required */
        'fire-1':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Event storm fire -- extinguish to pass',                           ports: [] },
        'fire-2':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Backpressure blaze -- extinguish to pass',                         ports: [] },
        'fire-3':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Dead letter fire -- extinguish to pass',                           ports: [] }
    },

    /* No traps */
    traps: [],

    /* Obstacles: 4 holes + 3 fires + 3 enemies */
    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3', 'hole-4'],
        fires: ['fire-1', 'fire-2', 'fire-3'],
        enemies: ['enemy-1', 'enemy-2', 'enemy-3']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER -- Map all 5 event architecture servers',          check: 'nodesDiscovered.has("server-a") && nodesDiscovered.has("server-b") && nodesDiscovered.has("server-c") && nodesDiscovered.has("server-d") && nodesDiscovered.has("server-e")' },
        { id: 'obj_1', label: 'DISPATCH -- Handle all 10 obstacles via event handlers',    check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3") && nodesDiscovered.has("hole-4") && nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2") && nodesDiscovered.has("fire-3") && nodesDiscovered.has("enemy-1") && nodesDiscovered.has("enemy-2") && nodesDiscovered.has("enemy-3")' },
        { id: 'obj_2', label: 'EXTRACTION -- Reach the extraction point',                  check: 'nodesDiscovered.has("target")' },
        { id: 'obj_3', label: 'STEALTH -- 5+ integrity remaining',                         check: 'integrity >= 5' }
    ],

    /* 8 integrity -- 10 obstacles, needs organized dispatch */
    integrity: 8,

    /* -- Completion screen -- */
    completion: {
        title: 'EVENT PATTERNS',
        subtitle: 'Event dispatch mastered. 10 obstacles handled through registered handlers. Clean architecture.',
        storageKey: 'hexworth_operator_js42'
    }
};
