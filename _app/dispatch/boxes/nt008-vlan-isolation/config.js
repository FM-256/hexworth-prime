/* ============================================================
   ARENA LAB — Box NT008: VLAN Isolation
   Network Troubleshooting — Network+ N10-009
   5 scenarios: wrong VLAN, trunk not allowing VLAN,
   native VLAN mismatch, inter-VLAN routing disabled, SVI not created
   ============================================================ */

const NT008Config = {

    title: 'VLAN Isolation',
    subtitle: 'VLAN Troubleshooting — Network+',
    difficulty: 'Advanced',
    accent: '#f97316',
    storageKey: 'hexworth_lab_nt008',
    registryId: 'nt008-vlan-isolation',
    trackerKey: 'lab_nt008',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the complaint about network isolation.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check switch port config', tip: 'Connect to the switch CLI and run show vlan brief and show interfaces trunk.', trigger: { event: 'command', match: { cmd: 'contains:show' } } },
            { title: 'Verify VLAN assignments', tip: 'Check which VLAN the user port is in and if it matches the expected VLAN.', trigger: { event: 'command', match: { cmd: 'contains:vlan' } } },
            { title: 'Fix the VLAN config', tip: 'Use Switch CLI or Switch Config to correct the VLAN issue.', trigger: { event: 'command', match: { cmd: 'contains:switchport' }, alt: [{ event: 'window_open', match: { type: 'switch_config' } }] } },
            { title: 'Verify connectivity', tip: 'Ping across VLANs to confirm the fix. Find the flag.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'N10-009',
        mappings: [
            { flagId: 'fixed', objective: '2.3', description: 'Configure and deploy common Ethernet switching features', skill: 'VLANs, Trunking, Inter-VLAN Routing' },
            { flagId: 'fixed', objective: '5.3', description: 'Troubleshoot common network connectivity issues', skill: 'VLAN Isolation, Trunk Issues' },
            { flagId: 'fixed', objective: '2.1', description: 'Compare and contrast various devices and their features', skill: 'Managed Switches, Layer 3 Switches, SVIs' }
        ]
    },

    _scenarioFlags: { wrong_vlan: null, trunk_missing: null, native_mismatch: null, intervlan_disabled: null, svi_missing: null },

    _scenarios: [
        {
            id: 'wrong_vlan',
            name: 'Port in Wrong VLAN',
            ticketSubject: 'Can\'t reach any servers after moving to new cubicle',
            ticketDetail: 'I just moved to a new cubicle in the Sales area. I plugged into the wall jack and got an IP address (10.20.0.105) but I can\'t reach any of the Engineering servers I need (10.10.0.x). Before I moved, everything worked fine from my old cubicle.',
            ticketExtra: 'IT Note: The user is an engineer who moved to the Sales floor. Their wall jack (switch port Gi0/12) is in VLAN 20 (Sales, 10.20.0.0/24) but they need to be in VLAN 10 (Engineering, 10.10.0.0/24).',
            fixDescription: 'Change switch port Gi0/12 from VLAN 20 to VLAN 10',
            brokenConfig: { adapter: 'enabled', ip: '10.20.0.105', subnet: '255.255.255.0', gateway: '10.20.0.1', dns1: '10.10.0.2', dns2: '' },
            stateOverrides: { _wrongVLAN: true, _currentVLAN: 20, _targetVLAN: 10, _port: 'Gi0/12' },
            flagLocation: 'Switch CLI show vlan brief after fix'
        },
        {
            id: 'trunk_missing',
            name: 'Trunk Not Allowing VLAN',
            ticketSubject: 'Entire VLAN 30 can\'t reach the server room',
            ticketDetail: 'Nobody in the Marketing department (VLAN 30) can reach any servers. All of Marketing is affected. Sales (VLAN 20) and Engineering (VLAN 10) are fine. This started after the new switch was installed in the server room.',
            ticketExtra: 'IT Note: A new distribution switch was installed. The trunk link between the access switch and distribution switch may not be allowing VLAN 30 traffic. Check the trunk allowed VLAN list.',
            fixDescription: 'Add VLAN 30 to the trunk allowed VLAN list',
            brokenConfig: { adapter: 'enabled', ip: '10.30.0.105', subnet: '255.255.255.0', gateway: '10.30.0.1', dns1: '10.10.0.2', dns2: '' },
            stateOverrides: { _trunkMissing: true, _missingVLAN: 30 },
            flagLocation: 'Switch CLI show interfaces trunk after fix'
        },
        {
            id: 'native_mismatch',
            name: 'Native VLAN Mismatch',
            ticketSubject: 'Strange network behavior — some traffic works, some doesn\'t',
            ticketDetail: 'Our network is acting very strangely. Some devices can communicate and others can\'t, and it seems to change. We\'re also getting lots of CDP warnings in the switch logs about native VLAN mismatches. This started after the trunk between SW1 and SW2 was reconfigured.',
            ticketExtra: 'IT Note: SW1 trunk port has native VLAN 1, but SW2 trunk port was changed to native VLAN 99 during hardening. They must match. Standard is native VLAN 99 on both sides.',
            fixDescription: 'Set SW1 trunk native VLAN to 99 to match SW2',
            brokenConfig: { adapter: 'enabled', ip: '10.10.0.105', subnet: '255.255.255.0', gateway: '10.10.0.1', dns1: '10.10.0.2', dns2: '' },
            stateOverrides: { _nativeMismatch: true, _sw1Native: 1, _sw2Native: 99 },
            flagLocation: 'Switch CLI after native VLAN correction'
        },
        {
            id: 'intervlan_disabled',
            name: 'Inter-VLAN Routing Disabled',
            ticketSubject: 'Can reach devices in my VLAN but not other departments',
            ticketDetail: 'I can ping and access all devices in Engineering (10.10.0.x) but I cannot reach Sales (10.20.0.x) or Marketing (10.30.0.x) at all. Everyone in my department has the same problem. We share files with Sales regularly and that\'s broken now.',
            ticketExtra: 'IT Note: The Layer 3 switch handling inter-VLAN routing had its routing configuration reset during a firmware update. IP routing may be disabled.',
            fixDescription: 'Re-enable IP routing on the Layer 3 switch',
            brokenConfig: { adapter: 'enabled', ip: '10.10.0.105', subnet: '255.255.255.0', gateway: '10.10.0.1', dns1: '10.10.0.2', dns2: '' },
            stateOverrides: { _interVLANDisabled: true },
            flagLocation: 'Switch CLI after enabling IP routing'
        },
        {
            id: 'svi_missing',
            name: 'SVI Not Created',
            ticketSubject: 'New VLAN 40 has no connectivity to rest of network',
            ticketDetail: 'We just set up a new Guest VLAN (VLAN 40) for our conference room. Devices get IP addresses (10.40.0.x) from DHCP but they can\'t reach the internet or any other VLAN. Devices within VLAN 40 can ping each other.',
            ticketExtra: 'IT Note: VLAN 40 was created and ports were assigned, but the SVI (Switched Virtual Interface) for VLAN 40 was never created on the Layer 3 switch. Without the SVI, there\'s no gateway for the VLAN.',
            fixDescription: 'Create the SVI (interface vlan 40) with IP 10.40.0.1/24 and bring it up',
            brokenConfig: { adapter: 'enabled', ip: '10.40.0.105', subnet: '255.255.255.0', gateway: '10.40.0.1', dns1: '10.10.0.2', dns2: '' },
            stateOverrides: { _sviMissing: true, _newVLAN: 40 },
            flagLocation: 'Switch CLI after creating the SVI'
        }
    ],

    _correctNetwork: { adapter: 'enabled', ip: '10.10.0.105', subnet: '255.255.255.0', gateway: '10.10.0.1', dns1: '10.10.0.2' },
    _macAddress: '00-1A-2B-3C-4D-65',

    _defaultHints: [
        { id: 'hint1', text: 'Connect to the switch CLI. Run show vlan brief and show interfaces trunk.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'VLAN issues: wrong port VLAN, trunk allowed list, native VLAN mismatch, routing, or missing SVI.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use Switch Config to change port VLANs, trunk settings, or create SVIs.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after fixing the VLAN issue.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        wrong_vlan: [
            { id: 'hint1', text: 'show vlan brief reveals Gi0/12 is in VLAN 20 (Sales). The user needs VLAN 10 (Engineering).', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The port needs to be moved from VLAN 20 to VLAN 10.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'In Switch Config: interface Gi0/12, switchport access vlan 10', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After changing the VLAN, the flag appears in show vlan brief.', cost: 50, penalty: -50 }
        ],
        trunk_missing: [
            { id: 'hint1', text: 'show interfaces trunk reveals the trunk only allows VLANs 1,10,20. VLAN 30 is missing.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Add VLAN 30 to the trunk allowed list.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'switchport trunk allowed vlan add 30', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After adding VLAN 30, flag appears in show interfaces trunk.', cost: 50, penalty: -50 }
        ],
        native_mismatch: [
            { id: 'hint1', text: 'show interfaces trunk shows SW1 native=1, SW2 native=99. They must match.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Standard is native VLAN 99. Change SW1 to match.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'switchport trunk native vlan 99', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After matching native VLANs, flag appears in the switch output.', cost: 50, penalty: -50 }
        ],
        intervlan_disabled: [
            { id: 'hint1', text: 'show ip route is empty. IP routing is disabled on the Layer 3 switch.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Re-enable IP routing so VLANs can communicate.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'In Switch Config: ip routing', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After enabling routing, flag appears.', cost: 50, penalty: -50 }
        ],
        svi_missing: [
            { id: 'hint1', text: 'show ip interface brief has no entry for VLAN 40. The SVI doesn\'t exist.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Create interface vlan 40 with IP 10.40.0.1/24.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'interface vlan 40, ip address 10.40.0.1 255.255.255.0, no shutdown', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After creating the SVI, flag appears.', cost: 50, penalty: -50 }
        ]
    },

    _ensureScenario(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId!=null&&!NT008Config._flagRestored) { NT008Config._flagRestored=true; const s=NT008Config._scenarios[engine.state._scenarioId]; if(s) NT008Config.hints=NT008Config._scenarioHints[s.id]||NT008Config._defaultHints; } return true; },
    _applyScenario(engine,idx) { engine.state._scenarioId=idx; engine.state._networkConfig=JSON.parse(JSON.stringify(NT008Config._scenarios[idx].brokenConfig)); engine.state._scenarioSelected=true; const o=NT008Config._scenarios[idx].stateOverrides||{}; for(const k in o) engine.state[k]=o[k]; NT008Config._flagRestored=true; NT008Config.hints=NT008Config._scenarioHints[NT008Config._scenarios[idx].id]||NT008Config._defaultHints; engine.save(); },
    _getScenario(engine) { return engine.state._scenarioId==null?null:NT008Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected?null:'\nERROR: No active ticket.\nOpen Help Desk Ticket first.'; },

    boot: { biosLines: ['Cisco IOS Boot', 'Loading switch firmware...', 'Network switch ready'], grubEntries: ['Cisco IOS 15.2'], loginUser: 'admin' },
    desktop: {
        icons: [
            { id: 'cmd', label: 'Switch\nCLI', icon: '>_', app: 'terminal' },
            { id: 'switchcfg', label: 'Switch\nConfig', icon: 'SW', app: 'switch_config' },
            { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' },
            { id: 'notes', label: 'Notepad', icon: 'TXT', app: 'notes' },
            { id: 'hints', label: 'Hints', icon: '?', app: 'hints' },
            { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }
        ]
    },
    terminal: { user: 'admin', hostname: 'SW1', startDir: '', promptStyle: 'cisco', welcome: 'SW1>' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: null, points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [{ id:'hint1', text:'show vlan brief and show interfaces trunk.', cost:0, penalty:0 }, { id:'hint2', text:'VLAN issues: port VLAN, trunk, native, routing, SVI.', cost:10, penalty:-10 }, { id:'hint3', text:'Use Switch Config to fix.', cost:25, penalty:-25 }, { id:'hint4', text:'Flag in the tool after fix.', cost:50, penalty:-50 }],
    lore: { intro: 'Users in a VLAN are isolated from the rest of the network. Diagnose the VLAN configuration issue.', scenario: 'A VLAN configuration problem is preventing network connectivity.', outro: 'VLAN isolation resolved.' },
    phases: [
        { id: 'investigate', name: 'Investigation', requiredFlags: [], unlocks: ['diagnose'], locked: false, description: 'Check VLAN configuration.' },
        { id: 'diagnose', name: 'Diagnosis', requiredFlags: [], unlocks: ['repair'], locked: true, description: 'Identify VLAN issue.' },
        { id: 'repair', name: 'Repair', requiredFlags: [], unlocks: ['verify'], locked: true, description: 'Fix VLAN config.' },
        { id: 'verify', name: 'Verification', requiredFlags: ['fixed'], unlocks: [], locked: true, description: 'Verify and find flag.' }
    ],

    commands: {
        show: async function(args, term, engine) {
            const gate = NT008Config._requireScenario(engine); if (gate) return gate;
            const cmd = args.join(' ').toLowerCase();

            if (/vlan\s+brief/i.test(cmd)) {
                const port12vlan = engine.state._wrongVLAN ? engine.state._currentVLAN : (engine.state._targetVLAN || 10);
                let output = '\nVLAN Name                             Status    Ports\n---- -------------------------------- --------- ---------------------------\n';
                output += '1    default                          active    Gi0/1, Gi0/2\n';
                output += '10   Engineering                      active    Gi0/3, Gi0/4, Gi0/5' + (port12vlan===10?', Gi0/12':'') + '\n';
                output += '20   Sales                            active    Gi0/6, Gi0/7, Gi0/8' + (port12vlan===20?', Gi0/12':'') + '\n';
                output += '30   Marketing                        active    Gi0/9, Gi0/10, Gi0/11\n';
                if (engine.state._newVLAN) output += '40   Guest                            active    Gi0/13, Gi0/14\n';
                output += '99   Management                       active    \n';

                if (engine.state._flagRevealed && NT008Config._getScenario(engine)?.id === 'wrong_vlan' && !engine.state._wrongVLAN) {
                    const fv = await engine.requestFlagText('wrong_vlan');
                    output += '\n  VLAN assignment corrected — Recovery token: ' + fv;
                }
                return output;
            }

            if (/interfaces?\s+trunk/i.test(cmd)) {
                const allowedVlans = engine.state._trunkMissing ? '1,10,20' : '1,10,20,30' + (engine.state._newVLAN?',40':'');
                const native1 = engine.state._nativeMismatch ? engine.state._sw1Native : 99;
                let output = '\nPort        Mode         Encapsulation  Status        Native vlan\nGi0/24      on           802.1q         trunking      ' + native1 + '\n\n';
                output += 'Port        Vlans allowed on trunk\nGi0/24      ' + allowedVlans + '\n';

                if (engine.state._nativeMismatch) output += '\n  %CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch on Gi0/24 (local=' + engine.state._sw1Native + ', remote=' + engine.state._sw2Native + ')';

                if (engine.state._flagRevealed && NT008Config._getScenario(engine)?.id === 'trunk_missing' && !engine.state._trunkMissing) {
                    const fv = await engine.requestFlagText('trunk_missing');
                    output += '\n\n  Trunk updated — Recovery token: ' + fv;
                }
                if (engine.state._flagRevealed && NT008Config._getScenario(engine)?.id === 'native_mismatch' && !engine.state._nativeMismatch) {
                    const fv = await engine.requestFlagText('native_mismatch');
                    output += '\n\n  Native VLAN matched — Recovery token: ' + fv;
                }
                return output;
            }

            if (/ip\s+route/i.test(cmd)) {
                if (engine.state._interVLANDisabled) return '\n% IP routing is not enabled';
                let output = '\nCodes: C - connected, S - static\n\nC    10.10.0.0/24 is directly connected, Vlan10\nC    10.20.0.0/24 is directly connected, Vlan20\nC    10.30.0.0/24 is directly connected, Vlan30\n';
                if (!engine.state._sviMissing) output += 'C    10.40.0.0/24 is directly connected, Vlan40\n';
                return output;
            }

            if (/ip\s+interface\s+brief/i.test(cmd)) {
                let output = '\nInterface              IP-Address      OK? Method Status                Protocol\nVlan10                 10.10.0.1       YES manual up                    up\nVlan20                 10.20.0.1       YES manual up                    up\nVlan30                 10.30.0.1       YES manual up                    up\n';
                if (engine.state._sviMissing) {
                    output += '\n  [Note: No SVI exists for VLAN 40]';
                } else {
                    output += 'Vlan40                 10.40.0.1       YES manual up                    up\n';
                    if (engine.state._flagRevealed && NT008Config._getScenario(engine)?.id === 'svi_missing') {
                        const fv = await engine.requestFlagText('svi_missing');
                        output += '\n  SVI created — Recovery token: ' + fv;
                    }
                }
                return output;
            }

            if (/run/i.test(cmd)) return '\n! Switch running configuration (abbreviated)\nhostname SW1\n!\nip routing' + (engine.state._interVLANDisabled?' [DISABLED]':'') + '\n!\ninterface Vlan10\n ip address 10.10.0.1 255.255.255.0\n!\ninterface Vlan20\n ip address 10.20.0.1 255.255.255.0\n!\ninterface Vlan30\n ip address 10.30.0.1 255.255.255.0\n!';

            return '\nAvailable commands:\n  show vlan brief\n  show interfaces trunk\n  show ip route\n  show ip interface brief\n  show running-config';
        },

        ping: function(args, term, engine) {
            const gate = NT008Config._requireScenario(engine); if (gate) return gate;
            const target = args[0]; if (!target) return '\nUsage: ping <ip>';
            // Simplified: if issue is fixed, pings work
            const s = NT008Config._getScenario(engine);
            if (!s) return '\nRequest timed out.';
            if (s.id==='wrong_vlan' && engine.state._wrongVLAN && target.startsWith('10.10.')) return '\nRequest timed out.';
            if (s.id==='trunk_missing' && engine.state._trunkMissing && !target.startsWith('10.30.')) return '\nReply from ' + target + ': bytes=32 time=1ms TTL=255';
            if (s.id==='trunk_missing' && engine.state._trunkMissing) return '\nRequest timed out.';
            if (s.id==='intervlan_disabled' && engine.state._interVLANDisabled && !target.startsWith('10.10.')) return '\nRequest timed out.';
            if (s.id==='svi_missing' && engine.state._sviMissing && target.startsWith('10.40.')) return '\n% Network is unreachable.';
            return '\nReply from ' + target + ': bytes=32 time=1ms TTL=255\nReply from ' + target + ': bytes=32 time=1ms TTL=255\n\nSuccess rate is 100 percent (2/2)';
        },

        enable: function() { return ''; },
        configure: function() { return '\nUse Switch Config (desktop icon) to make configuration changes.'; },
        hostname: function() { return 'SW1'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        ifconfig: function() { return '% Unknown command. Use show commands.'; },
        ipconfig: function() { return '% Unknown command. This is a Cisco switch. Use show commands.'; }
    },

    onAppLaunch(iconDef, engine) {
        if (iconDef.app === 'switch_config' && !engine.state._scenarioSelected) { engine.notify('Open Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': NT008Config._openTicket(iconDef, engine); break;
            case 'switch_config': NT008Config._openSwitchConfig(iconDef, engine); break;
            case 'reset_lab': NT008Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        const c = document.createElement('div'); c.id='ticketContainer'; c.style.cssText='padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        NT008Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) NT008Config._renderTicket(engine,c); else NT008Config._renderPicker(engine,c);
    },

    _renderPicker(engine, c) {
        const p = ['Raj Gupta — "Can\'t reach Engineering servers after moving"', 'Lisa Park — "Entire Marketing VLAN has no connectivity"', 'Mike Chen — "Strange network behavior, CDP warnings"', 'Sara Kim — "Can only reach my own department"', 'Tom Walsh — "New Guest VLAN has no internet"'];
        let html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#f97316; font-weight:bold; font-size:1.1rem;">HELP DESK QUEUE</div></div><div>';
        NT008Config._scenarios.forEach(function(s,i) { html += '<button class="nt008-btn" data-idx="'+i+'" style="display:block; width:100%; text-align:left; padding:12px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><span style="color:#f97316; font-weight:bold;">HD-'+(8700+i)+'</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">'+p[i]+'</div></button>'; });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="nt008Rand" style="padding:10px 28px; background:#f97316; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
        c.innerHTML = html;
        c.querySelectorAll('.nt008-btn').forEach(function(b) { b.addEventListener('click', function() { NT008Config._applyScenario(engine,parseInt(this.getAttribute('data-idx'))); NT008Config._renderTicket(engine,c); }); });
        document.getElementById('nt008Rand').addEventListener('click', function() { NT008Config._applyScenario(engine,Math.floor(Math.random()*NT008Config._scenarios.length)); NT008Config._renderTicket(engine,c); });
    },

    _renderTicket(engine, c) {
        const s=NT008Config._getScenario(engine);
        const n=['Raj Gupta — Engineering','Lisa Park — Marketing','Mike Chen — IT','Sara Kim — Engineering','Tom Walsh — Facilities'];
        c.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><span style="color:#f97316; font-weight:bold;">HELP DESK TICKET #HD-'+(8700+engine.state._scenarioId)+'</span></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">BY</div><div>'+n[engine.state._scenarioId]+'</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">'+NT008Config._escHtml(s.ticketSubject)+'</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:4px; line-height:1.6;">'+NT008Config._escHtml(s.ticketDetail)+'</div></div>'
            + (s.ticketExtra?'<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">NOTES</div><div style="background:rgba(255,165,0,0.08); border:1px solid rgba(255,165,0,0.2); padding:12px; border-radius:4px; color:#ffcc80;">'+NT008Config._escHtml(s.ticketExtra)+'</div></div>':'')
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div></div>';
    },

    _openSwitchConfig(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); NT008Config._renderSwitch(engine); return; }
        const c = document.createElement('div'); c.id='switchContainer'; c.style.cssText='padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Switch Config', 'SW', c);
        NT008Config._renderSwitch(engine);
    },

    async _renderSwitch(engine) {
        const c = document.getElementById('switchContainer'); if (!c) return;
        const s = NT008Config._getScenario(engine);
        let html = '<div style="font-size:1rem; font-weight:bold; color:#f97316; margin-bottom:16px;">Switch Configuration — SW1</div>';

        if (s?.id==='wrong_vlan') {
            html += '<div style="border:1px solid rgba(255,255,255,0.1); border-radius:4px; padding:12px; margin-bottom:16px;">'
                + '<div style="font-weight:bold; margin-bottom:8px;">Port Gi0/12 — VLAN Assignment</div>'
                + '<div style="font-size:0.75rem; margin-bottom:8px;">Current VLAN: <span style="color:'+(engine.state._wrongVLAN?'#e74c3c; font-weight:bold;">20 (Sales)':'#2ecc71;">10 (Engineering)')+'</span></div>'
                + (engine.state._wrongVLAN?'<button id="swFixVLAN" style="padding:6px 20px; background:#f97316; color:#fff; border:none; border-radius:3px; cursor:pointer; font-weight:bold; font-size:0.75rem;">Move to VLAN 10 (Engineering)</button>':'')
                + '</div>';
        }
        if (s?.id==='trunk_missing') {
            html += '<div style="border:1px solid rgba(255,255,255,0.1); border-radius:4px; padding:12px; margin-bottom:16px;">'
                + '<div style="font-weight:bold; margin-bottom:8px;">Trunk Gi0/24 — Allowed VLANs</div>'
                + '<div style="font-size:0.75rem; margin-bottom:8px;">Allowed: '+(engine.state._trunkMissing?'1,10,20 <span style="color:#e74c3c;">(VLAN 30 MISSING)</span>':'1,10,20,30')+'</div>'
                + (engine.state._trunkMissing?'<button id="swFixTrunk" style="padding:6px 20px; background:#f97316; color:#fff; border:none; border-radius:3px; cursor:pointer; font-weight:bold; font-size:0.75rem;">Add VLAN 30 to trunk</button>':'')
                + '</div>';
        }
        if (s?.id==='native_mismatch') {
            html += '<div style="border:1px solid rgba(255,255,255,0.1); border-radius:4px; padding:12px; margin-bottom:16px;">'
                + '<div style="font-weight:bold; margin-bottom:8px;">Trunk Native VLAN</div>'
                + '<div style="font-size:0.75rem; margin-bottom:4px;">SW1 Gi0/24 native: '+(engine.state._nativeMismatch?'<span style="color:#e74c3c;">1</span>':'99')+'</div>'
                + '<div style="font-size:0.75rem; margin-bottom:8px;">SW2 Gi0/24 native: 99</div>'
                + (engine.state._nativeMismatch?'<button id="swFixNative" style="padding:6px 20px; background:#f97316; color:#fff; border:none; border-radius:3px; cursor:pointer; font-weight:bold; font-size:0.75rem;">Set SW1 native to 99</button>':'')
                + '</div>';
        }
        if (s?.id==='intervlan_disabled') {
            html += '<div style="border:1px solid rgba(255,255,255,0.1); border-radius:4px; padding:12px; margin-bottom:16px;">'
                + '<div style="font-weight:bold; margin-bottom:8px;">IP Routing</div>'
                + '<div style="font-size:0.75rem; margin-bottom:8px;">Status: <span style="color:'+(engine.state._interVLANDisabled?'#e74c3c; font-weight:bold;">DISABLED':'#2ecc71;">ENABLED')+'</span></div>'
                + (engine.state._interVLANDisabled?'<button id="swFixRouting" style="padding:6px 20px; background:#f97316; color:#fff; border:none; border-radius:3px; cursor:pointer; font-weight:bold; font-size:0.75rem;">Enable IP Routing</button>':'')
                + '</div>';
        }
        if (s?.id==='svi_missing') {
            html += '<div style="border:1px solid rgba(255,255,255,0.1); border-radius:4px; padding:12px; margin-bottom:16px;">'
                + '<div style="font-weight:bold; margin-bottom:8px;">SVI — VLAN 40 (Guest)</div>'
                + '<div style="font-size:0.75rem; margin-bottom:8px;">Status: <span style="color:'+(engine.state._sviMissing?'#e74c3c; font-weight:bold;">NOT CREATED':'#2ecc71;">Active (10.40.0.1/24)')+'</span></div>'
                + (engine.state._sviMissing?'<button id="swFixSVI" style="padding:6px 20px; background:#f97316; color:#fff; border:none; border-radius:3px; cursor:pointer; font-weight:bold; font-size:0.75rem;">Create SVI: 10.40.0.1/24</button>':'')
                + '</div>';
        }

        // Show flag
        if (engine.state._flagRevealed) {
            const fv = await engine.requestFlagText(s.id);
            html += '<div style="background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px; margin-top:16px;"><div style="color:#2ecc71; font-weight:bold;">VLAN Issue Resolved:</div><div style="color:#c8e6c9;">Recovery token: '+fv+'</div></div>';
        }

        c.innerHTML = html;

        // Wire buttons
        const fixes = { swFixVLAN: '_wrongVLAN', swFixTrunk: '_trunkMissing', swFixNative: '_nativeMismatch', swFixRouting: '_interVLANDisabled', swFixSVI: '_sviMissing' };
        const msgs = { swFixVLAN: 'Port moved to VLAN 10.', swFixTrunk: 'VLAN 30 added to trunk.', swFixNative: 'Native VLAN set to 99.', swFixRouting: 'IP routing enabled.', swFixSVI: 'SVI VLAN 40 created.' };
        for (const id in fixes) {
            const btn = document.getElementById(id);
            if (btn) { const stateKey = fixes[id]; const msg = msgs[id]; btn.addEventListener('click', function() { engine.state[stateKey] = false; if (!engine.state._labComplete) { engine.state._labComplete=true; engine.state._flagRevealed=true; } engine.save(); engine.notify(msg, 'success'); NT008Config._renderSwitch(engine); }); }
        }
    },

    _confirmReset(engine) {
        const o=document.createElement('div'); o.style.cssText='position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML='<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9;"><div style="color:#e74c3c; font-weight:bold; margin-bottom:12px;">Reset Lab?</div><div style="display:flex; gap:12px; justify-content:center;"><button id="nt008Y" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="nt008N" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('nt008Y').addEventListener('click', function() { NT008Config._flagRestored=false; NT008Config.hints=NT008Config._defaultHints; engine.reset(); });
        document.getElementById('nt008N').addEventListener('click', function() { o.remove(); });
        o.addEventListener('click', function(e) { if(e.target===o) o.remove(); });
    },

    _escHtml(str) { const d=document.createElement('div'); d.textContent=str; return d.innerHTML; }
};
