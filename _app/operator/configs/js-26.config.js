/* ================================================================
   JS-26 / KEY HUNT -- Mission Config
   ================================================================
   Tier 4 mission. 10x10 grid -- 100 cells.
   KEYS & LOCKED DOORS introduced alongside async patterns.
   Students must find key items before they can unlock sealed doors.

   DESIGN RATIONALE:
   - Locked doors introduce STATE -- the agent must collect something BEFORE
     it can proceed past certain cells
   - key-* nodes are auto-collected when the agent walks onto them
   - locked-door-* cells block movement until agent.unlock(dir) is called
   - Agent must have a key in inventory to unlock
   - Combined with async/await: await agent.unlock(direction)
   - 2 keys + 2 doors force the student to plan their route
   - Environmental obstacles (holes, fires, enemies) remain as context

   JS SKILL: State-dependent async operations
   - agent.items shows collected items (array)
   - agent.unlock(direction) consumes a key to open a locked door
   - Student must sequence: find key -> navigate to door -> unlock
   - Async/await makes this read naturally:
       await agent.move('north');  // go get the key
       // key auto-collected
       await agent.move('south');  // navigate to door
       await agent.unlock('east'); // open it

   REFERENCE SOLUTION:
     async function keyHunt() {
         // Phase 1: Scan and navigate toward first key
         let results = await agent.scan();
         for (let node of results) {
             const { name, direction } = node;
             if (name.includes('HOLE')) await agent.jump(direction);
             else if (name.includes('FIRE')) await agent.extinguish(direction);
             else if (name.includes('ENEMY')) await agent.fight(direction);
             else if (name.includes('LOCKED')) await agent.unlock(direction);
             else await agent.move(direction);
         }
         // Phase 2: Continue scanning, keys auto-collect on entry
         results = await agent.scan();
         for (let node of results) {
             const { name, direction } = node;
             if (name.includes('HOLE')) await agent.jump(direction);
             else if (name.includes('FIRE')) await agent.extinguish(direction);
             else if (name.includes('ENEMY')) await agent.fight(direction);
             else if (name.includes('LOCKED')) await agent.unlock(direction);
             else await agent.move(direction);
         }
     }
     keyHunt();

   WHY KEYS + LOCKED DOORS:
   - Adds planning dimension -- not just react to obstacles, SEQUENCE your path
   - Keys must be collected BEFORE reaching the locked door
   - Teaches async state management: check inventory before attempting unlock
   - Real-world parallel: API tokens, session cookies, auth flow sequencing

   GRID LAYOUT (10x10):
     [start]    [empty]    [empty]    [empty]    [key-1]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [hole-1]   [empty]    [empty]    [empty]    [server-a] [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [wall]
     [empty]    [fire-1]   [empty]    [empty]    [locked-1] [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-b] [empty]    [empty]    [empty]
     [empty]    [empty]    [enemy-1]  [empty]    [empty]    [empty]    [empty]    [empty]    [key-2]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [fire-2]   [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [locked-2] [empty]    [empty]    [empty]
     [empty]    [hole-2]   [empty]    [empty]    [server-c] [empty]    [empty]    [empty]    [server-d] [empty]
     [empty]    [empty]    [empty]    [enemy-2]  [empty]    [empty]    [empty]    [empty]    [empty]    [target]

   2 keys + 2 locked doors + 2 holes + 2 fires + 2 enemies. Route planning.
   ================================================================ */

