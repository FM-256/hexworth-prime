/* PYTHON-39 / BACKTRACK: MAZE — Act IV. 10x10 grid. All tools available. */
var PYTHON_39_CONFIG = {
    id: 'python-39', title: 'PYTHON-39 / BACKTRACK: MAZE',
    subtitle: 'Return to the maze. Tunnel makes it trivial.', category: 'python-ops', difficulty: 4, inputMode: 'python', agent: { tier: 3 },
    grid: { rows: 10, cols: 10, cells: [
            ['gateway','wall','empty','empty','empty','empty','empty','hole-4','empty','empty'],
            ['empty','empty','fire-2','empty','wall','empty','empty','wall','empty','empty'],
            ['empty','empty','empty','empty','empty','empty','empty','empty','enemy-9','empty'],
            ['enemy-3','empty','empty','empty','empty','wall','empty','empty','trap-1','empty'],
            ['empty','trap-2','srv-4','empty','wall','empty','hole-7','empty','empty','empty'],
            ['empty','empty','empty','empty','empty','router','empty','enemy-6','empty','empty'],
            ['empty','empty','empty','srv-3','fire-8','empty','empty','wall','empty','empty'],
            ['empty','empty','empty','empty','empty','srv-1','wall','empty','empty','empty'],
            ['empty','empty','empty','wall','srv-2','wall','empty','wall','empty','empty'],
            ['wall','empty','fire-5','hole-1','empty','empty','empty','empty','wall','target']
    ], start: { col: 0, row: 0 } },
    nodes: {
        'gateway': { label: 'GATEWAY', abbr: 'GTW', ip: '10.339.0.1', desc: 'Entry', ports: ['22/SSH','443/HTTPS'], os: 'Cisco IOS 15.4' },
        'router': { label: 'ROUTER', abbr: 'RTR', ip: '10.339.0.2', desc: 'Router', ports: ['22/SSH','179/BGP'], os: 'Juniper JunOS 21.4' },
        'srv-1': { label: 'SRV-ALPHA', abbr: 'SRA', ip: '10.339.1.11', desc: 'ALPHA', ports: ['22/SSH','8080/HTTP'], os: 'Ubuntu 24.04 LTS' },        'srv-2': { label: 'SRV-BRAVO', abbr: 'SRB', ip: '10.339.1.12', desc: 'BRAVO', ports: ['22/SSH','8080/HTTP'], os: 'Ubuntu 24.04 LTS' },        'srv-3': { label: 'SRV-CHARLIE', abbr: 'SRC', ip: '10.339.1.13', desc: 'CHARLIE', ports: ['22/SSH','8080/HTTP'], os: 'Ubuntu 24.04 LTS' },        'srv-4': { label: 'SRV-DELTA', abbr: 'SRD', ip: '10.339.1.14', desc: 'DELTA', ports: ['22/SSH','8080/HTTP'], os: 'Ubuntu 24.04 LTS' },
        'target': { label: 'EXTRACTION', abbr: 'EXT', ip: '10.339.0.99', desc: 'Extract', ports: ['22/SSH','8443/HTTPS'], os: 'RHEL 9.3' },
        'hole-1': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] },        'fire-2': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Breach', ports: [] },        'enemy-3': { label: 'ENEMY HOSTILE', abbr: 'ENM', ip: null, desc: 'Hostile', ports: [] },        'hole-4': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] },        'fire-5': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Breach', ports: [] },        'enemy-6': { label: 'ENEMY HOSTILE', abbr: 'ENM', ip: null, desc: 'Hostile', ports: [] },        'hole-7': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] },        'fire-8': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Breach', ports: [] },        'enemy-9': { label: 'ENEMY HOSTILE', abbr: 'ENM', ip: null, desc: 'Hostile', ports: [] },
        'trap-1': { label: 'HONEYPOT', abbr: 'HP1', ip: '10.339.0.200', desc: 'Decoy', ports: ['22/SSH-FAKE'], os: 'Honeyd [TRAP]' },
        'trap-2': { label: 'IDS-SENSOR', abbr: 'IDS', ip: '10.339.0.201', desc: 'IDS', ports: ['514/SYSLOG'], os: 'Snort [TRAP]' }
    },
    traps: ['trap-1','trap-2'],
    obstacles: { holes: ['hole-1','hole-4','hole-7'], fires: ['fire-2','fire-5','fire-8'], enemies: ['enemy-3','enemy-6','enemy-9'] },
    gates: {},
    objectives: [
        { id: 'obj_0', label: 'CLEAR -- Navigate all obstacles', check: 'nodesDiscovered.size >= 8' },
        { id: 'obj_1', label: 'INTEL -- nmap all 4 servers', check: 'nmapTargets.has("srv-1") && nmapTargets.has("srv-2") && nmapTargets.has("srv-3") && nmapTargets.has("srv-4")' },
        { id: 'obj_2', label: 'EXTRACTION -- Reach extraction', check: 'nodesDiscovered.has("target")' },
        { id: 'obj_3', label: 'STEALTH -- 3+ integrity', check: 'integrity >= 3' }
    ],
    integrity: 6,
    completion: { title: 'BACKTRACK: MAZE', subtitle: 'Level 39 complete.', storageKey: 'hexworth_operator_python39' }
};
