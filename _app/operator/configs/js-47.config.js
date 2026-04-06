/* ================================================================
   JS-47 / THE VAULT -- Mission Config
   ================================================================
   Tier 6 mission. 12x12 grid -- 144 cells.
   COMPLEX ASYNC COORDINATION. Three tool-gated paths lead to three
   keys, each behind different obstacle types. All three keys needed
   to open three locked doors guarding the extraction.

   DESIGN RATIONALE:
   - 12x12 grid -- first maximum-size grid in the JS series
   - 3 holes + 3 fires + 3 enemies guard three separate key paths
   - Path A (north): holes guard key-1 -- must jump to reach
   - Path B (center): fires guard key-2 -- must extinguish to reach
   - Path C (south): enemies guard key-3 -- must fight to reach
   - 3 locked doors gate the final extraction corridor
   - Student must coordinate: collect all 3 keys, then unlock all 3 doors
   - Requires planning the ENTIRE route before starting

   JS SKILL: Complex async coordination
   - Multiple dependent async sequences: get key -> unlock door
   - State tracking: which keys collected, which doors remain
   - Route optimization: which path first? Does order matter?
   - Error recovery: what if you hit a door without the right key?
   - Promise chains with state: async functions that build on prior results

   REFERENCE SOLUTION:
     async function vault() {
         const handle = async ({ name, direction }) => {
             if (name.includes('HOLE'))   return await agent.jump(direction);
             if (name.includes('FIRE'))   return await agent.extinguish(direction);
             if (name.includes('ENEMY'))  return await agent.fight(direction);
             if (name.includes('LOCKED')) return await agent.unlock(direction);
             if (name === 'WALL')         return await agent.tunnel(direction);
             return await agent.move(direction);
         };

         // Phase 1: Collect all 3 keys via separate paths
         // Path A -- jump holes to reach key-1
         let results = await agent.scan();
         for (const node of results) await handle(node);

         // Path B -- extinguish fires to reach key-2
         results = await agent.scan();
         for (const node of results) await handle(node);

         // Path C -- fight enemies to reach key-3
         results = await agent.scan();
         for (const node of results) await handle(node);

         // Phase 2: Unlock all 3 doors
         results = await agent.scan();
         for (const node of results) await handle(node);
     }
     vault();

   WHY THE VAULT:
   - Tests end-to-end async coordination across a large grid
   - Three independent paths that converge at locked doors
   - State management: keys must be collected BEFORE doors are encountered
   - Real-world parallel: multi-step authentication, certificate chains, workflow orchestration

   GRID LAYOUT (12x12):
     [start]    [empty]    [hole-1]   [empty]    [key-1]    [empty]    [wall]     [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [wall]     [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [wall]     [hole-2]   [empty]    [empty]    [empty]    [empty]    [server-a] [empty]    [empty]    [wall]
     [empty]    [empty]    [wall]     [empty]    [empty]    [fire-1]   [empty]    [empty]    [empty]    [empty]    [empty]    [wall]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [key-2]    [empty]    [empty]    [server-b] [empty]    [empty]
     [empty]    [fire-2]   [empty]    [empty]    [wall]     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [enemy-1]  [wall]     [empty]    [empty]    [empty]    [locked-1] [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [hole-3]   [empty]    [empty]    [server-c] [empty]
     [empty]    [fire-3]   [empty]    [empty]    [enemy-2]  [empty]    [empty]    [empty]    [locked-2] [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [key-3]    [empty]    [empty]    [empty]    [empty]    [server-d] [empty]
     [empty]    [empty]    [enemy-3]  [empty]    [empty]    [empty]    [empty]    [empty]    [locked-3] [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-e] [target]

   3 keys + 3 locked doors + 3 holes + 3 fires + 3 enemies. Tool-gated paths.
   ================================================================ */

