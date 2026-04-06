/* ================================================================
   JS-07 / STRING METHODS -- Mission Config
   ================================================================
   Tier 1 mission. 7x7 grid — 49 cells.
   Forces students to use .includes(), .indexOf(), string matching.

   DESIGN RATIONALE:
   - Scan results contain node names like 'SERVER-ALPHA' and 'HONEYPOT-EAST'
   - Student must distinguish servers from traps by checking the NAME string
   - .includes('SERVER') identifies targets; .includes('HONEYPOT') identifies traps
   - 5 servers mixed with 3 traps — wrong move costs integrity
   - 1 gate requiring nmap adds tool usage on top of string logic
   - Bonus objective: zero damage (avoid ALL traps) rewards precise string checks

   JS SKILL: .includes(), .indexOf(), string matching
   - 'SERVER-ALPHA'.includes('SERVER')  → true
   - 'HONEYPOT-EAST'.includes('SERVER') → false
   - .indexOf('TRAP') !== -1             → trap detected
   - String methods return booleans or indices for decision-making

   REFERENCE SOLUTION:
     let results = agent.scan();
     for (let i = 0; i < results.length; i++) {
         if (results[i].name.includes('SERVER')) {
             // Safe to approach — it's a real server
             agent.move(results[i].direction);
         } else if (results[i].name.includes('HONEYPOT') || results[i].name.includes('IDS')) {
             // Trap detected — do NOT move toward it
             console.log('Trap avoided: ' + results[i].name);
         }
     }
     // Repeat pattern across the grid

   WHY STRING METHODS MATTER:
   - Real-world data is messy — names, labels, log entries are strings
   - Filtering by substring is one of the most common operations
   - .includes() is cleaner than .indexOf() !== -1 but both work
   - This mission makes the connection: scan data = strings, strings have methods

   NODE NAMING CONVENTION (intentionally mixed):
   - Servers: 'SERVER-ALPHA', 'SERVER-BRAVO', etc.
   - Traps:   'HONEYPOT-EAST', 'HONEYPOT-CENTER', 'IDS-TRAP-SOUTH'
   - Gate:    'FIREWALL-NORTH' (requires nmap)
   - Student must parse these names to make smart movement decisions

   GRID LAYOUT (7x7):
     [start]    [empty]    [server-a] [empty]    [honeypot] [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [server-b] [empty]
     [empty]    [empty]    [empty]    [honeypot] [empty]    [empty]    [empty]
     [empty]    [firewall] [empty]    [empty]    [empty]    [empty]    [server-c]
     [empty]    [empty]    [empty]    [empty]    [ids-trap] [empty]    [empty]
     [empty]    [empty]    [server-d] [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [server-e] [empty]    [empty]

   5 servers + 3 traps + 1 nmap gate. String parsing is key to survival.
   ================================================================ */

