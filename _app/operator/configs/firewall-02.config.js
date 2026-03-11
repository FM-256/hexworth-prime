/* ================================================================
   FIREWALL-02: Zero Day Response -- Mission Config
   ================================================================
   Terminal-mode mission. Custom commands: examine, analyze, rule,
   segment, block, verify.
   ================================================================ */

var FIREWALL_02_CONFIG = {
    id: 'firewall-02',
    title: 'FIREWALL-02 / ZERO DAY RESPONSE',
    subtitle: 'Zero-day neutralized. Perimeter restored.',
    category: 'firewall-ops',
    difficulty: 2,
    inputMode: 'terminal',
    prompt: 'operator@waf:~$',

    grid: {
        rows: 4,
        cols: 5,
        start: { col: 0, row: 0 },
        cells: [
            ['waf-logs',       'app-server',      'empty',          'wall',           'wall'],
            ['empty',          'load-balancer',   'empty',          'ids-sensor',     'wall'],
            ['wall',           'empty',           'rule-engine',    'empty',          'db-server'],
            ['wall',           'quarantine-zone', 'empty',          'egress-monitor', 'empty']
        ]
    },

    nodes: {
        'waf-logs':        { label: 'WAF-LOGS',      abbr: 'WAF', ip: '10.2.0.10',   desc: 'Web Application Firewall -- request/response logs',           ports: ['80/HTTP', '443/HTTPS'],                          os: 'ModSecurity 3.0' },
        'app-server':      { label: 'APP-SERVER',    abbr: 'APP', ip: '10.2.0.20',   desc: 'Production web application -- Node.js backend',               ports: ['443/HTTPS', '3000/API', '8080/DEBUG'],            os: 'Ubuntu 22.04 LTS' },
        'load-balancer':   { label: 'LOAD-BALANCER', abbr: 'LB',  ip: '10.2.0.5',    desc: 'L7 load balancer -- traffic distribution',                    ports: ['80/HTTP', '443/HTTPS', '8443/STATS'],             os: 'HAProxy 2.8' },
        'ids-sensor':      { label: 'IDS-SENSOR',    abbr: 'IDS', ip: '10.2.0.50',   desc: 'Intrusion Detection System -- packet analysis',               ports: ['N/A'],                                            os: 'Suricata 7.0' },
        'rule-engine':     { label: 'RULE-ENGINE',   abbr: 'RUL', ip: '10.2.0.10',   desc: 'WAF rule management -- signature updates',                    ports: ['443/HTTPS', '9090/MGMT'],                        os: 'ModSecurity 3.0' },
        'db-server':       { label: 'DB-SERVER',     abbr: 'DBS', ip: '10.2.1.100',  desc: 'Production database -- customer records',                     ports: ['5432/PostgreSQL', '6379/Redis'],                  os: 'RHEL 9.3' },
        'quarantine-zone': { label: 'QUARANTINE',    abbr: 'QRN', ip: '10.2.2.0/24', desc: 'Network quarantine -- isolated VLAN for analysis',            ports: ['N/A'],                                            os: 'VLAN 999' },
        'egress-monitor':  { label: 'EGRESS-MON',    abbr: 'EGR', ip: '10.2.0.254',  desc: 'Egress traffic monitor -- outbound data inspection',          ports: ['N/A'],                                            os: 'Zeek 6.0' }
    },

    traps: [],
    gates: {},

    objectives: [
        { id: 'attack-pattern',  label: 'ID attack pattern',  check: 'attackPatternFound' },
        { id: 'waf-rule',        label: 'Write WAF rule',     check: 'customRuleWritten' },
        { id: 'segment-db',      label: 'Segment database',   check: 'dbSegmented' },
        { id: 'verify-egress',   label: 'Verify egress',      check: 'egressVerified' }
    ],

    integrity: 3,

    completion: {
        title: 'ZERO DAY RESPONSE',
        subtitle: 'Zero-day neutralized. Perimeter restored.',
        storageKey: 'hexworth_operator_firewall02'
    },

    briefing: [
        { text: '\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557', type: 'heading' },
        { text: '\u2551  MISSION: FIREWALL-02 \u2014 ZERO DAY RESPONSE  \u2551', type: 'heading' },
        { text: '\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563', type: 'heading' },
        { text: '\u2551  Zero-day WAF bypass detected.              \u2551', type: 'heading' },
        { text: '\u2551  Encoded SQL injection evading signatures.  \u2551', type: 'heading' },
        { text: '\u2551  Analyze. Write custom rules.               \u2551', type: 'heading' },
        { text: '\u2551  Segment critical assets. Verify perimeter. \u2551', type: 'heading' },
        { text: '\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D', type: 'heading' },
        { text: '', type: 'system' },
        { text: '[SYS] Operator online at WAF-LOGS (10.2.0.10)', type: 'success' },
        { text: '[SYS] Type "help" for command reference', type: 'info' },
        { text: '[SYS] Type "examine" to inspect current node', type: 'info' },
        { text: '', type: 'system' }
    ]
};
