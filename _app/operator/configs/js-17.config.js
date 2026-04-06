/* ================================================================
   JS-17 / Destructuring -- Mission Config
   ================================================================
   Tier 3 mission. 10x10 grid — 100 cells.
   Student uses destructuring to extract properties from scan result objects.

   DESIGN RATIONALE:
   - Scan results are objects with many properties: name, direction, ip, ports, desc
   - Without destructuring: node.name, node.direction, node.ports — verbose, repetitive
   - With destructuring: const { name, direction, ports } = node — one line, done
   - 10x10 grid with 6 servers, 4 traps, 2 gates — complex environment
   - The complexity FORCES clean code — messy property access buries the logic
   - Destructuring is the Tier 3 capstone — clean code under pressure

   JS SKILL: Destructuring — extract multiple properties at once
   - const { name, direction, ports } = node
   - Creates local variables from object properties in one declaration
   - Works in for...of loops: for (let { name, direction } of results) { ... }
   - Teaches: property extraction, clean variable binding, modern syntax

   REFERENCE SOLUTION:
     let results = agent.scan();
     for (let node of results) {
         // Destructure each node into clean local variables
         const { name, direction, ip, ports } = node;
         if (name.includes('SERVER')) {
             console.log(`[${ip}] ${name} — ports: ${ports.join(', ')}`);
             agent.move(direction);
         } else if (name.includes('TRAP') || name.includes('HONEYPOT')) {
             console.log(`Avoided ${name} at ${direction}`);
         }
     }

   WHY DESTRUCTURING MATTERS:
   - Reduces node.name, node.direction, node.ip to just name, direction, ip
   - Code reads like English: "extract name and direction from node"
   - Works with arrays too: const [first, second] = array
   - Used everywhere in React (props), Node.js (require), API responses
   - Without it, deeply nested access: response.data.results[0].name — painful

   GRID LAYOUT (10x10):
     [start]    [empty]    [empty]    [empty]    [server-a] [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [honeypot] [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [firewall] [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [honeypot] [empty]    [empty]    [empty]    [empty]    [server-b] [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [honeypot] [empty]    [empty]    [empty]    [server-c] [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [exploit]  [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [server-d] [empty]    [empty]    [empty]    [empty]    [empty]    [honeypot] [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [server-e] [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-f] [empty]    [empty]

   6 servers + 4 traps + 2 gates. Destructuring keeps the code clean under pressure.
   ================================================================ */

