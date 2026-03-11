/* ================================================================
   PYTHON-01 / SCRIPT KIDDIE -- Mission Config
   ================================================================
   Network recon and firewall bypass on a small enterprise grid.
   4 objectives, 1 trap (server-web), 1 nmap gate (firewall).
   ================================================================ */

var PYTHON_01_CONFIG = {
    id: 'python-01',
    title: 'PYTHON-01 / SCRIPT KIDDIE',
    subtitle: 'Basic network enumeration and firewall bypass',
    category: 'python-ops',
    difficulty: 1,
    inputMode: 'python',

    grid: {
        rows: 4, cols: 5,
        cells: [
            ['gateway',  'empty',      'switch',     'server-db',  'wall'],
            ['empty',    'router',     'empty',      'firewall',   'target'],
            ['wall',     'server-web', 'empty',      'empty',      'wall'],
            ['wall',     'wall',       'endpoint',   'wall',       'wall']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway':    { label: 'GATEWAY',    abbr: 'GTW', ip: '10.0.0.1',   desc: 'Network edge gateway',         ports: ['22/SSH','80/HTTP','443/HTTPS'],                  os: 'Cisco IOS 15.4' },
        'switch':     { label: 'SWITCH',     abbr: 'SWT', ip: '10.0.0.5',   desc: 'Layer 2 managed switch',       ports: ['22/SSH','161/SNMP'],                             os: 'Cisco Catalyst 2960' },
        'server-db':  { label: 'SERVER-DB',  abbr: 'SDB', ip: '10.0.0.20',  desc: 'Database server',              ports: ['22/SSH','3306/MySQL','5432/PostgreSQL'],          os: 'Ubuntu 22.04 LTS' },
        'router':     { label: 'ROUTER',     abbr: 'RTR', ip: '10.0.0.2',   desc: 'Core network router',          ports: ['22/SSH','179/BGP','161/SNMP'],                   os: 'Juniper JunOS 21.4' },
        'firewall':   { label: 'FIREWALL',   abbr: 'FWL', ip: '10.0.0.254', desc: 'Network perimeter firewall',   ports: ['22/SSH','443/HTTPS-MGMT'],                      os: 'pfSense 2.7.0', vuln: 'CVE-2024-1337', vulnDesc: 'Misconfigured ACL' },
        'target':     { label: 'TARGET',     abbr: 'TGT', ip: '10.0.0.99',  desc: 'Classified operations server', ports: ['22/SSH','8443/HTTPS','9090/ADMIN'],              os: 'RHEL 9.3' },
        'server-web': { label: 'SERVER-WEB', abbr: 'SWB', ip: '10.0.0.15',  desc: 'Web application server',       ports: ['22/SSH','80/HTTP','443/HTTPS','8080/HTTP-PROXY'], os: 'Debian 12 Bookworm' },
        'endpoint':   { label: 'ENDPOINT',   abbr: 'EPT', ip: '10.0.0.50',  desc: 'User workstation',             ports: ['135/RPC','445/SMB','3389/RDP'],                  os: 'Windows 11 Pro' }
    },

    traps: ['server-web'],

    gates: {
        'firewall': { requires: 'nmap', flag: 'firewallBypassed', vuln: 'CVE-2024-1337', vulnDesc: 'Misconfigured ACL' }
    },

    objectives: [
        { id: 'obj_0', label: 'NODES DISCOVERED -- 4 network nodes mapped',   check: 'nodesDiscovered.size >= 4' },
        { id: 'obj_1', label: 'SERVER SCANNED -- nmap scan complete',          check: 'nmapTargets.has("server-db") || nmapTargets.has("server-web")' },
        { id: 'obj_2', label: 'FIREWALL BYPASSED -- access granted',           check: 'firewallBypassed' },
        { id: 'obj_3', label: 'TARGET REACHED -- mission objective complete',  check: 'nodesDiscovered.has("target")' }
    ],

    integrity: 3,

    completion: {
        title: 'SCRIPT KIDDIE',
        subtitle: 'Network scripted. Target reached.',
        storageKey: 'hexworth_operator_python01'
    }
};
