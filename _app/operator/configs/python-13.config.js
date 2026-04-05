/* ================================================================
   PYTHON-13 / SCATTERED OPS -- Mission Config
   ================================================================
   Tier 5 mission. 9x9 grid.
   Forces route planning: 6 objectives scattered across a large grid,
   student must plan an efficient path visiting all of them.

   PUZZLE DESIGN:
   - 6 servers placed in all 4 corners and 2 middle positions
   - Student must nmap all 6 — no fixed order
   - 4 traps placed at natural crossroads
   - 2 gates blocking diagonal shortcuts
   - The challenge: plan a route that visits all 6 with minimum backtracking
   - Forces: planning ahead, using lists to track visited targets,
     possibly building a route array and iterating through it

   PYTHON SKILL: Route planning with lists
     targets = ['server-nw', 'server-ne', 'server-sw', 'server-se', 'server-cn', 'server-cs']
     visited = []
     for t in targets:
         # navigate to target, nmap it
         visited = visited + [t]
         print("Visited: " + str(len(visited)) + "/6")

   GRID (9x9) — 6 servers in spread positions
     [start]   [empty]  [empty]   [empty]   [wall]    [empty]  [empty]   [empty]  [srv-ne]
     [empty]   [trap-1] [empty]   [empty]   [empty]   [empty]  [empty]   [empty]  [empty]
     [empty]   [empty]  [empty]   [empty]   [srv-cn]  [empty]  [empty]   [trap-2] [wall]
     [empty]   [empty]  [gate-1]  [empty]   [empty]   [empty]  [empty]   [empty]  [empty]
     [wall]    [empty]  [empty]   [empty]   [router]  [empty]  [empty]   [empty]  [wall]
     [empty]   [empty]  [empty]   [empty]   [empty]   [empty]  [gate-2]  [empty]  [empty]
     [wall]    [empty]  [empty]   [trap-3]  [srv-cs]  [empty]  [empty]   [empty]  [empty]
     [empty]   [empty]  [empty]   [empty]   [empty]   [empty]  [empty]   [trap-4] [empty]
     [srv-sw]  [empty]  [empty]   [empty]   [wall]    [empty]  [empty]   [empty]  [srv-se]
   ================================================================ */

