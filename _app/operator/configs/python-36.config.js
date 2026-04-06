/* PYTHON-36 / FORTRESS — All 3 permanent tools required. 10x10. Full dispatch table. */
var PYTHON_36_CONFIG = {
    id: 'python-36', title: 'PYTHON-36 / FORTRESS',
    subtitle: 'All three tools. Full dispatch table. No shortcuts.', category: 'python-ops', difficulty: 4, inputMode: 'python', agent: { tier: 3 },
    grid: { rows: 10, cols: 10, cells: [
        ['gateway','empty','hole-1','fire-1','empty','enemy-1','empty','empty','empty','wall'],
        ['empty','empty','empty','empty','srv-1','empty','fire-2','empty','hole-2','empty'],
        ['enemy-2','empty','empty','empty','empty','empty','empty','empty','empty','wall'],
        ['wall','empty','fire-3','empty','router','empty','hole-3','empty','enemy-3','empty'],
        ['empty','hole-4','empty','empty','empty','enemy-4','empty','srv-2','empty','wall'],
        ['empty','empty','fire-4','empty','empty','empty','empty','empty','fire-5','empty'],
        ['wall','enemy-5','empty','hole-5','empty','srv-3','empty','empty','empty','wall'],
        ['empty','empty','empty','empty','fire-6','empty','enemy-6','empty','empty','empty'],
        ['empty','trap-1','hole-6','empty','empty','empty','empty','trap-2','empty','empty'],
        ['wall','wall','empty','empty','empty','wall','empty','empty','empty','target']
    ], start: { col: 0, row: 0 } },
    nodes: {
        'gateway': { label: 'GATEWAY', abbr: 'GTW', ip: '10.360.0.1', desc: 'Entry', ports: ['22/SSH','443/HTTPS'], os: 'Cisco IOS 15.4' },
        'router': { label: 'ROUTER', abbr: 'RTR', ip: '10.360.0.2', desc: 'Router', ports: ['22/SSH','179/BGP'], os: 'Juniper JunOS 21.4' },
        'srv-1': { label: 'SRV-ALPHA', abbr: 'SRA', ip: '10.360.1.11', desc: 'Alpha', ports: ['22/SSH','8080/HTTP'], os: 'Ubuntu 24.04 LTS' },
        'srv-2': { label: 'SRV-BRAVO', abbr: 'SRB', ip: '10.360.1.12', desc: 'Bravo', ports: ['22/SSH','5432/PostgreSQL'], os: 'RHEL 9.3' },
        'srv-3': { label: 'SRV-CHARLIE', abbr: 'SRC', ip: '10.360.1.13', desc: 'Charlie', ports: ['22/SSH','9200/ELASTIC'], os: 'CentOS Stream 9' },
        'target': { label: 'EXTRACTION', abbr: 'EXT', ip: '10.360.0.99', desc: 'Extract', ports: ['22/SSH','8443/HTTPS'], os: 'RHEL 9.3' },
        'hole-1': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] }, 'hole-2': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] },
        'hole-3': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] }, 'hole-4': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] },
        'hole-5': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] }, 'hole-6': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] },
        'fire-1': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Breach', ports: [] }, 'fire-2': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Thermal', ports: [] },
        'fire-3': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Burning', ports: [] }, 'fire-4': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Corridor', ports: [] },
        'fire-5': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'East', ports: [] }, 'fire-6': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'South', ports: [] },
        'enemy-1': { label: 'ENEMY GUARD', abbr: 'GRD', ip: null, desc: 'Guard', ports: [] }, 'enemy-2': { label: 'ENEMY DRONE', abbr: 'DRN', ip: null, desc: 'Drone', ports: [] },
        'enemy-3': { label: 'ENEMY BOT', abbr: 'BOT', ip: null, desc: 'Bot', ports: [] }, 'enemy-4': { label: 'ENEMY SENTRY', abbr: 'SNT', ip: null, desc: 'Sentry', ports: [] },
        'enemy-5': { label: 'ENEMY PATROL', abbr: 'PTR', ip: null, desc: 'Patrol', ports: [] }, 'enemy-6': { label: 'ENEMY SCOUT', abbr: 'SCT', ip: null, desc: 'Scout', ports: [] },
        'trap-1': { label: 'HONEYPOT', abbr: 'HP1', ip: '10.360.0.200', desc: 'Decoy', ports: ['22/SSH-FAKE'], os: 'Honeyd [TRAP]' },
        'trap-2': { label: 'IDS-SENSOR', abbr: 'IDS', ip: '10.360.0.201', desc: 'IDS', ports: ['514/SYSLOG'], os: 'Snort [TRAP]' }
    },
    traps: ['trap-1','trap-2'], obstacles: { holes: ['hole-1','hole-2','hole-3','hole-4','hole-5','hole-6'], fires: ['fire-1','fire-2','fire-3','fire-4','fire-5','fire-6'], enemies: ['enemy-1','enemy-2','enemy-3','enemy-4','enemy-5','enemy-6'] }, gates: {},
    objectives: [
        { id: 'obj_0', label: 'CLEAR -- Use all 3 permanent tools (bridge+fireproof+terminate)', check: 'nodesDiscovered.size >= 15' },
        { id: 'obj_1', label: 'INTEL -- nmap all 3 servers', check: 'nmapTargets.has("srv-1") && nmapTargets.has("srv-2") && nmapTargets.has("srv-3")' },
        { id: 'obj_2', label: 'EXTRACTION -- Reach extraction', check: 'nodesDiscovered.has("target")' },
        { id: 'obj_3', label: 'STEALTH -- 4+ integrity', check: 'integrity >= 4' }
    ],
    integrity: 7, completion: { title: 'FORTRESS', subtitle: 'Three permanent tools deployed. Fortress breached.', storageKey: 'hexworth_operator_python36' }
};
