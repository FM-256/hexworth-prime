/* ================================================================
   PYTHON-26 / DEAD ENDS -- Mission Config
   ================================================================
   KEYS + LOCKED DOORS introduced. 8x8 grid. Clean environment.
   1 locked door, 1 key, minimal other obstacles.
   Student learns: find key → pick up automatically → unlock door.
   Nancy's recommendation: isolate new mechanic before combining.

   KEY MECHANIC:
   - key-* nodes are auto-collected when the agent walks onto them
   - agent.items shows collected items (Python list)
   - agent.unlock(dir) consumes a key to open a locked-door cell
   - locked-door cells block movement until unlocked
   ================================================================ */

var PYTHON_26_CONFIG = {
    id: 'python-26',
    title: 'PYTHON-26 / DEAD ENDS',
    subtitle: 'Locked doors block your path. Find the key.',
    category: 'python-ops',
    difficulty: 3,
    inputMode: 'python',
    agent: { tier: 3 },

    grid: {
        rows: 8, cols: 8,
        cells: [
            ['gateway',     'empty',       'empty',       'empty',       'key-1',       'empty',       'empty',  'wall'],
            ['empty',       'empty',       'router',      'empty',       'empty',       'empty',       'empty',  'empty'],
            ['empty',       'hole-1',      'empty',       'empty',       'empty',       'srv-1',       'empty',  'wall'],
            ['wall',        'empty',       'empty',       'empty',       'locked-door-1','empty',      'empty',  'empty'],
            ['empty',       'empty',       'fire-1',      'empty',       'empty',       'empty',       'srv-2',  'wall'],
            ['empty',       'enemy-1',     'empty',       'empty',       'empty',       'trap-1',      'empty',  'empty'],
            ['wall',        'empty',       'empty',       'srv-3',       'empty',       'empty',       'empty',  'wall'],
            ['wall',        'wall',        'empty',       'empty',       'empty',       'wall',        'empty',  'target']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway':        { label: 'GATEWAY',      abbr: 'GTW', ip: '10.260.0.1',  desc: 'Entry point',             ports: ['22/SSH','443/HTTPS'],        os: 'Cisco IOS 15.4' },
        'router':         { label: 'ROUTER',       abbr: 'RTR', ip: '10.260.0.2',  desc: 'Core router',             ports: ['22/SSH','179/BGP'],         os: 'Juniper JunOS 21.4' },
        'srv-1':          { label: 'SRV-ALPHA',    abbr: 'SRA', ip: '10.260.1.11', desc: 'Server Alpha',            ports: ['22/SSH','8080/HTTP'],        os: 'Ubuntu 24.04 LTS' },
        'srv-2':          { label: 'SRV-BRAVO',    abbr: 'SRB', ip: '10.260.1.12', desc: 'Server Bravo',            ports: ['22/SSH','5432/PostgreSQL'],  os: 'RHEL 9.3' },
        'srv-3':          { label: 'SRV-CHARLIE',  abbr: 'SRC', ip: '10.260.1.13', desc: 'Server Charlie',          ports: ['22/SSH','9200/ELASTIC'],     os: 'CentOS Stream 9' },
        'target':         { label: 'EXTRACTION',   abbr: 'EXT', ip: '10.260.0.99', desc: 'Extraction point',         ports: ['22/SSH','8443/HTTPS'],      os: 'RHEL 9.3' },

        /* KEY — auto-collected on entry */
        'key-1':          { label: 'ACCESS KEY',   abbr: 'KEY', ip: null, desc: 'Security credential — collected automatically', ports: [] },

        /* LOCKED DOOR — blocks until key used */
        'locked-door-1':  { label: 'LOCKED DOOR',  abbr: 'LCK', ip: null, desc: 'Sealed access point — use key to open',       ports: [] },

        /* Familiar obstacles — one of each to maintain context */
        'hole-1':         { label: 'HOLE',         abbr: 'HLE', ip: null, desc: 'Network gap — jump',              ports: [] },
        'fire-1':         { label: 'FIRE',         abbr: 'FIR', ip: null, desc: 'Active breach — extinguish',      ports: [] },
        'enemy-1':        { label: 'ENEMY GUARD',  abbr: 'GRD', ip: null, desc: 'Hostile — fight',                 ports: [] },
        'trap-1':         { label: 'HONEYPOT',     abbr: 'HP1', ip: '10.260.0.200', desc: 'Decoy',                 ports: ['22/SSH-FAKE'], os: 'Honeyd [TRAP]' }
    },

    traps: ['trap-1'],
    obstacles: {
        holes: ['hole-1'],
        fires: ['fire-1'],
        enemies: ['enemy-1']
    },
    gates: {},

    objectives: [
        { id: 'obj_0', label: 'COLLECT -- Find the access key',                   check: 'nodesDiscovered.has("key-1")' },
        { id: 'obj_1', label: 'UNLOCK -- Open the locked door',                   check: 'nodesDiscovered.has("locked-door-1")' },
        { id: 'obj_2', label: 'INTEL -- nmap all 3 servers',                      check: 'nmapTargets.has("srv-1") && nmapTargets.has("srv-2") && nmapTargets.has("srv-3")' },
        { id: 'obj_3', label: 'EXTRACTION -- Reach extraction point',             check: 'nodesDiscovered.has("target")' },
        { id: 'obj_4', label: 'STEALTH -- 3+ integrity remaining',               check: 'integrity >= 3' }
    ],

    integrity: 5,
    completion: { title: 'DEAD ENDS', subtitle: 'Key found. Door opened. New mechanic unlocked.', storageKey: 'hexworth_operator_python26' }
};
