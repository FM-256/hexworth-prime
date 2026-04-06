/* ================================================================
   JS-45 / TERNARY CHAINS -- Mission Config
   ================================================================
   Tier 6 mission. 11x11 grid -- 121 cells.
   TERNARY OPERATOR for concise branching. Replace verbose if/else
   with compact ternary expressions for threat classification.

   DESIGN RATIONALE:
   - 11x11 grid with balanced high-density obstacles: 3 holes + 4 fires + 3 enemies
   - 10 total obstacles -- requires efficient code to manage
   - Student replaces multi-line if/else with ternary chains
   - Ternary chains classify threats in a single expression
   - The emphasis: READABLE concise code, not clever code
   - 5 servers + extraction point across the grid

   JS SKILL: Ternary operator chains
   - condition ? valueIfTrue : valueIfFalse
   - Chained: a ? x : b ? y : c ? z : default
   - Use for classification: threat === 'HOLE' ? 'jump' : threat === 'FIRE' ? 'extinguish' : 'fight'
   - Use for action selection in one line
   - NOT a replacement for complex logic -- use for concise branching only

   REFERENCE SOLUTION:
     async function ternaryOps() {
         const results = await agent.scan();

         for (const { name, direction } of results) {
             // Classify threat type with ternary chain
             const type = name.includes('HOLE')  ? 'HOLE'
                        : name.includes('FIRE')  ? 'FIRE'
                        : name.includes('ENEMY') ? 'ENEMY'
                        : 'SAFE';

             // Dispatch action with ternary
             type === 'HOLE'  ? await agent.jump(direction)
           : type === 'FIRE'  ? await agent.extinguish(direction)
           : type === 'ENEMY' ? await agent.fight(direction)
           :                     await agent.move(direction);
         }
     }
     ternaryOps();

   WHY TERNARY CHAINS:
   - if/else blocks are 6+ lines per branch -- ternaries are 1 line
   - Classification ternaries are readable when properly formatted
   - Common in React JSX, functional programming, data transformation
   - Teaches code density vs readability tradeoffs
   - Real-world: status badges, permission checks, API response mapping

   GRID LAYOUT (11x11):
     [start]    [empty]    [fire-1]   [empty]    [empty]    [server-a] [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [hole-1]   [empty]    [empty]    [empty]    [empty]    [enemy-1]  [empty]    [wall]
     [empty]    [enemy-2]  [empty]    [empty]    [empty]    [fire-2]   [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-b] [empty]    [empty]    [empty]
     [empty]    [fire-3]   [empty]    [empty]    [wall]     [empty]    [empty]    [empty]    [empty]    [wall]     [empty]
     [wall]     [empty]    [empty]    [hole-2]   [wall]     [empty]    [empty]    [empty]    [server-c] [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [enemy-3]  [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [fire-4]   [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-d] [empty]
     [empty]    [empty]    [empty]    [empty]    [hole-3]   [empty]    [empty]    [empty]    [empty]    [empty]    [wall]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-e] [target]

   3 holes + 4 fires + 3 enemies = 10 obstacles. Ternary chains for concise dispatch.
   ================================================================ */

