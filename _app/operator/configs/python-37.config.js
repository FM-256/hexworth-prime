/* PYTHON-37 / THE EXCAVATOR — EARN TUNNEL permanent tool. 10x10. Tool behind enemy+fire+hole gauntlet. Requires all 3 previous tools. */
var PYTHON_37_CONFIG = {
    id: 'python-37', title: 'PYTHON-37 / THE EXCAVATOR',
    subtitle: 'Find the tunnel tool. Every previous tool is needed.', category: 'python-ops', difficulty: 4, inputMode: 'python', agent: { tier: 3 },
    grid: { rows: 10, cols: 10, cells: [
        ['gateway','empty','enemy-1','empty','fire-1','empty','hole-1','empty','empty','wall'],
        ['empty','empty','empty','srv-1','empty','empty','empty','enemy-2','empty','empty'],
        ['hole-2','empty','fire-2','empty','empty','empty','empty','empty','fire-3','wall'],
        ['wall','empty','empty','router','empty','enemy-3','empty','hole-3','empty','empty'],
        ['empty','fire-4','empty','empty','wall','empty','empty','empty','enemy-4','wall'],
        ['empty','empty','enemy-5','empty','empty','srv-2','empty','fire-5','empty','empty'],
        ['wall','hole-4','empty','fire-6','empty','empty','empty','empty','empty','wall'],
        ['empty','empty','empty','empty','enemy-6','empty','hole-5','fire-7','tool-tunnel','empty'],
        ['empty','trap-1','empty','empty','empty','srv-3','empty','empty','empty','empty'],
        ['wall','wall','empty','empty','empty','wall','empty','empty','empty','target']
    ], start: { col: 0, row: 0 } },
    nodes: {
        'gateway': { label: 'GATEWAY', abbr: 'GTW', ip: '10.370.0.1', desc: 'Entry', ports: ['22/SSH','443/HTTPS'], os: 'Cisco IOS 15.4' },
        'router': { label: 'ROUTER', abbr: 'RTR', ip: '10.370.0.2', desc: 'Router', ports: ['22/SSH','179/BGP'], os: 'Juniper JunOS 21.4' },
        'srv-1': { label: 'SRV-ALPHA', abbr: 'SRA', ip: '10.370.1.11', desc: 'Alpha', ports: ['22/SSH','8080/HTTP'], os: 'Ubuntu 24.04 LTS' },
        'srv-2': { label: 'SRV-BRAVO', abbr: 'SRB', ip: '10.370.1.12', desc: 'Bravo', ports: ['22/SSH','5432/PostgreSQL'], os: 'RHEL 9.3' },
        'srv-3': { label: 'SRV-CHARLIE', abbr: 'SRC', ip: '10.370.1.13', desc: 'Charlie', ports: ['22/SSH','9200/ELASTIC'], os: 'CentOS Stream 9' },
        'target': { label: 'EXTRACTION', abbr: 'EXT', ip: '10.370.0.99', desc: 'Extract', ports: ['22/SSH','8443/HTTPS'], os: 'RHEL 9.3' },
        'tool-tunnel': { label: 'TUNNEL TOOL', abbr: 'TNL', ip: null, desc: '*** PERMANENT TOOL *** Bypass walls permanently', ports: [] },
        'enemy-1': { label: 'ENEMY GUARD', abbr: 'GRD', ip: null, desc: 'Guard', ports: [] }, 'enemy-2': { label: 'ENEMY DRONE', abbr: 'DRN', ip: null, desc: 'Drone', ports: [] },
        'enemy-3': { label: 'ENEMY BOT', abbr: 'BOT', ip: null, desc: 'Bot', ports: [] }, 'enemy-4': { label: 'ENEMY SENTRY', abbr: 'SNT', ip: null, desc: 'Sentry', ports: [] },
        'enemy-5': { label: 'ENEMY PATROL', abbr: 'PTR', ip: null, desc: 'Patrol', ports: [] }, 'enemy-6': { label: 'ENEMY AGENT', abbr: 'AGT', ip: null, desc: 'Rogue agent guarding tool', ports: [] },
        'hole-1': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] }, 'hole-2': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] },
        'hole-3': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] }, 'hole-4': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] },
        'hole-5': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap guarding tool', ports: [] },
        'fire-1': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Breach', ports: [] }, 'fire-2': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Thermal', ports: [] },
        'fire-3': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Burning', ports: [] }, 'fire-4': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'West', ports: [] },
        'fire-5': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'East', ports: [] }, 'fire-6': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Center', ports: [] },
        'fire-7': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Guard fire near tool', ports: [] },
        'trap-1': { label: 'HONEYPOT', abbr: 'HP1', ip: '10.370.0.200', desc: 'Decoy', ports: ['22/SSH-FAKE'], os: 'Honeyd [TRAP]' }
    },
    traps: ['trap-1'], obstacles: { holes: ['hole-1','hole-2','hole-3','hole-4','hole-5'], fires: ['fire-1','fire-2','fire-3','fire-4','fire-5','fire-6','fire-7'], enemies: ['enemy-1','enemy-2','enemy-3','enemy-4','enemy-5','enemy-6'] }, gates: {},
    objectives: [
        { id: 'obj_0', label: 'ACQUIRE -- Find TUNNEL tool (all 3 tools needed to reach)', check: 'nodesDiscovered.has("tool-tunnel")' },
        { id: 'obj_1', label: 'NAVIGATE -- Clear all obstacle types', check: 'nodesDiscovered.size >= 15' },
        { id: 'obj_2', label: 'INTEL -- nmap all 3 servers', check: 'nmapTargets.has("srv-1") && nmapTargets.has("srv-2") && nmapTargets.has("srv-3")' },
        { id: 'obj_3', label: 'EXTRACTION -- Reach extraction', check: 'nodesDiscovered.has("target")' }
    ],
    integrity: 7, completion: { title: 'THE EXCAVATOR', subtitle: '*** TUNNEL TOOL ACQUIRED *** Walls can now be bypassed permanently. ALL TOOLS COLLECTED.', storageKey: 'hexworth_operator_python37' }
};