var JS_17_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-17',
    title: 'JS-17 / Destructuring',
    subtitle: 'Extract what matters. One line pulls every property you need.',
    category: 'javascript-ops',
    difficulty: 4,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 4 = scan, move, nmap, exploit, sweep) -- */
    agent: { tier: 4 },

    /* -- 10x10 Grid -- */
    grid: {
        rows: 10, cols: 10,
        cells: [
            /* Row 0 */ ['gateway',    'empty',      'empty',      'empty',       'server-a',    'empty',      'empty',      'empty',      'empty',      'empty'],
            /* Row 1 */ ['empty',      'empty',      'honeypot-a', 'empty',       'empty',       'empty',      'empty',      'empty',      'empty',      'empty'],
            /* Row 2 */ ['empty',      'empty',      'empty',      'empty',       'firewall',    'empty',      'empty',      'empty',      'empty',      'empty'],
            /* Row 3 */ ['empty',      'honeypot-b', 'empty',      'empty',       'empty',       'empty',      'server-b',   'empty',      'empty',      'empty'],
            /* Row 4 */ ['empty',      'empty',      'empty',      'empty',       'empty',       'empty',      'empty',      'empty',      'empty',      'empty'],
            /* Row 5 */ ['empty',      'empty',      'empty',      'honeypot-c',  'empty',       'empty',      'empty',      'server-c',   'empty',      'empty'],
            /* Row 6 */ ['empty',      'empty',      'empty',      'empty',       'empty',       'exploit-gate','empty',      'empty',      'empty',      'empty'],
            /* Row 7 */ ['empty',      'empty',      'server-d',   'empty',       'empty',       'empty',      'empty',      'empty',      'honeypot-d', 'empty'],
            /* Row 8 */ ['empty',      'empty',      'empty',      'empty',       'empty',       'server-e',   'empty',      'empty',      'empty',      'empty'],
            /* Row 9 */ ['empty',      'empty',      'empty',      'empty',       'empty',       'empty',      'empty',      'server-f',   'empty',      'empty']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':      { label: 'GATEWAY',           abbr: 'GTW', ip: '10.160.1.1',   desc: 'Edge gateway — your insertion point',               ports: ['22/SSH', '443/HTTPS'],                       os: 'Cisco ASA 5525-X' },

        /* 6 target servers — zero trust architecture infrastructure */
        'server-a':     { label: 'SERVER-ALPHA',       abbr: 'SRA', ip: '10.160.1.10',  desc: 'Identity provider — SAML/OIDC federation hub',      ports: ['22/SSH', '443/HTTPS', '8443/IDP'],           os: 'Ubuntu 24.04 LTS' },
        'server-b':     { label: 'SERVER-BRAVO',       abbr: 'SRB', ip: '10.160.1.11',  desc: 'Policy decision point — access control engine',     ports: ['22/SSH', '443/HTTPS', '8181/OPA'],           os: 'Debian 12 Bookworm' },
        'server-c':     { label: 'SERVER-CHARLIE',     abbr: 'SRC', ip: '10.160.1.12',  desc: 'Device trust server — endpoint compliance check',   ports: ['22/SSH', '443/HTTPS', '8443/MDM'],           os: 'CentOS Stream 9' },
        'server-d':     { label: 'SERVER-DELTA',       abbr: 'SRD', ip: '10.160.1.13',  desc: 'Micro-segmentation controller — east-west policy',  ports: ['22/SSH', '443/HTTPS', '6443/K8S-API'],       os: 'Windows Server 2022' },
        'server-e':     { label: 'SERVER-ECHO',        abbr: 'SRE', ip: '10.160.1.14',  desc: 'Session broker — just-in-time access grants',       ports: ['22/SSH', '443/HTTPS', '8200/VAULT'],         os: 'RHEL 9.3' },
        'server-f':     { label: 'SERVER-FOXTROT',     abbr: 'SRF', ip: '10.160.1.15',  desc: 'Telemetry collector — continuous verification',      ports: ['22/SSH', '4317/OTLP', '9090/PROMETHEUS'],    os: 'Rocky Linux 9.3' },

        /* 2 gates — nmap + exploit */
        'firewall':     { label: 'FIREWALL-TRUST',     abbr: 'FWT', ip: '10.160.1.250', desc: 'Trust boundary — nmap to identify bypass',          ports: ['22/SSH', '443/MGMT'],                        os: 'Zscaler ZPA Connector', vuln: 'CVE-2024-7880', vulnDesc: 'Connector service probe reveals trust token' },
        'exploit-gate': { label: 'VULN-PROXY',         abbr: 'VPX', ip: '10.160.1.251', desc: 'Vulnerable reverse proxy — exploit to traverse',    ports: ['22/SSH', '443/HTTPS', '8080/PROXY'],         os: 'HAProxy 2.9', vuln: 'CVE-2024-7881', vulnDesc: 'HTTP request smuggling via malformed Transfer-Encoding' },

        /* 4 traps — dense coverage forces precise destructuring-driven decisions */
        'honeypot-a':   { label: 'HONEYPOT-UPPER',     abbr: 'HPU', ip: '10.160.1.200', desc: 'Decoy — upper corridor lure',                       ports: ['22/SSH-FAKE', '80/HTTP-TRAP'],               os: 'Honeyd 1.6 [TRAP]' },
        'honeypot-b':   { label: 'HONEYPOT-WEST',      abbr: 'HPW', ip: '10.160.1.201', desc: 'Decoy — western grid ambush',                       ports: ['22/SSH-FAKE', '445/SMB-FAKE'],               os: 'Honeyd 1.6 [TRAP]' },
        'honeypot-c':   { label: 'HONEYPOT-CENTER',    abbr: 'HPC', ip: '10.160.1.202', desc: 'Decoy — center grid misdirection',                  ports: ['22/SSH-FAKE', '3306/MYSQL-FAKE'],            os: 'Honeyd 1.6 [TRAP]' },
        'honeypot-d':   { label: 'HONEYPOT-EAST',      abbr: 'HPE', ip: '10.160.1.203', desc: 'Decoy — eastern edge guard',                        ports: ['22/SSH-FAKE', '3389/RDP-FAKE'],              os: 'Honeyd 1.6 [TRAP]' }
    },

    /* 4 traps — requires clean code to navigate safely */
    traps: ['honeypot-a', 'honeypot-b', 'honeypot-c', 'honeypot-d'],

    /* 2 gates — nmap + exploit */
    gates: {
        'firewall':     { requires: 'nmap',    flag: 'trustBoundaryBypassed', vuln: 'CVE-2024-7880', vulnDesc: 'Connector service probe reveals trust token' },
        'exploit-gate': { requires: 'exploit',  flag: 'proxyExploited',        vuln: 'CVE-2024-7881', vulnDesc: 'HTTP request smuggling via malformed Transfer-Encoding' }
    },

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER ALPHA -- Find the identity provider',          check: 'nodesDiscovered.has("server-a")' },
        { id: 'obj_1', label: 'DISCOVER BRAVO -- Find the policy decision point',      check: 'nodesDiscovered.has("server-b")' },
        { id: 'obj_2', label: 'DISCOVER CHARLIE -- Find the device trust server',      check: 'nodesDiscovered.has("server-c")' },
        { id: 'obj_3', label: 'DISCOVER DELTA -- Find the segmentation controller',    check: 'nodesDiscovered.has("server-d")' },
        { id: 'obj_4', label: 'DISCOVER ECHO -- Find the session broker',              check: 'nodesDiscovered.has("server-e")' },
        { id: 'obj_5', label: 'DISCOVER FOXTROT -- Find the telemetry collector',      check: 'nodesDiscovered.has("server-f")' },
        { id: 'obj_6', label: 'ZERO DAMAGE -- Complete without hitting any traps',     check: 'integrity >= 6' }
    ],

    /* 6 integrity pips — 4 traps + 2 gates, bonus requires flawless run */
    integrity: 6,

    /* -- Completion screen -- */
    completion: {
        title: 'Destructuring',
        subtitle: 'Six servers. Clean extractions. Destructuring kept the code readable under pressure.',
        storageKey: 'hexworth_operator_js17'
    }
};
