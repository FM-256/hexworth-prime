/* ================================================================
   JS-32 / BACKTRACK: INFERNO -- Mission Config
   ================================================================
   *** BACKTRACK WITH FIREPROOF ***
   Tier 5 mission. 8x8 grid -- 64 cells.
   Student returns to a fire-heavy level WITH the fireproof tool
   earned in JS-31. Fires that once cost extinguish charges are
   now trivially passable with agent.fireproof(direction).

   DESIGN RATIONALE:
   - 8x8 grid packed with 6 fires -- a thermal gauntlet
   - No holes, no enemies -- pure focus on fireproof mechanics
   - A hidden bonus server behind a fire cluster that was
     expensive to reach with extinguish charges alone
   - With fireproof, the student walks through fires permanently
   - Difficulty 3 (backtrack victory lap)

   JS SKILL: Using agent.fireproof(dir) -- permanent fire removal
   - agent.fireproof(direction) removes the fire permanently
   - Unlike extinguish (which uses charges), fireproof is free and permanent
   - Student sees the full Metroidvania loop pattern repeating:
     JS-28: earn bridge -> JS-29: backtrack holes
     JS-31: earn fireproof -> JS-32: backtrack fires

   REFERENCE SOLUTION:
     async function backtrackInferno() {
         const results = await agent.scan();
         for (const node of results) {
             const { name, direction } = node;
             if (name.includes('FIRE')) {
                 // Use fireproof instead of extinguish -- permanent removal
                 await agent.fireproof(direction);
             } else {
                 await agent.move(direction);
             }
         }
     }
     backtrackInferno();

   WHY THIS WORKS:
   - Fires dominated the grid in past levels; now they are nothing
   - The reward from JS-31 pays off immediately and tangibly
   - Bonus server rewards exploration through fire barriers
   - Pattern solidified: earn tool -> backtrack -> feel the power

   GRID LAYOUT (8x8):
     [start]  [empty]  [fire-1] [empty]  [server-a][empty]  [empty]  [empty]
     [empty]  [empty]  [empty]  [fire-2] [empty]  [empty]  [empty]  [empty]
     [empty]  [fire-3] [empty]  [empty]  [empty]  [server-b][empty]  [empty]
     [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [fire-4] [empty]
     [empty]  [empty]  [empty]  [server-c][empty]  [empty]  [empty]  [empty]
     [empty]  [fire-5] [empty]  [empty]  [empty]  [empty]  [empty]  [srv-bonus]
     [empty]  [empty]  [empty]  [empty]  [fire-6] [empty]  [server-d][empty]
     [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [target]

   6 fires. Fireproof them all. Find the hidden server.
   ================================================================ */

var JS_32_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-32',
    title: 'JS-32 / BACKTRACK: INFERNO',
    subtitle: 'Return with fireproof. Walk through what once burned.',
    category: 'javascript-ops',
    difficulty: 3,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 3 = backtrack level) -- */
    agent: { tier: 3 },

    /* -- 8x8 Grid -- */
    grid: {
        rows: 8, cols: 8,
        cells: [
            /* Row 0 */ ['gateway',  'empty',    'fire-1',   'empty',    'server-a', 'empty',    'empty',    'empty'],
            /* Row 1 */ ['empty',    'empty',    'empty',    'fire-2',   'empty',    'empty',    'empty',    'empty'],
            /* Row 2 */ ['empty',    'fire-3',   'empty',    'empty',    'empty',    'server-b', 'empty',    'empty'],
            /* Row 3 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'fire-4',   'empty'],
            /* Row 4 */ ['empty',    'empty',    'empty',    'server-c', 'empty',    'empty',    'empty',    'empty'],
            /* Row 5 */ ['empty',    'fire-5',   'empty',    'empty',    'empty',    'empty',    'empty',    'srv-bonus'],
            /* Row 6 */ ['empty',    'empty',    'empty',    'empty',    'fire-6',   'empty',    'server-d', 'empty'],
            /* Row 7 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':   { label: 'GATEWAY',       abbr: 'GTW', ip: '10.320.1.1',   desc: 'Inferno perimeter -- but now you have fireproof',             ports: ['22/SSH', '443/HTTPS'],                    os: 'Cisco ASA 5516-X' },

        /* 4 standard servers */
        'server-a':  { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.320.1.10',  desc: 'Heat sensor array -- fire detection cluster',                ports: ['22/SSH', '443/HTTPS', '8080/HTTP'],       os: 'Ubuntu 24.04 LTS' },
        'server-b':  { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.320.1.11',  desc: 'Suppressant controller -- fire response systems',            ports: ['22/SSH', '502/MODBUS', '5432/PostgreSQL'], os: 'Debian 12 Bookworm' },
        'server-c':  { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.320.1.12',  desc: 'Thermal mapper -- heat distribution analysis',               ports: ['22/SSH', '443/HTTPS', '9200/ELASTIC'],    os: 'CentOS Stream 9' },
        'server-d':  { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.320.1.13',  desc: 'Cooling systems -- automated temperature control',           ports: ['22/SSH', '443/HTTPS', '1883/MQTT'],       os: 'RHEL 9.3' },

        /* Bonus server -- behind fire cluster */
        'srv-bonus': { label: 'SRV-HIDDEN',     abbr: 'SRH', ip: '10.320.1.99',  desc: 'Hidden server -- only trivially reachable with fireproof',   ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* Extraction point */
        'target':    { label: 'EXTRACTION',     abbr: 'EXT', ip: '10.320.1.50',  desc: 'Extraction point -- inferno conquered',                      ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* 6 fires -- fireproof them permanently */
        'fire-1':    { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Thermal breach -- fireproof to pass permanently',                       ports: [] },
        'fire-2':    { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Power surge -- fireproof to pass permanently',                          ports: [] },
        'fire-3':    { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Circuit overload -- fireproof to pass permanently',                     ports: [] },
        'fire-4':    { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Thermal runaway -- fireproof to pass permanently',                      ports: [] },
        'fire-5':    { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Meltdown corridor -- fireproof to pass permanently',                    ports: [] },
        'fire-6':    { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Inferno gate -- fireproof to pass permanently',                         ports: [] }
    },

    /* No traps -- backtrack is a victory lap */
    traps: [],

    /* Obstacles: fires only */
    obstacles: {
        fires: ['fire-1', 'fire-2', 'fire-3', 'fire-4', 'fire-5', 'fire-6']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'FIREPROOF -- Walk through all 6 fires permanently',        check: 'nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2") && nodesDiscovered.has("fire-3") && nodesDiscovered.has("fire-4") && nodesDiscovered.has("fire-5") && nodesDiscovered.has("fire-6")' },
        { id: 'obj_1', label: 'DISCOVER -- Map all 4 standard servers',                    check: 'nodesDiscovered.has("server-a") && nodesDiscovered.has("server-b") && nodesDiscovered.has("server-c") && nodesDiscovered.has("server-d")' },
        { id: 'obj_2', label: 'BONUS -- Reach the hidden server (fireproof path)',         check: 'nodesDiscovered.has("srv-bonus")' },
        { id: 'obj_3', label: 'EXTRACTION -- Reach extraction point',                      check: 'nodesDiscovered.has("target")' }
    ],

    /* 5 integrity -- backtrack is forgiving */
    integrity: 5,

    /* -- Completion screen -- */
    completion: {
        title: 'BACKTRACK: INFERNO',
        subtitle: 'Fireproof mastered. Six fires permanently extinguished. Thermal threats are nothing now.',
        storageKey: 'hexworth_operator_js32'
    }
};
