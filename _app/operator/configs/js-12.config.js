/* ================================================================
   JS-12 / Arrow Functions -- Mission Config
   ================================================================
   Tier 2 mission. 8x8 grid — 64 cells.
   Student rewrites callback-heavy code using arrow function syntax.

   DESIGN RATIONALE:
   - JS-08 through JS-11 used function(n) { return ... } everywhere
   - Arrow functions (=>) compress callbacks into one-liners: n => n.name
   - Same operations as before, but the CODE is more concise
   - 5 servers + 2 traps + 1 gate — standard complexity, new syntax
   - The real lesson: arrow functions are syntactic sugar, not new logic
   - Grid is 8x8 — same size as JS-10/11, emphasizing that the CODE shrinks

   JS SKILL: => arrow function syntax — shorter callbacks
   - function(n) { return n.name; }  →  n => n.name
   - function(n) { return n.hasFlag; }  →  n => n.hasFlag
   - Implicit return for single expressions (no braces, no return keyword)
   - Teaches: syntactic sugar, expression bodies, conciseness

   REFERENCE SOLUTION:
     let results = agent.scan();
     // Arrow function versions of filter + forEach
     results
         .filter(n => n.name.includes('SERVER'))
         .forEach(n => agent.move(n.direction));
     // Compare to:
     // results.filter(function(n) { return n.name.includes('SERVER'); })
     //        .forEach(function(n) { agent.move(n.direction); });

   WHY ARROWS MATTER:
   - Modern JavaScript uses arrows almost exclusively for callbacks
   - 60% less boilerplate: no 'function', no 'return', no braces
   - Students reading real code (Stack Overflow, docs, libraries) will see =>
   - Not understanding arrows = can't read modern JS

   GRID LAYOUT (8x8):
     [start]    [empty]    [empty]    [empty]    [server-a] [empty]    [empty]    [empty]
     [empty]    [empty]    [honeypot] [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [server-b] [empty]    [empty]
     [empty]    [empty]    [empty]    [firewall] [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-c] [empty]
     [empty]    [honeypot] [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [server-d] [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-e] [empty]

   5 servers + 2 traps + 1 nmap gate. Same operations, arrow syntax.
   ================================================================ */

