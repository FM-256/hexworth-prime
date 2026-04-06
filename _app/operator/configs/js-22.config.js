/* ================================================================
   JS-22 / PROMISE LAND -- Mission Config
   ================================================================
   Tier 4 mission. 9x9 grid -- 81 cells.
   PROMISES INTRODUCED. The escape from callback hell.
   agent.scan() returns a Promise. .then() flattens the pyramid.

   DESIGN RATIONALE:
   - Same grid complexity as JS-21 -- 3 holes + 3 fires + 4 servers
   - The student discovers that agent.scan() returns a Promise object
   - Instead of nested callbacks, .then() chains operations flat
   - Each .then() receives the result of the previous operation
   - Return a value from .then() and the next .then() gets it
   - The SAME logic as JS-21, but the code is flat instead of nested
   - This is the "aha" moment: "oh, THAT'S what promises do"

   JS SKILL: Promises -- .then() chains
   - A Promise represents a future value
   - .then(function(result) { ... }) runs when the value arrives
   - Returning a Promise from .then() chains them: flat, not nested
   - agent.scan() returns a Promise that resolves with scan results
   - agent.move() returns a Promise that resolves when movement completes

   REFERENCE SOLUTION:
     agent.scan()
         .then(function(results) {
             results.forEach(function(node) {
                 if (node.name.includes('HOLE')) { agent.jump(node.direction); }
                 if (node.name.includes('FIRE')) { agent.extinguish(node.direction); }
             });
             return agent.move('east');
         })
         .then(function() {
             return agent.scan();
         })
         .then(function(results) {
             results.forEach(function(node) {
                 if (node.name.includes('HOLE')) { agent.jump(node.direction); }
                 if (node.name.includes('FIRE')) { agent.extinguish(node.direction); }
             });
             return agent.move('south');
         })
         .then(function() {
             return agent.scan();
         });

   CALLBACK HELL vs PROMISE LAND:
   - Callback: scan(function() { move(function() { scan(function() { ... }) }) })
   - Promise:  scan().then(() => move()).then(() => scan()).then(() => move())
   - Same logic, but flat. Each step is a .then() at the SAME indentation level.
   - Error handling: .catch() at the end catches ANY failure in the chain.

   GRID LAYOUT (9x9):
     [start]    [empty]    [fire-1]   [empty]    [empty]    [server-a] [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [hole-1]   [empty]    [empty]    [empty]    [server-b] [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [fire-2]   [empty]    [empty]
     [empty]    [empty]    [empty]    [hole-2]   [empty]    [empty]    [empty]    [empty]    [wall]
     [empty]    [server-c] [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [hole-3]   [empty]    [empty]    [empty]
     [empty]    [empty]    [fire-3]   [empty]    [empty]    [empty]    [empty]    [server-d] [empty]
     [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [empty]    [target]

   3 holes + 3 fires. Same density as JS-21. Flat .then() chains.
   ================================================================ */

