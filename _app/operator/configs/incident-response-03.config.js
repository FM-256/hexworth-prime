/* ================================================================
   IR-03: Supply Chain -- Mission Config
   ================================================================
   Terminal-mode mission. Supply chain compromise response.
   Custom commands: investigate, contain, remediate, verify,
                    timeline, block.
   Overrides: scan, move, status (IR-flavored output).
   A trusted vendor update pushed malicious code to 3 systems.
   Find the compromised package, contain, block, remediate.
   ================================================================ */

// Proximity helpers
function _ir03_isNearNode(nodeType, state, config) {
    for (var r = 0; r < config.grid.rows; r++) {
        for (var col = 0; col < config.grid.cols; col++) {
            if (config.grid.cells[r][col] !== nodeType) continue;
            var dc = Math.abs(state.position.col - col), dr = Math.abs(state.position.row - r);
            if ((dc === 0 && dr === 0) || (dc + dr === 1)) return true;
        }
    }
    return false;
}

function _ir03_isOnNode(nodeType, state, config) {
    return config.grid.cells[state.position.row][state.position.col] === nodeType;
}

var INCIDENT_RESPONSE_03_CONFIG = {
    id: 'incident-response-03',
    missionTitle: 'IR-03',
    title: 'Supply Chain',
    subtitle: 'Compromised vendor update. Backdoor active. Find it. Block it. Clean it.',
    category: 'incident-response',
    difficulty: 2,
    inputMode: 'terminal',
    promptText: 'SOC-ANALYST> ',
    promptLabel: 'TERMINAL',
    notFoundMsg: 'Unknown command: {cmd}\nType "help" for available commands.',

    grid: {
        rows: 5,
        cols: 6,
        cells: [
            ['vendor-portal',    'update-server',  'build-pipeline', 'empty',              'cdn-edge',         'wall'],
            ['empty',            'empty',          'dev-workstation-1', 'dev-workstation-2', 'empty',           'wall'],
            ['monitoring-server','log-aggregator', 'empty',          'staging-server',      'production-web',   'production-api'],
            ['wall',             'firewall',       'empty',          'empty',               'production-db',    'empty'],
            ['wall',             'wall',           'backup-server',  'empty',               'wall',             'wall']
        ],
        start: { col: 0, row: 2 }
    },

    nodes: {
        'vendor-portal':      { label: 'VENDOR-PORTAL',   abbr: 'VPT', ip: '203.0.113.50',  desc: 'Third-party vendor software distribution portal',         ports: ['443/HTTPS','22/SSH'],                            os: 'External (vendor-managed)' },
        'update-server':      { label: 'UPDATE-SRV',      abbr: 'UPD', ip: '10.5.0.10',     desc: 'Internal update mirror -- pulls packages from vendor',    ports: ['443/HTTPS','8080/PKG-API','22/SSH'],             os: 'Ubuntu 22.04 LTS' },
        'build-pipeline':     { label: 'BUILD-PIPE',      abbr: 'BLD', ip: '10.5.0.15',     desc: 'CI/CD pipeline server -- Jenkins + Artifactory',          ports: ['8080/JENKINS','8443/ARTIFACTORY','22/SSH'],      os: 'RHEL 9.3' },
        'dev-workstation-1':  { label: 'DEV-WS-1',        abbr: 'DW1', ip: '10.5.1.20',     desc: 'Developer workstation -- backend team lead',              ports: ['22/SSH','3000/DEV-SERVER','5432/POSTGRES'],      os: 'Ubuntu 22.04 LTS' },
        'dev-workstation-2':  { label: 'DEV-WS-2',        abbr: 'DW2', ip: '10.5.1.21',     desc: 'Developer workstation -- frontend engineer',              ports: ['22/SSH','3000/DEV-SERVER','8080/WEBPACK'],       os: 'macOS Sonoma 14.3' },
        'staging-server':     { label: 'STAGING-SRV',     abbr: 'STG', ip: '10.5.2.30',     desc: 'Pre-production staging environment',                      ports: ['443/HTTPS','8080/HTTP','22/SSH'],                os: 'Ubuntu 22.04 LTS' },
        'production-web':     { label: 'PROD-WEB',        abbr: 'PWB', ip: '10.5.3.10',     desc: 'Production web frontend -- customer-facing',              ports: ['80/HTTP','443/HTTPS','22/SSH'],                  os: 'Ubuntu 22.04 LTS' },
        'production-db':      { label: 'PROD-DB',         abbr: 'PDB', ip: '10.5.3.20',     desc: 'Production database -- PostgreSQL primary',               ports: ['5432/POSTGRES','22/SSH'],                        os: 'Ubuntu 22.04 LTS' },
        'production-api':     { label: 'PROD-API',        abbr: 'PAP', ip: '10.5.3.15',     desc: 'Production API server -- REST + GraphQL',                 ports: ['443/HTTPS','8443/API','22/SSH'],                 os: 'RHEL 9.3' },
        'monitoring-server':  { label: 'MONITOR-SRV',     abbr: 'MON', ip: '10.5.0.50',     desc: 'Prometheus + Grafana monitoring stack',                    ports: ['9090/PROMETHEUS','3000/GRAFANA','22/SSH'],       os: 'Ubuntu 22.04 LTS' },
        'log-aggregator':     { label: 'LOG-AGG',         abbr: 'LOG', ip: '10.5.0.55',     desc: 'Elasticsearch + Kibana log aggregation',                  ports: ['9200/ELASTIC','5601/KIBANA','22/SSH'],           os: 'Ubuntu 22.04 LTS' },
        'backup-server':      { label: 'BACKUP-SRV',      abbr: 'BAK', ip: '10.5.0.200',    desc: 'Air-gapped backup server -- nightly snapshots',           ports: ['22/SSH','9392/VEEAM'],                           os: 'Windows Server 2022' },
        'firewall':           { label: 'FIREWALL',         abbr: 'FWL', ip: '10.5.0.1',      desc: 'Perimeter firewall -- Palo Alto PA-5200',                 ports: ['443/HTTPS-MGMT','22/SSH'],                      os: 'PAN-OS 11.1' },
        'cdn-edge':           { label: 'CDN-EDGE',         abbr: 'CDN', ip: '198.51.100.10', desc: 'CDN edge node -- static asset delivery',                  ports: ['80/HTTP','443/HTTPS'],                           os: 'Cloudflare (external)' }
    },

    traps: [
        {
            id: 'reinfection-trap',
            trigger: 'remediate-before-block',
            description: 'Remediating before blocking vendor portal causes re-infection from update server'
        }
    ],

    gates: {},

    objectives: [
        { id: 'identify-package',   label: 'Identify the compromised package',            check: 'compromisedPackageFound' },
        { id: 'find-affected',      label: 'Find all 3 affected production systems',       check: 'allAffectedFound' },
        { id: 'block-vendor',       label: 'Block the vendor portal at the firewall',      check: 'vendorBlocked' },
        { id: 'contain-systems',    label: 'Contain all 3 affected systems',               check: 'allContained' },
        { id: 'remediate-systems',  label: 'Remediate all 3 affected systems',             check: 'allRemediated' }
    ],

    integrity: 3,

    completion: {
        title: 'SUPPLY CHAIN',
        subtitle: 'Supply chain compromise neutralized. Backdoors removed. Vendor blocked.',
        storageKey: 'hexworth_operator_ir03'
    },

    briefing: [
        'ALERT: Suspicious outbound traffic from 3',
        'production systems. Traces back to a vendor',
        'software update pushed 48 hours ago.',
        'Identify the compromised package, find all',
        'affected systems, block the source, contain,',
        'and remediate. Do NOT clean before blocking.'
    ],

    commands: ['scan', 'move', 'investigate', 'contain', 'remediate', 'verify', 'timeline', 'block', 'status', 'help', 'clear'],

    customState: {
        compromisedPackageFound: false,
        affectedSystemsFound: [],
        allAffectedFound: false,
        vendorBlocked: false,
        containedSystems: [],
        allContained: false,
        remediatedSystems: [],
        allRemediated: false,
        investigatedNodes: [],
        reinfectionWarning: false
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

                e.printLine('Scanning network segment...', 'system');
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
            help: 'Move analyst (north/south/east/west or n/s/e/w)',
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

                e.updateGrid(); e.saveState();
            }
        },

        // --- Override: status (IR lifecycle progress) ---
        'status': {
            help: 'Show position and IR lifecycle progress',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];
                var posLabel = (cellType !== 'empty' && cellType !== 'wall') ? c.nodes[cellType].label : 'Clear';

                e.printLine('', 'system');
                e.printLine('\u2550\u2550\u2550 SUPPLY CHAIN IR STATUS \u2550\u2550\u2550', 'heading');
                e.printLine('Position: (' + s.position.col + ',' + s.position.row + ') -- ' + posLabel, 'info');
                e.printLine('Nodes mapped: ' + s.nodesDiscovered.size + ' / 14', 'info');
                e.printLine('Commands issued: ' + s.agentCmdCount, 'info');
                e.printLine('Integrity: ' + s.integrity + ' / 3', s.integrity >= 2 ? 'info' : 'warning');
                e.printLine('', 'system');

                e.printLine('IDENTIFICATION:', 'heading');
                e.printLine('  Compromised package:  ' + (s.compromisedPackageFound ? 'YES -- libnetutil v2.4.1-backdoor' : 'NO -- investigate vendor-portal or update-server'), s.compromisedPackageFound ? 'success' : 'warning');
                e.printLine('  Affected systems:     ' + s.affectedSystemsFound.length + ' / 3 found', s.affectedSystemsFound.length >= 3 ? 'success' : 'warning');
                e.printLine('', 'system');

                e.printLine('CONTAINMENT:', 'heading');
                e.printLine('  Vendor portal blocked: ' + (s.vendorBlocked ? 'YES -- firewall rule active' : 'NO -- still pulling updates'), s.vendorBlocked ? 'success' : 'warning');
                e.printLine('  Systems contained:     ' + s.containedSystems.length + ' / 3', s.containedSystems.length >= 3 ? 'success' : 'warning');
                e.printLine('', 'system');

                e.printLine('REMEDIATION:', 'heading');
                e.printLine('  Systems remediated:    ' + s.remediatedSystems.length + ' / 3', s.remediatedSystems.length >= 3 ? 'success' : 'warning');
                e.printLine('', 'system');

                e.printLine('Objectives:', 'heading');
                var objText = [
                    'Identify the compromised package',
                    'Find all 3 affected production systems',
                    'Block the vendor portal at the firewall',
                    'Contain all 3 affected systems',
                    'Remediate all 3 affected systems'
                ];
                for (var j = 0; j < c.objectives.length; j++) {
                    var done = s.objectives[j];
                    e.printLine((done ? ' [X] ' : ' [ ] ') + objText[j], done ? 'success' : 'system');
                }
            }
        },

        // --- investigate: examine a node for indicators of compromise ---
        'investigate': {
            help: 'Examine a node for indicators of compromise',
            syntax: 'investigate <node>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;

                if (!args.length) { e.printLine('Usage: investigate <node>', 'error'); return; }

                var target = args.join(' '), node = e.resolveNode(target);
                if (!node) { e.printLine('investigate: unknown node: ' + target, 'error'); return; }

                if (!_ir03_isOnNode(node.type, s, c)) {
                    e.printLine('investigate: must be ON ' + node.info.label + ' to run investigation.', 'error');
                    e.printLine('Current position: (' + s.position.col + ',' + s.position.row + ')', 'system');
                    return;
                }

                e.printLine('', 'system');
                e.printLine('Investigating ' + node.info.label + ' (' + node.info.ip + ')...', 'system');
                e.printLine('', 'system');

                var compromisedNodes = ['production-web', 'production-api', 'production-db'];

                switch (node.type) {
                    case 'vendor-portal':
                        e.printLine('HOST: ' + node.info.label + ' (' + node.info.ip + ')', 'heading');
                        e.printLine('OS: ' + node.info.os, 'node-info');
                        e.printLine('', 'system');
                        e.printLine('VENDOR PACKAGE REPOSITORY:', 'heading');
                        e.printLine('  Vendor: NexaCorp Software Solutions', 'info');
                        e.printLine('  Package: libnetutil (network utility library)', 'info');
                        e.printLine('  Latest version published: v2.4.1 (2 days ago)', 'warning');
                        e.printLine('  Previous version: v2.4.0 (3 weeks ago)', 'info');
                        e.printLine('', 'system');
                        e.printLine('RELEASE ANALYSIS:', 'heading');
                        e.printLine('  v2.4.1 changelog: "Performance improvements and bug fixes"', 'info');
                        e.printLine('  [!] Binary diff against v2.4.0 shows unexpected additions:', 'warning');
                        e.printLine('      + /lib/netutil/helper.so (NEW -- not in source repo)', 'error');
                        e.printLine('      + Modified: /lib/netutil/core.so (+847 bytes unexplained)', 'error');
                        e.printLine('  [!] helper.so contains obfuscated shellcode -- BACKDOOR', 'error');
                        e.printLine('  [!] Signing key: VALID (vendor key compromised at source)', 'error');
                        e.printLine('', 'system');
                        e.printLine('COMPROMISED PACKAGE IDENTIFIED: libnetutil v2.4.1', 'success');
                        e.printLine('Vendor portal was compromised -- attacker injected backdoor into build.', 'warning');
                        s.compromisedPackageFound = true;
                        if (s.investigatedNodes.indexOf('vendor-portal') === -1) s.investigatedNodes.push('vendor-portal');
                        e.checkObjectives();
                        break;

                    case 'update-server':
                        e.printLine('HOST: ' + node.info.label + ' (' + node.info.ip + ')', 'heading');
                        e.printLine('OS: ' + node.info.os, 'node-info');
                        e.printLine('', 'system');
                        e.printLine('UPDATE MIRROR STATUS:', 'heading');
                        e.printLine('  Mirror source: vendor-portal (203.0.113.50)', 'info');
                        e.printLine('  Last sync: 48 hours ago', 'warning');
                        e.printLine('  Packages cached: 142', 'info');
                        e.printLine('', 'system');
                        e.printLine('RECENT SYNC LOG:', 'heading');
                        e.printLine('  [03/09 02:00] Scheduled sync started', 'info');
                        e.printLine('  [03/09 02:01] Pulled libnetutil v2.4.1 (NEW)', 'warning');
                        e.printLine('  [03/09 02:01] Signature check: PASS (vendor key valid)', 'info');
                        e.printLine('  [03/09 02:02] Distributed to: production-web, production-api, production-db', 'warning');
                        e.printLine('  [03/09 02:03] Sync complete. 1 package updated.', 'info');
                        e.printLine('', 'system');
                        e.printLine('[!] libnetutil v2.4.1 hash: 7a3f...c91d', 'warning');
                        e.printLine('[!] Known-good v2.4.0 hash: 2e8b...f4a0', 'info');
                        e.printLine('[!] Binary analysis reveals embedded reverse shell in helper.so', 'error');
                        e.printLine('', 'system');
                        e.printLine('COMPROMISED PACKAGE IDENTIFIED: libnetutil v2.4.1', 'success');
                        s.compromisedPackageFound = true;
                        if (s.investigatedNodes.indexOf('update-server') === -1) s.investigatedNodes.push('update-server');
                        e.checkObjectives();
                        break;

                    case 'production-web':
                        e.printLine('HOST: ' + node.info.label + ' (' + node.info.ip + ')', 'heading');
                        e.printLine('OS: ' + node.info.os, 'node-info');
                        e.printLine('', 'system');
                        e.printLine('PROCESS ANALYSIS:', 'heading');
                        e.printLine('  [!] Suspicious process: /usr/lib/netutil/helper.so', 'error');
                        e.printLine('      PID: 4821  |  User: www-data  |  CPU: 2.1%', 'warning');
                        e.printLine('      Listening on: 0.0.0.0:9443 (reverse shell)', 'error');
                        e.printLine('      Parent: /usr/lib/netutil/core.so (libnetutil v2.4.1)', 'warning');
                        e.printLine('', 'system');
                        e.printLine('FILE INTEGRITY:', 'heading');
                        e.printLine('  Modified: /usr/lib/netutil/core.so  (03/09 02:02)', 'warning');
                        e.printLine('  Created:  /usr/lib/netutil/helper.so (03/09 02:02)', 'error');
                        e.printLine('  Modified: /etc/cron.d/netutil-health (persistence mechanism)', 'error');
                        e.printLine('', 'system');
                        e.printLine('NETWORK CONNECTIONS:', 'heading');
                        e.printLine('  [!] Outbound: 10.5.3.10:9443 -> 203.0.113.50:8443 (encrypted exfil)', 'error');
                        e.printLine('  [!] Data sent: ~340 MB over 48 hours', 'error');
                        e.printLine('', 'system');
                        e.printLine('VERDICT: COMPROMISED -- backdoor active, data exfiltrating', 'error');
                        if (s.affectedSystemsFound.indexOf('production-web') === -1) {
                            s.affectedSystemsFound.push('production-web');
                            e.printLine('Affected system logged (' + s.affectedSystemsFound.length + '/3).', 'success');
                        }
                        if (s.investigatedNodes.indexOf('production-web') === -1) s.investigatedNodes.push('production-web');
                        if (s.affectedSystemsFound.length >= 3) { s.allAffectedFound = true; }
                        e.checkObjectives();
                        break;

                    case 'production-api':
                        e.printLine('HOST: ' + node.info.label + ' (' + node.info.ip + ')', 'heading');
                        e.printLine('OS: ' + node.info.os, 'node-info');
                        e.printLine('', 'system');
                        e.printLine('PROCESS ANALYSIS:', 'heading');
                        e.printLine('  [!] Suspicious process: /usr/lib/netutil/helper.so', 'error');
                        e.printLine('      PID: 7102  |  User: api-svc  |  CPU: 1.8%', 'warning');
                        e.printLine('      Listening on: 0.0.0.0:9443 (reverse shell)', 'error');
                        e.printLine('      Parent: /usr/lib/netutil/core.so (libnetutil v2.4.1)', 'warning');
                        e.printLine('', 'system');
                        e.printLine('FILE INTEGRITY:', 'heading');
                        e.printLine('  Modified: /usr/lib/netutil/core.so  (03/09 02:02)', 'warning');
                        e.printLine('  Created:  /usr/lib/netutil/helper.so (03/09 02:02)', 'error');
                        e.printLine('  Modified: /etc/cron.d/netutil-health (persistence mechanism)', 'error');
                        e.printLine('', 'system');
                        e.printLine('NETWORK CONNECTIONS:', 'heading');
                        e.printLine('  [!] Outbound: 10.5.3.15:9443 -> 203.0.113.50:8443 (encrypted exfil)', 'error');
                        e.printLine('  [!] Data sent: ~215 MB over 48 hours (API tokens, session keys)', 'error');
                        e.printLine('', 'system');
                        e.printLine('VERDICT: COMPROMISED -- backdoor active, API credentials exfiltrating', 'error');
                        if (s.affectedSystemsFound.indexOf('production-api') === -1) {
                            s.affectedSystemsFound.push('production-api');
                            e.printLine('Affected system logged (' + s.affectedSystemsFound.length + '/3).', 'success');
                        }
                        if (s.investigatedNodes.indexOf('production-api') === -1) s.investigatedNodes.push('production-api');
                        if (s.affectedSystemsFound.length >= 3) { s.allAffectedFound = true; }
                        e.checkObjectives();
                        break;

                    case 'production-db':
                        e.printLine('HOST: ' + node.info.label + ' (' + node.info.ip + ')', 'heading');
                        e.printLine('OS: ' + node.info.os, 'node-info');
                        e.printLine('', 'system');
                        e.printLine('PROCESS ANALYSIS:', 'heading');
                        e.printLine('  [!] Suspicious process: /usr/lib/netutil/helper.so', 'error');
                        e.printLine('      PID: 5539  |  User: postgres  |  CPU: 3.4%', 'warning');
                        e.printLine('      Listening on: 0.0.0.0:9443 (reverse shell)', 'error');
                        e.printLine('      Parent: /usr/lib/netutil/core.so (libnetutil v2.4.1)', 'warning');
                        e.printLine('', 'system');
                        e.printLine('FILE INTEGRITY:', 'heading');
                        e.printLine('  Modified: /usr/lib/netutil/core.so  (03/09 02:02)', 'warning');
                        e.printLine('  Created:  /usr/lib/netutil/helper.so (03/09 02:02)', 'error');
                        e.printLine('  Modified: /etc/cron.d/netutil-health (persistence mechanism)', 'error');
                        e.printLine('', 'system');
                        e.printLine('NETWORK CONNECTIONS:', 'heading');
                        e.printLine('  [!] Outbound: 10.5.3.20:9443 -> 203.0.113.50:8443 (encrypted exfil)', 'error');
                        e.printLine('  [!] Data sent: ~1.2 GB over 48 hours (database dumps)', 'error');
                        e.printLine('  [!] SQL query log shows bulk SELECT on customer, payment tables', 'error');
                        e.printLine('', 'system');
                        e.printLine('VERDICT: COMPROMISED -- backdoor active, database exfiltrating', 'error');
                        if (s.affectedSystemsFound.indexOf('production-db') === -1) {
                            s.affectedSystemsFound.push('production-db');
                            e.printLine('Affected system logged (' + s.affectedSystemsFound.length + '/3).', 'success');
                        }
                        if (s.investigatedNodes.indexOf('production-db') === -1) s.investigatedNodes.push('production-db');
                        if (s.affectedSystemsFound.length >= 3) { s.allAffectedFound = true; }
                        e.checkObjectives();
                        break;

                    case 'build-pipeline':
                        e.printLine('HOST: ' + node.info.label + ' (' + node.info.ip + ')', 'heading');
                        e.printLine('OS: ' + node.info.os, 'node-info');
                        e.printLine('', 'system');
                        e.printLine('CI/CD PIPELINE STATUS:', 'heading');
                        e.printLine('  Jenkins: v2.426 -- running', 'info');
                        e.printLine('  Artifactory: v7.77 -- running', 'info');
                        e.printLine('  Last build: 6 hours ago (app v3.2.1)', 'info');
                        e.printLine('', 'system');
                        e.printLine('DEPENDENCY AUDIT:', 'heading');
                        e.printLine('  libnetutil v2.4.1 -- PRESENT in build artifacts', 'warning');
                        e.printLine('  Build used cached package from UPDATE-SRV mirror', 'info');
                        e.printLine('  No direct compromise of pipeline detected.', 'info');
                        e.printLine('', 'system');
                        e.printLine('STATUS: Pipeline clean but pulling compromised dependency.', 'warning');
                        if (s.investigatedNodes.indexOf('build-pipeline') === -1) s.investigatedNodes.push('build-pipeline');
                        break;

                    case 'monitoring-server':
                        e.printLine('HOST: ' + node.info.label + ' (' + node.info.ip + ')', 'heading');
                        e.printLine('OS: ' + node.info.os, 'node-info');
                        e.printLine('', 'system');
                        e.printLine('MONITORING ALERTS (last 48h):', 'heading');
                        e.printLine('  [03/09 02:15] WARN: Unusual outbound traffic spike on PROD-WEB', 'warning');
                        e.printLine('  [03/09 02:15] WARN: Unusual outbound traffic spike on PROD-API', 'warning');
                        e.printLine('  [03/09 02:16] WARN: Unusual outbound traffic spike on PROD-DB', 'warning');
                        e.printLine('  [03/09 14:00] WARN: PROD-DB CPU elevated (postgres + unknown proc)', 'warning');
                        e.printLine('  [03/10 08:00] CRIT: 1.2 GB egress from PROD-DB in 24h (baseline: 50 MB)', 'error');
                        e.printLine('', 'system');
                        e.printLine('STATUS: Monitoring server is CLEAN. Alerts were not acted upon.', 'warning');
                        if (s.investigatedNodes.indexOf('monitoring-server') === -1) s.investigatedNodes.push('monitoring-server');
                        break;

                    case 'log-aggregator':
                        e.printLine('HOST: ' + node.info.label + ' (' + node.info.ip + ')', 'heading');
                        e.printLine('OS: ' + node.info.os, 'node-info');
                        e.printLine('', 'system');
                        e.printLine('LOG CORRELATION:', 'heading');
                        e.printLine('  Indexing 47 million events from last 48 hours...', 'system');
                        e.printLine('', 'system');
                        e.printLine('  [!] Common IOC across PROD-WEB, PROD-API, PROD-DB:', 'warning');
                        e.printLine('      Process: /usr/lib/netutil/helper.so', 'error');
                        e.printLine('      Outbound dest: 203.0.113.50:8443', 'error');
                        e.printLine('      First seen: 03/09 02:02 (all three hosts)', 'warning');
                        e.printLine('      Cron persistence: /etc/cron.d/netutil-health', 'error');
                        e.printLine('', 'system');
                        e.printLine('  Unaffected hosts: staging, dev-ws-1, dev-ws-2, build-pipe', 'info');
                        e.printLine('  (These hosts have libnetutil v2.4.0 -- not updated yet)', 'info');
                        e.printLine('', 'system');
                        e.printLine('STATUS: Log aggregator is CLEAN. Useful for correlation.', 'success');
                        if (s.investigatedNodes.indexOf('log-aggregator') === -1) s.investigatedNodes.push('log-aggregator');
                        break;

                    case 'firewall':
                        e.printLine('HOST: ' + node.info.label + ' (' + node.info.ip + ')', 'heading');
                        e.printLine('OS: ' + node.info.os, 'node-info');
                        e.printLine('', 'system');
                        e.printLine('FIREWALL RULE ANALYSIS:', 'heading');
                        e.printLine('  Active rules: 247', 'info');
                        e.printLine('  [!] No block rule for 203.0.113.50 (vendor portal)', 'warning');
                        e.printLine('  [!] Outbound 8443 is ALLOWED to any destination', 'warning');
                        e.printLine('  [!] UPDATE-SRV (10.5.0.10) has unrestricted outbound to vendor', 'warning');
                        e.printLine('', 'system');
                        e.printLine('TRAFFIC LOG:', 'heading');
                        e.printLine('  Outbound to 203.0.113.50: 1.8 GB in 48 hours', 'error');
                        e.printLine('  Sources: 10.5.3.10, 10.5.3.15, 10.5.3.20', 'warning');
                        e.printLine('', 'system');
                        if (s.vendorBlocked) {
                            e.printLine('VENDOR BLOCK: ACTIVE -- all traffic to 203.0.113.50 dropped', 'success');
                        } else {
                            e.printLine('STATUS: Firewall passing exfil traffic. Use "block" to cut off vendor.', 'warning');
                        }
                        if (s.investigatedNodes.indexOf('firewall') === -1) s.investigatedNodes.push('firewall');
                        break;

                    case 'staging-server':
                        e.printLine('HOST: ' + node.info.label + ' (' + node.info.ip + ')', 'heading');
                        e.printLine('OS: ' + node.info.os, 'node-info');
                        e.printLine('', 'system');
                        e.printLine('PACKAGE AUDIT:', 'heading');
                        e.printLine('  libnetutil: v2.4.0 (NOT updated to v2.4.1)', 'info');
                        e.printLine('  No indicators of compromise detected.', 'info');
                        e.printLine('', 'system');
                        e.printLine('STATUS: CLEAN. Staging was not in the auto-update group.', 'success');
                        if (s.investigatedNodes.indexOf('staging-server') === -1) s.investigatedNodes.push('staging-server');
                        break;

                    case 'dev-workstation-1':
                        e.printLine('HOST: ' + node.info.label + ' (' + node.info.ip + ')', 'heading');
                        e.printLine('OS: ' + node.info.os, 'node-info');
                        e.printLine('', 'system');
                        e.printLine('PACKAGE AUDIT:', 'heading');
                        e.printLine('  libnetutil: v2.4.0 (dev pinned to stable release)', 'info');
                        e.printLine('  No indicators of compromise detected.', 'info');
                        e.printLine('', 'system');
                        e.printLine('STATUS: CLEAN. Dev workstations use pinned dependencies.', 'success');
                        if (s.investigatedNodes.indexOf('dev-workstation-1') === -1) s.investigatedNodes.push('dev-workstation-1');
                        break;

                    case 'dev-workstation-2':
                        e.printLine('HOST: ' + node.info.label + ' (' + node.info.ip + ')', 'heading');
                        e.printLine('OS: ' + node.info.os, 'node-info');
                        e.printLine('', 'system');
                        e.printLine('PACKAGE AUDIT:', 'heading');
                        e.printLine('  libnetutil: v2.4.0 (dev pinned to stable release)', 'info');
                        e.printLine('  No indicators of compromise detected.', 'info');
                        e.printLine('', 'system');
                        e.printLine('STATUS: CLEAN. Dev workstations use pinned dependencies.', 'success');
                        if (s.investigatedNodes.indexOf('dev-workstation-2') === -1) s.investigatedNodes.push('dev-workstation-2');
                        break;

                    case 'cdn-edge':
                        e.printLine('HOST: ' + node.info.label + ' (' + node.info.ip + ')', 'heading');
                        e.printLine('OS: ' + node.info.os, 'node-info');
                        e.printLine('', 'system');
                        e.printLine('CDN STATUS:', 'heading');
                        e.printLine('  Serving static assets. No server-side code execution.', 'info');
                        e.printLine('  libnetutil is not deployed to CDN edge nodes.', 'info');
                        e.printLine('', 'system');
                        e.printLine('STATUS: CLEAN. CDN is not affected by this supply chain attack.', 'success');
                        if (s.investigatedNodes.indexOf('cdn-edge') === -1) s.investigatedNodes.push('cdn-edge');
                        break;

                    case 'backup-server':
                        e.printLine('HOST: ' + node.info.label + ' (' + node.info.ip + ')', 'heading');
                        e.printLine('OS: ' + node.info.os, 'node-info');
                        e.printLine('', 'system');
                        e.printLine('BACKUP STATUS:', 'heading');
                        e.printLine('  Last clean snapshot: 03/08 23:00 (pre-compromise)', 'info');
                        e.printLine('  Post-compromise snapshot: 03/09 23:00 (contains backdoor)', 'warning');
                        e.printLine('  Air-gapped: YES -- no inbound network connections', 'success');
                        e.printLine('', 'system');
                        e.printLine('STATUS: CLEAN. Pre-compromise backups are available for restore.', 'success');
                        if (s.investigatedNodes.indexOf('backup-server') === -1) s.investigatedNodes.push('backup-server');
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

        // --- contain: isolate a compromised production node ---
        'contain': {
            help: 'Isolate a compromised node from the network',
            syntax: 'contain <node>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;

                if (!args.length) { e.printLine('Usage: contain <node>', 'error'); return; }

                var target = args.join(' '), node = e.resolveNode(target);
                if (!node) { e.printLine('contain: unknown node: ' + target, 'error'); return; }

                var compromisedNodes = ['production-web', 'production-api', 'production-db'];
                if (compromisedNodes.indexOf(node.type) === -1) {
                    e.printLine('contain: ' + node.info.label + ' is not a compromised system.', 'warning');
                    e.printLine('Only compromised production systems need containment.', 'system');
                    return;
                }

                // Must have investigated this node first
                if (s.investigatedNodes.indexOf(node.type) === -1) {
                    e.printLine('contain: must investigate ' + node.info.label + ' first.', 'error');
                    e.printLine('Run "investigate ' + node.type + '" to confirm compromise before containment.', 'system');
                    return;
                }

                // Must be adjacent or on the node
                var dc = Math.abs(s.position.col - node.col), dr = Math.abs(s.position.row - node.row);
                var inRange = (dc === 0 && dr === 0) || (dc + dr === 1);
                if (!inRange) {
                    e.printLine('contain: must be adjacent to or on ' + node.info.label + '.', 'error');
                    e.printLine('Navigate closer to the target node first.', 'system');
                    return;
                }

                if (s.containedSystems.indexOf(node.type) !== -1) {
                    e.printLine(node.info.label + ' is already contained.', 'warning');
                    return;
                }

                e.printLine('', 'system');
                e.printLine('Containing ' + node.info.label + ' (' + node.info.ip + ')...', 'system');
                e.printLine('  Disabling switch port for ' + node.info.ip + '...', 'info');
                e.printLine('  Blocking all outbound from ' + node.info.ip + ' at gateway...', 'info');
                e.printLine('  Killing outbound connection to 203.0.113.50:8443...', 'info');
                e.printLine('  Preserving volatile memory for forensics...', 'info');
                e.printLine('', 'system');
                e.printLine(node.info.label + ' CONTAINED. Network access revoked. Exfil channel severed.', 'success');

                s.containedSystems.push(node.type);
                if (s.containedSystems.length >= 3) { s.allContained = true; }
                e.checkObjectives(); e.saveState();
            }
        },

        // --- remediate: remove backdoor from a contained node ---
        'remediate': {
            help: 'Remove backdoor from a contained node',
            syntax: 'remediate <node>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;

                if (!args.length) { e.printLine('Usage: remediate <node>', 'error'); return; }

                var target = args.join(' '), node = e.resolveNode(target);
                if (!node) { e.printLine('remediate: unknown node: ' + target, 'error'); return; }

                var compromisedNodes = ['production-web', 'production-api', 'production-db'];
                if (compromisedNodes.indexOf(node.type) === -1) {
                    e.printLine('remediate: ' + node.info.label + ' does not need remediation.', 'warning');
                    return;
                }

                // TRAP: must block vendor portal before remediating
                if (!s.vendorBlocked) {
                    e.printLine('', 'system');
                    e.printLine('[!] CRITICAL ERROR: Vendor portal is still active!', 'error');
                    e.printLine('', 'system');
                    e.printLine('The update server is still pulling from the compromised vendor.', 'error');
                    e.printLine('If you clean this system, the next update cycle will re-deploy', 'error');
                    e.printLine('the backdoored package. You just lost the element of surprise.', 'error');
                    e.printLine('', 'system');
                    e.printLine('INTEGRITY LOST. Block the vendor portal FIRST (use "block" at FIREWALL).', 'warning');
                    if (!s.reinfectionWarning) {
                        s.reinfectionWarning = true;
                        s.integrity = Math.max(0, s.integrity - 1);
                        e.printLine('Integrity reduced: ' + s.integrity + ' / 3', 'error');
                    }
                    e.saveState();
                    return;
                }

                // Must contain before remediate
                if (s.containedSystems.indexOf(node.type) === -1) {
                    e.printLine('remediate: ' + node.info.label + ' must be contained first.', 'error');
                    e.printLine('Run "contain ' + node.type + '" before attempting remediation.', 'system');
                    return;
                }

                if (s.remediatedSystems.indexOf(node.type) !== -1) {
                    e.printLine(node.info.label + ' has already been remediated.', 'warning');
                    return;
                }

                // Must be adjacent or on the node
                var dc = Math.abs(s.position.col - node.col), dr = Math.abs(s.position.row - node.row);
                var inRange = (dc === 0 && dr === 0) || (dc + dr === 1);
                if (!inRange) {
                    e.printLine('remediate: must be adjacent to or on ' + node.info.label + '.', 'error');
                    return;
                }

                e.printLine('', 'system');
                e.printLine('Remediating ' + node.info.label + ' (' + node.info.ip + ')...', 'system');
                e.printLine('  Killing process: /usr/lib/netutil/helper.so...', 'info');
                e.printLine('  Removing backdoor: /usr/lib/netutil/helper.so...', 'info');
                e.printLine('  Removing persistence: /etc/cron.d/netutil-health...', 'info');
                e.printLine('  Rolling back libnetutil v2.4.1 -> v2.4.0...', 'info');
                e.printLine('  Restoring /usr/lib/netutil/core.so from known-good hash (2e8b...f4a0)...', 'info');
                e.printLine('  Rotating credentials and API keys...', 'info');
                e.printLine('  Verifying clean state...', 'info');
                e.printLine('', 'system');
                e.printLine(node.info.label + ' REMEDIATED. Backdoor removed. Clean package restored.', 'success');

                s.remediatedSystems.push(node.type);
                if (s.remediatedSystems.length >= 3) { s.allRemediated = true; }
                e.checkObjectives(); e.saveState();
            }
        },

        // --- verify: check software hash against known-good baseline ---
        'verify': {
            help: 'Verify software hash against known-good baseline',
            syntax: 'verify <node>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;

                if (!args.length) { e.printLine('Usage: verify <node>', 'error'); return; }

                var target = args.join(' '), node = e.resolveNode(target);
                if (!node) { e.printLine('verify: unknown node: ' + target, 'error'); return; }

                if (!_ir03_isOnNode(node.type, s, c) && !_ir03_isNearNode(node.type, s, c)) {
                    e.printLine('verify: must be near or on ' + node.info.label + '.', 'error');
                    return;
                }

                e.printLine('', 'system');
                e.printLine('Verifying software hashes on ' + node.info.label + '...', 'system');

                var compromisedNodes = ['production-web', 'production-api', 'production-db'];
                var isCompromised = compromisedNodes.indexOf(node.type) !== -1;
                var isRemediated = s.remediatedSystems.indexOf(node.type) !== -1;

                if (isCompromised && !isRemediated) {
                    e.printLine('  libnetutil core.so:   7a3f...c91d', 'warning');
                    e.printLine('  Expected (v2.4.0):    2e8b...f4a0', 'info');
                    e.printLine('  HASH MISMATCH -- backdoor variant detected', 'error');
                    e.printLine('', 'system');
                    e.printLine('  helper.so present:    YES (not in baseline -- malicious)', 'error');
                    e.printLine('  Cron persistence:     PRESENT (/etc/cron.d/netutil-health)', 'error');
                } else if (isCompromised && isRemediated) {
                    e.printLine('  libnetutil core.so:   2e8b...f4a0', 'info');
                    e.printLine('  Expected (v2.4.0):    2e8b...f4a0', 'info');
                    e.printLine('  Hash match.', 'success');
                    e.printLine('', 'system');
                    e.printLine('  helper.so present:    NO (removed)', 'success');
                    e.printLine('  Cron persistence:     ABSENT (removed)', 'success');
                } else if (node.type === 'update-server') {
                    e.printLine('  Cached libnetutil:    v2.4.1 (7a3f...c91d)', 'warning');
                    e.printLine('  Known-good (v2.4.0):  2e8b...f4a0', 'info');
                    e.printLine('  HASH MISMATCH -- compromised package in cache', 'error');
                } else {
                    e.printLine('  All package hashes match known-good baseline.', 'success');
                    e.printLine('  Hash match.', 'success');
                }

                e.printLine('', 'system');
                e.saveState();
            }
        },

        // --- timeline: reconstruct attack timeline from current node logs ---
        'timeline': {
            help: 'Reconstruct attack timeline from current node logs',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];

                if (cellType === 'empty' || cellType === 'wall') {
                    e.printLine('timeline: no node at current position. Move to a node first.', 'error');
                    return;
                }

                if (!s.compromisedPackageFound) {
                    e.printLine('timeline: insufficient data. Identify the compromised package first.', 'error');
                    e.printLine('Use "investigate" on vendor-portal or update-server.', 'system');
                    return;
                }

                e.printLine('', 'system');
                e.printLine('\u2550\u2550\u2550 SUPPLY CHAIN ATTACK TIMELINE \u2550\u2550\u2550', 'heading');
                e.printLine('', 'system');
                e.printLine('Phase 1: INITIAL COMPROMISE (Vendor Side)', 'heading');
                e.printLine('  ~03/08 ??:??  Attacker compromises NexaCorp build system', 'warning');
                e.printLine('  ~03/08 ??:??  Backdoor injected into libnetutil v2.4.1 source', 'warning');
                e.printLine('   03/08 18:30  Compromised v2.4.1 published to vendor portal', 'error');
                e.printLine('', 'system');
                e.printLine('Phase 2: DISTRIBUTION (Internal)', 'heading');
                e.printLine('   03/09 02:00  UPDATE-SRV scheduled sync pulls v2.4.1', 'warning');
                e.printLine('   03/09 02:01  Package signature valid (vendor key trusted)', 'warning');
                e.printLine('   03/09 02:02  Auto-deployed to: PROD-WEB, PROD-API, PROD-DB', 'error');
                e.printLine('', 'system');
                e.printLine('Phase 3: ACTIVATION (Backdoor)', 'heading');
                e.printLine('   03/09 02:02  helper.so spawned on all 3 production hosts', 'error');
                e.printLine('   03/09 02:03  Reverse shells established to 203.0.113.50:8443', 'error');
                e.printLine('   03/09 02:05  Cron persistence installed on all 3 hosts', 'error');
                e.printLine('', 'system');
                e.printLine('Phase 4: EXFILTRATION (Ongoing)', 'heading');
                e.printLine('   03/09 02:15  Data exfil begins: web sessions, API tokens, DB dumps', 'error');
                e.printLine('   03/09-03/11  Total exfil: ~1.8 GB across all 3 systems', 'error');
                e.printLine('   03/11 NOW    Backdoors still active (awaiting containment)', 'warning');
                e.printLine('', 'system');
                e.printLine('DWELL TIME: ~48 hours and counting', 'warning');
                e.printLine('BLAST RADIUS: 3 production systems, all customer data at risk', 'error');
                e.printLine('', 'system');
                e.saveState();
            }
        },

        // --- block: block vendor portal at the firewall ---
        'block': {
            help: 'Block the compromised vendor portal at the firewall',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;

                if (!_ir03_isOnNode('firewall', s, c) && !_ir03_isNearNode('firewall', s, c)) {
                    e.printLine('block: must be at or near the FIREWALL node.', 'error');
                    e.printLine('Navigate to FIREWALL (' + c.nodes['firewall'].ip + ') first.', 'system');
                    return;
                }

                if (!s.compromisedPackageFound) {
                    e.printLine('block: cannot create targeted block rule.', 'error');
                    e.printLine('Identify the compromised package first (investigate vendor-portal or update-server).', 'system');
                    return;
                }

                if (s.vendorBlocked) {
                    e.printLine('Vendor portal is already blocked. Firewall rules active.', 'success');
                    return;
                }

                e.printLine('', 'system');
                e.printLine('Deploying firewall block rules...', 'system');
                e.printLine('', 'system');
                e.printLine('  Rule 1: BLOCK outbound to 203.0.113.50 ALL PORTS (vendor portal)', 'info');
                e.printLine('  Rule 2: BLOCK inbound from 203.0.113.50 ALL PORTS', 'info');
                e.printLine('  Rule 3: BLOCK UPDATE-SRV (10.5.0.10) outbound to ANY on 443/8080', 'info');
                e.printLine('  Rule 4: ALERT on any connection attempt to 203.0.113.50', 'info');
                e.printLine('', 'system');
                e.printLine('Verifying block...', 'system');
                e.printLine('  Test connection to 203.0.113.50:443 -- BLOCKED', 'info');
                e.printLine('  Test connection to 203.0.113.50:8443 -- BLOCKED', 'info');
                e.printLine('  UPDATE-SRV sync disabled -- CONFIRMED', 'info');
                e.printLine('', 'system');
                e.printLine('VENDOR PORTAL BLOCKED. No further compromised updates can reach internal systems.', 'success');
                e.printLine('Re-infection vector eliminated. Safe to proceed with remediation.', 'success');

                s.vendorBlocked = true;
                e.checkObjectives(); e.saveState();
            }
        },

        // --- help: IR-03 specific command reference ---
        'help': {
            help: 'Show this reference',
            handler: function(args, ctx) {
                var e = ctx.engine;
                e.printLine('', 'system');
                e.printLine('\u2550\u2550\u2550 COMMAND REFERENCE \u2550\u2550\u2550', 'heading');
                e.printLine('  scan                Survey area, reveal adjacent nodes', 'info');
                e.printLine('  move <dir>          Move analyst (n/s/e/w)', 'info');
                e.printLine('  investigate <node>  Examine node for indicators of compromise', 'info');
                e.printLine('  contain <node>      Isolate a compromised node (requires investigation)', 'info');
                e.printLine('  remediate <node>    Remove backdoor (requires containment + vendor block)', 'info');
                e.printLine('  verify <node>       Check software hash against known-good baseline', 'info');
                e.printLine('  timeline            Reconstruct attack timeline (requires package ID)', 'info');
                e.printLine('  block               Block vendor portal at firewall (requires package ID)', 'info');
                e.printLine('  status              Show position and IR lifecycle progress', 'info');
                e.printLine('  help                Show this reference', 'info');
                e.printLine('  clear               Clear terminal output', 'info');
                e.printLine('', 'system');
                e.printLine('IR lifecycle: Identify > Block > Contain > Remediate > Verify', 'system');
                e.printLine('WARNING: Do NOT remediate before blocking the vendor portal.', 'warning');
                e.printLine('Nodes: reference by name, abbreviation, or IP.', 'system');
            }
        }
    }
};
