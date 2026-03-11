/* ================================================================
   FORENSICS-02: Cloud Artifact -- Mission Config
   ================================================================
   Terminal-mode mission. Custom commands: examine, query, diff,
   download, analyze, report.
   ================================================================ */

var FORENSICS_02_CONFIG = {
    id: 'forensics-02',
    title: 'FORENSICS-02 / CLOUD ARTIFACT',
    subtitle: 'Incident documented. Breach contained.',
    category: 'forensics',
    difficulty: 3,
    inputMode: 'terminal',
    prompt: 'investigator@aws:~$',

    grid: {
        rows: 4,
        cols: 5,
        start: { col: 0, row: 0 },
        cells: [
            ['cloudtrail',    'iam-console',     'empty',          'wall',           'wall'],
            ['empty',         's3-bucket',       'empty',          'lambda-func',    'wall'],
            ['wall',          'empty',           'vpc-flowlogs',   'empty',          'guardduty'],
            ['wall',          'secrets-manager', 'empty',          'config-audit',   'empty']
        ]
    },

    nodes: {
        'cloudtrail':      { label: 'CLOUDTRAIL',   abbr: 'CTR', ip: 'us-east-1', desc: 'AWS CloudTrail -- API call audit log',                            ports: ['N/A'],          os: 'AWS Service' },
        'iam-console':     { label: 'IAM-CONSOLE',  abbr: 'IAM', ip: 'global',    desc: 'Identity and Access Management -- users, roles, policies',        ports: ['N/A'],          os: 'AWS Service' },
        's3-bucket':       { label: 'S3-BUCKET',    abbr: 'S3B', ip: 'us-east-1', desc: 'S3 storage -- hexworth-prod-data bucket',                         ports: ['443/HTTPS'],    os: 'AWS Service' },
        'lambda-func':     { label: 'LAMBDA',       abbr: 'LMB', ip: 'us-east-1', desc: 'Lambda functions -- serverless compute',                          ports: ['N/A'],          os: 'AWS Service' },
        'vpc-flowlogs':    { label: 'VPC-FLOWLOGS', abbr: 'VPC', ip: 'us-east-1', desc: 'VPC Flow Logs -- network traffic records',                        ports: ['N/A'],          os: 'AWS Service' },
        'guardduty':       { label: 'GUARDDUTY',    abbr: 'GDD', ip: 'us-east-1', desc: 'GuardDuty -- threat detection findings',                          ports: ['N/A'],          os: 'AWS Service' },
        'secrets-manager': { label: 'SECRETS-MGR',  abbr: 'SEC', ip: 'us-east-1', desc: 'Secrets Manager -- API keys and credentials',                    ports: ['N/A'],          os: 'AWS Service' },
        'config-audit':    { label: 'CONFIG-AUDIT', abbr: 'CFG', ip: 'us-east-1', desc: 'AWS Config -- resource configuration timeline',                   ports: ['N/A'],          os: 'AWS Service' }
    },

    traps: [],
    gates: {},

    objectives: [
        { id: 'key-found',     label: 'Find compromised key',   check: 'compromisedKeyFound' },
        { id: 'iam-traced',    label: 'Trace IAM escalation',   check: 'iamEscalationTraced' },
        { id: 'exfil-data',    label: 'Determine exfil data',   check: 'exfilDataDetermined' },
        { id: 'report-built',  label: 'Build incident report',  check: 'reportBuilt' }
    ],

    integrity: 3,

    completion: {
        title: 'CLOUD ARTIFACT',
        subtitle: 'Incident documented. Breach contained.',
        storageKey: 'hexworth_operator_forensics02'
    },

    briefing: [
        { text: '\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557', type: 'heading' },
        { text: '\u2551  MISSION: FORENSICS-02 \u2014 CLOUD ARTIFACT    \u2551', type: 'heading' },
        { text: '\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563', type: 'heading' },
        { text: '\u2551  Cloud environment breach detected.         \u2551', type: 'heading' },
        { text: '\u2551  Stolen API keys. IAM escalation.          \u2551', type: 'heading' },
        { text: '\u2551  S3 exfiltration. Lambda backdoor.         \u2551', type: 'heading' },
        { text: '\u2551  Investigate. Build the incident report.   \u2551', type: 'heading' },
        { text: '\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D', type: 'heading' },
        { text: '', type: 'system' },
        { text: '[SYS] Investigator online at CLOUDTRAIL (us-east-1)', type: 'success' },
        { text: '[SYS] Type "help" for command reference', type: 'info' },
        { text: '[SYS] Type "examine" to inspect current service', type: 'info' },
        { text: '', type: 'system' }
    ]
};
