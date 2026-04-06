/* ================================================================
   JS-34 / THE ARMORY -- Mission Config
   ================================================================
   *** EARN TERMINATE PERMANENT TOOL -- GRID PICKUP ***
   Tier 5 mission. 10x10 grid -- 100 cells.
   The terminate tool is a PICKUP NODE on the grid, behind BOTH
   fire and hole obstacles. Student must have bridge (JS-28) AND
   fireproof (JS-31) to reach it. Layered Metroidvania gating.

   Metroidvania chain:
     bridge (JS-28) -> fireproof (JS-31) -> terminate (JS-34)
   Each tool gates the next. Classic progression.

   DESIGN RATIONALE:
   - The terminate tool is placed at grid position (7,8) behind
     a gauntlet of holes AND fires
   - Student must bridge past holes, fireproof past fires, then
     walk onto the tool-terminate cell
   - 3 holes + 4 fires guard the path to the tool
   - 4 enemies on the grid show what terminate will solve
   - After this level, agent.terminate(direction) is available forever

   JS SKILL: Layered tool gating + multi-obstacle navigation
   - Must sequence: bridge holes -> fireproof fires -> collect tool
   - Each permanent tool compounds the student's capabilities
   - The enemy fights on this level preview what terminate removes

   REFERENCE SOLUTION:
     async function theArmory() {
         const results = await agent.scan();
         for (const node of results) {
             const { name, direction } = node;
             if (name.includes('HOLE')) {
                 await agent.bridge(direction);
             } else if (name.includes('FIRE')) {
                 await agent.fireproof(direction);
             } else if (name.includes('ENEMY')) {
                 await agent.fight(direction);  // per-transit for now
             } else if (name.includes('TERMINATE TOOL')) {
                 await agent.move(direction);   // auto-pickup
             } else {
                 await agent.move(direction);
             }
         }
     }
     theArmory();

   WHY THIS WORKS:
   - Two permanent tools required to reach the third
   - Enemies on the grid preview terminate's value
   - JS-35 will be the backtrack level proving terminate's power
   - The student's toolkit grows: bridge + fireproof + terminate

   GRID LAYOUT (10x10):
     [start]  [empty]  [empty]  [fire-1] [empty]  [enemy-1][empty]  [empty]  [empty]  [wall]
     [empty]  [empty]  [hole-1] [empty]  [server-a][empty]  [empty]  [fire-2] [empty]  [empty]
     [empty]  [enemy-2][empty]  [empty]  [empty]  [empty]  [hole-2] [empty]  [empty]  [wall]
     [wall]   [empty]  [empty]  [empty]  [empty]  [fire-3] [empty]  [empty]  [server-b][empty]
     [empty]  [fire-4] [empty]  [empty]  [empty]  [empty]  [enemy-3][empty]  [empty]  [wall]
     [empty]  [empty]  [hole-3] [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]
     [wall]   [empty]  [empty]  [enemy-4][empty]  [server-c][empty]  [empty]  [empty]  [wall]
     [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [tool-term][empty]
     [empty]  [empty]  [empty]  [empty]  [server-d][empty]  [empty]  [empty]  [empty]  [empty]
     [wall]   [wall]   [empty]  [empty]  [empty]  [wall]   [empty]  [empty]  [empty]  [target]

   3 holes + 4 fires (guard tool) + 4 enemies. Terminate tool at (7,8).
   ================================================================ */

