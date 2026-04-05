/* ================================================================
   PYTHON-09 / NIGHT RAID -- Mission Config
   ================================================================
   Tier 5 mission. 9x9 grid.
   Forces multi-phase planning: recon phase → breach phase → extract.

   PUZZLE DESIGN:
   - Large 9x9 grid divided into 3 operational phases
   - Phase 1 (Recon): Sweep the east wing, discover all infrastructure
   - Phase 2 (Breach): Use collected intel to breach 4 servers
   - Phase 3 (Extract): Navigate through gated corridor to extraction
   - Student must write a structured program with clear phases
   - Multiple functions for different operation types
   - Data collected in Phase 1 drives decisions in Phase 2

   PYTHON SKILLS:
   - Multi-function programs (def recon(), def breach(), def extract())
   - Passing data between phases (return values from functions)
   - Nested loops for grid sweep
   - Complex conditionals combining multiple checks

   GRID (9x9) - 5 traps, 4 gate types, 6 servers, extraction target
   ================================================================ */

var PYTHON_09_CONFIG = {
    id: 'python-09',
    title: 'PYTHON-09 / NIGHT RAID',
    subtitle: 'Three-phase operation. Recon. Breach. Extract.',
    category: 'python-ops',
    difficulty: 4,
    inputMode: 'python',
    agent: { tier: 3 },

    grid: {
        rows: 9, cols: 9,
        cells: [
            ['gateway',  'empty',    'empty',     'router',     'empty',      'empty',    'wall',       'empty',   'wall'],
            ['empty',    'empty',    'honeypot',  'empty',      'server-dns', 'empty',    'empty',      'empty',   'empty'],
            ['empty',    'switch',   'empty',     'empty',      'empty',      'server-ad','empty',      'ids-1',   'wall'],
            ['wall',     'empty',    'empty',     'firewall-a', 'empty',      'empty',    'empty',      'empty',   'empty'],
            ['empty',    'empty',    'server-web','empty',      'wall',       'empty',    'server-mail','empty',   'wall'],
            ['empty',    'honeypot2','empty',     'empty',      'empty',      'empty',    'empty',      'ids-2',   'empty'],
            ['wall',     'empty',    'empty',     'firewall-b', 'empty',      'empty',    'empty',      'empty',   'empty'],
            ['empty',    'empty',    'empty',     'empty',      'server-db',  'empty',    'honeypot3',  'empty',   'empty'],
            ['wall',     'wall',     'empty',     'empty',      'empty',      'wall',     'empty',      'empty',   'target']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway':      { label: 'GATEWAY',      abbr: 'GTW', ip: '10.80.0.1',   desc: 'Insertion point',                            ports: ['22/SSH','443/HTTPS'],                     os: 'Cisco IOS 15.4' },
        'router':       { label: 'ROUTER',       abbr: 'RTR', ip: '10.80.0.2',   desc: 'Core router',                                ports: ['22/SSH','179/BGP'],                       os: 'Juniper JunOS 21.4' },
        'switch':       { label: 'SWITCH',       abbr: 'SWT', ip: '10.80.0.5',   desc: 'Distribution switch',                        ports: ['22/SSH','161/SNMP'],                      os: 'Cisco Catalyst 3850' },

        /* 6 target servers */
        'server-dns':   { label: 'SRV-DNS',      abbr: 'DNS', ip: '10.80.0.11',  desc: 'DNS server — zone data',                     ports: ['22/SSH','53/DNS','953/RNDC'],             os: 'BIND 9.18', vuln: 'CVE-2024-9101', vulnDesc: 'Zone transfer allowed to any host' },
        'server-ad':    { label: 'SRV-AD',       abbr: 'AD',  ip: '10.80.0.12',  desc: 'Active Directory controller',                ports: ['53/DNS','88/KERBEROS','389/LDAP','445/SMB'],os: 'Windows Server 2022 AD' },
        'server-web':   { label: 'SRV-WEB',      abbr: 'WEB', ip: '10.80.0.13',  desc: 'Public web application',                     ports: ['22/SSH','80/HTTP','443/HTTPS'],            os: 'Ubuntu 24.04 LTS', vuln: 'CVE-2024-9102', vulnDesc: 'SQL injection in login form' },
        'server-mail':  { label: 'SRV-MAIL',     abbr: 'MIL', ip: '10.80.0.14',  desc: 'Exchange mail server',                       ports: ['25/SMTP','143/IMAP','993/IMAPS','443/OWA'],os: 'Exchange 2019 CU14' },
        'server-db':    { label: 'SRV-DATABASE', abbr: 'DBS', ip: '10.80.0.15',  desc: 'PostgreSQL cluster — credentials store',     ports: ['22/SSH','5432/PostgreSQL'],                os: 'RHEL 9.3', vuln: 'CVE-2024-9103', vulnDesc: 'Unpatched RCE via pg_execute_server_program' },

        /* 2 firewalls (gates) */
        'firewall-a':   { label: 'FIREWALL-DMZ', abbr: 'FWA', ip: '10.80.0.251', desc: 'DMZ firewall — zone boundary',               ports: ['22/SSH','443/MGMT'],                      os: 'pfSense 2.7.0', vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL allows bypass' },
        'firewall-b':   { label: 'FIREWALL-INT', abbr: 'FWB', ip: '10.80.0.252', desc: 'Internal firewall — data center boundary',   ports: ['22/SSH','443/MGMT'],                      os: 'Palo Alto PAN-OS 11', vuln: 'CVE-2024-7744', vulnDesc: 'Management plane RCE via crafted request' },

        /* Target */
        'target':       { label: 'EXTRACTION',   abbr: 'EXT', ip: '10.80.0.99',  desc: 'Data extraction staging point',               ports: ['22/SSH','8443/HTTPS'],                    os: 'RHEL 9.3' },

        /* 5 traps */
        'honeypot':     { label: 'TRAP-1',       abbr: 'T1',  ip: '10.80.0.200', desc: 'Decoy north',                                ports: ['22/SSH-FAKE'],                            os: 'Honeyd [TRAP]' },
        'honeypot2':    { label: 'TRAP-2',       abbr: 'T2',  ip: '10.80.0.201', desc: 'Decoy south',                                ports: ['80/HTTP-TRAP'],                           os: 'Honeyd [TRAP]' },
        'honeypot3':    { label: 'TRAP-3',       abbr: 'T3',  ip: '10.80.0.202', desc: 'Decoy extraction corridor',                  ports: ['445/SMB-FAKE'],                           os: 'Honeyd [TRAP]' },
        'ids-1':        { label: 'IDS-EAST',     abbr: 'I1',  ip: '10.80.0.203', desc: 'IDS sensor east wing',                        ports: ['514/SYSLOG'],                             os: 'Snort [TRAP]' },
        'ids-2':        { label: 'IDS-SOUTH',    abbr: 'I2',  ip: '10.80.0.204', desc: 'IDS sensor south passage',                    ports: ['514/SYSLOG'],                             os: 'Suricata [TRAP]' }
    },

    traps: ['honeypot', 'honeypot2', 'honeypot3', 'ids-1', 'ids-2'],

    gates: {
        'firewall-a': { requires: 'nmap',    flag: 'dmzBypassed',     vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL allows bypass' },
        'firewall-b': { requires: 'exploit', flag: 'internalBypassed',vuln: 'CVE-2024-7744', vulnDesc: 'Management plane RCE' }
    },

    objectives: [
        { id: 'obj_0', label: 'PHASE 1 -- Discover 8+ nodes (recon sweep)',        check: 'nodesDiscovered.size >= 8' },
        { id: 'obj_1', label: 'PHASE 1 -- nmap DNS, Web, and DB servers',          check: 'nmapTargets.has("server-dns") && nmapTargets.has("server-web") && nmapTargets.has("server-db")' },
        { id: 'obj_2', label: 'PHASE 2 -- Bypass DMZ firewall (nmap)',             check: 'dmzBypassed' },
        { id: 'obj_3', label: 'PHASE 2 -- Bypass internal firewall (exploit)',     check: 'internalBypassed' },
        { id: 'obj_4', label: 'PHASE 2 -- nmap all 5 servers',                    check: 'nmapTargets.has("server-dns") && nmapTargets.has("server-ad") && nmapTargets.has("server-web") && nmapTargets.has("server-mail") && nmapTargets.has("server-db")' },
        { id: 'obj_5', label: 'PHASE 3 -- Reach extraction point',                check: 'nodesDiscovered.has("target")' },
        { id: 'obj_6', label: 'STEALTH -- 3+ integrity remaining',                check: 'integrity >= 3' }
    ],

    integrity: 5,  /* 5 pips for 5 traps — generous but demanding for stealth objective */

    completion: {
        title: 'NIGHT RAID',
        subtitle: 'Three phases executed. Network compromised. Data extracted.',
        storageKey: 'hexworth_operator_python09'
    }
};
