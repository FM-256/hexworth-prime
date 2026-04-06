/* PYTHON-35 / BACKTRACK: HOSTILE — Return with terminate. 10x10. Enemies are trivial now. */
var PYTHON_35_CONFIG = {
    id: 'python-35', title: 'PYTHON-35 / BACKTRACK: HOSTILE',
    subtitle: 'Return with terminate. Enemies fall permanently.', category: 'python-ops', difficulty: 3, inputMode: 'python', agent: { tier: 3 },
    grid: { rows: 10, cols: 10, cells: [
        ['gateway','empty','empty','enemy-1','empty','empty','empty','enemy-2','empty','wall'],
        ['empty','empty','hole-1','empty','srv-1','empty','empty','empty','empty','empty'],
        ['empty','enemy-3','empty','empty','empty','fire-1','empty','enemy-4','empty','wall'],
        ['wall','empty','empty','router','empty','empty','empty','empty','empty','empty'],
        ['empty','empty','enemy-5','empty','empty','empty','empty','srv-2','empty','wall'],
        ['empty','fire-2','empty','empty','enemy-6','empty','empty','empty','empty','empty'],
        ['wall','empty','empty','enemy-7','empty','srv-3','empty','empty','empty','wall'],
        ['empty','empty','empty','empty','empty','empty','enemy-8','empty','srv-bonus','empty'],
        ['empty','trap-1','empty','empty','hole-2','empty','empty','empty','empty','empty'],
        ['wall','wall','empty','empty','empty','wall','empty','empty','empty','target']
    ], start: { col: 0, row: 0 } },
    nodes: {
        'gateway': { label: 'GATEWAY', abbr: 'GTW', ip: '10.350.0.1', desc: 'Entry', ports: ['22/SSH','443/HTTPS'], os: 'Cisco IOS 15.4' },
        'router': { label: 'ROUTER', abbr: 'RTR', ip: '10.350.0.2', desc: 'Router', ports: ['22/SSH','179/BGP'], os: 'Juniper JunOS 21.4' },
        'srv-1': { label: 'SRV-ALPHA', abbr: 'SRA', ip: '10.350.1.11', desc: 'Alpha', ports: ['22/SSH','8080/HTTP'], os: 'Ubuntu 24.04 LTS' },
        'srv-2': { label: 'SRV-BRAVO', abbr: 'SRB', ip: '10.350.1.12', desc: 'Bravo', ports: ['22/SSH','5432/PostgreSQL'], os: 'RHEL 9.3' },
        'srv-3': { label: 'SRV-CHARLIE', abbr: 'SRC', ip: '10.350.1.13', desc: 'Charlie', ports: ['22/SSH','9200/ELASTIC'], os: 'CentOS Stream 9' },
        'srv-bonus': { label: 'SRV-HIDDEN', abbr: 'SRH', ip: '10.350.1.99', desc: 'Hidden — terminate to reach', ports: ['22/SSH','8443/HTTPS'], os: 'RHEL 9.3' },
        'target': { label: 'EXTRACTION', abbr: 'EXT', ip: '10.350.0.99', desc: 'Extract', ports: ['22/SSH','8443/HTTPS'], os: 'RHEL 9.3' },
        'enemy-1': { label: 'ENEMY GUARD', abbr: 'GRD', ip: null, desc: 'Guard', ports: [] }, 'enemy-2': { label: 'ENEMY DRONE', abbr: 'DRN', ip: null, desc: 'Drone', ports: [] },
        'enemy-3': { label: 'ENEMY BOT', abbr: 'BOT', ip: null, desc: 'Bot', ports: [] }, 'enemy-4': { label: 'ENEMY SENTRY', abbr: 'SNT', ip: null, desc: 'Sentry', ports: [] },
        'enemy-5': { label: 'ENEMY PATROL', abbr: 'PTR', ip: null, desc: 'Patrol', ports: [] }, 'enemy-6': { label: 'ENEMY SCOUT', abbr: 'SCT', ip: null, desc: 'Scout', ports: [] },
        'enemy-7': { label: 'ENEMY HACKER', abbr: 'HCK', ip: null, desc: 'Hacker', ports: [] }, 'enemy-8': { label: 'ENEMY AGENT', abbr: 'AGT', ip: null, desc: 'Rogue agent guarding bonus', ports: [] },
        'hole-1': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] }, 'hole-2': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] },
        'fire-1': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Breach', ports: [] }, 'fire-2': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Thermal', ports: [] },
        'trap-1': { label: 'HONEYPOT', abbr: 'HP1', ip: '10.350.0.200', desc: 'Decoy', ports: ['22/SSH-FAKE'], os: 'Honeyd [TRAP]' }
    },
    traps: ['trap-1'], obstacles: { holes: ['hole-1','hole-2'], fires: ['fire-1','fire-2'], enemies: ['enemy-1','enemy-2','enemy-3','enemy-4','enemy-5','enemy-6','enemy-7','enemy-8'] }, gates: {},
    objectives: [
        { id: 'obj_0', label: 'TERMINATE -- Permanently eliminate 8 enemies', check: 'nodesDiscovered.size >= 12' },
        { id: 'obj_1', label: 'INTEL -- nmap 3 standard servers', check: 'nmapTargets.has("srv-1") && nmapTargets.has("srv-2") && nmapTargets.has("srv-3")' },
        { id: 'obj_2', label: 'BONUS -- Reach hidden server (terminate guard)', check: 'nmapTargets.has("srv-bonus")' },
        { id: 'obj_3', label: 'EXTRACTION -- Reach extraction', check: 'nodesDiscovered.has("target")' }
    ],
    integrity: 6, completion: { title: 'BACKTRACK: HOSTILE', subtitle: 'Terminate mastered. Eight enemies permanently eliminated.', storageKey: 'hexworth_operator_python35' }
};
