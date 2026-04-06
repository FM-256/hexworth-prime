/* ================================================================
   JS-49 / THE ARCHITECT -- Mission Config
   ================================================================
   Tier 6 mission. 12x12 grid -- 144 cells.
   OPEN-ENDED DESIGN. No prescribed pattern. No hints. The student
   designs their own approach using ALL learned JS features.

   DESIGN RATIONALE:
   - 12x12 grid with complex obstacle placement
   - 3 holes + 3 fires + 3 enemies + 2 keys + 2 locked doors + walls
   - Multiple valid paths through the grid -- no single "right" answer
   - NO reference solution pattern is prescribed in the briefing
   - The briefing says: "No hints. You are the architect."
   - Student chooses: Map dispatch? Reduce aggregation? Promise.all? Ternary?
   - This is the PENULTIMATE mission -- proves the student can self-direct

   JS SKILL: Open-ended -- student designs their own approach
   - All previously learned patterns are valid
   - Student must CHOOSE which tools and patterns to apply
   - Code quality matters: clean, commented, organized
   - No guardrails -- student proves mastery through independent design
   - The real test: can you architect a solution without a template?

   REFERENCE SOLUTION (one of many valid approaches):
     // The Architect -- YOUR design. No template. No hints.
     // Every JS pattern you've learned is available.
     // Choose wisely.

     async function architect() {
         // One possible approach: Map-based dispatch with reduce tracking
         const actions = new Map([
             ['HOLE',   async (d) => await agent.jump(d)],
             ['FIRE',   async (d) => await agent.extinguish(d)],
             ['ENEMY',  async (d) => await agent.fight(d)],
             ['LOCKED', async (d) => await agent.unlock(d)],
             ['WALL',   async (d) => await agent.tunnel(d)]
         ]);

         const stats = { scans: 0, threats: 0, moves: 0 };

         while (true) {
             const results = await agent.scan();
             if (results.length === 0) break;
             stats.scans++;

             for (const { name, direction } of results) {
                 const type = [...actions.keys()].find(k => name.includes(k));
                 if (type) {
                     await actions.get(type)(direction);
                     stats.threats++;
                 } else {
                     await agent.move(direction);
                     stats.moves++;
                 }
             }
         }
     }
     architect();

   WHY THE ARCHITECT:
   - Penultimate level -- one mission before the finale
   - Tests INDEPENDENT PROBLEM SOLVING, not pattern following
   - No scaffolding, no step-by-step guidance
   - The student must architect, not just code
   - Real-world parallel: greenfield projects, system design interviews

   GRID LAYOUT (12x12):
     [start]    [empty]    [wall]     [empty]    [key-1]    [empty]    [empty]    [empty]    [server-a] [empty]    [empty]    [empty]
     [empty]    [enemy-1]  [wall]     [empty]    [empty]    [empty]    [fire-1]   [empty]    [empty]    [empty]    [empty]    [wall]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-b] [wall]
     [empty]    [empty]    [hole-1]   [empty]    [wall]     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [wall]     [locked-1] [empty]    [empty]    [wall]     [empty]    [empty]    [empty]
     [wall]     [empty]    [empty]    [fire-2]   [empty]    [empty]    [empty]    [empty]    [wall]     [server-c] [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [enemy-2]  [empty]    [empty]    [empty]    [empty]    [wall]
     [empty]    [empty]    [hole-2]   [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [wall]
     [empty]    [empty]    [empty]    [empty]    [key-2]    [empty]    [empty]    [fire-3]   [empty]    [empty]    [server-d] [empty]
     [wall]     [empty]    [empty]    [empty]    [empty]    [empty]    [locked-2] [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [enemy-3]  [empty]    [hole-3]   [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-e] [target]

   3 holes + 3 fires + 3 enemies + 2 keys + 2 locked doors. Open-ended design.
   ================================================================ */

