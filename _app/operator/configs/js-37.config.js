/* ================================================================
   JS-37 / THE EXCAVATOR -- Mission Config
   ================================================================
   *** EARN TUNNEL PERMANENT TOOL -- GRID PICKUP ***
   *** FINAL PERMANENT TOOL -- FULL METROIDVANIA TOOLKIT ***
   Tier 5 mission. 11x11 grid -- 121 cells.
   The tunnel tool is a PICKUP NODE on the grid, behind ALL THREE
   obstacle types: holes, fires, AND enemies. Student must have
   bridge (JS-28), fireproof (JS-31), AND terminate (JS-34) to
   reach it.

   Metroidvania chain (COMPLETE):
     bridge (JS-28) -> fireproof (JS-31) -> terminate (JS-34) -> tunnel (JS-37)
   After this level, the student has the full permanent toolkit.

   DESIGN RATIONALE:
   - 11x11 grid -- the largest grid in the Tier 5 arc
   - The tunnel tool is at position (8,9) behind a layered gauntlet:
     * Holes first (need bridge)
     * Then fires (need fireproof)
     * Then enemies (need terminate)
   - All 3 permanent tools must be used in sequence to reach the
     tunnel tool -- the ultimate Metroidvania gate
   - 4 holes, 3 fires, 3 enemies scattered throughout
   - 4 servers require full grid exploration
   - After collecting tunnel, agent.tunnel(direction) bypasses walls

   JS SKILL: Full toolkit mastery + grid-pickup acquisition
   - Every permanent tool used to reach the final permanent tool
   - Student has mastered: bridge, fireproof, terminate
   - tunnel completes the toolkit -- walls become optional

   REFERENCE SOLUTION:
     async function theExcavator() {
         const results = await agent.scan();
         for (const node of results) {
             const { name, direction } = node;
             if (name.includes('HOLE')) {
                 await agent.bridge(direction);
             } else if (name.includes('FIRE')) {
                 await agent.fireproof(direction);
             } else if (name.includes('ENEMY')) {
                 await agent.terminate(direction);
             } else if (name.includes('TUNNEL TOOL')) {
                 await agent.move(direction);  // auto-pickup
             } else {
                 await agent.move(direction);
             }
         }
     }
     theExcavator();

   WHY THIS WORKS:
   - All 3 prior tools required to reach the 4th -- peak gating
   - tunnel is the FINAL permanent tool -- the toolkit is complete
   - After this, the student has: bridge, fireproof, terminate, tunnel
   - Future levels can use walls as meaningful obstacles for the first time
   - The Metroidvania progression is now fully established

   GRID LAYOUT (11x11):
     [start]  [empty]  [hole-1] [empty]  [empty]  [fire-1] [empty]  [empty]  [empty]  [empty]  [empty]
     [empty]  [empty]  [empty]  [empty]  [server-a][empty]  [empty]  [enemy-1][empty]  [empty]  [wall]
     [empty]  [fire-2] [empty]  [empty]  [empty]  [empty]  [hole-2] [empty]  [empty]  [empty]  [empty]
     [wall]   [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [server-b][empty]  [empty]
     [empty]  [empty]  [enemy-2][empty]  [empty]  [empty]  [fire-3] [empty]  [empty]  [empty]  [wall]
     [empty]  [empty]  [empty]  [empty]  [server-c][empty]  [empty]  [empty]  [empty]  [empty]  [empty]
     [empty]  [hole-3] [empty]  [empty]  [empty]  [empty]  [empty]  [enemy-3][empty]  [empty]  [empty]
     [wall]   [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [empty]  [wall]
     [empty]  [empty]  [empty]  [hole-4] [empty]  [empty]  [empty]  [empty]  [empty]  [tool-tnl][empty]
     [empty]  [empty]  [empty]  [empty]  [empty]  [server-d][empty]  [empty]  [empty]  [empty]  [empty]
     [wall]   [wall]   [empty]  [empty]  [empty]  [empty]  [wall]   [empty]  [empty]  [empty]  [target]

   4 holes + 3 fires + 3 enemies. Tunnel tool at (8,9). ALL tools needed.
   ================================================================ */

