/* ================================================================
   JS-02 / VARIABLE STORAGE -- Mission Config
   ================================================================
   Tier 1 mission. 5x5 grid — 25 cells.
   Forces students to store scan results in variables.

   DESIGN RATIONALE:
   - agent.scan() returns an array of nearby node objects
   - If the student ignores the return value, they're flying blind
   - One honeypot punishes blind east-then-south movement
   - The correct approach: store scan results in a variable, read them
   - Teaches let/const and the concept of return values

   JS SKILL: let/const variable declaration + storing return values
   - let results = agent.scan();  // store the array
   - const data = agent.scan();   // const also works
   - results is an array — student will see it in the output panel

   REFERENCE SOLUTION:
     let results = agent.scan();
     agent.move('east');
     results = agent.scan();
     agent.move('east');
     results = agent.scan();
     agent.move('south');
     results = agent.scan();
     agent.move('south');
     results = agent.scan();

   WHY VARIABLES MATTER:
   - Scan returns data about adjacent nodes (name, direction, type)
   - Without storing it, student can't know what's around them
   - The honeypot at (3,1) catches students who blindly move east
   - Storing results lets you see "HONEYPOT ahead" before walking into it

   GRID LAYOUT (5x5):
     [start]    [empty]    [empty]    [honeypot] [empty]
     [empty]    [server-a] [empty]    [empty]    [empty]
     [empty]    [empty]    [server-b] [empty]    [empty]
     [empty]    [empty]    [empty]    [server-c] [empty]
     [empty]    [empty]    [empty]    [empty]    [server-d]

   4 servers along a diagonal path. 1 honeypot guarding the east corridor.
   ================================================================ */

var JS_02_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-02',
    title: 'JS-02 / VARIABLE STORAGE',
    subtitle: 'Store what you find. Variables are your memory.',
    category: 'javascript-ops',
    difficulty: 1,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 1 = basics: scan, move) -- */
    agent: { tier: 1 },

    /* -- 5x5 Grid -- */
    grid: {
        rows: 5, cols: 5,
        cells: [
            /* Row 0 */ ['gateway',  'empty',    'empty',    'honeypot', 'empty'],
            /* Row 1 */ ['empty',    'server-a', 'empty',    'empty',    'empty'],
            /* Row 2 */ ['empty',    'empty',    'server-b', 'empty',    'empty'],
            /* Row 3 */ ['empty',    'empty',    'empty',    'server-c', 'empty'],
            /* Row 4 */ ['empty',    'empty',    'empty',    'empty',    'server-d']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':  { label: 'GATEWAY',       abbr: 'GTW', ip: '10.10.1.1',  desc: 'Edge gateway — your insertion point',        ports: ['22/SSH', '443/HTTPS'],                    os: 'Cisco IOS 15.4' },

        /* 4 target servers — scattered along a diagonal */
        'server-a': { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.10.1.10', desc: 'DHCP server — assigns network addresses',    ports: ['22/SSH', '67/DHCP', '68/DHCP'],           os: 'Ubuntu 24.04 LTS' },
        'server-b': { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.10.1.11', desc: 'DNS server — resolves internal hostnames',   ports: ['22/SSH', '53/DNS', '953/RNDC'],           os: 'Debian 12 Bookworm' },
        'server-c': { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.10.1.12', desc: 'Mail server — corporate email relay',        ports: ['22/SSH', '25/SMTP', '587/SUBMISSION'],    os: 'CentOS Stream 9' },
        'server-d': { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.10.1.13', desc: 'Backup server — weekly snapshots',           ports: ['22/SSH', '873/RSYNC', '3260/ISCSI'],      os: 'RHEL 9.3' },

        /* 1 trap — punishes blind eastward movement */
        'honeypot': { label: 'HONEYPOT',       abbr: 'HNY', ip: '10.10.1.200', desc: 'Decoy server — triggers alert on contact',  ports: ['22/SSH-FAKE', '80/HTTP-TRAP'],            os: 'Honeyd 1.6 [TRAP]' }
    },

    /* 1 honeypot at (0,3) — directly in the blind-rush path */
    traps: ['honeypot'],

    /* No gates — focus is on variables, not tools */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER ALPHA -- Find the DHCP server',      check: 'nodesDiscovered.has("server-a")' },
        { id: 'obj_1', label: 'DISCOVER BRAVO -- Find the DNS server',       check: 'nodesDiscovered.has("server-b")' },
        { id: 'obj_2', label: 'DISCOVER CHARLIE -- Find the mail server',    check: 'nodesDiscovered.has("server-c")' },
        { id: 'obj_3', label: 'DISCOVER DELTA -- Find the backup server',    check: 'nodesDiscovered.has("server-d")' }
    ],

    /* 2 integrity pips — honeypot costs 1, so student can survive 1 mistake */
    integrity: 2,

    /* -- Completion screen -- */
    completion: {
        title: 'VARIABLE STORAGE',
        subtitle: 'Four servers discovered. You learned to read the grid.',
        storageKey: 'hexworth_operator_js02'
    }
};
