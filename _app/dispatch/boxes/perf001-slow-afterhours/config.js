/* ============================================================
   DISPATCH LAB — Box PERF001: Network Slow After Hours
   CompTIA Network+ — Performance Troubleshooting (N10-009)
   5 scenarios: backup saturating WAN, Windows Update flood,
   cloud sync overnight, rogue torrent, switch 100Mbps
   ============================================================ */

var PERF001Config = {

    title: 'Network Slow After Hours',
    subtitle: 'Midnight Crawl — After-Hours Bandwidth Investigation',
    difficulty: 'Intermediate',
    accent: '#f59e0b',
    storageKey: 'hexworth_lab_perf001',
    registryId: 'perf001-slow-afterhours',
    trackerKey: 'lab_perf001',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the after-hours slowness complaint.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check bandwidth usage', tip: 'Open the Bandwidth Monitor to see real-time and historical traffic patterns.', trigger: { event: 'window_open', match: { type: 'bandwidth_mon' } } },
            { title: 'Investigate the source', tip: 'Use iperf3, netstat, show interface, or SNMP to identify what is consuming bandwidth.', trigger: { event: 'command', match: { cmd: 'contains:iperf' }, alt: [{ event: 'command', match: { cmd: 'contains:netstat' } }, { event: 'command', match: { cmd: 'contains:show' } }] } },
            { title: 'Apply the fix', tip: 'Stop the offending traffic, configure QoS, or fix the port negotiation.', trigger: { event: 'command', match: { cmd: 'contains:fix-' } } },
            { title: 'Capture the flag', tip: 'After resolving the issue, check the Bandwidth Monitor for the recovery token.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'Network+',
        mappings: [
            { flagId: 'fixed', objective: '5.3', description: 'Troubleshoot common network service issues', skill: 'Bandwidth Utilization Analysis' },
            { flagId: 'fixed', objective: '3.3', description: 'Explain high availability and disaster recovery — backup considerations', skill: 'After-Hours Traffic Management' }
        ]
    },

    _scenarios: [
        {
            id: 'backup_saturating',
            name: 'Backup Jobs Saturating WAN',
            ticketSubject: 'Network unusable after 6 PM — third shift cannot access cloud apps',
            ticketDetail: 'Third-shift workers report the network becomes extremely slow every evening between 6 PM and midnight. Cloud applications (Salesforce, O365) time out constantly. Wired and wireless users are both affected. The network is fine during the day. This has been happening for 2 weeks since the new off-site backup schedule was implemented.',
            ticketExtra: 'IT Note: A new Veeam backup job was configured to replicate to the DR site over the WAN link starting at 6 PM. The WAN link is 100 Mbps and the backup job appears to be consuming nearly all of it. No QoS policy is in place to prioritize production traffic.',
            fixDescription: 'Configure QoS policy to limit backup traffic to 40% of WAN bandwidth',
            stateOverrides: { _backupSaturating: true }
        },
        {
            id: 'wsus_flood',
            name: 'Windows Update Downloading Simultaneously',
            ticketSubject: 'Internet crawling every Tuesday night — all PCs downloading updates',
            ticketDetail: 'Every Tuesday evening, the internet connection slows to a crawl from about 7 PM to 11 PM. Remote access users cannot connect to VPN. Web browsing is nearly impossible. This has been a pattern for the last month. It coincides with Microsoft Patch Tuesday but should not be this severe.',
            ticketExtra: 'IT Note: WSUS was decommissioned last month and all 200 workstations are now pulling updates directly from Microsoft Update. Each PC downloads 500MB-2GB of updates simultaneously over the 100 Mbps WAN link. A WSUS server or Windows Update delivery optimization should be configured.',
            fixDescription: 'Deploy WSUS or configure Windows Update Delivery Optimization to reduce WAN impact',
            stateOverrides: { _wsusFlood: true }
        },
        {
            id: 'cloud_sync',
            name: 'Cloud Sync Running Overnight',
            ticketSubject: 'OneDrive and Dropbox syncing gigabytes overnight — WAN saturated',
            ticketDetail: 'The overnight security team reports that between 8 PM and 6 AM, network speeds drop to nearly zero. Investigation shows massive data transfers from multiple workstations. Users are leaving OneDrive and Dropbox running overnight and the combined sync traffic is overwhelming the WAN link.',
            ticketExtra: 'IT Note: 50+ workstations have OneDrive and/or Dropbox clients running. During the day, sync traffic is minimal (mostly small files). Overnight, several users have queued large folder syncs (engineering CAD files, video assets) totaling 200+ GB. No bandwidth management policy exists.',
            fixDescription: 'Configure bandwidth throttling for cloud sync clients and implement QoS',
            stateOverrides: { _cloudSync: true }
        },
        {
            id: 'rogue_torrent',
            name: 'Rogue Torrent Client',
            ticketSubject: 'Single workstation consuming 90% of bandwidth — suspicious traffic pattern',
            ticketDetail: 'SNMP monitoring shows one workstation (10.0.1.145) generating massive traffic after hours. The traffic pattern shows high upstream AND downstream, connecting to thousands of external IPs on random high ports. This looks like BitTorrent traffic. The workstation belongs to an intern who leaves their PC on overnight.',
            ticketExtra: 'IT Note: Port analysis shows connections on ports 6881-6889 (BitTorrent) and random ephemeral ports. The intern\'s workstation has an unauthorized BitTorrent client running. This is a policy violation and a security risk.',
            fixDescription: 'Block the torrent traffic at the firewall and disable the client on the workstation',
            stateOverrides: { _rogueTorrent: true, _torrentIp: '10.0.1.145' }
        },
        {
            id: 'switch_100mbps',
            name: 'Switch Port Negotiated to 100Mbps',
            ticketSubject: 'File server transfers crawling — takes 10x longer than expected',
            ticketDetail: 'The file server (10.0.1.20) is responding extremely slowly. Large file transfers that should take 2 minutes are taking 20+ minutes. The server NIC shows connected but performance is terrible. This started after the server was moved to a new rack last weekend. All users accessing the file server are affected.',
            ticketExtra: 'IT Note: The file server was reconnected to switch port Gi0/24 after the rack move. The port may have auto-negotiated to 100 Mbps instead of 1 Gbps due to a bad cable, dirty connector, or forced speed setting on one end.',
            fixDescription: 'Fix the port negotiation — replace cable or configure speed/duplex settings',
            stateOverrides: { _switchSpeed: true, _badPort: 'Gi0/24' }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Check the Bandwidth Monitor to see traffic patterns and peak usage times.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use iperf3 to test link speed, netstat to check connections, and show interface for port stats.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Look for backup jobs, update downloads, cloud sync, unauthorized apps, or port negotiation issues.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Apply the fix and verify bandwidth is restored.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        backup_saturating: [
            { id: 'hint1', text: 'Network slow 6 PM to midnight. Check what traffic starts at 6 PM.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run: show interface wan to see WAN utilization. Look for backup traffic.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Veeam backup is consuming 95% of the 100 Mbps WAN. No QoS in place.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: fix-qos backup-limit — limits backup to 40 Mbps, reserving 60 Mbps for production.', cost: 150, penalty: -150 }
        ],
        wsus_flood: [
            { id: 'hint1', text: 'Every Tuesday night. Patch Tuesday. 200 PCs downloading updates directly.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run: netstat -top-talkers to see which hosts are consuming the most bandwidth.', cost: 50, penalty: -50 },
            { id: 'hint3', text: '200 PCs downloading updates simultaneously from Microsoft. WSUS was decommissioned.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: fix-wsus deploy — configures Delivery Optimization / WSUS to centralize updates.', cost: 150, penalty: -150 }
        ],
        cloud_sync: [
            { id: 'hint1', text: 'Overnight saturation from cloud sync clients (OneDrive/Dropbox).', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run: netstat -top-talkers to identify the top bandwidth consumers.', cost: 50, penalty: -50 },
            { id: 'hint3', text: '50+ workstations syncing large files overnight. No bandwidth limits.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: fix-sync throttle — configures bandwidth limits for cloud sync clients via GPO.', cost: 150, penalty: -150 }
        ],
        rogue_torrent: [
            { id: 'hint1', text: 'Single workstation consuming 90% bandwidth. Check for unauthorized apps.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run: netstat -host 10.0.1.145 to see connections from the suspect workstation.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'BitTorrent traffic on ports 6881-6889. Thousands of connections to random external IPs.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: fix-firewall block-torrent — blocks BitTorrent ports and notifies the intern\'s manager.', cost: 150, penalty: -150 }
        ],
        switch_100mbps: [
            { id: 'hint1', text: 'File server slow since rack move. Check the switch port speed/duplex.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run: show interface gi0/24 to check the port negotiation status.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Port Gi0/24 negotiated to 100 Mbps half-duplex instead of 1 Gbps full-duplex.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: fix-port gi0/24 — forces 1 Gbps full-duplex negotiation and verifies link.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !PERF001Config._flagRestored) {
            PERF001Config._flagRestored = true;
            var s = PERF001Config._scenarios[engine.state._scenarioId];
            if (s) PERF001Config.hints = PERF001Config._scenarioHints[s.id] || PERF001Config._defaultHints;
        }
        return true;
    },

    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._scenarioSelected = true;
        engine.state._backupSaturating = false;
        engine.state._wsusFlood = false;
        engine.state._cloudSync = false;
        engine.state._rogueTorrent = false;
        engine.state._switchSpeed = false;
        engine.state._labComplete = false;
        engine.state._flagRevealed = false;
        engine.state._fixApplied = false;
        var overrides = PERF001Config._scenarios[idx].stateOverrides || {};
        for (var key in overrides) { engine.state[key] = overrides[key]; }
        PERF001Config._flagRestored = true;
        PERF001Config.hints = PERF001Config._scenarioHints[PERF001Config._scenarios[idx].id] || PERF001Config._defaultHints;
        engine.save();
    },

    _getScenario(engine) { return engine.state._scenarioId == null ? null : PERF001Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Help Desk Ticket first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['Cisco Catalyst 9300 IOS-XE 17.6', 'Memory: 8192MB', 'Flash: 16GB', 'Loading network OS...'], grubEntries: ['IOS-XE 17.6.3'], loginUser: 'netadmin' },

    desktop: {
        icons: [
            { id: 'terminal',      label: 'Terminal',            icon: '>_',  app: 'terminal' },
            { id: 'bandwidth_mon', label: 'Bandwidth\nMonitor',  icon: 'BW',  app: 'bandwidth_mon' },
            { id: 'switch_status', label: 'Switch\nPorts',       icon: 'SW',  app: 'switch_status' },
            { id: 'netflow',       label: 'NetFlow\nAnalyzer',   icon: 'NF',  app: 'netflow' },
            { id: 'server_info',   label: 'Network\nInfo',       icon: 'NET', app: 'server_info' },
            { id: 'ticket',        label: 'Help Desk\nTicket',   icon: 'HD',  app: 'ticket' },
            { id: 'hints',         label: 'Hints',               icon: '?',   app: 'hints' },
            { id: 'reset',         label: 'Reset\nLab',          icon: 'RST', app: 'reset_lab' }
        ]
    },

    terminal: { user: 'netadmin', hostname: 'SW-CORE01', startDir: '/home/netadmin', promptStyle: 'linux', welcome: 'Network Operations Console\nConnected to SW-CORE01 (Cisco Catalyst 9300)\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Check Bandwidth Monitor for traffic patterns.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use iperf3, netstat, show interface.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Look for backups, updates, sync, torrents, or port issues.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Apply the fix and verify.', cost: 50, penalty: -50 }
    ],
    lore: { intro: 'The network is slow after hours. Something is consuming all available bandwidth during the evening and overnight. Find the culprit and restore normal performance.', scenario: 'Each scenario has a different bandwidth consumer. Use monitoring tools and CLI commands to identify and resolve the issue.', outro: 'Bandwidth restored. After-hours performance is normal. Your network analysis identified the exact traffic pattern causing the saturation.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read ticket and check bandwidth usage.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the bandwidth consumer.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Stop or limit the offending traffic.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm and capture flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {

        iperf3: function(args, term, engine) {
            var gate = PERF001Config._requireScenario(engine);
            if (gate) return gate;
            var s = PERF001Config._getScenario(engine);
            if (engine.state._fixApplied) return '\n[ ID] Interval       Transfer    Bitrate\n[  5] 0.00-10.00 sec  112 MBytes  94.1 Mbits/sec  (WAN link healthy)\n';
            if (s.id === 'switch_100mbps') return '\n[ ID] Interval       Transfer    Bitrate\n[  5] 0.00-10.00 sec  11.2 MBytes  9.41 Mbits/sec\n\nWARNING: Expected ~940 Mbits/sec on GbE link. Getting only ~9.4 Mbits/sec.\nPossible 100 Mbps half-duplex negotiation or cable issue.\n';
            return '\n[ ID] Interval       Transfer    Bitrate\n[  5] 0.00-10.00 sec  5.6 MBytes   4.7 Mbits/sec\n\nWARNING: WAN throughput severely degraded. Expected ~94 Mbits/sec.\n';
        },

        netstat: function(args, term, engine) {
            var gate = PERF001Config._requireScenario(engine);
            if (gate) return gate;
            var s = PERF001Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (joined.includes('top-talkers') || joined.includes('-top')) {
                var outputs = {
                    backup_saturating: '\nTop Bandwidth Consumers (last hour):\n  1. 10.0.1.30 (BACKUP-SRV)  -> 172.16.0.5 (DR-SITE)    95.2 Mbps  (Veeam Backup)\n  2. 10.0.1.50 (WS-042)      -> 52.96.0.0/14            2.1 Mbps   (O365)\n  3. 10.0.1.51 (WS-043)      -> 52.96.0.0/14            1.8 Mbps   (O365)\n\nTotal WAN utilization: 99.1 Mbps / 100 Mbps (99%)\n',
                    wsus_flood: '\nTop Bandwidth Consumers (last hour):\n  1. 10.0.1.101-10.0.1.200   -> windowsupdate.com       96.5 Mbps  (200 hosts)\n  2. 10.0.1.50 (WS-042)      -> cdn.microsoft.com       0.8 Mbps\n\nTotal WAN utilization: 97.3 Mbps / 100 Mbps (97%)\nPattern: Every Tuesday 7 PM — consistent with Patch Tuesday\n',
                    cloud_sync: '\nTop Bandwidth Consumers (last hour):\n  1. 10.0.1.101-10.0.1.150   -> onedrive.live.com       52.3 Mbps  (50 hosts)\n  2. 10.0.1.101-10.0.1.150   -> dropbox.com             41.2 Mbps  (50 hosts)\n  3. Other                    -> various                  5.5 Mbps\n\nTotal WAN utilization: 99.0 Mbps / 100 Mbps (99%)\n',
                    rogue_torrent: '\nTop Bandwidth Consumers (last hour):\n  1. 10.0.1.145 (INTERN-PC)  -> various (4,200 hosts)   89.7 Mbps  (BitTorrent)\n     Ports: 6881-6889, random ephemeral\n  2. 10.0.1.50 (WS-042)      -> various                  3.2 Mbps\n\nTotal WAN utilization: 92.9 Mbps / 100 Mbps (93%)\n',
                    switch_100mbps: '\nTop Bandwidth Consumers (last hour):\n  1. 10.0.1.20 (FILE-SRV)    -> LAN clients              92.1 Mbps (normal)\n     Port Gi0/24: Operating at 100 Mbps (BOTTLENECK)\n  2. Other LAN traffic        -> various                   7.9 Mbps\n\nNote: File server link is 100 Mbps — should be 1 Gbps.\n'
                };
                return outputs[s.id] || '\n(no data)\n';
            }

            if (joined.includes('-host') && joined.includes('10.0.1.145')) {
                if (engine.state._rogueTorrent) {
                    return '\nActive connections from 10.0.1.145:\n  TCP  10.0.1.145:54321  ->  198.51.100.1:6881    ESTABLISHED (BitTorrent)\n  TCP  10.0.1.145:54322  ->  203.0.113.15:6882    ESTABLISHED (BitTorrent)\n  TCP  10.0.1.145:54323  ->  192.0.2.30:51413     ESTABLISHED (BitTorrent)\n  ... (4,197 more connections)\n\nApplication: qBittorrent v4.5.0\nTotal connections: 4,200\nPorts: 6881-6889, random ephemeral (51000-65000)\n';
                }
                return '\n(no active connections from 10.0.1.145)\n';
            }

            return '\nUsage: netstat -top-talkers    (show top bandwidth consumers)\n       netstat -host <ip>      (show connections from specific host)\n       netstat -an              (show all connections)\n';
        },

        show: function(args, term, engine) {
            var gate = PERF001Config._requireScenario(engine);
            if (gate) return gate;
            var s = PERF001Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (joined.includes('interface') && joined.includes('wan')) {
                if (engine.state._fixApplied) return '\nInterface: WAN (Gi0/1)\n  Status: up\n  Speed: 100 Mbps (WAN)\n  Input rate: 12.3 Mbps\n  Output rate: 8.7 Mbps\n  Utilization: 21%\n';
                return '\nInterface: WAN (Gi0/1)\n  Status: up\n  Speed: 100 Mbps (WAN)\n  Input rate: 94.7 Mbps\n  Output rate: 97.2 Mbps\n  Utilization: 97%\n  WARNING: Near saturation\n';
            }

            if (joined.includes('interface') && joined.includes('gi0/24')) {
                if (engine.state._switchSpeed && !engine.state._fixApplied) {
                    return '\nGigabitEthernet0/24 is up, line protocol is up\n  Hardware: GigabitEthernet\n  Speed: 100 Mbps (auto-negotiated)\n  Duplex: Half (auto-negotiated)\n  Input rate: 45.2 Mbps\n  Output rate: 48.1 Mbps\n  CRC errors: 147\n  Late collisions: 2,341\n\n  WARNING: Expected 1 Gbps full-duplex. Negotiated 100 Mbps half-duplex.\n  High CRC errors and late collisions suggest cable issue or duplex mismatch.\n';
                }
                return '\nGigabitEthernet0/24 is up, line protocol is up\n  Speed: 1000 Mbps (auto-negotiated)\n  Duplex: Full (auto-negotiated)\n  Input rate: 145.2 Mbps\n  Output rate: 168.1 Mbps\n  CRC errors: 0\n  Late collisions: 0\n';
            }

            if (joined.includes('qos')) {
                if (engine.state._fixApplied && s.id === 'backup_saturating') return '\nQoS Policy: WAN-BANDWIDTH-MGMT\n  Class: BACKUP-TRAFFIC\n    Bandwidth limit: 40 Mbps (40%)\n  Class: PRODUCTION\n    Bandwidth guarantee: 60 Mbps (60%)\n    Priority: High\n';
                return '\nNo QoS policy configured on WAN interface.\n';
            }

            return '\nUsage: show interface <name>\n       show interface wan\n       show interface gi0/24\n       show qos\n';
        },

        'fix-qos': function(args, term, engine) {
            var gate = PERF001Config._requireScenario(engine);
            if (gate) return gate;
            var s = PERF001Config._getScenario(engine);
            if (s.id === 'backup_saturating' && args.join(' ').toLowerCase().includes('backup')) {
                engine.state._fixApplied = true; engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save();
                setTimeout(function() { engine.notify('QoS policy applied. Backup limited to 40 Mbps. Production traffic restored. Check Bandwidth Monitor.', 'success'); }, 400);
                return '\nQoS Policy applied to WAN interface:\n  BACKUP-TRAFFIC: rate-limit 40 Mbps\n  PRODUCTION: guarantee 60 Mbps, priority high\nBackup will take longer but production traffic is protected.\n';
            }
            return '\nUsage: fix-qos backup-limit\n';
        },

        'fix-wsus': function(args, term, engine) {
            var gate = PERF001Config._requireScenario(engine);
            if (gate) return gate;
            var s = PERF001Config._getScenario(engine);
            if (s.id === 'wsus_flood' && args.join(' ').toLowerCase().includes('deploy')) {
                engine.state._fixApplied = true; engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save();
                setTimeout(function() { engine.notify('Windows Update Delivery Optimization configured. Updates will be shared peer-to-peer on LAN. Check Bandwidth Monitor.', 'success'); }, 400);
                return '\nWindows Update Delivery Optimization configured via GPO:\n  DODownloadMode: 2 (LAN peer-to-peer)\n  DOMaxBackgroundDownloadBandwidth: 10 Mbps per host\n  DODownloadOverMetered: Disabled\n200 workstations will share updates locally instead of each downloading from Microsoft.\n';
            }
            return '\nUsage: fix-wsus deploy\n';
        },

        'fix-sync': function(args, term, engine) {
            var gate = PERF001Config._requireScenario(engine);
            if (gate) return gate;
            var s = PERF001Config._getScenario(engine);
            if (s.id === 'cloud_sync' && args.join(' ').toLowerCase().includes('throttle')) {
                engine.state._fixApplied = true; engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save();
                setTimeout(function() { engine.notify('Cloud sync bandwidth throttled. WAN bandwidth restored. Check Bandwidth Monitor.', 'success'); }, 400);
                return '\nGPO applied — Cloud Sync Bandwidth Management:\n  OneDrive: MaxBandwidth = 5 Mbps per client (after hours)\n  Dropbox: MaxBandwidth = 5 Mbps per client (via proxy policy)\n  Total cloud sync cap: ~50 Mbps (50 clients x 1 Mbps effective)\nProduction bandwidth reserved.\n';
            }
            return '\nUsage: fix-sync throttle\n';
        },

        'fix-firewall': function(args, term, engine) {
            var gate = PERF001Config._requireScenario(engine);
            if (gate) return gate;
            var s = PERF001Config._getScenario(engine);
            if (s.id === 'rogue_torrent' && args.join(' ').toLowerCase().includes('block')) {
                engine.state._fixApplied = true; engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save();
                setTimeout(function() { engine.notify('BitTorrent traffic blocked. Bandwidth restored. Incident report generated. Check Bandwidth Monitor.', 'success'); }, 400);
                return '\nFirewall rules applied:\n  DENY TCP/UDP ports 6881-6889 (BitTorrent)\n  DENY application: BitTorrent (deep packet inspection)\n  Source: 10.0.1.145 — all P2P traffic blocked\n\nIncident report generated for HR:\n  User: Intern (10.0.1.145)\n  Violation: Unauthorized P2P software\n  Action: BitTorrent blocked, manager notified\n';
            }
            return '\nUsage: fix-firewall block-torrent\n';
        },

        'fix-port': function(args, term, engine) {
            var gate = PERF001Config._requireScenario(engine);
            if (gate) return gate;
            var s = PERF001Config._getScenario(engine);
            if (s.id === 'switch_100mbps' && args.join(' ').toLowerCase().includes('gi0/24')) {
                engine.state._fixApplied = true; engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save();
                setTimeout(function() { engine.notify('Port Gi0/24 now running at 1 Gbps full-duplex. File server performance restored. Check Bandwidth Monitor.', 'success'); }, 400);
                return '\nInterface GigabitEthernet0/24:\n  Cable tested: PASS (replaced Cat5 with Cat6a)\n  Speed renegotiated: 1000 Mbps (was: 100 Mbps)\n  Duplex: Full (was: Half)\n  CRC errors: 0 (was: 147)\n  Late collisions: 0 (was: 2,341)\n';
            }
            return '\nUsage: fix-port gi0/24\n';
        },

        ping: function(args, term, engine) {
            var gate = PERF001Config._requireScenario(engine);
            if (gate) return gate;
            if (!args.length) return '\nUsage: ping target\n';
            return '\nPING ' + args[args.length - 1] + ': 64 bytes, icmp_seq=1 ttl=64 time=1.2ms\n';
        },

        tracert: function(args, term, engine) {
            var gate = PERF001Config._requireScenario(engine);
            if (gate) return gate;
            if (!args.length) return '\nUsage: tracert target\n';
            return '\nTraceroute to ' + args[args.length - 1] + ':\n  1  10.0.1.1      1ms\n  2  172.16.0.1    5ms\n  3  ' + args[args.length - 1] + '  12ms\n';
        },

        whoami: function() { return 'netadmin'; },
        hostname: function() { return 'SW-CORE01'; },
        clear: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        ls: function() { return '\n(network device — no filesystem)\n'; }
    },

    onAppLaunch(iconDef, engine) {
        var req = ['bandwidth_mon', 'switch_status', 'netflow', 'server_info'];
        if (req.includes(iconDef.app) && !engine.state._scenarioSelected) { engine.notify('Open the Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket':        PERF001Config._openTicket(iconDef, engine); break;
            case 'bandwidth_mon': PERF001Config._openBW(iconDef, engine); break;
            case 'switch_status': PERF001Config._openSwitch(iconDef, engine); break;
            case 'netflow':       PERF001Config._openNetflow(iconDef, engine); break;
            case 'server_info':   PERF001Config._openNet(iconDef, engine); break;
            case 'reset_lab':     PERF001Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        PERF001Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) { PERF001Config._renderTicket(engine, c); } else { PERF001Config._renderPicker(engine, c); }
    },

    _renderPicker(engine, c) {
        var previews = ['Night Shift — "Network unusable after 6 PM every night"', 'Help Desk — "Internet crawling every Tuesday night"', 'Security — "OneDrive/Dropbox saturating WAN overnight"', 'NOC — "Single workstation consuming 90% bandwidth"', 'File Server — "Transfers 10x slower since rack move"'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#f59e0b; font-weight:bold; font-size:1.1rem;">PERFORMANCE QUEUE</div></div><div>';
        PERF001Config._scenarios.forEach(function(s, i) {
            html += '<button class="p1btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><div style="display:flex; justify-content:space-between;"><span style="color:#f59e0b; font-weight:bold;">PERF-' + (1000 + i) + '</span><span style="background:#e74c3c; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">URGENT</span></div><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>';
        });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="p1rand" style="padding:10px 28px; background:#f59e0b; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random Assignment</button></div>';
        c.innerHTML = html;
        c.querySelectorAll('.p1btn').forEach(function(b) { b.addEventListener('mouseenter', function() { this.style.borderColor = '#f59e0b'; }); b.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; }); b.addEventListener('click', function() { PERF001Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); PERF001Config._renderTicket(engine, c); }); });
        document.getElementById('p1rand').addEventListener('click', function() { PERF001Config._applyScenario(engine, Math.floor(Math.random() * PERF001Config._scenarios.length)); PERF001Config._renderTicket(engine, c); });
    },

    _renderTicket(engine, c) {
        var s = PERF001Config._getScenario(engine);
        var subs = ['Night Shift Supervisor', 'Help Desk Tier 1', 'Security Operations', 'NOC Engineer', 'SysAdmin Team'];
        c.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><div style="display:flex; justify-content:space-between;"><span style="color:#f59e0b; font-weight:bold;">PERF TICKET #PERF-' + (1000 + engine.state._scenarioId) + '</span><span style="background:#e74c3c; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">URGENT</span></div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBMITTED BY</div><div>' + subs[engine.state._scenarioId] + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + PERF001Config._escHtml(s.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + PERF001Config._escHtml(s.ticketDetail) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#fde68a;">' + PERF001Config._escHtml(s.ticketExtra) + '</div></div>'
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#f59e0b; font-weight:bold;">ASSIGNED TO: YOU — Network Administrator</div></div>';
    },

    _openBW(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); PERF001Config._renderBW(engine); return; }
        var c = document.createElement('div'); c.id = 'bwContainer';
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Bandwidth Monitor', 'BW', c);
        PERF001Config._renderBW(engine);
    },

    _renderBW(engine) {
        var c = document.getElementById('bwContainer'); if (!c) return;
        var s = PERF001Config._getScenario(engine);
        var html = '<div style="font-size:1rem; font-weight:bold; color:#f59e0b; margin-bottom:16px;">Bandwidth Monitor &mdash; WAN Link (100 Mbps)</div>';
        if (engine.state._fixApplied) {
            html += '<div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:4px; padding:16px; text-align:center;"><div style="color:#10b981; font-weight:bold; font-size:1.1rem;">Bandwidth Healthy</div><div style="color:#a7f3d0;">WAN utilization: 21% — Normal</div></div>';
            if (engine.state._flagRevealed) {
                html += '<div style="margin-top:16px; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:4px; padding:12px;"><div style="color:#10b981; font-weight:bold;">Fix Confirmed:</div><div id="p1flag" style="color:#c8e6c9;">Recovery token: loading...</div></div>';
            }
        } else {
            html += '<div style="background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; padding:16px; text-align:center; margin-bottom:16px;"><div style="color:#e74c3c; font-weight:bold; font-size:1.1rem;">WAN Utilization: 97%</div><div style="color:#ffcc80;">Link near saturation — production traffic impacted</div></div>';
        }
        c.innerHTML = html;
        if (engine.state._flagRevealed && engine.state._fixApplied) {
            BoxEngine.requestFlagText(s.id).then(function(ft) { var el = document.getElementById('p1flag'); if (el) el.textContent = 'Recovery token: ' + (ft || 'Flag unavailable'); });
        }
    },

    _openSwitch(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Switch Ports', 'SW', c);
        c.innerHTML = '<div style="font-size:1rem; font-weight:bold; color:#f59e0b; margin-bottom:16px;">Switch Port Status</div><div style="font-size:0.75rem; color:#aaa;">Use "show interface gi0/24" in terminal for detailed port info.</div>';
    },

    _openNetflow(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'NetFlow Analyzer', 'NF', c);
        c.innerHTML = '<div style="font-size:1rem; font-weight:bold; color:#f59e0b; margin-bottom:16px;">NetFlow Analyzer</div><div style="font-size:0.75rem; color:#aaa;">Use "netstat -top-talkers" in terminal for top bandwidth consumers.</div>';
    },

    _openNet(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Network Info', 'NET', c);
        c.innerHTML = '<div style="font-size:1rem; font-weight:bold; color:#f59e0b; margin-bottom:16px;">Network Infrastructure</div><div style="font-size:0.75rem; color:#aaa; line-height:1.8;"><div>WAN Link: 100 Mbps (ISP: Comcast Business)</div><div>LAN: 1 Gbps switched (Cisco Catalyst 9300)</div><div>Gateway: 10.0.1.1</div><div>Subnet: 10.0.1.0/24 (200 hosts)</div><div>File Server: 10.0.1.20 (Gi0/24)</div><div>Backup Server: 10.0.1.30</div><div>DR Site: 172.16.0.5 (VPN tunnel)</div></div>';
    },

    _confirmReset(engine) {
        var o = document.createElement('div');
        o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px 32px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9; max-width:360px;"><div style="color:#e74c3c; font-weight:bold; margin-bottom:12px;">Reset Lab?</div><div style="color:#aaa; font-size:0.8rem; margin-bottom:20px;">Clear progress and restart.</div><div style="display:flex; gap:12px; justify-content:center;"><button id="p1rc" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="p1cc" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('p1rc').addEventListener('click', function() { PERF001Config._flagRestored = false; PERF001Config.hints = PERF001Config._defaultHints; engine.reset(); });
        document.getElementById('p1cc').addEventListener('click', function() { o.remove(); });
        o.addEventListener('click', function(e) { if (e.target === o) o.remove(); });
    }
};
