/* ================================================================
   JS-41 / PROMISE.ALL -- Mission Config
   ================================================================
   Tier 6 mission. 11x11 grid -- 121 cells.
   Promise.all() -- parallel async operations. Multiple independent
   tasks fire concurrently and resolve together.

   DESIGN RATIONALE:
   - 11x11 grid -- first grid larger than 10x10 in the JS series
   - 3 holes + 3 fires + 2 enemies spread across independent zones
   - Grid design creates PARALLEL PATHS -- multiple routes to explore
   - Student uses Promise.all() to run independent operations concurrently
   - 5 servers in zones that don't depend on each other -- scan them in parallel
   - The lesson: not everything needs to be sequential

   JS SKILL: Promise.all() -- parallel async operations
   - Promise.all([p1, p2, p3]) waits for ALL promises to resolve
   - Returns an array of results in the same order
   - If any promise rejects, the whole thing rejects
   - Use case: scanning multiple directions simultaneously
   - Use case: firing independent operations that don't share state

   REFERENCE SOLUTION:
     async function parallelOps() {
         // Scan and fight/jump/extinguish in parallel where possible
         const results = await agent.scan();

         // Separate threats from safe moves
         const threats = results.filter(n => n.name.includes('ENEMY') ||
                                              n.name.includes('HOLE') ||
                                              n.name.includes('FIRE'));
         const safe = results.filter(n => !threats.includes(n));

         // Handle all threats in parallel
         await Promise.all(threats.map(async ({ name, direction }) => {
             if (name.includes('HOLE')) await agent.jump(direction);
             else if (name.includes('FIRE')) await agent.extinguish(direction);
             else if (name.includes('ENEMY')) await agent.fight(direction);
         }));

         // Move to safe nodes
         for (const { direction } of safe) {
             await agent.move(direction);
         }
     }
     parallelOps();

   WHY PROMISE.ALL:
   - Sequential awaits are wasteful when operations are independent
   - Promise.all() is how production JS handles concurrent API calls
   - Real-world: fetching user profile + notifications + settings simultaneously
   - Prepares students for real async patterns in web development

   GRID LAYOUT (11x11):
     [start]    [empty]    [empty]    [enemy-1]  [empty]    [empty]    [server-a] [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [hole-1]   [empty]    [empty]    [empty]    [empty]    [empty]    [wall]
     [empty]    [fire-1]   [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-b] [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [wall]     [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [hole-2]   [empty]    [empty]    [wall]     [empty]    [fire-2]   [empty]    [empty]    [empty]
     [wall]     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-c] [empty]
     [empty]    [empty]    [empty]    [enemy-2]  [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [wall]     [empty]    [empty]    [empty]    [wall]
     [empty]    [fire-3]   [empty]    [empty]    [empty]    [empty]    [wall]     [empty]    [server-d] [empty]    [empty]
     [empty]    [empty]    [empty]    [hole-3]   [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-e] [target]

   Parallel paths. 3 holes + 3 fires + 2 enemies. Promise.all() for concurrency.
   ================================================================ */

