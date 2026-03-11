/* ================================================================
   RECON-02: Deep Sweep -- Mission Config
   ================================================================
   Terminal-mode mission. Multi-subnet: DMZ + internal via VPN pivot.
   Custom commands: scan, move, ping, nmap, traceroute, pivot.
   Honeypot trap: nmap without prior ping triggers IDS alert.
   VPN gate: internal cells require 'pivot' at VPN-GATEWAY.

   NOTE: This mission has custom state beyond the engine baseline:
   - pivoted, honeypotTriggered, honeypotPinged, dmzNodesMapped,
     dcHostnameFound.
   These are tracked as custom state flags on the state object.
   ================================================================ */

var RECON_02_CONFIG = {
    id: 'recon-02',
    title: 'RECON-02 / DEEP SWEEP',
    subtitle: 'Map the DMZ. Avoid the honeypot. Pivot through VPN. Extract DC hostname.',
    category: 'network-recon',
    difficulty: 2,
    inputMode: 'terminal',
    promptText: 'agent@recon:~$ ',

    grid: {
        rows: 4,
        cols: 5,
        cells: [
            ['edge-router',  'dmz-web',      'dmz-mail',    'wall',        'wall'],
            ['empty',        'core-switch',  'empty',        'vpn-gateway', 'wall'],
            ['wall',         'empty',        'honeypot',     'empty',       'internal-db'],
            ['wall',         'empty',        'empty',        'internal-dc', 'empty']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'edge-router':  { label: 'EDGE-ROUTER',  abbr: 'EDG', ip: '172.16.0.1',   desc: 'Perimeter edge router -- border gateway',              ports: ['22/SSH','179/BGP','443/HTTPS-MGMT'],                  os: 'Cisco IOS-XE 17.6' },
        'dmz-web':      { label: 'DMZ-WEB',      abbr: 'DWB', ip: '172.16.1.10',  desc: 'DMZ web server -- public-facing',                      ports: ['80/HTTP','443/HTTPS','8443/HTTPS-ALT'],               os: 'Ubuntu 22.04 LTS' },
        'dmz-mail':     { label: 'DMZ-MAIL',     abbr: 'DML', ip: '172.16.1.20',  desc: 'DMZ mail relay -- inbound/outbound filtering',         ports: ['25/SMTP','143/IMAP','587/SUBMISSION'],                os: 'Postfix on Debian 12' },
        'core-switch':  { label: 'CORE-SWITCH',  abbr: 'CSW', ip: '172.16.0.5',   desc: 'Core L3 switch -- inter-VLAN routing',                 ports: ['22/SSH','161/SNMP','8080/MGMT-UI'],                   os: 'Arista EOS 4.30' },
        'vpn-gateway':  { label: 'VPN-GATEWAY',  abbr: 'VPN', ip: '172.16.0.254', desc: 'VPN concentrator -- IPSec/SSL bridge to internal',     ports: ['22/SSH','443/HTTPS','500/IKE','4500/NAT-T'],          os: 'Palo Alto PAN-OS 11.1' },
        'honeypot':     { label: 'HONEYPOT',     abbr: 'HPT', ip: '172.16.2.99',  desc: 'Decoy server -- triggers alert on interaction',        ports: ['22/SSH','80/HTTP','3306/MySQL','445/SMB'],            os: 'HoneyOS (simulated multi-service)' },
        'internal-db':  { label: 'INTERNAL-DB',  abbr: 'IDB', ip: '10.10.0.30',   desc: 'Internal database server -- HR/finance data',          ports: ['22/SSH','5432/PostgreSQL','6379/Redis'],              os: 'RHEL 9.3' },
        'internal-dc':  { label: 'INTERNAL-DC',  abbr: 'IDC', ip: '10.10.0.10',   desc: 'Internal domain controller -- Active Directory',       ports: ['53/DNS','88/Kerberos','389/LDAP','636/LDAPS','445/SMB'], os: 'Windows Server 2022' }
    },

    traps: [],
    gates: {},

    objectives: [
        { id: 'dmz-mapped',    label: 'Map 3 DMZ nodes',           check: 'dmzNodesMapped.size >= 3' },
        { id: 'honeypot-safe', label: 'ID honeypot (no trigger)',   check: 'nodesDiscovered.has("honeypot") && !honeypotTriggered' },
        { id: 'vpn-pivot',     label: 'VPN pivot established',      check: 'pivoted' },
        { id: 'dc-hostname',   label: 'DC hostname exfiltrated',    check: 'dcHostnameFound' }
    ],

    integrity: 3,

    completion: {
        title: 'DEEP SWEEP',
        subtitle: 'Multi-subnet recon complete. Internal access secured.',
        storageKey: 'hexworth_operator_recon02'
    },

    briefing: [
        'Agent deployed at network perimeter.',
        'Multi-subnet target: DMZ + Internal.',
        'Map the DMZ. Avoid the honeypot.',
        'Pivot through VPN. Extract DC hostname.'
    ],

    commands: ['scan', 'move', 'ping', 'nmap', 'traceroute', 'pivot', 'status', 'help', 'clear'],

    // Custom state fields beyond engine baseline
    customState: {
        pivoted: false,
        honeypotTriggered: false,
        honeypotPinged: false,
        dmzNodesMapped: 'Set',
        dcHostnameFound: false
    },

    // DMZ node types for mapping objective
    dmzNodes: ['edge-router', 'dmz-web', 'dmz-mail'],

    // Internal zone definition: cells that require VPN pivot
    internalZone: function(col, row, cells) {
        var type = cells[row][col];
        if (type === 'internal-db' || type === 'internal-dc') return true;
        if (row >= 2 && col >= 3 && type === 'empty') return true;
        return false;
    }
};
