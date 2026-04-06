/* ================================================================
   JS-14 / Object Literals -- Mission Config
   ================================================================
   Tier 3 mission. 9x9 grid — 81 cells.
   Student builds toolkit objects to organize actions and data.

   DESIGN RATIONALE:
   - Tier 3 shifts from arrays to objects — JavaScript's other core data type
   - Student organizes agent methods into a toolkit object: { scan: ..., move: ... }
   - The grid is 9x9 with 5 servers, 3 traps, 2 gates — requires organized approach
   - Without objects, the student has loose variables everywhere
   - With objects, related data groups together: toolkit.scan(), toolkit.move()
   - Object literal syntax: const obj = { key: value, key2: value2 }

   JS SKILL: Object literals — group related data and functions
   - const toolkit = { scan: agent.scan, move: agent.move }
   - Properties accessed with dot notation: toolkit.scan()
   - Objects organize data that belongs together
   - Teaches: key-value pairs, dot access, data organization

   REFERENCE SOLUTION:
     // Build a toolkit object that groups operations
     const toolkit = {
         scan: function() { return agent.scan(); },
         move: function(dir) { agent.move(dir); },
         nmap: function(target) { agent.nmap(target); }
     };
     // Use the toolkit
     let results = toolkit.scan();
     results.filter(n => n.name.includes('SERVER'))
            .forEach(n => toolkit.move(n.direction));

   WHY OBJECTS MATTER:
   - Objects are JavaScript's fundamental data structure
   - APIs return objects, DOM nodes are objects, config files are objects
   - Grouping related functions = namespace pattern (toolkit.scan vs global scan)
   - This is the gateway to classes, modules, and component architecture
   - Every config file in Operator IS an object literal

   GRID LAYOUT (9x9):
     [start]    [empty]    [empty]    [empty]    [server-a] [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [honeypot] [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [firewall] [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [server-b] [empty]    [empty]    [empty]
     [empty]    [honeypot] [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [server-c] [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [exploit]  [empty]    [honeypot] [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [server-d] [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-e] [empty]

   5 servers + 3 traps + 2 gates. Objects organize the operator's toolkit.
   ================================================================ */

