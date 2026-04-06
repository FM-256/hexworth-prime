/* ================================================================
   JS-24 / ENEMY LINES -- Mission Config
   ================================================================
   Tier 4 mission. 9x9 grid -- 81 cells.
   ENEMY-HEAVY level. 4 enemies demand systematic promise-based
   obstacle handling. If/else inside .then() blocks is critical.

   DESIGN RATIONALE:
   - 4 enemies dominate the grid -- fight() is the primary action
   - 2 holes + 2 fires remain to maintain multi-obstacle handling
   - Student must triage: enemies first (they're aggressive), then
     environmental obstacles (holes/fires are passive blockers)
   - Promise chains handle the sequencing: scan -> fight -> move -> scan
   - .filter() + arrow functions isolate enemies from scan results
   - This level builds enemy-handling confidence before async/await

   JS SKILL: Systematic threat handling in promise chains
   - Filter enemies from scan results: results.filter(n => n.name.includes('ENEMY'))
   - Process enemies first, then environmental obstacles
   - Chain .then() for zone-by-zone traversal
   - If/else if/else inside .then() for multi-type handling

   REFERENCE SOLUTION:
     agent.scan()
         .then(results => {
             // Fight enemies first -- they're aggressive threats
             results.filter(n => n.name.includes('ENEMY'))
                 .forEach(n => agent.fight(n.direction));
             // Handle environmental obstacles
             results.forEach(n => {
                 if (n.name.includes('HOLE')) agent.jump(n.direction);
                 else if (n.name.includes('FIRE')) agent.extinguish(n.direction);
             });
             return agent.move('east');
         })
         .then(() => agent.scan())
         .then(results => {
             results.filter(n => n.name.includes('ENEMY'))
                 .forEach(n => agent.fight(n.direction));
             return agent.move('south');
         });

   WHY ENEMY-HEAVY:
   - Enemies require immediate response -- can't skip past them
   - 4 enemies across the grid force the student to handle them systematically
   - Filter-first pattern (enemies) + forEach (everything else) is reusable
   - Prepares for JS-25 where async/await simplifies this same pattern

   GRID LAYOUT (9x9):
     [start]    [empty]    [enemy-1]  [empty]    [empty]    [server-a] [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [hole-1]   [empty]    [empty]    [empty]    [wall]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-b] [empty]    [empty]
     [empty]    [fire-1]   [empty]    [enemy-2]  [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [enemy-3]  [empty]    [server-c] [empty]    [wall]
     [empty]    [empty]    [hole-2]   [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [fire-2]   [enemy-4]  [empty]    [server-d] [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [target]

   2 holes + 2 fires + 4 enemies. Enemy-heavy. Promise-based triage.
   ================================================================ */