var JS_37_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-37',
    title: 'JS-37 / THE EXCAVATOR',
    subtitle: 'Find the tunnel tool. Every previous tool is needed.',
    category: 'javascript-ops',
    difficulty: 4,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 4 = full capabilities) -- */
    agent: { tier: 4 },

    /* -- 11x11 Grid -- */
    grid: {
        rows: 11, cols: 11,
        cells: [
            /* Row 0  */ ['gateway',  'empty',    'hole-1',   'empty',    'empty',    'fire-1',   'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 1  */ ['empty',    'empty',    'empty',    'empty',    'server-a', 'empty',    'empty',    'enemy-1',  'empty',    'empty',    'wall'],
            /* Row 2  */ ['empty',    'fire-2',   'empty',    'empty',    'empty',    'empty',    'hole-2',   'empty',    'empty',    'empty',    'empty'],
            /* Row 3  */ ['wall',     'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-b', 'empty',    'empty'],
            /* Row 4  */ ['empty',    'empty',    'enemy-2',  'empty',    'empty',    'empty',    'fire-3',   'empty',    'empty',    'empty',    'wall'],
            /* Row 5  */ ['empty',    'empty',    'empty',    'empty',    'server-c', 'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 6  */ ['empty',    'hole-3',   'empty',    'empty',    'empty',    'empty',    'empty',    'enemy-3',  'empty',    'empty',    'empty'],
            /* Row 7  */ ['wall',     'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'wall'],
            /* Row 8  */ ['empty',    'empty',    'empty',    'hole-4',   'empty',    'empty',    'empty',    'empty',    'empty',    'tool-tunnel','empty'],
            /* Row 9  */ ['empty',    'empty',    'empty',    'empty',    'empty',    'server-d', 'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 10 */ ['wall',     'wall',     'empty',    'empty',    'empty',    'empty',    'wall',     'empty',    'empty',    'empty',    'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':     { label: 'GATEWAY',       abbr: 'GTW', ip: '10.370.1.1',   desc: 'Excavation site perimeter -- the final tool awaits',         ports: ['22/SSH', '443/HTTPS'],                    os: 'Cisco Firepower 4110' },

        /* 4 target servers -- excavation network */
        'server-a':    { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.370.1.10',  desc: 'Geological survey -- subsurface topology mapper',           ports: ['22/SSH', '443/HTTPS', '8080/HTTP'],       os: 'Ubuntu 24.04 LTS' },
        'server-b':    { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.370.1.11',  desc: 'Bore controller -- tunnel drilling sequencer',              ports: ['22/SSH', '502/MODBUS', '5432/PostgreSQL'],os: 'Debian 12 Bookworm' },
        'server-c':    { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.370.1.12',  desc: 'Structural analyzer -- wall composition database',          ports: ['22/SSH', '443/HTTPS', '9200/ELASTIC'],    os: 'CentOS Stream 9' },
        'server-d':    { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.370.1.13',  desc: 'Excavation manifest -- tunnel capability registry',         ports: ['22/SSH', '443/HTTPS', '8443/MGMT'],       os: 'RHEL 9.3' },

        /* Extraction point */
        'target':      { label: 'EXTRACTION',     abbr: 'EXT', ip: '10.370.1.99',  desc: 'Extraction point -- all tools collected',                   ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* TOOL PICKUP -- tunnel. Behind ALL 3 obstacle types. */
        'tool-tunnel': { label: 'TUNNEL TOOL',    abbr: 'TNL', ip: null, desc: '*** PERMANENT TOOL *** Walk onto this to bypass walls permanently',    ports: [] },

        /* 4 holes -- bridge required */
        'hole-1':      { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Surface gap -- bridge to cross',                                      ports: [] },
        'hole-2':      { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Excavation void -- bridge to cross',                                  ports: [] },
        'hole-3':      { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Sinkhole -- bridge to cross',                                         ports: [] },
        'hole-4':      { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Final gap guarding tunnel tool -- bridge to cross',                    ports: [] },

        /* 3 fires -- fireproof required */
        'fire-1':      { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Magma vent -- fireproof to pass',                                     ports: [] },
        'fire-2':      { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Thermal pocket -- fireproof to pass',                                 ports: [] },
        'fire-3':      { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Geothermal breach -- fireproof to pass',                              ports: [] },

        /* 3 enemies -- terminate required */
        'enemy-1':     { label: 'ENEMY GUARD',    abbr: 'GRD', ip: null, desc: 'Excavation guard -- terminate to pass',                               ports: [] },
        'enemy-2':     { label: 'ENEMY DRONE',    abbr: 'DRN', ip: null, desc: 'Security drone -- terminate to pass',                                 ports: [] },
        'enemy-3':     { label: 'ENEMY SENTRY',   abbr: 'SNT', ip: null, desc: 'Final sentry guarding tunnel tool -- terminate to pass',              ports: [] }
    },

    /* No traps */
    traps: [],

    /* Obstacles: all 3 types -- ALL required to reach tunnel */
    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3', 'hole-4'],
        fires: ['fire-1', 'fire-2', 'fire-3'],
        enemies: ['enemy-1', 'enemy-2', 'enemy-3']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'ACQUIRE -- Find TUNNEL tool (all 3 tools needed to reach)', check: 'nodesDiscovered.has("tool-tunnel")' },
        { id: 'obj_1', label: 'BRIDGE -- Cross all 4 holes permanently',                    check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3") && nodesDiscovered.has("hole-4")' },
        { id: 'obj_2', label: 'FIREPROOF -- Walk through all 3 fires',                      check: 'nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2") && nodesDiscovered.has("fire-3")' },
        { id: 'obj_3', label: 'TERMINATE -- Eliminate all 3 enemies',                        check: 'nodesDiscovered.has("enemy-1") && nodesDiscovered.has("enemy-2") && nodesDiscovered.has("enemy-3")' },
        { id: 'obj_4', label: 'DISCOVER -- Map all 4 excavation servers',                    check: 'nodesDiscovered.has("server-a") && nodesDiscovered.has("server-b") && nodesDiscovered.has("server-c") && nodesDiscovered.has("server-d")' },
        { id: 'obj_5', label: 'EXTRACTION -- Reach extraction point',                       check: 'nodesDiscovered.has("target")' }
    ],

    /* 7 integrity -- generous for the final tool-earning level */
    integrity: 7,

    /* -- Completion screen -- */
    completion: {
        title: 'THE EXCAVATOR',
        subtitle: '*** TUNNEL TOOL ACQUIRED *** Walls can now be bypassed permanently. ALL TOOLS COLLECTED.',
        storageKey: 'hexworth_operator_js37'
    }
};
