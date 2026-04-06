/* ================================================================
   JS-29 / BACKTRACK: PIT STOP -- Mission Config
   ================================================================
   *** FIRST BACKTRACK LEVEL ***
   Tier 5 mission. 7x7 grid -- 49 cells.
   Student returns to a Pit Stop-style level WITH the bridge tool
   earned in JS-28. Holes that were impassable before can now be
   bridged permanently with agent.bridge(direction).

   This is the student's first Metroidvania "aha" moment:
   "I earned bridge in JS-28, and now I can use it here."

   DESIGN RATIONALE:
   - 7x7 grid mirrors JS-18 (the original hole level) in spirit
   - 5 holes -- more than JS-18's 3, but now trivially passable
   - No fires, no enemies -- pure focus on bridge mechanics
   - A hidden bonus server behind a hole cluster that REQUIRES
     bridge (jumping won't reach it -- you'd land in another hole)
   - Difficulty 3 (backtrack levels are victory laps, not challenges)

   JS SKILL: Using agent.bridge(dir) -- permanent hole removal
   - agent.bridge(direction) removes the hole permanently
   - Unlike jump (which just crosses it), bridge means future
     traversals don't need to worry about that hole
   - Student learns: permanent tools change the game permanently

   REFERENCE SOLUTION:
     async function backtrackPitStop() {
         let results = await agent.scan();
         for (const node of results) {
             const { name, direction } = node;
             if (name.includes('HOLE')) {
                 // Use bridge instead of jump -- permanent removal
                 await agent.bridge(direction);
             } else {
                 await agent.move(direction);
             }
         }
     }
     backtrackPitStop();

   WHY THIS WORKS:
   - The grid is familiar (hole-heavy, like JS-18)
   - Bridge makes holes trivial -- the reward from JS-28 pays off
   - Bonus server rewards thorough exploration with bridge
   - Sets the pattern: earn tool -> backtrack -> feel the power

   GRID LAYOUT (7x7):
     [start]  [empty]  [hole-1] [empty]  [server-a][empty]  [empty]
     [empty]  [empty]  [empty]  [empty]  [empty]  [hole-2] [empty]
     [empty]  [hole-3] [empty]  [server-b][empty]  [empty]  [empty]
     [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]
     [empty]  [empty]  [empty]  [empty]  [hole-4] [server-c][empty]
     [empty]  [empty]  [empty]  [hole-5] [empty]  [empty]  [srv-bonus]
     [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [target]

   5 holes. Bridge them all. Find the hidden server.
   ================================================================ */

var JS_29_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-29',
    title: 'JS-29 / BACKTRACK: PIT STOP',
    subtitle: 'Return with bridge. Cross what was once impossible.',
    category: 'javascript-ops',
    difficulty: 3,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 3 = backtrack level) -- */
    agent: { tier: 3 },

    /* -- 7x7 Grid -- */
    grid: {
        rows: 7, cols: 7,
        cells: [
            /* Row 0 */ ['gateway',  'empty',    'hole-1',   'empty',    'server-a', 'empty',    'empty'],
            /* Row 1 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'hole-2',   'empty'],
            /* Row 2 */ ['empty',    'hole-3',   'empty',    'server-b', 'empty',    'empty',    'empty'],
            /* Row 3 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 4 */ ['empty',    'empty',    'empty',    'empty',    'hole-4',   'server-c', 'empty'],
            /* Row 5 */ ['empty',    'empty',    'empty',    'hole-5',   'empty',    'empty',    'srv-bonus'],
            /* Row 6 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':   { label: 'GATEWAY',       abbr: 'GTW', ip: '10.290.1.1',   desc: 'Familiar terrain -- but now you have bridge',                  ports: ['22/SSH', '443/HTTPS'],                    os: 'Cisco ASA 5516-X' },

        /* 3 standard servers */
        'server-a':  { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.290.1.10',  desc: 'Control workstation -- behind hole-1',                        ports: ['22/SSH', '80/HTTP', '502/MODBUS'],        os: 'Windows 10 IoT Enterprise' },
        'server-b':  { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.290.1.11',  desc: 'Process historian -- behind hole cluster',                    ports: ['22/SSH', '1433/MSSQL', '8080/HTTP'],      os: 'Windows Server 2022' },
        'server-c':  { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.290.1.12',  desc: 'Monitoring station -- deep in the grid',                      ports: ['22/SSH', '443/HTTPS', '9200/ELASTIC'],    os: 'Ubuntu 24.04 LTS' },

        /* Bonus server -- only reachable with bridge */
        'srv-bonus': { label: 'SRV-HIDDEN',     abbr: 'SRH', ip: '10.290.1.99',  desc: 'Hidden server -- only reachable by bridging hole-5',          ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* Extraction point */
        'target':    { label: 'EXTRACTION',     abbr: 'EXT', ip: '10.290.1.50',  desc: 'Extraction point -- backtrack complete',                      ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* 5 holes -- bridge them permanently */
        'hole-1':    { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Gap -- bridge or jump',                                                 ports: [] },
        'hole-2':    { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Gap -- bridge or jump',                                                 ports: [] },
        'hole-3':    { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Gap -- bridge or jump',                                                 ports: [] },
        'hole-4':    { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Gap -- bridge or jump',                                                 ports: [] },
        'hole-5':    { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Gap guarding bonus server -- bridge required',                           ports: [] }
    },

    /* No traps -- backtrack is a victory lap */
    traps: [],

    /* Obstacles: holes only */
    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3', 'hole-4', 'hole-5']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'BRIDGE -- Permanently bridge 4+ holes',                   check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3") && nodesDiscovered.has("hole-4")' },
        { id: 'obj_1', label: 'DISCOVER -- Map all 3 standard servers',                   check: 'nodesDiscovered.has("server-a") && nodesDiscovered.has("server-b") && nodesDiscovered.has("server-c")' },
        { id: 'obj_2', label: 'BONUS -- Reach the hidden server (bridge required)',        check: 'nodesDiscovered.has("srv-bonus")' },
        { id: 'obj_3', label: 'EXTRACTION -- Reach extraction point',                     check: 'nodesDiscovered.has("target")' }
    ],

    /* 5 integrity -- backtrack is forgiving */
    integrity: 5,

    /* -- Completion screen -- */
    completion: {
        title: 'BACKTRACK: PIT STOP',
        subtitle: 'Bridge mastered. Five holes permanently removed. The Metroidvania loop clicks.',
        storageKey: 'hexworth_operator_js29'
    }
};
