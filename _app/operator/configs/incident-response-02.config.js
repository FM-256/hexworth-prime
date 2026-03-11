/* ================================================================
   IR-02: Ransomware Dawn -- Mission Config
   ================================================================
   Terminal-mode mission. Active ransomware on corporate network.
   Custom commands: isolate, analyze, restore, trace, contain.
   Overrides: scan, move, status (IR-flavored output).
   File shares encrypting. Lateral movement detected.
   ================================================================ */

// Proximity helpers (used by isolate, analyze, restore, contain)
function _ir02_isNearNode(nodeType, state, config) {
    for (var r = 0; r < config.grid.rows; r++) {
        for (var col = 0; col < config.grid.cols; col++) {
            if (config.grid.cells[r][col] !== nodeType) continue;
            var dc = Math.abs(state.position.col - col), dr = Math.abs(state.position.row - r);
            if ((dc === 0 && dr === 0) || (dc + dr === 1)) return true;
        }
    }
    return false;
}

function _ir02_isOnNode(nodeType, state, config) {
    return config.grid.cells[state.position.row][state.position.col] === nodeType;
}

var IR_02_CONFIG = {
    id: 'incident-response-02',
    missionTitle: 'IR-02',
    title: 'Ransomware Dawn',
    subtitle: 'Active ransomware. Contain spread. Find patient zero. Sever C2.',
    category: 'incident-response',
    difficulty: 3,
    inputMode: 'terminal',
    promptText: 'responder@ir:~$ ',
    promptLabel: 'TERMINAL',

    grid: {
        rows: 4,
        cols: 5,
        cells: [
            ['file-server',  'email-gateway', 'empty',         'wall',          'wall'],
            ['empty',        'ad-controller', 'empty',          'workstation-a', 'wall'],
            ['wall',         'empty',         'patient-zero',   'empty',         'workstation-b'],
            ['wall',         'backup-vault',  'empty',          'c2-server',     'empty']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'file-server':    { label: 'FILE-SERVER',    abbr: 'FSV', ip: '10.1.0.10',      desc: 'Primary file share -- SMB, currently encrypting',           ports: ['22/SSH','445/SMB','139/NetBIOS'],            os: 'Windows Server 2019' },
        'email-gateway':  { label: 'EMAIL-GW',       abbr: 'EGW', ip: '10.1.0.5',       desc: 'Email gateway -- inbound/outbound mail filtering',          ports: ['25/SMTP','143/IMAP','443/HTTPS'],            os: 'Proofpoint Appliance' },
        'ad-controller':  { label: 'AD-CONTROLLER',  abbr: 'ADC', ip: '10.1.0.2',       desc: 'Active Directory domain controller',                       ports: ['53/DNS','88/Kerberos','389/LDAP','445/SMB'], os: 'Windows Server 2022' },
        'workstation-a':  { label: 'WORKSTATION-A',  abbr: 'WKA', ip: '10.1.1.50',      desc: 'Finance department workstation',                           ports: ['135/RPC','445/SMB','3389/RDP'],              os: 'Windows 11 Pro' },
        'patient-zero':   { label: 'PATIENT-ZERO',   abbr: 'PZ0', ip: '10.1.1.25',      desc: 'First infected machine -- phishing email origin',           ports: ['135/RPC','445/SMB','3389/RDP','4444/BACKDOOR'], os: 'Windows 11 Pro' },
        'workstation-b':  { label: 'WORKSTATION-B',  abbr: 'WKB', ip: '10.1.1.60',      desc: 'HR department workstation -- encrypted files found',        ports: ['135/RPC','445/SMB','3389/RDP'],              os: 'Windows 11 Pro' },
        'backup-vault':   { label: 'BACKUP-VAULT',   abbr: 'BKV', ip: '10.1.0.200',     desc: 'Offline backup storage -- Veeam repository',               ports: ['22/SSH','9392/VEEAM-API'],                   os: 'Ubuntu 22.04 LTS' },
        'c2-server':      { label: 'C2-SERVER',       abbr: 'C2S', ip: '185.147.xx.xx',  desc: 'External command & control server -- encrypted beacon',     ports: ['443/HTTPS','8443/C2-BEACON'],                os: 'Unknown (external)' }
    },

    traps: [],
    gates: {},

    objectives: [
        { id: 'isolate-fs',     label: 'Isolate file server',       check: 'fileServerIsolated' },
        { id: 'patient-zero',   label: 'Identify patient zero',     check: 'patientZeroIdentified' },
        { id: 'verify-backup',  label: 'Verify backups',            check: 'backupVerified' },
        { id: 'block-c2',       label: 'Block C2 communication',    check: 'c2Blocked' }
    ],

    integrity: 3,

    completion: {
        title: 'RANSOMWARE DAWN',
        subtitle: 'Incident contained. Ransomware neutralized.',
        storageKey: 'hexworth_operator_ir02'
    },

    briefing: [
        'Active ransomware on corporate network.',
        'File shares encrypting. Lateral movement',
        'detected. Contain the spread. Find patient',
        'zero. Verify backups. Cut off C2 comms.'
    ],

    commands: ['scan', 'move', 'isolate', 'analyze', 'restore', 'trace', 'contain', 'status', 'help', 'clear'],

    customState: {
        fileServerIsolated: false,
        patientZeroIdentified: false,
        backupVerified: false,
        c2Blocked: false,
        infectionChain: []
    },

    /* ================================================================
       terminalCommands -- all mission-specific + overridden commands
       Handlers receive (args, ctx) where ctx = { engine, state, config, agent }
       ================================================================ */
    terminalCommands: {

        // --- Override: scan (IR-flavored output) ---
        'scan': {
            help: 'Survey area, reveal adjacent nodes',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var col = s.position.col, row = s.position.row;
                var cellType = c.grid.cells[row][col];

                e.printLine('Scanning area...', 'system');
                e.printLine('', 'system');

                if (cellType !== 'empty' && cellType !== 'wall') {
                    var cur = c.nodes[cellType];
                    e.printLine('Current: ' + cur.label + ' (' + cur.ip + ')', 'heading');
                    e.printLine(cur.desc, 'info');
                } else {
                    e.printLine('Current: Clear path (no node)', 'heading');
                }

                e.printLine('', 'system');
                e.printLine('Adjacent:', 'heading');

                var dirs = [{name:'North',dc:0,dr:-1},{name:'South',dc:0,dr:1},{name:'East',dc:1,dr:0},{name:'West',dc:-1,dr:0}];
                for (var i = 0; i < dirs.length; i++) {
                    var d = dirs[i], nc = col + d.dc, nr = row + d.dr;
                    if (nc < 0 || nc >= c.grid.cols || nr < 0 || nr >= c.grid.rows) {
                        e.printLine('  ' + d.name + ': [network edge]', 'system');
                        continue;
                    }
                    var type = c.grid.cells[nr][nc];
                    if (type === 'wall') { e.printLine('  ' + d.name + ': [blocked]', 'system'); continue; }
                    var key = nc + ',' + nr;
                    if (!s.visibility[key] || s.visibility[key] === 'hidden') s.visibility[key] = 'revealed';
                    if (type === 'empty') e.printLine('  ' + d.name + ': Clear path', 'info');
                    else { var info = c.nodes[type]; e.printLine('  ' + d.name + ': ' + info.label + ' (' + info.ip + ')', 'node-info'); }
                }

                e.updateGrid(); e.saveState();
            }
        },

        // --- Override: move (IR-flavored output) ---
        'move': {
            help: 'Move agent (north/south/east/west or n/s/e/w)',
            syntax: 'move <dir>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;

                if (!args.length) { e.printLine('Usage: move <direction>', 'error'); return; }

                var dirMap = {'north':[0,-1],'n':[0,-1],'south':[0,1],'s':[0,1],'east':[1,0],'e':[1,0],'west':[-1,0],'w':[-1,0]};
                var dir = args[0].toLowerCase();
                if (!dirMap[dir]) { e.printLine('Unknown direction: ' + args[0], 'error'); return; }

                var d = dirMap[dir], nc = s.position.col + d[0], nr = s.position.row + d[1];
                if (nc < 0 || nc >= c.grid.cols || nr < 0 || nr >= c.grid.rows) { e.printLine('Edge of network. Cannot move ' + dir + '.', 'error'); return; }

                var cellType = c.grid.cells[nr][nc];
                if (cellType === 'wall') { e.printLine('Blocked. No traversable path ' + dir + '.', 'error'); return; }

                s.position = { col: nc, row: nr };
                s.visibility[nc + ',' + nr] = 'visited';
                if (cellType !== 'empty') s.nodesDiscovered.add(cellType);
                e.revealAdjacent(nc, nr);

                var dirName = {n:'north',s:'south',e:'east',w:'west'}[dir] || dir;
                if (cellType === 'empty') e.printLine('Moving ' + dirName + '... Clear path.', 'system');
                else { var info = c.nodes[cellType]; e.printLine('Moving ' + dirName + '... ' + info.label + ' (' + info.ip + ')', 'success'); e.printLine(info.desc, 'info'); }

                e.checkObjectives(); e.updateGrid(); e.saveState();
            }
        },

        // --- Override: status (IR-specific containment status) ---
        'status': {
            help: 'Show position and incident response status',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];
                var posLabel = (cellType !== 'empty' && cellType !== 'wall') ? c.nodes[cellType].label : 'Clear';

                e.printLine('', 'system');
                e.printLine('\u2550\u2550\u2550 INCIDENT RESPONSE STATUS \u2550\u2550\u2550', 'heading');
                e.printLine('Position: (' + s.position.col + ',' + s.position.row + ') -- ' + posLabel, 'info');
                e.printLine('Nodes mapped: ' + s.nodesDiscovered.size + ' / 8', 'info');
                e.printLine('Commands issued: ' + s.agentCmdCount, 'info');
                e.printLine('', 'system');
                e.printLine('CONTAINMENT:', 'heading');
                e.printLine('  File server isolated:  ' + (s.fileServerIsolated ? 'YES -- encryption halted' : 'NO -- still encrypting'), s.fileServerIsolated ? 'success' : 'warning');
                e.printLine('  Patient zero ID\'d:     ' + (s.patientZeroIdentified ? 'YES -- CryptoLock v3.1 via phishing' : 'NO -- run analyze on patient-zero'), s.patientZeroIdentified ? 'success' : 'warning');
                e.printLine('  Backup verified:       ' + (s.backupVerified ? 'YES -- 03/04 02:00 clean restore point' : 'NO -- go to BACKUP-VAULT'), s.backupVerified ? 'success' : 'warning');
                e.printLine('  C2 blocked:            ' + (s.c2Blocked ? 'YES -- beacon severed' : 'NO -- beacon active to 185.147.xx.xx'), s.c2Blocked ? 'success' : 'warning');
                e.printLine('', 'system');
                e.printLine('Objectives:', 'heading');
                var objText = ['Isolate the file server', 'Identify patient zero', 'Verify backup integrity', 'Block C2 communication'];
                for (var j = 0; j < c.objectives.length; j++) {
                    var done = s.objectives[j];
                    e.printLine((done ? ' [X] ' : ' [ ] ') + objText[j], done ? 'success' : 'system');
                }
            }
        },

        // --- isolate: isolate a node from the network ---
        'isolate': {
            help: 'Isolate a node from the network',
            syntax: 'isolate <node>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;

                if (!args.length) { e.printLine('Usage: isolate <node>', 'error'); return; }

                var target = args.join(' '), node = e.resolveNode(target);
                if (!node) { e.printLine('isolate: unknown node: ' + target, 'error'); return; }

                var dc = Math.abs(s.position.col - node.col), dr = Math.abs(s.position.row - node.row);
                var inRange = (dc === 0 && dr === 0) || (dc + dr === 1);
                if (!inRange) {
                    e.printLine('isolate: must be adjacent to or on ' + node.info.label + '.', 'error');
                    e.printLine('Navigate closer to the target node first.', 'system');
                    return;
                }

                switch (node.type) {
                    case 'file-server':
                        if (s.fileServerIsolated) { e.printLine('FILE-SERVER is already isolated from the network.', 'warning'); }
                        else {
                            e.printLine('Isolating FILE-SERVER from network...', 'system');
                            e.printLine('SMB connections severed. Port 445 blocked at switch level.', 'info');
                            e.printLine('NetBIOS traffic dropped. Port 139 null-routed.', 'info');
                            e.printLine('Encryption halted. No new files are being affected.', 'success');
                            s.fileServerIsolated = true;
                            e.checkObjectives();
                        }
                        break;
                    case 'workstation-a':
                        e.printLine('Isolating WORKSTATION-A from network...', 'system');
                        e.printLine('RDP session terminated. SMB access revoked.', 'info');
                        e.printLine('Finance workstation quarantined.', 'info');
                        break;
                    case 'workstation-b':
                        e.printLine('Isolating WORKSTATION-B from network...', 'system');
                        e.printLine('RDP session terminated. SMB access revoked.', 'info');
                        e.printLine('HR workstation quarantined. Encrypted files preserved for forensics.', 'info');
                        break;
                    case 'patient-zero':
                        e.printLine('Isolating PATIENT-ZERO from network...', 'system');
                        e.printLine('All connections severed. Backdoor port 4444 blocked.', 'info');
                        e.printLine('Machine quarantined for forensic analysis.', 'info');
                        break;
                    case 'ad-controller':
                        e.printLine('[!] WARNING: Isolating AD-CONTROLLER will disrupt domain auth.', 'warning');
                        e.printLine('Recommend targeted firewall rules instead of full isolation.', 'warning');
                        e.printLine('No action taken. Specify a different target.', 'system');
                        break;
                    default:
                        e.printLine('isolate: ' + node.info.label + ' is not a valid isolation target.', 'error');
                }

                e.saveState();
            }
        },

        // --- analyze: deep investigation of current node ---
        'analyze': {
            help: 'Deep investigation of current node',
            syntax: 'analyze <node>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var isOnNode = _ir02_isOnNode;

                if (!args.length) { e.printLine('Usage: analyze <node>', 'error'); return; }

                var target = args.join(' '), node = e.resolveNode(target);
                if (!node) { e.printLine('analyze: unknown node: ' + target, 'error'); return; }

                if (!isOnNode(node.type, s, c)) {
                    e.printLine('analyze: must be ON ' + node.info.label + ' to run deep analysis.', 'error');
                    e.printLine('Current position: (' + s.position.col + ',' + s.position.row + ')', 'system');
                    return;
                }

                e.printLine('', 'system');
                e.printLine('Running deep analysis on ' + node.info.label + '...', 'system');
                e.printLine('', 'system');

                switch (node.type) {
                    case 'patient-zero':
                        e.printLine('HOST: ' + node.info.label + ' (' + node.info.ip + ')', 'heading');
                        e.printLine('OS: ' + node.info.os, 'node-info');
                        e.printLine('', 'system');
                        e.printLine('INFECTION TIMELINE:', 'heading');
                        e.printLine('  03/04 14:22  Phishing email received from: billing@corp-invoices.ru', 'warning');
                        e.printLine('  03/04 14:24  Macro-enabled document opened: invoice_march.xlsm', 'warning');
                        e.printLine('  03/04 14:24  Dropper executed: CryptoLock v3.1 payload deployed', 'warning');
                        e.printLine('  03/04 14:25  C2 beacon established: 185.147.xx.xx:8443 (TLS)', 'warning');
                        e.printLine('  03/04 14:38  Lateral movement via SMB to FILE-SERVER (10.1.0.10)', 'warning');
                        e.printLine('  03/04 14:45  Lateral movement via SMB to WORKSTATION-A (10.1.1.50)', 'warning');
                        e.printLine('  03/04 15:02  Lateral movement via SMB to WORKSTATION-B (10.1.1.60)', 'warning');
                        e.printLine('', 'system');
                        e.printLine('MALWARE DETAILS:', 'heading');
                        e.printLine('  Family:    CryptoLock v3.1 (Ransomware-as-a-Service)', 'node-info');
                        e.printLine('  Ransom:    $250,000 BTC to wallet 1A9fBm...kR3', 'node-info');
                        e.printLine('  Extension: .cl0ck appended to encrypted files', 'node-info');
                        e.printLine('  Exclusions: C:\\Windows\\, C:\\Program Files\\', 'node-info');
                        e.printLine('', 'system');
                        e.printLine('[!] Patient zero identified. Infection vector confirmed.', 'success');
                        s.patientZeroIdentified = true;
                        e.checkObjectives();
                        break;
                    case 'file-server':
                        e.printLine('HOST: ' + node.info.label + ' (' + node.info.ip + ')', 'heading');
                        e.printLine('OS: ' + node.info.os, 'node-info');
                        e.printLine('', 'system');
                        e.printLine('STATUS:', 'heading');
                        if (s.fileServerIsolated) {
                            e.printLine('  Network: ISOLATED -- no active connections', 'success');
                            e.printLine('  Encryption: HALTED', 'success');
                        } else {
                            e.printLine('  Network: ACTIVE -- SMB sessions in progress', 'warning');
                            e.printLine('  Encryption: ACTIVE -- files being encrypted', 'warning');
                        }
                        e.printLine('  Shares: \\\\FSV\\finance, \\\\FSV\\shared, \\\\FSV\\archive', 'info');
                        e.printLine('  Encrypted files: ~14,800 (est.)', 'warning');
                        e.printLine('  Extension: .cl0ck', 'warning');
                        break;
                    case 'email-gateway':
                        e.printLine('HOST: ' + node.info.label + ' (' + node.info.ip + ')', 'heading');
                        e.printLine('OS: ' + node.info.os, 'node-info');
                        e.printLine('', 'system');
                        e.printLine('INBOUND LOG (last 24h):', 'heading');
                        e.printLine('  Delivered:  12,847 messages', 'info');
                        e.printLine('  Quarantine:     231 messages', 'info');
                        e.printLine('  [!] MISSED:       1 message -- macro-enabled attachment bypassed sandbox', 'warning');
                        e.printLine('  Subject: "March Invoice - Action Required"', 'warning');
                        e.printLine('  From:    billing@corp-invoices.ru', 'warning');
                        e.printLine('  Attachment: invoice_march.xlsm (macro-enabled Excel)', 'warning');
                        break;
                    case 'ad-controller':
                        e.printLine('HOST: ' + node.info.label + ' (' + node.info.ip + ')', 'heading');
                        e.printLine('OS: ' + node.info.os, 'node-info');
                        e.printLine('', 'system');
                        e.printLine('ACTIVE DIRECTORY STATUS:', 'heading');
                        e.printLine('  Domain: corp.internal', 'info');
                        e.printLine('  Users: 347 active accounts', 'info');
                        e.printLine('  [!] Suspicious Kerberoasting attempt detected at 14:30', 'warning');
                        e.printLine('  [!] Service account "svc_backup" queried from 10.1.1.25', 'warning');
                        e.printLine('  Recommend: reset svc_backup credentials immediately.', 'warning');
                        break;
                    case 'backup-vault':
                        e.printLine('HOST: ' + node.info.label + ' (' + node.info.ip + ')', 'heading');
                        e.printLine('OS: ' + node.info.os, 'node-info');
                        e.printLine('', 'system');
                        e.printLine('BACKUP STATUS:', 'heading');
                        e.printLine('  Last full backup:  03/04 02:00 (pre-infection)', 'info');
                        e.printLine('  Incremental:       03/04 14:00 (may contain encrypted files)', 'warning');
                        e.printLine('  Use "restore" to verify backup integrity.', 'system');
                        break;
                    case 'c2-server':
                        e.printLine('HOST: ' + node.info.label + ' (' + node.info.ip + ')', 'heading');
                        e.printLine('OS: ' + node.info.os, 'node-info');
                        e.printLine('', 'system');
                        e.printLine('EXTERNAL HOST ANALYSIS:', 'heading');
                        e.printLine('  IP: 185.147.xx.xx -- registered in: RU / AS9123', 'warning');
                        e.printLine('  Beacon protocol: HTTPS/TLS (port 8443)', 'warning');
                        e.printLine('  Heartbeat interval: 60 seconds', 'warning');
                        e.printLine('  Threat intel: Known CryptoLock C2 infrastructure', 'warning');
                        if (s.c2Blocked) e.printLine('  Status: BLOCKED -- firewall rule active', 'success');
                        else {
                            e.printLine('  Status: ACTIVE -- beacon traffic flowing', 'warning');
                            e.printLine('  Use "contain" to block C2 communication.', 'info');
                        }
                        break;
                    default:
                        var nfo = node.info;
                        e.printLine('HOST: ' + nfo.label + ' (' + nfo.ip + ')', 'heading');
                        e.printLine('OS: ' + nfo.os, 'node-info');
                        e.printLine('Desc: ' + nfo.desc, 'info');
                        e.printLine('Open ports:', 'heading');
                        for (var p = 0; p < nfo.ports.length; p++) e.printLine('  ' + nfo.ports[p], 'node-info');
                }

                e.printLine('', 'system');
                e.saveState();
            }
        },

        // --- restore: verify backup integrity at BACKUP-VAULT ---
        'restore': {
            help: 'Verify backup integrity (must be at BACKUP-VAULT)',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var isOnNode = _ir02_isOnNode;

                if (!isOnNode('backup-vault', s, c)) {
                    e.printLine('restore: must be at BACKUP-VAULT node.', 'error');
                    e.printLine('Navigate to BACKUP-VAULT (BKV) and run restore again.', 'system');
                    return;
                }
                if (s.backupVerified) { e.printLine('Backup integrity already verified. CLEAN restore point confirmed.', 'success'); return; }

                e.printLine('', 'system');
                e.printLine('Verifying backup integrity...', 'system');
                e.printLine('Connecting to Veeam repository at 10.1.0.200:9392...', 'system');
                e.printLine('', 'system');
                e.printLine('BACKUP CATALOG:', 'heading');
                e.printLine('  Full backup    03/04 02:00  Size: 2.3 TB  Status: CLEAN', 'success');
                e.printLine('  Incremental    03/04 14:00  Size: 47 GB   Status: SUSPECT (post-infection window)', 'warning');
                e.printLine('', 'system');
                e.printLine('Running SHA-256 integrity check on full backup...', 'system');
                e.printLine('  Checking: \\\\FSV\\finance     [OK]', 'info');
                e.printLine('  Checking: \\\\FSV\\shared      [OK]', 'info');
                e.printLine('  Checking: \\\\FSV\\archive     [OK]', 'info');
                e.printLine('', 'system');
                e.printLine('BACKUP VERIFIED. Clean restore point confirmed: 03/04 02:00.', 'success');
                e.printLine('Ready for restoration when containment is complete.', 'info');
                s.backupVerified = true;
                e.checkObjectives(); e.saveState();
            }
        },

        // --- trace: trace infection chain (requires patient zero ID) ---
        'trace': {
            help: 'Trace infection chain (requires patient zero ID)',
            syntax: 'trace',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state;

                if (!s.patientZeroIdentified) {
                    e.printLine('trace: cannot trace infection chain.', 'error');
                    e.printLine('Identify patient zero first (analyze patient-zero).', 'system');
                    return;
                }

                e.printLine('', 'system');
                e.printLine('Tracing infection chain...', 'system');
                e.printLine('', 'system');
                e.printLine('INFECTION PROPAGATION:', 'heading');
                e.printLine('  PZ0  (10.1.1.25)  14:22  Initial compromise via phishing email', 'warning');
                e.printLine('   |', 'system');
                e.printLine('   +-> FSV  (10.1.0.10)  14:38  Lateral: SMB share enumeration + credential reuse', 'warning');
                e.printLine('   |', 'system');
                e.printLine('   +-> WKA  (10.1.1.50)  14:45  Lateral: SMB from finance share mount', 'warning');
                e.printLine('   |', 'system');
                e.printLine('   +-> WKB  (10.1.1.60)  15:02  Lateral: SMB from shared drive access', 'warning');
                e.printLine('', 'system');
                e.printLine('TIMELINE SUMMARY:', 'heading');
                e.printLine('  Duration from initial compromise to full spread: 40 minutes', 'node-info');
                e.printLine('  Total affected hosts: 4', 'node-info');
                e.printLine('  C2 active since: 14:25 (185.147.xx.xx:8443)', 'node-info');
                e.printLine('', 'system');
                if (s.infectionChain.length === 0) s.infectionChain = ['PZ0', 'FSV', 'WKA', 'WKB'];
                e.saveState();
            }
        },

        // --- contain: block C2 communication (must be near C2-SERVER) ---
        'contain': {
            help: 'Block C2 communication (must be near C2-SERVER)',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var isNearNode = _ir02_isNearNode;

                if (!isNearNode('c2-server', s, c)) {
                    e.printLine('contain: must be near C2-SERVER node.', 'error');
                    e.printLine('Navigate to or adjacent to C2-SERVER and run contain again.', 'system');
                    return;
                }
                if (s.c2Blocked) { e.printLine('C2 communication is already blocked. Firewall rule active.', 'success'); return; }

                e.printLine('', 'system');
                e.printLine('Deploying firewall rule...', 'system');
                e.printLine('  BLOCK outbound 185.147.xx.xx ANY (all ports)', 'info');
                e.printLine('  BLOCK inbound  185.147.xx.xx ANY (all ports)', 'info');
                e.printLine('  Applying to: edge firewall, all VLANs', 'info');
                e.printLine('', 'system');
                e.printLine('Monitoring beacon traffic...', 'system');
                e.printLine('  08:443 heartbeat -- DROPPED', 'info');
                e.printLine('  08:443 heartbeat -- DROPPED', 'info');
                e.printLine('  08:443 heartbeat -- DROPPED', 'info');
                e.printLine('', 'system');
                e.printLine('C2 beacon silenced. Ransomware cut off from command server.', 'success');
                e.printLine('Decryption key delivery blocked. Attacker cannot issue new commands.', 'success');
                s.c2Blocked = true;
                e.checkObjectives();
                e.printLine('', 'system');
                e.saveState();
            }
        }
    }
};