var JS_47_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-47',
    title: 'JS-47 / THE VAULT',
    subtitle: 'Three keys. Three locks. Three gated paths. Coordinate everything.',
    category: 'javascript-ops',
    difficulty: 4,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 4 = full capabilities) -- */
    agent: { tier: 4 },

    /* -- 12x12 Grid -- */
    grid: {
        rows: 12, cols: 12,
        cells: [
            /* Row 0  */ ['gateway',  'empty',    'hole-1',   'empty',    'key-1',    'empty',    'wall',     'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 1  */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'wall',     'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 2  */ ['empty',    'empty',    'wall',     'hole-2',   'empty',    'empty',    'empty',    'empty',    'server-a', 'empty',    'empty',    'wall'],
            /* Row 3  */ ['empty',    'empty',    'wall',     'empty',    'empty',    'fire-1',   'empty',    'empty',    'empty',    'empty',    'empty',    'wall'],
            /* Row 4  */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'key-2',    'empty',    'empty',    'server-b', 'empty',    'empty'],
            /* Row 5  */ ['empty',    'fire-2',   'empty',    'empty',    'wall',     'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 6  */ ['empty',    'empty',    'empty',    'enemy-1',  'wall',     'empty',    'empty',    'empty',    'locked-door-1', 'empty', 'empty', 'empty'],
            /* Row 7  */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'hole-3',   'empty',    'empty',    'server-c', 'empty'],
            /* Row 8  */ ['empty',    'fire-3',   'empty',    'empty',    'enemy-2',  'empty',    'empty',    'empty',    'locked-door-2', 'empty', 'empty', 'empty'],
            /* Row 9  */ ['empty',    'empty',    'empty',    'empty',    'empty',    'key-3',    'empty',    'empty',    'empty',    'empty',    'server-d', 'empty'],
            /* Row 10 */ ['empty',    'empty',    'enemy-3',  'empty',    'empty',    'empty',    'empty',    'empty',    'locked-door-3', 'empty', 'empty', 'empty'],
            /* Row 11 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-e', 'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':      { label: 'GATEWAY',           abbr: 'GTW', ip: '10.470.1.1',   desc: 'Vault perimeter -- three paths diverge',             ports: ['22/SSH', '443/HTTPS'],                    os: 'Fortinet FortiGate 600E' },

        /* 5 target servers -- vault infrastructure */
        'server-a':     { label: 'SERVER-ALPHA',       abbr: 'SRA', ip: '10.470.1.10',  desc: 'Key management server -- HSM interface',             ports: ['22/SSH', '443/HTTPS', '9443/KMS'],        os: 'Ubuntu 24.04 LTS' },
        'server-b':     { label: 'SERVER-BRAVO',       abbr: 'SRB', ip: '10.470.1.11',  desc: 'Certificate authority -- PKI root',                  ports: ['22/SSH', '443/HTTPS', '8200/VAULT'],      os: 'Debian 12 Bookworm' },
        'server-c':     { label: 'SERVER-CHARLIE',     abbr: 'SRC', ip: '10.470.1.12',  desc: 'Secrets engine -- credential rotation',              ports: ['22/SSH', '443/HTTPS', '8201/TRANSIT'],    os: 'CentOS Stream 9' },
        'server-d':     { label: 'SERVER-DELTA',       abbr: 'SRD', ip: '10.470.1.13',  desc: 'Audit trail -- access logging',                      ports: ['22/SSH', '443/HTTPS', '9200/ELASTIC'],    os: 'RHEL 9.3' },
        'server-e':     { label: 'SERVER-ECHO',        abbr: 'SRE', ip: '10.470.1.14',  desc: 'Vault core -- master encryption engine',             ports: ['22/SSH', '443/HTTPS', '8500/CONSUL'],     os: 'Windows Server 2022' },

        /* Extraction point */
        'target':       { label: 'EXTRACTION',         abbr: 'EXT', ip: '10.470.1.99',  desc: 'Extraction point -- vault breached',                 ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* 3 keys -- auto-collected on entry */
        'key-1':        { label: 'ACCESS KEY',         abbr: 'KY1', ip: null, desc: 'Vault key alpha -- jump path reward',                          ports: [] },
        'key-2':        { label: 'ACCESS KEY',         abbr: 'KY2', ip: null, desc: 'Vault key bravo -- fire path reward',                          ports: [] },
        'key-3':        { label: 'ACCESS KEY',         abbr: 'KY3', ip: null, desc: 'Vault key charlie -- combat path reward',                      ports: [] },

        /* 3 locked doors -- blocks until key used */
        'locked-door-1': { label: 'LOCKED DOOR',      abbr: 'LK1', ip: null, desc: 'Vault door alpha -- use key to open',                          ports: [] },
        'locked-door-2': { label: 'LOCKED DOOR',      abbr: 'LK2', ip: null, desc: 'Vault door bravo -- use key to open',                          ports: [] },
        'locked-door-3': { label: 'LOCKED DOOR',      abbr: 'LK3', ip: null, desc: 'Vault door charlie -- use key to open',                        ports: [] },

        /* 3 enemies -- fight required */
        'enemy-1':      { label: 'ENEMY SENTINEL',     abbr: 'SNL', ip: null, desc: 'Vault sentinel -- fight to neutralize',                       ports: [] },
        'enemy-2':      { label: 'ENEMY ENFORCER',     abbr: 'ENF', ip: null, desc: 'Vault enforcer -- fight to neutralize',                       ports: [] },
        'enemy-3':      { label: 'ENEMY WARDEN',       abbr: 'WRD', ip: null, desc: 'Vault warden -- fight to neutralize',                         ports: [] },

        /* 3 holes -- jump required */
        'hole-1':       { label: 'HOLE',               abbr: 'HLE', ip: null, desc: 'Vault shaft -- jump to cross',                                ports: [] },
        'hole-2':       { label: 'HOLE',               abbr: 'HLE', ip: null, desc: 'Security moat -- jump to cross',                              ports: [] },
        'hole-3':       { label: 'HOLE',               abbr: 'HLE', ip: null, desc: 'Elevator shaft -- jump to cross',                             ports: [] },

        /* 3 fires -- extinguish required */
        'fire-1':       { label: 'FIRE',               abbr: 'FIR', ip: null, desc: 'Thermal countermeasure -- extinguish to pass',                 ports: [] },
        'fire-2':       { label: 'FIRE',               abbr: 'FIR', ip: null, desc: 'Incendiary trap -- extinguish to pass',                       ports: [] },
        'fire-3':       { label: 'FIRE',               abbr: 'FIR', ip: null, desc: 'Gas line rupture -- extinguish to pass',                      ports: [] }
    },

    /* No traps */
    traps: [],

    /* Obstacles: balanced with locked doors */
    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3'],
        fires: ['fire-1', 'fire-2', 'fire-3'],
        enemies: ['enemy-1', 'enemy-2', 'enemy-3']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'COLLECT -- Find all 3 vault keys',                          check: 'nodesDiscovered.has("key-1") && nodesDiscovered.has("key-2") && nodesDiscovered.has("key-3")' },
        { id: 'obj_1', label: 'UNLOCK -- Open all 3 vault doors',                          check: 'nodesDiscovered.has("locked-door-1") && nodesDiscovered.has("locked-door-2") && nodesDiscovered.has("locked-door-3")' },
        { id: 'obj_2', label: 'DISCOVER -- Map all 5 vault servers',                       check: 'nodesDiscovered.has("server-a") && nodesDiscovered.has("server-b") && nodesDiscovered.has("server-c") && nodesDiscovered.has("server-d") && nodesDiscovered.has("server-e")' },
        { id: 'obj_3', label: 'NAVIGATE -- Handle all 9 obstacles',                        check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3") && nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2") && nodesDiscovered.has("fire-3") && nodesDiscovered.has("enemy-1") && nodesDiscovered.has("enemy-2") && nodesDiscovered.has("enemy-3")' },
        { id: 'obj_4', label: 'EXTRACTION -- Reach the extraction point',                  check: 'nodesDiscovered.has("target")' }
    ],

    /* 8 integrity -- 9 obstacles + 3 locked doors on a 12x12 grid */
    integrity: 8,

    /* -- Completion screen -- */
    completion: {
        title: 'THE VAULT',
        subtitle: 'Three keys collected. Three doors opened. The vault breached through coordinated async operations.',
        storageKey: 'hexworth_operator_js47'
    }
};