var JS_24_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-24',
    title: 'JS-24 / ENEMY LINES',
    subtitle: 'Four hostiles. Promise chains handle the triage.',
    category: 'javascript-ops',
    difficulty: 3,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 3 = scan, move, jump, extinguish, fight) -- */
    agent: { tier: 3 },

    /* -- 9x9 Grid -- */
    grid: {
        rows: 9, cols: 9,
        cells: [
            /* Row 0 */ ['gateway',  'empty',    'enemy-1',  'empty',    'empty',    'server-a', 'empty',    'empty',    'empty'],
            /* Row 1 */ ['empty',    'empty',    'empty',    'empty',    'hole-1',   'empty',    'empty',    'empty',    'wall'],
            /* Row 2 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-b', 'empty',    'empty'],
            /* Row 3 */ ['empty',    'fire-1',   'empty',    'enemy-2',  'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 4 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 5 */ ['empty',    'empty',    'empty',    'empty',    'enemy-3',  'empty',    'server-c', 'empty',    'wall'],
            /* Row 6 */ ['empty',    'empty',    'hole-2',   'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 7 */ ['empty',    'empty',    'empty',    'empty',    'fire-2',   'enemy-4',  'empty',    'server-d', 'empty'],
            /* Row 8 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':  { label: 'GATEWAY',       abbr: 'GTW', ip: '10.240.1.1',   desc: 'Perimeter breach -- enemy territory',                   ports: ['22/SSH', '443/HTTPS'],                    os: 'SonicWall TZ670' },

        /* 4 target servers -- threat hunting infrastructure */
        'server-a': { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.240.1.10',  desc: 'EDR console -- endpoint detection and response',        ports: ['22/SSH', '443/HTTPS', '8443/EDR'],        os: 'Ubuntu 24.04 LTS' },
        'server-b': { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.240.1.11',  desc: 'Sandbox cluster -- malware detonation environment',     ports: ['22/SSH', '443/HTTPS', '8080/SANDBOX'],    os: 'Debian 12 Bookworm' },
        'server-c': { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.240.1.12',  desc: 'YARA rule engine -- signature matching server',         ports: ['22/SSH', '443/HTTPS', '9443/YARA-API'],   os: 'CentOS Stream 9' },
        'server-d': { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.240.1.13',  desc: 'C2 tracker -- command-and-control detection',           ports: ['22/SSH', '443/HTTPS', '5601/KIBANA'],     os: 'RHEL 9.3' },

        /* Extraction point */
        'target':   { label: 'EXTRACTION',     abbr: 'EXT', ip: '10.240.1.99',  desc: 'Extraction point -- hostiles cleared',                  ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* 4 enemies -- primary threat this level */
        'enemy-1':  { label: 'ENEMY INTERCEPTOR', abbr: 'ICP', ip: null, desc: 'Interceptor process -- fight to neutralize',                  ports: [] },
        'enemy-2':  { label: 'ENEMY HUNTER',      abbr: 'HNT', ip: null, desc: 'Hunter daemon -- fight to neutralize',                        ports: [] },
        'enemy-3':  { label: 'ENEMY STALKER',     abbr: 'STK', ip: null, desc: 'Stalker routine -- fight to neutralize',                      ports: [] },
        'enemy-4':  { label: 'ENEMY GUARDIAN',     abbr: 'GDN', ip: null, desc: 'Guardian sentry -- fight to neutralize',                     ports: [] },

        /* 2 holes -- jump required */
        'hole-1':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Sensor gap -- jump to cross',                                   ports: [] },
        'hole-2':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Network void -- jump to cross',                                 ports: [] },

        /* 2 fires -- extinguish required */
        'fire-1':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'EDR overload fire -- extinguish to pass',                       ports: [] },
        'fire-2':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Sandbox meltdown -- extinguish to pass',                        ports: [] }
    },

    /* No traps */
    traps: [],

    /* Obstacles: enemy-heavy */
    obstacles: {
        holes: ['hole-1', 'hole-2'],
        fires: ['fire-1', 'fire-2'],
        enemies: ['enemy-1', 'enemy-2', 'enemy-3', 'enemy-4']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER ALPHA -- Find the EDR console',               check: 'nodesDiscovered.has("server-a")' },
        { id: 'obj_1', label: 'DISCOVER BRAVO -- Find the sandbox cluster',            check: 'nodesDiscovered.has("server-b")' },
        { id: 'obj_2', label: 'DISCOVER CHARLIE -- Find the YARA engine',              check: 'nodesDiscovered.has("server-c")' },
        { id: 'obj_3', label: 'DISCOVER DELTA -- Find the C2 tracker',                 check: 'nodesDiscovered.has("server-d")' },
        { id: 'obj_4', label: 'COMBAT -- Neutralize all 4 enemy processes',            check: 'nodesDiscovered.has("enemy-1") && nodesDiscovered.has("enemy-2") && nodesDiscovered.has("enemy-3") && nodesDiscovered.has("enemy-4")' },
        { id: 'obj_5', label: 'NAVIGATE -- Handle holes and fires',                   check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2")' },
        { id: 'obj_6', label: 'EXTRACTION -- Reach the extraction point',              check: 'nodesDiscovered.has("target")' }
    ],

    /* 6 integrity -- 8 obstacles total, enemies are punishing */
    integrity: 6,

    /* -- Completion screen -- */
    completion: {
        title: 'ENEMY LINES',
        subtitle: 'Four hostiles down. Promise chains handled the triage. Threat hunting infrastructure mapped.',
        storageKey: 'hexworth_operator_js24'
    }
};
