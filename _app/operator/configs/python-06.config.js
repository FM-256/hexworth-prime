/* ================================================================
   PYTHON-06 / PATROL ROUTE -- Mission Config
   ================================================================
   Tier 4 mission. 8x8 grid — 64 cells.
   Forces students to write reusable functions (def).

   PUZZLE DESIGN:
   - Long patrol path through an 8x8 grid with 4 traps scattered along it
   - Student must visit 4 checkpoints (servers) in sequence and nmap each
   - The path requires ~20 moves with scan+check at each step
   - Writing move+scan+check for every cell = 60+ lines of repetitive code
   - A def safe_advance(direction) function reduces this to ~15 lines
   - The puzzle TEACHES functions by making the alternative unbearable

   REFERENCE SOLUTION:
     def safe_advance(direction):
         result = agent.scan()
         for node in result:
             if node['direction'] == direction:
                 name = node['name']
                 if 'HONEYPOT' in name or 'IDS' in name or 'TRAP' in name:
                     agent.sweep(direction)
                     print("Trap disarmed: " + name)
         agent.move(direction)

     # Patrol route: east to checkpoint 1, south, west to checkpoint 2, etc.
     for i in range(4):
         safe_advance('east')
     safe_advance('south')
     safe_advance('south')
     agent.nmap('server-a')
     # ... continue patrol pattern

   GRID (8x8):
     [start]  [empty]  [empty]   [empty]    [honeypot] [empty]   [empty]   [wall]
     [empty]  [empty]  [empty]   [empty]    [empty]    [empty]   [empty]   [empty]
     [wall]   [empty]  [server-a][empty]    [empty]    [ids]     [empty]   [wall]
     [empty]  [empty]  [empty]   [empty]    [empty]    [empty]   [server-b][empty]
     [empty]  [honeypot2][empty] [empty]    [wall]     [empty]   [empty]   [empty]
     [wall]   [empty]  [empty]   [server-c] [empty]    [empty]   [honeypot3][wall]
     [empty]  [empty]  [empty]   [empty]    [empty]    [empty]   [empty]   [empty]
     [wall]   [wall]   [empty]   [empty]    [server-d] [wall]    [wall]    [wall]

   4 checkpoints (servers) scattered — must nmap all 4
   4 traps along common routes — must scan before each move
   ================================================================ */

var PYTHON_06_CONFIG = {
    id: 'python-06',
    title: 'PYTHON-06 / PATROL ROUTE',
    subtitle: 'Long patrol through hostile terrain. Write functions or drown in code.',
    category: 'python-ops',
    difficulty: 4,
    inputMode: 'python',
    agent: { tier: 3 },

    grid: {
        rows: 8, cols: 8,
        cells: [
            ['gateway',  'empty',     'empty',    'empty',    'honeypot',  'empty',     'empty',     'wall'],
            ['empty',    'empty',     'empty',    'empty',    'empty',     'empty',     'empty',     'empty'],
            ['wall',     'empty',     'server-a', 'empty',    'empty',     'ids-trap',  'empty',     'wall'],
            ['empty',    'empty',     'empty',    'empty',    'empty',     'empty',     'server-b',  'empty'],
            ['empty',    'honeypot2', 'empty',    'empty',    'wall',      'empty',     'empty',     'empty'],
            ['wall',     'empty',     'empty',    'server-c', 'empty',     'empty',     'honeypot3', 'wall'],
            ['empty',    'empty',     'empty',    'empty',    'empty',     'empty',     'empty',     'empty'],
            ['wall',     'wall',      'empty',    'empty',    'server-d',  'wall',      'wall',      'wall']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway':   { label: 'GATEWAY',       abbr: 'GTW', ip: '10.50.0.1',   desc: 'Entry point',                          ports: ['22/SSH','443/HTTPS'],                         os: 'Cisco IOS 15.4' },

        /* 4 checkpoint servers — must nmap all 4 */
        'server-a':  { label: 'CHECKPOINT-A',  abbr: 'CPA', ip: '10.50.0.11',  desc: 'Checkpoint Alpha — comms relay',        ports: ['22/SSH','443/HTTPS','8443/MGMT'],             os: 'Ubuntu 24.04 LTS' },
        'server-b':  { label: 'CHECKPOINT-B',  abbr: 'CPB', ip: '10.50.0.12',  desc: 'Checkpoint Bravo — sensor station',     ports: ['22/SSH','161/SNMP','514/SYSLOG'],             os: 'CentOS Stream 9' },
        'server-c':  { label: 'CHECKPOINT-C',  abbr: 'CPC', ip: '10.50.0.13',  desc: 'Checkpoint Charlie — data cache',       ports: ['22/SSH','3306/MySQL','9200/ELASTIC'],          os: 'RHEL 9.3' },
        'server-d':  { label: 'CHECKPOINT-D',  abbr: 'CPD', ip: '10.50.0.14',  desc: 'Checkpoint Delta — extraction point',   ports: ['22/SSH','8443/HTTPS','9090/ADMIN'],            os: 'Debian 12 Bookworm' },

        /* 4 traps along common patrol routes */
        'honeypot':  { label: 'HONEYPOT-1',    abbr: 'HP1', ip: '10.50.0.200', desc: 'Decoy — north corridor',                ports: ['22/SSH-FAKE','80/HTTP-TRAP'],                 os: 'Honeyd [TRAP]' },
        'honeypot2': { label: 'HONEYPOT-2',    abbr: 'HP2', ip: '10.50.0.201', desc: 'Decoy — west corridor',                 ports: ['22/SSH-FAKE','445/SMB-FAKE'],                 os: 'Honeyd [TRAP]' },
        'honeypot3': { label: 'HONEYPOT-3',    abbr: 'HP3', ip: '10.50.0.202', desc: 'Decoy — east corridor',                 ports: ['22/SSH-FAKE','3389/RDP-FAKE'],                os: 'Honeyd [TRAP]' },
        'ids-trap':  { label: 'IDS-SENSOR',    abbr: 'IDS', ip: '10.50.0.203', desc: 'Intrusion detection sensor',            ports: ['514/SYSLOG'],                                 os: 'Snort 3.1 [TRAP]' }
    },

    traps: ['honeypot', 'honeypot2', 'honeypot3', 'ids-trap'],

    /* No gates — pure navigation + nmap puzzle */
    gates: {},

    objectives: [
        { id: 'obj_0', label: 'CHECKPOINT A -- nmap the comms relay',             check: 'nmapTargets.has("server-a")' },
        { id: 'obj_1', label: 'CHECKPOINT B -- nmap the sensor station',           check: 'nmapTargets.has("server-b")' },
        { id: 'obj_2', label: 'CHECKPOINT C -- nmap the data cache',               check: 'nmapTargets.has("server-c")' },
        { id: 'obj_3', label: 'CHECKPOINT D -- nmap the extraction point',         check: 'nmapTargets.has("server-d")' },
        { id: 'obj_4', label: 'FULL RECON -- Discover 8+ nodes total',             check: 'nodesDiscovered.size >= 8' },
        { id: 'obj_5', label: 'STEALTH -- Complete with 2+ integrity remaining',   check: 'integrity >= 2' }
    },

    integrity: 4,  /* 4 pips because 4 traps — generous but still punishes carelessness */

    completion: {
        title: 'PATROL ROUTE',
        subtitle: 'All checkpoints secured. Patrol complete.',
        storageKey: 'hexworth_operator_python06'
    }
};
