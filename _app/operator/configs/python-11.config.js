/* ================================================================
   PYTHON-11 / VLAN HOPPER -- Mission Config
   ================================================================
   Tier 5 mission. 10x10 grid.
   Forces understanding of network segmentation — 3 VLANs separated
   by inter-VLAN routing gates. Student must breach each VLAN in
   order, collecting intel from each zone before moving to the next.

   PUZZLE DESIGN:
   - Grid divided into 3 horizontal VLAN zones (rows 0-3, 4-6, 7-9)
   - Each zone has its own servers, traps, and gate to next zone
   - Zone 1 (VLAN 10 - Users): 2 workstations, 1 trap, nmap gate
   - Zone 2 (VLAN 20 - Servers): 3 servers, 2 traps, exploit gate
   - Zone 3 (VLAN 30 - DMZ): 2 DMZ servers, 1 trap, target
   - Forces: systematic per-zone sweep, zone-by-zone execution,
     function reuse (same sweep pattern per zone, different targets)

   GRID (10x10) - 3 VLAN zones
   ================================================================ */

var PYTHON_11_CONFIG = {
    id: 'python-11',
    title: 'PYTHON-11 / VLAN HOPPER',
    subtitle: 'Three VLANs. Three firewalls. Hop through them all.',
    category: 'python-ops',
    difficulty: 4,
    inputMode: 'python',
    agent: { tier: 3 },

    grid: {
        rows: 10, cols: 10,
        cells: [
            /* VLAN 10 - User Zone */
            ['gateway',  'empty',    'empty',     'workstation1','empty',    'empty',    'trap-1',    'empty',   'workstation2','wall'],
            ['empty',    'empty',    'switch-1',  'empty',      'empty',    'empty',    'empty',     'empty',   'empty',       'empty'],
            ['empty',    'empty',    'empty',     'empty',      'router-1', 'empty',    'empty',     'empty',   'empty',       'wall'],
            ['wall',     'empty',    'empty',     'empty',      'inter-vlan-1','empty', 'empty',     'empty',   'empty',       'wall'],
            /* VLAN 20 - Server Zone */
            ['empty',    'empty',    'srv-web',   'empty',      'empty',     'trap-2',  'empty',     'srv-db',  'empty',       'empty'],
            ['empty',    'trap-3',   'empty',     'empty',      'switch-2',  'empty',   'empty',     'empty',   'empty',       'wall'],
            ['wall',     'empty',    'empty',     'srv-app',    'empty',     'empty',   'inter-vlan-2','empty', 'empty',       'wall'],
            /* VLAN 30 - DMZ */
            ['empty',    'empty',    'empty',     'empty',      'dmz-web',   'empty',   'empty',     'empty',   'trap-4',     'empty'],
            ['empty',    'empty',    'switch-3',  'empty',      'empty',     'empty',   'empty',     'dmz-mail','empty',       'empty'],
            ['wall',     'wall',     'empty',     'empty',      'empty',     'wall',    'empty',     'empty',   'empty',       'target']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway':       { label: 'GATEWAY',       abbr: 'GTW', ip: '10.10.0.1',   desc: 'Network entry — VLAN 10 (Users)',              ports: ['22/SSH','443/HTTPS'],                     os: 'Cisco IOS 15.4' },
        'switch-1':      { label: 'SWITCH-USERS',  abbr: 'SW1', ip: '10.10.0.5',   desc: 'User zone access switch',                      ports: ['22/SSH','161/SNMP'],                      os: 'Cisco Catalyst 2960' },
        'switch-2':      { label: 'SWITCH-SRVS',   abbr: 'SW2', ip: '10.20.0.5',   desc: 'Server zone distribution switch',              ports: ['22/SSH','161/SNMP'],                      os: 'Cisco Catalyst 3850' },
        'switch-3':      { label: 'SWITCH-DMZ',    abbr: 'SW3', ip: '10.30.0.5',   desc: 'DMZ access switch',                            ports: ['22/SSH','161/SNMP'],                      os: 'Cisco Catalyst 9300' },
        'router-1':      { label: 'ROUTER-CORE',   abbr: 'RTR', ip: '10.10.0.2',   desc: 'Inter-VLAN routing core',                      ports: ['22/SSH','179/BGP','161/SNMP'],            os: 'Cisco ISR 4431' },

        /* VLAN 10 - User workstations */
        'workstation1':  { label: 'WS-FINANCE',    abbr: 'WF1', ip: '10.10.1.10',  desc: 'Finance department workstation',               ports: ['135/RPC','445/SMB','3389/RDP'],           os: 'Windows 11 Enterprise' },
        'workstation2':  { label: 'WS-ENGINEERING',abbr: 'WE2', ip: '10.10.1.20',  desc: 'Engineering department workstation',            ports: ['135/RPC','445/SMB','3389/RDP'],           os: 'Windows 11 Pro' },

        /* VLAN 20 - Servers */
        'srv-web':       { label: 'SRV-WEB',       abbr: 'WEB', ip: '10.20.1.10',  desc: 'Internal web application',                     ports: ['22/SSH','80/HTTP','443/HTTPS'],            os: 'Ubuntu 24.04 LTS' },
        'srv-db':        { label: 'SRV-DATABASE',  abbr: 'DBS', ip: '10.20.1.20',  desc: 'PostgreSQL database cluster',                  ports: ['22/SSH','5432/PostgreSQL'],                os: 'RHEL 9.3', vuln: 'CVE-2024-9103', vulnDesc: 'Unpatched RCE via pg_execute_server_program' },
        'srv-app':       { label: 'SRV-APP',       abbr: 'APP', ip: '10.20.1.30',  desc: 'Application server — API backend',             ports: ['22/SSH','8080/HTTP','8443/HTTPS'],         os: 'Debian 12 Bookworm' },

        /* VLAN 30 - DMZ */
        'dmz-web':       { label: 'DMZ-WEBFRONT',  abbr: 'DWB', ip: '10.30.1.10',  desc: 'Public-facing web frontend',                   ports: ['80/HTTP','443/HTTPS'],                    os: 'Ubuntu 24.04 LTS' },
        'dmz-mail':      { label: 'DMZ-MAILRELAY', abbr: 'DML', ip: '10.30.1.20',  desc: 'Outbound mail relay',                          ports: ['25/SMTP','587/SUBMISSION'],                os: 'Postfix 3.8' },

        /* Inter-VLAN gates */
        'inter-vlan-1':  { label: 'FW-VLAN10-20',  abbr: 'IV1', ip: '10.10.0.254', desc: 'Firewall between User and Server zones',        ports: ['22/SSH','443/MGMT'],                      os: 'pfSense 2.7.0', vuln: 'CVE-2024-3891', vulnDesc: 'ACL bypass via management interface' },
        'inter-vlan-2':  { label: 'FW-VLAN20-30',  abbr: 'IV2', ip: '10.20.0.254', desc: 'Firewall between Server and DMZ zones',         ports: ['22/SSH','443/MGMT'],                      os: 'Palo Alto PAN-OS 11', vuln: 'CVE-2024-7744', vulnDesc: 'Management plane RCE' },

        'target':        { label: 'EXTRACTION',    abbr: 'EXT', ip: '10.30.0.99',  desc: 'DMZ extraction point — mission complete',       ports: ['22/SSH','8443/HTTPS'],                    os: 'RHEL 9.3' },

        /* 4 traps — one per zone + one extra */
        'trap-1':        { label: 'TRAP-VLAN10',   abbr: 'TV1', ip: '10.10.0.200', desc: 'Honeypot in user zone',                        ports: ['22/SSH-FAKE'],                            os: 'Honeyd [TRAP]' },
        'trap-2':        { label: 'TRAP-VLAN20-A', abbr: 'TV2', ip: '10.20.0.200', desc: 'IDS in server zone north',                     ports: ['514/SYSLOG'],                             os: 'Snort [TRAP]' },
        'trap-3':        { label: 'TRAP-VLAN20-B', abbr: 'TV3', ip: '10.20.0.201', desc: 'Honeypot in server zone south',                ports: ['80/HTTP-TRAP'],                           os: 'Honeyd [TRAP]' },
        'trap-4':        { label: 'TRAP-VLAN30',   abbr: 'TV4', ip: '10.30.0.200', desc: 'IDS in DMZ',                                   ports: ['514/SYSLOG'],                             os: 'Suricata [TRAP]' }
    },

    traps: ['trap-1', 'trap-2', 'trap-3', 'trap-4'],

    gates: {
        'inter-vlan-1': { requires: 'nmap',    flag: 'vlan20Unlocked', vuln: 'CVE-2024-3891', vulnDesc: 'ACL bypass' },
        'inter-vlan-2': { requires: 'exploit', flag: 'vlan30Unlocked', vuln: 'CVE-2024-7744', vulnDesc: 'Management plane RCE' }
    },

    objectives: [
        { id: 'obj_0', label: 'VLAN 10 -- nmap both user workstations',                check: 'nmapTargets.has("workstation1") && nmapTargets.has("workstation2")' },
        { id: 'obj_1', label: 'VLAN HOP 1 -- Bypass firewall into server zone',        check: 'vlan20Unlocked' },
        { id: 'obj_2', label: 'VLAN 20 -- nmap all 3 servers (web, db, app)',           check: 'nmapTargets.has("srv-web") && nmapTargets.has("srv-db") && nmapTargets.has("srv-app")' },
        { id: 'obj_3', label: 'VLAN HOP 2 -- Bypass firewall into DMZ',                check: 'vlan30Unlocked' },
        { id: 'obj_4', label: 'VLAN 30 -- nmap both DMZ servers',                      check: 'nmapTargets.has("dmz-web") && nmapTargets.has("dmz-mail")' },
        { id: 'obj_5', label: 'FULL MAP -- Discover 12+ nodes across all VLANs',       check: 'nodesDiscovered.size >= 12' },
        { id: 'obj_6', label: 'EXTRACTION -- Reach the DMZ extraction point',          check: 'nodesDiscovered.has("target")' },
        { id: 'obj_7', label: 'STEALTH -- 3+ integrity remaining',                     check: 'integrity >= 3' }
    ],

    integrity: 5,

    completion: {
        title: 'VLAN HOPPER',
        subtitle: 'Three VLANs breached. Seven servers cataloged. Clean exit.',
        storageKey: 'hexworth_operator_python11'
    }
};
