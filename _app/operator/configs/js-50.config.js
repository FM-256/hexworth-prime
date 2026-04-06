/* ================================================================
   JS-50 / IRON CURTAIN JS -- Mission Config
   ================================================================
   Tier 6 mission. 12x12 grid -- 144 cells.
   THE FINALE. Every tool. Every obstacle. Every JS pattern.
   The ultimate test of JavaScript mastery in the Operator system.

   DESIGN RATIONALE:
   - 12x12 maximum grid -- 144 cells, the largest possible
   - 4 holes + 4 fires + 4 enemies + 2 keys + 2 locked doors + heavy walls
   - 16 obstacle elements total (not counting walls)
   - EVERY permanent tool required: scan, move, jump, extinguish, fight, tunnel, unlock
   - EVERY JS pattern required: async/await, array methods, destructuring,
     closures, Map/Set, error handling, reduce, ternary
   - Dense obstacles force REAL programming -- manual commands won't work
   - 6 servers spread across all quadrants of the grid
   - Completion earns "JavaScript Master Operator" title

   JS SKILL: EVERYTHING -- the full JavaScript arsenal
   - async/await for all operations
   - Array methods: .filter(), .map(), .reduce(), .find(), for...of
   - Destructuring: const { name, direction } = node
   - Map/Set for dispatch tables and deduplication
   - Closures for handler factories
   - Error handling with try/catch
   - Ternary chains for concise classification
   - Template literals for logging
   - This is not one skill -- it's ALL skills combined

   REFERENCE SOLUTION:
     async function ironCurtain() {
         // Master dispatch table -- every tool mapped
         const dispatch = new Map([
             ['HOLE',   async (d) => await agent.jump(d)],
             ['FIRE',   async (d) => await agent.extinguish(d)],
             ['ENEMY',  async (d) => await agent.fight(d)],
             ['LOCKED', async (d) => await agent.unlock(d)],
             ['WALL',   async (d) => await agent.tunnel(d)]
         ]);

         // Intelligence tracking
         const intel = { scans: 0, threats: 0, doors: 0, keys: 0 };
         const threatLog = [];

         while (true) {
             const results = await agent.scan();
             if (results.length === 0) break;
             intel.scans++;

             // Classify all nodes with reduce
             const classified = results.reduce((acc, node) => {
                 const type = [...dispatch.keys()].find(k => node.name.includes(k));
                 const category = type || 'SAFE';
                 (acc[category] = acc[category] || []).push({ ...node, type: category });
                 return acc;
             }, {});

             // Handle threats first, then safe movement
             for (const [type, nodes] of Object.entries(classified)) {
                 for (const { name, direction } of nodes) {
                     if (dispatch.has(type)) {
                         await dispatch.get(type)(direction);
                         intel.threats++;
                         threatLog.push(`${type} @ ${direction}`);
                     } else {
                         await agent.move(direction);
                     }
                 }
             }
         }
     }
     ironCurtain();

   THE COMPLETE ARC -- ALL 50 LEVELS:
   Tier 1 (JS-01 to JS-05): Basics -- scan, move, semicolons, strings
   Tier 2 (JS-06 to JS-12): Variables, loops, conditionals, functions
   Tier 3 (JS-13 to JS-17): Arrays, objects, for...of, destructuring
   Tier 4 (JS-18 to JS-27): Obstacles, callbacks, promises, async/await, keys
   Tier 5 (JS-28 to JS-37): Advanced patterns, closures, higher-order functions
   Tier 6 (JS-38 to JS-50): Full Metroidvania -- tunnel, Map/Set, Promise.all,
                              event patterns, reduce, open-ended, IRON CURTAIN

   GRID LAYOUT (12x12):
     [start]    [empty]    [enemy-1]  [empty]    [key-1]    [empty]    [wall]     [empty]    [empty]    [server-a] [empty]    [empty]
     [empty]    [empty]    [empty]    [hole-1]   [empty]    [fire-1]   [wall]     [empty]    [empty]    [empty]    [empty]    [wall]
     [empty]    [fire-2]   [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-b] [empty]    [empty]    [wall]
     [empty]    [empty]    [wall]     [empty]    [enemy-2]  [empty]    [empty]    [wall]     [empty]    [empty]    [empty]    [empty]
     [wall]     [empty]    [wall]     [empty]    [empty]    [locked-1] [empty]    [wall]     [empty]    [hole-2]   [empty]    [empty]
     [empty]    [enemy-3]  [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-c] [empty]    [wall]     [empty]
     [empty]    [empty]    [empty]    [fire-3]   [empty]    [wall]     [empty]    [empty]    [empty]    [empty]    [wall]     [empty]
     [empty]    [hole-3]   [empty]    [empty]    [empty]    [wall]     [key-2]    [empty]    [empty]    [wall]     [empty]    [empty]
     [empty]    [empty]    [empty]    [enemy-4]  [empty]    [empty]    [empty]    [empty]    [locked-2] [wall]     [server-d] [empty]
     [wall]     [empty]    [fire-4]   [empty]    [empty]    [empty]    [empty]    [hole-4]   [empty]    [empty]    [empty]    [wall]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-e] [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-f] [target]

   4 holes + 4 fires + 4 enemies + 2 keys + 2 locked doors + heavy walls.
   THE IRON CURTAIN. 144 cells. The ultimate JavaScript challenge.
   ================================================================ */