var JS_07_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-07',
    title: 'JS-07 / STRING METHODS',
    subtitle: 'Read the names. Parse the strings. Separate targets from traps.',
    category: 'javascript-ops',
    difficulty: 3,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 2 = scan, move, nmap) -- */
    agent: { tier: 2 },

    /* -- 7x7 Grid -- */
    grid: {
        rows: 7, cols: 7,
        cells: [
            /* Row 0 */ ['gateway',    'empty',    'server-a',   'empty',       'honeypot-a', 'empty',    'empty'],
            /* Row 1 */ ['empty',      'empty',    'empty',      'empty',       'empty',      'server-b', 'empty'],
            /* Row 2 */ ['empty',      'empty',    'empty',      'honeypot-b',  'empty',      'empty',    'empty'],
            /* Row 3 */ ['empty',      'firewall', 'empty',      'empty',       'empty',      'empty',    'server-c'],
            /* Row 4 */ ['empty',      'empty',    'empty',      'empty',       'ids-trap',   'empty',    'empty'],
            /* Row 5 */ ['empty',      'empty',    'server-d',   'empty',       'empty',      'empty',    'empty'],
            /* Row 6 */ ['empty',      'empty',    'empty',      'empty',       'server-e',   'empty',    'empty']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':    { label: 'GATEWAY',          abbr: 'GTW', ip: '10.60.1.1',   desc: 'Edge gateway — your insertion point',          ports: ['22/SSH', '443/HTTPS'],                     os: 'Cisco IOS 15.4' },

        /* 5 target servers — names all contain 'SERVER' for string matching */
        'server-a':   { label: 'SERVER-ALPHA',      abbr: 'SRA', ip: '10.60.1.10',  desc: 'SIEM server — security event correlation',     ports: ['22/SSH', '9200/ELASTIC', '5601/KIBANA'],   os: 'Ubuntu 24.04 LTS' },
        'server-b':   { label: 'SERVER-BRAVO',      abbr: 'SRB', ip: '10.60.1.11',  desc: 'Vulnerability scanner — scheduled scans',      ports: ['22/SSH', '8834/NESSUS', '443/HTTPS'],      os: 'Debian 12 Bookworm' },
        'server-c':   { label: 'SERVER-CHARLIE',    abbr: 'SRC', ip: '10.60.1.12',  desc: 'Threat intel server — IOC feed aggregator',    ports: ['22/SSH', '443/HTTPS', '9090/MISP'],        os: 'CentOS Stream 9' },
        'server-d':   { label: 'SERVER-DELTA',      abbr: 'SRD', ip: '10.60.1.13',  desc: 'Forensics workstation — disk imaging depot',   ports: ['22/SSH', '443/HTTPS', '8080/HTTP'],        os: 'Windows Server 2022' },
        'server-e':   { label: 'SERVER-ECHO',       abbr: 'SRE', ip: '10.60.1.14',  desc: 'Sandbox server — malware detonation chamber',  ports: ['22/SSH', '8443/HTTPS', '5000/API'],        os: 'RHEL 9.3' },

        /* 1 firewall gate — requires nmap to open */
        'firewall':   { label: 'FIREWALL-NORTH',    abbr: 'FWN', ip: '10.60.1.254', desc: 'Zone firewall — blocks the south corridor',    ports: ['22/SSH', '443/MGMT'],                      os: 'Palo Alto PAN-OS 11', vuln: 'CVE-2024-5510', vulnDesc: 'Management plane probe reveals bypass path' },

        /* 3 traps — names contain 'HONEYPOT' or 'IDS' for string matching */
        'honeypot-a': { label: 'HONEYPOT-EAST',     abbr: 'HPE', ip: '10.60.1.200', desc: 'Decoy server — northeast corridor trap',       ports: ['22/SSH-FAKE', '80/HTTP-TRAP'],             os: 'Honeyd 1.6 [TRAP]' },
        'honeypot-b': { label: 'HONEYPOT-CENTER',   abbr: 'HPC', ip: '10.60.1.201', desc: 'Decoy server — center grid ambush point',      ports: ['22/SSH-FAKE', '445/SMB-FAKE'],             os: 'Honeyd 1.6 [TRAP]' },
        'ids-trap':   { label: 'IDS-TRAP-SOUTH',    abbr: 'IDS', ip: '10.60.1.202', desc: 'Intrusion detection sensor — triggers alarm',  ports: ['514/SYSLOG', '443/MGMT'],                  os: 'Snort 3.1 [TRAP]' }
    },

    /* 3 traps with distinctive name patterns for string matching */
    traps: ['honeypot-a', 'honeypot-b', 'ids-trap'],

    /* 1 gate — requires nmap to clear */
    gates: {
        'firewall': { requires: 'nmap', flag: 'firewallBypassed', vuln: 'CVE-2024-5510', vulnDesc: 'Management plane probe reveals bypass' }
    },

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER ALPHA -- Find the SIEM server',            check: 'nodesDiscovered.has("server-a")' },
        { id: 'obj_1', label: 'DISCOVER BRAVO -- Find the vuln scanner',            check: 'nodesDiscovered.has("server-b")' },
        { id: 'obj_2', label: 'DISCOVER CHARLIE -- Find the threat intel server',   check: 'nodesDiscovered.has("server-c")' },
        { id: 'obj_3', label: 'DISCOVER DELTA -- Find the forensics workstation',   check: 'nodesDiscovered.has("server-d")' },
        { id: 'obj_4', label: 'DISCOVER ECHO -- Find the sandbox server',           check: 'nodesDiscovered.has("server-e")' },
        { id: 'obj_5', label: 'ZERO DAMAGE -- Complete without hitting any traps',  check: 'integrity >= 4' }
    ],

    /* 4 integrity pips — bonus objective requires keeping all 4 */
    integrity: 4,

    /* -- Completion screen -- */
    completion: {
        title: 'STRING METHODS',
        subtitle: 'Five servers found. Strings parsed. Traps identified by name.',
        storageKey: 'hexworth_operator_js07'
    }
};
