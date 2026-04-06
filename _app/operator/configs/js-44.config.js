/* ================================================================
   JS-44 / ISLAND HOPPING -- Mission Config
   ================================================================
   Tier 6 mission. 11x11 grid -- 121 cells.
   DISCONNECTED GRID ZONES. Islands of cells separated by walls and
   holes -- the only way between them is bridge (jump) and tunnel.

   DESIGN RATIONALE:
   - 11x11 grid divided into 4 disconnected "islands" by wall barriers
   - Islands are NOT connected by normal movement paths
   - The ONLY way between islands: tunnel through walls or jump over holes
   - 3 holes placed at island borders (bridges between islands)
   - 2 fires inside islands blocking server access
   - Heavy walls surround each island -- no way around, must tunnel
   - Student must plan a ROUTE across all 4 islands
   - Advanced async control flow: sequential island-to-island traversal

   JS SKILL: Advanced async control flow
   - async/await for sequential island traversal
   - Each island requires a different approach: tunnel in, handle threats, scan
   - Planning matters: which island first? Where are the holes to jump?
   - Real-world parallel: multi-datacenter operations, cross-region deployments

   REFERENCE SOLUTION:
     async function islandHop() {
         // Island traversal -- tunnel through walls, jump holes between islands
         const handleNode = async ({ name, direction }) => {
             if (name.includes('HOLE'))   return await agent.jump(direction);
             if (name.includes('FIRE'))   return await agent.extinguish(direction);
             if (name === 'WALL')         return await agent.tunnel(direction);
             return await agent.move(direction);
         };

         // Island 1 -> scan and clear
         let results = await agent.scan();
         for (const node of results) await handleNode(node);

         // Tunnel to Island 2
         await agent.tunnel('east');
         results = await agent.scan();
         for (const node of results) await handleNode(node);

         // Jump to Island 3
         await agent.jump('south');
         results = await agent.scan();
         for (const node of results) await handleNode(node);

         // Tunnel to Island 4 -> extraction
         await agent.tunnel('east');
         results = await agent.scan();
         for (const node of results) await handleNode(node);
     }
     islandHop();

   GRID LAYOUT (11x11):
     [start]    [empty]    [server-a] [wall]     [wall]     [empty]    [empty]    [server-b] [wall]     [empty]    [empty]
     [empty]    [empty]    [empty]    [wall]     [wall]     [empty]    [empty]    [empty]    [wall]     [empty]    [empty]
     [empty]    [fire-1]   [empty]    [wall]     [wall]     [hole-1]   [empty]    [empty]    [wall]     [wall]     [wall]
     [wall]     [wall]     [wall]     [wall]     [wall]     [empty]    [empty]    [fire-2]   [wall]     [wall]     [wall]
     [empty]    [empty]    [empty]    [empty]    [wall]     [wall]     [wall]     [wall]     [wall]     [empty]    [empty]
     [empty]    [empty]    [hole-2]   [empty]    [wall]     [wall]     [wall]     [wall]     [wall]     [empty]    [empty]
     [empty]    [server-c] [empty]    [empty]    [wall]     [wall]     [wall]     [empty]    [empty]    [empty]    [wall]
     [empty]    [empty]    [empty]    [wall]     [wall]     [wall]     [wall]     [empty]    [empty]    [server-d] [wall]
     [wall]     [wall]     [wall]     [wall]     [wall]     [empty]    [empty]    [empty]    [empty]    [empty]    [wall]
     [empty]    [empty]    [empty]    [empty]    [wall]     [empty]    [hole-3]   [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [wall]     [empty]    [empty]    [empty]    [server-e] [empty]    [target]

   4 disconnected islands. 3 holes + 2 fires + heavy walls. Bridge and tunnel only.
   ================================================================ */