var JS_50_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-50',
    title: 'JS-50 / IRON CURTAIN JS',
    subtitle: 'The finale. Every tool. Every pattern. Prove you are a JavaScript Master Operator.',
    category: 'javascript-ops',
    difficulty: 4,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 4 = full capabilities) -- */
    agent: { tier: 4 },

    /* -- 12x12 Grid -- */
    grid: {
        rows: 12, cols: 12,
        cells: [
            /* Row 0  */ ['gateway',  'empty',    'enemy-1',  'empty',    'key-1',    'empty',    'wall',     'empty',    'empty',    'server-a', 'empty',    'empty'],
            /* Row 1  */ ['empty',    'empty',    'empty',    'hole-1',   'empty',    'fire-1',   'wall',     'empty',    'empty',    'empty',    'empty',    'wall'],
            /* Row 2  */ ['empty',    'fire-2',   'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-b', 'empty',    'empty',    'wall'],
            /* Row 3  */ ['empty',    'empty',    'wall',     'empty',    'enemy-2',  'empty',    'empty',    'wall',     'empty',    'empty',    'empty',    'empty'],
            /* Row 4  */ ['wall',     'empty',    'wall',     'empty',    'empty',    'locked-door-1', 'empty', 'wall',   'empty',    'hole-2',   'empty',    'empty'],
            /* Row 5  */ ['empty',    'enemy-3',  'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-c', 'empty',    'wall',     'empty'],
            /* Row 6  */ ['empty',    'empty',    'empty',    'fire-3',   'empty',    'wall',     'empty',    'empty',    'empty',    'empty',    'wall',     'empty'],
            /* Row 7  */ ['empty',    'hole-3',   'empty',    'empty',    'empty',    'wall',     'key-2',    'empty',    'empty',    'wall',     'empty',    'empty'],
            /* Row 8  */ ['empty',    'empty',    'empty',    'enemy-4',  'empty',    'empty',    'empty',    'empty',    'locked-door-2', 'wall', 'server-d', 'empty'],
            /* Row 9  */ ['wall',     'empty',    'fire-4',   'empty',    'empty',    'empty',    'empty',    'hole-4',   'empty',    'empty',    'empty',    'wall'],
            /* Row 10 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-e', 'empty'],
            /* Row 11 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-f', 'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':      { label: 'GATEWAY',           abbr: 'GTW', ip: '10.500.1.1',   desc: 'The Iron Curtain -- final perimeter breach',         ports: ['22/SSH', '443/HTTPS'],                    os: 'Cisco Firepower 9300' },

        /* 6 target servers -- critical national infrastructure */
        'server-a':     { label: 'SERVER-ALPHA',       abbr: 'SRA', ip: '10.500.1.10',  desc: 'Power grid SCADA -- national grid control',          ports: ['22/SSH', '443/HTTPS', '20000/DNP3'],      os: 'Windows Server 2022' },
        'server-b':     { label: 'SERVER-BRAVO',       abbr: 'SRB', ip: '10.500.1.11',  desc: 'Financial core -- central banking backbone',         ports: ['22/SSH', '443/HTTPS', '8443/SWIFT'],      os: 'Ubuntu 24.04 LTS' },
        'server-c':     { label: 'SERVER-CHARLIE',     abbr: 'SRC', ip: '10.500.1.12',  desc: 'Telecom switch -- national communications',          ports: ['22/SSH', '443/HTTPS', '6633/OPENFLOW'],   os: 'Debian 12 Bookworm' },
        'server-d':     { label: 'SERVER-DELTA',       abbr: 'SRD', ip: '10.500.1.13',  desc: 'Defense network -- classified C2 system',            ports: ['22/SSH', '443/HTTPS', '1194/OPENVPN'],    os: 'RHEL 9.3' },
        'server-e':     { label: 'SERVER-ECHO',        abbr: 'SRE', ip: '10.500.1.14',  desc: 'Healthcare backbone -- national patient records',    ports: ['22/SSH', '443/HTTPS', '2575/HL7'],        os: 'CentOS Stream 9' },
        'server-f':     { label: 'SERVER-FOXTROT',     abbr: 'SRF', ip: '10.500.1.15',  desc: 'Satellite uplink -- orbital communications',         ports: ['22/SSH', '443/HTTPS', '7030/CCSDS'],      os: 'Embedded Linux 6.1' },

        /* Extraction point */
        'target':       { label: 'EXTRACTION',         abbr: 'EXT', ip: '10.500.1.99',  desc: 'EXTRACTION -- JavaScript Master Operator confirmed', ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* 2 keys -- auto-collected on entry */
        'key-1':        { label: 'ACCESS KEY',         abbr: 'KY1', ip: null, desc: 'Master key alpha -- collected automatically',                   ports: [] },
        'key-2':        { label: 'ACCESS KEY',         abbr: 'KY2', ip: null, desc: 'Master key bravo -- collected automatically',                   ports: [] },

        /* 2 locked doors -- blocks until key used */
        'locked-door-1': { label: 'LOCKED DOOR',      abbr: 'LK1', ip: null, desc: 'Iron gate alpha -- use key to open',                            ports: [] },
        'locked-door-2': { label: 'LOCKED DOOR',      abbr: 'LK2', ip: null, desc: 'Iron gate bravo -- use key to open',                            ports: [] },

        /* 4 enemies -- fight required */
        'enemy-1':      { label: 'ENEMY APT',         abbr: 'APT', ip: null, desc: 'Advanced Persistent Threat -- fight to neutralize',             ports: [] },
        'enemy-2':      { label: 'ENEMY ZERO-DAY',    abbr: 'ZDY', ip: null, desc: 'Zero-day exploit -- fight to neutralize',                      ports: [] },
        'enemy-3':      { label: 'ENEMY SUPPLY-CHAIN', abbr: 'SPC', ip: null, desc: 'Supply chain attacker -- fight to neutralize',                ports: [] },
        'enemy-4':      { label: 'ENEMY NATION-STATE', abbr: 'NSA', ip: null, desc: 'Nation-state actor -- fight to neutralize',                   ports: [] },

        /* 4 holes -- jump required */
        'hole-1':       { label: 'HOLE',               abbr: 'HLE', ip: null, desc: 'Infrastructure void -- jump to cross',                        ports: [] },
        'hole-2':       { label: 'HOLE',               abbr: 'HLE', ip: null, desc: 'Defense gap -- jump to cross',                                ports: [] },
        'hole-3':       { label: 'HOLE',               abbr: 'HLE', ip: null, desc: 'Communications blackout -- jump to cross',                    ports: [] },
        'hole-4':       { label: 'HOLE',               abbr: 'HLE', ip: null, desc: 'Satellite link drop -- jump to cross',                        ports: [] },

        /* 4 fires -- extinguish required */
        'fire-1':       { label: 'FIRE',               abbr: 'FIR', ip: null, desc: 'Grid overload fire -- extinguish to pass',                    ports: [] },
        'fire-2':       { label: 'FIRE',               abbr: 'FIR', ip: null, desc: 'Financial meltdown blaze -- extinguish to pass',              ports: [] },
        'fire-3':       { label: 'FIRE',               abbr: 'FIR', ip: null, desc: 'Telecom fire -- extinguish to pass',                         ports: [] },
        'fire-4':       { label: 'FIRE',               abbr: 'FIR', ip: null, desc: 'Reactor warning fire -- extinguish to pass',                 ports: [] }
    },

    /* No traps */
    traps: [],

    /* Obstacles: maximum density */
    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3', 'hole-4'],
        fires: ['fire-1', 'fire-2', 'fire-3', 'fire-4'],
        enemies: ['enemy-1', 'enemy-2', 'enemy-3', 'enemy-4']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'COLLECT -- Find both master keys',                          check: 'nodesDiscovered.has("key-1") && nodesDiscovered.has("key-2")' },
        { id: 'obj_1', label: 'UNLOCK -- Open both iron gates',                            check: 'nodesDiscovered.has("locked-door-1") && nodesDiscovered.has("locked-door-2")' },
        { id: 'obj_2', label: 'DISCOVER -- Map all 6 critical servers',                    check: 'nodesDiscovered.has("server-a") && nodesDiscovered.has("server-b") && nodesDiscovered.has("server-c") && nodesDiscovered.has("server-d") && nodesDiscovered.has("server-e") && nodesDiscovered.has("server-f")' },
        { id: 'obj_3', label: 'COMBAT -- Neutralize all 4 nation-level threats',           check: 'nodesDiscovered.has("enemy-1") && nodesDiscovered.has("enemy-2") && nodesDiscovered.has("enemy-3") && nodesDiscovered.has("enemy-4")' },
        { id: 'obj_4', label: 'NAVIGATE -- Handle all environmental hazards',              check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3") && nodesDiscovered.has("hole-4") && nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2") && nodesDiscovered.has("fire-3") && nodesDiscovered.has("fire-4")' },
        { id: 'obj_5', label: 'EXTRACTION -- Reach the extraction point',                  check: 'nodesDiscovered.has("target")' },
        { id: 'obj_6', label: 'MASTER -- 6+ integrity remaining',                          check: 'integrity >= 6' }
    ],

    /* 10 integrity -- 16 obstacle elements on maximum grid */
    integrity: 10,

    /* -- Completion screen -- */
    completion: {
        title: 'IRON CURTAIN JS',
        subtitle: 'Level 50. The Iron Curtain falls. JavaScript Master Operator confirmed. Every tool. Every pattern. Every obstacle. Mastered.',
        storageKey: 'hexworth_operator_js50'
    }
};
