/* ================================================================
   JS-40 / MAP AND SET -- Mission Config
   ================================================================
   Tier 6 mission. 10x10 grid -- 100 cells.
   Map and Set data structures applied to threat classification.
   The student uses new Set() to track unique threat types encountered
   and new Map() to build a threat response lookup table.

   DESIGN RATIONALE:
   - 10x10 grid with balanced obstacle mix: 3 holes + 3 fires + 3 enemies
   - Student must CLASSIFY threats, not just react to them
   - Set tracks unique threat types seen: new Set(['HOLE', 'FIRE', 'ENEMY'])
   - Map provides O(1) lookup for response actions
   - 5 servers distributed across grid -- obstacles guard every path
   - Forces the student to think about DATA STRUCTURES, not just control flow

   JS SKILL: Map and Set
   - new Set() -- collection of unique values, no duplicates
   - new Map() -- key-value pairs with any type as key
   - Set operations: .add(), .has(), .size
   - Map operations: .set(), .get(), .has()
   - Real use: new Set(results.map(n => n.type)) to find unique threat types
   - Real use: Map to build threat->action lookup table

   REFERENCE SOLUTION:
     async function mapAndSet() {
         // Build response lookup table
         const responses = new Map();
         responses.set('HOLE', async (dir) => await agent.jump(dir));
         responses.set('FIRE', async (dir) => await agent.extinguish(dir));
         responses.set('ENEMY', async (dir) => await agent.fight(dir));

         // Track unique threat types encountered
         const threatsSeen = new Set();

         let results = await agent.scan();
         for (const { name, direction } of results) {
             // Classify and track
             const type = name.includes('HOLE') ? 'HOLE'
                        : name.includes('FIRE') ? 'FIRE'
                        : name.includes('ENEMY') ? 'ENEMY' : null;

             if (type) {
                 threatsSeen.add(type);
                 const action = responses.get(type);
                 await action(direction);
             } else {
                 await agent.move(direction);
             }
         }
         // threatsSeen.size === 3 means all types encountered
     }
     mapAndSet();

   WHY MAP AND SET:
   - Set eliminates duplicates -- scan 10 nodes, only 3 unique threat types
   - Map replaces long if/else chains with clean lookups
   - Both are ES6 features every JS developer should know
   - Real-world: caching, deduplication, routing tables, event dispatchers

   GRID LAYOUT (10x10):
     [start]    [empty]    [enemy-1]  [empty]    [empty]    [server-a] [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [hole-1]   [empty]    [empty]    [empty]    [empty]    [empty]    [wall]
     [empty]    [fire-1]   [empty]    [empty]    [empty]    [empty]    [server-b] [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [fire-2]   [empty]    [empty]    [empty]    [empty]    [wall]     [empty]
     [empty]    [hole-2]   [empty]    [empty]    [empty]    [enemy-2]  [empty]    [empty]    [empty]    [empty]
     [wall]     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-c] [empty]    [empty]
     [empty]    [empty]    [enemy-3]  [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [wall]
     [empty]    [empty]    [empty]    [empty]    [hole-3]   [empty]    [empty]    [server-d] [empty]    [empty]
     [empty]    [fire-3]   [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-e] [target]

   3 holes + 3 fires + 3 enemies. Map for lookups. Set for deduplication.
   ================================================================ */

