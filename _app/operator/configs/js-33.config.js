/* ================================================================
   JS-33 / ERROR HANDLER -- Mission Config
   ================================================================
   Tier 5 mission. 10x10 grid -- 100 cells.
   TRY/CATCH introduced. Error handling for failed operations.
   Some actions may fail (moving into walls, wrong direction),
   and try/catch handles failures gracefully instead of crashing.

   DESIGN RATIONALE:
   - 10x10 grid with all 3 obstacle types + walls creating dead ends
   - 3 holes, 4 fires, 3 enemies -- mixed threat environment
   - Wall placement creates situations where moves will FAIL
   - Student wraps risky operations in try/catch blocks
   - catch block provides fallback logic (try another direction)
   - This is real-world error handling: API calls fail, network
     requests timeout, file operations throw -- try/catch saves you

   JS SKILL: try/catch -- error handling for failed operations
   - Operations that fail throw errors (move into wall, invalid direction)
   - try { riskyOp() } catch(e) { fallbackOp() }
   - The catch block receives the error object with .message
   - Student learns defensive coding: assume things will fail

   REFERENCE SOLUTION:
     async function errorHandler() {
         const results = await agent.scan();
         for (const node of results) {
             const { name, direction } = node;
             try {
                 if (name.includes('HOLE')) {
                     await agent.bridge(direction);
                 } else if (name.includes('FIRE')) {
                     await agent.fireproof(direction);
                 } else if (name.includes('ENEMY')) {
                     await agent.fight(direction);
                 } else {
                     await agent.move(direction);
                 }
             } catch (e) {
                 console.log('Operation failed: ' + e.message);
                 // Try alternative direction
                 try {
                     await agent.move('east');
                 } catch (e2) {
                     await agent.move('south');
                 }
             }
         }
     }
     errorHandler();

   WHY TRY/CATCH:
   - Real code fails. Networks drop. APIs return 500s. Files vanish.
   - try/catch is the fundamental error boundary in JavaScript
   - Without it, one failure crashes the entire program
   - With it, failures become recoverable events
   - Foundation for: Promise.catch(), async error handling, Express middleware

   GRID LAYOUT (10x10):
     [start]  [empty]  [wall]   [empty]  [fire-1] [empty]  [empty]  [empty]  [empty]  [empty]
     [empty]  [empty]  [empty]  [hole-1] [empty]  [empty]  [server-a][empty]  [empty]  [wall]
     [empty]  [enemy-1][empty]  [empty]  [empty]  [fire-2] [empty]  [empty]  [empty]  [empty]
     [wall]   [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [server-b][empty]  [wall]
     [empty]  [empty]  [fire-3] [empty]  [wall]   [empty]  [empty]  [empty]  [empty]  [empty]
     [empty]  [empty]  [empty]  [empty]  [hole-2] [empty]  [enemy-2][empty]  [empty]  [empty]
     [empty]  [fire-4] [empty]  [empty]  [empty]  [empty]  [empty]  [server-c][empty]  [wall]
     [wall]   [empty]  [empty]  [enemy-3][empty]  [empty]  [empty]  [empty]  [empty]  [empty]
     [empty]  [empty]  [empty]  [empty]  [hole-3] [empty]  [empty]  [server-d][empty]  [empty]
     [empty]  [empty]  [wall]   [empty]  [empty]  [wall]   [empty]  [empty]  [empty]  [target]

   3 holes + 4 fires + 3 enemies + walls creating dead ends.
   ================================================================ */

