/* ================================================================
   JS-16 / Template Literals -- Mission Config
   ================================================================
   Tier 3 mission. 10x10 grid — 100 cells.
   Student uses template literals to build formatted output from scan data.

   DESIGN RATIONALE:
   - First 10x10 grid — 100 cells, the largest yet
   - 6 servers + 3 traps + 2 gates — dense operational environment
   - Template literals (`backtick strings`) allow embedded expressions: ${var}
   - Student processes scan results and builds formatted log lines
   - Old way: 'Found ' + name + ' at ' + dir — concatenation hell
   - New way: `Found ${name} at ${dir}` — clean, readable, professional
   - Multi-line strings also possible: `line1\nline2` without + operators

   JS SKILL: Template literals — string interpolation with backticks
   - `Found ${node.name} at ${node.direction}` — embed expressions in strings
   - Backticks (`) instead of quotes (' or ")
   - ${} evaluates any expression: ${2 + 2}, ${arr.length}, ${fn()}
   - Teaches: string interpolation, expression embedding, template syntax

   REFERENCE SOLUTION:
     let results = agent.scan();
     results.forEach(node => {
         // Template literal builds a formatted status line
         console.log(`[${node.ip}] ${node.name} -- ${node.desc}`);
         if (node.name.includes('SERVER')) {
             console.log(`  Moving ${node.direction} toward ${node.name}`);
             agent.move(node.direction);
         }
     });

   WHY TEMPLATE LITERALS MATTER:
   - String concatenation with + is error-prone (missing spaces, wrong order)
   - Template literals are visual: you SEE the output format in the code
   - Used everywhere in modern JS: React JSX, logging, SQL queries, URLs
   - `https://api.example.com/users/${userId}/posts/${postId}` — readable
   - 'https://api.example.com/users/' + userId + '/posts/' + postId — not

   GRID LAYOUT (10x10):
     [start]    [empty]    [empty]    [server-a] [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [honeypot] [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [firewall] [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-b] [empty]    [empty]    [empty]
     [empty]    [honeypot] [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-c] [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [exploit]  [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [server-d] [empty]    [empty]    [empty]    [empty]    [honeypot] [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-e] [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-f] [empty]

   6 servers + 3 traps + 2 gates. Template literals format the intelligence.
   ================================================================ */