var JS_22_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-22',
    title: 'JS-22 / PROMISE LAND',
    subtitle: 'The escape from callback hell. .then() flattens everything.',
    category: 'javascript-ops',
    difficulty: 3,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 3 = all obstacle handlers + promise returns) -- */
    agent: { tier: 3 },

    /* -- 9x9 Grid -- */
    grid: {
        rows: 9, cols: 9,
        cells: [
            /* Row 0 */ ['gateway',  'empty',    'fire-1',   'empty',    'empty',    'server-a', 'empty',    'empty',    'empty'],
            /* Row 1 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 2 */ ['hole-1',   'empty',    'empty',    'empty',    'server-b', 'empty',    'empty',    'empty',    'empty'],
            /* Row 3 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'fire-2',   'empty',    'empty'],
            /* Row 4 */ ['empty',    'empty',    'empty',    'hole-2',   'empty',    'empty',    'empty',    'empty',    'wall'],
            /* Row 5 */ ['empty',    'server-c', 'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty'],
            /* Row 6 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'hole-3',   'empty',    'empty',    'empty'],
            /* Row 7 */ ['empty',    'empty',    'fire-3',   'empty',    'empty',    'empty',    'empty',    'server-d', 'empty'],
            /* Row 8 */ ['empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'empty',    'target']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':  { label: 'GATEWAY',       abbr: 'GTW', ip: '10.220.1.1',   desc: 'Promise-enabled gateway -- flat chains ahead',          ports: ['22/SSH', '443/HTTPS'],                    os: 'Cisco Meraki MX' },

        /* 4 target servers -- identity management infrastructure */
        'server-a': { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '10.220.1.10',  desc: 'LDAP directory -- Active Directory forest root',        ports: ['22/SSH', '389/LDAP', '636/LDAPS'],        os: 'Windows Server 2022' },
        'server-b': { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '10.220.1.11',  desc: 'SSO gateway -- SAML 2.0 identity provider',            ports: ['22/SSH', '443/HTTPS', '8443/IDP'],        os: 'Ubuntu 24.04 LTS' },
        'server-c': { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '10.220.1.12',  desc: 'PKI server -- certificate authority',                   ports: ['22/SSH', '443/HTTPS', '8200/VAULT'],      os: 'RHEL 9.3' },
        'server-d': { label: 'SERVER-DELTA',   abbr: 'SRD', ip: '10.220.1.13',  desc: 'MFA server -- multi-factor authentication engine',      ports: ['22/SSH', '443/HTTPS', '1812/RADIUS'],     os: 'Debian 12 Bookworm' },

        /* Extraction point */
        'target':   { label: 'EXTRACTION',     abbr: 'EXT', ip: '10.220.1.99',  desc: 'Extraction point -- promise chain complete',            ports: ['22/SSH', '8443/HTTPS'],                   os: 'RHEL 9.3' },

        /* 3 holes -- jump required */
        'hole-1':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Directory gap -- jump to cross',                                ports: [] },
        'hole-2':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Authentication void -- jump to cross',                          ports: [] },
        'hole-3':   { label: 'HOLE',           abbr: 'HLE', ip: null, desc: 'Token gap -- jump to cross',                                    ports: [] },

        /* 3 fires -- extinguish required */
        'fire-1':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Credential leak fire -- extinguish to pass',                    ports: [] },
        'fire-2':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Session hijack blaze -- extinguish to pass',                    ports: [] },
        'fire-3':   { label: 'FIRE',           abbr: 'FIR', ip: null, desc: 'Certificate expiry fire -- extinguish to pass',                 ports: [] }
    },

    /* No traps -- focus on promise chains */
    traps: [],

    /* Obstacles: same density as JS-21 */
    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3'],
        fires: ['fire-1', 'fire-2', 'fire-3']
    },

    /* No gates */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER ALPHA -- Find the LDAP directory',            check: 'nodesDiscovered.has("server-a")' },
        { id: 'obj_1', label: 'DISCOVER BRAVO -- Find the SSO gateway',                check: 'nodesDiscovered.has("server-b")' },
        { id: 'obj_2', label: 'DISCOVER CHARLIE -- Find the PKI server',               check: 'nodesDiscovered.has("server-c")' },
        { id: 'obj_3', label: 'DISCOVER DELTA -- Find the MFA server',                 check: 'nodesDiscovered.has("server-d")' },
        { id: 'obj_4', label: 'NAVIGATE -- Handle all 6 obstacles via .then()',        check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3") && nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2") && nodesDiscovered.has("fire-3")' },
        { id: 'obj_5', label: 'EXTRACTION -- Reach the extraction point',              check: 'nodesDiscovered.has("target")' }
    ],

    /* 5 integrity -- same as JS-21 for direct comparison */
    integrity: 5,

    /* -- Completion screen -- */
    completion: {
        title: 'PROMISE LAND',
        subtitle: 'Flat chains. No nesting. Same power, clean code. Welcome to promises.',
        storageKey: 'hexworth_operator_js22'
    }
};
