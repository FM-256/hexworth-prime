/* ================================================================
   JS-39 / BACKTRACK -- MAZE -- Mission Config
   ================================================================
   Tier 6 mission. 10x10 grid -- 100 cells.
   BACKTRACK LEVEL. Return to a maze-style grid -- but NOW you can tunnel.
   Previously impassable walls are now optional routes.

   DESIGN RATIONALE:
   - Classic maze structure with corridors and dead ends
   - 2 holes + 2 fires placed at choke points
   - Walls define maze corridors, but tunnel lets the student shortcut
   - The backtrack theme: "remember this kind of grid? Now you have new power"
   - Student chooses: follow the maze honestly, or tunnel through walls?
   - 4 servers placed in maze dead ends -- some only reachable by tunneling
   - Difficulty 3 -- the maze is the challenge, not obstacle density

   JS SKILL: Strategic decision-making with tunnel
   - When scan shows a wall, student decides: tunnel or navigate around?
   - Efficiency matters -- tunneling is faster but costs nothing
   - The student's code must handle walls as EITHER obstacles OR shortcuts
   - Reinforces if/else branching with a new option

   REFERENCE SOLUTION:
     async function solveMaze() {
         let results = await agent.scan();
         for (const { name, direction } of results) {
             if (name.includes('HOLE')) {
                 await agent.jump(direction);
             } else if (name.includes('FIRE')) {
                 await agent.extinguish(direction);
             } else if (name === 'WALL') {
                 // Tunnel through maze walls for shortcuts
                 await agent.tunnel(direction);
             } else {
                 await agent.move(direction);
             }
         }
     }
     solveMaze();

   GRID LAYOUT (10x10):
     [start]    [empty]    [wall]     [empty]    [empty]    [wall]     [empty]    [empty]    [empty]    [empty]
     [empty]    [wall]     [wall]     [empty]    [hole-1]   [wall]     [empty]    [wall]     [server-a] [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [wall]     [empty]    [empty]
     [wall]     [wall]     [empty]    [wall]     [wall]     [empty]    [empty]    [empty]    [empty]    [wall]
     [empty]    [empty]    [empty]    [wall]     [server-b] [empty]    [wall]     [wall]     [empty]    [wall]
     [empty]    [wall]     [empty]    [empty]    [empty]    [empty]    [wall]     [empty]    [empty]    [empty]
     [empty]    [wall]     [fire-1]   [wall]     [empty]    [empty]    [empty]    [empty]    [wall]     [empty]
     [empty]    [empty]    [empty]    [wall]     [empty]    [wall]     [empty]    [server-c] [wall]     [empty]
     [wall]     [empty]    [empty]    [empty]    [empty]    [wall]     [hole-2]   [empty]    [empty]    [empty]
     [wall]     [empty]    [fire-2]   [empty]    [empty]    [empty]    [empty]    [empty]    [server-d] [target]

   Maze-like corridors. 2 holes + 2 fires. Tunnel through walls for shortcuts.
   ================================================================ */

var JS_39_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-39',
    title: 'JS-39 / BACKTRACK -- MAZE',
    subtitle: 'The maze returns. But now you can tunnel through walls.',
    category: 'javascript-ops',
    difficulty: 3,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 4 = full capabilities) -- */
    agent: { tier: 4 },

    /* -- 10x10 Grid -- */
    grid: {
        rows: 10, cols: 10,
        cells: [
            /* Row 0 */ ['gateway',  'empty',    'wall',     'empty',    'empty',    'wall',     'empty',    'empty',    'empty',    'empty'],
            /* Row 1 */ ['empty',    'wall',     'wall',     'empty',    'hole-1',   'wall',     'empty',    'wall',     'server-a', 'empty'],
            /* Row 2 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'wall',     'empty',    'empty'],
            /* Row 3 */ ['wall',     'wall',     'empty',    'wall',     'wall',     'empty',    'empty',    'empty',    'empty',    'wall'],
            /* Row 4 */ ['empty',    'empty',    'empty',    'wall',     'server-b', 'empty',    'wall',     'wall',     'empty',    'wall'],
            /* Row 5 */ ['empty',    'wall',     'empty',    'empty',    'empty',    'empty',    'wall',     'empty',    'empty',    'empty'],
            /* Row 6 */ ['empty',    'wall',     'fire-1',   'wall',     'empty',    'empty',    'empty',    'empty',    'wall',     'empty'],
            /* Row 7 */ ['empty',    'empty',    'empty',    'wall',     'empty',    'wall',     'empty',    'server-c', 'wall',     'empty'],
            /* Row 8 */ ['wall',     'empty',    'empty',    'empty',    'empty',    'wall',     'hole-2',   'empty',    'empty',    'empty'],
            /* Row 9 */ ['wall',     'empty',    'fire-2',   'empty',    'empty',    'empty',    'empty',    'empty',    'server-d', 'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':  { label: 'GATEWAY',       abbr: 'GTW', ip: '10.390.1.1',   desc: 'Maze perimeter -- corridors and shortcuts await',        ports: ['22/SSH', '443/HTTPS'],                    os: 'Fortinet FortiGate 100F' },

        /* 4 target servers -- hidden in maze dead ends */
        'server-a': { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.390.1.10',  desc: 'Payroll server -- maze dead end northeast',              ports: ['22/SSH', '443/HTTPS', '1433/MSSQL'],      os: 'Windows Server 2022' },
        'server-b': { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.390.1.11',  desc: 'HR database -- maze center alcove',                      ports: ['22/SSH', '5432/PostgreSQL'],               os: 'Ubuntu 24.04 LTS' },
        'server-c': { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.390.1.12',  desc: 'Email gateway -- deep corridor',                         ports: ['22/SSH', '25/SMTP', '993/IMAPS'],         os: 'Debian 12 Bookworm' },
        'server-d': { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.390.1.13',  desc: 'Compliance vault -- maze southeast corner',              ports: ['22/SSH', '443/HTTPS', '8200/VAULT'],      os: 'RHEL 9.3' },

        /* Extraction point */
        'target':   { label: 'EXTRACTION',     abbr: 'EXT', ip: '10.390.1.99',  desc: 'Extraction point -- maze solved',                        ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* 2 holes -- jump required */
        'hole-1':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Corridor collapse -- jump to cross',                               ports: [] },
        'hole-2':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Sinkhole in passage -- jump to cross',                             ports: [] },

        /* 2 fires -- extinguish required */
        'fire-1':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Electrical fire in corridor -- extinguish to pass',                 ports: [] },
        'fire-2':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Server room blaze -- extinguish to pass',                          ports: [] }
    },

    /* No traps */
    traps: [],

    /* Obstacles: moderate density */
    obstacles: {
        holes: ['hole-1', 'hole-2'],
        fires: ['fire-1', 'fire-2']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'NAVIGATE -- Find all 4 servers in the maze',               check: 'nodesDiscovered.has("server-a") && nodesDiscovered.has("server-b") && nodesDiscovered.has("server-c") && nodesDiscovered.has("server-d")' },
        { id: 'obj_1', label: 'OBSTACLES -- Handle all holes and fires',                   check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2")' },
        { id: 'obj_2', label: 'EXTRACTION -- Reach the extraction point',                  check: 'nodesDiscovered.has("target")' }
    ],

    /* 5 integrity -- 4 obstacles, maze walls */
    integrity: 5,

    /* -- Completion screen -- */
    completion: {
        title: 'BACKTRACK -- MAZE',
        subtitle: 'Maze conquered with tunnel shortcuts. Walls are optional now.',
        storageKey: 'hexworth_operator_js39'
    }
};