var JS_14_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-14',
    title: 'JS-14 / Object Literals',
    subtitle: 'Group your tools. Objects organize actions into a single toolkit.',
    category: 'javascript-ops',
    difficulty: 3,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 3 = scan, move, nmap, exploit) -- */
    agent: { tier: 3 },

    /* -- 9x9 Grid -- */
    grid: {
        rows: 9, cols: 9,
        cells: [
            /* Row 0 */ ['gateway',    'empty',      'empty',      'empty',       'server-a',    'empty',      'empty',      'empty',      'empty'],
            /* Row 1 */ ['empty',      'empty',      'honeypot-a', 'empty',       'empty',       'empty',      'empty',      'empty',      'empty'],
            /* Row 2 */ ['empty',      'empty',      'empty',      'empty',       'firewall',    'empty',      'empty',      'empty',      'empty'],
            /* Row 3 */ ['empty',      'empty',      'empty',      'empty',       'empty',       'server-b',   'empty',      'empty',      'empty'],
            /* Row 4 */ ['empty',      'honeypot-b', 'empty',      'empty',       'empty',       'empty',      'empty',      'empty',      'empty'],
            /* Row 5 */ ['empty',      'empty',      'empty',      'server-c',    'empty',       'empty',      'empty',      'empty',      'empty'],
            /* Row 6 */ ['empty',      'empty',      'empty',      'empty',       'exploit-gate','empty',      'honeypot-c', 'empty',      'empty'],
            /* Row 7 */ ['empty',      'empty',      'empty',      'empty',       'empty',       'server-d',   'empty',      'empty',      'empty'],
            /* Row 8 */ ['empty',      'empty',      'empty',      'empty',       'empty',       'empty',      'empty',      'server-e',   'empty']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':      { label: 'GATEWAY',          abbr: 'GTW', ip: '10.130.1.1',   desc: 'Edge gateway — your insertion point',             ports: ['22/SSH', '443/HTTPS'],                     os: 'Palo Alto PA-850' },

        /* 5 target servers — DevSecOps pipeline infrastructure */
        'server-a':     { label: 'SERVER-ALPHA',      abbr: 'SRA', ip: '10.130.1.10',  desc: 'Git server — source code repository',             ports: ['22/SSH', '443/HTTPS', '8443/GITEA'],       os: 'Ubuntu 24.04 LTS' },
        'server-b':     { label: 'SERVER-BRAVO',      abbr: 'SRB', ip: '10.130.1.11',  desc: 'CI/CD server — Jenkins build orchestrator',       ports: ['22/SSH', '8080/JENKINS', '50000/AGENT'],   os: 'Debian 12 Bookworm' },
        'server-c':     { label: 'SERVER-CHARLIE',    abbr: 'SRC', ip: '10.130.1.12',  desc: 'Artifact registry — Docker image repository',     ports: ['22/SSH', '5000/REGISTRY', '443/HTTPS'],    os: 'CentOS Stream 9' },
        'server-d':     { label: 'SERVER-DELTA',      abbr: 'SRD', ip: '10.130.1.13',  desc: 'SAST scanner — static code analysis engine',      ports: ['22/SSH', '9000/SONARQUBE', '443/HTTPS'],   os: 'Windows Server 2022' },
        'server-e':     { label: 'SERVER-ECHO',       abbr: 'SRE', ip: '10.130.1.14',  desc: 'Deploy server — Kubernetes control plane',        ports: ['22/SSH', '6443/K8S-API', '2379/ETCD'],    os: 'RHEL 9.3' },

        /* 2 gates — one nmap, one exploit */
        'firewall':     { label: 'FIREWALL-NORTH',    abbr: 'FWN', ip: '10.130.1.250', desc: 'Zone firewall — blocks the build corridor',       ports: ['22/SSH', '443/MGMT'],                      os: 'Fortinet FortiOS 7.4', vuln: 'CVE-2024-7550', vulnDesc: 'Management API probe reveals rule gap' },
        'exploit-gate': { label: 'VULN-SWITCH',       abbr: 'VSW', ip: '10.130.1.251', desc: 'Vulnerable L3 switch — exploit to cross VLANs',   ports: ['22/SSH', '161/SNMP'],                      os: 'Cisco Catalyst 9300', vuln: 'CVE-2024-7551', vulnDesc: 'SNMP write access allows VLAN hopping' },

        /* 3 traps — scattered to punish disorganized movement */
        'honeypot-a':   { label: 'HONEYPOT-NORTH',    abbr: 'HPN', ip: '10.130.1.200', desc: 'Decoy — upper corridor trap',                     ports: ['22/SSH-FAKE', '80/HTTP-TRAP'],             os: 'Honeyd 1.6 [TRAP]' },
        'honeypot-b':   { label: 'HONEYPOT-WEST',     abbr: 'HPW', ip: '10.130.1.201', desc: 'Decoy — western edge trap',                       ports: ['22/SSH-FAKE', '445/SMB-FAKE'],             os: 'Honeyd 1.6 [TRAP]' },
        'honeypot-c':   { label: 'HONEYPOT-LOWER',    abbr: 'HPL', ip: '10.130.1.202', desc: 'Decoy — lower grid ambush point',                 ports: ['22/SSH-FAKE', '3389/RDP-FAKE'],            os: 'Honeyd 1.6 [TRAP]' }
    },

    /* 3 traps on common paths */
    traps: ['honeypot-a', 'honeypot-b', 'honeypot-c'],

    /* 2 gates — nmap + exploit */
    gates: {
        'firewall':     { requires: 'nmap',    flag: 'firewallBypassed',  vuln: 'CVE-2024-7550', vulnDesc: 'Management API probe reveals rule gap' },
        'exploit-gate': { requires: 'exploit',  flag: 'switchExploited',   vuln: 'CVE-2024-7551', vulnDesc: 'SNMP write access allows VLAN hopping' }
    },

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER ALPHA -- Find the Git server',               check: 'nodesDiscovered.has("server-a")' },
        { id: 'obj_1', label: 'DISCOVER BRAVO -- Find the CI/CD server',              check: 'nodesDiscovered.has("server-b")' },
        { id: 'obj_2', label: 'DISCOVER CHARLIE -- Find the artifact registry',       check: 'nodesDiscovered.has("server-c")' },
        { id: 'obj_3', label: 'DISCOVER DELTA -- Find the SAST scanner',              check: 'nodesDiscovered.has("server-d")' },
        { id: 'obj_4', label: 'DISCOVER ECHO -- Find the deploy server',              check: 'nodesDiscovered.has("server-e")' },
        { id: 'obj_5', label: 'SURVIVE -- Complete with integrity remaining',          check: 'integrity >= 1' }
    ],

    /* 5 integrity pips — 3 traps + 2 gates, moderate margin */
    integrity: 5,

    /* -- Completion screen -- */
    completion: {
        title: 'Object Literals',
        subtitle: 'Five servers mapped. Toolkit organized. Objects group related operations.',
        storageKey: 'hexworth_operator_js14'
    }
};
