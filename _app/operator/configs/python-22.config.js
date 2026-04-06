/* ================================================================
   PYTHON-22 / HOSTILE ZONE -- Mission Config
   ================================================================
   ENEMIES introduced. 8x8 grid.
   ISOLATED environment: enemies + traps ONLY. No holes or fires.
   Student focuses on learning fight() without other obstacle noise.
   Nancy's recommendation: isolate new mechanics on introduction.
   ================================================================ */

var PYTHON_22_CONFIG = {
    id: 'python-22',
    title: 'PYTHON-22 / HOSTILE ZONE',
    subtitle: 'New threat: enemies. Fight or be defeated.',
    category: 'python-ops',
    difficulty: 3,
    inputMode: 'python',
    agent: { tier: 3 },

    grid: {
        rows: 8, cols: 8,
        cells: [
            ['gateway',  'empty',     'empty',      'empty',      'empty',      'empty',      'empty',   'wall'],
            ['empty',    'empty',     'enemy-guard','empty',      'empty',      'srv-1',      'empty',   'empty'],
            ['empty',    'trap-1',    'empty',      'empty',      'empty',      'empty',      'empty',   'wall'],
            ['wall',     'empty',     'empty',      'router',     'enemy-drone','empty',      'empty',   'empty'],
            ['empty',    'empty',     'empty',      'empty',      'empty',      'empty',      'srv-2',   'wall'],
            ['empty',    'enemy-bot', 'empty',      'empty',      'empty',      'trap-2',     'empty',   'empty'],
            ['wall',     'empty',     'empty',      'srv-3',      'empty',      'empty',      'empty',   'wall'],
            ['wall',     'wall',      'empty',      'empty',      'empty',      'wall',       'empty',   'target']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway':     { label: 'GATEWAY',     abbr: 'GTW', ip: '10.220.0.1',  desc: 'Entry point',                  ports: ['22/SSH','443/HTTPS'],        os: 'Cisco IOS 15.4' },
        'router':      { label: 'ROUTER',      abbr: 'RTR', ip: '10.220.0.2',  desc: 'Core router',                  ports: ['22/SSH','179/BGP'],         os: 'Juniper JunOS 21.4' },
        'srv-1':       { label: 'SRV-ALPHA',   abbr: 'SRA', ip: '10.220.1.11', desc: 'Server Alpha',                 ports: ['22/SSH','8080/HTTP'],        os: 'Ubuntu 24.04 LTS' },
        'srv-2':       { label: 'SRV-BRAVO',   abbr: 'SRB', ip: '10.220.1.12', desc: 'Server Bravo',                 ports: ['22/SSH','5432/PostgreSQL'],  os: 'RHEL 9.3' },
        'srv-3':       { label: 'SRV-CHARLIE', abbr: 'SRC', ip: '10.220.1.13', desc: 'Server Charlie',               ports: ['22/SSH','9200/ELASTIC'],     os: 'CentOS Stream 9' },
        'target':      { label: 'EXTRACTION',  abbr: 'EXT', ip: '10.220.0.99', desc: 'Extraction point',              ports: ['22/SSH','8443/HTTPS'],      os: 'RHEL 9.3' },

        /* 3 enemies — NEW obstacle. Cannot be swept, jumped, or extinguished. Must be fought. */
        'enemy-guard': { label: 'ENEMY GUARD',  abbr: 'GRD', ip: null, desc: 'Hostile process — fight to defeat',     ports: [] },
        'enemy-drone': { label: 'ENEMY DRONE',  abbr: 'DRN', ip: null, desc: 'Patrol drone — fight to defeat',        ports: [] },
        'enemy-bot':   { label: 'ENEMY BOT',    abbr: 'BOT', ip: null, desc: 'Rogue bot — fight to defeat',           ports: [] },

        /* 2 traps — familiar baseline */
        'trap-1':      { label: 'HONEYPOT',    abbr: 'HP1', ip: '10.220.0.200', desc: 'Decoy',     ports: ['22/SSH-FAKE'], os: 'Honeyd [TRAP]' },
        'trap-2':      { label: 'IDS-SENSOR',  abbr: 'IDS', ip: '10.220.0.201', desc: 'IDS',       ports: ['514/SYSLOG'],  os: 'Snort [TRAP]' }
    },

    traps: ['trap-1', 'trap-2'],
    obstacles: { enemies: ['enemy-guard', 'enemy-drone', 'enemy-bot'] },
    gates: {},

    objectives: [
        { id: 'obj_0', label: 'COMBAT -- Defeat all 3 enemies',           check: 'nodesDiscovered.has("enemy-guard") && nodesDiscovered.has("enemy-drone") && nodesDiscovered.has("enemy-bot")' },
        { id: 'obj_1', label: 'INTEL -- nmap all 3 servers',              check: 'nmapTargets.has("srv-1") && nmapTargets.has("srv-2") && nmapTargets.has("srv-3")' },
        { id: 'obj_2', label: 'EXTRACTION -- Reach extraction point',     check: 'nodesDiscovered.has("target")' },
        { id: 'obj_3', label: 'STEALTH -- 3+ integrity remaining',        check: 'integrity >= 3' }
    ],

    integrity: 5,
    completion: { title: 'HOSTILE ZONE', subtitle: 'Three hostiles neutralized. Zone cleared.', storageKey: 'hexworth_operator_python22' }
};
