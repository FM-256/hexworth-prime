/* ================================================================
   FIREWALL-01: Perimeter Check -- Mission Config
   ================================================================
   Terminal-mode mission. Custom commands: ids, rules, block,
   allow, test, flush.
   ================================================================ */

var FIREWALL_01_CONFIG = (function() {

    // Runtime storage for custom firewall rules (not serializable state)
    var customRules = [];

    function padRight(str, len) { str = String(str); while (str.length < len) str += ' '; return str; }

    function resolveIP(query, nodes) {
        var q = query.toLowerCase();
        for (var key in nodes) {
            var info = nodes[key];
            if (q === key || q === info.label.toLowerCase() || q === info.ip || q === info.abbr.toLowerCase()) return info;
        }
        return null;
    }

    function buildRuleset(defaultRules) {
        var rules = [];
        customRules.forEach(function(r, i) { rules.push({ id: i + 1, action: r.action, src: r.src, dst: r.dst, port: r.port, proto: r.proto }); });
        defaultRules.forEach(function(r) { rules.push({ id: rules.length + 1, action: r.action, src: r.src, dst: r.dst, port: r.port, proto: r.proto }); });
        return rules;
    }

    return {
        id: 'firewall-01',
        missionTitle: 'FIREWALL-01',
        title: 'Perimeter Check',
        subtitle: 'Firewall hardened. Perimeter secured.',
        category: 'firewall-ops',
        difficulty: 1,
        inputMode: 'terminal',
        promptText: 'admin@fw-01:~$ ',
        promptLabel: 'TERMINAL',

        grid: {
            rows: 4,
            cols: 5,
            start: { col: 1, row: 1 },
            cells: [
                ['internet',    'empty',       'dmz-web',     'dmz-mail',    'wall'],
                ['empty',       'firewall',    'empty',       'ids-sensor',  'attacker'],
                ['wall',        'internal-db', 'empty',       'empty',       'wall'],
                ['wall',        'wall',        'admin-ws',    'wall',        'wall']
            ]
        },

        nodes: {
            'internet':    { label: 'INTERNET',    abbr: 'WAN', ip: '0.0.0.0',       desc: 'WAN uplink -- untrusted zone',                  os: 'N/A' },
            'dmz-web':     { label: 'DMZ-WEB',     abbr: 'WEB', ip: '172.16.0.10',   desc: 'Public web server in DMZ',                     os: 'Nginx / Ubuntu 22.04' },
            'dmz-mail':    { label: 'DMZ-MAIL',    abbr: 'MX',  ip: '172.16.0.20',   desc: 'Mail server in DMZ',                           os: 'Postfix / Debian 12' },
            'firewall':    { label: 'FIREWALL',    abbr: 'FW1', ip: '10.0.0.1',      desc: 'Primary perimeter firewall',                   os: 'pfSense 2.7.0' },
            'ids-sensor':  { label: 'IDS-SENSOR',  abbr: 'IDS', ip: '10.0.0.5',      desc: 'Suricata intrusion detection sensor',          os: 'Suricata 7.0' },
            'attacker':    { label: 'ATTACKER',    abbr: 'ATK', ip: '203.0.113.66',  desc: 'Hostile external host -- port scanning',        os: 'Unknown' },
            'internal-db': { label: 'INT-DB',      abbr: 'DB',  ip: '192.168.1.50',  desc: 'Internal MySQL database server',               os: 'MySQL 8.0 / RHEL 9' },
            'admin-ws':    { label: 'ADMIN-WS',    abbr: 'ADM', ip: '192.168.1.100', desc: 'Firewall admin workstation',                   os: 'Windows 11 Pro' }
        },

        traps: [],
        gates: {},

        objectives: [
            { id: 'ids-checked',    label: 'Check IDS alerts',               check: 'alertsChecked' },
            { id: 'attacker-block', label: 'Block attacker IP',              check: 'attackerBlocked' },
            { id: 'web-allow',      label: 'Allow web traffic to DMZ',       check: 'webAllowed' },
            { id: 'db-secure',      label: 'Verify DB unreachable from WAN', check: 'dbSecured' }
        ],

        integrity: 3,

        completion: {
            title: 'PERIMETER',
            subtitle: 'Firewall hardened. Perimeter secured.',
            storageKey: 'hexworth_operator_firewall01'
        },

        // Default firewall rules for display
        defaultRules: [
            { id: 1, action: 'ALLOW', src: 'any',             dst: '172.16.0.10', port: '80',  proto: 'TCP' },
            { id: 2, action: 'ALLOW', src: 'any',             dst: '172.16.0.10', port: '443', proto: 'TCP' },
            { id: 3, action: 'ALLOW', src: 'any',             dst: '172.16.0.20', port: '25',  proto: 'TCP' },
            { id: 4, action: 'ALLOW', src: '192.168.1.0/24', dst: 'any',         port: 'any', proto: 'any' },
            { id: 5, action: 'DENY',  src: 'any',             dst: 'any',         port: 'any', proto: 'any' }
        ],

        // Custom state fields
        customState: {
            alertsChecked: false,
            attackerBlocked: false,
            webAllowed: false,
            dbSecured: false
        },

        // Status fields for TerminalInterpreter status command
        statusFields: [
            { key: 'attackerBlocked', label: 'Attacker (203.0.113.66)', trueText: 'BLOCKED', falseText: 'ACTIVE' }
        ],

        // Mission briefing lines (plain text -- box drawn by TerminalInterpreter)
        briefing: [
            'Hostile traffic detected on the WAN.',
            'Check the IDS. Block the attacker.',
            'Harden the perimeter. Verify access.'
        ],

        commands: ['scan', 'move', 'rules', 'block', 'allow', 'test', 'ids', 'flush', 'status', 'help', 'clear'],

        // ----------------------------------------------------------------
        //  TERMINAL COMMANDS
        // ----------------------------------------------------------------

        terminalCommands: {

            // --- SCAN (override: shows OS field) ---
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
                        e.printLine('OS: ' + cur.os, 'node-info');
                    } else { e.printLine('Current: Clear path', 'heading'); }
                    e.printLine('', 'system');
                    e.printLine('Adjacent:', 'heading');
                    var dirs = [{ name: 'North', dc: 0, dr: -1 }, { name: 'South', dc: 0, dr: 1 }, { name: 'East', dc: 1, dr: 0 }, { name: 'West', dc: -1, dr: 0 }];
                    dirs.forEach(function(d) {
                        var nc = col + d.dc, nr = row + d.dr;
                        if (nc < 0 || nc >= c.grid.cols || nr < 0 || nr >= c.grid.rows) { e.printLine('  ' + d.name + ': [network edge]', 'system'); return; }
                        var type = c.grid.cells[nr][nc];
                        if (type === 'wall') { e.printLine('  ' + d.name + ': [blocked]', 'system'); return; }
                        var key = nc + ',' + nr;
                        if (!s.visibility[key] || s.visibility[key] === 'hidden') s.visibility[key] = 'revealed';
                        if (type === 'empty') { e.printLine('  ' + d.name + ': Clear path', 'info'); }
                        else { var info = c.nodes[type]; e.printLine('  ' + d.name + ': ' + info.label + ' (' + info.ip + ')', 'node-info'); }
                    });
                    e.updateGrid();
                    e.saveState();
                }
            },

            // --- MOVE (override: preserves original output style) ---
            'move': {
                help: 'Move agent (north/south/east/west or n/s/e/w)', syntax: 'move <dir>',
                handler: function(args, ctx) {
                    var e = ctx.engine, s = ctx.state, c = ctx.config;
                    if (!args.length) { e.printLine('Usage: move <direction>', 'error'); return; }
                    var dirMap = { 'north': [0,-1], 'n': [0,-1], 'south': [0,1], 's': [0,1], 'east': [1,0], 'e': [1,0], 'west': [-1,0], 'w': [-1,0] };
                    var dir = args[0].toLowerCase();
                    if (!dirMap[dir]) { e.printLine('Unknown direction: ' + args[0], 'error'); return; }
                    var d = dirMap[dir];
                    var newCol = s.position.col + d[0], newRow = s.position.row + d[1];
                    if (newCol < 0 || newCol >= c.grid.cols || newRow < 0 || newRow >= c.grid.rows) { e.printLine('Edge of network.', 'error'); return; }
                    var cellType = c.grid.cells[newRow][newCol];
                    if (cellType === 'wall') { e.printLine('Blocked.', 'error'); return; }
                    s.position = { col: newCol, row: newRow };
                    s.visibility[newCol + ',' + newRow] = 'visited';
                    if (cellType !== 'empty') s.nodesDiscovered.add(cellType);
                    e.revealAdjacent(newCol, newRow);
                    var dirFull = { n: 'north', s: 'south', e: 'east', w: 'west' };
                    var dirName = dirFull[dir] || dir;
                    if (cellType === 'empty') { e.printLine('Moving ' + dirName + '... Clear path.', 'system'); }
                    else { var info = c.nodes[cellType]; e.printLine('Moving ' + dirName + '... ' + info.label + ' (' + info.ip + ')', 'success'); e.printLine(info.desc, 'info'); }
                    e.checkObjectives();
                    e.updateGrid();
                    e.saveState();
                }
            },

            // --- STATUS (override: firewall-specific display) ---
            'status': {
                help: 'Show position and objectives',
                handler: function(args, ctx) {
                    var e = ctx.engine, s = ctx.state, c = ctx.config;
                    var cellType = c.grid.cells[s.position.row][s.position.col];
                    var posLabel = (cellType !== 'empty' && cellType !== 'wall') ? c.nodes[cellType].label : 'Clear';
                    e.printLine('', 'system');
                    e.printLine('\u2550\u2550\u2550 STATUS \u2550\u2550\u2550', 'heading');
                    e.printLine('Position: (' + s.position.col + ',' + s.position.row + ') \u2014 ' + posLabel, 'info');
                    e.printLine('Nodes discovered: ' + s.nodesDiscovered.size + ' / 8', 'info');
                    e.printLine('Attacker (203.0.113.66): ' + (s.attackerBlocked ? 'BLOCKED' : 'ACTIVE'), s.attackerBlocked ? 'success' : 'warning');
                    e.printLine('', 'system');
                    e.printLine('Objectives:', 'heading');
                    var objText = ['Check IDS alerts', 'Block attacker IP (203.0.113.66)', 'Allow web traffic to DMZ (172.16.0.10)', 'Verify DB unreachable from WAN (port 3306)'];
                    s.objectives.forEach(function(done, i) { e.printLine((done ? ' [X] ' : ' [ ] ') + objText[i], done ? 'success' : 'system'); });
                }
            },

            // --- RULES ---
            'rules': {
                help: 'Display current firewall ruleset',
                handler: function(args, ctx) {
                    var e = ctx.engine, c = ctx.config;
                    var ruleset = buildRuleset(c.defaultRules);
                    e.printLine('', 'system');
                    e.printLine('\u2550\u2550\u2550 FIREWALL RULES (FW1 / 10.0.0.1) \u2550\u2550\u2550', 'heading');
                    e.printLine(padRight('#', 4) + padRight('ACTION', 8) + padRight('SRC', 20) + padRight('DST', 20) + padRight('PORT', 8) + 'PROTO', 'heading');
                    e.printLine('\u2500'.repeat(65), 'system');
                    ruleset.forEach(function(r) {
                        e.printLine(padRight(r.id, 4) + padRight(r.action, 8) + padRight(r.src, 20) + padRight(r.dst, 20) + padRight(r.port, 8) + r.proto, r.action === 'DENY' ? 'error' : 'node-info');
                    });
                    if (customRules.length > 0) e.printLine('(' + customRules.length + ' custom rule(s) active)', 'warning');
                }
            },

            // --- BLOCK ---
            'block': {
                help: 'Add DENY rule for a source IP', syntax: 'block <ip>',
                handler: function(args, ctx) {
                    var e = ctx.engine, s = ctx.state;
                    if (!args.length) { e.printLine('Usage: block <ip>', 'error'); return; }
                    var ip = args[0];
                    if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) { e.printLine('Invalid IP address: ' + ip, 'error'); return; }
                    var already = customRules.some(function(r) { return r.action === 'DENY' && r.src === ip; });
                    if (already) { e.printLine('Rule already exists: DENY ' + ip, 'warning'); return; }
                    customRules.unshift({ action: 'DENY', src: ip, dst: 'any', port: 'any', proto: 'any' });
                    e.printLine('', 'system');
                    e.printLine('Rule added: DENY ' + ip + ' any any any', 'success');
                    if (ip === '203.0.113.66') {
                        s.attackerBlocked = true;
                        e.printLine('[!] Hostile source 203.0.113.66 neutralized.', 'success');
                        e.updateGrid();
                    }
                    e.checkObjectives();
                    e.saveState();
                }
            },

            // --- ALLOW ---
            'allow': {
                help: 'Add ALLOW rule for destination IP and port', syntax: 'allow <ip> <port>',
                handler: function(args, ctx) {
                    var e = ctx.engine, s = ctx.state;
                    if (args.length < 2) { e.printLine('Usage: allow <dst-ip> <port>', 'error'); return; }
                    var ip = args[0], port = args[1];
                    if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) { e.printLine('Invalid IP: ' + ip, 'error'); return; }
                    if (!/^\d+$/.test(port)) { e.printLine('Invalid port: ' + port, 'error'); return; }
                    var portNum = parseInt(port, 10);
                    if (portNum < 1 || portNum > 65535) { e.printLine('Port out of range: ' + port, 'error'); return; }
                    var already = customRules.some(function(r) { return r.action === 'ALLOW' && r.dst === ip && r.port === port; });
                    if (already) { e.printLine('Rule already exists: ALLOW any ' + ip + ' ' + port, 'warning'); return; }
                    customRules.unshift({ action: 'ALLOW', src: 'any', dst: ip, port: port, proto: 'TCP' });
                    e.printLine('', 'system');
                    e.printLine('Rule added: ALLOW any ' + ip + ' ' + port + ' TCP', 'success');
                    if (ip === '172.16.0.10' && (port === '80' || port === '443')) {
                        s.webAllowed = true;
                        e.printLine('[!] DMZ web server traffic verified.', 'success');
                    }
                    e.checkObjectives();
                    e.saveState();
                }
            },

            // --- TEST ---
            'test': {
                help: 'Test connectivity (name or IP, port number)', syntax: 'test <src> <dst> <port>',
                handler: function(args, ctx) {
                    var e = ctx.engine, s = ctx.state, c = ctx.config;
                    if (args.length < 3) { e.printLine('Usage: test <src> <dst> <port>', 'error'); return; }
                    var port = args[2];
                    if (!/^\d+$/.test(port)) { e.printLine('Invalid port: ' + port, 'error'); return; }
                    var srcInfo = resolveIP(args[0], c.nodes), dstInfo = resolveIP(args[1], c.nodes);
                    var srcLabel = srcInfo ? srcInfo.label : args[0].toUpperCase();
                    var srcIp = srcInfo ? srcInfo.ip : args[0];
                    var dstLabel = dstInfo ? dstInfo.label : args[1].toUpperCase();
                    var dstIp = dstInfo ? dstInfo.ip : args[1];
                    e.printLine('', 'system');
                    e.printLine('Testing: ' + srcLabel + ' (' + srcIp + ') \u2192 ' + dstLabel + ' (' + dstIp + ') port ' + port, 'heading');
                    // Attacker blocked
                    if ((srcIp === '203.0.113.66' || args[0].toLowerCase() === 'attacker') && s.attackerBlocked) {
                        e.printLine('Result: DENIED \u2014 source 203.0.113.66 is blocked.', 'error'); return;
                    }
                    // WAN to DB
                    var isWan = (srcIp === '0.0.0.0' || args[0].toLowerCase() === 'internet' || args[0].toLowerCase() === 'wan');
                    var isDb = (dstIp === '192.168.1.50' || args[1].toLowerCase() === 'internal-db' || args[1].toLowerCase() === 'db' || args[1].toLowerCase() === 'int-db');
                    if (isWan && isDb) {
                        e.printLine('Result: DENIED \u2014 no route from WAN to internal DB.', 'error');
                        if (!s.dbSecured) { s.dbSecured = true; e.printLine('[!] Confirmed: Internal database unreachable from WAN.', 'success'); e.checkObjectives(); }
                        return;
                    }
                    if (isWan && dstIp.indexOf('192.168.') === 0) { e.printLine('Result: DENIED \u2014 WAN to internal blocked.', 'error'); return; }
                    if (srcIp.indexOf('192.168.1.') === 0) { e.printLine('Result: ALLOWED \u2014 internal source allowed.', 'success'); return; }
                    if (dstIp === '172.16.0.10' && (port === '80' || port === '443')) { e.printLine('Result: ALLOWED \u2014 DMZ web traffic.', 'success'); return; }
                    if (dstIp === '172.16.0.20' && port === '25') { e.printLine('Result: ALLOWED \u2014 DMZ mail traffic.', 'success'); return; }
                    e.printLine('Result: DENIED \u2014 default deny.', 'error');
                }
            },

            // --- IDS ---
            'ids': {
                help: 'Check IDS/Suricata alerts',
                handler: function(args, ctx) {
                    var e = ctx.engine, s = ctx.state;
                    e.printLine('', 'system');
                    e.printLine('\u2550\u2550\u2550 IDS ALERTS \u2014 SURICATA 7.0 (10.0.0.5) \u2550\u2550\u2550', 'heading');
                    e.printLine('Last updated: ' + new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC', 'system');
                    e.printLine('', 'system');
                    e.printLine('[ALERT] ET SCAN Nmap SYN Scan', 'warning');
                    e.printLine('  src: 203.0.113.66 \u2192 dst: 172.16.0.10  port: 80', 'node-info');
                    e.printLine('  priority: HIGH | sid: 2000537', 'system');
                    e.printLine('', 'system');
                    e.printLine('[ALERT] ET SCAN Potential SSH Brute Force', 'warning');
                    e.printLine('  src: 203.0.113.66 \u2192 dst: 10.0.0.1     port: 22', 'node-info');
                    e.printLine('  priority: HIGH | sid: 2001219', 'system');
                    e.printLine('', 'system');
                    e.printLine('[ALERT] ET POLICY Possible SQL Injection Attempt', 'warning');
                    e.printLine('  src: 203.0.113.66 \u2192 dst: 172.16.0.10  port: 80', 'node-info');
                    e.printLine('  priority: CRITICAL | sid: 2006445', 'system');
                    e.printLine('', 'system');
                    e.printLine('3 active alerts. Hostile source: 203.0.113.66', 'error');
                    e.printLine('Recommended action: block 203.0.113.66', 'info');
                    if (!s.alertsChecked) {
                        s.alertsChecked = true;
                        e.printLine('', 'system');
                        e.printLine('[!] IDS review complete. Alerts logged.', 'success');
                        e.checkObjectives();
                    }
                    e.saveState();
                }
            },

            // --- FLUSH ---
            'flush': {
                help: 'Flush all custom rules (reset to defaults)',
                handler: function(args, ctx) {
                    var e = ctx.engine, s = ctx.state;
                    if (customRules.length === 0) { e.printLine('No custom rules to flush.', 'system'); return; }
                    var count = customRules.length;
                    customRules = [];
                    s.attackerBlocked = false;
                    s.webAllowed = false;
                    e.printLine('Flushed ' + count + ' custom rule(s). Reverting to defaults.', 'warning');
                    e.printLine('WARNING: Attacker 203.0.113.66 is no longer blocked.', 'error');
                    e.checkObjectives();
                    e.updateGrid();
                    e.saveState();
                }
            }
        }
    };

})();
