/* ================================================================
   PYTHON-08 / FORK IN THE ROAD -- Mission Config
   ================================================================
   Tier 5 mission. 8x8 grid.
   Forces decision-making: two paths to the target, one trapped,
   one gated. Student must scan both routes and choose.

   PUZZLE DESIGN:
   - Two corridors from start to target: North route and South route
   - North route: shorter but 3 traps (honeypots along the path)
   - South route: longer but only 1 gate (nmap firewall)
   - Optimal strategy: scan both routes, determine which is safer,
     then commit to one path
   - Forces: scan() result storage in variables, comparison logic,
     strategic decision-making based on collected data

   PYTHON SKILL: Data-driven decision making
     # Scan north route
     agent.move('east')
     north_data = agent.scan()
     # Scan south route
     agent.move('south')
     south_data = agent.scan()
     # Decide based on trap count vs gate count
     north_traps = 0
     for node in north_data:
         if 'TRAP' in node['name'] or 'HONEYPOT' in node['name']:
             north_traps = north_traps + 1
     if north_traps > 1:
         # Take south route (gated but fewer traps)
         ...

   GRID (8x8):
     [start]   [empty]   [empty]    [honeypot1] [empty]    [empty]   [empty]  [wall]
     [empty]   [empty]   [honeypot2][empty]     [empty]    [empty]   [target] [wall]
     [empty]   [router]  [empty]    [empty]     [honeypot3][empty]   [empty]  [wall]
     [wall]    [wall]    [wall]     [empty]     [wall]     [wall]    [wall]   [wall]
     [empty]   [empty]   [empty]    [switch]    [empty]    [empty]   [empty]  [wall]
     [empty]   [server1] [empty]    [empty]     [firewall] [empty]   [empty]  [empty]
     [wall]    [empty]   [empty]    [server2]   [empty]    [empty]   [server3][wall]
     [wall]    [wall]    [empty]    [empty]     [empty]    [wall]    [wall]   [wall]
   ================================================================ */

var PYTHON_08_CONFIG = {
    id: 'python-08',
    title: 'PYTHON-08 / FORK IN THE ROAD',
    subtitle: 'Two paths. One trapped. One gated. Choose wisely.',
    category: 'python-ops',
    difficulty: 3,
    inputMode: 'python',
    agent: { tier: 3 },

    grid: {
        rows: 8, cols: 8,
        cells: [
            ['gateway',  'empty',    'empty',     'honeypot1', 'empty',    'empty',    'empty',   'wall'],
            ['empty',    'empty',    'honeypot2', 'empty',     'empty',    'empty',    'target',  'wall'],
            ['empty',    'router',   'empty',     'empty',     'honeypot3','empty',    'empty',   'wall'],
            ['wall',     'wall',     'wall',      'empty',     'wall',     'wall',     'wall',    'wall'],
            ['empty',    'empty',    'empty',     'switch',    'empty',    'empty',    'empty',   'wall'],
            ['empty',    'server-1', 'empty',     'empty',     'firewall', 'empty',    'empty',   'empty'],
            ['wall',     'empty',    'empty',     'server-2',  'empty',    'empty',    'server-3','wall'],
            ['wall',     'wall',     'empty',     'empty',     'empty',    'wall',     'wall',    'wall']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway':    { label: 'GATEWAY',     abbr: 'GTW', ip: '10.110.0.1',   desc: 'Entry point — north and south corridors diverge here', ports: ['22/SSH','443/HTTPS'],                        os: 'Cisco IOS 15.4' },
        'router':     { label: 'ROUTER',      abbr: 'RTR', ip: '10.110.0.2',   desc: 'Core router — north wing',                            ports: ['22/SSH','179/BGP'],                          os: 'Juniper JunOS 21.4' },
        'switch':     { label: 'SWITCH',      abbr: 'SWT', ip: '10.110.0.5',   desc: 'Distribution switch — south wing',                    ports: ['22/SSH','161/SNMP'],                         os: 'Cisco Catalyst 9300' },
        'target':     { label: 'TARGET',      abbr: 'TGT', ip: '10.110.0.99',  desc: 'Operations server — mission objective',                ports: ['22/SSH','8443/HTTPS','9090/ADMIN'],          os: 'RHEL 9.3' },

        'server-1':   { label: 'SRV-ALPHA',  abbr: 'SRA', ip: '10.110.0.11',  desc: 'South wing server — intel cache',                     ports: ['22/SSH','8080/HTTP'],                        os: 'Ubuntu 24.04 LTS' },
        'server-2':   { label: 'SRV-BRAVO',  abbr: 'SRB', ip: '10.110.0.12',  desc: 'South wing server — logs archive',                    ports: ['22/SSH','9200/ELASTIC'],                     os: 'CentOS Stream 9' },
        'server-3':   { label: 'SRV-CHARLIE',abbr: 'SRC', ip: '10.110.0.13',  desc: 'South wing server — credentials store',               ports: ['22/SSH','5432/PostgreSQL'],                  os: 'RHEL 9.3' },

        'firewall':   { label: 'FIREWALL',    abbr: 'FWL', ip: '10.110.0.254', desc: 'South corridor gate — requires nmap to bypass',        ports: ['22/SSH','443/MGMT'],                         os: 'pfSense 2.7.0', vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL allows bypass' },

        /* North route traps — 3 honeypots making the shortcut dangerous */
        'honeypot1':  { label: 'TRAP-N1',     abbr: 'TN1', ip: '10.110.0.200', desc: 'Decoy — north corridor entry',                        ports: ['22/SSH-FAKE'],                               os: 'Honeyd [TRAP]' },
        'honeypot2':  { label: 'TRAP-N2',     abbr: 'TN2', ip: '10.110.0.201', desc: 'Decoy — north corridor mid',                          ports: ['80/HTTP-TRAP'],                              os: 'Honeyd [TRAP]' },
        'honeypot3':  { label: 'TRAP-N3',     abbr: 'TN3', ip: '10.110.0.202', desc: 'Decoy — north corridor east',                         ports: ['445/SMB-FAKE'],                              os: 'Honeyd [TRAP]' }
    },

    traps: ['honeypot1', 'honeypot2', 'honeypot3'],

    gates: {
        'firewall': { requires: 'nmap', flag: 'firewallBypassed', vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL allows bypass' }
    },

    objectives: [
        { id: 'obj_0', label: 'RECON -- Discover 5+ network nodes',                check: 'nodesDiscovered.size >= 5' },
        { id: 'obj_1', label: 'INTEL -- nmap at least 2 servers',                  check: 'nmapTargets.has("server-1") || nmapTargets.has("server-2") || nmapTargets.has("server-3")' },
        { id: 'obj_2', label: 'ACCESS -- Bypass the south corridor firewall',      check: 'firewallBypassed' },
        { id: 'obj_3', label: 'OBJECTIVE -- Reach the target server',              check: 'nodesDiscovered.has("target")' },
        { id: 'obj_4', label: 'STEALTH -- Complete with 2+ integrity remaining',   check: 'integrity >= 2' }
    ],

    integrity: 3,

    completion: {
        title: 'FORK IN THE ROAD',
        subtitle: 'Path chosen. Target reached. Decision validated.',
        storageKey: 'hexworth_operator_python08'
    }
};