var PYTHON_13_CONFIG = {
    id: 'python-13',
    title: 'PYTHON-13 / SCATTERED OPS',
    subtitle: 'Six targets. Four corners. Plan your route.',
    category: 'python-ops',
    difficulty: 4,
    inputMode: 'python',
    agent: { tier: 3 },

    grid: {
        rows: 9, cols: 9,
        cells: [
            ['gateway',  'empty',  'empty',   'empty',    'wall',     'empty',  'empty',   'empty',  'srv-ne'],
            ['empty',    'trap-1', 'empty',   'empty',    'empty',    'empty',  'empty',   'empty',  'empty'],
            ['empty',    'empty',  'empty',   'empty',    'srv-cn',   'empty',  'empty',   'trap-2', 'wall'],
            ['empty',    'empty',  'gate-1',  'empty',    'empty',    'empty',  'empty',   'empty',  'empty'],
            ['wall',     'empty',  'empty',   'empty',    'router',   'empty',  'empty',   'empty',  'wall'],
            ['empty',    'empty',  'empty',   'empty',    'empty',    'empty',  'gate-2',  'empty',  'empty'],
            ['wall',     'empty',  'empty',   'trap-3',   'srv-cs',   'empty',  'empty',   'empty',  'empty'],
            ['empty',    'empty',  'empty',   'empty',    'empty',    'empty',  'empty',   'trap-4', 'empty'],
            ['srv-sw',   'empty',  'empty',   'empty',    'wall',     'empty',  'empty',   'empty',  'srv-se']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway':  { label: 'GATEWAY',       abbr: 'GTW', ip: '10.130.0.1',   desc: 'Entry point — northwest corner',                ports: ['22/SSH','443/HTTPS'],                     os: 'Cisco IOS 15.4' },
        'router':   { label: 'ROUTER',        abbr: 'RTR', ip: '10.130.0.2',   desc: 'Core router — grid center',                     ports: ['22/SSH','179/BGP'],                       os: 'Juniper JunOS 21.4' },

        /* 6 scattered target servers */
        'srv-ne':   { label: 'SRV-NORTHEAST', abbr: 'SNE', ip: '10.130.1.11',  desc: 'Northeast corner — security operations',        ports: ['22/SSH','9200/ELASTIC','5601/KIBANA'],    os: 'CentOS Stream 9' },
        'srv-cn':   { label: 'SRV-CENTER-N',  abbr: 'SCN', ip: '10.130.1.12',  desc: 'Center north — domain controller',              ports: ['53/DNS','88/KERBEROS','389/LDAP'],        os: 'Windows Server 2022 AD' },
        'srv-cs':   { label: 'SRV-CENTER-S',  abbr: 'SCS', ip: '10.130.1.13',  desc: 'Center south — database cluster',               ports: ['22/SSH','3306/MySQL','5432/PostgreSQL'],  os: 'RHEL 9.3' },
        'srv-sw':   { label: 'SRV-SOUTHWEST', abbr: 'SSW', ip: '10.130.1.14',  desc: 'Southwest corner — backup systems',             ports: ['22/SSH','873/RSYNC','3260/ISCSI'],        os: 'Debian 12 Bookworm' },
        'srv-se':   { label: 'SRV-SOUTHEAST', abbr: 'SSE', ip: '10.130.1.15',  desc: 'Southeast corner — executive vault',            ports: ['22/SSH','8200/VAULT','443/HTTPS'],        os: 'HashiCorp Vault 1.15' },

        /* 2 gates */
        'gate-1':   { label: 'FW-WEST',      abbr: 'FW1', ip: '10.130.0.251', desc: 'West corridor firewall',                        ports: ['22/SSH','443/MGMT'],                      os: 'pfSense 2.7.0', vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL' },
        'gate-2':   { label: 'FW-EAST',      abbr: 'FW2', ip: '10.130.0.252', desc: 'East corridor firewall',                        ports: ['22/SSH','443/MGMT'],                      os: 'Palo Alto PAN-OS', vuln: 'CVE-2024-7744', vulnDesc: 'Management plane RCE' },

        /* 4 traps at crossroads */
        'trap-1':   { label: 'TRAP-NW',      abbr: 'TW1', ip: '10.130.0.200', desc: 'IDS — northwest corridor',                      ports: ['514/SYSLOG'],                             os: 'Snort [TRAP]' },
        'trap-2':   { label: 'TRAP-NE',      abbr: 'TE2', ip: '10.130.0.201', desc: 'Honeypot — northeast approach',                 ports: ['22/SSH-FAKE'],                            os: 'Honeyd [TRAP]' },
        'trap-3':   { label: 'TRAP-SW',      abbr: 'TW3', ip: '10.130.0.202', desc: 'IDS — southwest corridor',                      ports: ['514/SYSLOG'],                             os: 'Suricata [TRAP]' },
        'trap-4':   { label: 'TRAP-SE',      abbr: 'TE4', ip: '10.130.0.203', desc: 'Honeypot — southeast approach',                 ports: ['80/HTTP-TRAP'],                           os: 'Honeyd [TRAP]' }
    },

    traps: ['trap-1', 'trap-2', 'trap-3', 'trap-4'],

    gates: {
        'gate-1': { requires: 'nmap',    flag: 'westGateCleared',  vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL' },
        'gate-2': { requires: 'exploit', flag: 'eastGateCleared',  vuln: 'CVE-2024-7744', vulnDesc: 'Management plane RCE' }
    },

    objectives: [
        { id: 'obj_0', label: 'TARGET 1 -- nmap Northeast server',            check: 'nmapTargets.has("srv-ne")' },
        { id: 'obj_1', label: 'TARGET 2 -- nmap Center-North server',         check: 'nmapTargets.has("srv-cn")' },
        { id: 'obj_2', label: 'TARGET 3 -- nmap Center-South server',         check: 'nmapTargets.has("srv-cs")' },
        { id: 'obj_3', label: 'TARGET 4 -- nmap Southwest server',            check: 'nmapTargets.has("srv-sw")' },
        { id: 'obj_4', label: 'TARGET 5 -- nmap Southeast server',            check: 'nmapTargets.has("srv-se")' },
        { id: 'obj_5', label: 'GATES -- Bypass both corridor firewalls',      check: 'westGateCleared && eastGateCleared' },
        { id: 'obj_6', label: 'STEALTH -- 2+ integrity remaining',            check: 'integrity >= 2' }
    ],

    integrity: 4,

    completion: {
        title: 'SCATTERED OPS',
        subtitle: 'All six targets cataloged. Route optimized. Zero waste.',
        storageKey: 'hexworth_operator_python13'
    }
};
