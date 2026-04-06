/* PYTHON-46 / WAR ZONE — Act IV. 11x11 grid. All tools available. */
var PYTHON_46_CONFIG = {
    id: 'python-46', title: 'PYTHON-46 / WAR ZONE',
    subtitle: 'Dense enemy grid. Terminate systematically.', category: 'python-ops', difficulty: 4, inputMode: 'python', agent: { tier: 3 },
    grid: { rows: 11, cols: 11, cells: [
            ['gateway','empty','empty','empty','empty','empty','wall','empty','hole-13','empty','enemy-3'],
            ['empty','wall','enemy-9','srv-2','hole-7','empty','empty','empty','empty','empty','empty'],
            ['empty','srv-4','empty','empty','empty','empty','enemy-15','empty','fire-14','empty','empty'],
            ['hole-10','trap-2','empty','empty','empty','wall','wall','empty','empty','empty','empty'],
            ['empty','empty','empty','wall','empty','empty','wall','empty','empty','hole-1','empty'],
            ['empty','empty','empty','wall','empty','router','empty','empty','empty','wall','empty'],
            ['empty','empty','empty','enemy-12','srv-1','empty','empty','hole-4','empty','srv-3','empty'],
            ['empty','empty','empty','empty','empty','empty','empty','wall','empty','enemy-6','empty'],
            ['empty','empty','empty','empty','wall','empty','empty','empty','empty','empty','wall'],
            ['empty','fire-2','empty','empty','empty','fire-11','empty','empty','empty','empty','empty'],
            ['empty','empty','fire-5','wall','empty','empty','empty','fire-8','empty','trap-1','target']
    ], start: { col: 0, row: 0 } },
    nodes: {
        'gateway': { label: 'GATEWAY', abbr: 'GTW', ip: '10.346.0.1', desc: 'Entry', ports: ['22/SSH','443/HTTPS'], os: 'Cisco IOS 15.4' },
        'router': { label: 'ROUTER', abbr: 'RTR', ip: '10.346.0.2', desc: 'Router', ports: ['22/SSH','179/BGP'], os: 'Juniper JunOS 21.4' },
        'srv-1': { label: 'SRV-ALPHA', abbr: 'SRA', ip: '10.346.1.11', desc: 'ALPHA', ports: ['22/SSH','8080/HTTP'], os: 'Ubuntu 24.04 LTS' },        'srv-2': { label: 'SRV-BRAVO', abbr: 'SRB', ip: '10.346.1.12', desc: 'BRAVO', ports: ['22/SSH','8080/HTTP'], os: 'Ubuntu 24.04 LTS' },        'srv-3': { label: 'SRV-CHARLIE', abbr: 'SRC', ip: '10.346.1.13', desc: 'CHARLIE', ports: ['22/SSH','8080/HTTP'], os: 'Ubuntu 24.04 LTS' },        'srv-4': { label: 'SRV-DELTA', abbr: 'SRD', ip: '10.346.1.14', desc: 'DELTA', ports: ['22/SSH','8080/HTTP'], os: 'Ubuntu 24.04 LTS' },
        'target': { label: 'EXTRACTION', abbr: 'EXT', ip: '10.346.0.99', desc: 'Extract', ports: ['22/SSH','8443/HTTPS'], os: 'RHEL 9.3' },
        'hole-1': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] },        'fire-2': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Breach', ports: [] },        'enemy-3': { label: 'ENEMY HOSTILE', abbr: 'ENM', ip: null, desc: 'Hostile', ports: [] },        'hole-4': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] },        'fire-5': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Breach', ports: [] },        'enemy-6': { label: 'ENEMY HOSTILE', abbr: 'ENM', ip: null, desc: 'Hostile', ports: [] },        'hole-7': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] },        'fire-8': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Breach', ports: [] },        'enemy-9': { label: 'ENEMY HOSTILE', abbr: 'ENM', ip: null, desc: 'Hostile', ports: [] },        'hole-10': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] },        'fire-11': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Breach', ports: [] },        'enemy-12': { label: 'ENEMY HOSTILE', abbr: 'ENM', ip: null, desc: 'Hostile', ports: [] },        'hole-13': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] },        'fire-14': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Breach', ports: [] },        'enemy-15': { label: 'ENEMY HOSTILE', abbr: 'ENM', ip: null, desc: 'Hostile', ports: [] },
        'trap-1': { label: 'HONEYPOT', abbr: 'HP1', ip: '10.346.0.200', desc: 'Decoy', ports: ['22/SSH-FAKE'], os: 'Honeyd [TRAP]' },
        'trap-2': { label: 'IDS-SENSOR', abbr: 'IDS', ip: '10.346.0.201', desc: 'IDS', ports: ['514/SYSLOG'], os: 'Snort [TRAP]' }
    },
    traps: ['trap-1','trap-2'],
    obstacles: { holes: ['hole-1','hole-4','hole-7','hole-10','hole-13'], fires: ['fire-2','fire-5','fire-8','fire-11','fire-14'], enemies: ['enemy-3','enemy-6','enemy-9','enemy-12','enemy-15'] },
    gates: {},
    objectives: [
        { id: 'obj_0', label: 'CLEAR -- Navigate all obstacles', check: 'nodesDiscovered.size >= 8' },
        { id: 'obj_1', label: 'INTEL -- nmap all 4 servers', check: 'nmapTargets.has("srv-1") && nmapTargets.has("srv-2") && nmapTargets.has("srv-3") && nmapTargets.has("srv-4")' },
        { id: 'obj_2', label: 'EXTRACTION -- Reach extraction', check: 'nodesDiscovered.has("target")' },
        { id: 'obj_3', label: 'STEALTH -- 3+ integrity', check: 'integrity >= 3' }
    ],
    integrity: 8,
    completion: { title: 'WAR ZONE', subtitle: 'Level 46 complete.', storageKey: 'hexworth_operator_python46' }
};
