/* ================================================================
   JS-25 / ASYNC OPERATOR -- Mission Config
   ================================================================
   Tier 4 mission. 10x10 grid -- 100 cells.
   async/await INTRODUCED. THE RESOLUTION of the async arc.
   Same operations as callback hell, now written like synchronous code.

   DESIGN RATIONALE:
   - 10x10 grid -- the largest yet, but clean code makes it manageable
   - 3 holes + 3 fires + 3 enemies -- all three obstacle types
   - The student uses `async function` and `await` for the first time
   - `const results = await agent.scan()` -- no callback, no .then()
   - `await agent.move('east')` -- just wait for it to finish
   - The code reads top-to-bottom, like synchronous code
   - This is the payoff: JS-21's pyramid of doom becomes linear code

   JS SKILL: async/await -- clean asynchronous code
   - `async function` declares an async function
   - `await` pauses until a Promise resolves and returns the result
   - `const results = await agent.scan()` -- results are right there
   - for...of with await: `for (let t of threats) { await agent.fight(t.direction); }`
   - Error handling: try/catch instead of .catch()
   - Same power as promises, reads like regular code

   REFERENCE SOLUTION:
     async function infiltrate() {
         let results = await agent.scan();
         // Handle all obstacle types
         for (let node of results) {
             if (node.name.includes('ENEMY')) {
                 await agent.fight(node.direction);
             } else if (node.name.includes('HOLE')) {
                 await agent.jump(node.direction);
             } else if (node.name.includes('FIRE')) {
                 await agent.extinguish(node.direction);
             }
         }
         // Move to the next zone
         await agent.move('east');
         // Scan again -- clean, flat, readable
         results = await agent.scan();
         for (let node of results) {
             if (node.name.includes('ENEMY')) {
                 await agent.fight(node.direction);
             } else if (node.name.includes('HOLE')) {
                 await agent.jump(node.direction);
             } else if (node.name.includes('FIRE')) {
                 await agent.extinguish(node.direction);
             }
         }
         await agent.move('south');
     }
     infiltrate();

   THE ARC COMPLETE:
   - JS-19: Callbacks introduced (functions as arguments)
   - JS-21: Callback hell (the problem -- deeply nested, unreadable)
   - JS-22: Promises (the partial fix -- flat chains with .then())
   - JS-25: async/await (the resolution -- reads like normal code)

   GRID LAYOUT (10x10):
     [start]    [empty]    [enemy-1]  [empty]    [empty]    [server-a] [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [hole-1]   [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [fire-1]   [empty]    [empty]    [empty]    [empty]    [server-b] [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [enemy-2]  [empty]    [empty]    [empty]    [empty]    [wall]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [hole-2]   [empty]    [empty]    [fire-2]   [empty]    [server-c] [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [fire-3]   [empty]    [enemy-3]  [empty]    [empty]    [empty]    [empty]    [server-d] [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [hole-3]   [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [server-e] [target]

   3 holes + 3 fires + 3 enemies. 10x10 grid. async/await.
   ================================================================ */

