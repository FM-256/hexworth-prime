/* ================================================================
   JS-09 / filter -- Mission Config
   ================================================================
   Tier 2 mission. 7x7 grid — 49 cells.
   Student must filter scan results to extract only the targets.

   DESIGN RATIONALE:
   - Scan returns a mixed bag: servers, traps, and a gate node
   - Moving toward every result is suicide — traps will shred integrity
   - .filter() separates wheat from chaff: keep only safe nodes
   - 4 servers + 3 traps + 1 gate — the ratio is unfriendly on purpose
   - Student learns to build a NEW array from an existing one by criteria
   - filter() returns a new array — original untouched (immutability intro)

   JS SKILL: .filter() — extract matching elements from an array
   - results.filter(function(n) { return n.name.includes('SERVER'); })
   - The callback returns true/false — true = keep, false = discard
   - Returns a NEW array (original unchanged)
   - Teaches: predicate functions, boolean returns, array immutability

   REFERENCE SOLUTION:
     let results = agent.scan();
     let targets = results.filter(function(n) {
         return !n.name.includes('TRAP') && !n.name.includes('HONEYPOT');
     });
     targets.forEach(function(t) {
         agent.move(t.direction);
     });
     // Repeat: scan, filter out traps, move toward safe nodes

   WHY FILTER MATTERS:
   - Real data is noisy — security logs, network scans, API responses
   - filter() is the universal "give me only what I care about" tool
   - Without filter, students write: if (results[0]...) if (results[1]...) — fragile
   - With filter: one line produces a clean array of only valid targets

   GRID LAYOUT (7x7):
     [start]    [empty]    [empty]    [honeypot] [empty]    [empty]    [empty]
     [empty]    [server-a] [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [honeypot] [empty]    [empty]
     [empty]    [empty]    [firewall] [empty]    [empty]    [server-b] [empty]
     [honeypot] [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [server-c] [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [server-d] [empty]

   4 servers + 3 traps + 1 firewall gate. filter() is survival.
   ================================================================ */

var JS_09_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-09',
    title: 'JS-09 / filter',
    subtitle: 'Not everything in the scan is friendly. Filter out the noise.',
    category: 'javascript-ops',
    difficulty: 3,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 2 = scan, move, nmap) -- */
    agent: { tier: 2 },

    /* -- 7x7 Grid -- */
    grid: {
        rows: 7, cols: 7,
        cells: [
            /* Row 0 */ ['gateway',    'empty',      'empty',      'honeypot-a', 'empty',      'empty',      'empty'],
            /* Row 1 */ ['empty',      'server-a',   'empty',      'empty',      'empty',      'empty',      'empty'],
            /* Row 2 */ ['empty',      'empty',      'empty',      'empty',      'honeypot-b', 'empty',      'empty'],
            /* Row 3 */ ['empty',      'empty',      'firewall',   'empty',      'empty',      'server-b',   'empty'],
            /* Row 4 */ ['honeypot-c', 'empty',      'empty',      'empty',      'empty',      'empty',      'empty'],
            /* Row 5 */ ['empty',      'empty',      'empty',      'server-c',   'empty',      'empty',      'empty'],
            /* Row 6 */ ['empty',      'empty',      'empty',      'empty',      'empty',      'server-d',   'empty']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':    { label: 'GATEWAY',          abbr: 'GTW', ip: '10.80.1.1',   desc: 'Edge gateway — your insertion point',           ports: ['22/SSH', '443/HTTPS'],                      os: 'Cisco IOS 15.4' },

        /* 4 target servers — spread across the grid */
        'server-a':   { label: 'SERVER-ALPHA',      abbr: 'SRA', ip: '10.80.1.10',  desc: 'WAF server — web application firewall',         ports: ['22/SSH', '80/HTTP', '443/HTTPS'],           os: 'Ubuntu 24.04 LTS' },
        'server-b':   { label: 'SERVER-BRAVO',      abbr: 'SRB', ip: '10.80.1.11',  desc: 'EDR console — endpoint detection dashboard',    ports: ['22/SSH', '8443/HTTPS', '9090/API'],         os: 'Debian 12 Bookworm' },
        'server-c':   { label: 'SERVER-CHARLIE',    abbr: 'SRC', ip: '10.80.1.12',  desc: 'SOAR platform — orchestration and response',    ports: ['22/SSH', '443/HTTPS', '5601/KIBANA'],       os: 'CentOS Stream 9' },
        'server-d':   { label: 'SERVER-DELTA',      abbr: 'SRD', ip: '10.80.1.13',  desc: 'Ticketing server — incident tracking',          ports: ['22/SSH', '80/HTTP', '3000/GRAFANA'],        os: 'RHEL 9.3' },

        /* 1 firewall gate — requires nmap */
        'firewall':   { label: 'FIREWALL-ZONE',     abbr: 'FWZ', ip: '10.80.1.254', desc: 'Zone firewall — separates north from south',    ports: ['22/SSH', '443/MGMT'],                       os: 'Fortinet FortiOS 7.4', vuln: 'CVE-2024-6621', vulnDesc: 'ACL race condition allows nmap bypass' },

        /* 3 traps — scattered among servers to force filtering */
        'honeypot-a': { label: 'HONEYPOT-NORTH',    abbr: 'HPN', ip: '10.80.1.200', desc: 'Decoy — northeast corridor trap',               ports: ['22/SSH-FAKE', '80/HTTP-TRAP'],              os: 'Honeyd 1.6 [TRAP]' },
        'honeypot-b': { label: 'HONEYPOT-CENTER',   abbr: 'HPC', ip: '10.80.1.201', desc: 'Decoy — center grid ambush point',              ports: ['22/SSH-FAKE', '443/HTTPS-FAKE'],            os: 'Honeyd 1.6 [TRAP]' },
        'honeypot-c': { label: 'HONEYPOT-WEST',     abbr: 'HPW', ip: '10.80.1.202', desc: 'Decoy — western edge trap',                     ports: ['22/SSH-FAKE', '3389/RDP-FAKE'],             os: 'Honeyd 1.6 [TRAP]' }
    },

    /* 3 traps placed to punish unfiltered movement */
    traps: ['honeypot-a', 'honeypot-b', 'honeypot-c'],

    /* 1 gate — requires nmap to clear */
    gates: {
        'firewall': { requires: 'nmap', flag: 'firewallBypassed', vuln: 'CVE-2024-6621', vulnDesc: 'ACL race condition allows nmap bypass' }
    },

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER ALPHA -- Find the WAF server',              check: 'nodesDiscovered.has("server-a")' },
        { id: 'obj_1', label: 'DISCOVER BRAVO -- Find the EDR console',             check: 'nodesDiscovered.has("server-b")' },
        { id: 'obj_2', label: 'DISCOVER CHARLIE -- Find the SOAR platform',         check: 'nodesDiscovered.has("server-c")' },
        { id: 'obj_3', label: 'DISCOVER DELTA -- Find the ticketing server',        check: 'nodesDiscovered.has("server-d")' },
        { id: 'obj_4', label: 'ZERO DAMAGE -- Complete without hitting any traps',  check: 'integrity >= 4' }
    ],

    /* 4 integrity pips — bonus objective requires perfect run */
    integrity: 4,

    /* -- Completion screen -- */
    completion: {
        title: 'filter',
        subtitle: 'Four servers found. Traps filtered from scan results cleanly.',
        storageKey: 'hexworth_operator_js09'
    }
};
