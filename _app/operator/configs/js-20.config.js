/* ================================================================
   JS-20 / FIRESTORM -- Mission Config
   ================================================================
   Tier 4 mission. 8x8 grid -- 64 cells.
   FIRE-HEAVY level. Multiple obstacle handlers needed inside callbacks.
   Student must branch on TWO obstacle types within the same callback.

   DESIGN RATIONALE:
   - 4 fires dominate the grid -- extinguish() is the primary action
   - 2 holes remain to ensure the student handles BOTH types
   - Callbacks from JS-19 are now the expected execution model
   - The forEach inside the callback grows: two if branches
   - This level cements multi-branch obstacle handling as a pattern
   - Prepares the student for the callback nesting that comes in JS-21

   JS SKILL: Multi-branch callback logic
   - Inside the scan callback, forEach over results
   - Check node.name for 'HOLE' -> jump, 'FIRE' -> extinguish
   - The callback pattern stays flat here -- nesting comes next level
   - Student practices: function as argument + conditional branching

   REFERENCE SOLUTION:
     agent.scan(function(results) {
         results.forEach(function(node) {
             if (node.name.includes('HOLE')) {
                 agent.jump(node.direction);
             } else if (node.name.includes('FIRE')) {
                 agent.extinguish(node.direction);
             } else {
                 agent.move(node.direction);
             }
         });
     });

   WHY 4 FIRES:
   - Volume forces the student to trust their handler, not hard-code directions
   - Each fire is in a different corridor -- no single safe path avoids all of them
   - The student must rely on the scan-check-respond loop, not memorized moves

   GRID LAYOUT (8x8):
     [start]    [empty]    [fire-1]   [empty]    [server-a] [empty]    [empty]    [wall]
     [empty]    [empty]    [empty]    [empty]    [empty]    [fire-2]   [empty]    [empty]
     [empty]    [empty]    [empty]    [hole-1]   [empty]    [empty]    [server-b] [empty]
     [wall]     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [fire-3]   [empty]    [empty]    [server-c] [empty]    [empty]    [wall]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [hole-2]   [empty]    [empty]    [fire-4]   [empty]    [empty]
     [wall]     [empty]    [empty]    [empty]    [empty]    [empty]    [server-d] [empty]

   4 fires + 2 holes. Multi-branch callback logic.
   ================================================================ */

var JS_20_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-20',
    title: 'JS-20 / FIRESTORM',
    subtitle: 'Fires everywhere. Two obstacle types. One callback to rule them.',
    category: 'javascript-ops',
    difficulty: 3,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 2 = scan, move, jump, extinguish) -- */
    agent: { tier: 2 },

    /* -- 8x8 Grid -- */
    grid: {
        rows: 8, cols: 8,
        cells: [
            /* Row 0 */ ['gateway',  'empty',    'fire-1',   'empty',    'server-a', 'empty',    'empty',    'wall'],
            /* Row 1 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'fire-2',   'empty',    'empty'],
            /* Row 2 */ ['empty',    'empty',    'empty',    'hole-1',   'empty',    'empty',    'server-b', 'empty'],
            /* Row 3 */ ['wall',     'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 4 */ ['empty',    'fire-3',   'empty',    'empty',    'server-c', 'empty',    'empty',    'wall'],
            /* Row 5 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 6 */ ['empty',    'empty',    'hole-2',   'empty',    'empty',    'fire-4',   'empty',    'empty'],
            /* Row 7 */ ['wall',     'empty',    'empty',    'empty',    'empty',    'empty',    'server-d', 'empty']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':  { label: 'GATEWAY',       abbr: 'GTW', ip: '10.200.1.1',   desc: 'Edge firewall -- thermal zone insertion',               ports: ['22/SSH', '443/HTTPS'],                    os: 'Fortinet FortiOS 7.4' },

        /* 4 target servers -- cloud infrastructure */
        'server-a': { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.200.1.10',  desc: 'Container registry -- image repository',                ports: ['22/SSH', '443/HTTPS', '5000/REGISTRY'],   os: 'Ubuntu 24.04 LTS' },
        'server-b': { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.200.1.11',  desc: 'Kubernetes API server -- cluster control plane',        ports: ['22/SSH', '6443/K8S-API', '10250/KUBELET'],os: 'Debian 12 Bookworm' },
        'server-c': { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.200.1.12',  desc: 'Service mesh control -- Istio pilot',                   ports: ['22/SSH', '15010/GRPC', '15014/CITADEL'],  os: 'CentOS Stream 9' },
        'server-d': { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.200.1.13',  desc: 'Secrets vault -- HashiCorp Vault instance',             ports: ['22/SSH', '8200/VAULT', '8201/CLUSTER'],   os: 'RHEL 9.3' },

        /* 4 fires -- must be extinguished */
        'fire-1':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Overheated node -- extinguish to pass',                          ports: [] },
        'fire-2':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Thermal cascade -- extinguish to pass',                          ports: [] },
        'fire-3':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Circuit meltdown -- extinguish to pass',                         ports: [] },
        'fire-4':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Power surge fire -- extinguish to pass',                         ports: [] },

        /* 2 holes -- must be jumped */
        'hole-1':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Network gap -- jump to cross',                                  ports: [] },
        'hole-2':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Severed backbone -- jump to cross',                              ports: [] }
    },

    /* No traps -- focus on fire + hole handling */
    traps: [],

    /* Obstacles: fires dominant, holes secondary */
    obstacles: {
        holes: ['hole-1', 'hole-2'],
        fires: ['fire-1', 'fire-2', 'fire-3', 'fire-4']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER ALPHA -- Find the container registry',        check: 'nodesDiscovered.has("server-a")' },
        { id: 'obj_1', label: 'DISCOVER BRAVO -- Find the K8s API server',             check: 'nodesDiscovered.has("server-b")' },
        { id: 'obj_2', label: 'DISCOVER CHARLIE -- Find the service mesh control',     check: 'nodesDiscovered.has("server-c")' },
        { id: 'obj_3', label: 'DISCOVER DELTA -- Find the secrets vault',              check: 'nodesDiscovered.has("server-d")' },
        { id: 'obj_4', label: 'EXTINGUISH -- Put out all 4 fires',                    check: 'nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2") && nodesDiscovered.has("fire-3") && nodesDiscovered.has("fire-4")' },
        { id: 'obj_5', label: 'NAVIGATE -- Cross both holes safely',                  check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2")' }
    ],

    /* 5 integrity -- 6 obstacles to handle */
    integrity: 5,

    /* -- Completion screen -- */
    completion: {
        title: 'FIRESTORM',
        subtitle: 'Four fires extinguished. Two holes jumped. Multi-branch callbacks proven.',
        storageKey: 'hexworth_operator_js20'
    }
};
