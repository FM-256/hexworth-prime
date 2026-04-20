/* ================================================================
   PFI-OP-01 / THE PATROL -- Mission Config
   ================================================================
   Python for IT — Week 3 (Functions) — Mission 1 of 4
   Tier 2 mission. 6x6 grid — 36 cells.
   Forces students to define and call a basic function (DRY principle).

   DESIGN RATIONALE:
   - 4 servers placed in the corners of a 6x6 grid (NW, NE, SW, SE)
   - Student starts center-left at (col 2, row 3)
   - Each corner requires an identical patrol pattern: scan + move
   - Writing a patrol() function and calling it 4 times = ~10 lines
   - Doing it manually = ~36 lines of repetitive move/scan commands
   - 1 honeypot in the corridor punishes careless movement
   - Efficiency objective (30 commands max) forces function reuse
   - This is students' FIRST Operator mission — forgiving integrity of 4

   REFERENCE SOLUTION (what students should discover):
     def patrol(direction, steps):
         for i in range(steps):
             agent.scan()
             agent.move(direction)

     # Patrol each sector from center
     patrol('north', 3)    # reach NW area
     patrol('east', 5)     # sweep to NE
     patrol('south', 5)    # sweep to SE
     patrol('west', 5)     # sweep to SW

   WHY SEQUENTIAL FAILS:
   - 4 identical scan-and-move patterns across 4 sectors
   - Without a function, each sector needs ~9 move/scan lines
   - 36+ commands without reuse → fails the efficiency objective
   - The repetition IS the lesson: DRY = define once, call many

   GRID LAYOUT (6x6):
     [server-nw] [empty]    [empty]    [empty]    [empty]    [server-ne]
     [empty]     [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]     [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]     [empty]    [gateway]  [honeypot] [empty]    [empty]
     [empty]     [empty]    [empty]    [empty]    [empty]    [empty]
     [server-sw] [empty]    [empty]    [empty]    [empty]    [server-se]

   4 servers in corners — student must discover all 4 via patrol function
   ================================================================ */

var PFI_OP_01_CONFIG = {
    id: 'pfi-op-01',
    title: 'PFI-OP-01 / THE PATROL',
    subtitle: 'Define a patrol function to sweep 4 network sectors',
    category: 'python-ops',
    difficulty: 2,
    inputMode: 'python',

    agent: { tier: 2 },

    grid: {
        rows: 6, cols: 6,
        cells: [
            ['server-nw', 'empty',   'empty',   'empty',    'empty',   'server-ne'],
            ['empty',     'empty',   'empty',   'empty',    'empty',   'empty'],
            ['empty',     'empty',   'empty',   'empty',    'empty',   'empty'],
            ['empty',     'empty',   'gateway', 'honeypot', 'empty',   'empty'],
            ['empty',     'empty',   'empty',   'empty',    'empty',   'empty'],
            ['server-sw', 'empty',   'empty',   'empty',    'empty',   'server-se']
        ],
        start: { col: 2, row: 3 }
    },

    nodes: {
        /* -- Entry point -- */
        'gateway':   { label: 'GATEWAY',    abbr: 'GTW', ip: '10.40.0.1',   desc: 'Central corridor relay — your insertion point',   ports: ['22/SSH','443/HTTPS'],                       os: 'Cisco IOS 15.7' },

        /* -- 4 Target servers (one per corner sector) -- */
        'server-nw': { label: 'SERVER-NW',  abbr: 'SNW', ip: '10.40.1.10',  desc: 'Northwest sector — DNS resolver',                ports: ['22/SSH','53/DNS','953/RNDC'],               os: 'Ubuntu 24.04 LTS' },
        'server-ne': { label: 'SERVER-NE',  abbr: 'SNE', ip: '10.40.2.10',  desc: 'Northeast sector — web application server',      ports: ['22/SSH','80/HTTP','443/HTTPS'],              os: 'Windows Server 2022' },
        'server-sw': { label: 'SERVER-SW',  abbr: 'SSW', ip: '10.40.3.10',  desc: 'Southwest sector — log aggregation node',        ports: ['22/SSH','514/SYSLOG','9200/ELASTIC'],        os: 'Debian 12 Bookworm' },
        'server-se': { label: 'SERVER-SE',  abbr: 'SSE', ip: '10.40.4.10',  desc: 'Southeast sector — backup storage array',        ports: ['22/SSH','873/RSYNC','3260/ISCSI'],           os: 'RHEL 9.3' },

        /* -- Traps -- */
        'honeypot':  { label: 'HONEYPOT',   abbr: 'HNY', ip: '10.40.0.200', desc: 'Decoy node in corridor — triggers alert on scan', ports: ['22/SSH-FAKE','80/HTTP-TRAP'],               os: 'Honeyd 1.6 [TRAP]' }
    },

    traps: ['honeypot'],

    /* No gates — pure exploration + function practice */
    gates: {},

    objectives: [
        { id: 'obj_0', label: 'DISCOVER NW -- Find the DNS resolver',               check: 'nodesDiscovered.has("server-nw")' },
        { id: 'obj_1', label: 'DISCOVER NE -- Find the web application server',      check: 'nodesDiscovered.has("server-ne")' },
        { id: 'obj_2', label: 'DISCOVER SW -- Find the log aggregation node',        check: 'nodesDiscovered.has("server-sw")' },
        { id: 'obj_3', label: 'DISCOVER SE -- Find the backup storage array',        check: 'nodesDiscovered.has("server-se")' },
        { id: 'obj_4', label: 'EFFICIENCY -- Complete using 30 or fewer commands',    check: 'agentCmdCount <= 30' }
    ],

    integrity: 4,

    completion: {
        title: 'THE PATROL',
        subtitle: 'All four sectors swept. Function reuse confirmed.',
        storageKey: 'hexworth_operator_pfi_op_01'
    }
};
