/* ================================================================
   JS-23 / PROMISE CHAINS -- Mission Config
   ================================================================
   Tier 4 mission. 9x9 grid -- 81 cells.
   ENEMIES INTRODUCED alongside Promise chains and arrow functions.
   The third obstacle type: agent.fight(direction).

   DESIGN RATIONALE:
   - Enemies are hostile processes that block grid cells
   - Unlike holes (jump) and fires (extinguish), enemies require fight()
   - Student now has THREE obstacle handlers inside .then() blocks
   - Arrow functions are introduced: (results) => { ... } instead of function(results) { ... }
   - .filter() + .forEach() inside .then() to process specific threats
   - Promise chains keep the code flat even with increased complexity

   JS SKILL: Arrow functions + .filter() in promise chains
   - Arrow functions: (x) => { ... } -- shorter function syntax
   - .filter(n => n.name.includes('ENEMY')) -- isolate threats
   - Chaining .filter().forEach() inside .then() blocks
   - Three obstacle types: HOLE -> jump, FIRE -> extinguish, ENEMY -> fight

   REFERENCE SOLUTION:
     agent.scan()
         .then(results => {
             // Handle enemies first -- they're aggressive
             let threats = results.filter(n => n.name.includes('ENEMY'));
             threats.forEach(n => agent.fight(n.direction));
             // Handle environmental obstacles
             results.filter(n => n.name.includes('HOLE'))
                 .forEach(n => agent.jump(n.direction));
             results.filter(n => n.name.includes('FIRE'))
                 .forEach(n => agent.extinguish(n.direction));
             return agent.move('east');
         })
         .then(() => agent.scan())
         .then(results => {
             // Same handler pattern for new zone
             results.forEach(n => {
                 if (n.name.includes('ENEMY')) agent.fight(n.direction);
                 else if (n.name.includes('HOLE')) agent.jump(n.direction);
                 else if (n.name.includes('FIRE')) agent.extinguish(n.direction);
             });
             return agent.move('south');
         });

   WHY ENEMIES + PROMISES:
   - Enemies add urgency -- they can damage the agent if not handled
   - Promise chains handle the complexity gracefully
   - Arrow functions reduce boilerplate: function(x){} becomes x => {}
   - The student sees that promises SCALE with complexity

   GRID LAYOUT (9x9):
     [start]    [empty]    [empty]    [hole-1]   [empty]    [server-a] [empty]    [empty]    [empty]
     [empty]    [enemy-1]  [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [fire-1]   [empty]    [empty]    [server-b] [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [hole-2]   [empty]    [empty]    [wall]
     [empty]    [empty]    [fire-2]   [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [enemy-2]  [empty]    [server-c] [empty]    [empty]
     [empty]    [fire-3]   [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [hole-3]   [empty]    [empty]    [empty]    [server-d] [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [target]

   2 holes + 3 fires + 2 enemies. Arrow functions + promise chains.
   ================================================================ */

