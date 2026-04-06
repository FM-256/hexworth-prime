/* ================================================================
   JS-35 / BACKTRACK: HOSTILE -- Mission Config
   ================================================================
   *** BACKTRACK WITH TERMINATE ***
   Tier 5 mission. 9x9 grid -- 81 cells.
   Student returns to an enemy-heavy level WITH the terminate tool
   earned in JS-34. Enemies that required fight() before are now
   permanently removed with agent.terminate(direction).

   DESIGN RATIONALE:
   - 9x9 grid packed with 6 enemies -- a hostile gauntlet
   - No holes, no fires -- pure focus on terminate mechanics
   - A hidden bonus server behind an enemy cluster
   - With terminate, the student walks through enemies permanently
   - Difficulty 3 (backtrack victory lap)
   - Completes the third earn/backtrack cycle:
     JS-28/29: bridge + backtrack holes
     JS-31/32: fireproof + backtrack fires
     JS-34/35: terminate + backtrack enemies

   JS SKILL: Using agent.terminate(dir) -- permanent enemy removal
   - agent.terminate(direction) removes the enemy permanently
   - Unlike fight (which uses resources), terminate is free and permanent
   - All 3 permanent obstacle-clearing tools now collected

   REFERENCE SOLUTION:
     async function backtrackHostile() {
         const results = await agent.scan();
         for (const node of results) {
             const { name, direction } = node;
             if (name.includes('ENEMY')) {
                 // Use terminate instead of fight -- permanent elimination
                 await agent.terminate(direction);
             } else {
                 await agent.move(direction);
             }
         }
     }
     backtrackHostile();

   WHY THIS WORKS:
   - Enemies were the most dangerous obstacle type; now trivial
   - The terminate reward from JS-34 pays off immediately
   - Pattern completed: 3 tools earned, 3 backtrack levels proven
   - Student now has bridge + fireproof + terminate for future levels

   GRID LAYOUT (9x9):
     [start]  [empty]  [enemy-1][empty]  [empty]  [server-a][empty]  [empty]  [empty]
     [empty]  [empty]  [empty]  [empty]  [enemy-2][empty]  [empty]  [empty]  [wall]
     [empty]  [enemy-3][empty]  [empty]  [empty]  [empty]  [server-b][empty]  [empty]
     [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]
     [wall]   [empty]  [empty]  [enemy-4][empty]  [empty]  [empty]  [empty]  [empty]
     [empty]  [empty]  [empty]  [empty]  [empty]  [server-c][empty]  [enemy-5][empty]
     [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [wall]
     [empty]  [empty]  [enemy-6][empty]  [empty]  [empty]  [server-d][empty]  [srv-bonus]
     [wall]   [empty]  [empty]  [empty]  [empty]  [wall]   [empty]  [empty]  [target]

   6 enemies. Terminate them all. Find the hidden server.
   ================================================================ */

