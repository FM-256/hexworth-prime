/* ================================================================
   PFI-OP-04 / THE ARCHITECT -- Mission Config
   ================================================================
   Python for IT — Week 3 (Functions) — Mission 4
   Tier 4 mission. 8x8 grid — 64 cells.
   Forces students to compose complex behavior from simple helper
   functions — building blocks approach (ties to Turtle thinking).

   DESIGN RATIONALE:
   - Grid is divided into 4 quadrants by a cross-shaped wall
   - A central corridor (row 3-4, col 4 and col 0-7 row 4 gap) connects all 4
   - Each quadrant has 1 server in its inner corner (row 2/col 2, etc.)
   - Student must navigate to each quadrant and scan for its server
   - Writing move_n(direction, steps) and scan_quadrant() helpers
     then calling them with different parameters = the lesson
   - Manual approach = 70+ lines of move/scan
   - Function building-blocks approach = ~25 lines
   - Single trap at (7, 7) punishes blind SE corner exploration
   - Bonus objective rewards clean function decomposition

   REFERENCE SOLUTION (what students should discover):
     def move_n(direction, steps):
         for i in range(steps):
             agent.move(direction)

     def scan_quadrant(east_steps, south_steps):
         for i in range(south_steps):
             agent.scan()
             agent.move('south')
         for i in range(east_steps):
             agent.scan()
             agent.move('east')

     def return_north(steps):
         move_n('north', steps)

     def return_west(steps):
         move_n('west', steps)

     # NW quadrant — srv-a at (2, 2)
     scan_quadrant(2, 2)
     return_west(2)
     return_north(2)

     # Navigate to NE via corridor
     move_n('east', 5)
     scan_quadrant(2, 2)
     return_west(2)
     return_north(2)

     # Navigate to SW via corridor
     move_n('south', 5)
     scan_quadrant(2, 2)
     return_west(2)
     return_north(2)

     # Navigate to SE
     move_n('east', 5)
     scan_quadrant(2, 2)

   WHY SEQUENTIAL FAILS:
   - 4 quadrants with identical L-shaped scan patterns
   - Without functions, each quadrant needs ~15 lines
   - 64 cells with fog of war — can't guess server positions
   - Trap at (7, 7) costs integrity if blindly exploring
   - The symmetry IS the lesson: same function, different parameters

   GRID LAYOUT (8 cols x 8 rows):
     [gateway]  [empty]    [empty]    [empty]    [wall]     [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [wall]     [empty]    [empty]    [empty]
     [empty]    [empty]    [srv-a]    [empty]    [wall]     [empty]    [srv-c]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [wall]     [wall]     [wall]     [wall]     [empty]    [wall]     [wall]     [wall]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [srv-b]    [empty]    [wall]     [empty]    [srv-d]    [empty]
     [empty]    [empty]    [empty]    [empty]    [wall]     [empty]    [empty]    [trap-a]

   4 quadrants, 4 servers, 1 trap, cross-shaped wall with central intersection
   ================================================================ */

