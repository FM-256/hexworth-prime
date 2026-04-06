/* ================================================================
   JS-28 / THE BRIDGE -- Mission Config
   ================================================================
   *** THE METROIDVANIA BOOTSTRAP ***
   Tier 5 mission. 9x9 grid -- 81 cells.
   FIRST PERMANENT TOOL for JavaScript. Earns 'bridge' on completion.

   This is a COMPLETION REWARD, not a grid pickup. The student
   doesn't need any previous permanent tools to earn bridge.
   This solves the chicken-and-egg problem: you can't reach a
   grid-pickup tool without already having a tool, so the first
   permanent tool must be granted for free on mission completion.

   DESIGN RATIONALE:
   - 9x9 grid with a mix of all 3 obstacle types from Tier 4
   - 4 holes (jumped via agent.jump), 2 fires (agent.extinguish),
     2 enemies (agent.fight) -- the student must prove mastery
   - 4 servers scattered behind obstacles to force full traversal
   - The level is a victory lap: everything learned in Tier 4
     must be applied cleanly to earn the first permanent tool
   - Upon completion, the engine awards 'bridge' to persistent
     inventory (hexworth_operator_inventory_js)

   JS SKILL: Completion rewards -- earn your first permanent tool
   - After this level, agent.bridge(direction) is available forever
   - Bridge permanently removes a hole instead of just jumping it
   - Student sees the reward on the completion screen and understands
     the Metroidvania loop is about to begin

   REFERENCE SOLUTION:
     async function theBridge() {
         let results = await agent.scan();
         for (const node of results) {
             const { name, direction } = node;
             if (name.includes('HOLE')) {
                 await agent.jump(direction);
             } else if (name.includes('FIRE')) {
                 await agent.extinguish(direction);
             } else if (name.includes('ENEMY')) {
                 await agent.fight(direction);
             } else {
                 await agent.move(direction);
             }
         }
     }
     theBridge();

   WHY THIS WORKS:
   - Student uses every Tier 4 skill to survive the grid
   - Completion grants bridge -- the first permanent upgrade
   - Next level (JS-29) will revisit holes with bridge in hand
   - The "earn then backtrack" loop is now established

   GRID LAYOUT (9x9):
     [start]  [empty]  [hole-1] [empty]  [server-a][empty]  [empty]  [empty]  [empty]
     [empty]  [empty]  [empty]  [fire-1] [empty]  [empty]  [empty]  [empty]  [wall]
     [empty]  [enemy-1][empty]  [empty]  [empty]  [hole-2] [empty]  [server-b][empty]
     [wall]   [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]
     [empty]  [empty]  [hole-3] [empty]  [empty]  [fire-2] [empty]  [empty]  [wall]
     [empty]  [empty]  [empty]  [empty]  [server-c][empty]  [enemy-2][empty]  [empty]
     [wall]   [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]
     [empty]  [empty]  [empty]  [hole-4] [empty]  [empty]  [server-d][empty]  [empty]
     [wall]   [wall]   [empty]  [empty]  [empty]  [wall]   [empty]  [empty]  [target]

   4 holes + 2 fires + 2 enemies. Prove Tier 4 mastery, earn bridge.
   ================================================================ */

