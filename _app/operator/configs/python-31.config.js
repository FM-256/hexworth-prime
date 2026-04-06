/* ================================================================
   PYTHON-31 / THE CRUCIBLE -- Mission Config
   ================================================================
   *** EARN FIREPROOF PERMANENT TOOL ***
   9x9 grid. The fireproof tool is a PICKUP NODE on the grid,
   behind holes that require bridge to reach.
   Metroidvania chain: bridge (L28) → cross holes → find fireproof.

   After earning fireproof, fires become permanently passable.
   ================================================================ */

var PYTHON_31_CONFIG = {
    id: 'python-31',
    title: 'PYTHON-31 / THE CRUCIBLE',
    subtitle: 'Find the fireproof tool. It\'s behind the holes.',
    category: 'python-ops',
    difficulty: 4,
    inputMode: 'python',
    agent: { tier: 3 },

    grid: {
        rows: 9, cols: 9,
        cells: [
            ['gateway',  'empty',   'empty',   'fire-1',  'empty',   'empty',   'empty',   'empty',  'wall'],
            ['empty',    'empty',   'hole-1',  'empty',   'srv-1',   'empty',   'fire-2',  'empty',  'empty'],
            ['empty',    'fire-3',  'empty',   'empty',   'empty',   'hole-2',  'empty',   'empty',  'wall'],
            ['wall',     'empty',   'empty',   'router',  'empty',   'empty',   'empty',   'fire-4', 'empty'],
            ['empty',    'hole-3',  'empty',   'empty',   'empty',   'fire-5',  'empty',   'empty',  'wall'],
            ['empty',    'empty',   'empty',   'empty',   'srv-2',   'empty',   'hole-4',  'empty',  'empty'],
            ['wall',     'empty',   'fire-6',  'empty',   'empty',   'empty',   'empty',   'tool-fireproof','wall'],
            ['empty',    'trap-1',  'empty',   'empty',   'srv-3',   'empty',   'empty',   'empty',  'empty'],
            ['wall',     'wall',    'empty',   'empty',   'empty',   'wall',    'empty',   'empty',  'target']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway':        { label: 'GATEWAY',      abbr: 'GTW', ip: '10.310.0.1',  desc: 'Entry',        ports: ['22/SSH','443/HTTPS'],        os: 'Cisco IOS 15.4' },
        'router':         { label: 'ROUTER',       abbr: 'RTR', ip: '10.310.0.2',  desc: 'Core router',  ports: ['22/SSH','179/BGP'],         os: 'Juniper JunOS 21.4' },
        'srv-1':          { label: 'SRV-ALPHA',    abbr: 'SRA', ip: '10.310.1.11', desc: 'Server Alpha', ports: ['22/SSH','8080/HTTP'],        os: 'Ubuntu 24.04 LTS' },
        'srv-2':          { label: 'SRV-BRAVO',    abbr: 'SRB', ip: '10.310.1.12', desc: 'Server Bravo', ports: ['22/SSH','5432/PostgreSQL'],  os: 'RHEL 9.3' },
        'srv-3':          { label: 'SRV-CHARLIE',  abbr: 'SRC', ip: '10.310.1.13', desc: 'Server Charlie',ports: ['22/SSH','9200/ELASTIC'],    os: 'CentOS Stream 9' },
        'target':         { label: 'EXTRACTION',   abbr: 'EXT', ip: '10.310.0.99', desc: 'Extraction',    ports: ['22/SSH','8443/HTTPS'],      os: 'RHEL 9.3' },

        /* TOOL PICKUP — fireproof. Behind holes requiring bridge. */
        'tool-fireproof': { label: 'FIREPROOF TOOL', abbr: 'FPT', ip: null, desc: '*** PERMANENT TOOL *** Walk onto this to acquire fireproof capability', ports: [] },

        'hole-1': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap — bridge to reach fireproof', ports: [] },
        'hole-2': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] },
        'hole-3': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap', ports: [] },
        'hole-4': { label: 'HOLE', abbr: 'HLE', ip: null, desc: 'Gap guarding fireproof tool', ports: [] },
        'fire-1': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Breach — extinguish for now', ports: [] },
        'fire-2': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Thermal barrier', ports: [] },
        'fire-3': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Active breach', ports: [] },
        'fire-4': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Burning corridor', ports: [] },
        'fire-5': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Firewall meltdown', ports: [] },
        'fire-6': { label: 'FIRE', abbr: 'FIR', ip: null, desc: 'Thermal gauntlet', ports: [] },
        'trap-1': { label: 'HONEYPOT', abbr: 'HP1', ip: '10.310.0.200', desc: 'Decoy', ports: ['22/SSH-FAKE'], os: 'Honeyd [TRAP]' }
    },

    traps: ['trap-1'],
    obstacles: { holes: ['hole-1','hole-2','hole-3','hole-4'], fires: ['fire-1','fire-2','fire-3','fire-4','fire-5','fire-6'] },
    gates: {},

    objectives: [
        { id: 'obj_0', label: 'ACQUIRE -- Find the FIREPROOF tool (bridge holes to reach it)', check: 'nodesDiscovered.has("tool-fireproof")' },
        { id: 'obj_1', label: 'NAVIGATE -- Cross 4 holes + 6 fires',              check: 'nodesDiscovered.size >= 10' },
        { id: 'obj_2', label: 'INTEL -- nmap all 3 servers',                      check: 'nmapTargets.has("srv-1") && nmapTargets.has("srv-2") && nmapTargets.has("srv-3")' },
        { id: 'obj_3', label: 'EXTRACTION -- Reach extraction',                   check: 'nodesDiscovered.has("target")' }
    ],

    integrity: 6,
    completion: { title: 'THE CRUCIBLE', subtitle: '*** FIREPROOF TOOL ACQUIRED *** Fires are now permanently passable.', storageKey: 'hexworth_operator_python31' }
};