var JS_34_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-34',
    title: 'JS-34 / THE ARMORY',
    subtitle: 'Find the terminate tool. It\'s behind fire and holes.',
    category: 'javascript-ops',
    difficulty: 4,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 4 = full capabilities) -- */
    agent: { tier: 4 },

    /* -- 10x10 Grid -- */
    grid: {
        rows: 10, cols: 10,
        cells: [
            /* Row 0 */ ['gateway',  'empty',    'empty',    'fire-1',   'empty',    'enemy-1',  'empty',    'empty',    'empty',    'wall'],
            /* Row 1 */ ['empty',    'empty',    'hole-1',   'empty',    'server-a', 'empty',    'empty',    'fire-2',   'empty',    'empty'],
            /* Row 2 */ ['empty',    'enemy-2',  'empty',    'empty',    'empty',    'empty',    'hole-2',   'empty',    'empty',    'wall'],
            /* Row 3 */ ['wall',     'empty',    'empty',    'empty',    'empty',    'fire-3',   'empty',    'empty',    'server-b', 'empty'],
            /* Row 4 */ ['empty',    'fire-4',   'empty',    'empty',    'empty',    'empty',    'enemy-3',  'empty',    'empty',    'wall'],
            /* Row 5 */ ['empty',    'empty',    'hole-3',   'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 6 */ ['wall',     'empty',    'empty',    'enemy-4',  'empty',    'server-c', 'empty',    'empty',    'empty',    'wall'],
            /* Row 7 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'tool-terminate', 'empty'],
            /* Row 8 */ ['empty',    'empty',    'empty',    'empty',    'server-d', 'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 9 */ ['wall',     'wall',     'empty',    'empty',    'empty',    'wall',     'empty',    'empty',    'empty',    'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':        { label: 'GATEWAY',        abbr: 'GTW', ip: '10.340.1.1',   desc: 'Armory perimeter -- the weapon forge awaits',             ports: ['22/SSH', '443/HTTPS'],                    os: 'Cisco Firepower 4110' },

        /* 4 target servers */
        'server-a':       { label: 'SERVER-ALPHA',    abbr: 'SRA', ip: '10.340.1.10',  desc: 'Weapons cache -- ordnance inventory system',             ports: ['22/SSH', '443/HTTPS', '8080/HTTP'],       os: 'Ubuntu 24.04 LTS' },
        'server-b':       { label: 'SERVER-BRAVO',    abbr: 'SRB', ip: '10.340.1.11',  desc: 'Targeting system -- threat identification',              ports: ['22/SSH', '5432/PostgreSQL', '9090/API'],  os: 'Debian 12 Bookworm' },
        'server-c':       { label: 'SERVER-CHARLIE',  abbr: 'SRC', ip: '10.340.1.12',  desc: 'Combat controller -- engagement sequencer',              ports: ['22/SSH', '443/HTTPS', '9200/ELASTIC'],    os: 'CentOS Stream 9' },
        'server-d':       { label: 'SERVER-DELTA',    abbr: 'SRD', ip: '10.340.1.13',  desc: 'Arsenal manifest -- permanent tool registry',            ports: ['22/SSH', '443/HTTPS', '8443/MGMT'],       os: 'RHEL 9.3' },

        /* Extraction point */
        'target':         { label: 'EXTRACTION',      abbr: 'EXT', ip: '10.340.1.99',  desc: 'Extraction point -- armory secured',                    ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* TOOL PICKUP -- terminate. Behind fires + holes requiring bridge + fireproof. */
        'tool-terminate': { label: 'TERMINATE TOOL',  abbr: 'TRM', ip: null, desc: '*** PERMANENT TOOL *** Walk onto this to eliminate enemies permanently', ports: [] },

        /* 3 holes -- bridge required */
        'hole-1':         { label: 'HOLE',            abbr: 'HLE', ip: null, desc: 'Gap -- bridge to cross (guards path to armory)',                   ports: [] },
        'hole-2':         { label: 'HOLE',            abbr: 'HLE', ip: null, desc: 'Core void -- bridge to cross',                                    ports: [] },
        'hole-3':         { label: 'HOLE',            abbr: 'HLE', ip: null, desc: 'Backbone fracture -- bridge to cross',                            ports: [] },

        /* 4 fires -- fireproof required */
        'fire-1':         { label: 'FIRE',            abbr: 'FIR', ip: null, desc: 'Thermal breach -- fireproof to pass (guards tool)',                ports: [] },
        'fire-2':         { label: 'FIRE',            abbr: 'FIR', ip: null, desc: 'Power surge -- fireproof to pass',                                ports: [] },
        'fire-3':         { label: 'FIRE',            abbr: 'FIR', ip: null, desc: 'Circuit meltdown -- fireproof to pass',                           ports: [] },
        'fire-4':         { label: 'FIRE',            abbr: 'FIR', ip: null, desc: 'Burning corridor -- fireproof to pass',                           ports: [] },

        /* 4 enemies -- fight for now, terminate later */
        'enemy-1':        { label: 'ENEMY GUARD',     abbr: 'GRD', ip: null, desc: 'Perimeter guard -- fight to pass',                                ports: [] },
        'enemy-2':        { label: 'ENEMY DRONE',     abbr: 'DRN', ip: null, desc: 'Surveillance drone -- fight to neutralize',                       ports: [] },
        'enemy-3':        { label: 'ENEMY BOT',       abbr: 'BOT', ip: null, desc: 'Attack bot -- fight to neutralize',                               ports: [] },
        'enemy-4':        { label: 'ENEMY SENTRY',    abbr: 'SNT', ip: null, desc: 'Sentry program -- fight to neutralize',                           ports: [] }
    },

    /* No traps */
    traps: [],

    /* Obstacles: all 3 types -- layered gating */
    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3'],
        fires: ['fire-1', 'fire-2', 'fire-3', 'fire-4'],
        enemies: ['enemy-1', 'enemy-2', 'enemy-3', 'enemy-4']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'ACQUIRE -- Find TERMINATE tool (bridge + fireproof to reach)',check: 'nodesDiscovered.has("tool-terminate")' },
        { id: 'obj_1', label: 'BRIDGE -- Cross all 3 holes permanently',                     check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3")' },
        { id: 'obj_2', label: 'FIREPROOF -- Walk through all 4 fires',                       check: 'nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2") && nodesDiscovered.has("fire-3") && nodesDiscovered.has("fire-4")' },
        { id: 'obj_3', label: 'DISCOVER -- Map all 4 armory servers',                         check: 'nodesDiscovered.has("server-a") && nodesDiscovered.has("server-b") && nodesDiscovered.has("server-c") && nodesDiscovered.has("server-d")' },
        { id: 'obj_4', label: 'EXTRACTION -- Reach extraction point',                        check: 'nodesDiscovered.has("target")' }
    ],

    /* 7 integrity -- generous for multi-tool level */
    integrity: 7,

    /* -- Completion screen -- */
    completion: {
        title: 'THE ARMORY',
        subtitle: '*** TERMINATE TOOL ACQUIRED *** Enemies can now be permanently eliminated.',
        storageKey: 'hexworth_operator_js34'
    }
};