var JS_28_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-28',
    title: 'JS-28 / THE BRIDGE',
    subtitle: 'Survive every obstacle. Earn your first permanent tool.',
    category: 'javascript-ops',
    difficulty: 4,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 4 = full Tier 4 capabilities) -- */
    agent: { tier: 4 },

    /* -- Flag: award bridge tool on mission completion -- */
    completionReward: { tool: 'bridge' },

    /* -- 9x9 Grid -- */
    grid: {
        rows: 9, cols: 9,
        cells: [
            /* Row 0 */ ['gateway',  'empty',    'hole-1',   'empty',    'server-a', 'empty',    'empty',    'empty',    'empty'],
            /* Row 1 */ ['empty',    'empty',    'empty',    'fire-1',   'empty',    'empty',    'empty',    'empty',    'wall'],
            /* Row 2 */ ['empty',    'enemy-1',  'empty',    'empty',    'empty',    'hole-2',   'empty',    'server-b', 'empty'],
            /* Row 3 */ ['wall',     'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 4 */ ['empty',    'empty',    'hole-3',   'empty',    'empty',    'fire-2',   'empty',    'empty',    'wall'],
            /* Row 5 */ ['empty',    'empty',    'empty',    'empty',    'server-c', 'empty',    'enemy-2',  'empty',    'empty'],
            /* Row 6 */ ['wall',     'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 7 */ ['empty',    'empty',    'empty',    'hole-4',   'empty',    'empty',    'server-d', 'empty',    'empty'],
            /* Row 8 */ ['wall',     'wall',     'empty',    'empty',    'empty',    'wall',     'empty',    'empty',    'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':  { label: 'GATEWAY',       abbr: 'GTW', ip: '10.280.1.1',   desc: 'Edge router -- your insertion point',                           ports: ['22/SSH', '443/HTTPS'],                    os: 'Cisco Firepower 4110' },

        /* 4 target servers -- tool forge network */
        'server-a': { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.280.1.10',  desc: 'Firmware controller -- bridge blueprint storage',               ports: ['22/SSH', '443/HTTPS', '502/MODBUS'],      os: 'Windows 10 IoT Enterprise' },
        'server-b': { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.280.1.11',  desc: 'Fabrication server -- tool assembly pipeline',                  ports: ['22/SSH', '8080/HTTP', '5432/PostgreSQL'],  os: 'Ubuntu 24.04 LTS' },
        'server-c': { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.280.1.12',  desc: 'Material depot -- raw resource inventory',                     ports: ['22/SSH', '443/HTTPS', '9200/ELASTIC'],     os: 'Debian 12 Bookworm' },
        'server-d': { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.280.1.13',  desc: 'QA station -- tool certification endpoint',                    ports: ['22/SSH', '443/HTTPS', '8443/MGMT'],        os: 'RHEL 9.3' },

        /* Extraction point */
        'target':   { label: 'EXTRACTION',     abbr: 'EXT', ip: '10.280.1.99',  desc: 'Complete this to earn BRIDGE permanent tool',                   ports: ['22/SSH', '8443/HTTPS'],                    os: 'RHEL 9.3' },

        /* 4 holes -- jump required */
        'hole-1':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Gap in network fabric -- jump to cross',                                  ports: [] },
        'hole-2':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Severed backbone segment -- jump to cross',                               ports: [] },
        'hole-3':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Missing link in core path -- jump to cross',                              ports: [] },
        'hole-4':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Fractured connection -- jump to cross',                                   ports: [] },

        /* 2 fires -- extinguish required */
        'fire-1':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Power surge fire -- extinguish to pass',                                  ports: [] },
        'fire-2':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Thermal overload -- extinguish to pass',                                  ports: [] },

        /* 2 enemies -- fight required */
        'enemy-1':  { label: 'ENEMY WORM',     abbr: 'WRM', ip: null, desc: 'Self-replicating worm -- fight to neutralize',                           ports: [] },
        'enemy-2':  { label: 'ENEMY TROJAN',   abbr: 'TRJ', ip: null, desc: 'Trojan payload -- fight to neutralize',                                  ports: [] }
    },

    /* No traps */
    traps: [],

    /* Obstacles: mixed from Tier 4 */
    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3', 'hole-4'],
        fires: ['fire-1', 'fire-2'],
        enemies: ['enemy-1', 'enemy-2']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER -- Map all 4 forge servers',                     check: 'nodesDiscovered.has("server-a") && nodesDiscovered.has("server-b") && nodesDiscovered.has("server-c") && nodesDiscovered.has("server-d")' },
        { id: 'obj_1', label: 'NAVIGATE -- Handle all 4 holes safely',                   check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3") && nodesDiscovered.has("hole-4")' },
        { id: 'obj_2', label: 'COMBAT -- Clear all fires and enemies',                   check: 'nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2") && nodesDiscovered.has("enemy-1") && nodesDiscovered.has("enemy-2")' },
        { id: 'obj_3', label: 'EXTRACTION -- Reach extraction (earn BRIDGE tool)',        check: 'nodesDiscovered.has("target")' },
        { id: 'obj_4', label: 'STEALTH -- 4+ integrity remaining',                       check: 'integrity >= 4' }
    ],

    /* 6 integrity -- generous for the bootstrap level */
    integrity: 6,

    /* -- Completion screen -- */
    completion: {
        title: 'THE BRIDGE',
        subtitle: '*** BRIDGE TOOL EARNED *** Holes can now be permanently bridged. The Metroidvania loop begins.',
        storageKey: 'hexworth_operator_js28'
    }
};
