/* ================================================================
   PYTHON-02 / ADAPTIVE RECON -- Mission Config
   ================================================================
   Tier 3 mission. 7x7 grid.
   Forces if/elif chains — multiple gate types on the same grid.

   PUZZLE DESIGN:
   - 3 gates blocking the path: nmap gate, exploit gate, spoof gate
   - Student must scan/nmap each gate node to identify the vulnerability
   - Different gates require different actions — can't use the same
     command on all of them
   - nmap() returns {vuln} info that tells the student what action to use
   - The puzzle: read the scan data, choose the right tool for each gate

   PYTHON SKILL: if/elif/else chains based on nmap return values
     result = agent.nmap('target')
     if 'ACL' in result['vuln']:
         agent.nmap('target')   # nmap gates auto-clear
     elif 'injection' in result['vuln']:
         agent.exploit('target')
     elif 'spoofable' in result['vuln']:
         agent.spoof('target')

   GRID (7x7):
     [start]   [empty]    [empty]    [router]    [empty]   [empty]  [wall]
     [empty]   [switch]   [empty]    [empty]     [waf]     [empty]  [empty]
     [wall]    [empty]    [empty]    [honeypot]  [empty]   [empty]  [wall]
     [empty]   [empty]    [ids]      [empty]     [empty]   [c2]     [empty]
     [empty]   [server1]  [empty]    [empty]     [empty]   [empty]  [wall]
     [wall]    [empty]    [empty]    [server2]   [empty]   [empty]  [target]
     [wall]    [wall]     [wall]     [empty]     [wall]    [wall]   [wall]
   ================================================================ */

var PYTHON_02_CONFIG = {
    id: 'python-02',
    title: 'PYTHON-02 / ADAPTIVE RECON',
    subtitle: 'Three gates. Three vulnerabilities. Adapt or fail.',
    category: 'python-ops',
    difficulty: 3,
    inputMode: 'python',
    agent: { tier: 3 },

    grid: {
        rows: 7, cols: 7,
        cells: [
            ['gateway',  'empty',   'empty',    'router',    'empty',     'empty',  'wall'],
            ['empty',    'switch',  'empty',    'empty',     'waf',       'empty',  'empty'],
            ['wall',     'empty',   'empty',    'honeypot',  'empty',     'empty',  'wall'],
            ['empty',    'empty',   'ids-gate', 'empty',     'empty',     'c2-beacon','empty'],
            ['empty',    'server-a','empty',    'empty',     'empty',     'empty',  'wall'],
            ['wall',     'empty',   'empty',    'server-b',  'empty',     'empty',  'target'],
            ['wall',     'wall',    'wall',     'empty',     'wall',      'wall',   'wall']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'gateway':   { label: 'GATEWAY',     abbr: 'GTW', ip: '10.40.0.1',   desc: 'Edge gateway',                                  ports: ['22/SSH','443/HTTPS'],                       os: 'Cisco IOS 15.4' },
        'router':    { label: 'ROUTER',      abbr: 'RTR', ip: '10.40.0.2',   desc: 'Core router',                                   ports: ['22/SSH','179/BGP'],                         os: 'Juniper JunOS 21.4' },
        'switch':    { label: 'SWITCH',      abbr: 'SWT', ip: '10.40.0.5',   desc: 'Distribution switch',                            ports: ['22/SSH','161/SNMP'],                        os: 'Cisco Catalyst 3650' },
        'server-a':  { label: 'SERVER-ALPHA',abbr: 'SRA', ip: '10.40.0.11',  desc: 'Application server',                             ports: ['22/SSH','8080/HTTP','8443/HTTPS'],          os: 'Ubuntu 24.04 LTS' },
        'server-b':  { label: 'SERVER-BRAVO',abbr: 'SRB', ip: '10.40.0.12',  desc: 'Database server',                                ports: ['22/SSH','3306/MySQL','5432/PostgreSQL'],    os: 'RHEL 9.3' },
        'target':    { label: 'TARGET',      abbr: 'TGT', ip: '10.40.0.99',  desc: 'Operations server — final objective',             ports: ['22/SSH','8443/HTTPS','9090/ADMIN'],         os: 'RHEL 9.3' },

        /* Gate 1: WAF — requires nmap (ACL misconfiguration) */
        'waf':       { label: 'WAF',         abbr: 'WAF', ip: '10.40.0.254', desc: 'Web application firewall blocking east corridor', ports: ['443/HTTPS','8443/MGMT'],                   os: 'AWS WAF v2', vuln: 'CVE-2024-2891', vulnDesc: 'ACL bypass via malformed headers' },

        /* Gate 2: IDS — requires exploit (signature evasion) */
        'ids-gate':  { label: 'IDS-ACTIVE',  abbr: 'IDS', ip: '10.40.0.250', desc: 'Active IDS blocking south corridor',             ports: ['514/SYSLOG','443/MGMT'],                   os: 'Suricata 7.0', vuln: 'CVE-2024-5512', vulnDesc: 'Signature injection allows rule bypass' },

        /* Gate 3: C2 beacon — requires spoof (ISN randomization bypass) */
        'c2-beacon': { label: 'C2-BEACON',   abbr: 'C2B', ip: '10.40.0.245', desc: 'Command-and-control beacon blocking east path',   ports: ['443/HTTPS-C2','8080/BEACON'],              os: 'Cobalt Strike 4.9', vuln: 'CVE-2024-6221', vulnDesc: 'TCP ISN randomization bypass allows spoofing' },

        /* Trap */
        'honeypot':  { label: 'HONEYPOT',    abbr: 'HNY', ip: '10.40.0.200', desc: 'Decoy server',                                   ports: ['22/SSH-FAKE','80/HTTP-TRAP'],              os: 'Honeyd 1.6 [TRAP]' }
    },

    traps: ['honeypot'],

    gates: {
        'waf':       { requires: 'nmap',    flag: 'wafBypassed',     vuln: 'CVE-2024-2891', vulnDesc: 'ACL bypass via malformed headers' },
        'ids-gate':  { requires: 'exploit', flag: 'idsBypassed',     vuln: 'CVE-2024-5512', vulnDesc: 'Signature injection allows rule bypass' },
        'c2-beacon': { requires: 'spoof',   flag: 'c2Neutralized',   vuln: 'CVE-2024-6221', vulnDesc: 'TCP ISN randomization bypass allows spoofing' }
    },

    objectives: [
        { id: 'obj_0', label: 'RECON -- Discover 6+ nodes',                       check: 'nodesDiscovered.size >= 6' },
        { id: 'obj_1', label: 'GATE 1 -- Bypass the WAF (nmap)',                  check: 'wafBypassed' },
        { id: 'obj_2', label: 'GATE 2 -- Bypass the IDS (exploit)',                check: 'idsBypassed' },
        { id: 'obj_3', label: 'GATE 3 -- Neutralize the C2 beacon (spoof)',        check: 'c2Neutralized' },
        { id: 'obj_4', label: 'INTEL -- nmap both servers',                        check: 'nmapTargets.has("server-a") && nmapTargets.has("server-b")' },
        { id: 'obj_5', label: 'OBJECTIVE -- Reach the target',                     check: 'nodesDiscovered.has("target")' }
    ],

    integrity: 3,

    completion: {
        title: 'ADAPTIVE RECON',
        subtitle: 'Three gates. Three tools. All bypassed.',
        storageKey: 'hexworth_operator_python02'
    }
};
