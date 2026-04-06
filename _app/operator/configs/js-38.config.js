/* ================================================================
   JS-38 / TUNNEL VISION -- Mission Config
   ================================================================
   Tier 6 mission. 10x10 grid -- 100 cells.
   TUNNEL MECHANIC INTRODUCED. Walls are no longer barriers.
   The student learns agent.tunnel(direction) -- phase through walls
   to reach otherwise inaccessible network zones.

   DESIGN RATIONALE:
   - 10x10 grid packed with heavy walls creating isolated chambers
   - 3 holes + 2 fires scattered along paths between chambers
   - Walls block agent.move() but NOT agent.tunnel()
   - Student must recognize when a wall is the only path forward
   - Tunnel is the 5th permanent tool: scan, move, jump, extinguish, fight, tunnel
   - 4 servers hidden behind wall barriers -- no way to reach them without tunneling
   - Forces strategic thinking: scan reveals what's BEYOND walls

   JS SKILL: agent.tunnel(direction) -- phasing through walls
   - Walls appear in scan results but normally block movement
   - agent.tunnel(direction) passes through a wall cell to the cell beyond it
   - Student must identify walls in scan results and decide: tunnel or go around?
   - Combines with existing obstacle handling: tunnel to a hole? jump after tunneling.

   REFERENCE SOLUTION:
     async function tunnelRun() {
         let results = await agent.scan();
         for (const node of results) {
             const { name, direction } = node;
             if (name.includes('HOLE')) {
                 await agent.jump(direction);
             } else if (name.includes('FIRE')) {
                 await agent.extinguish(direction);
             } else if (name === 'WALL') {
                 await agent.tunnel(direction);
             } else {
                 await agent.move(direction);
             }
         }
     }
     tunnelRun();

   WHY TUNNEL CHANGES EVERYTHING:
   - Previous levels: walls = hard boundary, go around
   - Now: walls = optional boundary, tunnel through if needed
   - Opens up grid design: isolated chambers connected only by tunneling
   - Real-world parallel: VPN tunneling through firewalls, SSH tunneling

   GRID LAYOUT (10x10):
     [start]    [empty]    [wall]     [server-a] [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [wall]     [empty]    [empty]    [empty]    [wall]     [empty]    [empty]    [empty]
     [empty]    [hole-1]   [wall]     [empty]    [wall]     [wall]     [wall]     [empty]    [server-b] [empty]
     [empty]    [empty]    [empty]    [empty]    [wall]     [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [fire-1]   [empty]    [wall]     [empty]    [hole-2]   [empty]    [wall]     [wall]
     [wall]     [wall]     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [wall]     [empty]
     [empty]    [empty]    [empty]    [wall]     [empty]    [wall]     [empty]    [empty]    [wall]     [server-c]
     [empty]    [empty]    [hole-3]   [wall]     [empty]    [wall]     [fire-2]   [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [wall]     [empty]    [empty]    [empty]    [empty]    [server-d] [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [target]

   Heavy walls isolate 4 server chambers. 3 holes + 2 fires. Tunnel required.
   ================================================================ */

var JS_38_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-38',
    title: 'JS-38 / TUNNEL VISION',
    subtitle: 'Walls are not walls anymore. Learn to tunnel.',
    category: 'javascript-ops',
    difficulty: 4,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 4 = full capabilities including tunnel) -- */
    agent: { tier: 4 },

    /* -- 10x10 Grid -- */
    grid: {
        rows: 10, cols: 10,
        cells: [
            /* Row 0 */ ['gateway',  'empty',    'wall',     'server-a', 'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 1 */ ['empty',    'empty',    'wall',     'empty',    'empty',    'empty',    'wall',     'empty',    'empty',    'empty'],
            /* Row 2 */ ['empty',    'hole-1',   'wall',     'empty',    'wall',     'wall',     'wall',     'empty',    'server-b', 'empty'],
            /* Row 3 */ ['empty',    'empty',    'empty',    'empty',    'wall',     'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 4 */ ['empty',    'empty',    'fire-1',   'empty',    'wall',     'empty',    'hole-2',   'empty',    'wall',     'wall'],
            /* Row 5 */ ['wall',     'wall',     'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'wall',     'empty'],
            /* Row 6 */ ['empty',    'empty',    'empty',    'wall',     'empty',    'wall',     'empty',    'empty',    'wall',     'server-c'],
            /* Row 7 */ ['empty',    'empty',    'hole-3',   'wall',     'empty',    'wall',     'fire-2',   'empty',    'empty',    'empty'],
            /* Row 8 */ ['empty',    'empty',    'empty',    'wall',     'empty',    'empty',    'empty',    'empty',    'server-d', 'empty'],
            /* Row 9 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':  { label: 'GATEWAY',       abbr: 'GTW', ip: '10.380.1.1',   desc: 'Perimeter firewall -- tunneling begins here',            ports: ['22/SSH', '443/HTTPS'],                    os: 'Cisco Firepower 2130' },

        /* 4 target servers -- walled-off segments */
        'server-a': { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.380.1.10',  desc: 'DMZ web server -- behind firewall segment',              ports: ['22/SSH', '80/HTTP', '443/HTTPS'],         os: 'Ubuntu 24.04 LTS' },
        'server-b': { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.380.1.11',  desc: 'Internal API gateway -- isolated VLAN',                  ports: ['22/SSH', '8080/HTTP', '8443/HTTPS'],      os: 'Debian 12 Bookworm' },
        'server-c': { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.380.1.12',  desc: 'Database cluster -- deep network zone',                  ports: ['22/SSH', '3306/MySQL', '27017/MongoDB'],  os: 'CentOS Stream 9' },
        'server-d': { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.380.1.13',  desc: 'Backup vault -- air-gapped segment',                     ports: ['22/SSH', '443/HTTPS', '9392/VEEAM'],      os: 'RHEL 9.3' },

        /* Extraction point */
        'target':   { label: 'EXTRACTION',     abbr: 'EXT', ip: '10.380.1.99',  desc: 'Extraction point -- tunneling mastered',                 ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* 3 holes -- jump required */
        'hole-1':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Network fabric gap -- jump to cross',                              ports: [] },
        'hole-2':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Routing void -- jump to cross',                                    ports: [] },
        'hole-3':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Backbone fracture -- jump to cross',                               ports: [] },

        /* 2 fires -- extinguish required */
        'fire-1':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Firewall overload blaze -- extinguish to pass',                    ports: [] },
        'fire-2':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Circuit meltdown -- extinguish to pass',                           ports: [] }
    },

    /* No traps */
    traps: [],

    /* Obstacles: holes and fires (no enemies -- focus on tunnel mechanic) */
    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3'],
        fires: ['fire-1', 'fire-2']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'TUNNEL -- Phase through walls to reach isolated servers',  check: 'nodesDiscovered.has("server-a") && nodesDiscovered.has("server-b") && nodesDiscovered.has("server-c") && nodesDiscovered.has("server-d")' },
        { id: 'obj_1', label: 'NAVIGATE -- Handle all holes and fires',                   check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3") && nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2")' },
        { id: 'obj_2', label: 'EXTRACTION -- Reach the extraction point',                 check: 'nodesDiscovered.has("target")' }
    ],

    /* 5 integrity -- 5 obstacles, many walls to tunnel */
    integrity: 5,

    /* -- Completion screen -- */
    completion: {
        title: 'TUNNEL VISION',
        subtitle: 'Walls breached. Four isolated servers discovered. The tunnel tool changes everything.',
        storageKey: 'hexworth_operator_js38'
    }
};
