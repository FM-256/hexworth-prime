/* ============================================================
   ARENA LAB — Box NT011: Intermittent Connectivity
   Network Troubleshooting — Network+ N10-009
   5 scenarios: loose cable, failing NIC, STP reconvergence,
   overheating switch, EMI (electromagnetic interference)
   ============================================================ */

const NT011Config = {

    title: 'Intermittent Connectivity',
    subtitle: 'Intermittent Network Issue Troubleshooting — Network+',
    difficulty: 'Advanced',
    accent: '#a855f7',
    storageKey: 'hexworth_lab_nt011',
    registryId: 'nt011-intermittent',
    trackerKey: 'lab_nt011',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the complaint about intermittent issues.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Gather baseline data', tip: 'Use ping -t style tests, event logs, and interface counters to see the pattern.', trigger: { event: 'command', match: { cmd: 'contains:ping' } } },
            { title: 'Analyze patterns', tip: 'Check interface error counters, event logs, environmental monitors, and cable tests.', trigger: { event: 'command', match: { cmd: 'contains:show' } } },
            { title: 'Fix the root cause', tip: 'Use the diagnostic tools to identify and resolve the intermittent issue.', trigger: { event: 'window_open', match: { type: 'diagnostics' } } },
            { title: 'Verify stability', tip: 'Confirm the connection is stable. Find the flag.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: { certPath: 'N10-009', mappings: [
        { flagId: 'fixed', objective: '5.3', description: 'Troubleshoot common network connectivity issues', skill: 'Intermittent Issues, Physical Layer' },
        { flagId: 'fixed', objective: '5.1', description: 'Explain the network troubleshooting methodology', skill: 'Systematic Troubleshooting, Baseline' },
        { flagId: 'fixed', objective: '5.2', description: 'Use the appropriate tool', skill: 'Event Logs, Cable Tester, Environmental Monitor' }
    ]},

    _scenarioFlags: { loose_cable: null, failing_nic: null, stp_reconvergence: null, overheating_switch: null, emi: null },

    _scenarios: [
        {
            id: 'loose_cable', name: 'Loose Cable Connection',
            ticketSubject: 'Network drops for a few seconds when I move my chair',
            ticketDetail: 'My network keeps dropping for 5-10 seconds at a time, maybe 3-4 times per hour. I noticed it seems to happen when I move my chair or bump my desk. The cable is routed under my desk and around the desk leg.',
            ticketExtra: 'IT Note: Physical layer issue suspected. The RJ-45 connector may be loose in the wall jack or the patch cable clip may be broken, causing intermittent contact loss when disturbed.',
            fixDescription: 'Re-seat the cable connection or replace the patch cable with a new one',
            brokenConfig: { adapter: 'enabled', ip: '192.168.1.90', subnet: '255.255.255.0', gateway: '192.168.1.1', dns1: '8.8.8.8', dns2: '' },
            stateOverrides: { _looseCable: true, _linkFlaps: 47, _crcErrors: 0 },
            flagLocation: 'Diagnostics panel after cable re-seat'
        },
        {
            id: 'failing_nic', name: 'Failing NIC',
            ticketSubject: 'Network becomes unusable for 30-60 seconds, then recovers',
            ticketDetail: 'My network goes completely dead for 30-60 seconds at random intervals, then comes back on its own. It happens about once every 10-15 minutes. The switch port light stays green the entire time. Rebooting doesn\'t help.',
            ticketExtra: 'IT Note: The NIC may be experiencing firmware crashes and auto-recovering. Check Device Manager for error events and NIC diagnostic counters. NIC driver is outdated (2023 version).',
            fixDescription: 'Update the NIC driver/firmware or replace the NIC',
            brokenConfig: { adapter: 'enabled', ip: '192.168.1.90', subnet: '255.255.255.0', gateway: '192.168.1.1', dns1: '8.8.8.8', dns2: '' },
            stateOverrides: { _failingNIC: true, _nicResets: 23, _driverDate: '2023-04-15' },
            flagLocation: 'Device Manager after driver update'
        },
        {
            id: 'stp_reconvergence', name: 'STP Reconvergence',
            ticketSubject: 'Entire floor loses network for 30-50 seconds periodically',
            ticketDetail: 'The entire 3rd floor loses network connectivity for 30-50 seconds at irregular intervals. It affects everyone on the floor at the same time. When it comes back, everything works fine until the next outage. This has been happening for a week.',
            ticketExtra: 'IT Note: STP reconvergence events detected in switch logs. A patch cable in the wiring closet is occasionally creating a loop — someone keeps plugging a cable between two access ports during the day (possibly a cleaning crew or unaware employee).',
            fixDescription: 'Enable BPDU Guard on access ports to prevent loops and identify the source',
            brokenConfig: { adapter: 'enabled', ip: '192.168.1.90', subnet: '255.255.255.0', gateway: '192.168.1.1', dns1: '8.8.8.8', dns2: '' },
            stateOverrides: { _stpReconvergence: true, _loopPort: 'Gi0/18', _lastOutage: '14 minutes ago' },
            flagLocation: 'Switch diagnostics after enabling BPDU Guard'
        },
        {
            id: 'overheating_switch', name: 'Overheating Switch',
            ticketSubject: 'Network issues get worse in the afternoon, fine in morning',
            ticketDetail: 'Our network works great in the morning but starts having problems around 2-3 PM. Connections drop, speeds slow down, and some ports stop working entirely. By the next morning it\'s fine again. This has been happening every day this week.',
            ticketExtra: 'IT Note: The network closet cooling (AC unit) failed last week and hasn\'t been repaired. Afternoon temperatures reach 40+ degrees C. The switch has thermal protection that shuts down ports when overheating.',
            fixDescription: 'Address the cooling issue — enable emergency fan speed and log thermal alert',
            brokenConfig: { adapter: 'enabled', ip: '192.168.1.90', subnet: '255.255.255.0', gateway: '192.168.1.1', dns1: '8.8.8.8', dns2: '' },
            stateOverrides: { _overheating: true, _currentTemp: 42, _thresholdTemp: 45, _fanSpeed: 'auto' },
            flagLocation: 'Environmental monitor after cooling fix'
        },
        {
            id: 'emi', name: 'Electromagnetic Interference',
            ticketSubject: 'Network errors spike every day at the same times',
            ticketDetail: 'We get massive network errors and packet loss at very predictable times: 9 AM, 12 PM, and 5 PM. It lasts about 10-15 minutes each time. Between those times, the network is perfect. This only affects workstations near the elevator shaft.',
            ticketExtra: 'IT Note: Network cables run through the wall adjacent to the elevator motor room. The elevator motor generates EMI when starting/stopping during peak usage times (morning arrival, lunch, evening departure). Cables need shielded (STP) or rerouting.',
            fixDescription: 'Replace UTP cables with STP (shielded twisted pair) near the elevator shaft',
            brokenConfig: { adapter: 'enabled', ip: '192.168.1.90', subnet: '255.255.255.0', gateway: '192.168.1.1', dns1: '8.8.8.8', dns2: '' },
            stateOverrides: { _emi: true, _errorPattern: '9AM/12PM/5PM peaks', _cableType: 'Cat5e UTP' },
            flagLocation: 'Cable diagnostics after replacing with STP'
        }
    ],

    _macAddress: '00-1A-2B-3C-4D-68',

    _defaultHints: [
        { id: 'hint1', text: 'Intermittent issues need pattern analysis. Check when, how long, who\'s affected.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Physical causes: loose cable, failing NIC, STP loops, heat, or EMI.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use Diagnostics panel to check logs, counters, environment, and cables.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Flag appears after fixing the root cause.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        loose_cable: [{ id:'hint1',text:'47 link flap events in the log. Flaps correlate with physical movement near the desk.',cost:0,penalty:0},{id:'hint2',text:'The RJ-45 clip is broken. The cable unseats when bumped.',cost:10,penalty:-10},{id:'hint3',text:'Replace the patch cable via Diagnostics.',cost:25,penalty:-25},{id:'hint4',text:'Flag in diagnostics after cable replacement.',cost:50,penalty:-50}],
        failing_nic: [{ id:'hint1',text:'23 NIC reset events in Device Manager. Driver is from 2023.',cost:0,penalty:0},{id:'hint2',text:'NIC firmware is crashing and auto-recovering. Driver update needed.',cost:10,penalty:-10},{id:'hint3',text:'Update driver via Diagnostics / Device Manager.',cost:25,penalty:-25},{id:'hint4',text:'Flag in Device Manager after update.',cost:50,penalty:-50}],
        stp_reconvergence: [{ id:'hint1',text:'Switch logs show STP topology changes on Gi0/18. Someone is creating loops.',cost:0,penalty:0},{id:'hint2',text:'Enable BPDU Guard on access ports to prevent loops from forming.',cost:10,penalty:-10},{id:'hint3',text:'Enable BPDU Guard via Diagnostics.',cost:25,penalty:-25},{id:'hint4',text:'Flag after enabling BPDU Guard.',cost:50,penalty:-50}],
        overheating_switch: [{ id:'hint1',text:'Environmental monitor shows 42C. Thermal shutdowns start at 45C. Closet AC is broken.',cost:0,penalty:0},{id:'hint2',text:'Set fans to max speed as temporary measure. Log maintenance request for AC repair.',cost:10,penalty:-10},{id:'hint3',text:'Set fan override via Diagnostics.',cost:25,penalty:-25},{id:'hint4',text:'Flag in environmental monitor.',cost:50,penalty:-50}],
        emi: [{ id:'hint1',text:'Error spikes at 9AM, 12PM, 5PM — exactly when elevator usage peaks. Cables run next to elevator motor.',cost:0,penalty:0},{id:'hint2',text:'EMI from the elevator motor. Replace UTP with STP (shielded) cable.',cost:10,penalty:-10},{id:'hint3',text:'Replace cable via Diagnostics.',cost:25,penalty:-25},{id:'hint4',text:'Flag in cable diagnostics after STP install.',cost:50,penalty:-50}]
    },

    _ensureScenario(engine){if(!engine.state._scenarioSelected)return false;if(engine.state._scenarioId!=null&&!NT011Config._flagRestored){NT011Config._flagRestored=true;const s=NT011Config._scenarios[engine.state._scenarioId];if(s)NT011Config.hints=NT011Config._scenarioHints[s.id]||NT011Config._defaultHints;}return true;},
    _applyScenario(engine,idx){engine.state._scenarioId=idx;engine.state._networkConfig=JSON.parse(JSON.stringify(NT011Config._scenarios[idx].brokenConfig));engine.state._scenarioSelected=true;const o=NT011Config._scenarios[idx].stateOverrides||{};for(const k in o)engine.state[k]=o[k];NT011Config._flagRestored=true;NT011Config.hints=NT011Config._scenarioHints[NT011Config._scenarios[idx].id]||NT011Config._defaultHints;engine.save();},
    _getScenario(engine){return engine.state._scenarioId==null?null:NT011Config._scenarios[engine.state._scenarioId];},
    _requireScenario(engine){return engine.state._scenarioSelected?null:'\nERROR: No active ticket.\nOpen Help Desk Ticket first.';},

    boot:{biosLines:['UEFI BIOS v2.20','Memory OK','Network: Intel I219-V','Loading Windows...'],grubEntries:['Windows 10 Pro'],loginUser:'Technician'},
    desktop:{icons:[
        {id:'cmd',label:'Command\nPrompt',icon:'>_',app:'terminal'},
        {id:'diag',label:'Diagnostics',icon:'DX',app:'diagnostics'},
        {id:'ticket',label:'Help Desk\nTicket',icon:'HD',app:'ticket'},
        {id:'notes',label:'Notepad',icon:'TXT',app:'notes'},
        {id:'hints',label:'Hints',icon:'?',app:'hints'},
        {id:'reset',label:'Reset\nLab',icon:'RST',app:'reset_lab'}
    ]},
    terminal:{user:'Technician',hostname:'WORKSTATION11',startDir:'C:\\Users\\Technician',promptStyle:'windows',welcome:'Microsoft Windows [Version 10.0.19045]\n(c) Microsoft Corporation.\n'},
    filesystem:{'/': {type:'dir',children:{}}},
    flags:[{id:'fixed',value:null,points:500}],
    scoring:{base:0,maxScore:600,hintPenalty:true,wrongFlagPenalty:0,speedBonus:{threshold:600000,points:100},timeBonusThreshold:1800},
    hints:[{id:'hint1',text:'Analyze the pattern: when, duration, who.',cost:0,penalty:0},{id:'hint2',text:'Physical: cable, NIC, STP, heat, EMI.',cost:10,penalty:-10},{id:'hint3',text:'Use Diagnostics panel.',cost:25,penalty:-25},{id:'hint4',text:'Flag after root cause fix.',cost:50,penalty:-50}],
    lore:{intro:'Users report intermittent network problems. These are the hardest to troubleshoot because the issue comes and goes. Use systematic analysis to find the pattern.',scenario:'An intermittent physical or environmental issue is causing periodic network failures.',outro:'Root cause identified and resolved. Network stability restored.'},
    phases:[{id:'investigate',name:'Investigation',requiredFlags:[],unlocks:['diagnose'],locked:false,description:'Gather data and patterns.'},{id:'diagnose',name:'Diagnosis',requiredFlags:[],unlocks:['repair'],locked:true,description:'Identify root cause.'},{id:'repair',name:'Repair',requiredFlags:[],unlocks:['verify'],locked:true,description:'Fix the issue.'},{id:'verify',name:'Verification',requiredFlags:['fixed'],unlocks:[],locked:true,description:'Verify stability and flag.'}],

    commands:{
        ipconfig:function(args,term,engine){
            const gate=NT011Config._requireScenario(engine);if(gate)return gate;
            const net=engine.state._networkConfig;const joined=args.join(' ').toLowerCase();
            if(joined.includes('/all'))return'\nWindows IP Configuration\n\nEthernet adapter Ethernet0:\n\n   IPv4 Address. . . : '+net.ip+'\n   Subnet Mask . . . : '+net.subnet+'\n   Default Gateway . : '+net.gateway+'\n   DNS Servers . . . : '+(net.dns1||'');
            if(joined.includes('/?'))return'\nUSAGE: ipconfig [/all]';
            return'\nEthernet adapter Ethernet0:\n   IPv4 Address. . . : '+net.ip+'\n   Gateway . . . . . : '+net.gateway;
        },

        ping:function(args,term,engine){
            const gate=NT011Config._requireScenario(engine);if(gate)return gate;
            if(!args.length)return'\nUsage: ping target';
            const target=args.filter(a=>!a.startsWith('-'))[0];if(!target)return'Bad parameter.';
            // Simulate intermittent losses
            let output='\nPinging '+target+' with 32 bytes of data:\n';
            let rx=0;const issueActive=engine.state._looseCable||engine.state._failingNIC||engine.state._stpReconvergence||engine.state._overheating||engine.state._emi;
            for(let i=0;i<4;i++){
                if(issueActive&&Math.random()>0.6){output+='Request timed out.\n';}
                else{output+='Reply from '+target+': bytes=32 time='+(Math.floor(Math.random()*20)+5)+'ms TTL=117\n';rx++;}
            }
            output+='\nPing statistics for '+target+':\n    Packets: Sent = 4, Received = '+rx+', Lost = '+(4-rx)+' ('+Math.round(((4-rx)/4)*100)+'% loss),\n';
            if(issueActive&&rx<4)output+='\n  [WARNING: Intermittent packet loss detected]';
            return output;
        },

        netstat:function(args,term,engine){const gate=NT011Config._requireScenario(engine);if(gate)return gate;return'\nActive Connections\n\n  Proto  Local Address          Foreign Address        State\n  TCP    192.168.1.90:49152     52.113.194.132:443     ESTABLISHED\n  TCP    127.0.0.1:49155        127.0.0.1:49156        ESTABLISHED';},

        hostname:function(){return'WORKSTATION11';},
        cls:function(args,term){term.outputEl.innerHTML='';return null;},
        whoami:function(){return'WORKSTATION11\\Technician';},
        ifconfig:function(){return'\'ifconfig\' is not recognized.\nDid you mean: ipconfig';},
        grep:function(){return'\'grep\' is not recognized.';},
        sudo:function(){return'\'sudo\' is not recognized.';}
    },

    onAppLaunch(iconDef,engine){
        if(iconDef.app==='diagnostics'&&!engine.state._scenarioSelected){engine.notify('Open ticket first.','error');return;}
        switch(iconDef.app){case'ticket':NT011Config._openTicket(iconDef,engine);break;case'diagnostics':NT011Config._openDiagnostics(iconDef,engine);break;case'reset_lab':NT011Config._confirmReset(engine);break;}
    },

    _openTicket(iconDef,engine){if(engine._windows[iconDef.id]){engine._focusWindow(iconDef.id);return;} const c=document.createElement('div');c.id='ticketContainer';c.style.cssText='padding:20px;overflow-y:auto;height:100%;background:#1a1a2e;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;';engine.openWindow(iconDef.id,'Help Desk Ticket','HD',c);NT011Config._ensureScenario(engine);if(engine.state._scenarioSelected)NT011Config._renderTicket(engine,c);else NT011Config._renderPicker(engine,c);},

    _renderPicker(engine,c){
        const p=['Emma R. — "Network drops when I move my chair"','Jake P. — "Network dies for 30-60 seconds randomly"','Floor 3 — "Entire floor loses network periodically"','All Users — "Network bad in afternoon, fine in morning"','Cube Farm — "Errors spike at 9AM, 12PM, 5PM"'];
        let html='<div style="text-align:center;margin-bottom:20px;"><div style="color:#a855f7;font-weight:bold;font-size:1.1rem;">HELP DESK QUEUE</div></div><div>';
        NT011Config._scenarios.forEach(function(s,i){html+='<button class="nt011-btn" data-idx="'+i+'" style="display:block;width:100%;text-align:left;padding:12px;margin-bottom:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:4px;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;cursor:pointer;"><span style="color:#a855f7;font-weight:bold;">HD-'+(9000+i)+'</span><div style="color:#aaa;font-size:0.7rem;margin-top:4px;">'+p[i]+'</div></button>';});
        html+='</div><div style="text-align:center;border-top:1px solid rgba(255,255,255,0.1);padding-top:16px;"><button id="nt011Rand" style="padding:10px 28px;background:#a855f7;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-family:Consolas,monospace;">Random</button></div>';
        c.innerHTML=html;
        c.querySelectorAll('.nt011-btn').forEach(function(b){b.addEventListener('click',function(){NT011Config._applyScenario(engine,parseInt(this.getAttribute('data-idx')));NT011Config._renderTicket(engine,c);});});
        document.getElementById('nt011Rand').addEventListener('click',function(){NT011Config._applyScenario(engine,Math.floor(Math.random()*NT011Config._scenarios.length));NT011Config._renderTicket(engine,c);});
    },

    _renderTicket(engine,c){const s=NT011Config._getScenario(engine);const n=['Emma R.','Jake P.','Floor 3 Manager','All Dept Leads','Cube Farm Users'];c.innerHTML='<div style="border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px;margin-bottom:16px;"><span style="color:#a855f7;font-weight:bold;">TICKET #HD-'+(9000+engine.state._scenarioId)+'</span></div><div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">BY</div><div>'+n[engine.state._scenarioId]+'</div></div><div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">'+NT011Config._escHtml(s.ticketSubject)+'</div></div><div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04);padding:12px;border-radius:4px;line-height:1.6;">'+NT011Config._escHtml(s.ticketDetail)+'</div></div>'+(s.ticketExtra?'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">NOTES</div><div style="background:rgba(255,165,0,0.08);border:1px solid rgba(255,165,0,0.2);padding:12px;border-radius:4px;color:#ffcc80;">'+NT011Config._escHtml(s.ticketExtra)+'</div></div>':'')+'<div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:12px;"><div style="color:#2ecc71;font-weight:bold;">ASSIGNED TO: YOU</div></div>';},

    _openDiagnostics(iconDef,engine){if(engine._windows[iconDef.id]){engine._focusWindow(iconDef.id);NT011Config._renderDiag(engine);return;} const c=document.createElement('div');c.id='diagContainer';c.style.cssText='padding:20px;overflow-y:auto;height:100%;background:#1a1a2e;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;';engine.openWindow(iconDef.id,'Diagnostics','DX',c);NT011Config._renderDiag(engine);},

    async _renderDiag(engine){
        const c=document.getElementById('diagContainer');if(!c)return;
        const s=NT011Config._getScenario(engine);

        const diags={
            loose_cable:{label:'Physical: Loose Cable ('+engine.state._linkFlaps+' link flaps, broken RJ-45 clip)',broken:engine.state._looseCable,btn:'Replace Patch Cable',key:'_looseCable',detail:'Link Flap Count: '+engine.state._linkFlaps+'\nCorrelation: Movement near desk\nCable Clip: Broken\nWall Jack: Secure'},
            failing_nic:{label:'Hardware: Failing NIC ('+engine.state._nicResets+' resets, driver from '+engine.state._driverDate+')',broken:engine.state._failingNIC,btn:'Update NIC Driver',key:'_failingNIC',detail:'NIC Reset Count: '+engine.state._nicResets+'\nDriver Date: '+engine.state._driverDate+'\nFirmware: v1.2.3 (outdated)\nLatest: v2.1.0'},
            stp_reconvergence:{label:'STP: Loop detected on '+engine.state._loopPort+' (last outage: '+engine.state._lastOutage+')',broken:engine.state._stpReconvergence,btn:'Enable BPDU Guard on Access Ports',key:'_stpReconvergence',detail:'Topology Changes: 47 (past 7 days)\nLoop Source: '+engine.state._loopPort+'\nLast Event: '+engine.state._lastOutage+'\nBPDU Guard: DISABLED'},
            overheating_switch:{label:'Thermal: Switch at '+engine.state._currentTemp+'C (threshold: '+engine.state._thresholdTemp+'C, AC unit: FAILED)',broken:engine.state._overheating,btn:'Set Fan Override to Maximum',key:'_overheating',detail:'Current Temp: '+engine.state._currentTemp+'C\nThreshold: '+engine.state._thresholdTemp+'C\nFan Speed: '+engine.state._fanSpeed+'\nAC Unit: OFFLINE since 7 days'},
            emi:{label:'EMI: Error spikes correlate with elevator motor ('+engine.state._errorPattern+')',broken:engine.state._emi,btn:'Replace UTP with Shielded (STP) Cable',key:'_emi',detail:'Error Pattern: '+engine.state._errorPattern+'\nCorrelation: 99.7% with elevator start/stop\nCable Type: '+engine.state._cableType+'\nProximity: 0.5m from elevator motor'}
        };

        let html='<div style="font-size:1rem;font-weight:bold;color:#a855f7;margin-bottom:16px;">Network Diagnostics Panel</div>';

        if(s&&diags[s.id]){
            const d=diags[s.id];
            html+='<div style="border:1px solid '+(d.broken?'rgba(231,76,60,0.3)':'rgba(46,204,113,0.3)')+';border-radius:4px;padding:12px;margin-bottom:16px;background:'+(d.broken?'rgba(231,76,60,0.05)':'rgba(46,204,113,0.05)')+'">'
                +'<div style="font-weight:bold;margin-bottom:8px;color:'+(d.broken?'#e74c3c':'#2ecc71')+';">'+d.label+'</div>'
                +'<pre style="font-size:0.7rem;color:#aaa;margin-bottom:12px;white-space:pre-wrap;">'+d.detail+'</pre>'
                +'<div style="font-size:0.75rem;margin-bottom:8px;">Status: <span style="color:'+(d.broken?'#e74c3c;font-weight:bold;">ISSUE DETECTED':'#2ecc71;font-weight:bold;">RESOLVED')+'</span></div>'
                +(d.broken?'<button id="diagFix" style="padding:6px 20px;background:#a855f7;color:#fff;border:none;border-radius:3px;cursor:pointer;font-weight:bold;font-size:0.75rem;">'+d.btn+'</button>':'')
                +'</div>';
        }

        // Event log summary
        html+='<div style="border:1px solid rgba(255,255,255,0.1);border-radius:4px;padding:12px;margin-bottom:16px;">'
            +'<div style="font-weight:bold;margin-bottom:8px;">Event Log Summary (Last 24h)</div>'
            +'<div style="font-size:0.7rem;color:#888;">';
        if(engine.state._looseCable) html+='[WARN] 47 link flap events on Ethernet0<br>[WARN] Interface up/down cycling detected<br>';
        else if(engine.state._failingNIC) html+='[ERROR] 23 NIC hardware reset events<br>[WARN] Driver fault recovery triggered<br>';
        else if(engine.state._stpReconvergence) html+='[CRIT] 12 STP topology change events<br>[WARN] BPDU received on access port Gi0/18<br>';
        else if(engine.state._overheating) html+='[CRIT] Temperature warning: 42C<br>[WARN] Thermal throttling may occur above 45C<br>';
        else if(engine.state._emi) html+='[WARN] CRC error spikes at 09:00, 12:00, 17:00<br>[INFO] Error pattern correlates with environmental factor<br>';
        else html+='[INFO] No issues detected. Network stable.<br>';
        html+='</div></div>';

        if(engine.state._flagRevealed&&s){
            const fv=await engine.requestFlagText(s.id);
            html+='<div style="background:rgba(46,204,113,0.1);border:1px solid rgba(46,204,113,0.3);border-radius:4px;padding:12px;margin-top:16px;"><div style="color:#2ecc71;font-weight:bold;">Root Cause Resolved:</div><div style="color:#c8e6c9;">Recovery token: '+fv+'</div></div>';
        }

        c.innerHTML=html;
        const btn=document.getElementById('diagFix');
        if(btn&&s&&diags[s.id]){
            const key=diags[s.id].key;
            btn.addEventListener('click',function(){engine.state[key]=false;if(!engine.state._labComplete){engine.state._labComplete=true;engine.state._flagRevealed=true;}engine.save();engine.notify('Root cause resolved. Network should stabilize.','success');NT011Config._renderDiag(engine);});
        }
    },

    _confirmReset(engine){const o=document.createElement('div');o.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;';o.innerHTML='<div style="background:#1a1a2e;border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:24px;text-align:center;font-family:Consolas,monospace;color:#c8e6c9;"><div style="color:#e74c3c;font-weight:bold;margin-bottom:12px;">Reset?</div><div style="display:flex;gap:12px;justify-content:center;"><button id="nt011Y" style="padding:8px 24px;background:#e74c3c;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;">Reset</button><button id="nt011N" style="padding:8px 24px;background:rgba(255,255,255,0.1);color:#ccc;border:1px solid rgba(255,255,255,0.2);border-radius:4px;cursor:pointer;">Cancel</button></div></div>';document.getElementById('arena').appendChild(o);document.getElementById('nt011Y').addEventListener('click',function(){NT011Config._flagRestored=false;NT011Config.hints=NT011Config._defaultHints;engine.reset();});document.getElementById('nt011N').addEventListener('click',function(){o.remove();});o.addEventListener('click',function(e){if(e.target===o)o.remove();});},

    _escHtml(str){const d=document.createElement('div');d.textContent=str;return d.innerHTML;}
};