var JS_16_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-16',
    title: 'JS-16 / Template Literals',
    subtitle: 'Build formatted output. Embed data directly in your strings.',
    category: 'javascript-ops',
    difficulty: 3,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 3 = scan, move, nmap, exploit) -- */
    agent: { tier: 3 },

    /* -- 10x10 Grid -- */
    grid: {
        rows: 10, cols: 10,
        cells: [
            /* Row 0 */ ['gateway',    'empty',      'empty',      'server-a',    'empty',       'empty',      'empty',      'empty',      'empty',      'empty'],
            /* Row 1 */ ['empty',      'empty',      'empty',      'empty',       'empty',       'honeypot-a', 'empty',      'empty',      'empty',      'empty'],
            /* Row 2 */ ['empty',      'empty',      'empty',      'empty',       'firewall',    'empty',      'empty',      'empty',      'empty',      'empty'],
            /* Row 3 */ ['empty',      'empty',      'empty',      'empty',       'empty',       'empty',      'server-b',   'empty',      'empty',      'empty'],
            /* Row 4 */ ['empty',      'honeypot-b', 'empty',      'empty',       'empty',       'empty',      'empty',      'empty',      'empty',      'empty'],
            /* Row 5 */ ['empty',      'empty',      'empty',      'empty',       'empty',       'empty',      'empty',      'server-c',   'empty',      'empty'],
            /* Row 6 */ ['empty',      'empty',      'empty',      'empty',       'exploit-gate','empty',      'empty',      'empty',      'empty',      'empty'],
            /* Row 7 */ ['empty',      'empty',      'empty',      'server-d',    'empty',       'empty',      'empty',      'empty',      'honeypot-c', 'empty'],
            /* Row 8 */ ['empty',      'empty',      'empty',      'empty',       'empty',       'empty',      'server-e',   'empty',      'empty',      'empty'],
            /* Row 9 */ ['empty',      'empty',      'empty',      'empty',       'empty',       'empty',      'empty',      'empty',      'server-f',   'empty']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':      { label: 'GATEWAY',          abbr: 'GTW', ip: '10.150.1.1',   desc: 'Edge gateway — your insertion point',              ports: ['22/SSH', '443/HTTPS'],                      os: 'Cisco Meraki MX84' },

        /* 6 target servers — network operations center infrastructure */
        'server-a':     { label: 'SERVER-ALPHA',      abbr: 'SRA', ip: '10.150.1.10',  desc: 'NMS server — network management system',           ports: ['22/SSH', '161/SNMP', '8080/LIBRENMS'],      os: 'Ubuntu 24.04 LTS' },
        'server-b':     { label: 'SERVER-BRAVO',      abbr: 'SRB', ip: '10.150.1.11',  desc: 'Flow collector — NetFlow/sFlow analytics',         ports: ['22/SSH', '2055/NETFLOW', '6343/SFLOW'],     os: 'Debian 12 Bookworm' },
        'server-c':     { label: 'SERVER-CHARLIE',    abbr: 'SRC', ip: '10.150.1.12',  desc: 'IPAM server — IP address space management',        ports: ['22/SSH', '443/HTTPS', '8080/PHPIPAM'],      os: 'CentOS Stream 9' },
        'server-d':     { label: 'SERVER-DELTA',      abbr: 'SRD', ip: '10.150.1.13',  desc: 'Config backup — RANCID/Oxidized repository',       ports: ['22/SSH', '8888/OXIDIZED', '443/HTTPS'],     os: 'Windows Server 2022' },
        'server-e':     { label: 'SERVER-ECHO',       abbr: 'SRE', ip: '10.150.1.14',  desc: 'Weathermap server — topology visualization',       ports: ['22/SSH', '80/HTTP', '443/HTTPS'],           os: 'RHEL 9.3' },
        'server-f':     { label: 'SERVER-FOXTROT',    abbr: 'SRF', ip: '10.150.1.15',  desc: 'Trap receiver — SNMP trap processing',             ports: ['22/SSH', '162/SNMP-TRAP', '514/SYSLOG'],    os: 'Rocky Linux 9.3' },

        /* 2 gates — nmap + exploit */
        'firewall':     { label: 'FIREWALL-UPPER',    abbr: 'FWU', ip: '10.150.1.250', desc: 'Zone firewall — blocks the upper-mid corridor',    ports: ['22/SSH', '443/MGMT'],                       os: 'pfSense 2.7.0', vuln: 'CVE-2024-7770', vulnDesc: 'Web UI CSRF allows firewall rule injection' },
        'exploit-gate': { label: 'VULN-ROUTER',       abbr: 'VRT', ip: '10.150.1.251', desc: 'Vulnerable core router — exploit to traverse',     ports: ['22/SSH', '161/SNMP', '179/BGP'],            os: 'MikroTik RouterOS 7.14', vuln: 'CVE-2024-7771', vulnDesc: 'Winbox protocol buffer overflow allows RCE' },

        /* 3 traps — guarding the most direct paths */
        'honeypot-a':   { label: 'HONEYPOT-UPPER',    abbr: 'HPU', ip: '10.150.1.200', desc: 'Decoy — upper-right corridor trap',                ports: ['22/SSH-FAKE', '80/HTTP-TRAP'],              os: 'Honeyd 1.6 [TRAP]' },
        'honeypot-b':   { label: 'HONEYPOT-MID',      abbr: 'HPM', ip: '10.150.1.201', desc: 'Decoy — mid-grid western trap',                    ports: ['22/SSH-FAKE', '445/SMB-FAKE'],              os: 'Honeyd 1.6 [TRAP]' },
        'honeypot-c':   { label: 'HONEYPOT-LOWER',    abbr: 'HPL', ip: '10.150.1.202', desc: 'Decoy — lower-right corridor trap',                ports: ['22/SSH-FAKE', '3389/RDP-FAKE'],             os: 'Honeyd 1.6 [TRAP]' }
    },

    /* 3 traps across the grid */
    traps: ['honeypot-a', 'honeypot-b', 'honeypot-c'],

    /* 2 gates — nmap + exploit */
    gates: {
        'firewall':     { requires: 'nmap',    flag: 'firewallBypassed',  vuln: 'CVE-2024-7770', vulnDesc: 'Web UI CSRF allows firewall rule injection' },
        'exploit-gate': { requires: 'exploit',  flag: 'routerExploited',   vuln: 'CVE-2024-7771', vulnDesc: 'Winbox protocol buffer overflow allows RCE' }
    },

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER ALPHA -- Find the NMS server',                check: 'nodesDiscovered.has("server-a")' },
        { id: 'obj_1', label: 'DISCOVER BRAVO -- Find the flow collector',             check: 'nodesDiscovered.has("server-b")' },
        { id: 'obj_2', label: 'DISCOVER CHARLIE -- Find the IPAM server',              check: 'nodesDiscovered.has("server-c")' },
        { id: 'obj_3', label: 'DISCOVER DELTA -- Find the config backup server',       check: 'nodesDiscovered.has("server-d")' },
        { id: 'obj_4', label: 'DISCOVER ECHO -- Find the weathermap server',           check: 'nodesDiscovered.has("server-e")' },
        { id: 'obj_5', label: 'DISCOVER FOXTROT -- Find the trap receiver',            check: 'nodesDiscovered.has("server-f")' },
        { id: 'obj_6', label: 'FULL RECON -- Map all 6 servers and both gates',        check: 'nodesDiscovered.size >= 9' }
    ],

    /* 5 integrity pips — 3 traps + 2 gates, moderate margin */
    integrity: 5,

    /* -- Completion screen -- */
    completion: {
        title: 'Template Literals',
        subtitle: 'Six servers. Formatted output. Template literals made the data readable.',
        storageKey: 'hexworth_operator_js16'
    }
};
