/* ================================================================
   RECON-01: First Contact -- Mission Config
   ================================================================
   Terminal-mode mission. Custom commands: scan, move, ping, nmap.
   Firewall gate blocks access to target until nmap reveals vuln.
   ================================================================ */

var RECON_01_CONFIG = {
    id: 'recon-01',
    title: 'RECON-01 / FIRST CONTACT',
    subtitle: 'Map the topology. Bypass the firewall. Reach the target.',
    category: 'network-recon',
    difficulty: 1,
    inputMode: 'terminal',
    promptText: 'agent@recon:~$ ',

    grid: {
        rows: 4,
        cols: 5,
        cells: [
            ['gateway',  'empty',      'switch',     'server-db',  'wall'],
            ['empty',    'router',     'empty',      'firewall',   'target'],
            ['wall',     'server-web', 'empty',      'empty',      'wall'],
            ['wall',     'wall',       'endpoint',   'wall',       'wall']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway':    { label: 'GATEWAY',    abbr: 'GTW', ip: '10.0.0.1',   desc: 'Network edge gateway',         ports: ['22/SSH','80/HTTP','443/HTTPS'],                      os: 'Cisco IOS 15.4' },
        'switch':     { label: 'SWITCH',     abbr: 'SWT', ip: '10.0.0.5',   desc: 'Layer 2 managed switch',       ports: ['22/SSH','161/SNMP'],                                 os: 'Cisco Catalyst 2960' },
        'server-db':  { label: 'SERVER-DB',  abbr: 'SDB', ip: '10.0.0.20',  desc: 'Database server',              ports: ['22/SSH','3306/MySQL','5432/PostgreSQL'],              os: 'Ubuntu 22.04 LTS' },
        'router':     { label: 'ROUTER',     abbr: 'RTR', ip: '10.0.0.2',   desc: 'Core network router',          ports: ['22/SSH','179/BGP','161/SNMP'],                       os: 'Juniper JunOS 21.4' },
        'firewall':   { label: 'FIREWALL',   abbr: 'FWL', ip: '10.0.0.254', desc: 'Network perimeter firewall',   ports: ['22/SSH','443/HTTPS-MGMT'],                           os: 'pfSense 2.7.0',     vuln: 'CVE-2024-1337', vulnDesc: 'Misconfigured ACL allows unauthorized traversal' },
        'target':     { label: 'TARGET',     abbr: 'TGT', ip: '10.0.0.99',  desc: 'Classified operations server', ports: ['22/SSH','8443/HTTPS','9090/ADMIN'],                   os: 'RHEL 9.3' },
        'server-web': { label: 'SERVER-WEB', abbr: 'SWB', ip: '10.0.0.15',  desc: 'Web application server',       ports: ['22/SSH','80/HTTP','443/HTTPS','8080/HTTP-PROXY'],     os: 'Debian 12 Bookworm' },
        'endpoint':   { label: 'ENDPOINT',   abbr: 'EPT', ip: '10.0.0.50',  desc: 'User workstation',             ports: ['135/RPC','445/SMB','3389/RDP'],                       os: 'Windows 11 Pro' }
    },

    traps: [],

    gates: {
        'firewall': { flag: 'firewallBypassed', requires: 'nmap' }
    },

    objectives: [
        { id: 'discover-4',     label: 'Discover 4 nodes',     check: 'nodesDiscovered.size >= 4' },
        { id: 'nmap-server',    label: 'Nmap a server',        check: 'nmapTargets.has("server-db") || nmapTargets.has("server-web")' },
        { id: 'bypass-fw',      label: 'Bypass firewall',      check: 'firewallBypassed' },
        { id: 'reach-target',   label: 'Reach the target',     check: 'nodesDiscovered.has("target")' }
    ],

    integrity: 3,

    completion: {
        title: 'FIRST CONTACT',
        subtitle: 'Network mapped. Target reached. Well done, operator.',
        storageKey: 'hexworth_operator_recon01'
    },

    briefing: [
        'Agent deployed at network edge.',
        'Map the topology. Bypass the firewall.',
        'Reach the classified target server.'
    ],

    commands: ['scan', 'move', 'ping', 'nmap', 'status', 'help', 'clear']
};