var JS_45_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-45',
    title: 'JS-45 / TERNARY CHAINS',
    subtitle: 'Compact branching. One line where six used to be.',
    category: 'javascript-ops',
    difficulty: 4,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 4 = full capabilities) -- */
    agent: { tier: 4 },

    /* -- 11x11 Grid -- */
    grid: {
        rows: 11, cols: 11,
        cells: [
            /* Row 0  */ ['gateway',  'empty',    'fire-1',   'empty',    'empty',    'server-a', 'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 1  */ ['empty',    'empty',    'empty',    'hole-1',   'empty',    'empty',    'empty',    'empty',    'enemy-1',  'empty',    'wall'],
            /* Row 2  */ ['empty',    'enemy-2',  'empty',    'empty',    'empty',    'fire-2',   'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 3  */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-b', 'empty',    'empty',    'empty'],
            /* Row 4  */ ['empty',    'fire-3',   'empty',    'empty',    'wall',     'empty',    'empty',    'empty',    'empty',    'wall',     'empty'],
            /* Row 5  */ ['wall',     'empty',    'empty',    'hole-2',   'wall',     'empty',    'empty',    'empty',    'server-c', 'empty',    'empty'],
            /* Row 6  */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'enemy-3',  'empty',    'empty',    'empty',    'empty'],
            /* Row 7  */ ['empty',    'empty',    'fire-4',   'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-d', 'empty'],
            /* Row 8  */ ['empty',    'empty',    'empty',    'empty',    'hole-3',   'empty',    'empty',    'empty',    'empty',    'empty',    'wall'],
            /* Row 9  */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 10 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-e', 'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':  { label: 'GATEWAY',       abbr: 'GTW', ip: '10.450.1.1',   desc: 'Concise code zone -- ternary dispatch gateway',          ports: ['22/SSH', '443/HTTPS'],                    os: 'SonicWall NSa 6700' },

        /* 5 target servers -- security operations center */
        'server-a': { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.450.1.10',  desc: 'SIEM console -- event correlation dashboard',            ports: ['22/SSH', '443/HTTPS', '9997/SPLUNK'],     os: 'Ubuntu 24.04 LTS' },
        'server-b': { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.450.1.11',  desc: 'Vulnerability scanner -- continuous assessment',         ports: ['22/SSH', '443/HTTPS', '8834/NESSUS'],     os: 'Debian 12 Bookworm' },
        'server-c': { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.450.1.12',  desc: 'Threat hunter workstation -- hypothesis testing',        ports: ['22/SSH', '443/HTTPS', '5601/KIBANA'],     os: 'CentOS Stream 9' },
        'server-d': { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.450.1.13',  desc: 'Incident tracker -- case management system',             ports: ['22/SSH', '443/HTTPS', '8080/THEHIVE'],    os: 'RHEL 9.3' },
        'server-e': { label: 'SERVER-ECHO',    abbr: 'SRE', ip: '10.450.1.14',  desc: 'Response orchestrator -- SOAR platform',                 ports: ['22/SSH', '443/HTTPS', '9090/CORTEX'],     os: 'Windows Server 2022' },

        /* Extraction point */
        'target':   { label: 'EXTRACTION',     abbr: 'EXT', ip: '10.450.1.99',  desc: 'Extraction point -- ternary mastery proven',             ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* 3 enemies -- fight required */
        'enemy-1':  { label: 'ENEMY KEYLOGGER', abbr: 'KLG', ip: null, desc: 'Keylogger process -- fight to neutralize',                        ports: [] },
        'enemy-2':  { label: 'ENEMY BOTNET',    abbr: 'BOT', ip: null, desc: 'Botnet controller -- fight to neutralize',                        ports: [] },
        'enemy-3':  { label: 'ENEMY SKIMMER',   abbr: 'SKM', ip: null, desc: 'Data skimmer -- fight to neutralize',                             ports: [] },

        /* 3 holes -- jump required */
        'hole-1':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Event pipeline gap -- jump to cross',                              ports: [] },
        'hole-2':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Alert routing void -- jump to cross',                              ports: [] },
        'hole-3':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Correlation gap -- jump to cross',                                 ports: [] },

        /* 4 fires -- extinguish required */
        'fire-1':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Alert fatigue fire -- extinguish to pass',                         ports: [] },
        'fire-2':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'False positive blaze -- extinguish to pass',                       ports: [] },
        'fire-3':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Log overflow fire -- extinguish to pass',                          ports: [] },
        'fire-4':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Incident cascade blaze -- extinguish to pass',                     ports: [] }
    },

    /* No traps */
    traps: [],

    /* Obstacles: 3 holes + 4 fires + 3 enemies */
    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3'],
        fires: ['fire-1', 'fire-2', 'fire-3', 'fire-4'],
        enemies: ['enemy-1', 'enemy-2', 'enemy-3']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER -- Map all 5 SOC servers',                         check: 'nodesDiscovered.has("server-a") && nodesDiscovered.has("server-b") && nodesDiscovered.has("server-c") && nodesDiscovered.has("server-d") && nodesDiscovered.has("server-e")' },
        { id: 'obj_1', label: 'COMBAT -- Neutralize all 3 malware threats',                check: 'nodesDiscovered.has("enemy-1") && nodesDiscovered.has("enemy-2") && nodesDiscovered.has("enemy-3")' },
        { id: 'obj_2', label: 'NAVIGATE -- Handle all 7 environmental hazards',            check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3") && nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2") && nodesDiscovered.has("fire-3") && nodesDiscovered.has("fire-4")' },
        { id: 'obj_3', label: 'EXTRACTION -- Reach the extraction point',                  check: 'nodesDiscovered.has("target")' }
    ],

    /* 8 integrity -- 10 obstacles */
    integrity: 8,

    /* -- Completion screen -- */
    completion: {
        title: 'TERNARY CHAINS',
        subtitle: 'Compact code. 10 obstacles dispatched with ternary precision. Clean and concise.',
        storageKey: 'hexworth_operator_js45'
    }
};
