/* ================================================================
   JS-31 / THE CRUCIBLE -- Mission Config
   ================================================================
   *** EARN FIREPROOF PERMANENT TOOL -- GRID PICKUP ***
   Tier 5 mission. 10x10 grid -- 100 cells.
   The fireproof tool is a PICKUP NODE on the grid, behind holes
   that require bridge (from JS-28) to reach.

   Metroidvania chain: bridge (JS-28) -> cross holes -> find fireproof.
   Classic gating: can't reach the tool without a tool you already have.

   DESIGN RATIONALE:
   - The fireproof tool is placed at grid position (7,8) behind
     a gauntlet of holes that can only be permanently crossed with bridge
   - 4 holes guard the path to the tool -- bridge is REQUIRED
   - 4 fires are also on the grid, teaching the student what
     fireproof will solve in future levels
   - Student must bridge past holes, then walk onto the tool-fireproof
     cell to acquire the tool permanently
   - After this level, agent.fireproof(direction) is available forever

   JS SKILL: Grid pickup tools + Metroidvania gating
   - tool-fireproof is a cell type the engine recognizes
   - Auto-pickup: agent walks onto it and the tool enters inventory
   - The student realizes: "I needed bridge to get here"
   - Layered progression: each tool gates the next

   REFERENCE SOLUTION:
     async function theCrucible() {
         const results = await agent.scan();
         for (const node of results) {
             const { name, direction } = node;
             if (name.includes('HOLE')) {
                 await agent.bridge(direction);  // permanent!
             } else if (name.includes('FIRE')) {
                 await agent.extinguish(direction);  // per-transit for now
             } else if (name.includes('FIREPROOF TOOL')) {
                 await agent.move(direction);  // auto-pickup
             } else {
                 await agent.move(direction);
             }
         }
     }
     theCrucible();

   WHY THIS WORKS:
   - Bridge is required to reach the fireproof tool
   - Fires on the grid show the student what fireproof will fix
   - After collecting fireproof, fires become trivially passable
   - JS-32 will be the backtrack level that proves it

   GRID LAYOUT (10x10):
     [start]  [empty]  [empty]  [fire-1] [empty]  [empty]  [empty]  [empty]  [empty]  [empty]
     [empty]  [empty]  [hole-1] [empty]  [server-a][empty]  [fire-2] [empty]  [empty]  [wall]
     [empty]  [fire-3] [empty]  [empty]  [empty]  [hole-2] [empty]  [empty]  [empty]  [empty]
     [wall]   [empty]  [empty]  [empty]  [empty]  [empty]  [server-b][empty]  [empty]  [empty]
     [empty]  [hole-3] [empty]  [empty]  [empty]  [fire-4] [empty]  [empty]  [empty]  [wall]
     [empty]  [empty]  [empty]  [empty]  [server-c][empty]  [empty]  [empty]  [empty]  [empty]
     [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [hole-4] [empty]  [empty]  [empty]
     [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [tool-fp] [empty]
     [empty]  [empty]  [empty]  [empty]  [server-d][empty]  [empty]  [empty]  [empty]  [empty]
     [wall]   [wall]   [empty]  [empty]  [empty]  [wall]   [empty]  [empty]  [empty]  [target]

   4 holes (bridge required) + 4 fires. Fireproof tool at (7,8).
   ================================================================ */

