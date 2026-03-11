/* ================================================================
   FIREWALL-01: Perimeter Check -- Mission Config
   ================================================================
   Terminal-mode mission. Custom commands: ids, rules, block,
   allow, test, flush.
   ================================================================ */

var FIREWALL_01_CONFIG = {
    id: 'firewall-01',
    title: 'FIREWALL-01 / PERIMETER',
    subtitle: 'Firewall hardened. Perimeter secured.',
    category: 'firewall-ops',
    difficulty: 1,
    inputMode: 'terminal',
    prompt: 'admin@fw-01:~$',

    grid: {
        rows: 4,
        cols: 5,
        start: { col: 1, row: 1 },
        cells: [
            ['internet',    'empty',       'dmz-web',     'dmz-mail',    'wall'],
            ['empty',       'firewall',    'empty',       'ids-sensor',  'attacker'],
            ['wall',        'internal-db', 'empty',       'empty',       'wall'],
            ['wall',        'wall',        'admin-ws',    'wall',        'wall']
        ]
    },

    nodes: {
        'internet':    { label: 'INTERNET',    abbr: 'WAN', ip: '0.0.0.0',       desc: 'WAN uplink -- untrusted zone',                  os: 'N/A' },
        'dmz-web':     { label: 'DMZ-WEB',     abbr: 'WEB', ip: '172.16.0.10',   desc: 'Public web server in DMZ',                     os: 'Nginx / Ubuntu 22.04' },
        'dmz-mail':    { label: 'DMZ-MAIL',    abbr: 'MX',  ip: '172.16.0.20',   desc: 'Mail server in DMZ',                           os: 'Postfix / Debian 12' },
        'firewall':    { label: 'FIREWALL',    abbr: 'FW1', ip: '10.0.0.1',      desc: 'Primary perimeter firewall',                   os: 'pfSense 2.7.0' },
        'ids-sensor':  { label: 'IDS-SENSOR',  abbr: 'IDS', ip: '10.0.0.5',      desc: 'Suricata intrusion detection sensor',          os: 'Suricata 7.0' },
        'attacker':    { label: 'ATTACKER',    abbr: 'ATK', ip: '203.0.113.66',  desc: 'Hostile external host -- port scanning',        os: 'Unknown' },
        'internal-db': { label: 'INT-DB',      abbr: 'DB',  ip: '192.168.1.50',  desc: 'Internal MySQL database server',               os: 'MySQL 8.0 / RHEL 9' },
        'admin-ws':    { label: 'ADMIN-WS',    abbr: 'ADM', ip: '192.168.1.100', desc: 'Firewall admin workstation',                   os: 'Windows 11 Pro' }
    },

    traps: [],
    gates: {},

    objectives: [
        { id: 'ids-checked',    label: 'Check IDS alerts',               check: 'alertsChecked' },
        { id: 'attacker-block', label: 'Block attacker IP',              check: 'attackerBlocked' },
        { id: 'web-allow',      label: 'Allow web traffic to DMZ',       check: 'webAllowed' },
        { id: 'db-secure',      label: 'Verify DB unreachable from WAN', check: 'dbSecured' }
    ],

    integrity: 3,

    completion: {
        title: 'PERIMETER',
        subtitle: 'Firewall hardened. Perimeter secured.',
        storageKey: 'hexworth_operator_firewall01'
    },

    // Default firewall rules for display
    defaultRules: [
        { id: 1, action: 'ALLOW', src: 'any',             dst: '172.16.0.10', port: '80',  proto: 'TCP' },
        { id: 2, action: 'ALLOW', src: 'any',             dst: '172.16.0.10', port: '443', proto: 'TCP' },
        { id: 3, action: 'ALLOW', src: 'any',             dst: '172.16.0.20', port: '25',  proto: 'TCP' },
        { id: 4, action: 'ALLOW', src: '192.168.1.0/24', dst: 'any',         port: 'any', proto: 'any' },
        { id: 5, action: 'DENY',  src: 'any',             dst: 'any',         port: 'any', proto: 'any' }
    ],

    // Mission briefing lines
    briefing: [
        { text: '\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557', type: 'heading' },
        { text: '\u2551  MISSION: FIREWALL-01 \u2014 PERIMETER      \u2551', type: 'heading' },
        { text: '\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563', type: 'heading' },
        { text: '\u2551  Hostile traffic detected on the WAN.  \u2551', type: 'heading' },
        { text: '\u2551  Check the IDS. Block the attacker.    \u2551', type: 'heading' },
        { text: '\u2551  Harden the perimeter. Verify access.  \u2551', type: 'heading' },
        { text: '\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D', type: 'heading' },
        { text: '', type: 'system' },
        { text: '[SYS] Admin online at FIREWALL (10.0.0.1)', type: 'success' },
        { text: '[SYS] Type "help" for command reference', type: 'info' },
        { text: '[SYS] Type "scan" to survey the area', type: 'info' },
        { text: '', type: 'system' }
    ]
};
