/* ================================================================
   LOG-ANALYSIS-02: APT Tracker — Config
   ================================================================
   Advanced SOC mission. Track a nation-state APT (APT-PHANTOM)
   across 8 SIEM data sources. Commands: examine, correlate, query,
   enrich, timeline. Must find initial access, map lateral movement,
   detect exfiltration, and build full kill chain.
   ================================================================ */

var LOG_ANALYSIS_02_CONFIG = {
    id: 'log-analysis-02',
    title: 'LOG-02 / APT TRACKER',
    subtitle: 'Track APT-PHANTOM across SIEM telemetry.',
    category: 'log-analysis',
    difficulty: 3,
    inputMode: 'terminal',
    prompt: 'analyst@siem:~$',

    grid: {
        rows: 4,
        cols: 5,
        start: { col: 0, row: 0 },
        cells: [
            ['proxy-logs',   'auth-logs',     'dns-logs',      'wall',          'wall'],
            ['empty',        'endpoint-logs', 'empty',         'netflow-data',  'wall'],
            ['wall',         'empty',         'dlp-alerts',    'empty',         'email-logs'],
            ['wall',         'threat-intel',  'empty',         'empty',         'empty']
        ]
    },

    nodes: {
        'proxy-logs':     { label: 'PROXY LOGS',    abbr: 'PRX', ip: 'siem-01', os: 'Squid Proxy 5.7',        ports: [], desc: 'Web proxy logs -- HTTP/HTTPS traffic records' },
        'auth-logs':      { label: 'AUTH LOGS',     abbr: 'ATH', ip: 'siem-01', os: 'Splunk Forwarder',       ports: [], desc: 'Authentication logs -- AD, RADIUS, SSO events' },
        'dns-logs':       { label: 'DNS LOGS',      abbr: 'DNS', ip: 'siem-01', os: 'Bind 9.18',              ports: [], desc: 'DNS query/response logs -- resolution records' },
        'endpoint-logs':  { label: 'ENDPOINT LOGS', abbr: 'EPT', ip: 'siem-01', os: 'CrowdStrike Agent',      ports: [], desc: 'EDR telemetry -- process execution, file changes' },
        'netflow-data':   { label: 'NETFLOW',       abbr: 'NFD', ip: 'siem-01', os: 'NetFlow v9 Collector',   ports: [], desc: 'Network flow data -- connection metadata' },
        'dlp-alerts':     { label: 'DLP ALERTS',    abbr: 'DLP', ip: 'siem-01', os: 'Symantec DLP',           ports: [], desc: 'Data Loss Prevention alerts -- exfiltration attempts' },
        'email-logs':     { label: 'EMAIL LOGS',    abbr: 'EML', ip: 'siem-01', os: 'Exchange Online',        ports: [], desc: 'Email gateway logs -- inbound/outbound messages' },
        'threat-intel':   { label: 'THREAT INTEL',  abbr: 'TIP', ip: 'siem-01', os: 'MISP 2.4',              ports: [], desc: 'Threat intelligence platform -- IOC database' }
    },

    /* Source name aliases for correlate/query fuzzy matching */
    sourceAliases: {
        'proxy': 'proxy-logs', 'proxy-logs': 'proxy-logs', 'prx': 'proxy-logs',
        'auth': 'auth-logs', 'auth-logs': 'auth-logs', 'ath': 'auth-logs',
        'dns': 'dns-logs', 'dns-logs': 'dns-logs',
        'endpoint': 'endpoint-logs', 'endpoint-logs': 'endpoint-logs', 'ept': 'endpoint-logs',
        'netflow': 'netflow-data', 'netflow-data': 'netflow-data', 'nfd': 'netflow-data', 'flow': 'netflow-data',
        'dlp': 'dlp-alerts', 'dlp-alerts': 'dlp-alerts',
        'email': 'email-logs', 'email-logs': 'email-logs', 'eml': 'email-logs',
        'threat': 'threat-intel', 'threat-intel': 'threat-intel', 'tip': 'threat-intel', 'intel': 'threat-intel'
    },

    /* Lateral movement source keys (for objective tracking) */
    lateralSources: ['auth-logs', 'endpoint-logs', 'netflow-data'],

    /* Exfil correlation sources */
    exfilSources: ['dlp-alerts', 'netflow-data'],

    traps: [],
    gates: {},

    objectives: [
        { id: 'access',   label: 'INITIAL ACCESS FOUND -- phishing vector identified',                      check: 'initialAccessFound' },
        { id: 'lateral',  label: 'LATERAL MOVEMENT MAPPED -- adversary path through network traced',        check: 'lateralMovementMapped' },
        { id: 'exfil',    label: 'EXFIL CHANNEL DETECTED -- data theft method confirmed',                   check: 'exfilChannelDetected' },
        { id: 'killchain', label: 'KILL CHAIN BUILT -- complete APT timeline reconstructed',                 check: 'killChainBuilt' }
    ],

    integrity: 3,

    completion: {
        title: 'APT TRACKER',
        subtitle: 'Kill chain reconstructed. APT-PHANTOM mapped.',
        storageKey: 'hexworth_operator_loganalysis02'
    }
};
