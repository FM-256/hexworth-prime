/* ================================================================
   JS-43 / BACKTRACK -- MEGA -- Mission Config
   ================================================================
   Tier 6 mission. 11x11 grid -- 121 cells.
   MEGA BACKTRACK. A revisited large grid where ALL tools -- including
   tunnel -- unlock previously hidden sections. The full toolkit unleashed.

   DESIGN RATIONALE:
   - 11x11 grid with heavy wall partitions creating 4 distinct zones
   - 3 holes + 3 fires + 3 enemies across all zones
   - Heavy walls block direct paths -- tunnel is required to reach hidden areas
   - Each zone contains servers that can only be accessed with specific tools
   - Zone 1: holes blocking path (need jump)
   - Zone 2: fires blocking path (need extinguish)
   - Zone 3: enemies guarding path (need fight)
   - Zone 4: walls isolating servers (need tunnel)
   - The backtrack lesson: "with all tools, the whole grid opens up"

   JS SKILL: Full toolkit orchestration
   - Every permanent tool: scan, move, jump, extinguish, fight, tunnel, unlock
   - Student must write a COMPREHENSIVE handler that covers all cases
   - Code organization matters -- function extraction, clean dispatch
   - This is about CODE QUALITY, not just making it work

   REFERENCE SOLUTION:
     async function mega() {
         // Comprehensive threat dispatcher
         const dispatch = async ({ name, direction }) => {
             if (name.includes('HOLE'))   return await agent.jump(direction);
             if (name.includes('FIRE'))   return await agent.extinguish(direction);
             if (name.includes('ENEMY'))  return await agent.fight(direction);
             if (name.includes('LOCKED')) return await agent.unlock(direction);
             if (name === 'WALL')         return await agent.tunnel(direction);
             return await agent.move(direction);
         };

         // Scan-and-dispatch loop
         while (true) {
             const results = await agent.scan();
             if (results.length === 0) break;
             for (const node of results) {
                 await dispatch(node);
             }
         }
     }
     mega();

   WHY MEGA BACKTRACK:
   - Tests comprehensive tool mastery -- no tool left unused
   - Wall-partitioned zones force creative routing
   - Student must recognize that walls + tunnel = new paths
   - Prepares for the final levels where EVERYTHING is on the table

   GRID LAYOUT (11x11):
     [start]    [empty]    [wall]     [empty]    [server-a] [wall]     [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [hole-1]   [wall]     [empty]    [empty]    [wall]     [empty]    [enemy-1]  [empty]    [empty]    [empty]
     [empty]    [empty]    [wall]     [empty]    [empty]    [empty]    [empty]    [empty]    [server-b] [empty]    [wall]
     [empty]    [empty]    [empty]    [empty]    [wall]     [wall]     [wall]     [empty]    [empty]    [empty]    [wall]
     [wall]     [fire-1]   [empty]    [empty]    [wall]     [server-c] [wall]     [empty]    [empty]    [empty]    [empty]
     [wall]     [empty]    [empty]    [hole-2]   [empty]    [empty]    [empty]    [empty]    [fire-2]   [empty]    [empty]
     [empty]    [empty]    [wall]     [empty]    [empty]    [wall]     [empty]    [empty]    [empty]    [server-d] [empty]
     [empty]    [empty]    [wall]     [enemy-2]  [empty]    [wall]     [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [fire-3]   [wall]     [empty]    [hole-3]   [empty]    [empty]    [wall]
     [empty]    [enemy-3]  [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-e] [wall]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [target]

   Heavy walls partition grid into zones. 3 holes + 3 fires + 3 enemies. All tools needed.
   ================================================================ */

