/* ================================================================
   JS-01 / HELLO OPERATOR -- Mission Config
   ================================================================
   Tier 1 mission. 4x4 grid — 16 cells.
   The very first JavaScript mission. Zero friction. Just learn the API.

   DESIGN RATIONALE:
   - Tiny 4x4 grid with only 3 servers and zero traps
   - Student learns: agent.scan() and agent.move('direction')
   - Emphasis on JavaScript syntax: method calls end with semicolons
   - No conditionals, no loops, no variables needed
   - The goal is simply "call scan, call move, repeat"
   - Success is automatic if the student follows instructions

   JS SKILL: Method calls + semicolons
   - JavaScript statements end with semicolons
   - Methods are called with dot notation: agent.scan()
   - Strings use quotes: agent.move('east')

   REFERENCE SOLUTION (what students should discover):
     agent.scan();
     agent.move('east');
     agent.scan();
     agent.move('south');
     agent.scan();
     agent.move('east');

   WHY THIS WORKS:
   - 3 servers placed along a simple L-shaped path
   - No traps, no gates, no surprises
   - Student can't fail unless they refuse to type anything
   - Builds confidence: "I can control the agent"

   GRID LAYOUT (4x4):
     [start]    [server-a] [empty]    [empty]
     [empty]    [empty]    [empty]    [empty]
     [empty]    [server-b] [empty]    [empty]
     [empty]    [empty]    [server-c] [empty]

   3 servers in an L-shaped path from the gateway
   ================================================================ */

var JS_01_CONFIG = {
    /* -- Mission identity -- */
    id: 'js-01',
    title: 'JS-01 / HELLO OPERATOR',
    subtitle: 'First contact. Learn to scan and move.',
    category: 'javascript-ops',
    difficulty: 1,
    inputMode: 'javascript',

    /* -- Agent tier (Tier 1 = basics only: scan, move) -- */
    agent: { tier: 1 },

    /* -- 4x4 Grid -- */
    grid: {
        rows: 4, cols: 4,
        cells: [
            /* Row 0 */ ['gateway',  'server-a', 'empty',    'empty'],
            /* Row 1 */ ['empty',    'empty',    'empty',    'empty'],
            /* Row 2 */ ['empty',    'server-b', 'empty',    'empty'],
            /* Row 3 */ ['empty',    'empty',    'server-c', 'empty']
        ],
        /* Agent starts at top-left corner */
        start: { col: 0, row: 0 }
    },

    /* -- Node definitions -- */
    nodes: {
        /* Entry point */
        'gateway':  { label: 'GATEWAY',       abbr: 'GTW', ip: '192.168.1.1',  desc: 'Edge gateway — your insertion point',     ports: ['22/SSH', '443/HTTPS'],                  os: 'Cisco IOS 15.4' },

        /* 3 target servers — discover all 3 to complete the mission */
        'server-a': { label: 'SERVER-ALPHA',   abbr: 'SRA', ip: '192.168.1.10', desc: 'Web server — hosts the company portal',   ports: ['22/SSH', '80/HTTP', '443/HTTPS'],       os: 'Ubuntu 24.04 LTS' },
        'server-b': { label: 'SERVER-BRAVO',   abbr: 'SRB', ip: '192.168.1.11', desc: 'File server — internal document store',   ports: ['22/SSH', '445/SMB', '2049/NFS'],        os: 'Windows Server 2022' },
        'server-c': { label: 'SERVER-CHARLIE', abbr: 'SRC', ip: '192.168.1.12', desc: 'Database server — credentials vault',     ports: ['22/SSH', '3306/MySQL', '5432/PostgreSQL'], os: 'RHEL 9.3' }
    },

    /* No traps — first mission is zero-friction */
    traps: [],

    /* No gates — pure movement + scan */
    gates: {},

    /* -- Objectives -- */
    objectives: [
        { id: 'obj_0', label: 'DISCOVER ALPHA -- Find the web server',       check: 'nodesDiscovered.has("server-a")' },
        { id: 'obj_1', label: 'DISCOVER BRAVO -- Find the file server',      check: 'nodesDiscovered.has("server-b")' },
        { id: 'obj_2', label: 'DISCOVER CHARLIE -- Find the database server', check: 'nodesDiscovered.has("server-c")' }
    ],

    /* Generous integrity — no traps exist anyway */
    integrity: 3,

    /* -- Completion screen -- */
    completion: {
        title: 'HELLO OPERATOR',
        subtitle: 'All three servers discovered. Welcome to the grid.',
        storageKey: 'hexworth_operator_js01'
    }
};
