/* ================================================================
   JS-11 / find -- Mission Config
   ================================================================
   Tier 2 mission. 8x8 grid — 64 cells.
   Student must locate ONE specific target among many using .find().

   DESIGN RATIONALE:
   - Previous missions: find ALL servers. This mission: find ONE SPECIFIC server.
   - The grid has 5 servers but only ONE is the objective target (TARGET-PRIME)
   - .find() returns the FIRST element matching a condition — not an array
   - 3 traps scattered to punish blind movement toward every server
   - 1 gate requiring exploit adds depth — must clear the gate to reach target
   - filter() returns many; find() returns one — this teaches the difference

   JS SKILL: .find() — locate a single specific element
   - results.find(function(n) { return n.name.includes('TARGET'); })
   - Returns the FIRST matching element (an object, not an array)
   - Returns undefined if nothing matches
   - Teaches: single-value extraction, specificity over breadth

   REFERENCE SOLUTION:
     let results = agent.scan();
     // Find the primary target among all scan results
     let target = results.find(function(n) {
         return n.name.includes('TARGET');
     });
     if (target) {
         agent.move(target.direction);
     }
     // Also discover other servers for bonus objectives
     // Use exploit to clear the gate blocking the target zone

   WHY FIND OVER FILTER:
   - filter() when you want ALL matches → returns array
   - find() when you want THE ONE match → returns single element
   - Common pattern: find the admin user, find the error log, find the open port
   - Prevents: filter()[0] anti-pattern (filtering then grabbing first)

   GRID LAYOUT (8x8):
     [start]    [empty]    [server-a] [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [honeypot] [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [server-b] [empty]    [empty]
     [empty]    [honeypot] [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [exploit]  [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-c] [empty]
     [empty]    [empty]    [honeypot] [empty]    [empty]    [target]   [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [server-d] [empty]    [server-e] [empty]

   5 servers (1 is TARGET-PRIME) + 3 traps + 1 exploit gate. find() is key.
   ================================================================ */

