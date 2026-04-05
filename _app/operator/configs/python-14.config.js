/* ================================================================
   PYTHON-14 / SUPPLY CHAIN -- Mission Config
   ================================================================
   Tier 6 mission. 10x10 grid.
   Forces tracing a compromise through interconnected systems.
   Student must follow the attack chain: vendor → build → deploy → prod.

   PUZZLE DESIGN:
   - 4-system supply chain: vendor-repo → build-server → staging → production
   - Each system in the chain is behind a different gate type
   - Student must breach them IN ORDER — each gate requires nmapping
     the previous system to discover the vulnerability for the next
   - Surrounding infrastructure (DNS, monitoring, logging) provides
     clues but are not directly part of the chain
   - Forces: ordered execution, reading nmap output carefully,
     understanding that each breach reveals info for the next step

   This level teaches the concept of supply chain attacks — a critical
   cybersecurity topic where one compromised vendor cascades through
   the entire delivery pipeline.

   GRID (10x10):
   ================================================================ */

var PYTHON_14_CONFIG = {
    id: 'python-14',
    title: 'PYTHON-14 / SUPPLY CHAIN',
    subtitle: 'Trace the compromise. Vendor to production. Four links.',
    category: 'python-ops',
    difficulty: 4,
    inputMode: 'python',
    agent: { tier: 3 },

    grid: {
        rows: 10, cols: 10,
        cells: [
            ['gateway',    'empty',   'empty',    'vendor-repo','empty',     'empty',    'wall',     'empty',    'empty',   'wall'],
            ['empty',      'trap-1',  'empty',    'empty',     'empty',     'empty',    'empty',    'dns-srv',  'empty',   'empty'],
            ['empty',      'empty',   'switch-1', 'empty',     'gate-vendor','empty',   'empty',    'empty',    'empty',   'wall'],
            ['wall',       'empty',   'empty',    'build-srv', 'empty',     'empty',    'trap-2',   'empty',    'empty',   'empty'],
            ['empty',      'empty',   'empty',    'empty',     'empty',     'gate-build','empty',   'empty',    'monitor', 'wall'],
            ['empty',      'trap-3',  'empty',    'empty',     'staging',   'empty',    'empty',    'empty',    'empty',   'empty'],
            ['wall',       'empty',   'empty',    'empty',     'empty',     'empty',    'gate-stage','empty',   'trap-4',  'wall'],
            ['empty',      'empty',   'log-srv',  'empty',     'empty',     'production','empty',   'empty',    'empty',   'empty'],
            ['empty',      'empty',   'empty',    'empty',     'trap-5',    'empty',    'empty',    'empty',    'empty',   'empty'],
            ['wall',       'wall',    'empty',    'empty',     'empty',     'wall',     'empty',    'empty',    'empty',   'target']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway':     { label: 'GATEWAY',      abbr: 'GTW', ip: '10.170.0.1',   desc: 'Network entry point',                           ports: ['22/SSH','443/HTTPS'],                     os: 'Cisco IOS 15.4' },
        'switch-1':    { label: 'SWITCH',       abbr: 'SWT', ip: '10.170.0.5',   desc: 'Core switch',                                   ports: ['22/SSH','161/SNMP'],                      os: 'Cisco Catalyst 9300' },

        /* Supply chain — 4 systems in order */
        'vendor-repo': { label: 'VENDOR-REPO',  abbr: 'VND', ip: '10.170.1.10',  desc: 'Third-party vendor code repository',             ports: ['22/SSH','443/HTTPS','9418/GIT'],          os: 'GitLab CE 16.8' },
        'build-srv':   { label: 'BUILD-SERVER', abbr: 'BLD', ip: '10.170.2.10',  desc: 'CI/CD build server — compiles vendor code',      ports: ['22/SSH','8080/JENKINS','50000/AGENT'],    os: 'Jenkins 2.440', vuln: 'CVE-2024-9401', vulnDesc: 'Unsigned artifact injection via compromised dependency' },
        'staging':     { label: 'STAGING',      abbr: 'STG', ip: '10.170.3.10',  desc: 'Pre-production staging environment',             ports: ['22/SSH','80/HTTP','443/HTTPS'],            os: 'Ubuntu 24.04 LTS', vuln: 'CVE-2024-9402', vulnDesc: 'Backdoored container image from build pipeline' },
        'production':  { label: 'PRODUCTION',   abbr: 'PRD', ip: '10.170.4.10',  desc: 'Live production server — end of chain',          ports: ['22/SSH','80/HTTP','443/HTTPS','8443/API'],os: 'RHEL 9.3', vuln: 'CVE-2024-9403', vulnDesc: 'Compromised deployment via poisoned staging artifact' },

        /* Supply chain gates — each requires a different action */
        'gate-vendor': { label: 'FW-VENDOR',    abbr: 'FWV', ip: '10.170.0.251', desc: 'Vendor zone firewall',                            ports: ['22/SSH','443/MGMT'],                      os: 'pfSense 2.7.0', vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL allows bypass' },
        'gate-build':  { label: 'FW-BUILD',     abbr: 'FWB', ip: '10.170.0.252', desc: 'Build zone firewall',                             ports: ['22/SSH','443/MGMT'],                      os: 'Palo Alto PAN-OS', vuln: 'CVE-2024-7744', vulnDesc: 'Management plane RCE' },
        'gate-stage':  { label: 'FW-STAGING',   abbr: 'FWS', ip: '10.170.0.253', desc: 'Staging zone firewall',                           ports: ['22/SSH','443/MGMT'],                      os: 'Fortinet FortiGate', vuln: 'CVE-2024-6221', vulnDesc: 'TCP ISN randomization bypass' },

        /* Supporting infrastructure — not in the chain but provide context */
        'dns-srv':     { label: 'DNS-SERVER',   abbr: 'DNS', ip: '10.170.0.53',  desc: 'Internal DNS — resolves build pipeline domains',  ports: ['22/SSH','53/DNS','953/RNDC'],             os: 'BIND 9.18' },
        'monitor':     { label: 'MONITORING',   abbr: 'MON', ip: '10.170.0.60',  desc: 'Grafana + Prometheus stack',                      ports: ['22/SSH','3000/GRAFANA','9090/PROMETHEUS'],os: 'CentOS Stream 9' },
        'log-srv':     { label: 'LOG-SERVER',   abbr: 'LOG', ip: '10.170.0.70',  desc: 'Centralized logging (ELK stack)',                 ports: ['22/SSH','9200/ELASTIC','5601/KIBANA'],    os: 'Ubuntu 24.04 LTS' },

        'target':      { label: 'EXTRACTION',   abbr: 'EXT', ip: '10.170.0.99',  desc: 'Extraction point — evidence collected',            ports: ['22/SSH','8443/HTTPS'],                    os: 'RHEL 9.3' },

        /* 5 traps */
        'trap-1':      { label: 'TRAP-01',      abbr: 'T01', ip: '10.170.0.201', desc: 'IDS near vendor zone',     ports: ['514/SYSLOG'],   os: 'Snort [TRAP]' },
        'trap-2':      { label: 'TRAP-02',      abbr: 'T02', ip: '10.170.0.202', desc: 'Honeypot near build',      ports: ['22/SSH-FAKE'],  os: 'Honeyd [TRAP]' },
        'trap-3':      { label: 'TRAP-03',      abbr: 'T03', ip: '10.170.0.203', desc: 'IDS near staging',         ports: ['514/SYSLOG'],   os: 'Suricata [TRAP]' },
        'trap-4':      { label: 'TRAP-04',      abbr: 'T04', ip: '10.170.0.204', desc: 'Honeypot near extraction', ports: ['80/HTTP-TRAP'], os: 'Honeyd [TRAP]' },
        'trap-5':      { label: 'TRAP-05',      abbr: 'T05', ip: '10.170.0.205', desc: 'IDS south corridor',       ports: ['514/SYSLOG'],   os: 'Snort [TRAP]' }
    },

    traps: ['trap-1', 'trap-2', 'trap-3', 'trap-4', 'trap-5'],

    gates: {
        'gate-vendor': { requires: 'nmap',    flag: 'vendorZoneCleared',  vuln: 'CVE-2024-3891', vulnDesc: 'Weak ACL' },
        'gate-build':  { requires: 'exploit', flag: 'buildZoneCleared',   vuln: 'CVE-2024-7744', vulnDesc: 'Management RCE' },
        'gate-stage':  { requires: 'spoof',   flag: 'stagingZoneCleared', vuln: 'CVE-2024-6221', vulnDesc: 'ISN bypass' }
    },

    objectives: [
        { id: 'obj_0', label: 'LINK 1 -- nmap the vendor repository',                    check: 'nmapTargets.has("vendor-repo")' },
        { id: 'obj_1', label: 'LINK 2 -- Bypass vendor firewall + nmap build server',    check: 'vendorZoneCleared && nmapTargets.has("build-srv")' },
        { id: 'obj_2', label: 'LINK 3 -- Bypass build firewall + nmap staging',          check: 'buildZoneCleared && nmapTargets.has("staging")' },
        { id: 'obj_3', label: 'LINK 4 -- Bypass staging firewall + nmap production',     check: 'stagingZoneCleared && nmapTargets.has("production")' },
        { id: 'obj_4', label: 'SUPPORT -- nmap DNS, monitoring, and log servers',        check: 'nmapTargets.has("dns-srv") && nmapTargets.has("monitor") && nmapTargets.has("log-srv")' },
        { id: 'obj_5', label: 'FULL CHAIN -- All 4 supply chain systems cataloged',     check: 'nmapTargets.has("vendor-repo") && nmapTargets.has("build-srv") && nmapTargets.has("staging") && nmapTargets.has("production")' },
        { id: 'obj_6', label: 'EXTRACTION -- Reach the evidence staging point',          check: 'nodesDiscovered.has("target")' },
        { id: 'obj_7', label: 'STEALTH -- 3+ integrity remaining',                      check: 'integrity >= 3' }
    ],

    integrity: 5,

    completion: {
        title: 'SUPPLY CHAIN',
        subtitle: 'Four links traced. Compromise mapped. Evidence extracted.',
        storageKey: 'hexworth_operator_python14'
    }
};
