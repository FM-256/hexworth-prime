/* ================================================================
   PYTHON-04 / GHOST PROTOCOL -- Mission Config
   ================================================================
   Corporate AD breach: EDR bypass, C2 beacon exploit, honeypot
   spoof. 5 objectives, 3 traps, 3 gates.
   ================================================================ */

var PYTHON_04_CONFIG = {
    id: 'python-04',
    title: 'PYTHON-04 / GHOST PROTOCOL',
    subtitle: 'Corporate network lateral movement and domain takeover',
    category: 'python-ops',
    difficulty: 4,
    inputMode: 'python',

    grid: {
        rows: 4, cols: 5,
        cells: [
            ['beachhead', 'empty',      'mail-server', 'wall',        'wall'],
            ['empty',     'jump-box',   'c2-beacon',   'edr',         'dc'],
            ['wall',      'honeypot',   'file-server', 'empty',       'wall'],
            ['wall',      'printer',    'wall',        'workstation', 'wall']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'beachhead':    { label: 'BEACHHEAD',     abbr: 'BHD', ip: '10.10.1.5',   desc: 'Initial access point in DMZ',          ports: ['22/SSH','80/HTTP','443/HTTPS'],               os: 'Debian 12 Bookworm' },
        'mail-server':  { label: 'MAIL-SERVER',   abbr: 'MLS', ip: '10.10.1.20',  desc: 'Corporate mail exchange',              ports: ['25/SMTP','143/IMAP','993/IMAPS'],            os: 'Exchange 2019 CU14' },
        'jump-box':     { label: 'JUMP-BOX',      abbr: 'JMP', ip: '10.10.1.30',  desc: 'Administrative jump host',             ports: ['22/SSH','3389/RDP'],                         os: 'Windows Server 2022' },
        'edr':          { label: 'EDR',           abbr: 'EDR', ip: '10.10.1.254', desc: 'Endpoint detection and response',       ports: ['443/HTTPS','8443/MGMT'],                     os: 'CrowdStrike Falcon 7.x', vuln: 'CVE-2024-7733', vulnDesc: 'EDR kernel driver bypass via signed driver vulnerability' },
        'dc':           { label: 'DOMAIN-CTRL',   abbr: 'DC',  ip: '10.10.1.99',  desc: 'Active Directory domain controller',   ports: ['53/DNS','88/KERBEROS','389/LDAP','445/SMB'], os: 'Windows Server 2022 AD' },
        'file-server':  { label: 'FILE-SERVER',   abbr: 'FSV', ip: '10.10.1.40',  desc: 'Network file share server',            ports: ['22/SSH','445/SMB','2049/NFS'],               os: 'Windows Server 2019' },
        'printer':      { label: 'PRINTER',       abbr: 'PRT', ip: '10.10.1.50',  desc: 'Network multifunction printer',        ports: ['80/HTTP','515/LPR','631/IPP','9100/RAW'],    os: 'HP LaserJet MFP M528' },
        'workstation':  { label: 'WORKSTATION',   abbr: 'WKS', ip: '10.10.1.60',  desc: 'Corporate user workstation',           ports: ['135/RPC','445/SMB','3389/RDP'],              os: 'Windows 11 Enterprise' },
        'c2-beacon':    { label: 'C2-BEACON',     abbr: 'C2B', ip: '10.10.1.35',  desc: 'Command and control beacon',           ports: ['443/HTTPS-C2','8080/BEACON'],                os: 'Cobalt Strike 4.9 Listener', vuln: 'CVE-2024-5891', vulnDesc: 'Cobalt Strike 4.9 listener null-byte injection' },
        'honeypot':     { label: 'HONEYPOT',      abbr: 'HNY', ip: '10.10.1.45',  desc: 'Network honeypot trap',                ports: ['22/SSH-FAKE','445/SMB-TRAP'],                os: 'Honeyd 1.6 [TRAP]', vuln: 'CVE-2024-6221', vulnDesc: 'Honeyd TCP ISN randomization bypass' }
    },

    traps: ['mail-server', 'file-server', 'workstation'],

    gates: {
        'edr':        { requires: 'nmap',    flag: 'firewallBypassed',  vuln: 'CVE-2024-7733', vulnDesc: 'EDR kernel driver bypass via signed driver vulnerability' },
        'c2-beacon':  { requires: 'exploit', flag: 'c2BeaconSilenced',  vuln: 'CVE-2024-5891', vulnDesc: 'Cobalt Strike 4.9 listener null-byte injection' },
        'honeypot':   { requires: 'spoof',   flag: 'honeypotSpoofed',   vuln: 'CVE-2024-6221', vulnDesc: 'Honeyd TCP ISN randomization bypass' }
    },

    objectives: [
        { id: 'obj_0', label: 'NODES DISCOVERED -- 4 network nodes mapped',             check: 'nodesDiscovered.size >= 4' },
        { id: 'obj_1', label: 'SERVER SCANNED -- nmap scan complete',                    check: 'nmapTargets.has("mail-server") || nmapTargets.has("file-server")' },
        { id: 'obj_2', label: 'EDR BYPASSED -- access granted',                          check: 'firewallBypassed' },
        { id: 'obj_3', label: 'DOMAIN CONTROLLER REACHED -- mission objective complete', check: 'nodesDiscovered.has("dc")' },
        { id: 'obj_4', label: 'C2 BEACON SILENCED -- listener destroyed',                check: 'c2BeaconSilenced' }
    ],

    integrity: 3,

    completion: {
        title: 'GHOST PROTOCOL',
        subtitle: 'Domain compromised. Ghost in the machine.',
        storageKey: 'hexworth_operator_python04'
    }
};
