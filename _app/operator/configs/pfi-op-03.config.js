/* ================================================================
   PFI-OP-03 / THE ROUTER -- Mission Config
   ================================================================
   Python for IT — Week 3 (Functions) — Mission 3
   Tier 3 mission. 8x6 grid — 48 cells.
   Forces students to write multiple cooperating functions — one per
   zone plus a gate-clearing helper — and compose them sequentially.

   DESIGN RATIONALE:
   - Grid is divided into 3 vertical zones (left, center, right)
   - Zones separated by wall columns with nmap-gated passthrough
   - Each zone has 2 servers placed at different positions
   - Student must write a sweep function for each zone layout
   - A gate-clearing function (nmap the right server, move through)
   - Composing zone-sweep + gate-clear + zone-sweep = the lesson
   - Manual approach without functions would be 60+ lines
   - Function-based approach reduces to ~20 lines
   - Traps in bottom-left and bottom-center punish blind sweeping

   REFERENCE SOLUTION (what students should discover):
     def sweep_zone(rows, cols):
         for r in range(rows):
             for c in range(cols):
                 agent.scan()
                 agent.move('east')
             agent.move('south')
             for c in range(cols):
                 agent.move('west')

     def clear_gate(server_name):
         agent.nmap(server_name)
         agent.move('east')

     # Zone 1 (left)
     sweep_zone(3, 2)
     clear_gate('srv-a')

     # Zone 2 (center)
     sweep_zone(3, 2)
     clear_gate('srv-c')

     # Zone 3 (right)
     sweep_zone(3, 1)

   WHY SEQUENTIAL FAILS:
   - 3 zones with similar but zoned layouts
   - Gates require nmap of specific servers before passing
   - Without functions each zone needs ~15 lines of move/scan
   - 48 cells total — can't brute-force without running out of integrity
   - The zoned layout forces multi-function composition

   GRID LAYOUT (8 cols x 6 rows):
     [gateway]  [empty]    [empty]    [nmap-gate-a] [empty]    [empty]    [nmap-gate-b] [empty]
     [empty]    [srv-a]    [empty]    [wall]        [empty]    [srv-c]    [wall]        [srv-e]
     [empty]    [empty]    [srv-b]    [wall]        [empty]    [empty]    [wall]        [empty]
     [empty]    [empty]    [empty]    [wall]        [srv-d]    [empty]    [wall]        [empty]
     [empty]    [empty]    [empty]    [wall]        [empty]    [empty]    [wall]        [srv-f]
     [trap-a]   [empty]    [empty]    [wall]        [empty]    [trap-b]   [wall]        [empty]

   3 zones, 6 servers, 2 gates, 2 traps
   ================================================================ */