var JS_44_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-44',
    title: 'JS-44 / ISLAND HOPPING',
    subtitle: 'Disconnected zones. Tunnel and jump are your only way across.',
    category: 'javascript-ops',
    difficulty: 4,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 4 = full capabilities) -- */
    agent: { tier: 4 },

    /* -- 11x11 Grid -- */
    grid: {
        rows: 11, cols: 11,
        cells: [
            /* Row 0  */ ['gateway',  'empty',    'server-a', 'wall',     'wall',     'empty',    'empty',    'server-b', 'wall',     'empty',    'empty'],
            /* Row 1  */ ['empty',    'empty',    'empty',    'wall',     'wall',     'empty',    'empty',    'empty',    'wall',     'empty',    'empty'],
            /* Row 2  */ ['empty',    'fire-1',   'empty',    'wall',     'wall',     'hole-1',   'empty',    'empty',    'wall',     'wall',     'wall'],
            /* Row 3  */ ['wall',     'wall',     'wall',     'wall',     'wall',     'empty',    'empty',    'fire-2',   'wall',     'wall',     'wall'],
            /* Row 4  */ ['empty',    'empty',    'empty',    'empty',    'wall',     'wall',     'wall',     'wall',     'wall',     'empty',    'empty'],
            /* Row 5  */ ['empty',    'empty',    'hole-2',   'empty',    'wall',     'wall',     'wall',     'wall',     'wall',     'empty',    'empty'],
            /* Row 6  */ ['empty',    'server-c', 'empty',    'empty',    'wall',     'wall',     'wall',     'empty',    'empty',    'empty',    'wall'],
            /* Row 7  */ ['empty',    'empty',    'empty',    'wall',     'wall',     'wall',     'wall',     'empty',    'empty',    'server-d', 'wall'],
            /* Row 8  */ ['wall',     'wall',     'wall',     'wall',     'wall',     'empty',    'empty',    'empty',    'empty',    'empty',    'wall'],
            /* Row 9  */ ['empty',    'empty',    'empty',    'empty',    'wall',     'empty',    'hole-3',   'empty',    'empty',    'empty',    'empty'],
            /* Row 10 */ ['empty',    'empty',    'empty',    'empty',    'wall',     'empty',    'empty',    'empty',    'server-e', 'empty',    'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':  { label: 'GATEWAY',       abbr: 'GTW', ip: '10.440.1.1',   desc: 'Island 1 entry -- archipelago network',                  ports: ['22/SSH', '443/HTTPS'],                    os: 'Cisco Nexus 9300' },

        /* 5 target servers -- distributed across islands */
        'server-a': { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.440.1.10',  desc: 'Island 1 server -- local DNS resolver',                  ports: ['22/SSH', '53/DNS', '443/HTTPS'],          os: 'Ubuntu 24.04 LTS' },
        'server-b': { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.440.1.11',  desc: 'Island 2 server -- transit gateway',                     ports: ['22/SSH', '443/HTTPS', '179/BGP'],         os: 'Debian 12 Bookworm' },
        'server-c': { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.440.1.12',  desc: 'Island 3 server -- storage array controller',            ports: ['22/SSH', '443/HTTPS', '3260/ISCSI'],      os: 'CentOS Stream 9' },
        'server-d': { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.440.1.13',  desc: 'Island 4 server -- compute cluster head',                ports: ['22/SSH', '443/HTTPS', '6443/K8S'],        os: 'RHEL 9.3' },
        'server-e': { label: 'SERVER-ECHO',    abbr: 'SRE', ip: '10.440.1.14',  desc: 'Island 4 server -- extraction staging',                  ports: ['22/SSH', '443/HTTPS', '8443/RANCHER'],    os: 'Windows Server 2022' },

        /* Extraction point */
        'target':   { label: 'EXTRACTION',     abbr: 'EXT', ip: '10.440.1.99',  desc: 'Extraction point -- all islands mapped',                 ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* 3 holes -- jump required (island bridges) */
        'hole-1':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Island gap -- jump to bridge',                                     ports: [] },
        'hole-2':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Archipelago void -- jump to bridge',                               ports: [] },
        'hole-3':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Transit gap -- jump to bridge',                                    ports: [] },

        /* 2 fires -- extinguish required */
        'fire-1':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Island 1 switchfire -- extinguish to pass',                        ports: [] },
        'fire-2':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Island 2 overload blaze -- extinguish to pass',                    ports: [] }
    },

    /* No traps */
    traps: [],

    /* Obstacles: 3 holes + 2 fires (no enemies -- focus on traversal) */
    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3'],
        fires: ['fire-1', 'fire-2']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER -- Map all 5 island servers',                      check: 'nodesDiscovered.has("server-a") && nodesDiscovered.has("server-b") && nodesDiscovered.has("server-c") && nodesDiscovered.has("server-d") && nodesDiscovered.has("server-e")' },
        { id: 'obj_1', label: 'BRIDGE -- Jump all 3 island gaps',                          check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3")' },
        { id: 'obj_2', label: 'NAVIGATE -- Handle both fires',                             check: 'nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2")' },
        { id: 'obj_3', label: 'EXTRACTION -- Reach the extraction point',                  check: 'nodesDiscovered.has("target")' }
    ],

    /* 5 integrity -- 5 obstacles + many walls to tunnel */
    integrity: 5,

    /* -- Completion screen -- */
    completion: {
        title: 'ISLAND HOPPING',
        subtitle: 'Four islands mapped. Tunneled through walls. Bridged the gaps. Archipelago conquered.',
        storageKey: 'hexworth_operator_js44'
    }
};