var JS_41_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-41',
    title: 'JS-41 / PROMISE.ALL',
    subtitle: 'Parallel operations. Why wait for one when you can do all at once?',
    category: 'javascript-ops',
    difficulty: 4,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 4 = full capabilities) -- */
    agent: { tier: 4 },

    /* -- 11x11 Grid -- */
    grid: {
        rows: 11, cols: 11,
        cells: [
            /* Row 0  */ ['gateway',  'empty',    'empty',    'enemy-1',  'empty',    'empty',    'server-a', 'empty',    'empty',    'empty',    'empty'],
            /* Row 1  */ ['empty',    'empty',    'empty',    'empty',    'hole-1',   'empty',    'empty',    'empty',    'empty',    'empty',    'wall'],
            /* Row 2  */ ['empty',    'fire-1',   'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-b', 'empty',    'empty'],
            /* Row 3  */ ['empty',    'empty',    'empty',    'empty',    'empty',    'wall',     'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 4  */ ['empty',    'empty',    'hole-2',   'empty',    'empty',    'wall',     'empty',    'fire-2',   'empty',    'empty',    'empty'],
            /* Row 5  */ ['wall',     'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-c', 'empty'],
            /* Row 6  */ ['empty',    'empty',    'empty',    'enemy-2',  'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 7  */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'wall',     'empty',    'empty',    'empty',    'wall'],
            /* Row 8  */ ['empty',    'fire-3',   'empty',    'empty',    'empty',    'empty',    'wall',     'empty',    'server-d', 'empty',    'empty'],
            /* Row 9  */ ['empty',    'empty',    'empty',    'hole-3',   'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 10 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-e', 'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':  { label: 'GATEWAY',       abbr: 'GTW', ip: '10.410.1.1',   desc: 'Concurrent operations gateway -- parallel paths',        ports: ['22/SSH', '443/HTTPS'],                    os: 'F5 BIG-IP i5800' },

        /* 5 target servers -- distributed microservices */
        'server-a': { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.410.1.10',  desc: 'Auth service -- token issuance',                         ports: ['22/SSH', '443/HTTPS', '8080/OAUTH'],      os: 'Ubuntu 24.04 LTS' },
        'server-b': { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.410.1.11',  desc: 'User service -- profile management',                     ports: ['22/SSH', '443/HTTPS', '3000/GRAPHQL'],    os: 'Debian 12 Bookworm' },
        'server-c': { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.410.1.12',  desc: 'Notification service -- event dispatch',                 ports: ['22/SSH', '443/HTTPS', '5672/AMQP'],       os: 'CentOS Stream 9' },
        'server-d': { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.410.1.13',  desc: 'Analytics service -- metrics pipeline',                  ports: ['22/SSH', '443/HTTPS', '9090/PROMETHEUS'], os: 'RHEL 9.3' },
        'server-e': { label: 'SERVER-ECHO',    abbr: 'SRE', ip: '10.410.1.14',  desc: 'Gateway aggregator -- response assembly',                ports: ['22/SSH', '443/HTTPS', '8443/KONG'],       os: 'Windows Server 2022' },

        /* Extraction point */
        'target':   { label: 'EXTRACTION',     abbr: 'EXT', ip: '10.410.1.99',  desc: 'Extraction point -- parallel ops complete',              ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* 2 enemies -- fight required */
        'enemy-1':  { label: 'ENEMY DDOS BOT',  abbr: 'DDS', ip: null, desc: 'DDoS bot -- fight to neutralize',                                ports: [] },
        'enemy-2':  { label: 'ENEMY CRAWLER',    abbr: 'CRW', ip: null, desc: 'Malicious crawler -- fight to neutralize',                       ports: [] },

        /* 3 holes -- jump required */
        'hole-1':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Service mesh gap -- jump to cross',                                ports: [] },
        'hole-2':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Load balancer void -- jump to cross',                              ports: [] },
        'hole-3':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Circuit breaker gap -- jump to cross',                             ports: [] },

        /* 3 fires -- extinguish required */
        'fire-1':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Request flood fire -- extinguish to pass',                         ports: [] },
        'fire-2':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Timeout cascade blaze -- extinguish to pass',                      ports: [] },
        'fire-3':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Rate limit fire -- extinguish to pass',                            ports: [] }
    },

    /* No traps */
    traps: [],

    /* Obstacles: 3 holes + 3 fires + 2 enemies */
    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3'],
        fires: ['fire-1', 'fire-2', 'fire-3'],
        enemies: ['enemy-1', 'enemy-2']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER -- Map all 5 microservices',                      check: 'nodesDiscovered.has("server-a") && nodesDiscovered.has("server-b") && nodesDiscovered.has("server-c") && nodesDiscovered.has("server-d") && nodesDiscovered.has("server-e")' },
        { id: 'obj_1', label: 'COMBAT -- Neutralize both network threats',                 check: 'nodesDiscovered.has("enemy-1") && nodesDiscovered.has("enemy-2")' },
        { id: 'obj_2', label: 'NAVIGATE -- Handle all holes and fires',                    check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3") && nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2") && nodesDiscovered.has("fire-3")' },
        { id: 'obj_3', label: 'EXTRACTION -- Reach the extraction point',                  check: 'nodesDiscovered.has("target")' }
    ],

    /* 7 integrity -- 8 obstacles on 11x11 grid */
    integrity: 7,

    /* -- Completion screen -- */
    completion: {
        title: 'PROMISE.ALL',
        subtitle: 'Parallel async mastered. Five services scanned concurrently. Promise.all() unlocked.',
        storageKey: 'hexworth_operator_js41'
    }
};