var JS_49_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-49',
    title: 'JS-49 / THE ARCHITECT',
    subtitle: 'No hints. No template. You are the architect.',
    category: 'javascript-ops',
    difficulty: 4,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 4 = full capabilities) -- */
    agent: { tier: 4 },

    /* -- 12x12 Grid -- */
    grid: {
        rows: 12, cols: 12,
        cells: [
            /* Row 0  */ ['gateway',  'empty',    'wall',     'empty',    'key-1',    'empty',    'empty',    'empty',    'server-a', 'empty',    'empty',    'empty'],
            /* Row 1  */ ['empty',    'enemy-1',  'wall',     'empty',    'empty',    'empty',    'fire-1',   'empty',    'empty',    'empty',    'empty',    'wall'],
            /* Row 2  */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-b', 'wall'],
            /* Row 3  */ ['empty',    'empty',    'hole-1',   'empty',    'wall',     'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 4  */ ['empty',    'empty',    'empty',    'empty',    'wall',     'locked-door-1', 'empty', 'empty',  'wall',     'empty',    'empty',    'empty'],
            /* Row 5  */ ['wall',     'empty',    'empty',    'fire-2',   'empty',    'empty',    'empty',    'empty',    'wall',     'server-c', 'empty',    'empty'],
            /* Row 6  */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'enemy-2',  'empty',    'empty',    'empty',    'empty',    'wall'],
            /* Row 7  */ ['empty',    'empty',    'hole-2',   'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'wall'],
            /* Row 8  */ ['empty',    'empty',    'empty',    'empty',    'key-2',    'empty',    'empty',    'fire-3',   'empty',    'empty',    'server-d', 'empty'],
            /* Row 9  */ ['wall',     'empty',    'empty',    'empty',    'empty',    'empty',    'locked-door-2', 'empty', 'empty',  'empty',    'empty',    'empty'],
            /* Row 10 */ ['empty',    'enemy-3',  'empty',    'hole-3',   'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 11 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-e', 'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':      { label: 'GATEWAY',           abbr: 'GTW', ip: '10.490.1.1',   desc: 'The architect\'s entry -- design your own path',     ports: ['22/SSH', '443/HTTPS'],                    os: 'Arista 7280R3' },

        /* 5 target servers -- clean architecture */
        'server-a':     { label: 'SERVER-ALPHA',       abbr: 'SRA', ip: '10.490.1.10',  desc: 'API gateway -- request routing layer',               ports: ['22/SSH', '443/HTTPS', '8443/KONG'],       os: 'Ubuntu 24.04 LTS' },
        'server-b':     { label: 'SERVER-BRAVO',       abbr: 'SRB', ip: '10.490.1.11',  desc: 'Service mesh -- sidecar proxy control plane',        ports: ['22/SSH', '443/HTTPS', '15010/ISTIO'],     os: 'Debian 12 Bookworm' },
        'server-c':     { label: 'SERVER-CHARLIE',     abbr: 'SRC', ip: '10.490.1.12',  desc: 'Configuration server -- feature flag management',    ports: ['22/SSH', '443/HTTPS', '8500/CONSUL'],     os: 'CentOS Stream 9' },
        'server-d':     { label: 'SERVER-DELTA',       abbr: 'SRD', ip: '10.490.1.13',  desc: 'Observability platform -- traces and metrics',       ports: ['22/SSH', '443/HTTPS', '4317/OTEL'],       os: 'RHEL 9.3' },
        'server-e':     { label: 'SERVER-ECHO',        abbr: 'SRE', ip: '10.490.1.14',  desc: 'Deployment engine -- CI/CD orchestrator',            ports: ['22/SSH', '443/HTTPS', '8080/ARGOCD'],     os: 'Windows Server 2022' },

        /* Extraction point */
        'target':       { label: 'EXTRACTION',         abbr: 'EXT', ip: '10.490.1.99',  desc: 'Extraction point -- the architect prevails',         ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* 2 keys -- auto-collected on entry */
        'key-1':        { label: 'ACCESS KEY',         abbr: 'KY1', ip: null, desc: 'Architecture key alpha -- collected automatically',             ports: [] },
        'key-2':        { label: 'ACCESS KEY',         abbr: 'KY2', ip: null, desc: 'Architecture key bravo -- collected automatically',             ports: [] },

        /* 2 locked doors -- blocks until key used */
        'locked-door-1': { label: 'LOCKED DOOR',      abbr: 'LK1', ip: null, desc: 'Design gate alpha -- use key to open',                         ports: [] },
        'locked-door-2': { label: 'LOCKED DOOR',      abbr: 'LK2', ip: null, desc: 'Design gate bravo -- use key to open',                         ports: [] },

        /* 3 enemies -- fight required */
        'enemy-1':      { label: 'ENEMY BLOCKER',     abbr: 'BLK', ip: null, desc: 'Technical debt -- fight to neutralize',                        ports: [] },
        'enemy-2':      { label: 'ENEMY SPAGHETTI',   abbr: 'SPG', ip: null, desc: 'Spaghetti code -- fight to neutralize',                        ports: [] },
        'enemy-3':      { label: 'ENEMY LEGACY',      abbr: 'LGC', ip: null, desc: 'Legacy system -- fight to neutralize',                         ports: [] },

        /* 3 holes -- jump required */
        'hole-1':       { label: 'HOLE',               abbr: 'HLE', ip: null, desc: 'Abstraction leak -- jump to cross',                           ports: [] },
        'hole-2':       { label: 'HOLE',               abbr: 'HLE', ip: null, desc: 'Missing layer -- jump to cross',                              ports: [] },
        'hole-3':       { label: 'HOLE',               abbr: 'HLE', ip: null, desc: 'Integration gap -- jump to cross',                            ports: [] },

        /* 3 fires -- extinguish required */
        'fire-1':       { label: 'FIRE',               abbr: 'FIR', ip: null, desc: 'Dependency fire -- extinguish to pass',                       ports: [] },
        'fire-2':       { label: 'FIRE',               abbr: 'FIR', ip: null, desc: 'Version conflict blaze -- extinguish to pass',                ports: [] },
        'fire-3':       { label: 'FIRE',               abbr: 'FIR', ip: null, desc: 'Breaking change fire -- extinguish to pass',                  ports: [] }
    },

    /* No traps */
    traps: [],

    /* Obstacles: balanced complexity */
    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3'],
        fires: ['fire-1', 'fire-2', 'fire-3'],
        enemies: ['enemy-1', 'enemy-2', 'enemy-3']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'COLLECT -- Find both architecture keys',                    check: 'nodesDiscovered.has("key-1") && nodesDiscovered.has("key-2")' },
        { id: 'obj_1', label: 'UNLOCK -- Open both design gates',                          check: 'nodesDiscovered.has("locked-door-1") && nodesDiscovered.has("locked-door-2")' },
        { id: 'obj_2', label: 'DISCOVER -- Map all 5 architecture servers',                check: 'nodesDiscovered.has("server-a") && nodesDiscovered.has("server-b") && nodesDiscovered.has("server-c") && nodesDiscovered.has("server-d") && nodesDiscovered.has("server-e")' },
        { id: 'obj_3', label: 'NAVIGATE -- Handle all 9 obstacles',                        check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3") && nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2") && nodesDiscovered.has("fire-3") && nodesDiscovered.has("enemy-1") && nodesDiscovered.has("enemy-2") && nodesDiscovered.has("enemy-3")' },
        { id: 'obj_4', label: 'EXTRACTION -- Reach the extraction point',                  check: 'nodesDiscovered.has("target")' }
    ],

    /* 8 integrity -- 9 obstacles + 2 locked doors */
    integrity: 8,

    /* -- Completion screen -- */
    completion: {
        title: 'THE ARCHITECT',
        subtitle: 'Your design. Your code. Your architecture. No template needed. One mission remains.',
        storageKey: 'hexworth_operator_js49'
    }
};
