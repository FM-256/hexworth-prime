/* ================================================================
   JS-21 / CALLBACK HELL -- Mission Config
   ================================================================
   Tier 4 mission. 9x9 grid -- 81 cells.
   THE PAIN POINT. This level deliberately forces deeply nested
   callbacks. The student must chain scan -> move -> scan -> move
   sequences using nested callbacks, creating the infamous
   PYRAMID OF DOOM.

   DESIGN RATIONALE:
   - 9x9 grid with obstacles placed so multiple scan-move-scan cycles
     are REQUIRED -- no single scan reveals the full path
   - 3 holes + 3 fires spread across the grid force repeated scanning
   - Each move into a new zone requires a fresh scan to detect obstacles
   - Using callbacks, this means: scan(function() { move(function() { scan(function() { ... }) }) })
   - The student writes code that WORKS but is deeply nested and ugly
   - The briefing does NOT mention promises -- let them feel the pain first
   - This is the "before" picture. JS-22 is the "after."

   JS SKILL: The pain of callback nesting (Pyramid of Doom)
   - Each async operation wraps the next in a callback
   - 3+ levels of nesting make the code hard to read, hard to debug
   - Indentation spirals rightward -- the pyramid shape
   - Error handling at each level is nearly impossible
   - This is WHY promises were invented

   REFERENCE SOLUTION (the ugly version students WILL write):
     agent.scan(function(r1) {
         r1.forEach(function(n) {
             if (n.name.includes('HOLE')) { agent.jump(n.direction); }
             if (n.name.includes('FIRE')) { agent.extinguish(n.direction); }
         });
         agent.move('east', function() {
             agent.scan(function(r2) {
                 r2.forEach(function(n) {
                     if (n.name.includes('HOLE')) { agent.jump(n.direction); }
                     if (n.name.includes('FIRE')) { agent.extinguish(n.direction); }
                 });
                 agent.move('south', function() {
                     agent.scan(function(r3) {
                         // 5 levels deep and still going...
                     });
                 });
             });
         });
     });

   WHY THIS LEVEL EXISTS:
   - You can't appreciate the solution until you've felt the problem
   - Promises (JS-22) and async/await (JS-25) are MEANINGLESS without this pain
   - The student completes this level with working but hideous code
   - In the debrief they should think: "there HAS to be a better way"
   - There is. It's called .then(). And it comes next.

   GRID LAYOUT (9x9):
     [start]    [empty]    [empty]    [hole-1]   [empty]    [server-a] [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [fire-1]   [empty]    [empty]    [empty]    [empty]    [empty]    [server-b] [empty]
     [empty]    [empty]    [empty]    [empty]    [hole-2]   [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [fire-2]   [empty]    [empty]
     [empty]    [empty]    [server-c] [empty]    [empty]    [empty]    [empty]    [empty]    [wall]
     [empty]    [empty]    [empty]    [empty]    [fire-3]   [empty]    [empty]    [empty]    [empty]
     [empty]    [hole-3]   [empty]    [empty]    [empty]    [empty]    [server-d] [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [target]

   3 holes + 3 fires. Multi-zone traversal. Pyramid of Doom.
   ================================================================ */

