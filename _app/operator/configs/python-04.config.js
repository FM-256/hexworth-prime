/* ================================================================
   PYTHON-04 / GRID SEARCH -- Mission Config
   ================================================================
   Tier 3 mission. 7x7 grid — 49 cells.
   Forces students to use for loops to systematically sweep the grid.

   DESIGN RATIONALE:
   - 5 data nodes hidden across a 7x7 grid behind fog of war
   - Student must discover all 5 to complete the mission
   - Manual move-by-move would require 40+ lines of agent.move()
   - A for-loop sweep pattern reduces this to ~12 lines
   - Traps scattered along edges punish random wandering
   - The intended pattern is a "lawnmower" zigzag sweep

   REFERENCE SOLUTION (what students should discover):
     # Zigzag sweep: east across a row, step south, west back, repeat
     for row in range(6):
         if row % 2 == 0:
             for col in range(6):
                 agent.scan()
                 agent.move('east')
         else:
             for col in range(6):
                 agent.scan()
                 agent.move('west')
         agent.move('south')

   WHY SEQUENTIAL FAILS:
   - 49 cells → ~40 move commands if typed manually
   - Unknown node positions → can't hardcode a direct path
   - Traps on edges → random exploration loses integrity

   GRID LAYOUT (7x7):
     [start]  [empty]  [empty]   [empty]     [honeypot] [empty]   [wall]
     [empty]  [empty]  [server1] [empty]     [empty]    [empty]   [empty]
     [empty]  [empty]  [empty]   [empty]     [empty]    [server2] [wall]
     [wall]   [empty]  [empty]   [router]    [empty]    [empty]   [empty]
     [empty]  [empty]  [empty]   [empty]     [empty]    [empty]   [ids]
     [empty]  [server3][empty]   [empty]     [server4]  [empty]   [empty]
     [wall]   [wall]   [empty]   [server5]   [wall]     [wall]    [wall]

   5 servers scattered — student must find all 5 via systematic sweep
   ================================================================ */

var PYTHON_04_CONFIG = {
    id: 'python-04',
    title: 'PYTHON-04 / GRID SEARCH',
    subtitle: 'Systematic reconnaissance across a 7x7 operations grid',
    category: 'python-ops',
    difficulty: 3,
    inputMode: 'python',

    agent: { tier: 3 },

    grid: {
        rows: 7, cols: 7,
        cells: [
            ['gateway',  'empty',   'empty',    'empty',     'honeypot', 'empty',    'wall'],
            ['empty',    'empty',   'server-a', 'empty',     'empty',    'empty',    'empty'],
            ['empty',    'empty',   'empty',    'empty',     'empty',    'server-b', 'wall'],
            ['wall',     'empty',   'empty',    'router',    'empty',    'empty',    'empty'],
            ['empty',    'empty',   'empty',    'empty',     'empty',    'empty',    'ids-trap'],
            ['empty',    'server-c','empty',    'empty',     'server-d', 'empty',    'empty'],
            ['wall',     'wall',    'empty',    'server-e',  'wall',     'wall',     'wall']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        /* -- Entry point -- */
        'gateway':   { label: 'GATEWAY',    abbr: 'GTW', ip: '10.30.0.1',   desc: 'Edge gateway — your insertion point',       ports: ['22/SSH','443/HTTPS'],                         os: 'Cisco IOS 15.4' },
        'router':    { label: 'ROUTER',     abbr: 'RTR', ip: '10.30.0.2',   desc: 'Core router — deep in the network',         ports: ['22/SSH','179/BGP','161/SNMP'],                os: 'Juniper JunOS 21.4' },

        /* -- 5 Target servers (scattered — must find all 5) -- */
        'server-a':  { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.30.0.11', desc: 'File server — classified documents',     ports: ['22/SSH','445/SMB','2049/NFS'],                os: 'Windows Server 2022' },
        'server-b':  { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.30.0.12', desc: 'Application server — internal tools',    ports: ['22/SSH','8080/HTTP','8443/HTTPS'],             os: 'Ubuntu 24.04 LTS' },
        'server-c':  { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.30.0.13', desc: 'Backup server — disaster recovery data', ports: ['22/SSH','873/RSYNC','3260/ISCSI'],             os: 'Debian 12 Bookworm' },
        'server-d':  { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.30.0.14', desc: 'Monitoring server — SIEM data',          ports: ['22/SSH','9200/ELASTIC','5601/KIBANA'],         os: 'CentOS Stream 9' },
        'server-e':  { label: 'SERVER-ECHO',    abbr: 'SRE', ip: '10.30.0.15', desc: 'Database server — credentials store',    ports: ['22/SSH','3306/MySQL','5432/PostgreSQL'],       os: 'RHEL 9.3' },

        /* -- Traps -- */
        'honeypot':  { label: 'HONEYPOT',   abbr: 'HNY', ip: '10.30.0.200', desc: 'Decoy server — triggers alert on contact', ports: ['22/SSH-FAKE','80/HTTP-TRAP'],                  os: 'Honeyd 1.6 [TRAP]' },
        'ids-trap':  { label: 'IDS-SENSOR', abbr: 'IDS', ip: '10.30.0.201', desc: 'Intrusion detection — triggers on approach',ports: ['514/SYSLOG'],                                  os: 'Snort 3.1' }
    },

    traps: ['honeypot', 'ids-trap'],

    /* No gates in this mission — pure exploration */
    gates: {},

    objectives: [
        { id: 'obj_0', label: 'DISCOVER ALPHA -- Find the file server',          check: 'nodesDiscovered.has("server-a")' },
        { id: 'obj_1', label: 'DISCOVER BRAVO -- Find the application server',   check: 'nodesDiscovered.has("server-b")' },
        { id: 'obj_2', label: 'DISCOVER CHARLIE -- Find the backup server',      check: 'nodesDiscovered.has("server-c")' },
        { id: 'obj_3', label: 'DISCOVER DELTA -- Find the monitoring server',    check: 'nodesDiscovered.has("server-d")' },
        { id: 'obj_4', label: 'DISCOVER ECHO -- Find the database server',       check: 'nodesDiscovered.has("server-e")' },
        { id: 'obj_5', label: 'STEALTH -- Complete with 2+ integrity remaining',  check: 'integrity >= 2' }
    ],

    integrity: 3,

    completion: {
        title: 'GRID SEARCH',
        subtitle: 'All five servers located. Full network mapped.',
        storageKey: 'hexworth_operator_python04'
    }
};
