/* ================================================================
   PYTHON-13 / DOUBLE TAP -- Mission Config
   ================================================================
   Tier 6 mission. 10x10 grid.
   Forces two-pass strategy: recon sweep discovers and catalogs all
   nodes, then a second pass exploits the vulnerable ones.

   PUZZLE DESIGN:
   - 10x10 grid with 8 servers, 3 gates, 5 traps
   - First pass: sweep the grid discovering and nmapping servers
   - Second pass: return to the 4 vulnerable servers and exploit them
   - The student must store nmap results from pass 1 to use in pass 2
   - Forces: data collection into lists, multi-pass algorithm design,
     reusing functions for both sweep and targeted exploitation

   PYTHON SKILL: Two-pass algorithm with stored results
     # Pass 1: Recon sweep — discover and catalog
     found_vulns = []
     def sweep_row(direction, length):
         for i in range(length):
             safe_advance(direction)
             data = agent.scan()
             for node in data:
                 result = agent.nmap(node['name'])
                 if result and result['vuln']:
                     found_vulns = found_vulns + [node['name']]
     # ... sweep grid ...

     # Pass 2: Exploit — return to each vulnerable target
     for target in found_vulns:
         agent.exploit(target)

   GRID (10x10):
     [start]  [empty]  [empty]   [trap-1]  [srv-1]   [empty]  [empty]   [empty]  [srv-2]  [wall]
     [empty]  [empty]  [empty]   [empty]   [empty]   [empty]  [trap-2]  [empty]  [empty]  [empty]
     [empty]  [empty]  [router]  [empty]   [empty]   [empty]  [empty]   [empty]  [empty]  [wall]
     [wall]   [empty]  [empty]   [srv-3]   [empty]   [gate-1] [empty]   [srv-4]  [empty]  [empty]
     [empty]  [trap-3] [empty]   [empty]   [empty]   [empty]  [empty]   [empty]  [empty]  [wall]
     [empty]  [empty]  [srv-5]   [empty]   [switch]  [empty]  [empty]   [empty]  [srv-6]  [empty]
     [wall]   [empty]  [empty]   [empty]   [empty]   [gate-2] [empty]   [trap-4] [empty]  [wall]
     [empty]  [empty]  [empty]   [srv-7]   [empty]   [empty]  [empty]   [empty]  [empty]  [empty]
     [empty]  [empty]  [empty]   [empty]   [trap-5]  [empty]  [gate-3]  [empty]  [srv-8]  [empty]
     [wall]   [wall]   [empty]   [empty]   [empty]   [wall]   [empty]   [empty]  [empty]  [target]
   ================================================================ */