var PFI_OP_04_CONFIG = {
    id: 'pfi-op-04',
    title: 'PFI-OP-04 / THE ARCHITECT',
    subtitle: 'Compose helper functions to navigate 4 network quadrants',
    category: 'python-ops',
    difficulty: 4,
    inputMode: 'python',

    agent: { tier: 4 },

    grid: {
        rows: 8, cols: 8,
        cells: [
            /* Row 0 */ ['gateway', 'empty',  'empty',  'empty',  'wall',   'empty',  'empty',  'empty'],
            /* Row 1 */ ['empty',   'empty',  'empty',  'empty',  'wall',   'empty',  'empty',  'empty'],
            /* Row 2 */ ['empty',   'empty',  'srv-a',  'empty',  'wall',   'empty',  'srv-c',  'empty'],
            /* Row 3 */ ['empty',   'empty',  'empty',  'empty',  'empty',  'empty',  'empty',  'empty'],
            /* Row 4 */ ['wall',    'wall',   'wall',   'wall',   'empty',  'wall',   'wall',   'wall'],
            /* Row 5 */ ['empty',   'empty',  'empty',  'empty',  'empty',  'empty',  'empty',  'empty'],
            /* Row 6 */ ['empty',   'empty',  'srv-b',  'empty',  'wall',   'empty',  'srv-d',  'empty'],
            /* Row 7 */ ['empty',   'empty',  'empty',  'empty',  'wall',   'empty',  'empty',  'trap-a']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        /* -- Entry point -- */
        'gateway':  { label: 'GATEWAY',        abbr: 'GTW', ip: '10.60.0.1',   desc: 'Network core switch — your insertion point',            ports: ['22/SSH','443/HTTPS'],                          os: 'Arista EOS 4.31' },

        /* -- NW quadrant server -- */
        'srv-a':    { label: 'SERVER-ALPHA',    abbr: 'SRA', ip: '10.60.1.10',  desc: 'NW quadrant — RADIUS authentication server',           ports: ['22/SSH','1812/RADIUS','1813/RADACCT'],         os: 'FreeRADIUS 3.2 on Ubuntu 24.04' },

        /* -- SW quadrant server -- */
        'srv-b':    { label: 'SERVER-BRAVO',    abbr: 'SRB', ip: '10.60.2.10',  desc: 'SW quadrant — Network monitoring collector',            ports: ['22/SSH','161/SNMP','162/SNMP-TRAP','8080/HTTP'], os: 'Zabbix 7.0 on Debian 12' },

        /* -- NE quadrant server -- */
        'srv-c':    { label: 'SERVER-CHARLIE',  abbr: 'SRC', ip: '10.60.3.10',  desc: 'NE quadrant — Configuration management server',        ports: ['22/SSH','8140/PUPPET','443/HTTPS'],             os: 'Puppet Enterprise on RHEL 9.3' },

        /* -- SE quadrant server -- */
        'srv-d':    { label: 'SERVER-DELTA',    abbr: 'SRD', ip: '10.60.4.10',  desc: 'SE quadrant — Vulnerability scanner appliance',        ports: ['22/SSH','8834/NESSUS','443/HTTPS'],             os: 'Tenable Nessus 10.7 on CentOS Stream 9' },

        /* -- Trap -- */
        'trap-a':   { label: 'HONEYPOT',        abbr: 'TRP', ip: '10.60.0.200', desc: 'SE corner decoy — triggers full network alert',        ports: ['22/SSH-FAKE','8834/NESSUS-FAKE'],               os: 'Cowrie 2.5 [TRAP]' }
    },

    traps: ['trap-a'],

    /* No gates — pure exploration + function composition */
    gates: {},

    objectives: [
        { id: 'obj_0', label: 'DISCOVER ALPHA -- Find the RADIUS server (NW quadrant)',          check: 'nodesDiscovered.has("srv-a")' },
        { id: 'obj_1', label: 'DISCOVER BRAVO -- Find the monitoring collector (SW quadrant)',    check: 'nodesDiscovered.has("srv-b")' },
        { id: 'obj_2', label: 'DISCOVER CHARLIE -- Find the config management server (NE)',       check: 'nodesDiscovered.has("srv-c")' },
        { id: 'obj_3', label: 'DISCOVER DELTA -- Find the vulnerability scanner (SE quadrant)',   check: 'nodesDiscovered.has("srv-d")' },
        { id: 'obj_4', label: 'ARCHITECT BONUS -- Complete using 40 or fewer commands',           check: 'agentCmdCount <= 40' }
    ],

    integrity: 3,

    completion: {
        title: 'THE ARCHITECT',
        subtitle: 'All four quadrants mapped. Building-block functions confirmed.',
        storageKey: 'hexworth_operator_pfi_op_04'
    }
};
