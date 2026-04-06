/* PYTHON-32 / BACKTRACK: INFERNO — Revisit with fireproof. 10x10 grid. */
var PYTHON_32_CONFIG = {
    id: 'python-32', title: 'PYTHON-32 / BACKTRACK: INFERNO',
    subtitle: 'Return with fireproof. Walk through what once burned.', category: 'python-ops', difficulty: 3, inputMode: 'python', agent: { tier: 3 },
    grid: { rows: 10, cols: 10, cells: [
        ['gateway','empty','fire-1','empty','empty','fire-2','empty','empty','empty','wall'],
        ['empty','empty','empty','fire-3','empty','empty','srv-1','empty','empty','empty'],
        ['empty','hole-1','empty','empty','empty','fire-4','empty','empty','fire-5','wall'],
        ['wall','empty','empty','router','empty','empty','empty','empty','empty','empty'],
        ['empty','fire-6','empty','empty','empty','hole-2','empty','srv-2','empty','wall'],
        ['empty','empty','empty','fire-7','empty','empty','empty','empty','fire-8','empty'],
        ['wall','empty','empty','empty','srv-3','empty','empty','empty','empty','wall'],
        ['empty','trap-1','empty','empty','empty','fire-9','empty','empty','empty','empty'],
        ['empty','empty','empty','fire-10','empty','empty','srv-bonus','empty','empty','empty'],
        ['wall','wall','empty','empty','empty','wall','empty','empty','empty','target']
    ], start: { col: 0, row: 0 } },
    nodes: {
        'gateway':   { label: 'GATEWAY',    abbr: 'GTW', ip: '10.320.0.1',  desc: 'Entry', ports: ['22/SSH','443/HTTPS'], os: 'Cisco IOS 15.4' },
        'router':    { label: 'ROUTER',     abbr: 'RTR', ip: '10.320.0.2',  desc: 'Core router', ports: ['22/SSH','179/BGP'], os: 'Juniper JunOS 21.4' },
        'srv-1':     { label: 'SRV-ALPHA',  abbr: 'SRA', ip: '10.320.1.11', desc: 'Server Alpha', ports: ['22/SSH','8080/HTTP'], os: 'Ubuntu 24.04 LTS' },
        'srv-2':     { label: 'SRV-BRAVO',  abbr: 'SRB', ip: '10.320.1.12', desc: 'Server Bravo', ports: ['22/SSH','5432/PostgreSQL'], os: 'RHEL 9.3' },
        'srv-3':     { label: 'SRV-CHARLIE',abbr: 'SRC', ip: '10.320.1.13', desc: 'Server Charlie', ports: ['22/SSH','9200/ELASTIC'], os: 'CentOS Stream 9' },
        'srv-bonus': { label: 'SRV-HIDDEN', abbr: 'SRH', ip: '10.320.1.99', desc: 'Hidden — fireproof to reach', ports: ['22/SSH','8443/HTTPS'], os: 'RHEL 9.3' },
        'target':    { label: 'EXTRACTION', abbr: 'EXT', ip: '10.320.0.99', desc: 'Extraction', ports: ['22/SSH','8443/HTTPS'], os: 'RHEL 9.3' },
        'fire-1':  { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Breach', ports: [] }, 'fire-2':  { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Thermal', ports: [] },
        'fire-3':  { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Burning', ports: [] }, 'fire-4':  { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Meltdown', ports: [] },
        'fire-5':  { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Corridor', ports: [] }, 'fire-6':  { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'West', ports: [] },
        'fire-7':  { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Center', ports: [] }, 'fire-8':  { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'East', ports: [] },
        'fire-9':  { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'South', ports: [] }, 'fire-10': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Guard', ports: [] },
        'hole-1':  { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] }, 'hole-2': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] },
        'trap-1':  { label: 'HONEYPOT', abbr: 'HP1', ip: '10.320.0.200', desc: 'Decoy', ports: ['22/SSH-FAKE'], os: 'Honeyd [TRAP]' }
    },
    traps: ['trap-1'], obstacles: { holes: ['hole-1','hole-2'], fires: ['fire-1','fire-2','fire-3','fire-4','fire-5','fire-6','fire-7','fire-8','fire-9','fire-10'] }, gates: {},
    objectives: [
        { id: 'obj_0', label: 'FIREPROOF -- Walk through 10 fires permanently', check: 'nodesDiscovered.size >= 12' },
        { id: 'obj_1', label: 'INTEL -- nmap all 3 standard servers', check: 'nmapTargets.has("srv-1") && nmapTargets.has("srv-2") && nmapTargets.has("srv-3")' },
        { id: 'obj_2', label: 'BONUS -- Reach hidden server (fireproof path)', check: 'nmapTargets.has("srv-bonus")' },
        { id: 'obj_3', label: 'EXTRACTION -- Reach extraction', check: 'nodesDiscovered.has("target")' }
    ],
    integrity: 5, completion: { title: 'BACKTRACK: INFERNO', subtitle: 'Fireproof mastered. Fires are nothing now.', storageKey: 'hexworth_operator_python32' }
};