var PYTHON_13_CONFIG = {
    id: 'python-13',
    title: 'PYTHON-13 / DOUBLE TAP',
    subtitle: 'Recon first. Exploit second. Two passes through hostile territory.',
    category: 'python-ops',
    difficulty: 4,
    inputMode: 'python',
    agent: { tier: 3 },

    grid: {
        rows: 10, cols: 10,
        cells: [
            ['gateway',  'empty',  'empty',   'trap-1',  'srv-1',   'empty',  'empty',   'empty',  'srv-2',  'wall'],
            ['empty',    'empty',  'empty',   'empty',   'empty',   'empty',  'trap-2',  'empty',  'empty',  'empty'],
            ['empty',    'empty',  'router',  'empty',   'empty',   'empty',  'empty',   'empty',  'empty',  'wall'],
            ['wall',     'empty',  'empty',   'srv-3',   'empty',   'gate-1', 'empty',   'srv-4',  'empty',  'empty'],
            ['empty',    'trap-3', 'empty',   'empty',   'empty',   'empty',  'empty',   'empty',  'empty',  'wall'],
            ['empty',    'empty',  'srv-5',   'empty',   'switch',  'empty',  'empty',   'empty',  'srv-6',  'empty'],
            ['wall',     'empty',  'empty',   'empty',   'empty',   'gate-2', 'empty',   'trap-4', 'empty',  'wall'],
            ['empty',    'empty',  'empty',   'srv-7',   'empty',   'empty',  'empty',   'empty',  'empty',  'empty'],
            ['empty',    'empty',  'empty',   'empty',   'trap-5',  'empty',  'gate-3',  'empty',  'srv-8',  'empty'],
            ['wall',     'wall',   'empty',   'empty',   'empty',   'wall',   'empty',   'empty',  'empty',  'target']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway':  { label: 'GATEWAY',     abbr: 'GTW', ip: '10.160.0.1',   desc: 'Entry point',                            ports: ['22/SSH','443/HTTPS'],                     os: 'Cisco IOS 15.4' },
        'router':   { label: 'ROUTER',      abbr: 'RTR', ip: '10.160.0.2',   desc: 'Core router',                            ports: ['22/SSH','179/BGP'],                       os: 'Juniper JunOS 21.4' },
        'switch':   { label: 'SWITCH',      abbr: 'SWT', ip: '10.160.0.5',   desc: 'Distribution switch',                    ports: ['22/SSH','161/SNMP'],                      os: 'Cisco Catalyst 9300' },

        /* 4 vulnerable servers (have vuln field — exploitable) */
        'srv-1':    { label: 'SRV-PAYROLL',  abbr: 'PAY', ip: '10.160.1.11', desc: 'Payroll server',                         ports: ['22/SSH','445/SMB','3389/RDP'],            os: 'Windows Server 2022', vuln: 'CVE-2024-9301', vulnDesc: 'SMB null session' },
        'srv-3':    { label: 'SRV-GITLAB',   abbr: 'GIT', ip: '10.160.1.13', desc: 'GitLab repository',                      ports: ['22/SSH','80/HTTP','443/HTTPS'],            os: 'Ubuntu 24.04 LTS', vuln: 'CVE-2024-9303', vulnDesc: 'GitLab SSRF via webhook' },
        'srv-6':    { label: 'SRV-JENKINS',  abbr: 'JNK', ip: '10.160.1.16', desc: 'CI/CD pipeline server',                  ports: ['22/SSH','8080/JENKINS','50000/AGENT'],     os: 'Debian 12', vuln: 'CVE-2024-9306', vulnDesc: 'Jenkins Script Console unauthenticated' },
        'srv-8':    { label: 'SRV-VAULT',    abbr: 'VLT', ip: '10.160.1.18', desc: 'Secrets vault',                          ports: ['22/SSH','8200/VAULT','443/HTTPS'],         os: 'HashiCorp Vault 1.15', vuln: 'CVE-2024-9308', vulnDesc: 'Root token in default config' },

        /* 4 non-vulnerable servers (no vuln — not exploitable) */
        'srv-2':    { label: 'SRV-MARKETING',abbr: 'MKT', ip: '10.160.1.12', desc: 'Marketing server — no sensitive data',   ports: ['22/SSH','80/HTTP'],                        os: 'Ubuntu 24.04 LTS' },
        'srv-4':    { label: 'SRV-PRINT',    abbr: 'PRT', ip: '10.160.1.14', desc: 'Print server — no vulnerabilities',      ports: ['515/LPR','631/IPP'],                      os: 'HP JetDirect' },
        'srv-5':    { label: 'SRV-BACKUP',   abbr: 'BKP', ip: '10.160.1.15', desc: 'Backup server — encrypted archives',     ports: ['22/SSH','873/RSYNC'],                     os: 'Debian 12 Bookworm' },
        'srv-7':    { label: 'SRV-MONITOR',  abbr: 'MON', ip: '10.160.1.17', desc: 'Monitoring server — read-only access',   ports: ['22/SSH','3000/GRAFANA','9090/PROMETHEUS'], os: 'CentOS Stream 9' },

        /* 3 gates */
        'gate-1':   { label: 'FW-NORTH',    abbr: 'FN1', ip: '10.160.0.251', desc: 'North sector firewall',                  ports: ['22/SSH','443/MGMT'],                      os: 'pfSense 2.7.0', vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL' },
        'gate-2':   { label: 'FW-CENTER',   abbr: 'FC2', ip: '10.160.0.252', desc: 'Center sector firewall',                 ports: ['22/SSH','443/MGMT'],                      os: 'Palo Alto PAN-OS', vuln: 'CVE-2024-7744', vulnDesc: 'Management RCE' },
        'gate-3':   { label: 'FW-SOUTH',    abbr: 'FS3', ip: '10.160.0.253', desc: 'South sector firewall',                  ports: ['22/SSH','443/MGMT'],                      os: 'Fortinet FortiGate', vuln: 'CVE-2024-6221', vulnDesc: 'ISN bypass' },

        'target':   { label: 'EXTRACTION',  abbr: 'EXT', ip: '10.160.0.99',  desc: 'Data extraction staging point',           ports: ['22/SSH','8443/HTTPS'],                    os: 'RHEL 9.3' },

        /* 5 traps */
        'trap-1':   { label: 'TRAP-01',     abbr: 'T01', ip: '10.160.0.201', desc: 'IDS north',        ports: ['514/SYSLOG'],      os: 'Snort [TRAP]' },
        'trap-2':   { label: 'TRAP-02',     abbr: 'T02', ip: '10.160.0.202', desc: 'Honeypot NE',      ports: ['22/SSH-FAKE'],     os: 'Honeyd [TRAP]' },
        'trap-3':   { label: 'TRAP-03',     abbr: 'T03', ip: '10.160.0.203', desc: 'IDS west',         ports: ['514/SYSLOG'],      os: 'Suricata [TRAP]' },
        'trap-4':   { label: 'TRAP-04',     abbr: 'T04', ip: '10.160.0.204', desc: 'Honeypot SE',      ports: ['80/HTTP-TRAP'],    os: 'Honeyd [TRAP]' },
        'trap-5':   { label: 'TRAP-05',     abbr: 'T05', ip: '10.160.0.205', desc: 'IDS south',        ports: ['514/SYSLOG'],      os: 'Snort [TRAP]' }
    },

    traps: ['trap-1', 'trap-2', 'trap-3', 'trap-4', 'trap-5'],

    gates: {
        'gate-1': { requires: 'nmap',    flag: 'northCleared',   vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL' },
        'gate-2': { requires: 'exploit', flag: 'centerCleared',  vuln: 'CVE-2024-7744', vulnDesc: 'Management RCE' },
        'gate-3': { requires: 'spoof',   flag: 'southCleared',   vuln: 'CVE-2024-6221', vulnDesc: 'ISN bypass' }
    },

    objectives: [
        { id: 'obj_0', label: 'PASS 1 -- nmap all 8 servers',                          check: 'nmapTargets.has("srv-1") && nmapTargets.has("srv-2") && nmapTargets.has("srv-3") && nmapTargets.has("srv-4") && nmapTargets.has("srv-5") && nmapTargets.has("srv-6") && nmapTargets.has("srv-7") && nmapTargets.has("srv-8")' },
        { id: 'obj_1', label: 'PASS 2 -- Exploit SRV-PAYROLL (vulnerable)',             check: 'nodesDiscovered.has("srv-1")' },
        { id: 'obj_2', label: 'PASS 2 -- Exploit SRV-GITLAB (vulnerable)',              check: 'nodesDiscovered.has("srv-3")' },
        { id: 'obj_3', label: 'PASS 2 -- Exploit SRV-JENKINS (vulnerable)',             check: 'nodesDiscovered.has("srv-6")' },
        { id: 'obj_4', label: 'PASS 2 -- Exploit SRV-VAULT (vulnerable)',               check: 'nodesDiscovered.has("srv-8")' },
        { id: 'obj_5', label: 'GATES -- Bypass all 3 sector firewalls',                 check: 'northCleared && centerCleared && southCleared' },
        { id: 'obj_6', label: 'EXTRACTION -- Reach the staging point',                  check: 'nodesDiscovered.has("target")' },
        { id: 'obj_7', label: 'STEALTH -- 3+ integrity remaining',                     check: 'integrity >= 3' }
    ],

    integrity: 5,

    completion: {
        title: 'DOUBLE TAP',
        subtitle: 'Two passes. Eight servers cataloged. Four exploited. Data staged.',
        storageKey: 'hexworth_operator_python13'
    }
};