var PFI_OP_03_CONFIG = {
    id: 'pfi-op-03',
    title: 'PFI-OP-03 / THE ROUTER',
    subtitle: 'Compose multiple functions to sweep 3 gated network zones',
    brief: 'The network is divided into three zones separated by firewall gates. You must sweep each zone to discover its servers, then <code>nmap()</code> the gate node to clear the firewall and advance to the next zone. Write separate functions for zone sweeping and gate clearing, then compose them into a complete patrol.',
    successCondition: 'Discover all six servers, clear both firewall gates, and sweep all three zones.',
    category: 'python-ops',
    difficulty: 3,
    inputMode: 'python',

    agent: { tier: 3 },

    grid: {
        rows: 6, cols: 8,
        cells: [
            /* Row 0 */ ['gateway',  'empty',  'empty',  'nmap-gate-a', 'empty',  'empty',  'nmap-gate-b', 'empty'],
            /* Row 1 */ ['empty',    'srv-a',  'empty',  'wall',        'empty',  'srv-c',  'wall',        'srv-e'],
            /* Row 2 */ ['empty',    'empty',  'srv-b',  'wall',        'empty',  'empty',  'wall',        'empty'],
            /* Row 3 */ ['empty',    'empty',  'empty',  'wall',        'srv-d',  'empty',  'wall',        'empty'],
            /* Row 4 */ ['empty',    'empty',  'empty',  'wall',        'empty',  'empty',  'wall',        'srv-f'],
            /* Row 5 */ ['trap-a',   'empty',  'empty',  'wall',        'empty',  'trap-b', 'wall',        'empty']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        /* -- Entry point -- */
        'gateway':      { label: 'GATEWAY',        abbr: 'GTW', ip: '10.50.0.1',   desc: 'Edge router — your insertion point',                   ports: ['22/SSH','443/HTTPS'],                          os: 'Cisco IOS-XE 17.9' },

        /* -- Zone 1 servers (left zone, cols 0-2) -- */
        'srv-a':        { label: 'SERVER-ALPHA',    abbr: 'SRA', ip: '10.50.1.10',  desc: 'Zone 1 — Active Directory domain controller',          ports: ['22/SSH','88/KERBEROS','389/LDAP','636/LDAPS'],  os: 'Windows Server 2022' },
        'srv-b':        { label: 'SERVER-BRAVO',    abbr: 'SRB', ip: '10.50.1.11',  desc: 'Zone 1 — Certificate authority server',                ports: ['22/SSH','443/HTTPS','8080/OCSP'],               os: 'Windows Server 2019' },

        /* -- Zone 2 servers (center zone, cols 4-5) -- */
        'srv-c':        { label: 'SERVER-CHARLIE',  abbr: 'SRC', ip: '10.50.2.10',  desc: 'Zone 2 — SIEM correlation engine',                    ports: ['22/SSH','9200/ELASTIC','5601/KIBANA'],          os: 'Ubuntu 24.04 LTS' },
        'srv-d':        { label: 'SERVER-DELTA',    abbr: 'SRD', ip: '10.50.2.11',  desc: 'Zone 2 — Threat intelligence platform',               ports: ['22/SSH','443/HTTPS','8443/MISP'],               os: 'Debian 12 Bookworm' },

        /* -- Zone 3 servers (right zone, col 7) -- */
        'srv-e':        { label: 'SERVER-ECHO',     abbr: 'SRE', ip: '10.50.3.10',  desc: 'Zone 3 — Database cluster primary node',              ports: ['22/SSH','3306/MySQL','5432/PostgreSQL'],        os: 'RHEL 9.3' },
        'srv-f':        { label: 'SERVER-FOXTROT',  abbr: 'SRF', ip: '10.50.3.11',  desc: 'Zone 3 — Backup replication target',                  ports: ['22/SSH','873/RSYNC','3260/ISCSI'],              os: 'CentOS Stream 9' },

        /* -- Gate nodes -- */
        'nmap-gate-a':  { label: 'GATE-ALPHA',      abbr: 'GA',  ip: '10.50.0.250', desc: 'Zone firewall — nmap this gate node to reveal bypass route',   ports: ['22/SSH','443/MGMT'],                            os: 'pfSense 2.7.2',  vuln: 'CVE-2025-1180', vulnDesc: 'ACL misconfiguration — nmap probe reveals open path' },
        'nmap-gate-b':  { label: 'GATE-BRAVO',      abbr: 'GB',  ip: '10.50.0.251', desc: 'Zone firewall — nmap this gate node to reveal bypass route',   ports: ['22/SSH','443/MGMT'],                            os: 'OPNsense 24.1',  vuln: 'CVE-2025-1181', vulnDesc: 'State table overflow — nmap scan forces rule reload' },

        /* -- Traps -- */
        'trap-a':       { label: 'HONEYPOT-ALPHA',  abbr: 'TRA', ip: '10.50.0.200', desc: 'Decoy node — triggers alert on contact',              ports: ['22/SSH-FAKE','80/HTTP-TRAP'],                   os: 'Honeyd 1.6 [TRAP]' },
        'trap-b':       { label: 'HONEYPOT-BRAVO',  abbr: 'TRB', ip: '10.50.0.201', desc: 'Decoy sensor — triggers alarm on scan',               ports: ['514/SYSLOG-FAKE'],                              os: 'Snort 3.2 [TRAP]' }
    },

    traps: ['trap-a', 'trap-b'],

    /* 2 nmap gates — each requires scanning a specific server to open */
    gates: {
        'nmap-gate-a':  { requires: 'nmap', flag: 'gateACleared', vuln: 'CVE-2025-1180', vulnDesc: 'ACL misconfiguration — nmap probe reveals open path' },
        'nmap-gate-b':  { requires: 'nmap', flag: 'gateBCleared', vuln: 'CVE-2025-1181', vulnDesc: 'State table overflow — nmap scan forces rule reload' }
    },

    objectives: [
        { id: 'obj_0', label: 'ZONE 1 -- Discover and nmap servers Alpha and Bravo',   check: 'nodesDiscovered.has("srv-a") && nodesDiscovered.has("srv-b")' },
        { id: 'obj_1', label: 'GATE A -- Clear the first zone firewall',                check: 'gateACleared' },
        { id: 'obj_2', label: 'ZONE 2 -- Discover and nmap servers Charlie and Delta',  check: 'nodesDiscovered.has("srv-c") && nodesDiscovered.has("srv-d")' },
        { id: 'obj_3', label: 'GATE B -- Clear the second zone firewall',               check: 'gateBCleared' },
        { id: 'obj_4', label: 'ZONE 3 -- Discover servers Echo and Foxtrot',            check: 'nodesDiscovered.has("srv-e") && nodesDiscovered.has("srv-f")' }
    ],

    integrity: 3,

    completion: {
        title: 'THE ROUTER',
        subtitle: 'All three zones breached. Multi-function routing confirmed.',
        storageKey: 'hexworth_operator_pfi_op_03'
    }
};
