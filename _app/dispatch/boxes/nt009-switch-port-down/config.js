/* ============================================================
   ARENA LAB — Box NT009: Switch Port Down
   Network Troubleshooting — Network+ N10-009
   5 scenarios: err-disabled, bad cable, STP blocking,
   speed/duplex mismatch, PoE budget exceeded
   ============================================================ */

const NT009Config = {

    title: 'Switch Port Down',
    subtitle: 'Switch Port Troubleshooting — Network+',
    difficulty: 'Intermediate',
    accent: '#ec4899',
    storageKey: 'hexworth_lab_nt009',
    registryId: 'nt009-switch-port-down',
    trackerKey: 'lab_nt009',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the user complaint.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check port status', tip: 'Run show interfaces status and show interfaces Gi0/12 on the switch.', trigger: { event: 'command', match: { cmd: 'contains:show' } } },
            { title: 'Identify root cause', tip: 'Check err-disabled reason, STP state, cable diagnostics, or PoE budget.', trigger: { event: 'command', match: { cmd: 'contains:show' } } },
            { title: 'Fix the port', tip: 'Use Switch Config to resolve the port issue.', trigger: { event: 'window_open', match: { type: 'switch_config' } } },
            { title: 'Verify port is up', tip: 'Confirm the port is back online. Find the flag.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: { certPath: 'N10-009', mappings: [
        { flagId: 'fixed', objective: '5.3', description: 'Troubleshoot common network connectivity issues', skill: 'Port Status, Err-disabled, STP' },
        { flagId: 'fixed', objective: '2.3', description: 'Configure and deploy Ethernet switching features', skill: 'Port Security, STP, Speed/Duplex' },
        { flagId: 'fixed', objective: '5.2', description: 'Use the appropriate tool', skill: 'show interfaces, cable diagnostics' }
    ]},

    _scenarioFlags: { err_disabled: null, bad_cable: null, stp_blocking: null, speed_mismatch: null, poe_exceeded: null },

    _scenarios: [
        {
            id: 'err_disabled', name: 'Err-Disabled Port',
            ticketSubject: 'Network port dead — amber light on switch',
            ticketDetail: 'My network just stopped working. The light on the switch port is amber/orange instead of green. I didn\'t change anything — I just plugged in a small switch I brought from home to connect my laptop and my personal device.',
            ticketExtra: 'IT Note: Port security is configured to allow max 2 MAC addresses. User plugged in a personal switch with 3+ devices, triggering port security violation. Port is now err-disabled.',
            fixDescription: 'Clear the err-disabled state and optionally increase max MAC addresses',
            brokenConfig: { adapter: 'enabled', ip: '0.0.0.0', subnet: '0.0.0.0', gateway: '', dns1: '', dns2: '' },
            stateOverrides: { _errDisabled: true, _errReason: 'psecure-violation', _port: 'Gi0/12' },
            flagLocation: 'Switch CLI after clearing err-disabled'
        },
        {
            id: 'bad_cable', name: 'Bad Cable',
            ticketSubject: 'Network keeps dropping — port light flickers',
            ticketDetail: 'My network connection keeps going up and down. The port light on the switch flickers between green and off. Sometimes I\'m connected for a few seconds, then it drops. I moved desks yesterday and used the same cable.',
            ticketExtra: 'IT Note: Cable diagnostic test (TDR) should reveal if the cable has a fault. The patch cable is 15m and was bent sharply around a door frame during the move.',
            fixDescription: 'Replace the faulty cable (simulate via cable diagnostics)',
            brokenConfig: { adapter: 'enabled', ip: '0.0.0.0', subnet: '0.0.0.0', gateway: '', dns1: '', dns2: '' },
            stateOverrides: { _badCable: true, _cableFault: 'pair 3-6: open at 8m' },
            flagLocation: 'Switch CLI cable diagnostics after replacement'
        },
        {
            id: 'stp_blocking', name: 'STP Blocking',
            ticketSubject: 'Port shows green but no traffic passes',
            ticketDetail: 'My switch port light is green like it\'s connected, but no traffic flows. I can\'t get an IP address. The cable tests fine when I plug it into a different port. But this is the only port near my desk.',
            ticketExtra: 'IT Note: An accidental loop was created in the wiring closet. STP detected it and blocked this port (Gi0/12). The loop has been removed but STP hasn\'t reconverged yet.',
            fixDescription: 'Force STP reconvergence on the port or clear the blocking state',
            brokenConfig: { adapter: 'enabled', ip: '0.0.0.0', subnet: '0.0.0.0', gateway: '', dns1: '', dns2: '' },
            stateOverrides: { _stpBlocking: true, _stpState: 'BLK' },
            flagLocation: 'Switch CLI show spanning-tree after fix'
        },
        {
            id: 'speed_mismatch', name: 'Speed/Duplex Mismatch',
            ticketSubject: 'Connected but extremely slow — like dial-up',
            ticketDetail: 'My network is technically working but it\'s incredibly slow. Loading a simple webpage takes 30+ seconds. File copies that should take seconds take minutes. The switch port shows a solid green light.',
            ticketExtra: 'IT Note: The switch port was manually set to 100/Full during testing and never changed back. The NIC is auto-negotiating to 100/Half, creating a duplex mismatch with massive collision rates.',
            fixDescription: 'Set the switch port back to auto-negotiate',
            brokenConfig: { adapter: 'enabled', ip: '192.168.1.80', subnet: '255.255.255.0', gateway: '192.168.1.1', dns1: '8.8.8.8', dns2: '' },
            stateOverrides: { _speedMismatch: true, _portSpeed: '100', _portDuplex: 'full', _nicDuplex: 'half' },
            flagLocation: 'Switch CLI show interfaces after fix'
        },
        {
            id: 'poe_exceeded', name: 'PoE Budget Exceeded',
            ticketSubject: 'New IP phone won\'t power on from network port',
            ticketDetail: 'I just got a new IP phone that\'s supposed to be powered by the network cable (PoE) but it won\'t turn on. I plugged it into the wall jack and nothing happens. The port light goes green for a second then the phone goes dark.',
            ticketExtra: 'IT Note: The switch\'s PoE budget is nearly exhausted. This port needs 15.4W (802.3af) but only 5W remains. Some ports have older devices that could be moved to non-PoE ports to free budget.',
            fixDescription: 'Free PoE budget by disabling PoE on unused ports or moving low-power devices',
            brokenConfig: { adapter: 'enabled', ip: '0.0.0.0', subnet: '0.0.0.0', gateway: '', dns1: '', dns2: '' },
            stateOverrides: { _poeExceeded: true, _poeBudget: 370, _poeUsed: 366, _poeNeeded: 15.4 },
            flagLocation: 'Switch CLI show power inline after fix'
        }
    ],

    _macAddress: '00-1A-2B-3C-4D-66',

    _defaultHints: [
        { id: 'hint1', text: 'show interfaces status to see all port states. Look for err-disabled, notconnect, or BLK.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Port down causes: err-disabled, bad cable, STP blocking, speed mismatch, or PoE budget.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use Switch Config to fix port issues.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Flag appears after the port comes up.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        err_disabled: [
            { id: 'hint1', text: 'show interfaces Gi0/12 status shows err-disabled. show errdisable recovery tells you why.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Port security violation: too many MAC addresses. Need to shut/no shut the port.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'In Switch Config: shutdown then no shutdown on Gi0/12. Remove the personal switch first.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After clearing err-disabled, the flag appears.', cost: 50, penalty: -50 }
        ],
        bad_cable: [
            { id: 'hint1', text: 'show interfaces Gi0/12 shows high input errors and CRC errors. Run cable diagnostics.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Cable diagnostic (TDR) shows a fault on pairs 3-6 at 8 meters. Cable is damaged.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Replace the cable via Switch Config.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After cable replacement, flag appears in diagnostics.', cost: 50, penalty: -50 }
        ],
        stp_blocking: [
            { id: 'hint1', text: 'show spanning-tree interface Gi0/12 shows state BLK (blocking). STP is blocking this port.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The loop was removed but STP hasn\'t reconverged. Force reconvergence.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'In Switch Config: clear spanning-tree detected-protocols on Gi0/12, or shut/no shut.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After STP reconverges, flag appears.', cost: 50, penalty: -50 }
        ],
        speed_mismatch: [
            { id: 'hint1', text: 'show interfaces Gi0/12 shows 100Mbps/Full but lots of late collisions. NIC autoneg to Half.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Switch is hard-coded 100/Full, NIC auto-negotiated to 100/Half. Duplex mismatch.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Set the port back to auto: speed auto, duplex auto.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After setting auto, flag appears.', cost: 50, penalty: -50 }
        ],
        poe_exceeded: [
            { id: 'hint1', text: 'show power inline shows budget 370W, used 366W, available 4W. Phone needs 15.4W.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Not enough PoE power. Free up budget by disabling PoE on unused ports.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Disable PoE on unused ports Gi0/20-24 to free 30W.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After freeing PoE budget, flag appears.', cost: 50, penalty: -50 }
        ]
    },

    _ensureScenario(engine) { if(!engine.state._scenarioSelected)return false; if(engine.state._scenarioId!=null&&!NT009Config._flagRestored){NT009Config._flagRestored=true; const s=NT009Config._scenarios[engine.state._scenarioId]; if(s)NT009Config.hints=NT009Config._scenarioHints[s.id]||NT009Config._defaultHints;} return true; },
    _applyScenario(engine,idx){engine.state._scenarioId=idx; engine.state._networkConfig=JSON.parse(JSON.stringify(NT009Config._scenarios[idx].brokenConfig)); engine.state._scenarioSelected=true; const o=NT009Config._scenarios[idx].stateOverrides||{}; for(const k in o)engine.state[k]=o[k]; NT009Config._flagRestored=true; NT009Config.hints=NT009Config._scenarioHints[NT009Config._scenarios[idx].id]||NT009Config._defaultHints; engine.save();},
    _getScenario(engine){return engine.state._scenarioId==null?null:NT009Config._scenarios[engine.state._scenarioId];},
    _requireScenario(engine){return engine.state._scenarioSelected?null:'\nERROR: No active ticket.\nOpen Help Desk Ticket first.';},

    boot:{biosLines:['Cisco IOS Boot','Loading...','Ready'],grubEntries:['IOS 15.2'],loginUser:'admin'},
    desktop:{icons:[
        {id:'cmd',label:'Switch\nCLI',icon:'>_',app:'terminal'},
        {id:'switchcfg',label:'Switch\nConfig',icon:'SW',app:'switch_config'},
        {id:'ticket',label:'Help Desk\nTicket',icon:'HD',app:'ticket'},
        {id:'notes',label:'Notepad',icon:'TXT',app:'notes'},
        {id:'hints',label:'Hints',icon:'?',app:'hints'},
        {id:'reset',label:'Reset\nLab',icon:'RST',app:'reset_lab'}
    ]},
    terminal:{user:'admin',hostname:'SW1',startDir:'',promptStyle:'cisco',welcome:'SW1>'},
    filesystem:{'/': {type:'dir',children:{}}},
    flags:[{id:'fixed',value:null,points:500}],
    scoring:{
        minScore: 0,base:0,maxScore:600,hintPenalty:true,wrongFlagPenalty:0,speedBonus:{threshold:600000,points:100},timeBonusThreshold:1800},
    hints:[{id:'hint1',text:'show interfaces status.',cost:0,penalty:0},{id:'hint2',text:'err-disabled, cable, STP, speed, or PoE.',cost:10,penalty:-10},{id:'hint3',text:'Switch Config to fix.',cost:25,penalty:-25},{id:'hint4',text:'Flag after port is up.',cost:50,penalty:-50}],
    lore:{intro:'A switch port is down or not passing traffic. Diagnose the port issue.',scenario:'The switch port has a specific problem preventing connectivity.',outro:'Switch port restored.'},
    phases:[{id:'investigate',name:'Investigation',requiredFlags:[],unlocks:['diagnose'],locked:false,description:'Check port status.'},{id:'diagnose',name:'Diagnosis',requiredFlags:[],unlocks:['repair'],locked:true,description:'Identify port issue.'},{id:'repair',name:'Repair',requiredFlags:[],unlocks:['verify'],locked:true,description:'Fix port.'},{id:'verify',name:'Verification',requiredFlags:['fixed'],unlocks:[],locked:true,description:'Verify and flag.'}],

    commands:{
        show: async function(args,term,engine){
            const gate=NT009Config._requireScenario(engine); if(gate)return gate;
            const cmd=args.join(' ').toLowerCase();

            if(/interfaces?\s+status/i.test(cmd)){
                let output='\nPort      Name           Status       Vlan  Duplex  Speed  Type\n';
                const portStatus = engine.state._errDisabled?'err-disabled':(engine.state._badCable?'notconnect':(engine.state._stpBlocking?'connected':'connected'));
                output+='Gi0/12    User-Port      '+portStatus+'   10    '+(engine.state._speedMismatch?'full    100M':'a-full  a-1G')+'   10/100/1000\n';
                output+='Gi0/13    Server         connected    10    a-full  a-1G   10/100/1000\n';
                output+='Gi0/24    Uplink         connected    trunk a-full  a-1G   10/100/1000\n';
                return output;
            }

            if(/interfaces?\s+gi0\/12$/i.test(cmd)){
                if(engine.state._errDisabled) return '\nGigabitEthernet0/12 is down, line protocol is down (err-disabled)\n  Hardware is Gigabit Ethernet\n  Last input never, output never\n  Input errors: 0, CRC: 0\n  Port Security violation count: 3\n  Last violation: 2026-03-29 08:15:22';
                if(engine.state._badCable) return '\nGigabitEthernet0/12 is down, line protocol is down (notconnect)\n  Hardware is Gigabit Ethernet\n  Input errors: 847, CRC: 312, frame: 0, overrun: 0\n  Output errors: 23\n  Last link flap: 00:00:45 ago (port cycling rapidly)';
                if(engine.state._speedMismatch) return '\nGigabitEthernet0/12 is up, line protocol is up\n  Hardware is Gigabit Ethernet\n  Speed 100Mbps, Duplex Full (forced)\n  Auto-negotiation: OFF\n  Late collisions: 28471\n  Input errors: 1247\n  NOTE: High collision rate indicates duplex mismatch';
                return '\nGigabitEthernet0/12 is up, line protocol is up\n  Hardware is Gigabit Ethernet\n  Speed 1000Mbps, Duplex Full\n  Input errors: 0, CRC: 0';
            }

            if(/errdisable/i.test(cmd)) return '\nErrDisable Reason            Timer     Status\n---------                    -----     ------\npsecure-violation            300       '+(engine.state._errDisabled?'Err-disabled on Gi0/12':'Inactive');

            if(/spanning-tree/i.test(cmd)){
                if(engine.state._stpBlocking) return '\nVLAN0010\n  Spanning tree enabled protocol ieee\n  Interface        Role  Sts   Cost    Prio.Nbr\n  Gi0/12           Altn  BLK   4       128.12\n  Gi0/13           Desg  FWD   4       128.13\n\n  [WARNING: Gi0/12 blocked due to detected loop — loop has been removed]';
                return '\nVLAN0010\n  Interface        Role  Sts   Cost    Prio.Nbr\n  Gi0/12           Desg  FWD   4       128.12\n  Gi0/13           Desg  FWD   4       128.13';
            }

            if(/power\s+inline/i.test(cmd)){
                const used=engine.state._poeExceeded?engine.state._poeUsed:(engine.state._poeUsed-30);
                const avail=engine.state._poeBudget-used;
                let output='\nAvailable: '+engine.state._poeBudget+'.0(w)  Used: '+used+'.0(w)  Remaining: '+avail.toFixed(1)+'(w)\n\nInterface  Admin  Oper       Power(w)  Device\nGi0/12     auto   '+(engine.state._poeExceeded?'off        0.0       (insufficient power)':'on         15.4      IP Phone')+'\nGi0/13     auto   on         30.0      AP\nGi0/20     auto   on         7.0       Camera\nGi0/21     auto   on         7.0       Camera\nGi0/22     auto   on         7.0       Camera\nGi0/23     auto   on         7.0       Camera (unused closet)\nGi0/24     auto   on         7.0       Camera (unused closet)';
                if(!engine.state._poeExceeded&&engine.state._flagRevealed){
                    const fv=await engine.requestFlagText('poe_exceeded');
                    output+='\n\n  PoE budget freed — Recovery token: '+fv;
                }
                return output;
            }

            if(/cable-diagnostics/i.test(cmd)){
                if(engine.state._badCable) return '\nInterface    Speed  Pair  Length   Status\nGi0/12       N/A    1-2   15m      Normal\nGi0/12       N/A    3-6   8m       Open  <-- FAULT DETECTED\nGi0/12       N/A    4-5   15m      Normal\nGi0/12       N/A    7-8   15m      Normal\n\n  Pair 3-6 shows open circuit at 8 meters. Cable is damaged.';
                return '\nInterface    Speed  Pair  Length   Status\nGi0/12       1G     1-2   15m      Normal\nGi0/12       1G     3-6   15m      Normal\nGi0/12       1G     4-5   15m      Normal\nGi0/12       1G     7-8   15m      Normal\n\n  All pairs OK.';
            }

            return '\nCommands:\n  show interfaces status\n  show interfaces Gi0/12\n  show errdisable recovery\n  show spanning-tree\n  show power inline\n  show cable-diagnostics';
        },

        ping:function(args,term,engine){return '\nPing from switch: Type escape sequence to abort.\nSending 5 100-byte ICMP Echos...\n!!!!!\nSuccess rate is 100 percent (5/5)';},
        hostname:function(){return'SW1';},
        cls:function(args,term){term.outputEl.innerHTML='';return null;},
        enable:function(){return'';},
        ipconfig:function(){return'% Unknown command. Use show commands.';},
        ifconfig:function(){return'% Unknown command.';}
    },

    onAppLaunch(iconDef,engine){
        if(iconDef.app==='switch_config'&&!engine.state._scenarioSelected){engine.notify('Open ticket first.','error');return;}
        switch(iconDef.app){
            case'ticket':NT009Config._openTicket(iconDef,engine);break;
            case'switch_config':NT009Config._openSwitchConfig(iconDef,engine);break;
            case'reset_lab':NT009Config._confirmReset(engine);break;
        }
    },

    _openTicket(iconDef,engine){
        if(engine._windows[iconDef.id]){engine._focusWindow(iconDef.id);return;}
        const c=document.createElement('div');c.id='ticketContainer';c.style.cssText='padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id,'Help Desk Ticket','HD',c);
        NT009Config._ensureScenario(engine);
        if(engine.state._scenarioSelected)NT009Config._renderTicket(engine,c);else NT009Config._renderPicker(engine,c);
    },

    _renderPicker(engine,c){
        const p=['Ryan O. — "Port dead, amber light"','Jess T. — "Port light flickers, keeps dropping"','Amy W. — "Green light but no traffic"','Dan M. — "Connected but dial-up slow"','Kate L. — "New IP phone won\'t power on"'];
        let html='<div style="text-align:center; margin-bottom:20px;"><div style="color:#ec4899; font-weight:bold; font-size:1.1rem;">HELP DESK QUEUE</div></div><div>';
        NT009Config._scenarios.forEach(function(s,i){html+='<button class="nt009-btn" data-idx="'+i+'" style="display:block;width:100%;text-align:left;padding:12px;margin-bottom:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:4px;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;cursor:pointer;"><span style="color:#ec4899;font-weight:bold;">HD-'+(8800+i)+'</span><div style="color:#aaa;font-size:0.7rem;margin-top:4px;">'+p[i]+'</div></button>';});
        html+='</div><div style="text-align:center;border-top:1px solid rgba(255,255,255,0.1);padding-top:16px;"><button id="nt009Rand" style="padding:10px 28px;background:#ec4899;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-family:Consolas,monospace;">Random</button></div>';
        c.innerHTML=html;
        c.querySelectorAll('.nt009-btn').forEach(function(b){b.addEventListener('click',function(){NT009Config._applyScenario(engine,parseInt(this.getAttribute('data-idx')));NT009Config._renderTicket(engine,c);});});
        document.getElementById('nt009Rand').addEventListener('click',function(){NT009Config._applyScenario(engine,Math.floor(Math.random()*NT009Config._scenarios.length));NT009Config._renderTicket(engine,c);});
    },

    _renderTicket(engine,c){
        const s=NT009Config._getScenario(engine);const n=['Ryan O.','Jess T.','Amy W.','Dan M.','Kate L.'];
        c.innerHTML='<div style="border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px;margin-bottom:16px;"><span style="color:#ec4899;font-weight:bold;">TICKET #HD-'+(8800+engine.state._scenarioId)+'</span></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">BY</div><div>'+n[engine.state._scenarioId]+'</div></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">'+NT009Config._escHtml(s.ticketSubject)+'</div></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04);padding:12px;border-radius:4px;line-height:1.6;">'+NT009Config._escHtml(s.ticketDetail)+'</div></div>'
            +(s.ticketExtra?'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">NOTES</div><div style="background:rgba(255,165,0,0.08);border:1px solid rgba(255,165,0,0.2);padding:12px;border-radius:4px;color:#ffcc80;">'+NT009Config._escHtml(s.ticketExtra)+'</div></div>':'')
            +'<div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:12px;"><div style="color:#2ecc71;font-weight:bold;">ASSIGNED TO: YOU</div></div>';
    },

    _openSwitchConfig(iconDef,engine){
        if(engine._windows[iconDef.id]){engine._focusWindow(iconDef.id);NT009Config._renderSwitch(engine);return;}
        const c=document.createElement('div');c.id='switchContainer';c.style.cssText='padding:20px;overflow-y:auto;height:100%;background:#1a1a2e;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;';
        engine.openWindow(iconDef.id,'Switch Config','SW',c);NT009Config._renderSwitch(engine);
    },

    async _renderSwitch(engine){
        const c=document.getElementById('switchContainer');if(!c)return;
        const s=NT009Config._getScenario(engine);
        let html='<div style="font-size:1rem;font-weight:bold;color:#ec4899;margin-bottom:16px;">Switch Config — Port Gi0/12</div>';

        const fixes={
            err_disabled:{label:'Err-Disabled (psecure-violation)',broken:engine.state._errDisabled,btnText:'Shut/No Shut Port',stateKey:'_errDisabled'},
            bad_cable:{label:'Cable Fault (pair 3-6 open at 8m)',broken:engine.state._badCable,btnText:'Replace Cable',stateKey:'_badCable'},
            stp_blocking:{label:'STP State: Blocking',broken:engine.state._stpBlocking,btnText:'Force STP Reconvergence',stateKey:'_stpBlocking'},
            speed_mismatch:{label:'Speed/Duplex: 100/Full (forced) — mismatch',broken:engine.state._speedMismatch,btnText:'Set Auto-Negotiate',stateKey:'_speedMismatch'},
            poe_exceeded:{label:'PoE: Budget exceeded (need 15.4W, have 4W)',broken:engine.state._poeExceeded,btnText:'Free PoE Budget (disable unused ports)',stateKey:'_poeExceeded'}
        };

        if(s&&fixes[s.id]){
            const f=fixes[s.id];
            html+='<div style="border:1px solid rgba(255,255,255,0.1);border-radius:4px;padding:12px;margin-bottom:16px;">'
                +'<div style="font-weight:bold;margin-bottom:8px;">Issue: '+f.label+'</div>'
                +'<div style="font-size:0.75rem;margin-bottom:8px;">Status: <span style="color:'+(f.broken?'#e74c3c;font-weight:bold;">ACTIVE':'#2ecc71;">RESOLVED')+'</span></div>'
                +(f.broken?'<button id="swFix" style="padding:6px 20px;background:#ec4899;color:#fff;border:none;border-radius:3px;cursor:pointer;font-weight:bold;font-size:0.75rem;">'+f.btnText+'</button>':'')
                +'</div>';
        }

        if(engine.state._flagRevealed&&s){
            const fv=await engine.requestFlagText(s.id);
            html+='<div style="background:rgba(46,204,113,0.1);border:1px solid rgba(46,204,113,0.3);border-radius:4px;padding:12px;margin-top:16px;"><div style="color:#2ecc71;font-weight:bold;">Port Restored:</div><div style="color:#c8e6c9;">Recovery token: '+fv+'</div></div>';
        }

        c.innerHTML=html;
        const btn=document.getElementById('swFix');
        if(btn&&s){
            const key=fixes[s.id].stateKey;
            btn.addEventListener('click',function(){engine.state[key]=false;if(!engine.state._labComplete){engine.state._labComplete=true;engine.state._flagRevealed=true;}engine.save();engine.notify('Port issue resolved.','success');NT009Config._renderSwitch(engine);});
        }
    },

    _confirmReset(engine){const o=document.createElement('div');o.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;';o.innerHTML='<div style="background:#1a1a2e;border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:24px;text-align:center;font-family:Consolas,monospace;color:#c8e6c9;"><div style="color:#e74c3c;font-weight:bold;margin-bottom:12px;">Reset?</div><div style="display:flex;gap:12px;justify-content:center;"><button id="nt009Y" style="padding:8px 24px;background:#e74c3c;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;">Reset</button><button id="nt009N" style="padding:8px 24px;background:rgba(255,255,255,0.1);color:#ccc;border:1px solid rgba(255,255,255,0.2);border-radius:4px;cursor:pointer;">Cancel</button></div></div>';document.getElementById('arena').appendChild(o);document.getElementById('nt009Y').addEventListener('click',function(){NT009Config._flagRestored=false;NT009Config.hints=NT009Config._defaultHints;engine.reset();});document.getElementById('nt009N').addEventListener('click',function(){o.remove();});o.addEventListener('click',function(e){if(e.target===o)o.remove();});},

    _escHtml(str){const d=document.createElement('div');d.textContent=str;return d.innerHTML;}
};
