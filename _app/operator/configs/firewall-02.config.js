/* ================================================================
   FIREWALL-02: Zero Day Response -- Mission Config
   ================================================================
   Terminal-mode mission. Custom commands: examine, analyze, rule,
   segment, block, verify.
   ================================================================ */

var FIREWALL_02_CONFIG = {
    id: 'firewall-02',
    missionTitle: 'FIREWALL-02',
    title: 'Zero Day Response',
    subtitle: 'Zero-day neutralized. Perimeter restored.',
    category: 'firewall-ops',
    difficulty: 2,
    inputMode: 'terminal',
    promptText: 'operator@waf:~$ ',
    promptLabel: 'TERMINAL',

    grid: {
        rows: 4,
        cols: 5,
        start: { col: 0, row: 0 },
        cells: [
            ['waf-logs',       'app-server',      'empty',          'wall',           'wall'],
            ['empty',          'load-balancer',   'empty',          'ids-sensor',     'wall'],
            ['wall',           'empty',           'rule-engine',    'empty',          'db-server'],
            ['wall',           'quarantine-zone', 'empty',          'egress-monitor', 'empty']
        ]
    },

    nodes: {
        'waf-logs':        { label: 'WAF-LOGS',      abbr: 'WAF', ip: '10.2.0.10',   desc: 'Web Application Firewall -- request/response logs',           ports: ['80/HTTP', '443/HTTPS'],                          os: 'ModSecurity 3.0' },
        'app-server':      { label: 'APP-SERVER',    abbr: 'APP', ip: '10.2.0.20',   desc: 'Production web application -- Node.js backend',               ports: ['443/HTTPS', '3000/API', '8080/DEBUG'],            os: 'Ubuntu 22.04 LTS' },
        'load-balancer':   { label: 'LOAD-BALANCER', abbr: 'LB',  ip: '10.2.0.5',    desc: 'L7 load balancer -- traffic distribution',                    ports: ['80/HTTP', '443/HTTPS', '8443/STATS'],             os: 'HAProxy 2.8' },
        'ids-sensor':      { label: 'IDS-SENSOR',    abbr: 'IDS', ip: '10.2.0.50',   desc: 'Intrusion Detection System -- packet analysis',               ports: ['N/A'],                                            os: 'Suricata 7.0' },
        'rule-engine':     { label: 'RULE-ENGINE',   abbr: 'RUL', ip: '10.2.0.10',   desc: 'WAF rule management -- signature updates',                    ports: ['443/HTTPS', '9090/MGMT'],                        os: 'ModSecurity 3.0' },
        'db-server':       { label: 'DB-SERVER',     abbr: 'DBS', ip: '10.2.1.100',  desc: 'Production database -- customer records',                     ports: ['5432/PostgreSQL', '6379/Redis'],                  os: 'RHEL 9.3' },
        'quarantine-zone': { label: 'QUARANTINE',    abbr: 'QRN', ip: '10.2.2.0/24', desc: 'Network quarantine -- isolated VLAN for analysis',            ports: ['N/A'],                                            os: 'VLAN 999' },
        'egress-monitor':  { label: 'EGRESS-MON',    abbr: 'EGR', ip: '10.2.0.254',  desc: 'Egress traffic monitor -- outbound data inspection',          ports: ['N/A'],                                            os: 'Zeek 6.0' }
    },

    traps: [],
    gates: {},

    objectives: [
        { id: 'attack-pattern',  label: 'ID attack pattern',  check: 'attackPatternFound' },
        { id: 'waf-rule',        label: 'Write WAF rule',     check: 'customRuleWritten' },
        { id: 'segment-db',      label: 'Segment database',   check: 'dbSegmented' },
        { id: 'verify-egress',   label: 'Verify egress',      check: 'egressVerified' }
    ],

    integrity: 3,

    completion: {
        title: 'ZERO DAY RESPONSE',
        subtitle: 'Zero-day neutralized. Perimeter restored.',
        storageKey: 'hexworth_operator_firewall02'
    },

    // Custom state fields
    customState: {
        attackPatternFound: false,
        attackSignature: null,
        customRuleWritten: false,
        dbSegmented: false,
        egressVerified: false
    },

    // Status fields for TerminalInterpreter status command
    statusFields: [
        { key: 'attackPatternFound', label: 'Attack pattern', trueText: 'YES', falseText: 'NO' },
        { key: 'customRuleWritten',  label: 'WAF rule',       trueText: 'YES', falseText: 'NO' },
        { key: 'dbSegmented',        label: 'DB segmented',   trueText: 'YES', falseText: 'NO' },
        { key: 'egressVerified',     label: 'Egress verified', trueText: 'YES', falseText: 'NO' }
    ],

    // Mission briefing lines (plain text -- box drawn by TerminalInterpreter)
    briefing: [
        'Zero-day WAF bypass detected.',
        'Encoded SQL injection evading signatures.',
        'Analyze. Write custom rules.',
        'Segment critical assets. Verify perimeter.'
    ],

    commands: ['scan', 'move', 'examine', 'analyze', 'rule', 'segment', 'block', 'verify', 'status', 'help', 'clear'],

    // ----------------------------------------------------------------
    //  TERMINAL COMMANDS
    // ----------------------------------------------------------------

    terminalCommands: {

        // --- SCAN (override: preserves original output style) ---
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
                } else { e.printLine('Current: Clear path (no node)', 'heading'); }
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
                e.updateGrid(); e.saveState();
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
                var d = dirMap[dir], newCol = s.position.col + d[0], newRow = s.position.row + d[1];
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
                e.checkObjectives(); e.updateGrid(); e.saveState();
            }
        },

        // --- STATUS (override: WAF-specific display) ---
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
                e.printLine('Attack pattern: ' + (s.attackPatternFound ? 'YES' : 'NO'), s.attackPatternFound ? 'success' : 'warning');
                e.printLine('WAF rule: ' + (s.customRuleWritten ? 'YES' : 'NO'), s.customRuleWritten ? 'success' : 'warning');
                e.printLine('DB segmented: ' + (s.dbSegmented ? 'YES' : 'NO'), s.dbSegmented ? 'success' : 'warning');
                e.printLine('Egress verified: ' + (s.egressVerified ? 'YES' : 'NO'), s.egressVerified ? 'success' : 'warning');
            }
        },

        // --- EXAMINE ---
        'examine': {
            help: 'Investigate current node in depth',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var type = c.grid.cells[s.position.row][s.position.col];
                if (type === 'empty' || type === 'wall') { e.printLine('Nothing notable here. Move to a node.', 'system'); return; }
                e.printLine('', 'system');
                switch (type) {
                    case 'waf-logs':
                        e.printLine('=== WAF REQUEST LOG ===', 'heading');
                        e.printLine('[03/05 02:14] POST /api/search \u2014 200 (PASSED)', 'node-info');
                        e.printLine('  Payload: {"q":"test\' OR 1=1--"}  \u2192 BLOCKED by rule 942100', 'info');
                        e.printLine('[03/05 02:15] POST /api/search \u2014 200 (PASSED)', 'node-info');
                        e.printLine('  Payload: {"q":"te%73t%27%20O%52%201%3D1%2D%2D"}  \u2192 NOT DETECTED  [BYPASS!]', 'warning');
                        e.printLine('[03/05 02:16] POST /api/users \u2014 200 (PASSED)', 'node-info');
                        e.printLine('  Payload: {"id":"1%27%20UN%49ON%20SE%4CECT%20*%2D%2D"}  \u2192 NOT DETECTED  [BYPASS!]', 'warning');
                        e.printLine('', 'system');
                        e.printLine('[!] CRITICAL: URL-encoded SQL injection bypassing signatures', 'error');
                        e.printLine('Pattern: Partial URL encoding of SQL keywords (OR\u2192O%52, UNION\u2192UN%49ON, SELECT\u2192SE%4CECT)', 'warning');
                        s.attackPatternFound = true;
                        s.attackSignature = 'partial-url-encode-sqli';
                        break;
                    case 'app-server':
                        e.printLine('=== APPLICATION SERVER STATUS ===', 'heading');
                        e.printLine('Service: hexworth-api (Node.js 20.11) | Status: RUNNING', 'node-info');
                        e.printLine("  [03/05 02:16] SQL error: syntax near '1 UNION SELECT *--'", 'warning');
                        e.printLine('[!] Application is processing injected SQL \u2014 WAF bypass confirmed', 'error');
                        break;
                    case 'load-balancer':
                        e.printLine('=== LOAD BALANCER STATUS ===', 'heading');
                        e.printLine('Backend pool: 3 servers | Active connections: 847 | Health: All UP', 'success');
                        e.printLine('Suspicious: 45.33.xx.xx \u2014 412 requests in last hour (10x normal)', 'warning');
                        break;
                    case 'ids-sensor':
                        e.printLine('=== IDS ALERTS ===', 'heading');
                        e.printLine('[03/05 02:14] SID:2001219 SQL Injection \u2192 BLOCKED', 'success');
                        e.printLine('[03/05 02:15-02:16] No alert \u2014 encoded payloads evaded signatures', 'error');
                        e.printLine('Detection gap: 14 requests undetected', 'warning');
                        break;
                    case 'rule-engine':
                        e.printLine('=== WAF RULE ENGINE ===', 'heading');
                        e.printLine('Active: OWASP CRS 3.3.5 (942xxx) + 12 custom rules', 'node-info');
                        e.printLine('  Missing: partial URL-encoding evasion  [GAP]', 'warning');
                        if (!s.attackPatternFound) e.printLine('No attack pattern identified yet. Examine WAF-LOGS first.', 'system');
                        else e.printLine('Use "rule <pattern>" to write a custom detection rule.', 'info');
                        break;
                    case 'db-server':
                        e.printLine('=== DATABASE SERVER ===', 'heading');
                        e.printLine('PostgreSQL 16.1 | Active connections: 12 (normal)', 'node-info');
                        e.printLine("  [02:16] SELECT * FROM users WHERE id='1' UNION SELECT *--", 'error');
                        e.printLine('[!] SQL injection reaching database \u2014 data exposure imminent', 'error');
                        e.printLine('Network: Same VLAN as app-server  [NOT SEGMENTED]', 'warning');
                        if (!s.dbSegmented) e.printLine('Use "segment db" to isolate the database.', 'info');
                        break;
                    case 'quarantine-zone':
                        e.printLine('=== QUARANTINE ZONE ===', 'heading');
                        e.printLine('VLAN 999 | Quarantined: ' + (s.dbSegmented ? 'DB-SERVER' : '(none)'), s.dbSegmented ? 'success' : 'info');
                        if (!s.dbSegmented) e.printLine('Available: segment db', 'info');
                        break;
                    case 'egress-monitor':
                        e.printLine('=== EGRESS MONITOR ===', 'heading');
                        e.printLine('[02:19] 10.2.0.20 \u2192 45.33.xx.xx:443 \u2014 2.1MB outbound  [SUSPICIOUS]', 'warning');
                        e.printLine('[02:21] 10.2.1.100 \u2192 45.33.xx.xx:8443 \u2014 12.3MB outbound  [CRITICAL]', 'error');
                        e.printLine('Total outbound to 45.33.xx.xx: 19.1MB in 3 minutes', 'error');
                        if (!s.egressVerified) {
                            if (s.customRuleWritten && s.dbSegmented) e.printLine('Prerequisites met. Use "verify" to confirm perimeter.', 'info');
                            else e.printLine('Complete WAF rule and DB segmentation first.', 'warning');
                        }
                        break;
                }
                e.printLine('', 'system');
                e.checkObjectives(); e.saveState();
            }
        },

        // --- ANALYZE ---
        'analyze': {
            help: 'Deep traffic analysis of a node', syntax: 'analyze <node>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state;
                if (!args.length) { e.printLine('Usage: analyze <node>', 'error'); return; }
                var target = args.join(' ').toLowerCase();
                e.printLine('', 'system');
                if (target.indexOf('waf') !== -1 || target.indexOf('log') !== -1) {
                    e.printLine('=== DEEP TRAFFIC ANALYSIS: WAF-LOGS ===', 'heading');
                    e.printLine('  %73=s  %27=\'  %20=SPACE  %52=R  %4C=L  %2D=-', 'info');
                    e.printLine('  te%73t%27%20O%52%201%3D1%2D%2D  \u2192  test\' OR 1=1--', 'error');
                    e.printLine('Bypass: Partial hex URL-encoding of keyword characters.', 'warning');
                    s.attackPatternFound = true;
                } else if (target.indexOf('egress') !== -1) {
                    e.printLine('=== DEEP TRAFFIC ANALYSIS: EGRESS-MONITOR ===', 'heading');
                    e.printLine('  Total exfiltrated: ~19.1MB over HTTPS to Tor-exit 45.33.xx.xx', 'error');
                } else { e.printLine('No deep analysis for "' + args.join(' ') + '". Try: analyze waf-logs', 'error'); }
                e.checkObjectives(); e.saveState();
            }
        },

        // --- RULE ---
        'rule': {
            help: 'Write a custom WAF rule (at RULE-ENGINE)', syntax: 'rule <pattern>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: rule <pattern>', 'error'); return; }
                var cellType = c.grid.cells[s.position.row][s.position.col];
                if (cellType !== 'rule-engine') { e.printLine('Must be at RULE-ENGINE node.', 'error'); return; }
                if (!s.attackPatternFound) { e.printLine('No attack pattern identified yet. Examine WAF-LOGS first.', 'warning'); return; }
                var ruleStr = args.join(' ').toLowerCase();
                var valid = ['url','encod','sqli','sql','inject','bypass','decode','percent','hex'].some(function(k) { return ruleStr.indexOf(k) !== -1; });
                if (!valid) { e.printLine('Rule pattern not specific enough. Try: rule block url-encoded sqli', 'warning'); return; }
                e.printLine('', 'system');
                e.printLine('Custom rule created:', 'heading');
                e.printLine('SecRule REQUEST_BODY "@rx (?i)(?:%[0-9a-f]{2}){2,}.*(?:union|select|insert|update|delete|drop)"', 'node-info');
                e.printLine('Testing: te%73t%27%20O%52 \u2192 BLOCKED', 'success');
                e.printLine('Custom rule effective.', 'success');
                s.customRuleWritten = true;
                e.checkObjectives(); e.updateGrid(); e.saveState();
            }
        },

        // --- SEGMENT ---
        'segment': {
            help: 'Isolate a network segment (at QUARANTINE or DB-SERVER)', syntax: 'segment <target>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var pos = c.grid.cells[s.position.row][s.position.col];
                if (pos !== 'quarantine-zone' && pos !== 'db-server') { e.printLine('Must be at QUARANTINE or DB-SERVER.', 'error'); return; }
                if (!args.length) { e.printLine('Usage: segment <target>', 'error'); return; }
                var target = args.join(' ').toLowerCase();
                if (['db','data','server','postgres','sql'].every(function(k) { return target.indexOf(k) === -1; })) { e.printLine('Unknown target. Try: segment db', 'error'); return; }
                if (s.dbSegmented) { e.printLine('Database already segmented.', 'info'); return; }
                e.printLine('Moving DB-SERVER to isolated VLAN 100.', 'node-info');
                e.printLine('Database segmented. Direct external access blocked.', 'success');
                s.dbSegmented = true;
                e.checkObjectives(); e.saveState();
            }
        },

        // --- BLOCK ---
        'block': {
            help: 'Block an IP address at the perimeter', syntax: 'block <ip>',
            handler: function(args, ctx) {
                var e = ctx.engine;
                if (!args.length) { e.printLine('Usage: block <ip>', 'error'); return; }
                e.printLine('Blocking ' + args[0] + ' at perimeter... Done.', 'success');
            }
        },

        // --- VERIFY ---
        'verify': {
            help: 'Verify perimeter is hardened (at EGRESS-MON)',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];
                if (cellType !== 'egress-monitor') { e.printLine('Must be at EGRESS-MON node.', 'error'); return; }
                if (!s.customRuleWritten || !s.dbSegmented) {
                    e.printLine('Verification incomplete.', 'warning');
                    if (!s.customRuleWritten) e.printLine('  [ ] Write custom WAF rule', 'error');
                    if (!s.dbSegmented) e.printLine('  [ ] Segment the database', 'error');
                    return;
                }
                e.printLine('[1] Encoded SQLi \u2192 WAF: BLOCKED', 'success');
                e.printLine('[2] Direct DB access \u2192 DENIED', 'success');
                e.printLine('[3] Outbound exfil \u2192 BLOCKED', 'success');
                e.printLine('[4] Normal API traffic \u2192 ALLOWED', 'success');
                e.printLine('All tests passed. Perimeter hardened.', 'success');
                s.egressVerified = true;
                e.checkObjectives(); e.saveState();
            }
        }
    }
};
