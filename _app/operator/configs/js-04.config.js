/* ================================================================
   JS-04 / FOR LOOP -- Mission Config
   ================================================================
   Tier 1 mission. 6x6 grid — 36 cells.
   Forces students to use a for loop. Grid is too big for manual commands.

   DESIGN RATIONALE:
   - 6x6 grid = 36 cells. Manually typing scan+move for each is brutal.
   - 5 servers scattered across the grid — no direct path hits all of them
   - A systematic sweep (row by row) using a for loop is the intended solution
   - The for loop syntax: for (let i = 0; i < n; i++) { ... }
   - One trap placed along the eastern edge to punish edge-runners

   JS SKILL: for (let i = 0; i < n; i++) loop
   - Classic C-style for loop that JavaScript inherited
   - let i = 0 : initialize counter
   - i < n     : continue while true
   - i++       : increment after each iteration

   REFERENCE SOLUTION:
     // Sweep east across a row, then step south, repeat
     for (let i = 0; i < 5; i++) {
         agent.scan();
         agent.move('east');
     }
     agent.scan();
     agent.move('south');
     for (let i = 0; i < 5; i++) {
         agent.scan();
         agent.move('west');
     }
     agent.scan();
     agent.move('south');
     // ... continue lawnmower pattern

   WHY MANUAL FAILS:
   - 5 servers across 36 cells — student doesn't know exact positions
   - Typing agent.move() 20+ times is tedious and error-prone
   - A for loop over 5 iterations covers a full row in 3 lines of code
   - The lesson: repetition = loop, not copy-paste

   GRID LAYOUT (6x6):
     [start]    [empty]    [empty]    [server-a] [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [server-b] [empty]    [empty]    [empty]    [honeypot]
     [empty]    [empty]    [empty]    [empty]    [server-c] [empty]
     [empty]    [empty]    [server-d] [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [server-e] [empty]

   5 servers scattered. 1 honeypot on eastern edge. For-loop sweep is ideal.
   ================================================================ */

var JS_04_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-04',
    title: 'JS-04 / FOR LOOP',
    subtitle: 'Too many cells for manual commands. Automate the sweep.',
    category: 'javascript-ops',
    difficulty: 2,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 1 = basics: scan, move) -- */
    agent: { tier: 1 },

    /* -- 6x6 Grid -- */
    grid: {
        rows: 6, cols: 6,
        cells: [
            /* Row 0 */ ['gateway',  'empty',    'empty',    'server-a', 'empty',    'empty'],
            /* Row 1 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 2 */ ['empty',    'server-b', 'empty',    'empty',    'empty',    'honeypot'],
            /* Row 3 */ ['empty',    'empty',    'empty',    'empty',    'server-c', 'empty'],
            /* Row 4 */ ['empty',    'empty',    'server-d', 'empty',    'empty',    'empty'],
            /* Row 5 */ ['empty',    'empty',    'empty',    'empty',    'server-e', 'empty']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':  { label: 'GATEWAY',       abbr: 'GTW', ip: '10.30.1.1',   desc: 'Edge gateway — your insertion point',       ports: ['22/SSH', '443/HTTPS'],                    os: 'Cisco IOS 15.4' },

        /* 5 target servers — spread across the grid to force full sweep */
        'server-a': { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.30.1.10',  desc: 'Print server — handles network printing',   ports: ['22/SSH', '515/LPR', '631/IPP'],           os: 'Ubuntu 24.04 LTS' },
        'server-b': { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.30.1.11',  desc: 'Proxy server — caches web traffic',         ports: ['22/SSH', '3128/SQUID', '8080/HTTP'],      os: 'Debian 12 Bookworm' },
        'server-c': { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.30.1.12',  desc: 'NTP server — synchronizes network clocks',  ports: ['22/SSH', '123/NTP'],                      os: 'CentOS Stream 9' },
        'server-d': { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.30.1.13',  desc: 'FTP server — file transfer depot',          ports: ['22/SSH', '21/FTP', '990/FTPS'],           os: 'Windows Server 2022' },
        'server-e': { label: 'SERVER-ECHO',    abbr: 'SRE', ip: '10.30.1.14',  desc: 'RADIUS server — network authentication',   ports: ['22/SSH', '1812/RADIUS', '1813/ACCT'],     os: 'RHEL 9.3' },

        /* 1 trap — on the eastern edge to punish blind edge-runners */
        'honeypot': { label: 'HONEYPOT',       abbr: 'HNY', ip: '10.30.1.200', desc: 'Decoy server — eastern edge trap',          ports: ['22/SSH-FAKE', '80/HTTP-TRAP'],            os: 'Honeyd 1.6 [TRAP]' }
    },

    /* 1 trap on the eastern edge */
    traps: ['honeypot'],

    /* No gates — focus is on for-loop iteration */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER ALPHA -- Find the print server',       check: 'nodesDiscovered.has("server-a")' },
        { id: 'obj_1', label: 'DISCOVER BRAVO -- Find the proxy server',       check: 'nodesDiscovered.has("server-b")' },
        { id: 'obj_2', label: 'DISCOVER CHARLIE -- Find the NTP server',       check: 'nodesDiscovered.has("server-c")' },
        { id: 'obj_3', label: 'DISCOVER DELTA -- Find the FTP server',         check: 'nodesDiscovered.has("server-d")' },
        { id: 'obj_4', label: 'DISCOVER ECHO -- Find the RADIUS server',       check: 'nodesDiscovered.has("server-e")' }
    ],

    /* 2 integrity pips — 1 trap, so student has 1 mistake allowed */
    integrity: 2,

    /* -- Completion screen -- */
    completion: {
        title: 'FOR LOOP',
        subtitle: 'All five servers found. The grid falls to automation.',
        storageKey: 'hexworth_operator_js04'
    }
};
