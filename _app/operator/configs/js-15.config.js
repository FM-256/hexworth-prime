/* ================================================================
   JS-15 / Bracket Notation -- Mission Config
   ================================================================
   Tier 3 mission. 9x9 grid — 81 cells.
   Student uses bracket notation for dynamic property access — dispatch tables.

   DESIGN RATIONALE:
   - This is the JavaScript version of Python's dispatch table (dict[key](args))
   - Student builds a response map: { 'TRAP': sweep, 'SERVER': move, 'GATE': nmap }
   - Scan results contain node types — bracket notation selects the right handler
   - 5 servers + 4 traps + 2 gates — the highest trap count yet
   - Without bracket notation: long if/else chains for every node type
   - With bracket notation: responses[type](direction) — one line, any type
   - The traps punish students who move toward everything without checking

   JS SKILL: Bracket notation — dynamic property access and dispatch
   - obj['key'] is equivalent to obj.key
   - But obj[variable] lets you use a VARIABLE as the key — dot notation can't
   - This enables dispatch tables: look up the right function based on data
   - Teaches: dynamic access, dispatch pattern, data-driven code

   REFERENCE SOLUTION:
     // Build a dispatch table — response varies by node type
     const responses = {
         'TRAP': function(dir) { console.log('Avoided trap at ' + dir); },
         'HONEYPOT': function(dir) { console.log('Skipping honeypot at ' + dir); },
         'SERVER': function(dir) { agent.move(dir); },
         'FIREWALL': function(dir) { agent.nmap(dir); },
         'VULN': function(dir) { agent.exploit(dir); }
     };
     let results = agent.scan();
     results.forEach(function(node) {
         // Determine the type from the node name
         let type = node.name.includes('TRAP') ? 'TRAP'
                  : node.name.includes('HONEYPOT') ? 'HONEYPOT'
                  : node.name.includes('FIREWALL') ? 'FIREWALL'
                  : node.name.includes('VULN') ? 'VULN'
                  : 'SERVER';
         // Dispatch: bracket notation calls the right handler
         responses[type](node.direction);
     });

   WHY BRACKET NOTATION MATTERS:
   - Dot notation: obj.fixedName — key is hardcoded
   - Bracket notation: obj[variableName] — key comes from DATA
   - This is how config-driven code works: settings[userChoice]
   - Dispatch tables eliminate nested if/else for type-based branching
   - Same pattern as Python dict dispatch — portable concept

   GRID LAYOUT (9x9):
     [start]    [empty]    [empty]    [honeypot] [empty]    [server-a] [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [honeypot] [empty]    [empty]    [firewall] [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-b] [empty]    [empty]
     [empty]    [empty]    [empty]    [honeypot] [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [exploit]  [empty]    [empty]    [empty]
     [empty]    [empty]    [server-c] [empty]    [empty]    [empty]    [empty]    [honeypot] [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [server-d] [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-e] [empty]

   5 servers + 4 traps + 2 gates. Bracket notation dispatches the right action.
   ================================================================ */