var JS_31_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-31',
    title: 'JS-31 / THE CRUCIBLE',
    subtitle: 'Find the fireproof tool. It\'s behind the holes.',
    category: 'javascript-ops',
    difficulty: 4,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 4 = full capabilities) -- */
    agent: { tier: 4 },

    /* -- 10x10 Grid -- */
    grid: {
        rows: 10, cols: 10,
        cells: [
            /* Row 0 */ ['gateway',  'empty',    'empty',    'fire-1',   'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 1 */ ['empty',    'empty',    'hole-1',   'empty',    'server-a', 'empty',    'fire-2',   'empty',    'empty',    'wall'],
            /* Row 2 */ ['empty',    'fire-3',   'empty',    'empty',    'empty',    'hole-2',   'empty',    'empty',    'empty',    'empty'],
            /* Row 3 */ ['wall',     'empty',    'empty',    'empty',    'empty',    'empty',    'server-b', 'empty',    'empty',    'empty'],
            /* Row 4 */ ['empty',    'hole-3',   'empty',    'empty',    'empty',    'fire-4',   'empty',    'empty',    'empty',    'wall'],
            /* Row 5 */ ['empty',    'empty',    'empty',    'empty',    'server-c', 'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 6 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'hole-4',   'empty',    'empty',    'empty'],
            /* Row 7 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'tool-fireproof', 'empty'],
            /* Row 8 */ ['empty',    'empty',    'empty',    'empty',    'server-d', 'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 9 */ ['wall',     'wall',     'empty',    'empty',    'empty',    'wall',     'empty',    'empty',    'empty',    'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':        { label: 'GATEWAY',       abbr: 'GTW', ip: '10.310.1.1',   desc: 'Crucible perimeter -- the tool forge awaits',             ports: ['22/SSH', '443/HTTPS'],                    os: 'Cisco Firepower 4110' },

        /* 4 target servers */
        'server-a':       { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.310.1.10',  desc: 'Thermal monitor -- tracks fire activity',                ports: ['22/SSH', '443/HTTPS', '8080/HTTP'],       os: 'Ubuntu 24.04 LTS' },
        'server-b':       { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.310.1.11',  desc: 'Heat exchanger controller -- cooling systems',           ports: ['22/SSH', '502/MODBUS', '9090/API'],       os: 'Debian 12 Bookworm' },
        'server-c':       { label: 'SERVER-CHARLIE',  abbr: 'SRC', ip: '10.310.1.12',  desc: 'Suppressant inventory -- fire countermeasures',          ports: ['22/SSH', '443/HTTPS', '9200/ELASTIC'],    os: 'CentOS Stream 9' },
        'server-d':       { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.310.1.13',  desc: 'Emergency systems -- automated response',                ports: ['22/SSH', '443/HTTPS', '5060/SIP'],        os: 'RHEL 9.3' },

        /* Extraction point */
        'target':         { label: 'EXTRACTION',     abbr: 'EXT', ip: '10.310.1.99',  desc: 'Extraction point -- crucible survived',                  ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* TOOL PICKUP -- fireproof. Behind holes requiring bridge. */
        'tool-fireproof': { label: 'FIREPROOF TOOL', abbr: 'FPT', ip: null, desc: '*** PERMANENT TOOL *** Walk onto this to acquire fireproof capability', ports: [] },

        /* 4 holes -- bridge required to reach fireproof tool */
        'hole-1':         { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Gap -- bridge to cross (guards path to fireproof)',                ports: [] },
        'hole-2':         { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Backbone void -- bridge to cross',                                ports: [] },
        'hole-3':         { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Core fracture -- bridge to cross',                                ports: [] },
        'hole-4':         { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Final gap guarding fireproof tool -- bridge required',             ports: [] },

        /* 4 fires -- extinguish for now, fireproof later */
        'fire-1':         { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Thermal breach -- extinguish for now',                             ports: [] },
        'fire-2':         { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Power surge fire -- extinguish for now',                           ports: [] },
        'fire-3':         { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Circuit overload -- extinguish for now',                           ports: [] },
        'fire-4':         { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Thermal runaway -- extinguish for now',                            ports: [] }
    },

    /* No traps */
    traps: [],

    /* Obstacles: holes (bridge them) + fires (extinguish for now) */
    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3', 'hole-4'],
        fires: ['fire-1', 'fire-2', 'fire-3', 'fire-4']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'ACQUIRE -- Find the FIREPROOF tool (bridge holes to reach it)',  check: 'nodesDiscovered.has("tool-fireproof")' },
        { id: 'obj_1', label: 'BRIDGE -- Cross all 4 holes permanently',                        check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3") && nodesDiscovered.has("hole-4")' },
        { id: 'obj_2', label: 'DISCOVER -- Map all 4 crucible servers',                          check: 'nodesDiscovered.has("server-a") && nodesDiscovered.has("server-b") && nodesDiscovered.has("server-c") && nodesDiscovered.has("server-d")' },
        { id: 'obj_3', label: 'FIRES -- Handle all 4 fires',                                    check: 'nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2") && nodesDiscovered.has("fire-3") && nodesDiscovered.has("fire-4")' },
        { id: 'obj_4', label: 'EXTRACTION -- Reach extraction point',                           check: 'nodesDiscovered.has("target")' }
    ],

    /* 6 integrity -- standard for tool-earning levels */
    integrity: 6,

    /* -- Completion screen -- */
    completion: {
        title: 'THE CRUCIBLE',
        subtitle: '*** FIREPROOF TOOL ACQUIRED *** Fires are now permanently passable.',
        storageKey: 'hexworth_operator_js31'
    }
};