var JS_25_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-25',
    title: 'JS-25 / ASYNC OPERATOR',
    subtitle: 'async/await. The same power. Clean code. The way it should be.',
    category: 'javascript-ops',
    difficulty: 4,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 4 = full capabilities + async support) -- */
    agent: { tier: 4 },

    /* -- 10x10 Grid -- */
    grid: {
        rows: 10, cols: 10,
        cells: [
            /* Row 0 */ ['gateway',  'empty',    'enemy-1',  'empty',    'empty',    'server-a', 'empty',    'empty',    'empty',    'empty'],
            /* Row 1 */ ['empty',    'empty',    'empty',    'hole-1',   'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 2 */ ['empty',    'fire-1',   'empty',    'empty',    'empty',    'empty',    'server-b', 'empty',    'empty',    'empty'],
            /* Row 3 */ ['empty',    'empty',    'empty',    'empty',    'enemy-2',  'empty',    'empty',    'empty',    'empty',    'wall'],
            /* Row 4 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 5 */ ['empty',    'empty',    'hole-2',   'empty',    'empty',    'fire-2',   'empty',    'server-c', 'empty',    'empty'],
            /* Row 6 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 7 */ ['empty',    'fire-3',   'empty',    'enemy-3',  'empty',    'empty',    'empty',    'empty',    'server-d', 'empty'],
            /* Row 8 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'hole-3',   'empty',    'empty',    'empty',    'empty'],
            /* Row 9 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'server-e', 'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':  { label: 'GATEWAY',       abbr: 'GTW', ip: '10.250.1.1',   desc: 'Async-capable gateway -- clean code zone',              ports: ['22/SSH', '443/HTTPS'],                    os: 'Juniper SRX4600' },

        /* 5 target servers -- ransomware recovery infrastructure */
        'server-a': { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.250.1.10',  desc: 'Backup controller -- immutable snapshot vault',         ports: ['22/SSH', '443/HTTPS', '9392/VEEAM'],      os: 'Windows Server 2022' },
        'server-b': { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.250.1.11',  desc: 'Decryption server -- key recovery engine',              ports: ['22/SSH', '443/HTTPS', '8443/DECRYPT'],    os: 'Ubuntu 24.04 LTS' },
        'server-c': { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.250.1.12',  desc: 'IOC scanner -- indicator of compromise database',       ports: ['22/SSH', '443/HTTPS', '9200/ELASTIC'],    os: 'Debian 12 Bookworm' },
        'server-d': { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.250.1.13',  desc: 'Network forensics -- packet capture analysis',          ports: ['22/SSH', '443/HTTPS', '3000/ARKIME'],     os: 'CentOS Stream 9' },
        'server-e': { label: 'SERVER-ECHO',    abbr: 'SRE', ip: '10.250.1.14',  desc: 'Recovery orchestrator -- disaster recovery control',    ports: ['22/SSH', '443/HTTPS', '8200/VAULT'],      os: 'RHEL 9.3' },

        /* Extraction point */
        'target':   { label: 'EXTRACTION',     abbr: 'EXT', ip: '10.250.1.99',  desc: 'Extraction point -- async operations complete',         ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* 3 enemies -- fight required */
        'enemy-1':  { label: 'ENEMY RANSOMWARE', abbr: 'RNS', ip: null, desc: 'Ransomware process -- fight to neutralize',                    ports: [] },
        'enemy-2':  { label: 'ENEMY CRYPTOMINER', abbr: 'CMR', ip: null, desc: 'Cryptominer daemon -- fight to neutralize',                   ports: [] },
        'enemy-3':  { label: 'ENEMY ROOTKIT',    abbr: 'RKT', ip: null, desc: 'Rootkit payload -- fight to neutralize',                       ports: [] },

        /* 3 holes -- jump required */
        'hole-1':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Encrypted partition gap -- jump to cross',                      ports: [] },
        'hole-2':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Corrupted volume -- jump to cross',                             ports: [] },
        'hole-3':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Wiped segment -- jump to cross',                                ports: [] },

        /* 3 fires -- extinguish required */
        'fire-1':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Encryption cascade fire -- extinguish to pass',                 ports: [] },
        'fire-2':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Data exfiltration blaze -- extinguish to pass',                 ports: [] },
        'fire-3':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Lateral movement fire -- extinguish to pass',                   ports: [] }
    },

    /* No traps */
    traps: [],

    /* Obstacles: all three types, balanced */
    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3'],
        fires: ['fire-1', 'fire-2', 'fire-3'],
        enemies: ['enemy-1', 'enemy-2', 'enemy-3']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER -- Map all 5 recovery servers',               check: 'nodesDiscovered.has("server-a") && nodesDiscovered.has("server-b") && nodesDiscovered.has("server-c") && nodesDiscovered.has("server-d") && nodesDiscovered.has("server-e")' },
        { id: 'obj_1', label: 'COMBAT -- Neutralize all 3 malware processes',          check: 'nodesDiscovered.has("enemy-1") && nodesDiscovered.has("enemy-2") && nodesDiscovered.has("enemy-3")' },
        { id: 'obj_2', label: 'NAVIGATE -- Handle all holes and fires',                check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3") && nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2") && nodesDiscovered.has("fire-3")' },
        { id: 'obj_3', label: 'EXTRACTION -- Reach the extraction point',              check: 'nodesDiscovered.has("target")' },
        { id: 'obj_4', label: 'STEALTH -- 4+ integrity remaining',                    check: 'integrity >= 4' }
    ],

    /* 7 integrity -- 9 obstacles on a 10x10 grid */
    integrity: 7,

    /* -- Completion screen -- */
    completion: {
        title: 'ASYNC OPERATOR',
        subtitle: 'async/await mastered. Clean code. Linear logic. Same power as callbacks and promises, none of the mess.',
        storageKey: 'hexworth_operator_js25'
    }
};
