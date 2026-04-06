/* ================================================================
   JS-13 / Chaining -- Mission Config
   ================================================================
   Tier 2 capstone. 9x9 grid — 81 cells.
   Student chains .filter().map().forEach() in a single pipeline.

   DESIGN RATIONALE:
   - This is the Tier 2 capstone — everything from JS-08 through JS-12 combined
   - 9x9 grid is the largest yet — 81 cells, many nodes, lots of noise
   - 6 servers + 3 traps + 2 gates — the most complex Tier 2 layout
   - A single chained expression processes the entire scan in one pipeline
   - Without chaining: 10+ lines of temp variables and separate loops
   - With chaining: filter → map → forEach in 3 lines
   - This is the functional programming epiphany moment

   JS SKILL: Method chaining — .filter().map().forEach()
   - results.filter(n => ...).map(n => ...).forEach(n => ...)
   - Each method returns a new array, allowing the next method to chain
   - filter: which elements to keep
   - map: what to extract from each
   - forEach: what to DO with each
   - Teaches: pipeline composition, data flow, functional chains

   REFERENCE SOLUTION:
     let results = agent.scan();
     // One chained pipeline: filter threats, extract directions, execute moves
     results
         .filter(n => !n.name.includes('TRAP') && !n.name.includes('HONEYPOT'))
         .filter(n => n.name.includes('SERVER'))
         .map(n => n.direction)
         .forEach(d => agent.move(d));
     // Repeat across the grid. Use nmap/exploit to clear gates.

   WHY CHAINING IS POWERFUL:
   - Each step does ONE thing — single responsibility
   - Data flows left to right like a Unix pipeline: grep | awk | sort
   - Intermediate arrays exist briefly — no temp variable clutter
   - Readable: "from scan results, keep servers, get directions, move"
   - This pattern appears everywhere: jQuery, D3, lodash, React hooks

   GRID LAYOUT (9x9):
     [start]    [empty]    [empty]    [server-a] [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [honeypot] [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [firewall] [empty]    [server-b] [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [honeypot] [empty]    [empty]    [empty]    [empty]    [empty]    [server-c] [empty]
     [empty]    [empty]    [empty]    [empty]    [exploit]  [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [server-d] [empty]    [empty]    [honeypot] [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [server-e] [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-f] [empty]

   6 servers + 3 traps + 2 gates. Tier 2 capstone — chain everything.
   ================================================================ */