var JS_21_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-21',
    title: 'JS-21 / CALLBACK HELL',
    subtitle: 'Nested callbacks. The pyramid of doom. You\'ll want a better way.',
    category: 'javascript-ops',
    difficulty: 3,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 3 = all obstacle handlers) -- */
    agent: { tier: 3 },

    /* -- 9x9 Grid -- */
    grid: {
        rows: 9, cols: 9,
        cells: [
            /* Row 0 */ ['gateway',  'empty',    'empty',    'hole-1',   'empty',    'server-a', 'empty',    'empty',    'empty'],
            /* Row 1 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 2 */ ['empty',    'fire-1',   'empty',    'empty',    'empty',    'empty',    'empty',    'server-b', 'empty'],
            /* Row 3 */ ['empty',    'empty',    'empty',    'empty',    'hole-2',   'empty',    'empty',    'empty',    'empty'],
            /* Row 4 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'fire-2',   'empty',    'empty'],
            /* Row 5 */ ['empty',    'empty',    'server-c', 'empty',    'empty',    'empty',    'empty',    'empty',    'wall'],
            /* Row 6 */ ['empty',    'empty',    'empty',    'empty',    'fire-3',   'empty',    'empty',    'empty',    'empty'],
            /* Row 7 */ ['empty',    'hole-3',   'empty',    'empty',    'empty',    'empty',    'server-d', 'empty',    'empty'],
            /* Row 8 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':  { label: 'GATEWAY',       abbr: 'GTW', ip: '10.210.1.1',   desc: 'Edge proxy -- nested operations begin here',            ports: ['22/SSH', '443/HTTPS'],                    os: 'NGINX Plus R31' },

        /* 4 target servers -- DevOps pipeline infrastructure */
        'server-a': { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.210.1.10',  desc: 'Git server -- source code repository',                  ports: ['22/SSH', '443/HTTPS', '9418/GIT'],        os: 'Ubuntu 24.04 LTS' },
        'server-b': { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.210.1.11',  desc: 'CI runner -- continuous integration executor',           ports: ['22/SSH', '8080/JENKINS', '50000/AGENT'],  os: 'Debian 12 Bookworm' },
        'server-c': { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.210.1.12',  desc: 'Artifact store -- build output repository',             ports: ['22/SSH', '8081/NEXUS', '8082/DOCKER'],    os: 'CentOS Stream 9' },
        'server-d': { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.210.1.13',  desc: 'Deploy controller -- production release orchestrator',  ports: ['22/SSH', '443/HTTPS', '8443/ARGOCD'],     os: 'RHEL 9.3' },

        /* Extraction point */
        'target':   { label: 'EXTRACTION',     abbr: 'EXT', ip: '10.210.1.99',  desc: 'Extraction point -- mission complete',                  ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* 3 holes -- jump required */
        'hole-1':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Gap in pipeline -- jump to cross',                               ports: [] },
        'hole-2':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Broken deployment bridge -- jump to cross',                      ports: [] },
        'hole-3':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Severed CI link -- jump to cross',                               ports: [] },

        /* 3 fires -- extinguish required */
        'fire-1':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Build server overheating -- extinguish to pass',                 ports: [] },
        'fire-2':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Runaway pipeline process -- extinguish to pass',                 ports: [] },
        'fire-3':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Deploy stage meltdown -- extinguish to pass',                    ports: [] }
    },

    /* No traps -- callbacks are punishing enough */
    traps: [],

    /* Obstacles: balanced holes + fires */
    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3'],
        fires: ['fire-1', 'fire-2', 'fire-3']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER ALPHA -- Find the Git server',                check: 'nodesDiscovered.has("server-a")' },
        { id: 'obj_1', label: 'DISCOVER BRAVO -- Find the CI runner',                  check: 'nodesDiscovered.has("server-b")' },
        { id: 'obj_2', label: 'DISCOVER CHARLIE -- Find the artifact store',            check: 'nodesDiscovered.has("server-c")' },
        { id: 'obj_3', label: 'DISCOVER DELTA -- Find the deploy controller',           check: 'nodesDiscovered.has("server-d")' },
        { id: 'obj_4', label: 'NAVIGATE -- Handle all 6 obstacles',                    check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3") && nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2") && nodesDiscovered.has("fire-3")' },
        { id: 'obj_5', label: 'EXTRACTION -- Reach the extraction point',              check: 'nodesDiscovered.has("target")' }
    ],

    /* 5 integrity -- 6 obstacles spread across the grid */
    integrity: 5,

    /* -- Completion screen -- */
    completion: {
        title: 'CALLBACK HELL',
        subtitle: 'The pyramid of doom. It works, but there has to be a better way. There is.',
        storageKey: 'hexworth_operator_js21'
    }
};