var JS_11_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-11',
    title: 'JS-11 / find',
    subtitle: 'One target. Many distractions. Find the exact node you need.',
    category: 'javascript-ops',
    difficulty: 3,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 3 = scan, move, nmap, exploit) -- */
    agent: { tier: 3 },

    /* -- 8x8 Grid -- */
    grid: {
        rows: 8, cols: 8,
        cells: [
            /* Row 0 */ ['gateway',    'empty',      'server-a',   'empty',       'empty',      'empty',      'empty',      'empty'],
            /* Row 1 */ ['empty',      'empty',      'empty',      'empty',       'honeypot-a', 'empty',      'empty',      'empty'],
            /* Row 2 */ ['empty',      'empty',      'empty',      'empty',       'empty',      'server-b',   'empty',      'empty'],
            /* Row 3 */ ['empty',      'honeypot-b', 'empty',      'empty',       'empty',      'empty',      'empty',      'empty'],
            /* Row 4 */ ['empty',      'empty',      'empty',      'exploit-gate','empty',      'empty',      'empty',      'empty'],
            /* Row 5 */ ['empty',      'empty',      'empty',      'empty',       'empty',      'empty',      'server-c',   'empty'],
            /* Row 6 */ ['empty',      'empty',      'honeypot-c', 'empty',       'empty',      'target',     'empty',      'empty'],
            /* Row 7 */ ['empty',      'empty',      'empty',      'empty',       'server-d',   'empty',      'server-e',   'empty']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':      { label: 'GATEWAY',          abbr: 'GTW', ip: '10.100.1.1',   desc: 'Edge gateway — your insertion point',           ports: ['22/SSH', '443/HTTPS'],                    os: 'Cisco IOS 15.4' },

        /* 4 regular servers — discoverable but not the primary objective */
        'server-a':     { label: 'SERVER-ALPHA',      abbr: 'SRA', ip: '10.100.1.10',  desc: 'Mail relay — outbound SMTP gateway',            ports: ['22/SSH', '25/SMTP', '587/SUBMISSION'],    os: 'Ubuntu 24.04 LTS' },
        'server-b':     { label: 'SERVER-BRAVO',      abbr: 'SRB', ip: '10.100.1.11',  desc: 'Print server — network print queue',            ports: ['22/SSH', '631/IPP', '9100/RAW'],          os: 'Debian 12 Bookworm' },
        'server-c':     { label: 'SERVER-CHARLIE',    abbr: 'SRC', ip: '10.100.1.12',  desc: 'Config server — Ansible control node',          ports: ['22/SSH', '443/HTTPS', '8080/AWX'],        os: 'CentOS Stream 9' },
        'server-d':     { label: 'SERVER-DELTA',      abbr: 'SRD', ip: '10.100.1.13',  desc: 'Repository server — Git/artifact storage',      ports: ['22/SSH', '8443/HTTPS', '5000/REGISTRY'],  os: 'Windows Server 2022' },
        'server-e':     { label: 'SERVER-ECHO',       abbr: 'SRE', ip: '10.100.1.14',  desc: 'Time server — Stratum 1 NTP source',            ports: ['22/SSH', '123/NTP'],                      os: 'RHEL 9.3' },

        /* THE target — name includes 'TARGET' for find() matching */
        'target':       { label: 'TARGET-PRIME',      abbr: 'TGT', ip: '10.100.1.50',  desc: 'Domain controller — Active Directory core',     ports: ['22/SSH', '88/KERBEROS', '389/LDAP'],      os: 'Windows Server 2022 DC' },

        /* 1 exploit gate — blocks the corridor to the target */
        'exploit-gate': { label: 'VULN-GATEWAY',      abbr: 'VGW', ip: '10.100.1.254', desc: 'Vulnerable appliance — exploit to pass',        ports: ['22/SSH', '443/MGMT'],                     os: 'SonicWall SonicOS 7.0', vuln: 'CVE-2024-7101', vulnDesc: 'Heap overflow in SSL-VPN module allows code execution' },

        /* 3 traps — blocking direct paths */
        'honeypot-a':   { label: 'HONEYPOT-EAST',     abbr: 'HPE', ip: '10.100.1.200', desc: 'Decoy — northeast corridor trap',               ports: ['22/SSH-FAKE', '80/HTTP-TRAP'],            os: 'Honeyd 1.6 [TRAP]' },
        'honeypot-b':   { label: 'HONEYPOT-WEST',     abbr: 'HPW', ip: '10.100.1.201', desc: 'Decoy — western descent ambush',                ports: ['22/SSH-FAKE', '445/SMB-FAKE'],            os: 'Honeyd 1.6 [TRAP]' },
        'honeypot-c':   { label: 'HONEYPOT-SOUTH',    abbr: 'HPS', ip: '10.100.1.202', desc: 'Decoy — southern approach guard',               ports: ['22/SSH-FAKE', '3389/RDP-FAKE'],           os: 'Honeyd 1.6 [TRAP]' }
    },

    /* 3 traps on direct traversal paths */
    traps: ['honeypot-a', 'honeypot-b', 'honeypot-c'],

    /* 1 gate requiring exploit — blocks the target zone */
    gates: {
        'exploit-gate': { requires: 'exploit', flag: 'gatewayExploited', vuln: 'CVE-2024-7101', vulnDesc: 'Heap overflow in SSL-VPN allows code execution' }
    },

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'FIND TARGET -- Locate the domain controller',        check: 'nodesDiscovered.has("target")' },
        { id: 'obj_1', label: 'EXPLOIT GATE -- Bypass the vulnerable appliance',    check: 'flags.has("gatewayExploited")' },
        { id: 'obj_2', label: 'DISCOVER 3+ SERVERS -- Map additional infrastructure', check: 'nodesDiscovered.size >= 5' },
        { id: 'obj_3', label: 'SURVIVE -- Complete with integrity remaining',        check: 'integrity >= 1' }
    ],

    /* 4 integrity pips — 3 traps, tight margin */
    integrity: 4,

    /* -- Completion screen -- */
    completion: {
        title: 'find',
        subtitle: 'Target located. One node from many — find() returns exactly what you need.',
        storageKey: 'hexworth_operator_js11'
    }
};