var JS_40_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-40',
    title: 'JS-40 / MAP AND SET',
    subtitle: 'New data structures. Map for lookups. Set for deduplication.',
    category: 'javascript-ops',
    difficulty: 4,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 4 = full capabilities) -- */
    agent: { tier: 4 },

    /* -- 10x10 Grid -- */
    grid: {
        rows: 10, cols: 10,
        cells: [
            /* Row 0 */ ['gateway',  'empty',    'enemy-1',  'empty',    'empty',    'server-a', 'empty',    'empty',    'empty',    'empty'],
            /* Row 1 */ ['empty',    'empty',    'empty',    'hole-1',   'empty',    'empty',    'empty',    'empty',    'empty',    'wall'],
            /* Row 2 */ ['empty',    'fire-1',   'empty',    'empty',    'empty',    'empty',    'server-b', 'empty',    'empty',    'empty'],
            /* Row 3 */ ['empty',    'empty',    'empty',    'fire-2',   'empty',    'empty',    'empty',    'empty',    'wall',     'empty'],
            /* Row 4 */ ['empty',    'hole-2',   'empty',    'empty',    'empty',    'enemy-2',  'empty',    'empty',    'empty',    'empty'],
            /* Row 5 */ ['wall',     'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-c', 'empty',    'empty'],
            /* Row 6 */ ['empty',    'empty',    'enemy-3',  'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'wall'],
            /* Row 7 */ ['empty',    'empty',    'empty',    'empty',    'hole-3',   'empty',    'empty',    'server-d', 'empty',    'empty'],
            /* Row 8 */ ['empty',    'fire-3',   'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 9 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-e', 'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':  { label: 'GATEWAY',       abbr: 'GTW', ip: '10.400.1.1',   desc: 'Data structure training ground -- Map and Set zone',     ports: ['22/SSH', '443/HTTPS'],                    os: 'Palo Alto PA-5260' },

        /* 5 target servers -- threat intelligence network */
        'server-a': { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.400.1.10',  desc: 'Threat feed aggregator -- IOC ingestion',                ports: ['22/SSH', '443/HTTPS', '9200/ELASTIC'],    os: 'Ubuntu 24.04 LTS' },
        'server-b': { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.400.1.11',  desc: 'SIEM correlation engine -- event matching',              ports: ['22/SSH', '9997/SPLUNK', '8089/MGMT'],     os: 'CentOS Stream 9' },
        'server-c': { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.400.1.12',  desc: 'Sandbox detonation server -- malware analysis',          ports: ['22/SSH', '443/HTTPS', '8080/CUCKOO'],     os: 'Debian 12 Bookworm' },
        'server-d': { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.400.1.13',  desc: 'Reputation database -- IP/domain scoring',               ports: ['22/SSH', '443/HTTPS', '6379/REDIS'],      os: 'RHEL 9.3' },
        'server-e': { label: 'SERVER-ECHO',    abbr: 'SRE', ip: '10.400.1.14',  desc: 'Threat intelligence platform -- final correlation',      ports: ['22/SSH', '443/HTTPS', '5601/KIBANA'],     os: 'Windows Server 2022' },

        /* Extraction point */
        'target':   { label: 'EXTRACTION',     abbr: 'EXT', ip: '10.400.1.99',  desc: 'Extraction point -- threat classification complete',     ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* 3 enemies -- fight required */
        'enemy-1':  { label: 'ENEMY SCANNER',    abbr: 'SCN', ip: null, desc: 'Port scanner bot -- fight to neutralize',                        ports: [] },
        'enemy-2':  { label: 'ENEMY EXFILTRATOR', abbr: 'EXF', ip: null, desc: 'Data exfiltration agent -- fight to neutralize',                ports: [] },
        'enemy-3':  { label: 'ENEMY DROPPER',     abbr: 'DRP', ip: null, desc: 'Malware dropper -- fight to neutralize',                        ports: [] },

        /* 3 holes -- jump required */
        'hole-1':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Feed gap -- jump to cross',                                        ports: [] },
        'hole-2':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Correlation void -- jump to cross',                                ports: [] },
        'hole-3':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Analysis gap -- jump to cross',                                    ports: [] },

        /* 3 fires -- extinguish required */
        'fire-1':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Alert storm fire -- extinguish to pass',                           ports: [] },
        'fire-2':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'False positive blaze -- extinguish to pass',                       ports: [] },
        'fire-3':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Signature overload fire -- extinguish to pass',                    ports: [] }
    },

    /* No traps */
    traps: [],

    /* Obstacles: balanced -- all three types */
    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3'],
        fires: ['fire-1', 'fire-2', 'fire-3'],
        enemies: ['enemy-1', 'enemy-2', 'enemy-3']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER -- Map all 5 threat intel servers',                check: 'nodesDiscovered.has("server-a") && nodesDiscovered.has("server-b") && nodesDiscovered.has("server-c") && nodesDiscovered.has("server-d") && nodesDiscovered.has("server-e")' },
        { id: 'obj_1', label: 'CLASSIFY -- Encounter all 3 threat types',                  check: 'nodesDiscovered.has("enemy-1") && nodesDiscovered.has("hole-1") && nodesDiscovered.has("fire-1")' },
        { id: 'obj_2', label: 'COMBAT -- Neutralize all 3 malware agents',                 check: 'nodesDiscovered.has("enemy-1") && nodesDiscovered.has("enemy-2") && nodesDiscovered.has("enemy-3")' },
        { id: 'obj_3', label: 'EXTRACTION -- Reach the extraction point',                  check: 'nodesDiscovered.has("target")' }
    ],

    /* 7 integrity -- 9 obstacles total */
    integrity: 7,

    /* -- Completion screen -- */
    completion: {
        title: 'MAP AND SET',
        subtitle: 'Threat classification mastered. Map lookups replace if/else chains. Set tracks unique encounters.',
        storageKey: 'hexworth_operator_js40'
    }
};