var JS_12_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-12',
    title: 'JS-12 / Arrow Functions',
    subtitle: 'Same power. Less typing. Arrow functions compress your callbacks.',
    category: 'javascript-ops',
    difficulty: 3,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 3 = scan, move, nmap, exploit) -- */
    agent: { tier: 3 },

    /* -- 8x8 Grid -- */
    grid: {
        rows: 8, cols: 8,
        cells: [
            /* Row 0 */ ['gateway',    'empty',      'empty',      'empty',       'server-a',   'empty',      'empty',      'empty'],
            /* Row 1 */ ['empty',      'empty',      'honeypot-a', 'empty',       'empty',      'empty',      'empty',      'empty'],
            /* Row 2 */ ['empty',      'empty',      'empty',      'empty',       'empty',      'server-b',   'empty',      'empty'],
            /* Row 3 */ ['empty',      'empty',      'empty',      'firewall',    'empty',      'empty',      'empty',      'empty'],
            /* Row 4 */ ['empty',      'empty',      'empty',      'empty',       'empty',      'empty',      'server-c',   'empty'],
            /* Row 5 */ ['empty',      'honeypot-b', 'empty',      'empty',       'empty',      'empty',      'empty',      'empty'],
            /* Row 6 */ ['empty',      'empty',      'empty',      'empty',       'server-d',   'empty',      'empty',      'empty'],
            /* Row 7 */ ['empty',      'empty',      'empty',      'empty',       'empty',      'empty',      'server-e',   'empty']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':    { label: 'GATEWAY',          abbr: 'GTW', ip: '10.110.1.1',   desc: 'Edge gateway — your insertion point',            ports: ['22/SSH', '443/HTTPS'],                     os: 'Juniper SRX340' },

        /* 5 target servers — incident response infrastructure */
        'server-a':   { label: 'SERVER-ALPHA',      abbr: 'SRA', ip: '10.110.1.10',  desc: 'Forensics workstation — EnCase/Autopsy host',   ports: ['22/SSH', '443/HTTPS', '4822/GUACAMOLE'],   os: 'Ubuntu 24.04 LTS' },
        'server-b':   { label: 'SERVER-BRAVO',      abbr: 'SRB', ip: '10.110.1.11',  desc: 'Evidence locker — chain of custody vault',      ports: ['22/SSH', '2049/NFS', '445/SMB'],           os: 'Debian 12 Bookworm' },
        'server-c':   { label: 'SERVER-CHARLIE',    abbr: 'SRC', ip: '10.110.1.12',  desc: 'IR playbook server — runbook automation',       ports: ['22/SSH', '443/HTTPS', '8080/PHANTOM'],     os: 'CentOS Stream 9' },
        'server-d':   { label: 'SERVER-DELTA',      abbr: 'SRD', ip: '10.110.1.13',  desc: 'Memory dump server — volatility analysis',      ports: ['22/SSH', '443/HTTPS', '5000/API'],         os: 'Windows Server 2022' },
        'server-e':   { label: 'SERVER-ECHO',       abbr: 'SRE', ip: '10.110.1.14',  desc: 'Timeline server — Plaso/log2timeline host',     ports: ['22/SSH', '5601/KIBANA', '9200/ELASTIC'],   os: 'RHEL 9.3' },

        /* 1 firewall gate — requires nmap */
        'firewall':   { label: 'FIREWALL-MID',      abbr: 'FWM', ip: '10.110.1.254', desc: 'Zone firewall — separates upper from lower',    ports: ['22/SSH', '443/MGMT'],                      os: 'Check Point R81.20', vuln: 'CVE-2024-7330', vulnDesc: 'SNMP community string leak reveals bypass route' },

        /* 2 traps — on likely traversal paths */
        'honeypot-a': { label: 'HONEYPOT-UPPER',    abbr: 'HPU', ip: '10.110.1.200', desc: 'Decoy — upper grid corridor trap',              ports: ['22/SSH-FAKE', '80/HTTP-TRAP'],             os: 'Honeyd 1.6 [TRAP]' },
        'honeypot-b': { label: 'HONEYPOT-LOWER',    abbr: 'HPL', ip: '10.110.1.201', desc: 'Decoy — lower grid descent trap',               ports: ['22/SSH-FAKE', '3306/MYSQL-FAKE'],          os: 'Honeyd 1.6 [TRAP]' }
    },

    /* 2 traps on traversal paths */
    traps: ['honeypot-a', 'honeypot-b'],

    /* 1 gate — requires nmap to clear */
    gates: {
        'firewall': { requires: 'nmap', flag: 'firewallBypassed', vuln: 'CVE-2024-7330', vulnDesc: 'SNMP community string leak reveals bypass route' }
    },

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER ALPHA -- Find the forensics workstation',    check: 'nodesDiscovered.has("server-a")' },
        { id: 'obj_1', label: 'DISCOVER BRAVO -- Find the evidence locker',          check: 'nodesDiscovered.has("server-b")' },
        { id: 'obj_2', label: 'DISCOVER CHARLIE -- Find the IR playbook server',     check: 'nodesDiscovered.has("server-c")' },
        { id: 'obj_3', label: 'DISCOVER DELTA -- Find the memory dump server',       check: 'nodesDiscovered.has("server-d")' },
        { id: 'obj_4', label: 'DISCOVER ECHO -- Find the timeline server',           check: 'nodesDiscovered.has("server-e")' },
        { id: 'obj_5', label: 'BYPASS FIREWALL -- Clear the zone firewall',          check: 'flags.has("firewallBypassed")' }
    ],

    /* 3 integrity pips — 2 traps, tight but fair */
    integrity: 3,

    /* -- Completion screen -- */
    completion: {
        title: 'Arrow Functions',
        subtitle: 'Five servers mapped. Arrow functions made the code concise.',
        storageKey: 'hexworth_operator_js12'
    }
};
