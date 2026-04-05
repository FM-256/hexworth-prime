/* ================================================================
   PYTHON-02 / PACKET RAT -- Mission Config
   ================================================================
   Cloud infrastructure breach: WAF bypass, ransomware decrypt,
   honeypot spoof. 5 objectives, 2 traps (cdn, lambda), 3 gates.
   ================================================================ */

var PYTHON_02_CONFIG = {
    id: 'python-02',
    title: 'PYTHON-02 / PACKET RAT',
    subtitle: 'Cloud infrastructure breach and data staging',
    category: 'python-ops',
    difficulty: 2,
    inputMode: 'python',

    grid: {
        rows: 4, cols: 5,
        cells: [
            ['load-balancer', 'empty',       'cdn',          'waf',           'wall'],
            ['empty',         'api-gateway', 'ransomware',   'container-reg', 'staging'],
            ['wall',          'lambda',      'empty',        'honeypot',      'wall'],
            ['wall',          'wall',        'rds',          'wall',          'wall']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'load-balancer': { label: 'LOAD-BALANCER', abbr: 'ALB', ip: '172.16.0.10',  desc: 'Application load balancer',       ports: ['80/HTTP','443/HTTPS'],                  os: 'AWS ELB v2' },
        'cdn':           { label: 'CDN',           abbr: 'CDN', ip: '172.16.0.20',  desc: 'Content delivery edge node',      ports: ['80/HTTP','443/HTTPS'],                  os: 'CloudFront Edge' },
        'waf':           { label: 'WAF',           abbr: 'WAF', ip: '172.16.0.254', desc: 'Web application firewall',         ports: ['443/HTTPS','8443/MGMT'],                os: 'AWS WAF v2', vuln: 'CVE-2024-2891', vulnDesc: 'WAF rule bypass via malformed headers' },
        'api-gateway':   { label: 'API-GATEWAY',   abbr: 'API', ip: '172.16.0.30',  desc: 'API management gateway',          ports: ['443/HTTPS','8080/REST'],                os: 'Kong Gateway 3.4' },
        'container-reg': { label: 'CONTAINER-REG', abbr: 'CRG', ip: '172.16.0.40',  desc: 'Container image registry',        ports: ['443/HTTPS','5000/REGISTRY'],            os: 'Harbor 2.9' },
        'staging':       { label: 'STAGING',       abbr: 'STG', ip: '172.16.0.99',  desc: 'Exfiltration staging server',      ports: ['22/SSH','8443/HTTPS','9200/ELASTIC'],   os: 'Ubuntu 24.04 LTS' },
        'lambda':        { label: 'LAMBDA',        abbr: 'LMB', ip: '172.16.0.50',  desc: 'Serverless function runtime',      ports: ['443/HTTPS'],                            os: 'AWS Lambda Runtime' },
        'rds':           { label: 'RDS',           abbr: 'RDS', ip: '172.16.0.60',  desc: 'Managed database service',         ports: ['3306/MySQL','5432/PostgreSQL'],          os: 'Aurora MySQL 8.0' },
        'ransomware':    { label: 'RANSOMWARE',    abbr: 'RNS', ip: '172.16.0.35',  desc: 'Ransomware-encrypted server',      ports: ['445/SMB-LOCKED','3389/RDP-LOCKED'],     os: 'Windows Server 2019 [ENCRYPTED]', vuln: 'CVE-2024-9136', vulnDesc: 'WannaCry variant AES-256 weak IV key recovery' },
        'honeypot':      { label: 'HONEYPOT',      abbr: 'HNY', ip: '172.16.0.55',  desc: 'Network honeypot trap',            ports: ['22/SSH-FAKE','80/HTTP-TRAP'],           os: 'Honeyd 1.6 [TRAP]', vuln: 'CVE-2024-6221', vulnDesc: 'Honeyd TCP ISN randomization bypass' }
    },

    traps: ['cdn', 'lambda'],

    gates: {
        'waf':        { requires: 'nmap',    flag: 'firewallBypassed',  vuln: 'CVE-2024-2891', vulnDesc: 'WAF rule bypass via malformed headers' },
        'ransomware': { requires: 'decrypt', flag: 'ransomwareCleared', vuln: 'CVE-2024-9136', vulnDesc: 'WannaCry variant AES-256 weak IV key recovery' },
        'honeypot':   { requires: 'spoof',   flag: 'honeypotSpoofed',  vuln: 'CVE-2024-6221', vulnDesc: 'Honeyd TCP ISN randomization bypass' }
    },

    objectives: [
        { id: 'obj_0', label: 'NODES DISCOVERED -- 4 cloud nodes mapped',         check: 'nodesDiscovered.size >= 4' },
        { id: 'obj_1', label: 'DATA STORE SCANNED -- nmap scan complete',          check: 'nmapTargets.has("rds") || nmapTargets.has("container-reg")' },
        { id: 'obj_2', label: 'WAF BYPASSED -- access granted',                    check: 'firewallBypassed' },
        { id: 'obj_3', label: 'STAGING REACHED -- mission objective complete',     check: 'nodesDiscovered.has("staging")' },
        { id: 'obj_4', label: 'RANSOMWARE DECRYPTED -- node recovered',            check: 'ransomwareCleared' }
    ],

    integrity: 3,

    completion: {
        title: 'PACKET RAT',
        subtitle: 'Cloud breached. Data staged.',
        storageKey: 'hexworth_operator_python02'
    }
};
