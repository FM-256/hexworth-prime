/* ================================================================
   JS-03 / IF/ELSE -- Mission Config
   ================================================================
   Tier 1 mission. 5x5 grid — 25 cells.
   Forces students to use if/else conditional logic.

   DESIGN RATIONALE:
   - 2 honeypots placed on the most direct paths to target servers
   - Student must scan before moving and CHECK what's ahead
   - If scan results show a trap in a direction, go a different way
   - Without conditionals, the student either gets lucky or loses integrity
   - The puzzle TEACHES if/else by making blind movement costly

   JS SKILL: if/else conditional logic
   - if (condition) { ... }
   - if (results.length > 0) { ... } else { ... }
   - Checking array contents before acting

   REFERENCE SOLUTION:
     let results = agent.scan();
     if (results.length > 0) {
         agent.move('east');
     }
     results = agent.scan();
     if (results.length > 0) {
         // check for traps before moving
         agent.move('south');
     } else {
         agent.move('east');
     }

   WHY IF/ELSE IS ESSENTIAL:
   - Two honeypots block the most obvious routes
   - Scan reveals what's ahead, but only if student READS the results
   - Conditional branching: "if trap ahead, go around"
   - This is the first mission where students can actually fail

   GRID LAYOUT (5x5):
     [start]    [empty]    [honeypot] [empty]    [server-a]
     [empty]    [empty]    [empty]    [server-b] [empty]
     [empty]    [honeypot] [empty]    [empty]    [empty]
     [server-c] [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [server-d] [empty]

   4 servers + 2 honeypots. Honeypots block direct east and south paths.
   ================================================================ */

var JS_03_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-03',
    title: 'JS-03 / IF/ELSE',
    subtitle: 'Scan first. Think second. Move third.',
    category: 'javascript-ops',
    difficulty: 2,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 1 = basics: scan, move) -- */
    agent: { tier: 1 },

    /* -- 5x5 Grid -- */
    grid: {
        rows: 5, cols: 5,
        cells: [
            /* Row 0 */ ['gateway',   'empty',     'honeypot-a', 'empty',    'server-a'],
            /* Row 1 */ ['empty',     'empty',     'empty',      'server-b', 'empty'],
            /* Row 2 */ ['empty',     'honeypot-b','empty',      'empty',    'empty'],
            /* Row 3 */ ['server-c',  'empty',     'empty',      'empty',    'empty'],
            /* Row 4 */ ['empty',     'empty',     'empty',      'server-d', 'empty']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':    { label: 'GATEWAY',       abbr: 'GTW', ip: '10.20.1.1',   desc: 'Edge gateway — your insertion point',        ports: ['22/SSH', '443/HTTPS'],                  os: 'Cisco IOS 15.4' },

        /* 4 target servers */
        'server-a':   { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.20.1.10',  desc: 'Web application server — customer portal',   ports: ['22/SSH', '80/HTTP', '8443/HTTPS'],      os: 'Ubuntu 24.04 LTS' },
        'server-b':   { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.20.1.11',  desc: 'Authentication server — LDAP directory',     ports: ['22/SSH', '389/LDAP', '636/LDAPS'],      os: 'Windows Server 2022' },
        'server-c':   { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.20.1.12',  desc: 'Log aggregation server — Syslog collector',  ports: ['22/SSH', '514/SYSLOG', '5044/BEATS'],   os: 'Debian 12 Bookworm' },
        'server-d':   { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.20.1.13',  desc: 'Monitoring server — Nagios dashboard',       ports: ['22/SSH', '5666/NRPE', '8080/HTTP'],     os: 'CentOS Stream 9' },

        /* 2 traps — block the obvious routes */
        'honeypot-a': { label: 'HONEYPOT-EAST',  abbr: 'HPE', ip: '10.20.1.200', desc: 'Decoy — blocks direct east corridor',        ports: ['22/SSH-FAKE', '80/HTTP-TRAP'],          os: 'Honeyd 1.6 [TRAP]' },
        'honeypot-b': { label: 'HONEYPOT-SOUTH', abbr: 'HPS', ip: '10.20.1.201', desc: 'Decoy — blocks direct south corridor',       ports: ['22/SSH-FAKE', '445/SMB-FAKE'],          os: 'Honeyd 1.6 [TRAP]' }
    },

    /* 2 honeypots on direct movement paths */
    traps: ['honeypot-a', 'honeypot-b'],

    /* No gates — focus is on conditional logic */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER ALPHA -- Find the web server',           check: 'nodesDiscovered.has("server-a")' },
        { id: 'obj_1', label: 'DISCOVER BRAVO -- Find the auth server',          check: 'nodesDiscovered.has("server-b")' },
        { id: 'obj_2', label: 'DISCOVER CHARLIE -- Find the log server',         check: 'nodesDiscovered.has("server-c")' },
        { id: 'obj_3', label: 'DISCOVER DELTA -- Find the monitoring server',    check: 'nodesDiscovered.has("server-d")' },
        { id: 'obj_4', label: 'SURVIVE -- Complete with integrity remaining',    check: 'integrity >= 1' }
    ],

    /* 3 integrity pips — 2 traps means student can survive both but barely */
    integrity: 3,

    /* -- Completion screen -- */
    completion: {
        title: 'IF/ELSE',
        subtitle: 'All four servers found. Traps avoided through careful scanning.',
        storageKey: 'hexworth_operator_js03'
    }
};
