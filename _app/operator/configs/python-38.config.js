/* PYTHON-38 / TUNNEL VISION — Tunnel mastery. 10x10 heavy wall maze. Must tunnel 4 walls. */
var PYTHON_38_CONFIG = {
    id: 'python-38', title: 'PYTHON-38 / TUNNEL VISION', subtitle: 'Heavy walls. Tunnel through or go around. Your choice.',
    category: 'python-ops', difficulty: 4, inputMode: 'python', agent: { tier: 3 },
    grid: { rows: 10, cols: 10, cells: [
        ['gateway','empty','wall','empty','empty','wall','empty','empty','empty','wall'],
        ['empty','empty','wall','empty','srv-1','wall','empty','empty','empty','empty'],
        ['empty','wall','empty','empty','wall','empty','empty','wall','empty','wall'],
        ['empty','empty','empty','wall','empty','empty','wall','empty','empty','empty'],
        ['wall','empty','wall','empty','router','empty','wall','empty','wall','wall'],
        ['empty','empty','empty','wall','empty','empty','empty','wall','empty','empty'],
        ['empty','wall','empty','empty','wall','srv-2','empty','empty','wall','wall'],
        ['empty','empty','wall','empty','empty','wall','empty','empty','empty','empty'],
        ['wall','empty','empty','wall','empty','empty','wall','srv-3','empty','empty'],
        ['wall','wall','empty','empty','empty','wall','empty','empty','empty','target']
    ], start: { col: 0, row: 0 } },
    nodes: {
        'gateway': { label: 'GATEWAY', abbr: 'GTW', ip: '10.380.0.1', desc: 'Entry — wall maze begins', ports: ['22/SSH','443/HTTPS'], os: 'Cisco IOS 15.4' },
        'router': { label: 'ROUTER', abbr: 'RTR', ip: '10.380.0.2', desc: 'Core router — deep in maze', ports: ['22/SSH','179/BGP'], os: 'Juniper JunOS 21.4' },
        'srv-1': { label: 'SRV-ALPHA', abbr: 'SRA', ip: '10.380.1.11', desc: 'Alpha', ports: ['22/SSH','8080/HTTP'], os: 'Ubuntu 24.04 LTS' },
        'srv-2': { label: 'SRV-BRAVO', abbr: 'SRB', ip: '10.380.1.12', desc: 'Bravo', ports: ['22/SSH','5432/PostgreSQL'], os: 'RHEL 9.3' },
        'srv-3': { label: 'SRV-CHARLIE', abbr: 'SRC', ip: '10.380.1.13', desc: 'Charlie', ports: ['22/SSH','9200/ELASTIC'], os: 'CentOS Stream 9' },
        'target': { label: 'EXTRACTION', abbr: 'EXT', ip: '10.380.0.99', desc: 'Extraction', ports: ['22/SSH','8443/HTTPS'], os: 'RHEL 9.3' }
    },
    traps: [], obstacles: {}, gates: {},
    objectives: [
        { id: 'obj_0', label: 'TUNNEL -- Bypass walls to reach all 3 servers', check: 'nmapTargets.has("srv-1") && nmapTargets.has("srv-2") && nmapTargets.has("srv-3")' },
        { id: 'obj_1', label: 'NAVIGATE -- Discover 5+ nodes through the maze', check: 'nodesDiscovered.size >= 5' },
        { id: 'obj_2', label: 'EXTRACTION -- Reach extraction', check: 'nodesDiscovered.has("target")' }
    ],
    integrity: 3, completion: { title: 'TUNNEL VISION', subtitle: 'Wall maze conquered. Tunnel tool mastered.', storageKey: 'hexworth_operator_python38' }
};