var JS_13_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-13',
    title: 'JS-13 / Chaining',
    subtitle: 'Filter. Map. Execute. One pipeline processes the entire scan.',
    category: 'javascript-ops',
    difficulty: 3,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 3 = scan, move, nmap, exploit) -- */
    agent: { tier: 3 },

    /* -- 9x9 Grid -- */
    grid: {
        rows: 9, cols: 9,
        cells: [
            /* Row 0 */ ['gateway',    'empty',      'empty',      'server-a',    'empty',       'empty',      'empty',      'empty',      'empty'],
            /* Row 1 */ ['empty',      'empty',      'honeypot-a', 'empty',       'empty',       'empty',      'empty',      'empty',      'empty'],
            /* Row 2 */ ['empty',      'empty',      'empty',      'empty',       'firewall',    'empty',      'server-b',   'empty',      'empty'],
            /* Row 3 */ ['empty',      'empty',      'empty',      'empty',       'empty',       'empty',      'empty',      'empty',      'empty'],
            /* Row 4 */ ['empty',      'honeypot-b', 'empty',      'empty',       'empty',       'empty',      'empty',      'server-c',   'empty'],
            /* Row 5 */ ['empty',      'empty',      'empty',      'empty',       'exploit-gate','empty',      'empty',      'empty',      'empty'],
            /* Row 6 */ ['empty',      'empty',      'empty',      'server-d',    'empty',       'empty',      'honeypot-c', 'empty',      'empty'],
            /* Row 7 */ ['empty',      'empty',      'empty',      'empty',       'empty',       'server-e',   'empty',      'empty',      'empty'],
            /* Row 8 */ ['empty',      'empty',      'empty',      'empty',       'empty',       'empty',      'empty',      'server-f',   'empty']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':      { label: 'GATEWAY',          abbr: 'GTW', ip: '10.120.1.1',   desc: 'Edge gateway — your insertion point',             ports: ['22/SSH', '443/HTTPS'],                     os: 'Cisco Firepower 2130' },

        /* 6 target servers — corporate security operations center */
        'server-a':     { label: 'SERVER-ALPHA',      abbr: 'SRA', ip: '10.120.1.10',  desc: 'SIEM ingestion node — raw log intake',            ports: ['22/SSH', '514/SYSLOG', '5044/BEATS'],      os: 'Ubuntu 24.04 LTS' },
        'server-b':     { label: 'SERVER-BRAVO',      abbr: 'SRB', ip: '10.120.1.11',  desc: 'Correlation engine — rule processing cluster',    ports: ['22/SSH', '9200/ELASTIC', '9300/CLUSTER'],  os: 'Debian 12 Bookworm' },
        'server-c':     { label: 'SERVER-CHARLIE',    abbr: 'SRC', ip: '10.120.1.12',  desc: 'Enrichment server — GeoIP and ASN lookup',        ports: ['22/SSH', '443/HTTPS', '8080/API'],         os: 'CentOS Stream 9' },
        'server-d':     { label: 'SERVER-DELTA',      abbr: 'SRD', ip: '10.120.1.13',  desc: 'Case management — SOC ticket tracking',           ports: ['22/SSH', '443/HTTPS', '3000/THEHIVE'],     os: 'Windows Server 2022' },
        'server-e':     { label: 'SERVER-ECHO',       abbr: 'SRE', ip: '10.120.1.14',  desc: 'Visualization server — Kibana dashboards',        ports: ['22/SSH', '5601/KIBANA', '443/HTTPS'],      os: 'RHEL 9.3' },
        'server-f':     { label: 'SERVER-FOXTROT',    abbr: 'SRF', ip: '10.120.1.15',  desc: 'Automation engine — SOAR playbook runner',        ports: ['22/SSH', '443/HTTPS', '9000/CORTEX'],      os: 'Rocky Linux 9.3' },

        /* 2 gates — one nmap, one exploit */
        'firewall':     { label: 'FIREWALL-UPPER',    abbr: 'FWU', ip: '10.120.1.250', desc: 'Zone firewall — nmap to reveal bypass',           ports: ['22/SSH', '443/MGMT'],                      os: 'pfSense 2.7.0', vuln: 'CVE-2024-7440', vulnDesc: 'Filter rule misconfiguration allows probe bypass' },
        'exploit-gate': { label: 'VULN-JUNCTION',     abbr: 'VJN', ip: '10.120.1.251', desc: 'Vulnerable switch — exploit to cross zones',      ports: ['22/SSH', '161/SNMP'],                      os: 'Aruba CX 6300', vuln: 'CVE-2024-7441', vulnDesc: 'SNMP community string allows config overwrite' },

        /* 3 traps — blocking direct diagonal paths */
        'honeypot-a':   { label: 'HONEYPOT-UPPER',    abbr: 'HPU', ip: '10.120.1.200', desc: 'Decoy — upper grid corridor trap',                ports: ['22/SSH-FAKE', '80/HTTP-TRAP'],             os: 'Honeyd 1.6 [TRAP]' },
        'honeypot-b':   { label: 'HONEYPOT-MID',      abbr: 'HPM', ip: '10.120.1.201', desc: 'Decoy — mid-grid western trap',                   ports: ['22/SSH-FAKE', '445/SMB-FAKE'],             os: 'Honeyd 1.6 [TRAP]' },
        'honeypot-c':   { label: 'HONEYPOT-LOWER',    abbr: 'HPL', ip: '10.120.1.202', desc: 'Decoy — lower grid eastern trap',                 ports: ['22/SSH-FAKE', '3389/RDP-FAKE'],            os: 'Honeyd 1.6 [TRAP]' }
    },

    /* 3 traps on common traversal paths */
    traps: ['honeypot-a', 'honeypot-b', 'honeypot-c'],

    /* 2 gates — nmap and exploit */
    gates: {
        'firewall':     { requires: 'nmap',    flag: 'firewallBypassed',  vuln: 'CVE-2024-7440', vulnDesc: 'Filter rule misconfiguration allows probe bypass' },
        'exploit-gate': { requires: 'exploit',  flag: 'junctionExploited', vuln: 'CVE-2024-7441', vulnDesc: 'SNMP community string allows config overwrite' }
    },

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER ALPHA -- Find the SIEM ingestion node',      check: 'nodesDiscovered.has("server-a")' },
        { id: 'obj_1', label: 'DISCOVER BRAVO -- Find the correlation engine',        check: 'nodesDiscovered.has("server-b")' },
        { id: 'obj_2', label: 'DISCOVER CHARLIE -- Find the enrichment server',       check: 'nodesDiscovered.has("server-c")' },
        { id: 'obj_3', label: 'DISCOVER DELTA -- Find the case management server',    check: 'nodesDiscovered.has("server-d")' },
        { id: 'obj_4', label: 'DISCOVER ECHO -- Find the visualization server',       check: 'nodesDiscovered.has("server-e")' },
        { id: 'obj_5', label: 'DISCOVER FOXTROT -- Find the automation engine',       check: 'nodesDiscovered.has("server-f")' },
        { id: 'obj_6', label: 'FULL CHAIN -- Discover all 6 servers in one session',  check: 'nodesDiscovered.size >= 8' }
    ],

    /* 5 integrity pips — 3 traps + 2 gates, gives some margin */
    integrity: 5,

    /* -- Completion screen -- */
    completion: {
        title: 'Chaining',
        subtitle: 'Six servers. Three methods. One pipeline. Tier 2 complete.',
        storageKey: 'hexworth_operator_js13'
    }
};
