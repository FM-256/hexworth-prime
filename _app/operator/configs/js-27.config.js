/* ================================================================
   JS-27 / THE GAUNTLET -- Mission Config
   ================================================================
   Tier 4 mission. 10x10 grid -- 100 cells.
   EVERYTHING COMBINED. The culmination of Tier 4.
   All obstacle types, locked doors, async/await, array methods,
   destructuring, and comprehensive if/else handling.

   DESIGN RATIONALE:
   - 10x10 grid packed with every obstacle type learned so far
   - 3 holes + 3 fires + 3 enemies + 2 locked doors = 11 obstacles
   - 2 keys must be found before locked doors can be opened
   - Student must combine async/await, destructuring, array methods
   - The full obstacle handler: scan -> classify -> respond
   - This is the Tier 4 capstone -- proves mastery of the entire async arc

   JS SKILL: Full obstacle handling with async/await
   - async function with await for every operation
   - Destructuring: const { name, direction } = node
   - Array methods: .filter(), .forEach(), for...of
   - Multi-branch if/else: HOLE -> jump, FIRE -> extinguish, ENEMY -> fight, LOCKED -> unlock
   - Route planning: collect keys before reaching locked doors

   REFERENCE SOLUTION:
     async function runGauntlet() {
         const results = await agent.scan();
         for (const node of results) {
             const { name, direction } = node;
             if (name.includes('HOLE')) {
                 await agent.jump(direction);
             } else if (name.includes('FIRE')) {
                 await agent.extinguish(direction);
             } else if (name.includes('ENEMY')) {
                 await agent.fight(direction);
             } else if (name.includes('LOCKED')) {
                 await agent.unlock(direction);
             } else {
                 await agent.move(direction);
             }
         }
     }
     runGauntlet();

   THE FULL ARC -- TIER 4 COMPLETE:
   - JS-18: Holes introduced (agent.jump)
   - JS-19: Callbacks introduced (functions as arguments)
   - JS-20: Fires introduced (agent.extinguish in callbacks)
   - JS-21: Callback hell (the pyramid of doom)
   - JS-22: Promises (.then() chains flatten the pyramid)
   - JS-23: Enemies + arrow functions in promise chains
   - JS-24: Enemy-heavy promise handling
   - JS-25: async/await (clean linear async code)
   - JS-26: Keys + locked doors (state-dependent async)
   - JS-27: THE GAUNTLET (everything combined)

   GRID LAYOUT (10x10):
     [start]    [empty]    [enemy-1]  [empty]    [key-1]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [hole-1]   [empty]    [empty]    [server-a] [empty]    [empty]    [wall]
     [empty]    [fire-1]   [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [locked-1] [empty]    [server-b] [empty]    [empty]    [empty]
     [empty]    [empty]    [enemy-2]  [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [fire-2]   [empty]    [empty]    [empty]    [server-c] [empty]    [wall]
     [empty]    [hole-2]   [empty]    [empty]    [empty]    [enemy-3]  [empty]    [empty]    [key-2]    [empty]
     [empty]    [empty]    [empty]    [empty]    [fire-3]   [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [hole-3]   [empty]    [empty]    [locked-2] [empty]    [server-d] [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-e] [target]

   3 holes + 3 fires + 3 enemies + 2 locked doors. The full gauntlet.
   ================================================================ */

