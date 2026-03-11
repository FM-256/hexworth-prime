/* ================================================================
   RECON-02: Deep Sweep -- Mission Config
   ================================================================
   Terminal-mode mission. Multi-subnet: DMZ + internal via VPN pivot.
   Custom commands: scan, move, ping, nmap, traceroute, pivot.
   Honeypot trap: nmap without prior ping triggers IDS alert.
   VPN gate: internal cells require 'pivot' at VPN-GATEWAY.
   All commands override standard via terminalCommands.

   NOTE: This mission has custom state beyond the engine baseline:
   - pivoted, honeypotTriggered, honeypotPinged, dmzNodesMapped,
     dcHostnameFound.
   ================================================================ */

var RECON_02_CONFIG = {
    id: 'recon-02',
    missionTitle: 'RECON-02',
    title: 'Deep Sweep',
    subtitle: 'Map the DMZ. Avoid the honeypot. Pivot through VPN. Extract DC hostname.',
    category: 'network-recon',
    difficulty: 2,
    inputMode: 'terminal',
    promptText: 'agent@recon:~$ ',
    promptLabel: 'TERMINAL',
    notFoundMsg: 'Unknown command: {cmd}\nType "help" for available commands.',

    grid: {
        rows: 4,
        cols: 5,
        cells: [
            ['edge-router',  'dmz-web',      'dmz-mail',    'wall',        'wall'],
            ['empty',        'core-switch',  'empty',        'vpn-gateway', 'wall'],
            ['wall',         'empty',        'honeypot',     'empty',       'internal-db'],
            ['wall',         'empty',        'empty',        'internal-dc', 'empty']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'edge-router':  { label: 'EDGE-ROUTER',  abbr: 'EDG', ip: '172.16.0.1',   desc: 'Perimeter edge router -- border gateway',              ports: ['22/SSH','179/BGP','443/HTTPS-MGMT'],                  os: 'Cisco IOS-XE 17.6' },
        'dmz-web':      { label: 'DMZ-WEB',      abbr: 'DWB', ip: '172.16.1.10',  desc: 'DMZ web server -- public-facing',                      ports: ['80/HTTP','443/HTTPS','8443/HTTPS-ALT'],               os: 'Ubuntu 22.04 LTS' },
        'dmz-mail':     { label: 'DMZ-MAIL',     abbr: 'DML', ip: '172.16.1.20',  desc: 'DMZ mail relay -- inbound/outbound filtering',         ports: ['25/SMTP','143/IMAP','587/SUBMISSION'],                os: 'Postfix on Debian 12' },
        'core-switch':  { label: 'CORE-SWITCH',  abbr: 'CSW', ip: '172.16.0.5',   desc: 'Core L3 switch -- inter-VLAN routing',                 ports: ['22/SSH','161/SNMP','8080/MGMT-UI'],                   os: 'Arista EOS 4.30' },
        'vpn-gateway':  { label: 'VPN-GATEWAY',  abbr: 'VPN', ip: '172.16.0.254', desc: 'VPN concentrator -- IPSec/SSL bridge to internal',     ports: ['22/SSH','443/HTTPS','500/IKE','4500/NAT-T'],          os: 'Palo Alto PAN-OS 11.1' },
        'honeypot':     { label: 'HONEYPOT',     abbr: 'HPT', ip: '172.16.2.99',  desc: 'Decoy server -- triggers alert on interaction',        ports: ['22/SSH','80/HTTP','3306/MySQL','445/SMB'],            os: 'HoneyOS (simulated multi-service)' },
        'internal-db':  { label: 'INTERNAL-DB',  abbr: 'IDB', ip: '10.10.0.30',   desc: 'Internal database server -- HR/finance data',          ports: ['22/SSH','5432/PostgreSQL','6379/Redis'],              os: 'RHEL 9.3' },
        'internal-dc':  { label: 'INTERNAL-DC',  abbr: 'IDC', ip: '10.10.0.10',   desc: 'Internal domain controller -- Active Directory',       ports: ['53/DNS','88/Kerberos','389/LDAP','636/LDAPS','445/SMB'], os: 'Windows Server 2022' }
    },

    traps: [],
    gates: {},

    objectives: [
        { id: 'dmz-mapped',    label: 'Map 3 DMZ nodes',           check: 'dmzNodesMapped.size >= 3' },
        { id: 'honeypot-safe', label: 'ID honeypot (no trigger)',   check: 'nodesDiscovered.has("honeypot") && !honeypotTriggered' },
        { id: 'vpn-pivot',     label: 'VPN pivot established',      check: 'pivoted' },
        { id: 'dc-hostname',   label: 'DC hostname exfiltrated',    check: 'dcHostnameFound' }
    ],

    integrity: 3,

    completion: {
        title: 'DEEP SWEEP',
        subtitle: 'Multi-subnet recon complete. Internal access secured.',
        storageKey: 'hexworth_operator_recon02'
    },

    briefing: [
        'Agent deployed at network perimeter.',
        'Multi-subnet target: DMZ + Internal.',
        'Map the DMZ. Avoid the honeypot.',
        'Pivot through VPN. Extract DC hostname.',
        '',
        'WARNING: Deception systems active on this network.'
    ],

    commands: ['scan', 'move', 'ping', 'nmap', 'traceroute', 'pivot', 'status', 'help', 'clear'],

    // Custom state fields beyond engine baseline
    // NOTE: dmzNodesMapped is initialized as a Set in the boot script
    customState: {
        pivoted: false,
        honeypotTriggered: false,
        honeypotPinged: false,
        dcHostnameFound: false
    },

    // DMZ node types for mapping objective
    dmzNodes: ['edge-router', 'dmz-web', 'dmz-mail'],

    // Internal zone definition: cells that require VPN pivot
    internalZone: function(col, row, cells) {
        var type = cells[row][col];
        if (type === 'internal-db' || type === 'internal-dc') return true;
        if (row >= 2 && col >= 3 && type === 'empty') return true;
        return false;
    },

    // ----------------------------------------------------------------
    //  TERMINAL COMMANDS (override standard + domain-specific)
    // ----------------------------------------------------------------

    terminalCommands: {

        // --- SCAN (override: tracks DMZ nodes) ---
        'scan': {
            help: 'Survey area, reveal adjacent nodes',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var col = s.position.col, row = s.position.row;
                var cellType = c.grid.cells[row][col];
                var DMZ = new Set(c.dmzNodes);

                e.printLine('Scanning area...', 'system');
                e.printLine('', 'system');
                if (cellType !== 'empty' && cellType !== 'wall') {
                    var cur = c.nodes[cellType];
                    e.printLine('Current: ' + cur.label + ' (' + cur.ip + ')', 'heading');
                    e.printLine(cur.desc, 'info');
                    if (DMZ.has(cellType)) s.dmzNodesMapped.add(cellType);
                } else { e.printLine('Current: Clear path (no node)', 'heading'); }
                e.printLine('', 'system');
                e.printLine('Adjacent:', 'heading');
                var dirs = [{name:'North',dc:0,dr:-1},{name:'South',dc:0,dr:1},{name:'East',dc:1,dr:0},{name:'West',dc:-1,dr:0}];
                for (var i = 0; i < dirs.length; i++) {
                    var d = dirs[i], nc = col + d.dc, nr = row + d.dr;
                    if (nc < 0 || nc >= c.grid.cols || nr < 0 || nr >= c.grid.rows) { e.printLine('  ' + d.name + ': [network edge]', 'system'); continue; }
                    var type = c.grid.cells[nr][nc];
                    if (type === 'wall') { e.printLine('  ' + d.name + ': [blocked]', 'system'); continue; }
                    var key = nc + ',' + nr;
                    if (!s.visibility[key] || s.visibility[key] === 'hidden') s.visibility[key] = 'revealed';
                    if (type === 'empty') e.printLine('  ' + d.name + ': Clear path', 'info');
                    else { var info = c.nodes[type]; e.printLine('  ' + d.name + ': ' + info.label + ' (' + info.ip + ')', 'node-info'); if (DMZ.has(type)) s.dmzNodesMapped.add(type); }
                }
                e.updateGrid(); e.checkObjectives(); e.saveState();
            }
        },

        // --- MOVE (override: VPN pivot gate + DMZ tracking) ---
        'move': {
            help: 'Move agent (north/south/east/west or n/s/e/w)', syntax: 'move <dir>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: move <direction>', 'error'); return; }
                var dirMap = {'north':[0,-1],'n':[0,-1],'south':[0,1],'s':[0,1],'east':[1,0],'e':[1,0],'west':[-1,0],'w':[-1,0]};
                var dir = args[0].toLowerCase(); if (!dirMap[dir]) { e.printLine('Unknown direction: ' + args[0], 'error'); return; }
                var d = dirMap[dir];
                var nc = s.position.col + d[0], nr = s.position.row + d[1];
                if (nc < 0 || nc >= c.grid.cols || nr < 0 || nr >= c.grid.rows) { e.printLine('Edge of network. Cannot move ' + dir + '.', 'error'); return; }
                var cellType = c.grid.cells[nr][nc];
                if (cellType === 'wall') { e.printLine('Blocked. No traversable path ' + dir + '.', 'error'); return; }
                // VPN pivot gate check
                if (!s.pivoted && c.internalZone(nc, nr, c.grid.cells)) {
                    e.printLine('[!] Internal subnet unreachable.', 'warning');
                    e.printLine('VPN tunnel not established. Navigate to VPN-GATEWAY and use "pivot".', 'info');
                    return;
                }
                var DMZ = new Set(c.dmzNodes);
                s.position = { col: nc, row: nr }; s.visibility[nc + ',' + nr] = 'visited';
                if (cellType !== 'empty') { s.nodesDiscovered.add(cellType); if (DMZ.has(cellType)) s.dmzNodesMapped.add(cellType); }
                e.revealAdjacent(nc, nr);
                var dirFull = {n:'north',s:'south',e:'east',w:'west'}; var dirName = dirFull[dir] || dir;
                if (cellType === 'empty') e.printLine('Moving ' + dirName + '... Clear path.', 'system');
                else {
                    var info = c.nodes[cellType];
                    e.printLine('Moving ' + dirName + '... ' + info.label + ' (' + info.ip + ')', 'success');
                    e.printLine(info.desc, 'info');
                    if (cellType === 'vpn-gateway' && !s.pivoted) { e.printLine('', 'system'); e.printLine('[*] VPN concentrator reached. Use "pivot" to establish tunnel.', 'info'); }
                }
                e.checkObjectives(); e.updateGrid(); e.saveState();
            }
        },

        // --- PING (override: honeypot caution warning) ---
        'ping': {
            help: 'Ping a node by name or IP', syntax: 'ping <node>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state;
                if (!args.length) { e.printLine('Usage: ping <node name or IP>', 'error'); return; }
                var target = args.join(' '), node = e.resolveNode(target);
                if (!node) { e.printLine('ping: unknown host ' + target, 'error'); return; }
                if (node.visibility === 'hidden') { e.printLine('Request timed out. No route to host.', 'error'); return; }
                var info = node.info;
                var ms = (Math.random() * 5 + 0.5).toFixed(1);
                e.printLine('PING ' + info.ip + ' (' + info.label + ')', 'system');
                e.printLine('64 bytes from ' + info.ip + ': time=' + ms + 'ms', 'node-info');
                if (node.type === 'honeypot') {
                    s.honeypotPinged = true;
                    e.printLine('Host is UP -- ' + info.desc, 'info');
                    e.printLine('', 'system');
                    e.printLine('[*] Notice: Unusual response signature. Multiple services detected.', 'warning');
                    e.printLine('[*] Proceed with caution before deeper enumeration.', 'warning');
                } else { e.printLine('Host is UP -- ' + info.desc, 'info'); }
            }
        },

        // --- NMAP (override: honeypot trigger + DC hostname) ---
        'nmap': {
            help: 'Deep scan -- ports, OS, vulnerabilities', syntax: 'nmap <node>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: nmap <node name or IP>', 'error'); return; }
                var target = args.join(' '), node = e.resolveNode(target);
                if (!node) { e.printLine('Failed to resolve: ' + target, 'error'); return; }
                if (node.visibility === 'hidden') { e.printLine('Host seems down. Scan the area first.', 'error'); return; }
                var info = node.info;
                function padRight(str, n) { while (str.length < n) str += ' '; return str; }
                e.printLine('', 'system');
                e.printLine('Starting Nmap 7.94 scan on ' + info.ip + '...', 'system');
                e.printLine('', 'system');
                e.printLine('Nmap scan report for ' + info.label + ' (' + info.ip + ')', 'heading');
                e.printLine('Host is up (0.003s latency)', 'info');
                e.printLine('OS: ' + info.os, 'node-info');
                e.printLine('', 'system');
                e.printLine('PORT              STATE    SERVICE', 'heading');
                for (var p = 0; p < info.ports.length; p++) {
                    var parts = info.ports[p].split('/');
                    e.printLine(padRight(parts[0] + '/tcp', 18) + 'open     ' + parts[1].toLowerCase(), 'node-info');
                }
                s.nmapTargets.add(node.type);
                if (node.type === 'honeypot') {
                    s.nodesDiscovered.add('honeypot');
                    if (!s.honeypotPinged) {
                        s.honeypotTriggered = true;
                        e.printLine('', 'system');
                        e.printLine('[!] ALERT: Honeypot triggered! IDS notification sent.', 'error');
                        e.printLine('[!] Aggressive scan detected by deception layer. Alert logged.', 'error');
                    } else {
                        e.printLine('', 'system');
                        e.printLine('[*] Analysis: Service signatures inconsistent across reported ports.', 'warning');
                        e.printLine('[*] Response patterns indicate emulated services -- likely honeypot/canary system.', 'warning');
                        e.printLine('[*] Honeypot flagged. Avoid further interaction.', 'success');
                    }
                }
                if (node.type === 'internal-dc' && !s.dcHostnameFound) {
                    s.dcHostnameFound = true;
                    e.printLine('', 'system');
                    e.printLine('[+] NetBIOS hostname enumerated:', 'success');
                    e.printLine('    HEXDC01.corp.hexworth.local', 'success');
                    e.printLine('[+] Domain: corp.hexworth.local', 'success');
                    e.printLine('[+] AD Forest: hexworth.local', 'success');
                }
                e.printLine('', 'system');
                e.checkObjectives(); e.updateGrid(); e.saveState();
            }
        },

        // --- TRACEROUTE (domain-specific) ---
        'traceroute': {
            help: 'Show hop path to target node', syntax: 'traceroute <node>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: traceroute <node name or IP>', 'error'); return; }
                var target = args.join(' '), node = e.resolveNode(target);
                if (!node) { e.printLine('traceroute: unknown host ' + target, 'error'); return; }
                if (node.visibility === 'hidden') { e.printLine('traceroute: No route to host. Scan the area first.', 'error'); return; }
                var info = node.info;
                e.printLine('', 'system');
                e.printLine('traceroute to ' + info.ip + ' (' + info.label + ')', 'heading');
                var curType = c.grid.cells[s.position.row][s.position.col];
                if (node.type === curType) { e.printLine(' 1  ' + info.ip + '  0.1ms  [local]', 'node-info'); return; }
                if (node.type === 'internal-db' || node.type === 'internal-dc') {
                    e.printLine(' 1  172.16.0.1    (EDGE-ROUTER)   1.2ms', 'node-info');
                    e.printLine(' 2  172.16.0.5    (CORE-SWITCH)   1.8ms', 'node-info');
                    e.printLine(' 3  172.16.0.254  (VPN-GATEWAY)   2.4ms', 'node-info');
                    if (!s.pivoted) e.printLine(' 4  * * *  Request timed out (tunnel not established)', 'warning');
                    else e.printLine(' 4  ' + info.ip + '  (' + info.label + ')   3.1ms', 'node-info');
                } else if (node.type === 'vpn-gateway') {
                    e.printLine(' 1  172.16.0.1    (EDGE-ROUTER)   1.2ms', 'node-info');
                    e.printLine(' 2  172.16.0.5    (CORE-SWITCH)   1.8ms', 'node-info');
                    e.printLine(' 3  172.16.0.254  (VPN-GATEWAY)   2.4ms', 'node-info');
                } else if (node.type === 'honeypot') {
                    e.printLine(' 1  172.16.0.1    (EDGE-ROUTER)   1.2ms', 'node-info');
                    e.printLine(' 2  172.16.0.5    (CORE-SWITCH)   1.8ms', 'node-info');
                    e.printLine(' 3  172.16.2.99   (HONEYPOT)      2.1ms', 'node-info');
                } else {
                    e.printLine(' 1  172.16.0.1    (EDGE-ROUTER)   1.2ms', 'node-info');
                    e.printLine(' 2  ' + info.ip + '  (' + info.label + ')   1.9ms', 'node-info');
                }
                e.printLine('', 'system');
            }
        },

        // --- PIVOT (domain-specific) ---
        'pivot': {
            help: 'Establish VPN tunnel (must be at VPN-GATEWAY)',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];
                if (cellType !== 'vpn-gateway') { e.printLine('pivot: must be at VPN-GATEWAY node.', 'error'); e.printLine('Navigate to VPN-GATEWAY (172.16.0.254) first.', 'system'); return; }
                if (s.pivoted) { e.printLine('[*] IPSec tunnel already active. Internal subnet accessible.', 'info'); return; }
                e.printLine('', 'system');
                e.printLine('Establishing IPSec tunnel to 10.10.0.0/24...', 'system');
                e.printLine('  Initiating IKE phase 1... OK', 'info');
                e.printLine('  IKE phase 2 negotiation... OK', 'info');
                e.printLine('  SA established. Encryption: AES-256-GCM', 'info');
                e.printLine('', 'system');
                e.printLine('[+] Tunnel UP. Internal subnet 10.10.0.0/24 accessible.', 'success');
                e.printLine('[+] Routes added: 10.10.0.0/24 via 172.16.0.254', 'success');
                s.pivoted = true;
                s.visibility['3,2'] = s.visibility['3,2'] || 'revealed';
                e.checkObjectives(); e.updateGrid(); e.saveState();
            }
        },

        // --- STATUS (override: DMZ/VPN/honeypot display) ---
        'status': {
            help: 'Show position and objectives',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];
                var posLabel = (cellType !== 'empty' && cellType !== 'wall') ? c.nodes[cellType].label : 'Clear path';
                e.printLine('', 'system');
                e.printLine('\u2550\u2550\u2550 STATUS \u2550\u2550\u2550', 'heading');
                e.printLine('Position: (' + s.position.col + ',' + s.position.row + ') -- ' + posLabel, 'info');
                e.printLine('Nodes discovered: ' + s.nodesDiscovered.size + ' / 8', 'info');
                e.printLine('DMZ perimeter mapped: ' + s.dmzNodesMapped.size + ' / 3', 'info');
                e.printLine('VPN pivot: ' + (s.pivoted ? 'ACTIVE' : 'INACTIVE'), s.pivoted ? 'success' : 'warning');
                e.printLine('Honeypot status: ' + (s.honeypotTriggered ? 'TRIGGERED (alert logged)' : s.nodesDiscovered.has('honeypot') ? 'IDENTIFIED (clean)' : 'UNKNOWN'), s.honeypotTriggered ? 'error' : 'info');
                e.printLine('Commands used: ' + s.agentCmdCount, 'info');
                e.printLine('', 'system');
                e.printLine('Objectives:', 'heading');
                var objText = ['Map 3 DMZ perimeter nodes (' + s.dmzNodesMapped.size + '/3)', 'Identify honeypot without triggering IDS', 'Establish VPN pivot to internal subnet', 'Exfiltrate DC hostname (nmap internal-dc)'];
                for (var j = 0; j < s.objectives.length; j++) { e.printLine((s.objectives[j] ? ' [X] ' : ' [ ] ') + objText[j], s.objectives[j] ? 'success' : 'system'); }
            }
        }
    }
};
