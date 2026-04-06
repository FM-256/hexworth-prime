/* ================================================================
   PYTHON-24 / THE GAUNTLET -- Mission Config
   ================================================================
   ALL FOUR obstacle types combined for the first time. 8x8 grid.
   Student's if/elif chain now has 4 branches: trap, hole, fire, enemy.
   This is the level where the elif chain starts to feel heavy.

   The student who writes:
     if 'HOLE' in name: agent.jump(d)
     elif 'FIRE' in name: agent.extinguish(d)
     elif 'ENEMY' in name: agent.fight(d)
     elif 'TRAP' in name: agent.sweep(d)
   ...is writing correct but verbose code. The dispatch table seed
   is planted here but not forced until much later.
   ================================================================ */

var PYTHON_24_CONFIG = {
    id: 'python-24',
    title: 'PYTHON-24 / THE GAUNTLET',
    subtitle: 'All four threats. One if/elif chain to rule them all.',
    category: 'python-ops',
    difficulty: 4,
    inputMode: 'python',
    agent: { tier: 3 },

    grid: {
        rows: 8, cols: 8,
        cells: [
            ['gateway',     'empty',       'hole-1',      'empty',       'fire-1',      'empty',       'empty',  'wall'],
            ['empty',       'enemy-alpha', 'empty',       'router',      'empty',       'srv-1',       'empty',  'empty'],
            ['empty',       'trap-1',      'empty',       'empty',       'empty',       'hole-2',      'empty',  'wall'],
            ['wall',        'empty',       'fire-2',      'empty',       'empty',       'empty',       'empty',  'empty'],
            ['empty',       'empty',       'empty',       'enemy-bravo', 'empty',       'fire-3',      'srv-2',  'wall'],
            ['empty',       'hole-3',      'empty',       'empty',       'trap-2',      'empty',       'empty',  'empty'],
            ['wall',        'empty',       'enemy-charlie','empty',      'srv-3',       'empty',       'empty',  'wall'],
            ['wall',        'wall',        'empty',       'empty',       'empty',       'wall',        'empty',  'target']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway':       { label: 'GATEWAY',       abbr: 'GTW', ip: '10.240.0.1',  desc: 'Entry point',       ports: ['22/SSH','443/HTTPS'],        os: 'Cisco IOS 15.4' },
        'router':        { label: 'ROUTER',        abbr: 'RTR', ip: '10.240.0.2',  desc: 'Core router',       ports: ['22/SSH','179/BGP'],         os: 'Juniper JunOS 21.4' },
        'srv-1':         { label: 'SRV-ALPHA',     abbr: 'SRA', ip: '10.240.1.11', desc: 'Server Alpha',      ports: ['22/SSH','8080/HTTP'],        os: 'Ubuntu 24.04 LTS' },
        'srv-2':         { label: 'SRV-BRAVO',     abbr: 'SRB', ip: '10.240.1.12', desc: 'Server Bravo',      ports: ['22/SSH','5432/PostgreSQL'],  os: 'RHEL 9.3' },
        'srv-3':         { label: 'SRV-CHARLIE',   abbr: 'SRC', ip: '10.240.1.13', desc: 'Server Charlie',    ports: ['22/SSH','9200/ELASTIC'],     os: 'CentOS Stream 9' },
        'target':        { label: 'EXTRACTION',    abbr: 'EXT', ip: '10.240.0.99', desc: 'Extraction point',   ports: ['22/SSH','8443/HTTPS'],      os: 'RHEL 9.3' },

        'hole-1':        { label: 'HOLE',          abbr: 'HLE', ip: null, desc: 'Network gap',         ports: [] },
        'hole-2':        { label: 'HOLE',          abbr: 'HLE', ip: null, desc: 'Broken link',         ports: [] },
        'hole-3':        { label: 'HOLE',          abbr: 'HLE', ip: null, desc: 'Collapsed path',      ports: [] },
        'fire-1':        { label: 'FIRE',          abbr: 'FIR', ip: null, desc: 'Active breach',       ports: [] },
        'fire-2':        { label: 'FIRE',          abbr: 'FIR', ip: null, desc: 'Thermal barrier',     ports: [] },
        'fire-3':        { label: 'FIRE',          abbr: 'FIR', ip: null, desc: 'Burning corridor',    ports: [] },
        'enemy-alpha':   { label: 'ENEMY GUARD',   abbr: 'GRD', ip: null, desc: 'Hostile guard',       ports: [] },
        'enemy-bravo':   { label: 'ENEMY DRONE',   abbr: 'DRN', ip: null, desc: 'Patrol drone',        ports: [] },
        'enemy-charlie': { label: 'ENEMY BOT',     abbr: 'BOT', ip: null, desc: 'Rogue bot',           ports: [] },
        'trap-1':        { label: 'HONEYPOT',      abbr: 'HP1', ip: '10.240.0.200', desc: 'Decoy',     ports: ['22/SSH-FAKE'], os: 'Honeyd [TRAP]' },
        'trap-2':        { label: 'IDS-SENSOR',    abbr: 'IDS', ip: '10.240.0.201', desc: 'IDS',       ports: ['514/SYSLOG'],  os: 'Snort [TRAP]' }
    },

    traps: ['trap-1', 'trap-2'],
    obstacles: {
        holes: ['hole-1', 'hole-2', 'hole-3'],
        fires: ['fire-1', 'fire-2', 'fire-3'],
        enemies: ['enemy-alpha', 'enemy-bravo', 'enemy-charlie']
    },
    gates: {},

    objectives: [
        { id: 'obj_0', label: 'NAVIGATE -- Cross all 3 holes',            check: 'nodesDiscovered.has("hole-1") && nodesDiscovered.has("hole-2") && nodesDiscovered.has("hole-3")' },
        { id: 'obj_1', label: 'NAVIGATE -- Extinguish all 3 fires',       check: 'nodesDiscovered.has("fire-1") && nodesDiscovered.has("fire-2") && nodesDiscovered.has("fire-3")' },
        { id: 'obj_2', label: 'COMBAT -- Defeat all 3 enemies',           check: 'nodesDiscovered.has("enemy-alpha") && nodesDiscovered.has("enemy-bravo") && nodesDiscovered.has("enemy-charlie")' },
        { id: 'obj_3', label: 'INTEL -- nmap all 3 servers',              check: 'nmapTargets.has("srv-1") && nmapTargets.has("srv-2") && nmapTargets.has("srv-3")' },
        { id: 'obj_4', label: 'EXTRACTION -- Reach extraction point',     check: 'nodesDiscovered.has("target")' },
        { id: 'obj_5', label: 'STEALTH -- 3+ integrity remaining',        check: 'integrity >= 3' }
    ],

    integrity: 6,
    completion: { title: 'THE GAUNTLET', subtitle: 'All four threats handled. Gauntlet passed.', storageKey: 'hexworth_operator_python24' }
};