var JS_15_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-15',
    title: 'JS-15 / Bracket Notation',
    subtitle: 'Dynamic dispatch. The node type picks the response — not your if/else.',
    category: 'javascript-ops',
    difficulty: 4,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 4 = scan, move, nmap, exploit, sweep) -- */
    agent: { tier: 4 },

    /* -- 9x9 Grid -- */
    grid: {
        rows: 9, cols: 9,
        cells: [
            /* Row 0 */ ['gateway',    'empty',      'empty',      'honeypot-a',  'empty',       'server-a',   'empty',      'empty',      'empty'],
            /* Row 1 */ ['empty',      'empty',      'empty',      'empty',       'empty',       'empty',      'empty',      'empty',      'empty'],
            /* Row 2 */ ['empty',      'honeypot-b', 'empty',      'empty',       'firewall',    'empty',      'empty',      'empty',      'empty'],
            /* Row 3 */ ['empty',      'empty',      'empty',      'empty',       'empty',       'empty',      'server-b',   'empty',      'empty'],
            /* Row 4 */ ['empty',      'empty',      'empty',      'honeypot-c',  'empty',       'empty',      'empty',      'empty',      'empty'],
            /* Row 5 */ ['empty',      'empty',      'empty',      'empty',       'empty',       'exploit-gate','empty',      'empty',      'empty'],
            /* Row 6 */ ['empty',      'empty',      'server-c',   'empty',       'empty',       'empty',      'empty',      'honeypot-d', 'empty'],
            /* Row 7 */ ['empty',      'empty',      'empty',      'empty',       'empty',       'server-d',   'empty',      'empty',      'empty'],
            /* Row 8 */ ['empty',      'empty',      'empty',      'empty',       'empty',       'empty',      'empty',      'server-e',   'empty']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':      { label: 'GATEWAY',           abbr: 'GTW', ip: '10.140.1.1',   desc: 'Edge gateway — your insertion point',             ports: ['22/SSH', '443/HTTPS'],                     os: 'Fortinet FortiGate 60F' },

        /* 5 target servers — cloud security infrastructure */
        'server-a':     { label: 'SERVER-ALPHA',       abbr: 'SRA', ip: '10.140.1.10',  desc: 'IAM server — identity and access management',     ports: ['22/SSH', '443/HTTPS', '8443/KEYCLOAK'],    os: 'Ubuntu 24.04 LTS' },
        'server-b':     { label: 'SERVER-BRAVO',       abbr: 'SRB', ip: '10.140.1.11',  desc: 'Secrets vault — credential storage engine',       ports: ['22/SSH', '8200/VAULT', '443/HTTPS'],       os: 'Debian 12 Bookworm' },
        'server-c':     { label: 'SERVER-CHARLIE',     abbr: 'SRC', ip: '10.140.1.12',  desc: 'Policy engine — OPA/Rego enforcement',            ports: ['22/SSH', '8181/OPA', '443/HTTPS'],         os: 'CentOS Stream 9' },
        'server-d':     { label: 'SERVER-DELTA',       abbr: 'SRD', ip: '10.140.1.13',  desc: 'Certificate manager — TLS lifecycle automation',  ports: ['22/SSH', '443/HTTPS', '8443/CERTMGR'],    os: 'Windows Server 2022' },
        'server-e':     { label: 'SERVER-ECHO',        abbr: 'SRE', ip: '10.140.1.14',  desc: 'Audit log server — compliance event archive',     ports: ['22/SSH', '9200/ELASTIC', '5601/KIBANA'],   os: 'RHEL 9.3' },

        /* 2 gates — one nmap, one exploit */
        'firewall':     { label: 'FIREWALL-ZONE',      abbr: 'FWZ', ip: '10.140.1.250', desc: 'Zone firewall — blocks north-south corridor',     ports: ['22/SSH', '443/MGMT'],                      os: 'Palo Alto PAN-OS 11', vuln: 'CVE-2024-7660', vulnDesc: 'Wildcard certificate leak in probe response' },
        'exploit-gate': { label: 'VULN-APPLIANCE',     abbr: 'VAP', ip: '10.140.1.251', desc: 'Vulnerable load balancer — exploit to pass',      ports: ['22/SSH', '443/HTTPS', '8080/MGMT'],        os: 'F5 BIG-IP 17.1', vuln: 'CVE-2024-7661', vulnDesc: 'iControl REST API authentication bypass' },

        /* 4 traps — highest count yet, punishes blind movement */
        'honeypot-a':   { label: 'HONEYPOT-NORTH',     abbr: 'HPN', ip: '10.140.1.200', desc: 'Decoy — northeast corridor lure',                 ports: ['22/SSH-FAKE', '80/HTTP-TRAP'],             os: 'Honeyd 1.6 [TRAP]' },
        'honeypot-b':   { label: 'HONEYPOT-WEST',      abbr: 'HPW', ip: '10.140.1.201', desc: 'Decoy — western grid trap',                       ports: ['22/SSH-FAKE', '445/SMB-FAKE'],             os: 'Honeyd 1.6 [TRAP]' },
        'honeypot-c':   { label: 'HONEYPOT-CENTER',    abbr: 'HPC', ip: '10.140.1.202', desc: 'Decoy — center grid ambush',                      ports: ['22/SSH-FAKE', '3306/MYSQL-FAKE'],          os: 'Honeyd 1.6 [TRAP]' },
        'honeypot-d':   { label: 'HONEYPOT-EAST',      abbr: 'HPE', ip: '10.140.1.203', desc: 'Decoy — lower eastern edge trap',                 ports: ['22/SSH-FAKE', '3389/RDP-FAKE'],            os: 'Honeyd 1.6 [TRAP]' }
    },

    /* 4 traps — dispatch table must handle all of them */
    traps: ['honeypot-a', 'honeypot-b', 'honeypot-c', 'honeypot-d'],

    /* 2 gates — nmap + exploit */
    gates: {
        'firewall':     { requires: 'nmap',    flag: 'firewallBypassed',    vuln: 'CVE-2024-7660', vulnDesc: 'Wildcard certificate leak in probe response' },
        'exploit-gate': { requires: 'exploit',  flag: 'applianceExploited',  vuln: 'CVE-2024-7661', vulnDesc: 'iControl REST API authentication bypass' }
    },

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER ALPHA -- Find the IAM server',                check: 'nodesDiscovered.has("server-a")' },
        { id: 'obj_1', label: 'DISCOVER BRAVO -- Find the secrets vault',              check: 'nodesDiscovered.has("server-b")' },
        { id: 'obj_2', label: 'DISCOVER CHARLIE -- Find the policy engine',            check: 'nodesDiscovered.has("server-c")' },
        { id: 'obj_3', label: 'DISCOVER DELTA -- Find the certificate manager',        check: 'nodesDiscovered.has("server-d")' },
        { id: 'obj_4', label: 'DISCOVER ECHO -- Find the audit log server',            check: 'nodesDiscovered.has("server-e")' },
        { id: 'obj_5', label: 'ZERO DAMAGE -- Complete without hitting any traps',     check: 'integrity >= 5' }
    ],

    /* 5 integrity pips — 4 traps, so hitting even 1 fails the bonus */
    integrity: 5,

    /* -- Completion screen -- */
    completion: {
        title: 'Bracket Notation',
        subtitle: 'Five servers found. Dispatch table handled every node type dynamically.',
        storageKey: 'hexworth_operator_js15'
    }
};
