/* ============================================================
   DISPATCH LAB — Box PR6: Mobile Print Mayhem
   CompTIA A+ Core 2 / Network+ — Mobile Printing Troubleshooting
   5 scenarios: AirPrint mDNS blocked, Cloud Print deprecated,
   Mopria not finding, SSL cert untrusted, guest WiFi isolated
   ============================================================ */

var PR6Config = {

    title: 'Mobile Print Mayhem',
    subtitle: 'No Printer Found — A+ Core 2 / Network+ Mobile Printing',
    difficulty: 'Intermediate',
    accent: '#e67e22',
    storageKey: 'hexworth_lab_pr6',
    registryId: 'pr006-mobile-print',
    trackerKey: 'lab_pr6',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the mobile printing complaint.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check network configuration', tip: 'Use Network Settings or Command Prompt to check VLAN, mDNS, and firewall settings.', trigger: { event: 'window_open', match: { type: 'network_panel' }, alt: [{ event: 'command', match: { cmd: 'contains:ping' } }] } },
            { title: 'Diagnose the mobile print issue', tip: 'Identify whether the issue is mDNS/Bonjour, deprecated protocol, Mopria discovery, SSL certificates, or VLAN isolation.', trigger: { event: 'command', match: { cmd: 'contains:netsh' }, alt: [{ event: 'window_open', match: { type: 'network_panel' } }] } },
            { title: 'Apply the fix', tip: 'Enable mDNS relay, configure Mopria, update certificates, or bridge VLANs for printer access.', trigger: { event: 'command', match: { cmd: 'contains:fix' }, alt: [{ event: 'window_open', match: { type: 'network_panel' } }] } },
            { title: 'Capture the flag', tip: 'After restoring mobile printing, locate the token.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: { certPath: 'A+ Core 2, Network+', mappings: [
        { flagId: 'fixed', objective: '3.1', description: 'Troubleshoot common Windows OS problems', skill: 'Mobile and Wireless Printing' },
        { flagId: 'fixed', objective: '5.5', description: 'Troubleshoot network service issues', skill: 'mDNS, VLAN, Certificate Management' }
    ] },

    _printers: [
        { name: 'HP Color LaserJet Pro M479', ip: '192.168.1.240', port: 'IP_192.168.1.240', location: 'Conference Room A', type: 'Network', driver: 'HP CLJ Pro M479', status: 'Ready' },
        { name: 'Epson WorkForce Pro WF-4830', ip: '192.168.1.245', port: 'IP_192.168.1.245', location: 'Break Room', type: 'Network/WiFi', driver: 'Epson WF-4830', status: 'Ready' },
        { name: 'Brother MFC-L3770CDW', ip: '192.168.1.250', port: 'IP_192.168.1.250', location: 'Reception', type: 'Network', driver: 'Brother MFC-L3770CDW', status: 'Ready' }
    ],

    _scenarioFlags: { mdns_blocked: null, cloud_print_dead: null, mopria_fail: null, ssl_untrusted: null, guest_isolated: null },

    _scenarios: [
        {
            id: 'mdns_blocked',
            name: 'AirPrint Discovery Fails (mDNS Blocked)',
            ticketSubject: 'iPhone cannot find the HP printer in Conference Room A — AirPrint sees nothing',
            ticketDetail: 'I am trying to print from my iPhone to the HP in Conference Room A. When I tap Print, the AirPrint picker shows "No AirPrint Printers Found." The printer supports AirPrint — it worked before. My phone is connected to the corporate WiFi. Other people with iPhones have the same problem.',
            ticketExtra: 'IT Note: AirPrint uses mDNS (Bonjour) for discovery on port 5353/UDP. The network team recently implemented VLAN segmentation. WiFi clients are on VLAN 30 and printers are on VLAN 10. mDNS is a broadcast protocol that does not cross VLAN boundaries without a relay or Bonjour gateway.',
            affectedPrinter: 0,
            fixDescription: 'Enable mDNS/Bonjour relay between VLAN 10 (printers) and VLAN 30 (WiFi)',
            stateOverrides: { _mdnsBlocked: true }
        },
        {
            id: 'cloud_print_dead',
            name: 'Google Cloud Print Deprecated',
            ticketSubject: 'Android phone used to print via Google Cloud Print — now it just errors out',
            ticketDetail: 'My Android phone used to print to the Epson in the break room using Google Cloud Print. Now when I try, I get an error saying the service is unavailable. This was working a few months ago. I have not changed anything on my phone. Is the printer broken?',
            ticketExtra: 'IT Note: Google Cloud Print was officially deprecated and shut down on December 31, 2020. Users who relied on it need to migrate to a supported mobile printing protocol such as Mopria, IPP, or the manufacturer app.',
            affectedPrinter: 1,
            fixDescription: 'Configure Mopria Print Service or manufacturer app as Cloud Print replacement',
            stateOverrides: { _cloudPrintDead: true }
        },
        {
            id: 'mopria_fail',
            name: 'Mopria Not Finding Printer',
            ticketSubject: 'Android phone has Mopria installed but cannot discover the Brother at Reception',
            ticketDetail: 'I installed the Mopria Print Service on my Android phone as IT suggested. But when I try to print, it searches for printers and finds nothing. The Brother at reception supports Mopria according to the spec sheet. My phone is on the corporate WiFi. What am I missing?',
            ticketExtra: 'IT Note: Mopria uses IPP (port 631) and DNS-SD for discovery, similar to AirPrint. The printer must have IPP enabled in its network settings. Also, the printer web interface shows IPP is currently disabled — it was turned off during a security hardening pass.',
            affectedPrinter: 2,
            fixDescription: 'Enable IPP on the printer and ensure DNS-SD discovery is active',
            stateOverrides: { _mopriaFail: true }
        },
        {
            id: 'ssl_untrusted',
            name: 'Print Server SSL Certificate Untrusted',
            ticketSubject: 'iPads show "Cannot Verify Server Identity" when trying to print via print server',
            ticketDetail: 'Several iPads used by the sales team show a "Cannot Verify Server Identity" warning when they try to print through our print server. Some users tap Continue and it still fails. Others are afraid to tap Continue because they think it might be a security issue. This started after IT updated the print server.',
            ticketExtra: 'IT Note: The print server was rebuilt last week and a new self-signed SSL certificate was generated. iOS devices do not trust self-signed certificates by default. The certificate needs to be issued by the corporate CA or the CA root certificate needs to be distributed to the iPads via MDM.',
            affectedPrinter: 0,
            fixDescription: 'Deploy corporate CA root certificate to iPads via MDM or replace self-signed cert',
            stateOverrides: { _sslUntrusted: true }
        },
        {
            id: 'guest_isolated',
            name: 'Guest WiFi Isolated from Printer VLAN',
            ticketSubject: 'Visiting client cannot print from laptop on guest WiFi — sees no printers',
            ticketDetail: 'We have a client visiting today who needs to print a contract from their laptop. They are connected to our Guest WiFi network. When they try to add a printer or print, they cannot find any printers at all. I tested from my corporate laptop and I can print fine. The guest just cannot see anything.',
            ticketExtra: 'IT Note: Guest WiFi is on VLAN 50 (10.0.50.0/24) which is intentionally isolated from internal VLANs for security. Printers are on VLAN 10 (192.168.1.0/24). There is no routing between guest and printer VLANs. Options: guest print portal, temporary VLAN access, or USB direct print.',
            affectedPrinter: 1,
            fixDescription: 'Set up guest print portal or provide temporary cross-VLAN access for printing',
            stateOverrides: { _guestIsolated: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Mobile printing relies on discovery protocols (mDNS, DNS-SD, IPP). Check if they are reachable.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'VLAN segmentation, deprecated services, disabled protocols, and certificates are common blockers.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Open the Network Panel to inspect VLAN, mDNS, and printer protocol settings.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after fixing the mobile printing issue.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        mdns_blocked: [
            { id: 'hint1', text: 'AirPrint uses mDNS (Bonjour) on port 5353. This is a broadcast/multicast protocol.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'iPhones are on VLAN 30, printers on VLAN 10. mDNS does not cross VLANs without a relay.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Enable an mDNS/Bonjour relay (Avahi reflector or Bonjour gateway) between VLAN 10 and VLAN 30.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Network Panel: VLAN Configuration > Enable mDNS Relay between VLAN 10 and VLAN 30.', cost: 150, penalty: -150 }
        ],
        cloud_print_dead: [
            { id: 'hint1', text: 'Google Cloud Print was shut down in 2020. It is permanently unavailable.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The user needs an alternative: Mopria, manufacturer app, or direct IPP printing.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Install Mopria Print Service from the Play Store and enable IPP on the Epson printer.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Network Panel: Printer Settings > Enable IPP > Then configure Mopria on the user device.', cost: 150, penalty: -150 }
        ],
        mopria_fail: [
            { id: 'hint1', text: 'Mopria is installed but cannot discover printers. Check if the printer has IPP enabled.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'IPP (port 631) is required for Mopria. The security team disabled it during hardening.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Re-enable IPP on the Brother printer and ensure DNS-SD discovery is active.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Network Panel: Printer Protocol Settings > Enable IPP (port 631) > Enable DNS-SD.', cost: 150, penalty: -150 }
        ],
        ssl_untrusted: [
            { id: 'hint1', text: 'iOS devices reject self-signed certificates. The print server was rebuilt with a new self-signed cert.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Deploy the corporate CA root certificate to iPads via MDM, or replace the self-signed cert with a CA-signed one.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Use MDM to push the corporate CA certificate, or generate a new cert from the internal CA.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Network Panel: Certificate Management > Deploy Corporate CA via MDM Profile.', cost: 150, penalty: -150 }
        ],
        guest_isolated: [
            { id: 'hint1', text: 'Guest WiFi is intentionally isolated from internal VLANs. Printers are unreachable by design.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Options: guest print portal, temporary VLAN override, email-to-print, or USB direct.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Enable a guest print portal that accepts jobs from VLAN 50 and forwards them to VLAN 10.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'In Network Panel: Guest Services > Enable Guest Print Portal for cross-VLAN printing.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !PR6Config._flagRestored) { PR6Config._flagRestored = true; var s = PR6Config._scenarios[engine.state._scenarioId]; if (s) PR6Config.hints = PR6Config._scenarioHints[s.id] || PR6Config._defaultHints; } return true; },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        engine.state._mdnsBlocked = false; engine.state._cloudPrintDead = false; engine.state._mopriaFail = false; engine.state._sslUntrusted = false; engine.state._guestIsolated = false;
        engine.state._labComplete = false; engine.state._flagRevealed = false;
        var ov = PR6Config._scenarios[idx].stateOverrides || {}; for (var k in ov) engine.state[k] = ov[k];
        PR6Config._flagRestored = true; PR6Config.hints = PR6Config._scenarioHints[PR6Config._scenarios[idx].id] || PR6Config._defaultHints; engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : PR6Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Help Desk Ticket first.'; },
    _getPrinterState(engine, idx) {
        var p = JSON.parse(JSON.stringify(PR6Config._printers[idx])); var s = PR6Config._getScenario(engine); if (!s) return p;
        if (s.id === 'mdns_blocked' && idx === 0) p.status = engine.state._mdnsBlocked ? 'Ready (mDNS Unreachable)' : 'Ready';
        if (s.id === 'cloud_print_dead' && idx === 1) p.status = engine.state._cloudPrintDead ? 'Ready (Cloud Print Unavailable)' : 'Ready';
        if (s.id === 'mopria_fail' && idx === 2) p.status = engine.state._mopriaFail ? 'Ready (IPP Disabled)' : 'Ready';
        if (s.id === 'ssl_untrusted' && idx === 0) p.status = engine.state._sslUntrusted ? 'Warning - SSL Certificate Untrusted' : 'Ready';
        if (s.id === 'guest_isolated' && idx === 1) p.status = engine.state._guestIsolated ? 'Ready (Guest VLAN Isolated)' : 'Ready';
        return p;
    },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['UEFI BIOS v2.20', 'Memory: 16384 MB', 'Boot: NVMe0'], grubEntries: ['Windows 10 Pro'], loginUser: 'Technician' },
    desktop: { icons: [
        { id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' },
        { id: 'print_management', label: 'Print\nManagement', icon: 'PRT', app: 'print_management' },
        { id: 'network_panel', label: 'Network\nPanel', icon: 'NET', app: 'network_panel' },
        { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' },
        { id: 'hints', label: 'Hints', icon: '?', app: 'hints' },
        { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }
    ] },
    terminal: { user: 'Technician', hostname: 'HELPDESK01', startDir: 'C:\\Users\\Technician', promptStyle: 'windows', welcome: 'Microsoft Windows [Version 10.0.19045.3803]\n(c) Microsoft Corporation. All rights reserved.\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Mobile printing uses mDNS, IPP, DNS-SD for discovery.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Check VLANs, protocols, certificates, and service availability.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use the Network Panel to inspect configuration.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Flag appears after fixing mobile printing.', cost: 50, penalty: -50 }
    ],
    lore: { intro: 'Mobile printing adds complexity — discovery protocols, VLAN segmentation, deprecated services, and certificate trust all play a role.', scenario: 'Each scenario targets a different mobile printing failure mode. Diagnose whether the issue is network, protocol, or certificate related.', outro: 'Mobile printing restored. Users can print from phones and tablets again.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read ticket and check mobile print settings.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the mobile printing failure.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Fix the mobile printing issue.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm mobile printing works.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        ping: function(args, term, engine) {
            var g = PR6Config._requireScenario(engine); if (g) return g; if (!args.length) return '\nUsage: ping target';
            var t = args[args.length - 1];
            if (t === '192.168.1.240' || t === '192.168.1.245' || t === '192.168.1.250') return '\nPinging ' + t + ' with 32 bytes of data:\nReply from ' + t + ': bytes=32 time=2ms TTL=64\n\nPackets: Sent = 4, Received = 4, Lost = 0';
            if (t === '127.0.0.1') return '\nReply from 127.0.0.1: bytes=32 time<1ms TTL=128';
            return '\nPing request could not find host ' + t;
        },
        netsh: function(args, term, engine) {
            var g = PR6Config._requireScenario(engine); if (g) return g;
            var j = args.join(' ').toLowerCase();
            if (j.includes('firewall') && j.includes('show')) return '\nInbound mDNS (5353/UDP): BLOCKED\nInbound IPP (631/TCP): BLOCKED\nInbound RAW (9100/TCP): ALLOWED';
            return '\nUsage: netsh advfirewall firewall show rule name=all';
        },
        ipconfig: function(args, term, engine) { return '\nIPv4 Address: 192.168.1.50\nSubnet Mask: 255.255.255.0\nGateway: 192.168.1.1'; },
        whoami: function() { return 'HELPDESK01\\Technician'; },
        hostname: function() { return 'HELPDESK01'; },
        cls: function(a, t) { t.outputEl.innerHTML = ''; return null; },
        dir: function() { return ' Directory of C:\\Users\\Technician\n  0 File(s)'; },
        ifconfig: function() { return '\'ifconfig\' is not recognized.'; },
        sudo: function() { return '\'sudo\' is not recognized.'; }
    },

    onAppLaunch(iconDef, engine) {
        if (['print_management', 'network_panel'].includes(iconDef.app) && !engine.state._scenarioSelected) { engine.notify('Open the Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': PR6Config._openTicket(iconDef, engine); break;
            case 'print_management': PR6Config._openPM(iconDef, engine); break;
            case 'network_panel': PR6Config._openNetPanel(iconDef, engine); break;
            case 'reset_lab': PR6Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        PR6Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) PR6Config._renderTicket(engine, c); else PR6Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var pv = ['Sarah Chen — "iPhone cannot find HP via AirPrint"', 'Mike Rodriguez — "Android Cloud Print stopped working"', 'Tanya Brooks — "Mopria cannot find the Brother"', 'Sales Team — "iPads show certificate warning"', 'Reception — "Guest client cannot print from laptop"'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#e67e22; font-weight:bold; font-size:1.1rem;">HELP DESK QUEUE</div></div><div>';
        PR6Config._scenarios.forEach(function(s, i) { html += '<button class="pr6-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><span style="color:#e67e22; font-weight:bold;">PR-' + (6000 + i) + '</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + pv[i] + '</div></button>'; });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="pr6Rand" style="padding:10px 28px; background:#e67e22; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.pr6-btn').forEach(function(b) { b.addEventListener('click', function() { PR6Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); PR6Config._renderTicket(engine, container); }); });
        document.getElementById('pr6Rand').addEventListener('click', function() { PR6Config._applyScenario(engine, Math.floor(Math.random() * 5)); PR6Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var sc = PR6Config._getScenario(engine); var pr = PR6Config._printers[sc.affectedPrinter];
        var subs = ['Sarah Chen — Marketing', 'Mike Rodriguez — Facilities', 'Tanya Brooks — HR', 'Sales Team Lead', 'Reception — Visitor Services'];
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><span style="color:#e67e22; font-weight:bold;">TICKET #PR-' + (6000 + engine.state._scenarioId) + '</span></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">FROM</div><div>' + subs[engine.state._scenarioId] + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">PRINTER</div><div style="color:#e67e22; font-weight:bold;">' + pr.name + ' (' + pr.location + ')</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + PR6Config._escHtml(sc.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:4px; line-height:1.6;">' + PR6Config._escHtml(sc.ticketDetail) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(255,165,0,0.08); border:1px solid rgba(255,165,0,0.2); padding:12px; border-radius:4px; color:#ffcc80;">' + PR6Config._escHtml(sc.ticketExtra) + '</div></div>'
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px; color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div>';
    },

    _openPM(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.style.cssText = 'padding:16px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Print Management', 'PRT', c);
        var html = '<div style="font-weight:bold; color:#e67e22; margin-bottom:12px;">Printers</div>';
        PR6Config._printers.forEach(function(p, i) { var st = PR6Config._getPrinterState(engine, i); var w = st.status.includes('Warning') || st.status.includes('Unreachable') || st.status.includes('Disabled') || st.status.includes('Unavailable') || st.status.includes('Isolated'); html += '<div style="padding:8px; margin-bottom:4px; border:1px solid ' + (w ? 'rgba(231,76,60,0.25)' : 'rgba(255,255,255,0.06)') + '; border-radius:4px;"><span style="font-weight:bold;">' + st.name + '</span> | <span style="color:' + (w ? '#f39c12' : '#2ecc71') + ';">' + st.status + '</span></div>'; });
        c.innerHTML = html;
    },

    _openNetPanel(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); PR6Config._renderNetPanel(engine); return; }
        var c = document.createElement('div'); c.id = 'npContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Network Panel — Mobile Print Config', 'NET', c);
        PR6Config._renderNetPanel(engine);
    },

    _renderNetPanel(engine) {
        var c = document.getElementById('npContainer'); if (!c) return;
        var sc = PR6Config._getScenario(engine);
        if (!sc) { c.innerHTML = '<div style="color:#888;">No active scenario.</div>'; return; }
        var html = '<div style="font-size:1rem; font-weight:bold; color:#e67e22; margin-bottom:16px;">Mobile Print Network Configuration</div>';

        var comps = [];
        if (sc.id === 'mdns_blocked') {
            comps.push({ name: 'VLAN Configuration', desc: 'VLAN 10: Printers (192.168.1.0/24) | VLAN 30: WiFi Clients (192.168.3.0/24)', issue: false });
            comps.push({ name: 'mDNS/Bonjour Relay', desc: engine.state._mdnsBlocked ? 'ALERT: mDNS relay is DISABLED. AirPrint discovery packets from VLAN 30 cannot reach printers on VLAN 10. Bonjour uses multicast which does not cross VLAN boundaries without a relay.' : 'mDNS relay is ENABLED between VLAN 10 and VLAN 30. AirPrint discovery working.', issue: engine.state._mdnsBlocked, fixId: 'enable_mdns', action: 'Enable mDNS Relay' });
        } else if (sc.id === 'cloud_print_dead') {
            comps.push({ name: 'Google Cloud Print', desc: 'SERVICE DISCONTINUED (Dec 31, 2020). This protocol is permanently unavailable. Users must migrate to Mopria, IPP, or manufacturer apps.', issue: true });
            comps.push({ name: 'Mopria / IPP Alternative', desc: engine.state._cloudPrintDead ? 'ALERT: IPP (port 631) is available on the Epson but Mopria Print Service is not configured on the user device. Configure as Cloud Print replacement.' : 'Mopria configured as Cloud Print replacement. IPP enabled.', issue: engine.state._cloudPrintDead, fixId: 'setup_mopria', action: 'Configure Mopria as Replacement' });
        } else if (sc.id === 'mopria_fail') {
            comps.push({ name: 'IPP Protocol (Port 631)', desc: engine.state._mopriaFail ? 'ALERT: IPP is DISABLED on the Brother printer. Mopria requires IPP for communication. IPP was disabled during the security hardening pass.' : 'IPP is ENABLED. Mopria can discover and communicate with the printer.', issue: engine.state._mopriaFail, fixId: 'enable_ipp', action: 'Enable IPP on Printer' });
            comps.push({ name: 'DNS-SD Discovery', desc: engine.state._mopriaFail ? 'DNS-SD is dependent on IPP. Enable IPP first, then DNS-SD will advertise the printer.' : 'DNS-SD is active and advertising the printer.', issue: engine.state._mopriaFail });
        } else if (sc.id === 'ssl_untrusted') {
            comps.push({ name: 'Print Server Certificate', desc: engine.state._sslUntrusted ? 'ALERT: Print server is using a SELF-SIGNED certificate. iOS devices do not trust self-signed certificates. Certificate was regenerated during server rebuild.' : 'Print server certificate is signed by corporate CA. Trusted by all managed devices.', issue: engine.state._sslUntrusted, fixId: 'deploy_cert', action: 'Deploy Corporate CA via MDM' });
            comps.push({ name: 'MDM Configuration', desc: 'MDM server: Jamf Pro. 47 iPads managed. CA profile deployment available.', issue: false });
        } else if (sc.id === 'guest_isolated') {
            comps.push({ name: 'Guest WiFi (VLAN 50)', desc: 'Network: 10.0.50.0/24 | Isolation: FULL | Internet: YES | Internal access: NONE', issue: false });
            comps.push({ name: 'Guest Print Portal', desc: engine.state._guestIsolated ? 'ALERT: No guest print portal configured. Guest VLAN 50 has no route to Printer VLAN 10. Guests cannot print to any internal printer.' : 'Guest print portal enabled. Guests can submit jobs via web portal at print.corp.local.', issue: engine.state._guestIsolated, fixId: 'enable_portal', action: 'Enable Guest Print Portal' });
        }

        comps.forEach(function(comp) {
            html += '<div style="margin-bottom:12px; padding:12px; background:' + (comp.issue ? 'rgba(231,76,60,0.06)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (comp.issue ? 'rgba(231,76,60,0.25)' : 'rgba(255,255,255,0.06)') + '; border-radius:4px;"><div style="font-weight:bold; color:' + (comp.issue ? '#e74c3c' : '#2ecc71') + ';">' + comp.name + '</div><div style="color:#aaa; font-size:0.75rem; margin:4px 0 8px;">' + comp.desc + '</div>';
            if (comp.action && comp.issue) html += '<button class="np-fix" data-fix="' + comp.fixId + '" style="padding:6px 16px; background:#e67e22; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.75rem; font-weight:bold;">' + comp.action + '</button>';
            html += '</div>';
        });

        if (engine.state._flagRevealed) {
            var labels = { mdns_blocked: 'mDNS relay enabled. AirPrint discovery working across VLANs.', cloud_print_dead: 'Mopria configured as Cloud Print replacement.', mopria_fail: 'IPP enabled on printer. Mopria discovery active.', ssl_untrusted: 'Corporate CA deployed to iPads. Certificate trusted.', guest_isolated: 'Guest print portal enabled. Cross-VLAN printing available.' };
            var flagElId = 'pr6-flag-' + sc.id;
            html += '<div style="margin-top:16px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;"><div style="color:#2ecc71; font-weight:bold;">Fix Confirmed:</div><div>' + labels[sc.id] + '</div><div id="' + flagElId + '" style="margin-top:4px;">Token: loading...</div></div>';
            setTimeout(function() { BoxEngine.requestFlagText(sc.id).then(function(f) { var el = document.getElementById(flagElId); if (el) el.textContent = 'Token: ' + (f || 'Flag unavailable'); }); }, 0);
        }

        c.innerHTML = html;
        c.querySelectorAll('.np-fix').forEach(function(btn) { btn.addEventListener('click', function() { PR6Config._applyFix(engine, this.getAttribute('data-fix')); }); });
    },

    _applyFix(engine, fixId) {
        var sc = PR6Config._getScenario(engine); if (!sc) return; var fixed = false;
        if (fixId === 'enable_mdns' && sc.id === 'mdns_blocked') { engine.state._mdnsBlocked = false; fixed = true; }
        if (fixId === 'setup_mopria' && sc.id === 'cloud_print_dead') { engine.state._cloudPrintDead = false; fixed = true; }
        if (fixId === 'enable_ipp' && sc.id === 'mopria_fail') { engine.state._mopriaFail = false; fixed = true; }
        if (fixId === 'deploy_cert' && sc.id === 'ssl_untrusted') { engine.state._sslUntrusted = false; fixed = true; }
        if (fixId === 'enable_portal' && sc.id === 'guest_isolated') { engine.state._guestIsolated = false; fixed = true; }
        if (fixed) { engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save(); engine.notify('Mobile printing restored. Check Network Panel for the token.', 'success'); PR6Config._renderNetPanel(engine); }
    },

    _confirmReset(engine) {
        var o = document.createElement('div'); o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9;"><div style="color:#e74c3c; font-weight:bold; margin-bottom:12px;">Reset Lab?</div><div style="display:flex; gap:12px; justify-content:center;"><button id="pr6RC" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="pr6CC" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('pr6RC').addEventListener('click', function() { PR6Config._flagRestored = false; PR6Config.hints = PR6Config._defaultHints; engine.reset(); });
        document.getElementById('pr6CC').addEventListener('click', function() { o.remove(); });
        o.addEventListener('click', function(e) { if (e.target === o) o.remove(); });
    }
};
