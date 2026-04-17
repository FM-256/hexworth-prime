/* ================================================================
   PFI-OP-02 / THE SCANNER -- Mission Config
   ================================================================
   Python for IT — Week 3 (Functions) — Mission 2 of 2
   Tier 3 mission. 7x7 grid — 49 cells.
   Forces students to write parameterized functions with varying arguments.

   DESIGN RATIONALE:
   - 3 horizontal corridors of different lengths, separated by walls
   - Each corridor has a server at its far end
   - Student starts top-left and must scan each corridor east
   - Row 0: 6 cells east to Server-Alpha
   - Row 2: 5 cells east to Server-Bravo
   - Row 4: 3 cells east to Server-Charlie
   - Walls block vertical movement except via column 0 (left spine)
   - Writing scan_row(length) with a parameter = clean, reusable code
   - Calling scan_row(6), scan_row(5), scan_row(3) teaches parameters
   - Trap at (row 6, col 2) punishes blind southern exploration
   - Stealth objective (2+ integrity) encourages careful movement

   REFERENCE SOLUTION (what students should discover):
     def scan_row(length):
         for i in range(length):
             agent.scan()
             agent.move('east')

     def return_home(length):
         for i in range(length):
             agent.move('west')

     # Row 0: 6 cells east to Server-Alpha
     scan_row(6)
     return_home(6)

     # Move to row 2 via left spine
     agent.move('south')
     agent.move('south')

     # Row 2: 5 cells east to Server-Bravo
     scan_row(5)
     return_home(5)

     # Move to row 4
     agent.move('south')
     agent.move('south')

     # Row 4: 3 cells east to Server-Charlie
     scan_row(3)

   WHY SEQUENTIAL FAILS:
   - 3 corridors with different lengths but same scan pattern
   - Without parameters, student writes 3 separate hardcoded loops
   - The varying lengths force the function to accept an argument
   - return_home() reinforces the same parameterized pattern

   GRID LAYOUT (7 cols x 7 rows):
     [gateway] [empty]  [empty]    [empty]  [empty]    [empty]    [server-a]
     [empty]   [wall]   [wall]     [wall]   [wall]     [wall]     [wall]
     [empty]   [empty]  [empty]    [empty]  [empty]    [server-b] [wall]
     [empty]   [wall]   [wall]     [wall]   [wall]     [wall]     [wall]
     [empty]   [empty]  [empty]    [server-c] [wall]   [wall]     [wall]
     [empty]   [wall]   [wall]     [wall]   [wall]     [wall]     [wall]
     [empty]   [empty]  [honeypot] [wall]   [wall]     [wall]     [wall]

   Left spine (col 0) connects all rows — corridors shrink as you go down
   ================================================================ */

var PFI_OP_02_CONFIG = {
    id: 'pfi-op-02',
    title: 'PFI-OP-02 / THE SCANNER',
    subtitle: 'Write parameterized scan functions to sweep corridors of varying length',
    category: 'python-ops',
    difficulty: 3,
    inputMode: 'python',

    agent: { tier: 3 },

    grid: {
        rows: 7, cols: 7,
        cells: [
            ['gateway', 'empty', 'empty',    'empty',    'empty',    'empty',    'server-a'],
            ['empty',   'wall',  'wall',     'wall',     'wall',     'wall',     'wall'],
            ['empty',   'empty', 'empty',    'empty',    'empty',    'server-b', 'wall'],
            ['empty',   'wall',  'wall',     'wall',     'wall',     'wall',     'wall'],
            ['empty',   'empty', 'empty',    'server-c', 'wall',     'wall',     'wall'],
            ['empty',   'wall',  'wall',     'wall',     'wall',     'wall',     'wall'],
            ['empty',   'empty', 'honeypot', 'wall',     'wall',     'wall',     'wall']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        /* -- Entry point -- */
        'gateway':   { label: 'GATEWAY',         abbr: 'GTW', ip: '10.50.0.1',   desc: 'Perimeter gateway — your insertion point',          ports: ['22/SSH','443/HTTPS'],                       os: 'Cisco IOS 15.7' },

        /* -- 3 Target servers (one per corridor, decreasing distance) -- */
        'server-a':  { label: 'SERVER-ALPHA',    abbr: 'SRA', ip: '10.50.1.10',  desc: 'Corridor 1 endpoint — mail relay server',           ports: ['22/SSH','25/SMTP','587/SUBMISSION'],         os: 'Ubuntu 24.04 LTS' },
        'server-b':  { label: 'SERVER-BRAVO',    abbr: 'SRB', ip: '10.50.2.10',  desc: 'Corridor 2 endpoint — RADIUS authentication node',  ports: ['22/SSH','1812/RADIUS','1813/RADIUS-ACCT'],   os: 'Windows Server 2022' },
        'server-c':  { label: 'SERVER-CHARLIE',  abbr: 'SRC', ip: '10.50.3.10',  desc: 'Corridor 3 endpoint — NTP time server',             ports: ['22/SSH','123/NTP'],                          os: 'Debian 12 Bookworm' },

        /* -- Traps -- */
        'honeypot':  { label: 'HONEYPOT',        abbr: 'HNY', ip: '10.50.0.200', desc: 'Decoy node past corridor 3 — triggers alert',       ports: ['22/SSH-FAKE','80/HTTP-TRAP'],                os: 'Honeyd 1.6 [TRAP]' }
    },

    traps: ['honeypot'],

    /* No gates — focus is on parameterized function calls */
    gates: {},

    objectives: [
        { id: 'obj_0', label: 'DISCOVER ALPHA -- Find the mail relay server',          check: 'nodesDiscovered.has("server-a")' },
        { id: 'obj_1', label: 'DISCOVER BRAVO -- Find the RADIUS authentication node', check: 'nodesDiscovered.has("server-b")' },
        { id: 'obj_2', label: 'DISCOVER CHARLIE -- Find the NTP time server',          check: 'nodesDiscovered.has("server-c")' },
        { id: 'obj_3', label: 'STEALTH -- Complete with 2+ integrity remaining',        check: 'integrity >= 2' }
    ],

    integrity: 3,

    completion: {
        title: 'THE SCANNER',
        subtitle: 'All three corridors swept. Parameterized recon confirmed.',
        storageKey: 'hexworth_operator_pfi_op_02'
    }
};
