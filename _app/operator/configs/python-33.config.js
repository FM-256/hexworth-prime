/* PYTHON-33 / SCORCHED EARTH — bridge + fireproof combo. 10x10 grid. Nested: hole→fire→server. */
var PYTHON_33_CONFIG = {
    id: 'python-33', title: 'PYTHON-33 / SCORCHED EARTH',
    subtitle: 'Holes behind fires. Fires behind holes. Chain your tools.', category: 'python-ops', difficulty: 4, inputMode: 'python', agent: { tier: 3 },
    grid: { rows: 10, cols: 10, cells: [
        ['gateway','empty','hole-1','fire-1','empty','empty','empty','empty','empty','wall'],
        ['empty','empty','empty','empty','srv-1','empty','fire-2','hole-2','empty','empty'],
        ['empty','fire-3','empty','empty','empty','empty','empty','empty','empty','wall'],
        ['wall','empty','empty','router','empty','hole-3','fire-4','empty','srv-2','empty'],
        ['empty','hole-4','fire-5','empty','empty','empty','empty','empty','empty','wall'],
        ['empty','empty','empty','empty','enemy-1','empty','empty','fire-6','empty','empty'],
        ['wall','empty','fire-7','hole-5','empty','srv-3','empty','empty','empty','wall'],
        ['empty','empty','empty','empty','empty','empty','hole-6','fire-8','empty','empty'],
        ['empty','trap-1','empty','empty','enemy-2','empty','empty','empty','srv-4','empty'],
        ['wall','wall','empty','empty','empty','wall','empty','empty','empty','target']
    ], start: { col: 0, row: 0 } },
    nodes: {
        'gateway': { label: 'GATEWAY', abbr: 'GTW', ip: '10.330.0.1', desc: 'Entry', ports: ['22/SSH','443/HTTPS'], os: 'Cisco IOS 15.4' },
        'router':  { label: 'ROUTER', abbr: 'RTR', ip: '10.330.0.2', desc: 'Router', ports: ['22/SSH','179/BGP'], os: 'Juniper JunOS 21.4' },
        'srv-1':   { label: 'SRV-ALPHA', abbr: 'SRA', ip: '10.330.1.11', desc: 'Alpha', ports: ['22/SSH','8080/HTTP'], os: 'Ubuntu 24.04 LTS' },
        'srv-2':   { label: 'SRV-BRAVO', abbr: 'SRB', ip: '10.330.1.12', desc: 'Bravo', ports: ['22/SSH','5432/PostgreSQL'], os: 'RHEL 9.3' },
        'srv-3':   { label: 'SRV-CHARLIE', abbr: 'SRC', ip: '10.330.1.13', desc: 'Charlie', ports: ['22/SSH','9200/ELASTIC'], os: 'CentOS Stream 9' },
        'srv-4':   { label: 'SRV-DELTA', abbr: 'SRD', ip: '10.330.1.14', desc: 'Delta', ports: ['22/SSH','8443/HTTPS'], os: 'Debian 12' },
        'target':  { label: 'EXTRACTION', abbr: 'EXT', ip: '10.330.0.99', desc: 'Extract', ports: ['22/SSH','8443/HTTPS'], os: 'RHEL 9.3' },
        'hole-1': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] }, 'hole-2': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] },
        'hole-3': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] }, 'hole-4': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] },
        'hole-5': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] }, 'hole-6': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] },
        'fire-1': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Breach', ports: [] }, 'fire-2': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Thermal', ports: [] },
        'fire-3': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Burning', ports: [] }, 'fire-4': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Meltdown', ports: [] },
        'fire-5': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Corridor', ports: [] }, 'fire-6': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'East', ports: [] },
        'fire-7': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'West', ports: [] }, 'fire-8': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'South', ports: [] },
        'enemy-1': { label: 'ENEMY GUARD', abbr: 'GRD', ip: null, desc: 'Guard', ports: [] }, 'enemy-2': { label: 'ENEMY DRONE', abbr: 'DRN', ip: null, desc: 'Drone', ports: [] },
        'trap-1': { label: 'HONEYPOT', abbr: 'HP1', ip: '10.330.0.200', desc: 'Decoy', ports: ['22/SSH-FAKE'], os: 'Honeyd [TRAP]' }
    },
    traps: ['trap-1'], obstacles: { holes: ['hole-1','hole-2','hole-3','hole-4','hole-5','hole-6'], fires: ['fire-1','fire-2','fire-3','fire-4','fire-5','fire-6','fire-7','fire-8'], enemies: ['enemy-1','enemy-2'] }, gates: {},
    objectives: [
        { id: 'obj_0', label: 'CHAIN -- Navigate nested hole+fire obstacles', check: 'nodesDiscovered.size >= 12' },
        { id: 'obj_1', label: 'INTEL -- nmap all 4 servers', check: 'nmapTargets.has("srv-1") && nmapTargets.has("srv-2") && nmapTargets.has("srv-3") && nmapTargets.has("srv-4")' },
        { id: 'obj_2', label: 'EXTRACTION -- Reach extraction', check: 'nodesDiscovered.has("target")' },
        { id: 'obj_3', label: 'STEALTH -- 3+ integrity', check: 'integrity >= 3' }
    ],
    integrity: 6, completion: { title: 'SCORCHED EARTH', subtitle: 'Nested obstacles cleared. Two tools chained.', storageKey: 'hexworth_operator_python33' }
};