var JS_23_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-23',
    title: 'JS-23 / PROMISE CHAINS',
    subtitle: 'Enemies enter the grid. Arrow functions sharpen your chains.',
    category: 'javascript-ops',
    difficulty: 3,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 3 = scan, move, jump, extinguish, fight) -- */
    agent: { tier: 3 },

    /* -- 9x9 Grid -- */
    grid: {
        rows: 9, cols: 9,
        cells: [
            /* Row 0 */ ['gateway',  'empty',    'empty',    'hole-1',   'empty',    'server-a', 'empty',    'empty',    'empty'],
            /* Row 1 */ ['empty',    'enemy-1',  'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 2 */ ['empty',    'empty',    'empty',    'fire-1',   'empty',    'empty',    'server-b', 'empty',    'empty'],
            /* Row 3 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'hole-2',   'empty',    'empty',    'wall'],
            /* Row 4 */ ['empty',    'empty',    'fire-2',   'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 5 */ ['empty',    'empty',    'empty',    'empty',    'enemy-2',  'empty',    'server-c', 'empty',    'empty'],
            /* Row 6 */ ['empty',    'fire-3',   'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 7 */ ['empty',    'empty',    'empty',    'hole-3',   'empty',    'empty',    'empty',    'server-d', 'empty'],
            /* Row 8 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':  { label: 'GATEWAY',       abbr: 'GTW', ip: '10.230.1.1',   desc: 'DMZ gateway -- hostile territory ahead',                ports: ['22/SSH', '443/HTTPS'],                    os: 'Check Point R81.20' },

        /* 4 target servers -- zero trust microsegmented network */
        'server-a': { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.230.1.10',  desc: 'DNS resolver -- internal name resolution',              ports: ['22/SSH', '53/DNS', '853/DNS-TLS'],        os: 'Ubuntu 24.04 LTS' },
        'server-b': { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.230.1.11',  desc: 'Mail gateway -- SMTP relay and filtering',              ports: ['22/SSH', '25/SMTP', '587/SUBMISSION'],    os: 'Debian 12 Bookworm' },
        'server-c': { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.230.1.12',  desc: 'Web application firewall -- request inspection',        ports: ['22/SSH', '443/HTTPS', '8443/WAF-MGMT'],  os: 'CentOS Stream 9' },
        'server-d': { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.230.1.13',  desc: 'Log aggregator -- centralized event collection',        ports: ['22/SSH', '514/SYSLOG', '5044/BEATS'],     os: 'RHEL 9.3' },

        /* Extraction point */
        'target':   { label: 'EXTRACTION',     abbr: 'EXT', ip: '10.230.1.99',  desc: 'Extraction point -- chain complete',                    ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* 2 enemies -- NEW obstacle type. Fight to pass. */
        'enemy-1':  { label: 'ENEMY SENTINEL', abbr: 'SNL', ip: null, desc: 'Sentinel process -- fight to neutralize',                       ports: [] },
        'enemy-2':  { label: 'ENEMY WATCHER',  abbr: 'WCH', ip: null, desc: 'Watcher daemon -- fight to neutralize',                         ports: [] },

        /* 3 holes -- jump required */
        'hole-1':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'DNS resolution gap -- jump to cross',                           ports: [] },
        'hole-2':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Segment boundary void -- jump to cross',                        ports: [] },
        'hole-3':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Log pipeline break -- jump to cross',                           ports: [] },

        /* 3 fires -- extinguish required */
        'fire-1':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'DNS amplification fire -- extinguish to pass',                  ports: [] },
        'fire-2':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Mail relay overload -- extinguish to pass',                     ports: [] },
        'fire-3':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'WAF rule explosion -- extinguish to pass',                      ports: [] }
    },

    /* No traps -- three obstacle types are enough */
    traps: [],

    /* Obstacles: holes + fires + enemies */
    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3'],
        fires: ['fire-1', 'fire-2', 'fire-3'],
        enemies: ['enemy-1', 'enemy-2']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER ALPHA -- Find the DNS resolver',              check: 'nodesDiscovered.has("server-a")' },
        { id: 'obj_1', label: 'DISCOVER BRAVO -- Find the mail gateway',               check: 'nodesDiscovered.has("server-b")' },
        { id: 'obj_2', label: 'DISCOVER CHARLIE -- Find the WAF',                      check: 'nodesDiscovered.has("server-c")' },
        { id: 'obj_3', label: 'DISCOVER DELTA -- Find the log aggregator',             check: 'nodesDiscovered.has("server-d")' },
        { id: 'obj_4', label: 'COMBAT -- Defeat both enemy processes',                 check: 'nodesDiscovered.has("enemy-1") && nodesDiscovered.has("enemy-2")' },
        { id: 'obj_5', label: 'NAVIGATE -- Handle all obstacles',                     check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3") && nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2") && nodesDiscovered.has("fire-3")' },
        { id: 'obj_6', label: 'EXTRACTION -- Reach the extraction point',              check: 'nodesDiscovered.has("target")' }
    ],

    /* 6 integrity -- 8 obstacles total */
    integrity: 6,

    /* -- Completion screen -- */
    completion: {
        title: 'PROMISE CHAINS',
        subtitle: 'Enemies neutralized. Three obstacle types. Arrow functions and .then() kept it clean.',
        storageKey: 'hexworth_operator_js23'
    }
};
