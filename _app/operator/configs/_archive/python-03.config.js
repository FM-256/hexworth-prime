/* ================================================================
   PYTHON-03 / SWEEP PROTOCOL -- Mission Config
   ================================================================
   Tier 3 mission. 6x6 grid — first grid larger than 4x5.
   Forces students to use scan() results in if statements.

   DESIGN RATIONALE:
   - 3 traps scattered along the path to the target
   - Moving without scanning will trigger all 3, depleting integrity
   - Student must write a safe_move() pattern that scans first
   - scan() returns array of {name, ip, direction} — student checks
     for traps in the direction they want to move
   - First mission that requires an if statement to complete

   REFERENCE SOLUTION (what students should discover):
     def safe_move(direction):
         result = agent.scan()
         for node in result:
             if node['direction'] == direction:
                 if 'HONEYPOT' in node['name'] or 'IDS' in node['name']:
                     agent.sweep(direction)
         agent.move(direction)

   GRID LAYOUT (6x6):
     [start]  [empty]   [ids-trap] [empty]   [empty]   [wall]
     [empty]  [router]  [empty]    [firewall] [empty]   [target]
     [wall]   [empty]   [honeypot] [empty]    [server]  [wall]
     [empty]  [switch]  [empty]    [empty]    [empty]   [wall]
     [wall]   [honeypot2][empty]   [server-db][empty]   [wall]
     [wall]   [wall]    [endpoint] [wall]     [wall]    [wall]

   PATH: start → east → east (trap!) → south → east (gate) → east → south
   Without scan: 3 traps = 3 integrity loss = mission compromised
   With scan+sweep: traps disarmed, clean path
   ================================================================ */

var PYTHON_03_CONFIG = {
    id: 'python-03',
    title: 'PYTHON-03 / SWEEP PROTOCOL',
    subtitle: 'Scan before you move. Traps punish blind navigation.',
    category: 'python-ops',
    difficulty: 3,
    inputMode: 'python',

    /* Agent tier: Tier 3 unlocks nmap, exploit, spoof, decrypt, patch.
       Students need: move, scan, sweep, nmap (all available at Tier 2+).
       Setting Tier 3 to match the hub tier placement. */
    agent: { tier: 3 },

    grid: {
        rows: 6, cols: 6,
        cells: [
            ['gateway',     'empty',    'ids-trap',  'empty',      'empty',     'wall'],
            ['empty',       'router',   'empty',     'firewall',   'empty',     'target'],
            ['wall',        'empty',    'honeypot',  'empty',      'server-web','wall'],
            ['empty',       'switch',   'empty',     'empty',      'empty',     'wall'],
            ['wall',        'honeypot2','empty',     'server-db',  'empty',     'wall'],
            ['wall',        'wall',     'endpoint',  'wall',       'wall',      'wall']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        /* -- Network infrastructure -- */
        'gateway':     { label: 'GATEWAY',      abbr: 'GTW', ip: '10.20.0.1',   desc: 'Edge gateway — your entry point',                      ports: ['22/SSH','443/HTTPS'],                            os: 'Cisco IOS 15.4' },
        'router':      { label: 'ROUTER',       abbr: 'RTR', ip: '10.20.0.2',   desc: 'Core router — routes between segments',                ports: ['22/SSH','179/BGP','161/SNMP'],                   os: 'Juniper JunOS 21.4' },
        'switch':      { label: 'SWITCH',       abbr: 'SWT', ip: '10.20.0.5',   desc: 'Distribution switch — VLAN segmentation',              ports: ['22/SSH','161/SNMP'],                             os: 'Cisco Catalyst 3650' },
        'endpoint':    { label: 'ENDPOINT',     abbr: 'EPT', ip: '10.20.0.50',  desc: 'Analyst workstation',                                  ports: ['135/RPC','445/SMB','3389/RDP'],                  os: 'Windows 11 Pro' },

        /* -- Servers -- */
        'server-web':  { label: 'SERVER-WEB',   abbr: 'SWB', ip: '10.20.0.15',  desc: 'Web application server',                               ports: ['22/SSH','80/HTTP','443/HTTPS','8080/PROXY'],     os: 'Ubuntu 24.04 LTS' },
        'server-db':   { label: 'SERVER-DB',    abbr: 'SDB', ip: '10.20.0.20',  desc: 'Database server — primary objective',                   ports: ['22/SSH','3306/MySQL','5432/PostgreSQL'],          os: 'RHEL 9.3' },

        /* -- Gate: firewall blocks path to target -- */
        'firewall':    { label: 'FIREWALL',     abbr: 'FWL', ip: '10.20.0.254', desc: 'Network perimeter firewall — blocking access to target',ports: ['22/SSH','443/HTTPS-MGMT'],                       os: 'pfSense 2.7.0', vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL allows unauthenticated management access' },

        /* -- Target -- */
        'target':      { label: 'TARGET',       abbr: 'TGT', ip: '10.20.0.99',  desc: 'Classified operations server — mission objective',      ports: ['22/SSH','8443/HTTPS','9090/ADMIN'],              os: 'RHEL 9.3' },

        /* -- Traps: 3 traps along likely paths -- */
        'ids-trap':    { label: 'IDS-SENSOR',   abbr: 'IDS', ip: '10.20.0.200', desc: 'Intrusion detection sensor — triggers on unauthorized movement', ports: ['514/SYSLOG'],                          os: 'Snort 3.1' },
        'honeypot':    { label: 'HONEYPOT-A',   abbr: 'HP1', ip: '10.20.0.201', desc: 'Decoy server — alerting on any interaction',             ports: ['22/SSH-FAKE','80/HTTP-TRAP','445/SMB-TRAP'],    os: 'Honeyd 1.6 [TRAP]' },
        'honeypot2':   { label: 'HONEYPOT-B',   abbr: 'HP2', ip: '10.20.0.202', desc: 'Second decoy — planted on alternate route',              ports: ['22/SSH-FAKE','3389/RDP-FAKE'],                  os: 'Honeyd 1.6 [TRAP]' }
    },

    /* Traps: stepping on these without scanning first costs 1 integrity each */
    traps: ['ids-trap', 'honeypot', 'honeypot2'],

    /* Gate: firewall requires nmap to bypass */
    gates: {
        'firewall': { requires: 'nmap', flag: 'firewallBypassed', vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL allows unauthenticated management access' }
    },

    objectives: [
        { id: 'obj_0', label: 'RECON -- Discover 5+ network nodes',              check: 'nodesDiscovered.size >= 5' },
        { id: 'obj_1', label: 'INTEL -- nmap scan the database server',           check: 'nmapTargets.has("server-db")' },
        { id: 'obj_2', label: 'ACCESS -- Bypass the firewall',                    check: 'firewallBypassed' },
        { id: 'obj_3', label: 'OBJECTIVE -- Reach the target server',             check: 'nodesDiscovered.has("target")' },
        { id: 'obj_4', label: 'STEALTH -- Complete with 2+ integrity remaining',  check: 'integrity >= 2' }
    ],

    /* 3 integrity pips — hitting all 3 traps without scanning = mission failed */
    integrity: 3,

    completion: {
        title: 'SWEEP PROTOCOL',
        subtitle: 'Grid swept. Traps disarmed. Target reached.',
        storageKey: 'hexworth_operator_python03'
    }
};
