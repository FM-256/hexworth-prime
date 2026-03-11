/* ================================================================
   FORENSICS-03: Insider Threat -- Mission Config
   ================================================================
   Tier 2 digital forensics mission. Config-driven via TerminalInterpreter.
   A senior developer is suspected of stealing proprietary source code
   before departing the company. Investigate workstation, email, source
   control, badge logs, USB history, network traffic, HR records, file
   server, and proxy logs to build a forensic timeline proving exfiltration.
   Custom commands: scan, move, examine, timeline, correlate, hash,
   strings, report, status.
   ================================================================ */

var FORENSICS_03_CONFIG = {
    id: 'forensics-03',
    missionTitle: 'FORENSICS-03',
    title: 'Insider Threat',
    subtitle: 'Trace the trail. Prove the theft. File the report.',
    category: 'digital-forensics',
    difficulty: 2,
    inputMode: 'terminal',
    prompt: 'FORENSICS> ',
    promptText: 'FORENSICS> ',
    promptLabel: 'INSIDER THREAT INVESTIGATION',

    grid: {
        rows: 5,
        cols: 5,
        start: { col: 0, row: 0 },
        cells: [
            ['suspect-workstation', 'empty',       'email-server',    'empty',          'git-server'],
            ['empty',              'badge-system', 'empty',           'usb-forensics',  'empty'],
            ['network-tap',       'empty',         'hr-records',      'empty',          'file-server'],
            ['empty',              'proxy-logs',   'empty',           'evidence-locker', 'empty'],
            ['wall',               'wall',         'wall',            'wall',            'wall']
        ]
    },

    nodes: {
        'suspect-workstation': { label: 'SUSPECT-WS',       abbr: 'SWS', ip: '10.10.4.87',     desc: 'Developer workstation (Marcus Chen, Senior Dev)',      os: 'Ubuntu 22.04 LTS' },
        'email-server':        { label: 'EMAIL-SERVER',      abbr: 'EML', ip: '10.10.1.20',     desc: 'Corporate Exchange server -- mailbox export',          os: 'Exchange 2019' },
        'git-server':          { label: 'GIT-SERVER',        abbr: 'GIT', ip: '10.10.1.50',     desc: 'On-prem GitLab instance -- access and clone logs',     os: 'GitLab CE 16.8' },
        'badge-system':        { label: 'BADGE-SYSTEM',      abbr: 'BDG', ip: '10.10.1.5',      desc: 'Physical access control -- badge reader logs',         os: 'Lenel OnGuard 8.0' },
        'usb-forensics':       { label: 'USB-FORENSICS',     abbr: 'USB', ip: '\u2014',         desc: 'Forensic image of 64GB USB drive recovered from desk', os: 'exFAT / 64GB' },
        'network-tap':         { label: 'NETWORK-TAP',       abbr: 'NET', ip: '10.10.0.1',      desc: 'SPAN port capture -- 14 days of egress traffic',      os: 'Zeek + Wireshark' },
        'hr-records':          { label: 'HR-RECORDS',         abbr: 'HRR', ip: '10.10.1.10',     desc: 'Human Resources case file for Marcus Chen',           os: 'Workday' },
        'file-server':         { label: 'FILE-SERVER',        abbr: 'FSR', ip: '10.10.1.30',     desc: 'Shared engineering file server -- access logs',        os: 'Windows Server 2022' },
        'proxy-logs':          { label: 'PROXY-LOGS',         abbr: 'PRX', ip: '10.10.0.5',      desc: 'Web proxy and content filter logs',                   os: 'Zscaler ZIA' },
        'evidence-locker':     { label: 'EVIDENCE-LOCKER',    abbr: 'EVD', ip: '\u2014',         desc: 'Secured evidence storage -- chain of custody vault',   os: 'Write-once NAS' }
    },

    traps: [],
    gates: {},

    objectives: [
        { id: 'sources-examined',    label: 'Examine 5+ evidence sources',              check: 'fiveSourcesExamined' },
        { id: 'exfil-method',        label: 'Identify the exfiltration method',          check: 'exfilMethodFound' },
        { id: 'timeline-built',      label: 'Establish the forensic timeline',           check: 'timelineBuilt' },
        { id: 'badge-usb-correlated',label: 'Correlate badge + USB evidence',            check: 'badgeUsbCorrelated' },
        { id: 'report-filed',        label: 'File the investigation report',             check: 'reportFiled' }
    ],

    integrity: 5,

    completion: {
        title: 'INSIDER THREAT',
        subtitle: 'Trace the trail. Prove the theft. File the report.',
        storageKey: 'hexworth_operator_forensics03'
    },

    briefing: [
        'Senior developer Marcus Chen submitted two-week notice.',
        'Security flagged abnormal after-hours access and large outbound transfers.',
        'Examine all available evidence sources. Build the timeline.',
        'Correlate physical and digital evidence. File your report.'
    ],

    customState: {
        sourcesExamined: [],
        exfilMethodFound: false,
        timelineBuilt: false,
        badgeUsbCorrelated: false,
        reportFiled: false,
        fiveSourcesExamined: false
    },

    statusFields: [
        { key: 'fiveSourcesExamined', label: '5+ sources examined', trueText: 'YES', falseText: 'no' },
        { key: 'exfilMethodFound',     label: 'Exfil method ID\'d',  trueText: 'YES', falseText: 'no' },
        { key: 'timelineBuilt',        label: 'Timeline built',      trueText: 'YES', falseText: 'no' },
        { key: 'badgeUsbCorrelated',   label: 'Badge+USB linked',    trueText: 'YES', falseText: 'no' },
        { key: 'reportFiled',          label: 'Report filed',        trueText: 'YES', falseText: 'no' }
    ],

    // Hash map for evidence artifacts
    hashMap: {
        'usb-image':                '7a2f8c41b3e960d5f1284a7c9e03b6d8f2a1c4e5b7d9063f8a2c4e6b8d0f2a4c',
        'usb-drive':                '7a2f8c41b3e960d5f1284a7c9e03b6d8f2a1c4e5b7d9063f8a2c4e6b8d0f2a4c',
        'workstation-image':        'e4b1a3c5d7f90628a1c3e5b7d9f02a4c6e8b0d2f4a6c8e0b2d4f6a8c0e2b4d6f',
        'project-atlas.tar.gz':     '3c5e7a9b1d3f5072a4c6e8b0d2f4a6c8e0b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0',
        'project-atlas':            '3c5e7a9b1d3f5072a4c6e8b0d2f4a6c8e0b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0',
        'beacon-ml-models.tar.gz':  'b8d0f2a4c6e8a0c2e4b6d8f0a2c4e6b8d0f2a4c6e8a0c2e4b6d8f0a2c4e6b8d0',
        'customer-api-keys.env':    'f0a2c4e6b8d0f2a4c6e8a0c2e4b6d8f0a2c4e6b8d0f2a4c6e8a0c2e4b6d8f0a2'
    },

    // Source labels for report
    sourceMap: {
        'suspect-workstation': 'SUSPECT-WS    \u2014 Developer workstation, browser + USB + deleted files',
        'email-server':        'EMAIL-SERVER   \u2014 Personal forwarding, competitor contact emails',
        'git-server':          'GIT-SERVER     \u2014 Abnormal clone patterns, out-of-scope repo access',
        'badge-system':        'BADGE-SYSTEM   \u2014 After-hours physical access pattern (11 PM - 3 AM)',
        'usb-forensics':       'USB-FORENSICS  \u2014 64GB drive image, copied repo structure + API keys',
        'network-tap':         'NETWORK-TAP    \u2014 Large outbound transfers to cloud storage + personal VPN',
        'hr-records':          'HR-RECORDS     \u2014 2-week notice, competitor offer letter, NDA on file',
        'file-server':         'FILE-SERVER    \u2014 Accessed proprietary designs outside normal scope',
        'proxy-logs':          'PROXY-LOGS     \u2014 Google Drive uploads, Mega.nz sessions, external VPN',
        'evidence-locker':     'EVIDENCE-LOCKER \u2014 Chain of custody vault (no examinable evidence here)'
    },

    // ----------------------------------------------------------------
    //  TERMINAL COMMANDS
    // ----------------------------------------------------------------

    terminalCommands: {

        // --- SCAN (override: forensics-flavored labels) ---
        'scan': {
            help: 'Survey area, reveal adjacent evidence sources',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var col = s.position.col, row = s.position.row;
                var cellType = c.grid.cells[row][col];
                e.printLine('Scanning investigation area...', 'system');
                e.printLine('', 'system');
                if (cellType !== 'empty' && cellType !== 'wall') {
                    var cur = c.nodes[cellType];
                    e.printLine('Current: ' + cur.label + ' \u2014 ' + cur.desc, 'heading');
                    e.printLine('System:  ' + cur.os + '  [' + cur.ip + ']', 'info');
                } else {
                    e.printLine('Current: Corridor (no evidence source at this location)', 'heading');
                }
                e.printLine('', 'system');
                e.printLine('Adjacent:', 'heading');
                var dirs = [{name:'North',dc:0,dr:-1},{name:'South',dc:0,dr:1},{name:'East',dc:1,dr:0},{name:'West',dc:-1,dr:0}];
                for (var i = 0; i < dirs.length; i++) {
                    var d = dirs[i], nc = col + d.dc, nr = row + d.dr;
                    if (nc < 0 || nc >= c.grid.cols || nr < 0 || nr >= c.grid.rows) { e.printLine('  ' + d.name + ': [boundary]', 'system'); continue; }
                    var type = c.grid.cells[nr][nc];
                    if (type === 'wall') { e.printLine('  ' + d.name + ': [restricted area]', 'system'); continue; }
                    var key = nc + ',' + nr;
                    if (!s.visibility[key] || s.visibility[key] === 'hidden') s.visibility[key] = 'revealed';
                    if (type === 'empty') { e.printLine('  ' + d.name + ': Clear corridor', 'info'); }
                    else { var info = c.nodes[type]; e.printLine('  ' + d.name + ': ' + info.label + ' \u2014 ' + info.desc, 'node-info'); }
                }
                e.updateGrid(); e.saveState();
            }
        },

        // --- MOVE (override: forensics-flavored messages) ---
        'move': {
            help: 'Move investigator (north/south/east/west or n/s/e/w)', syntax: 'move <dir>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: move <direction>', 'error'); e.printLine('Directions: north/south/east/west (or n/s/e/w)', 'system'); return; }
                var dirMap = {'north':[0,-1],'n':[0,-1],'south':[0,1],'s':[0,1],'east':[1,0],'e':[1,0],'west':[-1,0],'w':[-1,0]};
                var dir = args[0].toLowerCase();
                if (!dirMap[dir]) { e.printLine('Unknown direction: ' + args[0], 'error'); e.printLine('Use: north/south/east/west (or n/s/e/w)', 'system'); return; }
                var d = dirMap[dir];
                var newCol = s.position.col + d[0], newRow = s.position.row + d[1];
                if (newCol < 0 || newCol >= c.grid.cols || newRow < 0 || newRow >= c.grid.rows) { e.printLine('Cannot move ' + dir + '. Edge of facility.', 'error'); return; }
                var cellType = c.grid.cells[newRow][newCol];
                if (cellType === 'wall') { e.printLine('Restricted area. No access ' + dir + '.', 'error'); return; }
                s.position = { col: newCol, row: newRow };
                s.visibility[newCol + ',' + newRow] = 'visited';
                if (cellType !== 'empty') s.nodesDiscovered.add(cellType);
                e.revealAdjacent(newCol, newRow);
                var dirFull = {n:'north',s:'south',e:'east',w:'west'};
                var dirName = dirFull[dir] || dir;
                if (cellType === 'empty') {
                    e.printLine('Moving ' + dirName + '... Clear corridor.', 'system');
                } else {
                    var info = c.nodes[cellType];
                    e.printLine('Moving ' + dirName + '... Arrived at ' + info.label, 'success');
                    e.printLine(info.desc + ' [' + info.os + ']', 'info');
                    e.printLine('Use "examine" to investigate this source.', 'system');
                }
                e.checkObjectives(); e.updateGrid(); e.saveState();
            }
        },

        // --- EXAMINE (10 evidence nodes) ---
        'examine': {
            help: 'Examine current node for evidence',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];
                if (cellType === 'empty' || cellType === 'wall') { e.printLine('Nothing to examine here. Move to an evidence source.', 'warning'); return; }

                // Track examined nodes
                if (s.sourcesExamined.indexOf(cellType) === -1) s.sourcesExamined.push(cellType);
                if (s.sourcesExamined.length >= 5) s.fiveSourcesExamined = true;

                e.printLine('', 'system');
                e.printLine('\u2550\u2550\u2550 EXAMINING: ' + c.nodes[cellType].label + ' \u2550\u2550\u2550', 'heading');
                e.printLine('', 'system');

                switch (cellType) {
                    case 'suspect-workstation':
                        e.printLine('Workstation: ws-dev-087 (Marcus Chen, Senior Developer)', 'evidence');
                        e.printLine('IP: 10.10.4.87 | MAC: 3C:22:FB:A1:09:4E | OS: Ubuntu 22.04', 'info');
                        e.printLine('', 'system');
                        e.printLine('Browser history (filtered -- last 14 days):', 'heading');
                        e.printLine('  2026-02-24 09:12  linkedin.com/jobs -- "Senior Engineer" roles', 'node-info');
                        e.printLine('  2026-02-25 10:45  careers.nexagen-tech.com/apply -- Nexagen Technologies', 'node-info');
                        e.printLine('  2026-02-26 14:22  drive.google.com/upload -- 3 sessions, 847 MB total', 'warning');
                        e.printLine('  2026-02-27 22:18  mega.nz -- file manager session, 12 min duration', 'warning');
                        e.printLine('  2026-02-28 23:41  github.com/mchen-private -- personal GitHub, 4 pushes', 'warning');
                        e.printLine('', 'system');
                        e.printLine('Recently deleted files (recovered from ext4 journal):', 'heading');
                        e.printLine('  project-atlas.tar.gz        312 MB   deleted 2026-03-01 02:14', 'evidence');
                        e.printLine('  beacon-ml-models.tar.gz     489 MB   deleted 2026-03-01 02:16', 'evidence');
                        e.printLine('  customer-api-keys.env        24 KB   deleted 2026-03-01 02:17', 'evidence');
                        e.printLine('  .bash_history (truncated)    cleared 2026-03-01 02:19', 'warning');
                        e.printLine('', 'system');
                        e.printLine('USB device history (dmesg + /var/log/syslog):', 'heading');
                        e.printLine('  2026-02-28 23:52  USB mass storage detected: SanDisk Ultra 64GB', 'evidence');
                        e.printLine('  2026-02-28 23:52  Mounted at /media/mchen/SANDISK_64', 'node-info');
                        e.printLine('  2026-03-01 02:08  USB device disconnected', 'node-info');
                        e.printLine('  [!] USB connected for 2h16m during after-hours window', 'warning');
                        e.printLine('', 'system');
                        e.printLine('[!] Workstation shows cloud uploads, USB activity, and evidence deletion.', 'warning');

                        // Check if exfil method found (need workstation + network-tap)
                        if (s.sourcesExamined.indexOf('network-tap') !== -1) {
                            s.exfilMethodFound = true;
                            e.printLine('', 'system');
                            e.printLine('[+] EXFILTRATION METHOD CONFIRMED: USB + cloud storage dual-path exfil.', 'success');
                        }
                        break;

                    case 'email-server':
                        e.printLine('Mailbox export: mchen@corp.innovatek.com', 'evidence');
                        e.printLine('Total messages: 4,218 | Date range: 2025-08-15 to 2026-03-01', 'info');
                        e.printLine('', 'system');
                        e.printLine('Flagged messages (DLP keyword match):', 'heading');
                        e.printLine('', 'system');
                        e.printLine('  [1] 2026-02-20 18:34 -- To: mchen.personal@gmail.com', 'evidence');
                        e.printLine('      Subject: "FW: Project Atlas Architecture Docs"', 'warning');
                        e.printLine('      Attachments: atlas-arch-overview.pdf (2.4 MB)', 'warning');
                        e.printLine('      [!] Forwarded proprietary architecture docs to personal email', 'warning');
                        e.printLine('', 'system');
                        e.printLine('  [2] 2026-02-23 09:15 -- To: mchen.personal@gmail.com', 'evidence');
                        e.printLine('      Subject: "FW: Q1 Product Roadmap - CONFIDENTIAL"', 'warning');
                        e.printLine('      Attachments: q1-roadmap-2026.pptx (8.1 MB)', 'warning');
                        e.printLine('      [!] Confidential roadmap sent to personal address', 'warning');
                        e.printLine('', 'system');
                        e.printLine('  [3] 2026-02-25 11:42 -- From: recruiting@nexagen-tech.com', 'evidence');
                        e.printLine('      Subject: "RE: Senior Principal Engineer Offer"', 'node-info');
                        e.printLine('      Body excerpt: "...excited to formalize the offer. As discussed,', 'node-info');
                        e.printLine('      your experience with the Atlas ML pipeline is exactly what our', 'node-info');
                        e.printLine('      team needs. Offer letter attached..."', 'node-info');
                        e.printLine('      [!] Competitor explicitly references proprietary project name', 'warning');
                        e.printLine('', 'system');
                        e.printLine('  [4] 2026-02-27 16:08 -- To: j.walsh@nexagen-tech.com', 'evidence');
                        e.printLine('      Subject: "Sample deliverables"', 'warning');
                        e.printLine('      Attachments: ml-pipeline-sample.zip (14.7 MB)', 'warning');
                        e.printLine('      [!] Sent code samples to competitor contact', 'warning');
                        e.printLine('', 'system');
                        e.printLine('[!] Pattern: forwarding proprietary docs to personal email, then to competitor.', 'warning');
                        break;

                    case 'git-server':
                        e.printLine('GitLab CE 16.8 -- Access audit log for user: mchen', 'evidence');
                        e.printLine('Role: Developer | Groups: platform-team, ml-research', 'info');
                        e.printLine('', 'system');
                        e.printLine('Clone activity (last 30 days):', 'heading');
                        e.printLine('  Date                Repo                          Size     Method', 'node-info');
                        e.printLine('  2026-02-26 01:14    platform/project-atlas         312 MB   git clone --mirror', 'warning');
                        e.printLine('  2026-02-26 01:31    ml-research/beacon-models      489 MB   git clone --mirror', 'warning');
                        e.printLine('  2026-02-26 01:48    platform/customer-portal       127 MB   git clone --mirror', 'warning');
                        e.printLine('  2026-02-26 02:02    infra/deployment-keys           18 MB   git clone --mirror', 'warning');
                        e.printLine('  2026-02-26 02:09    devops/api-gateway-config       42 MB   git clone --mirror', 'warning');
                        e.printLine('', 'system');
                        e.printLine('[!] 5 full mirror clones at 1-2 AM -- ALL with complete history', 'warning');
                        e.printLine('[!] customer-portal, deployment-keys, api-gateway-config are OUTSIDE', 'warning');
                        e.printLine('    mchen\'s assigned repositories. Access granted via group membership.', 'warning');
                        e.printLine('', 'system');
                        e.printLine('Normal clone pattern (prior 6 months):', 'heading');
                        e.printLine('  Average: 2-3 clones/week, project-atlas + beacon-models only', 'info');
                        e.printLine('  Method: standard clone (not --mirror), business hours only', 'info');
                        e.printLine('  [!] Mirror clones capture ALL branches, tags, and history', 'warning');
                        e.printLine('  [!] 5 repos in 55 minutes at 1 AM is a bulk exfiltration pattern', 'warning');
                        break;

                    case 'badge-system':
                        e.printLine('Lenel OnGuard 8.0 -- Badge access log', 'evidence');
                        e.printLine('Badge holder: Marcus Chen (EMP-4471) | Clearance: Engineering Floor', 'info');
                        e.printLine('', 'system');
                        e.printLine('After-hours access pattern (last 14 days):', 'heading');
                        e.printLine('  Date        Entry         Exit          Duration', 'node-info');
                        e.printLine('  2026-02-18  11:14 PM      02:47 AM      3h 33m', 'warning');
                        e.printLine('  2026-02-20  11:31 PM      03:12 AM      3h 41m', 'warning');
                        e.printLine('  2026-02-23  10:58 PM      02:22 AM      3h 24m', 'warning');
                        e.printLine('  2026-02-25  11:22 PM      03:01 AM      3h 39m', 'warning');
                        e.printLine('  2026-02-26  11:08 PM      02:55 AM      3h 47m', 'warning');
                        e.printLine('  2026-02-28  11:47 PM      03:19 AM      3h 32m', 'evidence');
                        e.printLine('', 'system');
                        e.printLine('[!] 6 after-hours sessions in 10 days (11 PM - 3 AM window)', 'warning');
                        e.printLine('[!] Prior 6-month average: 0.2 after-hours entries per month', 'warning');
                        e.printLine('', 'system');
                        e.printLine('Anomaly flagged:', 'heading');
                        e.printLine('  2026-02-26 11:08 PM -- Tailgating alert on Engineering Lab door', 'evidence');
                        e.printLine('  Badge scanned for main entrance, but Engineering Lab door opened', 'node-info');
                        e.printLine('  without badge scan 14 seconds later (proximity sensor triggered)', 'node-info');
                        e.printLine('  [!] Possible attempt to avoid logging access to specific area', 'warning');
                        e.printLine('', 'system');
                        e.printLine('Normal pattern (prior 6 months):', 'heading');
                        e.printLine('  Typical arrival: 8:30-9:15 AM | Typical departure: 5:30-6:45 PM', 'info');
                        e.printLine('  Weekend access: none recorded', 'info');
                        break;

                    case 'usb-forensics':
                        e.printLine('Forensic image: SanDisk Ultra 64GB (SN: 4D534E44-0198-AA42)', 'evidence');
                        e.printLine('Image hash (SHA-256): 7a2f8c41b3e960d5f1284a7c9e03b6d8...', 'info');
                        e.printLine('Filesystem: exFAT | Used: 51.2 GB / 59.6 GB available', 'info');
                        e.printLine('', 'system');
                        e.printLine('Directory structure:', 'heading');
                        e.printLine('  /project-atlas/           [312 MB]  -- full mirror clone', 'evidence');
                        e.printLine('    .git/                   complete history (2,847 commits)', 'node-info');
                        e.printLine('    src/ml-pipeline/        proprietary ML training code', 'node-info');
                        e.printLine('    src/data-processor/     customer data ETL pipeline', 'node-info');
                        e.printLine('    docs/architecture/      system design documents', 'node-info');
                        e.printLine('', 'system');
                        e.printLine('  /beacon-models/           [489 MB]  -- full mirror clone', 'evidence');
                        e.printLine('    .git/                   complete history (1,204 commits)', 'node-info');
                        e.printLine('    models/production/      trained ML model weights', 'node-info');
                        e.printLine('    configs/                model hyperparameters', 'node-info');
                        e.printLine('', 'system');
                        e.printLine('  /api-keys/                [24 KB]', 'evidence');
                        e.printLine('    customer-api-keys.env   production API keys + secrets', 'warning');
                        e.printLine('    deployment-tokens.json  CI/CD deployment credentials', 'warning');
                        e.printLine('', 'system');
                        e.printLine('File timestamps:', 'heading');
                        e.printLine('  Earliest file written:  2026-02-28 23:54 (project-atlas)', 'node-info');
                        e.printLine('  Latest file written:    2026-03-01 02:06 (api-keys)', 'node-info');
                        e.printLine('  [!] All files written in single 2h12m session', 'warning');
                        e.printLine('  [!] Timestamps align with badge entry 2026-02-28 11:47 PM', 'warning');
                        break;

                    case 'network-tap':
                        e.printLine('Zeek connection logs + Wireshark PCAP analysis', 'evidence');
                        e.printLine('Source: 10.10.4.87 (ws-dev-087, Marcus Chen)', 'info');
                        e.printLine('Capture window: 2026-02-15 to 2026-03-01', 'info');
                        e.printLine('', 'system');
                        e.printLine('Outbound transfer anomalies:', 'heading');
                        e.printLine('  Date        Destination                  Size     Proto  Duration', 'node-info');
                        e.printLine('  02-26 14:22 drive.google.com             312 MB   TLS    18 min', 'warning');
                        e.printLine('  02-27 22:18 mega.nz                      489 MB   TLS    24 min', 'warning');
                        e.printLine('  02-28 23:58 github.com (mchen-private)    42 MB   TLS     6 min', 'warning');
                        e.printLine('', 'system');
                        e.printLine('[!] 843 MB transferred to personal cloud services in 3 days', 'warning');
                        e.printLine('[!] Baseline outbound for this workstation: ~12 MB/day average', 'warning');
                        e.printLine('', 'system');
                        e.printLine('DNS query anomalies:', 'heading');
                        e.printLine('  2026-02-28 22:04  vpn.mchen-home.net  (personal domain, A record)', 'evidence');
                        e.printLine('  2026-02-28 22:04  Connection established: OpenVPN on port 1194', 'warning');
                        e.printLine('  2026-02-28 22:06  Tunnel active for 4h13m, 1.2 GB transferred', 'warning');
                        e.printLine('  [!] Personal VPN tunnel from corporate workstation', 'warning');
                        e.printLine('  [!] Traffic inside tunnel is encrypted -- contents unknown', 'warning');
                        e.printLine('', 'system');
                        e.printLine('GitLab internal traffic:', 'heading');
                        e.printLine('  02-26 01:14  10.10.1.50 (git-server)  988 MB   SSH    55 min', 'evidence');
                        e.printLine('  [!] 988 MB pulled from GitLab at 1 AM -- matches clone log times', 'warning');

                        // Check if exfil method found (need workstation + network-tap)
                        if (s.sourcesExamined.indexOf('suspect-workstation') !== -1) {
                            s.exfilMethodFound = true;
                            e.printLine('', 'system');
                            e.printLine('[+] EXFILTRATION METHOD CONFIRMED: USB + cloud storage dual-path exfil.', 'success');
                        }
                        break;

                    case 'hr-records':
                        e.printLine('HR Case File: Marcus Chen (EMP-4471)', 'evidence');
                        e.printLine('Department: Engineering -- Platform Team | Hire date: 2022-06-15', 'info');
                        e.printLine('Title: Senior Software Developer | Manager: Sarah Okafor', 'info');
                        e.printLine('', 'system');
                        e.printLine('Employment timeline:', 'heading');
                        e.printLine('  2022-06-15  Hired as Software Developer II', 'node-info');
                        e.printLine('  2023-01-10  Promoted to Senior Software Developer', 'node-info');
                        e.printLine('  2023-08-22  Added to ml-research group (Project Beacon)', 'node-info');
                        e.printLine('  2024-03-15  Performance review: "Exceeds Expectations"', 'node-info');
                        e.printLine('  2025-09-01  Salary adjustment denied (budget freeze)', 'warning');
                        e.printLine('  2025-11-14  Performance review: "Meets Expectations" (downgrade)', 'warning');
                        e.printLine('  2026-02-24  Two-week notice submitted', 'evidence');
                        e.printLine('  2026-03-10  Last day (scheduled)', 'node-info');
                        e.printLine('', 'system');
                        e.printLine('Resignation details:', 'heading');
                        e.printLine('  Reason given: "Pursuing new opportunities"', 'node-info');
                        e.printLine('  Exit interview: Declined', 'warning');
                        e.printLine('  Knowledge transfer: Minimal -- "documented in wiki" per Chen', 'warning');
                        e.printLine('', 'system');
                        e.printLine('Printer queue discovery (shared printer, Bldg 4 2nd floor):', 'heading');
                        e.printLine('  2026-02-25 11:55  Nexagen Technologies Offer Letter -- 2 pages', 'evidence');
                        e.printLine('  [!] Offer letter left in printer queue. Retrieved by facilities.', 'warning');
                        e.printLine('  [!] Position: Senior Principal Engineer. Salary: $245,000 + equity', 'warning');
                        e.printLine('  [!] Start date listed: 2026-03-17 (one week after last day)', 'warning');
                        e.printLine('', 'system');
                        e.printLine('NDA status:', 'heading');
                        e.printLine('  Non-Disclosure Agreement signed: 2022-06-15 (on file)', 'info');
                        e.printLine('  Non-Compete clause: 12-month restriction, direct competitors', 'info');
                        e.printLine('  IP Assignment: All work product owned by InnovaTek', 'info');
                        break;

                    case 'file-server':
                        e.printLine('Windows Server 2022 -- SMB access audit log', 'evidence');
                        e.printLine('Share: \\\\fs01\\engineering | Queried user: mchen', 'info');
                        e.printLine('', 'system');
                        e.printLine('Access log (last 30 days, filtered for anomalies):', 'heading');
                        e.printLine('  Date        Time   Path                                    Action', 'node-info');
                        e.printLine('  2026-02-20  23:44  \\hardware\\schematics\\beacon-pcb-v3\\     READ', 'warning');
                        e.printLine('  2026-02-20  23:47  \\hardware\\schematics\\beacon-pcb-v3\\     COPY', 'warning');
                        e.printLine('  2026-02-23  00:12  \\executive\\product-roadmap-2026\\        READ', 'warning');
                        e.printLine('  2026-02-23  00:14  \\executive\\product-roadmap-2026\\        COPY', 'warning');
                        e.printLine('  2026-02-25  23:55  \\legal\\patent-filings\\atlas-ml-patent\\ READ', 'warning');
                        e.printLine('  2026-02-25  23:57  \\legal\\patent-filings\\atlas-ml-patent\\ COPY', 'warning');
                        e.printLine('', 'system');
                        e.printLine('[!] mchen accessed 3 directories outside normal scope:', 'warning');
                        e.printLine('    hardware/schematics -- never accessed before in 3.5 years', 'warning');
                        e.printLine('    executive/product-roadmap -- restricted to VP+ level', 'warning');
                        e.printLine('    legal/patent-filings -- restricted to legal team', 'warning');
                        e.printLine('', 'system');
                        e.printLine('Permission analysis:', 'heading');
                        e.printLine('  mchen has READ access via Engineering group inheritance', 'info');
                        e.printLine('  Access technically authorized but outside role scope', 'info');
                        e.printLine('  [!] All access during after-hours (11 PM - midnight)', 'warning');
                        e.printLine('  [!] READ followed by COPY within 2-3 minutes each time', 'warning');
                        break;

                    case 'proxy-logs':
                        e.printLine('Zscaler ZIA -- Web proxy logs for 10.10.4.87', 'evidence');
                        e.printLine('User: mchen@corp.innovatek.com | Policy: Standard Engineering', 'info');
                        e.printLine('', 'system');
                        e.printLine('Cloud storage upload sessions:', 'heading');
                        e.printLine('  Date        Service         Upload Size  Duration  Files', 'node-info');
                        e.printLine('  2026-02-26  Google Drive    312 MB       18 min    1 archive', 'warning');
                        e.printLine('  2026-02-27  Mega.nz         489 MB       24 min    1 archive', 'warning');
                        e.printLine('  2026-02-28  Google Drive     14.7 MB      2 min    1 zip', 'warning');
                        e.printLine('', 'system');
                        e.printLine('[!] Google Drive: personal account (mchen.personal@gmail.com)', 'warning');
                        e.printLine('[!] Mega.nz: end-to-end encrypted -- content not inspectable by DLP', 'warning');
                        e.printLine('[!] Upload sizes match git clone sizes from GitLab audit log', 'warning');
                        e.printLine('', 'system');
                        e.printLine('VPN/tunnel activity:', 'heading');
                        e.printLine('  2026-02-28 22:04  OpenVPN connection to vpn.mchen-home.net:1194', 'evidence');
                        e.printLine('  2026-02-28 22:06  Tunnel established, TLS 1.3', 'node-info');
                        e.printLine('  2026-03-01 02:19  Tunnel terminated (1.2 GB transferred)', 'warning');
                        e.printLine('  [!] Personal VPN from corporate network -- policy violation', 'warning');
                        e.printLine('  [!] All traffic inside tunnel bypasses DLP inspection', 'warning');
                        e.printLine('', 'system');
                        e.printLine('Blocked requests:', 'heading');
                        e.printLine('  2026-02-26 01:55  pastebin.com/raw/* -- BLOCKED by policy', 'info');
                        e.printLine('  2026-02-27 22:30  transfer.sh -- BLOCKED by policy', 'info');
                        e.printLine('  [!] Attempted additional exfil channels before using Mega.nz', 'warning');
                        break;

                    case 'evidence-locker':
                        e.printLine('Evidence Locker -- Chain of Custody Vault', 'heading');
                        e.printLine('', 'system');
                        e.printLine('This is the secured evidence storage area.', 'info');
                        e.printLine('No additional examinable evidence here.', 'info');
                        e.printLine('', 'system');
                        e.printLine('Use "hash <artifact>" to compute integrity hashes.', 'system');
                        e.printLine('Use "report" when investigation is complete.', 'system');
                        break;

                    default:
                        e.printLine('Nothing significant found here.', 'system');
                }

                e.printLine('', 'system');
                e.updateGrid(); e.checkObjectives(); e.saveState();
            }
        },

        // --- TIMELINE (requires 3+ sources examined) ---
        'timeline': {
            help: 'Reconstruct chronological event timeline (requires 3+ sources examined)',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state;
                if (s.sourcesExamined.length < 3) {
                    e.printLine('Insufficient evidence. Examine at least 3 sources before building timeline.', 'warning');
                    e.printLine('Sources examined: ' + s.sourcesExamined.length + ' / 3 required', 'info');
                    return;
                }

                e.printLine('', 'system');
                e.printLine('\u2550\u2550\u2550 FORENSIC TIMELINE \u2014 Insider Threat Investigation \u2550\u2550\u2550', 'heading');
                e.printLine('Subject: Marcus Chen (EMP-4471) | Case: IT-2026-0193', 'info');
                e.printLine('', 'system');

                e.printLine('PHASE 1: PREPARATION (Feb 18-25)', 'heading');
                e.printLine('  2026-02-18 11:14 PM  First after-hours badge entry (pattern begins)', 'evidence');
                e.printLine('  2026-02-20 06:34 PM  Forwards architecture docs to personal email', 'evidence');
                e.printLine('  2026-02-20 11:44 PM  Accesses hardware schematics on file server (out of scope)', 'evidence');
                e.printLine('  2026-02-23 09:15 AM  Forwards confidential roadmap to personal email', 'evidence');
                e.printLine('  2026-02-24          Two-week notice submitted to HR', 'node-info');
                e.printLine('  2026-02-25 11:42 AM  Receives competitor offer from Nexagen Technologies', 'evidence');
                e.printLine('  2026-02-25 11:55 PM  Accesses patent filings on file server (out of scope)', 'evidence');
                e.printLine('', 'system');

                e.printLine('PHASE 2: EXFILTRATION (Feb 26 - Mar 1)', 'heading');
                e.printLine('  2026-02-26 01:14 AM  Mirror-clones 5 repos from GitLab (988 MB, 55 min)', 'evidence');
                e.printLine('  2026-02-26 02:22 PM  Uploads project-atlas archive to Google Drive (312 MB)', 'evidence');
                e.printLine('  2026-02-27 04:08 PM  Sends code samples to Nexagen contact (14.7 MB)', 'evidence');
                e.printLine('  2026-02-27 10:18 PM  Uploads beacon-models to Mega.nz (489 MB)', 'evidence');
                e.printLine('  2026-02-28 10:04 PM  Establishes personal VPN tunnel (1.2 GB transferred)', 'evidence');
                e.printLine('  2026-02-28 11:41 PM  Pushes to personal GitHub (mchen-private)', 'evidence');
                e.printLine('  2026-02-28 11:47 PM  Badge entry -- begins final after-hours session', 'evidence');
                e.printLine('  2026-02-28 11:52 PM  USB drive inserted at workstation', 'evidence');
                e.printLine('  2026-03-01 02:06 AM  Last file written to USB (api-keys)', 'evidence');
                e.printLine('  2026-03-01 02:08 AM  USB drive disconnected', 'node-info');
                e.printLine('', 'system');

                e.printLine('PHASE 3: COVER-UP (Mar 1)', 'heading');
                e.printLine('  2026-03-01 02:14 AM  Deletes project-atlas.tar.gz from workstation', 'evidence');
                e.printLine('  2026-03-01 02:16 AM  Deletes beacon-ml-models.tar.gz', 'evidence');
                e.printLine('  2026-03-01 02:17 AM  Deletes customer-api-keys.env', 'evidence');
                e.printLine('  2026-03-01 02:19 AM  Clears .bash_history', 'evidence');
                e.printLine('  2026-03-01 02:19 AM  VPN tunnel terminated', 'node-info');
                e.printLine('  2026-03-01 03:19 AM  Badge exit -- last after-hours session', 'node-info');
                e.printLine('', 'system');

                e.printLine('CONCLUSION:', 'heading');
                e.printLine('  Marcus Chen conducted a systematic, multi-week data exfiltration campaign', 'success');
                e.printLine('  using three channels: personal email, cloud storage (Google Drive + Mega.nz),', 'success');
                e.printLine('  and physical USB media. The operation targeted proprietary source code,', 'success');
                e.printLine('  ML models, API keys, and confidential business documents -- all before', 'success');
                e.printLine('  departing to a direct competitor (Nexagen Technologies).', 'success');
                e.printLine('', 'system');

                s.timelineBuilt = true;
                e.checkObjectives(); e.updateGrid(); e.saveState();
            }
        },

        // --- CORRELATE (cross-reference two evidence sources) ---
        'correlate': {
            help: 'Cross-reference two evidence sources', syntax: 'correlate <source1> <source2>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state;

                if (args.length < 2) {
                    e.printLine('Usage: correlate <source1> <source2>', 'error');
                    e.printLine('Example: correlate badge usb', 'system');
                    e.printLine('Available keywords: badge, usb, network, email, git, proxy, workstation, hr, file', 'system');
                    return;
                }

                var a = args[0].toLowerCase(), b = args[1].toLowerCase();
                var pair = [a, b].sort().join('+');

                e.printLine('', 'system');
                e.printLine('\u2550\u2550\u2550 EVIDENCE CORRELATION \u2550\u2550\u2550', 'heading');
                e.printLine('', 'system');

                // Badge + USB correlation (key objective)
                if (pair === 'badge+usb') {
                    if (s.sourcesExamined.indexOf('badge-system') === -1 || s.sourcesExamined.indexOf('usb-forensics') === -1) {
                        e.printLine('[!] Must examine both BADGE-SYSTEM and USB-FORENSICS first.', 'warning');
                        return;
                    }
                    e.printLine('Cross-referencing BADGE-SYSTEM + USB-FORENSICS...', 'system');
                    e.printLine('', 'system');
                    e.printLine('  BADGE:  2026-02-28 11:47 PM -- Badge entry at main entrance', 'evidence');
                    e.printLine('  USB:    2026-02-28 11:52 PM -- USB drive inserted at workstation', 'evidence');
                    e.printLine('  DELTA:  5 minutes between badge-in and USB insertion', 'evidence');
                    e.printLine('', 'system');
                    e.printLine('  USB:    2026-03-01 02:08 AM -- USB drive disconnected', 'evidence');
                    e.printLine('  BADGE:  2026-03-01 03:19 AM -- Badge exit', 'evidence');
                    e.printLine('  DELTA:  71 minutes between USB removal and building exit', 'evidence');
                    e.printLine('', 'system');
                    e.printLine('  USB contents: 51.2 GB written (project-atlas, beacon-models, api-keys)', 'node-info');
                    e.printLine('  Session duration: 3h 32m on-site, 2h 16m USB connected', 'node-info');
                    e.printLine('', 'system');
                    e.printLine('[+] CORRELATION CONFIRMED: After-hours physical access directly enabled', 'success');
                    e.printLine('    USB-based data exfiltration. Badge proves Chen was physically present', 'success');
                    e.printLine('    at the workstation when proprietary data was copied to the USB drive.', 'success');
                    s.badgeUsbCorrelated = true;
                    e.checkObjectives(); e.updateGrid(); e.saveState();
                    return;
                }

                // Git + Network correlation
                if (pair === 'git+network' || pair === 'git+net') {
                    if (s.sourcesExamined.indexOf('git-server') === -1 || s.sourcesExamined.indexOf('network-tap') === -1) {
                        e.printLine('[!] Must examine both GIT-SERVER and NETWORK-TAP first.', 'warning');
                        return;
                    }
                    e.printLine('Cross-referencing GIT-SERVER + NETWORK-TAP...', 'system');
                    e.printLine('', 'system');
                    e.printLine('  GIT:     2026-02-26 01:14-02:09 AM -- 5 mirror clones (988 MB)', 'evidence');
                    e.printLine('  NETWORK: 2026-02-26 01:14 AM -- 988 MB SSH transfer to 10.10.1.50', 'evidence');
                    e.printLine('  [+] Git clone timestamps perfectly match network flow data', 'success');
                    e.printLine('', 'system');
                    e.printLine('  GIT:     project-atlas (312 MB)', 'node-info');
                    e.printLine('  NETWORK: Google Drive upload 312 MB on 02-26', 'node-info');
                    e.printLine('  [+] Clone size matches cloud upload size -- same archive', 'success');
                    e.printLine('', 'system');
                    e.printLine('  GIT:     beacon-models (489 MB)', 'node-info');
                    e.printLine('  NETWORK: Mega.nz upload 489 MB on 02-27', 'node-info');
                    e.printLine('  [+] Clone size matches Mega upload size -- same archive', 'success');
                    return;
                }

                // Email + HR correlation
                if (pair === 'email+hr') {
                    if (s.sourcesExamined.indexOf('email-server') === -1 || s.sourcesExamined.indexOf('hr-records') === -1) {
                        e.printLine('[!] Must examine both EMAIL-SERVER and HR-RECORDS first.', 'warning');
                        return;
                    }
                    e.printLine('Cross-referencing EMAIL-SERVER + HR-RECORDS...', 'system');
                    e.printLine('', 'system');
                    e.printLine('  EMAIL: 2026-02-25 -- Receives offer from Nexagen Technologies', 'evidence');
                    e.printLine('  HR:    2026-02-24 -- Two-week notice submitted (day BEFORE offer email)', 'evidence');
                    e.printLine('  [!] Notice predates formal offer -- suggests pre-arrangement', 'warning');
                    e.printLine('', 'system');
                    e.printLine('  EMAIL: j.walsh@nexagen-tech.com -- received code samples', 'evidence');
                    e.printLine('  HR:    Nexagen Technologies -- named in offer letter', 'evidence');
                    e.printLine('  [+] Competitor contact in email matches company in offer letter', 'success');
                    e.printLine('', 'system');
                    e.printLine('  HR:    NDA signed 2022-06-15 + 12-month non-compete', 'node-info');
                    e.printLine('  EMAIL: Code samples sent to competitor during employment', 'node-info');
                    e.printLine('  [+] Clear NDA and non-compete violation', 'success');
                    return;
                }

                // Proxy + Network correlation
                if (pair === 'network+proxy' || pair === 'net+proxy') {
                    if (s.sourcesExamined.indexOf('proxy-logs') === -1 || s.sourcesExamined.indexOf('network-tap') === -1) {
                        e.printLine('[!] Must examine both PROXY-LOGS and NETWORK-TAP first.', 'warning');
                        return;
                    }
                    e.printLine('Cross-referencing PROXY-LOGS + NETWORK-TAP...', 'system');
                    e.printLine('', 'system');
                    e.printLine('  PROXY:   Google Drive 312 MB upload on 02-26', 'evidence');
                    e.printLine('  NETWORK: 312 MB TLS to drive.google.com on 02-26', 'evidence');
                    e.printLine('  [+] Proxy and network tap confirm same upload event', 'success');
                    e.printLine('', 'system');
                    e.printLine('  PROXY:   VPN tunnel to vpn.mchen-home.net (1.2 GB)', 'evidence');
                    e.printLine('  NETWORK: OpenVPN on port 1194, 4h13m, 1.2 GB', 'evidence');
                    e.printLine('  [+] Both sources confirm personal VPN with matching data volume', 'success');
                    e.printLine('', 'system');
                    e.printLine('  PROXY:   Blocked attempts -- pastebin.com, transfer.sh', 'node-info');
                    e.printLine('  NETWORK: No corresponding flows (correctly blocked)', 'node-info');
                    e.printLine('  [+] Subject tried multiple exfil channels before finding ones that worked', 'success');
                    return;
                }

                // Badge + Git correlation
                if (pair === 'badge+git') {
                    if (s.sourcesExamined.indexOf('badge-system') === -1 || s.sourcesExamined.indexOf('git-server') === -1) {
                        e.printLine('[!] Must examine both BADGE-SYSTEM and GIT-SERVER first.', 'warning');
                        return;
                    }
                    e.printLine('Cross-referencing BADGE-SYSTEM + GIT-SERVER...', 'system');
                    e.printLine('', 'system');
                    e.printLine('  BADGE: 2026-02-26 11:08 PM -- Badge entry', 'evidence');
                    e.printLine('  GIT:   2026-02-26 01:14 AM -- First mirror clone (earlier that morning)', 'evidence');
                    e.printLine('  [!] Badge shows physical presence during repo cloning window', 'warning');
                    e.printLine('', 'system');
                    e.printLine('  BADGE: 6 after-hours sessions over 10 days', 'node-info');
                    e.printLine('  GIT:   5 mirror clones during one of those sessions', 'node-info');
                    e.printLine('  [+] After-hours access pattern coincides with data harvesting', 'success');
                    return;
                }

                // Workstation + File server
                if (pair === 'file+workstation' || pair === 'file+ws') {
                    if (s.sourcesExamined.indexOf('suspect-workstation') === -1 || s.sourcesExamined.indexOf('file-server') === -1) {
                        e.printLine('[!] Must examine both SUSPECT-WS and FILE-SERVER first.', 'warning');
                        return;
                    }
                    e.printLine('Cross-referencing SUSPECT-WS + FILE-SERVER...', 'system');
                    e.printLine('', 'system');
                    e.printLine('  FILE-SERVER: COPY actions from \\hardware\\, \\executive\\, \\legal\\', 'evidence');
                    e.printLine('  WORKSTATION: Deleted .tar.gz archives found in ext4 journal', 'evidence');
                    e.printLine('  [+] Files copied from server were archived and staged for exfil', 'success');
                    e.printLine('', 'system');
                    e.printLine('  FILE-SERVER: All access during 11 PM - midnight window', 'node-info');
                    e.printLine('  WORKSTATION: USB + cloud activity during same after-hours windows', 'node-info');
                    e.printLine('  [+] Consistent pattern: access data at night, exfil next day', 'success');
                    return;
                }

                // Generic fallback for unrecognized pairs
                e.printLine('No direct correlation available for: ' + a + ' + ' + b, 'warning');
                e.printLine('', 'system');
                e.printLine('Try one of these high-value correlations:', 'system');
                e.printLine('  correlate badge usb       -- physical access + USB exfiltration', 'info');
                e.printLine('  correlate git network      -- clone activity + network transfers', 'info');
                e.printLine('  correlate email hr          -- competitor contact + employment records', 'info');
                e.printLine('  correlate proxy network     -- web proxy + network tap overlap', 'info');
                e.printLine('  correlate badge git         -- physical presence + repo cloning', 'info');
                e.printLine('  correlate workstation file  -- workstation artifacts + file server logs', 'info');
            }
        },

        // --- HASH (SHA-256 of artifacts) ---
        'hash': {
            help: 'Compute SHA-256 hash of an artifact for chain of custody', syntax: 'hash <artifact>',
            handler: function(args, ctx) {
                var e = ctx.engine, c = ctx.config;
                if (!args.length) { e.printLine('Usage: hash <artifact>', 'error'); e.printLine('Example: hash usb-image', 'system'); return; }
                var file = args.join(' ');
                var key = file.toLowerCase().replace(/\s+/g, '-');
                var hash = null;
                var hashMap = c.hashMap;
                for (var k in hashMap) {
                    if (key.indexOf(k.split('.')[0]) !== -1 || key === k) { hash = hashMap[k]; break; }
                }
                if (!hash) {
                    var seed = 0;
                    for (var i = 0; i < file.length; i++) { seed = (seed * 31 + file.charCodeAt(i)) & 0xffffffff; }
                    hash = Math.abs(seed).toString(16).padStart(8, '0').repeat(8).substring(0, 64);
                }
                e.printLine('', 'system');
                e.printLine('Computing SHA-256 for chain of custody...', 'system');
                e.printLine('Artifact: ' + file, 'info');
                e.printLine('SHA-256:  ' + hash, 'evidence');
                e.printLine('', 'system');
            }
        },

        // --- STRINGS (extract text from binary evidence) ---
        'strings': {
            help: 'Extract text strings from binary evidence', syntax: 'strings <artifact>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];
                var artifact = args.join(' ').toLowerCase();

                if (!artifact) { e.printLine('Usage: strings <artifact>', 'error'); e.printLine('Example: strings usb-image', 'system'); return; }

                e.printLine('', 'system');

                // Strings on USB drive image
                if (cellType === 'usb-forensics') {
                    if (s.sourcesExamined.indexOf('usb-forensics') === -1) {
                        e.printLine('[!] Examine this node first to identify the evidence.', 'warning');
                        return;
                    }
                    e.printLine('Running strings on USB forensic image...', 'system');
                    e.printLine('', 'system');
                    e.printLine('\u2550\u2550\u2550 EXTRACTED STRINGS (filtered for high-value content) \u2550\u2550\u2550', 'heading');
                    e.printLine('', 'system');
                    e.printLine('  [Git metadata]', 'heading');
                    e.printLine('  remote "origin" = git@gitlab.innovatek.com:platform/project-atlas.git', 'evidence');
                    e.printLine('  remote "origin" = git@gitlab.innovatek.com:ml-research/beacon-models.git', 'evidence');
                    e.printLine('  branch "main" merge = refs/heads/main', 'node-info');
                    e.printLine('', 'system');
                    e.printLine('  [Source file paths]', 'heading');
                    e.printLine('  src/ml-pipeline/training/atlas_trainer.py', 'node-info');
                    e.printLine('  src/ml-pipeline/inference/beacon_predictor.py', 'node-info');
                    e.printLine('  src/data-processor/etl/customer_pipeline.py', 'node-info');
                    e.printLine('  models/production/beacon-v3.2.onnx', 'node-info');
                    e.printLine('', 'system');
                    e.printLine('  [API keys and secrets]', 'heading');
                    e.printLine('  AWS_ACCESS_KEY_ID=AKIA3EXAMPLE7KEYID', 'warning');
                    e.printLine('  AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLE', 'warning');
                    e.printLine('  STRIPE_SECRET_KEY=sk_live_51ExAmPlEkEy', 'warning');
                    e.printLine('  DATABASE_URL=postgres://prod:ExAmPlEpAsS@db.innovatek.com:5432/atlas', 'warning');
                    e.printLine('', 'system');
                    e.printLine('[!] Production API keys and database credentials found on USB drive', 'warning');
                    e.printLine('[!] Git remote URLs confirm repos cloned from InnovaTek GitLab', 'warning');
                } else if (cellType === 'suspect-workstation') {
                    e.printLine('Running strings on recovered deleted archives...', 'system');
                    e.printLine('', 'system');
                    e.printLine('  [Archive headers]', 'heading');
                    e.printLine('  project-atlas.tar.gz -- gzip compressed, original size 1.1 GB', 'node-info');
                    e.printLine('  beacon-ml-models.tar.gz -- gzip compressed, original size 2.3 GB', 'node-info');
                    e.printLine('', 'system');
                    e.printLine('  [Embedded file paths]', 'heading');
                    e.printLine('  project-atlas/.git/config', 'node-info');
                    e.printLine('  project-atlas/src/ml-pipeline/', 'node-info');
                    e.printLine('  beacon-models/models/production/', 'node-info');
                    e.printLine('  [!] Deleted archives match USB drive contents exactly', 'warning');
                } else {
                    e.printLine('Running strings on "' + args.join(' ') + '"...', 'system');
                    e.printLine('', 'system');
                    e.printLine('  No high-value strings extracted at this location.', 'system');
                    e.printLine('  Try: strings at USB-FORENSICS or SUSPECT-WS nodes.', 'info');
                }
                e.printLine('', 'system');
            }
        },

        // --- REPORT (investigation summary -- requires all prior objectives) ---
        'report': {
            help: 'File investigation report (requires: 5+ sources, exfil ID, timeline, badge+USB correlation)',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;

                // Check prerequisites
                var missing = [];
                if (!s.fiveSourcesExamined) missing.push('Examine 5+ evidence sources (have ' + s.sourcesExamined.length + ')');
                if (!s.exfilMethodFound) missing.push('Identify exfiltration method (examine SUSPECT-WS + NETWORK-TAP)');
                if (!s.timelineBuilt) missing.push('Build forensic timeline (timeline command)');
                if (!s.badgeUsbCorrelated) missing.push('Correlate badge + USB evidence (correlate badge usb)');

                if (missing.length > 0) {
                    e.printLine('Cannot file report. Outstanding requirements:', 'warning');
                    e.printLine('', 'system');
                    for (var m = 0; m < missing.length; m++) {
                        e.printLine('  [ ] ' + missing[m], 'error');
                    }
                    e.printLine('', 'system');
                    e.printLine('Complete all objectives before filing the report.', 'system');
                    return;
                }

                e.printLine('', 'system');
                e.printLine('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550', 'heading');
                e.printLine('  INSIDER THREAT INVESTIGATION REPORT', 'heading');
                e.printLine('  Case: IT-2026-0193 | Classification: CONFIDENTIAL', 'heading');
                e.printLine('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550', 'heading');
                e.printLine('', 'system');
                e.printLine('Report generated: ' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC', 'system');
                e.printLine('Lead investigator: Digital Forensics Examiner', 'system');
                e.printLine('', 'system');

                e.printLine('1. SUBJECT', 'heading');
                e.printLine('   Marcus Chen (EMP-4471), Senior Software Developer', 'info');
                e.printLine('   Department: Engineering -- Platform Team', 'info');
                e.printLine('   Employment: 2022-06-15 to 2026-03-10 (resigned)', 'info');
                e.printLine('', 'system');

                e.printLine('2. EVIDENCE SOURCES EXAMINED (' + s.sourcesExamined.length + ')', 'heading');
                for (var i = 0; i < s.sourcesExamined.length; i++) {
                    var node = s.sourcesExamined[i];
                    e.printLine('   [+] ' + (c.sourceMap[node] || node), 'info');
                }
                e.printLine('', 'system');

                e.printLine('3. FINDINGS', 'heading');
                e.printLine('   a) Exfiltration method: Dual-path (USB physical media + cloud storage)', 'evidence');
                e.printLine('      - 64GB USB drive: 51.2 GB of proprietary source code, ML models, API keys', 'node-info');
                e.printLine('      - Google Drive: 312 MB (project-atlas archive)', 'node-info');
                e.printLine('      - Mega.nz: 489 MB (beacon-models archive)', 'node-info');
                e.printLine('      - Personal VPN: 1.2 GB transferred through encrypted tunnel', 'node-info');
                e.printLine('      - Personal GitHub: Code pushed to mchen-private account', 'node-info');
                e.printLine('', 'system');
                e.printLine('   b) Physical access correlation:', 'evidence');
                e.printLine('      - Badge entry 2026-02-28 11:47 PM + USB insertion 11:52 PM (5-min delta)', 'node-info');
                e.printLine('      - 6 after-hours sessions in 10 days vs. 0.2/month baseline', 'node-info');
                e.printLine('', 'system');
                e.printLine('   c) Motive and destination:', 'evidence');
                e.printLine('      - Accepted offer at Nexagen Technologies (direct competitor)', 'node-info');
                e.printLine('      - Sent code samples to Nexagen contact (j.walsh@nexagen-tech.com)', 'node-info');
                e.printLine('      - Competitor explicitly referenced proprietary project in recruitment', 'node-info');
                e.printLine('', 'system');
                e.printLine('   d) Anti-forensic actions:', 'evidence');
                e.printLine('      - Deleted source archives from workstation', 'node-info');
                e.printLine('      - Cleared .bash_history', 'node-info');
                e.printLine('      - Used Mega.nz (E2E encrypted) to avoid DLP inspection', 'node-info');
                e.printLine('      - Established personal VPN tunnel to bypass monitoring', 'node-info');
                e.printLine('', 'system');

                e.printLine('4. EVIDENCE INTEGRITY', 'heading');
                e.printLine('   USB image SHA-256: 7a2f8c41b3e960d5f1284a7c9e03b6d8...', 'info');
                e.printLine('   Workstation image SHA-256: e4b1a3c5d7f90628a1c3e5b7d9f02a4c...', 'info');
                e.printLine('   All evidence hashed at intake. Chain of custody maintained.', 'info');
                e.printLine('', 'system');

                e.printLine('5. CONCLUSION', 'heading');
                e.printLine('   The evidence establishes that Marcus Chen conducted a deliberate,', 'success');
                e.printLine('   multi-week campaign to exfiltrate proprietary intellectual property', 'success');
                e.printLine('   including source code, ML models, production credentials, and', 'success');
                e.printLine('   confidential business documents prior to departing for a direct', 'success');
                e.printLine('   competitor. Actions violate the signed NDA, non-compete agreement,', 'success');
                e.printLine('   and acceptable use policy. Recommend immediate legal referral.', 'success');
                e.printLine('', 'system');

                e.printLine('6. RECOMMENDATIONS', 'heading');
                e.printLine('   - Revoke all credentials and API keys found on USB', 'info');
                e.printLine('   - Rotate production database credentials immediately', 'info');
                e.printLine('   - Issue legal hold notice to Nexagen Technologies', 'info');
                e.printLine('   - Preserve all evidence per litigation hold procedures', 'info');
                e.printLine('   - Brief executive team and legal counsel', 'info');
                e.printLine('', 'system');

                e.printLine('\u2550\u2550\u2550 REPORT FILED \u2550\u2550\u2550', 'heading');
                e.printLine('', 'system');

                s.reportFiled = true;
                e.checkObjectives(); e.updateGrid(); e.saveState();
            }
        },

        // --- STATUS (override: investigation-specific display) ---
        'status': {
            help: 'Show investigation status and objectives',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];
                var posLabel = (cellType !== 'empty' && cellType !== 'wall') ? c.nodes[cellType].label : 'Corridor';
                var examined = s.sourcesExamined.length;

                e.printLine('', 'system');
                e.printLine('\u2550\u2550\u2550 INVESTIGATION STATUS \u2550\u2550\u2550', 'heading');
                e.printLine('Case: IT-2026-0193 | Subject: Marcus Chen (EMP-4471)', 'info');
                e.printLine('Position:  (' + s.position.col + ',' + s.position.row + ') \u2014 ' + posLabel, 'info');
                e.printLine('Sources examined: ' + examined + ' / 10', 'info');
                e.printLine('Commands issued:  ' + s.agentCmdCount, 'info');
                e.printLine('', 'system');
                e.printLine('Investigation flags:', 'heading');
                e.printLine('  5+ sources examined:   ' + (s.fiveSourcesExamined ? 'YES' : 'no  (' + examined + '/5)'), s.fiveSourcesExamined ? 'success' : 'system');
                e.printLine('  Exfil method ID\'d:     ' + (s.exfilMethodFound ? 'YES' : 'no'), s.exfilMethodFound ? 'success' : 'system');
                e.printLine('  Timeline built:        ' + (s.timelineBuilt ? 'YES' : 'no'), s.timelineBuilt ? 'success' : 'system');
                e.printLine('  Badge+USB correlated:  ' + (s.badgeUsbCorrelated ? 'YES' : 'no'), s.badgeUsbCorrelated ? 'success' : 'system');
                e.printLine('  Report filed:          ' + (s.reportFiled ? 'YES' : 'no'), s.reportFiled ? 'success' : 'system');
                e.printLine('', 'system');
                e.printLine('Objectives:', 'heading');
                var objText = [
                    'Examine 5+ evidence sources',
                    'Identify the exfiltration method (examine SUSPECT-WS + NETWORK-TAP)',
                    'Establish the forensic timeline (timeline command, 3+ sources first)',
                    'Correlate badge + USB evidence (correlate badge usb)',
                    'File the investigation report (report command, all above first)'
                ];
                for (var j = 0; j < s.objectives.length; j++) {
                    e.printLine((s.objectives[j] ? ' [X] ' : ' [ ] ') + objText[j], s.objectives[j] ? 'success' : 'system');
                }
                e.printLine('', 'system');
                if (examined > 0) {
                    e.printLine('Sources examined so far:', 'heading');
                    for (var k = 0; k < s.sourcesExamined.length; k++) {
                        var src = s.sourcesExamined[k];
                        e.printLine('  [+] ' + (c.nodes[src] ? c.nodes[src].label : src), 'info');
                    }
                }
            }
        }
    }
};
