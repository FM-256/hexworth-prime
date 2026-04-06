/* ================================================================
   JS-05 / WHILE LOOP -- Mission Config
   ================================================================
   Tier 1 mission. 6x6 grid — 36 cells.
   Forces students to use while loops with conditions.

   DESIGN RATIONALE:
   - 4 servers to find, but 3 traps along the most direct paths
   - A for loop with a fixed count won't work well here because
     the student needs to STOP when all targets are found
   - while (found < 4) is the natural pattern: keep going until done
   - The 3 traps make integrity management critical
   - Student must survive with integrity > 0 — can't eat all 3 traps

   JS SKILL: while loop with a condition
   - while (condition) { ... }
   - Condition checked BEFORE each iteration
   - Must update the condition variable inside the loop (or infinite loop!)
   - Teaches: loop control, counter variables, termination conditions

   REFERENCE SOLUTION:
     let found = 0;
     while (found < 4) {
         let results = agent.scan();
         // Check for servers in scan results
         if (results.length > 0) {
             found++;
         }
         agent.move('south');
     }

   WHY WHILE vs FOR:
   - for loop: "do this N times" — good when you know the count
   - while loop: "do this UNTIL condition" — good when you don't
   - Here, the student doesn't know how many moves to reach all 4 servers
   - while (found < 4) naturally expresses "keep going until I found them all"

   GRID LAYOUT (6x6):
     [start]    [empty]    [empty]    [honeypot] [empty]    [empty]
     [empty]    [server-a] [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [honeypot] [empty]
     [empty]    [empty]    [server-b] [empty]    [empty]    [empty]
     [honeypot] [empty]    [empty]    [empty]    [server-c] [empty]
     [empty]    [empty]    [empty]    [server-d] [empty]    [empty]

   4 servers + 3 honeypots. Traps on direct paths force careful navigation.
   ================================================================ */

var JS_05_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-05',
    title: 'JS-05 / WHILE LOOP',
    subtitle: 'Keep moving until the mission is done. Know when to stop.',
    category: 'javascript-ops',
    difficulty: 2,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 1 = basics: scan, move) -- */
    agent: { tier: 1 },

    /* -- 6x6 Grid -- */
    grid: {
        rows: 6, cols: 6,
        cells: [
            /* Row 0 */ ['gateway',    'empty',    'empty',    'honeypot-a', 'empty',    'empty'],
            /* Row 1 */ ['empty',      'server-a', 'empty',    'empty',      'empty',    'empty'],
            /* Row 2 */ ['empty',      'empty',    'empty',    'empty',      'honeypot-b','empty'],
            /* Row 3 */ ['empty',      'empty',    'server-b', 'empty',      'empty',    'empty'],
            /* Row 4 */ ['honeypot-c', 'empty',    'empty',    'empty',      'server-c', 'empty'],
            /* Row 5 */ ['empty',      'empty',    'empty',    'server-d',   'empty',    'empty']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':    { label: 'GATEWAY',       abbr: 'GTW', ip: '10.40.1.1',   desc: 'Edge gateway — your insertion point',         ports: ['22/SSH', '443/HTTPS'],                      os: 'Cisco IOS 15.4' },

        /* 4 target servers — must find all 4 */
        'server-a':   { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.40.1.10',  desc: 'SNMP management server — device inventory',   ports: ['22/SSH', '161/SNMP', '162/SNMP-TRAP'],      os: 'Ubuntu 24.04 LTS' },
        'server-b':   { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.40.1.11',  desc: 'Syslog server — centralized logging',         ports: ['22/SSH', '514/SYSLOG', '6514/SYSLOG-TLS'],  os: 'Debian 12 Bookworm' },
        'server-c':   { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.40.1.12',  desc: 'TFTP server — firmware update depot',         ports: ['22/SSH', '69/TFTP'],                        os: 'CentOS Stream 9' },
        'server-d':   { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.40.1.13',  desc: 'VPN concentrator — remote access gateway',    ports: ['22/SSH', '500/ISAKMP', '4500/NAT-T'],       os: 'RHEL 9.3' },

        /* 3 traps — along the most direct movement paths */
        'honeypot-a': { label: 'HONEYPOT-NORTH', abbr: 'HPN', ip: '10.40.1.200', desc: 'Decoy — blocks direct east corridor',         ports: ['22/SSH-FAKE', '80/HTTP-TRAP'],              os: 'Honeyd 1.6 [TRAP]' },
        'honeypot-b': { label: 'HONEYPOT-MID',   abbr: 'HPM', ip: '10.40.1.201', desc: 'Decoy — blocks center-east path',             ports: ['22/SSH-FAKE', '443/HTTPS-FAKE'],            os: 'Honeyd 1.6 [TRAP]' },
        'honeypot-c': { label: 'HONEYPOT-WEST',  abbr: 'HPW', ip: '10.40.1.202', desc: 'Decoy — blocks direct south corridor',        ports: ['22/SSH-FAKE', '3389/RDP-FAKE'],             os: 'Honeyd 1.6 [TRAP]' }
    },

    /* 3 honeypots on the most direct paths */
    traps: ['honeypot-a', 'honeypot-b', 'honeypot-c'],

    /* No gates — focus is on while-loop control flow */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER ALPHA -- Find the SNMP server',        check: 'nodesDiscovered.has("server-a")' },
        { id: 'obj_1', label: 'DISCOVER BRAVO -- Find the syslog server',      check: 'nodesDiscovered.has("server-b")' },
        { id: 'obj_2', label: 'DISCOVER CHARLIE -- Find the TFTP server',      check: 'nodesDiscovered.has("server-c")' },
        { id: 'obj_3', label: 'DISCOVER DELTA -- Find the VPN concentrator',   check: 'nodesDiscovered.has("server-d")' },
        { id: 'obj_4', label: 'SURVIVE -- Complete with integrity remaining',   check: 'integrity >= 1' }
    ],

    /* 4 integrity pips — 3 traps, so hitting all 3 leaves only 1 pip */
    integrity: 4,

    /* -- Completion screen -- */
    completion: {
        title: 'WHILE LOOP',
        subtitle: 'Four servers found. Loop terminated cleanly.',
        storageKey: 'hexworth_operator_js05'
    }
};
