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
    missionTitle: 'LOG-02',
    title: 'APT Tracker',
    subtitle: 'Track APT-PHANTOM across SIEM telemetry.',
    category: 'log-analysis',
    difficulty: 3,
    inputMode: 'terminal',
    promptText: 'analyst@siem:~$ ',
    promptLabel: 'OPERATOR TERMINAL',

    briefing: [
        'APT-PHANTOM has been detected inside the network.',
        'Examine 8 SIEM data sources, correlate findings,',
        'map the kill chain from initial access to exfiltration.'
    ],

    customState: {
        examinedSources: [],
        lateralNodes: [],
        correlations: [],
        initialAccessFound: false,
        lateralMovementMapped: false,
        exfilChannelDetected: false,
        killChainBuilt: false
    },

    statusFields: [
        { key: 'initialAccessFound',    label: 'Initial Access',  trueText: 'FOUND', falseText: 'PENDING' },
        { key: 'lateralMovementMapped', label: 'Lateral Movement', trueText: 'MAPPED', falseText: 'PENDING' },
        { key: 'exfilChannelDetected',  label: 'Exfil Channel',   trueText: 'DETECTED', falseText: 'PENDING' },
        { key: 'killChainBuilt',        label: 'Kill Chain',      trueText: 'COMPLETE', falseText: 'PENDING' }
    ],

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

    /* Examine data per node type: arrays of [text, cssClass] */
    examineData: {
        'proxy-logs':    [['[02/15 09:14] jsmith -> docs.google.com (200)','info'],['[02/15 09:22] jsmith -> update-service.cloudfront.net (200)  <- [SUSPICIOUS]','warning'],['[02/20 11:30] jsmith -> megaupload-cdn.com/upload (POST 50MB)  <- [EXFIL?]','warning']],
        'auth-logs':     [['[02/15 09:10] jsmith -- logon (WKS-042)','info'],['[02/15 09:25] jsmith -- privilege escalation -> local admin  <- [ALERT]','warning'],['[02/16 02:14] jsmith -> svc_admin -- credential harvesting  <- [ALERT]','warning'],['[02/18 08:00] svc_admin -- logon (DB-PROD-01)  <- [LATERAL]','warning'],['[02/18 08:05] svc_admin -- logon (FILE-SRV-01)  <- [LATERAL]','warning']],
        'dns-logs':      [['[02/15 09:22] WKS-042 -> update-service.cloudfront.net -> 185.44.xx.xx','info'],['[02/17 03:00] WKS-042 -> a3f8b2.dns-tunnel.xyz (TXT)  <- [DNS TUNNEL]','warning'],['[02/20 10:00] DB-PROD-01 -> megaupload-cdn.com  <- [EXFIL PREP]','warning']],
        'endpoint-logs': [['[02/15 09:23] WKS-042: powershell.exe -enc [base64] -> beacon.dll','info'],['[02/15 09:25] WKS-042: mimikatz.exe -- credential dump  <- [ALERT]','warning'],['[02/18 08:02] DB-PROD-01: psexec.exe lateral movement  <- [LATERAL]','warning']],
        'netflow-data':  [['[02/15-02/20] WKS-042 -> 185.44.xx.xx:443 (persistent beacon)','info'],['[02/17 03:00] WKS-042 -> dns-tunnel.xyz:53 (4.2MB via DNS)','warning'],['[02/20 11:30] DB-PROD-01 -> megaupload-cdn.com:443 (50MB)  <- [EXFIL]','warning']],
        'dlp-alerts':    [['[02/20 11:28] ALERT: Sensitive data staging on DB-PROD-01','warning'],['  File: customer_records_2024.csv.gz (50MB PII)','info'],['  Destination: megaupload-cdn.com  <- [EXFIL CONFIRMED]','warning']],
        'email-logs':    [['[02/15 08:55] INBOUND: hr-benefits@update-service.com -> jsmith@corp','info'],['  Subject: "Benefits Update -- Action Required"','info'],['  Attachment: Benefits_2024.xlsm (macro-enabled)  <- [PHISHING]','warning'],['[02/15 09:05] jsmith opened attachment (macro executed)','warning']],
        'threat-intel':  [['IOC Match: 185.44.xx.xx -- APT-PHANTOM (nation-state)','warning'],['IOC Match: dns-tunnel.xyz -- known C2','warning'],['IOC Match: megaupload-cdn.com -- exfil staging','warning'],['TTP: T1566.001 -> T1003 -> T1021.002 -> T1048.003','node-info']]
    },

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
    },

    /* ----------------------------------------------------------------
       Terminal Commands
       ---------------------------------------------------------------- */
    terminalCommands: {
        'examine': {
            help: 'Examine data at current node',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var type = c.grid.cells[s.position.row][s.position.col];
                if (type === 'empty' || type === 'wall') { e.printLine('Nothing to examine here.', 'error'); return; }
                e.printLine('', 'system');
                var lines = c.examineData[type];
                if (!lines) { e.printLine('No data.', 'error'); return; }
                e.printLine('=== ' + c.nodes[type].label + ' ===', 'heading');
                for (var i = 0; i < lines.length; i++) e.printLine(lines[i][0], lines[i][1]);
                if (s.examinedSources.indexOf(type) === -1) s.examinedSources.push(type);
                if (type === 'auth-logs' || type === 'endpoint-logs' || type === 'netflow-data') {
                    if (s.lateralNodes.indexOf(type) === -1) s.lateralNodes.push(type);
                }
                if (type === 'email-logs' && !s.initialAccessFound) {
                    s.initialAccessFound = true;
                    e.printLine('', 'system');
                    e.printLine('[!] INITIAL ACCESS: Phishing email with macro', 'success');
                }
                e.printLine('', 'system');
                e.printLine('[+] ' + c.nodes[type].label + ' examined. (' + s.examinedSources.length + '/8)', 'info');
                e.checkObjectives(); e.saveState();
            }
        },

        'correlate': {
            help: 'Cross-reference two data sources',
            syntax: 'correlate <s1> <s2>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (args.length < 2) { e.printLine('Usage: correlate <s1> <s2>', 'error'); return; }
                var s1 = c.sourceAliases[args[0].toLowerCase()] || null;
                var s2 = c.sourceAliases[args[1].toLowerCase()] || null;
                if (!s1) { e.printLine('Unknown: ' + args[0], 'error'); return; }
                if (!s2) { e.printLine('Unknown: ' + args[1], 'error'); return; }
                if (s.examinedSources.indexOf(s1) === -1) { e.printLine('Not examined: ' + s1, 'error'); return; }
                if (s.examinedSources.indexOf(s2) === -1) { e.printLine('Not examined: ' + s2, 'error'); return; }
                var pk = [s1, s2].sort().join(':');
                e.printLine('', 'system');
                e.printLine('Cross-referencing ' + c.nodes[s1].label + ' x ' + c.nodes[s2].label + '...', 'heading');
                // Key correlations
                if (pk === 'auth-logs:endpoint-logs') e.printLine('Lateral movement via credential abuse + psexec confirmed.', 'success');
                else if (pk === 'auth-logs:netflow-data') e.printLine('Lateral SMB movement confirmed via auth + flow.', 'success');
                else if (pk === 'dlp-alerts:netflow-data') e.printLine('EXFIL CONFIRMED: 50MB PII to megaupload-cdn.com.', 'warning');
                else if (pk === 'dns-logs:proxy-logs') e.printLine('C2 domain chain + exfil prep confirmed.', 'success');
                else if (pk === 'endpoint-logs:netflow-data') e.printLine('RAT beacon communications pattern identified.', 'success');
                else if (pk === 'email-logs:endpoint-logs') e.printLine('Phishing to execution chain confirmed.', 'success');
                else e.printLine('Patterns noted in correlation database.', 'info');
                if (s.correlations.indexOf(pk) === -1) s.correlations.push(pk);
                // Check lateral
                if (!s.lateralMovementMapped) {
                    var lp = 0;
                    for (var i = 0; i < s.correlations.length; i++) {
                        var pp = s.correlations[i].split(':');
                        if (s.lateralNodes.indexOf(pp[0]) !== -1 || s.lateralNodes.indexOf(pp[1]) !== -1) lp++;
                    }
                    if (lp >= 3) s.lateralMovementMapped = true;
                }
                // Check exfil
                if (!s.exfilChannelDetected) {
                    for (var j = 0; j < s.correlations.length; j++) {
                        var pp2 = s.correlations[j].split(':');
                        if (pp2.indexOf('dlp-alerts') !== -1 || pp2.indexOf('netflow-data') !== -1) {
                            s.exfilChannelDetected = true;
                            e.printLine('', 'system');
                            e.printLine('[!] EXFIL CHANNEL DETECTED', 'success');
                            break;
                        }
                    }
                }
                e.printLine('[+] Correlations: ' + s.correlations.length, 'info');
                e.checkObjectives(); e.saveState();
            }
        },

        'timeline': {
            help: 'Build APT kill chain timeline',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state;
                if (!s.initialAccessFound || !s.lateralMovementMapped || !s.exfilChannelDetected) {
                    e.printLine('Insufficient findings. Complete access/lateral/exfil objectives first.', 'error');
                    return;
                }
                e.printLine('', 'system');
                e.printLine('=== APT-PHANTOM KILL CHAIN ===', 'heading');
                e.printLine('[02/15 08:55] Initial Access: Phishing email -> jsmith', 'info');
                e.printLine('[02/15 09:23] Execution: Macro -> PowerShell -> beacon.dll', 'info');
                e.printLine('[02/15 09:25] Credential Access: mimikatz -> svc_admin hash', 'warning');
                e.printLine('[02/18 08:00] Lateral Movement: svc_admin -> DB-PROD-01/FILE-SRV', 'warning');
                e.printLine('[02/20 11:30] Exfiltration: 50MB PII -> megaupload-cdn.com', 'warning');
                e.printLine('', 'system');
                e.printLine('[!] KILL CHAIN COMPLETE', 'success');
                if (!s.killChainBuilt) { s.killChainBuilt = true; e.checkObjectives(); }
                e.saveState();
            }
        },

        'query': {
            help: 'Query examined sources for patterns',
            syntax: 'query <filter>',
            handler: function(args, ctx) {
                ctx.engine.printLine('Query requires 2+ examined sources. Use examine first.', 'system');
            }
        },

        'enrich': {
            help: 'Enrich IOC data from threat intel',
            syntax: 'enrich <ioc>',
            handler: function(args, ctx) {
                ctx.engine.printLine('Navigate to threat-intel and examine for IOC data.', 'system');
            }
        }
    }
};