var JS_33_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-33',
    title: 'JS-33 / ERROR HANDLER',
    subtitle: 'Operations fail. Walls block. try/catch saves the mission.',
    category: 'javascript-ops',
    difficulty: 4,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 4 = full capabilities) -- */
    agent: { tier: 4 },

    /* -- 10x10 Grid -- */
    grid: {
        rows: 10, cols: 10,
        cells: [
            /* Row 0 */ ['gateway',  'empty',    'wall',     'empty',    'fire-1',   'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 1 */ ['empty',    'empty',    'empty',    'hole-1',   'empty',    'empty',    'server-a', 'empty',    'empty',    'wall'],
            /* Row 2 */ ['empty',    'enemy-1',  'empty',    'empty',    'empty',    'fire-2',   'empty',    'empty',    'empty',    'empty'],
            /* Row 3 */ ['wall',     'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-b', 'empty',    'wall'],
            /* Row 4 */ ['empty',    'empty',    'fire-3',   'empty',    'wall',     'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 5 */ ['empty',    'empty',    'empty',    'empty',    'hole-2',   'empty',    'enemy-2',  'empty',    'empty',    'empty'],
            /* Row 6 */ ['empty',    'fire-4',   'empty',    'empty',    'empty',    'empty',    'empty',    'server-c', 'empty',    'wall'],
            /* Row 7 */ ['wall',     'empty',    'empty',    'enemy-3',  'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 8 */ ['empty',    'empty',    'empty',    'empty',    'hole-3',   'empty',    'empty',    'server-d', 'empty',    'empty'],
            /* Row 9 */ ['empty',    'empty',    'wall',     'empty',    'empty',    'wall',     'empty',    'empty',    'empty',    'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':  { label: 'GATEWAY',       abbr: 'GTW', ip: '10.330.1.1',   desc: 'Error-prone perimeter -- walls create dead ends',              ports: ['22/SSH', '443/HTTPS'],                    os: 'Cisco Firepower 4110' },

        /* 4 target servers -- error handling infrastructure */
        'server-a': { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.330.1.10',  desc: 'Exception logger -- error event aggregator',                  ports: ['22/SSH', '443/HTTPS', '514/SYSLOG'],      os: 'Ubuntu 24.04 LTS' },
        'server-b': { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.330.1.11',  desc: 'Retry orchestrator -- failed operation recovery',             ports: ['22/SSH', '5672/AMQP', '9090/API'],        os: 'Debian 12 Bookworm' },
        'server-c': { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.330.1.12',  desc: 'Circuit breaker -- cascading failure prevention',             ports: ['22/SSH', '443/HTTPS', '9200/ELASTIC'],    os: 'CentOS Stream 9' },
        'server-d': { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.330.1.13',  desc: 'Fallback controller -- graceful degradation engine',          ports: ['22/SSH', '443/HTTPS', '8443/MGMT'],       os: 'RHEL 9.3' },

        /* Extraction point */
        'target':   { label: 'EXTRACTION',     abbr: 'EXT', ip: '10.330.1.99',  desc: 'Extraction point -- errors handled gracefully',               ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* 3 holes */
        'hole-1':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Network gap -- bridge or jump (may fail near walls)',                    ports: [] },
        'hole-2':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Core void -- bridge or jump (watch for dead ends)',                      ports: [] },
        'hole-3':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Backbone fracture -- bridge or jump',                                   ports: [] },

        /* 4 fires */
        'fire-1':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Thermal breach -- fireproof or extinguish',                             ports: [] },
        'fire-2':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Power surge -- fireproof or extinguish',                                ports: [] },
        'fire-3':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Circuit meltdown -- near wall dead end',                                ports: [] },
        'fire-4':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Thermal corridor -- fireproof or extinguish',                           ports: [] },

        /* 3 enemies */
        'enemy-1':  { label: 'ENEMY WORM',     abbr: 'WRM', ip: null, desc: 'Self-replicating worm -- fight to neutralize',                          ports: [] },
        'enemy-2':  { label: 'ENEMY TROJAN',   abbr: 'TRJ', ip: null, desc: 'Trojan horse -- fight in tight corridor',                               ports: [] },
        'enemy-3':  { label: 'ENEMY BACKDOOR', abbr: 'BKD', ip: null, desc: 'Persistent backdoor -- near wall dead end',                             ports: [] }
    },

    /* No traps */
    traps: [],

    /* Obstacles: all 3 types */
    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3'],
        fires: ['fire-1', 'fire-2', 'fire-3', 'fire-4'],
        enemies: ['enemy-1', 'enemy-2', 'enemy-3']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'RESILIENT -- Handle 3+ failed operations with try/catch',  check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("fire-1") && nodesDiscovered.has("enemy-1")' },
        { id: 'obj_1', label: 'DISCOVER -- Map all 4 error-handling servers',              check: 'nodesDiscovered.has("server-a") && nodesDiscovered.has("server-b") && nodesDiscovered.has("server-c") && nodesDiscovered.has("server-d")' },
        { id: 'obj_2', label: 'CLEAR -- Handle all 10 obstacles',                         check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3") && nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2") && nodesDiscovered.has("fire-3") && nodesDiscovered.has("fire-4") && nodesDiscovered.has("enemy-1") && nodesDiscovered.has("enemy-2") && nodesDiscovered.has("enemy-3")' },
        { id: 'obj_3', label: 'EXTRACTION -- Reach extraction point',                     check: 'nodesDiscovered.has("target")' },
        { id: 'obj_4', label: 'STEALTH -- 4+ integrity remaining',                        check: 'integrity >= 4' }
    ],

    /* 7 integrity -- walls cause extra failures, be generous */
    integrity: 7,

    /* -- Completion screen -- */
    completion: {
        title: 'ERROR HANDLER',
        subtitle: 'try/catch mastered. Failures caught. Fallbacks executed. Defensive coding proven.',
        storageKey: 'hexworth_operator_js33'
    }
};
