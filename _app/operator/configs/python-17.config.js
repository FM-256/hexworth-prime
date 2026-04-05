/* ================================================================
   PYTHON-17 / MEGA GRID -- Mission Config
   ================================================================
   Tier 6 MILESTONE mission. 12x12 grid — 144 cells.
   The largest grid yet. Systematic automation is the ONLY option.

   PUZZLE DESIGN:
   - 12x12 grid representing a multi-floor data center
   - Floor 1 (rows 0-3): Network edge — routers, switches, DMZ
   - Floor 2 (rows 4-7): Application tier — web, API, middleware
   - Floor 3 (rows 8-11): Data tier — databases, storage, backup
   - Each floor has a firewall gate + 3 servers + 2 traps
   - 9 servers total, 6 traps, 3 gates, extraction in far corner
   - 144 cells makes manual navigation impossible
   - Student MUST write a complete automation program:
     * safe_advance() function (trap avoidance)
     * sweep_floor() function (systematic per-floor sweep)
     * for loops to cover each floor
     * if/elif for gate identification
     * list to track discovered servers
   - This is the "final exam" for grid-based automation

   GRID (12x12):
   ================================================================ */

var PYTHON_17_CONFIG = {
    id: 'python-17',
    title: 'PYTHON-17 / MEGA GRID',
    subtitle: '12x12 data center. 144 cells. Full automation required.',
    category: 'python-ops',
    difficulty: 4,
    inputMode: 'python',
    agent: { tier: 3 },

    grid: {
        rows: 12, cols: 12,
        cells: [
            /* Floor 1: Network Edge */
            ['gateway','empty', 'empty', 'trap-1','empty', 'router-1','empty','empty', 'dmz-web','empty', 'empty', 'wall'],
            ['empty',  'empty', 'switch','empty', 'empty', 'empty',  'empty','trap-2','empty',  'empty', 'dmz-ftp','empty'],
            ['empty',  'empty', 'empty', 'empty', 'empty', 'empty',  'empty','empty', 'empty',  'empty', 'empty', 'wall'],
            ['wall',   'empty', 'empty', 'empty', 'fw-1',  'empty',  'empty','empty', 'empty',  'dmz-mail','empty','wall'],
            /* Floor 2: Application Tier */
            ['empty',  'empty', 'empty', 'empty', 'empty', 'app-web','empty','empty', 'empty',  'empty', 'trap-3','wall'],
            ['empty',  'trap-4','empty', 'empty', 'empty', 'empty',  'empty','empty', 'app-api','empty', 'empty', 'empty'],
            ['wall',   'empty', 'empty', 'empty', 'empty', 'empty',  'app-mid','empty','empty', 'empty', 'empty', 'wall'],
            ['empty',  'empty', 'empty', 'empty', 'fw-2',  'empty',  'empty','empty', 'empty',  'empty', 'empty', 'empty'],
            /* Floor 3: Data Tier */
            ['empty',  'empty', 'trap-5','empty', 'empty', 'db-primary','empty','empty','empty', 'empty', 'empty', 'wall'],
            ['empty',  'empty', 'empty', 'empty', 'empty', 'empty',  'empty','empty', 'db-replica','empty','trap-6','empty'],
            ['wall',   'empty', 'empty', 'empty', 'empty', 'empty',  'empty','storage','empty', 'empty', 'empty', 'wall'],
            ['wall',   'wall',  'empty', 'empty', 'empty', 'fw-3',   'empty','empty', 'empty',  'empty', 'empty', 'target']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway':     { label: 'GATEWAY',       abbr: 'GTW', ip: '10.200.0.1',  desc: 'Data center entry',                        ports: ['22/SSH','443/HTTPS'],                     os: 'Cisco ISR 4451' },
        'router-1':    { label: 'EDGE-ROUTER',   abbr: 'RTR', ip: '10.200.0.2',  desc: 'Edge router — BGP peering',                ports: ['22/SSH','179/BGP','161/SNMP'],            os: 'Juniper MX480' },
        'switch':      { label: 'CORE-SWITCH',   abbr: 'CSW', ip: '10.200.0.5',  desc: 'Core aggregation switch',                  ports: ['22/SSH','161/SNMP'],                      os: 'Arista 7280R3' },

        /* Floor 1: DMZ servers */
        'dmz-web':     { label: 'DMZ-WEB',       abbr: 'DWB', ip: '10.200.1.10', desc: 'Public web frontend',                      ports: ['80/HTTP','443/HTTPS'],                    os: 'Nginx 1.25 on Ubuntu' },
        'dmz-ftp':     { label: 'DMZ-FTP',       abbr: 'DFP', ip: '10.200.1.11', desc: 'Secure file transfer',                     ports: ['22/SFTP','990/FTPS'],                     os: 'ProFTPD 1.3.8' },
        'dmz-mail':    { label: 'DMZ-MAIL',      abbr: 'DML', ip: '10.200.1.12', desc: 'Inbound mail relay',                       ports: ['25/SMTP','587/SUBMISSION'],                os: 'Postfix 3.8' },

        /* Floor 2: Application servers */
        'app-web':     { label: 'APP-WEB',       abbr: 'AWB', ip: '10.200.2.10', desc: 'Application web tier',                     ports: ['22/SSH','8080/HTTP','8443/HTTPS'],         os: 'Tomcat 10 on Ubuntu' },
        'app-api':     { label: 'APP-API',       abbr: 'API', ip: '10.200.2.11', desc: 'REST API backend',                         ports: ['22/SSH','3000/API','443/HTTPS'],           os: 'Node.js 22 LTS' },
        'app-mid':     { label: 'APP-MIDDLEWARE', abbr: 'MID', ip: '10.200.2.12', desc: 'Message broker / middleware',              ports: ['22/SSH','5672/AMQP','15672/MGMT'],        os: 'RabbitMQ 3.13' },

        /* Floor 3: Data servers */
        'db-primary':  { label: 'DB-PRIMARY',    abbr: 'DBP', ip: '10.200.3.10', desc: 'Primary PostgreSQL database',              ports: ['22/SSH','5432/PostgreSQL'],                os: 'RHEL 9.3', vuln: 'CVE-2024-9501', vulnDesc: 'Unpatched pg_execute_server_program RCE' },
        'db-replica':  { label: 'DB-REPLICA',    abbr: 'DBR', ip: '10.200.3.11', desc: 'Read replica — hot standby',               ports: ['22/SSH','5432/PostgreSQL'],                os: 'RHEL 9.3' },
        'storage':     { label: 'SAN-STORAGE',   abbr: 'SAN', ip: '10.200.3.12', desc: 'SAN storage controller',                   ports: ['22/SSH','3260/ISCSI','443/MGMT'],         os: 'NetApp ONTAP 9.14' },

        /* Floor gates */
        'fw-1':        { label: 'FW-FLOOR1-2',   abbr: 'F12', ip: '10.200.0.251',desc: 'Edge → Application firewall',              ports: ['22/SSH','443/MGMT'],                      os: 'pfSense 2.7.0', vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL' },
        'fw-2':        { label: 'FW-FLOOR2-3',   abbr: 'F23', ip: '10.200.0.252',desc: 'Application → Data firewall',              ports: ['22/SSH','443/MGMT'],                      os: 'Palo Alto PAN-OS', vuln: 'CVE-2024-7744', vulnDesc: 'Management RCE' },
        'fw-3':        { label: 'FW-FLOOR3-EXT', abbr: 'F3X', ip: '10.200.0.253',desc: 'Data → Extraction firewall',               ports: ['22/SSH','443/MGMT'],                      os: 'Fortinet FortiGate', vuln: 'CVE-2024-6221', vulnDesc: 'ISN bypass' },

        'target':      { label: 'EXTRACTION',    abbr: 'EXT', ip: '10.200.0.99', desc: 'Data center exit — mission complete',        ports: ['22/SSH','8443/HTTPS'],                    os: 'RHEL 9.3' },

        /* 6 traps — 2 per floor */
        'trap-1':  { label: 'TRAP-F1A', abbr: 'T1A', ip: '10.200.0.201', desc: 'IDS floor 1 north',   ports: ['514/SYSLOG'],   os: 'Snort [TRAP]' },
        'trap-2':  { label: 'TRAP-F1B', abbr: 'T1B', ip: '10.200.0.202', desc: 'Honeypot floor 1 NE', ports: ['22/SSH-FAKE'],  os: 'Honeyd [TRAP]' },
        'trap-3':  { label: 'TRAP-F2A', abbr: 'T2A', ip: '10.200.0.203', desc: 'IDS floor 2 east',    ports: ['514/SYSLOG'],   os: 'Suricata [TRAP]' },
        'trap-4':  { label: 'TRAP-F2B', abbr: 'T2B', ip: '10.200.0.204', desc: 'Honeypot floor 2 SW', ports: ['80/HTTP-TRAP'], os: 'Honeyd [TRAP]' },
        'trap-5':  { label: 'TRAP-F3A', abbr: 'T3A', ip: '10.200.0.205', desc: 'IDS floor 3 west',    ports: ['514/SYSLOG'],   os: 'Snort [TRAP]' },
        'trap-6':  { label: 'TRAP-F3B', abbr: 'T3B', ip: '10.200.0.206', desc: 'Honeypot floor 3 SE', ports: ['445/SMB-FAKE'], os: 'Honeyd [TRAP]' }
    },

    traps: ['trap-1', 'trap-2', 'trap-3', 'trap-4', 'trap-5', 'trap-6'],

    gates: {
        'fw-1': { requires: 'nmap',    flag: 'floor2Unlocked', vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL' },
        'fw-2': { requires: 'exploit', flag: 'floor3Unlocked', vuln: 'CVE-2024-7744', vulnDesc: 'Management RCE' },
        'fw-3': { requires: 'spoof',   flag: 'exitUnlocked',   vuln: 'CVE-2024-6221', vulnDesc: 'ISN bypass' }
    },

    objectives: [
        { id: 'obj_0',  label: 'FLOOR 1 -- nmap all 3 DMZ servers',                    check: 'nmapTargets.has("dmz-web") && nmapTargets.has("dmz-ftp") && nmapTargets.has("dmz-mail")' },
        { id: 'obj_1',  label: 'FLOOR 2 -- Bypass floor gate + nmap all 3 app servers',check: 'floor2Unlocked && nmapTargets.has("app-web") && nmapTargets.has("app-api") && nmapTargets.has("app-mid")' },
        { id: 'obj_2',  label: 'FLOOR 3 -- Bypass floor gate + nmap all 3 data servers',check: 'floor3Unlocked && nmapTargets.has("db-primary") && nmapTargets.has("db-replica") && nmapTargets.has("storage")' },
        { id: 'obj_3',  label: 'FULL CATALOG -- nmap all 9 servers',                   check: 'nmapTargets.has("dmz-web") && nmapTargets.has("dmz-ftp") && nmapTargets.has("dmz-mail") && nmapTargets.has("app-web") && nmapTargets.has("app-api") && nmapTargets.has("app-mid") && nmapTargets.has("db-primary") && nmapTargets.has("db-replica") && nmapTargets.has("storage")' },
        { id: 'obj_4',  label: 'INFRASTRUCTURE -- nmap edge router and core switch',   check: 'nmapTargets.has("router-1") && nmapTargets.has("switch")' },
        { id: 'obj_5',  label: 'EXIT -- Bypass extraction firewall',                   check: 'exitUnlocked' },
        { id: 'obj_6',  label: 'EXTRACTION -- Reach the data center exit',             check: 'nodesDiscovered.has("target")' },
        { id: 'obj_7',  label: 'FULL MAP -- Discover 15+ nodes',                       check: 'nodesDiscovered.size >= 15' },
        { id: 'obj_8',  label: 'STEALTH -- 4+ integrity remaining',                    check: 'integrity >= 4' }
    ],

    integrity: 6,

    completion: {
        title: 'MEGA GRID',
        subtitle: 'Three floors. Nine servers. 144 cells mapped. Full automation.',
        storageKey: 'hexworth_operator_python17'
    }
};
