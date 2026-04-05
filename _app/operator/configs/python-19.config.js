/* ================================================================
   PYTHON-19 / MAZE RUNNER -- Mission Config
   ================================================================
   Tier 6 mission. 11x11 grid.
   Forces pathfinding through a wall-heavy maze. Dead ends require
   backtracking. Student must track visited cells to avoid loops.

   PUZZLE DESIGN:
   - 11x11 grid with heavy wall placement creating a true maze
   - Multiple dead ends that waste moves if entered blindly
   - 4 servers hidden at dead-end termini (reward for exploring)
   - 2 gates blocking critical junctions
   - 4 traps at false exits
   - Student must: scan ahead to detect dead ends, track which
     directions they've already tried, and implement backtracking
   - Forces: while loops with scan-based exit conditions,
     variable tracking of visited positions, strategic retreat

   PYTHON SKILL: Backtracking / visited-set tracking
     visited = []
     def explore(direction):
         result = agent.scan()
         # Check if this direction leads to a dead end
         has_exit = False
         for node in result:
             if node['direction'] != direction:
                 has_exit = True
         if not has_exit:
             print("Dead end detected: " + direction)
             return False
         safe_advance(direction)
         visited = visited + [agent.position]
         return True

   GRID (11x11) — maze with walls creating corridors and dead ends
   ================================================================ */