var JS_26_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-26',
    title: 'JS-26 / KEY HUNT',
    subtitle: 'Locked doors block the path. Find the keys. Plan your route.',
    category: 'javascript-ops',
    difficulty: 3,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 3 = full obstacle handling + unlock) -- */
    agent: { tier: 3 },

    /* -- 10x10 Grid -- */
    grid: {
        rows: 10, cols: 10,
        cells: [
            /* Row 0 */ ['gateway',  'empty',    'empty',    'empty',    'key-1',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 1 */ ['empty',    'empty',    'hole-1',   'empty',    'empty',    'empty',    'server-a', 'empty',    'empty',    'empty'],
            /* Row 2 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'wall'],
            /* Row 3 */ ['empty',    'fire-1',   'empty',    'empty',    'locked-door-1','empty','empty',    'empty',    'empty',    'empty'],
            /* Row 4 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-b', 'empty',    'empty',    'empty'],
            /* Row 5 */ ['empty',    'empty',    'enemy-1',  'empty',    'empty',    'empty',    'empty',    'empty',    'key-2',    'empty'],
            /* Row 6 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'fire-2',   'empty',    'empty',    'empty',    'empty'],
            /* Row 7 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'locked-door-2','empty','empty',    'empty'],
            /* Row 8 */ ['empty',    'hole-2',   'empty',    'empty',    'server-c', 'empty',    'empty',    'empty',    'server-d', 'empty'],
            /* Row 9 */ ['empty',    'empty',    'empty',    'enemy-2',  'empty',    'empty',    'empty',    'empty',    'empty',    'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':      { label: 'GATEWAY',        abbr: 'GTW', ip: '10.260.1.1',   desc: 'Access-controlled perimeter -- keys required',       ports: ['22/SSH', '443/HTTPS'],                    os: 'Barracuda CloudGen' },

        /* 4 target servers -- access management infrastructure */
        'server-a':     { label: 'SERVER-ALPHA',    abbr: 'SRA', ip: '10.260.1.10',  desc: 'OAuth server -- token issuance endpoint',            ports: ['22/SSH', '443/HTTPS', '8080/OAUTH'],      os: 'Ubuntu 24.04 LTS' },
        'server-b':     { label: 'SERVER-BRAVO',    abbr: 'SRB', ip: '10.260.1.11',  desc: 'RBAC engine -- role-based access control',           ports: ['22/SSH', '443/HTTPS', '9090/RBAC'],       os: 'Debian 12 Bookworm' },
        'server-c':     { label: 'SERVER-CHARLIE',  abbr: 'SRC', ip: '10.260.1.12',  desc: 'Audit logger -- access event chronicle',             ports: ['22/SSH', '514/SYSLOG', '9200/ELASTIC'],   os: 'CentOS Stream 9' },
        'server-d':     { label: 'SERVER-DELTA',    abbr: 'SRD', ip: '10.260.1.13',  desc: 'Policy store -- access policy repository',           ports: ['22/SSH', '443/HTTPS', '8181/OPA'],        os: 'RHEL 9.3' },

        /* Extraction point */
        'target':       { label: 'EXTRACTION',      abbr: 'EXT', ip: '10.260.1.99',  desc: 'Extraction point -- all doors opened',               ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* 2 keys -- auto-collected on entry */
        'key-1':        { label: 'ACCESS KEY',      abbr: 'KY1', ip: null, desc: 'Security credential alpha -- collected automatically',         ports: [] },
        'key-2':        { label: 'ACCESS KEY',      abbr: 'KY2', ip: null, desc: 'Security credential bravo -- collected automatically',         ports: [] },

        /* 2 locked doors -- blocks until key used */
        'locked-door-1':{ label: 'LOCKED DOOR',     abbr: 'LK1', ip: null, desc: 'Sealed access point -- use key to open',                      ports: [] },
        'locked-door-2':{ label: 'LOCKED DOOR',     abbr: 'LK2', ip: null, desc: 'Sealed access point -- use key to open',                      ports: [] },

        /* 2 holes -- jump required */
        'hole-1':       { label: 'HOLE',            abbr: 'HLE', ip: null, desc: 'Authorization gap -- jump to cross',                          ports: [] },
        'hole-2':       { label: 'HOLE',            abbr: 'HLE', ip: null, desc: 'Token expiry void -- jump to cross',                          ports: [] },

        /* 2 fires -- extinguish required */
        'fire-1':       { label: 'FIRE',            abbr: 'FIR', ip: null, desc: 'Privilege escalation fire -- extinguish to pass',              ports: [] },
        'fire-2':       { label: 'FIRE',            abbr: 'FIR', ip: null, desc: 'Session fixation blaze -- extinguish to pass',                 ports: [] },

        /* 2 enemies -- fight required */
        'enemy-1':      { label: 'ENEMY BRUTE',     abbr: 'BRT', ip: null, desc: 'Brute-force attacker -- fight to neutralize',                 ports: [] },
        'enemy-2':      { label: 'ENEMY PHISHER',   abbr: 'PHS', ip: null, desc: 'Phishing operator -- fight to neutralize',                    ports: [] }
    },

    /* No traps */
    traps: [],

    /* Obstacles: all types + locked doors handled by game engine */
    obstacles: {
        holes: ['hole-1', 'hole-2'],
        fires: ['fire-1', 'fire-2'],
        enemies: ['enemy-1', 'enemy-2']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'COLLECT -- Find both access keys',                     check: 'nodesDiscovered.has("key-1") && nodesDiscovered.has("key-2")' },
        { id: 'obj_1', label: 'UNLOCK -- Open both locked doors',                     check: 'nodesDiscovered.has("locked-door-1") && nodesDiscovered.has("locked-door-2")' },
        { id: 'obj_2', label: 'DISCOVER -- Map all 4 access servers',                  check: 'nodesDiscovered.has("server-a") && nodesDiscovered.has("server-b") && nodesDiscovered.has("server-c") && nodesDiscovered.has("server-d")' },
        { id: 'obj_3', label: 'NAVIGATE -- Handle all obstacles',                     check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2") && nodesDiscovered.has("enemy-1") && nodesDiscovered.has("enemy-2")' },
        { id: 'obj_4', label: 'EXTRACTION -- Reach the extraction point',              check: 'nodesDiscovered.has("target")' }
    ],

    /* 6 integrity -- 10 obstacles + 2 locked doors */
    integrity: 6,

    /* -- Completion screen -- */
    completion: {
        title: 'KEY HUNT',
        subtitle: 'Keys collected. Doors unlocked. Async route planning proven.',
        storageKey: 'hexworth_operator_js26'
    }
};
