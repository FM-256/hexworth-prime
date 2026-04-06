/* ================================================================
   JS-08 / forEach -- Mission Config
   ================================================================
   Tier 2 mission. 7x7 grid — 49 cells.
   First array method mission. Student processes scan results with forEach.

   DESIGN RATIONALE:
   - Scan results are arrays — this is the first time students TREAT them as arrays
   - Previously they used for loops with index variables (results[i])
   - forEach() eliminates index tracking: results.forEach(function(node) { ... })
   - 5 servers scattered, 2 traps along obvious paths
   - The grid is navigable but requires processing each scan result individually
   - forEach is the gateway drug to functional array processing

   JS SKILL: .forEach() — process every element without index management
   - results.forEach(function(node) { console.log(node.name); })
   - The callback receives each element automatically
   - No i variable, no .length check, no off-by-one errors
   - Teaches: callbacks, iteration without counters, array-as-collection

   REFERENCE SOLUTION:
     let results = agent.scan();
     results.forEach(function(node) {
         if (node.name.includes('SERVER')) {
             agent.move(node.direction);
         }
     });
     // Repeat for each position — scan, forEach, move toward servers

   WHY forEach OVER for:
   - for (let i = 0; i < results.length; i++) { results[i]... } = 3 moving parts
   - results.forEach(function(node) { node... }) = 0 moving parts
   - The callback pattern introduces functional thinking
   - Real codebases use forEach constantly for side-effect iteration

   GRID LAYOUT (7x7):
     [start]    [empty]    [server-a] [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [honeypot] [empty]    [empty]
     [empty]    [empty]    [empty]    [server-b] [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [server-c] [empty]
     [empty]    [honeypot] [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [server-d] [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [server-e] [empty]

   5 servers + 2 honeypots. forEach replaces index-based loops.
   ================================================================ */

var JS_08_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-08',
    title: 'JS-08 / forEach',
    subtitle: 'Scan results are arrays. Process every element without counting.',
    category: 'javascript-ops',
    difficulty: 2,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 2 = scan, move, nmap) -- */
    agent: { tier: 2 },

    /* -- 7x7 Grid -- */
    grid: {
        rows: 7, cols: 7,
        cells: [
            /* Row 0 */ ['gateway',    'empty',      'server-a',   'empty',      'empty',      'empty',      'empty'],
            /* Row 1 */ ['empty',      'empty',      'empty',      'empty',      'honeypot-a', 'empty',      'empty'],
            /* Row 2 */ ['empty',      'empty',      'empty',      'server-b',   'empty',      'empty',      'empty'],
            /* Row 3 */ ['empty',      'empty',      'empty',      'empty',      'empty',      'server-c',   'empty'],
            /* Row 4 */ ['empty',      'honeypot-b', 'empty',      'empty',      'empty',      'empty',      'empty'],
            /* Row 5 */ ['empty',      'empty',      'empty',      'server-d',   'empty',      'empty',      'empty'],
            /* Row 6 */ ['empty',      'empty',      'empty',      'empty',      'empty',      'server-e',   'empty']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':    { label: 'GATEWAY',          abbr: 'GTW', ip: '10.70.1.1',   desc: 'Edge gateway — your insertion point',           ports: ['22/SSH', '443/HTTPS'],                     os: 'Cisco IOS 15.4' },

        /* 5 target servers — scattered to require multiple scan-move cycles */
        'server-a':   { label: 'SERVER-ALPHA',      abbr: 'SRA', ip: '10.70.1.10',  desc: 'Log aggregation server — syslog collector',     ports: ['22/SSH', '514/SYSLOG', '9200/ELASTIC'],    os: 'Ubuntu 24.04 LTS' },
        'server-b':   { label: 'SERVER-BRAVO',      abbr: 'SRB', ip: '10.70.1.11',  desc: 'DHCP server — IP address management',           ports: ['22/SSH', '67/DHCP', '68/DHCP'],            os: 'Debian 12 Bookworm' },
        'server-c':   { label: 'SERVER-CHARLIE',    abbr: 'SRC', ip: '10.70.1.12',  desc: 'Monitoring server — Nagios/PRTG dashboard',     ports: ['22/SSH', '5666/NRPE', '8080/HTTP'],        os: 'CentOS Stream 9' },
        'server-d':   { label: 'SERVER-DELTA',      abbr: 'SRD', ip: '10.70.1.13',  desc: 'Backup server — nightly image depot',           ports: ['22/SSH', '873/RSYNC', '10000/WEBMIN'],     os: 'Windows Server 2022' },
        'server-e':   { label: 'SERVER-ECHO',       abbr: 'SRE', ip: '10.70.1.14',  desc: 'DNS server — internal name resolution',         ports: ['22/SSH', '53/DNS', '953/RNDC'],            os: 'RHEL 9.3' },

        /* 2 traps — placed on tempting direct paths */
        'honeypot-a': { label: 'HONEYPOT-NORTH',    abbr: 'HPN', ip: '10.70.1.200', desc: 'Decoy — guards the northeast corridor',         ports: ['22/SSH-FAKE', '80/HTTP-TRAP'],             os: 'Honeyd 1.6 [TRAP]' },
        'honeypot-b': { label: 'HONEYPOT-WEST',     abbr: 'HPW', ip: '10.70.1.201', desc: 'Decoy — blocks the western descent',            ports: ['22/SSH-FAKE', '3389/RDP-FAKE'],            os: 'Honeyd 1.6 [TRAP]' }
    },

    /* 2 traps along obvious movement paths */
    traps: ['honeypot-a', 'honeypot-b'],

    /* No gates — focus is on forEach iteration */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER ALPHA -- Find the log aggregation server',   check: 'nodesDiscovered.has("server-a")' },
        { id: 'obj_1', label: 'DISCOVER BRAVO -- Find the DHCP server',              check: 'nodesDiscovered.has("server-b")' },
        { id: 'obj_2', label: 'DISCOVER CHARLIE -- Find the monitoring server',       check: 'nodesDiscovered.has("server-c")' },
        { id: 'obj_3', label: 'DISCOVER DELTA -- Find the backup server',            check: 'nodesDiscovered.has("server-d")' },
        { id: 'obj_4', label: 'DISCOVER ECHO -- Find the DNS server',                check: 'nodesDiscovered.has("server-e")' },
        { id: 'obj_5', label: 'SURVIVE -- Complete with integrity remaining',         check: 'integrity >= 1' }
    ],

    /* 3 integrity pips — 2 traps, so 1 mistake margin */
    integrity: 3,

    /* -- Completion screen -- */
    completion: {
        title: 'forEach',
        subtitle: 'Five servers found. forEach processed every scan result cleanly.',
        storageKey: 'hexworth_operator_js08'
    }
};