var PYTHON_19_CONFIG = {
    id: 'python-19',
    title: 'PYTHON-19 / MAZE RUNNER',
    subtitle: '11x11 maze. Dead ends everywhere. Track where you have been.',
    category: 'python-ops',
    difficulty: 4,
    inputMode: 'python',
    agent: { tier: 3 },

    grid: {
        rows: 11, cols: 11,
        cells: [
            ['gateway','empty','wall',  'empty','empty','empty','wall', 'empty','empty','empty','wall'],
            ['empty',  'empty','wall',  'empty','wall', 'empty','empty','empty','wall', 'empty','empty'],
            ['empty',  'wall', 'empty', 'empty','wall', 'empty','wall', 'srv-1','wall', 'empty','wall'],
            ['empty',  'empty','empty', 'wall', 'empty','empty','empty','empty','empty','empty','empty'],
            ['wall',   'empty','wall',  'empty','empty','wall', 'wall', 'empty','wall', 'trap-1','wall'],
            ['empty',  'empty','empty', 'empty','gate-1','empty','empty','empty','empty','empty','empty'],
            ['empty',  'wall', 'trap-2','wall', 'empty','empty','wall', 'empty','wall', 'empty','wall'],
            ['empty',  'empty','empty', 'empty','empty','wall', 'empty','srv-2','empty','empty','empty'],
            ['wall',   'empty','wall',  'empty','wall', 'empty','empty','empty','wall', 'trap-3','wall'],
            ['empty',  'srv-3','empty', 'empty','empty','empty','wall', 'empty','empty','empty','empty'],
            ['wall',   'wall', 'empty', 'trap-4','empty','gate-2','empty','empty','srv-4','empty','target']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway': { label: 'GATEWAY',      abbr: 'GTW', ip: '10.190.0.1',   desc: 'Maze entry — northwest',                    ports: ['22/SSH','443/HTTPS'],                     os: 'Cisco IOS 15.4' },

        /* 4 servers hidden at strategic points */
        'srv-1':   { label: 'SRV-ARCHIVE',  abbr: 'ARC', ip: '10.190.1.11',  desc: 'Archive server — northeast alcove',        ports: ['22/SSH','445/SMB','2049/NFS'],            os: 'Windows Server 2022' },
        'srv-2':   { label: 'SRV-COMMS',    abbr: 'COM', ip: '10.190.1.12',  desc: 'Comms relay — center east',                ports: ['22/SSH','5060/SIP','443/HTTPS'],          os: 'FreePBX 16' },
        'srv-3':   { label: 'SRV-INTEL',    abbr: 'INT', ip: '10.190.1.13',  desc: 'Intelligence archive — southwest pocket',  ports: ['22/SSH','9200/ELASTIC','5601/KIBANA'],    os: 'CentOS Stream 9' },
        'srv-4':   { label: 'SRV-KEYS',     abbr: 'KEY', ip: '10.190.1.14',  desc: 'Key server — near extraction',             ports: ['22/SSH','8200/VAULT','443/HTTPS'],        os: 'HashiCorp Vault 1.15' },

        /* 2 junction gates */
        'gate-1':  { label: 'FW-JUNCTION-A',abbr: 'FJA', ip: '10.190.0.251', desc: 'Central junction gate',                     ports: ['22/SSH','443/MGMT'],                      os: 'pfSense 2.7.0', vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL' },
        'gate-2':  { label: 'FW-JUNCTION-B',abbr: 'FJB', ip: '10.190.0.252', desc: 'Extraction corridor gate',                  ports: ['22/SSH','443/MGMT'],                      os: 'Palo Alto PAN-OS', vuln: 'CVE-2024-7744', vulnDesc: 'Management RCE' },

        'target':  { label: 'EXTRACTION',   abbr: 'EXT', ip: '10.190.0.99',  desc: 'Maze exit — mission complete',               ports: ['22/SSH','8443/HTTPS'],                    os: 'RHEL 9.3' },

        /* 4 traps at false exits and dead ends */
        'trap-1':  { label: 'TRAP-EAST',    abbr: 'TE1', ip: '10.190.0.201', desc: 'IDS at false exit east',    ports: ['514/SYSLOG'],   os: 'Snort [TRAP]' },
        'trap-2':  { label: 'TRAP-CENTER',  abbr: 'TC2', ip: '10.190.0.202', desc: 'Honeypot center corridor',  ports: ['22/SSH-FAKE'],  os: 'Honeyd [TRAP]' },
        'trap-3':  { label: 'TRAP-SE',      abbr: 'TS3', ip: '10.190.0.203', desc: 'IDS southeast dead end',    ports: ['514/SYSLOG'],   os: 'Suricata [TRAP]' },
        'trap-4':  { label: 'TRAP-SOUTH',   abbr: 'TS4', ip: '10.190.0.204', desc: 'Honeypot south corridor',   ports: ['80/HTTP-TRAP'], os: 'Honeyd [TRAP]' }
    },

    traps: ['trap-1', 'trap-2', 'trap-3', 'trap-4'],

    gates: {
        'gate-1': { requires: 'nmap',    flag: 'junctionACleared', vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL' },
        'gate-2': { requires: 'exploit', flag: 'junctionBCleared', vuln: 'CVE-2024-7744', vulnDesc: 'Management RCE' }
    },

    objectives: [
        { id: 'obj_0', label: 'EXPLORE -- Discover all 4 hidden servers',                check: 'nmapTargets.has("srv-1") && nmapTargets.has("srv-2") && nmapTargets.has("srv-3") && nmapTargets.has("srv-4")' },
        { id: 'obj_1', label: 'NAVIGATE -- Bypass junction gate A',                      check: 'junctionACleared' },
        { id: 'obj_2', label: 'NAVIGATE -- Bypass junction gate B',                      check: 'junctionBCleared' },
        { id: 'obj_3', label: 'MAP -- Discover 10+ nodes through the maze',              check: 'nodesDiscovered.size >= 10' },
        { id: 'obj_4', label: 'EXTRACTION -- Reach the maze exit',                       check: 'nodesDiscovered.has("target")' },
        { id: 'obj_5', label: 'STEALTH -- 3+ integrity remaining',                      check: 'integrity >= 3' }
    ],

    integrity: 5,

    completion: {
        title: 'MAZE RUNNER',
        subtitle: 'Maze solved. Dead ends mapped. Clean extraction.',
        storageKey: 'hexworth_operator_python19'
    }
};