var JS_43_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-43',
    title: 'JS-43 / BACKTRACK -- MEGA',
    subtitle: 'All tools. All zones. The full toolkit unleashed on a mega grid.',
    category: 'javascript-ops',
    difficulty: 4,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 4 = full capabilities) -- */
    agent: { tier: 4 },

    /* -- 11x11 Grid -- */
    grid: {
        rows: 11, cols: 11,
        cells: [
            /* Row 0  */ ['gateway',  'empty',    'wall',     'empty',    'server-a', 'wall',     'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 1  */ ['empty',    'hole-1',   'wall',     'empty',    'empty',    'wall',     'empty',    'enemy-1',  'empty',    'empty',    'empty'],
            /* Row 2  */ ['empty',    'empty',    'wall',     'empty',    'empty',    'empty',    'empty',    'empty',    'server-b', 'empty',    'wall'],
            /* Row 3  */ ['empty',    'empty',    'empty',    'empty',    'wall',     'wall',     'wall',     'empty',    'empty',    'empty',    'wall'],
            /* Row 4  */ ['wall',     'fire-1',   'empty',    'empty',    'wall',     'server-c', 'wall',     'empty',    'empty',    'empty',    'empty'],
            /* Row 5  */ ['wall',     'empty',    'empty',    'hole-2',   'empty',    'empty',    'empty',    'empty',    'fire-2',   'empty',    'empty'],
            /* Row 6  */ ['empty',    'empty',    'wall',     'empty',    'empty',    'wall',     'empty',    'empty',    'empty',    'server-d', 'empty'],
            /* Row 7  */ ['empty',    'empty',    'wall',     'enemy-2',  'empty',    'wall',     'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 8  */ ['empty',    'empty',    'empty',    'empty',    'fire-3',   'wall',     'empty',    'hole-3',   'empty',    'empty',    'wall'],
            /* Row 9  */ ['empty',    'enemy-3',  'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-e', 'wall'],
            /* Row 10 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':  { label: 'GATEWAY',       abbr: 'GTW', ip: '10.430.1.1',   desc: 'Mega facility perimeter -- all zones accessible',        ports: ['22/SSH', '443/HTTPS'],                    os: 'Check Point 6800' },

        /* 5 target servers -- multi-zone facility */
        'server-a': { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.430.1.10',  desc: 'Zone 1 control server -- jump zone',                     ports: ['22/SSH', '443/HTTPS', '502/MODBUS'],      os: 'Windows 10 IoT Enterprise' },
        'server-b': { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.430.1.11',  desc: 'Zone 2 command server -- enemy territory',               ports: ['22/SSH', '443/HTTPS', '1883/MQTT'],       os: 'Ubuntu 24.04 LTS' },
        'server-c': { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.430.1.12',  desc: 'Zone 3 core server -- walled compound',                  ports: ['22/SSH', '3306/MySQL', '6379/REDIS'],     os: 'Debian 12 Bookworm' },
        'server-d': { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.430.1.13',  desc: 'Zone 4 vault server -- tunnel-only access',              ports: ['22/SSH', '443/HTTPS', '8200/VAULT'],      os: 'CentOS Stream 9' },
        'server-e': { label: 'SERVER-ECHO',    abbr: 'SRE', ip: '10.430.1.14',  desc: 'Zone 5 extraction prep -- final staging',                ports: ['22/SSH', '443/HTTPS', '9090/PROMETHEUS'], os: 'RHEL 9.3' },

        /* Extraction point */
        'target':   { label: 'EXTRACTION',     abbr: 'EXT', ip: '10.430.1.99',  desc: 'Extraction point -- mega backtrack complete',            ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* 3 enemies -- fight required */
        'enemy-1':  { label: 'ENEMY SENTRY',    abbr: 'SNT', ip: null, desc: 'Zone sentry -- fight to neutralize',                              ports: [] },
        'enemy-2':  { label: 'ENEMY PATROL',     abbr: 'PTR', ip: null, desc: 'Roaming patrol -- fight to neutralize',                           ports: [] },
        'enemy-3':  { label: 'ENEMY GUARD',      abbr: 'GRD', ip: null, desc: 'Zone guard -- fight to neutralize',                               ports: [] },

        /* 3 holes -- jump required */
        'hole-1':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Zone breach -- jump to cross',                                     ports: [] },
        'hole-2':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Facility gap -- jump to cross',                                    ports: [] },
        'hole-3':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Structural void -- jump to cross',                                 ports: [] },

        /* 3 fires -- extinguish required */
        'fire-1':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Containment breach fire -- extinguish to pass',                    ports: [] },
        'fire-2':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Power grid fire -- extinguish to pass',                            ports: [] },
        'fire-3':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Coolant failure blaze -- extinguish to pass',                      ports: [] }
    },

    /* No traps */
    traps: [],

    /* Obstacles: balanced across zones */
    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3'],
        fires: ['fire-1', 'fire-2', 'fire-3'],
        enemies: ['enemy-1', 'enemy-2', 'enemy-3']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER -- Map all 5 zone servers',                        check: 'nodesDiscovered.has("server-a") && nodesDiscovered.has("server-b") && nodesDiscovered.has("server-c") && nodesDiscovered.has("server-d") && nodesDiscovered.has("server-e")' },
        { id: 'obj_1', label: 'COMBAT -- Neutralize all 3 zone threats',                   check: 'nodesDiscovered.has("enemy-1") && nodesDiscovered.has("enemy-2") && nodesDiscovered.has("enemy-3")' },
        { id: 'obj_2', label: 'NAVIGATE -- Handle all holes and fires',                    check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3") && nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2") && nodesDiscovered.has("fire-3")' },
        { id: 'obj_3', label: 'EXTRACTION -- Reach the extraction point',                  check: 'nodesDiscovered.has("target")' },
        { id: 'obj_4', label: 'STEALTH -- 5+ integrity remaining',                         check: 'integrity >= 5' }
    ],

    /* 8 integrity -- 9 obstacles + heavy walls to tunnel */
    integrity: 8,

    /* -- Completion screen -- */
    completion: {
        title: 'BACKTRACK -- MEGA',
        subtitle: 'All five zones cleared. Every tool deployed. Mega backtrack conquered.',
        storageKey: 'hexworth_operator_js43'
    }
};
