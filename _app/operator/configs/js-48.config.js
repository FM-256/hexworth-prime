/* ================================================================
   JS-48 / DEEP STATE -- Mission Config
   ================================================================
   Tier 6 mission. 12x12 grid -- 144 cells.
   reduce() -- aggregate data across multiple scans. The student uses
   Array.reduce() to accumulate threat intelligence as they navigate.

   DESIGN RATIONALE:
   - 12x12 grid with heavy obstacle density: 4 holes + 3 fires + 4 enemies
   - 11 obstacles + heavy walls = dense, complex navigation
   - Student must SCAN multiple times and AGGREGATE results using reduce()
   - reduce() counts threats, classifies zones, builds intelligence reports
   - The grid is too large to navigate blindly -- intelligence gathering required
   - 5 servers + extraction behind layers of obstacles and walls

   JS SKILL: Array.reduce() -- aggregate and transform
   - reduce((acc, item) => ..., initialValue) -- the most powerful array method
   - Count threats: results.reduce((count, n) => n.name.includes('ENEMY') ? count + 1 : count, 0)
   - Build reports: results.reduce((report, n) => { report[n.type] = (report[n.type] || 0) + 1; return report; }, {})
   - Accumulate across multiple scans: total threat count grows
   - Real-world: log aggregation, metrics collection, state machines

   REFERENCE SOLUTION:
     async function deepState() {
         const handle = async ({ name, direction }) => {
             if (name.includes('HOLE'))   return await agent.jump(direction);
             if (name.includes('FIRE'))   return await agent.extinguish(direction);
             if (name.includes('ENEMY'))  return await agent.fight(direction);
             if (name.includes('LOCKED')) return await agent.unlock(direction);
             if (name === 'WALL')         return await agent.tunnel(direction);
             return await agent.move(direction);
         };

         // Accumulate threat intelligence across scans
         let totalThreats = 0;
         let scanCount = 0;

         while (true) {
             const results = await agent.scan();
             if (results.length === 0) break;

             scanCount++;

             // Use reduce to count threats in this scan
             const threatCount = results.reduce((acc, n) =>
                 n.name.includes('ENEMY') ? acc + 1 : acc, 0);
             totalThreats += threatCount;

             // Classify scan results with reduce
             const classification = results.reduce((report, n) => {
                 const type = n.name.includes('HOLE') ? 'holes'
                            : n.name.includes('FIRE') ? 'fires'
                            : n.name.includes('ENEMY') ? 'enemies'
                            : 'safe';
                 report[type] = (report[type] || 0) + 1;
                 return report;
             }, {});

             // Handle all nodes
             for (const node of results) await handle(node);
         }
     }
     deepState();

   WHY REDUCE:
   - reduce() is the Swiss army knife of array methods
   - Can implement map, filter, forEach, find, every, some -- all with reduce
   - Essential for data aggregation: logs, metrics, reports
   - The hardest array method to learn, but the most versatile
   - Real-world: Redux reducers, MapReduce, stream processing

   GRID LAYOUT (12x12):
     [start]    [empty]    [enemy-1]  [empty]    [wall]     [empty]    [empty]    [server-a] [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [hole-1]   [wall]     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [wall]
     [empty]    [fire-1]   [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-b] [empty]    [wall]
     [empty]    [empty]    [empty]    [wall]     [empty]    [enemy-2]  [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [wall]     [empty]    [empty]    [wall]     [empty]    [empty]    [empty]    [hole-2]   [empty]    [empty]    [wall]     [empty]
     [empty]    [empty]    [hole-3]   [empty]    [empty]    [empty]    [wall]     [empty]    [empty]    [server-c] [wall]     [empty]
     [empty]    [empty]    [empty]    [fire-2]   [empty]    [empty]    [wall]     [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [enemy-3]  [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [wall]     [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [fire-3]   [empty]    [empty]    [empty]    [wall]     [empty]    [server-d] [empty]
     [wall]     [empty]    [empty]    [empty]    [empty]    [enemy-4]  [empty]    [empty]    [empty]    [empty]    [empty]    [wall]
     [empty]    [empty]    [hole-4]   [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-e] [target]

   4 holes + 3 fires + 4 enemies + heavy walls. reduce() for aggregation.
   ================================================================ */

