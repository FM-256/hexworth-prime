/* ================================================================
   JS-10 / map -- Mission Config
   ================================================================
   Tier 2 mission. 8x8 grid — 64 cells.
   Student must transform scan results using .map() to extract directions.

   DESIGN RATIONALE:
   - By now students can filter arrays — but they still work with full objects
   - .map() transforms: array of objects → array of directions (or any property)
   - The grid is 8x8 — bigger, requiring efficient multi-step processing
   - 5 servers + 2 traps — standard threat mix
   - The optimal solution chains filter + map: get safe nodes, extract directions
   - map() returns a new array of TRANSFORMED elements — not originals

   JS SKILL: .map() — transform every element into something new
   - results.map(function(n) { return n.direction; })
   - The callback transforms each element — returns the new value
   - Returns a new array of the SAME length (unlike filter)
   - Teaches: data transformation, projection, pipeline thinking

   REFERENCE SOLUTION:
     let results = agent.scan();
     // Filter for servers, then extract just the directions
     let dirs = results
         .filter(function(n) { return n.name.includes('SERVER'); })
         .map(function(n) { return n.direction; });
     // dirs is now ['east', 'south', etc.] — just strings, no objects
     dirs.forEach(function(d) { agent.move(d); });

   WHY MAP MATTERS:
   - filter selects WHICH elements to keep
   - map selects WHAT to extract from each element
   - Together: filter + map = "give me the directions of all servers"
   - This is the SQL SELECT equivalent: SELECT direction FROM nodes WHERE type='SERVER'
   - Real-world: extracting IPs from scan results, names from user lists, etc.

   GRID LAYOUT (8x8):
     [start]    [empty]    [empty]    [server-a] [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [honeypot] [empty]    [empty]    [server-b] [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [server-c] [empty]    [empty]    [empty]
     [empty]    [honeypot] [empty]    [empty]    [empty]    [empty]    [server-d] [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [server-e] [empty]    [empty]

   5 servers + 2 traps. map() extracts directions from filtered results.
   ================================================================ */

var JS_10_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-10',
    title: 'JS-10 / map',
    subtitle: 'Transform the data. Extract what you need from every element.',
    category: 'javascript-ops',
    difficulty: 3,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 3 = scan, move, nmap, exploit) -- */
    agent: { tier: 3 },

    /* -- 8x8 Grid -- */
    grid: {
        rows: 8, cols: 8,
        cells: [
            /* Row 0 */ ['gateway',    'empty',      'empty',      'server-a',   'empty',      'empty',      'empty',      'empty'],
            /* Row 1 */ ['empty',      'empty',      'empty',      'empty',      'empty',      'empty',      'empty',      'empty'],
            /* Row 2 */ ['empty',      'empty',      'honeypot-a', 'empty',      'empty',      'server-b',   'empty',      'empty'],
            /* Row 3 */ ['empty',      'empty',      'empty',      'empty',      'empty',      'empty',      'empty',      'empty'],
            /* Row 4 */ ['empty',      'empty',      'empty',      'empty',      'server-c',   'empty',      'empty',      'empty'],
            /* Row 5 */ ['empty',      'honeypot-b', 'empty',      'empty',      'empty',      'empty',      'server-d',   'empty'],
            /* Row 6 */ ['empty',      'empty',      'empty',      'empty',      'empty',      'empty',      'empty',      'empty'],
            /* Row 7 */ ['empty',      'empty',      'empty',      'empty',      'empty',      'server-e',   'empty',      'empty']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':    { label: 'GATEWAY',          abbr: 'GTW', ip: '10.90.1.1',   desc: 'Edge gateway — your insertion point',           ports: ['22/SSH', '443/HTTPS'],                      os: 'Cisco ASA 5516-X' },

        /* 5 target servers — cybersecurity infrastructure */
        'server-a':   { label: 'SERVER-ALPHA',      abbr: 'SRA', ip: '10.90.1.10',  desc: 'Packet capture server — full PCAP storage',     ports: ['22/SSH', '3000/MOLOCH', '8005/ARKIME'],     os: 'Ubuntu 24.04 LTS' },
        'server-b':   { label: 'SERVER-BRAVO',      abbr: 'SRB', ip: '10.90.1.11',  desc: 'Malware sandbox — dynamic analysis engine',     ports: ['22/SSH', '8443/CUCKOO', '9090/API'],        os: 'Debian 12 Bookworm' },
        'server-c':   { label: 'SERVER-CHARLIE',    abbr: 'SRC', ip: '10.90.1.12',  desc: 'Threat intel platform — STIX/TAXII feeds',      ports: ['22/SSH', '443/HTTPS', '9000/MISP'],         os: 'CentOS Stream 9' },
        'server-d':   { label: 'SERVER-DELTA',      abbr: 'SRD', ip: '10.90.1.13',  desc: 'SIEM correlation engine — rule processing',     ports: ['22/SSH', '9200/ELASTIC', '5601/KIBANA'],    os: 'Windows Server 2022' },
        'server-e':   { label: 'SERVER-ECHO',       abbr: 'SRE', ip: '10.90.1.14',  desc: 'Log shipper relay — Logstash pipeline',         ports: ['22/SSH', '5044/BEATS', '9600/LOGSTASH'],    os: 'RHEL 9.3' },

        /* 2 traps — on tempting diagonal paths */
        'honeypot-a': { label: 'HONEYPOT-CENTER',   abbr: 'HPC', ip: '10.90.1.200', desc: 'Decoy — center grid lure on direct path',       ports: ['22/SSH-FAKE', '80/HTTP-TRAP'],              os: 'Honeyd 1.6 [TRAP]' },
        'honeypot-b': { label: 'HONEYPOT-SOUTH',    abbr: 'HPS', ip: '10.90.1.201', desc: 'Decoy — southern descent ambush',               ports: ['22/SSH-FAKE', '445/SMB-FAKE'],              os: 'Honeyd 1.6 [TRAP]' }
    },

    /* 2 traps on common traversal paths */
    traps: ['honeypot-a', 'honeypot-b'],

    /* No gates — focus is on map() transformation */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER ALPHA -- Find the packet capture server',    check: 'nodesDiscovered.has("server-a")' },
        { id: 'obj_1', label: 'DISCOVER BRAVO -- Find the malware sandbox',          check: 'nodesDiscovered.has("server-b")' },
        { id: 'obj_2', label: 'DISCOVER CHARLIE -- Find the threat intel platform',  check: 'nodesDiscovered.has("server-c")' },
        { id: 'obj_3', label: 'DISCOVER DELTA -- Find the SIEM engine',              check: 'nodesDiscovered.has("server-d")' },
        { id: 'obj_4', label: 'DISCOVER ECHO -- Find the log shipper relay',         check: 'nodesDiscovered.has("server-e")' },
        { id: 'obj_5', label: 'SURVIVE -- Complete with integrity remaining',         check: 'integrity >= 1' }
    ],

    /* 3 integrity pips — 2 traps, 1 mistake margin */
    integrity: 3,

    /* -- Completion screen -- */
    completion: {
        title: 'map',
        subtitle: 'Five servers found. Data transformed. Directions extracted cleanly.',
        storageKey: 'hexworth_operator_js10'
    }
};