var JS_35_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-35',
    title: 'JS-35 / BACKTRACK: HOSTILE',
    subtitle: 'Return with terminate. Enemies fall permanently.',
    category: 'javascript-ops',
    difficulty: 3,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 3 = backtrack level) -- */
    agent: { tier: 3 },

    /* -- 9x9 Grid -- */
    grid: {
        rows: 9, cols: 9,
        cells: [
            /* Row 0 */ ['gateway',  'empty',    'enemy-1',  'empty',    'empty',    'server-a', 'empty',    'empty',    'empty'],
            /* Row 1 */ ['empty',    'empty',    'empty',    'empty',    'enemy-2',  'empty',    'empty',    'empty',    'wall'],
            /* Row 2 */ ['empty',    'enemy-3',  'empty',    'empty',    'empty',    'empty',    'server-b', 'empty',    'empty'],
            /* Row 3 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 4 */ ['wall',     'empty',    'empty',    'enemy-4',  'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 5 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'server-c', 'empty',    'enemy-5',  'empty'],
            /* Row 6 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'wall'],
            /* Row 7 */ ['empty',    'empty',    'enemy-6',  'empty',    'empty',    'empty',    'server-d', 'empty',    'srv-bonus'],
            /* Row 8 */ ['wall',     'empty',    'empty',    'empty',    'empty',    'wall',     'empty',    'empty',    'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':   { label: 'GATEWAY',       abbr: 'GTW', ip: '10.350.1.1',   desc: 'Hostile perimeter -- but now you have terminate',             ports: ['22/SSH', '443/HTTPS'],                    os: 'Cisco ASA 5516-X' },

        /* 4 standard servers */
        'server-a':  { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.350.1.10',  desc: 'Threat intel server -- enemy pattern database',              ports: ['22/SSH', '443/HTTPS', '8080/HTTP'],       os: 'Ubuntu 24.04 LTS' },
        'server-b':  { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.350.1.11',  desc: 'Counter-intrusion system -- offensive response',             ports: ['22/SSH', '5432/PostgreSQL', '9090/API'],  os: 'Debian 12 Bookworm' },
        'server-c':  { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.350.1.12',  desc: 'Kill chain tracker -- attack phase monitor',                 ports: ['22/SSH', '443/HTTPS', '9200/ELASTIC'],    os: 'CentOS Stream 9' },
        'server-d':  { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.350.1.13',  desc: 'Decontamination hub -- malware elimination',                 ports: ['22/SSH', '443/HTTPS', '1883/MQTT'],       os: 'RHEL 9.3' },

        /* Bonus server -- behind enemy cluster */
        'srv-bonus': { label: 'SRV-HIDDEN',     abbr: 'SRH', ip: '10.350.1.99',  desc: 'Hidden server -- only trivially reachable with terminate',   ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* Extraction point */
        'target':    { label: 'EXTRACTION',     abbr: 'EXT', ip: '10.350.1.50',  desc: 'Extraction point -- hostile zone cleared',                   ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* 6 enemies -- terminate them permanently */
        'enemy-1':   { label: 'ENEMY GUARD',     abbr: 'GRD', ip: null, desc: 'Perimeter guard -- terminate permanently',                             ports: [] },
        'enemy-2':   { label: 'ENEMY DRONE',     abbr: 'DRN', ip: null, desc: 'Surveillance drone -- terminate permanently',                          ports: [] },
        'enemy-3':   { label: 'ENEMY BOT',       abbr: 'BOT', ip: null, desc: 'Attack bot -- terminate permanently',                                  ports: [] },
        'enemy-4':   { label: 'ENEMY SENTRY',    abbr: 'SNT', ip: null, desc: 'Sentry program -- terminate permanently',                              ports: [] },
        'enemy-5':   { label: 'ENEMY HACKER',    abbr: 'HCK', ip: null, desc: 'Rogue hacker -- terminate permanently',                                ports: [] },
        'enemy-6':   { label: 'ENEMY AGENT',     abbr: 'AGT', ip: null, desc: 'Enemy agent guarding bonus -- terminate permanently',                   ports: [] }
    },

    /* No traps -- backtrack is a victory lap */
    traps: [],

    /* Obstacles: enemies only */
    obstacles: {
        enemies: ['enemy-1', 'enemy-2', 'enemy-3', 'enemy-4', 'enemy-5', 'enemy-6']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'TERMINATE -- Permanently eliminate all 6 enemies',          check: 'nodesDiscovered.has("enemy-1") && nodesDiscovered.has("enemy-2") && nodesDiscovered.has("enemy-3") && nodesDiscovered.has("enemy-4") && nodesDiscovered.has("enemy-5") && nodesDiscovered.has("enemy-6")' },
        { id: 'obj_1', label: 'DISCOVER -- Map all 4 standard servers',                    check: 'nodesDiscovered.has("server-a") && nodesDiscovered.has("server-b") && nodesDiscovered.has("server-c") && nodesDiscovered.has("server-d")' },
        { id: 'obj_2', label: 'BONUS -- Reach the hidden server (terminate guard)',         check: 'nodesDiscovered.has("srv-bonus")' },
        { id: 'obj_3', label: 'EXTRACTION -- Reach extraction point',                      check: 'nodesDiscovered.has("target")' }
    ],

    /* 5 integrity -- backtrack is forgiving */
    integrity: 5,

    /* -- Completion screen -- */
    completion: {
        title: 'BACKTRACK: HOSTILE',
        subtitle: 'Terminate mastered. Six enemies permanently eliminated. Three tools proven.',
        storageKey: 'hexworth_operator_js35'
    }
};