var JS_27_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-27',
    title: 'JS-27 / THE GAUNTLET',
    subtitle: 'Every obstacle. Every tool. Tier 4 culmination.',
    category: 'javascript-ops',
    difficulty: 4,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 4 = full capabilities) -- */
    agent: { tier: 4 },

    /* -- 10x10 Grid -- */
    grid: {
        rows: 10, cols: 10,
        cells: [
            /* Row 0 */ ['gateway',  'empty',    'enemy-1',  'empty',    'key-1',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 1 */ ['empty',    'empty',    'empty',    'hole-1',   'empty',    'empty',    'server-a', 'empty',    'empty',    'wall'],
            /* Row 2 */ ['empty',    'fire-1',   'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 3 */ ['empty',    'empty',    'empty',    'empty',    'locked-door-1','empty','server-b', 'empty',    'empty',    'empty'],
            /* Row 4 */ ['empty',    'empty',    'enemy-2',  'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 5 */ ['empty',    'empty',    'empty',    'fire-2',   'empty',    'empty',    'empty',    'server-c', 'empty',    'wall'],
            /* Row 6 */ ['empty',    'hole-2',   'empty',    'empty',    'empty',    'enemy-3',  'empty',    'empty',    'key-2',    'empty'],
            /* Row 7 */ ['empty',    'empty',    'empty',    'empty',    'fire-3',   'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 8 */ ['empty',    'empty',    'empty',    'hole-3',   'empty',    'empty',    'locked-door-2','empty','server-d', 'empty'],
            /* Row 9 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-e', 'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':      { label: 'GATEWAY',           abbr: 'GTW', ip: '10.270.1.1',   desc: 'Final perimeter -- the gauntlet awaits',             ports: ['22/SSH', '443/HTTPS'],                    os: 'Cisco Firepower 4110' },

        /* 5 target servers -- critical infrastructure network */
        'server-a':     { label: 'SERVER-ALPHA',       abbr: 'SRA', ip: '10.270.1.10',  desc: 'Power grid SCADA -- supervisory control',            ports: ['22/SSH', '443/HTTPS', '20000/DNP3'],      os: 'Windows Server 2022' },
        'server-b':     { label: 'SERVER-BRAVO',       abbr: 'SRB', ip: '10.270.1.11',  desc: 'Water treatment PLC -- process automation',          ports: ['22/SSH', '502/MODBUS', '44818/EIP'],      os: 'Embedded Linux 5.15' },
        'server-c':     { label: 'SERVER-CHARLIE',     abbr: 'SRC', ip: '10.270.1.12',  desc: 'Traffic control system -- signal management',        ports: ['22/SSH', '443/HTTPS', '1883/MQTT'],       os: 'Ubuntu 24.04 LTS' },
        'server-d':     { label: 'SERVER-DELTA',       abbr: 'SRD', ip: '10.270.1.13',  desc: 'Telecom backbone -- core network switch',            ports: ['22/SSH', '830/NETCONF', '6633/OPENFLOW'], os: 'Debian 12 Bookworm' },
        'server-e':     { label: 'SERVER-ECHO',        abbr: 'SRE', ip: '10.270.1.14',  desc: 'Emergency services dispatch -- 911 CAD system',      ports: ['22/SSH', '443/HTTPS', '5060/SIP'],        os: 'RHEL 9.3' },

        /* Extraction point */
        'target':       { label: 'EXTRACTION',         abbr: 'EXT', ip: '10.270.1.99',  desc: 'Extraction point -- gauntlet complete',              ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* 2 keys -- auto-collected on entry */
        'key-1':        { label: 'ACCESS KEY',         abbr: 'KY1', ip: null, desc: 'Tier 1 clearance credential -- collected automatically',       ports: [] },
        'key-2':        { label: 'ACCESS KEY',         abbr: 'KY2', ip: null, desc: 'Tier 2 clearance credential -- collected automatically',       ports: [] },

        /* 2 locked doors -- blocks until key used */
        'locked-door-1':{ label: 'LOCKED DOOR',        abbr: 'LK1', ip: null, desc: 'Security checkpoint alpha -- use key to open',                 ports: [] },
        'locked-door-2':{ label: 'LOCKED DOOR',        abbr: 'LK2', ip: null, desc: 'Security checkpoint bravo -- use key to open',                 ports: [] },

        /* 3 enemies -- fight required */
        'enemy-1':      { label: 'ENEMY WORM',         abbr: 'WRM', ip: null, desc: 'Self-replicating worm -- fight to neutralize',                ports: [] },
        'enemy-2':      { label: 'ENEMY TROJAN',       abbr: 'TRJ', ip: null, desc: 'Trojan payload -- fight to neutralize',                      ports: [] },
        'enemy-3':      { label: 'ENEMY BACKDOOR',     abbr: 'BKD', ip: null, desc: 'Persistent backdoor -- fight to neutralize',                 ports: [] },

        /* 3 holes -- jump required */
        'hole-1':       { label: 'HOLE',               abbr: 'HLE', ip: null, desc: 'SCADA network gap -- jump to cross',                         ports: [] },
        'hole-2':       { label: 'HOLE',               abbr: 'HLE', ip: null, desc: 'Control system void -- jump to cross',                       ports: [] },
        'hole-3':       { label: 'HOLE',               abbr: 'HLE', ip: null, desc: 'Backbone fracture -- jump to cross',                         ports: [] },

        /* 3 fires -- extinguish required */
        'fire-1':       { label: 'FIRE',               abbr: 'FIR', ip: null, desc: 'Power surge fire -- extinguish to pass',                     ports: [] },
        'fire-2':       { label: 'FIRE',               abbr: 'FIR', ip: null, desc: 'Thermal runaway -- extinguish to pass',                      ports: [] },
        'fire-3':       { label: 'FIRE',               abbr: 'FIR', ip: null, desc: 'Circuit overload blaze -- extinguish to pass',               ports: [] }
    },

    /* No traps -- obstacles are the full challenge */
    traps: [],

    /* Obstacles: everything */
    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3'],
        fires: ['fire-1', 'fire-2', 'fire-3'],
        enemies: ['enemy-1', 'enemy-2', 'enemy-3']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'COLLECT -- Find both access keys',                     check: 'nodesDiscovered.has("key-1") && nodesDiscovered.has("key-2")' },
        { id: 'obj_1', label: 'UNLOCK -- Open both locked doors',                     check: 'nodesDiscovered.has("locked-door-1") && nodesDiscovered.has("locked-door-2")' },
        { id: 'obj_2', label: 'DISCOVER -- Map all 5 critical servers',                check: 'nodesDiscovered.has("server-a") && nodesDiscovered.has("server-b") && nodesDiscovered.has("server-c") && nodesDiscovered.has("server-d") && nodesDiscovered.has("server-e")' },
        { id: 'obj_3', label: 'COMBAT -- Neutralize all 3 malware threats',            check: 'nodesDiscovered.has("enemy-1") && nodesDiscovered.has("enemy-2") && nodesDiscovered.has("enemy-3")' },
        { id: 'obj_4', label: 'NAVIGATE -- Handle all holes and fires',                check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3") && nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2") && nodesDiscovered.has("fire-3")' },
        { id: 'obj_5', label: 'EXTRACTION -- Reach the extraction point',              check: 'nodesDiscovered.has("target")' },
        { id: 'obj_6', label: 'STEALTH -- 4+ integrity remaining',                    check: 'integrity >= 4' }
    ],

    /* 7 integrity -- 13 total obstacles (3+3+3+2 doors+2 keys) */
    integrity: 7,

    /* -- Completion screen -- */
    completion: {
        title: 'THE GAUNTLET',
        subtitle: 'Every obstacle. Every tool. Tier 4 complete. The async arc mastered.',
        storageKey: 'hexworth_operator_js27'
    }
};
