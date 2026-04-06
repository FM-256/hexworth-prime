/* ================================================================
   JS-19 / CALLBACK MODE -- Mission Config
   ================================================================
   Tier 4 mission. 8x8 grid -- 64 cells.
   CALLBACKS INTRODUCED. This is the beginning of the async arc.
   Operations now accept optional callback functions instead of
   returning results directly.

   DESIGN RATIONALE:
   - Callbacks are JavaScript's original async pattern
   - agent.scan() now accepts a function argument: agent.scan(function(results) { ... })
   - The results arrive INSIDE the callback, not as a return value
   - 3 holes + 2 fires force multi-obstacle handling inside the callback
   - Student must write function(results) { } and process the array inside
   - This is the foundation for understanding why Promises exist

   JS SKILL: Callbacks -- passing functions as arguments
   - A callback is a function passed to another function
   - agent.scan(function(results) { ... }) -- results delivered to YOUR function
   - agent.move('east', function() { ... }) -- called AFTER the move completes
   - Key insight: the code inside the callback runs LATER, not immediately

   REFERENCE SOLUTION:
     agent.scan(function(results) {
         results.forEach(function(node) {
             if (node.name.includes('HOLE')) {
                 agent.jump(node.direction);
             } else if (node.name.includes('FIRE')) {
                 agent.extinguish(node.direction);
             } else {
                 agent.move(node.direction);
             }
         });
     });

   WHY CALLBACKS MATTER:
   - JavaScript is single-threaded -- callbacks let operations happen without blocking
   - Network requests, file I/O, timers all use callbacks
   - Understanding callbacks is REQUIRED before Promises or async/await make sense
   - This level makes the student FEEL the pattern: "pass a function, get results later"

   GRID LAYOUT (8x8):
     [start]    [empty]    [hole-1]   [empty]    [server-a] [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [fire-1]   [empty]    [empty]    [empty]    [server-b] [empty]    [wall]
     [empty]    [empty]    [empty]    [hole-2]   [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-c] [empty]
     [empty]    [empty]    [fire-2]   [empty]    [empty]    [empty]    [empty]    [wall]
     [empty]    [empty]    [empty]    [empty]    [hole-3]   [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-d] [empty]

   3 holes + 2 fires. Callbacks are the new execution model.
   ================================================================ */

var JS_19_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-19',
    title: 'JS-19 / CALLBACK MODE',
    subtitle: 'Operations go async. Pass a function. Get results later.',
    category: 'javascript-ops',
    difficulty: 3,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 2 = scan, move, jump, extinguish) -- */
    agent: { tier: 2 },

    /* -- 8x8 Grid -- */
    grid: {
        rows: 8, cols: 8,
        cells: [
            /* Row 0 */ ['gateway',  'empty',    'hole-1',   'empty',    'server-a', 'empty',    'empty',    'empty'],
            /* Row 1 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 2 */ ['empty',    'fire-1',   'empty',    'empty',    'empty',    'server-b', 'empty',    'wall'],
            /* Row 3 */ ['empty',    'empty',    'empty',    'hole-2',   'empty',    'empty',    'empty',    'empty'],
            /* Row 4 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-c', 'empty'],
            /* Row 5 */ ['empty',    'empty',    'fire-2',   'empty',    'empty',    'empty',    'empty',    'wall'],
            /* Row 6 */ ['empty',    'empty',    'empty',    'empty',    'hole-3',   'empty',    'empty',    'empty'],
            /* Row 7 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-d', 'empty']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':  { label: 'GATEWAY',       abbr: 'GTW', ip: '10.190.1.1',   desc: 'Perimeter gateway -- callback-mode insertion',          ports: ['22/SSH', '443/HTTPS'],                    os: 'Palo Alto PAN-OS 11.1' },

        /* 4 target servers -- SOC infrastructure */
        'server-a': { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.190.1.10',  desc: 'SIEM collector -- security event aggregation',          ports: ['22/SSH', '514/SYSLOG', '9997/SPLUNK'],    os: 'Ubuntu 24.04 LTS' },
        'server-b': { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.190.1.11',  desc: 'Threat intel feed -- IOC correlation engine',           ports: ['22/SSH', '443/HTTPS', '5000/API'],        os: 'Debian 12 Bookworm' },
        'server-c': { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.190.1.12',  desc: 'Incident response platform -- case management',        ports: ['22/SSH', '443/HTTPS', '8443/IR-API'],     os: 'CentOS Stream 9' },
        'server-d': { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.190.1.13',  desc: 'Forensics workstation -- disk image analysis',          ports: ['22/SSH', '3389/RDP', '8080/AUTOPSY'],     os: 'Windows Server 2022' },

        /* 3 holes -- must be jumped */
        'hole-1':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Severed uplink -- jump to cross',                               ports: [] },
        'hole-2':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Backbone fracture -- jump to cross',                            ports: [] },
        'hole-3':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Routing void -- jump to cross',                                 ports: [] },

        /* 2 fires -- must be extinguished */
        'fire-1':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Active thermal breach -- extinguish to pass',                   ports: [] },
        'fire-2':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Overloaded circuit -- extinguish to pass',                      ports: [] }
    },

    /* No traps -- focus on obstacle callbacks */
    traps: [],

    /* Obstacles: holes + fires */
    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3'],
        fires: ['fire-1', 'fire-2']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER ALPHA -- Find the SIEM collector',            check: 'nodesDiscovered.has("server-a")' },
        { id: 'obj_1', label: 'DISCOVER BRAVO -- Find the threat intel feed',          check: 'nodesDiscovered.has("server-b")' },
        { id: 'obj_2', label: 'DISCOVER CHARLIE -- Find the IR platform',              check: 'nodesDiscovered.has("server-c")' },
        { id: 'obj_3', label: 'DISCOVER DELTA -- Find the forensics workstation',      check: 'nodesDiscovered.has("server-d")' },
        { id: 'obj_4', label: 'NAVIGATE -- Handle all holes and fires',                check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3") && nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2")' }
    ],

    /* Moderate integrity -- two obstacle types to handle */
    integrity: 5,

    /* -- Completion screen -- */
    completion: {
        title: 'CALLBACK MODE',
        subtitle: 'Async operations mastered. Callbacks deliver results. Functions as arguments.',
        storageKey: 'hexworth_operator_js19'
    }
};
