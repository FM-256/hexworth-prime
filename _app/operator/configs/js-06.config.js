/* ================================================================
   JS-06 / FUNCTIONS -- Mission Config
   ================================================================
   Tier 1 mission. 7x7 grid — 49 cells.
   Forces students to write reusable functions.

   DESIGN RATIONALE:
   - 7x7 grid requires ~15+ scan-move sequences to traverse
   - 5 servers scattered across the grid + 2 traps + 1 gate
   - The scan-then-move pattern repeats identically every time
   - Writing it inline = 40+ lines of repetitive code
   - A function safeMove(dir) encapsulates the pattern in 4 lines
   - Gate requiring nmap adds a second reusable pattern: scanAndNmap()
   - Objective requires 6+ unique cells scanned — forces systematic sweep

   JS SKILL: function keyword, reusable code blocks
   - function name(params) { ... }
   - Encapsulates a pattern that repeats
   - Call it by name: safeMove('east');
   - DRY principle: Don't Repeat Yourself

   REFERENCE SOLUTION:
     // Reusable safe movement function
     function safeMove(dir) {
         agent.scan();
         agent.move(dir);
     }

     // Navigate to servers using the function
     safeMove('east');
     safeMove('east');
     safeMove('south');
     safeMove('south');
     agent.nmap('firewall');  // clear the gate
     safeMove('east');
     safeMove('south');
     safeMove('south');

   WHY FUNCTIONS MATTER:
   - Without a function: agent.scan(); agent.move('east'); x15 = 30 lines
   - With a function: safeMove('east'); x15 = 15 lines + 4-line definition
   - Code is shorter, more readable, and easier to modify
   - If the scan-check logic changes, update ONE function, not 15 places
   - This is the DRY principle in action

   GRID LAYOUT (7x7):
     [start]    [empty]    [empty]    [server-a] [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [honeypot] [empty]
     [empty]    [empty]    [firewall] [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [server-b] [empty]    [empty]    [empty]
     [empty]    [server-c] [empty]    [empty]    [empty]    [empty]    [honeypot]
     [empty]    [empty]    [empty]    [empty]    [server-d] [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [server-e] [empty]

   5 servers + 2 traps + 1 firewall gate. Repetitive navigation required.
   ================================================================ */

var JS_06_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-06',
    title: 'JS-06 / FUNCTIONS',
    subtitle: 'Write once. Call many. Functions eliminate repetition.',
    category: 'javascript-ops',
    difficulty: 2,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 2 = scan, move, nmap) -- */
    agent: { tier: 2 },

    /* -- 7x7 Grid -- */
    grid: {
        rows: 7, cols: 7,
        cells: [
            /* Row 0 */ ['gateway',  'empty',    'empty',    'server-a', 'empty',      'empty',      'empty'],
            /* Row 1 */ ['empty',    'empty',    'empty',    'empty',    'empty',      'honeypot-a', 'empty'],
            /* Row 2 */ ['empty',    'empty',    'firewall', 'empty',    'empty',      'empty',      'empty'],
            /* Row 3 */ ['empty',    'empty',    'empty',    'server-b', 'empty',      'empty',      'empty'],
            /* Row 4 */ ['empty',    'server-c', 'empty',    'empty',    'empty',      'empty',      'honeypot-b'],
            /* Row 5 */ ['empty',    'empty',    'empty',    'empty',    'server-d',   'empty',      'empty'],
            /* Row 6 */ ['empty',    'empty',    'empty',    'empty',    'empty',      'server-e',   'empty']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':    { label: 'GATEWAY',       abbr: 'GTW', ip: '10.50.1.1',   desc: 'Edge gateway — your insertion point',           ports: ['22/SSH', '443/HTTPS'],                    os: 'Cisco IOS 15.4' },

        /* 5 target servers — scattered to force repeated navigation */
        'server-a':   { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.50.1.10',  desc: 'RADIUS server — 802.1X authentication',        ports: ['22/SSH', '1812/RADIUS', '1813/ACCT'],     os: 'Ubuntu 24.04 LTS' },
        'server-b':   { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.50.1.11',  desc: 'Ticketing server — incident management',       ports: ['22/SSH', '80/HTTP', '443/HTTPS'],         os: 'Debian 12 Bookworm' },
        'server-c':   { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.50.1.12',  desc: 'Asset management server — CMDB inventory',     ports: ['22/SSH', '3306/MySQL', '8080/HTTP'],      os: 'CentOS Stream 9' },
        'server-d':   { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.50.1.13',  desc: 'Patch server — WSUS distribution point',       ports: ['22/SSH', '8530/WSUS', '8531/WSUS-SSL'],   os: 'Windows Server 2022' },
        'server-e':   { label: 'SERVER-ECHO',    abbr: 'SRE', ip: '10.50.1.14',  desc: 'Certificate authority — PKI root CA',          ports: ['22/SSH', '443/HTTPS', '8443/SCEP'],       os: 'RHEL 9.3' },

        /* 1 firewall gate — requires nmap to bypass */
        'firewall':   { label: 'FIREWALL',       abbr: 'FWL', ip: '10.50.1.254', desc: 'Zone firewall — blocks south corridor',        ports: ['22/SSH', '443/MGMT'],                     os: 'pfSense 2.7.0', vuln: 'CVE-2024-4102', vulnDesc: 'ACL misconfiguration allows bypass via nmap probe' },

        /* 2 traps */
        'honeypot-a': { label: 'HONEYPOT-EAST',  abbr: 'HPE', ip: '10.50.1.200', desc: 'Decoy — guards the northeast approach',        ports: ['22/SSH-FAKE', '80/HTTP-TRAP'],            os: 'Honeyd 1.6 [TRAP]' },
        'honeypot-b': { label: 'HONEYPOT-FAR',   abbr: 'HPF', ip: '10.50.1.201', desc: 'Decoy — guards the eastern edge',              ports: ['22/SSH-FAKE', '3389/RDP-FAKE'],           os: 'Honeyd 1.6 [TRAP]' }
    },

    /* 2 traps scattered on edges */
    traps: ['honeypot-a', 'honeypot-b'],

    /* 1 gate — requires nmap to clear */
    gates: {
        'firewall': { requires: 'nmap', flag: 'firewallBypassed', vuln: 'CVE-2024-4102', vulnDesc: 'ACL misconfiguration allows bypass' }
    },

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER ALPHA -- Find the RADIUS server',         check: 'nodesDiscovered.has("server-a")' },
        { id: 'obj_1', label: 'DISCOVER BRAVO -- Find the ticketing server',       check: 'nodesDiscovered.has("server-b")' },
        { id: 'obj_2', label: 'DISCOVER CHARLIE -- Find the asset server',         check: 'nodesDiscovered.has("server-c")' },
        { id: 'obj_3', label: 'DISCOVER DELTA -- Find the patch server',           check: 'nodesDiscovered.has("server-d")' },
        { id: 'obj_4', label: 'DISCOVER ECHO -- Find the certificate authority',   check: 'nodesDiscovered.has("server-e")' },
        { id: 'obj_5', label: 'RECON -- Scan at least 6 unique cells',            check: 'nodesDiscovered.size >= 6' }
    ],

    /* 3 integrity pips — 2 traps + gate, gives 1 mistake margin */
    integrity: 3,

    /* -- Completion screen -- */
    completion: {
        title: 'FUNCTIONS',
        subtitle: 'Five servers mapped. Functions made the grid manageable.',
        storageKey: 'hexworth_operator_js06'
    }
};
