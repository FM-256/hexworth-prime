/* ================================================================
   RECON-03: Phantom Network -- Mission Config
   ================================================================
   Terminal-mode mission. 5x6 grid: corporate network with hidden
   APT infrastructure. Rogue AP, honeypot traps, VPN-gated staging
   server, exfiltration path tracing.

   Custom commands: scan, move, ping, nmap, traceroute, arp, whois.
   Honeypot traps: scanning honeypots triggers IDS (integrity -1).
   Honeypots do not respond to ping (timeout) -- ping sweep first.
   VPN gate on staging-server requires nmap on rogue-ap first.

   NOTE: This mission has custom state beyond the engine baseline:
   - rogueAPFound, exfilTraced, vpnBypassed + standard
     nodesDiscovered/nmapTargets.
   ================================================================ */

var RECON_03_CONFIG = {
    id: 'recon-03',
    missionTitle: 'RECON-03',
    title: 'Phantom Network',
    subtitle: 'An APT shadow network hides inside corporate infrastructure. Map it. Trace it. Expose it.',
    category: 'network-recon',
    difficulty: 2,
    inputMode: 'terminal',
    promptText: 'kali@phantom:~$ ',
    promptLabel: 'TERMINAL',
    notFoundMsg: 'Unknown command: {cmd}\nType "help" for available commands.',

    newConcept: {
        label: 'Trap Avoidance',
        description: 'Some nodes are honeypots. Scan results show warnings -- check before moving. Honeypots do not respond to ping.'
    },

    grid: {
        rows: 5,
        cols: 6,
        cells: [
            ['legitimate-router', 'legitimate-switch', 'dns-server',     'mail-server',   'wall',           'wall'],
            ['empty',             'core-switch',        'empty',          'workstation-1',  'honeypot-1',     'wall'],
            ['wall',              'empty',              'rogue-ap',       'empty',          'workstation-2',  'wall'],
            ['wall',              'siem-server',        'empty',          'vpn-gate',       'empty',          'honeypot-2'],
            ['wall',              'wall',               'wall',           'empty',          'staging-server', 'exfil-endpoint']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'legitimate-router': { label: 'CORP-ROUTER',     abbr: 'RTR', ip: '192.168.1.1',   desc: 'Corporate perimeter router -- border gateway',                ports: ['22/SSH','179/BGP','443/HTTPS-MGMT'],                       os: 'Cisco IOS-XE 17.9' },
        'legitimate-switch': { label: 'DIST-SWITCH',     abbr: 'DSW', ip: '192.168.1.2',   desc: 'Distribution layer switch -- VLAN trunking',                  ports: ['22/SSH','161/SNMP','8080/MGMT-UI'],                        os: 'Arista EOS 4.31' },
        'dns-server':        { label: 'DNS-SERVER',      abbr: 'DNS', ip: '192.168.1.10',  desc: 'Internal DNS resolver -- recursive + authoritative',          ports: ['53/DNS','22/SSH','953/RNDC'],                              os: 'BIND 9 on Ubuntu 22.04' },
        'mail-server':       { label: 'MAIL-SERVER',     abbr: 'MLS', ip: '192.168.1.20',  desc: 'Corporate mail relay -- Exchange transport',                  ports: ['25/SMTP','143/IMAP','587/SUBMISSION','443/OWA'],           os: 'Exchange 2019 on Win Server 2022' },
        'core-switch':       { label: 'CORE-SWITCH',     abbr: 'CSW', ip: '192.168.1.5',   desc: 'Core L3 switch -- inter-VLAN routing',                        ports: ['22/SSH','161/SNMP','8080/MGMT-UI'],                        os: 'Cisco Nexus NX-OS 10.3' },
        'workstation-1':     { label: 'WORKSTATION-1',   abbr: 'WS1', ip: '192.168.2.101', desc: 'Finance department workstation',                              ports: ['135/RPC','445/SMB','3389/RDP'],                            os: 'Windows 11 Enterprise' },
        'workstation-2':     { label: 'WORKSTATION-2',   abbr: 'WS2', ip: '192.168.2.102', desc: 'Engineering department workstation',                          ports: ['22/SSH','135/RPC','445/SMB','3389/RDP'],                   os: 'Windows 11 Enterprise' },
        'honeypot-1':        { label: 'HP-PRINTER-04',   abbr: 'HP1', ip: '192.168.2.200', desc: 'Appears to be a network printer -- multiple open services',   ports: ['22/SSH','80/HTTP','631/IPP','9100/RAW-PRINT','445/SMB'],   os: 'HP JetDirect (simulated)', honeypot: true },
        'honeypot-2':        { label: 'NAS-BACKUP-02',   abbr: 'HP2', ip: '192.168.3.200', desc: 'Appears to be a NAS backup device -- many services exposed',  ports: ['22/SSH','80/HTTP','443/HTTPS','445/SMB','5000/SYNOLOGY'],  os: 'Synology DSM (simulated)', honeypot: true },
        'rogue-ap':          { label: 'PRINT-SRV-03',    abbr: 'RAP', ip: '192.168.2.50',  desc: 'Registered as print server -- unusual traffic patterns',      ports: ['22/SSH','80/HTTP','631/IPP','1194/OPENVPN'],               os: 'Debian 12 (modified)',
            mac: 'DE:AD:BE:EF:13:37', vendor: 'Unknown Vendor (OUI not registered)', legitimateVendor: 'HP Inc.' },
        'vpn-gate':          { label: 'VPN-GATE',        abbr: 'VPG', ip: '192.168.2.254', desc: 'Encrypted tunnel endpoint -- requires credentials',           ports: ['443/HTTPS','1194/OPENVPN','4500/NAT-T'],                  os: 'OpenVPN Access Server 2.12' },
        'siem-server':       { label: 'SIEM-SERVER',     abbr: 'SIM', ip: '192.168.1.50',  desc: 'Security monitoring -- Splunk instance',                      ports: ['22/SSH','8000/SPLUNK-WEB','8089/SPLUNK-API','514/SYSLOG'], os: 'Splunk Enterprise 9.2 on RHEL 9' },
        'staging-server':    { label: 'STAGING-SRV',     abbr: 'STG', ip: '10.99.0.10',    desc: 'APT staging server -- exfil staging area',                    ports: ['22/SSH','443/HTTPS','8443/C2-PANEL','4444/REVERSE-SHELL'], os: 'Kali Linux 2024.1 (attacker-controlled)' },
        'exfil-endpoint':    { label: 'EXFIL-ENDPOINT',  abbr: 'EXF', ip: '10.99.0.99',    desc: 'External C2 relay -- data exfiltration endpoint',             ports: ['443/HTTPS','8080/HTTP-PROXY','53/DNS-TUNNEL'],            os: 'Alpine Linux 3.19 (minimal footprint)',
            externalIP: '198.51.100.47', aptGroup: 'PHANTOM COLLECTIVE', attribution: 'Eastern European APT cluster, first observed 2023-Q2. Known for supply-chain compromise and DNS tunneling exfil.' }
    },

    traps: [],
    gates: {},

    // Honeypot node types for trap detection
    honeypotNodes: ['honeypot-1', 'honeypot-2'],

    // APT zone: cells that require VPN bypass to enter
    aptZone: function(col, row, cells) {
        var type = cells[row][col];
        if (type === 'staging-server' || type === 'exfil-endpoint') return true;
        if (row === 4 && col >= 3 && type === 'empty') return true;
        return false;
    },

    objectives: [
        { id: 'discover-6',    label: 'Discover 6 nodes',                check: 'nodesDiscovered.size >= 6' },
        { id: 'rogue-ap-id',   label: 'Identify the rogue access point', check: 'rogueAPFound' },
        { id: 'exfil-traced',  label: 'Trace the exfiltration path',     check: 'exfilTraced' },
        { id: 'vpn-bypass',    label: 'Bypass VPN to APT network',       check: 'vpnBypassed' },
        { id: 'reach-staging', label: 'Reach the staging server',        check: 'nodesDiscovered.has("staging-server")' }
    ],

    integrity: 3,

    completion: {
        title: 'PHANTOM NETWORK',
        subtitle: 'Shadow network exposed. APT infrastructure mapped. PHANTOM COLLECTIVE attributed.',
        storageKey: 'hexworth_operator_recon03'
    },

    briefing: [
        'Agent deployed at corporate perimeter.',
        'Intelligence indicates APT presence inside the network.',
        'Hidden nodes masquerade as legitimate devices.',
        'Map the phantom network. Identify the rogue AP.',
        'Trace the exfil path. Locate the staging server.',
        '',
        'WARNING: Honeypot traps detected. Ping before you scan.',
        'Honeypots do not respond to ping -- use this to your advantage.'
    ],

    commands: ['scan', 'move', 'ping', 'nmap', 'traceroute', 'arp', 'whois', 'status', 'help', 'clear'],

    // Custom state fields beyond engine baseline
    customState: {
        rogueAPFound: false,
        exfilTraced: false,
        vpnBypassed: false
    },

    // ----------------------------------------------------------------
    //  TERMINAL COMMANDS (override standard + domain-specific)
    // ----------------------------------------------------------------

    terminalCommands: {

        // --- SCAN (override: honeypot warning indicators for adjacent honeypots) ---
        'scan': {
            help: 'Survey area, reveal adjacent nodes',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var col = s.position.col, row = s.position.row;
                var cellType = c.grid.cells[row][col];
                var HPOTS = new Set(c.honeypotNodes);

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
                    if (type === 'wall') {
                        e.printLine('  ' + d.name + ': [blocked]', 'system');
                        continue;
                    }
                    var key = nc + ',' + nr;
                    if (!s.visibility[key] || s.visibility[key] === 'hidden') s.visibility[key] = 'revealed';
                    if (type === 'empty') {
                        e.printLine('  ' + d.name + ': Clear path', 'info');
                    } else {
                        var info = c.nodes[type];
                        e.printLine('  ' + d.name + ': ' + info.label + ' (' + info.ip + ')', 'node-info');
                        if (HPOTS.has(type)) {
                            e.printLine('    [!] Anomaly: Excessive open services for device class. Verify before scanning.', 'warning');
                        }
                    }
                }
                e.updateGrid(); e.checkObjectives(); e.saveState();
            }
        },

        // --- MOVE (override: APT zone VPN gate check) ---
        'move': {
            help: 'Move agent (north/south/east/west or n/s/e/w)', syntax: 'move <dir>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: move <direction>', 'error'); return; }
                var dirMap = {'north':[0,-1],'n':[0,-1],'south':[0,1],'s':[0,1],'east':[1,0],'e':[1,0],'west':[-1,0],'w':[-1,0]};
                var dir = args[0].toLowerCase();
                if (!dirMap[dir]) { e.printLine('Unknown direction: ' + args[0], 'error'); return; }
                var d = dirMap[dir];
                var nc = s.position.col + d[0], nr = s.position.row + d[1];
                if (nc < 0 || nc >= c.grid.cols || nr < 0 || nr >= c.grid.rows) { e.printLine('Edge of network. Cannot move ' + dir + '.', 'error'); return; }
                var cellType = c.grid.cells[nr][nc];
                if (cellType === 'wall') { e.printLine('Blocked. No traversable path ' + dir + '.', 'error'); return; }
                // APT zone VPN gate check
                if (!s.vpnBypassed && c.aptZone(nc, nr, c.grid.cells)) {
                    e.printLine('[!] Encrypted tunnel blocks access.', 'warning');
                    e.printLine('VPN credentials required. Navigate to VPN-GATE and use credentials from rogue AP.', 'info');
                    return;
                }
                s.position = { col: nc, row: nr };
                s.visibility[nc + ',' + nr] = 'visited';
                if (cellType !== 'empty') s.nodesDiscovered.add(cellType);
                e.revealAdjacent(nc, nr);
                var dirFull = {n:'north',s:'south',e:'east',w:'west'};
                var dirName = dirFull[dir] || dir;
                if (cellType === 'empty') {
                    e.printLine('Moving ' + dirName + '... Clear path.', 'system');
                } else {
                    var info = c.nodes[cellType];
                    e.printLine('Moving ' + dirName + '... ' + info.label + ' (' + info.ip + ')', 'success');
                    e.printLine(info.desc, 'info');
                    if (cellType === 'vpn-gate' && !s.vpnBypassed) {
                        e.printLine('', 'system');
                        e.printLine('[*] VPN tunnel endpoint. Credentials needed to proceed.', 'info');
                        e.printLine('[*] Hint: The rogue AP may hold the key. Try nmap on suspicious devices.', 'info');
                    }
                }
                e.checkObjectives(); e.updateGrid(); e.saveState();
            }
        },

        // --- PING (override: honeypots do not respond -- timeout) ---
        'ping': {
            help: 'Ping a node by name or IP', syntax: 'ping <node>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: ping <node name or IP>', 'error'); return; }
                var target = args.join(' '), node = e.resolveNode(target);
                if (!node) { e.printLine('ping: unknown host ' + target, 'error'); return; }
                if (node.visibility === 'hidden') { e.printLine('Request timed out. No route to host.', 'error'); return; }
                var info = node.info;
                var HPOTS = new Set(c.honeypotNodes);
                e.printLine('PING ' + info.ip + ' (' + info.label + ')', 'system');
                if (HPOTS.has(node.type)) {
                    e.printLine('--- ' + info.ip + ' ping statistics ---', 'system');
                    e.printLine('4 packets transmitted, 0 received, 100% packet loss', 'warning');
                    e.printLine('', 'system');
                    e.printLine('[*] No response. Host may be down or blocking ICMP.', 'warning');
                    e.printLine('[*] Device claims to be online but does not answer ping -- suspicious.', 'warning');
                } else {
                    var ms = (Math.random() * 5 + 0.5).toFixed(1);
                    e.printLine('64 bytes from ' + info.ip + ': time=' + ms + 'ms', 'node-info');
                    e.printLine('Host is UP -- ' + info.desc, 'info');
                }
            }
        },

        // --- NMAP (override: honeypot IDS trigger + rogue-ap reveals VPN creds) ---
        'nmap': {
            help: 'Deep scan -- ports, OS, vulnerabilities', syntax: 'nmap <node>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: nmap <node name or IP>', 'error'); return; }
                var target = args.join(' '), node = e.resolveNode(target);
                if (!node) { e.printLine('Failed to resolve: ' + target, 'error'); return; }
                if (node.visibility === 'hidden') { e.printLine('Host seems down. Scan the area first.', 'error'); return; }
                var info = node.info;
                var HPOTS = new Set(c.honeypotNodes);
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

                // Honeypot trap: triggers IDS alert and integrity loss
                if (HPOTS.has(node.type)) {
                    s.nodesDiscovered.add(node.type);
                    e.printLine('', 'system');
                    e.printLine('[!] ALERT: IDS triggered! Deception system activated.', 'error');
                    e.printLine('[!] Aggressive scan on ' + info.label + ' flagged by security monitoring.', 'error');
                    e.printLine('[!] SIEM correlation alert dispatched. Integrity compromised.', 'error');
                    s.integrity = (s.integrity || c.integrity) - 1;
                    e.printLine('[!] Integrity: ' + s.integrity + ' / ' + c.integrity, 'error');
                }

                // Rogue AP: reveals hidden OpenVPN service + VPN credentials
                if (node.type === 'rogue-ap') {
                    s.nodesDiscovered.add('rogue-ap');
                    e.printLine('', 'system');
                    e.printLine('[+] Hidden service detected on port 1194/OPENVPN', 'success');
                    e.printLine('[+] Banner grab: OpenVPN 2.6.8 -- APT tunnel endpoint', 'success');
                    e.printLine('[+] Configuration leak found in /etc/openvpn/client.conf:', 'success');
                    e.printLine('    remote 192.168.2.254 1194', 'success');
                    e.printLine('    auth-user-pass: phantom_op / Gh0st!Tunn3l#2024', 'success');
                    e.printLine('', 'system');
                    e.printLine('[*] These credentials may grant access through the VPN gate.', 'info');
                    if (info.mac) {
                        e.printLine('', 'system');
                        e.printLine('[+] MAC address: ' + info.mac, 'success');
                        e.printLine('[+] OUI lookup: ' + info.vendor, 'warning');
                        e.printLine('[*] Device registered as print server but MAC vendor unrecognized.', 'warning');
                        s.rogueAPFound = true;
                    }
                }

                // Staging server: reveals C2 infrastructure
                if (node.type === 'staging-server') {
                    e.printLine('', 'system');
                    e.printLine('[+] C2 panel detected on port 8443:', 'success');
                    e.printLine('    PHANTOM C2 Framework v3.1.7', 'success');
                    e.printLine('[+] Reverse shell listener on port 4444', 'success');
                    e.printLine('[+] Staged payloads found: mimikatz.exe, sharphound.exe, chisel', 'success');
                    e.printLine('[+] Exfil queue: 14 compressed archives pending transfer', 'success');
                }

                e.printLine('', 'system');
                e.checkObjectives(); e.updateGrid(); e.saveState();
            }
        },

        // --- TRACEROUTE (domain-specific: reveals exfil chain) ---
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
                if (node.type === curType) {
                    e.printLine(' 1  ' + info.ip + '  0.1ms  [local]', 'node-info');
                    return;
                }

                // Exfil endpoint: reveals the full exfiltration chain
                if (node.type === 'exfil-endpoint') {
                    e.printLine(' 1  192.168.1.1    (CORP-ROUTER)      1.2ms', 'node-info');
                    e.printLine(' 2  192.168.1.5    (CORE-SWITCH)      1.8ms', 'node-info');
                    e.printLine(' 3  192.168.2.50   (PRINT-SRV-03)     2.1ms  [!] rogue device', 'warning');
                    e.printLine(' 4  192.168.2.254  (VPN-GATE)         2.9ms  [!] encrypted hop', 'warning');
                    e.printLine(' 5  10.99.0.10     (STAGING-SRV)      3.4ms  [!] APT staging', 'warning');
                    if (!s.vpnBypassed) {
                        e.printLine(' 6  * * *  Request timed out (tunnel not established)', 'warning');
                    } else {
                        e.printLine(' 6  10.99.0.99     (EXFIL-ENDPOINT)   4.2ms  [!] C2 relay', 'warning');
                    }
                    e.printLine('', 'system');
                    e.printLine('[+] EXFILTRATION PATH IDENTIFIED:', 'success');
                    e.printLine('    Workstations -> Rogue AP -> VPN Gate -> Staging -> Exfil C2', 'success');
                    e.printLine('[+] Data flows through rogue AP (PRINT-SRV-03) acting as covert relay.', 'success');
                    s.exfilTraced = true;
                    e.checkObjectives(); e.saveState();
                    return;
                }

                // Staging server
                if (node.type === 'staging-server') {
                    e.printLine(' 1  192.168.1.1    (CORP-ROUTER)      1.2ms', 'node-info');
                    e.printLine(' 2  192.168.2.50   (PRINT-SRV-03)     2.1ms', 'node-info');
                    e.printLine(' 3  192.168.2.254  (VPN-GATE)         2.9ms', 'node-info');
                    if (!s.vpnBypassed) {
                        e.printLine(' 4  * * *  Request timed out (tunnel not established)', 'warning');
                    } else {
                        e.printLine(' 4  10.99.0.10     (STAGING-SRV)     3.4ms', 'node-info');
                    }
                }
                // APT zone general
                else if (node.type === 'vpn-gate') {
                    e.printLine(' 1  192.168.1.1    (CORP-ROUTER)      1.2ms', 'node-info');
                    e.printLine(' 2  192.168.1.5    (CORE-SWITCH)      1.8ms', 'node-info');
                    e.printLine(' 3  192.168.2.254  (VPN-GATE)         2.4ms', 'node-info');
                }
                // Rogue AP
                else if (node.type === 'rogue-ap') {
                    e.printLine(' 1  192.168.1.1    (CORP-ROUTER)      1.2ms', 'node-info');
                    e.printLine(' 2  192.168.1.5    (CORE-SWITCH)      1.8ms', 'node-info');
                    e.printLine(' 3  192.168.2.50   (PRINT-SRV-03)     2.1ms', 'node-info');
                }
                // Default: 2-hop path through router
                else {
                    e.printLine(' 1  192.168.1.1    (CORP-ROUTER)      1.2ms', 'node-info');
                    e.printLine(' 2  ' + info.ip + '  (' + info.label + ')   1.9ms', 'node-info');
                }
                e.printLine('', 'system');
            }
        },

        // --- ARP (domain-specific: reveals MAC vendor mismatch on rogue AP) ---
        'arp': {
            help: 'Show ARP table at current node -- reveals MAC addresses', syntax: 'arp [-a]',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var col = s.position.col, row = s.position.row;
                e.printLine('', 'system');
                e.printLine('ARP Table (local segment):', 'heading');
                e.printLine('', 'system');

                // Gather adjacent + current nodes for ARP output
                var dirs = [{dc:0,dr:0},{dc:0,dr:-1},{dc:0,dr:1},{dc:1,dr:0},{dc:-1,dr:0}];
                var seen = {};
                var foundRogue = false;
                for (var i = 0; i < dirs.length; i++) {
                    var nc = col + dirs[i].dc, nr = row + dirs[i].dr;
                    if (nc < 0 || nc >= c.grid.cols || nr < 0 || nr >= c.grid.rows) continue;
                    var type = c.grid.cells[nr][nc];
                    if (type === 'wall' || type === 'empty') continue;
                    var key = nc + ',' + nr;
                    if (s.visibility[key] === 'hidden') continue;
                    if (seen[type]) continue;
                    seen[type] = true;
                    var info = c.nodes[type];
                    // Generate deterministic MACs for normal devices
                    var mac = info.mac || 'AA:BB:CC:' + info.ip.split('.').slice(1).map(function(o) {
                        var h = parseInt(o).toString(16).toUpperCase();
                        return h.length < 2 ? '0' + h : h;
                    }).join(':');
                    var vendor = info.vendor || 'Registered Vendor';
                    var padIP = info.ip;
                    while (padIP.length < 16) padIP += ' ';
                    e.printLine('  ' + padIP + ' at ' + mac + '  [' + vendor + ']', 'node-info');
                    if (type === 'rogue-ap') {
                        foundRogue = true;
                    }
                }
                if (foundRogue) {
                    e.printLine('', 'system');
                    e.printLine('[!] ANOMALY DETECTED:', 'warning');
                    e.printLine('[!] PRINT-SRV-03 (192.168.2.50) -- MAC vendor "Unknown Vendor (OUI not registered)"', 'warning');
                    e.printLine('[!] Expected vendor for print server: HP Inc. or similar.', 'warning');
                    e.printLine('[!] MAC prefix DE:AD:BE does not match any registered OUI.', 'warning');
                    e.printLine('[*] This device may not be what it claims to be.', 'info');
                    s.rogueAPFound = true;
                    e.checkObjectives(); e.saveState();
                }
                if (!Object.keys(seen).length) {
                    e.printLine('  (no entries -- no adjacent nodes visible)', 'system');
                }
                e.printLine('', 'system');
            }
        },

        // --- WHOIS (domain-specific: APT attribution on exfil-endpoint) ---
        'whois': {
            help: 'Lookup registration info on external IP or node', syntax: 'whois <node>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: whois <node name or IP>', 'error'); return; }
                var target = args.join(' '), node = e.resolveNode(target);
                if (!node) { e.printLine('whois: unknown host ' + target, 'error'); return; }
                if (node.visibility === 'hidden') { e.printLine('whois: No route to host. Scan the area first.', 'error'); return; }
                var info = node.info;
                e.printLine('', 'system');
                e.printLine('WHOIS lookup for ' + info.ip + ':', 'heading');
                e.printLine('', 'system');

                if (node.type === 'exfil-endpoint') {
                    e.printLine('% WHOIS query for ' + info.externalIP, 'system');
                    e.printLine('', 'system');
                    e.printLine('NetRange:       198.51.100.0 - 198.51.100.255', 'node-info');
                    e.printLine('NetName:        PHANTOM-NET-01', 'node-info');
                    e.printLine('Organization:   Bullet-proof hosting (offshore)', 'node-info');
                    e.printLine('RegDate:        2023-06-14', 'node-info');
                    e.printLine('Updated:        2024-11-02', 'node-info');
                    e.printLine('Country:        RO (Romania)', 'node-info');
                    e.printLine('', 'system');
                    e.printLine('[+] THREAT INTELLIGENCE MATCH:', 'success');
                    e.printLine('    APT Group: ' + info.aptGroup, 'success');
                    e.printLine('    ' + info.attribution, 'success');
                    e.printLine('    Infrastructure overlaps with campaigns: GHOST-HARVEST, DARK-CONDUIT', 'success');
                } else if (node.type === 'staging-server') {
                    e.printLine('% WHOIS query for 10.99.0.10', 'system');
                    e.printLine('', 'system');
                    e.printLine('NetRange:       10.99.0.0 - 10.99.0.255', 'node-info');
                    e.printLine('NetName:        APT-INTERNAL-STAGING', 'node-info');
                    e.printLine('Description:    RFC1918 private range (attacker-controlled segment)', 'node-info');
                    e.printLine('', 'system');
                    e.printLine('[*] Private address space. Not externally routable.', 'info');
                    e.printLine('[*] This subnet was carved out by the threat actor inside the VPN tunnel.', 'info');
                } else {
                    e.printLine('% WHOIS query for ' + info.ip, 'system');
                    e.printLine('', 'system');
                    e.printLine('NetRange:       ' + info.ip.replace(/\.\d+$/, '.0') + ' - ' + info.ip.replace(/\.\d+$/, '.255'), 'node-info');
                    e.printLine('NetName:        CORP-INTERNAL', 'node-info');
                    e.printLine('Description:    Corporate internal network (RFC1918)', 'node-info');
                    e.printLine('', 'system');
                    e.printLine('[*] Standard internal address. No external registration.', 'info');
                }
                e.printLine('', 'system');
            }
        },

        // --- PIVOT (at VPN-GATE: requires nmap on rogue-ap first for creds) ---
        'pivot': {
            help: 'Establish VPN tunnel (must be at VPN-GATE with credentials)',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];
                if (cellType !== 'vpn-gate') {
                    e.printLine('pivot: must be at VPN-GATE node.', 'error');
                    e.printLine('Navigate to VPN-GATE (192.168.2.254) first.', 'system');
                    return;
                }
                if (s.vpnBypassed) {
                    e.printLine('[*] VPN tunnel already active. APT subnet accessible.', 'info');
                    return;
                }
                // Require nmap on rogue-ap to have found the credentials
                if (!s.nmapTargets.has('rogue-ap')) {
                    e.printLine('[!] VPN requires authentication.', 'warning');
                    e.printLine('[!] No credentials available. Investigate suspicious devices on the network.', 'warning');
                    e.printLine('[*] Hint: Look for devices with unusual characteristics. Use arp and nmap.', 'info');
                    return;
                }
                e.printLine('', 'system');
                e.printLine('Connecting to VPN endpoint 192.168.2.254:1194...', 'system');
                e.printLine('  Using credentials: phantom_op / Gh0st!Tunn3l#2024', 'info');
                e.printLine('  TLS handshake... OK', 'info');
                e.printLine('  Authentication... OK', 'info');
                e.printLine('  Tunnel established. Cipher: AES-256-GCM', 'info');
                e.printLine('', 'system');
                e.printLine('[+] VPN UP. APT subnet 10.99.0.0/24 now accessible.', 'success');
                e.printLine('[+] Routes added: 10.99.0.0/24 via 192.168.2.254', 'success');
                s.vpnBypassed = true;
                e.checkObjectives(); e.updateGrid(); e.saveState();
            }
        },

        // --- STATUS (override: phantom network progress) ---
        'status': {
            help: 'Show position and objectives',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];
                var posLabel = (cellType !== 'empty' && cellType !== 'wall') ? c.nodes[cellType].label : 'Clear path';
                e.printLine('', 'system');
                e.printLine('=== PHANTOM NETWORK STATUS ===', 'heading');
                e.printLine('Position: (' + s.position.col + ',' + s.position.row + ') -- ' + posLabel, 'info');
                e.printLine('Nodes discovered: ' + s.nodesDiscovered.size + ' / 13', 'info');
                e.printLine('Rogue AP: ' + (s.rogueAPFound ? 'IDENTIFIED' : 'UNKNOWN'), s.rogueAPFound ? 'success' : 'warning');
                e.printLine('Exfil path: ' + (s.exfilTraced ? 'TRACED' : 'UNKNOWN'), s.exfilTraced ? 'success' : 'warning');
                e.printLine('VPN tunnel: ' + (s.vpnBypassed ? 'ACTIVE' : 'INACTIVE'), s.vpnBypassed ? 'success' : 'warning');
                e.printLine('Integrity: ' + (s.integrity !== undefined ? s.integrity : c.integrity) + ' / ' + c.integrity, (s.integrity !== undefined && s.integrity < c.integrity) ? 'error' : 'info');
                e.printLine('Commands used: ' + s.agentCmdCount, 'info');
                e.printLine('', 'system');
                e.printLine('Objectives:', 'heading');
                var objText = [
                    'Discover 6 nodes (' + s.nodesDiscovered.size + '/6)',
                    'Identify the rogue access point (arp vendor mismatch)',
                    'Trace the exfiltration path (traceroute exfil-endpoint)',
                    'Bypass VPN to APT network (pivot at VPN-GATE)',
                    'Reach the staging server'
                ];
                for (var j = 0; j < s.objectives.length; j++) {
                    e.printLine((s.objectives[j] ? ' [X] ' : ' [ ] ') + objText[j], s.objectives[j] ? 'success' : 'system');
                }
            }
        }
    }
};