var JS_48_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-48',
    title: 'JS-48 / DEEP STATE',
    subtitle: 'Aggregate intelligence. reduce() transforms chaos into clarity.',
    category: 'javascript-ops',
    difficulty: 4,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 4 = full capabilities) -- */
    agent: { tier: 4 },

    /* -- 12x12 Grid -- */
    grid: {
        rows: 12, cols: 12,
        cells: [
            /* Row 0  */ ['gateway',  'empty',    'enemy-1',  'empty',    'wall',     'empty',    'empty',    'server-a', 'empty',    'empty',    'empty',    'empty'],
            /* Row 1  */ ['empty',    'empty',    'empty',    'hole-1',   'wall',     'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'wall'],
            /* Row 2  */ ['empty',    'fire-1',   'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-b', 'empty',    'wall'],
            /* Row 3  */ ['empty',    'empty',    'empty',    'wall',     'empty',    'enemy-2',  'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 4  */ ['wall',     'empty',    'empty',    'wall',     'empty',    'empty',    'empty',    'hole-2',   'empty',    'empty',    'wall',     'empty'],
            /* Row 5  */ ['empty',    'empty',    'hole-3',   'empty',    'empty',    'empty',    'wall',     'empty',    'empty',    'server-c', 'wall',     'empty'],
            /* Row 6  */ ['empty',    'empty',    'empty',    'fire-2',   'empty',    'empty',    'wall',     'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 7  */ ['empty',    'enemy-3',  'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'wall',     'empty',    'empty',    'empty'],
            /* Row 8  */ ['empty',    'empty',    'empty',    'empty',    'fire-3',   'empty',    'empty',    'empty',    'wall',     'empty',    'server-d', 'empty'],
            /* Row 9  */ ['wall',     'empty',    'empty',    'empty',    'empty',    'enemy-4',  'empty',    'empty',    'empty',    'empty',    'empty',    'wall'],
            /* Row 10 */ ['empty',    'empty',    'hole-4',   'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 11 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-e', 'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':  { label: 'GATEWAY',       abbr: 'GTW', ip: '10.480.1.1',   desc: 'Deep state perimeter -- intelligence gathering begins',  ports: ['22/SSH', '443/HTTPS'],                    os: 'Juniper SRX5800' },

        /* 5 target servers -- intelligence network */
        'server-a': { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.480.1.10',  desc: 'SIGINT collector -- signals intelligence',               ports: ['22/SSH', '443/HTTPS', '514/SYSLOG'],      os: 'Ubuntu 24.04 LTS' },
        'server-b': { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.480.1.11',  desc: 'HUMINT database -- human intelligence reports',          ports: ['22/SSH', '443/HTTPS', '5432/PostgreSQL'], os: 'Debian 12 Bookworm' },
        'server-c': { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.480.1.12',  desc: 'OSINT aggregator -- open source intelligence',           ports: ['22/SSH', '443/HTTPS', '9200/ELASTIC'],    os: 'CentOS Stream 9' },
        'server-d': { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.480.1.13',  desc: 'Fusion center -- all-source correlation',                ports: ['22/SSH', '443/HTTPS', '5601/KIBANA'],     os: 'RHEL 9.3' },
        'server-e': { label: 'SERVER-ECHO',    abbr: 'SRE', ip: '10.480.1.14',  desc: 'Dissemination server -- finished intelligence',          ports: ['22/SSH', '443/HTTPS', '8200/VAULT'],      os: 'Windows Server 2022' },

        /* Extraction point */
        'target':   { label: 'EXTRACTION',     abbr: 'EXT', ip: '10.480.1.99',  desc: 'Extraction point -- intelligence gathered',              ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* 4 enemies -- fight required */
        'enemy-1':  { label: 'ENEMY MOLE',      abbr: 'MOL', ip: null, desc: 'Insider threat -- fight to neutralize',                           ports: [] },
        'enemy-2':  { label: 'ENEMY HANDLER',    abbr: 'HND', ip: null, desc: 'Foreign handler -- fight to neutralize',                         ports: [] },
        'enemy-3':  { label: 'ENEMY ASSET',      abbr: 'AST', ip: null, desc: 'Compromised asset -- fight to neutralize',                       ports: [] },
        'enemy-4':  { label: 'ENEMY DIRECTOR',   abbr: 'DIR', ip: null, desc: 'Operations director -- fight to neutralize',                     ports: [] },

        /* 4 holes -- jump required */
        'hole-1':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Intelligence gap -- jump to cross',                                ports: [] },
        'hole-2':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Coverage void -- jump to cross',                                   ports: [] },
        'hole-3':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Analysis gap -- jump to cross',                                    ports: [] },
        'hole-4':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Dissemination gap -- jump to cross',                               ports: [] },

        /* 3 fires -- extinguish required */
        'fire-1':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Classified data burn -- extinguish to pass',                       ports: [] },
        'fire-2':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Cover-blown fire -- extinguish to pass',                           ports: [] },
        'fire-3':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Counterintelligence blaze -- extinguish to pass',                  ports: [] }
    },

    /* No traps */
    traps: [],

    /* Obstacles: heavy and mixed */
    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3', 'hole-4'],
        fires: ['fire-1', 'fire-2', 'fire-3'],
        enemies: ['enemy-1', 'enemy-2', 'enemy-3', 'enemy-4']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER -- Map all 5 intelligence servers',                check: 'nodesDiscovered.has("server-a") && nodesDiscovered.has("server-b") && nodesDiscovered.has("server-c") && nodesDiscovered.has("server-d") && nodesDiscovered.has("server-e")' },
        { id: 'obj_1', label: 'COMBAT -- Neutralize all 4 hostile agents',                 check: 'nodesDiscovered.has("enemy-1") && nodesDiscovered.has("enemy-2") && nodesDiscovered.has("enemy-3") && nodesDiscovered.has("enemy-4")' },
        { id: 'obj_2', label: 'NAVIGATE -- Handle all environmental hazards',              check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3") && nodesDiscovered.has("hole-4") && nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2") && nodesDiscovered.has("fire-3")' },
        { id: 'obj_3', label: 'EXTRACTION -- Reach the extraction point',                  check: 'nodesDiscovered.has("target")' },
        { id: 'obj_4', label: 'STEALTH -- 5+ integrity remaining',                         check: 'integrity >= 5' }
    ],

    /* 9 integrity -- 11 obstacles + heavy walls */
    integrity: 9,

    /* -- Completion screen -- */
    completion: {
        title: 'DEEP STATE',
        subtitle: 'Intelligence aggregated. 11 threats reduced to data. reduce() mastered.',
        storageKey: 'hexworth_operator_js48'
    }
};
