/* ================================================================
   IR-01: Breach Protocol -- Mission Config
   ================================================================
   Terminal-mode mission. Incident response lifecycle.
   Custom commands: logs, isolate, contain, eradicate, restore.
   Overrides: scan (no checkObjectives), move (no traps/gates),
              ping (isolated host logic), status (IR lifecycle),
              help (IR-specific reference).
   IR lifecycle: Identify > Contain > Eradicate > Recover.
   ================================================================ */

var IR_01_CONFIG = {
    id: 'incident-response-01',
    missionTitle: 'IR-01',
    title: 'Breach Protocol',
    subtitle: 'Active ransomware detected. Contain, eradicate, recover.',
    category: 'incident-response',
    difficulty: 2,
    inputMode: 'terminal',
    promptText: 'soc-analyst@siem:~$ ',
    promptLabel: 'TERMINAL',
    notFoundMsg: 'Unknown command: {cmd}\nType "help" for available commands.',

    grid: {
        rows: 4,
        cols: 5,
        cells: [
            ['siem',  'empty',       'web-server',  'app-server',      'wall'],
            ['empty', 'core-switch', 'empty',       'infected-server', 'wall'],
            ['wall',  'firewall',    'empty',       'database',        'backup'],
            ['wall',  'wall',        'honeypot',    'wall',            'wall']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'siem':            { label: 'SIEM',      abbr: 'SIM', ip: '10.1.0.5',   desc: 'Splunk SIEM -- central log aggregation',  ports: ['8000/SPLUNK-WEB','8089/SPLUNK-API','9997/FORWARDER'], os: 'CentOS Stream 9' },
        'web-server':      { label: 'WEB-SRV',   abbr: 'WEB', ip: '10.1.0.20',  desc: 'Customer-facing web server',              ports: ['80/HTTP','443/HTTPS','22/SSH'],                       os: 'Ubuntu 22.04 LTS' },
        'app-server':      { label: 'APP-SRV',   abbr: 'APP', ip: '10.1.0.25',  desc: 'Internal application server',             ports: ['8080/HTTP','8443/HTTPS','22/SSH'],                    os: 'RHEL 9.3' },
        'core-switch':     { label: 'CORE-SW',   abbr: 'CSW', ip: '10.1.0.1',   desc: 'Core network switch -- L3 VLAN routing',  ports: ['22/SSH','161/SNMP','443/HTTPS-MGMT'],                 os: 'Cisco IOS-XE 17.9' },
        'infected-server': { label: 'INFECTED',  abbr: 'INF', ip: '10.1.0.30',  desc: 'Compromised server -- ransomware detected', ports: ['22/SSH','445/SMB','4444/REVERSE-SHELL'],            os: 'Ubuntu 20.04 LTS' },
        'firewall':        { label: 'FIREWALL',  abbr: 'FWL', ip: '10.1.0.254', desc: 'Perimeter firewall -- Palo Alto',          ports: ['443/HTTPS-MGMT','22/SSH'],                           os: 'PAN-OS 11.1' },
        'database':        { label: 'DB-SRV',    abbr: 'DBS', ip: '10.1.0.40',  desc: 'Production database server',               ports: ['5432/PostgreSQL','22/SSH'],                          os: 'Ubuntu 22.04 LTS' },
        'backup':          { label: 'BACKUP',    abbr: 'BAK', ip: '10.1.0.50',  desc: 'Air-gapped backup server',                 ports: ['22/SSH','9392/VEEAM'],                               os: 'Windows Server 2022' },
        'honeypot':        { label: 'HONEYPOT',  abbr: 'HPT', ip: '10.1.0.99',  desc: 'Decoy server -- attacker bait',            ports: ['22/SSH','80/HTTP','445/SMB','3389/RDP'],              os: 'T-Pot Honeypot' }
    },

    traps: [],
    gates: {},

    objectives: [
        { id: 'threat-id',    label: 'Identify threat vector',   check: 'threatIdentified' },
        { id: 'isolate-host', label: 'Isolate infected host',    check: 'hostIsolated' },
        { id: 'eradicate',    label: 'Eradicate malware',        check: 'malwareEradicated' },
        { id: 'restore',      label: 'Restore from backup',      check: 'backupRestored' }
    ],

    integrity: 3,

    completion: {
        title: 'BREACH PROTOCOL',
        subtitle: 'Breach contained and resolved. Well done, analyst.',
        storageKey: 'hexworth_operator_ir01'
    },

    briefing: [
        'CRITICAL ALERT: Ransomware detected on',
        '10.1.0.30 (INFECTED). Lateral movement',
        'suspected. Follow IR lifecycle:',
        'Identify > Contain > Eradicate > Recover.'
    ],

    commands: ['scan', 'move', 'ping', 'logs', 'isolate', 'contain', 'eradicate', 'restore', 'status', 'help', 'clear'],

    // Custom state fields beyond engine baseline
    customState: {
        threatIdentified: false,
        hostIsolated: false,
        malwareEradicated: false,
        backupRestored: false,
        firewallContained: false
    },

    // ----------------------------------------------------------------
    //  TERMINAL COMMANDS (override standard + domain-specific)
    // ----------------------------------------------------------------

    terminalCommands: {

        // --- SCAN (override: no checkObjectives, simpler) ---
        'scan': {
            help: 'Survey area, reveal adjacent nodes',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var col = s.position.col, row = s.position.row, cellType = c.grid.cells[row][col];
                e.printLine('Scanning area...', 'system'); e.printLine('', 'system');
                if (cellType !== 'empty' && cellType !== 'wall') {
                    var cur = c.nodes[cellType]; e.printLine('Current: ' + cur.label + ' (' + cur.ip + ')', 'heading'); e.printLine(cur.desc, 'info');
                } else e.printLine('Current: Clear path (no node)', 'heading');
                e.printLine('', 'system'); e.printLine('Adjacent:', 'heading');
                var dirs = [{name:'North',dc:0,dr:-1},{name:'South',dc:0,dr:1},{name:'East',dc:1,dr:0},{name:'West',dc:-1,dr:0}];
                for (var i = 0; i < dirs.length; i++) {
                    var d = dirs[i], nc = col + d.dc, nr = row + d.dr;
                    if (nc < 0 || nc >= c.grid.cols || nr < 0 || nr >= c.grid.rows) { e.printLine('  ' + d.name + ': [network edge]', 'system'); continue; }
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

        // --- MOVE (override: no traps/gates, simpler) ---
        'move': {
            help: 'Move agent (north/south/east/west or n/s/e/w)', syntax: 'move <dir>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: move <direction>', 'error'); return; }
                var dirMap = {'north':[0,-1],'n':[0,-1],'south':[0,1],'s':[0,1],'east':[1,0],'e':[1,0],'west':[-1,0],'w':[-1,0]};
                var dir = args[0].toLowerCase(); if (!dirMap[dir]) { e.printLine('Unknown direction: ' + args[0], 'error'); return; }
                var d = dirMap[dir], nc = s.position.col + d[0], nr = s.position.row + d[1];
                if (nc < 0 || nc >= c.grid.cols || nr < 0 || nr >= c.grid.rows) { e.printLine('Edge of network. Cannot move ' + dir + '.', 'error'); return; }
                var cellType = c.grid.cells[nr][nc];
                if (cellType === 'wall') { e.printLine('Blocked. No traversable path ' + dir + '.', 'error'); return; }
                s.position = { col: nc, row: nr }; s.visibility[nc + ',' + nr] = 'visited';
                if (cellType !== 'empty') s.nodesDiscovered.add(cellType);
                e.revealAdjacent(nc, nr);
                var dirName = {n:'north',s:'south',e:'east',w:'west'}[dir] || dir;
                if (cellType === 'empty') e.printLine('Moving ' + dirName + '... Clear path.', 'system');
                else { var info = c.nodes[cellType]; e.printLine('Moving ' + dirName + '... ' + info.label + ' (' + info.ip + ')', 'success'); e.printLine(info.desc, 'info'); }
                e.updateGrid(); e.saveState();
            }
        },

        // --- PING (override: isolated host logic) ---
        'ping': {
            help: 'Check host status', syntax: 'ping <node>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state;
                if (!args.length) { e.printLine('Usage: ping <node name or IP>', 'error'); return; }
                var target = args.join(' '), node = e.resolveNode(target);
                if (!node) {
                    if (target.match(/^10\.1\.0\.\d+$/)) e.printLine('Request timed out. Host unreachable.', 'error');
                    else e.printLine('ping: unknown host ' + target, 'error');
                    return;
                }
                if (node.visibility === 'hidden') { e.printLine('Request timed out. No route to host.', 'error'); return; }
                if (node.type === 'infected-server' && s.hostIsolated) {
                    e.printLine('PING ' + node.info.ip + ' (' + node.info.label + ')', 'system');
                    if (s.malwareEradicated) { e.printLine('64 bytes from ' + node.info.ip + ': time=1.2ms', 'node-info'); e.printLine('Host is UP -- clean, awaiting restoration.', 'success'); }
                    else e.printLine('Host is ISOLATED. No network response (quarantined).', 'warning');
                    return;
                }
                var info = node.info, ms = (Math.random() * 5 + 0.5).toFixed(1);
                e.printLine('PING ' + info.ip + ' (' + info.label + ')', 'system');
                e.printLine('64 bytes from ' + info.ip + ': time=' + ms + 'ms', 'node-info');
                e.printLine('Host is UP -- ' + info.desc, 'info');
            }
        },

        // --- LOGS (domain-specific) ---
        'logs': {
            help: 'View SIEM logs for a node', syntax: 'logs <node>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: logs <node name or IP>', 'error'); return; }
                var target = args.join(' '), node = e.resolveNode(target);
                if (!node) {
                    if (target.match(/^10\.1\.0\.\d+$/)) e.printLine('No logs found for host ' + target + '.', 'error');
                    else e.printLine('logs: unknown host ' + target, 'error');
                    return;
                }
                if (node.visibility === 'hidden') { e.printLine('Cannot query logs. Node not yet discovered.', 'error'); return; }
                e.printLine('', 'system');

                if (node.type === 'infected-server') {
                    e.printLine('\u2550\u2550\u2550 SIEM LOG ANALYSIS: 10.1.0.30 (INFECTED) \u2550\u2550\u2550', 'heading');
                    e.printLine('', 'system');
                    e.printLine('[2026-03-04 02:14:33] SSH brute force detected -- 847 attempts from 198.51.100.77', 'warning');
                    e.printLine('[2026-03-04 02:18:01] SSH login SUCCESS -- root@10.1.0.30 from 198.51.100.77', 'error');
                    e.printLine('[2026-03-04 02:18:45] Suspicious binary download: /tmp/.x11-unix/svchost', 'error');
                    e.printLine('[2026-03-04 02:19:02] Outbound C2 beacon: 10.1.0.30 -> 198.51.100.77:4444', 'error');
                    e.printLine('[2026-03-04 02:22:15] Lateral movement attempt: SMB to 10.1.0.40 (DB-SRV)', 'warning');
                    e.printLine('[2026-03-04 02:23:01] Ransomware encryption started: /var/data/*', 'error');
                    e.printLine('[2026-03-04 02:25:00] Ransom note created: /var/data/README_DECRYPT.txt', 'error');
                    e.printLine('', 'system');
                    e.printLine('THREAT ASSESSMENT: Active ransomware. C2 channel open. Lateral movement in progress.', 'warning');
                    e.printLine('PRIORITY: CRITICAL -- Immediate containment required.', 'error');
                    if (!s.threatIdentified) { s.threatIdentified = true; e.checkObjectives(); }
                } else if (node.type === 'database') {
                    e.printLine('\u2550\u2550\u2550 SIEM LOG ANALYSIS: ' + node.info.ip + ' (' + node.info.label + ') \u2550\u2550\u2550', 'heading');
                    e.printLine('', 'system');
                    e.printLine('[2026-03-04 02:22:18] Inbound SMB connection attempt from 10.1.0.30', 'warning');
                    e.printLine('[2026-03-04 02:22:19] SMB authentication FAILED -- invalid credentials', 'info');
                    e.printLine('[2026-03-04 02:22:20] Connection reset by peer 10.1.0.30', 'info');
                    e.printLine('', 'system');
                    e.printLine('STATUS: Lateral movement blocked. No compromise detected.', 'success');
                } else if (node.type === 'web-server') {
                    e.printLine('\u2550\u2550\u2550 SIEM LOG ANALYSIS: ' + node.info.ip + ' (' + node.info.label + ') \u2550\u2550\u2550', 'heading');
                    e.printLine('', 'system');
                    e.printLine('[2026-03-04 01:00:00] Normal HTTPS traffic -- 1,247 requests/hr', 'info');
                    e.printLine('[2026-03-04 02:14:00] No anomalies detected on this host.', 'info');
                    e.printLine('', 'system');
                    e.printLine('STATUS: Clean. No indicators of compromise.', 'success');
                } else if (node.type === 'firewall') {
                    e.printLine('\u2550\u2550\u2550 SIEM LOG ANALYSIS: ' + node.info.ip + ' (' + node.info.label + ') \u2550\u2550\u2550', 'heading');
                    e.printLine('', 'system');
                    e.printLine('[2026-03-04 02:19:05] Outbound alert: 10.1.0.30:4444 -> 198.51.100.77:4444', 'warning');
                    e.printLine('[2026-03-04 02:22:16] SMB lateral: 10.1.0.30:445 -> 10.1.0.40:445', 'warning');
                    e.printLine('[2026-03-04 02:25:30] No block rules configured for internal C2 traffic.', 'error');
                    e.printLine('', 'system');
                    e.printLine('STATUS: Alerts firing but no containment rules active.', 'warning');
                } else if (node.type === 'honeypot') {
                    e.printLine('\u2550\u2550\u2550 SIEM LOG ANALYSIS: ' + node.info.ip + ' (' + node.info.label + ') \u2550\u2550\u2550', 'heading');
                    e.printLine('', 'system');
                    e.printLine('[2026-03-04 02:24:00] No attacker interaction detected on honeypot.', 'info');
                    e.printLine('', 'system');
                    e.printLine('STATUS: Quiet. Attacker has not probed decoy systems.', 'info');
                } else {
                    e.printLine('\u2550\u2550\u2550 SIEM LOG ANALYSIS: ' + node.info.ip + ' (' + node.info.label + ') \u2550\u2550\u2550', 'heading');
                    e.printLine('', 'system');
                    e.printLine('[2026-03-04 02:00:00] Normal operations. No alerts.', 'info');
                    e.printLine('', 'system');
                    e.printLine('STATUS: Clean. No indicators of compromise.', 'success');
                }
                e.printLine('', 'system');
                e.updateGrid(); e.saveState();
            }
        },

        // --- ISOLATE (domain-specific) ---
        'isolate': {
            help: 'Network isolate a compromised host', syntax: 'isolate <node>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state;
                if (!args.length) { e.printLine('Usage: isolate <node name or IP>', 'error'); return; }
                var target = args.join(' '), node = e.resolveNode(target);
                if (!node) { e.printLine('isolate: unknown host ' + target, 'error'); return; }
                if (node.type !== 'infected-server') { e.printLine('Cannot isolate ' + node.info.label + '. Only compromised hosts should be isolated.', 'warning'); return; }
                if (!s.threatIdentified) {
                    e.printLine('Cannot isolate yet. You must first identify the threat vector.', 'error');
                    e.printLine('Use: logs infected -- to analyze SIEM data for the compromised host.', 'info');
                    return;
                }
                if (s.hostIsolated) { e.printLine(node.info.label + ' is already isolated.', 'warning'); return; }
                e.printLine('', 'system');
                e.printLine('Isolating ' + node.info.ip + ' (' + node.info.label + ')...', 'system');
                e.printLine('  Disabling switch port Gi0/30...', 'info');
                e.printLine('  Blocking MAC on CORE-SW VLAN 10...', 'info');
                e.printLine('  Dropping all routes to 10.1.0.30...', 'info');
                e.printLine('  C2 channel 10.1.0.30:4444 -> 198.51.100.77:4444 SEVERED', 'warning');
                e.printLine('', 'system');
                e.printLine('HOST ISOLATED. ' + node.info.label + ' is now quarantined from the network.', 'success');
                s.hostIsolated = true;
                e.checkObjectives(); e.updateGrid(); e.saveState();
            }
        },

        // --- CONTAIN (domain-specific) ---
        'contain': {
            help: 'Activate firewall containment rules',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];
                if (cellType !== 'firewall') {
                    e.printLine('You must be at the FIREWALL node to activate containment rules.', 'error');
                    e.printLine('Current position: ' + (c.nodes[cellType] ? c.nodes[cellType].label : 'Clear'), 'system');
                    return;
                }
                if (s.firewallContained) { e.printLine('Firewall containment rules are already active.', 'warning'); return; }
                e.printLine('', 'system');
                e.printLine('Activating firewall containment rules...', 'system');
                e.printLine('  Rule 1: BLOCK outbound to 198.51.100.0/24 (C2 infrastructure)', 'info');
                e.printLine('  Rule 2: BLOCK SMB (445/tcp) between server VLANs', 'info');
                e.printLine('  Rule 3: ALERT on any new outbound connections from server VLAN', 'info');
                e.printLine('', 'system');
                e.printLine('CONTAINMENT ACTIVE. Firewall rules deployed.', 'success');
                s.firewallContained = true;
                e.updateGrid(); e.saveState();
            }
        },

        // --- ERADICATE (domain-specific) ---
        'eradicate': {
            help: 'Remove malware from isolated host',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];
                if (cellType !== 'infected-server') {
                    e.printLine('You must be at the INFECTED node to eradicate malware.', 'error');
                    e.printLine('Current position: ' + (c.nodes[cellType] ? c.nodes[cellType].label : 'Clear'), 'system');
                    return;
                }
                if (!s.hostIsolated) {
                    e.printLine('Cannot eradicate yet. The host must be isolated first.', 'error');
                    e.printLine('Use: isolate infected -- to quarantine the compromised host.', 'info');
                    return;
                }
                if (s.malwareEradicated) { e.printLine('Malware has already been eradicated from this host.', 'warning'); return; }
                e.printLine('', 'system');
                e.printLine('Beginning malware eradication on 10.1.0.30...', 'system');
                e.printLine('  Killing process: /tmp/.x11-unix/svchost (PID 31337)...', 'info');
                e.printLine('  Removing binary: /tmp/.x11-unix/svchost...', 'info');
                e.printLine('  Removing persistence: /etc/cron.d/.update...', 'info');
                e.printLine('  Removing persistence: /root/.ssh/authorized_keys (attacker key)...', 'info');
                e.printLine('  Removing ransom note: /var/data/README_DECRYPT.txt...', 'info');
                e.printLine('  Resetting root password...', 'info');
                e.printLine('  Disabling SSH root login...', 'info');
                e.printLine('', 'system');
                e.printLine('MALWARE ERADICATED. Host is clean but data remains encrypted.', 'success');
                e.printLine('Encrypted files require restoration from backup.', 'warning');
                s.malwareEradicated = true;
                e.checkObjectives(); e.updateGrid(); e.saveState();
            }
        },

        // --- RESTORE (domain-specific) ---
        'restore': {
            help: 'Restore a node from backup', syntax: 'restore <node>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: restore <node name or IP>', 'error'); return; }
                var target = args.join(' '), node = e.resolveNode(target);
                if (!node) { e.printLine('restore: unknown host ' + target, 'error'); return; }
                if (node.type !== 'infected-server') { e.printLine('Cannot restore ' + node.info.label + '. Only the infected host needs restoration.', 'warning'); return; }
                var cellType = c.grid.cells[s.position.row][s.position.col];
                if (cellType !== 'backup') {
                    e.printLine('You must be at the BACKUP node to initiate restoration.', 'error');
                    e.printLine('Current position: ' + (c.nodes[cellType] ? c.nodes[cellType].label : 'Clear'), 'system');
                    return;
                }
                if (!s.malwareEradicated) {
                    e.printLine('Cannot restore yet. Malware must be eradicated first.', 'error');
                    e.printLine('Navigate to INFECTED and run "eradicate" first.', 'info');
                    return;
                }
                if (s.backupRestored) { e.printLine('System has already been restored from backup.', 'warning'); return; }
                e.printLine('', 'system');
                e.printLine('Initiating restoration from BACKUP (10.1.0.50)...', 'system');
                e.printLine('  Connecting to Veeam backup repository...', 'info');
                e.printLine('  Verifying backup integrity: 2026-03-03 23:00 snapshot...', 'info');
                e.printLine('  SHA-256 checksum: VALID', 'info');
                e.printLine('  Restoring /var/data/ from clean snapshot...', 'info');
                e.printLine('  Files restored: 14,892 files (2.3 GB)', 'info');
                e.printLine('  Verifying restored data integrity...', 'info');
                e.printLine('', 'system');
                e.printLine('RESTORATION COMPLETE. All data recovered from clean backup.', 'success');
                s.backupRestored = true;
                e.checkObjectives(); e.saveState();
            }
        },

        // --- STATUS (override: IR lifecycle display) ---
        'status': {
            help: 'Show position and objectives',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];
                var posLabel = (cellType !== 'empty' && cellType !== 'wall') ? c.nodes[cellType].label : 'Clear';
                e.printLine('', 'system'); e.printLine('\u2550\u2550\u2550 IR STATUS \u2550\u2550\u2550', 'heading');
                e.printLine('Position: (' + s.position.col + ',' + s.position.row + ') -- ' + posLabel, 'info');
                e.printLine('Nodes discovered: ' + s.nodesDiscovered.size + ' / 9', 'info');
                e.printLine('Commands used: ' + s.agentCmdCount, 'info');
                e.printLine('', 'system');
                e.printLine('IR Status:', 'heading');
                e.printLine('  Threat identified: ' + (s.threatIdentified ? 'YES' : 'NO'), s.threatIdentified ? 'success' : 'warning');
                e.printLine('  Host isolated:     ' + (s.hostIsolated ? 'YES' : 'NO'), s.hostIsolated ? 'success' : 'warning');
                e.printLine('  Malware eradicated:' + (s.malwareEradicated ? ' YES' : ' NO'), s.malwareEradicated ? 'success' : 'warning');
                e.printLine('  Backup restored:   ' + (s.backupRestored ? 'YES' : 'NO'), s.backupRestored ? 'success' : 'warning');
                e.printLine('  Firewall rules:    ' + (s.firewallContained ? 'ACTIVE' : 'INACTIVE'), s.firewallContained ? 'success' : 'system');
                e.printLine('', 'system');
                e.printLine('Objectives:', 'heading');
                var objText = ['Identify threat vector', 'Isolate infected host', 'Eradicate malware', 'Restore from backup'];
                for (var j = 0; j < c.objectives.length; j++) {
                    var done = s.objectives[j];
                    e.printLine((done ? ' [X] ' : ' [ ] ') + objText[j], done ? 'success' : 'system');
                }
            }
        },

        // --- HELP (override: IR-specific reference) ---
        'help': {
            help: 'Show this reference',
            handler: function(args, ctx) {
                var e = ctx.engine;
                e.printLine('', 'system'); e.printLine('\u2550\u2550\u2550 COMMAND REFERENCE \u2550\u2550\u2550', 'heading');
                e.printLine('  scan              Survey area, reveal adjacent nodes', 'info');
                e.printLine('  move <dir>        Move agent (north/south/east/west or n/s/e/w)', 'info');
                e.printLine('  logs <node>       View SIEM logs for a node', 'info');
                e.printLine('  isolate <node>    Network isolate a compromised host', 'info');
                e.printLine('  contain           Activate firewall containment rules', 'info');
                e.printLine('  eradicate         Remove malware from isolated host', 'info');
                e.printLine('  restore <node>    Restore a node from backup', 'info');
                e.printLine('  ping <node>       Check host status', 'info');
                e.printLine('  status            Show position and objectives', 'info');
                e.printLine('  help              Show this reference', 'info');
                e.printLine('  clear             Clear terminal output', 'info');
                e.printLine('', 'system');
                e.printLine('IR lifecycle: Identify > Contain > Eradicate > Recover', 'system');
                e.printLine('Nodes: reference by name, abbreviation, or IP.', 'system');
            }
        }
    }
};
